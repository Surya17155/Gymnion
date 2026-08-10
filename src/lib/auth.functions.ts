import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { exportGymAttendanceToSheets } from "./attendance.server";

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

export const getMyProfile = createServerFn({ method: 'GET' })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const userId = context.userId;
    if (!userId) throw new Error("Unauthorized");

    const { data: member, error: memberError } = await supabaseAdmin
      .from('members')
      .select(`
        *,
        fee_plans(*),
        gyms(
          *,
          global_plans(*)
        )
      `)
      .eq('user_id', userId)
      .single();

    if (memberError) throw memberError;
    return member;
  });

export const getMyPayments = createServerFn({ method: 'GET' })
  .middleware([requireSupabaseAuth])
  .validator((data: any) => z.object({
    memberId: z.string(),
    limit: z.number().optional().default(10)
  }).parse(data))
  .handler(async ({ data }) => {
    const { data: payments, error } = await supabaseAdmin
      .from('payments')
      .select('*')
      .eq('member_id', data.memberId)
      .order('created_at', { ascending: false })
      .limit(data.limit);

    if (error) throw error;
    return payments;
  });

export const getMyAttendance = createServerFn({ method: 'GET' })
  .middleware([requireSupabaseAuth])
  .validator((data: any) => z.object({
    memberId: z.string(),
    month: z.string().optional() // YYYY-MM
  }).parse(data))
  .handler(async ({ data }) => {
    let query = supabaseAdmin
      .from('attendance')
      .select('*')
      .eq('member_id', data.memberId);

    if (data.month) {
      const parts = data.month.split('-');
      const year = parseInt(parts[0] || '0');
      const month = parseInt(parts[1] || '0');
      const startDate = new Date(year, month - 1, 1).toISOString();
      const endDate = new Date(year, month, 0, 23, 59, 59).toISOString();
      query = query.gte('check_in_at', startDate).lte('check_in_at', endDate);
    }

    const { data: attendance, error } = await query.order('check_in_at', { ascending: false });

    if (error) throw error;
    return attendance;
  });

export const updateMyProfile = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .validator((data: any) => z.object({
    phone: z.string().optional(),
    email: z.string().optional(),
    photo_url: z.string().optional(),
    full_name: z.string().optional(),
    first_name: z.string().optional(),
    last_name: z.string().optional()
  }).parse(data))
  .handler(async ({ data, context }) => {
    const userId = context.userId;
    const updates: any = {};
    if (data.phone) updates.phone = data.phone;
    if (data.email) updates.email = data.email;
    if (data.photo_url !== undefined) updates.photo_url = data.photo_url;
    if (data.full_name) updates.full_name = data.full_name;
    if (data.first_name) updates.first_name = data.first_name;
    if (data.last_name) updates.last_name = data.last_name;

    const { error } = await supabaseAdmin
      .from('members')
      .update(updates)
      .eq('user_id', userId);
    
    if (error) throw error;
    return { success: true };
  });

export const getFeePlans = createServerFn({ method: 'GET' })
  .validator((data: any) => z.object({
    gymId: z.string().optional()
  }).parse(data || {}))
  .handler(async ({ data }) => {
    let query = supabaseAdmin
      .from('fee_plans')
      .select('*')
      .eq('is_active', true);
    
    if (data.gymId) {
      query = query.eq('gym_id', data.gymId);
    }
    
    const { data: plans, error } = await query;
    if (error) throw error;
    return plans;
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
  .middleware([requireSupabaseAuth])
  .validator((data: any) => z.object({
    gymId: z.string().optional()
  }).parse(data || {}))
  .handler(async ({ data }) => {
    let query = supabaseAdmin
      .from('members')
      .select('*, fee_plans(name)');
    
    if (data.gymId) {
      query = query.eq('gym_id', data.gymId);
    }

    const { data: members, error } = await query;
    if (error) throw error;
    return members;
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
    const code = data.gym_code.trim();
    if (!code) return null;
    const { data: gym, error } = await supabaseAdmin
      .from('gyms')
      .select('id, name')
      .ilike('gym_code', code)
      .maybeSingle();

    if (error || !gym) return null;
    return { id: gym.id, name: gym.name };
  });

export const getGymDetails = createServerFn({ method: 'GET' })
  .middleware([requireSupabaseAuth])
  .validator((data: any) => z.object({
    gymId: z.string().optional()
  }).parse(data || {}))
  .handler(async ({ context, data }) => {
    const userId = context.userId;
    let gymId = data.gymId;

    if (!gymId) {
      const { data: roleData, error: roleError } = await supabaseAdmin
        .from('user_roles')
        .select('gym_id')
        .eq('user_id', userId)
        .eq('role', 'admin')
        .maybeSingle();
      
      if (roleError) {
        console.error("Error fetching gym_id from user_roles:", roleError);
        throw roleError;
      }
      
      gymId = roleData?.gym_id || undefined;
    }
    
    if (!gymId) {
      console.warn(`No gym_id found for admin user ${userId}`);
      return null;
    }

    const { data: gym, error: gymError } = await supabaseAdmin
      .from('gyms')
      .select('*')
      .eq('id', gymId)
      .single();
    
    if (gymError) {
      console.error(`Error fetching gym details for id ${gymId}:`, gymError);
      throw gymError;
    }
    
    return gym as any;
  });

export const getCurrentGymId = createServerFn({ method: 'GET' })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const userId = context.userId;
    if (!userId) return null;

    const { data, error } = await supabaseAdmin
      .from('user_roles')
      .select('gym_id')
      .eq('user_id', userId)
      .eq('role', 'admin')
      .single();

    if (error || !data) return null;
    return data.gym_id;
  });

export const getSubscriptionPlan = createServerFn({ method: 'GET' })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const userId = context.userId;
    if (!userId) return null;

    // Get the gym_id first
    const { data: roleData } = await supabaseAdmin
      .from('user_roles')
      .select('gym_id')
      .eq('user_id', userId)
      .eq('role', 'admin')
      .single();

    if (!roleData?.gym_id) return null;

    // Get gym settings to see if there's an override or a plan_id
    const { data: gym } = await supabaseAdmin
      .from('gyms')
      .select('settings')
      .eq('id', roleData.gym_id)
      .single();

    const settings = (gym?.settings as any) || {};
    const planId = settings.plan_id;

    if (planId) {
      const { data: plan } = await supabaseAdmin
        .from('global_plans')
        .select('*')
        .eq('id', planId)
        .single();
      return plan;
    }

    return null;
  });

export const getAdminStats = createServerFn({ method: 'GET' })
  .middleware([requireSupabaseAuth])
  .validator((data: any) => z.object({
    gymId: z.string()
  }).parse(data))
  .handler(async ({ data }) => {
    const gymId = data.gymId;
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    const [checkins, currentlyIn, revenue, overdue] = await Promise.all([
      // Count unique members who checked in today
      supabaseAdmin.from('attendance').select('member_id').eq('gym_id', gymId).gte('check_in_at', todayStart),
      supabaseAdmin.from('attendance').select('*', { count: 'exact', head: true }).eq('gym_id', gymId).is('check_out_at', null),
      // Only count verified real payments
      supabaseAdmin.from('payments').select('amount').eq('gym_id', gymId).gte('created_at', monthStart).eq('status', 'paid_verified'),
      supabaseAdmin.from('members').select('*', { count: 'exact', head: true }).eq('gym_id', gymId).eq('status', 'overdue')
    ]);

    const uniqueCheckinsToday = new Set(checkins.data?.map(c => c.member_id) || []).size;
    const totalRevenue = revenue.data?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;

    return {
      todayCheckins: uniqueCheckinsToday,
      currentlyIn: currentlyIn.count || 0,
      monthRevenue: totalRevenue,
      overdueCount: overdue.count || 0
    };
  });

export const getRecentActivity = createServerFn({ method: 'GET' })
  .middleware([requireSupabaseAuth])
  .validator((data: any) => z.object({
    gymId: z.string(),
    limit: z.number().optional().default(10)
  }).parse(data))
  .handler(async ({ data }) => {
    const [attendance, payments] = await Promise.all([
      supabaseAdmin
        .from('attendance')
        .select('*, members(full_name)')
        .eq('gym_id', data.gymId)
        .order('check_in_at', { ascending: false })
        .limit(data.limit),
      supabaseAdmin
        .from('payments')
        .select('*, members(full_name)')
        .eq('gym_id', data.gymId)
        .order('created_at', { ascending: false })
        .limit(data.limit)
    ]);

    const activities = [
      ...(attendance.data || []).map(a => ({
        type: 'attendance',
        member_name: (a.members as any)?.full_name,
        timestamp: a.check_in_at,
        action: 'checked in'
      })),
      ...(payments.data || []).map(p => ({
        type: 'payment',
        member_name: (p.members as any)?.full_name,
        timestamp: p.created_at,
        action: `processed ₹${p.amount} (${p.status})`
      }))
    ].sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
     .slice(0, data.limit);

    return activities;
  });

export const getGymAccessPointsFull = createServerFn({ method: 'GET' })
  .middleware([requireSupabaseAuth])
  .validator((data: any) => z.object({ gymId: z.string() }).parse(data))
  .handler(async ({ data }) => {
    const { data: points, error } = await supabaseAdmin
      .from('gym_access_points')
      .select('*')
      .eq('gym_id', data.gymId);
    if (error) {
      if (error.code === '42P01') return [];
      throw error;
    }
    return points || [];
  });

export const createAccessPoint = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .validator((data: any) => z.object({
    gymId: z.string(),
    name: z.string(),
    icon: z.string().optional().default('door_front')
  }).parse(data))
  .handler(async ({ data }) => {
    const { data: point, error } = await supabaseAdmin
      .from('gym_access_points')
      .insert({
        gym_id: data.gymId,
        name: data.name,
        icon: data.icon,
        is_active: true
      })
      .select()
      .single();
    if (error) throw error;
    return point;
  });

export const deleteAccessPoint = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .validator((data: any) => z.object({
    id: z.string()
  }).parse(data))
  .handler(async ({ data }) => {
    const { error } = await supabaseAdmin
      .from('gym_access_points')
      .delete()
      .eq('id', data.id);
    if (error) throw error;
    return { success: true };
  });

export const createMember = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .validator((data: any) => z.object({
    gym_id: z.string(),
    full_name: z.string(),
    first_name: z.string().optional(),
    last_name: z.string().optional(),
    email: z.string().email(),
    phone: z.string().optional(),
    fee_plan_id: z.string().optional(),
    status: z.string().default('active')
  }).parse(data))
  .handler(async ({ data }) => {
    const insertData: any = {
      gym_id: data.gym_id,
      full_name: data.full_name,
      first_name: data.first_name || data.full_name.split(' ')[0],
      last_name: data.last_name || (data.full_name.includes(' ') ? data.full_name.split(' ').slice(1).join(' ') : ''),
      email: data.email,
      status: data.status,
      phone: data.phone || ''
    };
    if (data.fee_plan_id) insertData.fee_plan_id = data.fee_plan_id;

    const { data: member, error } = await supabaseAdmin
      .from('members')
      .insert([insertData])
      .select()
      .single();
    
    if (error) throw error;
    return member;
  });

export const updateMember = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .validator((data: any) => z.object({
    id: z.string(),
    full_name: z.string().optional(),
    first_name: z.string().optional(),
    last_name: z.string().optional(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    fee_plan_id: z.string().optional(),
    status: z.string().optional()
  }).parse(data))
  .handler(async ({ data }) => {
    const { id, ...updates } = data;
    const finalUpdates: any = {};
    if (updates.full_name) finalUpdates.full_name = updates.full_name;
    if (updates.first_name) finalUpdates.first_name = updates.first_name;
    if (updates.last_name) finalUpdates.last_name = updates.last_name;
    if (updates.email) finalUpdates.email = updates.email;
    if (updates.phone) finalUpdates.phone = updates.phone;
    if (updates.fee_plan_id) finalUpdates.fee_plan_id = updates.fee_plan_id;
    if (updates.status) finalUpdates.status = updates.status;

    const { data: member, error } = await supabaseAdmin
      .from('members')
      .update(finalUpdates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return member;
  });

export const deleteMember = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .validator((data: any) => z.object({
    id: z.string()
  }).parse(data))
  .handler(async ({ data }) => {
    const { error } = await supabaseAdmin
      .from('members')
      .delete()
      .eq('id', data.id);
    
    if (error) throw error;
    return { success: true };
  });

export const getPaymentsDashboard = createServerFn({ method: 'GET' })
  .middleware([requireSupabaseAuth])
  .validator((data: any) => z.object({
    gymId: z.string(),
    status: z.enum(['all', 'paid', 'pending', 'overdue']).optional().default('all')
  }).parse(data))
  .handler(async ({ data }) => {
    let query = supabaseAdmin
      .from('payments')
      .select('*, members(full_name, photo_url)')
      .eq('gym_id', data.gymId);

    if (data.status && data.status !== 'all') {
      query = query.eq('status', data.status);
    }

    const { data: payments, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    return payments || [];
  });

export const recordManualPayment = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .validator((data: any) => z.object({
    member_id: z.string(),
    gym_id: z.string(),
    amount: z.number(),
    payment_method: z.string().optional().default('cash'),
    notes: z.string().optional(),
    payment_month: z.string().optional(),
    source: z.string().default('manual')
  }).parse(data))
  .handler(async ({ data }) => {
    const insertData: any = {
      ...data,
      status: 'paid'
    };
    if (insertData.notes === undefined) delete insertData.notes;

    const { error } = await supabaseAdmin
      .from('payments')
      .insert([insertData]);
    
    if (error) throw error;
    return { success: true };
  });

export const getAttendanceDashboard = createServerFn({ method: 'GET' })
  .middleware([requireSupabaseAuth])
  .validator((data: any) => z.object({
    gymId: z.string()
  }).parse(data))
  .handler(async ({ data }) => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();

    const [currentlyIn, todayLog, allVisits] = await Promise.all([
      supabaseAdmin
        .from('attendance')
        .select('*, members(full_name, photo_url)')
        .eq('gym_id', data.gymId)
        .is('check_out_at', null),
      supabaseAdmin
        .from('attendance')
        .select('*, members(full_name, photo_url)')
        .eq('gym_id', data.gymId)
        .gte('check_in_at', todayStart)
        .order('check_in_at', { ascending: false }),
      supabaseAdmin
        .from('attendance')
        .select('*, members(full_name, photo_url)')
        .eq('gym_id', data.gymId)
        .order('check_in_at', { ascending: false })
        .limit(50)
    ]);

    return {
      currently_in: currentlyIn.data || [],
      today_log: todayLog.data || [],
      all_visits: allVisits.data || []
    };
  });

export const getGymAccessPoints = createServerFn({ method: 'GET' })
  .middleware([requireSupabaseAuth])
  .validator((data: any) => z.object({
    gymId: z.string()
  }).parse(data))
  .handler(async ({ data }) => {
    const { data: points, error } = await supabaseAdmin
      .from('gym_access_points')
      .select('*')
      .eq('gym_id', data.gymId);
    
    if (error) {
      if (error.code === '42P01') return [];
      throw error;
    }
    return points || [];
  });

export const updateFeePlan = createServerFn({ method: 'POST' })
  .validator((data: any) => z.object({
    id: z.string(),
    name: z.string().optional(),
    amount: z.number().optional(),
    description: z.string().optional().nullable(),
    billing_cycle: z.string().optional(),
  }).parse(data))
  .handler(async ({ data }) => {
    const { id, ...updates } = data;
    const finalUpdates: any = {};
    if (updates.name !== undefined) finalUpdates.name = updates.name;
    if (updates.amount !== undefined) finalUpdates.amount = updates.amount;
    if (updates.description !== undefined) finalUpdates.description = updates.description;
    if (updates.billing_cycle !== undefined) finalUpdates.billing_cycle = updates.billing_cycle;

    const { error } = await supabaseAdmin
      .from('fee_plans')
      .update(finalUpdates)
      .eq('id', id);
    
    if (error) throw error;
    return { success: true };
  });

export const deleteFeePlan = createServerFn({ method: 'POST' })
  .validator((data: any) => z.object({
    id: z.string()
  }).parse(data))
  .handler(async ({ data }) => {
    const { error } = await supabaseAdmin
      .from('fee_plans')
      .update({ is_active: false })
      .eq('id', data.id);
    
    if (error) throw error;
    return { success: true };
  });

export const updateAdminAccount = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .validator((data: any) => z.object({
    full_name: z.string().optional(),
    first_name: z.string().optional(),
    last_name: z.string().optional(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    photo_url: z.string().optional(),
  }).parse(data))
  .handler(async ({ data, context }) => {
    const userId = context.userId;
    if (!userId) throw new Error("Unauthorized");

    const updates: any = {};
    if (data.full_name) updates.owner_name = data.full_name;
    if (data.first_name) updates.owner_first_name = data.first_name;
    if (data.last_name) updates.owner_last_name = data.last_name;
    if (data.email) updates.owner_email = data.email;
    if (data.phone) updates.owner_phone = data.phone;
    if (data.photo_url !== undefined) updates.owner_photo_url = data.photo_url;

    // Get the gym_id for this admin
    const { data: roleData } = await supabaseAdmin
      .from('user_roles')
      .select('gym_id')
      .eq('user_id', userId)
      .eq('role', 'admin')
      .single();

    if (!roleData?.gym_id) throw new Error("No gym associated with this admin");

    const { error } = await supabaseAdmin
      .from('gyms')
      .update(updates)
      .eq('id', roleData.gym_id);

    if (error) throw error;

    // Also update Auth User metadata if name/phone changed
    const authUpdates: any = {};
    if (data.full_name || data.phone) {
      authUpdates.user_metadata = {};
      if (data.full_name) authUpdates.user_metadata.full_name = data.full_name;
      if (data.phone) authUpdates.user_metadata.phone = data.phone;
      
      await supabaseAdmin.auth.admin.updateUserById(userId, authUpdates);
    }

    return { success: true };
  });

export const updateAdminPassword = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .validator((data: any) => z.object({
    currentPassword: z.string().min(6),
    newPassword: z.string().min(6),
  }).parse(data))
  .handler(async ({ data, context }) => {
    const userId = context.userId;
    if (!userId) throw new Error("Unauthorized");

    const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      password: data.newPassword
    });

    if (error) throw error;
    return { success: true };
  });

export const exportGymAttendance = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .validator((data: any) => z.object({
    gymId: z.string()
  }).parse(data))
  .handler(async ({ data }) => {
    return await exportGymAttendanceToSheets(data.gymId);
  });
