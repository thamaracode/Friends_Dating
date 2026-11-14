import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import Database from 'better-sqlite3';
import path from 'path';

const API_BASE = 'http://127.0.0.1:3001/api/v1/psychology';
const dbPath = path.resolve(__dirname, '../../data.db');

describe('Master Prompt 03: Personality, Human Behavior & Emotional Intelligence Framework', () => {
  const elenaId = 'usr_elena_psych_test';
  const marcusId = 'usr_marcus_psych_test';

  beforeAll(() => {
    const db = new Database(dbPath);
    // Ensure test users exist in data.db
    const insertUser = db.prepare(`
      INSERT OR IGNORE INTO users (id, name, username, avatar_url, is_verified, last_seen_at, status_text)
      VALUES (?, ?, ?, ?, 1, ?, ?)
    `);
    insertUser.run(elenaId, 'Elena Rostova', 'elena_psych_user', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb', Date.now(), 'Reflective');
    insertUser.run(marcusId, 'Marcus Vance', 'marcus_psych_user', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d', Date.now(), 'Direct');
    db.close();
  });

  afterAll(() => {
    const db = new Database(dbPath);
    db.prepare("DELETE FROM users WHERE id IN (?, ?)").run(elenaId, marcusId);
    db.prepare("DELETE FROM user_personality_profiles WHERE user_id IN (?, ?)").run(elenaId, marcusId);
    db.prepare("DELETE FROM user_reflection_responses WHERE user_id IN (?, ?)").run(elenaId, marcusId);
    db.prepare("DELETE FROM user_perception_feedback WHERE target_user_id IN (?, ?) OR author_user_id IN (?, ?)").run(elenaId, marcusId, elenaId, marcusId);
    db.prepare("DELETE FROM user_trait_history WHERE user_id IN (?, ?)").run(elenaId, marcusId);
    db.close();
  });

  // =========================================================================
  // TEST 1: COMPREHENSIVE CONCEPT LEXICON & ETHICAL GUARDRAILS
  // =========================================================================
  it('1. provides an exhaustive, categorized psychological dictionary with ethical caveats', async () => {
    const res = await fetch(`${API_BASE}/concepts`);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.concepts.length).toBeGreaterThanOrEqual(25);

    // Verify presence of all 6 conceptual domains
    const domains = new Set(body.concepts.map((c: any) => c.domain));
    expect(domains.has('personality_psychology')).toBe(true);
    expect(domains.has('emotional_intelligence')).toBe(true);
    expect(domains.has('interpersonal_behavior')).toBe(true);
    expect(domains.has('values_character')).toBe(true);
    expect(domains.has('relationship_dynamics')).toBe(true);
    expect(domains.has('self_reflection')).toBe(true);

    // Check concept schema completeness
    const sample = body.concepts.find((c: any) => c.id === 'concept_introversion_extraversion');
    expect(sample).toBeDefined();
    expect(sample.title).toContain('Introversion');
    expect(sample.definition.length).toBeGreaterThan(30);
    expect(sample.practical_example.length).toBeGreaterThan(30);
    expect(sample.related_concepts.length).toBeGreaterThanOrEqual(2);
    expect(sample.appropriate_context).toBeDefined();
    expect(sample.limitations_and_caveats).toBeDefined();
    expect(sample.framework_type).toBe('scientific');

    // Check popular psychology caveat distinction (e.g., love languages)
    const popularSample = body.concepts.find((c: any) => c.framework_type === 'popular_psychology');
    expect(popularSample).toBeDefined();
    expect(popularSample.limitations_and_caveats.toLowerCase()).toMatch(/caveat|empirical|not.*diagnosis/);
  });

  // =========================================================================
  // TEST 2: CONTINUOUS SPECTRUMS & USER EXPLANATIONS IN THEIR OWN WORDS
  // =========================================================================
  it('2. records multi-spectrum ratings and user explanations in their own words', async () => {
    const payload = {
      userId: elenaId,
      dimensions: {
        introversion_extraversion: 30, // Introvert-leaning
        openness: 90,
        conscientiousness: 85,
        agreeableness: 80,
        emotional_stability: 70
      },
      selected_traits: ['Philosophical', 'Empathetic Listener', 'Observant'],
      trait_explanations: {
        introversion_extraversion: 'I thrive in 1-on-1 dialogue over coffee, but need quiet mornings to process my thoughts.',
        openness: 'Always reading speculative fiction, classical poetry, and learning new creative coding tools.'
      },
      communication_style: 'empathetic',
      communication_notes: 'I prefer compassionate directness. I speak gently but value complete emotional honesty.',
      listening_style: 'reflective',
      attachment_awareness: 'secure_leaning',
      attachment_notes: 'I hold a secure base while valuing self-sovereignty and honoring space.',
      core_values: ['authenticity', 'curiosity', 'integrity', 'compassion'],
      values_explanations: {
        authenticity: 'Living truthfully without social masking.',
        integrity: 'Upholding promises even under stressful timelines.'
      },
      emotional_boundaries: 'Clear: I support my partner deeply without taking on their emotional overwhelm as my own fault.',
      conflict_style: 'Reflective pause: taking 10 minutes to breathe, then resolving with collaborative focus.',
      visibility: 'public'
    };

    const putRes = await fetch(`${API_BASE}/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    expect(putRes.status).toBe(200);
    const putBody = await putRes.json();
    expect(putBody.success).toBe(true);
    expect(putBody.profile.dimensions.introversion_extraversion).toBe(30);
    expect(putBody.profile.trait_explanations.introversion_extraversion).toContain('coffee');

    // Fetch profile and verify persistence
    const getRes = await fetch(`${API_BASE}/profile/${elenaId}`);
    expect(getRes.status).toBe(200);
    const getBody = await getRes.json();
    expect(getBody.profile.user_id).toBe(elenaId);
    expect(getBody.profile.core_values).toContain('authenticity');
    expect(getBody.profile.values_explanations.authenticity).toContain('masking');
  });

  // =========================================================================
  // TEST 3: GUIDED REFLECTION JOURNEYS & SUBMISSIONS
  // =========================================================================
  it('3. delivers guided reflection exercises and securely persists user introspection', async () => {
    const listRes = await fetch(`${API_BASE}/exercises`);
    expect(listRes.status).toBe(200);
    const listBody = await listRes.json();
    expect(listBody.exercises.length).toBeGreaterThanOrEqual(5);

    const exerciseId = 'ex_values_alignment_audit';
    const submission = {
      userId: elenaId,
      answers: {
        p1_top_values: 'Integrity, Compassion, and Artistic Curiosity',
        p2_lived_vs_aspired: 'I live my values closely in my private relationships, but sometimes feel corporate friction at work.',
        p3_micro_adjustment: 'Block out Friday afternoons for deep writing without meetings.'
      },
      personalTakeaway: 'Prioritizing creative autonomy will renew my emotional energy.',
      visibility: 'private'
    };

    const submitRes = await fetch(`${API_BASE}/exercises/${exerciseId}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(submission)
    });
    expect(submitRes.status).toBe(200);
    const submitBody = await submitRes.json();
    expect(submitBody.success).toBe(true);
    expect(submitBody.response.answers.p1_top_values).toContain('Integrity');

    // Verify owner can fetch private responses
    const ownerRes = await fetch(`${API_BASE}/exercises/user/${elenaId}?viewerId=${elenaId}`);
    expect(ownerRes.status).toBe(200);
    const ownerBody = await ownerRes.json();
    expect(ownerBody.responses.length).toBe(1);

    // Verify third-party viewer cannot see private introspection responses
    const strangerRes = await fetch(`${API_BASE}/exercises/user/${elenaId}?viewerId=${marcusId}`);
    expect(strangerRes.status).toBe(200);
    const strangerBody = await strangerRes.json();
    expect(strangerBody.responses.length).toBe(0);
  });

  // =========================================================================
  // TEST 4: VOLUNTARY PERCEPTION FEEDBACK (PERCEPTION MIRROR)
  // =========================================================================
  it('4. allows trusted companions to contribute voluntary perspective reflections', async () => {
    // Marcus gives Elena perception feedback
    const feedbackPayload = {
      authorUserId: marcusId,
      strengths_observed: ['Exceptional Empathy', 'Clear Intellectual Boundaries', 'Calming Presence'],
      communication_impression: 'Elena listens without interrupting and makes you feel completely validated.',
      values_witnessed: ['authenticity', 'compassion'],
      warmth_resonance_rating: 5,
      constructive_perspective: 'Sometimes she takes on too many creative projects at once.',
      is_anonymous: false
    };

    const postRes = await fetch(`${API_BASE}/feedback/${elenaId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(feedbackPayload)
    });
    expect(postRes.status).toBe(200);
    const postBody = await postRes.json();
    expect(postBody.success).toBe(true);
    expect(postBody.feedback.strengths_observed).toContain('Exceptional Empathy');

    // Prevent submitting feedback to oneself
    const selfRes = await fetch(`${API_BASE}/feedback/${elenaId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ authorUserId: elenaId, strengths_observed: ['Great'] })
    });
    expect(selfRes.status).toBe(400);

    // Elena views her private perception mirror
    const mirrorRes = await fetch(`${API_BASE}/feedback/${elenaId}?viewerId=${elenaId}`);
    expect(mirrorRes.status).toBe(200);
    const mirrorBody = await mirrorRes.json();
    expect(mirrorBody.feedback.length).toBeGreaterThanOrEqual(1);
    expect(mirrorBody.feedback[0].communication_impression).toContain('listens without interrupting');
  });

  // =========================================================================
  // TEST 5: TRAIT EVOLUTION TIMELINE (GROWTH OVER TIME)
  // =========================================================================
  it('5. creates chronological trait snapshots to track personal growth and shifts over time', async () => {
    const snap1Res = await fetch(`${API_BASE}/history/snapshot`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: elenaId,
        snapshotLabel: 'Chapter 1: Initial Discovery',
        growthReflections: 'Learning to say no without apologizing for having boundaries.'
      })
    });
    expect(snap1Res.status).toBe(200);
    const snap1 = await snap1Res.json();
    expect(snap1.success).toBe(true);

    const snap2Res = await fetch(`${API_BASE}/history/snapshot`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: elenaId,
        snapshotLabel: 'Chapter 2: After Communication Workshop',
        growthReflections: 'Deepened capacity for direct conflict resolution without defensive retreat.'
      })
    });
    expect(snap2Res.status).toBe(200);

    // Fetch history
    const histRes = await fetch(`${API_BASE}/history/${elenaId}?viewerId=${elenaId}`);
    expect(histRes.status).toBe(200);
    const histBody = await histRes.json();
    expect(histBody.snapshots.length).toBeGreaterThanOrEqual(2);
    expect(histBody.snapshots[0].snapshot_label).toContain('Chapter 1');
    expect(histBody.snapshots[1].snapshot_label).toContain('Chapter 2');

    // History is private to account owner
    const strangerHist = await fetch(`${API_BASE}/history/${elenaId}?viewerId=${marcusId}`);
    expect(strangerHist.status).toBe(200);
    const strangerBody = await strangerHist.json();
    expect(strangerBody.snapshots.length).toBe(0);
  });

  // =========================================================================
  // TEST 6: TRANSPARENT, EXPLAINABLE COMPATIBILITY RESONANCE
  // =========================================================================
  it('6. calculates transparent, explainable compatibility resonance with ethical disclaimer', async () => {
    // Setup Marcus profile
    await fetch(`${API_BASE}/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: marcusId,
        dimensions: {
          introversion_extraversion: 45,
          openness: 85,
          conscientiousness: 75,
          agreeableness: 80,
          emotional_stability: 75
        },
        selected_traits: ['Grounded', 'Direct Communicator', 'Creative'],
        communication_style: 'direct',
        listening_style: 'reflective',
        attachment_awareness: 'secure_leaning',
        core_values: ['integrity', 'curiosity', 'courage', 'independence'],
        visibility: 'public'
      })
    });

    const compRes = await fetch(`${API_BASE}/compatibility`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userAId: elenaId,
        userBId: marcusId
      })
    });

    expect(compRes.status).toBe(200);
    const compBody = await compRes.json();
    expect(compBody.success).toBe(true);
    const report = compBody.report;

    expect(report.overall_score).toBeGreaterThanOrEqual(50);
    expect(report.overall_score).toBeLessThanOrEqual(100);

    // Values overlap
    expect(report.shared_values.overlapping).toContain('integrity');
    expect(report.shared_values.overlapping).toContain('curiosity');

    // Communication synergy
    expect(report.communication_synergy.user_style).toBe('empathetic');
    expect(report.communication_synergy.partner_style).toBe('direct');
    expect(report.communication_synergy.complementarity_notes.length).toBeGreaterThan(20);

    // Non-diagnostic ethical caveat
    expect(report.ethical_caveat).toBeDefined();
    expect(report.ethical_caveat.toLowerCase()).toContain('not');
    expect(report.ethical_caveat.toLowerCase()).toMatch(/diagnosis|verdict|educational/);
  });
});
