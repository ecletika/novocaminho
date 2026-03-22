-- Update check constraint to include 'pastor'
ALTER TABLE public.africa_content DROP CONSTRAINT IF EXISTS africa_content_type_check;
ALTER TABLE public.africa_content ADD CONSTRAINT africa_content_type_check CHECK (type IN ('history', 'image', 'video', 'pastor'));
