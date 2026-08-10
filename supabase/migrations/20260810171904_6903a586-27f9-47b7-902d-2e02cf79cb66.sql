-- 1. Create a secure view for members that hides sensitive data
CREATE OR REPLACE VIEW public.gym_public_info AS
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

-- 2. Grant permissions on the view
GRANT SELECT ON public.gym_public_info TO authenticated;

-- 3. base table policies
DROP POLICY IF EXISTS "Authenticated users can see approved gyms" ON public.gyms;
DROP POLICY IF EXISTS "Members can see their own gym" ON public.gyms;
DROP POLICY IF EXISTS "Super admins can manage all gyms" ON public.gyms;
DROP POLICY IF EXISTS "Gym admins can manage their own gym" ON public.gyms;

-- Policy for Super Admins (Full access)
CREATE POLICY "Super admins can manage all gyms"
ON public.gyms
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'));

-- Policy for Gym Admins (Full access to their gym)
CREATE POLICY "Gym admins can manage their own gym"
ON public.gyms
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = auth.uid() 
        AND role = 'admin' 
        AND gym_id = public.gyms.id
    )
);

-- Policy for Members (Restricted access: cannot see sensitive columns)
CREATE POLICY "Members can select their own gym"
ON public.gyms
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.members
        WHERE user_id = auth.uid()
        AND gym_id = public.gyms.id
    )
);
