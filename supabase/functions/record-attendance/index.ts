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
    // Create a Supabase client with the service role key for elevated privileges
    // This is important because the RLS policy for INSERT is set to `authenticated`,
    // and an Edge Function invoked directly might not have a user session.
    // Using the service_role_key allows the function to bypass RLS if needed,
    // but it's crucial to validate input carefully.
    const supabase = createClient(
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

    const { data, error } = await supabase
      .from('doctor_attendance')
      .insert({
        doctor_id,
        event_type,
        camera_location,
        confidence_score,
      });

    if (error) {
      console.error('Supabase insert error:', error);
      throw new Error(`Failed to record attendance: ${error.message}`);
    }

    console.log(`Attendance recorded for doctor_id: ${doctor_id}, event_type: ${event_type}`);

    return new Response(JSON.stringify({ message: 'Attendance recorded successfully.', data }), {
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