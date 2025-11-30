-- Create user reputation table
CREATE TABLE IF NOT EXISTS public.user_reputation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reputation_points INTEGER DEFAULT 0,
  posts_count INTEGER DEFAULT 0,
  replies_count INTEGER DEFAULT 0,
  helpful_count INTEGER DEFAULT 0,
  best_answer_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- Create thread subscriptions table
CREATE TABLE IF NOT EXISTS public.forum_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES public.forum_posts(id) ON DELETE CASCADE,
  notify_replies BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, post_id)
);

-- Enable RLS
ALTER TABLE public.user_reputation ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_reputation
CREATE POLICY "Anyone can view reputation"
  ON public.user_reputation FOR SELECT
  USING (true);

CREATE POLICY "Users can update own reputation"
  ON public.user_reputation FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for forum_subscriptions
CREATE POLICY "Users can view own subscriptions"
  ON public.forum_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own subscriptions"
  ON public.forum_subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own subscriptions"
  ON public.forum_subscriptions FOR DELETE
  USING (auth.uid() = user_id);

-- Function to update user reputation
CREATE OR REPLACE FUNCTION public.update_user_reputation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert or update reputation record
  INSERT INTO public.user_reputation (user_id, posts_count, replies_count, reputation_points)
  VALUES (
    NEW.user_id,
    CASE WHEN TG_TABLE_NAME = 'forum_posts' THEN 1 ELSE 0 END,
    CASE WHEN TG_TABLE_NAME = 'forum_replies' THEN 1 ELSE 0 END,
    CASE 
      WHEN TG_TABLE_NAME = 'forum_posts' THEN 5
      WHEN TG_TABLE_NAME = 'forum_replies' THEN 2
      ELSE 0
    END
  )
  ON CONFLICT (user_id) 
  DO UPDATE SET
    posts_count = user_reputation.posts_count + CASE WHEN TG_TABLE_NAME = 'forum_posts' THEN 1 ELSE 0 END,
    replies_count = user_reputation.replies_count + CASE WHEN TG_TABLE_NAME = 'forum_replies' THEN 1 ELSE 0 END,
    reputation_points = user_reputation.reputation_points + CASE 
      WHEN TG_TABLE_NAME = 'forum_posts' THEN 5
      WHEN TG_TABLE_NAME = 'forum_replies' THEN 2
      ELSE 0
    END,
    updated_at = now();
  
  RETURN NEW;
END;
$$;

-- Function to handle upvote reputation
CREATE OR REPLACE FUNCTION public.update_reputation_on_vote()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  content_author_id UUID;
  points_change INTEGER;
BEGIN
  -- Get content author
  IF NEW.post_id IS NOT NULL THEN
    SELECT user_id INTO content_author_id FROM public.forum_posts WHERE id = NEW.post_id;
    points_change := 1;
  ELSIF NEW.reply_id IS NOT NULL THEN
    SELECT user_id INTO content_author_id FROM public.forum_replies WHERE id = NEW.reply_id;
    points_change := 1;
  END IF;

  -- Update reputation for upvotes only
  IF NEW.vote_type = 'upvote' THEN
    INSERT INTO public.user_reputation (user_id, helpful_count, reputation_points)
    VALUES (content_author_id, 1, points_change)
    ON CONFLICT (user_id)
    DO UPDATE SET
      helpful_count = user_reputation.helpful_count + 1,
      reputation_points = user_reputation.reputation_points + points_change,
      updated_at = now();
  END IF;

  RETURN NEW;
END;
$$;

-- Triggers for reputation
CREATE TRIGGER update_reputation_on_post
  AFTER INSERT ON public.forum_posts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_user_reputation();

CREATE TRIGGER update_reputation_on_reply
  AFTER INSERT ON public.forum_replies
  FOR EACH ROW
  EXECUTE FUNCTION public.update_user_reputation();

CREATE TRIGGER update_reputation_on_vote_trigger
  AFTER INSERT ON public.forum_votes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_reputation_on_vote();

-- Function to notify subscribers
CREATE OR REPLACE FUNCTION public.notify_thread_subscribers()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  subscriber_record RECORD;
  actor_name TEXT;
BEGIN
  -- Get actor name
  SELECT full_name INTO actor_name
  FROM public.profiles
  WHERE id = NEW.user_id;

  -- Notify all subscribers except the author
  FOR subscriber_record IN
    SELECT user_id FROM public.forum_subscriptions
    WHERE post_id = NEW.post_id
      AND user_id != NEW.user_id
      AND notify_replies = true
  LOOP
    INSERT INTO public.forum_notifications (user_id, type, post_id, reply_id, actor_id, message)
    VALUES (
      subscriber_record.user_id,
      'reply',
      NEW.post_id,
      NEW.id,
      NEW.user_id,
      actor_name || ' a răspuns într-un thread la care ești abonat'
    );
  END LOOP;

  RETURN NEW;
END;
$$;

-- Trigger for subscription notifications
CREATE TRIGGER notify_subscribers_on_reply
  AFTER INSERT ON public.forum_replies
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_thread_subscribers();

-- Indexes for performance
CREATE INDEX idx_user_reputation_user_id ON public.user_reputation(user_id);
CREATE INDEX idx_user_reputation_points ON public.user_reputation(reputation_points DESC);
CREATE INDEX idx_forum_subscriptions_user_id ON public.forum_subscriptions(user_id);
CREATE INDEX idx_forum_subscriptions_post_id ON public.forum_subscriptions(post_id);