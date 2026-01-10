-- Add moderation fields to contest_submissions
ALTER TABLE public.contest_submissions 
ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'removed')),
ADD COLUMN IF NOT EXISTS accepted_terms BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
ADD COLUMN IF NOT EXISTS admin_notes TEXT,
ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES auth.users(id);

-- Create index for faster status queries
CREATE INDEX IF NOT EXISTS idx_contest_submissions_status ON public.contest_submissions(status);
CREATE INDEX IF NOT EXISTS idx_contest_submissions_contest_status ON public.contest_submissions(contest_id, status);

-- Function to approve a submission
CREATE OR REPLACE FUNCTION public.approve_submission(
  p_submission_id UUID,
  p_admin_notes TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Get current user
  v_user_id := auth.uid();
  
  -- Check if user is admin
  IF NOT public.has_role(v_user_id, 'admin') THEN
    RAISE EXCEPTION 'Only admins can approve submissions';
  END IF;
  
  -- Update submission
  UPDATE public.contest_submissions
  SET 
    status = 'approved',
    admin_notes = COALESCE(p_admin_notes, admin_notes),
    reviewed_at = NOW(),
    reviewed_by = v_user_id
  WHERE id = p_submission_id AND status = 'pending';
  
  RETURN FOUND;
END;
$$;

-- Function to reject a submission
CREATE OR REPLACE FUNCTION public.reject_submission(
  p_submission_id UUID,
  p_rejection_reason TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Get current user
  v_user_id := auth.uid();
  
  -- Check if user is admin
  IF NOT public.has_role(v_user_id, 'admin') THEN
    RAISE EXCEPTION 'Only admins can reject submissions';
  END IF;
  
  -- Rejection reason is required
  IF p_rejection_reason IS NULL OR TRIM(p_rejection_reason) = '' THEN
    RAISE EXCEPTION 'Rejection reason is required';
  END IF;
  
  -- Update submission
  UPDATE public.contest_submissions
  SET 
    status = 'rejected',
    rejection_reason = p_rejection_reason,
    reviewed_at = NOW(),
    reviewed_by = v_user_id
  WHERE id = p_submission_id AND status = 'pending';
  
  RETURN FOUND;
END;
$$;

-- Function to remove a submission (fraud detection)
CREATE OR REPLACE FUNCTION public.remove_submission(
  p_submission_id UUID,
  p_reason TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user_id UUID;
  v_contest_id UUID;
BEGIN
  -- Get current user
  v_user_id := auth.uid();
  
  -- Check if user is admin
  IF NOT public.has_role(v_user_id, 'admin') THEN
    RAISE EXCEPTION 'Only admins can remove submissions';
  END IF;
  
  -- Reason is required
  IF p_reason IS NULL OR TRIM(p_reason) = '' THEN
    RAISE EXCEPTION 'Removal reason is required';
  END IF;
  
  -- Get contest_id before update
  SELECT contest_id INTO v_contest_id FROM public.contest_submissions WHERE id = p_submission_id;
  
  -- Update submission to removed
  UPDATE public.contest_submissions
  SET 
    status = 'removed',
    rejection_reason = p_reason,
    reviewed_at = NOW(),
    reviewed_by = v_user_id,
    votes_count = 0
  WHERE id = p_submission_id AND status = 'approved';
  
  -- Delete all votes for this submission
  DELETE FROM public.contest_votes WHERE submission_id = p_submission_id;
  
  RETURN FOUND;
END;
$$;

-- Function to get contest submission stats
CREATE OR REPLACE FUNCTION public.get_contest_submission_stats(p_contest_id UUID)
RETURNS JSON
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT json_build_object(
    'total', COUNT(*)::INTEGER,
    'pending', COUNT(*) FILTER (WHERE status = 'pending')::INTEGER,
    'approved', COUNT(*) FILTER (WHERE status = 'approved')::INTEGER,
    'rejected', COUNT(*) FILTER (WHERE status = 'rejected')::INTEGER,
    'removed', COUNT(*) FILTER (WHERE status = 'removed')::INTEGER
  )
  FROM public.contest_submissions
  WHERE contest_id = p_contest_id;
$$;

-- Update RLS policies for contest_submissions
DROP POLICY IF EXISTS "Anyone can view approved submissions" ON public.contest_submissions;
DROP POLICY IF EXISTS "Users can view their own submissions" ON public.contest_submissions;
DROP POLICY IF EXISTS "Users can insert submissions" ON public.contest_submissions;
DROP POLICY IF EXISTS "Admins can view all submissions" ON public.contest_submissions;
DROP POLICY IF EXISTS "Admins can update submissions" ON public.contest_submissions;

-- Public can view approved submissions
CREATE POLICY "Public can view approved submissions" 
ON public.contest_submissions FOR SELECT 
USING (status = 'approved');

-- Users can view their own submissions (any status)
CREATE POLICY "Users can view own submissions" 
ON public.contest_submissions FOR SELECT 
USING (auth.uid() = user_id);

-- Admins can view all submissions
CREATE POLICY "Admins can view all submissions" 
ON public.contest_submissions FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'));

-- Users can insert their own submissions
CREATE POLICY "Users can insert own submissions" 
ON public.contest_submissions FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Admins can update any submission
CREATE POLICY "Admins can update submissions" 
ON public.contest_submissions FOR UPDATE 
USING (public.has_role(auth.uid(), 'admin'));