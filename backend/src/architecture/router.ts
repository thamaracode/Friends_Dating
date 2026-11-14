import express, { Request, Response } from 'express';
import fs from 'fs';
import { db } from '../db';
import { v4 as uuidv4 } from 'uuid';
import { sendSuccess, sendError, parsePagination, parseSorting } from './apiResponse';
import { AccessControlEngine } from './accessControl';
import { DataProtectionService } from './dataProtection';
import { BackupService } from './backupService';
import { CacheService } from './cacheService';
import { BackgroundJobManager } from './backgroundJobs';
import { idempotencyMiddleware } from './idempotency';
import { UserSettings, ProfileMediaItem, ConnectionRequest } from './types';

export const architectureRouter = express.Router();

// Apply idempotency middleware globally on this router
architectureRouter.use(idempotencyMiddleware());

// ============================================================================
// 1. USER SETTINGS
// ============================================================================

architectureRouter.get('/users/:userId/settings', (req: Request, res: Response) => {
  const callerId = (req.headers['x-user-id'] as string) || 'usr_me';
  const targetUserId = req.params.userId;
  const adminId = (req.headers['x-admin-id'] as string) || undefined;

  if (!AccessControlEngine.verifyCallerOrAdmin(callerId, targetUserId, adminId)) {
    return sendError(res, 'IDOR_VIOLATION', 'Unauthorized access to user settings', 403);
  }

  const row = db.prepare('SELECT * FROM user_settings WHERE user_id = ?').get(targetUserId) as any;
  if (!row) {
    const now = Date.now();
    const defaultSettings: UserSettings = {
      userId: targetUserId,
      theme: 'obsidian',
      language: 'en',
      twoFactorEnabled: false,
      emailNotifications: true,
      pushNotifications: true,
      soundEffects: true,
      hapticFeedback: true,
      dataSharingLevel: 'minimal',
      retentionPeriodDays: 365,
      createdAt: now,
      updatedAt: now
    };
    db.prepare(`
      INSERT OR IGNORE INTO user_settings (
        user_id, theme, language, two_factor_enabled, email_notifications, push_notifications,
        sound_effects, haptic_feedback, data_sharing_level, retention_period_days, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      defaultSettings.userId, defaultSettings.theme, defaultSettings.language,
      defaultSettings.twoFactorEnabled ? 1 : 0, defaultSettings.emailNotifications ? 1 : 0,
      defaultSettings.pushNotifications ? 1 : 0, defaultSettings.soundEffects ? 1 : 0,
      defaultSettings.hapticFeedback ? 1 : 0, defaultSettings.dataSharingLevel,
      defaultSettings.retentionPeriodDays, now, now
    );
    return sendSuccess(res, defaultSettings);
  }

  const settings: UserSettings = {
    userId: row.user_id,
    theme: row.theme,
    language: row.language,
    twoFactorEnabled: Boolean(row.two_factor_enabled),
    emailNotifications: Boolean(row.email_notifications),
    pushNotifications: Boolean(row.push_notifications),
    soundEffects: Boolean(row.sound_effects),
    hapticFeedback: Boolean(row.haptic_feedback),
    dataSharingLevel: row.data_sharing_level,
    retentionPeriodDays: row.retention_period_days,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };

  return sendSuccess(res, settings);
});

architectureRouter.put('/users/:userId/settings', (req: Request, res: Response) => {
  const callerId = (req.headers['x-user-id'] as string) || 'usr_me';
  const targetUserId = req.params.userId;
  const adminId = (req.headers['x-admin-id'] as string) || undefined;

  if (!AccessControlEngine.verifyCallerOrAdmin(callerId, targetUserId, adminId)) {
    return sendError(res, 'IDOR_VIOLATION', 'Unauthorized to modify user settings', 403);
  }

  const now = Date.now();
  const updates = req.body || {};

  const current = db.prepare('SELECT * FROM user_settings WHERE user_id = ?').get(targetUserId) as any;
  const theme = updates.theme ?? current?.theme ?? 'obsidian';
  const language = updates.language ?? current?.language ?? 'en';
  const twoFactor = updates.twoFactorEnabled !== undefined ? (updates.twoFactorEnabled ? 1 : 0) : (current?.two_factor_enabled ?? 0);
  const emailNotif = updates.emailNotifications !== undefined ? (updates.emailNotifications ? 1 : 0) : (current?.email_notifications ?? 1);
  const pushNotif = updates.pushNotifications !== undefined ? (updates.pushNotifications ? 1 : 0) : (current?.push_notifications ?? 1);
  const soundFx = updates.soundEffects !== undefined ? (updates.soundEffects ? 1 : 0) : (current?.sound_effects ?? 1);
  const haptics = updates.hapticFeedback !== undefined ? (updates.hapticFeedback ? 1 : 0) : (current?.haptic_feedback ?? 1);
  const dataSharing = updates.dataSharingLevel ?? current?.data_sharing_level ?? 'minimal';
  const retention = updates.retentionPeriodDays ?? current?.retention_period_days ?? 365;

  db.prepare(`
    INSERT OR REPLACE INTO user_settings (
      user_id, theme, language, two_factor_enabled, email_notifications, push_notifications,
      sound_effects, haptic_feedback, data_sharing_level, retention_period_days, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, COALESCE((SELECT created_at FROM user_settings WHERE user_id = ?), ?), ?)
  `).run(
    targetUserId, theme, language, twoFactor, emailNotif, pushNotif,
    soundFx, haptics, dataSharing, retention, targetUserId, now, now
  );

  AccessControlEngine.logSecurityAudit({
    userId: targetUserId,
    action: 'user_settings_updated',
    domain: 'user_profile',
    resourceType: 'user_settings',
    resourceId: targetUserId,
    severity: 'info',
    details: { theme, twoFactor, dataSharing }
  });

  return sendSuccess(res, {
    userId: targetUserId,
    theme,
    language,
    twoFactorEnabled: Boolean(twoFactor),
    emailNotifications: Boolean(emailNotif),
    pushNotifications: Boolean(pushNotif),
    soundEffects: Boolean(soundFx),
    hapticFeedback: Boolean(haptics),
    dataSharingLevel: dataSharing,
    retentionPeriodDays: retention,
    updatedAt: now
  });
});

// ============================================================================
// 2. AUTHENTICATION SESSIONS
// ============================================================================

architectureRouter.get('/users/:userId/sessions', (req: Request, res: Response) => {
  const callerId = (req.headers['x-user-id'] as string) || 'usr_me';
  const targetUserId = req.params.userId;
  const adminId = (req.headers['x-admin-id'] as string) || undefined;

  if (!AccessControlEngine.verifyCallerOrAdmin(callerId, targetUserId, adminId)) {
    return sendError(res, 'IDOR_VIOLATION', 'Unauthorized to inspect auth sessions', 403);
  }

  const rows = db.prepare(`
    SELECT id, device_name, ip_address, user_agent, is_revoked, expires_at, last_active_at, created_at
    FROM auth_sessions
    WHERE user_id = ? AND is_revoked = 0
    ORDER BY last_active_at DESC
  `).all(targetUserId) as any[];

  return sendSuccess(res, rows);
});

architectureRouter.delete('/users/:userId/sessions/:sessionId', (req: Request, res: Response) => {
  const callerId = (req.headers['x-user-id'] as string) || 'usr_me';
  const targetUserId = req.params.userId;
  const sessionId = req.params.sessionId;
  const adminId = (req.headers['x-admin-id'] as string) || undefined;

  if (!AccessControlEngine.verifyCallerOrAdmin(callerId, targetUserId, adminId)) {
    return sendError(res, 'IDOR_VIOLATION', 'Unauthorized to revoke session', 403);
  }

  const result = db.prepare(`
    UPDATE auth_sessions SET is_revoked = 1 WHERE id = ? AND user_id = ?
  `).run(sessionId, targetUserId);

  if (result.changes === 0) {
    return sendError(res, 'NOT_FOUND', 'Session not found or already revoked', 404);
  }

  AccessControlEngine.logSecurityAudit({
    userId: targetUserId,
    action: 'auth_session_revoked',
    domain: 'authentication',
    resourceType: 'auth_session',
    resourceId: sessionId,
    severity: 'info'
  });

  return sendSuccess(res, { revoked: true, sessionId });
});

// ============================================================================
// 3. EXPLICIT CONNECTION REQUESTS
// ============================================================================

architectureRouter.get('/connection-requests', (req: Request, res: Response) => {
  const callerId = (req.headers['x-user-id'] as string) || 'usr_me';
  const type = (req.query.type as string) || 'incoming'; // incoming or outgoing
  const status = (req.query.status as string) || 'pending';
  const { page, limit, offset } = parsePagination(req.query);

  let query = '';
  let params: any[] = [];

  if (type === 'incoming') {
    query = `
      SELECT cr.id, cr.sender_id, cr.sender_id as requester_id, cr.recipient_id, cr.connection_type, cr.status, cr.note, cr.note as intro_note, cr.created_at, cr.responded_at,
             u.name as requester_name, u.username as requester_username, u.avatar_url as requester_avatar, u.is_verified as requester_verified
      FROM connection_requests cr
      JOIN users u ON cr.sender_id = u.id
      WHERE cr.recipient_id = ? AND cr.status = ?
      ORDER BY cr.created_at DESC
      LIMIT ? OFFSET ?
    `;
    params = [callerId, status, limit, offset];
  } else {
    query = `
      SELECT cr.id, cr.sender_id, cr.sender_id as requester_id, cr.recipient_id, cr.connection_type, cr.status, cr.note, cr.note as intro_note, cr.created_at, cr.responded_at,
             u.name as recipient_name, u.username as recipient_username, u.avatar_url as recipient_avatar, u.is_verified as recipient_verified
      FROM connection_requests cr
      JOIN users u ON cr.recipient_id = u.id
      WHERE cr.sender_id = ? AND cr.status = ?
      ORDER BY cr.created_at DESC
      LIMIT ? OFFSET ?
    `;
    params = [callerId, status, limit, offset];
  }

  const rows = db.prepare(query).all(...params);
  const total = (db.prepare(`
    SELECT COUNT(*) as count FROM connection_requests 
    WHERE ${type === 'incoming' ? 'recipient_id' : 'sender_id'} = ? AND status = ?
  `).get(callerId, status) as any)?.count || 0;

  return sendSuccess(res, rows, { page, limit, total, totalPages: Math.ceil(total / limit) });
});

architectureRouter.post('/connection-requests', (req: Request, res: Response) => {
  const callerId = (req.headers['x-user-id'] as string) || 'usr_me';
  const { recipientId, connectionType, introNote } = req.body || {};

  if (!recipientId || !connectionType) {
    return sendError(res, 'VALIDATION_ERROR', 'recipientId and connectionType are required', 400);
  }

  if (callerId === recipientId) {
    return sendError(res, 'VALIDATION_ERROR', 'Cannot send connection request to yourself', 400);
  }

  const allowedTypes = ['friendship', 'dating', 'deep_connection', 'creative_collaboration', 'activity_partner'];
  if (!allowedTypes.includes(connectionType)) {
    return sendError(res, 'VALIDATION_ERROR', `Invalid connectionType. Allowed: ${allowedTypes.join(', ')}`, 400);
  }

  const id = `creq_${uuidv4().replace(/-/g, '').slice(0, 16)}`;
  const now = Date.now();

  try {
    db.prepare(`
      INSERT INTO connection_requests (
        id, sender_id, recipient_id, connection_type, status, note, created_at
      ) VALUES (?, ?, ?, ?, 'pending', ?, ?)
    `).run(id, callerId, recipientId, connectionType, introNote || null, now);

    // Create notification for recipient
    const requester = db.prepare('SELECT name FROM users WHERE id = ?').get(callerId) as { name?: string };
    const requesterName = requester?.name || 'Someone';

    db.prepare(`
      INSERT INTO notifications (
        id, user_id, type, title, body, entity_type, entity_id, is_read, created_at
      ) VALUES (?, ?, 'connection_request', 'New Connection Request', ?, 'connection_request', ?, 0, ?)
    `).run(
      `notif_${uuidv4().slice(0, 8)}`,
      recipientId,
      `${requesterName} sent you a ${connectionType.replace(/_/g, ' ')} connection request.`,
      id,
      now
    );

    return sendSuccess(res, {
      id,
      requesterId: callerId,
      senderId: callerId,
      recipientId,
      connectionType,
      status: 'pending',
      introNote,
      note: introNote,
      createdAt: now
    }, undefined, 201);
  } catch (err: any) {
    if (err.message && err.message.includes('UNIQUE constraint failed')) {
      return sendError(res, 'CONFLICT', 'A connection request of this type already exists between you and this person', 409);
    }
    return sendError(res, 'INTERNAL_ERROR', 'Failed to create connection request', 500);
  }
});

architectureRouter.post('/connection-requests/:id/respond', (req: Request, res: Response) => {
  const callerId = (req.headers['x-user-id'] as string) || 'usr_me';
  const requestId = req.params.id;
  const { action } = req.body || {}; // 'accept' or 'decline'

  if (action !== 'accept' && action !== 'decline') {
    return sendError(res, 'VALIDATION_ERROR', "Action must be 'accept' or 'decline'", 400);
  }

  const reqRow = db.prepare('SELECT * FROM connection_requests WHERE id = ?').get(requestId) as any;
  if (!reqRow) {
    return sendError(res, 'NOT_FOUND', 'Connection request not found', 404);
  }

  if (reqRow.recipient_id !== callerId) {
    return sendError(res, 'FORBIDDEN', 'You can only respond to connection requests sent to you', 403);
  }

  if (reqRow.status !== 'pending') {
    return sendError(res, 'CONFLICT', `Connection request is already ${reqRow.status}`, 409);
  }

  const now = Date.now();
  const newStatus = action === 'accept' ? 'accepted' : 'declined';

  const tx = db.transaction(() => {
    db.prepare('UPDATE connection_requests SET status = ?, responded_at = ? WHERE id = ?').run(newStatus, now, requestId);

    if (action === 'accept') {
      // Establish bidirectional relationship
      const relType = reqRow.connection_type === 'dating' ? 'match' : 'friend';
      const sender = reqRow.sender_id || reqRow.requester_id;
      db.prepare(`
        INSERT OR IGNORE INTO user_relationships (user_id, target_user_id, relationship_type, created_at)
        VALUES (?, ?, ?, ?), (?, ?, ?, ?)
      `).run(sender, reqRow.recipient_id, relType, now, reqRow.recipient_id, sender, relType, now);

      // Notify requester
      const recipient = db.prepare('SELECT name FROM users WHERE id = ?').get(callerId) as { name?: string };
      db.prepare(`
        INSERT INTO notifications (
          id, user_id, type, title, body, entity_type, entity_id, is_read, created_at
        ) VALUES (?, ?, 'connection_accepted', 'Connection Accepted!', ?, 'connection_request', ?, 0, ?)
      `).run(
        `notif_${uuidv4().slice(0, 8)}`,
        sender,
        `${recipient?.name || 'Someone'} accepted your ${reqRow.connection_type.replace(/_/g, ' ')} connection!`,
        requestId,
        now
      );
    }
  });

  tx();

  return sendSuccess(res, {
    requestId,
    status: newStatus,
    respondedAt: now
  });
});

// ============================================================================
// 4. NOTIFICATIONS
// ============================================================================

architectureRouter.get('/notifications', (req: Request, res: Response) => {
  const callerId = (req.headers['x-user-id'] as string) || 'usr_me';
  const unreadOnly = req.query.unread === 'true';
  const { page, limit, offset } = parsePagination(req.query);

  let query = 'SELECT * FROM notifications WHERE user_id = ?';
  const params: any[] = [callerId];

  if (unreadOnly) {
    query += ' AND is_read = 0';
  }

  query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  params.push(limit, offset);

  const rows = db.prepare(query).all(...params) as any[];
  const total = (db.prepare(`
    SELECT COUNT(*) as count FROM notifications WHERE user_id = ? ${unreadOnly ? 'AND is_read = 0' : ''}
  `).get(callerId) as any)?.count || 0;

  return sendSuccess(res, rows.map(r => ({
    id: r.id,
    userId: r.user_id,
    type: r.type,
    title: r.title,
    body: r.body,
    entityType: r.entity_type,
    entityId: r.entity_id,
    isRead: Boolean(r.is_read),
    createdAt: r.created_at
  })), { page, limit, total, totalPages: Math.ceil(total / limit) });
});

architectureRouter.patch('/notifications/:id/read', (req: Request, res: Response) => {
  const callerId = (req.headers['x-user-id'] as string) || 'usr_me';
  const id = req.params.id;

  const result = db.prepare('UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?').run(id, callerId);
  if (result.changes === 0) {
    return sendError(res, 'NOT_FOUND', 'Notification not found', 404);
  }

  return sendSuccess(res, { id, isRead: true });
});

architectureRouter.post('/notifications/mark-all-read', (req: Request, res: Response) => {
  const callerId = (req.headers['x-user-id'] as string) || 'usr_me';
  const result = db.prepare('UPDATE notifications SET is_read = 1 WHERE user_id = ? AND is_read = 0').run(callerId);

  return sendSuccess(res, { markedReadCount: result.changes });
});

// ============================================================================
// 5. PROFILE MEDIA GALLERY (WITH ABAC PRIVACY)
// ============================================================================

architectureRouter.get('/users/:userId/media', (req: Request, res: Response) => {
  const callerId = (req.headers['x-user-id'] as string) || 'usr_me';
  const targetUserId = req.params.userId;
  const adminId = (req.headers['x-admin-id'] as string) || undefined;

  const rawMedia = db.prepare(`
    SELECT * FROM profile_media WHERE user_id = ? ORDER BY sort_order ASC, created_at DESC
  `).all(targetUserId) as any[];

  // Apply ABAC privacy filter
  const filtered = rawMedia.filter(m => 
    AccessControlEngine.canAccessResource(callerId, targetUserId, m.visibility, adminId)
  );

  return sendSuccess(res, filtered.map(m => ({
    id: m.id,
    userId: m.user_id,
    mediaType: m.media_type,
    url: m.url,
    thumbnailUrl: m.thumbnail_url,
    caption: m.caption,
    sortOrder: m.sort_order,
    visibility: m.visibility,
    createdAt: m.created_at
  })));
});

architectureRouter.post('/users/:userId/media', (req: Request, res: Response) => {
  const callerId = (req.headers['x-user-id'] as string) || 'usr_me';
  const targetUserId = req.params.userId;
  const adminId = (req.headers['x-admin-id'] as string) || undefined;

  if (!AccessControlEngine.verifyCallerOrAdmin(callerId, targetUserId, adminId)) {
    return sendError(res, 'IDOR_VIOLATION', 'Unauthorized to add profile media', 403);
  }

  const { mediaType, url, thumbnailUrl, caption, sortOrder, visibility } = req.body || {};
  if (!mediaType || !url) {
    return sendError(res, 'VALIDATION_ERROR', 'mediaType and url are required', 400);
  }

  const id = `med_${uuidv4().replace(/-/g, '').slice(0, 16)}`;
  const now = Date.now();
  const vis = visibility || 'public';

  db.prepare(`
    INSERT INTO profile_media (
      id, user_id, media_type, url, thumbnail_url, caption, sort_order, visibility, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, targetUserId, mediaType, url, thumbnailUrl || null, caption || null, sortOrder || 0, vis, now);

  return sendSuccess(res, {
    id,
    userId: targetUserId,
    mediaType,
    url,
    thumbnailUrl,
    caption,
    sortOrder: sortOrder || 0,
    visibility: vis,
    createdAt: now
  }, undefined, 201);
});

// ============================================================================
// 6. DATA PROTECTION & GDPR RIGHTS
// ============================================================================

architectureRouter.get('/users/:userId/consent', (req: Request, res: Response) => {
  const callerId = (req.headers['x-user-id'] as string) || 'usr_me';
  const targetUserId = req.params.userId;
  const adminId = (req.headers['x-admin-id'] as string) || undefined;

  if (!AccessControlEngine.verifyCallerOrAdmin(callerId, targetUserId, adminId)) {
    return sendError(res, 'IDOR_VIOLATION', 'Unauthorized to view consent records', 403);
  }

  const consents = DataProtectionService.getUserConsents(targetUserId);
  return sendSuccess(res, consents);
});

architectureRouter.post('/users/:userId/consent', (req: Request, res: Response) => {
  const callerId = (req.headers['x-user-id'] as string) || 'usr_me';
  const targetUserId = req.params.userId;
  const adminId = (req.headers['x-admin-id'] as string) || undefined;

  if (!AccessControlEngine.verifyCallerOrAdmin(callerId, targetUserId, adminId)) {
    return sendError(res, 'IDOR_VIOLATION', 'Unauthorized to modify consent records', 403);
  }

  const { consentType, granted, version } = req.body || {};
  if (!consentType || granted === undefined) {
    return sendError(res, 'VALIDATION_ERROR', 'consentType and granted (boolean) are required', 400);
  }

  const record = DataProtectionService.recordConsent({
    userId: targetUserId,
    consentType,
    granted: Boolean(granted),
    version: version || '1.0.0',
    ipAddress: req.ip || req.socket.remoteAddress
  });

  return sendSuccess(res, record);
});

architectureRouter.post('/users/:userId/export', async (req: Request, res: Response) => {
  const callerId = (req.headers['x-user-id'] as string) || 'usr_me';
  const targetUserId = req.params.userId;
  const adminId = (req.headers['x-admin-id'] as string) || undefined;

  if (!AccessControlEngine.verifyCallerOrAdmin(callerId, targetUserId, adminId)) {
    return sendError(res, 'IDOR_VIOLATION', 'Unauthorized to request data export', 403);
  }

  try {
    const exportRecord = await DataProtectionService.generateDataExport(targetUserId);
    return sendSuccess(res, exportRecord, undefined, 202);
  } catch (err: any) {
    return sendError(res, 'INTERNAL_ERROR', err?.message || 'Data export generation failed', 500);
  }
});

architectureRouter.get('/users/:userId/exports', (req: Request, res: Response) => {
  const callerId = (req.headers['x-user-id'] as string) || 'usr_me';
  const targetUserId = req.params.userId;
  const adminId = (req.headers['x-admin-id'] as string) || undefined;

  if (!AccessControlEngine.verifyCallerOrAdmin(callerId, targetUserId, adminId)) {
    return sendError(res, 'IDOR_VIOLATION', 'Unauthorized to inspect data exports', 403);
  }

  const exports = db.prepare(`
    SELECT id, status, file_size_bytes, expires_at, requested_at, completed_at
    FROM user_data_exports
    WHERE user_id = ?
    ORDER BY requested_at DESC
  `).all(targetUserId);

  return sendSuccess(res, exports);
});

architectureRouter.delete('/users/:userId/gdpr-erasure', (req: Request, res: Response) => {
  const callerId = (req.headers['x-user-id'] as string) || 'usr_me';
  const targetUserId = req.params.userId;
  const adminId = (req.headers['x-admin-id'] as string) || undefined;

  if (!AccessControlEngine.verifyCallerOrAdmin(callerId, targetUserId, adminId)) {
    return sendError(res, 'IDOR_VIOLATION', 'Unauthorized to request account erasure', 403);
  }

  const { confirmation, reason } = req.body || {};
  if (confirmation !== 'DELETE_MY_ACCOUNT_PERMANENTLY') {
    return sendError(res, 'VALIDATION_ERROR', "Must provide confirmation string: 'DELETE_MY_ACCOUNT_PERMANENTLY'", 400);
  }

  const result = DataProtectionService.deleteUserAccount(targetUserId, reason || 'Self-service GDPR erasure');
  return sendSuccess(res, result);
});

// ============================================================================
// 7. SECURITY AUDIT LOGS (ADMIN / AUDITOR ACCESS)
// ============================================================================

architectureRouter.get('/security/audit-logs', (req: Request, res: Response) => {
  const adminId = (req.headers['x-admin-id'] as string) || undefined;
  const callerId = (req.headers['x-user-id'] as string) || '';

  if (!AccessControlEngine.hasAdminPermission(adminId || callerId, 'audit', 'read')) {
    return sendError(res, 'FORBIDDEN', 'Administrative security permission required to view audit events', 403);
  }

  const { page, limit, offset } = parsePagination(req.query);
  const domain = req.query.domain as string | undefined;
  const severity = req.query.severity as string | undefined;

  let query = 'SELECT * FROM security_audit_events WHERE 1=1';
  const params: any[] = [];

  if (domain) {
    query += ' AND domain = ?';
    params.push(domain);
  }
  if (severity) {
    query += ' AND severity = ?';
    params.push(severity);
  }

  query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  params.push(limit, offset);

  const rows = db.prepare(query).all(...params) as any[];
  const total = (db.prepare(`
    SELECT COUNT(*) as count FROM security_audit_events 
    WHERE 1=1 ${domain ? 'AND domain = ?' : ''} ${severity ? 'AND severity = ?' : ''}
  `).get(...(domain && severity ? [domain, severity] : domain ? [domain] : severity ? [severity] : [])) as any)?.count || 0;

  return sendSuccess(res, rows.map(r => ({
    id: r.id,
    userId: r.user_id,
    action: r.action,
    domain: r.domain,
    resourceType: r.resource_type,
    resourceId: r.resource_id,
    severity: r.severity,
    ipAddress: r.ip_address,
    userAgent: r.user_agent,
    details: JSON.parse(r.details_json || '{}'),
    createdAt: r.created_at
  })), { page, limit, total, totalPages: Math.ceil(total / limit) });
});

// ============================================================================
// 8. PERFORMANCE, HEALTH & TELEMETRY
// ============================================================================

architectureRouter.get('/system/health', (_req: Request, res: Response) => {
  const memory = process.memoryUsage();
  const uptime = process.uptime();
  const integrity = BackupService.verifyDatabaseIntegrity();

  return sendSuccess(res, {
    status: integrity.ok ? 'healthy' : 'degraded',
    uptimeSeconds: Math.floor(uptime),
    memory: {
      rssMb: Math.round(memory.rss / (1024 * 1024)),
      heapTotalMb: Math.round(memory.heapTotal / (1024 * 1024)),
      heapUsedMb: Math.round(memory.heapUsed / (1024 * 1024))
    },
    database: {
      engine: 'better-sqlite3',
      journalMode: 'WAL',
      foreignKeys: true,
      integrityOk: integrity.ok,
      integrityDetails: integrity.details
    },
    timestamp: Date.now()
  });
});

architectureRouter.get('/system/metrics', (_req: Request, res: Response) => {
  const cacheStats = CacheService.getStats();
  const jobStats = BackgroundJobManager.getJobStatuses();

  // User and conversation counts
  const userCount = (db.prepare('SELECT COUNT(*) as c FROM users').get() as any)?.c || 0;
  const conversationCount = (db.prepare('SELECT COUNT(*) as c FROM conversations').get() as any)?.c || 0;
  const messageCount = (db.prepare('SELECT COUNT(*) as c FROM messages').get() as any)?.c || 0;
  const auditCount = (db.prepare('SELECT COUNT(*) as c FROM security_audit_events').get() as any)?.c || 0;

  return sendSuccess(res, {
    platformStats: {
      totalUsers: userCount,
      totalConversations: conversationCount,
      totalMessages: messageCount,
      totalAuditEvents: auditCount
    },
    cache: cacheStats,
    backgroundJobs: jobStats,
    timestamp: Date.now()
  });
});

architectureRouter.get('/system/integrity', (_req: Request, res: Response) => {
  const result = BackupService.verifyDatabaseIntegrity();
  return sendSuccess(res, result);
});

architectureRouter.post('/system/backup', async (req: Request, res: Response) => {
  const adminId = (req.headers['x-admin-id'] as string) || undefined;
  const callerId = (req.headers['x-user-id'] as string) || '';

  if (!AccessControlEngine.hasAdminPermission(adminId || callerId, 'database', 'write')) {
    return sendError(res, 'FORBIDDEN', 'Administrative permission required to execute hot database backup', 403);
  }

  try {
    const backup = await BackupService.createHotBackup();
    return sendSuccess(res, backup, undefined, 201);
  } catch (err: any) {
    return sendError(res, 'INTERNAL_ERROR', err?.message || 'Database backup failed', 500);
  }
});

architectureRouter.get('/system/backups', (req: Request, res: Response) => {
  const adminId = (req.headers['x-admin-id'] as string) || undefined;
  const callerId = (req.headers['x-user-id'] as string) || '';

  if (!AccessControlEngine.hasAdminPermission(adminId || callerId, 'database', 'read')) {
    return sendError(res, 'FORBIDDEN', 'Administrative permission required to inspect backups', 403);
  }

  const limit = parseInt(req.query.limit as string, 10) || 20;
  const history = BackupService.getBackupHistory(limit);
  return sendSuccess(res, history);
});

architectureRouter.post('/system/wal-checkpoint', (req: Request, res: Response) => {
  const adminId = (req.headers['x-admin-id'] as string) || undefined;
  const callerId = (req.headers['x-user-id'] as string) || '';

  if (!AccessControlEngine.hasAdminPermission(adminId || callerId, 'database', 'write')) {
    return sendError(res, 'FORBIDDEN', 'Administrative permission required to trigger WAL checkpoint', 403);
  }

  const mode = (req.body?.mode as any) || 'TRUNCATE';
  const result = BackupService.checkpointWal(mode);
  return sendSuccess(res, result);
});

architectureRouter.get('/system/jobs', (_req: Request, res: Response) => {
  const jobs = BackgroundJobManager.getJobStatuses();
  return sendSuccess(res, jobs);
});
