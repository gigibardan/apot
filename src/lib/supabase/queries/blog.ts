/**
 * Blog Queries
 * Query functions for blog articles
 */

import { supabase } from "@/integrations/supabase/client";
import type { BlogArticle, BlogCategory } from "@/types/database.types";

export interface BlogFilters {
  category?: BlogCategory;
  tags?: string[];
  featured?: boolean;
  search?: string;
  published?: boolean;
  limit?: number;
  offset?: number;
}

export interface BlogResult {
  data: BlogArticle[];
  count: number;
  hasMore: boolean;
}

/**
 * Get blog articles with filters and pagination
 */
export async function getBlogArticles(
  filters: BlogFilters = {}
): Promise<BlogResult> {
  const {
    category,
    tags,
    featured,
    search,
    published,
    limit = 6,
    offset = 0,
  } = filters;

  let query = supabase
    .from("blog_articles")
    .select("*", { count: "exact" });

  // Only filter by published if explicitly set
  if (published !== undefined) {
    query = query.eq("published", published);
  }

  if (category) {
    query = query.eq("category", category);
  }

  if (tags && tags.length > 0) {
    query = query.contains("tags", tags);
  }

  if (featured !== undefined) {
    query = query.eq("featured", featured);
  }

  if (search) {
    query = query.or(
      `title.ilike.%${search}%,excerpt.ilike.%${search}%,content.ilike.%${search}%`
    );
  }

  query = query.order("published_at", { ascending: false, nullsFirst: false });
  query = query.order("created_at", { ascending: false });
  query = query.range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) throw error;

  return {
    data: (data as BlogArticle[]) || [],
    count: count || 0,
    hasMore: count ? offset + limit < count : false,
  };
}

/**
 * Get featured articles
 */
export async function getFeaturedArticles(limit: number = 3) {
  return getBlogArticles({ featured: true, limit });
}

/**
 * Get article by slug
 */
export async function getBlogArticleBySlug(slug: string) {
  const { data, error } = await supabase
    .from("blog_articles")
    .select(`
      *,
      author:profiles!blog_articles_author_id_fkey (
        id,
        full_name,
        avatar_url,
        bio
      )
    `)
    .eq("slug", slug)
    .eq("published", true)
    .single();

  if (error) throw error;
  return data as BlogArticle & { 
    author: { id: string; full_name: string | null; avatar_url: string | null; bio: string | null } | null 
  };
}

/**
 * Get article by ID (admin use)
 */
export async function getBlogArticleById(id: string) {
  const { data, error } = await supabase
    .from("blog_articles")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data as BlogArticle;
}

/**
 * Increment article views
 */
export async function incrementArticleViews(id: string) {
  const { data: article } = await supabase
    .from("blog_articles")
    .select("views_count")
    .eq("id", id)
    .single();

  if (article) {
    const { error } = await supabase
      .from("blog_articles")
      .update({ views_count: (article as any).views_count + 1 } as any)
      .eq("id", id);

    if (error) console.error("Error incrementing views:", error);
  }
}

/**
 * Get related articles (same category or tags)
 */
export async function getRelatedArticles(
  articleId: string,
  limit: number = 3
): Promise<BlogArticle[]> {
  const { data: article } = await supabase
    .from("blog_articles")
    .select("category, tags")
    .eq("id", articleId)
    .single();

  if (!article) return [];

  let query = supabase
    .from("blog_articles")
    .select("*")
    .neq("id", articleId)
    .eq("published", true);

  // Prefer same category
  if ((article as any).category) {
    query = query.eq("category", (article as any).category);
  }

  const { data, error } = await query
    .order("published_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data as BlogArticle[]) || [];
}

/**
 * Get popular articles (by views)
 */
export async function getPopularArticles(limit: number = 5): Promise<BlogArticle[]> {
  const { data, error } = await supabase
    .from("blog_articles")
    .select("*")
    .eq("published", true)
    .order("views_count", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data as BlogArticle[]) || [];
}

/**
 * Get articles by category
 */
export async function getArticlesByCategory(
  category: BlogCategory,
  limit: number = 6
) {
  return getBlogArticles({ category, limit });
}

/**
 * Get all unique tags
 */
export async function getAllTags(): Promise<string[]> {
  const { data, error } = await supabase
    .from("blog_articles")
    .select("tags")
    .eq("published", true);

  if (error) throw error;

  // Flatten and unique
  const allTags = new Set<string>();
  data?.forEach((article: any) => {
    article.tags?.forEach((tag: string) => allTags.add(tag));
  });

  return Array.from(allTags).sort();
}
