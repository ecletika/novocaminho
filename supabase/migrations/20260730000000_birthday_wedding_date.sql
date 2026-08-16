-- Adiciona a data de aniversário de casamento a cada registo (opcional).
-- Novo modelo: cada pessoa faz o seu registo pessoal e pode indicar,
-- opcionalmente, a sua data de aniversário de casamento (bodas).
ALTER TABLE public.birthdays ADD COLUMN IF NOT EXISTS wedding_date date;
