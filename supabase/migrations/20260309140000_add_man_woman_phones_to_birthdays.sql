-- Add specific phone columns for husband and wife
ALTER TABLE public.birthdays ADD COLUMN IF NOT EXISTS man_phone TEXT;
ALTER TABLE public.birthdays ADD COLUMN IF NOT EXISTS woman_phone TEXT;

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';
