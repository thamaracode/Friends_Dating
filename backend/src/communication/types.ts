/**
 * Communication & Social Interaction System Types (Master Prompt 08)
 */

export type ConversationType = 'direct' | 'group' | 'channel' | 'saved_messages' | 'watch_party';

export type ParticipantRole = 'owner' | 'admin' | 'member';

export type MessageType = 
  | 'text' 
  | 'photo' 
  | 'video' 
  | 'file' 
  | 'voice' 
  | 'sticker' 
  | 'custom_emoji' 
  | 'game_event' 
  | 'dice_event' 
  | 'slot_event' 
  | 'coin_event' 
  | 'gift_event'
  | 'watch_party_event';

export type DeliveryStatus = 'pending' | 'sent' | 'delivered' | 'read' | 'failed';

export interface MessageAttachment {
  id: string;
  messageId: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  url: string;
  duration?: number;
  thumbnailUrl?: string;
  width?: number;
  height?: number;
  createdAt: number;
}

export interface MessageReaction {
  id: string;
  messageId: string;
  userId: string;
  emoji: string;
  createdAt: number;
}

export interface ReactionSummary {
  emoji: string;
  count: number;
  userReacted: boolean;
  users?: string[];
}

export interface MessageReceipt {
  messageId: string;
  conversationId: string;
  userId: string;
  deliveredAt?: number;
  readAt?: number;
}

export interface ConversationParticipant {
  conversationId: string;
  userId: string;
  role: ParticipantRole;
  joinedAt: number;
  isPinned: boolean;
  isArchived: boolean;
  isMuted: boolean;
  unreadCount: number;
  lastReadSequence: number;
  lastDeliveredSequence: number;
  draftText?: string;
  name?: string;
  avatarUrl?: string;
  isOnline?: boolean;
  lastSeenAt?: number;
}

export interface Conversation {
  id: string;
  type: ConversationType;
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
    avatarUrl?: string;
    isVerified?: boolean;
    isOnline?: boolean;
    lastSeenAt?: number;
  };
}

export interface ChatMessage {
  id: string;
  clientMessageId: string;
  conversationId: string;
  senderId: string;
  senderName?: string;
  senderAvatar?: string;
  sequenceNumber: number;
  type: MessageType;
  text?: string;
  mediaUrl?: string;
  voiceDurationSeconds?: number;
  voiceWaveform?: number[];
  attachments?: MessageAttachment[];
  replyToMessageId?: string;
  replyTo?: {
    id: string;
    senderName: string;
    textSnippet: string;
  };
  threadId?: string;
  threadReplyCount?: number;
  isEdited: boolean;
  isPinned: boolean;
  isDeleted: boolean;
  deletedForMe?: boolean;
  reactions: ReactionSummary[];
  status: DeliveryStatus;
  createdAt: number;
  timestamp: string;
  isOutgoing?: boolean;
}

export interface MessageEditHistory {
  id: string;
  messageId: string;
  editorId: string;
  previousContent: string;
  editedAt: number;
}

export interface UserNotification {
  id: string;
  userId: string;
  type: 'message' | 'mention' | 'reaction' | 'rsvp' | 'game_invite' | 'watch_party' | 'system';
  title: string;
  body: string;
  entityType: 'conversation' | 'message' | 'event' | 'room' | 'game';
  entityId: string;
  isRead: boolean;
  metadata?: Record<string, any>;
  createdAt: number;
}

// -------------------------------------------------------------
// Social Activities & Watch Party
// -------------------------------------------------------------

export interface WatchPartyRoom {
  id: string;
  conversationId?: string;
  title: string;
  hostId: string;
  hostName?: string;
  videoUrl: string;
  videoType: 'youtube' | 'vimeo' | 'hls' | 'mp4';
  playbackPosition: number;
  isPlaying: boolean;
  currentViewersCount: number;
  syncStateJson?: string;
  createdAt: number;
  updatedAt: number;
}

export interface SocialActivityRoom {
  id: string;
  title: string;
  topic: string;
  category: string;
  roomType: 'lounge' | 'coworking' | 'watch_party' | 'discussion';
  hostId: string;
  hostName?: string;
  hostAvatar?: string;
  maxParticipants: number;
  tags: string[];
  isActive: boolean;
  activeSpeaker?: string;
  participantsCount?: number;
  createdAt: number;
}

export interface SocialInvitation {
  id: string;
  inviterId: string;
  inviteeId: string;
  activityType: 'event' | 'watch_party' | 'room' | 'group_chat';
  activityId: string;
  title: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: number;
}

// -------------------------------------------------------------
// Interactive Mini-Games Architecture
// -------------------------------------------------------------

export type GameType = 
  | 'truth_or_dare'
  | 'would_you_rather'
  | 'two_truths_and_lie'
  | 'compatibility_quiz'
  | 'lucky_dice'
  | 'coin_flip'
  | 'collaborative_challenge'
  | 'icebreaker_prompt';

export type GameStatus = 'waiting' | 'active' | 'completed' | 'cancelled';

export interface GameSession {
  id: string;
  conversationId: string;
  gameType: GameType;
  currentTurnUserId: string;
  state: Record<string, any>;
  status: GameStatus;
  createdAt: number;
  updatedAt: number;
}

export interface TruthOrDareItem {
  id: string;
  type: 'truth' | 'dare';
  tier: 'pg' | 'romantic' | 'deep' | 'spicy';
  prompt: string;
  followUp?: string;
}

export interface QuestionGameItem {
  id: string;
  category: 'would_you_rather' | 'two_truths_and_lie' | 'deep_chemistry';
  optionA?: string;
  optionB?: string;
  questionText: string;
  context?: string;
}

export interface DiceRollResult {
  diceCount: number;
  values: number[];
  sum: number;
  actionText?: string;
  timestamp: number;
}

export interface CoinFlipResult {
  outcome: 'heads' | 'tails';
  flipSeed: string;
  timestamp: number;
}

// -------------------------------------------------------------
// Safety, Moderation & Privacy
// -------------------------------------------------------------

export interface UserBlock {
  blockerId: string;
  blockedId: string;
  reason?: string;
  createdAt: number;
}

export interface UserReport {
  id: string;
  reporterId: string;
  reportedUserId: string;
  messageId?: string;
  conversationId?: string;
  reason: 'harassment' | 'spam' | 'hate_speech' | 'inappropriate_media' | 'impersonation' | 'other';
  details?: string;
  status: 'pending' | 'investigating' | 'resolved' | 'dismissed';
  createdAt: number;
}

export interface UserPrivacySettings {
  userId: string;
  onlinePrivacy: 'everyone' | 'contacts_only' | 'nobody';
  lastSeenPrivacy: 'everyone' | 'contacts_only' | 'nobody';
  readReceiptsEnabled: boolean;
  typingIndicatorsEnabled: boolean;
  updatedAt: number;
}

export interface ModerationResult {
  flagged: boolean;
  categories: string[];
  severity: 'low' | 'medium' | 'high' | 'none';
  reason?: string;
}

// -------------------------------------------------------------
// WebSocket Protocol Events
// -------------------------------------------------------------

export interface SocketClientEvent {
  type: 
    | 'auth'
    | 'typing.start'
    | 'typing.stop'
    | 'message.send'
    | 'message.delivered'
    | 'message.read'
    | 'watch_party.sync'
    | 'room.speaker_update'
    | 'room.hand_raise'
    | 'call.signal';
  [key: string]: any;
}

export interface SocketServerEvent {
  type:
    | 'auth.success'
    | 'typing.started'
    | 'typing.stopped'
    | 'chat.message.created'
    | 'chat.message.updated'
    | 'chat.message.deleted'
    | 'chat.reaction.updated'
    | 'chat.receipt.delivered'
    | 'chat.receipt.read'
    | 'presence.updated'
    | 'watch_party.updated'
    | 'room.updated'
    | 'notification.created'
    | 'ack';
  [key: string]: any;
}
