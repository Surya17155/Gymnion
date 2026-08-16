import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const createRazorpayOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) => z.object({
    planId: z.string(),
    gymId: z.string()
  }).parse(data))
  .handler(async ({ data, context }) => {
    // 1. Verify caller is admin of the gym
    const { data: roleData } = await supabaseAdmin
      .from('user_roles')
      .select('role, gym_id')
      .eq('user_id', context.userId)
      .eq('role', 'admin')
      .eq('gym_id', data.gymId)
      .single();

    if (!roleData) throw new Error("Unauthorized: Only gym admins can subscribe");

    // 2. Get plan details
    const { data: plan } = await supabaseAdmin
      .from('global_plans')
      .select('*')
      .eq('id', data.planId)
      .single();

    if (!plan) throw new Error("Plan not found");

    // In a real app, you'd call Razorpay API here using a secret key
    // const razorpay = new Razorpay({ key_id: '...', key_secret: process.env.RAZORPAY_SECRET });
    // const order = await razorpay.orders.create({ amount: plan.price, currency: "INR" });
    
    // For now, we simulate order creation
    const orderId = `order_${Math.random().toString(36).substring(7)}`;
    
    return {
      orderId,
      amount: plan.price,
      currency: "INR",
      key: "rzp_test_placeholder" // Public key would go here
    };
  });

export const verifySubscriptionPayment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) => z.object({
    gymId: z.string(),
    planId: z.string(),
    razorpayOrderId: z.string(),
    razorpayPaymentId: z.string(),
    razorpaySignature: z.string(),
  }).parse(data))
  .handler(async ({ data, context }) => {
    // 1. Verify signatures (omitted for simulation)
    
    // 2. Update Gym subscription
    const trialEndsAt = new Date();
    trialEndsAt.setMonth(trialEndsAt.getMonth() + 1);

    const { error } = await supabaseAdmin
      .from('gyms')
      .update({
        subscription_plan_id: data.planId,
        subscription_ends_at: trialEndsAt.toISOString(),
        plan_tier: 'paid',
        settings: {
          plan_id: data.planId,
          payment_status: 'paid'
        } as any
      })
      .eq('id', data.gymId);

    if (error) throw error;

    return { success: true };
  });
