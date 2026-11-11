import http from 'http';
import express from 'express';
import cors from 'cors';
import { WebSocketServer, WebSocket } from 'ws';
import { v4 as uuidv4 } from 'uuid';
import { db, initDatabase } from './db.js';

initDatabase();

const app = express();
app.use(cors());
app.use(express.json());

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

function handleClientSocketEvent(userId: string, event: any, ws: WebSocket) {
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
    broadcastToUser(event.recipientId, {
      type: 'call.signal',
      senderId: userId,
      signalData: event.signalData,
      callType: event.callType
    });
  }
}

// -------------------------------------------------------------
// REST API ENDPOINTS
// -------------------------------------------------------------

// Health check
app.get('/api/health', (req, res) => {
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

// 2. Get messages for conversation
app.get('/api/v1/conversations/:id/messages', (req, res) => {
  const { id } = req.params;
  const userId = (req.query.userId as string) || 'usr_me';

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
      m.created_at
    FROM messages m
    JOIN users u ON m.sender_id = u.id
    WHERE m.conversation_id = ?
    ORDER BY m.sequence_number ASC
  `).all(id) as any[];

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

  const result = messages.map(m => ({
    id: m.id,
    clientMessageId: m.client_message_id,
    conversationId: m.conversation_id,
    senderId: m.sender_id,
    senderName: m.sender_name,
    type: m.type,
    text: m.text,
    mediaUrl: m.media_url,
    voiceDurationSeconds: m.voice_duration,
    voiceWaveform: m.voice_waveform ? JSON.parse(m.voice_waveform) : undefined,
    timestamp: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    createdAt: m.created_at,
    isOutgoing: m.sender_id === userId,
    status: 'delivered',
    isEdited: Boolean(m.is_edited),
    isPinned: Boolean(m.is_pinned),
    reactions: reactionsMap.get(m.id) || []
  }));

  res.json({ success: true, messages: result });
});

// 3. Send message (Transactional with sequence numbering and idempotency)
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
    timestamp: new Date(now).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    createdAt: now,
    status: 'delivered'
  };

  // Broadcast real-time event to conversation members
  const members = db.prepare('SELECT user_id FROM conversation_members WHERE conversation_id = ?').all(id) as { user_id: string }[];
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

// 4. Toggle Reaction
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

  // Broadcast reaction update
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

// 5. Pin / Unpin Message
app.patch('/api/v1/messages/:id/pin', (req, res) => {
  const { id } = req.params;
  const msg = db.prepare('SELECT is_pinned, conversation_id FROM messages WHERE id = ?').get(id) as any;
  if (!msg) return res.status(404).json({ error: 'Message not found' });

  const nextVal = msg.is_pinned ? 0 : 1;
  db.prepare('UPDATE messages SET is_pinned = ? WHERE id = ?').run(nextVal, id);

  res.json({ success: true, isPinned: Boolean(nextVal) });
});

// 6. Delete Message
app.delete('/api/v1/messages/:id', (req, res) => {
  const { id } = req.params;
  db.prepare('DELETE FROM messages WHERE id = ?').run(id);
  res.json({ success: true, deleted: true });
});

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`🚀 FRIENDS Real-Time Messaging Server listening on http://127.0.0.1:${PORT}`);
});
