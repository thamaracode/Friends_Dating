import { describe, it, expect, beforeAll } from 'vitest';
import { db } from './db';
import { SoulPromptsService } from './soul-prompts/service';

describe('Soul Prompts & Resonance Sanctuary (Introspection & Compatibility) Test Suite', () => {
  const API_URL = 'http://127.0.0.1:3001/api/v1';
  const testUserId = 'usr_me';
  const peerUserId = 'usr_peer_test';
  let todayPromptId: string = '';

  beforeAll(() => {
    // Ensure DB tables are initialized
    SoulPromptsService.initTables();

    // Ensure peer user exists in DB for compatibility tests
    db.prepare(`
      INSERT OR REPLACE INTO users (id, name, username, avatar_url, is_verified, last_seen_at)
      VALUES (?, 'Aria Thorne', 'ariathorne', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80', 1, ?)
    `).run(peerUserId, Date.now());

    db.prepare(`
      INSERT OR REPLACE INTO users (id, name, username, avatar_url, is_verified, last_seen_at)
      VALUES ('usr_other_voter', 'Other Voter', 'othervoter', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80', 0, ?)
    `).run(Date.now());
  });

  // -------------------------------------------------------------------------
  // 1. Daily Introspection Prompt Retrieval
  // -------------------------------------------------------------------------
  it('retrieves today soul prompt with metadata and dimensions', async () => {
    const res = await fetch(`${API_URL}/soul-prompts/today?userId=${testUserId}`);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.prompt).toBeDefined();
    expect(data.prompt.id).toBeDefined();
    expect(data.prompt.promptQuestion.length).toBeGreaterThan(10);
    expect(data.prompt.dimensionTag).toMatch(/^#[A-Za-z0-9]+/);

    todayPromptId = data.prompt.id;
  });

  it('retrieves all curated introspective soul prompts', async () => {
    const res = await fetch(`${API_URL}/soul-prompts/all`);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.success).toBe(true);
    expect(Array.isArray(data.prompts)).toBe(true);
    expect(data.prompts.length).toBeGreaterThanOrEqual(6);
  });

  // -------------------------------------------------------------------------
  // 2. Responding to Prompts & Privacy Controls
  // -------------------------------------------------------------------------
  it('rejects responses that are too short (< 5 chars)', async () => {
    const res = await fetch(`${API_URL}/soul-prompts/${todayPromptId}/respond`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-user-id': testUserId },
      body: JSON.stringify({
        responseText: 'Hi'
      })
    });

    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain('at least 5 characters');
  });

  it('submits a thoughtful reflection with mood tag and community visibility', async () => {
    const reflection = 'I used to expect people to guess when I was overwhelmed instead of simply stating my limits clearly.';
    const res = await fetch(`${API_URL}/soul-prompts/${todayPromptId}/respond`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-user-id': testUserId },
      body: JSON.stringify({
        responseText: reflection,
        visibility: 'community_anonymous',
        moodTag: 'vulnerable',
        customAlias: 'Honest Wanderer'
      })
    });

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.response.promptId).toBe(todayPromptId);
    expect(data.response.responseText).toBe(reflection);
    expect(data.response.moodTag).toBe('vulnerable');
    expect(data.response.visibility).toBe('community_anonymous');

    // Verify in SQLite
    const row = db.prepare('SELECT * FROM soul_prompt_responses WHERE prompt_id = ? AND user_id = ?').get(todayPromptId, testUserId) as any;
    expect(row).toBeDefined();
    expect(row.response_text).toBe(reflection);
    expect(row.mood_tag).toBe('vulnerable');
  });

  // -------------------------------------------------------------------------
  // 3. Community Resonance Circle & Empathy Reactions
  // -------------------------------------------------------------------------
  it('retrieves community responses with privacy masking and owner status', async () => {
    const res = await fetch(`${API_URL}/soul-prompts/${todayPromptId}/community?userId=${testUserId}`);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.success).toBe(true);
    expect(Array.isArray(data.responses)).toBe(true);

    const myEntry = data.responses.find((r: any) => r.isOwner);
    expect(myEntry).toBeDefined();
    expect(myEntry.userId).toBe(testUserId);
  });

  it('submits and toggles an empathy resonance (felt_deeply, mind_shifted, inspired)', async () => {
    const row = db.prepare('SELECT id FROM soul_prompt_responses WHERE prompt_id = ? AND user_id = ?').get(todayPromptId, testUserId) as any;
    const responseId = row.id;

    // 1. Resonate 'felt_deeply'
    const res1 = await fetch(`${API_URL}/soul-prompts/responses/${responseId}/resonate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-user-id': 'usr_other_voter' },
      body: JSON.stringify({ reactionType: 'felt_deeply' })
    });

    expect(res1.status).toBe(200);
    const data1 = await res1.json();
    expect(data1.success).toBe(true);
    expect(data1.active).toBe(true);
    expect(data1.reactionFeltDeeply).toBe(1);

    // 2. Toggle off
    const res2 = await fetch(`${API_URL}/soul-prompts/responses/${responseId}/resonate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-user-id': 'usr_other_voter' },
      body: JSON.stringify({ reactionType: 'felt_deeply' })
    });

    expect(res2.status).toBe(200);
    const data2 = await res2.json();
    expect(data2.success).toBe(true);
    expect(data2.active).toBe(false);
    expect(data2.reactionFeltDeeply).toBe(0);
  });

  // -------------------------------------------------------------------------
  // 4. Personal Soul Journal
  // -------------------------------------------------------------------------
  it('retrieves user personal journal with historical entries and mood statistics', async () => {
    const res = await fetch(`${API_URL}/soul-prompts/my-journal?userId=${testUserId}`);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.totalEntries).toBeGreaterThanOrEqual(1);
    expect(data.moodStats.vulnerable).toBeGreaterThanOrEqual(1);
    expect(data.entries[0].prompt).toBeDefined();
    expect(data.entries[0].response).toBeDefined();
  });

  // -------------------------------------------------------------------------
  // 5. Dynamic Emotional Compatibility Calculation
  // -------------------------------------------------------------------------
  it('computes emotional and philosophical compatibility with synergy insights', async () => {
    // Seed peer response to the same prompt
    SoulPromptsService.respondToPrompt(todayPromptId, peerUserId, {
      responseText: 'I realized real intimacy requires honest vulnerability, even when it feels scary.',
      visibility: 'community_public',
      moodTag: 'peaceful'
    });

    const res = await fetch(`${API_URL}/soul-prompts/compatibility/${peerUserId}?userId=${testUserId}`);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.targetUserId).toBe(peerUserId);
    expect(data.targetName).toBe('Aria Thorne');
    expect(data.compatibilityScore).toBeGreaterThanOrEqual(70);
    expect(data.sharedDimensions.length).toBeGreaterThanOrEqual(1);
    expect(data.synergyInsights.length).toBeGreaterThanOrEqual(1);
    expect(data.recommendedIcebreakers.length).toBeGreaterThanOrEqual(1);
  });

  // -------------------------------------------------------------------------
  // 6. Context-Rich Prompt Icebreaker Trigger
  // -------------------------------------------------------------------------
  it('generates a contextual prompt icebreaker and links a conversation', async () => {
    const peerResp = db.prepare('SELECT id FROM soul_prompt_responses WHERE prompt_id = ? AND user_id = ?').get(todayPromptId, peerUserId) as any;

    const res = await fetch(`${API_URL}/soul-prompts/responses/${peerResp.id}/icebreaker`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-user-id': testUserId }
    });

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.conversationId).toBeDefined();
    expect(data.partnerName).toBe('Aria Thorne');
    expect(data.icebreakerMessage).toContain("Connected over today's prompt");

    // Verify conversation message in SQLite
    const msg = db.prepare('SELECT * FROM messages WHERE conversation_id = ?').get(data.conversationId) as any;
    expect(msg).toBeDefined();
    expect(msg.text_content).toContain('resonated with your reflection');
  });
});
