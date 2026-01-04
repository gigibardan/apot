/**
 * Guide Reviews Mutations
 * Functions for creating, updating, and managing guide reviews
 */

import { supabase } from "@/integrations/supabase/client";

export interface ReviewInput {
  guide_id: string;
  rating: number;
  title?: string;
  comment?: string;
  travel_date?: string;
}

/**
 * Create a new review for a guide
 * One review per user per guide
 */
export async function createReview(data: ReviewInput) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("User must be authenticated to create a review");

  // Check if user already reviewed this guide
  const { data: existing } = await supabase
    .from("guide_reviews")
    .select("id")
    .eq("guide_id", data.guide_id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) {
    throw new Error("You have already reviewed this guide. You can edit your existing review.");
  }

  const { data: review, error } = await supabase
    .from("guide_reviews")
    .insert({
      ...data,
      user_id: user.id,
      approved: false, // Requires admin approval
    })
    .select()
    .single();

  if (error) throw error;
  return review;
}

/**
 * Update an existing review
 * Can only be edited within 48 hours by the owner
 */
export async function updateReview(id: string, data: Partial<ReviewInput>) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("User must be authenticated");

  // Verify ownership and time limit
  const { data: review } = await supabase
    .from("guide_reviews")
    .select("created_at, user_id")
    .eq("id", id)
    .single();

  if (!review) throw new Error("Review not found");
  if (review.user_id !== user.id) throw new Error("You can only edit your own reviews");

  const createdAt = new Date(review.created_at);
  const now = new Date();
  const hoursDiff = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);

  if (hoursDiff > 48) {
    throw new Error("Reviews can only be edited within 48 hours of creation");
  }

  const { data: updated, error } = await supabase
    .from("guide_reviews")
    .update({
      ...data,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return updated;
}

/**
 * Delete a review (admin version - no ownership check)
 */
export async function deleteReview(id: string) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("User must be authenticated");

  const { error } = await supabase.from("guide_reviews").delete().eq("id", id);

  if (error) throw error;
}

/**
 * Delete own review (user version - checks ownership)
 */
export async function deleteOwnReview(id: string) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("User must be authenticated");

  const { error } = await supabase
    .from("guide_reviews")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) throw error;
}

/**
 * Add guide response to a review
 * Only the guide can respond to their own reviews
 */
export async function addGuideResponse(reviewId: string, response: string, guideId: string) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("User must be authenticated");

  // Verify the review is for this guide
  const { data: review } = await supabase
    .from("guide_reviews")
    .select("guide_id")
    .eq("id", reviewId)
    .single();

  if (!review || review.guide_id !== guideId) {
    throw new Error("You can only respond to reviews for your guide profile");
  }

  const { data: updated, error } = await supabase
    .from("guide_reviews")
    .update({
      guide_response: response,
      guide_response_date: new Date().toISOString(),
    })
    .eq("id", reviewId)
    .select()
    .single();

  if (error) throw error;
  return updated;
}

/**
 * Admin: Approve review
 */
export async function approveReview(id: string) {
  const { data, error } = await supabase
    .from("guide_reviews")
    .update({ approved: true })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Admin: Reject/unpublish review
 */
export async function rejectReview(id: string) {
  const { data, error } = await supabase
    .from("guide_reviews")
    .update({ approved: false })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Admin: Bulk approve reviews
 */
export async function bulkApproveReviews(ids: string[]) {
  const { error } = await supabase
    .from("guide_reviews")
    .update({ approved: true })
    .in("id", ids);

  if (error) throw error;
}

/**
 * Admin: Bulk delete reviews
 */
export async function bulkDeleteReviews(ids: string[]) {
  const { error } = await supabase.from("guide_reviews").delete().in("id", ids);

  if (error) throw error;
}

/**
 * Check if user can review a guide
 */
export async function canReviewGuide(guideId: string): Promise<boolean> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return false;

  const { data } = await supabase
    .from("guide_reviews")
    .select("id")
    .eq("guide_id", guideId)
    .eq("user_id", user.id)
    .maybeSingle();

  return !data; // Can review if no existing review
}

/**
 * Get user's review for a guide
 */
export async function getUserReview(guideId: string) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from("guide_reviews")
    .select("*")
    .eq("guide_id", guideId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) throw error;
  return data;
}
