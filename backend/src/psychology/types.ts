export type ConceptualDomain = 
  | 'personality_psychology'
  | 'emotional_intelligence'
  | 'interpersonal_behavior'
  | 'values_character'
  | 'relationship_dynamics'
  | 'self_reflection';

export type FrameworkType = 
  | 'scientific'             // Empirical, peer-reviewed psychology (e.g. Big Five, Attachment in developmental psych)
  | 'research_supported'     // Interpersonal research frameworks (e.g. Active Listening, Emotional Boundaries, Nonviolent Communication)
  | 'popular_psychology'     // Widely discussed models with empirical caveats (e.g. Love Languages, Enneagram)
  | 'narrative_archetype';   // Cultural, mythic, and literary archetypes (Hero, Rebel, Sage)

export interface PsychologyConcept {
  id: string;
  domain: ConceptualDomain;
  framework_type: FrameworkType;
  title: string;
  scientific_name?: string;
  definition: string;
  practical_example: string;
  related_concepts: string[];
  appropriate_context: string;
  limitations_and_caveats: string;
  spectrum_low_label?: string;
  spectrum_high_label?: string;
  badge_color?: string;
  sort_order: number;
  created_at: number;
}

export type CommunicationStyle = 
  | 'direct' 
  | 'empathetic' 
  | 'analytical' 
  | 'expressive' 
  | 'assertive' 
  | 'collaborative'
  | 'unspecified';

export type ListeningStyle = 
  | 'active' 
  | 'reflective' 
  | 'empathetic' 
  | 'solution_oriented'
  | 'unspecified';

export type AttachmentAwareness = 
  | 'secure_leaning' 
  | 'anxious_attuned' 
  | 'avoidant_autonomous' 
  | 'exploring_growth'
  | 'unspecified';

export interface UserPersonalityProfile {
  user_id: string;
  dimensions: Record<string, number>; // continuous spectrum 0-100 (e.g., introversion_extraversion: 30)
  selected_traits: string[];
  trait_explanations: Record<string, string>; // personal nuances in user's own words
  communication_style: CommunicationStyle;
  communication_notes: string;
  listening_style: ListeningStyle;
  attachment_awareness: AttachmentAwareness;
  attachment_notes: string;
  core_values: string[];
  values_explanations: Record<string, string>;
  emotional_boundaries: string;
  conflict_style: string;
  visibility: 'public' | 'friends_only' | 'connections_only' | 'private';
  updated_at: number;
}

export interface ReflectionPrompt {
  id: string;
  prompt_text: string;
  helper_text?: string;
  prompt_type: 'long_text' | 'scale_1_10' | 'multi_choice';
  options?: string[];
}

export interface ReflectionExercise {
  id: string;
  domain: ConceptualDomain;
  title: string;
  subtitle: string;
  estimated_minutes: number;
  framework_type: FrameworkType;
  prompts: ReflectionPrompt[];
  ethical_disclaimer: string;
  sort_order: number;
}

export interface UserReflectionResponse {
  id: string;
  user_id: string;
  exercise_id: string;
  answers: Record<string, any>;
  personal_takeaway?: string;
  visibility: 'private' | 'friends_only' | 'public';
  completed_at: number;
  updated_at: number;
}

export interface UserPerceptionFeedback {
  id: string;
  target_user_id: string;
  author_user_id: string;
  author_name?: string;
  author_avatar?: string;
  strengths_observed: string[];
  communication_impression: string;
  values_witnessed: string[];
  warmth_resonance_rating: number; // 1-5
  constructive_perspective?: string;
  is_anonymous: boolean;
  visibility: 'private_to_target' | 'public_if_approved';
  is_approved_by_target: boolean;
  created_at: number;
}

export interface UserTraitHistorySnapshot {
  id: string;
  user_id: string;
  snapshot_label: string;
  dimensions: Record<string, number>;
  core_values: string[];
  growth_reflections?: string;
  recorded_at: number;
}

export interface CompatibilityResonanceReport {
  overall_score: number; // 0-100 explainable resonance
  shared_values: {
    overlapping: string[];
    user_unique: string[];
    partner_unique: string[];
    alignment_ratio: number;
  };
  communication_synergy: {
    user_style: CommunicationStyle;
    partner_style: CommunicationStyle;
    complementarity_notes: string;
    listening_harmony: string;
  };
  attachment_dynamic: {
    user_attachment: AttachmentAwareness;
    partner_attachment: AttachmentAwareness;
    growth_opportunities: string;
    relational_safety_notes: string;
  };
  dimensional_resonance: Array<{
    dimension_key: string;
    dimension_title: string;
    user_val: number;
    partner_val: number;
    difference: number;
    explanation: string;
  }>;
  ethical_caveat: string;
}
