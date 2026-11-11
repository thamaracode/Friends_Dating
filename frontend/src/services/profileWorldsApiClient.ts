import type { 
  ProfileWorld, 
  ProfileWorldSection, 
  ProfileWorldEntry, 
  ProfileWorldRelation 
} from '../types/profileWorlds';

const API_BASE = 'http://127.0.0.1:3001/api/v1';

class ProfileWorldsApiClient {
  async getWorlds(userId: string, viewerId: string = 'usr_me'): Promise<ProfileWorld[]> {
    const res = await fetch(`${API_BASE}/worlds/user/${userId}?viewerId=${viewerId}`);
    const data = await res.json();
    return data.worlds || [];
  }

  async getWorldDetails(worldId: string, viewerId: string = 'usr_me'): Promise<{
    world: ProfileWorld;
    sections: ProfileWorldSection[];
    entries: ProfileWorldEntry[];
    relations: ProfileWorldRelation[];
    isOwner: boolean;
  }> {
    const res = await fetch(`${API_BASE}/worlds/${worldId}?viewerId=${viewerId}`);
    return res.json();
  }

  async createWorld(payload: Partial<ProfileWorld> & { template_id?: string }): Promise<ProfileWorld> {
    const res = await fetch(`${API_BASE}/worlds`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    return data.world;
  }

  async updateWorld(worldId: string, payload: Partial<ProfileWorld>): Promise<ProfileWorld> {
    const res = await fetch(`${API_BASE}/worlds/${worldId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    return data.world;
  }

  async duplicateWorld(worldId: string): Promise<ProfileWorld> {
    const res = await fetch(`${API_BASE}/worlds/${worldId}/duplicate`, {
      method: 'POST'
    });
    const data = await res.json();
    return data.world;
  }

  async deleteWorld(worldId: string): Promise<boolean> {
    const res = await fetch(`${API_BASE}/worlds/${worldId}`, {
      method: 'DELETE'
    });
    const data = await res.json();
    return data.success;
  }

  async createSection(worldId: string, payload: Partial<ProfileWorldSection>): Promise<ProfileWorldSection> {
    const res = await fetch(`${API_BASE}/worlds/${worldId}/sections`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    return data.section;
  }

  async deleteSection(sectionId: string): Promise<boolean> {
    const res = await fetch(`${API_BASE}/worlds/sections/${sectionId}`, {
      method: 'DELETE'
    });
    const data = await res.json();
    return data.success;
  }

  async createEntry(worldId: string, payload: Partial<ProfileWorldEntry>): Promise<ProfileWorldEntry> {
    const res = await fetch(`${API_BASE}/worlds/${worldId}/entries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    return data.entry;
  }

  async deleteEntry(entryId: string): Promise<boolean> {
    const res = await fetch(`${API_BASE}/worlds/entries/${entryId}`, {
      method: 'DELETE'
    });
    const data = await res.json();
    return data.success;
  }

  async createRelation(sourceWorldId: string, sourceEntryId: string, targetWorldId: string, relationType?: string): Promise<boolean> {
    const res = await fetch(`${API_BASE}/worlds/entries/reference`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sourceWorldId, sourceEntryId, targetWorldId, relationType })
    });
    const data = await res.json();
    return data.success;
  }
}

export const profileWorldsClient = new ProfileWorldsApiClient();
