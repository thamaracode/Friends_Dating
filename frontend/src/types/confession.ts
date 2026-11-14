export type ConfessionVisibility = 'anonymous' | 'public' | 'private';

export type ConfessionCategory = 
  | 'love_heartbreak'
  | 'hidden_desires'
  | 'guilt_redemption'
  | 'unsent_feelings'
  | 'secret_identity'
  | 'vulnerability_fear'
  | 'midnight_nostalgia'
  | 'healing_recovery';

export type ConfessionMood = 
  | 'vulnerable'
  | 'relieved'
  | 'heartbroken'
  | 'passionate'
  | 'nostalgic'
  | 'regretful'
  | 'liberated';

export type ConfessionReactionType = 'hugs' | 'relatable' | 'peace' | 'secrets';

export interface ConfessionStory {
  id: string;
  userId: string;
  title: string;
  story: string;
  category: ConfessionCategory;
  mood: ConfessionMood;
  visibility: ConfessionVisibility;
  authorAlias?: string;
  authorName?: string;
  authorAvatar?: string;
  isSensitive?: boolean;
  reactionHugs: number;
  reactionRelatable: number;
  reactionPeace: number;
  reactionSecrets: number;
  userReactions?: ConfessionReactionType[];
  createdAt: number;
  updatedAt: number;
  isOwner?: boolean;
}

export interface CreateConfessionPayload {
  title: string;
  story: string;
  category: ConfessionCategory;
  mood: ConfessionMood;
  visibility: ConfessionVisibility;
  isSensitive?: boolean;
  customAlias?: string;
}
