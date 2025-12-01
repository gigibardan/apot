-- Rename visit_date to travel_date in reviews table for consistency
ALTER TABLE public.reviews 
RENAME COLUMN visit_date TO travel_date;