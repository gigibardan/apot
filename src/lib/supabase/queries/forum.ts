import { supabase } from "@/integrations/supabase/client";
import type { ForumCategory, ForumPost, ForumReply } from "@/types/forum";

/**
 * Get all forum categories with post counts
 */
export async function getForumCategories(): Promise<ForumCategory[]> {
  const { data, error } = await supabase
    .from('forum_categories')
    .select('*')
    .order('order_index');

  if (error) throw error;
  return data || [];
}

/**
 * Get a single category by slug
 */
export async function getCategoryBySlug(slug: string): Promise<ForumCategory | null> {
  const { data, error } = await supabase
    .from('forum_categories')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Get posts for a category with pagination
 */
export async function getPostsByCategory(
  categoryId: string,
  { limit = 20, offset = 0, sortBy = 'last_activity' }: {
    limit?: number;
    offset?: number;
    sortBy?: 'last_activity' | 'created' | 'popular' | 'pinned';
  } = {}
): Promise<{ posts: ForumPost[]; count: number }> {
  let query = supabase
    .from('forum_posts')
    .select(`
      *,
      category:forum_categories(*),
      author:profiles!forum_posts_user_id_fkey(id, full_name, username, avatar_url)
    `, { count: 'exact' })
    .eq('category_id', categoryId)
    .eq('status', 'active');

  // Sorting
  if (sortBy === 'pinned') {
    query = query
      .order('pinned', { ascending: false })
      .order('last_activity_at', { ascending: false });
  } else if (sortBy === 'popular') {
    query = query.order('upvotes_count', { ascending: false });
  } else if (sortBy === 'created') {
    query = query.order('created_at', { ascending: false });
  } else {
    query = query.order('last_activity_at', { ascending: false });
  }

  query = query.range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) throw error;
  return { posts: data || [], count: count || 0 };
}

/**
 * Get a single post with all details
 */
export async function getPostBySlug(
  categorySlug: string,
  postSlug: string
): Promise<ForumPost | null> {
  // First get category to get its ID
  const { data: category } = await supabase
    .from('forum_categories')
    .select('id')
    .eq('slug', categorySlug)
    .single();

  if (!category) return null;

  const { data, error } = await supabase
    .from('forum_posts')
    .select(`
      *,
      category:forum_categories(*),
      author:profiles!forum_posts_user_id_fkey(id, full_name, username, avatar_url)
    `)
    .eq('category_id', category.id)
    .eq('slug', postSlug)
    .eq('status', 'active')
    .single();

  if (error) throw error;

  // Increment view count
  if (data) {
    await supabase
      .from('forum_posts')
      .update({ views_count: data.views_count + 1 })
      .eq('id', data.id);
  }

  return data;
}

/**
 * Get replies for a post (nested structure)
 */
/**
 * Get replies for a post (nested structure)
 */
export async function getRepliesForPost(postId: string, userId?: string): Promise<ForumReply[]> {
  const { data, error } = await supabase
    .from('forum_replies')
    .select(`
      *,
      author:profiles!forum_replies_user_id_fkey(id, full_name, username, avatar_url)
    `)
    .eq('post_id', postId)
    .eq('status', 'active')
    .order('created_at', { ascending: true });

  if (error) throw error;

  // Get user votes if userId provided
  let userVotes: Map<string, 'upvote' | 'downvote'> = new Map();
  if (userId && data) {
    const replyIds = data.map(r => r.id);
    const { data: votes } = await supabase
      .from('forum_votes')
      .select('reply_id, vote_type')
      .eq('user_id', userId)
      .in('reply_id', replyIds);

    votes?.forEach(vote => {
      if (vote.reply_id) {
        userVotes.set(vote.reply_id, vote.vote_type);
      }
    });
  }

  // Build nested structure
  const repliesMap = new Map<string, ForumReply>();
  const rootReplies: ForumReply[] = [];

  // Initialize map with all replies + user_vote
  data?.forEach(reply => {
    repliesMap.set(reply.id, {
      ...reply,
      replies: [],
      user_vote: userId ? (userVotes.get(reply.id) || null) : null
    });
  });

  // Build tree structure
  data?.forEach(reply => {
    const replyNode = repliesMap.get(reply.id);
    if (!replyNode) return;

    if (reply.parent_reply_id) {
      const parent = repliesMap.get(reply.parent_reply_id);
      if (parent) {
        parent.replies = parent.replies || [];
        parent.replies.push(replyNode);
      }
    } else {
      rootReplies.push(replyNode);
    }
  });

  return rootReplies;
}

/**
 * Get user's vote for a post
 */
export async function getUserVoteForPost(
  postId: string,
  userId: string
): Promise<'upvote' | 'downvote' | null> {
  const { data } = await supabase
    .from('forum_votes')
    .select('vote_type')
    .eq('post_id', postId)
    .eq('user_id', userId)
    .single();

  return data?.vote_type || null;
}

/**
 * Get user's vote for a reply
 */
export async function getUserVoteForReply(
  replyId: string,
  userId: string
): Promise<'upvote' | 'downvote' | null> {
  const { data } = await supabase
    .from('forum_votes')
    .select('vote_type')
    .eq('reply_id', replyId)
    .eq('user_id', userId)
    .single();

  return data?.vote_type || null;
}

/**
 * Search posts across all categories
 */
export async function searchPosts(
  query: string,
  { limit = 20, offset = 0 }: { limit?: number; offset?: number } = {}
): Promise<{ posts: ForumPost[]; count: number }> {
  const { data, error, count } = await supabase
    .from('forum_posts')
    .select(`
      *,
      category:forum_categories(*),
      author:profiles!forum_posts_user_id_fkey(id, full_name, avatar_url)
    `, { count: 'exact' })
    .eq('status', 'active')
    .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
    .order('last_activity_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;
  return { posts: data || [], count: count || 0 };
}

/**
 * Get recent posts across all categories
 */
export async function getRecentPosts(limit = 10): Promise<ForumPost[]> {
  const { data, error } = await supabase
    .from('forum_posts')
    .select(`
      *,
      category:forum_categories(*),
      author:profiles!forum_posts_user_id_fkey(id, full_name, avatar_url)
    `)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
}

/**
 * Get user's posts
 */
export async function getUserPosts(
  userId: string,
  { limit = 20, offset = 0 }: { limit?: number; offset?: number } = {}
): Promise<{ posts: ForumPost[]; count: number }> {
  const { data, error, count } = await supabase
    .from('forum_posts')
    .select(`
      *,
      category:forum_categories(*)
    `, { count: 'exact' })
    .eq('user_id', userId)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;
  return { posts: data || [], count: count || 0 };
}

/**
 * Get user's replies
 */
export async function getUserReplies(
  userId: string,
  { limit = 20, offset = 0 }: { limit?: number; offset?: number } = {}
): Promise<{ replies: ForumReply[]; count: number }> {
  const { data, error, count } = await supabase
    .from('forum_replies')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;
  return { replies: data || [], count: count || 0 };
}
