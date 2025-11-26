-- Create tourist_spots table
CREATE TABLE public.tourist_spots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT,
  duration TEXT,
  type TEXT,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.tourist_spots ENABLE ROW LEVEL SECURITY;

-- Everyone can view tourist spots
CREATE POLICY "Anyone can view tourist spots" 
ON public.tourist_spots 
FOR SELECT 
USING (true);

-- Only admins can insert tourist spots
CREATE POLICY "Admins can insert tourist spots" 
ON public.tourist_spots 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Only admins can update tourist spots
CREATE POLICY "Admins can update tourist spots" 
ON public.tourist_spots 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'));

-- Only admins can delete tourist spots
CREATE POLICY "Admins can delete tourist spots" 
ON public.tourist_spots 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'));

-- Add trigger for automatic timestamp updates
CREATE TRIGGER update_tourist_spots_updated_at
BEFORE UPDATE ON public.tourist_spots
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();