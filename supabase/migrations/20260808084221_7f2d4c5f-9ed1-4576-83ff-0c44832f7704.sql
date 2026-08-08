DO $$
DECLARE
    target_user_id UUID;
BEGIN
    -- Get the user ID from auth.users
    SELECT id INTO target_user_id FROM auth.users WHERE email = 'surya.17155@gmail.com';

    IF target_user_id IS NOT NULL THEN
        -- Insert or update the role in user_roles
        INSERT INTO public.user_roles (user_id, role)
        VALUES (target_user_id, 'super_admin')
        ON CONFLICT (user_id, role) DO NOTHING;
        
        -- Also update existing 'admin' to 'super_admin' if it exists for this user specifically
        UPDATE public.user_roles 
        SET role = 'super_admin' 
        WHERE user_id = target_user_id AND role = 'admin';
    END IF;
END $$;
