import { describe, it, expect, beforeEach } from 'vitest';
import { db } from './db';

describe('Feature Management & Personalization Architecture (The Control Layer)', () => {
  const BASE_URL = 'http://127.0.0.1:3001/api';

  beforeEach(() => {
    // Reset test user preferences to a clean known state
    db.prepare("DELETE FROM user_feature_preferences WHERE user_id = 'test_eval_user'").run();
    db.prepare("DELETE FROM user_experience_presets WHERE user_id = 'test_eval_user'").run();
  });

  it('1. GET /api/features/registry returns all 16 registered master features with Universal Feature Specification', async () => {
    const res = await fetch(`${BASE_URL}/features/registry`);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(Array.isArray(body.features)).toBe(true);
    expect(body.features.length).toBeGreaterThanOrEqual(16);

    const vault = body.features.find((f: any) => f.id === 'feat_relationship_vault');
    expect(vault).toBeDefined();
    expect(vault.name).toBe('Relationship Vault & Memories');
    expect(vault.category).toBe('relationships');
    expect(vault.privacy_level).toBe('private_encrypted');
    expect(Array.isArray(vault.collectedData)).toBe(true);
    expect(vault.collectedData.length).toBeGreaterThan(0);
    expect(vault.disable_behavior).toBeDefined();
    expect(vault.data_retention_rule).toBeDefined();
  });

  it('2. GET /api/features/evaluation/:userId evaluates feature states according to the 4-tier pipeline', async () => {
    const res = await fetch(`${BASE_URL}/features/evaluation/test_eval_user`);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.userId).toBe('test_eval_user');
    expect(Array.isArray(body.features)).toBe(true);

    const dating = body.features.find((f: any) => f.id === 'feat_dating');
    expect(dating).toBeDefined();
    expect(dating.effectiveState).toBe('enabled');
    expect(dating.isVisible).toBe(true);
    expect(dating.isDiscoverable).toBe(true);
  });

  it('3. POST /api/features/user-preferences toggles user module state without deleting data', async () => {
    // Turn off relationship vault
    const toggleRes = await fetch(`${BASE_URL}/features/user-preferences`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: 'test_eval_user',
        featureId: 'feat_relationship_vault',
        state: 'disabled',
        isVisible: 0,
        isDiscoverable: 0
      })
    });

    expect(toggleRes.status).toBe(200);
    const toggleBody = await toggleRes.json();
    expect(toggleBody.success).toBe(true);

    // Verify evaluation now reflects disabled
    const evalRes = await fetch(`${BASE_URL}/features/evaluation/test_eval_user`);
    const evalBody = await evalRes.json();
    const vault = evalBody.features.find((f: any) => f.id === 'feat_relationship_vault');
    expect(vault.effectiveState).toBe('disabled');
    expect(vault.isVisible).toBe(false);
    expect(vault.isDiscoverable).toBe(false);
  });

  it('4. POST /api/features/apply-preset applies pre-packaged experience presets', async () => {
    // Apply Simple Social preset
    const presetRes = await fetch(`${BASE_URL}/features/apply-preset`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: 'test_eval_user',
        preset: 'simple_social'
      })
    });

    expect(presetRes.status).toBe(200);
    const presetBody = await presetRes.json();
    expect(presetBody.success).toBe(true);
    expect(presetBody.preset).toBe('simple_social');

    // Evaluate features under simple_social
    const evalRes = await fetch(`${BASE_URL}/features/evaluation/test_eval_user`);
    const evalBody = await evalRes.json();
    expect(evalBody.activePreset).toBe('simple_social');

    const friends = evalBody.features.find((f: any) => f.id === 'feat_friendships');
    const dating = evalBody.features.find((f: any) => f.id === 'feat_dating');
    const vault = evalBody.features.find((f: any) => f.id === 'feat_relationship_vault');

    expect(friends.effectiveState).toBe('enabled');
    expect(friends.isVisible).toBe(true);

    // Dating and Vault should be disabled under simple_social
    expect(dating.effectiveState).toBe('disabled');
    expect(vault.effectiveState).toBe('disabled');
  });

  it('5. Admin Emergency Kill-Switch overrides user preference and records audit log with reason', async () => {
    // Trip kill switch for AI assistant
    const killRes = await fetch(`${BASE_URL}/admin/features/feat_ai_assistant/kill-switch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        adminId: 'adm_sec_01',
        adminName: 'Security Lead',
        active: true,
        reason: 'Investigating potential external rate-limit anomaly'
      })
    });

    expect(killRes.status).toBe(200);
    const killBody = await killRes.json();
    expect(killBody.killSwitchActive).toBe(true);

    // User should see module as unavailable regardless of their preference
    const evalRes = await fetch(`${BASE_URL}/features/evaluation/test_eval_user`);
    const evalBody = await evalRes.json();
    const aiFeat = evalBody.features.find((f: any) => f.id === 'feat_ai_assistant');
    expect(aiFeat.effectiveState).toBe('unavailable');
    expect(aiFeat.reason).toContain('Investigating potential external rate-limit anomaly');

    // Verify audit log has recorded the action
    const auditRes = await fetch(`${BASE_URL}/admin/audit-logs`);
    expect(auditRes.status).toBe(200);
    const auditBody = await auditRes.json();
    const killLog = auditBody.logs.find((l: any) => l.action === 'kill_switch_trip' && l.target_id === 'feat_ai_assistant');
    expect(killLog).toBeDefined();
    expect(killLog.reason).toBe('Investigating potential external rate-limit anomaly');

    // Release kill switch to restore baseline
    await fetch(`${BASE_URL}/admin/features/feat_ai_assistant/kill-switch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        adminId: 'adm_sec_01',
        adminName: 'Security Lead',
        active: false,
        reason: 'Anomaly cleared; restoring normal service'
      })
    });
  });

  it('6. PUT /api/admin/features/:featureId updates rollout percentage with mandatory audit reason', async () => {
    const updateRes = await fetch(`${BASE_URL}/admin/features/feat_cinematic_profiles`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        adminId: 'adm_prod_01',
        adminName: 'Product VP',
        rolloutPercentage: 50,
        reason: 'Beginning Phase 2 beta rollout to 50% cohort'
      })
    });

    expect(updateRes.status).toBe(200);
    const updateBody = await updateRes.json();
    expect(updateBody.rolloutPercentage).toBe(50);

    // Attempting update without reason should fail with 400
    const failRes = await fetch(`${BASE_URL}/admin/features/feat_cinematic_profiles`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        rolloutPercentage: 75,
        reason: ''
      })
    });
    expect(failRes.status).toBe(400);

    // Restore to 100%
    await fetch(`${BASE_URL}/admin/features/feat_cinematic_profiles`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        rolloutPercentage: 100,
        reason: 'Restoring full 100% rollout'
      })
    });
  });

  it('7. GET /api/admin/analytics/adoption computes adoption statistics across all registered modules', async () => {
    const res = await fetch(`${BASE_URL}/admin/analytics/adoption`);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(Array.isArray(body.stats)).toBe(true);
    expect(body.stats.length).toBeGreaterThanOrEqual(16);
  });
});
