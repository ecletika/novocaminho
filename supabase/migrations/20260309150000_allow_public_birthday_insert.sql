
-- Permitir que qualquer pessoa insira registos de aniversário (formulário público)
CREATE POLICY "Allow public insert to birthdays" 
ON public.birthdays 
FOR INSERT 
WITH CHECK (true);

-- Permitir que qualquer pessoa insira a relação ministério/aniversário
CREATE POLICY "Allow public insert to birthday_ministries" 
ON public.birthday_ministries 
FOR INSERT 
WITH CHECK (true);
