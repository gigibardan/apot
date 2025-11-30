-- Add discount and promotional fields to jinfotours_circuits table
ALTER TABLE public.jinfotours_circuits
ADD COLUMN IF NOT EXISTS discount_percentage integer DEFAULT 0 CHECK (discount_percentage >= 0 AND discount_percentage <= 100),
ADD COLUMN IF NOT EXISTS original_price numeric(10,2),
ADD COLUMN IF NOT EXISTS discount_until timestamp with time zone,
ADD COLUMN IF NOT EXISTS badge_text text,
ADD COLUMN IF NOT EXISTS badge_color text DEFAULT 'accent';

COMMENT ON COLUMN public.jinfotours_circuits.discount_percentage IS 'Discount percentage (0-100)';
COMMENT ON COLUMN public.jinfotours_circuits.original_price IS 'Original price before discount';
COMMENT ON COLUMN public.jinfotours_circuits.discount_until IS 'Discount valid until date';
COMMENT ON COLUMN public.jinfotours_circuits.badge_text IS 'Badge text (e.g., "Ofertă Limitată", "Popular", "Nou")';
COMMENT ON COLUMN public.jinfotours_circuits.badge_color IS 'Badge color variant';