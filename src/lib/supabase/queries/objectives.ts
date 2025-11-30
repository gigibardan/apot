/**
 * Objectives Queries
 * Query functions for tourist objectives with advanced filtering
 */

import { supabase } from "@/integrations/supabase/client";
import type { Objective, ObjectiveWithRelations } from "@/types/database.types";

export interface ObjectiveFilters {
  continent?: string;
  country?: string;
  types?: string[];
  unesco?: boolean;
  featured?: boolean;
  search?: string;
  published?: boolean;
  limit?: number;
  offset?: number;
  sortBy?: "created_at" | "views_count" | "title" | "published_at";
  sortOrder?: "asc" | "desc";
}

export interface ObjectivesResult {
  data: ObjectiveWithRelations[];
  count: number;
  hasMore: boolean;
}

/**
 * Get objectives with advanced filtering and pagination
 */
export async function getObjectives(
  filters: ObjectiveFilters = {}
): Promise<ObjectivesResult> {
  const {
    continent,
    country,
    types,
    unesco,
    featured,
    search,
    published = true,
    limit = 12,
    offset = 0,
    sortBy = "created_at",
    sortOrder = "desc",
  } = filters;

  let query = supabase
    .from("objectives")
    .select(
      `
      *,
      continent:continents(id, name, slug),
      country:countries(id, name, slug, flag_emoji),
      types:objectives_types_relations(type:objective_types(*))
    `,
      { count: "exact" }
    );

  // Apply filters
  if (published !== undefined) {
    query = query.eq("published", published);
  }

  if (continent) {
    query = query.eq("continent_id", continent);
  }

  if (country) {
    query = query.eq("country_id", country);
  }

  if (unesco !== undefined) {
    query = query.eq("unesco_site", unesco);
  }

  if (featured !== undefined) {
    query = query.eq("featured", featured);
  }

  if (search) {
    // Full-text search on title, excerpt, description
    query = query.or(
      `title.ilike.%${search}%,excerpt.ilike.%${search}%,description.ilike.%${search}%`
    );
  }

  // Filter by types (if provided)
  if (types && types.length > 0) {
    // This requires joining through the relation table
    query = query.in("id", supabase
      .from("objectives_types_relations")
      .select("objective_id")
      .in("type_id", types)
    );
  }

  // Sorting
  query = query.order(sortBy, { ascending: sortOrder === "asc" });

  // Pagination
  query = query.range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) throw error;

  return {
    data: (data as any[]) || [],
    count: count || 0,
    hasMore: count ? offset + limit < count : false,
  };
}

/**
 * Get featured objectives
 */
export async function getFeaturedObjectives(limit: number = 6) {
  return getObjectives({ featured: true, limit, sortBy: "views_count", sortOrder: "desc" });
}

/**
 * Get UNESCO World Heritage objectives
 */
export async function getUNESCOObjectives(limit: number = 12) {
  return getObjectives({ unesco: true, limit, sortBy: "unesco_year", sortOrder: "desc" });
}

/**
 * Get objective by slug (with full relations)
 */
export async function getObjectiveBySlug(slug: string) {
  const { data, error } = await supabase
    .from("objectives")
    .select(
      `
      *,
      continent:continents(*),
      country:countries(*),
      types:objectives_types_relations(type:objective_types(*))
    `
    )
    .eq("slug", slug)
    .eq("published", true)
    .single();

  if (error) throw error;
  return data as ObjectiveWithRelations;
}

/**
 * Get objective by ID (admin use)
 */
export async function getObjectiveById(id: string) {
  const { data, error } = await supabase
    .from("objectives")
    .select(
      `
      *,
      continent:continents(*),
      country:countries(*),
      types:objectives_types_relations(type:objective_types(*))
    `
    )
    .eq("id", id)
    .single();

  if (error) throw error;
  return data as ObjectiveWithRelations;
}

/**
 * Get similar objectives (same country or continent)
 */
export async function getSimilarObjectives(
  objectiveId: string,
  limit: number = 4
): Promise<ObjectiveWithRelations[]> {
  // First get the objective to know its country/continent
  const { data: objective } = await supabase
    .from("objectives")
    .select("country_id, continent_id")
    .eq("id", objectiveId)
    .single();

  if (!objective) return [];

  // Get similar from same country, then continent
  const { data, error } = await supabase
    .from("objectives")
    .select("*, country:countries(name, slug, flag_emoji), continent:continents(name, slug)")
    .neq("id", objectiveId)
    .eq("published", true)
    .or(`country_id.eq.${objective.country_id},continent_id.eq.${objective.continent_id}`)
    .order("views_count", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data as any[]) || [];
}

/**
 * Get popular objectives (by views)
 */
export async function getPopularObjectives(limit: number = 6) {
  return getObjectives({ limit, sortBy: "views_count", sortOrder: "desc" });
}

/**
 * Get recent objectives
 */
export async function getRecentObjectives(limit: number = 6) {
  return getObjectives({ limit, sortBy: "published_at", sortOrder: "desc" });
}

/**
 * Increment objective views (client-safe)
 */
export async function incrementObjectiveViews(id: string) {
  // This should ideally be a database function to prevent race conditions
  const { data: objective } = await supabase
    .from("objectives")
    .select("views_count")
    .eq("id", id)
    .single();

  if (objective) {
    const { error } = await supabase
      .from("objectives")
      .update({ views_count: objective.views_count + 1 })
      .eq("id", id);

    if (error) console.error("Error incrementing views:", error);
  }
}

/**
 * Get objectives count by filters
 */
export async function getObjectivesCount(filters: Omit<ObjectiveFilters, 'limit' | 'offset'> = {}) {
  const { continent, country, types, unesco, featured, published = true } = filters;

  let query = supabase
    .from("objectives")
    .select("id", { count: "exact", head: true });

  if (published !== undefined) {
    query = query.eq("published", published);
  }

  if (continent) {
    query = query.eq("continent_id", continent);
  }

  if (country) {
    query = query.eq("country_id", country);
  }

  if (unesco !== undefined) {
    query = query.eq("unesco_site", unesco);
  }

  if (featured !== undefined) {
    query = query.eq("featured", featured);
  }

  if (types && types.length > 0) {
    query = query.in("id", supabase
      .from("objectives_types_relations")
      .select("objective_id")
      .in("type_id", types)
    );
  }

  const { count, error } = await query;

  if (error) throw error;
  return count || 0;
}
