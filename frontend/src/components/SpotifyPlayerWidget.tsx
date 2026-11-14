import React from 'react';

export interface SpotifyPlayerWidgetProps {
  variant?: 'card' | 'mini-dock' | 'expanded';
  className?: string;
}

/**
 * SpotifyPlayerWidget
 * Permanently disabled: Intrusive floating mini-docks and legacy ambient popups
 * are completely eliminated from the Soulverse interface.
 */
export const SpotifyPlayerWidget: React.FC<SpotifyPlayerWidgetProps> = () => {
  return null;
};
