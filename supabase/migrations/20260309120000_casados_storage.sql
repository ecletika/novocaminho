
-- Create storage bucket for casados material if not exists
INSERT INTO storage.buckets (id, name, public) 
VALUES ('casados-material', 'casados-material', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for the casados-material bucket
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE policyname = 'Public Access Casados'
    ) THEN
        CREATE POLICY "Public Access Casados" ON storage.objects FOR SELECT USING (bucket_id = 'casados-material');
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE policyname = 'Admins can upload casados material'
    ) THEN
        CREATE POLICY "Admins can upload casados material" ON storage.objects FOR INSERT 
        WITH CHECK (
            bucket_id = 'casados-material' 
            AND EXISTS (
                SELECT 1 FROM public.user_roles 
                WHERE user_id = auth.uid() 
                AND role = 'admin'
            )
        );
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE policyname = 'Admins can update casados material'
    ) THEN
        CREATE POLICY "Admins can update casados material" ON storage.objects FOR UPDATE 
        USING (
            bucket_id = 'casados-material' 
            AND EXISTS (
                SELECT 1 FROM public.user_roles 
                WHERE user_id = auth.uid() 
                AND role = 'admin'
            )
        );
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE policyname = 'Admins can delete casados material'
    ) THEN
        CREATE POLICY "Admins can delete casados material" ON storage.objects FOR DELETE 
        USING (
            bucket_id = 'casados-material' 
            AND EXISTS (
                SELECT 1 FROM public.user_roles 
                WHERE user_id = auth.uid() 
                AND role = 'admin'
            )
        );
    END IF;
END $$;
