import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const getAuthUserRole = createServerFn({ method: 'GET' })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const userId = context.userId;
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
  .handler(async () => {
    const { data, error } = await supabaseAdmin
      .from('fee_plans')
      .select('*')
      .eq('is_active', true);
    
    if (error) throw error;
    return data;
  });

export const createFeePlan = createServerFn({ method: 'POST' })
  .validator((data: any) => z.object({
    name: z.string(),
    amount: z.number(),
    description: z.string().optional().nullable(),
    billing_cycle: z.string(),
    gym_id: z.string(),
  }).parse(data))
  .handler(async ({ data }) => {
    const { error } = await supabaseAdmin
      .from('fee_plans')
      .insert([{
        ...data,
        description: data.description ?? null
      }]);
    
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

export const updateGymCode = createServerFn({ method: 'POST' })
  .validator((data: any) => z.object({
    gym_id: z.string(),
    gym_code: z.string(),
  }).parse(data))
  .handler(async ({ data }) => {
    const { error } = await supabaseAdmin
      .from('gyms')
      .update({ gym_code: data.gym_code })
      .eq('id', data.gym_id);
    
    if (error) {
      if (error.code === '23505') throw new Error('Gym code already exists');
      throw error;
    }
    return { success: true };
  });

export const getGymByCode = createServerFn({ method: 'GET' })
  .validator((data: any) => z.object({
    gym_code: z.string(),
  }).parse(data))
  .handler(async ({ data }) => {
    const { data: gym, error } = await supabaseAdmin
      .from('gyms')
      .select('id, name')
      .eq('gym_code', data.gym_code)
      .single();
    
    if (error || !gym) return null;
    return gym;
  });

export const getGymDetails = createServerFn({ method: 'GET' })
  .handler(async ({ context }) => {
    const userId = (context as any).userId;
    if (!userId) return null;

    // First get the gym_id for the admin
    const { data: roleData } = await supabaseAdmin
      .from('user_roles')
      .select('gym_id')
      .eq('user_id', userId)
      .eq('role', 'admin')
      .single();
    
    if (!roleData?.gym_id) return null;

    const { data: gym } = await supabaseAdmin
      .from('gyms')
      .select('*')
      .eq('id', roleData.gym_id)
      .single();
    
    return gym;
  });
