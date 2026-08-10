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
