import React from 'react';
import { 
  Settings, 
  Edit3, 
  Share2, 
  Check, 
  ShieldCheck, 
  Calendar, 
  Compass, 
  Layers 
} from 'lucide-react';
import { CURRENT_USER } from '../../mockData';
import { EditorialHumanProfileView } from '../profile/EditorialHumanProfileView';

interface SoulverseMobileProfileExperienceProps {
  onNavigateToSettings: () => void;
  onNavigateToTimeline: () => void;
  onNavigateToAdmin: () => void;
  onOpenCharacterBuilder: () => void;
  onEditProfileModal: () => void;
  onOpenUnspoken?: () => void;
}

/**
 * Soulverse Mobile Profile Experience:
 * Renders the user's Digital Human Identity across the 6 editorial sections:
 * The Person, Their World, Their Mind, Their Story, Their Imagination, Their Social World.
 */
export const SoulverseMobileProfileExperience: React.FC<SoulverseMobileProfileExperienceProps> = ({
  onNavigateToSettings,
  onNavigateToTimeline,
  onEditProfileModal
}) => {
  const profile = CURRENT_USER;

  return (
    <div className="w-full max-w-3xl mx-auto px-3 sm:px-6 pt-4 pb-32 animate-fadeIn space-y-6">
      
      {/* Editorial Profile Header Action Bar */}
      <div className="flex items-center justify-between p-4 rounded-2xl bg-[#12141D] border border-white/[0.08] shadow-lg">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono uppercase tracking-wider text-rose-300 font-bold">
              My Human Identity
            </span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-[10px] font-mono">
              Live & Public
            </span>
          </div>
          <h2 className="text-base font-bold text-white font-heading">
            {profile.name} (You)
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onEditProfileModal}
            className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            title="Edit Identity & Photos"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit Profile</span>
          </button>

          <button
            onClick={onNavigateToSettings}
            className="p-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-zinc-300 hover:text-white transition-colors cursor-pointer"
            title="Settings & Privacy"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* The 6-Section Editorial Profile */}
      <EditorialHumanProfileView
        profile={profile}
        isSelf={true}
        onEditProfile={onEditProfileModal}
      />

    </div>
  );
};
