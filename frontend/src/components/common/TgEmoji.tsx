import React, { useState } from 'react';
import { getTelegramEmojiPreviewUrl } from '../../types/telegramEmoji';
import { telegramEmojiService } from '../../services/telegramEmojiService';

export interface TgEmojiProps {
  id?: string;
  fallback?: string;
  role?: string;
  size?: number;
  className?: string;
  title?: string;
  animate?: boolean;
}

export const TgEmoji: React.FC<TgEmojiProps> = ({
  id,
  fallback = '✨',
  role,
  size = 20,
  className = '',
  title,
  animate = true
}) => {
  const [hasError, setHasError] = useState(false);

  // If role is provided, resolve ID and fallback from application profile (emoji-style.json)
  let resolvedId = id;
  let resolvedFallback = fallback;
  let resolvedTitle = title;

  if (role && !resolvedId) {
    const roleData = telegramEmojiService.getRoleEmoji(role);
    if (roleData) {
      resolvedId = roleData.id;
      resolvedFallback = roleData.fallback;
      resolvedTitle = resolvedTitle || roleData.name;
    }
  }

  if (!resolvedId || hasError) {
    return (
      <span
        className={`inline-flex items-center justify-center select-none ${className}`}
        style={{ fontSize: `${size * 0.9}px`, lineHeight: 1 }}
        title={resolvedTitle || resolvedFallback}
        aria-label={resolvedFallback}
      >
        {resolvedFallback}
      </span>
    );
  }

  const src = getTelegramEmojiPreviewUrl(resolvedId);

  return (
    <img
      src={src}
      alt={resolvedFallback}
      title={resolvedTitle || resolvedFallback}
      loading="lazy"
      width={size}
      height={size}
      onError={() => setHasError(true)}
      className={`inline-block align-middle object-contain select-none transition-transform duration-200 ${
        animate ? 'hover:scale-125' : ''
      } ${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        minWidth: `${size}px`,
        minHeight: `${size}px`
      }}
    />
  );
};

/**
 * Parses a chat message or UI string containing:
 * - `<tg-emoji emoji-id="123">Fallback</tg-emoji>`
 * - `[tg:123:fallback]`
 * - `:tg_123:`
 * and renders inline `<TgEmoji />` components while preserving plain text.
 */
export function renderWithTelegramEmojis(
  text: string,
  emojiSize = 22
): React.ReactNode {
  if (!text) return null;

  // Regex to match <tg-emoji emoji-id="(\d+)">([^<]*)</tg-emoji> or [tg:(\d+):([^\]]+)]
  const tgEmojiRegex = /<tg-emoji\s+emoji-id=["']?(\d+)["']?>([^<]*)<\/tg-emoji>|\[tg:(\d+):([^\]]+)\]|:tg_(\d+):/gi;

  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = tgEmojiRegex.exec(text)) !== null) {
    // Push preceding text
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    const id = match[1] || match[3] || match[5];
    const fallback = match[2] || match[4] || '✨';

    parts.push(
      <TgEmoji
        key={`${match.index}-${id}`}
        id={id}
        fallback={fallback}
        size={emojiSize}
        className="mx-0.5 inline-block align-text-bottom"
      />
    );

    lastIndex = match.index + match[0].length;
  }

  // Push remaining text
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length > 0 ? parts : text;
}
