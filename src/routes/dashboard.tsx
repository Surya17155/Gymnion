import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
import { supabase } from '@/integrations/supabase/client';
import { getAuthUserRole } from '@/lib/auth.functions';

export const Route = createFileRoute('/dashboard')({
  beforeLoad: async ({ location }) => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      // Very short delay for session recovery
      await new Promise(resolve => setTimeout(resolve, 5));
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
      } else if (role === 'gym_admin') {
        throw redirect({ to: '/dashboard/admin' });
      } else if (role === 'member') {
        throw redirect({ to: '/dashboard/m' });
      }
    }

    // Protect specific sub-routes
    if (location.pathname.startsWith('/dashboard/super-admin') && role !== 'super_admin') {
       throw redirect({ to: '/dashboard' });
    }
    if (location.pathname.startsWith('/dashboard/admin') && role !== 'gym_admin' && role !== 'super_admin') {
       throw redirect({ to: '/dashboard' });
    }
    if (location.pathname.startsWith('/dashboard/m') && role !== 'member' && role !== 'super_admin' && role !== 'gym_admin') {
       throw redirect({ to: '/dashboard' });
    }
    
    return { role };
  },
  pendingComponent: () => (
    <div className="min-h-screen bg-[#0D0F0C] flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-[#B7FF1E]/20 border-t-[#B7FF1E] rounded-full animate-spin"></div>
    </div>
  ),
  component: DashboardLayout,
});

function DashboardLayout() {
  return (
    <Outlet />
  );
}

