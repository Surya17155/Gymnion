import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { regenerateGymCode } from "./gyms.server";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const createGymWithAdminSchema = z.object({
  name: z.string(),
  address: z.string(),
  ownerName: z.string(),
  ownerEmail: z.string(),
  ownerPassword: z.string(),
  ownerPhone: z.string(),
  gymCode: z.string(),
  planId: z.string(),
});

export const createGymWithAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) => createGymWithAdminSchema.parse(data))
  .handler(async ({ data }) => {
    // 1. Create the Auth User
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: data.ownerEmail,
      password: data.ownerPassword,
      email_confirm: true,
      user_metadata: {
        full_name: data.ownerName,
        phone: data.ownerPhone,
      }
    });

    if (authError) throw new Error(`Auth Error: ${authError.message}`);
    const userId = authUser.user.id;

    // 2. Create the Gym
    const { data: gym, error: gymError } = await supabaseAdmin
      .from('gyms')
      .insert({
        name: data.name,
        address: data.address,
        owner_name: data.ownerName,
        owner_email: data.ownerEmail,
        gym_code: data.gymCode,
        settings: {
          plan_id: data.planId,
          status: 'approved'
        }
      } as any)
      .select()
      .single();

    if (gymError) {
      // Cleanup user if gym creation fails
      await supabaseAdmin.auth.admin.deleteUser(userId);
      throw new Error(`Gym Creation Error: ${gymError.message}`);
    }

    // 3. Assign Roles
    const { error: roleError } = await supabaseAdmin
      .from('user_roles')
      .insert([
        { user_id: userId, role: 'admin', gym_id: gym.id },
        { user_id: userId, role: 'member', gym_id: gym.id }
      ]);

    if (roleError) {
      throw new Error(`Role Assignment Error: ${roleError.message}`);
    }

    return gym;
  });

export const regenerateGymQR = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) => z.string().parse(data))
  .handler(async ({ data: gymId }) => {
    return await regenerateGymCode(gymId);
  });
