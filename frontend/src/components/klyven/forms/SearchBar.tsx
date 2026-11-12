import React from 'react';
import { Search, X } from 'lucide-react';

export interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onClear?: () => void;
  placeholder?: string;
  className?: string;
}

/**
 * Universal Glass Search Bar (Klyven × Soulverse)
 * Features:
 * - Lucide Search icon slot
 * - Clear button trigger with micro-hover state
 * - Specular silver focus highlight
 * - Full 44px mobile touch ergonomics
 */
export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  onClear,
  placeholder = 'Search people, worlds, memories, or topics...',
  className = '',
}) => {
  const handleClear = () => {
    onChange('');
    onClear?.();
  };

  return (
    <div className={`relative flex items-center w-full ${className}`}>
      <Search className="absolute left-3.5 w-4 h-4 text-zinc-400 pointer-events-none" />

      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-9 py-2.5 rounded-2xl text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 glass-input outline-none transition-all duration-200 min-h-[44px] focus:border-white/40 focus:shadow-[0_0_16px_rgba(255,255,255,0.15)]"
      />

      {value && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-3 p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          title="Clear search"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};
