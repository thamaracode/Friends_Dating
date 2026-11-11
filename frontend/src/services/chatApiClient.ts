const API_BASE = 'http://127.0.0.1:3001/api/v1';
const WS_BASE = 'ws://127.0.0.1:3001';

export class ChatApiClient {
  private ws: WebSocket | null = null;
  private currentUserId: string = 'usr_me';
  private eventListeners: Map<string, Set<(data: any) => void>> = new Map();

  constructor(userId: string = 'usr_me') {
    this.currentUserId = userId;
    this.initWebSocket();
  }

  public setUserId(userId: string) {
    this.currentUserId = userId;
    if (this.ws) {
      this.ws.close();
      this.initWebSocket();
    }
  }

  private initWebSocket() {
    try {
      this.ws = new WebSocket(`${WS_BASE}?userId=${this.currentUserId}`);

      this.ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          this.triggerEvent(payload.type, payload);
          this.triggerEvent('*', payload);
        } catch (e) {
          console.error('Failed to parse WebSocket event', e);
        }
      };

      this.ws.onclose = () => {
        // Reconnect with exponential backoff
        setTimeout(() => this.initWebSocket(), 3000);
      };

      this.ws.onerror = (err) => {
        console.warn('Chat WS error', err);
      };
    } catch (e) {
      console.warn('WS initialization error', e);
    }
  }

  public subscribe(eventType: string, callback: (data: any) => void) {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, new Set());
    }
    this.eventListeners.get(eventType)!.add(callback);

    return () => {
      this.eventListeners.get(eventType)?.delete(callback);
    };
  }

  private triggerEvent(eventType: string, data: any) {
    const listeners = this.eventListeners.get(eventType);
    if (listeners) {
      listeners.forEach(cb => cb(data));
    }
  }

  public sendSocketEvent(type: string, data: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, ...data }));
    }
  }

  // -------------------------------------------------------------
  // REST API Methods
  // -------------------------------------------------------------

  public async getConversations() {
    const res = await fetch(`${API_BASE}/conversations?userId=${this.currentUserId}`);
    if (!res.ok) throw new Error('Failed to fetch conversations');
    const data = await res.json();
    return data.conversations;
  }

  public async getMessages(conversationId: string) {
    const res = await fetch(`${API_BASE}/conversations/${conversationId}/messages?userId=${this.currentUserId}`);
    if (!res.ok) throw new Error('Failed to fetch messages');
    const data = await res.json();
    return data.messages;
  }

  public async sendMessage(params: {
    conversationId: string;
    text?: string;
    type?: string;
    mediaUrl?: string;
    voiceDuration?: number;
    voiceWaveform?: number[];
    replyToMessageId?: string;
  }) {
    const clientMessageId = `cli_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const res = await fetch(`${API_BASE}/conversations/${params.conversationId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clientMessageId,
        senderId: this.currentUserId,
        type: params.type || 'text',
        text: params.text,
        mediaUrl: params.mediaUrl,
        voiceDuration: params.voiceDuration,
        voiceWaveform: params.voiceWaveform,
        replyToMessageId: params.replyToMessageId
      })
    });
    if (!res.ok) throw new Error('Failed to send message');
    return await res.json();
  }

  public async toggleReaction(messageId: string, emoji: string) {
    const res = await fetch(`${API_BASE}/messages/${messageId}/reactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: this.currentUserId,
        emoji
      })
    });
    return await res.json();
  }

  public async togglePin(messageId: string) {
    const res = await fetch(`${API_BASE}/messages/${messageId}/pin`, {
      method: 'PATCH'
    });
    return await res.json();
  }

  public async deleteMessage(messageId: string) {
    const res = await fetch(`${API_BASE}/messages/${messageId}`, {
      method: 'DELETE'
    });
    return await res.json();
  }
}

export const chatClient = new ChatApiClient('usr_me');
