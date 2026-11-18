import { describe, it, expect, beforeAll, vi } from 'vitest';
import { db, initDatabase } from './db';
import { initCommunicationSchema } from './communication/schema';
import { MessagingService } from './communication/messagingService';
import { OutboxService } from './communication/outboxService';
import { E2EEService } from './communication/e2eeService';
import { CentrifugoService } from './communication/centrifugoService';

describe('Soulverse Real-Time Messaging: Transactional Outbox, Delivery Status & E2EE Signal Engine', () => {
  const alice = 'usr_alice_e2ee';
  const bob = 'usr_bob_e2ee';
  let conversationId: string;

  beforeAll(() => {
    initDatabase();
    initCommunicationSchema();

    // Seed test users
    db.prepare(`
      INSERT OR REPLACE INTO users (id, name, username, avatar_url, last_seen_at)
      VALUES (?, ?, ?, ?, ?)
    `).run(alice, 'Alice Walker', 'alice_e2ee', 'https://avatar.url/alice.jpg', Date.now());

    db.prepare(`
      INSERT OR REPLACE INTO users (id, name, username, avatar_url, last_seen_at)
      VALUES (?, ?, ?, ?, ?)
    `).run(bob, 'Bob Vance', 'bob_e2ee', 'https://avatar.url/bob.jpg', Date.now());

    // Create 1-on-1 direct conversation
    const conv = MessagingService.getOrCreateDirectConversation(alice, bob);
    conversationId = conv.id;
  });

  // =========================================================================
  // 1. TRANSACTIONAL OUTBOX PATTERN & ATOMIC PERSISTENCE
  // =========================================================================

  describe('1. Transactional Outbox Pattern Execution', () => {
    it('commits message and enqueues outbox event atomically in same database transaction', () => {
      const clientMsgId = `cmsg_outbox_${Date.now()}`;
      const initialOutboxCount = OutboxService.getPendingCount();

      const result = MessagingService.sendMessage({
        conversationId,
        senderId: alice,
        clientMessageId: clientMsgId,
        text: 'Atomic outbox test message'
      });

      expect(result.message).toBeDefined();
      expect(result.message.id).toBeDefined();

      // Verify outbox_events has corresponding event
      const outboxEvent = db.prepare(`
        SELECT * FROM outbox_events WHERE aggregate_id = ? AND event_type = 'chat.message.created'
      `).get(result.message.id) as any;

      expect(outboxEvent).toBeDefined();
      expect(outboxEvent.channel).toBe(`dialog:${conversationId}`);
      expect(outboxEvent.status).toBe('pending');

      const payload = JSON.parse(outboxEvent.payload_json);
      expect(payload.type).toBe('chat.message.created');
      expect(payload.messageId).toBe(result.message.id);
      expect(payload.senderId).toBe(alice);
    });

    it('enqueues outbox events on message edits, deletes, and reactions', () => {
      const clientMsgId = `cmsg_lifecycle_${Date.now()}`;
      const sendRes = MessagingService.sendMessage({
        conversationId,
        senderId: alice,
        clientMessageId: clientMsgId,
        text: 'Initial message before edit'
      });

      // 1. Edit
      MessagingService.editMessage(sendRes.message.id, alice, 'Edited message text');
      const editEvent = db.prepare(`
        SELECT * FROM outbox_events WHERE aggregate_id = ? AND event_type = 'chat.message.edited'
      `).get(sendRes.message.id) as any;
      expect(editEvent).toBeDefined();

      // 2. Reaction
      MessagingService.toggleReaction(sendRes.message.id, bob, '❤️');
      const reactionEvent = db.prepare(`
        SELECT * FROM outbox_events WHERE aggregate_id = ? AND event_type = 'chat.reaction.updated'
      `).get(sendRes.message.id) as any;
      expect(reactionEvent).toBeDefined();

      // 3. Delete for everyone
      MessagingService.deleteMessage(sendRes.message.id, alice, 'for_everyone');
      const deleteEvent = db.prepare(`
        SELECT * FROM outbox_events WHERE aggregate_id = ? AND event_type = 'chat.message.deleted'
      `).get(sendRes.message.id) as any;
      expect(deleteEvent).toBeDefined();
    });

    it('handles Centrifugo transient network downtime with exponential backoff and retries', async () => {
      // Mock failure
      const publishSpy = vi.spyOn(CentrifugoService, 'publish').mockResolvedValueOnce({
        success: false,
        error: 'Centrifugo connection timeout'
      });

      const initialFailedCount = (db.prepare(`
        SELECT COUNT(*) as count FROM outbox_events WHERE status = 'failed'
      `).get() as any).count;

      await OutboxService.dispatchPending(1);

      const postFailed = db.prepare(`
        SELECT * FROM outbox_events WHERE status = 'failed' ORDER BY next_retry_at DESC LIMIT 1
      `).get() as any;

      expect(postFailed).toBeDefined();
      expect(postFailed.retry_count).toBeGreaterThan(0);
      expect(postFailed.next_retry_at).toBeGreaterThan(Date.now());
      expect(postFailed.last_error).toContain('Centrifugo');

      publishSpy.mockRestore();
    });

    it('processes outbox events and records published state safely when Centrifugo server accepts', async () => {
      // Mock Centrifugo server publishing success
      const publishSpy = vi.spyOn(CentrifugoService, 'publish').mockResolvedValue({
        success: true
      });

      // Reset next_retry_at on pending/failed rows so they are ready for dispatch
      db.prepare(`
        UPDATE outbox_events SET next_retry_at = ? WHERE status IN ('pending', 'failed')
      `).run(Date.now() - 1000);

      // Drain pending events
      const drainResult = await OutboxService.dispatchPending(20);
      expect(drainResult.processed).toBeGreaterThan(0);
      expect(drainResult.succeeded).toBeGreaterThan(0);

      // Verify published events are marked as published
      const publishedCount = (db.prepare(`
        SELECT COUNT(*) as count FROM outbox_events WHERE status = 'published'
      `).get() as any).count;
      expect(publishedCount).toBeGreaterThan(0);

      publishSpy.mockRestore();
    });
  });

  // =========================================================================
  // 2. AUTHORITATIVE MESSAGE STATUS LIFECYCLE (SENT -> DELIVERED -> READ)
  // =========================================================================

  describe('2. Authoritative Delivery Status Transitions', () => {
    it('correctly reports SENT for newly created outgoing messages (no fake delivered)', () => {
      const clientMsgId = `cmsg_status_test_${Date.now()}`;
      const sendRes = MessagingService.sendMessage({
        conversationId,
        senderId: alice,
        clientMessageId: clientMsgId,
        text: 'Awaiting recipient delivery receipt'
      });

      // Check status as seen by sender Alice
      const messagesForAlice = MessagingService.getMessages({ conversationId, userId: alice });
      const sentMsgAlice = messagesForAlice.find(m => m.id === sendRes.message.id);
      expect(sentMsgAlice).toBeDefined();
      expect(sentMsgAlice!.status).toBe('sent');
      expect(sentMsgAlice!.isOutgoing).toBe(true);
    });

    it('transitions to DELIVERED when recipient acknowledges delivery', () => {
      const clientMsgId = `cmsg_deliv_test_${Date.now()}`;
      const sendRes = MessagingService.sendMessage({
        conversationId,
        senderId: alice,
        clientMessageId: clientMsgId,
        text: 'Checking delivery state transition'
      });

      // Recipient Bob receives the message and sends delivered ACK
      const delivSuccess = MessagingService.markAsDelivered(sendRes.message.id, bob);
      expect(delivSuccess).toBe(true);

      // Check status as seen by sender Alice
      const messagesForAlice = MessagingService.getMessages({ conversationId, userId: alice });
      const delivMsgAlice = messagesForAlice.find(m => m.id === sendRes.message.id);
      expect(delivMsgAlice).toBeDefined();
      expect(delivMsgAlice!.status).toBe('delivered');

      // Verify delivery outbox event was generated for Centrifugo
      const delivOutbox = db.prepare(`
        SELECT * FROM outbox_events WHERE aggregate_id = ? AND event_type = 'chat.receipt.delivered'
      `).get(sendRes.message.id) as any;
      expect(delivOutbox).toBeDefined();
    });

    it('transitions to READ when recipient views the conversation', () => {
      const clientMsgId = `cmsg_read_test_${Date.now()}`;
      const sendRes = MessagingService.sendMessage({
        conversationId,
        senderId: alice,
        clientMessageId: clientMsgId,
        text: 'Checking read state transition'
      });

      // Recipient Bob reads the message
      MessagingService.markAsRead(conversationId, bob, sendRes.message.sequenceNumber);

      // Check status as seen by sender Alice
      const messagesForAlice = MessagingService.getMessages({ conversationId, userId: alice });
      const readMsgAlice = messagesForAlice.find(m => m.id === sendRes.message.id);
      expect(readMsgAlice).toBeDefined();
      expect(readMsgAlice!.status).toBe('read');
    });
  });

  // =========================================================================
  // 3. SIGNAL PROTOCOL END-TO-END ENCRYPTION (E2EE) ARCHITECTURE
  // =========================================================================

  describe('3. Signal Protocol E2EE Cryptographic Engine', () => {
    it('registers user Identity Key, Signed Prekey, and One-Time Prekeys', () => {
      const fakeIdentityKey = 'ed25519_pub_alice_0123456789abcdef';
      const fakeSignedPrekey = 'curve25519_spk_alice_abcdef0123456789';
      const fakeSignature = 'sig_sha512_alice_signature_valid_hex';
      const fakeOTPKs = [
        'curve25519_otpk_alice_1',
        'curve25519_otpk_alice_2',
        'curve25519_otpk_alice_3'
      ];

      const success = E2EEService.registerKeyBundle({
        userId: alice,
        deviceId: 'device_iphone_15_pro',
        registrationId: 44921,
        identityKey: fakeIdentityKey,
        signedPrekeyId: 1,
        signedPrekey: fakeSignedPrekey,
        signedPrekeySignature: fakeSignature,
        oneTimePrekeys: fakeOTPKs
      });

      expect(success).toBe(true);

      const remaining = E2EEService.getRemainingPrekeyCount(alice);
      expect(remaining).toBe(3);
    });

    it('retrieves and consumes an atomic One-Time Prekey during X3DH key agreement', () => {
      const bundle1 = E2EEService.getPrekeyBundle(alice);
      expect(bundle1).toBeDefined();
      expect(bundle1?.identityKey).toContain('alice');
      expect(bundle1?.signedPrekey).toBeDefined();
      expect(bundle1?.oneTimePrekey).toBeDefined();
      expect(bundle1?.oneTimePrekey?.publicKey).toBe('curve25519_otpk_alice_1');

      // Second retrieval must consume next OTPK without reuse
      const bundle2 = E2EEService.getPrekeyBundle(alice);
      expect(bundle2?.oneTimePrekey?.publicKey).toBe('curve25519_otpk_alice_2');

      const remainingAfterTwo = E2EEService.getRemainingPrekeyCount(alice);
      expect(remainingAfterTwo).toBe(1);
    });

    it('validates encrypted ciphertext envelopes for tamper detection and replay protection', () => {
      const validEnvelope = {
        senderId: bob,
        recipientId: alice,
        deviceId: 'device_bob_pixel_8',
        registrationId: 78912,
        ephemeralKey: 'curve25519_eph_xyz',
        epoch: 4,
        ciphertext: 'base64_aes_256_gcm_ciphertext_payload',
        iv: 'base64_12_byte_nonce',
        authTag: 'base64_16_byte_gcm_auth_tag',
        timestamp: Date.now()
      };

      const validResult = E2EEService.validateEnvelope(validEnvelope);
      expect(validResult.valid).toBe(true);

      // Incomplete envelope (missing authTag)
      const invalidEnvelope = { ...validEnvelope, authTag: '' };
      const invalidResult = E2EEService.validateEnvelope(invalidEnvelope);
      expect(invalidResult.valid).toBe(false);
      expect(invalidResult.error).toContain('Incomplete AES-GCM');

      // Replay check: reject ancient timestamp > 24h
      const expiredEnvelope = { ...validEnvelope, timestamp: Date.now() - 90000000 };
      const expiredResult = E2EEService.validateEnvelope(expiredEnvelope);
      expect(expiredResult.valid).toBe(false);
      expect(expiredResult.error).toContain('validity window');
    });
  });
});
