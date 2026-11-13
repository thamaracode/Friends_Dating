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
      className="fixed bottom-3 sm:bottom-5 inset-x-0 mx-auto max-w-[390px] px-3 z-40 pointer-events-none transition-all duration-300"
      aria-label="Mobile Navigation"
    >
      <div className="pointer-events-auto dark-glass-elevated rounded-full p-1.5 border border-white/15 shadow-[0_16px_40px_rgba(0,0,0,0.85)] flex items-center justify-between backdrop-blur-2xl bg-[#0E1017]/85">
        
        {/* 1. DISCOVER */}
        <button
          onClick={() => onSelectTab('discover')}
          className={`relative flex flex-col items-center justify-center flex-1 py-1.5 px-1 rounded-full transition-all duration-200 cursor-pointer active:scale-95 group ${
            activeTab === 'discover' 
              ? 'bg-white/15 text-white shadow-[0_0_12px_rgba(255,255,255,0.12)] border border-white/20' 
              : 'text-zinc-400 hover:text-white'
          }`}
          title="Discover People & Deep Chemistry"
        >
          <Compass className={`w-5 h-5 transition-transform ${activeTab === 'discover' ? 'scale-110 text-white' : 'text-zinc-400'}`} />
          <span className="text-[10px] font-bold mt-0.5 tracking-tight">Discover</span>
        </button>

        {/* 2. CONNECT */}
        <button
          onClick={() => onSelectTab('connect')}
          className={`relative flex flex-col items-center justify-center flex-1 py-1.5 px-1 rounded-full transition-all duration-200 cursor-pointer active:scale-95 group ${
            activeTab === 'connect' 
              ? 'bg-white/15 text-white shadow-[0_0_12px_rgba(255,255,255,0.12)] border border-white/20' 
              : 'text-zinc-400 hover:text-white'
          }`}
          title="Connect with Communities & Events"
        >
          <div className="relative">
            <Users className={`w-5 h-5 transition-transform ${activeTab === 'connect' ? 'scale-110 text-white' : 'text-zinc-400'}`} />
            <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#10B981]" />
          </div>
          <span className="text-[10px] font-bold mt-0.5 tracking-tight">Connect</span>
        </button>

        {/* 3. CREATE (Center Prominent Action Button) */}
        <div className="flex-1 flex justify-center px-1">
          <button
            onClick={onTriggerCreate}
            className="w-11 h-11 rounded-full bg-gradient-to-tr from-[#1C1F2B] via-[#2A2E3D] to-[#1C1F2B] border border-white/30 shadow-[0_4px_16px_rgba(0,0,0,0.6),inset_0_1px_1.5px_rgba(255,255,255,0.4)] flex items-center justify-center text-white cursor-pointer active:scale-90 hover:scale-105 transition-all group"
            title="Create Identity, Timeline, Story or Event"
          >
            <Plus className="w-5 h-5 text-white group-hover:rotate-90 transition-transform duration-300" strokeWidth={2.5} />
          </button>
        </div>

        {/* 4. INBOX */}
        <button
          onClick={() => onSelectTab('inbox')}
          className={`relative flex flex-col items-center justify-center flex-1 py-1.5 px-1 rounded-full transition-all duration-200 cursor-pointer active:scale-95 group ${
            activeTab === 'inbox' 
              ? 'bg-white/15 text-white shadow-[0_0_12px_rgba(255,255,255,0.12)] border border-white/20' 
              : 'text-zinc-400 hover:text-white'
          }`}
          title="Messages, Audio Notes & Rooms"
        >
          <div className="relative">
            <MessageCircle className={`w-5 h-5 transition-transform ${activeTab === 'inbox' ? 'scale-110 text-white' : 'text-zinc-400'}`} />
            {unreadMessagesCount > 0 && (
              <span className="absolute -top-1.5 -right-2 px-1.5 py-0.2 rounded-full bg-white text-[#090A0E] text-[9px] font-black shadow-[0_0_8px_rgba(255,255,255,0.8)]">
                {unreadMessagesCount}
              </span>
            )}
          </div>
          <span className="text-[10px] font-bold mt-0.5 tracking-tight">Inbox</span>
        </button>

        {/* 5. PROFILE */}
        <button
          onClick={() => onSelectTab('profile')}
          className={`relative flex flex-col items-center justify-center flex-1 py-1.5 px-1 rounded-full transition-all duration-200 cursor-pointer active:scale-95 group ${
            activeTab === 'profile' 
              ? 'bg-white/15 text-white shadow-[0_0_12px_rgba(255,255,255,0.12)] border border-white/20' 
              : 'text-zinc-400 hover:text-white'
          }`}
          title="Multiple Identities & Life Settings"
        >
          <div className="relative">
            {userAvatar ? (
              <div className={`w-5 h-5 rounded-full overflow-hidden border transition-all ${
                activeTab === 'profile' 
                  ? 'border-white ring-2 ring-white/30 scale-110' 
                  : 'border-white/30'
              }`}>
                <img src={userAvatar} alt="Profile" className="w-full h-full object-cover" />
              </div>
            ) : (
              <User className={`w-5 h-5 transition-transform ${activeTab === 'profile' ? 'scale-110 text-white' : 'text-zinc-400'}`} />
            )}
          </div>
          <span className="text-[10px] font-bold mt-0.5 tracking-tight">Profile</span>
        </button>

      </div>
    </nav>
  );
};
