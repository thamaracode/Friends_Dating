import {
  PsychologyConcept,
  ConceptualDomain,
  FrameworkType,
  UserPersonalityProfile,
  ReflectionExercise,
  UserReflectionResponse,
  UserPerceptionFeedback,
  UserTraitHistorySnapshot,
  CompatibilityResonanceReport
} from '../types/personalityFramework';

const API_BASE = '/api/v1/psychology';

export const personalityApiClient = {
  // 1. Concepts
  async getConcepts(params?: { domain?: ConceptualDomain; frameworkType?: FrameworkType; search?: string }): Promise<PsychologyConcept[]> {
    const searchParams = new URLSearchParams();
    if (params?.domain) searchParams.set('domain', params.domain);
    if (params?.frameworkType) searchParams.set('frameworkType', params.frameworkType);
    if (params?.search) searchParams.set('search', params.search);

    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    const res = await fetch(`${API_BASE}/concepts${query}`);
    const data = await res.json();
    return data.concepts || [];
  },

  async getConceptById(id: string): Promise<PsychologyConcept | null> {
    const res = await fetch(`${API_BASE}/concepts/${id}`);
    if (!res.ok) return null;
    const data = await res.json();
    return data.concept || null;
  },

  // 2. Profile
  async getUserProfile(userId: string, viewerId: string = 'usr_me'): Promise<UserPersonalityProfile | null> {
    const res = await fetch(`${API_BASE}/profile/${userId}?viewerId=${viewerId}`);
    if (!res.ok) return null;
    const data = await res.json();
    return data.profile || null;
  },

  async saveUserProfile(payload: Partial<UserPersonalityProfile>): Promise<UserPersonalityProfile> {
    const res = await fetch(`${API_BASE}/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to save personality profile');
    return data.profile;
  },

  // 3. Exercises
  async getExercises(domain?: ConceptualDomain): Promise<ReflectionExercise[]> {
    const query = domain ? `?domain=${domain}` : '';
    const res = await fetch(`${API_BASE}/exercises${query}`);
    const data = await res.json();
    return data.exercises || [];
  },

  async submitExercise(
    exerciseId: string,
    payload: {
      userId?: string;
      answers: Record<string, any>;
      personalTakeaway?: string;
      visibility?: 'private' | 'friends_only' | 'public';
    }
  ): Promise<UserReflectionResponse> {
    const res = await fetch(`${API_BASE}/exercises/${exerciseId}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to submit reflection exercise');
    return data.response;
  },

  async getUserResponses(userId: string, viewerId: string = 'usr_me'): Promise<UserReflectionResponse[]> {
    const res = await fetch(`${API_BASE}/exercises/user/${userId}?viewerId=${viewerId}`);
    const data = await res.json();
    return data.responses || [];
  },

  // 4. Perception Feedback
  async submitPerceptionFeedback(
    targetUserId: string,
    payload: {
      authorUserId?: string;
      strengths_observed: string[];
      communication_impression: string;
      values_witnessed: string[];
      warmth_resonance_rating?: number;
      constructive_perspective?: string;
      is_anonymous?: boolean;
    }
  ): Promise<UserPerceptionFeedback> {
    const res = await fetch(`${API_BASE}/feedback/${targetUserId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to submit perception feedback');
    return data.feedback;
  },

  async getPerceptionFeedback(targetUserId: string, viewerId: string = 'usr_me'): Promise<UserPerceptionFeedback[]> {
    const res = await fetch(`${API_BASE}/feedback/${targetUserId}?viewerId=${viewerId}`);
    const data = await res.json();
    return data.feedback || [];
  },

  // 5. History
  async recordTraitSnapshot(payload: {
    userId?: string;
    snapshotLabel: string;
    growthReflections?: string;
  }): Promise<UserTraitHistorySnapshot> {
    const res = await fetch(`${API_BASE}/history/snapshot`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to record snapshot');
    return data.snapshot;
  },

  async getUserTraitHistory(userId: string, viewerId: string = 'usr_me'): Promise<UserTraitHistorySnapshot[]> {
    const res = await fetch(`${API_BASE}/history/${userId}?viewerId=${viewerId}`);
    const data = await res.json();
    return data.snapshots || [];
  },

  // 6. Compatibility
  async calculateCompatibility(userAId: string, userBId: string): Promise<CompatibilityResonanceReport> {
    const res = await fetch(`${API_BASE}/compatibility`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userAId, userBId })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to calculate compatibility report');
    return data.report;
  }
};
