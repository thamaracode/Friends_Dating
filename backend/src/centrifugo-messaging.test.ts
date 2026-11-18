import { describe, it, expect, beforeAll } from 'vitest';
import crypto from 'crypto';
import { db, initDatabase } from './db';
import { initCommunicationSchema } from './communication/schema';
import { CentrifugoService } from './communication/centrifugoService';
import { MessagingService } from './communication/messagingService';
import { PushNotificationService } from './communication/pushNotificationService';
import { SafetyService } from './communication/safetyService';

describe('Soulverse Real-Time Messaging Architecture: Centrifugo & Message Engine', () => {
  const testSecret = 'soulverse-centrifugo-hmac-sha256-secret-key-auth';
  const userA = 'usr_alex_centrifugo';
  const userB = 'usr_tara_centrifugo';
  const intruderUser = 'usr_intruder_x';
  let testConvId: string;

  beforeAll(() => {
    initDatabase();
    initCommunicationSchema();

    // Seed test users
    db.prepare(`
      INSERT OR REPLACE INTO users (id, name, username, avatar_url, last_seen_at)
      VALUES (?, ?, ?, ?, ?)
    `).run(userA, 'Alex Test', 'alex_cent_test', 'https://avatar.url/alex.jpg', Date.now());

    db.prepare(`
      INSERT OR REPLACE INTO users (id, name, username, avatar_url, last_seen_at)
      VALUES (?, ?, ?, ?, ?)
    `).run(userB, 'Tara Test', 'tara_cent_test', 'https://avatar.url/tara.jpg', Date.now());

    db.prepare(`
      INSERT OR REPLACE INTO users (id, name, username, avatar_url, last_seen_at)
      VALUES (?, ?, ?, ?, ?)
    `).run(intruderUser, 'Intruder', 'intruder_cent_test', 'https://avatar.url/intruder.jpg', Date.now());

    // Create test conversation
    testConvId = `conv_test_${Date.now()}`;
    const now = Date.now();
    db.prepare(`
      INSERT INTO conversations (id, type, title, created_at, updated_at)
      VALUES (?, 'direct', 'Alex & Tara', ?, ?)
    `).run(testConvId, now, now);

    db.prepare(`
      INSERT INTO conversation_members (conversation_id, user_id, role, joined_at, unread_count)
      VALUES (?, ?, 'member', ?, 0)
    `).run(testConvId, userA, now);

    db.prepare(`
      INSERT INTO conversation_members (conversation_id, user_id, role, joined_at, unread_count)
      VALUES (?, ?, 'member', ?, 0)
    `).run(testConvId, userB, now);
  });

  // =========================================================================
  // 1. CENTRIFUGO CONNECTION & SUBSCRIPTION TOKEN GENERATION
  // =========================================================================

  describe('1. Centrifugo HMAC-SHA256 Token Authentication', () => {
    it('generates a valid, cryptographically signed connection JWT', () => {
      const token = CentrifugoService.generateConnectionToken(userA, 3600, { name: 'Alex Test' });
      expect(token).toBeDefined();

      const parts = token.split('.');
      expect(parts.length).toBe(3);

      // Verify Header
      const header = JSON.parse(Buffer.from(parts[0], 'base64').toString('utf-8'));
      expect(header.alg).toBe('HS256');
      expect(header.typ).toBe('JWT');

      // Verify Payload
      const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf-8'));
      expect(payload.sub).toBe(userA);
      expect(payload.info?.name).toBe('Alex Test');
      expect(payload.exp).toBeGreaterThan(Math.floor(Date.now() / 1000));

      // Verify Signature with HMAC-SHA256
      const unsigned = `${parts[0]}.${parts[1]}`;
      const expectedSig = crypto
        .createHmac('sha256', testSecret)
        .update(unsigned)
        .digest()
        .toString('base64')
        .replace(/=/g, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_');

      expect(parts[2]).toBe(expectedSig);
    });

    it('generates a valid subscription JWT for a private conversation channel', () => {
      const channel = `dialog:${testConvId}`;
      const token = CentrifugoService.generateSubscriptionToken(userA, channel, 3600);
      const parts = token.split('.');
      const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf-8'));

      expect(payload.sub).toBe(userA);
      expect(payload.channel).toBe(channel);
    });
  });

  // =========================================================================
  // 2. SERVER-SIDE AUTHORIZATION & CHANNEL ACCESS CONTROL (Anti-IDOR)
  // =========================================================================

  describe('2. Server-Side Channel Authorization (Anti-IDOR)', () => {
    it('authorizes enrolled conversation members to subscribe to dialog channel', () => {
      const authA = CentrifugoService.authorizeChannelSubscription(userA, `dialog:${testConvId}`);
      expect(authA.authorized).toBe(true);

      const authB = CentrifugoService.authorizeChannelSubscription(userB, `dialog:${testConvId}`);
      expect(authB.authorized).toBe(true);
    });

    it('strictly denies unauthorized users from subscribing to private conversation channel', () => {
      const authIntruder = CentrifugoService.authorizeChannelSubscription(intruderUser, `dialog:${testConvId}`);
      expect(authIntruder.authorized).toBe(false);
      expect(authIntruder.reason).toContain('not a member');
    });

    it('authorizes personal notification channel only for the matching user', () => {
      const authSelf = CentrifugoService.authorizeChannelSubscription(userA, `user:${userA}`);
      expect(authSelf.authorized).toBe(true);

      const authCross = CentrifugoService.authorizeChannelSubscription(userA, `user:${userB}`);
      expect(authCross.authorized).toBe(false);
      expect(authCross.reason).toContain('Unauthorized user notification channel');
    });

    it('denies channel subscription if users have an active safety block', () => {
      // Block userB
      SafetyService.blockUser(userA, userB, 'Testing safety block');

      const authBlocked = CentrifugoService.authorizeChannelSubscription(userA, `dialog:${testConvId}`);
      expect(authBlocked.authorized).toBe(false);
      expect(authBlocked.reason).toContain('safety block');

      // Unblock for subsequent tests
      SafetyService.unblockUser(userA, userB);
    });
  });

  // =========================================================================
  // 3. DETERMINISTIC MESSAGE ORDERING & SEQUENCE NUMBERS
  // =========================================================================

  describe('3. Monotonic Sequence Numbers & Message Ordering', () => {
    it('assigns strictly incrementing monotonic sequence numbers within a conversation', () => {
      const clientMsgId1 = `cmsg_seq_1_${Date.now()}`;
      const clientMsgId2 = `cmsg_seq_2_${Date.now()}`;
      const clientMsgId3 = `cmsg_seq_3_${Date.now()}`;

      const res1 = MessagingService.sendMessage({
        conversationId: testConvId,
        senderId: userA,
        clientMessageId: clientMsgId1,
        text: 'First sequential message'
      });

      const res2 = MessagingService.sendMessage({
        conversationId: testConvId,
        senderId: userB,
        clientMessageId: clientMsgId2,
        text: 'Second sequential message'
      });

      const res3 = MessagingService.sendMessage({
        conversationId: testConvId,
        senderId: userA,
        clientMessageId: clientMsgId3,
        text: 'Third sequential message'
      });

      expect(res1.message.sequenceNumber).toBeDefined();
      expect(res2.message.sequenceNumber).toBe(res1.message.sequenceNumber + 1);
      expect(res3.message.sequenceNumber).toBe(res2.message.sequenceNumber + 1);
    });
  });

  // =========================================================================
  // 4. IDEMPOTENCY & DUPLICATE PREVENTION
  // =========================================================================

  describe('4. Idempotency & Duplicate Prevention', () => {
    it('returns existing message without creating duplicates when retried with same clientMessageId', () => {
      const idempotencyKey = `idemp_key_${Date.now()}`;

      const firstSend = MessagingService.sendMessage({
        conversationId: testConvId,
        senderId: userA,
        clientMessageId: idempotencyKey,
        text: 'Reliable payment confirmation message'
      });
      expect(firstSend.deduplicated).toBe(false);

      // Retry send with identical idempotency key
      const secondSend = MessagingService.sendMessage({
        conversationId: testConvId,
        senderId: userA,
        clientMessageId: idempotencyKey,
        text: 'Reliable payment confirmation message'
      });
      expect(secondSend.deduplicated).toBe(true);
      expect(secondSend.message.id).toBe(firstSend.message.id);
      expect(secondSend.message.sequenceNumber).toBe(firstSend.message.sequenceNumber);
    });
  });

  // =========================================================================
  // 5. ATOMIC STATE TRANSITIONS & DELIVERY RECEIPTS (SENDING -> SENT -> READ)
  // =========================================================================

  describe('5. Delivery Receipts & Read State Tracking', () => {
    it('records read receipt and updates last_read_sequence for recipient', () => {
      const msg = MessagingService.sendMessage({
        conversationId: testConvId,
        senderId: userA,
        clientMessageId: `cmsg_read_${Date.now()}`,
        text: 'Message awaiting read receipt'
      });

      // Mark as read by userB
      MessagingService.markAsRead(testConvId, userB, msg.message.sequenceNumber);

      // Verify receipt table
      const receipt = db.prepare(`
        SELECT * FROM message_receipts WHERE message_id = ? AND user_id = ?
      `).get(msg.message.id, userB) as any;

      expect(receipt).toBeDefined();
      expect(receipt.read_at).toBeGreaterThan(0);

      // Verify member last_read_sequence
      const member = db.prepare(`
        SELECT last_read_sequence, unread_count 
        FROM conversation_members 
        WHERE conversation_id = ? AND user_id = ?
      `).get(testConvId, userB) as any;

      expect(member.last_read_sequence).toBeGreaterThanOrEqual(msg.message.sequenceNumber);
      expect(member.unread_count).toBe(0);
    });
  });

  // =========================================================================
  // 6. PUSH NOTIFICATION DISPATCHING & SUPPRESSION RULES
  // =========================================================================

  describe('6. Push Notification Dispatching & Suppression Rules', () => {
    it('suppresses push notifications for self-sent messages', async () => {
      const res = await PushNotificationService.dispatchMessageNotification({
        recipientId: userA,
        senderId: userA,
        senderName: 'Alex',
        conversationId: testConvId,
        messageId: 'msg_self_1',
        messageType: 'text',
        textContent: 'Note to self'
      });

      expect(res.sent).toBe(false);
      expect(res.suppressedReason).toContain('Self-message');
    });

    it('suppresses notifications when conversation is muted', async () => {
      // Mute conversation for userB
      db.prepare('UPDATE conversation_members SET is_muted = 1 WHERE conversation_id = ? AND user_id = ?')
        .run(testConvId, userB);

      const res = await PushNotificationService.dispatchMessageNotification({
        recipientId: userB,
        senderId: userA,
        senderName: 'Alex',
        conversationId: testConvId,
        messageId: 'msg_muted_1',
        messageType: 'text',
        textContent: 'Hello into muted chat'
      });

      expect(res.sent).toBe(false);
      expect(res.suppressedReason).toContain('muted');

      // Unmute for subsequent tests
      db.prepare('UPDATE conversation_members SET is_muted = 0 WHERE conversation_id = ? AND user_id = ?')
        .run(testConvId, userB);
    });

    it('registers user device tokens and targets them for unmuted messages', async () => {
      const fcmToken = `fcm_token_device_${Date.now()}`;
      db.prepare(`
        INSERT INTO user_devices (id, user_id, device_name, device_type, fcm_token, is_active, last_active_at, created_at)
        VALUES (?, ?, 'iPhone 15 Pro', 'ios', ?, 1, ?, ?)
      `).run(`dev_${Date.now()}`, userB, fcmToken, Date.now() - 60000, Date.now());

      // Ensure userB presence is offline/not viewing active stream
      db.prepare('UPDATE users SET last_seen_at = ? WHERE id = ?')
        .run(Date.now() - 60000, userB);

      const res = await PushNotificationService.dispatchMessageNotification({
        recipientId: userB,
        senderId: userA,
        senderName: 'Alex',
        conversationId: testConvId,
        messageId: 'msg_push_1',
        messageType: 'photo'
      });

      expect(res.sent).toBe(true);
      expect(res.devicesTargeted).toBeGreaterThanOrEqual(1);
    });
  });

  // =========================================================================
  // 7. ATTACHMENT VALIDATION & SAFETY ENFORCEMENT
  // =========================================================================

  describe('7. Attachment Validation & Security Boundaries', () => {
    it('validates safe image MIME types and file sizes', () => {
      const validImage = SafetyService.validateAttachment('portrait.jpg', 2 * 1024 * 1024, 'image/jpeg');
      expect(validImage.valid).toBe(true);
    });

    it('rejects executable scripts and malicious extensions', () => {
      const maliciousScript = SafetyService.validateAttachment('payload.exe', 1024, 'application/x-msdownload');
      expect(maliciousScript.valid).toBe(false);
      expect(maliciousScript.error).toBeDefined();

      const bashScript = SafetyService.validateAttachment('hack.sh', 500, 'text/x-shellscript');
      expect(bashScript.valid).toBe(false);
    });

    it('rejects attachments exceeding the 50MB maximum file size limit', () => {
      const oversizedFile = SafetyService.validateAttachment('massive_video.mp4', 60 * 1024 * 1024, 'video/mp4');
      expect(oversizedFile.valid).toBe(false);
      expect(oversizedFile.error).toContain('limit');
    });
  });
});
