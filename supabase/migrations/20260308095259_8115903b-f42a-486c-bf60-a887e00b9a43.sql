-- Add photo_url column to birthdays table
ALTER TABLE public.birthdays ADD COLUMN IF NOT EXISTS photo_url text;

-- Create photos storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('photos', 'photos', true)
ON CONFLICT (id) DO NOTHING;

-- Allow anyone to upload to photos bucket
CREATE POLICY "Anyone can upload photos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'photos');

-- Allow anyone to view photos
CREATE POLICY "Anyone can view photos" ON storage.objects FOR SELECT USING (bucket_id = 'photos');

NOTIFY pgrst, 'reload schema';