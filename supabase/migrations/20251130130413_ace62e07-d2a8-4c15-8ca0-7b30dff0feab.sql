-- Create storage bucket for objective images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'objectives-images',
  'objectives-images',
  true,
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
);

-- Create RLS policies for objectives-images bucket
CREATE POLICY "Public can view objective images"
ON storage.objects FOR SELECT
USING (bucket_id = 'objectives-images');

CREATE POLICY "Authenticated users can upload objective images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'objectives-images' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated users can update their objective images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'objectives-images' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated users can delete objective images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'objectives-images' 
  AND auth.role() = 'authenticated'
);