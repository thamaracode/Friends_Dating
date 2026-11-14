import type {
  SoulPrompt,
  SoulPromptResponse,
  ResponseVisibility,
  MoodTag,
  ResonanceType,
  CompatibilityInsight,
  UserSoulJournal
} from '../types/soulPrompt';

const API_BASE = '/api/v1/soul-prompts';

export const DEFAULT_USER_ID = 'usr_me';

export const FALLBACK_TODAY_PROMPT: SoulPrompt = {
  id: 'sp_unspoken_expectations',
  category: 'unspoken_truths',
  promptQuestion: 'What is an unspoken expectation you used to bring into relationships that you have since outgrown?',
  philosophicalContext: 'We often expect partners to read our minds without realizing we are asking them to heal wounds they never created.',
  dimensionTag: '#EmotionalSafety',
  displayDate: new Date().toISOString().split('T')[0],
  createdAt: Date.now() - 3600000 * 12
};

export class SoulPromptsApiClient {
  /**
   * Fetches today's featured introspective soul prompt.
   */
  public static async getTodayPrompt(userId: string = DEFAULT_USER_ID): Promise<{
    prompt: SoulPrompt;
    myResponse: SoulPromptResponse | null;
    totalResponsesCount: number;
  }> {
    try {
      const res = await fetch(`${API_BASE}/today?userId=${encodeURIComponent(userId)}`, {
        headers: { 'x-user-id': userId }
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return {
        prompt: data.prompt || FALLBACK_TODAY_PROMPT,
        myResponse: data.myResponse || null,
        totalResponsesCount: data.totalResponsesCount || 0
      };
    } catch (err) {
      console.warn('[SoulPrompts] Failed to fetch today prompt from API, using fallback:', err);
      return {
        prompt: FALLBACK_TODAY_PROMPT,
        myResponse: null,
        totalResponsesCount: 38
      };
    }
  }

  /**
   * Fetches all curated introspective soul prompts.
   */
  public static async getAllPrompts(): Promise<SoulPrompt[]> {
    try {
      const res = await fetch(`${API_BASE}/all`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return data.prompts || [FALLBACK_TODAY_PROMPT];
    } catch (err) {
      console.warn('[SoulPrompts] Failed to fetch all prompts, using fallback:', err);
      return [FALLBACK_TODAY_PROMPT];
    }
  }

  /**
   * Submits or updates a reflection to a soul prompt.
   */
  public static async respondToPrompt(
    promptId: string,
    payload: {
      responseText: string;
      visibility?: ResponseVisibility;
      moodTag?: MoodTag;
      customAlias?: string;
    },
    userId: string = DEFAULT_USER_ID
  ): Promise<SoulPromptResponse> {
    const res = await fetch(`${API_BASE}/${encodeURIComponent(promptId)}/respond`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': userId
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${res.status}`);
    }

    const data = await res.json();
    return data.response;
  }

  /**
   * Fetches community answers for a prompt with empathy stats.
   */
  public static async getCommunityResponses(
    promptId: string,
    userId: string = DEFAULT_USER_ID,
    limit: number = 50
  ): Promise<SoulPromptResponse[]> {
    try {
      const res = await fetch(`${API_BASE}/${encodeURIComponent(promptId)}/community?userId=${encodeURIComponent(userId)}&limit=${limit}`, {
        headers: { 'x-user-id': userId }
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return data.responses || [];
    } catch (err) {
      console.warn('[SoulPrompts] Failed to fetch community responses:', err);
      return [];
    }
  }

  /**
   * Toggles an empathy resonance reaction on a peer reflection.
   */
  public static async submitResonance(
    responseId: string,
    reactionType: ResonanceType,
    userId: string = DEFAULT_USER_ID
  ): Promise<{
    active: boolean;
    reactionFeltDeeply: number;
    reactionMindShifted: number;
    reactionInspired: number;
  }> {
    const res = await fetch(`${API_BASE}/responses/${encodeURIComponent(responseId)}/resonate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': userId
      },
      body: JSON.stringify({ reactionType })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `HTTP ${res.status}`);
    }

    const data = await res.json();
    return {
      active: Boolean(data.active),
      reactionFeltDeeply: data.reactionFeltDeeply || 0,
      reactionMindShifted: data.reactionMindShifted || 0,
      reactionInspired: data.reactionInspired || 0
    };
  }

  /**
   * Retrieves the current user's personal soul journal history & mood breakdown.
   */
  public static async getUserJournal(userId: string = DEFAULT_USER_ID): Promise<UserSoulJournal> {
    try {
      const res = await fetch(`${API_BASE}/my-journal?userId=${encodeURIComponent(userId)}`, {
        headers: { 'x-user-id': userId }
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return {
        totalEntries: data.totalEntries || 0,
        moodStats: data.moodStats || {},
        entries: data.entries || []
      };
    } catch (err) {
      console.warn('[SoulPrompts] Failed to load user journal:', err);
      return {
        totalEntries: 0,
        moodStats: {},
        entries: []
      };
    }
  }

  /**
   * Calculates dynamic emotional & philosophical compatibility with another member.
   */
  public static async computeCompatibility(
    targetUserId: string,
    userId: string = DEFAULT_USER_ID
  ): Promise<CompatibilityInsight> {
    const res = await fetch(`${API_BASE}/compatibility/${encodeURIComponent(targetUserId)}?userId=${encodeURIComponent(userId)}`, {
      headers: { 'x-user-id': userId }
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `HTTP ${res.status}`);
    }

    return await res.json();
  }

  /**
   * Initiates a direct conversation with a contextual prompt icebreaker snippet.
   */
  public static async createPromptIcebreaker(
    responseId: string,
    userId: string = DEFAULT_USER_ID
  ): Promise<{
    conversationId: string;
    icebreakerMessage: string;
    partnerName: string;
  }> {
    const res = await fetch(`${API_BASE}/responses/${encodeURIComponent(responseId)}/icebreaker`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': userId
      }
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `HTTP ${res.status}`);
    }

    return await res.json();
  }
}
