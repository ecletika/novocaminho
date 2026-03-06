-- Add nickname and photo_url to birthdays
ALTER TABLE public.birthdays ADD COLUMN IF NOT EXISTS nickname TEXT;
ALTER TABLE public.birthdays ADD COLUMN IF NOT EXISTS photo_url TEXT;

-- Add bible_verse to ministries
ALTER TABLE public.ministries ADD COLUMN IF NOT EXISTS bible_verse TEXT;

-- Add is_leader to birthday_ministries
ALTER TABLE public.birthday_ministries ADD COLUMN IF NOT EXISTS is_leader BOOLEAN DEFAULT FALSE;
