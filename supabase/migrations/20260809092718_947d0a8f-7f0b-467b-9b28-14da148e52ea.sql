ALTER TABLE public.gyms ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE public.gyms ADD COLUMN IF NOT EXISTS owner_photo_url TEXT;
ALTER TABLE public.gyms ADD COLUMN IF NOT EXISTS gym_code TEXT;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.gyms TO authenticated;
GRANT ALL ON public.gyms TO service_role;
