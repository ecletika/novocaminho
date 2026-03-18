-- Migration para corrigir políticas de RLS das sessões de discipulado e site_config

-- Garantir que a tabela existe (caso tenha sido criada no dashboard sem policies)
CREATE TABLE IF NOT EXISTS public.discipleship_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  person_id UUID REFERENCES public.birthdays(id) ON DELETE SET NULL,
  person_name TEXT NOT NULL,
  session_date TIMESTAMP WITH TIME ZONE NOT NULL,
  notes TEXT,
  answers JSONB NOT NULL DEFAULT '{}'::jsonb,
  ratings JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Ativar RLS
ALTER TABLE public.discipleship_sessions ENABLE ROW LEVEL SECURITY;

-- Apagar policies antigas caso existam
DROP POLICY IF EXISTS "Discipleship sessions are viewable by authenticated users" ON public.discipleship_sessions;
DROP POLICY IF EXISTS "Authenticated users can insert discipleship sessions" ON public.discipleship_sessions;
DROP POLICY IF EXISTS "Authenticated users can update own discipleship sessions" ON public.discipleship_sessions;
DROP POLICY IF EXISTS "Authenticated users can delete own discipleship sessions" ON public.discipleship_sessions;
DROP POLICY IF EXISTS "Admins can manage discipleship sessions" ON public.discipleship_sessions;

-- Criar policies novas
CREATE POLICY "Discipleship sessions are viewable by authenticated users" 
ON public.discipleship_sessions FOR SELECT 
USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert discipleship sessions" 
ON public.discipleship_sessions FOR INSERT 
WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = created_by);

CREATE POLICY "Authenticated users can update own discipleship sessions" 
ON public.discipleship_sessions FOR UPDATE 
USING (auth.role() = 'authenticated' AND auth.uid() = created_by)
WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = created_by);

CREATE POLICY "Authenticated users can delete own discipleship sessions" 
ON public.discipleship_sessions FOR DELETE 
USING (auth.role() = 'authenticated' AND auth.uid() = created_by);

CREATE POLICY "Admins can manage discipleship sessions" 
ON public.discipleship_sessions FOR ALL 
USING (public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


-- Corrigir também a policy de site_config (Garantir que os admins podem inserir a senha da entrevista)
DROP POLICY IF EXISTS "Admins can manage site config" ON public.site_config;
CREATE POLICY "Admins can manage site config" ON public.site_config
  FOR ALL USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

