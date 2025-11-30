/**
 * Objective Suggestions Queries
 */

import { supabase } from "@/integrations/supabase/client";

export async function getPendingSuggestions(page = 1, limit = 20) {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, error, count } = await supabase
    .from("objective_suggestions")
    .select(
      `
      *,
      user:profiles!objective_suggestions_user_id_fkey(
        full_name,
        username,
        avatar_url
      )
    `,
      { count: "exact" }
    )
    .eq("status", "pending")
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) throw error;

  return {
    suggestions: data || [],
    total: count || 0,
    hasMore: (count || 0) > to + 1,
  };
}

export async function getUserSuggestions(userId: string, page = 1, limit = 20) {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, error, count } = await supabase
    .from("objective_suggestions")
    .select("*", { count: "exact" })
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) throw error;

  return {
    suggestions: data || [],
    total: count || 0,
    hasMore: (count || 0) > to + 1,
  };
}

export async function getSuggestionById(id: string) {
  const { data, error } = await supabase
    .from("objective_suggestions")
    .select(
      `
      *,
      user:profiles!objective_suggestions_user_id_fkey(
        full_name,
        username,
        avatar_url
      )
    `
    )
    .eq("id", id)
    .single();

  if (error) throw error;

  return data;
}
