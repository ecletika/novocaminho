-- Fix admin RLS policies to allow INSERT/UPDATE via WITH CHECK

-- Drop existing policies (without loop)
DROP POLICY IF EXISTS "Admins can manage ministries" ON public.ministries;
DROP POLICY IF EXISTS "Admins can manage all ministry posts" ON public.ministry_posts;
DROP POLICY IF EXISTS "Admins can manage birthdays" ON public.birthdays;
DROP POLICY IF EXISTS "Admins can manage birthday ministries" ON public.birthday_ministries;
DROP POLICY IF EXISTS "Admins can manage inventory_items" ON public.inventory_items;
DROP POLICY IF EXISTS "Admins can manage general_schedules" ON public.general_schedules;
DROP POLICY IF EXISTS "Admins can manage schedule_team_members" ON public.schedule_team_members;
DROP POLICY IF EXISTS "Admins can manage worship_functions" ON public.worship_functions;
DROP POLICY IF EXISTS "Admins can manage worship_members" ON public.worship_members;
DROP POLICY IF EXISTS "Admins can manage member_functions" ON public.member_functions;
DROP POLICY IF EXISTS "Admins can manage worship_songs" ON public.worship_songs;
DROP POLICY IF EXISTS "Admins can manage worship_schedules" ON public.worship_schedules;
DROP POLICY IF EXISTS "Admins can manage schedule_vocalists" ON public.schedule_vocalists;
DROP POLICY IF EXISTS "Admins can manage schedule_musicians" ON public.schedule_musicians;
DROP POLICY IF EXISTS "Admins can manage schedule_songs" ON public.schedule_songs;
DROP POLICY IF EXISTS "Admins can manage worship_ministers" ON public.worship_ministers;
DROP POLICY IF EXISTS "Admins can manage song_minister_assignments" ON public.song_minister_assignments;
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;

-- Recreate admin policies with BOTH USING and WITH CHECK
-- Ministries
CREATE POLICY "Admins can manage ministries" ON public.ministries
FOR ALL
USING (public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

-- Ministry posts
CREATE POLICY "Admins can manage all ministry posts" ON public.ministry_posts
FOR ALL
USING (public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

-- Birthdays
CREATE POLICY "Admins can manage birthdays" ON public.birthdays
FOR ALL
USING (public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

-- Birthday ministries link
CREATE POLICY "Admins can manage birthday ministries" ON public.birthday_ministries
FOR ALL
USING (public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

-- Inventory
CREATE POLICY "Admins can manage inventory_items" ON public.inventory_items
FOR ALL
USING (public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

-- General schedules
CREATE POLICY "Admins can manage general_schedules" ON public.general_schedules
FOR ALL
USING (public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

-- Schedule team members
CREATE POLICY "Admins can manage schedule_team_members" ON public.schedule_team_members
FOR ALL
USING (public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

-- Worship functions
CREATE POLICY "Admins can manage worship_functions" ON public.worship_functions
FOR ALL
USING (public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

-- Worship members
CREATE POLICY "Admins can manage worship_members" ON public.worship_members
FOR ALL
USING (public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

-- Member functions
CREATE POLICY "Admins can manage member_functions" ON public.member_functions
FOR ALL
USING (public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

-- Worship songs
CREATE POLICY "Admins can manage worship_songs" ON public.worship_songs
FOR ALL
USING (public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

-- Worship schedules
CREATE POLICY "Admins can manage worship_schedules" ON public.worship_schedules
FOR ALL
USING (public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

-- Schedule vocalists
CREATE POLICY "Admins can manage schedule_vocalists" ON public.schedule_vocalists
FOR ALL
USING (public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

-- Schedule musicians
CREATE POLICY "Admins can manage schedule_musicians" ON public.schedule_musicians
FOR ALL
USING (public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

-- Schedule songs
CREATE POLICY "Admins can manage schedule_songs" ON public.schedule_songs
FOR ALL
USING (public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

-- Worship ministers
CREATE POLICY "Admins can manage worship_ministers" ON public.worship_ministers
FOR ALL
USING (public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

-- Song-minister assignments
CREATE POLICY "Admins can manage song_minister_assignments" ON public.song_minister_assignments
FOR ALL
USING (public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

-- Roles (admin-only)
CREATE POLICY "Admins can manage roles" ON public.user_roles
FOR ALL
USING (public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));