import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { db } from '../db';
import { sendError } from './apiResponse';

export function createRequestHash(method: string, path: string, body: any): string {
  const payloadString = `${method}:${path}:${JSON.stringify(body || {})}`;
  return crypto.createHash('sha256').update(payloadString).digest('hex');
}

export function idempotencyMiddleware(ttlSeconds: number = 86400) {
  return (req: Request, res: Response, next: NextFunction) => {
    // Only apply to state-mutating requests (POST, PUT, PATCH, DELETE)
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
      return next();
    }

    const idempotencyKey = (req.headers['idempotency-key'] || req.headers['x-idempotency-key']) as string;
    if (!idempotencyKey) {
      // Optional header: if not provided, execute normally
      return next();
    }

    const userId = (req.headers['x-user-id'] as string) || (req.body && req.body.userId) || 'usr_me';
    const requestHash = createRequestHash(req.method, req.path, req.body);
    const now = Date.now();

    try {
      const existing = db.prepare(`
        SELECT * FROM idempotency_keys WHERE key = ?
      `).get(idempotencyKey) as any;

      if (existing) {
        // If expired, purge and continue
        if (existing.expires_at <= now) {
          db.prepare('DELETE FROM idempotency_keys WHERE key = ?').run(idempotencyKey);
        } else {
          // Verify hash
          if (existing.request_hash !== requestHash) {
            return sendError(
              res,
              'IDEMPOTENCY_CONFLICT',
              'Idempotency key was previously used with a different request payload or endpoint.',
              409
            );
          }

          // Replay cached response
          let parsedBody = existing.response_body;
          try {
            parsedBody = JSON.parse(existing.response_body);
          } catch {
            // Keep as string
          }

          res.setHeader('X-Cache-Lookup', 'IDEMPOTENT_REPLAY');
          return res.status(existing.response_status).json(parsedBody);
        }
      }

      // Intercept response to store result
      const originalJson = res.json.bind(res);
      res.json = (body: any): Response => {
        // Only cache successful or client validation responses (not 5xx errors)
        if (res.statusCode < 500) {
          try {
            const bodyStr = typeof body === 'string' ? body : JSON.stringify(body);
            db.prepare(`
              INSERT OR REPLACE INTO idempotency_keys (
                key, user_id, request_path, request_hash, response_status, response_headers_json, response_body, created_at, expires_at
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `).run(
              idempotencyKey,
              userId,
              req.path,
              requestHash,
              res.statusCode,
              '{}',
              bodyStr,
              now,
              now + ttlSeconds * 1000
            );
          } catch (e) {
            console.warn('Could not persist idempotency record:', e);
          }
        }
        return originalJson(body);
      };

      next();
    } catch (err) {
      console.error('Idempotency middleware error:', err);
      next();
    }
  };
}

export function cleanupExpiredIdempotencyKeys(): number {
  try {
    const now = Date.now();
    const result = db.prepare('DELETE FROM idempotency_keys WHERE expires_at <= ?').run(now);
    return result.changes;
  } catch {
    return 0;
  }
}
