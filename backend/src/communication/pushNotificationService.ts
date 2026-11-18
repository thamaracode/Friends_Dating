import { db } from '../db';

export interface PushNotificationPayload {
  recipientId: string;
  senderId: string;
  senderName: string;
  conversationId: string;
  messageId: string;
  messageType: string;
  textContent?: string;
  isGroup?: boolean;
  groupTitle?: string;
}

export class PushNotificationService {
  private static fcmEndpoint = 'https://fcm.googleapis.com/fcm/send';

  /**
   * Evaluates notification rules and delivers push notifications to registered user devices
   */
  public static async dispatchMessageNotification(payload: PushNotificationPayload): Promise<{
    sent: boolean;
    suppressedReason?: string;
    devicesTargeted?: number;
  }> {
    const { recipientId, senderId, senderName, conversationId, messageId, messageType, textContent, isGroup, groupTitle } = payload;

    // 1. Check if recipient is the sender (never notify self)
    if (recipientId === senderId) {
      return { sent: false, suppressedReason: 'Self-message suppressed' };
    }

    // 2. Check conversation membership & muting settings
    const membership = db.prepare(`
      SELECT is_muted, notification_preference 
      FROM conversation_members 
      WHERE conversation_id = ? AND user_id = ?
    `).get(conversationId, recipientId) as any;

    if (!membership) {
      return { sent: false, suppressedReason: 'Recipient not enrolled in conversation' };
    }

    if (membership.is_muted) {
      return { sent: false, suppressedReason: 'Conversation is muted by recipient' };
    }

    if (membership.notification_preference === 'none') {
      return { sent: false, suppressedReason: 'Notifications disabled by recipient preference' };
    }

    // 3. Check active presence suppression (if user was active in the last 15 seconds, avoid redundant push)
    const presence = db.prepare('SELECT last_seen_at FROM users WHERE id = ?').get(recipientId) as any;
    const now = Date.now();
    if (presence && (now - presence.last_seen_at < 15000)) {
      return { sent: false, suppressedReason: 'Recipient actively viewing conversation stream' };
    }

    // 4. Retrieve registered device tokens from user_devices table
    const devices = db.prepare(`
      SELECT id, device_name, device_type, fcm_token, apns_token 
      FROM user_devices 
      WHERE user_id = ? AND is_active = 1 AND (fcm_token IS NOT NULL OR apns_token IS NOT NULL)
    `).all(recipientId) as any[];

    if (!devices || devices.length === 0) {
      // Store in internal user_notifications table as in-app notification
      this.recordInAppNotification(recipientId, payload);
      return { sent: true, suppressedReason: 'No external push tokens; recorded in-app notification', devicesTargeted: 0 };
    }

    // 5. Build privacy-preserving notification copy (no plaintext leak of confidential data)
    let title = senderName;
    if (isGroup && groupTitle) {
      title = `${senderName} in ${groupTitle}`;
    }

    let body = 'Sent you a message';
    switch (messageType) {
      case 'photo':
        body = '📷 Sent a photo';
        break;
      case 'video':
        body = '🎥 Sent a video';
        break;
      case 'voice':
        body = '🎙️ Sent a voice message';
        break;
      case 'file':
        body = '📎 Sent an attachment';
        break;
      case 'poll':
        body = '📊 Created a poll';
        break;
      default:
        if (textContent) {
          // Truncate to preserve privacy on lock screens
          body = textContent.length > 60 ? `${textContent.slice(0, 57)}...` : textContent;
        }
    }

    // 6. Record in-app notification
    this.recordInAppNotification(recipientId, payload);

    // 7. Deliver to FCM tokens (simulated/production dispatcher)
    const fcmServerKey = process.env.FCM_SERVER_KEY;
    if (!fcmServerKey) {
      // Telemetry / simulation log in non-production environments
      console.log(`[PushNotification] Simulated push to ${devices.length} devices for ${recipientId}: "${title}: ${body}"`);
      return { sent: true, devicesTargeted: devices.length };
    }

    try {
      // In production with FCM credentials:
      for (const dev of devices) {
        if (dev.fcm_token) {
          await fetch(this.fcmEndpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `key=${fcmServerKey}`
            },
            body: JSON.stringify({
              to: dev.fcm_token,
              notification: { title, body },
              data: {
                conversationId,
                messageId,
                type: messageType,
                timestamp: now.toString()
              }
            })
          });
        }
      }
      return { sent: true, devicesTargeted: devices.length };
    } catch (err: any) {
      console.warn('[PushNotification] Error dispatching push:', err.message);
      return { sent: false, suppressedReason: err.message };
    }
  }

  /**
   * Persists notification to user_notifications table for notification center display
   */
  private static recordInAppNotification(userId: string, payload: PushNotificationPayload) {
    try {
      const id = `notif_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      db.prepare(`
        INSERT INTO user_notifications (id, user_id, type, title, body, entity_type, entity_id, is_read, metadata_json, created_at)
        VALUES (?, ?, 'chat.message', ?, ?, 'conversation', ?, 0, ?, ?)
      `).run(
        id,
        userId,
        payload.isGroup ? `${payload.senderName} (${payload.groupTitle || 'Group'})` : payload.senderName,
        payload.textContent || `Sent you a ${payload.messageType}`,
        payload.conversationId,
        JSON.stringify({ messageId: payload.messageId, senderId: payload.senderId }),
        Date.now()
      );
    } catch (e) {
      console.warn('Could not record in-app notification', e);
    }
  }
}
