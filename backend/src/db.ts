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
      message_type TEXT NOT NULL CHECK(message_type IN ('text', 'voice', 'photo', 'video', 'file', 'game_event', 'dice_event', 'gift_event')),
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

    -- Indexes for sub-millisecond timeline and profile queries
    CREATE INDEX IF NOT EXISTS idx_messages_conv_seq ON messages(conversation_id, sequence_number);
    CREATE INDEX IF NOT EXISTS idx_members_user ON conversation_members(user_id);
    CREATE INDEX IF NOT EXISTS idx_reactions_msg ON message_reactions(message_id);
    CREATE INDEX IF NOT EXISTS idx_sched_time ON scheduled_messages(scheduled_for, status);
    CREATE INDEX IF NOT EXISTS idx_social_user_vis ON user_social_links(user_id, visibility, sort_order);
  `);

  seedInitialData();
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
}
