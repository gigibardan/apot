-- Create notifications table for forum
CREATE TABLE IF NOT EXISTS public.forum_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('reply', 'mention', 'upvote', 'report_resolved')),
  post_id UUID REFERENCES public.forum_posts(id) ON DELETE CASCADE,
  reply_id UUID REFERENCES public.forum_replies(id) ON DELETE CASCADE,
  actor_id UUID,
  message TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add indexes
CREATE INDEX idx_forum_notifications_user_id ON public.forum_notifications(user_id);
CREATE INDEX idx_forum_notifications_read ON public.forum_notifications(read);
CREATE INDEX idx_forum_notifications_created_at ON public.forum_notifications(created_at DESC);

-- Enable RLS
ALTER TABLE public.forum_notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own notifications"
  ON public.forum_notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
  ON public.forum_notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- Function to create notification when reply is created
CREATE OR REPLACE FUNCTION public.create_reply_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  post_author_id UUID;
  parent_author_id UUID;
  actor_name TEXT;
BEGIN
  -- Get actor name
  SELECT full_name INTO actor_name
  FROM public.profiles
  WHERE id = NEW.user_id;

  -- Get post author
  SELECT user_id INTO post_author_id
  FROM public.forum_posts
  WHERE id = NEW.post_id;

  -- Notify post author if reply is direct to post
  IF NEW.parent_reply_id IS NULL AND post_author_id != NEW.user_id THEN
    INSERT INTO public.forum_notifications (user_id, type, post_id, reply_id, actor_id, message)
    VALUES (
      post_author_id,
      'reply',
      NEW.post_id,
      NEW.id,
      NEW.user_id,
      actor_name || ' a răspuns la postul tău'
    );
  END IF;

  -- If it's a nested reply, notify parent reply author
  IF NEW.parent_reply_id IS NOT NULL THEN
    SELECT user_id INTO parent_author_id
    FROM public.forum_replies
    WHERE id = NEW.parent_reply_id;

    IF parent_author_id != NEW.user_id THEN
      INSERT INTO public.forum_notifications (user_id, type, post_id, reply_id, actor_id, message)
      VALUES (
        parent_author_id,
        'reply',
        NEW.post_id,
        NEW.id,
        NEW.user_id,
        actor_name || ' a răspuns la comentariul tău'
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- Create trigger for reply notifications
DROP TRIGGER IF EXISTS trigger_create_reply_notification ON public.forum_replies;
CREATE TRIGGER trigger_create_reply_notification
  AFTER INSERT ON public.forum_replies
  FOR EACH ROW
  EXECUTE FUNCTION public.create_reply_notification();

-- Function to create notification when someone upvotes
CREATE OR REPLACE FUNCTION public.create_vote_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  content_author_id UUID;
  actor_name TEXT;
BEGIN
  -- Only notify on upvotes
  IF NEW.vote_type != 'upvote' THEN
    RETURN NEW;
  END IF;

  -- Get actor name
  SELECT full_name INTO actor_name
  FROM public.profiles
  WHERE id = NEW.user_id;

  -- Get content author
  IF NEW.post_id IS NOT NULL THEN
    SELECT user_id INTO content_author_id
    FROM public.forum_posts
    WHERE id = NEW.post_id;
  ELSIF NEW.reply_id IS NOT NULL THEN
    SELECT user_id INTO content_author_id
    FROM public.forum_replies
    WHERE id = NEW.reply_id;
  END IF;

  -- Don't notify if voting own content
  IF content_author_id = NEW.user_id THEN
    RETURN NEW;
  END IF;

  -- Create notification (limit to avoid spam)
  -- Only notify if user doesn't have recent similar notifications
  IF NOT EXISTS (
    SELECT 1 FROM public.forum_notifications
    WHERE user_id = content_author_id
      AND type = 'upvote'
      AND (post_id = NEW.post_id OR reply_id = NEW.reply_id)
      AND created_at > now() - INTERVAL '1 hour'
  ) THEN
    INSERT INTO public.forum_notifications (user_id, type, post_id, reply_id, actor_id, message)
    VALUES (
      content_author_id,
      'upvote',
      NEW.post_id,
      NEW.reply_id,
      NEW.user_id,
      actor_name || ' a apreciat contribuția ta'
    );
  END IF;

  RETURN NEW;
END;
$$;

-- Create trigger for vote notifications
DROP TRIGGER IF EXISTS trigger_create_vote_notification ON public.forum_votes;
CREATE TRIGGER trigger_create_vote_notification
  AFTER INSERT ON public.forum_votes
  FOR EACH ROW
  EXECUTE FUNCTION public.create_vote_notification();

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.forum_notifications;