-- Fix security warnings: Add search_path to all functions

-- Drop and recreate update_updated_at_column with search_path
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Drop and recreate update_post_replies_count with search_path
DROP FUNCTION IF EXISTS public.update_post_replies_count() CASCADE;
CREATE OR REPLACE FUNCTION public.update_post_replies_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.forum_posts 
    SET replies_count = replies_count + 1,
        last_activity_at = now()
    WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.forum_posts 
    SET replies_count = GREATEST(0, replies_count - 1)
    WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$;

-- Drop and recreate update_category_posts_count with search_path
DROP FUNCTION IF EXISTS public.update_category_posts_count() CASCADE;
CREATE OR REPLACE FUNCTION public.update_category_posts_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.forum_categories 
    SET posts_count = posts_count + 1
    WHERE id = NEW.category_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.forum_categories 
    SET posts_count = GREATEST(0, posts_count - 1)
    WHERE id = OLD.category_id;
  END IF;
  RETURN NULL;
END;
$$;

-- Drop and recreate update_vote_counts with search_path
DROP FUNCTION IF EXISTS public.update_vote_counts() CASCADE;
CREATE OR REPLACE FUNCTION public.update_vote_counts()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.post_id IS NOT NULL THEN
      IF NEW.vote_type = 'upvote' THEN
        UPDATE public.forum_posts SET upvotes_count = upvotes_count + 1 WHERE id = NEW.post_id;
      ELSE
        UPDATE public.forum_posts SET downvotes_count = downvotes_count + 1 WHERE id = NEW.post_id;
      END IF;
    ELSIF NEW.reply_id IS NOT NULL THEN
      IF NEW.vote_type = 'upvote' THEN
        UPDATE public.forum_replies SET upvotes_count = upvotes_count + 1 WHERE id = NEW.reply_id;
      ELSE
        UPDATE public.forum_replies SET downvotes_count = downvotes_count + 1 WHERE id = NEW.reply_id;
      END IF;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.post_id IS NOT NULL THEN
      IF OLD.vote_type = 'upvote' THEN
        UPDATE public.forum_posts SET upvotes_count = GREATEST(0, upvotes_count - 1) WHERE id = OLD.post_id;
      ELSE
        UPDATE public.forum_posts SET downvotes_count = GREATEST(0, downvotes_count - 1) WHERE id = OLD.post_id;
      END IF;
    ELSIF OLD.reply_id IS NOT NULL THEN
      IF OLD.vote_type = 'upvote' THEN
        UPDATE public.forum_replies SET upvotes_count = GREATEST(0, upvotes_count - 1) WHERE id = OLD.reply_id;
      ELSE
        UPDATE public.forum_replies SET downvotes_count = GREATEST(0, downvotes_count - 1) WHERE id = OLD.reply_id;
      END IF;
    END IF;
  END IF;
  RETURN NULL;
END;
$$;

-- Recreate triggers
CREATE TRIGGER update_forum_categories_updated_at
  BEFORE UPDATE ON public.forum_categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_forum_posts_updated_at
  BEFORE UPDATE ON public.forum_posts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_forum_replies_updated_at
  BEFORE UPDATE ON public.forum_replies
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_post_replies_count_trigger
  AFTER INSERT OR DELETE ON public.forum_replies
  FOR EACH ROW EXECUTE FUNCTION public.update_post_replies_count();

CREATE TRIGGER update_category_posts_count_trigger
  AFTER INSERT OR DELETE ON public.forum_posts
  FOR EACH ROW EXECUTE FUNCTION public.update_category_posts_count();

CREATE TRIGGER update_vote_counts_trigger
  AFTER INSERT OR DELETE ON public.forum_votes
  FOR EACH ROW EXECUTE FUNCTION public.update_vote_counts();