import type { Env } from '../types';

export async function sendOtpEmail(email: string, code: string, env: Env): Promise<boolean> {
  console.log(`[VertexPath OTP] To: ${email} | Code: ${code}`);

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; background-color: #0C0D10; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <div style="background-color: #0C0D10; padding: 40px 16px; min-height: 100%;">
        <div style="max-width: 480px; margin: 0 auto; background-color: #111318; border: 1px solid #282B32; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.6);">
          
          <!-- Header -->
          <div style="padding: 32px 32px 24px 32px; border-bottom: 1px solid #1D2026; text-align: center;">
            <div style="display: inline-block; margin-bottom: 8px;">
              <span style="font-size: 26px; font-weight: 800; color: #C2F84F; letter-spacing: -0.5px;">Vertex<span style="color: #FFFFFF;">Path</span></span>
            </div>
            <div style="display: flex; align-items: center; justify-content: center; gap: 6px;">
              <span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background-color: #C2F84F;"></span>
              <span style="color: #858A94; font-size: 11px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase;">Career Operating System</span>
            </div>
          </div>

          <!-- Body -->
          <div style="padding: 32px 28px;">
            <h2 style="margin: 0 0 12px 0; color: #FFFFFF; font-size: 20px; font-weight: 600; text-align: center; letter-spacing: -0.02em;">Verify your email address</h2>
            <p style="margin: 0 0 24px 0; color: #B8BBC3; font-size: 14px; line-height: 1.6; text-align: center;">
              Welcome to VertexPath. Enter the 6-digit verification code below to confirm your account and access your developer career workspace:
            </p>
            
            <!-- OTP Box -->
            <div style="background: #191B20; border: 1px solid #363A43; border-radius: 12px; padding: 22px 12px; text-align: center; margin-bottom: 24px;">
              <span style="font-family: 'SF Mono', Consolas, Monaco, monospace; font-size: 34px; font-weight: 800; letter-spacing: 10px; color: #C2F84F; display: inline-block; padding-left: 10px;">${code}</span>
            </div>

            <p style="margin: 0 0 8px 0; color: #858A94; font-size: 12px; line-height: 1.5; text-align: center;">
              This verification code expires in <strong style="color: #F5F5F2;">15 minutes</strong>.
            </p>
            <p style="margin: 0; color: #64748B; font-size: 12px; line-height: 1.5; text-align: center;">
              If you did not request this email, please disregard it.
            </p>
          </div>

          <!-- Footer -->
          <div style="padding: 18px 28px; background-color: #0E1014; border-top: 1px solid #1D2026; text-align: center;">
            <p style="margin: 0; color: #555A64; font-size: 11px;">
              Â© 2026 VertexPath. Built for modern software engineers.
            </p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  // 1. Try Brevo if configured
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
