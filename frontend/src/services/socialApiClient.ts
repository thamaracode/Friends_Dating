import { API_BASE_V1 } from './apiConfig';
import { offlineContentDb } from './offlineContentDb';
import {
  QuestionEcosystemItem,
  QuestionPrimaryCategory,
  QuestionDepthLevel,
  QuestionAnswerItem,
  QuestionAnswerType,
  SocialPostItem,
  PostType,
  ContentVisibility,
  SocialCommentItem,
  SocialReactionType,
  SocialReactionSummary,
  SocialCollectionItem,
  FeedMode,
  FeedResponse
} from '../types/social';

class SocialApiClient {
  private base = `${API_BASE_V1}/social`;

  private getHeaders(userId = 'usr_me'): HeadersInit {
    return {
      'Content-Type': 'application/json',
      'x-user-id': userId
    };
  }

  // =========================================================================
  // QUESTIONS ECOSYSTEM
  // =========================================================================

  async getQuestions(params: {
    category?: QuestionPrimaryCategory | 'all';
    depth_level?: QuestionDepthLevel | 'all';
    search?: string;
    tag?: string;
    limit?: number;
    offset?: number;
  }, userId = 'usr_me'): Promise<{ items: QuestionEcosystemItem[]; total: number }> {
    const q = new URLSearchParams();
    if (params.category && params.category !== 'all') q.set('category', params.category);
    if (params.depth_level && params.depth_level !== 'all') q.set('depth_level', params.depth_level);
    if (params.search) q.set('search', params.search);
    if (params.tag) q.set('tag', params.tag);
    if (params.limit) q.set('limit', String(params.limit));
    if (params.offset) q.set('offset', String(params.offset));

    const res = await fetch(`${this.base}/questions?${q.toString()}`, {
      headers: this.getHeaders(userId)
    });
    if (!res.ok) throw new Error('Failed to load questions');
    const data = await res.json();
    return { items: data.items || [], total: data.total || 0 };
  }

  /**
   * True Non-Repeating Question Refresh
   */
  async refreshQuestion(params: {
    category?: QuestionPrimaryCategory | 'all';
    depth_level?: QuestionDepthLevel | 'all';
  }, userId = 'usr_me'): Promise<{ question: QuestionEcosystemItem | null; is_cycle_reset: boolean }> {
    // 1. Retrieve recently viewed IDs from local IndexedDB
    const excludeIds = await offlineContentDb.getRecentlyViewedQuestionIds(100);

    const q = new URLSearchParams();
    if (params.category && params.category !== 'all') q.set('category', params.category);
    if (params.depth_level && params.depth_level !== 'all') q.set('depth_level', params.depth_level);
    if (excludeIds.length > 0) q.set('exclude_ids', excludeIds.join(','));

    const res = await fetch(`${this.base}/questions/random?${q.toString()}`, {
      headers: this.getHeaders(userId)
    });
    if (!res.ok) throw new Error('Failed to refresh question');
    const data = await res.json();

    if (data.question) {
      // 2. Cache in local IndexedDB as viewed
      await offlineContentDb.markQuestionViewed(data.question.id);
    }

    return { question: data.question || null, is_cycle_reset: Boolean(data.is_cycle_reset) };
  }

  async getDailyQuestion(date?: string, userId = 'usr_me'): Promise<QuestionEcosystemItem> {
    const q = date ? `?date=${encodeURIComponent(date)}` : '';
    const res = await fetch(`${this.base}/questions/daily${q}`, {
      headers: this.getHeaders(userId)
    });
    if (!res.ok) throw new Error('Failed to load daily question');
    const data = await res.json();
    return data.question;
  }

  async getQuestionById(id: string, userId = 'usr_me'): Promise<QuestionEcosystemItem> {
    const res = await fetch(`${this.base}/questions/${id}`, {
      headers: this.getHeaders(userId)
    });
    if (!res.ok) throw new Error('Question not found');
    const data = await res.json();
    return data.question;
  }

  async answerQuestion(params: {
    question_id: string;
    answer_text: string;
    answer_type?: QuestionAnswerType;
    media_urls?: string[];
    mood_state?: string;
    visibility?: ContentVisibility;
    custom_audience_ids?: string[];
    attach_to_profile?: boolean;
    publish_as_post?: boolean;
  }, userId = 'usr_me'): Promise<{ answer: QuestionAnswerItem; published_post?: SocialPostItem }> {
    const res = await fetch(`${this.base}/questions/${params.question_id}/answers`, {
      method: 'POST',
      headers: this.getHeaders(userId),
      body: JSON.stringify(params)
    });
    if (!res.ok) throw new Error('Failed to record answer');
    const data = await res.json();
    return data;
  }

  async getQuestionAnswers(questionId: string, limit = 20, offset = 0, userId = 'usr_me'): Promise<QuestionAnswerItem[]> {
    const res = await fetch(`${this.base}/questions/${questionId}/answers?limit=${limit}&offset=${offset}`, {
      headers: this.getHeaders(userId)
    });
    if (!res.ok) throw new Error('Failed to load answers');
    const data = await res.json();
    return data.answers || [];
  }

  async skipQuestion(questionId: string, userId = 'usr_me'): Promise<void> {
    await fetch(`${this.base}/questions/${questionId}/skip`, {
      method: 'POST',
      headers: this.getHeaders(userId)
    });
    await offlineContentDb.markQuestionViewed(questionId);
  }

  async getQuestionHistory(filter: 'answered' | 'saved' | 'skipped' | 'my_answers', userId = 'usr_me'): Promise<any[]> {
    const res = await fetch(`${this.base}/questions/history?filter=${filter}`, {
      headers: this.getHeaders(userId)
    });
    if (!res.ok) throw new Error('Failed to load history');
    const data = await res.json();
    return data.items || [];
  }

  // =========================================================================
  // SOCIAL POSTS & FEED
  // =========================================================================

  async createPost(params: {
    post_type: PostType;
    title?: string;
    content: string;
    summary?: string;
    media_urls?: string[];
    attachment_json?: any;
    question_id?: string;
    poll_id?: string;
    visibility?: ContentVisibility;
    custom_audience_ids?: string[];
    content_warning?: string;
    location_name?: string;
    draft_id?: string;
  }, userId = 'usr_me'): Promise<SocialPostItem> {
    const res = await fetch(`${this.base}/posts`, {
      method: 'POST',
      headers: this.getHeaders(userId),
      body: JSON.stringify(params)
    });
    if (!res.ok) throw new Error('Failed to create post');
    const data = await res.json();

    // If draft was cleared, delete from local Dexie too
    if (params.draft_id) {
      await offlineContentDb.deletePostDraft(params.draft_id).catch(() => {});
    }

    return data.post;
  }

  async getFeed(params: {
    feed_mode?: FeedMode;
    category?: string;
    tag?: string;
    cursor?: string | null;
    limit?: number;
    search?: string;
  }, userId = 'usr_me'): Promise<FeedResponse> {
    const q = new URLSearchParams();
    if (params.feed_mode) q.set('feed_mode', params.feed_mode);
    if (params.category) q.set('category', params.category);
    if (params.tag) q.set('tag', params.tag);
    if (params.cursor) q.set('cursor', params.cursor);
    if (params.limit) q.set('limit', String(params.limit));
    if (params.search) q.set('search', params.search);

    try {
      const res = await fetch(`${this.base}/posts?${q.toString()}`, {
        headers: this.getHeaders(userId)
      });
      if (!res.ok) throw new Error('Failed to load feed');
      const data: FeedResponse = await res.json();

      // Cache fresh posts locally in Dexie for offline reading
      if (data.items && data.items.length > 0) {
        offlineContentDb.cachePosts(params.feed_mode || 'for_you', data.items).catch(() => {});
      }

      return data;
    } catch (e) {
      // Fallback to local offline cache
      const cached = await offlineContentDb.getCachedPosts(params.feed_mode || 'for_you', params.limit || 15);
      return {
        items: cached,
        next_cursor: null,
        has_more: false,
        feed_mode: params.feed_mode || 'for_you'
      };
    }
  }

  async getPostById(id: string, userId = 'usr_me'): Promise<SocialPostItem> {
    const res = await fetch(`${this.base}/posts/${id}`, {
      headers: this.getHeaders(userId)
    });
    if (!res.ok) throw new Error('Failed to load post');
    const data = await res.json();
    return data.post;
  }

  async deletePost(id: string, userId = 'usr_me'): Promise<void> {
    const res = await fetch(`${this.base}/posts/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(userId)
    });
    if (!res.ok) throw new Error('Failed to delete post');
  }

  // =========================================================================
  // THREADED COMMENTS & REPLIES
  // =========================================================================

  async getComments(targetType: 'post' | 'question' | 'answer', targetId: string, userId = 'usr_me'): Promise<SocialCommentItem[]> {
    const res = await fetch(`${this.base}/comments?target_type=${targetType}&target_id=${targetId}`, {
      headers: this.getHeaders(userId)
    });
    if (!res.ok) throw new Error('Failed to load comments');
    const data = await res.json();
    return data.comments || [];
  }

  async addComment(params: {
    target_type: 'post' | 'question' | 'answer';
    target_id: string;
    content: string;
    parent_comment_id?: string;
    media_url?: string;
  }, userId = 'usr_me'): Promise<SocialCommentItem> {
    const res = await fetch(`${this.base}/comments`, {
      method: 'POST',
      headers: this.getHeaders(userId),
      body: JSON.stringify(params)
    });
    if (!res.ok) throw new Error('Failed to add comment');
    const data = await res.json();
    return data.comment;
  }

  async deleteComment(id: string, userId = 'usr_me'): Promise<void> {
    await fetch(`${this.base}/comments/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(userId)
    });
  }

  // =========================================================================
  // EMOTIONAL REACTIONS
  // =========================================================================

  async toggleReaction(params: {
    target_type: 'post' | 'comment' | 'question' | 'answer';
    target_id: string;
    reaction_type: SocialReactionType;
  }, userId = 'usr_me'): Promise<{ current_reaction: SocialReactionType | null; summary: SocialReactionSummary }> {
    const res = await fetch(`${this.base}/reactions`, {
      method: 'POST',
      headers: this.getHeaders(userId),
      body: JSON.stringify(params)
    });
    if (!res.ok) throw new Error('Failed to toggle reaction');
    return res.json();
  }

  // =========================================================================
  // BOOKMARKS & COLLECTIONS
  // =========================================================================

  async toggleBookmark(params: {
    target_type: 'post' | 'question' | 'answer';
    target_id: string;
    collection_id?: string;
    note?: string;
  }, userId = 'usr_me'): Promise<{ is_bookmarked: boolean }> {
    const res = await fetch(`${this.base}/bookmarks`, {
      method: 'POST',
      headers: this.getHeaders(userId),
      body: JSON.stringify(params)
    });
    if (!res.ok) throw new Error('Failed to toggle bookmark');
    return res.json();
  }

  async getCollections(userId = 'usr_me'): Promise<SocialCollectionItem[]> {
    const res = await fetch(`${this.base}/collections`, {
      headers: this.getHeaders(userId)
    });
    if (!res.ok) throw new Error('Failed to load collections');
    const data = await res.json();
    return data.collections || [];
  }

  async createCollection(name: string, description?: string, isPrivate = true, userId = 'usr_me'): Promise<SocialCollectionItem> {
    const res = await fetch(`${this.base}/collections`, {
      method: 'POST',
      headers: this.getHeaders(userId),
      body: JSON.stringify({ name, description, is_private: isPrivate })
    });
    if (!res.ok) throw new Error('Failed to create collection');
    const data = await res.json();
    return data.collection;
  }

  // =========================================================================
  // MODERATION & REPORTS
  // =========================================================================

  async reportContent(params: {
    target_type: 'post' | 'comment' | 'question' | 'answer' | 'user';
    target_id: string;
    reason: string;
    details?: string;
  }, userId = 'usr_me'): Promise<string> {
    const res = await fetch(`${this.base}/reports`, {
      method: 'POST',
      headers: this.getHeaders(userId),
      body: JSON.stringify(params)
    });
    if (!res.ok) throw new Error('Failed to submit report');
    const data = await res.json();
    return data.report_id;
  }
}

export const socialApiClient = new SocialApiClient();
