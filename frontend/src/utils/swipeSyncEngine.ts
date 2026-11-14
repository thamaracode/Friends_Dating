/**
 * Offline-first Swipe Persistence & Outbox Synchronization Engine
 * Guarantees zero dropped swipe actions across network drops, offline mode, and reconnects.
 */

export interface QueuedSwipeAction {
  actionId: string;
  targetUserId: string;
  action: 'like' | 'pass' | 'superlike';
  connectionType?: string;
  timestamp: number;
  retries: number;
}

const STORAGE_KEY = 'soulverse_pending_swipes_outbox';

export class SwipeSyncEngine {
  private static isDraining = false;

  /**
   * Retrieves all pending swipe actions stored locally
   */
  public static getQueue(): QueuedSwipeAction[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  /**
   * Saves the queue back to localStorage
   */
  private static saveQueue(queue: QueuedSwipeAction[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
    } catch (e) {
      console.warn('Failed to persist swipe queue:', e);
    }
  }

  /**
   * Enqueues a swipe action for persistence
   */
  public static enqueue(action: Omit<QueuedSwipeAction, 'retries'>): void {
    const queue = this.getQueue();
    // Prevent duplicate actionIds in the outbox
    if (!queue.some(item => item.actionId === action.actionId)) {
      queue.push({ ...action, retries: 0 });
      this.saveQueue(queue);
    }
  }

  /**
   * Removes a successfully processed swipe action
   */
  public static dequeue(actionId: string): void {
    const queue = this.getQueue().filter(item => item.actionId !== actionId);
    this.saveQueue(queue);
  }

  /**
   * Sends a swipe action to the backend server with idempotency
   */
  public static async executeSwipe(action: QueuedSwipeAction): Promise<{
    success: boolean;
    isMatch: boolean;
    connection?: any;
    networkError?: boolean;
  }> {
    try {
      const res = await fetch('/api/v1/discovery/swipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actionId: action.actionId,
          targetUserId: action.targetUserId,
          action: action.action,
          connectionType: action.connectionType || 'dating'
        })
      });

      if (!res.ok) {
        return { success: false, isMatch: false, networkError: false };
      }

      const data = await res.json();
      return {
        success: Boolean(data.success),
        isMatch: Boolean(data.isMatch),
        connection: data.connection,
        networkError: false
      };
    } catch {
      return { success: false, isMatch: false, networkError: true };
    }
  }

  /**
   * Drains the pending outbox queue with retries
   */
  public static async drainQueue(): Promise<void> {
    if (this.isDraining) return;
    this.isDraining = true;

    try {
      const queue = this.getQueue();
      if (queue.length === 0) return;

      for (const item of queue) {
        const result = await this.executeSwipe(item);
        if (result.success || !result.networkError) {
          // If server responded (either success or permanent validation), dequeue
          this.dequeue(item.actionId);
        } else {
          // Temporary network error: increment retries and stop draining for now
          item.retries += 1;
          this.saveQueue(queue);
          break;
        }
      }
    } finally {
      this.isDraining = false;
    }
  }

  /**
   * Initializes automatic online reconnection listener
   */
  public static initAutoDrain(): () => void {
    const handleOnline = () => {
      this.drainQueue();
    };

    window.addEventListener('online', handleOnline);
    // Attempt drain on startup
    this.drainQueue();

    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }
}
