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
      className="fixed bottom-[calc(0.75rem+env(safe-area-inset-bottom,0px))] sm:bottom-6 inset-x-0 mx-auto max-w-[440px] px-3 z-40 pointer-events-none transition-all duration-300 select-none"
      aria-label="Mobile Navigation"
    >
      <div className="pointer-events-auto rounded-[28px] p-2 border border-white/[0.14] shadow-[0_20px_50px_rgba(0,0,0,0.85),inset_0_1px_1px_rgba(255,255,255,0.18)] flex items-center justify-between backdrop-blur-3xl bg-[#0E1017]/92">
        
        {/* 1. DISCOVER */}
        <button
          onClick={() => onSelectTab('discover')}
          className={`relative flex flex-col items-center justify-center flex-1 min-h-[50px] py-1 px-1 rounded-2xl transition-all duration-200 cursor-pointer active:scale-95 group ${
            activeTab === 'discover' 
              ? 'bg-white/15 text-white shadow-[0_0_16px_rgba(255,255,255,0.15)] border border-white/20' 
              : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
          }`}
          title="Discover Humans & Chemistry"
        >
          <Compass className={`w-5 h-5 transition-transform ${activeTab === 'discover' ? 'scale-110 text-amber-300' : 'text-zinc-400 group-hover:text-zinc-200'}`} />
          <span className={`text-[11px] font-heading font-semibold mt-1 tracking-tight ${activeTab === 'discover' ? 'text-white font-bold' : 'text-zinc-400'}`}>
            Discover
          </span>
          {activeTab === 'discover' && (
            <span className="w-1 h-1 rounded-full bg-amber-400 shadow-[0_0_6px_#F59E0B] mt-0.5" />
          )}
        </button>

        {/* 2. CONNECT */}
        <button
          onClick={() => onSelectTab('connect')}
          className={`relative flex flex-col items-center justify-center flex-1 min-h-[50px] py-1 px-1 rounded-2xl transition-all duration-200 cursor-pointer active:scale-95 group ${
            activeTab === 'connect' 
              ? 'bg-white/15 text-white shadow-[0_0_16px_rgba(255,255,255,0.15)] border border-white/20' 
              : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
          }`}
          title="Connect with Communities & Events"
        >
          <div className="relative">
            <Users className={`w-5 h-5 transition-transform ${activeTab === 'connect' ? 'scale-110 text-white' : 'text-zinc-400 group-hover:text-zinc-200'}`} />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#10B981]" />
          </div>
          <span className={`text-[11px] font-heading font-semibold mt-1 tracking-tight ${activeTab === 'connect' ? 'text-white font-bold' : 'text-zinc-400'}`}>
            Connect
          </span>
          {activeTab === 'connect' && (
            <span className="w-1 h-1 rounded-full bg-emerald-400 shadow-[0_0_6px_#10B981] mt-0.5" />
          )}
        </button>

        {/* 3. CREATE (Center Prominent Action Button with subtle gold specular accent) */}
        <div className="flex-1 flex justify-center px-1">
          <button
            onClick={onTriggerCreate}
            className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#161822] via-[#252A3B] to-[#161822] border border-amber-400/40 shadow-[0_4px_20px_rgba(246,193,56,0.25),inset_0_1px_1.5px_rgba(255,255,255,0.35)] flex items-center justify-center text-white cursor-pointer active:scale-90 hover:scale-105 transition-all group"
            title="Create Identity, Timeline, Story or Event"
          >
            <Plus className="w-5 h-5 text-amber-300 group-hover:rotate-90 transition-transform duration-300 stroke-[2.5]" />
          </button>
        </div>

        {/* 4. INBOX */}
        <button
          onClick={() => onSelectTab('inbox')}
          className={`relative flex flex-col items-center justify-center flex-1 min-h-[50px] py-1 px-1 rounded-2xl transition-all duration-200 cursor-pointer active:scale-95 group ${
            activeTab === 'inbox' 
              ? 'bg-white/15 text-white shadow-[0_0_16px_rgba(255,255,255,0.15)] border border-white/20' 
              : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
          }`}
          title="Messages, Audio Notes & Rooms"
        >
          <div className="relative">
            <MessageCircle className={`w-5 h-5 transition-transform ${activeTab === 'inbox' ? 'scale-110 text-white' : 'text-zinc-400 group-hover:text-zinc-200'}`} />
            {unreadMessagesCount > 0 && (
              <span className="absolute -top-1.5 -right-2 min-w-[18px] h-[18px] px-1 rounded-full bg-amber-400 text-[#090A0E] text-[10px] font-extrabold flex items-center justify-center shadow-[0_0_10px_rgba(245,158,11,0.8)]">
                {unreadMessagesCount}
              </span>
            )}
          </div>
          <span className={`text-[11px] font-heading font-semibold mt-1 tracking-tight ${activeTab === 'inbox' ? 'text-white font-bold' : 'text-zinc-400'}`}>
            Inbox
          </span>
          {activeTab === 'inbox' && (
            <span className="w-1 h-1 rounded-full bg-amber-400 shadow-[0_0_6px_#F59E0B] mt-0.5" />
          )}
        </button>

        {/* 5. PROFILE */}
        <button
          onClick={() => onSelectTab('profile')}
          className={`relative flex flex-col items-center justify-center flex-1 min-h-[50px] py-1 px-1 rounded-2xl transition-all duration-200 cursor-pointer active:scale-95 group ${
            activeTab === 'profile' 
              ? 'bg-white/15 text-white shadow-[0_0_16px_rgba(255,255,255,0.15)] border border-white/20' 
              : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
          }`}
          title="Multiple Identities & Life Settings"
        >
          <div className="relative">
            {userAvatar ? (
              <div className={`w-6 h-6 rounded-full overflow-hidden border transition-all ${
                activeTab === 'profile' 
                  ? 'border-amber-400 ring-2 ring-amber-400/40 scale-105' 
                  : 'border-white/30'
              }`}>
                <img src={userAvatar} alt="Profile" className="w-full h-full object-cover" />
              </div>
            ) : (
              <User className={`w-5 h-5 transition-transform ${activeTab === 'profile' ? 'scale-110 text-white' : 'text-zinc-400 group-hover:text-zinc-200'}`} />
            )}
          </div>
          <span className={`text-[11px] font-heading font-semibold mt-1 tracking-tight ${activeTab === 'profile' ? 'text-white font-bold' : 'text-zinc-400'}`}>
            Profile
          </span>
          {activeTab === 'profile' && (
            <span className="w-1 h-1 rounded-full bg-amber-400 shadow-[0_0_6px_#F59E0B] mt-0.5" />
          )}
        </button>

      </div>
    </nav>
  );
};
