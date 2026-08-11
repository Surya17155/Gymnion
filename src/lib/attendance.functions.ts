import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { DateTime } from "luxon";

export const getGymAttendanceData = createServerFn({ method: 'GET' })
  .middleware([requireSupabaseAuth])
  .validator((data: any) => z.object({
    gymId: z.string()
  }).parse(data))
  .handler(async ({ data }) => {
    const { data: attendance, error } = await supabaseAdmin
      .from('attendance')
      .select('*, members(full_name, email, phone)')
      .eq('gym_id', data.gymId)
      .order('check_in_at', { ascending: false });

    if (error) throw error;
    
    return attendance.map((a: any) => {
      const dtIn = DateTime.fromISO(a.check_in_at).setZone('Asia/Kolkata');
      const dtOut = a.check_out_at ? DateTime.fromISO(a.check_out_at).setZone('Asia/Kolkata') : null;
      
      return {
        date: dtIn.toFormat('dd/MM/yyyy'),
        month_year: dtIn.toFormat('MMMM yyyy'),
        member_name: a.members?.full_name || '-',
        email: a.members?.email || '-',
        phone: a.members?.phone || '-',
        check_in: dtIn.toFormat('hh:mm a'),
        check_out: dtOut ? dtOut.toFormat('hh:mm a') : '-',
        status: a.check_out_at ? 'Completed' : 'Inside'
      };
    });
  });
