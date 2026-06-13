/// <reference path="../supabase-deps.d.ts" />
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseServiceRole = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { doctor_id, event_type, camera_location, confidence_score } = await req.json();

    // Basic validation
    if (!doctor_id || !event_type) {
      return new Response(JSON.stringify({ error: 'Missing required fields: doctor_id, event_type' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    // 1. Record attendance
    const { data: attendanceData, error: attendanceError } = await supabaseServiceRole
      .from('doctor_attendance')
      .insert({
        doctor_id,
        event_type,
        camera_location,
        confidence_score,
      });

    if (attendanceError) {
      console.error('Supabase insert error:', attendanceError);
      throw new Error(`Failed to record attendance: ${attendanceError.message}`);
    }

    console.log(`Attendance recorded for doctor_id: ${doctor_id}, event_type: ${event_type}`);

    // 2. Fetch doctor's name for notification
    const { data: doctor, error: doctorError } = await supabaseServiceRole
      .from('doctors')
      .select('name')
      .eq('id', doctor_id)
      .single();

    let doctorName = "Unknown Doctor";
    if (doctorError) {
      console.warn(`Could not fetch doctor name for ID ${doctor_id}: ${doctorError.message}`);
    } else if (doctor) {
      doctorName = doctor.name;
    }

    // 3. Send WhatsApp notification via Twilio
    const TWILIO_ACCOUNT_SID = Deno.env.get('TWILIO_ACCOUNT_SID');
    const TWILIO_AUTH_TOKEN = Deno.env.get('TWILIO_AUTH_TOKEN');
    const TWILIO_WHATSAPP_FROM = Deno.env.get('TWILIO_WHATSAPP_FROM'); // e.g., whatsapp:+14155238886 (Twilio Sandbox number)
    const WHATSAPP_TO_NUMBER = Deno.env.get('WHATSAPP_TO_NUMBER'); // e.g., whatsapp:+1234567890 (your WhatsApp number that joined the sandbox)

    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_WHATSAPP_FROM || !WHATSAPP_TO_NUMBER) {
      console.warn('Twilio environment variables not fully set. Skipping WhatsApp notification.');
    } else {
      const messageBody = `DocConnect Attendance Alert: Dr. ${doctorName} has ${event_type.toLowerCase()} at ${new Date().toLocaleString()}.`;
      const twilioApiUrl = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;

      const authHeader = btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`);
      const formData = new URLSearchParams();
      formData.append('To', WHATSAPP_TO_NUMBER);
      formData.append('From', TWILIO_WHATSAPP_FROM);
      formData.append('Body', messageBody);

      const twilioResponse = await fetch(twilioApiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${authHeader}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      });

      if (!twilioResponse.ok) {
        const errorData = await twilioResponse.json();
        console.error('Twilio WhatsApp send error:', errorData);
        // Do not throw error here, as attendance was already recorded successfully.
        // Just log the notification failure.
      } else {
        console.log(`WhatsApp notification sent to ${WHATSAPP_TO_NUMBER} for doctor ${doctorName}.`);
      }
    }

    return new Response(JSON.stringify({ message: 'Attendance recorded successfully.', data: attendanceData }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Error in record-attendance function:', error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});