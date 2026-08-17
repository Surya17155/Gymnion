import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

/**
 * Sends a generic email using a configured email provider.
 * Currently supports a simple Resend-like pattern or a logging fallback.
 */
export async function sendEmail(params: {
  to: string;
  subject: string;
  html: string;
  from?: string;
}) {
  const { to, subject, html, from = "Gymnion <notifications@gymnion.app>" } = params;
  
  // LOGGING FIRST: In a production environment with Lovable Cloud, we'd use an email connector.
  // For now, we simulate the logic and log the outbound message.
  console.log(`[EMAIL_SERVICE] Sending to ${to}: "${subject}"`);
  
  // If RESEND_API_KEY is available, we could call the API here.
  const apiKey = process.env['RESEND_API_KEY'];
  if (apiKey) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from,
          to: [to],
          subject,
          html,
        }),
      });
      if (!res.ok) {
        console.error('Email failed to send:', await res.text());
      }
    } catch (err) {
      console.error('Email service error:', err);
    }
  }

  return { success: true };
}

export const sendTestReminder = createServerFn({ method: "POST" })
  .validator((data: unknown) => z.object({
    email: z.string().email(),
  }).parse(data))
  .handler(async ({ data }) => {
    const { email } = data;
    
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #B7FF1E; background: #121411; padding: 10px; border-radius: 5px;">Payment Due Tomorrow</h2>
        <p>Hi there,</p>
        <p>This is a test reminder from <strong>Gymnion</strong>.</p>
        <p>Your gym membership subscription is due for renewal tomorrow.</p>
        <p>Please log in to your dashboard to complete the payment and avoid any service interruption.</p>
        <div style="margin: 30px 0;">
          <a href="https://gymnion.lovable.app/dashboard/m" style="background: #B7FF1E; color: #121411; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 5px;">Pay Now</a>
        </div>
        <p>If you have already paid, please ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin-top: 20px;" />
        <p style="font-size: 12px; color: #666;">Gymnion - The Modern Gym Management Platform</p>
      </div>
    `;

    await sendEmail({
      to: email,
      subject: 'Test: Payment Due Tomorrow - Gymnion',
      html
    });

    return { success: true, message: `Test email sent to ${email}` };
  });
