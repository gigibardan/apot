/**
 * Contact Forms Queries
 * Functions for fetching contact messages, inquiries, and booking requests
 */

import { supabase } from "@/integrations/supabase/client";

/**
 * Get all contact messages (admin)
 */
export async function getContactMessages(
  status?: "new" | "read" | "replied" | "archived",
  limit: number = 50,
  offset: number = 0
) {
  let query = supabase
    .from("contact_messages")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (status) {
    query = query.eq("status", status);
  }

  const { data, error, count } = await query;

  if (error) throw error;

  return { data, count: count || 0 };
}

/**
 * Get single contact message by ID
 */
export async function getContactMessageById(id: string) {
  const { data, error } = await supabase
    .from("contact_messages")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;

  return data;
}

/**
 * Get contact messages statistics
 */
export async function getContactMessagesStats() {
  const { data, error } = await supabase
    .from("contact_messages")
    .select("status");

  if (error) throw error;

  const stats = {
    total: data.length,
    new: data.filter((m) => m.status === "new").length,
    read: data.filter((m) => m.status === "read").length,
    replied: data.filter((m) => m.status === "replied").length,
    archived: data.filter((m) => m.status === "archived").length,
  };

  return stats;
}

/**
 * Get all objective inquiries (admin)
 */
export async function getObjectiveInquiries(
  status?: "new" | "read" | "replied" | "archived",
  objectiveId?: string,
  limit: number = 50,
  offset: number = 0
) {
  let query = supabase
    .from("objective_inquiries")
    .select(
      `
      *,
      objectives:objective_id (
        id,
        title,
        slug,
        featured_image
      )
    `,
      { count: "exact" }
    )
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (status) {
    query = query.eq("status", status);
  }

  if (objectiveId) {
    query = query.eq("objective_id", objectiveId);
  }

  const { data, error, count } = await query;

  if (error) throw error;

  return { data, count: count || 0 };
}

/**
 * Get objective inquiries statistics
 */
export async function getObjectiveInquiriesStats() {
  const { data, error } = await supabase
    .from("objective_inquiries")
    .select("status");

  if (error) throw error;

  const stats = {
    total: data.length,
    new: data.filter((i) => i.status === "new").length,
    read: data.filter((i) => i.status === "read").length,
    replied: data.filter((i) => i.status === "replied").length,
    archived: data.filter((i) => i.status === "archived").length,
  };

  return stats;
}

/**
 * Get all guide booking requests (admin)
 */
export async function getGuideBookingRequests(
  status?: "pending" | "contacted" | "confirmed" | "cancelled" | "completed",
  guideId?: string,
  limit: number = 50,
  offset: number = 0
) {
  let query = supabase
    .from("guide_booking_requests")
    .select(
      `
      *,
      guides:guide_id (
        id,
        full_name,
        slug,
        profile_image,
        phone,
        email,
        whatsapp
      )
    `,
      { count: "exact" }
    )
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (status) {
    query = query.eq("status", status);
  }

  if (guideId) {
    query = query.eq("guide_id", guideId);
  }

  const { data, error, count } = await query;

  if (error) throw error;

  return { data, count: count || 0 };
}

/**
 * Get guide booking requests statistics
 */
export async function getGuideBookingRequestsStats() {
  const { data, error } = await supabase
    .from("guide_booking_requests")
    .select("status");

  if (error) throw error;

  const stats = {
    total: data.length,
    pending: data.filter((r) => r.status === "pending").length,
    contacted: data.filter((r) => r.status === "contacted").length,
    confirmed: data.filter((r) => r.status === "confirmed").length,
    cancelled: data.filter((r) => r.status === "cancelled").length,
    completed: data.filter((r) => r.status === "completed").length,
  };

  return stats;
}

/**
 * Get recent inquiries count (for dashboard)
 */
export async function getRecentInquiriesCount(days: number = 7) {
  const dateFrom = new Date();
  dateFrom.setDate(dateFrom.getDate() - days);

  const [messages, inquiries, bookings] = await Promise.all([
    supabase
      .from("contact_messages")
      .select("id", { count: "exact", head: true })
      .gte("created_at", dateFrom.toISOString()),
    supabase
      .from("objective_inquiries")
      .select("id", { count: "exact", head: true })
      .gte("created_at", dateFrom.toISOString()),
    supabase
      .from("guide_booking_requests")
      .select("id", { count: "exact", head: true })
      .gte("created_at", dateFrom.toISOString()),
  ]);

  return {
    messages: messages.count || 0,
    inquiries: inquiries.count || 0,
    bookings: bookings.count || 0,
    total: (messages.count || 0) + (inquiries.count || 0) + (bookings.count || 0),
  };
}
