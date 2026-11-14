import { Router, Request, Response } from 'express';
import fs from 'fs';
import { adminDb } from '../db';
import { requireAdminAuth, requireAdminPermission, requireAdminRole } from '../auth/middleware';
import { AdminAuditLogger } from '../auth/audit';
import { CONFIG } from '../config';

export const systemRouter = Router();

systemRouter.use(requireAdminAuth);

/**
 * 1. Operational Telemetry & Infrastructure Health Check
 */
systemRouter.get('/health', requireAdminPermission('system', 'read'), (_req: Request, res: Response) => {
  try {
    const memory = process.memoryUsage();
    let dbSizeBytes = 0;
    try {
      const stats = fs.statSync(CONFIG.DB_PATH);
      dbSizeBytes = stats.size;
    } catch {}

    const totalUsers = (adminDb.prepare('SELECT COUNT(*) as count FROM users').get() as any)?.count || 0;
    const activeAdminSessions = (adminDb.prepare('SELECT COUNT(*) as count FROM admin_sessions WHERE revoked_at IS NULL AND expires_at > ?').get(Math.floor(Date.now() / 1000)) as any)?.count || 0;
    const totalAuditLogs = (adminDb.prepare('SELECT COUNT(*) as count FROM configuration_audit_logs').get() as any)?.count || 0;

    res.json({
      status: 'HEALTHY',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      nodeVersion: process.version,
      memory: {
        rssMb: Math.round(memory.rss / (1024 * 1024)),
        heapUsedMb: Math.round(memory.heapUsed / (1024 * 1024)),
        heapTotalMb: Math.round(memory.heapTotal / (1024 * 1024))
      },
      database: {
        path: CONFIG.DB_PATH,
        sizeMb: (dbSizeBytes / (1024 * 1024)).toFixed(2),
        journalMode: 'WAL'
      },
      counts: {
        totalUsers,
        activeAdminSessions,
        totalAuditLogs
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to inspect system health', details: err.message });
  }
});

/**
 * 2. Immutable Configuration & Admin Audit Logs
 */
systemRouter.get('/audit-logs', requireAdminPermission('audit', 'read'), (req: Request, res: Response) => {
  const { action = '', adminId = '', page = '1', limit = '50' } = req.query;
  const pageNum = Math.max(1, parseInt(String(page), 10));
  const limitNum = Math.min(100, Math.max(1, parseInt(String(limit), 10)));
  const offset = (pageNum - 1) * limitNum;

  try {
    let whereClauses: string[] = ['1=1'];
    let params: any[] = [];

    if (action) {
      whereClauses.push('action = ?');
      params.push(action);
    }

    if (adminId) {
      whereClauses.push('admin_id = ?');
      params.push(adminId);
    }

    const whereStr = whereClauses.join(' AND ');
    const total = (adminDb.prepare(`SELECT COUNT(*) as count FROM configuration_audit_logs WHERE ${whereStr}`).get(...params) as any)?.count || 0;

    const logs = adminDb.prepare(`
      SELECT * FROM configuration_audit_logs
      WHERE ${whereStr}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `).all(...params, limitNum, offset) as any[];

    res.json({
      logs: logs.map(l => ({
        id: l.id,
        adminId: l.admin_id,
        adminName: l.admin_name,
        action: l.action,
        targetType: l.target_type,
        targetId: l.target_id,
        beforeState: l.before_value_json ? JSON.parse(l.before_value_json) : null,
        afterState: l.after_value_json ? JSON.parse(l.after_value_json) : null,
        reason: l.reason,
        createdAt: l.created_at
      })),
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch audit logs', details: err.message });
  }
});

/**
 * 3. Database Checkpoint (WAL Maintenance)
 */
systemRouter.post('/wal-checkpoint', requireAdminPermission('system', 'write'), (req: Request, res: Response) => {
  const admin = req.admin!;
  try {
    adminDb.pragma('wal_checkpoint(TRUNCATE)');

    AdminAuditLogger.log({
      adminId: admin.id,
      adminName: admin.fullName,
      action: 'SYSTEM_WAL_CHECKPOINT',
      targetType: 'DATABASE',
      targetId: 'data.db',
      ipAddress: req.ip
    });

    res.json({ success: true, message: 'SQLite WAL checkpoint completed successfully' });
  } catch (err: any) {
    res.status(500).json({ error: 'WAL checkpoint failed', details: err.message });
  }
});

/**
 * 4. Database Vacuum
 */
systemRouter.post('/vacuum', requireAdminPermission('system', 'write'), (req: Request, res: Response) => {
  const admin = req.admin!;
  try {
    adminDb.exec('VACUUM');

    AdminAuditLogger.log({
      adminId: admin.id,
      adminName: admin.fullName,
      action: 'SYSTEM_VACUUM',
      targetType: 'DATABASE',
      targetId: 'data.db',
      ipAddress: req.ip
    });

    res.json({ success: true, message: 'Database VACUUM completed successfully' });
  } catch (err: any) {
    res.status(500).json({ error: 'VACUUM failed', details: err.message });
  }
});

/**
 * 5. Roles & Permissions Inspector
 */
systemRouter.get('/roles', requireAdminPermission('system', 'read'), (_req: Request, res: Response) => {
  try {
    const roles = adminDb.prepare('SELECT * FROM admin_roles ORDER BY hierarchy_level DESC').all() as any[];
    const permissions = adminDb.prepare('SELECT * FROM admin_permissions').all() as any[];

    const permMap = new Map<string, { domain: string; action: string }[]>();
    for (const p of permissions) {
      if (!permMap.has(p.role_id)) permMap.set(p.role_id, []);
      permMap.get(p.role_id)!.push({ domain: p.domain, action: p.action });
    }

    res.json({
      roles: roles.map(r => ({
        id: r.id,
        name: r.name,
        description: r.description,
        hierarchyLevel: r.hierarchy_level,
        permissions: permMap.get(r.id) || []
      }))
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to query roles', details: err.message });
  }
});

/**
 * 6. Assign Admin Role (Super Admin only)
 */
systemRouter.post('/roles/assign', requireAdminRole(['super_admin']), (req: Request, res: Response) => {
  const admin = req.admin!;
  const { adminUserId, roleId } = req.body;
  const now = Math.floor(Date.now() / 1000);

  try {
    const targetUser = adminDb.prepare('SELECT id, full_name, email FROM admin_users WHERE id = ?').get(adminUserId) as any;
    if (!targetUser) return res.status(404).json({ error: 'Admin user not found' });

    const role = adminDb.prepare('SELECT id, name FROM admin_roles WHERE id = ?').get(roleId) as any;
    if (!role) return res.status(404).json({ error: 'Role not found' });

    adminDb.prepare('UPDATE admin_users SET role_id = ?, updated_at = ? WHERE id = ?').run(roleId, now, adminUserId);

    AdminAuditLogger.log({
      adminId: admin.id,
      adminName: admin.fullName,
      action: 'ASSIGN_ADMIN_ROLE',
      targetType: 'ADMIN_USER',
      targetId: adminUserId,
      afterState: { roleId, roleName: role.name },
      reason: `Assigned by ${admin.fullName}`,
      ipAddress: req.ip
    });

    res.json({ success: true, adminUserId, roleId, roleName: role.name });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to assign role', details: err.message });
  }
});
