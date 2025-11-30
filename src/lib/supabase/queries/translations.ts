/**
 * Translation Queries
 * Helper functions pentru working with database translations
 */

import { supabase } from "@/integrations/supabase/client";

export interface ObjectiveTranslation {
  id: string;
  objective_id: string;
  language: string;
  title: string;
  excerpt?: string;
  description?: string;
  meta_title?: string;
  meta_description?: string;
  location_text?: string;
  accessibility_info?: string;
  visit_duration?: string;
  best_season?: string;
  entrance_fee?: string;
  opening_hours?: string;
}

export interface GuideTranslation {
  id: string;
  guide_id: string;
  language: string;
  full_name?: string;
  bio?: string;
  short_description?: string;
  meta_title?: string;
  meta_description?: string;
}

export interface BlogArticleTranslation {
  id: string;
  article_id: string;
  language: string;
  title: string;
  excerpt?: string;
  content?: string;
  meta_title?: string;
  meta_description?: string;
}

/**
 * Get objective translation for a specific language
 */
export async function getObjectiveTranslation(
  objectiveId: string,
  language: string
): Promise<ObjectiveTranslation | null> {
  const { data, error } = await supabase
    .from("objective_translations")
    .select("*")
    .eq("objective_id", objectiveId)
    .eq("language", language)
    .single();

  if (error) {
    console.error("Error fetching objective translation:", error);
    return null;
  }

  return data;
}

/**
 * Get guide translation for a specific language
 */
export async function getGuideTranslation(
  guideId: string,
  language: string
): Promise<GuideTranslation | null> {
  const { data, error } = await supabase
    .from("guide_translations")
    .select("*")
    .eq("guide_id", guideId)
    .eq("language", language)
    .single();

  if (error) {
    console.error("Error fetching guide translation:", error);
    return null;
  }

  return data;
}

/**
 * Get blog article translation for a specific language
 */
export async function getBlogArticleTranslation(
  articleId: string,
  language: string
): Promise<BlogArticleTranslation | null> {
  const { data, error } = await supabase
    .from("blog_article_translations")
    .select("*")
    .eq("article_id", articleId)
    .eq("language", language)
    .single();

  if (error) {
    console.error("Error fetching blog article translation:", error);
    return null;
  }

  return data;
}

/**
 * Create or update objective translation
 */
export async function upsertObjectiveTranslation(
  translation: Omit<ObjectiveTranslation, "id">
): Promise<ObjectiveTranslation | null> {
  const { data, error } = await supabase
    .from("objective_translations")
    .upsert(translation, {
      onConflict: "objective_id,language",
    })
    .select()
    .single();

  if (error) {
    console.error("Error upserting objective translation:", error);
    throw error;
  }

  return data;
}

/**
 * Create or update guide translation
 */
export async function upsertGuideTranslation(
  translation: Omit<GuideTranslation, "id">
): Promise<GuideTranslation | null> {
  const { data, error } = await supabase
    .from("guide_translations")
    .upsert(translation, {
      onConflict: "guide_id,language",
    })
    .select()
    .single();

  if (error) {
    console.error("Error upserting guide translation:", error);
    throw error;
  }

  return data;
}

/**
 * Create or update blog article translation
 */
export async function upsertBlogArticleTranslation(
  translation: Omit<BlogArticleTranslation, "id">
): Promise<BlogArticleTranslation | null> {
  const { data, error } = await supabase
    .from("blog_article_translations")
    .upsert(translation, {
      onConflict: "article_id,language",
    })
    .select()
    .single();

  if (error) {
    console.error("Error upserting blog article translation:", error);
    throw error;
  }

  return data;
}

/**
 * Delete objective translation
 */
export async function deleteObjectiveTranslation(
  objectiveId: string,
  language: string
): Promise<void> {
  const { error } = await supabase
    .from("objective_translations")
    .delete()
    .eq("objective_id", objectiveId)
    .eq("language", language);

  if (error) {
    console.error("Error deleting objective translation:", error);
    throw error;
  }
}

/**
 * Delete guide translation
 */
export async function deleteGuideTranslation(
  guideId: string,
  language: string
): Promise<void> {
  const { error } = await supabase
    .from("guide_translations")
    .delete()
    .eq("guide_id", guideId)
    .eq("language", language);

  if (error) {
    console.error("Error deleting guide translation:", error);
    throw error;
  }
}

/**
 * Delete blog article translation
 */
export async function deleteBlogArticleTranslation(
  articleId: string,
  language: string
): Promise<void> {
  const { error } = await supabase
    .from("blog_article_translations")
    .delete()
    .eq("article_id", articleId)
    .eq("language", language);

  if (error) {
    console.error("Error deleting blog article translation:", error);
    throw error;
  }
}

/**
 * Get all translations for an objective
 */
export async function getAllObjectiveTranslations(
  objectiveId: string
): Promise<ObjectiveTranslation[]> {
  const { data, error } = await supabase
    .from("objective_translations")
    .select("*")
    .eq("objective_id", objectiveId);

  if (error) {
    console.error("Error fetching objective translations:", error);
    return [];
  }

  return data || [];
}

/**
 * Get missing translations for objectives
 * Returns objectives that don't have translation for specified language
 */
export async function getMissingObjectiveTranslations(
  language: string,
  limit = 50
): Promise<any[]> {
  const { data: objectives, error: objectivesError } = await supabase
    .from("objectives")
    .select("id, title, slug")
    .eq("published", true)
    .limit(limit);

  if (objectivesError) {
    console.error("Error fetching objectives:", objectivesError);
    return [];
  }

  const { data: translations, error: translationsError } = await supabase
    .from("objective_translations")
    .select("objective_id")
    .eq("language", language);

  if (translationsError) {
    console.error("Error fetching translations:", translationsError);
    return [];
  }

  const translatedIds = new Set(translations?.map((t) => t.objective_id) || []);
  
  return objectives?.filter((obj) => !translatedIds.has(obj.id)) || [];
}
