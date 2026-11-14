import Database from 'better-sqlite3';
import { CONFIG } from './config';
import { AdminCrypto } from './auth/crypto';

export const adminDb = new Database(CONFIG.DB_PATH);

// Enable WAL mode and foreign keys
adminDb.pragma('journal_mode = WAL');
adminDb.pragma('foreign_keys = ON');

export function initAdminDatabase() {
  adminDb.exec(`
    -- =========================================================================
    -- DEDICATED ADMIN RBAC & AUTHENTICATION TABLES
    -- =========================================================================
    CREATE TABLE IF NOT EXISTS admin_roles (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      hierarchy_level INTEGER NOT NULL DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS admin_permissions (
      id TEXT PRIMARY KEY,
      role_id TEXT NOT NULL,
      domain TEXT NOT NULL,
      action TEXT NOT NULL,
      FOREIGN KEY (role_id) REFERENCES admin_roles(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS admin_users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      password_salt TEXT NOT NULL,
      full_name TEXT NOT NULL,
      role_id TEXT NOT NULL,
      is_active INTEGER DEFAULT 1,
      mfa_enabled INTEGER DEFAULT 1,
      mfa_secret TEXT NOT NULL,
      failed_login_attempts INTEGER DEFAULT 0,
      locked_until INTEGER,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      FOREIGN KEY (role_id) REFERENCES admin_roles(id)
    );

    CREATE TABLE IF NOT EXISTS admin_sessions (
      id TEXT PRIMARY KEY,
      admin_id TEXT NOT NULL,
      token_hash TEXT NOT NULL,
      ip_address TEXT NOT NULL,
      user_agent TEXT NOT NULL,
      expires_at INTEGER NOT NULL,
      created_at INTEGER NOT NULL,
      last_active_at INTEGER NOT NULL,
      revoked_at INTEGER,
      FOREIGN KEY (admin_id) REFERENCES admin_users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS admin_login_history (
      id TEXT PRIMARY KEY,
      admin_id TEXT,
      email TEXT NOT NULL,
      ip_address TEXT NOT NULL,
      user_agent TEXT NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('success', 'failed', 'mfa_required', 'locked', 'mfa_failed')),
      failure_reason TEXT,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS admin_recovery_tokens (
      id TEXT PRIMARY KEY,
      admin_id TEXT NOT NULL,
      token_hash TEXT NOT NULL,
      expires_at INTEGER NOT NULL,
      used_at INTEGER,
      created_at INTEGER NOT NULL,
      FOREIGN KEY (admin_id) REFERENCES admin_users(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_adm_sess_admin ON admin_sessions(admin_id, revoked_at);
    CREATE INDEX IF NOT EXISTS idx_adm_log_hist_email ON admin_login_history(email, created_at DESC);
  `);

  // Safe schema migrations for central feature lifecycle states
  try {
    adminDb.exec("ALTER TABLE feature_flags ADD COLUMN state TEXT DEFAULT 'enabled'");
  } catch {}
  try {
    adminDb.exec("ALTER TABLE feature_flags ADD COLUMN allowed_regions_json TEXT DEFAULT '[\"GLOBAL\"]'");
  } catch {}

  seedAdminRolesAndPermissions();
  seedInitialAdminUsers();
}

function seedAdminRolesAndPermissions() {
  const roles = [
    { id: 'super_admin', name: 'Super Administrator', description: 'Unrestricted enterprise control over all features, security, and personnel.', level: 10 },
    { id: 'sys_admin', name: 'System Administrator', description: 'Core infrastructure, SQLite operations, rate limits, and network safety.', level: 9 },
    { id: 'techops_admin', name: 'Technical Operations Administrator', description: 'Monitoring, background jobs, database checkpointing, and logs.', level: 8 },
    { id: 'product_admin', name: 'Product Administrator', description: 'Feature registry, rollout percentages, experiments, and presets.', level: 8 },
    { id: 'user_admin', name: 'User Management Administrator', description: 'Account lifecycle, verification badges, user attributes, and suspension.', level: 7 },
    { id: 'content_moderator', name: 'Content Moderator', description: 'Abuse reports, user blocks, safety flags, and community moderation.', level: 6 },
    { id: 'ai_admin', name: 'AI Administrator', description: 'AI provider availability, model routing, usage quotas, and BYOAI status.', level: 6 },
    { id: 'finance_admin', name: 'Finance Administrator', description: 'Subscription tiers, entitlements, and billing limits.', level: 5 },
    { id: 'support_admin', name: 'Support Administrator', description: 'Assisting users, reviewing report context without private content.', level: 5 },
    { id: 'analytics_admin', name: 'Analytics Administrator', description: 'Read-only telemetry, feature adoption trends, and platform metrics.', level: 5 }
  ];

  const insertRole = adminDb.prepare(`
    INSERT OR REPLACE INTO admin_roles (id, name, description, hierarchy_level)
    VALUES (?, ?, ?, ?)
  `);

  for (const r of roles) {
    insertRole.run(r.id, r.name, r.description, r.level);
  }

  // Pre-seed core permission domain mappings
  const permissions: { roleId: string; domain: string; action: string }[] = [
    // Super Admin has all domains
    { roleId: 'super_admin', domain: '*', action: '*' },

    // System Admin
    { roleId: 'sys_admin', domain: 'system', action: '*' },
    { roleId: 'sys_admin', domain: 'config', action: '*' },
    { roleId: 'sys_admin', domain: 'audit', action: 'read' },
    { roleId: 'sys_admin', domain: 'features', action: '*' },

    // TechOps Admin
    { roleId: 'techops_admin', domain: 'system', action: '*' },
    { roleId: 'techops_admin', domain: 'audit', action: 'read' },

    // Product Admin
    { roleId: 'product_admin', domain: 'features', action: '*' },
    { roleId: 'product_admin', domain: 'config', action: '*' },
    { roleId: 'product_admin', domain: 'analytics', action: 'read' },

    // User Admin
    { roleId: 'user_admin', domain: 'users', action: '*' },
    { roleId: 'user_admin', domain: 'reports', action: '*' },
    { roleId: 'user_admin', domain: 'audit', action: 'read' },

    // Content Moderator
    { roleId: 'content_moderator', domain: 'reports', action: '*' },
    { roleId: 'content_moderator', domain: 'users', action: 'read' },
    { roleId: 'content_moderator', domain: 'users', action: 'moderate' },

    // AI Admin
    { roleId: 'ai_admin', domain: 'ai', action: '*' },
    { roleId: 'ai_admin', domain: 'features', action: 'read' },

    // Analytics Admin
    { roleId: 'analytics_admin', domain: 'analytics', action: 'read' },
    { roleId: 'analytics_admin', domain: 'features', action: 'read' },

    // Finance Admin
    { roleId: 'finance_admin', domain: 'billing', action: '*' },
    { roleId: 'finance_admin', domain: 'features', action: 'read' }
  ];

  const insertPerm = adminDb.prepare(`
    INSERT OR IGNORE INTO admin_permissions (id, role_id, domain, action)
    VALUES (?, ?, ?, ?)
  `);

  for (const p of permissions) {
    insertPerm.run(`perm_${p.roleId}_${p.domain}_${p.action}`, p.roleId, p.domain, p.action);
  }
}

function seedInitialAdminUsers() {
  const count = (adminDb.prepare('SELECT COUNT(*) as count FROM admin_users').get() as { count: number }).count;
  if (count > 0) return;

  const now = Math.floor(Date.now() / 1000);

  const initialAdmins = [
    {
      id: 'adm_super_01',
      email: 'superadmin@soulverse.im',
      password: 'Admin@Soulverse2026!',
      fullName: 'Super Administrator',
      roleId: 'super_admin',
      mfaSecret: 'DEMO_MFA_SECRET_1926'
    },
    {
      id: 'adm_sys_01',
      email: 'sysadmin@soulverse.im',
      password: 'SysAdmin@2026!',
      fullName: 'Chief Infrastructure Officer',
      roleId: 'sys_admin',
      mfaSecret: 'DEMO_MFA_SECRET_1926'
    },
    {
      id: 'adm_mod_01',
      email: 'moderator@soulverse.im',
      password: 'Mod@Soulverse2026!',
      fullName: 'Lead Safety & Trust Moderator',
      roleId: 'content_moderator',
      mfaSecret: 'DEMO_MFA_SECRET_1926'
    },
    {
      id: 'adm_ai_01',
      email: 'aiadmin@soulverse.im',
      password: 'AIAdmin@2026!',
      fullName: 'Principal Intelligence Architect',
      roleId: 'ai_admin',
      mfaSecret: 'DEMO_MFA_SECRET_1926'
    }
  ];

  const stmt = adminDb.prepare(`
    INSERT INTO admin_users (
      id, email, password_hash, password_salt, full_name, role_id,
      is_active, mfa_enabled, mfa_secret, failed_login_attempts, locked_until,
      created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, 1, 1, ?, 0, NULL, ?, ?)
  `);

  for (const adm of initialAdmins) {
    const { hash, salt } = AdminCrypto.hashPassword(adm.password);
    stmt.run(adm.id, adm.email, hash, salt, adm.fullName, adm.roleId, adm.mfaSecret, now, now);
  }
}
