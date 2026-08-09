import { supabase } from '@/integrations/supabase/client';

export type Role = 'super_admin' | 'admin' | 'member' | null;

export const roleHome: Record<string, string> = {
  super_admin: '/dashboard/super-admin',
  admin: '/dashboard/admin',
  member: '/dashboard/m',
};

// In-memory cache so navigating between tabs never re-hits the network.
let cachedRole: { userId: string; role: Role } | null = null;

export async function getRoleForUser(userId: string): Promise<Role> {
  if (cachedRole && cachedRole.userId === userId) return cachedRole.role;

  // Optimized lookup: check persistent storage first to avoid blocking on network in route guards
  if (typeof localStorage !== 'undefined') {
    const stored = localStorage.getItem('gymsync_role_v2');
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

  // Fallback to check hardcoded super admin email immediately if storage is empty
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.user?.email === 'surya.17155@gmail.com') {
    const role: Role = 'super_admin';
    cachedRole = { userId, role };
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('gymsync_role_v2', JSON.stringify(cachedRole));
    }
    return role;
  }

  // Final fallback to DB
  const { data } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .maybeSingle();

  const role = (data?.role as Role) ?? null;
  cachedRole = { userId, role };
  
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('gymsync_role_v2', JSON.stringify(cachedRole));
  }
  
  return role;
}

export function clearRoleCache() {
  cachedRole = null;
  if (typeof sessionStorage !== 'undefined') sessionStorage.removeItem('gymsync_role');
  if (typeof localStorage !== 'undefined') localStorage.removeItem('gymsync_role_v2');
}

export function homeForRole(role: Role): string | null {
  return role ? (roleHome[role] ?? null) : null;
}
