-- 1. Create gym_admins table
CREATE TABLE IF NOT EXISTS public.gym_admins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gym_id UUID NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(gym_id, user_id)
);

-- 2. Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.gym_admins TO authenticated;
GRANT ALL ON public.gym_admins TO service_role;

-- 3. Enable RLS
ALTER TABLE public.gym_admins ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS policies for gym_admins
-- Super Admin can do everything
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Super admins can manage gym_admins') THEN
        CREATE POLICY "Super admins can manage gym_admins"
            ON public.gym_admins
            FOR ALL
            TO authenticated
            USING (public.has_role(auth.uid(), 'super_admin'));
    END IF;
END $$;

-- Gym Admins can see other admins for their own gym
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Gym admins can see their gym''s admins') THEN
        CREATE POLICY "Gym admins can see their gym's admins"
            ON public.gym_admins
            FOR SELECT
            TO authenticated
            USING (
                EXISTS (
                    SELECT 1 FROM public.user_roles 
                    WHERE user_id = auth.uid() 
                    AND role = 'gym_admin' 
                    AND gym_id = public.gym_admins.gym_id
                )
            );
    END IF;
END $$;

-- 5. Ensure trigger function exists and attach trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column() RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

DROP TRIGGER IF EXISTS update_gym_admins_updated_at ON public.gym_admins;
CREATE TRIGGER update_gym_admins_updated_at 
    BEFORE UPDATE ON public.gym_admins 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
