-- Add content_images column to store multiple images for detailed content
ALTER TABLE public.cultural_highlights 
ADD COLUMN content_images TEXT[] DEFAULT '{}'::text[];