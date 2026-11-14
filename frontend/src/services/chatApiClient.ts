import { API_BASE_V1 as API_BASE, WS_BASE } from './apiConfig';
import { offlineChatDb } from './offlineChatDb';
import { webrtcCallService } from './webrtcCallService';

export class ChatApiClient {
  private ws: WebSocket | null = null;
  private currentUserId: string = 'usr_me';
  private eventListeners: Map<string, Set<(data: any) => void>> = new Map();
  private isDrainingOutbox: boolean = false;

  constructor(userId: string = 'usr_me') {
    this.currentUserId = userId;
    this.initWebSocket();

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
    this.currentUserId = userId;
    if (this.ws) {
      this.ws.close();
      this.initWebSocket();
    }
  }

  private initWebSocket() {
    try {
      this.ws = new WebSocket(`${WS_BASE}?userId=${this.currentUserId}`);

      this.ws.onopen = () => {
        this.triggerEvent('ws.open', { userId: this.currentUserId });
        this.drainOutbox();
      };

      this.ws.onmessage = (event) => {
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

      this.ws.onclose = () => {
        this.triggerEvent('ws.close', { userId: this.currentUserId });
        setTimeout(() => this.initWebSocket(), 3000);
      };

      this.ws.onerror = (err) => {
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
