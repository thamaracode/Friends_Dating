import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { adminDb } from '../db';
import { AdminCrypto } from '../auth/crypto';
import { requireAdminAuth } from '../auth/middleware';
import { AdminAuditLogger } from '../auth/audit';
import { CONFIG } from '../config';

export const authRouter = Router();

/**
 * Step 1: Admin Login with email + password (and optional inline MFA code).
 */
authRouter.post('/login', (req: Request, res: Response) => {
  const { email, password, mfaCode } = req.body;
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const userAgent = req.headers['user-agent'] || 'unknown';
  const now = Math.floor(Date.now() / 1000);

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required', code: 'INVALID_INPUT' });
  }

  const cleanEmail = String(email).trim().toLowerCase();

  const user = adminDb.prepare(`
    SELECT u.*, r.name as role_name, r.hierarchy_level
    FROM admin_users u
    JOIN admin_roles r ON u.role_id = r.id
    WHERE LOWER(u.email) = ?
  `).get(cleanEmail) as any;

  if (!user) {
    // Log failed attempt
    adminDb.prepare(`
      INSERT INTO admin_login_history (id, admin_id, email, ip_address, user_agent, status, failure_reason, created_at)
      VALUES (?, NULL, ?, ?, ?, 'failed', 'User not found', ?)
    `).run(`hist_${uuidv4().replace(/-/g, '').slice(0, 16)}`, cleanEmail, ip, userAgent, now);

    return res.status(401).json({ error: 'Invalid administrative credentials', code: 'AUTH_FAILED' });
  }

  // Check account lockout status
  if (user.locked_until && user.locked_until > now) {
    const minutesRemaining = Math.ceil((user.locked_until - now) / 60);
    return res.status(423).json({
      error: `Account is temporarily locked due to repeated failed logins. Please retry in ${minutesRemaining} minutes.`,
      code: 'ACCOUNT_LOCKED',
      minutesRemaining
    });
  }

  if (!user.is_active) {
    return res.status(403).json({ error: 'Administrator account is deactivated', code: 'ACCOUNT_DEACTIVATED' });
  }

  // Verify password
  const isValidPassword = AdminCrypto.verifyPassword(password, user.password_hash, user.password_salt);

  if (!isValidPassword) {
    const attempts = user.failed_login_attempts + 1;
    let lockedUntil: number | null = null;

    if (attempts >= CONFIG.MAX_LOGIN_ATTEMPTS) {
      lockedUntil = now + (CONFIG.LOCKOUT_DURATION_MINUTES * 60);
    }

    adminDb.prepare(`
      UPDATE admin_users
      SET failed_login_attempts = ?, locked_until = ?
      WHERE id = ?
    `).run(attempts, lockedUntil, user.id);

    adminDb.prepare(`
      INSERT INTO admin_login_history (id, admin_id, email, ip_address, user_agent, status, failure_reason, created_at)
      VALUES (?, ?, ?, ?, ?, 'failed', 'Incorrect password', ?)
    `).run(`hist_${uuidv4().replace(/-/g, '').slice(0, 16)}`, user.id, cleanEmail, ip, userAgent, now);

    return res.status(401).json({
      error: 'Invalid administrative credentials',
      code: 'AUTH_FAILED',
      attemptsRemaining: Math.max(0, CONFIG.MAX_LOGIN_ATTEMPTS - attempts)
    });
  }

  // Handle Multi-Factor Authentication
  if (user.mfa_enabled) {
    if (!mfaCode) {
      // Issue short-lived challenge token for Step 2
      const challengeToken = AdminCrypto.signAdminToken({
        adminId: user.id,
        email: user.email,
        roleId: user.role_id,
        sessionId: 'challenge'
      }, CONFIG.MFA_CODE_VALIDITY_SECONDS);

      adminDb.prepare(`
        INSERT INTO admin_login_history (id, admin_id, email, ip_address, user_agent, status, failure_reason, created_at)
        VALUES (?, ?, ?, ?, ?, 'mfa_required', 'Awaiting MFA code challenge', ?)
      `).run(`hist_${uuidv4().replace(/-/g, '').slice(0, 16)}`, user.id, cleanEmail, ip, userAgent, now);

      return res.status(200).json({
        mfaRequired: true,
        challengeToken,
        email: user.email,
        message: 'Two-factor authentication code required'
      });
    }

    // Verify provided code
    const isMfaValid = AdminCrypto.verifyTotp(String(mfaCode), user.mfa_secret);
    if (!isMfaValid) {
      adminDb.prepare(`
        INSERT INTO admin_login_history (id, admin_id, email, ip_address, user_agent, status, failure_reason, created_at)
        VALUES (?, ?, ?, ?, ?, 'mfa_failed', 'Invalid MFA code', ?)
      `).run(`hist_${uuidv4().replace(/-/g, '').slice(0, 16)}`, user.id, cleanEmail, ip, userAgent, now);

      return res.status(401).json({ error: 'Invalid two-factor authentication code', code: 'MFA_INVALID' });
    }
  }

  // Authentication succeeded! Reset failed attempts and create session
  adminDb.prepare(`
    UPDATE admin_users
    SET failed_login_attempts = 0, locked_until = NULL, updated_at = ?
    WHERE id = ?
  `).run(now, user.id);

  const sessionId = `sess_${uuidv4().replace(/-/g, '').slice(0, 16)}`;
  const expiresAt = now + CONFIG.JWT_EXPIRES_IN_SECONDS;

  const token = AdminCrypto.signAdminToken({
    adminId: user.id,
    email: user.email,
    roleId: user.role_id,
    sessionId
  });

  const tokenHash = AdminCrypto.hashPassword(token.slice(-16)).hash;

  adminDb.prepare(`
    INSERT INTO admin_sessions (
      id, admin_id, token_hash, ip_address, user_agent, expires_at, created_at, last_active_at, revoked_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NULL)
  `).run(sessionId, user.id, tokenHash, ip, userAgent, expiresAt, now, now);

  adminDb.prepare(`
    INSERT INTO admin_login_history (id, admin_id, email, ip_address, user_agent, status, failure_reason, created_at)
    VALUES (?, ?, ?, ?, ?, 'success', NULL, ?)
  `).run(`hist_${uuidv4().replace(/-/g, '').slice(0, 16)}`, user.id, cleanEmail, ip, userAgent, now);

  AdminAuditLogger.log({
    adminId: user.id,
    adminName: user.full_name,
    action: 'ADMIN_LOGIN',
    targetType: 'SESSION',
    targetId: sessionId,
    ipAddress: ip
  });

  return res.json({
    token,
    admin: {
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      roleId: user.role_id,
      roleName: user.role_name,
      hierarchyLevel: user.hierarchy_level
    },
    session: {
      id: sessionId,
      expiresAt
    }
  });
});

/**
 * Step 2: Verify MFA Challenge
 */
authRouter.post('/verify-mfa', (req: Request, res: Response) => {
  const { challengeToken, mfaCode } = req.body;
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const userAgent = req.headers['user-agent'] || 'unknown';
  const now = Math.floor(Date.now() / 1000);

  if (!challengeToken || !mfaCode) {
    return res.status(400).json({ error: 'Challenge token and MFA code are required', code: 'INVALID_INPUT' });
  }

  const payload = AdminCrypto.verifyAdminToken(challengeToken);
  if (!payload || payload.sessionId !== 'challenge') {
    return res.status(401).json({ error: 'MFA challenge expired or invalid', code: 'CHALLENGE_EXPIRED' });
  }

  const user = adminDb.prepare(`
    SELECT u.*, r.name as role_name, r.hierarchy_level
    FROM admin_users u
    JOIN admin_roles r ON u.role_id = r.id
    WHERE u.id = ?
  `).get(payload.adminId) as any;

  if (!user || !user.is_active) {
    return res.status(403).json({ error: 'Admin account invalid or inactive', code: 'ACCOUNT_INVALID' });
  }

  const isMfaValid = AdminCrypto.verifyTotp(String(mfaCode), user.mfa_secret);
  if (!isMfaValid) {
    adminDb.prepare(`
      INSERT INTO admin_login_history (id, admin_id, email, ip_address, user_agent, status, failure_reason, created_at)
      VALUES (?, ?, ?, ?, ?, 'mfa_failed', 'Invalid MFA verification code', ?)
    `).run(`hist_${uuidv4().replace(/-/g, '').slice(0, 16)}`, user.id, user.email, ip, userAgent, now);

    return res.status(401).json({ error: 'Invalid MFA verification code', code: 'MFA_INVALID' });
  }

  // Create session
  const sessionId = `sess_${uuidv4().replace(/-/g, '').slice(0, 16)}`;
  const expiresAt = now + CONFIG.JWT_EXPIRES_IN_SECONDS;

  const token = AdminCrypto.signAdminToken({
    adminId: user.id,
    email: user.email,
    roleId: user.role_id,
    sessionId
  });

  const tokenHash = AdminCrypto.hashPassword(token.slice(-16)).hash;

  adminDb.prepare(`
    INSERT INTO admin_sessions (
      id, admin_id, token_hash, ip_address, user_agent, expires_at, created_at, last_active_at, revoked_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NULL)
  `).run(sessionId, user.id, tokenHash, ip, userAgent, expiresAt, now, now);

  adminDb.prepare(`
    INSERT INTO admin_login_history (id, admin_id, email, ip_address, user_agent, status, failure_reason, created_at)
    VALUES (?, ?, ?, ?, ?, 'success', NULL, ?)
  `).run(`hist_${uuidv4().replace(/-/g, '').slice(0, 16)}`, user.id, user.email, ip, userAgent, now);

  AdminAuditLogger.log({
    adminId: user.id,
    adminName: user.full_name,
    action: 'ADMIN_LOGIN_MFA',
    targetType: 'SESSION',
    targetId: sessionId,
    ipAddress: ip
  });

  return res.json({
    token,
    admin: {
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      roleId: user.role_id,
      roleName: user.role_name,
      hierarchyLevel: user.hierarchy_level
    },
    session: {
      id: sessionId,
      expiresAt
    }
  });
});

/**
 * Get current admin profile & permissions
 */
authRouter.get('/me', requireAdminAuth, (req: Request, res: Response) => {
  const admin = req.admin!;

  const permissions = adminDb.prepare(`
    SELECT domain, action
    FROM admin_permissions
    WHERE role_id = ?
  `).all(admin.roleId) as { domain: string; action: string }[];

  res.json({
    admin,
    permissions
  });
});

/**
 * Logout & revoke current session
 */
authRouter.post('/logout', requireAdminAuth, (req: Request, res: Response) => {
  const admin = req.admin!;
  const now = Math.floor(Date.now() / 1000);

  adminDb.prepare('UPDATE admin_sessions SET revoked_at = ? WHERE id = ?').run(now, admin.sessionId);

  AdminAuditLogger.log({
    adminId: admin.id,
    adminName: admin.fullName,
    action: 'ADMIN_LOGOUT',
    targetType: 'SESSION',
    targetId: admin.sessionId
  });

  res.json({ success: true, message: 'Administrative session successfully revoked' });
});

/**
 * List active sessions for authenticated admin (or all if super admin)
 */
authRouter.get('/sessions', requireAdminAuth, (req: Request, res: Response) => {
  const admin = req.admin!;
  const now = Math.floor(Date.now() / 1000);

  const query = admin.roleId === 'super_admin'
    ? `SELECT s.*, u.email, u.full_name, r.name as role_name
       FROM admin_sessions s
       JOIN admin_users u ON s.admin_id = u.id
       JOIN admin_roles r ON u.role_id = r.id
       WHERE s.expires_at > ? AND s.revoked_at IS NULL
       ORDER BY s.last_active_at DESC LIMIT 50`
    : `SELECT s.*, u.email, u.full_name, r.name as role_name
       FROM admin_sessions s
       JOIN admin_users u ON s.admin_id = u.id
       JOIN admin_roles r ON u.role_id = r.id
       WHERE s.admin_id = ? AND s.expires_at > ? AND s.revoked_at IS NULL
       ORDER BY s.last_active_at DESC LIMIT 20`;

  const sessions = admin.roleId === 'super_admin'
    ? adminDb.prepare(query).all(now)
    : adminDb.prepare(query).all(admin.id, now);

  res.json({ sessions });
});

/**
 * Revoke specific session
 */
authRouter.post('/revoke-session/:sessionId', requireAdminAuth, (req: Request, res: Response) => {
  const admin = req.admin!;
  const { sessionId } = req.params;
  const now = Math.floor(Date.now() / 1000);

  const session = adminDb.prepare('SELECT * FROM admin_sessions WHERE id = ?').get(sessionId) as any;
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }

  // Non-super-admins can only revoke their own sessions
  if (admin.roleId !== 'super_admin' && session.admin_id !== admin.id) {
    return res.status(403).json({ error: 'Forbidden: Cannot revoke other administrators sessions' });
  }

  adminDb.prepare('UPDATE admin_sessions SET revoked_at = ? WHERE id = ?').run(now, sessionId);

  AdminAuditLogger.log({
    adminId: admin.id,
    adminName: admin.fullName,
    action: 'REVOKE_SESSION',
    targetType: 'SESSION',
    targetId: sessionId
  });

  res.json({ success: true, message: `Session ${sessionId} revoked` });
});

/**
 * View login audit history
 */
authRouter.get('/login-history', requireAdminAuth, (req: Request, res: Response) => {
  const admin = req.admin!;

  const history = admin.roleId === 'super_admin'
    ? adminDb.prepare('SELECT * FROM admin_login_history ORDER BY created_at DESC LIMIT 100').all()
    : adminDb.prepare('SELECT * FROM admin_login_history WHERE admin_id = ? OR email = ? ORDER BY created_at DESC LIMIT 50').all(admin.id, admin.email);

  res.json({ history });
});
