import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import Razorpay from "razorpay";


const OAUTH_STATE_EXPIRY = 15 * 60 * 1000; // 15 minutes

export const initiateRazorpayOAuth = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const userId = context.userId;
    const clientId = process.env['RAZORPAY_OAUTH_CLIENT_ID'];
    const redirectUri = process.env['RAZORPAY_OAUTH_REDIRECT_URI'];

    if (!clientId || !redirectUri) {
      throw new Error("Razorpay OAuth is not configured on the server.");
    }

    // Get gym ID for this user
    const { data: adminData } = await context.supabase
      .from('user_roles')
      .select('gym_id')
      .eq('user_id', userId)
      .eq('role', 'admin')
      .single();

    if (!adminData?.gym_id) throw new Error("Gym admin record not found.");

    // Generate a secure random state
    const state = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    
    // Store state in a temp table or metadata? 
    // For simplicity in this demo environment, we'll store it in a dedicated table if we had one, 
    // or use a secure cookie. Since we are in TanStack Start, we can use a server function to initiate.
    
    // Use a temporary record in settings to verify state on callback
    const settings = (gym?.settings as any) || {};
    settings.razorpay_oauth_state = {
      state,
      expires_at: Date.now() + OAUTH_STATE_EXPIRY
    };

    await supabaseAdmin
      .from('gyms')
      .update({ settings })
      .eq('id', adminData.gym_id);


    // Build Razorpay OAuth URL
    // Scope should be 'read_write' or as needed
    const razorpayAuthUrl = `https://auth.razorpay.com/authorize?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=read_write&state=${state}`;

    return { url: razorpayAuthUrl };
  });

export const getRazorpayConnectionStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const userId = context.userId;
    
    const { data: adminData } = await context.supabase
      .from('user_roles')
      .select('gym_id')
      .eq('user_id', userId)
      .eq('role', 'admin')
      .single();

    if (!adminData?.gym_id) return { connected: false };

    const { data: connection } = await context.supabase
      .from('razorpay_connections')
      .select('status, razorpay_account_id, connected_at')
      .eq('gym_id', adminData.gym_id)
      .single();

    return {
      connected: !!connection && connection.status === 'connected',
      accountId: connection?.razorpay_account_id ? `acc_***${connection.razorpay_account_id.slice(-4)}` : null,
      connectedAt: connection?.connected_at
    };
  });

export const disconnectRazorpay = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const userId = context.userId;
    
    const { data: adminData } = await context.supabase
      .from('user_roles')
      .select('gym_id')
      .eq('user_id', userId)
      .eq('role', 'admin')
      .single();

    if (!adminData?.gym_id) throw new Error("Gym admin not found");

    // Revoke locally
    const { error } = await supabaseAdmin
      .from('razorpay_connections')
      .delete()
      .eq('gym_id', adminData.gym_id);

    // Also clear the legacy razorpay_account_id on gyms table
    await supabaseAdmin
      .from('gyms')
      .update({ razorpay_account_id: null })
      .eq('id', adminData.gym_id);

    if (error) throw error;
    return { success: true };
  });
