/**
 * Social Features Mutations
 * Follow system, activity tracking, points, badges
 */

import { supabase } from "@/integrations/supabase/client";

// =============================================
// FOLLOW SYSTEM
// =============================================

export async function followUser(userId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("user_follows")
    .insert({
      follower_id: user.id,
      following_id: userId,
    });

  if (error) throw error;

  // Award points
  await awardPoints(user.id, 1);
  
  return { success: true };
}

export async function unfollowUser(userId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("user_follows")
    .delete()
    .eq("follower_id", user.id)
    .eq("following_id", userId);

  if (error) throw error;
  
  return { success: true };
}

export async function toggleFollow(userId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // Check if already following
  const { data: existing } = await supabase
    .from("user_follows")
    .select("id")
    .eq("follower_id", user.id)
    .eq("following_id", userId)
    .single();

  if (existing) {
    return await unfollowUser(userId);
  } else {
    return await followUser(userId);
  }
}

// =============================================
// ACTIVITY TRACKING
// =============================================

export async function trackActivity(
  activityType: string,
  targetType: string,
  targetId: string,
  metadata?: Record<string, any>
) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { error } = await supabase
    .from("user_activity")
    .insert({
      user_id: user.id,
      activity_type: activityType,
      target_type: targetType,
      target_id: targetId,
      metadata: metadata || {},
    });

  if (error) console.error("Error tracking activity:", error);
}

// =============================================
// POINTS & GAMIFICATION
// =============================================

export async function awardPoints(userId: string, points: number) {
  const { error } = await supabase.rpc("award_points", {
    p_user_id: userId,
    p_points: points,
  });

  if (error) console.error("Error awarding points:", error);
}

export async function awardBadge(
  userId: string,
  badgeName: string,
  badgeDescription: string,
  badgeIcon: string
) {
  const { error } = await supabase.rpc("award_badge", {
    p_user_id: userId,
    p_badge_name: badgeName,
    p_badge_description: badgeDescription,
    p_badge_icon: badgeIcon,
  });

  if (error) console.error("Error awarding badge:", error);
}

// =============================================
// PROFILE UPDATES
// =============================================

export async function updateUserProfile(updates: {
  username?: string;
  bio?: string;
  avatar_url?: string;
  location?: string;
  website_url?: string;
  twitter_handle?: string;
  instagram_handle?: string;
  is_private?: boolean;
}) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", user.id);

  if (error) throw error;

  return { success: true };
}
