-- ============================================
-- SESIUNEA 28: SOCIAL FEATURES & COMMUNITY
-- Database Schema Complete
-- ============================================

-- ============================================
-- PART 1: USER PROFILES ENHANCEMENT
-- ============================================

-- Add social fields to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS username text UNIQUE,
ADD COLUMN IF NOT EXISTS bio text,
ADD COLUMN IF NOT EXISTS avatar_url text,
ADD COLUMN IF NOT EXISTS location text,
ADD COLUMN IF NOT EXISTS is_private boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS website_url text,
ADD COLUMN IF NOT EXISTS twitter_handle text,
ADD COLUMN IF NOT EXISTS instagram_handle text;

-- Index on username for lookups
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username) WHERE username IS NOT NULL;

-- ============================================
-- PART 2: FOLLOW SYSTEM
-- ============================================

CREATE TABLE IF NOT EXISTS public.user_follows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id uuid NOT NULL,
  following_id uuid NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT user_follows_unique UNIQUE(follower_id, following_id),
  CONSTRAINT user_follows_no_self CHECK (follower_id != following_id)
);

CREATE INDEX idx_user_follows_follower ON public.user_follows(follower_id);
CREATE INDEX idx_user_follows_following ON public.user_follows(following_id);
CREATE INDEX idx_user_follows_created ON public.user_follows(created_at DESC);

ALTER TABLE public.user_follows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can follow others"
  ON public.user_follows FOR INSERT
  WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can unfollow"
  ON public.user_follows FOR DELETE
  USING (auth.uid() = follower_id);

CREATE POLICY "Follows are viewable by everyone"
  ON public.user_follows FOR SELECT
  USING (true);

-- ============================================
-- PART 3: ACTIVITY FEED
-- ============================================

CREATE TYPE public.activity_type AS ENUM (
  'favorite_added',
  'review_posted',
  'post_created',
  'reply_created',
  'journal_published',
  'contest_submitted',
  'challenge_completed',
  'badge_earned'
);

CREATE TABLE IF NOT EXISTS public.user_activity (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  activity_type activity_type NOT NULL,
  target_type text NOT NULL,
  target_id uuid NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX idx_user_activity_user ON public.user_activity(user_id);
CREATE INDEX idx_user_activity_type ON public.user_activity(activity_type);
CREATE INDEX idx_user_activity_created ON public.user_activity(created_at DESC);
CREATE INDEX idx_user_activity_target ON public.user_activity(target_type, target_id);

ALTER TABLE public.user_activity ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Activity is viewable by everyone"
  ON public.user_activity FOR SELECT
  USING (true);

CREATE POLICY "Users can create their own activity"
  ON public.user_activity FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- PART 4: OBJECTIVE SUGGESTIONS
-- ============================================

CREATE TYPE public.suggestion_status AS ENUM ('pending', 'approved', 'rejected');

CREATE TABLE IF NOT EXISTS public.objective_suggestions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  location_country text NOT NULL,
  location_city text,
  description text NOT NULL,
  suggested_types text[],
  latitude numeric,
  longitude numeric,
  images jsonb DEFAULT '[]'::jsonb,
  website_url text,
  status suggestion_status DEFAULT 'pending' NOT NULL,
  admin_notes text,
  reviewed_by uuid,
  reviewed_at timestamptz,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX idx_suggestions_user ON public.objective_suggestions(user_id);
CREATE INDEX idx_suggestions_status ON public.objective_suggestions(status);
CREATE INDEX idx_suggestions_created ON public.objective_suggestions(created_at DESC);

ALTER TABLE public.objective_suggestions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create suggestions"
  ON public.objective_suggestions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own suggestions"
  ON public.objective_suggestions FOR SELECT
  USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update suggestions"
  ON public.objective_suggestions FOR UPDATE
  USING (has_role(auth.uid(), 'admin'));

-- ============================================
-- PART 5: TRAVEL JOURNALS
-- ============================================

CREATE TABLE IF NOT EXISTS public.travel_journals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  content text NOT NULL,
  excerpt text,
  cover_image text,
  gallery_images jsonb DEFAULT '[]'::jsonb,
  visited_objectives uuid[],
  trip_start_date date,
  trip_end_date date,
  published boolean DEFAULT false,
  featured boolean DEFAULT false,
  views_count integer DEFAULT 0,
  likes_count integer DEFAULT 0,
  comments_count integer DEFAULT 0,
  meta_title text,
  meta_description text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  published_at timestamptz
);

CREATE INDEX idx_journals_user ON public.travel_journals(user_id);
CREATE INDEX idx_journals_slug ON public.travel_journals(slug);
CREATE INDEX idx_journals_published ON public.travel_journals(published, published_at DESC);
CREATE INDEX idx_journals_featured ON public.travel_journals(featured) WHERE featured = true;
CREATE INDEX idx_journals_objectives ON public.travel_journals USING gin(visited_objectives);

ALTER TABLE public.travel_journals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create journals"
  ON public.travel_journals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own journals"
  ON public.travel_journals FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own journals"
  ON public.travel_journals FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Published journals viewable by everyone"
  ON public.travel_journals FOR SELECT
  USING (published = true OR auth.uid() = user_id OR has_role(auth.uid(), 'admin'));

-- Journal likes tracking
CREATE TABLE IF NOT EXISTS public.journal_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  journal_id uuid NOT NULL REFERENCES public.travel_journals(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT journal_likes_unique UNIQUE(journal_id, user_id)
);

CREATE INDEX idx_journal_likes_journal ON public.journal_likes(journal_id);
CREATE INDEX idx_journal_likes_user ON public.journal_likes(user_id);

ALTER TABLE public.journal_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can like journals"
  ON public.journal_likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike journals"
  ON public.journal_likes FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Likes are viewable by everyone"
  ON public.journal_likes FOR SELECT
  USING (true);

-- ============================================
-- PART 6: PHOTO CONTESTS
-- ============================================

CREATE TYPE public.contest_status AS ENUM ('upcoming', 'active', 'voting', 'ended');

CREATE TABLE IF NOT EXISTS public.photo_contests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text NOT NULL,
  theme text NOT NULL,
  rules text,
  cover_image text,
  prizes_description text,
  start_date timestamptz NOT NULL,
  end_date timestamptz NOT NULL,
  voting_end_date timestamptz NOT NULL,
  status contest_status DEFAULT 'upcoming' NOT NULL,
  max_submissions_per_user integer DEFAULT 3,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX idx_contests_status ON public.photo_contests(status);
CREATE INDEX idx_contests_dates ON public.photo_contests(start_date, end_date);
CREATE INDEX idx_contests_slug ON public.photo_contests(slug);

ALTER TABLE public.photo_contests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Contests viewable by everyone"
  ON public.photo_contests FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage contests"
  ON public.photo_contests FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- Contest submissions
CREATE TABLE IF NOT EXISTS public.contest_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contest_id uuid NOT NULL REFERENCES public.photo_contests(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  image_url text NOT NULL,
  title text NOT NULL,
  description text,
  objective_id uuid,
  votes_count integer DEFAULT 0,
  winner_rank integer,
  created_at timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT submission_limit UNIQUE(contest_id, user_id)
);

CREATE INDEX idx_submissions_contest ON public.contest_submissions(contest_id);
CREATE INDEX idx_submissions_user ON public.contest_submissions(user_id);
CREATE INDEX idx_submissions_votes ON public.contest_submissions(votes_count DESC);
CREATE INDEX idx_submissions_winners ON public.contest_submissions(winner_rank) WHERE winner_rank IS NOT NULL;

ALTER TABLE public.contest_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can submit to active contests"
  ON public.contest_submissions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their submissions before voting"
  ON public.contest_submissions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Submissions viewable by everyone"
  ON public.contest_submissions FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage submissions"
  ON public.contest_submissions FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- Contest votes
CREATE TABLE IF NOT EXISTS public.contest_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contest_id uuid NOT NULL REFERENCES public.photo_contests(id) ON DELETE CASCADE,
  submission_id uuid NOT NULL REFERENCES public.contest_submissions(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT contest_votes_unique UNIQUE(contest_id, user_id)
);

CREATE INDEX idx_contest_votes_submission ON public.contest_votes(submission_id);
CREATE INDEX idx_contest_votes_user ON public.contest_votes(user_id);

ALTER TABLE public.contest_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can vote in voting phase"
  ON public.contest_votes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Votes viewable by everyone"
  ON public.contest_votes FOR SELECT
  USING (true);

-- ============================================
-- PART 7: COMMUNITY CHALLENGES
-- ============================================

CREATE TYPE public.challenge_type AS ENUM (
  'visit_count',
  'review_count',
  'favorite_count',
  'post_count',
  'continent_explorer',
  'unesco_hunter'
);

CREATE TYPE public.reward_type AS ENUM ('badge', 'points', 'both');

CREATE TABLE IF NOT EXISTS public.community_challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  challenge_type challenge_type NOT NULL,
  target_value integer NOT NULL,
  reward_type reward_type NOT NULL,
  reward_badge_name text,
  reward_points integer,
  icon text,
  start_date timestamptz,
  end_date timestamptz,
  active boolean DEFAULT true,
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX idx_challenges_active ON public.community_challenges(active, order_index);
CREATE INDEX idx_challenges_dates ON public.community_challenges(start_date, end_date);

ALTER TABLE public.community_challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Challenges viewable by everyone"
  ON public.community_challenges FOR SELECT
  USING (active = true OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage challenges"
  ON public.community_challenges FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- User challenge progress
CREATE TABLE IF NOT EXISTS public.user_challenge_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  challenge_id uuid NOT NULL REFERENCES public.community_challenges(id) ON DELETE CASCADE,
  current_value integer DEFAULT 0,
  completed boolean DEFAULT false,
  completed_at timestamptz,
  reward_claimed boolean DEFAULT false,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT user_challenge_unique UNIQUE(user_id, challenge_id)
);

CREATE INDEX idx_progress_user ON public.user_challenge_progress(user_id);
CREATE INDEX idx_progress_challenge ON public.user_challenge_progress(challenge_id);
CREATE INDEX idx_progress_completed ON public.user_challenge_progress(completed, completed_at DESC);

ALTER TABLE public.user_challenge_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own progress"
  ON public.user_challenge_progress FOR SELECT
  USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'));

CREATE POLICY "System can update progress"
  ON public.user_challenge_progress FOR ALL
  USING (true);

-- ============================================
-- PART 8: GAMIFICATION (POINTS & BADGES)
-- ============================================

CREATE TABLE IF NOT EXISTS public.user_points (
  user_id uuid PRIMARY KEY,
  total_points integer DEFAULT 0,
  level integer DEFAULT 1,
  points_to_next_level integer DEFAULT 100,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX idx_user_points_total ON public.user_points(total_points DESC);
CREATE INDEX idx_user_points_level ON public.user_points(level DESC);

ALTER TABLE public.user_points ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Points viewable by everyone"
  ON public.user_points FOR SELECT
  USING (true);

CREATE POLICY "System can update points"
  ON public.user_points FOR ALL
  USING (true);

-- User badges
CREATE TABLE IF NOT EXISTS public.user_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  badge_name text NOT NULL,
  badge_description text,
  badge_icon text,
  earned_at timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT user_badges_unique UNIQUE(user_id, badge_name)
);

CREATE INDEX idx_user_badges_user ON public.user_badges(user_id);
CREATE INDEX idx_user_badges_name ON public.user_badges(badge_name);

ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Badges viewable by everyone"
  ON public.user_badges FOR SELECT
  USING (true);

CREATE POLICY "System can award badges"
  ON public.user_badges FOR INSERT
  WITH CHECK (true);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Function to update journal likes count
CREATE OR REPLACE FUNCTION update_journal_likes_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE travel_journals
    SET likes_count = likes_count + 1
    WHERE id = NEW.journal_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE travel_journals
    SET likes_count = GREATEST(0, likes_count - 1)
    WHERE id = OLD.journal_id;
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER trigger_update_journal_likes_count
  AFTER INSERT OR DELETE ON public.journal_likes
  FOR EACH ROW
  EXECUTE FUNCTION update_journal_likes_count();

-- Function to update contest votes count
CREATE OR REPLACE FUNCTION update_contest_votes_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE contest_submissions
    SET votes_count = votes_count + 1
    WHERE id = NEW.submission_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE contest_submissions
    SET votes_count = GREATEST(0, votes_count - 1)
    WHERE id = OLD.submission_id;
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER trigger_update_contest_votes_count
  AFTER INSERT OR DELETE ON public.contest_votes
  FOR EACH ROW
  EXECUTE FUNCTION update_contest_votes_count();

-- Function to award points
CREATE OR REPLACE FUNCTION award_points(p_user_id uuid, p_points integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_new_total integer;
  v_new_level integer;
BEGIN
  INSERT INTO user_points (user_id, total_points)
  VALUES (p_user_id, p_points)
  ON CONFLICT (user_id)
  DO UPDATE SET
    total_points = user_points.total_points + p_points,
    updated_at = now()
  RETURNING total_points INTO v_new_total;
  
  -- Calculate level (every 100 points = 1 level)
  v_new_level := FLOOR(v_new_total / 100.0) + 1;
  
  UPDATE user_points
  SET 
    level = v_new_level,
    points_to_next_level = (v_new_level * 100) - v_new_total
  WHERE user_id = p_user_id;
END;
$$;

-- Function to award badge
CREATE OR REPLACE FUNCTION award_badge(
  p_user_id uuid,
  p_badge_name text,
  p_badge_description text,
  p_badge_icon text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO user_badges (user_id, badge_name, badge_description, badge_icon)
  VALUES (p_user_id, p_badge_name, p_badge_description, p_badge_icon)
  ON CONFLICT (user_id, badge_name) DO NOTHING;
  
  -- Log activity
  INSERT INTO user_activity (user_id, activity_type, target_type, target_id, metadata)
  VALUES (
    p_user_id,
    'badge_earned',
    'badge',
    gen_random_uuid(),
    jsonb_build_object('badge_name', p_badge_name)
  );
END;
$$;

-- Comments on tables
COMMENT ON TABLE public.user_follows IS 'Social follow relationships between users';
COMMENT ON TABLE public.user_activity IS 'Activity feed for social features';
COMMENT ON TABLE public.objective_suggestions IS 'User-generated objective suggestions for admin approval';
COMMENT ON TABLE public.travel_journals IS 'User travel journals (blog-style posts)';
COMMENT ON TABLE public.photo_contests IS 'Monthly photo contests for community';
COMMENT ON TABLE public.community_challenges IS 'Gamification challenges for users';
COMMENT ON TABLE public.user_points IS 'User points and levels for gamification';
COMMENT ON TABLE public.user_badges IS 'User earned badges';