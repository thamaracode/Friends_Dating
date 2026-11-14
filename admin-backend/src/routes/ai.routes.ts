import { Router, Request, Response } from 'express';
import { adminDb } from '../db';
import { requireAdminAuth, requireAdminPermission } from '../auth/middleware';
import { AdminAuditLogger } from '../auth/audit';

export const aiRouter = Router();

aiRouter.use(requireAdminAuth);

/**
 * 1. List AI Infrastructure & Providers
 */
aiRouter.get('/providers', requireAdminPermission('ai', 'read'), (_req: Request, res: Response) => {
  try {
    const providers = adminDb.prepare(`
      SELECT * FROM admin_ai_providers ORDER BY provider_id ASC
    `).all() as any[];

    res.json({
      providers: providers.map(p => ({
        id: p.provider_id,
        name: p.provider_name,
        isGloballyEnabled: Boolean(p.is_globally_enabled),
        byokAllowed: Boolean(p.byok_allowed),
        rateLimitRpm: p.rate_limit_rpm,
        allowedModels: p.allowed_models ? JSON.parse(p.allowed_models) : [],
        defaultModel: p.default_model,
        updatedAt: p.updated_at
      }))
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to query AI providers', details: err.message });
  }
});

/**
 * 2. Update AI Provider Settings
 */
aiRouter.put('/providers/:providerId', requireAdminPermission('ai', 'write'), (req: Request, res: Response) => {
  const admin = req.admin!;
  const { providerId } = req.params;
  const { isGloballyEnabled, byokAllowed, rateLimitRpm, allowedModels, defaultModel } = req.body;
  const now = Math.floor(Date.now() / 1000);

  try {
    const existing = adminDb.prepare('SELECT * FROM admin_ai_providers WHERE provider_id = ?').get(providerId) as any;
    if (!existing) return res.status(404).json({ error: `AI Provider '${providerId}' not found` });

    const finalEnabled = isGloballyEnabled !== undefined ? (isGloballyEnabled ? 1 : 0) : existing.is_globally_enabled;
    const finalByok = byokAllowed !== undefined ? (byokAllowed ? 1 : 0) : existing.byok_allowed;
    const finalRpm = rateLimitRpm !== undefined ? Number(rateLimitRpm) : existing.rate_limit_rpm;
    const finalModels = allowedModels ? JSON.stringify(allowedModels) : existing.allowed_models;
    const finalDefault = defaultModel || existing.default_model;

    adminDb.prepare(`
      UPDATE admin_ai_providers
      SET is_globally_enabled = ?, byok_allowed = ?, rate_limit_rpm = ?,
          allowed_models = ?, default_model = ?, updated_at = ?
      WHERE provider_id = ?
    `).run(finalEnabled, finalByok, finalRpm, finalModels, finalDefault, now, providerId);

    AdminAuditLogger.log({
      adminId: admin.id,
      adminName: admin.fullName,
      action: 'UPDATE_AI_PROVIDER',
      targetType: 'AI_PROVIDER',
      targetId: providerId,
      beforeState: existing,
      afterState: { isGloballyEnabled: finalEnabled, byokAllowed: finalByok, rateLimitRpm: finalRpm },
      ipAddress: req.ip
    });

    res.json({ success: true, providerId, isGloballyEnabled: Boolean(finalEnabled) });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update AI provider', details: err.message });
  }
});

/**
 * 3. AI Usage Telemetry & BYOAI Status (Strict Privacy Masking)
 */
aiRouter.get('/usage', requireAdminPermission('ai', 'read'), (_req: Request, res: Response) => {
  try {
    const activeConnections = (adminDb.prepare('SELECT COUNT(*) as count FROM user_ai_connections WHERE is_active = 1').get() as any)?.count || 0;
    const totalRequests = (adminDb.prepare('SELECT COUNT(*) as count FROM ai_usage_records').get() as any)?.count || 0;
    const totalTokens = (adminDb.prepare('SELECT SUM(total_tokens) as tokens FROM ai_usage_records').get() as any)?.tokens || 0;

    const providerBreakdown = adminDb.prepare(`
      SELECT provider_id, COUNT(*) as request_count, SUM(total_tokens) as total_tokens
      FROM ai_usage_records
      GROUP BY provider_id
    `).all();

    res.json({
      telemetry: {
        activeUserConnections: activeConnections,
        totalRequests,
        totalTokensConsumed: totalTokens,
        providerBreakdown
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch AI usage telemetry', details: err.message });
  }
});
