import { BACKEND_URL } from './apiConfig';
import type {
  DiscoveryFeedFilters,
  DiscoveryFeedResponse,
  DiscoveryProfile,
  ExplainableResonanceReport,
  MatchingTerminologyConcept,
  ConnectionTypeMetadata,
  InteractionType,
  ConnectionType,
  UserConnection,
  ConnectionRequest,
  DiscoveryFeedItem
} from '../types/discovery';

class DiscoveryApiClient {
  private getHeaders(userId: string = 'usr_me'): HeadersInit {
    return {
      'Content-Type': 'application/json',
      'x-user-id': userId
    };
  }

  public async getTerminology(): Promise<{
    concepts: MatchingTerminologyConcept[];
    connectionTypes: Record<ConnectionType, ConnectionTypeMetadata>;
  }> {
    const res = await fetch(`${BACKEND_URL}/api/v1/discovery/terminology`);
    if (!res.ok) throw new Error('Failed to load matching terminology');
    const data = await res.json();
    return {
      concepts: data.concepts,
      connectionTypes: data.connectionTypes
    };
  }

  public async getDiscoveryFeed(
    userId: string = 'usr_me',
    filters: DiscoveryFeedFilters = {}
  ): Promise<DiscoveryFeedResponse> {
    const query = new URLSearchParams();
    if (filters.connectionType && filters.connectionType !== 'all') {
      query.set('connectionType', filters.connectionType);
    }
    if (filters.minAge) query.set('minAge', filters.minAge.toString());
    if (filters.maxAge) query.set('maxAge', filters.maxAge.toString());
    if (filters.city) query.set('city', filters.city);
    if (filters.interests && filters.interests.length > 0) {
      query.set('interests', filters.interests.join(','));
    }
    if (filters.values && filters.values.length > 0) {
      query.set('values', filters.values.join(','));
    }
    if (filters.sortBy) query.set('sortBy', filters.sortBy);
    if (filters.page) query.set('page', filters.page.toString());
    if (filters.limit) query.set('limit', filters.limit.toString());

    const res = await fetch(`${BACKEND_URL}/api/v1/discovery/feed?${query.toString()}`, {
      headers: this.getHeaders(userId)
    });
    if (!res.ok) throw new Error('Failed to load discovery feed');
    return res.json();
  }

  public async getProfile(targetUserId: string): Promise<DiscoveryProfile> {
    const res = await fetch(`${BACKEND_URL}/api/v1/discovery/profile/${targetUserId}`);
    if (!res.ok) throw new Error('Failed to load discovery profile');
    const data = await res.json();
    return data.profile;
  }

  public async updateProfile(profile: Partial<DiscoveryProfile>, userId: string = 'usr_me'): Promise<DiscoveryProfile> {
    const res = await fetch(`${BACKEND_URL}/api/v1/discovery/profile`, {
      method: 'PUT',
      headers: this.getHeaders(userId),
      body: JSON.stringify(profile)
    });
    if (!res.ok) throw new Error('Failed to update discovery profile');
    const data = await res.json();
    return data.profile;
  }

  public async explainResonance(
    targetUserId: string,
    userId: string = 'usr_me'
  ): Promise<ExplainableResonanceReport> {
    const res = await fetch(`${BACKEND_URL}/api/v1/discovery/explain/${targetUserId}`, {
      headers: this.getHeaders(userId)
    });
    if (!res.ok) throw new Error('Failed to calculate explainable resonance');
    const data = await res.json();
    return data.report;
  }

  public async recordInteraction(
    targetUserId: string,
    type: InteractionType,
    connectionType: ConnectionType = 'friendship',
    userId: string = 'usr_me'
  ): Promise<{ success: boolean; mutualMatchEstablished: boolean; connection?: UserConnection }> {
    const res = await fetch(`${BACKEND_URL}/api/v1/discovery/interact`, {
      method: 'POST',
      headers: this.getHeaders(userId),
      body: JSON.stringify({ targetUserId, type, connectionType })
    });
    if (!res.ok) throw new Error('Failed to record interaction');
    return res.json();
  }

  public async sendConnectionRequest(
    recipientId: string,
    connectionType: ConnectionType,
    note?: string,
    userId: string = 'usr_me'
  ): Promise<{ success: boolean; request?: ConnectionRequest; error?: string }> {
    const res = await fetch(`${BACKEND_URL}/api/v1/discovery/connect`, {
      method: 'POST',
      headers: this.getHeaders(userId),
      body: JSON.stringify({ recipientId, connectionType, note })
    });
    return res.json();
  }

  public async respondToRequest(
    requestId: string,
    action: 'accept' | 'decline',
    userId: string = 'usr_me'
  ): Promise<{ success: boolean; connection?: UserConnection }> {
    const res = await fetch(`${BACKEND_URL}/api/v1/discovery/requests/${requestId}/respond`, {
      method: 'POST',
      headers: this.getHeaders(userId),
      body: JSON.stringify({ action })
    });
    if (!res.ok) throw new Error('Failed to respond to request');
    return res.json();
  }

  public async getConnections(
    type?: ConnectionType,
    userId: string = 'usr_me'
  ): Promise<UserConnection[]> {
    const url = type 
      ? `${BACKEND_URL}/api/v1/discovery/connections?type=${type}` 
      : `${BACKEND_URL}/api/v1/discovery/connections`;
    const res = await fetch(url, { headers: this.getHeaders(userId) });
    if (!res.ok) throw new Error('Failed to load connections');
    const data = await res.json();
    return data.connections;
  }

  public async unmatch(targetUserId: string, userId: string = 'usr_me'): Promise<boolean> {
    const res = await fetch(`${BACKEND_URL}/api/v1/discovery/unmatch`, {
      method: 'POST',
      headers: this.getHeaders(userId),
      body: JSON.stringify({ targetUserId })
    });
    if (!res.ok) return false;
    const data = await res.json();
    return data.success;
  }

  public async getSavedProfiles(userId: string = 'usr_me'): Promise<DiscoveryFeedItem[]> {
    const res = await fetch(`${BACKEND_URL}/api/v1/discovery/saved`, {
      headers: this.getHeaders(userId)
    });
    if (!res.ok) throw new Error('Failed to load saved profiles');
    const data = await res.json();
    return data.items;
  }

  public async resetPasses(userId: string = 'usr_me'): Promise<number> {
    const res = await fetch(`${BACKEND_URL}/api/v1/discovery/passes/reset`, {
      method: 'POST',
      headers: this.getHeaders(userId)
    });
    if (!res.ok) throw new Error('Failed to reset passes');
    const data = await res.json();
    return data.clearedCount;
  }
}

export const discoveryApiClient = new DiscoveryApiClient();
