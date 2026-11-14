import { describe, it, expect, beforeAll } from 'vitest';
import { db } from './db';
import { initCommunicationSchema } from './communication/schema';
import { MessagingService } from './communication/messagingService';
import { InteractiveGamesEngine } from './communication/gamesEngine';
import { SocialActivitiesService } from './communication/socialActivitiesService';
import { SafetyService } from './communication/safetyService';

describe('Master Prompt 08: Real-Time Communication & Social Interaction System', () => {
  const TEST_USER_A = 'usr_comm_tester_a';
  const TEST_USER_B = 'usr_comm_tester_b';
  const TEST_USER_C = 'usr_comm_tester_c';

  beforeAll(() => {
    initCommunicationSchema();

    // Ensure test users exist in database
    const now = Date.now();
    const insertUser = db.prepare(`
      INSERT OR IGNORE INTO users (id, name, username, avatar_url, is_verified, last_seen_at)
      VALUES (?, ?, ?, ?, 1, ?)
    `);
    insertUser.run(TEST_USER_A, 'Tester Alice', 'tester_alice', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400', now);
    insertUser.run(TEST_USER_B, 'Tester Bob', 'tester_bob', 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400', now);
    insertUser.run(TEST_USER_C, 'Tester Charlie', 'tester_charlie', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400', now);
  });

  // =========================================================================
  // 1. CONVERSATION MANAGEMENT & GROUP CHATS
  // =========================================================================

  describe('1. Conversation Management & Group Chats', () => {
    it('creates and retrieves a direct conversation between two users', () => {
      const conv = MessagingService.getOrCreateDirectConversation(TEST_USER_A, TEST_USER_B);
      expect(conv).toBeDefined();
      expect(conv.id).toMatch(/^conv_/);
      expect(conv.type).toBe('direct');

      // Calling again should return the exact same conversation (idempotent)
      const convAgain = MessagingService.getOrCreateDirectConversation(TEST_USER_A, TEST_USER_B);
      expect(convAgain.id).toBe(conv.id);
    });

    it('creates a multi-participant group chat with roles', () => {
      const group = MessagingService.createGroupConversation({
        creatorId: TEST_USER_A,
        title: 'Deep Philosophy & Stargazing Circle',
        description: 'Late night existential discussions and astrophotography',
        memberIds: [TEST_USER_B, TEST_USER_C]
      });

      expect(group).toBeDefined();
      expect(group.id).toMatch(/^grp_/);
      expect(group.type).toBe('group');
      expect(group.title).toBe('Deep Philosophy & Stargazing Circle');
      expect(group.participantsCount).toBe(3);

      const fetched = MessagingService.getConversationById(group.id, TEST_USER_A);
      expect(fetched).toBeDefined();
      expect(fetched?.title).toBe('Deep Philosophy & Stargazing Circle');
    });

    it('lists conversations for a user with unread counts and pinning', () => {
      const convs = MessagingService.getUserConversations(TEST_USER_A);
      expect(Array.isArray(convs)).toBe(true);
      expect(convs.length).toBeGreaterThanOrEqual(1);

      const first = convs[0];
      expect(typeof first.unreadCount).toBe('number');
      expect(typeof first.isPinned).toBe('boolean');
    });
  });

  // =========================================================================
  // 2. MESSAGING, ATTACHMENTS, EDIT, DELETE & RECEIPTS
  // =========================================================================

  describe('2. Messaging, Sequencing, Reactions, Receipts & Offline Sync', () => {
    let testConvId: string;

    beforeAll(() => {
      const conv = MessagingService.getOrCreateDirectConversation(TEST_USER_A, TEST_USER_B);
      testConvId = conv.id;
      db.prepare('DELETE FROM messages WHERE conversation_id = ?').run(testConvId);
    });

    it('sends message with strictly monotonic sequence number and idempotency', () => {
      const clientMessageId = `cli_test_${Date.now()}_1`;
      const result1 = MessagingService.sendMessage({
        conversationId: testConvId,
        senderId: TEST_USER_A,
        clientMessageId,
        text: 'Hello from Alice, sequence test',
        type: 'text'
      });

      expect(result1.deduplicated).toBe(false);
      expect(result1.message.sequenceNumber).toBeGreaterThan(0);
      expect(result1.message.text).toBe('Hello from Alice, sequence test');

      // Duplicate send with exact same clientMessageId (must deduplicate)
      const resultDup = MessagingService.sendMessage({
        conversationId: testConvId,
        senderId: TEST_USER_A,
        clientMessageId,
        text: 'Hello from Alice, sequence test',
        type: 'text'
      });

      expect(resultDup.deduplicated).toBe(true);
      expect(resultDup.message.id).toBe(result1.message.id);
    });

    it('attaches structured media attachments to message', () => {
      const clientMessageId = `cli_test_${Date.now()}_att`;
      const result = MessagingService.sendMessage({
        conversationId: testConvId,
        senderId: TEST_USER_A,
        clientMessageId,
        text: 'Check out this telescope capture',
        type: 'photo',
        attachments: [
          {
            fileName: 'andromeda_galaxy.jpg',
            fileSize: 2048500,
            mimeType: 'image/jpeg',
            url: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86',
            width: 1920,
            height: 1080
          }
        ]
      });

      expect(result.message.attachments).toBeDefined();
      expect(result.message.attachments?.length).toBe(1);
      expect(result.message.attachments?.[0].fileName).toBe('andromeda_galaxy.jpg');
    });

    it('edits message and retains audit trail', () => {
      const clientMessageId = `cli_test_${Date.now()}_edit`;
      const res = MessagingService.sendMessage({
        conversationId: testConvId,
        senderId: TEST_USER_A,
        clientMessageId,
        text: 'Initial typo message',
        type: 'text'
      });

      const edited = MessagingService.editMessage(res.message.id, TEST_USER_A, 'Polished and corrected message');
      expect(edited.text).toBe('Polished and corrected message');
      expect(edited.isEdited).toBe(true);

      // Verify audit record in database
      const audit = db.prepare('SELECT * FROM message_edit_history WHERE message_id = ?').get(res.message.id) as any;
      expect(audit).toBeDefined();
      expect(audit.previous_content).toBe('Initial typo message');
    });

    it('toggles reactions and supports emoji summaries', () => {
      const clientMessageId = `cli_test_${Date.now()}_rx`;
      const res = MessagingService.sendMessage({
        conversationId: testConvId,
        senderId: TEST_USER_A,
        clientMessageId,
        text: 'Reaction testing message',
        type: 'text'
      });

      // Add reaction
      const rx1 = MessagingService.toggleReaction(res.message.id, TEST_USER_B, '❤️');
      expect(rx1.reacted).toBe(true);

      // Fetch message and verify reaction
      const messages = MessagingService.getMessages({ conversationId: testConvId, userId: TEST_USER_B });
      const found = messages.find(m => m.id === res.message.id);
      expect(found).toBeDefined();
      expect(found?.reactions.some(r => r.emoji === '❤️' && r.count >= 1)).toBe(true);

      // Remove reaction
      const rx2 = MessagingService.toggleReaction(res.message.id, TEST_USER_B, '❤️');
      expect(rx2.reacted).toBe(false);
    });

    it('marks conversation as read and resets unread count', () => {
      MessagingService.markAsRead(testConvId, TEST_USER_B);
      const conv = MessagingService.getConversationById(testConvId, TEST_USER_B);
      expect(conv?.unreadCount).toBe(0);
    });

    it('supports offline synchronization since sequence number', () => {
      const synced = MessagingService.syncMessages(testConvId, 0, TEST_USER_A);
      expect(Array.isArray(synced)).toBe(true);
      expect(synced.length).toBeGreaterThan(0);
    });

    it('deletes message for me vs for everyone', () => {
      // 1. Delete for me
      const res1 = MessagingService.sendMessage({
        conversationId: testConvId,
        senderId: TEST_USER_A,
        clientMessageId: `cli_del_${Date.now()}_1`,
        text: 'Message to delete for Alice only'
      });
      MessagingService.deleteMessage(res1.message.id, TEST_USER_A, 'for_me');
      const msgsAlice = MessagingService.getMessages({ conversationId: testConvId, userId: TEST_USER_A });
      const aliceView = msgsAlice.find(m => m.id === res1.message.id);
      expect(aliceView?.deletedForMe).toBe(true);

      // 2. Delete for everyone
      const res2 = MessagingService.sendMessage({
        conversationId: testConvId,
        senderId: TEST_USER_A,
        clientMessageId: `cli_del_${Date.now()}_2`,
        text: 'Message to delete globally'
      });
      MessagingService.deleteMessage(res2.message.id, TEST_USER_A, 'for_everyone');
      const msgsBob = MessagingService.getMessages({ conversationId: testConvId, userId: TEST_USER_B });
      const bobView = msgsBob.find(m => m.id === res2.message.id);
      expect(bobView?.isDeleted).toBe(true);
      expect(bobView?.text).toBe('This message was deleted');
    });

    it('searches messages with keyword filtering', () => {
      const searchResults = MessagingService.searchMessages({
        userId: TEST_USER_A,
        query: 'telescope'
      });
      expect(Array.isArray(searchResults)).toBe(true);
      expect(searchResults.some(m => m.text?.includes('telescope'))).toBe(true);
    });
  });

  // =========================================================================
  // 3. INTERACTIVE MINI-GAMES ARCHITECTURE
  // =========================================================================

  describe('3. Extensible Interactive Mini-Games Architecture', () => {
    let testConvId: string;

    beforeAll(() => {
      const conv = MessagingService.getOrCreateDirectConversation(TEST_USER_A, TEST_USER_B);
      testConvId = conv.id;
      db.prepare('DELETE FROM messages WHERE conversation_id = ?').run(testConvId);
    });

    it('starts Truth or Dare session and draws tiered cards', () => {
      const session = InteractiveGamesEngine.startGameSession(testConvId, 'truth_or_dare', TEST_USER_A);
      expect(session).toBeDefined();
      expect(session.gameType).toBe('truth_or_dare');
      expect(session.status).toBe('active');

      // Draw card
      const card = InteractiveGamesEngine.drawTruthOrDareCard('truth', 'romantic');
      expect(card).toBeDefined();
      expect(card.type).toBe('truth');
      expect(card.tier).toBe('romantic');
      expect(card.prompt.length).toBeGreaterThan(10);
    });

    it('executes cryptographically fair dice rolls (1-3 dice)', () => {
      const roll2 = InteractiveGamesEngine.rollDice(2);
      expect(roll2.diceCount).toBe(2);
      expect(roll2.values.length).toBe(2);
      expect(roll2.sum).toBeGreaterThanOrEqual(2);
      expect(roll2.sum).toBeLessThanOrEqual(12);
      expect(roll2.actionText).toBeDefined();

      const roll3 = InteractiveGamesEngine.rollDice(3);
      expect(roll3.diceCount).toBe(3);
      expect(roll3.sum).toBeGreaterThanOrEqual(3);
      expect(roll3.sum).toBeLessThanOrEqual(18);
    });

    it('executes cryptographically fair coin flips with proof seed', () => {
      const flip = InteractiveGamesEngine.flipCoin();
      expect(['heads', 'tails']).toContain(flip.outcome);
      expect(flip.flipSeed.length).toBe(16);
    });

    it('submits turn to collaborative story challenge', () => {
      const session = InteractiveGamesEngine.startGameSession(testConvId, 'collaborative_challenge', TEST_USER_A);
      const updated = InteractiveGamesEngine.submitGameTurn(session.id, TEST_USER_B, {
        text: 'A distant bell resonated across the foggy harbor as shadows shifted.'
      });
      expect(updated.state.turns.length).toBe(2);
      expect(updated.state.turns[1].userId).toBe(TEST_USER_B);
    });
  });

  // =========================================================================
  // 4. SOCIAL ACTIVITIES, WATCH PARTIES & SHARED LOUNGES
  // =========================================================================

  describe('4. Social Activities, Watch Parties & Shared Lounges', () => {
    it('creates and synchronizes a movie watch party room', () => {
      const party = SocialActivitiesService.createWatchParty({
        title: 'Interstellar Midnight Screening',
        hostId: TEST_USER_A,
        videoUrl: 'https://www.youtube.com/watch?v=zSWdZVtXT7E',
        videoType: 'youtube'
      });

      expect(party).toBeDefined();
      expect(party.id).toMatch(/^wp_/);
      expect(party.title).toBe('Interstellar Midnight Screening');

      // Sync playback to position 45.5s and playing = true
      const synced = SocialActivitiesService.syncWatchPartyPlayback(party.id, TEST_USER_A, 45.5, true);
      expect(synced.playbackPosition).toBe(45.5);
      expect(synced.isPlaying).toBe(true);
    });

    it('lists and joins shared-interest social rooms and lounges', () => {
      const rooms = SocialActivitiesService.getSocialRooms();
      expect(Array.isArray(rooms)).toBe(true);
      expect(rooms.length).toBeGreaterThanOrEqual(1);

      const targetRoom = rooms[0];
      const joined = SocialActivitiesService.joinRoom(targetRoom.id, TEST_USER_B);
      expect(joined).toBe(true);

      const handRaised = SocialActivitiesService.toggleHandRaise(targetRoom.id, TEST_USER_B, true);
      expect(handRaised).toBe(true);

      const left = SocialActivitiesService.leaveRoom(targetRoom.id, TEST_USER_B);
      expect(left).toBe(true);
    });

    it('sends and accepts social activity invitations', () => {
      const inv = SocialActivitiesService.sendInvitation({
        inviterId: TEST_USER_A,
        inviteeId: TEST_USER_B,
        activityType: 'watch_party',
        activityId: 'wp_test_party_01',
        title: 'Join me for Studio Ghibli watch party!'
      });

      expect(inv).toBeDefined();
      expect(inv.status).toBe('pending');

      const userInvs = SocialActivitiesService.getUserInvitations(TEST_USER_B);
      expect(userInvs.some(i => i.id === inv.id)).toBe(true);

      const accepted = SocialActivitiesService.respondInvitation(inv.id, TEST_USER_B, 'accepted');
      expect(accepted).toBe(true);
    });
  });

  // =========================================================================
  // 5. SAFETY, MODERATION, PRIVACY & ENCRYPTION TRANSPARENCY
  // =========================================================================

  describe('5. Safety, Moderation, Privacy & Encryption Transparency', () => {
    it('heuristically detects toxic threats and flags them with high severity', () => {
      const toxic = SafetyService.moderateContent('I will doxx you and send threats');
      expect(toxic.flagged).toBe(true);
      expect(toxic.severity).toBe('high');

      const clean = SafetyService.moderateContent('I really appreciate our conversation about books tonight.');
      expect(clean.flagged).toBe(false);
      expect(clean.severity).toBe('none');
    });

    it('validates file attachments against MIME whitelist and file size', () => {
      // Valid PNG
      const valid = SafetyService.validateAttachment('photo.png', 1024 * 500, 'image/png');
      expect(valid.valid).toBe(true);

      // Disallowed executable (.exe)
      const invalidExe = SafetyService.validateAttachment('trojan.exe', 1024, 'application/octet-stream');
      expect(invalidExe.valid).toBe(false);

      // Oversized payload (> 25MB)
      const oversized = SafetyService.validateAttachment('huge.mp4', 30 * 1024 * 1024, 'video/mp4');
      expect(oversized.valid).toBe(false);
    });

    it('enforces bi-directional user blocking', () => {
      SafetyService.blockUser(TEST_USER_A, TEST_USER_C, 'Testing block');
      expect(SafetyService.isBlocked(TEST_USER_A, TEST_USER_C)).toBe(true);
      expect(SafetyService.isBlocked(TEST_USER_C, TEST_USER_A)).toBe(true);

      // Unblock
      SafetyService.unblockUser(TEST_USER_A, TEST_USER_C);
      expect(SafetyService.isBlocked(TEST_USER_A, TEST_USER_C)).toBe(false);
    });

    it('persists boundary reason and parting words when blocking a user', () => {
      const partingWords = "I'm stepping away to protect my emotional boundaries. Wishing you peace.";
      const blockReason = "boundary_crossed";

      SafetyService.blockUser(TEST_USER_A, TEST_USER_C, blockReason, partingWords);
      expect(SafetyService.isBlocked(TEST_USER_A, TEST_USER_C)).toBe(true);

      const blockedList = SafetyService.getBlockedUsers(TEST_USER_A);
      const record = blockedList.find(b => b.blockedId === TEST_USER_C);
      expect(record).toBeDefined();
      expect(record?.reason).toBe(blockReason);
      expect(record?.partingMessage).toBe(partingWords);

      // Clean up for other tests
      SafetyService.unblockUser(TEST_USER_A, TEST_USER_C);
      expect(SafetyService.isBlocked(TEST_USER_A, TEST_USER_C)).toBe(false);
    });

    it('submits safety and moderation reports', () => {
      const report = SafetyService.submitReport({
        reporterId: TEST_USER_A,
        reportedUserId: TEST_USER_B,
        reason: 'harassment',
        details: 'User sent repetitive unsolicited links'
      });

      expect(report).toBeDefined();
      expect(report.id).toMatch(/^rep_/);
      expect(report.status).toBe('pending');
    });

    it('updates user privacy settings (online presence & typing indicators)', () => {
      const updated = SafetyService.updatePrivacySettings(TEST_USER_A, {
        onlinePrivacy: 'contacts_only',
        typingIndicatorsEnabled: false
      });

      expect(updated.onlinePrivacy).toBe('contacts_only');
      expect(updated.typingIndicatorsEnabled).toBe(false);

      const fetched = SafetyService.getPrivacySettings(TEST_USER_A);
      expect(fetched.onlinePrivacy).toBe('contacts_only');
      expect(fetched.typingIndicatorsEnabled).toBe(false);
    });

    it('provides truthful, non-misleading security transparency disclosure', () => {
      const disclosure = SafetyService.getSecurityTransparencyStatement();
      expect(disclosure.transportEncryption).toContain('TLS 1.3');
      expect(disclosure.endToEndEncryptionClaimed).toBe(false);
      expect(disclosure.transparencyNote).toContain('Master Prompt 08');
    });
  });
});
