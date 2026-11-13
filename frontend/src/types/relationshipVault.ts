/**
 * Relationship Vault & Connection Memory Types
 * Architecture: Personal Relationship Management (PRM) & Relational Intelligence
 */

export type RelationshipCategory = 
  | 'romantic'      // Boyfriend, girlfriend, husband, wife, dating, ex-partners
  | 'friendship'    // Best friends, close friends, online friends, old friends
  | 'complicated'   // Situationships, secret relationships, casual, undefined
  | 'group'         // Throuples, polyamorous, friend circles, family
  | 'past'          // Exes, former friends, lost connections, unresolved
  | 'private_vault' // Sensitive records visible only to owner
  | 'custom';       // User-created categories

export type PromiseStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';

export interface RelationshipPromise {
  id: string;
  personId: string;
  title: string;
  description?: string;
  dueDate?: string;
  status: PromiseStatus;
  createdAt: string;
  completedAt?: string;
}

export interface ImportantDateReminder {
  id: string;
  personId: string;
  title: string;
  date: string;
  category: 'birthday' | 'anniversary' | 'exam' | 'interview' | 'medical' | 'trip' | 'special';
  reminderTiming: '1_week_before' | 'day_before' | 'day_of' | 'on_open_profile';
  notes?: string;
}

export interface ConversationMemoryEntry {
  id: string;
  personId: string;
  date: string;
  summary: string;
  topics: string[];
  thingsRemembered: string[];
  followUpCommitment?: string;
  followUpDate?: string;
  emotionalContext?: 'joyful' | 'deep' | 'vulnerable' | 'tense' | 'comforting' | 'awkward';
  questionsForNextTime: string[];
  unfinishedDiscussions: string[];
}

export interface RelationshipTimelineEvent {
  id: string;
  personId: string;
  date: string;
  title: string;
  description: string;
  sentiment: 'positive' | 'neutral' | 'difficult' | 'milestone';
  photoUrl?: string;
  voiceNoteUrl?: string;
  tags?: string[];
}

export interface SubjectiveDynamicsReflection {
  communicationRating: number; // 1-10
  trustReflection: string;
  affectionReflection: string;
  compatibilityReflection: string;
  conflictNotes: string;
  effortBalance: 'balanced' | 'i_give_more' | 'they_give_more' | 'evolving';
  boundariesAgreed: string[];
  connectionSense: string;
  lastReflectedAt: string;
}

export interface RelationshipProfile {
  id: string;
  userId: string;
  name: string;
  nickname?: string;
  avatar: string;
  relationshipCategory: RelationshipCategory;
  customCategoryName?: string;
  statusLabel: string; // e.g. "Girlfriend", "Best Friend", "Situationship"
  currentStatus: 'together' | 'dating' | 'close' | 'paused' | 'drifting' | 'past' | 'complicated';
  firstMet: string;
  firstMetLocation?: string;
  anniversary?: string;
  birthday?: string;
  favouriteFood?: string;
  favouriteColour?: string;
  loveLanguage?: string;
  communicationStyle?: string;
  
  // "Before You Talk" Instant Briefing
  thingsTheyAppreciate: string[];
  upcomingReminders: string[];
  lastConversationSummary: string;
  personalReminders: string[]; // e.g. "Ask about what matters to her. Don't turn it into an interrogation."
  
  // Personal Memory Notes
  thingsTheyLove: string[];
  thingsTheyDislike: string[];
  dreamsAndAmbitions: string[];
  importantFamilyInfo: string[];
  favouriteActivities: string[];
  thingsTheyMentionedOnce: string[];
  giftIdeas: string[];
  placesToVisitTogether: string[];
  thingsNotToDiscuss: string[]; // Sensitive / boundaries
  
  // Trackers
  promises: RelationshipPromise[];
  importantDates: ImportantDateReminder[];
  conversationMemories: ConversationMemoryEntry[];
  timeline: RelationshipTimelineEvent[];
  dynamics?: SubjectiveDynamicsReflection;
  
  // Privacy
  isLocked: boolean;
  isDisappearingNotes: boolean;
  lastUpdated: string;
}
