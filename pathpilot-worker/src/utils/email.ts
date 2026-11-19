import type { Env } from '../types';

export async function sendOtpEmail(email: string, code: string, env: Env): Promise<boolean> {
  console.log(`[PathPilot OTP] To: ${email} | Code: ${code}`);

  const htmlContent = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 500px; margin: 0 auto; background-color: #0B0D13; color: #FFFFFF; padding: 32px; border-radius: 12px; border: 1px solid #1F2433;">
      <div style="margin-bottom: 24px;">
        <h1 style="color: #55D39A; font-size: 24px; font-weight: 800; margin: 0; letter-spacing: -0.5px;">VertexPath</h1>
        <p style="color: #8E9BAE; font-size: 13px; margin-top: 4px;">AI Career Operating System</p>
      </div>
      <h2 style="font-size: 18px; font-weight: 600; margin: 0 0 12px 0;">Verify your email address</h2>
      <p style="color: #8E9BAE; font-size: 14px; line-height: 1.5; margin: 0 0 24px 0;">
        Use the 6-digit verification code below to activate your account and start your personalized career track:
      </p>
      <div style="background-color: #161A26; border: 1px solid #283046; border-radius: 8px; padding: 20px; text-align: center; margin-bottom: 24px;">
        <span style="font-family: monospace; font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #55D39A;">${code}</span>
      </div>
      <p style="color: #64748B; font-size: 12px; margin: 0;">
        This code expires in 15 minutes. If you did not request this, please ignore this email.
      </p>
    </div>
  `;

  // 1. Try Brevo if configured (allows sending to any address free without domain verification)
  if (env.BREVO_API_KEY) {
    try {
      const res = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'api-key': env.BREVO_API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sender: { name: 'VertexPath', email: 'pathpilot.ai.info@gmail.com' },
          to: [{ email }],
          subject: `${code} is your VertexPath Verification Code`,
          htmlContent
        })
      });
      if (res.ok) return true;
      const err = await res.text();
      console.error('Brevo delivery error:', err);
    } catch (e) {
      console.error('Failed to send email via Brevo:', e);
    }
  }

  // 2. Try Resend if configured
  if (env.RESEND_API_KEY) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${env.RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: 'VertexPath <onboarding@resend.dev>',
          to: [email],
          subject: `${code} is your VertexPath Verification Code`,
          html: htmlContent
        })
      });
      if (res.ok) return true;
      const err = await res.text();
      console.error('Resend delivery error:', err);
    } catch (e) {
      console.error('Failed to send email via Resend:', e);
    }
  }

  return true;
}
