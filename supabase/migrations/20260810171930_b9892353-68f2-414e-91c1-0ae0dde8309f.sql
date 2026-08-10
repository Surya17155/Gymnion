-- The previous view was created as SECURITY INVOKER by default (which is what we want), 
-- but Supabase linter might be flagging it if it thinks it's definer or if it's missing security attributes.
-- Actually, Postgres 15+ supports SECURITY INVOKER views explicitly.

-- Re-create the view explicitly as SECURITY INVOKER (the default, but let's be explicit if supported)
CREATE OR REPLACE VIEW public.gym_public_info 
WITH (security_invoker = true)
AS
SELECT 
    id, 
    name, 
    address, 
    owner_name, 
    owner_email, 
    owner_phone, 
    owner_photo_url, 
    gym_code, 
    status, 
    created_at,
    subscription_plan_id,
    subscription_ends_at
FROM public.gyms;

-- Ensure grants are correct
GRANT SELECT ON public.gym_public_info TO authenticated;
GRANT ALL ON public.gym_public_info TO service_role;
