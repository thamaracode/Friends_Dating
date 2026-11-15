import React from 'react';
import { 
  Compass, 
  MessageCircle, 
  Plus, 
  Sparkles, 
  User 
} from 'lucide-react';
import type { MobilePrimaryTab } from '../../types';

interface SoulverseMobileNavbarProps {
  activeTab: MobilePrimaryTab;
  onSelectTab: (tab: MobilePrimaryTab) => void;
  onTriggerCreate: () => void;
  unreadMessagesCount?: number;
  userAvatar?: string;
  isHidden?: boolean;
}

/**
 * Soulverse Liquid Glass Floating Navigation Dock
 * Directly inspired by the visionOS liquid glass aesthetic from Creative Direction
 */
export const SoulverseMobileNavbar: React.FC<SoulverseMobileNavbarProps> = ({
  activeTab,
  onSelectTab,
  onTriggerCreate,
  unreadMessagesCount = 3,
  userAvatar,
  isHidden = false
}) => {
  if (isHidden) return null;

  return (
    <nav 
      className="fixed bottom-[calc(0.75rem+env(safe-area-inset-bottom,0px))] sm:bottom-6 inset-x-0 mx-auto max-w-[380px] sm:max-w-[410px] px-3 z-40 pointer-events-none select-none transition-all duration-300"
      aria-label="Mobile Navigation"
    >
      <div className="pointer-events-auto liquid-dock p-2 flex items-center justify-between">
        
        {/* 1. DISCOVER / FEED */}
        <button
          onClick={() => onSelectTab('discover')}
          className={`relative flex items-center justify-center flex-1 h-12 rounded-2xl transition-all duration-200 cursor-pointer active:scale-95 group ${
            activeTab === 'discover' 
              ? 'liquid-pill-active shadow-[0_0_20px_rgba(236,72,153,0.35)]' 
              : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
          }`}
          title="Discover Humans & Chemistry"
        >
          <Compass className={`w-5 h-5 transition-transform ${activeTab === 'discover' ? 'scale-110 text-white' : 'text-zinc-400 group-hover:text-zinc-200'}`} />
          {activeTab === 'discover' && (
            <span className="absolute bottom-1 w-1 h-1 rounded-full bg-white shadow-[0_0_6px_#ffffff]" />
          )}
        </button>

        {/* 2. INBOX / MESSAGES */}
        <button
          onClick={() => onSelectTab('inbox')}
          className={`relative flex items-center justify-center flex-1 h-12 rounded-2xl transition-all duration-200 cursor-pointer active:scale-95 group ${
            activeTab === 'inbox' 
              ? 'liquid-pill-active shadow-[0_0_20px_rgba(236,72,153,0.35)]' 
              : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
          }`}
          title="Messages, Audio Notes & Rooms"
        >
          <div className="relative">
            <MessageCircle className={`w-5 h-5 transition-transform ${activeTab === 'inbox' ? 'scale-110 text-white' : 'text-zinc-400 group-hover:text-zinc-200'}`} />
            {unreadMessagesCount > 0 && (
              <span className="absolute -top-1.5 -right-2 min-w-[17px] h-[17px] px-1 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-white text-[10px] font-black flex items-center justify-center shadow-[0_0_10px_rgba(236,72,153,0.7)]">
                {unreadMessagesCount}
              </span>
            )}
          </div>
          {activeTab === 'inbox' && (
            <span className="absolute bottom-1 w-1 h-1 rounded-full bg-white shadow-[0_0_6px_#ffffff]" />
          )}
        </button>

        {/* 3. CENTER CREATE (+) BUTTON */}
        <div className="flex-1 flex justify-center px-1">
          <button
            onClick={onTriggerCreate}
            className="liquid-btn-create group"
            title="Create Identity, Story or World"
          >
            <Plus className="w-6 h-6 text-white stroke-[2.5]" />
          </button>
        </div>

        {/* 4. CONNECT / RADAR */}
        <button
          onClick={() => onSelectTab('connect')}
          className={`relative flex items-center justify-center flex-1 h-12 rounded-2xl transition-all duration-200 cursor-pointer active:scale-95 group ${
            activeTab === 'connect' 
              ? 'liquid-pill-active shadow-[0_0_20px_rgba(236,72,153,0.35)]' 
              : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
          }`}
          title="Connect with Communities & Events"
        >
          <div className="relative">
            <Sparkles className={`w-5 h-5 transition-transform ${activeTab === 'connect' ? 'scale-110 text-white' : 'text-zinc-400 group-hover:text-zinc-200'}`} />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#10B981]" />
          </div>
          {activeTab === 'connect' && (
            <span className="absolute bottom-1 w-1 h-1 rounded-full bg-white shadow-[0_0_6px_#ffffff]" />
          )}
        </button>

        {/* 5. PROFILE */}
        <button
          onClick={() => onSelectTab('profile')}
          className={`relative flex items-center justify-center flex-1 h-12 rounded-2xl transition-all duration-200 cursor-pointer active:scale-95 group ${
            activeTab === 'profile' 
              ? 'liquid-pill-active shadow-[0_0_20px_rgba(236,72,153,0.35)]' 
              : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
          }`}
          title="Multiple Identities & Life Settings"
        >
          <div className="relative">
            {userAvatar ? (
              <div className={`w-6 h-6 rounded-full overflow-hidden border transition-all ${
                activeTab === 'profile' 
                  ? 'border-white ring-2 ring-pink-500/50 scale-105' 
                  : 'border-white/30'
              }`}>
                <img src={userAvatar} alt="Profile" className="w-full h-full object-cover" />
              </div>
            ) : (
              <User className={`w-5 h-5 transition-transform ${activeTab === 'profile' ? 'scale-110 text-white' : 'text-zinc-400 group-hover:text-zinc-200'}`} />
            )}
          </div>
          {activeTab === 'profile' && (
            <span className="absolute bottom-1 w-1 h-1 rounded-full bg-white shadow-[0_0_6px_#ffffff]" />
          )}
        </button>

      </div>
    </nav>
  );
};
