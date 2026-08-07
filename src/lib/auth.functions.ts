import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const getAuthUserRole = createServerFn({ method: 'GET' })
  .handler(async ({ context }) => {
    // The context is passed by the request handler after Supabase auth middleware runs
    const userId = (context as any).userId;
    if (!userId) return null;

    const { data, error } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .single();

    if (error || !data) return null;
    return data.role;
  });
