import http from 'http';
import path from 'path';
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { WebSocketServer, WebSocket } from 'ws';
import { v4 as uuidv4 } from 'uuid';
import { db, initDatabase } from './db.js';
import { recognizeSocialUrl, PLATFORM_REGISTRY } from './social-platforms/registry.js';

initDatabase();

const app = express();
app.use(cors());
app.use(express.json());

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
      c.updated_at,
      cm.is_pinned,
      cm.is_archived,
      cm.is_muted,
      cm.unread_count,
      cm.draft_text,
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
    LEFT JOIN conversation_members other ON c.id = other.conversation_id AND other.user_id != ?
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
    title: r.type === 'saved_messages' ? 'Saved Messages' : (r.partner_name || 'Match'),
    avatar: r.type === 'saved_messages' 
      ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80' 
      : (r.partner_avatar || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80'),
    isOnline: userSockets.has(r.partner_id || ''),
    lastSeenText: r.type === 'saved_messages' ? 'Your personal cloud' : (userSockets.has(r.partner_id || '') ? 'Online now' : 'Recently active'),
    isVerified: Boolean(r.partner_verified),
    category: r.type === 'saved_messages' ? 'saved_messages' : 'match',
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

  const result = messages.map(m => ({
    id: m.id,
    clientMessageId: m.client_message_id,
    conversationId: m.conversation_id,
    senderId: m.sender_id,
    senderName: m.sender_name,
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
    reactions: reactionsMap.get(m.id) || []
  }));

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

  // Security Check: Is sender blocked by recipient or vice-versa?
  const members = db.prepare('SELECT user_id FROM conversation_members WHERE conversation_id = ?').all(id) as { user_id: string }[];
  const recipient = members.find(m => m.user_id !== senderId);
  if (recipient) {
    const isBlocked = db.prepare('SELECT 1 FROM user_blocks WHERE blocker_id = ? AND blocked_id = ?').get(recipient.user_id, senderId);
    if (isBlocked) {
      return res.status(403).json({ error: 'Cannot send message: conversation is blocked' });
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
  });

  const { seq } = insertTx();

  const newMsg = {
    id: messageId,
    clientMessageId,
    conversationId: id,
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
  const { text, editorId = 'usr_me' } = req.body;

  if (!text) return res.status(400).json({ error: 'New text is required' });

  const msg = db.prepare('SELECT sender_id, text_content, conversation_id FROM messages WHERE id = ?').get(id) as any;
  if (!msg) return res.status(404).json({ error: 'Message not found' });
  if (msg.sender_id !== editorId) return res.status(403).json({ error: 'Only author can edit this message' });

  db.transaction(() => {
    // Record edit history
    db.prepare(`
      INSERT INTO message_edit_history (id, message_id, editor_id, previous_content, edited_at)
      VALUES (?, ?, ?, ?, ?)
    `).run(`ed_${uuidv4().slice(0, 8)}`, id, editorId, msg.text_content, Date.now());

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
  const forEveryone = req.query.forEveryone === 'true';

  const msg = db.prepare('SELECT conversation_id, sender_id FROM messages WHERE id = ?').get(id) as any;
  if (!msg) return res.status(404).json({ error: 'Message not found' });

  if (forEveryone) {
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

// 13. Privacy & Safety: Block and Unblock User
app.post('/api/v1/users/:id/block', (req, res) => {
  const { id: blockedId } = req.params;
  const { blockerId = 'usr_me' } = req.body;

  try {
    db.prepare('INSERT OR IGNORE INTO user_blocks (blocker_id, blocked_id, created_at) VALUES (?, ?, ?)')
      .run(blockerId, blockedId, Date.now());
    res.json({ success: true, blocked: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/v1/users/:id/block', (req, res) => {
  const { id: blockedId } = req.params;
  const { blockerId = 'usr_me' } = req.body;

  db.prepare('DELETE FROM user_blocks WHERE blocker_id = ? AND blocked_id = ?').run(blockerId, blockedId);
  res.json({ success: true, blocked: false });
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



const PORT = 3001;
server.listen(PORT, () => {
  console.log(`🚀 FRIENDS Real-Time Messaging Server listening on http://127.0.0.1:${PORT}`);
});
