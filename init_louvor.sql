
-- Script to initialize Worship Module tables and permissions
-- Copie TUDO isto e cole no SQL Editor do Supabase, depois carregue em Run.

CREATE TABLE IF NOT EXISTS public.worship_functions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.worship_functions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable ALL on worship_functions" ON public.worship_functions;
CREATE POLICY "Enable ALL on worship_functions" ON public.worship_functions FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.member_functions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    member_id uuid NOT NULL,
    function_id uuid NOT NULL
);

ALTER TABLE public.member_functions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable ALL on member_functions" ON public.member_functions;
CREATE POLICY "Enable ALL on member_functions" ON public.member_functions FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.worship_members (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    photo_url text,
    primary_function_id uuid,
    phone text
);

ALTER TABLE public.worship_members ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable ALL on worship_members" ON public.worship_members;
CREATE POLICY "Enable ALL on worship_members" ON public.worship_members FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.worship_ministers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.worship_ministers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable ALL on worship_ministers" ON public.worship_ministers;
CREATE POLICY "Enable ALL on worship_ministers" ON public.worship_ministers FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.worship_songs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    original_key text NOT NULL,
    lyrics text,
    has_chords boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    content_type text DEFAULT 'cifra'::text NOT NULL,
    CONSTRAINT worship_songs_content_type_check CHECK ((content_type = ANY (ARRAY['cifra'::text, 'letra'::text])))
);

ALTER TABLE public.worship_songs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable ALL on worship_songs" ON public.worship_songs;
CREATE POLICY "Enable ALL on worship_songs" ON public.worship_songs FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.song_minister_assignments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    song_id uuid NOT NULL,
    minister_id uuid NOT NULL,
    key text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.song_minister_assignments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable ALL on song_minister_assignments" ON public.song_minister_assignments;
CREATE POLICY "Enable ALL on song_minister_assignments" ON public.song_minister_assignments FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.worship_schedules (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    date date NOT NULL,
    "time" text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    minister_id uuid
);

ALTER TABLE public.worship_schedules ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable ALL on worship_schedules" ON public.worship_schedules;
CREATE POLICY "Enable ALL on worship_schedules" ON public.worship_schedules FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.schedule_vocalists (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    schedule_id uuid NOT NULL,
    member_id uuid NOT NULL
);

ALTER TABLE public.schedule_vocalists ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable ALL on schedule_vocalists" ON public.schedule_vocalists;
CREATE POLICY "Enable ALL on schedule_vocalists" ON public.schedule_vocalists FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.schedule_musicians (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    schedule_id uuid NOT NULL,
    member_id uuid NOT NULL,
    instrument text NOT NULL,
    CONSTRAINT schedule_musicians_instrument_check CHECK ((instrument = ANY (ARRAY['teclado'::text, 'violao'::text, 'bateria'::text])))
);

ALTER TABLE public.schedule_musicians ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable ALL on schedule_musicians" ON public.schedule_musicians;
CREATE POLICY "Enable ALL on schedule_musicians" ON public.schedule_musicians FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.schedule_songs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    schedule_id uuid NOT NULL,
    song_id uuid NOT NULL,
    key text NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL
);

ALTER TABLE public.schedule_songs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable ALL on schedule_songs" ON public.schedule_songs;
CREATE POLICY "Enable ALL on schedule_songs" ON public.schedule_songs FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.schedule_team_members (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    schedule_id uuid NOT NULL,
    member_id uuid NOT NULL,
    role text NOT NULL,
    instrument text
);

ALTER TABLE public.schedule_team_members ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable ALL on schedule_team_members" ON public.schedule_team_members;
CREATE POLICY "Enable ALL on schedule_team_members" ON public.schedule_team_members FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.schedule_members (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    schedule_id uuid NOT NULL,
    member_id uuid NOT NULL
);

ALTER TABLE public.schedule_members ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable ALL on schedule_members" ON public.schedule_members;
CREATE POLICY "Enable ALL on schedule_members" ON public.schedule_members FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.general_schedules (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    date date NOT NULL,
    type text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.general_schedules ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable ALL on general_schedules" ON public.general_schedules;
CREATE POLICY "Enable ALL on general_schedules" ON public.general_schedules FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.user_permissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  permission TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, permission)
);

ALTER TABLE public.user_permissions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable ALL on user_permissions" ON public.user_permissions;
CREATE POLICY "Enable ALL on user_permissions" ON public.user_permissions FOR ALL USING (true) WITH CHECK (true);

NOTIFY pgrst, 'reload schema';
