
-- Add leader_id to birthday_ministries to support hierarchical leadership within ministries
ALTER TABLE public.birthday_ministries ADD COLUMN IF NOT EXISTS leader_id UUID REFERENCES public.birthdays(id);

-- Create storage bucket for photos if not exists
INSERT INTO storage.buckets (id, name, public) 
VALUES ('photos', 'photos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for the photos bucket
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'photos');
CREATE POLICY "Public Upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'photos');
