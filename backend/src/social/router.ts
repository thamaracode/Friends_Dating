import { Router, Request, Response } from 'express';
import { QuestionsService } from './questionsService';
import { PostsService } from './postsService';
import { db } from '../db';
import {
  QuestionPrimaryCategory,
  QuestionDepthLevel,
  PostType,
  ContentVisibility,
  TargetType,
  SocialReactionType,
  FeedMode
} from './types';

export const socialRouter = Router();

// Helper to get viewer user ID from headers or query
function getViewerId(req: Request): string {
  return (req.headers['x-user-id'] as string) || (req.query.userId as string) || 'usr_me';
}

// ============================================================================
// 1. QUESTION ECOSYSTEM ENDPOINTS
// ============================================================================

/**
 * GET /api/v1/social/questions
 * Filter questions by category, depth level, tags, search text.
 */
socialRouter.get('/questions', (req: Request, res: Response) => {
  try {
    const viewerId = getViewerId(req);
    const { category, depth_level, search, tag, limit, offset } = req.query;

    const result = QuestionsService.getQuestions({
      category: category as QuestionPrimaryCategory | 'all',
      depth_level: depth_level as QuestionDepthLevel | 'all',
      search: search as string,
      tag: tag as string,
      limit: limit ? parseInt(limit as string, 10) : 20,
      offset: offset ? parseInt(offset as string, 10) : 0,
      viewer_id: viewerId
    });

    res.json({ success: true, ...result });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/v1/social/questions/random
 * True non-repeating refresh engine with exclude_ids support.
 */
socialRouter.get('/questions/random', (req: Request, res: Response) => {
  try {
    const viewerId = getViewerId(req);
    const { category, depth_level, exclude_ids } = req.query;

    let excludeArray: string[] = [];
    if (exclude_ids) {
      if (Array.isArray(exclude_ids)) {
        excludeArray = exclude_ids as string[];
      } else if (typeof exclude_ids === 'string') {
        excludeArray = (exclude_ids as string).split(',').map(s => s.trim()).filter(Boolean);
      }
    }

    const { question, is_cycle_reset } = QuestionsService.refreshQuestion({
      category: category as QuestionPrimaryCategory | 'all',
      depth_level: depth_level as QuestionDepthLevel | 'all',
      exclude_ids: excludeArray,
      viewer_id: viewerId
    });

    res.json({ success: true, question, is_cycle_reset });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/v1/social/questions/daily
 * Deterministic Timezone-aware Daily Question.
 */
socialRouter.get('/questions/daily', (req: Request, res: Response) => {
  try {
    const viewerId = getViewerId(req);
    const dateKey = (req.query.date as string) || new Date().toISOString().split('T')[0];

    const question = QuestionsService.getDailyQuestion(dateKey, viewerId);
    res.json({ success: true, date: dateKey, question });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/v1/social/questions/history
 * Personal history: answered, saved, skipped, or my_answers.
 */
socialRouter.get('/questions/history', (req: Request, res: Response) => {
  try {
    const viewerId = getViewerId(req);
    const filter = (req.query.filter as 'answered' | 'saved' | 'skipped' | 'my_answers') || 'answered';

    const history = QuestionsService.getPersonalHistory(viewerId, filter);
    res.json({ success: true, filter, items: history });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/v1/social/questions/:id
 */
socialRouter.get('/questions/:id', (req: Request, res: Response) => {
  try {
    const viewerId = getViewerId(req);
    const question = QuestionsService.getQuestionById(req.params.id, viewerId);
    if (!question) {
      return res.status(404).json({ success: false, error: 'Question not found' });
    }
    res.json({ success: true, question });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/v1/social/questions
 * Community question submission.
 */
socialRouter.post('/questions', (req: Request, res: Response) => {
  try {
    const viewerId = getViewerId(req);
    const { question_text, primary_category, subcategory, depth_level, context_tip, follow_up_questions, content_tags } = req.body;

    if (!question_text || !primary_category || !subcategory || !depth_level) {
      return res.status(400).json({ success: false, error: 'Missing required question fields' });
    }

    const user = db.prepare('SELECT name FROM users WHERE id = ?').get(viewerId) as any;
    const authorName = user?.name || 'Community Member';

    const question = QuestionsService.submitQuestion({
      question_text,
      primary_category,
      subcategory,
      depth_level,
      context_tip,
      follow_up_questions,
      content_tags,
      author_id: viewerId,
      author_name: authorName,
      is_admin: req.headers['x-admin-id'] ? true : false
    });

    res.status(201).json({ success: true, question });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/v1/social/questions/:id/answers
 * Record private or public answer to question.
 */
socialRouter.post('/questions/:id/answers', (req: Request, res: Response) => {
  try {
    const viewerId = getViewerId(req);
    const { answer_text, answer_type, media_urls, mood_state, visibility, custom_audience_ids, attach_to_profile, publish_as_post } = req.body;

    if (!answer_text || !answer_text.trim()) {
      return res.status(400).json({ success: false, error: 'Answer text is required' });
    }

    const answer = QuestionsService.answerQuestion({
      question_id: req.params.id,
      user_id: viewerId,
      answer_text,
      answer_type,
      media_urls,
      mood_state,
      visibility,
      custom_audience_ids,
      attach_to_profile,
      publish_as_post
    });

    // Optionally publish as social post
    let publishedPost = null;
    if (publish_as_post && visibility !== 'private') {
      const q = QuestionsService.getQuestionById(req.params.id);
      publishedPost = PostsService.createPost({
        user_id: viewerId,
        post_type: 'shared_answer',
        title: q ? `Reflection: ${q.question_text}` : undefined,
        content: answer_text,
        question_id: req.params.id,
        visibility: visibility || 'public',
        media_urls
      });
    }

    res.status(201).json({ success: true, answer, published_post: publishedPost });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/v1/social/questions/:id/answers
 * Get answers for a question with ABAC filtering.
 */
socialRouter.get('/questions/:id/answers', (req: Request, res: Response) => {
  try {
    const viewerId = getViewerId(req);
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;
    const offset = req.query.offset ? parseInt(req.query.offset as string, 10) : 0;

    const answers = QuestionsService.getQuestionAnswers(req.params.id, viewerId, limit, offset);
    res.json({ success: true, answers });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * DELETE /api/v1/social/answers/:id
 */
socialRouter.delete('/answers/:id', (req: Request, res: Response) => {
  try {
    const viewerId = getViewerId(req);
    const success = QuestionsService.deleteAnswer(req.params.id, viewerId);
    res.json({ success });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/v1/social/questions/:id/skip
 */
socialRouter.post('/questions/:id/skip', (req: Request, res: Response) => {
  try {
    const viewerId = getViewerId(req);
    QuestionsService.skipQuestion(req.params.id, viewerId);
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// ============================================================================
// 2. SOCIAL POSTS ENDPOINTS
// ============================================================================

/**
 * POST /api/v1/social/posts
 * Publish a new post across any of the 17 formats.
 */
socialRouter.post('/posts', (req: Request, res: Response) => {
  try {
    const viewerId = getViewerId(req);
    const {
      post_type,
      title,
      content,
      summary,
      media_urls,
      attachment_json,
      question_id,
      poll_id,
      visibility,
      custom_audience_ids,
      content_warning,
      location_name,
      draft_id
    } = req.body;

    if (!post_type) {
      return res.status(400).json({ success: false, error: 'post_type is required' });
    }

    const post = PostsService.createPost({
      user_id: viewerId,
      post_type,
      title,
      content: content || '',
      summary,
      media_urls,
      attachment_json,
      question_id,
      poll_id,
      visibility,
      custom_audience_ids,
      content_warning,
      location_name,
      draft_id_to_clear: draft_id
    });

    res.status(201).json({ success: true, post });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/v1/social/posts
 * Retrieve feeds with cursor pagination and transparent recommendation.
 */
socialRouter.get('/posts', (req: Request, res: Response) => {
  try {
    const viewerId = getViewerId(req);
    const { feed_mode, category, tag, cursor, limit, search } = req.query;

    const result = PostsService.getFeed({
      feed_mode: (feed_mode as FeedMode) || 'for_you',
      category: category as string,
      tag: tag as string,
      cursor: cursor as string,
      limit: limit ? parseInt(limit as string, 10) : 15,
      search_query: search as string
    }, viewerId);

    res.json({ success: true, ...result });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/v1/social/posts/:id
 * Retrieve post with ABAC privacy check.
 */
socialRouter.get('/posts/:id', (req: Request, res: Response) => {
  try {
    const viewerId = getViewerId(req);
    const post = PostsService.getPostById(req.params.id, viewerId);
    if (!post) {
      return res.status(404).json({ success: false, error: 'Post not found or access denied' });
    }
    res.json({ success: true, post });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * PATCH /api/v1/social/posts/:id
 * Edit post with versioned history.
 */
socialRouter.patch('/posts/:id', (req: Request, res: Response) => {
  try {
    const viewerId = getViewerId(req);
    const { content, title, media_urls } = req.body;

    const updated = PostsService.editPost({
      post_id: req.params.id,
      user_id: viewerId,
      content,
      title,
      media_urls
    });

    res.json({ success: true, post: updated });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

/**
 * DELETE /api/v1/social/posts/:id
 * Soft delete post.
 */
socialRouter.delete('/posts/:id', (req: Request, res: Response) => {
  try {
    const viewerId = getViewerId(req);
    const isAdmin = Boolean(req.headers['x-admin-id']);
    const success = PostsService.deletePost(req.params.id, viewerId, isAdmin);
    res.json({ success });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/v1/social/posts/:id/edits
 * View edit audit history.
 */
socialRouter.get('/posts/:id/edits', (req: Request, res: Response) => {
  try {
    const rows = db.prepare('SELECT * FROM social_post_edits WHERE post_id = ? ORDER BY edited_at DESC').all(req.params.id);
    res.json({ success: true, edits: rows });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ============================================================================
// 3. THREADED COMMENTS & REPLIES
// ============================================================================

/**
 * GET /api/v1/social/comments
 * Query comments for a post, question, or answer.
 */
socialRouter.get('/comments', (req: Request, res: Response) => {
  try {
    const viewerId = getViewerId(req);
    const targetType = (req.query.target_type as TargetType) || 'post';
    const targetId = req.query.target_id as string;

    if (!targetId) {
      return res.status(400).json({ success: false, error: 'target_id is required' });
    }

    const comments = PostsService.getComments(targetType, targetId, viewerId);
    res.json({ success: true, comments });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/v1/social/comments
 * Add comment or nested reply.
 */
socialRouter.post('/comments', (req: Request, res: Response) => {
  try {
    const viewerId = getViewerId(req);
    const { target_type, target_id, content, parent_comment_id, media_url } = req.body;

    if (!target_type || !target_id || !content) {
      return res.status(400).json({ success: false, error: 'Missing required comment fields' });
    }

    const comment = PostsService.addComment({
      target_type,
      target_id,
      user_id: viewerId,
      content,
      parent_comment_id,
      media_url
    });

    res.status(201).json({ success: true, comment });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

/**
 * DELETE /api/v1/social/comments/:id
 */
socialRouter.delete('/comments/:id', (req: Request, res: Response) => {
  try {
    const viewerId = getViewerId(req);
    const isAdmin = Boolean(req.headers['x-admin-id']);
    const success = PostsService.deleteComment(req.params.id, viewerId, isAdmin);
    res.json({ success });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// ============================================================================
// 4. EMOTIONAL REACTIONS
// ============================================================================

/**
 * POST /api/v1/social/reactions
 * Toggle or change reaction on post, comment, question, or answer.
 */
socialRouter.post('/reactions', (req: Request, res: Response) => {
  try {
    const viewerId = getViewerId(req);
    const { target_type, target_id, reaction_type } = req.body;

    if (!target_type || !target_id || !reaction_type) {
      return res.status(400).json({ success: false, error: 'target_type, target_id, and reaction_type are required' });
    }

    const result = PostsService.toggleReaction({
      target_type,
      target_id,
      user_id: viewerId,
      reaction_type: reaction_type as SocialReactionType
    });

    res.json({ success: true, ...result });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/v1/social/reactions
 * Get reaction summary breakdown for a target.
 */
socialRouter.get('/reactions', (req: Request, res: Response) => {
  try {
    const viewerId = getViewerId(req);
    const { target_type, target_id } = req.query;

    if (!target_type || !target_id) {
      return res.status(400).json({ success: false, error: 'target_type and target_id are required' });
    }

    const summary = PostsService.getReactionsSummary(target_type as TargetType, target_id as string, viewerId);
    res.json({ success: true, summary });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ============================================================================
// 5. BOOKMARKS & COLLECTIONS
// ============================================================================

/**
 * POST /api/v1/social/bookmarks
 * Toggle bookmark on post, question, or answer.
 */
socialRouter.post('/bookmarks', (req: Request, res: Response) => {
  try {
    const viewerId = getViewerId(req);
    const { target_type, target_id, collection_id, note } = req.body;

    if (!target_type || !target_id) {
      return res.status(400).json({ success: false, error: 'target_type and target_id are required' });
    }

    const result = PostsService.toggleBookmark({
      user_id: viewerId,
      target_type,
      target_id,
      collection_id,
      note
    });

    res.json({ success: true, ...result });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/v1/social/collections
 */
socialRouter.get('/collections', (req: Request, res: Response) => {
  try {
    const viewerId = getViewerId(req);
    const collections = PostsService.getCollections(viewerId);
    res.json({ success: true, collections });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/v1/social/collections
 */
socialRouter.post('/collections', (req: Request, res: Response) => {
  try {
    const viewerId = getViewerId(req);
    const { name, description, is_private } = req.body;

    if (!name) return res.status(400).json({ success: false, error: 'Collection name is required' });

    const collection = PostsService.createCollection(viewerId, name, description, is_private !== false);
    res.status(201).json({ success: true, collection });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// ============================================================================
// 6. DRAFTS MANAGEMENT
// ============================================================================

/**
 * POST /api/v1/social/drafts
 */
socialRouter.post('/drafts', (req: Request, res: Response) => {
  try {
    const viewerId = getViewerId(req);
    const draft = PostsService.saveDraft({
      user_id: viewerId,
      ...req.body
    });
    res.status(201).json({ success: true, draft });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/v1/social/drafts
 */
socialRouter.get('/drafts', (req: Request, res: Response) => {
  try {
    const viewerId = getViewerId(req);
    const drafts = PostsService.getDrafts(viewerId);
    res.json({ success: true, drafts });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * DELETE /api/v1/social/drafts/:id
 */
socialRouter.delete('/drafts/:id', (req: Request, res: Response) => {
  try {
    const viewerId = getViewerId(req);
    const success = PostsService.deleteDraft(req.params.id, viewerId);
    res.json({ success });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// ============================================================================
// 7. HASHTAGS & SEARCH
// ============================================================================

/**
 * GET /api/v1/social/hashtags/trending
 */
socialRouter.get('/hashtags/trending', (_req: Request, res: Response) => {
  try {
    const tags = db.prepare('SELECT * FROM social_hashtags ORDER BY posts_count DESC, last_used_at DESC LIMIT 15').all();
    res.json({ success: true, hashtags: tags });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/v1/social/search
 */
socialRouter.get('/search', (req: Request, res: Response) => {
  try {
    const viewerId = getViewerId(req);
    const query = (req.query.q as string) || '';
    const result = PostsService.search(query, viewerId);
    res.json({ success: true, ...result });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ============================================================================
// 8. CONTENT MODERATION & REPORTING
// ============================================================================

/**
 * POST /api/v1/social/reports
 */
socialRouter.post('/reports', (req: Request, res: Response) => {
  try {
    const viewerId = getViewerId(req);
    const { target_type, target_id, reason, details } = req.body;

    if (!target_type || !target_id || !reason) {
      return res.status(400).json({ success: false, error: 'target_type, target_id, and reason are required' });
    }

    const reportId = PostsService.reportContent({
      reporter_id: viewerId,
      target_type,
      target_id,
      reason,
      details
    });

    res.status(201).json({ success: true, report_id: reportId });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/v1/social/admin/moderation-queue
 */
socialRouter.get('/admin/moderation-queue', (req: Request, res: Response) => {
  try {
    const status = (req.query.status as string) || 'pending';
    const reports = db.prepare(`
      SELECT r.*, u.name as reporter_name
      FROM content_moderation_reports r
      LEFT JOIN users u ON r.reporter_id = u.id
      WHERE r.status = ?
      ORDER BY r.created_at DESC
      LIMIT 50
    `).all(status);

    res.json({ success: true, reports });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * PATCH /api/v1/social/admin/moderation-queue/:id
 */
socialRouter.patch('/admin/moderation-queue/:id', (req: Request, res: Response) => {
  try {
    const adminId = (req.headers['x-admin-id'] as string) || 'admin_root';
    const { status, admin_notes, action_taken } = req.body;

    db.prepare(`
      UPDATE content_moderation_reports
      SET status = ?, reviewed_by_admin_id = ?, admin_notes = ?, resolved_at = ?
      WHERE id = ?
    `).run(status || 'resolved_action_taken', adminId, admin_notes || null, Date.now(), req.params.id);

    // If action_taken is delete, handle target deletion
    if (action_taken === 'delete_post') {
      const rep = db.prepare('SELECT target_id FROM content_moderation_reports WHERE id = ?').get(req.params.id) as any;
      if (rep) {
        db.prepare('UPDATE social_posts SET is_deleted = 1 WHERE id = ?').run(rep.target_id);
      }
    }

    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});
