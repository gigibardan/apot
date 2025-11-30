import { supabase } from "@/integrations/supabase/client";

/**
 * Subscribe to a forum thread
 */
export async function subscribeToThread(postId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User must be authenticated');

  const { error } = await supabase
    .from('forum_subscriptions')
    .insert({
      user_id: user.id,
      post_id: postId,
      notify_replies: true,
    });

  if (error) throw error;
}

/**
 * Unsubscribe from a forum thread
 */
export async function unsubscribeFromThread(postId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User must be authenticated');

  const { error } = await supabase
    .from('forum_subscriptions')
    .delete()
    .eq('user_id', user.id)
    .eq('post_id', postId);

  if (error) throw error;
}

/**
 * Check if user is subscribed to a thread
 */
export async function isSubscribedToThread(postId: string): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data, error } = await supabase
    .from('forum_subscriptions')
    .select('id')
    .eq('user_id', user.id)
    .eq('post_id', postId)
    .maybeSingle();

  if (error) throw error;
  return !!data;
}

/**
 * Get user's subscribed threads
 */
export async function getUserSubscriptions(userId: string) {
  const { data, error } = await supabase
    .from('forum_subscriptions')
    .select(`
      *,
      post:forum_posts(
        id,
        title,
        slug,
        category_id,
        replies_count,
        last_activity_at,
        category:forum_categories(name, slug)
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}
