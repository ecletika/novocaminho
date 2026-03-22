-- ==========================================
-- NOVO CAMINHO ÁFRICA - SETUP COMPLETO
-- ==========================================

-- 1. Tabela de Conteúdos
CREATE TABLE IF NOT EXISTS public.africa_content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL CHECK (type IN ('history', 'image', 'video')),
    title TEXT NOT NULL,
    description TEXT,
    content TEXT,
    media_url TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indice para performance
CREATE INDEX IF NOT EXISTS idx_africa_content_sort_order ON public.africa_content(sort_order ASC);

-- 2. Segurança (RLS)
ALTER TABLE public.africa_content ENABLE ROW LEVEL SECURITY;

-- Política de Leitura Pública
CREATE POLICY "Leitura pública para todos" ON public.africa_content
    FOR SELECT USING (true);

-- Política de Escrita para Admins
CREATE POLICY "Admins podem gerir conteúdos da África" ON public.africa_content
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_permissions 
            WHERE user_id = auth.uid() 
            AND (permission = 'admin' OR permission = 'owner')
        )
    );

-- 3. Trigger para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_africa_content_updated_at
    BEFORE UPDATE ON public.africa_content
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 4. Storage Bucket 'africa'
-- Nota: Se já existir, o Supabase ignorará o erro de criação
INSERT INTO storage.buckets (id, name, public)
VALUES ('africa', 'africa', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas de Storage
CREATE POLICY "Imagens da África são públicas" ON storage.objects
    FOR SELECT USING (bucket_id = 'africa');

CREATE POLICY "Admins podem fazer upload de média para África" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'africa' AND 
        (EXISTS (SELECT 1 FROM user_permissions WHERE user_id = auth.uid() AND (permission = 'admin' OR permission = 'owner')))
    );

CREATE POLICY "Admins podem atualizar média da África" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'africa' AND 
        (EXISTS (SELECT 1 FROM user_permissions WHERE user_id = auth.uid() AND (permission = 'admin' OR permission = 'owner')))
    );

CREATE POLICY "Admins podem apagar média da África" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'africa' AND 
        (EXISTS (SELECT 1 FROM user_permissions WHERE user_id = auth.uid() AND (permission = 'admin' OR permission = 'owner')))
    );
