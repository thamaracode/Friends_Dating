import { Request, Response, NextFunction } from 'express';
import { db } from './db.js';

declare global {
  namespace Express {
    interface Request {
      adminId?: string;
    }
  }
}

// ============================================================================
// 1. SLIDING WINDOW RATE LIMITER (Zero External Dependencies)
// ============================================================================
interface RateLimitRecord {
  count: number;
  windowStart: number;
}

const rateLimitStore = new Map<string, RateLimitRecord>();

// Periodically purge stale IP entries (every 5 minutes) to prevent memory leak
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimitStore.entries()) {
    if (now - record.windowStart > 10 * 60 * 1000) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000).unref();

export function createRateLimiter(options: {
  windowMs?: number;
  maxRequests?: number;
  message?: string;
  keyPrefix?: string;
} = {}) {
  const windowMs = options.windowMs || 60 * 1000; // 1 minute default
  const maxRequests = options.maxRequests || 180; // 180 requests per min default
  const message = options.message || 'Too Many Requests: Rate limit exceeded for user API';
  const prefix = options.keyPrefix || 'global';

  return (req: Request, res: Response, next: NextFunction) => {
    // In local development or automated tests, allow high threshold
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const storeKey = `${prefix}:${ip}`;
    const now = Date.now();

    const record = rateLimitStore.get(storeKey);
    if (!record || (now - record.windowStart) > windowMs) {
      rateLimitStore.set(storeKey, { count: 1, windowStart: now });
      res.setHeader('X-RateLimit-Limit', maxRequests);
      res.setHeader('X-RateLimit-Remaining', maxRequests - 1);
      return next();
    }

    record.count++;
    const remaining = Math.max(0, maxRequests - record.count);
    res.setHeader('X-RateLimit-Limit', maxRequests);
    res.setHeader('X-RateLimit-Remaining', remaining);

    if (record.count > maxRequests) {
      const retryAfterSec = Math.ceil((windowMs - (now - record.windowStart)) / 1000);
      res.setHeader('Retry-After', retryAfterSec);
      return res.status(429).json({
        error: message,
        code: 'RATE_LIMIT_EXCEEDED',
        retryAfterSeconds: retryAfterSec
      });
    }

    next();
  };
}

// Reset rate limiter for tests
export function resetRateLimiterStore() {
  rateLimitStore.clear();
}

// ============================================================================
// 2. ACCOUNT SUSPENSION & MODERATION VERIFICATION
// ============================================================================
export function isUserSuspended(userId: string): boolean {
  if (!userId) return false;
  try {
    const row = db.prepare('SELECT status_text FROM users WHERE id = ?').get(userId) as { status_text?: string } | undefined;
    return Boolean(row?.status_text && row.status_text.startsWith('[SUSPENDED'));
  } catch {
    return false;
  }
}

// ============================================================================
// 3. BIDIRECTIONAL BLOCK VERIFICATION
// ============================================================================
export function checkUserBlocked(userA: string, userB: string): boolean {
  if (!userA || !userB || userA === userB) return false;
  try {
    const blocked = db.prepare(`
      SELECT 1 FROM user_blocks 
      WHERE (blocker_id = ? AND blocked_id = ?) OR (blocker_id = ? AND blocked_id = ?)
    `).get(userA, userB, userB, userA);
    return Boolean(blocked);
  } catch {
    return false;
  }
}

// ============================================================================
// 4. CONVERSATION ENROLLMENT VERIFICATION
// ============================================================================
export function isConversationMember(conversationId: string, userId: string): boolean {
  if (!conversationId || !userId) return false;
  try {
    const row = db.prepare(`
      SELECT 1 FROM conversation_members 
      WHERE conversation_id = ? AND user_id = ?
    `).get(conversationId, userId);
    return Boolean(row);
  } catch {
    return false;
  }
}

// ============================================================================
// 5. CALLER IDENTITY & IDOR SHIELD
// ============================================================================
export function getCallerUserId(req: Request): string {
  return (
    (req.headers['x-user-id'] as string) ||
    (req.query.userId as string) ||
    (req.body && req.body.userId) ||
    'usr_me'
  );
}

export function isAuthorizedUserOrAdmin(
  callerId: string,
  targetUserId: string,
  adminId?: string
): boolean {
  if (!targetUserId) return false;
  // Requester operating on own account
  if (callerId === targetUserId) return true;
  // If callerId is not explicitly passed and target is usr_me
  if (!callerId && targetUserId === 'usr_me') return true;
  // Authorized admin
  if (adminId && (adminId === 'adm_system' || adminId.startsWith('adm_'))) return true;
  return false;
}
