// Soulverse Custom AI Helper (ChatGPT & Gemini BYOK Architecture)

export type AiProvider = 'openai' | 'gemini';

export type AiPersona = 'wingman' | 'empath' | 'deep_soul' | 'minimalist';

export interface CustomAiConfig {
  enabled: boolean;
  provider: AiProvider;
  apiKey: string;
  model: string;
  persona: AiPersona;
  autoAnalyzeMomentum: boolean;
  toneCheckBeforeSend: boolean;
}

export interface ChatAnalysisResult {
  chemistryScore: number; // 0 - 100
  vibe: string;
  sentiment: string;
  momentum: 'surging' | 'steady' | 'needs_spark' | 'unbalanced';
  subtext: string;
  greenFlags: string[];
  recommendedReplies: Array<{
    type: 'playful' | 'deep' | 'casual';
    text: string;
    explanation?: string;
  }>;
  suggestedTopics: string[];
}

export interface DraftPolishResult {
  original: string;
  toneAssessment: string;
  suggestions: Array<{
    style: string;
    text: string;
  }>;
}

export const DEFAULT_AI_CONFIG: CustomAiConfig = {
  enabled: true,
  provider: 'gemini',
  apiKey: '',
  model: 'gemini-1.5-flash',
  persona: 'empath',
  autoAnalyzeMomentum: true,
  toneCheckBeforeSend: false
};

export const AI_STORAGE_KEY = 'soulverse_custom_ai_config_v1';

export function loadCustomAiConfig(): CustomAiConfig {
  try {
    const raw = localStorage.getItem(AI_STORAGE_KEY);
    if (raw) {
      return { ...DEFAULT_AI_CONFIG, ...JSON.parse(raw) };
    }
  } catch {
    // noop
  }
  return DEFAULT_AI_CONFIG;
}

export function saveCustomAiConfig(config: CustomAiConfig): void {
  try {
    localStorage.setItem(AI_STORAGE_KEY, JSON.stringify(config));
  } catch {
    // noop
  }
}
