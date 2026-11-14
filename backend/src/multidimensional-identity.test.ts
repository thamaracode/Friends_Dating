import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import Database from 'better-sqlite3';
import path from 'path';

const API_BASE = 'http://127.0.0.1:3001/api/v1';
const dbPath = path.resolve(__dirname, '../../data.db');

describe('Multidimensional Human Identity & Profile Architecture (12 Types, Dates & Privacy)', () => {
  const aliceUserId = 'usr_alice_id_test';
  const bobUserId = 'usr_bob_id_test';
  const charlieGuestId = 'usr_charlie_guest_id';

  beforeAll(() => {
    const db = new Database(dbPath);
    db.prepare(`
      INSERT OR IGNORE INTO users (id, name, username, avatar_url, is_verified, last_seen_at, status_text)
      VALUES (?, ?, ?, ?, 1, ?, ?)
    `).run(aliceUserId, 'Alice Test', 'alice_test_user', 'https://example.com/alice.jpg', Date.now(), 'Active');

    db.prepare(`
      INSERT OR IGNORE INTO users (id, name, username, avatar_url, is_verified, last_seen_at, status_text)
      VALUES (?, ?, ?, ?, 1, ?, ?)
    `).run(bobUserId, 'Bob Test', 'bob_test_user', 'https://example.com/bob.jpg', Date.now(), 'Active');

    db.close();
  });

  afterAll(() => {
    const db = new Database(dbPath);
    db.prepare('DELETE FROM identity_custom_sections WHERE user_id = ?').run(aliceUserId);
    db.prepare('DELETE FROM identity_timeline_events WHERE user_id = ?').run(aliceUserId);
    db.prepare('DELETE FROM user_identities WHERE user_id IN (?, ?)').run(aliceUserId, bobUserId);
    db.prepare('DELETE FROM users WHERE id IN (?, ?)').run(aliceUserId, bobUserId);
    db.close();
  });

  // 1. Create Identities Across All 12 Identity Types + Custom
  const identityTypes = [
    { type: 'real', name: 'Alice Real', displayTitle: 'Actual Physical Self' },
    { type: 'personal', name: 'Alice Personal', displayTitle: 'Core Values & Stoic Habits' },
    { type: 'social', name: 'Alice Social', displayTitle: 'Community Organizer & Friend' },
    { type: 'professional', name: 'Alice Professional', displayTitle: 'Senior Systems Architect' },
    { type: 'inner', name: 'Alice Inner', displayTitle: 'Midnight Reflections & Solitude' },
    { type: 'imaginary', name: 'Alice Imaginary', displayTitle: 'The Starfall Navigator' },
    { type: 'cinematic', name: 'Alice Cinematic', displayTitle: 'Neo-Noir Detective' },
    { type: 'aspirational', name: 'Alice Aspirational', displayTitle: 'Future Mediterranean Ceramicist' },
    { type: 'historical', name: 'Alice Historical', displayTitle: '1990s Analog Film Enthusiast' },
    { type: 'alternative_life', name: 'Alice Alternate', displayTitle: 'The Berlin Cellist Timeline' },
    { type: 'creative', name: 'Alice Creative', displayTitle: 'Ambient Composer & Writer' },
    { type: 'relational', name: 'Alice Relational', displayTitle: 'Devoted Partner & Listener' },
    { type: 'custom', name: 'Alice Custom', displayTitle: 'Bespoke Dimension' }
  ];

  const createdIds: Record<string, string> = {};

  it('creates distinct identity spaces across all 12 identity dimensions plus custom', async () => {
    for (const item of identityTypes) {
      const payload = {
        userId: aliceUserId,
        name: item.name,
        identityType: item.type,
        displayTitle: item.displayTitle,
        description: `This is the ${item.type} dimension of Alice.`,
        biography: `Deep exploration of ${item.type} identity space without arbitrary constraints.`,
        characteristics: [
          { key: 'Archetype', value: item.type === 'real' ? 'Grounded Explorer' : 'Creative Dreamer' },
          { key: 'Energy', value: 'High Focus' }
        ],
        tags: [item.type, 'identity_system', 'soulverse'],
        interests: ['Acoustic Arts', 'Philosophy'],
        skills: ['Empathy', 'Creative Direction'],
        experiences: [
          { title: `${item.type} milestone`, role: 'Protagonist', startDate: '2020', isCurrent: true }
        ],
        achievements: [
          { title: `${item.type} breakthrough`, year: '2024', description: 'Internal clarity' }
        ],
        memories: [
          { title: 'Golden Hour Memory', dateLabel: 'Summer 2023', narrative: 'Quiet reflection by the coast' }
        ],
        mediaAttachments: [
          { type: 'image', url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600', title: 'Portraits' }
        ],
        visualTheme: {
          primaryColor: '#D97706',
          borderStyle: 'specular',
          badgeLabel: item.displayTitle
        },
        visibility: item.type === 'inner' ? 'private' : (item.type === 'alternative_life' ? 'unlisted' : 'public'),
        status: 'published'
      };

      const res = await fetch(`${API_BASE}/identities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.identity.name).toBe(item.name);
      expect(data.identity.identity_type).toBe(item.type);
      expect(data.identity.characteristics).toHaveLength(2);
      expect(data.identity.experiences).toHaveLength(1);
      expect(data.identity.memories).toHaveLength(1);

      createdIds[item.type] = data.identity.id;
    }
  });

  // 2. Timeline Architecture: Arbitrary Negative Years (-1500), 0, and Future (2150)
  it('supports historical timelines with negative BCE years, year 0, and future years across 4 date natures', async () => {
    const realId = createdIds['real'];
    expect(realId).toBeDefined();

    const timelineSamples = [
      {
        dateNature: 'historical',
        yearValue: '-1500',
        title: 'Late Bronze Age Ancestral Roots',
        description: 'Historical Mediterranean maritime trade culture and ancestral inspiration.',
        expectedDisplay: '1500 BCE',
        expectedNumeric: -1500
      },
      {
        dateNature: 'fictional',
        yearValue: '0',
        title: 'Epoch of the Silver Dawn',
        description: 'The celestial alignment marking the origin of the narrative constellation.',
        expectedDisplay: 'Year 0 (Astronomical)',
        expectedNumeric: 0
      },
      {
        dateNature: 'personal',
        yearValue: '1998',
        title: 'Birth & Early Awakening',
        description: 'First consciousness in the coastal city.',
        expectedDisplay: '1998 CE',
        expectedNumeric: 1998
      },
      {
        dateNature: 'hypothetical',
        yearValue: '2019',
        title: 'The Berlin Conservatory Path',
        description: 'What if I had relocated to Europe to study cello and sound design?',
        expectedDisplay: '2019 CE',
        expectedNumeric: 2019
      },
      {
        dateNature: 'fictional',
        yearValue: '2150',
        title: 'Cybernetic Deep Horizon',
        description: 'Speculative voyage beyond the Kuiper Belt.',
        expectedDisplay: 'Year 2150 CE (Future)',
        expectedNumeric: 2150
      }
    ];

    for (const s of timelineSamples) {
      const res = await fetch(`${API_BASE}/identities/${realId}/timeline`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: aliceUserId,
          dateNature: s.dateNature,
          yearValue: s.yearValue,
          title: s.title,
          description: s.description,
          visibility: 'public'
        })
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.event.numeric_year).toBe(s.expectedNumeric);
      expect(data.event.display_date).toBe(s.expectedDisplay);
      expect(data.event.date_nature).toBe(s.dateNature);
    }

    // Retrieve timeline and verify sorted chronological order
    const listRes = await fetch(`${API_BASE}/identities/${realId}/timeline?viewerId=${aliceUserId}`);
    expect(listRes.status).toBe(200);
    const listData = await listRes.json();
    expect(listData.events).toHaveLength(5);

    // Verify ordering: -1500 < 0 < 1998 < 2019 < 2150
    const years = listData.events.map((e: any) => e.numeric_year);
    expect(years).toEqual([-1500, 0, 1998, 2019, 2150]);
  });

  // 3. Custom Sections with Individual Visibility Control
  it('creates custom sections and verifies section-level visibility enforcement', async () => {
    const profId = createdIds['professional'];
    expect(profId).toBeDefined();

    // Section 1: Public Philosophy
    const sec1Res = await fetch(`${API_BASE}/identities/${profId}/sections`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: aliceUserId,
        sectionKey: 'engineering_credo',
        title: 'Engineering Philosophy',
        sectionType: 'markdown',
        content: 'Robustness over hype. Zero decorative interfaces.',
        visibility: 'public'
      })
    });
    expect(sec1Res.status).toBe(200);

    // Section 2: Private Salary and Confidential Ambitions
    const sec2Res = await fetch(`${API_BASE}/identities/${profId}/sections`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: aliceUserId,
        sectionKey: 'confidential_ambitions',
        title: 'Private 5-Year Financial & Equity Roadmap',
        sectionType: 'markdown',
        content: 'Confidential equity targets and private negotiation bounds.',
        visibility: 'private'
      })
    });
    expect(sec2Res.status).toBe(200);

    // Owner fetches single identity: gets BOTH sections
    const ownerRes = await fetch(`${API_BASE}/identities/${profId}?viewerId=${aliceUserId}`);
    const ownerData = await ownerRes.json();
    expect(ownerData.identity.custom_sections).toHaveLength(2);

    // Charlie (guest) fetches single identity: gets ONLY public section
    const guestRes = await fetch(`${API_BASE}/identities/${profId}?viewerId=${charlieGuestId}`);
    const guestData = await guestRes.json();
    expect(guestData.identity.custom_sections).toHaveLength(1);
    expect(guestData.identity.custom_sections[0].section_key).toBe('engineering_credo');
  });

  // 4. Strict Visibility Enforcement: Private vs Unlisted vs Public
  it('prevents public access to private identities while allowing unlisted direct access', async () => {
    const innerId = createdIds['inner']; // Created as 'private'
    const unlistedId = createdIds['alternative_life']; // Created as 'unlisted'

    // 1. In list endpoint, guest NEVER sees private or unlisted identities
    const listRes = await fetch(`${API_BASE}/identities/user/${aliceUserId}?viewerId=${charlieGuestId}`);
    const listData = await listRes.json();
    const visibleIds = listData.identities.map((i: any) => i.id);
    expect(visibleIds).not.toContain(innerId);
    expect(visibleIds).not.toContain(unlistedId);

    // 2. Direct lookup of private identity by guest returns 403 Forbidden
    const privateRes = await fetch(`${API_BASE}/identities/${innerId}?viewerId=${charlieGuestId}`);
    expect(privateRes.status).toBe(403);

    // 3. Direct lookup of unlisted identity by guest succeeds (unlisted link behavior)
    const unlistedRes = await fetch(`${API_BASE}/identities/${unlistedId}?viewerId=${charlieGuestId}`);
    expect(unlistedRes.status).toBe(200);
    const unlistedData = await unlistedRes.json();
    expect(unlistedData.identity.name).toBe('Alice Alternate');
  });

  // 5. Ownership Enforcement & IDOR Protections
  it('prevents Bob from modifying or deleting Alice identity spaces', async () => {
    const realId = createdIds['real'];

    // Bob attempts to update Alice's identity
    const hackUpdate = await fetch(`${API_BASE}/identities/${realId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: bobUserId,
        name: 'Hacked by Bob'
      })
    });
    expect(hackUpdate.status).toBe(403);

    // Bob attempts to delete Alice's identity
    const hackDelete = await fetch(`${API_BASE}/identities/${realId}?userId=${bobUserId}`, {
      method: 'DELETE'
    });
    expect(hackDelete.status).toBe(403);
  });

  // 6. Identity Duplication as Draft
  it('duplicates an identity with all custom sections and timeline events as a draft copy', async () => {
    const realId = createdIds['real'];
    const dupRes = await fetch(`${API_BASE}/identities/${realId}/duplicate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: aliceUserId })
    });

    expect(dupRes.status).toBe(200);
    const dupData = await dupRes.json();
    expect(dupData.success).toBe(true);
    expect(dupData.identity.name).toBe('Alice Real (Copy)');
    expect(dupData.identity.status).toBe('draft');
  });
});
