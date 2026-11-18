import React, { useState } from 'react';
import { Compass, Filter } from 'lucide-react';
import type { UserProfile } from '../../types';
import { TinderSwipeDeck } from '../discovery/TinderSwipeDeck';

interface SoulverseMobileDiscoverExperienceProps {
  onOpenProfile: (profile: UserProfile) => void;
  onInitiateChat: (profile: UserProfile) => void;
  onOpenDailyHub?: () => void;
  onOpenUnspoken?: () => void;
}

/**
 * SOULVERSE REDESIGNED DISCOVER EXPERIENCE
 * High-quality full-height photography, elegant information overlay,
 * minimal action controls, natural scrolling into full profile details.
 */
export const SoulverseMobileDiscoverExperience: React.FC<SoulverseMobileDiscoverExperienceProps> = ({
  onOpenProfile,
  onInitiateChat
}) => {
  // Discovery Intent Filter: 'all' | 'dating' | 'friendship' | 'creative'
  const [selectedIntent, setSelectedIntent] = useState<'all' | 'dating' | 'friendship' | 'creative'>('all');

  const intentFilters = [
    { id: 'all' as const, label: 'All Connections' },
    { id: 'dating' as const, label: 'Intentional Dating' },
    { id: 'friendship' as const, label: 'Deep Friendship' },
    { id: 'creative' as const, label: 'Creative Kindred' }
  ];

  return (
    <div className="w-full max-w-5xl mx-auto px-2 sm:px-4 py-2 sm:py-4 space-y-3 sm:space-y-4 animate-fadeIn pb-24 font-body select-none">
      
      {/* 1. MINIMAL EDITORIAL DISCOVER HEADER */}
      <div className="flex items-center justify-between px-2 pt-1">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-white tracking-tight">
            Discover
          </h1>
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
        </div>

        {/* Intent Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          {intentFilters.map((tab) => {
            const isSelected = selectedIntent === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedIntent(tab.id)}
                className={`h-8 px-3 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                  isSelected
                    ? 'bg-white text-[#0A0B0F] shadow-sm font-bold'
                    : 'bg-white/[0.05] text-zinc-400 hover:text-white border border-white/[0.08]'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. FLAGSHIP SOPHISTICATED SWIPE DECK */}
      <div className="w-full">
        <TinderSwipeDeck
          category={selectedIntent}
          onOpenProfileDetail={onOpenProfile}
          onInitiateChat={onInitiateChat}
        />
      </div>

    </div>
  );
};
