import type {
  UserIdentity,
  FictionalUniverse,
  UniversalTimelineEvent,
  PrivateViewerNote,
  ProfileSocialFeedback,
  RegisteredExternalGame,
  RelationshipMetrics,
  IdentityCustomSection,
  IdentityTimelineEvent
} from '../types/identityUniverse';

import { API_BASE_V1 as API_BASE } from './apiConfig';

class IdentityUniverseApiClient {
  // 1. Identities
  async getUserIdentities(userId: string, viewerId: string = 'usr_me'): Promise<{ identities: UserIdentity[]; isOwner: boolean }> {
    const res = await fetch(`${API_BASE}/identities/user/${userId}?viewerId=${viewerId}`);
    return res.json();
  }

  async getIdentity(identityId: string, viewerId: string = 'usr_me'): Promise<{ identity: UserIdentity; isOwner: boolean }> {
    const res = await fetch(`${API_BASE}/identities/${identityId}?viewerId=${viewerId}`);
    return res.json();
  }

  async createIdentity(payload: Partial<UserIdentity>): Promise<{ identity: UserIdentity }> {
    const res = await fetch(`${API_BASE}/identities`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return res.json();
  }

  async updateIdentity(identityId: string, payload: Partial<UserIdentity>): Promise<boolean> {
    const res = await fetch(`${API_BASE}/identities/${identityId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    return data.success;
  }

  async duplicateIdentity(identityId: string, userId: string = 'usr_me'): Promise<UserIdentity> {
    const res = await fetch(`${API_BASE}/identities/${identityId}/duplicate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    });
    const data = await res.json();
    return data.identity;
  }

  async deleteIdentity(identityId: string, userId: string = 'usr_me'): Promise<boolean> {
    const res = await fetch(`${API_BASE}/identities/${identityId}?userId=${userId}`, {
      method: 'DELETE'
    });
    const data = await res.json();
    return data.success;
  }

  // 1.1 Custom Sections
  async getCustomSections(identityId: string, viewerId: string = 'usr_me'): Promise<IdentityCustomSection[]> {
    const res = await fetch(`${API_BASE}/identities/${identityId}/sections?viewerId=${viewerId}`);
    const data = await res.json();
    return data.sections || [];
  }

  async createCustomSection(identityId: string, payload: Partial<IdentityCustomSection>, userId: string = 'usr_me'): Promise<IdentityCustomSection> {
    const res = await fetch(`${API_BASE}/identities/${identityId}/sections`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...payload, userId })
    });
    const data = await res.json();
    return data.section;
  }

  async updateCustomSection(identityId: string, sectionId: string, payload: Partial<IdentityCustomSection>, userId: string = 'usr_me'): Promise<IdentityCustomSection> {
    const res = await fetch(`${API_BASE}/identities/${identityId}/sections/${sectionId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...payload, userId })
    });
    const data = await res.json();
    return data.section;
  }

  async deleteCustomSection(identityId: string, sectionId: string, userId: string = 'usr_me'): Promise<boolean> {
    const res = await fetch(`${API_BASE}/identities/${identityId}/sections/${sectionId}?userId=${userId}`, {
      method: 'DELETE'
    });
    const data = await res.json();
    return data.success;
  }

  // 1.2 Identity Timeline Events (-1500 BCE, 0, CE, Future)
  async getTimelineEvents(identityId: string, viewerId: string = 'usr_me', nature?: string): Promise<IdentityTimelineEvent[]> {
    let url = `${API_BASE}/identities/${identityId}/timeline?viewerId=${viewerId}`;
    if (nature) url += `&nature=${encodeURIComponent(nature)}`;
    const res = await fetch(url);
    const data = await res.json();
    return data.events || [];
  }

  async createTimelineEvent(identityId: string, payload: Partial<IdentityTimelineEvent>, userId: string = 'usr_me'): Promise<IdentityTimelineEvent> {
    const res = await fetch(`${API_BASE}/identities/${identityId}/timeline`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...payload, userId })
    });
    const data = await res.json();
    return data.event;
  }

  async updateTimelineEvent(identityId: string, eventId: string, payload: Partial<IdentityTimelineEvent>, userId: string = 'usr_me'): Promise<IdentityTimelineEvent> {
    const res = await fetch(`${API_BASE}/identities/${identityId}/timeline/${eventId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...payload, userId })
    });
    const data = await res.json();
    return data.event;
  }

  async deleteTimelineEvent(identityId: string, eventId: string, userId: string = 'usr_me'): Promise<boolean> {
    const res = await fetch(`${API_BASE}/identities/${identityId}/timeline/${eventId}?userId=${userId}`, {
      method: 'DELETE'
    });
    const data = await res.json();
    return data.success;
  }

  // 2. Fictional Universes
  async getUniverses(viewerId: string = 'usr_me'): Promise<FictionalUniverse[]> {
    const res = await fetch(`${API_BASE}/universes?viewerId=${viewerId}`);
    const data = await res.json();
    return data.universes || [];
  }

  async createUniverse(payload: Partial<FictionalUniverse>): Promise<FictionalUniverse> {
    const res = await fetch(`${API_BASE}/universes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    return data.universe;
  }

  // 3. Universal Life Timeline
  async getUniversalTimeline(userId: string, viewerId: string = 'usr_me', order: 'asc' | 'desc' = 'asc'): Promise<UniversalTimelineEvent[]> {
    const res = await fetch(`${API_BASE}/universal-timeline/user/${userId}?viewerId=${viewerId}&order=${order}`);
    const data = await res.json();
    return data.events || [];
  }

  async createUniversalEvent(payload: Partial<UniversalTimelineEvent>): Promise<UniversalTimelineEvent> {
    const res = await fetch(`${API_BASE}/universal-timeline`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    return data.event;
  }

  // 4. Private Viewer Notes (Telegram contact notes)
  async getViewerNote(targetUserId: string, viewerId: string = 'usr_me'): Promise<PrivateViewerNote | null> {
    const res = await fetch(`${API_BASE}/viewer-notes/${targetUserId}?viewerId=${viewerId}`, {
      headers: { 'x-user-id': viewerId }
    });
    const data = await res.json();
    return data.note;
  }

  async saveViewerNote(targetUserId: string, noteContent: string, viewerId: string = 'usr_me'): Promise<PrivateViewerNote> {
    const res = await fetch(`${API_BASE}/viewer-notes/${targetUserId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': viewerId
      },
      body: JSON.stringify({ noteContent, viewerId })
    });
    const data = await res.json();
    return data.note;
  }

  async deleteViewerNote(targetUserId: string, viewerId: string = 'usr_me'): Promise<boolean> {
    const res = await fetch(`${API_BASE}/viewer-notes/${targetUserId}?viewerId=${viewerId}`, {
      method: 'DELETE',
      headers: { 'x-user-id': viewerId }
    });
    const data = await res.json();
    return data.success;
  }

  // 5. Social Feedback & Community Traits
  async getSocialFeedback(targetUserId: string, viewerId: string = 'usr_me'): Promise<ProfileSocialFeedback> {
    const res = await fetch(`${API_BASE}/social-feedback/${targetUserId}?viewerId=${viewerId}`);
    return res.json();
  }

  async castVote(targetUserId: string, voteType: 'like' | 'dislike', voterId: string = 'usr_me'): Promise<'like' | 'dislike' | null> {
    const res = await fetch(`${API_BASE}/social-feedback/vote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ voterId, targetUserId, voteType })
    });
    const data = await res.json();
    return data.activeVote;
  }

  async toggleTraitVote(targetUserId: string, traitSlug: string, voterId: string = 'usr_me'): Promise<boolean> {
    const res = await fetch(`${API_BASE}/social-feedback/trait`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ voterId, targetUserId, traitSlug })
    });
    const data = await res.json();
    return data.active;
  }

  // 6. External Games & Sandboxed Embedding
  async getExternalGames(): Promise<RegisteredExternalGame[]> {
    const res = await fetch(`${API_BASE}/games/external`);
    const data = await res.json();
    return data.games || [];
  }

  async registerExternalGame(payload: Partial<RegisteredExternalGame>): Promise<RegisteredExternalGame> {
    const res = await fetch(`${API_BASE}/games/external/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    return data.game;
  }

  // 7. Relationship Interaction Metrics
  async getRelationshipMetrics(otherUserId: string, viewerId: string = 'usr_me'): Promise<RelationshipMetrics> {
    const res = await fetch(`${API_BASE}/relationship-metrics/${otherUserId}?viewerId=${viewerId}`);
    const data = await res.json();
    return data.metrics;
  }

  async voluntarilyShareItem(recipientId: string, itemType: string, itemId: string, ownerId: string = 'usr_me'): Promise<boolean> {
    const res = await fetch(`${API_BASE}/relationship-metrics/voluntary-share`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ownerId, recipientId, itemType, itemId })
    });
    const data = await res.json();
    return data.success;
  }
}

export const identityUniverseClient = new IdentityUniverseApiClient();
