-- Create guides table for verified professional guides
CREATE TABLE public.guides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Basic info
  full_name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  bio TEXT,
  short_description TEXT,
  profile_image TEXT,
  
  -- Professional info
  years_experience INTEGER,
  languages TEXT[] DEFAULT ARRAY[]::TEXT[],
  specializations TEXT[] DEFAULT ARRAY[]::TEXT[],
  geographical_areas TEXT[] DEFAULT ARRAY[]::TEXT[],
  
  -- Contact & pricing
  email TEXT,
  phone TEXT,
  whatsapp TEXT,
  website_url TEXT,
  price_per_day NUMERIC,
  price_per_group NUMERIC,
  
  -- Status & verification
  verified BOOLEAN DEFAULT false,
  featured BOOLEAN DEFAULT false,
  active BOOLEAN DEFAULT true,
  verification_date TIMESTAMP WITH TIME ZONE,
  verification_notes TEXT,
  
  -- Stats & engagement
  rating_average NUMERIC(3,2) DEFAULT 0,
  reviews_count INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  contact_count INTEGER DEFAULT 0,
  
  -- SEO
  meta_title TEXT,
  meta_description TEXT,
  
  -- Availability (future integration)
  availability_calendar_url TEXT,
  
  -- Audit
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

-- Create authorized guides table (from Ministry list)
CREATE TABLE public.authorized_guides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Basic info from ministry
  full_name TEXT NOT NULL,
  license_number TEXT UNIQUE,
  specialization TEXT,
  languages TEXT[] DEFAULT ARRAY[]::TEXT[],
  region TEXT,
  
  -- Additional info
  phone TEXT,
  email TEXT,
  
  -- Status
  license_active BOOLEAN DEFAULT true,
  license_expiry_date DATE,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create guides-objectives relationship (many-to-many)
CREATE TABLE public.guides_objectives_relations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guide_id UUID NOT NULL REFERENCES public.guides(id) ON DELETE CASCADE,
  objective_id UUID NOT NULL REFERENCES public.objectives(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(guide_id, objective_id)
);

-- Create guide reviews table
CREATE TABLE public.guide_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guide_id UUID NOT NULL REFERENCES public.guides(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Review content
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  comment TEXT,
  travel_date DATE,
  
  -- Moderation
  approved BOOLEAN DEFAULT false,
  guide_response TEXT,
  guide_response_date TIMESTAMP WITH TIME ZONE,
  
  -- Engagement
  helpful_count INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- One review per user per guide
  UNIQUE(guide_id, user_id)
);

-- Enable RLS
ALTER TABLE public.guides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.authorized_guides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guides_objectives_relations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guide_reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies for guides
CREATE POLICY "Published guides are viewable by everyone"
  ON public.guides FOR SELECT
  USING (active = true OR auth.uid() IS NOT NULL);

CREATE POLICY "Editors and admins can insert guides"
  ON public.guides FOR INSERT
  WITH CHECK (can_edit_content(auth.uid()));

CREATE POLICY "Editors and admins can update guides"
  ON public.guides FOR UPDATE
  USING (can_edit_content(auth.uid()));

CREATE POLICY "Only admins can delete guides"
  ON public.guides FOR DELETE
  USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for authorized guides
CREATE POLICY "Authorized guides are viewable by everyone"
  ON public.authorized_guides FOR SELECT
  USING (true);

CREATE POLICY "Editors and admins can manage authorized guides"
  ON public.authorized_guides FOR ALL
  USING (can_edit_content(auth.uid()));

-- RLS Policies for guides-objectives relations
CREATE POLICY "Relations are viewable by everyone"
  ON public.guides_objectives_relations FOR SELECT
  USING (true);

CREATE POLICY "Editors and admins can manage relations"
  ON public.guides_objectives_relations FOR ALL
  USING (can_edit_content(auth.uid()));

-- RLS Policies for guide reviews
CREATE POLICY "Approved reviews are viewable by everyone"
  ON public.guide_reviews FOR SELECT
  USING (approved = true OR auth.uid() IS NOT NULL);

CREATE POLICY "Users can create their own reviews"
  ON public.guide_reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews within 48h"
  ON public.guide_reviews FOR UPDATE
  USING (
    auth.uid() = user_id 
    AND created_at > NOW() - INTERVAL '48 hours'
  );

CREATE POLICY "Admins can manage all reviews"
  ON public.guide_reviews FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- Create indexes for performance
CREATE INDEX idx_guides_slug ON public.guides(slug);
CREATE INDEX idx_guides_verified ON public.guides(verified) WHERE verified = true;
CREATE INDEX idx_guides_featured ON public.guides(featured) WHERE featured = true;
CREATE INDEX idx_guides_active ON public.guides(active) WHERE active = true;
CREATE INDEX idx_guides_rating ON public.guides(rating_average DESC);
CREATE INDEX idx_guides_specializations ON public.guides USING GIN(specializations);
CREATE INDEX idx_guides_geographical_areas ON public.guides USING GIN(geographical_areas);

CREATE INDEX idx_authorized_guides_name ON public.authorized_guides(full_name);
CREATE INDEX idx_authorized_guides_license ON public.authorized_guides(license_number);
CREATE INDEX idx_authorized_guides_region ON public.authorized_guides(region);

CREATE INDEX idx_guide_reviews_guide_id ON public.guide_reviews(guide_id);
CREATE INDEX idx_guide_reviews_approved ON public.guide_reviews(approved) WHERE approved = true;
CREATE INDEX idx_guide_reviews_rating ON public.guide_reviews(rating);

-- Create trigger for updated_at
CREATE TRIGGER update_guides_updated_at
  BEFORE UPDATE ON public.guides
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_authorized_guides_updated_at
  BEFORE UPDATE ON public.authorized_guides
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_guide_reviews_updated_at
  BEFORE UPDATE ON public.guide_reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to update guide rating when review is added/updated/deleted
CREATE OR REPLACE FUNCTION public.update_guide_rating()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update the guide's rating average and count
  UPDATE public.guides
  SET 
    rating_average = (
      SELECT COALESCE(AVG(rating), 0)
      FROM public.guide_reviews
      WHERE guide_id = COALESCE(NEW.guide_id, OLD.guide_id)
        AND approved = true
    ),
    reviews_count = (
      SELECT COUNT(*)
      FROM public.guide_reviews
      WHERE guide_id = COALESCE(NEW.guide_id, OLD.guide_id)
        AND approved = true
    )
  WHERE id = COALESCE(NEW.guide_id, OLD.guide_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Create trigger for rating updates
CREATE TRIGGER update_guide_rating_on_review_change
  AFTER INSERT OR UPDATE OR DELETE ON public.guide_reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.update_guide_rating();