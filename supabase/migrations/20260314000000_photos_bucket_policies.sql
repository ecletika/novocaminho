-- Ensure photos bucket exists and is public
INSERT INTO storage.buckets (id, name, public)
VALUES ('photos', 'photos', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Drop existing policies if any (to avoid conflicts)
DROP POLICY IF EXISTS "Public read photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated upload photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated update photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated delete photos" ON storage.objects;

-- Allow anyone to read/view photos
CREATE POLICY "Public read photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'photos');

-- Allow authenticated users to upload photos
CREATE POLICY "Authenticated upload photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'photos');

-- Allow authenticated users to update photos
CREATE POLICY "Authenticated update photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'photos');

-- Allow authenticated users to delete photos
CREATE POLICY "Authenticated delete photos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'photos');
