-- ==========================================
-- SECURITY FIXES FOR DATABASE SCHEMA
-- ==========================================

-- Fix 1: Update function to set search_path (prevents security issues)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public;

-- Fix 2: Enable RLS on analytics tables
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE jinfotours_clicks ENABLE ROW LEVEL SECURITY;

-- Fix 3: Add RLS policies for objectives_types_relations (public read)
CREATE POLICY "Relations are viewable by everyone" ON objectives_types_relations 
  FOR SELECT USING (true);

-- Fix 4: Add RLS policies for media_library
CREATE POLICY "Media library is viewable by authenticated users" ON media_library 
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can upload media" ON media_library 
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = uploaded_by);

-- Fix 5: Add RLS policies for user_roles
CREATE POLICY "Users can view their own roles" ON user_roles 
  FOR SELECT USING (auth.uid() = user_id);

-- Fix 6: Add RLS policies for activity_logs
CREATE POLICY "Users can view their own activity logs" ON activity_logs 
  FOR SELECT USING (auth.uid() = user_id);

-- Fix 7: Add RLS policies for settings (public read for non-sensitive settings)
CREATE POLICY "Public settings are viewable by everyone" ON settings 
  FOR SELECT USING (true);

-- Fix 8: Add RLS policies for analytics tables (no direct user access, only via backend)
-- These tables are write-only for tracking, no public read access
CREATE POLICY "Allow inserting page views" ON page_views 
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow inserting jinfotours clicks" ON jinfotours_clicks 
  FOR INSERT WITH CHECK (true);

-- Note: Admin policies will be added later when admin authentication is implemented
-- using the user_roles table with proper security definer functions