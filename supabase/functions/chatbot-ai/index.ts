/// <reference path="./supabase-deps.d.ts" />
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Interface for OpenRouter API response
interface OpenRouterCompletionResponse {
  id: string;
  choices: Array<{
    finish_reason: string;
    index: number;
    message: {
      content: string | null;
      role: string;
      tool_calls?: Array<{
        id: string;
        type: "function";
        function: {
          name: string;
          arguments: string;
        };
      }>;
    };
  }>;
  created: number;
  model: string;
  object: string;
  usage: {
    completion_tokens: number;
    prompt_tokens: number;
    total_tokens: number;
  };
}

// Helper function to get Supabase client with service role
const getSupabaseServiceRoleClient = () => {
  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );
};

// Helper function to get Supabase client with anon key (for client-side calls)
const getSupabaseAnonClient = () => {
  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? ''
  );
};

// Function to get doctor information
async function get_doctors_info(specialization?: string, name?: string) {
  const supabase = getSupabaseServiceRoleClient();
  let query = supabase.from('doctors').select('*');

  if (specialization) {
    query = query.ilike('specialization', `%${specialization}%`);
  }
  if (name) {
    query = query.ilike('name', `%${name}%`);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching doctors:", error);
    return JSON.stringify({ error: error.message });
  }
  return JSON.stringify(data);
}

// Function to get treatment information
async function get_treatments_info(treatmentName?: string, specialization?: string) {
  const supabase = getSupabaseServiceRoleClient();
  let query = supabase.from('treatments').select('*');

  if (treatmentName) {
    query = query.ilike('name', `%${treatmentName}%`);
  }
  if (specialization) {
    query = query.ilike('specialization', `%${specialization}%`);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching treatments:", error);
    return JSON.stringify({ error: error.message });
  }
  return JSON.stringify(data);
}

// Function to get available time slots for a doctor on a specific date
async function get_available_slots(doctor_id: string, date: string) {
  const supabase = getSupabaseServiceRoleClient();

  // First, check the doctor's general availability schedule
  const { data: doctor, error: doctorError } = await supabase
    .from('doctors')
    .select('availability_schedule')
    .eq('id', doctor_id)
    .single();

  if (doctorError || !doctor) {
    console.error("Error fetching doctor availability:", doctorError);
    return JSON.stringify({ error: "Doctor not found or availability not set." });
  }

  const dayOfWeek = new Date(date).toLocaleString('en-us', { weekday: 'long' }).toLowerCase();
  const schedule = doctor.availability_schedule?.[dayOfWeek];

  if (!schedule || schedule === "Closed") {
    return JSON.stringify({ available_slots: [] }); // Doctor is not available on this day
  }

  // Assuming schedule is like "9:00 AM - 5:00 PM"
  const [startTimeStr, endTimeStr] = schedule.split(' - ');
  const parseTime = (timeStr: string) => {
    const [time, ampm] = timeStr.split(' ');
    let [hours, minutes] = time.split(':').map(Number);
    if (ampm === 'PM' && hours !== 12) hours += 12;
    if (ampm === 'AM' && hours === 12) hours = 0;
    return { hours, minutes };
  };

  const start = parseTime(startTimeStr);
  const end = parseTime(endTimeStr);

  const allPossibleSlots: string[] = [];
  let currentHour = start.hours;
  while (currentHour < end.hours) {
    const slotTime = new Date();
    slotTime.setHours(currentHour, start.minutes, 0, 0);
    allPossibleSlots.push(slotTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }));
    currentHour++;
  }

  // Now, check existing bookings for this doctor on this date
  const { data: bookings, error: bookingsError } = await supabase
    .from('bookings')
    .select('appointment_time')
    .eq('doctor_id', doctor_id)
    .eq('appointment_date', date);

  if (bookingsError) {
    console.error("Error fetching existing bookings:", bookingsError);
    return JSON.stringify({ error: "Could not check existing bookings." });
  }

  const bookedSlots = new Set(bookings?.map(b => b.appointment_time));
  const availableSlots = allPossibleSlots.filter(slot => !bookedSlots.has(slot));

  return JSON.stringify({ available_slots: availableSlots });
}

// Function to book an appointment
async function book_appointment(
  doctor_id: string,
  appointment_date: string,
  appointment_time: string,
  full_name: string,
  email: string,
  phone: string,
  gender: string,
  age: number,
  reason_for_visit: string
) {
  const supabase = getSupabaseServiceRoleClient();

  // First, verify if the slot is actually available
  const availableSlotsResult = await get_available_slots(doctor_id, appointment_date);
  const { available_slots } = JSON.parse(availableSlotsResult);

  if (!available_slots || !available_slots.includes(appointment_time)) {
    return JSON.stringify({ success: false, message: "The requested time slot is no longer available or invalid." });
  }

  const { data, error } = await supabase.from('bookings').insert({
    doctor_id,
    appointment_date,
    appointment_time,
    full_name,
    email,
    phone,
    gender,
    age,
    reason_for_visit,
  });

  if (error) {
    console.error("Error booking appointment:", error);
    return JSON.stringify({ success: false, message: error.message });
  }
  return JSON.stringify({ success: true, message: "Appointment booked successfully!", booking_id: data?.[0]?.id });
}

// Define the tools available to the AI
const tools = [
  {
    type: "function",
    function: {
      name: "get_doctors_info",
      description: "Get information about doctors, optionally filtered by specialization or name.",
      parameters: {
        type: "object",
        properties: {
          specialization: {
            type: "string",
            description: "The medical specialization of the doctor (e.g., 'Cardiology', 'Pediatrics').",
          },
          name: {
            type: "string",
            description: "The name of the doctor.",
          },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_treatments_info",
      description: "Get information about medical treatments offered, optionally filtered by treatment name or specialization.",
      parameters: {
        type: "object",
        properties: {
          treatmentName: {
            type: "string",
            description: "The name of the treatment (e.g., 'Angioplasty', 'Vaccination Programs').",
          },
          specialization: {
            type: "string",
            description: "The medical specialization related to the treatment (e.g., 'Cardiology', 'Pediatrics').",
          },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_available_slots",
      description: "Get available time slots for a specific doctor on a given date.",
      parameters: {
        type: "object",
        properties: {
          doctor_id: {
            type: "string",
            description: "The ID of the doctor.",
          },
          date: {
            type: "string",
            format: "date",
            description: "The date for which to check availability, in 'YYYY-MM-DD' format.",
          },
        },
        required: ["doctor_id", "date"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "book_appointment",
      description: "Book an appointment with a doctor. Requires full patient details and a confirmed available slot.",
      parameters: {
        type: "object",
        properties: {
          doctor_id: { type: "string", description: "The ID of the doctor for the appointment." },
          appointment_date: { type: "string", format: "date", description: "The date of the appointment in 'YYYY-MM-DD' format." },
          appointment_time: { type: "string", description: "The time of the appointment in 'hh:mm a' format (e.g., '09:00 AM')." },
          full_name: { type: "string", description: "The full name of the patient." },
          email: { type: "string", format: "email", description: "The email address of the patient." },
          phone: { type: "string", description: "The phone number of the patient." },
          gender: { type: "string", enum: ["male", "female", "other"], description: "The gender of the patient." },
          age: { type: "number", description: "The age of the patient." },
          reason_for_visit: { type: "string", description: "The reason for the patient's visit." },
        },
        required: ["doctor_id", "appointment_date", "appointment_time", "full_name", "email", "phone", "gender", "age", "reason_for_visit"],
      },
    },
  },
];

// Map tool names to their actual functions
const toolFunctions: { [key: string]: Function } = {
  get_doctors_info,
  get_treatments_info,
  get_available_slots,
  book_appointment,
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages: userMessages, sessionId } = await req.json();
    const OPENROUTER_API_KEY = Deno.env.get('OPENROUTER_API_KEY');

    if (!OPENROUTER_API_KEY) {
      throw new Error('OPENROUTER_API_KEY not set in Supabase secrets.');
    }

    const supabaseAnon = getSupabaseAnonClient(); // Use anon client for chat history (RLS handles user access)

    // Fetch previous chat history for context
    const { data: chatHistory, error: historyError } = await supabaseAnon
      .from('chatbot_messages')
      .select('sender, message_content')
      .eq('session_id', sessionId)
      .order('timestamp', { ascending: true });

    if (historyError) {
      console.error("Error fetching chat history:", historyError);
      // Continue without history if there's an error
    }

    const conversation = chatHistory?.map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'assistant',
      content: msg.message_content,
    })) || [];

    // Add the current user message to the conversation
    conversation.push({ role: 'user', content: userMessages[userMessages.length - 1].content });

    // System message to guide the AI
    const systemMessage = {
      role: "system",
      content: `You are DocConnect AI, a helpful, empathetic, and professional assistant for DocConnect Hospital.
      Your primary goal is to assist users with healthcare inquiries, doctor information, treatment details, and appointment bookings.

      Here are your core capabilities and guidelines:

      1.  **Doctor Information:**
          *   Use the \`get_doctors_info\` tool to find doctors by specialization or name.
          *   When providing doctor information, include their name, specialization, years of experience, hospital, consultation fee, and availability status.

      2.  **Treatment Information:**
          *   Use the \`get_treatments_info\` tool to find details about medical treatments.
          *   When providing treatment information, include the treatment name, specialization, description, common symptoms, duration, and cost range.

      3.  **Appointment Booking (Multi-step Process - VERY IMPORTANT):**
          *   **Step A: Gather Doctor & Date:** If a user wants to book, first ask for the doctor's full name and the preferred appointment date (in YYYY-MM-DD format).
          *   **Step B: Check Availability:** Use the \`get_available_slots\` tool with the doctor's ID and the requested date.
          *   **Step C: Present Slots & Confirm:** If slots are available, list them clearly and ask the user to choose one. If no slots are available, inform the user and suggest checking other dates or doctors.
          *   **Step D: Gather Patient Details:** ONCE a slot is confirmed, you MUST collect ALL of the following patient details before proceeding:
              *   Full Name
              *   Email Address
              *   Phone Number (e.g., +15551234567)
              *   Gender (male, female, or other)
              *   Age (as a number)
              *   Reason for Visit (a brief description)
          *   **Step E: Final Confirmation & Book:** After gathering ALL patient details, summarize the entire appointment (doctor, date, time, patient details) and ask for final confirmation. ONLY THEN call the \`book_appointment\` tool.
          *   **Step F: Booking Result:** Inform the user whether the booking was successful or if there was an issue.

      4.  **General Hospital Inquiries:**
          *   **Hospital Name:** DocConnect Hospital
          *   **Operating Hours:** We are open 24/7 for emergencies. For general inquiries and appointments, our administrative staff is available Monday to Friday, 9:00 AM to 5:00 PM.
          *   **Location:** 123 Hospital Road, Health City, HC 12345
          *   **Contact Phone:** +1 (555) 123-4567
          *   **Contact Email:** info@hospital.com
          *   If a user asks about something not covered by your tools or static knowledge, politely state that you don't have that specific information and suggest they contact the hospital directly via phone or email.

      5.  **Current Date:** ${new Date().toISOString().split('T')[0]} (Use this for date-related queries).

      Always maintain a helpful, clear, and concise tone.
      `,
    };

    const openRouterResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "mistralai/mistral-7b-instruct", // Or another suitable model like "openai/gpt-3.5-turbo"
        messages: [systemMessage, ...conversation],
        tools: tools,
        tool_choice: "auto",
      }),
    });

    if (!openRouterResponse.ok) {
      const errorData = await openRouterResponse.json();
      console.error("OpenRouter API error:", errorData);
      throw new Error(`OpenRouter API error: ${JSON.stringify(errorData)}`);
    }

    const openRouterData: OpenRouterCompletionResponse = await openRouterResponse.json();
    const responseMessage = openRouterData.choices[0].message;

    let botResponseContent = responseMessage.content || "I'm sorry, I couldn't process that request.";
    let toolCallResult = null;

    // Handle tool calls
    if (responseMessage.tool_calls && responseMessage.tool_calls.length > 0) {
      const toolCall = responseMessage.tool_calls[0];
      const functionName = toolCall.function.name;
      const functionArgs = JSON.parse(toolCall.function.arguments);

      if (toolFunctions[functionName]) {
        console.log(`Calling tool: ${functionName} with args:`, functionArgs);
        toolCallResult = await toolFunctions[functionName](...Object.values(functionArgs));
        console.log(`Tool ${functionName} result:`, toolCallResult);

        // Send tool output back to the model for a final response
        const toolResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "mistralai/mistral-7b-instruct",
            messages: [
              systemMessage,
              ...conversation,
              responseMessage, // The tool_calls message from the AI
              {
                role: "tool",
                tool_call_id: toolCall.id,
                content: toolCallResult,
              },
            ],
            tools: tools,
          }),
        });

        if (!toolResponse.ok) {
          const errorData = await toolResponse.json();
          console.error("OpenRouter API error after tool call:", errorData);
          throw new Error(`OpenRouter API error after tool call: ${JSON.stringify(errorData)}`);
        }

        const toolResponseData: OpenRouterCompletionResponse = await toolResponse.json();
        botResponseContent = toolResponseData.choices[0].message.content || "I processed your request.";
      } else {
        botResponseContent = `I tried to use a tool called "${functionName}" but it's not recognized.`;
      }
    }

    // Save bot's response to chat history
    const { error: insertError } = await supabaseAnon.from('chatbot_messages').insert({
      session_id: sessionId,
      sender: 'bot',
      message_content: botResponseContent,
    });

    if (insertError) {
      console.error("Error saving bot message to history:", insertError);
    }

    return new Response(JSON.stringify({ response: botResponseContent }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Error in chatbot-ai function:', error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});