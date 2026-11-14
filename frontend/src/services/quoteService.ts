import {
  Quote,
  QuoteCategoryKey,
  CategoryMetadata,
  QuoteUserPreferences,
  DailyQuotePayload,
  AdminQuoteProvider,
  QUOTE_CATEGORIES
} from '../types/quotes';

const API_BASE = 'http://127.0.0.1:3001/api';
const OFFLINE_CACHE_KEY = 'soulverse_quote_cache_v1';
const SAVED_OFFLINE_KEY = 'soulverse_saved_quotes_v1';

class QuoteService {
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

  // --- Offline Cache Helpers ---
  private cacheQuoteLocally(quote: Quote): void {
    try {
      const raw = localStorage.getItem(OFFLINE_CACHE_KEY);
      const list: Quote[] = raw ? JSON.parse(raw) : [];
      if (!list.some(q => q.id === quote.id)) {
        list.unshift(quote);
        if (list.length > 50) list.pop();
        localStorage.setItem(OFFLINE_CACHE_KEY, JSON.stringify(list));
      }
    } catch {
      // Ignore quota errors
    }
  }

  private getCachedQuotes(): Quote[] {
    try {
      const raw = localStorage.getItem(OFFLINE_CACHE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  // --- Core Discovery ---
  public async discoverNextQuote(userId = 'usr_me'): Promise<Quote> {
    try {
      const res = await fetch(`${API_BASE}/quotes/discover`, {
        headers: this.getHeaders(userId)
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to discover quote');
      }
      this.cacheQuoteLocally(data.quote);
      return data.quote;
    } catch (err: any) {
      console.warn('Network quote fetch failed, serving from offline sanctuary cache:', err);
      const cached = this.getCachedQuotes();
      if (cached.length > 0) {
        return cached[Math.floor(Math.random() * cached.length)];
      }
      throw err;
    }
  }

  public async getFeed(
    page: number = 1,
    limit: number = 10,
    category?: QuoteCategoryKey,
    userId = 'usr_me'
  ): Promise<{ quotes: Quote[]; total: number; hasMore: boolean }> {
    try {
      let url = `${API_BASE}/quotes/feed?page=${page}&limit=${limit}`;
      if (category) url += `&category=${category}`;

      const res = await fetch(url, { headers: this.getHeaders(userId) });
      const data = await res.json();
      return {
        quotes: data.quotes || [],
        total: data.total || 0,
        hasMore: Boolean(data.hasMore)
      };
    } catch {
      return { quotes: this.getCachedQuotes(), total: 0, hasMore: false };
    }
  }

  public async getCategories(): Promise<CategoryMetadata[]> {
    try {
      const res = await fetch(`${API_BASE}/quotes/categories`);
      const data = await res.json();
      return data.categories || Object.values(QUOTE_CATEGORIES);
    } catch {
      return Object.values(QUOTE_CATEGORIES);
    }
  }

  public async getDailyQuote(date?: string): Promise<DailyQuotePayload> {
    const url = date ? `${API_BASE}/quotes/daily?date=${date}` : `${API_BASE}/quotes/daily`;
    const res = await fetch(url);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch daily quote');
    return data.daily;
  }

  public async getDailyHistory(limit: number = 14): Promise<Array<{ date: string; reflectionQuestion: string; quote: any }>> {
    try {
      const res = await fetch(`${API_BASE}/quotes/daily/history?limit=${limit}`);
      const data = await res.json();
      return data.history || [];
    } catch {
      return [];
    }
  }

  // --- Interactions ---
  public async toggleInteraction(
    quoteId: string,
    type: 'like' | 'save' | 'skip',
    userId = 'usr_me'
  ): Promise<{ active: boolean; likesCount: number; savesCount: number }> {
    const res = await fetch(`${API_BASE}/quotes/${quoteId}/interact`, {
      method: 'POST',
      headers: this.getHeaders(userId),
      body: JSON.stringify({ type })
    });
    const data = await res.json();
    this.notify();
    return data;
  }

  public async getSavedQuotes(userId = 'usr_me'): Promise<Quote[]> {
    try {
      const res = await fetch(`${API_BASE}/quotes/saved`, {
        headers: this.getHeaders(userId)
      });
      const data = await res.json();
      const list = data.quotes || [];
      localStorage.setItem(SAVED_OFFLINE_KEY, JSON.stringify(list));
      return list;
    } catch {
      try {
        const raw = localStorage.getItem(SAVED_OFFLINE_KEY);
        return raw ? JSON.parse(raw) : [];
      } catch {
        return [];
      }
    }
  }

  // --- Preferences & Personalization ---
  public async getPreferences(userId = 'usr_me'): Promise<QuoteUserPreferences> {
    const res = await fetch(`${API_BASE}/quotes/preferences`, {
      headers: this.getHeaders(userId)
    });
    const data = await res.json();
    return data.preferences;
  }

  public async updatePreferences(
    patch: Partial<QuoteUserPreferences>,
    userId = 'usr_me'
  ): Promise<QuoteUserPreferences> {
    const res = await fetch(`${API_BASE}/quotes/preferences`, {
      method: 'PUT',
      headers: this.getHeaders(userId),
      body: JSON.stringify(patch)
    });
    const data = await res.json();
    this.notify();
    return data.preferences;
  }

  public async clearHistory(userId = 'usr_me'): Promise<void> {
    await fetch(`${API_BASE}/quotes/history/clear`, {
      method: 'POST',
      headers: this.getHeaders(userId)
    });
    this.notify();
  }

  public async reportQuote(quoteId: string, reason: string): Promise<void> {
    await fetch(`${API_BASE}/quotes/${quoteId}/report`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason })
    });
  }

  // --- Admin Methods ---
  public async adminGetQuotes(filters: any, adminId = 'usr_me'): Promise<{ quotes: Quote[]; total: number }> {
    const params = new URLSearchParams(filters);
    const res = await fetch(`${API_BASE}/admin/quotes?${params.toString()}`, {
      headers: { 'x-admin-id': adminId }
    });
    const data = await res.json();
    return data;
  }

  public async adminCreateQuote(data: any, adminId = 'usr_me'): Promise<Quote> {
    const res = await fetch(`${API_BASE}/admin/quotes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-id': adminId
      },
      body: JSON.stringify(data)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to create quote');
    this.notify();
    return json.quote;
  }

  public async adminUpdateQuote(id: string, patch: any, adminId = 'usr_me'): Promise<void> {
    await fetch(`${API_BASE}/admin/quotes/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-id': adminId
      },
      body: JSON.stringify(patch)
    });
    this.notify();
  }

  public async adminDeleteQuote(id: string, adminId = 'usr_me'): Promise<void> {
    await fetch(`${API_BASE}/admin/quotes/${id}`, {
      method: 'DELETE',
      headers: { 'x-admin-id': adminId }
    });
    this.notify();
  }

  public async adminGetProviders(adminId = 'usr_me'): Promise<AdminQuoteProvider[]> {
    const res = await fetch(`${API_BASE}/admin/quotes/providers`, {
      headers: { 'x-admin-id': adminId }
    });
    const data = await res.json();
    return data.providers || [];
  }

  public async adminUpdateProvider(id: string, patch: any, adminId = 'usr_me'): Promise<void> {
    await fetch(`${API_BASE}/admin/quotes/providers/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-id': adminId
      },
      body: JSON.stringify(patch)
    });
    this.notify();
  }

  public async adminFetchProviderBatch(id: string, limit: number = 30, adminId = 'usr_me'): Promise<{ inserted: number }> {
    const res = await fetch(`${API_BASE}/admin/quotes/providers/${id}/fetch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-id': adminId
      },
      body: JSON.stringify({ limit })
    });
    const data = await res.json();
    this.notify();
    return data;
  }

  public async adminDeduplicate(adminId = 'usr_me'): Promise<{ removedCount: number }> {
    const res = await fetch(`${API_BASE}/admin/quotes/deduplicate`, {
      method: 'POST',
      headers: { 'x-admin-id': adminId }
    });
    const data = await res.json();
    this.notify();
    return data;
  }

  public async adminSetDailyQuote(
    dateStr: string,
    quoteId: string,
    reflectionQuestion?: string,
    adminId = 'usr_me'
  ): Promise<DailyQuotePayload> {
    const res = await fetch(`${API_BASE}/admin/quotes/daily`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-id': adminId
      },
      body: JSON.stringify({ dateStr, quoteId, reflectionQuestion })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to assign daily quote');
    this.notify();
    return data.daily;
  }
}

export const quoteService = new QuoteService();
