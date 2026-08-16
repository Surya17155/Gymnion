import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

export const updateMemberPlan = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: any) =>
    z.object({
      memberId: z.string(),
      planId: z.string(),
    }).parse(data)
  )
  .handler(async ({ data }) => {
    const { error } = await supabaseAdmin
      .from("members")
      .update({ fee_plan_id: data.planId })
      .eq("id", data.memberId);

    if (error) throw error;
    return { success: true };
  });

export const completeSignup = createServerFn({ method: "POST" })
  .validator((data: any) => z.object({
    userId: z.string(),
    gymId: z.string(),
    firstName: z.string(),
    lastName: z.string(),
    email: z.string(),
    phone: z.string().optional(),
    dob: z.string().optional(),
    address: z.string().optional(),
  }).parse(data))
  .handler(async ({ data }) => {
    const { error } = await supabaseAdmin
      .from('members')
      .upsert({
        user_id: data.userId,
        gym_id: data.gymId,
        first_name: data.firstName,
        last_name: data.lastName,
        full_name: `${data.firstName} ${data.lastName}`.trim(),
        email: data.email,
        phone: data.phone || '',
        dob: data.dob || null,
        address: data.address || null,
        status: 'active',
        subscription_ends_at: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString()
      } as any, { onConflict: 'user_id' });
    
    if (error) throw error;
    return { success: true };
  });

export const recordAttendance = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: any) => z.object({
    gymId: z.string(),
    action: z.enum(['in', 'out']),
    code: z.string().optional()
  }).parse(data))
  .handler(async ({ data, context }) => {
    const userId = context.userId;
    const { data: member } = await supabaseAdmin
      .from('members')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (!member) throw new Error("Member not found");

    if (data.action === 'in') {
      const { data: attendance, error } = await supabaseAdmin
        .from('attendance')
        .insert({
          member_id: member.id,
          gym_id: data.gymId,
          check_in_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Sync to Google Sheets
      const { syncAttendanceToGoogleSheets } = await import("./attendance.server");
      await syncAttendanceToGoogleSheets({
        gymId: data.gymId,
        memberId: member.id,
        checkInAt: attendance.check_in_at as string
      });

      return { success: true, message: "Checked in successfully", data: attendance };
    } else {
      const { data: latest } = await supabaseAdmin
        .from('attendance')
        .select('id')
        .eq('member_id', member.id)
        .is('check_out_at', null)
        .order('check_in_at', { ascending: false })
        .limit(1)
        .single();

      if (!latest) throw new Error("No active check-in found");

      const checkOutTime = new Date().toISOString();
      const { data: updated, error } = await supabaseAdmin
        .from('attendance')
        .update({ check_out_at: checkOutTime })
        .eq('id', latest.id)
        .select('check_in_at, check_out_at')
        .single();
      
      if (error) throw error;

      // Sync to Google Sheets
      const { syncAttendanceToGoogleSheets } = await import("./attendance.server");
      await syncAttendanceToGoogleSheets({
        gymId: data.gymId,
        memberId: member.id,
        checkInAt: updated.check_in_at as string,
        checkOutAt: updated.check_out_at as string
      });

      return { success: true, message: "Checked out successfully" };
    }
  });

export const getMyAttendanceStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .validator((data: any) => z.object({
    gymId: z.string()
  }).parse(data))
  .handler(async ({ data, context }) => {
    const userId = context.userId;
    const { data: member } = await supabaseAdmin
      .from('members')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (!member) throw new Error("Member not found");

    const { data: attendance } = await supabaseAdmin
      .from('attendance')
      .select('*')
      .eq('member_id', member.id)
      .eq('gym_id', data.gymId)
      .is('check_out_at', null)
      .order('check_in_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    return { status: attendance ? 'in' : 'out', lastAction: attendance };
  });

