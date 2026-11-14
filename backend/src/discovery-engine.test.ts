import { describe, it, expect, beforeAll } from 'vitest';
import { db } from './db';
import { SocialDiscoveryService } from './discovery/service';
import { calculateExplainableResonance } from './discovery/matchingEngine';
import { MATCHING_TERMINOLOGY_REGISTRY, CONNECTION_TYPES_METADATA } from './discovery/types';

const BASE_URL = 'http://127.0.0.1:3001/api/v1/discovery';

describe('Master Prompt 04: Social Discovery, Friendship and Dating Engine Test Suite', () => {
  beforeAll(() => {
    SocialDiscoveryService.initTables();
    SocialDiscoveryService.seedDiscoveryProfiles();
  });

  // 1. Terminology & Epistemic Distinctions
  describe('1. Terminology & Conceptual Distinctions', () => {
    it('provides all 10 matching concepts with clear definitions and distinctions', async () => {
      const res = await fetch(`${BASE_URL}/terminology`);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.concepts.length).toBe(10);

      const terms = data.concepts.map((c: any) => c.term);
      expect(terms).toContain('Compatibility');
      expect(terms).toContain('Similarity');
      expect(terms).toContain('Complementarity');
      expect(terms).toContain('Shared Values');
      expect(terms).toContain('Mutual Consent');

      // Verify each term has definition, distinction, and practical example
      for (const concept of data.concepts) {
        expect(concept.definition.length).toBeGreaterThan(15);
        expect(concept.distinctionFromOthers.length).toBeGreaterThan(15);
        expect(concept.practicalExample.length).toBeGreaterThan(15);
      }
    });

    it('registers all 9 diverse connection types across social, romance, purpose, and community', async () => {
      const res = await fetch(`${BASE_URL}/terminology`);
      const data = await res.json();
      const types = Object.keys(data.connectionTypes);
      expect(types).toHaveLength(9);
      expect(types).toContain('friendship');
      expect(types).toContain('dating');
      expect(types).toContain('long_term');
      expect(types).toContain('casual_dating');
      expect(types).toContain('professional_networking');
      expect(types).toContain('creative_collaboration');
      expect(types).toContain('activity_partners');
      expect(types).toContain('community_connections');
      expect(types).toContain('shared_interest');
    });
  });

  // 2. Explainable 7-Dimension Matching Engine
  describe('2. Explainable 7-Dimension Matching Engine', () => {
    it('computes transparent multi-factor resonance without invented percentages', () => {
      const viewer = SocialDiscoveryService.getProfile('usr_me')!;
      const candidate = SocialDiscoveryService.getProfile('usr_alex')!;

      expect(viewer).toBeDefined();
      expect(candidate).toBeDefined();

      const report = calculateExplainableResonance(viewer, candidate, false);

      expect(report.overallResonanceScore).toBeGreaterThanOrEqual(10);
      expect(report.overallResonanceScore).toBeLessThanOrEqual(100);
      expect(report.dimensions).toHaveLength(7);

      const dimensionKeys = report.dimensions.map(d => d.dimension);
      expect(dimensionKeys).toContain('shared_values');
      expect(dimensionKeys).toContain('intentions');
      expect(dimensionKeys).toContain('common_interests');
      expect(dimensionKeys).toContain('communication');
      expect(dimensionKeys).toContain('lifestyle');
      expect(dimensionKeys).toContain('activities');
      expect(dimensionKeys).toContain('geographic');

      // Check weights sum to 1.0
      const totalWeight = report.dimensions.reduce((acc, d) => acc + d.weight, 0);
      expect(Math.abs(totalWeight - 1.0)).toBeLessThan(0.001);

      // Distinguishes similarity and complementarity
      expect(typeof report.similarityScore).toBe('number');
      expect(typeof report.complementarityScore).toBe('number');

      // Mandatory non-predictive clinical disclaimer
      expect(report.disclaimer).toContain('not an algorithmic prediction of romantic love');
    });

    it('GET /api/v1/discovery/explain/:targetUserId returns deep explainable report', async () => {
      const res = await fetch(`${BASE_URL}/explain/usr_tara`, {
        headers: { 'x-user-id': 'usr_me' }
      });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.report.overallResonanceScore).toBeGreaterThan(0);
      expect(data.report.dimensions.length).toBe(7);
      expect(data.report.sharedValues).toBeInstanceOf(Array);
      expect(data.report.synergyHighlights.length).toBeGreaterThan(0);
    });
  });

  // 3. Discovery Feeds, Filtering & Sorting
  describe('3. Discovery Feeds, Filtering & Pagination', () => {
    it('retrieves paginated discovery feed with metadata and exclusion totals', async () => {
      const res = await fetch(`${BASE_URL}/feed?page=1&limit=4`, {
        headers: { 'x-user-id': 'usr_me' }
      });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.items.length).toBeLessThanOrEqual(4);
      expect(data.total).toBeGreaterThanOrEqual(3);
      expect(data.activeFilterSummary).toBeDefined();

      // Does not contain caller (usr_me)
      const ids = data.items.map((i: any) => i.profile.id);
      expect(ids).not.toContain('usr_me');
    });

    it('filters discovery feed by connection type (creative_collaboration)', async () => {
      const res = await fetch(`${BASE_URL}/feed?connectionType=creative_collaboration`, {
        headers: { 'x-user-id': 'usr_me' }
      });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);

      for (const item of data.items) {
        const matchesIntention = 
          item.profile.primary_intention === 'creative_collaboration' ||
          item.profile.intentions.includes('creative_collaboration');
        expect(matchesIntention).toBe(true);
      }
    });

    it('sorts feed by resonance score in descending order', async () => {
      const res = await fetch(`${BASE_URL}/feed?sortBy=resonance`, {
        headers: { 'x-user-id': 'usr_me' }
      });
      expect(res.status).toBe(200);
      const data = await res.json();

      for (let i = 0; i < data.items.length - 1; i++) {
        expect(data.items[i].resonance.overallResonanceScore)
          .toBeGreaterThanOrEqual(data.items[i + 1].resonance.overallResonanceScore);
      }
    });
  });

  // 4. User Interactions: Likes, Mutual Matches, Passes, and Saves
  describe('4. User Interactions & Mutual Matching Protocol', () => {
    it('establishes mutual connection when both users like each other', async () => {
      const userA = 'usr_me';
      const userB = 'usr_elena';

      // Clean up previous test interactions
      db.prepare('DELETE FROM user_interactions WHERE user_id IN (?, ?)').run(userA, userB);
      db.prepare('DELETE FROM user_connections WHERE (user_a_id = ? AND user_b_id = ?) OR (user_a_id = ? AND user_b_id = ?)').run(userA, userB, userB, userA);

      // 1. User A likes User B
      const like1 = await fetch(`${BASE_URL}/interact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': userA },
        body: JSON.stringify({ targetUserId: userB, type: 'like', connectionType: 'creative_collaboration' })
      });
      const data1 = await like1.json();
      expect(data1.success).toBe(true);
      expect(data1.mutualMatchEstablished).toBe(false);

      // 2. User B likes User A (reciprocal)
      const like2 = await fetch(`${BASE_URL}/interact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': userB },
        body: JSON.stringify({ targetUserId: userA, type: 'like', connectionType: 'creative_collaboration' })
      });
      const data2 = await like2.json();
      expect(data2.success).toBe(true);
      expect(data2.mutualMatchEstablished).toBe(true);
      expect(data2.connection).toBeDefined();
      expect(data2.connection.status).toBe('active');
    });

    it('passes a user, verifies exclusion from feed, and resets passes', async () => {
      const userA = 'usr_me';
      const targetUserId = 'usr_marcus';

      // Record pass
      const passRes = await fetch(`${BASE_URL}/interact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': userA },
        body: JSON.stringify({ targetUserId, type: 'pass' })
      });
      expect(passRes.status).toBe(200);

      // Verify feed does not contain passed user
      const feedRes = await fetch(`${BASE_URL}/feed`, {
        headers: { 'x-user-id': userA }
      });
      const feedData = await feedRes.json();
      const ids = feedData.items.map((i: any) => i.profile.id);
      expect(ids).not.toContain(targetUserId);

      // Reset passes
      const resetRes = await fetch(`${BASE_URL}/passes/reset`, {
        method: 'POST',
        headers: { 'x-user-id': userA }
      });
      const resetData = await resetRes.json();
      expect(resetData.success).toBe(true);
      expect(resetData.clearedCount).toBeGreaterThan(0);
    });

    it('saves a profile and retrieves it from saved profiles list', async () => {
      const saveRes = await fetch(`${BASE_URL}/interact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': 'usr_me' },
        body: JSON.stringify({ targetUserId: 'usr_priya', type: 'save' })
      });
      expect(saveRes.status).toBe(200);

      const savedList = await fetch(`${BASE_URL}/saved`, {
        headers: { 'x-user-id': 'usr_me' }
      });
      const data = await savedList.json();
      expect(data.success).toBe(true);
      const savedIds = data.items.map((i: any) => i.profile.id);
      expect(savedIds).toContain('usr_priya');
    });
  });

  // 5. Connection Requests & Mutual Consent
  describe('5. Explicit Connection Requests & Mutual Consent Protocol', () => {
    it('sends connection request and accepts it to establish active connection', async () => {
      const sender = 'usr_me';
      const recipient = 'usr_sora';

      // Clean existing
      db.prepare('DELETE FROM connection_requests WHERE (sender_id = ? AND recipient_id = ?) OR (sender_id = ? AND recipient_id = ?)').run(sender, recipient, recipient, sender);
      db.prepare('DELETE FROM user_connections WHERE (user_a_id = ? AND user_b_id = ?) OR (user_a_id = ? AND user_b_id = ?)').run(sender, recipient, recipient, sender);

      // Send request
      const reqRes = await fetch(`${BASE_URL}/connect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': sender },
        body: JSON.stringify({
          recipientId: recipient,
          connectionType: 'long_term',
          note: 'Loved your devotion to Bach and unhurried mornings.'
        })
      });
      const reqData = await reqRes.json();
      expect(reqData.success).toBe(true);
      expect(reqData.request.status).toBe('pending');
      const requestId = reqData.request.id;

      // Recipient accepts request
      const respondRes = await fetch(`${BASE_URL}/requests/${requestId}/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': recipient },
        body: JSON.stringify({ action: 'accept' })
      });
      const respondData = await respondRes.json();
      expect(respondData.success).toBe(true);
      expect(respondData.connection).toBeDefined();
      expect(respondData.connection.status).toBe('active');

      // Verify connection appears in user connections query
      const connRes = await fetch(`${BASE_URL}/connections`, {
        headers: { 'x-user-id': sender }
      });
      const connData = await connRes.json();
      const partnerIds = connData.connections.map((c: any) => c.partner_profile?.id);
      expect(partnerIds).toContain(recipient);
    });

    it('unmatches an established connection cleanly', async () => {
      const unmatchRes = await fetch(`${BASE_URL}/unmatch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': 'usr_me' },
        body: JSON.stringify({ targetUserId: 'usr_sora' })
      });
      const data = await unmatchRes.json();
      expect(data.success).toBe(true);

      // Check status in DB
      const check = db.prepare(`
        SELECT status FROM user_connections 
        WHERE (user_a_id = 'usr_me' AND user_b_id = 'usr_sora') 
           OR (user_a_id = 'usr_sora' AND user_b_id = 'usr_me')
      `).get() as { status: string };
      expect(check.status).toBe('unmatched');
    });
  });

  // 6. Safety: Bidirectional Block Isolation & Moderation
  describe('6. Safety, Moderation & Bidirectional Block Isolation', () => {
    it('enforces bidirectional block isolation (neither user can discover the other)', async () => {
      const blocker = 'usr_me';
      const blocked = 'usr_dinuk';

      // Insert block
      db.prepare('INSERT OR IGNORE INTO user_blocks (blocker_id, blocked_id, created_at) VALUES (?, ?, ?)').run(blocker, blocked, Date.now());

      // Blocker does not see blocked user in feed
      const feedA = await (await fetch(`${BASE_URL}/feed`, { headers: { 'x-user-id': blocker } })).json();
      const idsA = feedA.items.map((i: any) => i.profile.id);
      expect(idsA).not.toContain(blocked);

      // Blocked user does not see blocker in feed
      const feedB = await (await fetch(`${BASE_URL}/feed`, { headers: { 'x-user-id': blocked } })).json();
      const idsB = feedB.items.map((i: any) => i.profile.id);
      expect(idsB).not.toContain(blocker);

      // Clean up block
      db.prepare('DELETE FROM user_blocks WHERE blocker_id = ? AND blocked_id = ?').run(blocker, blocked);
    });

    it('submits user report and excludes reported user from reporter feed', async () => {
      const reporter = 'usr_me';
      const reported = 'usr_marcus';

      // Insert report into user_reports
      db.prepare(`
        INSERT OR REPLACE INTO user_reports (id, reporter_id, reported_user_id, reason, details, status, created_at)
        VALUES (?, ?, ?, ?, ?, 'pending', ?)
      `).run(`rep_${Date.now()}`, reporter, reported, 'Spam or inappropriate', 'Test report details', Date.now());

      // Verify feed excludes reported user
      const feedRes = await fetch(`${BASE_URL}/feed`, { headers: { 'x-user-id': reporter } });
      const feedData = await feedRes.json();
      const ids = feedData.items.map((i: any) => i.profile.id);
      expect(ids).not.toContain(reported);

      // Clean up report
      db.prepare('DELETE FROM user_reports WHERE reporter_id = ? AND reported_user_id = ?').run(reporter, reported);
    });
  });
});
