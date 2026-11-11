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
  `);

  seedInitialData();
  seedStickerEcosystem();
  seedLivingIdentityProfiles();
  seedLifeTimeline();
  seedProfileMarkdowns();
  seedProfileWorlds();
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
