-- Create africa_content table
CREATE TABLE IF NOT EXISTS public.africa_content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL CHECK (type IN ('history', 'image', 'video')),
    title TEXT NOT NULL,
    description TEXT,
    content TEXT, -- for history
    media_url TEXT, -- for image/video
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.africa_content ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow public read access on africa_content"
    ON public.africa_content FOR SELECT
    TO public
    USING (true);

CREATE POLICY "Allow admin all access on africa_content"
    ON public.africa_content FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_roles.user_id = auth.uid()
            AND user_roles.role IN ('admin', 'owner')
        )
        OR 
        EXISTS (
            SELECT 1 FROM user_permissions
            WHERE user_permissions.user_id = auth.uid()
            AND user_permissions.permission = 'africa'
        )
    );

-- Create trigger for updated_at
CREATE TRIGGER update_africa_content_updated_at
    BEFORE UPDATE ON public.africa_content
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create storage bucket for africa if not exists
INSERT INTO storage.buckets (id, name, public) 
VALUES ('africa', 'africa', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for the africa bucket
CREATE POLICY "Public Access Africa" ON storage.objects FOR SELECT USING (bucket_id = 'africa');
CREATE POLICY "Public Upload Africa" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'africa');
CREATE POLICY "Public Update Africa" ON storage.objects FOR UPDATE WITH CHECK (bucket_id = 'africa');
CREATE POLICY "Public Delete Africa" ON storage.objects FOR DELETE USING (bucket_id = 'africa');
