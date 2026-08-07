import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { z } from "zod";

export const getAuthUserRole = createServerFn({ method: 'GET' })
  .handler(async ({ context }) => {
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

export const getFeePlans = createServerFn({ method: 'GET' })
  .handler(async ({ context }) => {
    const { data, error } = await supabaseAdmin
      .from('fee_plans')
      .select('*')
      .eq('is_active', true);
    
    if (error) throw error;
    return data;
  });

export const createFeePlan = createServerFn({ method: 'POST' })
  .input(z.object({
    name: z.string(),
    amount: z.number(),
    description: z.string().optional(),
    billing_cycle: z.string(),
    gym_id: z.string(),
  }))
  .handler(async ({ data }) => {
    const { error } = await supabaseAdmin
      .from('fee_plans')
      .insert([data]);
    
    if (error) throw error;
    return { success: true };
  });

export const getMembers = createServerFn({ method: 'GET' })
  .handler(async () => {
    const { data, error } = await supabaseAdmin
      .from('members')
      .select('*, fee_plans(name)');
    
    if (error) throw error;
    return data;
  });
