import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
import { supabase } from '@/integrations/supabase/client';
import { getRoleForUser, homeForRole } from '@/lib/role';

export const Route = createFileRoute('/dashboard')({
  // Session lives in localStorage, so gate on the client only. This removes the
  // SSR round-trip that made the first paint hang on a black screen.
  ssr: false,
  beforeLoad: async ({ location, context }) => {
    // 1. Quick local session check
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw redirect({ to: '/auth/login', search: { redirect: location.href } });
    }

    // Preload next route to speed up navigation
    context.queryClient.prefetchQuery({
      queryKey: ['platform-stats'],
      staleTime: 1000 * 60 * 5
    });

    // 2. Optimized role lookup
    const role = await getRoleForUser(session.user.id);
    const home = homeForRole(role);

    if (!role || !home) {
      throw redirect({ to: '/auth/login', search: { redirect: "" } });
    }

    const path = location.pathname;
    
    // 3. Path validation
    // Restrict specific roles to their dashboard roots
    if (role === 'super_admin' && !path.startsWith('/dashboard/super-admin')) {
      throw redirect({ to: '/dashboard/super-admin' });
    } 

    if (role === 'admin' && !path.startsWith('/dashboard/admin')) {
      throw redirect({ to: '/dashboard/admin' });
    }
    if (role === 'member' && !path.startsWith('/dashboard/m')) {
      throw redirect({ to: '/dashboard/m' });
    }

    if (path === '/dashboard' || path === '/dashboard/') {
      throw redirect({ to: home as any });
    }

    return { role };
  },
  pendingComponent: () => (
    <div className="min-h-screen bg-[#0D0F0C] flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-[#B7FF1E]/20 border-t-[#B7FF1E] rounded-full animate-spin"></div>
    </div>
  ),
  component: DashboardLayout,
  errorComponent: ({ error }) => {
    return (
      <div className="min-h-screen bg-[#0D0F0C] text-white flex flex-col items-center justify-center p-4">
        <h1 className="text-xl font-bold mb-2">Something went wrong</h1>
        <p className="text-gray-400 mb-4">{error?.message || 'Unauthorized or role mismatch'}</p>
        <button
          onClick={() => { window.location.href = '/auth/login'; }}
          className="bg-[#B7FF1E] text-black px-4 py-2 rounded-full font-bold"
        >
          Return to Login
        </button>
      </div>
    );
  }
});

function DashboardLayout() {
  return <Outlet />;
}
