export type FeatureCategory = 
  | 'social' 
  | 'relationships' 
  | 'identity' 
  | 'growth' 
  | 'intelligence' 
  | 'media' 
  | 'safety';

export type FeatureEffectiveState = 
  | 'available'
  | 'enabled' 
  | 'disabled' 
  | 'paused' 
  | 'restricted' 
  | 'unavailable' 
  | 'coming_soon';

export type PrivacyLevel = 
  | 'public' 
  | 'selective' 
  | 'private_encrypted' 
  | 'strictly_local';

export type ExperiencePresetKey = 
  | 'simple_social' 
  | 'dating_relationships' 
  | 'personal_growth' 
  | 'complete' 
  | 'custom';

export interface FeatureDependency {
  dependsOn: string;
  isOptional: boolean;
  fallbackNote?: string;
}

export interface RegisteredFeature {
  id: string;
  name: string;
  category: FeatureCategory;
  tagline: string;
  description: string;
  default_state: string;
  is_user_configurable: boolean;
  privacy_level: PrivacyLevel;
  collectedData: string[];
  visibility_audience: string;
  requires_ai: boolean;
  requires_notifications: boolean;
  is_premium: boolean;
  disable_behavior: string;
  data_retention_rule: string;
  min_app_version: string;
  dependencies: FeatureDependency[];
}

export interface EvaluatedFeature {
  id: string;
  name: string;
  category: FeatureCategory;
  tagline: string;
  effectiveState: FeatureEffectiveState;
  isVisible: boolean;
  isDiscoverable: boolean;
  requiresAi: boolean;
  requiresNotifications: boolean;
  isPremium: boolean;
  privacyLevel: PrivacyLevel;
  reason: string;
  customConfig: Record<string, any>;
}

export interface ExperiencePreset {
  key: ExperiencePresetKey;
  name: string;
  badge: string;
  description: string;
  targetAudience: string;
  recommendedFeatures: string[];
  hiddenFeatures: string[];
}

export interface AdminFeature {
  id: string;
  name: string;
  category: FeatureCategory;
  tagline: string;
  description: string;
  isGloballyEnabled: boolean;
  rolloutPercentage: number;
  allowedRoles: string[];
  allowedTiers: string[];
  killSwitchActive: boolean;
  killSwitchReason?: string;
  dependencies: Array<{
    feature_id: string;
    depends_on_feature_id: string;
    is_optional: number;
    fallback_note?: string;
  }>;
  customConfig?: Record<string, any>;
  flagUpdatedAt?: number;
}

export interface AuditLogEntry {
  id: string;
  admin_id: string;
  admin_name: string;
  action: string;
  target_type: string;
  target_id: string;
  before_value_json?: string;
  after_value_json?: string;
  reason: string;
  ip_address?: string;
  created_at: number;
}

export interface FeatureAdoptionStat {
  id: string;
  name: string;
  category: FeatureCategory;
  enabled_users: number;
  disabled_users: number;
  paused_users: number;
  total_configured: number;
}
