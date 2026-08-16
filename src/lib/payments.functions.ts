import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import Razorpay from "razorpay";
import { createHmac } from "crypto";

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

    // 3. Initialize Razorpay (using test keys from env or placeholders for now)
    const keyId = process.env['VITE_RAZORPAY_KEY_ID'] || "rzp_test_placeholder";
    const keySecret = process.env['RAZORPAY_KEY_SECRET'];

    if (!keySecret) {
      console.warn("RAZORPAY_KEY_SECRET missing, using simulation mode");
      const orderId = `order_sim_${Math.random().toString(36).substring(7)}`;
      return {
        orderId,
        amount: plan.price,
        currency: "INR",
        key: keyId,
        isSimulated: true
      };
    }

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret
    });

    const order = await razorpay.orders.create({
      amount: plan.price, // Price is already in paise (lowest currency unit)
      currency: "INR",
      receipt: `receipt_${data.gymId.substring(0, 8)}`,
      notes: {
        gym_id: data.gymId,
        plan_id: data.planId
      }
    });

    return {
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: keyId,
      isSimulated: false
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
    // 1. Verify Signature
    const keySecret = process.env['RAZORPAY_KEY_SECRET'];
    
    if (keySecret) {
      const generated_signature = createHmac('sha256', keySecret)
        .update(data.razorpayOrderId + "|" + data.razorpayPaymentId)
        .digest('hex');

      if (generated_signature !== data.razorpaySignature) {
        throw new Error("Invalid payment signature");
      }
    } else {
      console.warn("RAZORPAY_KEY_SECRET missing, bypassing signature verification for simulation");
    }

    // Fetch plan details to get the price and name for audit
    const { data: plan } = await supabaseAdmin
      .from('global_plans')
      .select('*')
      .eq('id', data.planId)
      .single();

    if (!plan) throw new Error("Plan not found during verification");
    
    // 2. Update Gym subscription (Extend by 1 month)
    const subscriptionEndsAt = new Date();
    subscriptionEndsAt.setMonth(subscriptionEndsAt.getMonth() + 1);

    const { error } = await supabaseAdmin
      .from('gyms')
      .update({
        subscription_plan_id: data.planId,
        subscription_ends_at: subscriptionEndsAt.toISOString(),
        plan_tier: 'paid',
        settings: {
          plan_id: data.planId,
          payment_status: 'paid',
          last_payment_id: data.razorpayPaymentId,
          last_order_id: data.razorpayOrderId,
          plan_name: plan.name
        } as any
      })
      .eq('id', data.gymId);

    if (error) throw error;

    // 3. Record in payments table for audit
    await supabaseAdmin
      .from('payments')
      .insert({
        gym_id: data.gymId,
        member_id: context.userId, // Using admin userId as surrogate member_id for platform payments
        amount: plan.price,
        status: 'paid',
        payment_method: 'razorpay',
        payment_month: new Date().toISOString().substring(0, 7),
        source: 'subscription',
        razorpay_order_id: data.razorpayOrderId,
        razorpay_payment_id: data.razorpayPaymentId,
        razorpay_signature: data.razorpaySignature
      });

    return { success: true };
  });
