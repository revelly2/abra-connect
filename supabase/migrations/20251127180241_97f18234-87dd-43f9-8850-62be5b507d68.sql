-- Create a table for the featured cultural story
CREATE TABLE public.featured_story (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL DEFAULT 'The Legend of Abra',
  description_1 text NOT NULL DEFAULT 'Abra''s name comes from the Spanish word for "opening" or "gap," referring to the narrow passage through the mountains. Legend tells of ancient tribes who found refuge in these valleys, creating a rich tapestry of culture that thrives to this day.',
  description_2 text NOT NULL DEFAULT 'The province is home to the Tingguian people (Itneg), whose ancestral domain spans the rugged mountain terrain. Their traditions, from intricate weaving patterns to sacred rituals, offer a window into pre-colonial Philippine civilization.',
  heritage_since text NOT NULL DEFAULT '1598',
  years_of_history text NOT NULL DEFAULT '500+',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.featured_story ENABLE ROW LEVEL SECURITY;

-- Anyone can view the featured story
CREATE POLICY "Anyone can view featured story"
ON public.featured_story
FOR SELECT
USING (true);

-- Only admins can update
CREATE POLICY "Admins can update featured story"
ON public.featured_story
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can insert
CREATE POLICY "Admins can insert featured story"
ON public.featured_story
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Insert default data
INSERT INTO public.featured_story (title, description_1, description_2, heritage_since, years_of_history)
VALUES (
  'The Legend of Abra',
  'Abra''s name comes from the Spanish word for "opening" or "gap," referring to the narrow passage through the mountains. Legend tells of ancient tribes who found refuge in these valleys, creating a rich tapestry of culture that thrives to this day.',
  'The province is home to the Tingguian people (Itneg), whose ancestral domain spans the rugged mountain terrain. Their traditions, from intricate weaving patterns to sacred rituals, offer a window into pre-colonial Philippine civilization.',
  '1598',
  '500+'
);

-- Add trigger for updated_at
CREATE TRIGGER update_featured_story_updated_at
BEFORE UPDATE ON public.featured_story
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();