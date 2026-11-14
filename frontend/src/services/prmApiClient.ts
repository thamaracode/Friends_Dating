import { BACKEND_URL } from './apiConfig';

export interface PrmLifecycleMeta {
  phase: string;
  label: string;
  description: string;
  badgeColor: string;
}

class PrmApiClient {
  private getHeaders(userId: string = 'usr_me'): HeadersInit {
    return {
      'Content-Type': 'application/json',
      'x-user-id': userId
    };
  }

  public async getMetadata(): Promise<{ lifecyclePhases: Record<string, PrmLifecycleMeta> }> {
    const res = await fetch(`${BACKEND_URL}/api/v1/vault/metadata`);
    if (!res.ok) throw new Error('Failed to load vault metadata');
    return res.json();
  }

  public async listPersons(userId: string = 'usr_me', category?: string, status?: string): Promise<any[]> {
    const query = new URLSearchParams();
    if (category) query.set('category', category);
    if (status) query.set('status', status);

    const res = await fetch(`${BACKEND_URL}/api/v1/vault/persons?${query.toString()}`, {
      headers: this.getHeaders(userId)
    });
    if (!res.ok) throw new Error('Failed to load managed relationships');
    const data = await res.json();
    return data.persons;
  }

  public async getPerson(id: string, userId: string = 'usr_me'): Promise<any> {
    const res = await fetch(`${BACKEND_URL}/api/v1/vault/persons/${id}`, {
      headers: this.getHeaders(userId)
    });
    if (!res.ok) throw new Error('Person record not found');
    const data = await res.json();
    return data.person;
  }

  public async getDossier(id: string, userId: string = 'usr_me'): Promise<any> {
    const res = await fetch(`${BACKEND_URL}/api/v1/vault/persons/${id}/dossier`, {
      headers: this.getHeaders(userId)
    });
    if (!res.ok) throw new Error('Failed to load dossier');
    const data = await res.json();
    return data.dossier;
  }

  public async createPerson(data: any, userId: string = 'usr_me'): Promise<any> {
    const res = await fetch(`${BACKEND_URL}/api/v1/vault/persons`, {
      method: 'POST',
      headers: this.getHeaders(userId),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to create person record');
    const resData = await res.json();
    return resData.person;
  }

  public async updatePerson(id: string, updates: any, userId: string = 'usr_me'): Promise<any> {
    const res = await fetch(`${BACKEND_URL}/api/v1/vault/persons/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(userId),
      body: JSON.stringify(updates)
    });
    if (!res.ok) throw new Error('Failed to update person record');
    const resData = await res.json();
    return resData.person;
  }

  public async deletePerson(id: string, userId: string = 'usr_me'): Promise<boolean> {
    const res = await fetch(`${BACKEND_URL}/api/v1/vault/persons/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(userId)
    });
    if (!res.ok) throw new Error('Failed to delete person record');
    const data = await res.json();
    return data.success;
  }

  public async getBriefing(personId: string, userId: string = 'usr_me'): Promise<any> {
    const res = await fetch(`${BACKEND_URL}/api/v1/vault/persons/${personId}/briefing`, {
      headers: this.getHeaders(userId)
    });
    if (!res.ok) throw new Error('Failed to load briefing');
    const data = await res.json();
    return data.briefing;
  }

  public async getAiInsights(personId: string, userId: string = 'usr_me'): Promise<any> {
    const res = await fetch(`${BACKEND_URL}/api/v1/vault/persons/${personId}/ai-insights`, {
      headers: this.getHeaders(userId)
    });
    if (!res.ok) throw new Error('Failed to generate AI insights');
    const data = await res.json();
    return data.insights;
  }

  public async logInteraction(personId: string, data: any, userId: string = 'usr_me'): Promise<any> {
    const res = await fetch(`${BACKEND_URL}/api/v1/vault/persons/${personId}/interactions`, {
      method: 'POST',
      headers: this.getHeaders(userId),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to log interaction');
    const resData = await res.json();
    return resData.interaction;
  }

  public async addMemory(personId: string, data: any, userId: string = 'usr_me'): Promise<any> {
    const res = await fetch(`${BACKEND_URL}/api/v1/vault/persons/${personId}/memories`, {
      method: 'POST',
      headers: this.getHeaders(userId),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to add memory');
    const resData = await res.json();
    return resData.memory;
  }

  public async updateMemory(memoryId: string, data: any, userId: string = 'usr_me'): Promise<any> {
    const res = await fetch(`${BACKEND_URL}/api/v1/vault/memories/${memoryId}`, {
      method: 'PUT',
      headers: this.getHeaders(userId),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to update memory');
    const resData = await res.json();
    return resData.memory;
  }

  public async addCommitment(personId: string, data: any, userId: string = 'usr_me'): Promise<any> {
    const res = await fetch(`${BACKEND_URL}/api/v1/vault/persons/${personId}/commitments`, {
      method: 'POST',
      headers: this.getHeaders(userId),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to add commitment');
    const resData = await res.json();
    return resData.commitment;
  }

  public async updateCommitment(commitmentId: string, data: any, userId: string = 'usr_me'): Promise<any> {
    const res = await fetch(`${BACKEND_URL}/api/v1/vault/commitments/${commitmentId}`, {
      method: 'PUT',
      headers: this.getHeaders(userId),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to update commitment');
    const resData = await res.json();
    return resData.commitment;
  }

  public async addReminder(personId: string, data: any, userId: string = 'usr_me'): Promise<any> {
    const res = await fetch(`${BACKEND_URL}/api/v1/vault/persons/${personId}/reminders`, {
      method: 'POST',
      headers: this.getHeaders(userId),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to add reminder');
    const resData = await res.json();
    return resData.reminder;
  }

  public async updateReminder(reminderId: string, status: string, userId: string = 'usr_me'): Promise<boolean> {
    const res = await fetch(`${BACKEND_URL}/api/v1/vault/reminders/${reminderId}`, {
      method: 'PUT',
      headers: this.getHeaders(userId),
      body: JSON.stringify({ status })
    });
    if (!res.ok) return false;
    const data = await res.json();
    return data.success;
  }

  public async exportDossier(personId: string, format: 'json' | 'markdown' = 'json', userId: string = 'usr_me'): Promise<any> {
    const res = await fetch(`${BACKEND_URL}/api/v1/vault/persons/${personId}/export?format=${format}`, {
      headers: this.getHeaders(userId)
    });
    if (format === 'markdown') {
      return res.text();
    }
    return res.json();
  }
}

export const prmApiClient = new PrmApiClient();
