import type { 
  LivingProfileData, 
  ProfileSection, 
  ProfileEntry, 
  ProfileQuestion, 
  ProfileAnswer, 
  ProfileTimelineEvent, 
  ProfileThought,
  ProfileVisibility,
  SectionType,
  EntryType,
  AnswerType,
  ThoughtType
} from '../types/livingProfile';

const API_BASE = 'http://127.0.0.1:3001/api/v1';

class LivingProfileApiClient {
  async getProfile(userId: string, viewerId: string = 'usr_me'): Promise<LivingProfileData> {
    const res = await fetch(`${API_BASE}/profile/living/${userId}?viewerId=${viewerId}`);
    if (!res.ok) {
      throw new Error(`Failed to fetch living profile: ${res.statusText}`);
    }
    return res.json();
  }

  async createSection(payload: {
    userId?: string;
    title: string;
    description?: string;
    section_type?: SectionType;
    icon?: string;
    visibility?: ProfileVisibility;
    is_pinned?: number;
  }): Promise<ProfileSection> {
    const res = await fetch(`${API_BASE}/profile/sections`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    return data.section;
  }

  async updateSection(id: string, payload: Partial<ProfileSection>): Promise<ProfileSection> {
    const res = await fetch(`${API_BASE}/profile/sections/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    return data.section;
  }

  async deleteSection(id: string): Promise<void> {
    await fetch(`${API_BASE}/profile/sections/${id}`, { method: 'DELETE' });
  }

  async reorderSections(sectionIds: string[]): Promise<void> {
    await fetch(`${API_BASE}/profile/sections/reorder`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sectionIds })
    });
  }

  async createEntry(payload: {
    sectionId: string;
    userId?: string;
    entry_type?: EntryType;
    title?: string;
    content: string;
    structured_content?: any;
    visibility?: ProfileVisibility;
    is_pinned?: number;
    status?: 'draft' | 'published';
  }): Promise<ProfileEntry> {
    const res = await fetch(`${API_BASE}/profile/entries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    return data.entry;
  }

  async updateEntry(id: string, payload: Partial<ProfileEntry>): Promise<ProfileEntry> {
    const res = await fetch(`${API_BASE}/profile/entries/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    return data.entry;
  }

  async deleteEntry(id: string): Promise<void> {
    await fetch(`${API_BASE}/profile/entries/${id}`, { method: 'DELETE' });
  }

  async createQuestion(payload: {
    userId?: string;
    sectionId?: string | null;
    question: string;
    description?: string;
    answer_type?: AnswerType;
    options?: any;
    visibility?: ProfileVisibility;
    allow_responses?: number;
  }): Promise<ProfileQuestion> {
    const res = await fetch(`${API_BASE}/profile/questions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    return data.question;
  }

  async answerQuestion(questionId: string, payload: {
    userId?: string;
    answer_content: string;
    structured_answer?: any;
    visibility?: ProfileVisibility;
  }): Promise<ProfileAnswer> {
    const res = await fetch(`${API_BASE}/profile/questions/${questionId}/answer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    return data.answer;
  }

  async deleteQuestion(id: string): Promise<void> {
    await fetch(`${API_BASE}/profile/questions/${id}`, { method: 'DELETE' });
  }

  async createTimelineEvent(payload: {
    userId?: string;
    title: string;
    description: string;
    event_date?: string;
    date_precision?: 'exact' | 'year_month' | 'year' | 'approximate';
    category?: string;
    personal_significance?: string;
    lessons_learned?: string;
    media_url?: string | null;
    visibility?: ProfileVisibility;
  }): Promise<ProfileTimelineEvent> {
    const res = await fetch(`${API_BASE}/profile/timeline`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    return data.event;
  }

  async deleteTimelineEvent(id: string): Promise<void> {
    await fetch(`${API_BASE}/profile/timeline/${id}`, { method: 'DELETE' });
  }

  async createThought(payload: {
    userId?: string;
    title?: string;
    content: string;
    thought_type?: ThoughtType;
    tags?: string;
    is_pinned?: number;
    status?: 'draft' | 'published';
    visibility?: ProfileVisibility;
  }): Promise<ProfileThought> {
    const res = await fetch(`${API_BASE}/profile/thoughts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    return data.thought;
  }

  async deleteThought(id: string): Promise<void> {
    await fetch(`${API_BASE}/profile/thoughts/${id}`, { method: 'DELETE' });
  }

  async getAiAssistance(tool: 'polish' | 'suggest_questions' | 'turn_into_bio' | 'summarize', content?: string): Promise<{ suggestion: string; disclaimer: string }> {
    const res = await fetch(`${API_BASE}/profile/ai/assist`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tool, content })
    });
    return res.json();
  }

  async exportProfile(userId: string = 'usr_me'): Promise<any> {
    const res = await fetch(`${API_BASE}/profile/export?userId=${userId}`);
    return res.json();
  }

  async deleteProfileData(userId: string = 'usr_me'): Promise<void> {
    await fetch(`${API_BASE}/profile/data`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    });
  }
}

export const livingProfileClient = new LivingProfileApiClient();
