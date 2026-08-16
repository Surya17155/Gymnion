-- Add subscription fields to gyms if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'gyms' AND column_name = 'trial_used') THEN
        ALTER TABLE public.gyms ADD COLUMN trial_used BOOLEAN DEFAULT FALSE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'gyms' AND column_name = 'plan_tier') THEN
        ALTER TABLE public.gyms ADD COLUMN plan_tier TEXT; -- 'basic', 'standard', etc.
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'gyms' AND column_name = 'phone') THEN
        ALTER TABLE public.gyms ADD COLUMN phone TEXT;
    END IF;
END $$;

-- Ensure has_role function is correct and accessible
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO service_role;

-- Grant select on gyms to authenticated for role checks
GRANT SELECT ON public.gyms TO authenticated;
