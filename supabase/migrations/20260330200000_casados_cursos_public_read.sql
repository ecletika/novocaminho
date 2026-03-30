-- Permitir leitura pública da tabela casados_cursos (página de Cursos é pública)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can view casados_cursos') THEN
    CREATE POLICY "Anyone can view casados_cursos"
      ON public.casados_cursos FOR SELECT
      USING (true);
  END IF;
END $$;
