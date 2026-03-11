
-- Garantir que a tabela birthdays é acessível a todos os tipos de utilizador para SELECT
DO $$
BEGIN
    -- Birthdays
    ALTER TABLE public.birthdays ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Public Select Allow" ON public.birthdays;
    CREATE POLICY "Public Select Allow" ON public.birthdays FOR SELECT USING (true);
    
    DROP POLICY IF EXISTS "Public Insert Allow" ON public.birthdays;
    CREATE POLICY "Public Insert Allow" ON public.birthdays FOR INSERT WITH CHECK (true);
    
    DROP POLICY IF EXISTS "Public Update Allow" ON public.birthdays;
    CREATE POLICY "Public Update Allow" ON public.birthdays FOR UPDATE USING (true);

    -- Birthday Ministries
    ALTER TABLE public.birthday_ministries ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Public Select Allow" ON public.birthday_ministries;
    CREATE POLICY "Public Select Allow" ON public.birthday_ministries FOR SELECT USING (true);
    
    DROP POLICY IF EXISTS "Public Insert Allow" ON public.birthday_ministries;
    CREATE POLICY "Public Insert Allow" ON public.birthday_ministries FOR INSERT WITH CHECK (true);
    
    DROP POLICY IF EXISTS "Public Update Allow" ON public.birthday_ministries;
    CREATE POLICY "Public Update Allow" ON public.birthday_ministries FOR UPDATE USING (true);
END
$$;

-- Notificar o PostgREST para recarregar as tabelas
NOTIFY pgrst, 'reload schema';
