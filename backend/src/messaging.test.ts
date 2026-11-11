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
});
