import { db } from '../db';
import { v4 as uuidv4 } from 'uuid';
import { QuoteProviderAdapter, Quote } from './types';
import { DummyJSONQuoteAdapter } from './adapters/dummyjson';
import { ZenQuotesAdapter } from './adapters/zenquotes';

export function normalizeQuoteText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function normalizeAuthor(author: string): string {
  return author
    .toLowerCase()
    .replace(/p[\.]*h[\.]*d[\.]*/gi, '')
    .replace(/\b(dr|prof|professor|sir|dame|md|esq)\b\.?/gi, '')
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export class QuoteProviderRegistry {
  private static adapters: Map<string, QuoteProviderAdapter> = new Map();

  static {
    this.register(new DummyJSONQuoteAdapter());
    this.register(new ZenQuotesAdapter());
  }

  public static register(adapter: QuoteProviderAdapter): void {
    this.adapters.set(adapter.providerId, adapter);
  }

  public static get(providerId: string): QuoteProviderAdapter | undefined {
    return this.adapters.get(providerId);
  }

  public static getAll(): QuoteProviderAdapter[] {
    return Array.from(this.adapters.values());
  }

  public static normalizeQuoteText(text: string): string {
    return normalizeQuoteText(text);
  }

  public static normalizeAuthor(author: string): string {
    return normalizeAuthor(author);
  }

  public static ingestQuote(
    item: { text: string; author: string; category: import('./types').QuoteCategoryKey; tags?: string[]; attribution?: string; sourceUrl?: string },
    provider: string = 'sanctuary'
  ): { id: string; isDuplicate: boolean } {
    const normText = normalizeQuoteText(item.text);
    const normAuthor = normalizeAuthor(item.author);

    const exists = db.prepare('SELECT id FROM quotes WHERE normalized_text = ? AND normalized_author = ?').get(normText, normAuthor) as any;
    if (exists) {
      return { id: exists.id, isDuplicate: true };
    }

    const id = `qt_${uuidv4().slice(0, 10)}`;
    const now = Date.now();
    db.prepare(`
      INSERT INTO quotes (
        id, text, normalized_text, author, normalized_author, category, tags_json,
        language, provider, source_url, attribution, license, imported_at,
        is_verified, is_moderated, is_featured, report_count, likes_count, saves_count, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'en', ?, ?, ?, 'public_domain', ?, 1, 1, 0, 0, 0, 0, ?)
    `).run(
      id,
      item.text.trim(),
      normText,
      item.author.trim(),
      normAuthor,
      item.category,
      JSON.stringify(item.tags || []),
      provider,
      item.sourceUrl || null,
      item.attribution || null,
      now,
      now
    );

    return { id, isDuplicate: false };
  }

  /**
   * Fetches quotes from enabled providers in batch, deduplicates against existing records,
   * and inserts new quotes into SQLite. Returns count of newly inserted quotes.
   */
  public static async fetchAndIngestBatch(providerId?: string, limit: number = 25): Promise<number> {
    const candidates = providerId 
      ? [this.get(providerId)].filter(Boolean) as QuoteProviderAdapter[]
      : this.getAll();

    if (candidates.length === 0) return 0;

    let totalInserted = 0;
    const now = Date.now();

    for (const adapter of candidates) {
      // Check admin enablement and rate limit
      const adminSetting = db.prepare('SELECT * FROM admin_quote_providers WHERE provider_id = ?').get(adapter.providerId) as any;
      if (adminSetting && !adminSetting.is_enabled) {
        continue;
      }

      // Check rate limit: minimum 5 seconds between automated fetches
      if (adminSetting && adminSetting.last_fetched_at && (now - adminSetting.last_fetched_at < 5000)) {
        continue;
      }

      try {
        const batch = await adapter.fetchBatch(limit);
        if (batch.length === 0) {
          db.prepare('UPDATE admin_quote_providers SET failure_count = failure_count + 1, health_status = "degraded", updated_at = ? WHERE provider_id = ?')
            .run(now, adapter.providerId);
          continue;
        }

        const insertStmt = db.prepare(`
          INSERT OR IGNORE INTO quotes (
            id, text, normalized_text, author, normalized_author, category, tags_json,
            language, provider, source_url, attribution, license, imported_at,
            is_verified, is_moderated, is_featured, report_count, likes_count, saves_count, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        let insertedCount = 0;
        db.transaction(() => {
          for (const item of batch) {
            const normText = normalizeQuoteText(item.text);
            const normAuthor = normalizeAuthor(item.author);

            // Deduplicate check
            const exists = db.prepare('SELECT id FROM quotes WHERE normalized_text = ? AND normalized_author = ?')
              .get(normText, normAuthor);
            if (exists) continue;

            const id = `qt_${uuidv4().slice(0, 10)}`;
            insertStmt.run(
              id,
              item.text,
              normText,
              item.author,
              normAuthor,
              item.category,
              JSON.stringify(item.tags || []),
              item.language || 'en',
              item.provider,
              item.sourceUrl || null,
              item.attribution,
              item.license || null,
              now,
              1,
              1,
              0,
              0,
              0,
              0,
              now
            );
            insertedCount++;
          }
        })();

        totalInserted += insertedCount;

        db.prepare(`
          UPDATE admin_quote_providers SET
            last_fetched_at = ?,
            health_status = 'healthy',
            total_fetched = total_fetched + ?,
            updated_at = ?
          WHERE provider_id = ?
        `).run(now, insertedCount, now, adapter.providerId);

      } catch (err: any) {
        db.prepare('UPDATE admin_quote_providers SET failure_count = failure_count + 1, health_status = "degraded", updated_at = ? WHERE provider_id = ?')
          .run(now, adapter.providerId);
      }
    }

    return totalInserted;
  }
}
