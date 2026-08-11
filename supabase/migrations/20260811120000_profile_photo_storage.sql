-- 1. Create the 'members' storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('members', 'members', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Drop existing storage policies for 'members' to avoid conflicts
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Upload" ON storage.objects;
DROP POLICY IF EXISTS "Owner Update" ON storage.objects;
DROP POLICY IF EXISTS "Owner Delete" ON storage.objects;

-- 3. Storage policies for 'members' bucket
CREATE POLICY "Public Access" ON storage.objects 
  FOR SELECT USING (bucket_id = 'members');

CREATE POLICY "Authenticated Upload" ON storage.objects 
  FOR INSERT WITH CHECK (bucket_id = 'members' AND auth.role() = 'authenticated');

CREATE POLICY "Owner Update" ON storage.objects 
  FOR UPDATE USING (bucket_id = 'members' AND auth.role() = 'authenticated');

CREATE POLICY "Owner Delete" ON storage.objects 
  FOR DELETE USING (bucket_id = 'members' AND auth.role() = 'authenticated');

-- 4. Ensure public.members has a photo_url column (it already does, but for safety)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'members' AND column_name = 'photo_url') THEN
        ALTER TABLE public.members ADD COLUMN photo_url TEXT;
    END IF;
END $$;
