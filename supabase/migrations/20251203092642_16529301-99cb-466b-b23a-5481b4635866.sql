-- Add country_name column to objectives table for free-text country names
ALTER TABLE public.objectives ADD COLUMN IF NOT EXISTS country_name text;