export type QuoteCategoryKey =
  | 'love_romance'
  | 'relationships'
  | 'friendship'
  | 'emotional_intelligence'
  | 'self_respect_boundaries'
  | 'psychology_human_behavior'
  | 'motivation_discipline'
  | 'loneliness_healing'
  | 'confidence_identity'
  | 'life_philosophy'
  | 'happiness_gratitude'
  | 'communication'
  | 'marriage_commitment'
  | 'heartbreak_moving_on'
  | 'personal_growth'
  | 'humor_playful';

export interface CategoryMetadata {
  key: QuoteCategoryKey;
  label: string;
  description: string;
  icon: string;
  accentColor: string;
  tags: string[];
  quoteCount?: number;
}

export const QUOTE_CATEGORIES: Record<QuoteCategoryKey, CategoryMetadata> = {
  love_romance: {
    key: 'love_romance',
    label: 'Love & Romance',
    description: 'Passion, vulnerability, and the sacred chemistry between two souls.',
    icon: 'Heart',
    accentColor: '#EC4899',
    tags: ['love', 'romance', 'devotion', 'passion', 'intimacy']
  },
  relationships: {
    key: 'relationships',
    label: 'Relationships',
    description: 'Relational dynamics, mutual reciprocity, and understanding partner worlds.',
    icon: 'Users',
    accentColor: '#8B5CF6',
    tags: ['relationships', 'partnership', 'connection', 'harmony', 'understanding']
  },
  friendship: {
    key: 'friendship',
    label: 'Friendship',
    description: 'Chosen family, unconditional loyalty, shared laughter, and quiet trust.',
    icon: 'UserCheck',
    accentColor: '#3B82F6',
    tags: ['friendship', 'loyalty', 'companionship', 'trust', 'camaraderie']
  },
  emotional_intelligence: {
    key: 'emotional_intelligence',
    label: 'Emotional Intelligence',
    description: 'Attunement to feelings, empathy, self-awareness, and emotional regulation.',
    icon: 'Brain',
    accentColor: '#06B6D4',
    tags: ['empathy', 'awareness', 'regulation', 'attunement', 'mindfulness']
  },
  self_respect_boundaries: {
    key: 'self_respect_boundaries',
    label: 'Self-Respect & Boundaries',
    description: 'Protecting your peace, honoring your limits, and sovereign dignity.',
    icon: 'Shield',
    accentColor: '#10B981',
    tags: ['boundaries', 'self-respect', 'dignity', 'integrity', 'peace']
  },
  psychology_human_behavior: {
    key: 'psychology_human_behavior',
    label: 'Psychology & Human Behaviour',
    description: 'The hidden architecture of human motives, cognitive depth, and quirks.',
    icon: 'Compass',
    accentColor: '#6366F1',
    tags: ['psychology', 'behavior', 'cognition', 'human-nature', 'depth']
  },
  motivation_discipline: {
    key: 'motivation_discipline',
    label: 'Motivation & Discipline',
    description: 'Unyielding momentum, daily focus, resilience, and quiet perseverance.',
    icon: 'Flame',
    accentColor: '#F59E0B',
    tags: ['discipline', 'motivation', 'focus', 'resilience', 'perseverance']
  },
  loneliness_healing: {
    key: 'loneliness_healing',
    label: 'Loneliness & Healing',
    description: 'Solitude transformed into sanctuary, gentle recovery, and self-restoration.',
    icon: 'Moon',
    accentColor: '#64748B',
    tags: ['healing', 'solitude', 'comfort', 'recovery', 'sanctuary']
  },
  confidence_identity: {
    key: 'confidence_identity',
    label: 'Confidence & Identity',
    description: 'Embracing your authentic individuality without apologizing for your essence.',
    icon: 'Sparkles',
    accentColor: '#EAB308',
    tags: ['confidence', 'identity', 'authenticity', 'courage', 'individuality']
  },
  life_philosophy: {
    key: 'life_philosophy',
    label: 'Life Philosophy',
    description: 'Timeless wisdom on the human condition, mortality, meaning, and truth.',
    icon: 'BookOpen',
    accentColor: '#A855F7',
    tags: ['philosophy', 'wisdom', 'stoicism', 'meaning', 'truth']
  },
  happiness_gratitude: {
    key: 'happiness_gratitude',
    label: 'Happiness & Gratitude',
    description: 'Finding tranquility in simple moments, contentment, and radiant appreciation.',
    icon: 'Sun',
    accentColor: '#F97316',
    tags: ['gratitude', 'happiness', 'peace', 'joy', 'contentment']
  },
  communication: {
    key: 'communication',
    label: 'Communication',
    description: 'The art of honest expression, active listening, and resolving silence.',
    icon: 'MessageCircle',
    accentColor: '#14B8A6',
    tags: ['communication', 'listening', 'expression', 'dialogue', 'clarity']
  },
  marriage_commitment: {
    key: 'marriage_commitment',
    label: 'Marriage & Commitment',
    description: 'Long-term devotion, enduring promises, and weather-tested dedication.',
    icon: 'Key',
    accentColor: '#D946EF',
    tags: ['commitment', 'marriage', 'devotion', 'loyalty', 'lifelong']
  },
  heartbreak_moving_on: {
    key: 'heartbreak_moving_on',
    label: 'Heartbreak & Moving On',
    description: 'Letting go gracefully, surviving emotional loss, and rising anew.',
    icon: 'Feather',
    accentColor: '#F43F5E',
    tags: ['heartbreak', 'letting-go', 'moving-on', 'closure', 'resilience']
  },
  personal_growth: {
    key: 'personal_growth',
    label: 'Personal Growth',
    description: 'Continual evolution, lifelong learning, and expanding conscious horizons.',
    icon: 'TrendingUp',
    accentColor: '#22C55E',
    tags: ['growth', 'evolution', 'learning', 'self-discovery', 'transformation']
  },
  humor_playful: {
    key: 'humor_playful',
    label: 'Humour & Playful Quotes',
    description: 'Witty ironies, charming banter, lighthearted cynicism, and easy smiles.',
    icon: 'Smile',
    accentColor: '#E11D48',
    tags: ['humor', 'wit', 'playful', 'banter', 'irony']
  }
};

export interface Quote {
  id: string;
  text: string;
  author: string;
  category: QuoteCategoryKey;
  tags: string[];
  language: string;
  provider: string;
  sourceUrl?: string;
  attribution: string;
  license?: string;
  importedAt: number;
  isVerified: boolean;
  isModerated: boolean;
  isFeatured?: boolean;
  reportCount?: number;
  likesCount?: number;
  savesCount?: number;
  createdAt: number;
  isLiked?: boolean;
  isSaved?: boolean;
}

export interface QuoteUserPreferences {
  userId: string;
  includedCategories: QuoteCategoryKey[];
  excludedCategories: QuoteCategoryKey[];
  lengthPreference: 'any' | 'short' | 'long';
  authorType: 'any' | 'famous' | 'anonymous';
  style: 'any' | 'serious' | 'romantic' | 'philosophical' | 'funny' | 'motivational';
  language: string;
  mode: 'random' | 'personalized';
  updatedAt: number;
}

export interface DailyQuotePayload {
  date: string;
  featuredQuote: Quote;
  reflectionQuestion: string;
  relationshipQuote?: Quote;
}

export interface AdminQuoteProvider {
  providerId: string;
  name: string;
  baseUrl: string;
  isEnabled: boolean;
  rateLimitRpm: number;
  lastFetchedAt?: number;
  healthStatus: 'healthy' | 'degraded' | 'offline';
  totalFetched: number;
  failureCount: number;
  updatedAt: number;
}
