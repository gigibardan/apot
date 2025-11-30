/**
 * Newsletter Queries
 * Functions for fetching newsletter data
 */

import { supabase } from "@/integrations/supabase/client";

export interface NewsletterFilters {
  status?: "pending" | "active" | "unsubscribed";
  search?: string;
  source?: string;
  page?: number;
  limit?: number;
}

/**
 * Get all newsletter subscribers (Admin only)
 */
export async function getNewsletterSubscribers(filters: NewsletterFilters = {}) {
  const {
    status,
    search,
    source,
    page = 1,
    limit = 20,
  } = filters;

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from("newsletter_subscribers")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false });

  if (status) {
    query = query.eq("status", status);
  }

  if (source) {
    query = query.eq("source", source);
  }

  if (search) {
    query = query.or(`email.ilike.%${search}%,full_name.ilike.%${search}%`);
  }

  const { data, error, count } = await query.range(from, to);

  if (error) throw error;

  return {
    subscribers: data || [],
    total: count || 0,
    pages: Math.ceil((count || 0) / limit),
  };
}

/**
 * Get subscriber by email
 */
export async function getSubscriberByEmail(email: string) {
  const { data, error } = await supabase
    .from("newsletter_subscribers")
    .select("*")
    .eq("email", email.trim().toLowerCase())
    .maybeSingle();

  if (error) throw error;

  return data;
}

/**
 * Get subscriber by token
 */
export async function getSubscriberByToken(token: string) {
  const { data, error } = await supabase
    .from("newsletter_subscribers")
    .select("*")
    .eq("confirm_token", token)
    .maybeSingle();

  if (error) throw error;

  return data;
}

/**
 * Get newsletter statistics
 */
export async function getNewsletterStats() {
  // Get counts by status
  const { data: statusData, error: statusError } = await supabase
    .from("newsletter_subscribers")
    .select("status");

  if (statusError) throw statusError;

  const stats = {
    total: statusData.length,
    active: statusData.filter(s => s.status === "active").length,
    pending: statusData.filter(s => s.status === "pending").length,
    unsubscribed: statusData.filter(s => s.status === "unsubscribed").length,
  };

  // Get growth data (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { data: recentData, error: recentError } = await supabase
    .from("newsletter_subscribers")
    .select("subscribed_at")
    .gte("subscribed_at", thirtyDaysAgo.toISOString())
    .order("subscribed_at", { ascending: true });

  if (recentError) throw recentError;

  // Group by day
  const growthByDay = recentData.reduce((acc, sub) => {
    const date = new Date(sub.subscribed_at).toISOString().split("T")[0];
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return {
    ...stats,
    recentGrowth: recentData.length,
    growthByDay,
  };
}

/**
 * Check if email is subscribed
 */
export async function isEmailSubscribed(email: string): Promise<boolean> {
  const { data, error } = await supabase
    .from("newsletter_subscribers")
    .select("id")
    .eq("email", email.trim().toLowerCase())
    .eq("status", "active")
    .maybeSingle();

  if (error) {
    console.error("Error checking subscription:", error);
    return false;
  }

  return !!data;
}

/**
 * Get sources statistics
 */
export async function getSourcesStats() {
  const { data, error } = await supabase
    .from("newsletter_subscribers")
    .select("source, status");

  if (error) throw error;

  const sourceStats = data.reduce((acc, sub) => {
    const source = sub.source || "unknown";
    if (!acc[source]) {
      acc[source] = { total: 0, active: 0, pending: 0, unsubscribed: 0 };
    }
    acc[source].total++;
    acc[source][sub.status]++;
    return acc;
  }, {} as Record<string, { total: number; active: number; pending: number; unsubscribed: number }>);

  return sourceStats;
}
