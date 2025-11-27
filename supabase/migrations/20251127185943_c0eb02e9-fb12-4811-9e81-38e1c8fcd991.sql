-- Create table for storing itinerary generation logs
CREATE TABLE public.itinerary_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gender text,
  age text,
  location text,
  interests text[],
  duration text,
  travel_style text,
  group_type text,
  budget text,
  itinerary_title text,
  itinerary_data jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.itinerary_logs ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (for anonymous users generating itineraries)
CREATE POLICY "Anyone can insert itinerary logs"
ON public.itinerary_logs
FOR INSERT
WITH CHECK (true);

-- Only admins can view itinerary logs
CREATE POLICY "Admins can view itinerary logs"
ON public.itinerary_logs
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can delete itinerary logs
CREATE POLICY "Admins can delete itinerary logs"
ON public.itinerary_logs
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));