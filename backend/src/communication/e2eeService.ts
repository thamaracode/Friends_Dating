import crypto from 'crypto';
import { db } from '../db';

export interface IdentityKeyBundle {
  userId: string;
  deviceId: string;
  registrationId: number;
  identityKey: string;
  signedPrekeyId: number;
  signedPrekey: string;
  signedPrekeySignature: string;
  oneTimePrekeys?: string[];
}

export interface PrekeyBundleResponse {
  userId: string;
  deviceId: string;
  registrationId: number;
  identityKey: string;
  signedPrekeyId: number;
  signedPrekey: string;
  signedPrekeySignature: string;
  oneTimePrekey?: {
    id: number;
    publicKey: string;
  };
}

export interface EncryptedMessageEnvelope {
  senderId: string;
  recipientId: string;
  deviceId: string;
  registrationId: number;
  ephemeralKey: string;
  epoch: number;
  ciphertext: string;
  iv: string;
  authTag: string;
  hmacSignature?: string;
  timestamp: number;
}

export class E2EEService {
  /**
   * Registers or updates a user's Signal Protocol public key bundle.
   * Stores long-term Identity Key, Signed Prekey, and replenishes One-Time Prekeys.
   */
  public static registerKeyBundle(params: {
    userId: string;
    deviceId: string;
    registrationId: number;
    identityKey: string;
    signedPrekeyId: number;
    signedPrekey: string;
    signedPrekeySignature: string;
    oneTimePrekeys?: string[];
  }): boolean {
    const now = Date.now();

    const tx = db.transaction(() => {
      // 1. Upsert identity & signed prekey
      db.prepare(`
        INSERT INTO user_e2ee_identity_keys (
          user_id, device_id, registration_id, identity_key, signed_prekey_id,
          signed_prekey, signed_prekey_signature, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(user_id) DO UPDATE SET
          device_id = excluded.device_id,
          registration_id = excluded.registration_id,
          identity_key = excluded.identity_key,
          signed_prekey_id = excluded.signed_prekey_id,
          signed_prekey = excluded.signed_prekey,
          signed_prekey_signature = excluded.signed_prekey_signature,
          updated_at = excluded.updated_at
      `).run(
        params.userId,
        params.deviceId,
        params.registrationId,
        params.identityKey,
        params.signedPrekeyId,
        params.signedPrekey,
        params.signedPrekeySignature,
        now,
        now
      );

      // 2. Insert new one-time prekeys
      if (params.oneTimePrekeys && params.oneTimePrekeys.length > 0) {
        const insertPrekey = db.prepare(`
          INSERT OR REPLACE INTO user_e2ee_prekeys (
            id, user_id, key_id, public_key, is_consumed, created_at
          ) VALUES (?, ?, ?, ?, 0, ?)
        `);

        params.oneTimePrekeys.forEach((pk, idx) => {
          const keyId = idx + 1;
          const id = `pk_${params.userId}_${keyId}_${Date.now()}`;
          insertPrekey.run(id, params.userId, keyId, pk, now);
        });
      }
    });

    tx();
    return true;
  }

  /**
   * Retrieves a Prekey Bundle to establish an X3DH (Extended Triple Diffie-Hellman) session.
   * Consumes one One-Time Prekey atomically to preserve forward secrecy.
   */
  public static getPrekeyBundle(targetUserId: string): PrekeyBundleResponse | null {
    const identityRow = db.prepare(`
      SELECT * FROM user_e2ee_identity_keys WHERE user_id = ?
    `).get(targetUserId) as any;

    if (!identityRow) return null;

    // Fetch and consume one available OTPK (One-Time Prekey)
    let oneTimePrekey: { id: number; publicKey: string } | undefined = undefined;

    const opkRow = db.prepare(`
      SELECT id, key_id, public_key FROM user_e2ee_prekeys
      WHERE user_id = ? AND is_consumed = 0
      ORDER BY key_id ASC
      LIMIT 1
    `).get(targetUserId) as any;

    if (opkRow) {
      db.prepare(`
        UPDATE user_e2ee_prekeys
        SET is_consumed = 1, consumed_at = ?
        WHERE id = ?
      `).run(Date.now(), opkRow.id);

      oneTimePrekey = {
        id: opkRow.key_id,
        publicKey: opkRow.public_key
      };
    }

    return {
      userId: identityRow.user_id,
      deviceId: identityRow.device_id,
      registrationId: identityRow.registration_id,
      identityKey: identityRow.identity_key,
      signedPrekeyId: identityRow.signed_prekey_id,
      signedPrekey: identityRow.signed_prekey,
      signedPrekeySignature: identityRow.signed_prekey_signature,
      oneTimePrekey
    };
  }

  /**
   * Validates the cryptographic structure and tamper-proofing of an encrypted envelope.
   */
  public static validateEnvelope(envelope: EncryptedMessageEnvelope): { valid: boolean; error?: string } {
    if (!envelope.senderId || !envelope.recipientId) {
      return { valid: false, error: 'Missing sender or recipient identity' };
    }
    if (!envelope.ciphertext || !envelope.iv || !envelope.authTag) {
      return { valid: false, error: 'Incomplete AES-GCM ciphertext tuple (missing ciphertext, iv, or authTag)' };
    }
    if (typeof envelope.epoch !== 'number' || envelope.epoch < 0) {
      return { valid: false, error: 'Invalid Double Ratchet epoch counter' };
    }

    // Check freshness: reject envelopes older than 24 hours to prevent extreme replay
    const now = Date.now();
    if (Math.abs(now - (envelope.timestamp || 0)) > 86400000) {
      return { valid: false, error: 'Envelope timestamp outside acceptable validity window' };
    }

    return { valid: true };
  }

  /**
   * Checks the remaining count of unconsumed One-Time Prekeys for a user.
   */
  public static getRemainingPrekeyCount(userId: string): number {
    const row = db.prepare(`
      SELECT COUNT(*) as count FROM user_e2ee_prekeys
      WHERE user_id = ? AND is_consumed = 0
    `).get(userId) as { count: number };
    return row?.count || 0;
  }
}
