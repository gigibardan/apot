/**
 * Community Challenges Queries
 */

import { supabase } from "@/integrations/supabase/client";

export async function getActiveChallenges() {
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("community_challenges")
    .select("*")
    .eq("active", true)
    .or(
      `start_date.is.null,start_date.lte.${now}`
    )
    .or(
      `end_date.is.null,end_date.gte.${now}`
    )
    .order("order_index", { ascending: true });

  if (error) throw error;

  return data || [];
}

export async function getUserChallenges(userId: string) {
  const { data, error } = await supabase
    .from("user_challenge_progress")
    .select(
      `
      *,
      challenge:community_challenges(*)
    `
    )
    .eq("user_id", userId)
    .order("completed", { ascending: true })
    .order("current_value", { ascending: false });

  if (error) throw error;

  return data || [];
}

export async function getUserChallengeProgress() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("user_challenge_progress")
    .select("*")
    .eq("user_id", user.id);

  if (error) throw error;
  return data || [];
}

export async function getChallengeLeaderboard(challengeId: string, limit = 10) {
  const { data, error } = await supabase
    .from("user_challenge_progress")
    .select(
      `
      *,
      user:profiles!user_challenge_progress_user_id_fkey(
        full_name,
        username,
        avatar_url
      )
    `
    )
    .eq("challenge_id", challengeId)
    .eq("completed", true)
    .order("completed_at", { ascending: true })
    .limit(limit);

  if (error) throw error;

  return data || [];
}
