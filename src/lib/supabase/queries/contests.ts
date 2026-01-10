/**
 * Photo Contests Queries - NO RELATIONS VERSION
 */

import { supabase } from "@/integrations/supabase/client";

export async function getActiveContest() {
  const { data, error } = await supabase
    .from("photo_contests")
    .select("*")
    .eq("status", "active")
    .maybeSingle();

  if (error && error.code !== "PGRST116") throw error;

  return data;
}

export async function getVotingContests() {
  const { data, error } = await supabase
    .from("photo_contests")
    .select("*")
    .eq("status", "voting");

  if (error) throw error;

  return data || [];
}

export async function getPastContests(limit = 10) {
  const { data, error } = await supabase
    .from("photo_contests")
    .select("*")
    .eq("status", "ended")
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

// NO RELATIONS - fetch profiles separately
export async function getContestSubmissions(contestId: string, isAdmin = false, limit = 100) {
  let query = supabase
    .from("contest_submissions")
    .select("*")
    .eq("contest_id", contestId);

  if (!isAdmin) {
    query = query.eq("status", "approved");
  }

  const { data: submissions, error } = await query.limit(limit);

  if (error) throw error;
  if (!submissions || submissions.length === 0) return [];

  // Fetch profiles separately
  const userIds = [...new Set(submissions.map(s => s.user_id))];
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name, username, avatar_url")
    .in("id", userIds);

  // Merge data
  return submissions.map(sub => ({
    ...sub,
    user: profiles?.find(p => p.id === sub.user_id) || null,
    objective: null
  })).sort((a, b) => (b.votes_count || 0) - (a.votes_count || 0));
}

// NO RELATIONS
export async function getPendingSubmissions(contestId: string) {
  const { data: submissions, error } = await supabase
    .from("contest_submissions")
    .select("*")
    .eq("contest_id", contestId)
    .eq("status", "pending");

  if (error) throw error;
  if (!submissions || submissions.length === 0) return [];

  // Fetch profiles separately
  const userIds = [...new Set(submissions.map(s => s.user_id))];
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name, username, avatar_url")
    .in("id", userIds);

  // Merge and sort
  return submissions.map(sub => ({
    ...sub,
    user: profiles?.find(p => p.id === sub.user_id) || null
  })).sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

// NO RELATIONS
export async function getAllContestSubmissions(contestId: string, statusFilter?: string) {
  let query = supabase
    .from("contest_submissions")
    .select("*")
    .eq("contest_id", contestId);

  if (statusFilter) {
    query = query.eq("status", statusFilter);
  }

  const { data: submissions, error } = await query;

  if (error) throw error;
  if (!submissions || submissions.length === 0) return [];

  // Fetch profiles
  const userIds = [...new Set(submissions.map(s => s.user_id))];
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name, username, avatar_url")
    .in("id", userIds);

  // Merge and sort
  return submissions.map(sub => ({
    ...sub,
    user: profiles?.find(p => p.id === sub.user_id) || null
  })).sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

export async function getUserSubmissionStatus(contestId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("contest_submissions")
    .select("id, status, rejection_reason, title, image_url, created_at, votes_count, winner_rank")
    .eq("contest_id", contestId)
    .eq("user_id", user.id)
    .maybeSingle();

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
    .maybeSingle();

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
    .maybeSingle();

  if (error && error.code !== "PGRST116") throw error;

  return !!data;
}