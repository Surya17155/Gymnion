import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const getPlatformStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    // Check if user is super_admin
    const { data: roleData } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', context.userId)
      .eq('role', 'super_admin')
      .single();

    if (!roleData) throw new Error("Unauthorized");

    const { count: gymCount } = await supabaseAdmin
      .from('gyms')
      .select('*', { count: 'exact', head: true });

    const { count: memberCount } = await supabaseAdmin
      .from('members')
      .select('*', { count: 'exact', head: true });

    // MRR calculation (simplified)
    const { data: gyms } = await supabaseAdmin
      .from('gyms')
      .select('subscription_plan_id, settings');
    
    const { data: plans } = await supabaseAdmin.from('global_plans').select('id, price');
    const planPrices = Object.fromEntries(plans?.map(p => [p.id, p.price]) || []);

    let mrr = 0;
    gyms?.forEach(g => {
        const manualPrice = (g.settings as any)?.manual_pricing;
        if (manualPrice) {
            mrr += manualPrice * 100; // in paise
        } else if (g.subscription_plan_id && planPrices[g.subscription_plan_id]) {
            mrr += planPrices[g.subscription_plan_id] as number;
        }
    });

    const now = new Date();
    const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    
    const { count: newGymsThisMonth } = await supabaseAdmin
      .from('gyms')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', firstOfMonth);

    const { count: overdueCount } = await supabaseAdmin
      .from('gyms')
      .select('*', { count: 'exact', head: true })
      .lt('subscription_ends_at', now.toISOString());

    return {
      totalGyms: gymCount || 0,
      totalMembers: memberCount || 0,
      mrr: Math.round(mrr / 100), // convert to rupees
      newGymsThisMonth: newGymsThisMonth || 0,
      overdueSubscriptions: overdueCount || 0
    };
  });

export const getAllGymsServer = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) => z.object({
    search: z.string().optional(),
    status: z.string().optional(),
    page: z.number().optional().default(1),
    limit: z.number().optional().default(10)
  }).parse(data))
  .handler(async ({ data, context }) => {
     // Check if user is super_admin
     const { data: roleData } = await supabaseAdmin
     .from('user_roles')
     .select('role')
     .eq('user_id', context.userId)
     .eq('role', 'super_admin')
     .single();

   if (!roleData) throw new Error("Unauthorized");

   let query = supabaseAdmin
     .from('gyms')
     .select('*, global_plans(name)', { count: 'exact' });

   if (data.search) {
     query = query.or(`name.ilike.%${data.search}%,gym_code.ilike.%${data.search}%`);
   }

   if (data.status && data.status !== 'all') {
     query = query.eq('status', data.status);
   }

   const from = (data.page - 1) * data.limit;
   const to = from + data.limit - 1;

   const { data: gyms, count, error } = await query
     .order('created_at', { ascending: false })
     .range(from, to);

   if (error) throw error;

   return {
     gyms,
     total: count || 0,
     page: data.page,
     limit: data.limit
   };
  });

export const updateGymStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) => z.object({
    gymId: z.string(),
    status: z.enum(['approved', 'suspended', 'pending'])
  }).parse(data))
  .handler(async ({ data, context }) => {
    const { error } = await supabaseAdmin
      .from('gyms')
      .update({ status: data.status })
      .eq('id', data.gymId);

    if (error) throw error;
    return { success: true };
  });

export const extendSubscription = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) => z.object({
    gymId: z.string(),
    months: z.number().default(1)
  }).parse(data))
  .handler(async ({ data }) => {
    const { data: gym } = await supabaseAdmin
      .from('gyms')
      .select('subscription_ends_at')
      .eq('id', data.gymId)
      .single();

    const currentEnd = gym?.subscription_ends_at ? new Date(gym.subscription_ends_at) : new Date();
    const newEnd = new Date(currentEnd);
    newEnd.setMonth(newEnd.getMonth() + data.months);

    const { error } = await supabaseAdmin
      .from('gyms')
      .update({ subscription_ends_at: newEnd.toISOString() })
      .eq('id', data.gymId);

    if (error) throw error;
    return { success: true, newEndDate: newEnd.toISOString() };
  });

export const getPlatformRevenue = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    // Check if user is super_admin
    const { data: roleData } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', context.userId)
      .eq('role', 'super_admin')
      .single();

    if (!roleData) throw new Error("Unauthorized");

    const { data: gyms } = await supabaseAdmin
      .from('gyms')
      .select('subscription_plan_id, settings, subscription_ends_at');
    
    const { data: plans } = await supabaseAdmin.from('global_plans').select('id, price');
    const planPrices = Object.fromEntries(plans?.map(p => [p.id, p.price]) || []);

    let totalCollected = 0;
    let paidCount = 0;
    let overdueCount = 0;
    const now = new Date();

    gyms?.forEach(g => {
        const manualPrice = (g.settings as any)?.manual_pricing;
        let monthlyPaise = 0;
        if (manualPrice) {
            monthlyPaise = manualPrice * 100;
        } else if (g.subscription_plan_id && planPrices[g.subscription_plan_id]) {
            monthlyPaise = planPrices[g.subscription_plan_id] as number;
        }
        
        const isOverdue = g.subscription_ends_at ? new Date(g.subscription_ends_at) < now : true;
        const isPaid = (g.settings as any)?.payment_status === 'paid' || !isOverdue;
        
        if (isPaid) {
          totalCollected += monthlyPaise;
          paidCount++;
        } else {
          overdueCount++;
        }
    });

    return {
      totalCollected: Math.round(totalCollected / 100),
      paidCount,
      overdueCount,
      growth: 15
    };
  });

export const updateGymDetails = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) => z.object({
    gymId: z.string(),
    name: z.string().optional(),
    address: z.string().optional(),
    gymCode: z.string().optional(),
    ownerPhotoUrl: z.string().optional(),
  }).parse(data))
  .handler(async ({ data, context }) => {
    // Check if user is super_admin
    const { data: roleData } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', context.userId)
      .eq('role', 'super_admin')
      .single();

    if (!roleData) throw new Error("Unauthorized");

    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.address !== undefined) updateData.address = data.address;
    if (data.gymCode !== undefined) updateData.gym_code = data.gymCode;
    if (data.ownerPhotoUrl !== undefined) updateData.owner_photo_url = data.ownerPhotoUrl;

    const { error } = await supabaseAdmin
      .from('gyms')
      .update(updateData as any)
      .eq('id', data.gymId);

    if (error) throw error;
    return { success: true };
  });

export const updateGymAdminDetails = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) => z.object({
    gymId: z.string(),
    ownerFirstName: z.string().optional(),
    ownerLastName: z.string().optional(),
    ownerName: z.string().optional(),
    ownerEmail: z.string().optional(),
    ownerPhone: z.string().optional(),
  }).parse(data))
  .handler(async ({ data, context }) => {
    // Check if user is super_admin
    const { data: roleData } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', context.userId)
      .eq('role', 'super_admin')
      .single();

    if (!roleData) throw new Error("Unauthorized");

    const updateData: any = {};
    if (data.ownerFirstName) updateData.owner_first_name = data.ownerFirstName;
    if (data.ownerLastName) updateData.owner_last_name = data.ownerLastName;
    if (data.ownerName) updateData.owner_name = data.ownerName;
    if (data.ownerEmail) updateData.owner_email = data.ownerEmail;
    if (data.ownerPhone) updateData.owner_phone = data.ownerPhone;

    const { error } = await supabaseAdmin
      .from('gyms')
      .update(updateData as any)
      .eq('id', data.gymId);

    if (error) throw error;
    return { success: true };
  });

export const setGymManualPricing = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) => z.object({
    gymId: z.string(),
    manualPricing: z.number().nullable(),
    features: z.object({
      payment_management: z.boolean(),
      attendance_management: z.boolean(),
    }).optional()
  }).parse(data))
  .handler(async ({ data, context }) => {
    // Check if user is super_admin
    const { data: roleData } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', context.userId)
      .eq('role', 'super_admin')
      .single();

    if (!roleData) throw new Error("Unauthorized");

    // Fetch current settings
    const { data: gym } = await supabaseAdmin
      .from('gyms')
      .select('settings')
      .eq('id', data.gymId)
      .single();

    const currentSettings = (gym?.settings as any) || {};
    
    if (data.manualPricing !== undefined) {
      if (data.manualPricing === null) {
        delete currentSettings.manual_pricing;
      } else {
        currentSettings.manual_pricing = data.manualPricing;
      }
    }

    if (data.features) {
      currentSettings.features = {
        ...currentSettings.features,
        ...data.features
      };
    }

    const { error } = await supabaseAdmin
      .from('gyms')
      .update({ settings: currentSettings })
      .eq('id', data.gymId);

    if (error) throw error;
    return { success: true };
  });
