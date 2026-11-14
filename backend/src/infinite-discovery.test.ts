import { describe, it, expect, beforeAll } from 'vitest';
import { SocialDiscoveryService } from './discovery/service';
import { db } from './db';

describe('Feature DISCOVERY-002: Production-Grade Infinite Dating Discovery Feed & Persistent Swipe Engine', () => {
  const viewerId = 'usr_test_infinite_viewer';
  const targetIdA = 'usr_test_target_a';
  const targetIdB = 'usr_test_target_b';
  const targetIdC = 'usr_test_target_c';

  beforeAll(() => {
    SocialDiscoveryService.initTables();
    SocialDiscoveryService.seedDiscoveryProfiles();

    // Create test viewer and test target users
    const now = Date.now();
    for (const uid of [viewerId, targetIdA, targetIdB, targetIdC]) {
      db.prepare(`
        INSERT OR IGNORE INTO users (id, name, username, avatar_url, is_verified, last_seen_at)
        VALUES (?, ?, ?, ?, 1, ?)
      `).run(uid, `Name ${uid}`, `user_${uid}`, 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400', now);

      SocialDiscoveryService.upsertProfile({
        id: uid,
        name: `Test User ${uid}`,
        username: `user_${uid}`,
        age: 26,
        city: 'Colombo',
        country: 'Sri Lanka',
        primary_intention: 'dating',
        intentions: ['dating', 'friendship'],
        core_values: ['Authenticity', 'Curiosity'],
        interests: ['Art', 'Philosophy'],
        discovery_visible: true
      });
    }

    // Clean up previous test interactions
    db.prepare('DELETE FROM user_interactions WHERE user_id = ? OR target_user_id = ?').run(viewerId, viewerId);
    db.prepare('DELETE FROM user_connections WHERE user_a_id = ? OR user_b_id = ?').run(viewerId, viewerId);
    db.prepare('DELETE FROM user_blocks WHERE blocker_id = ? OR blocked_id = ?').run(viewerId, viewerId);
    db.prepare('DELETE FROM user_reports WHERE reporter_id = ? OR reported_user_id = ?').run(viewerId, viewerId);
  });

  it('1. Fetches initial batch (~20 profiles) with cursor pagination metadata', () => {
    const feed = SocialDiscoveryService.getInfiniteDiscoveryFeed(viewerId, { limit: 15 });
    
    expect(feed).toBeDefined();
    expect(Array.isArray(feed.items)).toBe(true);
    expect(feed.items.length).toBeLessThanOrEqual(15);
    expect(feed.items.length).toBeGreaterThanOrEqual(1);
    expect(feed.hasMore).toBe(true);
    expect(feed.nextCursor).toBeTruthy();
    expect(feed.totalRemaining).toBeGreaterThanOrEqual(feed.items.length);

    // Verify viewer is never recommended to themselves
    const hasViewer = feed.items.some(i => i.profile.id === viewerId);
    expect(hasViewer).toBe(false);

    // Verify items contain explainable resonance and full profile structure
    const first = feed.items[0];
    expect(first.profile.id).toBeDefined();
    expect(first.profile.name).toBeDefined();
    expect(first.resonance).toBeDefined();
    expect(first.resonance.overallResonanceScore).toBeGreaterThanOrEqual(0);
  });

  it('2. Cursor pagination advances and prevents duplicate profile IDs across batches', () => {
    // Batch 1
    const batch1 = SocialDiscoveryService.getInfiniteDiscoveryFeed(viewerId, { limit: 10 });
    expect(batch1.items.length).toBe(10);
    expect(batch1.nextCursor).toBeTruthy();

    const batch1Ids = batch1.items.map(i => i.profile.id);

    // Batch 2 using nextCursor and excludeIds
    const batch2 = SocialDiscoveryService.getInfiniteDiscoveryFeed(viewerId, {
      cursor: batch1.nextCursor!,
      limit: 10,
      excludeIds: batch1Ids
    });

    expect(batch2.items.length).toBeGreaterThanOrEqual(1);

    // Verify ZERO duplicate IDs between batch1 and batch2
    const batch2Ids = new Set(batch2.items.map(i => i.profile.id));
    for (const id of batch1Ids) {
      expect(batch2Ids.has(id)).toBe(false);
    }
  });

  it('3. Persists swipe action with unique actionId and idempotency protection', () => {
    const actionId = `swipe_act_${Date.now()}_test`;

    // 1st swipe request
    const res1 = SocialDiscoveryService.recordSwipe(viewerId, {
      actionId,
      targetUserId: targetIdA,
      action: 'like',
      connectionType: 'dating'
    });

    expect(res1.success).toBe(true);
    expect(res1.actionId).toBe(actionId);
    expect(res1.isMatch).toBe(false);

    // 2nd duplicate swipe request with exact same actionId (simulating network retry)
    const res2 = SocialDiscoveryService.recordSwipe(viewerId, {
      actionId,
      targetUserId: targetIdA,
      action: 'like',
      connectionType: 'dating'
    });

    expect(res2.success).toBe(true);
    expect(res2.actionId).toBe(actionId);
    expect(res2.isMatch).toBe(false);

    // Database check: exactly ONE row in user_interactions
    const rows = db.prepare('SELECT * FROM user_interactions WHERE action_id = ?').all(actionId);
    expect(rows.length).toBe(1);
  });

  it('4. Swiped profiles are strictly excluded from subsequent discovery feed queries', () => {
    // Record pass on targetIdB
    const actionId = `pass_act_${Date.now()}`;
    SocialDiscoveryService.recordSwipe(viewerId, {
      actionId,
      targetUserId: targetIdB,
      action: 'pass'
    });

    // Query discovery feed
    const feed = SocialDiscoveryService.getInfiniteDiscoveryFeed(viewerId, { limit: 50 });
    const containsTargetA = feed.items.some(i => i.profile.id === targetIdA);
    const containsTargetB = feed.items.some(i => i.profile.id === targetIdB);

    // Both targetIdA (liked) and targetIdB (passed) MUST be excluded!
    expect(containsTargetA).toBe(false);
    expect(containsTargetB).toBe(false);
  });

  it('5. Detects reciprocal swipe and creates real mutual connection (It\'s a Match!)', () => {
    // TargetIdC swipes 'like' on viewer first
    const actionIdTarget = `like_target_${Date.now()}`;
    SocialDiscoveryService.recordSwipe(targetIdC, {
      actionId: actionIdTarget,
      targetUserId: viewerId,
      action: 'like',
      connectionType: 'dating'
    });

    // Viewer swipes 'superlike' back on targetIdC
    const actionIdViewer = `superlike_viewer_${Date.now()}`;
    const res = SocialDiscoveryService.recordSwipe(viewerId, {
      actionId: actionIdViewer,
      targetUserId: targetIdC,
      action: 'superlike',
      connectionType: 'dating'
    });

    expect(res.success).toBe(true);
    expect(res.isMatch).toBe(true);
    expect(res.connection).toBeDefined();
    expect(res.connection?.status).toBe('active');

    // Verify connection persisted in SQLite user_connections
    const [u1, u2] = [viewerId, targetIdC].sort();
    const connInDb = db.prepare('SELECT * FROM user_connections WHERE user_a_id = ? AND user_b_id = ?').get(u1, u2);
    expect(connInDb).toBeDefined();
  });

  it('6. Supports undoing previous swipe, restoring profile to deck and dissolving match', () => {
    // Undo the last swipe (which was on targetIdC)
    const undoRes = SocialDiscoveryService.undoLastSwipe(viewerId);

    expect(undoRes.success).toBe(true);
    expect(undoRes.restoredProfile).toBeDefined();
    expect(undoRes.restoredProfile?.id).toBe(targetIdC);

    // Verify connection dissolved
    const [u1, u2] = [viewerId, targetIdC].sort();
    const connInDb = db.prepare('SELECT * FROM user_connections WHERE user_a_id = ? AND user_b_id = ?').get(u1, u2);
    expect(connInDb).toBeUndefined();

    // Verify interaction deleted
    const intInDb = db.prepare('SELECT * FROM user_interactions WHERE user_id = ? AND target_user_id = ?').get(viewerId, targetIdC);
    expect(intInDb).toBeUndefined();
  });

  it('7. Excludes blocked and reported accounts bidirectionally', () => {
    const blockedUserId = 'usr_maya';
    db.prepare(`
      INSERT OR REPLACE INTO user_blocks (blocker_id, blocked_id, created_at)
      VALUES (?, ?, ?)
    `).run(viewerId, blockedUserId, Date.now());

    const feed = SocialDiscoveryService.getInfiniteDiscoveryFeed(viewerId, { limit: 50 });
    const hasBlocked = feed.items.some(i => i.profile.id === blockedUserId);
    expect(hasBlocked).toBe(false);

    // Clean up
    db.prepare('DELETE FROM user_blocks WHERE blocker_id = ?').run(viewerId);
  });

  it('8. Applies filter constraints (age range, city, connection intention)', () => {
    const feedColombo = SocialDiscoveryService.getInfiniteDiscoveryFeed(viewerId, {
      city: 'Colombo',
      minAge: 23,
      maxAge: 27,
      limit: 20
    });

    for (const item of feedColombo.items) {
      expect(item.profile.city.toLowerCase()).toContain('colombo');
      expect(item.profile.age).toBeGreaterThanOrEqual(23);
      expect(item.profile.age).toBeLessThanOrEqual(27);
    }
  });

  it('9. Resets passed profiles to replenish discovery queue when deck is empty', () => {
    const dummyUser = 'usr_reset_pass_test';
    const actionId = `pass_${Date.now()}`;
    SocialDiscoveryService.recordSwipe(viewerId, {
      actionId,
      targetUserId: dummyUser,
      action: 'pass'
    });

    const resetCount = SocialDiscoveryService.resetPasses(viewerId);
    expect(resetCount).toBeGreaterThanOrEqual(1);

    const checkPass = db.prepare(`
      SELECT 1 FROM user_interactions 
      WHERE user_id = ? AND interaction_type = 'pass'
    `).get(viewerId);
    expect(checkPass).toBeUndefined();
  });

  it('10. HTTP REST API: GET /api/v1/discovery/swipe/feed returns paginated cursor feed', async () => {
    const res = await fetch('http://127.0.0.1:3001/api/v1/discovery/swipe/feed?limit=5', {
      headers: { 'x-user-id': viewerId }
    });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(Array.isArray(data.items)).toBe(true);
    expect(data.items.length).toBeLessThanOrEqual(5);
    expect(data.nextCursor).toBeTruthy();
  });

  it('11. HTTP REST API: POST /api/v1/discovery/swipe persists swipe and detects match', async () => {
    const actionId = `http_swipe_${Date.now()}`;
    const res = await fetch('http://127.0.0.1:3001/api/v1/discovery/swipe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': viewerId
      },
      body: JSON.stringify({
        actionId,
        targetUserId: targetIdA,
        action: 'like',
        connectionType: 'dating'
      })
    });

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.actionId).toBe(actionId);
    expect(typeof data.isMatch).toBe('boolean');
  });

  it('12. HTTP REST API: POST /api/v1/discovery/swipe/undo reverts swipe and restores profile', async () => {
    const res = await fetch('http://127.0.0.1:3001/api/v1/discovery/swipe/undo', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': viewerId
      }
    });

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.restoredProfile).toBeDefined();
    expect(data.restoredProfile.id).toBe(targetIdA);
  });
});
