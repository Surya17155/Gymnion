-- Secure storage policies for gym-assets
-- Clean up any old policies to ensure a fresh state
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Upload" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Update" ON storage.objects;
DROP POLICY IF EXISTS "Gym Assets Admin Upload" ON storage.objects;
DROP POLICY IF EXISTS "Gym Assets Admin Update" ON storage.objects;
DROP POLICY IF EXISTS "Gym Assets Admin Delete" ON storage.objects;
DROP POLICY IF EXISTS "Gym Assets Select" ON storage.objects;

-- 1. Allow authenticated users to view gym assets (needed for gym details)
CREATE POLICY "Gym Assets Select" ON storage.objects 
FOR SELECT TO authenticated 
USING (bucket_id = 'gym-assets');

-- 2. Allow admins and super admins to upload gym assets
CREATE POLICY "Gym Assets Admin Upload" ON storage.objects 
FOR INSERT TO authenticated 
WITH CHECK (
  bucket_id = 'gym-assets' AND 
  (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'))
);

-- 3. Allow admins and super admins to update gym assets
CREATE POLICY "Gym Assets Admin Update" ON storage.objects 
FOR UPDATE TO authenticated 
USING (
  bucket_id = 'gym-assets' AND 
  (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'))
);

-- 4. Allow admins and super admins to delete gym assets
CREATE POLICY "Gym Assets Admin Delete" ON storage.objects 
FOR DELETE TO authenticated 
USING (
  bucket_id = 'gym-assets' AND 
  (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'))
);