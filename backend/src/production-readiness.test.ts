import { describe, it, expect, beforeAll } from 'vitest';
import { db } from './db';

describe('Production Readiness & Security Verification Suite', () => {
  const API_URL = 'http://127.0.0.1:3001/api/v1';

  const userAlice = 'usr_prod_alice';
  const userBob = 'usr_prod_bob';
  const userCharlie = 'usr_prod_charlie';
  const testConv = 'conv_prod_alice_bob';

  beforeAll(() => {
    // Seed users
    const now = Date.now();
    const seedUser = db.prepare(`
      INSERT OR REPLACE INTO users (id, name, username, avatar_url, is_verified, last_seen_at, status_text)
      VALUES (?, ?, ?, 'https://example.com/avatar.png', 1, ?, ?)
    `);

    seedUser.run(userAlice, 'Alice Prod', 'alice_prod', now, 'Online');
    seedUser.run(userBob, 'Bob Prod', 'bob_prod', now, 'Looking for friends');
    seedUser.run(userCharlie, 'Charlie Outsider', 'charlie_prod', now, 'Offline');

    // Seed conversation between Alice and Bob
    db.prepare(`
      INSERT OR REPLACE INTO conversations (id, type, created_at, updated_at)
      VALUES (?, 'direct', ?, ?)
    `).run(testConv, now, now);

    db.prepare(`
      INSERT OR REPLACE INTO conversation_members (conversation_id, user_id, joined_at)
      VALUES (?, ?, ?)
    `).run(testConv, userAlice, now);

    db.prepare(`
      INSERT OR REPLACE INTO conversation_members (conversation_id, user_id, joined_at)
      VALUES (?, ?, ?)
    `).run(testConv, userBob, now);

    // Clean up any stale blocks
    db.prepare('DELETE FROM user_blocks WHERE blocker_id IN (?, ?, ?) OR blocked_id IN (?, ?, ?)').run(
      userAlice, userBob, userCharlie,
      userAlice, userBob, userCharlie
    );
  });

  // =========================================================================
  // 1. DATA ISOLATION & IDOR DEFENSE
  // =========================================================================
  describe('Data Isolation & IDOR Protections', () => {
    it('prevents non-enrolled user (Charlie) from injecting messages into Alice & Bob conversation', async () => {
      const res = await fetch(`${API_URL}/conversations/${testConv}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userCharlie
        },
        body: JSON.stringify({
          clientMessageId: `msg_tamper_${Date.now()}`,
          senderId: userCharlie,
          text: 'Unauthorized outsider message attempt'
        })
      });

      expect(res.status).toBe(403);
      const data = await res.json();
      expect(data.code).toBe('NOT_CONVERSATION_MEMBER');
    });

    it('prevents Bob from editing Alice message (author verification)', async () => {
      // 1. Alice posts legitimate message
      const resMsg = await fetch(`${API_URL}/conversations/${testConv}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userAlice
        },
        body: JSON.stringify({
          clientMessageId: `msg_alice_${Date.now()}`,
          senderId: userAlice,
          text: 'Original message authored by Alice'
        })
      });
      expect(resMsg.status).toBe(201);
      const msgData = await resMsg.json();
      const messageId = msgData.message.id;

      // 2. Bob attempts to tamper with Alice's message
      const resTamper = await fetch(`${API_URL}/messages/${messageId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userBob
        },
        body: JSON.stringify({
          editorId: userBob,
          text: 'Tampered message by Bob'
        })
      });

      expect(resTamper.status).toBe(403);
      const err = await resTamper.json();
      expect(err.error).toBe('Only author can edit this message');
    });

    it('prevents Bob from deleting Alice message for everyone', async () => {
      // 1. Alice posts legitimate message
      const resMsg = await fetch(`${API_URL}/conversations/${testConv}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userAlice
        },
        body: JSON.stringify({
          clientMessageId: `msg_alice_del_${Date.now()}`,
          senderId: userAlice,
          text: 'Alice message that Bob wants to delete'
        })
      });
      const msgData = await resMsg.json();
      const messageId = msgData.message.id;

      // 2. Bob attempts to delete Alice's message for everyone
      const resDel = await fetch(`${API_URL}/messages/${messageId}?forEveryone=true`, {
        method: 'DELETE',
        headers: {
          'x-user-id': userBob
        }
      });

      expect(resDel.status).toBe(403);
      const err = await resDel.json();
      expect(err.error).toContain('Only the message author can delete this message for everyone');
    });

    it('prevents unauthorized user from deleting another user confession', async () => {
      // 1. Alice posts a confession
      const resConf = await fetch(`${API_URL}/confessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userAlice
        },
        body: JSON.stringify({
          userId: userAlice,
          title: 'Alice Private Confession',
          story: 'This is a deeply personal story about overcoming fear and uncertainty.',
          visibility: 'anonymous'
        })
      });
      expect(resConf.status).toBe(200);
      const confData = await resConf.json();
      const confessionId = confData.confession.id;

      // 2. Bob attempts to delete Alice's confession
      const resDelete = await fetch(`${API_URL}/confessions/${confessionId}`, {
        method: 'DELETE',
        headers: {
          'x-user-id': userBob
        }
      });

      expect(resDelete.status).toBe(403);
      const err = await resDelete.json();
      expect(err.code).toBe('FORBIDDEN_CONFESSION_DELETE');
    });
  });

  // =========================================================================
  // 2. PRIVACY & BIDIRECTIONAL RELATIONSHIP ISOLATION
  // =========================================================================
  describe('Privacy & Bidirectional Blocking Enforcement', () => {
    it('disallows self-blocking', async () => {
      const res = await fetch(`${API_URL}/blocks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blockerId: userAlice, blockedId: userAlice })
      });
      expect(res.status).toBe(400);
      const err = await res.json();
      expect(err.error).toBe('Cannot block yourself');
    });

    it('enforces bidirectional blocking on messaging, discovery, and living profiles', async () => {
      // 1. Alice blocks Bob
      const resBlock = await fetch(`${API_URL}/users/${userBob}/block`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blockerId: userAlice, blockedId: userBob })
      });
      expect(resBlock.status).toBe(200);

      // 2. Bob attempts to message Alice -> Rejected
      const resMsgBob = await fetch(`${API_URL}/conversations/${testConv}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userBob
        },
        body: JSON.stringify({
          clientMessageId: `msg_blocked_${Date.now()}`,
          senderId: userBob,
          text: 'Hey Alice, why did you block me?'
        })
      });
      expect(resMsgBob.status).toBe(403);
      const msgErr = await resMsgBob.json();
      expect(msgErr.code).toBe('RELATIONSHIP_BLOCKED');

      // 3. Bob attempts to inspect Alice living profile -> Rejected
      const resProf = await fetch(`${API_URL}/profile/living/${userAlice}?viewerId=${userBob}`);
      expect(resProf.status).toBe(403);

      // 4. Bob searches discovery directory -> Alice is omitted
      const resDisc = await fetch(`${API_URL}/users?currentUserId=${userBob}`);
      expect(resDisc.status).toBe(200);
      const discData = await resDisc.json();
      const hasAlice = discData.users.some((u: any) => u.id === userAlice);
      expect(hasAlice).toBe(false);

      // 5. Unblock for subsequent tests
      const resUnblock = await fetch(`${API_URL}/users/${userBob}/block`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blockerId: userAlice, blockedId: userBob })
      });
      expect(resUnblock.status).toBe(200);
    });
  });

  // =========================================================================
  // 3. MODERATION & ACCOUNT SUSPENSION ENFORCEMENT
  // =========================================================================
  describe('Moderation & Account Suspension Enforcement', () => {
    const suspendedUser = 'usr_prod_suspended';

    beforeAll(() => {
      // Seed suspended user
      db.prepare(`
        INSERT OR REPLACE INTO users (id, name, username, avatar_url, is_verified, last_seen_at, status_text)
        VALUES (?, 'Malicious Troll', 'troll_user', 'https://example.com/troll.png', 0, ?, '[SUSPENDED: Repeated harassment and abusive messages]')
      `).run(suspendedUser, Date.now());

      db.prepare(`
        INSERT OR REPLACE INTO conversation_members (conversation_id, user_id, joined_at)
        VALUES (?, ?, ?)
      `).run(testConv, suspendedUser, Date.now());
    });

    it('blocks suspended user from sending messages', async () => {
      const res = await fetch(`${API_URL}/conversations/${testConv}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': suspendedUser
        },
        body: JSON.stringify({
          clientMessageId: `msg_suspend_${Date.now()}`,
          senderId: suspendedUser,
          text: 'I will bypass suspension!'
        })
      });

      expect(res.status).toBe(403);
      const err = await res.json();
      expect(err.code).toBe('ACCOUNT_SUSPENDED');
    });

    it('blocks suspended user from publishing confessions', async () => {
      const res = await fetch(`${API_URL}/confessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': suspendedUser
        },
        body: JSON.stringify({
          userId: suspendedUser,
          title: 'Spam confession story',
          story: 'Suspended spam story submitted here for testing.',
          visibility: 'anonymous'
        })
      });

      expect(res.status).toBe(403);
      const err = await res.json();
      expect(err.code).toBe('ACCOUNT_SUSPENDED');
    });

    it('excludes suspended user from public discovery directory', async () => {
      const res = await fetch(`${API_URL}/users?limit=50`);
      expect(res.status).toBe(200);
      const data = await res.json();
      const hasSuspended = data.users.some((u: any) => u.id === suspendedUser);
      expect(hasSuspended).toBe(false);
    });
  });

  // =========================================================================
  // 4. API RELIABILITY & RATE LIMITING HEADERS
  // =========================================================================
  describe('API Reliability & Rate Limiting Controls', () => {
    it('attaches standard rate-limiting headers to API responses', async () => {
      const res = await fetch(`${API_URL}/users`);
      expect(res.status).toBe(200);
      expect(res.headers.get('x-ratelimit-limit')).toBeDefined();
      expect(res.headers.get('x-ratelimit-remaining')).toBeDefined();
    });

    it('gracefully handles 404 for unknown endpoints without server crash', async () => {
      const res = await fetch(`${API_URL}/non-existent-route-for-security-audit`);
      expect(res.status).toBe(404);
      const data = await res.json();
      expect(data.code).toBe('NOT_FOUND');
    });
  });
});
