export type ContentPrimaryCategory = 
  | 'love' 
  | 'friendship' 
  | 'personal_development' 
  | 'psychology' 
  | 'deep_conversations';

export type ContentSubcategory = string;

export type ContentType =
  | 'daily_quote'
  | 'daily_question'
  | 'conversation_starter'
  | 'reflection_prompt'
  | 'relationship_tip'
  | 'friendship_tip'
  | 'educational_insight'
  | 'interactive_challenge'
  | 'personality_reflection'
  | 'couple_activity'
  | 'social_activity';

export type ContentDepthLevel = 
  | 'icebreaker' 
  | 'moderate' 
  | 'deep' 
  | 'vulnerable' 
  | 'philosophical';

export type ContentIntendedContext = 
  | 'solo_reflection' 
  | 'first_date' 
  | 'dating' 
  | 'couples' 
  | 'close_friends' 
  | 'small_group' 
  | 'networking' 
  | 'family';

export type ContentAgeSuitability = 
  | 'all_ages' 
  | 'teen_plus' 
  | 'adult_18_plus';

export type ContentAttributionType =
  | 'verified_quotation'
  | 'original_generated_reflection'
  | 'paraphrased_concept'
  | 'educational_summary';

export type ContentSourceType = 
  | 'curated_original' 
  | 'verified_source' 
  | 'public_domain' 
  | 'ai_generated';

export interface ContentItem {
  id: string;
  title: string;
  content: string;
  primary_category: ContentPrimaryCategory;
  subcategory: ContentSubcategory;
  content_type: ContentType;
  depth_level: ContentDepthLevel;
  intended_context: ContentIntendedContext;
  follow_up_questions: string[];
  age_suitability: ContentAgeSuitability;
  content_warnings: string[];
  language: string;
  author_name: string;
  author_bio?: string | null;
  author_era?: string | null;
  attribution_type: ContentAttributionType;
  source: string;
  source_type: ContentSourceType;
  is_verified: boolean;
  estimated_minutes: number;
  tags: string[];
  likes_count: number;
  shares_count: number;
  created_at: number;
  is_favorited?: boolean;
  is_answered?: boolean;
  user_answer?: string | null;
}

export interface ContentUserAnswer {
  id: string;
  user_id: string;
  content_id: string;
  answer_text: string;
  mood_state?: string | null;
  is_private: number;
  tags: string[];
  created_at: number;
  updated_at: number;
  content_item?: ContentItem;
}

export interface ContentReport {
  id: string;
  user_id: string;
  content_id: string;
  reason: 'inappropriate' | 'offensive' | 'factually_incorrect' | 'fake_attribution' | 'spam' | 'other';
  details?: string | null;
  status: 'pending' | 'reviewed' | 'dismissed' | 'actioned';
  created_at: number;
}

export interface DailyContentBundle {
  date: string;
  featured_question: ContentItem;
  featured_quote: ContentItem;
  featured_starter: ContentItem;
  featured_reflection: ContentItem;
  featured_tip: ContentItem;
  featured_challenge: ContentItem;
  theme: string;
  theme_description: string;
}

export interface ContentCategoryMeta {
  key: ContentPrimaryCategory;
  label: string;
  description: string;
  accentColor: string;
  subcategories: Array<{
    key: string;
    label: string;
    description: string;
  }>;
}

export interface ContentTaxonomyResponse {
  success: boolean;
  taxonomy: Record<ContentPrimaryCategory, ContentCategoryMeta>;
  categoryCounts: Record<string, number>;
  subcategoryCounts: Record<string, number>;
}
