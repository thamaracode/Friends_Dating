import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { db } from '../db';
import { v4 as uuidv4 } from 'uuid';
import { ConsentType, ConsentRecord, UserDataExport } from './types';
import { AccessControlEngine } from './accessControl';

export class DataProtectionService {
  /**
   * Generates a complete GDPR Article 20 Data Portability Export Bundle.
   * Compiles all personal dimensions, sections, timeline, confessions, and memories.
   */
  public static async generateDataExport(userId: string): Promise<UserDataExport> {
    const now = Date.now();
    const exportId = `exp_${uuidv4().replace(/-/g, '').slice(0, 16)}`;

    // 1. Gather all user records safely
    const user = db.prepare('SELECT id, name, username, avatar_url, is_verified, last_seen_at, status_text FROM users WHERE id = ?').get(userId);
    const settings = db.prepare('SELECT * FROM user_settings WHERE user_id = ?').get(userId);
    const consents = db.prepare('SELECT * FROM consent_records WHERE user_id = ?').all(userId);
    const identities = db.prepare('SELECT * FROM user_identities WHERE user_id = ?').all(userId);
    const sections = db.prepare('SELECT * FROM profile_sections WHERE user_id = ?').all(userId);
    const entries = db.prepare('SELECT * FROM profile_entries WHERE user_id = ?').all(userId);
    const questions = db.prepare('SELECT * FROM profile_questions WHERE user_id = ?').all(userId);
    const answers = db.prepare('SELECT * FROM profile_answers WHERE user_id = ?').all(userId);
    const timeline = db.prepare('SELECT * FROM profile_timeline_events WHERE user_id = ?').all(userId);
    const thoughts = db.prepare('SELECT * FROM profile_thoughts WHERE user_id = ?').all(userId);
    const lifeYears = db.prepare('SELECT * FROM life_years WHERE user_id = ?').all(userId);
    const lifeEvents = db.prepare('SELECT * FROM life_events WHERE user_id = ?').all(userId);
    const markdown = db.prepare('SELECT * FROM profile_markdowns WHERE user_id = ?').get(userId);
    const personality = db.prepare('SELECT * FROM user_personality_profiles WHERE user_id = ?').get(userId);
    const reflections = db.prepare('SELECT * FROM user_reflection_responses WHERE user_id = ?').all(userId);
    const confessions = db.prepare('SELECT id, title, story, category, mood, visibility, tags, created_at FROM confessions WHERE user_id = ?').all(userId);
    const socialLinks = db.prepare('SELECT * FROM user_social_links WHERE user_id = ?').all(userId);
    const profileMedia = db.prepare('SELECT * FROM profile_media WHERE user_id = ?').all(userId);
    const relationships = db.prepare('SELECT * FROM user_relationships WHERE user_id = ?').all(userId);

    // Filter AI connections to omit raw ciphertext / keys
    const aiConnections = (db.prepare('SELECT id, provider, name, key_mask, custom_endpoint, default_model, is_enabled, created_at FROM user_ai_connections WHERE user_id = ?').all(userId) as any[]) || [];

    const bundle = {
      exportVersion: '1.0.0',
      exportedAt: new Date(now).toISOString(),
      user,
      settings,
      consents,
      identities,
      profileSections: sections,
      profileEntries: entries,
      questions,
      answers,
      timeline,
      thoughts,
      lifeYears,
      lifeEvents,
      markdownManifesto: markdown,
      personalityProfile: personality,
      reflectionResponses: reflections,
      confessions,
      socialLinks,
      profileMedia,
      relationships,
      aiProvidersConfig: aiConnections,
      privacyStatement: 'This export contains all personal identity dimensions, reflections, and context records associated with your account in compliance with GDPR Article 20.'
    };

    const exportsDir = path.resolve(__dirname, '../../uploads/exports');
    if (!fs.existsSync(exportsDir)) {
      fs.mkdirSync(exportsDir, { recursive: true });
    }

    const fileName = `export_${userId}_${now}.json`;
    const filePath = path.join(exportsDir, fileName);
    const content = JSON.stringify(bundle, null, 2);

    fs.writeFileSync(filePath, content, 'utf8');
    const fileSizeBytes = Buffer.byteLength(content, 'utf8');
    const expiresAt = now + 7 * 24 * 3600 * 1000; // 7 days download window

    db.prepare(`
      INSERT INTO user_data_exports (
        id, user_id, status, file_path, file_size_bytes, expires_at, requested_at, completed_at
      ) VALUES (?, ?, 'completed', ?, ?, ?, ?, ?)
    `).run(exportId, userId, filePath, fileSizeBytes, expiresAt, now, now);

    AccessControlEngine.logSecurityAudit({
      userId,
      action: 'gdpr_data_export_completed',
      domain: 'data_protection',
      resourceType: 'user_data_export',
      resourceId: exportId,
      severity: 'info',
      details: { fileSizeBytes, expiresAt }
    });

    return {
      id: exportId,
      userId,
      status: 'completed',
      filePath,
      fileSizeBytes,
      expiresAt,
      requestedAt: now,
      completedAt: now
    };
  }

  /**
   * GDPR Article 17 Right to Erasure / Account Deletion.
   * Completely purges or cascades all user-owned records within an atomic SQLite transaction.
   */
  public static deleteUserAccount(userId: string, reason: string = 'User requested account erasure'): {
    success: boolean;
    purgedTables: Record<string, number>;
  } {
    AccessControlEngine.logSecurityAudit({
      userId,
      action: 'gdpr_account_deletion_initiated',
      domain: 'data_protection',
      resourceType: 'user',
      resourceId: userId,
      severity: 'critical',
      details: { reason }
    });

    const purgedTables: Record<string, number> = {};

    const deleteTx = db.transaction(() => {
      // 1. Explicit cleanups on tables with compound keys or direct relationships
      const tablesToDelete = [
        'user_settings',
        'auth_sessions',
        'consent_records',
        'user_data_exports',
        'notifications',
        'profile_media',
        'connection_requests',
        'user_relationships',
        'user_activity_preferences',
        'daily_member_preferences',
        'daily_member_assignments',
        'daily_content_feedback',
        'daily_member_streaks',
        'user_personality_profiles',
        'user_reflection_responses',
        'user_trait_history',
        'private_viewer_notes',
        'profile_votes',
        'profile_trait_votes',
        'confessions',
        'confession_reactions',
        'profile_markdowns',
        'user_social_links',
        'user_favorite_stickers',
        'user_recent_stickers',
        'user_recent_emojis',
        'user_sticker_packs',
        'user_ai_connections',
        'user_ai_task_routing',
        'user_ai_permissions',
        'user_ai_spending_limits',
        'ai_usage_records',
        'user_feature_preferences',
        'user_experience_presets',
        'quote_user_history',
        'quote_user_interactions',
        'quote_user_preferences',
        'profile_world_entries',
        'profile_world_sections',
        'profile_worlds',
        'identity_timeline_events',
        'identity_custom_sections',
        'user_identities',
        'life_reflections',
        'life_events',
        'life_years',
        'life_chapters',
        'profile_answers',
        'profile_questions',
        'profile_entries',
        'profile_sections',
        'profile_timeline_events',
        'profile_thoughts',
        'user_blocks'
      ];

      for (const table of tablesToDelete) {
        try {
          const res = db.prepare(`DELETE FROM ${table} WHERE user_id = ? OR requester_id = ? OR recipient_id = ? OR viewer_id = ? OR target_user_id = ? OR blocker_id = ? OR blocked_id = ? OR voter_id = ?`).run(userId, userId, userId, userId, userId, userId, userId, userId);
          purgedTables[table] = res.changes;
        } catch {
          try {
            const res = db.prepare(`DELETE FROM ${table} WHERE user_id = ?`).run(userId);
            purgedTables[table] = res.changes;
          } catch {
            // Table might not have user_id column
          }
        }
      }

      // Anonymize or remove messages
      try {
        const msgRes = db.prepare("UPDATE messages SET text_content = '[Message deleted by user account erasure]', is_deleted_for_everyone = 1 WHERE sender_id = ?").run(userId);
        purgedTables['messages_anonymized'] = msgRes.changes;
      } catch {
        // Ignore
      }

      // Finally remove from users table (cascades any remaining foreign keys)
      const userRes = db.prepare('DELETE FROM users WHERE id = ?').run(userId);
      purgedTables['users'] = userRes.changes;
    });

    deleteTx();

    AccessControlEngine.logSecurityAudit({
      userId,
      action: 'gdpr_account_deletion_completed',
      domain: 'data_protection',
      resourceType: 'user',
      resourceId: userId,
      severity: 'critical',
      details: { purgedTables }
    });

    return {
      success: true,
      purgedTables
    };
  }

  /**
   * Consent Record Operations
   */
  public static recordConsent(params: {
    userId: string;
    consentType: ConsentType;
    granted: boolean;
    version?: string;
    ipAddress?: string;
  }): ConsentRecord {
    const id = `cs_${params.consentType}_${params.userId}`;
    const now = Date.now();
    const version = params.version || '1.0.0';

    db.prepare(`
      INSERT OR REPLACE INTO consent_records (
        id, user_id, consent_type, granted, version, ip_address, granted_at, revoked_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      params.userId,
      params.consentType,
      params.granted ? 1 : 0,
      version,
      params.ipAddress || '127.0.0.1',
      params.granted ? now : now,
      params.granted ? null : now
    );

    AccessControlEngine.logSecurityAudit({
      userId: params.userId,
      action: params.granted ? 'consent_granted' : 'consent_revoked',
      domain: 'consent_management',
      resourceType: 'consent_record',
      resourceId: id,
      severity: 'info',
      details: { consentType: params.consentType, version }
    });

    return {
      id,
      userId: params.userId,
      consentType: params.consentType,
      granted: params.granted,
      version,
      ipAddress: params.ipAddress,
      grantedAt: now,
      revokedAt: params.granted ? undefined : now
    };
  }

  public static getUserConsents(userId: string): ConsentRecord[] {
    const rows = db.prepare('SELECT * FROM consent_records WHERE user_id = ?').all(userId) as any[];
    return rows.map(r => ({
      id: r.id,
      userId: r.user_id,
      consentType: r.consent_type,
      granted: Boolean(r.granted),
      version: r.version,
      ipAddress: r.ip_address,
      grantedAt: r.granted_at,
      revokedAt: r.revoked_at || undefined
    }));
  }

  /**
   * Data Retention Policies:
   * Cleans stale sessions, expired exports, and stale idempotency records.
   */
  public static executeRetentionPolicies(): {
    expiredSessionsCleaned: number;
    expiredExportsCleaned: number;
    expiredIdempotencyKeysCleaned: number;
  } {
    const now = Date.now();

    // 1. Revoke/delete expired sessions
    const sessionRes = db.prepare('DELETE FROM auth_sessions WHERE expires_at <= ?').run(now);

    // 2. Delete expired data exports and files
    const expiredExports = db.prepare('SELECT id, file_path FROM user_data_exports WHERE expires_at <= ?').all(now) as any[];
    for (const exp of expiredExports) {
      if (exp.file_path && fs.existsSync(exp.file_path)) {
        try {
          fs.unlinkSync(exp.file_path);
        } catch {
          // File may already be removed
        }
      }
    }
    const exportRes = db.prepare('DELETE FROM user_data_exports WHERE expires_at <= ?').run(now);

    // 3. Delete expired idempotency keys
    const idempRes = db.prepare('DELETE FROM idempotency_keys WHERE expires_at <= ?').run(now);

    return {
      expiredSessionsCleaned: sessionRes.changes,
      expiredExportsCleaned: exportRes.changes,
      expiredIdempotencyKeysCleaned: idempRes.changes
    };
  }
}
