import type { 
  LifeYear, 
  LifeChapter, 
  LifeEvent, 
  LifeReflection, 
  TimelineVisibility 
} from '../types/lifeTimeline';

import { API_BASE_V1 as API_BASE } from './apiConfig';

class LifeTimelineApiClient {
  async getYears(userId: string, viewerId: string = 'usr_me'): Promise<LifeYear[]> {
    const res = await fetch(`${API_BASE}/timeline/years/${userId}?viewerId=${viewerId}`);
    const data = await res.json();
    return data.years || [];
  }

  async getYearDetails(userId: string, yearNumber: number, viewerId: string = 'usr_me'): Promise<{
    year: LifeYear;
    events: LifeEvent[];
    review: LifeReflection | null;
  }> {
    const res = await fetch(`${API_BASE}/timeline/year/${userId}/${yearNumber}?viewerId=${viewerId}`);
    return res.json();
  }

  async createOrUpdateYear(payload: {
    userId?: string;
    year_number: number;
    chapter_title?: string;
    summary?: string;
    cover_image_url?: string | null;
    is_future_year?: number;
    visibility?: TimelineVisibility;
  }): Promise<LifeYear> {
    const res = await fetch(`${API_BASE}/timeline/years`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    return data.year;
  }

  async getChapters(userId: string, viewerId: string = 'usr_me'): Promise<LifeChapter[]> {
    const res = await fetch(`${API_BASE}/timeline/chapters/${userId}?viewerId=${viewerId}`);
    const data = await res.json();
    return data.chapters || [];
  }

  async createChapter(payload: {
    userId?: string;
    title: string;
    description?: string;
    start_year: number;
    end_year?: number | null;
    icon?: string;
    cover_image_url?: string | null;
    visibility?: TimelineVisibility;
  }): Promise<LifeChapter> {
    const res = await fetch(`${API_BASE}/timeline/chapters`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    return data.chapter;
  }

  async getEvents(userId: string, options?: {
    viewerId?: string;
    year?: number;
    category?: string;
    isMilestone?: boolean;
    search?: string;
  }): Promise<LifeEvent[]> {
    const params = new URLSearchParams();
    if (options?.viewerId) params.set('viewerId', options.viewerId);
    if (options?.year) params.set('year', options.year.toString());
    if (options?.category) params.set('category', options.category);
    if (options?.isMilestone) params.set('isMilestone', '1');
    if (options?.search) params.set('search', options.search);

    const res = await fetch(`${API_BASE}/timeline/events/${userId}?${params.toString()}`);
    const data = await res.json();
    return data.events || [];
  }

  async createEvent(payload: Partial<LifeEvent>): Promise<LifeEvent> {
    const res = await fetch(`${API_BASE}/timeline/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    return data.event;
  }

  async updateEvent(id: string, payload: Partial<LifeEvent>): Promise<LifeEvent> {
    const res = await fetch(`${API_BASE}/timeline/events/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    return data.event;
  }

  async deleteEvent(id: string): Promise<void> {
    await fetch(`${API_BASE}/timeline/events/${id}`, { method: 'DELETE' });
  }

  async getReflections(userId: string, options?: {
    viewerId?: string;
    type?: 'year_end_review' | 'then_vs_now';
  }): Promise<LifeReflection[]> {
    const params = new URLSearchParams();
    if (options?.viewerId) params.set('viewerId', options.viewerId);
    if (options?.type) params.set('type', options.type);

    const res = await fetch(`${API_BASE}/timeline/reflections/${userId}?${params.toString()}`);
    const data = await res.json();
    return data.reflections || [];
  }

  async createReflection(payload: {
    userId?: string;
    reflection_type: 'year_end_review' | 'then_vs_now';
    year_number?: number | null;
    compare_year_a?: number | null;
    compare_year_b?: number | null;
    title: string;
    content_json: any;
    visibility?: TimelineVisibility;
  }): Promise<LifeReflection> {
    const res = await fetch(`${API_BASE}/timeline/reflections`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    return data.reflection;
  }
}

export const lifeTimelineClient = new LifeTimelineApiClient();
