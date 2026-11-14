import React, { useRef } from 'react';
import { Search as SearchIcon, X, Loader2 } from 'lucide-react';

export interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  value: string;
  onValueChange: (val: string) => void;
  onClear?: () => void;
  isLoading?: boolean;
  shortcutHint?: string;
  className?: string;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onValueChange,
  onClear,
  isLoading = false,
  shortcutHint = '/',
  placeholder = 'Search...',
  className = '',
  ...props
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleClear = () => {
    onValueChange('');
    onClear?.();
    inputRef.current?.focus();
  };

  return (
    <div className={`relative flex items-center w-full ${className}`}>
      {/* Search Icon / Spinner */}
      <div className="absolute left-3.5 pointer-events-none text-zinc-400">
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
        ) : (
          <SearchIcon className="w-4 h-4" />
        )}
      </div>

      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-11 pl-10 pr-16 rounded-2xl bg-[#12141B]/90 border border-white/15 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all shadow-inner"
        {...props}
      />

      {/* Clear Button or Keyboard Shortcut */}
      <div className="absolute right-3 flex items-center gap-1.5">
        {value ? (
          <button
            type="button"
            onClick={handleClear}
            className="p-1 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
            title="Clear search"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        ) : shortcutHint ? (
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono font-bold text-zinc-400 bg-white/[0.06] border border-white/10 rounded-md">
            {shortcutHint}
          </kbd>
        ) : null}
      </div>
    </div>
  );
};
