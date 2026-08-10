import { supabase } from '@/integrations/supabase/client';

export type Role = 'super_admin' | 'admin' | 'member' | null;

export const roleHome: Record<string, string> = {
  super_admin: '/dashboard/super-admin',
  admin: '/dashboard/admin',
  member: '/dashboard/m',
};

let cachedRole: { userId: string; role: Role } | null = null;

// Use sessionStorage for role to ensure it persists across tab reloads but stays within the session
// This is faster than localStorage for this use case and cleaner.
export async function getRoleForUser(userId: string): Promise<Role> {
  const cacheKey = `gymsync_role_${userId}`;
  
  // 1. Check in-memory
  if (cachedRole && cachedRole.userId === userId) return cachedRole.role;

  // 2. Check sessionStorage (faster than DB, survives refresh)
  if (typeof sessionStorage !== 'undefined') {
    const stored = sessionStorage.getItem(cacheKey);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        cachedRole = { userId, role: parsed.role };
        return parsed.role;
      } catch (e) {
        console.error('Failed to parse role from session storage', e);
      }
    }
  }

  // 3. Fast-path check for hardcoded admin emails
  // We check the session directly to avoid extra DB calls if we already have the email
  const { data: sessionData } = await supabase.auth.getSession();
  const session = sessionData?.session;
  
  let role: Role = null;
  
  if (session?.user?.email === 'surya.17155@gmail.com') {
    role = 'super_admin';
  } else if (session?.user?.email === 'amssre.17155@gmail.com') {
    role = 'admin';
  } else {
    // 4. Fallback to DB lookup
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching user role:', error);
    }
    role = (data?.role as Role) ?? null;
  }

  cachedRole = { userId, role };
  
  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.setItem(cacheKey, JSON.stringify({ role }));
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
