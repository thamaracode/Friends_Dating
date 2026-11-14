export type TelegramEmojiStyleFamily =
  | 'all'
  | 'minimal'
  | 'illustrated'
  | 'cute'
  | 'neon'
  | 'pixel'
  | 'outline'
  | 'brand'
  | 'drawn'
  | 'nature'
  | 'ornament';

export type TelegramEmojiCategoryGroup =
  | 'all'
  | 'reactions'
  | 'love'
  | 'vip'
  | 'cute'
  | 'neon'
  | 'pixel'
  | 'topic'
  | 'system';

export interface TelegramPremiumEmoji {
  id: string;
  key: string;
  name: string;
  fallback: string;
  pack: string;
  style: TelegramEmojiStyleFamily;
  previewUrl: string;
  group: TelegramEmojiCategoryGroup;
  search?: string;
}

export interface TelegramEmojiRoleItem {
  id: string;
  key: string;
  name: string;
  pack: string;
  html_fallback: string;
  query?: string;
}

export interface TelegramEmojiStyleProfile {
  schema_version: number;
  style: string;
  primary_pack: string;
  secondary_packs: string[];
  roles: Record<string, TelegramEmojiRoleItem>;
  constraints?: {
    animation?: 'any' | 'static' | 'animated';
    color?: 'any' | 'monochrome' | 'colored';
    repainting?: 'optional' | 'required';
  };
}

/**
 * Generates official Telegram Bot API compatible HTML format:
 * <tg-emoji emoji-id="5456140674028019486">🚨</tg-emoji>
 */
export function formatTelegramEmojiHtml(id: string, fallback: string): string {
  return `<tg-emoji emoji-id="${id}">${fallback}</tg-emoji>`;
}

/**
 * Returns the CDN image preview URL for a verified Telegram Custom Emoji ID
 */
export function getTelegramEmojiPreviewUrl(id: string): string {
  return `https://zulut30.github.io/premium-telegram-emoji/images/${id}.png`;
}
