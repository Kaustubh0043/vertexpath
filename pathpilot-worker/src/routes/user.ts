import { Hono } from 'hono';
import type { Env, JwtPayload } from '../types';
import { authMiddleware } from '../utils/jwt';

export const userRouter = new Hono<{ Bindings: Env; Variables: { user: JwtPayload } }>();

userRouter.use('*', authMiddleware);

userRouter.get('/profile', async (c) => {
  const user = c.get('user');
  const record = await c.env.DB.prepare(
    'SELECT * FROM users WHERE id = ?'
  ).bind(user.sub).first<Record<string, unknown>>();

  if (!record) {
    return c.json({ error: 'User not found' }, 404);
  }

  return c.json({
    onboardingCompleted: Boolean(record.onboarding_completed),
    careerGoal: record.career_goal,
    customCareerGoal: record.custom_career_goal,
    experienceLevel: record.experience_level,
    technologies: record.technologies,
    careerObjective: record.career_objective,
    skillGaps: record.skill_gaps,
    weeklyCommitment: record.weekly_commitment,
    optionalLearningStyle: record.optional_learning_style,
    optionalJobPreference: record.optional_job_preference,
    avatarUrl: record.avatar_url,
    onboardingCompletedAt: record.onboarding_completed_at
  });
});

userRouter.post('/profile', async (c) => {
  const user = c.get('user');
  const body = await c.req.json<Record<string, unknown>>();

  const current = await c.env.DB.prepare(
    'SELECT * FROM users WHERE id = ?'
  ).bind(user.sub).first<Record<string, unknown>>();

  if (!current) {
    return c.json({ error: 'User not found' }, 404);
  }

  const careerGoal = body.careerGoal ?? current.career_goal;
  const customCareerGoal = body.customCareerGoal ?? current.custom_career_goal;
  const experienceLevel = body.experienceLevel ?? current.experience_level;
  const technologies = body.technologies ?? current.technologies;
  const careerObjective = body.careerObjective ?? current.career_objective;
  const skillGaps = body.skillGaps ?? current.skill_gaps;
  const weeklyCommitment = body.weeklyCommitment ?? current.weekly_commitment;
  const optionalLearningStyle = body.optionalLearningStyle ?? current.optional_learning_style;
  const optionalJobPreference = body.optionalJobPreference ?? current.optional_job_preference;
  const avatarUrl = body.avatarUrl ?? current.avatar_url;

  let onboardingCompleted = current.onboarding_completed;
  let onboardingCompletedAt = current.onboarding_completed_at;

  if (body.onboardingCompleted !== undefined) {
    onboardingCompleted = body.onboardingCompleted ? 1 : 0;
    if (body.onboardingCompleted && !current.onboarding_completed_at) {
      onboardingCompletedAt = new Date().toISOString();
    }
  }

  await c.env.DB.prepare(`
    UPDATE users SET
      career_goal = ?,
      custom_career_goal = ?,
      experience_level = ?,
      technologies = ?,
      career_objective = ?,
      skill_gaps = ?,
      weekly_commitment = ?,
      optional_learning_style = ?,
      optional_job_preference = ?,
      avatar_url = ?,
      onboarding_completed = ?,
      onboarding_completed_at = ?,
      updated_at = datetime('now')
    WHERE id = ?
  `).bind(
    careerGoal,
    customCareerGoal,
    experienceLevel,
    technologies,
    careerObjective,
    skillGaps,
    weeklyCommitment,
    optionalLearningStyle,
    optionalJobPreference,
    avatarUrl,
    onboardingCompleted,
    onboardingCompletedAt,
    user.sub
  ).run();

  return c.json({
    onboardingCompleted: Boolean(onboardingCompleted),
    careerGoal,
    customCareerGoal,
    experienceLevel,
    technologies,
    careerObjective,
    skillGaps,
    weeklyCommitment,
    optionalLearningStyle,
    optionalJobPreference,
    avatarUrl,
    onboardingCompletedAt
  });
});
