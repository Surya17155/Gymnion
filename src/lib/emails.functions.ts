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
  
  console.log(`[EMAIL_SERVICE] Sending to ${to}: "${subject}"`);
  
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

export async function sendWelcomeEmail(to: string, ownerName: string, gymName: string) {
  const html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0A0B0A; color: #ffffff; border: 1px solid #1e201d; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
      <div style="background-color: #121411; padding: 40px 20px; text-align: center; border-bottom: 1px solid rgba(183, 255, 30, 0.1);">
        <h1 style="color: #B7FF1E; margin: 0; font-size: 32px; letter-spacing: -1px;">GYMNION</h1>
        <p style="color: #858A7D; margin-top: 10px; font-size: 14px; text-transform: uppercase; tracking: 2px;">The Modern Gym Management Platform</p>
      </div>
      <div style="padding: 40px 30px;">
        <h2 style="font-size: 24px; margin-bottom: 20px; color: #ffffff;">Welcome to the future of gym management, ${ownerName}!</h2>
        <p style="color: #e3e3dd; line-height: 1.6; font-size: 16px;">
          Your account for <strong>${gymName}</strong> has been successfully created. We're thrilled to have you join Gymnion.
        </p>
        <div style="background-color: #121411; border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; padding: 25px; margin: 30px 0;">
          <h3 style="color: #B7FF1E; margin-top: 0; font-size: 18px;">What you can do now:</h3>
          <ul style="color: #e3e3dd; padding-left: 20px; line-height: 1.8;">
            <li>Manage members and track attendance effortlessly</li>
            <li>Handle payments and automated fee reminders</li>
            <li>Get real-time insights into your gym's growth</li>
            <li>Directly integrate Razorpay for seamless collections</li>
          </ul>
        </div>
        <div style="text-align: center; margin-top: 40px;">
          <a href="https://gymnion.lovable.app/dashboard/admin" style="background-color: #B7FF1E; color: #000000; padding: 16px 32px; text-decoration: none; font-weight: bold; border-radius: 12px; font-size: 16px; display: inline-block; box-shadow: 0 4px 14px rgba(183, 255, 30, 0.3);">Access Your Dashboard</a>
        </div>
      </div>
      <div style="background-color: #121411; padding: 20px; text-align: center; border-top: 1px solid rgba(255,255,255,0.05);">
        <p style="font-size: 12px; color: #858A7D; margin: 0;">&copy; 2026 Gymnion. All rights reserved.</p>
      </div>
    </div>
  `;

  return sendEmail({
    to,
    subject: `Welcome to Gymnion - ${gymName}`,
    html
  });
}

export async function sendMemberReminderEmail(member: any, gymName: string, isOverdue: boolean) {
  const subject = isOverdue ? `Action Required: Payment Overdue - ${gymName}` : `Payment Due Tomorrow - ${gymName}`;
  const title = isOverdue ? 'Membership Overdue' : 'Payment Due Tomorrow';
  const message = isOverdue 
    ? `Your subscription at <strong>${gymName}</strong> has expired. Please complete your payment to continue using your gym facilities.`
    : `Your subscription at <strong>${gymName}</strong> is expiring tomorrow. Take care of your renewal to avoid any interruption.`;

  const html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0A0B0A; color: #ffffff; border: 1px solid #1e201d; border-radius: 16px; overflow: hidden;">
      <div style="background-color: #121411; padding: 30px 20px; text-align: center; border-bottom: 2px solid ${isOverdue ? '#ff4444' : '#B7FF1E'};">
        <h2 style="color: ${isOverdue ? '#ff4444' : '#B7FF1E'}; margin: 0; font-size: 24px;">${title}</h2>
      </div>
      <div style="padding: 40px 30px;">
        <p style="font-size: 18px; margin-bottom: 20px;">Hi ${member.full_name},</p>
        <p style="color: #e3e3dd; line-height: 1.6; font-size: 16px;">${message}</p>
        <div style="text-align: center; margin: 40px 0;">
          <a href="https://gymnion.lovable.app/dashboard/m" style="background-color: #B7FF1E; color: #000000; padding: 14px 28px; text-decoration: none; font-weight: bold; border-radius: 10px; font-size: 16px; display: inline-block;">Pay Now Securely</a>
        </div>
        <p style="color: #858A7D; font-size: 14px; text-align: center;">You can pay via UPI, Card, or Netbanking directly through your dashboard.</p>
      </div>
      <div style="background-color: #121411; padding: 20px; text-align: center; font-size: 12px; color: #858A7D;">
        <p>Sent via Gymnion on behalf of ${gymName}</p>
      </div>
    </div>
  `;

  return sendEmail({ to: member.email, subject, html });
}
