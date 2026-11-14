import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { db } from '../db';
import { v4 as uuidv4 } from 'uuid';
import { BackupRecord } from './types';
import { AccessControlEngine } from './accessControl';

export class BackupService {
  /**
   * Executes a zero-downtime hot online backup of the SQLite database.
   * Utilizes better-sqlite3 native db.backup API.
   */
  public static async createHotBackup(destinationDir?: string): Promise<BackupRecord> {
    const backupDir = destinationDir || path.resolve(__dirname, '../../backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `soulverse_backup_${timestamp}.db`;
    const targetPath = path.join(backupDir, fileName);

    const backupId = `bkp_${uuidv4().replace(/-/g, '').slice(0, 16)}`;
    const now = Date.now();

    // Trigger SQLite online backup
    await db.backup(targetPath);

    // Compute checksum and file size
    const fileBuffer = fs.readFileSync(targetPath);
    const sizeBytes = fileBuffer.length;
    const checksum = crypto.createHash('sha256').update(fileBuffer).digest('hex');

    db.prepare(`
      INSERT INTO backup_history (
        id, file_name, file_path, size_bytes, checksum, backup_type, status, created_at
      ) VALUES (?, ?, ?, ?, ?, 'hot_wal_snapshot', 'completed', ?)
    `).run(backupId, fileName, targetPath, sizeBytes, checksum, now);

    AccessControlEngine.logSecurityAudit({
      action: 'database_backup_created',
      domain: 'database_infrastructure',
      resourceType: 'backup',
      resourceId: backupId,
      severity: 'info',
      details: { fileName, sizeBytes, checksum: checksum.slice(0, 16) }
    });

    return {
      id: backupId,
      fileName,
      filePath: targetPath,
      sizeBytes,
      checksum,
      backupType: 'hot_wal_snapshot',
      status: 'completed',
      createdAt: now
    };
  }

  /**
   * Runs SQLite PRAGMA integrity_check to verify database file consistency.
   */
  public static verifyDatabaseIntegrity(): { ok: boolean; details: string[] } {
    try {
      const rows = db.pragma('integrity_check') as { integrity_check: string }[];
      const results = rows.map(r => r.integrity_check);
      const isOk = results.length === 1 && results[0].toLowerCase() === 'ok';

      return {
        ok: isOk,
        details: results
      };
    } catch (err: any) {
      return {
        ok: false,
        details: [err.message || 'Integrity check query failed']
      };
    }
  }

  /**
   * Flushes WAL file back into the main database file safely.
   */
  public static checkpointWal(mode: 'PASSIVE' | 'FULL' | 'RESTART' | 'TRUNCATE' = 'TRUNCATE'): {
    busy: number;
    log: number;
    checkpointed: number;
  } {
    try {
      const res = db.pragma(`wal_checkpoint(${mode})`) as any[];
      if (res && res.length > 0) {
        return {
          busy: res[0].busy ?? 0,
          log: res[0].log ?? 0,
          checkpointed: res[0].checkpointed ?? 0
        };
      }
      return { busy: 0, log: 0, checkpointed: 0 };
    } catch {
      return { busy: 1, log: 0, checkpointed: 0 };
    }
  }

  /**
   * Retrieves recent backup history
   */
  public static getBackupHistory(limit: number = 20): BackupRecord[] {
    const rows = db.prepare(`
      SELECT * FROM backup_history ORDER BY created_at DESC LIMIT ?
    `).all(limit) as any[];

    return rows.map(r => ({
      id: r.id,
      fileName: r.file_name,
      filePath: r.file_path,
      sizeBytes: r.size_bytes,
      checksum: r.checksum,
      backupType: r.backup_type,
      status: r.status,
      createdAt: r.created_at
    }));
  }
}
