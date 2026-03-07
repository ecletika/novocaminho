
-- Migration for compromissos_casais table
CREATE TABLE IF NOT EXISTS public.compromissos_casais (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    nome_marido TEXT NOT NULL,
    assinatura_marido TEXT NOT NULL,
    nome_esposa TEXT NOT NULL,
    assinatura_esposa TEXT NOT NULL,
    data_compromisso DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.compromissos_casais ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can insert their own entries" ON public.compromissos_casais
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own entries" ON public.compromissos_casais
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all entries" ON public.compromissos_casais
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_roles.user_id = auth.uid()
            AND user_roles.role = 'admin'
        )
    );
