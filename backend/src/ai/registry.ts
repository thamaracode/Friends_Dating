import { AIProviderAdapter, AIProviderId, AIModelInfo } from './types';
import { OpenAIAdapter } from './adapters/openai';
import { GeminiAdapter } from './adapters/gemini';
import { AnthropicAdapter } from './adapters/anthropic';
import { MistralAdapter } from './adapters/mistral';
import { OpenRouterAdapter } from './adapters/openrouter';
import { OllamaAdapter } from './adapters/ollama';
import { CustomOpenAIAdapter } from './adapters/custom';

export class AIProviderRegistry {
  private static adapters: Map<AIProviderId, AIProviderAdapter> = new Map();

  static {
    this.register(new OpenAIAdapter());
    this.register(new GeminiAdapter());
    this.register(new AnthropicAdapter());
    this.register(new MistralAdapter());
    this.register(new OpenRouterAdapter());
    this.register(new OllamaAdapter());
    this.register(new CustomOpenAIAdapter());
  }

  public static register(adapter: AIProviderAdapter): void {
    this.adapters.set(adapter.providerId, adapter);
  }

  public static get(providerId: AIProviderId): AIProviderAdapter | undefined {
    return this.adapters.get(providerId);
  }

  public static getAll(): AIProviderAdapter[] {
    return Array.from(this.adapters.values());
  }

  public static getSupportedProviderList(): Array<{ id: AIProviderId; name: string; defaultEndpoint?: string }> {
    return this.getAll().map(a => ({
      id: a.providerId,
      name: a.displayName,
      defaultEndpoint: a.defaultEndpoint
    }));
  }
}

export class AIModelRegistry {
  public static getAllModels(): AIModelInfo[] {
    const models: AIModelInfo[] = [];
    for (const adapter of AIProviderRegistry.getAll()) {
      if ('getKnownModels' in adapter && typeof (adapter as any).getKnownModels === 'function') {
        models.push(...(adapter as any).getKnownModels());
      }
    }
    return models;
  }

  public static getModel(providerId: AIProviderId, modelId: string): AIModelInfo | undefined {
    const all = this.getAllModels();
    return all.find(m => m.provider === providerId && m.id === modelId);
  }
}
