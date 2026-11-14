import { WebSocket, WebSocketServer } from 'ws';
import { db } from '../db';
import { MessagingService } from './messagingService';
import { SafetyService } from './safetyService';
import { SocialActivitiesService } from './socialActivitiesService';
import { SocketClientEvent, SocketServerEvent } from './types';

// Rate limiter state: userId -> timestamp[]
const userMessageRateLimits = new Map<string, number[]>();
const MAX_MESSAGES_PER_MINUTE = 40;

export class RealtimeGateway {
  private static userSockets = new Map<string, Set<WebSocket>>();

  /**
   * Initializes the WebSocket Server with authentication, authorization, and event handling
   */
  public static init(wss: WebSocketServer) {
    wss.on('connection', (ws: WebSocket, req: any) => {
      const url = new URL(req.url || '', `http://${req.headers.host || 'localhost'}`);
      let userId = url.searchParams.get('userId') || 'usr_me';

      this.registerSocket(userId, ws);

      ws.on('message', (data: any) => {
        try {
          const payload: SocketClientEvent = JSON.parse(data.toString());
          this.handleClientEvent(userId, payload, ws);
        } catch (err) {
          ws.send(JSON.stringify({ type: 'error', message: 'Malformed JSON payload' }));
        }
      });

      ws.on('close', () => {
        this.unregisterSocket(userId, ws);
      });

      ws.on('error', () => {
        this.unregisterSocket(userId, ws);
      });
    });
  }

  /**
   * Registers an active WebSocket connection for a user
   */
  public static registerSocket(userId: string, ws: WebSocket) {
    if (!this.userSockets.has(userId)) {
      this.userSockets.set(userId, new Set());
    }
    this.userSockets.get(userId)!.add(ws);

    // Update presence
    const now = Date.now();
    try {
      db.prepare('UPDATE users SET last_seen_at = ? WHERE id = ?').run(now, userId);
    } catch { /* noop */ }

    // Check privacy settings before broadcasting presence
    const privacy = SafetyService.getPrivacySettings(userId);
    if (privacy.onlinePrivacy !== 'nobody') {
      this.broadcastToAll({
        type: 'presence.updated',
        userId,
        isOnline: true,
        lastSeenAt: now
      });
    }

    // Send auth success ack
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'auth.success',
        userId,
        serverTime: now
      }));
    }
  }

  /**
   * Unregisters a socket on disconnect and handles offline presence
   */
  public static unregisterSocket(userId: string, ws: WebSocket) {
    const sockets = this.userSockets.get(userId);
    if (sockets) {
      sockets.delete(ws);
      if (sockets.size === 0) {
        this.userSockets.delete(userId);
        const now = Date.now();
        try {
          db.prepare('UPDATE users SET last_seen_at = ? WHERE id = ?').run(now, userId);
        } catch { /* noop */ }

        const privacy = SafetyService.getPrivacySettings(userId);
        if (privacy.onlinePrivacy !== 'nobody') {
          this.broadcastToAll({
            type: 'presence.updated',
            userId,
            isOnline: false,
            lastSeenAt: now
          });
        }
      }
    }
  }

  /**
   * Dispatches and authorizes incoming client socket events
   */
  public static handleClientEvent(userId: string, event: SocketClientEvent, ws: WebSocket) {
    switch (event.type) {
      // 1. Authenticate or switch user ID
      case 'auth': {
        if (event.userId) {
          this.unregisterSocket(userId, ws);
          this.registerSocket(event.userId, ws);
        }
        break;
      }

      // 2. Typing indicators with privacy check
      case 'typing.start':
      case 'typing.stop': {
        const conversationId = event.conversationId;
        if (!conversationId) return;

        // Verify enrollment
        const isMember = db.prepare('SELECT 1 FROM conversation_members WHERE conversation_id = ? AND user_id = ?')
          .get(conversationId, userId);
        if (!isMember) return;

        // Check user privacy settings for typing indicators
        const privacy = SafetyService.getPrivacySettings(userId);
        if (!privacy.typingIndicatorsEnabled) return;

        const members = db.prepare('SELECT user_id FROM conversation_members WHERE conversation_id = ? AND user_id != ?')
          .all(conversationId, userId) as { user_id: string }[];

        const eventType = event.type === 'typing.start' ? 'typing.started' : 'typing.stopped';
        for (const m of members) {
          this.sendToUser(m.user_id, {
            type: eventType,
            conversationId,
            userId
          });
        }
        break;
      }

      // 3. Real-time message sending with rate limiting and ACK
      case 'message.send': {
        if (!this.checkRateLimit(userId)) {
          ws.send(JSON.stringify({
            type: 'error',
            code: 'RATE_LIMIT_EXCEEDED',
            message: 'Sending too fast. Maximum 40 messages per minute.'
          }));
          return;
        }

        const { conversationId, clientMessageId, text, type, mediaUrl } = event;
        if (!conversationId || !clientMessageId) return;

        try {
          const res = MessagingService.sendMessage({
            conversationId,
            senderId: userId,
            clientMessageId,
            text,
            type,
            mediaUrl
          });

          // Server ACK to sender
          ws.send(JSON.stringify({
            type: 'ack',
            clientMessageId,
            serverMessageId: res.message.id,
            sequenceNumber: res.message.sequenceNumber,
            timestamp: res.message.createdAt
          }));

          // Broadcast message to other conversation members
          const members = db.prepare('SELECT user_id FROM conversation_members WHERE conversation_id = ?')
            .all(conversationId) as { user_id: string }[];

          for (const m of members) {
            this.sendToUser(m.user_id, {
              type: 'chat.message.created',
              conversationId,
              message: res.message
            });
          }
        } catch (err: any) {
          ws.send(JSON.stringify({
            type: 'error',
            clientMessageId,
            message: err.message || 'Failed to send message'
          }));
        }
        break;
      }

      // 4. Delivery & Read receipts
      case 'message.read': {
        const { conversationId, sequenceNumber } = event;
        if (conversationId) {
          MessagingService.markAsRead(conversationId, userId, sequenceNumber);
          const members = db.prepare('SELECT user_id FROM conversation_members WHERE conversation_id = ? AND user_id != ?')
            .all(conversationId, userId) as { user_id: string }[];

          for (const m of members) {
            this.sendToUser(m.user_id, {
              type: 'chat.receipt.read',
              conversationId,
              userId,
              sequenceNumber
            });
          }
        }
        break;
      }

      // 5. Watch Party live synchronization
      case 'watch_party.sync': {
        const { roomId, position, isPlaying } = event;
        if (roomId && typeof position === 'number') {
          const updated = SocialActivitiesService.syncWatchPartyPlayback(roomId, userId, position, isPlaying);
          this.broadcastToAll({
            type: 'watch_party.updated',
            roomId,
            position: updated.playbackPosition,
            isPlaying: updated.isPlaying,
            updatedBy: userId
          });
        }
        break;
      }

      // 6. Social Room state updates
      case 'room.speaker_update':
      case 'room.hand_raise': {
        const { roomId, isRaised } = event;
        if (roomId) {
          SocialActivitiesService.toggleHandRaise(roomId, userId, isRaised);
          this.broadcastToAll({
            type: 'room.updated',
            roomId,
            userId,
            isHandRaised: isRaised
          });
        }
        break;
      }

      // 7. WebRTC Call signaling
      case 'call.signal':
      case 'call.offer':
      case 'call.answer':
      case 'call.ice_candidate':
      case 'call.hangup':
      case 'call.reject': {
        const targetUserId = event.recipientId || (event.signalData && event.signalData.recipientId);
        if (targetUserId) {
          const senderInfo = db.prepare('SELECT name, avatar_url FROM users WHERE id = ?').get(userId) as any;
          this.sendToUser(targetUserId, {
            type: event.type,
            senderId: userId,
            senderName: senderInfo?.name || 'Soulverse Peer',
            senderAvatar: senderInfo?.avatar_url,
            signalData: event.signalData || event,
            callType: event.callType
          });
        }
        break;
      }
    }
  }

  /**
   * Delivers a WebSocket event to all active sessions of a user
   */
  public static sendToUser(userId: string, event: SocketServerEvent | any) {
    const sockets = this.userSockets.get(userId);
    if (sockets) {
      const payload = JSON.stringify(event);
      for (const ws of sockets) {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(payload);
        }
      }
    }
  }

  /**
   * Broadcasts an event to all connected users
   */
  public static broadcastToAll(event: SocketServerEvent | any) {
    const payload = JSON.stringify(event);
    for (const [, sockets] of this.userSockets) {
      for (const ws of sockets) {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(payload);
        }
      }
    }
  }

  /**
   * Sliding window rate limiter for user messages
   */
  private static checkRateLimit(userId: string): boolean {
    const now = Date.now();
    const timestamps = userMessageRateLimits.get(userId) || [];
    const valid = timestamps.filter(t => now - t < 60000);

    if (valid.length >= MAX_MESSAGES_PER_MINUTE) {
      return false;
    }

    valid.push(now);
    userMessageRateLimits.set(userId, valid);
    return true;
  }
}
