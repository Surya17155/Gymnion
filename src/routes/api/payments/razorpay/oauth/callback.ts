import { createFileRoute } from '@tanstack/react-router';
import { supabaseAdmin } from '@/integrations/supabase/client.server';

export const Route = createFileRoute('/api/payments/razorpay/oauth/callback')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const code = url.searchParams.get('code');
        const state = url.searchParams.get('state');
        const error = url.searchParams.get('error');

        const baseUrl = new URL(request.url).origin;
        const targetUrl = `${baseUrl}/dashboard/admin/settings/razorpay`;

        if (error) {
          console.error('Razorpay OAuth error:', error);
          return new Response(null, {
            status: 302,
            headers: { Location: `${targetUrl}?error=access_denied` }
          });
        }

        if (!code || !state) {
          return new Response(null, {
            status: 302,
            headers: { Location: `${targetUrl}?error=invalid_params` }
          });
        }

        // Find the gym that matches this state
        const { data: gyms } = await supabaseAdmin
          .from('gyms')
          .select('id, settings')
          .contains('settings', { razorpay_oauth_state: { state } });

        const gym = gyms?.[0];

        if (!gym) {
          return new Response(null, {
            status: 302,
            headers: { Location: `${targetUrl}?error=invalid_state` }
          });
        }

        const settings = gym.settings as any;
        const storedState = settings.razorpay_oauth_state;

        if (!storedState || storedState.expires_at < Date.now()) {
          return new Response(null, {
            status: 302,
            headers: { Location: `${targetUrl}?error=state_expired` }
          });
        }

        // Exchange code for token
        const clientId = process.env['RAZORPAY_OAUTH_CLIENT_ID']!;
        const clientSecret = process.env['RAZORPAY_OAUTH_CLIENT_SECRET']!;
        const redirectUri = process.env['RAZORPAY_OAUTH_REDIRECT_URI']!;

        try {
          const response = await fetch('https://auth.razorpay.com/token', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
              grant_type: 'authorization_code',
              client_id: clientId,
              client_secret: clientSecret,
              redirect_uri: redirectUri,
              code: code,
            }),
          });

          const tokenData = await response.json();

          if (!response.ok) {
            throw new Error(tokenData.error_description || tokenData.error || 'Failed to exchange token');
          }

          // Store the connection
          await supabaseAdmin
            .from('razorpay_connections')
            .upsert({
              gym_id: gym.id,
              razorpay_account_id: tokenData.public_token || tokenData.merchant_id || 'unknown',
              access_token_encrypted: tokenData.access_token,
              refresh_token_encrypted: tokenData.refresh_token,
              status: 'connected',
              updated_at: new Date().toISOString(),
            }, { onConflict: 'gym_id' });

          // Also update the gym's razorpay_account_id for convenience
          await supabaseAdmin
            .from('gyms')
            .update({ 
              razorpay_account_id: tokenData.public_token || tokenData.merchant_id || 'unknown',
              settings: { ...settings, razorpay_oauth_state: undefined } 
            })
            .eq('id', gym.id);

          return new Response(null, {
            status: 302,
            headers: { Location: `${targetUrl}?success=true` }
          });
        } catch (err: any) {
          console.error('Razorpay Token Exchange Error:', err);
          return new Response(null, {
            status: 302,
            headers: { Location: `${targetUrl}?error=token_exchange_failed` }
          });
        }
      }
    }
  }
});
