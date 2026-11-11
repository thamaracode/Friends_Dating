export type TimelineVisibility = 'public' | 'matches' | 'friends' | 'selected' | 'private';

export interface LifeYear {
  id: string;
  user_id: string;
  year_number: number;
  chapter_title?: string;
  summary?: string;
  cover_image_url?: string;
  is_future_year: number;
  visibility: TimelineVisibility;
  sort_order: number;
  created_at: number;
  updated_at: number;
  event_count?: number;
  has_review?: number;
}

export interface LifeChapter {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  start_year: number;
  end_year?: number | null;
  icon?: string;
  cover_image_url?: string;
  visibility: TimelineVisibility;
  sort_order: number;
  created_at: number;
  updated_at: number;
  event_count?: number;
}

export interface LifeEvent {
  id: string;
  user_id: string;
  year_number: number;
  chapter_id?: string | null;
  chapter_title?: string;
  chapter_icon?: string;
  title: string;
  description: string;
  date_display?: string;
  date_precision: 'exact' | 'month_year' | 'year_only' | 'approximate' | 'unknown';
  is_planned: number;
  is_milestone: number;
  category: string;
  tags?: string;
  location?: string;
  people_involved?: string;
  personal_significance?: string;
  lessons_learned?: string;
  emotional_reflection?: string;
  media_urls?: string;
  visibility: TimelineVisibility;
  status: 'draft' | 'published' | 'archived';
  sort_order: number;
  created_at: number;
  updated_at: number;
}

export interface LifeReflection {
  id: string;
  user_id: string;
  reflection_type: 'year_end_review' | 'then_vs_now';
  year_number?: number | null;
  compare_year_a?: number | null;
  compare_year_b?: number | null;
  title: string;
  content_json: string;
  visibility: TimelineVisibility;
  created_at: number;
  updated_at: number;
}
