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
  lastStatus?: 'online' | 'offline' | 'rate_limited' | 'invalid_key' | 'untested';
}

export interface TaskAIRoute {
  taskKey: AITaskKey;
  connectionId: string;
  modelId: string;
  allowFallback: boolean;
  fallbackConnectionId?: string;
  fallbackModelId?: string;
  updatedAt: number;
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

export interface AIUsageRecord {
  id: string;
  userId: string;
  connectionId?: string;
  provider: AIProviderId;
  model: string;
  taskKey: AITaskKey;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  estimatedCostUsd: number;
  status: 'success' | 'error' | 'rate_limited';
  errorMessage?: string;
  latencyMs: number;
  createdAt: number;
}

export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AIRequestPayload {
  taskKey?: AITaskKey;
  connectionId?: string;
  modelId?: string;
  messages: AIMessage[];
  systemPrompt?: string;
  maxTokens?: number;
  temperature?: number;
  responseFormat?: 'text' | 'json';
  // Context metadata for permission filtering
  contextData?: {
    partnerProfile?: any;
    chatHistory?: Array<{ sender: string; text: string }>;
    vaultNotes?: string;
    journalEntry?: string;
  };
}

export interface AIGenerationResponse {
  text: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  estimatedCostUsd: number;
  model: string;
  provider: AIProviderId;
  latencyMs: number;
}

export interface AIStreamChunk {
  text: string;
  done: boolean;
  usage?: {
    inputTokens: number;
    outputTokens: number;
    estimatedCostUsd: number;
  };
}

export interface AIProviderAdapter {
  providerId: AIProviderId;
  displayName: string;
  defaultEndpoint?: string;
  validateConnection(apiKey: string, customEndpoint?: string): Promise<{ success: boolean; error?: string; latencyMs: number }>;
  discoverModels(apiKey: string, customEndpoint?: string): Promise<AIModelInfo[]>;
  generateText(
    apiKey: string,
    model: string,
    messages: AIMessage[],
    options?: {
      temperature?: number;
      maxTokens?: number;
      customEndpoint?: string;
      jsonMode?: boolean;
    }
  ): Promise<AIGenerationResponse>;
  generateStream(
    apiKey: string,
    model: string,
    messages: AIMessage[],
    onChunk: (chunk: AIStreamChunk) => void,
    options?: {
      temperature?: number;
      maxTokens?: number;
      customEndpoint?: string;
      jsonMode?: boolean;
    }
  ): Promise<AIGenerationResponse>;
}
