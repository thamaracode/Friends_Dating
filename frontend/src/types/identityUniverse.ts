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

export type IdentityType =
  | 'real'
  | 'personal'
  | 'social'
  | 'professional'
  | 'inner'
  | 'imaginary'
  | 'cinematic'
  | 'aspirational'
  | 'historical'
  | 'alternative_life'
  | 'creative'
  | 'relational'
  | 'custom';

export type IdentityVisibility =
  | 'public'
  | 'friends_only'
  | 'connections_only'
  | 'selected_people'
  | 'private'
  | 'unlisted'
  | 'matches'
  | 'friends'
  | 'selected';

export type TimelineDateNature = 'historical' | 'fictional' | 'hypothetical' | 'personal';

export interface IdentityCharacteristic {
  id?: string;
  key: string;
  value: string;
  category?: string;
  icon?: string;
}

export interface IdentityExperience {
  id: string;
  title: string;
  organization?: string;
  role?: string;
  startDate?: string;
  endDate?: string;
  description?: string;
  isCurrent?: boolean;
}

export interface IdentityAchievement {
  id: string;
  title: string;
  issuer?: string;
  year?: string;
  description?: string;
  badgeUrl?: string;
}

export interface IdentityMemory {
  id: string;
  title: string;
  dateLabel?: string;
  narrative: string;
  mood?: string;
  mediaUrl?: string;
}

export interface IdentityMediaAttachment {
  id: string;
  type: 'image' | 'audio' | 'video' | 'link';
  url: string;
  title?: string;
  caption?: string;
}

export interface IdentityCustomSection {
  id: string;
  identity_id?: string;
  section_key: string;
  title: string;
  section_type: 'markdown' | 'key_value' | 'gallery' | 'timeline' | 'quotes' | 'custom';
  content: string;
  visibility: IdentityVisibility;
  sort_order?: number;
}

export interface IdentityTimelineEvent {
  id: string;
  identity_id?: string;
  date_nature: TimelineDateNature;
  year_value: string;
  numeric_year: number;
  era_label: string;
  display_date: string;
  title: string;
  description: string;
  detailed_narrative?: string;
  image_url?: string | null;
  tags?: string[];
  visibility: IdentityVisibility;
  sort_order?: number;
  created_at?: number;
}

export interface IdentityVisualTheme {
  primaryColor?: string;
  accentColor?: string;
  themeAccent?: string;
  auraGlow?: string;
  realityCategory?: 'reality' | 'reflection' | 'fiction';
  borderStyle?: 'minimal' | 'specular' | 'neon' | 'glass';
  fontStyle?: 'sans' | 'serif' | 'mono' | 'cinematic';
  badgeLabel?: string;
}

export const IDENTITY_TYPES = [
  'real',
  'personal',
  'social',
  'professional',
  'inner',
  'imaginary',
  'cinematic',
  'aspirational',
  'historical',
  'alternative_life',
  'creative',
  'relational',
  'custom'
] as const;

export const IDENTITY_TYPE_META: Record<IdentityType, {
  label: string;
  category: 'reality' | 'fiction' | 'reflection';
  description: string;
  badge: string;
  accentColor: string;
  themeAccent: string;
  glowColor: string;
  icon: string;
}> = {
  real: {
    label: 'Real Identity',
    category: 'reality',
    description: "The person's actual public or private grounded identity in the physical world.",
    badge: 'Reality Core',
    accentColor: '#10B981',
    themeAccent: '#10B981',
    glowColor: 'rgba(16, 185, 129, 0.25)',
    icon: '🟢'
  },
  personal: {
    label: 'Personal Identity',
    category: 'reality',
    description: 'Values, beliefs, preferences, personality traits, interests, habits, and characteristics.',
    badge: 'Values & Traits',
    accentColor: '#3B82F6',
    themeAccent: '#3B82F6',
    glowColor: 'rgba(59, 130, 246, 0.25)',
    icon: '🌿'
  },
  social: {
    label: 'Social Identity',
    category: 'reality',
    description: 'How the person participates in friendships, communities, social groups, and society.',
    badge: 'Social Sphere',
    accentColor: '#8B5CF6',
    themeAccent: '#8B5CF6',
    glowColor: 'rgba(139, 92, 246, 0.25)',
    icon: '👥'
  },
  professional: {
    label: 'Professional Identity',
    category: 'reality',
    description: 'Career, education, professional skills, achievements, work experience, and ambitions.',
    badge: 'Craft & Calling',
    accentColor: '#0EA5E9',
    themeAccent: '#0EA5E9',
    glowColor: 'rgba(14, 165, 233, 0.25)',
    icon: '💼'
  },
  inner: {
    label: 'Inner Identity',
    category: 'reflection',
    description: 'Private reflections, emotions, fears, motivations, personal struggles, desires, and internal perspectives.',
    badge: 'Inner Sanctuary',
    accentColor: '#EC4899',
    themeAccent: '#EC4899',
    glowColor: 'rgba(236, 72, 153, 0.25)',
    icon: '🧠'
  },
  imaginary: {
    label: 'Imaginary Identity',
    category: 'fiction',
    description: 'Creative self-representations, fictional identities, imagined worlds, characters, and alternative versions of oneself.',
    badge: 'Imagined World',
    accentColor: '#F59E0B',
    themeAccent: '#F59E0B',
    glowColor: 'rgba(245, 158, 11, 0.25)',
    icon: '🎭'
  },
  cinematic: {
    label: 'Cinematic Identity',
    category: 'fiction',
    description: 'How a person imagines themselves within cinematic narratives, genres, archetypes, stories, and character roles.',
    badge: 'Cinematic Role',
    accentColor: '#E11D48',
    themeAccent: '#E11D48',
    glowColor: 'rgba(225, 29, 72, 0.25)',
    icon: '🎬'
  },
  aspirational: {
    label: 'Aspirational Identity',
    category: 'reflection',
    description: 'Who the person wants to become, future goals, ideal lifestyle, desired characteristics, and personal ambitions.',
    badge: 'Future Self',
    accentColor: '#6366F1',
    themeAccent: '#6366F1',
    glowColor: 'rgba(99, 102, 241, 0.25)',
    icon: '🚀'
  },
  historical: {
    label: 'Historical Identity',
    category: 'reflection',
    description: 'Past versions of the person, previous experiences, life stages, historical timelines, and memories.',
    badge: 'Life History',
    accentColor: '#D97706',
    themeAccent: '#D97706',
    glowColor: 'rgba(217, 119, 6, 0.25)',
    icon: '📜'
  },
  alternative_life: {
    label: 'Alternative Life Identity',
    category: 'fiction',
    description: 'Different possible versions of life, hypothetical experiences, and alternate paths not taken.',
    badge: 'Alternate Path',
    accentColor: '#14B8A6',
    themeAccent: '#14B8A6',
    glowColor: 'rgba(20, 184, 166, 0.25)',
    icon: '🌌'
  },
  creative: {
    label: 'Creative Identity',
    category: 'reflection',
    description: 'Artistic expression, writing, music, photography, imagination, and creative interests.',
    badge: 'Artistic Soul',
    accentColor: '#A855F7',
    themeAccent: '#A855F7',
    glowColor: 'rgba(168, 85, 247, 0.25)',
    icon: '🎨'
  },
  relational: {
    label: 'Relational Identity',
    category: 'reality',
    description: 'How a person describes themselves as a friend, partner, family member, colleague, or community member.',
    badge: 'Bond & Devotion',
    accentColor: '#F43F5E',
    themeAccent: '#F43F5E',
    glowColor: 'rgba(244, 63, 94, 0.25)',
    icon: '💖'
  },
  custom: {
    label: 'Custom Identity',
    category: 'reflection',
    description: 'A completely unique dimension of identity designed by the user.',
    badge: 'Bespoke Space',
    accentColor: '#E2E8F0',
    themeAccent: '#E2E8F0',
    glowColor: 'rgba(226, 232, 240, 0.25)',
    icon: '✨'
  }
};

export interface UserIdentity {
  id: string;
  user_id: string;
  name: string;
  display_name?: string;
  identity_type?: IdentityType;
  display_title?: string;
  classification: IdentityClassification;
  avatar_url?: string;
  cover_image_url?: string;
  description?: string;
  biography?: string;
  characteristics?: IdentityCharacteristic[];
  tags?: string[];
  interests: string[];
  skills: string[];
  experiences?: IdentityExperience[];
  achievements?: IdentityAchievement[];
  memories?: IdentityMemory[];
  media_attachments?: IdentityMediaAttachment[];
  custom_sections?: IdentityCustomSection[];
  timeline_events?: IdentityTimelineEvent[];
  visual_theme?: IdentityVisualTheme | null;
  personality_traits: string[];
  universe_id?: string | null;
  layout: string;
  theme_config?: {
    primaryColor?: string;
    ambientGlow?: string;
  } | null;
  is_primary: number;
  visibility: IdentityVisibility;
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
