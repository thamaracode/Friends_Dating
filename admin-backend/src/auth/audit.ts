import { v4 as uuidv4 } from 'uuid';
import { adminDb } from '../db';

export interface AuditLogPayload {
  adminId: string;
  adminName: string;
  action: string;
  targetType: string;
  targetId: string | string[];
  beforeState?: any;
  afterState?: any;
  reason?: string;
  ipAddress?: string | string[];
}

export class AdminAuditLogger {
  /**
   * Persists an immutable administrative audit log entry to the authoritative database.
   */
  static log(payload: AuditLogPayload): void {
    try {
      const now = Math.floor(Date.now() / 1000);
      const id = `audit_${uuidv4().replace(/-/g, '').slice(0, 16)}`;
      const targetIdStr = Array.isArray(payload.targetId) ? payload.targetId.join(',') : String(payload.targetId);
      const ipStr = Array.isArray(payload.ipAddress) ? payload.ipAddress[0] : (payload.ipAddress || 'internal');

      const stmt = adminDb.prepare(`
        INSERT INTO configuration_audit_logs (
          id, admin_id, admin_name, action, target_type, target_id,
          before_value_json, after_value_json, reason, ip_address, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      stmt.run(
        id,
        payload.adminId,
        payload.adminName,
        payload.action,
        payload.targetType,
        targetIdStr,
        payload.beforeState ? JSON.stringify(payload.beforeState) : null,
        payload.afterState ? JSON.stringify(payload.afterState) : null,
        payload.reason || 'Administrative state update',
        ipStr,
        now
      );
    } catch (err) {
      console.error('[AdminAuditLogger] Failed to write audit log:', err);
    }
  }
}
