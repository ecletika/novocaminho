
-- Check and create events table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'events') THEN
        CREATE TABLE public.events (
            id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
            title TEXT NOT NULL,
            description TEXT,
            date DATE NOT NULL,
            time TIME NOT NULL,
            location TEXT,
            category TEXT NOT NULL DEFAULT 'Culto',
            image_url TEXT,
            is_active BOOLEAN DEFAULT true,
            created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
        );

        -- Enable RLS
        ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

        -- Public read policy (anyone can view events)
        IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'events' AND policyname = 'Events are viewable by everyone') THEN
            CREATE POLICY "Events are viewable by everyone" 
            ON public.events 
            FOR SELECT 
            USING (true);
        END IF;

        -- Admin manage policy
        IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'events' AND policyname = 'Admins can manage events') THEN
            CREATE POLICY "Admins can manage events" 
            ON public.events 
            FOR ALL 
            USING (public.has_role(auth.uid(), 'admin'))
            WITH CHECK (public.has_role(auth.uid(), 'admin'));
        END IF;

        -- Trigger for updated_at
        IF NOT EXISTS (SELECT FROM pg_trigger WHERE tgname = 'update_events_updated_at') THEN
            CREATE TRIGGER update_events_updated_at
            BEFORE UPDATE ON public.events
            FOR EACH ROW
            EXECUTE FUNCTION public.update_updated_at_column();
        END IF;
    ELSE
        -- If table exists, ensure image_url column exists
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'events' AND column_name = 'image_url') THEN
            ALTER TABLE public.events ADD COLUMN image_url TEXT;
        END IF;
    END IF;
END $$;

-- Also ensure storage bucket exists
-- This part usually needs to be done via Supabase dashboard or a specific script, 
-- but we can try to include a hint or policy if needed.
-- For now, let's focus on the table.

-- Force reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';
