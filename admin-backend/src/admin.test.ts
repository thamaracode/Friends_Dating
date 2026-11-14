import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from './server';
import { AdminCrypto } from './auth/crypto';

describe('Soulverse Admin Management API Architecture', () => {
  let superAdminToken: string;
  let moderatorToken: string;

  beforeAll(async () => {
    // 1. Authenticate as Super Admin with MFA
    const loginRes = await request(app)
      .post('/api/v1/admin/auth/login')
      .send({ email: 'superadmin@soulverse.im', password: 'Admin@Soulverse2026!' });

    expect(loginRes.status).toBe(200);
    expect(loginRes.body.mfaRequired).toBe(true);
    expect(loginRes.body.challengeToken).toBeDefined();

    // Verify MFA step with the seeded demo secret code
    const mfaRes = await request(app)
      .post('/api/v1/admin/auth/verify-mfa')
      .send({ challengeToken: loginRes.body.challengeToken, mfaCode: '192600' });

    expect(mfaRes.status).toBe(200);
    expect(mfaRes.body.token).toBeDefined();
    expect(mfaRes.body.admin.roleId).toBe('super_admin');
    superAdminToken = mfaRes.body.token;

    // 2. Authenticate as Content Moderator with inline MFA
    const modRes = await request(app)
      .post('/api/v1/admin/auth/login')
      .send({
        email: 'moderator@soulverse.im',
        password: 'Mod@Soulverse2026!',
        mfaCode: '192600'
      });

    expect(modRes.status).toBe(200);
    expect(modRes.body.token).toBeDefined();
    expect(modRes.body.admin.roleId).toBe('content_moderator');
    moderatorToken = modRes.body.token;
  });

  describe('1. Health Probe & Public Isolation', () => {
    it('returns healthy status on public health probe', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('OK');
      expect(res.body.service).toBe('soulverse-admin-api');
    });

    it('rejects access to administrative endpoints without authorization token', async () => {
      const res = await request(app).get('/api/v1/admin/features');
      expect(res.status).toBe(401);
      expect(res.body.code).toBe('AUTH_TOKEN_MISSING');
    });

    it('rejects forged or tampered administrative tokens', async () => {
      const res = await request(app)
        .get('/api/v1/admin/features')
        .set('Authorization', 'Bearer invalid.tampered.token');
      expect(res.status).toBe(401);
      expect(res.body.code).toBe('AUTH_TOKEN_INVALID');
    });
  });

  describe('2. Authentication, MFA & Session Management', () => {
    it('rejects invalid password and reports attempts remaining', async () => {
      const res = await request(app)
        .post('/api/v1/admin/auth/login')
        .send({ email: 'superadmin@soulverse.im', password: 'WrongPassword!' });
      expect(res.status).toBe(401);
      expect(res.body.code).toBe('AUTH_FAILED');
      expect(res.body.attemptsRemaining).toBeDefined();
    });

    it('returns current admin profile and permissions via /auth/me', async () => {
      const res = await request(app)
        .get('/api/v1/admin/auth/me')
        .set('Authorization', `Bearer ${superAdminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.admin.email).toBe('superadmin@soulverse.im');
      expect(res.body.admin.roleName).toBe('Super Administrator');
      expect(Array.isArray(res.body.permissions)).toBe(true);
    });

    it('lists active administrative sessions', async () => {
      const res = await request(app)
        .get('/api/v1/admin/auth/sessions')
        .set('Authorization', `Bearer ${superAdminToken}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.sessions)).toBe(true);
      expect(res.body.sessions.length).toBeGreaterThan(0);
    });
  });

  describe('3. Role-Based Access Control & Fine-Grained Permissions', () => {
    it('allows Super Administrator to access system infrastructure and checkpoint', async () => {
      const res = await request(app)
        .post('/api/v1/admin/system/wal-checkpoint')
        .set('Authorization', `Bearer ${superAdminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('forbids Content Moderator from executing system operations', async () => {
      const res = await request(app)
        .post('/api/v1/admin/system/wal-checkpoint')
        .set('Authorization', `Bearer ${moderatorToken}`);
      expect(res.status).toBe(403);
      expect(res.body.code).toBe('FORBIDDEN_PERMISSION');
    });

    it('allows Content Moderator to read and moderate user reports', async () => {
      const res = await request(app)
        .get('/api/v1/admin/users/moderation/reports')
        .set('Authorization', `Bearer ${moderatorToken}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.reports)).toBe(true);
    });
  });

  describe('4. Central Feature Registry & Kill Switch', () => {
    it('lists registered features with state and rollout configuration', async () => {
      const res = await request(app)
        .get('/api/v1/admin/features')
        .set('Authorization', `Bearer ${superAdminToken}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.features)).toBe(true);
      const datingFeat = res.body.features.find((f: any) => f.id === 'feat_dating');
      expect(datingFeat).toBeDefined();
      expect(datingFeat.name).toBe('Dating & Chemistry');
    });

    it('updates feature flag lifecycle state and creates audit record', async () => {
      const res = await request(app)
        .put('/api/v1/admin/features/feat_dating')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({
          state: 'beta',
          rolloutPercentage: 75,
          reason: 'Testing phased beta rollout'
        });
      expect(res.status).toBe(200);
      expect(res.body.state).toBe('beta');
      expect(res.body.rolloutPercentage).toBe(75);

      // Clean up state back to enabled
      await request(app)
        .put('/api/v1/admin/features/feat_dating')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({
          state: 'enabled',
          rolloutPercentage: 100,
          reason: 'Reset to enabled after test'
        });
    });

    it('activates emergency kill-switch with recorded reason', async () => {
      const res = await request(app)
        .post('/api/v1/admin/features/feat_dating/kill-switch')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({
          active: true,
          reason: 'Automated test kill switch verification'
        });
      expect(res.status).toBe(200);
      expect(res.body.isKillSwitched).toBe(true);
      expect(res.body.reason).toBe('Automated test kill switch verification');

      // Re-enable kill switch to clean up
      await request(app)
        .post('/api/v1/admin/features/feat_dating/kill-switch')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({ active: false });
    });
  });

  describe('5. User Privacy & Data Protection', () => {
    it('returns public profile overview and does NOT expose private user content', async () => {
      const res = await request(app)
        .get('/api/v1/admin/users/usr_me')
        .set('Authorization', `Bearer ${superAdminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.user).toBeDefined();
      expect(res.body.user.name).toBeDefined();
      // Ensure private keys or sensitive personal texts are not exposed
      expect(res.body.privateNotes).toBeUndefined();
      expect(res.body.unsentWords).toBeUndefined();
      expect(res.body.messages).toBeUndefined();
      if (res.body.aiConnections && res.body.aiConnections.length > 0) {
        expect(res.body.aiConnections[0].apiKey).toBeUndefined();
      }
    });
  });

  describe('6. System Operations & Audit Logging', () => {
    it('returns system health telemetry with memory, uptime and database stats', async () => {
      const res = await request(app)
        .get('/api/v1/admin/system/health')
        .set('Authorization', `Bearer ${superAdminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('HEALTHY');
      expect(res.body.memory.rssMb).toBeGreaterThan(0);
      expect(res.body.database.sizeMb).toBeDefined();
    });

    it('returns recorded immutable audit logs', async () => {
      const res = await request(app)
        .get('/api/v1/admin/system/audit-logs')
        .set('Authorization', `Bearer ${superAdminToken}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.logs)).toBe(true);
      expect(res.body.logs.length).toBeGreaterThan(0);
    });
  });

  describe('7. Session Revocation (Logout)', () => {
    it('revokes administrative session on logout', async () => {
      const logoutRes = await request(app)
        .post('/api/v1/admin/auth/logout')
        .set('Authorization', `Bearer ${moderatorToken}`);
      expect(logoutRes.status).toBe(200);
      expect(logoutRes.body.success).toBe(true);

      // Subsequent access with revoked token must fail with 401
      const checkRes = await request(app)
        .get('/api/v1/admin/auth/me')
        .set('Authorization', `Bearer ${moderatorToken}`);
      expect(checkRes.status).toBe(401);
      expect(checkRes.body.code).toBe('SESSION_REVOKED');
    });
  });
});
