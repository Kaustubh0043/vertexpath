import { Hono } from 'hono';
import type { Env, JwtPayload } from '../types';
import { authMiddleware } from '../utils/jwt';

export const dashboardRouter = new Hono<{ Bindings: Env; Variables: { user: JwtPayload } }>();

dashboardRouter.use('*', authMiddleware);

dashboardRouter.get('/stats', async (c) => {
  const user = c.get('user');

  const userRecord = await c.env.DB.prepare(
    'SELECT streak_count, last_active_date FROM users WHERE id = ?'
  ).bind(user.sub).first<{ streak_count: number; last_active_date: string | null }>();

  const skills = await c.env.DB.prepare(
    'SELECT id, name, level, target_level as targetLevel FROM user_skills WHERE user_id = ?'
  ).bind(user.sub).all();

  const roadmapsCount = await c.env.DB.prepare(
    'SELECT COUNT(*) as count FROM roadmaps WHERE user_id = ?'
  ).bind(user.sub).first<{ count: number }>();

  return c.json({
    streakCount: userRecord?.streak_count || 0,
    totalSkills: skills.results.length,
    activeRoadmaps: roadmapsCount?.count || 0,
    skills: skills.results.map((s: any) => ({
      id: s.id,
      name: s.name,
      skillName: s.name,
      level: s.level,
      targetLevel: s.targetLevel,
      progressPercentage: Math.min(100, Math.round(((s.level || 1) / (s.targetLevel || 5)) * 100))
    }))
  });
});

dashboardRouter.post('/skills', async (c) => {
  const user = c.get('user');
  const body = await c.req.json<{ name?: string; skillName?: string; level?: number; targetLevel?: number; progressPercentage?: number }>();
  const name = body.name || body.skillName;
  if (!name || !name.trim()) return c.json({ error: 'Skill name is required' }, 400);

  const progress = body.progressPercentage !== undefined ? body.progressPercentage : 50;
  const level = body.level || Math.max(1, Math.min(5, Math.round((progress / 100) * 5)));
  const targetLevel = body.targetLevel || 5;

  const existing = await c.env.DB.prepare(
    'SELECT id FROM user_skills WHERE user_id = ? AND LOWER(name) = LOWER(?)'
  ).bind(user.sub, name.trim()).first<{ id: string }>();

  if (existing) {
    await c.env.DB.prepare(
      'UPDATE user_skills SET level = ?, target_level = ? WHERE id = ?'
    ).bind(level, targetLevel, existing.id).run();
  } else {
    const id = crypto.randomUUID();
    await c.env.DB.prepare(
      'INSERT INTO user_skills (id, user_id, name, level, target_level) VALUES (?, ?, ?, ?, ?)'
    ).bind(id, user.sub, name.trim(), level, targetLevel).run();
  }

  return c.json({ success: true, name: name.trim(), skillName: name.trim(), level, targetLevel, progressPercentage: progress });
});

dashboardRouter.post('/streak', async (c) => {
  const user = c.get('user');
  const today = new Date().toISOString().split('T')[0];

  const current = await c.env.DB.prepare(
    'SELECT streak_count, last_active_date FROM users WHERE id = ?'
  ).bind(user.sub).first<{ streak_count: number; last_active_date: string | null }>();

  if (current?.last_active_date !== today) {
    const newStreak = (current?.streak_count || 0) + 1;
    await c.env.DB.prepare(
      'UPDATE users SET streak_count = ?, last_active_date = ? WHERE id = ?'
    ).bind(newStreak, today, user.sub).run();
  }

  return c.json({ success: true });
});

