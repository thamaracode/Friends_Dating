import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { db } from './db';
import { QuoteProviderRegistry } from './quotes/registry';
import { QuoteDiscoveryService } from './quotes/service';
import { QUOTE_CATEGORIES, QuoteCategoryKey } from './quotes/types';

describe('Soulverse Quotes Sanctuary & Infinite Wisdom Discovery Engine', () => {
  const BASE_URL = 'http://127.0.0.1:3001/api';
  const TEST_USER = 'test_quote_seeker_99';
  const ADMIN_ID = 'usr_me';

  const cleanTestData = () => {
    db.prepare('DELETE FROM quote_user_history WHERE user_id = ?').run(TEST_USER);
    db.prepare('DELETE FROM quote_user_interactions WHERE user_id = ?').run(TEST_USER);
    db.prepare('DELETE FROM quote_user_preferences WHERE user_id = ?').run(TEST_USER);
    db.prepare('DELETE FROM quotes WHERE author LIKE ?').run('%VitestTestAuthor%');
    db.prepare('DELETE FROM daily_quotes WHERE date_string = ?').run('2099-12-31');
  };

  beforeAll(() => {
    cleanTestData();
  });

  afterAll(() => {
    cleanTestData();
  });

  // =========================================================================
  // 1. TEXT NORMALIZATION & DEDUPLICATION LOGIC
  // =========================================================================
  describe('1. Normalization & Deduplication Primitives', () => {
    it('normalizes quote text by stripping punctuation, extra spaces, and casing', () => {
      const rawText1 = '  "The only true wisdom is in knowing you know nothing."  ';
      const rawText2 = 'the only true wisdom is in knowing you know nothing';
      const norm1 = QuoteProviderRegistry.normalizeQuoteText(rawText1);
      const norm2 = QuoteProviderRegistry.normalizeQuoteText(rawText2);

      expect(norm1).toEqual(norm2);
      expect(norm1).toEqual('the only true wisdom is in knowing you know nothing');
    });

    it('normalizes author names by removing honorifics and extra whitespace', () => {
      const rawAuthor1 = 'Dr. Maya Angelou, Ph.D.';
      const rawAuthor2 = 'Maya Angelou';
      const norm1 = QuoteProviderRegistry.normalizeAuthor(rawAuthor1);
      const norm2 = QuoteProviderRegistry.normalizeAuthor(rawAuthor2);

      expect(norm1).toEqual(norm2);
      expect(norm1).toEqual('maya angelou');
    });

    it('correctly detects duplicate quotes during batch ingestion', () => {
      const testQuote = {
        text: 'Wisdom begins in wonder. VitestTestAuthor',
        author: 'VitestTestAuthor Socrates',
        category: 'life_philosophy' as QuoteCategoryKey,
        tags: ['philosophy', 'wonder']
      };

      const result1 = QuoteProviderRegistry.ingestQuote(testQuote, 'test_adapter');
      expect(result1.isDuplicate).toBe(false);
      expect(result1.id).toBeDefined();

      // Ingest duplicate with different casing and whitespace
      const duplicateQuote = {
        text: '  "Wisdom begins in wonder. VitestTestAuthor"  ',
        author: 'VitestTestAuthor Socrates ',
        category: 'life_philosophy' as QuoteCategoryKey,
        tags: ['philosophy']
      };

      const result2 = QuoteProviderRegistry.ingestQuote(duplicateQuote, 'test_adapter');
      expect(result2.isDuplicate).toBe(true);
      expect(result2.id).toEqual(result1.id);
    });
  });

  // =========================================================================
  // 2. CATEGORY METADATA & SEED LIBRARY INTEGRITY
  // =========================================================================
  describe('2. 16 Categories & Internal Library Integrity', () => {
    it('provides all 16 supported categories with complete metadata', () => {
      const categories = QuoteDiscoveryService.getCategories();
      expect(categories.length).toBe(16);

      const keys = categories.map(c => c.key);
      expect(keys).toContain('love_romance');
      expect(keys).toContain('relationships');
      expect(keys).toContain('friendship');
      expect(keys).toContain('emotional_intelligence');
      expect(keys).toContain('self_respect_boundaries');
      expect(keys).toContain('psychology_human_behavior');
      expect(keys).toContain('motivation_discipline');
      expect(keys).toContain('loneliness_healing');
      expect(keys).toContain('confidence_identity');
      expect(keys).toContain('life_philosophy');
      expect(keys).toContain('happiness_gratitude');
      expect(keys).toContain('communication');
      expect(keys).toContain('marriage_commitment');
      expect(keys).toContain('heartbreak_moving_on');
      expect(keys).toContain('personal_growth');
      expect(keys).toContain('humor_playful');

      // Verify each category has label, accentColor, description, and tags
      for (const cat of categories) {
        expect(cat.label).toBeTruthy();
        expect(cat.accentColor).toMatch(/^#[0-9A-Fa-f]{6}$/);
        expect(cat.description).toBeTruthy();
        expect(cat.tags.length).toBeGreaterThan(0);
      }
    });

    it('has verified seed quotes initialized in SQLite database', () => {
      const count = db.prepare('SELECT COUNT(*) as count FROM quotes').get() as { count: number };
      expect(count.count).toBeGreaterThanOrEqual(48);
    });
  });

  // =========================================================================
  // 3. QUOTE DISCOVERY ENGINE & USER HISTORY (NON-REPEATING GUARANTEE)
  // =========================================================================
  describe('3. Non-Repeating Discovery & History Recycling', () => {
    it('discovers consecutive quotes without repetition and logs history', async () => {
      const seenIds = new Set<string>();

      // Discover 5 consecutive quotes for TEST_USER
      for (let i = 0; i < 5; i++) {
        const quote = await QuoteDiscoveryService.discoverNextQuote(TEST_USER);
        expect(quote).toBeDefined();
        expect(quote.id).toBeDefined();
        expect(seenIds.has(quote.id)).toBe(false);
        seenIds.add(quote.id);
      }

      // Check history records in SQLite
      const historyRows = db.prepare('SELECT * FROM quote_user_history WHERE user_id = ?').all(TEST_USER);
      expect(historyRows.length).toBe(5);
    });

    it('respects user category exclusions in discovery', async () => {
      // Exclude all except humor_playful
      const allOtherCategories = Object.keys(QUOTE_CATEGORIES).filter(
        k => k !== 'humor_playful'
      ) as QuoteCategoryKey[];

      QuoteDiscoveryService.updateUserPreferences(TEST_USER, {
        excludedCategories: allOtherCategories,
        includedCategories: ['humor_playful']
      });

      const quote = await QuoteDiscoveryService.discoverNextQuote(TEST_USER);
      expect(quote.category).toBe('humor_playful');
    });

    it('clears user history allowing previously shown quotes to be discovered again', () => {
      QuoteDiscoveryService.clearHistory(TEST_USER);

      const historyCount = db.prepare('SELECT COUNT(*) as count FROM quote_user_history WHERE user_id = ?').get(TEST_USER) as { count: number };
      expect(historyCount.count).toBe(0);
    });
  });

  // =========================================================================
  // 4. USER INTERACTIONS & SAVED WISDOM
  // =========================================================================
  describe('4. Interactions (Like, Save, Skip) & Saved Wisdom', () => {
    let targetQuoteId: string;

    beforeAll(async () => {
      const q = await QuoteDiscoveryService.discoverNextQuote(TEST_USER);
      targetQuoteId = q.id;
    });

    it('toggles like on a quote and tracks likes count', () => {
      const beforeQuote = db.prepare('SELECT likes_count FROM quotes WHERE id = ?').get(targetQuoteId) as any;
      const initialLikes = beforeQuote.likes_count || 0;

      // Like
      const likeResult = QuoteDiscoveryService.toggleInteraction(TEST_USER, targetQuoteId, 'like');
      expect(likeResult.active).toBe(true);
      expect(likeResult.likesCount).toBe(initialLikes + 1);

      // Unlike
      const unlikeResult = QuoteDiscoveryService.toggleInteraction(TEST_USER, targetQuoteId, 'like');
      expect(unlikeResult.active).toBe(false);
      expect(unlikeResult.likesCount).toBe(initialLikes);
    });

    it('toggles save on a quote and manages saved quotes library', () => {
      // Save
      const saveResult = QuoteDiscoveryService.toggleInteraction(TEST_USER, targetQuoteId, 'save');
      expect(saveResult.active).toBe(true);

      const savedList = QuoteDiscoveryService.getSavedQuotes(TEST_USER);
      expect(savedList.some(q => q.id === targetQuoteId)).toBe(true);

      // Unsave
      const unsaveResult = QuoteDiscoveryService.toggleInteraction(TEST_USER, targetQuoteId, 'save');
      expect(unsaveResult.active).toBe(false);

      const savedListAfter = QuoteDiscoveryService.getSavedQuotes(TEST_USER);
      expect(savedListAfter.some(q => q.id === targetQuoteId)).toBe(false);
    });

    it('allows reporting inappropriate quotes', async () => {
      const quote = await QuoteDiscoveryService.discoverNextQuote(TEST_USER);
      expect(() => {
        QuoteDiscoveryService.reportQuote(quote.id, 'Spam content');
      }).not.toThrow();

      const reported = db.prepare('SELECT report_count FROM quotes WHERE id = ?').get(quote.id) as any;
      expect(reported.report_count).toBeGreaterThanOrEqual(1);
    });
  });

  // =========================================================================
  // 5. DETERMINISTIC DAILY QUOTE & REFLECTION QUESTIONS
  // =========================================================================
  describe('5. Deterministic Daily Quote System', () => {
    it('returns the same daily quote and reflection question for a given date', () => {
      const todayStr = '2099-12-31';
      const daily1 = QuoteDiscoveryService.getDailyQuote(todayStr);
      const daily2 = QuoteDiscoveryService.getDailyQuote(todayStr);

      expect(daily1.date).toBe(todayStr);
      expect(daily1.featuredQuote.id).toBe(daily2.featuredQuote.id);
      expect(daily1.reflectionQuestion).toBe(daily2.reflectionQuestion);
      expect(daily1.reflectionQuestion.length).toBeGreaterThan(10);
    });

    it('returns past daily quotes in history without mutating current date', () => {
      const history = QuoteDiscoveryService.getDailyHistory(5);
      expect(Array.isArray(history)).toBe(true);
      if (history.length > 0) {
        expect(history[0].date).toBeDefined();
        expect(history[0].quote).toBeDefined();
        expect(history[0].reflectionQuestion).toBeDefined();
      }
    });

    it('allows administrators to assign a custom featured quote for a specific date', () => {
      const testQuote = QuoteDiscoveryService.adminCreateQuote({
        text: 'The soul becomes dyed with the color of its thoughts. VitestTestAuthor',
        author: 'Marcus Aurelius VitestTestAuthor',
        category: 'confidence_identity',
        tags: ['mindset', 'stoic']
      });

      const assigned = QuoteDiscoveryService.adminSetDailyQuote(
        '2099-12-31',
        testQuote.id,
        'What thoughts are coloring your mind today?'
      );

      expect(assigned.date).toBe('2099-12-31');
      expect(assigned.featuredQuote.id).toBe(testQuote.id);
      expect(assigned.reflectionQuestion).toBe('What thoughts are coloring your mind today?');
    });
  });

  // =========================================================================
  // 6. ADMIN MANAGEMENT & PROVIDER REGISTRY
  // =========================================================================
  describe('6. Admin Management & Clean Deduplication Tool', () => {
    let createdQuoteId: string;

    it('creates, updates, and fetches quotes through admin service', () => {
      const created = QuoteDiscoveryService.adminCreateQuote({
        text: 'Character is destiny. VitestTestAuthor',
        author: 'Heraclitus VitestTestAuthor',
        category: 'life_philosophy',
        tags: ['character', 'destiny']
      });

      expect(created.id).toBeDefined();
      createdQuoteId = created.id;

      // Update
      QuoteDiscoveryService.adminUpdateQuote(createdQuoteId, {
        isVerified: true,
        attribution: 'Fragments, B119'
      });

      const updated = db.prepare('SELECT * FROM quotes WHERE id = ?').get(createdQuoteId) as any;
      expect(updated.is_verified).toBe(1);
      expect(updated.attribution).toBe('Fragments, B119');
    });

    it('deduplicates quotes across the entire library', () => {
      // Ingest 2 identical quotes directly to simulate provider collision
      const rawText = 'Simulated duplicate quote for testing VitestTestAuthor';
      const normText = QuoteProviderRegistry.normalizeQuoteText(rawText);
      const normAuth = QuoteProviderRegistry.normalizeAuthor('VitestTestAuthor');
      const now = Date.now();

      db.prepare(`
        INSERT INTO quotes (id, text, author, normalized_text, normalized_author, category, tags_json, provider, created_at, imported_at)
        VALUES ('dup_vitest_1', ?, 'VitestTestAuthor', ?, ?, 'motivation_discipline', '[]', 'test', ?, ?)
      `).run(rawText, normText, normAuth, now, now);

      db.prepare(`
        INSERT INTO quotes (id, text, author, normalized_text, normalized_author, category, tags_json, provider, created_at, imported_at)
        VALUES ('dup_vitest_2', ?, 'VitestTestAuthor', ?, ?, 'motivation_discipline', '[]', 'test', ?, ?)
      `).run(rawText, normText, normAuth, now, now);

      const dedupResult = QuoteDiscoveryService.adminDeduplicate();
      expect(dedupResult.removedCount).toBeGreaterThanOrEqual(1);

      // Verify only 1 remains
      const remaining = db.prepare('SELECT COUNT(*) as count FROM quotes WHERE normalized_text = ?').get(normText) as any;
      expect(remaining.count).toBe(1);

      // Clean up
      db.prepare('DELETE FROM quotes WHERE normalized_text = ?').run(normText);
    });

    it('permanently deletes an admin quote and cascades interactions', () => {
      if (createdQuoteId) {
        QuoteDiscoveryService.adminDeleteQuote(createdQuoteId);
        const check = db.prepare('SELECT * FROM quotes WHERE id = ?').get(createdQuoteId);
        expect(check).toBeUndefined();
      }
    });
  });

  // =========================================================================
  // 7. REST API ENDPOINTS INTEGRATION
  // =========================================================================
  describe('7. HTTP REST Endpoints End-to-End', () => {
    it('GET /api/quotes/categories returns 16 categories', async () => {
      const res = await fetch(`${BASE_URL}/quotes/categories`);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.categories.length).toBe(16);
    });

    it('GET /api/quotes/discover returns a quote with user context', async () => {
      const res = await fetch(`${BASE_URL}/quotes/discover`, {
        headers: { 'x-user-id': TEST_USER }
      });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.quote).toBeDefined();
      expect(data.quote.text).toBeTruthy();
    });

    it('GET /api/quotes/feed returns paginated quotes', async () => {
      const res = await fetch(`${BASE_URL}/quotes/feed?limit=5&page=1`, {
        headers: { 'x-user-id': TEST_USER }
      });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.quotes.length).toBeLessThanOrEqual(5);
      expect(data.total).toBeGreaterThan(0);
    });

    it('GET /api/quotes/daily returns daily intelligence payload', async () => {
      const res = await fetch(`${BASE_URL}/quotes/daily`);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.daily).toBeDefined();
      expect(data.daily.featuredQuote).toBeDefined();
      expect(data.daily.reflectionQuestion).toBeTruthy();
    });

    it('PUT /api/quotes/preferences updates user settings', async () => {
      const res = await fetch(`${BASE_URL}/quotes/preferences`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': TEST_USER
        },
        body: JSON.stringify({
          discoveryMode: 'personalized',
          lengthPreference: 'short'
        })
      });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.preferences.discoveryMode).toBe('personalized');
      expect(data.preferences.lengthPreference).toBe('short');
    });

    it('GET /api/admin/quotes/providers returns provider statuses', async () => {
      const res = await fetch(`${BASE_URL}/admin/quotes/providers`, {
        headers: { 'x-admin-id': ADMIN_ID }
      });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(Array.isArray(data.providers)).toBe(true);
      expect(data.providers.length).toBeGreaterThanOrEqual(2);
    });

    it('POST /api/admin/quotes/deduplicate executes duplicate cleanup', async () => {
      const res = await fetch(`${BASE_URL}/admin/quotes/deduplicate`, {
        method: 'POST',
        headers: { 'x-admin-id': ADMIN_ID }
      });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(typeof data.removedCount).toBe('number');
    });
  });
});
