/// <reference path="./supabase-deps.d.ts" />
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const MODEL = "llama-3.3-70b-versatile";
const GROQ_API = "https://api.groq.com/openai/v1/chat/completions";

const getSupabase = () => createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

// ── Emergency detection — bypasses Groq entirely for instant response ──────────
const EMERGENCY_PATTERNS = [
  'chest pain', 'chest pressure', 'heart attack',
  "can't breathe", "cannot breathe", 'difficulty breathing', 'shortness of breath',
  'severe bleeding', 'heavy bleeding', "won't stop bleeding",
  'unconscious', 'passed out', 'not responding', 'unresponsive',
  'face drooping', 'arm weakness', 'slurred speech',
  'seizure', 'convulsion',
  'overdose', 'poisoning',
  'suicidal', 'want to end my life', 'self-harm', 'kill myself',
  'anaphylaxis', 'throat swelling', 'severe allergic reaction',
  'stroke',
];

const EMERGENCY_RESPONSE = `⚠️ This sounds like a medical emergency. Please call emergency services **right now**:

🚨 **Emergency: 911** | Rescue: 1122 | Edhi: 115
🏥 Go to the nearest emergency room **immediately**. Do not wait.

Your safety comes first. Once you're safe, I'm here if you need anything else.`;

function detectEmergency(text: string): boolean {
  const lower = text.toLowerCase();
  return EMERGENCY_PATTERNS.some(p => lower.includes(p));
}

// ── Tool functions ─────────────────────────────────────────────────────────────

async function get_doctors_info({ specialization, name }: { specialization?: string; name?: string } = {}) {
  const supabase = getSupabase();
  // Select only guaranteed core columns to avoid "column does not exist" errors
  let query = supabase.from('doctors').select('*').limit(8);
  if (specialization) query = query.ilike('specialization', `%${specialization}%`);
  if (name) query = query.ilike('name', `%${name}%`);
  const { data, error } = await query;
  if (error) return JSON.stringify({ error: error.message });
  // Strip heavy/irrelevant fields before sending to AI (encoding, avatar, etc.)
  const clean = (data || []).map(({ encoding, avatar_url, created_at, updated_at, ...rest }: any) => rest);
  return JSON.stringify(clean);
}

async function get_treatments_info({ treatmentName, specialization }: { treatmentName?: string; specialization?: string } = {}) {
  const supabase = getSupabase();
  let query = supabase.from('treatments').select('*');
  if (treatmentName) query = query.ilike('name', `%${treatmentName}%`);
  if (specialization) query = query.ilike('specialization', `%${specialization}%`);
  const { data, error } = await query;
  if (error) return JSON.stringify({ error: error.message });
  return JSON.stringify(data);
}

async function get_available_slots({ doctor_id, date }: { doctor_id: string; date: string }) {
  const supabase = getSupabase();
  const { data: doctor, error } = await supabase.from('doctors').select('availability_schedule').eq('id', doctor_id).single();
  if (error || !doctor) return JSON.stringify({ error: "Doctor not found" });

  const dayOfWeek = new Date(date).toLocaleString('en-us', { weekday: 'long' }).toLowerCase();
  const schedule = doctor.availability_schedule?.[dayOfWeek];
  if (!schedule || schedule === "Closed") return JSON.stringify({ available_slots: [], message: "Doctor not available on this day." });

  const parseTime = (t: string) => {
    const [time, ampm] = t.trim().split(' ');
    let [hours, minutes] = time.split(':').map(Number);
    if (ampm === 'PM' && hours !== 12) hours += 12;
    if (ampm === 'AM' && hours === 12) hours = 0;
    return hours * 60 + (minutes || 0);
  };

  const [startStr, endStr] = schedule.split(' - ');
  const startMins = parseTime(startStr);
  const endMins = parseTime(endStr);
  const slots: string[] = [];
  for (let m = startMins; m < endMins; m += 60) {
    const h = Math.floor(m / 60), min = m % 60;
    const period = h >= 12 ? 'PM' : 'AM';
    const h12 = h > 12 ? h - 12 : h === 0 ? 12 : h;
    slots.push(`${String(h12).padStart(2, '0')}:${String(min).padStart(2, '0')} ${period}`);
  }

  const { data: bookings } = await supabase.from('bookings').select('appointment_time').eq('doctor_id', doctor_id).eq('appointment_date', date);
  const booked = new Set(bookings?.map((b: any) => b.appointment_time));
  return JSON.stringify({ available_slots: slots.filter(s => !booked.has(s)) });
}

async function book_appointment({ doctor_id, appointment_date, appointment_time, full_name, email, phone, gender, age, reason_for_visit }: {
  doctor_id: string; appointment_date: string; appointment_time: string;
  full_name: string; email: string; phone: string; gender: string; age: number; reason_for_visit: string;
}) {
  const supabase = getSupabase();
  const slotsRes = JSON.parse(await get_available_slots({ doctor_id, date: appointment_date }));
  if (!slotsRes.available_slots?.includes(appointment_time)) {
    return JSON.stringify({ success: false, message: "That time slot is no longer available. Please choose another." });
  }
  const { data, error } = await supabase.from('bookings')
    .insert({ doctor_id, appointment_date, appointment_time, full_name, email, phone, gender, age, reason_for_visit })
    .select();
  if (error) return JSON.stringify({ success: false, message: error.message });
  return JSON.stringify({ success: true, message: "Appointment booked successfully! ✅", booking_id: data?.[0]?.id });
}

async function lookup_booking({ email, full_name }: { email?: string; full_name?: string }) {
  const supabase = getSupabase();
  if (!email && !full_name) return JSON.stringify({ error: "Please provide an email or full name to look up the booking." });

  let query = supabase.from('bookings')
    .select('id, doctor_id, appointment_date, appointment_time, full_name, email, reason_for_visit')
    .order('appointment_date', { ascending: false })
    .limit(5);
  if (email) query = query.ilike('email', email);
  else if (full_name) query = query.ilike('full_name', `%${full_name}%`);

  const { data, error } = await query;
  if (error) return JSON.stringify({ error: error.message });
  if (!data || data.length === 0) return JSON.stringify({ error: "No bookings found for that email or name." });

  const doctorIds = [...new Set(data.map((b: any) => b.doctor_id))];
  const { data: doctors } = await supabase.from('doctors').select('id, name').in('id', doctorIds);
  const doctorMap: Record<string, string> = {};
  doctors?.forEach((d: any) => { doctorMap[d.id] = d.name; });

  return JSON.stringify(data.map((b: any) => ({ ...b, doctor_name: doctorMap[b.doctor_id] || 'Unknown Doctor' })));
}

async function cancel_booking({ booking_id }: { booking_id: string }) {
  const supabase = getSupabase();
  const { error } = await supabase.from('bookings').delete().eq('id', booking_id);
  if (error) return JSON.stringify({ success: false, message: error.message });
  return JSON.stringify({ success: true, message: "Your appointment has been cancelled successfully." });
}

async function reschedule_booking({ booking_id, new_date, new_time }: { booking_id: string; new_date: string; new_time: string }) {
  const supabase = getSupabase();
  const { data: booking } = await supabase.from('bookings').select('doctor_id').eq('id', booking_id).single();
  if (!booking) return JSON.stringify({ success: false, message: "Booking not found." });

  const slotsRes = JSON.parse(await get_available_slots({ doctor_id: booking.doctor_id, date: new_date }));
  if (!slotsRes.available_slots?.includes(new_time)) {
    return JSON.stringify({ success: false, message: "That slot is not available. Please choose a different time." });
  }

  const { error } = await supabase.from('bookings')
    .update({ appointment_date: new_date, appointment_time: new_time })
    .eq('id', booking_id);
  if (error) return JSON.stringify({ success: false, message: error.message });
  return JSON.stringify({ success: true, message: `Appointment rescheduled to ${new_date} at ${new_time}. ✅` });
}

async function check_doctor_attendance({ doctor_name }: { doctor_name: string }) {
  const supabase = getSupabase();
  const today = new Date().toISOString().split('T')[0];

  const { data: doctors } = await supabase.from('doctors').select('id, name').ilike('name', `%${doctor_name}%`).limit(1);
  if (!doctors || doctors.length === 0) return JSON.stringify({ error: "Doctor not found." });

  const doctor = doctors[0];
  const { data: attendance } = await supabase
    .from('doctor_attendance')
    .select('event_type, confidence_score, created_at')
    .eq('doctor_id', doctor.id)
    .gte('created_at', `${today}T00:00:00`)
    .order('created_at', { ascending: false })
    .limit(1);

  if (!attendance || attendance.length === 0) {
    return JSON.stringify({ doctor_name: doctor.name, present: false, message: `${doctor.name} has not checked in today.` });
  }

  const latest = attendance[0];
  const present = latest.event_type === 'Check-in' && (latest.confidence_score ?? 0) >= 0.7;
  return JSON.stringify({
    doctor_name: doctor.name,
    present,
    message: present
      ? `${doctor.name} has checked in and is available today.`
      : `${doctor.name} is not currently in the clinic.`,
  });
}

async function request_callback({ patient_name, phone, reason }: { patient_name: string; phone: string; reason?: string }) {
  const supabase = getSupabase();
  const { error } = await supabase.from('callback_requests').insert({
    patient_name,
    phone,
    reason: reason || 'Patient requested human assistance via chatbot',
  });
  if (error) return JSON.stringify({ success: false, message: error.message });
  return JSON.stringify({ success: true, message: "Callback request received! Our team will call you shortly." });
}

async function submit_inquiry({ name, email, message }: { name: string; email: string; message: string }) {
  const supabase = getSupabase();
  const { error } = await supabase.from('patient_inquiries').insert({ name, email, message });
  if (error) return JSON.stringify({ success: false, message: error.message });
  return JSON.stringify({ success: true, message: "Inquiry submitted! Our team will respond within 24 hours." });
}

const toolFunctions: Record<string, (args: any) => Promise<string>> = {
  get_doctors_info,
  get_treatments_info,
  get_available_slots,
  book_appointment,
  lookup_booking,
  cancel_booking,
  reschedule_booking,
  check_doctor_attendance,
  request_callback,
  submit_inquiry,
};

// ── Tool schemas (OpenAI/Groq format) ─────────────────────────────────────────
const tools = [
  {
    type: "function",
    function: {
      name: "get_doctors_info",
      description: "Search doctors by specialization or name. Use whenever the user asks about doctors, specialists, or wants a recommendation for a symptom.",
      parameters: {
        type: "object",
        properties: {
          specialization: { type: "string", description: "e.g. General Practice, Cardiology, Neurology, Pediatrics" },
          name: { type: "string", description: "Doctor's name" },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_treatments_info",
      description: "Get info about treatments and procedures offered at DocConnect.",
      parameters: {
        type: "object",
        properties: {
          treatmentName: { type: "string" },
          specialization: { type: "string" },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_available_slots",
      description: "Get available appointment time slots for a doctor on a specific date.",
      parameters: {
        type: "object",
        properties: {
          doctor_id: { type: "string", description: "Doctor's ID from get_doctors_info" },
          date: { type: "string", description: "YYYY-MM-DD" },
        },
        required: ["doctor_id", "date"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "book_appointment",
      description: "Book an appointment. Call ONLY after collecting all required patient details AND receiving explicit patient confirmation.",
      parameters: {
        type: "object",
        properties: {
          doctor_id: { type: "string" },
          appointment_date: { type: "string", description: "YYYY-MM-DD" },
          appointment_time: { type: "string", description: "hh:mm AM/PM format exactly as returned by get_available_slots" },
          full_name: { type: "string" },
          email: { type: "string" },
          phone: { type: "string" },
          gender: { type: "string", enum: ["male", "female", "other"] },
          age: { type: "number" },
          reason_for_visit: { type: "string" },
        },
        required: ["doctor_id", "appointment_date", "appointment_time", "full_name", "email", "phone", "gender", "age", "reason_for_visit"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "lookup_booking",
      description: "Look up a patient's existing booking by email or full name. Use for reschedule or cancellation requests.",
      parameters: {
        type: "object",
        properties: {
          email: { type: "string" },
          full_name: { type: "string" },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "cancel_booking",
      description: "Cancel an existing appointment. Call ONLY after patient explicitly confirms cancellation.",
      parameters: {
        type: "object",
        properties: {
          booking_id: { type: "string" },
        },
        required: ["booking_id"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "reschedule_booking",
      description: "Reschedule an existing appointment to a new date and time.",
      parameters: {
        type: "object",
        properties: {
          booking_id: { type: "string" },
          new_date: { type: "string", description: "YYYY-MM-DD" },
          new_time: { type: "string", description: "hh:mm AM/PM" },
        },
        required: ["booking_id", "new_date", "new_time"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "check_doctor_attendance",
      description: "Check if a specific doctor is currently in the clinic today using facial recognition attendance data.",
      parameters: {
        type: "object",
        properties: {
          doctor_name: { type: "string" },
        },
        required: ["doctor_name"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "request_callback",
      description: "Submit a callback request when the patient wants to speak to a human. Call after collecting their name and phone number.",
      parameters: {
        type: "object",
        properties: {
          patient_name: { type: "string" },
          phone: { type: "string" },
          reason: { type: "string" },
        },
        required: ["patient_name", "phone"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "submit_inquiry",
      description: "Submit a general inquiry to the hospital team.",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string" },
          email: { type: "string" },
          message: { type: "string" },
        },
        required: ["name", "email", "message"],
      },
    },
  },
];

// ── System prompt ──────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = (today: string, isFirstMessage: boolean) => `You are DocConnect AI, the official virtual assistant for DocConnect Hospital. Today is ${today}.

## IDENTITY & VOICE
Warm, professional, reassuring — like the best receptionist the patient has ever met. Short sentences. No medical jargon unless the patient uses it first. Always end every response with a clear next step. Once the patient shares their name, use it in all future messages.

## YOUR SCOPE
You ONLY assist with:
- Booking, rescheduling, and cancelling appointments
- Doctor information and real-time attendance (who's in today)
- Treatments and procedures at DocConnect
- Hospital information (hours, location, contact, policies)
- General medical guidance (symptoms → suggest specialist, NEVER diagnose)
- Human handoff and callback requests

**If asked about anything unrelated** (coding, sports, weather, news, politics, entertainment, general knowledge): respond ONLY with:
"I'm DocConnect AI and I can only help with hospital and healthcare topics. Can I help you find a doctor, book an appointment, or answer a question? 😊"

## 🚨 EMERGENCY — HIGHEST PRIORITY (overrides everything)
If the patient mentions chest pain, heart attack, stroke, difficulty breathing, severe bleeding, unconscious, seizure, overdose, suicidal thoughts, anaphylaxis — respond IMMEDIATELY with ONLY:

"⚠️ This sounds like a medical emergency. Please call emergency services **right now**:
🚨 **Emergency: 911** | Rescue: 1122 | Edhi: 115
🏥 Go to the nearest emergency room immediately. Do not wait.

Your safety comes first. Once you're safe, I'm here if you need anything else."

Stop ALL other flows. Do NOT suggest booking. Do NOT ask questions.

## HOSPITAL INFO
- Name: DocConnect Hospital
- Clinic hours: Mon–Fri 9:00 AM – 6:00 PM | Sat 9:00 AM – 1:00 PM | Emergency: 24/7
- Address: 123 Hospital Road, Health City, HC 12345
- Phone: +1 (555) 123-4567
- Email: info@docconnect.com
- Languages: English, Urdu, Arabic
- Walk-ins: Accepted, but appointments are prioritized (shorter wait)
- Parking: Free in the building basement
- Telemedicine: Yes, video consultations are available

## APPOINTMENT BOOKING FLOW (follow exactly)
1. Ask: "What would you like to see a doctor about?" — always acknowledge with empathy
2. Call get_doctors_info matching the symptom to a specialization
3. Show doctors (name + specialty) — ask which they prefer or "whoever's available soonest"
4. Ask preferred date (understand: "tomorrow", "next Monday", "this Friday", "ASAP")
5. Call get_available_slots → list available times
6. Collect patient info ONE FIELD AT A TIME: Full Name → Email → Phone → Gender (offer Male/Female/Other) → Age
7. Show booking summary with all details, ask "Shall I confirm this appointment?"
8. Call book_appointment ONLY after explicit confirmation ("yes", "confirm", "go ahead")
9. After success: congratulate + remind to bring ID, medical records, and insurance card

## RESCHEDULE FLOW
1. Ask: "What's the email or name you booked with?"
2. Call lookup_booking → show their appointment clearly
3. Ask preferred new date and time
4. Call get_available_slots for the new date → show options
5. Confirm the chosen slot → call reschedule_booking

## CANCELLATION FLOW
1. Ask for email or name used to book
2. Call lookup_booking → show the appointment
3. Ask "Are you sure you want to cancel this appointment?" — wait for explicit yes
4. Call cancel_booking
5. Offer to rebook: "Would you like to reschedule for another time?"

## DOCTOR AVAILABILITY CHECK
To check if a specific doctor is in the clinic today, call check_doctor_attendance. Only confirm presence if present: true.

## HUMAN HANDOFF
If the patient says "talk to a human", "real person", "speak to someone", or if they seem frustrated, respond:
"I want to make sure you get the right help! You can reach us directly:
📞 Call: +1 (555) 123-4567
Or share your **name and phone number** and I'll have someone call you back."
After they provide name and phone, call request_callback.

## MEDICAL GUIDANCE
- Acknowledge emotion first: "I understand that can be worrying."
- Give general guidance (e.g., "headaches with fever can indicate infection — a GP can help identify the cause")
- NEVER diagnose. NEVER recommend medications or dosages. NEVER interpret lab results or scans.
- Always suggest the right specialist and offer to find/book one

## COMMON FAQ ANSWERS
- Walk-ins: "We accept walk-ins, but appointments are prioritized — booking ahead minimizes your wait."
- Online consultations: "Yes, we offer video consultations. Would you like to book one?"
- Referrals: "For general consultations, no referral needed. Some specialists may require one."
- First visit: "Please bring a valid ID, any previous medical records, and your insurance card."

## TONE RULES
- Under 3 sentences for simple queries
- Use **bold** for doctor names, dates, times, and key information
- Use bullet points for lists of options or steps
- Use patient's first name once they share it
- Always end with a next step — never leave the patient hanging

## NEVER DO
- Diagnose any medical condition
- Recommend specific medications or dosages
- Interpret lab results, X-rays, or scans
- Make treatment outcome claims
- Share one patient's data with another
- Continue booking flow when emergency language is detected
- Be defensive or argue with a patient
${isFirstMessage ? `
## FIRST MESSAGE INSTRUCTION
At the very end of this response, after your main content, add on a new line:
"_Note: I'm an AI assistant, not a medical professional. For medical advice, please consult one of our doctors._"
` : ''}`;

// ── Main handler ───────────────────────────────────────────────────────────────
serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const { messages: userMessages, sessionId } = await req.json();
    const GROQ_API_KEY = Deno.env.get('GROQ_API_KEY');
    if (!GROQ_API_KEY) throw new Error('GROQ_API_KEY secret not set in Supabase.');

    const supabase = getSupabase();
    const today = new Date().toISOString().split('T')[0];
    const currentUserMsg = userMessages[userMessages.length - 1].content;

    // Emergency check — instant response, no AI involved
    if (detectEmergency(currentUserMsg)) {
      await supabase.from('chatbot_messages').insert({
        session_id: sessionId,
        sender: 'bot',
        message_content: EMERGENCY_RESPONSE,
      });
      return new Response(JSON.stringify({ response: EMERGENCY_RESPONSE }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // Load last 20 messages for context
    const { data: chatHistory } = await supabase
      .from('chatbot_messages')
      .select('sender, message_content')
      .eq('session_id', sessionId)
      .order('timestamp', { ascending: true })
      .limit(20);

    const rawHistory = chatHistory?.map((msg: any) => ({
      role: msg.sender === 'user' ? 'user' : 'assistant',
      content: msg.message_content,
    })) || [];

    // Drop leading assistant messages (Groq requires user first)
    while (rawHistory.length > 0 && rawHistory[0].role === 'assistant') {
      rawHistory.shift();
    }

    // Remove duplicate of current message (frontend saves before calling)
    const last = rawHistory[rawHistory.length - 1];
    if (last?.role === 'user' && last?.content === currentUserMsg) {
      rawHistory.pop();
    }

    // Merge consecutive same-role messages (handles failed-request orphan messages)
    const mergedHistory: { role: string; content: string }[] = [];
    for (const msg of rawHistory) {
      const prev = mergedHistory[mergedHistory.length - 1];
      if (prev && prev.role === msg.role) {
        prev.content += '\n' + msg.content;
      } else {
        mergedHistory.push({ ...msg });
      }
    }

    const isFirstMessage = mergedHistory.length === 0;
    const systemMessage = { role: 'system', content: SYSTEM_PROMPT(today, isFirstMessage) };
    const conversation = [
      ...mergedHistory,
      { role: 'user', content: currentUserMsg },
    ];

    const callGroq = async (msgs: object[]) => {
      const res = await fetch(GROQ_API, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: MODEL,
          messages: [systemMessage, ...msgs],
          tools,
          tool_choice: "auto",
          max_tokens: 1024,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(`Groq API error: ${JSON.stringify(err)}`);
      }
      return await res.json();
    };

    console.log('Calling Groq, conversation length:', conversation.length);
    let response = await callGroq(conversation);

    if (!response.choices?.[0]) {
      throw new Error(`Groq returned no choices: ${JSON.stringify(response)}`);
    }
    let responseMessage = response.choices[0].message;
    console.log('Groq finish_reason:', response.choices[0].finish_reason);

    // Handle tool call (OpenAI-compatible format)
    if (responseMessage.tool_calls?.length > 0) {
      const toolCall = responseMessage.tool_calls[0];
      console.log('Tool call:', toolCall.function.name, toolCall.function.arguments);
      const fn = toolFunctions[toolCall.function.name];
      const args = JSON.parse(toolCall.function.arguments);
      const toolResult = fn ? await fn(args) : JSON.stringify({ error: "Unknown tool" });
      console.log('Tool result length:', toolResult.length);

      response = await callGroq([
        ...conversation,
        responseMessage,
        { role: "tool", tool_call_id: toolCall.id, content: toolResult },
      ]);

      if (!response.choices?.[0]) {
        throw new Error(`Groq returned no choices on 2nd call: ${JSON.stringify(response)}`);
      }
      responseMessage = response.choices[0].message;
    }

    const botText = responseMessage.content ?? "I'm sorry, I couldn't process that. Please try again.";

    await supabase.from('chatbot_messages').insert({
      session_id: sessionId,
      sender: 'bot',
      message_content: botText,
    });

    return new Response(JSON.stringify({ response: botText }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('chatbot-ai error:', error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
