import Database from 'better-sqlite3';
import { db } from '../db';
import { v4 as uuidv4 } from 'uuid';

export function initArchitectureSchema(database: Database.Database = db): void {
  database.exec(`
    -- 1. Unified User Settings
    CREATE TABLE IF NOT EXISTS user_settings (
      user_id TEXT PRIMARY KEY,
      theme TEXT NOT NULL DEFAULT 'obsidian' CHECK(theme IN ('dark', 'light', 'obsidian', 'system')),
      language TEXT NOT NULL DEFAULT 'en',
      two_factor_enabled INTEGER NOT NULL DEFAULT 0,
      email_notifications INTEGER NOT NULL DEFAULT 1,
      push_notifications INTEGER NOT NULL DEFAULT 1,
      sound_effects INTEGER NOT NULL DEFAULT 1,
      haptic_feedback INTEGER NOT NULL DEFAULT 1,
      data_sharing_level TEXT NOT NULL DEFAULT 'minimal' CHECK(data_sharing_level IN ('minimal', 'standard', 'enhanced')),
      retention_period_days INTEGER NOT NULL DEFAULT 365,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- 2. Authentication Sessions
    CREATE TABLE IF NOT EXISTS auth_sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      token_hash TEXT NOT NULL UNIQUE,
      device_name TEXT,
      ip_address TEXT,
      user_agent TEXT,
      is_revoked INTEGER NOT NULL DEFAULT 0,
      expires_at INTEGER NOT NULL,
      last_active_at INTEGER NOT NULL,
      created_at INTEGER NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- 3. Explicit Connection Requests (Mutual Consent Protocol)
    CREATE TABLE IF NOT EXISTS connection_requests (
      id TEXT PRIMARY KEY,
      sender_id TEXT NOT NULL,
      recipient_id TEXT NOT NULL,
      connection_type TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'accepted', 'declined', 'cancelled')),
      note TEXT,
      created_at INTEGER NOT NULL,
      responded_at INTEGER,
      FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (recipient_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- 4. Notification Dispatch & Status
    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('connection_request', 'connection_accepted', 'new_message', 'reaction', 'milestone', 'system', 'security_alert')),
      title TEXT NOT NULL,
      body TEXT NOT NULL,
      entity_type TEXT,
      entity_id TEXT,
      is_read INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- 5. Profile Media Gallery with Fine-Grained Privacy
    CREATE TABLE IF NOT EXISTS profile_media (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      media_type TEXT NOT NULL CHECK(media_type IN ('photo', 'video', 'audio', 'document')),
      url TEXT NOT NULL,
      thumbnail_url TEXT,
      caption TEXT,
      sort_order INTEGER NOT NULL DEFAULT 0,
      visibility TEXT NOT NULL DEFAULT 'public' CHECK(visibility IN ('public', 'matches', 'friends', 'selected', 'private')),
      created_at INTEGER NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- 6. Privacy by Design: Consent Records (GDPR Article 7)
    CREATE TABLE IF NOT EXISTS consent_records (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      consent_type TEXT NOT NULL CHECK(consent_type IN ('terms_of_service', 'privacy_policy', 'ai_processing', 'cookies_analytics', 'marketing_communication')),
      granted INTEGER NOT NULL DEFAULT 1,
      version TEXT NOT NULL DEFAULT '1.0.0',
      ip_address TEXT,
      granted_at INTEGER NOT NULL,
      revoked_at INTEGER,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- 7. User Data Export (GDPR Article 20 - Data Portability)
    CREATE TABLE IF NOT EXISTS user_data_exports (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'processing', 'completed', 'failed')),
      file_path TEXT,
      file_size_bytes INTEGER NOT NULL DEFAULT 0,
      expires_at INTEGER NOT NULL,
      requested_at INTEGER NOT NULL,
      completed_at INTEGER,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- 8. Security Audit Events (Least Privilege, IDOR attempts, Auth events)
    CREATE TABLE IF NOT EXISTS security_audit_events (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      action TEXT NOT NULL,
      domain TEXT NOT NULL,
      resource_type TEXT,
      resource_id TEXT,
      severity TEXT NOT NULL DEFAULT 'info' CHECK(severity IN ('info', 'low', 'medium', 'high', 'critical')),
      ip_address TEXT,
      user_agent TEXT,
      details_json TEXT DEFAULT '{}',
      created_at INTEGER NOT NULL
    );

    -- 9. Idempotency Keys (Deduplication for Mutating APIs)
    CREATE TABLE IF NOT EXISTS idempotency_keys (
      key TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      request_path TEXT NOT NULL,
      request_hash TEXT NOT NULL,
      response_status INTEGER NOT NULL,
      response_headers_json TEXT,
      response_body TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      expires_at INTEGER NOT NULL
    );

    -- 10. Database Backup History & Integrity Register
    CREATE TABLE IF NOT EXISTS backup_history (
      id TEXT PRIMARY KEY,
      file_name TEXT NOT NULL,
      file_path TEXT NOT NULL,
      size_bytes INTEGER NOT NULL,
      checksum TEXT,
      backup_type TEXT NOT NULL DEFAULT 'hot_wal_snapshot',
      status TEXT NOT NULL DEFAULT 'completed',
      created_at INTEGER NOT NULL
    );

    -- ========================================================================
    -- PERFORMANCE INDEXES
    -- ========================================================================
    CREATE INDEX IF NOT EXISTS idx_sessions_user ON auth_sessions(user_id, is_revoked, expires_at);
    CREATE INDEX IF NOT EXISTS idx_sessions_token ON auth_sessions(token_hash);
    CREATE INDEX IF NOT EXISTS idx_conn_req_recipient ON connection_requests(recipient_id, status);
    CREATE INDEX IF NOT EXISTS idx_conn_req_sender ON connection_requests(sender_id, status);
    CREATE INDEX IF NOT EXISTS idx_notif_user_unread ON notifications(user_id, is_read, created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_profile_media_user ON profile_media(user_id, visibility, sort_order);
    CREATE INDEX IF NOT EXISTS idx_consent_user ON consent_records(user_id, consent_type);
    CREATE INDEX IF NOT EXISTS idx_audit_domain_time ON security_audit_events(domain, created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_audit_user_time ON security_audit_events(user_id, created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_audit_severity ON security_audit_events(severity, created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_idempotency_expires ON idempotency_keys(expires_at);
  `);

  seedArchitectureData(database);
}

export function seedArchitectureData(database: Database.Database = db): void {
  const now = Date.now();

  // Seed default settings for usr_me
  const existingSettings = database.prepare('SELECT user_id FROM user_settings WHERE user_id = ?').get('usr_me');
  if (!existingSettings) {
    database.prepare(`
      INSERT OR IGNORE INTO user_settings (
        user_id, theme, language, two_factor_enabled, email_notifications, push_notifications,
        sound_effects, haptic_feedback, data_sharing_level, retention_period_days, created_at, updated_at
      ) VALUES (?, 'obsidian', 'en', 1, 1, 1, 1, 1, 'minimal', 365, ?, ?)
    `).run('usr_me', now, now);
  }

  // Seed baseline consent records for usr_me
  const consents = ['terms_of_service', 'privacy_policy', 'ai_processing'] as const;
  for (const c of consents) {
    database.prepare(`
      INSERT OR IGNORE INTO consent_records (id, user_id, consent_type, granted, version, ip_address, granted_at)
      VALUES (?, 'usr_me', ?, 1, '1.0.0', '127.0.0.1', ?)
    `).run(`cs_${c}_usr_me`, c, now);
  }

  // Seed an active auth session for usr_me
  const existingSession = database.prepare('SELECT id FROM auth_sessions WHERE user_id = ? AND is_revoked = 0').get('usr_me');
  if (!existingSession) {
    database.prepare(`
      INSERT OR IGNORE INTO auth_sessions (
        id, user_id, token_hash, device_name, ip_address, user_agent, is_revoked, expires_at, last_active_at, created_at
      ) VALUES (?, 'usr_me', ?, 'MacBook Pro / Obsidian Workstation', '127.0.0.1', 'Soulverse Native Client 1.0', 0, ?, ?, ?)
    `).run(
      'sess_seed_me_01',
      'hash_usr_me_production_token_01',
      now + 30 * 24 * 3600 * 1000, // 30 days
      now,
      now
    );
  }

  // Seed initial connection request
  const existingReq = database.prepare('SELECT id FROM connection_requests WHERE sender_id = ? AND recipient_id = ?').get('usr_dinuk', 'usr_me');
  if (!existingReq) {
    database.prepare(`
      INSERT OR IGNORE INTO connection_requests (
        id, sender_id, recipient_id, connection_type, status, note, created_at
      ) VALUES (?, 'usr_dinuk', 'usr_me', 'deep_connection', 'pending', 'Hey Kavindu! Love your writings on local-first architecture and slow correspondence.', ?)
    `).run('creq_dinuk_me', now - 3600000 * 2);

    database.prepare(`
      INSERT OR IGNORE INTO notifications (
        id, user_id, type, title, body, entity_type, entity_id, is_read, created_at
      ) VALUES (?, 'usr_me', 'connection_request', 'New Connection Request', 'Dinuk Fernando sent you a deep connection request.', 'connection_request', 'creq_dinuk_me', 0, ?)
    `).run('notif_creq_1', now - 3600000 * 2);
  }

  // Seed sample profile media
  const existingMedia = database.prepare('SELECT id FROM profile_media WHERE user_id = ?').get('usr_me');
  if (!existingMedia) {
    database.prepare(`
      INSERT OR IGNORE INTO profile_media (
        id, user_id, media_type, url, thumbnail_url, caption, sort_order, visibility, created_at
      ) VALUES 
        ('med_1', 'usr_me', 'photo', 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80', null, 'High-altitude trail run at Knuckles Range', 1, 'public', ?),
        ('med_2', 'usr_me', 'photo', 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80', null, 'Handcrafted hardware workbench & oscilloscope', 2, 'matches', ?),
        ('med_3', 'usr_me', 'audio', 'https://example.com/audio/sanctuary_field_recording.mp3', null, 'Rainfall on tea estate tin roof', 3, 'public', ?)
    `).run(now, now, now);
  }

  // Seed security audit event baseline
  const existingAudit = database.prepare('SELECT id FROM security_audit_events WHERE action = ?').get('platform_security_boot');
  if (!existingAudit) {
    database.prepare(`
      INSERT OR IGNORE INTO security_audit_events (
        id, user_id, action, domain, resource_type, resource_id, severity, ip_address, user_agent, details_json, created_at
      ) VALUES (?, 'usr_me', 'platform_security_boot', 'system_security', 'database', 'main', 'info', '127.0.0.1', 'Node.js/Express Engine', '{"engine": "SQLite WAL", "status": "secure"}', ?)
    `).run('audit_boot_01', now);
  }

  // Ensure super_admin role and permissions exist
  database.prepare(`
    INSERT OR IGNORE INTO admin_roles (id, name, description, hierarchy_level)
    VALUES ('super_admin', 'Super Administrator', 'Unrestricted master operations and configuration governance.', 100)
  `).run();

  database.prepare(`
    INSERT OR IGNORE INTO admin_permissions (id, role_id, domain, action)
    VALUES ('perm_super_all', 'super_admin', '*', '*')
  `).run();

  database.prepare(`
    INSERT OR IGNORE INTO admin_role_assignments (user_id, role_id, assigned_by, assigned_at)
    VALUES ('usr_me', 'super_admin', 'adm_system', ?)
  `).run(now);
}
