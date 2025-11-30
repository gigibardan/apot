/**
 * Objective Reviews Queries
 * Fetch and filter reviews for objectives
 */

import { supabase } from "@/integrations/supabase/client";

export interface ObjectiveReviewFilters {
  objectiveId?: string;
  approved?: boolean;
  minRating?: number;
  maxRating?: number;
  search?: string;
  page?: number;
  limit?: number;
}

/**
 * Get reviews for a specific objective
 */
export async function getObjectiveReviews(
  objectiveId: string,
  page = 1,
  limit = 10
) {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, error, count } = await supabase
    .from("reviews")
    .select(`
      *,
      profiles:user_id (
        full_name,
        avatar_url
      )
    `, { count: "exact" })
    .eq("objective_id", objectiveId)
    .eq("approved", true)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) throw error;

  return {
    reviews: data || [],
    total: count || 0,
    pages: Math.ceil((count || 0) / limit),
  };
}

/**
 * Get user's review for an objective
 */
export async function getUserObjectiveReview(objectiveId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return null;

  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("objective_id", objectiveId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) throw error;
  
  return data;
}

/**
 * Get review statistics for an objective
 */
export async function getObjectiveReviewStats(objectiveId: string) {
  const { data, error } = await supabase
    .from("reviews")
    .select("rating")
    .eq("objective_id", objectiveId)
    .eq("approved", true);

  if (error) throw error;

  const reviews = data || [];
  const totalReviews = reviews.length;
  
  if (totalReviews === 0) {
    return {
      averageRating: 0,
      totalReviews: 0,
      ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    };
  }

  const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
  const averageRating = sum / totalReviews;

  const ratingDistribution = reviews.reduce((acc, r) => {
    acc[r.rating] = (acc[r.rating] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);

  return {
    averageRating: Math.round(averageRating * 10) / 10,
    totalReviews,
    ratingDistribution,
  };
}

/**
 * Admin: Get all reviews with filters
 */
export async function getAllObjectiveReviews(filters: ObjectiveReviewFilters = {}) {
  const {
    objectiveId,
    approved,
    minRating,
    maxRating,
    search,
    page = 1,
    limit = 20,
  } = filters;

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from("reviews")
    .select(`
      *,
      objectives:objective_id (
        title,
        slug
      ),
      profiles:user_id (
        full_name,
        avatar_url
      )
    `, { count: "exact" });

  if (objectiveId) {
    query = query.eq("objective_id", objectiveId);
  }

  if (approved !== undefined) {
    query = query.eq("approved", approved);
  }

  if (minRating) {
    query = query.gte("rating", minRating);
  }

  if (maxRating) {
    query = query.lte("rating", maxRating);
  }

  if (search) {
    query = query.or(`title.ilike.%${search}%,comment.ilike.%${search}%`);
  }

  const { data, error, count } = await query
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) throw error;

  return {
    reviews: data || [],
    total: count || 0,
    pages: Math.ceil((count || 0) / limit),
  };
}

/**
 * Admin: Get pending reviews count
 */
export async function getPendingObjectiveReviewsCount() {
  const { count, error } = await supabase
    .from("reviews")
    .select("*", { count: "exact", head: true })
    .eq("approved", false);

  if (error) throw error;

  return count || 0;
}
