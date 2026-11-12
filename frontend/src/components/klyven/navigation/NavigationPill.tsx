import React from 'react';

export interface NavigationPillProps {
  label: string;
  active?: boolean;
  onClick?: () => void;
  count?: number;
  icon?: React.ReactNode;
  className?: string;
}

/**
 * Filter / Category Navigation Pill (Klyven × Soulverse)
 * Horizontal scrollable filter chip with tactile active silver specular glow.
 */
export const NavigationPill: React.FC<NavigationPillProps> = ({
  label,
  active = false,
  onClick,
  count,
  icon,
  className = '',
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center space-x-1.5 py-2 px-3.5 rounded-full text-xs transition-all duration-200 cursor-pointer select-none active:scale-[0.96] shrink-0 min-h-[38px] ${
        active
          ? 'bg-white text-[#090A0E] font-bold shadow-[0_2px_12px_rgba(255,255,255,0.25)] border border-white'
          : 'bg-[#181B24]/70 text-zinc-300 hover:text-white border border-white/10 hover:border-white/20'
      } ${className}`}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{label}</span>
      {count !== undefined && (
        <span
          className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full tabular-nums ${
            active ? 'bg-[#090A0E]/15 text-[#090A0E]' : 'bg-white/10 text-zinc-400'
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );
};
