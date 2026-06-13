/// <reference path="./supabase-deps.d.ts" />
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const MODEL = "claude-haiku-4-5-20251001";  // fast + cheap; swap to claude-sonnet-4-6 for smarter responses

const getSupabase = () => createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

// ── Tool functions ─────────────────────────────────────────────────────────────

async function get_doctors_info({ specialization, name }: { specialization?: string; name?: string } = {}) {
  const supabase = getSupabase();
  let query = supabase.from('doctors')
    .select('id, name, specialization, experience, hospital, consultation_fee, availability_status, languages, contact_email')
    .limit(8);
  if (specialization) query = query.ilike('specialization', `%${specialization}%`);
  if (name) query = query.ilike('name', `%${name}%`);
  const { data, error } = await query;
  if (error) return JSON.stringify({ error: error.message });
  return JSON.stringify(data);
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
    return JSON.stringify({ success: false, message: "That time slot is no longer available." });
  }
  const { data, error } = await supabase.from('bookings')
    .insert({ doctor_id, appointment_date, appointment_time, full_name, email, phone, gender, age, reason_for_visit })
    .select();
  if (error) return JSON.stringify({ success: false, message: error.message });
  return JSON.stringify({ success: true, message: "Appointment booked successfully!", booking_id: data?.[0]?.id });
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
  submit_inquiry,
};

// ── Anthropic tool schema (uses input_schema, not parameters) ──────────────────
const tools = [
  {
    name: "get_doctors_info",
    description: "Search for doctors by specialization or name. Use whenever a user asks about doctors, specialists, or wants to know who to see for a condition.",
    input_schema: {
      type: "object",
      properties: {
        specialization: { type: "string", description: "Medical specialization e.g. Cardiology, Pediatrics, Neurology" },
        name: { type: "string", description: "Doctor's name" },
      },
    },
  },
  {
    name: "get_treatments_info",
    description: "Get information about medical treatments and procedures offered at the hospital.",
    input_schema: {
      type: "object",
      properties: {
        treatmentName: { type: "string", description: "Name of the treatment or procedure" },
        specialization: { type: "string", description: "Medical specialization related to the treatment" },
      },
    },
  },
  {
    name: "get_available_slots",
    description: "Check available appointment slots for a specific doctor on a given date.",
    input_schema: {
      type: "object",
      properties: {
        doctor_id: { type: "string", description: "The doctor's ID from get_doctors_info" },
        date: { type: "string", description: "Date in YYYY-MM-DD format" },
      },
      required: ["doctor_id", "date"],
    },
  },
  {
    name: "book_appointment",
    description: "Book an appointment. ONLY call after collecting ALL patient details and getting explicit confirmation.",
    input_schema: {
      type: "object",
      properties: {
        doctor_id: { type: "string" },
        appointment_date: { type: "string", description: "YYYY-MM-DD" },
        appointment_time: { type: "string", description: "hh:mm AM/PM format" },
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
    name: "submit_inquiry",
    description: "Submit a patient inquiry to the hospital team. Use when the patient wants to contact the hospital or has a question the AI can't answer.",
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
const SYSTEM_PROMPT = (today: string) => `You are DocConnect AI, the official assistant for DocConnect Hospital. Today is ${today}.

## YOUR SCOPE
You ONLY assist with:
- Doctors: finding specialists, availability, fees, info
- Treatments and procedures at DocConnect
- Appointment booking
- Hospital information (hours, location, contact, policies)
- General medical guidance (symptoms → suggest specialist, NOT diagnose)
- Patient inquiries submission

## OUT OF SCOPE — STRICT RULE
If the user asks about ANYTHING unrelated to healthcare or this hospital (coding, sports, weather, news, general knowledge, entertainment, politics, etc.) — respond with ONLY:
"I'm DocConnect AI and I can only help with hospital and healthcare topics. Can I help you find a doctor, book an appointment, or answer a medical question? 😊"

## HOSPITAL INFO
- Name: DocConnect Hospital
- Emergency: 24/7
- Admin hours: Mon–Fri, 9:00 AM – 5:00 PM
- Location: 123 Hospital Road, Health City, HC 12345
- Phone: +1 (555) 123-4567
- Email: info@docconnect.com

## APPOINTMENT BOOKING FLOW (follow exactly)
1. Ask: which doctor (or specialization) + preferred date
2. Call get_doctors_info to find the doctor and their ID
3. Call get_available_slots with doctor_id + date
4. List available slots, ask patient to pick one
5. Collect in one message: Full Name, Email, Phone, Gender, Age, Reason for Visit
6. Summarize all details and ask "Shall I confirm this booking?"
7. Call book_appointment ONLY after patient confirms

## MEDICAL QUESTIONS
- Give helpful general guidance: e.g. "headache + fever may indicate infection — a GP can help"
- NEVER give a definitive diagnosis
- For serious symptoms (chest pain, stroke signs, difficulty breathing): "⚠️ This sounds urgent. Please call 911 or go to the nearest ER immediately."
- Suggest relevant specialists and offer to find/book one

## TONE
Warm, professional, concise. Use **bold** for doctor names and key info. Use bullet points for lists.`;

// ── Main handler ───────────────────────────────────────────────────────────────
serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const { messages: userMessages, sessionId } = await req.json();
    const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY');
    if (!ANTHROPIC_API_KEY) throw new Error('ANTHROPIC_API_KEY secret not set in Supabase.');

    const supabase = getSupabase();
    const today = new Date().toISOString().split('T')[0];

    // Load last 20 messages for context
    const { data: chatHistory } = await supabase
      .from('chatbot_messages')
      .select('sender, message_content')
      .eq('session_id', sessionId)
      .order('timestamp', { ascending: true })
      .limit(20);

    const currentUserMsg = userMessages[userMessages.length - 1].content;

    // Build conversation — Anthropic requires alternating user/assistant, starting with user
    const rawHistory = chatHistory?.map((msg: any) => ({
      role: msg.sender === 'user' ? 'user' : 'assistant',
      content: msg.message_content,
    })) || [];

    // Drop leading assistant messages
    while (rawHistory.length > 0 && rawHistory[0].role === 'assistant') {
      rawHistory.shift();
    }

    // Frontend saves the user message to DB before calling this function, so history
    // already contains it as the last entry — remove it to avoid duplication.
    const last = rawHistory[rawHistory.length - 1];
    if (last?.role === 'user' && last?.content === currentUserMsg) {
      rawHistory.pop();
    }

    const conversation = [
      ...rawHistory,
      { role: 'user', content: currentUserMsg },
    ];

    const callClaude = async (msgs: object[]) => {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
          "content-type": "application/json",
        },
        body: JSON.stringify({
          model: MODEL,
          max_tokens: 1024,
          system: SYSTEM_PROMPT(today),
          messages: msgs,
          tools,
          tool_choice: { type: "auto" },
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(`Anthropic API error: ${JSON.stringify(err)}`);
      }
      return await res.json();
    };

    let response = await callClaude(conversation);

    // Handle tool call — Anthropic returns stop_reason: "tool_use"
    if (response.stop_reason === "tool_use") {
      const toolUse = response.content.find((c: any) => c.type === "tool_use");
      const fn = toolFunctions[toolUse.name];
      const toolResult = fn ? await fn(toolUse.input) : JSON.stringify({ error: "Unknown tool" });

      response = await callClaude([
        ...conversation,
        { role: "assistant", content: response.content },
        { role: "user", content: [{ type: "tool_result", tool_use_id: toolUse.id, content: toolResult }] },
      ]);
    }

    // Extract text from Anthropic response content array
    const botText = response.content?.find((c: any) => c.type === "text")?.text
      ?? "I'm sorry, I couldn't process that. Please try again.";

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
