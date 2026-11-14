import { AIProviderAdapter, AIModelInfo, AIMessage, AIGenerationResponse, AIStreamChunk } from '../types';

export class MistralAdapter implements AIProviderAdapter {
  public providerId = 'mistral' as const;
  public displayName = 'Mistral AI';
  public defaultEndpoint = 'https://api.mistral.ai/v1';

  public async validateConnection(
    apiKey: string,
    endpoint = this.defaultEndpoint
  ): Promise<{ success: boolean; error?: string; latencyMs: number }> {
    const start = Date.now();
    try {
      const res = await fetch(`${endpoint}/models`, {
        headers: { Authorization: `Bearer ${apiKey.trim()}` },
        signal: AbortSignal.timeout(10000)
      });
      const latencyMs = Date.now() - start;
      if (!res.ok) {
        const data: any = await res.json().catch(() => ({}));
        return {
          success: false,
          error: data?.message || `Mistral returned status ${res.status}`,
          latencyMs
        };
      }
      return { success: true, latencyMs };
    } catch (err: any) {
      return { success: false, error: err.message || 'Connection timeout to Mistral', latencyMs: Date.now() - start };
    }
  }

  public async discoverModels(apiKey: string, endpoint = this.defaultEndpoint): Promise<AIModelInfo[]> {
    try {
      const res = await fetch(`${endpoint}/models`, {
        headers: { Authorization: `Bearer ${apiKey.trim()}` },
        signal: AbortSignal.timeout(10000)
      });
      if (res.ok) {
        const data: any = await res.json();
        const available = (data.data || []).map((m: any) => m.id);
        const known = this.getKnownModels();
        return known.filter(k => available.includes(k.id) || k.id.startsWith('mistral'));
      }
    } catch {
      // fallback
    }
    return this.getKnownModels();
  }

  public getKnownModels(): AIModelInfo[] {
    return [
      {
        id: 'mistral-large-latest',
        name: 'Mistral Large',
        provider: 'mistral',
        description: 'Flagship multilingual reasoning model for complex relational dynamics.',
        costPer1kInputUsd: 0.002,
        costPer1kOutputUsd: 0.006,
        capabilities: { streaming: true, vision: false, functionCalling: true, jsonMode: true, contextWindow: 128000 }
      },
      {
        id: 'mistral-small-latest',
        name: 'Mistral Small',
        provider: 'mistral',
        description: 'Lightweight European model optimized for latency and natural empathy.',
        costPer1kInputUsd: 0.0002,
        costPer1kOutputUsd: 0.0006,
        isRecommended: true,
        capabilities: { streaming: true, vision: false, functionCalling: true, jsonMode: true, contextWindow: 128000 }
      },
      {
        id: 'codestral-latest',
        name: 'Codestral',
        provider: 'mistral',
        description: 'High-precision structured logic model for JSON parsing and analysis.',
        costPer1kInputUsd: 0.001,
        costPer1kOutputUsd: 0.003,
        capabilities: { streaming: true, vision: false, functionCalling: true, jsonMode: true, contextWindow: 256000 }
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
    const targetModel = model || 'mistral-small-latest';

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
        Authorization: `Bearer ${apiKey.trim()}`
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(45000)
    });

    const latencyMs = Date.now() - start;

    if (!res.ok) {
      const errData: any = await res.json().catch(() => ({}));
      throw new Error(errData?.message || `Mistral request failed: HTTP ${res.status}`);
    }

    const data: any = await res.json();
    const text = data.choices?.[0]?.message?.content || '';
    const inTokens = data.usage?.prompt_tokens || Math.round(text.length / 4);
    const outTokens = data.usage?.completion_tokens || Math.round(text.length / 4);
    const totalTokens = data.usage?.total_tokens || inTokens + outTokens;

    const modelMeta = this.getKnownModels().find(m => m.id === targetModel);
    const inRate = modelMeta ? modelMeta.costPer1kInputUsd : 0.0002;
    const outRate = modelMeta ? modelMeta.costPer1kOutputUsd : 0.0006;
    const estimatedCostUsd = ((inTokens / 1000) * inRate) + ((outTokens / 1000) * outRate);

    return {
      text,
      inputTokens: inTokens,
      outputTokens: outTokens,
      totalTokens,
      estimatedCostUsd: Number(estimatedCostUsd.toFixed(6)),
      model: targetModel,
      provider: 'mistral',
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
    const targetModel = model || 'mistral-small-latest';

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
        Authorization: `Bearer ${apiKey.trim()}`
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(60000)
    });

    if (!res.ok) {
      const errData: any = await res.json().catch(() => ({}));
      throw new Error(errData?.message || `Mistral stream failed: HTTP ${res.status}`);
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

    const modelMeta = this.getKnownModels().find(m => m.id === targetModel);
    const inRate = modelMeta ? modelMeta.costPer1kInputUsd : 0.0002;
    const outRate = modelMeta ? modelMeta.costPer1kOutputUsd : 0.0006;
    const estimatedCostUsd = ((inTokens / 1000) * inRate) + ((outTokens / 1000) * outRate);

    return {
      text: fullText,
      inputTokens: inTokens,
      outputTokens: outTokens,
      totalTokens: inTokens + outTokens,
      estimatedCostUsd: Number(estimatedCostUsd.toFixed(6)),
      model: targetModel,
      provider: 'mistral',
      latencyMs
    };
  }
}
