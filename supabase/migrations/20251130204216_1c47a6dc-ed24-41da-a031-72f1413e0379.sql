-- Drop existing table if it has issues
DROP TABLE IF EXISTS public.page_views CASCADE;

-- Create page_views table for analytics tracking
CREATE TABLE public.page_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_url text NOT NULL,
  page_title text,
  referrer text,
  user_agent text,
  ip_address inet,
  session_id text,
  user_id uuid,
  viewed_at timestamp with time zone DEFAULT now() NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Add indexes for better query performance
CREATE INDEX idx_page_views_viewed_at ON public.page_views(viewed_at DESC);
CREATE INDEX idx_page_views_page_url ON public.page_views(page_url);
CREATE INDEX idx_page_views_session_id ON public.page_views(session_id);
CREATE INDEX idx_page_views_user_id ON public.page_views(user_id) WHERE user_id IS NOT NULL;

-- Enable RLS
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Page views are insertable by anyone"
  ON public.page_views
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Page views are viewable by authenticated users"
  ON public.page_views
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Comment
COMMENT ON TABLE public.page_views IS 'Tracks page views for analytics purposes';