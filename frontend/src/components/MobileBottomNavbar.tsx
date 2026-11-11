import React from 'react';
import { 
  Flame, 
  Compass, 
  Heart, 
  MessageCircle, 
  User, 
  Sparkles 
} from 'lucide-react';
import type { MainNavTab } from '../types';

interface MobileBottomNavbarProps {
  currentTab: MainNavTab;
  onSelectTab: (tab: MainNavTab) => void;
  likesCount?: number;
  unreadMessagesCount?: number;
}

export const MobileBottomNavbar: React.FC<MobileBottomNavbarProps> = ({
  currentTab,
  onSelectTab,
  likesCount = 5,
  unreadMessagesCount = 2
}) => {
  const tabs = [
    {
      id: 'home' as MainNavTab,
      label: 'Match',
      icon: Flame,
      badge: null
    },
    {
      id: 'discover' as MainNavTab,
      label: 'Discover',
      icon: Compass,
      badge: null
    },
    {
      id: 'likes' as MainNavTab,
      label: 'Likes',
      icon: Heart,
      badge: likesCount > 0 ? likesCount : null
    },
    {
      id: 'messages' as MainNavTab,
      label: 'Chats',
      icon: MessageCircle,
      badge: unreadMessagesCount > 0 ? unreadMessagesCount : null
    },
    {
      id: 'profile' as MainNavTab,
      label: 'Profile',
      icon: User,
      badge: null
    }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 pointer-events-auto">
      {/* Ambient pink top glow blur */}
      <div className="absolute -top-6 left-0 right-0 h-6 bg-gradient-to-t from-[#100B12]/90 to-transparent pointer-events-none" />
      
      {/* Main glass bar container */}
      <div className="mx-auto max-w-md px-4 pb-safe pt-2">
        <div className="relative flex items-center justify-around h-16 rounded-3xl glass-panel-elevated shadow-2xl px-2 border border-[#FF78A8]/20 pink-ambient-glow">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className="relative flex flex-col items-center justify-center flex-1 h-full py-1 text-center cursor-pointer transition-transform active:scale-95 group"
                aria-label={tab.label}
              >
                {/* Active ambient indicator glow backdrop */}
                {isActive && (
                  <div className="absolute inset-x-2 inset-y-1.5 rounded-2xl bg-[#FF4F87]/15 border border-[#FF4F87]/30 pink-glow-sm pointer-events-none transition-all duration-300" />
                )}

                <div className="relative flex items-center justify-center">
                  <Icon 
                    className={`w-5 h-5 transition-colors duration-200 ${
                      isActive 
                        ? 'text-[#FF4F87] drop-shadow-[0_0_8px_rgba(255,79,135,0.8)]' 
                        : 'text-[#B9A8B3] group-hover:text-[#FFF1F3]'
                    }`} 
                    strokeWidth={isActive ? 2.5 : 2}
                  />

                  {/* Notification badge */}
                  {tab.badge !== null && (
                    <span className="absolute -top-1.5 -right-2 min-w-4 h-4 px-1 rounded-full bg-[#FF4F87] text-[#FFF1F3] text-[9px] font-black flex items-center justify-center shadow-[0_0_8px_rgba(255,79,135,0.7)] animate-pulse">
                      {tab.badge}
                    </span>
                  )}
                </div>

                <span 
                  className={`text-[10px] font-semibold mt-1 tracking-tight transition-colors duration-200 ${
                    isActive 
                      ? 'text-[#FFB4CE] font-bold' 
                      : 'text-[#7A6975] group-hover:text-[#B9A8B3]'
                  }`}
                >
                  {tab.label}
                </span>

                {/* Subtly animated dot below active item */}
                {isActive && (
                  <div className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-[#FF4F87] shadow-[0_0_6px_#FF4F87]" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
