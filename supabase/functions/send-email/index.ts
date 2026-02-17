import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "npm:resend";

// CORS headers configuration - allows frontend to communicate with this edge function
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};


serve(async (req: Request) => {
  // check cors auth 
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {

    // get resend api
    const resendKey = Deno?.env.get("RESEND_API_KEY");
    if (!resendKey) {
      console.error("RESEND_API_KEY is missing in environment variables");
      return new Response(
        JSON.stringify({
          error: "Server configuration error: API Key missing",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // destructure from req
    const { to, subject, message } = await req.json();

    // initialize resend
    const resend = new Resend(resendKey);

    // send the email
    const { data, error } = await resend.emails.send({
      from: "MediCare <onboarding@resend.dev>",
      to: [to],
      subject: subject,
      html: message,
    });


    if (error) {
      console.error("Resend API Error:", error);
      return new Response(JSON.stringify({ error }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ data }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Edge Function Exception:", errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
