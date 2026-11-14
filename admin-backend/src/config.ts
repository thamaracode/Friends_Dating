import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

export const CONFIG = {
  PORT: parseInt(process.env.ADMIN_PORT || '3002', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  JWT_SECRET: process.env.ADMIN_JWT_SECRET || 'soulverse-hyper-secure-admin-secret-key-994182-v1',
  JWT_EXPIRES_IN_SECONDS: 8 * 60 * 60, // 8 hours
  MFA_CODE_VALIDITY_SECONDS: 5 * 60, // 5 minutes
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION_MINUTES: 15,
  RATE_LIMIT_WINDOW_MS: 60 * 1000, // 1 minute
  RATE_LIMIT_MAX_REQUESTS: 120, // 120 requests per minute
  CORS_ORIGIN: process.env.ADMIN_CORS_ORIGIN || '*',
  DB_PATH: process.env.DB_PATH || path.resolve(__dirname, '../../data.db'),
  IP_RESTRICTIONS_ENABLED: process.env.ADMIN_IP_RESTRICTIONS === 'true',
  ALLOWED_IPS: (process.env.ADMIN_ALLOWED_IPS || '127.0.0.1,::1').split(',').map(s => s.trim())
};
