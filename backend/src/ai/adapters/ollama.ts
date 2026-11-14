import { AIProviderAdapter, AIModelInfo, AIMessage, AIGenerationResponse, AIStreamChunk } from '../types';

export class OllamaAdapter implements AIProviderAdapter {
  public providerId = 'ollama' as const;
  public displayName = 'Ollama (Local Private)';
  public defaultEndpoint = 'http://localhost:11434';

  public async validateConnection(
    _apiKey: string,
    endpoint = this.defaultEndpoint
  ): Promise<{ success: boolean; error?: string; latencyMs: number }> {
    const start = Date.now();
    try {
      const res = await fetch(`${endpoint}/api/tags`, {
        signal: AbortSignal.timeout(6000)
      });
      const latencyMs = Date.now() - start;
      if (!res.ok) {
        return {
          success: false,
          error: `Ollama returned HTTP ${res.status}`,
          latencyMs
        };
      }
      return { success: true, latencyMs };
    } catch (err: any) {
      return {
        success: false,
        error: `Could not reach Ollama at ${endpoint}. Make sure 'ollama serve' is running.`,
        latencyMs: Date.now() - start
      };
    }
  }

  public async discoverModels(_apiKey: string, endpoint = this.defaultEndpoint): Promise<AIModelInfo[]> {
    try {
      const res = await fetch(`${endpoint}/api/tags`, {
        signal: AbortSignal.timeout(6000)
      });
      if (res.ok) {
        const data: any = await res.json();
        const models = (data.models || []).map((m: any) => ({
          id: m.name,
          name: m.name,
          provider: 'ollama' as const,
          description: `Local private model (${(m.size / (1024 * 1024 * 1024)).toFixed(1)} GB)`,
          costPer1kInputUsd: 0,
          costPer1kOutputUsd: 0,
          capabilities: { streaming: true, vision: false, functionCalling: false, jsonMode: true, contextWindow: 8192 }
        }));
        if (models.length > 0) return models;
      }
    } catch {
      // fallback
    }
    return this.getKnownModels();
  }

  public getKnownModels(): AIModelInfo[] {
    return [
      {
        id: 'llama3.2',
        name: 'Llama 3.2 (Local)',
        provider: 'ollama',
        description: 'Ultra-fast local model running 100% privately on your machine.',
        costPer1kInputUsd: 0,
        costPer1kOutputUsd: 0,
        isRecommended: true,
        capabilities: { streaming: true, vision: false, functionCalling: false, jsonMode: true, contextWindow: 8192 }
      },
      {
        id: 'deepseek-r1',
        name: 'DeepSeek R1 (Local)',
        provider: 'ollama',
        description: 'Local reasoning model running privately with zero cloud transmission.',
        costPer1kInputUsd: 0,
        costPer1kOutputUsd: 0,
        capabilities: { streaming: true, vision: false, functionCalling: false, jsonMode: true, contextWindow: 8192 }
      },
      {
        id: 'mistral',
        name: 'Mistral 7B (Local)',
        provider: 'ollama',
        description: 'Balanced open weights local model.',
        costPer1kInputUsd: 0,
        costPer1kOutputUsd: 0,
        capabilities: { streaming: true, vision: false, functionCalling: false, jsonMode: true, contextWindow: 8192 }
      }
    ];
  }

  public async generateText(
    _apiKey: string,
    model: string,
    messages: AIMessage[],
    options: { temperature?: number; maxTokens?: number; customEndpoint?: string; jsonMode?: boolean } = {}
  ): Promise<AIGenerationResponse> {
    const start = Date.now();
    const endpoint = options.customEndpoint || this.defaultEndpoint;
    const targetModel = model || 'llama3.2';

    const payload: any = {
      model: targetModel,
      messages,
      stream: false,
      options: {
        temperature: options.temperature ?? 0.7,
        num_predict: options.maxTokens ?? 1500
      }
    };
    if (options.jsonMode) payload.format = 'json';

    const res = await fetch(`${endpoint}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(60000)
    });

    const latencyMs = Date.now() - start;

    if (!res.ok) {
      throw new Error(`Ollama request failed with HTTP ${res.status}`);
    }

    const data: any = await res.json();
    const text = data.message?.content || '';
    const inTokens = data.prompt_eval_count || Math.round(text.length / 4);
    const outTokens = data.eval_count || Math.round(text.length / 4);

    return {
      text,
      inputTokens: inTokens,
      outputTokens: outTokens,
      totalTokens: inTokens + outTokens,
      estimatedCostUsd: 0,
      model: targetModel,
      provider: 'ollama',
      latencyMs
    };
  }

  public async generateStream(
    _apiKey: string,
    model: string,
    messages: AIMessage[],
    onChunk: (chunk: AIStreamChunk) => void,
    options: { temperature?: number; maxTokens?: number; customEndpoint?: string; jsonMode?: boolean } = {}
  ): Promise<AIGenerationResponse> {
    const start = Date.now();
    const endpoint = options.customEndpoint || this.defaultEndpoint;
    const targetModel = model || 'llama3.2';

    const payload: any = {
      model: targetModel,
      messages,
      stream: true,
      options: {
        temperature: options.temperature ?? 0.7,
        num_predict: options.maxTokens ?? 1500
      }
    };

    const res = await fetch(`${endpoint}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(60000)
    });

    if (!res.ok) {
      throw new Error(`Ollama stream failed with HTTP ${res.status}`);
    }

    let fullText = '';
    let inTokens = 0;
    let outTokens = 0;

    const reader = res.body?.getReader();
    if (!reader) throw new Error('Response stream not available');

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        try {
          const parsed = JSON.parse(trimmed);
          const chunkText = parsed.message?.content || '';
          if (chunkText) {
            fullText += chunkText;
            onChunk({ text: chunkText, done: false });
          }
          if (parsed.done) {
            inTokens = parsed.prompt_eval_count || Math.round(fullText.length / 4);
            outTokens = parsed.eval_count || Math.round(fullText.length / 4);
            onChunk({ text: '', done: true });
          }
        } catch {
          // ignore
        }
      }
    }

    const latencyMs = Date.now() - start;

    return {
      text: fullText,
      inputTokens: inTokens,
      outputTokens: outTokens,
      totalTokens: inTokens + outTokens,
      estimatedCostUsd: 0,
      model: targetModel,
      provider: 'ollama',
      latencyMs
    };
  }
}
