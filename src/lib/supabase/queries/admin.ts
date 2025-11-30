/**
 * Admin Queries
 * Dashboard stats and admin-specific queries
 */

import { supabase } from "@/integrations/supabase/client";

/**
 * Get dashboard stats
 */
export async function getDashboardStats() {
  // Get objectives count
  const { count: objectivesCount } = await supabase
    .from("objectives")
    .select("*", { count: "exact", head: true });

  const { count: publishedObjectives } = await supabase
    .from("objectives")
    .select("*", { count: "exact", head: true })
    .eq("published", true);

  // Get articles count
  const { count: articlesCount } = await supabase
    .from("blog_articles")
    .select("*", { count: "exact", head: true });

  const { count: publishedArticles } = await supabase
    .from("blog_articles")
    .select("*", { count: "exact", head: true })
    .eq("published", true);

  // Get circuits count
  const { count: circuitsCount } = await supabase
    .from("jinfotours_circuits")
    .select("*", { count: "exact", head: true });

  const { count: featuredCircuits } = await supabase
    .from("jinfotours_circuits")
    .select("*", { count: "exact", head: true })
    .eq("featured", true);

  // Get total views
  const { data: objectivesViews } = await supabase
    .from("objectives")
    .select("views_count");

  const { data: articlesViews } = await supabase
    .from("blog_articles")
    .select("views_count");

  const totalViews =
    (objectivesViews?.reduce((sum, obj) => sum + (obj.views_count || 0), 0) || 0) +
    (articlesViews?.reduce((sum, art) => sum + (art.views_count || 0), 0) || 0);

  return {
    objectives: {
      total: objectivesCount || 0,
      published: publishedObjectives || 0,
      drafts: (objectivesCount || 0) - (publishedObjectives || 0),
    },
    articles: {
      total: articlesCount || 0,
      published: publishedArticles || 0,
      drafts: (articlesCount || 0) - (publishedArticles || 0),
    },
    circuits: {
      total: circuitsCount || 0,
      featured: featuredCircuits || 0,
    },
    views: {
      total: totalViews,
    },
  };
}

/**
 * Get recent activity (mixed objectives and articles)
 */
export async function getRecentActivity(limit: number = 5) {
  // Get recent objectives
  const { data: objectives } = await supabase
    .from("objectives")
    .select("id, title, featured_image, published, created_at, slug")
    .order("created_at", { ascending: false })
    .limit(limit);

  // Get recent articles
  const { data: articles } = await supabase
    .from("blog_articles")
    .select("id, title, featured_image, published, created_at, slug")
    .order("created_at", { ascending: false })
    .limit(limit);

  // Combine and sort
  const combined = [
    ...(objectives?.map((obj) => ({ ...obj, type: "objective" as const })) || []),
    ...(articles?.map((art) => ({ ...art, type: "article" as const })) || []),
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return combined.slice(0, limit);
}
