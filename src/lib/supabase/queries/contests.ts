/**
 * Photo Contests Queries
 */

import { supabase } from "@/integrations/supabase/client";

export async function getActiveContest() {
  const { data, error } = await supabase
    .from("photo_contests")
    .select("*")
    .eq("status", "active")
    .single();

  if (error && error.code !== "PGRST116") throw error;

  return data;
}

export async function getVotingContests() {
  const { data, error } = await supabase
    .from("photo_contests")
    .select("*")
    .eq("status", "voting")
    .order("voting_end_date", { ascending: true });

  if (error) throw error;

  return data || [];
}

export async function getPastContests(limit = 10) {
  const { data, error } = await supabase
    .from("photo_contests")
    .select("*")
    .eq("status", "ended")
    .order("end_date", { ascending: false })
    .limit(limit);

  if (error) throw error;

  return data || [];
}

export async function getContestBySlug(slug: string) {
  const { data, error } = await supabase
    .from("photo_contests")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error) throw error;

  return data;
}

export async function getContestSubmissions(contestId: string, limit = 100) {
  const { data, error } = await supabase
    .from("contest_submissions")
    .select(
      `
      *,
      user:profiles!contest_submissions_user_id_fkey(
        full_name,
        username,
        avatar_url
      ),
      objective:objectives(
        title,
        slug
      )
    `
    )
    .eq("contest_id", contestId)
    .order("votes_count", { ascending: false })
    .limit(limit);

  if (error) throw error;

  return data || [];
}

export async function getUserVote(contestId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("contest_votes")
    .select("submission_id")
    .eq("contest_id", contestId)
    .eq("user_id", user.id)
    .single();

  if (error && error.code !== "PGRST116") throw error;

  return data?.submission_id || null;
}

export async function hasUserSubmitted(contestId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data, error } = await supabase
    .from("contest_submissions")
    .select("id")
    .eq("contest_id", contestId)
    .eq("user_id", user.id)
    .single();

  if (error && error.code !== "PGRST116") throw error;

  return !!data;
}
