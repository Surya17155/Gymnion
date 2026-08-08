import { supabase } from '@/integrations/supabase/client';

export type Role = 'super_admin' | 'gym_admin' | 'member' | null;

export const roleHome: Record<string, string> = {
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

export function homeForRole(role: Role): string | null {
  return role ? (roleHome[role] ?? null) : null;
}
