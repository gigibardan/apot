/**
 * Blog Mutations
 * Admin functions for creating, updating, and deleting blog articles
 */

import { supabase } from "@/integrations/supabase/client";
import type { BlogArticleInput } from "@/types/database.types";
import { slugify, getReadingTime } from "@/lib/utils";

/**
 * Create new blog article
 */
export async function createBlogArticle(data: Partial<BlogArticleInput>) {
  // Generate slug if not provided
  if (!data.slug && data.title) {
    data.slug = slugify(data.title);
  }

  // Calculate reading time from content
  if (!data.reading_time && data.content) {
    data.reading_time = getReadingTime(data.content);
  }

  const { data: article, error } = await supabase
    .from("blog_articles")
    .insert(data)
    .select()
    .single();

  if (error) throw error;
  return article;
}

/**
 * Update blog article
 */
export async function updateBlogArticle(
  id: string,
  data: Partial<BlogArticleInput>
) {
  // Recalculate reading time if content changed
  if (data.content && !data.reading_time) {
    data.reading_time = getReadingTime(data.content);
  }

  const { data: article, error } = await supabase
    .from("blog_articles")
    .update(data)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return article;
}

/**
 * Delete blog article
 */
export async function deleteBlogArticle(id: string) {
  const { error } = await supabase.from("blog_articles").delete().eq("id", id);

  if (error) throw error;
}

/**
 * Publish/unpublish article
 */
export async function toggleArticlePublish(id: string, published: boolean) {
  return updateBlogArticle(id, {
    published,
    published_at: published ? new Date().toISOString() : null,
  } as any);
}

/**
 * Toggle featured status
 */
export async function toggleArticleFeatured(id: string, featured: boolean) {
  return updateBlogArticle(id, { featured } as any);
}

/**
 * Duplicate article
 */
export async function duplicateBlogArticle(id: string) {
  const { data: original, error: fetchError } = await supabase
    .from("blog_articles")
    .select("*")
    .eq("id", id)
    .single();

  if (fetchError) throw fetchError;

  // Create copy with modified title and slug
  const copy = {
    ...original,
    id: undefined,
    title: `${original.title} (Copy)`,
    slug: `${original.slug}-copy`,
    published: false,
    featured: false,
    views_count: 0,
    created_at: undefined,
    updated_at: undefined,
  };

  const { data: newArticle, error: createError } = await supabase
    .from("blog_articles")
    .insert(copy)
    .select()
    .single();

  if (createError) throw createError;
  return newArticle;
}
