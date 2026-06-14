/// <reference path="./supabase-deps.d.ts" />
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const MODEL = "claude-haiku-4-5-20251001";
const ANTHROPIC_API = "https://api.anthropic.com/v1/messages";

const getSupabase = () => createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

// ── Emergency detection — bypasses Claude entirely for instant response ─────────
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
  let query = supabase.from('doctors').select('*').limit(8);
  if (specialization) query = query.ilike('specialization', `%${specialization}%`);
  if (name) query = query.ilike('name', `%${name}%`);
  const { data, error } = await query;
  if (error) return JSON.stringify({ error: error.message });
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
  if (!email && !full_name) return JSON.stringify({ error: "Please provide an email or full name." });

  let query = supabase.from('bookings')
    .select('id, doctor_id, appointment_date, appointment_time, full_name, email, reason_for_visit')
    .order('appointment_date', { ascending: false })
    .limit(5);
  if (email) query = query.ilike('email', email);
  else if (full_name) query = query.ilike('full_name', `%${full_name}%`);

  const { data, error } = await query;
  if (error) return JSON.stringify({ error: error.message });
  if (!data || data.length === 0) return JSON.stringify({ error: "No bookings found." });

  const doctorIds = [...new Set(data.map((b: any) => b.doctor_id))];
  const { data: doctors } = await supabase.from('doctors').select('id, name').in('id', doctorIds);
  const doctorMap: Record<string, string> = {};
  doctors?.forEach((d: any) => { doctorMap[d.id] = d.name; });
  return JSON.stringify(data.map((b: any) => ({ ...b, doctor_name: doctorMap[b.doctor_id] || 'Unknown' })));
}

async function cancel_booking({ booking_id }: { booking_id: string }) {
  const supabase = getSupabase();
  const { error } = await supabase.from('bookings').delete().eq('id', booking_id);
  if (error) return JSON.stringify({ success: false, message: error.message });
  return JSON.stringify({ success: true, message: "Appointment cancelled successfully." });
}

async function reschedule_booking({ booking_id, new_date, new_time }: { booking_id: string; new_date: string; new_time: string }) {
  const supabase = getSupabase();
  const { data: booking } = await supabase.from('bookings').select('doctor_id').eq('id', booking_id).single();
  if (!booking) return JSON.stringify({ success: false, message: "Booking not found." });

  const slotsRes = JSON.parse(await get_available_slots({ doctor_id: booking.doctor_id, date: new_date }));
  if (!slotsRes.available_slots?.includes(new_time)) {
    return JSON.stringify({ success: false, message: "That slot is not available." });
  }
  const { error } = await supabase.from('bookings').update({ appointment_date: new_date, appointment_time: new_time }).eq('id', booking_id);
  if (error) return JSON.stringify({ success: false, message: error.message });
  return JSON.stringify({ success: true, message: `Rescheduled to ${new_date} at ${new_time}. ✅` });
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
    message: present ? `${doctor.name} is in the clinic today.` : `${doctor.name} is not currently in the clinic.`,
  });
}

async function request_callback({ patient_name, phone, reason }: { patient_name: string; phone: string; reason?: string }) {
  const supabase = getSupabase();
  const { error } = await supabase.from('callback_requests').insert({
    patient_name, phone,
    reason: reason || 'Patient requested human assistance',
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
  get_doctors_info, get_treatments_info, get_available_slots, book_appointment,
  lookup_booking, cancel_booking, reschedule_booking,
  check_doctor_attendance, request_callback, submit_inquiry,
};

// ── Tool schemas — Anthropic format (input_schema, no "type: function" wrapper) ─
const tools = [
  {
    name: "get_doctors_info",
    description: "Search doctors by specialization or name. Use whenever the user asks about doctors or wants a recommendation for a symptom.",
    input_schema: {
      type: "object",
      properties: {
        specialization: { type: "string", description: "e.g. General Practice, Cardiology, Neurology" },
        name: { type: "string", description: "Doctor's name" },
      },
    },
  },
  {
    name: "get_treatments_info",
    description: "Get info about treatments and procedures offered at DocConnect.",
    input_schema: {
      type: "object",
      properties: {
        treatmentName: { type: "string" },
        specialization: { type: "string" },
      },
    },
  },
  {
    name: "get_available_slots",
    description: "Get available appointment time slots for a doctor on a specific date.",
    input_schema: {
      type: "object",
      properties: {
        doctor_id: { type: "string", description: "Doctor's ID from get_doctors_info" },
        date: { type: "string", description: "YYYY-MM-DD" },
      },
      required: ["doctor_id", "date"],
    },
  },
  {
    name: "book_appointment",
    description: "Book an appointment. Call ONLY after collecting ALL patient details and receiving explicit confirmation.",
    input_schema: {
      type: "object",
      properties: {
        doctor_id: { type: "string" },
        appointment_date: { type: "string", description: "YYYY-MM-DD" },
        appointment_time: { type: "string", description: "hh:mm AM/PM" },
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
  {
    name: "lookup_booking",
    description: "Look up a patient's existing booking by email or full name.",
    input_schema: {
      type: "object",
      properties: {
        email: { type: "string" },
        full_name: { type: "string" },
      },
    },
  },
  {
    name: "cancel_booking",
    description: "Cancel an existing appointment. Call ONLY after patient explicitly confirms.",
    input_schema: {
      type: "object",
      properties: { booking_id: { type: "string" } },
      required: ["booking_id"],
    },
  },
  {
    name: "reschedule_booking",
    description: "Reschedule an existing appointment to a new date and time.",
    input_schema: {
      type: "object",
      properties: {
        booking_id: { type: "string" },
        new_date: { type: "string", description: "YYYY-MM-DD" },
        new_time: { type: "string", description: "hh:mm AM/PM" },
      },
      required: ["booking_id", "new_date", "new_time"],
    },
  },
  {
    name: "check_doctor_attendance",
    description: "Check if a specific doctor is in the clinic today using facial recognition attendance data.",
    input_schema: {
      type: "object",
      properties: { doctor_name: { type: "string" } },
      required: ["doctor_name"],
    },
  },
  {
    name: "request_callback",
    description: "Submit a callback request when the patient wants to speak to a human.",
    input_schema: {
      type: "object",
      properties: {
        patient_name: { type: "string" },
        phone: { type: "string" },
        reason: { type: "string" },
      },
      required: ["patient_name", "phone"],
    },
  },
  {
    name: "submit_inquiry",
    description: "Submit a general inquiry to the hospital team.",
    input_schema: {
      type: "object",
      properties: {
        name: { type: "string" },
        email: { type: "string" },
        message: { type: "string" },
      },
      required: ["name", "email", "message"],
    },
  },
];

// ── System prompt ──────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = (today: string, isFirstMessage: boolean) => `You are DocConnect AI, the official virtual assistant for DocConnect Hospital. Today is ${today}.

## IDENTITY & VOICE
Warm, professional, reassuring — like the best receptionist the patient has ever met. Short sentences. No jargon unless the patient uses it first. Always end every response with a clear next step. Once the patient shares their name, use it.

## YOUR SCOPE
You ONLY assist with: appointments, doctors, treatments, hospital info, general medical guidance, and human handoff.

If asked about anything unrelated (coding, sports, weather, news, politics, entertainment): respond ONLY with:
"I'm DocConnect AI and I can only help with hospital and healthcare topics. Can I help you find a doctor or book an appointment? 😊"

## 🚨 EMERGENCY — OVERRIDES EVERYTHING
If the patient mentions chest pain, heart attack, stroke, difficulty breathing, severe bleeding, unconscious, seizure, overdose, suicidal thoughts, anaphylaxis — respond IMMEDIATELY with ONLY:
"⚠️ This sounds like a medical emergency. Please call emergency services right now:
🚨 Emergency: 911 | Rescue: 1122 | Edhi: 115
🏥 Go to the nearest ER immediately. Do not wait."
Stop all other flows.

## HOSPITAL INFO
- Name: DocConnect Hospital | Hours: Mon–Fri 9AM–6PM | Sat 9AM–1PM | Emergency: 24/7
- Address: 123 Hospital Road, Health City | Phone: +1 (555) 123-4567
- Email: info@docconnect.com | Languages: English, Urdu, Arabic | Free parking: basement

## APPOINTMENT BOOKING FLOW
1. Ask what they want to see a doctor about — acknowledge with empathy
2. Call get_doctors_info → show doctors (name + specialty)
3. Ask preferred date (understand "tomorrow", "next Monday", "ASAP")
4. Call get_available_slots → list available times
5. Collect ONE AT A TIME: Full Name → Email → Phone → Gender → Age
6. Show summary, ask "Shall I confirm this appointment?"
7. Call book_appointment ONLY after explicit confirmation
8. After success: remind to bring ID, medical records, insurance card

## RESCHEDULE: ask email/name → lookup_booking → get new date → get_available_slots → reschedule_booking
## CANCEL: ask email/name → lookup_booking → confirm → cancel_booking → offer to rebook
## DOCTOR IN TODAY: call check_doctor_attendance
## HUMAN HANDOFF: if patient asks for human, offer phone +1(555)123-4567 or collect name+phone → request_callback

## MEDICAL GUIDANCE
Acknowledge emotion first. Give general guidance only. NEVER diagnose, prescribe, or interpret results.

## TONE
Under 3 sentences for simple queries. **Bold** key info. Bullet points for lists. Always end with a next step.${isFirstMessage ? `

At the very END of this first response add: "_Note: I'm an AI assistant, not a medical professional. For medical advice, please consult one of our doctors._"` : ''}`;

// ── Main handler ───────────────────────────────────────────────────────────────
serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const { messages: userMessages, sessionId } = await req.json();
    const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY');
    if (!ANTHROPIC_API_KEY) throw new Error('ANTHROPIC_API_KEY secret not set in Supabase.');

    const supabase = getSupabase();
    const today = new Date().toISOString().split('T')[0];
    const currentUserMsg = userMessages[userMessages.length - 1].content;

    // Emergency check — instant response, no AI involved
    if (detectEmergency(currentUserMsg)) {
      await supabase.from('chatbot_messages').insert({ session_id: sessionId, sender: 'bot', message_content: EMERGENCY_RESPONSE });
      return new Response(JSON.stringify({ response: EMERGENCY_RESPONSE }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200,
      });
    }

    // Load chat history
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

    // Drop leading assistant messages (Claude requires user first)
    while (rawHistory.length > 0 && rawHistory[0].role === 'assistant') rawHistory.shift();

    // Remove duplicate of current message (frontend saves before calling)
    const last = rawHistory[rawHistory.length - 1];
    if (last?.role === 'user' && last?.content === currentUserMsg) rawHistory.pop();

    // Merge consecutive same-role messages (handles failed-request orphans)
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
    const systemPrompt = SYSTEM_PROMPT(today, isFirstMessage);
    const conversation = [
      ...mergedHistory,
      { role: 'user', content: currentUserMsg },
    ];

    // ── Call Claude (Anthropic Messages API) ──────────────────────────────────
    const callClaude = async (msgs: any[]) => {
      const res = await fetch(ANTHROPIC_API, {
        method: "POST",
        headers: {
          "x-api-key": ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
          "content-type": "application/json",
        },
        body: JSON.stringify({
          model: MODEL,
          max_tokens: 1024,
          system: systemPrompt,
          messages: msgs,
          tools,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(`Claude API error: ${JSON.stringify(err)}`);
      }
      return await res.json();
    };

    let response = await callClaude(conversation);

    // Handle tool use (Anthropic format: stop_reason === 'tool_use')
    if (response.stop_reason === 'tool_use') {
      const toolBlock = response.content.find((b: any) => b.type === 'tool_use');
      if (toolBlock) {
        console.log('Tool use:', toolBlock.name, JSON.stringify(toolBlock.input));
        const fn = toolFunctions[toolBlock.name];
        const toolResult = fn ? await fn(toolBlock.input) : JSON.stringify({ error: "Unknown tool" });
        console.log('Tool result length:', toolResult.length);

        // Continue conversation: assistant's tool_use + user's tool_result
        response = await callClaude([
          ...conversation,
          { role: 'assistant', content: response.content },
          { role: 'user', content: [{ type: 'tool_result', tool_use_id: toolBlock.id, content: toolResult }] },
        ]);
      }
    }

    // Extract text from response content blocks
    const botText = response.content?.find((b: any) => b.type === 'text')?.text
      ?? "I'm sorry, I couldn't process that. Please try again.";

    await supabase.from('chatbot_messages').insert({ session_id: sessionId, sender: 'bot', message_content: botText });

    return new Response(JSON.stringify({ response: botText }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200,
    });

  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('chatbot-ai error:', msg);
    return new Response(JSON.stringify({ response: `⚠️ Error: ${msg}` }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200,
    });
  }
});
