-- Create cultural_highlights table
CREATE TABLE public.cultural_highlights (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  detailed_content TEXT,
  icon_name TEXT NOT NULL DEFAULT 'Landmark',
  image_url TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.cultural_highlights ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view cultural highlights" 
ON public.cultural_highlights 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can insert cultural highlights" 
ON public.cultural_highlights 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update cultural highlights" 
ON public.cultural_highlights 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete cultural highlights" 
ON public.cultural_highlights 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_cultural_highlights_updated_at
BEFORE UPDATE ON public.cultural_highlights
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default data
INSERT INTO public.cultural_highlights (title, description, icon_name, display_order) VALUES
('Ancient Traditions', 'Experience centuries-old indigenous practices passed down through generations in Abra''s mountain communities.', 'Landmark', 1),
('Itneg Heritage', 'Discover the rich culture of the Itneg people, one of the Philippines'' indigenous groups with unique customs and beliefs.', 'Users', 2),
('Traditional Crafts', 'Witness master artisans creating intricate hand-woven textiles, pottery, and traditional bamboo crafts.', 'Palette', 3),
('Folk Music & Dance', 'Immerse yourself in vibrant performances featuring gangsa music and traditional courtship dances.', 'Music', 4);