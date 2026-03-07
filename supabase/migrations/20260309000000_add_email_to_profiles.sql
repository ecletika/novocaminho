-- Add email column to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email text;

-- Sync existing emails from auth.users (if possible)
-- Note: This requires the migration to be run with high privileges. 
-- In many Supabase setups, you can't join auth.users directly in a migration unless you use an RPC or do it via Dashboard.
-- However, we can try to do a one-time update if the migration runner has access.
DO $$ 
BEGIN
    UPDATE public.profiles p
    SET email = u.email
    FROM auth.users u
    WHERE p.user_id = u.id AND p.email IS NULL;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Could not sync emails from auth.users: %', SQLERRM;
END $$;

-- Update handle_new_user function to sync email
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name', NEW.email);
  RETURN NEW;
END;
$$;
