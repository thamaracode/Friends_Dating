import Database from 'better-sqlite3';
import { db } from '../db';

/**
 * Master Engineering Prompt 02: Questions, Posts, Social Feed and Content Discovery Schema.
 * Relational schema with WAL mode, foreign keys, and indexes for high-speed cursor pagination.
 */
export function initSocialSchema(database: Database.Database = db): void {
  database.exec(`
    -- 1. Expanded Questions Ecosystem
    CREATE TABLE IF NOT EXISTS questions_ecosystem (
      id TEXT PRIMARY KEY,
      question_text TEXT NOT NULL,
      primary_category TEXT NOT NULL,
      subcategory TEXT NOT NULL,
      depth_level TEXT NOT NULL CHECK(depth_level IN ('casual', 'reflective', 'deep', 'philosophical')),
      difficulty TEXT NOT NULL DEFAULT 'medium' CHECK(difficulty IN ('easy', 'medium', 'advanced')),
      sensitivity TEXT NOT NULL DEFAULT 'general' CHECK(sensitivity IN ('general', 'vulnerable', 'intimate', 'existential')),
      audience_suitability TEXT NOT NULL DEFAULT 'all_audiences',
      context_tip TEXT,
      follow_up_questions TEXT DEFAULT '[]', -- JSON array of strings
      content_tags TEXT DEFAULT '[]', -- JSON array of strings
      language TEXT NOT NULL DEFAULT 'en',
      author_id TEXT, -- User ID or NULL for curated system questions
      author_name TEXT NOT NULL DEFAULT 'Soulverse Sanctuary',
      source_name TEXT NOT NULL DEFAULT 'Curated Wisdom',
      approval_status TEXT NOT NULL DEFAULT 'approved' CHECK(approval_status IN ('draft', 'review', 'approved', 'rejected', 'archived')),
      is_daily_eligible INTEGER NOT NULL DEFAULT 1,
      likes_count INTEGER NOT NULL DEFAULT 0,
      answers_count INTEGER NOT NULL DEFAULT 0,
      views_count INTEGER NOT NULL DEFAULT 0,
      shares_count INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_questions_category ON questions_ecosystem(primary_category, approval_status);
    CREATE INDEX IF NOT EXISTS idx_questions_depth ON questions_ecosystem(depth_level, approval_status);
    CREATE INDEX IF NOT EXISTS idx_questions_daily ON questions_ecosystem(is_daily_eligible, approval_status);

    -- 2. Question User Interaction Tracking (For True Refresh Repetition Elimination)
    CREATE TABLE IF NOT EXISTS question_views (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      question_id TEXT NOT NULL,
      viewed_at INTEGER NOT NULL,
      FOREIGN KEY (question_id) REFERENCES questions_ecosystem(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_question_views_user ON question_views(user_id, question_id);

    CREATE TABLE IF NOT EXISTS question_skips (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      question_id TEXT NOT NULL,
      skipped_at INTEGER NOT NULL,
      UNIQUE(user_id, question_id),
      FOREIGN KEY (question_id) REFERENCES questions_ecosystem(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- 3. Question Answers
    CREATE TABLE IF NOT EXISTS question_answers (
      id TEXT PRIMARY KEY,
      question_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      answer_type TEXT NOT NULL DEFAULT 'long_text' CHECK(answer_type IN ('short_text', 'long_text', 'single_choice', 'multiple_choice', 'poll_response', 'image', 'structured_reflection')),
      answer_text TEXT NOT NULL,
      media_urls TEXT DEFAULT '[]', -- JSON array of media URLs
      mood_state TEXT,
      visibility TEXT NOT NULL DEFAULT 'private' CHECK(visibility IN ('public', 'connections', 'friends', 'selected', 'private')),
      custom_audience_ids TEXT DEFAULT '[]', -- JSON array of user IDs
      attach_to_profile INTEGER NOT NULL DEFAULT 0,
      likes_count INTEGER NOT NULL DEFAULT 0,
      comments_count INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      FOREIGN KEY (question_id) REFERENCES questions_ecosystem(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_q_answers_user ON question_answers(user_id, visibility);
    CREATE INDEX IF NOT EXISTS idx_q_answers_question ON question_answers(question_id, visibility);

    -- 4. Social Posts
    CREATE TABLE IF NOT EXISTS social_posts (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      post_type TEXT NOT NULL CHECK(post_type IN (
        'text', 'image', 'video', 'audio', 'question', 'poll', 'story',
        'experience', 'thought', 'reflection', 'quote', 'link', 'multi_image',
        'carousel', 'shared_answer', 'event', 'challenge'
      )),
      title TEXT,
      content TEXT NOT NULL,
      summary TEXT,
      media_urls TEXT DEFAULT '[]', -- JSON array of string URLs
      attachment_json TEXT DEFAULT '{}', -- Rich payload: poll options, link preview, audio waveform, challenge info
      question_id TEXT, -- Associated question ID if shared answer or question post
      poll_id TEXT, -- Associated poll ID if poll post
      visibility TEXT NOT NULL DEFAULT 'public' CHECK(visibility IN ('public', 'connections', 'friends', 'selected', 'private', 'custom')),
      custom_audience_ids TEXT DEFAULT '[]', -- JSON array of user IDs
      content_warning TEXT, -- Optional sensitive content warning
      location_name TEXT,
      tags TEXT DEFAULT '[]', -- Normalized hashtag strings e.g. ["#philosophy", "#growth"]
      mentions TEXT DEFAULT '[]', -- JSON array of mentioned user IDs
      is_pinned INTEGER NOT NULL DEFAULT 0,
      is_archived INTEGER NOT NULL DEFAULT 0,
      comments_disabled INTEGER NOT NULL DEFAULT 0,
      is_deleted INTEGER NOT NULL DEFAULT 0,
      likes_count INTEGER NOT NULL DEFAULT 0,
      comments_count INTEGER NOT NULL DEFAULT 0,
      shares_count INTEGER NOT NULL DEFAULT 0,
      bookmarks_count INTEGER NOT NULL DEFAULT 0,
      views_count INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_social_posts_user ON social_posts(user_id, is_deleted, is_archived, created_at);
    CREATE INDEX IF NOT EXISTS idx_social_posts_feed ON social_posts(is_deleted, is_archived, visibility, created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_social_posts_type ON social_posts(post_type, is_deleted);

    -- 5. Social Post Edit History
    CREATE TABLE IF NOT EXISTS social_post_edits (
      id TEXT PRIMARY KEY,
      post_id TEXT NOT NULL,
      previous_content TEXT NOT NULL,
      previous_media_urls TEXT,
      edited_at INTEGER NOT NULL,
      FOREIGN KEY (post_id) REFERENCES social_posts(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_social_post_edits_post ON social_post_edits(post_id);

    -- 6. Social Post Server Drafts (Complementing Client-Side Dexie.js Drafts)
    CREATE TABLE IF NOT EXISTS social_post_drafts (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      post_type TEXT NOT NULL DEFAULT 'text',
      title TEXT,
      content TEXT NOT NULL DEFAULT '',
      media_urls TEXT DEFAULT '[]',
      attachment_json TEXT DEFAULT '{}',
      visibility TEXT NOT NULL DEFAULT 'public',
      tags TEXT DEFAULT '[]',
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_social_drafts_user ON social_post_drafts(user_id, updated_at DESC);

    -- 7. Social Comments & Replies (Nested Threads up to Depth Limit)
    CREATE TABLE IF NOT EXISTS social_comments (
      id TEXT PRIMARY KEY,
      target_type TEXT NOT NULL CHECK(target_type IN ('post', 'question', 'answer')),
      target_id TEXT NOT NULL,
      parent_comment_id TEXT, -- NULL for top-level, comment_id for reply
      user_id TEXT NOT NULL,
      content TEXT NOT NULL,
      media_url TEXT,
      depth_level INTEGER NOT NULL DEFAULT 0,
      mentions TEXT DEFAULT '[]',
      is_edited INTEGER NOT NULL DEFAULT 0,
      is_deleted INTEGER NOT NULL DEFAULT 0,
      likes_count INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_social_comments_target ON social_comments(target_type, target_id, is_deleted, created_at);
    CREATE INDEX IF NOT EXISTS idx_social_comments_parent ON social_comments(parent_comment_id);

    -- 8. Reactions (Post, Comment, Question, Answer)
    CREATE TABLE IF NOT EXISTS social_reactions (
      id TEXT PRIMARY KEY,
      target_type TEXT NOT NULL CHECK(target_type IN ('post', 'comment', 'question', 'answer')),
      target_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      reaction_type TEXT NOT NULL CHECK(reaction_type IN ('like', 'love', 'laugh', 'thoughtful', 'support', 'celebrate')),
      created_at INTEGER NOT NULL,
      UNIQUE(target_type, target_id, user_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_social_reactions_target ON social_reactions(target_type, target_id, reaction_type);

    -- 9. Collections & Bookmarks
    CREATE TABLE IF NOT EXISTS social_collections (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      is_private INTEGER NOT NULL DEFAULT 1,
      cover_url TEXT,
      sort_order INTEGER NOT NULL DEFAULT 0,
      items_count INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS social_bookmarks (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      target_type TEXT NOT NULL CHECK(target_type IN ('post', 'question', 'answer')),
      target_id TEXT NOT NULL,
      collection_id TEXT,
      note TEXT,
      created_at INTEGER NOT NULL,
      UNIQUE(user_id, target_type, target_id),
      FOREIGN KEY (collection_id) REFERENCES social_collections(id) ON DELETE SET NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_social_bookmarks_user ON social_bookmarks(user_id, target_type);

    -- 10. Hashtags & Trending Index
    CREATE TABLE IF NOT EXISTS social_hashtags (
      tag TEXT PRIMARY KEY,
      normalized_tag TEXT UNIQUE NOT NULL,
      posts_count INTEGER NOT NULL DEFAULT 0,
      questions_count INTEGER NOT NULL DEFAULT 0,
      is_trending INTEGER NOT NULL DEFAULT 0,
      last_used_at INTEGER NOT NULL
    );

    -- 11. User Mentions
    CREATE TABLE IF NOT EXISTS social_mentions (
      id TEXT PRIMARY KEY,
      target_type TEXT NOT NULL CHECK(target_type IN ('post', 'comment')),
      target_id TEXT NOT NULL,
      mentioned_user_id TEXT NOT NULL,
      author_id TEXT NOT NULL,
      is_read INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL,
      FOREIGN KEY (mentioned_user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_social_mentions_user ON social_mentions(mentioned_user_id, is_read);

    -- 12. User Feed Preferences
    CREATE TABLE IF NOT EXISTS user_feed_preferences (
      user_id TEXT PRIMARY KEY,
      preferred_categories TEXT DEFAULT '[]', -- JSON array of category keys
      excluded_tags TEXT DEFAULT '[]',
      preferred_feed_mode TEXT NOT NULL DEFAULT 'for_you' CHECK(preferred_feed_mode IN ('for_you', 'following', 'friends', 'questions', 'trending', 'latest', 'saved')),
      updated_at INTEGER NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- 13. Content Moderation & Reports Ledger
    CREATE TABLE IF NOT EXISTS content_moderation_reports (
      id TEXT PRIMARY KEY,
      reporter_id TEXT NOT NULL,
      target_type TEXT NOT NULL CHECK(target_type IN ('post', 'comment', 'question', 'answer', 'user')),
      target_id TEXT NOT NULL,
      reason TEXT NOT NULL CHECK(reason IN ('harassment', 'hate_speech', 'spam', 'nudity', 'violence', 'misinformation', 'other')),
      details TEXT,
      status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'under_review', 'resolved_action_taken', 'resolved_dismissed')),
      reviewed_by_admin_id TEXT,
      admin_notes TEXT,
      created_at INTEGER NOT NULL,
      resolved_at INTEGER,
      FOREIGN KEY (reporter_id) REFERENCES users(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_moderation_status ON content_moderation_reports(status, created_at DESC);
  `);
}
