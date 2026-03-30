-- Tabela de Posts/Palavras do Casados Para Sempre
CREATE TABLE IF NOT EXISTS public.casados_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  image_url TEXT,
  published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de Galeria do Casados Para Sempre
CREATE TABLE IF NOT EXISTS public.casados_gallery (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  image_url TEXT NOT NULL,
  caption TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- RLS
ALTER TABLE public.casados_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.casados_gallery ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can view published casados_posts') THEN
    CREATE POLICY "Anyone can view published casados_posts"
      ON public.casados_posts FOR SELECT
      USING (published = true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can manage casados_posts') THEN
    CREATE POLICY "Admins can manage casados_posts"
      ON public.casados_posts FOR ALL
      USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can view casados_gallery') THEN
    CREATE POLICY "Anyone can view casados_gallery"
      ON public.casados_gallery FOR SELECT
      USING (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can manage casados_gallery') THEN
    CREATE POLICY "Admins can manage casados_gallery"
      ON public.casados_gallery FOR ALL
      USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));
  END IF;
END $$;

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_casados_posts_updated_at ON public.casados_posts;
CREATE TRIGGER set_casados_posts_updated_at
  BEFORE UPDATE ON public.casados_posts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
