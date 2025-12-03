-- Add city column to objectives table
ALTER TABLE public.objectives ADD COLUMN IF NOT EXISTS city text;

-- Add foreign key from reviews to profiles for user_id
-- First check if constraint exists, if not add it
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'reviews_user_id_fkey' 
    AND table_name = 'reviews'
  ) THEN
    ALTER TABLE public.reviews
    ADD CONSTRAINT reviews_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Create index on city column for better performance
CREATE INDEX IF NOT EXISTS idx_objectives_city ON public.objectives(city);