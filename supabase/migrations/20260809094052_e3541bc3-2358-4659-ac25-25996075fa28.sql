-- 1. DROP EXISTING POLICIES TO AVOID DUPLICATES
DROP POLICY IF EXISTS "Gym Admins manage their own members" ON public.members;
DROP POLICY IF EXISTS "Members can see their own profile" ON public.members;
DROP POLICY IF EXISTS "Gym Admins can see their own gym" ON public.gyms;
DROP POLICY IF EXISTS "Super Admins can see all gyms" ON public.gyms;
DROP POLICY IF EXISTS "Members can see their own gym metadata" ON public.gyms;

-- 2. UPDATE MEMBERS POLICIES
-- Member can SELECT/UPDATE own row
CREATE POLICY "Members can select own row" ON public.members
FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Members can update own row" ON public.members
FOR UPDATE TO authenticated USING (user_id = auth.uid());

-- Admin can SELECT all rows for their gym
CREATE POLICY "Admins can select gym members" ON public.members
FOR SELECT TO authenticated USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin' AND gym_id = public.members.gym_id
  )
);

-- Admin can INSERT/UPDATE/DELETE gym members
CREATE POLICY "Admins can manage gym members" ON public.members
FOR ALL TO authenticated USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin' AND gym_id = public.members.gym_id
  )
);

-- Super admin should have NO direct access to members (privacy rule)
-- This is implicit as long as we don't grant it.

-- 3. UPDATE GYMS POLICIES
-- Anyone authenticated can SELECT gyms WHERE status='approved' (so members can look up their gym by code)
CREATE POLICY "Authenticated users can see approved gyms" ON public.gyms
FOR SELECT TO authenticated USING (status = 'approved');

-- Gym admin can UPDATE only their own gym row
CREATE POLICY "Admins can update own gym" ON public.gyms
FOR UPDATE TO authenticated USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin' AND gym_id = public.gyms.id
  )
);

-- Super admin has full access
CREATE POLICY "Super admins have full gym access" ON public.gyms
FOR ALL TO authenticated USING (
  public.has_role(auth.uid(), 'super_admin')
);

-- 4. DATABASE TRIGGER FOR AUTO-CREATION
-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  gym_id_val UUID;
  full_name_val TEXT;
  gym_code_val TEXT;
BEGIN
  -- Extract gym_id and full_name from raw_user_meta_data
  gym_id_val := (new.raw_user_meta_data ->> 'gym_id')::UUID;
  full_name_val := new.raw_user_meta_data ->> 'full_name';
  gym_code_val := new.raw_user_meta_data ->> 'gym_code';

  -- If gym_id exists in metadata, auto-create role and member record
  IF gym_id_val IS NOT NULL THEN
    -- 1. Insert into user_roles
    INSERT INTO public.user_roles (user_id, role, gym_id)
    VALUES (new.id, 'member', gym_id_val)
    ON CONFLICT (user_id, role) DO NOTHING;

    -- 2. Insert into members
    INSERT INTO public.members (user_id, gym_id, full_name, email, phone, status, join_date)
    VALUES (
      new.id, 
      gym_id_val, 
      COALESCE(full_name_val, 'New Member'), 
      new.email, 
      COALESCE(new.raw_user_meta_data ->> 'phone', ''),
      'active',
      CURRENT_DATE
    )
    ON CONFLICT (gym_id, email) DO NOTHING;
  END IF;

  RETURN new;
END;
$$;

-- Trigger on auth.users INSERT
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Ensure grants are correct
GRANT SELECT, INSERT, UPDATE, DELETE ON public.members TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_roles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.gyms TO authenticated;
