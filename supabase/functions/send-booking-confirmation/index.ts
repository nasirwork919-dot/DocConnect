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
    const { to, subject, body } = await req.json();

    // IMPORTANT: Replace this with your actual email sending logic.
    // You'll need to use an email service like SendGrid, Resend, Mailgun, etc.
    // For example, using Resend:
    // const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    // if (!RESEND_API_KEY) {
    //   throw new Error('RESEND_API_KEY not set in Supabase secrets.');
    // }
    //
    // const resendResponse = await fetch('https://api.resend.com/emails', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': `Bearer ${RESEND_API_KEY}`,
    //   },
    //   body: JSON.stringify({
    //     from: 'nasir.work516@gmail.com', // Ensure this email is verified in your Resend account
    //     to: to,
    //     subject: subject,
    //     html: body.replace(/\n/g, '<br>'), // Convert newlines to <br> for HTML email
    //   }),
    // });
    //
    // if (!resendResponse.ok) {
    //   const errorData = await resendResponse.json();
    //   throw new Error(`Failed to send email: ${JSON.stringify(errorData)}`);
    // }

    console.log(`Simulating email sent to ${to} with subject: ${subject}`);
    // In a real scenario, you'd check resendResponse.ok and return success/failure

    return new Response(JSON.stringify({ message: 'Email function invoked (simulated).' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Error in send-booking-confirmation function:', error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});