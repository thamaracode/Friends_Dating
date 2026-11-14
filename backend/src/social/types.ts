/**
 * Master Engineering Prompt 02: Types and Interfaces for Questions, Posts, Feed & Content Discovery.
 */

export type QuestionPrimaryCategory =
  | 'self_discovery'
  | 'love_and_romance'
  | 'friendship'
  | 'emotional_intelligence'
  | 'life_experiences'
  | 'imagination_and_creativity'
  | 'fun_and_social'
  | 'deep_conversations';

export type QuestionDepthLevel = 'casual' | 'reflective' | 'deep' | 'philosophical';
export type QuestionDifficulty = 'easy' | 'medium' | 'advanced';
export type QuestionSensitivity = 'general' | 'vulnerable' | 'intimate' | 'existential';
export type QuestionApprovalStatus = 'draft' | 'review' | 'approved' | 'rejected' | 'archived';

export interface QuestionEcosystemItem {
  id: string;
  question_text: string;
  primary_category: QuestionPrimaryCategory;
  subcategory: string;
  depth_level: QuestionDepthLevel;
  difficulty: QuestionDifficulty;
  sensitivity: QuestionSensitivity;
  audience_suitability: string;
  context_tip?: string;
  follow_up_questions: string[];
  content_tags: string[];
  language: string;
  author_id?: string | null;
  author_name: string;
  source_name: string;
  approval_status: QuestionApprovalStatus;
  is_daily_eligible: boolean;
  likes_count: number;
  answers_count: number;
  views_count: number;
  shares_count: number;
  created_at: number;
  updated_at: number;
  // Dynamic fields per user context
  is_viewed?: boolean;
  is_saved?: boolean;
  is_answered?: boolean;
  user_answer?: QuestionAnswerItem | null;
}

export type QuestionAnswerType =
  | 'short_text'
  | 'long_text'
  | 'single_choice'
  | 'multiple_choice'
  | 'poll_response'
  | 'image'
  | 'structured_reflection';

export type ContentVisibility = 'public' | 'connections' | 'friends' | 'selected' | 'private' | 'custom';

export interface QuestionAnswerItem {
  id: string;
  question_id: string;
  user_id: string;
  author_name?: string;
  author_avatar?: string;
  answer_type: QuestionAnswerType;
  answer_text: string;
  media_urls: string[];
  mood_state?: string;
  visibility: ContentVisibility;
  custom_audience_ids?: string[];
  attach_to_profile: boolean;
  likes_count: number;
  comments_count: number;
  created_at: number;
  updated_at: number;
  is_liked?: boolean;
}

export type PostType =
  | 'text'
  | 'image'
  | 'video'
  | 'audio'
  | 'question'
  | 'poll'
  | 'story'
  | 'experience'
  | 'thought'
  | 'reflection'
  | 'quote'
  | 'link'
  | 'multi_image'
  | 'carousel'
  | 'shared_answer'
  | 'event'
  | 'challenge';

export interface SocialPostItem {
  id: string;
  user_id: string;
  author_name: string;
  author_avatar: string;
  author_username?: string;
  post_type: PostType;
  title?: string;
  content: string;
  summary?: string;
  media_urls: string[];
  attachment_json?: any;
  question_id?: string;
  poll_id?: string;
  visibility: ContentVisibility;
  custom_audience_ids?: string[];
  content_warning?: string;
  location_name?: string;
  tags: string[];
  mentions: string[];
  is_pinned: boolean;
  is_archived: boolean;
  comments_disabled: boolean;
  is_deleted: boolean;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  bookmarks_count: number;
  views_count: number;
  created_at: number;
  updated_at: number;
  // Viewer interaction state
  is_liked?: boolean;
  user_reaction?: SocialReactionType | null;
  is_bookmarked?: boolean;
  is_author?: boolean;
}

export interface SocialPostDraft {
  id: string;
  user_id: string;
  post_type: PostType;
  title?: string;
  content: string;
  media_urls: string[];
  attachment_json?: any;
  visibility: ContentVisibility;
  tags: string[];
  created_at: number;
  updated_at: number;
}

export type TargetType = 'post' | 'comment' | 'question' | 'answer';

export interface SocialCommentItem {
  id: string;
  target_type: TargetType;
  target_id: string;
  parent_comment_id?: string | null;
  user_id: string;
  author_name: string;
  author_avatar: string;
  author_username?: string;
  content: string;
  media_url?: string;
  depth_level: number;
  mentions: string[];
  is_edited: boolean;
  is_deleted: boolean;
  likes_count: number;
  created_at: number;
  updated_at: number;
  replies?: SocialCommentItem[];
  is_liked?: boolean;
}

export type SocialReactionType = 'like' | 'love' | 'laugh' | 'thoughtful' | 'support' | 'celebrate';

export interface SocialReactionSummary {
  total: number;
  breakdown: Record<SocialReactionType, number>;
  user_reaction: SocialReactionType | null;
}

export interface SocialCollectionItem {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  is_private: boolean;
  cover_url?: string;
  sort_order: number;
  items_count: number;
  created_at: number;
  updated_at: number;
}

export interface SocialBookmarkItem {
  id: string;
  user_id: string;
  target_type: TargetType;
  target_id: string;
  collection_id?: string | null;
  note?: string;
  created_at: number;
  target?: SocialPostItem | QuestionEcosystemItem | null;
}

export type FeedMode = 'for_you' | 'following' | 'friends' | 'questions' | 'trending' | 'latest' | 'saved';

export interface FeedQueryParams {
  feed_mode?: FeedMode;
  category?: string;
  tag?: string;
  cursor?: string; // timestamp_id
  limit?: number;
  exclude_ids?: string[];
  search_query?: string;
}

export interface FeedResponse {
  items: SocialPostItem[];
  next_cursor?: string | null;
  has_more: boolean;
  feed_mode: FeedMode;
  total_count?: number;
}

export interface ContentModerationReport {
  id: string;
  reporter_id: string;
  target_type: 'post' | 'comment' | 'question' | 'answer' | 'user';
  target_id: string;
  reason: 'harassment' | 'hate_speech' | 'spam' | 'nudity' | 'violence' | 'misinformation' | 'other';
  details?: string;
  status: 'pending' | 'under_review' | 'resolved_action_taken' | 'resolved_dismissed';
  reviewed_by_admin_id?: string;
  admin_notes?: string;
  created_at: number;
  resolved_at?: number;
}
