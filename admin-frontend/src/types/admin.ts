export interface AdminUser {
  id: string;
  email: string;
  fullName: string;
  roleId: string;
  roleName: string;
  hierarchyLevel: number;
}

export interface AdminSession {
  id: string;
  admin_id: string;
  ip_address: string;
  user_agent: string;
  expires_at: number;
  created_at: number;
  last_active_at: number;
  full_name?: string;
  email?: string;
  role_name?: string;
}

export interface AdminRole {
  id: string;
  name: string;
  description: string;
  hierarchyLevel: number;
  permissions: { domain: string; action: string }[];
}

export interface AdminFeature {
  id: string;
  name: string;
  category: string;
  tagline: string;
  description: string;
  minAppVersion: string;
  requiresAi: boolean;
  requiresNotifications: boolean;
  isPremium: boolean;
  state: 'available' | 'enabled' | 'disabled' | 'restricted' | 'paused' | 'maintenance' | 'beta' | 'deprecated';
  isGloballyEnabled: boolean;
  rolloutPercentage: number;
  targetRoles: string[];
  targetTiers: string[];
  allowedRegions: string[];
  isKillSwitched: boolean;
  killSwitchReason: string | null;
  updatedBy: string;
  updatedAt: number;
  dependencies: string[];
}

export interface UserSummary {
  id: string;
  name: string;
  username: string;
  avatar: string;
  isVerified: boolean;
  lastSeenAt: number;
  statusText?: string;
}

export interface ModerationReport {
  id: string;
  reporter_id: string;
  reported_user_id: string;
  reason: string;
  details: string;
  status: 'pending' | 'resolved' | 'dismissed';
  created_at: number;
  reporter_name?: string;
  reported_name?: string;
  reported_avatar?: string;
}

export interface AdminAiProvider {
  id: string;
  name: string;
  isGloballyEnabled: boolean;
  byokAllowed: boolean;
  rateLimitRpm: number;
  allowedModels: string[];
  defaultModel: string;
  updatedAt?: number;
}

export interface AdminQuote {
  id: string;
  text: string;
  author: string;
  category: string;
  tags: string[];
  isVerified: boolean;
  attribution?: string;
  likesCount: number;
  savesCount: number;
  sharesCount: number;
}

export interface SystemHealth {
  status: string;
  timestamp: string;
  uptimeSeconds: number;
  nodeVersion: string;
  memory: {
    rssMb: number;
    heapUsedMb: number;
    heapTotalMb: number;
  };
  database: {
    path: string;
    sizeMb: string;
    journalMode: string;
  };
  counts: {
    totalUsers: number;
    activeAdminSessions: number;
    totalAuditLogs: number;
  };
}

export interface AuditLogEntry {
  id: string;
  adminId: string;
  adminName: string;
  action: string;
  targetType: string;
  targetId: string;
  beforeState: any;
  afterState: any;
  reason: string;
  createdAt: number;
}
