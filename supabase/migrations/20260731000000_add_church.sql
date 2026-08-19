-- Igreja (campanário) a que o registo pertence: 'ourem' ou 'sintra'.
-- Escolhido no início dos formulários públicos de aniversário e de visitante.
ALTER TABLE public.birthdays ADD COLUMN IF NOT EXISTS church text;
ALTER TABLE public.visitors  ADD COLUMN IF NOT EXISTS church text;
