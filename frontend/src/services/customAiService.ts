import {
  CustomAiConfig,
  ChatAnalysisResult,
  DraftPolishResult,
  loadCustomAiConfig,
  saveCustomAiConfig,
  DEFAULT_AI_CONFIG,
  AiProvider
} from '../types/customAi';

import { API_BASE } from './apiConfig';

export class CustomAiService {
  private static config: CustomAiConfig = loadCustomAiConfig();
  private static listeners: Array<() => void> = [];

  public static getConfig(): CustomAiConfig {
    return { ...this.config };
  }

  public static updateConfig(patch: Partial<CustomAiConfig>): void {
    this.config = { ...this.config, ...patch };
    saveCustomAiConfig(this.config);
    this.notifyListeners();
  }

  public static subscribe(fn: () => void): () => void {
    this.listeners.push(fn);
    return () => {
      this.listeners = this.listeners.filter(l => l !== fn);
    };
  }

  private static notifyListeners(): void {
    this.listeners.forEach(fn => {
      try {
        fn();
      } catch (err) {
        console.error('AI listener failed', err);
      }
    });
  }

  // 1. Test live connection to OpenAI or Gemini
  public static async testConnection(
    provider: AiProvider,
    apiKey: string
  ): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const res = await fetch(`${API_BASE}/ai/custom-helper`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider,
          apiKey,
          action: 'test_connection'
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || 'Connection failed' };
      }
      return { success: true, message: data.message };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }

  // 2. Analyze entire conversation thread
  public static async analyzeChat(
    conversationHistory: Array<{ sender: string; text: string; timestamp?: number }>,
    partnerProfile: { name: string; bio?: string; interests?: string[]; lifestyle?: any; anthem?: any }
  ): Promise<{ success: boolean; provider?: string; result?: ChatAnalysisResult; error?: string }> {
    try {
      const { provider, apiKey, model, persona } = this.config;
      const res = await fetch(`${API_BASE}/ai/custom-helper`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider,
          apiKey,
          model,
          persona,
          action: 'analyze_chat',
          conversationHistory,
          partnerProfile
        })
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Chat analysis failed' };
      }
      return { success: true, provider: data.provider, result: data.result };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }

  // 3. Polish user's drafted message before sending
  public static async polishDraft(
    draftText: string,
    partnerProfile: { name: string; bio?: string; interests?: string[]; lifestyle?: any }
  ): Promise<{ success: boolean; provider?: string; result?: DraftPolishResult; error?: string }> {
    try {
      const { provider, apiKey, model, persona } = this.config;
      const res = await fetch(`${API_BASE}/ai/custom-helper`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider,
          apiKey,
          model,
          persona,
          action: 'polish_draft',
          draftText,
          partnerProfile
        })
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Tone check failed' };
      }
      return { success: true, provider: data.provider, result: data.result };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }

  // 4. Generate profile-aware icebreakers
  public static async generateIcebreakers(
    partnerProfile: { name: string; bio?: string; interests?: string[]; lifestyle?: any }
  ): Promise<{
    success: boolean;
    provider?: string;
    result?: { openers: Array<{ style: string; text: string }> };
    error?: string;
  }> {
    try {
      const { provider, apiKey, model, persona } = this.config;
      const res = await fetch(`${API_BASE}/ai/custom-helper`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider,
          apiKey,
          model,
          persona,
          action: 'generate_icebreakers',
          partnerProfile
        })
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Icebreaker generation failed' };
      }
      return { success: true, provider: data.provider, result: data.result };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }
}
