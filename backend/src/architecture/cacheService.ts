interface CacheEntry<T> {
  value: T;
  expiresAt: number;
  tags: string[];
}

export class CacheService {
  private static store: Map<string, CacheEntry<any>> = new Map();
  private static hits: number = 0;
  private static misses: number = 0;

  /**
   * Sets a value in the cache with a specified TTL and optional tags
   */
  public static set<T>(
    key: string,
    value: T,
    ttlSeconds: number = 300,
    tags: string[] = []
  ): void {
    const expiresAt = Date.now() + ttlSeconds * 1000;
    this.store.set(key, { value, expiresAt, tags });
  }

  /**
   * Retrieves a cached value if present and unexpired
   */
  public static get<T>(key: string): T | undefined {
    const entry = this.store.get(key);
    if (!entry) {
      this.misses++;
      return undefined;
    }

    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      this.misses++;
      return undefined;
    }

    this.hits++;
    return entry.value as T;
  }

  /**
   * Checks existence of key without mutating hit/miss stats
   */
  public static has(key: string): boolean {
    const entry = this.store.get(key);
    if (!entry) return false;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return false;
    }
    return true;
  }

  /**
   * Explicitly invalidates a cache key
   */
  public static invalidate(key: string): boolean {
    return this.store.delete(key);
  }

  /**
   * Invalidates all cache entries carrying a specific tag
   */
  public static invalidateTag(tag: string): number {
    let count = 0;
    for (const [key, entry] of this.store.entries()) {
      if (entry.tags.includes(tag)) {
        this.store.delete(key);
        count++;
      }
    }
    return count;
  }

  /**
   * Retrieves cache performance metrics
   */
  public static getStats(): {
    hits: number;
    misses: number;
    size: number;
    hitRate: string;
  } {
    const total = this.hits + this.misses;
    const hitRate = total > 0 ? `${((this.hits / total) * 100).toFixed(1)}%` : '0.0%';
    return {
      hits: this.hits,
      misses: this.misses,
      size: this.store.size,
      hitRate
    };
  }

  /**
   * Periodically purges all expired entries
   */
  public static purgeExpired(): number {
    const now = Date.now();
    let purged = 0;
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.expiresAt) {
        this.store.delete(key);
        purged++;
      }
    }
    return purged;
  }

  /**
   * Clears the entire cache store and resets counters
   */
  public static clear(): void {
    this.store.clear();
    this.hits = 0;
    this.misses = 0;
  }
}

// Background cleaner for cache memory leaks
setInterval(() => {
  CacheService.purgeExpired();
}, 60 * 1000).unref();
