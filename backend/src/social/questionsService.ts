import { db } from '../db';
import { v4 as uuidv4 } from 'uuid';
import {
  QuestionEcosystemItem,
  QuestionPrimaryCategory,
  QuestionDepthLevel,
  QuestionAnswerItem,
  QuestionAnswerType,
  ContentVisibility
} from './types';
import { SEED_QUESTIONS_ECOSYSTEM } from './questionsSeed';

export class QuestionsService {
  private static seeded = false;

  public static ensureSeeded(): void {
    if (this.seeded) return;
    try {
      const count = (db.prepare('SELECT COUNT(*) as count FROM questions_ecosystem').get() as any)?.count || 0;
      if (count === 0) {
        const insertStmt = db.prepare(`
          INSERT INTO questions_ecosystem (
            id, question_text, primary_category, subcategory, depth_level,
            difficulty, sensitivity, audience_suitability, context_tip,
            follow_up_questions, content_tags, language, author_id, author_name,
            source_name, approval_status, is_daily_eligible, likes_count,
            answers_count, views_count, shares_count, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, 0, 0, ?, ?)
        `);

        const now = Date.now();
        const tx = db.transaction(() => {
          for (const item of SEED_QUESTIONS_ECOSYSTEM) {
            insertStmt.run(
              item.id,
              item.question_text,
              item.primary_category,
              item.subcategory,
              item.depth_level,
              item.difficulty,
              item.sensitivity,
              item.audience_suitability,
              item.context_tip || null,
              JSON.stringify(item.follow_up_questions || []),
              JSON.stringify(item.content_tags || []),
              item.language,
              item.author_id || null,
              item.author_name,
              item.source_name,
              item.approval_status,
              item.is_daily_eligible ? 1 : 0,
              now,
              now
            );
          }
        });
        tx();
      }
      this.seeded = true;
    } catch (e) {
      console.error('Questions ecosystem seeding error:', e);
    }
  }

  /**
   * Query questions with categorical and depth filters, search, and viewer context.
   */
  public static getQuestions(params: {
    category?: QuestionPrimaryCategory | 'all';
    depth_level?: QuestionDepthLevel | 'all';
    search?: string;
    tag?: string;
    limit?: number;
    offset?: number;
    viewer_id?: string;
    approval_status?: string;
  }): { items: QuestionEcosystemItem[]; total: number } {
    this.ensureSeeded();

    const limit = Math.min(params.limit || 20, 100);
    const offset = params.offset || 0;
    const approvalStatus = params.approval_status || 'approved';

    let whereClauses: string[] = ['approval_status = ?'];
    let queryParams: any[] = [approvalStatus];

    if (params.category && params.category !== 'all') {
      whereClauses.push('primary_category = ?');
      queryParams.push(params.category);
    }

    if (params.depth_level && params.depth_level !== 'all') {
      whereClauses.push('depth_level = ?');
      queryParams.push(params.depth_level);
    }

    if (params.tag) {
      whereClauses.push('content_tags LIKE ?');
      queryParams.push(`%${params.tag}%`);
    }

    if (params.search && params.search.trim()) {
      whereClauses.push('(question_text LIKE ? OR subcategory LIKE ? OR context_tip LIKE ?)');
      const s = `%${params.search.trim()}%`;
      queryParams.push(s, s, s);
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const countRow = db.prepare(`SELECT COUNT(*) as count FROM questions_ecosystem ${whereSql}`).get(...queryParams) as any;
    const total = countRow?.count || 0;

    const rows = db.prepare(`
      SELECT * FROM questions_ecosystem
      ${whereSql}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `).all(...queryParams, limit, offset) as any[];

    const items = rows.map(r => this.mapRow(r, params.viewer_id));
    return { items, total };
  }

  /**
   * Retrieves single question by ID with viewer state.
   */
  public static getQuestionById(id: string, viewerId?: string): QuestionEcosystemItem | null {
    this.ensureSeeded();
    const row = db.prepare('SELECT * FROM questions_ecosystem WHERE id = ?').get(id) as any;
    if (!row) return null;
    return this.mapRow(row, viewerId);
  }

  /**
   * True Non-Repeating Refresh Engine.
   * Retrieves a new, unviewed, unskipped question respecting category and depth preferences.
   * Records the view immediately so it won't be repeated on subsequent clicks.
   */
  public static refreshQuestion(params: {
    category?: QuestionPrimaryCategory | 'all';
    depth_level?: QuestionDepthLevel | 'all';
    exclude_ids?: string[];
    viewer_id?: string;
  }): { question: QuestionEcosystemItem | null; is_cycle_reset: boolean } {
    this.ensureSeeded();

    const viewerId = params.viewer_id || 'usr_anonymous';
    const clientExcluded = params.exclude_ids || [];

    let whereClauses: string[] = ["approval_status = 'approved'"];
    let queryParams: any[] = [];

    if (params.category && params.category !== 'all') {
      whereClauses.push('primary_category = ?');
      queryParams.push(params.category);
    }

    if (params.depth_level && params.depth_level !== 'all') {
      whereClauses.push('depth_level = ?');
      queryParams.push(params.depth_level);
    }

    // Combine client-side exclusions with database views and skips
    let exclusionSql = '';
    const allExcluded = new Set<string>(clientExcluded);

    if (viewerId !== 'usr_anonymous') {
      const viewsAndSkips = db.prepare(`
        SELECT question_id FROM question_views WHERE user_id = ?
        UNION
        SELECT question_id FROM question_skips WHERE user_id = ?
      `).all(viewerId, viewerId) as any[];

      viewsAndSkips.forEach(r => allExcluded.add(r.question_id));
    }

    let is_cycle_reset = false;

    if (allExcluded.size > 0) {
      const placeholders = Array.from(allExcluded).map(() => '?').join(',');
      const candidateSql = `
        SELECT * FROM questions_ecosystem
        WHERE ${whereClauses.join(' AND ')}
          AND id NOT IN (${placeholders})
        ORDER BY RANDOM()
        LIMIT 1
      `;

      let row = db.prepare(candidateSql).get(...queryParams, ...Array.from(allExcluded)) as any;

      if (!row) {
        // If all questions in this category/depth have been viewed, gracefully reset the cycle
        is_cycle_reset = true;
        const resetSql = `
          SELECT * FROM questions_ecosystem
          WHERE ${whereClauses.join(' AND ')}
          ORDER BY RANDOM()
          LIMIT 1
        `;
        row = db.prepare(resetSql).get(...queryParams) as any;
      }

      if (row) {
        this.recordView(row.id, viewerId);
        return { question: this.mapRow(row, viewerId), is_cycle_reset };
      }
    } else {
      const fallbackSql = `
        SELECT * FROM questions_ecosystem
        WHERE ${whereClauses.join(' AND ')}
        ORDER BY RANDOM()
        LIMIT 1
      `;
      const row = db.prepare(fallbackSql).get(...queryParams) as any;
      if (row) {
        this.recordView(row.id, viewerId);
        return { question: this.mapRow(row, viewerId), is_cycle_reset: false };
      }
    }

    return { question: null, is_cycle_reset: false };
  }

  /**
   * Internal helper to record view and update counters.
   */
  private static recordView(questionId: string, userId: string): void {
    if (userId && userId !== 'usr_anonymous') {
      try {
        db.prepare(`
          INSERT INTO question_views (id, user_id, question_id, viewed_at)
          VALUES (?, ?, ?, ?)
        `).run(uuidv4(), userId, questionId, Date.now());
      } catch {
        // Ignored if duplicate
      }
    }
    db.prepare('UPDATE questions_ecosystem SET views_count = views_count + 1 WHERE id = ?').run(questionId);
  }

  /**
   * Skip question permanently from refresh draws.
   */
  public static skipQuestion(questionId: string, userId: string): void {
    try {
      db.prepare(`
        INSERT OR REPLACE INTO question_skips (id, user_id, question_id, skipped_at)
        VALUES (?, ?, ?, ?)
      `).run(uuidv4(), userId, questionId, Date.now());
    } catch (e) {
      console.warn('Skip question error:', e);
    }
  }

  /**
   * Submit or edit answer to a question.
   */
  public static answerQuestion(params: {
    question_id: string;
    user_id: string;
    answer_text: string;
    answer_type?: QuestionAnswerType;
    media_urls?: string[];
    mood_state?: string;
    visibility?: ContentVisibility;
    custom_audience_ids?: string[];
    attach_to_profile?: boolean;
    publish_as_post?: boolean;
  }): QuestionAnswerItem {
    this.ensureSeeded();

    const q = this.getQuestionById(params.question_id);
    if (!q) {
      throw new Error('Question not found');
    }

    const answerType = params.answer_type || 'long_text';
    const visibility = params.visibility || 'private';
    const attachToProfile = params.attach_to_profile ? 1 : 0;
    const mediaUrls = JSON.stringify(params.media_urls || []);
    const audienceIds = JSON.stringify(params.custom_audience_ids || []);
    const now = Date.now();

    // Check existing answer
    const existing = db.prepare(`
      SELECT * FROM question_answers
      WHERE question_id = ? AND user_id = ?
    `).get(params.question_id, params.user_id) as any;

    let answerId: string;

    if (existing) {
      answerId = existing.id;
      db.prepare(`
        UPDATE question_answers
        SET answer_type = ?, answer_text = ?, media_urls = ?, mood_state = ?,
            visibility = ?, custom_audience_ids = ?, attach_to_profile = ?, updated_at = ?
        WHERE id = ?
      `).run(
        answerType,
        params.answer_text,
        mediaUrls,
        params.mood_state || null,
        visibility,
        audienceIds,
        attachToProfile,
        now,
        answerId
      );
    } else {
      answerId = uuidv4();
      db.prepare(`
        INSERT INTO question_answers (
          id, question_id, user_id, answer_type, answer_text, media_urls,
          mood_state, visibility, custom_audience_ids, attach_to_profile,
          likes_count, comments_count, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, ?, ?)
      `).run(
        answerId,
        params.question_id,
        params.user_id,
        answerType,
        params.answer_text,
        mediaUrls,
        params.mood_state || null,
        visibility,
        audienceIds,
        attachToProfile,
        now,
        now
      );

      db.prepare('UPDATE questions_ecosystem SET answers_count = answers_count + 1 WHERE id = ?').run(params.question_id);
    }

    return this.getAnswerById(answerId, params.user_id)!;
  }

  /**
   * Retrieves single answer by ID with author metadata and ABAC privacy check.
   */
  public static getAnswerById(id: string, viewerId?: string): QuestionAnswerItem | null {
    const row = db.prepare(`
      SELECT a.*, u.name as author_name, u.avatar_url as author_avatar
      FROM question_answers a
      LEFT JOIN users u ON a.user_id = u.id
      WHERE a.id = ?
    `).get(id) as any;

    if (!row) return null;

    // ABAC Privacy Check
    if (!this.canViewAnswer(row, viewerId)) {
      return null;
    }

    return this.mapAnswerRow(row, viewerId);
  }

  /**
   * Get answers for a question with strict ABAC visibility filtering.
   */
  public static getQuestionAnswers(questionId: string, viewerId?: string, limit = 20, offset = 0): QuestionAnswerItem[] {
    const rows = db.prepare(`
      SELECT a.*, u.name as author_name, u.avatar_url as author_avatar
      FROM question_answers a
      LEFT JOIN users u ON a.user_id = u.id
      WHERE a.question_id = ?
      ORDER BY a.created_at DESC
      LIMIT ? OFFSET ?
    `).all(questionId, limit * 2, offset) as any[]; // Fetch extra to filter in memory for ABAC

    const visible: QuestionAnswerItem[] = [];
    for (const r of rows) {
      if (this.canViewAnswer(r, viewerId)) {
        visible.push(this.mapAnswerRow(r, viewerId));
        if (visible.length >= limit) break;
      }
    }

    return visible;
  }

  /**
   * Delete an answer.
   */
  public static deleteAnswer(answerId: string, userId: string): boolean {
    const ans = db.prepare('SELECT * FROM question_answers WHERE id = ?').get(answerId) as any;
    if (!ans) return false;
    if (ans.user_id !== userId) {
      throw new Error('Unauthorized to delete this answer');
    }

    db.prepare('DELETE FROM question_answers WHERE id = ?').run(answerId);
    db.prepare('UPDATE questions_ecosystem SET answers_count = MAX(0, answers_count - 1) WHERE id = ?').run(ans.question_id);
    return true;
  }

  /**
   * Personal question history: answered, saved, skipped, or authored questions.
   */
  public static getPersonalHistory(userId: string, filter: 'answered' | 'saved' | 'skipped' | 'my_answers'): any[] {
    this.ensureSeeded();

    if (filter === 'answered') {
      const rows = db.prepare(`
        SELECT q.*, a.id as answer_id, a.answer_text, a.visibility as answer_visibility, a.created_at as answered_at
        FROM question_answers a
        JOIN questions_ecosystem q ON a.question_id = q.id
        WHERE a.user_id = ?
        ORDER BY a.created_at DESC
      `).all(userId) as any[];
      return rows;
    }

    if (filter === 'saved') {
      const rows = db.prepare(`
        SELECT q.*, b.created_at as saved_at
        FROM social_bookmarks b
        JOIN questions_ecosystem q ON b.target_id = q.id
        WHERE b.user_id = ? AND b.target_type = 'question'
        ORDER BY b.created_at DESC
      `).all(userId) as any[];
      return rows;
    }

    if (filter === 'skipped') {
      const rows = db.prepare(`
        SELECT q.*, s.skipped_at
        FROM question_skips s
        JOIN questions_ecosystem q ON s.question_id = q.id
        WHERE s.user_id = ?
        ORDER BY s.skipped_at DESC
      `).all(userId) as any[];
      return rows;
    }

    if (filter === 'my_answers') {
      const rows = db.prepare(`
        SELECT a.*, q.question_text, q.primary_category
        FROM question_answers a
        JOIN questions_ecosystem q ON a.question_id = q.id
        WHERE a.user_id = ?
        ORDER BY a.created_at DESC
      `).all(userId) as any[];
      return rows.map(r => this.mapAnswerRow(r, userId));
    }

    return [];
  }

  /**
   * Deterministic Timezone-Aware Daily Question.
   */
  public static getDailyQuestion(dateKey: string, viewerId?: string): QuestionEcosystemItem {
    this.ensureSeeded();

    const eligible = db.prepare(`
      SELECT * FROM questions_ecosystem
      WHERE is_daily_eligible = 1 AND approval_status = 'approved'
      ORDER BY id ASC
    `).all() as any[];

    if (!eligible || eligible.length === 0) {
      const anyRow = db.prepare('SELECT * FROM questions_ecosystem LIMIT 1').get() as any;
      return this.mapRow(anyRow, viewerId);
    }

    // Deterministic hash based on dateKey string
    let hash = 0;
    for (let i = 0; i < dateKey.length; i++) {
      hash = (hash << 5) - hash + dateKey.charCodeAt(i);
      hash |= 0;
    }
    const index = Math.abs(hash) % eligible.length;
    return this.mapRow(eligible[index], viewerId);
  }

  /**
   * Submit community question.
   */
  public static submitQuestion(params: {
    question_text: string;
    primary_category: QuestionPrimaryCategory;
    subcategory: string;
    depth_level: QuestionDepthLevel;
    context_tip?: string;
    follow_up_questions?: string[];
    content_tags?: string[];
    author_id: string;
    author_name: string;
    is_admin?: boolean;
  }): QuestionEcosystemItem {
    this.ensureSeeded();

    const id = `q_comm_${uuidv4().substring(0, 8)}`;
    const status = params.is_admin ? 'approved' : 'review';
    const now = Date.now();

    db.prepare(`
      INSERT INTO questions_ecosystem (
        id, question_text, primary_category, subcategory, depth_level,
        difficulty, sensitivity, audience_suitability, context_tip,
        follow_up_questions, content_tags, language, author_id, author_name,
        source_name, approval_status, is_daily_eligible, likes_count,
        answers_count, views_count, shares_count, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, 'medium', 'general', 'all_audiences', ?, ?, ?, 'en', ?, ?, 'Community Contributor', ?, 1, 0, 0, 0, 0, ?, ?)
    `).run(
      id,
      params.question_text,
      params.primary_category,
      params.subcategory,
      params.depth_level,
      params.context_tip || null,
      JSON.stringify(params.follow_up_questions || []),
      JSON.stringify(params.content_tags || []),
      params.author_id,
      params.author_name,
      status,
      now,
      now
    );

    return this.getQuestionById(id, params.author_id)!;
  }

  /**
   * ABAC Permission Checker for Question Answers.
   */
  private static canViewAnswer(row: any, viewerId?: string): boolean {
    if (row.visibility === 'public') return true;
    if (!viewerId) return false;
    if (row.user_id === viewerId) return true;

    if (row.visibility === 'private') {
      return false;
    }

    if (row.visibility === 'connections' || row.visibility === 'friends') {
      const rel = db.prepare(`
        SELECT 1 FROM user_relationships
        WHERE ((user_id = ? AND target_user_id = ?) OR (user_id = ? AND target_user_id = ?))
          AND relationship_type IN ('friend', 'match', 'selected')
      `).get(row.user_id, viewerId, viewerId, row.user_id);

      if (rel) return true;

      const conn = db.prepare(`
        SELECT 1 FROM connection_requests
        WHERE ((sender_id = ? AND recipient_id = ?) OR (sender_id = ? AND recipient_id = ?))
          AND status = 'accepted'
      `).get(row.user_id, viewerId, viewerId, row.user_id);

      return !!conn;
    }

    if (row.visibility === 'selected' || row.visibility === 'custom') {
      try {
        const allowed = JSON.parse(row.custom_audience_ids || '[]');
        return Array.isArray(allowed) && allowed.includes(viewerId);
      } catch {
        return false;
      }
    }

    return false;
  }

  /**
   * Helper to map row to QuestionEcosystemItem.
   */
  private static mapRow(row: any, viewerId?: string): QuestionEcosystemItem {
    let isViewed = false;
    let isSaved = false;
    let isAnswered = false;
    let userAnswer: QuestionAnswerItem | null = null;

    if (viewerId && viewerId !== 'usr_anonymous') {
      const v = db.prepare('SELECT 1 FROM question_views WHERE user_id = ? AND question_id = ?').get(viewerId, row.id);
      isViewed = !!v;

      const b = db.prepare("SELECT 1 FROM social_bookmarks WHERE user_id = ? AND target_type = 'question' AND target_id = ?").get(viewerId, row.id);
      isSaved = !!b;

      const a = db.prepare(`
        SELECT * FROM question_answers
        WHERE question_id = ? AND user_id = ?
        ORDER BY created_at DESC LIMIT 1
      `).get(row.id, viewerId) as any;

      if (a) {
        isAnswered = true;
        userAnswer = this.mapAnswerRow(a, viewerId);
      }
    }

    return {
      id: row.id,
      question_text: row.question_text,
      primary_category: row.primary_category as QuestionPrimaryCategory,
      subcategory: row.subcategory,
      depth_level: row.depth_level as QuestionDepthLevel,
      difficulty: row.difficulty,
      sensitivity: row.sensitivity,
      audience_suitability: row.audience_suitability,
      context_tip: row.context_tip || undefined,
      follow_up_questions: JSON.parse(row.follow_up_questions || '[]'),
      content_tags: JSON.parse(row.content_tags || '[]'),
      language: row.language || 'en',
      author_id: row.author_id,
      author_name: row.author_name || 'Soulverse Sanctuary',
      source_name: row.source_name || 'Wisdom Collective',
      approval_status: row.approval_status,
      is_daily_eligible: Boolean(row.is_daily_eligible),
      likes_count: row.likes_count || 0,
      answers_count: row.answers_count || 0,
      views_count: row.views_count || 0,
      shares_count: row.shares_count || 0,
      created_at: row.created_at,
      updated_at: row.updated_at,
      is_viewed: isViewed,
      is_saved: isSaved,
      is_answered: isAnswered,
      user_answer: userAnswer
    };
  }

  /**
   * Helper to map answer row.
   */
  private static mapAnswerRow(row: any, viewerId?: string): QuestionAnswerItem {
    let isLiked = false;
    if (viewerId) {
      const r = db.prepare("SELECT 1 FROM social_reactions WHERE target_type = 'answer' AND target_id = ? AND user_id = ?").get(row.id, viewerId);
      isLiked = !!r;
    }

    return {
      id: row.id,
      question_id: row.question_id,
      user_id: row.user_id,
      author_name: row.author_name || 'Anonymous Soul',
      author_avatar: row.author_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      answer_type: row.answer_type as QuestionAnswerType,
      answer_text: row.answer_text,
      media_urls: JSON.parse(row.media_urls || '[]'),
      mood_state: row.mood_state || undefined,
      visibility: row.visibility as ContentVisibility,
      custom_audience_ids: JSON.parse(row.custom_audience_ids || '[]'),
      attach_to_profile: Boolean(row.attach_to_profile),
      likes_count: row.likes_count || 0,
      comments_count: row.comments_count || 0,
      created_at: row.created_at,
      updated_at: row.updated_at,
      is_liked: isLiked
    };
  }
}
