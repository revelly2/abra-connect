
-- Create app_role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- User roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function for role checking
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

-- RLS for user_roles: users can read their own roles, admins can read all
CREATE POLICY "Users can read own roles" ON public.user_roles
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage roles" ON public.user_roles
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Tourist spots table
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

-- Cultural highlights table
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

-- Featured story table
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

-- Itinerary logs table
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

-- Storage bucket for tourist spot images
INSERT INTO storage.buckets (id, name, public) VALUES ('tourist-spots', 'tourist-spots', true);

CREATE POLICY "Anyone can read tourist spot images" ON storage.objects
  FOR SELECT USING (bucket_id = 'tourist-spots');

CREATE POLICY "Admins can upload tourist spot images" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'tourist-spots' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete tourist spot images" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'tourist-spots' AND public.has_role(auth.uid(), 'admin'));
