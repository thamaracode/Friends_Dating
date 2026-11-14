import { describe, it, expect, beforeAll } from 'vitest';
import { db } from './db';
import { initCommunicationSchema } from './communication/schema';
import { MessagingService } from './communication/messagingService';

describe('MASTER ENGINEERING PROMPT 01: Real-Time Communication, Groups, Polls & WebRTC', () => {
  const baseUrl = 'http://127.0.0.1:3001';
  const userA = 'usr_alice_comms';
  const userB = 'usr_bob_comms';
  const userC = 'usr_carol_comms';

  beforeAll(async () => {
    initCommunicationSchema();

    // Seed test users
    const now = Date.now();
    const insertUser = db.prepare(`
      INSERT OR REPLACE INTO users (id, name, username, avatar_url, is_verified, last_seen_at)
      VALUES (?, ?, ?, ?, 1, ?)
    `);
    insertUser.run(userA, 'Alice Comms', 'alice_comms', 'https://avatar.test/alice.jpg', now);
    insertUser.run(userB, 'Bob Comms', 'bob_comms', 'https://avatar.test/bob.jpg', now);
    insertUser.run(userC, 'Carol Comms', 'carol_comms', 'https://avatar.test/carol.jpg', now);
  });

  // =========================================================================
  // 1. Group Conversation Lifecycle & Role Authorization
  // =========================================================================
  describe('1. Group Conversation Management & Permissions', () => {
    let groupId: string;

    it('creates a new group conversation with owner and initial members', async () => {
      const res = await fetch(`${baseUrl}/api/v1/conversations/group`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creatorId: userA,
          title: 'Quantum Computing Sanctuary',
          description: 'Exploring quantum entanglement and algorithms',
          memberIds: [userB]
        })
      });
      const data = await res.json();

      expect(res.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.conversation).toBeDefined();
      expect(data.conversation.title).toBe('Quantum Computing Sanctuary');
      expect(data.conversation.type).toBe('group');
      groupId = data.conversation.id;

      // Verify creator is owner in DB
      const members = MessagingService.getGroupMembers(groupId);
      expect(members.length).toBe(2);
      const owner = members.find(m => m.userId === userA);
      expect(owner?.role).toBe('owner');
    });

    it('allows owner/admin to add new members', async () => {
      const res = await fetch(`${baseUrl}/api/v1/conversations/${groupId}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actorId: userA,
          userId: userC,
          role: 'member'
        })
      });
      const data = await res.json();

      expect(res.status).toBe(201);
      expect(data.success).toBe(true);

      const members = MessagingService.getGroupMembers(groupId);
      expect(members.length).toBe(3);
      expect(members.some(m => m.userId === userC)).toBe(true);
    });

    it('rejects regular members from adding other members', async () => {
      const newUser = 'usr_intruder';
      db.prepare(`
        INSERT OR REPLACE INTO users (id, name, username, avatar_url, is_verified, last_seen_at)
        VALUES (?, 'Intruder', 'intruder', 'https://avatar.test/intruder.jpg', 0, ?)
      `).run(newUser, Date.now());

      const res = await fetch(`${baseUrl}/api/v1/conversations/${groupId}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actorId: userC, // Regular member, not admin/owner
          userId: newUser
        })
      });
      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data.error).toMatch(/Forbidden|Only group owner or admin/i);
    });

    it('updates group topic and metadata when authorized', async () => {
      const res = await fetch(`${baseUrl}/api/v1/conversations/${groupId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actorId: userA,
          title: 'Quantum & Consciousness Sanctuary',
          description: 'Updated topic on theoretical physics'
        })
      });
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.conversation.title).toBe('Quantum & Consciousness Sanctuary');
    });

    it('allows a member to leave the group', async () => {
      const res = await fetch(`${baseUrl}/api/v1/conversations/${groupId}/members/${userC}?actorId=${userC}`, {
        method: 'DELETE'
      });
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);

      const members = MessagingService.getGroupMembers(groupId);
      expect(members.some(m => m.userId === userC)).toBe(false);
      expect(members.length).toBe(2);
    });
  });

  // =========================================================================
  // 2. Monotonic Message Ordering & Idempotent Outbox Replay
  // =========================================================================
  describe('2. Monotonic Message Sequencing & Outbox Replay', () => {
    let directConvId: string;
    const clientMsg1 = `cli_outbox_test_${Date.now()}_1`;
    const clientMsg2 = `cli_outbox_test_${Date.now()}_2`;

    beforeAll(() => {
      const conv = MessagingService.getOrCreateDirectConversation(userA, userB);
      directConvId = conv.id;
    });

    it('assigns strictly increasing sequence numbers to messages', async () => {
      const res1 = await fetch(`${baseUrl}/api/v1/conversations/${directConvId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: userA,
          clientMessageId: clientMsg1,
          text: 'Hello from local outbox - message 1'
        })
      });
      const data1 = await res1.json();

      const res2 = await fetch(`${baseUrl}/api/v1/conversations/${directConvId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: userA,
          clientMessageId: clientMsg2,
          text: 'Hello from local outbox - message 2'
        })
      });
      const data2 = await res2.json();

      const seq1 = data1.message?.sequenceNumber || data1.sequenceNumber;
      const seq2 = data2.message?.sequenceNumber || data2.sequenceNumber;
      expect(seq2).toBeGreaterThan(seq1);
    });

    it('idempotently handles outbox replay without duplicate inserts', async () => {
      const replayRes = await fetch(`${baseUrl}/api/v1/conversations/${directConvId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: userA,
          clientMessageId: clientMsg1,
          text: 'Hello from local outbox - message 1'
        })
      });
      const data = await replayRes.json();

      expect(replayRes.status).toBe(200);
      expect(data.deduplicated).toBe(true);

      const countRow = db.prepare('SELECT COUNT(*) as c FROM messages WHERE client_message_id = ?')
        .get(clientMsg1) as { c: number };
      expect(countRow.c).toBe(1);
    });
  });

  // =========================================================================
  // 3. Cursor-Based Incremental Synchronization
  // =========================================================================
  describe('3. Cursor-Based Incremental Sync', () => {
    let convId: string;
    let baselineSeq: number;

    beforeAll(() => {
      const conv = MessagingService.getOrCreateDirectConversation(userA, userC);
      convId = conv.id;

      const m1 = MessagingService.sendMessage({
        conversationId: convId,
        senderId: userA,
        clientMessageId: `sync_msg_${Date.now()}_1`,
        text: 'Initial message'
      });
      baselineSeq = m1.message.sequenceNumber;

      MessagingService.sendMessage({
        conversationId: convId,
        senderId: userC,
        clientMessageId: `sync_msg_${Date.now()}_2`,
        text: 'Reply message 1'
      });

      MessagingService.sendMessage({
        conversationId: convId,
        senderId: userA,
        clientMessageId: `sync_msg_${Date.now()}_3`,
        text: 'Reply message 2'
      });
    });

    it('returns only messages newer than the cursor in ascending order', async () => {
      const res = await fetch(`${baseUrl}/api/v1/conversations/${convId}/sync?since=${baselineSeq}&userId=${userA}`);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.count).toBe(2);
      expect(data.messages[0].sequenceNumber).toBeGreaterThan(baselineSeq);
      expect(data.messages[1].sequenceNumber).toBeGreaterThan(data.messages[0].sequenceNumber);
    });
  });

  // =========================================================================
  // 4. Real-Time Polls Creation & Dynamic Consensus Voting
  // =========================================================================
  describe('4. Real-Time Polls & Interactive Voting', () => {
    let convId: string;
    let pollMessageId: string;

    beforeAll(() => {
      const conv = MessagingService.getOrCreateDirectConversation(userA, userB);
      convId = conv.id;
    });

    it('creates an interactive poll message', async () => {
      const res = await fetch(`${baseUrl}/api/v1/conversations/${convId}/poll`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: userA,
          clientMessageId: `poll_cli_${Date.now()}`,
          question: 'Where should we meet for our first conversation?',
          options: ['Artisan Coffee Sanctuary', 'Botanical Gardens', 'Art Gallery Lounge'],
          allowsMultiple: false
        })
      });
      const data = await res.json();

      expect(res.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.message.type).toBe('poll');
      expect(data.message.pollData).toBeDefined();
      expect(data.message.pollData.question).toBe('Where should we meet for our first conversation?');
      expect(data.message.pollData.options.length).toBe(3);
      expect(data.message.pollData.totalVotes).toBe(0);

      pollMessageId = data.message.id;
    });

    it('records user vote and computes percentages', async () => {
      const res1 = await fetch(`${baseUrl}/api/v1/messages/${pollMessageId}/poll/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userA,
          optionIndex: 0
        })
      });
      const data1 = await res1.json();

      expect(data1.success).toBe(true);
      expect(data1.pollData.totalVotes).toBe(1);
      expect(data1.pollData.options[0].voteCount).toBe(1);
      expect(data1.pollData.userVotedOptionIds).toContain(0);

      const res2 = await fetch(`${baseUrl}/api/v1/messages/${pollMessageId}/poll/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userB,
          optionIndex: 1
        })
      });
      const data2 = await res2.json();

      expect(data2.pollData.totalVotes).toBe(2);
      expect(data2.pollData.options[0].voteCount).toBe(1);
      expect(data2.pollData.options[1].voteCount).toBe(1);
    });

    it('enforces single-choice vote replacement when user switches vote', async () => {
      const res = await fetch(`${baseUrl}/api/v1/messages/${pollMessageId}/poll/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userA,
          optionIndex: 1
        })
      });
      const data = await res.json();

      expect(data.pollData.totalVotes).toBe(2);
      expect(data.pollData.options[0].voteCount).toBe(0);
      expect(data.pollData.options[1].voteCount).toBe(2);
      expect(data.pollData.userVotedOptionIds).toContain(1);
    });
  });

  // =========================================================================
  // 5. WebRTC Call Logging & Status Updates
  // =========================================================================
  describe('5. WebRTC Call Logging & Audit Trail', () => {
    let callId: string;
    let convId: string;

    beforeAll(() => {
      const conv = MessagingService.getOrCreateDirectConversation(userA, userB);
      convId = conv.id;
      callId = `call_test_${Date.now()}`;
    });

    it('logs outgoing WebRTC call session initiation', async () => {
      const res = await fetch(`${baseUrl}/api/v1/calls`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: callId,
          conversationId: convId,
          callerId: userA,
          recipientId: userB,
          callType: 'video',
          status: 'ringing'
        })
      });
      const data = await res.json();

      expect(res.status).toBe(201);
      expect(data.success).toBe(true);

      const history = MessagingService.getCallsHistory(userA, convId);
      expect(history.length).toBeGreaterThanOrEqual(1);
      expect(history[0].id).toBe(callId);
      expect(history[0].status).toBe('ringing');
    });

    it('updates call status to connected and ended with accurate duration', async () => {
      await fetch(`${baseUrl}/api/v1/calls/${callId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'connected'
        })
      });

      await fetch(`${baseUrl}/api/v1/calls/${callId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'ended',
          durationSeconds: 142
        })
      });

      const history = MessagingService.getCallsHistory(userA, convId);
      const target = history.find((c: any) => c.id === callId);
      expect(target.status).toBe('ended');
      expect(target.duration_seconds).toBe(142);
    });
  });
});
