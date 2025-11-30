/**
 * Search & Filter Queries
 * Advanced search functionality across objectives, guides, and blog articles
 */

import { supabase } from "@/integrations/supabase/client";
import type { ObjectiveFiltersState } from "@/components/features/objectives/ObjectiveAdvancedFilters";
import type { GuideFiltersState } from "@/components/features/guides/GuideAdvancedFilters";
import type { BlogFiltersState } from "@/components/features/blog/BlogAdvancedFilters";

/**
 * Search Objectives with advanced filters
 */
export async function searchObjectives(
  searchQuery: string = "",
  filters: ObjectiveFiltersState = {},
  page: number = 1,
  limit: number = 12
) {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from("objectives")
    .select(`
      *,
      country:countries(name, slug),
      continent:continents(name, slug),
      types:objectives_types_relations(
        objective_type:objective_types(id, name, slug, icon, color)
      )
    `, { count: "exact" })
    .eq("published", true);

  // Text search
  if (searchQuery) {
    query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,excerpt.ilike.%${searchQuery}%`);
  }

  // Continent filter
  if (filters.continent) {
    query = query.eq("continent_id", filters.continent);
  }

  // Country filter
  if (filters.country) {
    query = query.eq("country_id", filters.country);
  }

  // Difficulty filter
  if (filters.difficulty) {
    query = query.eq("difficulty_level", filters.difficulty);
  }

  // UNESCO filter
  if (filters.unesco) {
    query = query.eq("unesco_site", true);
  }

  // Featured filter
  if (filters.featured) {
    query = query.eq("featured", true);
  }

  // Type filter (requires join - handled client-side after fetch)
  
  // Sorting
  switch (filters.sortBy) {
    case "newest":
      query = query.order("created_at", { ascending: false });
      break;
    case "alphabetical":
      query = query.order("title", { ascending: true });
      break;
    case "featured":
      query = query.order("featured", { ascending: false }).order("views_count", { ascending: false });
      break;
    case "popular":
    default:
      query = query.order("views_count", { ascending: false });
      break;
  }

  const { data, error, count } = await query.range(from, to);

  if (error) throw error;

  // Client-side type filtering if needed
  let filteredData = data || [];
  if (filters.type) {
    filteredData = filteredData.filter(obj => 
      obj.types?.some((t: any) => t.objective_type?.id === filters.type)
    );
  }

  return {
    objectives: filteredData,
    total: count || 0,
    pages: Math.ceil((count || 0) / limit),
  };
}

/**
 * Search Guides with advanced filters
 */
export async function searchGuides(
  searchQuery: string = "",
  filters: GuideFiltersState = {},
  page: number = 1,
  limit: number = 12
) {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from("guides")
    .select("*", { count: "exact" })
    .eq("active", true);

  // Text search
  if (searchQuery) {
    query = query.or(`full_name.ilike.%${searchQuery}%,bio.ilike.%${searchQuery}%,short_description.ilike.%${searchQuery}%`);
  }

  // Verified filter
  if (filters.verified) {
    query = query.eq("verified", true);
  }

  // Featured filter
  if (filters.featured) {
    query = query.eq("featured", true);
  }

  // Region filter (geographical_areas is array)
  if (filters.region) {
    query = query.contains("geographical_areas", [filters.region]);
  }

  // Specialization filter
  if (filters.specialization) {
    query = query.contains("specializations", [filters.specialization]);
  }

  // Language filter
  if (filters.language) {
    query = query.contains("languages", [filters.language]);
  }

  // Sorting
  switch (filters.sortBy) {
    case "reviews":
      query = query.order("reviews_count", { ascending: false });
      break;
    case "experience":
      query = query.order("years_experience", { ascending: false });
      break;
    case "alphabetical":
      query = query.order("full_name", { ascending: true });
      break;
    case "featured":
      query = query.order("featured", { ascending: false }).order("rating_average", { ascending: false });
      break;
    case "rating":
    default:
      query = query.order("rating_average", { ascending: false });
      break;
  }

  const { data, error, count } = await query.range(from, to);

  if (error) throw error;

  return {
    guides: data || [],
    total: count || 0,
    pages: Math.ceil((count || 0) / limit),
  };
}

/**
 * Search Blog Articles with advanced filters
 */
export async function searchBlogArticles(
  searchQuery: string = "",
  filters: BlogFiltersState = {},
  page: number = 1,
  limit: number = 12
) {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from("blog_articles")
    .select("*", { count: "exact" })
    .eq("published", true);

  // Text search
  if (searchQuery) {
    query = query.or(`title.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%,excerpt.ilike.%${searchQuery}%`);
  }

  // Category filter
  if (filters.category) {
    query = query.eq("category", filters.category);
  }

  // Featured filter
  if (filters.featured) {
    query = query.eq("featured", true);
  }

  // Sorting
  switch (filters.sortBy) {
    case "oldest":
      query = query.order("published_at", { ascending: true });
      break;
    case "popular":
      query = query.order("views_count", { ascending: false });
      break;
    case "alphabetical":
      query = query.order("title", { ascending: true });
      break;
    case "featured":
      query = query.order("featured", { ascending: false }).order("published_at", { ascending: false });
      break;
    case "newest":
    default:
      query = query.order("published_at", { ascending: false });
      break;
  }

  const { data, error, count } = await query.range(from, to);

  if (error) throw error;

  return {
    articles: data || [],
    total: count || 0,
    pages: Math.ceil((count || 0) / limit),
  };
}

/**
 * Get filter options for dropdowns
 */
export async function getFilterOptions() {
  const [continentsRes, countriesRes, typesRes] = await Promise.all([
    supabase.from("continents").select("id, name, slug").order("order_index"),
    supabase.from("countries").select("id, name, slug, continent_id").order("order_index"),
    supabase.from("objective_types").select("id, name, slug").order("order_index")
  ]);

  return {
    continents: continentsRes.data || [],
    countries: countriesRes.data || [],
    types: typesRes.data || []
  };
}
