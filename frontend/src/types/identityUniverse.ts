export type IdentityClassification = 
  | 'real_identity'
  | 'fictional_character'
  | 'inspired_character'
  | 'alternate_self'
  | 'aspirational_self'
  | 'historical_persona'
  | 'cinematic_persona'
  | 'fantasy_identity'
  | 'anonymous_identity'
  | 'custom';

export interface UserIdentity {
  id: string;
  user_id: string;
  name: string;
  display_title?: string;
  classification: IdentityClassification;
  avatar_url?: string;
  cover_image_url?: string;
  description?: string;
  biography?: string;
  personality_traits: string[];
  interests: string[];
  skills: string[];
  universe_id?: string | null;
  layout: string;
  theme_config?: {
    primaryColor?: string;
    ambientGlow?: string;
  } | null;
  is_primary: number;
  visibility: 'public' | 'matches' | 'friends' | 'selected' | 'private';
  status: 'draft' | 'published' | 'archived';
  created_at: number;
  updated_at: number;
}

export interface FictionalUniverse {
  id: string;
  creator_id: string;
  name: string;
  slug: string;
  description?: string;
  genre: string;
  lore?: string;
  rules_of_universe?: string;
  cover_image_url?: string;
  ambient_sound_url?: string;
  is_collaborative: number;
  visibility: 'public' | 'matches' | 'friends' | 'selected' | 'private';
  status: 'draft' | 'published' | 'archived';
  created_at: number;
  updated_at: number;
}

export type UniversalTimeType = 
  | 'standard_ce'
  | 'bce'
  | 'years_ago'
  | 'astronomical'
  | 'fictional_era'
  | 'timeless';

export interface UniversalTimelineEvent {
  id: string;
  user_id: string;
  identity_id?: string | null;
  universe_id?: string | null;
  time_type: UniversalTimeType;
  year_value: string;
  year_scale: string;
  era_label?: string | null;
  display_label: string;
  title: string;
  short_description: string;
  detailed_description?: string;
  image_url?: string | null;
  event_category: string;
  is_fictional: number;
  precision: 'exact' | 'approximate' | 'era_only' | 'timeless';
  calendar_system: string;
  tags?: string;
  visibility: 'public' | 'matches' | 'friends' | 'selected' | 'private';
  sort_order: number;
  created_at: number;
  updated_at: number;
}

export interface PrivateViewerNote {
  id: string;
  viewer_id: string;
  target_user_id: string;
  note_content: string;
  created_at: number;
  updated_at: number;
}

export interface TraitVoteSummary {
  trait_slug: string;
  count: number;
  userSelected: boolean;
}

export interface ProfileSocialFeedback {
  likesCount: number;
  dislikesCount: number;
  userVote: 'like' | 'dislike' | null;
  traits: TraitVoteSummary[];
}

export interface RegisteredExternalGame {
  id: string;
  provider_name: string;
  game_title: string;
  game_url: string;
  allowed_origin: string;
  category: string;
  description?: string;
  thumbnail_url?: string;
  is_approved: number;
  sandbox_attributes: string;
  registered_by: string;
  created_at: number;
}

export interface RelationshipMetrics {
  messagesCount: number;
  daysConnected: number;
  achievedMilestones: number[];
  nextMilestone: number | null;
  voluntarilySharedCount: number;
  sharedItems: Array<{
    id: string;
    owner_id: string;
    recipient_id: string;
    item_type: string;
    item_id: string;
    unlocked_at: number;
  }>;
}
