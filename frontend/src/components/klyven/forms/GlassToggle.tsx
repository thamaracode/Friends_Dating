import React from 'react';

export interface GlassToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  className?: string;
}

/**
 * High-Tactile Switch Toggle (Klyven × Soulverse)
 * Smooth spring translation, obsidian track, and titanium silver thumb indicator.
 */
export const GlassToggle: React.FC<GlassToggleProps> = ({
  checked,
  onChange,
  label,
  description,
  disabled = false,
  className = '',
}) => {
  return (
    <div
      onClick={() => !disabled && onChange(!checked)}
      className={`flex items-center justify-between cursor-pointer select-none p-3.5 rounded-2xl glass-panel-subtle hover:bg-white/[0.04] transition-colors min-h-[48px] ${
        disabled ? 'opacity-50 pointer-events-none' : ''
      } ${className}`}
    >
      {(label || description) && (
        <div className="space-y-0.5 pr-4">
          {label && <div className="text-xs font-bold text-zinc-100">{label}</div>}
          {description && <div className="text-[11px] text-zinc-400">{description}</div>}
        </div>
      )}

      <div
        className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 shrink-0 ${
          checked ? 'bg-white' : 'bg-[#1C202B] border border-white/15'
        }`}
      >
        <div
          className={`w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
            checked ? 'bg-[#090A0E] translate-x-5' : 'bg-zinc-400 translate-x-0'
          }`}
        />
      </div>
    </div>
  );
};
