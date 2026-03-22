-- Fix RLS policies for africa_content table
DROP POLICY IF EXISTS "Allow admin all access on africa_content" ON public.africa_content;
CREATE POLICY "Allow admin all access on africa_content"
    ON public.africa_content FOR ALL
    TO authenticated
    USING (
        public.has_role(auth.uid(), 'admin'::public.app_role)
        OR 
        public.has_permission(auth.uid(), 'africa')
    )
    WITH CHECK (
        public.has_role(auth.uid(), 'admin'::public.app_role)
        OR 
        public.has_permission(auth.uid(), 'africa')
    );

-- Fix Storage policies for the africa bucket
DROP POLICY IF EXISTS "Public Access Africa" ON storage.objects;
DROP POLICY IF EXISTS "Public Upload Africa" ON storage.objects;
DROP POLICY IF EXISTS "Public Update Africa" ON storage.objects;
DROP POLICY IF EXISTS "Public Delete Africa" ON storage.objects;
DROP POLICY IF EXISTS "Public Read Africa" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload Africa media" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update Africa media" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete Africa media" ON storage.objects;

CREATE POLICY "Public Read Africa" ON storage.objects FOR SELECT TO public USING (bucket_id = 'africa');
CREATE POLICY "Admins can upload Africa media" ON storage.objects FOR INSERT TO authenticated WITH CHECK (
    bucket_id = 'africa' AND (
        public.has_role(auth.uid(), 'admin'::public.app_role) OR 
        public.has_permission(auth.uid(), 'africa')
    )
);
CREATE POLICY "Admins can update Africa media" ON storage.objects FOR UPDATE TO authenticated USING (
    bucket_id = 'africa' AND (
        public.has_role(auth.uid(), 'admin'::public.app_role) OR 
        public.has_permission(auth.uid(), 'africa')
    )
);
CREATE POLICY "Admins can delete Africa media" ON storage.objects FOR DELETE TO authenticated USING (
    bucket_id = 'africa' AND (
        public.has_role(auth.uid(), 'admin'::public.app_role) OR 
        public.has_permission(auth.uid(), 'africa')
    )
);
