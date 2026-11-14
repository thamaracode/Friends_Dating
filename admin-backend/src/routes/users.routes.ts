import { Router, Request, Response } from 'express';
import { adminDb } from '../db';
import { requireAdminAuth, requireAdminPermission } from '../auth/middleware';
import { AdminAuditLogger } from '../auth/audit';

export const usersRouter = Router();

usersRouter.use(requireAdminAuth);

/**
 * 1. Paginated list of users with search and filter
 */
usersRouter.get('/', requireAdminPermission('users', 'read'), (req: Request, res: Response) => {
  const { search = '', filter = 'all', page = '1', limit = '20' } = req.query;
  const pageNum = Math.max(1, parseInt(String(page), 10));
  const limitNum = Math.min(100, Math.max(1, parseInt(String(limit), 10)));
  const offset = (pageNum - 1) * limitNum;

  try {
    let whereClauses: string[] = ['1=1'];
    let params: any[] = [];

    if (search) {
      whereClauses.push('(LOWER(name) LIKE ? OR LOWER(username) LIKE ?)');
      const q = `%${String(search).toLowerCase().trim()}%`;
      params.push(q, q);
    }

    if (filter === 'verified') {
      whereClauses.push('is_verified = 1');
    } else if (filter === 'unverified') {
      whereClauses.push('is_verified = 0');
    }

    const whereStr = whereClauses.join(' AND ');

    const totalCount = (adminDb.prepare(`
      SELECT COUNT(*) as count FROM users WHERE ${whereStr}
    `).get(...params) as any)?.count || 0;

    const users = adminDb.prepare(`
      SELECT id, name, username, avatar_url, is_verified, last_seen_at, status_text
      FROM users
      WHERE ${whereStr}
      ORDER BY last_seen_at DESC
      LIMIT ? OFFSET ?
    `).all(...params, limitNum, offset) as any[];

    res.json({
      users: users.map(u => ({
        id: u.id,
        name: u.name,
        username: u.username,
        avatar: u.avatar_url,
        isVerified: Boolean(u.is_verified),
        lastSeenAt: u.last_seen_at,
        statusText: u.status_text
      })),
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limitNum)
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to query users', details: err.message });
  }
});

/**
 * 2. Get User Detail with Strict Privacy Masking
 * (NO private notes, NO journals, NO private chats, NO unmasked credentials)
 */
usersRouter.get('/:userId', requireAdminPermission('users', 'read'), (req: Request, res: Response) => {
  const { userId } = req.params;

  try {
    const user = adminDb.prepare(`
      SELECT id, name, username, avatar_url, is_verified, last_seen_at, status_text
      FROM users WHERE id = ?
    `).get(userId) as any;

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Community trait feedback (aggregated public stats)
    const traits = adminDb.prepare(`
      SELECT trait_slug, COUNT(*) as vote_count
      FROM profile_trait_votes
      WHERE target_user_id = ?
      GROUP BY trait_slug
    `).all(userId) as any[];

    // Moderation report history on this user
    const reports = adminDb.prepare(`
      SELECT id, reporter_id, reason, details, status, created_at
      FROM user_reports
      WHERE reported_user_id = ?
      ORDER BY created_at DESC
    `).all(userId);

    // Active AI provider names (masked, NO credentials returned)
    const aiConnections = adminDb.prepare(`
      SELECT id, provider, name, is_enabled, last_tested_at
      FROM user_ai_connections
      WHERE user_id = ?
    `).all(userId);

    res.json({
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        avatar: user.avatar_url,
        isVerified: Boolean(user.is_verified),
        lastSeenAt: user.last_seen_at,
        statusText: user.status_text
      },
      traits,
      reports,
      aiConnections: aiConnections.map((c: any) => ({
        id: c.id,
        provider: c.provider,
        name: c.name,
        isEnabled: Boolean(c.is_enabled),
        lastTestedAt: c.last_tested_at
      }))
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch user detail', details: err.message });
  }
});

/**
 * 3. Toggle User Verification Badge
 */
usersRouter.post('/:userId/verification', requireAdminPermission('users', 'write'), (req: Request, res: Response) => {
  const admin = req.admin!;
  const { userId } = req.params;
  const { isVerified } = req.body;

  try {
    const existing = adminDb.prepare('SELECT id, name, is_verified FROM users WHERE id = ?').get(userId) as any;
    if (!existing) return res.status(404).json({ error: 'User not found' });

    const nextVerified = isVerified !== undefined ? (isVerified ? 1 : 0) : (existing.is_verified ? 0 : 1);
    adminDb.prepare('UPDATE users SET is_verified = ? WHERE id = ?').run(nextVerified, userId);

    AdminAuditLogger.log({
      adminId: admin.id,
      adminName: admin.fullName,
      action: 'UPDATE_USER_VERIFICATION',
      targetType: 'USER',
      targetId: userId,
      beforeState: { isVerified: existing.is_verified },
      afterState: { isVerified: nextVerified },
      ipAddress: req.ip
    });

    res.json({ success: true, userId, isVerified: Boolean(nextVerified) });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update verification', details: err.message });
  }
});

/**
 * 4. Suspend or Deactivate User
 */
usersRouter.post('/:userId/suspend', requireAdminPermission('users', 'write'), (req: Request, res: Response) => {
  const admin = req.admin!;
  const { userId } = req.params;
  const { reason = 'Account suspended by moderation team' } = req.body;

  try {
    const existing = adminDb.prepare('SELECT id, name, status_text FROM users WHERE id = ?').get(userId) as any;
    if (!existing) return res.status(404).json({ error: 'User not found' });

    adminDb.prepare('UPDATE users SET status_text = ? WHERE id = ?').run(`[SUSPENDED: ${reason}]`, userId);

    AdminAuditLogger.log({
      adminId: admin.id,
      adminName: admin.fullName,
      action: 'SUSPEND_USER',
      targetType: 'USER',
      targetId: userId,
      reason,
      ipAddress: req.ip
    });

    res.json({ success: true, userId, suspended: true, reason });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to suspend user', details: err.message });
  }
});

/**
 * 5. Moderation Reports Queue
 */
usersRouter.get('/moderation/reports', requireAdminPermission('reports', 'read'), (_req: Request, res: Response) => {
  try {
    const reports = adminDb.prepare(`
      SELECT 
        r.id, r.reporter_id, r.reported_user_id, r.reason, r.details, r.status, r.created_at,
        u_rep.name as reporter_name,
        u_tar.name as reported_name,
        u_tar.avatar_url as reported_avatar
      FROM user_reports r
      LEFT JOIN users u_rep ON r.reporter_id = u_rep.id
      LEFT JOIN users u_tar ON r.reported_user_id = u_tar.id
      ORDER BY r.created_at DESC
      LIMIT 100
    `).all();

    res.json({ reports });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch moderation reports', details: err.message });
  }
});

/**
 * 6. Resolve Moderation Report
 */
usersRouter.post('/moderation/resolve-report/:reportId', requireAdminPermission('reports', 'write'), (req: Request, res: Response) => {
  const admin = req.admin!;
  const { reportId } = req.params;
  const { status = 'resolved', notes } = req.body;

  try {
    adminDb.prepare(`
      UPDATE user_reports
      SET status = ?, details = COALESCE(details, '') || ' [Moderator note: ' || ? || ']'
      WHERE id = ?
    `).run(status, notes || 'Resolved by admin', reportId);

    AdminAuditLogger.log({
      adminId: admin.id,
      adminName: admin.fullName,
      action: 'RESOLVE_REPORT',
      targetType: 'REPORT',
      targetId: reportId,
      afterState: { status, notes },
      ipAddress: req.ip
    });

    res.json({ success: true, reportId, status });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to resolve report', details: err.message });
  }
});
