/**
 * Continents Queries
 * Query functions for continents with translations support
 */

import { supabase } from "@/integrations/supabase/client";

export interface Continent {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  meta_title: string | null;
  meta_description: string | null;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface ContinentTranslation {
  id: string;
  continent_id: string;
  language: string;
  name: string;
  description: string | null;
  meta_title: string | null;
  meta_description: string | null;
}

/**
 * Get all continents ordered by order_index
 */
export async function getContinents(): Promise<Continent[]> {
  const { data, error } = await supabase
    .from("continents")
    .select("*")
    .order("order_index", { ascending: true });

  if (error) {
    console.error("Error fetching continents:", error);
    throw error;
  }

  return data || [];
}

/**
 * Get continent by slug
 */
export async function getContinentBySlug(
  slug: string
): Promise<Continent | null> {
  const { data, error } = await supabase
    .from("continents")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error) {
    console.error("Error fetching continent:", error);
    return null;
  }

  return data;
}

/**
 * Get continent translation
 */
export async function getContinentTranslation(
  continentId: string,
  language: string
): Promise<ContinentTranslation | null> {
  const { data, error } = await supabase
    .from("continent_translations")
    .select("*")
    .eq("continent_id", continentId)
    .eq("language", language)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      // No translation found
      return null;
    }
    console.error("Error fetching continent translation:", error);
    return null;
  }

  return data;
}

/**
 * Get continent with translation
 */
export async function getContinentWithTranslation(
  slug: string,
  language: string
): Promise<Continent | null> {
  const continent = await getContinentBySlug(slug);
  if (!continent) return null;

  // If requesting default language (ro), return original
  if (language === "ro") {
    return continent;
  }

  const translation = await getContinentTranslation(continent.id, language);

  if (translation) {
    return {
      ...continent,
      name: translation.name,
      description: translation.description || continent.description,
      meta_title: translation.meta_title || continent.meta_title,
      meta_description:
        translation.meta_description || continent.meta_description,
    };
  }

  return continent;
}

/**
 * Get all continents with translations
 */
export async function getContinentsWithTranslations(
  language: string
): Promise<Continent[]> {
  const continents = await getContinents();

  // If requesting default language (ro), return originals
  if (language === "ro") {
    return continents;
  }

  // Fetch translations for all continents
  const translatedContinents = await Promise.all(
    continents.map(async (continent) => {
      const translation = await getContinentTranslation(continent.id, language);

      if (translation) {
        return {
          ...continent,
          name: translation.name,
          description: translation.description || continent.description,
          meta_title: translation.meta_title || continent.meta_title,
          meta_description:
            translation.meta_description || continent.meta_description,
        };
      }

      return continent;
    })
  );

  return translatedContinents;
}
