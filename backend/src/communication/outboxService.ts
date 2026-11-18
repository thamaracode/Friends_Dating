import { db } from '../db';
import { CentrifugoService } from './centrifugoService';

export interface OutboxEventRecord {
  id: string;
  eventType: string;
  aggregateType: string;
  aggregateId: string;
  channel: string;
  payload: any;
  status: 'pending' | 'publishing' | 'published' | 'failed' | 'dead_letter';
  retryCount: number;
  maxRetries: number;
  lastError?: string;
  nextRetryAt: number;
  createdAt: number;
  publishedAt?: number;
}

export class OutboxService {
  private static workerTimer: NodeJS.Timeout | null = null;
  private static isDraining: boolean = false;
  private static realtimeMirrorCallback: ((channel: string, payload: any) => void) | null = null;

  /**
   * Registers a mirror callback (e.g., RealtimeGateway) so connected local clients
   * receive events without extra network hops.
   */
  public static setRealtimeMirror(callback: (channel: string, payload: any) => void) {
    this.realtimeMirrorCallback = callback;
  }

  /**
   * Enqueues an outbox event.
   * Can be safely executed inside an active database transaction.
   */
  public static enqueue(params: {
    eventType: string;
    aggregateType: string;
    aggregateId: string;
    channel: string;
    payload: any;
    maxRetries?: number;
  }): OutboxEventRecord {
    const id = `obx_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const now = Date.now();
    const maxRetries = params.maxRetries ?? 5;
    const payloadJson = typeof params.payload === 'string' ? params.payload : JSON.stringify(params.payload);

    db.prepare(`
      INSERT INTO outbox_events (
        id, event_type, aggregate_type, aggregate_id, channel, payload_json,
        status, retry_count, max_retries, next_retry_at, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, 'pending', 0, ?, ?, ?)
    `).run(
      id,
      params.eventType,
      params.aggregateType,
      params.aggregateId,
      params.channel,
      payloadJson,
      maxRetries,
      now,
      now
    );

    // Trigger immediate async dispatch without blocking caller
    this.triggerImmediateDispatch();

    return {
      id,
      eventType: params.eventType,
      aggregateType: params.aggregateType,
      aggregateId: params.aggregateId,
      channel: params.channel,
      payload: params.payload,
      status: 'pending',
      retryCount: 0,
      maxRetries,
      nextRetryAt: now,
      createdAt: now
    };
  }

  /**
   * Triggers an immediate asynchronous drain on next tick.
   */
  public static triggerImmediateDispatch() {
    setImmediate(() => {
      this.dispatchPending().catch(err => {
        console.warn('[OutboxService] Immediate dispatch warning:', err?.message || err);
      });
    });
  }

  /**
   * Dispatches pending and retryable outbox events to Centrifugo and local mirrors.
   */
  public static async dispatchPending(limit: number = 50): Promise<{ processed: number; succeeded: number; failed: number }> {
    if (this.isDraining) {
      return { processed: 0, succeeded: 0, failed: 0 };
    }
    this.isDraining = true;

    let processed = 0;
    let succeeded = 0;
    let failed = 0;

    try {
      const now = Date.now();
      const rows = db.prepare(`
        SELECT * FROM outbox_events
        WHERE status IN ('pending', 'failed')
          AND next_retry_at <= ?
          AND retry_count < max_retries
        ORDER BY created_at ASC
        LIMIT ?
      `).all(now, limit) as any[];

      if (rows.length === 0) {
        return { processed: 0, succeeded: 0, failed: 0 };
      }

      for (const row of rows) {
        processed++;
        let payload: any;
        try {
          payload = JSON.parse(row.payload_json);
        } catch {
          payload = row.payload_json;
        }

        try {
          // 1. Publish to Centrifugo Server
          const pubResult = await CentrifugoService.publish(row.channel, payload);

          // 2. Dispatch to local WebSocket gateway mirror if registered
          if (this.realtimeMirrorCallback) {
            try {
              this.realtimeMirrorCallback(row.channel, payload);
            } catch (mirrorErr) {
              console.warn('[OutboxService] Mirror dispatch notice:', mirrorErr);
            }
          }

          if (pubResult.success || !CentrifugoService.isConfiguredEnabled()) {
            // Success: mark published
            db.prepare(`
              UPDATE outbox_events
              SET status = 'published', published_at = ?
              WHERE id = ?
            `).run(Date.now(), row.id);
            succeeded++;
          } else {
            throw new Error(pubResult.error || 'Centrifugo publish rejected');
          }
        } catch (err: any) {
          failed++;
          const nextRetry = row.retry_count + 1;
          const delay = Math.min(60000, 1000 * Math.pow(2, nextRetry)); // Exponential backoff: 2s, 4s, 8s, 16s...
          const nextStatus = nextRetry >= row.max_retries ? 'dead_letter' : 'failed';

          db.prepare(`
            UPDATE outbox_events
            SET status = ?,
                retry_count = ?,
                next_retry_at = ?,
                last_error = ?
            WHERE id = ?
          `).run(nextStatus, nextRetry, Date.now() + delay, err.message || String(err), row.id);
        }
      }
    } finally {
      this.isDraining = false;
    }

    return { processed, succeeded, failed };
  }

  /**
   * Starts background recurring runner for outbox resilience
   */
  public static startOutboxWorker(pollIntervalMs: number = 2500) {
    if (this.workerTimer) return;
    this.workerTimer = setInterval(() => {
      this.dispatchPending().catch(err => {
        console.warn('[OutboxService] Background poll error:', err?.message || err);
      });
    }, pollIntervalMs);
  }

  /**
   * Gracefully stops the outbox background runner
   */
  public static stopOutboxWorker() {
    if (this.workerTimer) {
      clearInterval(this.workerTimer);
      this.workerTimer = null;
    }
  }

  /**
   * Retrieves count of pending outbox events
   */
  public static getPendingCount(): number {
    const row = db.prepare(`
      SELECT COUNT(*) as count FROM outbox_events WHERE status IN ('pending', 'publishing', 'failed')
    `).get() as { count: number };
    return row?.count || 0;
  }

  /**
   * Retrieves dead letter events for monitoring and administrative remediation
   */
  public static getDeadLetterEvents(limit: number = 50): OutboxEventRecord[] {
    const rows = db.prepare(`
      SELECT * FROM outbox_events WHERE status = 'dead_letter' ORDER BY created_at DESC LIMIT ?
    `).all(limit) as any[];

    return rows.map(r => ({
      id: r.id,
      eventType: r.event_type,
      aggregateType: r.aggregate_type,
      aggregateId: r.aggregate_id,
      channel: r.channel,
      payload: JSON.parse(r.payload_json || '{}'),
      status: r.status,
      retryCount: r.retry_count,
      maxRetries: r.max_retries,
      lastError: r.last_error,
      nextRetryAt: r.next_retry_at,
      createdAt: r.created_at,
      publishedAt: r.published_at
    }));
  }
}
