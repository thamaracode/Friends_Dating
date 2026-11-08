import React from 'react';
import { 
  Home, 
  Compass, 
  Calendar, 
  Radio, 
  Users, 
  Lock, 
  User, 
  Menu 
} from 'lucide-react';
import type { ExperienceTab } from '../types';

interface MobileBottomNavProps {
  activeTab: ExperienceTab;
  onSelectTab: (tab: ExperienceTab) => void;
  onOpenMobileMenu: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onSelectTab,
  onOpenMobileMenu
}) => {
  const PRIMARY_MOBILE_ITEMS = [
    { id: 'home' as ExperienceTab, label: 'Home', icon: Home },
    { id: 'discover' as ExperienceTab, label: 'Discover', icon: Compass },
    { id: 'messages_rooms' as ExperienceTab, label: 'Rooms', icon: Radio },
    { id: 'events' as ExperienceTab, label: 'Events', icon: Calendar },
    { id: 'my_world' as ExperienceTab, label: 'Profile', icon: User }
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#111111]/95 backdrop-blur-md border-t border-[#302B22] px-3 py-2 z-50 flex items-center justify-around">
      {PRIMARY_MOBILE_ITEMS.map(item => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;

        return (
          <button
            key={item.id}
            onClick={() => onSelectTab(item.id)}
            className={`flex flex-col items-center justify-center p-1.5 rounded-xl cursor-pointer transition-colors ${
              isActive ? 'text-[#F1D99F]' : 'text-[#A7A094] hover:text-[#F5F0E6]'
            }`}
          >
            <Icon className={`w-5 h-5 ${isActive ? 'text-[#D6AD60]' : 'text-[#A7A094]'}`} />
            <span className="text-[10px] font-semibold mt-1">{item.label}</span>
          </button>
        );
      })}

      {/* More / Menu Drawer trigger */}
      <button
        onClick={onOpenMobileMenu}
        className="flex flex-col items-center justify-center p-1.5 rounded-xl text-[#A7A094] hover:text-[#F5F0E6] cursor-pointer"
      >
        <Menu className="w-5 h-5 text-[#D6AD60]" />
        <span className="text-[10px] font-semibold mt-1">More</span>
      </button>
    </nav>
  );
};
