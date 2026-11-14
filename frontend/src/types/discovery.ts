/**
 * Master Prompt 04: Social Discovery, Friendship and Dating Engine Types (Frontend)
 */

export type ConnectionType = 
  | 'friendship'
  | 'dating'
  | 'long_term'
  | 'casual_dating'
  | 'professional_networking'
  | 'creative_collaboration'
  | 'activity_partners'
  | 'community_connections'
  | 'shared_interest';

export interface ConnectionTypeMetadata {
  id: ConnectionType;
  label: string;
  category: 'social' | 'romance' | 'purpose' | 'community';
  icon: string;
  description: string;
}

export const CONNECTION_TYPES_METADATA: Record<ConnectionType, ConnectionTypeMetadata> = {
  friendship: {
    id: 'friendship',
    label: 'Friendship',
    category: 'social',
    icon: 'Users',
    description: 'Meaningful, authentic companionship without romantic expectations.'
  },
  dating: {
    id: 'dating',
    label: 'Dating & Romance',
    category: 'romance',
    icon: 'Heart',
    description: 'Exploring romantic resonance, chemistry, and mutual affection.'
  },
  long_term: {
    id: 'long_term',
    label: 'Long-Term Partnership',
    category: 'romance',
    icon: 'Sparkles',
    description: 'Committed, shared-life building with aligned future values.'
  },
  casual_dating: {
    id: 'casual_dating',
    label: 'Casual Dating',
    category: 'romance',
    icon: 'Flame',
    description: 'Enjoying dates, shared dinners, and companionship without heavy pressure.'
  },
  professional_networking: {
    id: 'professional_networking',
    label: 'Professional Network',
    category: 'purpose',
    icon: 'Briefcase',
    description: 'Career growth, technical mentorship, and industry intellectual exchange.'
  },
  creative_collaboration: {
    id: 'creative_collaboration',
    label: 'Creative Collaboration',
    category: 'purpose',
    icon: 'Palette',
    description: 'Co-creating art, music, writing, software, or cinematic narratives.'
  },
  activity_partners: {
    id: 'activity_partners',
    label: 'Activity Partners',
    category: 'social',
    icon: 'Compass',
    description: 'Joining forces for hiking, gaming, concert visits, or travel.'
  },
  community_connections: {
    id: 'community_connections',
    label: 'Community Circles',
    category: 'community',
    icon: 'Globe',
    description: 'Participating in local civic initiatives, support circles, and volunteer causes.'
  },
  shared_interest: {
    id: 'shared_interest',
    label: 'Shared-Interest Synergy',
    category: 'social',
    icon: 'BookOpen',
    description: 'Deep-diving into niche obsessions, literature, and hobbies.'
  }
};

export type MatchingDimensionKey =
  | 'shared_values'
  | 'common_interests'
  | 'intentions'
  | 'communication'
  | 'lifestyle'
  | 'geographic'
  | 'activities';

export interface MatchingDimensionScore {
  dimension: MatchingDimensionKey;
  label: string;
  score: number;
  weight: number;
  explanation: string;
  matchedItems?: string[];
}

export interface MatchingTerminologyConcept {
  id: string;
  term: string;
  definition: string;
  distinctionFromOthers: string;
  practicalExample: string;
}

export interface ExplainableResonanceReport {
  overallResonanceScore: number;
  similarityScore: number;
  complementarityScore: number;
  intentionsMatch: boolean;
  mutualConsentEstablished: boolean;
  dimensions: MatchingDimensionScore[];
  sharedValues: string[];
  sharedInterests: string[];
  sharedActivities: string[];
  synergyHighlights: string[];
  growthFrictionNotes: string[];
  disclaimer: string;
}

export interface LifestylePreferences {
  sleep_schedule?: 'early_bird' | 'night_owl' | 'flexible';
  social_energy?: 'introvert' | 'ambivert' | 'extrovert';
  pets?: 'dog_lover' | 'cat_lover' | 'all_animals' | 'none';
  dietary_vibe?: string;
  living_space?: 'minimalist' | 'cozy_cluttered' | 'organized' | 'nomadic';
}

export interface CommunicationPreferences {
  cadence: 'frequent_daily' | 'balanced' | 'slow_asynchronous';
  style: 'direct' | 'gentle' | 'playful' | 'intellectual' | 'metaphorical';
  listening_style: 'reflective' | 'action_oriented' | 'validating' | 'analytical';
  conflict_approach: 'direct_discussion' | 'need_space_first' | 'collaborative_walk';
}

export interface DiscoveryProfile {
  id: string;
  name: string;
  username: string;
  avatar_url: string;
  age: number;
  city: string;
  country: string;
  tagline: string;
  bio: string;
  verified: boolean;
  last_active_at: number;
  created_at: number;
  primary_intention: ConnectionType;
  intentions: ConnectionType[];
  core_values: string[];
  interests: string[];
  activities: string[];
  lifestyle: LifestylePreferences;
  communication: CommunicationPreferences;
  photos: string[];
  audio_intro_url?: string;
  video_intro_url?: string;
  discovery_visible: boolean;
  hide_exact_age?: boolean;
  hide_city?: boolean;
}

export type InteractionType = 'like' | 'pass' | 'save' | 'follow' | 'connect';

export interface UserConnection {
  id: string;
  user_a_id: string;
  user_b_id: string;
  connection_type: ConnectionType;
  status: 'active' | 'paused' | 'unmatched';
  established_at: number;
  partner_profile?: DiscoveryProfile;
}

export interface ConnectionRequest {
  id: string;
  sender_id: string;
  recipient_id: string;
  connection_type: ConnectionType;
  note?: string;
  status: 'pending' | 'accepted' | 'declined' | 'cancelled';
  created_at: number;
  responded_at?: number;
  sender_profile?: Partial<DiscoveryProfile>;
}

export interface DiscoveryFeedFilters {
  connectionType?: ConnectionType | 'all';
  minAge?: number;
  maxAge?: number;
  city?: string;
  interests?: string[];
  values?: string[];
  sortBy?: 'resonance' | 'recently_active' | 'new_members' | 'shared_interests';
  page?: number;
  limit?: number;
}

export interface DiscoveryFeedItem {
  profile: DiscoveryProfile;
  resonance: ExplainableResonanceReport;
  hasLikedViewer: boolean;
  hasViewerLiked: boolean;
  isSaved: boolean;
  connectionStatus: 'none' | 'pending' | 'connected';
}

export interface DiscoveryFeedResponse {
  items: DiscoveryFeedItem[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
  activeFilterSummary: {
    connectionType: string;
    totalExclusionsApplied: number;
    sortBy: string;
  };
}
