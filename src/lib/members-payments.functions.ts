import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import Razorpay from "razorpay";

export const createMemberPaymentOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) => z.object({
    memberId: z.string()
  }).parse(data))
  .handler(async ({ data, context }) => {
    const { data: member } = await supabaseAdmin
      .from('members')
      .select('*, gyms(*), fee_plans(*)')
      .eq('id', data.memberId)
      .single();

    if (!member || !member.gyms) throw new Error("Member or Gym not found");
    
    const keyId = process.env['RAZORPAY_KEY_ID'];
    const keySecret = process.env['RAZORPAY_KEY_SECRET'];

    if (!keyId || !keySecret) throw new Error("Payment service unavailable");

    const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });
    
    const amount = member.fee_plans?.amount || 0;
    if (amount <= 0) throw new Error("Invalid payment amount");

    const orderOptions: any = {
      amount: amount * 100,
      currency: "INR",
      receipt: `rcpt_mem_${member.id.substring(0,8)}`,
      notes: {
        member_id: member.id,
        gym_id: member.gym_id,
        source: 'member_fee'
      }
    };

    const order = await razorpay.orders.create(orderOptions);

    return {
      orderId: order.id,
      amount: order.amount,
      key: keyId,
      gymName: member.gyms.name,
      razorpayAccountId: member.gyms.razorpay_account_id
    };
  });

export const updateGymRazorpayAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) => z.object({
    gymId: z.string(),
    accountId: z.string()
  }).parse(data))
  .handler(async ({ data, context }) => {
    const { error } = await supabaseAdmin
      .from('gyms')
      .update({ razorpay_account_id: data.accountId })
      .eq('id', data.gymId);
    
    if (error) throw error;
    return { success: true };
  });
