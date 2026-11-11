import { Hono } from 'hono';
import type { Env, JwtPayload } from '../types';
import { authMiddleware } from '../utils/jwt';
import { callGemini } from '../utils/ai';

export const chatRouter = new Hono<{ Bindings: Env; Variables: { user: JwtPayload } }>();

chatRouter.use('*', authMiddleware);

chatRouter.get('/conversations', async (c) => {
  const user = c.get('user');
  const conversations = await c.env.DB.prepare(
    'SELECT id, title, created_at as createdAt, updated_at as updatedAt FROM conversations WHERE user_id = ? ORDER BY updated_at DESC'
  ).bind(user.sub).all();

  return c.json(conversations.results);
});

chatRouter.post('/conversations', async (c) => {
  const user = c.get('user');
  const { title = 'New Career Session' } = await c.req.json<{ title?: string }>();

  const id = crypto.randomUUID();
  await c.env.DB.prepare(
    `INSERT INTO conversations (id, user_id, title) VALUES (?, ?, ?)`
  ).bind(id, user.sub, title).run();

  return c.json({ id, title, createdAt: new Date().toISOString() }, 201);
});

chatRouter.get('/conversations/:id/messages', async (c) => {
  const conversationId = c.req.param('id');
  const messages = await c.env.DB.prepare(
    'SELECT id, conversation_id as conversationId, sender, content, created_at as createdAt FROM messages WHERE conversation_id = ? ORDER BY created_at ASC'
  ).bind(conversationId).all();

  return c.json(messages.results);
});

chatRouter.post('/conversations/:id/messages', async (c) => {
  const user = c.get('user');
  const conversationId = c.req.param('id');
  const { content } = await c.req.json<{ content?: string }>();
  if (!content) return c.json({ error: 'Message content is required' }, 400);

  // 1. Save User Message
  const userMsgId = crypto.randomUUID();
  await c.env.DB.prepare(
    `INSERT INTO messages (id, conversation_id, sender, content) VALUES (?, ?, 'USER', ?)`
  ).bind(userMsgId, conversationId, content).run();

  // 2. Load context
  const profile = await c.env.DB.prepare(
    'SELECT career_goal, experience_level, technologies FROM users WHERE id = ?'
  ).bind(user.sub).first<{ career_goal?: string; experience_level?: string; technologies?: string }>();

  const recentHistory = await c.env.DB.prepare(
    'SELECT sender, content FROM messages WHERE conversation_id = ? ORDER BY created_at DESC LIMIT 6'
  ).bind(conversationId).all<{ sender: string; content: string }>();

  let historyContext = '';
  for (const msg of recentHistory.results.reverse()) {
    historyContext += `${msg.sender === 'USER' ? 'User' : 'AI Career Coach'}: ${msg.content}\n`;
  }

  const systemPrompt = `You are VertexPath's Senior AI Career Coach and Principal Engineer.
Provide actionable, concrete engineering mentorship, technical career roadmapping, interview prep, and code critiques.
User Career Goal: ${profile?.career_goal || 'Software Engineer'}
Experience Level: ${profile?.experience_level || 'Mid-Level'}
Core Technologies: ${profile?.technologies || 'Fullstack'}
Use Markdown with code blocks where appropriate.`;

  let aiReplyText: string;
  try {
    aiReplyText = await callGemini(
      `${historyContext}\nAI Career Coach:`,
      c.env,
      false,
      systemPrompt
    );
  } catch {
    aiReplyText = `That's a great question regarding your career trajectory. To make steady progress towards ${profile?.career_goal || 'your goals'}, focus on building hands-on portfolio projects with production best practices (clean architecture, comprehensive tests, and automated edge deployments). How can I help break this down further?`;
  }

  // 3. Save AI Message
  const aiMsgId = crypto.randomUUID();
  await c.env.DB.prepare(
    `INSERT INTO messages (id, conversation_id, sender, content) VALUES (?, ?, 'AI', ?)`
  ).bind(aiMsgId, conversationId, aiReplyText).run();

  await c.env.DB.prepare(
    `UPDATE conversations SET updated_at = datetime('now') WHERE id = ?`
  ).bind(conversationId).run();

  return c.json({
    id: aiMsgId,
    conversationId,
    sender: 'AI',
    content: aiReplyText,
    createdAt: new Date().toISOString()
  });
});

chatRouter.delete('/conversations/:id', async (c) => {
  const conversationId = c.req.param('id');
  await c.env.DB.prepare('DELETE FROM conversations WHERE id = ?').bind(conversationId).run();
  return c.body(null, 204);
});
