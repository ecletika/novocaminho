-- Add individual birthday columns to birthdays table
ALTER TABLE public.birthdays ADD COLUMN IF NOT EXISTS woman_birthday DATE;
ALTER TABLE public.birthdays ADD COLUMN IF NOT EXISTS man_birthday DATE;
