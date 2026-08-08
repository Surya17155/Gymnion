import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
import { supabase } from '@/integrations/supabase/client';

type Role = 'super_admin' | 'gym_admin' | 'member' | null;

const roleHome: Record<string, string> = {
  super_admin: '/dashboard/super-admin',
  gym_admin: '/dashboard/admin',
  member: '/dashboard/m',
};

// In-memory cache so navigating between tabs never re-hits the network.
let cachedRole: { userId: string; role: Role } | null = null;

export async function getRoleForUser(userId: string): Promise<Role> {
  if (cachedRole && cachedRole.userId === userId) return cachedRole.role;

  if (typeof sessionStorage !== 'undefined') {
    const stored = sessionStorage.getItem('gymsync_role');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed?.userId === userId) {
          cachedRole = parsed;
          return parsed.role as Role;
        }
      } catch {
        // ignore malformed cache
      }
    }
  }

  const { data } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .maybeSingle();

  const role = (data?.role as Role) ?? null;
  cachedRole = { userId, role };
  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.setItem('gymsync_role', JSON.stringify(cachedRole));
  }
  return role;
}

export function clearRoleCache() {
  cachedRole = null;
  if (typeof sessionStorage !== 'undefined') sessionStorage.removeItem('gymsync_role');
}

export const Route = createFileRoute('/dashboard')({
  // Session lives in localStorage, so gate on the client only. This removes the
  // SSR round-trip that made the first paint hang on a black screen.
  ssr: false,
  beforeLoad: async ({ location }) => {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      throw redirect({ to: '/auth/login', search: { redirect: location.href } });
    }

    const role = await getRoleForUser(session.user.id);
    const home = role ? roleHome[role] : undefined;

    if (!home) {
      throw redirect({ to: '/auth/login', search: { redirect: location.href } });
    }

    if (!location.pathname.startsWith(home)) {
      throw redirect({ to: home });
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
