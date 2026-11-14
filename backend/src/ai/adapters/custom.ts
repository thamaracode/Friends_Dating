import { AIProviderAdapter, AIModelInfo, AIMessage, AIGenerationResponse, AIStreamChunk } from '../types';

export class CustomOpenAIAdapter implements AIProviderAdapter {
  public providerId = 'custom_openai' as const;
  public displayName = 'Custom OpenAI-Compatible';

  public async validateConnection(
    apiKey: string,
    endpoint?: string
  ): Promise<{ success: boolean; error?: string; latencyMs: number }> {
    if (!endpoint) {
      return { success: false, error: 'Custom endpoint URL is required', latencyMs: 0 };
    }
    const start = Date.now();
    try {
      const headers: Record<string, string> = {};
      if (apiKey) headers['Authorization'] = `Bearer ${apiKey.trim()}`;

      const res = await fetch(`${endpoint}/models`, {
        headers,
        signal: AbortSignal.timeout(10000)
      });
      const latencyMs = Date.now() - start;
      if (!res.ok) {
        return {
          success: false,
          error: `Endpoint returned HTTP status ${res.status}`,
          latencyMs
        };
      }
      return { success: true, latencyMs };
    } catch (err: any) {
      return { success: false, error: err.message || 'Connection timeout to custom endpoint', latencyMs: Date.now() - start };
    }
  }

  public async discoverModels(apiKey: string, endpoint?: string): Promise<AIModelInfo[]> {
    if (!endpoint) return [];
    try {
      const headers: Record<string, string> = {};
      if (apiKey) headers['Authorization'] = `Bearer ${apiKey.trim()}`;

      const res = await fetch(`${endpoint}/models`, {
        headers,
        signal: AbortSignal.timeout(8000)
      });
      if (res.ok) {
        const data: any = await res.json();
        return (data.data || []).map((m: any) => ({
          id: m.id,
          name: m.id,
          provider: 'custom_openai' as const,
          description: `Custom model served at ${endpoint}`,
          costPer1kInputUsd: 0.0005,
          costPer1kOutputUsd: 0.0015,
          capabilities: { streaming: true, vision: false, functionCalling: false, jsonMode: true, contextWindow: 32768 }
        }));
      }
    } catch {
      // fallback
    }
    return [
      {
        id: 'default',
        name: 'Default Endpoint Model',
        provider: 'custom_openai',
        description: 'Default model configured on your custom inference endpoint',
        costPer1kInputUsd: 0,
        costPer1kOutputUsd: 0,
        capabilities: { streaming: true, vision: false, functionCalling: false, jsonMode: true, contextWindow: 32768 }
      }
    ];
  }

  public async generateText(
    apiKey: string,
    model: string,
    messages: AIMessage[],
    options: { temperature?: number; maxTokens?: number; customEndpoint?: string; jsonMode?: boolean } = {}
  ): Promise<AIGenerationResponse> {
    if (!options.customEndpoint) throw new Error('Custom endpoint URL is missing');
    const start = Date.now();

    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (apiKey) headers['Authorization'] = `Bearer ${apiKey.trim()}`;

    const payload: any = {
      model: model || 'default',
      messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens ?? 1500
    };
    if (options.jsonMode) payload.response_format = { type: 'json_object' };

    const res = await fetch(`${options.customEndpoint}/chat/completions`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(45000)
    });

    const latencyMs = Date.now() - start;

    if (!res.ok) {
      const err = await res.text().catch(() => '');
      throw new Error(`Custom endpoint error HTTP ${res.status}: ${err}`);
    }

    const data: any = await res.json();
    const text = data.choices?.[0]?.message?.content || '';
    const inTokens = data.usage?.prompt_tokens || Math.round(text.length / 4);
    const outTokens = data.usage?.completion_tokens || Math.round(text.length / 4);

    return {
      text,
      inputTokens: inTokens,
      outputTokens: outTokens,
      totalTokens: inTokens + outTokens,
      estimatedCostUsd: 0,
      model,
      provider: 'custom_openai',
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
    if (!options.customEndpoint) throw new Error('Custom endpoint URL is missing');
    const start = Date.now();

    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (apiKey) headers['Authorization'] = `Bearer ${apiKey.trim()}`;

    const payload: any = {
      model: model || 'default',
      messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens ?? 1500,
      stream: true
    };

    const res = await fetch(`${options.customEndpoint}/chat/completions`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(60000)
    });

    if (!res.ok) {
      throw new Error(`Custom endpoint stream error HTTP ${res.status}`);
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
      estimatedCostUsd: 0,
      model,
      provider: 'custom_openai',
      latencyMs
    };
  }
}
