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

    // Twilio sends webhook data as URL-encoded form data
    const formData = await req.formData();
    const from = formData.get('From'); // e.g., whatsapp:+1234567890
    const to = formData.get('To');     // e.g., whatsapp:+14155238886
    const body = formData.get('Body'); // The actual message content
    const messageSid = formData.get('SmsSid'); // Twilio's unique message ID

    if (!from || !to || !body || !messageSid) {
      console.error('Missing required Twilio webhook parameters:', { from, to, body, messageSid });
      return new Response(JSON.stringify({ error: 'Missing required Twilio webhook parameters.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    console.log(`Received WhatsApp message from ${from} to ${to}: "${body}" (SID: ${messageSid})`);

    const { data, error } = await supabaseServiceRole
      .from('whatsapp_chats')
      .insert({
        from_number: from,
        to_number: to,
        message_body: body,
        message_sid: messageSid,
      });

    if (error) {
      console.error('Supabase insert error for WhatsApp chat:', error);
      throw new Error(`Failed to save WhatsApp chat: ${error.message}`);
    }

    console.log('WhatsApp chat saved to Supabase:', data);

    // Twilio expects an empty TwiML response or a simple success message
    return new Response('<Response></Response>', {
      headers: { 'Content-Type': 'text/xml' },
      status: 200,
    });

  } catch (error) {
    console.error('Error in receive-whatsapp-message function:', error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});