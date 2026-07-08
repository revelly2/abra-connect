-- 1. Create app_role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- 2. Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 3. Security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS for user_roles
CREATE POLICY "Users can read own roles" ON public.user_roles
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage roles" ON public.user_roles
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 4. Create tourist_spots table
CREATE TABLE public.tourist_spots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  description TEXT NOT NULL,
  detailed_content TEXT,
  image_url TEXT,
  categories TEXT[] DEFAULT '{}',
  latitude DOUBLE PRECISION NOT NULL DEFAULT 17.5947,
  longitude DOUBLE PRECISION NOT NULL DEFAULT 120.7913,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.tourist_spots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read tourist spots" ON public.tourist_spots
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage tourist spots" ON public.tourist_spots
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 5. Create cultural_highlights table
CREATE TABLE public.cultural_highlights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  detailed_content TEXT,
  icon_name TEXT DEFAULT 'Landmark',
  image_url TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  content_images TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.cultural_highlights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read cultural highlights" ON public.cultural_highlights
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage cultural highlights" ON public.cultural_highlights
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 6. Create featured_story table
CREATE TABLE public.featured_story (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description_1 TEXT NOT NULL,
  description_2 TEXT NOT NULL,
  heritage_since TEXT NOT NULL,
  years_of_history TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.featured_story ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read featured story" ON public.featured_story
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage featured story" ON public.featured_story
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 7. Create itinerary_logs table
CREATE TABLE public.itinerary_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gender TEXT,
  age TEXT,
  location TEXT,
  interests TEXT[],
  duration TEXT,
  travel_style TEXT,
  group_type TEXT,
  budget TEXT,
  itinerary_title TEXT,
  itinerary_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.itinerary_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert itinerary logs" ON public.itinerary_logs
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can read itinerary logs" ON public.itinerary_logs
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete itinerary logs" ON public.itinerary_logs
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 8. Storage bucket for tourist spot images
INSERT INTO storage.buckets (id, name, public) VALUES ('tourist-spots', 'tourist-spots', true) ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Anyone can read tourist spot images" ON storage.objects
  FOR SELECT USING (bucket_id = 'tourist-spots');

CREATE POLICY "Admins can upload tourist spot images" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'tourist-spots' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete tourist spot images" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'tourist-spots' AND public.has_role(auth.uid(), 'admin'));

-- 9. Insert Default Seeds / Data

-- Cultural Highlights
INSERT INTO public.cultural_highlights (title, description, icon_name, display_order) VALUES
('Ancient Traditions', 'Experience centuries-old indigenous practices passed down through generations in Abra''s mountain communities.', 'Landmark', 1),
('Itneg Heritage', 'Discover the rich culture of the Itneg people, one of the Philippines'' indigenous groups with unique customs and beliefs.', 'Users', 2),
('Traditional Crafts', 'Witness master artisans creating intricate hand-woven textiles, pottery, and traditional bamboo crafts.', 'Palette', 3),
('Folk Music & Dance', 'Immerse yourself in vibrant performances featuring gangsa music and traditional courtship dances.', 'Music', 4)
ON CONFLICT DO NOTHING;

-- Featured Story
INSERT INTO public.featured_story (title, description_1, description_2, heritage_since, years_of_history)
VALUES (
  'The Legend of Abra',
  'Abra''s name comes from the Spanish word for "opening" or "gap," referring to the narrow passage through the mountains. Legend tells of ancient tribes who found refuge in these valleys, creating a rich tapestry of culture that thrives to this day.',
  'The province is home to the Tingguian people (Itneg), whose ancestral domain spans the rugged mountain terrain. Their traditions, from intricate weaving patterns to sacred rituals, offer a window into pre-colonial Philippine civilization.',
  '1598',
  '500+'
) ON CONFLICT DO NOTHING;

-- Default Tourist Spots
INSERT INTO public.tourist_spots (name, location, description, detailed_content, categories, latitude, longitude) VALUES
(
  'Kaparkan Falls',
  'Tineg, Abra',
  'A magnificent multi-tiered spring waterfall, featuring unique travertine terraced pools that flow into one another.',
  'Kaparkan Falls (also known as Mulawin Falls) is a breathtaking natural wonder located in Tineg, Abra. It is characterized by high-terraced limestone pools filled with cool, turquoise mountain spring water. Visitors can swim in these unique natural pools during the rainy season when the water flow is at its peak. Getting there requires an off-road adventure on customized logging trucks, making the journey an exciting part of the experience.',
  ARRAY['Nature', 'Adventure'],
  17.7981,
  120.7816
),
(
  'Tangadan Tunnel',
  'San Quintin, Abra',
  'The historic 40-meter tunnel serving as the symbolic gateway to the scenic province of Abra.',
  'The Tangadan Tunnel is a historical landmark and the main entryway to the landlocked province of Abra. Carved through the hills bordering Ilocos Sur and Abra, this 40-meter tunnel features a prominent welcome arch displaying symbols of Abra''s heritage. Visitors often stop by to capture photographs and admire the towering canopy of forest greens.',
  ARRAY['History', 'Sightseeing'],
  17.5255,
  120.5204
),
(
  'St. Catherine of Alexandria Parish (Tayum Church)',
  'Tayum, Abra',
  'A beautifully preserved 19th-century Baroque church declared a National Cultural Treasure.',
  'St. Catherine of Alexandria Parish Church, commonly known as Tayum Church, is a 19th-century Baroque church built during the Spanish colonial era. It features stunning brick architecture and is well-known for its historic bell tower. Because of its outstanding cultural and architectural significance, the National Museum of the Philippines declared it a National Cultural Treasure.',
  ARRAY['Culture', 'History'],
  17.6167,
  120.6500
),
(
  'Apao Rolling Hills',
  'Tineg, Abra',
  'Vast landscapes of rolling green hills offering panoramic views of Abra''s mountains.',
  'Apao Rolling Hills offer spectacular views of Abra''s natural terrain, particularly stunning during sunrise and sunset. The undulating hills covered in lush greenery resemble the famous Batanes landscape, making it a popular spot for nature enthusiasts, photographers, and travelers seeking tranquility.',
  ARRAY['Nature', 'Sightseeing'],
  17.8200,
  120.8000
) ON CONFLICT DO NOTHING;
