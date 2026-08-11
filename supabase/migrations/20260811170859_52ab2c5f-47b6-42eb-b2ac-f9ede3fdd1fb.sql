-- Storage policies for 'members' bucket
-- Drop existing storage policies for 'members' to avoid conflicts
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Upload" ON storage.objects;
DROP POLICY IF EXISTS "Owner Update" ON storage.objects;
DROP POLICY IF EXISTS "Owner Delete" ON storage.objects;

CREATE POLICY "Public Access" ON storage.objects 
  FOR SELECT USING (bucket_id = 'members');

CREATE POLICY "Authenticated Upload" ON storage.objects 
  FOR INSERT WITH CHECK (bucket_id = 'members' AND auth.role() = 'authenticated');

CREATE POLICY "Owner Update" ON storage.objects 
  FOR UPDATE USING (bucket_id = 'members' AND auth.role() = 'authenticated');

CREATE POLICY "Owner Delete" ON storage.objects 
  FOR DELETE USING (bucket_id = 'members' AND auth.role() = 'authenticated');