-- Tabela de posts dos ministérios (blog)
CREATE TABLE public.ministry_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ministry_id UUID NOT NULL REFERENCES public.ministries(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  published BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on ministry_posts
ALTER TABLE public.ministry_posts ENABLE ROW LEVEL SECURITY;

-- Policies for ministry_posts
CREATE POLICY "Anyone can view published ministry posts" 
ON public.ministry_posts 
FOR SELECT 
USING (published = true);

CREATE POLICY "Admins can manage all ministry posts" 
ON public.ministry_posts 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

-- Trigger for updated_at
CREATE TRIGGER update_ministry_posts_updated_at
BEFORE UPDATE ON public.ministry_posts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Tabela de aniversários
CREATE TABLE public.birthdays (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  woman_name TEXT,
  man_name TEXT,
  birthday_date DATE NOT NULL,
  birthday_type TEXT NOT NULL CHECK (birthday_type IN ('personal', 'wedding')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on birthdays
ALTER TABLE public.birthdays ENABLE ROW LEVEL SECURITY;

-- Policies for birthdays
CREATE POLICY "Anyone can view birthdays" 
ON public.birthdays 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage birthdays" 
ON public.birthdays 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

-- Trigger for updated_at
CREATE TRIGGER update_birthdays_updated_at
BEFORE UPDATE ON public.birthdays
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Tabela de relação aniversários-ministérios (many-to-many)
CREATE TABLE public.birthday_ministries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  birthday_id UUID NOT NULL REFERENCES public.birthdays(id) ON DELETE CASCADE,
  ministry_id UUID NOT NULL REFERENCES public.ministries(id) ON DELETE CASCADE,
  UNIQUE(birthday_id, ministry_id)
);

-- Enable RLS on birthday_ministries
ALTER TABLE public.birthday_ministries ENABLE ROW LEVEL SECURITY;

-- Policies for birthday_ministries
CREATE POLICY "Anyone can view birthday ministries" 
ON public.birthday_ministries 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage birthday ministries" 
ON public.birthday_ministries 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

-- Bucket para imagens dos posts de ministérios
INSERT INTO storage.buckets (id, name, public) VALUES ('ministry-posts', 'ministry-posts', true);

-- Policies for ministry-posts bucket
CREATE POLICY "Anyone can view ministry post images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'ministry-posts');

CREATE POLICY "Admins can upload ministry post images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'ministry-posts' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update ministry post images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'ministry-posts' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete ministry post images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'ministry-posts' AND public.has_role(auth.uid(), 'admin'));

-- Bucket para imagens do inventário
INSERT INTO storage.buckets (id, name, public) VALUES ('inventory-images', 'inventory-images', true);

-- Policies for inventory-images bucket
CREATE POLICY "Anyone can view inventory images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'inventory-images');

CREATE POLICY "Admins can upload inventory images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'inventory-images' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update inventory images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'inventory-images' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete inventory images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'inventory-images' AND public.has_role(auth.uid(), 'admin'));