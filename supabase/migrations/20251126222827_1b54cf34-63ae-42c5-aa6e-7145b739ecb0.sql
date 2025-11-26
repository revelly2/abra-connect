-- Remove duration column and update type to support multiple categories
ALTER TABLE public.tourist_spots DROP COLUMN IF EXISTS duration;
ALTER TABLE public.tourist_spots DROP COLUMN IF EXISTS type;
ALTER TABLE public.tourist_spots ADD COLUMN categories text[] DEFAULT '{}';

-- Create storage bucket for tourist spot images
INSERT INTO storage.buckets (id, name, public)
VALUES ('tourist-spots', 'tourist-spots', true)
ON CONFLICT (id) DO NOTHING;

-- Allow anyone to view images
CREATE POLICY "Anyone can view tourist spot images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'tourist-spots');

-- Allow admins to upload images
CREATE POLICY "Admins can upload tourist spot images"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'tourist-spots' AND auth.uid() IN (
  SELECT user_id FROM public.user_roles WHERE role = 'admin'
));

-- Allow admins to update images
CREATE POLICY "Admins can update tourist spot images"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'tourist-spots' AND auth.uid() IN (
  SELECT user_id FROM public.user_roles WHERE role = 'admin'
));

-- Allow admins to delete images
CREATE POLICY "Admins can delete tourist spot images"
ON storage.objects
FOR DELETE
USING (bucket_id = 'tourist-spots' AND auth.uid() IN (
  SELECT user_id FROM public.user_roles WHERE role = 'admin'
));