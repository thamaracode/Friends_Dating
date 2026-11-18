import { Centrifuge, type Subscription } from 'centrifuge';
import { API_BASE_V1 as API_BASE, WS_BASE } from './apiConfig';
import { offlineChatDb } from './offlineChatDb';
import { webrtcCallService } from './webrtcCallService';

export class ChatApiClient {
  private ws: WebSocket | null = null;
  private centrifuge: Centrifuge | null = null;
  private activeSubscriptions: Map<string, Subscription> = new Map();
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private currentUserId: string = 'usr_me';
  private eventListeners: Map<string, Set<(data: any) => void>> = new Map();
  private isDrainingOutbox: boolean = false;
  private activeTransport: 'centrifugo' | 'native_websocket' = 'native_websocket';

  constructor(userId: string = 'usr_me') {
    this.currentUserId = userId;
    this.initRealtimeTransport();

    // Connect WebRTC signaling bridge
    webrtcCallService.setSignalSender((signalPayload) => {
      this.sendSocketEvent('call.signal', {
        recipientId: signalPayload.recipientId,
        callType: signalPayload.callType,
        signalData: signalPayload.signalData || signalPayload
      });
    });
  }

  public setUserId(userId: string) {
    if (userId === this.currentUserId) return;
    this.currentUserId = userId;
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.reconnectTimer = null;
    this.disconnectAll();
    this.initRealtimeTransport();
  }

  public getTransportMode(): 'centrifugo' | 'native_websocket' {
    return this.activeTransport;
  }

  private disconnectAll() {
    if (this.centrifuge) {
      try {
        this.centrifuge.disconnect();
      } catch { /* noop */ }
      this.centrifuge = null;
      this.activeSubscriptions.clear();
    }
    if (this.ws) {
      try {
        this.ws.close();
      } catch { /* noop */ }
      this.ws = null;
    }
  }

  /**
   * Initializes real-time transport: Attempts Centrifugo connection first;
   * falls back gracefully to high-performance native WebSocket if Centrifugo is offline.
   */
  private async initRealtimeTransport() {
    try {
      const tokenRes = await fetch(`${API_BASE}/realtime/token?userId=${encodeURIComponent(this.currentUserId)}`);
      if (tokenRes.ok) {
        const tokenData = await tokenRes.json();
        if (tokenData.success && tokenData.centrifugoAvailable && tokenData.wsUrl && tokenData.token) {
          this.initCentrifugo(tokenData.wsUrl, tokenData.token);
          return;
        }
      }
    } catch {
      // Centrifugo token endpoint or service unavailable; continue to native fallback
    }

    // Fallback to native WebSocket
    this.initWebSocket();
  }

  /**
   * Connects to Centrifugo WebSocket server with signed HMAC-SHA256 JWT
   */
  private initCentrifugo(wsUrl: string, token: string) {
    try {
      const centrifuge = new Centrifuge(wsUrl, {
        token,
        getToken: async () => {
          const res = await fetch(`${API_BASE}/realtime/token?userId=${encodeURIComponent(this.currentUserId)}`);
          const data = await res.json();
          return data.token;
        }
      });

      this.centrifuge = centrifuge;

      centrifuge.on('connected', () => {
        this.activeTransport = 'centrifugo';
        this.triggerEvent('ws.open', { userId: this.currentUserId, transport: 'centrifugo' });
        this.drainOutbox();
      });

      centrifuge.on('disconnected', () => {
        this.triggerEvent('ws.close', { userId: this.currentUserId, transport: 'centrifugo' });
      });

      centrifuge.on('error', (ctx) => {
        console.warn('Centrifugo connection error', ctx);
        // If Centrifugo fails to connect, fallback to native WebSocket
        if (this.activeTransport !== 'centrifugo') {
          this.initWebSocket();
        }
      });

      // Subscribe to user notification & presence stream
      const userChannel = `user:${this.currentUserId}`;
      this.subscribeChannel(userChannel);

      centrifuge.connect();
    } catch (e) {
      console.warn('Centrifugo initialization failed, reverting to native WebSocket', e);
      this.initWebSocket();
    }
  }

  /**
   * Subscribes to a Centrifugo channel with publication dispatching and recovery
   */
  public async subscribeChannel(channel: string): Promise<Subscription | null> {
    if (!this.centrifuge || this.activeSubscriptions.has(channel)) {
      return this.activeSubscriptions.get(channel) || null;
    }

    try {
      const sub = this.centrifuge.newSubscription(channel, {
        getToken: async () => {
          const res = await fetch(`${API_BASE}/realtime/subscribe-token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: this.currentUserId, channel })
          });
          const data = await res.json();
          return data.token;
        }
      });

      sub.on('publication', (ctx) => {
        const payload = ctx.data;
        if (!payload) return;

        // Server message ACK handling
        if (payload.type === 'ack') {
          offlineChatDb.reconcileMessageAck(
            payload.clientMessageId,
            payload.serverMessageId,
            payload.sequenceNumber,
            payload.timestamp
          );
        }

        // WebRTC call signaling handling
        if (payload.type === 'call.signal' || payload.type?.startsWith('call.')) {
          webrtcCallService.handleIncomingSignal(
            payload.senderId,
            payload.signalData || payload,
            payload.senderName,
            payload.senderAvatar
          );
        }

        this.triggerEvent(payload.type, payload);
        this.triggerEvent('*', payload);
      });

      sub.subscribe();
      this.activeSubscriptions.set(channel, sub);
      return sub;
    } catch (err) {
      console.warn(`Failed to subscribe to Centrifugo channel ${channel}`, err);
      return null;
    }
  }

  /**
   * Subscribes to conversation dialog stream (e.g. dialog:conv_123)
   */
  public async subscribeToConversation(conversationId: string) {
    if (this.centrifuge) {
      await this.subscribeChannel(`dialog:${conversationId}`);
    }
  }

  private initWebSocket() {
    try {
      const socket = new WebSocket(`${WS_BASE}?userId=${encodeURIComponent(this.currentUserId)}`);
      this.ws = socket;

      socket.onopen = () => {
        if (this.ws !== socket) return;
        this.triggerEvent('ws.open', { userId: this.currentUserId });
        this.drainOutbox();
      };

      socket.onmessage = (event) => {
        if (this.ws !== socket) return;
        try {
          const payload = JSON.parse(event.data);

          // Server message ACK handling
          if (payload.type === 'ack') {
            offlineChatDb.reconcileMessageAck(
              payload.clientMessageId,
              payload.serverMessageId,
              payload.sequenceNumber,
              payload.timestamp
            );
          }

          // WebRTC call signaling handling
          if (payload.type === 'call.signal' || payload.type.startsWith('call.')) {
            webrtcCallService.handleIncomingSignal(
              payload.senderId,
              payload.signalData || payload,
              payload.senderName,
              payload.senderAvatar
            );
          }

          this.triggerEvent(payload.type, payload);
          this.triggerEvent('*', payload);
        } catch (e) {
          console.error('Failed to parse WebSocket event', e);
        }
      };

      socket.onclose = () => {
        if (this.ws !== socket) return;
        this.triggerEvent('ws.close', { userId: this.currentUserId });
        this.reconnectTimer = setTimeout(() => {
          this.reconnectTimer = null;
          if (this.ws === socket) this.initWebSocket();
        }, 3000);
      };

      socket.onerror = (err) => {
        console.warn('Chat WS error', err);
      };
    } catch (e) {
      console.warn('WS initialization error', e);
    }
  }

  /**
   * Automatically drains pending offline outbox messages in chronological order
   */
  public async drainOutbox() {
    if (this.isDrainingOutbox) return;
    this.isDrainingOutbox = true;

    try {
      const pending = await offlineChatDb.getPendingOutbox();
      for (const item of pending) {
        try {
          await offlineChatDb.updateOutboxStatus(item.clientMessageId, 'sending');

          if (item.type === 'poll' && item.pollData) {
            await this.createPoll({
              conversationId: item.conversationId,
              clientMessageId: item.clientMessageId,
              question: item.pollData.question,
              options: item.pollData.options,
              allowsMultiple: item.pollData.allowsMultiple
            });
          } else {
            await this.sendMessage({
              conversationId: item.conversationId,
              clientMessageId: item.clientMessageId,
              text: item.text,
              type: item.type,
              mediaUrl: item.mediaUrl,
              voiceDuration: item.voiceDuration,
              voiceWaveform: item.voiceWaveform,
              replyToMessageId: item.replyToMessageId
            });
          }

          await offlineChatDb.removeOutboxMessage(item.clientMessageId);
        } catch (err: any) {
          console.warn('Failed to drain outbox item', item.clientMessageId, err);
          await offlineChatDb.updateOutboxStatus(item.clientMessageId, 'failed', err.message);
        }
      }
    } finally {
      this.isDrainingOutbox = false;
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
    clientMessageId?: string;
    text?: string;
    type?: string;
    mediaUrl?: string;
    voiceDuration?: number;
    voiceWaveform?: number[];
    replyToMessageId?: string;
  }) {
    const clientMessageId = params.clientMessageId || `cli_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
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

  public async syncMessages(conversationId: string, sinceSequence: number = 0) {
    const res = await fetch(`${API_BASE}/conversations/${conversationId}/sync?sinceSequence=${sinceSequence}&userId=${this.currentUserId}`);
    if (!res.ok) throw new Error('Failed to sync messages');
    const data = await res.json();
    return data.messages || [];
  }

  // -------------------------------------------------------------
  // Group Conversation Methods
  // -------------------------------------------------------------

  public async createGroup(title: string, memberIds: string[], description?: string, avatarUrl?: string) {
    const res = await fetch(`${API_BASE}/conversations/group`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        creatorId: this.currentUserId,
        title,
        description,
        avatarUrl,
        memberIds
      })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to create group');
    }
    return await res.json();
  }

  public async addGroupMember(conversationId: string, userId: string, role: string = 'member') {
    const res = await fetch(`${API_BASE}/conversations/${conversationId}/members`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        actorId: this.currentUserId,
        userId,
        role
      })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to add group member');
    }
    return await res.json();
  }

  public async removeGroupMember(conversationId: string, userId: string) {
    const res = await fetch(`${API_BASE}/conversations/${conversationId}/members/${userId}?actorId=${this.currentUserId}`, {
      method: 'DELETE'
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to remove member');
    }
    return await res.json();
  }

  public async leaveGroup(conversationId: string) {
    return await this.removeGroupMember(conversationId, this.currentUserId);
  }

  public async updateGroupInfo(conversationId: string, updates: { title?: string; description?: string; avatarUrl?: string; settings?: any }) {
    const res = await fetch(`${API_BASE}/conversations/${conversationId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        actorId: this.currentUserId,
        ...updates
      })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to update group');
    }
    return await res.json();
  }

  public async getGroupMembers(conversationId: string) {
    const res = await fetch(`${API_BASE}/conversations/${conversationId}/members`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.members || [];
  }

  // -------------------------------------------------------------
  // Real-Time Poll Methods
  // -------------------------------------------------------------

  public async createPoll(params: {
    conversationId: string;
    question: string;
    options: string[];
    allowsMultiple?: boolean;
    clientMessageId?: string;
  }) {
    const clientMessageId = params.clientMessageId || `poll_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const res = await fetch(`${API_BASE}/conversations/${params.conversationId}/poll`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        senderId: this.currentUserId,
        clientMessageId,
        question: params.question,
        options: params.options,
        allowsMultiple: params.allowsMultiple
      })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to create poll');
    }
    return await res.json();
  }

  public async votePoll(messageId: string, optionIndex: number) {
    const res = await fetch(`${API_BASE}/messages/${messageId}/poll/vote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: this.currentUserId,
        optionIndex
      })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to vote on poll');
    }
    return await res.json();
  }

  // -------------------------------------------------------------
  // Real-Time Calling Logging & History Methods
  // -------------------------------------------------------------

  public async logCall(callData: {
    id: string;
    conversationId: string;
    recipientId: string;
    callType: 'voice' | 'video';
    status: string;
    durationSeconds?: number;
    startedAt?: number;
    endedAt?: number;
  }) {
    const res = await fetch(`${API_BASE}/calls`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        callerId: this.currentUserId,
        ...callData
      })
    });
    return await res.json();
  }

  public async updateCallStatus(callId: string, status: string, durationSeconds?: number) {
    const res = await fetch(`${API_BASE}/calls/${callId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, durationSeconds })
    });
    return await res.json();
  }

  public async getCallHistory(conversationId?: string) {
    const url = conversationId
      ? `${API_BASE}/calls/history?userId=${this.currentUserId}&conversationId=${conversationId}`
      : `${API_BASE}/calls/history?userId=${this.currentUserId}`;
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    return data.calls || [];
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

  public async blockUser(targetUserId: string, reason?: string, partingMessage?: string) {
    const res = await fetch(`${API_BASE}/users/${targetUserId}/block`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        blockerId: this.currentUserId,
        reason,
        partingMessage
      })
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

  public async archiveConversation(conversationId: string, isArchived?: boolean) {
    const res = await fetch(`${API_BASE}/conversations/${conversationId}/archive`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: this.currentUserId, isArchived })
    });
    return await res.json();
  }

  public async muteConversation(conversationId: string, isMuted?: boolean, durationHours: number = 8) {
    const res = await fetch(`${API_BASE}/conversations/${conversationId}/mute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: this.currentUserId, isMuted, durationHours })
    });
    return await res.json();
  }

  public async setAutoDeleteTtl(conversationId: string, ttlHours: number = 24) {
    const res = await fetch(`${API_BASE}/conversations/${conversationId}/auto-delete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ttlHours })
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
