-- ============================================
-- FORUM SYSTEM: Add Missing Foreign Keys to Profiles
-- Date: 2024-12-03
-- Purpose: Fix 400 errors for forum queries with profiles JOIN
-- ============================================

-- 1. forum_posts.user_id → profiles.id
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'forum_posts_user_id_fkey' 
    AND table_name = 'forum_posts'
  ) THEN
    ALTER TABLE public.forum_posts
    ADD CONSTRAINT forum_posts_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
  END IF;
END $$;

-- 2. forum_replies.user_id → profiles.id
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'forum_replies_user_id_fkey' 
    AND table_name = 'forum_replies'
  ) THEN
    ALTER TABLE public.forum_replies
    ADD CONSTRAINT forum_replies_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
  END IF;
END $$;

-- 3. forum_votes.user_id → profiles.id
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'forum_votes_user_id_fkey' 
    AND table_name = 'forum_votes'
  ) THEN
    ALTER TABLE public.forum_votes
    ADD CONSTRAINT forum_votes_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
  END IF;
END $$;

-- 4. forum_reports.reporter_id → profiles.id
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'forum_reports_reporter_id_fkey' 
    AND table_name = 'forum_reports'
  ) THEN
    ALTER TABLE public.forum_reports
    ADD CONSTRAINT forum_reports_reporter_id_fkey
    FOREIGN KEY (reporter_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
  END IF;
END $$;

-- 5. forum_reports.resolved_by → profiles.id (NULLABLE - SET NULL)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'forum_reports_resolved_by_fkey' 
    AND table_name = 'forum_reports'
  ) THEN
    ALTER TABLE public.forum_reports
    ADD CONSTRAINT forum_reports_resolved_by_fkey
    FOREIGN KEY (resolved_by) REFERENCES public.profiles(id) ON DELETE SET NULL;
  END IF;
END $$;

-- 6. forum_subscriptions.user_id → profiles.id
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'forum_subscriptions_user_id_fkey' 
    AND table_name = 'forum_subscriptions'
  ) THEN
    ALTER TABLE public.forum_subscriptions
    ADD CONSTRAINT forum_subscriptions_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
  END IF;
END $$;

-- 7. forum_notifications.user_id → profiles.id
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'forum_notifications_user_id_fkey' 
    AND table_name = 'forum_notifications'
  ) THEN
    ALTER TABLE public.forum_notifications
    ADD CONSTRAINT forum_notifications_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
  END IF;
END $$;

-- 8. forum_notifications.actor_id → profiles.id (NULLABLE - SET NULL)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'forum_notifications_actor_id_fkey' 
    AND table_name = 'forum_notifications'
  ) THEN
    ALTER TABLE public.forum_notifications
    ADD CONSTRAINT forum_notifications_actor_id_fkey
    FOREIGN KEY (actor_id) REFERENCES public.profiles(id) ON DELETE SET NULL;
  END IF;
END $$;