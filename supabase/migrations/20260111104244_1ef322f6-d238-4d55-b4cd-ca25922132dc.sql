-- Create table for AI chatbot rate limiting
CREATE TABLE IF NOT EXISTS public.ai_chatbot_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  ip_address TEXT NOT NULL DEFAULT 'unknown',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for efficient rate limit queries
CREATE INDEX IF NOT EXISTS idx_chatbot_usage_user_time ON public.ai_chatbot_usage(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_chatbot_usage_ip_time ON public.ai_chatbot_usage(ip_address, created_at);

-- Enable RLS
ALTER TABLE public.ai_chatbot_usage ENABLE ROW LEVEL SECURITY;

-- Only allow service role to insert (edge function uses service role)
-- No public access needed - all operations go through edge function
CREATE POLICY "Service role can manage chatbot usage"
  ON public.ai_chatbot_usage
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Auto-cleanup old records (older than 24 hours) - scheduled job or trigger
-- For now, allow the edge function to query and insert
COMMENT ON TABLE public.ai_chatbot_usage IS 'Tracks AI chatbot usage for rate limiting purposes';