/**
 * Photo Contests Mutations
 */

import { supabase } from "@/integrations/supabase/client";
import { trackActivity } from "./social";

export async function submitToContest(submission: {
  contest_id: string;
  image_url: string;
  title: string;
  description?: string;
  objective_id?: string;
  accepted_terms: boolean;
}) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  if (!submission.accepted_terms) {
    throw new Error("You must accept the terms and conditions");
  }

  const { data, error } = await supabase
    .from("contest_submissions")
    .insert({
      contest_id: submission.contest_id,
      image_url: submission.image_url,
      title: submission.title,
      description: submission.description || null,
      objective_id: submission.objective_id || null,
      accepted_terms: submission.accepted_terms,
      user_id: user.id,
      status: 'pending',
    })
    .select()
    .single();

  if (error) throw error;

  // Track activity
  await trackActivity("contest_submitted", "contest", submission.contest_id, {
    submission_id: data.id,
    title: submission.title,
  });

  return data;
}

export async function voteForSubmission(
  contestId: string,
  submissionId: string
) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("contest_votes")
    .insert({
      contest_id: contestId,
      submission_id: submissionId,
      user_id: user.id,
    });

  if (error) throw error;

  return { success: true };
}

export async function removeVote(contestId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("contest_votes")
    .delete()
    .eq("contest_id", contestId)
    .eq("user_id", user.id);

  if (error) throw error;

  return { success: true };
}

export async function approveSubmission(
  submissionId: string,
  adminNotes?: string
) {
  const { data, error } = await supabase
    .rpc('approve_submission', {
      p_submission_id: submissionId,
      p_admin_notes: adminNotes || null,
    });

  if (error) throw error;

  return { success: data };
}

export async function rejectSubmission(
  submissionId: string,
  rejectionReason: string
) {
  if (!rejectionReason || rejectionReason.trim() === '') {
    throw new Error("Rejection reason is required");
  }

  const { data, error } = await supabase
    .rpc('reject_submission', {
      p_submission_id: submissionId,
      p_rejection_reason: rejectionReason,
    });

  if (error) throw error;

  return { success: data };
}

export async function removeSubmission(
  submissionId: string,
  reason: string
) {
  if (!reason || reason.trim() === '') {
    throw new Error("Removal reason is required");
  }

  const { data, error } = await supabase
    .rpc('remove_submission', {
      p_submission_id: submissionId,
      p_reason: reason,
    });

  if (error) throw error;

  return { success: data };
}

export async function setContestWinners(
  contestId: string,
  winners: { submission_id: string; rank: number }[]
) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // Update each winner
  for (const winner of winners) {
    await supabase
      .from("contest_submissions")
      .update({ winner_rank: winner.rank })
      .eq("id", winner.submission_id);
  }

  // Update contest status to ended
  await supabase
    .from("photo_contests")
    .update({ status: "ended" })
    .eq("id", contestId);

  return { success: true };
}
