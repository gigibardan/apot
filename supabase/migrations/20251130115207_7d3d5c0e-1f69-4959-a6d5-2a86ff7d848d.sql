-- ==========================================
-- APOT Database Schema
-- Execute this SQL in Supabase SQL Editor
-- ==========================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- ENUMS
-- ==========================================

CREATE TYPE difficulty_level AS ENUM ('easy', 'moderate', 'difficult', 'extreme');
CREATE TYPE user_role_type AS ENUM ('admin', 'editor', 'contributor', 'user');
CREATE TYPE blog_category AS ENUM ('călătorii', 'cultură', 'istorie', 'natură', 'gastronomie', 'aventură');

-- ==========================================
-- TAXONOMIES
-- ==========================================

-- Continents
CREATE TABLE continents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  meta_title TEXT,
  meta_description TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Countries
CREATE TABLE countries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  continent_id UUID NOT NULL REFERENCES continents(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  flag_emoji TEXT,
  description TEXT,
  image_url TEXT,
  capital TEXT,
  currency TEXT,
  language TEXT,
  meta_title TEXT,
  meta_description TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Objective Types
CREATE TABLE objective_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  color TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==========================================
-- CORE CONTENT
-- ==========================================

-- Objectives (main table)
CREATE TABLE objectives (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT,
  description TEXT,
  continent_id UUID REFERENCES continents(id) ON DELETE SET NULL,
  country_id UUID REFERENCES countries(id) ON DELETE SET NULL,
  featured_image TEXT,
  gallery_images JSONB DEFAULT '[]'::jsonb,
  video_urls JSONB DEFAULT '[]'::jsonb,
  location_text TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  google_maps_url TEXT,
  google_place_id TEXT,
  visit_duration TEXT,
  best_season TEXT,
  difficulty_level difficulty_level,
  entrance_fee TEXT,
  opening_hours TEXT,
  accessibility_info TEXT,
  website_url TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  booking_url TEXT,
  unesco_site BOOLEAN DEFAULT FALSE,
  unesco_year INTEGER,
  featured BOOLEAN DEFAULT FALSE,
  meta_title TEXT,
  meta_description TEXT,
  schema_data JSONB,
  views_count INTEGER DEFAULT 0,
  likes_count INTEGER DEFAULT 0,
  published BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMPTZ,
  featured_until TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Objectives-Types Many-to-Many
CREATE TABLE objectives_types_relations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  objective_id UUID NOT NULL REFERENCES objectives(id) ON DELETE CASCADE,
  type_id UUID NOT NULL REFERENCES objective_types(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(objective_id, type_id)
);

-- Blog Articles
CREATE TABLE blog_articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT,
  content TEXT,
  featured_image TEXT,
  category blog_category,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  author_id UUID REFERENCES auth.users(id),
  reading_time INTEGER,
  meta_title TEXT,
  meta_description TEXT,
  schema_data JSONB,
  views_count INTEGER DEFAULT 0,
  featured BOOLEAN DEFAULT FALSE,
  published BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Jinfotours Circuits
CREATE TABLE jinfotours_circuits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  thumbnail_url TEXT,
  external_url TEXT NOT NULL,
  price_from DECIMAL(10, 2),
  duration_days INTEGER,
  countries TEXT[] DEFAULT ARRAY[]::TEXT[],
  highlights TEXT[] DEFAULT ARRAY[]::TEXT[],
  featured BOOLEAN DEFAULT FALSE,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==========================================
-- USER ENGAGEMENT
-- ==========================================

-- User Favorites
CREATE TABLE user_favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  objective_id UUID NOT NULL REFERENCES objectives(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, objective_id)
);

-- Reviews
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  objective_id UUID NOT NULL REFERENCES objectives(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  comment TEXT,
  visit_date DATE,
  helpful_count INTEGER DEFAULT 0,
  approved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==========================================
-- ADMIN & CMS
-- ==========================================

-- Media Library
CREATE TABLE media_library (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  filename TEXT NOT NULL,
  original_filename TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  mime_type TEXT NOT NULL,
  width INTEGER,
  height INTEGER,
  alt_text TEXT,
  caption TEXT,
  uploaded_by UUID REFERENCES auth.users(id),
  used_in TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- User Roles
CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role_type NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, role)
);

-- Activity Logs
CREATE TABLE activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  metadata JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Settings
CREATE TABLE settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==========================================
-- ANALYTICS
-- ==========================================

-- Page Views
CREATE TABLE page_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  page_url TEXT NOT NULL,
  page_title TEXT,
  referrer TEXT,
  user_agent TEXT,
  ip_address INET,
  session_id TEXT,
  viewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Jinfotours Clicks
CREATE TABLE jinfotours_clicks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  circuit_id UUID REFERENCES jinfotours_circuits(id) ON DELETE SET NULL,
  clicked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  source_url TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  user_agent TEXT,
  ip_address INET
);

-- ==========================================
-- INDEXES
-- ==========================================

-- Taxonomies
CREATE INDEX idx_countries_continent ON countries(continent_id);
CREATE INDEX idx_countries_slug ON countries(slug);

-- Objectives
CREATE INDEX idx_objectives_slug ON objectives(slug);
CREATE INDEX idx_objectives_continent ON objectives(continent_id);
CREATE INDEX idx_objectives_country ON objectives(country_id);
CREATE INDEX idx_objectives_published ON objectives(published);
CREATE INDEX idx_objectives_featured ON objectives(featured);
CREATE INDEX idx_objectives_unesco ON objectives(unesco_site);
CREATE INDEX idx_objectives_views ON objectives(views_count DESC);

-- Relations
CREATE INDEX idx_objectives_types_objective ON objectives_types_relations(objective_id);
CREATE INDEX idx_objectives_types_type ON objectives_types_relations(type_id);

-- Blog
CREATE INDEX idx_blog_slug ON blog_articles(slug);
CREATE INDEX idx_blog_published ON blog_articles(published);
CREATE INDEX idx_blog_category ON blog_articles(category);
CREATE INDEX idx_blog_tags ON blog_articles USING GIN(tags);

-- User Engagement
CREATE INDEX idx_favorites_user ON user_favorites(user_id);
CREATE INDEX idx_favorites_objective ON user_favorites(objective_id);
CREATE INDEX idx_reviews_objective ON reviews(objective_id);
CREATE INDEX idx_reviews_user ON reviews(user_id);

-- Analytics
CREATE INDEX idx_page_views_url ON page_views(page_url);
CREATE INDEX idx_page_views_date ON page_views(viewed_at DESC);

-- ==========================================
-- TRIGGERS (updated_at)
-- ==========================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_continents_updated_at BEFORE UPDATE ON continents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_countries_updated_at BEFORE UPDATE ON countries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_objectives_updated_at BEFORE UPDATE ON objectives
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_blog_articles_updated_at BEFORE UPDATE ON blog_articles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_jinfotours_circuits_updated_at BEFORE UPDATE ON jinfotours_circuits
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- ROW LEVEL SECURITY (RLS)
-- ==========================================

-- Enable RLS on all tables
ALTER TABLE continents ENABLE ROW LEVEL SECURITY;
ALTER TABLE countries ENABLE ROW LEVEL SECURITY;
ALTER TABLE objective_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE objectives ENABLE ROW LEVEL SECURITY;
ALTER TABLE objectives_types_relations ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE jinfotours_circuits ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Public read access for taxonomies
CREATE POLICY "Continents are viewable by everyone" ON continents FOR SELECT USING (true);
CREATE POLICY "Countries are viewable by everyone" ON countries FOR SELECT USING (true);
CREATE POLICY "Objective types are viewable by everyone" ON objective_types FOR SELECT USING (true);

-- Public read for published content
CREATE POLICY "Published objectives are viewable by everyone" ON objectives 
  FOR SELECT USING (published = true);

CREATE POLICY "Published blog articles are viewable by everyone" ON blog_articles 
  FOR SELECT USING (published = true);

CREATE POLICY "Circuits are viewable by everyone" ON jinfotours_circuits 
  FOR SELECT USING (true);

-- User favorites (users can manage their own)
CREATE POLICY "Users can view their own favorites" ON user_favorites 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own favorites" ON user_favorites 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorites" ON user_favorites 
  FOR DELETE USING (auth.uid() = user_id);

-- Reviews (users can manage their own)
CREATE POLICY "Approved reviews are viewable by everyone" ON reviews 
  FOR SELECT USING (approved = true);

CREATE POLICY "Users can create their own reviews" ON reviews 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews" ON reviews 
  FOR UPDATE USING (auth.uid() = user_id);

-- Admin policies (will be refined with user_roles table)
-- For now, allow authenticated users with admin role to manage content

-- ==========================================
-- SEED DATA
-- ==========================================

-- Insert Continents
INSERT INTO continents (name, slug, order_index) VALUES
  ('Europa', 'europa', 1),
  ('Asia', 'asia', 2),
  ('Africa', 'africa', 3),
  ('America de Nord', 'america-de-nord', 4),
  ('America de Sud', 'america-de-sud', 5),
  ('Oceania', 'oceania', 6);

-- Insert Objective Types
INSERT INTO objective_types (name, slug, icon, color, order_index) VALUES
  ('Munte', 'munte', '⛰️', '#10B981', 1),
  ('Cultură', 'cultura', '🎭', '#8B5CF6', 2),
  ('Istoric', 'istoric', '🏛️', '#F59E0B', 3),
  ('Religios', 'religios', '⛪', '#3B82F6', 4),
  ('Natură', 'natura', '🌳', '#22C55E', 5),
  ('Urban', 'urban', '🏙️', '#6366F1', 6),
  ('Plajă', 'plaja', '🏖️', '#06B6D4', 7),
  ('Aventură', 'aventura', '🎿', '#EF4444', 8),
  ('Muzee', 'muzee', '🏛️', '#A855F7', 9),
  ('UNESCO', 'unesco', '🏺', '#DC2626', 10);

-- Insert default settings
INSERT INTO settings (key, value, description) VALUES
  ('site_name', '"APOT"', 'Site name'),
  ('site_description', '"Platformă mondială pentru descoperirea obiectivelor turistice"', 'Site description'),
  ('contact_email', '"contact@apot.ro"', 'Contact email'),
  ('items_per_page', '12', 'Default items per page for listings'),
  ('enable_reviews', 'true', 'Enable user reviews'),
  ('auto_approve_reviews', 'false', 'Auto-approve reviews without moderation');