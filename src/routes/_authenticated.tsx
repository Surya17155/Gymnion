import { createFileRoute, redirect } from '@tanstack/react-router';
import { supabase } from '@/integrations/supabase/client';

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: async ({ location }) => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      throw redirect({
        to: '/auth/login',
        search: {
          redirect: location.href,
        },
      });
    }
    
    // Check role and gym membership
    const { data: roles } = await supabase
      .from('user_roles')
      .select('role, gym_id')
      .eq('user_id', session.user.id);
    
    return {
      session,
      userRoles: roles || [],
    };
  },
});
