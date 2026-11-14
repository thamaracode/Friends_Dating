import { describe, it, expect, beforeAll } from 'vitest';
import { db } from './db';

describe('Exhaustive Interaction Reality & Persistence Test Suite', () => {
  const API_URL = 'http://127.0.0.1:3001/api/v1';
  let testConvId: string = '';

  beforeAll(() => {
    // Ensure a conversation exists for testing
    const existing = db.prepare('SELECT id FROM conversations LIMIT 1').get() as { id: string } | undefined;
    if (existing) {
      testConvId = existing.id;
    } else {
      testConvId = 'conv_reality_test';
      db.prepare(`
        INSERT OR REPLACE INTO conversations (id, type, created_at, updated_at)
        VALUES (?, 'direct', ?, ?)
      `).run(testConvId, Date.now(), Date.now());
    }

    // Ensure usr_me is a member
    db.prepare(`
      INSERT OR REPLACE INTO conversation_members (conversation_id, user_id, joined_at, is_archived, is_muted)
      VALUES (?, 'usr_me', ?, 0, 0)
    `).run(testConvId, Date.now());
  });

  // -------------------------------------------------------------------------
  // 1. Conversation Archive Interaction & SQLite Persistence
  // -------------------------------------------------------------------------
  it('toggles and persists conversation archive state in SQLite', async () => {
    // 1. Archive
    const resArchive = await fetch(`${API_URL}/conversations/${testConvId}/archive`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: 'usr_me', isArchived: true })
    });

    expect(resArchive.status).toBe(200);
    const dataArchive = await resArchive.json();
    expect(dataArchive.success).toBe(true);
    expect(dataArchive.isArchived).toBe(true);

    // Direct SQLite verification
    const dbRow1 = db.prepare(`
      SELECT is_archived FROM conversation_members WHERE conversation_id = ? AND user_id = 'usr_me'
    `).get(testConvId) as { is_archived: number };
    expect(dbRow1.is_archived).toBe(1);

    // 2. Unarchive
    const resUnarchive = await fetch(`${API_URL}/conversations/${testConvId}/archive`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: 'usr_me', isArchived: false })
    });

    expect(resUnarchive.status).toBe(200);
    const dataUnarchive = await resUnarchive.json();
    expect(dataUnarchive.success).toBe(true);
    expect(dataUnarchive.isArchived).toBe(false);

    // Direct SQLite verification
    const dbRow2 = db.prepare(`
      SELECT is_archived FROM conversation_members WHERE conversation_id = ? AND user_id = 'usr_me'
    `).get(testConvId) as { is_archived: number };
    expect(dbRow2.is_archived).toBe(0);
  });

  // -------------------------------------------------------------------------
  // 2. Conversation Mute Interaction & SQLite Persistence
  // -------------------------------------------------------------------------
  it('toggles and persists conversation mute state in SQLite', async () => {
    // 1. Mute for 8 hours
    const resMute = await fetch(`${API_URL}/conversations/${testConvId}/mute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: 'usr_me', isMuted: true, durationHours: 8 })
    });

    expect(resMute.status).toBe(200);
    const dataMute = await resMute.json();
    expect(dataMute.success).toBe(true);
    expect(dataMute.isMuted).toBe(true);
    expect(dataMute.durationHours).toBe(8);

    // Direct SQLite verification
    const dbRowMuted = db.prepare(`
      SELECT is_muted FROM conversation_members WHERE conversation_id = ? AND user_id = 'usr_me'
    `).get(testConvId) as { is_muted: number };
    expect(dbRowMuted.is_muted).toBe(1);

    // 2. Unmute
    const resUnmute = await fetch(`${API_URL}/conversations/${testConvId}/mute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: 'usr_me', isMuted: false })
    });

    expect(resUnmute.status).toBe(200);
    const dataUnmute = await resUnmute.json();
    expect(dataUnmute.success).toBe(true);
    expect(dataUnmute.isMuted).toBe(false);

    // Direct SQLite verification
    const dbRowUnmuted = db.prepare(`
      SELECT is_muted FROM conversation_members WHERE conversation_id = ? AND user_id = 'usr_me'
    `).get(testConvId) as { is_muted: number };
    expect(dbRowUnmuted.is_muted).toBe(0);
  });

  // -------------------------------------------------------------------------
  // 3. Conversation Auto-Delete Configuration
  // -------------------------------------------------------------------------
  it('configures auto-delete TTL for conversation', async () => {
    const res = await fetch(`${API_URL}/conversations/${testConvId}/auto-delete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ttlHours: 24 })
    });

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.conversationId).toBe(testConvId);
    expect(data.ttlHours).toBe(24);
  });

  // -------------------------------------------------------------------------
  // 4. Cascading User Purge & Complete SQLite Deletion
  // -------------------------------------------------------------------------
  it('purges user record and all cascading relations from SQLite database', async () => {
    const purgeUserId = `usr_purge_test_${Date.now()}`;

    // Seed temporary user and related data
    db.prepare(`
      INSERT INTO users (id, name, username, avatar_url, is_verified, last_seen_at)
      VALUES (?, 'Audit Purge Target', ?, 'https://example.com/avatar.png', 0, ?)
    `).run(purgeUserId, `purge_${Date.now()}`, Date.now());

    db.prepare(`
      INSERT INTO conversation_members (conversation_id, user_id, joined_at)
      VALUES (?, ?, ?)
    `).run(testConvId, purgeUserId, Date.now());

    // Execute DELETE endpoint
    const res = await fetch(`${API_URL}/users/${purgeUserId}`, {
      method: 'DELETE'
    });

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.deleted).toBe(true);
    expect(data.userId).toBe(purgeUserId);

    // Verify user is gone from users table
    const userCheck = db.prepare('SELECT id FROM users WHERE id = ?').get(purgeUserId);
    expect(userCheck).toBeUndefined();

    // Verify membership is gone from conversation_members
    const memberCheck = db.prepare('SELECT * FROM conversation_members WHERE user_id = ?').get(purgeUserId);
    expect(memberCheck).toBeUndefined();
  });
});
