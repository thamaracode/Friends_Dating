import React from 'react';
import { EditorialHumanProfileView } from './profile/EditorialHumanProfileView';
import type { UserProfile } from '../types';

interface ProfileDetailSheetProps {
  profile: UserProfile | null;
  onClose: () => void;
  onInitiateChat: (profile: UserProfile) => void;
  onSuperLike: (profile: UserProfile) => void;
}

/**
 * Profile Detail Sheet (Dossier Inspector):
 * Full-screen modal sheet displaying the complete 6-section Digital Human Identity
 * (The Person, Their World, Their Mind, Their Story, Their Imagination, Their Social World).
 */
export const ProfileDetailSheet: React.FC<ProfileDetailSheetProps> = ({
  profile,
  onClose,
  onInitiateChat,
  onSuperLike
}) => {
  if (!profile) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#0A0B0F]/95 backdrop-blur-2xl overflow-y-auto no-scrollbar animate-fadeIn">
      <div className="min-h-screen px-2 sm:px-4 pt-2">
        <EditorialHumanProfileView
          profile={profile}
          isSelf={profile.id === 'usr_me'}
          onClose={onClose}
          onInitiateChat={onInitiateChat}
          onSuperLike={onSuperLike}
        />
      </div>
    </div>
  );
};
