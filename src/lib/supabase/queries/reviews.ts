/**
 * Guide Reviews Queries
 * Functions for fetching guide reviews
 * NOTE: guide_reviews.user_id references auth.users, not profiles directly in some cases
 * We fetch profile data separately for reliability
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
      )
    `, { count: "exact" })
    .eq("guide_id", guideId)
    .eq("approved", true)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;

  // Enrich with user profile data
  const reviewsWithProfiles = await enrichReviewsWithProfiles(data || []);

  return { reviews: reviewsWithProfiles, count: count || 0 };
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
      )
    `, { count: "exact" })
    .order("created_at", { ascending: false });

  if (filters?.guideId) query = query.eq("guide_id", filters.guideId);
  if (filters?.approved !== undefined) query = query.eq("approved", filters.approved);
  if (filters?.rating) query = query.eq("rating", filters.rating);
  if (filters?.limit) {
    const offset = filters.offset || 0;
    query = query.range(offset, offset + filters.limit - 1);
  }

  const { data, error, count } = await query;
  if (error) throw error;

  const reviewsWithProfiles = await enrichReviewsWithProfiles(data || []);

  return { reviews: reviewsWithProfiles, count: count || 0 };
}

/**
 * Helper to enrich reviews with profile data (user who wrote the review)
 */
async function enrichReviewsWithProfiles(reviews: any[]) {
  if (reviews.length === 0) return reviews;

  const userIds = [...new Set(reviews.map(r => r.user_id))];

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name, avatar_url")
    .in("id", userIds);

  const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

  return reviews.map(review => ({
    ...review,
    profiles: profileMap.get(review.user_id) || null,
  }));
}

/**
 * Get pending reviews count
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
      )
    `)
    .eq("id", id)
    .single();

  if (error) throw error;

  const enriched = await enrichReviewsWithProfiles([data]);
  return enriched[0];
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
  if (total === 0) {
    return {
      average: 0,
      total: 0,
      distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    };
  }

  const sum = data.reduce((acc, r) => acc + r.rating, 0);
  const average = sum / total;
  const distribution = data.reduce((acc: Record<number, number>, r) => {
    acc[r.rating] = (acc[r.rating] || 0) + 1;
    return acc;
  }, { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });

  return { average, total, distribution };
}