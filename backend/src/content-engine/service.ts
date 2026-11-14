import { db } from '../db';
import { v4 as uuidv4 } from 'uuid';
import {
  ContentItem,
  ContentUserAnswer,
  ContentReport,
  ContentFilterOptions,
  DailyContentBundle,
  ContentPrimaryCategory,
  CONTENT_TAXONOMY_META
} from './types';
import { SEED_CONTENT_ITEMS } from './seedData';

export class ContentEngineService {
  private static tablesInitialized = false;

  public static ensureTables(): void {
    if (this.tablesInitialized) return;

    db.exec(`
      -- Content Catalog Items
      CREATE TABLE IF NOT EXISTS content_items (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        primary_category TEXT NOT NULL,
        subcategory TEXT NOT NULL,
        content_type TEXT NOT NULL,
        depth_level TEXT NOT NULL,
        intended_context TEXT NOT NULL,
        follow_up_questions TEXT NOT NULL, -- JSON array
        age_suitability TEXT NOT NULL DEFAULT 'all_ages',
        content_warnings TEXT NOT NULL, -- JSON array
        language TEXT NOT NULL DEFAULT 'en',
        author_name TEXT NOT NULL,
        author_bio TEXT,
        author_era TEXT,
        attribution_type TEXT NOT NULL,
        source TEXT NOT NULL,
        source_type TEXT NOT NULL,
        is_verified INTEGER NOT NULL DEFAULT 1,
        estimated_minutes INTEGER NOT NULL DEFAULT 5,
        tags TEXT NOT NULL, -- JSON array
        likes_count INTEGER NOT NULL DEFAULT 0,
        shares_count INTEGER NOT NULL DEFAULT 0,
        created_at INTEGER NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_content_cat_type ON content_items(primary_category, content_type);
      CREATE INDEX IF NOT EXISTS idx_content_depth ON content_items(depth_level);

      -- Views Log for Repetition Prevention
      CREATE TABLE IF NOT EXISTS content_views (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        content_id TEXT NOT NULL,
        viewed_at INTEGER NOT NULL,
        context TEXT,
        FOREIGN KEY (content_id) REFERENCES content_items(id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_content_views_user ON content_views(user_id, content_id);

      -- Skips Log (Excluded from recommendations)
      CREATE TABLE IF NOT EXISTS content_skips (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        content_id TEXT NOT NULL,
        reason TEXT,
        skipped_at INTEGER NOT NULL,
        UNIQUE(user_id, content_id),
        FOREIGN KEY (content_id) REFERENCES content_items(id) ON DELETE CASCADE
      );

      -- User Favorites / Saved Collection
      CREATE TABLE IF NOT EXISTS content_favorites (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        content_id TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        UNIQUE(user_id, content_id),
        FOREIGN KEY (content_id) REFERENCES content_items(id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_content_fav_user ON content_favorites(user_id);

      -- User Private Answers / Journal Responses
      CREATE TABLE IF NOT EXISTS content_answers (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        content_id TEXT NOT NULL,
        answer_text TEXT NOT NULL,
        mood_state TEXT,
        is_private INTEGER NOT NULL DEFAULT 1,
        tags TEXT NOT NULL DEFAULT '[]', -- JSON array
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        FOREIGN KEY (content_id) REFERENCES content_items(id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_content_ans_user ON content_answers(user_id, content_id);

      -- Inappropriate Content Reports
      CREATE TABLE IF NOT EXISTS content_reports (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        content_id TEXT NOT NULL,
        reason TEXT NOT NULL,
        details TEXT,
        status TEXT NOT NULL DEFAULT 'pending',
        created_at INTEGER NOT NULL,
        FOREIGN KEY (content_id) REFERENCES content_items(id) ON DELETE CASCADE
      );

      -- Daily Scheduled Bundles
      CREATE TABLE IF NOT EXISTS content_daily_schedule (
        date_key TEXT PRIMARY KEY, -- YYYY-MM-DD
        question_id TEXT NOT NULL,
        quote_id TEXT NOT NULL,
        starter_id TEXT NOT NULL,
        reflection_id TEXT NOT NULL,
        tip_id TEXT NOT NULL,
        challenge_id TEXT NOT NULL,
        theme TEXT NOT NULL,
        theme_description TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        FOREIGN KEY (question_id) REFERENCES content_items(id) ON DELETE CASCADE,
        FOREIGN KEY (quote_id) REFERENCES content_items(id) ON DELETE CASCADE
      );
    `);

    this.tablesInitialized = true;
    this.seedCatalog();
  }

  public static seedCatalog(): void {
    const countRow = db.prepare('SELECT COUNT(*) as count FROM content_items').get() as { count: number };
    if (countRow && countRow.count >= SEED_CONTENT_ITEMS.length) {
      return;
    }

    const insertStmt = db.prepare(`
      INSERT OR REPLACE INTO content_items (
        id, title, content, primary_category, subcategory, content_type,
        depth_level, intended_context, follow_up_questions, age_suitability,
        content_warnings, language, author_name, author_bio, author_era,
        attribution_type, source, source_type, is_verified, estimated_minutes,
        tags, likes_count, shares_count, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const tx = db.transaction(() => {
      for (const item of SEED_CONTENT_ITEMS) {
        insertStmt.run(
          item.id,
          item.title,
          item.content,
          item.primary_category,
          item.subcategory,
          item.content_type,
          item.depth_level,
          item.intended_context,
          JSON.stringify(item.follow_up_questions || []),
          item.age_suitability || 'all_ages',
          JSON.stringify(item.content_warnings || []),
          item.language || 'en',
          item.author_name,
          item.author_bio || null,
          item.author_era || null,
          item.attribution_type,
          item.source,
          item.source_type,
          item.is_verified ? 1 : 0,
          item.estimated_minutes || 5,
          JSON.stringify(item.tags || []),
          item.likes_count || 0,
          item.shares_count || 0,
          item.created_at || Date.now()
        );
      }
    });

    tx();
  }

  private static mapRowToItem(row: any, userId?: string): ContentItem {
    let is_favorited = false;
    let is_answered = false;
    let user_answer: string | null = null;

    if (userId) {
      const fav = db.prepare('SELECT 1 FROM content_favorites WHERE user_id = ? AND content_id = ?').get(userId, row.id);
      is_favorited = !!fav;

      const ans = db.prepare('SELECT answer_text FROM content_answers WHERE user_id = ? AND content_id = ? ORDER BY created_at DESC LIMIT 1').get(userId, row.id) as any;
      if (ans) {
        is_answered = true;
        user_answer = ans.answer_text;
      }
    }

    return {
      id: row.id,
      title: row.title,
      content: row.content,
      primary_category: row.primary_category as any,
      subcategory: row.subcategory as any,
      content_type: row.content_type as any,
      depth_level: row.depth_level as any,
      intended_context: row.intended_context as any,
      follow_up_questions: JSON.parse(row.follow_up_questions || '[]'),
      age_suitability: row.age_suitability as any,
      content_warnings: JSON.parse(row.content_warnings || '[]'),
      language: row.language,
      author_name: row.author_name,
      author_bio: row.author_bio,
      author_era: row.author_era,
      attribution_type: row.attribution_type as any,
      source: row.source,
      source_type: row.source_type as any,
      is_verified: Number(row.is_verified) === 1,
      estimated_minutes: Number(row.estimated_minutes),
      tags: JSON.parse(row.tags || '[]'),
      likes_count: Number(row.likes_count),
      shares_count: Number(row.shares_count),
      created_at: Number(row.created_at),
      is_favorited,
      is_answered,
      user_answer
    };
  }

  // =========================================================================
  // Content Retrieval & Querying
  // =========================================================================

  public static getContentItem(id: string, userId?: string): ContentItem | null {
    this.ensureTables();
    const row = db.prepare('SELECT * FROM content_items WHERE id = ?').get(id);
    if (!row) return null;
    return this.mapRowToItem(row, userId);
  }

  public static queryContent(filters: ContentFilterOptions = {}, userId?: string): { items: ContentItem[]; total: number } {
    this.ensureTables();
    const whereClauses: string[] = ['1=1'];
    const params: any[] = [];

    if (filters.category) {
      whereClauses.push('primary_category = ?');
      params.push(filters.category);
    }

    if (filters.subcategory) {
      whereClauses.push('subcategory = ?');
      params.push(filters.subcategory);
    }

    if (filters.content_type) {
      whereClauses.push('content_type = ?');
      params.push(filters.content_type);
    }

    if (filters.depth_level) {
      whereClauses.push('depth_level = ?');
      params.push(filters.depth_level);
    }

    if (filters.intended_context) {
      whereClauses.push('intended_context = ?');
      params.push(filters.intended_context);
    }

    if (filters.search && filters.search.trim()) {
      whereClauses.push('(title LIKE ? OR content LIKE ? OR author_name LIKE ? OR tags LIKE ?)');
      const q = `%${filters.search.trim()}%`;
      params.push(q, q, q, q);
    }

    if (filters.exclude_skipped && userId) {
      whereClauses.push('id NOT IN (SELECT content_id FROM content_skips WHERE user_id = ?)');
      params.push(userId);
    }

    if (filters.exclude_seen && userId) {
      whereClauses.push('id NOT IN (SELECT content_id FROM content_views WHERE user_id = ?)');
      params.push(userId);
    }

    const whereSql = whereClauses.join(' AND ');

    const countRow = db.prepare(`SELECT COUNT(*) as count FROM content_items WHERE ${whereSql}`).get(...params) as { count: number };
    const total = countRow ? countRow.count : 0;

    const limit = Math.max(1, Math.min(filters.limit || 20, 100));
    const offset = Math.max(0, filters.offset || 0);

    const rows = db.prepare(`
      SELECT * FROM content_items 
      WHERE ${whereSql} 
      ORDER BY created_at DESC 
      LIMIT ? OFFSET ?
    `).all(...params, limit, offset);

    return {
      items: rows.map(r => this.mapRowToItem(r, userId)),
      total
    };
  }

  public static getRandomItem(filters: ContentFilterOptions = {}, userId?: string): ContentItem | null {
    this.ensureTables();
    const whereClauses: string[] = ['1=1'];
    const params: any[] = [];

    if (filters.category) {
      whereClauses.push('primary_category = ?');
      params.push(filters.category);
    }

    if (filters.subcategory) {
      whereClauses.push('subcategory = ?');
      params.push(filters.subcategory);
    }

    if (filters.content_type) {
      whereClauses.push('content_type = ?');
      params.push(filters.content_type);
    }

    if (filters.depth_level) {
      whereClauses.push('depth_level = ?');
      params.push(filters.depth_level);
    }

    if (filters.intended_context) {
      whereClauses.push('intended_context = ?');
      params.push(filters.intended_context);
    }

    // Always exclude skipped items for random recommendations
    if (userId) {
      whereClauses.push('id NOT IN (SELECT content_id FROM content_skips WHERE user_id = ?)');
      params.push(userId);
    }

    const whereSql = whereClauses.join(' AND ');
    const row = db.prepare(`SELECT * FROM content_items WHERE ${whereSql} ORDER BY RANDOM() LIMIT 1`).get(...params);
    if (!row) return null;

    if (userId) {
      this.recordView(userId, (row as any).id, 'random_question');
    }

    return this.mapRowToItem(row, userId);
  }

  public static refreshItem(filters: ContentFilterOptions = {}, currentId?: string, userId?: string): ContentItem | null {
    this.ensureTables();
    const whereClauses: string[] = ['1=1'];
    const params: any[] = [];

    if (currentId) {
      whereClauses.push('id != ?');
      params.push(currentId);
    }

    if (filters.category) {
      whereClauses.push('primary_category = ?');
      params.push(filters.category);
    }

    if (filters.subcategory) {
      whereClauses.push('subcategory = ?');
      params.push(filters.subcategory);
    }

    if (filters.content_type) {
      whereClauses.push('content_type = ?');
      params.push(filters.content_type);
    }

    if (filters.depth_level) {
      whereClauses.push('depth_level = ?');
      params.push(filters.depth_level);
    }

    if (userId) {
      whereClauses.push('id NOT IN (SELECT content_id FROM content_skips WHERE user_id = ?)');
      params.push(userId);
    }

    const whereSql = whereClauses.join(' AND ');
    let row = db.prepare(`SELECT * FROM content_items WHERE ${whereSql} ORDER BY RANDOM() LIMIT 1`).get(...params);

    // If all seen, relax currentId restriction to avoid empty returns
    if (!row && currentId) {
      row = db.prepare('SELECT * FROM content_items ORDER BY RANDOM() LIMIT 1').get();
    }

    if (!row) return null;

    if (userId) {
      this.recordView(userId, (row as any).id, 'refresh_action');
    }

    return this.mapRowToItem(row, userId);
  }

  public static getPersonalizedItems(userId: string, limit: number = 5): ContentItem[] {
    this.ensureTables();
    // In Soulverse, personal preferences pull from user_personality_profiles if available
    let preferredCategory: ContentPrimaryCategory = 'love';
    try {
      const userProf = db.prepare('SELECT core_values, selected_traits FROM user_personality_profiles WHERE user_id = ?').get(userId) as any;
      if (userProf) {
        preferredCategory = 'personal_development';
      }
    } catch {
      // fallback
    }

    const rows = db.prepare(`
      SELECT * FROM content_items 
      WHERE id NOT IN (SELECT content_id FROM content_skips WHERE user_id = ?)
      ORDER BY 
        CASE WHEN primary_category = ? THEN 0 ELSE 1 END,
        RANDOM()
      LIMIT ?
    `).all(userId, preferredCategory, limit);

    return rows.map(r => this.mapRowToItem(r, userId));
  }

  // =========================================================================
  // Deterministic Daily Bundles & History
  // =========================================================================

  private static hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0;
    }
    return Math.abs(hash);
  }

  public static getDailyBundle(dateStr?: string, userId?: string): DailyContentBundle {
    this.ensureTables();
    const dateKey = dateStr || new Date().toISOString().slice(0, 10);

    // Check existing scheduled bundle
    const existing = db.prepare('SELECT * FROM content_daily_schedule WHERE date_key = ?').get(dateKey) as any;
    if (existing) {
      const q = this.getContentItem(existing.question_id, userId)!;
      const quote = this.getContentItem(existing.quote_id, userId)!;
      const starter = this.getContentItem(existing.starter_id, userId)!;
      const reflection = this.getContentItem(existing.reflection_id, userId)!;
      const tip = this.getContentItem(existing.tip_id, userId)!;
      const challenge = this.getContentItem(existing.challenge_id, userId)!;

      return {
        date: dateKey,
        featured_question: q,
        featured_quote: quote,
        featured_starter: starter,
        featured_reflection: reflection,
        featured_tip: tip,
        featured_challenge: challenge,
        theme: existing.theme,
        theme_description: existing.theme_description
      };
    }

    // Deterministic selection based on dateKey hash
    const hash = this.hashString(dateKey);

    const questions = db.prepare("SELECT * FROM content_items WHERE content_type = 'daily_question'").all();
    const quotes = db.prepare("SELECT * FROM content_items WHERE content_type = 'daily_quote'").all();
    const starters = db.prepare("SELECT * FROM content_items WHERE content_type = 'conversation_starter'").all();
    const reflections = db.prepare("SELECT * FROM content_items WHERE content_type IN ('reflection_prompt', 'personality_reflection')").all();
    const tips = db.prepare("SELECT * FROM content_items WHERE content_type IN ('relationship_tip', 'friendship_tip', 'educational_insight')").all();
    const challenges = db.prepare("SELECT * FROM content_items WHERE content_type IN ('interactive_challenge', 'couple_activity', 'social_activity')").all();

    const selectedQ = questions[hash % questions.length] || SEED_CONTENT_ITEMS[0];
    const selectedQuote = quotes[(hash + 1) % quotes.length] || SEED_CONTENT_ITEMS[1];
    const selectedStarter = starters[(hash + 2) % starters.length] || SEED_CONTENT_ITEMS[5];
    const selectedReflection = reflections[(hash + 3) % reflections.length] || SEED_CONTENT_ITEMS[4];
    const selectedTip = tips[(hash + 4) % tips.length] || SEED_CONTENT_ITEMS[2];
    const selectedChallenge = challenges[(hash + 5) % challenges.length] || SEED_CONTENT_ITEMS[3];

    const themes = [
      { theme: 'Vulnerability & Intimacy', desc: 'Removing masks and discovering safety in mutual self-disclosure.' },
      { theme: 'Enduring Loyalty & Belonging', desc: 'Showing up for friends and building relationships that weather changing seasons.' },
      { theme: 'Inner Sovereignty & Character', desc: 'Cultivating discipline, self-respect, and non-negotiable core values.' },
      { theme: 'Emotional Intelligence & Grace', desc: 'Understanding unconscious defense mechanisms and leading with empathy.' },
      { theme: 'Existential Wonder & Meaning', desc: 'Reflecting on life philosophy, formative memories, and cherished aspirations.' }
    ];
    const selectedTheme = themes[hash % themes.length];

    db.prepare(`
      INSERT OR REPLACE INTO content_daily_schedule (
        date_key, question_id, quote_id, starter_id, reflection_id, tip_id,
        challenge_id, theme, theme_description, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      dateKey,
      (selectedQ as any).id,
      (selectedQuote as any).id,
      (selectedStarter as any).id,
      (selectedReflection as any).id,
      (selectedTip as any).id,
      (selectedChallenge as any).id,
      selectedTheme.theme,
      selectedTheme.desc,
      Date.now()
    );

    return {
      date: dateKey,
      featured_question: this.mapRowToItem(selectedQ, userId),
      featured_quote: this.mapRowToItem(selectedQuote, userId),
      featured_starter: this.mapRowToItem(selectedStarter, userId),
      featured_reflection: this.mapRowToItem(selectedReflection, userId),
      featured_tip: this.mapRowToItem(selectedTip, userId),
      featured_challenge: this.mapRowToItem(selectedChallenge, userId),
      theme: selectedTheme.theme,
      theme_description: selectedTheme.desc
    };
  }

  public static getPreviousDailyBundles(limit: number = 7, offset: number = 0, userId?: string): DailyContentBundle[] {
    this.ensureTables();
    const bundles: DailyContentBundle[] = [];
    const today = new Date();

    for (let i = offset; i < offset + limit; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateKey = d.toISOString().slice(0, 10);
      bundles.push(this.getDailyBundle(dateKey, userId));
    }

    return bundles;
  }

  // =========================================================================
  // User Actions: Favorites, Answering, Skipping, Reporting
  // =========================================================================

  public static toggleFavorite(userId: string, contentId: string): { favorited: boolean } {
    this.ensureTables();
    const existing = db.prepare('SELECT id FROM content_favorites WHERE user_id = ? AND content_id = ?').get(userId, contentId) as any;
    if (existing) {
      db.prepare('DELETE FROM content_favorites WHERE id = ?').run(existing.id);
      db.prepare('UPDATE content_items SET likes_count = MAX(0, likes_count - 1) WHERE id = ?').run(contentId);
      return { favorited: false };
    } else {
      db.prepare('INSERT INTO content_favorites (id, user_id, content_id, created_at) VALUES (?, ?, ?, ?)').run(
        uuidv4(),
        userId,
        contentId,
        Date.now()
      );
      db.prepare('UPDATE content_items SET likes_count = likes_count + 1 WHERE id = ?').run(contentId);
      return { favorited: true };
    }
  }

  public static getUserFavorites(userId: string, limit: number = 20, offset: number = 0): ContentItem[] {
    this.ensureTables();
    const rows = db.prepare(`
      SELECT c.* FROM content_items c
      JOIN content_favorites f ON c.id = f.content_id
      WHERE f.user_id = ?
      ORDER BY f.created_at DESC
      LIMIT ? OFFSET ?
    `).all(userId, limit, offset);

    return rows.map(r => this.mapRowToItem(r, userId));
  }

  public static recordAnswer(
    userId: string,
    contentId: string,
    answerText: string,
    moodState?: string | null,
    tags?: string[]
  ): ContentUserAnswer {
    this.ensureTables();
    const id = uuidv4();
    const now = Date.now();

    db.prepare(`
      INSERT INTO content_answers (
        id, user_id, content_id, answer_text, mood_state, is_private, tags, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, 1, ?, ?, ?)
    `).run(
      id,
      userId,
      contentId,
      answerText.trim(),
      moodState || null,
      JSON.stringify(tags || []),
      now,
      now
    );

    return {
      id,
      user_id: userId,
      content_id: contentId,
      answer_text: answerText.trim(),
      mood_state: moodState || null,
      is_private: 1,
      tags: tags || [],
      created_at: now,
      updated_at: now,
      content_item: this.getContentItem(contentId, userId) || undefined
    };
  }

  public static getUserAnswers(userId: string, contentId?: string): ContentUserAnswer[] {
    this.ensureTables();
    let rows: any[];
    if (contentId) {
      rows = db.prepare(`
        SELECT * FROM content_answers 
        WHERE user_id = ? AND content_id = ? 
        ORDER BY created_at DESC
      `).all(userId, contentId);
    } else {
      rows = db.prepare(`
        SELECT * FROM content_answers 
        WHERE user_id = ? 
        ORDER BY created_at DESC
      `).all(userId);
    }

    return rows.map(r => ({
      id: r.id,
      user_id: r.user_id,
      content_id: r.content_id,
      answer_text: r.answer_text,
      mood_state: r.mood_state,
      is_private: Number(r.is_private),
      tags: JSON.parse(r.tags || '[]'),
      created_at: Number(r.created_at),
      updated_at: Number(r.updated_at),
      content_item: this.getContentItem(r.content_id, userId) || undefined
    }));
  }

  public static deleteAnswer(userId: string, answerId: string): boolean {
    this.ensureTables();
    const res = db.prepare('DELETE FROM content_answers WHERE id = ? AND user_id = ?').run(answerId, userId);
    return res.changes > 0;
  }

  public static skipItem(userId: string, contentId: string, reason?: string): void {
    this.ensureTables();
    db.prepare(`
      INSERT OR REPLACE INTO content_skips (id, user_id, content_id, reason, skipped_at)
      VALUES (?, ?, ?, ?, ?)
    `).run(uuidv4(), userId, contentId, reason || 'user_skipped', Date.now());
  }

  public static recordView(userId: string, contentId: string, context?: string): void {
    this.ensureTables();
    db.prepare(`
      INSERT INTO content_views (id, user_id, content_id, viewed_at, context)
      VALUES (?, ?, ?, ?, ?)
    `).run(uuidv4(), userId, contentId, Date.now(), context || 'general_view');
  }

  public static reportContent(
    userId: string,
    contentId: string,
    reason: ContentReport['reason'],
    details?: string
  ): ContentReport {
    this.ensureTables();
    const id = uuidv4();
    const now = Date.now();

    db.prepare(`
      INSERT INTO content_reports (id, user_id, content_id, reason, details, status, created_at)
      VALUES (?, ?, ?, ?, ?, 'pending', ?)
    `).run(id, userId, contentId, reason, details || null, now);

    return {
      id,
      user_id: userId,
      content_id: contentId,
      reason,
      details: details || null,
      status: 'pending',
      created_at: now
    };
  }

  public static getCategoryTaxonomy() {
    this.ensureTables();
    const rows = db.prepare(`
      SELECT primary_category, subcategory, COUNT(*) as count 
      FROM content_items 
      GROUP BY primary_category, subcategory
    `).all() as Array<{ primary_category: string; subcategory: string; count: number }>;

    const counts: Record<string, number> = {};
    const subCounts: Record<string, number> = {};

    rows.forEach(r => {
      counts[r.primary_category] = (counts[r.primary_category] || 0) + r.count;
      subCounts[`${r.primary_category}:${r.subcategory}`] = r.count;
    });

    return {
      taxonomy: CONTENT_TAXONOMY_META,
      categoryCounts: counts,
      subcategoryCounts: subCounts
    };
  }

  public static exportUserData(userId: string) {
    this.ensureTables();
    const favorites = this.getUserFavorites(userId, 500, 0);
    const answers = this.getUserAnswers(userId);

    return {
      exported_at: new Date().toISOString(),
      user_id: userId,
      total_favorites: favorites.length,
      total_answers: answers.length,
      favorites,
      answers
    };
  }
}
