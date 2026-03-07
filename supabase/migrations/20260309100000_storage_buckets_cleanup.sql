-- Create storage bucket for inventory if not exists
INSERT INTO storage.buckets (id, name, public) 
VALUES ('inventory-items', 'inventory-items', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for the inventory-items bucket
CREATE POLICY "Public Access Inventory" ON storage.objects FOR SELECT USING (bucket_id = 'inventory-items');
CREATE POLICY "Public Upload Inventory" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'inventory-items');
CREATE POLICY "Public Update Inventory" ON storage.objects FOR UPDATE WITH CHECK (bucket_id = 'inventory-items');
CREATE POLICY "Public Delete Inventory" ON storage.objects FOR DELETE USING (bucket_id = 'inventory-items');

-- Create other buckets used in the app if they don't exist
INSERT INTO storage.buckets (id, name, public) VALUES ('community', 'community', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('books', 'books', true) ON CONFLICT (id) DO NOTHING;

-- Policies for community bucket
CREATE POLICY "Public Access Community" ON storage.objects FOR SELECT USING (bucket_id = 'community');
CREATE POLICY "Public Upload Community" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'community');

-- Policies for books bucket
CREATE POLICY "Public Access Books" ON storage.objects FOR SELECT USING (bucket_id = 'books');
CREATE POLICY "Public Upload Books" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'books');
