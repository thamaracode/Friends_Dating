import type { 
  ConfessionStory, 
  CreateConfessionPayload, 
  ConfessionReactionType,
  ConfessionCategory,
  ConfessionVisibility 
} from '../types/confession';

const API_BASE = '/api/v1/confessions';

export const INITIAL_SEED_CONFESSIONS: ConfessionStory[] = [
  {
    id: 'cnf_seed_1',
    userId: 'usr_anon_1',
    title: 'I still drive past the café where we said goodbye',
    story: 'It has been three years since you moved to Berlin. Every Sunday evening on my way back from the studio, I take the longer boulevard route just to see the warm yellow streetlights through the windows of that corner table. I never stop. I never go inside. I just want to remember that for two hours on a rainy October night, we were completely honest with each other.',
    category: 'love_heartbreak',
    mood: 'nostalgic',
    visibility: 'anonymous',
    authorAlias: 'Rainy Boulevard #482',
    isSensitive: false,
    reactionHugs: 42,
    reactionRelatable: 87,
    reactionPeace: 19,
    reactionSecrets: 31,
    userReactions: ['relatable'],
    createdAt: Date.now() - 3600000 * 5,
    updatedAt: Date.now() - 3600000 * 5
  },
  {
    id: 'cnf_seed_2',
    userId: 'usr_me',
    title: 'Behind the confident persona, I feel like an impostor every day',
    story: 'Everyone around me treats me like the calm, collected problem solver who always knows what to do next. When I close my apartment door at night, the silence feels overwhelming. I am terrified that one day people will realize I am just guessing and doing my best not to fall apart.',
    category: 'secret_identity',
    mood: 'vulnerable',
    visibility: 'anonymous',
    authorAlias: 'Quiet Thinker #109',
    isSensitive: false,
    reactionHugs: 114,
    reactionRelatable: 156,
    reactionPeace: 34,
    reactionSecrets: 62,
    userReactions: ['hugs'],
    createdAt: Date.now() - 3600000 * 18,
    updatedAt: Date.now() - 3600000 * 18,
    isOwner: true
  },
  {
    id: 'cnf_seed_3',
    userId: 'usr_alex',
    title: 'I never told you why I left the party early',
    story: 'You were laughing with someone else under the string lights by the balcony, and you looked so effortlessly happy. I realized in that split second that the future I had been imagining for months only existed inside my head. Leaving without saying goodbye was cowardice, but watching you forget me in real time would have broken whatever composure I had left.',
    category: 'unsent_feelings',
    mood: 'heartbroken',
    visibility: 'public',
    authorName: 'Alex Rivera',
    authorAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80',
    isSensitive: false,
    reactionHugs: 67,
    reactionRelatable: 93,
    reactionPeace: 12,
    reactionSecrets: 45,
    userReactions: [],
    createdAt: Date.now() - 3600000 * 32,
    updatedAt: Date.now() - 3600000 * 32
  },
  {
    id: 'cnf_seed_4',
    userId: 'usr_me',
    title: 'The unwritten letter to my younger self',
    story: 'You thought being alone meant you were unlovable. It didn’t. It just meant the people around you at nineteen hadn’t learned how to see beyond the surface yet. Stop apologizing for the depth of your feelings.',
    category: 'healing_recovery',
    mood: 'liberated',
    visibility: 'private',
    authorAlias: 'Private Vault',
    isSensitive: false,
    reactionHugs: 0,
    reactionRelatable: 0,
    reactionPeace: 0,
    reactionSecrets: 0,
    createdAt: Date.now() - 3600000 * 72,
    updatedAt: Date.now() - 3600000 * 72,
    isOwner: true
  }
];

class ConfessionsApiClient {
  private localCache: ConfessionStory[] = [...INITIAL_SEED_CONFESSIONS];

  async getConfessions(category?: string, visibility?: string): Promise<ConfessionStory[]> {
    try {
      const params = new URLSearchParams();
      if (category && category !== 'all') params.append('category', category);
      if (visibility && visibility !== 'all') params.append('visibility', visibility);

      const res = await fetch(`${API_BASE}?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (data.confessions && Array.isArray(data.confessions)) {
          return data.confessions;
        }
      }
    } catch {
      // Fallback to local cache if network/backend unavailable
    }

    let filtered = this.localCache.filter(c => c.visibility !== 'private' || c.isOwner);
    if (category && category !== 'all') {
      filtered = filtered.filter(c => c.category === category);
    }
    if (visibility && visibility !== 'all') {
      filtered = filtered.filter(c => c.visibility === visibility);
    }
    return filtered;
  }

  async getMyConfessions(): Promise<ConfessionStory[]> {
    try {
      const res = await fetch(`${API_BASE}/my`, {
        headers: { 'x-user-id': 'usr_me' }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.confessions) return data.confessions;
      }
    } catch {
      // Fallback
    }

    return this.localCache.filter(c => c.isOwner || c.userId === 'usr_me');
  }

  async createConfession(payload: CreateConfessionPayload): Promise<ConfessionStory> {
    try {
      const res = await fetch(API_BASE, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-id': 'usr_me'
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const data = await res.json();
        if (data.confession) {
          this.localCache.unshift(data.confession);
          return data.confession;
        }
      }
    } catch {
      // Fallback local creation
    }

    const newConfession: ConfessionStory = {
      id: `cnf_${Date.now()}`,
      userId: 'usr_me',
      title: payload.title.trim(),
      story: payload.story.trim(),
      category: payload.category,
      mood: payload.mood,
      visibility: payload.visibility,
      authorAlias: payload.visibility === 'anonymous' ? (payload.customAlias || `Midnight Soul #${Math.floor(Math.random() * 900) + 100}`) : undefined,
      authorName: payload.visibility === 'public' ? 'Kavindu Senanayake' : undefined,
      authorAvatar: payload.visibility === 'public' ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80' : undefined,
      isSensitive: payload.isSensitive || false,
      reactionHugs: 0,
      reactionRelatable: 0,
      reactionPeace: 0,
      reactionSecrets: 0,
      userReactions: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      isOwner: true
    };

    this.localCache.unshift(newConfession);
    return newConfession;
  }

  async reactToConfession(confessionId: string, reactionType: ConfessionReactionType): Promise<ConfessionStory | null> {
    try {
      const res = await fetch(`${API_BASE}/${confessionId}/react`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': 'usr_me'
        },
        body: JSON.stringify({ reactionType })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.confession) return data.confession;
      }
    } catch {
      // Fallback
    }

    const target = this.localCache.find(c => c.id === confessionId);
    if (!target) return null;

    const hasReacted = target.userReactions?.includes(reactionType);
    if (hasReacted) {
      target.userReactions = target.userReactions?.filter(r => r !== reactionType);
      if (reactionType === 'hugs') target.reactionHugs = Math.max(0, target.reactionHugs - 1);
      if (reactionType === 'relatable') target.reactionRelatable = Math.max(0, target.reactionRelatable - 1);
      if (reactionType === 'peace') target.reactionPeace = Math.max(0, target.reactionPeace - 1);
      if (reactionType === 'secrets') target.reactionSecrets = Math.max(0, target.reactionSecrets - 1);
    } else {
      target.userReactions = [...(target.userReactions || []), reactionType];
      if (reactionType === 'hugs') target.reactionHugs++;
      if (reactionType === 'relatable') target.reactionRelatable++;
      if (reactionType === 'peace') target.reactionPeace++;
      if (reactionType === 'secrets') target.reactionSecrets++;
    }

    return { ...target };
  }

  async deleteConfession(confessionId: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/${confessionId}`, {
        method: 'DELETE',
        headers: { 'x-user-id': 'usr_me' }
      });
      if (res.ok) {
        this.localCache = this.localCache.filter(c => c.id !== confessionId);
        return true;
      }
    } catch {
      // Fallback
    }

    this.localCache = this.localCache.filter(c => c.id !== confessionId);
    return true;
  }
}

export const confessionsApiClient = new ConfessionsApiClient();
