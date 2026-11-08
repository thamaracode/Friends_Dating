import React from 'react';
import { Clock, Moon, Sun, Sunset, Coffee, Zap } from 'lucide-react';
import type { ActiveTimeWindow } from '../types';

interface ActiveTimeBadgeProps {
  window?: ActiveTimeWindow;
  variant?: 'card' | 'compact' | 'profile' | 'detail';
}

export const ActiveTimeBadge: React.FC<ActiveTimeBadgeProps> = ({ 
  window, 
  variant = 'card' 
}) => {
  if (!window) return null;

  const getSlotIcon = (slot: ActiveTimeWindow['slotName']) => {
    switch (slot) {
      case 'morning':
        return <Sun className="w-3.5 h-3.5 text-amber-400" />;
      case 'afternoon':
        return <Coffee className="w-3.5 h-3.5 text-orange-400" />;
      case 'evening':
        return <Sunset className="w-3.5 h-3.5 text-rose-400" />;
      case 'late_night':
        return <Moon className="w-3.5 h-3.5 text-[#D6AD60]" />;
      default:
        return <Clock className="w-3.5 h-3.5 text-[#D6AD60]" />;
    }
  };

  // Compact Pill (Used inside grids or cards)
  if (variant === 'compact') {
    return (
      <div 
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#111111] border border-[#302B22] text-[11px]"
        title={`Typical active hours: ${window.periodLabel} (${window.typicalDays})`}
      >
        {getSlotIcon(window.slotName)}
        <span className="text-[#A7A094]">Usually active:</span>
        <span className="font-semibold text-[#F1D99F]">{window.periodLabel}</span>
        {window.isCurrentlyInActiveWindow && (
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-0.5" title="Currently in their active period" />
        )}
      </div>
    );
  }

  // Card Variant (Embedded in Discover & Home cards)
  if (variant === 'card') {
    return (
      <div className="p-2.5 rounded-xl bg-[#111111]/90 border border-[#211E18] space-y-1">
        <div className="flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-1.5 font-semibold text-[#F1D99F]">
            {getSlotIcon(window.slotName)}
            <span>Most Active to Chat:</span>
          </div>
          {window.isCurrentlyInActiveWindow ? (
            <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              Peak Hour Now
            </span>
          ) : (
            <span className="text-[10px] text-[#A7A094] flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {window.lastSeenDescription}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-[#F5F0E6] font-medium">{window.periodLabel}</span>
          <span className="text-[10px] text-[#D6AD60] font-bold">~{window.onlineProbabilityPercent}% response</span>
        </div>
        <div className="text-[10px] text-[#A7A094] truncate">
          Rhythm: {window.typicalDays}
        </div>
      </div>
    );
  }

  // Profile Detail Variant (My World / Full Profile View)
  return (
    <div className="p-4 rounded-2xl bg-gradient-to-r from-[#171717] via-[#211E18] to-[#171717] border border-[#302B22] space-y-2.5 gold-glow-subtle">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#302B22]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#111111] border border-[#302B22] flex items-center justify-center">
            {getSlotIcon(window.slotName)}
          </div>
          <div>
            <div className="text-xs font-bold text-[#F5F0E6] flex items-center gap-1.5">
              <span>Public Active Chat Schedule</span>
              <span className="text-[10px] font-normal text-[#A7A094]">(Aggregated Usage)</span>
            </div>
            <div className="text-[11px] text-[#A7A094]">
              {window.timezone}
            </div>
          </div>
        </div>

        {window.isCurrentlyInActiveWindow ? (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-950/50 border border-emerald-500/40 text-emerald-300 text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Currently Online / Peak Window</span>
          </div>
        ) : (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#111111] border border-[#302B22] text-[#A7A094] text-xs">
            <Clock className="w-3.5 h-3.5 text-[#D6AD60]" />
            <span>{window.lastSeenDescription}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
        <div className="p-2.5 rounded-xl bg-[#111111] border border-[#211E18]">
          <span className="text-[10px] font-bold text-[#A7A094] uppercase tracking-wider block">Peak Active Time</span>
          <span className="text-xs font-bold text-[#F1D99F] mt-0.5 block">{window.periodLabel}</span>
        </div>

        <div className="p-2.5 rounded-xl bg-[#111111] border border-[#211E18]">
          <span className="text-[10px] font-bold text-[#A7A094] uppercase tracking-wider block">Typical Days</span>
          <span className="text-xs font-bold text-[#F5F0E6] mt-0.5 block truncate">{window.typicalDays}</span>
        </div>

        <div className="p-2.5 rounded-xl bg-[#111111] border border-[#211E18]">
          <span className="text-[10px] font-bold text-[#A7A094] uppercase tracking-wider block">Chat Response Odds</span>
          <span className="text-xs font-bold text-[#D6AD60] mt-0.5 block">{window.onlineProbabilityPercent}% likely to reply fast</span>
        </div>
      </div>

      <p className="text-[11px] text-[#A7A094] leading-relaxed italic">
        💡 FRIENDS computes this aggregated time window automatically from app activity so you know when they are most open to genuine conversation without playing guessing games.
      </p>
    </div>
  );
};
