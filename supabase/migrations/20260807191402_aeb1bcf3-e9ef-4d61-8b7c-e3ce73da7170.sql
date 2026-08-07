
DO $$
DECLARE
    v_user_id UUID;
BEGIN
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'surya.17155@gmail.com';
    
    IF v_user_id IS NOT NULL THEN
        INSERT INTO public.user_roles (user_id, role)
        VALUES (v_user_id, 'super_admin')
        ON CONFLICT (user_id, role) DO NOTHING;
    END IF;
END $$;
