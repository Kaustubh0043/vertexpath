import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import type { Env } from './types';
import { authRouter } from './routes/auth';
import { userRouter } from './routes/user';
import { dashboardRouter } from './routes/dashboard';
import { roadmapRouter } from './routes/roadmaps';
import { chatRouter } from './routes/chat';
import { aiRouter } from './routes/ai';
import { documentRouter } from './routes/documents';

const app = new Hono<{ Bindings: Env }>();

// Middlewares
app.use('*', logger());
app.use(
  '*',
  cors({
    origin: '*',
    allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposeHeaders: ['Content-Length', 'X-Kuma-Revision'],
    maxAge: 86400
  })
);

// Health check
app.get('/', (c) =>
  c.json({
    status: 'healthy',
    service: 'PathPilot Cloudflare Worker Edge Engine',
    version: '3.0.0',
    documentation: '/docs'
  })
);

app.get('/health', (c) => c.text('OK'));

// Route modules
app.route('/api/auth', authRouter);
app.route('/api/user', userRouter);
app.route('/api/dashboard', dashboardRouter);
app.route('/api/roadmaps', roadmapRouter);
app.route('/api/chat', chatRouter);
app.route('/api/ai', aiRouter);
app.route('/api/documents', documentRouter);

export default app;
