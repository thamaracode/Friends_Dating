import { AIProviderAdapter, AIModelInfo, AIMessage, AIGenerationResponse, AIStreamChunk } from '../types';

export class GeminiAdapter implements AIProviderAdapter {
  public providerId = 'gemini' as const;
  public displayName = 'Google Gemini';
  public defaultEndpoint = 'https://generativelanguage.googleapis.com/v1beta';

  public async validateConnection(
    apiKey: string,
    endpoint = this.defaultEndpoint
  ): Promise<{ success: boolean; error?: string; latencyMs: number }> {
    const start = Date.now();
    try {
      const res = await fetch(`${endpoint}/models?key=${apiKey.trim()}`, {
        signal: AbortSignal.timeout(10000)
      });
      const latencyMs = Date.now() - start;
      if (!res.ok) {
        const data: any = await res.json().catch(() => ({}));
        return {
          success: false,
          error: data?.error?.message || `Gemini returned status ${res.status}`,
          latencyMs
        };
      }
      return { success: true, latencyMs };
    } catch (err: any) {
      return { success: false, error: err.message || 'Connection timeout to Gemini', latencyMs: Date.now() - start };
    }
  }

  public async discoverModels(apiKey: string, endpoint = this.defaultEndpoint): Promise<AIModelInfo[]> {
    try {
      const res = await fetch(`${endpoint}/models?key=${apiKey.trim()}`, {
        signal: AbortSignal.timeout(10000)
      });
      if (res.ok) {
        const data: any = await res.json();
        const models = (data.models || []).map((m: any) => m.name.replace('models/', ''));
        const known = this.getKnownModels();
        return known.filter(k => models.includes(k.id) || k.id.startsWith('gemini-1.5'));
      }
    } catch {
      // fallback
    }
    return this.getKnownModels();
  }

  public getKnownModels(): AIModelInfo[] {
    return [
      {
        id: 'gemini-1.5-flash',
        name: 'Gemini 1.5 Flash',
        provider: 'gemini',
        description: 'Blazing fast, cost-effective multimodal model with high-speed response.',
        costPer1kInputUsd: 0.000075,
        costPer1kOutputUsd: 0.0003,
        isRecommended: true,
        capabilities: { streaming: true, vision: true, functionCalling: true, jsonMode: true, contextWindow: 1048576 }
      },
      {
        id: 'gemini-1.5-pro',
        name: 'Gemini 1.5 Pro',
        provider: 'gemini',
        description: 'Industry-leading 2M context window with deep human emotional comprehension.',
        costPer1kInputUsd: 0.00125,
        costPer1kOutputUsd: 0.005,
        capabilities: { streaming: true, vision: true, functionCalling: true, jsonMode: true, contextWindow: 2097152 }
      },
      {
        id: 'gemini-2.0-flash',
        name: 'Gemini 2.0 Flash (Experimental)',
        provider: 'gemini',
        description: 'Next-generation Gemini flagship preview for complex agentic workflows.',
        costPer1kInputUsd: 0.0001,
        costPer1kOutputUsd: 0.0004,
        capabilities: { streaming: true, vision: true, functionCalling: true, jsonMode: true, contextWindow: 1048576 }
      }
    ];
  }

  private convertMessagesToGemini(messages: AIMessage[]): { contents: any[]; systemInstruction?: any } {
    const contents: any[] = [];
    let systemText = '';

    for (const m of messages) {
      if (m.role === 'system') {
        systemText += (systemText ? '\n\n' : '') + m.content;
      } else {
        contents.push({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }]
        });
      }
    }

    if (contents.length === 0) {
      contents.push({ role: 'user', parts: [{ text: 'Hello' }] });
    }

    const payload: any = { contents };
    if (systemText) {
      payload.systemInstruction = {
        parts: [{ text: systemText }]
      };
    }
    return payload;
  }

  public async generateText(
    apiKey: string,
    model: string,
    messages: AIMessage[],
    options: { temperature?: number; maxTokens?: number; customEndpoint?: string; jsonMode?: boolean } = {}
  ): Promise<AIGenerationResponse> {
    const start = Date.now();
    const endpoint = options.customEndpoint || this.defaultEndpoint;
    const targetModel = model || 'gemini-1.5-flash';

    const { contents, systemInstruction } = this.convertMessagesToGemini(messages);

    const bodyPayload: any = {
      contents,
      generationConfig: {
        temperature: options.temperature ?? 0.7,
        maxOutputTokens: options.maxTokens ?? 1500
      }
    };

    if (systemInstruction) {
      bodyPayload.systemInstruction = systemInstruction;
    }

    if (options.jsonMode) {
      bodyPayload.generationConfig.responseMimeType = 'application/json';
    }

    const res = await fetch(`${endpoint}/models/${targetModel}:generateContent?key=${apiKey.trim()}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bodyPayload),
      signal: AbortSignal.timeout(45000)
    });

    const latencyMs = Date.now() - start;

    if (!res.ok) {
      const errData: any = await res.json().catch(() => ({}));
      throw new Error(errData?.error?.message || `Gemini request failed: HTTP ${res.status}`);
    }

    const data: any = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const inTokens = data.usageMetadata?.promptTokenCount || Math.round(text.length / 4);
    const outTokens = data.usageMetadata?.candidatesTokenCount || Math.round(text.length / 4);
    const totalTokens = data.usageMetadata?.totalTokenCount || inTokens + outTokens;

    const modelMeta = this.getKnownModels().find(m => m.id === targetModel);
    const inRate = modelMeta ? modelMeta.costPer1kInputUsd : 0.000075;
    const outRate = modelMeta ? modelMeta.costPer1kOutputUsd : 0.0003;
    const estimatedCostUsd = ((inTokens / 1000) * inRate) + ((outTokens / 1000) * outRate);

    return {
      text,
      inputTokens: inTokens,
      outputTokens: outTokens,
      totalTokens,
      estimatedCostUsd: Number(estimatedCostUsd.toFixed(6)),
      model: targetModel,
      provider: 'gemini',
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
    const targetModel = model || 'gemini-1.5-flash';

    const { contents, systemInstruction } = this.convertMessagesToGemini(messages);

    const bodyPayload: any = {
      contents,
      generationConfig: {
        temperature: options.temperature ?? 0.7,
        maxOutputTokens: options.maxTokens ?? 1500
      }
    };
    if (systemInstruction) bodyPayload.systemInstruction = systemInstruction;
    if (options.jsonMode) bodyPayload.generationConfig.responseMimeType = 'application/json';

    const res = await fetch(
      `${endpoint}/models/${targetModel}:streamGenerateContent?alt=sse&key=${apiKey.trim()}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyPayload),
        signal: AbortSignal.timeout(60000)
      }
    );

    if (!res.ok) {
      const errData: any = await res.json().catch(() => ({}));
      throw new Error(errData?.error?.message || `Gemini stream failed: HTTP ${res.status}`);
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
          const chunkText = parsed.candidates?.[0]?.content?.parts?.[0]?.text || '';
          if (chunkText) {
            fullText += chunkText;
            onChunk({ text: chunkText, done: false });
          }
          if (parsed.usageMetadata) {
            inTokens = parsed.usageMetadata.promptTokenCount;
            outTokens = parsed.usageMetadata.candidatesTokenCount;
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
    const inRate = modelMeta ? modelMeta.costPer1kInputUsd : 0.000075;
    const outRate = modelMeta ? modelMeta.costPer1kOutputUsd : 0.0003;
    const estimatedCostUsd = ((inTokens / 1000) * inRate) + ((outTokens / 1000) * outRate);

    return {
      text: fullText,
      inputTokens: inTokens,
      outputTokens: outTokens,
      totalTokens: inTokens + outTokens,
      estimatedCostUsd: Number(estimatedCostUsd.toFixed(6)),
      model: targetModel,
      provider: 'gemini',
      latencyMs
    };
  }
}
