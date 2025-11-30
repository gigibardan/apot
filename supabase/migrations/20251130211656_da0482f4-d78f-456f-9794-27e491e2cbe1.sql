-- =====================================================
-- SESIUNEA 30: ADVANCED ADMIN TOOLS - DATABASE
-- =====================================================

-- =========================
-- PART 1: USER BAN/SUSPEND SYSTEM
-- =========================

CREATE TABLE IF NOT EXISTS public.user_bans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  banned_by UUID NOT NULL,
  reason TEXT NOT NULL,
  ban_type TEXT NOT NULL CHECK (ban_type IN ('ban', 'suspend')),
  banned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_user_bans_user_id ON public.user_bans(user_id);
CREATE INDEX idx_user_bans_active ON public.user_bans(is_active, user_id);

ALTER TABLE public.user_bans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage bans"
ON public.user_bans
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- =========================
-- PART 2: SCHEDULED ACTIONS
-- =========================

CREATE TYPE public.scheduled_action_status AS ENUM ('pending', 'executed', 'cancelled', 'failed');
CREATE TYPE public.scheduled_action_type AS ENUM ('publish', 'unpublish', 'feature', 'unfeature', 'archive');

CREATE TABLE IF NOT EXISTS public.scheduled_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  action_type scheduled_action_type NOT NULL,
  scheduled_for TIMESTAMPTZ NOT NULL,
  status scheduled_action_status NOT NULL DEFAULT 'pending',
  created_by UUID NOT NULL,
  executed_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_scheduled_actions_pending ON public.scheduled_actions(status, scheduled_for) 
WHERE status = 'pending';
CREATE INDEX idx_scheduled_actions_entity ON public.scheduled_actions(entity_type, entity_id);

ALTER TABLE public.scheduled_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage scheduled actions"
ON public.scheduled_actions
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- =========================
-- PART 3: CONTENT REVISIONS
-- =========================

CREATE TABLE IF NOT EXISTS public.content_revisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  revision_number INTEGER NOT NULL,
  content_snapshot JSONB NOT NULL,
  changed_by UUID NOT NULL,
  change_summary TEXT,
  changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_content_revisions_entity ON public.content_revisions(entity_type, entity_id, revision_number DESC);

ALTER TABLE public.content_revisions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins and editors can view revisions"
ON public.content_revisions
FOR SELECT
TO authenticated
USING (can_edit_content(auth.uid()));

-- =========================
-- PART 4: SEO AUDIT
-- =========================

CREATE TYPE public.seo_issue_severity AS ENUM ('critical', 'warning', 'info');

CREATE TABLE IF NOT EXISTS public.seo_audit_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scanned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  overall_score INTEGER NOT NULL CHECK (overall_score >= 0 AND overall_score <= 100),
  total_pages INTEGER NOT NULL,
  issues_count INTEGER NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_by UUID NOT NULL
);

CREATE TABLE IF NOT EXISTS public.seo_audit_issues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES public.seo_audit_reports(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  issue_type TEXT NOT NULL,
  severity seo_issue_severity NOT NULL,
  message TEXT NOT NULL,
  fix_suggestion TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_seo_audit_issues_report ON public.seo_audit_issues(report_id, severity);
CREATE INDEX idx_seo_audit_issues_entity ON public.seo_audit_issues(entity_type, entity_id);

ALTER TABLE public.seo_audit_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seo_audit_issues ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage SEO audit reports"
ON public.seo_audit_reports
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view SEO audit issues"
ON public.seo_audit_issues
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- =========================
-- PART 5: ENHANCE ACTIVITY LOGS
-- =========================

ALTER TABLE public.activity_logs 
ADD COLUMN IF NOT EXISTS changes_data JSONB,
ADD COLUMN IF NOT EXISTS session_id UUID,
ADD COLUMN IF NOT EXISTS severity TEXT DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'error', 'critical'));

CREATE INDEX IF NOT EXISTS idx_activity_logs_severity ON public.activity_logs(severity);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created ON public.activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action ON public.activity_logs(action);

-- =========================
-- PART 6: HELPER FUNCTIONS
-- =========================

-- Function to check if user is banned
CREATE OR REPLACE FUNCTION public.is_user_banned(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_bans
    WHERE user_id = _user_id
      AND is_active = true
      AND (
        ban_type = 'ban' 
        OR (ban_type = 'suspend' AND (expires_at IS NULL OR expires_at > NOW()))
      )
  )
$$;

-- Function to auto-expire suspensions
CREATE OR REPLACE FUNCTION public.expire_suspensions()
RETURNS void
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.user_bans
  SET is_active = false
  WHERE ban_type = 'suspend'
    AND is_active = true
    AND expires_at IS NOT NULL
    AND expires_at <= NOW()
$$;

-- Function to log activity (helper)
CREATE OR REPLACE FUNCTION public.log_activity(
  p_user_id UUID,
  p_action TEXT,
  p_entity_type TEXT,
  p_entity_id UUID,
  p_metadata JSONB DEFAULT '{}',
  p_changes_data JSONB DEFAULT NULL,
  p_severity TEXT DEFAULT 'info'
)
RETURNS UUID
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  INSERT INTO public.activity_logs (
    user_id,
    action,
    entity_type,
    entity_id,
    metadata,
    changes_data,
    severity
  )
  VALUES (
    p_user_id,
    p_action,
    p_entity_type,
    p_entity_id,
    p_metadata,
    p_changes_data,
    p_severity
  )
  RETURNING id
$$;

-- Trigger pentru auto-expire suspensions (rulat periodic)
CREATE OR REPLACE FUNCTION public.auto_expire_suspensions()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM expire_suspensions();
  RETURN NULL;
END;
$$;

COMMENT ON TABLE public.user_bans IS 'User bans and suspensions for moderation';
COMMENT ON TABLE public.scheduled_actions IS 'Scheduled content actions (publish, unpublish, etc.)';
COMMENT ON TABLE public.content_revisions IS 'Version history for content changes';
COMMENT ON TABLE public.seo_audit_reports IS 'SEO audit scan reports';
COMMENT ON TABLE public.seo_audit_issues IS 'Individual SEO issues found in audits';