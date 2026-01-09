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

export async function getContestSubmissions(contestId: string, isAdmin = false, limit = 100) {
  let query = supabase
    .from("contest_submissions")
    .select(`
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
    `)
    .eq("contest_id", contestId)
    .order("votes_count", { ascending: false })
    .limit(limit);

  // If not admin, only show approved submissions
  if (!isAdmin) {
    query = query.eq("status", "approved");
  }

  const { data, error } = await query;

  if (error) throw error;

  return data || [];
}

export async function getPendingSubmissions(contestId: string) {
  const { data, error } = await supabase
    .from("contest_submissions")
    .select(`
      *,
      user:profiles!contest_submissions_user_id_fkey(
        id,
        full_name,
        username,
        avatar_url
      )
    `)
    .eq("contest_id", contestId)
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data || [];
}

export async function getAllContestSubmissions(contestId: string, statusFilter?: string) {
  let query = supabase
    .from("contest_submissions")
    .select(`
      *,
      user:profiles!contest_submissions_user_id_fkey(
        id,
        full_name,
        username,
        avatar_url
      )
    `)
    .eq("contest_id", contestId)
    .order("created_at", { ascending: false });

  if (statusFilter) {
    query = query.eq("status", statusFilter);
  }

  const { data, error } = await query;

  if (error) throw error;

  return data || [];
}

export async function getUserSubmissionStatus(contestId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("contest_submissions")
    .select("id, status, rejection_reason, title, image_url, created_at, votes_count, winner_rank")
    .eq("contest_id", contestId)
    .eq("user_id", user.id)
    .single();

  if (error && error.code !== "PGRST116") throw error;

  return data;
}

export async function getContestStats(contestId: string) {
  const { data, error } = await supabase
    .rpc('get_contest_submission_stats', {
      p_contest_id: contestId,
    });

  if (error) throw error;

  return data as {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    removed: number;
  };
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
