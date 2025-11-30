import { supabase } from "@/integrations/supabase/client";

/**
 * Create a new forum post
 */
export async function createPost(data: {
  category_id: string;
  title: string;
  content: string;
}) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  // Generate slug from title
  const slug = data.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  const { data: post, error } = await supabase
    .from('forum_posts')
    .insert({
      ...data,
      slug,
      user_id: user.id,
    })
    .select()
    .single();

  if (error) throw error;
  return post;
}

/**
 * Update a forum post
 */
export async function updatePost(
  postId: string,
  data: {
    title?: string;
    content?: string;
  }
) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data: post, error } = await supabase
    .from('forum_posts')
    .update(data)
    .eq('id', postId)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) throw error;
  return post;
}

/**
 * Delete a forum post (soft delete)
 */
export async function deletePost(postId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { error } = await supabase
    .from('forum_posts')
    .update({ status: 'deleted' })
    .eq('id', postId)
    .eq('user_id', user.id);

  if (error) throw error;
}

/**
 * Create a reply to a post or another reply
 */
export async function createReply(data: {
  post_id: string;
  parent_reply_id?: string | null;
  content: string;
}) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  // Calculate depth if it's a nested reply
  let depth = 0;
  if (data.parent_reply_id) {
    const { data: parentReply } = await supabase
      .from('forum_replies')
      .select('depth')
      .eq('id', data.parent_reply_id)
      .single();
    
    if (parentReply) {
      depth = parentReply.depth + 1;
      if (depth > 3) {
        throw new Error('Maximum nesting depth reached');
      }
    }
  }

  const { data: reply, error } = await supabase
    .from('forum_replies')
    .insert({
      ...data,
      user_id: user.id,
      depth,
    })
    .select()
    .single();

  if (error) throw error;
  return reply;
}

/**
 * Update a reply
 */
export async function updateReply(
  replyId: string,
  data: { content: string }
) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data: reply, error } = await supabase
    .from('forum_replies')
    .update(data)
    .eq('id', replyId)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) throw error;
  return reply;
}

/**
 * Delete a reply (soft delete)
 */
export async function deleteReply(replyId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { error } = await supabase
    .from('forum_replies')
    .update({ status: 'deleted' })
    .eq('id', replyId)
    .eq('user_id', user.id);

  if (error) throw error;
}

/**
 * Vote on a post
 */
export async function voteOnPost(
  postId: string,
  voteType: 'upvote' | 'downvote'
) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  // Check if user already voted
  const { data: existingVote } = await supabase
    .from('forum_votes')
    .select('*')
    .eq('post_id', postId)
    .eq('user_id', user.id)
    .single();

  if (existingVote) {
    if (existingVote.vote_type === voteType) {
      // Remove vote if clicking same button
      const { error } = await supabase
        .from('forum_votes')
        .delete()
        .eq('id', existingVote.id);
      
      if (error) throw error;
      return null;
    } else {
      // Update vote type
      const { data, error } = await supabase
        .from('forum_votes')
        .update({ vote_type: voteType })
        .eq('id', existingVote.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    }
  } else {
    // Create new vote
    const { data, error } = await supabase
      .from('forum_votes')
      .insert({
        post_id: postId,
        user_id: user.id,
        vote_type: voteType,
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
}

/**
 * Vote on a reply
 */
export async function voteOnReply(
  replyId: string,
  voteType: 'upvote' | 'downvote'
) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  // Check if user already voted
  const { data: existingVote } = await supabase
    .from('forum_votes')
    .select('*')
    .eq('reply_id', replyId)
    .eq('user_id', user.id)
    .single();

  if (existingVote) {
    if (existingVote.vote_type === voteType) {
      // Remove vote if clicking same button
      const { error } = await supabase
        .from('forum_votes')
        .delete()
        .eq('id', existingVote.id);
      
      if (error) throw error;
      return null;
    } else {
      // Update vote type
      const { data, error } = await supabase
        .from('forum_votes')
        .update({ vote_type: voteType })
        .eq('id', existingVote.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    }
  } else {
    // Create new vote
    const { data, error } = await supabase
      .from('forum_votes')
      .insert({
        reply_id: replyId,
        user_id: user.id,
        vote_type: voteType,
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
}

/**
 * Report a post or reply
 */
export async function reportContent(data: {
  post_id?: string;
  reply_id?: string;
  reason: string;
  description?: string;
}) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data: report, error } = await supabase
    .from('forum_reports')
    .insert({
      ...data,
      reporter_id: user.id,
    })
    .select()
    .single();

  if (error) throw error;
  return report;
}

/**
 * Pin/unpin a post (admin only)
 */
export async function togglePinPost(postId: string, pinned: boolean) {
  const { error } = await supabase
    .from('forum_posts')
    .update({ pinned })
    .eq('id', postId);

  if (error) throw error;
}

/**
 * Lock/unlock a post (admin only)
 */
export async function toggleLockPost(postId: string, locked: boolean) {
  const { error } = await supabase
    .from('forum_posts')
    .update({ locked })
    .eq('id', postId);

  if (error) throw error;
}
