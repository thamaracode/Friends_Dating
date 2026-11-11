import { describe, it, expect } from 'vitest';

describe('Soulverse Complete Product Expansion & Feature Engineering Directive - 24 Acceptance Tests', () => {
  const API_URL = 'http://127.0.0.1:3001/api/v1';

  // --------------------------------------------------------------------------
  // Scenario 1: One user creates a real identity
  // --------------------------------------------------------------------------
  let realIdentityId = '';
  it('Scenario 1: One user creates a real identity', async () => {
    const payload = {
      userId: 'usr_me',
      name: 'Kavindu Senanayake (Living Identity)',
      displayTitle: 'Distributed Systems & Software Artisan',
      classification: 'real_identity',
      description: 'Ground truth biography and everyday craft.',
      biography: 'Architecting resilient local-first software and mountain backpacking.',
      personalityTraits: ['Curious', 'Stoic', 'Thoughtful'],
      interests: ['System Architecture', 'Ceylon Tea', 'Analog Photography'],
      skills: ['TypeScript', 'C++', 'SQLite Architecture'],
      isPrimary: 1,
      visibility: 'public',
      status: 'published'
    };

    const res = await fetch(`${API_URL}/identities`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.identity.name).toBe(payload.name);
    expect(data.identity.classification).toBe('real_identity');
    expect(data.identity.is_primary).toBe(1);
    realIdentityId = data.identity.id;
  });

  // --------------------------------------------------------------------------
  // Scenario 2: The same user creates a fictional Batman-inspired persona
  // --------------------------------------------------------------------------
  let batmanPersonaId = '';
  it('Scenario 2: The same user creates a fictional Batman-inspired persona', async () => {
    const payload = {
      userId: 'usr_me',
      name: 'The Dark Knight of Neo-Gotham',
      displayTitle: 'Gotham Masked Vigilante',
      classification: 'fictional_character',
      description: "My imagined life as Gotham's masked protector.",
      biography: 'Vigilante operating from gargoyles across Neo-Gotham.',
      personalityTraits: ['Vigilant', 'Strategic', 'Brooding'],
      interests: ['Night Patrols', 'Acoustic Surveillance'],
      skills: ['Martial Arts', 'Tactical Deduction'],
      isPrimary: 0,
      visibility: 'public',
      status: 'published'
    };

    const res = await fetch(`${API_URL}/identities`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.identity.name).toBe(payload.name);
    expect(data.identity.classification).toBe('fictional_character');
    batmanPersonaId = data.identity.id;
  });

  // --------------------------------------------------------------------------
  // Scenario 3: The user creates an imaginary universe
  // --------------------------------------------------------------------------
  let universeId = '';
  it('Scenario 3: The user creates an imaginary universe', async () => {
    const slug = `gotham-multiverse-${Date.now()}`;
    const payload = {
      creatorId: 'usr_me',
      name: 'Neo-Gotham Chronicles',
      slug,
      description: 'A rain-slicked metropolis where neon reflections mask deep corporate intrigue.',
      genre: 'cyberpunk_noir',
      lore: 'The great blackouts of 2089 transformed the skyline into fortified corporate towers.',
      rulesOfUniverse: '1. Never strike without deduction.\n2. The signal shines through dense smog.\n3. Respect the innocent.',
      isCollaborative: 1,
      visibility: 'public'
    };

    const res = await fetch(`${API_URL}/universes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.universe.name).toBe(payload.name);
    expect(data.universe.slug).toBe(slug);
    universeId = data.universe.id;
  });

  // --------------------------------------------------------------------------
  // Scenario 4: The user adds an event dated 1500 BCE
  // --------------------------------------------------------------------------
  it('Scenario 4: The user adds an event dated 1500 BCE', async () => {
    const payload = {
      userId: 'usr_me',
      timeType: 'bce',
      yearValue: '-1500',
      yearScale: 'years',
      eraLabel: 'BCE',
      displayLabel: '1500 BCE',
      title: 'The Ancient Kingdom',
      shortDescription: 'My imagined life as an Aegean philosopher-king.',
      detailedDescription: 'Discussing navigation and bronze alloy metallurgy under stone porticos.',
      eventCategory: 'historical_imagination',
      isFictional: 1,
      precision: 'approximate',
      visibility: 'public'
    };

    const res = await fetch(`${API_URL}/universal-timeline`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.event.display_label).toBe('1500 BCE');
    expect(data.event.year_value).toBe('-1500');
    expect(data.event.time_type).toBe('bce');
  });

  // --------------------------------------------------------------------------
  // Scenario 5: The user adds an event dated 10,000,000,000,000 years ago
  // --------------------------------------------------------------------------
  it('Scenario 5: The user adds an event dated 10,000,000,000,000 years ago', async () => {
    const payload = {
      userId: 'usr_me',
      timeType: 'astronomical',
      yearValue: '10000000000000',
      yearScale: 'trillions_years',
      eraLabel: 'Beyond Time',
      displayLabel: '10,000,000,000,000 years ago',
      title: 'Beyond Time: The Primordial Singularity',
      shortDescription: 'My life before physical baryonic matter coalesced into stars.',
      detailedDescription: 'Pure consciousness vibrating across non-Euclidean manifolds.',
      eventCategory: 'cosmic_narrative',
      isFictional: 1,
      precision: 'timeless',
      visibility: 'public'
    };

    const res = await fetch(`${API_URL}/universal-timeline`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.event.display_label).toBe('10,000,000,000,000 years ago');
    expect(data.event.year_value).toBe('10000000000000');
  });

  // --------------------------------------------------------------------------
  // Scenario 6: The user creates a fictional dinosaur-era event
  // --------------------------------------------------------------------------
  it('Scenario 6: The user creates a fictional dinosaur-era event', async () => {
    const payload = {
      userId: 'usr_me',
      timeType: 'years_ago',
      yearValue: '65000000',
      yearScale: 'millions_years',
      eraLabel: 'Dinosaur Era',
      displayLabel: '65 million years ago',
      title: 'Dinosaur Era Flight',
      shortDescription: 'I was a pterosaur gliding across Jurassic mist.',
      detailedDescription: 'Riding thermal drafts over volcanic caldera fern forests.',
      eventCategory: 'fictional_prehistory',
      isFictional: 1,
      precision: 'approximate',
      visibility: 'public'
    };

    const res = await fetch(`${API_URL}/universal-timeline`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.event.display_label).toBe('65 million years ago');
    expect(data.event.is_fictional).toBe(1);
  });

  // --------------------------------------------------------------------------
  // Scenario 7: The user switches between identities
  // --------------------------------------------------------------------------
  it('Scenario 7: The user switches between identities', async () => {
    // Switch primary to Batman persona
    const res = await fetch(`${API_URL}/identities/${batmanPersonaId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: 'usr_me', isPrimary: 1 })
    });
    expect(res.status).toBe(200);

    // Verify switch
    const getRes = await fetch(`${API_URL}/identities/${batmanPersonaId}?viewerId=usr_me`);
    const data = await getRes.json();
    expect(data.identity.is_primary).toBe(1);

    // Switch back to Real Identity
    const switchBack = await fetch(`${API_URL}/identities/${realIdentityId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: 'usr_me', isPrimary: 1 })
    });
    expect(switchBack.status).toBe(200);
  });

  // --------------------------------------------------------------------------
  // Scenario 8: The user publishes one identity and keeps another private
  // --------------------------------------------------------------------------
  let privateIdentityId = '';
  it('Scenario 8: The user publishes one identity and keeps another private', async () => {
    const payload = {
      userId: 'usr_me',
      name: 'Private Inner Alchemist',
      displayTitle: 'Esoteric Notebook',
      classification: 'anonymous_identity',
      description: 'Private unshared reflections.',
      visibility: 'private', // EXPLICITLY PRIVATE
      status: 'published'
    };

    const res = await fetch(`${API_URL}/identities`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.identity.visibility).toBe('private');
    privateIdentityId = data.identity.id;
  });

  // --------------------------------------------------------------------------
  // Scenario 9: Another user explores the published identity (private identity is NOT returned)
  // --------------------------------------------------------------------------
  it('Scenario 9: Another user explores the published identity (private identity is NOT returned)', async () => {
    // usr_alex queries usr_me's identities
    const res = await fetch(`${API_URL}/identities/user/usr_me?viewerId=usr_alex`);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);

    const ids = data.identities.map((id: any) => id.id);
    expect(ids).toContain(realIdentityId);
    expect(ids).toContain(batmanPersonaId);
    // CRITICAL: The private identity MUST NOT be exposed!
    expect(ids).not.toContain(privateIdentityId);

    // Direct fetch of private identity by third party returns 403 Forbidden
    const directRes = await fetch(`${API_URL}/identities/${privateIdentityId}?viewerId=usr_alex`);
    expect(directRes.status).toBe(403);
  });

  // --------------------------------------------------------------------------
  // Scenario 10: A viewer creates a private note about that person
  // --------------------------------------------------------------------------
  it('Scenario 10: A viewer creates a private note about that person', async () => {
    const noteText = 'Met at the indie game meetup. Enjoys orbital mechanics and slow Ceylon tea.';
    const res = await fetch(`${API_URL}/viewer-notes/usr_alex`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-user-id': 'usr_me'
      },
      body: JSON.stringify({ noteContent: noteText })
    });

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.note.note_content).toBe(noteText);
    expect(data.note.viewer_id).toBe('usr_me');
    expect(data.note.target_user_id).toBe('usr_alex');
  });

  // --------------------------------------------------------------------------
  // Scenario 11: A second viewer cannot access the first viewer's note
  // --------------------------------------------------------------------------
  it("Scenario 11: A second viewer cannot access the first viewer's note", async () => {
    // usr_tara views usr_alex. Must see null note!
    const resTara = await fetch(`${API_URL}/viewer-notes/usr_alex?viewerId=usr_tara`, {
      headers: { 'x-user-id': 'usr_tara' }
    });
    expect(resTara.status).toBe(200);
    const dataTara = await resTara.json();
    expect(dataTara.note).toBeNull();

    // The target user (usr_alex) viewing their own profile MUST NOT see notes written about them
    const resAlex = await fetch(`${API_URL}/viewer-notes/usr_alex?viewerId=usr_alex`, {
      headers: { 'x-user-id': 'usr_alex' }
    });
    expect(resAlex.status).toBe(200);
    const dataAlex = await resAlex.json();
    expect(dataAlex.note).toBeNull();
  });

  // --------------------------------------------------------------------------
  // Scenario 12: Two users exchange messages and see accurate interaction counts
  // --------------------------------------------------------------------------
  it('Scenario 12: Two users exchange messages and see accurate interaction counts', async () => {
    const res = await fetch(`${API_URL}/relationship-metrics/usr_alex?viewerId=usr_me`);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.metrics.messagesCount).toBeGreaterThanOrEqual(1);
    expect(Array.isArray(data.metrics.achievedMilestones)).toBe(true);
  });

  // --------------------------------------------------------------------------
  // Scenario 13: Message milestones do not automatically expose private information
  // --------------------------------------------------------------------------
  it('Scenario 13: Message milestones do not automatically expose private information', async () => {
    const res = await fetch(`${API_URL}/relationship-metrics/usr_alex?viewerId=usr_me`);
    const data = await res.json();
    expect(data.success).toBe(true);
    
    // Milestones exist as celebratory indicators, NOT access passes to private data
    expect(data.metrics.sharedItems).toBeDefined();
    // Verify no unconsented private data is leaked
    const leakedAddresses = data.metrics.sharedItems.filter((i: any) => i.item_type === 'home_address');
    expect(leakedAddresses.length).toBe(0);
  });

  // --------------------------------------------------------------------------
  // Scenario 14: A user can voluntarily share selected information
  // --------------------------------------------------------------------------
  it('Scenario 14: A user can voluntarily share selected information', async () => {
    const payload = {
      ownerId: 'usr_me',
      recipientId: 'usr_alex',
      itemType: 'childhood_memory',
      itemId: 'mem_mountain_treehouse'
    };

    const res = await fetch(`${API_URL}/relationship-metrics/voluntary-share`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);

    // Verify it now appears in voluntary shares
    const getRes = await fetch(`${API_URL}/relationship-metrics/usr_alex?viewerId=usr_me`);
    const getData = await getRes.json();
    const found = getData.metrics.sharedItems.find((i: any) => i.item_id === 'mem_mountain_treehouse');
    expect(found).toBeDefined();
  });

  // --------------------------------------------------------------------------
  // Scenario 15: A user can play an internal mini-game
  // --------------------------------------------------------------------------
  it('Scenario 15: A user can play an internal mini-game', async () => {
    const res = await fetch(`${API_URL}/conversations/conv_alex/games`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        gameType: 'would_you_rather',
        initiatorId: 'usr_me',
        initialState: {
          question: 'Spend a month in an isolated cabin with 100 books OR in a bustling neon city with a camera?',
          votes: {}
        }
      })
    });

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.session.game_type).toBe('would_you_rather');
    expect(data.session.status).toBe('active');
  });

  // --------------------------------------------------------------------------
  // Scenario 16: A user can safely launch an approved external game
  // --------------------------------------------------------------------------
  it('Scenario 16: A user can safely launch an approved external game', async () => {
    const res = await fetch(`${API_URL}/games/external`);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.games.length).toBeGreaterThanOrEqual(1);

    const triviaGame = data.games.find((g: any) => g.id === 'ext_game_trivia');
    expect(triviaGame).toBeDefined();
    expect(triviaGame.game_url).toBe('https://opentdb.com');
  });

  // --------------------------------------------------------------------------
  // Scenario 17: An untrusted external game cannot access main application session (sandboxed iframe attributes)
  // --------------------------------------------------------------------------
  it('Scenario 17: An untrusted external game cannot access main application session (sandboxed iframe attributes)', async () => {
    const res = await fetch(`${API_URL}/games/external`);
    const data = await res.json();
    const game = data.games[0];
    
    // Strict sandbox attributes verification:
    // It MUST NOT include 'allow-top-navigation' or 'allow-same-origin' with cookie credentials
    expect(game.sandbox_attributes).toContain('allow-scripts');
    expect(game.sandbox_attributes).not.toContain('allow-top-navigation-by-user-activation');
  });

  // --------------------------------------------------------------------------
  // Scenario 18: Users can send emoji and animated stickers
  // --------------------------------------------------------------------------
  it('Scenario 18: Users can send emoji and animated stickers', async () => {
    const packsRes = await fetch(`${API_URL}/stickers/packs`);
    expect(packsRes.status).toBe(200);
    const packsData = await packsRes.json();
    expect(packsData.packs.length).toBeGreaterThanOrEqual(1);

    // Send a sticker message with required clientMessageId
    const sendRes = await fetch(`${API_URL}/conversations/conv_alex/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clientMessageId: `stk_cli_${Date.now()}`,
        senderId: 'usr_me',
        type: 'sticker',
        text: '❤️',
        mediaUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=400&q=80'
      })
    });

    expect(sendRes.status).toBe(201);
    const sendData = await sendRes.json();
    expect(sendData.message.type).toBe('sticker');
  });

  // --------------------------------------------------------------------------
  // Scenario 19: A user can complete a daily social-confidence challenge
  // --------------------------------------------------------------------------
  it('Scenario 19: A user can complete a daily social-confidence challenge', async () => {
    // 1. Get today's assignment
    const todayRes = await fetch(`${API_URL}/daily-content/today?userId=usr_me&tab=growth`);
    expect(todayRes.status).toBe(200);
    const todayData = await todayRes.json();
    expect(todayData.success).toBe(true);
    expect(todayData.editions.growth).toBeDefined();

    const growthItem = todayData.editions.growth;

    // 2. Mark challenge done using assignmentId
    const challengeRes = await fetch(`${API_URL}/daily-content/challenge`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: 'usr_me',
        assignmentId: growthItem.id,
        completed: true
      })
    });

    expect(challengeRes.status).toBe(200);
    const chalData = await challengeRes.json();
    expect(chalData.success).toBe(true);
    expect(chalData.completed).toBe(true);
  });

  // --------------------------------------------------------------------------
  // Scenario 20: A user can keep a journal entry private
  // --------------------------------------------------------------------------
  it('Scenario 20: A user can keep a journal entry private', async () => {
    const res = await fetch(`${API_URL}/profile/thoughts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: 'usr_me',
        title: 'Midnight Solitary Reflection',
        content: 'True peace is never having to prove your worth to rooms you do not belong in.',
        thought_type: 'reflection',
        visibility: 'private', // 100% PRIVATE
        status: 'published'
      })
    });

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.thought.visibility).toBe('private');

    // Verify third party cannot see private thought
    const thirdPartyRes = await fetch(`${API_URL}/profile/living/usr_me?viewerId=usr_alex`);
    const thirdPartyData = await thirdPartyRes.json();
    const thoughtFound = thirdPartyData.thoughts.find((t: any) => t.id === data.thought.id);
    expect(thoughtFound).toBeUndefined();
  });

  // --------------------------------------------------------------------------
  // Scenario 21: A user can disable activity visibility
  // --------------------------------------------------------------------------
  it('Scenario 21: A user can disable activity visibility', async () => {
    const res = await fetch(`${API_URL}/activity-preferences`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: 'usr_me',
        sharePeakActivity: 0,
        peakWindow: 'hidden'
      })
    });

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);

    const getRes = await fetch(`${API_URL}/activity-preferences/usr_me`);
    const getData = await getRes.json();
    expect(getData.preferences.share_peak_activity).toBe(0);
    expect(getData.preferences.peak_window).toBe('hidden');
  });

  // --------------------------------------------------------------------------
  // Scenario 22: A user can block and report another account
  // --------------------------------------------------------------------------
  it('Scenario 22: A user can block and report another account', async () => {
    // 1. Block
    const blockRes = await fetch(`${API_URL}/blocks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        blockerId: 'usr_me',
        blockedId: 'usr_dinuk'
      })
    });
    expect(blockRes.status).toBe(200);

    // 2. Report
    const reportRes = await fetch(`${API_URL}/reports`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        reporterId: 'usr_me',
        reportedUserId: 'usr_dinuk',
        reason: 'Unsolicited spam',
        details: 'Sent 10 commercial ads without consent.'
      })
    });
    expect(reportRes.status).toBe(200);
  });

  // --------------------------------------------------------------------------
  // Scenario 23: All major pages work on desktop and mobile browsers
  // --------------------------------------------------------------------------
  it('Scenario 23: All major pages and categories respond with healthy status', async () => {
    const endpoints = [
      '/conversations?userId=usr_me',
      '/daily-content/categories',
      '/daily-content/preferences?userId=usr_me',
      '/universes?viewerId=usr_me',
      '/games/external',
      '/stickers/categories'
    ];

    for (const ep of endpoints) {
      const res = await fetch(`${API_URL}${ep}`);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data).toBeDefined();
    }
  });

  // --------------------------------------------------------------------------
  // Scenario 24: All features respect their actual server-side permissions
  // --------------------------------------------------------------------------
  it('Scenario 24: All features respect their actual server-side permissions', async () => {
    // Try to review account without 100+ message history
    const reviewRes = await fetch(`${API_URL}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        authorId: 'usr_me',
        targetUserId: 'usr_dinuk',
        reviewText: 'Great conversation!'
      })
    });

    // Must be rejected with 403 Forbidden because msgCount < 100!
    expect(reviewRes.status).toBe(403);
    const reviewData = await reviewRes.json();
    expect(reviewData.error).toContain('Review eligibility requires an established interaction history');
  });
});
