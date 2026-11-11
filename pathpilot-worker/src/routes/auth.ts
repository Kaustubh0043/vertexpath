import { Hono } from 'hono';
import bcrypt from 'bcryptjs';
import type { Env } from '../types';
import { signAccessToken, signRefreshToken, verifyToken } from '../utils/jwt';
import { sendOtpEmail } from '../utils/email';

export const authRouter = new Hono<{ Bindings: Env }>();

authRouter.post('/signup', async (c) => {
  const { email, password, fullName } = await c.req.json<{ email?: string; password?: string; fullName?: string }>();
  if (!email || !password || !fullName) {
    return c.json({ message: 'Email, password, and full name are required' }, 400);
  }

  const existing = await c.env.DB.prepare('SELECT id FROM users WHERE email = ?').bind(email.toLowerCase()).first();
  if (existing) {
    return c.json({ message: 'User with this email already exists' }, 409);
  }

  const id = crypto.randomUUID();
  const passwordHash = await bcrypt.hash(password, 10);
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

  await c.env.DB.prepare(
    `INSERT INTO users (id, email, password_hash, full_name, verification_code, verification_code_expires_at, enabled)
     VALUES (?, ?, ?, ?, ?, ?, 0)`
  ).bind(id, email.toLowerCase(), passwordHash, fullName, code, expiresAt).run();

  await sendOtpEmail(email, code, c.env);

  return c.json({
    message: 'verification_required',
    userId: id,
    email: email.toLowerCase(),
    fullName
  }, 201);
});

authRouter.post('/verify', async (c) => {
  const { email, code } = await c.req.json<{ email?: string; code?: string }>();
  if (!email || !code) {
    return c.json({ message: 'Email and verification code are required' }, 400);
  }

  const user = await c.env.DB.prepare(
    'SELECT * FROM users WHERE email = ?'
  ).bind(email.toLowerCase()).first<Record<string, unknown>>();

  if (!user) {
    return c.json({ message: 'User not found' }, 404);
  }

  // Allow generated code or universal development code 123456
  const isMatch = user.verification_code === code || code === '123456';
  if (!isMatch) {
    return c.json({ message: 'Invalid verification code' }, 400);
  }

  await c.env.DB.prepare(
    `UPDATE users SET enabled = 1, verification_code = NULL, verification_code_expires_at = NULL, updated_at = datetime('now') WHERE id = ?`
  ).bind(user.id).run();

  const tokenPayload = {
    sub: user.id as string,
    email: user.email as string,
    fullName: user.full_name as string
  };

  const token = await signAccessToken(tokenPayload, c.env);
  const refreshToken = await signRefreshToken({ sub: user.id as string, email: user.email as string }, c.env);

  return c.json({
    token,
    refreshToken,
    tokenType: 'Bearer',
    userId: user.id,
    email: user.email,
    fullName: user.full_name,
    onboardingCompleted: Boolean(user.onboarding_completed),
    avatarUrl: user.avatar_url || null,
    careerGoal: user.career_goal || null
  });
});

authRouter.post('/login', async (c) => {
  const { email, password } = await c.req.json<{ email?: string; password?: string }>();
  if (!email || !password) {
    return c.json({ message: 'Email and password are required' }, 400);
  }

  const user = await c.env.DB.prepare(
    'SELECT * FROM users WHERE email = ?'
  ).bind(email.toLowerCase()).first<Record<string, unknown>>();

  if (!user) {
    return c.json({ message: 'Invalid credentials' }, 401);
  }

  const passwordValid = await bcrypt.compare(password, user.password_hash as string);
  if (!passwordValid) {
    return c.json({ message: 'Invalid credentials' }, 401);
  }

  if (!user.enabled) {
    return c.json({ message: 'ACCOUNT_NOT_VERIFIED' }, 403);
  }

  const tokenPayload = {
    sub: user.id as string,
    email: user.email as string,
    fullName: user.full_name as string
  };

  const token = await signAccessToken(tokenPayload, c.env);
  const refreshToken = await signRefreshToken({ sub: user.id as string, email: user.email as string }, c.env);

  return c.json({
    token,
    refreshToken,
    tokenType: 'Bearer',
    userId: user.id,
    email: user.email,
    fullName: user.full_name,
    onboardingCompleted: Boolean(user.onboarding_completed),
    avatarUrl: user.avatar_url || null,
    careerGoal: user.career_goal || null
  });
});

authRouter.post('/google', async (c) => {
  const { credential } = await c.req.json<{ credential?: string }>();
  if (!credential) {
    return c.json({ message: 'Google credential token is required' }, 400);
  }

  const googleRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`);
  if (!googleRes.ok) {
    return c.json({ message: 'Invalid Google authentication token' }, 401);
  }

  const payload = (await googleRes.json()) as {
    email?: string;
    name?: string;
    sub?: string;
    picture?: string;
  };

  if (!payload.email) {
    return c.json({ message: 'Google account has no associated email address' }, 400);
  }

  const email = payload.email.toLowerCase();
  let user = await c.env.DB.prepare('SELECT * FROM users WHERE email = ?').bind(email).first<Record<string, unknown>>();

  if (!user) {
    const id = crypto.randomUUID();
    const randomPass = crypto.randomUUID();
    const passwordHash = await bcrypt.hash(randomPass, 10);
    const fullName = payload.name || email.split('@')[0];
    const avatarUrl = payload.picture || null;

    await c.env.DB.prepare(
      `INSERT INTO users (id, email, password_hash, full_name, enabled, avatar_url, onboarding_completed)
       VALUES (?, ?, ?, ?, 1, ?, 0)`
    ).bind(id, email, passwordHash, fullName, avatarUrl).run();

    user = await c.env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(id).first<Record<string, unknown>>();
  } else if (!user.enabled) {
    await c.env.DB.prepare("UPDATE users SET enabled = 1, updated_at = datetime('now') WHERE id = ?").bind(user.id).run();
  }

  const tokenPayload = {
    sub: user!.id as string,
    email: user!.email as string,
    fullName: user!.full_name as string
  };

  const token = await signAccessToken(tokenPayload, c.env);
  const refreshToken = await signRefreshToken({ sub: user!.id as string, email: user!.email as string }, c.env);

  return c.json({
    token,
    refreshToken,
    tokenType: 'Bearer',
    userId: user!.id,
    email: user!.email,
    fullName: user!.full_name,
    onboardingCompleted: Boolean(user!.onboarding_completed),
    avatarUrl: user!.avatar_url || payload.picture || null,
    careerGoal: user!.career_goal || null
  });
});

authRouter.post('/github', async (c) => {
  const { code } = await c.req.json<{ code?: string }>();
  if (!code) {
    return c.json({ message: 'GitHub authorization code is required' }, 400);
  }

  const clientId = c.env.GITHUB_CLIENT_ID || 'Ov23liFtildAp0Qiyj6l';
  const clientSecret = c.env.GITHUB_CLIENT_SECRET || '244ad087f1db12845c8b48b94603ea5963f1d8c5';

  const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json'
    },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      code
    })
  });

  const tokenData = (await tokenRes.json()) as { access_token?: string; error?: string };
  if (!tokenData.access_token) {
    return c.json({ message: tokenData.error || 'Failed to exchange GitHub authorization code' }, 401);
  }

  const userRes = await fetch('https://api.github.com/user', {
    headers: {
      Authorization: `Bearer ${tokenData.access_token}`,
      'User-Agent': 'VertexPath-App'
    }
  });

  if (!userRes.ok) {
    return c.json({ message: 'Failed to fetch GitHub profile' }, 401);
  }

  const githubUser = (await userRes.json()) as {
    login?: string;
    name?: string;
    email?: string;
    avatar_url?: string;
  };

  let email = githubUser.email?.toLowerCase();
  if (!email) {
    try {
      const emailsRes = await fetch('https://api.github.com/user/emails', {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
          'User-Agent': 'VertexPath-App'
        }
      });
      if (emailsRes.ok) {
        const emails = (await emailsRes.json()) as Array<{ email: string; primary: boolean; verified: boolean }>;
        const primary = emails.find((e) => e.primary && e.verified) || emails[0];
        if (primary?.email) email = primary.email.toLowerCase();
      }
    } catch (e) {
      console.warn('Failed to fetch private GitHub emails:', e);
    }
  }

  if (!email) {
    email = `${githubUser.login}@users.noreply.github.com`;
  }

  let user = await c.env.DB.prepare('SELECT * FROM users WHERE email = ?').bind(email).first<Record<string, unknown>>();

  if (!user) {
    const id = crypto.randomUUID();
    const randomPass = crypto.randomUUID();
    const passwordHash = await bcrypt.hash(randomPass, 10);
    const fullName = githubUser.name || githubUser.login || 'GitHub User';
    const avatarUrl = githubUser.avatar_url || null;

    await c.env.DB.prepare(
      `INSERT INTO users (id, email, password_hash, full_name, enabled, avatar_url, onboarding_completed)
       VALUES (?, ?, ?, ?, 1, ?, 0)`
    ).bind(id, email, passwordHash, fullName, avatarUrl).run();

    user = await c.env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(id).first<Record<string, unknown>>();
  } else if (!user.enabled) {
    await c.env.DB.prepare("UPDATE users SET enabled = 1, updated_at = datetime('now') WHERE id = ?").bind(user.id).run();
  }

  const tokenPayload = {
    sub: user!.id as string,
    email: user!.email as string,
    fullName: user!.full_name as string
  };

  const token = await signAccessToken(tokenPayload, c.env);
  const refreshToken = await signRefreshToken({ sub: user!.id as string, email: user!.email as string }, c.env);

  return c.json({
    token,
    refreshToken,
    tokenType: 'Bearer',
    userId: user!.id,
    email: user!.email,
    fullName: user!.full_name,
    onboardingCompleted: Boolean(user!.onboarding_completed),
    avatarUrl: user!.avatar_url || githubUser.avatar_url || null,
    careerGoal: user!.career_goal || null
  });
});

authRouter.post('/refresh', async (c) => {
  const { refreshToken } = await c.req.json<{ refreshToken?: string }>();
  if (!refreshToken) {
    return c.json({ message: 'Refresh token is required' }, 400);
  }

  const payload = await verifyToken(refreshToken, c.env);
  if (!payload) {
    return c.json({ message: 'Invalid or expired refresh token' }, 401);
  }

  const user = await c.env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(payload.sub).first<Record<string, unknown>>();
  if (!user) {
    return c.json({ message: 'User not found' }, 404);
  }

  const newToken = await signAccessToken({
    sub: user.id as string,
    email: user.email as string,
    fullName: user.full_name as string
  }, c.env);

  return c.json({
    token: newToken,
    tokenType: 'Bearer'
  });
});

authRouter.post('/resend-code', async (c) => {
  const { email } = await c.req.json<{ email?: string }>();
  if (!email) return c.json({ message: 'Email is required' }, 400);

  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

  await c.env.DB.prepare(
    `UPDATE users SET verification_code = ?, verification_code_expires_at = ? WHERE email = ?`
  ).bind(code, expiresAt, email.toLowerCase()).run();

  await sendOtpEmail(email, code, c.env);
  return c.json({ message: 'Verification code resent successfully' });
});

authRouter.get('/health', (c) => c.text('OK'));

