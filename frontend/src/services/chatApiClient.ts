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

  public async getMessages(conversationId: string, limit: number = 50) {
    const res = await fetch(`${API_BASE}/conversations/${conversationId}/messages?userId=${this.currentUserId}&limit=${limit}`);
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
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to send message');
    }
    return await res.json();
  }

  public async editMessage(messageId: string, text: string) {
    const res = await fetch(`${API_BASE}/messages/${messageId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text,
        editorId: this.currentUserId
      })
    });
    if (!res.ok) throw new Error('Failed to edit message');
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

  public async deleteMessage(messageId: string, forEveryone: boolean = false) {
    const res = await fetch(`${API_BASE}/messages/${messageId}?forEveryone=${forEveryone}`, {
      method: 'DELETE'
    });
    return await res.json();
  }

  public async markConversationAsRead(conversationId: string) {
    const res = await fetch(`${API_BASE}/conversations/${conversationId}/read`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: this.currentUserId })
    });
    return await res.json();
  }

  public async uploadAttachment(file: Blob, originalName: string = 'voice.webm') {
    const formData = new FormData();
    formData.append('file', file, originalName);

    const res = await fetch(`${API_BASE}/attachments/upload`, {
      method: 'POST',
      body: formData
    });
    if (!res.ok) throw new Error('Failed to upload attachment');
    return await res.json();
  }

  public async searchConversation(conversationId: string, query: string) {
    const res = await fetch(`${API_BASE}/conversations/${conversationId}/search?q=${encodeURIComponent(query)}`);
    if (!res.ok) throw new Error('Failed to search messages');
    return await res.json();
  }

  public async saveDraft(conversationId: string, draftText: string) {
    const res = await fetch(`${API_BASE}/conversations/${conversationId}/draft`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: this.currentUserId, draftText })
    });
    return await res.json();
  }

  public async getDraft(conversationId: string) {
    const res = await fetch(`${API_BASE}/conversations/${conversationId}/draft?userId=${this.currentUserId}`);
    if (!res.ok) return '';
    const data = await res.json();
    return data.draftText || '';
  }

  public async blockUser(targetUserId: string) {
    const res = await fetch(`${API_BASE}/users/${targetUserId}/block`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ blockerId: this.currentUserId })
    });
    return await res.json();
  }

  public async unblockUser(targetUserId: string) {
    const res = await fetch(`${API_BASE}/users/${targetUserId}/block`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ blockerId: this.currentUserId })
    });
    return await res.json();
  }

  public async submitReport(params: { reportedUserId: string; messageId?: string; reason: string; details?: string }) {
    const res = await fetch(`${API_BASE}/reports`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        reporterId: this.currentUserId,
        ...params
      })
    });
    return await res.json();
  }

  public async startDatingGame(conversationId: string, gameType: string) {
    const res = await fetch(`${API_BASE}/games/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        conversationId,
        gameType,
        currentUserId: this.currentUserId
      })
    });
    return await res.json();
  }

  // -------------------------------------------------------------
  // Digital Life / Social Links Methods
  // -------------------------------------------------------------

  public async recognizeSocialUrl(url: string) {
    const res = await fetch(`${API_BASE}/profile/social-links/recognize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    });
    if (!res.ok) throw new Error('Failed to recognize social URL');
    return await res.json();
  }

  public async getMySocialLinks() {
    const res = await fetch(`${API_BASE}/profile/social-links?userId=${this.currentUserId}`);
    if (!res.ok) throw new Error('Failed to fetch social links');
    const data = await res.json();
    return data.links;
  }

  public async addSocialLink(params: {
    url: string;
    customLabel?: string;
    visibility: 'public' | 'matches_only' | 'private';
  }) {
    const res = await fetch(`${API_BASE}/profile/social-links`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: this.currentUserId,
        ...params
      })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to add social link');
    return data;
  }

  public async updateSocialLink(id: string, params: {
    customLabel?: string;
    visibility?: 'public' | 'matches_only' | 'private';
    sortOrder?: number;
  }) {
    const res = await fetch(`${API_BASE}/profile/social-links/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: this.currentUserId,
        ...params
      })
    });
    if (!res.ok) throw new Error('Failed to update social link');
    return await res.json();
  }

  public async deleteSocialLink(id: string) {
    const res = await fetch(`${API_BASE}/profile/social-links/${id}?userId=${this.currentUserId}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Failed to delete social link');
    return await res.json();
  }

  public async reorderSocialLinks(linkIds: string[]) {
    const res = await fetch(`${API_BASE}/profile/social-links-reorder`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: this.currentUserId,
        linkIds
      })
    });
    if (!res.ok) throw new Error('Failed to reorder links');
    return await res.json();
  }

  public async getUserPublicSocialLinks(targetUserId: string) {
    const res = await fetch(`${API_BASE}/users/${targetUserId}/social-links?callerId=${this.currentUserId}`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.links || [];
  }

  // -------------------------------------------------------------
  // Stickers & Animated Emoji Methods
  // -------------------------------------------------------------

  public async getStickerPacks() {
    const res = await fetch(`${API_BASE}/stickers/packs?userId=${this.currentUserId}`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.packs || [];
  }

  public async getMyInstalledStickerPacks() {
    const res = await fetch(`${API_BASE}/stickers/my-packs?userId=${this.currentUserId}`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.packs || [];
  }

  public async installStickerPack(packId: string) {
    const res = await fetch(`${API_BASE}/stickers/packs/${packId}/install`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: this.currentUserId })
    });
    return await res.json();
  }

  public async uninstallStickerPack(packId: string) {
    const res = await fetch(`${API_BASE}/stickers/packs/${packId}/install?userId=${this.currentUserId}`, {
      method: 'DELETE'
    });
    return await res.json();
  }

  public async recordRecentEmoji(emoji: string) {
    const res = await fetch(`${API_BASE}/emojis/recents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: this.currentUserId, emoji })
    });
    return await res.json();
  }

  public async getRecentEmojis() {
    const res = await fetch(`${API_BASE}/emojis/recents?userId=${this.currentUserId}`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.recents || [];
  }
}

export const chatClient = new ChatApiClient('usr_me');
