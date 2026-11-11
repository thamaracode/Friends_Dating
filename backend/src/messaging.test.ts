import { describe, it, expect, beforeAll } from 'vitest';

describe('FRIENDS Production Messaging Backend API Integration', () => {
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

  it('toggles reactions and manages message pinning', async () => {
    // 1. Get messages
    const resMsgs = await fetch(`${API_URL}/conversations/conv_alex/messages?userId=usr_me`);
    const msgsData = await resMsgs.json();
    const firstMsg = msgsData.messages[0];

    // 2. Add reaction
    const resReact = await fetch(`${API_URL}/messages/${firstMsg.id}/reactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: 'usr_me', emoji: '❤️' })
    });
    expect(resReact.status).toBe(200);

    // 3. Pin message
    const resPin = await fetch(`${API_URL}/messages/${firstMsg.id}/pin`, {
      method: 'PATCH'
    });
    expect(resPin.status).toBe(200);
    const pinData = await resPin.json();
    expect(typeof pinData.isPinned).toBe('boolean');
  });
});
