-- Add address and owner_photo_url to gyms
ALTER TABLE public.gyms ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE public.gyms ADD COLUMN IF NOT EXISTS owner_photo_url TEXT;

-- Ensure gym_code is not null for existing gyms if any (though unlikely to be many)
-- UPDATE public.gyms SET gym_code = substring(gen_random_uuid()::text from 1 for 6) WHERE gym_code IS NULL;

-- Fix any incorrect roles (if gym_admin was used instead of admin)
UPDATE public.user_roles SET role = 'admin' WHERE role::text = 'gym_admin';

-- Storage setup for gym assets
INSERT INTO storage.buckets (id, name, public) 
VALUES ('gym-assets', 'gym-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'gym-assets');
CREATE POLICY "Authenticated Upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'gym-assets' AND auth.role() = 'authenticated');
CREATE POLICY "Authenticated Update" ON storage.objects FOR UPDATE USING (bucket_id = 'gym-assets' AND auth.role() = 'authenticated');
