import Dexie, { Table } from 'dexie';

export interface LocalPostDraft {
  id: string;
  user_id: string;
  post_type: string;
  title?: string;
  content: string;
  media_urls?: string[];
  attachment_json?: any;
  visibility: string;
  tags?: string[];
  updatedAt: number;
}

export interface LocalQuestionDraft {
  id: string;
  user_id: string;
  question_id: string;
  answer_text: string;
  visibility: string;
  mood_state?: string;
  updatedAt: number;
}

export interface CachedPostRecord {
  id: string;
  feed_mode: string;
  post_data: any;
  cached_at: number;
}

export interface CachedQuestionRecord {
  id: string;
  primary_category: string;
  question_data: any;
  cached_at: number;
}

export interface ViewedIdRecord {
  id: string;
  viewed_at: number;
}

export interface RecentSearchRecord {
  query: string;
  timestamp: number;
}

class SoulverseContentDatabase extends Dexie {
  public post_drafts!: Table<LocalPostDraft, string>;
  public question_drafts!: Table<LocalQuestionDraft, string>;
  public cached_posts!: Table<CachedPostRecord, string>;
  public cached_questions!: Table<CachedQuestionRecord, string>;
  public viewed_question_ids!: Table<ViewedIdRecord, string>;
  public viewed_post_ids!: Table<ViewedIdRecord, string>;
  public recent_searches!: Table<RecentSearchRecord, string>;

  constructor() {
    super('soulverse_content_db');

    this.version(1).stores({
      post_drafts: 'id, user_id, post_type, updatedAt',
      question_drafts: 'id, user_id, question_id, updatedAt',
      cached_posts: 'id, feed_mode, cached_at',
      cached_questions: 'id, primary_category, cached_at',
      viewed_question_ids: 'id, viewed_at',
      viewed_post_ids: 'id, viewed_at',
      recent_searches: 'query, timestamp'
    });
  }

  // --- Post Drafts ---
  async savePostDraft(draft: LocalPostDraft): Promise<void> {
    await this.post_drafts.put(draft);
  }

  async getLatestPostDraft(userId: string): Promise<LocalPostDraft | undefined> {
    return this.post_drafts
      .where('user_id')
      .equals(userId)
      .reverse()
      .sortBy('updatedAt')
      .then(items => items[0]);
  }

  async deletePostDraft(draftId: string): Promise<void> {
    await this.post_drafts.delete(draftId);
  }

  // --- Question Drafts ---
  async saveQuestionDraft(draft: LocalQuestionDraft): Promise<void> {
    await this.question_drafts.put(draft);
  }

  async getQuestionDraft(questionId: string, userId: string): Promise<LocalQuestionDraft | undefined> {
    return this.question_drafts
      .where('question_id')
      .equals(questionId)
      .and(item => item.user_id === userId)
      .first();
  }

  async deleteQuestionDraft(draftId: string): Promise<void> {
    await this.question_drafts.delete(draftId);
  }

  // --- Viewed Question Tracking (For True Refresh Repetition Prevention) ---
  async markQuestionViewed(questionId: string): Promise<void> {
    await this.viewed_question_ids.put({ id: questionId, viewed_at: Date.now() });
  }

  async getRecentlyViewedQuestionIds(limit = 100): Promise<string[]> {
    const records = await this.viewed_question_ids
      .orderBy('viewed_at')
      .reverse()
      .limit(limit)
      .toArray();
    return records.map(r => r.id);
  }

  // --- Cached Feeds & Offline Reading ---
  async cachePosts(feedMode: string, posts: any[]): Promise<void> {
    const now = Date.now();
    const records: CachedPostRecord[] = posts.map(p => ({
      id: p.id,
      feed_mode: feedMode,
      post_data: p,
      cached_at: now
    }));
    await this.cached_posts.bulkPut(records);
  }

  async getCachedPosts(feedMode: string, limit = 20): Promise<any[]> {
    const records = await this.cached_posts
      .where('feed_mode')
      .equals(feedMode)
      .reverse()
      .sortBy('cached_at');
    return records.slice(0, limit).map(r => r.post_data);
  }

  // --- Searches ---
  async addRecentSearch(query: string): Promise<void> {
    if (!query.trim()) return;
    await this.recent_searches.put({ query: query.trim(), timestamp: Date.now() });
  }

  async getRecentSearches(limit = 8): Promise<string[]> {
    const records = await this.recent_searches
      .orderBy('timestamp')
      .reverse()
      .limit(limit)
      .toArray();
    return records.map(r => r.query);
  }
}

export const offlineContentDb = new SoulverseContentDatabase();
