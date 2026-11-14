/**
 * Master Prompt 05: Relationship Management, Personal Memory and Interpersonal Context Engine Types
 */

export type RelationshipCategory = 
  | 'friendship'
  | 'romantic'
  | 'dating'
  | 'long_distance'
  | 'professional'
  | 'family'
  | 'creative_partner'
  | 'mentor_mentee'
  | 'complicated'
  | 'past_connection'
  | 'custom';

export type RelationshipLifecyclePhase =
  | 'new_acquaintance'
  | 'getting_to_know'
  | 'friendship_development'
  | 'romantic_interest'
  | 'dating'
  | 'committed_relationship'
  | 'long_distance'
  | 'professional'
  | 'family'
  | 'on_pause'
  | 'ended'
  | 'archived'
  | 'custom';

export interface RelationshipLifecycleMetadata {
  phase: RelationshipLifecyclePhase;
  label: string;
  description: string;
  badgeColor: string;
}

export const RELATIONSHIP_LIFECYCLE_METADATA: Record<RelationshipLifecyclePhase, RelationshipLifecycleMetadata> = {
  new_acquaintance: {
    phase: 'new_acquaintance',
    label: 'New Acquaintance',
    description: 'Initial contact made; establishing basic rapport and context.',
    badgeColor: 'bg-zinc-800 text-zinc-300 border-zinc-700'
  },
  getting_to_know: {
    phase: 'getting_to_know',
    label: 'Getting to Know',
    description: 'Active discovery of values, interests, communication styles, and boundaries.',
    badgeColor: 'bg-sky-950/60 text-sky-300 border-sky-700/40'
  },
  friendship_development: {
    phase: 'friendship_development',
    label: 'Friendship Developing',
    description: 'Deepening trust, reciprocal vulnerability, and shared experiences.',
    badgeColor: 'bg-emerald-950/60 text-emerald-300 border-emerald-700/40'
  },
  romantic_interest: {
    phase: 'romantic_interest',
    label: 'Romantic Interest',
    description: 'Mutual romantic exploration and emotional attraction.',
    badgeColor: 'bg-rose-950/60 text-rose-300 border-rose-700/40'
  },
  dating: {
    phase: 'dating',
    label: 'Dating',
    description: 'Ongoing shared dates, intimacy, and exploring long-term alignment.',
    badgeColor: 'bg-pink-950/60 text-pink-300 border-pink-700/40'
  },
  committed_relationship: {
    phase: 'committed_relationship',
    label: 'Committed Relationship',
    description: 'Dedicated partnership, shared life goals, and mutual responsibility.',
    badgeColor: 'bg-purple-950/60 text-purple-300 border-purple-700/40'
  },
  long_distance: {
    phase: 'long_distance',
    label: 'Long Distance',
    description: 'Connection maintained across geographic distance with intentional scheduling.',
    badgeColor: 'bg-indigo-950/60 text-indigo-300 border-indigo-700/40'
  },
  professional: {
    phase: 'professional',
    label: 'Professional Collaboration',
    description: 'Work, technical projects, mentorship, or intellectual exchange.',
    badgeColor: 'bg-amber-950/60 text-amber-300 border-amber-700/40'
  },
  family: {
    phase: 'family',
    label: 'Family Connection',
    description: 'Kinship, lifelong relational bond, and family dynamics.',
    badgeColor: 'bg-teal-950/60 text-teal-300 border-teal-700/40'
  },
  on_pause: {
    phase: 'on_pause',
    label: 'On Pause / Taking Space',
    description: 'Deliberate pause in frequent contact to respect boundaries or reflect.',
    badgeColor: 'bg-orange-950/60 text-orange-300 border-orange-700/40'
  },
  ended: {
    phase: 'ended',
    label: 'Ended / Parted Ways',
    description: 'Connection concluded with closure or conscious separation.',
    badgeColor: 'bg-zinc-900 text-zinc-400 border-zinc-800'
  },
  archived: {
    phase: 'archived',
    label: 'Archived',
    description: 'Historical memories and records preserved without active maintenance.',
    badgeColor: 'bg-zinc-950 text-zinc-500 border-zinc-800'
  },
  custom: {
    phase: 'custom',
    label: 'Custom Status',
    description: 'User-defined unique connection archetype and lifecycle phase.',
    badgeColor: 'bg-violet-950/60 text-violet-300 border-violet-700/40'
  }
};

export type InteractionType = 
  | 'in_person'
  | 'voice_call'
  | 'video_call'
  | 'text_chat'
  | 'letter'
  | 'shared_activity'
  | 'event';

export type MemoryType = 
  | 'quote'
  | 'moment'
  | 'insight'
  | 'unresolved_discussion'
  | 'reflection'
  | 'milestone';

export type CommitmentStatus = 
  | 'pending'
  | 'in_progress'
  | 'fulfilled'
  | 'broken'
  | 'renegotiated';

export type ReminderCategory = 
  | 'birthday'
  | 'anniversary'
  | 'planned_conversation'
  | 'follow_up'
  | 'event'
  | 'promise'
  | 'custom';

export interface PrmPerson {
  id: string;
  owner_user_id: string;
  target_user_id?: string | null;
  name: string;
  nickname?: string;
  avatar_url?: string;
  relationship_category: RelationshipCategory;
  custom_category_name?: string;
  relationship_status: RelationshipLifecyclePhase;
  custom_status_label?: string;
  significance_level: number; // 1 to 5
  first_met_date?: string;
  first_met_location?: string;
  anniversary_date?: string;
  birthday_date?: string;
  favourite_food?: string;
  favourite_drink?: string;
  favourite_colour?: string;
  love_language?: string;
  communication_style?: string;
  communication_preferences: {
    cadence?: string;
    preferred_channels?: string[];
    best_time_to_reach?: string;
    space_needs?: string;
  };
  boundaries: string[];
  shared_interests: string[];
  things_they_love: string[];
  things_they_dislike: string[];
  is_locked: boolean;
  last_interacted_at?: number;
  created_at: number;
  updated_at: number;
}

export interface PrmInteraction {
  id: string;
  owner_user_id: string;
  person_id: string;
  timestamp: number;
  interaction_type: InteractionType;
  participants: string[];
  title?: string;
  notes: string;
  emotional_tone?: 'joyful' | 'deep' | 'vulnerable' | 'tense' | 'comforting' | 'neutral';
  attachments?: Array<{ type: string; url: string; label?: string }>;
  related_memory_ids?: string[];
  follow_up_actions?: string[];
  created_at: number;
}

export interface PrmMemory {
  id: string;
  owner_user_id: string;
  person_id: string;
  memory_type: MemoryType;
  title?: string;
  content: string; // The quote, reflection, or note
  emotional_significance: number; // 1 to 5
  occurred_at?: string;
  tags: string[];
  is_unresolved: boolean;
  created_at: number;
  updated_at: number;
}

export interface PrmCommitment {
  id: string;
  owner_user_id: string;
  person_id: string;
  made_by: 'me' | 'them' | 'mutual';
  title: string;
  description?: string;
  due_date?: string;
  status: CommitmentStatus;
  fulfilled_at?: number;
  notes?: string;
  created_at: number;
}

export interface PrmReminder {
  id: string;
  owner_user_id: string;
  person_id: string;
  title: string;
  category: ReminderCategory;
  due_date: string;
  reminder_timing: 'day_of' | 'day_before' | '3_days_before' | '1_week_before';
  status: 'pending' | 'dismissed' | 'completed';
  notes?: string;
  created_at: number;
}

export interface BeforeYouTalkBriefing {
  person: PrmPerson;
  daysSinceLastInteraction: number | null;
  lastInteractionSummary: string | null;
  upcomingReminders: PrmReminder[];
  pendingCommitmentsMadeByMe: PrmCommitment[];
  pendingCommitmentsMadeByThem: PrmCommitment[];
  unresolvedDiscussions: PrmMemory[];
  thingsTheyAppreciate: string[];
  sensitiveBoundariesToRespect: string[];
  generatedAt: number;
  provenance: 'user_recorded_facts';
}

export interface AiRelationshipInsights {
  personId: string;
  conversationStarters: Array<{
    starter: string;
    rationale: string;
    topics: string[];
  }>;
  communicationPatternObservations: {
    cadenceSummary: string;
    observedBalance: string;
    unresolvedCount: number;
    healthNotes: string;
  };
  draftMessageSuggestions?: Array<{
    tone: string;
    subject?: string;
    body: string;
  }>;
  provenance: 'ai_assisted';
  disclaimer: string;
}

export interface PersonFullDossier {
  person: PrmPerson;
  interactions: PrmInteraction[];
  memories: PrmMemory[];
  commitments: PrmCommitment[];
  reminders: PrmReminder[];
  briefing: BeforeYouTalkBriefing;
}
