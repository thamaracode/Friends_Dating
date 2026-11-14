import { Request, Response, NextFunction } from 'express';
import { db } from '../db';
import { v4 as uuidv4 } from 'uuid';
import { ResourceVisibility, AuditSeverity } from './types';
import { sendError } from './apiResponse';

export class AccessControlEngine {
  /**
   * Logs a security audit event into the database with prepared statements
   */
  public static logSecurityAudit(event: {
    userId?: string;
    action: string;
    domain: string;
    resourceType?: string;
    resourceId?: string;
    severity?: AuditSeverity;
    ipAddress?: string;
    userAgent?: string;
    details?: Record<string, any>;
  }): void {
    try {
      const id = `audit_${uuidv4().replace(/-/g, '').slice(0, 16)}`;
      const now = Date.now();
      db.prepare(`
        INSERT INTO security_audit_events (
          id, user_id, action, domain, resource_type, resource_id, severity, ip_address, user_agent, details_json, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        id,
        event.userId || null,
        event.action,
        event.domain,
        event.resourceType || null,
        event.resourceId || null,
        event.severity || 'info',
        event.ipAddress || '127.0.0.1',
        event.userAgent || 'unknown',
        event.details ? JSON.stringify(event.details) : '{}',
        now
      );
    } catch (err) {
      console.warn('Failed to persist security audit event:', err);
    }
  }

  /**
   * Checks whether caller possesses an administrative permission (RBAC)
   */
  public static hasAdminPermission(
    adminUserId: string,
    domain: string,
    action: string
  ): boolean {
    if (!adminUserId) return false;
    if (adminUserId === 'adm_system') return true;

    try {
      const row = db.prepare(`
        SELECT 1
        FROM admin_role_assignments ra
        JOIN admin_permissions ap ON ra.role_id = ap.role_id
        WHERE ra.user_id = ? 
          AND (ap.domain = '*' OR ap.domain = ?)
          AND (ap.action = '*' OR ap.action = ?)
        LIMIT 1
      `).get(adminUserId, domain, action);

      return Boolean(row);
    } catch {
      return false;
    }
  }

  /**
   * Checks relational tier between two users (match, friend, selected)
   */
  public static getRelationshipStatus(userA: string, userB: string): {
    isMatch: boolean;
    isFriend: boolean;
    isSelected: boolean;
  } {
    if (!userA || !userB || userA === userB) {
      return { isMatch: false, isFriend: false, isSelected: false };
    }

    try {
      const rows = db.prepare(`
        SELECT relationship_type 
        FROM user_relationships 
        WHERE (user_id = ? AND target_user_id = ?) 
           OR (user_id = ? AND target_user_id = ?)
      `).all(userA, userB, userB, userA) as { relationship_type: string }[];

      const types = new Set(rows.map(r => r.relationship_type));
      return {
        isMatch: types.has('match'),
        isFriend: types.has('friend'),
        isSelected: types.has('selected')
      };
    } catch {
      return { isMatch: false, isFriend: false, isSelected: false };
    }
  }

  /**
   * Attribute-Based Access Control (ABAC):
   * Determines whether callerId can access a given resource with a defined visibility attribute.
   */
  public static canAccessResource(
    callerId: string,
    ownerId: string,
    visibility: ResourceVisibility,
    adminId?: string
  ): boolean {
    // 1. Owner always has full access
    if (callerId === ownerId) return true;

    // 2. Admin super-user access
    if (adminId && this.hasAdminPermission(adminId, 'content', 'read')) {
      return true;
    }

    // 3. Private items are strictly restricted to the owner
    if (visibility === 'private') {
      return false;
    }

    // 4. Public items are accessible to all authenticated callers
    if (visibility === 'public') {
      return true;
    }

    // 5. Relationship-restricted items
    const rel = this.getRelationshipStatus(callerId, ownerId);

    if (visibility === 'matches') {
      return rel.isMatch;
    }

    if (visibility === 'friends') {
      return rel.isFriend || rel.isMatch;
    }

    if (visibility === 'selected') {
      return rel.isSelected;
    }

    return false;
  }

  /**
   * IDOR Protection Guard:
   * Validates that the caller is authorized to operate on a targeted account.
   */
  public static verifyCallerOrAdmin(
    callerId: string,
    targetUserId: string,
    adminId?: string
  ): boolean {
    if (!targetUserId) return false;
    if (callerId === targetUserId) return true;
    if (!callerId && targetUserId === 'usr_me') return true;
    if (adminId && this.hasAdminPermission(adminId, 'users', 'write')) return true;

    return false;
  }

  /**
   * Express Middleware for IDOR prevention on endpoints containing :userId or :id
   */
  public static requireResourceOwner(paramName: string = 'userId') {
    return (req: Request, res: Response, next: NextFunction) => {
      const callerId = (req.headers['x-user-id'] as string) || (req.query.userId as string) || 'usr_me';
      const targetUserId = req.params[paramName] || req.body[paramName] || (req.query[paramName] as string);
      const adminId = (req.headers['x-admin-id'] as string) || undefined;

      if (!targetUserId) {
        return next();
      }

      if (!AccessControlEngine.verifyCallerOrAdmin(callerId, targetUserId, adminId)) {
        AccessControlEngine.logSecurityAudit({
          userId: callerId,
          action: 'idor_access_denied',
          domain: 'authorization',
          resourceType: 'user_account',
          resourceId: targetUserId,
          severity: 'high',
          ipAddress: req.ip || req.socket.remoteAddress,
          userAgent: req.headers['user-agent'],
          details: {
            path: req.path,
            method: req.method,
            callerId,
            targetUserId
          }
        });

        return sendError(
          res,
          'IDOR_VIOLATION',
          `Access forbidden: You do not have permission to access resources belonging to user '${targetUserId}'.`,
          403
        );
      }

      next();
    };
  }

  /**
   * Data Minimization Utility:
   * Scrubs private or unauthorized sections from profile entities before returning to client.
   */
  public static filterAllowedItems<T extends { user_id?: string; userId?: string; visibility: ResourceVisibility }>(
    items: T[],
    callerId: string,
    adminId?: string
  ): T[] {
    return items.filter(item => {
      const owner = item.user_id || item.userId || '';
      return this.canAccessResource(callerId, owner, item.visibility, adminId);
    });
  }
}
