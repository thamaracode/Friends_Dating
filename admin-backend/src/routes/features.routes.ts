import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { adminDb } from '../db';
import { requireAdminAuth, requireAdminPermission } from '../auth/middleware';
import { AdminAuditLogger } from '../auth/audit';

export const featuresRouter = Router();

// All routes require authentication
featuresRouter.use(requireAdminAuth);

/**
 * 1. List all features with rollout rules and status
 */
featuresRouter.get('/', requireAdminPermission('features', 'read'), (_req: Request, res: Response) => {
  try {
    const features = adminDb.prepare(`
      SELECT 
        fr.id, fr.name, fr.category, fr.tagline, fr.description,
        fr.min_app_version, fr.requires_ai, fr.requires_notifications, fr.is_premium,
        ff.state, ff.is_globally_enabled, ff.rollout_percentage,
        ff.allowed_roles_json, ff.allowed_tiers_json, ff.allowed_regions_json,
        ff.kill_switch_active, ff.kill_switch_reason, ff.updated_by, ff.updated_at
      FROM feature_registry fr
      LEFT JOIN feature_flags ff ON fr.id = ff.feature_id
      ORDER BY fr.category ASC, fr.name ASC
    `).all() as any[];

    const dependencies = adminDb.prepare('SELECT * FROM feature_dependencies').all() as any[];
    const depMap = new Map<string, string[]>();
    for (const dep of dependencies) {
      if (!depMap.has(dep.feature_id)) depMap.set(dep.feature_id, []);
      depMap.get(dep.feature_id)!.push(dep.depends_on_feature_id);
    }

    const formatted = features.map(f => ({
      id: f.id,
      name: f.name,
      category: f.category,
      tagline: f.tagline,
      description: f.description,
      minAppVersion: f.min_app_version,
      requiresAi: Boolean(f.requires_ai),
      requiresNotifications: Boolean(f.requires_notifications),
      isPremium: Boolean(f.is_premium),
      state: f.state || (f.is_globally_enabled ? 'enabled' : 'disabled'),
      isGloballyEnabled: Boolean(f.is_globally_enabled),
      rolloutPercentage: f.rollout_percentage ?? 100,
      targetRoles: f.allowed_roles_json ? JSON.parse(f.allowed_roles_json) : [],
      targetTiers: f.allowed_tiers_json ? JSON.parse(f.allowed_tiers_json) : [],
      allowedRegions: f.allowed_regions_json ? JSON.parse(f.allowed_regions_json) : ['GLOBAL'],
      isKillSwitched: Boolean(f.kill_switch_active),
      killSwitchReason: f.kill_switch_reason || null,
      updatedBy: f.updated_by,
      updatedAt: f.updated_at,
      dependencies: depMap.get(f.id) || []
    }));

    res.json({ features: formatted });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch feature registry', details: err.message });
  }
});

/**
 * 2. Update Feature Flag State & Rollout
 */
featuresRouter.put('/:featureId', requireAdminPermission('features', 'write'), (req: Request, res: Response) => {
  const admin = req.admin!;
  const { featureId } = req.params;
  const {
    state,
    isGloballyEnabled,
    rolloutPercentage,
    targetRoles,
    targetTiers,
    allowedRegions,
    reason
  } = req.body;

  try {
    const existing = adminDb.prepare(`
      SELECT * FROM feature_flags WHERE feature_id = ?
    `).get(featureId) as any;

    if (!existing) {
      return res.status(404).json({ error: `Feature flag for '${featureId}' not found` });
    }

    const now = Math.floor(Date.now() / 1000);
    const validStates = ['available', 'enabled', 'disabled', 'restricted', 'paused', 'maintenance', 'beta', 'deprecated'];
    const finalState = validStates.includes(state) ? state : (isGloballyEnabled ? 'enabled' : 'disabled');
    const finalGlobal = isGloballyEnabled !== undefined ? (isGloballyEnabled ? 1 : 0) : (finalState === 'enabled' ? 1 : 0);
    const finalRollout = rolloutPercentage !== undefined ? Math.max(0, Math.min(100, Number(rolloutPercentage))) : existing.rollout_percentage;
    const finalRoles = targetRoles ? JSON.stringify(targetRoles) : existing.allowed_roles_json;
    const finalTiers = targetTiers ? JSON.stringify(targetTiers) : existing.allowed_tiers_json;
    const finalRegions = allowedRegions ? JSON.stringify(allowedRegions) : (existing.allowed_regions_json || '["GLOBAL"]');

    adminDb.prepare(`
      UPDATE feature_flags
      SET state = ?, is_globally_enabled = ?, rollout_percentage = ?,
          allowed_roles_json = ?, allowed_tiers_json = ?, allowed_regions_json = ?,
          updated_by = ?, updated_at = ?
      WHERE feature_id = ?
    `).run(finalState, finalGlobal, finalRollout, finalRoles, finalTiers, finalRegions, admin.fullName, now, featureId);

    AdminAuditLogger.log({
      adminId: admin.id,
      adminName: admin.fullName,
      action: 'UPDATE_FEATURE_FLAG',
      targetType: 'FEATURE_FLAG',
      targetId: featureId,
      beforeState: existing,
      afterState: { state: finalState, isGloballyEnabled: finalGlobal, rolloutPercentage: finalRollout },
      reason: reason || `Updated by ${admin.fullName} (${admin.roleName})`,
      ipAddress: req.ip
    });

    res.json({
      success: true,
      message: `Feature ${featureId} updated`,
      featureId,
      state: finalState,
      rolloutPercentage: finalRollout
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update feature flag', details: err.message });
  }
});

/**
 * 3. Emergency Kill-Switch Activation / Deactivation
 */
featuresRouter.post('/:featureId/kill-switch', requireAdminPermission('features', 'write'), (req: Request, res: Response) => {
  const admin = req.admin!;
  const { featureId } = req.params;
  const { active, reason = 'Emergency kill-switch triggered by administrator' } = req.body;
  const now = Math.floor(Date.now() / 1000);

  try {
    const existing = adminDb.prepare('SELECT * FROM feature_flags WHERE feature_id = ?').get(featureId) as any;
    if (!existing) {
      return res.status(404).json({ error: `Feature flag '${featureId}' not found` });
    }

    adminDb.prepare(`
      UPDATE feature_flags
      SET kill_switch_active = ?, kill_switch_reason = ?, updated_by = ?, updated_at = ?
      WHERE feature_id = ?
    `).run(active ? 1 : 0, active ? String(reason).trim() : null, admin.fullName, now, featureId);

    AdminAuditLogger.log({
      adminId: admin.id,
      adminName: admin.fullName,
      action: active ? 'ACTIVATE_KILL_SWITCH' : 'DEACTIVATE_KILL_SWITCH',
      targetType: 'FEATURE_FLAG',
      targetId: featureId,
      reason: String(reason).trim(),
      ipAddress: req.ip
    });

    res.json({
      success: true,
      featureId,
      isKillSwitched: Boolean(active),
      reason: active ? reason : null
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update kill switch', details: err.message });
  }
});

/**
 * 4. Dependency Graph
 */
featuresRouter.get('/dependency-graph', requireAdminPermission('features', 'read'), (_req: Request, res: Response) => {
  try {
    const features = adminDb.prepare(`
      SELECT fr.id, fr.name, fr.category, ff.is_globally_enabled, ff.state
      FROM feature_registry fr
      LEFT JOIN feature_flags ff ON fr.id = ff.feature_id
    `).all() as any[];

    const dependencies = adminDb.prepare('SELECT * FROM feature_dependencies').all() as any[];

    res.json({
      nodes: features.map(f => ({
        id: f.id,
        label: f.name,
        category: f.category,
        enabled: Boolean(f.is_globally_enabled),
        state: f.state
      })),
      edges: dependencies.map(d => ({
        from: d.depends_on_feature_id,
        to: d.feature_id,
        type: d.is_hard_dependency ? 'hard' : 'soft'
      }))
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to build dependency graph', details: err.message });
  }
});

/**
 * 5. Configuration Versions & Snapshots
 */
featuresRouter.get('/configuration/versions', requireAdminPermission('config', 'read'), (_req: Request, res: Response) => {
  try {
    const versions = adminDb.prepare('SELECT * FROM configuration_versions ORDER BY version_number DESC LIMIT 30').all();
    res.json({ versions });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to query versions', details: err.message });
  }
});

featuresRouter.post('/configuration/create-snapshot', requireAdminPermission('config', 'write'), (req: Request, res: Response) => {
  const admin = req.admin!;
  const { changeSummary = 'Manual snapshot' } = req.body;
  const now = Math.floor(Date.now() / 1000);

  try {
    const currentMax = (adminDb.prepare('SELECT MAX(version_number) as maxVer FROM configuration_versions').get() as any)?.maxVer || 0;
    const nextVer = currentMax + 1;

    const flags = adminDb.prepare('SELECT * FROM feature_flags').all();
    const presets = adminDb.prepare('SELECT * FROM user_experience_presets').all();

    const snapshot = {
      version: nextVer,
      timestamp: now,
      featureFlags: flags,
      experiencePresets: presets
    };

    const id = `ver_${nextVer}_${now}`;
    adminDb.prepare(`
      INSERT INTO configuration_versions (id, version_number, snapshot_json, created_by, change_summary, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(id, nextVer, JSON.stringify(snapshot), admin.fullName, changeSummary.trim(), now);

    AdminAuditLogger.log({
      adminId: admin.id,
      adminName: admin.fullName,
      action: 'CREATE_CONFIG_SNAPSHOT',
      targetType: 'VERSION',
      targetId: id,
      afterState: { version: nextVer, summary: changeSummary },
      ipAddress: req.ip
    });

    res.json({ success: true, versionNumber: nextVer, snapshotId: id });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to create snapshot', details: err.message });
  }
});

featuresRouter.post('/configuration/rollback/:versionId', requireAdminPermission('config', 'write'), (req: Request, res: Response) => {
  const admin = req.admin!;
  const { versionId } = req.params;
  const { reason = 'Emergency configuration rollback' } = req.body;
  const now = Math.floor(Date.now() / 1000);

  try {
    const ver = adminDb.prepare('SELECT * FROM configuration_versions WHERE id = ?').get(versionId) as any;
    if (!ver) return res.status(404).json({ error: `Version snapshot ${versionId} not found` });

    const data = JSON.parse(ver.snapshot_json);
    const rollbackTx = adminDb.transaction(() => {
      if (data.featureFlags && Array.isArray(data.featureFlags)) {
        for (const flag of data.featureFlags) {
          adminDb.prepare(`
            UPDATE feature_flags
            SET is_globally_enabled = ?, rollout_percentage = ?, target_roles = ?,
                target_tiers = ?, is_kill_switched = ?, updated_by = ?, updated_at = ?
            WHERE feature_id = ?
          `).run(
            flag.is_globally_enabled, flag.rollout_percentage, flag.target_roles,
            flag.target_tiers, flag.is_kill_switched, `Rollback by ${admin.fullName}`, now, flag.feature_id
          );
        }
      }
    });

    rollbackTx();

    AdminAuditLogger.log({
      adminId: admin.id,
      adminName: admin.fullName,
      action: 'ROLLBACK_CONFIG_SNAPSHOT',
      targetType: 'VERSION',
      targetId: versionId,
      reason,
      ipAddress: req.ip
    });

    res.json({ success: true, message: `Successfully rolled back to version ${ver.version_number}`, versionNumber: ver.version_number });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to rollback configuration', details: err.message });
  }
});

/**
 * 6. Feature Adoption Stats
 */
featuresRouter.get('/analytics/adoption', requireAdminPermission('analytics', 'read'), (_req: Request, res: Response) => {
  try {
    const totalUsers = (adminDb.prepare('SELECT COUNT(*) as count FROM users').get() as any)?.count || 1;
    const stats = adminDb.prepare(`
      SELECT 
        fr.id as feature_id, fr.name, fr.category,
        COUNT(ufp.user_id) as active_users,
        ROUND((COUNT(ufp.user_id) * 100.0) / ?, 1) as adoption_rate
      FROM feature_registry fr
      LEFT JOIN user_feature_preferences ufp 
        ON fr.id = ufp.feature_id AND ufp.state = 'enabled'
      GROUP BY fr.id
      ORDER BY adoption_rate DESC
    `).all(totalUsers);

    res.json({ stats, totalUsers });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to compute adoption analytics', details: err.message });
  }
});
