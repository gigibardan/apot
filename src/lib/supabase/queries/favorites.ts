/**
 * User Favorites Queries
 * Functions for fetching user favorite objectives
 */

import { supabase } from "@/integrations/supabase/client";

/**
 * Check if objective is favorited by current user
 */
export async function isFavorited(objectiveId: string): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return false;

  const { data, error } = await supabase
    .from("user_favorites")
    .select("id")
    .eq("user_id", user.id)
    .eq("objective_id", objectiveId)
    .maybeSingle();

  if (error) throw error;
  
  return !!data;
}

/**
 * Get all favorites for current user with full objective details
 */
export async function getUserFavorites() {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error("User not authenticated");
  }

  const { data, error } = await supabase
    .from("user_favorites")
    .select(`
      id,
      created_at,
      objectives:objective_id (
        id,
        title,
        slug,
        excerpt,
        featured_image,
        location_text,
        continent_id,
        country_id,
        continents:continent_id (name, slug),
        countries:country_id (name, slug, flag_emoji),
        views_count,
        likes_count
      )
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data;
}

/**
 * Get favorites count for current user
 */
export async function getFavoritesCount(): Promise<number> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return 0;

  const { count, error } = await supabase
    .from("user_favorites")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  if (error) throw error;
  
  return count || 0;
}

/**
 * Get most favorited objectives (for admin/stats)
 */
export async function getMostFavoritedObjectives(limit: number = 10) {
  const { data, error } = await supabase
    .from("user_favorites")
    .select(`
      objective_id,
      objectives:objective_id (
        id,
        title,
        slug,
        featured_image
      )
    `);

  if (error) throw error;

  // Count favorites per objective
  const favoriteCounts = data.reduce((acc, fav) => {
    const objId = fav.objective_id;
    acc[objId] = (acc[objId] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Get unique objectives with counts
  const objectivesMap = new Map();
  data.forEach((fav) => {
    if (fav.objectives && !objectivesMap.has(fav.objective_id)) {
      objectivesMap.set(fav.objective_id, {
        ...fav.objectives,
        favorites_count: favoriteCounts[fav.objective_id],
      });
    }
  });

  // Sort by count and limit
  return Array.from(objectivesMap.values())
    .sort((a, b) => b.favorites_count - a.favorites_count)
    .slice(0, limit);
}
