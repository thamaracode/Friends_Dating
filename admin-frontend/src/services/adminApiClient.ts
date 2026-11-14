import type {
  AdminUser,
  AdminSession,
  AdminRole,
  AdminFeature,
  UserSummary,
  ModerationReport,
  AdminAiProvider,
  AdminQuote,
  SystemHealth,
  AuditLogEntry
} from '../types/admin';

const ADMIN_API_BASE = import.meta.env.VITE_ADMIN_API_URL || 'http://127.0.0.1:3002/api/v1/admin';
const TOKEN_KEY = 'soulverse_admin_jwt_v1';
const ADMIN_KEY = 'soulverse_admin_user_v1';

export class AdminApiClient {
  static getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  static setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  }

  static getCachedAdmin(): AdminUser | null {
    const raw = localStorage.getItem(ADMIN_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  static setCachedAdmin(admin: AdminUser): void {
    localStorage.setItem(ADMIN_KEY, JSON.stringify(admin));
  }

  static clearSession(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(ADMIN_KEY);
  }

  private static async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {})
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${ADMIN_API_BASE}${endpoint}`, {
      ...options,
      headers
    });

    if (res.status === 401) {
      // Clear session if unauthorized / expired
      this.clearSession();
      window.dispatchEvent(new CustomEvent('admin-auth-expired'));
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || 'Unauthorized session');
    }

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || `HTTP error ${res.status}`);
    }

    return res.json() as Promise<T>;
  }

  // --- Auth APIs ---
  static async login(email: string, password: string, mfaCode?: string) {
    return this.request<{
      mfaRequired?: boolean;
      challengeToken?: string;
      token?: string;
      admin?: AdminUser;
      session?: { id: string; expiresAt: number };
      message?: string;
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, mfaCode })
    });
  }

  static async verifyMfa(challengeToken: string, mfaCode: string) {
    return this.request<{
      token: string;
      admin: AdminUser;
      session: { id: string; expiresAt: number };
    }>('/auth/verify-mfa', {
      method: 'POST',
      body: JSON.stringify({ challengeToken, mfaCode })
    });
  }

  static async getMe() {
    return this.request<{ admin: AdminUser; permissions: { domain: string; action: string }[] }>('/auth/me');
  }

  static async logout() {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } finally {
      this.clearSession();
    }
  }

  static async getSessions() {
    return this.request<{ sessions: AdminSession[] }>('/auth/sessions');
  }

  static async revokeSession(sessionId: string) {
    return this.request<{ success: boolean; message: string }>(`/auth/revoke-session/${sessionId}`, {
      method: 'POST'
    });
  }

  // --- Feature Registry & Flags ---
  static async getFeatures() {
    return this.request<{ features: AdminFeature[] }>('/features');
  }

  static async updateFeature(featureId: string, patch: Partial<AdminFeature> & { reason?: string }) {
    return this.request<{ success: boolean; state: string; rolloutPercentage: number }>(`/features/${featureId}`, {
      method: 'PUT',
      body: JSON.stringify(patch)
    });
  }

  static async toggleKillSwitch(featureId: string, active: boolean, reason?: string) {
    return this.request<{ success: boolean; isKillSwitched: boolean }>(`/features/${featureId}/kill-switch`, {
      method: 'POST',
      body: JSON.stringify({ active, reason })
    });
  }

  static async getDependencyGraph() {
    return this.request<{ nodes: any[]; edges: any[] }>('/features/dependency-graph');
  }

  static async getSnapshots() {
    return this.request<{ versions: any[] }>('/features/configuration/versions');
  }

  static async createSnapshot(changeSummary: string) {
    return this.request<{ success: boolean; versionNumber: number }>('/features/configuration/create-snapshot', {
      method: 'POST',
      body: JSON.stringify({ changeSummary })
    });
  }

  static async rollbackSnapshot(versionId: string, reason?: string) {
    return this.request<{ success: boolean; versionNumber: number }>(`/features/configuration/rollback/${versionId}`, {
      method: 'POST',
      body: JSON.stringify({ reason })
    });
  }

  static async getAdoptionStats() {
    return this.request<{ stats: any[]; totalUsers: number }>('/features/analytics/adoption');
  }

  // --- Users & Moderation ---
  static async getUsers(params: { search?: string; filter?: string; page?: number; limit?: number } = {}) {
    const q = new URLSearchParams();
    if (params.search) q.set('search', params.search);
    if (params.filter) q.set('filter', params.filter);
    if (params.page) q.set('page', String(params.page));
    if (params.limit) q.set('limit', String(params.limit));
    return this.request<{ users: UserSummary[]; pagination: any }>(`/users?${q.toString()}`);
  }

  static async getUserDetail(userId: string) {
    return this.request<{ user: UserSummary; traits: any[]; reports: any[]; aiConnections: any[] }>(`/users/${userId}`);
  }

  static async toggleVerification(userId: string, isVerified?: boolean) {
    return this.request<{ success: boolean; isVerified: boolean }>(`/users/${userId}/verification`, {
      method: 'POST',
      body: JSON.stringify({ isVerified })
    });
  }

  static async suspendUser(userId: string, reason: string) {
    return this.request<{ success: boolean; suspended: boolean }>(`/users/${userId}/suspend`, {
      method: 'POST',
      body: JSON.stringify({ reason })
    });
  }

  static async getReports() {
    return this.request<{ reports: ModerationReport[] }>('/users/moderation/reports');
  }

  static async resolveReport(reportId: string, status: 'resolved' | 'dismissed', notes?: string) {
    return this.request<{ success: boolean; status: string }>(`/users/moderation/resolve-report/${reportId}`, {
      method: 'POST',
      body: JSON.stringify({ status, notes })
    });
  }

  // --- AI Console ---
  static async getAiProviders() {
    return this.request<{ providers: AdminAiProvider[] }>('/ai/providers');
  }

  static async updateAiProvider(providerId: string, patch: Partial<AdminAiProvider>) {
    return this.request<{ success: boolean }>(`/ai/providers/${providerId}`, {
      method: 'PUT',
      body: JSON.stringify(patch)
    });
  }

  static async getAiUsage() {
    return this.request<{ telemetry: any }>('/ai/usage');
  }

  // --- Quotes Sanctuary ---
  static async getQuotes(params: { category?: string; search?: string; verified?: string; page?: number; limit?: number } = {}) {
    const q = new URLSearchParams();
    if (params.category) q.set('category', params.category);
    if (params.search) q.set('search', params.search);
    if (params.verified) q.set('verified', params.verified);
    if (params.page) q.set('page', String(params.page));
    if (params.limit) q.set('limit', String(params.limit));
    return this.request<{ quotes: AdminQuote[]; pagination: any }>(`/quotes?${q.toString()}`);
  }

  static async createQuote(payload: { text: string; author: string; category: string; tags: string[]; attribution?: string }) {
    return this.request<{ success: boolean; quoteId: string }>('/quotes', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  static async deleteQuote(id: string) {
    return this.request<{ success: boolean }>(`/quotes/${id}`, { method: 'DELETE' });
  }

  static async getQuoteProviders() {
    return this.request<{ providers: any[] }>('/quotes/providers');
  }

  static async updateQuoteProvider(id: string, patch: any) {
    return this.request<{ success: boolean }>(`/quotes/providers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(patch)
    });
  }

  // --- System Ops & Telemetry ---
  static async getHealth() {
    return this.request<SystemHealth>('/system/health');
  }

  static async getAuditLogs(params: { action?: string; adminId?: string; page?: number; limit?: number } = {}) {
    const q = new URLSearchParams();
    if (params.action) q.set('action', params.action);
    if (params.adminId) q.set('adminId', params.adminId);
    if (params.page) q.set('page', String(params.page));
    if (params.limit) q.set('limit', String(params.limit));
    return this.request<{ logs: AuditLogEntry[]; pagination: any }>(`/system/audit-logs?${q.toString()}`);
  }

  static async walCheckpoint() {
    return this.request<{ success: boolean; message: string }>('/system/wal-checkpoint', { method: 'POST' });
  }

  static async vacuum() {
    return this.request<{ success: boolean; message: string }>('/system/vacuum', { method: 'POST' });
  }

  static async getRoles() {
    return this.request<{ roles: AdminRole[] }>('/system/roles');
  }

  static async assignRole(adminUserId: string, roleId: string) {
    return this.request<{ success: boolean }>('/system/roles/assign', {
      method: 'POST',
      body: JSON.stringify({ adminUserId, roleId })
    });
  }
}
