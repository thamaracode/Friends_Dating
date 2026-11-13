/**
 * The Hidden Emotional Layer & Question Universe Types
 * Architecture: Relational Atmosphere & Emotional Discovery Engine
 */

export type ContentMood = 
  | 'romantic'      // Love, attraction, affection
  | 'nostalgic'     // Memories, childhood, old friendships
  | 'vulnerable'    // Feeling understood, acceptance
  | 'curious'       // Human behaviour, psychology
  | 'hopeful'       // Dreams, future, personal growth
  | 'playful'       // Flirting, teasing, humour
  | 'philosophical' // Meaning, existence, identity
  | 'comforting'    // Reassurance, kindness, peace
  | 'mysterious'    // Hidden thoughts, unexpected questions
  | 'ambitious';    // Purpose, discipline, achievement

export type ContentCategory = 
  | 'love_psychology'        // Love and romantic psychology
  | 'rarely_admitted'        // The things people rarely admit
  | 'womens_perspectives'    // Women's perspectives & emotional experiences
  | 'mens_perspectives'      // Men's perspectives & emotional experiences
  | 'friendship_belonging'   // Friendship and belonging
  | 'self_discovery';        // Self-discovery and inner life

export type TargetPage = 
  | 'discover' 
  | 'profile' 
  | 'inbox' 
  | 'connect' 
  | 'create' 
  | 'unspoken' 
  | 'midnight';

export interface EmotionalContentItem {
  id: string;
  contentType: 'question' | 'thought' | 'letter' | 'prompt' | 'observation';
  category: ContentCategory;
  mood: ContentMood;
  targetPage: TargetPage;
  content: string;
  subtext?: string;
  author?: string;
  tags: string[];
}

export interface UnopenedLetter {
  id: string;
  previewPrompt: string;
  title: string;
  message: string;
  closing: string;
  mood: ContentMood;
  opened: boolean;
  discoveredAt?: string;
}

export interface TwoPersonQuestion {
  id: string;
  question: string;
  category: ContentCategory;
  userAnswer?: string;
  partnerAnswer?: string;
  partnerName: string;
  partnerAvatar?: string;
  userAnswered: boolean;
  partnerAnswered: boolean;
  isRevealed: boolean;
  createdAt: string;
}

export interface UnsentWord {
  id: string;
  recipientName: string;
  content: string;
  mood: ContentMood;
  createdAt: string;
  updatedAt?: string;
}

export interface TheMirrorObservation {
  id: string;
  theme: string;
  observation: string;
  evidenceBasedOn: string;
  reflectedAt: string;
}
