import { AIProviderAdapter, AIModelInfo, AIMessage, AIGenerationResponse, AIStreamChunk } from '../types';

export class AnthropicAdapter implements AIProviderAdapter {
  public providerId = 'anthropic' as const;
  public displayName = 'Anthropic Claude';
  public defaultEndpoint = 'https://api.anthropic.com/v1';

  public async validateConnection(
    apiKey: string,
    endpoint = this.defaultEndpoint
  ): Promise<{ success: boolean; error?: string; latencyMs: number }> {
    const start = Date.now();
    try {
      // Test with minimum payload
      const res = await fetch(`${endpoint}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey.trim(),
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-5-haiku-20241022',
          max_tokens: 5,
          messages: [{ role: 'user', content: 'ping' }]
        }),
        signal: AbortSignal.timeout(10000)
      });
      const latencyMs = Date.now() - start;
      if (!res.ok) {
        const data: any = await res.json().catch(() => ({}));
        return {
          success: false,
          error: data?.error?.message || `Anthropic returned status ${res.status}`,
          latencyMs
        };
      }
      return { success: true, latencyMs };
    } catch (err: any) {
      return { success: false, error: err.message || 'Connection timeout to Anthropic', latencyMs: Date.now() - start };
    }
  }

  public async discoverModels(): Promise<AIModelInfo[]> {
    return this.getKnownModels();
  }

  public getKnownModels(): AIModelInfo[] {
    return [
      {
        id: 'claude-3-5-sonnet-20241022',
        name: 'Claude 3.5 Sonnet',
        provider: 'anthropic',
        description: 'Elite emotional intelligence, sophisticated prose, and profound empathy.',
        costPer1kInputUsd: 0.003,
        costPer1kOutputUsd: 0.015,
        isRecommended: true,
        capabilities: { streaming: true, vision: true, functionCalling: true, jsonMode: true, contextWindow: 200000 }
      },
      {
        id: 'claude-3-5-haiku-20241022',
        name: 'Claude 3.5 Haiku',
        provider: 'anthropic',
        description: 'Ultra-fast, cost-effective reasoning for quick messaging analysis.',
        costPer1kInputUsd: 0.0008,
        costPer1kOutputUsd: 0.004,
        capabilities: { streaming: true, vision: true, functionCalling: true, jsonMode: true, contextWindow: 200000 }
      },
      {
        id: 'claude-3-opus-20240229',
        name: 'Claude 3 Opus',
        provider: 'anthropic',
        description: 'Deep philosophical reasoning and narrative worldcrafting power.',
        costPer1kInputUsd: 0.015,
        costPer1kOutputUsd: 0.075,
        capabilities: { streaming: true, vision: true, functionCalling: true, jsonMode: true, contextWindow: 200000 }
      }
    ];
  }

  private formatMessages(messages: AIMessage[]): { systemText: string; filteredMessages: any[] } {
    let systemText = '';
    const filteredMessages: any[] = [];

    for (const m of messages) {
      if (m.role === 'system') {
        systemText += (systemText ? '\n\n' : '') + m.content;
      } else {
        filteredMessages.push({
          role: m.role === 'assistant' ? 'assistant' : 'user',
          content: m.content
        });
      }
    }

    if (filteredMessages.length === 0) {
      filteredMessages.push({ role: 'user', content: 'Hello' });
    }

    return { systemText, filteredMessages };
  }

  public async generateText(
    apiKey: string,
    model: string,
    messages: AIMessage[],
    options: { temperature?: number; maxTokens?: number; customEndpoint?: string; jsonMode?: boolean } = {}
  ): Promise<AIGenerationResponse> {
    const start = Date.now();
    const endpoint = options.customEndpoint || this.defaultEndpoint;
    const targetModel = model || 'claude-3-5-haiku-20241022';

    const { systemText, filteredMessages } = this.formatMessages(messages);

    const bodyPayload: any = {
      model: targetModel,
      max_tokens: options.maxTokens ?? 1500,
      temperature: options.temperature ?? 0.7,
      messages: filteredMessages
    };

    if (systemText) {
      bodyPayload.system = systemText;
    }

    const res = await fetch(`${endpoint}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey.trim(),
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(bodyPayload),
      signal: AbortSignal.timeout(45000)
    });

    const latencyMs = Date.now() - start;

    if (!res.ok) {
      const errData: any = await res.json().catch(() => ({}));
      throw new Error(errData?.error?.message || `Anthropic request failed: HTTP ${res.status}`);
    }

    const data: any = await res.json();
    const text = (data.content || []).map((c: any) => c.text || '').join('');
    const inTokens = data.usage?.input_tokens || Math.round(text.length / 4);
    const outTokens = data.usage?.output_tokens || Math.round(text.length / 4);
    const totalTokens = inTokens + outTokens;

    const modelMeta = this.getKnownModels().find(m => m.id === targetModel);
    const inRate = modelMeta ? modelMeta.costPer1kInputUsd : 0.0008;
    const outRate = modelMeta ? modelMeta.costPer1kOutputUsd : 0.004;
    const estimatedCostUsd = ((inTokens / 1000) * inRate) + ((outTokens / 1000) * outRate);

    return {
      text,
      inputTokens: inTokens,
      outputTokens: outTokens,
      totalTokens,
      estimatedCostUsd: Number(estimatedCostUsd.toFixed(6)),
      model: targetModel,
      provider: 'anthropic',
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
    const targetModel = model || 'claude-3-5-haiku-20241022';

    const { systemText, filteredMessages } = this.formatMessages(messages);

    const bodyPayload: any = {
      model: targetModel,
      max_tokens: options.maxTokens ?? 1500,
      temperature: options.temperature ?? 0.7,
      messages: filteredMessages,
      stream: true
    };
    if (systemText) bodyPayload.system = systemText;

    const res = await fetch(`${endpoint}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey.trim(),
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(bodyPayload),
      signal: AbortSignal.timeout(60000)
    });

    if (!res.ok) {
      const errData: any = await res.json().catch(() => ({}));
      throw new Error(errData?.error?.message || `Anthropic stream failed: HTTP ${res.status}`);
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

        try {
          const parsed = JSON.parse(jsonStr);
          if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
            fullText += parsed.delta.text;
            onChunk({ text: parsed.delta.text, done: false });
          }
          if (parsed.type === 'message_delta' && parsed.usage) {
            outTokens = parsed.usage.output_tokens;
          }
          if (parsed.type === 'message_start' && parsed.message?.usage) {
            inTokens = parsed.message.usage.input_tokens;
          }
        } catch {
          // ignore parsing error on stream chunk
        }
      }
    }

    onChunk({ text: '', done: true });
    const latencyMs = Date.now() - start;

    if (inTokens === 0) inTokens = Math.round(fullText.length / 4);
    if (outTokens === 0) outTokens = Math.round(fullText.length / 4);

    const modelMeta = this.getKnownModels().find(m => m.id === targetModel);
    const inRate = modelMeta ? modelMeta.costPer1kInputUsd : 0.0008;
    const outRate = modelMeta ? modelMeta.costPer1kOutputUsd : 0.004;
    const estimatedCostUsd = ((inTokens / 1000) * inRate) + ((outTokens / 1000) * outRate);

    return {
      text: fullText,
      inputTokens: inTokens,
      outputTokens: outTokens,
      totalTokens: inTokens + outTokens,
      estimatedCostUsd: Number(estimatedCostUsd.toFixed(6)),
      model: targetModel,
      provider: 'anthropic',
      latencyMs
    };
  }
}
