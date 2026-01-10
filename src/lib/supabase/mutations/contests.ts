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
}) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("contest_submissions")
    .insert({
      ...submission,
      user_id: user.id,
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

  // TODO: Send notifications to winners
  // TODO: Award badges/points to winners

  return { success: true };
}
