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
    message: 'User registered successfully. Please verify your email with the OTP code.',
    email: email.toLowerCase()
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

  if (user.verification_code !== code) {
    return c.json({ message: 'Invalid verification code' }, 400);
  }

  const expiresAt = new Date(user.verification_code_expires_at as string).getTime();
  if (Date.now() > expiresAt) {
    return c.json({ message: 'Verification code has expired. Please request a new one.' }, 400);
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
    user: {
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      streakCount: user.streak_count || 0,
      onboardingCompleted: Boolean(user.onboarding_completed)
    }
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
    return c.json({ message: 'Please verify your email address before logging in' }, 403);
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
    user: {
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      streakCount: user.streak_count || 0,
      onboardingCompleted: Boolean(user.onboarding_completed)
    }
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
