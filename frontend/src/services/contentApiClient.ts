import { BACKEND_URL } from './apiConfig';
import {
  ContentItem,
  ContentUserAnswer,
  ContentReport,
  DailyContentBundle,
  ContentTaxonomyResponse
} from '../types/contentEngine';

const BASE = `${BACKEND_URL}/api/v1/content`;

export const contentApiClient = {
  async getDailyBundle(date?: string, userId: string = 'usr_me'): Promise<DailyContentBundle> {
    const url = new URL(`${BASE}/daily`);
    if (date) url.searchParams.set('date', date);
    const res = await fetch(url.toString(), {
      headers: { 'x-user-id': userId }
    });
    if (!res.ok) throw new Error('Failed to fetch daily content bundle');
    const json = await res.json();
    return json.bundle;
  },

  async getDailyHistory(limit: number = 7, offset: number = 0, userId: string = 'usr_me'): Promise<DailyContentBundle[]> {
    const url = new URL(`${BASE}/daily/history`);
    url.searchParams.set('limit', String(limit));
    url.searchParams.set('offset', String(offset));
    const res = await fetch(url.toString(), {
      headers: { 'x-user-id': userId }
    });
    if (!res.ok) throw new Error('Failed to fetch daily history');
    const json = await res.json();
    return json.bundles;
  },

  async queryContent(filters: {
    category?: string;
    subcategory?: string;
    content_type?: string;
    depth_level?: string;
    intended_context?: string;
    search?: string;
    exclude_seen?: boolean;
    exclude_skipped?: boolean;
    limit?: number;
    offset?: number;
  } = {}, userId: string = 'usr_me'): Promise<{ items: ContentItem[]; total: number }> {
    const url = new URL(`${BASE}/items`);
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== undefined && v !== '') {
        url.searchParams.set(k, String(v));
      }
    });
    const res = await fetch(url.toString(), {
      headers: { 'x-user-id': userId }
    });
    if (!res.ok) throw new Error('Failed to query content catalog');
    const json = await res.json();
    return { items: json.items, total: json.total };
  },

  async getRandomItem(filters: {
    category?: string;
    content_type?: string;
    depth_level?: string;
  } = {}, userId: string = 'usr_me'): Promise<ContentItem | null> {
    const url = new URL(`${BASE}/items/random`);
    Object.entries(filters).forEach(([k, v]) => {
      if (v) url.searchParams.set(k, String(v));
    });
    const res = await fetch(url.toString(), {
      headers: { 'x-user-id': userId }
    });
    if (!res.ok) throw new Error('Failed to fetch random question');
    const json = await res.json();
    return json.item;
  },

  async refreshItem(filters: {
    category?: string;
    content_type?: string;
    depth_level?: string;
  } = {}, currentId?: string, userId: string = 'usr_me'): Promise<ContentItem | null> {
    const url = new URL(`${BASE}/items/refresh`);
    if (currentId) url.searchParams.set('currentId', currentId);
    Object.entries(filters).forEach(([k, v]) => {
      if (v) url.searchParams.set(k, String(v));
    });
    const res = await fetch(url.toString(), {
      headers: { 'x-user-id': userId }
    });
    if (!res.ok) throw new Error('Failed to refresh question');
    const json = await res.json();
    return json.item;
  },

  async toggleFavorite(contentId: string, userId: string = 'usr_me'): Promise<{ favorited: boolean }> {
    const res = await fetch(`${BASE}/items/${contentId}/favorite`, {
      method: 'POST',
      headers: { 'x-user-id': userId }
    });
    if (!res.ok) throw new Error('Failed to toggle favorite');
    return res.json();
  },

  async getFavorites(limit: number = 20, offset: number = 0, userId: string = 'usr_me'): Promise<ContentItem[]> {
    const url = new URL(`${BASE}/favorites`);
    url.searchParams.set('limit', String(limit));
    url.searchParams.set('offset', String(offset));
    const res = await fetch(url.toString(), {
      headers: { 'x-user-id': userId }
    });
    if (!res.ok) throw new Error('Failed to fetch favorites');
    const json = await res.json();
    return json.favorites;
  },

  async answerQuestion(contentId: string, answerText: string, moodState?: string, tags?: string[], userId: string = 'usr_me'): Promise<ContentUserAnswer> {
    const res = await fetch(`${BASE}/items/${contentId}/answer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': userId
      },
      body: JSON.stringify({ answerText, moodState, tags })
    });
    if (!res.ok) throw new Error('Failed to save answer');
    const json = await res.json();
    return json.answer;
  },

  async getUserAnswers(contentId?: string, userId: string = 'usr_me'): Promise<ContentUserAnswer[]> {
    const url = new URL(`${BASE}/answers`);
    if (contentId) url.searchParams.set('contentId', contentId);
    const res = await fetch(url.toString(), {
      headers: { 'x-user-id': userId }
    });
    if (!res.ok) throw new Error('Failed to fetch answers');
    const json = await res.json();
    return json.answers;
  },

  async deleteAnswer(answerId: string, userId: string = 'usr_me'): Promise<void> {
    const res = await fetch(`${BASE}/answers/${answerId}`, {
      method: 'DELETE',
      headers: { 'x-user-id': userId }
    });
    if (!res.ok) throw new Error('Failed to delete answer');
  },

  async skipItem(contentId: string, reason?: string, userId: string = 'usr_me'): Promise<void> {
    const res = await fetch(`${BASE}/items/${contentId}/skip`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': userId
      },
      body: JSON.stringify({ reason })
    });
    if (!res.ok) throw new Error('Failed to skip item');
  },

  async reportContent(contentId: string, reason: string, details?: string, userId: string = 'usr_me'): Promise<ContentReport> {
    const res = await fetch(`${BASE}/items/${contentId}/report`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': userId
      },
      body: JSON.stringify({ reason, details })
    });
    if (!res.ok) throw new Error('Failed to report content');
    const json = await res.json();
    return json.report;
  },

  async getTaxonomy(): Promise<ContentTaxonomyResponse> {
    const res = await fetch(`${BASE}/categories`);
    if (!res.ok) throw new Error('Failed to fetch content taxonomy');
    return res.json();
  },

  async exportUserData(userId: string = 'usr_me') {
    const res = await fetch(`${BASE}/export`, {
      headers: { 'x-user-id': userId }
    });
    if (!res.ok) throw new Error('Failed to export content responses');
    return res.json();
  }
};
