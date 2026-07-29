-- ============================================================
-- Portal de Visitantes
-- Tabela para registar visitantes da igreja através do portal
-- público (link externo + QR Code) e geri-los no painel admin.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.visitors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  birth_date date,
  address text,
  phone text,
  email text,
  photo_url text,
  -- Deseja receber visitas em casa (sim/não)
  wants_home_visit boolean NOT NULL DEFAULT false,
  -- Quem esteve com o visitante: filhos, conjuge, amigos
  accompanied_by text[] NOT NULL DEFAULT '{}',
  -- Pedidos de oração: familia, financeiro, emprego, casa, casamento, filhos
  prayer_requests text[] NOT NULL DEFAULT '{}',
  -- Observações internas (preenchido no admin)
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS visitors_created_at_idx ON public.visitors (created_at DESC);

-- ── Row Level Security ──────────────────────────────────────
ALTER TABLE public.visitors ENABLE ROW LEVEL SECURITY;

-- Qualquer pessoa pode inserir (formulário público de registo)
DROP POLICY IF EXISTS "Public can insert visitors" ON public.visitors;
CREATE POLICY "Public can insert visitors"
  ON public.visitors
  FOR INSERT
  WITH CHECK (true);

-- Qualquer pessoa pode ler (necessário para a página pública
-- "Visitantes do Dia" que mostra foto, nome e data do cadastro)
DROP POLICY IF EXISTS "Public can read visitors" ON public.visitors;
CREATE POLICY "Public can read visitors"
  ON public.visitors
  FOR SELECT
  USING (true);

-- Apenas utilizadores autenticados podem atualizar/eliminar
DROP POLICY IF EXISTS "Authenticated can update visitors" ON public.visitors;
CREATE POLICY "Authenticated can update visitors"
  ON public.visitors
  FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated can delete visitors" ON public.visitors;
CREATE POLICY "Authenticated can delete visitors"
  ON public.visitors
  FOR DELETE
  USING (auth.role() = 'authenticated');

-- ── Atualização automática de updated_at ────────────────────
CREATE OR REPLACE FUNCTION public.set_visitors_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS visitors_set_updated_at ON public.visitors;
CREATE TRIGGER visitors_set_updated_at
  BEFORE UPDATE ON public.visitors
  FOR EACH ROW
  EXECUTE FUNCTION public.set_visitors_updated_at();

-- ── Configuração inicial do portal (customizável no admin) ──
INSERT INTO public.site_config (key, value)
VALUES (
  'visitor_portal_config',
  '{"title":"Seja bem-vindo!","subtitle":"Ficamos muito felizes com a sua visita. Preencha os seus dados para mantermos contacto.","accent_color":"#2563eb","logo_url":"","button_label":"Concluir Registo","success_message":"Obrigado pela sua visita! Que Deus abençoe a sua vida.","show_daily_public":"true"}'
)
ON CONFLICT (key) DO NOTHING;
