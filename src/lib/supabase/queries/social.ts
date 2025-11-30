/**
 * Social Features Queries
 * Follow system, profiles, activity feeds, leaderboards
 */

import { supabase } from "@/integrations/supabase/client";

// =============================================
// FOLLOW SYSTEM
// =============================================

export async function getUserFollowers(userId: string, page = 1, limit = 20) {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, error, count } = await supabase
    .from("user_follows")
    .select(`
      id,
      created_at,
      follower:profiles!user_follows_follower_id_fkey(
        id,
        full_name,
        username,
        avatar_url
      )
    `, { count: "exact" })
    .eq("following_id", userId)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) throw error;

  return {
    followers: data || [],
    total: count || 0,
    hasMore: (count || 0) > to + 1,
  };
}

export async function getUserFollowing(userId: string, page = 1, limit = 20) {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, error, count } = await supabase
    .from("user_follows")
    .select(`
      id,
      created_at,
      following:profiles!user_follows_following_id_fkey(
        id,
        full_name,
        username,
        avatar_url
      )
    `, { count: "exact" })
    .eq("follower_id", userId)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) throw error;

  return {
    following: data || [],
    total: count || 0,
    hasMore: (count || 0) > to + 1,
  };
}

export async function isFollowing(userId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data, error } = await supabase
    .from("user_follows")
    .select("id")
    .eq("follower_id", user.id)
    .eq("following_id", userId)
    .single();

  if (error && error.code !== "PGRST116") throw error;

  return !!data;
}

export async function getFollowStats(userId: string) {
  const [followers, following] = await Promise.all([
    supabase
      .from("user_follows")
      .select("*", { count: "exact", head: true })
      .eq("following_id", userId),
    supabase
      .from("user_follows")
      .select("*", { count: "exact", head: true })
      .eq("follower_id", userId),
  ]);

  return {
    followersCount: followers.count || 0,
    followingCount: following.count || 0,
  };
}

// =============================================
// USER PROFILES
// =============================================

export async function getUserProfile(username: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username)
    .single();

  if (error) throw error;

  // Get follow stats
  const stats = await getFollowStats(data.id);

  // Get user points and level
  const { data: points } = await supabase
    .from("user_points")
    .select("*")
    .eq("user_id", data.id)
    .single();

  // Get badges
  const { data: badges } = await supabase
    .from("user_badges")
    .select("*")
    .eq("user_id", data.id)
    .order("earned_at", { ascending: false });

  return {
    ...data,
    ...stats,
    points: points || { total_points: 0, level: 1 },
    badges: badges || [],
  };
}

export async function getUserByUsername(username: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username)
    .single();

  if (error) throw error;
  return data;
}

// =============================================
// ACTIVITY FEED
// =============================================

export async function getUserActivity(userId: string, page = 1, limit = 20) {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, error, count } = await supabase
    .from("user_activity")
    .select("*", { count: "exact" })
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) throw error;

  return {
    activities: data || [],
    total: count || 0,
    hasMore: (count || 0) > to + 1,
  };
}

export async function getFollowingActivityFeed(page = 1, limit = 20) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // Get users that current user follows
  const { data: following } = await supabase
    .from("user_follows")
    .select("following_id")
    .eq("follower_id", user.id);

  if (!following || following.length === 0) {
    return { activities: [], total: 0, hasMore: false };
  }

  const followingIds = following.map((f) => f.following_id);

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, error, count } = await supabase
    .from("user_activity")
    .select(`
      *,
      user:profiles!user_activity_user_id_fkey(
        id,
        full_name,
        username,
        avatar_url
      )
    `, { count: "exact" })
    .in("user_id", followingIds)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) throw error;

  return {
    activities: data || [],
    total: count || 0,
    hasMore: (count || 0) > to + 1,
  };
}

// =============================================
// LEADERBOARDS
// =============================================

export async function getTopContributors(timeframe = "all", limit = 10) {
  // Calculate based on reviews + posts + suggestions
  const { data, error } = await supabase
    .from("user_reputation")
    .select(`
      user_id,
      reputation_points,
      posts_count,
      replies_count,
      helpful_count,
      user:profiles!user_reputation_user_id_fkey(
        full_name,
        username,
        avatar_url
      )
    `)
    .order("reputation_points", { ascending: false })
    .limit(limit);

  if (error) throw error;

  return data || [];
}

export async function getTopExplorers(limit = 10) {
  // Users with most favorites across different objectives
  const { data, error } = await supabase
    .from("user_favorites")
    .select(`
      user_id,
      created_at,
      user:profiles!user_favorites_user_id_fkey(
        full_name,
        username,
        avatar_url
      )
    `)
    .order("created_at", { ascending: false });

  if (error) throw error;

  // Group by user and count
  const userCounts = (data || []).reduce((acc: any, fav) => {
    const userId = fav.user_id;
    if (!acc[userId]) {
      acc[userId] = {
        user: fav.user,
        count: 0,
      };
    }
    acc[userId].count++;
    return acc;
  }, {});

  return Object.values(userCounts)
    .sort((a: any, b: any) => b.count - a.count)
    .slice(0, limit);
}

export async function getPointsLeaderboard(limit = 10) {
  const { data, error } = await supabase
    .from("user_points")
    .select(`
      user_id,
      total_points,
      level,
      user:profiles!user_points_user_id_fkey(
        full_name,
        username,
        avatar_url
      )
    `)
    .order("total_points", { ascending: false })
    .limit(limit);

  if (error) throw error;

  return data || [];
}

// =============================================
// USER STATS
// =============================================

export async function getUserStats(userId: string) {
  const [favorites, reviews, objectiveReviews, posts, followers, following] =
    await Promise.all([
      supabase
        .from("user_favorites")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId),
      supabase
        .from("guide_reviews")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId),
      supabase
        .from("objective_reviews")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId),
      supabase
        .from("forum_posts")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId),
      supabase
        .from("user_follows")
        .select("*", { count: "exact", head: true })
        .eq("following_id", userId),
      supabase
        .from("user_follows")
        .select("*", { count: "exact", head: true })
        .eq("follower_id", userId),
    ]);

  return {
    favoritesCount: favorites.count || 0,
    reviewsCount: (reviews.count || 0) + (objectiveReviews.count || 0),
    postsCount: posts.count || 0,
    followersCount: followers.count || 0,
    followingCount: following.count || 0,
  };
}

// =============================================
// USER CONTENT QUERIES FOR PUBLIC PROFILE
// =============================================

/**
 * Get user's favorite objectives
 * Returns objectives marked as favorites by the user
 */
export async function getUserFavorites(userId: string, page = 1, limit = 12) {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, error, count } = await supabase
    .from("user_favorites")
    .select(`
      id,
      created_at,
      objective:objectives!inner(
        id,
        slug,
        title,
        excerpt,
        featured_image,
        country:countries(name),
        continent:continents(name)
      )
    `, { count: "exact" })
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) throw error;

  // Transform nested arrays to objects
  const transformedData = (data || []).map((item: any) => ({
    ...item,
    objective: Array.isArray(item.objective) ? item.objective[0] : item.objective,
  }));

  return {
    favorites: transformedData,
    total: count || 0,
    hasMore: (count || 0) > to + 1,
  };
}

/**
 * Get user's reviews (both objective and guide reviews)
 * Returns combined reviews with related content
 */
export async function getUserReviews(userId: string, page = 1, limit = 12) {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  // Get objective reviews
  const { data: objectiveReviews, error: objError } = await supabase
    .from("objective_reviews")
    .select(`
      id,
      rating,
      title,
      comment,
      created_at,
      helpful_count,
      objective:objectives!inner(
        id,
        slug,
        title,
        featured_image
      )
    `)
    .eq("user_id", userId)
    .eq("approved", true)
    .order("created_at", { ascending: false });

  // Get guide reviews
  const { data: guideReviews, error: guideError } = await supabase
    .from("guide_reviews")
    .select(`
      id,
      rating,
      title,
      comment,
      created_at,
      helpful_count,
      guide:guides!inner(
        id,
        slug,
        full_name,
        profile_image
      )
    `)
    .eq("user_id", userId)
    .eq("approved", true)
    .order("created_at", { ascending: false });

  if (objError) throw objError;
  if (guideError) throw guideError;

  // Transform and combine results
  const transformedObjectiveReviews = (objectiveReviews || []).map((r: any) => ({
    ...r,
    type: 'objective' as const,
    objective: Array.isArray(r.objective) ? r.objective[0] : r.objective
  }));

  const transformedGuideReviews = (guideReviews || []).map((r: any) => ({
    ...r,
    type: 'guide' as const,
    guide: Array.isArray(r.guide) ? r.guide[0] : r.guide
  }));

  // Combine and sort by date
  const allReviews = [
    ...transformedObjectiveReviews,
    ...transformedGuideReviews
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const paginatedReviews = allReviews.slice(from, to + 1);

  return {
    reviews: paginatedReviews,
    total: allReviews.length,
    hasMore: allReviews.length > to + 1,
  };
}

/**
 * Get user's forum posts
 * Returns forum posts created by the user
 */
export async function getUserForumPosts(userId: string, page = 1, limit = 12) {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, error, count } = await supabase
    .from("forum_posts")
    .select(`
      id,
      slug,
      title,
      content,
      created_at,
      views_count,
      replies_count,
      upvotes_count,
      category:forum_categories!inner(
        id,
        slug,
        name,
        color
      )
    `, { count: "exact" })
    .eq("user_id", userId)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) throw error;

  // Transform nested arrays to objects
  const transformedData = (data || []).map((item: any) => ({
    ...item,
    category: Array.isArray(item.category) ? item.category[0] : item.category,
  }));

  return {
    posts: transformedData,
    total: count || 0,
    hasMore: (count || 0) > to + 1,
  };
}

/**
 * Get user's recent activity
 * Returns recent activities formatted for display
 */
export async function getUserRecentActivity(userId: string, limit = 10) {
  const { data, error } = await supabase
    .from("user_activity")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;

  return data || [];
}
