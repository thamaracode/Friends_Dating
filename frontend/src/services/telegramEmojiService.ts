import {
  TelegramPremiumEmoji,
  TelegramEmojiStyleFamily,
  TelegramEmojiCategoryGroup,
  TelegramEmojiStyleProfile,
  getTelegramEmojiPreviewUrl
} from '../types/telegramEmoji';

import curatedData from '../data/telegramEmojiCurated.json';
import styleProfileJson from '../emoji-style.json';

const RECENT_KEY = 'soulverse_recent_tg_emojis_v1';
const FAVORITES_KEY = 'soulverse_favorite_tg_emojis_v1';

class TelegramEmojiService {
  private curated: TelegramPremiumEmoji[] = curatedData as TelegramPremiumEmoji[];
  private slimIndex: any[] | null = null;
  private isLoadingFullIndex = false;
  private profile: TelegramEmojiStyleProfile = styleProfileJson as TelegramEmojiStyleProfile;

  /**
   * Returns instant 258 curated verified emojis categorized by emotional role.
   */
  public getCurated(): TelegramPremiumEmoji[] {
    return this.curated;
  }

  /**
   * Returns the application style profile (emoji-style.json)
   */
  public getProfile(): TelegramEmojiStyleProfile {
    return this.profile;
  }

  /**
   * Returns the mapped emoji ID for an established application role
   */
  public getRoleEmoji(roleName: string): { id: string; fallback: string; name: string } | null {
    const r = this.profile.roles[roleName];
    if (!r) return null;
    return {
      id: r.id,
      fallback: r.html_fallback,
      name: r.name
    };
  }

  /**
   * Lazily loads the complete 7,092 catalog for full deep search
   */
  public async loadFullIndex(): Promise<any[]> {
    if (this.slimIndex) return this.slimIndex;
    if (this.isLoadingFullIndex) {
      await new Promise(r => setTimeout(r, 100));
      return this.slimIndex || this.curated;
    }

    try {
      this.isLoadingFullIndex = true;
      const mod = await import('../data/telegramEmojiSlimIndex.json');
      this.slimIndex = mod.default || mod;
      return this.slimIndex!;
    } catch (err) {
      console.warn('Could not load full Telegram Emoji index, using curated list:', err);
      return this.curated;
    } finally {
      this.isLoadingFullIndex = false;
    }
  }

  /**
   * Unified search across all verified emojis with style and category filters
   */
  public async search(
    query = '',
    style: TelegramEmojiStyleFamily = 'all',
    group: TelegramEmojiCategoryGroup = 'all',
    limit = 60
  ): Promise<TelegramPremiumEmoji[]> {
    const q = query.trim().toLowerCase();

    // If query is empty and group/style are specified, search curated first for instant UI response
    let pool: any[] = this.curated;

    if (q.length >= 2) {
      const full = await this.loadFullIndex();
      if (full && full.length > 0) {
        pool = full;
      }
    }

    const results: TelegramPremiumEmoji[] = [];

    for (const item of pool) {
      // Normalization check for full index vs curated
      const itemStyle = item.style || item.s || 'illustrated';
      const itemGroup = item.group || 'topic';
      const searchTokens = item.search || item.q || `${item.name || item.n} ${item.key || item.k}`.toLowerCase();

      // Style filter
      if (style !== 'all' && itemStyle !== style) {
        continue;
      }

      // Group filter (only if not 'all')
      if (group !== 'all' && itemGroup !== group) {
        continue;
      }

      // Query filter
      if (q && !searchTokens.includes(q)) {
        continue;
      }

      results.push({
        id: item.id,
        key: item.key || item.k,
        name: item.name || item.n,
        fallback: item.fallback || item.f || '✨',
        pack: item.pack || item.p || 'Telegram Pack',
        style: itemStyle,
        previewUrl: item.previewUrl || item.u || getTelegramEmojiPreviewUrl(item.id),
        group: itemGroup
      });

      if (results.length >= limit) break;
    }

    return results;
  }

  /**
   * Finds a specific emoji by its Telegram custom_emoji_id
   */
  public getById(id: string): TelegramPremiumEmoji | null {
    const found = this.curated.find(c => c.id === id);
    if (found) return found;

    if (this.slimIndex) {
      const item = this.slimIndex.find(s => s.id === id);
      if (item) {
        return {
          id: item.id,
          key: item.k,
          name: item.n,
          fallback: item.f,
          pack: item.p,
          style: item.s,
          previewUrl: item.u || getTelegramEmojiPreviewUrl(item.id),
          group: 'topic'
        };
      }
    }

    return null;
  }

  // --- Recents & Favorites ---
  public getRecents(): string[] {
    try {
      const raw = localStorage.getItem(RECENT_KEY);
      return raw ? JSON.parse(raw) : ['4996980495100150380', '5424972470023104089', '5172484558305625218', '5206607081334906820'];
    } catch {
      return ['4996980495100150380', '5424972470023104089', '5172484558305625218'];
    }
  }

  public trackRecent(id: string): void {
    try {
      const list = this.getRecents().filter(x => x !== id);
      list.unshift(id);
      if (list.length > 24) list.pop();
      localStorage.setItem(RECENT_KEY, JSON.stringify(list));
    } catch {
      // Ignore quota
    }
  }

  public getFavorites(): string[] {
    try {
      const raw = localStorage.getItem(FAVORITES_KEY);
      return raw ? JSON.parse(raw) : ['4996980495100150380', '5424972470023104089', '5172484558305625218'];
    } catch {
      return ['4996980495100150380', '5424972470023104089'];
    }
  }

  public toggleFavorite(id: string): boolean {
    try {
      let list = this.getFavorites();
      const has = list.includes(id);
      if (has) {
        list = list.filter(x => x !== id);
      } else {
        list.unshift(id);
      }
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(list));
      return !has;
    } catch {
      return false;
    }
  }
}

export const telegramEmojiService = new TelegramEmojiService();
