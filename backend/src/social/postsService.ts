import { db } from '../db';
import { v4 as uuidv4 } from 'uuid';
import {
  SocialPostItem,
  PostType,
  ContentVisibility,
  SocialCommentItem,
  SocialReactionType,
  SocialReactionSummary,
  SocialBookmarkItem,
  SocialCollectionItem,
  SocialPostDraft,
  FeedQueryParams,
  FeedResponse,
  TargetType
} from './types';

export class PostsService {
  /**
   * Create a new social post across any of the 17 supported post types.
   */
  public static createPost(params: {
    user_id: string;
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
    draft_id_to_clear?: string;
  }): SocialPostItem {
    if (!params.content && (!params.media_urls || params.media_urls.length === 0) && !params.attachment_json) {
      throw new Error('Post must contain content, media, or attachment');
    }

    const postId = `post_${uuidv4().substring(0, 10)}`;
    const now = Date.now();
    const visibility = params.visibility || 'public';
    const mediaUrls = JSON.stringify(params.media_urls || []);
    const attachmentJson = JSON.stringify(params.attachment_json || {});
    const customAudienceIds = JSON.stringify(params.custom_audience_ids || []);

    // 1. Extract hashtags from content (e.g. #philosophy, #growth)
    const hashtagRegex = /#([\w\u0080-\uFFFF_-]+)/g;
    const extractedTags: string[] = [];
    let match;
    while ((match = hashtagRegex.exec(params.content)) !== null) {
      const normalized = `#${match[1].toLowerCase()}`;
      if (!extractedTags.includes(normalized)) {
        extractedTags.push(normalized);
      }
    }
    const tagsJson = JSON.stringify(extractedTags);

    // 2. Extract mentions (e.g. @username)
    const mentionRegex = /@([\w.-]+)/g;
    const mentionedUserIds: string[] = [];
    while ((match = mentionRegex.exec(params.content)) !== null) {
      const uname = match[1];
      const user = db.prepare('SELECT id FROM users WHERE username = ?').get(uname) as any;
      if (user && !mentionedUserIds.includes(user.id)) {
        mentionedUserIds.push(user.id);
      }
    }
    const mentionsJson = JSON.stringify(mentionedUserIds);

    const tx = db.transaction(() => {
      // Insert post
      db.prepare(`
        INSERT INTO social_posts (
          id, user_id, post_type, title, content, summary, media_urls,
          attachment_json, question_id, poll_id, visibility, custom_audience_ids,
          content_warning, location_name, tags, mentions, is_pinned, is_archived,
          comments_disabled, is_deleted, likes_count, comments_count, shares_count,
          bookmarks_count, views_count, created_at, updated_at
        ) VALUES (
          ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, 0, 0, 0, 0, 0, 0, 0, ?, ?
        )
      `).run(
        postId,
        params.user_id,
        params.post_type,
        params.title || null,
        params.content,
        params.summary || null,
        mediaUrls,
        attachmentJson,
        params.question_id || null,
        params.poll_id || null,
        visibility,
        customAudienceIds,
        params.content_warning || null,
        params.location_name || null,
        tagsJson,
        mentionsJson,
        now,
        now
      );

      // Upsert hashtags
      for (const tag of extractedTags) {
        db.prepare(`
          INSERT INTO social_hashtags (tag, normalized_tag, posts_count, questions_count, is_trending, last_used_at)
          VALUES (?, ?, 1, 0, 0, ?)
          ON CONFLICT(tag) DO UPDATE SET
            posts_count = posts_count + 1,
            last_used_at = ?
        `).run(tag, tag.toLowerCase(), now, now);
      }

      // Record mentions
      for (const mId of mentionedUserIds) {
        db.prepare(`
          INSERT INTO social_mentions (id, target_type, target_id, mentioned_user_id, author_id, is_read, created_at)
          VALUES (?, 'post', ?, ?, ?, 0, ?)
        `).run(uuidv4(), postId, mId, params.user_id, now);
      }

      // Clear draft if requested
      if (params.draft_id_to_clear) {
        db.prepare('DELETE FROM social_post_drafts WHERE id = ? AND user_id = ?').run(params.draft_id_to_clear, params.user_id);
      }
    });

    tx();

    return this.getPostById(postId, params.user_id)!;
  }

  /**
   * Edit post with versioned history audit log.
   */
  public static editPost(params: {
    post_id: string;
    user_id: string;
    content: string;
    title?: string;
    media_urls?: string[];
  }): SocialPostItem {
    const post = db.prepare('SELECT * FROM social_posts WHERE id = ?').get(params.post_id) as any;
    if (!post) throw new Error('Post not found');
    if (post.user_id !== params.user_id) throw new Error('Unauthorized to edit this post');

    const now = Date.now();

    const tx = db.transaction(() => {
      // Record previous version in edit history
      db.prepare(`
        INSERT INTO social_post_edits (id, post_id, previous_content, previous_media_urls, edited_at)
        VALUES (?, ?, ?, ?, ?)
      `).run(uuidv4(), post.id, post.content, post.media_urls, now);

      // Update post
      const mediaUrls = params.media_urls ? JSON.stringify(params.media_urls) : post.media_urls;
      db.prepare(`
        UPDATE social_posts
        SET content = ?, title = COALESCE(?, title), media_urls = ?, updated_at = ?
        WHERE id = ?
      `).run(params.content, params.title || null, mediaUrls, now, post.id);
    });

    tx();

    return this.getPostById(params.post_id, params.user_id)!;
  }

  /**
   * Soft delete post.
   */
  public static deletePost(postId: string, userId: string, isAdmin = false): boolean {
    const post = db.prepare('SELECT * FROM social_posts WHERE id = ?').get(postId) as any;
    if (!post) return false;
    if (post.user_id !== userId && !isAdmin) {
      throw new Error('Unauthorized to delete this post');
    }

    db.prepare('UPDATE social_posts SET is_deleted = 1, updated_at = ? WHERE id = ?').run(Date.now(), postId);
    return true;
  }

  /**
   * Get single post with ABAC security authorization.
   */
  public static getPostById(postId: string, viewerId?: string): SocialPostItem | null {
    const row = db.prepare(`
      SELECT p.*, u.name as author_name, u.avatar_url as author_avatar, u.username as author_username
      FROM social_posts p
      JOIN users u ON p.user_id = u.id
      WHERE p.id = ? AND p.is_deleted = 0
    `).get(postId) as any;

    if (!row) return null;

    if (!this.canViewPost(row, viewerId)) {
      return null;
    }

    return this.mapPostRow(row, viewerId);
  }

  /**
   * Social Feed Retrieval with Cursor Pagination & Transparent Recommendation.
   */
  public static getFeed(params: FeedQueryParams, viewerId?: string): FeedResponse {
    const feedMode = params.feed_mode || 'for_you';
    const limit = Math.min(params.limit || 15, 50);

    let baseSql = `
      SELECT p.*, u.name as author_name, u.avatar_url as author_avatar, u.username as author_username
      FROM social_posts p
      JOIN users u ON p.user_id = u.id
      WHERE p.is_deleted = 0 AND p.is_archived = 0
    `;

    const whereClauses: string[] = [];
    const queryParams: any[] = [];

    // Cursor parsing: cursor format is "timestamp_id"
    if (params.cursor) {
      const parts = params.cursor.split('_');
      if (parts.length >= 2) {
        const cursorTime = parseInt(parts[0], 10);
        const cursorId = parts.slice(1).join('_');
        whereClauses.push('(p.created_at < ? OR (p.created_at = ? AND p.id < ?))');
        queryParams.push(cursorTime, cursorTime, cursorId);
      }
    }

    // Feed Mode Filtering
    if (feedMode === 'following' && viewerId) {
      whereClauses.push(`
        p.user_id IN (
          SELECT target_user_id FROM user_relationships
          WHERE user_id = ? AND relationship_type IN ('friend', 'match', 'selected')
        )
      `);
      queryParams.push(viewerId);
    } else if (feedMode === 'friends' && viewerId) {
      whereClauses.push(`
        p.user_id IN (
          SELECT target_user_id FROM user_relationships
          WHERE user_id = ? AND relationship_type IN ('friend', 'selected')
        )
      `);
      queryParams.push(viewerId);
    } else if (feedMode === 'questions') {
      whereClauses.push("p.post_type IN ('question', 'shared_answer')");
    } else if (feedMode === 'saved' && viewerId) {
      whereClauses.push(`
        p.id IN (
          SELECT target_id FROM social_bookmarks
          WHERE user_id = ? AND target_type = 'post'
        )
      `);
      queryParams.push(viewerId);
    }

    if (params.tag) {
      whereClauses.push('p.tags LIKE ?');
      queryParams.push(`%${params.tag.toLowerCase()}%`);
    }

    if (params.search_query && params.search_query.trim()) {
      whereClauses.push('(p.content LIKE ? OR p.title LIKE ? OR p.tags LIKE ?)');
      const s = `%${params.search_query.trim()}%`;
      queryParams.push(s, s, s);
    }

    if (whereClauses.length > 0) {
      baseSql += ` AND ${whereClauses.join(' AND ')}`;
    }

    // Order by strategy
    if (feedMode === 'trending') {
      baseSql += ' ORDER BY (p.likes_count * 2 + p.comments_count * 3 + p.shares_count * 4) DESC, p.created_at DESC';
    } else {
      baseSql += ' ORDER BY p.is_pinned DESC, p.created_at DESC, p.id DESC';
    }

    baseSql += ' LIMIT ?';
    queryParams.push(limit + 1); // fetch 1 extra to determine has_more

    const rows = db.prepare(baseSql).all(...queryParams) as any[];

    // Authorize each row according to ABAC
    const visiblePosts: SocialPostItem[] = [];
    for (const r of rows) {
      if (this.canViewPost(r, viewerId)) {
        visiblePosts.push(this.mapPostRow(r, viewerId));
        if (visiblePosts.length >= limit) break;
      }
    }

    const hasMore = rows.length > limit;
    const lastItem = visiblePosts[visiblePosts.length - 1];
    const nextCursor = lastItem ? `${lastItem.created_at}_${lastItem.id}` : null;

    return {
      items: visiblePosts,
      next_cursor: hasMore ? nextCursor : null,
      has_more: hasMore,
      feed_mode: feedMode
    };
  }

  /**
   * Threaded Comments & Nested Replies.
   */
  public static addComment(params: {
    target_type: TargetType;
    target_id: string;
    user_id: string;
    content: string;
    parent_comment_id?: string;
    media_url?: string;
  }): SocialCommentItem {
    if (!params.content || !params.content.trim()) {
      throw new Error('Comment content cannot be empty');
    }

    let depthLevel = 0;
    if (params.parent_comment_id) {
      const parent = db.prepare('SELECT depth_level FROM social_comments WHERE id = ?').get(params.parent_comment_id) as any;
      if (parent) {
        depthLevel = Math.min(parent.depth_level + 1, 3); // Enforce max depth of 3
      }
    }

    const commentId = `comment_${uuidv4().substring(0, 10)}`;
    const now = Date.now();

    const tx = db.transaction(() => {
      db.prepare(`
        INSERT INTO social_comments (
          id, target_type, target_id, parent_comment_id, user_id, content,
          media_url, depth_level, mentions, is_edited, is_deleted, likes_count,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, '[]', 0, 0, 0, ?, ?)
      `).run(
        commentId,
        params.target_type,
        params.target_id,
        params.parent_comment_id || null,
        params.user_id,
        params.content,
        params.media_url || null,
        depthLevel,
        now,
        now
      );

      // Increment comments count on target post
      if (params.target_type === 'post') {
        db.prepare('UPDATE social_posts SET comments_count = comments_count + 1 WHERE id = ?').run(params.target_id);
      } else if (params.target_type === 'answer') {
        db.prepare('UPDATE question_answers SET comments_count = comments_count + 1 WHERE id = ?').run(params.target_id);
      }
    });

    tx();

    const row = db.prepare(`
      SELECT c.*, u.name as author_name, u.avatar_url as author_avatar, u.username as author_username
      FROM social_comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.id = ?
    `).get(commentId) as any;

    return this.mapCommentRow(row, params.user_id);
  }

  /**
   * Get Comments for a Post or Question, organized in nested parent-reply threads.
   */
  public static getComments(targetType: TargetType, targetId: string, viewerId?: string): SocialCommentItem[] {
    const rows = db.prepare(`
      SELECT c.*, u.name as author_name, u.avatar_url as author_avatar, u.username as author_username
      FROM social_comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.target_type = ? AND c.target_id = ?
      ORDER BY c.created_at ASC
    `).all(targetType, targetId) as any[];

    const commentMap = new Map<string, SocialCommentItem>();
    const topLevelComments: SocialCommentItem[] = [];

    for (const r of rows) {
      const item = this.mapCommentRow(r, viewerId);
      item.replies = [];
      commentMap.set(item.id, item);
    }

    for (const item of commentMap.values()) {
      if (item.parent_comment_id && commentMap.has(item.parent_comment_id)) {
        commentMap.get(item.parent_comment_id)!.replies!.push(item);
      } else {
        topLevelComments.push(item);
      }
    }

    return topLevelComments;
  }

  /**
   * Soft delete comment.
   */
  public static deleteComment(commentId: string, userId: string, isAdmin = false): boolean {
    const comment = db.prepare('SELECT * FROM social_comments WHERE id = ?').get(commentId) as any;
    if (!comment) return false;
    if (comment.user_id !== userId && !isAdmin) {
      throw new Error('Unauthorized to delete this comment');
    }

    db.prepare("UPDATE social_comments SET is_deleted = 1, content = '[Comment deleted by author]' WHERE id = ?").run(commentId);
    if (comment.target_type === 'post') {
      db.prepare('UPDATE social_posts SET comments_count = MAX(0, comments_count - 1) WHERE id = ?').run(comment.target_id);
    }
    return true;
  }

  /**
   * Emotionally-aligned Reactions: like, love, laugh, thoughtful, support, celebrate.
   */
  public static toggleReaction(params: {
    target_type: TargetType;
    target_id: string;
    user_id: string;
    reaction_type: SocialReactionType;
  }): { current_reaction: SocialReactionType | null; summary: SocialReactionSummary } {
    const existing = db.prepare(`
      SELECT * FROM social_reactions
      WHERE target_type = ? AND target_id = ? AND user_id = ?
    `).get(params.target_type, params.target_id, params.user_id) as any;

    let current_reaction: SocialReactionType | null = null;

    const tx = db.transaction(() => {
      if (existing) {
        if (existing.reaction_type === params.reaction_type) {
          // Untoggle / remove reaction
          db.prepare('DELETE FROM social_reactions WHERE id = ?').run(existing.id);
          this.adjustReactionCount(params.target_type, params.target_id, -1);
          current_reaction = null;
        } else {
          // Change reaction type
          db.prepare('UPDATE social_reactions SET reaction_type = ? WHERE id = ?').run(params.reaction_type, existing.id);
          current_reaction = params.reaction_type;
        }
      } else {
        // New reaction
        db.prepare(`
          INSERT INTO social_reactions (id, target_type, target_id, user_id, reaction_type, created_at)
          VALUES (?, ?, ?, ?, ?, ?)
        `).run(uuidv4(), params.target_type, params.target_id, params.user_id, params.reaction_type, Date.now());
        this.adjustReactionCount(params.target_type, params.target_id, 1);
        current_reaction = params.reaction_type;
      }
    });

    tx();

    const summary = this.getReactionsSummary(params.target_type, params.target_id, params.user_id);
    return { current_reaction, summary };
  }

  /**
   * Helper to adjust reaction counts on parent entities.
   */
  private static adjustReactionCount(targetType: TargetType, targetId: string, delta: number): void {
    if (targetType === 'post') {
      db.prepare('UPDATE social_posts SET likes_count = MAX(0, likes_count + ?) WHERE id = ?').run(delta, targetId);
    } else if (targetType === 'comment') {
      db.prepare('UPDATE social_comments SET likes_count = MAX(0, likes_count + ?) WHERE id = ?').run(delta, targetId);
    } else if (targetType === 'answer') {
      db.prepare('UPDATE question_answers SET likes_count = MAX(0, likes_count + ?) WHERE id = ?').run(delta, targetId);
    }
  }

  /**
   * Get reactions summary breakdown.
   */
  public static getReactionsSummary(targetType: TargetType, targetId: string, viewerId?: string): SocialReactionSummary {
    const rows = db.prepare(`
      SELECT reaction_type, COUNT(*) as count
      FROM social_reactions
      WHERE target_type = ? AND target_id = ?
      GROUP BY reaction_type
    `).all(targetType, targetId) as any[];

    const breakdown: Record<SocialReactionType, number> = {
      like: 0,
      love: 0,
      laugh: 0,
      thoughtful: 0,
      support: 0,
      celebrate: 0
    };

    let total = 0;
    for (const r of rows) {
      if (r.reaction_type in breakdown) {
        breakdown[r.reaction_type as SocialReactionType] = r.count;
        total += r.count;
      }
    }

    let user_reaction: SocialReactionType | null = null;
    if (viewerId) {
      const userRow = db.prepare(`
        SELECT reaction_type FROM social_reactions
        WHERE target_type = ? AND target_id = ? AND user_id = ?
      `).get(targetType, targetId, viewerId) as any;
      if (userRow) {
        user_reaction = userRow.reaction_type as SocialReactionType;
      }
    }

    return { total, breakdown, user_reaction };
  }

  /**
   * Bookmarks & Collections.
   */
  public static toggleBookmark(params: {
    user_id: string;
    target_type: TargetType;
    target_id: string;
    collection_id?: string;
    note?: string;
  }): { is_bookmarked: boolean } {
    const existing = db.prepare(`
      SELECT * FROM social_bookmarks
      WHERE user_id = ? AND target_type = ? AND target_id = ?
    `).get(params.user_id, params.target_type, params.target_id) as any;

    if (existing) {
      db.prepare('DELETE FROM social_bookmarks WHERE id = ?').run(existing.id);
      if (params.target_type === 'post') {
        db.prepare('UPDATE social_posts SET bookmarks_count = MAX(0, bookmarks_count - 1) WHERE id = ?').run(params.target_id);
      }
      return { is_bookmarked: false };
    } else {
      db.prepare(`
        INSERT INTO social_bookmarks (id, user_id, target_type, target_id, collection_id, note, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(uuidv4(), params.user_id, params.target_type, params.target_id, params.collection_id || null, params.note || null, Date.now());
      if (params.target_type === 'post') {
        db.prepare('UPDATE social_posts SET bookmarks_count = bookmarks_count + 1 WHERE id = ?').run(params.target_id);
      }
      return { is_bookmarked: true };
    }
  }

  /**
   * Collections Management.
   */
  public static createCollection(userId: string, name: string, description?: string, isPrivate = true): SocialCollectionItem {
    const id = `col_${uuidv4().substring(0, 8)}`;
    const now = Date.now();
    db.prepare(`
      INSERT INTO social_collections (id, user_id, name, description, is_private, sort_order, items_count, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, 0, 0, ?, ?)
    `).run(id, userId, name, description || null, isPrivate ? 1 : 0, now, now);

    return db.prepare('SELECT * FROM social_collections WHERE id = ?').get(id) as any;
  }

  public static getCollections(userId: string): SocialCollectionItem[] {
    return db.prepare('SELECT * FROM social_collections WHERE user_id = ? ORDER BY sort_order ASC, created_at DESC').all(userId) as any[];
  }

  /**
   * Drafts Management (Cloud backup matching local Dexie.js).
   */
  public static saveDraft(params: {
    user_id: string;
    draft_id?: string;
    post_type: PostType;
    title?: string;
    content: string;
    media_urls?: string[];
    attachment_json?: any;
    visibility?: ContentVisibility;
    tags?: string[];
  }): SocialPostDraft {
    const draftId = params.draft_id || `draft_${uuidv4().substring(0, 8)}`;
    const now = Date.now();

    db.prepare(`
      INSERT OR REPLACE INTO social_post_drafts (
        id, user_id, post_type, title, content, media_urls, attachment_json, visibility, tags, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, COALESCE((SELECT created_at FROM social_post_drafts WHERE id = ?), ?), ?)
    `).run(
      draftId,
      params.user_id,
      params.post_type,
      params.title || null,
      params.content,
      JSON.stringify(params.media_urls || []),
      JSON.stringify(params.attachment_json || {}),
      params.visibility || 'public',
      JSON.stringify(params.tags || []),
      draftId,
      now,
      now
    );

    return db.prepare('SELECT * FROM social_post_drafts WHERE id = ?').get(draftId) as any;
  }

  public static getDrafts(userId: string): SocialPostDraft[] {
    const rows = db.prepare('SELECT * FROM social_post_drafts WHERE user_id = ? ORDER BY updated_at DESC').all(userId) as any[];
    return rows.map(r => ({
      ...r,
      media_urls: JSON.parse(r.media_urls || '[]'),
      attachment_json: JSON.parse(r.attachment_json || '{}'),
      tags: JSON.parse(r.tags || '[]')
    }));
  }

  public static deleteDraft(draftId: string, userId: string): boolean {
    const res = db.prepare('DELETE FROM social_post_drafts WHERE id = ? AND user_id = ?').run(draftId, userId);
    return res.changes > 0;
  }

  /**
   * Global Search over posts, questions, hashtags, and users.
   */
  public static search(query: string, viewerId?: string): {
    posts: SocialPostItem[];
    hashtags: any[];
    users: any[];
  } {
    if (!query || !query.trim()) {
      return { posts: [], hashtags: [], users: [] };
    }

    const s = `%${query.trim()}%`;

    const postRows = db.prepare(`
      SELECT p.*, u.name as author_name, u.avatar_url as author_avatar, u.username as author_username
      FROM social_posts p
      JOIN users u ON p.user_id = u.id
      WHERE p.is_deleted = 0 AND (p.content LIKE ? OR p.title LIKE ? OR p.tags LIKE ?)
      ORDER BY p.created_at DESC
      LIMIT 15
    `).all(s, s, s) as any[];

    const posts = postRows.filter(r => this.canViewPost(r, viewerId)).map(r => this.mapPostRow(r, viewerId));

    const hashtags = db.prepare(`
      SELECT * FROM social_hashtags
      WHERE tag LIKE ? OR normalized_tag LIKE ?
      ORDER BY posts_count DESC
      LIMIT 10
    `).all(s, s) as any[];

    const users = db.prepare(`
      SELECT id, name, username, avatar_url FROM users
      WHERE name LIKE ? OR username LIKE ?
      LIMIT 10
    `).all(s, s) as any[];

    return { posts, hashtags, users };
  }

  /**
   * Content Moderation Reporting.
   */
  public static reportContent(params: {
    reporter_id: string;
    target_type: 'post' | 'comment' | 'question' | 'answer' | 'user';
    target_id: string;
    reason: 'harassment' | 'hate_speech' | 'spam' | 'nudity' | 'violence' | 'misinformation' | 'other';
    details?: string;
  }): string {
    const reportId = `rep_${uuidv4().substring(0, 10)}`;
    db.prepare(`
      INSERT INTO content_moderation_reports (id, reporter_id, target_type, target_id, reason, details, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, 'pending', ?)
    `).run(reportId, params.reporter_id, params.target_type, params.target_id, params.reason, params.details || null, Date.now());

    return reportId;
  }

  /**
   * ABAC Permission Verification for Social Posts.
   */
  private static canViewPost(row: any, viewerId?: string): boolean {
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
   * Helper to map post row into typed item.
   */
  private static mapPostRow(row: any, viewerId?: string): SocialPostItem {
    let isLiked = false;
    let userReaction: SocialReactionType | null = null;
    let isBookmarked = false;

    if (viewerId) {
      const r = db.prepare("SELECT reaction_type FROM social_reactions WHERE target_type = 'post' AND target_id = ? AND user_id = ?").get(row.id, viewerId) as any;
      if (r) {
        isLiked = true;
        userReaction = r.reaction_type as SocialReactionType;
      }

      const b = db.prepare("SELECT 1 FROM social_bookmarks WHERE target_type = 'post' AND target_id = ? AND user_id = ?").get(row.id, viewerId);
      isBookmarked = !!b;
    }

    return {
      id: row.id,
      user_id: row.user_id,
      author_name: row.author_name,
      author_avatar: row.author_avatar,
      author_username: row.author_username,
      post_type: row.post_type as PostType,
      title: row.title || undefined,
      content: row.content,
      summary: row.summary || undefined,
      media_urls: JSON.parse(row.media_urls || '[]'),
      attachment_json: JSON.parse(row.attachment_json || '{}'),
      question_id: row.question_id || undefined,
      poll_id: row.poll_id || undefined,
      visibility: row.visibility as ContentVisibility,
      custom_audience_ids: JSON.parse(row.custom_audience_ids || '[]'),
      content_warning: row.content_warning || undefined,
      location_name: row.location_name || undefined,
      tags: JSON.parse(row.tags || '[]'),
      mentions: JSON.parse(row.mentions || '[]'),
      is_pinned: Boolean(row.is_pinned),
      is_archived: Boolean(row.is_archived),
      comments_disabled: Boolean(row.comments_disabled),
      is_deleted: Boolean(row.is_deleted),
      likes_count: row.likes_count || 0,
      comments_count: row.comments_count || 0,
      shares_count: row.shares_count || 0,
      bookmarks_count: row.bookmarks_count || 0,
      views_count: row.views_count || 0,
      created_at: row.created_at,
      updated_at: row.updated_at,
      is_liked: isLiked,
      user_reaction: userReaction,
      is_bookmarked: isBookmarked,
      is_author: viewerId ? row.user_id === viewerId : false
    };
  }

  /**
   * Helper to map comment row.
   */
  private static mapCommentRow(row: any, viewerId?: string): SocialCommentItem {
    let isLiked = false;
    if (viewerId) {
      const r = db.prepare("SELECT 1 FROM social_reactions WHERE target_type = 'comment' AND target_id = ? AND user_id = ?").get(row.id, viewerId);
      isLiked = !!r;
    }

    return {
      id: row.id,
      target_type: row.target_type as TargetType,
      target_id: row.target_id,
      parent_comment_id: row.parent_comment_id || undefined,
      user_id: row.user_id,
      author_name: row.author_name || 'Soul Explorer',
      author_avatar: row.author_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      author_username: row.author_username,
      content: row.content,
      media_url: row.media_url || undefined,
      depth_level: row.depth_level || 0,
      mentions: JSON.parse(row.mentions || '[]'),
      is_edited: Boolean(row.is_edited),
      is_deleted: Boolean(row.is_deleted),
      likes_count: row.likes_count || 0,
      created_at: row.created_at,
      updated_at: row.updated_at,
      is_liked: isLiked
    };
  }
}
