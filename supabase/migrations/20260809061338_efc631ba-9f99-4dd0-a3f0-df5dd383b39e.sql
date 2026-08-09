
-- 1. Create global_plans if it doesn't exist
CREATE TABLE IF NOT EXISTS public.global_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    price INTEGER NOT NULL, -- in paise
    features JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Add subscription columns to gyms if they don't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='gyms' AND column_name='subscription_plan_id') THEN
        ALTER TABLE public.gyms ADD COLUMN subscription_plan_id UUID REFERENCES public.global_plans(id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='gyms' AND column_name='subscription_started_at') THEN
        ALTER TABLE public.gyms ADD COLUMN subscription_started_at TIMESTAMPTZ;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='gyms' AND column_name='subscription_ends_at') THEN
        ALTER TABLE public.gyms ADD COLUMN subscription_ends_at TIMESTAMPTZ;
    END IF;
END $$;

-- 3. Seed default plan if none exist
INSERT INTO public.global_plans (name, price, features, is_active)
SELECT 'Standard', 199900, '[{"name": "Manage Attendance", "enabled": true}, {"name": "Manage Payments", "enabled": true}]'::jsonb, true
WHERE NOT EXISTS (SELECT 1 FROM public.global_plans WHERE name = 'Standard');

-- 4. RLS and Grants for global_plans
ALTER TABLE public.global_plans ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON public.global_plans TO authenticated;
GRANT ALL ON public.global_plans TO service_role;

-- Policies for global_plans
DROP POLICY IF EXISTS "Anyone can select active global plans" ON public.global_plans;
CREATE POLICY "Anyone can select active global plans" ON public.global_plans
    FOR SELECT TO authenticated USING (is_active = true OR public.has_role(auth.uid(), 'super_admin'));

DROP POLICY IF EXISTS "Super admins can manage global plans" ON public.global_plans;
CREATE POLICY "Super admins can manage global plans" ON public.global_plans
    FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'super_admin'));
