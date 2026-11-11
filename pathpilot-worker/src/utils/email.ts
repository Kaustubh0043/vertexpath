import type { Env } from '../types';

export async function sendOtpEmail(email: string, code: string, env: Env): Promise<boolean> {
  console.log(`[PathPilot OTP] To: ${email} | Code: ${code}`);

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
          html: `<div style="font-family: sans-serif; padding: 20px;">
            <h2>Welcome to VertexPath</h2>
            <p>Your 6-digit email verification code is:</p>
            <h1 style="letter-spacing: 5px; color: #4F46E5;">${code}</h1>
            <p>This code will expire in 15 minutes.</p>
          </div>`
        })
      });
      return res.ok;
    } catch (e) {
      console.error('Failed to send email via Resend:', e);
    }
  }

  // Fallback: logged to worker logs
  return true;
}
