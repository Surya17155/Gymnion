import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const getSubscriptionPlans = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: roleData } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', context.userId)
      .eq('role', 'super_admin')
      .single();

    if (!roleData) throw new Error("Unauthorized");

    const { data, error } = await supabaseAdmin
      .from('global_plans')
      .select('*')
      .order('price', { ascending: true });

    if (error) throw error;
    return data;
  });

export const createSubscriptionPlan = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) => z.object({
    name: z.string().min(1),
    price: z.number().min(0), // in paise
    features: z.array(z.object({
      name: z.string(),
      enabled: z.boolean()
    })),
    member_limit: z.number().optional(),
    is_active: z.boolean().default(true)
  }).parse(data))
  .handler(async ({ data, context }) => {
    const { data: roleData } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', context.userId)
      .eq('role', 'super_admin')
      .single();

    if (!roleData) throw new Error("Unauthorized");

    const { data: plan, error } = await supabaseAdmin
      .from('global_plans')
      .insert([data as any])
      .select()
      .single();

    if (error) throw error;
    return plan;
  });

export const updateSubscriptionPlan = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) => z.object({
    id: z.string(),
    name: z.string().optional(),
    price: z.number().optional(),
    features: z.array(z.object({
      name: z.string(),
      enabled: z.boolean()
    })).optional(),
    member_limit: z.number().optional(),
    is_active: z.boolean().optional()
  }).parse(data))
  .handler(async ({ data, context }) => {
    const { data: roleData } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', context.userId)
      .eq('role', 'super_admin')
      .single();

    if (!roleData) throw new Error("Unauthorized");

    const { id, ...updateData } = data;
    const { data: plan, error } = await supabaseAdmin
      .from('global_plans')
      .update({ ...updateData, updated_at: new Date().toISOString() } as any)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return plan;
  });

export const deleteSubscriptionPlan = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) => z.object({
    id: z.string()
  }).parse(data))
  .handler(async ({ data, context }) => {
    const { data: roleData } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', context.userId)
      .eq('role', 'super_admin')
      .single();

    if (!roleData) throw new Error("Unauthorized");

    // Check if gyms are using this plan
    const { count } = await supabaseAdmin
      .from('gyms')
      .select('*', { count: 'exact', head: true })
      .eq('subscription_plan_id', data.id);

    if (count && count > 0) {
      throw new Error(`Cannot delete plan: ${count} gyms are currently using it.`);
    }

    const { error } = await supabaseAdmin
      .from('global_plans')
      .delete()
      .eq('id', data.id);

    if (error) throw error;
    return { success: true };
  });
