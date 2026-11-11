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

function checkUserBlocked(userA: string, userB: string): boolean {
  if (!userA || !userB || userA === userB) return false;
  const blocked = db.prepare(`
    SELECT 1 FROM user_blocks 
    WHERE (blocker_id = ? AND blocked_id = ?) OR (blocker_id = ? AND blocked_id = ?)
  `).get(userA, userB, userB, userA);
  return !!blocked;
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



const PORT = 3001;
server.listen(PORT, () => {
  console.log(`🚀 FRIENDS Real-Time Messaging Server listening on http://127.0.0.1:${PORT}`);
});
