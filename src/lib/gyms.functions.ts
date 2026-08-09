import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { regenerateGymCode } from "./gyms.server";

export const regenerateGymQR = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) => z.string().parse(data))
  .handler(async ({ data: gymId }) => {
    return await regenerateGymCode(gymId);
  });
