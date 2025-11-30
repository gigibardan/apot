-- Fix function search_path security issue
-- Set search_path on all security definer functions to prevent SQL injection

-- Note: We're altering existing functions to add search_path

-- For plpgsql functions, we need to ensure search_path is set
ALTER FUNCTION public.update_guide_rating() SET search_path = 'public';
ALTER FUNCTION public.update_updated_at_column() SET search_path = 'public';
ALTER FUNCTION public.update_post_replies_count() SET search_path = 'public';
ALTER FUNCTION public.update_category_posts_count() SET search_path = 'public';
ALTER FUNCTION public.update_vote_counts() SET search_path = 'public';
ALTER FUNCTION public.create_reply_notification() SET search_path = 'public';
ALTER FUNCTION public.create_vote_notification() SET search_path = 'public';
ALTER FUNCTION public.update_user_reputation() SET search_path = 'public';
ALTER FUNCTION public.update_reputation_on_vote() SET search_path = 'public';
ALTER FUNCTION public.notify_thread_subscribers() SET search_path = 'public';
ALTER FUNCTION public.update_translation_updated_at() SET search_path = 'public';
ALTER FUNCTION public.update_journal_likes_count() SET search_path = 'public';
ALTER FUNCTION public.update_contest_votes_count() SET search_path = 'public';
ALTER FUNCTION public.auto_expire_suspensions() SET search_path = 'public';
ALTER FUNCTION public.handle_new_user() SET search_path = 'public';