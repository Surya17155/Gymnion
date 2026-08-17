import { createFileRoute } from '@tanstack/react-router';
import { createHmac, timingSafeEqual } from 'crypto';
import { supabaseAdmin } from '@/integrations/supabase/client.server';

export const Route = createFileRoute('/api/public/razorpay-webhook')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const signature = request.headers.get('x-razorpay-signature');
        const body = await request.text();
        const webhookSecret = process.env['RAZORPAY_WEBHOOK_SECRET'];

        if (webhookSecret && signature) {
          const expected = createHmac('sha256', webhookSecret).update(body).digest('hex');
          if (!timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
            return new Response('Invalid signature', { status: 401 });
          }
        }

        const payload = JSON.parse(body);
        const event = payload.event;

        if (event === 'account.app.authorization_revoked') {
          const accountId = payload.account_id;
          if (accountId) {
            await supabaseAdmin
              .from('razorpay_connections')
              .update({ status: 'revoked' })
              .eq('razorpay_account_id', accountId);
            console.log(`[OAUTH_WEBHOOK] Revoked authorization for account ${accountId}`);
          }
        } else if (event === 'payment.captured') {
          const payment = payload.payload.payment.entity;
          const { member_id, gym_id, source } = payment.notes || {};

          if (member_id && gym_id && source === 'member_fee') {
            // Record payment in DB
            await supabaseAdmin.from('payments').insert({
              gym_id,
              member_id,
              amount: payment.amount / 100,
              status: 'paid',
              payment_method: 'razorpay',
              payment_month: new Date().toISOString().substring(0, 7),
              source: 'fee',
              razorpay_payment_id: payment.id,
              razorpay_order_id: payment.order_id
            });

            // Update member status
            const nextMonth = new Date();
            nextMonth.setMonth(nextMonth.getMonth() + 1);
            await supabaseAdmin.from('members')
              .update({ 
                status: 'active',
                subscription_ends_at: nextMonth.toISOString()
              })
              .eq('id', member_id);
              
            console.log(`[PAYMENT_WEBHOOK] Captured payment ${payment.id} for member ${member_id}`);
          }
        }

        return new Response('ok');
      }
    }
  }
});
