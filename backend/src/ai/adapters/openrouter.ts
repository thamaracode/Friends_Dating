import { AIProviderAdapter, AIModelInfo, AIMessage, AIGenerationResponse, AIStreamChunk } from '../types';

export class OpenRouterAdapter implements AIProviderAdapter {
  public providerId = 'openrouter' as const;
  public displayName = 'OpenRouter';
  public defaultEndpoint = 'https://openrouter.ai/api/v1';

  public async validateConnection(
    apiKey: string,
    endpoint = this.defaultEndpoint
  ): Promise<{ success: boolean; error?: string; latencyMs: number }> {
    const start = Date.now();
    try {
      const res = await fetch(`${endpoint}/auth/key`, {
        headers: {
          Authorization: `Bearer ${apiKey.trim()}`,
          'HTTP-Referer': 'https://soulverse.im',
          'X-Title': 'Soulverse BYOAI'
        },
        signal: AbortSignal.timeout(10000)
      });
      const latencyMs = Date.now() - start;
      if (!res.ok) {
        const data: any = await res.json().catch(() => ({}));
        return {
          success: false,
          error: data?.error?.message || `OpenRouter returned status ${res.status}`,
          latencyMs
        };
      }
      return { success: true, latencyMs };
    } catch (err: any) {
      return { success: false, error: err.message || 'Connection timeout to OpenRouter', latencyMs: Date.now() - start };
    }
  }

  public async discoverModels(apiKey: string, endpoint = this.defaultEndpoint): Promise<AIModelInfo[]> {
    try {
      const res = await fetch(`${endpoint}/models`, {
        headers: {
          Authorization: `Bearer ${apiKey.trim()}`,
          'HTTP-Referer': 'https://soulverse.im',
          'X-Title': 'Soulverse BYOAI'
        },
        signal: AbortSignal.timeout(10000)
      });
      if (res.ok) {
        const data: any = await res.json();
        const models = (data.data || []).slice(0, 30).map((m: any) => ({
          id: m.id,
          name: m.name || m.id,
          provider: 'openrouter' as const,
          description: m.description || `Routed model: ${m.id}`,
          costPer1kInputUsd: parseFloat(m.pricing?.prompt || '0.001') * 1000,
          costPer1kOutputUsd: parseFloat(m.pricing?.completion || '0.003') * 1000,
          capabilities: {
            streaming: true,
            vision: Boolean(m.architecture?.modality?.includes('image')),
            functionCalling: true,
            jsonMode: true,
            contextWindow: m.context_length || 128000
          }
        }));
        return models;
      }
    } catch {
      // fallback
    }
    return this.getKnownModels();
  }

  public getKnownModels(): AIModelInfo[] {
    return [
      {
        id: 'openrouter/auto',
        name: 'OpenRouter Auto Router',
        provider: 'openrouter',
        description: 'Dynamically routes to the best value model matching request capabilities.',
        costPer1kInputUsd: 0.001,
        costPer1kOutputUsd: 0.003,
        isRecommended: true,
        capabilities: { streaming: true, vision: true, functionCalling: true, jsonMode: true, contextWindow: 128000 }
      },
      {
        id: 'meta-llama/llama-3.3-70b-instruct',
        name: 'Llama 3.3 70B Instruct',
        provider: 'openrouter',
        description: 'Open-weights powerhouse offering high emotional intelligence and low cost.',
        costPer1kInputUsd: 0.00012,
        costPer1kOutputUsd: 0.0003,
        capabilities: { streaming: true, vision: false, functionCalling: true, jsonMode: true, contextWindow: 131072 }
      },
      {
        id: 'deepseek/deepseek-chat',
        name: 'DeepSeek Chat V3',
        provider: 'openrouter',
        description: 'Exceptional reasoning and creative conversation at fraction of cost.',
        costPer1kInputUsd: 0.00014,
        costPer1kOutputUsd: 0.00028,
        capabilities: { streaming: true, vision: false, functionCalling: true, jsonMode: true, contextWindow: 64000 }
      }
    ];
  }

  public async generateText(
    apiKey: string,
    model: string,
    messages: AIMessage[],
    options: { temperature?: number; maxTokens?: number; customEndpoint?: string; jsonMode?: boolean } = {}
  ): Promise<AIGenerationResponse> {
    const start = Date.now();
    const endpoint = options.customEndpoint || this.defaultEndpoint;
    const targetModel = model || 'openrouter/auto';

    const payload: any = {
      model: targetModel,
      messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens ?? 1500
    };
    if (options.jsonMode) payload.response_format = { type: 'json_object' };

    const res = await fetch(`${endpoint}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey.trim()}`,
        'HTTP-Referer': 'https://soulverse.im',
        'X-Title': 'Soulverse BYOAI'
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(45000)
    });

    const latencyMs = Date.now() - start;

    if (!res.ok) {
      const errData: any = await res.json().catch(() => ({}));
      throw new Error(errData?.error?.message || `OpenRouter request failed: HTTP ${res.status}`);
    }

    const data: any = await res.json();
    const text = data.choices?.[0]?.message?.content || '';
    const inTokens = data.usage?.prompt_tokens || Math.round(text.length / 4);
    const outTokens = data.usage?.completion_tokens || Math.round(text.length / 4);
    const totalTokens = data.usage?.total_tokens || inTokens + outTokens;

    const estimatedCostUsd = ((inTokens / 1000) * 0.0005) + ((outTokens / 1000) * 0.0015);

    return {
      text,
      inputTokens: inTokens,
      outputTokens: outTokens,
      totalTokens,
      estimatedCostUsd: Number(estimatedCostUsd.toFixed(6)),
      model: targetModel,
      provider: 'openrouter',
      latencyMs
    };
  }

  public async generateStream(
    apiKey: string,
    model: string,
    messages: AIMessage[],
    onChunk: (chunk: AIStreamChunk) => void,
    options: { temperature?: number; maxTokens?: number; customEndpoint?: string; jsonMode?: boolean } = {}
  ): Promise<AIGenerationResponse> {
    const start = Date.now();
    const endpoint = options.customEndpoint || this.defaultEndpoint;
    const targetModel = model || 'openrouter/auto';

    const payload: any = {
      model: targetModel,
      messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens ?? 1500,
      stream: true
    };

    const res = await fetch(`${endpoint}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey.trim()}`,
        'HTTP-Referer': 'https://soulverse.im',
        'X-Title': 'Soulverse BYOAI'
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(60000)
    });

    if (!res.ok) {
      const errData: any = await res.json().catch(() => ({}));
      throw new Error(errData?.error?.message || `OpenRouter stream failed: HTTP ${res.status}`);
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
        if (!trimmed || !trimmed.startsWith('data: ')) continue;
        const jsonStr = trimmed.replace('data: ', '').trim();
        if (jsonStr === '[DONE]') {
          onChunk({ text: '', done: true });
          continue;
        }

        try {
          const parsed = JSON.parse(jsonStr);
          const delta = parsed.choices?.[0]?.delta?.content || '';
          if (delta) {
            fullText += delta;
            onChunk({ text: delta, done: false });
          }
          if (parsed.usage) {
            inTokens = parsed.usage.prompt_tokens;
            outTokens = parsed.usage.completion_tokens;
          }
        } catch {
          // ignore
        }
      }
    }

    const latencyMs = Date.now() - start;
    if (inTokens === 0) inTokens = Math.round(fullText.length / 4);
    if (outTokens === 0) outTokens = Math.round(fullText.length / 4);

    return {
      text: fullText,
      inputTokens: inTokens,
      outputTokens: outTokens,
      totalTokens: inTokens + outTokens,
      estimatedCostUsd: Number((((inTokens / 1000) * 0.0005) + ((outTokens / 1000) * 0.0015)).toFixed(6)),
      model: targetModel,
      provider: 'openrouter',
      latencyMs
    };
  }
}
