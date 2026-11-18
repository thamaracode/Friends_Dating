import React from 'react';
import { 
  Compass, 
  Heart, 
  MessageSquare, 
  Globe2, 
  User 
} from 'lucide-react';
import type { MobilePrimaryTab } from '../../types';

interface SoulverseMobileNavbarProps {
  activeTab: MobilePrimaryTab;
  onSelectTab: (tab: MobilePrimaryTab) => void;
  unreadMessagesCount?: number;
  likesCount?: number;
  userAvatar?: string;
  isHidden?: boolean;
}

/**
 * SOULVERSE NEO-NATIVE BOTTOM NAVIGATION
 * 5 Primary Destinations: Discover, Likes, Messages, Explore, Profile.
 * Neo-native minimalism, consistent touch targets, clear active/inactive states.
 */
export const SoulverseMobileNavbar: React.FC<SoulverseMobileNavbarProps> = ({
  activeTab,
  onSelectTab,
  unreadMessagesCount = 3,
  likesCount = 5,
  userAvatar,
  isHidden = false
}) => {
  if (isHidden) return null;

  const navItems = [
    {
      id: 'discover' as MobilePrimaryTab,
      label: 'Discover',
      icon: Compass,
      badge: null
    },
    {
      id: 'likes' as MobilePrimaryTab,
      label: 'Likes',
      icon: Heart,
      badge: likesCount > 0 ? likesCount : null
    },
    {
      id: 'messages' as MobilePrimaryTab,
      label: 'Messages',
      icon: MessageSquare,
      badge: unreadMessagesCount > 0 ? unreadMessagesCount : null
    },
    {
      id: 'explore' as MobilePrimaryTab,
      label: 'Explore',
      icon: Globe2,
      badge: null
    },
    {
      id: 'profile' as MobilePrimaryTab,
      label: 'Profile',
      icon: User,
      badge: null
    }
  ];

  return (
    <nav 
      className="fixed bottom-0 inset-x-0 z-40 bg-[#0C0D13]/95 backdrop-blur-xl border-t border-white/[0.08] select-none transition-all duration-200"
      aria-label="Primary Navigation"
    >
      <div className="max-w-md mx-auto px-2 flex items-center justify-around h-16 pb-[env(safe-area-inset-bottom,0px)]">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const IconComponent = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`relative flex flex-col items-center justify-center flex-1 h-full py-1.5 transition-colors cursor-pointer group active:scale-95 ${
                isActive 
                  ? 'text-white font-semibold' 
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
              title={item.label}
              aria-current={isActive ? 'page' : undefined}
            >
              {/* Active Indicator Top Accent Bar */}
              {isActive && (
                <span className="absolute top-0 w-8 h-[2px] bg-gradient-to-r from-rose-500 to-[#D94668] rounded-full" />
              )}

              <div className="relative flex items-center justify-center mb-0.5">
                {item.id === 'profile' && userAvatar ? (
                  <div className={`w-6 h-6 rounded-full overflow-hidden border transition-all ${
                    isActive ? 'border-rose-400 ring-2 ring-rose-500/20' : 'border-zinc-700'
                  }`}>
                    <img src={userAvatar} alt="Profile" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <IconComponent 
                    className={`w-5 h-5 transition-transform duration-150 ${
                      isActive ? 'scale-105 text-[#F8F8F6]' : 'text-zinc-400 group-hover:text-zinc-200'
                    }`} 
                  />
                )}

                {/* Badge indicator */}
                {item.badge && (
                  <span className="absolute -top-1 -right-2.5 min-w-[16px] h-4 px-1 rounded-full bg-[#D94668] text-white text-[10px] font-bold flex items-center justify-center leading-none">
                    {item.badge}
                  </span>
                )}
              </div>

              <span className={`text-[11px] tracking-tight transition-colors ${
                isActive ? 'text-[#F8F8F6] font-semibold' : 'text-zinc-400'
              }`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
