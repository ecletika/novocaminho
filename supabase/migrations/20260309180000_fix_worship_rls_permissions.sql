
-- Fix RLS policies for worship tables to allow users with 'louvor' permission to manage them
-- This is necessary because some users are admins in the UI (special emails) but not in the database user_roles table

-- Function to check if a user has a specific permission in user_permissions table
CREATE OR REPLACE FUNCTION public.has_permission(_user_id uuid, _permission text) 
RETURNS boolean 
LANGUAGE sql 
STABLE 
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_permissions
    WHERE user_id = _user_id
      AND permission = _permission
  )
$$;

-- Worship members policies
DROP POLICY IF EXISTS "Anyone with louvor permission can manage worship_members" ON public.worship_members;
CREATE POLICY "Anyone with louvor permission can manage worship_members" ON public.worship_members
FOR ALL
USING (
  public.has_role(auth.uid(), 'admin'::public.app_role) OR 
  public.has_permission(auth.uid(), 'louvor')
)
WITH CHECK (
  public.has_role(auth.uid(), 'admin'::public.app_role) OR 
  public.has_permission(auth.uid(), 'louvor')
);

-- Worship functions policies
DROP POLICY IF EXISTS "Anyone with louvor permission can manage worship_functions" ON public.worship_functions;
CREATE POLICY "Anyone with louvor permission can manage worship_functions" ON public.worship_functions
FOR ALL
USING (
  public.has_role(auth.uid(), 'admin'::public.app_role) OR 
  public.has_permission(auth.uid(), 'louvor')
)
WITH CHECK (
  public.has_role(auth.uid(), 'admin'::public.app_role) OR 
  public.has_permission(auth.uid(), 'louvor')
);

-- Member functions policies
DROP POLICY IF EXISTS "Anyone with louvor permission can manage member_functions" ON public.member_functions;
CREATE POLICY "Anyone with louvor permission can manage member_functions" ON public.member_functions
FOR ALL
USING (
  public.has_role(auth.uid(), 'admin'::public.app_role) OR 
  public.has_permission(auth.uid(), 'louvor')
)
WITH CHECK (
  public.has_role(auth.uid(), 'admin'::public.app_role) OR 
  public.has_permission(auth.uid(), 'louvor')
);

-- Worship songs policies
DROP POLICY IF EXISTS "Anyone with louvor permission can manage worship_songs" ON public.worship_songs;
CREATE POLICY "Anyone with louvor permission can manage worship_songs" ON public.worship_songs
FOR ALL
USING (
  public.has_role(auth.uid(), 'admin'::public.app_role) OR 
  public.has_permission(auth.uid(), 'louvor')
)
WITH CHECK (
  public.has_role(auth.uid(), 'admin'::public.app_role) OR 
  public.has_permission(auth.uid(), 'louvor')
);

-- Worship ministers policies
DROP POLICY IF EXISTS "Anyone with louvor permission can manage worship_ministers" ON public.worship_ministers;
CREATE POLICY "Anyone with louvor permission can manage worship_ministers" ON public.worship_ministers
FOR ALL
USING (
  public.has_role(auth.uid(), 'admin'::public.app_role) OR 
  public.has_permission(auth.uid(), 'louvor')
)
WITH CHECK (
  public.has_role(auth.uid(), 'admin'::public.app_role) OR 
  public.has_permission(auth.uid(), 'louvor')
);

-- Song-minister assignments policies
DROP POLICY IF EXISTS "Anyone with louvor permission can manage song_minister_assignments" ON public.song_minister_assignments;
CREATE POLICY "Anyone with louvor permission can manage song_minister_assignments" ON public.song_minister_assignments
FOR ALL
USING (
  public.has_role(auth.uid(), 'admin'::public.app_role) OR 
  public.has_permission(auth.uid(), 'louvor')
)
WITH CHECK (
  public.has_role(auth.uid(), 'admin'::public.app_role) OR 
  public.has_permission(auth.uid(), 'louvor')
);

-- Worship schedules policies
DROP POLICY IF EXISTS "Anyone with louvor permission can manage worship_schedules" ON public.worship_schedules;
CREATE POLICY "Anyone with louvor permission can manage worship_schedules" ON public.worship_schedules
FOR ALL
USING (
  public.has_role(auth.uid(), 'admin'::public.app_role) OR 
  public.has_permission(auth.uid(), 'louvor')
)
WITH CHECK (
  public.has_role(auth.uid(), 'admin'::public.app_role) OR 
  public.has_permission(auth.uid(), 'louvor')
);

-- Schedule vocalists
DROP POLICY IF EXISTS "Anyone with louvor permission can manage schedule_vocalists" ON public.schedule_vocalists;
CREATE POLICY "Anyone with louvor permission can manage schedule_vocalists" ON public.schedule_vocalists
FOR ALL
USING (
  public.has_role(auth.uid(), 'admin'::public.app_role) OR 
  public.has_permission(auth.uid(), 'louvor')
)
WITH CHECK (
  public.has_role(auth.uid(), 'admin'::public.app_role) OR 
  public.has_permission(auth.uid(), 'louvor')
);

-- Schedule musicians
DROP POLICY IF EXISTS "Anyone with louvor permission can manage schedule_musicians" ON public.schedule_musicians;
CREATE POLICY "Anyone with louvor permission can manage schedule_musicians" ON public.schedule_musicians
FOR ALL
USING (
  public.has_role(auth.uid(), 'admin'::public.app_role) OR 
  public.has_permission(auth.uid(), 'louvor')
)
WITH CHECK (
  public.has_role(auth.uid(), 'admin'::public.app_role) OR 
  public.has_permission(auth.uid(), 'louvor')
);

-- Reload schema
NOTIFY pgrst, 'reload schema';
