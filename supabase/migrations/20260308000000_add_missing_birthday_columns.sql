-- Add leadership and specific birthday columns to birthdays table
ALTER TABLE public.birthdays ADD COLUMN IF NOT EXISTS leader_name TEXT;
ALTER TABLE public.birthdays ADD COLUMN IF NOT EXISTS woman_birthday DATE;
ALTER TABLE public.birthdays ADD COLUMN IF NOT EXISTS man_birthday DATE;

-- Update birthday_date to be nullable just in case? Actually it's required in the code.
-- The woman_birthday and man_birthday are specifically for wedding anniversaries (their personal birthdays)

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';
