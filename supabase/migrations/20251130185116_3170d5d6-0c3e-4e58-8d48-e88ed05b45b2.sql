-- Forum System: Complete Database Schema
-- Categories, Posts, Replies (nested up to 3 levels), Votes, Moderation

-- Create forum_categories table
CREATE TABLE public.forum_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  color TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  posts_count INTEGER NOT NULL DEFAULT 0,
  moderator_ids UUID[] DEFAULT ARRAY[]::UUID[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create forum_posts table
CREATE TABLE public.forum_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES public.forum_categories(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  content TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  pinned BOOLEAN NOT NULL DEFAULT false,
  locked BOOLEAN NOT NULL DEFAULT false,
  views_count INTEGER NOT NULL DEFAULT 0,
  replies_count INTEGER NOT NULL DEFAULT 0,
  upvotes_count INTEGER NOT NULL DEFAULT 0,
  downvotes_count INTEGER NOT NULL DEFAULT 0,
  last_activity_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(category_id, slug)
);

-- Create forum_replies table (supports nested comments up to 3 levels)
CREATE TABLE public.forum_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.forum_posts(id) ON DELETE CASCADE,
  parent_reply_id UUID REFERENCES public.forum_replies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  depth INTEGER NOT NULL DEFAULT 0 CHECK (depth <= 3),
  status TEXT NOT NULL DEFAULT 'active',
  upvotes_count INTEGER NOT NULL DEFAULT 0,
  downvotes_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create forum_votes table (for posts and replies)
CREATE TABLE public.forum_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  post_id UUID REFERENCES public.forum_posts(id) ON DELETE CASCADE,
  reply_id UUID REFERENCES public.forum_replies(id) ON DELETE CASCADE,
  vote_type TEXT NOT NULL CHECK (vote_type IN ('upvote', 'downvote')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT vote_target CHECK (
    (post_id IS NOT NULL AND reply_id IS NULL) OR 
    (post_id IS NULL AND reply_id IS NOT NULL)
  ),
  UNIQUE(user_id, post_id),
  UNIQUE(user_id, reply_id)
);

-- Create forum_reports table (for moderation)
CREATE TABLE public.forum_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL,
  post_id UUID REFERENCES public.forum_posts(id) ON DELETE CASCADE,
  reply_id UUID REFERENCES public.forum_replies(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  resolved_by UUID,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT report_target CHECK (
    (post_id IS NOT NULL AND reply_id IS NULL) OR 
    (post_id IS NULL AND reply_id IS NOT NULL)
  )
);

-- Enable Row Level Security
ALTER TABLE public.forum_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies for forum_categories
CREATE POLICY "Categories are viewable by everyone"
  ON public.forum_categories FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage categories"
  ON public.forum_categories FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for forum_posts
CREATE POLICY "Active posts are viewable by everyone"
  ON public.forum_posts FOR SELECT
  USING (status = 'active' OR auth.uid() = user_id OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated users can create posts"
  ON public.forum_posts FOR INSERT
  WITH CHECK (auth.uid() = user_id AND status = 'active');

CREATE POLICY "Users can update their own posts"
  ON public.forum_posts FOR UPDATE
  USING (auth.uid() = user_id AND NOT locked)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins and moderators can manage posts"
  ON public.forum_posts FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for forum_replies
CREATE POLICY "Active replies are viewable by everyone"
  ON public.forum_replies FOR SELECT
  USING (status = 'active' OR auth.uid() = user_id OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated users can create replies"
  ON public.forum_replies FOR INSERT
  WITH CHECK (auth.uid() = user_id AND status = 'active');

CREATE POLICY "Users can update their own replies"
  ON public.forum_replies FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage replies"
  ON public.forum_replies FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for forum_votes
CREATE POLICY "Users can view their own votes"
  ON public.forum_votes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create votes"
  ON public.forum_votes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own votes"
  ON public.forum_votes FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for forum_reports
CREATE POLICY "Users can view their own reports"
  ON public.forum_reports FOR SELECT
  USING (auth.uid() = reporter_id OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated users can create reports"
  ON public.forum_reports FOR INSERT
  WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Admins can manage reports"
  ON public.forum_reports FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- Triggers for automatic timestamp updates
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_forum_categories_updated_at
  BEFORE UPDATE ON public.forum_categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_forum_posts_updated_at
  BEFORE UPDATE ON public.forum_posts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_forum_replies_updated_at
  BEFORE UPDATE ON public.forum_replies
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to update post reply count
CREATE OR REPLACE FUNCTION public.update_post_replies_count()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_post_replies_count_trigger
  AFTER INSERT OR DELETE ON public.forum_replies
  FOR EACH ROW EXECUTE FUNCTION public.update_post_replies_count();

-- Function to update category posts count
CREATE OR REPLACE FUNCTION public.update_category_posts_count()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_category_posts_count_trigger
  AFTER INSERT OR DELETE ON public.forum_posts
  FOR EACH ROW EXECUTE FUNCTION public.update_category_posts_count();

-- Function to update vote counts
CREATE OR REPLACE FUNCTION public.update_vote_counts()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_vote_counts_trigger
  AFTER INSERT OR DELETE ON public.forum_votes
  FOR EACH ROW EXECUTE FUNCTION public.update_vote_counts();

-- Create indexes for better performance
CREATE INDEX idx_forum_posts_category_id ON public.forum_posts(category_id);
CREATE INDEX idx_forum_posts_user_id ON public.forum_posts(user_id);
CREATE INDEX idx_forum_posts_last_activity ON public.forum_posts(last_activity_at DESC);
CREATE INDEX idx_forum_replies_post_id ON public.forum_replies(post_id);
CREATE INDEX idx_forum_replies_parent_id ON public.forum_replies(parent_reply_id);
CREATE INDEX idx_forum_replies_user_id ON public.forum_replies(user_id);
CREATE INDEX idx_forum_votes_post_id ON public.forum_votes(post_id);
CREATE INDEX idx_forum_votes_reply_id ON public.forum_votes(reply_id);
CREATE INDEX idx_forum_votes_user_id ON public.forum_votes(user_id);

-- Insert default categories
INSERT INTO public.forum_categories (name, slug, description, icon, color, order_index) VALUES
  ('Discuții Generale', 'discutii-generale', 'Discuții generale despre obiective turistice și călătorii', 'MessageSquare', 'hsl(var(--primary))', 1),
  ('Recomandări', 'recomandari', 'Cereți și oferiți recomandări pentru călătorii', 'Star', 'hsl(var(--accent))', 2),
  ('Experiențe', 'experiente', 'Împărtășiți experiențele voastre de călătorie', 'MapPin', 'hsl(var(--secondary))', 3),
  ('Întrebări & Răspunsuri', 'intrebari-raspunsuri', 'Puneți întrebări despre obiective turistice', 'HelpCircle', 'hsl(var(--muted))', 4),
  ('Planificare', 'planificare', 'Ajutor pentru planificarea călătoriilor', 'Calendar', 'hsl(var(--accent))', 5);