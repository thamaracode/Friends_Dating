import { Request, Response, NextFunction } from 'express';
import { adminDb } from '../db';
import { AdminCrypto } from './crypto';
import { CONFIG } from '../config';

export interface AuthenticatedAdmin {
  id: string;
  email: string;
  fullName: string;
  roleId: string;
  roleName: string;
  hierarchyLevel: number;
  sessionId: string;
}

declare global {
  namespace Express {
    interface Request {
      admin?: AuthenticatedAdmin;
    }
  }
}

/**
 * Validates the Bearer token in Authorization header, checks session validity in database,
 * updates last activity timestamp, and attaches verified admin context to Request.
 */
export function requireAdminAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Unauthorized: Missing or malformed administrative authorization token',
      code: 'AUTH_TOKEN_MISSING'
    });
  }

  const token = authHeader.substring(7).trim();
  const payload = AdminCrypto.verifyAdminToken(token);

  if (!payload) {
    return res.status(401).json({
      error: 'Unauthorized: Invalid or expired administrative token',
      code: 'AUTH_TOKEN_INVALID'
    });
  }

  const now = Math.floor(Date.now() / 1000);

  // Check database session record to ensure session was not revoked
  const session = adminDb.prepare(`
    SELECT s.id, s.admin_id, s.revoked_at, s.expires_at,
           u.email, u.full_name, u.role_id, u.is_active,
           r.name as role_name, r.hierarchy_level
    FROM admin_sessions s
    JOIN admin_users u ON s.admin_id = u.id
    JOIN admin_roles r ON u.role_id = r.id
    WHERE s.id = ? AND s.admin_id = ?
  `).get(payload.sessionId, payload.adminId) as any;

  if (!session) {
    return res.status(401).json({
      error: 'Unauthorized: Administrative session does not exist',
      code: 'SESSION_NOT_FOUND'
    });
  }

  if (session.revoked_at) {
    return res.status(401).json({
      error: 'Unauthorized: Administrative session has been revoked',
      code: 'SESSION_REVOKED'
    });
  }

  if (session.expires_at < now) {
    return res.status(401).json({
      error: 'Unauthorized: Administrative session has expired',
      code: 'SESSION_EXPIRED'
    });
  }

  if (!session.is_active) {
    return res.status(403).json({
      error: 'Forbidden: Administrator account is currently inactive or suspended',
      code: 'ACCOUNT_INACTIVE'
    });
  }

  // Update session touch timestamp asynchronously
  adminDb.prepare('UPDATE admin_sessions SET last_active_at = ? WHERE id = ?').run(now, session.id);

  req.admin = {
    id: session.admin_id,
    email: session.email,
    fullName: session.full_name,
    roleId: session.role_id,
    roleName: session.role_name,
    hierarchyLevel: session.hierarchy_level,
    sessionId: session.id
  };

  next();
}

/**
 * Checks whether the authenticated admin has one of the specified roles or is a super_admin.
 */
export function requireAdminRole(allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.admin) {
      return res.status(401).json({ error: 'Unauthorized', code: 'UNAUTHORIZED' });
    }

    if (req.admin.roleId === 'super_admin' || allowedRoles.includes(req.admin.roleId)) {
      return next();
    }

    return res.status(403).json({
      error: `Forbidden: Role '${req.admin.roleName}' is not authorized to access this resource`,
      code: 'FORBIDDEN_ROLE',
      requiredRoles: allowedRoles
    });
  };
}

/**
 * Fine-grained RBAC permission middleware matching domain and action against admin_permissions table.
 */
export function requireAdminPermission(domain: string, action: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.admin) {
      return res.status(401).json({ error: 'Unauthorized', code: 'UNAUTHORIZED' });
    }

    // Super Admin has unrestricted access across all domains
    if (req.admin.roleId === 'super_admin') {
      return next();
    }

    const hasPermission = adminDb.prepare(`
      SELECT 1 FROM admin_permissions
      WHERE role_id = ?
        AND (domain = ? OR domain = '*')
        AND (action = ? OR action = '*')
    `).get(req.admin.roleId, domain, action);

    if (hasPermission) {
      return next();
    }

    return res.status(403).json({
      error: `Forbidden: Insufficient administrative privileges for domain '${domain}' and action '${action}'`,
      code: 'FORBIDDEN_PERMISSION',
      requiredPermission: { domain, action }
    });
  };
}

/**
 * Sliding window IP rate limiter middleware.
 */
const rateLimitStore = new Map<string, { count: number; windowStart: number }>();

export function rateLimiter(windowMs: number = CONFIG.RATE_LIMIT_WINDOW_MS, maxRequests: number = CONFIG.RATE_LIMIT_MAX_REQUESTS) {
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();

    const record = rateLimitStore.get(ip);
    if (!record || (now - record.windowStart) > windowMs) {
      rateLimitStore.set(ip, { count: 1, windowStart: now });
      return next();
    }

    record.count++;
    if (record.count > maxRequests) {
      return res.status(429).json({
        error: 'Too Many Requests: Rate limit exceeded for administrative API',
        code: 'RATE_LIMIT_EXCEEDED',
        retryAfterMs: windowMs - (now - record.windowStart)
      });
    }

    next();
  };
}

/**
 * Optional IP allowlist restriction middleware.
 */
export function ipRestrictionMiddleware(req: Request, res: Response, next: NextFunction) {
  if (!CONFIG.IP_RESTRICTIONS_ENABLED) {
    return next();
  }

  const clientIp = req.ip || req.socket.remoteAddress || '';
  const isAllowed = CONFIG.ALLOWED_IPS.some(allowed => clientIp.includes(allowed) || allowed === '*');

  if (!isAllowed) {
    return res.status(403).json({
      error: 'Forbidden: IP address not authorized to access administrative console',
      code: 'IP_NOT_ALLOWED'
    });
  }

  next();
}
