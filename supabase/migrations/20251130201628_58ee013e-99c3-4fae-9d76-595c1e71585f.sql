-- Create translations tables for multi-language content
-- This migration adds support for translating objectives, guides, blog articles, and other content

-- Objectives Translations Table
CREATE TABLE IF NOT EXISTS public.objective_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  objective_id UUID NOT NULL REFERENCES public.objectives(id) ON DELETE CASCADE,
  language VARCHAR(5) NOT NULL,
  title TEXT NOT NULL,
  excerpt TEXT,
  description TEXT,
  meta_title TEXT,
  meta_description TEXT,
  location_text TEXT,
  accessibility_info TEXT,
  visit_duration TEXT,
  best_season TEXT,
  entrance_fee TEXT,
  opening_hours TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(objective_id, language)
);

-- Guides Translations Table
CREATE TABLE IF NOT EXISTS public.guide_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guide_id UUID NOT NULL REFERENCES public.guides(id) ON DELETE CASCADE,
  language VARCHAR(5) NOT NULL,
  full_name TEXT,
  bio TEXT,
  short_description TEXT,
  meta_title TEXT,
  meta_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(guide_id, language)
);

-- Blog Articles Translations Table
CREATE TABLE IF NOT EXISTS public.blog_article_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID NOT NULL REFERENCES public.blog_articles(id) ON DELETE CASCADE,
  language VARCHAR(5) NOT NULL,
  title TEXT NOT NULL,
  excerpt TEXT,
  content TEXT,
  meta_title TEXT,
  meta_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(article_id, language)
);

-- Continents Translations Table
CREATE TABLE IF NOT EXISTS public.continent_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  continent_id UUID NOT NULL REFERENCES public.continents(id) ON DELETE CASCADE,
  language VARCHAR(5) NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  meta_title TEXT,
  meta_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(continent_id, language)
);

-- Countries Translations Table
CREATE TABLE IF NOT EXISTS public.country_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country_id UUID NOT NULL REFERENCES public.countries(id) ON DELETE CASCADE,
  language VARCHAR(5) NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  meta_title TEXT,
  meta_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(country_id, language)
);

-- Objective Types Translations Table
CREATE TABLE IF NOT EXISTS public.objective_type_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type_id UUID NOT NULL REFERENCES public.objective_types(id) ON DELETE CASCADE,
  language VARCHAR(5) NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(type_id, language)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_objective_translations_objective_id ON public.objective_translations(objective_id);
CREATE INDEX IF NOT EXISTS idx_objective_translations_language ON public.objective_translations(language);
CREATE INDEX IF NOT EXISTS idx_guide_translations_guide_id ON public.guide_translations(guide_id);
CREATE INDEX IF NOT EXISTS idx_guide_translations_language ON public.guide_translations(language);
CREATE INDEX IF NOT EXISTS idx_blog_article_translations_article_id ON public.blog_article_translations(article_id);
CREATE INDEX IF NOT EXISTS idx_blog_article_translations_language ON public.blog_article_translations(language);
CREATE INDEX IF NOT EXISTS idx_continent_translations_continent_id ON public.continent_translations(continent_id);
CREATE INDEX IF NOT EXISTS idx_continent_translations_language ON public.continent_translations(language);
CREATE INDEX IF NOT EXISTS idx_country_translations_country_id ON public.country_translations(country_id);
CREATE INDEX IF NOT EXISTS idx_country_translations_language ON public.country_translations(language);
CREATE INDEX IF NOT EXISTS idx_objective_type_translations_type_id ON public.objective_type_translations(type_id);
CREATE INDEX IF NOT EXISTS idx_objective_type_translations_language ON public.objective_type_translations(language);

-- Enable RLS
ALTER TABLE public.objective_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guide_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_article_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.continent_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.country_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.objective_type_translations ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Translations are viewable by everyone
CREATE POLICY "Objective translations are viewable by everyone"
  ON public.objective_translations FOR SELECT
  USING (true);

CREATE POLICY "Guide translations are viewable by everyone"
  ON public.guide_translations FOR SELECT
  USING (true);

CREATE POLICY "Blog article translations are viewable by everyone"
  ON public.blog_article_translations FOR SELECT
  USING (true);

CREATE POLICY "Continent translations are viewable by everyone"
  ON public.continent_translations FOR SELECT
  USING (true);

CREATE POLICY "Country translations are viewable by everyone"
  ON public.country_translations FOR SELECT
  USING (true);

CREATE POLICY "Objective type translations are viewable by everyone"
  ON public.objective_type_translations FOR SELECT
  USING (true);

-- RLS Policies - Only editors and admins can manage translations
CREATE POLICY "Editors and admins can manage objective translations"
  ON public.objective_translations FOR ALL
  USING (can_edit_content(auth.uid()));

CREATE POLICY "Editors and admins can manage guide translations"
  ON public.guide_translations FOR ALL
  USING (can_edit_content(auth.uid()));

CREATE POLICY "Editors and admins can manage blog article translations"
  ON public.blog_article_translations FOR ALL
  USING (can_edit_content(auth.uid()));

CREATE POLICY "Editors and admins can manage continent translations"
  ON public.continent_translations FOR ALL
  USING (can_edit_content(auth.uid()));

CREATE POLICY "Editors and admins can manage country translations"
  ON public.country_translations FOR ALL
  USING (can_edit_content(auth.uid()));

CREATE POLICY "Editors and admins can manage objective type translations"
  ON public.objective_type_translations FOR ALL
  USING (can_edit_content(auth.uid()));

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_translation_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_objective_translations_updated_at
  BEFORE UPDATE ON public.objective_translations
  FOR EACH ROW EXECUTE FUNCTION update_translation_updated_at();

CREATE TRIGGER update_guide_translations_updated_at
  BEFORE UPDATE ON public.guide_translations
  FOR EACH ROW EXECUTE FUNCTION update_translation_updated_at();

CREATE TRIGGER update_blog_article_translations_updated_at
  BEFORE UPDATE ON public.blog_article_translations
  FOR EACH ROW EXECUTE FUNCTION update_translation_updated_at();

CREATE TRIGGER update_continent_translations_updated_at
  BEFORE UPDATE ON public.continent_translations
  FOR EACH ROW EXECUTE FUNCTION update_translation_updated_at();

CREATE TRIGGER update_country_translations_updated_at
  BEFORE UPDATE ON public.country_translations
  FOR EACH ROW EXECUTE FUNCTION update_translation_updated_at();

CREATE TRIGGER update_objective_type_translations_updated_at
  BEFORE UPDATE ON public.objective_type_translations
  FOR EACH ROW EXECUTE FUNCTION update_translation_updated_at();