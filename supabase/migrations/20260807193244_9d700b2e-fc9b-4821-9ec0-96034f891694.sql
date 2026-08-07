ALTER TABLE public.gyms ADD COLUMN IF NOT EXISTS gym_code TEXT UNIQUE;
GRANT SELECT (id, gym_code) ON public.gyms TO anon;
GRANT SELECT (id, gym_code) ON public.gyms TO authenticated;
CREATE POLICY "Public can check gym code existence" ON public.gyms FOR SELECT TO anon, authenticated USING (true);
