CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "plpgsql" WITH SCHEMA "pg_catalog";
CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";
BEGIN;

--
-- PostgreSQL database dump
--


-- Dumped from database version 17.6
-- Dumped by pg_dump version 18.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--



--
-- Name: app_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.app_role AS ENUM (
    'admin',
    'member'
);


--
-- Name: handle_new_user(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_new_user() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name');
  RETURN NEW;
END;
$$;


--
-- Name: has_role(uuid, public.app_role); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.has_role(_user_id uuid, _role public.app_role) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


SET default_table_access_method = heap;

--
-- Name: general_schedules; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.general_schedules (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    date date NOT NULL,
    type text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: inventory_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.inventory_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    category text NOT NULL,
    location text NOT NULL,
    purpose text,
    condition text NOT NULL,
    notes text,
    image_url text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: member_functions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.member_functions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    member_id uuid NOT NULL,
    function_id uuid NOT NULL
);


--
-- Name: ministries; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ministries (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    slug text NOT NULL,
    title text NOT NULL,
    description text,
    icon text DEFAULT 'Users'::text NOT NULL,
    image_url text,
    features text[] DEFAULT '{}'::text[],
    is_active boolean DEFAULT true,
    sort_order integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.profiles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    full_name text,
    avatar_url text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: schedule_members; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.schedule_members (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    schedule_id uuid NOT NULL,
    member_id uuid NOT NULL
);


--
-- Name: schedule_musicians; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.schedule_musicians (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    schedule_id uuid NOT NULL,
    member_id uuid NOT NULL,
    instrument text NOT NULL,
    CONSTRAINT schedule_musicians_instrument_check CHECK ((instrument = ANY (ARRAY['teclado'::text, 'violao'::text, 'bateria'::text])))
);


--
-- Name: schedule_songs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.schedule_songs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    schedule_id uuid NOT NULL,
    song_id uuid NOT NULL,
    key text NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL
);


--
-- Name: schedule_team_members; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.schedule_team_members (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    schedule_id uuid NOT NULL,
    member_id uuid NOT NULL,
    role text NOT NULL,
    instrument text
);


--
-- Name: schedule_vocalists; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.schedule_vocalists (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    schedule_id uuid NOT NULL,
    member_id uuid NOT NULL
);


--
-- Name: song_minister_assignments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.song_minister_assignments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    song_id uuid NOT NULL,
    minister_id uuid NOT NULL,
    key text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: user_roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_roles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    role public.app_role DEFAULT 'member'::public.app_role NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: worship_functions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.worship_functions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: worship_members; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.worship_members (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    photo_url text,
    primary_function_id uuid,
    phone text
);


--
-- Name: worship_ministers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.worship_ministers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: worship_schedules; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.worship_schedules (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    date date NOT NULL,
    "time" text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    minister_id uuid
);


--
-- Name: worship_songs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.worship_songs (
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


--
-- Name: general_schedules general_schedules_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.general_schedules
    ADD CONSTRAINT general_schedules_pkey PRIMARY KEY (id);


--
-- Name: inventory_items inventory_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory_items
    ADD CONSTRAINT inventory_items_pkey PRIMARY KEY (id);


--
-- Name: member_functions member_functions_member_id_function_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.member_functions
    ADD CONSTRAINT member_functions_member_id_function_id_key UNIQUE (member_id, function_id);


--
-- Name: member_functions member_functions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.member_functions
    ADD CONSTRAINT member_functions_pkey PRIMARY KEY (id);


--
-- Name: ministries ministries_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ministries
    ADD CONSTRAINT ministries_pkey PRIMARY KEY (id);


--
-- Name: ministries ministries_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ministries
    ADD CONSTRAINT ministries_slug_key UNIQUE (slug);


--
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);


--
-- Name: profiles profiles_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_user_id_key UNIQUE (user_id);


--
-- Name: schedule_members schedule_members_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schedule_members
    ADD CONSTRAINT schedule_members_pkey PRIMARY KEY (id);


--
-- Name: schedule_musicians schedule_musicians_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schedule_musicians
    ADD CONSTRAINT schedule_musicians_pkey PRIMARY KEY (id);


--
-- Name: schedule_musicians schedule_musicians_schedule_id_member_id_instrument_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schedule_musicians
    ADD CONSTRAINT schedule_musicians_schedule_id_member_id_instrument_key UNIQUE (schedule_id, member_id, instrument);


--
-- Name: schedule_songs schedule_songs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schedule_songs
    ADD CONSTRAINT schedule_songs_pkey PRIMARY KEY (id);


--
-- Name: schedule_team_members schedule_team_members_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schedule_team_members
    ADD CONSTRAINT schedule_team_members_pkey PRIMARY KEY (id);


--
-- Name: schedule_team_members schedule_team_members_schedule_id_member_id_role_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schedule_team_members
    ADD CONSTRAINT schedule_team_members_schedule_id_member_id_role_key UNIQUE (schedule_id, member_id, role);


--
-- Name: schedule_vocalists schedule_vocalists_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schedule_vocalists
    ADD CONSTRAINT schedule_vocalists_pkey PRIMARY KEY (id);


--
-- Name: schedule_vocalists schedule_vocalists_schedule_id_member_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schedule_vocalists
    ADD CONSTRAINT schedule_vocalists_schedule_id_member_id_key UNIQUE (schedule_id, member_id);


--
-- Name: song_minister_assignments song_minister_assignments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.song_minister_assignments
    ADD CONSTRAINT song_minister_assignments_pkey PRIMARY KEY (id);


--
-- Name: song_minister_assignments song_minister_assignments_song_id_minister_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.song_minister_assignments
    ADD CONSTRAINT song_minister_assignments_song_id_minister_id_key UNIQUE (song_id, minister_id);


--
-- Name: user_roles user_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_user_id_role_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_role_key UNIQUE (user_id, role);


--
-- Name: worship_functions worship_functions_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.worship_functions
    ADD CONSTRAINT worship_functions_name_key UNIQUE (name);


--
-- Name: worship_functions worship_functions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.worship_functions
    ADD CONSTRAINT worship_functions_pkey PRIMARY KEY (id);


--
-- Name: worship_members worship_members_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.worship_members
    ADD CONSTRAINT worship_members_pkey PRIMARY KEY (id);


--
-- Name: worship_ministers worship_ministers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.worship_ministers
    ADD CONSTRAINT worship_ministers_pkey PRIMARY KEY (id);


--
-- Name: worship_schedules worship_schedules_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.worship_schedules
    ADD CONSTRAINT worship_schedules_pkey PRIMARY KEY (id);


--
-- Name: worship_songs worship_songs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.worship_songs
    ADD CONSTRAINT worship_songs_pkey PRIMARY KEY (id);


--
-- Name: general_schedules update_general_schedules_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_general_schedules_updated_at BEFORE UPDATE ON public.general_schedules FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: inventory_items update_inventory_items_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_inventory_items_updated_at BEFORE UPDATE ON public.inventory_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: ministries update_ministries_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_ministries_updated_at BEFORE UPDATE ON public.ministries FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: profiles update_profiles_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: worship_functions update_worship_functions_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_worship_functions_updated_at BEFORE UPDATE ON public.worship_functions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: worship_members update_worship_members_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_worship_members_updated_at BEFORE UPDATE ON public.worship_members FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: worship_ministers update_worship_ministers_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_worship_ministers_updated_at BEFORE UPDATE ON public.worship_ministers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: worship_schedules update_worship_schedules_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_worship_schedules_updated_at BEFORE UPDATE ON public.worship_schedules FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: worship_songs update_worship_songs_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_worship_songs_updated_at BEFORE UPDATE ON public.worship_songs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: member_functions member_functions_function_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.member_functions
    ADD CONSTRAINT member_functions_function_id_fkey FOREIGN KEY (function_id) REFERENCES public.worship_functions(id) ON DELETE CASCADE;


--
-- Name: member_functions member_functions_member_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.member_functions
    ADD CONSTRAINT member_functions_member_id_fkey FOREIGN KEY (member_id) REFERENCES public.worship_members(id) ON DELETE CASCADE;


--
-- Name: profiles profiles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: schedule_members schedule_members_member_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schedule_members
    ADD CONSTRAINT schedule_members_member_id_fkey FOREIGN KEY (member_id) REFERENCES public.worship_members(id) ON DELETE CASCADE;


--
-- Name: schedule_members schedule_members_schedule_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schedule_members
    ADD CONSTRAINT schedule_members_schedule_id_fkey FOREIGN KEY (schedule_id) REFERENCES public.worship_schedules(id) ON DELETE CASCADE;


--
-- Name: schedule_musicians schedule_musicians_member_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schedule_musicians
    ADD CONSTRAINT schedule_musicians_member_id_fkey FOREIGN KEY (member_id) REFERENCES public.worship_members(id) ON DELETE CASCADE;


--
-- Name: schedule_musicians schedule_musicians_schedule_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schedule_musicians
    ADD CONSTRAINT schedule_musicians_schedule_id_fkey FOREIGN KEY (schedule_id) REFERENCES public.worship_schedules(id) ON DELETE CASCADE;


--
-- Name: schedule_songs schedule_songs_schedule_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schedule_songs
    ADD CONSTRAINT schedule_songs_schedule_id_fkey FOREIGN KEY (schedule_id) REFERENCES public.worship_schedules(id) ON DELETE CASCADE;


--
-- Name: schedule_songs schedule_songs_song_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schedule_songs
    ADD CONSTRAINT schedule_songs_song_id_fkey FOREIGN KEY (song_id) REFERENCES public.worship_songs(id) ON DELETE CASCADE;


--
-- Name: schedule_team_members schedule_team_members_member_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schedule_team_members
    ADD CONSTRAINT schedule_team_members_member_id_fkey FOREIGN KEY (member_id) REFERENCES public.worship_members(id) ON DELETE CASCADE;


--
-- Name: schedule_team_members schedule_team_members_schedule_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schedule_team_members
    ADD CONSTRAINT schedule_team_members_schedule_id_fkey FOREIGN KEY (schedule_id) REFERENCES public.general_schedules(id) ON DELETE CASCADE;


--
-- Name: schedule_vocalists schedule_vocalists_member_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schedule_vocalists
    ADD CONSTRAINT schedule_vocalists_member_id_fkey FOREIGN KEY (member_id) REFERENCES public.worship_members(id) ON DELETE CASCADE;


--
-- Name: schedule_vocalists schedule_vocalists_schedule_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schedule_vocalists
    ADD CONSTRAINT schedule_vocalists_schedule_id_fkey FOREIGN KEY (schedule_id) REFERENCES public.worship_schedules(id) ON DELETE CASCADE;


--
-- Name: song_minister_assignments song_minister_assignments_minister_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.song_minister_assignments
    ADD CONSTRAINT song_minister_assignments_minister_id_fkey FOREIGN KEY (minister_id) REFERENCES public.worship_ministers(id) ON DELETE CASCADE;


--
-- Name: song_minister_assignments song_minister_assignments_song_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.song_minister_assignments
    ADD CONSTRAINT song_minister_assignments_song_id_fkey FOREIGN KEY (song_id) REFERENCES public.worship_songs(id) ON DELETE CASCADE;


--
-- Name: user_roles user_roles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: worship_members worship_members_primary_function_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.worship_members
    ADD CONSTRAINT worship_members_primary_function_id_fkey FOREIGN KEY (primary_function_id) REFERENCES public.worship_functions(id);


--
-- Name: worship_schedules worship_schedules_minister_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.worship_schedules
    ADD CONSTRAINT worship_schedules_minister_id_fkey FOREIGN KEY (minister_id) REFERENCES public.worship_ministers(id);


--
-- Name: general_schedules Admins can manage general_schedules; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage general_schedules" ON public.general_schedules USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: inventory_items Admins can manage inventory_items; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage inventory_items" ON public.inventory_items USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: member_functions Admins can manage member_functions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage member_functions" ON public.member_functions USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: ministries Admins can manage ministries; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage ministries" ON public.ministries USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: user_roles Admins can manage roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage roles" ON public.user_roles USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: schedule_members Admins can manage schedule_members; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage schedule_members" ON public.schedule_members USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: schedule_musicians Admins can manage schedule_musicians; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage schedule_musicians" ON public.schedule_musicians USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: schedule_songs Admins can manage schedule_songs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage schedule_songs" ON public.schedule_songs USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: schedule_team_members Admins can manage schedule_team_members; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage schedule_team_members" ON public.schedule_team_members USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: schedule_vocalists Admins can manage schedule_vocalists; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage schedule_vocalists" ON public.schedule_vocalists USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: song_minister_assignments Admins can manage song_minister_assignments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage song_minister_assignments" ON public.song_minister_assignments USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: worship_functions Admins can manage worship_functions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage worship_functions" ON public.worship_functions USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: worship_members Admins can manage worship_members; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage worship_members" ON public.worship_members USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: worship_ministers Admins can manage worship_ministers; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage worship_ministers" ON public.worship_ministers USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: worship_schedules Admins can manage worship_schedules; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage worship_schedules" ON public.worship_schedules USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: worship_songs Admins can manage worship_songs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage worship_songs" ON public.worship_songs USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: user_roles Admins can view all roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all roles" ON public.user_roles FOR SELECT USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: general_schedules Everyone can view general_schedules; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Everyone can view general_schedules" ON public.general_schedules FOR SELECT USING (true);


--
-- Name: inventory_items Everyone can view inventory_items; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Everyone can view inventory_items" ON public.inventory_items FOR SELECT USING (true);


--
-- Name: member_functions Everyone can view member_functions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Everyone can view member_functions" ON public.member_functions FOR SELECT USING (true);


--
-- Name: schedule_members Everyone can view schedule_members; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Everyone can view schedule_members" ON public.schedule_members FOR SELECT USING (true);


--
-- Name: schedule_musicians Everyone can view schedule_musicians; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Everyone can view schedule_musicians" ON public.schedule_musicians FOR SELECT USING (true);


--
-- Name: schedule_songs Everyone can view schedule_songs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Everyone can view schedule_songs" ON public.schedule_songs FOR SELECT USING (true);


--
-- Name: schedule_team_members Everyone can view schedule_team_members; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Everyone can view schedule_team_members" ON public.schedule_team_members FOR SELECT USING (true);


--
-- Name: schedule_vocalists Everyone can view schedule_vocalists; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Everyone can view schedule_vocalists" ON public.schedule_vocalists FOR SELECT USING (true);


--
-- Name: song_minister_assignments Everyone can view song_minister_assignments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Everyone can view song_minister_assignments" ON public.song_minister_assignments FOR SELECT USING (true);


--
-- Name: worship_functions Everyone can view worship_functions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Everyone can view worship_functions" ON public.worship_functions FOR SELECT USING (true);


--
-- Name: worship_members Everyone can view worship_members; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Everyone can view worship_members" ON public.worship_members FOR SELECT USING (true);


--
-- Name: worship_ministers Everyone can view worship_ministers; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Everyone can view worship_ministers" ON public.worship_ministers FOR SELECT USING (true);


--
-- Name: worship_schedules Everyone can view worship_schedules; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Everyone can view worship_schedules" ON public.worship_schedules FOR SELECT USING (true);


--
-- Name: worship_songs Everyone can view worship_songs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Everyone can view worship_songs" ON public.worship_songs FOR SELECT USING (true);


--
-- Name: ministries Ministries are viewable by everyone; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Ministries are viewable by everyone" ON public.ministries FOR SELECT USING (true);


--
-- Name: profiles Public profiles are viewable by everyone; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);


--
-- Name: profiles Users can insert their own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: profiles Users can update their own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: user_roles Users can view their own roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: general_schedules; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.general_schedules ENABLE ROW LEVEL SECURITY;

--
-- Name: inventory_items; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;

--
-- Name: member_functions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.member_functions ENABLE ROW LEVEL SECURITY;

--
-- Name: ministries; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.ministries ENABLE ROW LEVEL SECURITY;

--
-- Name: profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

--
-- Name: schedule_members; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.schedule_members ENABLE ROW LEVEL SECURITY;

--
-- Name: schedule_musicians; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.schedule_musicians ENABLE ROW LEVEL SECURITY;

--
-- Name: schedule_songs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.schedule_songs ENABLE ROW LEVEL SECURITY;

--
-- Name: schedule_team_members; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.schedule_team_members ENABLE ROW LEVEL SECURITY;

--
-- Name: schedule_vocalists; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.schedule_vocalists ENABLE ROW LEVEL SECURITY;

--
-- Name: song_minister_assignments; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.song_minister_assignments ENABLE ROW LEVEL SECURITY;

--
-- Name: user_roles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

--
-- Name: worship_functions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.worship_functions ENABLE ROW LEVEL SECURITY;

--
-- Name: worship_members; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.worship_members ENABLE ROW LEVEL SECURITY;

--
-- Name: worship_ministers; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.worship_ministers ENABLE ROW LEVEL SECURITY;

--
-- Name: worship_schedules; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.worship_schedules ENABLE ROW LEVEL SECURITY;

--
-- Name: worship_songs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.worship_songs ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--




COMMIT;