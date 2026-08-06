-- 1. Create App Role Enum
CREATE TYPE public.app_role AS ENUM ('admin', 'member', 'super_admin');

-- 2. Gyms Table
CREATE TABLE public.gyms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    owner_name TEXT NOT NULL,
    owner_email TEXT NOT NULL UNIQUE,
    owner_phone TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending', -- pending, active, suspended
    razorpay_account_id TEXT,
    settings JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. User Roles Table (Standard Lovable pattern)
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role public.app_role NOT NULL,
    gym_id UUID REFERENCES public.gyms(id) ON DELETE CASCADE, -- Super Admins might not have a gym_id
    UNIQUE (user_id, role)
);

-- 4. Fee Plans Table
CREATE TABLE public.fee_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gym_id UUID REFERENCES public.gyms(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    amount INTEGER NOT NULL, -- in paise
    description TEXT,
    billing_cycle TEXT NOT NULL DEFAULT 'monthly',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Members Table
CREATE TABLE public.members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gym_id UUID REFERENCES public.gyms(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Null until they accept invite
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    photo_url TEXT,
    fee_plan_id UUID REFERENCES public.fee_plans(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'invited', -- invited, active, inactive
    join_date DATE DEFAULT CURRENT_DATE,
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(gym_id, email),
    UNIQUE(gym_id, phone)
);

-- 6. Attendance Table
CREATE TABLE public.attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gym_id UUID REFERENCES public.gyms(id) ON DELETE CASCADE NOT NULL,
    member_id UUID REFERENCES public.members(id) ON DELETE CASCADE NOT NULL,
    check_in_at TIMESTAMPTZ DEFAULT now(),
    check_out_at TIMESTAMPTZ,
    source TEXT DEFAULT 'qr', -- qr, manual
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. Attendance Audit Table
CREATE TABLE public.attendance_audit (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    attendance_id UUID REFERENCES public.attendance(id) ON DELETE CASCADE NOT NULL,
    changed_by UUID REFERENCES auth.users(id),
    old_data JSONB,
    new_data JSONB,
    reason TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 8. Payments Table
CREATE TABLE public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gym_id UUID REFERENCES public.gyms(id) ON DELETE CASCADE NOT NULL,
    member_id UUID REFERENCES public.members(id) ON DELETE CASCADE NOT NULL,
    amount INTEGER NOT NULL, -- in paise
    status TEXT NOT NULL, -- pending, paid, failed, refunded
    payment_month DATE NOT NULL, -- First day of the month for which fee is paid
    source TEXT NOT NULL, -- razorpay, manual
    payment_method TEXT, -- upi, card, cash, etc.
    razorpay_order_id TEXT,
    razorpay_payment_id TEXT,
    razorpay_signature TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 9. GRANTS
GRANT SELECT, INSERT, UPDATE, DELETE ON public.gyms TO authenticated;
GRANT ALL ON public.gyms TO service_role;

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.fee_plans TO authenticated;
GRANT ALL ON public.fee_plans TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.members TO authenticated;
GRANT ALL ON public.members TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.attendance TO authenticated;
GRANT ALL ON public.attendance TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.attendance_audit TO authenticated;
GRANT ALL ON public.attendance_audit TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.payments TO authenticated;
GRANT ALL ON public.payments TO service_role;

-- 10. Enable RLS
ALTER TABLE public.gyms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fee_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_audit ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- 11. Security Definer Function: has_role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- 12. Policies

-- user_roles policies
CREATE POLICY "Users can read own role" ON public.user_roles
FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Super Admins can read all roles" ON public.user_roles
FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'super_admin'));

-- gyms policies
CREATE POLICY "Gym Admins can see their own gym" ON public.gyms
FOR SELECT TO authenticated USING (
    EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = auth.uid() AND gym_id = public.gyms.id AND role = 'admin'
    )
);

CREATE POLICY "Super Admins can see all gyms" ON public.gyms
FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Members can see their own gym metadata" ON public.gyms
FOR SELECT TO authenticated USING (
    EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = auth.uid() AND gym_id = public.gyms.id AND role = 'member'
    )
);

-- fee_plans policies
CREATE POLICY "Gym Admins manage their own plans" ON public.fee_plans
FOR ALL TO authenticated USING (
    EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = auth.uid() AND gym_id = public.fee_plans.gym_id AND role = 'admin'
    )
);

CREATE POLICY "Members can see their gym's plans" ON public.fee_plans
FOR SELECT TO authenticated USING (
    EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = auth.uid() AND gym_id = public.fee_plans.gym_id AND role = 'member'
    )
);

-- members policies
CREATE POLICY "Gym Admins manage their own members" ON public.members
FOR ALL TO authenticated USING (
    EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = auth.uid() AND gym_id = public.members.gym_id AND role = 'admin'
    )
);

CREATE POLICY "Members can see their own profile" ON public.members
FOR SELECT TO authenticated USING (user_id = auth.uid());

-- attendance policies
CREATE POLICY "Gym Admins see their gym attendance" ON public.attendance
FOR ALL TO authenticated USING (
    EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = auth.uid() AND gym_id = public.attendance.gym_id AND role = 'admin'
    )
);

CREATE POLICY "Members see their own attendance" ON public.attendance
FOR SELECT TO authenticated USING (
    EXISTS (
        SELECT 1 FROM public.members
        WHERE user_id = auth.uid() AND id = public.attendance.member_id
    )
);

-- payments policies
CREATE POLICY "Gym Admins see their gym payments" ON public.payments
FOR ALL TO authenticated USING (
    EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = auth.uid() AND gym_id = public.payments.gym_id AND role = 'admin'
    )
);

CREATE POLICY "Members see their own payments" ON public.payments
FOR SELECT TO authenticated USING (
    EXISTS (
        SELECT 1 FROM public.members
        WHERE user_id = auth.uid() AND id = public.payments.member_id
    )
);