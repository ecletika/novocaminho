-- Política abrangente para a tabela birthdays para evitar o erro "violates row-level security"
DROP POLICY IF EXISTS "Allow public insert to birthdays" ON public.birthdays;
DROP POLICY IF EXISTS "Allow public insert to birthday_ministries" ON public.birthday_ministries;

CREATE POLICY "Enable ALL for public on birthdays"
ON public.birthdays
FOR ALL
USING (true)
WITH CHECK (true);

CREATE POLICY "Enable ALL for public on birthday_ministries"
ON public.birthday_ministries
FOR ALL
USING (true)
WITH CHECK (true);

-- Tentar recarregar a cache para ter certeza
NOTIFY pgrst, 'reload schema';
