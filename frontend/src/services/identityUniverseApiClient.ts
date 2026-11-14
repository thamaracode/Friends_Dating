import type {
  UserIdentity,
  FictionalUniverse,
  UniversalTimelineEvent,
  PrivateViewerNote,
  ProfileSocialFeedback,
  RegisteredExternalGame,
  RelationshipMetrics
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
