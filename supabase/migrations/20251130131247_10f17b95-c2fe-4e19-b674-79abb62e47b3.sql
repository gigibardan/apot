-- Create storage buckets for blog and circuits
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  (
    'blog-images',
    'blog-images',
    true,
    10485760,
    ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  ),
  (
    'circuits-images',
    'circuits-images',
    true,
    10485760,
    ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  );

-- Create RLS policies for blog-images bucket
CREATE POLICY "Public can view blog images"
ON storage.objects FOR SELECT
USING (bucket_id = 'blog-images');

CREATE POLICY "Authenticated users can upload blog images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'blog-images' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated users can update blog images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'blog-images' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated users can delete blog images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'blog-images' 
  AND auth.role() = 'authenticated'
);

-- Create RLS policies for circuits-images bucket
CREATE POLICY "Public can view circuit images"
ON storage.objects FOR SELECT
USING (bucket_id = 'circuits-images');

CREATE POLICY "Authenticated users can upload circuit images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'circuits-images' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated users can update circuit images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'circuits-images' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated users can delete circuit images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'circuits-images' 
  AND auth.role() = 'authenticated'
);