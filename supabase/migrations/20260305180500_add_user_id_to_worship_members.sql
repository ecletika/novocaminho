ALTER TABLE public.worship_members ADD COLUMN user_id uuid REFERENCES auth.users(id);
