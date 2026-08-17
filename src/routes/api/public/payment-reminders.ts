import { createFileRoute } from '@tanstack/react-router';
import { supabaseAdmin } from '@/integrations/supabase/client.server';

export const Route = createFileRoute('/api/public/payment-reminders')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        // Security: Check for a secret key in headers if configured
        // const authHeader = request.headers.get('Authorization');
        // if (authHeader !== `Bearer ${process.env['CRON_SECRET']}`) return new Response('Unauthorized', { status: 401 });

        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowStr = tomorrow.toISOString().split('T')[0];

        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];

        // 1. Find members due tomorrow
        const { data: dueTomorrow } = await supabaseAdmin
          .from('members')
          .select('*, gyms(name)')
          .eq('status', 'active')
          .filter('subscription_ends_at', 'gte', `${tomorrowStr}T00:00:00`)
          .filter('subscription_ends_at', 'lte', `${tomorrowStr}T23:59:59`);

        if (dueTomorrow) {
          for (const member of dueTomorrow) {
             console.log(`[REMINDER] Sending "Due Tomorrow" email to ${member.email} for gym ${(member.gyms as any)?.name}`);
             // In production: sendEmail({ to: member.email, subject: 'Payment Due Tomorrow', ... })
          }
        }

        // 2. Find members whose cycle ended today and haven't paid
        const { data: dueToday } = await supabaseAdmin
          .from('members')
          .select('*, gyms(name)')
          .filter('subscription_ends_at', 'gte', `${todayStr}T00:00:00`)
          .filter('subscription_ends_at', 'lte', `${todayStr}T23:59:59`);
        
        if (dueToday) {
          for (const member of dueToday) {
            // Check if payment already exists for this month
            const monthStr = today.toISOString().substring(0, 7);
            const { data: payment } = await supabaseAdmin
              .from('payments')
              .select('id')
              .eq('member_id', member.id)
              .eq('payment_month', monthStr)
              .eq('status', 'paid')
              .maybeSingle();

            if (!payment) {
              console.log(`[OVERDUE] Sending "Payment Required" email to ${member.email} with link to dashboard`);
              // Update status to overdue
              await supabaseAdmin.from('members').update({ status: 'overdue' }).eq('id', member.id);
            }
          }
        }

        return new Response('ok');
      }
    }
  }
});
