import React from 'react';
import { 
  Compass, 
  Users, 
  Plus, 
  MessageCircle, 
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
 * Soulverse Mobile Floating 5-Destination Glass Navigation Bar
 * Architecture: Mobile-first native ergonomics, specular dark glass, floating dock
 * 
 * 5 Primary Destinations:
 * 1. Discover  (Dating, Friends, Personality, Daily Reflection)
 * 2. Connect   (Communities, Events, Watch Parties, Discussions, Solo)
 * 3. Create    (Action Sheet: Identities, Timeline, Journal, Stories, Events)
 * 4. Inbox     (1-on-1 Chats, Rooms, Voice Notes, Calls, Mini-Games)
 * 5. Profile   (Multiple Identities, Timeline, Social Integrations, Settings)
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
      className="fixed bottom-3 sm:bottom-6 inset-x-0 mx-auto max-w-[420px] px-3 z-40 pointer-events-none transition-all duration-300"
      aria-label="Mobile Navigation"
    >
      <div className="pointer-events-auto rounded-full p-2 border border-white/[0.12] shadow-[0_20px_50px_rgba(0,0,0,0.85)] flex items-center justify-between backdrop-blur-3xl bg-[#0E1017]/90">
        
        {/* 1. DISCOVER */}
        <button
          onClick={() => onSelectTab('discover')}
          className={`relative flex flex-col items-center justify-center flex-1 min-h-[48px] py-1 px-1 rounded-full transition-all duration-200 cursor-pointer active:scale-95 group ${
            activeTab === 'discover' 
              ? 'bg-white/15 text-white shadow-[0_0_14px_rgba(255,255,255,0.15)] border border-white/20' 
              : 'text-zinc-400 hover:text-white'
          }`}
          title="Discover People & Deep Chemistry"
        >
          <Compass className={`w-5 h-5 transition-transform ${activeTab === 'discover' ? 'scale-110 text-white' : 'text-zinc-400 group-hover:text-zinc-200'}`} />
          <span className="text-xs font-semibold mt-1 tracking-tight">Discover</span>
        </button>

        {/* 2. CONNECT */}
        <button
          onClick={() => onSelectTab('connect')}
          className={`relative flex flex-col items-center justify-center flex-1 min-h-[48px] py-1 px-1 rounded-full transition-all duration-200 cursor-pointer active:scale-95 group ${
            activeTab === 'connect' 
              ? 'bg-white/15 text-white shadow-[0_0_14px_rgba(255,255,255,0.15)] border border-white/20' 
              : 'text-zinc-400 hover:text-white'
          }`}
          title="Connect with Communities & Events"
        >
          <div className="relative">
            <Users className={`w-5 h-5 transition-transform ${activeTab === 'connect' ? 'scale-110 text-white' : 'text-zinc-400 group-hover:text-zinc-200'}`} />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#10B981]" />
          </div>
          <span className="text-xs font-semibold mt-1 tracking-tight">Connect</span>
        </button>

        {/* 3. CREATE (Center Prominent Action Button with subtle gold specular accent) */}
        <div className="flex-1 flex justify-center px-1">
          <button
            onClick={onTriggerCreate}
            className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#181B24] via-[#242838] to-[#181B24] border border-amber-400/40 shadow-[0_4px_20px_rgba(246,193,56,0.22),inset_0_1px_1.5px_rgba(255,255,255,0.35)] flex items-center justify-center text-white cursor-pointer active:scale-90 hover:scale-105 transition-all group"
            title="Create Identity, Timeline, Story or Event"
          >
            <Plus className="w-5 h-5 text-amber-300 group-hover:rotate-90 transition-transform duration-300" strokeWidth={2.5} />
          </button>
        </div>

        {/* 4. INBOX */}
        <button
          onClick={() => onSelectTab('inbox')}
          className={`relative flex flex-col items-center justify-center flex-1 min-h-[48px] py-1 px-1 rounded-full transition-all duration-200 cursor-pointer active:scale-95 group ${
            activeTab === 'inbox' 
              ? 'bg-white/15 text-white shadow-[0_0_14px_rgba(255,255,255,0.15)] border border-white/20' 
              : 'text-zinc-400 hover:text-white'
          }`}
          title="Messages, Audio Notes & Rooms"
        >
          <div className="relative">
            <MessageCircle className={`w-5 h-5 transition-transform ${activeTab === 'inbox' ? 'scale-110 text-white' : 'text-zinc-400 group-hover:text-zinc-200'}`} />
            {unreadMessagesCount > 0 && (
              <span className="absolute -top-1.5 -right-2 px-1.5 py-0.5 rounded-full bg-white text-[#090A0E] text-[10px] font-bold shadow-[0_0_8px_rgba(255,255,255,0.8)]">
                {unreadMessagesCount}
              </span>
            )}
          </div>
          <span className="text-xs font-semibold mt-1 tracking-tight">Inbox</span>
        </button>

        {/* 5. PROFILE */}
        <button
          onClick={() => onSelectTab('profile')}
          className={`relative flex flex-col items-center justify-center flex-1 min-h-[48px] py-1 px-1 rounded-full transition-all duration-200 cursor-pointer active:scale-95 group ${
            activeTab === 'profile' 
              ? 'bg-white/15 text-white shadow-[0_0_14px_rgba(255,255,255,0.15)] border border-white/20' 
              : 'text-zinc-400 hover:text-white'
          }`}
          title="Multiple Identities & Life Settings"
        >
          <div className="relative">
            {userAvatar ? (
              <div className={`w-6 h-6 rounded-full overflow-hidden border transition-all ${
                activeTab === 'profile' 
                  ? 'border-white ring-2 ring-white/30 scale-110' 
                  : 'border-white/30'
              }`}>
                <img src={userAvatar} alt="Profile" className="w-full h-full object-cover" />
              </div>
            ) : (
              <User className={`w-5 h-5 transition-transform ${activeTab === 'profile' ? 'scale-110 text-white' : 'text-zinc-400 group-hover:text-zinc-200'}`} />
            )}
          </div>
          <span className="text-xs font-semibold mt-1 tracking-tight">Profile</span>
        </button>

      </div>
    </nav>
  );
};
