import http from 'http';
import path from 'path';
import fs from 'fs';
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { WebSocketServer, WebSocket } from 'ws';
import { v4 as uuidv4 } from 'uuid';
import { db, initDatabase } from './db.js';
import { recognizeSocialUrl, PLATFORM_REGISTRY } from './social-platforms/registry.js';
import {
  encryptApiKey,
  decryptApiKey,
  maskApiKey,
  validateCustomEndpoint
} from './ai/vault';
import { AIProviderRegistry, AIModelRegistry } from './ai/registry';
import {
  AIContextPermissionService,
  AIUsageTracker,
  AIRequestRouter
} from './ai/router';
import {
  AIProviderId,
  AITaskKey,
  AIRequestPayload,
  AIContextPermissions,
  AISpendingLimits,
  AIMessage
} from './ai/types';
import { QuoteDiscoveryService } from './quotes/service';
import { QuoteProviderRegistry } from './quotes/registry';
import { QUOTE_CATEGORIES, QuoteCategoryKey } from './quotes/types';
import { SoulPromptsService } from './soul-prompts/service';
import { psychologyService } from './psychology/service';
import { SocialDiscoveryService } from './discovery/service';
import { MATCHING_TERMINOLOGY_REGISTRY, CONNECTION_TYPES_METADATA } from './discovery/types';
import { RelationshipVaultService } from './relationship-vault/service';
import { RELATIONSHIP_LIFECYCLE_METADATA } from './relationship-vault/types';
import { ContentEngineService } from './content-engine/service';
import { SoulverseIntelligenceService } from './ai/featuresService';
import { initCommunicationSchema } from './communication/schema';
import { MessagingService } from './communication/messagingService';
import { InteractiveGamesEngine } from './communication/gamesEngine';
import { SocialActivitiesService } from './communication/socialActivitiesService';
import { SafetyService } from './communication/safetyService';
import { RealtimeGateway } from './communication/realtimeGateway';
import {
  createRateLimiter,
  isUserSuspended,
  checkUserBlocked,
  isConversationMember,
  getCallerUserId,
  isAuthorizedUserOrAdmin
} from './security';
import { initArchitectureSchema } from './architecture/schema';
import { architectureRouter } from './architecture/router';
import { BackgroundJobManager } from './architecture/backgroundJobs';
import { DataProtectionService } from './architecture/dataProtection';
import { initSocialSchema } from './social/schema';
import { socialRouter } from './social/router';
import { QuestionsService } from './social/questionsService';

initDatabase();
initCommunicationSchema();
initArchitectureSchema();
initSocialSchema();
QuestionsService.ensureSeeded();
SoulPromptsService.initTables();
ContentEngineService.ensureTables();
BackgroundJobManager.start();

const app = express();
app.use(cors({
  origin: true,
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'x-user-id', 'x-admin-id', 'idempotency-key', 'x-idempotency-key']
}));
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));
app.use(createRateLimiter({ windowMs: 60 * 1000, maxRequests: 500 }));

// Production Social Feed, Questions & Content Discovery Router (Master Prompt 02)
app.use('/api/v1/social', socialRouter);
app.use('/api/social', socialRouter);

// Production Architecture & Security Router (Master Prompt 11)
app.use('/api/v1', architectureRouter);

// Serve uploaded media statically
const uploadsDir = path.resolve(__dirname, '../uploads');
app.use('/uploads', express.static(uploadsDir));

// Multer storage for voice notes, photos, and file attachments
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || '.webm';
    const uniqueName = `${Date.now()}_${uuidv4().slice(0, 8)}${ext}`;
    cb(null, uniqueName);
  }
});
const upload = multer({ 
  storage,
  limits: { fileSize: 25 * 1024 * 1024 } // 25 MB max payload
});

const server = http.createServer(app);
const wss = new WebSocketServer({ server });
RealtimeGateway.init(wss);

// Map of userId -> Set of active WebSockets (Multi-device support)
const userSockets = new Map<string, Set<WebSocket>>();

wss.on('connection', (ws, req) => {
  const url = new URL(req.url || '', `http://${req.headers.host}`);
  const userId = url.searchParams.get('userId') || 'usr_me';

  if (!userSockets.has(userId)) {
    userSockets.set(userId, new Set());
  }
  userSockets.get(userId)!.add(ws);

  // Update presence
  db.prepare('UPDATE users SET last_seen_at = ? WHERE id = ?').run(Date.now(), userId);
  broadcastToAll({
    type: 'presence.updated',
    userId,
    isOnline: true,
    lastSeenAt: Date.now()
  });

  ws.on('message', (data) => {
    try {
      const payload = JSON.parse(data.toString());
      handleClientSocketEvent(userId, payload, ws);
    } catch (e) {
      console.error('WS parse error', e);
    }
  });

  ws.on('close', () => {
    const sockets = userSockets.get(userId);
    if (sockets) {
      sockets.delete(ws);
      if (sockets.size === 0) {
        userSockets.delete(userId);
        db.prepare('UPDATE users SET last_seen_at = ? WHERE id = ?').run(Date.now(), userId);
        broadcastToAll({
          type: 'presence.updated',
          userId,
          isOnline: false,
          lastSeenAt: Date.now()
        });
      }
    }
  });
});

function broadcastToUser(userId: string, event: any) {
  const sockets = userSockets.get(userId);
  if (sockets) {
    const payload = JSON.stringify(event);
    for (const ws of sockets) {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(payload);
      }
    }
  }
}

function broadcastToAll(event: any) {
  const payload = JSON.stringify(event);
  for (const [, sockets] of userSockets) {
    for (const ws of sockets) {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(payload);
      }
    }
  }
}

function handleClientSocketEvent(userId: string, event: any, _ws: WebSocket) {
  if (event.type === 'typing.start') {
    const members = db.prepare('SELECT user_id FROM conversation_members WHERE conversation_id = ? AND user_id != ?')
      .all(event.conversationId, userId) as { user_id: string }[];
    members.forEach(m => broadcastToUser(m.user_id, {
      type: 'typing.started',
      conversationId: event.conversationId,
      userId
    }));
  } else if (event.type === 'typing.stop') {
    const members = db.prepare('SELECT user_id FROM conversation_members WHERE conversation_id = ? AND user_id != ?')
      .all(event.conversationId, userId) as { user_id: string }[];
    members.forEach(m => broadcastToUser(m.user_id, {
      type: 'typing.stopped',
      conversationId: event.conversationId,
      userId
    }));
  } else if (event.type === 'call.signal') {
    // Forward WebRTC SDP Offer/Answer or ICE Candidate to the peer
    broadcastToUser(event.recipientId, {
      type: 'call.signal',
      senderId: userId,
      signalData: event.signalData,
      callType: event.callType
    });
  }
}

// Background Runner for Scheduled Messages (Runs every 10 seconds)
setInterval(() => {
  try {
    const now = Date.now();
    const pending = db.prepare(`
      SELECT * FROM scheduled_messages 
      WHERE scheduled_for <= ? AND status = 'pending'
    `).all(now) as any[];

    for (const item of pending) {
      const payload = JSON.parse(item.payload_json);
      const messageId = `msg_${uuidv4().replace(/-/g, '').slice(0, 12)}`;
      
      const insertTx = db.transaction(() => {
        const seqRow = db.prepare('SELECT COALESCE(MAX(sequence_number), 0) + 1 as next_seq FROM messages WHERE conversation_id = ?').get(item.conversation_id) as { next_seq: number };
        const seq = seqRow.next_seq;

        db.prepare(`
          INSERT INTO messages (
            id, conversation_id, sender_id, client_message_id, sequence_number,
            message_type, text_content, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          messageId,
          item.conversation_id,
          item.sender_id,
          `sched_${item.id}`,
          seq,
          payload.type || 'text',
          payload.text || '',
          now
        );

        db.prepare('UPDATE conversations SET last_message_id = ?, updated_at = ? WHERE id = ?').run(messageId, now, item.conversation_id);
        db.prepare("UPDATE scheduled_messages SET status = 'sent' WHERE id = ?").run(item.id);

        return { messageId, seq };
      });

      insertTx();

      // Broadcast
      const members = db.prepare('SELECT user_id FROM conversation_members WHERE conversation_id = ?').all(item.conversation_id) as { user_id: string }[];
      members.forEach(m => {
        broadcastToUser(m.user_id, {
          type: 'chat.message.created',
          conversationId: item.conversation_id,
          message: {
            id: messageId,
            conversationId: item.conversation_id,
            senderId: item.sender_id,
            type: payload.type || 'text',
            text: payload.text,
            timestamp: new Date(now).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            createdAt: now,
            status: 'delivered',
            isOutgoing: m.user_id === item.sender_id
          }
        });
      });
    }
  } catch (err) {
    console.error('Scheduled message runner error', err);
  }
}, 10000);

// -------------------------------------------------------------
// REST API ENDPOINTS
// -------------------------------------------------------------

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'FRIENDS Messaging Engine' });
});

// 1. Get conversations for user
app.get('/api/v1/conversations', (req, res) => {
  const userId = (req.query.userId as string) || 'usr_me';

  const rows = db.prepare(`
    SELECT 
      c.id,
      c.type,
      c.title,
      c.description,
      c.avatar_url,
      c.created_by,
      c.updated_at,
      cm.is_pinned,
      cm.is_archived,
      cm.is_muted,
      cm.unread_count,
      cm.draft_text,
      cm.role,
      partner.id as partner_id,
      partner.name as partner_name,
      partner.avatar_url as partner_avatar,
      partner.is_verified as partner_verified,
      partner.last_seen_at as partner_last_seen,
      lm.id as last_msg_id,
      lm.text_content as last_msg_text,
      lm.sender_id as last_msg_sender,
      lm.created_at as last_msg_created_at
    FROM conversations c
    JOIN conversation_members cm ON c.id = cm.conversation_id AND cm.user_id = ?
    LEFT JOIN conversation_members other ON c.id = other.conversation_id AND other.user_id != ? AND c.type = 'direct'
    LEFT JOIN users partner ON other.user_id = partner.id
    LEFT JOIN messages lm ON c.last_message_id = lm.id
    ORDER BY cm.is_pinned DESC, c.updated_at DESC
  `).all(userId, userId) as any[];

  const conversations = rows.map(r => ({
    id: r.id,
    type: r.type,
    participantId: r.partner_id,
    isPinned: Boolean(r.is_pinned),
    isArchived: Boolean(r.is_archived),
    isMuted: Boolean(r.is_muted),
    unreadCount: r.unread_count,
    draftText: r.draft_text,
    role: r.role || 'member',
    title: r.type === 'saved_messages' 
      ? 'Saved Messages' 
      : (r.type === 'group' ? (r.title || 'Group Chat') : (r.partner_name || 'Match')),
    avatar: r.type === 'saved_messages' 
      ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80' 
      : (r.type === 'group' ? (r.avatar_url || 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&auto=format&fit=crop&q=80') : (r.partner_avatar || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80')),
    isOnline: r.type === 'direct' ? userSockets.has(r.partner_id || '') : false,
    lastSeenText: r.type === 'saved_messages' ? 'Your personal cloud' : (r.type === 'group' ? 'Group Space' : (userSockets.has(r.partner_id || '') ? 'Online now' : 'Recently active')),
    isVerified: Boolean(r.partner_verified),
    category: r.type === 'saved_messages' ? 'saved_messages' : (r.type === 'group' ? 'group' : 'match'),
    lastMessage: r.last_msg_text ? {
      text: r.last_msg_text,
      senderId: r.last_msg_sender,
      timestamp: new Date(r.last_msg_created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isOutgoing: r.last_msg_sender === userId,
      status: 'delivered'
    } : undefined
  }));

  res.json({ success: true, conversations });
});

// 2. Get messages for conversation (with cursor pagination)
app.get('/api/v1/conversations/:id/messages', (req, res) => {
  const { id } = req.params;
  const userId = (req.query.userId as string) || 'usr_me';
  const limit = parseInt(req.query.limit as string) || 50;

  const messages = db.prepare(`
    SELECT 
      m.id,
      m.client_message_id,
      m.conversation_id,
      m.sender_id,
      u.name as sender_name,
      m.sequence_number,
      m.message_type as type,
      m.text_content as text,
      m.media_url,
      m.voice_duration,
      m.voice_waveform,
      m.reply_to_message_id,
      m.is_edited,
      m.is_pinned,
      m.is_deleted_for_everyone,
      m.attachment_json,
      m.created_at
    FROM messages m
    JOIN users u ON m.sender_id = u.id
    WHERE m.conversation_id = ?
    ORDER BY m.sequence_number ASC
    LIMIT ?
  `).all(id, limit) as any[];

  // Fetch reactions
  const reactionsMap = new Map<string, any[]>();
  const allReactions = db.prepare(`
    SELECT message_id, emoji, COUNT(*) as count,
           SUM(CASE WHEN user_id = ? THEN 1 ELSE 0 END) as user_reacted
    FROM message_reactions
    GROUP BY message_id, emoji
  `).all(userId) as any[];

  for (const r of allReactions) {
    if (!reactionsMap.has(r.message_id)) {
      reactionsMap.set(r.message_id, []);
    }
    reactionsMap.get(r.message_id)!.push({
      emoji: r.emoji,
      count: r.count,
      userReacted: Boolean(r.user_reacted)
    });
  }

  // Pre-fetch reply-to summaries
  const replyMap = new Map<string, { senderName: string; textSnippet: string }>();
  const replyIds = messages.filter(m => m.reply_to_message_id).map(m => m.reply_to_message_id);
  if (replyIds.length > 0) {
    const placeholders = replyIds.map(() => '?').join(',');
    const replyRows = db.prepare(`
      SELECT m.id, u.name as sender_name, m.text_content
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      WHERE m.id IN (${placeholders})
    `).all(...replyIds) as any[];

    for (const r of replyRows) {
      replyMap.set(r.id, {
        senderName: r.sender_name,
        textSnippet: r.text_content ? r.text_content.slice(0, 50) : 'Attachment'
      });
    }
  }

  const result = messages.map(m => {
    let pollData = undefined;
    if (m.type === 'poll' && m.attachment_json) {
      try {
        const rawPoll = JSON.parse(m.attachment_json);
        const votes = db.prepare('SELECT user_id, option_index FROM poll_votes WHERE message_id = ?').all(m.id) as Array<{ user_id: string; option_index: number }>;
        const userVotedOptionIds = votes.filter(v => v.user_id === userId).map(v => v.option_index);
        const options = (rawPoll.options || []).map((opt: any, idx: number) => {
          const optVotes = votes.filter(v => v.option_index === idx);
          return {
            id: idx,
            text: typeof opt === 'string' ? opt : opt.text,
            voteCount: optVotes.length,
            voterIds: optVotes.map(v => v.user_id)
          };
        });
        pollData = {
          question: rawPoll.question,
          options,
          allowsMultiple: Boolean(rawPoll.allowsMultiple),
          totalVotes: votes.length,
          closed: Boolean(rawPoll.closed),
          userVotedOptionIds
        };
      } catch (e) { /* ignore */ }
    }

    return {
      id: m.id,
      clientMessageId: m.client_message_id,
      conversationId: m.conversation_id,
      senderId: m.sender_id,
      senderName: m.sender_name,
      sequenceNumber: m.sequence_number,
      type: m.type,
      text: m.is_deleted_for_everyone ? 'This message was deleted' : m.text,
      mediaUrl: m.is_deleted_for_everyone ? undefined : m.media_url,
      voiceDurationSeconds: m.voice_duration,
      voiceWaveform: m.voice_waveform ? JSON.parse(m.voice_waveform) : undefined,
      replyTo: m.reply_to_message_id ? replyMap.get(m.reply_to_message_id) : undefined,
      timestamp: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      createdAt: m.created_at,
      isOutgoing: m.sender_id === userId,
      status: 'delivered',
      isEdited: Boolean(m.is_edited),
      isPinned: Boolean(m.is_pinned),
      isDeleted: Boolean(m.is_deleted_for_everyone),
      reactions: reactionsMap.get(m.id) || [],
      pollData
    };
  });

  res.json({ success: true, messages: result });
});

// 3. Send message (Transactional with sequence numbering, security checks, and idempotency)
app.post('/api/v1/conversations/:id/messages', (req, res) => {
  const { id } = req.params;
  const { 
    clientMessageId, 
    senderId = 'usr_me', 
    type = 'text', 
    text, 
    mediaUrl, 
    voiceDuration, 
    voiceWaveform,
    replyToMessageId 
  } = req.body;

  if (!clientMessageId || (!text && !mediaUrl)) {
    return res.status(400).json({ error: 'Missing clientMessageId or message payload' });
  }

  // Security Check 1: Account suspension enforcement
  if (isUserSuspended(senderId)) {
    return res.status(403).json({ error: 'Forbidden: Account is suspended by moderation team', code: 'ACCOUNT_SUSPENDED' });
  }

  // Security Check 2: Conversation enrollment verification
  if (!isConversationMember(id, senderId)) {
    return res.status(403).json({ error: 'Forbidden: Sender is not an enrolled participant in this conversation', code: 'NOT_CONVERSATION_MEMBER' });
  }

  // Security Check 3: Bidirectional block verification
  const members = db.prepare('SELECT user_id FROM conversation_members WHERE conversation_id = ?').all(id) as { user_id: string }[];
  for (const m of members) {
    if (m.user_id !== senderId && checkUserBlocked(senderId, m.user_id)) {
      return res.status(403).json({ error: 'Cannot send message: relationship is blocked', code: 'RELATIONSHIP_BLOCKED' });
    }
  }

  // Idempotency check: If client retried with same clientMessageId, return existing
  const existing = db.prepare('SELECT * FROM messages WHERE client_message_id = ?').get(clientMessageId) as any;
  if (existing) {
    return res.json({ success: true, message: existing, deduplicated: true });
  }

  const messageId = `msg_${uuidv4().replace(/-/g, '').slice(0, 12)}`;
  const now = Date.now();

  const insertTx = db.transaction(() => {
    // Get next sequence number
    const seqRow = db.prepare('SELECT COALESCE(MAX(sequence_number), 0) + 1 as next_seq FROM messages WHERE conversation_id = ?').get(id) as { next_seq: number };
    const seq = seqRow.next_seq;

    db.prepare(`
      INSERT INTO messages (
        id, conversation_id, sender_id, client_message_id, sequence_number,
        message_type, text_content, media_url, voice_duration, voice_waveform,
        reply_to_message_id, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      messageId, 
      id, 
      senderId, 
      clientMessageId, 
      seq,
      type, 
      text || '', 
      mediaUrl || null, 
      voiceDuration || null,
      voiceWaveform ? JSON.stringify(voiceWaveform) : null,
      replyToMessageId || null, 
      now
    );

    // Update conversation last_message_id and updated_at
    db.prepare('UPDATE conversations SET last_message_id = ?, updated_at = ? WHERE id = ?').run(messageId, now, id);

    // Increment unread count for conversation members other than sender
    db.prepare('UPDATE conversation_members SET unread_count = unread_count + 1 WHERE conversation_id = ? AND user_id != ?').run(id, senderId);

    return { messageId, seq, now };
  }).immediate;

  const { seq } = insertTx();

  const newMsg = {
    id: messageId,
    clientMessageId,
    conversationId: id,
    sequenceNumber: seq,
    senderId,
    type,
    text,
    mediaUrl,
    voiceDurationSeconds: voiceDuration,
    voiceWaveform,
    replyToMessageId,
    timestamp: new Date(now).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    createdAt: now,
    status: 'delivered'
  };

  // Broadcast real-time event to conversation members
  members.forEach(m => {
    broadcastToUser(m.user_id, {
      type: 'chat.message.created',
      conversationId: id,
      message: {
        ...newMsg,
        isOutgoing: m.user_id === senderId
      }
    });
  });

  res.status(201).json({ success: true, message: newMsg });
});

// 4. Edit message (with audit history)
app.patch('/api/v1/messages/:id', (req, res) => {
  const { id } = req.params;
  const requesterId = (req.headers['x-user-id'] as string) || req.body.editorId || 'usr_me';
  const { text } = req.body;

  if (!text) return res.status(400).json({ error: 'New text is required' });

  const msg = db.prepare('SELECT sender_id, text_content, conversation_id FROM messages WHERE id = ?').get(id) as any;
  if (!msg) return res.status(404).json({ error: 'Message not found' });
  if (msg.sender_id !== requesterId) return res.status(403).json({ error: 'Only author can edit this message' });

  db.transaction(() => {
    // Record edit history
    db.prepare(`
      INSERT INTO message_edit_history (id, message_id, editor_id, previous_content, edited_at)
      VALUES (?, ?, ?, ?, ?)
    `).run(`ed_${uuidv4().slice(0, 8)}`, id, requesterId, msg.text_content, Date.now());

    // Update message
    db.prepare('UPDATE messages SET text_content = ?, is_edited = 1 WHERE id = ?').run(text, id);
  })();

  const members = db.prepare('SELECT user_id FROM conversation_members WHERE conversation_id = ?').all(msg.conversation_id) as { user_id: string }[];
  members.forEach(m => broadcastToUser(m.user_id, {
    type: 'chat.message.edited',
    conversationId: msg.conversation_id,
    messageId: id,
    text
  }));

  res.json({ success: true, text });
});

// 5. Delete message (Delete for me vs Delete for everyone)
app.delete('/api/v1/messages/:id', (req, res) => {
  const { id } = req.params;
  const requesterId = (req.headers['x-user-id'] as string) || (req.query.userId as string) || req.body?.userId || 'usr_me';
  const forEveryone = req.query.forEveryone === 'true';

  const msg = db.prepare('SELECT conversation_id, sender_id FROM messages WHERE id = ?').get(id) as any;
  if (!msg) return res.status(404).json({ error: 'Message not found' });

  if (!isConversationMember(msg.conversation_id, requesterId)) {
    return res.status(403).json({ error: 'Forbidden: Requester is not an enrolled participant in this conversation' });
  }

  if (forEveryone) {
    if (msg.sender_id !== requesterId) {
      return res.status(403).json({ error: 'Forbidden: Only the message author can delete this message for everyone' });
    }
    db.prepare('UPDATE messages SET is_deleted_for_everyone = 1, text_content = ? WHERE id = ?').run('This message was deleted', id);
  } else {
    db.prepare('DELETE FROM messages WHERE id = ?').run(id);
  }

  const members = db.prepare('SELECT user_id FROM conversation_members WHERE conversation_id = ?').all(msg.conversation_id) as { user_id: string }[];
  members.forEach(m => broadcastToUser(m.user_id, {
    type: 'chat.message.deleted',
    conversationId: msg.conversation_id,
    messageId: id,
    forEveryone
  }));

  res.json({ success: true, deleted: true });
});

// 6. Toggle Reaction
app.post('/api/v1/messages/:id/reactions', (req, res) => {
  const { id } = req.params;
  const { userId = 'usr_me', emoji } = req.body;

  if (!emoji) return res.status(400).json({ error: 'Emoji is required' });

  const existing = db.prepare('SELECT id FROM message_reactions WHERE message_id = ? AND user_id = ? AND emoji = ?').get(id, userId, emoji);

  if (existing) {
    db.prepare('DELETE FROM message_reactions WHERE message_id = ? AND user_id = ? AND emoji = ?').run(id, userId, emoji);
  } else {
    db.prepare('INSERT INTO message_reactions (id, message_id, user_id, emoji, created_at) VALUES (?, ?, ?, ?, ?)')
      .run(`rx_${uuidv4().slice(0, 8)}`, id, userId, emoji, Date.now());
  }

  const msg = db.prepare('SELECT conversation_id FROM messages WHERE id = ?').get(id) as { conversation_id: string } | undefined;
  if (msg) {
    const members = db.prepare('SELECT user_id FROM conversation_members WHERE conversation_id = ?').all(msg.conversation_id) as { user_id: string }[];
    members.forEach(m => broadcastToUser(m.user_id, {
      type: 'chat.reaction.updated',
      conversationId: msg.conversation_id,
      messageId: id
    }));
  }

  res.json({ success: true });
});

// 7. Pin / Unpin Message
app.patch('/api/v1/messages/:id/pin', (req, res) => {
  const { id } = req.params;
  const msg = db.prepare('SELECT is_pinned, conversation_id FROM messages WHERE id = ?').get(id) as any;
  if (!msg) return res.status(404).json({ error: 'Message not found' });

  const nextVal = msg.is_pinned ? 0 : 1;
  db.prepare('UPDATE messages SET is_pinned = ? WHERE id = ?').run(nextVal, id);

  res.json({ success: true, isPinned: Boolean(nextVal) });
});

// 8. Mark Conversation as Read
app.post('/api/v1/conversations/:id/read', (req, res) => {
  const { id } = req.params;
  const { userId = 'usr_me' } = req.body;

  db.prepare('UPDATE conversation_members SET unread_count = 0 WHERE conversation_id = ? AND user_id = ?').run(id, userId);

  res.json({ success: true });
});

// 9. Draft Management
app.get('/api/v1/conversations/:id/draft', (req, res) => {
  const { id } = req.params;
  const userId = (req.query.userId as string) || 'usr_me';
  const row = db.prepare('SELECT draft_text FROM conversation_members WHERE conversation_id = ? AND user_id = ?').get(id, userId) as any;
  res.json({ success: true, draftText: row ? row.draft_text : '' });
});

app.put('/api/v1/conversations/:id/draft', (req, res) => {
  const { id } = req.params;
  const { userId = 'usr_me', draftText } = req.body;
  db.prepare('UPDATE conversation_members SET draft_text = ? WHERE conversation_id = ? AND user_id = ?').run(draftText, id, userId);
  res.json({ success: true });
});

// 9b. Conversation Archive & Mute Management
app.post('/api/v1/conversations/:id/archive', (req, res) => {
  const { id } = req.params;
  const { userId = 'usr_me', isArchived } = req.body;
  const current = db.prepare('SELECT is_archived FROM conversation_members WHERE conversation_id = ? AND user_id = ?').get(id, userId) as any;
  const nextVal = typeof isArchived === 'boolean' ? (isArchived ? 1 : 0) : (current?.is_archived ? 0 : 1);
  db.prepare('UPDATE conversation_members SET is_archived = ? WHERE conversation_id = ? AND user_id = ?').run(nextVal, id, userId);
  res.json({ success: true, isArchived: Boolean(nextVal) });
});

app.post('/api/v1/conversations/:id/mute', (req, res) => {
  const { id } = req.params;
  const { userId = 'usr_me', isMuted, durationHours = 8 } = req.body;
  const current = db.prepare('SELECT is_muted FROM conversation_members WHERE conversation_id = ? AND user_id = ?').get(id, userId) as any;
  const nextVal = typeof isMuted === 'boolean' ? (isMuted ? 1 : 0) : (current?.is_muted ? 0 : 1);
  db.prepare('UPDATE conversation_members SET is_muted = ? WHERE conversation_id = ? AND user_id = ?').run(nextVal, id, userId);
  res.json({ success: true, isMuted: Boolean(nextVal), durationHours });
});

app.post('/api/v1/conversations/:id/auto-delete', (req, res) => {
  const { id } = req.params;
  const { ttlHours = 24 } = req.body;
  res.json({ success: true, conversationId: id, ttlHours, message: `Auto-delete set to ${ttlHours} hours.` });
});

// 10. File & Voice Upload Endpoint
app.post('/api/v1/attachments/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file provided' });
  }

  const mediaUrl = `http://127.0.0.1:3001/uploads/${req.file.filename}`;
  res.json({
    success: true,
    file: {
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      mediaUrl
    }
  });
});

// 11. Search within conversations
app.get('/api/v1/conversations/:id/search', (req, res) => {
  const { id } = req.params;
  const q = (req.query.q as string) || '';

  const results = db.prepare(`
    SELECT m.id, m.text_content, m.created_at, u.name as sender_name
    FROM messages m
    JOIN users u ON m.sender_id = u.id
    WHERE m.conversation_id = ? AND m.text_content LIKE ?
    ORDER BY m.created_at DESC
  `).all(id, `%${q}%`);

  res.json({ success: true, results });
});

// 12. Scheduled Messages Queue
app.post('/api/v1/scheduled-messages', (req, res) => {
  const { conversationId, senderId = 'usr_me', payload, scheduledFor } = req.body;
  if (!conversationId || !payload || !scheduledFor) {
    return res.status(400).json({ error: 'Missing scheduled message parameters' });
  }

  const id = `sched_${uuidv4().slice(0, 8)}`;
  db.prepare(`
    INSERT INTO scheduled_messages (id, conversation_id, sender_id, payload_json, scheduled_for, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(id, conversationId, senderId, JSON.stringify(payload), scheduledFor, Date.now());

  res.json({ success: true, id, scheduledFor });
});

// 13. Privacy & Safety: Block and Unblock User with Boundary Reasons & Parting Words
app.post(['/api/v1/users/:id/block', '/api/users/:id/block'], (req, res) => {
  const { id: blockedId } = req.params;
  const { blockerId = 'usr_me', reason, partingMessage } = req.body;

  try {
    SafetyService.blockUser(blockerId, blockedId, reason, partingMessage);
    res.json({ success: true, blocked: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.post(['/api/v1/blocks', '/api/blocks'], (req, res) => {
  const { blockerId = 'usr_me', blockedId, reason, partingMessage } = req.body;
  if (!blockedId) return res.status(400).json({ error: 'blockedId is required' });

  if (blockerId === blockedId) {
    return res.status(400).json({ error: 'Cannot block yourself' });
  }

  try {
    SafetyService.blockUser(blockerId, blockedId, reason, partingMessage);
    res.json({ success: true, blocked: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.delete(['/api/v1/users/:id/block', '/api/users/:id/block'], (req, res) => {
  const { id: blockedId } = req.params;
  const blockerId = (req.headers['x-user-id'] as string) || req.body?.blockerId || (req.query.blockerId as string) || 'usr_me';

  SafetyService.unblockUser(blockerId, blockedId);
  res.json({ success: true, blocked: false });
});

// 13b. Permanent Account Deletion (GDPR / PDPA compliance purge)
app.delete('/api/v1/users/:id', (req, res) => {
  const { id } = req.params;
  const requesterId = (req.headers['x-user-id'] as string) || (req.query.requesterId as string) || (req.query.userId as string) || req.body?.userId;
  const adminId = (req.headers['x-admin-id'] as string);

  // Authorization check: Requester must delete their own account or have admin credentials
  const isSelf = requesterId ? (requesterId === id) : (id === 'usr_me');
  const isAdmin = Boolean(adminId && (adminId === 'adm_system' || adminId.startsWith('adm_')));

  if (!isSelf && !isAdmin) {
    return res.status(403).json({
      error: 'Forbidden: You cannot delete another user account without administrative authorization',
      code: 'FORBIDDEN_USER_DELETE'
    });
  }

  try {
    const result = DataProtectionService.deleteUserAccount(id, 'Requested via DELETE /api/v1/users/:id');
    res.json({ 
      success: true, 
      deleted: true,
      userId: id, 
      message: `Account and associated personal records for user ${id} permanently wiped from database.`,
      purgedSummary: result.purgedTables
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 14. Moderation & Abuse Reporting
app.post('/api/v1/reports', (req, res) => {
  const { reporterId = 'usr_me', reportedUserId, messageId, reason, details } = req.body;
  if (!reportedUserId || !reason) {
    return res.status(400).json({ error: 'Missing report target or reason' });
  }

  const reportId = `rep_${uuidv4().slice(0, 8)}`;
  db.prepare(`
    INSERT INTO user_reports (id, reporter_id, reported_user_id, message_id, reason, details, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(reportId, reporterId, reportedUserId, messageId || null, reason, details || '', Date.now());

  res.json({ success: true, reportId, message: 'Report submitted for moderation investigation' });
});

// 15. Dating-Specific Interactive Games (Server-Authoritative State Machine)
app.post('/api/v1/conversations/:id/games', (req, res) => {
  const { id: conversationId } = req.params;
  const { gameType, initiatorId = 'usr_me', currentUserId = initiatorId, initialState = {} } = req.body;

  const id = `game_${uuidv4().slice(0, 8)}`;
  const state = {
    turn: 1,
    scores: { [currentUserId]: 0 },
    history: [],
    ...initialState
  };

  db.prepare(`
    INSERT INTO game_sessions (id, conversation_id, game_type, current_turn_user_id, state_json, status, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, 'active', ?, ?)
  `).run(id, conversationId, gameType, currentUserId, JSON.stringify(state), Date.now(), Date.now());

  res.json({ success: true, session: { id, game_type: gameType, status: 'active', state } });
});

app.post('/api/v1/games/start', (req, res) => {
  const { conversationId, gameType, currentUserId = 'usr_me' } = req.body;
  if (!conversationId || !gameType) {
    return res.status(400).json({ error: 'Missing conversationId or gameType' });
  }

  const id = `game_${uuidv4().slice(0, 8)}`;
  const initialState = {
    turn: 1,
    scores: { [currentUserId]: 0 },
    history: []
  };

  db.prepare(`
    INSERT INTO game_sessions (id, conversation_id, game_type, current_turn_user_id, state_json, status, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, 'active', ?, ?)
  `).run(id, conversationId, gameType, currentUserId, JSON.stringify(initialState), Date.now(), Date.now());

  // Broadcast game event
  const members = db.prepare('SELECT user_id FROM conversation_members WHERE conversation_id = ?').all(conversationId) as { user_id: string }[];
  members.forEach(m => broadcastToUser(m.user_id, {
    type: 'game.started',
    conversationId,
    gameId: id,
    gameType
  }));

  res.json({ success: true, gameId: id, gameType, state: initialState });
});

// -------------------------------------------------------------
// 16. DIGITAL LIFE / PUBLIC SOCIAL PROFILE LINKS
// -------------------------------------------------------------

// URL Recognition Endpoint
app.post('/api/v1/profile/social-links/recognize', (req, res) => {
  const { url } = req.body;
  if (!url || typeof url !== 'string') {
    return res.status(400).json({ success: false, error: 'A valid URL string is required' });
  }

  const result = recognizeSocialUrl(url);
  res.json(result);
});

// Get Current User's Social Links
app.get('/api/v1/profile/social-links', (req, res) => {
  const userId = (req.query.userId as string) || 'usr_me';

  const rows = db.prepare(`
    SELECT * FROM user_social_links 
    WHERE user_id = ? 
    ORDER BY sort_order ASC, created_at ASC
  `).all(userId) as any[];

  const links = rows.map(r => {
    const config = PLATFORM_REGISTRY[r.platform_id];
    return {
      id: r.id,
      userId: r.user_id,
      platformId: r.platform_id,
      platformName: config ? config.name : (r.custom_label || 'Website'),
      category: config ? config.category : 'web',
      color: config ? config.color : '#FF4F87',
      badgeBg: config ? config.badgeBg : 'rgba(255, 79, 135, 0.15)',
      iconName: config ? config.iconName : 'Globe',
      originalUrl: r.original_url,
      canonicalUrl: r.canonical_url,
      username: r.username,
      customLabel: r.custom_label,
      visibility: r.visibility,
      sortOrder: r.sort_order,
      verificationStatus: r.verification_status,
      createdAt: r.created_at,
      updatedAt: r.updated_at
    };
  });

  res.json({ success: true, links });
});

// -------------------------------------------------------------
// 17. STICKER & ANIMATED EMOJI ECOSYSTEM ENDPOINTS
// -------------------------------------------------------------

app.get('/api/v1/stickers/categories', (_req, res) => {
  const categories = db.prepare('SELECT * FROM sticker_categories ORDER BY sort_order ASC').all();
  res.json({ success: true, categories });
});

// Discover all sticker packs
app.get('/api/v1/stickers/packs', (req, res) => {
  const userId = (req.query.userId as string) || 'usr_me';

  const packs = db.prepare(`
    SELECT p.*, 
           CASE WHEN usp.pack_id IS NOT NULL THEN 1 ELSE 0 END as is_installed
    FROM sticker_packs p
    LEFT JOIN user_sticker_packs usp ON p.id = usp.pack_id AND usp.user_id = ?
    ORDER BY p.is_official DESC, p.created_at DESC
  `).all(userId) as any[];

  res.json({ success: true, packs });
});

// Get user's installed sticker packs with stickers
app.get('/api/v1/stickers/my-packs', (req, res) => {
  const userId = (req.query.userId as string) || 'usr_me';

  const packs = db.prepare(`
    SELECT p.*, usp.sort_order as user_sort_order
    FROM sticker_packs p
    JOIN user_sticker_packs usp ON p.id = usp.pack_id
    WHERE usp.user_id = ?
    ORDER BY usp.sort_order ASC, usp.installed_at DESC
  `).all(userId) as any[];

  const stickerStmt = db.prepare('SELECT * FROM stickers WHERE pack_id = ? ORDER BY sort_order ASC');
  const result = packs.map(p => ({
    ...p,
    stickers: stickerStmt.all(p.id)
  }));

  res.json({ success: true, packs: result });
});

// Install sticker pack
app.post('/api/v1/stickers/packs/:id/install', (req, res) => {
  const { id } = req.params;
  const { userId = 'usr_me' } = req.body;

  db.prepare(`
    INSERT OR IGNORE INTO user_sticker_packs (user_id, pack_id, installed_at, sort_order)
    VALUES (?, ?, ?, 0)
  `).run(userId, id, Date.now());

  res.json({ success: true, installed: true });
});

// Uninstall sticker pack
app.delete('/api/v1/stickers/packs/:id/install', (req, res) => {
  const { id } = req.params;
  const userId = (req.query.userId as string) || 'usr_me';

  db.prepare('DELETE FROM user_sticker_packs WHERE user_id = ? AND pack_id = ?').run(userId, id);
  res.json({ success: true, installed: false });
});

// Search stickers by emoji or keyword
app.get('/api/v1/stickers/search', (req, res) => {
  const q = (req.query.q as string) || '';
  if (!q.trim()) return res.json({ success: true, stickers: [] });

  const stickers = db.prepare(`
    SELECT s.*, p.name as pack_name
    FROM stickers s
    JOIN sticker_packs p ON s.pack_id = p.id
    WHERE s.emoji_association LIKE ? OR s.keywords LIKE ?
    LIMIT 30
  `).all(`%${q}%`, `%${q}%`);

  res.json({ success: true, stickers });
});

// User Recent Emojis (Sync across devices)
app.get('/api/v1/emojis/recents', (req, res) => {
  const userId = (req.query.userId as string) || 'usr_me';
  const rows = db.prepare(`
    SELECT emoji, last_used_at, usage_count 
    FROM user_recent_emojis 
    WHERE user_id = ? 
    ORDER BY last_used_at DESC 
    LIMIT 32
  `).all(userId);

  res.json({ success: true, recents: rows.map((r: any) => r.emoji) });
});

app.post('/api/v1/emojis/recents', (req, res) => {
  const { userId = 'usr_me', emoji } = req.body;
  if (!emoji) return res.status(400).json({ error: 'Emoji is required' });

  db.prepare(`
    INSERT INTO user_recent_emojis (user_id, emoji, last_used_at, usage_count)
    VALUES (?, ?, ?, 1)
    ON CONFLICT(user_id, emoji) DO UPDATE SET 
      last_used_at = excluded.last_used_at,
      usage_count = usage_count + 1
  `).run(userId, emoji, Date.now());

  res.json({ success: true });
});


// Add Social Link
app.post('/api/v1/profile/social-links', (req, res) => {
  const { 
    userId = 'usr_me', 
    url, 
    customLabel, 
    visibility = 'public' 
  } = req.body;

  if (!url) return res.status(400).json({ error: 'URL is required' });

  // 1. Recognize and validate server-side
  const recognized = recognizeSocialUrl(url);
  if (!recognized.success) {
    return res.status(400).json({ error: recognized.error || 'Invalid profile URL' });
  }

  // 2. Check for duplicate canonical URL for this user
  const existing = db.prepare('SELECT id FROM user_social_links WHERE user_id = ? AND canonical_url = ?')
    .get(userId, recognized.canonicalUrl);
  if (existing) {
    return res.status(409).json({ error: 'This profile link has already been added to your Digital Life' });
  }

  // 3. Get next sort_order
  const maxOrderRow = db.prepare('SELECT COALESCE(MAX(sort_order), -1) + 1 as next_order FROM user_social_links WHERE user_id = ?')
    .get(userId) as { next_order: number };
  const sortOrder = maxOrderRow.next_order;

  const id = `link_${uuidv4().slice(0, 8)}`;
  const now = Date.now();

  db.prepare(`
    INSERT INTO user_social_links (
      id, user_id, platform_id, original_url, canonical_url,
      username, custom_label, visibility, sort_order, verification_status,
      created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'SELF_DECLARED', ?, ?)
  `).run(
    id,
    userId,
    recognized.platformId,
    url,
    recognized.canonicalUrl,
    recognized.username || null,
    customLabel || null,
    visibility,
    sortOrder,
    now,
    now
  );

  const newLink = {
    id,
    userId,
    platformId: recognized.platformId,
    platformName: recognized.platformName,
    category: recognized.category,
    color: recognized.color,
    badgeBg: recognized.badgeBg,
    iconName: recognized.iconName,
    originalUrl: url,
    canonicalUrl: recognized.canonicalUrl,
    username: recognized.username,
    customLabel: customLabel || null,
    visibility,
    sortOrder,
    verificationStatus: 'SELF_DECLARED',
    createdAt: now,
    updatedAt: now
  };

  res.status(201).json({ success: true, link: newLink });
});

// Update Social Link (Visibility, Custom Label, Sort Order)
app.patch('/api/v1/profile/social-links/:id', (req, res) => {
  const { id } = req.params;
  const { userId = 'usr_me', customLabel, visibility, sortOrder } = req.body;

  const link = db.prepare('SELECT * FROM user_social_links WHERE id = ?').get(id) as any;
  if (!link) return res.status(404).json({ error: 'Social link not found' });
  if (link.user_id !== userId) return res.status(403).json({ error: 'Unauthorized to edit this link' });

  const updatedLabel = customLabel !== undefined ? customLabel : link.custom_label;
  const updatedVisibility = visibility !== undefined ? visibility : link.visibility;
  const updatedOrder = sortOrder !== undefined ? sortOrder : link.sort_order;
  const now = Date.now();

  db.prepare(`
    UPDATE user_social_links 
    SET custom_label = ?, visibility = ?, sort_order = ?, updated_at = ?
    WHERE id = ?
  `).run(updatedLabel, updatedVisibility, updatedOrder, now, id);

  res.json({ success: true, updated: true });
});

// Delete Social Link
app.delete('/api/v1/profile/social-links/:id', (req, res) => {
  const { id } = req.params;
  const userId = (req.query.userId as string) || 'usr_me';

  const link = db.prepare('SELECT user_id FROM user_social_links WHERE id = ?').get(id) as any;
  if (!link) return res.status(404).json({ error: 'Social link not found' });
  if (link.user_id !== userId) return res.status(403).json({ error: 'Unauthorized to delete this link' });

  db.prepare('DELETE FROM user_social_links WHERE id = ?').run(id);
  res.json({ success: true, deleted: true });
});

// Reorder Social Links
app.patch('/api/v1/profile/social-links-reorder', (req, res) => {
  const { userId = 'usr_me', linkIds } = req.body;
  if (!Array.isArray(linkIds)) {
    return res.status(400).json({ error: 'linkIds array is required' });
  }

  const tx = db.transaction(() => {
    linkIds.forEach((id, idx) => {
      db.prepare('UPDATE user_social_links SET sort_order = ? WHERE id = ? AND user_id = ?').run(idx, id, userId);
    });
  });

  tx();
  res.json({ success: true, reordered: true });
});

// View Public / Matched Social Links for Target User (Strict Visibility Authorization)
app.get('/api/v1/users/:userId/social-links', (req, res) => {
  const { userId: targetUserId } = req.params;
  const callerId = (req.query.callerId as string) || 'usr_anonymous';

  // Determine relationship between caller and target
  let allowedVisibilities: string[] = ['public'];

  if (callerId === targetUserId) {
    allowedVisibilities = ['public', 'matches_only', 'private'];
  } else {
    // Check if matched in a direct conversation
    const isMatched = db.prepare(`
      SELECT 1 FROM conversations c
      JOIN conversation_members cm1 ON c.id = cm1.conversation_id AND cm1.user_id = ?
      JOIN conversation_members cm2 ON c.id = cm2.conversation_id AND cm2.user_id = ?
      WHERE c.type = 'direct'
    `).get(callerId, targetUserId);

    if (isMatched) {
      allowedVisibilities = ['public', 'matches_only'];
    }
  }

  const placeholders = allowedVisibilities.map(() => '?').join(',');
  const rows = db.prepare(`
    SELECT * FROM user_social_links 
    WHERE user_id = ? AND visibility IN (${placeholders})
    ORDER BY sort_order ASC, created_at ASC
  `).all(targetUserId, ...allowedVisibilities) as any[];

  const links = rows.map(r => {
    const config = PLATFORM_REGISTRY[r.platform_id];
    return {
      id: r.id,
      userId: r.user_id,
      platformId: r.platform_id,
      platformName: config ? config.name : (r.custom_label || 'Website'),
      category: config ? config.category : 'web',
      color: config ? config.color : '#FF4F87',
      badgeBg: config ? config.badgeBg : 'rgba(255, 79, 135, 0.15)',
      iconName: config ? config.iconName : 'Globe',
      canonicalUrl: r.canonical_url,
      username: r.username,
      customLabel: r.custom_label,
      visibility: r.visibility,
      verificationStatus: r.verification_status
    };
  });

  res.json({ success: true, links });
});

// -------------------------------------------------------------
// 17. STICKER & ANIMATED EMOJI ECOSYSTEM ENDPOINTS
// -------------------------------------------------------------

app.get('/api/v1/stickers/categories', (_req, res) => {
  const categories = db.prepare('SELECT * FROM sticker_categories ORDER BY sort_order ASC').all();
  res.json({ success: true, categories });
});

// Discover all sticker packs
app.get('/api/v1/stickers/packs', (req, res) => {
  const userId = (req.query.userId as string) || 'usr_me';

  const packs = db.prepare(`
    SELECT p.*, 
           CASE WHEN usp.pack_id IS NOT NULL THEN 1 ELSE 0 END as is_installed
    FROM sticker_packs p
    LEFT JOIN user_sticker_packs usp ON p.id = usp.pack_id AND usp.user_id = ?
    ORDER BY p.is_official DESC, p.created_at DESC
  `).all(userId) as any[];

  res.json({ success: true, packs });
});

// Get user's installed sticker packs with stickers
app.get('/api/v1/stickers/my-packs', (req, res) => {
  const userId = (req.query.userId as string) || 'usr_me';

  const packs = db.prepare(`
    SELECT p.*, usp.sort_order as user_sort_order
    FROM sticker_packs p
    JOIN user_sticker_packs usp ON p.id = usp.pack_id
    WHERE usp.user_id = ?
    ORDER BY usp.sort_order ASC, usp.installed_at DESC
  `).all(userId) as any[];

  const stickerStmt = db.prepare('SELECT * FROM stickers WHERE pack_id = ? ORDER BY sort_order ASC');
  const result = packs.map(p => ({
    ...p,
    stickers: stickerStmt.all(p.id)
  }));

  res.json({ success: true, packs: result });
});

// Install sticker pack
app.post('/api/v1/stickers/packs/:id/install', (req, res) => {
  const { id } = req.params;
  const { userId = 'usr_me' } = req.body;

  db.prepare(`
    INSERT OR IGNORE INTO user_sticker_packs (user_id, pack_id, installed_at, sort_order)
    VALUES (?, ?, ?, 0)
  `).run(userId, id, Date.now());

  res.json({ success: true, installed: true });
});

// Uninstall sticker pack
app.delete('/api/v1/stickers/packs/:id/install', (req, res) => {
  const { id } = req.params;
  const userId = (req.query.userId as string) || 'usr_me';

  db.prepare('DELETE FROM user_sticker_packs WHERE user_id = ? AND pack_id = ?').run(userId, id);
  res.json({ success: true, installed: false });
});

// Search stickers by emoji or keyword
app.get('/api/v1/stickers/search', (req, res) => {
  const q = (req.query.q as string) || '';
  if (!q.trim()) return res.json({ success: true, stickers: [] });

  const stickers = db.prepare(`
    SELECT s.*, p.name as pack_name
    FROM stickers s
    JOIN sticker_packs p ON s.pack_id = p.id
    WHERE s.emoji_association LIKE ? OR s.keywords LIKE ?
    LIMIT 30
  `).all(`%${q}%`, `%${q}%`);

  res.json({ success: true, stickers });
});

// User Recent Emojis (Sync across devices)
app.get('/api/v1/emojis/recents', (req, res) => {
  const userId = (req.query.userId as string) || 'usr_me';
  const rows = db.prepare(`
    SELECT emoji, last_used_at, usage_count 
    FROM user_recent_emojis 
    WHERE user_id = ? 
    ORDER BY last_used_at DESC 
    LIMIT 32
  `).all(userId);

  res.json({ success: true, recents: rows.map((r: any) => r.emoji) });
});

app.post('/api/v1/emojis/recents', (req, res) => {
  const { userId = 'usr_me', emoji } = req.body;
  if (!emoji) return res.status(400).json({ error: 'Emoji is required' });

  db.prepare(`
    INSERT INTO user_recent_emojis (user_id, emoji, last_used_at, usage_count)
    VALUES (?, ?, ?, 1)
    ON CONFLICT(user_id, emoji) DO UPDATE SET 
      last_used_at = excluded.last_used_at,
      usage_count = usage_count + 1
  `).run(userId, emoji, Date.now());

  res.json({ success: true });
});

// ============================================================================
// LIVING IDENTITY PROFILE ENDPOINTS
// ============================================================================

// Helper to determine allowed visibility levels based on relationship
function getAllowedVisibilities(viewerId: string, targetUserId: string): string[] {
  if (viewerId === targetUserId) {
    return ['public', 'matches', 'friends', 'selected', 'private'];
  }

  // Check relationship in database
  const rels = db.prepare(`
    SELECT relationship_type FROM user_relationships 
    WHERE user_id = ? AND target_user_id = ?
  `).all(targetUserId, viewerId) as { relationship_type: string }[];

  const types = new Set(rels.map(r => r.relationship_type));
  if (types.has('selected')) {
    return ['public', 'matches', 'friends', 'selected'];
  }
  if (types.has('friend')) {
    return ['public', 'matches', 'friends'];
  }
  if (types.has('match')) {
    return ['public', 'matches'];
  }
  return ['public'];
}

// 1. Get Complete Living Identity Profile with Privacy Enforcement
app.get('/api/v1/profile/living/:userId', (req, res) => {
  const { userId } = req.params;
  const viewerId = (req.query.viewerId as string) || 'usr_me';

  if (checkUserBlocked(userId, viewerId)) {
    return res.status(403).json({ error: 'Access denied: relationship blocked' });
  }

  const user = db.prepare('SELECT id, name, username, avatar_url, is_verified, last_seen_at, status_text FROM users WHERE id = ?').get(userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const allowedVis = getAllowedVisibilities(viewerId, userId);
  const isOwner = viewerId === userId;
  const visPlaceholders = allowedVis.map(() => '?').join(',');

  // Sections
  const sections = db.prepare(`
    SELECT * FROM profile_sections
    WHERE user_id = ? AND is_archived = 0 AND visibility IN (${visPlaceholders})
    ORDER BY sort_order ASC, created_at ASC
  `).all(userId, ...allowedVis) as any[];

  // Entries per section
  for (const sec of sections) {
    const statusCondition = isOwner ? '' : "AND status = 'published'";
    sec.entries = db.prepare(`
      SELECT * FROM profile_entries
      WHERE section_id = ? AND visibility IN (${visPlaceholders}) ${statusCondition}
      ORDER BY sort_order ASC, created_at ASC
    `).all(sec.id, ...allowedVis);
  }

  // Questions & Answers
  const questions = db.prepare(`
    SELECT * FROM profile_questions
    WHERE user_id = ? AND visibility IN (${visPlaceholders})
    ORDER BY sort_order ASC, created_at ASC
  `).all(userId, ...allowedVis) as any[];

  for (const q of questions) {
    q.answers = db.prepare(`
      SELECT a.*, u.name as respondent_name, u.avatar_url as respondent_avatar
      FROM profile_answers a
      JOIN users u ON a.user_id = u.id
      WHERE a.question_id = ? AND a.visibility IN (${visPlaceholders})
      ORDER BY a.created_at ASC
    `).all(q.id, ...allowedVis);
  }

  // Timeline Events
  const timeline = db.prepare(`
    SELECT * FROM profile_timeline_events
    WHERE user_id = ? AND visibility IN (${visPlaceholders})
    ORDER BY sort_order ASC, created_at ASC
  `).all(userId, ...allowedVis);

  // Thoughts & Writings
  const thoughtStatusCondition = isOwner ? '' : "AND status = 'published'";
  const thoughts = db.prepare(`
    SELECT * FROM profile_thoughts
    WHERE user_id = ? AND visibility IN (${visPlaceholders}) ${thoughtStatusCondition}
    ORDER BY is_pinned DESC, created_at DESC
  `).all(userId, ...allowedVis);

  const accessLevel = isOwner 
    ? 'owner' 
    : allowedVis.includes('friends') 
      ? 'friends' 
      : allowedVis.includes('matches') 
        ? 'matches' 
        : 'public';

  res.json({
    success: true,
    user,
    viewerId,
    accessLevel,
    sections,
    questions,
    timeline,
    thoughts
  });
});

// 2. Sections CRUD
app.post('/api/v1/profile/sections', (req, res) => {
  const { userId = 'usr_me', title, description = '', section_type = 'custom', icon = '✨', visibility = 'public', is_pinned = 0 } = req.body;
  if (!title || !title.trim()) return res.status(400).json({ error: 'Title is required' });

  const id = `sec_${uuidv4().slice(0, 8)}`;
  const now = Date.now();
  const maxOrder = db.prepare('SELECT MAX(sort_order) as m FROM profile_sections WHERE user_id = ?').get(userId) as any;
  const sort_order = (maxOrder?.m || 0) + 1;

  db.prepare(`
    INSERT INTO profile_sections (id, user_id, title, description, section_type, icon, sort_order, visibility, is_pinned, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, userId, title.trim(), description.trim(), section_type, icon, sort_order, visibility, is_pinned ? 1 : 0, now, now);

  const section = db.prepare('SELECT * FROM profile_sections WHERE id = ?').get(id);
  res.json({ success: true, section });
});

app.put('/api/v1/profile/sections/:id', (req, res) => {
  const { id } = req.params;
  const { title, description, icon, visibility, is_pinned, is_archived } = req.body;
  const existing = db.prepare('SELECT * FROM profile_sections WHERE id = ?').get(id);
  if (!existing) return res.status(404).json({ error: 'Section not found' });

  db.prepare(`
    UPDATE profile_sections SET
      title = COALESCE(?, title),
      description = COALESCE(?, description),
      icon = COALESCE(?, icon),
      visibility = COALESCE(?, visibility),
      is_pinned = COALESCE(?, is_pinned),
      is_archived = COALESCE(?, is_archived),
      updated_at = ?
    WHERE id = ?
  `).run(
    title !== undefined ? title : null,
    description !== undefined ? description : null,
    icon !== undefined ? icon : null,
    visibility !== undefined ? visibility : null,
    is_pinned !== undefined ? (is_pinned ? 1 : 0) : null,
    is_archived !== undefined ? (is_archived ? 1 : 0) : null,
    Date.now(),
    id
  );

  const updated = db.prepare('SELECT * FROM profile_sections WHERE id = ?').get(id);
  res.json({ success: true, section: updated });
});

app.delete('/api/v1/profile/sections/:id', (req, res) => {
  const { id } = req.params;
  db.prepare('DELETE FROM profile_sections WHERE id = ?').run(id);
  res.json({ success: true, deletedId: id });
});

app.post('/api/v1/profile/sections/reorder', (req, res) => {
  const { sectionIds } = req.body;
  if (!Array.isArray(sectionIds)) return res.status(400).json({ error: 'sectionIds array required' });

  const update = db.prepare('UPDATE profile_sections SET sort_order = ? WHERE id = ?');
  const tx = db.transaction(() => {
    sectionIds.forEach((id, index) => {
      update.run(index + 1, id);
    });
  });
  tx();
  res.json({ success: true });
});

// 3. Entries CRUD
app.post('/api/v1/profile/entries', (req, res) => {
  const { sectionId, userId = 'usr_me', entry_type = 'text', title = '', content, structured_content = null, visibility = 'public', is_pinned = 0, status = 'published' } = req.body;
  if (!sectionId || !content || !content.trim()) return res.status(400).json({ error: 'sectionId and content are required' });
  if (content.length > 5000) {
    return res.status(400).json({ error: 'Content exceeds maximum limit of 5,000 characters.', characterCount: content.length, maxLimit: 5000 });
  }

  const id = `ent_${uuidv4().slice(0, 8)}`;
  const now = Date.now();
  const maxOrder = db.prepare('SELECT MAX(sort_order) as m FROM profile_entries WHERE section_id = ?').get(sectionId) as any;
  const sort_order = (maxOrder?.m || 0) + 1;

  db.prepare(`
    INSERT INTO profile_entries (id, section_id, user_id, entry_type, title, content, structured_content, visibility, sort_order, is_pinned, status, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, sectionId, userId, entry_type, title.trim(), content.trim(), structured_content ? (typeof structured_content === 'string' ? structured_content : JSON.stringify(structured_content)) : null, visibility, sort_order, is_pinned ? 1 : 0, status, now, now);

  const entry = db.prepare('SELECT * FROM profile_entries WHERE id = ?').get(id);
  res.json({ success: true, entry });
});

app.put('/api/v1/profile/entries/:id', (req, res) => {
  const { id } = req.params;
  const { title, content, structured_content, visibility, is_pinned, status } = req.body;
  const existing = db.prepare('SELECT * FROM profile_entries WHERE id = ?').get(id);
  if (!existing) return res.status(404).json({ error: 'Entry not found' });

  db.prepare(`
    UPDATE profile_entries SET
      title = COALESCE(?, title),
      content = COALESCE(?, content),
      structured_content = COALESCE(?, structured_content),
      visibility = COALESCE(?, visibility),
      is_pinned = COALESCE(?, is_pinned),
      status = COALESCE(?, status),
      updated_at = ?
    WHERE id = ?
  `).run(
    title !== undefined ? title : null,
    content !== undefined ? content : null,
    structured_content !== undefined ? (typeof structured_content === 'string' ? structured_content : JSON.stringify(structured_content)) : null,
    visibility !== undefined ? visibility : null,
    is_pinned !== undefined ? (is_pinned ? 1 : 0) : null,
    status !== undefined ? status : null,
    Date.now(),
    id
  );

  const updated = db.prepare('SELECT * FROM profile_entries WHERE id = ?').get(id);
  res.json({ success: true, entry: updated });
});

app.delete('/api/v1/profile/entries/:id', (req, res) => {
  const { id } = req.params;
  db.prepare('DELETE FROM profile_entries WHERE id = ?').run(id);
  res.json({ success: true, deletedId: id });
});

// 4. Questions & Answers CRUD
app.post('/api/v1/profile/questions', (req, res) => {
  const { userId = 'usr_me', sectionId = null, question, description = '', answer_type = 'long_text', options = null, visibility = 'public', allow_responses = 0 } = req.body;
  if (!question || !question.trim()) return res.status(400).json({ error: 'Question is required' });

  const id = `q_${uuidv4().slice(0, 8)}`;
  const now = Date.now();
  const maxOrder = db.prepare('SELECT MAX(sort_order) as m FROM profile_questions WHERE user_id = ?').get(userId) as any;
  const sort_order = (maxOrder?.m || 0) + 1;

  db.prepare(`
    INSERT INTO profile_questions (id, user_id, section_id, question, description, answer_type, options, visibility, allow_responses, sort_order, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, userId, sectionId, question.trim(), description.trim(), answer_type, options ? JSON.stringify(options) : null, visibility, allow_responses ? 1 : 0, sort_order, now, now);

  const created = db.prepare('SELECT * FROM profile_questions WHERE id = ?').get(id);
  res.json({ success: true, question: created });
});

app.post('/api/v1/profile/questions/:id/answer', (req, res) => {
  const { id: question_id } = req.params;
  const { userId = 'usr_me', answer_content, structured_answer = null, visibility = 'public' } = req.body;
  if (!answer_content || !answer_content.trim()) return res.status(400).json({ error: 'Answer content is required' });

  const ansId = `ans_${uuidv4().slice(0, 8)}`;
  const now = Date.now();

  db.prepare(`
    INSERT INTO profile_answers (id, question_id, user_id, answer_content, structured_answer, visibility, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(ansId, question_id, userId, answer_content.trim(), structured_answer ? JSON.stringify(structured_answer) : null, visibility, now, now);

  const answer = db.prepare('SELECT * FROM profile_answers WHERE id = ?').get(ansId);
  res.json({ success: true, answer });
});

app.delete('/api/v1/profile/questions/:id', (req, res) => {
  const { id } = req.params;
  db.prepare('DELETE FROM profile_questions WHERE id = ?').run(id);
  res.json({ success: true, deletedId: id });
});

// 5. Timeline Events CRUD
app.post('/api/v1/profile/timeline', (req, res) => {
  const { userId = 'usr_me', title, description, event_date = '', date_precision = 'approximate', category = 'milestone', personal_significance = '', lessons_learned = '', media_url = null, visibility = 'public' } = req.body;
  if (!title || !description) return res.status(400).json({ error: 'Title and description are required' });

  const id = `time_${uuidv4().slice(0, 8)}`;
  const now = Date.now();
  const maxOrder = db.prepare('SELECT MAX(sort_order) as m FROM profile_timeline_events WHERE user_id = ?').get(userId) as any;
  const sort_order = (maxOrder?.m || 0) + 1;

  db.prepare(`
    INSERT INTO profile_timeline_events (id, user_id, title, description, event_date, date_precision, category, personal_significance, lessons_learned, media_url, visibility, sort_order, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, userId, title.trim(), description.trim(), event_date, date_precision, category, personal_significance, lessons_learned, media_url, visibility, sort_order, now, now);

  const event = db.prepare('SELECT * FROM profile_timeline_events WHERE id = ?').get(id);
  res.json({ success: true, event });
});

app.put('/api/v1/profile/timeline/:id', (req, res) => {
  const { id } = req.params;
  const { title, description, event_date, date_precision, category, personal_significance, lessons_learned, visibility } = req.body;

  db.prepare(`
    UPDATE profile_timeline_events SET
      title = COALESCE(?, title),
      description = COALESCE(?, description),
      event_date = COALESCE(?, event_date),
      date_precision = COALESCE(?, date_precision),
      category = COALESCE(?, category),
      personal_significance = COALESCE(?, personal_significance),
      lessons_learned = COALESCE(?, lessons_learned),
      visibility = COALESCE(?, visibility),
      updated_at = ?
    WHERE id = ?
  `).run(
    title !== undefined ? title : null,
    description !== undefined ? description : null,
    event_date !== undefined ? event_date : null,
    date_precision !== undefined ? date_precision : null,
    category !== undefined ? category : null,
    personal_significance !== undefined ? personal_significance : null,
    lessons_learned !== undefined ? lessons_learned : null,
    visibility !== undefined ? visibility : null,
    Date.now(),
    id
  );

  const updated = db.prepare('SELECT * FROM profile_timeline_events WHERE id = ?').get(id);
  res.json({ success: true, event: updated });
});

app.delete('/api/v1/profile/timeline/:id', (req, res) => {
  const { id } = req.params;
  db.prepare('DELETE FROM profile_timeline_events WHERE id = ?').run(id);
  res.json({ success: true, deletedId: id });
});

// 6. Thoughts & Personal Writing CRUD
app.post('/api/v1/profile/thoughts', (req, res) => {
  const { userId = 'usr_me', title = '', content, thought_type = 'thought', tags = '', is_pinned = 0, status = 'published', visibility = 'public' } = req.body;
  if (!content || !content.trim()) return res.status(400).json({ error: 'Content is required' });
  if (content.length > 5000) {
    return res.status(400).json({ error: 'Content exceeds maximum limit of 5,000 characters.', characterCount: content.length, maxLimit: 5000 });
  }

  const id = `tht_${uuidv4().slice(0, 8)}`;
  const now = Date.now();

  db.prepare(`
    INSERT INTO profile_thoughts (id, user_id, title, content, thought_type, tags, is_pinned, status, visibility, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, userId, title.trim(), content.trim(), thought_type, tags, is_pinned ? 1 : 0, status, visibility, now, now);

  const thought = db.prepare('SELECT * FROM profile_thoughts WHERE id = ?').get(id);
  res.json({ success: true, thought });
});

app.put('/api/v1/profile/thoughts/:id', (req, res) => {
  const { id } = req.params;
  const { title, content, thought_type, tags, is_pinned, status, visibility } = req.body;

  db.prepare(`
    UPDATE profile_thoughts SET
      title = COALESCE(?, title),
      content = COALESCE(?, content),
      thought_type = COALESCE(?, thought_type),
      tags = COALESCE(?, tags),
      is_pinned = COALESCE(?, is_pinned),
      status = COALESCE(?, status),
      visibility = COALESCE(?, visibility),
      updated_at = ?
    WHERE id = ?
  `).run(
    title !== undefined ? title : null,
    content !== undefined ? content : null,
    thought_type !== undefined ? thought_type : null,
    tags !== undefined ? tags : null,
    is_pinned !== undefined ? (is_pinned ? 1 : 0) : null,
    status !== undefined ? status : null,
    visibility !== undefined ? visibility : null,
    Date.now(),
    id
  );

  const updated = db.prepare('SELECT * FROM profile_thoughts WHERE id = ?').get(id);
  res.json({ success: true, thought: updated });
});

app.delete('/api/v1/profile/thoughts/:id', (req, res) => {
  const { id } = req.params;
  db.prepare('DELETE FROM profile_thoughts WHERE id = ?').run(id);
  res.json({ success: true, deletedId: id });
});

// 7. AI-Assisted Profile Tools (User-Initiated Only)
app.post('/api/v1/profile/ai/assist', (req, res) => {
  const { tool, content = '', context = '' } = req.body;

  let suggestion = '';
  if (tool === 'polish') {
    suggestion = content.trim().length > 0
      ? `"${content.trim()} I value depth over surface interactions, and I appreciate when people are comfortable being their unpolished, genuine selves."`
      : 'I find quiet conversations over coffee far more engaging than noisy rooms.';
  } else if (tool === 'suggest_questions') {
    suggestion = JSON.stringify([
      "What is something you learned this year that completely altered your worldview?",
      "When was the last time you felt completely understood by another person?",
      "What is a simple pleasure that never fails to calm your nervous system?",
      "What is an opinion you used to defend passionately that you now find naive?",
      "What does emotional safety look like to you in everyday communication?"
    ]);
  } else if (tool === 'turn_into_bio') {
    suggestion = `Curious explorer of first principles and slow living. Architect by craft, philosopher by evening. I thrive in deep one-on-one dialogues, quiet nature hikes, and honest laughter.`;
  } else if (tool === 'summarize') {
    suggestion = `Thoughtful and introspective; prioritizes authentic emotional safety, intellectual humility, and intentional offline connection over performative socializing.`;
  } else {
    suggestion = content;
  }

  res.json({
    success: true,
    tool,
    suggestion,
    disclaimer: 'AI-assisted draft for your personal review. Inspect and edit before saving.'
  });
});

// 8. Data Export & Permanent Deletion
app.get('/api/v1/profile/export', (req, res) => {
  const userId = (req.query.userId as string) || 'usr_me';
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
  const sections = db.prepare('SELECT * FROM profile_sections WHERE user_id = ?').all(userId);
  const entries = db.prepare('SELECT * FROM profile_entries WHERE user_id = ?').all(userId);
  const questions = db.prepare('SELECT * FROM profile_questions WHERE user_id = ?').all(userId);
  const answers = db.prepare('SELECT * FROM profile_answers WHERE user_id = ?').all(userId);
  const timeline = db.prepare('SELECT * FROM profile_timeline_events WHERE user_id = ?').all(userId);
  const thoughts = db.prepare('SELECT * FROM profile_thoughts WHERE user_id = ?').all(userId);

  res.json({
    success: true,
    exported_at: new Date().toISOString(),
    user,
    sections,
    entries,
    questions,
    answers,
    timeline,
    thoughts
  });
});

app.delete('/api/v1/profile/data', (req, res) => {
  const userId = (req.body.userId as string) || (req.query.userId as string) || 'usr_me';
  
  const tx = db.transaction(() => {
    db.prepare('DELETE FROM profile_entries WHERE user_id = ?').run(userId);
    db.prepare('DELETE FROM profile_sections WHERE user_id = ?').run(userId);
    db.prepare('DELETE FROM profile_answers WHERE user_id = ?').run(userId);
    db.prepare('DELETE FROM profile_questions WHERE user_id = ?').run(userId);
    db.prepare('DELETE FROM profile_timeline_events WHERE user_id = ?').run(userId);
    db.prepare('DELETE FROM profile_thoughts WHERE user_id = ?').run(userId);
  });
  tx();

  res.json({ success: true, message: 'All custom profile data permanently deleted' });
});

// ============================================================================
// YEAR-BY-YEAR LIFE TIMELINE & PERSONAL HISTORY ENDPOINTS
// ============================================================================

// 1. Get All Years for a User
app.get('/api/v1/timeline/years/:userId', (req, res) => {
  const { userId } = req.params;
  const viewerId = (req.query.viewerId as string) || 'usr_me';

  if (checkUserBlocked(userId, viewerId)) {
    return res.status(403).json({ error: 'Access denied: relationship blocked' });
  }

  const allowedVis = getAllowedVisibilities(viewerId, userId);
  const visPlaceholders = allowedVis.map(() => '?').join(',');

  const years = db.prepare(`
    SELECT y.*, 
      (SELECT COUNT(*) FROM life_events e WHERE e.user_id = y.user_id AND e.year_number = y.year_number AND e.visibility IN (${visPlaceholders})) as event_count,
      (SELECT COUNT(*) FROM life_reflections r WHERE r.user_id = y.user_id AND r.year_number = y.year_number AND r.reflection_type = 'year_end_review' AND r.visibility IN (${visPlaceholders})) as has_review
    FROM life_years y
    WHERE y.user_id = ? AND y.visibility IN (${visPlaceholders})
    ORDER BY y.year_number ASC
  `).all(...allowedVis, ...allowedVis, userId, ...allowedVis);

  res.json({ success: true, years });
});

// 2. Get Single Year Chapter Details
app.get('/api/v1/timeline/year/:userId/:yearNumber', (req, res) => {
  const { userId, yearNumber } = req.params;
  const viewerId = (req.query.viewerId as string) || 'usr_me';

  if (checkUserBlocked(userId, viewerId)) {
    return res.status(403).json({ error: 'Access denied: relationship blocked' });
  }

  const allowedVis = getAllowedVisibilities(viewerId, userId);
  const visPlaceholders = allowedVis.map(() => '?').join(',');

  const year = db.prepare(`
    SELECT * FROM life_years 
    WHERE user_id = ? AND year_number = ? AND visibility IN (${visPlaceholders})
  `).get(userId, parseInt(yearNumber, 10), ...allowedVis) as any;

  if (!year) {
    return res.status(404).json({ error: 'Year not found or restricted' });
  }

  const events = db.prepare(`
    SELECT e.*, c.title as chapter_title, c.icon as chapter_icon
    FROM life_events e
    LEFT JOIN life_chapters c ON e.chapter_id = c.id
    WHERE e.user_id = ? AND e.year_number = ? AND e.visibility IN (${visPlaceholders})
    ORDER BY e.is_milestone DESC, e.sort_order ASC, e.created_at ASC
  `).all(userId, parseInt(yearNumber, 10), ...allowedVis);

  const review = db.prepare(`
    SELECT * FROM life_reflections
    WHERE user_id = ? AND year_number = ? AND reflection_type = 'year_end_review' AND visibility IN (${visPlaceholders})
  `).get(userId, parseInt(yearNumber, 10), ...allowedVis);

  res.json({
    success: true,
    year,
    events,
    review: review || null
  });
});

// 3. Create or Update Life Year
app.post('/api/v1/timeline/years', (req, res) => {
  const { userId = 'usr_me', year_number, chapter_title = '', summary = '', cover_image_url = null, is_future_year = 0, visibility = 'public' } = req.body;
  if (!year_number) return res.status(400).json({ error: 'year_number is required' });

  const id = `yr_${userId}_${year_number}`;
  const now = Date.now();

  db.prepare(`
    INSERT INTO life_years (id, user_id, year_number, chapter_title, summary, cover_image_url, is_future_year, visibility, sort_order, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(user_id, year_number) DO UPDATE SET
      chapter_title = excluded.chapter_title,
      summary = excluded.summary,
      cover_image_url = excluded.cover_image_url,
      is_future_year = excluded.is_future_year,
      visibility = excluded.visibility,
      updated_at = excluded.updated_at
  `).run(id, userId, parseInt(year_number, 10), chapter_title, summary, cover_image_url, is_future_year ? 1 : 0, visibility, parseInt(year_number, 10), now, now);

  const year = db.prepare('SELECT * FROM life_years WHERE id = ?').get(id);
  res.json({ success: true, year });
});

// 4. Multi-Year Chapters
app.get('/api/v1/timeline/chapters/:userId', (req, res) => {
  const { userId } = req.params;
  const viewerId = (req.query.viewerId as string) || 'usr_me';

  if (checkUserBlocked(userId, viewerId)) {
    return res.status(403).json({ error: 'Access denied: relationship blocked' });
  }

  const allowedVis = getAllowedVisibilities(viewerId, userId);
  const visPlaceholders = allowedVis.map(() => '?').join(',');

  const chapters = db.prepare(`
    SELECT c.*, 
      (SELECT COUNT(*) FROM life_events e WHERE e.chapter_id = c.id AND e.visibility IN (${visPlaceholders})) as event_count
    FROM life_chapters c
    WHERE c.user_id = ? AND c.visibility IN (${visPlaceholders})
    ORDER BY c.start_year ASC
  `).all(...allowedVis, userId, ...allowedVis);

  res.json({ success: true, chapters });
});

app.post('/api/v1/timeline/chapters', (req, res) => {
  const { userId = 'usr_me', title, description = '', start_year, end_year = null, icon = '📖', cover_image_url = null, visibility = 'public' } = req.body;
  if (!title || !start_year) return res.status(400).json({ error: 'Title and start_year are required' });

  const id = `chap_${uuidv4().slice(0, 8)}`;
  const now = Date.now();

  db.prepare(`
    INSERT INTO life_chapters (id, user_id, title, description, start_year, end_year, icon, cover_image_url, visibility, sort_order, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, userId, title.trim(), description.trim(), parseInt(start_year, 10), end_year ? parseInt(end_year, 10) : null, icon, cover_image_url, visibility, parseInt(start_year, 10), now, now);

  const chapter = db.prepare('SELECT * FROM life_chapters WHERE id = ?').get(id);
  res.json({ success: true, chapter });
});

app.delete('/api/v1/timeline/chapters/:id', (req, res) => {
  const { id } = req.params;
  db.prepare('DELETE FROM life_chapters WHERE id = ?').run(id);
  res.json({ success: true, deletedId: id });
});

// 5. Life Events & Memories
app.get('/api/v1/timeline/events/:userId', (req, res) => {
  const { userId } = req.params;
  const viewerId = (req.query.viewerId as string) || 'usr_me';
  const category = req.query.category as string;
  const isMilestone = req.query.isMilestone === '1';
  const year = req.query.year ? parseInt(req.query.year as string, 10) : null;
  const search = (req.query.search as string) || '';

  if (checkUserBlocked(userId, viewerId)) {
    return res.status(403).json({ error: 'Access denied: relationship blocked' });
  }

  const allowedVis = getAllowedVisibilities(viewerId, userId);
  const visPlaceholders = allowedVis.map(() => '?').join(',');

  let query = `
    SELECT e.*, c.title as chapter_title, c.icon as chapter_icon
    FROM life_events e
    LEFT JOIN life_chapters c ON e.chapter_id = c.id
    WHERE e.user_id = ? AND e.visibility IN (${visPlaceholders})
  `;
  const params: any[] = [userId, ...allowedVis];

  if (year) {
    query += ' AND e.year_number = ?';
    params.push(year);
  }
  if (category) {
    query += ' AND e.category = ?';
    params.push(category);
  }
  if (isMilestone) {
    query += ' AND e.is_milestone = 1';
  }
  if (search.trim()) {
    query += ' AND (e.title LIKE ? OR e.description LIKE ? OR e.tags LIKE ?)';
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  query += ' ORDER BY e.year_number ASC, e.sort_order ASC, e.created_at ASC';

  const events = db.prepare(query).all(...params);
  res.json({ success: true, events });
});

app.post('/api/v1/timeline/events', (req, res) => {
  const {
    userId = 'usr_me',
    year_number,
    chapter_id = null,
    title,
    description,
    date_display = '',
    date_precision = 'approximate',
    is_planned = 0,
    is_milestone = 0,
    category = 'other',
    tags = '',
    location = '',
    people_involved = '',
    personal_significance = '',
    lessons_learned = '',
    emotional_reflection = '',
    media_urls = null,
    visibility = 'public'
  } = req.body;

  if (!year_number || !title || !description) {
    return res.status(400).json({ error: 'year_number, title, and description are required' });
  }

  const id = `evt_${uuidv4().slice(0, 8)}`;
  const now = Date.now();
  const maxOrder = db.prepare('SELECT MAX(sort_order) as m FROM life_events WHERE user_id = ? AND year_number = ?').get(userId, parseInt(year_number, 10)) as any;
  const sort_order = (maxOrder?.m || 0) + 1;

  // Auto-create year record if not existing
  db.prepare(`
    INSERT OR IGNORE INTO life_years (id, user_id, year_number, chapter_title, summary, is_future_year, visibility, sort_order, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(`yr_${userId}_${year_number}`, userId, parseInt(year_number, 10), `${year_number} Chapter`, `Chronological memories of ${year_number}`, is_planned ? 1 : 0, visibility, parseInt(year_number, 10), now, now);

  db.prepare(`
    INSERT INTO life_events (
      id, user_id, year_number, chapter_id, title, description, date_display, date_precision,
      is_planned, is_milestone, category, tags, location, people_involved, personal_significance,
      lessons_learned, emotional_reflection, media_urls, visibility, sort_order, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id, userId, parseInt(year_number, 10), chapter_id, title.trim(), description.trim(), date_display, date_precision,
    is_planned ? 1 : 0, is_milestone ? 1 : 0, category, tags, location, people_involved, personal_significance,
    lessons_learned, emotional_reflection, media_urls ? (typeof media_urls === 'string' ? media_urls : JSON.stringify(media_urls)) : null,
    visibility, sort_order, now, now
  );

  const event = db.prepare('SELECT * FROM life_events WHERE id = ?').get(id);
  res.json({ success: true, event });
});

app.put('/api/v1/timeline/events/:id', (req, res) => {
  const { id } = req.params;
  const {
    title, description, date_display, date_precision, is_planned, is_milestone,
    category, tags, location, people_involved, personal_significance,
    lessons_learned, emotional_reflection, media_urls, visibility, status
  } = req.body;

  db.prepare(`
    UPDATE life_events SET
      title = COALESCE(?, title),
      description = COALESCE(?, description),
      date_display = COALESCE(?, date_display),
      date_precision = COALESCE(?, date_precision),
      is_planned = COALESCE(?, is_planned),
      is_milestone = COALESCE(?, is_milestone),
      category = COALESCE(?, category),
      tags = COALESCE(?, tags),
      location = COALESCE(?, location),
      people_involved = COALESCE(?, people_involved),
      personal_significance = COALESCE(?, personal_significance),
      lessons_learned = COALESCE(?, lessons_learned),
      emotional_reflection = COALESCE(?, emotional_reflection),
      media_urls = COALESCE(?, media_urls),
      visibility = COALESCE(?, visibility),
      status = COALESCE(?, status),
      updated_at = ?
    WHERE id = ?
  `).run(
    title !== undefined ? title : null,
    description !== undefined ? description : null,
    date_display !== undefined ? date_display : null,
    date_precision !== undefined ? date_precision : null,
    is_planned !== undefined ? (is_planned ? 1 : 0) : null,
    is_milestone !== undefined ? (is_milestone ? 1 : 0) : null,
    category !== undefined ? category : null,
    tags !== undefined ? tags : null,
    location !== undefined ? location : null,
    people_involved !== undefined ? people_involved : null,
    personal_significance !== undefined ? personal_significance : null,
    lessons_learned !== undefined ? lessons_learned : null,
    emotional_reflection !== undefined ? emotional_reflection : null,
    media_urls !== undefined ? (typeof media_urls === 'string' ? media_urls : JSON.stringify(media_urls)) : null,
    visibility !== undefined ? visibility : null,
    status !== undefined ? status : null,
    Date.now(),
    id
  );

  const updated = db.prepare('SELECT * FROM life_events WHERE id = ?').get(id);
  res.json({ success: true, event: updated });
});

app.delete('/api/v1/timeline/events/:id', (req, res) => {
  const { id } = req.params;
  db.prepare('DELETE FROM life_events WHERE id = ?').run(id);
  res.json({ success: true, deletedId: id });
});

// 6. Annual Reviews & Then-vs-Now Comparisons
app.get('/api/v1/timeline/reflections/:userId', (req, res) => {
  const { userId } = req.params;
  const viewerId = (req.query.viewerId as string) || 'usr_me';
  const type = req.query.type as string; // 'year_end_review' | 'then_vs_now'

  if (checkUserBlocked(userId, viewerId)) {
    return res.status(403).json({ error: 'Access denied: relationship blocked' });
  }

  const allowedVis = getAllowedVisibilities(viewerId, userId);
  const visPlaceholders = allowedVis.map(() => '?').join(',');

  let query = `
    SELECT * FROM life_reflections
    WHERE user_id = ? AND visibility IN (${visPlaceholders})
  `;
  const params: any[] = [userId, ...allowedVis];

  if (type) {
    query += ' AND reflection_type = ?';
    params.push(type);
  }

  query += ' ORDER BY created_at DESC';

  const reflections = db.prepare(query).all(...params);
  res.json({ success: true, reflections });
});

app.post('/api/v1/timeline/reflections', (req, res) => {
  const {
    userId = 'usr_me',
    reflection_type,
    year_number = null,
    compare_year_a = null,
    compare_year_b = null,
    title,
    content_json,
    visibility = 'public'
  } = req.body;

  if (!reflection_type || !title || !content_json) {
    return res.status(400).json({ error: 'reflection_type, title, and content_json are required' });
  }

  const id = `ref_${uuidv4().slice(0, 8)}`;
  const now = Date.now();

  db.prepare(`
    INSERT INTO life_reflections (
      id, user_id, reflection_type, year_number, compare_year_a, compare_year_b,
      title, content_json, visibility, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id, userId, reflection_type,
    year_number ? parseInt(year_number, 10) : null,
    compare_year_a ? parseInt(compare_year_a, 10) : null,
    compare_year_b ? parseInt(compare_year_b, 10) : null,
    title.trim(),
    typeof content_json === 'string' ? content_json : JSON.stringify(content_json),
    visibility, now, now
  );

  const created = db.prepare('SELECT * FROM life_reflections WHERE id = ?').get(id);
  res.json({ success: true, reflection: created });
});

app.delete('/api/v1/timeline/reflections/:id', (req, res) => {
  const { id } = req.params;
  db.prepare('DELETE FROM life_reflections WHERE id = ?').run(id);
  res.json({ success: true, deletedId: id });
});

// ============================================================================
// GITHUB-FLAVORED MARKDOWN PROFILE MANIFESTO (5,000 CHARACTER LIMIT)
// ============================================================================

// 1. Get Markdown Document for a User
app.get('/api/v1/profile/markdown/:userId', (req, res) => {
  const { userId } = req.params;
  const viewerId = (req.query.viewerId as string) || 'usr_me';

  if (checkUserBlocked(viewerId, userId)) {
    return res.status(403).json({ error: 'You do not have permission to view this profile' });
  }

  const allowedVisibilities = getAllowedVisibilities(viewerId, userId);
  const row = db.prepare('SELECT * FROM profile_markdowns WHERE user_id = ?').get(userId) as any;

  if (!row) {
    return res.json({ success: true, markdown: null, isOwner: viewerId === userId });
  }

  if (allowedVisibilities.includes(row.visibility)) {
    return res.json({
      success: true,
      markdown: row,
      characterCount: row.content.length,
      maxLimit: 5000,
      isOwner: viewerId === userId,
      allowed: true
    });
  }

  return res.json({
    success: true,
    markdown: null,
    isRestricted: true,
    requiredVisibility: row.visibility,
    isOwner: false,
    allowed: false
  });
});

// 2. Create or Update Markdown Document (Strict 5,000 character limit enforcement)
app.post('/api/v1/profile/markdown', (req, res) => {
  const {
    userId = 'usr_me',
    title = 'README.md',
    content,
    visibility = 'public'
  } = req.body;

  if (content === undefined || content === null) {
    return res.status(400).json({ error: 'Markdown content is required' });
  }

  if (typeof content !== 'string') {
    return res.status(400).json({ error: 'Markdown content must be a string' });
  }

  // Strict 5,000 character limit enforcement
  if (content.length > 5000) {
    return res.status(400).json({
      error: 'Content exceeds the maximum limit of 5,000 characters.',
      characterCount: content.length,
      maxLimit: 5000
    });
  }

  const validVisibilities = ['public', 'matches', 'friends', 'selected', 'private'];
  const safeVisibility = validVisibilities.includes(visibility) ? visibility : 'public';
  const cleanTitle = (title && typeof title === 'string' && title.trim()) ? title.trim() : 'README.md';

  const now = Date.now();
  const existing = db.prepare('SELECT id FROM profile_markdowns WHERE user_id = ?').get(userId) as any;

  if (existing) {
    db.prepare(`
      UPDATE profile_markdowns
      SET title = ?, content = ?, visibility = ?, updated_at = ?
      WHERE user_id = ?
    `).run(cleanTitle, content, safeVisibility, now, userId);
  } else {
    const id = `md_${uuidv4().slice(0, 8)}`;
    db.prepare(`
      INSERT INTO profile_markdowns (id, user_id, title, content, visibility, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(id, userId, cleanTitle, content, safeVisibility, now, now);
  }

  const saved = db.prepare('SELECT * FROM profile_markdowns WHERE user_id = ?').get(userId);
  res.json({
    success: true,
    markdown: saved,
    characterCount: content.length,
    remainingCharacters: 5000 - content.length,
    maxLimit: 5000
  });
});

// 3. Delete Markdown Document
app.delete('/api/v1/profile/markdown/:userId', (req, res) => {
  const { userId } = req.params;
  db.prepare('DELETE FROM profile_markdowns WHERE user_id = ?').run(userId);
  res.json({ success: true, message: 'Markdown profile cleared successfully' });
});

// ============================================================================
// PROFILE WORLDS: MULTI-DIMENSIONAL IDENTITY & SELF-EXPRESSION ENDPOINTS
// ============================================================================

// 1. Get All Profile Worlds for a User
app.get('/api/v1/worlds/user/:userId', (req, res) => {
  const { userId } = req.params;
  const viewerId = (req.query.viewerId as string) || 'usr_me';

  if (checkUserBlocked(viewerId, userId)) {
    return res.status(403).json({ error: 'You do not have permission to view this user\'s worlds' });
  }

  const isOwner = viewerId === userId;
  const allowedVisibilities = getAllowedVisibilities(viewerId, userId);

  let query = 'SELECT * FROM profile_worlds WHERE user_id = ?';
  const params: any[] = [userId];

  if (!isOwner) {
    query += ` AND status = 'published' AND visibility IN (${allowedVisibilities.map(() => '?').join(',')})`;
    params.push(...allowedVisibilities);
  }

  query += ' ORDER BY is_default DESC, sort_order ASC, created_at ASC';

  const worlds = db.prepare(query).all(...params) as any[];

  // Augment with entry count and section count
  const augmented = worlds.map(w => {
    const sectionCount = db.prepare('SELECT COUNT(*) as c FROM profile_world_sections WHERE world_id = ?').get(w.id) as any;
    const entryCount = db.prepare('SELECT COUNT(*) as c FROM profile_world_entries WHERE world_id = ?').get(w.id) as any;
    return {
      ...w,
      theme_config: w.theme_config ? (typeof w.theme_config === 'string' ? JSON.parse(w.theme_config) : w.theme_config) : null,
      section_count: sectionCount?.c || 0,
      entry_count: entryCount?.c || 0
    };
  });

  res.json({
    success: true,
    worlds: augmented,
    isOwner
  });
});

// 2. Get Details of a Specific Profile World (Sections, Entries, Relations)
app.get('/api/v1/worlds/:worldId', (req, res) => {
  const { worldId } = req.params;
  const viewerId = (req.query.viewerId as string) || 'usr_me';

  const world = db.prepare('SELECT * FROM profile_worlds WHERE id = ?').get(worldId) as any;
  if (!world) {
    return res.status(404).json({ error: 'Profile world not found' });
  }

  if (checkUserBlocked(viewerId, world.user_id)) {
    return res.status(403).json({ error: 'Access denied' });
  }

  const isOwner = viewerId === world.user_id;
  const allowedVisibilities = getAllowedVisibilities(viewerId, world.user_id);

  if (!isOwner) {
    if (world.status !== 'published' || !allowedVisibilities.includes(world.visibility)) {
      return res.status(403).json({
        error: 'This profile world is private or restricted to this audience',
        isRestricted: true,
        requiredVisibility: world.visibility
      });
    }
  }

  // Fetch sections
  let secQuery = 'SELECT * FROM profile_world_sections WHERE world_id = ?';
  const secParams: any[] = [worldId];
  if (!isOwner) {
    secQuery += ` AND visibility IN (${allowedVisibilities.map(() => '?').join(',')})`;
    secParams.push(...allowedVisibilities);
  }
  secQuery += ' ORDER BY sort_order ASC, created_at ASC';
  const sections = db.prepare(secQuery).all(...secParams) as any[];

  // Fetch entries
  let entQuery = 'SELECT * FROM profile_world_entries WHERE world_id = ?';
  const entParams: any[] = [worldId];
  if (!isOwner) {
    entQuery += ` AND status = 'published' AND visibility IN (${allowedVisibilities.map(() => '?').join(',')})`;
    entParams.push(...allowedVisibilities);
  }
  entQuery += ' ORDER BY sort_order ASC, created_at ASC';
  const entries = db.prepare(entQuery).all(...entParams) as any[];

  // Fetch linked relations
  const relations = db.prepare(`
    SELECT r.*, e.title as entry_title, e.reality_classification, w.name as target_world_name
    FROM profile_world_entry_relations r
    LEFT JOIN profile_world_entries e ON r.source_entry_id = e.id
    LEFT JOIN profile_worlds w ON r.target_world_id = w.id
    WHERE r.source_world_id = ? OR r.target_world_id = ?
  `).all(worldId, worldId);

  res.json({
    success: true,
    world: {
      ...world,
      theme_config: world.theme_config ? (typeof world.theme_config === 'string' ? JSON.parse(world.theme_config) : world.theme_config) : null
    },
    sections,
    entries: entries.map(e => ({
      ...e,
      structured_content: e.structured_content ? (typeof e.structured_content === 'string' ? JSON.parse(e.structured_content) : e.structured_content) : null
    })),
    relations,
    isOwner
  });
});

// 3. Create a New Profile World
app.post('/api/v1/worlds', (req, res) => {
  const {
    userId = 'usr_me',
    name,
    slug,
    description = '',
    world_type = 'custom',
    cover_image_url = 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80',
    avatar_url = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    theme_config = null,
    layout_type = 'cinematic',
    ambient_sound_url = null,
    visibility = 'public',
    status = 'published',
    is_default = 0,
    template_id = null
  } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'World name is required' });
  }

  const cleanName = name.trim();
  const cleanSlug = (slug && slug.trim()) ? slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-') : `${cleanName.toLowerCase().replace(/[^a-z0-9-]/g, '-')}-${Date.now().toString().slice(-4)}`;
  const worldId = `wld_${uuidv4().slice(0, 8)}`;
  const now = Date.now();

  const maxOrder = db.prepare('SELECT MAX(sort_order) as m FROM profile_worlds WHERE user_id = ?').get(userId) as any;
  const sort_order = (maxOrder?.m || 0) + 1;

  const defaultTheme = theme_config ? (typeof theme_config === 'string' ? theme_config : JSON.stringify(theme_config)) : JSON.stringify({
    theme: 'velvet_wine',
    primaryColor: '#FF0D69',
    ambientGlow: 'rgba(255, 13, 105, 0.25)',
    fontPreset: 'editorial_sans',
    layoutStyle: layout_type
  });

  const tx = db.transaction(() => {
    if (is_default) {
      db.prepare('UPDATE profile_worlds SET is_default = 0 WHERE user_id = ?').run(userId);
    }

    db.prepare(`
      INSERT INTO profile_worlds (
        id, user_id, name, slug, description, world_type, cover_image_url, avatar_url,
        theme_config, layout_type, ambient_sound_url, visibility, status, is_default, sort_order, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      worldId, userId, cleanName, cleanSlug, description.trim(), world_type, cover_image_url, avatar_url,
      defaultTheme, layout_type, ambient_sound_url, visibility, status, is_default ? 1 : 0, sort_order, now, now
    );

    // If template was selected, seed initial sections
    if (template_id === 'cinematic_life') {
      const s1 = `sec_${uuidv4().slice(0, 8)}`;
      db.prepare('INSERT INTO profile_world_sections (id, world_id, title, description, section_type, icon, visibility, sort_order, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
        .run(s1, worldId, 'Main Character Dossier', 'Protagonist traits, signature theme song, and aesthetic', 'character', '🎬', 'public', 1, now, now);
      db.prepare('INSERT INTO profile_world_entries (id, world_id, section_id, user_id, title, content, reality_classification, visibility, status, sort_order, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
        .run(`ent_${uuidv4().slice(0, 8)}`, worldId, s1, userId, 'Character Archetype & Theme Song', 'The solitary wanderer looking for signal in a noisy metropolis.', 'cinematic', 'public', 'published', 1, now, now);
    } else if (template_id === 'future_self') {
      const s1 = `sec_${uuidv4().slice(0, 8)}`;
      db.prepare('INSERT INTO profile_world_sections (id, world_id, title, description, section_type, icon, visibility, sort_order, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
        .run(s1, worldId, 'Ten-Year Vision & Aspirations', 'Planned milestones and desired future reality', 'future_goals', '🚀', 'public', 1, now, now);
      db.prepare('INSERT INTO profile_world_entries (id, world_id, section_id, user_id, title, content, reality_classification, visibility, status, sort_order, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
        .run(`ent_${uuidv4().slice(0, 8)}`, worldId, s1, userId, 'The Sovereign 2030 Vision', 'Designing an independent life with total creative autonomy.', 'aspirational', 'public', 'published', 1, now, now);
    } else {
      // Default initial section
      const s1 = `sec_${uuidv4().slice(0, 8)}`;
      db.prepare('INSERT INTO profile_world_sections (id, world_id, title, description, section_type, icon, visibility, sort_order, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
        .run(s1, worldId, 'Overview & Manifesto', 'Introduction to this dimension of identity', 'overview', '✨', 'public', 1, now, now);
    }
  });

  tx();

  const created = db.prepare('SELECT * FROM profile_worlds WHERE id = ?').get(worldId) as any;
  res.json({
    success: true,
    world: {
      ...created,
      theme_config: created.theme_config ? JSON.parse(created.theme_config) : null
    }
  });
});

// 4. Update Profile World
app.put('/api/v1/worlds/:worldId', (req, res) => {
  const { worldId } = req.params;
  const {
    name,
    slug,
    description,
    world_type,
    cover_image_url,
    avatar_url,
    theme_config,
    layout_type,
    ambient_sound_url,
    visibility,
    status,
    is_default
  } = req.body;

  const existing = db.prepare('SELECT * FROM profile_worlds WHERE id = ?').get(worldId) as any;
  if (!existing) return res.status(404).json({ error: 'World not found' });

  const now = Date.now();

  if (is_default === 1) {
    db.prepare('UPDATE profile_worlds SET is_default = 0 WHERE user_id = ?').run(existing.user_id);
  }

  db.prepare(`
    UPDATE profile_worlds SET
      name = COALESCE(?, name),
      slug = COALESCE(?, slug),
      description = COALESCE(?, description),
      world_type = COALESCE(?, world_type),
      cover_image_url = COALESCE(?, cover_image_url),
      avatar_url = COALESCE(?, avatar_url),
      theme_config = COALESCE(?, theme_config),
      layout_type = COALESCE(?, layout_type),
      ambient_sound_url = COALESCE(?, ambient_sound_url),
      visibility = COALESCE(?, visibility),
      status = COALESCE(?, status),
      is_default = COALESCE(?, is_default),
      updated_at = ?
    WHERE id = ?
  `).run(
    name !== undefined ? name.trim() : null,
    slug !== undefined ? slug.trim() : null,
    description !== undefined ? description.trim() : null,
    world_type !== undefined ? world_type : null,
    cover_image_url !== undefined ? cover_image_url : null,
    avatar_url !== undefined ? avatar_url : null,
    theme_config !== undefined ? (typeof theme_config === 'string' ? theme_config : JSON.stringify(theme_config)) : null,
    layout_type !== undefined ? layout_type : null,
    ambient_sound_url !== undefined ? ambient_sound_url : null,
    visibility !== undefined ? visibility : null,
    status !== undefined ? status : null,
    is_default !== undefined ? (is_default ? 1 : 0) : null,
    now,
    worldId
  );

  const updated = db.prepare('SELECT * FROM profile_worlds WHERE id = ?').get(worldId) as any;
  res.json({
    success: true,
    world: {
      ...updated,
      theme_config: updated.theme_config ? JSON.parse(updated.theme_config) : null
    }
  });
});

// 5. Duplicate a Profile World
app.post('/api/v1/worlds/:worldId/duplicate', (req, res) => {
  const { worldId } = req.params;
  const original = db.prepare('SELECT * FROM profile_worlds WHERE id = ?').get(worldId) as any;
  if (!original) return res.status(404).json({ error: 'Original world not found' });

  const newWorldId = `wld_${uuidv4().slice(0, 8)}`;
  const newName = `${original.name} (Copy)`;
  const newSlug = `${original.slug}-copy-${Date.now().toString().slice(-4)}`;
  const now = Date.now();

  const tx = db.transaction(() => {
    db.prepare(`
      INSERT INTO profile_worlds (
        id, user_id, name, slug, description, world_type, cover_image_url, avatar_url,
        theme_config, layout_type, ambient_sound_url, visibility, status, is_default, sort_order, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      newWorldId, original.user_id, newName, newSlug, original.description, original.world_type,
      original.cover_image_url, original.avatar_url, original.theme_config, original.layout_type,
      original.ambient_sound_url, original.visibility, 'draft', 0, original.sort_order + 1, now, now
    );

    // Duplicate sections and entries
    const sections = db.prepare('SELECT * FROM profile_world_sections WHERE world_id = ?').all(worldId) as any[];
    for (const sec of sections) {
      const newSecId = `sec_${uuidv4().slice(0, 8)}`;
      db.prepare(`
        INSERT INTO profile_world_sections (id, world_id, parent_section_id, title, description, section_type, icon, visibility, sort_order, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(newSecId, newWorldId, null, sec.title, sec.description, sec.section_type, sec.icon, sec.visibility, sec.sort_order, now, now);

      const entries = db.prepare('SELECT * FROM profile_world_entries WHERE section_id = ?').all(sec.id) as any[];
      for (const ent of entries) {
        const newEntId = `ent_${uuidv4().slice(0, 8)}`;
        db.prepare(`
          INSERT INTO profile_world_entries (id, world_id, section_id, user_id, entry_type, title, content, structured_content, reality_classification, visibility, status, sort_order, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          newEntId, newWorldId, newSecId, ent.user_id, ent.entry_type, ent.title, ent.content,
          ent.structured_content, ent.reality_classification, ent.visibility, ent.status, ent.sort_order, now, now
        );
      }
    }
  });

  tx();

  const duplicated = db.prepare('SELECT * FROM profile_worlds WHERE id = ?').get(newWorldId) as any;
  res.json({
    success: true,
    world: {
      ...duplicated,
      theme_config: duplicated.theme_config ? JSON.parse(duplicated.theme_config) : null
    }
  });
});

// 6. Delete Profile World
app.delete('/api/v1/worlds/:worldId', (req, res) => {
  const { worldId } = req.params;
  db.prepare('DELETE FROM profile_worlds WHERE id = ?').run(worldId);
  res.json({ success: true, deletedId: worldId });
});

// 7. Sections CRUD
app.post('/api/v1/worlds/:worldId/sections', (req, res) => {
  const { worldId } = req.params;
  const { title, description = '', section_type = 'general', icon = '✨', visibility = 'public' } = req.body;
  if (!title || !title.trim()) return res.status(400).json({ error: 'Section title is required' });

  const id = `sec_${uuidv4().slice(0, 8)}`;
  const now = Date.now();
  const maxOrder = db.prepare('SELECT MAX(sort_order) as m FROM profile_world_sections WHERE world_id = ?').get(worldId) as any;
  const sort_order = (maxOrder?.m || 0) + 1;

  db.prepare(`
    INSERT INTO profile_world_sections (id, world_id, parent_section_id, title, description, section_type, icon, visibility, sort_order, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, worldId, null, title.trim(), description.trim(), section_type, icon, visibility, sort_order, now, now);

  const section = db.prepare('SELECT * FROM profile_world_sections WHERE id = ?').get(id);
  res.json({ success: true, section });
});

app.delete('/api/v1/worlds/sections/:sectionId', (req, res) => {
  const { sectionId } = req.params;
  db.prepare('DELETE FROM profile_world_sections WHERE id = ?').run(sectionId);
  res.json({ success: true, deletedId: sectionId });
});

// 8. Entries CRUD (with strict 5,000 char limit & reality classification)
app.post('/api/v1/worlds/:worldId/entries', (req, res) => {
  const { worldId } = req.params;
  const {
    sectionId,
    userId = 'usr_me',
    entry_type = 'text',
    title = '',
    content,
    structured_content = null,
    reality_classification = 'actual',
    visibility = 'public',
    status = 'published'
  } = req.body;

  if (!sectionId || !content || !content.trim()) {
    return res.status(400).json({ error: 'sectionId and content are required' });
  }

  // Strict 5,000 character limit enforcement
  if (content.length > 5000) {
    return res.status(400).json({
      error: 'Content exceeds the maximum limit of 5,000 characters.',
      characterCount: content.length,
      maxLimit: 5000
    });
  }

  const validClassifications = [
    'actual', 'historical', 'current', 'planned', 'aspirational', 'hypothetical',
    'imaginary', 'fictional', 'cinematic', 'dream', 'roleplay', 'alternate_reality', 'uncertain'
  ];
  const safeClassification = validClassifications.includes(reality_classification) ? reality_classification : 'actual';

  const id = `ent_${uuidv4().slice(0, 8)}`;
  const now = Date.now();
  const maxOrder = db.prepare('SELECT MAX(sort_order) as m FROM profile_world_entries WHERE section_id = ?').get(sectionId) as any;
  const sort_order = (maxOrder?.m || 0) + 1;

  db.prepare(`
    INSERT INTO profile_world_entries (
      id, world_id, section_id, user_id, entry_type, title, content, structured_content,
      reality_classification, visibility, status, sort_order, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id, worldId, sectionId, userId, entry_type, title.trim(), content.trim(),
    structured_content ? (typeof structured_content === 'string' ? structured_content : JSON.stringify(structured_content)) : null,
    safeClassification, visibility, status, sort_order, now, now
  );

  const entry = db.prepare('SELECT * FROM profile_world_entries WHERE id = ?').get(id) as any;
  res.json({
    success: true,
    entry: {
      ...entry,
      structured_content: entry.structured_content ? JSON.parse(entry.structured_content) : null
    }
  });
});

app.delete('/api/v1/worlds/entries/:entryId', (req, res) => {
  const { entryId } = req.params;
  db.prepare('DELETE FROM profile_world_entries WHERE id = ?').run(entryId);
  res.json({ success: true, deletedId: entryId });
});

// 9. Cross-World Entry Referencing
app.post('/api/v1/worlds/entries/reference', (req, res) => {
  const { sourceWorldId, sourceEntryId, targetWorldId, relationType = 'reference' } = req.body;
  if (!sourceWorldId || !sourceEntryId || !targetWorldId) {
    return res.status(400).json({ error: 'sourceWorldId, sourceEntryId, and targetWorldId are required' });
  }

  const id = `rel_${uuidv4().slice(0, 8)}`;
  db.prepare(`
    INSERT INTO profile_world_entry_relations (id, source_world_id, source_entry_id, target_world_id, relation_type, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(id, sourceWorldId, sourceEntryId, targetWorldId, relationType, Date.now());

  res.json({ success: true, relationId: id });
});

// ============================================================================
// DAILY RELATIONSHIP & HUMAN CONNECTION INTELLIGENCE SYSTEM ENDPOINTS
// ============================================================================

// 1. Get All Categories
app.get('/api/v1/daily-content/categories', (req, res) => {
  const categories = db.prepare('SELECT * FROM daily_content_categories ORDER BY tab ASC, name ASC').all();
  res.json({ success: true, categories });
});

// 2. Get Member Personalization Preferences & Streak
app.get('/api/v1/daily-content/preferences', (req, res) => {
  const userId = (req.query.userId as string) || 'usr_me';
  let prefs = db.prepare('SELECT * FROM daily_member_preferences WHERE member_id = ?').get(userId) as any;
  if (!prefs) {
    const now = Date.now();
    db.prepare(`
      INSERT OR IGNORE INTO daily_member_preferences (
        member_id, edition_preference, relationship_status, dating_intentions,
        friendship_track, delivery_time, timezone, love_notifications,
        friendship_notifications, growth_notifications, quiet_hours_enabled, updated_at
      ) VALUES (?, 'universal', 'single', 'meaningful_connection', 'making_new_friends', '08:00', 'Asia/Colombo', 1, 1, 1, 1, ?)
    `).run(userId, now);
    prefs = db.prepare('SELECT * FROM daily_member_preferences WHERE member_id = ?').get(userId);
  }

  const streak = db.prepare('SELECT * FROM daily_member_streaks WHERE member_id = ?').get(userId) || {
    current_streak: 1,
    longest_streak: 1,
    total_reflections: 0,
    total_challenges_done: 0
  };

  res.json({ success: true, preferences: prefs, streak });
});

// 3. Update Member Personalization Preferences
app.put('/api/v1/daily-content/preferences', (req, res) => {
  const {
    userId = 'usr_me',
    editionPreference = 'universal',
    relationshipStatus = 'single',
    datingIntentions = 'meaningful_connection',
    friendshipTrack = 'making_new_friends',
    deliveryTime = '08:00',
    timezone = 'Asia/Colombo',
    loveNotifications = 1,
    friendshipNotifications = 1,
    growthNotifications = 1,
    quietHoursEnabled = 1
  } = req.body;

  const now = Date.now();
  db.prepare(`
    INSERT INTO daily_member_preferences (
      member_id, edition_preference, relationship_status, dating_intentions,
      friendship_track, delivery_time, timezone, love_notifications,
      friendship_notifications, growth_notifications, quiet_hours_enabled, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(member_id) DO UPDATE SET
      edition_preference = excluded.edition_preference,
      relationship_status = excluded.relationship_status,
      dating_intentions = excluded.dating_intentions,
      friendship_track = excluded.friendship_track,
      delivery_time = excluded.delivery_time,
      timezone = excluded.timezone,
      love_notifications = excluded.love_notifications,
      friendship_notifications = excluded.friendship_notifications,
      growth_notifications = excluded.growth_notifications,
      quiet_hours_enabled = excluded.quiet_hours_enabled,
      updated_at = excluded.updated_at
  `).run(
    userId, editionPreference, relationshipStatus, datingIntentions,
    friendshipTrack, deliveryTime, timezone, loveNotifications ? 1 : 0,
    friendshipNotifications ? 1 : 0, growthNotifications ? 1 : 0,
    quietHoursEnabled ? 1 : 0, now
  );

  res.json({ success: true, updated: true });
});

// 4. Retrieve Today's Deterministic Assigned Content (4 Permanent Tabs: Love, Friendship, Mind, Growth)
app.get('/api/v1/daily-content/today', (req, res) => {
  const userId = (req.query.userId as string) || 'usr_me';
  const localDate = (req.query.date as string) || new Date().toISOString().split('T')[0];
  const requestedTab = req.query.tab as string | undefined;

  // Retrieve user preferences
  const prefs = db.prepare('SELECT * FROM daily_member_preferences WHERE member_id = ?').get(userId) as any || {
    edition_preference: 'universal',
    relationship_status: 'single',
    friendship_track: 'making_new_friends'
  };

  const tabs: ('love' | 'friendship' | 'mind' | 'growth')[] = requestedTab 
    ? [requestedTab as any] 
    : ['love', 'friendship', 'mind', 'growth'];

  const results: Record<string, any> = {};

  for (const tab of tabs) {
    // 1. Check if assignment exists for this (member, date, tab)
    let assignment = db.prepare(`
      SELECT a.*, c.title, c.quote_one_liner, c.body_insight, c.reflection_question,
             c.action_exercise, c.format_type, c.cover_image_url, c.author_or_source,
             c.likes_count, c.saves_count, cat.name as category_name, cat.icon as category_icon,
             cat.ambient_color
      FROM daily_member_assignments a
      JOIN daily_content c ON a.content_id = c.id
      JOIN daily_content_categories cat ON c.category_id = cat.id
      WHERE a.member_id = ? AND a.local_date = ? AND a.tab = ?
    `).get(userId, localDate, tab) as any;

    if (!assignment) {
      // 2. Select optimal content for this tab matching user profile
      const candidates = db.prepare(`
        SELECT c.*, cat.name as category_name, cat.icon as category_icon, cat.ambient_color
        FROM daily_content c
        JOIN daily_content_categories cat ON c.category_id = cat.id
        WHERE c.tab = ?
      `).all(tab) as any[];

      if (candidates.length > 0) {
        // Exclude content recently assigned to member in the last 14 days
        const recentAssignments = db.prepare(`
          SELECT content_id FROM daily_member_assignments
          WHERE member_id = ? AND tab = ? AND local_date != ?
          ORDER BY assigned_at DESC LIMIT 14
        `).all(userId, tab, localDate) as { content_id: string }[];
        const recentIds = new Set(recentAssignments.map(r => r.content_id));

        const eligible = candidates.filter(c => !recentIds.has(c.id));
        const pool = eligible.length > 0 ? eligible : candidates;

        // Score based on preferences:
        let bestCandidate = pool[0];
        let bestScore = -1;

        for (const cand of pool) {
          let score = 0;
          const genderAudience = JSON.parse(cand.gender_audience || '["all"]');
          const relStatuses = JSON.parse(cand.relationship_statuses || '["all"]');
          const friendTracks = JSON.parse(cand.friendship_tracks || '["all"]');

          // Gender edition matching
          if (prefs.edition_preference !== 'universal') {
            if (genderAudience.includes(prefs.edition_preference)) score += 5;
          } else {
            if (genderAudience.includes('all')) score += 3;
          }

          // Relationship situation matching
          if (relStatuses.includes(prefs.relationship_status) || relStatuses.includes('all')) {
            score += 4;
          }

          // Friendship track matching
          if (friendTracks.includes(prefs.friendship_track) || friendTracks.includes('all')) {
            score += 3;
          }

          if (score > bestScore) {
            bestScore = score;
            bestCandidate = cand;
          }
        }

        const assignId = `asg_${uuidv4().slice(0, 8)}`;
        const now = Date.now();

        db.prepare(`
          INSERT OR IGNORE INTO daily_member_assignments (
            id, member_id, local_date, tab, content_id, is_read, assigned_at
          ) VALUES (?, ?, ?, ?, ?, 1, ?)
        `).run(assignId, userId, localDate, tab, bestCandidate.id, now);

        assignment = {
          id: assignId,
          member_id: userId,
          local_date: localDate,
          tab,
          content_id: bestCandidate.id,
          is_read: 1,
          reflection_answer: null,
          challenge_completed: 0,
          assigned_at: now,
          title: bestCandidate.title,
          quote_one_liner: bestCandidate.quote_one_liner,
          body_insight: bestCandidate.body_insight,
          reflection_question: bestCandidate.reflection_question,
          action_exercise: bestCandidate.action_exercise,
          format_type: bestCandidate.format_type,
          cover_image_url: bestCandidate.cover_image_url,
          author_or_source: bestCandidate.author_or_source,
          likes_count: bestCandidate.likes_count,
          saves_count: bestCandidate.saves_count,
          category_name: bestCandidate.category_name,
          category_icon: bestCandidate.category_icon,
          ambient_color: bestCandidate.ambient_color
        };
      }
    }

    // Check if user has liked or saved this content
    if (assignment) {
      const feedback = db.prepare(`
        SELECT action FROM daily_content_feedback WHERE member_id = ? AND content_id = ?
      `).all(userId, assignment.content_id) as { action: string }[];
      const userActions = new Set(feedback.map(f => f.action));

      results[tab] = {
        ...assignment,
        is_liked: userActions.has('like'),
        is_saved: userActions.has('save')
      };
    }
  }

  // Update Member Streak for active day
  const streak = db.prepare('SELECT * FROM daily_member_streaks WHERE member_id = ?').get(userId) as any;
  if (streak) {
    if (streak.last_active_date !== localDate) {
      const newStreak = streak.current_streak + 1;
      const longest = Math.max(newStreak, streak.longest_streak);
      db.prepare(`
        UPDATE daily_member_streaks
        SET current_streak = ?, longest_streak = ?, last_active_date = ?
        WHERE member_id = ?
      `).run(newStreak, longest, localDate, userId);
    }
  } else {
    db.prepare(`
      INSERT INTO daily_member_streaks (member_id, current_streak, longest_streak, last_active_date)
      VALUES (?, 1, 1, ?)
    `).run(userId, localDate);
  }

  const updatedStreak = db.prepare('SELECT * FROM daily_member_streaks WHERE member_id = ?').get(userId);

  res.json({
    success: true,
    date: localDate,
    preferences: prefs,
    streak: updatedStreak,
    editions: results
  });
});

// 5. Submit Reflection to Daily Question
app.post('/api/v1/daily-content/reflect', (req, res) => {
  const { userId = 'usr_me', assignmentId, reflectionAnswer } = req.body;
  if (!assignmentId || !reflectionAnswer || !reflectionAnswer.trim()) {
    return res.status(400).json({ error: 'assignmentId and reflectionAnswer are required' });
  }

  const assignment = db.prepare('SELECT * FROM daily_member_assignments WHERE id = ?').get(assignmentId) as any;
  if (!assignment) {
    return res.status(404).json({ error: 'Assignment not found' });
  }

  db.prepare(`
    UPDATE daily_member_assignments
    SET reflection_answer = ?
    WHERE id = ?
  `).run(reflectionAnswer.trim(), assignmentId);

  // Record feedback note
  const fid = `fb_${uuidv4().slice(0, 8)}`;
  db.prepare(`
    INSERT INTO daily_content_feedback (id, member_id, content_id, action, note, created_at)
    VALUES (?, ?, ?, 'reflect', ?, ?)
  `).run(fid, userId, assignment.content_id, reflectionAnswer.trim(), Date.now());

  // Increment total reflections in streak
  db.prepare(`
    UPDATE daily_member_streaks
    SET total_reflections = total_reflections + 1
    WHERE member_id = ?
  `).run(userId);

  res.json({ success: true, updated: true });
});

// 6. Complete Daily Action Exercise / Challenge
app.post('/api/v1/daily-content/challenge', (req, res) => {
  const { userId = 'usr_me', assignmentId, completed = true } = req.body;
  if (!assignmentId) {
    return res.status(400).json({ error: 'assignmentId is required' });
  }

  const assignment = db.prepare('SELECT * FROM daily_member_assignments WHERE id = ?').get(assignmentId) as any;
  if (!assignment) {
    return res.status(404).json({ error: 'Assignment not found' });
  }

  db.prepare(`
    UPDATE daily_member_assignments
    SET challenge_completed = ?
    WHERE id = ?
  `).run(completed ? 1 : 0, assignmentId);

  if (completed) {
    const fid = `fb_${uuidv4().slice(0, 8)}`;
    db.prepare(`
      INSERT INTO daily_content_feedback (id, member_id, content_id, action, created_at)
      VALUES (?, ?, ?, 'challenge_done', ?)
    `).run(fid, userId, assignment.content_id, Date.now());

    db.prepare(`
      UPDATE daily_member_streaks
      SET total_challenges_done = total_challenges_done + 1
      WHERE member_id = ?
    `).run(userId);
  }

  res.json({ success: true, completed });
});

// 7. Like / Save / Bookmark Daily Content
app.post('/api/v1/daily-content/feedback', (req, res) => {
  const { userId = 'usr_me', contentId, action } = req.body;
  if (!contentId || !['like', 'save'].includes(action)) {
    return res.status(400).json({ error: 'Valid contentId and action (like | save) required' });
  }

  const existing = db.prepare(`
    SELECT id FROM daily_content_feedback WHERE member_id = ? AND content_id = ? AND action = ?
  `).get(userId, contentId, action) as any;

  if (existing) {
    // Toggle off
    db.prepare('DELETE FROM daily_content_feedback WHERE id = ?').run(existing.id);
    if (action === 'like') {
      db.prepare('UPDATE daily_content SET likes_count = MAX(0, likes_count - 1) WHERE id = ?').run(contentId);
    } else if (action === 'save') {
      db.prepare('UPDATE daily_content SET saves_count = MAX(0, saves_count - 1) WHERE id = ?').run(contentId);
    }
    return res.json({ success: true, active: false });
  }

  const fid = `fb_${uuidv4().slice(0, 8)}`;
  db.prepare(`
    INSERT INTO daily_content_feedback (id, member_id, content_id, action, created_at)
    VALUES (?, ?, ?, ?, ?)
  `).run(fid, userId, contentId, action, Date.now());

  if (action === 'like') {
    db.prepare('UPDATE daily_content SET likes_count = likes_count + 1 WHERE id = ?').run(contentId);
  } else if (action === 'save') {
    db.prepare('UPDATE daily_content SET saves_count = saves_count + 1 WHERE id = ?').run(contentId);
  }

  res.json({ success: true, active: true });
});

// 8. Retrieve Saved Daily Content Archive
app.get('/api/v1/daily-content/saved', (req, res) => {
  const userId = (req.query.userId as string) || 'usr_me';
  const saved = db.prepare(`
    SELECT c.*, cat.name as category_name, cat.icon as category_icon, cat.ambient_color,
           fb.created_at as saved_at
    FROM daily_content_feedback fb
    JOIN daily_content c ON fb.content_id = c.id
    JOIN daily_content_categories cat ON c.category_id = cat.id
    WHERE fb.member_id = ? AND fb.action = 'save'
    ORDER BY fb.created_at DESC
  `).all(userId);

  res.json({ success: true, items: saved });
});

// 9. Retrieve Past Daily Editions & Reflection Journal
app.get('/api/v1/daily-content/history', (req, res) => {
  const userId = (req.query.userId as string) || 'usr_me';
  const history = db.prepare(`
    SELECT a.*, c.title, c.quote_one_liner, c.body_insight, c.reflection_question,
           c.action_exercise, c.format_type, c.cover_image_url, cat.name as category_name,
           cat.icon as category_icon, cat.ambient_color
    FROM daily_member_assignments a
    JOIN daily_content c ON a.content_id = c.id
    JOIN daily_content_categories cat ON c.category_id = cat.id
    WHERE a.member_id = ?
    ORDER BY a.local_date DESC, a.assigned_at DESC
    LIMIT 30
  `).all(userId);

  res.json({ success: true, history });
});

// 10. Admin Content Management: Add New Curated Wisdom
app.post('/api/v1/daily-content/admin/create', (req, res) => {
  const {
    tab,
    categoryId,
    formatType = 'quote',
    title,
    quoteOneLiner,
    bodyInsight,
    reflectionQuestion = null,
    actionExercise = null,
    genderAudience = ['all'],
    relationshipStatuses = ['all'],
    friendshipTracks = ['all'],
    personalityTags = [],
    coverImageUrl = null,
    authorOrSource = 'Soulverse Curated Library'
  } = req.body;

  if (!tab || !categoryId || !title || !quoteOneLiner || !bodyInsight) {
    return res.status(400).json({ error: 'tab, categoryId, title, quoteOneLiner, and bodyInsight are required' });
  }

  const id = `cnt_${uuidv4().slice(0, 8)}`;
  const now = Date.now();

  db.prepare(`
    INSERT INTO daily_content (
      id, tab, category_id, format_type, title, quote_one_liner, body_insight,
      reflection_question, action_exercise, gender_audience, relationship_statuses,
      friendship_tracks, personality_tags, cover_image_url, author_or_source,
      source_type, review_status, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'curated', 'approved', ?)
  `).run(
    id, tab, categoryId, formatType, title.trim(), quoteOneLiner.trim(),
    bodyInsight.trim(), reflectionQuestion, actionExercise,
    JSON.stringify(genderAudience), JSON.stringify(relationshipStatuses),
    JSON.stringify(friendshipTracks), JSON.stringify(personalityTags),
    coverImageUrl, authorOrSource, now
  );

  res.json({ success: true, contentId: id });
});

// ============================================================================
// SOULVERSE PRODUCT EXPANSION: IDENTITY UNIVERSE & MULTIPLE PERSONAS
// ============================================================================

// ============================================================================
// MULTIDIMENSIONAL HUMAN IDENTITY & PROFILE SYSTEM (12 DIMENSIONS + CUSTOM)
// ============================================================================

export type IdentityTypeKey =
  | 'real'
  | 'personal'
  | 'social'
  | 'professional'
  | 'inner'
  | 'imaginary'
  | 'cinematic'
  | 'aspirational'
  | 'historical'
  | 'alternative_life'
  | 'creative'
  | 'relational'
  | 'custom';

function mapClassificationToType(classification?: string): IdentityTypeKey {
  switch (classification) {
    case 'real_identity': return 'real';
    case 'fictional_character': return 'imaginary';
    case 'inspired_character': return 'creative';
    case 'alternate_self': return 'alternative_life';
    case 'aspirational_self': return 'aspirational';
    case 'historical_persona': return 'historical';
    case 'cinematic_persona': return 'cinematic';
    case 'anonymous_identity': return 'inner';
    default: return 'personal';
  }
}

function mapTypeToClassification(type?: string): string {
  switch (type) {
    case 'real': return 'real_identity';
    case 'imaginary': return 'fictional_character';
    case 'creative': return 'inspired_character';
    case 'alternative_life': return 'alternate_self';
    case 'aspirational': return 'aspirational_self';
    case 'historical': return 'historical_persona';
    case 'cinematic': return 'cinematic_persona';
    case 'inner': return 'anonymous_identity';
    default: return 'custom';
  }
}

function parseTimelineDateInput(
  yearInput: string | number,
  _dateNature: string = 'personal',
  customEra?: string,
  explicitDisplayDate?: string
): { numericYear: number; eraLabel: string; displayDate: string } {
  const str = String(yearInput).trim();
  let numericYear = 2026;
  let eraLabel = customEra || 'CE';
  let displayDate = explicitDisplayDate || str;

  if (str.startsWith('-')) {
    const val = parseInt(str.slice(1), 10) || 0;
    numericYear = -val;
    eraLabel = 'BCE';
    if (!explicitDisplayDate) displayDate = `${val} BCE`;
  } else if (/bce|bc/i.test(str)) {
    const val = parseInt(str.replace(/[^0-9]/g, ''), 10) || 0;
    numericYear = -val;
    eraLabel = 'BCE';
    if (!explicitDisplayDate) displayDate = `${val} BCE`;
  } else if (str === '0') {
    numericYear = 0;
    eraLabel = 'CE';
    if (!explicitDisplayDate) displayDate = 'Year 0 (Astronomical)';
  } else {
    const parsed = parseInt(str, 10);
    if (!isNaN(parsed)) {
      numericYear = parsed;
      eraLabel = customEra || (parsed < 0 ? 'BCE' : 'CE');
      if (!explicitDisplayDate) {
        displayDate = parsed < 0 ? `${Math.abs(parsed)} BCE` : (parsed > 2100 ? `Year ${parsed} CE (Future)` : `${parsed} CE`);
      }
    }
  }

  return { numericYear, eraLabel, displayDate };
}

function formatIdentityRecord(id: any) {
  return {
    ...id,
    identity_type: id.identity_type || mapClassificationToType(id.classification),
    characteristics: id.characteristics ? JSON.parse(id.characteristics) : [],
    tags: id.tags ? JSON.parse(id.tags) : [],
    personality_traits: id.personality_traits ? JSON.parse(id.personality_traits) : [],
    interests: id.interests ? JSON.parse(id.interests) : [],
    skills: id.skills ? JSON.parse(id.skills) : [],
    experiences: id.experiences ? JSON.parse(id.experiences) : [],
    achievements: id.achievements ? JSON.parse(id.achievements) : [],
    memories: id.memories ? JSON.parse(id.memories) : [],
    media_attachments: id.media_attachments ? JSON.parse(id.media_attachments) : [],
    custom_sections: id.custom_sections ? JSON.parse(id.custom_sections) : [],
    visual_theme: id.visual_theme ? JSON.parse(id.visual_theme) : (id.theme_config ? JSON.parse(id.theme_config) : null),
    theme_config: id.theme_config ? JSON.parse(id.theme_config) : null
  };
}

// 1. List User Identities with Strict Server-Side Visibility Enforcement
const handleListIdentities = (req: any, res: any) => {
  const userId = req.params.userId || (req.query.userId as string) || 'usr_me';
  const viewerId = (req.headers['x-user-id'] as string) || (req.query.viewerId as string) || 'usr_me';
  const isOwner = viewerId === userId;

  let query = 'SELECT * FROM user_identities WHERE user_id = ?';
  const params: any[] = [userId];

  if (!isOwner) {
    const rels = db.prepare('SELECT relationship_type FROM user_relationships WHERE user_id = ? AND target_user_id = ?').all(viewerId, userId) as Array<{ relationship_type: string }>;
    const relTypes = rels.map(r => r.relationship_type);
    const isFriend = relTypes.includes('friend');
    const isMatch = relTypes.includes('match');

    if (isFriend && isMatch) {
      query += " AND status = 'published' AND visibility IN ('public', 'friends_only', 'connections_only', 'friends', 'matches')";
    } else if (isFriend) {
      query += " AND status = 'published' AND visibility IN ('public', 'friends_only', 'friends')";
    } else if (isMatch) {
      query += " AND status = 'published' AND visibility IN ('public', 'connections_only', 'matches')";
    } else {
      query += " AND status = 'published' AND visibility = 'public'";
    }
  }

  query += ' ORDER BY is_primary DESC, created_at ASC';
  const identities = db.prepare(query).all(...params) as any[];

  res.json({ success: true, identities: identities.map(formatIdentityRecord), isOwner });
};

app.get('/api/v1/identities/user/:userId', handleListIdentities);
app.get('/api/v1/identities', handleListIdentities);

// 2. Get Single Identity with Server-Side Visibility Checks
app.get('/api/v1/identities/:identityId', (req, res) => {
  const { identityId } = req.params;
  const viewerId = (req.headers['x-user-id'] as string) || (req.query.viewerId as string) || 'usr_me';

  const identity = db.prepare('SELECT * FROM user_identities WHERE id = ?').get(identityId) as any;
  if (!identity) {
    return res.status(404).json({ error: 'Identity not found' });
  }

  const isOwner = identity.user_id === viewerId;
  if (!isOwner) {
    if (identity.visibility === 'private') {
      return res.status(403).json({ error: 'Access denied to private identity' });
    }
    const rels = db.prepare('SELECT relationship_type FROM user_relationships WHERE user_id = ? AND target_user_id = ?').all(viewerId, identity.user_id) as Array<{ relationship_type: string }>;
    const relTypes = rels.map(r => r.relationship_type);
    const isFriend = relTypes.includes('friend');
    const isMatch = relTypes.includes('match');

    if (identity.visibility === 'friends_only' && !isFriend) {
      return res.status(403).json({ error: 'Access denied: friends only' });
    }
    if (identity.visibility === 'connections_only' && !isMatch) {
      return res.status(403).json({ error: 'Access denied: connections only' });
    }
  }

  // Fetch linked custom sections with visibility filtering
  let sectionsQuery = 'SELECT * FROM identity_custom_sections WHERE identity_id = ?';
  const secParams: any[] = [identityId];
  if (!isOwner) {
    sectionsQuery += " AND visibility = 'public'";
  }
  sectionsQuery += ' ORDER BY sort_order ASC, created_at ASC';
  const customSections = db.prepare(sectionsQuery).all(...secParams);

  // Fetch linked timeline events with visibility filtering
  let timelineQuery = 'SELECT * FROM identity_timeline_events WHERE identity_id = ?';
  const timeParams: any[] = [identityId];
  if (!isOwner) {
    timelineQuery += " AND visibility = 'public'";
  }
  timelineQuery += ' ORDER BY numeric_year ASC, sort_order ASC, created_at ASC';
  const timelineEvents = db.prepare(timelineQuery).all(...timeParams);

  const formatted = formatIdentityRecord(identity);
  res.json({
    success: true,
    identity: {
      ...formatted,
      custom_sections: customSections.length > 0 ? customSections : formatted.custom_sections,
      timeline_events: timelineEvents
    },
    isOwner
  });
});

// 3. Create Identity
app.post('/api/v1/identities', (req, res) => {
  const {
    userId = 'usr_me',
    name,
    identityType,
    displayTitle = '',
    classification,
    avatarUrl = null,
    coverImageUrl = null,
    description = '',
    biography = '',
    characteristics = [],
    tags = [],
    personalityTraits = [],
    interests = [],
    skills = [],
    experiences = [],
    achievements = [],
    memories = [],
    mediaAttachments = [],
    customSections = [],
    visualTheme = null,
    universeId = null,
    layout = 'standard',
    themeConfig = null,
    isPrimary = 0,
    visibility = 'public',
    status = 'published'
  } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Identity name is required' });
  }

  const effectiveType = identityType || mapClassificationToType(classification);
  const effectiveClassification = classification || mapTypeToClassification(effectiveType);
  const id = `id_${uuidv4().slice(0, 8)}`;
  const now = Date.now();

  if (isPrimary) {
    db.prepare('UPDATE user_identities SET is_primary = 0 WHERE user_id = ?').run(userId);
  }

  const effVisualTheme = visualTheme || themeConfig || {};

  db.prepare(`
    INSERT INTO user_identities (
      id, user_id, name, identity_type, display_title, classification, avatar_url, cover_image_url,
      description, biography, characteristics, tags, personality_traits, interests, skills,
      experiences, achievements, memories, media_attachments, custom_sections, visual_theme,
      universe_id, layout, theme_config, is_primary, visibility, status, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id, userId, name.trim(), effectiveType, displayTitle.trim(), effectiveClassification,
    avatarUrl, coverImageUrl, description.trim(), biography.trim(),
    JSON.stringify(characteristics), JSON.stringify(tags), JSON.stringify(personalityTraits),
    JSON.stringify(interests), JSON.stringify(skills), JSON.stringify(experiences),
    JSON.stringify(achievements), JSON.stringify(memories), JSON.stringify(mediaAttachments),
    JSON.stringify(customSections), JSON.stringify(effVisualTheme),
    universeId, layout, JSON.stringify(effVisualTheme), isPrimary ? 1 : 0,
    visibility, status, now, now
  );

  const created = db.prepare('SELECT * FROM user_identities WHERE id = ?').get(id) as any;
  res.json({
    success: true,
    identity: formatIdentityRecord(created)
  });
});

// 4. Update Identity (Ownership checked)
app.put('/api/v1/identities/:identityId', (req, res) => {
  const { identityId } = req.params;
  const userId = req.body.userId || 'usr_me';

  const existing = db.prepare('SELECT * FROM user_identities WHERE id = ?').get(identityId) as any;
  if (!existing) return res.status(404).json({ error: 'Identity not found' });
  if (existing.user_id !== userId) return res.status(403).json({ error: 'Ownership required' });

  const {
    name = existing.name,
    identityType = existing.identity_type,
    displayTitle = existing.display_title,
    classification = existing.classification,
    avatarUrl = existing.avatar_url,
    coverImageUrl = existing.cover_image_url,
    description = existing.description,
    biography = existing.biography,
    characteristics = existing.characteristics ? JSON.parse(existing.characteristics) : [],
    tags = existing.tags ? JSON.parse(existing.tags) : [],
    personalityTraits = existing.personality_traits ? JSON.parse(existing.personality_traits) : [],
    interests = existing.interests ? JSON.parse(existing.interests) : [],
    skills = existing.skills ? JSON.parse(existing.skills) : [],
    experiences = existing.experiences ? JSON.parse(existing.experiences) : [],
    achievements = existing.achievements ? JSON.parse(existing.achievements) : [],
    memories = existing.memories ? JSON.parse(existing.memories) : [],
    mediaAttachments = existing.media_attachments ? JSON.parse(existing.media_attachments) : [],
    customSections = existing.custom_sections ? JSON.parse(existing.custom_sections) : [],
    visualTheme = existing.visual_theme ? JSON.parse(existing.visual_theme) : null,
    universeId = existing.universe_id,
    layout = existing.layout,
    themeConfig = existing.theme_config ? JSON.parse(existing.theme_config) : null,
    isPrimary = existing.is_primary,
    visibility = existing.visibility,
    status = existing.status
  } = req.body;

  const now = Date.now();

  if (isPrimary && !existing.is_primary) {
    db.prepare('UPDATE user_identities SET is_primary = 0 WHERE user_id = ?').run(userId);
  }

  const effectiveType = identityType || existing.identity_type || mapClassificationToType(classification);
  const effectiveClassification = classification || existing.classification || mapTypeToClassification(effectiveType);
  const effVisualTheme = visualTheme || themeConfig || (existing.visual_theme ? JSON.parse(existing.visual_theme) : {});

  db.prepare(`
    UPDATE user_identities SET
      name = ?, identity_type = ?, display_title = ?, classification = ?, avatar_url = ?, cover_image_url = ?,
      description = ?, biography = ?, characteristics = ?, tags = ?, personality_traits = ?, interests = ?,
      skills = ?, experiences = ?, achievements = ?, memories = ?, media_attachments = ?, custom_sections = ?,
      visual_theme = ?, universe_id = ?, layout = ?, theme_config = ?, is_primary = ?, visibility = ?,
      status = ?, updated_at = ?
    WHERE id = ?
  `).run(
    name.trim(), effectiveType, displayTitle.trim(), effectiveClassification, avatarUrl, coverImageUrl,
    description.trim(), biography.trim(), JSON.stringify(characteristics), JSON.stringify(tags),
    JSON.stringify(personalityTraits), JSON.stringify(interests), JSON.stringify(skills),
    JSON.stringify(experiences), JSON.stringify(achievements), JSON.stringify(memories),
    JSON.stringify(mediaAttachments), JSON.stringify(customSections), JSON.stringify(effVisualTheme),
    universeId, layout, JSON.stringify(effVisualTheme), isPrimary ? 1 : 0,
    visibility, status, now, identityId
  );

  const updated = db.prepare('SELECT * FROM user_identities WHERE id = ?').get(identityId) as any;
  res.json({ success: true, message: 'Identity updated', identity: formatIdentityRecord(updated) });
});

// 5. Duplicate Identity
app.post('/api/v1/identities/:identityId/duplicate', (req, res) => {
  const { identityId } = req.params;
  const userId = req.body.userId || 'usr_me';

  const orig = db.prepare('SELECT * FROM user_identities WHERE id = ?').get(identityId) as any;
  if (!orig) return res.status(404).json({ error: 'Identity not found' });
  if (orig.user_id !== userId) return res.status(403).json({ error: 'Ownership required' });

  const newId = `id_${uuidv4().slice(0, 8)}`;
  const now = Date.now();

  db.prepare(`
    INSERT INTO user_identities (
      id, user_id, name, identity_type, display_title, classification, avatar_url, cover_image_url,
      description, biography, characteristics, tags, personality_traits, interests, skills,
      experiences, achievements, memories, media_attachments, custom_sections, visual_theme,
      universe_id, layout, theme_config, is_primary, visibility, status, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, 'draft', ?, ?)
  `).run(
    newId, userId, `${orig.name} (Copy)`, orig.identity_type || 'personal', orig.display_title, orig.classification,
    orig.avatar_url, orig.cover_image_url, orig.description, orig.biography,
    orig.characteristics || '[]', orig.tags || '[]', orig.personality_traits || '[]',
    orig.interests || '[]', orig.skills || '[]', orig.experiences || '[]',
    orig.achievements || '[]', orig.memories || '[]', orig.media_attachments || '[]',
    orig.custom_sections || '[]', orig.visual_theme || '{}',
    orig.universe_id, orig.layout, orig.theme_config, orig.visibility, now, now
  );

  // Duplicate custom sections
  const sections = db.prepare('SELECT * FROM identity_custom_sections WHERE identity_id = ?').all(identityId) as any[];
  for (const s of sections) {
    db.prepare(`
      INSERT INTO identity_custom_sections (id, identity_id, user_id, section_key, title, section_type, content, visibility, sort_order, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(`ics_${uuidv4().slice(0, 8)}`, newId, userId, s.section_key, s.title, s.section_type, s.content, s.visibility, s.sort_order, now, now);
  }

  // Duplicate timeline events
  const events = db.prepare('SELECT * FROM identity_timeline_events WHERE identity_id = ?').all(identityId) as any[];
  for (const e of events) {
    db.prepare(`
      INSERT INTO identity_timeline_events (id, identity_id, user_id, date_nature, year_value, numeric_year, era_label, display_date, title, description, detailed_narrative, image_url, tags, visibility, sort_order, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(`ite_${uuidv4().slice(0, 8)}`, newId, userId, e.date_nature, e.year_value, e.numeric_year, e.era_label, e.display_date, e.title, e.description, e.detailed_narrative, e.image_url, e.tags, e.visibility, e.sort_order, now, now);
  }

  const duplicated = db.prepare('SELECT * FROM user_identities WHERE id = ?').get(newId);
  res.json({ success: true, identity: formatIdentityRecord(duplicated) });
});

// 6. Delete Identity
app.delete('/api/v1/identities/:identityId', (req, res) => {
  const { identityId } = req.params;
  const userId = (req.query.userId as string) || req.body.userId || 'usr_me';

  const orig = db.prepare('SELECT * FROM user_identities WHERE id = ?').get(identityId) as any;
  if (!orig) return res.status(404).json({ error: 'Identity not found' });
  if (orig.user_id !== userId) return res.status(403).json({ error: 'Ownership required' });

  db.prepare('DELETE FROM identity_custom_sections WHERE identity_id = ?').run(identityId);
  db.prepare('DELETE FROM identity_timeline_events WHERE identity_id = ?').run(identityId);
  db.prepare('DELETE FROM user_identities WHERE id = ?').run(identityId);
  res.json({ success: true, message: 'Identity deleted' });
});

// 7. Identity Custom Sections CRUD
app.get('/api/v1/identities/:identityId/sections', (req, res) => {
  const { identityId } = req.params;
  const viewerId = (req.headers['x-user-id'] as string) || (req.query.viewerId as string) || 'usr_me';

  const identity = db.prepare('SELECT user_id, visibility FROM user_identities WHERE id = ?').get(identityId) as any;
  if (!identity) return res.status(404).json({ error: 'Identity not found' });

  const isOwner = identity.user_id === viewerId;
  let query = 'SELECT * FROM identity_custom_sections WHERE identity_id = ?';
  const params: any[] = [identityId];

  if (!isOwner) {
    query += " AND visibility = 'public'";
  }
  query += ' ORDER BY sort_order ASC, created_at ASC';
  const sections = db.prepare(query).all(...params);
  res.json({ success: true, sections });
});

app.post('/api/v1/identities/:identityId/sections', (req, res) => {
  const { identityId } = req.params;
  const userId = req.body.userId || 'usr_me';
  const { sectionKey, title, sectionType = 'markdown', content = '', visibility = 'public', sortOrder = 0 } = req.body;

  const identity = db.prepare('SELECT user_id FROM user_identities WHERE id = ?').get(identityId) as any;
  if (!identity) return res.status(404).json({ error: 'Identity not found' });
  if (identity.user_id !== userId) return res.status(403).json({ error: 'Ownership required' });

  if (!title || !title.trim()) {
    return res.status(400).json({ error: 'Section title is required' });
  }

  const id = `ics_${uuidv4().slice(0, 8)}`;
  const now = Date.now();

  db.prepare(`
    INSERT INTO identity_custom_sections (
      id, identity_id, user_id, section_key, title, section_type, content, visibility, sort_order, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, identityId, userId, sectionKey || id, title.trim(), sectionType, content, visibility, sortOrder, now, now);

  const created = db.prepare('SELECT * FROM identity_custom_sections WHERE id = ?').get(id);
  res.json({ success: true, section: created });
});

app.put('/api/v1/identities/:identityId/sections/:sectionId', (req, res) => {
  const { identityId, sectionId } = req.params;
  const userId = req.body.userId || 'usr_me';

  const existing = db.prepare('SELECT * FROM identity_custom_sections WHERE id = ? AND identity_id = ?').get(sectionId, identityId) as any;
  if (!existing) return res.status(404).json({ error: 'Section not found' });
  if (existing.user_id !== userId) return res.status(403).json({ error: 'Ownership required' });

  const {
    title = existing.title,
    sectionType = existing.section_type,
    content = existing.content,
    visibility = existing.visibility,
    sortOrder = existing.sort_order
  } = req.body;

  db.prepare(`
    UPDATE identity_custom_sections SET
      title = ?, section_type = ?, content = ?, visibility = ?, sort_order = ?, updated_at = ?
    WHERE id = ?
  `).run(title.trim(), sectionType, content, visibility, sortOrder, Date.now(), sectionId);

  const updated = db.prepare('SELECT * FROM identity_custom_sections WHERE id = ?').get(sectionId);
  res.json({ success: true, section: updated });
});

app.delete('/api/v1/identities/:identityId/sections/:sectionId', (req, res) => {
  const { identityId, sectionId } = req.params;
  const userId = (req.query.userId as string) || req.body.userId || 'usr_me';

  const existing = db.prepare('SELECT * FROM identity_custom_sections WHERE id = ? AND identity_id = ?').get(sectionId, identityId) as any;
  if (!existing) return res.status(404).json({ error: 'Section not found' });
  if (existing.user_id !== userId) return res.status(403).json({ error: 'Ownership required' });

  db.prepare('DELETE FROM identity_custom_sections WHERE id = ?').run(sectionId);
  res.json({ success: true, message: 'Section deleted' });
});

// 8. Identity Timeline Events CRUD (Arbitrary negative years, 0, future, and 4 date natures)
app.get('/api/v1/identities/:identityId/timeline', (req, res) => {
  const { identityId } = req.params;
  const viewerId = (req.headers['x-user-id'] as string) || (req.query.viewerId as string) || 'usr_me';
  const nature = req.query.nature as string;

  const identity = db.prepare('SELECT user_id FROM user_identities WHERE id = ?').get(identityId) as any;
  if (!identity) return res.status(404).json({ error: 'Identity not found' });

  const isOwner = identity.user_id === viewerId;
  let query = 'SELECT * FROM identity_timeline_events WHERE identity_id = ?';
  const params: any[] = [identityId];

  if (!isOwner) {
    query += " AND visibility = 'public'";
  }
  if (nature) {
    query += ' AND date_nature = ?';
    params.push(nature);
  }
  query += ' ORDER BY numeric_year ASC, sort_order ASC, created_at ASC';
  const events = db.prepare(query).all(...params) as any[];

  res.json({
    success: true,
    events: events.map(e => ({
      ...e,
      tags: e.tags ? JSON.parse(e.tags) : []
    }))
  });
});

app.post('/api/v1/identities/:identityId/timeline', (req, res) => {
  const { identityId } = req.params;
  const userId = req.body.userId || 'usr_me';
  const {
    dateNature = 'personal', // 'historical', 'fictional', 'hypothetical', 'personal'
    yearValue,               // e.g. "-1500", "0", "1998", "2026", "2150"
    customEra,
    displayDate: explicitDisplayDate,
    title,
    description = '',
    detailedNarrative = '',
    imageUrl = null,
    tags = [],
    visibility = 'public',
    sortOrder = 0
  } = req.body;

  const identity = db.prepare('SELECT user_id FROM user_identities WHERE id = ?').get(identityId) as any;
  if (!identity) return res.status(404).json({ error: 'Identity not found' });
  if (identity.user_id !== userId) return res.status(403).json({ error: 'Ownership required' });

  if (!title || !title.trim()) {
    return res.status(400).json({ error: 'Event title is required' });
  }
  if (yearValue === undefined || yearValue === null || String(yearValue).trim() === '') {
    return res.status(400).json({ error: 'yearValue is required (e.g. -1500, 0, 1998, 2026)' });
  }

  const { numericYear, eraLabel, displayDate } = parseTimelineDateInput(yearValue, dateNature, customEra, explicitDisplayDate);
  const id = `ite_${uuidv4().slice(0, 8)}`;
  const now = Date.now();

  db.prepare(`
    INSERT INTO identity_timeline_events (
      id, identity_id, user_id, date_nature, year_value, numeric_year, era_label,
      display_date, title, description, detailed_narrative, image_url, tags,
      visibility, sort_order, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id, identityId, userId, dateNature, String(yearValue).trim(), numericYear, eraLabel,
    displayDate, title.trim(), description.trim(), detailedNarrative.trim(), imageUrl,
    JSON.stringify(tags), visibility, sortOrder, now, now
  );

  const created = db.prepare('SELECT * FROM identity_timeline_events WHERE id = ?').get(id) as any;
  res.json({
    success: true,
    event: {
      ...created,
      tags: created.tags ? JSON.parse(created.tags) : []
    }
  });
});

app.put('/api/v1/identities/:identityId/timeline/:eventId', (req, res) => {
  const { identityId, eventId } = req.params;
  const userId = req.body.userId || 'usr_me';

  const existing = db.prepare('SELECT * FROM identity_timeline_events WHERE id = ? AND identity_id = ?').get(eventId, identityId) as any;
  if (!existing) return res.status(404).json({ error: 'Timeline event not found' });
  if (existing.user_id !== userId) return res.status(403).json({ error: 'Ownership required' });

  const {
    dateNature = existing.date_nature,
    yearValue = existing.year_value,
    customEra = existing.era_label,
    displayDate: explicitDisplayDate = existing.display_date,
    title = existing.title,
    description = existing.description,
    detailedNarrative = existing.detailed_narrative,
    imageUrl = existing.image_url,
    tags = existing.tags ? JSON.parse(existing.tags) : [],
    visibility = existing.visibility,
    sortOrder = existing.sort_order
  } = req.body;

  const { numericYear, eraLabel, displayDate } = parseTimelineDateInput(yearValue, dateNature, customEra, explicitDisplayDate);

  db.prepare(`
    UPDATE identity_timeline_events SET
      date_nature = ?, year_value = ?, numeric_year = ?, era_label = ?,
      display_date = ?, title = ?, description = ?, detailed_narrative = ?,
      image_url = ?, tags = ?, visibility = ?, sort_order = ?, updated_at = ?
    WHERE id = ?
  `).run(
    dateNature, String(yearValue).trim(), numericYear, eraLabel,
    displayDate, title.trim(), description.trim(), detailedNarrative.trim(),
    imageUrl, JSON.stringify(tags), visibility, sortOrder, Date.now(), eventId
  );

  const updated = db.prepare('SELECT * FROM identity_timeline_events WHERE id = ?').get(eventId) as any;
  res.json({
    success: true,
    event: {
      ...updated,
      tags: updated.tags ? JSON.parse(updated.tags) : []
    }
  });
});

app.delete('/api/v1/identities/:identityId/timeline/:eventId', (req, res) => {
  const { identityId, eventId } = req.params;
  const userId = (req.query.userId as string) || req.body.userId || 'usr_me';

  const existing = db.prepare('SELECT * FROM identity_timeline_events WHERE id = ? AND identity_id = ?').get(eventId, identityId) as any;
  if (!existing) return res.status(404).json({ error: 'Timeline event not found' });
  if (existing.user_id !== userId) return res.status(403).json({ error: 'Ownership required' });

  db.prepare('DELETE FROM identity_timeline_events WHERE id = ?').run(eventId);
  res.json({ success: true, message: 'Timeline event deleted' });
});

// ============================================================================
// MASTER PROMPT 03: PERSONALITY, HUMAN BEHAVIOR & EMOTIONAL INTELLIGENCE
// ============================================================================

app.get('/api/v1/psychology/concepts', (req, res) => {
  try {
    const { domain, frameworkType, search } = req.query as { domain?: any; frameworkType?: any; search?: string };
    const concepts = psychologyService.getAllConcepts(domain, frameworkType, search);
    res.json({ success: true, concepts, count: concepts.length });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/v1/psychology/concepts/:conceptId', (req, res) => {
  try {
    const concept = psychologyService.getConceptById(req.params.conceptId);
    if (!concept) return res.status(404).json({ success: false, error: 'Concept not found' });
    res.json({ success: true, concept });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/v1/psychology/profile/:userId', (req, res) => {
  try {
    const viewerId = (req.query.viewerId as string) || (req.headers['x-user-id'] as string) || 'usr_me';
    const profile = psychologyService.getUserProfile(req.params.userId, viewerId);
    if (!profile) return res.status(404).json({ success: false, error: 'Personality profile not found or private' });
    res.json({ success: true, profile });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put('/api/v1/psychology/profile', (req, res) => {
  try {
    const callerId = getCallerUserId(req);
    const userId = req.body.userId || callerId || 'usr_me';
    
    // Authorization check
    if (callerId && callerId !== userId && callerId !== 'admin') {
      return res.status(403).json({ success: false, error: 'Cannot modify another user personality profile' });
    }

    const updated = psychologyService.saveUserProfile(userId, req.body);
    res.json({ success: true, profile: updated, message: 'Personality profile updated successfully' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/v1/psychology/exercises', (req, res) => {
  try {
    const domain = req.query.domain as any;
    const exercises = psychologyService.getAllExercises(domain);
    res.json({ success: true, exercises, count: exercises.length });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/v1/psychology/exercises/:exerciseId', (req, res) => {
  try {
    const exercise = psychologyService.getExerciseById(req.params.exerciseId);
    if (!exercise) return res.status(404).json({ success: false, error: 'Exercise not found' });
    res.json({ success: true, exercise });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/v1/psychology/exercises/:exerciseId/submit', (req, res) => {
  try {
    const callerId = getCallerUserId(req);
    const userId = req.body.userId || callerId || 'usr_me';
    const { answers, personalTakeaway, visibility } = req.body;

    if (!answers || typeof answers !== 'object') {
      return res.status(400).json({ success: false, error: 'Answers payload required' });
    }

    const response = psychologyService.submitExerciseResponse(
      userId,
      req.params.exerciseId,
      answers,
      personalTakeaway,
      visibility || 'private'
    );
    res.json({ success: true, response, message: 'Reflection exercise submitted successfully' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/v1/psychology/exercises/user/:userId', (req, res) => {
  try {
    const viewerId = (req.query.viewerId as string) || (req.headers['x-user-id'] as string) || 'usr_me';
    const responses = psychologyService.getUserExerciseResponses(req.params.userId, viewerId);
    res.json({ success: true, responses });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/v1/psychology/feedback/:targetUserId', (req, res) => {
  try {
    const callerId = getCallerUserId(req);
    const authorUserId = req.body.authorUserId || callerId || 'usr_me';
    const targetUserId = req.params.targetUserId;

    if (authorUserId === targetUserId) {
      return res.status(400).json({ success: false, error: 'Cannot submit perception feedback for yourself' });
    }

    const feedback = psychologyService.submitPerceptionFeedback(authorUserId, targetUserId, req.body);
    res.json({ success: true, feedback, message: 'Perception feedback delivered to companion' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/v1/psychology/feedback/:targetUserId', (req, res) => {
  try {
    const viewerId = (req.query.viewerId as string) || (req.headers['x-user-id'] as string) || 'usr_me';
    const feedback = psychologyService.getUserPerceptionFeedback(req.params.targetUserId, viewerId);
    res.json({ success: true, feedback });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/v1/psychology/history/snapshot', (req, res) => {
  try {
    const callerId = getCallerUserId(req);
    const userId = req.body.userId || callerId || 'usr_me';
    const { snapshotLabel, growthReflections } = req.body;

    if (!snapshotLabel) {
      return res.status(400).json({ success: false, error: 'Snapshot label is required' });
    }

    const snapshot = psychologyService.recordTraitSnapshot(userId, snapshotLabel, growthReflections);
    res.json({ success: true, snapshot, message: 'Trait history snapshot recorded' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/v1/psychology/history/:userId', (req, res) => {
  try {
    const viewerId = (req.query.viewerId as string) || (req.headers['x-user-id'] as string) || 'usr_me';
    const snapshots = psychologyService.getUserTraitHistory(req.params.userId, viewerId);
    res.json({ success: true, snapshots });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/v1/psychology/compatibility', (req, res) => {
  try {
    const { userAId, userBId } = req.body;
    if (!userAId || !userBId) {
      return res.status(400).json({ success: false, error: 'Both userAId and userBId are required' });
    }

    const report = psychologyService.calculateCompatibilityResonance(userAId, userBId);
    res.json({ success: true, report });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ============================================================================
// FICTIONAL UNIVERSES & WORLD CREATION
// ============================================================================

app.get('/api/v1/universes', (req, res) => {
  const viewerId = (req.query.viewerId as string) || 'usr_me';
  const universes = db.prepare(`
    SELECT * FROM fictional_universes 
    WHERE visibility = 'public' OR creator_id = ?
    ORDER BY created_at DESC
  `).all(viewerId);

  res.json({ success: true, universes });
});

app.get('/api/v1/universes/:universeId', (req, res) => {
  const { universeId } = req.params;
  const universe = db.prepare('SELECT * FROM fictional_universes WHERE id = ?').get(universeId) as any;
  if (!universe) return res.status(404).json({ error: 'Universe not found' });

  const characters = db.prepare('SELECT * FROM universe_characters WHERE universe_id = ?').all(universeId);
  res.json({ success: true, universe, characters });
});

app.post('/api/v1/universes', (req, res) => {
  const {
    creatorId = 'usr_me',
    name,
    slug,
    description = '',
    genre = 'fantasy',
    lore = '',
    rulesOfUniverse = '',
    coverImageUrl = null,
    ambientSoundUrl = null,
    isCollaborative = 0,
    visibility = 'public'
  } = req.body;

  if (!name || !slug) return res.status(400).json({ error: 'Name and slug are required' });

  const id = `uni_${uuidv4().slice(0, 8)}`;
  const now = Date.now();

  db.prepare(`
    INSERT INTO fictional_universes (
      id, creator_id, name, slug, description, genre, lore, rules_of_universe,
      cover_image_url, ambient_sound_url, is_collaborative, visibility, status, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'published', ?, ?)
  `).run(
    id, creatorId, name.trim(), slug.trim().toLowerCase(), description.trim(),
    genre, lore.trim(), rulesOfUniverse.trim(), coverImageUrl, ambientSoundUrl,
    isCollaborative ? 1 : 0, visibility, now, now
  );

  const created = db.prepare('SELECT * FROM fictional_universes WHERE id = ?').get(id);
  res.json({ success: true, universe: created });
});

// ============================================================================
// UNIVERSAL LIFE TIMELINE (BCE, Astronomical, Fictional, Arbitrary Scales)
// ============================================================================

app.get('/api/v1/universal-timeline/user/:userId', (req, res) => {
  const { userId } = req.params;
  const viewerId = (req.query.viewerId as string) || 'usr_me';
  const identityId = req.query.identityId as string;
  const universeId = req.query.universeId as string;
  const timeType = req.query.timeType as string;
  const order = req.query.order === 'asc' ? 'ASC' : 'DESC';

  const isOwner = viewerId === userId;
  let query = 'SELECT * FROM universal_timeline_events WHERE user_id = ?';
  const params: any[] = [userId];

  if (!isOwner) {
    query += " AND visibility = 'public'";
  }

  if (identityId) {
    query += ' AND identity_id = ?';
    params.push(identityId);
  }

  if (universeId) {
    query += ' AND universe_id = ?';
    params.push(universeId);
  }

  if (timeType) {
    query += ' AND time_type = ?';
    params.push(timeType);
  }

  query += ` ORDER BY sort_order ${order}, created_at ${order}`;
  const events = db.prepare(query).all(...params);

  res.json({ success: true, events, isOwner });
});

app.post('/api/v1/universal-timeline', (req, res) => {
  const {
    userId = 'usr_me',
    identityId = null,
    universeId = null,
    timeType,
    yearValue,
    yearScale = 'years',
    eraLabel = null,
    displayLabel,
    title,
    shortDescription,
    detailedDescription = '',
    imageUrl = null,
    eventCategory = 'milestone',
    isFictional = 0,
    precision = 'approximate',
    calendarSystem = 'gregorian',
    tags = '',
    visibility = 'public'
  } = req.body;

  if (!timeType || !yearValue || !displayLabel || !title || !shortDescription) {
    return res.status(400).json({ error: 'timeType, yearValue, displayLabel, title, and shortDescription are required' });
  }

  const id = `ute_${uuidv4().slice(0, 8)}`;
  const now = Date.now();

  db.prepare(`
    INSERT INTO universal_timeline_events (
      id, user_id, identity_id, universe_id, time_type, year_value, year_scale,
      era_label, display_label, title, short_description, detailed_description,
      image_url, event_category, is_fictional, precision, calendar_system, tags,
      visibility, sort_order, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?)
  `).run(
    id, userId, identityId, universeId, timeType, String(yearValue).trim(),
    yearScale, eraLabel, displayLabel.trim(), title.trim(), shortDescription.trim(),
    detailedDescription.trim(), imageUrl, eventCategory, isFictional ? 1 : 0,
    precision, calendarSystem, tags, visibility, now, now
  );

  const event = db.prepare('SELECT * FROM universal_timeline_events WHERE id = ?').get(id);
  res.json({ success: true, event });
});

// ============================================================================
// PRIVATE VIEWER NOTES (Telegram-Inspired Contact Notes - Author Only Access)
// ============================================================================

app.get('/api/v1/viewer-notes/:targetUserId', (req, res) => {
  const { targetUserId } = req.params;
  const viewerId = (req.headers['x-user-id'] as string) || (req.query.viewerId as string) || 'usr_me';

  // STRICT PRIVACY: Target user CANNOT see viewer's private note on them
  const note = db.prepare(`
    SELECT * FROM private_viewer_notes 
    WHERE viewer_id = ? AND target_user_id = ?
  `).get(viewerId, targetUserId);

  res.json({ success: true, note: note || null });
});

app.post('/api/v1/viewer-notes/:targetUserId', (req, res) => {
  const { targetUserId } = req.params;
  const viewerId = (req.headers['x-user-id'] as string) || req.body.viewerId || 'usr_me';
  const { noteContent } = req.body;

  if (!noteContent || !noteContent.trim()) {
    return res.status(400).json({ error: 'noteContent is required' });
  }

  const id = `pvn_${uuidv4().slice(0, 8)}`;
  const now = Date.now();

  db.prepare(`
    INSERT INTO private_viewer_notes (id, viewer_id, target_user_id, note_content, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT(viewer_id, target_user_id) DO UPDATE SET
      note_content = excluded.note_content,
      updated_at = excluded.updated_at
  `).run(id, viewerId, targetUserId, noteContent.trim(), now, now);

  const updatedNote = db.prepare(`
    SELECT * FROM private_viewer_notes WHERE viewer_id = ? AND target_user_id = ?
  `).get(viewerId, targetUserId);

  res.json({ success: true, note: updatedNote });
});

app.delete('/api/v1/viewer-notes/:targetUserId', (req, res) => {
  const { targetUserId } = req.params;
  const viewerId = (req.headers['x-user-id'] as string) || (req.query.viewerId as string) || 'usr_me';

  db.prepare('DELETE FROM private_viewer_notes WHERE viewer_id = ? AND target_user_id = ?').run(viewerId, targetUserId);
  res.json({ success: true, message: 'Note deleted' });
});

// ============================================================================
// SOCIAL FEEDBACK & COMMUNITY TRAIT VOTING (Like/Dislike, Red/Green Flags)
// ============================================================================

app.get('/api/v1/social-feedback/:targetUserId', (req, res) => {
  const { targetUserId } = req.params;
  const viewerId = (req.query.viewerId as string) || 'usr_me';

  const likesCount = (db.prepare("SELECT COUNT(*) as count FROM profile_votes WHERE target_user_id = ? AND vote_type = 'like'").get(targetUserId) as any).count;
  const dislikesCount = (db.prepare("SELECT COUNT(*) as count FROM profile_votes WHERE target_user_id = ? AND vote_type = 'dislike'").get(targetUserId) as any).count;

  const userVoteRow = db.prepare('SELECT vote_type FROM profile_votes WHERE voter_id = ? AND target_user_id = ?').get(viewerId, targetUserId) as any;
  const userVote = userVoteRow ? userVoteRow.vote_type : null;

  const traits = db.prepare(`
    SELECT trait_slug, COUNT(*) as count 
    FROM profile_trait_votes 
    WHERE target_user_id = ? 
    GROUP BY trait_slug
  `).all(targetUserId) as Array<{ trait_slug: string; count: number }>;

  const userTraits = db.prepare(`
    SELECT trait_slug FROM profile_trait_votes WHERE voter_id = ? AND target_user_id = ?
  `).all(viewerId, targetUserId) as Array<{ trait_slug: string }>;
  const userSelectedTraits = userTraits.map(t => t.trait_slug);

  res.json({
    success: true,
    likesCount,
    dislikesCount,
    userVote,
    traits: traits.map(t => ({
      trait_slug: t.trait_slug,
      count: t.count,
      userSelected: userSelectedTraits.includes(t.trait_slug)
    }))
  });
});

app.post('/api/v1/social-feedback/vote', (req, res) => {
  const { voterId = 'usr_me', targetUserId, voteType } = req.body;

  if (!targetUserId || !voteType || !['like', 'dislike'].includes(voteType)) {
    return res.status(400).json({ error: 'targetUserId and valid voteType (like/dislike) required' });
  }

  if (voterId === targetUserId) {
    return res.status(400).json({ error: 'Self-voting is not allowed' });
  }

  const existing = db.prepare('SELECT * FROM profile_votes WHERE voter_id = ? AND target_user_id = ?').get(voterId, targetUserId) as any;
  const now = Date.now();

  if (existing) {
    if (existing.vote_type === voteType) {
      // Toggle off
      db.prepare('DELETE FROM profile_votes WHERE voter_id = ? AND target_user_id = ?').run(voterId, targetUserId);
      return res.json({ success: true, activeVote: null });
    } else {
      // Change vote
      db.prepare('UPDATE profile_votes SET vote_type = ?, created_at = ? WHERE voter_id = ? AND target_user_id = ?').run(voteType, now, voterId, targetUserId);
      return res.json({ success: true, activeVote: voteType });
    }
  } else {
    const id = `pv_${uuidv4().slice(0, 8)}`;
    db.prepare('INSERT INTO profile_votes (id, voter_id, target_user_id, vote_type, created_at) VALUES (?, ?, ?, ?, ?)').run(id, voterId, targetUserId, voteType, now);
    return res.json({ success: true, activeVote: voteType });
  }
});

app.post('/api/v1/social-feedback/trait', (req, res) => {
  const { voterId = 'usr_me', targetUserId, traitSlug } = req.body;

  if (!targetUserId || !traitSlug) {
    return res.status(400).json({ error: 'targetUserId and traitSlug required' });
  }

  if (voterId === targetUserId) {
    return res.status(400).json({ error: 'Self-trait voting is not allowed' });
  }

  const existing = db.prepare('SELECT * FROM profile_trait_votes WHERE voter_id = ? AND target_user_id = ? AND trait_slug = ?').get(voterId, targetUserId, traitSlug);

  if (existing) {
    db.prepare('DELETE FROM profile_trait_votes WHERE voter_id = ? AND target_user_id = ? AND trait_slug = ?').run(voterId, targetUserId, traitSlug);
    res.json({ success: true, active: false });
  } else {
    const id = `ptv_${uuidv4().slice(0, 8)}`;
    db.prepare('INSERT INTO profile_trait_votes (id, voter_id, target_user_id, trait_slug, created_at) VALUES (?, ?, ?, ?, ?)').run(id, voterId, targetUserId, traitSlug, Date.now());
    res.json({ success: true, active: true });
  }
});

// ============================================================================
// TESTIMONIALS & REVIEWS (With 100+ Message Eligibility Check & Recipient Approval)
// ============================================================================

app.get('/api/v1/reviews/user/:targetUserId', (req, res) => {
  const { targetUserId } = req.params;
  const viewerId = (req.query.viewerId as string) || 'usr_me';
  const isTarget = viewerId === targetUserId;

  let query = `
    SELECT r.*, u.name as author_name, u.avatar_url as author_avatar
    FROM user_reviews r
    JOIN users u ON r.author_id = u.id
    WHERE r.target_user_id = ?
  `;

  if (!isTarget) {
    query += " AND (r.visibility = 'approved' OR r.author_id = ?)";
    const reviews = db.prepare(query).all(targetUserId, viewerId);
    return res.json({ success: true, reviews });
  } else {
    const reviews = db.prepare(query).all(targetUserId);
    return res.json({ success: true, reviews });
  }
});

app.post('/api/v1/reviews', (req, res) => {
  const { authorId = 'usr_me', targetUserId, reviewText, category = 'general' } = req.body;

  if (!targetUserId || !reviewText || !reviewText.trim()) {
    return res.status(400).json({ error: 'targetUserId and reviewText are required' });
  }

  if (authorId === targetUserId) {
    return res.status(400).json({ error: 'Cannot review your own account' });
  }

  // Count exchanged messages
  const msgCount = (db.prepare(`
    SELECT COUNT(*) as count 
    FROM messages m
    JOIN conversation_members cm1 ON m.conversation_id = cm1.conversation_id AND cm1.user_id = ?
    JOIN conversation_members cm2 ON m.conversation_id = cm2.conversation_id AND cm2.user_id = ?
  `).get(authorId, targetUserId) as any).count;

  // Enforce 100+ message threshold (or established connection)
  const isEligible = msgCount >= 100;
  if (!isEligible) {
    return res.status(403).json({
      error: 'Review eligibility requires an established interaction history (100+ messages exchanged).',
      messagesExchanged: msgCount,
      required: 100
    });
  }

  const id = `rev_${uuidv4().slice(0, 8)}`;
  const now = Date.now();

  db.prepare(`
    INSERT INTO user_reviews (
      id, author_id, target_user_id, category, review_text, is_approved_by_target, visibility, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, 0, 'pending', ?, ?)
    ON CONFLICT(author_id, target_user_id) DO UPDATE SET
      review_text = excluded.review_text,
      category = excluded.category,
      visibility = 'pending',
      is_approved_by_target = 0,
      updated_at = excluded.updated_at
  `).run(id, authorId, targetUserId, category, reviewText.trim(), now, now);

  res.json({ success: true, message: 'Review submitted for recipient approval', reviewId: id });
});

app.post('/api/v1/reviews/:reviewId/approve', (req, res) => {
  const { reviewId } = req.params;
  const userId = req.body.userId || 'usr_me';

  const review = db.prepare('SELECT * FROM user_reviews WHERE id = ?').get(reviewId) as any;
  if (!review) return res.status(404).json({ error: 'Review not found' });
  if (review.target_user_id !== userId) return res.status(403).json({ error: 'Only recipient can approve review' });

  db.prepare("UPDATE user_reviews SET is_approved_by_target = 1, visibility = 'approved', updated_at = ? WHERE id = ?").run(Date.now(), reviewId);
  res.json({ success: true, message: 'Review approved and published' });
});

// ============================================================================
// RELATIONSHIP INTERACTION METRICS & VOLUNTARY PROGRESSIVE DISCOVERY
// ============================================================================

app.get('/api/v1/relationship-metrics/:otherUserId', (req, res) => {
  const { otherUserId } = req.params;
  const viewerId = (req.query.viewerId as string) || 'usr_me';

  const msgCount = (db.prepare(`
    SELECT COUNT(*) as count 
    FROM messages m
    JOIN conversation_members cm1 ON m.conversation_id = cm1.conversation_id AND cm1.user_id = ?
    JOIN conversation_members cm2 ON m.conversation_id = cm2.conversation_id AND cm2.user_id = ?
  `).get(viewerId, otherUserId) as any).count;

  const firstMsg = db.prepare(`
    SELECT MIN(m.created_at) as first_time
    FROM messages m
    JOIN conversation_members cm1 ON m.conversation_id = cm1.conversation_id AND cm1.user_id = ?
    JOIN conversation_members cm2 ON m.conversation_id = cm2.conversation_id AND cm2.user_id = ?
  `).get(viewerId, otherUserId) as any;

  const daysConnected = firstMsg && firstMsg.first_time 
    ? Math.max(1, Math.floor((Date.now() - firstMsg.first_time) / (1000 * 60 * 60 * 24)))
    : 0;

  // Celebratory milestones
  const milestoneThresholds = [10, 50, 100, 250, 500, 1000];
  const achievedMilestones = milestoneThresholds.filter(m => msgCount >= m);

  // Voluntarily shared secrets/items (explicit owner permission only)
  const sharedItems = db.prepare(`
    SELECT * FROM relationship_voluntary_shares
    WHERE (owner_id = ? AND recipient_id = ?) OR (owner_id = ? AND recipient_id = ?)
  `).all(viewerId, otherUserId, otherUserId, viewerId);

  res.json({
    success: true,
    metrics: {
      messagesCount: msgCount,
      daysConnected,
      achievedMilestones,
      nextMilestone: milestoneThresholds.find(m => m > msgCount) || null,
      voluntarilySharedCount: sharedItems.length,
      sharedItems
    }
  });
});

app.post('/api/v1/relationship-metrics/voluntary-share', (req, res) => {
  const { ownerId = 'usr_me', recipientId, itemType, itemId } = req.body;

  if (!recipientId || !itemType || !itemId) {
    return res.status(400).json({ error: 'recipientId, itemType, and itemId are required' });
  }

  const id = `vs_${uuidv4().slice(0, 8)}`;
  db.prepare(`
    INSERT OR IGNORE INTO relationship_voluntary_shares (
      id, owner_id, recipient_id, item_type, item_id, unlocked_at
    ) VALUES (?, ?, ?, ?, ?, ?)
  `).run(id, ownerId, recipientId, itemType, itemId, Date.now());

  res.json({ success: true, message: 'Item voluntarily shared with connection' });
});

// ============================================================================
// CONVERSATION & ACTIVITY PREFERENCES (Aggregated Coarse Windows)
// ============================================================================

app.get('/api/v1/activity-preferences/:userId', (req, res) => {
  const { userId } = req.params;
  const prefs = db.prepare('SELECT * FROM user_activity_preferences WHERE user_id = ?').get(userId);

  res.json({
    success: true,
    preferences: prefs || {
      user_id: userId,
      share_peak_activity: 1,
      peak_window: 'evening',
      communication_style: 'loves_deep_conversations',
      chatty_indicator: 'meaningful_discussions',
      avg_response_range: 'within_few_hours',
      preferred_message_format: 'thoughtful_text'
    }
  });
});

app.put('/api/v1/activity-preferences', (req, res) => {
  const userId = req.body.userId || 'usr_me';
  const {
    sharePeakActivity = 1,
    peakWindow = 'evening',
    communicationStyle = 'loves_deep_conversations',
    chattyIndicator = 'meaningful_discussions',
    avgResponseRange = 'within_few_hours',
    preferredMessageFormat = 'thoughtful_text'
  } = req.body;

  db.prepare(`
    INSERT INTO user_activity_preferences (
      user_id, share_peak_activity, peak_window, communication_style,
      chatty_indicator, avg_response_range, preferred_message_format, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(user_id) DO UPDATE SET
      share_peak_activity = excluded.share_peak_activity,
      peak_window = excluded.peak_window,
      communication_style = excluded.communication_style,
      chatty_indicator = excluded.chatty_indicator,
      avg_response_range = excluded.avg_response_range,
      preferred_message_format = excluded.preferred_message_format,
      updated_at = excluded.updated_at
  `).run(
    userId, sharePeakActivity ? 1 : 0, peakWindow, communicationStyle,
    chattyIndicator, avgResponseRange, preferredMessageFormat, Date.now()
  );

  res.json({ success: true, message: 'Preferences updated' });
});

// ============================================================================
// EXTERNAL MINI-GAMES & SECURE EMBEDDING REGISTRY
// ============================================================================

app.get('/api/v1/games/external', (_req, res) => {
  const games = db.prepare("SELECT * FROM registered_external_games WHERE is_approved = 1").all();
  res.json({ success: true, games });
});

app.post('/api/v1/games/external/register', (req, res) => {
  const {
    providerName,
    gameTitle,
    gameUrl,
    allowedOrigin,
    category = 'trivia',
    description = '',
    thumbnailUrl = null,
    registeredBy = 'usr_me'
  } = req.body;

  if (!providerName || !gameTitle || !gameUrl || !allowedOrigin) {
    return res.status(400).json({ error: 'providerName, gameTitle, gameUrl, and allowedOrigin are required' });
  }

  // Validate URL format
  try {
    new URL(gameUrl);
    new URL(allowedOrigin);
  } catch {
    return res.status(400).json({ error: 'Valid gameUrl and allowedOrigin URLs are required' });
  }

  const id = `ext_${uuidv4().slice(0, 8)}`;
  db.prepare(`
    INSERT INTO registered_external_games (
      id, provider_name, game_title, game_url, allowed_origin, category, description,
      thumbnail_url, is_approved, sandbox_attributes, registered_by, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, 'allow-scripts allow-same-origin allow-popups', ?, ?)
  `).run(
    id, providerName.trim(), gameTitle.trim(), gameUrl.trim(), allowedOrigin.trim(),
    category, description.trim(), thumbnailUrl, registeredBy, Date.now()
  );

  const registered = db.prepare('SELECT * FROM registered_external_games WHERE id = ?').get(id);
  res.json({ success: true, game: registered });
});

// ============================================================================
// COUPLEPLAYHUB: INTIMATE GAMES REST API & SESSION MANAGEMENT
// ============================================================================

app.get('/api/v1/games/coupleplayhub', (_req, res) => {
  const games = db.prepare("SELECT * FROM registered_external_games WHERE provider_name = 'CouplePlayHub'").all();
  res.json({
    success: true,
    provider: 'CouplePlayHub',
    repository: 'https://github.com/Maddy-O/coupleplayhub',
    tiers: ['vanilla', 'pg', 'xxx', 'kinky'],
    gamesCount: games.length,
    games
  });
});

app.post('/api/v1/games/coupleplayhub/session', (req, res) => {
  const {
    id = `cph_sess_${uuidv4().slice(0, 8)}`,
    conversationId = null,
    gameId,
    tier = 'pg',
    currentTurn = 'partner1',
    state = {},
    chemistryScore = 0
  } = req.body;

  if (!gameId) {
    return res.status(400).json({ error: 'gameId is required' });
  }

  const now = Date.now();
  const stateJson = typeof state === 'string' ? state : JSON.stringify(state);

  const existing = db.prepare('SELECT id FROM coupleplayhub_sessions WHERE id = ?').get(id);

  if (existing) {
    db.prepare(`
      UPDATE coupleplayhub_sessions 
      SET tier = ?, current_turn = ?, state_json = ?, chemistry_score = ?, updated_at = ?
      WHERE id = ?
    `).run(tier, currentTurn, stateJson, chemistryScore, now, id);
  } else {
    db.prepare(`
      INSERT INTO coupleplayhub_sessions (
        id, conversation_id, game_id, tier, current_turn, state_json, chemistry_score, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, conversationId, gameId, tier, currentTurn, stateJson, chemistryScore, now, now);
  }

  const session = db.prepare('SELECT * FROM coupleplayhub_sessions WHERE id = ?').get(id) as any;
  if (session) {
    try {
      session.state = JSON.parse(session.state_json);
    } catch {
      session.state = {};
    }
  }

  res.json({ success: true, session });
});

app.get('/api/v1/games/coupleplayhub/session/:id', (req, res) => {
  const { id } = req.params;
  const session = db.prepare('SELECT * FROM coupleplayhub_sessions WHERE id = ?').get(id) as any;
  if (!session) {
    return res.status(404).json({ error: 'CouplePlayHub session not found' });
  }

  try {
    session.state = JSON.parse(session.state_json);
  } catch {
    session.state = {};
  }

  res.json({ success: true, session });
});

// ============================================================================
// SACRED CONFESSIONS & ANONYMOUS STORIES REST APIS
// ============================================================================

app.get('/api/v1/confessions', (req, res) => {
  const { category, visibility, tag } = req.query as { category?: string; visibility?: string; tag?: string };
  const currentUserId = (req.headers['x-user-id'] as string) || (req.query.userId as string) || 'usr_me';

  let query = `
    SELECT 
      c.id, c.user_id, c.title, c.story, c.category, c.mood, c.visibility,
      c.author_alias, c.tags, c.is_sensitive, c.reaction_hugs, c.reaction_relatable,
      c.reaction_peace, c.reaction_secrets, c.created_at, c.updated_at,
      u.name as author_name, u.avatar_url as author_avatar
    FROM confessions c
    LEFT JOIN users u ON c.user_id = u.id
    WHERE c.visibility IN ('anonymous', 'public')
  `;
  const params: any[] = [];

  if (category && category !== 'all') {
    query += ` AND c.category = ?`;
    params.push(category);
  }

  if (visibility && visibility !== 'all') {
    query += ` AND c.visibility = ?`;
    params.push(visibility);
  }

  if (tag && tag !== 'all') {
    const cleanTag = tag.replace(/^#/, '').trim().toLowerCase();
    query += ` AND LOWER(c.tags) LIKE ?`;
    params.push(`%${cleanTag}%`);
  }

  query += ` ORDER BY c.created_at DESC LIMIT 100`;

  const rows = db.prepare(query).all(...params) as any[];

  // Fetch reactions for current user
  const userReactions = db.prepare(`
    SELECT confession_id, reaction_type FROM confession_reactions WHERE user_id = ?
  `).all(currentUserId) as { confession_id: string; reaction_type: string }[];

  const reactionsMap = new Map<string, string[]>();
  for (const r of userReactions) {
    if (!reactionsMap.has(r.confession_id)) reactionsMap.set(r.confession_id, []);
    reactionsMap.get(r.confession_id)!.push(r.reaction_type);
  }

  // Format and sanitize output (strict anonymous masking)
  const confessions = rows.map(row => {
    const isOwner = row.user_id === currentUserId;
    const isAnon = row.visibility === 'anonymous';
    const tagList = (row.tags || '').split(',').map((t: string) => t.trim().toLowerCase()).filter(Boolean);

    return {
      id: row.id,
      userId: isOwner ? row.user_id : (isAnon ? 'anon' : row.user_id),
      title: row.title,
      story: row.story,
      category: row.category,
      mood: row.mood,
      visibility: row.visibility,
      tags: tagList,
      authorAlias: isAnon ? (row.author_alias || 'Anonymous Soul') : undefined,
      authorName: isAnon ? undefined : row.author_name,
      authorAvatar: isAnon ? undefined : row.author_avatar,
      isSensitive: Boolean(row.is_sensitive),
      reactionHugs: row.reaction_hugs || 0,
      reactionRelatable: row.reaction_relatable || 0,
      reactionPeace: row.reaction_peace || 0,
      reactionSecrets: row.reaction_secrets || 0,
      userReactions: reactionsMap.get(row.id) || [],
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      isOwner
    };
  });

  res.json({ success: true, count: confessions.length, confessions });
});

// ============================================================================
// TRENDING TAGS FOR OPTIMIZATION & DISCOVERY
// ============================================================================
app.get('/api/v1/confessions/tags/trending', (_req, res) => {
  const rows = db.prepare("SELECT tags FROM confessions WHERE visibility IN ('anonymous', 'public') AND tags IS NOT NULL AND tags != ''").all() as { tags: string }[];
  const tagCounts: Record<string, number> = {};

  for (const row of rows) {
    const list = row.tags.split(',').map(t => t.trim().toLowerCase()).filter(Boolean);
    for (const t of list) {
      tagCounts[t] = (tagCounts[t] || 0) + 1;
    }
  }

  const trending = Object.entries(tagCounts)
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 30);

  res.json({ success: true, tags: trending });
});

// ============================================================================
// SUPPORTIVE PERSONALIZED RECOMMENDATIONS (TAG RESONANCE ENGINE)
// ============================================================================
app.get('/api/v1/confessions/recommendations', (req, res) => {
  const currentUserId = (req.headers['x-user-id'] as string) || (req.query.userId as string) || 'usr_me';

  // 1. Gather user's preferred tags from their authored posts & empathy reactions
  const userAuthoredTags = db.prepare('SELECT tags FROM confessions WHERE user_id = ?').all(currentUserId) as { tags: string }[];
  const userReactedTags = db.prepare(`
    SELECT c.tags FROM confession_reactions cr
    JOIN confessions c ON cr.confession_id = c.id
    WHERE cr.user_id = ?
  `).all(currentUserId) as { tags: string }[];

  const userTagFrequency: Record<string, number> = {};
  for (const row of [...userAuthoredTags, ...userReactedTags]) {
    if (!row.tags) continue;
    const split = row.tags.split(',').map(t => t.trim().toLowerCase()).filter(Boolean);
    for (const t of split) {
      userTagFrequency[t] = (userTagFrequency[t] || 0) + 1;
    }
  }

  // If user has no tags yet, seed supportive default tags
  let userTopTags = Object.keys(userTagFrequency);
  if (userTopTags.length === 0) {
    userTopTags = ['healing', 'growth', 'vulnerability', 'boundaries', 'heartbreak', 'introvert'];
  }

  const userTagSet = new Set(userTopTags);

  // 2. Fetch public & anonymous confessions
  const candidates = db.prepare(`
    SELECT 
      c.id, c.user_id, c.title, c.story, c.category, c.mood, c.visibility,
      c.author_alias, c.tags, c.is_sensitive, c.reaction_hugs, c.reaction_relatable,
      c.reaction_peace, c.reaction_secrets, c.created_at, c.updated_at,
      u.name as author_name, u.avatar_url as author_avatar
    FROM confessions c
    LEFT JOIN users u ON c.user_id = u.id
    WHERE c.visibility IN ('anonymous', 'public') AND c.user_id != ?
    ORDER BY c.created_at DESC LIMIT 60
  `).all(currentUserId) as any[];

  // 3. Score candidates based on tag overlap
  const scored = candidates.map(row => {
    const itemTags = (row.tags || '').split(',').map((t: string) => t.trim().toLowerCase()).filter(Boolean);
    const matched = itemTags.filter((t: string) => userTagSet.has(t));
    const isAnon = row.visibility === 'anonymous';

    // Resonance score: base 60 + up to 38 based on tag overlap
    const resonanceScore = matched.length > 0 
      ? Math.min(98, 60 + Math.round((matched.length / Math.max(1, itemTags.length)) * 38))
      : 55;

    return {
      id: row.id,
      userId: isAnon ? 'anon' : row.user_id,
      title: row.title,
      story: row.story,
      category: row.category,
      mood: row.mood,
      visibility: row.visibility,
      tags: itemTags,
      resonanceScore,
      matchedTags: matched,
      authorAlias: isAnon ? (row.author_alias || 'Anonymous Soul') : undefined,
      authorName: isAnon ? undefined : row.author_name,
      authorAvatar: isAnon ? undefined : row.author_avatar,
      isSensitive: Boolean(row.is_sensitive),
      reactionHugs: row.reaction_hugs || 0,
      reactionRelatable: row.reaction_relatable || 0,
      reactionPeace: row.reaction_peace || 0,
      reactionSecrets: row.reaction_secrets || 0,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      isOwner: false
    };
  });

  // Sort by resonance score descending
  scored.sort((a, b) => (b.resonanceScore || 0) - (a.resonanceScore || 0));

  res.json({
    success: true,
    userResonanceTags: userTopTags,
    recommendationsCount: scored.length,
    recommendations: scored
  });
});

app.get('/api/v1/confessions/my', (req, res) => {
  const currentUserId = (req.headers['x-user-id'] as string) || (req.query.userId as string) || 'usr_me';

  const rows = db.prepare(`
    SELECT 
      c.id, c.user_id, c.title, c.story, c.category, c.mood, c.visibility,
      c.author_alias, c.tags, c.is_sensitive, c.reaction_hugs, c.reaction_relatable,
      c.reaction_peace, c.reaction_secrets, c.created_at, c.updated_at,
      u.name as author_name, u.avatar_url as author_avatar
    FROM confessions c
    LEFT JOIN users u ON c.user_id = u.id
    WHERE c.user_id = ?
    ORDER BY c.created_at DESC
  `).all(currentUserId) as any[];

  const userReactions = db.prepare(`
    SELECT confession_id, reaction_type FROM confession_reactions WHERE user_id = ?
  `).all(currentUserId) as { confession_id: string; reaction_type: string }[];

  const reactionsMap = new Map<string, string[]>();
  for (const r of userReactions) {
    if (!reactionsMap.has(r.confession_id)) reactionsMap.set(r.confession_id, []);
    reactionsMap.get(r.confession_id)!.push(r.reaction_type);
  }

  const confessions = rows.map(row => ({
    id: row.id,
    userId: row.user_id,
    title: row.title,
    story: row.story,
    category: row.category,
    mood: row.mood,
    visibility: row.visibility,
    tags: (row.tags || '').split(',').map((t: string) => t.trim().toLowerCase()).filter(Boolean),
    authorAlias: row.author_alias,
    authorName: row.author_name,
    authorAvatar: row.author_avatar,
    isSensitive: Boolean(row.is_sensitive),
    reactionHugs: row.reaction_hugs || 0,
    reactionRelatable: row.reaction_relatable || 0,
    reactionPeace: row.reaction_peace || 0,
    reactionSecrets: row.reaction_secrets || 0,
    userReactions: reactionsMap.get(row.id) || [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    isOwner: true
  }));

  res.json({ success: true, count: confessions.length, confessions });
});

app.post('/api/v1/confessions', (req, res) => {
  const currentUserId = (req.headers['x-user-id'] as string) || req.body.userId || 'usr_me';

  if (isUserSuspended(currentUserId)) {
    return res.status(403).json({ error: 'Forbidden: Suspended accounts cannot post confessions', code: 'ACCOUNT_SUSPENDED' });
  }

  const {
    title,
    story,
    category = 'love_heartbreak',
    mood = 'vulnerable',
    visibility = 'anonymous',
    tags = [],
    isSensitive = false,
    customAlias
  } = req.body;

  if (!title || typeof title !== 'string' || !title.trim()) {
    return res.status(400).json({ error: 'title is required' });
  }

  if (!story || typeof story !== 'string' || story.trim().length < 10) {
    return res.status(400).json({ error: 'story must be at least 10 characters' });
  }

  if (!['anonymous', 'public', 'private'].includes(visibility)) {
    return res.status(400).json({ error: 'visibility must be anonymous, public, or private' });
  }

  const id = `cnf_${uuidv4().slice(0, 8)}`;
  const now = Date.now();
  const authorAlias = visibility === 'anonymous' 
    ? (customAlias?.trim() || `Midnight Soul #${Math.floor(Math.random() * 900) + 100}`) 
    : (visibility === 'private' ? 'Private Vault' : null);

  // Normalize tags
  const normalizedTags: string[] = Array.isArray(tags)
    ? tags.map(t => String(t).replace(/^#/, '').trim().toLowerCase()).filter(Boolean)
    : (typeof tags === 'string' ? tags.split(',').map(t => t.replace(/^#/, '').trim().toLowerCase()).filter(Boolean) : []);
  const tagsStr = Array.from(new Set(normalizedTags)).join(',');

  db.prepare(`
    INSERT INTO confessions (
      id, user_id, title, story, category, mood, visibility, author_alias, tags, is_sensitive,
      reaction_hugs, reaction_relatable, reaction_peace, reaction_secrets, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, 0, 0, ?, ?)
  `).run(
    id, currentUserId, title.trim(), story.trim(), category, mood, visibility, authorAlias, tagsStr,
    isSensitive ? 1 : 0, now, now
  );

  const author = db.prepare('SELECT name, avatar_url FROM users WHERE id = ?').get(currentUserId) as any;

  const confession = {
    id,
    userId: currentUserId,
    title: title.trim(),
    story: story.trim(),
    category,
    mood,
    visibility,
    tags: Array.from(new Set(normalizedTags)),
    authorAlias: authorAlias || undefined,
    authorName: visibility === 'public' ? author?.name : undefined,
    authorAvatar: visibility === 'public' ? author?.avatar_url : undefined,
    isSensitive: Boolean(isSensitive),
    reactionHugs: 0,
    reactionRelatable: 0,
    reactionPeace: 0,
    reactionSecrets: 0,
    userReactions: [],
    createdAt: now,
    updatedAt: now,
    isOwner: true
  };

  res.json({ success: true, confession });
});

app.post('/api/v1/confessions/:id/react', (req, res) => {
  const currentUserId = (req.headers['x-user-id'] as string) || req.body.userId || 'usr_me';
  const { id } = req.params;
  const { reactionType } = req.body;

  const validReactions = ['hugs', 'relatable', 'peace', 'secrets'];
  if (!validReactions.includes(reactionType)) {
    return res.status(400).json({ error: `reactionType must be one of ${validReactions.join(', ')}` });
  }

  const confession = db.prepare('SELECT * FROM confessions WHERE id = ?').get(id) as any;
  if (!confession) {
    return res.status(404).json({ error: 'Confession not found' });
  }

  const existing = db.prepare(`
    SELECT id FROM confession_reactions WHERE confession_id = ? AND user_id = ? AND reaction_type = ?
  `).get(id, currentUserId, reactionType);

  const columnMap: Record<string, string> = {
    hugs: 'reaction_hugs',
    relatable: 'reaction_relatable',
    peace: 'reaction_peace',
    secrets: 'reaction_secrets'
  };
  const col = columnMap[reactionType];

  if (existing) {
    // Remove reaction
    db.prepare(`
      DELETE FROM confession_reactions WHERE confession_id = ? AND user_id = ? AND reaction_type = ?
    `).run(id, currentUserId, reactionType);
    db.prepare(`UPDATE confessions SET ${col} = MAX(0, ${col} - 1) WHERE id = ?`).run(id);
  } else {
    // Add reaction
    const reactId = `cr_${uuidv4().slice(0, 8)}`;
    db.prepare(`
      INSERT INTO confession_reactions (id, confession_id, user_id, reaction_type, created_at)
      VALUES (?, ?, ?, ?, ?)
    `).run(reactId, id, currentUserId, reactionType, Date.now());
    db.prepare(`UPDATE confessions SET ${col} = ${col} + 1 WHERE id = ?`).run(id);
  }

  const updated = db.prepare('SELECT * FROM confessions WHERE id = ?').get(id) as any;
  const userReactions = db.prepare(`
    SELECT reaction_type FROM confession_reactions WHERE confession_id = ? AND user_id = ?
  `).all(id, currentUserId) as { reaction_type: string }[];

  const isOwner = updated.user_id === currentUserId;
  const isAnon = updated.visibility === 'anonymous';
  const author = db.prepare('SELECT name, avatar_url FROM users WHERE id = ?').get(updated.user_id) as any;

  res.json({
    success: true,
    confession: {
      id: updated.id,
      userId: isOwner ? updated.user_id : (isAnon ? 'anon' : updated.user_id),
      title: updated.title,
      story: updated.story,
      category: updated.category,
      mood: updated.mood,
      visibility: updated.visibility,
      authorAlias: isAnon ? updated.author_alias : undefined,
      authorName: isAnon ? undefined : author?.name,
      authorAvatar: isAnon ? undefined : author?.avatar_url,
      isSensitive: Boolean(updated.is_sensitive),
      reactionHugs: updated.reaction_hugs || 0,
      reactionRelatable: updated.reaction_relatable || 0,
      reactionPeace: updated.reaction_peace || 0,
      reactionSecrets: updated.reaction_secrets || 0,
      userReactions: userReactions.map(r => r.reaction_type),
      createdAt: updated.created_at,
      updatedAt: updated.updated_at,
      isOwner
    }
  });
});

app.delete('/api/v1/confessions/:id', (req, res) => {
  const currentUserId = (req.headers['x-user-id'] as string) || (req.query.userId as string) || 'usr_me';
  const adminId = (req.headers['x-admin-id'] as string);
  const { id } = req.params;

  const confession = db.prepare('SELECT user_id FROM confessions WHERE id = ?').get(id) as { user_id: string } | undefined;
  if (!confession) {
    return res.status(404).json({ error: 'Confession not found' });
  }

  const isOwner = confession.user_id === currentUserId;
  const isAdmin = Boolean(adminId && (adminId === 'adm_system' || checkAdminPermission(adminId, 'content', 'delete')));

  if (!isOwner && !isAdmin) {
    return res.status(403).json({ error: 'Forbidden: You can only delete your own confessions', code: 'FORBIDDEN_CONFESSION_DELETE' });
  }

  db.prepare('DELETE FROM confessions WHERE id = ?').run(id);
  res.json({ success: true, message: 'Confession deleted successfully' });
});

// ============================================================================
// THE CONTROL LAYER: FEATURE MANAGEMENT & PERSONALIZATION REST APIS
// ============================================================================

// Deterministic integer hash for percentage rollouts
function calculateRolloutBucket(userId: string, featureId: string): number {
  let hash = 0;
  const combined = `${userId}:${featureId}`;
  for (let i = 0; i < combined.length; i++) {
    hash = ((hash << 5) - hash) + combined.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) % 100;
}

// 1. Feature Registry & Metadata Catalogue
app.get('/api/features/registry', (_req, res) => {
  try {
    const features = db.prepare('SELECT * FROM feature_registry ORDER BY category ASC, name ASC').all() as any[];
    const dependencies = db.prepare('SELECT * FROM feature_dependencies').all() as any[];

    const formatted = features.map(f => ({
      ...f,
      collectedData: JSON.parse(f.collected_data_json || '[]'),
      dependencies: dependencies.filter(d => d.feature_id === f.id).map(d => ({
        dependsOn: d.depends_on_feature_id,
        isOptional: Boolean(d.is_optional),
        fallbackNote: d.fallback_note
      }))
    }));

    res.json({ success: true, features: formatted });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch feature registry', details: error.message });
  }
});

// 2. Feature Evaluation Engine (4-Tier Evaluation Pipeline)
app.get('/api/features/evaluation/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const features = db.prepare('SELECT * FROM feature_registry').all() as any[];
    const flags = db.prepare('SELECT * FROM feature_flags').all() as any[];
    const preferences = db.prepare('SELECT * FROM user_feature_preferences WHERE user_id = ?').all(userId) as any[];
    const dependencies = db.prepare('SELECT * FROM feature_dependencies').all() as any[];
    const presetRow = db.prepare('SELECT active_preset FROM user_experience_presets WHERE user_id = ?').get(userId) as any;

    const flagMap = new Map(flags.map(f => [f.feature_id, f]));
    const prefMap = new Map(preferences.map(p => [p.feature_id, p]));

    const evaluated = features.map(feat => {
      const flag = flagMap.get(feat.id);
      const pref = prefMap.get(feat.id);
      
      let effectiveState: 'enabled' | 'disabled' | 'paused' | 'restricted' | 'unavailable' = 'enabled';
      let isVisible = true;
      let isDiscoverable = true;
      let reason = 'Active';

      // Tier 1: Platform & Admin Governance
      if (!flag || !flag.is_globally_enabled) {
        effectiveState = 'unavailable';
        reason = 'Disabled globally by platform administrator';
      } else if (flag.kill_switch_active) {
        effectiveState = 'unavailable';
        reason = flag.kill_switch_reason || 'Emergency kill-switch active';
      } else {
        // Rollout percentage check
        const bucket = calculateRolloutBucket(userId, feat.id);
        if (bucket >= flag.rollout_percentage) {
          effectiveState = 'unavailable';
          reason = `Controlled rollout stage (${flag.rollout_percentage}% enabled)`;
        }
      }

      // Tier 2 & 3: Dependency Resolution
      if (effectiveState !== 'unavailable') {
        const requiredHardDeps = dependencies.filter(d => d.feature_id === feat.id && !d.is_optional);
        for (const dep of requiredHardDeps) {
          const parentFlag = flagMap.get(dep.depends_on_feature_id);
          const parentPref = prefMap.get(dep.depends_on_feature_id);
          if (!parentFlag || !parentFlag.is_globally_enabled || (parentPref && parentPref.state === 'disabled')) {
            effectiveState = 'restricted';
            reason = `Requires prerequisite module: ${dep.depends_on_feature_id}`;
            break;
          }
        }
      }

      // Tier 4: User Preference & Temporal Pauses
      if (effectiveState !== 'unavailable' && effectiveState !== 'restricted') {
        if (pref) {
          if (pref.paused_until && pref.paused_until > Date.now()) {
            effectiveState = 'paused';
            reason = `Temporarily paused by user until ${new Date(pref.paused_until).toLocaleTimeString()}`;
          } else {
            effectiveState = pref.state || 'enabled';
            reason = effectiveState === 'disabled' ? 'Turned off in personal preferences' : 'Active';
          }
          isVisible = Boolean(pref.is_visible);
          isDiscoverable = Boolean(pref.is_discoverable);
        } else {
          effectiveState = feat.default_state === 'disabled' ? 'disabled' : 'enabled';
          isVisible = true;
          isDiscoverable = true;
        }
      }

      return {
        id: feat.id,
        name: feat.name,
        category: feat.category,
        tagline: feat.tagline,
        effectiveState,
        isVisible,
        isDiscoverable,
        requiresAi: Boolean(feat.requires_ai),
        requiresNotifications: Boolean(feat.requires_notifications),
        isPremium: Boolean(feat.is_premium),
        privacyLevel: feat.privacy_level,
        reason,
        customConfig: pref ? JSON.parse(pref.custom_config_json || '{}') : {}
      };
    });

    res.json({
      success: true,
      userId,
      activePreset: presetRow ? presetRow.active_preset : 'complete',
      features: evaluated
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to evaluate features', details: error.message });
  }
});

// 3. Update User Feature Preference
app.post('/api/features/user-preferences', (req, res) => {
  try {
    const {
      userId = 'usr_me',
      featureId,
      state = 'enabled',
      isVisible = 1,
      isDiscoverable = 1,
      customConfig = {},
      pausedUntil = null
    } = req.body;

    if (!featureId) {
      return res.status(400).json({ error: 'featureId is required' });
    }

    const now = Date.now();
    db.prepare(`
      INSERT INTO user_feature_preferences (
        user_id, feature_id, state, is_visible, is_discoverable, custom_config_json,
        paused_until, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(user_id, feature_id) DO UPDATE SET
        state = excluded.state,
        is_visible = excluded.is_visible,
        is_discoverable = excluded.is_discoverable,
        custom_config_json = excluded.custom_config_json,
        paused_until = excluded.paused_until,
        updated_at = excluded.updated_at
    `).run(
      userId, featureId, state, isVisible ? 1 : 0, isDiscoverable ? 1 : 0,
      JSON.stringify(customConfig), pausedUntil, now
    );

    // Telemetry event logging
    db.prepare(`
      INSERT INTO feature_usage_events (id, user_id, feature_id, event_type, metadata_json, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(`evt_${uuidv4().slice(0, 8)}`, userId, featureId, state === 'enabled' ? 'toggle_on' : 'toggle_off', JSON.stringify({ isVisible, isDiscoverable }), now);

    res.json({ success: true, message: `Preference updated for ${featureId}` });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to update user preference', details: error.message });
  }
});

// 4. Apply Personalization Preset
app.post('/api/features/apply-preset', (req, res) => {
  try {
    const { userId = 'usr_me', preset } = req.body;
    const validPresets = ['simple_social', 'dating_relationships', 'personal_growth', 'complete', 'custom'];

    if (!preset || !validPresets.includes(preset)) {
      return res.status(400).json({ error: `Valid preset required: ${validPresets.join(', ')}` });
    }

    const now = Date.now();
    const allFeatures = db.prepare('SELECT id FROM feature_registry').all() as { id: string }[];

    // Preset configurations
    let enabledIds: string[] = [];
    let visibleIds: string[] = [];

    if (preset === 'simple_social') {
      enabledIds = ['feat_friendships', 'feat_daily_quotes', 'feat_external_connections', 'feat_the_unspoken', 'feat_spotify_ambient'];
      visibleIds = ['feat_friendships', 'feat_daily_quotes', 'feat_external_connections'];
    } else if (preset === 'dating_relationships') {
      enabledIds = ['feat_dating', 'feat_friendships', 'feat_relationship_vault', 'feat_two_person_questions', 'feat_spotify_ambient', 'feat_personality_exploration', 'feat_the_unspoken', 'feat_daily_quotes'];
      visibleIds = ['feat_dating', 'feat_friendships', 'feat_relationship_vault', 'feat_two_person_questions', 'feat_spotify_ambient', 'feat_the_unspoken'];
    } else if (preset === 'personal_growth') {
      enabledIds = ['feat_the_unspoken', 'feat_personal_journal', 'feat_timeline_view', 'feat_daily_quotes', 'feat_personality_exploration', 'feat_imaginary_identities', 'feat_cinematic_profiles', 'feat_spotify_ambient'];
      visibleIds = ['feat_the_unspoken', 'feat_personal_journal', 'feat_timeline_view', 'feat_daily_quotes', 'feat_imaginary_identities'];
    } else if (preset === 'complete') {
      enabledIds = allFeatures.map(f => f.id);
      visibleIds = allFeatures.map(f => f.id);
    }

    const upsertStmt = db.prepare(`
      INSERT INTO user_feature_preferences (
        user_id, feature_id, state, is_visible, is_discoverable, custom_config_json,
        paused_until, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, NULL, ?)
      ON CONFLICT(user_id, feature_id) DO UPDATE SET
        state = excluded.state,
        is_visible = excluded.is_visible,
        is_discoverable = excluded.is_discoverable,
        paused_until = NULL,
        updated_at = excluded.updated_at
    `);

    for (const feat of allFeatures) {
      const isEnabled = enabledIds.includes(feat.id);
      const isVisible = visibleIds.includes(feat.id);
      upsertStmt.run(
        userId,
        feat.id,
        isEnabled ? 'enabled' : 'disabled',
        isVisible ? 1 : 0,
        1, // isDiscoverable
        '{}',
        now
      );
    }

    db.prepare(`
      INSERT INTO user_experience_presets (user_id, active_preset, applied_at)
      VALUES (?, ?, ?)
      ON CONFLICT(user_id) DO UPDATE SET
        active_preset = excluded.active_preset,
        applied_at = excluded.applied_at
    `).run(userId, preset, now);

    res.json({ success: true, preset, appliedCount: allFeatures.length });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to apply preset', details: error.message });
  }
});

// 5. Admin Switchboard: All Features with Rollout & Flags
app.get('/api/admin/features', (_req, res) => {
  try {
    const features = db.prepare(`
      SELECT 
        fr.*,
        ff.is_globally_enabled,
        ff.rollout_percentage,
        ff.allowed_roles_json,
        ff.allowed_tiers_json,
        ff.kill_switch_active,
        ff.kill_switch_reason,
        ff.updated_by,
        ff.updated_at as flag_updated_at
      FROM feature_registry fr
      LEFT JOIN feature_flags ff ON fr.id = ff.feature_id
      ORDER BY fr.category ASC, fr.name ASC
    `).all() as any[];

    const dependencies = db.prepare('SELECT * FROM feature_dependencies').all() as any[];

    const formatted = features.map(f => ({
      ...f,
      allowedRoles: JSON.parse(f.allowed_roles_json || '[]'),
      allowedTiers: JSON.parse(f.allowed_tiers_json || '[]'),
      isGloballyEnabled: Boolean(f.is_globally_enabled),
      killSwitchActive: Boolean(f.kill_switch_active),
      dependencies: dependencies.filter(d => d.feature_id === f.id)
    }));

    res.json({ success: true, features: formatted });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch admin features', details: error.message });
  }
});

// 6. Admin Flag Update (With Strict Audit Logging)
app.put('/api/admin/features/:featureId', (req, res) => {
  try {
    const { featureId } = req.params;
    const {
      adminId = 'adm_product',
      adminName = 'Product Administrator',
      isGloballyEnabled,
      rolloutPercentage,
      allowedRoles,
      allowedTiers,
      reason
    } = req.body;

    if (!reason || !reason.trim()) {
      return res.status(400).json({ error: 'Reason for configuration alteration is required for audit governance' });
    }

    const currentFlag = db.prepare('SELECT * FROM feature_flags WHERE feature_id = ?').get(featureId) as any;
    if (!currentFlag) {
      return res.status(404).json({ error: 'Feature flag record not found' });
    }

    const now = Date.now();
    const newGlobal = isGloballyEnabled !== undefined ? (isGloballyEnabled ? 1 : 0) : currentFlag.is_globally_enabled;
    const newRollout = rolloutPercentage !== undefined ? Math.max(0, Math.min(100, Number(rolloutPercentage))) : currentFlag.rollout_percentage;
    const newRoles = allowedRoles ? JSON.stringify(allowedRoles) : currentFlag.allowed_roles_json;
    const newTiers = allowedTiers ? JSON.stringify(allowedTiers) : currentFlag.allowed_tiers_json;

    db.prepare(`
      UPDATE feature_flags SET
        is_globally_enabled = ?,
        rollout_percentage = ?,
        allowed_roles_json = ?,
        allowed_tiers_json = ?,
        updated_by = ?,
        updated_at = ?
      WHERE feature_id = ?
    `).run(newGlobal, newRollout, newRoles, newTiers, adminName, now, featureId);

    // Record in Audit Trail
    db.prepare(`
      INSERT INTO configuration_audit_logs (
        id, admin_id, admin_name, action, target_type, target_id,
        before_value_json, after_value_json, reason, ip_address, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      `audit_${uuidv4().slice(0, 8)}`,
      adminId,
      adminName,
      'flag_update',
      'feature',
      featureId,
      JSON.stringify(currentFlag),
      JSON.stringify({ isGloballyEnabled: newGlobal, rolloutPercentage: newRollout, allowedRoles: newRoles, allowedTiers: newTiers }),
      reason.trim(),
      req.ip || '127.0.0.1',
      now
    );

    res.json({ success: true, message: `Feature ${featureId} updated`, rolloutPercentage: newRollout });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to update feature flag', details: error.message });
  }
});

// 7. Admin Emergency Kill-Switch
app.post('/api/admin/features/:featureId/kill-switch', (req, res) => {
  try {
    const { featureId } = req.params;
    const {
      adminId = 'adm_security',
      adminName = 'Platform Safety Lead',
      active = true,
      reason
    } = req.body;

    if (!reason || !reason.trim()) {
      return res.status(400).json({ error: 'Explicit reason is required for tripping or releasing emergency kill switch' });
    }

    const currentFlag = db.prepare('SELECT * FROM feature_flags WHERE feature_id = ?').get(featureId) as any;
    if (!currentFlag) {
      return res.status(404).json({ error: 'Feature flag record not found' });
    }

    const now = Date.now();
    db.prepare(`
      UPDATE feature_flags SET
        kill_switch_active = ?,
        kill_switch_reason = ?,
        updated_by = ?,
        updated_at = ?
      WHERE feature_id = ?
    `).run(active ? 1 : 0, active ? reason.trim() : null, adminName, now, featureId);

    // Audit log
    db.prepare(`
      INSERT INTO configuration_audit_logs (
        id, admin_id, admin_name, action, target_type, target_id,
        before_value_json, after_value_json, reason, ip_address, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      `audit_${uuidv4().slice(0, 8)}`,
      adminId,
      adminName,
      active ? 'kill_switch_trip' : 'kill_switch_release',
      'feature',
      featureId,
      JSON.stringify({ killSwitchActive: currentFlag.kill_switch_active }),
      JSON.stringify({ killSwitchActive: active ? 1 : 0, reason }),
      reason.trim(),
      req.ip || '127.0.0.1',
      now
    );

    res.json({ success: true, featureId, killSwitchActive: active, reason: reason.trim() });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to trip kill switch', details: error.message });
  }
});

// 8. Admin Audit Trail
app.get('/api/admin/audit-logs', (_req, res) => {
  try {
    const logs = db.prepare('SELECT * FROM configuration_audit_logs ORDER BY created_at DESC LIMIT 50').all() as any[];
    res.json({ success: true, logs });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch audit logs', details: error.message });
  }
});

// 9. Admin Adoption Analytics
app.get('/api/admin/analytics/adoption', (_req, res) => {
  try {
    const stats = db.prepare(`
      SELECT 
        fr.id,
        fr.name,
        fr.category,
        COUNT(CASE WHEN ufp.state = 'enabled' THEN 1 END) as enabled_users,
        COUNT(CASE WHEN ufp.state = 'disabled' THEN 1 END) as disabled_users,
        COUNT(CASE WHEN ufp.state = 'paused' THEN 1 END) as paused_users,
        COUNT(ufp.user_id) as total_configured
      FROM feature_registry fr
      LEFT JOIN user_feature_preferences ufp ON fr.id = ufp.feature_id
      GROUP BY fr.id
      ORDER BY enabled_users DESC
    `).all() as any[];

    res.json({ success: true, stats });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to compute adoption analytics', details: error.message });
  }
});

// ============================================================================
// CASBIN-STYLE RBAC AUTHORIZATION MIDDLEWARE
// ============================================================================
function checkAdminPermission(adminId: string, domain: string, action: string): boolean {
  if (adminId === 'adm_system' || adminId === 'usr_me') return true;

  const userRoles = db.prepare(`
    SELECT r.id, r.hierarchy_level 
    FROM admin_role_assignments ara
    JOIN admin_roles r ON ara.role_id = r.id
    WHERE ara.user_id = ?
  `).all(adminId) as { id: string; hierarchy_level: number }[];

  if (userRoles.some(r => r.id === 'super_admin')) return true;

  const permissions = db.prepare(`
    SELECT ap.domain, ap.action
    FROM admin_permissions ap
    JOIN admin_role_assignments ara ON ap.role_id = ara.role_id
    WHERE ara.user_id = ?
  `).all(adminId) as { domain: string; action: string }[];

  return permissions.some(p => 
    (p.domain === '*' || p.domain === domain) && 
    (p.action === '*' || p.action === action)
  );
}

function requireAdminPermission(domain: string, action: string) {
  return (req: any, res: any, next: any) => {
    const adminId = (req.headers['x-admin-id'] as string) || (req.headers['x-user-id'] as string) || req.body.adminId || 'usr_me';
    if (checkAdminPermission(adminId, domain, action)) {
      req.adminId = adminId;
      return next();
    }
    return res.status(403).json({
      error: 'Forbidden: Insufficient administrative privileges',
      required: { domain, action },
      adminId
    });
  };
}

// ============================================================================
// FEATURE DEPENDENCY DAG ENGINE (Cycle Detection & Impact Analysis)
// ============================================================================
function detectCircularDependency(featureId: string, targetDepId: string): boolean {
  // If target already points directly or transitively back to featureId, adding link creates cycle
  const visited = new Set<string>();
  const queue = [targetDepId];

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (current === featureId) return true; // Cycle detected!
    if (!visited.has(current)) {
      visited.add(current);
      const nextDeps = db.prepare('SELECT depends_on_feature_id FROM feature_dependencies WHERE feature_id = ?').all(current) as { depends_on_feature_id: string }[];
      for (const d of nextDeps) {
        queue.push(d.depends_on_feature_id);
      }
    }
  }
  return false;
}

// 10. Dependency DAG Graph & Impact Analysis Endpoint
app.get('/api/admin/features/dependency-graph', (_req, res) => {
  try {
    const features = db.prepare('SELECT id, name, category FROM feature_registry').all() as any[];
    const dependencies = db.prepare('SELECT * FROM feature_dependencies').all() as any[];

    // Calculate in-degrees and downstream dependants
    const graph = features.map(f => {
      const prerequisites = dependencies.filter(d => d.feature_id === f.id);
      const dependants = dependencies.filter(d => d.depends_on_feature_id === f.id);
      return {
        ...f,
        prerequisites: prerequisites.map(p => ({
          id: p.depends_on_feature_id,
          isOptional: Boolean(p.is_optional),
          fallbackNote: p.fallback_note
        })),
        dependants: dependants.map(d => ({
          id: d.feature_id,
          isOptional: Boolean(d.is_optional)
        }))
      };
    });

    res.json({ success: true, graph });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to generate dependency graph', details: error.message });
  }
});

// 11. Validate Proposed Dependency Link
app.post('/api/admin/features/dependencies/validate', requireAdminPermission('features', 'write'), (req, res) => {
  try {
    const { featureId, dependsOnFeatureId } = req.body;
    if (!featureId || !dependsOnFeatureId) {
      return res.status(400).json({ error: 'featureId and dependsOnFeatureId are required' });
    }
    if (featureId === dependsOnFeatureId) {
      return res.status(400).json({ error: 'A module cannot depend on itself', isCyclic: true });
    }

    const isCyclic = detectCircularDependency(featureId, dependsOnFeatureId);
    if (isCyclic) {
      return res.status(400).json({
        error: `Circular dependency detected: adding ${featureId} -> ${dependsOnFeatureId} creates an infinite loop`,
        isCyclic: true
      });
    }

    res.json({ success: true, isCyclic: false, message: 'Dependency link is valid and safe' });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to validate dependency', details: error.message });
  }
});

// 12. Configuration Versioning & Rollback
app.get('/api/admin/configuration/versions', requireAdminPermission('config', 'read'), (_req, res) => {
  try {
    const versions = db.prepare('SELECT * FROM configuration_versions ORDER BY created_at DESC LIMIT 20').all() as any[];
    res.json({ success: true, versions });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch configuration versions', details: error.message });
  }
});

app.post('/api/admin/configuration/create-snapshot', requireAdminPermission('config', 'write'), (req, res) => {
  try {
    const { adminId = 'usr_me', changeSummary } = req.body;
    if (!changeSummary || !changeSummary.trim()) {
      return res.status(400).json({ error: 'changeSummary is required to tag a configuration snapshot' });
    }

    const flags = db.prepare('SELECT * FROM feature_flags').all();
    const presets = db.prepare('SELECT * FROM user_experience_presets').all();
    const snapshot = {
      flags,
      presets,
      timestamp: Date.now()
    };

    const countRow = db.prepare('SELECT COUNT(*) as count FROM configuration_versions').get() as { count: number };
    const nextVer = countRow.count + 1;
    const id = `cfg_ver_${nextVer}`;
    const now = Date.now();

    db.prepare(`
      INSERT INTO configuration_versions (id, version_number, snapshot_json, created_by, change_summary, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(id, nextVer, JSON.stringify(snapshot), adminId, changeSummary.trim(), now);

    res.json({ success: true, versionId: id, versionNumber: nextVer, changeSummary });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to create configuration snapshot', details: error.message });
  }
});

app.post('/api/admin/configuration/rollback/:versionId', requireAdminPermission('config', 'write'), (req, res) => {
  try {
    const { versionId } = req.params;
    const { adminId = 'usr_me', reason } = req.body;
    if (!reason || !reason.trim()) {
      return res.status(400).json({ error: 'Mandatory reason is required for configuration rollback' });
    }

    const versionRow = db.prepare('SELECT * FROM configuration_versions WHERE id = ?').get(versionId) as any;
    if (!versionRow) {
      return res.status(404).json({ error: 'Configuration version not found' });
    }

    const snapshot = JSON.parse(versionRow.snapshot_json);
    const now = Date.now();

    if (snapshot.flags && Array.isArray(snapshot.flags)) {
      const updateStmt = db.prepare(`
        UPDATE feature_flags SET
          is_globally_enabled = ?,
          rollout_percentage = ?,
          allowed_roles_json = ?,
          allowed_tiers_json = ?,
          kill_switch_active = ?,
          kill_switch_reason = ?,
          updated_by = ?,
          updated_at = ?
        WHERE feature_id = ?
      `);

      for (const flag of snapshot.flags) {
        updateStmt.run(
          flag.is_globally_enabled,
          flag.rollout_percentage,
          flag.allowed_roles_json,
          flag.allowed_tiers_json,
          flag.kill_switch_active,
          flag.kill_switch_reason,
          `Rollback by ${adminId}`,
          now,
          flag.feature_id
        );
      }
    }

    // Record audit log
    db.prepare(`
      INSERT INTO configuration_audit_logs (
        id, admin_id, admin_name, action, target_type, target_id,
        before_value_json, after_value_json, reason, ip_address, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      `audit_${uuidv4().slice(0, 8)}`,
      adminId,
      'System Admin',
      'configuration_rollback',
      'platform',
      versionId,
      '{}',
      JSON.stringify({ restoredVersion: versionRow.version_number }),
      reason.trim(),
      req.ip || '127.0.0.1',
      now
    );

    res.json({ success: true, rolledBackToVersion: versionRow.version_number, reason });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to rollback configuration', details: error.message });
  }
});

// 13. Admin Roles & Permissions (RBAC) Management
app.get('/api/admin/roles', requireAdminPermission('users', 'read'), (_req, res) => {
  try {
    const roles = db.prepare('SELECT * FROM admin_roles ORDER BY hierarchy_level DESC').all() as any[];
    const permissions = db.prepare('SELECT * FROM admin_permissions').all() as any[];
    const assignments = db.prepare(`
      SELECT ara.*, u.name as user_name, u.avatar_url
      FROM admin_role_assignments ara
      LEFT JOIN users u ON ara.user_id = u.id
    `).all() as any[];

    const formatted = roles.map(r => ({
      ...r,
      permissions: permissions.filter(p => p.role_id === r.id),
      assignedUsers: assignments.filter(a => a.role_id === r.id)
    }));

    res.json({ success: true, roles: formatted });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch roles', details: error.message });
  }
});

app.post('/api/admin/roles/assign', requireAdminPermission('users', 'write'), (req, res) => {
  try {
    const { userId, roleId, assignedBy = 'usr_me' } = req.body;
    if (!userId || !roleId) {
      return res.status(400).json({ error: 'userId and roleId are required' });
    }

    const role = db.prepare('SELECT * FROM admin_roles WHERE id = ?').get(roleId);
    if (!role) {
      return res.status(404).json({ error: 'Role not found' });
    }

    db.prepare(`
      INSERT OR REPLACE INTO admin_role_assignments (user_id, role_id, assigned_by, assigned_at)
      VALUES (?, ?, ?, ?)
    `).run(userId, roleId, assignedBy, Date.now());

    res.json({ success: true, message: `Role ${roleId} assigned to ${userId}` });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to assign role', details: error.message });
  }
});

// 14. Feature Glossary & Learning System
app.get('/api/features/glossary', (_req, res) => {
  const glossary = [
    {
      term: 'Ontological Compatibility (HCM)',
      category: 'Social Discovery',
      definition: 'A multi-dimensional compatibility index (0–100%) computed from psychological values overlap, communication style harmony, and intellectual interests rather than superficial visual swiping.'
    },
    {
      term: 'Relationship Vault',
      category: 'Relationships',
      definition: 'A private personal relationship memory space to track important dates, boundaries, emotional history, and gift ideas. Stored strictly in encrypted client-side storage with zero admin visibility.'
    },
    {
      term: 'Before-You-Talk Briefing',
      category: 'Messaging',
      definition: 'An instant contextual memory card accessible directly in chat headers that briefs you on someone\'s boundaries, past commitments, and favorite topics before initiating a deep conversation.'
    },
    {
      term: 'Reality Classification',
      category: 'Identity Universe',
      definition: 'A boundary label assigned to personas and narrative worlds (Real Life, Cinematic Story, Fictional Alter-Ego, Professional) that isolates audiences and maintains privacy contexts.'
    },
    {
      term: 'The Unspoken Sanctuary',
      category: 'Emotional Layer',
      definition: 'A calm, reflective space comprising the Inner Room mood selector, Midnight Thoughts, curated Unopened Letters from the universe, and an unindexed Unsent Words notebook.'
    },
    {
      term: 'One Question, Two People',
      category: 'Games & Chemistry',
      definition: 'A mutual lock-and-reveal question game where two matched partners privately submit answers to a provocative prompt. Responses remain locked until both participate.'
    },
    {
      term: 'Titanium Glass & Obsidian Sanctuary',
      category: 'Design System',
      definition: 'Soulverse\'s signature visual language featuring deep black void backgrounds (#090A0E), silver metallic accents, subtle crimson ambient lighting, and frosted glass panels.'
    },
    {
      term: '1926 Safe NIMH Hotline',
      category: 'Mental Health Safety',
      definition: 'Instant direct dispatch and contact for free, confidential mental health crisis support, accessible across the app from header buttons and crisis triggers.'
    }
  ];

  res.json({ success: true, glossary });
});

// 15. "What's New in Soulverse" Announcements
app.get('/api/features/whats-new', (_req, res) => {
  const announcements = [
    {
      id: 'wn_control_layer',
      title: 'The Control Layer: Modular Personalization',
      tagline: 'Take total control of your experience with 5 signature presets, granular module toggles, and privacy controls.',
      date: 'November 2026',
      badge: 'Major Release',
      featuresIntroduced: ['feat_relationship_vault', 'feat_the_unspoken', 'feat_two_person_questions'],
      primaryActionRoute: 'control'
    },
    {
      id: 'wn_spotify_ambient',
      title: 'Ambient Spotify Integration & Profile Anthems',
      tagline: 'Stream ambient sanctuary audio through a titanium mini-dock and soundtrack your profile worlds.',
      date: 'November 2026',
      badge: 'Feature',
      featuresIntroduced: ['feat_spotify_ambient'],
      primaryActionRoute: 'music'
    },
    {
      id: 'wn_unspoken_sanctuary',
      title: 'The Unspoken: Inner Room & Midnight Thoughts',
      tagline: 'A gentle emotional discovery layer free of psychological traps, notifications, or manipulative engagement loops.',
      date: 'November 2026',
      badge: 'Sanctuary',
      featuresIntroduced: ['feat_the_unspoken'],
      primaryActionRoute: 'unspoken'
    }
  ];

  res.json({ success: true, announcements });
});

// 16. Remote Configuration JSON Tuner
app.put('/api/admin/features/:featureId/config', requireAdminPermission('config', 'write'), (req, res) => {
  try {
    const { featureId } = req.params;
    const { customConfig, reason = 'Remote configuration payload updated by admin' } = req.body;

    if (!customConfig || typeof customConfig !== 'object') {
      return res.status(400).json({ error: 'customConfig must be a valid JSON object' });
    }

    const currentFlag = db.prepare('SELECT * FROM feature_flags WHERE feature_id = ?').get(featureId) as any;
    if (!currentFlag) {
      return res.status(404).json({ error: 'Feature flag record not found' });
    }

    const now = Date.now();
    // Update feature flag with new JSON config
    db.prepare(`
      INSERT INTO user_feature_preferences (user_id, feature_id, custom_config_json, updated_at)
      VALUES ('global_default', ?, ?, ?)
      ON CONFLICT(user_id, feature_id) DO UPDATE SET
        custom_config_json = excluded.custom_config_json,
        updated_at = excluded.updated_at
    `).run(featureId, JSON.stringify(customConfig), now);

    // Audit log
    db.prepare(`
      INSERT INTO configuration_audit_logs (
        id, admin_id, admin_name, action, target_type, target_id,
        before_value_json, after_value_json, reason, ip_address, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      `audit_${uuidv4().slice(0, 8)}`,
      req.adminId || 'usr_me',
      'Config Admin',
      'remote_config_tune',
      'feature',
      featureId,
      '{}',
      JSON.stringify(customConfig),
      reason.trim(),
      req.ip || '127.0.0.1',
      now
    );

    res.json({ success: true, featureId, customConfig });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to update remote config', details: error.message });
  }
});

// 17. Subscription Entitlements Management
app.get('/api/admin/subscriptions/entitlements', requireAdminPermission('features', 'read'), (_req, res) => {
  try {
    const features = db.prepare('SELECT id, name, category, is_premium, default_state FROM feature_registry').all() as any[];
    const flags = db.prepare('SELECT feature_id, allowed_tiers_json FROM feature_flags').all() as any[];
    const flagMap = new Map(flags.map(f => [f.feature_id, JSON.parse(f.allowed_tiers_json || '[]')]));

    const matrix = features.map(f => ({
      featureId: f.id,
      name: f.name,
      category: f.category,
      isPremium: Boolean(f.is_premium),
      allowedTiers: flagMap.get(f.id) || ['free', 'plus', 'sovereign']
    }));

    res.json({
      success: true,
      tiers: [
        { id: 'free', name: 'Standard Soulverse', badge: 'Free', description: 'Essential social, platonic circles, and messaging' },
        { id: 'plus', name: 'Soulverse Plus', badge: 'Plus', description: 'Relationship Vault, Incognito mode, and unlimited personas' },
        { id: 'sovereign', name: 'Sovereign Circle', badge: 'VIP', description: 'Cinematic world audio hosting and advanced AI matching' }
      ],
      matrix
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch subscription entitlements', details: error.message });
  }
});

app.put('/api/admin/subscriptions/entitlements', requireAdminPermission('features', 'write'), (req, res) => {
  try {
    const { featureId, allowedTiers, reason = 'Subscription tier entitlements updated' } = req.body;
    if (!featureId || !Array.isArray(allowedTiers)) {
      return res.status(400).json({ error: 'featureId and allowedTiers array are required' });
    }

    const now = Date.now();
    db.prepare(`
      UPDATE feature_flags SET
        allowed_tiers_json = ?,
        updated_at = ?
      WHERE feature_id = ?
    `).run(JSON.stringify(allowedTiers), now, featureId);

    // Audit log
    db.prepare(`
      INSERT INTO configuration_audit_logs (
        id, admin_id, admin_name, action, target_type, target_id,
        before_value_json, after_value_json, reason, ip_address, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      `audit_${uuidv4().slice(0, 8)}`,
      req.adminId || 'usr_me',
      'Billing Admin',
      'entitlements_update',
      'feature',
      featureId,
      '{}',
      JSON.stringify(allowedTiers),
      reason.trim(),
      req.ip || '127.0.0.1',
      now
    );

    res.json({ success: true, featureId, allowedTiers });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to update entitlements', details: error.message });
  }
});

// 18. System Operations: WAL Checkpoint & Vacuum
app.post('/api/admin/system/wal-checkpoint', requireAdminPermission('system', 'write'), (_req, res) => {
  try {
    db.pragma('wal_checkpoint(TRUNCATE)');
    res.json({ success: true, message: 'SQLite WAL checkpoint completed with TRUNCATE' });
  } catch (error: any) {
    res.status(500).json({ error: 'WAL checkpoint failed', details: error.message });
  }
});

app.post('/api/admin/system/vacuum', requireAdminPermission('system', 'write'), (_req, res) => {
  try {
    db.pragma('vacuum');
    res.json({ success: true, message: 'SQLite database vacuumed and defragmented' });
  } catch (error: any) {
    res.status(500).json({ error: 'Database vacuum failed', details: error.message });
  }
});

// ============================================================================
// 19. USER CUSTOM AI HELPER & CHAT INTELLIGENCE (ChatGPT & Gemini BYOK)
// ============================================================================
app.post('/api/ai/custom-helper', async (req, res) => {
  try {
    const {
      provider = 'gemini',
      apiKey,
      model,
      action = 'analyze_chat',
      conversationHistory = [],
      draftText = '',
      partnerProfile = { name: 'Match' },
      persona = 'empath'
    } = req.body;

    const personaDescriptions: Record<string, string> = {
      wingman: 'You are a charming, witty wingman dating coach who highlights playful banter, humor, and casual confidence.',
      empath: 'You are a warm, emotionally attuned relationship counselor who listens for emotional nuances, vulnerability, and genuine connection.',
      deep_soul: 'You are an introspective intellectual analyst exploring shared passions, philosophical curiosity, and psychological compatibility.',
      minimalist: 'You are a concise, direct conversational assistant providing punchy, effortless responses without fluff.'
    };

    const activePersonaGuide = personaDescriptions[persona] || personaDescriptions.empath;

    // --- Action 1: Test Connection ---
    if (action === 'test_connection') {
      if (!apiKey || !apiKey.trim()) {
        return res.status(400).json({ error: 'API key is required to test live connection' });
      }

      if (provider === 'openai') {
        const testRes = await fetch('https://api.openai.com/v1/models', {
          headers: { Authorization: `Bearer ${apiKey.trim()}` }
        });
        if (!testRes.ok) {
          const errData: any = await testRes.json().catch(() => ({}));
          return res.status(400).json({
            success: false,
            error: errData?.error?.message || `OpenAI connection failed with HTTP ${testRes.status}`
          });
        }
        return res.json({ success: true, message: 'OpenAI ChatGPT API key verified and connected successfully!' });
      } else {
        // Gemini
        const testRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey.trim()}`);
        if (!testRes.ok) {
          const errData: any = await testRes.json().catch(() => ({}));
          return res.status(400).json({
            success: false,
            error: errData?.error?.message || `Google Gemini connection failed with HTTP ${testRes.status}`
          });
        }
        return res.json({ success: true, message: 'Google Gemini API key verified and connected successfully!' });
      }
    }

    // Prepare Prompts
    let systemPrompt = `You are Soulverse AI Helper. ${activePersonaGuide}\nYou are analyzing a social conversation for the user. Always respond in valid JSON format only.`;
    let userPrompt = '';

    if (action === 'analyze_chat') {
      const historyStr = conversationHistory.map((m: any) => `${m.sender || 'Participant'}: "${m.text || ''}"`).join('\n');
      userPrompt = `Analyze the conversation with ${partnerProfile.name || 'this person'}.\nConversation History:\n${historyStr || '(No messages yet)'}\n\nReturn a JSON object with this exact structure:
{
  "chemistryScore": <number between 40 and 98>,
  "vibe": "<2-4 word vibe description, e.g. Warm Curiosity & Banter>",
  "sentiment": "<1 sentence emotional summary>",
  "momentum": "<one of: surging | steady | needs_spark | unbalanced>",
  "subtext": "<what the other person seems genuinely excited about or subtly hinting at>",
  "greenFlags": ["<signal 1>", "<signal 2>"],
  "recommendedReplies": [
    { "type": "playful", "text": "<witty reply text>", "explanation": "<brief reason>" },
    { "type": "deep", "text": "<thoughtful reflective reply text>", "explanation": "<brief reason>" },
    { "type": "casual", "text": "<low-pressure natural reply text>", "explanation": "<brief reason>" }
  ],
  "suggestedTopics": ["<topic 1>", "<topic 2>", "<topic 3>"]
}`;
    } else if (action === 'polish_draft') {
      userPrompt = `The user is drafting a message to ${partnerProfile.name || 'their match'}.\nCurrent draft text: "${draftText}"\nProvide tone feedback and 2 polished variations.\nReturn a JSON object with this exact structure:
{
  "original": "${draftText.replace(/"/g, '\\"')}",
  "toneAssessment": "<critique of tone, e.g. friendly, slightly eager, confident>",
  "suggestions": [
    { "style": "Smooth & Engaging", "text": "<improved version 1>" },
    { "style": "Playful & Casual", "text": "<improved version 2>" }
  ]
}`;
    } else if (action === 'generate_icebreakers') {
      userPrompt = `Generate 3 bespoke openers for ${partnerProfile.name || 'this match'}.\nPartner details: Bio: "${partnerProfile.bio || ''}", Interests: "${(partnerProfile.interests || []).join(', ')}".\nReturn a JSON object with this exact structure:
{
  "openers": [
    { "style": "Playful Curiosity", "text": "<crafted opener 1>" },
    { "style": "Passions Connection", "text": "<crafted opener 2>" },
    { "style": "Direct & Warm", "text": "<crafted opener 3>" }
  ]
}`;
    }

    // --- Live API Execution if key is provided ---
    if (apiKey && apiKey.trim()) {
      try {
        if (provider === 'openai') {
          const apiModel = model || 'gpt-4o-mini';
          const openAiRes = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${apiKey.trim()}`
            },
            body: JSON.stringify({
              model: apiModel,
              response_format: { type: 'json_object' },
              messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
              ],
              temperature: 0.7
            })
          });

          if (openAiRes.ok) {
            const data: any = await openAiRes.json();
            const rawContent = data.choices?.[0]?.message?.content;
            if (rawContent) {
              const parsed = JSON.parse(rawContent);
              return res.json({ success: true, provider: 'openai', model: apiModel, result: parsed });
            }
          }
        } else {
          // Gemini
          const apiModel = model || 'gemini-1.5-flash';
          const geminiRes = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${apiModel}:generateContent?key=${apiKey.trim()}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [{
                  parts: [{ text: `${systemPrompt}\n\n${userPrompt}\nOutput ONLY JSON.` }]
                }],
                generationConfig: {
                  responseMimeType: 'application/json'
                }
              })
            }
          );

          if (geminiRes.ok) {
            const data: any = await geminiRes.json();
            const rawContent = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (rawContent) {
              const parsed = JSON.parse(rawContent);
              return res.json({ success: true, provider: 'gemini', model: apiModel, result: parsed });
            }
          }
        }
      } catch (liveErr) {
        console.warn('Live custom AI API call encountered error, falling back to simulated intelligence:', liveErr);
      }
    }

    // --- Intelligent Ontological Fallback (when no key or offline) ---
    const pName = partnerProfile.name || 'your match';
    const msgCount = conversationHistory.length;
    const baseScore = Math.min(95, 68 + (msgCount * 3));

    if (action === 'analyze_chat') {
      const fallbackResult = {
        chemistryScore: baseScore,
        vibe: msgCount > 3 ? 'Reciprocal Curiosity & Deep Resonance' : 'Fresh Spark & Warm Initiation',
        sentiment: `${pName} is actively engaged and responds with consistent warmth.`,
        momentum: msgCount > 6 ? 'surging' : 'steady',
        subtext: `${pName} seems particularly drawn to shared creative pursuits and appreciates when you ask open-ended questions about their world.`,
        greenFlags: [
          'Balanced response length and consistent curiosity',
          'Shared appreciation for thoughtful conversation over small talk',
          'Quick conversational pacing without long lapses'
        ],
        recommendedReplies: [
          {
            type: 'playful',
            text: `Careful, if we keep agreeing on everything like this, we might actually run out of things to debate. What's your most controversial music opinion?`,
            explanation: 'Sparks lighthearted banter and playful challenge'
          },
          {
            type: 'deep',
            text: `I was actually thinking about what you mentioned earlier. It takes a lot of self-awareness to see things that way—have you always felt like that?`,
            explanation: 'Validates their perspective and invites genuine emotional depth'
          },
          {
            type: 'casual',
            text: `That honestly made me smile. How has the rest of your week been treating you so far?`,
            explanation: 'Low pressure check-in that keeps the momentum warm and natural'
          }
        ],
        suggestedTopics: ['Favorite late night albums', 'Dream travel escapes', 'First impressions vs reality']
      };
      return res.json({ success: true, provider: 'simulated_helper', result: fallbackResult });
    } else if (action === 'polish_draft') {
      const fallbackPolish = {
        original: draftText,
        toneAssessment: 'Warm, sincere, and approachable. A slight trim makes it punchier.',
        suggestions: [
          {
            style: 'Smooth & Engaging',
            text: draftText.endsWith('?') ? draftText : `${draftText}. What do you think?`
          },
          {
            style: 'Playful & Casual',
            text: `Okay but hear me out—${draftText.toLowerCase()}`
          }
        ]
      };
      return res.json({ success: true, provider: 'simulated_helper', result: fallbackPolish });
    } else {
      const fallbackIcebreakers = {
        openers: [
          {
            style: 'Passions Connection',
            text: `I noticed you love ${(partnerProfile.interests?.[0] || 'music')}. I have to ask: what's the one song or place that never fails to reset your mind?`
          },
          {
            style: 'Playful Curiosity',
            text: `Two truths and a lie, or would you rather skip straight to your most absurd weekend story?`
          },
          {
            style: 'Direct & Warm',
            text: `Your profile gave off an genuinely calm energy. What’s something you’re looking forward to this month?`
          }
        ]
      };
      return res.json({ success: true, provider: 'simulated_helper', result: fallbackIcebreakers });
    }
  } catch (error: any) {
    res.status(500).json({ error: 'AI custom helper failed to process request', details: error.message });
  }
});

// ============================================================================
// 20. CENTRALIZED BYOAI & PERSONAL AI PROVIDER ARCHITECTURE
// ============================================================================

// --- 20.1 Supported Providers Catalog & Status ---
app.get('/api/ai/providers', (_req, res) => {
  try {
    const supported = AIProviderRegistry.getSupportedProviderList();
    const adminProviders = db.prepare('SELECT * FROM admin_ai_providers').all() as any[];
    const adminMap = new Map(adminProviders.map(p => [p.provider_id, p]));

    const catalog = supported.map(p => {
      const adminSetting = adminMap.get(p.id);
      return {
        id: p.id,
        name: p.name,
        defaultEndpoint: p.defaultEndpoint,
        isGloballyEnabled: adminSetting ? Boolean(adminSetting.is_globally_enabled) : true,
        byokAllowed: adminSetting ? Boolean(adminSetting.byok_allowed) : true,
        rateLimitRpm: adminSetting ? adminSetting.rate_limit_rpm : 60
      };
    });

    res.json({ success: true, providers: catalog });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to retrieve AI providers catalog', details: error.message });
  }
});

// --- 20.2 AI Model Registry ---
app.get('/api/ai/models', (_req, res) => {
  try {
    const models = AIModelRegistry.getAllModels();
    res.json({ success: true, models });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to retrieve AI models registry', details: error.message });
  }
});

// --- 20.3 User Connections: List Connections ---
app.get('/api/ai/connections', (req, res) => {
  try {
    const userId = (req.headers['x-user-id'] as string) || (req.query.userId as string) || 'usr_me';
    const rows = db.prepare(`
      SELECT id, user_id, provider, name, key_mask, custom_endpoint, default_model, is_enabled, created_at, updated_at, last_tested_at, last_status
      FROM user_ai_connections
      WHERE user_id = ?
      ORDER BY created_at ASC
    `).all(userId) as any[];

    const connections = rows.map(r => ({
      id: r.id,
      userId: r.user_id,
      provider: r.provider,
      name: r.name,
      keyMask: r.key_mask,
      customEndpoint: r.custom_endpoint,
      defaultModel: r.default_model,
      isEnabled: Boolean(r.is_enabled),
      createdAt: r.created_at,
      updatedAt: r.updated_at,
      lastTestedAt: r.last_tested_at,
      lastStatus: r.last_status || 'untested'
    }));

    res.json({ success: true, connections });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch AI connections', details: error.message });
  }
});

// --- 20.4 User Connections: Add Connection (Envelope Encrypted) ---
app.post('/api/ai/connections', async (req, res) => {
  try {
    const userId = (req.headers['x-user-id'] as string) || req.body.userId || 'usr_me';
    const { provider, name, apiKey, customEndpoint, defaultModel } = req.body;

    if (!provider || !name || !defaultModel) {
      return res.status(400).json({ error: 'provider, name, and defaultModel are required' });
    }

    const adapter = AIProviderRegistry.get(provider as AIProviderId);
    if (!adapter) {
      return res.status(400).json({ error: `Unsupported provider: ${provider}` });
    }

    // SSRF protection for custom endpoints
    if (customEndpoint) {
      const endpointValidation = validateCustomEndpoint(customEndpoint, provider === 'ollama');
      if (!endpointValidation.valid) {
        return res.status(400).json({ error: endpointValidation.error || 'Custom endpoint SSRF validation failed' });
      }
    }

    // For ollama or local models, apiKey can be empty or 'ollama-local'
    const keyToStore = (apiKey && apiKey.trim()) ? apiKey.trim() : (provider === 'ollama' ? 'ollama-local' : '');
    if (!keyToStore && provider !== 'ollama') {
      return res.status(400).json({ error: 'API key is required for this provider' });
    }

    const encrypted = encryptApiKey(keyToStore);
    const keyMask = maskApiKey(keyToStore);
    const id = `conn_${uuidv4().slice(0, 10)}`;
    const now = Date.now();

    db.prepare(`
      INSERT INTO user_ai_connections (
        id, user_id, provider, name, encrypted_api_key, key_iv, key_auth_tag, key_mask,
        custom_endpoint, default_model, is_enabled, created_at, updated_at, last_status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, 'untested')
    `).run(
      id,
      userId,
      provider,
      name.trim(),
      encrypted.ciphertext,
      encrypted.iv,
      encrypted.authTag,
      keyMask,
      customEndpoint ? customEndpoint.trim() : null,
      defaultModel.trim(),
      now,
      now
    );

    res.json({
      success: true,
      connection: {
        id,
        userId,
        provider,
        name: name.trim(),
        keyMask,
        customEndpoint: customEndpoint ? customEndpoint.trim() : undefined,
        defaultModel: defaultModel.trim(),
        isEnabled: true,
        createdAt: now,
        updatedAt: now,
        lastStatus: 'untested'
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to create AI connection', details: error.message });
  }
});

// --- 20.5 User Connections: Update Connection ---
app.put('/api/ai/connections/:id', async (req, res) => {
  try {
    const userId = (req.headers['x-user-id'] as string) || req.body.userId || 'usr_me';
    const { id } = req.params;
    const { name, apiKey, customEndpoint, defaultModel, isEnabled } = req.body;

    const existing = db.prepare('SELECT * FROM user_ai_connections WHERE id = ? AND user_id = ?').get(id, userId) as any;
    if (!existing) {
      return res.status(404).json({ error: 'Connection not found or unauthorized' });
    }

    const now = Date.now();
    let updatedEncrypted = existing.encrypted_api_key;
    let updatedIv = existing.key_iv;
    let updatedAuthTag = existing.key_auth_tag;
    let updatedKeyMask = existing.key_mask;

    if (apiKey && apiKey.trim()) {
      const enc = encryptApiKey(apiKey.trim());
      updatedEncrypted = enc.ciphertext;
      updatedIv = enc.iv;
      updatedAuthTag = enc.authTag;
      updatedKeyMask = maskApiKey(apiKey.trim());
    }

    let updatedEndpoint = existing.custom_endpoint;
    if (customEndpoint !== undefined) {
      if (customEndpoint && customEndpoint.trim()) {
        const val = validateCustomEndpoint(customEndpoint.trim(), existing.provider === 'ollama');
        if (!val.valid) {
          return res.status(400).json({ error: val.error || 'Custom endpoint SSRF validation failed' });
        }
        updatedEndpoint = customEndpoint.trim();
      } else {
        updatedEndpoint = null;
      }
    }

    const updatedName = name ? name.trim() : existing.name;
    const updatedModel = defaultModel ? defaultModel.trim() : existing.default_model;
    const updatedEnabled = isEnabled !== undefined ? (isEnabled ? 1 : 0) : existing.is_enabled;

    db.prepare(`
      UPDATE user_ai_connections SET
        name = ?,
        encrypted_api_key = ?,
        key_iv = ?,
        key_auth_tag = ?,
        key_mask = ?,
        custom_endpoint = ?,
        default_model = ?,
        is_enabled = ?,
        updated_at = ?
      WHERE id = ? AND user_id = ?
    `).run(
      updatedName,
      updatedEncrypted,
      updatedIv,
      updatedAuthTag,
      updatedKeyMask,
      updatedEndpoint,
      updatedModel,
      updatedEnabled,
      now,
      id,
      userId
    );

    res.json({
      success: true,
      connection: {
        id,
        userId,
        provider: existing.provider,
        name: updatedName,
        keyMask: updatedKeyMask,
        customEndpoint: updatedEndpoint,
        defaultModel: updatedModel,
        isEnabled: Boolean(updatedEnabled),
        createdAt: existing.created_at,
        updatedAt: now,
        lastTestedAt: existing.last_tested_at,
        lastStatus: existing.last_status
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to update AI connection', details: error.message });
  }
});

// --- 20.6 User Connections: Revoke & Delete ---
app.delete('/api/ai/connections/:id', (req, res) => {
  try {
    const userId = (req.headers['x-user-id'] as string) || (req.query.userId as string) || 'usr_me';
    const { id } = req.params;

    const existing = db.prepare('SELECT id FROM user_ai_connections WHERE id = ? AND user_id = ?').get(id, userId);
    if (!existing) {
      return res.status(404).json({ error: 'Connection not found' });
    }

    db.prepare('DELETE FROM user_ai_connections WHERE id = ? AND user_id = ?').run(id, userId);
    // Clean up task routes referencing this connection
    db.prepare('DELETE FROM user_ai_task_routing WHERE user_id = ? AND (connection_id = ? OR fallback_connection_id = ?)').run(userId, id, id);

    res.json({ success: true, message: 'AI Connection revoked and securely destroyed' });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to delete connection', details: error.message });
  }
});

// --- 20.7 User Connections: Test Live Connection ---
app.post('/api/ai/connections/:id/test', async (req, res) => {
  try {
    const userId = (req.headers['x-user-id'] as string) || req.body.userId || 'usr_me';
    const { id } = req.params;

    const conn = db.prepare('SELECT * FROM user_ai_connections WHERE id = ? AND user_id = ?').get(id, userId) as any;
    if (!conn) {
      return res.status(404).json({ error: 'Connection not found' });
    }

    const adapter = AIProviderRegistry.get(conn.provider);
    if (!adapter) {
      return res.status(400).json({ error: `Provider adapter '${conn.provider}' not available` });
    }

    const plainKey = decryptApiKey(conn.encrypted_api_key, conn.key_iv, conn.key_auth_tag);
    const result = await adapter.validateConnection(plainKey, conn.custom_endpoint);

    const now = Date.now();
    const newStatus = result.success ? 'online' : (result.error?.includes('Rate limit') ? 'rate_limited' : 'offline');

    db.prepare('UPDATE user_ai_connections SET last_tested_at = ?, last_status = ? WHERE id = ?').run(now, newStatus, id);

    res.json({
      success: result.success,
      status: newStatus,
      latencyMs: result.latencyMs,
      error: result.error
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Connection test encountered an error', details: error.message });
  }
});

// --- 20.8 User Connections: Discover Models ---
app.get('/api/ai/connections/:id/models', async (req, res) => {
  try {
    const userId = (req.headers['x-user-id'] as string) || (req.query.userId as string) || 'usr_me';
    const { id } = req.params;

    const conn = db.prepare('SELECT * FROM user_ai_connections WHERE id = ? AND user_id = ?').get(id, userId) as any;
    if (!conn) {
      return res.status(404).json({ error: 'Connection not found' });
    }

    const adapter = AIProviderRegistry.get(conn.provider);
    if (!adapter) {
      return res.status(400).json({ error: `Provider adapter '${conn.provider}' not found` });
    }

    const plainKey = decryptApiKey(conn.encrypted_api_key, conn.key_iv, conn.key_auth_tag);
    const discovered = await adapter.discoverModels(plainKey, conn.custom_endpoint);

    res.json({ success: true, models: discovered });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to discover models', details: error.message });
  }
});

// --- 20.9 Task-Specific AI Routing ---
app.get('/api/ai/routing', (req, res) => {
  try {
    const userId = (req.headers['x-user-id'] as string) || (req.query.userId as string) || 'usr_me';
    const routes = db.prepare('SELECT * FROM user_ai_task_routing WHERE user_id = ?').all(userId) as any[];

    const formatted = routes.map(r => ({
      taskKey: r.task_key,
      connectionId: r.connection_id,
      modelId: r.model_id,
      allowFallback: Boolean(r.allow_fallback),
      fallbackConnectionId: r.fallback_connection_id,
      fallbackModelId: r.fallback_model_id,
      updatedAt: r.updated_at
    }));

    res.json({ success: true, routes: formatted });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch task routing', details: error.message });
  }
});

app.post('/api/ai/routing', (req, res) => {
  try {
    const userId = (req.headers['x-user-id'] as string) || req.body.userId || 'usr_me';
    const { routes } = req.body;

    if (!Array.isArray(routes)) {
      return res.status(400).json({ error: 'routes array is required' });
    }

    const now = Date.now();
    const upsertStmt = db.prepare(`
      INSERT INTO user_ai_task_routing (
        user_id, task_key, connection_id, model_id, allow_fallback,
        fallback_connection_id, fallback_model_id, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(user_id, task_key) DO UPDATE SET
        connection_id = excluded.connection_id,
        model_id = excluded.model_id,
        allow_fallback = excluded.allow_fallback,
        fallback_connection_id = excluded.fallback_connection_id,
        fallback_model_id = excluded.fallback_model_id,
        updated_at = excluded.updated_at
    `);

    db.transaction(() => {
      for (const r of routes) {
        if (!r.taskKey || !r.connectionId || !r.modelId) continue;
        upsertStmt.run(
          userId,
          r.taskKey,
          r.connectionId,
          r.modelId,
          r.allowFallback ? 1 : 0,
          r.fallbackConnectionId || null,
          r.fallbackModelId || null,
          now
        );
      }
    })();

    res.json({ success: true, count: routes.length });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to update task routing', details: error.message });
  }
});

// --- 20.10 Context Permissions ---
app.get('/api/ai/permissions', (req, res) => {
  try {
    const userId = (req.headers['x-user-id'] as string) || (req.query.userId as string) || 'usr_me';
    const permissions = AIContextPermissionService.getPermissions(userId);
    res.json({ success: true, permissions });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch AI context permissions', details: error.message });
  }
});

app.put('/api/ai/permissions', (req, res) => {
  try {
    const userId = (req.headers['x-user-id'] as string) || req.body.userId || 'usr_me';
    const updated = AIContextPermissionService.updatePermissions(userId, req.body);
    res.json({ success: true, permissions: updated });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to update AI permissions', details: error.message });
  }
});

// --- 20.11 Usage & Spending Limits ---
app.get('/api/ai/usage', (req, res) => {
  try {
    const userId = (req.headers['x-user-id'] as string) || (req.query.userId as string) || 'usr_me';
    const limits = AIUsageTracker.getSpendingLimits(userId);

    const now = Date.now();
    const oneDayAgo = now - (24 * 60 * 60 * 1000);
    const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000);

    const dailyRow = db.prepare('SELECT SUM(estimated_cost_usd) as cost, COUNT(*) as count, SUM(total_tokens) as tokens FROM ai_usage_records WHERE user_id = ? AND created_at >= ?').get(userId, oneDayAgo) as any;
    const monthlyRow = db.prepare('SELECT SUM(estimated_cost_usd) as cost, COUNT(*) as count, SUM(total_tokens) as tokens FROM ai_usage_records WHERE user_id = ? AND created_at >= ?').get(userId, thirtyDaysAgo) as any;
    const allTimeRow = db.prepare('SELECT SUM(estimated_cost_usd) as cost, COUNT(*) as count, SUM(total_tokens) as tokens FROM ai_usage_records WHERE user_id = ?').get(userId) as any;

    const records = db.prepare(`
      SELECT id, provider, model, task_key, input_tokens, output_tokens, total_tokens, estimated_cost_usd, status, latency_ms, created_at, error_message
      FROM ai_usage_records
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 30
    `).all(userId) as any[];

    res.json({
      success: true,
      limits,
      summary: {
        dailyCost: dailyRow.cost || 0,
        monthlyCost: monthlyRow.cost || 0,
        allTimeCost: allTimeRow.cost || 0,
        totalTokens: allTimeRow.tokens || 0,
        totalRequests: allTimeRow.count || 0,
        dailyRequests: dailyRow.count || 0,
        monthlyRequests: monthlyRow.count || 0
      },
      records: records.map(r => ({
        id: r.id,
        provider: r.provider,
        model: r.model,
        taskKey: r.task_key,
        inputTokens: r.input_tokens,
        outputTokens: r.output_tokens,
        totalTokens: r.total_tokens,
        estimatedCostUsd: r.estimated_cost_usd,
        status: r.status,
        latencyMs: r.latency_ms,
        createdAt: r.created_at,
        errorMessage: r.error_message
      }))
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch AI usage telemetry', details: error.message });
  }
});

app.put('/api/ai/spending-limits', (req, res) => {
  try {
    const userId = (req.headers['x-user-id'] as string) || req.body.userId || 'usr_me';
    const updated = AIUsageTracker.updateSpendingLimits(userId, req.body);
    res.json({ success: true, limits: updated });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to update spending limits', details: error.message });
  }
});

// --- 20.12 Centralized Dispatch ---
app.post('/api/ai/dispatch', async (req, res) => {
  try {
    const userId = (req.headers['x-user-id'] as string) || req.body.userId || 'usr_me';
    const result = await AIRequestRouter.dispatch(userId, req.body);
    res.json({ success: true, result });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'AI dispatch failed' });
  }
});

// --- 20.13 SSE Streaming Endpoint ---
app.post('/api/ai/stream', async (req, res) => {
  const userId = (req.headers['x-user-id'] as string) || req.body.userId || 'usr_me';
  const { taskKey = 'general_assistant', connectionId, modelId, messages, systemPrompt, maxTokens, temperature, contextData } = req.body;

  // 1. Budget clearance check
  const clearance = AIUsageTracker.checkBudgetClearance(userId);
  if (!clearance.allowed) {
    return res.status(403).json({ error: clearance.reason || 'AI request budget clearance denied' });
  }

  // Set SSE response headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  try {
    // 2. Resolve connection
    const resolved = AIRequestRouter.resolveConnection(userId, taskKey as AITaskKey, connectionId, modelId);
    const conn = resolved.connection;
    const model = resolved.modelId;

    // 3. Permissions context filter
    const { sanitizedText } = AIContextPermissionService.sanitizeContext(userId, contextData);
    const fullMessages: AIMessage[] = [...(messages || [])];
    if (sanitizedText) {
      fullMessages.unshift({ role: 'system', content: `Permitted Context:\n${sanitizedText}` });
    }
    if (systemPrompt) {
      fullMessages.unshift({ role: 'system', content: systemPrompt });
    }

    const plainKey = decryptApiKey(conn.encrypted_api_key, conn.key_iv, conn.key_auth_tag);
    const adapter = AIProviderRegistry.get(conn.provider);
    if (!adapter) {
      res.write(`data: ${JSON.stringify({ error: `Adapter for ${conn.provider} not found` })}\n\n`);
      return res.end();
    }

    const response = await adapter.generateStream(
      plainKey,
      model,
      fullMessages,
      (chunk) => {
        res.write(`data: ${JSON.stringify(chunk)}\n\n`);
      },
      {
        temperature,
        maxTokens,
        customEndpoint: conn.custom_endpoint
      }
    );

    // Record usage
    AIUsageTracker.recordUsage(
      userId,
      conn.id,
      conn.provider,
      model,
      taskKey,
      response.inputTokens,
      response.outputTokens,
      response.estimatedCostUsd,
      'success',
      response.latencyMs
    );

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error: any) {
    res.write(`data: ${JSON.stringify({ error: error.message || 'Streaming failed' })}\n\n`);
    res.end();
  }
});

// --- 20.14 Multi-Turn Assistant Conversations ---
app.get('/api/ai/conversations', (req, res) => {
  try {
    const userId = (req.headers['x-user-id'] as string) || (req.query.userId as string) || 'usr_me';
    const conversations = db.prepare(`
      SELECT id, user_id, task_context, context_entity_id, title, custom_instructions, created_at, updated_at
      FROM ai_assistant_conversations
      WHERE user_id = ?
      ORDER BY updated_at DESC
    `).all(userId) as any[];

    res.json({ success: true, conversations });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch conversations', details: error.message });
  }
});

app.post('/api/ai/conversations', (req, res) => {
  try {
    const userId = (req.headers['x-user-id'] as string) || req.body.userId || 'usr_me';
    const { title = 'New Conversation', taskContext = 'general_assistant', contextEntityId = null, customInstructions = '' } = req.body;
    const id = `conv_${uuidv4().slice(0, 10)}`;
    const now = Date.now();

    db.prepare(`
      INSERT INTO ai_assistant_conversations (
        id, user_id, task_context, context_entity_id, title, custom_instructions, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, userId, taskContext, contextEntityId, title, customInstructions, now, now);

    res.json({ success: true, conversation: { id, userId, title, taskContext, contextEntityId, customInstructions, createdAt: now, updatedAt: now } });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to create conversation', details: error.message });
  }
});

app.get('/api/ai/conversations/:id/messages', (req, res) => {
  try {
    const userId = (req.headers['x-user-id'] as string) || (req.query.userId as string) || 'usr_me';
    const { id } = req.params;

    const conv = db.prepare('SELECT id FROM ai_assistant_conversations WHERE id = ? AND user_id = ?').get(id, userId);
    if (!conv) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    const messages = db.prepare(`
      SELECT id, conversation_id, role, content, provider, model, tokens_used, created_at
      FROM ai_assistant_messages
      WHERE conversation_id = ?
      ORDER BY created_at ASC
    `).all(id) as any[];

    res.json({ success: true, messages });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch messages', details: error.message });
  }
});

app.post('/api/ai/conversations/:id/messages', (req, res) => {
  try {
    const userId = (req.headers['x-user-id'] as string) || req.body.userId || 'usr_me';
    const { id } = req.params;
    const { role, content, provider, model, tokensUsed = 0 } = req.body;

    const conv = db.prepare('SELECT id FROM ai_assistant_conversations WHERE id = ? AND user_id = ?').get(id, userId);
    if (!conv) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    const msgId = `msg_${uuidv4().slice(0, 10)}`;
    const now = Date.now();

    db.prepare(`
      INSERT INTO ai_assistant_messages (id, conversation_id, role, content, provider, model, tokens_used, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(msgId, id, role, content, provider || null, model || null, tokensUsed, now);

    db.prepare('UPDATE ai_assistant_conversations SET updated_at = ? WHERE id = ?').run(now, id);

    res.json({ success: true, message: { id: msgId, conversationId: id, role, content, provider, model, tokensUsed, createdAt: now } });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to append message', details: error.message });
  }
});

app.delete('/api/ai/conversations/:id', (req, res) => {
  try {
    const userId = (req.headers['x-user-id'] as string) || (req.query.userId as string) || 'usr_me';
    const { id } = req.params;

    db.prepare('DELETE FROM ai_assistant_messages WHERE conversation_id = ?').run(id);
    db.prepare('DELETE FROM ai_assistant_conversations WHERE id = ? AND user_id = ?').run(id, userId);

    res.json({ success: true, message: 'Conversation deleted' });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to delete conversation', details: error.message });
  }
});

// --- 20.15 Admin AI Infrastructure Console ---
app.get('/api/admin/ai/infrastructure', requireAdminPermission('system', 'read'), (_req, res) => {
  try {
    const providers = db.prepare('SELECT * FROM admin_ai_providers ORDER BY provider_id ASC').all() as any[];

    // Aggregate platform telemetry (Zero user keys, zero conversation texts)
    const telemetry = db.prepare(`
      SELECT 
        COUNT(*) as total_requests,
        SUM(input_tokens) as total_input_tokens,
        SUM(output_tokens) as total_output_tokens,
        SUM(total_tokens) as total_tokens,
        SUM(estimated_cost_usd) as total_platform_cost_usd,
        AVG(latency_ms) as avg_latency_ms,
        COUNT(DISTINCT user_id) as active_users_count,
        SUM(CASE WHEN status = 'error' THEN 1 ELSE 0 END) as failure_count
      FROM ai_usage_records
    `).get() as any;

    const totalReqs = telemetry.total_requests || 0;
    const failures = telemetry.failure_count || 0;
    const failureRatePct = totalReqs > 0 ? Number(((failures / totalReqs) * 100).toFixed(2)) : 0;

    const activeConnectionsCount = (db.prepare('SELECT COUNT(*) as count FROM user_ai_connections WHERE is_enabled = 1').get() as any)?.count || 0;

    res.json({
      success: true,
      providers: providers.map(p => ({
        providerId: p.provider_id,
        name: p.name,
        isGloballyEnabled: Boolean(p.is_globally_enabled),
        byokAllowed: Boolean(p.byok_allowed),
        rateLimitRpm: p.rate_limit_rpm,
        allowedModels: JSON.parse(p.allowed_models_json || '[]'),
        updatedAt: p.updated_at
      })),
      telemetry: {
        totalRequests: totalReqs,
        totalTokens: telemetry.total_tokens || 0,
        totalInputTokens: telemetry.total_input_tokens || 0,
        totalOutputTokens: telemetry.total_output_tokens || 0,
        totalPlatformCostUsd: telemetry.total_platform_cost_usd || 0,
        avgLatencyMs: Math.round(telemetry.avg_latency_ms || 0),
        activeUsersCount: telemetry.active_users_count || 0,
        failureRatePct,
        activeConnectionsCount
      },
      models: AIModelRegistry.getAllModels()
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch admin AI infrastructure', details: error.message });
  }
});

app.put('/api/admin/ai/providers/:providerId', requireAdminPermission('system', 'write'), (req, res) => {
  try {
    const { providerId } = req.params;
    const { isGloballyEnabled, byokAllowed, rateLimitRpm, allowedModels } = req.body;

    const existing = db.prepare('SELECT * FROM admin_ai_providers WHERE provider_id = ?').get(providerId) as any;
    if (!existing) {
      return res.status(404).json({ error: 'Admin AI provider setting not found' });
    }

    const now = Date.now();
    const updatedGlobal = isGloballyEnabled !== undefined ? (isGloballyEnabled ? 1 : 0) : existing.is_globally_enabled;
    const updatedByok = byokAllowed !== undefined ? (byokAllowed ? 1 : 0) : existing.byok_allowed;
    const updatedRpm = rateLimitRpm !== undefined ? Number(rateLimitRpm) : existing.rate_limit_rpm;
    const updatedModels = allowedModels !== undefined ? JSON.stringify(allowedModels) : existing.allowed_models_json;

    db.prepare(`
      UPDATE admin_ai_providers SET
        is_globally_enabled = ?,
        byok_allowed = ?,
        rate_limit_rpm = ?,
        allowed_models_json = ?,
        updated_at = ?
      WHERE provider_id = ?
    `).run(updatedGlobal, updatedByok, updatedRpm, updatedModels, now, providerId);

    // Audit log
    db.prepare(`
      INSERT INTO configuration_audit_logs (
        id, admin_id, admin_name, action, target_type, target_id,
        before_value_json, after_value_json, reason, ip_address, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      `audit_${uuidv4().slice(0, 8)}`,
      req.adminId || 'usr_me',
      'System Admin',
      'ai_provider_configure',
      'ai_provider',
      providerId,
      JSON.stringify(existing),
      JSON.stringify({ isGloballyEnabled: updatedGlobal, byokAllowed: updatedByok, rateLimitRpm: updatedRpm, allowedModels }),
      `Updated AI provider policy for ${providerId}`,
      req.ip || '127.0.0.1',
      now
    );

    res.json({ success: true, providerId });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to update admin AI provider', details: error.message });
  }
});

// ============================================================================
// 21. QUOTE DISCOVERY & INFINITE QUOTE EXPERIENCE
// ============================================================================

// --- 21.1 Discover Next Quote (Filtered & Unseen) ---
app.get('/api/quotes/discover', async (req, res) => {
  try {
    const userId = (req.headers['x-user-id'] as string) || (req.query.userId as string) || 'usr_me';
    const quote = await QuoteDiscoveryService.discoverNextQuote(userId);
    res.json({ success: true, quote });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to discover quote' });
  }
});

// --- 21.2 Infinite-Scroll Feed ---
app.get('/api/quotes/feed', (req, res) => {
  try {
    const userId = (req.headers['x-user-id'] as string) || (req.query.userId as string) || 'usr_me';
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = Math.min(50, parseInt(req.query.limit as string, 10) || 12);
    const category = req.query.category as QuoteCategoryKey | undefined;

    const result = QuoteDiscoveryService.getFeed(userId, page, limit, category);
    res.json({ success: true, ...result, page, limit });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch quote feed', details: error.message });
  }
});

// --- 21.3 Quote Categories Catalog ---
app.get('/api/quotes/categories', (_req, res) => {
  try {
    const categoryCounts = db.prepare(`
      SELECT category, COUNT(*) as count FROM quotes
      WHERE is_verified = 1 AND is_moderated = 1
      GROUP BY category
    `).all() as Array<{ category: string; count: number }>;

    const countMap = new Map(categoryCounts.map(c => [c.category, c.count]));

    const categories = Object.values(QUOTE_CATEGORIES).map(cat => ({
      ...cat,
      quoteCount: countMap.get(cat.key) || 0
    }));

    res.json({ success: true, categories });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to retrieve categories', details: error.message });
  }
});

// --- 21.4 Daily Featured Quote ---
app.get('/api/quotes/daily', (req, res) => {
  try {
    const dateStr = req.query.date as string | undefined;
    const daily = QuoteDiscoveryService.getDailyQuote(dateStr);
    res.json({ success: true, daily });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to retrieve daily quote' });
  }
});

// --- 21.5 Daily Quotes History Archive ---
app.get('/api/quotes/daily/history', (req, res) => {
  try {
    const limit = Math.min(30, parseInt(req.query.limit as string, 10) || 14);
    const rows = db.prepare(`
      SELECT dq.date_string, dq.reflection_question, q.id, q.text, q.author, q.category, q.attribution
      FROM daily_quotes dq
      JOIN quotes q ON dq.quote_id = q.id
      ORDER BY dq.date_string DESC
      LIMIT ?
    `).all(limit) as any[];

    const history = rows.map(r => ({
      date: r.date_string,
      reflectionQuestion: r.reflection_question,
      quote: {
        id: r.id,
        text: r.text,
        author: r.author,
        category: r.category,
        attribution: r.attribution
      }
    }));

    res.json({ success: true, history });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch daily history', details: error.message });
  }
});

// --- 21.6 Quote Interactions: Like, Save, Skip ---
app.post('/api/quotes/:id/interact', (req, res) => {
  try {
    const userId = (req.headers['x-user-id'] as string) || req.body.userId || 'usr_me';
    const { id } = req.params;
    const { type } = req.body;

    if (!type || !['like', 'save', 'skip'].includes(type)) {
      return res.status(400).json({ error: 'Valid interaction type (like, save, skip) is required' });
    }

    const result = QuoteDiscoveryService.toggleInteraction(userId, id, type);
    res.json({ success: true, ...result, quoteId: id, type });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to record interaction', details: error.message });
  }
});

// --- 21.7 User Saved Quotes Collection ---
app.get('/api/quotes/saved', (req, res) => {
  try {
    const userId = (req.headers['x-user-id'] as string) || (req.query.userId as string) || 'usr_me';
    const quotes = QuoteDiscoveryService.getSavedQuotes(userId);
    res.json({ success: true, quotes });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch saved quotes', details: error.message });
  }
});

// --- 21.8 User Personalization Preferences ---
app.get('/api/quotes/preferences', (req, res) => {
  try {
    const userId = (req.headers['x-user-id'] as string) || (req.query.userId as string) || 'usr_me';
    const preferences = QuoteDiscoveryService.getUserPreferences(userId);
    res.json({ success: true, preferences });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch quote preferences', details: error.message });
  }
});

app.put('/api/quotes/preferences', (req, res) => {
  try {
    const userId = (req.headers['x-user-id'] as string) || req.body.userId || 'usr_me';
    const preferences = QuoteDiscoveryService.updateUserPreferences(userId, req.body);
    res.json({ success: true, preferences });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to update preferences', details: error.message });
  }
});

// --- 21.9 Clear User History ---
app.post('/api/quotes/history/clear', (req, res) => {
  try {
    const userId = (req.headers['x-user-id'] as string) || req.body.userId || 'usr_me';
    QuoteDiscoveryService.clearHistory(userId);
    res.json({ success: true, message: 'Quote history cleared successfully' });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to clear history', details: error.message });
  }
});

// --- 21.10 Report Quote ---
app.post('/api/quotes/:id/report', (req, res) => {
  try {
    const { id } = req.params;
    const { reason = 'Unspecified' } = req.body;
    QuoteDiscoveryService.reportQuote(id, reason);
    res.json({ success: true, message: 'Quote reported for review' });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to report quote', details: error.message });
  }
});

// --- 21.11 Admin Quote Management ---
app.get('/api/admin/quotes', requireAdminPermission('features', 'read'), (req, res) => {
  try {
    const { category, search, provider, isVerified, isModerated, page, limit } = req.query;
    const result = QuoteDiscoveryService.adminGetQuotes({
      category: category as string,
      search: search as string,
      provider: provider as string,
      isVerified: isVerified !== undefined ? isVerified === 'true' : undefined,
      isModerated: isModerated !== undefined ? isModerated === 'true' : undefined,
      page: page ? parseInt(page as string, 10) : undefined,
      limit: limit ? parseInt(limit as string, 10) : undefined
    });
    res.json({ success: true, ...result });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to query admin quotes', details: error.message });
  }
});

app.post('/api/admin/quotes', requireAdminPermission('features', 'write'), (req, res) => {
  try {
    const { text, author, category, tags, attribution, sourceUrl } = req.body;
    if (!text || !author || !category) {
      return res.status(400).json({ error: 'text, author, and category are required' });
    }
    const created = QuoteDiscoveryService.adminCreateQuote({ text, author, category, tags, attribution, sourceUrl });
    res.json({ success: true, quote: created });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to create quote', details: error.message });
  }
});

app.put('/api/admin/quotes/:id', requireAdminPermission('features', 'write'), (req, res) => {
  try {
    const { id } = req.params;
    QuoteDiscoveryService.adminUpdateQuote(id, req.body);
    res.json({ success: true, id });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to update quote', details: error.message });
  }
});

app.delete('/api/admin/quotes/:id', requireAdminPermission('features', 'write'), (req, res) => {
  try {
    const { id } = req.params;
    QuoteDiscoveryService.adminDeleteQuote(id);
    res.json({ success: true, message: 'Quote permanently deleted' });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to delete quote', details: error.message });
  }
});

app.get('/api/admin/quotes/providers', requireAdminPermission('system', 'read'), (_req, res) => {
  try {
    const providers = db.prepare('SELECT * FROM admin_quote_providers ORDER BY provider_id ASC').all() as any[];
    res.json({
      success: true,
      providers: providers.map(p => ({
        providerId: p.provider_id,
        name: p.name,
        baseUrl: p.base_url,
        isEnabled: Boolean(p.is_enabled),
        rateLimitRpm: p.rate_limit_rpm,
        lastFetchedAt: p.last_fetched_at,
        healthStatus: p.health_status,
        totalFetched: p.total_fetched,
        failureCount: p.failure_count,
        updatedAt: p.updated_at
      }))
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch quote providers', details: error.message });
  }
});

app.put('/api/admin/quotes/providers/:id', requireAdminPermission('system', 'write'), (req, res) => {
  try {
    const { id } = req.params;
    const { isEnabled, rateLimitRpm } = req.body;
    const now = Date.now();

    db.prepare(`
      UPDATE admin_quote_providers SET
        is_enabled = COALESCE(?, is_enabled),
        rate_limit_rpm = COALESCE(?, rate_limit_rpm),
        updated_at = ?
      WHERE provider_id = ?
    `).run(
      isEnabled !== undefined ? (isEnabled ? 1 : 0) : null,
      rateLimitRpm !== undefined ? Number(rateLimitRpm) : null,
      now,
      id
    );

    res.json({ success: true, providerId: id });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to update quote provider', details: error.message });
  }
});

app.post('/api/admin/quotes/providers/:id/fetch', requireAdminPermission('system', 'write'), async (req, res) => {
  try {
    const { id } = req.params;
    const limit = parseInt(req.body.limit, 10) || 30;
    const inserted = await QuoteProviderRegistry.fetchAndIngestBatch(id, limit);
    res.json({ success: true, providerId: id, inserted });
  } catch (error: any) {
    res.status(500).json({ error: 'Manual batch ingestion failed', details: error.message });
  }
});

app.post('/api/admin/quotes/deduplicate', requireAdminPermission('system', 'write'), (_req, res) => {
  try {
    const result = QuoteDiscoveryService.adminDeduplicate();
    res.json({ success: true, ...result });
  } catch (error: any) {
    res.status(500).json({ error: 'Deduplication failed', details: error.message });
  }
});

app.post('/api/admin/quotes/daily', requireAdminPermission('features', 'write'), (req, res) => {
  try {
    const { dateStr, quoteId, reflectionQuestion } = req.body;
    if (!dateStr || !quoteId) {
      return res.status(400).json({ error: 'dateStr and quoteId are required' });
    }
    const daily = QuoteDiscoveryService.adminSetDailyQuote(dateStr, quoteId, reflectionQuestion);
    res.json({ success: true, daily });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to assign daily quote', details: error.message });
  }
});

// =========================================================================
// SECTION 22: TELEGRAM PREMIUM EMOJIS (Zulut30/premium-telegram-emoji)
// =========================================================================
let telegramCuratedEmojis: any[] = [];
let telegramEmojiStyleProfile: any = null;

try {
  const curatedPath = path.resolve(__dirname, 'data/telegramEmojiCurated.json');
  if (fs.existsSync(curatedPath)) {
    telegramCuratedEmojis = JSON.parse(fs.readFileSync(curatedPath, 'utf-8'));
  }
  const stylePath = path.resolve(__dirname, 'data/emoji-style.json');
  if (fs.existsSync(stylePath)) {
    telegramEmojiStyleProfile = JSON.parse(fs.readFileSync(stylePath, 'utf-8'));
  }
} catch (err) {
  console.warn('Failed to load local Telegram emoji data:', err);
}

app.get('/api/telegram-emojis/style', (_req, res) => {
  res.json({
    success: true,
    profile: telegramEmojiStyleProfile || {
      schema_version: 1,
      style: 'minimal',
      primary_pack: 'sfsymbols',
      secondary_packs: ['Animated News Emoji', 'Animated App Icons', 'CuteEmoji', 'TopicIcons', 'NeonEmoji'],
      roles: {}
    }
  });
});

app.get('/api/telegram-emojis/curated', (req, res) => {
  const { group, style } = req.query;
  let items = telegramCuratedEmojis;
  if (group && group !== 'all') {
    items = items.filter(i => i.group === group);
  }
  if (style && style !== 'all') {
    items = items.filter(i => i.style === style);
  }
  res.json({ success: true, total: items.length, items });
});

app.get('/api/telegram-emojis/search', (req, res) => {
  const q = ((req.query.q as string) || '').trim().toLowerCase();
  const style = req.query.style as string | undefined;
  const group = req.query.group as string | undefined;
  const limit = Math.min(100, parseInt((req.query.limit as string) || '50', 10));

  let pool = telegramCuratedEmojis;
  const results = [];

  for (const item of pool) {
    if (style && style !== 'all' && item.style !== style) continue;
    if (group && group !== 'all' && item.group !== group) continue;
    if (q) {
      const searchTokens = (item.search || `${item.name} ${item.key}`).toLowerCase();
      if (!searchTokens.includes(q)) continue;
    }
    results.push(item);
    if (results.length >= limit) break;
  }

  res.json({ success: true, count: results.length, results });
});

app.get('/api/telegram-emojis/:id', (req, res) => {
  const { id } = req.params;
  const found = telegramCuratedEmojis.find(e => e.id === id);
  if (!found) {
    return res.status(404).json({ error: 'Emoji not found in catalog' });
  }
  res.json({ success: true, emoji: found });
});

// -------------------------------------------------------------
// FRIENDS REAL EVENTS & EXPERIENCES
// -------------------------------------------------------------
app.get('/api/v1/events', (req, res) => {
  try {
    const userId = (req.query.userId as string) || 'usr_me';
    const type = req.query.type as string | undefined;

    let sql = 'SELECT * FROM friends_events';
    const params: any[] = [];
    if (type && type !== 'all') {
      sql += ' WHERE type = ?';
      params.push(type);
    }
    sql += ' ORDER BY created_at DESC';

    const events = db.prepare(sql).all(...params) as any[];

    // Fetch user RSVPs
    const rsvpRows = db.prepare('SELECT event_id, status FROM friends_event_rsvps WHERE user_id = ?').all(userId) as any[];
    const rsvpMap = new Map(rsvpRows.map(r => [r.event_id, r.status]));

    const result = events.map(e => ({
      id: e.id,
      title: e.title,
      type: e.type,
      format: e.format,
      date: e.date,
      time: e.time,
      locationName: e.location_name,
      locationCity: e.location_city,
      exactAddressHidden: Boolean(e.exact_address_hidden),
      coverImage: e.cover_image,
      description: e.description,
      hostName: e.host_name,
      hostAvatar: e.host_avatar,
      hostVerified: Boolean(e.host_verified),
      category: e.category,
      tags: JSON.parse(e.tags_json || '[]'),
      capacity: e.capacity,
      attendeesCount: e.attendees_count,
      rsvpStatus: rsvpMap.get(e.id) || 'none',
      rules: JSON.parse(e.rules_json || '[]'),
      syncRoomId: e.sync_room_id
    }));

    res.json({ success: true, events: result });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/v1/events', (req, res) => {
  try {
    const {
      title,
      type = 'public_gathering',
      format = 'physical',
      date = 'Upcoming Weekend',
      time = '7:00 PM – 9:30 PM',
      locationName = 'Public Gathering Point',
      locationCity = 'Colombo',
      exactAddressHidden = true,
      coverImage = 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=800&q=80',
      description,
      category = 'Social & Conversation',
      tags = ['Community', 'Connection'],
      capacity = 20,
      rules = ['Warm curiosity', 'Respect boundaries'],
      syncRoomId = null,
      hostId = 'usr_me',
      hostName = 'Kavindu Senanayake',
      hostAvatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'
    } = req.body;

    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description are required' });
    }

    const eventId = `evt_${Date.now()}`;
    const now = Date.now();

    db.prepare(`
      INSERT INTO friends_events (
        id, title, type, format, date, time, location_name, location_city,
        exact_address_hidden, cover_image, description, host_id, host_name,
        host_avatar, host_verified, category, tags_json, capacity, attendees_count,
        rules_json, sync_room_id, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?, 1, ?, ?, ?)
    `).run(
      eventId,
      title,
      type,
      format,
      date,
      time,
      locationName,
      locationCity,
      exactAddressHidden ? 1 : 0,
      coverImage,
      description,
      hostId,
      hostName,
      hostAvatar,
      category,
      JSON.stringify(tags),
      capacity,
      JSON.stringify(rules),
      syncRoomId,
      now
    );

    // Host automatically attends
    db.prepare(`
      INSERT INTO friends_event_rsvps (event_id, user_id, status, created_at)
      VALUES (?, ?, 'attending', ?)
    `).run(eventId, hostId, now);

    const newEvent = {
      id: eventId,
      title,
      type,
      format,
      date,
      time,
      locationName,
      locationCity,
      exactAddressHidden: Boolean(exactAddressHidden),
      coverImage,
      description,
      hostName,
      hostAvatar,
      hostVerified: true,
      category,
      tags,
      capacity,
      attendeesCount: 1,
      rsvpStatus: 'attending',
      rules,
      syncRoomId
    };

    res.status(201).json({ success: true, event: newEvent });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/v1/events/:id/rsvp', (req, res) => {
  try {
    const { id } = req.params;
    const userId = (req.body.userId as string) || 'usr_me';

    const event = db.prepare('SELECT * FROM friends_events WHERE id = ?').get(id) as any;
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const existingRsvp = db.prepare('SELECT status FROM friends_event_rsvps WHERE event_id = ? AND user_id = ?').get(id, userId) as any;
    let nextStatus = 'attending';
    let countDelta = 1;

    if (existingRsvp && existingRsvp.status === 'attending') {
      nextStatus = 'none';
      countDelta = -1;
      db.prepare('DELETE FROM friends_event_rsvps WHERE event_id = ? AND user_id = ?').run(id, userId);
    } else {
      nextStatus = 'attending';
      countDelta = existingRsvp ? 0 : 1;
      db.prepare(`
        INSERT OR REPLACE INTO friends_event_rsvps (event_id, user_id, status, created_at)
        VALUES (?, ?, 'attending', ?)
      `).run(id, userId, Date.now());
    }

    db.prepare('UPDATE friends_events SET attendees_count = MAX(0, attendees_count + ?) WHERE id = ?').run(countDelta, id);
    const updated = db.prepare('SELECT attendees_count FROM friends_events WHERE id = ?').get(id) as any;

    res.json({
      success: true,
      eventId: id,
      rsvpStatus: nextStatus,
      attendeesCount: updated.attendees_count
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// USER IDENTITY & BIOMETRIC PHOTO VERIFICATION
// -------------------------------------------------------------
app.get('/api/v1/users/:id/verification', (req, res) => {
  try {
    const { id } = req.params;
    const user = db.prepare('SELECT id, name, is_verified FROM users WHERE id = ?').get(id) as any;
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({
      success: true,
      userId: id,
      isVerified: Boolean(user.is_verified),
      verificationMethod: user.is_verified ? 'biometric_liveness_check' : null
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/v1/users/:id/verification', (req, res) => {
  try {
    const { id } = req.params;
    const { verified = true } = req.body;

    const user = db.prepare('SELECT id FROM users WHERE id = ?').get(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    db.prepare('UPDATE users SET is_verified = ? WHERE id = ?').run(verified ? 1 : 0, id);

    res.json({
      success: true,
      userId: id,
      isVerified: Boolean(verified),
      verifiedAt: Date.now(),
      badgeType: 'real_human_biometric'
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// USER DISCOVERY & DIRECTORY
// -------------------------------------------------------------
app.get('/api/v1/users', (req, res) => {
  try {
    const q = ((req.query.q as string) || '').trim().toLowerCase();
    const limit = Math.min(50, parseInt((req.query.limit as string) || '20', 10));
    const currentUserId = (req.headers['x-user-id'] as string) || (req.query.currentUserId as string) || (req.query.userId as string);

    let users = db.prepare(`
      SELECT u.id, u.name, u.username, u.avatar_url, u.is_verified, u.last_seen_at, u.status_text,
             ui.display_title, ui.description, ui.personality_traits, ui.interests, ui.skills, ui.cover_image_url
      FROM users u
      LEFT JOIN user_identities ui ON u.id = ui.user_id AND (ui.is_primary = 1 OR ui.classification = 'real_identity')
    `).all() as any[];

    // 1. Exclude suspended accounts from public discovery
    users = users.filter(u => !u.status_text || !u.status_text.startsWith('[SUSPENDED'));

    // 2. Exclude accounts with bidirectional block relationships
    if (currentUserId) {
      users = users.filter(u => !checkUserBlocked(currentUserId, u.id));
    }

    if (q) {
      users = users.filter(u => 
        u.name.toLowerCase().includes(q) || 
        u.username.toLowerCase().includes(q) ||
        (u.display_title && u.display_title.toLowerCase().includes(q)) ||
        (u.description && u.description.toLowerCase().includes(q))
      );
    }

    const result = users.slice(0, limit).map(u => ({
      id: u.id,
      name: u.name,
      username: u.username,
      avatar: u.avatar_url,
      avatarUrl: u.avatar_url,
      isVerified: Boolean(u.is_verified),
      lastSeenAt: u.last_seen_at,
      statusText: u.status_text,
      title: u.display_title || 'Soulverse Member',
      bio: u.description || 'Exploring thoughtful connections.',
      coverImage: u.cover_image_url || 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80',
      personalityTraits: JSON.parse(u.personality_traits || '["Thoughtful", "Creative"]'),
      interests: JSON.parse(u.interests || '["Reading", "Philosophy"]'),
      skills: JSON.parse(u.skills || '["Conversation"]')
    }));

    res.json({ success: true, count: result.length, users: result });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/v1/users/:id', (req, res) => {
  try {
    const { id } = req.params;
    const viewerId = (req.headers['x-user-id'] as string) || (req.query.viewerId as string) || (req.query.userId as string);

    if (viewerId && checkUserBlocked(viewerId, id)) {
      return res.status(403).json({ error: 'Access denied: relationship blocked', code: 'RELATIONSHIP_BLOCKED' });
    }

    const u = db.prepare(`
      SELECT u.id, u.name, u.username, u.avatar_url, u.is_verified, u.last_seen_at, u.status_text,
             ui.display_title, ui.description, ui.personality_traits, ui.interests, ui.skills, ui.cover_image_url
      FROM users u
      LEFT JOIN user_identities ui ON u.id = ui.user_id AND (ui.is_primary = 1 OR ui.classification = 'real_identity')
      WHERE u.id = ?
    `).get(id) as any;

    if (!u) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (u.status_text && u.status_text.startsWith('[SUSPENDED')) {
      return res.status(403).json({ error: 'This user account is suspended by moderation team', code: 'ACCOUNT_SUSPENDED' });
    }

    res.json({
      success: true,
      user: {
        id: u.id,
        name: u.name,
        username: u.username,
        avatar: u.avatar_url,
        avatarUrl: u.avatar_url,
        isVerified: Boolean(u.is_verified),
        lastSeenAt: u.last_seen_at,
        statusText: u.status_text,
        title: u.display_title || 'Soulverse Member',
        bio: u.description || 'Exploring thoughtful connections.',
        coverImage: u.cover_image_url || 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80',
        personalityTraits: JSON.parse(u.personality_traits || '["Thoughtful", "Creative"]'),
        interests: JSON.parse(u.interests || '["Reading", "Philosophy"]'),
        skills: JSON.parse(u.skills || '["Conversation"]')
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================================================
// SOUL PROMPTS & RESONANCE SANCTUARY (DAILY INTROSPECTION & EMOTIONAL COMPATIBILITY)
// ============================================================================

app.get('/api/v1/soul-prompts/today', (req, res) => {
  try {
    const userId = (req.headers['x-user-id'] as string) || (req.query.userId as string) || 'usr_me';
    const data = SoulPromptsService.getTodayPrompt(userId);
    res.json({ success: true, ...data });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch today prompt' });
  }
});

app.get('/api/v1/soul-prompts/all', (_req, res) => {
  try {
    const prompts = SoulPromptsService.getAllPrompts();
    res.json({ success: true, prompts });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch prompts' });
  }
});

app.post('/api/v1/soul-prompts/:promptId/respond', (req, res) => {
  try {
    const { promptId } = req.params;
    const userId = (req.headers['x-user-id'] as string) || (req.query.userId as string) || 'usr_me';
    const { responseText, visibility, moodTag, customAlias } = req.body;

    if (!responseText || typeof responseText !== 'string' || responseText.trim().length < 5) {
      return res.status(400).json({ error: 'Response must be at least 5 characters' });
    }

    const response = SoulPromptsService.respondToPrompt(promptId, userId, {
      responseText,
      visibility,
      moodTag,
      customAlias
    });

    res.json({ success: true, response });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to save prompt response' });
  }
});

app.get('/api/v1/soul-prompts/:promptId/community', (req, res) => {
  try {
    const { promptId } = req.params;
    const userId = (req.headers['x-user-id'] as string) || (req.query.userId as string) || 'usr_me';
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;

    const responses = SoulPromptsService.getCommunityResponses(promptId, userId, limit);
    res.json({ success: true, responses });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch community responses' });
  }
});

app.post('/api/v1/soul-prompts/responses/:responseId/resonate', (req, res) => {
  try {
    const { responseId } = req.params;
    const userId = (req.headers['x-user-id'] as string) || (req.query.userId as string) || 'usr_me';
    const { reactionType } = req.body;

    if (!reactionType || !['felt_deeply', 'mind_shifted', 'inspired'].includes(reactionType)) {
      return res.status(400).json({ error: 'Invalid resonance reaction type' });
    }

    const result = SoulPromptsService.submitResonance(responseId, userId, reactionType);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to submit resonance' });
  }
});

app.get('/api/v1/soul-prompts/my-journal', (req, res) => {
  try {
    const userId = (req.headers['x-user-id'] as string) || (req.query.userId as string) || 'usr_me';
    const journal = SoulPromptsService.getUserJournal(userId);
    res.json({ success: true, ...journal });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch user journal' });
  }
});

app.get('/api/v1/soul-prompts/compatibility/:targetUserId', (req, res) => {
  try {
    const { targetUserId } = req.params;
    const userId = (req.headers['x-user-id'] as string) || (req.query.userId as string) || 'usr_me';

    if (userId === targetUserId) {
      return res.status(400).json({ error: 'Cannot compute compatibility with yourself' });
    }

    const insight = SoulPromptsService.computeCompatibility(userId, targetUserId);
    res.json({ success: true, ...insight });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to compute compatibility' });
  }
});

app.post('/api/v1/soul-prompts/responses/:responseId/icebreaker', (req, res) => {
  try {
    const { responseId } = req.params;
    const userId = (req.headers['x-user-id'] as string) || (req.query.userId as string) || 'usr_me';

    const icebreaker = SoulPromptsService.createPromptIcebreaker(responseId, userId);
    res.json({ success: true, ...icebreaker });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to create prompt icebreaker' });
  }
});

// ============================================================================
// MASTER PROMPT 04: SOCIAL DISCOVERY, FRIENDSHIP AND DATING ENGINE API
// ============================================================================

// 1. Get Matching Terminology & Conceptual Distinctions
app.get('/api/v1/discovery/terminology', (_req, res) => {
  res.json({
    success: true,
    concepts: MATCHING_TERMINOLOGY_REGISTRY,
    connectionTypes: CONNECTION_TYPES_METADATA
  });
});

// 2. Configurable Discovery Feed with Explainable Resonance Breakdown
app.get('/api/v1/discovery/feed', (req, res) => {
  try {
    const userId = (req.headers['x-user-id'] as string) || (req.query.userId as string) || 'usr_me';
    const {
      connectionType,
      minAge,
      maxAge,
      city,
      interests,
      values,
      sortBy,
      page,
      limit
    } = req.query;

    const filters = {
      connectionType: connectionType as any,
      minAge: minAge ? parseInt(minAge as string, 10) : undefined,
      maxAge: maxAge ? parseInt(maxAge as string, 10) : undefined,
      city: city as string,
      interests: interests ? (interests as string).split(',').map(s => s.trim()) : undefined,
      values: values ? (values as string).split(',').map(s => s.trim()) : undefined,
      sortBy: sortBy as any,
      page: page ? parseInt(page as string, 10) : 1,
      limit: limit ? parseInt(limit as string, 10) : 12
    };

    const feed = SocialDiscoveryService.getDiscoveryFeed(userId, filters);
    res.json({ success: true, ...feed });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch discovery feed' });
  }
});

// 3. Get Single Discovery Profile
app.get('/api/v1/discovery/profile/:targetUserId', (req, res) => {
  try {
    const { targetUserId } = req.params;
    const profile = SocialDiscoveryService.getProfile(targetUserId);
    if (!profile) {
      return res.status(404).json({ error: 'Discovery profile not found' });
    }
    res.json({ success: true, profile });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch profile' });
  }
});

// 4. Update / Upsert Discovery Profile
app.put('/api/v1/discovery/profile', (req, res) => {
  try {
    const userId = (req.headers['x-user-id'] as string) || req.body.id || 'usr_me';
    const updated = SocialDiscoveryService.upsertProfile({
      ...req.body,
      id: userId
    });
    res.json({ success: true, profile: updated });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to update profile' });
  }
});

// 5. Deep-Dive Explainable Resonance Report
app.get('/api/v1/discovery/explain/:targetUserId', (req, res) => {
  try {
    const { targetUserId } = req.params;
    const userId = (req.headers['x-user-id'] as string) || (req.query.userId as string) || 'usr_me';

    if (userId === targetUserId) {
      return res.status(400).json({ error: 'Cannot calculate resonance with yourself' });
    }

    const report = SocialDiscoveryService.explainResonance(userId, targetUserId);
    if (!report) {
      return res.status(404).json({ error: 'Profile not found to compute resonance' });
    }

    res.json({ success: true, report });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to generate resonance report' });
  }
});

// 6. Record User Interaction (like, pass, save, follow)
app.post('/api/v1/discovery/interact', (req, res) => {
  try {
    const userId = (req.headers['x-user-id'] as string) || req.body.userId || 'usr_me';
    const { targetUserId, type, connectionType } = req.body;

    if (!targetUserId || !type) {
      return res.status(400).json({ error: 'targetUserId and type are required' });
    }

    const result = SocialDiscoveryService.recordInteraction(
      userId,
      targetUserId,
      type,
      connectionType || 'friendship'
    );

    res.json({ success: true, ...result });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to record interaction' });
  }
});

// 7. Send Explicit Connection Request
app.post('/api/v1/discovery/connect', (req, res) => {
  try {
    const userId = (req.headers['x-user-id'] as string) || req.body.userId || 'usr_me';
    const { recipientId, connectionType, note } = req.body;

    if (!recipientId || !connectionType) {
      return res.status(400).json({ error: 'recipientId and connectionType are required' });
    }

    const result = SocialDiscoveryService.sendConnectionRequest(
      userId,
      recipientId,
      connectionType,
      note
    );

    if (!result.success) {
      return res.status(400).json({ error: result.error || 'Failed to send request' });
    }

    res.json({ success: true, request: result.request });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to send connection request' });
  }
});

// 8. Respond to Connection Request (Accept / Decline)
app.post('/api/v1/discovery/requests/:requestId/respond', (req, res) => {
  try {
    const userId = (req.headers['x-user-id'] as string) || req.body.userId || 'usr_me';
    const { requestId } = req.params;
    const { action } = req.body;

    if (action !== 'accept' && action !== 'decline') {
      return res.status(400).json({ error: "Action must be 'accept' or 'decline'" });
    }

    const result = SocialDiscoveryService.respondToConnectionRequest(userId, requestId, action);
    if (!result.success) {
      return res.status(400).json({ error: result.error || 'Failed to respond to request' });
    }

    res.json({ success: true, connection: result.connection });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to respond to connection request' });
  }
});

// 9. Get Connections for User
app.get('/api/v1/discovery/connections', (req, res) => {
  try {
    const userId = (req.headers['x-user-id'] as string) || (req.query.userId as string) || 'usr_me';
    const { type } = req.query;

    const connections = SocialDiscoveryService.getConnections(userId, type as any);
    res.json({ success: true, connections });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch connections' });
  }
});

// 10. Unmatch / Dissolve Connection
app.post('/api/v1/discovery/unmatch', (req, res) => {
  try {
    const userId = (req.headers['x-user-id'] as string) || req.body.userId || 'usr_me';
    const { targetUserId } = req.body;

    if (!targetUserId) {
      return res.status(400).json({ error: 'targetUserId is required' });
    }

    const success = SocialDiscoveryService.unmatch(userId, targetUserId);
    res.json({ success });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to unmatch' });
  }
});

// 11. Get Saved Profiles
app.get('/api/v1/discovery/saved', (req, res) => {
  try {
    const userId = (req.headers['x-user-id'] as string) || (req.query.userId as string) || 'usr_me';
    const saved = SocialDiscoveryService.getSavedProfiles(userId);
    res.json({ success: true, items: saved });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch saved profiles' });
  }
});

// 12. Reset Passes
app.post('/api/v1/discovery/passes/reset', (req, res) => {
  try {
    const userId = (req.headers['x-user-id'] as string) || req.body.userId || 'usr_me';
    const clearedCount = SocialDiscoveryService.resetPasses(userId);
    res.json({ success: true, clearedCount });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to reset passes' });
  }
});

// ============================================================================
// MASTER PROMPT 05: RELATIONSHIP MANAGEMENT, PERSONAL MEMORY AND CONTEXT ENGINE
// ============================================================================

// 1. Vault Metadata (Lifecycle Phases & Categories)
app.get('/api/v1/vault/metadata', (_req, res) => {
  res.json({
    success: true,
    lifecyclePhases: RELATIONSHIP_LIFECYCLE_METADATA
  });
});

// 2. List Managed Persons (Strict Account-Level Data Isolation)
app.get('/api/v1/vault/persons', (req, res) => {
  try {
    const userId = (req.headers['x-user-id'] as string) || (req.query.userId as string) || 'usr_me';
    const { category, status } = req.query;

    const persons = RelationshipVaultService.listPersons(
      userId,
      category as any,
      status as any
    );
    res.json({ success: true, persons });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to list managed relationships' });
  }
});

// 3. Get Single Person
app.get('/api/v1/vault/persons/:id', (req, res) => {
  try {
    const userId = (req.headers['x-user-id'] as string) || (req.query.userId as string) || 'usr_me';
    const person = RelationshipVaultService.getPerson(userId, req.params.id);
    if (!person) {
      return res.status(404).json({ error: 'Person record not found in your relationship vault' });
    }
    res.json({ success: true, person });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to get person record' });
  }
});

// 4. Get Full Dossier (Person + Timeline + Memories + Promises + Reminders + Briefing)
app.get('/api/v1/vault/persons/:id/dossier', (req, res) => {
  try {
    const userId = (req.headers['x-user-id'] as string) || (req.query.userId as string) || 'usr_me';
    const dossier = RelationshipVaultService.getFullDossier(userId, req.params.id);
    if (!dossier) {
      return res.status(404).json({ error: 'Relationship dossier not found' });
    }
    res.json({ success: true, dossier });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to load relationship dossier' });
  }
});

// 5. Create Person Record
app.post('/api/v1/vault/persons', (req, res) => {
  try {
    const userId = (req.headers['x-user-id'] as string) || req.body.userId || 'usr_me';
    if (!req.body.name || !req.body.name.trim()) {
      return res.status(400).json({ error: 'Name is required to create a relationship record' });
    }

    const created = RelationshipVaultService.createPerson(userId, req.body);
    res.json({ success: true, person: created });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to create relationship record' });
  }
});

// 6. Update Person Record
app.put('/api/v1/vault/persons/:id', (req, res) => {
  try {
    const userId = (req.headers['x-user-id'] as string) || req.body.userId || 'usr_me';
    const updated = RelationshipVaultService.updatePerson(userId, req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Person record not found to update' });
    }
    res.json({ success: true, person: updated });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to update relationship record' });
  }
});

// 7. Delete Person Record (Cascading Purge)
app.delete('/api/v1/vault/persons/:id', (req, res) => {
  try {
    const userId = (req.headers['x-user-id'] as string) || req.body?.userId || (req.query.userId as string) || 'usr_me';
    const deleted = RelationshipVaultService.deletePerson(userId, req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Person record not found or already deleted' });
    }
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to delete relationship record' });
  }
});

// 8. "Before You Talk" Context Briefing
app.get('/api/v1/vault/persons/:id/briefing', (req, res) => {
  try {
    const userId = (req.headers['x-user-id'] as string) || (req.query.userId as string) || 'usr_me';
    const dossier = RelationshipVaultService.getFullDossier(userId, req.params.id);
    if (!dossier) {
      return res.status(404).json({ error: 'Person not found' });
    }
    res.json({ success: true, briefing: dossier.briefing });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to generate briefing' });
  }
});

// 9. AI Relationship Insights (Starters, Patterns, Drafts)
app.get('/api/v1/vault/persons/:id/ai-insights', (req, res) => {
  try {
    const userId = (req.headers['x-user-id'] as string) || (req.query.userId as string) || 'usr_me';
    const insights = RelationshipVaultService.getAiInsights(userId, req.params.id);
    if (!insights) {
      return res.status(404).json({ error: 'Person not found to generate insights' });
    }
    res.json({ success: true, insights });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to generate AI insights' });
  }
});

// 10. Log Interaction Timeline Event (Past Timestamps Supported)
app.post('/api/v1/vault/persons/:id/interactions', (req, res) => {
  try {
    const userId = (req.headers['x-user-id'] as string) || req.body.userId || 'usr_me';
    if (!req.body.interaction_type || !req.body.notes) {
      return res.status(400).json({ error: 'interaction_type and notes are required' });
    }

    const interaction = RelationshipVaultService.logInteraction(userId, req.params.id, req.body);
    res.json({ success: true, interaction });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to log interaction' });
  }
});

// 11. Get Interaction History
app.get('/api/v1/vault/persons/:id/interactions', (req, res) => {
  try {
    const userId = (req.headers['x-user-id'] as string) || (req.query.userId as string) || 'usr_me';
    const interactions = RelationshipVaultService.getInteractions(userId, req.params.id);
    res.json({ success: true, interactions });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to get interactions' });
  }
});

// 12. Add Personal Memory, Quote, or Reflection
app.post('/api/v1/vault/persons/:id/memories', (req, res) => {
  try {
    const userId = (req.headers['x-user-id'] as string) || req.body.userId || 'usr_me';
    if (!req.body.content) {
      return res.status(400).json({ error: 'content is required for memory' });
    }

    const memory = RelationshipVaultService.addMemory(userId, req.params.id, {
      memory_type: req.body.memory_type || 'quote',
      title: req.body.title,
      content: req.body.content,
      emotional_significance: req.body.emotional_significance,
      occurred_at: req.body.occurred_at,
      tags: req.body.tags,
      is_unresolved: Boolean(req.body.is_unresolved)
    });
    res.json({ success: true, memory });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to add memory' });
  }
});

// 13. Update Memory (e.g. Resolve Discussion)
app.put('/api/v1/vault/memories/:id', (req, res) => {
  try {
    const userId = (req.headers['x-user-id'] as string) || req.body.userId || 'usr_me';
    const updated = RelationshipVaultService.updateMemory(userId, req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Memory not found to update' });
    }
    res.json({ success: true, memory: updated });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to update memory' });
  }
});

// 14. Add Commitment / Promise
app.post('/api/v1/vault/persons/:id/commitments', (req, res) => {
  try {
    const userId = (req.headers['x-user-id'] as string) || req.body.userId || 'usr_me';
    if (!req.body.title) {
      return res.status(400).json({ error: 'title is required for commitment' });
    }

    const commitment = RelationshipVaultService.addCommitment(userId, req.params.id, {
      made_by: req.body.made_by || 'me',
      title: req.body.title,
      description: req.body.description,
      due_date: req.body.due_date,
      notes: req.body.notes
    });
    res.json({ success: true, commitment });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to add commitment' });
  }
});

// 15. Update Commitment Status (fulfilled, broken, renegotiated)
app.put('/api/v1/vault/commitments/:id', (req, res) => {
  try {
    const userId = (req.headers['x-user-id'] as string) || req.body.userId || 'usr_me';
    const updated = RelationshipVaultService.updateCommitment(userId, req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Commitment not found to update' });
    }
    res.json({ success: true, commitment: updated });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to update commitment' });
  }
});

// 16. Add Reminder
app.post('/api/v1/vault/persons/:id/reminders', (req, res) => {
  try {
    const userId = (req.headers['x-user-id'] as string) || req.body.userId || 'usr_me';
    if (!req.body.title || !req.body.due_date) {
      return res.status(400).json({ error: 'title and due_date are required for reminder' });
    }

    const reminder = RelationshipVaultService.addReminder(userId, req.params.id, {
      title: req.body.title,
      category: req.body.category || 'custom',
      due_date: req.body.due_date,
      reminder_timing: req.body.reminder_timing,
      notes: req.body.notes
    });
    res.json({ success: true, reminder });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to add reminder' });
  }
});

// 17. Update Reminder Status
app.put('/api/v1/vault/reminders/:id', (req, res) => {
  try {
    const userId = (req.headers['x-user-id'] as string) || req.body.userId || 'usr_me';
    const status = req.body.status || 'completed';
    const updated = RelationshipVaultService.updateReminder(userId, req.params.id, status);
    if (!updated) {
      return res.status(404).json({ error: 'Reminder not found to update' });
    }
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to update reminder' });
  }
});

// 18. Export Relationship Dossier (JSON / Markdown)
app.get('/api/v1/vault/persons/:id/export', (req, res) => {
  try {
    const userId = (req.headers['x-user-id'] as string) || (req.query.userId as string) || 'usr_me';
    const format = req.query.format === 'markdown' ? 'markdown' : 'json';
    const dossier = RelationshipVaultService.getFullDossier(userId, req.params.id);

    if (!dossier) {
      return res.status(404).json({ error: 'Relationship not found to export' });
    }

    if (format === 'markdown') {
      const p = dossier.person;
      let md = `# Relationship Dossier: ${p.name} (${p.nickname || ''})\n\n`;
      md += `- **Category:** ${p.relationship_category}\n`;
      md += `- **Lifecycle Status:** ${p.relationship_status} (${p.custom_status_label || ''})\n`;
      md += `- **First Met:** ${p.first_met_date || 'N/A'} (${p.first_met_location || ''})\n`;
      md += `- **Birthday:** ${p.birthday_date || 'N/A'}\n`;
      md += `- **Love Language:** ${p.love_language || 'N/A'}\n\n`;

      md += `## 💬 Things They Appreciate & Boundaries\n`;
      md += `### Loves & Preferences:\n`;
      p.things_they_love.forEach(l => { md += `- ${l}\n`; });
      md += `\n### Boundaries to Respect:\n`;
      p.boundaries.forEach(b => { md += `- ${b}\n`; });

      md += `\n## 🤝 Promises & Commitments\n`;
      dossier.commitments.forEach(c => {
        md += `- [${c.status.toUpperCase()}] (${c.made_by.toUpperCase()}) ${c.title} (Due: ${c.due_date || 'N/A'})\n`;
      });

      md += `\n## 💡 Memories & Quotes\n`;
      dossier.memories.forEach(m => {
        md += `### [${m.memory_type.toUpperCase()}] ${m.title || 'Note'}\n"${m.content}"\n\n`;
      });

      md += `\n## 📅 Interaction Timeline\n`;
      dossier.interactions.forEach(i => {
        md += `- **${new Date(i.timestamp).toLocaleDateString()}:** [${i.interaction_type}] ${i.title || ''} — ${i.notes}\n`;
      });

      res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${p.name.replace(/\\s+/g, '_')}_dossier.md"`);
      return res.send(md);
    }

    res.json({ success: true, dossier, exportedAt: Date.now() });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to export dossier' });
  }
});

// 19. Export All Vault Relationships
app.get('/api/v1/vault/export-all', (req, res) => {
  try {
    const userId = (req.headers['x-user-id'] as string) || (req.query.userId as string) || 'usr_me';
    const persons = RelationshipVaultService.listPersons(userId);
    const dossiers = persons.map(p => RelationshipVaultService.getFullDossier(userId, p.id));
    res.json({ success: true, count: dossiers.length, dossiers, exportedAt: Date.now() });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to export vault' });
  }
});

// ===========================================================================
// MASTER PROMPT 06: DYNAMIC HUMAN CONNECTION CONTENT ENGINE ENDPOINTS
// ===========================================================================

// 1. Get Daily Content Bundle
app.get('/api/v1/content/daily', (req, res) => {
  try {
    const userId = (req.headers['x-user-id'] as string) || (req.query.userId as string) || 'usr_me';
    const dateStr = (req.query.date as string) || undefined;
    const bundle = ContentEngineService.getDailyBundle(dateStr, userId);
    res.json({ success: true, bundle });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to get daily content' });
  }
});

// 2. Get Previous Daily Bundles
app.get('/api/v1/content/daily/history', (req, res) => {
  try {
    const userId = (req.headers['x-user-id'] as string) || (req.query.userId as string) || 'usr_me';
    const limit = parseInt(req.query.limit as string, 10) || 7;
    const offset = parseInt(req.query.offset as string, 10) || 0;
    const bundles = ContentEngineService.getPreviousDailyBundles(limit, offset, userId);
    res.json({ success: true, count: bundles.length, bundles });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to get daily history' });
  }
});

// 3. Query Content Catalog with Filters
app.get('/api/v1/content/items', (req, res) => {
  try {
    const userId = (req.headers['x-user-id'] as string) || (req.query.userId as string) || 'usr_me';
    const filters = {
      category: req.query.category as any,
      subcategory: req.query.subcategory as any,
      content_type: req.query.content_type as any,
      depth_level: req.query.depth_level as any,
      intended_context: req.query.intended_context as any,
      search: req.query.search as string,
      exclude_seen: req.query.exclude_seen === 'true',
      exclude_skipped: req.query.exclude_skipped === 'true',
      limit: parseInt(req.query.limit as string, 10) || 20,
      offset: parseInt(req.query.offset as string, 10) || 0
    };
    const result = ContentEngineService.queryContent(filters, userId);
    res.json({ success: true, ...result });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to query content' });
  }
});

// 4. Random Content Item
app.get('/api/v1/content/items/random', (req, res) => {
  try {
    const userId = (req.headers['x-user-id'] as string) || (req.query.userId as string) || 'usr_me';
    const filters = {
      category: req.query.category as any,
      subcategory: req.query.subcategory as any,
      content_type: req.query.content_type as any,
      depth_level: req.query.depth_level as any,
      intended_context: req.query.intended_context as any
    };
    const item = ContentEngineService.getRandomItem(filters, userId);
    res.json({ success: true, item });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to get random item' });
  }
});

// 5. Refresh Content Item (Fresh Replacement)
app.get('/api/v1/content/items/refresh', (req, res) => {
  try {
    const userId = (req.headers['x-user-id'] as string) || (req.query.userId as string) || 'usr_me';
    const currentId = req.query.currentId as string;
    const filters = {
      category: req.query.category as any,
      subcategory: req.query.subcategory as any,
      content_type: req.query.content_type as any,
      depth_level: req.query.depth_level as any,
      intended_context: req.query.intended_context as any
    };
    const item = ContentEngineService.refreshItem(filters, currentId, userId);
    res.json({ success: true, item });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to refresh item' });
  }
});

// 6. Personalized Content Items
app.get('/api/v1/content/items/personalized', (req, res) => {
  try {
    const userId = (req.headers['x-user-id'] as string) || (req.query.userId as string) || 'usr_me';
    const limit = parseInt(req.query.limit as string, 10) || 5;
    const items = ContentEngineService.getPersonalizedItems(userId, limit);
    res.json({ success: true, items });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to get personalized items' });
  }
});

// 7. Get Single Content Item
app.get('/api/v1/content/items/:id', (req, res) => {
  try {
    const userId = (req.headers['x-user-id'] as string) || (req.query.userId as string) || 'usr_me';
    const item = ContentEngineService.getContentItem(req.params.id, userId);
    if (!item) {
      return res.status(404).json({ error: 'Content item not found' });
    }
    ContentEngineService.recordView(userId, item.id, 'item_detail');
    res.json({ success: true, item });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to get content item' });
  }
});

// 8. Toggle Favorite
app.post('/api/v1/content/items/:id/favorite', (req, res) => {
  try {
    const userId = (req.headers['x-user-id'] as string) || (req.query.userId as string) || 'usr_me';
    const result = ContentEngineService.toggleFavorite(userId, req.params.id);
    res.json({ success: true, ...result });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to toggle favorite' });
  }
});

// 9. Get User Favorites
app.get('/api/v1/content/favorites', (req, res) => {
  try {
    const userId = (req.headers['x-user-id'] as string) || (req.query.userId as string) || 'usr_me';
    const limit = parseInt(req.query.limit as string, 10) || 20;
    const offset = parseInt(req.query.offset as string, 10) || 0;
    const favorites = ContentEngineService.getUserFavorites(userId, limit, offset);
    res.json({ success: true, favorites });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to get favorites' });
  }
});

// 10. Record Private Answer to Question
app.post('/api/v1/content/items/:id/answer', (req, res) => {
  try {
    const userId = (req.headers['x-user-id'] as string) || (req.query.userId as string) || 'usr_me';
    const { answerText, moodState, tags } = req.body;
    if (!answerText || !answerText.trim()) {
      return res.status(400).json({ error: 'answerText is required' });
    }
    const answer = ContentEngineService.recordAnswer(userId, req.params.id, answerText, moodState, tags);
    res.status(201).json({ success: true, answer });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to record answer' });
  }
});

// 11. Get User Answers
app.get('/api/v1/content/answers', (req, res) => {
  try {
    const userId = (req.headers['x-user-id'] as string) || (req.query.userId as string) || 'usr_me';
    const contentId = req.query.contentId as string | undefined;
    const answers = ContentEngineService.getUserAnswers(userId, contentId);
    res.json({ success: true, answers });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to get answers' });
  }
});

// 12. Delete User Answer
app.delete('/api/v1/content/answers/:id', (req, res) => {
  try {
    const userId = (req.headers['x-user-id'] as string) || (req.query.userId as string) || 'usr_me';
    const deleted = ContentEngineService.deleteAnswer(userId, req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Answer not found or not owned by user' });
    }
    res.json({ success: true, message: 'Answer deleted' });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to delete answer' });
  }
});

// 13. Skip Content Item
app.post('/api/v1/content/items/:id/skip', (req, res) => {
  try {
    const userId = (req.headers['x-user-id'] as string) || (req.query.userId as string) || 'usr_me';
    const { reason } = req.body;
    ContentEngineService.skipItem(userId, req.params.id, reason);
    res.json({ success: true, message: 'Item skipped' });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to skip item' });
  }
});

// 14. Report Inappropriate Content
app.post('/api/v1/content/items/:id/report', (req, res) => {
  try {
    const userId = (req.headers['x-user-id'] as string) || (req.query.userId as string) || 'usr_me';
    const { reason, details } = req.body;
    if (!reason) {
      return res.status(400).json({ error: 'reason is required' });
    }
    const report = ContentEngineService.reportContent(userId, req.params.id, reason, details);
    res.status(201).json({ success: true, report });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to report content' });
  }
});

// 15. Content Categories & Taxonomy Metadata
app.get('/api/v1/content/categories', (_req, res) => {
  try {
    const taxonomyData = ContentEngineService.getCategoryTaxonomy();
    res.json({ success: true, ...taxonomyData });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to get taxonomy' });
  }
});

// 16. Export User Content Responses & Favorites
app.get('/api/v1/content/export', (req, res) => {
  try {
    const userId = (req.headers['x-user-id'] as string) || (req.query.userId as string) || 'usr_me';
    const exportData = ContentEngineService.exportUserData(userId);
    res.json({ success: true, export: exportData });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to export content data' });
  }
});

// ===========================================================================
// MASTER PROMPT 07: PERSONAL AI INTELLIGENCE & MULTI-PROVIDER AI FEATURES
// ===========================================================================

// 1. Personal Reflection Assistant
app.post('/api/v1/ai/features/personal-reflection', async (req, res) => {
  try {
    const userId = (req.headers['x-user-id'] as string) || (req.query.userId as string) || 'usr_me';
    const { topic, mood } = req.body;
    if (!topic || !topic.trim()) return res.status(400).json({ error: 'topic is required' });
    const result = await SoulverseIntelligenceService.runPersonalReflection(userId, topic.trim(), mood);
    res.json({ success: true, result });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Reflection assistant failed' });
  }
});

// 2. Relationship Assistant
app.post('/api/v1/ai/features/relationship-assistant', async (req, res) => {
  try {
    const userId = (req.headers['x-user-id'] as string) || (req.query.userId as string) || 'usr_me';
    const { personId, dilemma } = req.body;
    if (!personId || !dilemma) return res.status(400).json({ error: 'personId and dilemma are required' });
    const result = await SoulverseIntelligenceService.runRelationshipAssistant(userId, personId, dilemma);
    res.json({ success: true, result });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Relationship assistant failed' });
  }
});

// 3. Conversation Assistant
app.post('/api/v1/ai/features/conversation-assistant', async (req, res) => {
  try {
    const userId = (req.headers['x-user-id'] as string) || (req.query.userId as string) || 'usr_me';
    const { contextPrompt } = req.body;
    if (!contextPrompt) return res.status(400).json({ error: 'contextPrompt is required' });
    const result = await SoulverseIntelligenceService.runConversationAssistant(userId, contextPrompt);
    res.json({ success: true, result });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Conversation assistant failed' });
  }
});

// 4. Profile-Writing Assistant
app.post('/api/v1/ai/features/profile-writer', async (req, res) => {
  try {
    const userId = (req.headers['x-user-id'] as string) || (req.query.userId as string) || 'usr_me';
    const { identityType, traits, aspirations } = req.body;
    const result = await SoulverseIntelligenceService.runProfileWritingAssistant(userId, identityType || 'personal', traits || [], aspirations || '');
    res.json({ success: true, result });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Profile writer failed' });
  }
});

// 5. Question Generator
app.post('/api/v1/ai/features/question-generator', async (req, res) => {
  try {
    const userId = (req.headers['x-user-id'] as string) || (req.query.userId as string) || 'usr_me';
    const { category, depthLevel, context } = req.body;
    const result = await SoulverseIntelligenceService.runQuestionGenerator(userId, category || 'deep_conversations', depthLevel || 'deep', context || 'couples');
    res.json({ success: true, result });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Question generator failed' });
  }
});

// 6. Daily Content Generator
app.post('/api/v1/ai/features/daily-content', async (req, res) => {
  try {
    const userId = (req.headers['x-user-id'] as string) || (req.query.userId as string) || 'usr_me';
    const { domain } = req.body;
    const result = await SoulverseIntelligenceService.runDailyContentGenerator(userId, domain || 'love');
    res.json({ success: true, result });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Daily content generator failed' });
  }
});

// 7. Communication Analysis (Non-Diagnostic)
app.post('/api/v1/ai/features/communication-analysis', async (req, res) => {
  try {
    const userId = (req.headers['x-user-id'] as string) || (req.query.userId as string) || 'usr_me';
    const { messageExcerpts } = req.body;
    if (!Array.isArray(messageExcerpts) || messageExcerpts.length === 0) {
      return res.status(400).json({ error: 'messageExcerpts array is required' });
    }
    const result = await SoulverseIntelligenceService.runCommunicationAnalysis(userId, messageExcerpts);
    res.json({ success: true, result });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Communication analysis failed' });
  }
});

// 8. Personal Knowledge Retrieval (RAG over user's journal & values)
app.post('/api/v1/ai/features/personal-rag', async (req, res) => {
  try {
    const userId = (req.headers['x-user-id'] as string) || (req.query.userId as string) || 'usr_me';
    const { query } = req.body;
    if (!query) return res.status(400).json({ error: 'query is required' });
    const result = await SoulverseIntelligenceService.runPersonalKnowledgeRetrieval(userId, query);
    res.json({ success: true, result });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Personal RAG failed' });
  }
});

// 9. Relationship Memory Retrieval (RAG over relationship vault)
app.post('/api/v1/ai/features/relationship-rag', async (req, res) => {
  try {
    const userId = (req.headers['x-user-id'] as string) || (req.query.userId as string) || 'usr_me';
    const { personId, query } = req.body;
    if (!personId || !query) return res.status(400).json({ error: 'personId and query are required' });
    const result = await SoulverseIntelligenceService.runRelationshipMemoryRetrieval(userId, personId, query);
    res.json({ success: true, result });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Relationship RAG failed' });
  }
});

// 10. Educational Explanation
app.post('/api/v1/ai/features/educational-explanation', async (req, res) => {
  try {
    const userId = (req.headers['x-user-id'] as string) || (req.query.userId as string) || 'usr_me';
    const { concept } = req.body;
    if (!concept) return res.status(400).json({ error: 'concept is required' });
    const result = await SoulverseIntelligenceService.runEducationalExplanation(userId, concept);
    res.json({ success: true, result });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Educational explanation failed' });
  }
});

// 11. User AI Configuration & Intelligence Status
app.get('/api/v1/ai/features/status', (req, res) => {
  try {
    const userId = (req.headers['x-user-id'] as string) || (req.query.userId as string) || 'usr_me';
    const status = SoulverseIntelligenceService.getUserStatus(userId);
    res.json({ success: true, status });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to get AI status' });
  }
});

// =========================================================================
// MASTER PROMPT 08: COMPLETE REAL-TIME COMMUNICATION AND SOCIAL INTERACTION
// =========================================================================

// 1. Group & Direct Conversation Endpoints
app.post(['/api/v1/conversations/group', '/api/v1/communication/conversations/group'], (req, res) => {
  try {
    const creatorId = (req.headers['x-user-id'] as string) || req.body.creatorId || 'usr_me';
    const { title, description, avatarUrl, memberIds = [] } = req.body;
    if (!title) return res.status(400).json({ error: 'Title is required for group chat' });
    const conv = MessagingService.createGroupConversation({ creatorId, title, description, avatarUrl, memberIds });
    res.status(201).json({ success: true, conversation: conv });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to create group' });
  }
});

app.post(['/api/v1/conversations/:id/members', '/api/v1/communication/conversations/:id/members'], (req, res) => {
  try {
    const actorId = (req.headers['x-user-id'] as string) || req.body.actorId || 'usr_me';
    const { userId, role } = req.body;
    if (!userId) return res.status(400).json({ error: 'userId is required' });
    MessagingService.addMemberToGroup(req.params.id, actorId, userId, role || 'member');
    res.status(201).json({ success: true, message: 'Member added successfully' });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to add member' });
  }
});

app.delete(['/api/v1/conversations/:id/members/:userId', '/api/v1/communication/conversations/:id/members/:userId'], (req, res) => {
  try {
    const actorId = (req.headers['x-user-id'] as string) || (req.query.actorId as string) || 'usr_me';
    MessagingService.removeMemberFromGroup(req.params.id, actorId, req.params.userId);
    res.json({ success: true, message: 'Member removed successfully' });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to remove member' });
  }
});

app.patch(['/api/v1/conversations/:id', '/api/v1/communication/conversations/:id'], (req, res) => {
  try {
    const actorId = (req.headers['x-user-id'] as string) || req.body.actorId || 'usr_me';
    const conv = MessagingService.updateGroupInfo(req.params.id, actorId, req.body);
    res.json({ success: true, conversation: conv });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to update conversation' });
  }
});

app.get(['/api/v1/conversations/:id/members', '/api/v1/communication/conversations/:id/members'], (req, res) => {
  try {
    const members = MessagingService.getGroupMembers(req.params.id);
    res.json({ success: true, members });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to get group members' });
  }
});

app.post('/api/v1/communication/conversations/direct', (req, res) => {
  try {
    const userA = (req.headers['x-user-id'] as string) || req.body.userA || 'usr_me';
    const { userB } = req.body;
    if (!userB) return res.status(400).json({ error: 'Target userB is required' });
    const conv = MessagingService.getOrCreateDirectConversation(userA, userB);
    res.json({ success: true, conversation: conv });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to get/create direct conversation' });
  }
});

app.get('/api/v1/communication/conversations', (req, res) => {
  try {
    const userId = (req.headers['x-user-id'] as string) || (req.query.userId as string) || 'usr_me';
    const filter = req.query.filter as string;
    const conversations = MessagingService.getUserConversations(userId, filter);
    res.json({ success: true, conversations });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch conversations' });
  }
});

app.get('/api/v1/communication/conversations/:id', (req, res) => {
  try {
    const userId = (req.headers['x-user-id'] as string) || (req.query.userId as string) || 'usr_me';
    const conv = MessagingService.getConversationById(req.params.id, userId);
    if (!conv) return res.status(404).json({ error: 'Conversation not found' });
    res.json({ success: true, conversation: conv });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch conversation' });
  }
});

// 2. Messaging, Offline Sync, Reactions, Edit & Delete
app.post('/api/v1/communication/conversations/:id/messages', (req, res) => {
  try {
    const senderId = (req.headers['x-user-id'] as string) || req.body.senderId || 'usr_me';
    const { clientMessageId, type, text, mediaUrl, voiceDuration, voiceWaveform, attachments, replyToMessageId, threadId } = req.body;
    if (!clientMessageId) return res.status(400).json({ error: 'clientMessageId is required' });
    const result = MessagingService.sendMessage({
      conversationId: req.params.id,
      senderId,
      clientMessageId,
      type,
      text,
      mediaUrl,
      voiceDuration,
      voiceWaveform,
      attachments,
      replyToMessageId,
      threadId
    });
    res.status(result.deduplicated ? 200 : 201).json({ success: true, ...result });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to send message' });
  }
});

app.get('/api/v1/communication/conversations/:id/messages', (req, res) => {
  try {
    const userId = (req.headers['x-user-id'] as string) || (req.query.userId as string) || 'usr_me';
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
    const beforeSequence = req.query.beforeSequence ? parseInt(req.query.beforeSequence as string) : undefined;
    const messages = MessagingService.getMessages({ conversationId: req.params.id, userId, limit, beforeSequence });
    res.json({ success: true, messages });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch messages' });
  }
});

app.get(['/api/v1/conversations/:id/sync', '/api/v1/communication/conversations/:id/sync'], (req, res) => {
  try {
    const userId = (req.headers['x-user-id'] as string) || (req.query.userId as string) || 'usr_me';
    const sinceSequence = parseInt((req.query.sinceSequence as string) || (req.query.since as string) || '0');
    const messages = MessagingService.syncMessages(req.params.id, sinceSequence, userId);
    res.json({ success: true, messages, count: messages.length });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to sync messages' });
  }
});

app.patch('/api/v1/communication/messages/:id', (req, res) => {
  try {
    const editorId = (req.headers['x-user-id'] as string) || req.body.editorId || 'usr_me';
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'text is required' });
    const updated = MessagingService.editMessage(req.params.id, editorId, text);
    res.json({ success: true, message: updated });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to edit message' });
  }
});

app.delete('/api/v1/communication/messages/:id', (req, res) => {
  try {
    const userId = (req.headers['x-user-id'] as string) || (req.query.userId as string) || 'usr_me';
    const mode = (req.query.mode as string) === 'for_everyone' ? 'for_everyone' : 'for_me';
    MessagingService.deleteMessage(req.params.id, userId, mode);
    res.json({ success: true, deleted: true, mode });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to delete message' });
  }
});

app.post('/api/v1/communication/messages/:id/reactions', (req, res) => {
  try {
    const userId = (req.headers['x-user-id'] as string) || req.body.userId || 'usr_me';
    const { emoji } = req.body;
    if (!emoji) return res.status(400).json({ error: 'emoji is required' });
    const result = MessagingService.toggleReaction(req.params.id, userId, emoji);
    res.json({ success: true, ...result });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to toggle reaction' });
  }
});

app.post('/api/v1/communication/conversations/:id/read', (req, res) => {
  try {
    const userId = (req.headers['x-user-id'] as string) || req.body.userId || 'usr_me';
    const sequenceNumber = req.body.sequenceNumber ? parseInt(req.body.sequenceNumber) : undefined;
    MessagingService.markAsRead(req.params.id, userId, sequenceNumber);
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to mark as read' });
  }
});

// Polls: Creation & Voting
app.post(['/api/v1/conversations/:id/poll', '/api/v1/communication/conversations/:id/poll'], (req, res) => {
  try {
    const senderId = (req.headers['x-user-id'] as string) || req.body.senderId || 'usr_me';
    const { clientMessageId, question, options, allowsMultiple, expiresAt } = req.body;
    if (!clientMessageId) return res.status(400).json({ error: 'clientMessageId is required' });
    if (!question) return res.status(400).json({ error: 'question is required' });
    if (!options || options.length < 2) return res.status(400).json({ error: 'At least 2 options are required' });

    const result = MessagingService.createPollMessage({
      conversationId: req.params.id,
      senderId,
      clientMessageId,
      question,
      options,
      allowsMultiple,
      expiresAt
    });
    res.status(result.deduplicated ? 200 : 201).json({ success: true, ...result });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to create poll' });
  }
});

app.post(['/api/v1/messages/:id/poll/vote', '/api/v1/communication/messages/:id/poll/vote'], (req, res) => {
  try {
    const userId = (req.headers['x-user-id'] as string) || req.body.userId || 'usr_me';
    const { optionIndex } = req.body;
    if (typeof optionIndex !== 'number') return res.status(400).json({ error: 'optionIndex number is required' });

    const result = MessagingService.votePoll(req.params.id, userId, optionIndex);
    res.json({ success: true, ...result });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to vote on poll' });
  }
});

// Calls: Logging & Status Updates
app.post(['/api/v1/calls', '/api/v1/communication/calls'], (req, res) => {
  try {
    const callerId = (req.headers['x-user-id'] as string) || req.body.callerId || 'usr_me';
    const { id, conversationId, recipientId, callType, status, durationSeconds, startedAt, endedAt } = req.body;
    if (!id || !conversationId || !recipientId) {
      return res.status(400).json({ error: 'id, conversationId, and recipientId are required' });
    }
    MessagingService.logCall({
      id,
      conversationId,
      callerId,
      recipientId,
      callType: callType || 'voice',
      status: status || 'ringing',
      durationSeconds: durationSeconds || 0,
      startedAt: startedAt || Date.now(),
      endedAt
    });
    res.status(201).json({ success: true, message: 'Call logged successfully' });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to log call' });
  }
});

app.patch(['/api/v1/calls/:id', '/api/v1/communication/calls/:id'], (req, res) => {
  try {
    const { status, durationSeconds } = req.body;
    if (!status) return res.status(400).json({ error: 'status is required' });
    MessagingService.updateCallStatus(req.params.id, status, durationSeconds);
    res.json({ success: true, message: 'Call status updated' });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to update call status' });
  }
});

app.get(['/api/v1/calls/history', '/api/v1/communication/calls/history'], (req, res) => {
  try {
    const userId = (req.headers['x-user-id'] as string) || (req.query.userId as string) || 'usr_me';
    const conversationId = req.query.conversationId as string;
    const history = MessagingService.getCallsHistory(userId, conversationId);
    res.json({ success: true, calls: history });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to get call history' });
  }
});

app.get('/api/v1/communication/messages/search', (req, res) => {
  try {
    const userId = (req.headers['x-user-id'] as string) || (req.query.userId as string) || 'usr_me';
    const query = (req.query.q as string) || '';
    if (!query) return res.status(400).json({ error: 'Query parameter q is required' });
    const messages = MessagingService.searchMessages({
      userId,
      query,
      conversationId: req.query.conversationId as string,
      senderId: req.query.senderId as string,
      type: req.query.type as string,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 50
    });
    res.json({ success: true, messages, count: messages.length });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Search failed' });
  }
});

// 3. Interactive Mini-Games Architecture
app.post('/api/v1/communication/games/start', (req, res) => {
  try {
    const userId = (req.headers['x-user-id'] as string) || req.body.userId || 'usr_me';
    const { conversationId, gameType } = req.body;
    if (!conversationId || !gameType) return res.status(400).json({ error: 'conversationId and gameType are required' });
    const session = InteractiveGamesEngine.startGameSession(conversationId, gameType, userId);
    res.status(201).json({ success: true, session });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to start game' });
  }
});

app.post('/api/v1/communication/games/:id/turn', (req, res) => {
  try {
    const userId = (req.headers['x-user-id'] as string) || req.body.userId || 'usr_me';
    const session = InteractiveGamesEngine.submitGameTurn(req.params.id, userId, req.body.actionPayload || req.body);
    res.json({ success: true, session });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to process game turn' });
  }
});

app.get('/api/v1/communication/games/tod-draw', (req, res) => {
  try {
    const type = (req.query.type as 'truth' | 'dare') || 'truth';
    const tier = (req.query.tier as 'pg' | 'romantic' | 'deep' | 'spicy') || 'romantic';
    const card = InteractiveGamesEngine.drawTruthOrDareCard(type, tier);
    res.json({ success: true, card });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to draw card' });
  }
});

app.post('/api/v1/communication/games/dice-roll', (req, res) => {
  try {
    const count = parseInt(((req.body && req.body.count) || (req.query && req.query.count) || 2) as string);
    const result = InteractiveGamesEngine.rollDice(count);
    res.json({ success: true, result });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Dice roll failed' });
  }
});

app.post('/api/v1/communication/games/coin-flip', (_req, res) => {
  try {
    const result = InteractiveGamesEngine.flipCoin();
    res.json({ success: true, result });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Coin flip failed' });
  }
});

// 4. Social Activities & Watch Party Coordination
app.post('/api/v1/communication/watch-party', (req, res) => {
  try {
    const hostId = (req.headers['x-user-id'] as string) || req.body.hostId || 'usr_me';
    const { title, videoUrl, videoType, conversationId } = req.body;
    if (!title || !videoUrl) return res.status(400).json({ error: 'title and videoUrl are required' });
    const party = SocialActivitiesService.createWatchParty({ title, hostId, videoUrl, videoType, conversationId });
    res.status(201).json({ success: true, watchParty: party });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to create watch party' });
  }
});

app.get('/api/v1/communication/watch-party/:id', (req, res) => {
  try {
    const party = SocialActivitiesService.getWatchParty(req.params.id);
    if (!party) return res.status(404).json({ error: 'Watch party not found' });
    res.json({ success: true, watchParty: party });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to get watch party' });
  }
});

app.post('/api/v1/communication/watch-party/:id/sync', (req, res) => {
  try {
    const userId = (req.headers['x-user-id'] as string) || req.body.userId || 'usr_me';
    const { position, isPlaying } = req.body;
    if (typeof position !== 'number') return res.status(400).json({ error: 'Numeric position required' });
    const party = SocialActivitiesService.syncWatchPartyPlayback(req.params.id, userId, position, Boolean(isPlaying));
    res.json({ success: true, watchParty: party });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Sync failed' });
  }
});

app.get('/api/v1/communication/social-rooms', (_req, res) => {
  try {
    const rooms = SocialActivitiesService.getSocialRooms();
    res.json({ success: true, rooms });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to get rooms' });
  }
});

app.post('/api/v1/communication/social-rooms', (req, res) => {
  try {
    const hostId = (req.headers['x-user-id'] as string) || req.body.hostId || 'usr_me';
    const { title, topic, category, roomType, maxParticipants, tags } = req.body;
    if (!title || !topic || !category) return res.status(400).json({ error: 'title, topic, and category required' });
    const room = SocialActivitiesService.createSocialRoom({ title, topic, category, roomType, hostId, maxParticipants, tags });
    res.status(201).json({ success: true, room });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to create room' });
  }
});

app.post('/api/v1/communication/social-rooms/:id/join', (req, res) => {
  try {
    const userId = (req.headers['x-user-id'] as string) || req.body.userId || 'usr_me';
    SocialActivitiesService.joinRoom(req.params.id, userId);
    res.json({ success: true, joined: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to join room' });
  }
});

app.post('/api/v1/communication/social-rooms/:id/leave', (req, res) => {
  try {
    const userId = (req.headers['x-user-id'] as string) || req.body.userId || 'usr_me';
    SocialActivitiesService.leaveRoom(req.params.id, userId);
    res.json({ success: true, left: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to leave room' });
  }
});

app.post('/api/v1/communication/social-rooms/:id/hand-raise', (req, res) => {
  try {
    const userId = (req.headers['x-user-id'] as string) || req.body.userId || 'usr_me';
    const isRaised = Boolean(req.body.isRaised);
    SocialActivitiesService.toggleHandRaise(req.params.id, userId, isRaised);
    res.json({ success: true, isRaised });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to update hand raise' });
  }
});

app.post('/api/v1/communication/invitations', (req, res) => {
  try {
    const inviterId = (req.headers['x-user-id'] as string) || req.body.inviterId || 'usr_me';
    const { inviteeId, activityType, activityId, title } = req.body;
    if (!inviteeId || !activityType || !activityId || !title) {
      return res.status(400).json({ error: 'inviteeId, activityType, activityId, and title required' });
    }
    const inv = SocialActivitiesService.sendInvitation({ inviterId, inviteeId, activityType, activityId, title });
    res.status(201).json({ success: true, invitation: inv });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to send invitation' });
  }
});

app.get('/api/v1/communication/invitations', (req, res) => {
  try {
    const userId = (req.headers['x-user-id'] as string) || (req.query.userId as string) || 'usr_me';
    const invitations = SocialActivitiesService.getUserInvitations(userId);
    res.json({ success: true, invitations });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to get invitations' });
  }
});

app.post('/api/v1/communication/invitations/:id/respond', (req, res) => {
  try {
    const userId = (req.headers['x-user-id'] as string) || req.body.userId || 'usr_me';
    const response = req.body.response as 'accepted' | 'declined';
    if (!['accepted', 'declined'].includes(response)) return res.status(400).json({ error: 'Response must be accepted or declined' });
    const success = SocialActivitiesService.respondInvitation(req.params.id, userId, response);
    res.json({ success });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to respond to invitation' });
  }
});

// 5. Safety, Moderation & Privacy Endpoints
app.post('/api/v1/communication/safety/moderate', (req, res) => {
  try {
    const { text } = req.body;
    const result = SafetyService.moderateContent(text || '');
    res.json({ success: true, moderation: result });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Moderation check failed' });
  }
});

app.post('/api/v1/communication/safety/validate-attachment', (req, res) => {
  try {
    const { fileName, fileSize, mimeType } = req.body;
    if (!fileName || typeof fileSize !== 'number' || !mimeType) {
      return res.status(400).json({ error: 'fileName, fileSize, and mimeType required' });
    }
    const validation = SafetyService.validateAttachment(fileName, fileSize, mimeType);
    res.json({ success: true, ...validation });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Validation failed' });
  }
});

app.post(['/api/v1/communication/safety/block', '/api/communication/safety/block'], (req, res) => {
  try {
    const blockerId = (req.headers['x-user-id'] as string) || req.body.blockerId || 'usr_me';
    const { blockedId, reason, partingMessage } = req.body;
    if (!blockedId) return res.status(400).json({ error: 'blockedId is required' });
    SafetyService.blockUser(blockerId, blockedId, reason, partingMessage);
    res.json({ success: true, blocked: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Block failed' });
  }
});

app.delete(['/api/v1/communication/safety/block', '/api/communication/safety/block'], (req, res) => {
  try {
    const blockerId = (req.headers['x-user-id'] as string) || req.body?.blockerId || (req.query.blockerId as string) || 'usr_me';
    const blockedId = req.body?.blockedId || (req.query.blockedId as string);
    if (!blockedId) return res.status(400).json({ error: 'blockedId is required' });
    SafetyService.unblockUser(blockerId, blockedId);
    res.json({ success: true, unblocked: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Unblock failed' });
  }
});

app.get('/api/v1/communication/safety/blocks', (req, res) => {
  try {
    const userId = (req.headers['x-user-id'] as string) || (req.query.userId as string) || 'usr_me';
    const blocks = SafetyService.getBlockedUsers(userId);
    res.json({ success: true, blocks });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to get blocks' });
  }
});

app.post('/api/v1/communication/safety/report', (req, res) => {
  try {
    const reporterId = (req.headers['x-user-id'] as string) || req.body.reporterId || 'usr_me';
    const { reportedUserId, messageId, conversationId, reason, details } = req.body;
    if (!reportedUserId || !reason) return res.status(400).json({ error: 'reportedUserId and reason are required' });
    const report = SafetyService.submitReport({ reporterId, reportedUserId, messageId, conversationId, reason, details });
    res.status(201).json({ success: true, report });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Report failed' });
  }
});

app.get('/api/v1/communication/safety/privacy', (req, res) => {
  try {
    const userId = (req.headers['x-user-id'] as string) || (req.query.userId as string) || 'usr_me';
    const privacy = SafetyService.getPrivacySettings(userId);
    res.json({ success: true, privacy });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to get privacy settings' });
  }
});

app.patch('/api/v1/communication/safety/privacy', (req, res) => {
  try {
    const userId = (req.headers['x-user-id'] as string) || req.body.userId || 'usr_me';
    const updated = SafetyService.updatePrivacySettings(userId, req.body);
    res.json({ success: true, privacy: updated });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to update privacy settings' });
  }
});

app.get('/api/v1/communication/safety/transparency', (_req, res) => {
  try {
    const disclosure = SafetyService.getSecurityTransparencyStatement();
    res.json({ success: true, disclosure });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to get disclosure' });
  }
});

// Global 404 handler for unmatched routes
app.use((_req, res) => {
  res.status(404).json({ error: 'Endpoint not found', code: 'NOT_FOUND' });
});

// Global Error Handler for graceful recovery
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[Unhandled Server Error]', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    code: err.code || 'INTERNAL_ERROR'
  });
});

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`🚀 FRIENDS Real-Time Messaging Server listening on http://127.0.0.1:${PORT}`);
});
