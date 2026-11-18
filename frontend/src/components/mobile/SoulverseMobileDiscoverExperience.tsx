import React from 'react';
import type { UserProfile } from '../../types';
import { ContentFirstSocialFeed } from '../discovery/ContentFirstSocialFeed';

interface SoulverseMobileDiscoverExperienceProps {
  onOpenProfile: (profile: UserProfile) => void;
  onInitiateChat: (profile: UserProfile) => void;
  onOpenDailyHub?: () => void;
  onOpenUnspoken?: () => void;
}

/**
 * SOULVERSE CONTENT-FIRST SOCIAL DISCOVERY
 * Discover people through their thoughts, original quotes, questions, photography,
 * creative work, and personal expressions rather than appearance-first swipe cards.
 */
export const SoulverseMobileDiscoverExperience: React.FC<SoulverseMobileDiscoverExperienceProps> = ({
  onOpenProfile,
  onInitiateChat
}) => {
  return (
    <div className="w-full pb-20">
      <ContentFirstSocialFeed
        onOpenProfile={onOpenProfile}
        onInitiateChat={onInitiateChat}
      />
    </div>
  );
};
