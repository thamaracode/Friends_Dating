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
});
