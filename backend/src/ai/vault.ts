import crypto from 'crypto';

// Master derivation salt and key for AES-256-GCM envelope encryption
const VAULT_SALT = 'soulverse_byoai_vault_salt_2026';
const RAW_SECRET = process.env.AI_VAULT_SECRET || 'soulverse_master_secure_vault_byoai_2026_aes256gcm';
const MASTER_KEY = crypto.scryptSync(RAW_SECRET, VAULT_SALT, 32);

export interface EncryptedPayload {
  ciphertext: string;
  iv: string;
  authTag: string;
}

/**
 * Encrypts an API key using AES-256-GCM envelope encryption.
 */
export function encryptApiKey(plaintext: string): EncryptedPayload {
  if (!plaintext) {
    throw new Error('Cannot encrypt empty credential');
  }
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', MASTER_KEY, iv);
  let ciphertext = cipher.update(plaintext, 'utf8', 'hex');
  ciphertext += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');

  return {
    ciphertext,
    iv: iv.toString('hex'),
    authTag
  };
}

/**
 * Decrypts an envelope-encrypted API key using AES-256-GCM.
 */
export function decryptApiKey(ciphertext: string, ivHex: string, authTagHex: string): string {
  if (!ciphertext || !ivHex || !authTagHex) {
    throw new Error('Incomplete encryption payload for decryption');
  }
  const decipher = crypto.createDecipheriv('aes-256-gcm', MASTER_KEY, Buffer.from(ivHex, 'hex'));
  decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));
  let decrypted = decipher.update(ciphertext, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

/**
 * Returns a masked version of the key (e.g. sk-12...9a4b).
 * Never exposes the full plaintext key to client responses or logs.
 */
export function maskApiKey(key: string): string {
  if (!key) return '';
  const trimmed = key.trim();
  if (trimmed.length <= 8) return '****';
  return `${trimmed.slice(0, 4)}...${trimmed.slice(-4)}`;
}

/**
 * Validates custom endpoints with strict SSRF protection.
 * Ollama or local inference may use localhost or 127.0.0.1.
 * Cloud metadata endpoints (169.254.169.254) and forbidden private ranges are blocked.
 */
export function validateCustomEndpoint(
  urlStr: string,
  allowLocalhost: boolean = false
): { isValid: boolean; valid: boolean; error?: string; normalizedUrl?: string } {
  try {
    const trimmed = urlStr.trim();
    if (!trimmed) {
      return { isValid: false, valid: false, error: 'Endpoint URL is required' };
    }

    const parsed = new URL(trimmed);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return { isValid: false, valid: false, error: 'Endpoint protocol must be HTTP or HTTPS' };
    }

    const hostname = parsed.hostname.toLowerCase();

    // Allow localhost only if explicit local adapter (e.g. Ollama, LM Studio)
    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1') {
      if (allowLocalhost) {
        return { isValid: true, valid: true, normalizedUrl: parsed.origin + (parsed.pathname === '/' ? '' : parsed.pathname) };
      }
      return { isValid: false, valid: false, error: 'Localhost addresses are restricted to local engines (e.g. Ollama)' };
    }

    // SSRF blocks: Cloud instance metadata service (AWS/GCP/Azure)
    if (hostname === '169.254.169.254' || hostname === 'metadata.google.internal') {
      return { isValid: false, valid: false, error: 'Cloud metadata service access is strictly blocked' };
    }

    // SSRF blocks: Internal RFC-1918 private IPv4 subnets
    if (
      hostname.startsWith('10.') ||
      hostname.startsWith('192.168.') ||
      (hostname.startsWith('172.') && (() => {
        const parts = hostname.split('.');
        const second = parseInt(parts[1], 10);
        return second >= 16 && second <= 31;
      })())
    ) {
      if (!allowLocalhost) {
        return { isValid: false, valid: false, error: 'Private corporate and intranet IP subnets are blocked' };
      }
    }

    return { isValid: true, valid: true, normalizedUrl: parsed.origin + (parsed.pathname === '/' ? '' : parsed.pathname) };
  } catch (err: any) {
    return { isValid: false, valid: false, error: 'Malformed endpoint URL' };
  }
}
