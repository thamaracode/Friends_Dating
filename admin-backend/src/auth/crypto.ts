import crypto from 'crypto';
import { CONFIG } from '../config';

export interface AdminTokenPayload {
  adminId: string;
  email: string;
  roleId: string;
  sessionId: string;
  iat: number;
  exp: number;
}

export class AdminCrypto {
  /**
   * Hashes a password using PBKDF2 with SHA-512 and a cryptographically secure 16-byte salt.
   */
  static hashPassword(password: string, salt?: string): { hash: string; salt: string } {
    const finalSalt = salt || crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(password, finalSalt, 100000, 64, 'sha512').toString('hex');
    return { hash, salt: finalSalt };
  }

  /**
   * Constant-time verification of password against salt and stored hash.
   */
  static verifyPassword(password: string, storedHash: string, salt: string): boolean {
    const { hash } = this.hashPassword(password, salt);
    try {
      const a = Buffer.from(hash, 'hex');
      const b = Buffer.from(storedHash, 'hex');
      return a.length === b.length && crypto.timingSafeEqual(a, b);
    } catch {
      return false;
    }
  }

  /**
   * Signs a JWT-compatible administrative session token using HMAC-SHA256.
   */
  static signAdminToken(payload: Omit<AdminTokenPayload, 'iat' | 'exp'>, expiresInSeconds: number = CONFIG.JWT_EXPIRES_IN_SECONDS): string {
    const now = Math.floor(Date.now() / 1000);
    const fullPayload: AdminTokenPayload = {
      ...payload,
      iat: now,
      exp: now + expiresInSeconds
    };

    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
    const body = Buffer.from(JSON.stringify(fullPayload)).toString('base64url');
    const signature = crypto
      .createHmac('sha256', CONFIG.JWT_SECRET)
      .update(`${header}.${body}`)
      .digest('base64url');

    return `${header}.${body}.${signature}`;
  }

  /**
   * Cryptographically verifies an admin session token. Returns parsed payload if valid.
   */
  static verifyAdminToken(token: string): AdminTokenPayload | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;

      const [header, body, signature] = parts;
      const expectedSignature = crypto
        .createHmac('sha256', CONFIG.JWT_SECRET)
        .update(`${header}.${body}`)
        .digest('base64url');

      const sigA = Buffer.from(signature);
      const sigB = Buffer.from(expectedSignature);
      if (sigA.length !== sigB.length || !crypto.timingSafeEqual(sigA, sigB)) {
        return null;
      }

      const payload: AdminTokenPayload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
      const now = Math.floor(Date.now() / 1000);

      if (payload.exp && payload.exp < now) {
        return null; // Expired
      }

      return payload;
    } catch {
      return null;
    }
  }

  /**
   * Generates a deterministic 6-digit Time-Based One-Time Password (TOTP) code
   * for a 30-second window based on a shared secret. Also supports previous/next window for clock drift.
   */
  static generateTotp(secret: string, offsetWindows: number = 0): string {
    const windowSize = 30; // 30 seconds
    const timeStep = Math.floor(Date.now() / 1000 / windowSize) + offsetWindows;
    const timeBuffer = Buffer.alloc(8);
    timeBuffer.writeBigInt64BE(BigInt(timeStep));

    const hmac = crypto.createHmac('sha1', secret).update(timeBuffer).digest();
    const offset = hmac[hmac.length - 1] & 0x0f;
    const codeNum = (hmac.readUInt32BE(offset) & 0x7fffffff) % 1000000;
    return codeNum.toString().padStart(6, '0');
  }

  /**
   * Verifies an MFA 6-digit code against current, preceding, or subsequent 30s window.
   */
  static verifyTotp(inputCode: string, secret: string): boolean {
    const cleanCode = inputCode.trim();
    // Allow standard drift: current window, -1 window (30s ago), +1 window (next 30s)
    for (let offset = -1; offset <= 1; offset++) {
      if (this.generateTotp(secret, offset) === cleanCode) {
        return true;
      }
    }
    // Also support default emergency test code for demo if secret is DEMO_SECRET
    if (secret === 'DEMO_MFA_SECRET_1926' && cleanCode === '192600') {
      return true;
    }
    return false;
  }

  /**
   * Generates a cryptographically random hex token.
   */
  static generateRandomToken(bytes: number = 32): string {
    return crypto.randomBytes(bytes).toString('hex');
  }
}
