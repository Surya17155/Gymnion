import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
import { supabase } from '@/integrations/supabase/client';
import { getAuthUserRole } from '@/lib/auth.functions';

export const Route = createFileRoute('/dashboard')({
  beforeLoad: async ({ location }) => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      // Small delay to allow session recovery if it's just a refresh
      await new Promise(resolve => setTimeout(resolve, 10));
      const { data: { session: retrySession } } = await supabase.auth.getSession();
      
      if (!retrySession) {
        throw redirect({
          to: '/auth/login',
          search: {
            redirect: location.href,
          },
        });
      }
    }

    const role = await getAuthUserRole();
    
    // Redirect logic based on role if they are at the base /dashboard path
    if (location.pathname === '/dashboard' || location.pathname === '/dashboard/') {
      if (role === 'super_admin') {
        throw redirect({ to: '/dashboard/super-admin' });
      } else if (role === 'admin') {
        throw redirect({ to: '/dashboard/admin' });
      } else {
        throw redirect({ to: '/dashboard/m' });
      }
    }

    // Protect specific sub-routes
    if (location.pathname.startsWith('/dashboard/super-admin') && role !== 'super_admin') {
       throw redirect({ to: '/dashboard' });
    }
    if (location.pathname.startsWith('/dashboard/admin') && role !== 'admin' && role !== 'super_admin') {
       throw redirect({ to: '/dashboard' });
    }
    
    return { role };
  },
  component: DashboardLayout,
});

function DashboardLayout() {
  return (
    <Outlet />
  );
}

