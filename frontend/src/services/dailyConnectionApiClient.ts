import type {
  DailyTab,
  DailyPreferences,
  DailyStreak,
  DailyContentCategory,
  DailyAssignmentItem,
  DailyTodayResponse
} from '../types/dailyConnection';

const BASE_URL = 'http://127.0.0.1:3001/api/v1/daily-content';

class DailyConnectionApiClient {
  async getToday(userId: string = 'usr_me', date?: string, tab?: DailyTab): Promise<DailyTodayResponse> {
    const params = new URLSearchParams({ userId });
    if (date) params.append('date', date);
    if (tab) params.append('tab', tab);

    const res = await fetch(`${BASE_URL}/today?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch today daily editions');
    return res.json();
  }

  async getCategories(): Promise<DailyContentCategory[]> {
    const res = await fetch(`${BASE_URL}/categories`);
    if (!res.ok) throw new Error('Failed to fetch categories');
    const data = await res.json();
    return data.categories || [];
  }

  async getPreferences(userId: string = 'usr_me'): Promise<{ preferences: DailyPreferences; streak: DailyStreak }> {
    const res = await fetch(`${BASE_URL}/preferences?userId=${userId}`);
    if (!res.ok) throw new Error('Failed to fetch member preferences');
    return res.json();
  }

  async updatePreferences(prefs: Partial<DailyPreferences> & { userId?: string }): Promise<boolean> {
    const res = await fetch(`${BASE_URL}/preferences`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(prefs)
    });
    if (!res.ok) throw new Error('Failed to update preferences');
    const data = await res.json();
    return data.success;
  }

  async submitReflection(assignmentId: string, reflectionAnswer: string, userId: string = 'usr_me'): Promise<boolean> {
    const res = await fetch(`${BASE_URL}/reflect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, assignmentId, reflectionAnswer })
    });
    if (!res.ok) throw new Error('Failed to save reflection');
    const data = await res.json();
    return data.success;
  }

  async completeChallenge(assignmentId: string, completed: boolean = true, userId: string = 'usr_me'): Promise<boolean> {
    const res = await fetch(`${BASE_URL}/challenge`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, assignmentId, completed })
    });
    if (!res.ok) throw new Error('Failed to update challenge status');
    const data = await res.json();
    return data.success;
  }

  async toggleFeedback(contentId: string, action: 'like' | 'save', userId: string = 'usr_me'): Promise<boolean> {
    const res = await fetch(`${BASE_URL}/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, contentId, action })
    });
    if (!res.ok) throw new Error('Failed to toggle feedback');
    const data = await res.json();
    return data.active;
  }

  async getSaved(userId: string = 'usr_me'): Promise<DailyAssignmentItem[]> {
    const res = await fetch(`${BASE_URL}/saved?userId=${userId}`);
    if (!res.ok) throw new Error('Failed to fetch saved wisdom');
    const data = await res.json();
    return data.items || [];
  }

  async getHistory(userId: string = 'usr_me'): Promise<DailyAssignmentItem[]> {
    const res = await fetch(`${BASE_URL}/history?userId=${userId}`);
    if (!res.ok) throw new Error('Failed to fetch daily history');
    const data = await res.json();
    return data.history || [];
  }
}

export const dailyConnectionClient = new DailyConnectionApiClient();
