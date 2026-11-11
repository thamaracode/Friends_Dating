export type DailyTab = 'love' | 'friendship' | 'mind' | 'growth';

export type DailyEdition = 'universal' | 'men' | 'women' | 'mixed';

export type RelationshipSituation = 
  | 'single' 
  | 'looking_for_love' 
  | 'has_crush' 
  | 'dating' 
  | 'in_relationship' 
  | 'long_distance' 
  | 'engaged' 
  | 'married' 
  | 'complicated' 
  | 'heartbroken' 
  | 'recently_separated' 
  | 'not_interested_in_romance';

export type FriendshipTrack = 
  | 'looking_for_friends' 
  | 'making_new_friends' 
  | 'maintaining_friendships' 
  | 'deepening_friendships' 
  | 'long_distance' 
  | 'friendship_conflicts' 
  | 'losing_friends' 
  | 'rebuilding_trust' 
  | 'being_a_better_friend' 
  | 'understanding_toxic_dynamics' 
  | 'building_social_confidence' 
  | 'finding_like_minded';

export type DailyContentFormat = 
  | 'quote' 
  | 'advice' 
  | 'reflection' 
  | 'behavior_insight' 
  | 'challenge' 
  | 'motivation' 
  | 'compatibility';

export interface DailyContentCategory {
  id: string;
  name: string;
  tab: DailyTab;
  icon: string;
  description: string;
  ambient_color: string;
}

export interface DailyAssignmentItem {
  id: string;
  member_id: string;
  local_date: string;
  tab: DailyTab;
  content_id: string;
  is_read: number;
  reflection_answer: string | null;
  challenge_completed: number;
  assigned_at: number;
  title: string;
  quote_one_liner: string;
  body_insight: string;
  reflection_question: string | null;
  action_exercise: string | null;
  format_type: DailyContentFormat;
  cover_image_url: string | null;
  author_or_source: string | null;
  likes_count: number;
  saves_count: number;
  category_name: string;
  category_icon: string;
  ambient_color: string;
  is_liked?: boolean;
  is_saved?: boolean;
}

export interface DailyPreferences {
  member_id: string;
  edition_preference: DailyEdition;
  relationship_status: RelationshipSituation;
  dating_intentions: string;
  friendship_track: FriendshipTrack;
  delivery_time: string;
  timezone: string;
  love_notifications: number;
  friendship_notifications: number;
  growth_notifications: number;
  quiet_hours_enabled: number;
  updated_at: number;
}

export interface DailyStreak {
  member_id: string;
  current_streak: number;
  longest_streak: number;
  last_active_date: string;
  total_reflections: number;
  total_challenges_done: number;
}

export interface DailyTodayResponse {
  success: boolean;
  date: string;
  preferences: DailyPreferences;
  streak: DailyStreak;
  editions: Record<DailyTab, DailyAssignmentItem>;
}
