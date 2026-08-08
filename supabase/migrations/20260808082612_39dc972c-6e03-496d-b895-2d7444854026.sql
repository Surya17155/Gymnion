-- 1. Create global_plans table
CREATE TABLE public.global_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    price INTEGER NOT NULL, -- in paise
    features TEXT[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.global_plans TO authenticated;
GRANT ALL ON public.global_plans TO service_role;

-- 3. Enable RLS
ALTER TABLE public.global_plans ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS policies
CREATE POLICY "Anyone authenticated can view global plans" 
ON public.global_plans FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Super Admins can manage global plans" 
ON public.global_plans FOR ALL 
TO authenticated 
USING (public.has_role(auth.uid(), 'super_admin'));

-- 5. Seed initial plans
INSERT INTO public.global_plans (name, price, features) VALUES
('Standard', 50000, ARRAY['Attendance Tracking', 'Payment Management', 'Member Directory']),
('Unlimited', 99900, ARRAY['All Standard Features', 'AI Diet & Workout Plans', 'Priority Support']);