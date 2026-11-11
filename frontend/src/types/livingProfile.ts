export type ProfileVisibility = 'public' | 'matches' | 'friends' | 'selected' | 'private';

export type SectionType = 
  | 'personal_identity' 
  | 'personality' 
  | 'psychology' 
  | 'beliefs' 
  | 'qualities' 
  | 'skills' 
  | 'interests' 
  | 'timeline' 
  | 'writing' 
  | 'custom';

export type EntryType = 
  | 'text' 
  | 'qa' 
  | 'thought' 
  | 'trait' 
  | 'reflection' 
  | 'list' 
  | 'media';

export type AnswerType = 
  | 'short_text' 
  | 'long_text' 
  | 'yes_no' 
  | 'single_choice' 
  | 'multi_choice' 
  | 'number' 
  | 'rating_scale' 
  | 'slider' 
  | 'ranked_list' 
  | 'media';

export type ThoughtType = 
  | 'thought' 
  | 'opinion' 
  | 'confession' 
  | 'reflection' 
  | 'essay' 
  | 'quote';

export interface ProfileEntry {
  id: string;
  section_id: string;
  user_id: string;
  entry_type: EntryType;
  title?: string;
  content: string;
  structured_content?: string | null;
  visibility: ProfileVisibility;
  sort_order: number;
  is_pinned: number;
  status: 'draft' | 'published' | 'archived';
  created_at: number;
  updated_at: number;
}

export interface ProfileSection {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  section_type: SectionType;
  icon?: string;
  parent_section_id?: string | null;
  sort_order: number;
  visibility: ProfileVisibility;
  is_pinned: number;
  is_archived: number;
  created_at: number;
  updated_at: number;
  entries?: ProfileEntry[];
}

export interface ProfileAnswer {
  id: string;
  question_id: string;
  user_id: string;
  respondent_name?: string;
  respondent_avatar?: string;
  answer_content: string;
  structured_answer?: string | null;
  visibility: ProfileVisibility;
  created_at: number;
  updated_at: number;
}

export interface ProfileQuestion {
  id: string;
  user_id: string;
  section_id?: string | null;
  question: string;
  description?: string;
  answer_type: AnswerType;
  options?: string | null;
  visibility: ProfileVisibility;
  allow_responses: number;
  sort_order: number;
  created_at: number;
  updated_at: number;
  answers?: ProfileAnswer[];
}

export interface ProfileTimelineEvent {
  id: string;
  user_id: string;
  title: string;
  description: string;
  event_date?: string;
  date_precision: 'exact' | 'year_month' | 'year' | 'approximate';
  category: string;
  personal_significance?: string;
  lessons_learned?: string;
  media_url?: string | null;
  visibility: ProfileVisibility;
  sort_order: number;
  created_at: number;
  updated_at: number;
}

export interface ProfileThought {
  id: string;
  user_id: string;
  title?: string;
  content: string;
  thought_type: ThoughtType;
  tags?: string;
  is_pinned: number;
  status: 'draft' | 'published' | 'archived';
  visibility: ProfileVisibility;
  created_at: number;
  updated_at: number;
}

export interface LivingProfileData {
  user: {
    id: string;
    name: string;
    username: string;
    avatar_url: string;
    is_verified: number;
    last_seen_at: number;
    status_text?: string;
  };
  viewerId: string;
  accessLevel: 'owner' | 'matches' | 'friends' | 'public';
  sections: ProfileSection[];
  questions: ProfileQuestion[];
  timeline: ProfileTimelineEvent[];
  thoughts: ProfileThought[];
}
