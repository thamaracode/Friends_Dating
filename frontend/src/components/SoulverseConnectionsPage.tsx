import React from 'react';
import { LikesAndMatchesView } from './discovery/LikesAndMatchesView';
import type { UserProfile } from '../types';

interface SoulverseConnectionsPageProps {
  onOpenProfile?: (profile: UserProfile) => void;
  onInitiateChat?: (profile: UserProfile) => void;
}

/**
 * Soulverse Likes & Matches Page:
 * Primary destination for people who liked the user, mutual matches, and instant conversation starters.
 */
export const SoulverseConnectionsPage: React.FC<SoulverseConnectionsPageProps> = ({
  onOpenProfile = () => {},
  onInitiateChat = () => {}
}) => {
  return (
    <LikesAndMatchesView
      onOpenProfile={onOpenProfile}
      onInitiateChat={onInitiateChat}
    />
  );
};
