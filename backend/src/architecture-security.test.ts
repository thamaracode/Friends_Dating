import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import express from 'express';
import fs from 'fs';
import { db, initDatabase } from './db';
import { initArchitectureSchema } from './architecture/schema';
import { architectureRouter } from './architecture/router';
import { AccessControlEngine } from './architecture/accessControl';
import { DataProtectionService } from './architecture/dataProtection';
import { BackupService } from './architecture/backupService';
import { CacheService } from './architecture/cacheService';
import { BackgroundJobManager } from './architecture/backgroundJobs';
import { createRequestHash } from './architecture/idempotency';

const testApp = express();
testApp.use(express.json());
testApp.use('/api/v1', architectureRouter);

describe('Master Prompt 11: Production-Grade Backend, Data Architecture and Security', () => {
  let serverInstance: any;
  let baseUrl: string;

  beforeAll(async () => {
    initDatabase();
    initArchitectureSchema();
    BackgroundJobManager.start();

    await new Promise<void>((resolve) => {
      serverInstance = testApp.listen(0, () => {
        const port = (serverInstance.address() as any).port;
        baseUrl = `http://127.0.0.1:${port}/api/v1`;
        resolve();
      });
    });
  });

  afterAll(() => {
    if (serverInstance) {
      serverInstance.close();
    }
    BackgroundJobManager.stop();
  });

  // ==========================================================================
  // 1. DATABASE DESIGN & SCHEMA INTEGRITY
  // ==========================================================================
  describe('1. Normalized Database Design & Schema Integrity', () => {
    it('initializes all normalized architectural tables in SQLite', () => {
      const requiredTables = [
        'user_settings',
        'auth_sessions',
        'connection_requests',
        'notifications',
        'profile_media',
        'consent_records',
        'user_data_exports',
        'security_audit_events',
        'idempotency_keys',
        'backup_history'
      ];

      for (const table of requiredTables) {
        const row = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name=?").get(table);
        expect(row, `Table ${table} must exist`).toBeDefined();
      }
    });

    it('passes SQLite PRAGMA integrity_check', () => {
      const integrity = BackupService.verifyDatabaseIntegrity();
      expect(integrity.ok).toBe(true);
      expect(integrity.details).toContain('ok');
    });

    it('safely performs WAL checkpointing without write starvation', () => {
      const result = BackupService.checkpointWal('PASSIVE');
      expect(result).toHaveProperty('busy');
      expect(result).toHaveProperty('log');
      expect(result).toHaveProperty('checkpointed');
    });
  });

  // ==========================================================================
  // 2. USER SETTINGS & PREFERENCES
  // ==========================================================================
  describe('2. User Settings & Preferences API', () => {
    it('GET /api/v1/users/:userId/settings returns normalized settings for user', async () => {
      const res = await fetch(`${baseUrl}/users/usr_me/settings`, {
        headers: { 'x-user-id': 'usr_me' }
      });
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.data.userId).toBe('usr_me');
      expect(body.data.theme).toBeDefined();
      expect(['minimal', 'standard', 'enhanced']).toContain(body.data.dataSharingLevel);
    });

    it('PUT /api/v1/users/:userId/settings updates preferences with audit log', async () => {
      const res = await fetch(`${baseUrl}/users/usr_me/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': 'usr_me'
        },
        body: JSON.stringify({
          theme: 'dark',
          twoFactorEnabled: true,
          dataSharingLevel: 'standard'
        })
      });
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.data.theme).toBe('dark');
      expect(body.data.twoFactorEnabled).toBe(true);

      // Verify audit event persisted
      const audit = db.prepare("SELECT * FROM security_audit_events WHERE user_id = 'usr_me' AND action = 'user_settings_updated' ORDER BY created_at DESC LIMIT 1").get() as any;
      expect(audit).toBeDefined();
      expect(audit.domain).toBe('user_profile');
    });

    it('blocks unauthorized caller from inspecting another user settings (IDOR Shield)', async () => {
      const res = await fetch(`${baseUrl}/users/usr_alex/settings`, {
        headers: { 'x-user-id': 'usr_me' }
      });
      const body = await res.json();

      expect(res.status).toBe(403);
      expect(body.success).toBe(false);
      expect(body.error.code).toBe('IDOR_VIOLATION');
    });
  });

  // ==========================================================================
  // 3. AUTHENTICATION SESSIONS
  // ==========================================================================
  describe('3. Authentication Sessions & Revocation', () => {
    it('GET /api/v1/users/:userId/sessions returns active sessions', async () => {
      const res = await fetch(`${baseUrl}/users/usr_me/sessions`, {
        headers: { 'x-user-id': 'usr_me' }
      });
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.success).toBe(true);
      expect(Array.isArray(body.data)).toBe(true);
      expect(body.data.length).toBeGreaterThan(0);
      expect(body.data[0].is_revoked).toBe(0);
    });

    it('DELETE /api/v1/users/:userId/sessions/:id revokes a targeted session', async () => {
      // Create temporary session
      const testSessionId = `sess_test_revocation_${Date.now()}`;
      db.prepare(`
        INSERT OR REPLACE INTO auth_sessions (
          id, user_id, token_hash, device_name, is_revoked, expires_at, last_active_at, created_at
        ) VALUES (?, 'usr_me', ?, 'iPad Pro', 0, ?, ?, ?)
      `).run(testSessionId, `hash_temp_${Date.now()}_${Math.random()}`, Date.now() + 86400000, Date.now(), Date.now());

      const res = await fetch(`${baseUrl}/users/usr_me/sessions/${testSessionId}`, {
        method: 'DELETE',
        headers: { 'x-user-id': 'usr_me' }
      });
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.data.revoked).toBe(true);

      const check = db.prepare('SELECT is_revoked FROM auth_sessions WHERE id = ?').get(testSessionId) as { is_revoked: number };
      expect(check.is_revoked).toBe(1);
    });
  });

  // ==========================================================================
  // 4. EXPLICIT CONNECTION REQUESTS & NOTIFICATIONS
  // ==========================================================================
  describe('4. Connection Requests & Notification Engine', () => {
    it('POST /api/v1/connection-requests dispatches a connection request and notification', async () => {
      // Clean up previous test requests if any
      db.prepare("DELETE FROM connection_requests WHERE sender_id = 'usr_alex' AND recipient_id = 'usr_dinuk'").run();

      const res = await fetch(`${baseUrl}/connection-requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': 'usr_alex'
        },
        body: JSON.stringify({
          recipientId: 'usr_dinuk',
          connectionType: 'creative_collaboration',
          introNote: 'Would love to collaborate on game soundtrack art!'
        })
      });
      const body = await res.json();

      expect(res.status).toBe(201);
      expect(body.success).toBe(true);
      expect(body.data.status).toBe('pending');

      // Verify notification created for recipient
      const notif = db.prepare("SELECT * FROM notifications WHERE user_id = 'usr_dinuk' AND type = 'connection_request' ORDER BY created_at DESC LIMIT 1").get() as any;
      expect(notif).toBeDefined();
      expect(notif.is_read).toBe(0);
    });

    it('rejects self-targeted connection requests', async () => {
      const res = await fetch(`${baseUrl}/connection-requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': 'usr_me'
        },
        body: JSON.stringify({
          recipientId: 'usr_me',
          connectionType: 'friendship'
        })
      });
      const body = await res.json();

      expect(res.status).toBe(400);
      expect(body.error.code).toBe('VALIDATION_ERROR');
    });

    it('POST /api/v1/connection-requests/:id/respond accepts request and establishes relationship', async () => {
      // Clean up any test relationships
      db.prepare("DELETE FROM user_relationships WHERE target_user_id = 'usr_tara' OR user_id = 'usr_tara'").run();

      // Seed a pending request from usr_dinuk to usr_me
      const testReqId = `creq_test_dinuk_${Date.now()}`;
      db.prepare("DELETE FROM connection_requests WHERE id = ?").run(testReqId);
      db.prepare(`
        INSERT INTO connection_requests (
          id, sender_id, recipient_id, connection_type, status, note, created_at
        ) VALUES (?, 'usr_dinuk', 'usr_me', 'friendship', 'pending', 'Hello Kavindu!', ?)
      `).run(testReqId, Date.now());

      const res = await fetch(`${baseUrl}/connection-requests/${testReqId}/respond`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': 'usr_me'
        },
        body: JSON.stringify({ action: 'accept' })
      });
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.data.status).toBe('accepted');

      // Verify bidirectional relationship established
      const rel = db.prepare("SELECT * FROM user_relationships WHERE user_id = 'usr_me' AND target_user_id = 'usr_dinuk'").get();
      expect(rel).toBeDefined();

      // Clean up
      db.prepare("DELETE FROM user_relationships WHERE target_user_id = 'usr_dinuk' OR user_id = 'usr_dinuk'").run();
      db.prepare("DELETE FROM connection_requests WHERE id = ?").run(testReqId);
    });

    it('GET /api/v1/notifications lists and filters notifications', async () => {
      const res = await fetch(`${baseUrl}/notifications`, {
        headers: { 'x-user-id': 'usr_me' }
      });
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.success).toBe(true);
      expect(Array.isArray(body.data)).toBe(true);
      expect(body.meta.total).toBeDefined();
    });

    it('POST /api/v1/notifications/mark-all-read marks notifications as read', async () => {
      const res = await fetch(`${baseUrl}/notifications/mark-all-read`, {
        method: 'POST',
        headers: { 'x-user-id': 'usr_me' }
      });
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.success).toBe(true);

      const unreadCount = (db.prepare("SELECT COUNT(*) as c FROM notifications WHERE user_id = 'usr_me' AND is_read = 0").get() as any).c;
      expect(unreadCount).toBe(0);
    });
  });

  // ==========================================================================
  // 5. ACCESS CONTROL (ABAC & RBAC) & IDOR SHIELD
  // ==========================================================================
  describe('5. Access Control (ABAC & RBAC) & Security Governance', () => {
    it('ABAC correctly grants owner full access to private items', () => {
      const canAccess = AccessControlEngine.canAccessResource('usr_me', 'usr_me', 'private');
      expect(canAccess).toBe(true);
    });

    it('ABAC blocks third parties from private items', () => {
      const canAccess = AccessControlEngine.canAccessResource('usr_alex', 'usr_me', 'private');
      expect(canAccess).toBe(false);
    });

    it('ABAC grants public items to any caller', () => {
      const canAccess = AccessControlEngine.canAccessResource('usr_stranger', 'usr_me', 'public');
      expect(canAccess).toBe(true);
    });

    it('ABAC grants match-restricted items only to confirmed matches', () => {
      // usr_me and usr_alex are mutual matches in seed data
      const matchCanAccess = AccessControlEngine.canAccessResource('usr_alex', 'usr_me', 'matches');
      expect(matchCanAccess).toBe(true);

      // usr_stranger is not a match
      const strangerCanAccess = AccessControlEngine.canAccessResource('usr_stranger_99', 'usr_me', 'matches');
      expect(strangerCanAccess).toBe(false);
    });

    it('RBAC verifies administrative roles and permissions from Casbin-style table', () => {
      expect(AccessControlEngine.hasAdminPermission('usr_me', 'features', 'write')).toBe(true); // usr_me is super_admin
      expect(AccessControlEngine.hasAdminPermission('adm_system', '*', '*')).toBe(true);
      expect(AccessControlEngine.hasAdminPermission('usr_alex', 'database', 'write')).toBe(false); // regular user
    });

    it('GET /api/v1/users/:userId/media filters items according to ABAC privacy rules', async () => {
      // usr_stranger visiting usr_me should only receive public media
      const res = await fetch(`${baseUrl}/users/usr_me/media`, {
        headers: { 'x-user-id': 'usr_stranger_unknown' }
      });
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.success).toBe(true);
      const mediaList = body.data;
      expect(mediaList.every((m: any) => m.visibility === 'public')).toBe(true);
    });
  });

  // ==========================================================================
  // 6. IDEMPOTENCY SYSTEM
  // ==========================================================================
  describe('6. Idempotency Support for Mutating Operations', () => {
    it('creates deterministic request hashes', () => {
      const hash1 = createRequestHash('POST', '/api/v1/resource', { name: 'Soulverse' });
      const hash2 = createRequestHash('POST', '/api/v1/resource', { name: 'Soulverse' });
      const hash3 = createRequestHash('POST', '/api/v1/resource', { name: 'Different' });

      expect(hash1).toBe(hash2);
      expect(hash1).not.toBe(hash3);
    });

    it('replays identical cached response on repeated request with Idempotency-Key', async () => {
      const key = `idemp_key_${Date.now()}`;

      // First call
      const res1 = await fetch(`${baseUrl}/users/usr_me/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': 'usr_me',
          'idempotency-key': key
        },
        body: JSON.stringify({ theme: 'obsidian', language: 'en' })
      });
      const body1 = await res1.json();
      expect(res1.status).toBe(200);

      // Second call with same key and same body
      const res2 = await fetch(`${baseUrl}/users/usr_me/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': 'usr_me',
          'idempotency-key': key
        },
        body: JSON.stringify({ theme: 'obsidian', language: 'en' })
      });
      const body2 = await res2.json();

      expect(res2.status).toBe(200);
      expect(res2.headers.get('x-cache-lookup')).toBe('IDEMPOTENT_REPLAY');
      expect(body2.data.theme).toBe(body1.data.theme);
    });

    it('detects and rejects payload mutation with same Idempotency-Key (409 Conflict)', async () => {
      const key = `idemp_conflict_${Date.now()}`;

      // First call
      await fetch(`${baseUrl}/users/usr_me/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': 'usr_me',
          'idempotency-key': key
        },
        body: JSON.stringify({ theme: 'obsidian' })
      });

      // Second call with same key but differing payload
      const conflictRes = await fetch(`${baseUrl}/users/usr_me/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': 'usr_me',
          'idempotency-key': key
        },
        body: JSON.stringify({ theme: 'light' })
      });
      const conflictBody = await conflictRes.json();

      expect(conflictRes.status).toBe(409);
      expect(conflictBody.error.code).toBe('IDEMPOTENCY_CONFLICT');
    });
  });

  // ==========================================================================
  // 7. DATA PROTECTION & GDPR RIGHTS
  // ==========================================================================
  describe('7. Data Protection, GDPR Rights & Consent Architecture', () => {
    it('POST /api/v1/users/:userId/consent records user consent with version and IP', async () => {
      const res = await fetch(`${baseUrl}/users/usr_me/consent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': 'usr_me'
        },
        body: JSON.stringify({
          consentType: 'ai_processing',
          granted: true,
          version: '1.2.0'
        })
      });
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.data.consentType).toBe('ai_processing');
      expect(body.data.granted).toBe(true);
      expect(body.data.version).toBe('1.2.0');
    });

    it('POST /api/v1/users/:userId/export generates a complete GDPR Article 20 data bundle', async () => {
      const res = await fetch(`${baseUrl}/users/usr_me/export`, {
        method: 'POST',
        headers: { 'x-user-id': 'usr_me' }
      });
      const body = await res.json();

      expect(res.status).toBe(202);
      expect(body.success).toBe(true);
      expect(body.data.status).toBe('completed');
      expect(body.data.fileSizeBytes).toBeGreaterThan(0);
      expect(fs.existsSync(body.data.filePath)).toBe(true);

      // Verify contents of the export file
      const fileData = JSON.parse(fs.readFileSync(body.data.filePath, 'utf8'));
      expect(fileData.user.username).toBe('kavindu');
      expect(fileData.settings).toBeDefined();
      expect(fileData.identities).toBeDefined();
      expect(fileData.markdownManifesto).toBeDefined();
      expect(fileData.privacyStatement).toBeDefined();
    });

    it('DELETE /api/v1/users/:userId/gdpr-erasure completely purges user records atomically', async () => {
      // Create dedicated sacrificial user
      const victimId = 'usr_victim_gdpr';
      db.prepare(`
        INSERT INTO users (id, name, username, avatar_url, last_seen_at)
        VALUES (?, 'Victim User', 'victim_gdpr', 'https://example.com/avatar.png', ?)
      `).run(victimId, Date.now());

      db.prepare(`
        INSERT INTO user_settings (user_id, created_at, updated_at) VALUES (?, ?, ?)
      `).run(victimId, Date.now(), Date.now());

      const res = await fetch(`${baseUrl}/users/${victimId}/gdpr-erasure`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': victimId
        },
        body: JSON.stringify({
          confirmation: 'DELETE_MY_ACCOUNT_PERMANENTLY',
          reason: 'Testing erasure cascade'
        })
      });
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.data.purgedTables.users).toBe(1);

      // Verify victim is eradicated from users and settings
      const userCheck = db.prepare('SELECT id FROM users WHERE id = ?').get(victimId);
      const settingsCheck = db.prepare('SELECT user_id FROM user_settings WHERE user_id = ?').get(victimId);
      expect(userCheck).toBeUndefined();
      expect(settingsCheck).toBeUndefined();
    });
  });

  // ==========================================================================
  // 8. PERFORMANCE, HOT BACKUPS & SYSTEM TELEMETRY
  // ==========================================================================
  describe('8. Performance, In-Memory Caching & Hot Backups', () => {
    it('CacheService sets, gets, tracks hit rate, and invalidates by tag', () => {
      CacheService.clear();

      CacheService.set('catalog:categories', [{ id: 'love' }], 60, ['catalog', 'navigation']);
      expect(CacheService.has('catalog:categories')).toBe(true);

      const cached = CacheService.get('catalog:categories');
      expect(cached).toEqual([{ id: 'love' }]);

      const stats = CacheService.getStats();
      expect(stats.hits).toBe(1);
      expect(stats.misses).toBe(0);

      // Tag invalidation
      const invalidatedCount = CacheService.invalidateTag('catalog');
      expect(invalidatedCount).toBe(1);
      expect(CacheService.has('catalog:categories')).toBe(false);
    });

    it('BackupService creates hot online SQLite snapshot with SHA-256 checksum', async () => {
      const backup = await BackupService.createHotBackup();

      expect(backup).toBeDefined();
      expect(backup.id).toBeDefined();
      expect(backup.sizeBytes).toBeGreaterThan(0);
      expect(backup.checksum).toBeDefined();
      expect(backup.checksum!.length).toBe(64); // SHA-256
      expect(fs.existsSync(backup.filePath)).toBe(true);
    });

    it('GET /api/v1/system/health returns complete engine status and integrity', async () => {
      const res = await fetch(`${baseUrl}/system/health`);
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.data.status).toBe('healthy');
      expect(body.data.database.engine).toBe('better-sqlite3');
      expect(body.data.database.journalMode).toBe('WAL');
      expect(body.data.database.integrityOk).toBe(true);
    });

    it('GET /api/v1/system/metrics returns platform statistics, cache stats and jobs', async () => {
      const res = await fetch(`${baseUrl}/system/metrics`);
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.data.platformStats.totalUsers).toBeGreaterThan(0);
      expect(body.data.cache).toBeDefined();
      expect(Array.isArray(body.data.backgroundJobs)).toBe(true);
    });
  });
});
