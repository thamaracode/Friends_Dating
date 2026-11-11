import type { ProfileMarkdown, MarkdownVisibility } from '../types/markdownProfile';

const API_BASE = 'http://127.0.0.1:3001/api/v1';

class MarkdownProfileApiClient {
  async getMarkdown(userId: string, viewerId: string = 'usr_me'): Promise<{
    markdown: ProfileMarkdown | null;
    characterCount?: number;
    maxLimit?: number;
    isOwner?: boolean;
    isRestricted?: boolean;
    requiredVisibility?: MarkdownVisibility;
  }> {
    const res = await fetch(`${API_BASE}/profile/markdown/${userId}?viewerId=${viewerId}`);
    return res.json();
  }

  async saveMarkdown(payload: {
    userId?: string;
    title?: string;
    content: string;
    visibility?: MarkdownVisibility;
  }): Promise<{
    success: boolean;
    markdown?: ProfileMarkdown;
    characterCount?: number;
    remainingCharacters?: number;
    error?: string;
  }> {
    const res = await fetch(`${API_BASE}/profile/markdown`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return res.json();
  }

  async deleteMarkdown(userId: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/profile/markdown/${userId}`, {
      method: 'DELETE'
    });
    return res.json();
  }
}

export const markdownProfileClient = new MarkdownProfileApiClient();
