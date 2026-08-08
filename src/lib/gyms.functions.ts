import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const createGymWithAdmin = createServerFn({ method: "POST" })
  .validator((data: unknown) => z.object({
    name: z.string().min(1),
    ownerName: z.string().min(1),
    ownerEmail: z.string().email(),
    ownerPassword: z.string().min(6),
    ownerPhone: z.string().min(10),
    gymCode: z.string().min(3)
  }).parse(data))
  .handler(async ({ data }) => {
    // 1. Create the Gym
    const { data: gym, error: gymError } = await supabaseAdmin
      .from('gyms')
      .insert({
        name: data.name,
        gym_code: data.gymCode,
        owner_name: data.ownerName,
        owner_email: data.ownerEmail,
        owner_phone: data.ownerPhone,
        status: 'approved'
      })
      .select()
      .single();

    if (gymError) {
      if (gymError.code === '23505') throw new Error('Gym code already exists');
      throw gymError;
    }

    // 2. Create the Admin User
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: data.ownerEmail,
      password: data.ownerPassword,
      email_confirm: true,
      user_metadata: {
        full_name: data.ownerName,
        gym_id: gym.id
      }
    });

    if (authError) throw authError;

    // 3. Assign 'admin' role
    const { error: roleError } = await supabaseAdmin
      .from('user_roles')
      .insert({
        user_id: authUser.user.id,
        role: 'admin',
        gym_id: gym.id
      });

    if (roleError) throw roleError;

    return { success: true, gymId: gym.id };
  });

