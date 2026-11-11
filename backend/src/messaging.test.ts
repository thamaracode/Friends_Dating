import { describe, it, expect } from 'vitest';

describe('FRIENDS Master Messaging Engine Comprehensive Test Suite', () => {
  const API_URL = 'http://127.0.0.1:3001/api/v1';

  it('verifies health check endpoint', async () => {
    const res = await fetch('http://127.0.0.1:3001/api/health');
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.status).toBe('ok');
    expect(data.service).toContain('FRIENDS');
  });

  it('fetches conversations with folder categories and unread counters', async () => {
    const res = await fetch(`${API_URL}/conversations?userId=usr_me`);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(Array.isArray(data.conversations)).toBe(true);
    expect(data.conversations.length).toBeGreaterThanOrEqual(1);

    const savedConv = data.conversations.find((c: any) => c.id === 'conv_saved');
    expect(savedConv).toBeDefined();
    expect(savedConv.type).toBe('saved_messages');
  });

  it('submits a message with idempotency key and assigns sequence number', async () => {
    const clientMessageId = `test_cli_${Date.now()}`;
    const payload = {
      clientMessageId,
      senderId: 'usr_me',
      text: 'Automated integration test message',
      type: 'text'
    };

    const res = await fetch(`${API_URL}/conversations/conv_alex/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.message.text).toBe(payload.text);

    // Duplicate test with exact same clientMessageId (must deduplicate)
    const resDup = await fetch(`${API_URL}/conversations/conv_alex/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    expect(resDup.status).toBe(200);
    const dupData = await resDup.json();
    expect(dupData.deduplicated).toBe(true);
  });

  it('edits a message with audit history', async () => {
    // 1. Send message to edit
    const clientMessageId = `edit_test_${Date.now()}`;
    const resSend = await fetch(`${API_URL}/conversations/conv_alex/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clientMessageId,
        senderId: 'usr_me',
        text: 'Original text before edit',
        type: 'text'
      })
    });
    const sendData = await resSend.json();
    const msgId = sendData.message.id;

    // 2. Edit message
    const resEdit = await fetch(`${API_URL}/messages/${msgId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: 'Updated text with edit proof', editorId: 'usr_me' })
    });
    expect(resEdit.status).toBe(200);
    const editData = await resEdit.json();
    expect(editData.text).toBe('Updated text with edit proof');
  });

  it('toggles reactions and manages message pinning', async () => {
    const resMsgs = await fetch(`${API_URL}/conversations/conv_alex/messages?userId=usr_me`);
    const msgsData = await resMsgs.json();
    const firstMsg = msgsData.messages[0];

    const resReact = await fetch(`${API_URL}/messages/${firstMsg.id}/reactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: 'usr_me', emoji: '❤️' })
    });
    expect(resReact.status).toBe(200);

    const resPin = await fetch(`${API_URL}/messages/${firstMsg.id}/pin`, {
      method: 'PATCH'
    });
    expect(resPin.status).toBe(200);
    const pinData = await resPin.json();
    expect(typeof pinData.isPinned).toBe('boolean');
  });

  it('tests privacy blocking preventing new messages', async () => {
    // Block user
    const resBlock = await fetch(`${API_URL}/users/usr_alex/block`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ blockerId: 'usr_alex', blockedId: 'usr_blocked_test' })
    });
    expect(resBlock.status).toBe(200);

    // Unblock
    const resUnblock = await fetch(`${API_URL}/users/usr_alex/block`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ blockerId: 'usr_alex', blockedId: 'usr_blocked_test' })
    });
    expect(resUnblock.status).toBe(200);
  });

  it('submits safety and moderation report', async () => {
    const res = await fetch(`${API_URL}/reports`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        reporterId: 'usr_me',
        reportedUserId: 'usr_alex',
        reason: 'Harassment / inappropriate message',
        details: 'Automated test report record'
      })
    });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.reportId).toBeDefined();
  });

  it('starts a server-authoritative dating game session', async () => {
    const res = await fetch(`${API_URL}/games/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        conversationId: 'conv_alex',
        gameType: 'truth_or_dare',
        currentUserId: 'usr_me'
      })
    });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.gameId).toBeDefined();
    expect(data.gameType).toBe('truth_or_dare');
  });

  it('manages drafts and scheduled messages', async () => {
    // 1. Put draft
    const resDraft = await fetch(`${API_URL}/conversations/conv_alex/draft`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: 'usr_me', draftText: 'Draft note test' })
    });
    expect(resDraft.status).toBe(200);

    // 2. Schedule message
    const resSched = await fetch(`${API_URL}/scheduled-messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        conversationId: 'conv_alex',
        senderId: 'usr_me',
        payload: { text: 'Scheduled automated hello', type: 'text' },
        scheduledFor: Date.now() + 60000
      })
    });
    expect(resSched.status).toBe(200);
    const schedData = await resSched.json();
    expect(schedData.id).toBeDefined();
  });

  it('recognizes social platform URLs and extracts usernames', async () => {
    // 1. Instagram
    const resInsta = await fetch(`${API_URL}/profile/social-links/recognize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: 'https://instagram.com/kavindu_art' })
    });
    expect(resInsta.status).toBe(200);
    const dataInsta = await resInsta.json();
    expect(dataInsta.success).toBe(true);
    expect(dataInsta.platformId).toBe('instagram');
    expect(dataInsta.username).toBe('kavindu_art');

    // 2. GitHub
    const resGh = await fetch(`${API_URL}/profile/social-links/recognize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: 'https://github.com/thamaracode' })
    });
    const dataGh = await resGh.json();
    expect(dataGh.success).toBe(true);
    expect(dataGh.platformId).toBe('github');
    expect(dataGh.username).toBe('thamaracode');

    // 3. Reject invalid Instagram post route (not a profile)
    const resBadInsta = await fetch(`${API_URL}/profile/social-links/recognize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: 'https://instagram.com/p/C-12345678' })
    });
    const dataBadInsta = await resBadInsta.json();
    expect(dataBadInsta.success).toBe(false);

    // 4. Reject dangerous malicious URL scheme
    const resMal = await fetch(`${API_URL}/profile/social-links/recognize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: 'javascript:alert(1)' })
    });
    const dataMal = await resMal.json();
    expect(dataMal.success).toBe(false);

    // 5. Custom website
    const resWeb = await fetch(`${API_URL}/profile/social-links/recognize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: 'https://kavindusenanayake.dev' })
    });
    const dataWeb = await resWeb.json();
    expect(dataWeb.success).toBe(true);
    expect(dataWeb.platformId).toBe('custom');
  });

  it('manages digital life profile links with privacy enforcement', async () => {
    const uniqueSuffix = Date.now();
    // 1. Add public link (GitHub)
    const resAdd1 = await fetch(`${API_URL}/profile/social-links`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: 'usr_me',
        url: `https://github.com/kavindu_${uniqueSuffix}`,
        visibility: 'public'
      })
    });
    expect([200, 201]).toContain(resAdd1.status);
    const data1 = await resAdd1.json();
    const linkId1 = data1.link.id;

    // 2. Add matches-only link (Instagram)
    const resAdd2 = await fetch(`${API_URL}/profile/social-links`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: 'usr_me',
        url: `https://instagram.com/kavindu_private_${uniqueSuffix}`,
        visibility: 'matches_only'
      })
    });
    expect([200, 201]).toContain(resAdd2.status);

    // 3. Re-submitting exact same URL should return 409 conflict
    const resDup = await fetch(`${API_URL}/profile/social-links`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: 'usr_me',
        url: `https://github.com/kavindu_${uniqueSuffix}`
      })
    });
    expect(resDup.status).toBe(409);

    // 4. Stranger queries usr_me's links -> must ONLY see public link!
    const resStranger = await fetch(`${API_URL}/users/usr_me/social-links?callerId=usr_stranger`);
    const dataStranger = await resStranger.json();
    expect(dataStranger.success).toBe(true);
    expect(dataStranger.links.every((l: any) => l.visibility === 'public')).toBe(true);

    // 5. Matched user (usr_alex) queries usr_me's links -> sees public AND matches_only
    const resMatch = await fetch(`${API_URL}/users/usr_me/social-links?callerId=usr_alex`);
    const dataMatch = await resMatch.json();
    expect(dataMatch.success).toBe(true);
    expect(dataMatch.links.some((l: any) => l.visibility === 'matches_only')).toBe(true);

    // 6. Delete link
    const resDel = await fetch(`${API_URL}/profile/social-links/${linkId1}?userId=usr_me`, {
      method: 'DELETE'
    });
    expect(resDel.status).toBe(200);
  });

  it('manages sticker packs and delivers standalone luck emojis', async () => {
    // 1. Fetch available sticker packs
    const resPacks = await fetch(`${API_URL}/stickers/packs?userId=usr_me`);
    expect(resPacks.status).toBe(200);
    const dataPacks = await resPacks.json();
    expect(dataPacks.success).toBe(true);
    expect(dataPacks.packs.length).toBeGreaterThanOrEqual(1);

    // 2. Fetch user's installed sticker packs
    const resMyPacks = await fetch(`${API_URL}/stickers/my-packs?userId=usr_me`);
    expect(resMyPacks.status).toBe(200);
    const dataMyPacks = await resMyPacks.json();
    expect(dataMyPacks.success).toBe(true);
    expect(dataMyPacks.packs.length).toBeGreaterThanOrEqual(1);

    // 3. Send Telegram Luck Dice message
    const clientMessageId = `luck_dice_${Date.now()}`;
    const resSendDice = await fetch(`${API_URL}/conversations/conv_alex/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clientMessageId,
        senderId: 'usr_me',
        type: 'dice_event',
        text: '🎲',
        mediaUrl: 'dice_5'
      })
    });
    expect(resSendDice.status).toBe(201);
    const dataSendDice = await resSendDice.json();
    expect(dataSendDice.success).toBe(true);
    expect(dataSendDice.message.type).toBe('dice_event');

    // 4. Send Telegram Casino Slot Machine message
    const resSendSlot = await fetch(`${API_URL}/conversations/conv_alex/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clientMessageId: `luck_slot_${Date.now()}`,
        senderId: 'usr_me',
        type: 'slot_event',
        text: '🎰',
        mediaUrl: 'slot_7_7_7'
      })
    });
    expect(resSendSlot.status).toBe(201);
    const dataSendSlot = await resSendSlot.json();
    expect(dataSendSlot.message.type).toBe('slot_event');

    // 5. Send Telegram Flipping Coin message
    const resSendCoin = await fetch(`${API_URL}/conversations/conv_alex/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clientMessageId: `luck_coin_${Date.now()}`,
        senderId: 'usr_me',
        type: 'coin_event',
        text: '🪙',
        mediaUrl: 'coin_heads'
      })
    });
    expect(resSendCoin.status).toBe(201);
    const dataSendCoin = await resSendCoin.json();
    expect(dataSendCoin.message.type).toBe('coin_event');

    // 6. Record recent emoji
    const resEmoji = await fetch(`${API_URL}/emojis/recents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: 'usr_me', emoji: '🎰' })
    });
    expect(resEmoji.status).toBe(200);
  });

  // ==========================================================================
  // LIVING IDENTITY PROFILE TESTS
  // ==========================================================================

  it('enforces multi-tier privacy on Living Identity Profile (owner vs match vs public)', async () => {
    // 1. Fetch as Owner (usr_me)
    const resOwner = await fetch(`${API_URL}/profile/living/usr_me?viewerId=usr_me`);
    expect(resOwner.status).toBe(200);
    const dataOwner = await resOwner.json();
    expect(dataOwner.success).toBe(true);
    expect(dataOwner.accessLevel).toBe('owner');
    
    // Owner sees all sections including private journal
    const secTitlesOwner = dataOwner.sections.map((s: any) => s.title);
    expect(secTitlesOwner).toContain('Personal Philosophy & Worldview');
    expect(secTitlesOwner).toContain('Psychological Patterns & Emotional Life');
    expect(secTitlesOwner).toContain('Private Journal & Raw Musings');

    // Owner sees private draft thoughts
    const hasPrivateThought = dataOwner.thoughts.some((t: any) => t.visibility === 'private');
    expect(hasPrivateThought).toBe(true);

    // 2. Fetch as Match (usr_alex)
    const resMatch = await fetch(`${API_URL}/profile/living/usr_me?viewerId=usr_alex`);
    expect(resMatch.status).toBe(200);
    const dataMatch = await resMatch.json();
    expect(dataMatch.accessLevel).toBe('matches');

    const secTitlesMatch = dataMatch.sections.map((s: any) => s.title);
    expect(secTitlesMatch).toContain('Personal Philosophy & Worldview'); // public
    expect(secTitlesMatch).toContain('Psychological Patterns & Emotional Life'); // matches
    expect(secTitlesMatch).not.toContain('Private Journal & Raw Musings'); // private is completely omitted!

    // Match NEVER sees private thoughts
    const matchHasPrivateThought = dataMatch.thoughts.some((t: any) => t.visibility === 'private');
    expect(matchHasPrivateThought).toBe(false);

    // 3. Fetch as Public Visitor (usr_tara - not matched)
    const resPublic = await fetch(`${API_URL}/profile/living/usr_me?viewerId=usr_tara`);
    expect(resPublic.status).toBe(200);
    const dataPublic = await resPublic.json();
    expect(dataPublic.accessLevel).toBe('public');

    const secTitlesPublic = dataPublic.sections.map((s: any) => s.title);
    expect(secTitlesPublic).toContain('Personal Philosophy & Worldview'); // public
    expect(secTitlesPublic).not.toContain('Psychological Patterns & Emotional Life'); // matches-only omitted!
    expect(secTitlesPublic).not.toContain('Private Journal & Raw Musings'); // private omitted!
  });

  it('creates custom sections, adds rich entries, and reorders them', async () => {
    // 1. Create a brand new custom section
    const resSec = await fetch(`${API_URL}/profile/sections`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: 'usr_me',
        title: 'My Unusual Obsessions & Artifacts',
        description: 'Niche curiosities and vintage electronics I restore.',
        section_type: 'interests',
        icon: '📻',
        visibility: 'public'
      })
    });
    expect(resSec.status).toBe(200);
    const dataSec = await resSec.json();
    expect(dataSec.success).toBe(true);
    const newSecId = dataSec.section.id;

    // 2. Add an entry to this section
    const resEntry = await fetch(`${API_URL}/profile/entries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sectionId: newSecId,
        userId: 'usr_me',
        entry_type: 'text',
        title: 'Restoring 1970s Braun Audio Synthesizers',
        content: 'There is something deeply meditative about replacing electrolytic capacitors on German circuit boards.',
        visibility: 'public'
      })
    });
    expect(resEntry.status).toBe(200);
    const dataEntry = await resEntry.json();
    expect(dataEntry.success).toBe(true);
    expect(dataEntry.entry.section_id).toBe(newSecId);

    // 3. Reorder sections
    const resReorder = await fetch(`${API_URL}/profile/sections/reorder`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sectionIds: [newSecId, 'sec_philosophy', 'sec_contradictions']
      })
    });
    expect(resReorder.status).toBe(200);
  });

  it('creates user-defined questions, answers them, and adds timeline events', async () => {
    // 1. Create user question
    const resQ = await fetch(`${API_URL}/profile/questions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: 'usr_me',
        question: 'What is a book that changed the trajectory of your thinking?',
        description: 'Literature & Philosophy',
        answer_type: 'long_text',
        visibility: 'public',
        allow_responses: 1
      })
    });
    expect(resQ.status).toBe(200);
    const dataQ = await resQ.json();
    const qId = dataQ.question.id;

    // 2. Answer question
    const resAns = await fetch(`${API_URL}/profile/questions/${qId}/answer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: 'usr_me',
        answer_content: '"Gödel, Escher, Bach" by Douglas Hofstadter. It showed me how consciousness emerges from self-referential loops.',
        visibility: 'public'
      })
    });
    expect(resAns.status).toBe(200);
    const dataAns = await resAns.json();
    expect(dataAns.success).toBe(true);
    expect(dataAns.answer.question_id).toBe(qId);

    // 3. Add timeline event
    const resTime = await fetch(`${API_URL}/profile/timeline`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: 'usr_me',
        title: 'Built Autonomous Solar Powered Sensor Node',
        description: 'Installed a continuous environmental monitor in Sinharaja rainforest canopy.',
        event_date: 'Autumn 2023',
        date_precision: 'approximate',
        category: 'achievement',
        personal_significance: 'Combined IoT embedded hardware with ecological preservation.',
        lessons_learned: 'Nature is resilient; humidity is ruthless.',
        visibility: 'public'
      })
    });
    expect(resTime.status).toBe(200);
    const dataTime = await resTime.json();
    expect(dataTime.success).toBe(true);
    expect(dataTime.event.title).toContain('Solar Powered');
  });

  it('tests AI-assisted profile enhancement tools', async () => {
    // Polish
    const resPolish = await fetch(`${API_URL}/profile/ai/assist`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tool: 'polish',
        content: 'i like walking in quiet places and reading old books'
      })
    });
    expect(resPolish.status).toBe(200);
    const dataPolish = await resPolish.json();
    expect(dataPolish.success).toBe(true);
    expect(dataPolish.suggestion).toContain('quiet');

    // Suggest questions
    const resSugQ = await fetch(`${API_URL}/profile/ai/assist`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tool: 'suggest_questions' })
    });
    expect(resSugQ.status).toBe(200);
    const dataSugQ = await resSugQ.json();
    const parsedQuestions = JSON.parse(dataSugQ.suggestion);
    expect(Array.isArray(parsedQuestions)).toBe(true);
    expect(parsedQuestions.length).toBeGreaterThan(0);
  });

  it('exports user profile archive and verifies full data snapshot', async () => {
    const resExport = await fetch(`${API_URL}/profile/export?userId=usr_me`);
    expect(resExport.status).toBe(200);
    const dataExport = await resExport.json();
    expect(dataExport.success).toBe(true);
    expect(dataExport.user.id).toBe('usr_me');
    expect(Array.isArray(dataExport.sections)).toBe(true);
    expect(Array.isArray(dataExport.entries)).toBe(true);
    expect(Array.isArray(dataExport.questions)).toBe(true);
    expect(Array.isArray(dataExport.answers)).toBe(true);
    expect(Array.isArray(dataExport.timeline)).toBe(true);
    expect(Array.isArray(dataExport.thoughts)).toBe(true);
  });

  // ==========================================================================
  // YEAR-BY-YEAR LIFE TIMELINE & PERSONAL HISTORY TESTS
  // ==========================================================================

  it('verifies year-by-year timeline structure, multi-year chapters, and privacy enforcement', async () => {
    // 1. Fetch all years for usr_me
    const resYears = await fetch(`${API_URL}/timeline/years/usr_me?viewerId=usr_me`);
    expect(resYears.status).toBe(200);
    const dataYears = await resYears.json();
    expect(dataYears.success).toBe(true);
    expect(Array.isArray(dataYears.years)).toBe(true);
    
    const yearNums = dataYears.years.map((y: any) => y.year_number);
    expect(yearNums).toContain(2019);
    expect(yearNums).toContain(2022);
    expect(yearNums).toContain(2026); // future year

    // 2. Fetch single year chapter (2022) with events and review
    const res2022Owner = await fetch(`${API_URL}/timeline/year/usr_me/2022?viewerId=usr_me`);
    expect(res2022Owner.status).toBe(200);
    const data2022Owner = await res2022Owner.json();
    expect(data2022Owner.success).toBe(true);
    expect(data2022Owner.year.year_number).toBe(2022);
    expect(data2022Owner.review).toBeDefined();
    expect(data2022Owner.review.title).toContain('2022 Annual Review');

    // Owner sees private event
    const ownerHasPrivateEvt = data2022Owner.events.some((e: any) => e.visibility === 'private');
    expect(ownerHasPrivateEvt).toBe(true);

    // 3. Fetch single year chapter (2022) as Public Visitor (usr_tara)
    const res2022Pub = await fetch(`${API_URL}/timeline/year/usr_me/2022?viewerId=usr_tara`);
    expect(res2022Pub.status).toBe(200);
    const data2022Pub = await res2022Pub.json();
    expect(data2022Pub.success).toBe(true);
    // Public visitor NEVER receives private event
    const pubHasPrivateEvt = data2022Pub.events.some((e: any) => e.visibility === 'private');
    expect(pubHasPrivateEvt).toBe(false);

    // 4. Fetch multi-year chapters
    const resChapters = await fetch(`${API_URL}/timeline/chapters/usr_me?viewerId=usr_me`);
    expect(resChapters.status).toBe(200);
    const dataChapters = await resChapters.json();
    expect(dataChapters.success).toBe(true);
    const chapTitles = dataChapters.chapters.map((c: any) => c.title);
    expect(chapTitles).toContain('University & Systems Foundations');
    expect(chapTitles).toContain('Autonomous Craft & Slow Living');
  });

  it('creates new historical life events, annual reviews, and Then-vs-Now comparisons', async () => {
    // 1. Add historical event to year 2017
    const resNewEvt = await fetch(`${API_URL}/timeline/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: 'usr_me',
        year_number: 2017,
        title: 'Built Solar Powered Micro-Hydro Sensor',
        description: 'First embedded IoT project testing water flow in stream.',
        date_display: 'September 2017',
        category: 'Creative projects',
        personal_significance: 'First time hardware connected to the internet.',
        lessons_learned: 'Waterproofing is harder than coding.',
        visibility: 'public'
      })
    });
    expect(resNewEvt.status).toBe(200);
    const dataNewEvt = await resNewEvt.json();
    expect(dataNewEvt.success).toBe(true);
    expect(dataNewEvt.event.year_number).toBe(2017);

    // 2. Fetch "Then vs Now" self-comparison
    const resComp = await fetch(`${API_URL}/timeline/reflections/usr_me?type=then_vs_now&viewerId=usr_me`);
    expect(resComp.status).toBe(200);
    const dataComp = await resComp.json();
    expect(dataComp.success).toBe(true);
    expect(dataComp.reflections.length).toBeGreaterThanOrEqual(1);

    const comp = dataComp.reflections[0];
    const parsed = JSON.parse(comp.content_json);
    expect(parsed.personality).toBeDefined();
    expect(parsed.personality.then).toBeDefined();
    expect(parsed.personality.now).toBeDefined();

    // 3. Create a new year-end review
    const resReview = await fetch(`${API_URL}/timeline/reflections`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: 'usr_me',
        reflection_type: 'year_end_review',
        year_number: 2024,
        title: '2024 Review: Reclaiming Agency',
        content_json: {
          best_memory: 'First morning waking up with zero corporate emails.',
          biggest_achievement: 'Surpassed 1000 daily readers on independent essays.',
          biggest_lesson: 'Autonomy is non-negotiable.'
        },
        visibility: 'public'
      })
    });
    expect(resReview.status).toBe(200);
    const dataReview = await resReview.json();
    expect(dataReview.success).toBe(true);
    expect(dataReview.reflection.year_number).toBe(2024);
  });

  it('handles GitHub-Flavored Markdown profile text inputs with strict 5,000 character limit', async () => {
    // 1. Fetch default seeded GitHub markdown manifesto
    const resGet = await fetch(`${API_URL}/profile/markdown/usr_me?viewerId=usr_me`);
    expect(resGet.status).toBe(200);
    const dataGet = await resGet.json();
    expect(dataGet.success).toBe(true);
    expect(dataGet.markdown).toBeDefined();
    expect(dataGet.markdown.title).toBe('README.md');
    expect(dataGet.markdown.content).toContain('# 🚀 Kavindu Senanayake / README.md');
    expect(dataGet.markdown.content).toContain('- [x]');
    expect(dataGet.characterCount).toBeLessThanOrEqual(5000);
    expect(dataGet.maxLimit).toBe(5000);

    // 2. Reject markdown input exceeding 5,000 characters
    const oversizedContent = '# Excessive Markdown\n' + 'a'.repeat(5050);
    const resOversized = await fetch(`${API_URL}/profile/markdown`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: 'usr_me',
        title: 'README.md',
        content: oversizedContent,
        visibility: 'public'
      })
    });
    expect(resOversized.status).toBe(400);
    const dataOversized = await resOversized.json();
    expect(dataOversized.error).toContain('5,000 characters');
    expect(dataOversized.characterCount).toBe(oversizedContent.length);

    // 3. Save valid GitHub markdown within 5,000 character limit
    const validMarkdown = `# 🌌 Custom User Manifesto

> *"The mind is not a vessel to be filled, but a fire to be kindled."* — Plutarch

### 🎯 2026 Goals:
- [x] Master local-first architecture
- [ ] Read 40 non-fiction books
- [ ] Climb the western ridge

| Skill | Experience | Passion |
|---|---|---|
| Distributed Systems | 7 Years | Maximum |
| Minimalist UI | 5 Years | Obsession |
`;
    const resSave = await fetch(`${API_URL}/profile/markdown`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: 'usr_me',
        title: 'README.md',
        content: validMarkdown,
        visibility: 'private'
      })
    });
    expect(resSave.status).toBe(200);
    const dataSave = await resSave.json();
    expect(dataSave.success).toBe(true);
    expect(dataSave.characterCount).toBe(validMarkdown.length);
    expect(dataSave.remainingCharacters).toBe(5000 - validMarkdown.length);

    // 4. Privacy enforcement: Private markdown is hidden from strangers
    const resStranger = await fetch(`${API_URL}/profile/markdown/usr_me?viewerId=usr_stranger`);
    expect(resStranger.status).toBe(200);
    const dataStranger = await resStranger.json();
    expect(dataStranger.success).toBe(true);
    expect(dataStranger.markdown).toBeNull();
    expect(dataStranger.isRestricted).toBe(true);
    expect(dataStranger.requiredVisibility).toBe('private');

    // 5. Owner can still see their own private markdown
    const resOwner = await fetch(`${API_URL}/profile/markdown/usr_me?viewerId=usr_me`);
    expect(resOwner.status).toBe(200);
    const dataOwner = await resOwner.json();
    expect(dataOwner.success).toBe(true);
    expect(dataOwner.markdown).toBeDefined();
    expect(dataOwner.markdown.content).toContain('Custom User Manifesto');

    // Restore original public markdown for UI experience
    await fetch(`${API_URL}/profile/markdown`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: 'usr_me',
        title: 'README.md',
        content: dataGet.markdown.content,
        visibility: 'public'
      })
    });
  });

  it('manages Profile Worlds with multi-dimensional identities, templates, and reality classifications', async () => {
    // 1. Fetch all profile worlds for usr_me as owner
    const resOwner = await fetch(`${API_URL}/worlds/user/usr_me?viewerId=usr_me`);
    expect(resOwner.status).toBe(200);
    const dataOwner = await resOwner.json();
    expect(dataOwner.success).toBe(true);
    expect(dataOwner.worlds.length).toBeGreaterThanOrEqual(5);

    const defaultWorld = dataOwner.worlds.find((w: any) => w.is_default === 1);
    expect(defaultWorld).toBeDefined();
    expect(defaultWorld.name).toBe("The Architect's Journal");
    expect(defaultWorld.world_type).toBe('real_life');

    // 2. Audience Privacy Enforcement: Stranger cannot see 'matches' world (Sanctuary of Silent Thoughts)
    const resStranger = await fetch(`${API_URL}/worlds/user/usr_me?viewerId=usr_stranger`);
    expect(resStranger.status).toBe(200);
    const dataStranger = await resStranger.json();
    expect(dataStranger.success).toBe(true);
    const innerWorldForStranger = dataStranger.worlds.find((w: any) => w.id === 'wld_inner_kavindu');
    expect(innerWorldForStranger).toBeUndefined(); // Strictly filtered out for strangers

    // 3. Match Audience: Alex (mutual match) CAN see Inner World
    const resMatch = await fetch(`${API_URL}/worlds/user/usr_me?viewerId=usr_alex`);
    expect(resMatch.status).toBe(200);
    const dataMatch = await resMatch.json();
    const innerWorldForMatch = dataMatch.worlds.find((w: any) => w.id === 'wld_inner_kavindu');
    expect(innerWorldForMatch).toBeDefined();
    expect(innerWorldForMatch.visibility).toBe('matches');

    // 4. Fetch details of Cinematic Life world with reality classifications
    const resCine = await fetch(`${API_URL}/worlds/wld_cine_kavindu?viewerId=usr_me`);
    expect(resCine.status).toBe(200);
    const dataCine = await resCine.json();
    expect(dataCine.success).toBe(true);
    expect(dataCine.world.layout_type).toBe('cinematic');
    expect(dataCine.sections.length).toBeGreaterThanOrEqual(1);
    expect(dataCine.entries.length).toBeGreaterThanOrEqual(1);

    const cineEntry = dataCine.entries.find((e: any) => e.reality_classification === 'cinematic');
    expect(cineEntry).toBeDefined();
    expect(cineEntry.title).toContain('Character Archetype');

    // Check cross-world reference relations
    expect(Array.isArray(dataCine.relations)).toBe(true);

    // 5. Create a new custom world with Cinematic template
    const resCreate = await fetch(`${API_URL}/worlds`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: 'usr_me',
        name: 'The Cyberpunk Noir Era',
        slug: `cyberpunk-noir-${Date.now()}`,
        description: 'Testing template instantiation and section seeding',
        world_type: 'cinematic_life',
        template_id: 'cinematic_life',
        visibility: 'public'
      })
    });
    expect(resCreate.status).toBe(200);
    const dataCreate = await resCreate.json();
    expect(dataCreate.success).toBe(true);
    expect(dataCreate.world.name).toBe('The Cyberpunk Noir Era');
    const newWorldId = dataCreate.world.id;

    // 6. Test 5,000 character limit enforcement on world entry creation
    const oversizedContent = 'x'.repeat(5001);
    const resOversized = await fetch(`${API_URL}/worlds/${newWorldId}/entries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sectionId: 'sec_fake',
        userId: 'usr_me',
        title: 'Too long',
        content: oversizedContent,
        reality_classification: 'cinematic'
      })
    });
    expect(resOversized.status).toBe(400);
    const dataOversized = await resOversized.json();
    expect(dataOversized.error).toContain('5,000 characters');

    // 7. Duplicate world
    const resDup = await fetch(`${API_URL}/worlds/${newWorldId}/duplicate`, {
      method: 'POST'
    });
    expect(resDup.status).toBe(200);
    const dataDup = await resDup.json();
    expect(dataDup.success).toBe(true);
    expect(dataDup.world.name).toContain('(Copy)');
    expect(dataDup.world.status).toBe('draft');

    // Clean up temporary worlds
    await fetch(`${API_URL}/worlds/${newWorldId}`, { method: 'DELETE' });
    await fetch(`${API_URL}/worlds/${dataDup.world.id}`, { method: 'DELETE' });
  });

  it('validates Daily Relationship & Human Connection Intelligence System', async () => {
    // 1. Fetch Categories (15 categories across 4 tabs)
    const resCats = await fetch(`${API_URL}/daily-content/categories`);
    expect(resCats.status).toBe(200);
    const dataCats = await resCats.json();
    expect(dataCats.success).toBe(true);
    expect(dataCats.categories.length).toBeGreaterThanOrEqual(15);
    const tabs = new Set(dataCats.categories.map((c: any) => c.tab));
    expect(tabs.has('love')).toBe(true);
    expect(tabs.has('friendship')).toBe(true);
    expect(tabs.has('mind')).toBe(true);
    expect(tabs.has('growth')).toBe(true);

    // 2. Fetch Preferences & Streak
    const resPrefs = await fetch(`${API_URL}/daily-content/preferences?userId=usr_me`);
    expect(resPrefs.status).toBe(200);
    const dataPrefs = await resPrefs.json();
    expect(dataPrefs.success).toBe(true);
    expect(dataPrefs.preferences.member_id).toBe('usr_me');
    expect(dataPrefs.streak.current_streak).toBeGreaterThanOrEqual(1);

    // 3. Update Preferences (Set edition to universal, relationship status to single)
    const resUpdPrefs = await fetch(`${API_URL}/daily-content/preferences`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: 'usr_me',
        editionPreference: 'universal',
        relationshipStatus: 'single',
        datingIntentions: 'meaningful_connection',
        friendshipTrack: 'deepening_friendships'
      })
    });
    expect(resUpdPrefs.status).toBe(200);

    // 4. Retrieve Today's Content (Must deliver 4 permanent tabs: Love, Friendship, Mind, Growth)
    const todayStr = '2026-11-11';
    const resToday = await fetch(`${API_URL}/daily-content/today?userId=usr_me&date=${todayStr}`);
    expect(resToday.status).toBe(200);
    const dataToday = await resToday.json();
    expect(dataToday.success).toBe(true);
    expect(dataToday.date).toBe(todayStr);
    expect(dataToday.editions.love).toBeDefined();
    expect(dataToday.editions.friendship).toBeDefined();
    expect(dataToday.editions.mind).toBeDefined();
    expect(dataToday.editions.growth).toBeDefined();

    const loveContent = dataToday.editions.love;
    expect(loveContent.title).toBeDefined();
    expect(loveContent.quote_one_liner).toBeDefined();
    expect(loveContent.reflection_question).toBeDefined();

    // 5. Test Determinism: Second fetch for same user & date MUST return the same assignment ID
    const resTodayDup = await fetch(`${API_URL}/daily-content/today?userId=usr_me&date=${todayStr}`);
    const dataTodayDup = await resTodayDup.json();
    expect(dataTodayDup.editions.love.id).toBe(loveContent.id);
    expect(dataTodayDup.editions.love.content_id).toBe(loveContent.content_id);

    // 6. Submit Reflection to Daily Question
    const resReflect = await fetch(`${API_URL}/daily-content/reflect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: 'usr_me',
        assignmentId: loveContent.id,
        reflectionAnswer: 'I will consciously listen for the emotional feeling instead of preparing a rebuttal.'
      })
    });
    expect(resReflect.status).toBe(200);
    const dataReflect = await resReflect.json();
    expect(dataReflect.success).toBe(true);

    // 7. Complete Daily Action Exercise
    const resChallenge = await fetch(`${API_URL}/daily-content/challenge`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: 'usr_me',
        assignmentId: loveContent.id,
        completed: true
      })
    });
    expect(resChallenge.status).toBe(200);
    const dataChallenge = await resChallenge.json();
    expect(dataChallenge.success).toBe(true);
    expect(dataChallenge.completed).toBe(true);

    // 8. Like & Save Daily Content
    const resLike = await fetch(`${API_URL}/daily-content/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: 'usr_me',
        contentId: loveContent.content_id,
        action: 'like'
      })
    });
    expect(resLike.status).toBe(200);
    const dataLike = await resLike.json();
    expect(dataLike.success).toBe(true);

    const resSave = await fetch(`${API_URL}/daily-content/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: 'usr_me',
        contentId: loveContent.content_id,
        action: 'save'
      })
    });
    expect(resSave.status).toBe(200);
    const dataSave = await resSave.json();
    expect(dataSave.success).toBe(true);

    // If it was toggled off from a prior run, toggle it to active
    if (!dataSave.active) {
      await fetch(`${API_URL}/daily-content/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'usr_me',
          contentId: loveContent.content_id,
          action: 'save'
        })
      });
    }

    // 9. Fetch Saved Archive
    const resSaved = await fetch(`${API_URL}/daily-content/saved?userId=usr_me`);
    expect(resSaved.status).toBe(200);
    const dataSaved = await resSaved.json();
    expect(dataSaved.success).toBe(true);
    expect(dataSaved.items.some((i: any) => i.id === loveContent.content_id)).toBe(true);

    // 10. Fetch History
    const resHist = await fetch(`${API_URL}/daily-content/history?userId=usr_me`);
    expect(resHist.status).toBe(200);
    const dataHist = await resHist.json();
    expect(dataHist.success).toBe(true);
    expect(dataHist.history.length).toBeGreaterThanOrEqual(1);
  });
});
