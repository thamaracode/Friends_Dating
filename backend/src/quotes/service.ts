import { db } from '../db';
import { v4 as uuidv4 } from 'uuid';
import {
  Quote,
  QuoteCategoryKey,
  QuoteUserPreferences,
  DailyQuotePayload,
  QUOTE_CATEGORIES
} from './types';
import { QuoteProviderRegistry, normalizeQuoteText, normalizeAuthor } from './registry';

export class QuoteDiscoveryService {
  /**
   * Retrieves user personalization preferences or seeds defaults.
   */
  public static getUserPreferences(userId: string): QuoteUserPreferences {
    const row = db.prepare('SELECT * FROM quote_user_preferences WHERE user_id = ?').get(userId) as any;
    if (row) {
      return {
        userId,
        includedCategories: JSON.parse(row.included_categories_json || '[]'),
        excludedCategories: JSON.parse(row.excluded_categories_json || '[]'),
        lengthPreference: row.length_preference || 'any',
        authorType: row.author_type || 'any',
        style: row.style || 'any',
        language: row.language || 'en',
        mode: row.mode || 'personalized',
        updatedAt: row.updated_at
      };
    }

    const allCats = Object.keys(QUOTE_CATEGORIES) as QuoteCategoryKey[];
    const defaults: QuoteUserPreferences = {
      userId,
      includedCategories: allCats,
      excludedCategories: [],
      lengthPreference: 'any',
      authorType: 'any',
      style: 'any',
      language: 'en',
      mode: 'personalized',
      updatedAt: Date.now()
    };

    db.prepare(`
      INSERT OR REPLACE INTO quote_user_preferences (
        user_id, included_categories_json, excluded_categories_json,
        length_preference, author_type, style, language, mode, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      userId,
      JSON.stringify(defaults.includedCategories),
      JSON.stringify(defaults.excludedCategories),
      defaults.lengthPreference,
      defaults.authorType,
      defaults.style,
      defaults.language,
      defaults.mode,
      defaults.updatedAt
    );

    return defaults;
  }

  /**
   * Updates user preferences.
   */
  public static updateUserPreferences(userId: string, patch: Partial<QuoteUserPreferences>): QuoteUserPreferences {
    const current = this.getUserPreferences(userId);
    const updated: QuoteUserPreferences = {
      ...current,
      ...patch,
      updatedAt: Date.now()
    };

    db.prepare(`
      INSERT OR REPLACE INTO quote_user_preferences (
        user_id, included_categories_json, excluded_categories_json,
        length_preference, author_type, style, language, mode, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      userId,
      JSON.stringify(updated.includedCategories),
      JSON.stringify(updated.excludedCategories),
      updated.lengthPreference,
      updated.authorType,
      updated.style,
      updated.language,
      updated.mode,
      updated.updatedAt
    );

    return updated;
  }

  /**
   * Serves the next quote avoiding recently displayed quotes for this user.
   * Auto-replenishes if eligible unshown supply is low.
   */
  public static async discoverNextQuote(userId: string): Promise<Quote & { isLiked?: boolean; isSaved?: boolean }> {
    const prefs = this.getUserPreferences(userId);

    // Build query conditions
    const conditions: string[] = ['is_verified = 1', 'is_moderated = 1'];
    const params: any[] = [];

    // Included categories
    if (prefs.includedCategories && prefs.includedCategories.length > 0) {
      const placeholders = prefs.includedCategories.map(() => '?').join(',');
      conditions.push(`category IN (${placeholders})`);
      params.push(...prefs.includedCategories);
    }

    // Excluded categories
    if (prefs.excludedCategories && prefs.excludedCategories.length > 0) {
      const placeholders = prefs.excludedCategories.map(() => '?').join(',');
      conditions.push(`category NOT IN (${placeholders})`);
      params.push(...prefs.excludedCategories);
    }

    // Length preference
    if (prefs.lengthPreference === 'short') {
      conditions.push('LENGTH(text) <= 110');
    } else if (prefs.lengthPreference === 'long') {
      conditions.push('LENGTH(text) > 110');
    }

    // Author preference
    if (prefs.authorType === 'anonymous') {
      conditions.push('(author LIKE "%unknown%" OR author LIKE "%anonymous%")');
    } else if (prefs.authorType === 'famous') {
      conditions.push('(author NOT LIKE "%unknown%" AND author NOT LIKE "%anonymous%")');
    }

    const whereClause = conditions.join(' AND ');

    // 1. Try to find quotes the user has NOT seen yet
    const unshownSql = `
      SELECT q.* FROM quotes q
      WHERE ${whereClause}
      AND q.id NOT IN (SELECT quote_id FROM quote_user_history WHERE user_id = ?)
      ORDER BY RANDOM()
      LIMIT 1
    `;

    let quoteRow = db.prepare(unshownSql).get(...params, userId) as any;

    // Check count of unshown quotes remaining to trigger background replenishment
    const remainingCountRow = db.prepare(`
      SELECT COUNT(*) as remaining FROM quotes q
      WHERE ${whereClause}
      AND q.id NOT IN (SELECT quote_id FROM quote_user_history WHERE user_id = ?)
    `).get(...params, userId) as { remaining: number };

    if (remainingCountRow.remaining < 10) {
      // Background non-blocking replenishment
      QuoteProviderRegistry.fetchAndIngestBatch(undefined, 30).catch(err => {
        console.warn('Background quote replenishment notice:', err.message);
      });
    }

    // 2. If user has seen all eligible quotes, recycle oldest seen
    if (!quoteRow) {
      const recycleSql = `
        SELECT q.* FROM quotes q
        JOIN quote_user_history h ON q.id = h.quote_id AND h.user_id = ?
        WHERE ${whereClause}
        ORDER BY h.seen_at ASC
        LIMIT 1
      `;
      quoteRow = db.prepare(recycleSql).get(userId, ...params) as any;

      // If still none, fallback to any verified quote
      if (!quoteRow) {
        quoteRow = db.prepare('SELECT * FROM quotes WHERE is_verified = 1 ORDER BY RANDOM() LIMIT 1').get() as any;
      }
    }

    if (!quoteRow) {
      throw new Error('No quotes available in the library');
    }

    // Mark as seen
    const now = Date.now();
    db.prepare(`
      INSERT OR REPLACE INTO quote_user_history (user_id, quote_id, seen_at)
      VALUES (?, ?, ?)
    `).run(userId, quoteRow.id, now);

    // Check interactions
    const isLiked = Boolean(
      db.prepare("SELECT 1 FROM quote_user_interactions WHERE user_id = ? AND quote_id = ? AND interaction_type = 'like'").get(userId, quoteRow.id)
    );
    const isSaved = Boolean(
      db.prepare("SELECT 1 FROM quote_user_interactions WHERE user_id = ? AND quote_id = ? AND interaction_type = 'save'").get(userId, quoteRow.id)
    );

    return {
      id: quoteRow.id,
      text: quoteRow.text,
      author: quoteRow.author,
      category: quoteRow.category as QuoteCategoryKey,
      tags: JSON.parse(quoteRow.tags_json || '[]'),
      language: quoteRow.language || 'en',
      provider: quoteRow.provider,
      sourceUrl: quoteRow.source_url,
      attribution: quoteRow.attribution,
      license: quoteRow.license,
      importedAt: quoteRow.imported_at,
      isVerified: Boolean(quoteRow.is_verified),
      isModerated: Boolean(quoteRow.is_moderated),
      isFeatured: Boolean(quoteRow.is_featured),
      reportCount: quoteRow.report_count || 0,
      likesCount: quoteRow.likes_count || 0,
      savesCount: quoteRow.saves_count || 0,
      createdAt: quoteRow.created_at,
      isLiked,
      isSaved
    };
  }

  /**
   * Retrieves a paginated quote feed for the infinite scroll discovery mode.
   */
  public static getFeed(
    userId: string,
    page: number = 1,
    limit: number = 10,
    category?: QuoteCategoryKey
  ): { quotes: Array<Quote & { isLiked?: boolean; isSaved?: boolean }>; total: number; hasMore: boolean } {
    const offset = (page - 1) * limit;
    const conditions = ['is_verified = 1', 'is_moderated = 1'];
    const params: any[] = [];

    if (category) {
      conditions.push('category = ?');
      params.push(category);
    }

    const where = conditions.join(' AND ');
    const countRow = db.prepare(`SELECT COUNT(*) as total FROM quotes WHERE ${where}`).get(...params) as { total: number };
    const total = countRow.total;

    const rows = db.prepare(`
      SELECT * FROM quotes
      WHERE ${where}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `).all(...params, limit, offset) as any[];

    // Fetch user liked & saved sets for these quotes
    const quoteIds = rows.map(r => r.id);
    const likedSet = new Set<string>();
    const savedSet = new Set<string>();

    if (quoteIds.length > 0) {
      const ph = quoteIds.map(() => '?').join(',');
      const interactions = db.prepare(`
        SELECT quote_id, interaction_type FROM quote_user_interactions
        WHERE user_id = ? AND quote_id IN (${ph})
      `).all(userId, ...quoteIds) as any[];

      for (const inter of interactions) {
        if (inter.interaction_type === 'like') likedSet.add(inter.quote_id);
        if (inter.interaction_type === 'save') savedSet.add(inter.quote_id);
      }
    }

    const quotes = rows.map(r => ({
      id: r.id,
      text: r.text,
      author: r.author,
      category: r.category as QuoteCategoryKey,
      tags: JSON.parse(r.tags_json || '[]'),
      language: r.language || 'en',
      provider: r.provider,
      sourceUrl: r.source_url,
      attribution: r.attribution,
      license: r.license,
      importedAt: r.imported_at,
      isVerified: Boolean(r.is_verified),
      isModerated: Boolean(r.is_moderated),
      isFeatured: Boolean(r.is_featured),
      reportCount: r.report_count || 0,
      likesCount: r.likes_count || 0,
      savesCount: r.saves_count || 0,
      createdAt: r.created_at,
      isLiked: likedSet.has(r.id),
      isSaved: savedSet.has(r.id)
    }));

    return {
      quotes,
      total,
      hasMore: offset + quotes.length < total
    };
  }

  /**
   * Toggles Like, Save/Bookmark, or registers Skip.
   */
  public static toggleInteraction(
    userId: string,
    quoteId: string,
    type: 'like' | 'save' | 'skip'
  ): { active: boolean; likesCount: number; savesCount: number } {
    const existing = db.prepare(`
      SELECT id FROM quote_user_interactions
      WHERE user_id = ? AND quote_id = ? AND interaction_type = ?
    `).get(userId, quoteId, type) as any;

    let active = false;

    if (existing) {
      // Toggle off
      db.prepare('DELETE FROM quote_user_interactions WHERE id = ?').run(existing.id);
      if (type === 'like') {
        db.prepare('UPDATE quotes SET likes_count = MAX(0, likes_count - 1) WHERE id = ?').run(quoteId);
      } else if (type === 'save') {
        db.prepare('UPDATE quotes SET saves_count = MAX(0, saves_count - 1) WHERE id = ?').run(quoteId);
      }
      active = false;
    } else {
      // Toggle on
      const id = `inter_${uuidv4().slice(0, 10)}`;
      db.prepare(`
        INSERT INTO quote_user_interactions (id, user_id, quote_id, interaction_type, created_at)
        VALUES (?, ?, ?, ?, ?)
      `).run(id, userId, quoteId, type, Date.now());

      if (type === 'like') {
        db.prepare('UPDATE quotes SET likes_count = likes_count + 1 WHERE id = ?').run(quoteId);
      } else if (type === 'save') {
        db.prepare('UPDATE quotes SET saves_count = saves_count + 1 WHERE id = ?').run(quoteId);
      }
      active = true;
    }

    const counts = db.prepare('SELECT likes_count, saves_count FROM quotes WHERE id = ?').get(quoteId) as any;
    return {
      active,
      likesCount: counts?.likes_count || 0,
      savesCount: counts?.saves_count || 0
    };
  }

  /**
   * Returns user's saved quotes collection.
   */
  public static getSavedQuotes(userId: string): Quote[] {
    const rows = db.prepare(`
      SELECT q.* FROM quotes q
      JOIN quote_user_interactions i ON q.id = i.quote_id
      WHERE i.user_id = ? AND i.interaction_type = 'save'
      ORDER BY i.created_at DESC
    `).all(userId) as any[];

    return rows.map(r => ({
      id: r.id,
      text: r.text,
      author: r.author,
      category: r.category as QuoteCategoryKey,
      tags: JSON.parse(r.tags_json || '[]'),
      language: r.language || 'en',
      provider: r.provider,
      sourceUrl: r.source_url,
      attribution: r.attribution,
      license: r.license,
      importedAt: r.imported_at,
      isVerified: Boolean(r.is_verified),
      isModerated: Boolean(r.is_moderated),
      isFeatured: Boolean(r.is_featured),
      reportCount: r.report_count || 0,
      likesCount: r.likes_count || 0,
      savesCount: r.saves_count || 0,
      createdAt: r.created_at
    }));
  }

  /**
   * Clears user seen history.
   */
  public static clearHistory(userId: string): void {
    db.prepare('DELETE FROM quote_user_history WHERE user_id = ?').run(userId);
  }

  /**
   * Returns or generates the deterministic daily featured quote with reflection question.
   */
  public static getDailyQuote(dateStr?: string): DailyQuotePayload {
    const today = dateStr || new Date().toISOString().slice(0, 10);
    const existing = db.prepare('SELECT * FROM daily_quotes WHERE date_string = ?').get(today) as any;

    if (existing) {
      const q = db.prepare('SELECT * FROM quotes WHERE id = ?').get(existing.quote_id) as any;
      let relQ: any = null;
      if (existing.secondary_quote_id) {
        relQ = db.prepare('SELECT * FROM quotes WHERE id = ?').get(existing.secondary_quote_id) as any;
      }

      return {
        date: today,
        featuredQuote: {
          id: q.id,
          text: q.text,
          author: q.author,
          category: q.category as QuoteCategoryKey,
          tags: JSON.parse(q.tags_json || '[]'),
          language: q.language || 'en',
          provider: q.provider,
          sourceUrl: q.source_url,
          attribution: q.attribution,
          license: q.license,
          importedAt: q.imported_at,
          isVerified: Boolean(q.is_verified),
          isModerated: Boolean(q.is_moderated),
          likesCount: q.likes_count || 0,
          savesCount: q.saves_count || 0,
          createdAt: q.created_at
        },
        reflectionQuestion: existing.reflection_question,
        relationshipQuote: relQ ? {
          id: relQ.id,
          text: relQ.text,
          author: relQ.author,
          category: relQ.category as QuoteCategoryKey,
          tags: JSON.parse(relQ.tags_json || '[]'),
          language: relQ.language || 'en',
          provider: relQ.provider,
          sourceUrl: relQ.source_url,
          attribution: relQ.attribution,
          license: relQ.license,
          importedAt: relQ.imported_at,
          isVerified: Boolean(relQ.is_verified),
          isModerated: Boolean(relQ.is_moderated),
          likesCount: relQ.likes_count || 0,
          savesCount: relQ.saves_count || 0,
          createdAt: relQ.created_at
        } : undefined
      };
    }

    // Pick a primary featured quote and a relationship quote
    const primaryQuote = db.prepare(`
      SELECT * FROM quotes
      WHERE is_verified = 1 AND is_moderated = 1
      ORDER BY RANDOM()
      LIMIT 1
    `).get() as any;

    const relationshipQuote = db.prepare(`
      SELECT * FROM quotes
      WHERE is_verified = 1 AND is_moderated = 1 AND category IN ('love_romance', 'relationships', 'friendship', 'marriage_commitment')
      ORDER BY RANDOM()
      LIMIT 1
    `).get() as any;

    if (!primaryQuote) {
      throw new Error('Cannot generate daily quote: library is empty');
    }

    const reflectionQuestions = [
      "How can you honor this truth in your most significant connection today?",
      "In what subtle way does this quote challenge an assumption you held this week?",
      "What gentle boundary or gesture of appreciation does this inspire you to offer?",
      "How would your communication shift if you lived this observation for 24 hours?",
      "Who in your life embodies this quality, and when did you last let them know?"
    ];
    const pickedQuestion = reflectionQuestions[Math.floor(Math.random() * reflectionQuestions.length)];

    const id = `dq_${uuidv4().slice(0, 10)}`;
    db.prepare(`
      INSERT INTO daily_quotes (id, date_string, quote_id, reflection_question, secondary_quote_id, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(id, today, primaryQuote.id, pickedQuestion, relationshipQuote?.id || null, Date.now());

    return this.getDailyQuote(today);
  }

  public static getCategories(): CategoryMetadata[] {
    return Object.values(QUOTE_CATEGORIES);
  }

  public static getDailyHistory(limit: number = 14): Array<{ date: string; reflectionQuestion: string; quote: any }> {
    const rows = db.prepare(`
      SELECT dq.date_string, dq.reflection_question, q.id, q.text, q.author, q.category, q.attribution
      FROM daily_quotes dq
      JOIN quotes q ON dq.quote_id = q.id
      ORDER BY dq.date_string DESC
      LIMIT ?
    `).all(limit) as any[];

    return rows.map(r => ({
      date: r.date_string,
      reflectionQuestion: r.reflection_question,
      quote: {
        id: r.id,
        text: r.text,
        author: r.author,
        category: r.category,
        attribution: r.attribution
      }
    }));
  }

  /**
   * Reports an inappropriate or offensive quote.
   */
  public static reportQuote(quoteId: string, _reason: string): void {
    db.prepare(`
      UPDATE quotes SET
        report_count = report_count + 1,
        is_moderated = CASE WHEN report_count >= 3 THEN 0 ELSE is_moderated END
      WHERE id = ?
    `).run(quoteId);
  }

  // --- ADMIN ACTIONS ---
  public static adminGetQuotes(filters: {
    category?: string;
    search?: string;
    provider?: string;
    isVerified?: boolean;
    isModerated?: boolean;
    page?: number;
    limit?: number;
  }): { quotes: Quote[]; total: number } {
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const offset = (page - 1) * limit;

    const conditions: string[] = ['1=1'];
    const params: any[] = [];

    if (filters.category) {
      conditions.push('category = ?');
      params.push(filters.category);
    }
    if (filters.provider) {
      conditions.push('provider = ?');
      params.push(filters.provider);
    }
    if (filters.isVerified !== undefined) {
      conditions.push('is_verified = ?');
      params.push(filters.isVerified ? 1 : 0);
    }
    if (filters.isModerated !== undefined) {
      conditions.push('is_moderated = ?');
      params.push(filters.isModerated ? 1 : 0);
    }
    if (filters.search) {
      conditions.push('(text LIKE ? OR author LIKE ?)');
      params.push(`%${filters.search}%`, `%${filters.search}%`);
    }

    const where = conditions.join(' AND ');
    const totalRow = db.prepare(`SELECT COUNT(*) as total FROM quotes WHERE ${where}`).get(...params) as { total: number };

    const rows = db.prepare(`
      SELECT * FROM quotes
      WHERE ${where}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `).all(...params, limit, offset) as any[];

    return {
      quotes: rows.map(r => ({
        id: r.id,
        text: r.text,
        author: r.author,
        category: r.category as QuoteCategoryKey,
        tags: JSON.parse(r.tags_json || '[]'),
        language: r.language,
        provider: r.provider,
        sourceUrl: r.source_url,
        attribution: r.attribution,
        license: r.license,
        importedAt: r.imported_at,
        isVerified: Boolean(r.is_verified),
        isModerated: Boolean(r.is_moderated),
        isFeatured: Boolean(r.is_featured),
        reportCount: r.report_count || 0,
        likesCount: r.likes_count || 0,
        savesCount: r.saves_count || 0,
        createdAt: r.created_at
      })),
      total: totalRow.total
    };
  }

  public static adminCreateQuote(data: {
    text: string;
    author: string;
    category: QuoteCategoryKey;
    tags?: string[];
    attribution?: string;
    sourceUrl?: string;
  }): Quote {
    const id = `qt_${uuidv4().slice(0, 10)}`;
    const now = Date.now();
    const normText = normalizeQuoteText(data.text);
    const normAuthor = normalizeAuthor(data.author);

    db.prepare(`
      INSERT INTO quotes (
        id, text, normalized_text, author, normalized_author, category, tags_json,
        language, provider, source_url, attribution, license, imported_at,
        is_verified, is_moderated, is_featured, report_count, likes_count, saves_count, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'en', 'custom_admin', ?, ?, 'Proprietary Soulverse', ?, 1, 1, 0, 0, 0, 0, ?)
    `).run(
      id,
      data.text.trim(),
      normText,
      data.author.trim(),
      normAuthor,
      data.category,
      JSON.stringify(data.tags || []),
      data.sourceUrl || null,
      data.attribution || 'Soulverse Curated',
      now,
      now
    );

    return {
      id,
      text: data.text.trim(),
      author: data.author.trim(),
      category: data.category,
      tags: data.tags || [],
      language: 'en',
      provider: 'custom_admin',
      sourceUrl: data.sourceUrl,
      attribution: data.attribution || 'Soulverse Curated',
      importedAt: now,
      isVerified: true,
      isModerated: true,
      createdAt: now
    };
  }

  public static adminUpdateQuote(id: string, patch: Partial<Quote>): void {
    const current = db.prepare('SELECT * FROM quotes WHERE id = ?').get(id) as any;
    if (!current) throw new Error('Quote not found');

    const updatedText = patch.text !== undefined ? patch.text.trim() : current.text;
    const updatedAuthor = patch.author !== undefined ? patch.author.trim() : current.author;
    const normText = normalizeQuoteText(updatedText);
    const normAuthor = normalizeAuthor(updatedAuthor);

    db.prepare(`
      UPDATE quotes SET
        text = ?,
        normalized_text = ?,
        author = ?,
        normalized_author = ?,
        category = ?,
        tags_json = ?,
        attribution = ?,
        is_verified = ?,
        is_moderated = ?,
        is_featured = ?
      WHERE id = ?
    `).run(
      updatedText,
      normText,
      updatedAuthor,
      normAuthor,
      patch.category || current.category,
      patch.tags ? JSON.stringify(patch.tags) : current.tags_json,
      patch.attribution !== undefined ? patch.attribution : current.attribution,
      patch.isVerified !== undefined ? (patch.isVerified ? 1 : 0) : current.is_verified,
      patch.isModerated !== undefined ? (patch.isModerated ? 1 : 0) : current.is_moderated,
      patch.isFeatured !== undefined ? (patch.isFeatured ? 1 : 0) : current.is_featured,
      id
    );
  }

  public static adminDeleteQuote(id: string): void {
    db.prepare('DELETE FROM quote_user_history WHERE quote_id = ?').run(id);
    db.prepare('DELETE FROM quote_user_interactions WHERE quote_id = ?').run(id);
    db.prepare('DELETE FROM daily_quotes WHERE quote_id = ? OR secondary_quote_id = ?').run(id, id);
    db.prepare('DELETE FROM quotes WHERE id = ?').run(id);
  }

  public static adminDeduplicate(): { removedCount: number } {
    const duplicates = db.prepare(`
      SELECT normalized_text, normalized_author, COUNT(*) as count, GROUP_CONCAT(id) as ids
      FROM quotes
      GROUP BY normalized_text, normalized_author
      HAVING count > 1
    `).all() as any[];

    let removedCount = 0;
    db.transaction(() => {
      for (const dup of duplicates) {
        const idList = dup.ids.split(',');
        const [keepId, ...removeIds] = idList;
        for (const remId of removeIds) {
          // Re-point interactions to keepId
          db.prepare('UPDATE OR IGNORE quote_user_interactions SET quote_id = ? WHERE quote_id = ?').run(keepId, remId);
          db.prepare('DELETE FROM quote_user_interactions WHERE quote_id = ?').run(remId);
          db.prepare('DELETE FROM quote_user_history WHERE quote_id = ?').run(remId);
          db.prepare('DELETE FROM quotes WHERE id = ?').run(remId);
          removedCount++;
        }
      }
    })();

    return { removedCount };
  }

  public static adminSetDailyQuote(dateStr: string, quoteId: string, reflectionQuestion?: string): DailyQuotePayload {
    const quote = db.prepare('SELECT * FROM quotes WHERE id = ?').get(quoteId) as any;
    if (!quote) throw new Error('Quote not found');
    const now = Date.now();
    const qText = reflectionQuestion || "How does this perspective shape your interactions today?";
    const existing = db.prepare('SELECT id FROM daily_quotes WHERE date_string = ?').get(dateStr) as any;
    if (existing) {
      db.prepare('UPDATE daily_quotes SET quote_id = ?, reflection_question = ? WHERE id = ?').run(quoteId, qText, existing.id);
    } else {
      const id = 'dq_' + Math.random().toString(36).substring(2, 11);
      db.prepare(`
        INSERT INTO daily_quotes (id, date_string, quote_id, reflection_question, secondary_quote_id, created_at)
        VALUES (?, ?, ?, ?, NULL, ?)
      `).run(id, dateStr, quoteId, qText, now);
    }
    return this.getDailyQuote(dateStr);
  }
}
