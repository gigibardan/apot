import { supabase } from "@/integrations/supabase/client";

export interface ForumNotification {
  id: string;
  user_id: string;
  type: 'reply' | 'mention' | 'upvote' | 'report_resolved';
  post_id: string | null;
  reply_id: string | null;
  actor_id: string | null;
  message: string;
  read: boolean;
  created_at: string;
  actor?: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
  };
  post?: {
    title: string;
    slug: string;
    category_id: string;
  };
  category?: {
    slug: string;
  };
}

/**
 * Get user notifications with pagination
 */
export async function getUserNotifications(
  userId: string,
  { limit = 20, offset = 0, unreadOnly = false }: {
    limit?: number;
    offset?: number;
    unreadOnly?: boolean;
  } = {}
): Promise<{ notifications: ForumNotification[]; count: number }> {
  let query = supabase
    .from('forum_notifications')
    .select(`
      *,
      actor:profiles!forum_notifications_actor_id_fkey(id, full_name, avatar_url),
      post:forum_posts!forum_notifications_post_id_fkey(title, slug, category_id),
      category:forum_posts!forum_notifications_post_id_fkey(category:forum_categories(slug))
    `, { count: 'exact' })
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (unreadOnly) {
    query = query.eq('read', false);
  }

  query = query.range(offset, offset + limit - 1);

  const { data, error, count } = await query;
  
  if (error) throw error;
  return { notifications: (data || []) as any[], count: count || 0 };
}

/**
 * Get unread notification count
 */
export async function getUnreadCount(userId: string): Promise<number> {
  const { count, error } = await supabase
    .from('forum_notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('read', false);
  
  if (error) throw error;
  return count || 0;
}

/**
 * Mark notification as read
 */
export async function markNotificationAsRead(notificationId: string) {
  const { error } = await supabase
    .from('forum_notifications')
    .update({ read: true })
    .eq('id', notificationId);
  
  if (error) throw error;
}

/**
 * Mark all notifications as read
 */
export async function markAllNotificationsAsRead(userId: string) {
  const { error } = await supabase
    .from('forum_notifications')
    .update({ read: true })
    .eq('user_id', userId)
    .eq('read', false);
  
  if (error) throw error;
}

/**
 * Subscribe to new notifications
 */
export function subscribeToNotifications(
  userId: string,
  callback: (notification: ForumNotification) => void
) {
  const channel = supabase
    .channel('forum-notifications')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'forum_notifications',
        filter: `user_id=eq.${userId}`
      },
      async (payload) => {
        // Fetch full notification with relations
        const { data } = await supabase
          .from('forum_notifications')
          .select(`
            *,
            actor:profiles!forum_notifications_actor_id_fkey(id, full_name, avatar_url),
            post:forum_posts!forum_notifications_post_id_fkey(title, slug, category_id),
            category:forum_posts!forum_notifications_post_id_fkey(category:forum_categories(slug))
          `)
          .eq('id', payload.new.id)
          .single();
        
        if (data) {
          callback(data as any);
        }
      }
    )
    .subscribe();

  return channel;
}
