import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { db } from './db';
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

describe('Bring Your Own AI (BYOAI) & Multi-Provider Architecture', () => {
  const BASE_URL = 'http://127.0.0.1:3001/api';
  const TEST_USER = 'test_byoai_user_88';

  const cleanTestUser = () => {
    db.prepare('DELETE FROM user_ai_connections WHERE user_id = ?').run(TEST_USER);
    db.prepare('DELETE FROM user_ai_task_routing WHERE user_id = ?').run(TEST_USER);
    db.prepare('DELETE FROM user_ai_permissions WHERE user_id = ?').run(TEST_USER);
    db.prepare('DELETE FROM user_ai_spending_limits WHERE user_id = ?').run(TEST_USER);
    db.prepare('DELETE FROM ai_usage_records WHERE user_id = ?').run(TEST_USER);
  };

  beforeAll(() => {
    cleanTestUser();
  });

  afterAll(() => {
    cleanTestUser();
  });

  // 1. VAULT & ENVELOPE ENCRYPTION UNIT TESTS
  describe('1. AES-256-GCM Envelope Encryption & Masking', () => {
    it('encrypts and decrypts API keys accurately', () => {
      const originalKey = 'sk-proj-supersecretkey1234567890abcdefg';
      const encrypted = encryptApiKey(originalKey);

      expect(encrypted.ciphertext).toBeDefined();
      expect(encrypted.iv).toBeDefined();
      expect(encrypted.authTag).toBeDefined();
      expect(encrypted.ciphertext).not.toEqual(originalKey);

      const decrypted = decryptApiKey(encrypted.ciphertext, encrypted.iv, encrypted.authTag);
      expect(decrypted).toEqual(originalKey);
    });

    it('generates distinct random IVs and ciphertexts for identical plaintext', () => {
      const key = 'sk-test-identical-key-value-12345';
      const enc1 = encryptApiKey(key);
      const enc2 = encryptApiKey(key);

      expect(enc1.iv).not.toEqual(enc2.iv);
      expect(enc1.ciphertext).not.toEqual(enc2.ciphertext);
      expect(decryptApiKey(enc1.ciphertext, enc1.iv, enc1.authTag)).toEqual(key);
      expect(decryptApiKey(enc2.ciphertext, enc2.iv, enc2.authTag)).toEqual(key);
    });

    it('fails decryption if ciphertext or authTag is tampered', () => {
      const encrypted = encryptApiKey('sk-valid-key');
      const tamperedCiphertext = encrypted.ciphertext.slice(0, -2) + 'aa';

      expect(() => {
        decryptApiKey(tamperedCiphertext, encrypted.iv, encrypted.authTag);
      }).toThrow();
    });

    it('masks keys securely without revealing plaintext', () => {
      expect(maskApiKey('sk-1234567890abcdef')).toEqual('sk-1...cdef');
      expect(maskApiKey('short')).toEqual('****');
      expect(maskApiKey('')).toEqual('');
    });
  });

  // 2. SSRF ENDPOINT PROTECTION
  describe('2. Strict SSRF Protection for Custom & Local Endpoints', () => {
    it('accepts legitimate public HTTPS endpoints', () => {
      const res = validateCustomEndpoint('https://api.openai.com/v1');
      expect(res.valid).toBe(true);
    });

    it('allows localhost for Ollama local inference', () => {
      const res1 = validateCustomEndpoint('http://localhost:11434', true);
      const res2 = validateCustomEndpoint('http://127.0.0.1:11434', true);
      expect(res1.valid).toBe(true);
      expect(res2.valid).toBe(true);
    });

    it('blocks cloud metadata endpoint 169.254.169.254', () => {
      const res = validateCustomEndpoint('http://169.254.169.254/latest/meta-data');
      expect(res.valid).toBe(false);
      expect(res.error?.toLowerCase()).toContain('cloud metadata');
    });

    it('blocks internal RFC-1918 private subnets for cloud custom endpoints', () => {
      const res1 = validateCustomEndpoint('http://10.0.0.1:8000/v1', false);
      const res2 = validateCustomEndpoint('http://192.168.1.100:8000/v1', false);
      expect(res1.valid).toBe(false);
      expect(res2.valid).toBe(false);
    });

    it('blocks non-HTTP protocols', () => {
      const res = validateCustomEndpoint('ftp://malicious-host.com/v1');
      expect(res.valid).toBe(false);
      expect(res.error).toContain('HTTP or HTTPS');
    });
  });

  // 3. REGISTRY & SUPPORTED ADAPTERS
  describe('3. Multi-Provider Registry & Model Discovery', () => {
    it('registers all 7 required providers', () => {
      const supported = AIProviderRegistry.getSupportedProviderList();
      const ids = supported.map(s => s.id);

      expect(ids).toContain('openai');
      expect(ids).toContain('gemini');
      expect(ids).toContain('anthropic');
      expect(ids).toContain('mistral');
      expect(ids).toContain('openrouter');
      expect(ids).toContain('ollama');
      expect(ids).toContain('custom_openai');
    });

    it('exposes comprehensive model registry with capabilities and pricing', () => {
      const models = AIModelRegistry.getAllModels();
      expect(models.length).toBeGreaterThanOrEqual(15);

      const sonnet = models.find(m => m.id === 'claude-3-5-sonnet-20241022');
      expect(sonnet).toBeDefined();
      expect(sonnet?.provider).toBe('anthropic');
      expect(sonnet?.capabilities.streaming).toBe(true);
      expect(sonnet?.costPer1kInputUsd).toBeGreaterThan(0);

      const ollama = models.find(m => m.provider === 'ollama');
      expect(ollama).toBeDefined();
      expect(ollama?.costPer1kInputUsd).toBe(0); // Free local private execution
    });
  });

  // 4. ZERO-KNOWLEDGE CONTEXT CLEARANCE & SANITIZATION
  describe('4. Zero-Knowledge Context Permissions & Sanitization', () => {
    it('defaults to safe zero-knowledge (Vault & Journals strictly OFF)', () => {
      const perms = AIContextPermissionService.getPermissions(TEST_USER);
      expect(perms.allowProfileData).toBe(true);
      expect(perms.allowChatHistory).toBe(true);
      expect(perms.maxChatHistoryMessages).toBe(10);
      expect(perms.allowRelationshipVault).toBe(false);
      expect(perms.allowJournals).toBe(false);
      expect(perms.allowExternalSharing).toBe(true);
    });

    it('strictly omits Vault notes and Journals when permission is disabled', () => {
      const context = {
        partnerProfile: { name: 'Elena', bio: 'Artist', interests: ['Painting', 'Indie Rock'] },
        chatHistory: [
          { sender: 'You', text: 'Hey Elena' },
          { sender: 'Elena', text: 'Hey there!' }
        ],
        vaultNotes: 'Secret promise: agreed to never discuss previous ex',
        journalEntry: 'Unsent words: feeling deeply anxious about vulnerability'
      };

      const { sanitizedText, transmittedCategories } = AIContextPermissionService.sanitizeContext(TEST_USER, context);
      
      expect(transmittedCategories).toContain('partner_profile');
      expect(transmittedCategories).toContain('recent_chat_history');
      expect(transmittedCategories).not.toContain('relationship_vault');
      expect(transmittedCategories).not.toContain('personal_journal');

      expect(sanitizedText).not.toContain('Secret promise');
      expect(sanitizedText).not.toContain('Unsent words');
      expect(sanitizedText).toContain('Elena');
    });

    it('includes Vault notes only when user explicitly opts in', () => {
      AIContextPermissionService.updatePermissions(TEST_USER, { allowRelationshipVault: true });
      
      const context = {
        vaultNotes: 'User authorized vault note context'
      };

      const { sanitizedText, transmittedCategories } = AIContextPermissionService.sanitizeContext(TEST_USER, context);
      expect(transmittedCategories).toContain('relationship_vault');
      expect(sanitizedText).toContain('User authorized vault note context');
    });

    it('redacts everything when allowExternalSharing master kill-switch is flipped', () => {
      AIContextPermissionService.updatePermissions(TEST_USER, { allowExternalSharing: false });
      
      const context = {
        partnerProfile: { name: 'Elena' },
        chatHistory: [{ sender: 'You', text: 'Hello' }]
      };

      const { sanitizedText, transmittedCategories } = AIContextPermissionService.sanitizeContext(TEST_USER, context);
      expect(sanitizedText).toBe('');
      expect(transmittedCategories).toHaveLength(0);
    });
  });

  // 5. SPENDING LIMITS & AUTO-SUSPENSION
  describe('5. Spending Limits & Auto-Suspension Guardrails', () => {
    it('initializes default spending limits ($5/day, $50/mo)', () => {
      const limits = AIUsageTracker.getSpendingLimits(TEST_USER);
      expect(limits.dailyBudgetUsd).toBe(5.0);
      expect(limits.monthlyBudgetUsd).toBe(50.0);
      expect(limits.autoSuspendOnLimit).toBe(true);
      expect(limits.isSuspended).toBe(false);
    });

    it('enforces budget clearance and auto-suspends when limit exceeded', () => {
      // Set low daily budget of $0.05
      AIUsageTracker.updateSpendingLimits(TEST_USER, { dailyBudgetUsd: 0.05, autoSuspendOnLimit: true });

      // Record request costing $0.10
      AIUsageTracker.recordUsage(
        TEST_USER,
        'conn_1',
        'openai',
        'gpt-4o',
        'general_assistant',
        1000,
        500,
        0.10,
        'success',
        450
      );

      const clearance = AIUsageTracker.checkBudgetClearance(TEST_USER);
      expect(clearance.allowed).toBe(false);
      expect(clearance.reason).toContain('exceeded');

      const updatedLimits = AIUsageTracker.getSpendingLimits(TEST_USER);
      expect(updatedLimits.isSuspended).toBe(true);
    });
  });

  // 6. REST API INTEGRATION
  describe('6. REST Endpoints: Connections, Routing, and Telemetry', () => {
    let createdConnectionId = '';

    it('POST /api/ai/connections securely encrypts API key without leaking plaintext', async () => {
      const res = await fetch(`${BASE_URL}/ai/connections`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': TEST_USER
        },
        body: JSON.stringify({
          provider: 'anthropic',
          name: 'Personal Claude 3.5',
          apiKey: 'sk-ant-api03-verylongsecretkey1234567890abcdef',
          defaultModel: 'claude-3-5-sonnet-20241022'
        })
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.connection.id).toBeDefined();
      expect(data.connection.keyMask).toEqual('sk-a...cdef');
      expect(data.connection.apiKey).toBeUndefined(); // Zero plaintext leak
      createdConnectionId = data.connection.id;
    });

    it('GET /api/ai/connections lists user connections with masked credentials', async () => {
      const res = await fetch(`${BASE_URL}/ai/connections`, {
        headers: { 'x-user-id': TEST_USER }
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.connections.length).toBe(1);
      expect(data.connections[0].id).toBe(createdConnectionId);
      expect(data.connections[0].keyMask).toBe('sk-a...cdef');
      expect(data.connections[0].encrypted_api_key).toBeUndefined();
    });

    it('POST /api/ai/routing deploys task assignments with fallback consent', async () => {
      const res = await fetch(`${BASE_URL}/ai/routing`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': TEST_USER
        },
        body: JSON.stringify({
          routes: [
            {
              taskKey: 'chat_analysis',
              connectionId: createdConnectionId,
              modelId: 'claude-3-5-sonnet-20241022',
              allowFallback: true
            },
            {
              taskKey: 'writing_assistance',
              connectionId: createdConnectionId,
              modelId: 'claude-3-5-haiku-20241022',
              allowFallback: false
            }
          ]
        })
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.count).toBe(2);

      const getRes = await fetch(`${BASE_URL}/ai/routing`, {
        headers: { 'x-user-id': TEST_USER }
      });
      const getRoutes = await getRes.json();
      expect(getRoutes.routes.length).toBe(2);
      const chatRoute = getRoutes.routes.find((r: any) => r.taskKey === 'chat_analysis');
      expect(chatRoute.allowFallback).toBe(true);
    });

    it('GET /api/admin/ai/infrastructure returns platform telemetry without user transcripts', async () => {
      const res = await fetch(`${BASE_URL}/admin/ai/infrastructure`, {
        headers: { 'x-admin-id': 'usr_me' }
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(Array.isArray(data.providers)).toBe(true);
      expect(data.telemetry).toBeDefined();
      expect(data.telemetry.totalRequests).toBeGreaterThanOrEqual(0);
      expect(data.telemetry.activeConnectionsCount).toBeGreaterThanOrEqual(1);
      // No user-identifying transcripts or raw API keys in telemetry payload
      expect(JSON.stringify(data)).not.toContain('sk-ant-api03');
    });

    it('DELETE /api/ai/connections/:id permanently shreds the connection and clears task routing', async () => {
      const delRes = await fetch(`${BASE_URL}/ai/connections/${createdConnectionId}`, {
        method: 'DELETE',
        headers: { 'x-user-id': TEST_USER }
      });

      expect(delRes.status).toBe(200);
      const data = await delRes.json();
      expect(data.success).toBe(true);

      // Verify connection is gone
      const checkConn = db.prepare('SELECT * FROM user_ai_connections WHERE id = ?').get(createdConnectionId);
      expect(checkConn).toBeUndefined();

      // Verify task routing cleaned up
      const checkRoute = db.prepare('SELECT * FROM user_ai_task_routing WHERE connection_id = ?').all(createdConnectionId);
      expect(checkRoute).toHaveLength(0);
    });
  });
});
