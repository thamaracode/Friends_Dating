export type WorldType = 
  | 'real_life' 
  | 'imaginary_life' 
  | 'cinematic_life' 
  | 'inner_world' 
  | 'future_self' 
  | 'professional_self' 
  | 'social_self' 
  | 'romantic_self' 
  | 'creative_self' 
  | 'alternate_reality' 
  | 'fantasy_universe' 
  | 'custom';

export type RealityClassification = 
  | 'actual' 
  | 'historical' 
  | 'current' 
  | 'planned' 
  | 'aspirational' 
  | 'hypothetical' 
  | 'imaginary' 
  | 'fictional' 
  | 'cinematic' 
  | 'dream' 
  | 'roleplay' 
  | 'alternate_reality' 
  | 'uncertain';

export type WorldLayoutType = 
  | 'cinematic' 
  | 'editorial' 
  | 'timeline' 
  | 'portfolio' 
  | 'magazine' 
  | 'scrapbook' 
  | 'character_sheet' 
  | 'fantasy_world' 
  | 'minimalist';

export type WorldVisibility = 'public' | 'matches' | 'friends' | 'selected' | 'private';
export type WorldStatus = 'published' | 'draft' | 'archived';

export interface WorldThemeConfig {
  theme: string;
  primaryColor: string;
  ambientGlow: string;
  fontPreset: string;
  layoutStyle?: string;
}

export interface ProfileWorld {
  id: string;
  user_id: string;
  name: string;
  slug: string;
  description?: string;
  world_type: WorldType;
  cover_image_url?: string;
  avatar_url?: string;
  theme_config?: WorldThemeConfig | null;
  layout_type: WorldLayoutType;
  ambient_sound_url?: string | null;
  visibility: WorldVisibility;
  status: WorldStatus;
  is_default: number;
  sort_order: number;
  section_count?: number;
  entry_count?: number;
  created_at: number;
  updated_at: number;
}

export interface ProfileWorldSection {
  id: string;
  world_id: string;
  parent_section_id?: string | null;
  title: string;
  description?: string;
  section_type: string;
  icon?: string;
  visibility: WorldVisibility;
  sort_order: number;
  created_at: number;
  updated_at: number;
}

export interface ProfileWorldEntry {
  id: string;
  world_id: string;
  section_id: string;
  user_id: string;
  entry_type: string;
  title?: string;
  content: string;
  structured_content?: any;
  reality_classification: RealityClassification;
  visibility: WorldVisibility;
  status: WorldStatus;
  sort_order: number;
  created_at: number;
  updated_at: number;
}

export interface ProfileWorldRelation {
  id: string;
  source_world_id: string;
  source_entry_id: string;
  target_world_id: string;
  relation_type: string;
  entry_title?: string;
  reality_classification?: RealityClassification;
  target_world_name?: string;
  created_at: number;
}
