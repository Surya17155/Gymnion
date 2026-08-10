-- 1. gyms: remove full-row anonymous exposure
DROP POLICY IF EXISTS "Public can check gym code existence" ON public.gyms;
REVOKE SELECT ON public.gyms FROM anon;

-- 2. global_plans: remove redundant/overlapping policies
DROP POLICY IF EXISTS "Anyone authenticated can view global plans" ON public.global_plans;
DROP POLICY IF EXISTS "Super Admins can manage global plans" ON public.global_plans;

-- 3. attendance_audit: explicitly deny end-user writes (service role bypasses RLS)
DROP POLICY IF EXISTS "No one can insert attendance audit" ON public.attendance_audit;
DROP POLICY IF EXISTS "No one can update attendance audit" ON public.attendance_audit;
DROP POLICY IF EXISTS "No one can delete attendance audit" ON public.attendance_audit;

CREATE POLICY "No one can insert attendance audit"
  ON public.attendance_audit FOR INSERT TO authenticated, anon
  WITH CHECK (false);

CREATE POLICY "No one can update attendance audit"
  ON public.attendance_audit FOR UPDATE TO authenticated, anon
  USING (false) WITH CHECK (false);

CREATE POLICY "No one can delete attendance audit"
  ON public.attendance_audit FOR DELETE TO authenticated, anon
  USING (false);

REVOKE INSERT, UPDATE, DELETE ON public.attendance_audit FROM authenticated, anon;
GRANT ALL ON public.attendance_audit TO service_role;