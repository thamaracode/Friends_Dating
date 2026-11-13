import type { 
  RegisteredFeature, 
  EvaluatedFeature, 
  ExperiencePreset, 
  ExperiencePresetKey,
  AdminFeature,
  AuditLogEntry,
  FeatureAdoptionStat
} from '../types/featureControl';

const API_BASE = 'http://127.0.0.1:3001/api';
const STORAGE_KEY_FEATURES = 'soulverse_evaluated_features_v1';
const STORAGE_KEY_PRESET = 'soulverse_active_preset_v1';

export const EXPERIENCE_PRESETS: ExperiencePreset[] = [
  {
    key: 'simple_social',
    name: 'Simple Social',
    badge: 'Beginner',
    description: 'Clean, distraction-free friendships, messaging, and discover. Ideal for those who want simple human conversations without complex identities.',
    targetAudience: 'Minimalists & new users',
    recommendedFeatures: ['feat_friendships', 'feat_daily_quotes', 'feat_external_connections', 'feat_the_unspoken', 'feat_spotify_ambient'],
    hiddenFeatures: ['feat_dating', 'feat_relationship_vault', 'feat_personal_journal', 'feat_imaginary_identities', 'feat_cinematic_profiles', 'feat_timeline_view']
  },
  {
    key: 'dating_relationships',
    name: 'Dating & Chemistry',
    badge: 'Romantic',
    description: 'Focused on romantic chemistry, deep match briefs, Before-You-Talk briefings, mutual question games, and intimate relationship memories.',
    targetAudience: 'Single individuals seeking genuine romance',
    recommendedFeatures: ['feat_dating', 'feat_friendships', 'feat_relationship_vault', 'feat_two_person_questions', 'feat_spotify_ambient', 'feat_personality_exploration', 'feat_the_unspoken'],
    hiddenFeatures: ['feat_imaginary_identities', 'feat_cinematic_profiles', 'feat_timeline_view', 'feat_personal_journal']
  },
  {
    key: 'personal_growth',
    name: 'Personal Growth & Soul',
    badge: 'Reflective',
    description: 'Self-reflective sanctuary prioritizing inner exploration: The Unspoken sanctuary, 5,000-char markdown journal, life timeline, and multi-identity worlds.',
    targetAudience: 'Writers, thinkers, and deep feelers',
    recommendedFeatures: ['feat_the_unspoken', 'feat_personal_journal', 'feat_timeline_view', 'feat_daily_quotes', 'feat_personality_exploration', 'feat_imaginary_identities', 'feat_cinematic_profiles'],
    hiddenFeatures: ['feat_dating', 'feat_relationship_vault', 'feat_group_relationships', 'feat_two_person_questions']
  },
  {
    key: 'complete',
    name: 'Complete Universe',
    badge: 'Full Power',
    description: 'Every compatible dimension activated: romantic dating, platonic circles, private relationship vault, narrative worlds, life timeline, and emotional sanctuary.',
    targetAudience: 'Power users & digital explorers',
    recommendedFeatures: [
      'feat_dating', 'feat_friendships', 'feat_relationship_vault', 'feat_personal_journal',
      'feat_imaginary_identities', 'feat_cinematic_profiles', 'feat_group_relationships',
      'feat_ai_assistant', 'feat_daily_quotes', 'feat_personality_exploration',
      'feat_events_parties', 'feat_external_connections', 'feat_the_unspoken',
      'feat_spotify_ambient', 'feat_two_person_questions', 'feat_timeline_view'
    ],
    hiddenFeatures: []
  },
  {
    key: 'custom',
    name: 'Custom Architecture',
    badge: 'Configured',
    description: 'Handcrafted personal configuration. You choose every individual switch, visibility level, and quiet mode setting.',
    targetAudience: 'Users who know exactly what they want',
    recommendedFeatures: [],
    hiddenFeatures: []
  }
];

export const FALLBACK_FEATURES: EvaluatedFeature[] = [
  {
    id: 'feat_dating',
    name: 'Dating & Chemistry',
    category: 'social',
    tagline: 'Discover romantic chemistry through ontological compatibility and verified cards.',
    effectiveState: 'enabled',
    isVisible: true,
    isDiscoverable: true,
    requiresAi: false,
    requiresNotifications: true,
    isPremium: false,
    privacyLevel: 'selective',
    reason: 'Active',
    customConfig: {}
  },
  {
    id: 'feat_friendships',
    name: 'Friendships & Circles',
    category: 'social',
    tagline: 'Connect with kindred spirits based on passions and shared curiosity.',
    effectiveState: 'enabled',
    isVisible: true,
    isDiscoverable: true,
    requiresAi: false,
    requiresNotifications: true,
    isPremium: false,
    privacyLevel: 'public',
    reason: 'Active',
    customConfig: {}
  },
  {
    id: 'feat_relationship_vault',
    name: 'Relationship Vault & Memories',
    category: 'relationships',
    tagline: 'Private relationship memory system: important dates, promises, and Before-You-Talk briefings.',
    effectiveState: 'enabled',
    isVisible: true,
    isDiscoverable: true,
    requiresAi: false,
    requiresNotifications: true,
    isPremium: false,
    privacyLevel: 'private_encrypted',
    reason: 'Active',
    customConfig: {}
  },
  {
    id: 'feat_personal_journal',
    name: '5,000-Char Markdown Journal',
    category: 'growth',
    tagline: 'Express your inner narrative with full GitHub Flavored Markdown and visual previews.',
    effectiveState: 'enabled',
    isVisible: true,
    isDiscoverable: true,
    requiresAi: false,
    requiresNotifications: false,
    isPremium: false,
    privacyLevel: 'selective',
    reason: 'Active',
    customConfig: {}
  },
  {
    id: 'feat_imaginary_identities',
    name: 'Identity Universe & Personas',
    category: 'identity',
    tagline: 'Live multifaceted lives: Real Me, Professional Me, Cinematic Me, and creative personas.',
    effectiveState: 'enabled',
    isVisible: true,
    isDiscoverable: true,
    requiresAi: false,
    requiresNotifications: false,
    isPremium: false,
    privacyLevel: 'selective',
    reason: 'Active',
    customConfig: {}
  },
  {
    id: 'feat_cinematic_profiles',
    name: 'Cinematic Narrative Worlds',
    category: 'identity',
    tagline: 'Rich interactive profile worlds featuring background soundtracks and story chapters.',
    effectiveState: 'enabled',
    isVisible: true,
    isDiscoverable: true,
    requiresAi: false,
    requiresNotifications: false,
    isPremium: false,
    privacyLevel: 'public',
    reason: 'Active',
    customConfig: {}
  },
  {
    id: 'feat_group_relationships',
    name: 'Polycules & Chosen Family Circles',
    category: 'relationships',
    tagline: 'Modern, non-traditional relationship structures and chosen families.',
    effectiveState: 'enabled',
    isVisible: true,
    isDiscoverable: true,
    requiresAi: false,
    requiresNotifications: true,
    isPremium: false,
    privacyLevel: 'selective',
    reason: 'Active',
    customConfig: {}
  },
  {
    id: 'feat_ai_assistant',
    name: 'Soulverse Cognitive Assistant',
    category: 'intelligence',
    tagline: 'Empathetic conversation suggestions and ontological matching insights.',
    effectiveState: 'disabled',
    isVisible: true,
    isDiscoverable: true,
    requiresAi: true,
    requiresNotifications: false,
    isPremium: false,
    privacyLevel: 'strictly_local',
    reason: 'Turned off in personal preferences',
    customConfig: {}
  },
  {
    id: 'feat_daily_quotes',
    name: 'Daily Philosophy & Quotes',
    category: 'growth',
    tagline: 'Morning reflections, philosophical reminders, and daily mindful connection thoughts.',
    effectiveState: 'enabled',
    isVisible: true,
    isDiscoverable: true,
    requiresAi: false,
    requiresNotifications: true,
    isPremium: false,
    privacyLevel: 'public',
    reason: 'Active',
    customConfig: {}
  },
  {
    id: 'feat_personality_exploration',
    name: 'Personality & Value Discovery',
    category: 'growth',
    tagline: 'Psychological value mapping, attachment styles, and Big Five behavioral chemistry.',
    effectiveState: 'enabled',
    isVisible: true,
    isDiscoverable: true,
    requiresAi: false,
    requiresNotifications: false,
    isPremium: false,
    privacyLevel: 'selective',
    reason: 'Active',
    customConfig: {}
  },
  {
    id: 'feat_events_parties',
    name: 'Events & Watch Parties',
    category: 'social',
    tagline: 'Live virtual gatherings, ambient movie watch parties, and workshops.',
    effectiveState: 'enabled',
    isVisible: true,
    isDiscoverable: true,
    requiresAi: false,
    requiresNotifications: true,
    isPremium: false,
    privacyLevel: 'public',
    reason: 'Active',
    customConfig: {}
  },
  {
    id: 'feat_external_connections',
    name: 'External Social Connections',
    category: 'social',
    tagline: 'Link your Spotify, Instagram, GitHub, Discord, and Telegram profiles securely.',
    effectiveState: 'enabled',
    isVisible: true,
    isDiscoverable: true,
    requiresAi: false,
    requiresNotifications: false,
    isPremium: false,
    privacyLevel: 'selective',
    reason: 'Active',
    customConfig: {}
  },
  {
    id: 'feat_the_unspoken',
    name: 'The Unspoken: Emotional Sanctuary',
    category: 'growth',
    tagline: 'The Inner Room, Midnight Thoughts, Unopened Letters, and Unsent Words.',
    effectiveState: 'enabled',
    isVisible: true,
    isDiscoverable: true,
    requiresAi: false,
    requiresNotifications: false,
    isPremium: false,
    privacyLevel: 'strictly_local',
    reason: 'Active',
    customConfig: {}
  },
  {
    id: 'feat_spotify_ambient',
    name: 'Spotify Music Integration',
    category: 'media',
    tagline: 'Mini dock audio player, profile anthems, and shared listening rooms.',
    effectiveState: 'enabled',
    isVisible: true,
    isDiscoverable: true,
    requiresAi: false,
    requiresNotifications: false,
    isPremium: false,
    privacyLevel: 'selective',
    reason: 'Active',
    customConfig: {}
  },
  {
    id: 'feat_two_person_questions',
    name: 'One Question, Two People',
    category: 'relationships',
    tagline: 'Synchronous lock-and-reveal question game to deepen bonds in private messages.',
    effectiveState: 'enabled',
    isVisible: true,
    isDiscoverable: true,
    requiresAi: false,
    requiresNotifications: true,
    isPremium: false,
    privacyLevel: 'selective',
    reason: 'Active',
    customConfig: {}
  },
  {
    id: 'feat_timeline_view',
    name: 'Year-by-Year Life Timeline',
    category: 'identity',
    tagline: 'Visualize your journey: personal milestones, creative breakthroughs, and life chapters.',
    effectiveState: 'enabled',
    isVisible: true,
    isDiscoverable: true,
    requiresAi: false,
    requiresNotifications: false,
    isPremium: false,
    privacyLevel: 'selective',
    reason: 'Active',
    customConfig: {}
  }
];

type Listener = () => void;

export class FeatureControlService {
  private static listeners: Set<Listener> = new Set();
  private static registryCache: RegisteredFeature[] | null = null;

  public static subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private static notifyListeners() {
    this.listeners.forEach(fn => fn());
  }

  // 1. Get Evaluated Features (Local-first cache + Backend sync)
  public static getEvaluatedFeatures(): EvaluatedFeature[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_FEATURES);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to read features from localStorage', e);
    }
    return FALLBACK_FEATURES;
  }

  public static getActivePreset(): ExperiencePresetKey {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_PRESET);
      if (stored) return stored as ExperiencePresetKey;
    } catch (e) {
      console.warn('Failed to read preset from localStorage', e);
    }
    return 'complete';
  }

  // 2. Refresh from Backend API
  public static async syncFromBackend(userId: string = 'usr_me'): Promise<EvaluatedFeature[]> {
    try {
      const res = await fetch(`${API_BASE}/features/evaluation/${userId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.features && Array.isArray(data.features)) {
          localStorage.setItem(STORAGE_KEY_FEATURES, JSON.stringify(data.features));
          if (data.activePreset) {
            localStorage.setItem(STORAGE_KEY_PRESET, data.activePreset);
          }
          this.notifyListeners();
          return data.features;
        }
      }
    } catch (e) {
      console.warn('Backend sync failed, maintaining local-first state', e);
    }
    return this.getEvaluatedFeatures();
  }

  // 3. Fetch Master Registry Details
  public static async getRegistry(): Promise<RegisteredFeature[]> {
    if (this.registryCache) return this.registryCache;
    try {
      const res = await fetch(`${API_BASE}/features/registry`);
      if (res.ok) {
        const data = await res.json();
        if (data.features) {
          this.registryCache = data.features;
          return data.features;
        }
      }
    } catch (e) {
      console.warn('Failed to fetch registry from backend', e);
    }
    return [];
  }

  // 4. Quick Boolean Status Checks
  public static isFeatureEnabled(featureId: string): boolean {
    const list = this.getEvaluatedFeatures();
    const feat = list.find(f => f.id === featureId);
    return feat ? feat.effectiveState === 'enabled' : false;
  }

  public static isFeatureVisible(featureId: string): boolean {
    const list = this.getEvaluatedFeatures();
    const feat = list.find(f => f.id === featureId);
    if (!feat) return false;
    return feat.effectiveState === 'enabled' && feat.isVisible;
  }

  public static isFeatureDiscoverable(featureId: string): boolean {
    const list = this.getEvaluatedFeatures();
    const feat = list.find(f => f.id === featureId);
    return feat ? feat.isDiscoverable : true;
  }

  // 5. Update Feature Preference (Local update + Backend async dispatch)
  public static async updateFeaturePreference(
    featureId: string,
    updates: {
      state?: 'enabled' | 'disabled' | 'paused';
      isVisible?: boolean;
      isDiscoverable?: boolean;
      pausedDurationMs?: number;
    },
    userId: string = 'usr_me'
  ): Promise<void> {
    const currentList = this.getEvaluatedFeatures();
    const targetIdx = currentList.findIndex(f => f.id === featureId);
    if (targetIdx === -1) return;

    const target = { ...currentList[targetIdx] };

    if (updates.state !== undefined) {
      target.effectiveState = updates.state;
      target.reason = updates.state === 'disabled' ? 'Turned off in personal preferences' : 'Active';
    }
    if (updates.isVisible !== undefined) target.isVisible = updates.isVisible;
    if (updates.isDiscoverable !== undefined) target.isDiscoverable = updates.isDiscoverable;

    currentList[targetIdx] = target;
    localStorage.setItem(STORAGE_KEY_FEATURES, JSON.stringify(currentList));
    localStorage.setItem(STORAGE_KEY_PRESET, 'custom');
    this.notifyListeners();

    // Async sync with server
    try {
      await fetch(`${API_BASE}/features/user-preferences`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          featureId,
          state: target.effectiveState,
          isVisible: target.isVisible ? 1 : 0,
          isDiscoverable: target.isDiscoverable ? 1 : 0,
          pausedUntil: updates.pausedDurationMs ? Date.now() + updates.pausedDurationMs : null
        })
      });
    } catch (e) {
      console.error('Failed to dispatch preference update to server', e);
    }
  }

  // 6. Apply Experience Preset
  public static async applyPreset(presetKey: ExperiencePresetKey, userId: string = 'usr_me'): Promise<void> {
    const preset = EXPERIENCE_PRESETS.find(p => p.key === presetKey);
    if (!preset) return;

    const currentList = this.getEvaluatedFeatures();
    const updated = currentList.map(feat => {
      let isEnabled = false;
      let isVisible = false;

      if (presetKey === 'complete') {
        isEnabled = true;
        isVisible = true;
      } else {
        isEnabled = preset.recommendedFeatures.includes(feat.id);
        isVisible = isEnabled && !preset.hiddenFeatures.includes(feat.id);
      }

      return {
        ...feat,
        effectiveState: isEnabled ? ('enabled' as const) : ('disabled' as const),
        isVisible,
        reason: isEnabled ? 'Active via preset' : 'Turned off by preset'
      };
    });

    localStorage.setItem(STORAGE_KEY_FEATURES, JSON.stringify(updated));
    localStorage.setItem(STORAGE_KEY_PRESET, presetKey);
    this.notifyListeners();

    try {
      await fetch(`${API_BASE}/features/apply-preset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, preset: presetKey })
      });
    } catch (e) {
      console.error('Failed to apply preset to server', e);
    }
  }

  // 7. Search & Discovery
  public static searchFeatures(query: string): EvaluatedFeature[] {
    const q = query.toLowerCase().trim();
    if (!q) return this.getEvaluatedFeatures();
    return this.getEvaluatedFeatures().filter(f => 
      f.name.toLowerCase().includes(q) ||
      f.category.toLowerCase().includes(q) ||
      f.tagline.toLowerCase().includes(q)
    );
  }

  // 8. Import & Export Configuration
  public static exportConfigurationJson(): string {
    const payload = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      activePreset: this.getActivePreset(),
      features: this.getEvaluatedFeatures()
    };
    return JSON.stringify(payload, null, 2);
  }

  public static importConfigurationJson(jsonString: string): boolean {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.features && Array.isArray(parsed.features)) {
        localStorage.setItem(STORAGE_KEY_FEATURES, JSON.stringify(parsed.features));
        if (parsed.activePreset) {
          localStorage.setItem(STORAGE_KEY_PRESET, parsed.activePreset);
        }
        this.notifyListeners();
        return true;
      }
    } catch (e) {
      console.error('Failed to parse imported configuration', e);
    }
    return false;
  }

  // 9. Reset category defaults
  public static resetCategory(category: string): void {
    const currentList = this.getEvaluatedFeatures();
    const updated = currentList.map(f => {
      if (f.category === category) {
        const fb = FALLBACK_FEATURES.find(item => item.id === f.id);
        return fb || f;
      }
      return f;
    });
    localStorage.setItem(STORAGE_KEY_FEATURES, JSON.stringify(updated));
    this.notifyListeners();
  }

  // 10. Admin API methods
  public static async getAdminFeatures(): Promise<AdminFeature[]> {
    const res = await fetch(`${API_BASE}/admin/features`);
    const data = await res.json();
    return data.features || [];
  }

  public static async updateAdminFlag(
    featureId: string,
    updates: {
      isGloballyEnabled?: boolean;
      rolloutPercentage?: number;
      allowedTiers?: string[];
      allowedRoles?: string[];
      reason: string;
      adminId?: string;
      adminName?: string;
    }
  ): Promise<boolean> {
    const res = await fetch(`${API_BASE}/admin/features/${featureId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    return res.ok;
  }

  public static async tripKillSwitch(
    featureId: string,
    active: boolean,
    reason: string,
    adminId: string = 'adm_security',
    adminName: string = 'Security Officer'
  ): Promise<boolean> {
    const res = await fetch(`${API_BASE}/admin/features/${featureId}/kill-switch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active, reason, adminId, adminName })
    });
    return res.ok;
  }

  public static async getAuditLogs(): Promise<AuditLogEntry[]> {
    const res = await fetch(`${API_BASE}/admin/audit-logs`);
    const data = await res.json();
    return data.logs || [];
  }

  public static async getAdoptionStats(): Promise<FeatureAdoptionStat[]> {
    const res = await fetch(`${API_BASE}/admin/analytics/adoption`);
    const data = await res.json();
    return data.stats || [];
  }

  // 11. Feature Glossary & "What's New" Discovery
  public static async getGlossary(): Promise<any[]> {
    try {
      const res = await fetch(`${API_BASE}/features/glossary`);
      const data = await res.json();
      return data.glossary || data.terms || [];
    } catch (e) {
      console.error('Failed to fetch glossary', e);
      return [];
    }
  }

  public static async getWhatsNew(): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/features/whats-new`);
      const data = await res.json();
      return data;
    } catch (e) {
      console.error('Failed to fetch whats new', e);
      return null;
    }
  }

  // 12. Feature Dependency DAG Engine
  public static async getDependencyGraph(): Promise<any[]> {
    try {
      const res = await fetch(`${API_BASE}/admin/features/dependency-graph`);
      const data = await res.json();
      return data.graph || [];
    } catch (e) {
      console.error('Failed to fetch dependency graph', e);
      return [];
    }
  }

  public static async validateDependency(
    featureId: string, 
    dependsOnFeatureId: string
  ): Promise<{ success: boolean; isCyclic?: boolean; message?: string; error?: string }> {
    try {
      const res = await fetch(`${API_BASE}/admin/features/dependencies/validate`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-admin-id': 'usr_me'
        },
        body: JSON.stringify({ featureId, dependsOnFeatureId })
      });
      const data = await res.json();
      return data;
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }

  // 13. Configuration Versioning & 1-Click Rollback
  public static async getConfigurationVersions(): Promise<any[]> {
    try {
      const res = await fetch(`${API_BASE}/admin/configuration/versions`, {
        headers: { 'x-admin-id': 'usr_me' }
      });
      const data = await res.json();
      return data.versions || [];
    } catch (e) {
      console.error('Failed to fetch configuration versions', e);
      return [];
    }
  }

  public static async createConfigurationSnapshot(
    changeSummary: string, 
    adminId: string = 'usr_me'
  ): Promise<{ success: boolean; versionId?: string; versionNumber?: number; error?: string }> {
    try {
      const res = await fetch(`${API_BASE}/admin/configuration/create-snapshot`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-admin-id': adminId
        },
        body: JSON.stringify({ changeSummary, adminId })
      });
      return await res.json();
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }

  public static async rollbackConfiguration(
    versionId: string, 
    reason: string, 
    adminId: string = 'usr_me'
  ): Promise<{ success: boolean; rolledBackToVersion?: number; error?: string }> {
    try {
      const res = await fetch(`${API_BASE}/admin/configuration/rollback/${versionId}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-admin-id': adminId
        },
        body: JSON.stringify({ reason, adminId })
      });
      return await res.json();
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }

  // 14. Casbin RBAC Roles & Permissions
  public static async getAdminRoles(): Promise<any[]> {
    try {
      const res = await fetch(`${API_BASE}/admin/roles`, {
        headers: { 'x-admin-id': 'usr_me' }
      });
      const data = await res.json();
      return data.roles || [];
    } catch (e) {
      console.error('Failed to fetch admin roles', e);
      return [];
    }
  }

  public static async assignAdminRole(
    userId: string, 
    roleId: string, 
    reason: string = 'Role assigned via Admin Console',
    adminId: string = 'usr_me'
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const res = await fetch(`${API_BASE}/admin/roles/assign`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-admin-id': adminId
        },
        body: JSON.stringify({ userId, roleId, reason })
      });
      return await res.json();
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }

  // 15. Subscription Entitlements Matrix
  public static async getSubscriptionEntitlements(): Promise<{ tiers: any[]; matrix: any[] }> {
    try {
      const res = await fetch(`${API_BASE}/admin/subscriptions/entitlements`, {
        headers: { 'x-admin-id': 'usr_me' }
      });
      const data = await res.json();
      return { tiers: data.tiers || [], matrix: data.matrix || [] };
    } catch (e) {
      console.error('Failed to fetch subscription entitlements', e);
      return { tiers: [], matrix: [] };
    }
  }

  public static async updateSubscriptionEntitlements(
    featureId: string, 
    allowedTiers: string[], 
    reason: string = 'Tier entitlements updated'
  ): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/admin/subscriptions/entitlements`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'x-admin-id': 'usr_me'
        },
        body: JSON.stringify({ featureId, allowedTiers, reason })
      });
      return res.ok;
    } catch (e) {
      console.error('Failed to update subscription entitlements', e);
      return false;
    }
  }

  // 16. Remote Config JSON Editor
  public static async updateRemoteConfig(
    featureId: string, 
    customConfig: any, 
    reason: string = 'Remote config hot update'
  ): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/admin/features/${featureId}/config`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'x-admin-id': 'usr_me'
        },
        body: JSON.stringify({ customConfig, reason })
      });
      return res.ok;
    } catch (e) {
      console.error('Failed to update remote config', e);
      return false;
    }
  }

  // 17. SQLite Database Operations
  public static async walCheckpoint(): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/admin/system/wal-checkpoint`, {
        method: 'POST',
        headers: { 'x-admin-id': 'usr_me' }
      });
      return await res.json();
    } catch (e: any) {
      return { error: e.message };
    }
  }

  public static async vacuumDatabase(): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/admin/system/vacuum`, {
        method: 'POST',
        headers: { 'x-admin-id': 'usr_me' }
      });
      return await res.json();
    } catch (e: any) {
      return { error: e.message };
    }
  }
}
