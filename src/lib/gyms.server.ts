import { supabaseAdmin } from "@/integrations/supabase/client.server";

export async function regenerateGymCode(gymId: string) {
  const newCode = Math.random().toString(36).substring(2, 8).toUpperCase();
  const { data, error } = await supabaseAdmin
    .from('gyms')
    .update({ gym_code: newCode })
    .eq('id', gymId)
    .select()
    .single();
    
  if (error) throw error;
  return data;
}
