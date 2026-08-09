import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

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
      })
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
      // We don't necessarily want to fail completely if the role already exists 
      // (though it shouldn't for a new signup), but we should log it.
      if (roleError.code !== '23505') { // Ignore unique violation if already exists
        throw new Error(`Failed to assign member role: ${roleError.message}`);
      }
    }

    return { 
      memberId: member?.id || null, 
      gymId: gymId 
    };
  });
