import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { syncAttendanceToGoogleSheets } from "./attendance.server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const completeSignupSchema = z.object({
  userId: z.string(),
  gymId: z.string(),
  firstName: z.string(),
  lastName: z.string().optional(),
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
    const { userId, gymId, firstName, lastName, email, phone } = data;

    // 1. Insert into members table
    const { data: member, error: memberError } = await supabaseAdmin
      .from('members')
      .insert({
        user_id: userId,
        gym_id: gymId,
        full_name: `${firstName} ${lastName || ''}`.trim(),
        first_name: firstName,
        last_name: lastName || '',
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
    action: z.enum(['in', 'out']),
    code: z.string().optional()
  }).parse(data))
  .handler(async ({ data, context }) => {
    const userId = context.userId;
    const { gymId, action, code } = data;

    // 1. Verify gym code if provided
    if (code) {
      const { data: gym } = await supabaseAdmin
        .from('gyms')
        .select('gym_code')
        .eq('id', gymId)
        .single();
      
      if (gym && gym.gym_code !== code) {
        throw new Error("Invalid access code. Please scan a fresh QR code.");
      }
    }

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

    // Find the latest attendance entry for today
    const { data: latestEntry } = await supabaseAdmin
      .from('attendance')
      .select('*')
      .eq('member_id', member.id)
      .eq('gym_id', gymId)
      .gte('check_in_at', `${today}T00:00:00`)
      .order('check_in_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    // Determine action: if latest entry is an open check-in, check out. 
    // Otherwise, if no entry today OR latest was a completed session, check in.
    const effectiveAction = (latestEntry && !latestEntry.check_out_at) ? 'out' : 'in';

    if (effectiveAction === 'in') {
      const { data: newEntry, error } = await supabaseAdmin
        .from('attendance')
        .insert({
          member_id: member.id,
          gym_id: gymId,
          check_in_at: new Date().toISOString(),
          status: 'present'
        } as any)
        .select()
        .single();

      if (error) throw error;

      // Sync to Google Sheets in the background
      syncAttendanceToGoogleSheets({
        gymId,
        memberId: member.id,
        checkInAt: newEntry.check_in_at,
        checkOutAt: null
      }).catch(err => console.error('Google Sheets Sync Error:', err));

      return {
        success: true,
        message: "Successfully checked in!",
        check_in_at: newEntry.check_in_at,
        check_out_at: null
      };
    } else {
      // Must have latestEntry and it must be open
      const { data: updatedEntry, error } = await supabaseAdmin
        .from('attendance')
        .update({
          check_out_at: new Date().toISOString()
        })
        .eq('id', latestEntry!.id)
        .select()
        .single();

      if (error) throw error;

      // Sync to Google Sheets in the background
      syncAttendanceToGoogleSheets({
        gymId,
        memberId: member.id,
        checkInAt: updatedEntry.check_in_at,
        checkOutAt: updatedEntry.check_out_at
      }).catch(err => console.error('Google Sheets Sync Error:', err));

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
