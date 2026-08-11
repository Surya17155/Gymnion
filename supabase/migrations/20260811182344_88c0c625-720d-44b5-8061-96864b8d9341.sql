-- DROP policies from previous attempt if they exist
DROP POLICY IF EXISTS "Secure Member Select" ON storage.objects;
DROP POLICY IF EXISTS "Secure Member Upload" ON storage.objects;
DROP POLICY IF EXISTS "Secure Member Update" ON storage.objects;
DROP POLICY IF EXISTS "Secure Member Delete" ON storage.objects;

-- Also drop the original insecure ones again just to be safe
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Upload" ON storage.objects;
DROP POLICY IF EXISTS "Owner Update" ON storage.objects;
DROP POLICY IF EXISTS "Owner Delete" ON storage.objects;

-- 1. Restrict SELECT access
-- Allow the owner (based on path naming convention 'profile-pics/{user_id}-{timestamp}.ext')
-- or any admin/super_admin.
CREATE POLICY "Secure Member Select" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'members' 
    AND (
      (name LIKE 'profile-pics/' || auth.uid()::text || '-%')
      OR
      EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = auth.uid() 
        AND role IN ('admin', 'super_admin')
      )
    )
  );

-- 2. Restrict INSERT (Upload)
-- Only allow authenticated users to upload to their own path
CREATE POLICY "Secure Member Upload" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'members' 
    AND (name LIKE 'profile-pics/' || auth.uid()::text || '-%')
  );

-- 3. Restrict UPDATE
-- Only allow owners to update their own files
CREATE POLICY "Secure Member Update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'members' 
    AND (name LIKE 'profile-pics/' || auth.uid()::text || '-%')
  );

-- 4. Restrict DELETE
-- Only allow owners to delete their own files
CREATE POLICY "Secure Member Delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'members' 
    AND (name LIKE 'profile-pics/' || auth.uid()::text || '-%')
  );
