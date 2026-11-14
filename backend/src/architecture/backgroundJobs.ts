import { DataProtectionService } from './dataProtection';
import { BackupService } from './backupService';
import { CacheService } from './cacheService';
import { cleanupExpiredIdempotencyKeys } from './idempotency';
import { AccessControlEngine } from './accessControl';

export interface BackgroundJob {
  name: string;
  intervalMs: number;
  lastRunAt?: number;
  lastStatus?: 'success' | 'failed';
  lastError?: string;
  runCount: number;
  execute: () => Promise<any> | any;
}

export class BackgroundJobManager {
  private static jobs: Map<string, BackgroundJob> = new Map();
  private static timers: Map<string, NodeJS.Timeout> = new Map();
  private static isInitialized = false;

  public static registerJob(job: Omit<BackgroundJob, 'runCount'>): void {
    const fullJob: BackgroundJob = {
      ...job,
      runCount: 0
    };
    this.jobs.set(job.name, fullJob);

    // If already started, schedule timer
    if (this.isInitialized) {
      this.scheduleJob(fullJob);
    }
  }

  private static scheduleJob(job: BackgroundJob): void {
    if (this.timers.has(job.name)) {
      clearInterval(this.timers.get(job.name)!);
    }

    const timer = setInterval(async () => {
      await this.runJob(job.name);
    }, job.intervalMs);

    timer.unref();
    this.timers.set(job.name, timer);
  }

  public static async runJob(name: string): Promise<{ success: boolean; result?: any; error?: string }> {
    const job = this.jobs.get(name);
    if (!job) {
      return { success: false, error: `Job '${name}' not found` };
    }

    const startTime = Date.now();
    try {
      const result = await job.execute();
      job.lastRunAt = startTime;
      job.lastStatus = 'success';
      job.lastError = undefined;
      job.runCount++;

      return { success: true, result };
    } catch (err: any) {
      const errMsg = err?.message || String(err);
      job.lastRunAt = startTime;
      job.lastStatus = 'failed';
      job.lastError = errMsg;
      job.runCount++;

      AccessControlEngine.logSecurityAudit({
        action: 'background_job_failed',
        domain: 'system_jobs',
        resourceType: 'background_job',
        resourceId: name,
        severity: 'medium',
        details: { error: errMsg, durationMs: Date.now() - startTime }
      });

      return { success: false, error: errMsg };
    }
  }

  public static start(): void {
    if (this.isInitialized) return;
    this.isInitialized = true;

    // Register Standard System Jobs
    this.registerJob({
      name: 'data_retention_cleaner',
      intervalMs: 60 * 60 * 1000, // Every 1 hour
      execute: () => {
        const result = DataProtectionService.executeRetentionPolicies();
        return result;
      }
    });

    this.registerJob({
      name: 'wal_auto_checkpoint',
      intervalMs: 30 * 60 * 1000, // Every 30 minutes
      execute: () => {
        const result = BackupService.checkpointWal('TRUNCATE');
        return result;
      }
    });

    this.registerJob({
      name: 'idempotency_purger',
      intervalMs: 15 * 60 * 1000, // Every 15 minutes
      execute: () => {
        const count = cleanupExpiredIdempotencyKeys();
        return { keysCleaned: count };
      }
    });

    this.registerJob({
      name: 'cache_maintenance',
      intervalMs: 5 * 60 * 1000, // Every 5 minutes
      execute: () => {
        const purged = CacheService.purgeExpired();
        return { purgedEntries: purged };
      }
    });

    // Schedule all registered jobs
    for (const job of this.jobs.values()) {
      this.scheduleJob(job);
    }
  }

  public static stop(): void {
    for (const timer of this.timers.values()) {
      clearInterval(timer);
    }
    this.timers.clear();
    this.isInitialized = false;
  }

  public static getJobStatuses(): Array<{
    name: string;
    intervalMs: number;
    lastRunAt?: number;
    lastStatus?: string;
    lastError?: string;
    runCount: number;
  }> {
    return Array.from(this.jobs.values()).map(j => ({
      name: j.name,
      intervalMs: j.intervalMs,
      lastRunAt: j.lastRunAt,
      lastStatus: j.lastStatus,
      lastError: j.lastError,
      runCount: j.runCount
    }));
  }
}
