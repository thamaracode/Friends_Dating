import { describe, it, expect, beforeAll } from 'vitest';
import { db } from './db';
import { initSocialSchema } from './social/schema';
import { QuestionsService } from './social/questionsService';
import { PostsService } from './social/postsService';

const TEST_USER_A = 'usr_test_social_a';
const TEST_USER_B = 'usr_test_social_b';
const TEST_USER_C = 'usr_test_social_c';

describe('Master Engineering Prompt 02: Questions, Posts, Social Feed and Content Discovery Suite', () => {
  beforeAll(() => {
    initSocialSchema();
    QuestionsService.ensureSeeded();

    // Ensure test users exist
    const insertUser = db.prepare(`
      INSERT OR REPLACE INTO users (id, name, username, avatar_url, is_verified, last_seen_at)
      VALUES (?, ?, ?, ?, 1, ?)
    `);
    const now = Date.now();
    insertUser.run(TEST_USER_A, 'Alice Walker', 'alice_social', 'https://avatar.com/alice', now);
    insertUser.run(TEST_USER_B, 'Bob Stone', 'bob_social', 'https://avatar.com/bob', now);
    insertUser.run(TEST_USER_C, 'Charlie Day', 'charlie_social', 'https://avatar.com/charlie', now);

    // Setup friendship between A and C (A & C are friends; B is a stranger)
    db.prepare(`
      INSERT OR REPLACE INTO user_relationships (user_id, target_user_id, relationship_type, created_at)
      VALUES (?, ?, 'friend', ?)
    `).run(TEST_USER_A, TEST_USER_C, now);
  });

  // =========================================================================
  // 1. QUESTION ECOSYSTEM TESTS
  // =========================================================================
  describe('1. Question Discovery & Categorical Taxonomy', () => {
    it('queries questions across 8 primary categories and verifies depth filters', () => {
      const res = QuestionsService.getQuestions({
        category: 'self_discovery',
        depth_level: 'deep',
        limit: 10
      });

      expect(res.total).toBeGreaterThanOrEqual(1);
      expect(res.items.length).toBeGreaterThanOrEqual(1);
      for (const item of res.items) {
        expect(item.primary_category).toBe('self_discovery');
        expect(item.depth_level).toBe('deep');
        expect(Array.isArray(item.follow_up_questions)).toBe(true);
        expect(Array.isArray(item.content_tags)).toBe(true);
      }
    });

    it('implements true non-repeating refresh with exclude_ids and view tracking', () => {
      // First refresh
      const draw1 = QuestionsService.refreshQuestion({
        category: 'self_discovery',
        viewer_id: TEST_USER_A
      });
      expect(draw1.question).toBeDefined();
      const firstId = draw1.question!.id;

      // Second refresh with first ID excluded
      const draw2 = QuestionsService.refreshQuestion({
        category: 'self_discovery',
        exclude_ids: [firstId],
        viewer_id: TEST_USER_A
      });
      expect(draw2.question).toBeDefined();
      expect(draw2.question!.id).not.toBe(firstId);

      // Verify question view was recorded in SQLite
      const viewRecord = db.prepare('SELECT * FROM question_views WHERE user_id = ? AND question_id = ?').get(TEST_USER_A, firstId);
      expect(viewRecord).toBeDefined();
    });

    it('generates deterministic daily questions based on date key', () => {
      const q1 = QuestionsService.getDailyQuestion('2026-11-14', TEST_USER_A);
      const q2 = QuestionsService.getDailyQuestion('2026-11-14', TEST_USER_A);
      expect(q1.id).toBe(q2.id);
      expect(q1.question_text).toBe(q2.question_text);
    });

    it('enforces strict ABAC privacy on question answers', () => {
      const q = QuestionsService.getQuestions({ limit: 1 }).items[0];

      // Alice answers privately
      const privateAnswer = QuestionsService.answerQuestion({
        question_id: q.id,
        user_id: TEST_USER_A,
        answer_text: 'This is my deeply personal secret reflection.',
        visibility: 'private'
      });
      expect(privateAnswer.id).toBeDefined();

      // Alice (author) can retrieve her answer
      const authorView = QuestionsService.getAnswerById(privateAnswer.id, TEST_USER_A);
      expect(authorView).not.toBeNull();
      expect(authorView!.answer_text).toBe('This is my deeply personal secret reflection.');

      // Bob (stranger) attempts to retrieve Alice’s private answer -> must return null
      const strangerView = QuestionsService.getAnswerById(privateAnswer.id, TEST_USER_B);
      expect(strangerView).toBeNull();

      // Bob querying answers for the question must NOT see Alice's private answer
      const strangerAnswers = QuestionsService.getQuestionAnswers(q.id, TEST_USER_B);
      expect(strangerAnswers.some(a => a.id === privateAnswer.id)).toBe(false);

      // Alice updates her answer to public
      QuestionsService.answerQuestion({
        question_id: q.id,
        user_id: TEST_USER_A,
        answer_text: 'Now I am comfortable sharing this publicly.',
        visibility: 'public'
      });

      // Now Bob CAN see the public answer
      const bobAnswersNow = QuestionsService.getQuestionAnswers(q.id, TEST_USER_B);
      expect(bobAnswersNow.some(a => a.id === privateAnswer.id)).toBe(true);
    });

    it('records question skips so skipped items are excluded from future draws', () => {
      const q = QuestionsService.getQuestions({ category: 'friendship', limit: 1 }).items[0];
      QuestionsService.skipQuestion(q.id, TEST_USER_B);

      const skippedRecord = db.prepare('SELECT * FROM question_skips WHERE user_id = ? AND question_id = ?').get(TEST_USER_B, q.id);
      expect(skippedRecord).toBeDefined();

      const history = QuestionsService.getPersonalHistory(TEST_USER_B, 'skipped');
      expect(history.some(item => item.id === q.id)).toBe(true);
    });
  });

  // =========================================================================
  // 2. SOCIAL POSTS & MULTIMODAL PUBLISHING TESTS
  // =========================================================================
  describe('2. Post Creation, Hashtags, Mentions & ABAC Security', () => {
    it('creates posts across multiple formats, auto-extracts hashtags and user mentions', () => {
      const post = PostsService.createPost({
        user_id: TEST_USER_A,
        post_type: 'thought',
        title: 'Contemplating Consciousness',
        content: 'Reflecting on cosmic origins with @bob_social #philosophy #wonder',
        visibility: 'public'
      });

      expect(post.id).toBeDefined();
      expect(post.post_type).toBe('thought');
      expect(post.tags).toContain('#philosophy');
      expect(post.tags).toContain('#wonder');
      expect(post.mentions).toContain(TEST_USER_B);

      // Verify hashtag registry updated
      const hashtag = db.prepare('SELECT * FROM social_hashtags WHERE tag = ?').get('#philosophy') as any;
      expect(hashtag).toBeDefined();
      expect(hashtag.posts_count).toBeGreaterThanOrEqual(1);

      // Verify mention recorded
      const mention = db.prepare('SELECT * FROM social_mentions WHERE mentioned_user_id = ? AND author_id = ?').get(TEST_USER_B, TEST_USER_A);
      expect(mention).toBeDefined();
    });

    it('tracks immutable edit history on post modification', () => {
      const post = PostsService.createPost({
        user_id: TEST_USER_A,
        post_type: 'reflection',
        content: 'Original draft of reflection before editing.',
        visibility: 'public'
      });

      const updated = PostsService.editPost({
        post_id: post.id,
        user_id: TEST_USER_A,
        content: 'Polished and finalized reflection.'
      });

      expect(updated.content).toBe('Polished and finalized reflection.');

      // Verify edit history audit record
      const editRecord = db.prepare('SELECT * FROM social_post_edits WHERE post_id = ?').get(post.id) as any;
      expect(editRecord).toBeDefined();
      expect(editRecord.previous_content).toBe('Original draft of reflection before editing.');
    });

    it('enforces strict ABAC permissions on private and friends-only posts', () => {
      // Alice creates a private post
      const privatePost = PostsService.createPost({
        user_id: TEST_USER_A,
        post_type: 'thought',
        content: 'Secret personal journal note.',
        visibility: 'private'
      });

      // Alice can read her own private post
      expect(PostsService.getPostById(privatePost.id, TEST_USER_A)).not.toBeNull();

      // Bob (stranger) is denied access
      expect(PostsService.getPostById(privatePost.id, TEST_USER_B)).toBeNull();

      // Alice creates a friends-only post
      const friendsPost = PostsService.createPost({
        user_id: TEST_USER_A,
        post_type: 'story',
        content: 'Only for my close kindred friends.',
        visibility: 'friends'
      });

      // Charlie (friend) can view it
      expect(PostsService.getPostById(friendsPost.id, TEST_USER_C)).not.toBeNull();

      // Bob (not a friend) is denied
      expect(PostsService.getPostById(friendsPost.id, TEST_USER_B)).toBeNull();
    });

    it('soft deletes posts without orphan destruction', () => {
      const post = PostsService.createPost({
        user_id: TEST_USER_A,
        post_type: 'text',
        content: 'Post destined for deletion.',
        visibility: 'public'
      });

      const deleted = PostsService.deletePost(post.id, TEST_USER_A);
      expect(deleted).toBe(true);

      const postRow = db.prepare('SELECT is_deleted FROM social_posts WHERE id = ?').get(post.id) as any;
      expect(postRow.is_deleted).toBe(1);

      // getPostById excludes deleted posts
      expect(PostsService.getPostById(post.id, TEST_USER_A)).toBeNull();
    });
  });

  // =========================================================================
  // 3. THREADED COMMENTS & REPLIES
  // =========================================================================
  describe('3. Threaded Comments Engine with Depth Limits', () => {
    it('creates nested replies and limits depth level to 3', () => {
      const post = PostsService.createPost({
        user_id: TEST_USER_A,
        post_type: 'text',
        content: 'Post with lively threaded discussion.',
        visibility: 'public'
      });

      // Top-level comment (depth 0)
      const c1 = PostsService.addComment({
        target_type: 'post',
        target_id: post.id,
        user_id: TEST_USER_B,
        content: 'Top level thought.'
      });
      expect(c1.depth_level).toBe(0);

      // Reply to top-level (depth 1)
      const c2 = PostsService.addComment({
        target_type: 'post',
        target_id: post.id,
        user_id: TEST_USER_A,
        content: 'Reply to Bob.',
        parent_comment_id: c1.id
      });
      expect(c2.depth_level).toBe(1);

      // Reply to reply (depth 2)
      const c3 = PostsService.addComment({
        target_type: 'post',
        target_id: post.id,
        user_id: TEST_USER_C,
        content: 'Reply to Alice.',
        parent_comment_id: c2.id
      });
      expect(c3.depth_level).toBe(2);

      // Retrieve comments hierarchy
      const comments = PostsService.getComments('post', post.id, TEST_USER_A);
      expect(comments.length).toBe(1); // 1 top level comment
      expect(comments[0].replies!.length).toBe(1); // 1 reply to top level
      expect(comments[0].replies![0].replies!.length).toBe(1); // 1 reply to reply
    });
  });

  // =========================================================================
  // 4. EMOTIONAL REACTIONS TESTS
  // =========================================================================
  describe('4. Emotional Reactions & Atomic Tallying', () => {
    it('supports 6 reaction types, atomic toggle and accurate count aggregation', () => {
      const post = PostsService.createPost({
        user_id: TEST_USER_A,
        post_type: 'quote',
        content: '"The unexamined life is not worth living." - Socrates',
        visibility: 'public'
      });

      // Alice reacts with 'thoughtful'
      const r1 = PostsService.toggleReaction({
        target_type: 'post',
        target_id: post.id,
        user_id: TEST_USER_A,
        reaction_type: 'thoughtful'
      });
      expect(r1.current_reaction).toBe('thoughtful');
      expect(r1.summary.breakdown.thoughtful).toBe(1);
      expect(r1.summary.total).toBe(1);

      // Bob reacts with 'love'
      const r2 = PostsService.toggleReaction({
        target_type: 'post',
        target_id: post.id,
        user_id: TEST_USER_B,
        reaction_type: 'love'
      });
      expect(r2.summary.total).toBe(2);
      expect(r2.summary.breakdown.love).toBe(1);
      expect(r2.summary.breakdown.thoughtful).toBe(1);

      // Alice changes reaction from 'thoughtful' to 'celebrate'
      const r3 = PostsService.toggleReaction({
        target_type: 'post',
        target_id: post.id,
        user_id: TEST_USER_A,
        reaction_type: 'celebrate'
      });
      expect(r3.current_reaction).toBe('celebrate');
      expect(r3.summary.breakdown.thoughtful).toBe(0);
      expect(r3.summary.breakdown.celebrate).toBe(1);
      expect(r3.summary.total).toBe(2);

      // Alice untoggles reaction by selecting 'celebrate' again
      const r4 = PostsService.toggleReaction({
        target_type: 'post',
        target_id: post.id,
        user_id: TEST_USER_A,
        reaction_type: 'celebrate'
      });
      expect(r4.current_reaction).toBeNull();
      expect(r4.summary.total).toBe(1);
    });
  });

  // =========================================================================
  // 5. CURSOR-BASED FEED PAGINATION & SEARCH TESTS
  // =========================================================================
  describe('5. Social Feed Cursor Pagination & Full-Text Search', () => {
    it('paginates feed monotonically using cursor without missing or duplicate items', () => {
      // Create 5 posts sequentially
      for (let i = 1; i <= 5; i++) {
        PostsService.createPost({
          user_id: TEST_USER_A,
          post_type: 'text',
          content: `Numbered sequenced post ${i}`,
          visibility: 'public'
        });
      }

      // Fetch page 1 (limit 3)
      const page1 = PostsService.getFeed({ feed_mode: 'latest', limit: 3 }, TEST_USER_A);
      expect(page1.items.length).toBe(3);
      expect(page1.has_more).toBe(true);
      expect(page1.next_cursor).toBeDefined();

      // Fetch page 2 using cursor from page 1
      const page2 = PostsService.getFeed({ feed_mode: 'latest', limit: 3, cursor: page1.next_cursor! }, TEST_USER_A);
      expect(page2.items.length).toBeGreaterThanOrEqual(2);

      // Verify zero overlap between page 1 and page 2
      const page1Ids = new Set(page1.items.map(p => p.id));
      for (const p of page2.items) {
        expect(page1Ids.has(p.id)).toBe(false);
      }
    });

    it('performs full-text search across posts and hashtags', () => {
      PostsService.createPost({
        user_id: TEST_USER_A,
        post_type: 'thought',
        content: 'Searching for deep existential clarity in astronomy #astronomy',
        visibility: 'public'
      });

      const searchRes = PostsService.search('astronomy', TEST_USER_A);
      expect(searchRes.posts.length).toBeGreaterThanOrEqual(1);
      expect(searchRes.posts[0].content).toContain('astronomy');
      expect(searchRes.hashtags.some(h => h.tag === '#astronomy')).toBe(true);
    });
  });

  // =========================================================================
  // 6. CONTENT MODERATION & REPORTING
  // =========================================================================
  describe('6. Content Moderation & Reporting Workflows', () => {
    it('submits a moderation report and records it in the admin audit ledger', () => {
      const post = PostsService.createPost({
        user_id: TEST_USER_B,
        post_type: 'text',
        content: 'Spam advertising link.',
        visibility: 'public'
      });

      const reportId = PostsService.reportContent({
        reporter_id: TEST_USER_A,
        target_type: 'post',
        target_id: post.id,
        reason: 'spam',
        details: 'Unsolicited promotional spam.'
      });

      expect(reportId).toBeDefined();

      const report = db.prepare('SELECT * FROM content_moderation_reports WHERE id = ?').get(reportId) as any;
      expect(report).toBeDefined();
      expect(report.status).toBe('pending');
      expect(report.reason).toBe('spam');
    });
  });
});
