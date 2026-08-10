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
  const { data: sessionData } = await supabase.auth.getSession();
  const session = sessionData?.session;
  const email = session?.user?.email;
  
  let role: Role = null;
  
  if (email === 'surya.17155@gmail.com') {
    role = 'super_admin';
  } else if (email === 'amssre.17155@gmail.com') {
    role = 'admin';
  } else {
    // 4. Fallback to DB lookup
    // Try user_roles first
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .maybeSingle();

    if (roleError) console.error('Error fetching user_role:', roleError);
    
    if (roleData?.role) {
      role = roleData.role as Role;
    } else {
      // Check members table if no role found in user_roles
      const { data: memberData, error: memberError } = await supabase
        .from('members')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (memberError) console.error('Error fetching member role:', memberError);
      if (memberData) role = 'member';
    }
  }

  cachedRole = { userId, role };
  
  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.setItem(cacheKey, JSON.stringify({ role }));
  }
  
  return role;
}

export function clearRoleCache() {
  cachedRole = null;
  if (typeof sessionStorage !== 'undefined') {
    // Clear all gymsync role keys
    Object.keys(sessionStorage).forEach(key => {
      if (key.startsWith('gymsync_role')) {
        sessionStorage.removeItem(key);
      }
    });
  }
  if (typeof localStorage !== 'undefined') {
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('gymsync_role')) {
        localStorage.removeItem(key);
      }
    });
  }
}

export function homeForRole(role: Role): string | null {
  return role ? (roleHome[role] ?? null) : null;
}
