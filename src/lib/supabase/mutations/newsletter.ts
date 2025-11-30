/**
 * Newsletter Mutations
 * Functions for managing newsletter subscriptions
 */

import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";

/**
 * Newsletter subscription validation schema
 */
export const newsletterSchema = z.object({
  email: z
    .string()
    .trim()
    .email({ message: "Adresă de email invalidă" })
    .max(255, { message: "Email-ul este prea lung" })
    .toLowerCase(),
  full_name: z
    .string()
    .trim()
    .min(2, { message: "Numele trebuie să aibă minim 2 caractere" })
    .max(100, { message: "Numele este prea lung" })
    .optional(),
});

export type NewsletterInput = z.infer<typeof newsletterSchema>;

/**
 * Generate confirmation token
 */
function generateConfirmToken(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15) +
         Date.now().toString(36);
}

/**
 * Subscribe to newsletter
 * With double opt-in for GDPR compliance
 */
export async function subscribeToNewsletter(input: NewsletterInput, source: string = "website") {
  try {
    // Validate input
    const validated = newsletterSchema.parse(input);
    
    // Check if already subscribed
    const { data: existing, error: checkError } = await supabase
      .from("newsletter_subscribers")
      .select("id, status")
      .eq("email", validated.email)
      .maybeSingle();

    if (checkError) throw checkError;

    // If already subscribed and active
    if (existing && existing.status === "active") {
      toast.info("Ești deja abonat la newsletter!");
      return { success: false, message: "already_subscribed" };
    }

    // If previously unsubscribed, reactivate
    if (existing && existing.status === "unsubscribed") {
      const { error: updateError } = await supabase
        .from("newsletter_subscribers")
        .update({
          status: "pending",
          confirm_token: generateConfirmToken(),
          subscribed_at: new Date().toISOString(),
          unsubscribed_at: null,
        })
        .eq("id", existing.id);

      if (updateError) throw updateError;

      toast.success("Te-ai re-abonat cu succes! Verifică-ți emailul pentru confirmare.");
      return { success: true, message: "resubscribed" };
    }

    // New subscription
    const confirmToken = generateConfirmToken();
    
    const { data, error } = await supabase
      .from("newsletter_subscribers")
      .insert({
        email: validated.email,
        full_name: validated.full_name || null,
        status: "pending",
        confirm_token: confirmToken,
        source,
      })
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        toast.error("Acest email este deja înregistrat");
        return { success: false, message: "duplicate" };
      }
      throw error;
    }

    // Send admin notification (async, non-blocking)
    supabase.functions
      .invoke("send-admin-notification", {
        body: {
          type: "newsletter",
          data: {
            email: validated.email,
            fullName: validated.full_name,
            source: source,
            status: "pending",
          },
        },
      })
      .then(({ error: notifError }) => {
        if (notifError) console.error("Failed to send admin notification:", notifError);
      });

    toast.success("Mulțumim! Verifică-ți emailul pentru a confirma abonarea.");
    return { success: true, data, message: "subscribed" };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0];
      toast.error(firstError.message);
      throw error;
    }
    
    console.error("Newsletter subscription error:", error);
    toast.error("A apărut o eroare. Te rugăm să încerci din nou.");
    throw error;
  }
}

/**
 * Confirm newsletter subscription
 */
export async function confirmSubscription(token: string) {
  try {
    const { data, error } = await supabase
      .from("newsletter_subscribers")
      .update({
        status: "active",
        confirmed_at: new Date().toISOString(),
        confirm_token: null,
      })
      .eq("confirm_token", token)
      .eq("status", "pending")
      .select()
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        toast.error("Link de confirmare invalid sau expirat");
        return { success: false, message: "invalid_token" };
      }
      throw error;
    }

    toast.success("Abonarea ta a fost confirmată cu succes!");
    return { success: true, data, message: "confirmed" };
  } catch (error) {
    console.error("Confirmation error:", error);
    toast.error("A apărut o eroare la confirmare");
    throw error;
  }
}

/**
 * Unsubscribe from newsletter
 */
export async function unsubscribeFromNewsletter(email: string) {
  try {
    const { data, error } = await supabase
      .from("newsletter_subscribers")
      .update({
        status: "unsubscribed",
        unsubscribed_at: new Date().toISOString(),
      })
      .eq("email", email.trim().toLowerCase())
      .eq("status", "active")
      .select()
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        toast.error("Email-ul nu a fost găsit sau nu este activ");
        return { success: false, message: "not_found" };
      }
      throw error;
    }

    toast.success("Te-ai dezabonat cu succes de la newsletter");
    return { success: true, data, message: "unsubscribed" };
  } catch (error) {
    console.error("Unsubscribe error:", error);
    toast.error("A apărut o eroare la dezabonare");
    throw error;
  }
}

/**
 * Admin: Bulk delete subscribers
 */
export async function bulkDeleteSubscribers(ids: string[]) {
  try {
    const { error } = await supabase
      .from("newsletter_subscribers")
      .delete()
      .in("id", ids);

    if (error) throw error;

    toast.success(`${ids.length} abonați șterși cu succes`);
    return { success: true };
  } catch (error) {
    console.error("Bulk delete error:", error);
    toast.error("Eroare la ștergerea abonaților");
    throw error;
  }
}

/**
 * Admin: Update subscriber status
 */
export async function updateSubscriberStatus(id: string, status: "pending" | "active" | "unsubscribed") {
  try {
    const { data, error } = await supabase
      .from("newsletter_subscribers")
      .update({ status })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    toast.success("Status actualizat cu succes");
    return { success: true, data };
  } catch (error) {
    console.error("Update status error:", error);
    toast.error("Eroare la actualizarea statusului");
    throw error;
  }
}
