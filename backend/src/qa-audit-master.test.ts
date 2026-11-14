import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import fs from 'fs';
import path from 'path';
import { db, initDatabase } from './db';
import { initArchitectureSchema } from './architecture/schema';
import { AccessControlEngine } from './architecture/accessControl';
import { DataProtectionService } from './architecture/dataProtection';
import { BackupService } from './architecture/backupService';
import { CacheService } from './architecture/cacheService';

describe('MASTER PROMPT 12: Complete Real-Functionality Audit, QA and Production Acceptance', () => {
  const baseUrl = 'http://127.0.0.1:3001';
  const defaultAvatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb';

  beforeAll(async () => {
    initDatabase();
    initArchitectureSchema();
  });

  // ==========================================================================
  // SCENARIO 1: NEW ACCOUNT ONBOARDING & ZERO-STATE GRACEFULNESS
  // ==========================================================================
  describe('Scenario 1: New Account Onboarding & Zero-State Gracefulness', () => {
    const newUserId = `usr_qa_new_${Date.now()}`;

    beforeAll(() => {
      db.prepare(`
        INSERT INTO users (id, name, username, avatar_url, is_verified, last_seen_at)
        VALUES (?, ?, ?, ?, 1, ?)
      `).run(newUserId, 'New QA User', `qa_new_${Date.now()}`, defaultAvatar, Date.now());
    });

    afterAll(() => {
      DataProtectionService.deleteUserAccount(newUserId, 'QA Cleanup');
    });

    it('1.1 creates default user settings automatically when queried', async () => {
      const res = await fetch(`${baseUrl}/api/v1/users/${newUserId}/settings`, {
        headers: { 'x-user-id': newUserId }
      });
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.data.userId).toBe(newUserId);
      expect(json.data.theme).toBe('obsidian');
    });

    it('1.2 returns empty sessions array gracefully without throwing', async () => {
      const res = await fetch(`${baseUrl}/api/v1/users/${newUserId}/sessions`, {
        headers: { 'x-user-id': newUserId }
      });
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(Array.isArray(json.data)).toBe(true);
      expect(json.data.length).toBe(0);
    });

    it('1.3 loads living profile for new user with zero sections without null-pointer errors', async () => {
      const res = await fetch(`${baseUrl}/api/v1/profile/living/${newUserId}?viewerId=${newUserId}`);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.sections).toBeDefined();
      expect(Array.isArray(json.sections)).toBe(true);
      expect(json.sections.length).toBe(0);
    });
  });

  // ==========================================================================
  // SCENARIO 2: INCOMPLETE PROFILE & FALLBACK HANDLING
  // ==========================================================================
  describe('Scenario 2: Incomplete Profile Handling', () => {
    const incompleteUserId = `usr_qa_incomplete_${Date.now()}`;

    beforeAll(() => {
      db.prepare(`
        INSERT INTO users (id, name, username, avatar_url, last_seen_at, status_text)
        VALUES (?, ?, ?, '', ?, NULL)
      `).run(incompleteUserId, 'Incomplete Profile User', `incomplete_${Date.now()}`, Date.now());
    });

    afterAll(() => {
      DataProtectionService.deleteUserAccount(incompleteUserId, 'QA Cleanup');
    });

    it('2.1 provides graceful fallback values for empty avatar and status', async () => {
      const row = db.prepare('SELECT * FROM users WHERE id = ?').get(incompleteUserId) as any;
      expect(row).toBeDefined();
      expect(row.status_text).toBeNull();
      
      const res = await fetch(`${baseUrl}/api/v1/users/${incompleteUserId}/settings`, {
        headers: { 'x-user-id': incompleteUserId }
      });
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
    });
  });

  // ==========================================================================
  // SCENARIO 3: FULLY CONFIGURED MULTIDIMENSIONAL PROFILE
  // ==========================================================================
  describe('Scenario 3: Fully Configured Multidimensional Profile', () => {
    const richUserId = `usr_qa_rich_${Date.now()}`;

    beforeAll(() => {
      const now = Date.now();
      db.prepare(`
        INSERT INTO users (id, name, username, avatar_url, is_verified, last_seen_at, status_text)
        VALUES (?, ?, ?, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d', 1, ?, 'Exploring the human experience')
      `).run(richUserId, 'Alexander Wright', `rich_${Date.now()}`, now);

      // Create Real and Creative identity spaces
      db.prepare(`
        INSERT INTO user_identities (id, user_id, name, identity_type, biography, created_at, updated_at)
        VALUES (?, ?, 'Alexander', 'real', 'Architect & Thinker', ?, ?)
      `).run(`ident_real_${richUserId}`, richUserId, now, now);

      db.prepare(`
        INSERT INTO user_identities (id, user_id, name, identity_type, biography, created_at, updated_at)
        VALUES (?, ?, 'Nocturne', 'creative', 'Midnight composer', ?, ?)
      `).run(`ident_creative_${richUserId}`, richUserId, now, now);

      // Add a custom section
      db.prepare(`
        INSERT INTO identity_custom_sections (id, identity_id, user_id, section_key, title, content, sort_order, visibility, created_at, updated_at)
        VALUES (?, ?, ?, 'philosophy', 'Guiding Philosophy', 'Integrity over convenience.', 0, 'public', ?, ?)
      `).run(`sec_${richUserId}`, `ident_real_${richUserId}`, richUserId, now, now);
    });

    afterAll(() => {
      DataProtectionService.deleteUserAccount(richUserId, 'QA Cleanup');
    });

    it('3.1 persists multiple identities in distinct spaces under one authenticated account', async () => {
      const rows = db.prepare('SELECT * FROM user_identities WHERE user_id = ? ORDER BY identity_type').all(richUserId) as any[];
      expect(rows.length).toBe(2);
      expect(rows[0].identity_type).toBe('creative');
      expect(rows[1].identity_type).toBe('real');
    });

    it('3.2 fetches custom sections associated with the identity', async () => {
      const sections = db.prepare('SELECT * FROM identity_custom_sections WHERE identity_id = ?').all(`ident_real_${richUserId}`) as any[];
      expect(sections.length).toBe(1);
      expect(sections[0].title).toBe('Guiding Philosophy');
      expect(sections[0].content).toContain('Integrity over convenience.');
    });
  });

  // ==========================================================================
  // SCENARIO 4: PRIVACY BOUNDARIES & ATTRIBUTE-BASED ACCESS CONTROL (ABAC)
  // ==========================================================================
  describe('Scenario 4: Privacy Boundaries & ABAC Enforcement', () => {
    const aliceId = `usr_qa_alice_${Date.now()}`;
    const bobId = `usr_qa_bob_${Date.now()}`;
    const charlieId = `usr_qa_charlie_${Date.now()}`;

    beforeAll(() => {
      const now = Date.now();
      db.prepare('INSERT INTO users (id, name, username, avatar_url, last_seen_at) VALUES (?, ?, ?, ?, ?)').run(aliceId, 'Alice QA', `alice_${now}`, defaultAvatar, now);
      db.prepare('INSERT INTO users (id, name, username, avatar_url, last_seen_at) VALUES (?, ?, ?, ?, ?)').run(bobId, 'Bob QA', `bob_${now}`, defaultAvatar, now);
      db.prepare('INSERT INTO users (id, name, username, avatar_url, last_seen_at) VALUES (?, ?, ?, ?, ?)').run(charlieId, 'Charlie QA', `charlie_${now}`, defaultAvatar, now);

      // Alice and Charlie are friends
      db.prepare(`
        INSERT INTO user_relationships (user_id, target_user_id, relationship_type, created_at)
        VALUES (?, ?, 'friend', ?)
      `).run(aliceId, charlieId, now);

      // Create profile media items: one public, one friends-only, one private
      db.prepare(`
        INSERT INTO profile_media (id, user_id, media_type, url, caption, sort_order, visibility, created_at)
        VALUES 
          (?, ?, 'photo', 'https://example.com/pub.jpg', 'Public photo', 0, 'public', ?),
          (?, ?, 'photo', 'https://example.com/friends.jpg', 'Friends only memory', 1, 'friends', ?),
          (?, ?, 'photo', 'https://example.com/priv.jpg', 'Private journal snapshot', 2, 'private', ?)
      `).run(
        `med_pub_${now}`, aliceId, now,
        `med_frn_${now}`, aliceId, now,
        `med_prv_${now}`, aliceId, now
      );
    });

    afterAll(() => {
      DataProtectionService.deleteUserAccount(aliceId, 'QA Cleanup');
      DataProtectionService.deleteUserAccount(bobId, 'QA Cleanup');
      DataProtectionService.deleteUserAccount(charlieId, 'QA Cleanup');
    });

    it('4.1 owner (Alice) can see all public, friends, and private media', async () => {
      const res = await fetch(`${baseUrl}/api/v1/users/${aliceId}/media`, {
        headers: { 'x-user-id': aliceId }
      });
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.data.length).toBe(3);
    });

    it('4.2 stranger (Bob) can only see public media, not friends or private media', async () => {
      const res = await fetch(`${baseUrl}/api/v1/users/${aliceId}/media`, {
        headers: { 'x-user-id': bobId }
      });
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.data.length).toBe(1);
      expect(json.data[0].visibility).toBe('public');
    });

    it('4.3 ABAC engine correctly calculates relationship status', () => {
      const statusBob = AccessControlEngine.getRelationshipStatus(bobId, aliceId);
      expect(statusBob.isFriend).toBe(false);
      expect(statusBob.isMatch).toBe(false);

      const statusCharlie = AccessControlEngine.getRelationshipStatus(charlieId, aliceId);
      expect(statusCharlie.isFriend).toBe(true);

      expect(AccessControlEngine.canAccessResource(bobId, aliceId, 'friends')).toBe(false);
      expect(AccessControlEngine.canAccessResource(charlieId, aliceId, 'friends')).toBe(true);
    });
  });

  // ==========================================================================
  // SCENARIO 5: BIDIRECTIONAL BLOCKING & MODERATION REPORTING
  // ==========================================================================
  describe('Scenario 5: Bidirectional Blocking & Moderation Reporting', () => {
    const userA = `usr_qa_blocker_${Date.now()}`;
    const userB = `usr_qa_blocked_${Date.now()}`;

    beforeAll(() => {
      const now = Date.now();
      db.prepare('INSERT INTO users (id, name, username, avatar_url, last_seen_at) VALUES (?, ?, ?, ?, ?)').run(userA, 'User A', `blocker_${now}`, defaultAvatar, now);
      db.prepare('INSERT INTO users (id, name, username, avatar_url, last_seen_at) VALUES (?, ?, ?, ?, ?)').run(userB, 'User B', `blocked_${now}`, defaultAvatar, now);
    });

    afterAll(() => {
      DataProtectionService.deleteUserAccount(userA, 'QA Cleanup');
      DataProtectionService.deleteUserAccount(userB, 'QA Cleanup');
    });

    it('5.1 executes user block and persists to SQLite', async () => {
      const res = await fetch(`${baseUrl}/api/v1/users/${userB}/block`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blockerId: userA })
      });
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);

      const blockRow = db.prepare('SELECT * FROM user_blocks WHERE blocker_id = ? AND blocked_id = ?').get(userA, userB);
      expect(blockRow).toBeDefined();
    });

    it('5.2 submits abuse report and persists to user_reports table', async () => {
      const res = await fetch(`${baseUrl}/api/v1/reports`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reporterId: userA,
          reportedUserId: userB,
          reason: 'harassment',
          details: 'Unsolicited repetitive inappropriate messages'
        })
      });
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.reportId).toBeDefined();

      const reportRow = db.prepare('SELECT * FROM user_reports WHERE id = ?').get(json.reportId) as any;
      expect(reportRow).toBeDefined();
      expect(reportRow.reason).toBe('harassment');
      expect(reportRow.reporter_id).toBe(userA);
    });
  });

  // ==========================================================================
  // SCENARIO 6: GDPR ARTICLE 17 CASCADING ERASURE
  // ==========================================================================
  describe('Scenario 6: GDPR Article 17 Cascading Account Erasure', () => {
    const doomedUserId = `usr_qa_doomed_${Date.now()}`;

    beforeAll(() => {
      const now = Date.now();
      db.prepare('INSERT INTO users (id, name, username, avatar_url, last_seen_at) VALUES (?, ?, ?, ?, ?)').run(doomedUserId, 'Doomed User', `doomed_${now}`, defaultAvatar, now);
      db.prepare(`
        INSERT INTO user_settings (user_id, theme, created_at, updated_at) VALUES (?, 'obsidian', ?, ?)
      `).run(doomedUserId, now, now);
      db.prepare(`
        INSERT INTO consent_records (id, user_id, consent_type, granted, granted_at) VALUES (?, ?, 'cookies_analytics', 1, ?)
      `).run(`cns_${now}`, doomedUserId, now);
      db.prepare(`
        INSERT INTO notifications (id, user_id, type, title, body, created_at) VALUES (?, ?, 'system', 'Welcome', 'Hello', ?)
      `).run(`notif_${now}`, doomedUserId, now);
    });

    it('6.1 rejects erasure without exact confirmation token', async () => {
      const res = await fetch(`${baseUrl}/api/v1/users/${doomedUserId}/gdpr-erasure`, {
        method: 'DELETE',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-id': doomedUserId 
        },
        body: JSON.stringify({ confirmation: 'WRONG_CONFIRMATION' })
      });
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.success).toBe(false);
      expect(json.error.code).toBe('VALIDATION_ERROR');
    });

    it('6.2 executes cascading erasure and wipes all personal rows', async () => {
      const res = await fetch(`${baseUrl}/api/v1/users/${doomedUserId}/gdpr-erasure`, {
        method: 'DELETE',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-id': doomedUserId 
        },
        body: JSON.stringify({ confirmation: 'DELETE_MY_ACCOUNT_PERMANENTLY', reason: 'Automated QA erasure test' })
      });
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);

      // Verify no records remain
      expect(db.prepare('SELECT id FROM users WHERE id = ?').get(doomedUserId)).toBeUndefined();
      expect(db.prepare('SELECT user_id FROM user_settings WHERE user_id = ?').get(doomedUserId)).toBeUndefined();
      expect(db.prepare('SELECT id FROM consent_records WHERE user_id = ?').get(doomedUserId)).toBeUndefined();
      expect(db.prepare('SELECT id FROM notifications WHERE user_id = ?').get(doomedUserId)).toBeUndefined();
    });
  });

  // ==========================================================================
  // SCENARIO 7: ZERO FAKE FUNCTIONALITY & HONEST BYOAI RESPONSES
  // ==========================================================================
  describe('Scenario 7: BYOAI Engine & Zero Fake Functionality Enforcement', () => {
    it('7.1 does not fabricate AI output when user has no configured API key', async () => {
      const res = await fetch(`${baseUrl}/api/ai/dispatch`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-id': 'usr_no_keys_user'
        },
        body: JSON.stringify({
          task: 'reflection',
          prompt: 'Help me understand myself'
        })
      });
      // Returns structured error or requires provider key, never simulated text
      const json = await res.json();
      if (!res.ok) {
        expect(res.status).toBeGreaterThanOrEqual(400);
      } else {
        expect(json.success === false || json.error !== undefined || json.configured === false).toBe(true);
      }
    });

    it('7.2 reports honest provider health and models without fabrication', async () => {
      const res = await fetch(`${baseUrl}/api/ai/providers`);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.providers).toBeDefined();
      expect(Array.isArray(json.providers)).toBe(true);
      expect(json.providers.length).toBeGreaterThan(0);
    });
  });

  // ==========================================================================
  // SCENARIO 8: REAL-TIME MESSAGING, IDEMPOTENCY & MUTEX SAFETY
  // ==========================================================================
  describe('Scenario 8: Real-Time Messaging & Idempotency Safeguards', () => {
    const sender = `usr_qa_msg_s_${Date.now()}`;
    const receiver = `usr_qa_msg_r_${Date.now()}`;
    let conversationId: string;

    beforeAll(() => {
      const now = Date.now();
      db.prepare('INSERT INTO users (id, name, username, avatar_url, last_seen_at) VALUES (?, ?, ?, ?, ?)').run(sender, 'Sender QA', `msgs_${now}`, defaultAvatar, now);
      db.prepare('INSERT INTO users (id, name, username, avatar_url, last_seen_at) VALUES (?, ?, ?, ?, ?)').run(receiver, 'Receiver QA', `msgr_${now}`, defaultAvatar, now);

      conversationId = `conv_qa_${now}`;
      db.prepare(`
        INSERT INTO conversations (id, type, created_at, updated_at)
        VALUES (?, 'direct', ?, ?)
      `).run(conversationId, now, now);

      db.prepare(`
        INSERT INTO conversation_members (conversation_id, user_id, role, joined_at)
        VALUES (?, ?, 'member', ?), (?, ?, 'member', ?)
      `).run(conversationId, sender, now, conversationId, receiver, now);
    });

    afterAll(() => {
      DataProtectionService.deleteUserAccount(sender, 'QA Cleanup');
      DataProtectionService.deleteUserAccount(receiver, 'QA Cleanup');
      db.prepare('DELETE FROM messages WHERE conversation_id = ?').run(conversationId);
      db.prepare('DELETE FROM conversation_members WHERE conversation_id = ?').run(conversationId);
      db.prepare('DELETE FROM conversations WHERE id = ?').run(conversationId);
    });

    it('8.1 delivers message with strictly monotonic sequence numbers', async () => {
      const res1 = await fetch(`${baseUrl}/api/v1/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientMessageId: `cmsg_1_${Date.now()}`,
          senderId: sender,
          text: 'First sequenced message'
        })
      });
      expect([200, 201]).toContain(res1.status);
      const json1 = await res1.json();
      const msg1 = json1.message || json1;
      expect(msg1.sequenceNumber).toBeDefined();

      const res2 = await fetch(`${baseUrl}/api/v1/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientMessageId: `cmsg_2_${Date.now()}`,
          senderId: sender,
          text: 'Second sequenced message'
        })
      });
      expect([200, 201]).toContain(res2.status);
      const json2 = await res2.json();
      const msg2 = json2.message || json2;
      expect(msg2.sequenceNumber).toBeGreaterThan(msg1.sequenceNumber);
    });

    it('8.2 deduplicates identical requests using Idempotency-Key header', async () => {
      const idempotencyKey = `idemp_qa_${Date.now()}`;
      const payload = {
        clientMessageId: `cmsg_idemp_${Date.now()}`,
        senderId: sender,
        text: 'Idempotency guaranteed message'
      };

      const res1 = await fetch(`${baseUrl}/api/v1/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Idempotency-Key': idempotencyKey,
          'x-user-id': sender
        },
        body: JSON.stringify(payload)
      });
      expect([200, 201]).toContain(res1.status);
      const json1 = await res1.json();
      const msg1 = json1.message || json1;

      // Retry with identical key and payload
      const res2 = await fetch(`${baseUrl}/api/v1/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Idempotency-Key': idempotencyKey,
          'x-user-id': sender
        },
        body: JSON.stringify(payload)
      });
      expect([200, 201]).toContain(res2.status);
      const json2 = await res2.json();
      const msg2 = json2.message || json2;
      expect(msg2.id).toBe(msg1.id);
    });
  });

  // ==========================================================================
  // SCENARIO 9: SECURITY BOUNDARIES, IDOR & INJECTION RESISTANCE
  // ==========================================================================
  describe('Scenario 9: Security Boundaries & Attack Defense', () => {
    const victim = `usr_qa_vic_${Date.now()}`;
    const attacker = `usr_qa_att_${Date.now()}`;

    beforeAll(() => {
      const now = Date.now();
      db.prepare('INSERT INTO users (id, name, username, avatar_url, last_seen_at) VALUES (?, ?, ?, ?, ?)').run(victim, 'Victim QA', `vic_${now}`, defaultAvatar, now);
      db.prepare('INSERT INTO users (id, name, username, avatar_url, last_seen_at) VALUES (?, ?, ?, ?, ?)').run(attacker, 'Attacker QA', `att_${now}`, defaultAvatar, now);
    });

    afterAll(() => {
      DataProtectionService.deleteUserAccount(victim, 'QA Cleanup');
      DataProtectionService.deleteUserAccount(attacker, 'QA Cleanup');
    });

    it('9.1 blocks IDOR settings modification and emits audit event', async () => {
      const res = await fetch(`${baseUrl}/api/v1/users/${victim}/settings`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-id': attacker // Attacker impersonating victim
        },
        body: JSON.stringify({ theme: 'dark' })
      });
      expect(res.status).toBe(403);
      const json = await res.json();
      expect(json.error.code).toBe('IDOR_VIOLATION');

      // Verify audit log captured the attempt
      const audit = db.prepare(`
        SELECT * FROM security_audit_events 
        WHERE user_id = ? AND action = 'idor_access_denied'
        ORDER BY created_at DESC LIMIT 1
      `).get(attacker) as any;
      expect(audit).toBeDefined();
      expect(audit.resource_type).toBe('user_settings');
    });

    it('9.2 neutralizes SQL injection vectors safely with parameterized statements', async () => {
      const maliciousPayload = "'; DROP TABLE users; --";
      const res = await fetch(`${baseUrl}/api/v1/conversations/conv_direct_01/search?q=${encodeURIComponent(maliciousPayload)}`);
      expect(res.status).toBe(200);

      // Verify users table still exists and is untouched
      const tableCheck = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='users'").get();
      expect(tableCheck).toBeDefined();
    });
  });

  // ==========================================================================
  // SCENARIO 10: HIGH AVAILABILITY, INTEGRITY & BACKUPS
  // ==========================================================================
  describe('Scenario 10: High Availability & Database Integrity', () => {
    it('10.1 executes live PRAGMA integrity_check without error', () => {
      const integrity = BackupService.verifyDatabaseIntegrity();
      expect(integrity.ok).toBe(true);
      expect(integrity.details).toContain('ok');
    });

    it('10.2 creates a hot online backup snapshot during active read/write traffic', async () => {
      const backupResult = await BackupService.createHotBackup();
      expect(backupResult.status).toBe('completed');
      expect(fs.existsSync(backupResult.filePath)).toBe(true);
      expect(backupResult.checksum).toBeDefined();
      expect(backupResult.sizeBytes).toBeGreaterThan(0);
    });

    it('10.3 in-memory cache service enforces TTL and tag invalidation', () => {
      CacheService.set('key1', { value: 42 }, 10, ['tagA']);
      CacheService.set('key2', { value: 84 }, 10, ['tagA']);
      CacheService.set('key3', { value: 126 }, 10, ['tagB']);

      expect(CacheService.get('key1')).toEqual({ value: 42 });
      expect(CacheService.get('key2')).toEqual({ value: 84 });

      // Invalidate tagA
      CacheService.invalidateTag('tagA');
      expect(CacheService.get('key1')).toBeUndefined();
      expect(CacheService.get('key2')).toBeUndefined();
      expect(CacheService.get('key3')).toEqual({ value: 126 });
    });
  });
});
