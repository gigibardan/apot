/**
 * Analytics Queries
 * Comprehensive analytics and reporting queries
 */

import { supabase } from "@/integrations/supabase/client";
import { startOfDay, endOfDay, subDays, format } from "date-fns";

export interface DateRange {
  from: Date;
  to: Date;
}

/**
 * Get page views analytics
 */
export async function getPageViewsAnalytics(dateRange: DateRange) {
  const { data, error } = await supabase
    .from("page_views")
    .select("*")
    .gte("viewed_at", dateRange.from.toISOString())
    .lte("viewed_at", dateRange.to.toISOString())
    .order("viewed_at", { ascending: false });

  if (error) throw error;

  // Group by date
  const viewsByDate = data?.reduce((acc: any, view) => {
    const date = format(new Date(view.viewed_at), "yyyy-MM-dd");
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {});

  return {
    total: data?.length || 0,
    byDate: viewsByDate || {},
    rawData: data || [],
  };
}

/**
 * Get top viewed pages
 */
export async function getTopPages(dateRange: DateRange, limit: number = 10) {
  const { data, error } = await supabase
    .from("page_views")
    .select("page_url, page_title")
    .gte("viewed_at", dateRange.from.toISOString())
    .lte("viewed_at", dateRange.to.toISOString());

  if (error) throw error;

  // Count views per page
  const pageViews = data?.reduce((acc: any, view) => {
    const url = view.page_url;
    if (!acc[url]) {
      acc[url] = {
        url,
        title: view.page_title,
        views: 0,
      };
    }
    acc[url].views++;
    return acc;
  }, {});

  // Sort and limit
  const topPages = Object.values(pageViews || {})
    .sort((a: any, b: any) => b.views - a.views)
    .slice(0, limit);

  return topPages;
}

/**
 * Get user engagement metrics
 */
export async function getUserEngagementMetrics(dateRange: DateRange) {
  // Get unique visitors
  const { data: pageViews } = await supabase
    .from("page_views")
    .select("session_id, ip_address")
    .gte("viewed_at", dateRange.from.toISOString())
    .lte("viewed_at", dateRange.to.toISOString());

  const uniqueVisitors = new Set(
    pageViews?.map((v) => v.session_id || v.ip_address)
  ).size;

  // Get favorites count
  const { count: favoritesCount } = await supabase
    .from("user_favorites")
    .select("*", { count: "exact", head: true })
    .gte("created_at", dateRange.from.toISOString())
    .lte("created_at", dateRange.to.toISOString());

  // Get reviews count
  const { count: objectiveReviewsCount } = await supabase
    .from("objective_reviews")
    .select("*", { count: "exact", head: true })
    .gte("created_at", dateRange.from.toISOString())
    .lte("created_at", dateRange.to.toISOString());

  const { count: guideReviewsCount } = await supabase
    .from("guide_reviews")
    .select("*", { count: "exact", head: true })
    .gte("created_at", dateRange.from.toISOString())
    .lte("created_at", dateRange.to.toISOString());

  // Get newsletter subscriptions
  const { count: newsletterCount } = await supabase
    .from("newsletter_subscribers")
    .select("*", { count: "exact", head: true })
    .gte("subscribed_at", dateRange.from.toISOString())
    .lte("subscribed_at", dateRange.to.toISOString());

  // Get contact messages
  const { count: contactCount } = await supabase
    .from("contact_messages")
    .select("*", { count: "exact", head: true })
    .gte("created_at", dateRange.from.toISOString())
    .lte("created_at", dateRange.to.toISOString());

  return {
    uniqueVisitors,
    totalPageViews: pageViews?.length || 0,
    favoritesAdded: favoritesCount || 0,
    reviewsSubmitted: (objectiveReviewsCount || 0) + (guideReviewsCount || 0),
    newsletterSignups: newsletterCount || 0,
    contactMessages: contactCount || 0,
    avgPageViewsPerVisitor: uniqueVisitors > 0 ? (pageViews?.length || 0) / uniqueVisitors : 0,
  };
}

/**
 * Get content performance
 */
export async function getContentPerformance(dateRange: DateRange) {
  // Top objectives by views
  const { data: objectives } = await supabase
    .from("objectives")
    .select("id, title, slug, views_count, likes_count, featured_image")
    .eq("published", true)
    .order("views_count", { ascending: false })
    .limit(10);

  // Top blog articles by views
  const { data: articles } = await supabase
    .from("blog_articles")
    .select("id, title, slug, views_count, featured_image")
    .eq("published", true)
    .order("views_count", { ascending: false })
    .limit(10);

  // Top guides by contact count
  const { data: guides } = await supabase
    .from("guides")
    .select("id, full_name, slug, contact_count, rating_average, reviews_count")
    .eq("active", true)
    .order("contact_count", { ascending: false })
    .limit(10);

  return {
    topObjectives: objectives || [],
    topArticles: articles || [],
    topGuides: guides || [],
  };
}

/**
 * Get geographic distribution
 */
export async function getGeographicDistribution(dateRange: DateRange) {
  const { data, error } = await supabase
    .from("page_views")
    .select("ip_address")
    .gte("viewed_at", dateRange.from.toISOString())
    .lte("viewed_at", dateRange.to.toISOString());

  if (error) throw error;

  // Group by IP (in real app, you'd use a GeoIP service)
  const ipCounts = data?.reduce((acc: any, view) => {
    const ip = view.ip_address || "Unknown";
    acc[ip] = (acc[ip] || 0) + 1;
    return acc;
  }, {});

  return {
    totalIPs: Object.keys(ipCounts || {}).length,
    distribution: ipCounts || {},
  };
}

/**
 * Get conversion metrics
 */
export async function getConversionMetrics(dateRange: DateRange) {
  const { data: pageViews } = await supabase
    .from("page_views")
    .select("session_id")
    .gte("viewed_at", dateRange.from.toISOString())
    .lte("viewed_at", dateRange.to.toISOString());

  const totalSessions = new Set(pageViews?.map((v) => v.session_id)).size;

  // Newsletter conversions
  const { count: newsletterConversions } = await supabase
    .from("newsletter_subscribers")
    .select("*", { count: "exact", head: true })
    .gte("subscribed_at", dateRange.from.toISOString())
    .lte("subscribed_at", dateRange.to.toISOString());

  // Favorites conversions
  const { count: favoritesConversions } = await supabase
    .from("user_favorites")
    .select("*", { count: "exact", head: true })
    .gte("created_at", dateRange.from.toISOString())
    .lte("created_at", dateRange.to.toISOString());

  // Review conversions
  const { count: reviewConversions } = await supabase
    .from("objective_reviews")
    .select("*", { count: "exact", head: true })
    .gte("created_at", dateRange.from.toISOString())
    .lte("created_at", dateRange.to.toISOString());

  // Contact conversions
  const { count: contactConversions } = await supabase
    .from("contact_messages")
    .select("*", { count: "exact", head: true })
    .gte("created_at", dateRange.from.toISOString())
    .lte("created_at", dateRange.to.toISOString());

  return {
    newsletterRate: totalSessions > 0 ? ((newsletterConversions || 0) / totalSessions) * 100 : 0,
    favoritesRate: totalSessions > 0 ? ((favoritesConversions || 0) / totalSessions) * 100 : 0,
    reviewRate: totalSessions > 0 ? ((reviewConversions || 0) / totalSessions) * 100 : 0,
    contactRate: totalSessions > 0 ? ((contactConversions || 0) / totalSessions) * 100 : 0,
    totalConversions:
      (newsletterConversions || 0) +
      (favoritesConversions || 0) +
      (reviewConversions || 0) +
      (contactConversions || 0),
  };
}

/**
 * Get real-time stats (last 24h)
 */
export async function getRealTimeStats() {
  const last24h = subDays(new Date(), 1);

  const { data: recentViews } = await supabase
    .from("page_views")
    .select("*")
    .gte("viewed_at", last24h.toISOString())
    .order("viewed_at", { ascending: false })
    .limit(100);

  const uniqueVisitors = new Set(
    recentViews?.map((v) => v.session_id || v.ip_address)
  ).size;

  // Group by hour
  const viewsByHour = recentViews?.reduce((acc: any, view) => {
    const hour = format(new Date(view.viewed_at), "HH:00");
    acc[hour] = (acc[hour] || 0) + 1;
    return acc;
  }, {});

  return {
    last24h: {
      views: recentViews?.length || 0,
      visitors: uniqueVisitors,
      byHour: viewsByHour || {},
    },
    recentPages: recentViews?.slice(0, 10) || [],
  };
}

/**
 * Export analytics data to CSV format
 */
export function exportToCSV(data: any[], filename: string) {
  if (!data || data.length === 0) return;

  const headers = Object.keys(data[0]);
  const csvContent =
    headers.join(",") +
    "\n" +
    data.map((row) => headers.map((header) => row[header]).join(",")).join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}-${format(new Date(), "yyyy-MM-dd")}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
