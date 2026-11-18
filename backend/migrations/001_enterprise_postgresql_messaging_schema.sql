-- =============================================================================
-- SOULVERSE ENTERPRISE MESSAGING ARCHITECTURE: POSTGRESQL PRODUCTION DDL
-- Migration: 001_enterprise_postgresql_messaging_schema.sql
-- Target Engines: PostgreSQL 14+, AWS Aurora PostgreSQL, GCP Cloud SQL
-- =============================================================================

BEGIN;

-- 1. USERS & IDENTITY
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(128) NOT NULL,
    username VARCHAR(64) UNIQUE NOT NULL,
    avatar_url TEXT NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    status_text VARCHAR(256),
    last_seen_at BIGINT NOT NULL DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000),
    created_at BIGINT NOT NULL DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000),
    updated_at BIGINT NOT NULL DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)
);

CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_last_seen ON users(last_seen_at);

-- 2. USER DEVICES & SESSIONS (Multi-Device & Push Notification Registry)
CREATE TABLE IF NOT EXISTS user_devices (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    device_name VARCHAR(128) NOT NULL,
    device_type VARCHAR(32) NOT NULL DEFAULT 'web', -- 'web', 'ios', 'android', 'desktop'
    fcm_token TEXT,
    apns_token TEXT,
    public_key TEXT, -- Optional E2EE Signal Identity/PreKey
    is_active BOOLEAN DEFAULT TRUE,
    last_active_at BIGINT NOT NULL,
    created_at BIGINT NOT NULL DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000),
    UNIQUE (user_id, fcm_token)
);

CREATE INDEX IF NOT EXISTS idx_user_devices_user ON user_devices(user_id, is_active);

-- 3. CONVERSATIONS
CREATE TABLE IF NOT EXISTS conversations (
    id VARCHAR(64) PRIMARY KEY,
    type VARCHAR(32) NOT NULL DEFAULT 'direct', -- 'direct', 'group', 'channel', 'saved_messages', 'watch_party'
    title VARCHAR(128),
    description TEXT,
    avatar_url TEXT,
    created_by VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    settings_json JSONB DEFAULT '{}'::jsonb,
    last_message_id VARCHAR(64),
    created_at BIGINT NOT NULL,
    updated_at BIGINT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_conversations_type ON conversations(type);
CREATE INDEX IF NOT EXISTS idx_conversations_updated ON conversations(updated_at DESC);

-- 4. CONVERSATION PARTICIPANTS & ROLES
CREATE TABLE IF NOT EXISTS conversation_members (
    conversation_id VARCHAR(64) NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(32) NOT NULL DEFAULT 'member', -- 'owner', 'admin', 'member'
    joined_at BIGINT NOT NULL,
    is_pinned BOOLEAN DEFAULT FALSE,
    is_archived BOOLEAN DEFAULT FALSE,
    is_muted BOOLEAN DEFAULT FALSE,
    notification_preference VARCHAR(32) DEFAULT 'all', -- 'all', 'mentions', 'none'
    unread_count INTEGER DEFAULT 0,
    last_read_sequence BIGINT DEFAULT 0,
    last_delivered_sequence BIGINT DEFAULT 0,
    draft_text TEXT,
    PRIMARY KEY (conversation_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_conv_members_user ON conversation_members(user_id, is_archived, is_pinned);
CREATE INDEX IF NOT EXISTS idx_conv_members_conv ON conversation_members(conversation_id);

-- 5. MESSAGES (Core Append-Only / Monotonic Sequence Engine)
CREATE TABLE IF NOT EXISTS messages (
    id VARCHAR(64) PRIMARY KEY,
    conversation_id VARCHAR(64) NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    client_message_id VARCHAR(128) UNIQUE NOT NULL, -- Idempotency key
    sequence_number BIGINT NOT NULL,
    message_type VARCHAR(32) NOT NULL DEFAULT 'text', -- 'text', 'photo', 'video', 'voice', 'file', 'sticker', 'custom_emoji', 'poll', 'game_event'
    text_content TEXT,
    media_url TEXT,
    voice_duration INTEGER,
    voice_waveform JSONB,
    reply_to_message_id VARCHAR(64) REFERENCES messages(id) ON DELETE SET NULL,
    thread_id VARCHAR(64),
    is_edited BOOLEAN DEFAULT FALSE,
    is_pinned BOOLEAN DEFAULT FALSE,
    is_deleted_for_everyone BOOLEAN DEFAULT FALSE,
    deleted_for_users JSONB DEFAULT '[]'::jsonb,
    attachment_json JSONB,
    expires_at BIGINT, -- Self-destruct / TTL
    scheduled_at BIGINT,
    created_at BIGINT NOT NULL,
    server_ack_at BIGINT NOT NULL DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_messages_conv_seq ON messages(conversation_id, sequence_number);
CREATE INDEX IF NOT EXISTS idx_messages_conv_created ON messages(conversation_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_client_id ON messages(client_message_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_reply ON messages(reply_to_message_id);

-- 6. MESSAGE ATTACHMENTS
CREATE TABLE IF NOT EXISTS message_attachments (
    id VARCHAR(64) PRIMARY KEY,
    message_id VARCHAR(64) NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
    file_name VARCHAR(256) NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type VARCHAR(128) NOT NULL,
    url TEXT NOT NULL,
    duration INTEGER,
    thumbnail_url TEXT,
    width INTEGER,
    height INTEGER,
    created_at BIGINT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_attachments_msg ON message_attachments(message_id);

-- 7. MESSAGE RECEIPTS (SENDING -> SENT -> DELIVERED -> READ)
CREATE TABLE IF NOT EXISTS message_receipts (
    id VARCHAR(64) PRIMARY KEY,
    message_id VARCHAR(64) NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
    conversation_id VARCHAR(64) NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    delivered_at BIGINT,
    read_at BIGINT,
    created_at BIGINT NOT NULL,
    UNIQUE (message_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_receipts_user_conv ON message_receipts(user_id, conversation_id);
CREATE INDEX IF NOT EXISTS idx_receipts_msg ON message_receipts(message_id);

-- 8. MESSAGE REACTIONS
CREATE TABLE IF NOT EXISTS message_reactions (
    id VARCHAR(64) PRIMARY KEY,
    message_id VARCHAR(64) NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    emoji VARCHAR(64) NOT NULL,
    created_at BIGINT NOT NULL,
    UNIQUE (message_id, user_id, emoji)
);

CREATE INDEX IF NOT EXISTS idx_reactions_msg ON message_reactions(message_id);

-- 9. MESSAGE AUDIT & EDIT HISTORY
CREATE TABLE IF NOT EXISTS message_edits (
    id VARCHAR(64) PRIMARY KEY,
    message_id VARCHAR(64) NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
    previous_text TEXT NOT NULL,
    edited_by VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    edited_at BIGINT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_message_edits_msg ON message_edits(message_id);

-- 10. USER PRESENCE & STATUS CACHE
CREATE TABLE IF NOT EXISTS user_presence (
    user_id VARCHAR(64) PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    is_online BOOLEAN DEFAULT FALSE,
    last_seen_at BIGINT NOT NULL,
    active_connection_count INTEGER DEFAULT 0,
    updated_at BIGINT NOT NULL
);

-- 11. USER SAFETY BLOCKS
CREATE TABLE IF NOT EXISTS user_blocks (
    id VARCHAR(64) PRIMARY KEY,
    blocker_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    blocked_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reason TEXT,
    parting_message TEXT,
    created_at BIGINT NOT NULL,
    UNIQUE(blocker_id, blocked_id)
);

CREATE INDEX IF NOT EXISTS idx_user_blocks_pair ON user_blocks(blocker_id, blocked_id);

-- 12. SAVED MESSAGES (Personal Cloud Sanctuary)
CREATE TABLE IF NOT EXISTS saved_messages (
    id VARCHAR(64) PRIMARY KEY,
    owner_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    source_message_id VARCHAR(64) REFERENCES messages(id) ON DELETE SET NULL,
    note_text TEXT NOT NULL,
    saved_at BIGINT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_saved_messages_owner ON saved_messages(owner_id);

-- 13. TRANSACTIONAL OUTBOX PATTERN (Centrifugo Reliable Real-Time Delivery)
CREATE TABLE IF NOT EXISTS outbox_events (
    id VARCHAR(64) PRIMARY KEY,
    event_type VARCHAR(64) NOT NULL,
    aggregate_type VARCHAR(64) NOT NULL,
    aggregate_id VARCHAR(64) NOT NULL,
    channel VARCHAR(128) NOT NULL,
    payload_json JSONB NOT NULL,
    status VARCHAR(24) NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'publishing', 'published', 'failed', 'dead_letter')),
    retry_count INTEGER NOT NULL DEFAULT 0,
    max_retries INTEGER NOT NULL DEFAULT 5,
    last_error TEXT,
    next_retry_at BIGINT NOT NULL,
    created_at BIGINT NOT NULL,
    published_at BIGINT
);

CREATE INDEX IF NOT EXISTS idx_outbox_status_retry ON outbox_events(status, next_retry_at);
CREATE INDEX IF NOT EXISTS idx_outbox_aggregate ON outbox_events(aggregate_type, aggregate_id);
CREATE INDEX IF NOT EXISTS idx_outbox_channel ON outbox_events(channel);

-- 14. SIGNAL PROTOCOL END-TO-END ENCRYPTION (E2EE KEY BUNDLES)
CREATE TABLE IF NOT EXISTS user_e2ee_identity_keys (
    user_id VARCHAR(64) PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    device_id VARCHAR(64) NOT NULL,
    registration_id INTEGER NOT NULL,
    identity_key TEXT NOT NULL,
    signed_prekey_id INTEGER NOT NULL,
    signed_prekey TEXT NOT NULL,
    signed_prekey_signature TEXT NOT NULL,
    created_at BIGINT NOT NULL,
    updated_at BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS user_e2ee_prekeys (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    key_id INTEGER NOT NULL,
    public_key TEXT NOT NULL,
    is_consumed BOOLEAN DEFAULT FALSE,
    consumed_at BIGINT,
    created_at BIGINT NOT NULL,
    UNIQUE(user_id, key_id)
);

CREATE INDEX IF NOT EXISTS idx_e2ee_prekeys ON user_e2ee_prekeys(user_id, is_consumed);

COMMIT;
