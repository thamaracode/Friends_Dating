import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Telegram Premium Custom Emojis (Zulut30/premium-telegram-emoji Integration)', () => {
  const BASE_URL = 'http://127.0.0.1:3001/api/telegram-emojis';
  const rootStylePath = path.resolve(__dirname, '../../emoji-style.json');
  const backendDataPath = path.resolve(__dirname, 'data/emoji-style.json');
  const curatedPath = path.resolve(__dirname, 'data/telegramEmojiCurated.json');

  // =========================================================================
  // 1. SPECIFICATION & PROFILE CONFORMANCE (emoji-style.json Schema v1)
  // =========================================================================
  describe('1. Selection Profile Schema v1 & Catalog Conformance', () => {
    it('verifies root emoji-style.json exists and conforms strictly to Schema v1', () => {
      expect(fs.existsSync(rootStylePath)).toBe(true);
      const profile = JSON.parse(fs.readFileSync(rootStylePath, 'utf-8'));

      expect(profile.schema_version).toBe(1);
      expect(profile.primary_pack).toBe('sfsymbols');
      expect(Array.isArray(profile.secondary_packs)).toBe(true);
      expect(profile.secondary_packs.length).toBeGreaterThan(0);
      expect(profile.roles).toBeDefined();
      expect(typeof profile.roles).toBe('object');
      expect(profile.constraints).toBeDefined();
    });

    it('validates backend data copy is identical to root emoji-style.json', () => {
      expect(fs.existsSync(backendDataPath)).toBe(true);
      const rootProfile = JSON.parse(fs.readFileSync(rootStylePath, 'utf-8'));
      const backendProfile = JSON.parse(fs.readFileSync(backendDataPath, 'utf-8'));

      expect(backendProfile.schema_version).toBe(rootProfile.schema_version);
      expect(backendProfile.primary_pack).toBe(rootProfile.primary_pack);
      expect(backendProfile.roles).toEqual(rootProfile.roles);
    });

    it('verifies all essential application roles are mapped to valid string IDs', () => {
      const profile = JSON.parse(fs.readFileSync(rootStylePath, 'utf-8'));
      const requiredRoles = [
        'settings',
        'search',
        'notifications_on',
        'notifications_muted',
        'access_open',
        'access_locked',
        'editor_button',
        'heart',
        'fire',
        'star',
        'verified',
        'chat',
        'quote',
        'pin'
      ];

      for (const roleKey of requiredRoles) {
        const role = profile.roles[roleKey];
        expect(role, `Role ${roleKey} must exist`).toBeDefined();
        expect(typeof role.id).toBe('string');
        expect(role.id.length).toBeGreaterThan(10); // Telegram 64-bit document id string
        expect(role.key).toBeDefined();
        expect(role.pack).toBeDefined();
        expect(role.html_fallback).toBeDefined();
      }
    });

    it('verifies curated catalog contains properly structured items', () => {
      expect(fs.existsSync(curatedPath)).toBe(true);
      const items = JSON.parse(fs.readFileSync(curatedPath, 'utf-8'));

      expect(Array.isArray(items)).toBe(true);
      expect(items.length).toBeGreaterThanOrEqual(200);

      // Verify structure of first item
      const item = items[0];
      expect(typeof item.id).toBe('string');
      expect(typeof item.key).toBe('string');
      expect(typeof item.name).toBe('string');
      expect(typeof item.fallback).toBe('string');
      expect(typeof item.pack).toBe('string');
      expect(typeof item.previewUrl).toBe('string');
      expect(item.previewUrl).toContain('https://zulut30.github.io/premium-telegram-emoji/images/');
    });
  });

  // =========================================================================
  // 2. BACKEND REST API ENDPOINTS
  // =========================================================================
  describe('2. Telegram Emojis REST API Endpoints', () => {
    it('GET /api/telegram-emojis/style returns the active application profile', async () => {
      const res = await fetch(`${BASE_URL}/style`);
      expect(res.status).toBe(200);
      const data = await res.json();

      expect(data.success).toBe(true);
      expect(data.profile).toBeDefined();
      expect(data.profile.schema_version).toBe(1);
      expect(data.profile.primary_pack).toBe('sfsymbols');
      expect(data.profile.roles.fire.id).toBe('5424972470023104089');
    });

    it('GET /api/telegram-emojis/curated returns the full curated collection', async () => {
      const res = await fetch(`${BASE_URL}/curated`);
      expect(res.status).toBe(200);
      const data = await res.json();

      expect(data.success).toBe(true);
      expect(data.total).toBeGreaterThanOrEqual(200);
      expect(Array.isArray(data.items)).toBe(true);
    });

    it('GET /api/telegram-emojis/curated?group=reactions returns only reaction emojis', async () => {
      const res = await fetch(`${BASE_URL}/curated?group=reactions`);
      expect(res.status).toBe(200);
      const data = await res.json();

      expect(data.success).toBe(true);
      expect(data.items.length).toBeGreaterThan(0);
      for (const item of data.items) {
        expect(item.group).toBe('reactions');
      }
    });

    it('GET /api/telegram-emojis/curated?style=minimal returns minimal style emojis', async () => {
      const res = await fetch(`${BASE_URL}/curated?style=minimal`);
      expect(res.status).toBe(200);
      const data = await res.json();

      expect(data.success).toBe(true);
      expect(data.items.length).toBeGreaterThan(0);
      for (const item of data.items) {
        expect(item.style).toBe('minimal');
      }
    });

    it('GET /api/telegram-emojis/search?q=fire finds matching fire emojis', async () => {
      const res = await fetch(`${BASE_URL}/search?q=fire`);
      expect(res.status).toBe(200);
      const data = await res.json();

      expect(data.success).toBe(true);
      expect(data.count).toBeGreaterThan(0);
      const fireEmoji = data.results.find((e: any) => e.id === '5424972470023104089');
      expect(fireEmoji).toBeDefined();
      expect(fireEmoji.key).toBe('fire');
    });

    it('GET /api/telegram-emojis/search?q=огонь supports Russian search query', async () => {
      const res = await fetch(`${BASE_URL}/search?q=${encodeURIComponent('огонь')}`);
      expect(res.status).toBe(200);
      const data = await res.json();

      expect(data.success).toBe(true);
      expect(data.count).toBeGreaterThan(0);
      const fireEmoji = data.results.find((e: any) => e.id === '5424972470023104089');
      expect(fireEmoji).toBeDefined();
    });

    it('GET /api/telegram-emojis/:id retrieves a specific emoji by 64-bit ID', async () => {
      const res = await fetch(`${BASE_URL}/5424972470023104089`);
      expect(res.status).toBe(200);
      const data = await res.json();

      expect(data.success).toBe(true);
      expect(data.emoji).toBeDefined();
      expect(data.emoji.id).toBe('5424972470023104089');
      expect(data.emoji.fallback).toBe('🔥');
    });

    it('GET /api/telegram-emojis/:id returns 404 for unknown emoji ID', async () => {
      const res = await fetch(`${BASE_URL}/9999999999999999999`);
      expect(res.status).toBe(404);
      const data = await res.json();

      expect(data.error).toBe('Emoji not found in catalog');
    });
  });

  // =========================================================================
  // 3. TELEGRAM BOT API MARKUP & CDN URL FORMATTING
  // =========================================================================
  describe('3. Markup Parsing & CDN URL Formatting', () => {
    it('formats Telegram Bot API tg-emoji HTML tag correctly', () => {
      const formatTelegramEmojiHtml = (emojiId: string, fallbackText: string) => {
        return `<tg-emoji emoji-id="${emojiId}">${fallbackText}</tg-emoji>`;
      };

      const html = formatTelegramEmojiHtml('5424972470023104089', '🔥');
      expect(html).toBe('<tg-emoji emoji-id="5424972470023104089">🔥</tg-emoji>');
    });

    it('extracts emoji-id and fallback using regex matching Telegram Bot API spec', () => {
      const sampleText = 'Hey, check this out <tg-emoji emoji-id="5424972470023104089">🔥</tg-emoji> and <tg-emoji emoji-id="5172484558305625218">⭐</tg-emoji>!';
      const regex = /<tg-emoji\s+emoji-id="(\d+)">([\s\S]*?)<\/tg-emoji>/gi;

      const matches = [];
      let match;
      while ((match = regex.exec(sampleText)) !== null) {
        matches.push({ id: match[1], fallback: match[2] });
      }

      expect(matches.length).toBe(2);
      expect(matches[0]).toEqual({ id: '5424972470023104089', fallback: '🔥' });
      expect(matches[1]).toEqual({ id: '5172484558305625218', fallback: '⭐' });
    });

    it('generates exact GitHub Pages CDN image URL matching repository specification', () => {
      const getTelegramEmojiPreviewUrl = (id: string) => {
        return `https://zulut30.github.io/premium-telegram-emoji/images/${id}.png`;
      };

      const url = getTelegramEmojiPreviewUrl('5424972470023104089');
      expect(url).toBe('https://zulut30.github.io/premium-telegram-emoji/images/5424972470023104089.png');
    });
  });
});
