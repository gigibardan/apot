/**
 * Objective Reviews Mutations
 * Handles CRUD operations for objective reviews
 */

import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ObjectiveReviewInput {
  objective_id: string;
  rating: number;
  title?: string;
  comment?: string;
  travel_date?: string;
}

/**
 * Create a new review for an objective
 */
export async function createObjectiveReview(data: ObjectiveReviewInput) {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error("You must be logged in to submit a review");
  }

  // Check if user already reviewed this objective
  const { data: existing } = await supabase
    .from("reviews")
    .select("id")
    .eq("objective_id", data.objective_id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) {
    throw new Error("You have already reviewed this objective");
  }

  const { data: review, error } = await supabase
    .from("reviews")
    .insert({
      ...data,
      user_id: user.id,
      approved: false, // Reviews need approval
    })
    .select()
    .single();

  if (error) throw error;
  
  toast.success("Review submitted successfully! It will appear after approval.");
  return review;
}

/**
 * Update an existing review (within 48 hours)
 */
export async function updateObjectiveReview(
  reviewId: string,
  data: Partial<ObjectiveReviewInput>
) {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error("You must be logged in");
  }

  // Check if review exists and belongs to user
  const { data: existingReview } = await supabase
    .from("reviews")
    .select("created_at, user_id")
    .eq("id", reviewId)
    .single();

  if (!existingReview || existingReview.user_id !== user.id) {
    throw new Error("Review not found or you don't have permission");
  }

  // Check 48 hour window
  const hoursSinceCreation = 
    (Date.now() - new Date(existingReview.created_at).getTime()) / (1000 * 60 * 60);
  
  if (hoursSinceCreation > 48) {
    throw new Error("Reviews can only be edited within 48 hours");
  }

  const { data: review, error } = await supabase
    .from("reviews")
    .update(data)
    .eq("id", reviewId)
    .select()
    .single();

  if (error) throw error;
  
  toast.success("Review updated successfully!");
  return review;
}

/**
 * Delete a review
 */
export async function deleteObjectiveReview(reviewId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error("You must be logged in");
  }

  const { error } = await supabase
    .from("reviews")
    .delete()
    .eq("id", reviewId)
    .eq("user_id", user.id);

  if (error) throw error;
  
  toast.success("Review deleted successfully");
}

/**
 * Admin: Approve a review
 */
export async function approveObjectiveReview(reviewId: string) {
  const { error } = await supabase
    .from("reviews")
    .update({ approved: true })
    .eq("id", reviewId);

  if (error) throw error;
  
  toast.success("Review approved");
}

/**
 * Admin: Reject/Delete a review
 */
export async function rejectObjectiveReview(reviewId: string) {
  const { error } = await supabase
    .from("reviews")
    .delete()
    .eq("id", reviewId);

  if (error) throw error;
  
  toast.success("Review rejected");
}

/**
 * Admin: Bulk approve reviews
 */
export async function bulkApproveObjectiveReviews(reviewIds: string[]) {
  const { error } = await supabase
    .from("reviews")
    .update({ approved: true })
    .in("id", reviewIds);

  if (error) throw error;
  
  toast.success(`${reviewIds.length} reviews approved`);
}

/**
 * Admin: Bulk delete reviews
 */
export async function bulkDeleteObjectiveReviews(reviewIds: string[]) {
  const { error } = await supabase
    .from("reviews")
    .delete()
    .in("id", reviewIds);

  if (error) throw error;
  
  toast.success(`${reviewIds.length} reviews deleted`);
}
