-- Add detailed_content column to tourist_spots table for full history/details
ALTER TABLE public.tourist_spots 
ADD COLUMN detailed_content text;