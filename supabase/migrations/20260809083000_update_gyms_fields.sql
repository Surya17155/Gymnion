-- Add address and owner_photo_url to gyms
ALTER TABLE public.gyms ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE public.gyms ADD COLUMN IF NOT EXISTS owner_photo_url TEXT;

-- Ensure gym_code is not null for existing gyms if any (though unlikely to be many)
-- UPDATE public.gyms SET gym_code = substring(gen_random_uuid()::text from 1 for 6) WHERE gym_code IS NULL;

-- Fix any incorrect roles (if gym_admin was used instead of admin)
UPDATE public.user_roles SET role = 'admin' WHERE role::text = 'gym_admin';
