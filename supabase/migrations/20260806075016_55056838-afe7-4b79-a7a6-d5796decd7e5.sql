-- 1. Revoke public/authenticated execute on the security definer function
-- It is meant to be used only inside RLS policies
REVOKE EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) FROM anon;

-- 2. Add missing policies for attendance_audit (referenced in linter 0008)
CREATE POLICY "Gym Admins see their gym attendance audit" ON public.attendance_audit
FOR SELECT TO authenticated USING (
    EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = auth.uid() 
          AND gym_id = (SELECT gym_id FROM public.attendance WHERE id = public.attendance_audit.attendance_id)
          AND role = 'admin'
    )
);

-- 3. The linter might be flagging user_roles or others if grants were too broad or policies complex.
-- Let's ensure attendance_audit has its RLS enabled with a policy.
-- The previous migration already ran ALTER TABLE ... ENABLE ROW LEVEL SECURITY.
