/**
 * Master Prompt 06: Dynamic Human Connection Content Engine Types
 * Comprehensive taxonomy, metadata standards, and operational models.
 */

export type ContentPrimaryCategory = 
  | 'love' 
  | 'friendship' 
  | 'personal_development' 
  | 'psychology' 
  | 'deep_conversations';

export type ContentSubcategory =
  // Love subcategories
  | 'romantic_affection'
  | 'emotional_intimacy'
  | 'commitment'
  | 'trust'
  | 'attraction'
  | 'communication'
  | 'long_term_relationships'
  | 'dating'
  // Friendship subcategories
  | 'loyalty'
  | 'mutual_support'
  | 'friendship_development'
  | 'social_belonging'
  | 'conflict'
  | 'shared_experiences'
  // Personal Development subcategories
  | 'self_awareness'
  | 'confidence'
  | 'discipline'
  | 'identity'
  | 'values'
  | 'ambitions'
  | 'self_respect'
  // Psychology subcategories
  | 'human_behavior'
  | 'emotional_intelligence'
  | 'personality'
  | 'cognitive_biases'
  | 'social_behavior'
  | 'decision_making'
  // Deep Conversations subcategories
  | 'life_philosophy'
  | 'memories'
  | 'regrets'
  | 'dreams'
  | 'meaning'
  | 'hypothetical_situations'
  | 'moral_dilemmas';

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
  content: string; // The primary question, quote text, or prompt description
  primary_category: ContentPrimaryCategory;
  subcategory: ContentSubcategory;
  content_type: ContentType;
  depth_level: ContentDepthLevel;
  intended_context: ContentIntendedContext;
  follow_up_questions: string[];
  age_suitability: ContentAgeSuitability;
  content_warnings: string[];
  language: string;
  
  // Author & Attribution Quality Guardrails
  author_name: string;
  author_bio?: string | null;
  author_era?: string | null;
  attribution_type: ContentAttributionType;
  source: string;
  source_type: ContentSourceType;
  is_verified: boolean;
  
  // Interaction & Practical Details
  estimated_minutes: number;
  tags: string[];
  likes_count: number;
  shares_count: number;
  created_at: number;
  
  // Optional User Context (when retrieved in authenticated session)
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

export interface ContentFilterOptions {
  category?: ContentPrimaryCategory;
  subcategory?: ContentSubcategory;
  content_type?: ContentType;
  depth_level?: ContentDepthLevel;
  intended_context?: ContentIntendedContext;
  search?: string;
  exclude_seen?: boolean;
  exclude_skipped?: boolean;
  limit?: number;
  offset?: number;
}

export interface DailyContentBundle {
  date: string; // YYYY-MM-DD
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
    key: ContentSubcategory;
    label: string;
    description: string;
  }>;
}

export const CONTENT_TAXONOMY_META: Record<ContentPrimaryCategory, ContentCategoryMeta> = {
  love: {
    key: 'love',
    label: 'Love & Romance',
    description: 'Romantic affection, emotional intimacy, commitment, trust, and relationship dynamics.',
    accentColor: '#F43F5E',
    subcategories: [
      { key: 'romantic_affection', label: 'Romantic Affection', description: 'Expressions of warmth, tenderness, and attraction.' },
      { key: 'emotional_intimacy', label: 'Emotional Intimacy', description: 'Deep vulnerability and safe self-disclosure.' },
      { key: 'commitment', label: 'Commitment', description: 'Mutual devotion and shared long-term vision.' },
      { key: 'trust', label: 'Trust', description: 'Reliability, emotional safety, and transparency.' },
      { key: 'attraction', label: 'Attraction', description: 'Chemistry, presence, and magnetic draw.' },
      { key: 'communication', label: 'Communication', description: 'Honest dialogue and mutual attunement.' },
      { key: 'long_term_relationships', label: 'Long-Term Relationships', description: 'Navigating growth and endurance together.' },
      { key: 'dating', label: 'Dating', description: 'First encounters, discovery, and conscious pairing.' }
    ]
  },
  friendship: {
    key: 'friendship',
    label: 'Friendship & Belonging',
    description: 'Loyalty, mutual support, social belonging, and lifelong shared experiences.',
    accentColor: '#10B981',
    subcategories: [
      { key: 'loyalty', label: 'Loyalty', description: 'Standing by each other through changing seasons.' },
      { key: 'mutual_support', label: 'Mutual Support', description: 'Holding space in hardship and cheering in joy.' },
      { key: 'friendship_development', label: 'Friendship Development', description: 'Deepening acquaintance into enduring kinship.' },
      { key: 'social_belonging', label: 'Social Belonging', description: 'Feeling welcomed, understood, and at home in community.' },
      { key: 'conflict', label: 'Conflict & Resolution', description: 'Repairing misunderstandings with humility.' },
      { key: 'shared_experiences', label: 'Shared Experiences', description: 'Creating meaningful memories and rituals.' }
    ]
  },
  personal_development: {
    key: 'personal_development',
    label: 'Personal Growth & Identity',
    description: 'Self-awareness, discipline, integrity, personal values, and self-respect.',
    accentColor: '#F59E0B',
    subcategories: [
      { key: 'self_awareness', label: 'Self-Awareness', description: 'Observing internal patterns, triggers, and motives.' },
      { key: 'confidence', label: 'Confidence', description: 'Grounding self-worth in internal character.' },
      { key: 'discipline', label: 'Discipline', description: 'Aligning daily habits with enduring purpose.' },
      { key: 'identity', label: 'Identity', description: 'Understanding who you are beneath social roles.' },
      { key: 'values', label: 'Values', description: 'Clarifying the non-negotiable principles guiding your choices.' },
      { key: 'ambitions', label: 'Ambitions', description: 'Chasing constructive, meaningful aspirations.' },
      { key: 'self_respect', label: 'Self-Respect', description: 'Honoring your boundaries and dignity.' }
    ]
  },
  psychology: {
    key: 'psychology',
    label: 'Psychology & Human Behavior',
    description: 'Cognitive biases, emotional intelligence, social dynamics, and decision-making.',
    accentColor: '#8B5CF6',
    subcategories: [
      { key: 'human_behavior', label: 'Human Behavior', description: 'Why people act, react, and bond the way they do.' },
      { key: 'emotional_intelligence', label: 'Emotional Intelligence', description: 'Recognizing, naming, and regulating emotions.' },
      { key: 'personality', label: 'Personality', description: 'Individual temperaments, traits, and inclinations.' },
      { key: 'cognitive_biases', label: 'Cognitive Biases', description: 'Heuristics and perceptual distortions in human thought.' },
      { key: 'social_behavior', label: 'Social Behavior', description: 'Group dynamics, reciprocity, and social cues.' },
      { key: 'decision_making', label: 'Decision-Making', description: 'Balancing reason, intuition, and long-term consequences.' }
    ]
  },
  deep_conversations: {
    key: 'deep_conversations',
    label: 'Deep Philosophy & Meaning',
    description: 'Life philosophy, existential meaning, moral dilemmas, memories, and dreams.',
    accentColor: '#3B82F6',
    subcategories: [
      { key: 'life_philosophy', label: 'Life Philosophy', description: 'Worldviews, virtues, and how to live well.' },
      { key: 'memories', label: 'Memories & Nostalgia', description: 'Formative moments that shaped your worldview.' },
      { key: 'regrets', label: 'Regrets & Redemption', description: 'Learning from mistakes and forgiving past selves.' },
      { key: 'dreams', label: 'Dreams & Longings', description: 'What you silently hope for your future.' },
      { key: 'meaning', label: 'Meaning & Purpose', description: 'What makes the struggle of existence worthwhile.' },
      { key: 'hypothetical_situations', label: 'Hypotheticals', description: 'Thought experiments that reveal underlying priorities.' },
      { key: 'moral_dilemmas', label: 'Moral Dilemmas', description: 'Navigating competing virtues when there is no easy choice.' }
    ]
  }
};
