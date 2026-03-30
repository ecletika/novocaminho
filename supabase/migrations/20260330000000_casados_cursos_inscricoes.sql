-- Tabela de Cursos do Casados Para Sempre
CREATE TABLE IF NOT EXISTS public.casados_cursos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  start_date DATE,
  status TEXT NOT NULL DEFAULT 'Inscrições Abertas',
  link TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de Inscrições (Alunos/Casais)
CREATE TABLE IF NOT EXISTS public.casados_inscricoes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT,
  course_id UUID REFERENCES public.casados_cursos(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'Confirmado',
  link TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- RLS
ALTER TABLE public.casados_cursos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.casados_inscricoes ENABLE ROW LEVEL SECURITY;

-- Policies: apenas admins podem gerir
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can manage casados_cursos') THEN
    CREATE POLICY "Admins can manage casados_cursos"
      ON public.casados_cursos FOR ALL
      USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can manage casados_inscricoes') THEN
    CREATE POLICY "Admins can manage casados_inscricoes"
      ON public.casados_inscricoes FOR ALL
      USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));
  END IF;
END $$;
