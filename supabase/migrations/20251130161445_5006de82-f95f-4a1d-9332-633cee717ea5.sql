-- Newsletter Subscribers Table
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'unsubscribed')),
  confirm_token TEXT UNIQUE,
  confirmed_at TIMESTAMPTZ,
  subscribed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  unsubscribed_at TIMESTAMPTZ,
  source TEXT DEFAULT 'website',
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_newsletter_email ON public.newsletter_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_status ON public.newsletter_subscribers(status);
CREATE INDEX IF NOT EXISTS idx_newsletter_token ON public.newsletter_subscribers(confirm_token);

-- Enable RLS
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can subscribe to newsletter"
  ON public.newsletter_subscribers
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Subscribers can view their own subscription"
  ON public.newsletter_subscribers
  FOR SELECT
  USING (true);

CREATE POLICY "Admins can view all subscribers"
  ON public.newsletter_subscribers
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update subscribers"
  ON public.newsletter_subscribers
  FOR UPDATE
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete subscribers"
  ON public.newsletter_subscribers
  FOR DELETE
  USING (has_role(auth.uid(), 'admin'));

-- Trigger for updated_at
CREATE TRIGGER update_newsletter_subscribers_updated_at
  BEFORE UPDATE ON public.newsletter_subscribers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Newsletter Campaigns Table (for future use)
CREATE TABLE IF NOT EXISTS public.newsletter_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sent', 'cancelled')),
  scheduled_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  sent_count INTEGER DEFAULT 0,
  open_count INTEGER DEFAULT 0,
  click_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS for campaigns
ALTER TABLE public.newsletter_campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can manage campaigns"
  ON public.newsletter_campaigns
  FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- Trigger for campaigns updated_at
CREATE TRIGGER update_newsletter_campaigns_updated_at
  BEFORE UPDATE ON public.newsletter_campaigns
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();