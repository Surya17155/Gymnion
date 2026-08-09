-- 1. Grant Update on gyms to Super Admin
CREATE POLICY "Super Admins can update gyms" 
ON public.gyms 
FOR UPDATE 
TO authenticated 
USING (public.has_role(auth.uid(), 'super_admin'))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

-- 2. Ensure Grant exists
GRANT UPDATE ON public.gyms TO authenticated;
