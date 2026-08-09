CREATE TABLE IF NOT EXISTS public.gym_access_points (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gym_id UUID REFERENCES public.gyms(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    icon TEXT DEFAULT 'door_front',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.gym_access_points TO authenticated;
GRANT ALL ON public.gym_access_points TO service_role;

ALTER TABLE public.gym_access_points ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage their gym's access points"
ON public.gym_access_points
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND gym_id = gym_access_points.gym_id
    AND role = 'admin'
  )
);
