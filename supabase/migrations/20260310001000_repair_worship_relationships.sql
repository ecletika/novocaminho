
-- Reparar relacionamentos do ministério de Louvor
-- O cache do Supabase não está reconhecendo as chaves estrangeiras, impedindo o carregamento dos integrantes.

DO $$ 
BEGIN
    -- 1. Reparar worship_functions (corrigir nome da coluna de update_at para updated_at)
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'worship_functions' AND column_name = 'update_at') THEN
        ALTER TABLE public.worship_functions RENAME COLUMN update_at TO updated_at;
    END IF;

    -- Garantir que updated_at existe em worship_functions
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'worship_functions' AND column_name = 'updated_at') THEN
        ALTER TABLE public.worship_functions ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();
    END IF;

    -- 2. Garantir Foreign Keys explícitas entre worship_members e worship_functions
    -- Tentar remover antes para garantir que não haja duplicidade com nomes diferentes
    ALTER TABLE IF EXISTS public.worship_members DROP CONSTRAINT IF EXISTS worship_members_primary_function_id_fkey;
    ALTER TABLE public.worship_members 
    ADD CONSTRAINT worship_members_primary_function_id_fkey 
    FOREIGN KEY (primary_function_id) REFERENCES public.worship_functions(id) ON DELETE SET NULL;

    -- 3. Garantir Foreign Keys explícitas na tabela member_functions
    ALTER TABLE IF EXISTS public.member_functions DROP CONSTRAINT IF EXISTS member_functions_member_id_fkey;
    ALTER TABLE public.member_functions 
    ADD CONSTRAINT member_functions_member_id_fkey 
    FOREIGN KEY (member_id) REFERENCES public.worship_members(id) ON DELETE CASCADE;

    ALTER TABLE IF EXISTS public.member_functions DROP CONSTRAINT IF EXISTS member_functions_function_id_fkey;
    ALTER TABLE public.member_functions 
    ADD CONSTRAINT member_functions_function_id_fkey 
    FOREIGN KEY (function_id) REFERENCES public.worship_functions(id) ON DELETE CASCADE;

    -- 4. Garantir Foreign Keys explícitas na tabela song_minister_assignments
    ALTER TABLE IF EXISTS public.song_minister_assignments DROP CONSTRAINT IF EXISTS song_minister_assignments_song_id_fkey;
    ALTER TABLE public.song_minister_assignments 
    ADD CONSTRAINT song_minister_assignments_song_id_fkey 
    FOREIGN KEY (song_id) REFERENCES public.worship_songs(id) ON DELETE CASCADE;

    -- Importante: Os ministrantes no sistema podem estar na tabela worship_ministers OU worship_members
    -- Se a tabela worship_ministers existir, mantemos o vínculo, senão precisamos verificar onde estão salvos.
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'worship_ministers') THEN
        ALTER TABLE IF EXISTS public.song_minister_assignments DROP CONSTRAINT IF EXISTS song_minister_assignments_minister_id_fkey;
        ALTER TABLE public.song_minister_assignments 
        ADD CONSTRAINT song_minister_assignments_minister_id_fkey 
        FOREIGN KEY (minister_id) REFERENCES public.worship_ministers(id) ON DELETE CASCADE;
    END IF;

    -- 5. Garantir Foreign Keys explícitas nas escalas (worship_schedules)
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'worship_schedules') THEN
        ALTER TABLE IF EXISTS public.schedule_vocalists DROP CONSTRAINT IF EXISTS schedule_vocalists_schedule_id_fkey;
        ALTER TABLE public.schedule_vocalists 
        ADD CONSTRAINT schedule_vocalists_schedule_id_fkey 
        FOREIGN KEY (schedule_id) REFERENCES public.worship_schedules(id) ON DELETE CASCADE;

        ALTER TABLE IF EXISTS public.schedule_vocalists DROP CONSTRAINT IF EXISTS schedule_vocalists_member_id_fkey;
        ALTER TABLE public.schedule_vocalists 
        ADD CONSTRAINT schedule_vocalists_member_id_fkey 
        FOREIGN KEY (member_id) REFERENCES public.worship_members(id) ON DELETE CASCADE;

        ALTER TABLE IF EXISTS public.schedule_musicians DROP CONSTRAINT IF EXISTS schedule_musicians_schedule_id_fkey;
        ALTER TABLE public.schedule_musicians 
        ADD CONSTRAINT schedule_musicians_schedule_id_fkey 
        FOREIGN KEY (schedule_id) REFERENCES public.worship_schedules(id) ON DELETE CASCADE;

        ALTER TABLE IF EXISTS public.schedule_musicians DROP CONSTRAINT IF EXISTS schedule_musicians_member_id_fkey;
        ALTER TABLE public.schedule_musicians 
        ADD CONSTRAINT schedule_musicians_member_id_fkey 
        FOREIGN KEY (member_id) REFERENCES public.worship_members(id) ON DELETE CASCADE;
    END IF;

END $$;

-- Recarregar cache do esquema para que o PostgREST reconheça os novos relacionamentos
NOTIFY pgrst, 'reload schema';
