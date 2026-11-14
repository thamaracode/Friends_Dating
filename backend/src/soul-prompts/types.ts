export type SoulPromptCategory = 
  | 'emotional_safety' 
  | 'vulnerability' 
  | 'boundaries' 
  | 'intimacy_growth' 
  | 'unspoken_truths' 
  | 'friendship';

export type ResponseVisibility = 
  | 'private' 
  | 'profile_pinned' 
  | 'community_anonymous' 
  | 'community_public';

export type MoodTag = 
  | 'reflective' 
  | 'hopeful' 
  | 'vulnerable' 
  | 'grounded' 
  | 'healing';

export type ResonanceType = 
  | 'felt_deeply' 
  | 'mind_shifted' 
  | 'inspired';

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
  userResonances: ResonanceType[];
  isOwner: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface CompatibilityInsight {
  targetUserId: string;
  targetName: string;
  targetAvatar: string;
  compatibilityScore: number; // 0 - 100
  sharedDimensions: string[];
  synergyInsights: string[];
  sharedPromptResponsesCount: number;
  recommendedIcebreakers: string[];
}
