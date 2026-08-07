DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'surya.17155@gmail.com') THEN
        INSERT INTO auth.users (
            instance_id,
            id,
            aud,
            role,
            email,
            encrypted_password,
            email_confirmed_at,
            recovery_sent_at,
            last_sign_in_at,
            raw_app_meta_data,
            raw_user_meta_data,
            created_at,
            updated_at,
            confirmation_token,
            email_change,
            email_change_token_new,
            recovery_token
        )
        VALUES (
            '00000000-0000-0000-0000-000000000000',
            gen_random_uuid(),
            'authenticated',
            'authenticated',
            'surya.17155@gmail.com',
            crypt('Surya@17155', gen_salt('bf')),
            now(),
            now(),
            now(),
            '{"provider":"email","providers":["email"]}',
            '{"full_name":"Super Admin"}',
            now(),
            now(),
            '',
            '',
            '',
            ''
        );
    ELSE
        UPDATE auth.users
        SET encrypted_password = crypt('Surya@17155', gen_salt('bf')),
            updated_at = now()
        WHERE email = 'surya.17155@gmail.com';
    END IF;
END $$;

-- Ensure user has the super_admin role
DO $$
DECLARE
    v_user_id uuid;
BEGIN
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'surya.17155@gmail.com';
    
    IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = v_user_id AND role = 'super_admin') THEN
        INSERT INTO public.user_roles (user_id, role)
        VALUES (v_user_id, 'super_admin');
    END IF;
END $$;
