import React from 'react';
import { 
  Home, 
  Compass, 
  Calendar, 
  Radio, 
  Users, 
  Share2, 
  TrendingUp, 
  User, 
  Globe, 
  ShieldCheck, 
  Link2, 
  Lock, 
  ShieldAlert,
  Sparkles,
  HeartHandshake
} from 'lucide-react';
import type { ExperienceTab } from '../types';

interface AppSidebarProps {
  activeTab: ExperienceTab;
  onSelectTab: (tab: ExperienceTab) => void;
  onOpenCrisisModal: () => void;
}

export const AppSidebar: React.FC<AppSidebarProps> = ({
  activeTab,
  onSelectTab,
  onOpenCrisisModal
}) => {
  const NAV_ITEMS = [
    {
      group: 'Core Sanctuary',
      items: [
        { id: 'home' as ExperienceTab, label: 'Home Dashboard', icon: Home, badge: '' },
        { id: 'discover' as ExperienceTab, label: 'Discover Humans', icon: Compass, badge: 'HCM' },
        { id: 'messages_rooms' as ExperienceTab, label: 'Messages & Rooms', icon: Radio, badge: 'Live' },
        { id: 'events' as ExperienceTab, label: 'Events & Parties', icon: Calendar, badge: '' },
        { id: 'communities' as ExperienceTab, label: 'Social Circles', icon: Users, badge: '5-10' }
      ]
    },
    {
      group: 'Growth & Identity',
      items: [
        { id: 'my_world' as ExperienceTab, label: 'My World Profile', icon: User, badge: '8 Ch' },
        { id: 'social_growth' as ExperienceTab, label: 'Social Growth Ladder', icon: TrendingUp, badge: '30D' },
        { id: 'self_discovery' as ExperienceTab, label: 'Self Discovery & Quiz', icon: Sparkles, badge: '' },
        { id: 'share_engine' as ExperienceTab, label: 'Identity Card Engine', icon: Share2, badge: 'Viral' }
      ]
    },
    {
      group: 'Trust & Beyond',
      items: [
        { id: 'friends_real' as ExperienceTab, label: 'Real Identity & Safety', icon: ShieldCheck, badge: 'Meet' },
        { id: 'friends_connect' as ExperienceTab, label: 'Beyond FRIENDS', icon: Globe, badge: 'External' },
        { id: 'universal_id' as ExperienceTab, label: 'Universal Directory', icon: Link2, badge: '50+' },
        { id: 'privacy_centre' as ExperienceTab, label: 'Privacy & Control', icon: Lock, badge: 'PDPA' },
        { id: 'admin' as ExperienceTab, label: 'Admin & Safety Triage', icon: ShieldAlert, badge: 'Ops' }
      ]
    }
  ];

  return (
    <aside className="w-64 bg-[#111111] border-r border-[#302B22] flex flex-col justify-between h-screen sticky top-0 shrink-0 select-none">
      {/* Brand & Logo */}
      <div className="p-5 border-b border-[#302B22]">
        <div 
          onClick={() => onSelectTab('home')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#D6AD60] to-[#F1D99F] flex items-center justify-center text-[#090909] font-black text-xl shadow-md shadow-[#D6AD60]/20 group-hover:scale-105 transition-transform">
            F
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-base tracking-widest text-[#F5F0E6] group-hover:text-[#F1D99F] transition-colors">
                FRIENDS
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded bg-[#211E18] text-[#D6AD60] border border-[#302B22]">
                PRO
              </span>
            </div>
            <p className="text-[10px] text-[#A7A094] tracking-tight">Find your people & place</p>
          </div>
        </div>
      </div>

      {/* Navigation Groups */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {NAV_ITEMS.map((section, idx) => (
          <div key={idx} className="space-y-1">
            <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-[#D6AD60]/70">
              {section.group}
            </div>

            <div className="space-y-0.5 pt-1">
              {section.items.map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => onSelectTab(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#171717] text-[#F1D99F] border border-[#D6AD60] gold-glow-sm'
                        : 'text-[#A7A094] hover:text-[#F5F0E6] hover:bg-[#171717]/60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#D6AD60]' : 'text-[#A7A094]'}`} />
                      <span className="truncate">{item.label}</span>
                    </div>

                    {item.badge && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold uppercase shrink-0 ${
                        isActive 
                          ? 'bg-[#D6AD60] text-[#090909]' 
                          : 'bg-[#211E18] text-[#A7A094] border border-[#302B22]'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Emergency Triage & User Identity Card */}
      <div className="p-4 border-t border-[#302B22] space-y-3 bg-[#090909]">
        {/* 24/7 Crisis Hotline Button */}
        <button
          onClick={onOpenCrisisModal}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/50 border border-rose-500/40 text-rose-300 text-xs font-bold transition-colors cursor-pointer"
        >
          <HeartHandshake className="w-4 h-4 text-rose-400" />
          <span>24/7 Crisis Support (1926)</span>
        </button>

        {/* Current Active User Preview */}
        <div 
          onClick={() => onSelectTab('my_world')}
          className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-[#171717] transition-colors cursor-pointer"
        >
          <img 
            src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120" 
            alt="Kavindu" 
            className="w-8 h-8 rounded-lg object-cover border border-[#D6AD60]"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1">
              <span className="text-xs font-bold text-[#F5F0E6] truncate">Kavindu S.</span>
              <ShieldCheck className="w-3 h-3 text-[#D6AD60]" />
            </div>
            <span className="text-[10px] text-[#A7A094] block truncate">@kavindu • Verified</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
