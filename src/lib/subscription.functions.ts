import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const checkGymSubscription = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const userId = context.userId;
    if (!userId) return { isExpired: false };

    // Get gym_id for the admin
    const { data: roleData } = await supabaseAdmin
      .from('user_roles')
      .select('gym_id, role')
      .eq('user_id', userId)
      .eq('role', 'admin')
      .single();

    if (!roleData?.gym_id) return { isExpired: false };

    const { data: gym } = await supabaseAdmin
      .from('gyms')
      .select('subscription_ends_at, plan_tier, settings')
      .eq('id', roleData.gym_id)
      .single();

    if (!gym) return { isExpired: false };

    const now = new Date();
    const subscriptionEnd = gym.subscription_ends_at ? new Date(gym.subscription_ends_at) : null;
    const isExpired = subscriptionEnd ? subscriptionEnd < now : false;

    return {
      isExpired,
      subscriptionEndsAt: gym.subscription_ends_at,
      planTier: gym.plan_tier,
      settings: gym.settings
    };
  });
