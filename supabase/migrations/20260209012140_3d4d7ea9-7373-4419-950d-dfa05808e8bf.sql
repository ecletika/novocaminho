
-- Add optional contact fields to birthdays table
ALTER TABLE public.birthdays ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE public.birthdays ADD COLUMN IF NOT EXISTS email text;
ALTER TABLE public.birthdays ADD COLUMN IF NOT EXISTS address text;
