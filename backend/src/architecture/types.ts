export type ErrorCode = 
  | 'VALIDATION_ERROR'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'RATE_LIMIT_EXCEEDED'
  | 'CONFLICT'
  | 'IDEMPOTENCY_CONFLICT'
  | 'IDOR_VIOLATION'
  | 'SUSPENDED'
  | 'INTERNAL_ERROR'
  | 'SERVICE_UNAVAILABLE'
  | 'BAD_REQUEST';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: ErrorCode;
    message: string;
    details?: any;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
    hasMore?: boolean;
    timestamp?: number;
    version?: string;
  };
}

export interface PaginationParams {
  page: number;
  limit: number;
  offset: number;
}

export interface SortingParams {
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export interface FilterParams {
  [key: string]: string | number | boolean | undefined;
}

// ============================================================================
// DOMAIN ENTITIES
// ============================================================================

export interface UserSettings {
  userId: string;
  theme: 'dark' | 'light' | 'obsidian' | 'system';
  language: string;
  twoFactorEnabled: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
  soundEffects: boolean;
  hapticFeedback: boolean;
  dataSharingLevel: 'minimal' | 'standard' | 'enhanced';
  retentionPeriodDays: number;
  createdAt: number;
  updatedAt: number;
}

export interface AuthSession {
  id: string;
  userId: string;
  tokenHash: string;
  deviceName?: string;
  ipAddress?: string;
  userAgent?: string;
  isRevoked: boolean;
  expiresAt: number;
  lastActiveAt: number;
  createdAt: number;
}

export type ConnectionType = 
  | 'friendship'
  | 'dating'
  | 'deep_connection'
  | 'creative_collaboration'
  | 'activity_partner';

export type ConnectionRequestStatus = 
  | 'pending'
  | 'accepted'
  | 'declined'
  | 'cancelled';

export interface ConnectionRequest {
  id: string;
  requesterId: string;
  recipientId: string;
  connectionType: ConnectionType;
  status: ConnectionRequestStatus;
  introNote?: string;
  createdAt: number;
  respondedAt?: number;
}

export type NotificationType = 
  | 'connection_request'
  | 'connection_accepted'
  | 'new_message'
  | 'reaction'
  | 'milestone'
  | 'system'
  | 'security_alert';

export interface NotificationItem {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  entityType?: string;
  entityId?: string;
  isRead: boolean;
  createdAt: number;
}

export type ProfileMediaType = 'photo' | 'video' | 'audio' | 'document';

export interface ProfileMediaItem {
  id: string;
  userId: string;
  mediaType: ProfileMediaType;
  url: string;
  thumbnailUrl?: string;
  caption?: string;
  sortOrder: number;
  visibility: 'public' | 'matches' | 'friends' | 'selected' | 'private';
  createdAt: number;
}

export type ConsentType = 
  | 'terms_of_service'
  | 'privacy_policy'
  | 'ai_processing'
  | 'cookies_analytics'
  | 'marketing_communication';

export interface ConsentRecord {
  id: string;
  userId: string;
  consentType: ConsentType;
  granted: boolean;
  version: string;
  ipAddress?: string;
  grantedAt: number;
  revokedAt?: number;
}

export interface UserDataExport {
  id: string;
  userId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  filePath?: string;
  fileSizeBytes: number;
  expiresAt: number;
  requestedAt: number;
  completedAt?: number;
}

export type AuditSeverity = 'info' | 'low' | 'medium' | 'high' | 'critical';

export interface SecurityAuditEvent {
  id: string;
  userId?: string;
  action: string;
  domain: string;
  resourceType?: string;
  resourceId?: string;
  severity: AuditSeverity;
  ipAddress?: string;
  userAgent?: string;
  details?: Record<string, any>;
  createdAt: number;
}

export interface IdempotencyRecord {
  key: string;
  userId: string;
  requestPath: string;
  requestHash: string;
  responseStatus: number;
  responseHeaders: Record<string, string>;
  responseBody: any;
  createdAt: number;
  expiresAt: number;
}

export interface BackupRecord {
  id: string;
  fileName: string;
  filePath: string;
  sizeBytes: number;
  checksum?: string;
  backupType: string;
  status: string;
  createdAt: number;
}

// ============================================================================
// ACCESS CONTROL (ABAC & RBAC)
// ============================================================================

export type ResourceVisibility = 'public' | 'matches' | 'friends' | 'selected' | 'private';

export interface AccessContext {
  callerId: string;
  targetUserId: string;
  adminRoles?: string[];
  isMatch?: boolean;
  isFriend?: boolean;
  isSelected?: boolean;
}
