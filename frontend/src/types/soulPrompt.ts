export type SoulPromptCategory = 
  | 'unspoken_truths'
  | 'emotional_safety'
  | 'boundaries_autonomy'
  | 'vulnerable_longings'
  | 'conflict_healing'
  | 'values_future';

export type ResponseVisibility = 
  | 'private'              // Stored strictly in user's personal journal
  | 'profile_pinned'       // Displayed as an anchor value card on profile
  | 'community_anonymous'  // Shared to the public prompt resonance circle anonymously
  | 'community_public';    // Shared to the prompt resonance circle with profile attached

export type MoodTag = 
  | 'reflective'
  | 'vulnerable'
  | 'peaceful'
  | 'hopeful'
  | 'melancholic'
  | 'empowered';

export type ResonanceType = 'felt_deeply' | 'mind_shifted' | 'inspired';

export interface SoulPrompt {
  id: string;
  category: SoulPromptCategory;
  promptQuestion: string;
  philosophicalContext: string;
  dimensionTag: string;
  displayDate?: string;
  createdAt: number;
}

export interface SoulPromptResponse {
  id: string;
  promptId: string;
  userId: string;
  responseText: string;
  visibility: ResponseVisibility;
  authorAlias?: string;
  authorName?: string;
  authorAvatar?: string;
  moodTag: MoodTag;
  reactionFeltDeeply: number;
  reactionMindShifted: number;
  reactionInspired: number;
  userResonances?: ResonanceType[];
  isOwner?: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface CompatibilityInsight {
  targetUserId: string;
  targetName: string;
  targetAvatar: string;
  compatibilityScore: number;
  sharedDimensions: string[];
  synergyInsights: string[];
  sharedPromptResponsesCount: number;
  recommendedIcebreakers: string[];
}

export interface UserJournalEntry {
  response: SoulPromptResponse;
  prompt: SoulPrompt;
}

export interface UserSoulJournal {
  totalEntries: number;
  moodStats: Record<string, number>;
  entries: UserJournalEntry[];
}
