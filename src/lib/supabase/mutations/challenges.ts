/**
 * Community Challenges Mutations
 */

import { supabase } from "@/integrations/supabase/client";
import { trackActivity, awardBadge, awardPoints } from "./social";

export async function updateChallengeProgress(
  challengeId: string,
  newValue: number
) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  // Get challenge details
  const { data: challenge } = await supabase
    .from("community_challenges")
    .select("*")
    .eq("id", challengeId)
    .single();

  if (!challenge) return;

  const completed = newValue >= challenge.target_value;

  // Upsert progress
  const { data, error } = await supabase
    .from("user_challenge_progress")
    .upsert(
      {
        user_id: user.id,
        challenge_id: challengeId,
        current_value: newValue,
        completed,
        completed_at: completed ? new Date().toISOString() : null,
      },
      {
        onConflict: "user_id,challenge_id",
      }
    )
    .select()
    .single();

  if (error) throw error;

  // Award rewards if just completed
  if (completed && !data.reward_claimed) {
    await claimChallengeReward(challengeId);
  }

  return data;
}

export async function claimChallengeReward(challengeId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // Get challenge and progress
  const { data: challenge } = await supabase
    .from("community_challenges")
    .select("*")
    .eq("id", challengeId)
    .single();

  const { data: progress } = await supabase
    .from("user_challenge_progress")
    .select("*")
    .eq("user_id", user.id)
    .eq("challenge_id", challengeId)
    .single();

  if (!challenge || !progress || !progress.completed) {
    throw new Error("Challenge not completed");
  }

  if (progress.reward_claimed) {
    throw new Error("Reward already claimed");
  }

  // Award rewards
  if (
    challenge.reward_type === "badge" ||
    challenge.reward_type === "both"
  ) {
    if (challenge.reward_badge_name) {
      await awardBadge(
        user.id,
        challenge.reward_badge_name,
        challenge.description,
        challenge.icon || "trophy"
      );
    }
  }

  if (
    challenge.reward_type === "points" ||
    challenge.reward_type === "both"
  ) {
    if (challenge.reward_points) {
      await awardPoints(user.id, challenge.reward_points);
    }
  }

  // Mark reward as claimed
  await supabase
    .from("user_challenge_progress")
    .update({ reward_claimed: true })
    .eq("user_id", user.id)
    .eq("challenge_id", challengeId);

  // Track activity
  await trackActivity("challenge_completed", "challenge", challengeId, {
    challenge_title: challenge.title,
  });

  return { success: true };
}
