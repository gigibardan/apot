/**
 * Taxonomy Queries
 * Query functions for continents, countries, and objective types
 */

import { supabase } from "@/integrations/supabase/client";
import type { Continent, Country, ObjectiveType } from "@/types/database.types";

// ==================== CONTINENTS ====================

/**
 * Get all continents (ordered by order_index)
 */
export async function getContinents() {
  const { data, error } = await supabase
    .from("continents")
    .select("*")
    .order("order_index", { ascending: true });

  if (error) throw error;
  return data as Continent[];
}

/**
 * Get single continent by slug
 */
export async function getContinentBySlug(slug: string) {
  const { data, error } = await supabase
    .from("continents")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error) throw error;
  return data as Continent;
}

/**
 * Get continent by ID
 */
export async function getContinentById(id: string) {
  const { data, error } = await supabase
    .from("continents")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data as Continent;
}

// ==================== COUNTRIES ====================

/**
 * Get countries (optionally filtered by continent)
 */
export async function getCountries(continentId?: string) {
  let query = supabase
    .from("countries")
    .select("*")
    .order("order_index", { ascending: true });

  if (continentId) {
    query = query.eq("continent_id", continentId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as Country[];
}

/**
 * Get country by slug with continent relation
 */
export async function getCountryBySlug(slug: string) {
  const { data, error } = await supabase
    .from("countries")
    .select("*, continent:continents(*)")
    .eq("slug", slug)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Get country by ID
 */
export async function getCountryById(id: string) {
  const { data, error } = await supabase
    .from("countries")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data as Country;
}

/**
 * Get countries count by continent
 */
export async function getCountriesCountByContinent() {
  const { data, error } = await supabase
    .from("countries")
    .select("continent_id")
    .order("continent_id");

  if (error) throw error;

  // Group by continent_id
  const counts: Record<string, number> = {};
  data.forEach((country) => {
    counts[country.continent_id] = (counts[country.continent_id] || 0) + 1;
  });

  return counts;
}

// ==================== OBJECTIVE TYPES ====================

/**
 * Get all objective types (ordered)
 */
export async function getObjectiveTypes() {
  const { data, error } = await supabase
    .from("objective_types")
    .select("*")
    .order("order_index", { ascending: true });

  if (error) throw error;
  return data as ObjectiveType[];
}

/**
 * Get objective type by slug
 */
export async function getObjectiveTypeBySlug(slug: string) {
  const { data, error } = await supabase
    .from("objective_types")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error) throw error;
  return data as ObjectiveType;
}

/**
 * Get objective type by ID
 */
export async function getObjectiveTypeById(id: string) {
  const { data, error } = await supabase
    .from("objective_types")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data as ObjectiveType;
}

/**
 * Get popular objective types (by usage count)
 */
export async function getPopularObjectiveTypes(limit: number = 5) {
  const { data, error } = await supabase
    .from("objective_types")
    .select("*, objectives_types_relations(count)")
    .order("objectives_types_relations.count", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data as ObjectiveType[];
}
