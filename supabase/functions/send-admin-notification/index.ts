import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const ADMIN_EMAIL = Deno.env.get("ADMIN_EMAIL") || "admin@exploralumea.ro";

interface AdminNotificationRequest {
  type: "contact" | "objective_inquiry" | "guide_booking" | "newsletter";
  data: Record<string, any>;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, data }: AdminNotificationRequest = await req.json();

    console.log(`Sending ${type} admin notification to ${ADMIN_EMAIL}`);

    let subject = "";
    let html = "";

    switch (type) {
      case "contact":
        subject = `[ExplorăLumea] Mesaj nou de contact de la ${data.fullName}`;
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #dc2626;">Mesaj nou de contact</h1>
            
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0;">Detalii expeditor:</h3>
              <p><strong>Nume:</strong> ${data.fullName}</p>
              <p><strong>Email:</strong> <a href="mailto:${data.email}">${data.email}</a></p>
              ${data.phone ? `<p><strong>Telefon:</strong> ${data.phone}</p>` : ""}
              <p><strong>Subiect:</strong> ${data.subject}</p>
            </div>

            <div style="background: #ffffff; border: 1px solid #e5e7eb; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0;">Mesaj:</h3>
              <p style="white-space: pre-wrap;">${data.message}</p>
            </div>

            <p><strong>Data primirii:</strong> ${new Date().toLocaleString("ro-RO")}</p>
            <p><strong>ID Mesaj:</strong> ${data.id || "N/A"}</p>
          </div>
        `;
        break;

      case "objective_inquiry":
        subject = `[ExplorăLumea] Cerere informații obiectiv: ${data.objectiveTitle}`;
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #dc2626;">Cerere nouă informații obiectiv</h1>
            
            <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0;">Obiectiv:</h3>
              <p style="font-size: 18px; font-weight: bold; color: #92400e;">${data.objectiveTitle}</p>
            </div>

            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0;">Detalii vizitator:</h3>
              <p><strong>Nume:</strong> ${data.fullName}</p>
              <p><strong>Email:</strong> <a href="mailto:${data.email}">${data.email}</a></p>
              ${data.phone ? `<p><strong>Telefon:</strong> ${data.phone}</p>` : ""}
              ${data.visitDate ? `<p><strong>Data vizitei:</strong> ${data.visitDate}</p>` : ""}
              ${data.numberOfPeople ? `<p><strong>Număr persoane:</strong> ${data.numberOfPeople}</p>` : ""}
            </div>

            <div style="background: #ffffff; border: 1px solid #e5e7eb; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0;">Mesaj:</h3>
              <p style="white-space: pre-wrap;">${data.message}</p>
            </div>

            <p><strong>Data primirii:</strong> ${new Date().toLocaleString("ro-RO")}</p>
            <p><strong>ID Cerere:</strong> ${data.id || "N/A"}</p>
          </div>
        `;
        break;

      case "guide_booking":
        subject = `[ExplorăLumea] Cerere rezervare ghid: ${data.guideName}`;
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #dc2626;">Cerere nouă rezervare ghid</h1>
            
            <div style="background: #dbeafe; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0;">Ghid solicitat:</h3>
              <p style="font-size: 18px; font-weight: bold; color: #1e40af;">${data.guideName}</p>
            </div>

            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0;">Detalii client:</h3>
              <p><strong>Nume:</strong> ${data.fullName}</p>
              <p><strong>Email:</strong> <a href="mailto:${data.email}">${data.email}</a></p>
              <p><strong>Telefon:</strong> ${data.phone}</p>
              ${data.preferredDate ? `<p><strong>Data dorită:</strong> ${data.preferredDate}</p>` : ""}
              ${data.numberOfPeople ? `<p><strong>Număr persoane:</strong> ${data.numberOfPeople}</p>` : ""}
              ${data.durationDays ? `<p><strong>Durată:</strong> ${data.durationDays} zile</p>` : ""}
              ${data.budgetRange ? `<p><strong>Buget:</strong> ${data.budgetRange}</p>` : ""}
              ${data.languagePreference ? `<p><strong>Limbă preferată:</strong> ${data.languagePreference}</p>` : ""}
            </div>

            ${data.specialRequests ? `
            <div style="background: #ffffff; border: 1px solid #e5e7eb; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0;">Cerințe speciale:</h3>
              <p style="white-space: pre-wrap;">${data.specialRequests}</p>
            </div>
            ` : ""}

            <p><strong>Data primirii:</strong> ${new Date().toLocaleString("ro-RO")}</p>
            <p><strong>ID Cerere:</strong> ${data.id || "N/A"}</p>
          </div>
        `;
        break;

      case "newsletter":
        subject = `[ExplorăLumea] Abonare nouă newsletter: ${data.email}`;
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #16a34a;">Abonare nouă newsletter</h1>
            
            <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Email:</strong> <a href="mailto:${data.email}">${data.email}</a></p>
              ${data.fullName ? `<p><strong>Nume:</strong> ${data.fullName}</p>` : ""}
              ${data.source ? `<p><strong>Sursă:</strong> ${data.source}</p>` : ""}
              <p><strong>Status:</strong> ${data.status || "pending"}</p>
            </div>

            <p><strong>Data abonării:</strong> ${new Date().toLocaleString("ro-RO")}</p>
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
        from: "ExplorăLumea Notifications <onboarding@resend.dev>",
        to: [ADMIN_EMAIL],
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
    console.log("Admin notification sent successfully:", emailResult);

    return new Response(JSON.stringify({ success: true, data: emailResult }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-admin-notification function:", error);
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
