import { db } from '../db';

/**
 * Initializes and migrates all database tables required for the
 * Complete Real-Time Communication and Social Interaction System (Master Prompt 08).
 */
export function initCommunicationSchema() {
  // Helper to safely add column if not exists
  const addColumnIfNotExists = (table: string, column: string, definition: string) => {
    try {
      const info = db.prepare(`PRAGMA table_info(${table})`).all() as any[];
      if (!info.some(c => c.name === column)) {
        db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
      }
    } catch (e) {
      console.warn(`Column check/add notice for ${table}.${column}:`, e);
    }
  };

  // 1. Ensure metadata columns on conversations
  addColumnIfNotExists('conversations', 'title', 'TEXT');
  addColumnIfNotExists('conversations', 'description', 'TEXT');
  addColumnIfNotExists('conversations', 'avatar_url', 'TEXT');
  addColumnIfNotExists('conversations', 'created_by', 'TEXT');
  addColumnIfNotExists('conversations', 'settings_json', "TEXT DEFAULT '{}'");

  // Migrate conversations table if restrictive CHECK constraint exists
  try {
    const convSql = (db.prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name='conversations'").get() as any)?.sql || '';
    if (convSql.includes("CHECK(type IN ('direct', 'saved_messages'))") || !convSql.includes("'group'")) {
      db.pragma('foreign_keys = OFF');
      db.exec(`
        CREATE TABLE conversations_v2 (
          id TEXT PRIMARY KEY,
          type TEXT NOT NULL,
          title TEXT,
          description TEXT,
          avatar_url TEXT,
          created_by TEXT,
          settings_json TEXT DEFAULT '{}',
          created_at INTEGER NOT NULL,
          updated_at INTEGER NOT NULL,
          last_message_id TEXT
        );

        INSERT INTO conversations_v2 (id, type, title, description, avatar_url, created_by, settings_json, created_at, updated_at, last_message_id)
        SELECT 
          id, type, 
          COALESCE(title, NULL), 
          COALESCE(description, NULL), 
          COALESCE(avatar_url, NULL), 
          COALESCE(created_by, NULL), 
          COALESCE(settings_json, '{}'), 
          created_at, updated_at, last_message_id
        FROM conversations;

        DROP TABLE conversations;
        ALTER TABLE conversations_v2 RENAME TO conversations;
      `);
      db.pragma('foreign_keys = ON');
    }
  } catch (e) {
    console.warn('Conversations table migration note:', e);
  }

  // Migrate game_sessions table if restrictive CHECK constraint exists
  try {
    const gameSql = (db.prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name='game_sessions'").get() as any)?.sql || '';
    if (gameSql.includes("CHECK(game_type IN") && !gameSql.includes("'collaborative_challenge'")) {
      db.pragma('foreign_keys = OFF');
      db.exec(`
        CREATE TABLE game_sessions_v2 (
          id TEXT PRIMARY KEY,
          conversation_id TEXT NOT NULL,
          game_type TEXT NOT NULL,
          current_turn_user_id TEXT NOT NULL,
          state_json TEXT NOT NULL,
          status TEXT NOT NULL,
          created_at INTEGER NOT NULL,
          updated_at INTEGER NOT NULL
        );

        INSERT INTO game_sessions_v2 SELECT * FROM game_sessions;
        DROP TABLE game_sessions;
        ALTER TABLE game_sessions_v2 RENAME TO game_sessions;
      `);
      db.pragma('foreign_keys = ON');
    }
  } catch (e) {
    console.warn('Game sessions table migration note:', e);
  }

  // 2. Ensure metadata columns on conversation_members
  addColumnIfNotExists('conversation_members', 'role', "TEXT DEFAULT 'member'");
  addColumnIfNotExists('conversation_members', 'last_read_sequence', 'INTEGER DEFAULT 0');
  addColumnIfNotExists('conversation_members', 'last_delivered_sequence', 'INTEGER DEFAULT 0');
  addColumnIfNotExists('conversation_members', 'notification_preference', "TEXT DEFAULT 'all'");

  // 3. Ensure metadata columns on messages
  addColumnIfNotExists('messages', 'thread_id', 'TEXT');
  addColumnIfNotExists('messages', 'deleted_for_users_json', "TEXT DEFAULT '[]'");
  addColumnIfNotExists('messages', 'attachment_json', 'TEXT');
  addColumnIfNotExists('messages', 'expires_at', 'INTEGER');
  addColumnIfNotExists('messages', 'scheduled_at', 'INTEGER');

  // Migrate messages table if restrictive CHECK constraint exists on message_type
  try {
    const msgSql = (db.prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name='messages'").get() as any)?.sql || '';
    if (msgSql.includes("CHECK(message_type IN") && !msgSql.includes("'poll'")) {
      db.pragma('foreign_keys = OFF');
      db.exec(`
        CREATE TABLE messages_v2 (
          id TEXT PRIMARY KEY,
          conversation_id TEXT NOT NULL,
          sender_id TEXT NOT NULL,
          client_message_id TEXT UNIQUE NOT NULL,
          sequence_number INTEGER NOT NULL,
          message_type TEXT NOT NULL,
          text_content TEXT,
          media_url TEXT,
          voice_duration INTEGER,
          voice_waveform TEXT,
          reply_to_message_id TEXT,
          thread_id TEXT,
          is_edited INTEGER DEFAULT 0,
          is_pinned INTEGER DEFAULT 0,
          is_deleted_for_everyone INTEGER DEFAULT 0,
          deleted_for_users_json TEXT DEFAULT '[]',
          attachment_json TEXT,
          expires_at INTEGER,
          scheduled_at INTEGER,
          created_at INTEGER NOT NULL
        );

        INSERT INTO messages_v2 (
          id, conversation_id, sender_id, client_message_id, sequence_number, message_type,
          text_content, media_url, voice_duration, voice_waveform, reply_to_message_id,
          thread_id, is_edited, is_pinned, is_deleted_for_everyone, deleted_for_users_json,
          attachment_json, expires_at, scheduled_at, created_at
        )
        SELECT 
          id, conversation_id, sender_id, client_message_id, sequence_number, message_type,
          text_content, media_url, voice_duration, voice_waveform, reply_to_message_id,
          thread_id, is_edited, is_pinned, is_deleted_for_everyone,
          COALESCE(deleted_for_users_json, '[]'),
          COALESCE(attachment_json, NULL),
          COALESCE(expires_at, NULL),
          COALESCE(scheduled_at, NULL),
          created_at
        FROM messages;

        DROP TABLE messages;
        ALTER TABLE messages_v2 RENAME TO messages;
      `);
      db.pragma('foreign_keys = ON');
    }
  } catch (e) {
    console.warn('Messages table migration note:', e);
  }

  // 4. Create poll_votes table for real-time polling
  db.exec(`
    CREATE TABLE IF NOT EXISTS poll_votes (
      id TEXT PRIMARY KEY,
      message_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      option_index INTEGER NOT NULL,
      created_at INTEGER NOT NULL,
      UNIQUE(message_id, user_id, option_index),
      FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_poll_votes_msg ON poll_votes(message_id);
    CREATE INDEX IF NOT EXISTS idx_poll_votes_user ON poll_votes(user_id);
  `);

  // 5. Ensure calls table for WebRTC call history and logging
  db.exec(`
    CREATE TABLE IF NOT EXISTS calls (
      id TEXT PRIMARY KEY,
      conversation_id TEXT NOT NULL,
      caller_id TEXT NOT NULL,
      recipient_id TEXT NOT NULL,
      call_type TEXT NOT NULL,
      status TEXT NOT NULL,
      duration_seconds INTEGER DEFAULT 0,
      started_at INTEGER NOT NULL,
      ended_at INTEGER
    );
    CREATE INDEX IF NOT EXISTS idx_calls_user ON calls(caller_id, recipient_id);
    CREATE INDEX IF NOT EXISTS idx_calls_conv ON calls(conversation_id);
  `);

  // 4. Create message_attachments table
  db.exec(`
    CREATE TABLE IF NOT EXISTS message_attachments (
      id TEXT PRIMARY KEY,
      message_id TEXT NOT NULL,
      file_name TEXT NOT NULL,
      file_size INTEGER NOT NULL,
      mime_type TEXT NOT NULL,
      url TEXT NOT NULL,
      duration INTEGER,
      thumbnail_url TEXT,
      width INTEGER,
      height INTEGER,
      created_at INTEGER NOT NULL,
      FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_attachments_msg ON message_attachments(message_id);
  `);

  // 5. Create message_receipts table for delivery & read receipts
  db.exec(`
    CREATE TABLE IF NOT EXISTS message_receipts (
      id TEXT PRIMARY KEY,
      message_id TEXT NOT NULL,
      conversation_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      delivered_at INTEGER,
      read_at INTEGER,
      created_at INTEGER NOT NULL,
      UNIQUE(message_id, user_id),
      FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_receipts_user ON message_receipts(user_id, conversation_id);
    CREATE INDEX IF NOT EXISTS idx_receipts_msg ON message_receipts(message_id);
  `);

  // 6. Create user_notifications table
  db.exec(`
    CREATE TABLE IF NOT EXISTS user_notifications (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      body TEXT NOT NULL,
      entity_type TEXT NOT NULL,
      entity_id TEXT NOT NULL,
      is_read INTEGER DEFAULT 0,
      metadata_json TEXT DEFAULT '{}',
      created_at INTEGER NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_notifications_user ON user_notifications(user_id, is_read, created_at DESC);
  `);

  // 7. Create watch_party_rooms table (Coordinated video watching)
  db.exec(`
    CREATE TABLE IF NOT EXISTS watch_party_rooms (
      id TEXT PRIMARY KEY,
      conversation_id TEXT,
      title TEXT NOT NULL,
      host_id TEXT NOT NULL,
      video_url TEXT NOT NULL,
      video_type TEXT NOT NULL DEFAULT 'youtube',
      playback_position REAL DEFAULT 0,
      is_playing INTEGER DEFAULT 0,
      current_viewers_count INTEGER DEFAULT 1,
      sync_state_json TEXT DEFAULT '{}',
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );
  `);

  // 8. Create social_activity_rooms table (Shared-interest lounges & co-working)
  db.exec(`
    CREATE TABLE IF NOT EXISTS social_activity_rooms (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      topic TEXT NOT NULL,
      category TEXT NOT NULL,
      room_type TEXT NOT NULL DEFAULT 'lounge',
      host_id TEXT NOT NULL,
      max_participants INTEGER DEFAULT 12,
      tags_json TEXT DEFAULT '[]',
      is_active INTEGER DEFAULT 1,
      active_speaker TEXT,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS social_room_participants (
      room_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      joined_at INTEGER NOT NULL,
      is_speaker INTEGER DEFAULT 0,
      is_muted INTEGER DEFAULT 1,
      is_hand_raised INTEGER DEFAULT 0,
      PRIMARY KEY (room_id, user_id),
      FOREIGN KEY (room_id) REFERENCES social_activity_rooms(id) ON DELETE CASCADE
    );
  `);

  // 9. Create social_invitations table
  db.exec(`
    CREATE TABLE IF NOT EXISTS social_invitations (
      id TEXT PRIMARY KEY,
      inviter_id TEXT NOT NULL,
      invitee_id TEXT NOT NULL,
      activity_type TEXT NOT NULL,
      activity_id TEXT NOT NULL,
      title TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'accepted', 'declined')),
      created_at INTEGER NOT NULL,
      FOREIGN KEY (inviter_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (invitee_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  // 10. Create user_privacy_settings table
  db.exec(`
    CREATE TABLE IF NOT EXISTS user_privacy_settings (
      user_id TEXT PRIMARY KEY,
      online_privacy TEXT NOT NULL DEFAULT 'everyone' CHECK(online_privacy IN ('everyone', 'contacts_only', 'nobody')),
      last_seen_privacy TEXT NOT NULL DEFAULT 'everyone' CHECK(last_seen_privacy IN ('everyone', 'contacts_only', 'nobody')),
      read_receipts_enabled INTEGER NOT NULL DEFAULT 1,
      typing_indicators_enabled INTEGER NOT NULL DEFAULT 1,
      updated_at INTEGER NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  // Seed initial social activity rooms if table is empty
  const roomCount = (db.prepare('SELECT COUNT(*) as count FROM social_activity_rooms').get() as any)?.count || 0;
  if (roomCount === 0) {
    const seedRooms = [
      {
        id: 'room_deep_talk',
        title: 'Deep Talk Lounge (No Small Talk)',
        topic: 'What book, conversation, or moment quietly shifted how you see the world?',
        category: 'Intimate Conversation',
        roomType: 'lounge',
        hostId: 'usr_me',
        maxParticipants: 8,
        tags: ['Philosophy', 'Books', 'Quiet Vibe'],
        activeSpeaker: 'Tara'
      },
      {
        id: 'room_midnight_lofi',
        title: 'Midnight Lo-Fi Co-Working & Study Sanctuary',
        topic: 'Silent co-working with soft ambient beats streaming. Cameras/mics optional.',
        category: 'Focus & Presence',
        roomType: 'coworking',
        hostId: 'usr_alex',
        maxParticipants: 15,
        tags: ['Study', 'Quiet', 'Lo-Fi', 'Coding'],
        activeSpeaker: 'Lo-Fi Stream'
      },
      {
        id: 'room_anime_cinema',
        title: 'Studio Ghibli & Anime Cinema Club',
        topic: 'Discussing visual storytelling, nostalgic soundtracks, and animation aesthetics.',
        category: 'Creative Collaboration',
        roomType: 'discussion',
        hostId: 'usr_me',
        maxParticipants: 10,
        tags: ['Anime', 'Film', 'Storytelling', 'Art'],
        activeSpeaker: 'Kavindu'
      }
    ];

    const insertRoom = db.prepare(`
      INSERT INTO social_activity_rooms (
        id, title, topic, category, room_type, host_id, max_participants, tags_json, is_active, active_speaker, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)
    `);

    const now = Date.now();
    for (const r of seedRooms) {
      insertRoom.run(r.id, r.title, r.topic, r.category, r.roomType, r.hostId, r.maxParticipants, JSON.stringify(r.tags), r.activeSpeaker, now);
    }
  }

  // Seed default user privacy setting for usr_me if missing
  db.prepare(`
    INSERT OR IGNORE INTO user_privacy_settings (
      user_id, online_privacy, last_seen_privacy, read_receipts_enabled, typing_indicators_enabled, updated_at
    ) VALUES ('usr_me', 'everyone', 'everyone', 1, 1, ?)
  `).run(Date.now());
}
