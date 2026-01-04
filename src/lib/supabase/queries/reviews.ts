/**
 * Guide Reviews Queries
 * Functions for fetching guide reviews
 */

import { supabase } from "@/integrations/supabase/client";

export interface ReviewFilters {
  guideId?: string;
  approved?: boolean;
  rating?: number;
  limit?: number;
  offset?: number;
}

/**
 * Get reviews for a guide (public - only approved)
 */
export async function getGuideReviews(guideId: string, limit: number = 10, offset: number = 0) {
  const { data, error, count } = await supabase
    .from("guide_reviews")
    .select(`
      *,
      guides!guide_reviews_guide_id_fkey (
        id,
        full_name,
        slug
      ),
      profiles!guide_reviews_user_id_fkey (
        id,
        full_name,
        avatar_url
      )
    `, { count: "exact" })
    .eq("guide_id", guideId)
    .eq("approved", true)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;
  
  return { reviews: data || [], count: count || 0 };
}

/**
 * Get all reviews (admin - includes pending)
 */
export async function getAllReviews(filters?: ReviewFilters) {
  let query = supabase
    .from("guide_reviews")
    .select(`
      *,
      guides!guide_reviews_guide_id_fkey (
        id,
        full_name,
        slug
      ),
      profiles!guide_reviews_user_id_fkey (
        id,
        full_name,
        avatar_url
      )
    `, { count: "exact" })
    .order("created_at", { ascending: false });

  if (filters?.guideId) {
    query = query.eq("guide_id", filters.guideId);
  }

  if (filters?.approved !== undefined) {
    query = query.eq("approved", filters.approved);
  }

  if (filters?.rating) {
    query = query.eq("rating", filters.rating);
  }

  if (filters?.limit) {
    const offset = filters.offset || 0;
    query = query.range(offset, offset + filters.limit - 1);
  }

  const { data, error, count } = await query;

  if (error) throw error;
  
  return { reviews: data || [], count: count || 0 };
}

/**
 * Get pending reviews count (for admin badge)
 */
export async function getPendingReviewsCount() {
  const { count, error } = await supabase
    .from("guide_reviews")
    .select("*", { count: "exact", head: true })
    .eq("approved", false);

  if (error) throw error;
  return count || 0;
}

/**
 * Get review by ID
 */
export async function getReviewById(id: string) {
  const { data, error } = await supabase
    .from("guide_reviews")
    .select(`
      *,
      guides!guide_reviews_guide_id_fkey (
        id,
        full_name,
        slug
      ),
      profiles!guide_reviews_user_id_fkey (
        id,
        full_name,
        avatar_url
      )
    `)
    .eq("id", id)
    .single();

  if (error) throw error;
  
  return data;
}

/**
 * Get review statistics for a guide
 */
export async function getGuideReviewStats(guideId: string) {
  const { data, error } = await supabase
    .from("guide_reviews")
    .select("rating")
    .eq("guide_id", guideId)
    .eq("approved", true);

  if (error) throw error;

  const total = data.length;
  if (total === 0)
    return {
      average: 0,
      total: 0,
      distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    };

  const sum = data.reduce((acc, review) => acc + review.rating, 0);
  const average = sum / total;

  const distribution = data.reduce(
    (acc, review) => {
      acc[review.rating]++;
      return acc;
    },
    { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } as Record<number, number>
  );

  return { average, total, distribution };
}