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
const MAX_TOOL_ROUNDS = 8;

const getSupabase = () => createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

// ── Emergency detection — bypasses Claude entirely ─────────────────────────────
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
  let query = supabase.from('doctors').select('*').limit(10);
  if (specialization) query = query.ilike('specialization', `%${specialization}%`);
  if (name) query = query.ilike('name', `%${name}%`);
  const { data, error } = await query;
  if (error) return JSON.stringify({ error: error.message });

  const clean = (data || []).map(({ encoding, avatar_url, created_at, updated_at, ...rest }: any) => rest);

  // Fallback: if no match for the filter, return ALL doctors with a note
  if (clean.length === 0 && (specialization || name)) {
    const { data: allData, error: allErr } = await supabase.from('doctors').select('*').limit(10);
    if (allErr) return JSON.stringify({ error: allErr.message });
    const allClean = (allData || []).map(({ encoding, avatar_url, created_at, updated_at, ...rest }: any) => rest);
    if (allClean.length > 0) {
      return JSON.stringify({
        doctors: allClean,
        note: `No exact match for "${specialization || name}". Showing all available doctors — they can refer you to the right specialist.`,
      });
    }
    return JSON.stringify({
      doctors: [],
      message: 'No doctors are currently in our system. Please call +1 (555) 123-4567 and our team will assist you.',
    });
  }

  return JSON.stringify({ doctors: clean });
}

async function get_treatments_info({ treatmentName, specialization }: { treatmentName?: string; specialization?: string } = {}) {
  const supabase = getSupabase();
  let query = supabase.from('treatments').select('*');
  if (treatmentName) query = query.ilike('name', `%${treatmentName}%`);
  if (specialization) query = query.ilike('specialization', `%${specialization}%`);
  const { data, error } = await query;
  if (error) return JSON.stringify({ error: error.message });
  if (!data || data.length === 0) {
    return JSON.stringify({ treatments: [], message: 'No treatment records found. Please call +1 (555) 123-4567 for details.' });
  }
  return JSON.stringify({ treatments: data });
}

async function get_available_slots({ doctor_id, date }: { doctor_id: string; date: string }) {
  const supabase = getSupabase();
  const { data: doctor, error } = await supabase.from('doctors').select('availability_schedule, name').eq('id', doctor_id).single();
  if (error || !doctor) return JSON.stringify({ error: 'Doctor not found.' });

  // Use noon to avoid timezone day-shift issues
  const dayOfWeek = new Date(date + 'T12:00:00').toLocaleString('en-us', { weekday: 'long' }).toLowerCase();
  const schedule = doctor.availability_schedule?.[dayOfWeek];

  if (!schedule || schedule === 'Closed') {
    return JSON.stringify({
      available_slots: [],
      doctor_name: doctor.name,
      message: `${doctor.name} is not available on ${dayOfWeek}s. Please try a different day.`,
    });
  }

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
  for (let m = startMins; m < endMins; m += 30) {
    const h = Math.floor(m / 60), min = m % 60;
    const period = h >= 12 ? 'PM' : 'AM';
    const h12 = h > 12 ? h - 12 : h === 0 ? 12 : h;
    slots.push(`${String(h12).padStart(2, '0')}:${String(min).padStart(2, '0')} ${period}`);
  }

  const { data: bookings } = await supabase.from('bookings').select('appointment_time').eq('doctor_id', doctor_id).eq('appointment_date', date);
  const booked = new Set(bookings?.map((b: any) => b.appointment_time));
  const available = slots.filter(s => !booked.has(s));

  if (available.length === 0) {
    return JSON.stringify({
      available_slots: [],
      doctor_name: doctor.name,
      message: `${doctor.name} is fully booked on ${date}. Please try a different date.`,
    });
  }

  return JSON.stringify({ available_slots: available, doctor_name: doctor.name, date });
}

// Normalize "4:30 PM" → "04:30 PM" so it matches the zero-padded slot strings
function normalizeTime(t: string): string {
  const m = t.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!m) return t;
  return `${String(parseInt(m[1])).padStart(2, '0')}:${m[2]} ${m[3].toUpperCase()}`;
}

async function book_appointment({ doctor_id, appointment_date, appointment_time, full_name, email, phone, gender, age, reason_for_visit }: {
  doctor_id: string; appointment_date: string; appointment_time: string;
  full_name: string; email: string; phone: string; gender: string; age: number; reason_for_visit: string;
}) {
  const supabase = getSupabase();
  const normalizedTime = normalizeTime(appointment_time);
  const slotsRes = JSON.parse(await get_available_slots({ doctor_id, date: appointment_date }));
  if (!slotsRes.available_slots?.includes(normalizedTime)) {
    return JSON.stringify({
      success: false,
      message: `That time slot is not available. Available slots: ${slotsRes.available_slots?.join(', ') || 'none'}. Please choose from those.`,
    });
  }
  // Use the normalized time for the actual insert
  appointment_time = normalizedTime;

  // Fetch doctor name for the confirmation email
  const { data: doctorRow } = await supabase.from('doctors').select('name').eq('id', doctor_id).single();
  const doctorName = doctorRow?.name ?? 'your doctor';

  const { data, error } = await supabase.from('bookings')
    .insert({ doctor_id, appointment_date, appointment_time, full_name, email, phone, gender, age, reason_for_visit })
    .select();
  if (error) return JSON.stringify({ success: false, message: error.message });

  const shortId = (data?.[0]?.id as string)?.slice(0, 8)?.toUpperCase() ?? 'N/A';

  // Send confirmation email — failure does NOT fail the booking
  let emailSent = false;
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const emailBody =
      `Dear ${full_name},\n\n` +
      `Your appointment has been confirmed!\n\n` +
      `Booking Reference: ${shortId}\n` +
      `Doctor: ${doctorName}\n` +
      `Date: ${appointment_date}\n` +
      `Time: ${appointment_time}\n` +
      `Reason: ${reason_for_visit}\n\n` +
      `Please remember to bring:\n` +
      `- Valid ID\n` +
      `- Medical records (if any)\n` +
      `- Insurance card\n\n` +
      `Address: 123 Hospital Road, Health City\n` +
      `Phone: +1 (555) 123-4567\n\n` +
      `Thank you for choosing DocConnect Hospital!`;

    const emailRes = await fetch(`${supabaseUrl}/functions/v1/send-booking-confirmation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${serviceKey}`,
      },
      body: JSON.stringify({
        to: email,
        subject: `Appointment Confirmed — DocConnect Hospital (Ref: ${shortId})`,
        body: emailBody,
      }),
    });
    emailSent = emailRes.ok;
  } catch (_) {
    // intentionally silent — booking already succeeded
  }

  return JSON.stringify({
    success: true,
    message: `Appointment booked successfully! ✅ Your booking reference is **${shortId}**.`,
    booking_id: data?.[0]?.id,
    doctor_name: doctorName,
    email_sent: emailSent,
  });
}

async function lookup_booking({ email, full_name }: { email?: string; full_name?: string }) {
  const supabase = getSupabase();
  if (!email && !full_name) return JSON.stringify({ error: 'Please provide an email address or full name.' });

  let query = supabase.from('bookings')
    .select('id, doctor_id, appointment_date, appointment_time, full_name, email, reason_for_visit')
    .order('appointment_date', { ascending: false })
    .limit(5);
  if (email) query = query.ilike('email', email);
  else if (full_name) query = query.ilike('full_name', `%${full_name}%`);

  const { data, error } = await query;
  if (error) return JSON.stringify({ error: error.message });
  if (!data || data.length === 0) return JSON.stringify({ error: 'No bookings found. Please double-check the email or name.' });

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
  return JSON.stringify({ success: true, message: 'Appointment cancelled successfully. We hope to see you again.' });
}

async function reschedule_booking({ booking_id, new_date, new_time }: { booking_id: string; new_date: string; new_time: string }) {
  const supabase = getSupabase();
  const { data: booking } = await supabase.from('bookings').select('doctor_id').eq('id', booking_id).single();
  if (!booking) return JSON.stringify({ success: false, message: 'Booking not found. Please check your booking ID.' });

  const slotsRes = JSON.parse(await get_available_slots({ doctor_id: booking.doctor_id, date: new_date }));
  if (!slotsRes.available_slots?.includes(new_time)) {
    return JSON.stringify({ success: false, message: 'That slot is not available. Please choose a different time.' });
  }
  const { error } = await supabase.from('bookings').update({ appointment_date: new_date, appointment_time: new_time }).eq('id', booking_id);
  if (error) return JSON.stringify({ success: false, message: error.message });
  return JSON.stringify({ success: true, message: `Appointment rescheduled to ${new_date} at ${new_time}. ✅` });
}

async function check_doctor_attendance({ doctor_name }: { doctor_name: string }) {
  const supabase = getSupabase();
  const today = new Date().toISOString().split('T')[0];
  const { data: doctors } = await supabase.from('doctors').select('id, name').ilike('name', `%${doctor_name}%`).limit(1);
  if (!doctors || doctors.length === 0) return JSON.stringify({ error: `No doctor named "${doctor_name}" found.` });

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
  return JSON.stringify({ success: true, message: 'Callback request logged! Our team will call you shortly.' });
}

async function submit_inquiry({ name, email, message }: { name: string; email: string; message: string }) {
  const supabase = getSupabase();
  const { error } = await supabase.from('patient_inquiries').insert({ name, email, message });
  if (error) return JSON.stringify({ success: false, message: error.message });
  return JSON.stringify({ success: true, message: 'Inquiry submitted! Our team will respond within 24 hours.' });
}

const toolFunctions: Record<string, (args: any) => Promise<string>> = {
  get_doctors_info, get_treatments_info, get_available_slots, book_appointment,
  lookup_booking, cancel_booking, reschedule_booking,
  check_doctor_attendance, request_callback, submit_inquiry,
};

// ── Tool schemas ───────────────────────────────────────────────────────────────
const tools = [
  {
    name: 'get_doctors_info',
    description: 'Search doctors by specialization or name. Always call this when a patient mentions a symptom or wants a doctor. If specialty search returns empty, the function automatically returns all available doctors with a note.',
    input_schema: {
      type: 'object',
      properties: {
        specialization: {
          type: 'string',
          description: "e.g. 'General Practice', 'Cardiology', 'Neurology', 'Dermatology', 'Orthopedics', 'Pediatrics', 'Gynecology', 'ENT', 'Psychiatry', 'Gastroenterology', 'Ophthalmology', 'Endocrinology', 'Nephrology', 'Pulmonology', 'Dentistry'",
        },
        name: { type: 'string', description: "Doctor's name to search for" },
      },
    },
  },
  {
    name: 'get_treatments_info',
    description: 'Get info about treatments and procedures offered at DocConnect.',
    input_schema: {
      type: 'object',
      properties: {
        treatmentName: { type: 'string' },
        specialization: { type: 'string' },
      },
    },
  },
  {
    name: 'get_available_slots',
    description: 'Get available 30-minute appointment slots for a doctor on a date. Slots are filtered against existing bookings automatically.',
    input_schema: {
      type: 'object',
      properties: {
        doctor_id: { type: 'string', description: "Doctor's ID from get_doctors_info result" },
        date: { type: 'string', description: 'YYYY-MM-DD format' },
      },
      required: ['doctor_id', 'date'],
    },
  },
  {
    name: 'book_appointment',
    description: 'Book an appointment. Call ONLY after ALL details are collected AND patient gives explicit confirmation.',
    input_schema: {
      type: 'object',
      properties: {
        doctor_id: { type: 'string' },
        appointment_date: { type: 'string', description: 'YYYY-MM-DD' },
        appointment_time: { type: 'string', description: 'hh:mm AM/PM — must match a slot from get_available_slots exactly' },
        full_name: { type: 'string' },
        email: { type: 'string' },
        phone: { type: 'string' },
        gender: { type: 'string', enum: ['male', 'female', 'other'] },
        age: { type: 'number' },
        reason_for_visit: { type: 'string' },
      },
      required: ['doctor_id', 'appointment_date', 'appointment_time', 'full_name', 'email', 'phone', 'gender', 'age', 'reason_for_visit'],
    },
  },
  {
    name: 'lookup_booking',
    description: "Look up a patient's existing booking by email or full name.",
    input_schema: {
      type: 'object',
      properties: {
        email: { type: 'string' },
        full_name: { type: 'string' },
      },
    },
  },
  {
    name: 'cancel_booking',
    description: 'Cancel an appointment. Ask for explicit patient confirmation before calling.',
    input_schema: {
      type: 'object',
      properties: { booking_id: { type: 'string' } },
      required: ['booking_id'],
    },
  },
  {
    name: 'reschedule_booking',
    description: 'Reschedule an existing appointment to a new date and time.',
    input_schema: {
      type: 'object',
      properties: {
        booking_id: { type: 'string' },
        new_date: { type: 'string', description: 'YYYY-MM-DD' },
        new_time: { type: 'string', description: 'hh:mm AM/PM' },
      },
      required: ['booking_id', 'new_date', 'new_time'],
    },
  },
  {
    name: 'check_doctor_attendance',
    description: "Check if a doctor is in the clinic today using facial recognition attendance data.",
    input_schema: {
      type: 'object',
      properties: { doctor_name: { type: 'string' } },
      required: ['doctor_name'],
    },
  },
  {
    name: 'request_callback',
    description: 'Log a callback request when a patient wants to speak to human staff.',
    input_schema: {
      type: 'object',
      properties: {
        patient_name: { type: 'string' },
        phone: { type: 'string' },
        reason: { type: 'string' },
      },
      required: ['patient_name', 'phone'],
    },
  },
  {
    name: 'submit_inquiry',
    description: 'Submit a general inquiry or question to the hospital team.',
    input_schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        email: { type: 'string' },
        message: { type: 'string' },
      },
      required: ['name', 'email', 'message'],
    },
  },
];

// ── System prompt ──────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = (today: string, bookingDeadline: string, isFirstMessage: boolean) => `You are DocConnect AI, the official virtual assistant for DocConnect Hospital. Today is ${today}. Appointments may be booked up to ${bookingDeadline}.

## IDENTITY & VOICE
Warm, professional, empathetic — the best clinic receptionist the patient has ever met. Short, clear sentences. No jargon unless the patient uses it first. Always end every reply with a next step or question. Once the patient shares their name, use it.

## YOUR SCOPE
You assist ONLY with: doctor search, appointment booking/reschedule/cancel, treatments, hospital info, general medical guidance, and human handoff.

If asked about ANYTHING outside healthcare (coding, sports, weather, news, politics, recipes, finance, games):
"I'm DocConnect AI and I can only help with healthcare and hospital topics. Can I help you find a doctor or book an appointment? 😊"

## 🚨 EMERGENCY — OVERRIDES EVERYTHING
If patient mentions chest pain, heart attack, stroke, difficulty breathing, severe bleeding, unconscious, seizure, overdose, suicidal thoughts, anaphylaxis — respond ONLY with:
"⚠️ This sounds like a medical emergency. Please call emergency services right now:
🚨 Emergency: 911 | Rescue: 1122 | Edhi: 115
🏥 Go to the nearest ER immediately. Do not wait."

## HOSPITAL INFO
- **Name:** DocConnect Hospital | **Phone:** +1 (555) 123-4567 | **Email:** info@docconnect.com
- **Hours:** Mon–Fri 9 AM–6 PM | Sat 9 AM–1 PM | **Emergency:** 24/7
- **Address:** 123 Hospital Road, Health City | **Free parking:** basement level
- **Languages:** English, Urdu, Arabic

## SYMPTOM → SPECIALIZATION MAPPING
Map what the patient describes to the right specialty before calling get_doctors_info:
- Headache, migraine, dizziness, memory loss, numbness, fainting → **Neurology**
- Chest tightness (non-emergency), heart palpitations, high blood pressure → **Cardiology**
- Stomach pain, nausea, vomiting, acidity, diarrhea, constipation → **Gastroenterology**
- Skin rash, acne, hair loss, skin spots, itching → **Dermatology**
- Joint pain, back pain, bone issues, fracture, swelling → **Orthopedics**
- Fever, cough, cold, flu, fatigue, general checkup, weakness → **General Practice**
- Ear pain, hearing loss, nasal congestion, sore throat, tonsils → **ENT**
- Eye problems, blurry vision, eye pain → **Ophthalmology**
- Anxiety, depression, sleep disorders, mental health → **Psychiatry**
- Child illness, vaccination, growth concerns → **Pediatrics**
- Pregnancy, women's health, menstrual issues → **Gynecology**
- Diabetes, thyroid, weight issues, hormonal → **Endocrinology**
- Kidney problems, UTI, bladder → **Nephrology**
- Tooth pain, gum disease, dental → **Dentistry**
- Allergy, asthma, breathing (chronic) → **Pulmonology**
- If unsure → use **General Practice**

## APPOINTMENT BOOKING FLOW
1. Acknowledge the concern with empathy ("That sounds uncomfortable, let me help.")
2. Call **get_doctors_info** with the matching specialization from the map above
3. Present doctors: name, specialty, available days from their schedule
4. Ask: "Which doctor would you prefer?" and "What date works for you?" (can ask both at once)
5. Once doctor + date confirmed → call **get_available_slots** immediately
6. Show available slots as a numbered list; ask patient to pick one
7. Ask for patient details in ONE message: "I'll need a few quick details — please share your **Full Name, Email, Phone, Gender, and Age**"
8. Infer reason_for_visit from the earlier conversation (don't ask separately)
9. Show booking summary and ask: "Shall I confirm this appointment?"
10. Call **book_appointment** ONLY after explicit yes/confirm
11. On success: share the booking reference. If the tool result contains "email_sent": true, say "A confirmation email has been sent to [their email]". If email_sent is false or missing, do NOT mention email at all. Always remind patient to bring: ID, medical records, insurance card

## WHEN DOCTORS SEARCH RETURNS EMPTY OR NOTE
- The result will include a "note" field and show ALL available doctors
- Present those doctors as alternatives: "We don't have a [specialty] specialist listed right now, but these doctors can help and refer you if needed:"
- If the doctors array is empty: "Our doctor records appear to be updating. Please call +1 (555) 123-4567 and our team will help immediately."
- NEVER just apologize and stop — always offer the next step

## WHEN SLOTS ARE FULLY BOOKED OR DOCTOR UNAVAILABLE
- Suggest trying the next day for the same doctor
- OR offer to check a different doctor from the list
- Never give up without offering an alternative

## DATE HANDLING
- "Tomorrow" = ${today} + 1 day (compute the YYYY-MM-DD correctly)
- "Next Monday/Tuesday/etc." = upcoming weekday after today
- "ASAP" or "as soon as possible" = check today first, then tomorrow
- Always confirm the date you understood: "I'll check slots for **[Day, Date Month Year]** — does that work?"

## RESCHEDULE FLOW
Ask email or name → lookup_booking → show booking → ask new date/time → get_available_slots → confirm → reschedule_booking

## CANCEL FLOW
Ask email or name → lookup_booking → show appointment details → ask explicit confirmation → cancel_booking → offer to rebook

## IS THE DOCTOR IN TODAY?
Call check_doctor_attendance → share result clearly

## HUMAN HANDOFF
If patient asks for a human: offer +1(555)123-4567 OR ask for name + phone number → request_callback

## GENERAL MEDICAL GUIDANCE
Acknowledge the emotion first. Give GENERAL guidance only. NEVER diagnose, prescribe, or interpret test results. Always recommend seeing a doctor for anything clinical.

## OUT OF SCOPE SERVICES
If asked about services DocConnect doesn't offer (home visits, lab interpretation, pharmacy, telemedicine): "That's not something I can help with directly, but please call our team at +1 (555) 123-4567 — they'll point you in the right direction."

## RESPONSE FORMAT
- Simple queries: under 3 sentences. **Bold** key info. Bullets for lists.
- Always end with a question or next step.
- Collect multiple details in one message when logical (saves the patient time).${isFirstMessage ? `

At the very END of this first response add: "_Note: I'm an AI assistant, not a medical professional. For medical advice, please consult one of our doctors._"` : ''}`;

// ── Main handler ───────────────────────────────────────────────────────────────
serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const { messages: userMessages, sessionId } = await req.json();
    const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY');
    if (!ANTHROPIC_API_KEY) throw new Error('ANTHROPIC_API_KEY secret not set in Supabase.');

    const supabase = getSupabase();
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const deadline = new Date(now);
    deadline.setMonth(deadline.getMonth() + 5);
    const bookingDeadline = deadline.toISOString().split('T')[0];

    const currentUserMsg = userMessages[userMessages.length - 1].content;

    // Emergency check — instant response, no AI
    if (detectEmergency(currentUserMsg)) {
      await supabase.from('chatbot_messages').insert({ session_id: sessionId, sender: 'bot', message_content: EMERGENCY_RESPONSE });
      return new Response(JSON.stringify({ response: EMERGENCY_RESPONSE }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200,
      });
    }

    // Load chat history (up to 30 messages for context)
    const { data: chatHistory } = await supabase
      .from('chatbot_messages')
      .select('sender, message_content')
      .eq('session_id', sessionId)
      .order('timestamp', { ascending: true })
      .limit(30);

    const rawHistory = chatHistory?.map((msg: any) => ({
      role: msg.sender === 'user' ? 'user' : 'assistant',
      content: msg.message_content,
    })) || [];

    // Drop leading assistant messages (Claude requires conversation to start with user)
    while (rawHistory.length > 0 && rawHistory[0].role === 'assistant') rawHistory.shift();

    // Remove duplicate of current message (frontend saves it before calling)
    const last = rawHistory[rawHistory.length - 1];
    if (last?.role === 'user' && last?.content === currentUserMsg) rawHistory.pop();

    // Merge consecutive same-role messages (guards against orphaned retries)
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
    const systemPrompt = SYSTEM_PROMPT(today, bookingDeadline, isFirstMessage);

    let msgs: any[] = [
      ...mergedHistory,
      { role: 'user', content: currentUserMsg },
    ];

    const callClaude = async (messages: any[]) => {
      const res = await fetch(ANTHROPIC_API, {
        method: 'POST',
        headers: {
          'x-api-key': ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model: MODEL,
          max_tokens: 2048,
          system: systemPrompt,
          messages,
          tools,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(`Claude API error: ${JSON.stringify(err)}`);
      }
      return await res.json();
    };

    let response = await callClaude(msgs);
    let toolRounds = 0;

    // ── Multi-turn tool loop — handles chained tool calls until Claude gives a text response
    while (response.stop_reason === 'tool_use' && toolRounds < MAX_TOOL_ROUNDS) {
      toolRounds++;
      const toolBlocks = response.content.filter((b: any) => b.type === 'tool_use');

      // Append assistant's tool-use message
      msgs = [...msgs, { role: 'assistant', content: response.content }];

      // Execute all tool calls in this response (Claude can request multiple at once)
      const toolResults = await Promise.all(
        toolBlocks.map(async (toolBlock: any) => {
          console.log(`[tool round ${toolRounds}] ${toolBlock.name}`, JSON.stringify(toolBlock.input));
          const fn = toolFunctions[toolBlock.name];
          const result = fn ? await fn(toolBlock.input) : JSON.stringify({ error: 'Unknown tool' });
          console.log(`[tool round ${toolRounds}] result length: ${result.length}`);
          return {
            type: 'tool_result' as const,
            tool_use_id: toolBlock.id,
            content: result,
          };
        })
      );

      // Append tool results and call Claude again
      msgs = [...msgs, { role: 'user', content: toolResults }];
      response = await callClaude(msgs);
    }

    // Extract final text from response
    const botText = response.content?.find((b: any) => b.type === 'text')?.text
      ?? "I'm sorry, I couldn't process that. Please try again or call us at **+1 (555) 123-4567**.";

    await supabase.from('chatbot_messages').insert({ session_id: sessionId, sender: 'bot', message_content: botText });

    return new Response(JSON.stringify({ response: botText }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200,
    });

  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('chatbot-ai error:', msg);
    return new Response(JSON.stringify({
      response: `⚠️ Something went wrong on our end. Please try again or call us at **+1 (555) 123-4567**.\n\n_Technical: ${msg}_`,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200,
    });
  }
});
