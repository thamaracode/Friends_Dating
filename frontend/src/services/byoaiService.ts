import {
  AIProviderId,
  AIProviderInfo,
  AIModelInfo,
  UserAIConnection,
  TaskAIRoute,
  AIContextPermissions,
  AISpendingLimits,
  AIUsageSummary,
  AIUsageRecord,
  AIAssistantConversation,
  AIAssistantMessage
} from '../types/byoai';

const API_BASE = 'http://127.0.0.1:3001/api';

class BYOAIService {
  private listeners: Set<() => void> = new Set();

  public subscribe(callback: () => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  private notify(): void {
    this.listeners.forEach(cb => cb());
  }

  private getHeaders(userId = 'usr_me'): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'x-user-id': userId
    };
  }

  // --- Provider & Model Discovery ---
  public async getProviders(): Promise<AIProviderInfo[]> {
    try {
      const res = await fetch(`${API_BASE}/ai/providers`);
      const data = await res.json();
      return data.providers || [];
    } catch (err) {
      console.error('Failed to load AI providers:', err);
      return [];
    }
  }

  public async getAllModels(): Promise<AIModelInfo[]> {
    try {
      const res = await fetch(`${API_BASE}/ai/models`);
      const data = await res.json();
      return data.models || [];
    } catch (err) {
      console.error('Failed to load AI models:', err);
      return [];
    }
  }

  // --- Connection Management ---
  public async getConnections(userId = 'usr_me'): Promise<UserAIConnection[]> {
    try {
      const res = await fetch(`${API_BASE}/ai/connections`, {
        headers: this.getHeaders(userId)
      });
      const data = await res.json();
      return data.connections || [];
    } catch (err) {
      console.error('Failed to load AI connections:', err);
      return [];
    }
  }

  public async createConnection(
    data: {
      provider: AIProviderId;
      name: string;
      apiKey?: string;
      customEndpoint?: string;
      defaultModel: string;
    },
    userId = 'usr_me'
  ): Promise<UserAIConnection> {
    const res = await fetch(`${API_BASE}/ai/connections`, {
      method: 'POST',
      headers: this.getHeaders(userId),
      body: JSON.stringify(data)
    });
    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.error || 'Failed to create connection');
    }
    this.notify();
    return json.connection;
  }

  public async updateConnection(
    id: string,
    data: Partial<{
      name: string;
      apiKey: string;
      customEndpoint: string | null;
      defaultModel: string;
      isEnabled: boolean;
    }>,
    userId = 'usr_me'
  ): Promise<UserAIConnection> {
    const res = await fetch(`${API_BASE}/ai/connections/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(userId),
      body: JSON.stringify(data)
    });
    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.error || 'Failed to update connection');
    }
    this.notify();
    return json.connection;
  }

  public async deleteConnection(id: string, userId = 'usr_me'): Promise<void> {
    const res = await fetch(`${API_BASE}/ai/connections/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(userId)
    });
    if (!res.ok) {
      const json = await res.json();
      throw new Error(json.error || 'Failed to delete connection');
    }
    this.notify();
  }

  public async testConnection(
    id: string,
    userId = 'usr_me'
  ): Promise<{ success: boolean; status: string; latencyMs: number; error?: string }> {
    const res = await fetch(`${API_BASE}/ai/connections/${id}/test`, {
      method: 'POST',
      headers: this.getHeaders(userId)
    });
    const json = await res.json();
    this.notify();
    return json;
  }

  public async discoverModels(id: string, userId = 'usr_me'): Promise<AIModelInfo[]> {
    const res = await fetch(`${API_BASE}/ai/connections/${id}/models`, {
      headers: this.getHeaders(userId)
    });
    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.error || 'Failed to discover models');
    }
    return json.models || [];
  }

  // --- Task Routing ---
  public async getRouting(userId = 'usr_me'): Promise<TaskAIRoute[]> {
    try {
      const res = await fetch(`${API_BASE}/ai/routing`, {
        headers: this.getHeaders(userId)
      });
      const data = await res.json();
      return data.routes || [];
    } catch (err) {
      console.error('Failed to load routing:', err);
      return [];
    }
  }

  public async updateRouting(routes: TaskAIRoute[], userId = 'usr_me'): Promise<void> {
    const res = await fetch(`${API_BASE}/ai/routing`, {
      method: 'POST',
      headers: this.getHeaders(userId),
      body: JSON.stringify({ routes })
    });
    if (!res.ok) {
      const json = await res.json();
      throw new Error(json.error || 'Failed to save task routing');
    }
    this.notify();
  }

  // --- Context Permissions ---
  public async getPermissions(userId = 'usr_me'): Promise<AIContextPermissions> {
    const res = await fetch(`${API_BASE}/ai/permissions`, {
      headers: this.getHeaders(userId)
    });
    const data = await res.json();
    return data.permissions;
  }

  public async updatePermissions(
    patch: Partial<AIContextPermissions>,
    userId = 'usr_me'
  ): Promise<AIContextPermissions> {
    const res = await fetch(`${API_BASE}/ai/permissions`, {
      method: 'PUT',
      headers: this.getHeaders(userId),
      body: JSON.stringify(patch)
    });
    const data = await res.json();
    this.notify();
    return data.permissions;
  }

  // --- Usage & Limits ---
  public async getUsage(
    userId = 'usr_me'
  ): Promise<{ limits: AISpendingLimits; summary: AIUsageSummary; records: AIUsageRecord[] }> {
    const res = await fetch(`${API_BASE}/ai/usage`, {
      headers: this.getHeaders(userId)
    });
    const data = await res.json();
    return {
      limits: data.limits,
      summary: data.summary,
      records: data.records || []
    };
  }

  public async updateSpendingLimits(
    limits: Partial<AISpendingLimits>,
    userId = 'usr_me'
  ): Promise<AISpendingLimits> {
    const res = await fetch(`${API_BASE}/ai/spending-limits`, {
      method: 'PUT',
      headers: this.getHeaders(userId),
      body: JSON.stringify(limits)
    });
    const data = await res.json();
    this.notify();
    return data.limits;
  }

  // --- Centralized Dispatch ---
  public async dispatchAI(payload: any, userId = 'usr_me'): Promise<any> {
    const res = await fetch(`${API_BASE}/ai/dispatch`, {
      method: 'POST',
      headers: this.getHeaders(userId),
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'AI generation failed');
    }
    this.notify();
    return data.result;
  }

  // --- SSE Streaming ---
  public streamAI(
    payload: any,
    onChunk: (text: string, done: boolean) => void,
    onError: (err: string) => void,
    userId = 'usr_me'
  ): () => void {
    const abortController = new AbortController();

    fetch(`${API_BASE}/ai/stream`, {
      method: 'POST',
      headers: this.getHeaders(userId),
      body: JSON.stringify(payload),
      signal: abortController.signal
    })
      .then(async response => {
        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.error || `HTTP error ${response.status}`);
        }
        if (!response.body) {
          throw new Error('ReadableStream not supported in response');
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith('data: ')) continue;
            const dataStr = trimmed.slice(6);
            if (dataStr === '[DONE]') {
              onChunk('', true);
              this.notify();
              return;
            }
            try {
              const parsed = JSON.parse(dataStr);
              if (parsed.error) {
                onError(parsed.error);
                return;
              }
              if (parsed.text !== undefined) {
                onChunk(parsed.text, parsed.done);
              }
            } catch {
              // Ignore non-json chunk
            }
          }
        }
        onChunk('', true);
        this.notify();
      })
      .catch(err => {
        if (err.name !== 'AbortError') {
          onError(err.message || 'Stream connection broken');
        }
      });

    return () => abortController.abort();
  }

  // --- Assistant Conversations ---
  public async getConversations(userId = 'usr_me'): Promise<AIAssistantConversation[]> {
    try {
      const res = await fetch(`${API_BASE}/ai/conversations`, {
        headers: this.getHeaders(userId)
      });
      const data = await res.json();
      return data.conversations || [];
    } catch {
      return [];
    }
  }

  public async createConversation(
    data: {
      title: string;
      taskContext?: string;
      contextEntityId?: string;
      customInstructions?: string;
    },
    userId = 'usr_me'
  ): Promise<AIAssistantConversation> {
    const res = await fetch(`${API_BASE}/ai/conversations`, {
      method: 'POST',
      headers: this.getHeaders(userId),
      body: JSON.stringify(data)
    });
    const json = await res.json();
    return json.conversation;
  }

  public async getConversationMessages(
    id: string,
    userId = 'usr_me'
  ): Promise<AIAssistantMessage[]> {
    try {
      const res = await fetch(`${API_BASE}/ai/conversations/${id}/messages`, {
        headers: this.getHeaders(userId)
      });
      const data = await res.json();
      return data.messages || [];
    } catch {
      return [];
    }
  }

  public async addConversationMessage(
    id: string,
    data: {
      role: 'user' | 'assistant';
      content: string;
      provider?: string;
      model?: string;
      tokensUsed?: number;
    },
    userId = 'usr_me'
  ): Promise<AIAssistantMessage> {
    const res = await fetch(`${API_BASE}/ai/conversations/${id}/messages`, {
      method: 'POST',
      headers: this.getHeaders(userId),
      body: JSON.stringify(data)
    });
    const json = await res.json();
    return json.message;
  }

  public async deleteConversation(id: string, userId = 'usr_me'): Promise<void> {
    await fetch(`${API_BASE}/ai/conversations/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(userId)
    });
  }

  // --- Admin Infrastructure ---
  public async getAdminInfrastructure(adminId = 'usr_me'): Promise<{
    providers: any[];
    telemetry: any;
    models: AIModelInfo[];
  }> {
    const res = await fetch(`${API_BASE}/admin/ai/infrastructure`, {
      headers: {
        'Content-Type': 'application/json',
        'x-admin-id': adminId
      }
    });
    const data = await res.json();
    return data;
  }

  public async updateAdminProvider(
    providerId: string,
    patch: any,
    adminId = 'usr_me'
  ): Promise<void> {
    const res = await fetch(`${API_BASE}/admin/ai/providers/${providerId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-id': adminId
      },
      body: JSON.stringify(patch)
    });
    if (!res.ok) {
      const json = await res.json();
      throw new Error(json.error || 'Failed to update admin provider');
    }
  }
}

export const byoaiService = new BYOAIService();
