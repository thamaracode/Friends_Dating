import { describe, it, expect, beforeAll } from 'vitest';
import { v4 as uuidv4 } from 'uuid';
import { ContentEngineService } from './content-engine/service';
import { CONTENT_TAXONOMY_META } from './content-engine/types';

describe('Master Prompt 06: Dynamic Human Connection Content Engine Suite', () => {
  beforeAll(() => {
    ContentEngineService.ensureTables();
    ContentEngineService.seedCatalog();
  });

  // 1. Taxonomy & Domains
  describe('1. Content Taxonomy & Categorical Metadata', () => {
    it('provides complete taxonomy metadata across all 5 core domains', () => {
      const taxonomyData = ContentEngineService.getCategoryTaxonomy();
      expect(taxonomyData).toBeDefined();
      expect(taxonomyData.taxonomy).toBeDefined();

      const { taxonomy, categoryCounts } = taxonomyData;
      expect(taxonomy.love).toBeDefined();
      expect(taxonomy.friendship).toBeDefined();
      expect(taxonomy.personal_development).toBeDefined();
      expect(taxonomy.psychology).toBeDefined();
      expect(taxonomy.deep_conversations).toBeDefined();

      // Verify subcategories exist
      expect(taxonomy.love.subcategories.some(s => s.key === 'emotional_intimacy')).toBe(true);
      expect(taxonomy.friendship.subcategories.some(s => s.key === 'loyalty')).toBe(true);
      expect(taxonomy.deep_conversations.subcategories.some(s => s.key === 'moral_dilemmas')).toBe(true);

      // Verify categories have active seeded items
      expect(categoryCounts.love).toBeGreaterThanOrEqual(1);
      expect(categoryCounts.friendship).toBeGreaterThanOrEqual(1);
      expect(categoryCounts.personal_development).toBeGreaterThanOrEqual(1);
      expect(categoryCounts.psychology).toBeGreaterThanOrEqual(1);
      expect(categoryCounts.deep_conversations).toBeGreaterThanOrEqual(1);
    });

    it('covers all 11 content types in the catalog', () => {
      const { items } = ContentEngineService.queryContent({ limit: 100 });
      const types = new Set(items.map(i => i.content_type));

      expect(types.has('daily_quote')).toBe(true);
      expect(types.has('daily_question')).toBe(true);
      expect(types.has('conversation_starter')).toBe(true);
      expect(types.has('reflection_prompt')).toBe(true);
      expect(types.has('relationship_tip')).toBe(true);
      expect(types.has('friendship_tip')).toBe(true);
      expect(types.has('educational_insight')).toBe(true);
      expect(types.has('interactive_challenge')).toBe(true);
      expect(types.has('personality_reflection')).toBe(true);
      expect(types.has('couple_activity')).toBe(true);
      expect(types.has('social_activity')).toBe(true);
    });
  });

  // 2. Deterministic Daily Scheduling & History
  describe('2. Deterministic Daily Scheduling & History', () => {
    it('delivers deterministic daily content bundles based on date key', () => {
      const bundle1 = ContentEngineService.getDailyBundle('2026-11-14', 'usr_test');

      expect(bundle1.date).toBe('2026-11-14');
      expect(bundle1.featured_question).toBeDefined();
      expect(bundle1.featured_quote).toBeDefined();
      expect(bundle1.featured_starter).toBeDefined();
      expect(bundle1.featured_reflection).toBeDefined();
      expect(bundle1.featured_tip).toBeDefined();
      expect(bundle1.featured_challenge).toBeDefined();
      expect(bundle1.theme).toBeDefined();

      // Repeated calls with same date must return exact same items (deterministic)
      const bundle2 = ContentEngineService.getDailyBundle('2026-11-14', 'usr_test');
      expect(bundle2.featured_question.id).toBe(bundle1.featured_question.id);
      expect(bundle2.featured_quote.id).toBe(bundle1.featured_quote.id);
      expect(bundle2.featured_starter.id).toBe(bundle1.featured_starter.id);
    });

    it('allows browsing previous daily bundles with pagination', () => {
      const bundles = ContentEngineService.getPreviousDailyBundles(3, 0, 'usr_test');
      expect(bundles.length).toBe(3);
      expect(bundles[0].featured_question).toBeDefined();
      expect(bundles[1].featured_quote).toBeDefined();
    });
  });

  // 3. Dynamic Querying, Random, and Refresh
  describe('3. Dynamic Querying, Random, and Refresh Engine', () => {
    it('filters content catalog by category, depth level, and context', () => {
      const result = ContentEngineService.queryContent({
        category: 'love',
        depth_level: 'deep'
      });

      expect(result.items.length).toBeGreaterThanOrEqual(1);
      for (const item of result.items) {
        expect(item.primary_category).toBe('love');
        expect(item.depth_level).toBe('deep');
      }
    });

    it('draws a random question matching filter parameters', () => {
      const item = ContentEngineService.getRandomItem({ category: 'deep_conversations' }, 'usr_test');
      expect(item).toBeDefined();
      expect(item!.primary_category).toBe('deep_conversations');
    });

    it('refreshes content on demand, returning a fresh non-repetitive replacement', () => {
      const first = ContentEngineService.getRandomItem({ category: 'love' }, 'usr_test')!;
      const refreshed = ContentEngineService.refreshItem({ category: 'love' }, first.id, 'usr_test')!;

      expect(refreshed).toBeDefined();
      expect(refreshed.id).not.toBe(first.id);
    });

    it('prevents unwanted repetition when an item is skipped', () => {
      const targetId = 'cnt_pdev_002';
      const userId = 'usr_skip_tester_01';

      // Record skip
      ContentEngineService.skipItem(userId, targetId, 'too_intense');

      // Query with exclude_skipped
      const res = ContentEngineService.queryContent({
        category: 'personal_development',
        exclude_skipped: true
      }, userId);

      const hasSkipped = res.items.some(it => it.id === targetId);
      expect(hasSkipped).toBe(false);
    });
  });

  // 4. Favorites & Star Bookmarking
  describe('4. Favorites & Star Bookmarking', () => {
    it('manages user favorites with star toggle and likes count update', () => {
      const targetId = 'cnt_psych_001';
      const userId = 'usr_fav_' + uuidv4();

      // 1. Toggle ON
      const res1 = ContentEngineService.toggleFavorite(userId, targetId);
      expect(res1.favorited).toBe(true);

      const favs1 = ContentEngineService.getUserFavorites(userId);
      expect(favs1.some(f => f.id === targetId)).toBe(true);

      // Check item reflects favorited
      const itemAfterFav = ContentEngineService.getContentItem(targetId, userId);
      expect(itemAfterFav?.is_favorited).toBe(true);

      // 2. Toggle OFF
      const res2 = ContentEngineService.toggleFavorite(userId, targetId);
      expect(res2.favorited).toBe(false);

      const favs2 = ContentEngineService.getUserFavorites(userId);
      expect(favs2.some(f => f.id === targetId)).toBe(false);
    });
  });

  // 5. Private Answering & Journaling
  describe('5. Private Answering & Reflections', () => {
    it('allows answering questions privately with local journal persistence', () => {
      const targetId = 'cnt_love_001';
      const userId = 'usr_journal_' + uuidv4();

      const answer = ContentEngineService.recordAnswer(
        userId,
        targetId,
        'I feel most deeply loved when a partner notices I am overwhelmed and quietly takes care of dinner without making it a debt.',
        'reflective',
        ['acts_of_service', 'peace']
      );

      expect(answer.id).toBeDefined();
      expect(answer.answer_text).toContain('takes care of dinner');
      expect(answer.mood_state).toBe('reflective');
      expect(answer.is_private).toBe(1);

      // Retrieve answers
      const answers = ContentEngineService.getUserAnswers(userId, targetId);
      expect(answers.some(a => a.id === answer.id)).toBe(true);

      // Item should now report is_answered = true
      const item = ContentEngineService.getContentItem(targetId, userId);
      expect(item?.is_answered).toBe(true);
      expect(item?.user_answer).toBe(answer.answer_text);

      // Delete answer
      const deleted = ContentEngineService.deleteAnswer(userId, answer.id);
      expect(deleted).toBe(true);
    });
  });

  // 6. Content Moderation & Reporting
  describe('6. Content Moderation & Inappropriate Content Reporting', () => {
    it('records inappropriate content reports with reason and details', () => {
      const targetId = 'cnt_deep_003';
      const report = ContentEngineService.reportContent(
        'usr_reporter_' + uuidv4(),
        targetId,
        'offensive',
        'Touches on sensitive themes without adequate warning.'
      );

      expect(report.id).toBeDefined();
      expect(report.status).toBe('pending');
      expect(report.reason).toBe('offensive');
      expect(report.details).toContain('sensitive themes');
    });
  });

  // 7. Attribution & Epistemic Guardrails
  describe('7. Attribution Authenticity & Epistemic Guardrails', () => {
    it('strictly enforces attribution authenticity without fabricating authorship', () => {
      const { items } = ContentEngineService.queryContent({ content_type: 'daily_quote' });
      expect(items.length).toBeGreaterThanOrEqual(1);

      for (const item of items) {
        if (item.attribution_type === 'verified_quotation') {
          expect(item.source).toBeDefined();
          expect(item.source.length).toBeGreaterThan(0);
          expect(item.author_name).not.toBe('Anonymous');
          expect(item.is_verified).toBe(true);
        } else if (item.attribution_type === 'original_generated_reflection') {
          expect(item.source_type).toBe('curated_original');
        }
      }
    });
  });

  // 8. Data Portability & Export
  describe('8. User Data Export & Portability', () => {
    it('exports user favorites and private answers in structured JSON', () => {
      const userId = 'usr_export_' + uuidv4();

      const favRes = ContentEngineService.toggleFavorite(userId, 'cnt_deep_001');
      expect(favRes.favorited).toBe(true);

      ContentEngineService.recordAnswer(userId, 'cnt_deep_001', 'Meaning is anchored in protecting my family.');

      const exportData = ContentEngineService.exportUserData(userId);
      expect(exportData.user_id).toBe(userId);
      expect(exportData.total_favorites).toBeGreaterThanOrEqual(1);
      expect(exportData.total_answers).toBeGreaterThanOrEqual(1);
      expect(exportData.favorites[0].title).toBeDefined();
      expect(exportData.answers[0].answer_text).toBe('Meaning is anchored in protecting my family.');
    });
  });
});
