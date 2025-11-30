-- Create security definer function to check user roles
-- This prevents recursive RLS issues
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role::text = _role
  )
$$;

-- Create helper function to check if user is admin or editor
CREATE OR REPLACE FUNCTION public.can_edit_content(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role::text IN ('admin', 'editor')
  )
$$;

-- Update RLS policies for objectives table
DROP POLICY IF EXISTS "Published objectives are viewable by everyone" ON public.objectives;
CREATE POLICY "Published objectives are viewable by everyone"
  ON public.objectives
  FOR SELECT
  USING (published = true OR auth.uid() IS NOT NULL);

CREATE POLICY "Editors and admins can insert objectives"
  ON public.objectives
  FOR INSERT
  WITH CHECK (public.can_edit_content(auth.uid()));

CREATE POLICY "Editors and admins can update objectives"
  ON public.objectives
  FOR UPDATE
  USING (public.can_edit_content(auth.uid()));

CREATE POLICY "Only admins can delete objectives"
  ON public.objectives
  FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- Update RLS policies for blog_articles table
DROP POLICY IF EXISTS "Published blog articles are viewable by everyone" ON public.blog_articles;
CREATE POLICY "Published blog articles are viewable by everyone"
  ON public.blog_articles
  FOR SELECT
  USING (published = true OR auth.uid() IS NOT NULL);

CREATE POLICY "Editors and admins can insert articles"
  ON public.blog_articles
  FOR INSERT
  WITH CHECK (public.can_edit_content(auth.uid()));

CREATE POLICY "Editors and admins can update articles"
  ON public.blog_articles
  FOR UPDATE
  USING (public.can_edit_content(auth.uid()));

CREATE POLICY "Only admins can delete articles"
  ON public.blog_articles
  FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- Update RLS policies for jinfotours_circuits table
DROP POLICY IF EXISTS "Circuits are viewable by everyone" ON public.jinfotours_circuits;
CREATE POLICY "Circuits are viewable by everyone"
  ON public.jinfotours_circuits
  FOR SELECT
  USING (true);

CREATE POLICY "Editors and admins can insert circuits"
  ON public.jinfotours_circuits
  FOR INSERT
  WITH CHECK (public.can_edit_content(auth.uid()));

CREATE POLICY "Editors and admins can update circuits"
  ON public.jinfotours_circuits
  FOR UPDATE
  USING (public.can_edit_content(auth.uid()));

CREATE POLICY "Only admins can delete circuits"
  ON public.jinfotours_circuits
  FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- Update RLS policies for media_library table
DROP POLICY IF EXISTS "Authenticated users can upload media" ON public.media_library;
DROP POLICY IF EXISTS "Media library is viewable by authenticated users" ON public.media_library;

CREATE POLICY "Media library is viewable by authenticated users"
  ON public.media_library
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Editors and admins can upload media"
  ON public.media_library
  FOR INSERT
  WITH CHECK (public.can_edit_content(auth.uid()) AND auth.uid() = uploaded_by);

CREATE POLICY "Editors and admins can update media"
  ON public.media_library
  FOR UPDATE
  USING (public.can_edit_content(auth.uid()));

CREATE POLICY "Only admins can delete media"
  ON public.media_library
  FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- Update RLS policies for settings table
DROP POLICY IF EXISTS "Public settings are viewable by everyone" ON public.settings;
CREATE POLICY "Settings are viewable by authenticated users"
  ON public.settings
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Only admins can update settings"
  ON public.settings
  FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can insert settings"
  ON public.settings
  FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete settings"
  ON public.settings
  FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- Update objectives_types_relations policies
DROP POLICY IF EXISTS "Relations are viewable by everyone" ON public.objectives_types_relations;
CREATE POLICY "Relations are viewable by everyone"
  ON public.objectives_types_relations
  FOR SELECT
  USING (true);

CREATE POLICY "Editors and admins can insert relations"
  ON public.objectives_types_relations
  FOR INSERT
  WITH CHECK (public.can_edit_content(auth.uid()));

CREATE POLICY "Editors and admins can delete relations"
  ON public.objectives_types_relations
  FOR DELETE
  USING (public.can_edit_content(auth.uid()));

-- Create profiles table for additional user info
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles
  FOR SELECT
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Trigger to create profile on user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  
  -- Create default user role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;

-- Create trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Add updated_at trigger for profiles
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();