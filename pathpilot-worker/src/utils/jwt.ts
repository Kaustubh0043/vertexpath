import { SignJWT, jwtVerify } from 'jose';
import type { Context, Next } from 'hono';
import type { Env, JwtPayload } from '../types';

const DEFAULT_SECRET = '40a2f11812848ab221f7db191a27e3681c15f187a51d8b9d363b8d0c3c6f8a8b';

function getSecretKey(env: Env): Uint8Array {
  const secret = env.JWT_SECRET || DEFAULT_SECRET;
  return new TextEncoder().encode(secret);
}

export async function signAccessToken(payload: { sub: string; email: string; fullName: string }, env: Env): Promise<string> {
  const key = getSecretKey(env);
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1d') // 24 hours
    .sign(key);
}

export async function signRefreshToken(payload: { sub: string; email: string }, env: Env): Promise<string> {
  const key = getSecretKey(env);
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d') // 7 days
    .sign(key);
}

export async function verifyToken(token: string, env: Env): Promise<JwtPayload | null> {
  try {
    const key = getSecretKey(env);
    const { payload } = await jwtVerify(token, key);
    return payload as unknown as JwtPayload;
  } catch {
    return null;
  }
}

export async function authMiddleware(c: Context<{ Bindings: Env; Variables: { user: JwtPayload } }>, next: Next) {
  const authHeader = c.req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized: Missing or invalid token' }, 401);
  }

  const token = authHeader.substring(7);
  const payload = await verifyToken(token, c.env);
  if (!payload) {
    return c.json({ error: 'Unauthorized: Token expired or invalid' }, 401);
  }

  c.set('user', payload);
  await next();
}
