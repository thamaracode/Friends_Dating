/**
 * Master Prompt 04: Social Discovery, Friendship and Dating Engine Types
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
  score: number; // 0 to 100
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

export const MATCHING_TERMINOLOGY_REGISTRY: MatchingTerminologyConcept[] = [
  {
    id: 'term_compatibility',
    term: 'Compatibility',
    definition: 'Systemic harmony across underlying operational values, communication rhythms, and conflict navigation.',
    distinctionFromOthers: 'Unlike superficial similarity, compatibility allows two very different personalities to co-exist peacefully.',
    practicalExample: 'An introverted book-lover and an extroverted event organizer who respect each other’s recharge needs.'
  },
  {
    id: 'term_similarity',
    term: 'Similarity',
    definition: 'Direct overlap in hobbies, cultural tastes, demographics, or surface traits.',
    distinctionFromOthers: 'Similarity creates immediate conversational comfort, but does not guarantee emotional safety or long-term alignment.',
    practicalExample: 'Both people love the same obscure indie film director and listen to synthwave.'
  },
  {
    id: 'term_complementarity',
    term: 'Complementarity',
    definition: 'Differences between two people that naturally support, balance, and complete one another.',
    distinctionFromOthers: 'Complementarity is not contradiction; it is a harmonious division of emotional and practical capacities.',
    practicalExample: 'One person brings meticulous planning structure while the other brings creative spontaneity and warmth.'
  },
  {
    id: 'term_shared_interests',
    term: 'Shared Interests',
    definition: 'Common activities, topics, and pastimes that provide shared conversational fuel.',
    distinctionFromOthers: 'Interests provide initial connection hooks but are distinct from ethical character and shared life goals.',
    practicalExample: 'Both enjoy analog film photography, bouldering, and board game evenings.'
  },
  {
    id: 'term_shared_values',
    term: 'Shared Values',
    definition: 'Deep ethical principles, life priorities, and non-negotiable moral foundations.',
    distinctionFromOthers: 'Values predict resilience under stress far more reliably than shared hobbies or aesthetic tastes.',
    practicalExample: 'Both prioritize radical authenticity, intellectual honesty, and mutual autonomy.'
  },
  {
    id: 'term_relationship_intentions',
    term: 'Relationship Intentions',
    definition: 'Transparent clarity on the scope, commitment level, and expectations of a connection.',
    distinctionFromOthers: 'Aligns the destination upfront to prevent mismatch between casual exploration and life partnership.',
    practicalExample: 'Both explicitly seeking creative collaboration without romantic pressure.'
  },
  {
    id: 'term_communication_compatibility',
    term: 'Communication Compatibility',
    definition: 'Harmony in how two people convey needs, resolve misunderstandings, and exchange thoughts.',
    distinctionFromOthers: 'Focuses on the cadence (asynchronous vs real-time) and tone (direct vs gentle) of interaction.',
    practicalExample: 'A direct speaker paired with a reflective listener who values slow, thoughtful processing.'
  },
  {
    id: 'term_lifestyle_compatibility',
    term: 'Lifestyle Compatibility',
    definition: 'Harmony in day-to-day living habits, sleep rhythms, social energy allocation, and home boundaries.',
    distinctionFromOthers: 'Addresses practical physical realities rather than emotional ideals.',
    practicalExample: 'Both are night owls who recharge in peaceful, low-stimulus environments.'
  },
  {
    id: 'term_mutual_attraction',
    term: 'Mutual Attraction',
    definition: 'Reciprocal aesthetic, intellectual, or romantic interest voluntarily expressed by both individuals.',
    distinctionFromOthers: 'Subjective feeling distinct from algorithmic score; cannot be inferred without explicit user feedback.',
    practicalExample: 'Both individuals voluntarily liking each other’s profile worlds and expression canvas.'
  },
  {
    id: 'term_mutual_consent',
    term: 'Mutual Consent',
    definition: 'Explicit, unpressured agreement from both parties to establish an ongoing connection channel.',
    distinctionFromOthers: 'The mandatory gatekeeper for private messaging, contact sharing, and intimate layers.',
    practicalExample: 'Accepting an incoming connection request before direct messaging unlocks.'
  }
];

export interface ExplainableResonanceReport {
  overallResonanceScore: number; // 0 to 100
  similarityScore: number;       // 0 to 100
  complementarityScore: number;  // 0 to 100
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
  substance_habits?: {
    drinking?: 'frequently' | 'socially' | 'rarely' | 'never';
    smoking?: 'frequently' | 'socially' | 'rarely' | 'never';
  };
  living_space?: 'minimalist' | 'cozy_cluttered' | 'organized' | 'nomadic';
}

export interface CommunicationPreferences {
  cadence: 'frequent_daily' | 'balanced' | 'slow_asynchronous';
  style: 'direct' | 'gentle' | 'playful' | 'intellectual' | 'metaphorical';
  listening_style: 'reflective' | 'action_oriented' | 'validating' | 'analytical';
  conflict_approach: 'direct_discussion' | 'need_space_first' | 'collaborative_walk';
}

export interface DiscoveryProfile {
  id: string; // matches user_id
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
  
  // Connection Intentions (supports multiple)
  intentions: ConnectionType[];
  primary_intention: ConnectionType;
  
  // Core Dimensions
  core_values: string[];
  interests: string[];
  activities: string[];
  
  // Preferences
  lifestyle: LifestylePreferences;
  communication: CommunicationPreferences;
  
  // Optional Media
  photos: string[];
  audio_intro_url?: string;
  video_intro_url?: string;
  
  // Linked Dimensions & Archetypes
  active_identities_count?: number;
  archetype_summary?: string;
  
  // Privacy & Safety Controls
  discovery_visible: boolean;
  hide_exact_age?: boolean;
  hide_city?: boolean;
}

export type InteractionType = 'like' | 'pass' | 'save' | 'follow' | 'connect';

export interface UserInteraction {
  id: string;
  user_id: string;
  target_user_id: string;
  interaction_type: InteractionType;
  connection_type?: ConnectionType;
  created_at: number;
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

export interface UserConnection {
  id: string;
  user_a_id: string;
  user_b_id: string;
  connection_type: ConnectionType;
  status: 'active' | 'paused' | 'unmatched';
  established_at: number;
  partner_profile?: DiscoveryProfile;
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
