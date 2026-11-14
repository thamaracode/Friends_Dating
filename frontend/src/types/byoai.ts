export type AIProviderId = 
  | 'openai' 
  | 'gemini' 
  | 'anthropic' 
  | 'mistral' 
  | 'openrouter' 
  | 'ollama' 
  | 'custom_openai';

export type AITaskKey = 
  | 'general_assistant'
  | 'chat_analysis'
  | 'relationship_assistant'
  | 'friendship_assistant'
  | 'dating_assistant'
  | 'personal_journal'
  | 'personality_exploration'
  | 'profile_generation'
  | 'writing_assistance'
  | 'creative_assistant'
  | 'daily_recommendations';

export interface AIModelCapability {
  streaming: boolean;
  vision: boolean;
  functionCalling: boolean;
  jsonMode: boolean;
  contextWindow: number;
}

export interface AIModelInfo {
  id: string;
  name: string;
  provider: AIProviderId;
  description: string;
  capabilities: AIModelCapability;
  costPer1kInputUsd: number;
  costPer1kOutputUsd: number;
  isRecommended?: boolean;
}

export interface AIProviderInfo {
  id: AIProviderId;
  name: string;
  defaultEndpoint?: string;
  isGloballyEnabled: boolean;
  byokAllowed: boolean;
  rateLimitRpm: number;
}

export interface UserAIConnection {
  id: string;
  userId: string;
  provider: AIProviderId;
  name: string;
  keyMask: string;
  customEndpoint?: string;
  defaultModel: string;
  isEnabled: boolean;
  createdAt: number;
  updatedAt: number;
  lastTestedAt?: number;
  lastStatus: 'online' | 'offline' | 'rate_limited' | 'invalid_key' | 'untested';
}

export interface TaskAIRoute {
  taskKey: AITaskKey;
  connectionId: string;
  modelId: string;
  allowFallback: boolean;
  fallbackConnectionId?: string;
  fallbackModelId?: string;
  updatedAt?: number;
}

export interface AIContextPermissions {
  allowProfileData: boolean;
  allowIdentityPersonas: boolean;
  allowChatHistory: boolean;
  maxChatHistoryMessages: number;
  allowRelationshipVault: boolean;
  allowJournals: boolean;
  allowPreferences: boolean;
  allowExternalSharing: boolean;
  persistentMemory: boolean;
  updatedAt: number;
}

export interface AISpendingLimits {
  dailyBudgetUsd: number;
  monthlyBudgetUsd: number;
  warningThresholdPct: number;
  autoSuspendOnLimit: boolean;
  isSuspended: boolean;
}

export interface AIUsageSummary {
  dailyCost: number;
  monthlyCost: number;
  allTimeCost: number;
  totalTokens: number;
  totalRequests: number;
  dailyRequests: number;
  monthlyRequests: number;
}

export interface AIUsageRecord {
  id: string;
  provider: AIProviderId;
  model: string;
  taskKey: AITaskKey;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  estimatedCostUsd: number;
  status: 'success' | 'error' | 'rate_limited';
  latencyMs: number;
  createdAt: number;
  errorMessage?: string;
}

export interface AIAssistantConversation {
  id: string;
  userId: string;
  taskContext: string;
  contextEntityId?: string | null;
  title: string;
  customInstructions?: string;
  createdAt: number;
  updatedAt: number;
}

export interface AIAssistantMessage {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  provider?: string;
  model?: string;
  tokensUsed?: number;
  createdAt: number;
}

export interface TaskMetadata {
  key: AITaskKey;
  title: string;
  category: 'Conversation' | 'Sanctuary & Mind' | 'Expression' | 'Platform Discovery';
  description: string;
  defaultModelRecommendation: string;
}

export const TASK_DEFINITIONS: Record<AITaskKey, TaskMetadata> = {
  general_assistant: {
    key: 'general_assistant',
    title: 'General Assistant',
    category: 'Conversation',
    description: 'Universal in-app assistant for queries, orientation, and general guidance.',
    defaultModelRecommendation: 'gpt-4o-mini'
  },
  chat_analysis: {
    key: 'chat_analysis',
    title: 'Live Chat Chemistry & Vibe Analysis',
    category: 'Conversation',
    description: 'Evaluates mutual conversational vibe, momentum, subtext, and subtle green flags.',
    defaultModelRecommendation: 'claude-3-5-sonnet-20241022'
  },
  dating_assistant: {
    key: 'dating_assistant',
    title: 'Dating Coach & Flirtation Guidance',
    category: 'Conversation',
    description: 'Charming, authentic dating advice, playful openers, and conversational steering.',
    defaultModelRecommendation: 'gpt-4o'
  },
  friendship_assistant: {
    key: 'friendship_assistant',
    title: 'Friendship & Common Ground Weaver',
    category: 'Conversation',
    description: 'Bridges mutual passions, shared music tastes, and low-pressure hangout suggestions.',
    defaultModelRecommendation: 'gemini-1.5-flash'
  },
  relationship_assistant: {
    key: 'relationship_assistant',
    title: 'Relationship Vault & Emotional Memory',
    category: 'Sanctuary & Mind',
    description: 'Synthesizes relational promises, important dates, and deep emotional dynamics.',
    defaultModelRecommendation: 'claude-3-5-sonnet-20241022'
  },
  personal_journal: {
    key: 'personal_journal',
    title: 'Sanctuary Midnight Reflections',
    category: 'Sanctuary & Mind',
    description: 'Introspective, non-judgmental accompaniment for journaling and Unsent Words.',
    defaultModelRecommendation: 'claude-3-5-sonnet-20241022'
  },
  personality_exploration: {
    key: 'personality_exploration',
    title: 'Soul Archetypes & Quiz Deep Dives',
    category: 'Sanctuary & Mind',
    description: 'Decodes personality dimensions, Enneagram archetypes, and subconscious desires.',
    defaultModelRecommendation: 'mistral-large-latest'
  },
  profile_generation: {
    key: 'profile_generation',
    title: 'Persona & Cinematic Life Bio Writer',
    category: 'Expression',
    description: 'Generates evocative world bios, taglines, and cinematic life introductions.',
    defaultModelRecommendation: 'gemini-1.5-pro'
  },
  writing_assistance: {
    key: 'writing_assistance',
    title: 'Message Polisher & Tone Shifter',
    category: 'Expression',
    description: 'Polishes rough drafts into warm, confident, or playful messages before sending.',
    defaultModelRecommendation: 'gpt-4o-mini'
  },
  creative_assistant: {
    key: 'creative_assistant',
    title: 'Creative Scenarios & Story Worlds',
    category: 'Expression',
    description: 'Assists in worldbuilding, fiction alter-egos, and narrative scenarios.',
    defaultModelRecommendation: 'mistral-large-latest'
  },
  daily_recommendations: {
    key: 'daily_recommendations',
    title: 'Curated Encounters & Matches',
    category: 'Platform Discovery',
    description: 'Deep affinity ranking and personalized daily match synergy summaries.',
    defaultModelRecommendation: 'gemini-1.5-flash'
  }
};
