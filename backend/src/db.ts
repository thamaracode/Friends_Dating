import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.resolve(__dirname, '../../data.db');
export const db = new Database(dbPath);

// Enable WAL mode and foreign keys for high-performance concurrent writes
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export function initDatabase() {
  db.exec(`
    -- Users table
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      username TEXT UNIQUE NOT NULL,
      avatar_url TEXT NOT NULL,
      is_verified INTEGER DEFAULT 0,
      last_seen_at INTEGER NOT NULL,
      status_text TEXT
    );

    -- Conversations table
    CREATE TABLE IF NOT EXISTS conversations (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL CHECK(type IN ('direct', 'saved_messages')),
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      last_message_id TEXT
    );

    -- Conversation Members table
    CREATE TABLE IF NOT EXISTS conversation_members (
      conversation_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      joined_at INTEGER NOT NULL,
      is_pinned INTEGER DEFAULT 0,
      is_archived INTEGER DEFAULT 0,
      is_muted INTEGER DEFAULT 0,
      unread_count INTEGER DEFAULT 0,
      draft_text TEXT,
      PRIMARY KEY (conversation_id, user_id),
      FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Messages table
    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      conversation_id TEXT NOT NULL,
      sender_id TEXT NOT NULL,
      client_message_id TEXT UNIQUE NOT NULL,
      sequence_number INTEGER NOT NULL,
      message_type TEXT NOT NULL CHECK(message_type IN ('text', 'voice', 'photo', 'video', 'file', 'game_event', 'dice_event', 'slot_event', 'coin_event', 'gift_event', 'sticker', 'custom_emoji')),
      text_content TEXT,
      media_url TEXT,
      voice_duration INTEGER,
      voice_waveform TEXT, -- JSON array of numbers
      reply_to_message_id TEXT,
      is_edited INTEGER DEFAULT 0,
      is_pinned INTEGER DEFAULT 0,
      is_deleted_for_everyone INTEGER DEFAULT 0,
      created_at INTEGER NOT NULL,
      FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
      FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Message Reactions table
    CREATE TABLE IF NOT EXISTS message_reactions (
      id TEXT PRIMARY KEY,
      message_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      emoji TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      UNIQUE (message_id, user_id, emoji),
      FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Saved Messages table
    CREATE TABLE IF NOT EXISTS saved_messages (
      id TEXT PRIMARY KEY,
      owner_id TEXT NOT NULL,
      source_message_id TEXT,
      note_text TEXT NOT NULL,
      saved_at INTEGER NOT NULL,
      FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Calls table
    CREATE TABLE IF NOT EXISTS calls (
      id TEXT PRIMARY KEY,
      conversation_id TEXT NOT NULL,
      caller_id TEXT NOT NULL,
      recipient_id TEXT NOT NULL,
      call_type TEXT NOT NULL CHECK(call_type IN ('voice', 'video')),
      status TEXT NOT NULL CHECK(status IN ('ringing', 'connected', 'ended', 'missed', 'rejected')),
      duration_seconds INTEGER DEFAULT 0,
      started_at INTEGER NOT NULL,
      ended_at INTEGER,
      FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
    );

    -- Edit History table
    CREATE TABLE IF NOT EXISTS message_edit_history (
      id TEXT PRIMARY KEY,
      message_id TEXT NOT NULL,
      editor_id TEXT NOT NULL,
      previous_content TEXT NOT NULL,
      edited_at INTEGER NOT NULL,
      FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE,
      FOREIGN KEY (editor_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Scheduled Messages table
    CREATE TABLE IF NOT EXISTS scheduled_messages (
      id TEXT PRIMARY KEY,
      conversation_id TEXT NOT NULL,
      sender_id TEXT NOT NULL,
      payload_json TEXT NOT NULL,
      scheduled_for INTEGER NOT NULL,
      status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'sent', 'cancelled')),
      created_at INTEGER NOT NULL,
      FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
      FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- User Blocks table
    CREATE TABLE IF NOT EXISTS user_blocks (
      blocker_id TEXT NOT NULL,
      blocked_id TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      PRIMARY KEY (blocker_id, blocked_id),
      FOREIGN KEY (blocker_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (blocked_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- User Reports table
    CREATE TABLE IF NOT EXISTS user_reports (
      id TEXT PRIMARY KEY,
      reporter_id TEXT NOT NULL,
      reported_user_id TEXT NOT NULL,
      message_id TEXT,
      reason TEXT NOT NULL,
      details TEXT,
      status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'investigating', 'resolved', 'dismissed')),
      created_at INTEGER NOT NULL,
      FOREIGN KEY (reporter_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (reported_user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Dating Game Sessions table (Server-authoritative)
    CREATE TABLE IF NOT EXISTS game_sessions (
      id TEXT PRIMARY KEY,
      conversation_id TEXT NOT NULL,
      game_type TEXT NOT NULL CHECK(game_type IN ('truth_or_dare', 'would_you_rather', 'two_truths_and_lie', 'compatibility_quiz', 'lucky_dice')),
      current_turn_user_id TEXT NOT NULL,
      state_json TEXT NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('waiting', 'active', 'completed', 'cancelled')),
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
    );

    -- Custom Chat Folders table
    CREATE TABLE IF NOT EXISTS chat_folders (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      filter_type TEXT NOT NULL,
      sort_order INTEGER DEFAULT 0,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Digital Life: User Social & Public Profile Links table
    CREATE TABLE IF NOT EXISTS user_social_links (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      platform_id TEXT NOT NULL,
      original_url TEXT NOT NULL,
      canonical_url TEXT NOT NULL,
      username TEXT,
      custom_label TEXT,
      visibility TEXT NOT NULL CHECK(visibility IN ('public', 'matches_only', 'private')) DEFAULT 'public',
      sort_order INTEGER DEFAULT 0,
      verification_status TEXT NOT NULL DEFAULT 'SELF_DECLARED',
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      UNIQUE (user_id, canonical_url),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Sticker Categories table
    CREATE TABLE IF NOT EXISTS sticker_categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      sort_order INTEGER DEFAULT 0
    );

    -- Sticker Packs table
    CREATE TABLE IF NOT EXISTS sticker_packs (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT,
      cover_icon TEXT NOT NULL,
      category_id TEXT,
      sticker_count INTEGER DEFAULT 0,
      creator_name TEXT DEFAULT 'FRIENDS Official',
      is_official INTEGER DEFAULT 1,
      created_at INTEGER NOT NULL,
      FOREIGN KEY (category_id) REFERENCES sticker_categories(id)
    );

    -- Stickers table
    CREATE TABLE IF NOT EXISTS stickers (
      id TEXT PRIMARY KEY,
      pack_id TEXT NOT NULL,
      asset_url TEXT NOT NULL,
      emoji_association TEXT NOT NULL,
      keywords TEXT,
      sort_order INTEGER DEFAULT 0,
      is_animated INTEGER DEFAULT 0,
      created_at INTEGER NOT NULL,
      FOREIGN KEY (pack_id) REFERENCES sticker_packs(id) ON DELETE CASCADE
    );

    -- User Installed Sticker Packs table
    CREATE TABLE IF NOT EXISTS user_sticker_packs (
      user_id TEXT NOT NULL,
      pack_id TEXT NOT NULL,
      installed_at INTEGER NOT NULL,
      sort_order INTEGER DEFAULT 0,
      PRIMARY KEY (user_id, pack_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (pack_id) REFERENCES sticker_packs(id) ON DELETE CASCADE
    );

    -- User Favorite Stickers table
    CREATE TABLE IF NOT EXISTS user_favorite_stickers (
      user_id TEXT NOT NULL,
      sticker_id TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      PRIMARY KEY (user_id, sticker_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (sticker_id) REFERENCES stickers(id) ON DELETE CASCADE
    );

    -- User Recent Stickers table
    CREATE TABLE IF NOT EXISTS user_recent_stickers (
      user_id TEXT NOT NULL,
      sticker_id TEXT NOT NULL,
      last_used_at INTEGER NOT NULL,
      usage_count INTEGER DEFAULT 1,
      PRIMARY KEY (user_id, sticker_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (sticker_id) REFERENCES stickers(id) ON DELETE CASCADE
    );

    -- User Recent Emojis table (Preserved across devices)
    CREATE TABLE IF NOT EXISTS user_recent_emojis (
      user_id TEXT NOT NULL,
      emoji TEXT NOT NULL,
      last_used_at INTEGER NOT NULL,
      usage_count INTEGER DEFAULT 1,
      PRIMARY KEY (user_id, emoji),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- User Relationships (for permission filtering: match, friend, selected)
    CREATE TABLE IF NOT EXISTS user_relationships (
      user_id TEXT NOT NULL,
      target_user_id TEXT NOT NULL,
      relationship_type TEXT NOT NULL CHECK(relationship_type IN ('match', 'friend', 'selected')),
      created_at INTEGER NOT NULL,
      PRIMARY KEY (user_id, target_user_id, relationship_type),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (target_user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Living Identity: Profile Sections
    CREATE TABLE IF NOT EXISTS profile_sections (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      section_type TEXT NOT NULL DEFAULT 'custom',
      icon TEXT,
      parent_section_id TEXT,
      sort_order INTEGER DEFAULT 0,
      visibility TEXT NOT NULL CHECK(visibility IN ('public', 'matches', 'friends', 'selected', 'private')) DEFAULT 'public',
      is_pinned INTEGER DEFAULT 0,
      is_archived INTEGER DEFAULT 0,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Living Identity: Profile Entries (Text, bullet lists, thoughts, traits)
    CREATE TABLE IF NOT EXISTS profile_entries (
      id TEXT PRIMARY KEY,
      section_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      entry_type TEXT NOT NULL CHECK(entry_type IN ('text', 'qa', 'thought', 'trait', 'reflection', 'list', 'media')) DEFAULT 'text',
      title TEXT,
      content TEXT NOT NULL,
      structured_content TEXT,
      visibility TEXT NOT NULL CHECK(visibility IN ('public', 'matches', 'friends', 'selected', 'private')) DEFAULT 'public',
      sort_order INTEGER DEFAULT 0,
      is_pinned INTEGER DEFAULT 0,
      status TEXT DEFAULT 'published' CHECK(status IN ('draft', 'published', 'archived')),
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      FOREIGN KEY (section_id) REFERENCES profile_sections(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Living Identity: User-Created Questions
    CREATE TABLE IF NOT EXISTS profile_questions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      section_id TEXT,
      question TEXT NOT NULL,
      description TEXT,
      answer_type TEXT NOT NULL CHECK(answer_type IN ('short_text', 'long_text', 'yes_no', 'single_choice', 'multi_choice', 'number', 'rating_scale', 'slider', 'ranked_list', 'media')) DEFAULT 'long_text',
      options TEXT,
      visibility TEXT NOT NULL CHECK(visibility IN ('public', 'matches', 'friends', 'selected', 'private')) DEFAULT 'public',
      allow_responses INTEGER DEFAULT 0,
      sort_order INTEGER DEFAULT 0,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Living Identity: Answers to Questions
    CREATE TABLE IF NOT EXISTS profile_answers (
      id TEXT PRIMARY KEY,
      question_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      answer_content TEXT NOT NULL,
      structured_answer TEXT,
      visibility TEXT NOT NULL CHECK(visibility IN ('public', 'matches', 'friends', 'selected', 'private')) DEFAULT 'public',
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      FOREIGN KEY (question_id) REFERENCES profile_questions(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Living Identity: Chronological Timeline Events
    CREATE TABLE IF NOT EXISTS profile_timeline_events (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      event_date TEXT,
      date_precision TEXT CHECK(date_precision IN ('exact', 'year_month', 'year', 'approximate')) DEFAULT 'approximate',
      category TEXT,
      personal_significance TEXT,
      lessons_learned TEXT,
      media_url TEXT,
      visibility TEXT NOT NULL CHECK(visibility IN ('public', 'matches', 'friends', 'selected', 'private')) DEFAULT 'public',
      sort_order INTEGER DEFAULT 0,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Living Identity: Personal Writing & Thoughts
    CREATE TABLE IF NOT EXISTS profile_thoughts (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT,
      content TEXT NOT NULL,
      thought_type TEXT CHECK(thought_type IN ('thought', 'opinion', 'confession', 'reflection', 'essay', 'quote')) DEFAULT 'thought',
      tags TEXT,
      is_pinned INTEGER DEFAULT 0,
      status TEXT DEFAULT 'published' CHECK(status IN ('draft', 'published', 'archived')),
      visibility TEXT NOT NULL CHECK(visibility IN ('public', 'matches', 'friends', 'selected', 'private')) DEFAULT 'public',
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Year-by-Year Life Timeline: Life Years
    CREATE TABLE IF NOT EXISTS life_years (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      year_number INTEGER NOT NULL,
      chapter_title TEXT,
      summary TEXT,
      cover_image_url TEXT,
      is_future_year INTEGER DEFAULT 0,
      visibility TEXT NOT NULL CHECK(visibility IN ('public', 'matches', 'friends', 'selected', 'private')) DEFAULT 'public',
      sort_order INTEGER DEFAULT 0,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      UNIQUE(user_id, year_number),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Year-by-Year Life Timeline: Multi-Year Chapters
    CREATE TABLE IF NOT EXISTS life_chapters (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      start_year INTEGER NOT NULL,
      end_year INTEGER,
      icon TEXT DEFAULT '📖',
      cover_image_url TEXT,
      visibility TEXT NOT NULL CHECK(visibility IN ('public', 'matches', 'friends', 'selected', 'private')) DEFAULT 'public',
      sort_order INTEGER DEFAULT 0,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Year-by-Year Life Timeline: Events & Memories
    CREATE TABLE IF NOT EXISTS life_events (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      year_number INTEGER NOT NULL,
      chapter_id TEXT,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      date_display TEXT,
      date_precision TEXT CHECK(date_precision IN ('exact', 'month_year', 'year_only', 'approximate', 'unknown')) DEFAULT 'approximate',
      is_planned INTEGER DEFAULT 0,
      is_milestone INTEGER DEFAULT 0,
      category TEXT NOT NULL DEFAULT 'other',
      tags TEXT,
      location TEXT,
      people_involved TEXT,
      personal_significance TEXT,
      lessons_learned TEXT,
      emotional_reflection TEXT,
      media_urls TEXT,
      visibility TEXT NOT NULL CHECK(visibility IN ('public', 'matches', 'friends', 'selected', 'private')) DEFAULT 'public',
      status TEXT DEFAULT 'published' CHECK(status IN ('draft', 'published', 'archived')),
      sort_order INTEGER DEFAULT 0,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (chapter_id) REFERENCES life_chapters(id) ON DELETE SET NULL
    );

    -- Year-by-Year Life Timeline: Annual Reviews & "Then vs Now" Comparisons
    CREATE TABLE IF NOT EXISTS life_reflections (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      reflection_type TEXT NOT NULL CHECK(reflection_type IN ('year_end_review', 'then_vs_now')),
      year_number INTEGER,
      compare_year_a INTEGER,
      compare_year_b INTEGER,
      title TEXT NOT NULL,
      content_json TEXT NOT NULL,
      visibility TEXT NOT NULL CHECK(visibility IN ('public', 'matches', 'friends', 'selected', 'private')) DEFAULT 'public',
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- User GitHub-Flavored Markdown Manifestos (5000 Character Limit)
    CREATE TABLE IF NOT EXISTS profile_markdowns (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT DEFAULT 'README.md',
      content TEXT NOT NULL,
      visibility TEXT NOT NULL CHECK(visibility IN ('public', 'matches', 'friends', 'selected', 'private')) DEFAULT 'public',
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      UNIQUE(user_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- ========================================================================
    -- PROFILE WORLDS: MULTI-DIMENSIONAL HUMAN IDENTITY & SELF-EXPRESSION
    -- ========================================================================
    CREATE TABLE IF NOT EXISTS profile_worlds (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      slug TEXT NOT NULL,
      description TEXT,
      world_type TEXT NOT NULL DEFAULT 'custom',
      cover_image_url TEXT,
      avatar_url TEXT,
      theme_config TEXT,
      layout_type TEXT DEFAULT 'cinematic',
      ambient_sound_url TEXT,
      visibility TEXT NOT NULL CHECK(visibility IN ('public', 'matches', 'friends', 'selected', 'private')) DEFAULT 'public',
      status TEXT DEFAULT 'published' CHECK(status IN ('draft', 'published', 'archived')),
      is_default INTEGER DEFAULT 0,
      sort_order INTEGER DEFAULT 0,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      UNIQUE(user_id, slug),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS profile_world_sections (
      id TEXT PRIMARY KEY,
      world_id TEXT NOT NULL,
      parent_section_id TEXT,
      title TEXT NOT NULL,
      description TEXT,
      section_type TEXT DEFAULT 'general',
      icon TEXT,
      visibility TEXT NOT NULL CHECK(visibility IN ('public', 'matches', 'friends', 'selected', 'private')) DEFAULT 'public',
      sort_order INTEGER DEFAULT 0,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      FOREIGN KEY (world_id) REFERENCES profile_worlds(id) ON DELETE CASCADE,
      FOREIGN KEY (parent_section_id) REFERENCES profile_world_sections(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS profile_world_entries (
      id TEXT PRIMARY KEY,
      world_id TEXT NOT NULL,
      section_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      entry_type TEXT DEFAULT 'text',
      title TEXT,
      content TEXT NOT NULL,
      structured_content TEXT,
      reality_classification TEXT NOT NULL CHECK(reality_classification IN ('actual', 'historical', 'current', 'planned', 'aspirational', 'hypothetical', 'imaginary', 'fictional', 'cinematic', 'dream', 'roleplay', 'alternate_reality', 'uncertain')) DEFAULT 'actual',
      visibility TEXT NOT NULL CHECK(visibility IN ('public', 'matches', 'friends', 'selected', 'private')) DEFAULT 'public',
      status TEXT DEFAULT 'published' CHECK(status IN ('draft', 'published', 'archived')),
      sort_order INTEGER DEFAULT 0,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      FOREIGN KEY (world_id) REFERENCES profile_worlds(id) ON DELETE CASCADE,
      FOREIGN KEY (section_id) REFERENCES profile_world_sections(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS profile_world_entry_relations (
      id TEXT PRIMARY KEY,
      source_world_id TEXT NOT NULL,
      source_entry_id TEXT NOT NULL,
      target_world_id TEXT NOT NULL,
      relation_type TEXT DEFAULT 'reference',
      created_at INTEGER NOT NULL,
      FOREIGN KEY (source_world_id) REFERENCES profile_worlds(id) ON DELETE CASCADE,
      FOREIGN KEY (source_entry_id) REFERENCES profile_world_entries(id) ON DELETE CASCADE,
      FOREIGN KEY (target_world_id) REFERENCES profile_worlds(id) ON DELETE CASCADE
    );

    -- Indexes for sub-millisecond timeline and profile queries
    CREATE INDEX IF NOT EXISTS idx_messages_conv_seq ON messages(conversation_id, sequence_number);
    CREATE INDEX IF NOT EXISTS idx_members_user ON conversation_members(user_id);
    CREATE INDEX IF NOT EXISTS idx_reactions_msg ON message_reactions(message_id);
    CREATE INDEX IF NOT EXISTS idx_sched_time ON scheduled_messages(scheduled_for, status);
    CREATE INDEX IF NOT EXISTS idx_social_user_vis ON user_social_links(user_id, visibility, sort_order);
    CREATE INDEX IF NOT EXISTS idx_stickers_pack ON stickers(pack_id, sort_order);
    CREATE INDEX IF NOT EXISTS idx_stickers_emoji ON stickers(emoji_association);
    CREATE INDEX IF NOT EXISTS idx_profile_sec_user ON profile_sections(user_id, sort_order);
    CREATE INDEX IF NOT EXISTS idx_profile_ent_sec ON profile_entries(section_id, sort_order);
    CREATE INDEX IF NOT EXISTS idx_profile_q_user ON profile_questions(user_id, sort_order);
    CREATE INDEX IF NOT EXISTS idx_profile_ans_q ON profile_answers(question_id);
    CREATE INDEX IF NOT EXISTS idx_profile_time_user ON profile_timeline_events(user_id, sort_order);
    CREATE INDEX IF NOT EXISTS idx_profile_tht_user ON profile_thoughts(user_id, is_pinned, created_at);
    CREATE INDEX IF NOT EXISTS idx_life_years_user_yr ON life_years(user_id, year_number);
    CREATE INDEX IF NOT EXISTS idx_life_events_user_yr ON life_events(user_id, year_number, sort_order);
    CREATE INDEX IF NOT EXISTS idx_life_events_chapter ON life_events(chapter_id);
    CREATE INDEX IF NOT EXISTS idx_life_reflections_user ON life_reflections(user_id, reflection_type);
    CREATE INDEX IF NOT EXISTS idx_profile_md_user ON profile_markdowns(user_id);
    CREATE INDEX IF NOT EXISTS idx_worlds_user_vis ON profile_worlds(user_id, visibility, status);
    CREATE INDEX IF NOT EXISTS idx_world_sections_world ON profile_world_sections(world_id, sort_order);
    CREATE INDEX IF NOT EXISTS idx_world_entries_section ON profile_world_entries(section_id, sort_order);
    CREATE INDEX IF NOT EXISTS idx_world_entries_world_vis ON profile_world_entries(world_id, visibility, status);
    CREATE INDEX IF NOT EXISTS idx_world_relations_source ON profile_world_entry_relations(source_world_id, source_entry_id);

    -- ========================================================================
    -- DAILY RELATIONSHIP & HUMAN CONNECTION INTELLIGENCE SYSTEM
    -- ========================================================================
    CREATE TABLE IF NOT EXISTS daily_content_categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      tab TEXT NOT NULL CHECK(tab IN ('love', 'friendship', 'mind', 'growth')),
      icon TEXT NOT NULL,
      description TEXT NOT NULL,
      ambient_color TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS daily_content (
      id TEXT PRIMARY KEY,
      tab TEXT NOT NULL CHECK(tab IN ('love', 'friendship', 'mind', 'growth')),
      category_id TEXT NOT NULL,
      format_type TEXT NOT NULL CHECK(format_type IN ('quote', 'advice', 'reflection', 'behavior_insight', 'challenge', 'motivation', 'compatibility')),
      title TEXT NOT NULL,
      quote_one_liner TEXT NOT NULL,
      body_insight TEXT NOT NULL,
      reflection_question TEXT,
      action_exercise TEXT,
      gender_audience TEXT NOT NULL DEFAULT '["all"]',
      relationship_statuses TEXT NOT NULL DEFAULT '["all"]',
      friendship_tracks TEXT DEFAULT '["all"]',
      personality_tags TEXT,
      cover_image_url TEXT,
      author_or_source TEXT,
      source_type TEXT DEFAULT 'curated' CHECK(source_type IN ('curated', 'ai_generated', 'community')),
      review_status TEXT DEFAULT 'approved',
      likes_count INTEGER DEFAULT 0,
      saves_count INTEGER DEFAULT 0,
      created_at INTEGER NOT NULL,
      FOREIGN KEY (category_id) REFERENCES daily_content_categories(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS daily_member_preferences (
      member_id TEXT PRIMARY KEY,
      edition_preference TEXT NOT NULL DEFAULT 'universal' CHECK(edition_preference IN ('men', 'women', 'universal', 'mixed')),
      relationship_status TEXT NOT NULL DEFAULT 'single',
      dating_intentions TEXT DEFAULT 'meaningful_connection',
      friendship_track TEXT DEFAULT 'making_new_friends',
      delivery_time TEXT DEFAULT '08:00',
      timezone TEXT DEFAULT 'Asia/Colombo',
      love_notifications INTEGER DEFAULT 1,
      friendship_notifications INTEGER DEFAULT 1,
      growth_notifications INTEGER DEFAULT 1,
      quiet_hours_enabled INTEGER DEFAULT 1,
      updated_at INTEGER NOT NULL,
      FOREIGN KEY (member_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS daily_member_assignments (
      id TEXT PRIMARY KEY,
      member_id TEXT NOT NULL,
      local_date TEXT NOT NULL,
      tab TEXT NOT NULL CHECK(tab IN ('love', 'friendship', 'mind', 'growth')),
      content_id TEXT NOT NULL,
      is_read INTEGER DEFAULT 0,
      reflection_answer TEXT,
      challenge_completed INTEGER DEFAULT 0,
      assigned_at INTEGER NOT NULL,
      UNIQUE(member_id, local_date, tab),
      FOREIGN KEY (member_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (content_id) REFERENCES daily_content(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS daily_content_feedback (
      id TEXT PRIMARY KEY,
      member_id TEXT NOT NULL,
      content_id TEXT NOT NULL,
      action TEXT NOT NULL CHECK(action IN ('like', 'dislike', 'save', 'reflect', 'challenge_done')),
      note TEXT,
      created_at INTEGER NOT NULL,
      FOREIGN KEY (member_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (content_id) REFERENCES daily_content(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS daily_member_streaks (
      member_id TEXT PRIMARY KEY,
      current_streak INTEGER DEFAULT 1,
      longest_streak INTEGER DEFAULT 1,
      last_active_date TEXT NOT NULL,
      total_reflections INTEGER DEFAULT 0,
      total_challenges_done INTEGER DEFAULT 0,
      FOREIGN KEY (member_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_daily_content_tab ON daily_content(tab, category_id);
    CREATE INDEX IF NOT EXISTS idx_daily_assignments_member_date ON daily_member_assignments(member_id, local_date);
    CREATE INDEX IF NOT EXISTS idx_daily_feedback_member_content ON daily_content_feedback(member_id, content_id, action);

    -- ========================================================================
    -- IDENTITY UNIVERSE: MULTIPLE IDENTITIES & PERSONAS
    -- ========================================================================
    CREATE TABLE IF NOT EXISTS user_identities (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      display_title TEXT,
      classification TEXT NOT NULL CHECK(classification IN (
        'real_identity', 'fictional_character', 'inspired_character', 
        'alternate_self', 'aspirational_self', 'historical_persona', 
        'cinematic_persona', 'fantasy_identity', 'anonymous_identity', 'custom'
      )),
      avatar_url TEXT,
      cover_image_url TEXT,
      description TEXT,
      biography TEXT,
      personality_traits TEXT, -- JSON array of strings
      interests TEXT,          -- JSON array of strings
      skills TEXT,             -- JSON array of strings
      universe_id TEXT,        -- optional association with fictional universe
      layout TEXT DEFAULT 'standard',
      theme_config TEXT,       -- JSON styling config
      is_primary INTEGER DEFAULT 0,
      visibility TEXT NOT NULL CHECK(visibility IN ('public', 'matches', 'friends', 'selected', 'private')) DEFAULT 'public',
      status TEXT NOT NULL CHECK(status IN ('draft', 'published', 'archived')) DEFAULT 'published',
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- ========================================================================
    -- FICTIONAL UNIVERSES & WORLD CREATION
    -- ========================================================================
    CREATE TABLE IF NOT EXISTS fictional_universes (
      id TEXT PRIMARY KEY,
      creator_id TEXT NOT NULL,
      name TEXT NOT NULL,
      slug TEXT NOT NULL,
      description TEXT,
      genre TEXT DEFAULT 'fantasy',
      lore TEXT,
      rules_of_universe TEXT,
      cover_image_url TEXT,
      ambient_sound_url TEXT,
      is_collaborative INTEGER DEFAULT 0,
      visibility TEXT NOT NULL CHECK(visibility IN ('public', 'matches', 'friends', 'selected', 'private')) DEFAULT 'public',
      status TEXT NOT NULL CHECK(status IN ('draft', 'published', 'archived')) DEFAULT 'published',
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      UNIQUE(creator_id, slug),
      FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS universe_characters (
      id TEXT PRIMARY KEY,
      universe_id TEXT NOT NULL,
      name TEXT NOT NULL,
      role_description TEXT,
      identity_id TEXT,
      creator_id TEXT NOT NULL,
      avatar_url TEXT,
      alignment TEXT,
      lore_details TEXT,
      created_at INTEGER NOT NULL,
      FOREIGN KEY (universe_id) REFERENCES fictional_universes(id) ON DELETE CASCADE,
      FOREIGN KEY (identity_id) REFERENCES user_identities(id) ON DELETE SET NULL,
      FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- ========================================================================
    -- UNIVERSAL LIFE TIMELINE (BCE, ASTRONOMICAL, FICTIONAL, MILLIONS/TRILLIONS OF YEARS AGO)
    -- ========================================================================
    CREATE TABLE IF NOT EXISTS universal_timeline_events (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      identity_id TEXT,
      universe_id TEXT,
      time_type TEXT NOT NULL CHECK(time_type IN ('standard_ce', 'bce', 'years_ago', 'astronomical', 'fictional_era', 'timeless')),
      year_value TEXT NOT NULL,       -- Validated string / arbitrary precision (e.g. "-1500", "10000000000000", "65000000", "2026")
      year_scale TEXT DEFAULT 'years' CHECK(year_scale IN ('years', 'centuries', 'millennia', 'millions_years', 'billions_years', 'trillions_years', 'custom')),
      era_label TEXT,                 -- e.g. "BCE", "CE", "Dinosaur Era", "Age of Myth"
      display_label TEXT NOT NULL,    -- e.g. "1500 BCE", "10,000,000,000,000 years ago", "65 million years ago"
      title TEXT NOT NULL,
      short_description TEXT NOT NULL,
      detailed_description TEXT,
      image_url TEXT,
      event_category TEXT DEFAULT 'milestone',
      is_fictional INTEGER DEFAULT 0,
      precision TEXT DEFAULT 'approximate' CHECK(precision IN ('exact', 'approximate', 'era_only', 'timeless')),
      calendar_system TEXT DEFAULT 'gregorian',
      tags TEXT,                      -- Comma-separated or JSON string
      visibility TEXT NOT NULL CHECK(visibility IN ('public', 'matches', 'friends', 'selected', 'private')) DEFAULT 'public',
      sort_order INTEGER DEFAULT 0,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (identity_id) REFERENCES user_identities(id) ON DELETE SET NULL,
      FOREIGN KEY (universe_id) REFERENCES fictional_universes(id) ON DELETE SET NULL
    );

    -- ========================================================================
    -- PRIVATE VIEWER NOTES (Telegram-Inspired Contact Notes - Author Only Access)
    -- ========================================================================
    CREATE TABLE IF NOT EXISTS private_viewer_notes (
      id TEXT PRIMARY KEY,
      viewer_id TEXT NOT NULL,
      target_user_id TEXT NOT NULL,
      note_content TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      UNIQUE(viewer_id, target_user_id),
      FOREIGN KEY (viewer_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (target_user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- ========================================================================
    -- SOCIAL FEEDBACK & COMMUNITY TRAIT VOTING (Like/Dislike, Red/Green Flags)
    -- ========================================================================
    CREATE TABLE IF NOT EXISTS profile_votes (
      id TEXT PRIMARY KEY,
      voter_id TEXT NOT NULL,
      target_user_id TEXT NOT NULL,
      vote_type TEXT NOT NULL CHECK(vote_type IN ('like', 'dislike')),
      created_at INTEGER NOT NULL,
      UNIQUE(voter_id, target_user_id),
      CHECK(voter_id != target_user_id),
      FOREIGN KEY (voter_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (target_user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS profile_trait_votes (
      id TEXT PRIMARY KEY,
      voter_id TEXT NOT NULL,
      target_user_id TEXT NOT NULL,
      trait_slug TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      UNIQUE(voter_id, target_user_id, trait_slug),
      CHECK(voter_id != target_user_id),
      FOREIGN KEY (voter_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (target_user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- ========================================================================
    -- TESTIMONIALS & REVIEWS (Requires 100+ message history & recipient approval)
    -- ========================================================================
    CREATE TABLE IF NOT EXISTS user_reviews (
      id TEXT PRIMARY KEY,
      author_id TEXT NOT NULL,
      target_user_id TEXT NOT NULL,
      category TEXT DEFAULT 'general',
      review_text TEXT NOT NULL,
      is_approved_by_target INTEGER DEFAULT 0,
      visibility TEXT NOT NULL CHECK(visibility IN ('pending', 'approved', 'rejected', 'private_feedback')) DEFAULT 'pending',
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      UNIQUE(author_id, target_user_id),
      CHECK(author_id != target_user_id),
      FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (target_user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- ========================================================================
    -- RELATIONSHIP MILESTONES & VOLUNTARY DISCOVERY SECRETS
    -- ========================================================================
    CREATE TABLE IF NOT EXISTS relationship_voluntary_shares (
      id TEXT PRIMARY KEY,
      owner_id TEXT NOT NULL,
      recipient_id TEXT NOT NULL,
      item_type TEXT NOT NULL CHECK(item_type IN ('childhood_memory', 'personal_story', 'custom_question', 'secret_thought')),
      item_id TEXT NOT NULL,
      unlocked_at INTEGER NOT NULL,
      UNIQUE(owner_id, recipient_id, item_type, item_id),
      FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (recipient_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- ========================================================================
    -- CONVERSATION & ACTIVITY PREFERENCES (Aggregated Coarse Windows)
    -- ========================================================================
    CREATE TABLE IF NOT EXISTS user_activity_preferences (
      user_id TEXT PRIMARY KEY,
      share_peak_activity INTEGER DEFAULT 1,
      peak_window TEXT DEFAULT 'evening' CHECK(peak_window IN ('morning', 'afternoon', 'evening', 'late_night', 'hidden')),
      communication_style TEXT DEFAULT 'loves_deep_conversations',
      chatty_indicator TEXT DEFAULT 'meaningful_discussions',
      avg_response_range TEXT DEFAULT 'within_few_hours',
      preferred_message_format TEXT DEFAULT 'thoughtful_text',
      updated_at INTEGER NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- ========================================================================
    -- EXTERNAL GAME REGISTRY & SECURE EMBEDDING PLATFORM
    -- ========================================================================
    CREATE TABLE IF NOT EXISTS registered_external_games (
      id TEXT PRIMARY KEY,
      provider_name TEXT NOT NULL,
      game_title TEXT NOT NULL,
      game_url TEXT NOT NULL,
      allowed_origin TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT 'trivia',
      description TEXT,
      thumbnail_url TEXT,
      is_approved INTEGER DEFAULT 1,
      sandbox_attributes TEXT DEFAULT 'allow-scripts allow-same-origin allow-popups',
      registered_by TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      FOREIGN KEY (registered_by) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Universal Indexes for sub-millisecond queries
    CREATE INDEX IF NOT EXISTS idx_identities_user_vis ON user_identities(user_id, visibility, status);
    CREATE INDEX IF NOT EXISTS idx_universes_creator_vis ON fictional_universes(creator_id, visibility, status);
    CREATE INDEX IF NOT EXISTS idx_universal_timeline_user ON universal_timeline_events(user_id, time_type, sort_order);
    CREATE INDEX IF NOT EXISTS idx_viewer_notes_author ON private_viewer_notes(viewer_id, target_user_id);
    CREATE INDEX IF NOT EXISTS idx_profile_votes_target ON profile_votes(target_user_id, vote_type);
    CREATE INDEX IF NOT EXISTS idx_profile_traits_target ON profile_trait_votes(target_user_id, trait_slug);
    CREATE INDEX IF NOT EXISTS idx_reviews_target_vis ON user_reviews(target_user_id, visibility);

    -- =========================================================================
    -- THE CONTROL LAYER: MASTER FEATURE REGISTRY & PERSONALIZATION SCHEMA
    -- =========================================================================
    CREATE TABLE IF NOT EXISTS feature_registry (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      tagline TEXT NOT NULL,
      description TEXT NOT NULL,
      default_state TEXT NOT NULL DEFAULT 'available',
      is_user_configurable INTEGER NOT NULL DEFAULT 1,
      privacy_level TEXT NOT NULL DEFAULT 'selective',
      collected_data_json TEXT NOT NULL DEFAULT '[]',
      visibility_audience TEXT NOT NULL DEFAULT 'User and chosen peers',
      requires_ai INTEGER NOT NULL DEFAULT 0,
      requires_notifications INTEGER NOT NULL DEFAULT 0,
      is_premium INTEGER NOT NULL DEFAULT 0,
      disable_behavior TEXT NOT NULL,
      data_retention_rule TEXT NOT NULL,
      min_app_version TEXT NOT NULL DEFAULT '1.0.0',
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS feature_flags (
      feature_id TEXT PRIMARY KEY,
      is_globally_enabled INTEGER NOT NULL DEFAULT 1,
      rollout_percentage INTEGER NOT NULL DEFAULT 100,
      allowed_roles_json TEXT NOT NULL DEFAULT '["user","vip","admin"]',
      allowed_tiers_json TEXT NOT NULL DEFAULT '["free","plus","sovereign"]',
      beta_user_ids_json TEXT NOT NULL DEFAULT '[]',
      min_version TEXT NOT NULL DEFAULT '1.0.0',
      kill_switch_active INTEGER NOT NULL DEFAULT 0,
      kill_switch_reason TEXT,
      updated_by TEXT NOT NULL DEFAULT 'system',
      updated_at INTEGER NOT NULL,
      FOREIGN KEY (feature_id) REFERENCES feature_registry(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS feature_dependencies (
      feature_id TEXT NOT NULL,
      depends_on_feature_id TEXT NOT NULL,
      is_optional INTEGER NOT NULL DEFAULT 0,
      fallback_note TEXT,
      PRIMARY KEY (feature_id, depends_on_feature_id),
      FOREIGN KEY (feature_id) REFERENCES feature_registry(id) ON DELETE CASCADE,
      FOREIGN KEY (depends_on_feature_id) REFERENCES feature_registry(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS user_feature_preferences (
      user_id TEXT NOT NULL,
      feature_id TEXT NOT NULL,
      state TEXT NOT NULL DEFAULT 'enabled',
      is_visible INTEGER NOT NULL DEFAULT 1,
      is_discoverable INTEGER NOT NULL DEFAULT 1,
      custom_config_json TEXT NOT NULL DEFAULT '{}',
      paused_until INTEGER,
      updated_at INTEGER NOT NULL,
      PRIMARY KEY (user_id, feature_id),
      FOREIGN KEY (feature_id) REFERENCES feature_registry(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS user_experience_presets (
      user_id TEXT PRIMARY KEY,
      active_preset TEXT NOT NULL DEFAULT 'complete',
      applied_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS configuration_audit_logs (
      id TEXT PRIMARY KEY,
      admin_id TEXT NOT NULL,
      admin_name TEXT NOT NULL,
      action TEXT NOT NULL,
      target_type TEXT NOT NULL,
      target_id TEXT NOT NULL,
      before_value_json TEXT,
      after_value_json TEXT,
      reason TEXT NOT NULL,
      ip_address TEXT,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS feature_usage_events (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      feature_id TEXT NOT NULL,
      event_type TEXT NOT NULL,
      metadata_json TEXT DEFAULT '{}',
      created_at INTEGER NOT NULL
    );

    -- =========================================================================
    -- CASBIN-STYLE RBAC AUTHORIZATION SCHEMA
    -- =========================================================================
    CREATE TABLE IF NOT EXISTS admin_roles (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      hierarchy_level INTEGER NOT NULL DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS admin_role_assignments (
      user_id TEXT NOT NULL,
      role_id TEXT NOT NULL,
      assigned_by TEXT NOT NULL,
      assigned_at INTEGER NOT NULL,
      PRIMARY KEY (user_id, role_id),
      FOREIGN KEY (role_id) REFERENCES admin_roles(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS admin_permissions (
      id TEXT PRIMARY KEY,
      role_id TEXT NOT NULL,
      domain TEXT NOT NULL,
      action TEXT NOT NULL,
      FOREIGN KEY (role_id) REFERENCES admin_roles(id) ON DELETE CASCADE
    );

    -- =========================================================================
    -- CONFIGURATION VERSIONING & ROLLBACK SCHEMA
    -- =========================================================================
    CREATE TABLE IF NOT EXISTS configuration_versions (
      id TEXT PRIMARY KEY,
      version_number INTEGER NOT NULL,
      snapshot_json TEXT NOT NULL,
      created_by TEXT NOT NULL,
      change_summary TEXT NOT NULL,
      created_at INTEGER NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_feat_pref_user ON user_feature_preferences(user_id, state);
    CREATE INDEX IF NOT EXISTS idx_audit_created ON configuration_audit_logs(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_feat_usage_time ON feature_usage_events(feature_id, event_type, created_at);
  `);

  seedInitialData();
  seedStickerEcosystem();
  seedLivingIdentityProfiles();
  seedLifeTimeline();
  seedProfileMarkdowns();
  seedProfileWorlds();
  seedDailyConnectionContent();
  seedSoulverseExpansionData();
  seedFeatureControlLayer();
}

function seedInitialData() {
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
  if (userCount.count > 0) return;

  const insertUser = db.prepare(`
    INSERT INTO users (id, name, username, avatar_url, is_verified, last_seen_at, status_text)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  insertUser.run('usr_me', 'Kavindu Senanayake', 'kavindu', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80', 1, Date.now(), 'Active now');
  insertUser.run('usr_alex', 'Alex Rivera', 'alex_r', 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80', 1, Date.now() - 300000, 'Active 5m ago');
  insertUser.run('usr_tara', 'Tara Perera', 'tara_p', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80', 1, Date.now() - 7200000, 'Active 2h ago');
  insertUser.run('usr_dinuk', 'Dinuk Fernando', 'dinuk_f', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80', 0, Date.now(), 'Online');

  // Insert Saved Messages Conversation
  db.prepare(`
    INSERT INTO conversations (id, type, created_at, updated_at)
    VALUES ('conv_saved', 'saved_messages', ?, ?)
  `).run(Date.now(), Date.now());

  db.prepare(`
    INSERT INTO conversation_members (conversation_id, user_id, joined_at, is_pinned)
    VALUES ('conv_saved', 'usr_me', ?, 1)
  `).run(Date.now());

  // Insert Direct Conversation with Alex
  db.prepare(`
    INSERT INTO conversations (id, type, created_at, updated_at)
    VALUES ('conv_alex', 'direct', ?, ?)
  `).run(Date.now() - 86400000, Date.now());

  db.prepare(`
    INSERT INTO conversation_members (conversation_id, user_id, joined_at, is_pinned, unread_count)
    VALUES ('conv_alex', 'usr_me', ?, 1, 0)
  `).run(Date.now());

  db.prepare(`
    INSERT INTO conversation_members (conversation_id, user_id, joined_at, is_pinned, unread_count)
    VALUES ('conv_alex', 'usr_alex', ?, 0, 0)
  `).run(Date.now());

  // Insert Messages for Alex
  const insertMsg = db.prepare(`
    INSERT INTO messages (id, conversation_id, sender_id, client_message_id, sequence_number, message_type, text_content, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertMsg.run('m_1', 'conv_alex', 'usr_alex', 'cli_seed_1', 1, 'text', "Hey Kavindu! Saw you're also deep into indie game architecture. Outer Wilds changed how I view storytelling.", Date.now() - 3600000);
  insertMsg.run('m_2', 'conv_alex', 'usr_me', 'cli_seed_2', 2, 'text', "Totally agree! That feeling of discovering orbital mechanics yourself without a tutorial is unmatched.", Date.now() - 3000000);
  insertMsg.run('m_3', 'conv_alex', 'usr_alex', 'cli_seed_3', 3, 'text', "I really loved that point you made about slow weekends.", Date.now() - 600000);

  // Add a sample reaction
  db.prepare(`
    INSERT INTO message_reactions (id, message_id, user_id, emoji, created_at)
    VALUES ('rx_1', 'm_1', 'usr_me', '🔥', ?)
  `).run(Date.now());

  // Seed Initial Sticker Categories & Packs
  seedStickerEcosystem();
}

function seedStickerEcosystem() {
  const count = db.prepare('SELECT COUNT(*) as count FROM sticker_packs').get() as { count: number };
  if (count.count > 0) return;

  // Insert categories
  const insertCat = db.prepare('INSERT INTO sticker_categories (id, name, slug, sort_order) VALUES (?, ?, ?, ?)');
  insertCat.run('cat_love', 'Love & Romance', 'love', 1);
  insertCat.run('cat_dating', 'Flirting & Chemistry', 'flirting', 2);
  insertCat.run('cat_memes', 'Memes & Reactions', 'memes', 3);
  insertCat.run('cat_luck', 'Luck & Gaming', 'luck', 4);

  // Insert Packs
  const insertPack = db.prepare(`
    INSERT INTO sticker_packs (id, name, slug, description, cover_icon, category_id, sticker_count, creator_name, is_official, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?)
  `);

  insertPack.run(
    'pack_romantic_rose',
    'Romantic Rose & Vows',
    'romantic-rose',
    'Affectionate stickers for romantic chemistry and late night talks.',
    '🌹',
    'cat_love',
    6,
    'FRIENDS Studio',
    Date.now()
  );

  insertPack.run(
    'pack_luck_casino',
    'Telegram Luck & Dice',
    'luck-casino',
    'Animated luck stickers with interactive dice, casino slots, and flipping coins.',
    '🎰',
    'cat_luck',
    6,
    'Telegram Org Inspired',
    Date.now()
  );

  insertPack.run(
    'pack_flirty_vibes',
    'Flirty Whispers',
    'flirty-vibes',
    'Playful and teasing expressions for your matches.',
    '✨',
    'cat_dating',
    6,
    'FRIENDS Studio',
    Date.now()
  );

  // Insert Stickers for Romantic Rose
  const insertSticker = db.prepare(`
    INSERT INTO stickers (id, pack_id, asset_url, emoji_association, keywords, sort_order, is_animated, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertSticker.run('stk_rose_1', 'pack_romantic_rose', 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=200&q=80', '🌹', 'rose flower love romance', 1, 0, Date.now());
  insertSticker.run('stk_rose_2', 'pack_romantic_rose', 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=200&q=80', '❤️', 'heart love soulmate', 2, 1, Date.now());
  insertSticker.run('stk_rose_3', 'pack_romantic_rose', 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=200&q=80', '💌', 'love letter kiss note', 3, 0, Date.now());
  insertSticker.run('stk_rose_4', 'pack_romantic_rose', 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=200&q=80', '🥰', 'hug sweet cherish', 4, 1, Date.now());

  // Insert Stickers for Luck Casino
  insertSticker.run('stk_luck_1', 'pack_luck_casino', 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=200&q=80', '🎲', 'dice luck roll random 3d', 1, 1, Date.now());
  insertSticker.run('stk_luck_2', 'pack_luck_casino', 'https://images.unsplash.com/photo-1596838132731-3301c3fd4317?auto=format&fit=crop&w=200&q=80', '🎰', 'slot machine casino jackpot 777', 2, 1, Date.now());
  insertSticker.run('stk_luck_3', 'pack_luck_casino', 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=200&q=80', '🪙', 'coin flip heads tails eagle', 3, 1, Date.now());

  // Auto-install default packs for usr_me
  db.prepare('INSERT OR IGNORE INTO user_sticker_packs (user_id, pack_id, installed_at, sort_order) VALUES (?, ?, ?, ?)').run('usr_me', 'pack_romantic_rose', Date.now(), 1);
  db.prepare('INSERT OR IGNORE INTO user_sticker_packs (user_id, pack_id, installed_at, sort_order) VALUES (?, ?, ?, ?)').run('usr_me', 'pack_luck_casino', Date.now(), 2);
}

function seedLivingIdentityProfiles() {
  const count = db.prepare('SELECT COUNT(*) as count FROM profile_sections').get() as { count: number };
  if (count.count > 0) return;

  const now = Date.now();

  // 1. Establish Match relationship between usr_me and usr_alex
  db.prepare(`
    INSERT OR IGNORE INTO user_relationships (user_id, target_user_id, relationship_type, created_at)
    VALUES (?, ?, ?, ?)
  `).run('usr_me', 'usr_alex', 'match', now);
  db.prepare(`
    INSERT OR IGNORE INTO user_relationships (user_id, target_user_id, relationship_type, created_at)
    VALUES (?, ?, ?, ?)
  `).run('usr_alex', 'usr_me', 'match', now);

  // 2. Sections for usr_me
  const insertSec = db.prepare(`
    INSERT INTO profile_sections (id, user_id, title, description, section_type, icon, sort_order, visibility, is_pinned, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertSec.run('sec_philosophy', 'usr_me', 'Personal Philosophy & Worldview', 'Core operating principles, ethics, and views on slow living.', 'beliefs', '🧭', 1, 'public', 1, now, now);
  insertSec.run('sec_contradictions', 'usr_me', 'Personality Contradictions & Habits', 'The strange quirks, paradoxes, and routines that make me human.', 'personality', '⚡', 2, 'public', 0, now, now);
  insertSec.run('sec_psychology', 'usr_me', 'Psychological Patterns & Emotional Life', 'How I handle stress, conflict, and emotional intimacy.', 'psychology', '🧠', 3, 'matches', 0, now, now);
  insertSec.run('sec_private_journal', 'usr_me', 'Private Journal & Raw Musings', 'Vulnerable unpolished entries reserved strictly for myself.', 'custom', '🔒', 4, 'private', 0, now, now);

  // 3. Entries for usr_me
  const insertEntry = db.prepare(`
    INSERT INTO profile_entries (id, section_id, user_id, entry_type, title, content, structured_content, visibility, sort_order, is_pinned, status, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertEntry.run(
    'ent_phil_1', 'sec_philosophy', 'usr_me', 'text', 'On Intellectual Humility',
    'I find it far more attractive when someone can say "I don’t know enough about this yet" than someone with a rehearsed opinion on every headline. Curiosity is quiet; certainty is loud.',
    null, 'public', 1, 1, 'published', now, now
  );

  insertEntry.run(
    'ent_phil_2', 'sec_philosophy', 'usr_me', 'text', 'Digital Minimalism & Slow Connection',
    'All my non-emergency notifications are permanently off. I would rather have a three-hour conversation over tea once every two weeks than exchange superficial text messages every ten minutes all day.',
    null, 'public', 2, 0, 'published', now, now
  );

  insertEntry.run(
    'ent_contra_1', 'sec_contradictions', 'usr_me', 'text', 'The Introverted Host Paradox',
    'I adore cooking for six friends, curating the playlist, and hosting until midnight. But the moment the door closes, I need a full day of reading in absolute silence to feel human again.',
    null, 'public', 1, 0, 'published', now, now
  );

  insertEntry.run(
    'ent_contra_2', 'sec_contradictions', 'usr_me', 'list', 'My Personal Green & Red Flags',
    'Things that instantly earn my respect or raise my guard.',
    JSON.stringify({
      green_flags: ['Reads books for genuine pleasure', 'Can comfortably sit in silence without panic', 'Laughs at their own mistakes without defensiveness'],
      red_flags: ['Cynicism masquerading as intellectual superiority', 'Inability to ever apologize', 'Checking their phone mid-sentence']
    }),
    'public', 2, 0, 'published', now, now
  );

  insertEntry.run(
    'ent_psych_1', 'sec_psychology', 'usr_me', 'reflection', 'Conflict & Emotional Decompression',
    'When conflict happens, my instinct is to retreat and process logic before emotions. I never shout, but I can withdraw. If someone gently asks "Tell me what you are feeling right now", my defenses drop immediately.',
    null, 'matches', 1, 0, 'published', now, now
  );

  insertEntry.run(
    'ent_priv_1', 'sec_private_journal', 'usr_me', 'thought', 'Private Insecurities Note',
    'Sometimes I worry that my self-reliance comes across as emotional distance, when it is really just self-protection.',
    null, 'private', 1, 0, 'draft', now, now
  );

  // 4. Questions & Answers for usr_me
  const insertQ = db.prepare(`
    INSERT INTO profile_questions (id, user_id, section_id, question, description, answer_type, options, visibility, allow_responses, sort_order, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertQ.run('q_misunderstood', 'usr_me', 'sec_contradictions', 'What is something people frequently misunderstand about you?', 'First impressions vs reality', 'long_text', null, 'public', 1, 1, now, now);
  insertQ.run('q_boundary', 'usr_me', 'sec_philosophy', 'What is a personal boundary you will never compromise on?', 'Relationship expectations', 'long_text', null, 'public', 0, 2, now, now);
  insertQ.run('q_vulnerability', 'usr_me', 'sec_psychology', 'What is a quiet vulnerability you rarely disclose?', 'Deep intimacy', 'long_text', null, 'matches', 0, 3, now, now);

  const insertAns = db.prepare(`
    INSERT INTO profile_answers (id, question_id, user_id, answer_content, structured_answer, visibility, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertAns.run('ans_misunderstood', 'q_misunderstood', 'usr_me', 'People sometimes think my quietness in large groups means I am distant or judgmental. In reality, I am just observing and listening carefully.', null, 'public', now, now);
  insertAns.run('ans_boundary', 'q_boundary', 'usr_me', 'Emotional safety. Being able to be tired, awkward, or unpolished without fearing that someone is keeping score or mocking me.', null, 'public', now, now);
  insertAns.run('ans_vulnerability', 'q_vulnerability', 'usr_me', 'I worry that being deeply competent makes people feel like I will never need their care or warmth.', null, 'matches', now, now);

  // 5. Timeline Events for usr_me
  const insertTimeline = db.prepare(`
    INSERT INTO profile_timeline_events (id, user_id, title, description, event_date, date_precision, category, personal_significance, lessons_learned, visibility, sort_order, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertTimeline.run(
    'time_1', 'usr_me', 'Wrote My First 2D Physics Simulator',
    'Spent three months building gravity and collision solvers from scratch late at night.',
    '2019', 'year', 'milestone',
    'Showed me that understanding first principles is more rewarding than using black-box libraries.',
    'Complexity is just simple rules layered with patience.',
    'public', 1, now, now
  );

  insertTimeline.run(
    'time_2', 'usr_me', 'Solitary Mountain Range Backpacking',
    'Hiked 38 kilometers over 3 days across cloud forests with zero cellular connectivity.',
    'Summer 2022', 'approximate', 'travel',
    'Proved to myself that solitude is fertile, not empty.',
    'Boredom is where imagination restarts.',
    'public', 2, now, now
  );

  insertTimeline.run(
    'time_3', 'usr_me', 'Stepped Away from Corporate Consulting',
    'Resigned from enterprise management consulting to build high-craft creative tools.',
    'Early 2024', 'year_month', 'achievement',
    'Redefined what success feels like: autonomy over prestige.',
    'Never trade your waking creative hours for a title.',
    'public', 3, now, now
  );

  // 6. Thoughts & Personal Writing for usr_me
  const insertThought = db.prepare(`
    INSERT INTO profile_thoughts (id, user_id, title, content, thought_type, tags, is_pinned, status, visibility, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertThought.run(
    'tht_1', 'usr_me', 'High-Fidelity Correspondence',
    'Why slow correspondence is higher fidelity than instant texting: when you reply in seconds, you are sending a reaction. When you wait two days and write three thoughtful paragraphs, you are sending a piece of your consciousness.',
    'essay', 'communication,depth,philosophy', 1, 'published', 'public', now - 86400000, now
  );

  insertThought.run(
    'tht_2', 'usr_me', 'Dating Is Not an Audition',
    'The tragedy of treating modern dating as a job interview is that both people leave exhausted having performed their "optimized LinkedIn self" rather than discovering if they actually like laughing together over burnt toast.',
    'opinion', 'dating,authenticity,modern_life', 0, 'published', 'public', now - 43200000, now
  );

  insertThought.run(
    'tht_3', 'usr_me', 'Draft: On Letting Go of Perfectionism',
    'Private draft note: perfectionism is not high standards; it is terror of criticism wearing a respectable mask.',
    'reflection', 'psychology,inner_work', 0, 'draft', 'private', now, now
  );

  // 7. Seed Alex Rivera (usr_alex) with their own living profile
  insertSec.run('sec_alex_1', 'usr_alex', 'Art, Architecture & Game Craft', 'How interactive worlds and space design shape human emotion.', 'interests', '🎨', 1, 'public', 1, now, now);
  insertEntry.run(
    'ent_alex_1', 'sec_alex_1', 'usr_alex', 'text', 'Why Outer Wilds is Masterpiece Storytelling',
    'Games that trust the player curiosity without waypoint arrows are the pinnacle of art. Knowledge itself is the only progression mechanic you truly need.',
    null, 'public', 1, 1, 'published', now, now
  );
  insertQ.run('q_alex_1', 'usr_alex', 'sec_alex_1', 'What is your favorite kind of evening?', 'Atmosphere and vibe', 'short_text', null, 'public', 1, 1, now, now);
  insertAns.run('ans_alex_1', 'q_alex_1', 'usr_alex', 'Dim warm lamps, ambient vinyl playing, sketching game architectures while discussing philosophy.', null, 'public', now, now);
}

function seedLifeTimeline() {
  const count = db.prepare('SELECT COUNT(*) as count FROM life_years').get() as { count: number };
  if (count.count > 0) return;

  const now = Date.now();

  // 1. Multi-Year Chapters
  const insertChap = db.prepare(`
    INSERT INTO life_chapters (id, user_id, title, description, start_year, end_year, icon, visibility, sort_order, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertChap.run('chap_uni', 'usr_me', 'University & Systems Foundations', 'Studying computer systems, operating systems, late night hardware labs, and discovering classical philosophy.', 2015, 2019, '🎓', 'public', 1, now, now);
  insertChap.run('chap_corp', 'usr_me', 'The High-Stakes Corporate Grind', 'Consulting across enterprise infrastructure. Learned high performance but grew tired of performative status.', 2019, 2023, '💼', 'public', 2, now, now);
  insertChap.run('chap_creative', 'usr_me', 'Autonomous Craft & Slow Living', 'Building artisanal software, writing essays, restoring synthesizers, and intentional living.', 2024, null, '🌿', 'public', 3, now, now);

  // 2. Life Years
  const insertYear = db.prepare(`
    INSERT INTO life_years (id, user_id, year_number, chapter_title, summary, cover_image_url, is_future_year, visibility, sort_order, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertYear.run(
    'yr_me_2019', 'usr_me', 2019, 'The Year Code Became Physics',
    'Graduated university and wrote my first complete 2D rigid-body physics simulator. Started first job.',
    'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80',
    0, 'public', 1, now, now
  );

  insertYear.run(
    'yr_me_2021', 'usr_me', 2021, 'Isolation & 48 Books',
    'A year of enforced solitude. Read deeply in ecology, Stoicism, and Eastern philosophy. Adopted Milo the cat.',
    'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=600&q=80',
    0, 'public', 2, now, now
  );

  insertYear.run(
    'yr_me_2022', 'usr_me', 2022, 'Cloud Forests & Mountain Solitude',
    'Pivoted to wilderness backpacking. Solitary multi-day hikes across Knuckles Mountain Range.',
    'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80',
    0, 'public', 3, now, now
  );

  insertYear.run(
    'yr_me_2024', 'usr_me', 2024, 'The Great Resignation & Freedom',
    'Walked away from corporate security to reclaim creative autonomy. Rebuilt my relationship with time.',
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80',
    0, 'public', 4, now, now
  );

  insertYear.run(
    'yr_me_2026', 'usr_me', 2026, 'Tangible Artifacts & True Companionship',
    'Plans for physical book publication and opening my heart to a grounded, emotionally safe relationship.',
    'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80',
    1, 'public', 5, now, now
  );

  // 3. Life Events
  const insertEvent = db.prepare(`
    INSERT INTO life_events (id, user_id, year_number, chapter_id, title, description, date_display, date_precision, is_planned, is_milestone, category, tags, location, people_involved, personal_significance, lessons_learned, emotional_reflection, visibility, sort_order, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertEvent.run(
    'evt_2019_1', 'usr_me', 2019, 'chap_uni',
    'Wrote Custom Physics Simulator',
    'Built impulse-based 2D rigid-body physics simulator from scratch in C++.',
    'March 15, 2019', 'exact', 0, 1, 'Creative projects',
    'physics,coding,game_dev', 'Colombo', null,
    'Taught me that first principles will always beat copying frameworks.',
    'Complexity is just simple rules layered with patience.',
    'Pure joy when the first circle bounced realistically off a polygon.',
    'public', 1, now, now
  );

  insertEvent.run(
    'evt_2019_2', 'usr_me', 2019, 'chap_uni',
    'Graduated with First Class Honors',
    'Concluded undergraduate degree in Computer Systems Engineering.',
    'July 2019', 'month_year', 0, 1, 'Education',
    'graduation,university', 'University Hall', 'Parents & Close Friends',
    'Made my parents deeply proud after years of hard work.',
    'Degrees open doors; curiosity keeps them open.',
    'Relief mixed with quiet anticipation.',
    'public', 2, now, now
  );

  insertEvent.run(
    'evt_2021_1', 'usr_me', 2021, 'chap_corp',
    'Adopted Milo the Stray Kitten',
    'Found a drenched orange kitten crying under a porch in rainy season and brought him in.',
    'October 4, 2021', 'exact', 0, 0, 'Family',
    'pets,milo,home', 'Home', null,
    'Caring for a helpless creature grounded my high-stress work life.',
    'Affection doesn’t require performance.',
    'Warmth and quiet companionship during lockdowns.',
    'public', 1, now, now
  );

  insertEvent.run(
    'evt_2022_1', 'usr_me', 2022, 'chap_corp',
    'Solitary Knuckles Mountain Expedition',
    'Hiked 38 kilometers over 3 days across cloud forests alone with no cell reception.',
    'August 14, 2022', 'exact', 0, 1, 'Travel and places',
    'hiking,wilderness,solitude', 'Knuckles Range', null,
    'Proved to myself that my own company is peaceful and safe.',
    'Silence restores the nervous system far faster than any vacation.',
    'Waking up above the cloud deck at 1800 meters was transcendent.',
    'public', 1, now, now
  );

  insertEvent.run(
    'evt_2022_priv', 'usr_me', 2022, 'chap_corp',
    'Private Emotional Breakthrough on Burnout',
    'Sat on my balcony at 2am and realized my corporate status was an emotional defense mechanism.',
    'November 2022', 'month_year', 0, 0, 'Psychological and emotional experiences',
    'burnout,inner_work', 'Home', null,
    'The turning point where I began planning my departure from corporate life.',
    'Prestige is what other people want for you; peace is what you want for yourself.',
    'Terrifying yet liberating clarity.',
    'private', 2, now, now
  );

  insertEvent.run(
    'evt_2024_1', 'usr_me', 2024, 'chap_creative',
    'Handed in Resignation & Stepped into Independence',
    'Gave three months notice and transitioned to building independent high-craft software.',
    'February 1, 2024', 'exact', 0, 1, 'Career and business',
    'freedom,entrepreneurship', 'Colombo', null,
    'The most courageous professional decision I have ever made.',
    'Never trade your waking creative hours for a title.',
    'Pure lightness of breath the day my laptop access ended.',
    'public', 1, now, now
  );

  insertEvent.run(
    'evt_2026_plan_1', 'usr_me', 2026, 'chap_creative',
    'Publish Hardcover Book of Essays on Digital Humanity',
    'Targeting 150-page curated physical book printed on high-weight cotton paper.',
    'Autumn 2026', 'approximate', 1, 1, 'Creative projects',
    'book,writing,publishing', 'Independent Press', null,
    'Making something tangible that will outlive fleeting digital servers.',
    'Ideas deserve physical permanence.',
    'Excited and focused dedication.',
    'public', 1, now, now
  );

  // 4. Annual Year-End Review 2022
  const insertReflection = db.prepare(`
    INSERT INTO life_reflections (id, user_id, reflection_type, year_number, compare_year_a, compare_year_b, title, content_json, visibility, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertReflection.run(
    'rev_2022', 'usr_me', 'year_end_review', 2022, null, null,
    '2022 Annual Review: The Mountain Year',
    JSON.stringify({
      best_memory: 'Watching sunrise above the cloud layer at 1800m on Knuckles Ridge.',
      biggest_achievement: 'Learned wilderness orienteering and off-trail navigation.',
      biggest_mistake: 'Staying in a high-friction client engagement three months too long.',
      most_important_person: 'My sister for reminding me to laugh when work felt suffocating.',
      biggest_lesson: 'Silence restores the nervous system; busyness is a distraction.',
      favorite_discovery: 'The writing of J. Krishnamurti and artisanal mechanical watches.',
      what_changed_about_me: 'Stopped feeling the need to win every debate.',
      message_to_future_self: 'Never let money talk you out of your autonomy.'
    }),
    'public', now, now
  );

  // 5. "Then vs Now" Comparison (2018 vs 2024)
  insertReflection.run(
    'comp_2018_2024', 'usr_me', 'then_vs_now', null, 2018, 2024,
    'Six Years of Transformation: From Performative Hustle to Quiet Depth',
    JSON.stringify({
      personality: {
        then: 'Hyper-verbal, eager to impress every room, anxious about being seen as unremarkable.',
        now: 'Quiet, observant, completely at ease with long silences and unexpressed opinions.'
      },
      values: {
        then: 'External prestige, startup hype, job titles, and exhausting networking events.',
        now: 'Uninterrupted time, physical health, honest friendships, and creative autonomy.'
      },
      habits: {
        then: 'Phone screen on until 1am, coffee-fueled 14-hour sprints, erratic sleep.',
        now: 'Screen curfew at 9:30pm, daily mountain tea, morning walks, reading in print.'
      },
      relationships: {
        then: 'Hoarded 50 shallow acquaintances, constantly texting superficial updates.',
        now: 'Invest deeply in 3 lifelong friends; prefer 3-hour dinners over 100 texts.'
      },
      self_reflection: 'In 2018 I wanted to be extraordinary to everyone else. In 2024 I just want to be authentic to myself.'
    }),
    'public', now, now
  );
}

function seedProfileMarkdowns() {
  const count = db.prepare('SELECT COUNT(*) as count FROM profile_markdowns').get() as { count: number };
  if (count.count > 0) return;

  const insertMarkdown = db.prepare(`
    INSERT INTO profile_markdowns (id, user_id, title, content, visibility, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const now = Date.now();

  const kavinduMarkdown = `# 🚀 Kavindu Senanayake / README.md

> *"Simplicity is prerequisite for reliability."* — Edsger W. Dijkstra  
> Building high-craft systems, quiet architectures, and meaningful connections.

---

### 🧭 About Me & Core Philosophy

I am a software engineer and distributed systems craftsperson based in Colombo. After half a decade leading engineering in fast-paced corporate environments, I stepped away to build independent tools with soul, depth, and aesthetic precision.

- **Obsessions:** Local-first software, SQLite WAL internals, mechanical watch movements, specialty Ceylon black tea, and high-altitude mountain trails.
- **Values:** Creative sovereignty, radical honesty, quiet depth over loud superficiality.
- **Communication Style:** Direct, thoughtful, unhurried. I prefer a 3-hour fireside conversation over 300 fleeting instant messages.

---

### ⚡ 2026 Focus & Life Checklists

- [x] Resign from corporate executive track and reclaim autonomy
- [x] Design local-first encrypted messaging system with sub-millisecond sync
- [x] Complete solo unsupported trek across the Central Highlands
- [ ] Publish 150-page curated physical book on *Digital Humanity & Intimacy*
- [ ] Restore a 1970s mechanical column-wheel chronograph by hand
- [ ] Spend one full month off-grid in an alpine cabin without cellular signal

---

### 📊 Current Hyperfixations & Preferences

| Domain | What I Love | What Drains Me |
| :--- | :--- | :--- |
| **Technology** | Local-first, zero-dependency, C & TypeScript | Over-engineered cloud microservices |
| **Conversations** | Insecurities, creative obsessions, worldviews | Small talk, networking, corporate buzzwords |
| **Weekend Rituals** | 6:00 AM pour-over coffee, 15km mountain trail run | Crowded nightclubs and loud cocktail parties |
| **Aesthetic** | Velvet wine, hot magenta smoke, tactile paper | Sterile corporate flat gray minimalism |

---

### 💻 Human Connection Interface

\`\`\`typescript
interface ConnectionProtocol {
  user: "Kavindu";
  currentStatus: "Deep creative flow & seeking thoughtful minds";
  compatibleWith: [
    "Independent thinkers who question defaults",
    "People who create things with their hands",
    "Night owls who appreciate 2:00 AM philosophical debates"
  ];
  handshakeRule: "Skip the resume — tell me what kept you awake with wonder recently.";
}
\`\`\`

---

### 📬 Rules of Engagement

1. **Be unashamedly yourself:** Tell me your weirdest hyperfixation, not your LinkedIn pitch.
2. **Asynchronous respect:** I don't expect instant replies, and I take time to compose thoughtful responses.
3. **Real-world permanence:** If we resonate, let's grab coffee or walk a botanical garden in the morning light.
`;

  insertMarkdown.run(
    'md_me',
    'usr_me',
    'README.md',
    kavinduMarkdown.trim(),
    'public',
    now,
    now
  );

  const alexMarkdown = `# 🎨 Alex Rivera / README.md

> *"Color is a power which directly influences the soul."* — Wassily Kandinsky

---

### ✨ Visual Artist & Digital Creator

Hey there! I explore the boundary between brutalist graphic design and warm human emotions. Currently painting large-scale acrylics and designing human-first interfaces.

### 🎯 Things on My Mind:
- [x] Set up studio in the arts district
- [x] Launch collaborative print series with local poets
- [ ] Build interactive web experience for generative poetry
- [ ] Learn analog darkroom print developing

\`\`\`css
.vibe {
  warmth: 100%;
  aesthetic: 'retro-futurism';
  coffeeConsumption: '3 cups minimum';
}
\`\`\`
`;

  insertMarkdown.run(
    'md_alex',
    'usr_alex',
    'README.md',
    alexMarkdown.trim(),
    'public',
    now,
    now
  );
}

function seedProfileWorlds() {
  const count = db.prepare('SELECT COUNT(*) as count FROM profile_worlds').get() as { count: number };
  if (count.count > 0) return;

  const insertWorld = db.prepare(`
    INSERT INTO profile_worlds (
      id, user_id, name, slug, description, world_type, cover_image_url, avatar_url,
      theme_config, layout_type, ambient_sound_url, visibility, status, is_default, sort_order, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertSection = db.prepare(`
    INSERT INTO profile_world_sections (
      id, world_id, parent_section_id, title, description, section_type, icon, visibility, sort_order, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertEntry = db.prepare(`
    INSERT INTO profile_world_entries (
      id, world_id, section_id, user_id, entry_type, title, content, structured_content,
      reality_classification, visibility, status, sort_order, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const now = Date.now();

  // ==========================================================================
  // WORLD 1: REAL LIFE ("The Architect's Journal") - Default Public World
  // ==========================================================================
  insertWorld.run(
    'wld_real_kavindu',
    'usr_me',
    "The Architect's Journal",
    'real-life',
    'Ground truth biography, engineering craft, high-altitude mountain runs, and quiet Ceylon tea rituals.',
    'real_life',
    'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    JSON.stringify({
      theme: 'velvet_wine',
      primaryColor: '#FF0D69',
      ambientGlow: 'rgba(255, 13, 105, 0.25)',
      fontPreset: 'editorial_sans',
      layoutStyle: 'editorial'
    }),
    'editorial',
    null,
    'public',
    'published',
    1,
    1,
    now,
    now
  );

  insertSection.run('sec_real_1', 'wld_real_kavindu', null, 'Biographical Grounding', 'True facts, roots, and daily discipline', 'biography', '🧭', 'public', 1, now, now);
  insertSection.run('sec_real_2', 'wld_real_kavindu', null, 'Physical Rituals & Wilderness', 'How I spend physical waking hours outside the terminal', 'lifestyle', '🏔️', 'public', 2, now, now);

  insertEntry.run(
    'ent_real_1', 'wld_real_kavindu', 'sec_real_1', 'usr_me', 'markdown',
    'Distributed Systems Craftsperson',
    `# 💻 Distributed Systems Architecture\n\nI build local-first software systems designed to outlive corporate clouds. My technical focus centers on SQLite WAL concurrency, conflict-free replicated data types, and deterministic synchronization protocols.`,
    JSON.stringify({ yearsExperience: 7, focus: 'Local-first architecture' }),
    'actual', 'public', 'published', 1, now, now
  );

  insertEntry.run(
    'ent_real_2', 'wld_real_kavindu', 'sec_real_2', 'usr_me', 'markdown',
    'Mountain Trail Running & Ceylon Black Tea',
    `> *"The mountains are not calling — they are waiting with complete indifference."*\n\nEvery Saturday morning begins at 5:30 AM with a 15km mountain run up the Knuckles Range, followed by single-estate whole leaf black tea steeped in a porcelain gaiwan.`,
    JSON.stringify({ altitudePeak: '1850m', favoriteTea: 'Nuwara Eliya High Grown Pekoe' }),
    'current', 'public', 'published', 1, now, now
  );

  // ==========================================================================
  // WORLD 2: CINEMATIC LIFE ("Neon Monolith: Act I") - Stylized Noir World
  // ==========================================================================
  insertWorld.run(
    'wld_cine_kavindu',
    'usr_me',
    'Neon Monolith: Act I',
    'cinematic-life',
    'My life rendered as an atmospheric 1980s neo-noir film. Rain on skyscraper glass, solitary midnight drives, and the quest for signal amidst noise.',
    'cinematic_life',
    'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    JSON.stringify({
      theme: 'neo_noir',
      primaryColor: '#FF3B88',
      ambientGlow: 'rgba(255, 59, 136, 0.35)',
      fontPreset: 'cinematic_serif',
      layoutStyle: 'cinematic'
    }),
    'cinematic',
    'https://example.com/audio/synthwave-ambient.mp3',
    'public',
    'published',
    0,
    2,
    now,
    now
  );

  insertSection.run('sec_cine_1', 'wld_cine_kavindu', null, 'The Protagonist Profile', 'Character archetype, soundtrack, and aesthetic palette', 'character', '🎬', 'public', 1, now, now);
  insertSection.run('sec_cine_2', 'wld_cine_kavindu', null, 'Defining Dramatic Scenes', 'Pivotal narrative moments framed with cinematic lighting', 'scenes', '🎞️', 'public', 2, now, now);

  insertEntry.run(
    'ent_cine_1', 'wld_cine_kavindu', 'sec_cine_1', 'usr_me', 'markdown',
    'Character Archetype: The Reluctant Architect',
    `### 🎬 Protagonist Dossier\n\n- **Role:** An engineer who designed the city\'s communication grid, then severed his own access to preserve his soul.\n- **Theme Track:** *Kavinsky — Nightcall* / *Vangelis — Tears in Rain*\n- **Flaw:** Convinces himself he is impervious to loneliness.\n- **Signature Prop:** A mechanical titanium watch that ticks audibly in silent rooms.`,
    JSON.stringify({ soundtrack: 'Nightcall', directorVision: 'Denis Villeneuve meets Wong Kar-wai' }),
    'cinematic', 'public', 'published', 1, now, now
  );

  insertEntry.run(
    'ent_cine_2', 'wld_cine_kavindu', 'sec_cine_2', 'usr_me', 'markdown',
    'Scene 1: Midnight on the 24th Floor (The Severance)',
    `The glass reflects a blurry tangle of city lights below. Rain streaks diagonally across the double-pane windows. The protagonist types \`sudo rm -rf /corp/auth/*\`, closes the metallic lid of his laptop, takes a sip of lukewarm black coffee, and walks into the elevator without looking back.\n\n> **Narration (Voiceover):** *"They tell you loyalty is a virtue. They just forget to mention who collects the dividends."*`,
    JSON.stringify({ lighting: 'Fluorescent green fading to hot magenta neon', camera: 'Slow tracking dolly shot' }),
    'cinematic', 'public', 'published', 1, now, now
  );

  // ==========================================================================
  // WORLD 3: INNER WORLD ("Sanctuary of Silent Thoughts") - Matches Only World
  // ==========================================================================
  insertWorld.run(
    'wld_inner_kavindu',
    'usr_me',
    'Sanctuary of Silent Thoughts',
    'inner-world',
    'Unfiltered psychological patterns, emotional contradictions, quiet fears, and private philosophies.',
    'inner_world',
    'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    JSON.stringify({
      theme: 'deep_amethyst',
      primaryColor: '#A855F7',
      ambientGlow: 'rgba(168, 85, 247, 0.25)',
      fontPreset: 'intimate_mono',
      layoutStyle: 'scrapbook'
    }),
    'scrapbook',
    null,
    'matches', // Restricted to mutual matches and friends!
    'published',
    0,
    3,
    now,
    now
  );

  insertSection.run('sec_inner_1', 'wld_inner_kavindu', null, 'Paradoxes & Emotional Realities', 'The contradictions that define my internal climate', 'psychology', '🌌', 'matches', 1, now, now);

  insertEntry.run(
    'ent_inner_1', 'wld_inner_kavindu', 'sec_inner_1', 'usr_me', 'markdown',
    'The Hyper-Sociable Hermit Paradox',
    `I can hold a room of fifty people with deep charm, energy, and genuine curiosity for four hours straight. But the emotional bill arrives forty-eight hours later, requiring three days of absolute silence in a darkened room where the only voice I hear is the whistling kettle.\n\n*People confuse interpersonal skill with extraversion. One is a capability; the other is a battery source.*`,
    JSON.stringify({ energyCost: 'High', rechargeMethod: 'Total solitary seclusion' }),
    'actual', 'matches', 'published', 1, now, now
  );

  // ==========================================================================
  // WORLD 4: FUTURE SELF ("The 2030 Sovereign Horizon") - Future Plans World
  // ==========================================================================
  insertWorld.run(
    'wld_future_kavindu',
    'usr_me',
    'The 2030 Sovereign Horizon',
    'future-self',
    'Aspirations, ten-year architectural vision, off-grid physical workshop, and physical print publishing.',
    'future_self',
    'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    JSON.stringify({
      theme: 'future_horizon',
      primaryColor: '#F59E0B',
      ambientGlow: 'rgba(245, 158, 11, 0.25)',
      fontPreset: 'minimal_clean',
      layoutStyle: 'timeline'
    }),
    'timeline',
    null,
    'public',
    'published',
    0,
    4,
    now,
    now
  );

  insertSection.run('sec_fut_1', 'wld_future_kavindu', null, 'Ten-Year Manifestos', 'The concrete life I am engineering day by day', 'future_goals', '🚀', 'public', 1, now, now);

  insertEntry.run(
    'ent_fut_1', 'wld_future_kavindu', 'sec_fut_1', 'usr_me', 'markdown',
    'Off-Grid Alpine Hardware Workshop & Library',
    `### 🏔️ Target: Autumn 2030\n\nA self-sustaining timber and glass studio perched on the southern ridge of the Central Province. Solar-powered, fed by mountain spring water, housing a 2,000-volume physical library and an artisanal electronics repair bench.\n\n- [ ] Zero commercial debt\n- [ ] 100% independent recurring software royalties\n- [ ] Daily schedule dictated entirely by solar sunrise and personal curiosity`,
    JSON.stringify({ timelineYear: 2030, certainty: 'Aspirational commitment' }),
    'aspirational', 'public', 'published', 1, now, now
  );

  // ==========================================================================
  // WORLD 5: FANTASY UNIVERSE ("The Aethelgard Clockwork Spire") - Fictional World
  // ==========================================================================
  insertWorld.run(
    'wld_fantasy_kavindu',
    'usr_me',
    'The Aethelgard Clockwork Spire',
    'fantasy-universe',
    'An original fictional universe: A floating basalt archipelago driven by geothermal brass clockwork and resonant quartz glyphs.',
    'fantasy_universe',
    'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    JSON.stringify({
      theme: 'mythic_fantasy',
      primaryColor: '#10B981',
      ambientGlow: 'rgba(16, 185, 129, 0.25)',
      fontPreset: 'fantasy_serif',
      layoutStyle: 'fantasy_world'
    }),
    'fantasy_world',
    null,
    'public',
    'published',
    0,
    5,
    now,
    now
  );

  insertSection.run('sec_fan_1', 'wld_fantasy_kavindu', null, 'World Lore & Mechanical Ley-Lines', 'Geography, guild politics, and resonant energy', 'lore', '🗺️', 'public', 1, now, now);

  insertEntry.run(
    'ent_fan_1', 'wld_fantasy_kavindu', 'sec_fan_1', 'usr_me', 'markdown',
    'The Great Escapement of Mount Morvath',
    `> *"When the central pendulum ceases its sway, the sky will forget which way is down."*\n\nThe central island of Aethelgard is suspended not by divine will, but by a kilometer-wide brass pendulum suspended inside the hollow heart of an extinct volcano. Every twelve hours, the Guild of Horologists must calibrate the counterweights with quartz oil.`,
    JSON.stringify({ magicSystem: 'Resonant quartz & horological mechanics', factions: ['Guild of Horologists', 'The Basalt Scribes'] }),
    'fictional', 'public', 'published', 1, now, now
  );

  // Cross-world entry relation:
  // "Distributed Systems Craftsperson" (Real Life) is referenced in "Neon Monolith" (Cinematic Life)
  const insertRelation = db.prepare(`
    INSERT INTO profile_world_entry_relations (id, source_world_id, source_entry_id, target_world_id, relation_type, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  insertRelation.run('rel_1', 'wld_real_kavindu', 'ent_real_1', 'wld_cine_kavindu', 'creative_adaptation', now);
}

function seedDailyConnectionContent() {
  const count = db.prepare('SELECT COUNT(*) as c FROM daily_content_categories').get() as { c: number };
  if (count && count.c > 0) return;

  const now = Date.now();

  // 1. Seed 15 Content Categories across the 4 Permanent Tabs
  const insertCategory = db.prepare(`
    INSERT INTO daily_content_categories (id, name, tab, icon, description, ambient_color)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const categories = [
    // Tab: Love
    { id: 'cat_love', name: 'Love & Affection', tab: 'love', icon: '❤️', description: 'Love, affection, commitment and romance', ambient_color: '#85283C' },
    { id: 'cat_relationships', name: 'Relationship Growth', tab: 'love', icon: '💑', description: 'Understanding partners and shared relationship growth', ambient_color: '#461829' },
    { id: 'cat_romance', name: 'Romantic Intimacy', tab: 'love', icon: '💌', description: 'Romantic gestures and deep emotional intimacy', ambient_color: '#85283C' },
    { id: 'cat_long_term_love', name: 'Long-Term Love', tab: 'love', icon: '🏡', description: 'Commitment, marriage and shared futures', ambient_color: '#79502D' },
    { id: 'cat_attraction', name: 'Attraction & Chemistry', tab: 'love', icon: '🔥', description: 'Compatibility, chemistry and romantic connection', ambient_color: '#85283C' },

    // Tab: Friendship
    { id: 'cat_friendship', name: 'Meaningful Friendship', tab: 'friendship', icon: '🫂', description: 'Trust, loyalty and enduring friendships', ambient_color: '#203D62' },
    { id: 'cat_communication', name: 'Conscious Communication', tab: 'friendship', icon: '💬', description: 'Listening, expressing and resolving conflict with grace', ambient_color: '#24544F' },
    { id: 'cat_human_connection', name: 'Human Empathy', tab: 'friendship', icon: '🌍', description: 'Empathy, kindness and cross-cultural understanding', ambient_color: '#203D62' },

    // Tab: Mind
    { id: 'cat_psychology', name: 'Human Psychology', tab: 'mind', icon: '🧠', description: 'Human behavior, cognitive patterns and attachment theory', ambient_color: '#49315F' },
    { id: 'cat_emotional_maturity', name: 'Emotional Maturity', tab: 'mind', icon: '🌸', description: 'Navigating difficult feelings and emotional regulation', ambient_color: '#49315F' },

    // Tab: Growth
    { id: 'cat_self_growth', name: 'Self-Growth', tab: 'growth', icon: '🌱', description: 'Becoming a wiser, more grounded human being', ambient_color: '#79502D' },
    { id: 'cat_self_worth', name: 'Self-Worth & Identity', tab: 'growth', icon: '🧍', description: 'Self-respect, independence and unshakeable identity', ambient_color: '#79502D' },
    { id: 'cat_respect', name: 'Healthy Boundaries', tab: 'growth', icon: '🤝', description: 'Boundaries, equality and reciprocal respect', ambient_color: '#24544F' },
    { id: 'cat_healing', name: 'Heartbreak & Healing', tab: 'growth', icon: '💔', description: 'Rejection, breakups, recovery and rebuilding peace', ambient_color: '#85283C' },
    { id: 'cat_motivation', name: 'Daily Resilience', tab: 'growth', icon: '✨', description: 'Hope, quiet confidence and daily encouragement', ambient_color: '#79502D' }
  ];

  for (const cat of categories) {
    insertCategory.run(cat.id, cat.name, cat.tab, cat.icon, cat.description, cat.ambient_color);
  }

  // 2. Seed Rich Content Editions
  const insertContent = db.prepare(`
    INSERT INTO daily_content (
      id, tab, category_id, format_type, title, quote_one_liner, body_insight,
      reflection_question, action_exercise, gender_audience, relationship_statuses,
      friendship_tracks, personality_tags, cover_image_url, author_or_source,
      source_type, review_status, likes_count, saves_count, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const dailyItems = [
    // ------------------------------------------------------------------------
    // TAB 1: DAILY LOVE
    // ------------------------------------------------------------------------
    {
      id: 'cnt_love_1',
      tab: 'love',
      category_id: 'cat_love',
      format_type: 'reflection',
      title: "Love & Understanding",
      quote_one_liner: "Love is not only about finding someone. It's about learning how to understand someone.",
      body_insight: "Sometimes the strongest relationships are built by people who are willing to listen, communicate, and understand each other even when circumstances become complex. Connection is not an effortless accident—it is a continuous practice of curiosity over judgment.",
      reflection_question: "Do you listen to understand someone, or do you listen just to prepare your response?",
      action_exercise: "During your next conversation today, pause for 3 seconds after the other person finishes speaking before offering your thought.",
      gender_audience: JSON.stringify(['all']),
      relationship_statuses: JSON.stringify(['single', 'looking_for_love', 'dating', 'in_relationship', 'all']),
      friendship_tracks: JSON.stringify(['all']),
      personality_tags: JSON.stringify(['empathetic', 'reflective', 'deep_thinker']),
      cover_image_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80',
      author_or_source: 'Soulverse Relationship Intelligence',
      source_type: 'curated',
      likes_count: 342,
      saves_count: 189
    },
    {
      id: 'cnt_love_men_1',
      tab: 'love',
      category_id: 'cat_emotional_maturity',
      format_type: 'advice',
      title: "Vulnerability as Strength (Men's Edition)",
      quote_one_liner: "Strength is also knowing how to communicate what hurts you without shame.",
      body_insight: "Learn to express emotional reality without treating it as weakness. True emotional maturity includes the willingness to acknowledge fatigue, admit mistakes without defensive anger, and initiate honest dialogue when unresolved tension lingers.",
      reflection_question: "What is an emotional truth you have been holding back out of fear of appearing incapable?",
      action_exercise: "Write down one unexpressed feeling in your notes app today and phrase it using 'I feel...' instead of 'You made me...'",
      gender_audience: JSON.stringify(['men', 'all']),
      relationship_statuses: JSON.stringify(['single', 'dating', 'in_relationship', 'all']),
      friendship_tracks: JSON.stringify(['all']),
      personality_tags: JSON.stringify(['introvert', 'stoic', 'growth_oriented']),
      cover_image_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=1200&q=80',
      author_or_source: 'Soulverse Emotional Development Series',
      source_type: 'curated',
      likes_count: 512,
      saves_count: 278
    },
    {
      id: 'cnt_love_women_1',
      tab: 'love',
      category_id: 'cat_self_worth',
      format_type: 'advice',
      title: "Reciprocal Respect (Women's Edition)",
      quote_one_liner: "You deserve a connection where your voice matters and never has to fight to be acknowledged.",
      body_insight: "A healthy, enduring relationship allows you to communicate boundaries, honor your individual dreams, and experience deep emotional safety without needing to audition for acceptance or dim your intellect.",
      reflection_question: "Where in your relationships have you been over-explaining your worth instead of letting your boundaries speak?",
      action_exercise: "Say a clear, gracious 'No' to a request that drains your peace today without providing a lengthy paragraph of justification.",
      gender_audience: JSON.stringify(['women', 'all']),
      relationship_statuses: JSON.stringify(['single', 'looking_for_love', 'dating', 'all']),
      friendship_tracks: JSON.stringify(['all']),
      personality_tags: JSON.stringify(['empathetic', 'ambitious', 'intuitive']),
      cover_image_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=80',
      author_or_source: 'Soulverse Identity Framework',
      source_type: 'curated',
      likes_count: 620,
      saves_count: 410
    },
    {
      id: 'cnt_love_healing_1',
      tab: 'love',
      category_id: 'cat_healing',
      format_type: 'motivation',
      title: "Rebuilding After Loss",
      quote_one_liner: "Grief after romantic ending is not failure; it is proof of your capacity to care deeply.",
      body_insight: "Healing is neither linear nor instantaneous. You do not need to rush forgiveness or force immediate optimism. Honor the season you are in: let clarity slowly replace confusion, and remember that an ending does not erase your worth.",
      reflection_question: "What part of your identity have you neglected that is asking to be nourished again?",
      action_exercise: "Do one private activity today purely for your own joy that has nothing to do with anyone else.",
      gender_audience: JSON.stringify(['all']),
      relationship_statuses: JSON.stringify(['heartbroken', 'recently_separated', 'all']),
      friendship_tracks: JSON.stringify(['all']),
      personality_tags: JSON.stringify(['healing', 'resilient']),
      cover_image_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80',
      author_or_source: 'Heart & Restoration Studies',
      source_type: 'curated',
      likes_count: 429,
      saves_count: 312
    },

    // ------------------------------------------------------------------------
    // TAB 2: DAILY FRIENDSHIP
    // ------------------------------------------------------------------------
    {
      id: 'cnt_friend_1',
      tab: 'friendship',
      category_id: 'cat_friendship',
      format_type: 'advice',
      title: "Enduring Friendship Sanctuary",
      quote_one_liner: "Real friendship does not require daily messages, but it demands sincere presence when life gets heavy.",
      body_insight: "Adult friendships fade not usually through malice, but through unspoken drift. Checking in without an agenda—just to say 'I was thinking of you and hope you are breathing easy today'—rebuilds bridges that silence quietly weakened.",
      reflection_question: "Who is a loyal friend you haven't checked on lately because life felt too busy?",
      action_exercise: "Send a 30-second sincere voice message or note to a friend today with zero expectation of an immediate reply.",
      gender_audience: JSON.stringify(['all']),
      relationship_statuses: JSON.stringify(['all']),
      friendship_tracks: JSON.stringify(['maintaining_friendships', 'deepening_friendships', 'all']),
      personality_tags: JSON.stringify(['loyal', 'warm', 'connector']),
      cover_image_url: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=80',
      author_or_source: 'Soulverse Friendship Fellowship',
      source_type: 'curated',
      likes_count: 489,
      saves_count: 240
    },
    {
      id: 'cnt_friend_comm_1',
      tab: 'friendship',
      category_id: 'cat_communication',
      format_type: 'behavior_insight',
      title: "The Art of Non-Defensive Listening",
      quote_one_liner: "Never make someone guess what you could communicate with calm honesty.",
      body_insight: "Most relational arguments occur because both parties are defending an unexpressed wound. When a friend expresses frustration, resist the urge to immediately list counter-examples of your own grievances. Validate their feeling first; address the timeline second.",
      reflection_question: "When someone shares a grievance with you, do you instinctively argue facts or listen for the underlying feeling?",
      action_exercise: "Respond with 'Help me understand what that felt like for you' before offering your side in your next disagreement.",
      gender_audience: JSON.stringify(['all']),
      relationship_statuses: JSON.stringify(['all']),
      friendship_tracks: JSON.stringify(['friendship_conflicts', 'rebuilding_trust', 'all']),
      personality_tags: JSON.stringify(['mature', 'peacekeeper', 'analytical']),
      cover_image_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=1200&q=80',
      author_or_source: 'Communication Psychology Institute',
      source_type: 'curated',
      likes_count: 580,
      saves_count: 395
    },

    // ------------------------------------------------------------------------
    // TAB 3: DAILY MIND
    // ------------------------------------------------------------------------
    {
      id: 'cnt_mind_1',
      tab: 'mind',
      category_id: 'cat_psychology',
      format_type: 'behavior_insight',
      title: "The Fundamental Attribution Bias",
      quote_one_liner: "We judge others by their actions, but we judge ourselves by our intentions.",
      body_insight: "Psychologists call this the Fundamental Attribution Error: when someone is late, we label them undisciplined; when we are late, we cite unforeseen traffic. Recognizing this asymmetry is the fastest path to empathy and decreased interpersonal irritability.",
      reflection_question: "Where in your life are you holding someone to an absolute standard while giving yourself infinite grace?",
      action_exercise: "Choose one frustrating action by someone today and deliberately construct the most generous possible explanation for why it happened.",
      gender_audience: JSON.stringify(['all']),
      relationship_statuses: JSON.stringify(['all']),
      friendship_tracks: JSON.stringify(['all']),
      personality_tags: JSON.stringify(['analytical', 'psychologist', 'rational']),
      cover_image_url: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1200&q=80',
      author_or_source: 'Cognitive Behaviour Studies',
      source_type: 'curated',
      likes_count: 712,
      saves_count: 504
    },
    {
      id: 'cnt_mind_attract_1',
      tab: 'mind',
      category_id: 'cat_attraction',
      format_type: 'compatibility',
      title: "Chemistry vs. Compatibility",
      quote_one_liner: "Chemistry sparks curiosity; emotional regulation builds safety; shared values build longevity.",
      body_insight: "High-voltage intensity is often mistaken for soul connection. While attraction opens the door, compatibility is determined by how two people resolve boredom, handle money, respect privacy, and navigate conflict during ordinary Tuesdays.",
      reflection_question: "Are you pursuing excitement that makes you anxious, or peace that makes you comfortable being yourself?",
      action_exercise: "List your top 3 non-negotiable character values and check whether your closest circle shares them.",
      gender_audience: JSON.stringify(['all']),
      relationship_statuses: JSON.stringify(['single', 'looking_for_love', 'has_crush', 'dating', 'all']),
      friendship_tracks: JSON.stringify(['all']),
      personality_tags: JSON.stringify(['perceptive', 'dating_mindful']),
      cover_image_url: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=1200&q=80',
      author_or_source: 'Relational Intelligence Lab',
      source_type: 'curated',
      likes_count: 830,
      saves_count: 620
    },

    // ------------------------------------------------------------------------
    // TAB 4: DAILY GROWTH
    // ------------------------------------------------------------------------
    {
      id: 'cnt_growth_1',
      tab: 'growth',
      category_id: 'cat_self_growth',
      format_type: 'challenge',
      title: "Boundary Architecture",
      quote_one_liner: "Boundaries are not walls to lock others out; they are clear doors that show where the entrance is.",
      body_insight: "Without clear boundaries, love turns into resentment. You cannot be genuinely generous when you are silently exhausted. Establishing where your responsibility ends and another adult's responsibility begins preserves your tenderness.",
      reflection_question: "What resentful feeling are you holding right now that is actually the consequence of an unexpressed boundary?",
      action_exercise: "Identify one task you agreed to out of guilt. Gracefully renegotiate the terms or set a healthy boundary today.",
      gender_audience: JSON.stringify(['all']),
      relationship_statuses: JSON.stringify(['all']),
      friendship_tracks: JSON.stringify(['all']),
      personality_tags: JSON.stringify(['growth', 'leader', 'empath']),
      cover_image_url: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?auto=format&fit=crop&w=1200&q=80',
      author_or_source: 'Soulverse Growth Mastery',
      source_type: 'curated',
      likes_count: 650,
      saves_count: 480
    },
    {
      id: 'cnt_growth_worth_1',
      tab: 'growth',
      category_id: 'cat_self_worth',
      format_type: 'motivation',
      title: "Unconditional Self-Respect",
      quote_one_liner: "Never shrink your authenticity to fit into rooms that were never designed for your true self.",
      body_insight: "When you stop negotiating with your core integrity for external applause, you experience a stillness that no external validation could ever manufacture. You are enough as you are, and you are also worthy of becoming who you aspire to be.",
      reflection_question: "In what environment do you feel most free to speak and create without self-censorship?",
      action_exercise: "Write down 3 things you genuinely respect about your character that nobody can take away from you.",
      gender_audience: JSON.stringify(['all']),
      relationship_statuses: JSON.stringify(['all']),
      friendship_tracks: JSON.stringify(['all']),
      personality_tags: JSON.stringify(['courageous', 'sovereign']),
      cover_image_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80',
      author_or_source: 'Soulverse Core Identity',
      source_type: 'curated',
      likes_count: 920,
      saves_count: 730
    }
  ];

  for (const item of dailyItems) {
    insertContent.run(
      item.id, item.tab, item.category_id, item.format_type, item.title,
      item.quote_one_liner, item.body_insight, item.reflection_question,
      item.action_exercise, item.gender_audience, item.relationship_statuses,
      item.friendship_tracks, item.personality_tags, item.cover_image_url,
      item.author_or_source, item.source_type, 'approved',
      item.likes_count, item.saves_count, now
    );
  }

  // 3. Seed Default Preferences for usr_me
  const insertPrefs = db.prepare(`
    INSERT OR IGNORE INTO daily_member_preferences (
      member_id, edition_preference, relationship_status, dating_intentions,
      friendship_track, delivery_time, timezone, love_notifications,
      friendship_notifications, growth_notifications, quiet_hours_enabled, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertPrefs.run(
    'usr_me', 'universal', 'single', 'meaningful_connection',
    'making_new_friends', '08:00', 'Asia/Colombo', 1, 1, 1, 1, now
  );

  // 4. Seed Streaks for usr_me
  const insertStreak = db.prepare(`
    INSERT OR IGNORE INTO daily_member_streaks (
      member_id, current_streak, longest_streak, last_active_date, total_reflections, total_challenges_done
    ) VALUES (?, ?, ?, ?, ?, ?)
  `);

  const todayStr = new Date().toISOString().split('T')[0];
  insertStreak.run('usr_me', 5, 12, todayStr, 4, 3);
}

function seedSoulverseExpansionData() {
  const identityCount = db.prepare('SELECT COUNT(*) as count FROM user_identities').get() as { count: number };
  if (identityCount.count > 0) return;

  const now = Date.now();

  // 1. Fictional Universe: Gotham Universe
  const insertUniverse = db.prepare(`
    INSERT OR IGNORE INTO fictional_universes (
      id, creator_id, name, slug, description, genre, lore, rules_of_universe, cover_image_url, is_collaborative, visibility, status, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertUniverse.run(
    'uni_gotham',
    'usr_me',
    'Neo-Gotham Universe',
    'neo-gotham',
    'An atmospheric rain-slicked metropolis protected by masked vigilantes operating from high gargoyles.',
    'noir_cyberpunk',
    'After the great grid collapse of 2089, mega-corporations privatized civic law. In the shadows, vigilantism emerged as the only incorruptible defense.',
    '1. No lethal armaments.\n2. The signal never blinks twice without reason.\n3. Masks preserve the family.',
    'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1200&q=80',
    1,
    'public',
    'published',
    now,
    now
  );

  // 2. Identities for usr_me:
  // a) Real Identity
  const insertIdentity = db.prepare(`
    INSERT OR IGNORE INTO user_identities (
      id, user_id, name, display_title, classification, avatar_url, cover_image_url,
      description, biography, personality_traits, interests, skills, universe_id,
      layout, theme_config, is_primary, visibility, status, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertIdentity.run(
    'id_me_real',
    'usr_me',
    'Kavindu Senanayake',
    'Systems Architect & Artisan',
    'real_identity',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80',
    'Ground truth biography: Software engineering craft, high-altitude mountain runs, and quiet Ceylon tea rituals.',
    'I build local-first software systems designed to outlive corporate clouds. Passionate about intentional living, deep 2 AM conversations, and analog sound design.',
    JSON.stringify(['Reflective', 'Quietly Ambitious', 'Authentic', 'Loyal']),
    JSON.stringify(['Distributed Systems', 'Mountain Backpacking', 'Ceylon Tea', 'Game Design']),
    JSON.stringify(['C++', 'SQLite Architecture', 'Acoustic Guitar', 'Orienteering']),
    null,
    'standard',
    JSON.stringify({ primaryColor: '#D7374B', ambientGlow: 'rgba(215, 55, 75, 0.25)' }),
    1,
    'public',
    'published',
    now,
    now
  );

  // b) Fictional Persona: Batman-inspired Character
  insertIdentity.run(
    'id_me_batman',
    'usr_me',
    'The Dark Knight of Neo-Gotham',
    'Gotham Shadow Protector',
    'fictional_character',
    'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80',
    "My imagined life as Gotham's masked protector. Watching the neon spires from 80 stories up.",
    'Operating from a subterranean cave beneath the harbor. Armed with custom titanium grappling systems and acoustic signal detectors.',
    JSON.stringify(['Vigilant', 'Strategic', 'Unyielding', 'Brooding']),
    JSON.stringify(['Gargoyle Vantage Points', 'Night Patrols', 'Acoustic Surveillance']),
    JSON.stringify(['Martial Arts', 'Tactical Deduction', 'Glide Mechanics']),
    'uni_gotham',
    'cinematic',
    JSON.stringify({ primaryColor: '#85283C', ambientGlow: 'rgba(133, 40, 60, 0.35)' }),
    0,
    'public',
    'published',
    now,
    now
  );

  // c) Private Imaginary Identity:
  insertIdentity.run(
    'id_me_private',
    'usr_me',
    'The Chronicler of Lost Stars',
    'Interstellar Cartographer',
    'fantasy_identity',
    'https://images.unsplash.com/photo-1507499739999-097706ad8914?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1200&q=80',
    'A private solitary persona dedicated to mapping dying nebulae.',
    'Documenting cosmic coordinate shifts in a leather-bound folio with phosphorescent ink.',
    JSON.stringify(['Solitary', 'Poetic', 'Observant']),
    JSON.stringify(['Stargazing', 'Celestial Mechanics']),
    JSON.stringify(['Star Charts', 'Astro-navigation']),
    null,
    'standard',
    null,
    0,
    'private', // Explicitly private
    'published',
    now,
    now
  );

  // 3. Universal Timeline Events (BCE, Astronomical, Fictional, Prehistoric)
  const insertUniversalEvent = db.prepare(`
    INSERT OR IGNORE INTO universal_timeline_events (
      id, user_id, identity_id, universe_id, time_type, year_value, year_scale,
      era_label, display_label, title, short_description, detailed_description,
      image_url, event_category, is_fictional, precision, calendar_system, tags,
      visibility, sort_order, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  // a) Current calendar: 2026 CE
  insertUniversalEvent.run(
    'ute_2026', 'usr_me', 'id_me_real', null, 'standard_ce', '2026', 'years',
    'CE', '2026 CE', 'My Current Life & Software Craft',
    'Exploring new experiences, building local-first connection spaces, and slow mountain living.',
    'Dedicated to engineering soulful computing platforms that respect human attention and deep friendship.',
    'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80',
    'life_chapter', 0, 'exact', 'gregorian', 'current_life,building,philosophy', 'public', 1, now, now
  );

  // b) 1500 BCE
  insertUniversalEvent.run(
    'ute_1500_bce', 'usr_me', null, null, 'bce', '-1500', 'years',
    'BCE', '1500 BCE', 'The Ancient Kingdom',
    'My imagined life as a philosopher-king in the Bronze Age Aegean.',
    'Walking between sunlit limestone columns, debating cosmology with maritime navigators while olive presses turned in the courtyards.',
    'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
    'historical_imagination', 1, 'approximate', 'astronomical', 'ancient,philosophy,kingship', 'public', 2, now, now
  );

  // c) 65 Million Years Ago: Dinosaur Era
  insertUniversalEvent.run(
    'ute_65m_dino', 'usr_me', null, null, 'years_ago', '65000000', 'millions_years',
    'Dinosaur Era', '65 million years ago', 'The Great Canopy Migration',
    'I was a winged pterosaur gliding above ancient prehistoric ferns.',
    'Catching thermal air currents across mist-covered volcanic valleys, free from terminals and calendars.',
    'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=800&q=80',
    'fictional_prehistory', 1, 'approximate', 'geological', 'dinosaurs,prehistory,imagination', 'public', 3, now, now
  );

  // d) 10,000,000,000,000 Years Ago: Beyond Time
  insertUniversalEvent.run(
    'ute_10t_beyond', 'usr_me', null, null, 'astronomical', '10000000000000', 'trillions_years',
    'Beyond Time', '10,000,000,000,000 years ago', 'Beyond Time: The Singularity of Pure Resonance',
    'My life before physical matter coalesced into stellar nurseries.',
    'Consciousness existing as harmonic frequency vibrating across high-dimensional manifolds before the first hydrogen atoms formed.',
    'https://images.unsplash.com/photo-1507499739999-097706ad8914?auto=format&fit=crop&w=800&q=80',
    'cosmic_narrative', 1, 'timeless', 'cosmic', 'cosmos,singularity,timeless', 'public', 4, now, now
  );

  // 4. Seed Private Viewer Note from usr_me on usr_alex (Telegram contact notes-inspired)
  const insertNote = db.prepare(`
    INSERT OR IGNORE INTO private_viewer_notes (
      id, viewer_id, target_user_id, note_content, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?)
  `);

  insertNote.run(
    'pvn_me_alex',
    'usr_me',
    'usr_alex',
    'Met through a gaming community. Likes science fiction, prefers long conversations and is interested in photography.',
    now,
    now
  );

  // 5. Seed Activity Preferences for usr_me
  const insertActivity = db.prepare(`
    INSERT OR IGNORE INTO user_activity_preferences (
      user_id, share_peak_activity, peak_window, communication_style, chatty_indicator,
      avg_response_range, preferred_message_format, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertActivity.run(
    'usr_me', 1, 'evening', 'loves_deep_conversations', 'meaningful_discussions',
    'within_few_hours', 'thoughtful_text', now
  );

  // 6. Seed Registered External Mini-Games for Safe Iframe Sandbox
  const insertExternalGame = db.prepare(`
    INSERT OR IGNORE INTO registered_external_games (
      id, provider_name, game_title, game_url, allowed_origin, category, description,
      thumbnail_url, is_approved, sandbox_attributes, registered_by, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertExternalGame.run(
    'ext_game_trivia',
    'Open Trivia Network',
    'Deep Mind Trivia Duel',
    'https://opentdb.com',
    'https://opentdb.com',
    'trivia',
    'Multiplayer intellectual trivia spanning astronomy, art history, and philosophy.',
    'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=400&q=80',
    1,
    'allow-scripts allow-same-origin allow-popups',
    'usr_me',
    now
  );

  insertExternalGame.run(
    'ext_game_word',
    'Artisanal Games Studio',
    'Echo Word Association',
    'https://wordplay.io',
    'https://wordplay.io',
    'word_game',
    'Subtle subconscious word link duel designed to test psychological chemistry between two thinkers.',
    'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=400&q=80',
    1,
    'allow-scripts allow-same-origin allow-popups',
    'usr_me',
    now
  );
}

function seedFeatureControlLayer() {
  const existingCount = db.prepare('SELECT COUNT(*) as count FROM feature_registry').get() as { count: number };
  const now = Date.now();

  if (existingCount.count === 0) {
    const insertFeature = db.prepare(`
    INSERT OR IGNORE INTO feature_registry (
      id, name, category, tagline, description, default_state, is_user_configurable,
      privacy_level, collected_data_json, visibility_audience, requires_ai,
      requires_notifications, is_premium, disable_behavior, data_retention_rule,
      min_app_version, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertFlag = db.prepare(`
    INSERT OR IGNORE INTO feature_flags (
      feature_id, is_globally_enabled, rollout_percentage, allowed_roles_json,
      allowed_tiers_json, beta_user_ids_json, min_version, kill_switch_active,
      kill_switch_reason, updated_by, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertDep = db.prepare(`
    INSERT OR IGNORE INTO feature_dependencies (
      feature_id, depends_on_feature_id, is_optional, fallback_note
    ) VALUES (?, ?, ?, ?)
  `);

  const insertPref = db.prepare(`
    INSERT OR IGNORE INTO user_feature_preferences (
      user_id, feature_id, state, is_visible, is_discoverable, custom_config_json,
      paused_until, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const features = [
    {
      id: 'feat_dating',
      name: 'Dating & Chemistry',
      category: 'social',
      tagline: 'Discover romantic chemistry through deep ontological compatibility and verified identity cards.',
      description: 'Provides romantic matching, swipe exploration, HCM deep compatibility metrics, and mutual chemistry matches.',
      default_state: 'available',
      is_user_configurable: 1,
      privacy_level: 'selective',
      collected_data: ['Dating intent', 'Age & distance preferences', 'Romantic values', 'Looking for profile parameters'],
      visibility_audience: 'Eligible matches according to your filters',
      requires_ai: 0,
      requires_notifications: 1,
      is_premium: 0,
      disable_behavior: 'Hides romantic card stack and stops surfacing your profile in dating feeds. Your existing chats remain safe.',
      data_retention_rule: 'Matches and chat history are preserved. Re-enabling restores your exact match state.'
    },
    {
      id: 'feat_friendships',
      name: 'Friendships & Circles',
      category: 'social',
      tagline: 'Connect with kindred spirits based on passions, creative projects, and shared curiosity.',
      description: 'Platonic discovery, topic-based communities, shared passions (#DeepTalk, #Books, #Design), and friendship requests.',
      default_state: 'enabled',
      is_user_configurable: 1,
      privacy_level: 'public',
      collected_data: ['Friend list', 'Shared passions', 'Circle memberships'],
      visibility_audience: 'Public community members and friends',
      requires_ai: 0,
      requires_notifications: 1,
      is_premium: 0,
      disable_behavior: 'Stops suggesting platonic friend recommendations while maintaining your current contacts.',
      data_retention_rule: 'Circle memberships and conversation threads are permanently saved.'
    },
    {
      id: 'feat_relationship_vault',
      name: 'Relationship Vault & Memories',
      category: 'relationships',
      tagline: 'Private relationship memory system: important dates, boundary preferences, promises, and Before-You-Talk briefings.',
      description: 'A personal relationship management space to honor human relationships with respect and care. Strictly client-side protected.',
      default_state: 'available',
      is_user_configurable: 1,
      privacy_level: 'private_encrypted',
      collected_data: ['Important dates & anniversaries', 'Gift preferences', 'Emotional history notes', 'Interaction boundaries'],
      visibility_audience: 'Strictly private to you. Zero admin or public access.',
      requires_ai: 0,
      requires_notifications: 1,
      is_premium: 0,
      disable_behavior: 'Hides the vault and briefings from your menus. Stored records remain fully encrypted and inaccessible to anyone else.',
      data_retention_rule: 'Zero automatic deletion. Data can only be wiped by an explicit user wipe command.'
    },
    {
      id: 'feat_personal_journal',
      name: '5,000-Char Markdown Journal',
      category: 'growth',
      tagline: 'Express your inner narrative with full GitHub Flavored Markdown, code blocks, quotes, and visual previews.',
      description: 'Extensive personal journal and bio editor allowing uninhibited personal expression beyond short bullet points.',
      default_state: 'available',
      is_user_configurable: 1,
      privacy_level: 'selective',
      collected_data: ['Markdown journal entries', 'Bio reflections', 'Personal tags'],
      visibility_audience: 'Configurable per entry (private or profile public)',
      requires_ai: 0,
      requires_notifications: 0,
      is_premium: 0,
      disable_behavior: 'Removes journal quick-launchers. Existing written articles remain stored safely.',
      data_retention_rule: 'All markdown files and drafts remain persisted in your private account storage.'
    },
    {
      id: 'feat_imaginary_identities',
      name: 'Identity Universe & Personas',
      category: 'identity',
      tagline: 'Live multifaceted lives: Real Me, Professional Me, Cinematic Me, and creative fictional personas.',
      description: 'Create and switch seamlessly between distinct identity contexts with isolated friend lists and privacy boundaries.',
      default_state: 'available',
      is_user_configurable: 1,
      privacy_level: 'selective',
      collected_data: ['Persona avatars', 'Custom bios per persona', 'Persona visibility permissions'],
      visibility_audience: 'Determined individually per identity world',
      requires_ai: 0,
      requires_notifications: 0,
      is_premium: 0,
      disable_behavior: 'Focuses your experience exclusively on your primary profile while archiving sub-personas.',
      data_retention_rule: 'All created personas and world assets remain safely archived.'
    },
    {
      id: 'feat_cinematic_profiles',
      name: 'Cinematic Narrative Worlds',
      category: 'identity',
      tagline: 'Rich interactive profile worlds featuring background soundtracks, narrative chapters, and art.',
      description: 'Explore and author living digital environments with chapters, ambient lighting, and visitor guestbooks.',
      default_state: 'available',
      is_user_configurable: 1,
      privacy_level: 'public',
      collected_data: ['World themes', 'Audio soundtrack choices', 'Chapter stories'],
      visibility_audience: 'Public or designated friends list',
      requires_ai: 0,
      requires_notifications: 0,
      is_premium: 0,
      disable_behavior: 'Hides your worlds from public discovery feeds while leaving them accessible for your direct editing.',
      data_retention_rule: 'All media, custom shaders, and world chapters remain completely preserved.'
    },
    {
      id: 'feat_group_relationships',
      name: 'Polycules & Chosen Family Circles',
      category: 'relationships',
      tagline: 'Modern, non-traditional relationship structures: polycules, close friend pods, and chosen families.',
      description: 'Multi-member relational hubs with group calendars, shared memories, boundary agreements, and mutual respect tools.',
      default_state: 'available',
      is_user_configurable: 1,
      privacy_level: 'selective',
      collected_data: ['Group member relationships', 'Shared milestone dates', 'Group boundaries'],
      visibility_audience: 'Group members only',
      requires_ai: 0,
      requires_notifications: 1,
      is_premium: 0,
      disable_behavior: 'Deactivates group relationship dashboard widgets without impacting individual connections.',
      data_retention_rule: 'Shared history and agreements remain intact.'
    },
    {
      id: 'feat_ai_assistant',
      name: 'Soulverse Cognitive Assistant',
      category: 'intelligence',
      tagline: 'Empathetic conversation suggestions, ontological matching insights, and thoughtful date ideas.',
      description: 'On-device and privacy-first AI assistant to elevate conversation quality and prevent loneliness.',
      default_state: 'disabled',
      is_user_configurable: 1,
      privacy_level: 'strictly_local',
      collected_data: ['In-session conversation context (ephemeral)', 'Prompt queries'],
      visibility_audience: 'Strictly local to user session. Never trained on or shared.',
      requires_ai: 1,
      requires_notifications: 0,
      is_premium: 0,
      disable_behavior: 'Shuts down all AI inference and suggestions across the entire client.',
      data_retention_rule: 'Instant zero-state purge of ephemeral inference caches.'
    },
    {
      id: 'feat_daily_quotes',
      name: 'Daily Philosophy & Quotes',
      category: 'growth',
      tagline: 'Morning reflections, philosophical reminders, and daily mindful connection thoughts.',
      description: 'Curated daily inspiration and contemplative pauses to inspire thoughtful human encounters.',
      default_state: 'enabled',
      is_user_configurable: 1,
      privacy_level: 'public',
      collected_data: ['Saved favorite quotes', 'Reflection responses'],
      visibility_audience: 'Private reflections are only visible to you',
      requires_ai: 0,
      requires_notifications: 1,
      is_premium: 0,
      disable_behavior: 'Hides the daily quote pill from the top of your feed.',
      data_retention_rule: 'Saved favorites remain in your profile bookmarks.'
    },
    {
      id: 'feat_personality_exploration',
      name: 'Personality & Value Discovery',
      category: 'growth',
      tagline: 'Psychological value mapping, attachment styles, and Big Five behavioral chemistry.',
      description: 'Helps people discover emotional compatibilities through gentle self-assessment without reductive labels.',
      default_state: 'available',
      is_user_configurable: 1,
      privacy_level: 'selective',
      collected_data: ['Value rankings', 'Communication preferences', 'Attachment reflections'],
      visibility_audience: 'You can choose which badges appear on your public card',
      requires_ai: 0,
      requires_notifications: 0,
      is_premium: 0,
      disable_behavior: 'Hides personality badges from your public profile.',
      data_retention_rule: 'Survey answers are securely stored for whenever you choose to display them.'
    },
    {
      id: 'feat_events_parties',
      name: 'Events & Watch Parties',
      category: 'social',
      tagline: 'Live virtual gatherings, ambient movie watch parties, and intimate in-person workshops.',
      description: 'Browse local events, RSVP with friends, host virtual listening parties, and build community calendars.',
      default_state: 'available',
      is_user_configurable: 1,
      privacy_level: 'public',
      collected_data: ['RSVP status', 'Attended events history'],
      visibility_audience: 'Event hosts and other attendees',
      requires_ai: 0,
      requires_notifications: 1,
      is_premium: 0,
      disable_behavior: 'Removes events tab from social feeds.',
      data_retention_rule: 'Past attendance history is retained in your private timeline.'
    },
    {
      id: 'feat_external_connections',
      name: 'External Social Connections',
      category: 'social',
      tagline: 'Link your Spotify, Instagram, GitHub, Discord, and Telegram profiles with one-click verification.',
      description: 'Establish authenticity across platforms without handing over your login credentials.',
      default_state: 'available',
      is_user_configurable: 1,
      privacy_level: 'selective',
      collected_data: ['Public profile handles', 'OAuth token scopes (read-only)'],
      visibility_audience: 'Publicly displayed on your profile based on your toggle choice',
      requires_ai: 0,
      requires_notifications: 0,
      is_premium: 0,
      disable_behavior: 'Temporarily unlinks social pills from public view without revoking stored tokens.',
      data_retention_rule: 'Token revocation can be triggered explicitly at any time.'
    },
    {
      id: 'feat_the_unspoken',
      name: 'The Unspoken: Emotional Sanctuary',
      category: 'growth',
      tagline: 'The Inner Room, Midnight Thoughts, Unopened Letters, and Unsent Words.',
      description: 'A tranquil sanctuary for everything you feel but do not always know how to say. Free of toxic engagement traps.',
      default_state: 'enabled',
      is_user_configurable: 1,
      privacy_level: 'strictly_local',
      collected_data: ['Unsent reflections', 'Saved sanctuary thoughts', 'Mood preference'],
      visibility_audience: 'Completely private to the device and account. Never indexed.',
      requires_ai: 0,
      requires_notifications: 0,
      is_premium: 0,
      disable_behavior: 'Hides sanctuary banners and unopened letters from all navigation bars.',
      data_retention_rule: 'All unsent words and saved thoughts remain securely saved.'
    },
    {
      id: 'feat_spotify_ambient',
      name: 'Spotify Music Integration',
      category: 'media',
      tagline: 'Mini dock audio player, profile anthems, and shared listening experiences.',
      description: 'Control your Spotify music directly inside the app with Titanium Glass controls and ambient lighting.',
      default_state: 'enabled',
      is_user_configurable: 1,
      privacy_level: 'selective',
      collected_data: ['Currently playing track URI', 'Profile anthem choice'],
      visibility_audience: 'Profile visitors see your anthem; current playback status is optional',
      requires_ai: 0,
      requires_notifications: 0,
      is_premium: 0,
      disable_behavior: 'Hides the floating audio dock and stops querying playback state.',
      data_retention_rule: 'Saved playlist presets and anthem configurations remain saved.'
    },
    {
      id: 'feat_two_person_questions',
      name: 'One Question, Two People',
      category: 'relationships',
      tagline: 'Synchronous lock-and-reveal question game to deepen bonds in private messages.',
      description: 'Two people privately submit an answer to the same prompt; both answers are revealed together once both complete it.',
      default_state: 'enabled',
      is_user_configurable: 1,
      privacy_level: 'selective',
      collected_data: ['Mutual question answers (ephemeral to the pair)'],
      visibility_audience: 'Only the two participants in the conversation',
      requires_ai: 0,
      requires_notifications: 1,
      is_premium: 0,
      disable_behavior: 'Removes the 2-Person Q button from the active chat header.',
      data_retention_rule: 'Revealed answers remain in your conversation history.'
    },
    {
      id: 'feat_timeline_view',
      name: 'Year-by-Year Life Timeline',
      category: 'identity',
      tagline: 'Visualize your journey: personal milestones, creative breakthroughs, and life chapters.',
      description: 'Chronological timeline recording the defining moments and eras of your personal growth.',
      default_state: 'available',
      is_user_configurable: 1,
      privacy_level: 'selective',
      collected_data: ['Milestone years', 'Event titles & descriptions', 'Timeline photos'],
      visibility_audience: 'Public or friends-only according to your timeline settings',
      requires_ai: 0,
      requires_notifications: 0,
      is_premium: 0,
      disable_behavior: 'Hides timeline shortcut from navigation menus.',
      data_retention_rule: 'All past timeline milestones remain preserved indefinitely.'
    }
  ];

  for (const feat of features) {
    insertFeature.run(
      feat.id,
      feat.name,
      feat.category,
      feat.tagline,
      feat.description,
      feat.default_state,
      feat.is_user_configurable,
      feat.privacy_level,
      JSON.stringify(feat.collected_data),
      feat.visibility_audience,
      feat.requires_ai,
      feat.requires_notifications,
      feat.is_premium,
      feat.disable_behavior,
      feat.data_retention_rule,
      '1.0.0',
      now
    );

    insertFlag.run(
      feat.id,
      1, // is_globally_enabled
      100, // rollout_percentage
      JSON.stringify(['user', 'vip', 'admin']),
      JSON.stringify(['free', 'plus', 'sovereign']),
      JSON.stringify([]),
      '1.0.0',
      0, // kill_switch_active
      null,
      'adm_system',
      now
    );

    // Seed default preference for 'usr_me'
    insertPref.run(
      'usr_me',
      feat.id,
      feat.default_state === 'disabled' ? 'disabled' : 'enabled',
      1, // is_visible
      1, // is_discoverable
      '{}',
      null,
      now
    );
  }

  // Seed Feature Dependencies
  insertDep.run('feat_relationship_vault', 'feat_friendships', 0, 'Requires core friendship connection graph');
  insertDep.run('feat_relationship_vault', 'feat_ai_assistant', 1, 'AI briefings optional; manual vault works independently');
  insertDep.run('feat_two_person_questions', 'feat_friendships', 0, 'Requires mutual conversation connection');
  insertDep.run('feat_cinematic_profiles', 'feat_imaginary_identities', 0, 'Requires underlying persona context');
  insertDep.run('feat_the_unspoken', 'feat_daily_quotes', 1, 'Sanctuary operates independently from daily feed quotes');

  // Seed User Experience Preset for 'usr_me'
  db.prepare(`
    INSERT OR REPLACE INTO user_experience_presets (user_id, active_preset, applied_at)
    VALUES (?, ?, ?)
  `).run('usr_me', 'complete', now);

  // Seed initial audit log
  db.prepare(`
    INSERT OR IGNORE INTO configuration_audit_logs (
      id, admin_id, admin_name, action, target_type, target_id, before_value_json,
      after_value_json, reason, ip_address, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    'audit_init_001',
    'adm_system',
    'Super Admin (System)',
    'feature_registry_init',
    'platform',
    'global_control_layer',
    '{}',
    JSON.stringify({ total_features: features.length, version: '1.0.0' }),
    'Initial platform configuration baseline seeded according to Universal Feature Specification',
    '127.0.0.1',
    now
  );
  }

  // Seed 8 Administrator Roles
  const roleCount = db.prepare('SELECT COUNT(*) as count FROM admin_roles').get() as { count: number };
  if (roleCount.count === 0) {
    const insertRole = db.prepare(`
      INSERT OR IGNORE INTO admin_roles (id, name, description, hierarchy_level)
      VALUES (?, ?, ?, ?)
    `);

    const roles = [
      { id: 'super_admin', name: 'Super Administrator', description: 'Unrestricted master operations and configuration governance.', level: 100 },
      { id: 'product_admin', name: 'Product Administrator', description: 'Feature flags, rollout percentages, and experience presets.', level: 80 },
      { id: 'technical_admin', name: 'Technical Administrator', description: 'Infrastructure health, WAL checkpoints, and API integrations.', level: 80 },
      { id: 'security_admin', name: 'Security Administrator', description: 'Emergency kill-switches, audit inspection, and trust policies.', level: 90 },
      { id: 'moderator', name: 'Trust & Safety Moderator', description: 'Report triage, safety queues, and account suspensions.', level: 50 },
      { id: 'support_admin', name: 'Support Administrator', description: 'User account triage, verification reviews, and assistance.', level: 40 },
      { id: 'content_admin', name: 'Content Administrator', description: 'Curated quotes, daily prompts, and Spotify music playlists.', level: 40 },
      { id: 'analyst', name: 'Telemetry Analyst', description: 'Read-only access to aggregated feature adoption analytics.', level: 20 }
    ];

    for (const r of roles) {
      insertRole.run(r.id, r.name, r.description, r.level);
    }

    // Seed Admin Permissions
    const insertPerm = db.prepare(`
      INSERT OR IGNORE INTO admin_permissions (id, role_id, domain, action)
      VALUES (?, ?, ?, ?)
    `);

    const permissions = [
      { id: 'perm_super_all', role_id: 'super_admin', domain: '*', action: '*' },
      { id: 'perm_prod_feat', role_id: 'product_admin', domain: 'features', action: 'write' },
      { id: 'perm_prod_conf', role_id: 'product_admin', domain: 'config', action: 'write' },
      { id: 'perm_prod_anal', role_id: 'product_admin', domain: 'analytics', action: 'read' },
      { id: 'perm_sec_kill', role_id: 'security_admin', domain: 'kill_switch', action: 'trip' },
      { id: 'perm_sec_audit', role_id: 'security_admin', domain: 'audit', action: 'read' },
      { id: 'perm_mod_safe', role_id: 'moderator', domain: 'safety', action: 'write' },
      { id: 'perm_supp_user', role_id: 'support_admin', domain: 'users', action: 'write' },
      { id: 'perm_cont_edit', role_id: 'content_admin', domain: 'content', action: 'write' },
      { id: 'perm_anal_read', role_id: 'analyst', domain: 'analytics', action: 'read' }
    ];

    for (const p of permissions) {
      insertPerm.run(p.id, p.role_id, p.domain, p.action);
    }

    // Assign 'usr_me' as super_admin for local governance
    db.prepare(`
      INSERT OR IGNORE INTO admin_role_assignments (user_id, role_id, assigned_by, assigned_at)
      VALUES (?, ?, ?, ?)
    `).run('usr_me', 'super_admin', 'adm_system', now);
  }

  // Seed baseline configuration version
  const verCount = db.prepare('SELECT COUNT(*) as count FROM configuration_versions').get() as { count: number };
  if (verCount.count === 0) {
    db.prepare(`
      INSERT OR IGNORE INTO configuration_versions (id, version_number, snapshot_json, created_by, change_summary, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      'cfg_ver_1',
      1,
      JSON.stringify({ activePreset: 'complete', defaultRollout: 100 }),
      'adm_system',
      'Baseline configuration version 1.0.0 seeded with all 16 master features',
      now
    );
  }

  // ==========================================================================
  // CENTRALIZED BYOAI & PERSONAL AI PROVIDER TABLES
  // ==========================================================================
  db.exec(`
    CREATE TABLE IF NOT EXISTS user_ai_connections (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      provider TEXT NOT NULL,
      name TEXT NOT NULL,
      encrypted_api_key TEXT NOT NULL,
      key_iv TEXT NOT NULL,
      key_auth_tag TEXT NOT NULL,
      key_mask TEXT NOT NULL,
      custom_endpoint TEXT,
      default_model TEXT NOT NULL,
      is_enabled INTEGER DEFAULT 1,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      last_tested_at INTEGER,
      last_status TEXT DEFAULT 'untested'
    );

    CREATE TABLE IF NOT EXISTS user_ai_task_routing (
      user_id TEXT NOT NULL,
      task_key TEXT NOT NULL,
      connection_id TEXT NOT NULL,
      model_id TEXT NOT NULL,
      allow_fallback INTEGER DEFAULT 0,
      fallback_connection_id TEXT,
      fallback_model_id TEXT,
      updated_at INTEGER NOT NULL,
      PRIMARY KEY (user_id, task_key)
    );

    CREATE TABLE IF NOT EXISTS user_ai_permissions (
      user_id TEXT PRIMARY KEY,
      allow_profile_data INTEGER DEFAULT 1,
      allow_identity_personas INTEGER DEFAULT 1,
      allow_chat_history INTEGER DEFAULT 1,
      max_chat_history_messages INTEGER DEFAULT 10,
      allow_relationship_vault INTEGER DEFAULT 0,
      allow_journals INTEGER DEFAULT 0,
      allow_preferences INTEGER DEFAULT 1,
      allow_external_sharing INTEGER DEFAULT 1,
      persistent_memory INTEGER DEFAULT 0,
      updated_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS user_ai_spending_limits (
      user_id TEXT PRIMARY KEY,
      daily_budget_usd REAL DEFAULT 5.0,
      monthly_budget_usd REAL DEFAULT 50.0,
      warning_threshold_pct REAL DEFAULT 80.0,
      auto_suspend_on_limit INTEGER DEFAULT 1,
      is_suspended INTEGER DEFAULT 0,
      updated_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS ai_usage_records (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      connection_id TEXT,
      provider TEXT NOT NULL,
      model TEXT NOT NULL,
      task_key TEXT NOT NULL,
      input_tokens INTEGER DEFAULT 0,
      output_tokens INTEGER DEFAULT 0,
      total_tokens INTEGER DEFAULT 0,
      estimated_cost_usd REAL DEFAULT 0.0,
      status TEXT NOT NULL,
      error_message TEXT,
      latency_ms INTEGER DEFAULT 0,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS admin_ai_providers (
      provider_id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      is_globally_enabled INTEGER DEFAULT 1,
      byok_allowed INTEGER DEFAULT 1,
      rate_limit_rpm INTEGER DEFAULT 60,
      allowed_models_json TEXT,
      updated_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS ai_assistant_conversations (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      task_context TEXT NOT NULL,
      context_entity_id TEXT,
      title TEXT NOT NULL,
      custom_instructions TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS ai_assistant_messages (
      id TEXT PRIMARY KEY,
      conversation_id TEXT NOT NULL,
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      provider TEXT,
      model TEXT,
      tokens_used INTEGER,
      created_at INTEGER NOT NULL,
      FOREIGN KEY (conversation_id) REFERENCES ai_assistant_conversations(id) ON DELETE CASCADE
    );
  `);

  // Seed default admin AI providers
  const insertAdminProvider = db.prepare(`
    INSERT OR IGNORE INTO admin_ai_providers (provider_id, name, is_globally_enabled, byok_allowed, rate_limit_rpm, allowed_models_json, updated_at)
    VALUES (?, ?, 1, 1, 60, '[]', ?)
  `);

  const defaultProviders = [
    { id: 'openai', name: 'OpenAI (ChatGPT)' },
    { id: 'gemini', name: 'Google Gemini' },
    { id: 'anthropic', name: 'Anthropic Claude' },
    { id: 'mistral', name: 'Mistral AI' },
    { id: 'openrouter', name: 'OpenRouter' },
    { id: 'ollama', name: 'Ollama Local' },
    { id: 'custom_openai', name: 'Custom OpenAI-Compatible' }
  ];

  for (const p of defaultProviders) {
    insertAdminProvider.run(p.id, p.name, now);
  }
}
