
-- Tabela para palavras/devocional dos casados
CREATE TABLE public.casados_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  published BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.casados_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published casados posts" ON public.casados_posts
  FOR SELECT USING (published = true);

CREATE POLICY "Admins can manage casados posts" ON public.casados_posts
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_casados_posts_updated_at
  BEFORE UPDATE ON public.casados_posts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Tabela para galeria dos casados
CREATE TABLE public.casados_gallery (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  image_url TEXT NOT NULL,
  caption TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.casados_gallery ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view casados gallery" ON public.casados_gallery
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage casados gallery" ON public.casados_gallery
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Tabela de configurações do site (para Facebook Live, etc.)
CREATE TABLE public.site_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.site_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view site config" ON public.site_config
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage site config" ON public.site_config
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Tabela de permissões de utilizador
CREATE TABLE public.user_permissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  permission TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, permission)
);

ALTER TABLE public.user_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage user permissions" ON public.user_permissions
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view their own permissions" ON public.user_permissions
  FOR SELECT USING (auth.uid() = user_id);

-- Storage bucket para galeria casados
INSERT INTO storage.buckets (id, name, public) VALUES ('casados-gallery', 'casados-gallery', true);

CREATE POLICY "Anyone can view casados gallery images" ON storage.objects
  FOR SELECT USING (bucket_id = 'casados-gallery');

CREATE POLICY "Admins can upload casados gallery images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'casados-gallery' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update casados gallery images" ON storage.objects
  FOR UPDATE USING (bucket_id = 'casados-gallery' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete casados gallery images" ON storage.objects
  FOR DELETE USING (bucket_id = 'casados-gallery' AND has_role(auth.uid(), 'admin'::app_role));
