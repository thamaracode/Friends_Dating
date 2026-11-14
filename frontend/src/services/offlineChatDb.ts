import Dexie, { type Table } from 'dexie';

export interface LocalConversation {
  id: string;
  type: string;
  title: string;
  description?: string;
  avatarUrl?: string;
  createdBy?: string;
  createdAt: number;
  updatedAt: number;
  lastMessageId?: string;
  lastMessageText?: string;
  lastMessageSenderId?: string;
  lastMessageTimestamp?: number;
  participantsCount?: number;
  isPinned?: boolean;
  isArchived?: boolean;
  isMuted?: boolean;
  unreadCount?: number;
  draftText?: string;
  partner?: {
    id: string;
    name: string;
    avatarUrl: string;
    isVerified: boolean;
    lastSeenAt?: number;
  };
}

export interface LocalMessage {
  id: string;
  clientMessageId: string;
  conversationId: string;
  senderId: string;
  senderName?: string;
  senderAvatar?: string;
  sequenceNumber: number;
  type: string;
  text?: string;
  mediaUrl?: string;
  voiceDurationSeconds?: number;
  voiceWaveform?: number[];
  attachments?: any[];
  replyToMessageId?: string;
  replyTo?: {
    id: string;
    senderName: string;
    textSnippet: string;
  };
  threadId?: string;
  isEdited?: boolean;
  isPinned?: boolean;
  isDeleted?: boolean;
  deletedForMe?: boolean;
  reactions?: any[];
  status: 'queued' | 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
  createdAt: number;
  timestamp: string;
  isOutgoing: boolean;
  pollData?: {
    question: string;
    options: Array<{ id: number; text: string; voteCount: number; voterIds: string[] }>;
    allowsMultiple?: boolean;
    totalVotes: number;
    closed?: boolean;
  };
}

export interface OutboxMessage {
  clientMessageId: string;
  conversationId: string;
  senderId: string;
  type: string;
  text?: string;
  mediaUrl?: string;
  voiceDuration?: number;
  voiceWaveform?: number[];
  attachments?: any[];
  replyToMessageId?: string;
  pollData?: any;
  status: 'queued' | 'sending' | 'failed' | 'sent';
  retryCount: number;
  createdAt: number;
  error?: string;
}

export interface LocalDraft {
  conversationId: string;
  text: string;
  updatedAt: number;
}

export interface LocalChatSetting {
  key: string;
  value: any;
}

export class SoulverseOfflineDatabase extends Dexie {
  conversations!: Table<LocalConversation, string>;
  messages!: Table<LocalMessage, string>;
  outbox!: Table<OutboxMessage, string>;
  drafts!: Table<LocalDraft, string>;
  settings!: Table<LocalChatSetting, string>;

  constructor() {
    super('soulverse_chat_db');

    this.version(1).stores({
      conversations: 'id, type, updatedAt, isPinned, isArchived, unreadCount',
      messages: 'id, clientMessageId, conversationId, sequenceNumber, createdAt, status, [conversationId+sequenceNumber]',
      outbox: 'clientMessageId, conversationId, status, createdAt',
      drafts: 'conversationId, updatedAt',
      settings: 'key'
    });
  }

  // --- Conversations Helpers ---
  public async bulkSaveConversations(convs: LocalConversation[]) {
    await this.conversations.bulkPut(convs);
  }

  public async getCachedConversations(): Promise<LocalConversation[]> {
    return await this.conversations
      .orderBy('updatedAt')
      .reverse()
      .toArray();
  }

  // --- Messages Helpers ---
  public async bulkSaveMessages(msgs: LocalMessage[]) {
    await this.messages.bulkPut(msgs);
  }

  public async saveMessage(msg: LocalMessage) {
    await this.messages.put(msg);
  }

  public async getCachedMessages(conversationId: string, limit: number = 50): Promise<LocalMessage[]> {
    const list = await this.messages
      .where('conversationId')
      .equals(conversationId)
      .sortBy('sequenceNumber');
    return list.slice(-limit);
  }

  public async getLatestSequenceNumber(conversationId: string): Promise<number> {
    const latest = await this.messages
      .where('conversationId')
      .equals(conversationId)
      .last();
    return latest ? latest.sequenceNumber : 0;
  }

  public async reconcileMessageAck(clientMessageId: string, serverId: string, sequenceNumber: number, timestamp: number) {
    const existing = await this.messages.where('clientMessageId').equals(clientMessageId).first();
    if (existing) {
      await this.messages.delete(existing.id);
      await this.messages.put({
        ...existing,
        id: serverId,
        sequenceNumber,
        status: 'sent',
        createdAt: timestamp,
        timestamp: new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
    }
    // Remove from outbox
    await this.outbox.delete(clientMessageId);
  }

  // --- Outbox Helpers ---
  public async queueOutboxMessage(msg: Omit<OutboxMessage, 'status' | 'retryCount' | 'createdAt'>): Promise<OutboxMessage> {
    const outboxItem: OutboxMessage = {
      ...msg,
      status: 'queued',
      retryCount: 0,
      createdAt: Date.now()
    };
    await this.outbox.put(outboxItem);
    return outboxItem;
  }

  public async getPendingOutbox(): Promise<OutboxMessage[]> {
    return await this.outbox
      .where('status')
      .anyOf(['queued', 'failed'])
      .sortBy('createdAt');
  }

  public async updateOutboxStatus(clientMessageId: string, status: 'queued' | 'sending' | 'failed' | 'sent', error?: string) {
    const item = await this.outbox.get(clientMessageId);
    if (item) {
      item.status = status;
      if (status === 'failed') item.retryCount += 1;
      if (error) item.error = error;
      await this.outbox.put(item);
    }
  }

  public async removeOutboxMessage(clientMessageId: string) {
    await this.outbox.delete(clientMessageId);
  }

  // --- Drafts Helpers ---
  public async saveDraft(conversationId: string, text: string) {
    if (!text.trim()) {
      await this.drafts.delete(conversationId);
    } else {
      await this.drafts.put({
        conversationId,
        text,
        updatedAt: Date.now()
      });
    }
  }

  public async getDraft(conversationId: string): Promise<string> {
    const draft = await this.drafts.get(conversationId);
    return draft ? draft.text : '';
  }

  // --- Settings Helpers ---
  public async setSetting(key: string, value: any) {
    await this.settings.put({ key, value });
  }

  public async getSetting<T = any>(key: string): Promise<T | undefined> {
    const item = await this.settings.get(key);
    return item ? (item.value as T) : undefined;
  }
}

export const offlineChatDb = new SoulverseOfflineDatabase();
