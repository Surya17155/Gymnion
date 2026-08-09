import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const completeSignupSchema = z.object({
  userId: z.string(),
  gymId: z.string(),
  fullName: z.string(),
  email: z.string(),
  phone: z.string().optional(),
});

/**
 * Completes the signup process for a new member by creating the member record
 * and assigning the 'member' role in the user_roles table.
 */
export const completeSignup = createServerFn({ method: "POST" })
  .validator((data: unknown) => completeSignupSchema.parse(data))
  .handler(async ({ data }) => {
    const { userId, gymId, fullName, email, phone } = data;

    // 1. Insert into members table
    const { data: member, error: memberError } = await supabaseAdmin
      .from('members')
      .insert({
        user_id: userId,
        gym_id: gymId,
        full_name: fullName,
        email: email,
        phone: phone || '',
        status: 'active',
        join_date: new Date().toISOString().split('T')[0]
      } as any)
      .select()
      .maybeSingle();

    if (memberError) {
      console.error('Error creating member record:', memberError);
      throw new Error(`Failed to create member record: ${memberError.message}`);
    }

    // 2. Insert into user_roles table
    const { error: roleError } = await supabaseAdmin
      .from('user_roles')
      .insert({
        user_id: userId,
        role: 'member',
        gym_id: gymId
      });

    if (roleError) {
      console.error('Error creating user role:', roleError);
      if (roleError.code !== '23505') {
        throw new Error(`Failed to assign member role: ${roleError.message}`);
      }
    }

    return { 
      memberId: member?.id || null, 
      gymId: gymId 
    };
  });

/**
 * Records a check-in or check-out for a member.
 */
export const recordAttendance = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) => z.object({
    gymId: z.string(),
    action: z.enum(['in', 'out'])
  }).parse(data))
  .handler(async ({ data, context }) => {
    const userId = context.userId;
    const { gymId, action } = data;

    // 1. Verify user is a member of the gym
    const { data: member, error: memberError } = await supabaseAdmin
      .from('members')
      .select('id, gym_id')
      .eq('user_id', userId)
      .eq('gym_id', gymId)
      .single();

    if (memberError || !member) {
      throw new Error("You are not registered as a member of this gym.");
    }

    const today = new Date().toISOString().split('T')[0];

    if (action === 'in') {
      // Check if already checked in today (and not checked out)
      const { data: existing } = await supabaseAdmin
        .from('attendance')
        .select('*')
        .eq('member_id', member.id)
        .eq('gym_id', gymId)
        .gte('check_in_at', `${today}T00:00:00`)
        .is('check_out_at', null)
        .order('check_in_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (existing) {
        return { 
          success: true, 
          message: "You are already checked in.", 
          check_in_at: existing.check_in_at,
          check_out_at: null
        };
      }

      const { data: newEntry, error } = await supabaseAdmin
        .from('attendance')
        .insert({
          member_id: member.id,
          gym_id: gymId,
          check_in_at: new Date().toISOString(),
          status: 'present'
        })
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        message: "Successfully checked in!",
        check_in_at: newEntry.check_in_at,
        check_out_at: null
      };
    } else {
      // Find the latest open check-in
      const { data: openCheckin } = await supabaseAdmin
        .from('attendance')
        .select('*')
        .eq('member_id', member.id)
        .eq('gym_id', gymId)
        .is('check_out_at', null)
        .order('check_in_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!openCheckin) {
        throw new Error("No active check-in found to check out from.");
      }

      const { data: updatedEntry, error } = await supabaseAdmin
        .from('attendance')
        .update({
          check_out_at: new Date().toISOString()
        })
        .eq('id', openCheckin.id)
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        message: "Successfully checked out!",
        check_in_at: updatedEntry.check_in_at,
        check_out_at: updatedEntry.check_out_at
      };
    }
  });

/**
 * Gets the current attendance status for the authenticated member.
 */
export const getMyAttendanceStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) => z.object({
    gymId: z.string()
  }).parse(data))
  .handler(async ({ data, context }) => {
    const userId = context.userId;
    const { gymId } = data;

    const { data: member } = await supabaseAdmin
      .from('members')
      .select('id')
      .eq('user_id', userId)
      .eq('gym_id', gymId)
      .single();

    if (!member) return { status: 'none' as const };

    const { data: latest } = await supabaseAdmin
      .from('attendance')
      .select('*')
      .eq('member_id', member.id)
      .eq('gym_id', gymId)
      .order('check_in_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (latest && !latest.check_out_at) {
      return { status: 'in' as const, check_in_at: latest.check_in_at };
    }

    return { status: 'none' as const };
  });
