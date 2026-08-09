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
      .order('payment_date', { ascending: false })
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
      const [year, month] = data.month.split('-').map(Number);
      const startDate = new Date(year, month - 1, 1).toISOString();
      const endDate = new Date(year, month, 0, 23, 59, 59).toISOString();
      query = query.gte('check_in', startDate).lte('check_in', endDate);
    }

    const { data: attendance, error } = await query.order('check_in', { ascending: false });

    if (error) throw error;
    return attendance;
  });

export const updateMyProfile = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .validator((data: any) => z.object({
    phone: z.string().optional(),
    email: z.string().optional(),
    photo_url: z.string().optional(),
    full_name: z.string().optional()
  }).parse(data))
  .handler(async ({ data, context }) => {
    const userId = context.userId;
    const { error } = await supabaseAdmin
      .from('members')
      .update(data)
      .eq('user_id', userId);
    
    if (error) throw error;
    return { success: true };
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
    const { data: gym, error } = await supabaseAdmin
      .from('gyms')
      .select('id, name')
      .eq('gym_code', data.gym_code)
      .single();
    
    if (error || !gym) return null;
    return gym;
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
      const { data: roleData } = await supabaseAdmin
        .from('user_roles')
        .select('gym_id')
        .eq('user_id', userId)
        .eq('role', 'gym_admin')
        .single();
      gymId = roleData?.gym_id;
    }
    
    if (!gymId) return null;

    const { data: gym } = await supabaseAdmin
      .from('gyms')
      .select('*')
      .eq('id', gymId)
      .single();
    
    return gym;
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
      .eq('role', 'gym_admin')
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
      .eq('role', 'gym_admin')
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
      supabaseAdmin.from('attendance').select('*', { count: 'exact', head: true }).eq('gym_id', gymId).gte('check_in', todayStart),
      supabaseAdmin.from('attendance').select('*', { count: 'exact', head: true }).eq('gym_id', gymId).is('check_out', null),
      supabaseAdmin.from('payments').select('amount').eq('gym_id', gymId).gte('payment_date', monthStart).eq('status', 'paid'),
      supabaseAdmin.from('members').select('*', { count: 'exact', head: true }).eq('gym_id', gymId).eq('status', 'overdue')
    ]);

    const totalRevenue = revenue.data?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;

    return {
      todayCheckins: checkins.count || 0,
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
        .order('check_in', { ascending: false })
        .limit(data.limit),
      supabaseAdmin
        .from('payments')
        .select('*, members(full_name)')
        .eq('gym_id', data.gymId)
        .order('payment_date', { ascending: false })
        .limit(data.limit)
    ]);

    const activities = [
      ...(attendance.data || []).map(a => ({
        type: 'attendance',
        member_name: a.members?.full_name,
        timestamp: a.check_in,
        action: 'checked in'
      })),
      ...(payments.data || []).map(p => ({
        type: 'payment',
        member_name: p.members?.full_name,
        timestamp: p.payment_date,
        action: `paid ₹${p.amount}`
      }))
    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
     .slice(0, data.limit);

    return activities;
  });

export const createMember = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .validator((data: any) => z.object({
    gym_id: z.string(),
    full_name: z.string(),
    email: z.string().email(),
    phone: z.string().optional(),
    plan_id: z.string().optional(),
    status: z.string().default('active')
  }).parse(data))
  .handler(async ({ data }) => {
    const { data: member, error } = await supabaseAdmin
      .from('members')
      .insert([data])
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
    email: z.string().email().optional(),
    phone: z.string().optional(),
    plan_id: z.string().optional(),
    status: z.string().optional()
  }).parse(data))
  .handler(async ({ data }) => {
    const { id, ...updates } = data;
    const { data: member, error } = await supabaseAdmin
      .from('members')
      .update(updates)
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
    gymId: z.string()
  }).parse(data))
  .handler(async ({ data }) => {
    const { data: payments, error } = await supabaseAdmin
      .from('payments')
      .select('*, members(full_name, photo_url)')
      .eq('gym_id', data.gymId)
      .order('payment_date', { ascending: false });

    if (error) throw error;

    return {
      paid: payments.filter(p => p.status === 'paid'),
      pending: payments.filter(p => p.status === 'pending'),
      overdue: payments.filter(p => p.status === 'overdue')
    };
  });

export const recordManualPayment = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .validator((data: any) => z.object({
    member_id: z.string(),
    gym_id: z.string(),
    amount: z.number(),
    method: z.string(),
    note: z.string().optional(),
    payment_date: z.string().default(new Date().toISOString())
  }).parse(data))
  .handler(async ({ data }) => {
    const { error } = await supabaseAdmin
      .from('payments')
      .insert([{
        ...data,
        status: 'paid'
      }]);
    
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
        .is('check_out', null),
      supabaseAdmin
        .from('attendance')
        .select('*, members(full_name, photo_url)')
        .eq('gym_id', data.gymId)
        .gte('check_in', todayStart)
        .order('check_in', { ascending: false }),
      supabaseAdmin
        .from('attendance')
        .select('*, members(full_name, photo_url)')
        .eq('gym_id', data.gymId)
        .order('check_in', { ascending: false })
        .limit(50)
    ]);

    return {
      currently_in: currentlyIn.data || [],
      today_log: todayLog.data || [],
      all_visits: allVisits.data || []
    };
  });
