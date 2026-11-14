import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { CONFIG } from './config';
import { initAdminDatabase } from './db';
import { authRouter } from './routes/auth.routes';
import { featuresRouter } from './routes/features.routes';
import { usersRouter } from './routes/users.routes';
import { aiRouter } from './routes/ai.routes';
import { quotesRouter } from './routes/quotes.routes';
import { systemRouter } from './routes/system.routes';
import { rateLimiter, ipRestrictionMiddleware } from './auth/middleware';

export const app = express();

// Initialize Database Schema & Seed Data
initAdminDatabase();

// Security & Parsing Middleware
app.use(cors({
  origin: CONFIG.CORS_ORIGIN === '*' ? true : CONFIG.CORS_ORIGIN.split(',').map(s => s.trim()),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json({ limit: '5mb' }));

// Global Rate Limiter & IP Restrictions
app.use(rateLimiter());
app.use(ipRestrictionMiddleware);

// Public Health Probe
app.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'OK',
    service: 'soulverse-admin-api',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Admin Sub-routers (v1)
app.use('/api/v1/admin/auth', authRouter);
app.use('/api/v1/admin/features', featuresRouter);
app.use('/api/v1/admin/users', usersRouter);
app.use('/api/v1/admin/ai', aiRouter);
app.use('/api/v1/admin/quotes', quotesRouter);
app.use('/api/v1/admin/system', systemRouter);

// Centralized 404 Handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Admin API endpoint not found', code: 'NOT_FOUND' });
});

// Centralized Error Handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[AdminAPI Error]', err);
  res.status(500).json({
    error: 'Internal administrative server error',
    code: 'SERVER_ERROR',
    message: CONFIG.NODE_ENV === 'development' ? err.message : undefined
  });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(CONFIG.PORT, () => {
    console.log(`⚡ Soulverse Dedicated Admin API running on http://127.0.0.1:${CONFIG.PORT}`);
    console.log(`🔒 Management endpoints mounted at http://127.0.0.1:${CONFIG.PORT}/api/v1/admin`);
  });
}
