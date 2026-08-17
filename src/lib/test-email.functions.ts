import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { sendWelcomeEmail } from "./emails.functions";

export const triggerTestWelcomeEmail = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ email: z.string().email() }).parse(d))
  .handler(async ({ data }) => {
    console.log(`Manually triggering test welcome email for ${data.email}`);
    const res = await sendWelcomeEmail(data.email, "Test User", "Test Gym");
    console.log("Welcome email result:", JSON.stringify(res));
    return res;
  });
