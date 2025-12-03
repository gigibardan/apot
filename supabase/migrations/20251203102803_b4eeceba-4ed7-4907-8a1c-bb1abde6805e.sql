-- Add missing foreign key from reviews.user_id to profiles.id
-- This is needed for PostgREST joins to work properly

-- First check if the constraint already exists and drop if needed
ALTER TABLE public.reviews
DROP CONSTRAINT IF EXISTS reviews_user_id_fkey;

-- Add the foreign key constraint
ALTER TABLE public.reviews
ADD CONSTRAINT reviews_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES public.profiles(id) 
ON DELETE CASCADE;

-- Create index for better join performance
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON public.reviews(user_id);