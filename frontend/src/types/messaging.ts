export type MessageType = 
  | 'text'
  | 'photo'
  | 'video'
  | 'voice'
  | 'file'
  | 'game_event'
  | 'dice_event'
  | 'slot_event'
  | 'coin_event'
  | 'sticker'
  | 'custom_emoji'
  | 'gift_event'
  | 'system'
  | 'poll';

export interface PollOption {
  id: number;
  text: string;
  voteCount: number;
  voterIds: string[];
}

export interface PollData {
  question: string;
  options: PollOption[];
  allowsMultiple?: boolean;
  totalVotes: number;
  closed?: boolean;
  userVotedOptionIds?: number[];
}

export interface MessageReaction {
  emoji: string;
  count: number;
  userReacted: boolean;
}

export interface MessageReplyPreview {
  messageId: string;
  senderName: string;
  textSnippet: string;
}

export interface ChatMessage {
  id: string;
  clientMessageId: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  type: MessageType;
  text: string;
  mediaUrl?: string;
  voiceDurationSeconds?: number;
  voiceWaveform?: number[]; // normalized 0-1 amplitudes
  timestamp: string;
  createdAt: number;
  isOutgoing: boolean;
  status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
  isEdited?: boolean;
  replyTo?: MessageReplyPreview;
  reactions?: MessageReaction[];
  isPinned?: boolean;
  scheduledFor?: string;
  gameData?: {
    gameType: string;
    prompt: string;
    response?: string;
    status: string;
  };
  pollData?: PollData;
}

export type ChatFolderType = 'all' | 'matches' | 'friends' | 'unread' | 'personal' | 'archived';

export interface ChatFolder {
  id: ChatFolderType;
  title: string;
  iconName?: string;
  badgeCount?: number;
}

export interface ConversationItem {
  id: string;
  type?: string;
  participantId: string;
  title: string;
  avatar: string;
  isOnline: boolean;
  lastSeenText: string;
  isVerified?: boolean;
  isPinned?: boolean;
  isArchived?: boolean;
  isMuted?: boolean;
  category: 'match' | 'friend' | 'saved_messages' | 'anonymous' | 'group';
  draftText?: string;
  typingUser?: string;
  unreadCount: number;
  partner?: {
    id: string;
    name: string;
    avatarUrl?: string;
    isVerified?: boolean;
    lastSeenAt?: number;
  };
  lastMessage?: {
    text: string;
    senderId: string;
    timestamp: string;
    isOutgoing: boolean;
    status: 'sent' | 'delivered' | 'read';
  };
}
