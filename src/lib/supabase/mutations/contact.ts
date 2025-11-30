/**
 * Contact Forms Mutations
 * Functions for managing contact messages, objective inquiries, and guide booking requests
 */

import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";

/**
 * Contact Form Validation Schema
 */
export const contactFormSchema = z.object({
  full_name: z
    .string()
    .trim()
    .min(2, { message: "Numele trebuie să aibă minim 2 caractere" })
    .max(100, { message: "Numele este prea lung" }),
  email: z
    .string()
    .trim()
    .email({ message: "Adresă de email invalidă" })
    .max(255, { message: "Email-ul este prea lung" })
    .toLowerCase(),
  phone: z
    .string()
    .trim()
    .min(10, { message: "Numărul de telefon trebuie să aibă minim 10 cifre" })
    .max(20, { message: "Numărul de telefon este prea lung" })
    .optional()
    .or(z.literal("")),
  subject: z
    .string()
    .trim()
    .min(3, { message: "Subiectul trebuie să aibă minim 3 caractere" })
    .max(200, { message: "Subiectul este prea lung" }),
  message: z
    .string()
    .trim()
    .min(10, { message: "Mesajul trebuie să aibă minim 10 caractere" })
    .max(2000, { message: "Mesajul este prea lung (maxim 2000 caractere)" }),
});

/**
 * Objective Inquiry Validation Schema
 */
export const objectiveInquirySchema = z.object({
  objective_id: z.string().uuid({ message: "Obiectiv invalid" }),
  full_name: z
    .string()
    .trim()
    .min(2, { message: "Numele trebuie să aibă minim 2 caractere" })
    .max(100, { message: "Numele este prea lung" }),
  email: z
    .string()
    .trim()
    .email({ message: "Adresă de email invalidă" })
    .max(255, { message: "Email-ul este prea lung" })
    .toLowerCase(),
  phone: z
    .string()
    .trim()
    .max(20, { message: "Numărul de telefon este prea lung" })
    .optional()
    .or(z.literal("")),
  message: z
    .string()
    .trim()
    .min(10, { message: "Mesajul trebuie să aibă minim 10 caractere" })
    .max(1000, { message: "Mesajul este prea lung (maxim 1000 caractere)" }),
  visit_date: z.string().optional().or(z.literal("")),
  number_of_people: z.number().int().min(1).max(100).optional(),
});

/**
 * Guide Booking Request Validation Schema
 */
export const guideBookingSchema = z.object({
  guide_id: z.string().uuid({ message: "Ghid invalid" }),
  full_name: z
    .string()
    .trim()
    .min(2, { message: "Numele trebuie să aibă minim 2 caractere" })
    .max(100, { message: "Numele este prea lung" }),
  email: z
    .string()
    .trim()
    .email({ message: "Adresă de email invalidă" })
    .max(255, { message: "Email-ul este prea lung" })
    .toLowerCase(),
  phone: z
    .string()
    .trim()
    .min(10, { message: "Numărul de telefon trebuie să aibă minim 10 cifre" })
    .max(20, { message: "Numărul de telefon este prea lung" }),
  preferred_date: z.string().min(1, { message: "Data este obligatorie" }),
  number_of_people: z
    .number()
    .int()
    .min(1, { message: "Minim 1 persoană" })
    .max(50, { message: "Maxim 50 persoane" }),
  duration_days: z.number().int().min(1).max(30).optional(),
  destinations: z.array(z.string()).optional(),
  special_requests: z.string().trim().max(1000).optional().or(z.literal("")),
  budget_range: z.string().trim().max(100).optional().or(z.literal("")),
  language_preference: z.string().trim().max(50).optional().or(z.literal("")),
});

export type ContactFormInput = z.infer<typeof contactFormSchema>;
export type ObjectiveInquiryInput = z.infer<typeof objectiveInquirySchema>;
export type GuideBookingInput = z.infer<typeof guideBookingSchema>;

/**
 * Submit general contact form
 */
export async function submitContactForm(input: ContactFormInput) {
  try {
    const validated = contactFormSchema.parse(input);

    const { data: { user } } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from("contact_messages")
      .insert({
        full_name: validated.full_name,
        email: validated.email,
        phone: validated.phone || null,
        subject: validated.subject,
        message: validated.message,
        user_id: user?.id || null,
        status: "new",
      })
      .select()
      .single();

    if (error) throw error;

    // Send confirmation email to user (async, non-blocking)
    supabase.functions
      .invoke("send-confirmation-email", {
        body: {
          type: "contact",
          recipientEmail: validated.email,
          recipientName: validated.full_name,
          data: { subject: validated.subject },
        },
      })
      .then(({ error: emailError }) => {
        if (emailError) console.error("Failed to send confirmation email:", emailError);
      });

    // Send admin notification (async, non-blocking)
    supabase.functions
      .invoke("send-admin-notification", {
        body: {
          type: "contact",
          data: {
            id: data.id,
            fullName: validated.full_name,
            email: validated.email,
            phone: validated.phone,
            subject: validated.subject,
            message: validated.message,
          },
        },
      })
      .then(({ error: notifError }) => {
        if (notifError) console.error("Failed to send admin notification:", notifError);
      });

    toast.success("Mesajul a fost trimis cu succes! Vă vom răspunde în cel mai scurt timp.");
    return { success: true, data };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0];
      toast.error(firstError.message);
      throw error;
    }

    console.error("Contact form submission error:", error);
    toast.error("A apărut o eroare la trimiterea mesajului. Te rugăm să încerci din nou.");
    throw error;
  }
}

/**
 * Submit objective inquiry
 */
export async function submitObjectiveInquiry(input: ObjectiveInquiryInput) {
  try {
    const validated = objectiveInquirySchema.parse(input);

    const { data: { user } } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from("objective_inquiries")
      .insert({
        objective_id: validated.objective_id,
        full_name: validated.full_name,
        email: validated.email,
        phone: validated.phone || null,
        message: validated.message,
        visit_date: validated.visit_date || null,
        number_of_people: validated.number_of_people || null,
        user_id: user?.id || null,
        status: "new",
      })
      .select()
      .single();

    if (error) throw error;

    // Get objective title - we need to pass it separately
    const objectiveTitle = (input as any).objectiveTitle || "Obiectiv";

    // Send confirmation email to user (async, non-blocking)
    supabase.functions
      .invoke("send-confirmation-email", {
        body: {
          type: "objective_inquiry",
          recipientEmail: validated.email,
          recipientName: validated.full_name,
          data: {
            objectiveTitle,
            visitDate: validated.visit_date,
            numberOfPeople: validated.number_of_people,
          },
        },
      })
      .then(({ error: emailError }) => {
        if (emailError) console.error("Failed to send confirmation email:", emailError);
      });

    // Send admin notification (async, non-blocking)
    supabase.functions
      .invoke("send-admin-notification", {
        body: {
          type: "objective_inquiry",
          data: {
            id: data.id,
            objectiveTitle,
            fullName: validated.full_name,
            email: validated.email,
            phone: validated.phone,
            visitDate: validated.visit_date,
            numberOfPeople: validated.number_of_people,
            message: validated.message,
          },
        },
      })
      .then(({ error: notifError }) => {
        if (notifError) console.error("Failed to send admin notification:", notifError);
      });

    toast.success("Întrebarea a fost trimisă cu succes! Vă vom răspunde în curând.");
    return { success: true, data };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0];
      toast.error(firstError.message);
      throw error;
    }

    console.error("Objective inquiry submission error:", error);
    toast.error("A apărut o eroare. Te rugăm să încerci din nou.");
    throw error;
  }
}

/**
 * Submit guide booking request
 */
export async function submitGuideBookingRequest(input: GuideBookingInput) {
  try {
    const validated = guideBookingSchema.parse(input);

    const { data: { user } } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from("guide_booking_requests")
      .insert({
        guide_id: validated.guide_id,
        full_name: validated.full_name,
        email: validated.email,
        phone: validated.phone,
        preferred_date: validated.preferred_date,
        number_of_people: validated.number_of_people,
        duration_days: validated.duration_days || null,
        destinations: validated.destinations || null,
        special_requests: validated.special_requests || null,
        budget_range: validated.budget_range || null,
        language_preference: validated.language_preference || null,
        user_id: user?.id || null,
        status: "pending",
      })
      .select()
      .single();

    if (error) throw error;

    // Get guide name - we need to pass it separately
    const guideName = (input as any).guideName || "Ghid";

    // Send confirmation email to user (async, non-blocking)
    supabase.functions
      .invoke("send-confirmation-email", {
        body: {
          type: "guide_booking",
          recipientEmail: validated.email,
          recipientName: validated.full_name,
          data: {
            guideName,
            preferredDate: validated.preferred_date,
            numberOfPeople: validated.number_of_people,
            durationDays: validated.duration_days,
          },
        },
      })
      .then(({ error: emailError }) => {
        if (emailError) console.error("Failed to send confirmation email:", emailError);
      });

    // Send admin notification (async, non-blocking)
    supabase.functions
      .invoke("send-admin-notification", {
        body: {
          type: "guide_booking",
          data: {
            id: data.id,
            guideName,
            fullName: validated.full_name,
            email: validated.email,
            phone: validated.phone,
            preferredDate: validated.preferred_date,
            numberOfPeople: validated.number_of_people,
            durationDays: validated.duration_days,
            budgetRange: validated.budget_range,
            languagePreference: validated.language_preference,
            specialRequests: validated.special_requests,
          },
        },
      })
      .then(({ error: notifError }) => {
        if (notifError) console.error("Failed to send admin notification:", notifError);
      });

    toast.success("Cererea de rezervare a fost trimisă! Vă vom contacta în cel mai scurt timp.");
    return { success: true, data };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0];
      toast.error(firstError.message);
      throw error;
    }

    console.error("Booking request submission error:", error);
    toast.error("A apărut o eroare. Te rugăm să încerci din nou.");
    throw error;
  }
}

/**
 * Admin: Update contact message status
 */
export async function updateContactMessageStatus(
  id: string,
  status: "new" | "read" | "replied" | "archived",
  adminNotes?: string
) {
  try {
    const updateData: any = { status };

    if (status === "read" && adminNotes === undefined) {
      updateData.read_at = new Date().toISOString();
    }

    if (status === "replied") {
      updateData.replied_at = new Date().toISOString();
    }

    if (adminNotes !== undefined) {
      updateData.admin_notes = adminNotes;
    }

    const { data, error } = await supabase
      .from("contact_messages")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    toast.success("Status actualizat cu succes");
    return { success: true, data };
  } catch (error) {
    console.error("Update contact message error:", error);
    toast.error("Eroare la actualizarea statusului");
    throw error;
  }
}

/**
 * Admin: Update objective inquiry status
 */
export async function updateObjectiveInquiryStatus(
  id: string,
  status: "new" | "read" | "replied" | "archived",
  adminNotes?: string
) {
  try {
    const updateData: any = { status };

    if (status === "read" && adminNotes === undefined) {
      updateData.read_at = new Date().toISOString();
    }

    if (status === "replied") {
      updateData.replied_at = new Date().toISOString();
    }

    if (adminNotes !== undefined) {
      updateData.admin_notes = adminNotes;
    }

    const { data, error } = await supabase
      .from("objective_inquiries")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    toast.success("Status actualizat cu succes");
    return { success: true, data };
  } catch (error) {
    console.error("Update inquiry error:", error);
    toast.error("Eroare la actualizarea statusului");
    throw error;
  }
}

/**
 * Admin: Update guide booking request status
 */
export async function updateGuideBookingStatus(
  id: string,
  status: "pending" | "contacted" | "confirmed" | "cancelled" | "completed",
  adminNotes?: string
) {
  try {
    const updateData: any = { status };

    if (status === "contacted" && adminNotes === undefined) {
      updateData.read_at = new Date().toISOString();
    }

    if (status === "confirmed") {
      updateData.replied_at = new Date().toISOString();
    }

    if (adminNotes !== undefined) {
      updateData.admin_notes = adminNotes;
    }

    const { data, error } = await supabase
      .from("guide_booking_requests")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    toast.success("Status actualizat cu succes");
    return { success: true, data };
  } catch (error) {
    console.error("Update booking error:", error);
    toast.error("Eroare la actualizarea statusului");
    throw error;
  }
}

/**
 * Admin: Bulk delete contact messages
 */
export async function bulkDeleteContactMessages(ids: string[]) {
  try {
    const { error } = await supabase
      .from("contact_messages")
      .delete()
      .in("id", ids);

    if (error) throw error;

    toast.success(`${ids.length} mesaje șterse cu succes`);
    return { success: true };
  } catch (error) {
    console.error("Bulk delete error:", error);
    toast.error("Eroare la ștergerea mesajelor");
    throw error;
  }
}
