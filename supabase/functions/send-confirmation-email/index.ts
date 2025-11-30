import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

interface ConfirmationEmailRequest {
  type: "contact" | "objective_inquiry" | "guide_booking";
  recipientEmail: string;
  recipientName: string;
  data: Record<string, any>;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, recipientEmail, recipientName, data }: ConfirmationEmailRequest = await req.json();

    console.log(`Sending ${type} confirmation email to ${recipientEmail}`);

    let subject = "";
    let html = "";

    switch (type) {
      case "contact":
        subject = "Am primit mesajul tău - ExplorăLumea";
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #2563eb;">Mulțumim pentru mesaj, ${recipientName}!</h1>
            <p>Am primit mesajul tău și vom reveni cu un răspuns în cel mai scurt timp posibil.</p>
            
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0;">Detalii mesaj:</h3>
              <p><strong>Subiect:</strong> ${data.subject || "N/A"}</p>
              <p><strong>Data trimiterii:</strong> ${new Date().toLocaleString("ro-RO")}</p>
            </div>

            <p>Îți mulțumim pentru interesul acordat!</p>
            <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
              Echipa ExplorăLumea<br>
              <a href="https://exploralumea.ro" style="color: #2563eb;">exploralumea.ro</a>
            </p>
          </div>
        `;
        break;

      case "objective_inquiry":
        subject = "Confirmare cerere informații - ExplorăLumea";
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #2563eb;">Cererea ta a fost înregistrată, ${recipientName}!</h1>
            <p>Am primit cererea ta de informații despre <strong>${data.objectiveTitle}</strong>.</p>
            
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0;">Detalii cerere:</h3>
              <p><strong>Obiectiv:</strong> ${data.objectiveTitle}</p>
              ${data.visitDate ? `<p><strong>Data vizitei dorite:</strong> ${data.visitDate}</p>` : ""}
              ${data.numberOfPeople ? `<p><strong>Număr persoane:</strong> ${data.numberOfPeople}</p>` : ""}
              <p><strong>Data trimiterii:</strong> ${new Date().toLocaleString("ro-RO")}</p>
            </div>

            <p>Vom reveni cu informațiile solicitate în cel mai scurt timp.</p>
            <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
              Echipa ExplorăLumea<br>
              <a href="https://exploralumea.ro" style="color: #2563eb;">exploralumea.ro</a>
            </p>
          </div>
        `;
        break;

      case "guide_booking":
        subject = "Confirmare cerere rezervare ghid - ExplorăLumea";
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #2563eb;">Cererea ta de rezervare a fost primită, ${recipientName}!</h1>
            <p>Am înregistrat cererea ta pentru ghidul <strong>${data.guideName}</strong>.</p>
            
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0;">Detalii rezervare:</h3>
              <p><strong>Ghid:</strong> ${data.guideName}</p>
              ${data.preferredDate ? `<p><strong>Data dorită:</strong> ${data.preferredDate}</p>` : ""}
              ${data.numberOfPeople ? `<p><strong>Număr persoane:</strong> ${data.numberOfPeople}</p>` : ""}
              ${data.durationDays ? `<p><strong>Durată:</strong> ${data.durationDays} zile</p>` : ""}
              <p><strong>Data cererii:</strong> ${new Date().toLocaleString("ro-RO")}</p>
            </div>

            <p>Ghidul va fi contactat și vei primi un răspuns în curând.</p>
            <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
              Echipa ExplorăLumea<br>
              <a href="https://exploralumea.ro" style="color: #2563eb;">exploralumea.ro</a>
            </p>
          </div>
        `;
        break;
    }

    // Send email using Resend API
    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "ExplorăLumea <onboarding@resend.dev>",
        to: [recipientEmail],
        subject,
        html,
      }),
    });

    if (!emailResponse.ok) {
      const error = await emailResponse.text();
      console.error("Resend API error:", error);
      throw new Error(`Failed to send email: ${error}`);
    }

    const emailResult = await emailResponse.json();
    console.log("Confirmation email sent successfully:", emailResult);

    return new Response(JSON.stringify({ success: true, data: emailResult }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-confirmation-email function:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
