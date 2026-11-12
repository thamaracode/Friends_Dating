import React from 'react';

export interface PulseBadgeProps {
  label: string;
  variant?: 'live' | 'silver' | 'warning' | 'error';
  className?: string;
}

/**
 * Live Pulsing Status Badge (Klyven × Soulverse)
 */
export const PulseBadge: React.FC<PulseBadgeProps> = ({
  label,
  variant = 'live',
  className = '',
}) => {
  const config = {
    live: { dot: 'bg-emerald-400', badge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
    silver: { dot: 'bg-white', badge: 'bg-white/10 text-zinc-100 border-white/20' },
    warning: { dot: 'bg-amber-400', badge: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
    error: { dot: 'bg-rose-400', badge: 'bg-rose-500/15 text-rose-400 border-rose-500/30' },
  }[variant];

  return (
    <span
      className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold border ${config.badge} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot} animate-pulse shrink-0`} />
      <span>{label}</span>
    </span>
  );
};
