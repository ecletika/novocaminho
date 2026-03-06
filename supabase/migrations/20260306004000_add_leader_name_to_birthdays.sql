-- Add leader_name to birthdays
ALTER TABLE public.birthdays ADD COLUMN IF NOT EXISTS leader_name TEXT;
