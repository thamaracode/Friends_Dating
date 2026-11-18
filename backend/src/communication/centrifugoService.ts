import crypto from 'crypto';
import http from 'http';
import { db } from '../db';
import { SafetyService } from './safetyService';

export interface CentrifugoConfig {
  apiUrl: string;
  apiKey: string;
  tokenSecret: string;
  enabled: boolean;
}

export interface CentrifugoTokenOptions {
  userId: string;
  channel?: string;
  ttlSeconds?: number;
  info?: Record<string, any>;
}

export class CentrifugoService {
  private static config: CentrifugoConfig = {
    apiUrl: process.env.CENTRIFUGO_API_URL || 'http://127.0.0.1:8000/api',
    apiKey: process.env.CENTRIFUGO_API_KEY || 'soulverse-centrifugo-api-key-hyper-secure-token',
    tokenSecret: process.env.CENTRIFUGO_TOKEN_HMAC_SECRET_KEY || 'soulverse-centrifugo-hmac-sha256-secret-key-auth',
    enabled: process.env.CENTRIFUGO_ENABLED !== 'false'
  };

  private static isServerReachable: boolean | null = null;
  private static lastHealthCheck: number = 0;

  /**
   * Encodes a JSON object or string into Base64URL format without padding (RFC 7515)
   */
  public static base64UrlEncode(data: string | Buffer): string {
    const buf = Buffer.isBuffer(data) ? data : Buffer.from(data, 'utf-8');
    return buf.toString('base64')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');
  }

  /**
   * Generates a signed HMAC-SHA256 JSON Web Token for Centrifugo connection authentication
   */
  public static generateConnectionToken(userId: string, ttlSeconds: number = 86400, info?: Record<string, any>): string {
    const now = Math.floor(Date.now() / 1000);
    const header = {
      alg: 'HS256',
      typ: 'JWT'
    };

    const payload: Record<string, any> = {
      sub: userId,
      iat: now,
      exp: now + ttlSeconds
    };

    if (info) {
      payload.info = info;
    }

    const headerEncoded = this.base64UrlEncode(JSON.stringify(header));
    const payloadEncoded = this.base64UrlEncode(JSON.stringify(payload));
    const unsignedToken = `${headerEncoded}.${payloadEncoded}`;

    const signature = crypto
      .createHmac('sha256', this.config.tokenSecret)
      .update(unsignedToken)
      .digest();

    const signatureEncoded = this.base64UrlEncode(signature);
    return `${unsignedToken}.${signatureEncoded}`;
  }

  /**
   * Generates a signed HMAC-SHA256 Subscription Token for private/protected channel subscriptions
   */
  public static generateSubscriptionToken(userId: string, channel: string, ttlSeconds: number = 86400, info?: Record<string, any>): string {
    const now = Math.floor(Date.now() / 1000);
    const header = {
      alg: 'HS256',
      typ: 'JWT'
    };

    const payload: Record<string, any> = {
      sub: userId,
      channel,
      iat: now,
      exp: now + ttlSeconds
    };

    if (info) {
      payload.info = info;
    }

    const headerEncoded = this.base64UrlEncode(JSON.stringify(header));
    const payloadEncoded = this.base64UrlEncode(JSON.stringify(payload));
    const unsignedToken = `${headerEncoded}.${payloadEncoded}`;

    const signature = crypto
      .createHmac('sha256', this.config.tokenSecret)
      .update(unsignedToken)
      .digest();

    const signatureEncoded = this.base64UrlEncode(signature);
    return `${unsignedToken}.${signatureEncoded}`;
  }

  /**
   * Validates whether a user is authorized to subscribe to a specific conversation channel
   */
  public static authorizeChannelSubscription(userId: string, channel: string): { authorized: boolean; reason?: string } {
    // 1. User specific channel: user:${userId}
    if (channel.startsWith('user:')) {
      const targetUserId = channel.replace('user:', '');
      if (targetUserId === userId) {
        return { authorized: true };
      }
      return { authorized: false, reason: 'Unauthorized user notification channel' };
    }

    // 2. Direct or Group conversation channel: dialog:${conversationId}
    if (channel.startsWith('dialog:')) {
      const conversationId = channel.replace('dialog:', '');
      const membership = db.prepare('SELECT role FROM conversation_members WHERE conversation_id = ? AND user_id = ?')
        .get(conversationId, userId) as any;

      if (!membership) {
        return { authorized: false, reason: 'User is not a member of this conversation' };
      }

      // Check if conversation has active block between direct participants
      const conv = db.prepare('SELECT type FROM conversations WHERE id = ?').get(conversationId) as any;
      if (conv && conv.type === 'direct') {
        const otherMember = db.prepare('SELECT user_id FROM conversation_members WHERE conversation_id = ? AND user_id != ?')
          .get(conversationId, userId) as any;
        if (otherMember && SafetyService.isBlocked(userId, otherMember.user_id)) {
          return { authorized: false, reason: 'Conversation inaccessible due to active safety block' };
        }
      }

      return { authorized: true };
    }

    // 3. Group channel: group:${groupId}
    if (channel.startsWith('group:')) {
      const conversationId = channel.replace('group:', '');
      const membership = db.prepare('SELECT role FROM conversation_members WHERE conversation_id = ? AND user_id = ?')
        .get(conversationId, userId) as any;

      if (!membership) {
        return { authorized: false, reason: 'User is not an active member of this group' };
      }
      return { authorized: true };
    }

    return { authorized: false, reason: 'Unknown channel namespace' };
  }

  /**
   * Publishes an event payload to a Centrifugo channel via the Server HTTP API
   */
  public static async publish(channel: string, data: any): Promise<{ success: boolean; error?: string }> {
    return this.sendApiCommand('publish', { channel, data });
  }

  /**
   * Broadcasts an event to multiple Centrifugo channels simultaneously
   */
  public static async broadcast(channels: string[], data: any): Promise<{ success: boolean; error?: string }> {
    return this.sendApiCommand('broadcast', { channels, data });
  }

  /**
   * Checks whether the Centrifugo daemon is reachable and responding
   */
  public static async isAvailable(): Promise<boolean> {
    const now = Date.now();
    // Cache health check for 10 seconds to minimize overhead
    if (this.isServerReachable !== null && (now - this.lastHealthCheck < 10000)) {
      return this.isServerReachable;
    }

    try {
      const res = await this.sendApiCommand('info', {}, 800);
      this.isServerReachable = res.success;
      this.lastHealthCheck = now;
      return this.isServerReachable;
    } catch {
      this.isServerReachable = false;
      this.lastHealthCheck = now;
      return false;
    }
  }

  /**
   * Executes a command against Centrifugo Server HTTP API
   */
  private static async sendApiCommand(method: string, params: Record<string, any>, timeoutMs: number = 2500): Promise<{ success: boolean; error?: string; result?: any }> {
    return new Promise((resolve) => {
      try {
        const postData = JSON.stringify({ method, params });
        const url = new URL(`${this.config.apiUrl}/${method}`);

        const req = http.request(
          {
            hostname: url.hostname,
            port: url.port || 8000,
            path: url.pathname,
            method: 'POST',
            timeout: timeoutMs,
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `apikey ${this.config.apiKey}`,
              'Content-Length': Buffer.byteLength(postData)
            }
          },
          (res) => {
            let body = '';
            res.on('data', chunk => { body += chunk; });
            res.on('end', () => {
              if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
                try {
                  const parsed = JSON.parse(body);
                  resolve({ success: true, result: parsed.result });
                } catch {
                  resolve({ success: true });
                }
              } else {
                resolve({ success: false, error: `Centrifugo HTTP error: ${res.statusCode}` });
              }
            });
          }
        );

        req.on('timeout', () => {
          req.destroy();
          resolve({ success: false, error: 'Centrifugo request timeout' });
        });

        req.on('error', (err) => {
          resolve({ success: false, error: err.message });
        });

        req.write(postData);
        req.end();
      } catch (err: any) {
        resolve({ success: false, error: err.message });
      }
    });
  }
}
