-- Update existing roles in user_roles table
UPDATE public.user_roles SET role = 'gym_admin' WHERE role = 'admin';

-- Drop existing policies that use 'admin' and recreate them with 'gym_admin'
DROP POLICY IF EXISTS "Gym Admins can see their own gym" ON public.gyms;
CREATE POLICY "Gym Admins can see their own gym" ON public.gyms
FOR SELECT TO authenticated USING (
    EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = auth.uid() AND gym_id = public.gyms.id AND role = 'gym_admin'
    )
);

DROP POLICY IF EXISTS "Gym Admins manage their own plans" ON public.fee_plans;
CREATE POLICY "Gym Admins manage their own plans" ON public.fee_plans
FOR ALL TO authenticated USING (
    EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = auth.uid() AND gym_id = public.fee_plans.gym_id AND role = 'gym_admin'
    )
);

DROP POLICY IF EXISTS "Gym Admins manage their own members" ON public.members;
CREATE POLICY "Gym Admins manage their own members" ON public.members
FOR ALL TO authenticated USING (
    EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = auth.uid() AND gym_id = public.members.gym_id AND role = 'gym_admin'
    )
);

DROP POLICY IF EXISTS "Gym Admins see their gym attendance" ON public.attendance;
CREATE POLICY "Gym Admins see their gym attendance" ON public.attendance
FOR ALL TO authenticated USING (
    EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = auth.uid() AND gym_id = public.attendance.gym_id AND role = 'gym_admin'
    )
);

DROP POLICY IF EXISTS "Gym Admins see their gym payments" ON public.payments;
CREATE POLICY "Gym Admins see their gym payments" ON public.payments
FOR ALL TO authenticated USING (
    EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = auth.uid() AND gym_id = public.payments.gym_id AND role = 'gym_admin'
    )
);
