import { createFileRoute } from '@tanstack/react-router';
import { supabaseAdmin } from '@/integrations/supabase/client.server';
import { sendEmail } from '@/lib/emails.functions';

export const Route = createFileRoute('/api/public/payment-reminders')({
  server: {
    handlers: {
      GET: async ({ request }) => {
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
             const gymName = (member.gyms as any)?.name || 'your gym';
             await sendEmail({
               to: member.email,
               subject: `Payment Due Tomorrow - ${gymName}`,
               html: `
                 <div style="font-family: sans-serif; max-width: 600px; padding: 20px;">
                   <h2>Payment Due Tomorrow</h2>
                   <p>Hi ${member.full_name},</p>
                   <p>Your subscription at <strong>${gymName}</strong> is expiring tomorrow (${tomorrowStr}).</p>
                   <p>Please pay your fees to continue your membership without interruption.</p>
                   <p><a href="https://gymnion.lovable.app/dashboard/m">Click here to pay now</a></p>
                 </div>
               `
             });
             console.log(`[REMINDER] Sent "Due Tomorrow" email to ${member.email}`);
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
            const monthStr = today.toISOString().substring(0, 7);
            const { data: payment } = await supabaseAdmin
              .from('payments')
              .select('id')
              .eq('member_id', member.id)
              .eq('payment_month', monthStr)
              .eq('status', 'paid')
              .maybeSingle();

            if (!payment) {
              const gymName = (member.gyms as any)?.name || 'your gym';
              await sendEmail({
                to: member.email,
                subject: `Payment Overdue - ${gymName}`,
                html: `
                  <div style="font-family: sans-serif; max-width: 600px; padding: 20px;">
                    <h2 style="color: red;">Membership Overdue</h2>
                    <p>Hi ${member.full_name},</p>
                    <p>Your subscription at <strong>${gymName}</strong> has expired today.</p>
                    <p>Your status has been marked as overdue. Please complete your payment to reactivate your membership.</p>
                    <p><a href="https://gymnion.lovable.app/dashboard/m">Click here to pay now</a></p>
                  </div>
                `
              });
              await supabaseAdmin.from('members').update({ status: 'overdue' }).eq('id', member.id);
              console.log(`[OVERDUE] Sent "Payment Required" email to ${member.email}`);
            }
          }
        }

        return new Response('ok');
      }
    }
  }
});
