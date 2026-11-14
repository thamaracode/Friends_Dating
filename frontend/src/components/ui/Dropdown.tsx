import React, { useState, useRef, useEffect } from 'react';

export interface DropdownItemProps {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  destructive?: boolean;
  disabled?: boolean;
  badge?: string;
}

export const DropdownItem: React.FC<DropdownItemProps> = ({
  label,
  icon,
  onClick,
  destructive = false,
  disabled = false,
  badge
}) => {
  return (
    <button
      role="menuitem"
      disabled={disabled}
      onClick={onClick}
      className={`w-full flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-colors text-left cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
        destructive
          ? 'text-rose-400 hover:bg-rose-500/10'
          : 'text-zinc-300 hover:text-white hover:bg-white/[0.08]'
      }`}
    >
      <div className="flex items-center gap-2.5 truncate">
        {icon && <span className="shrink-0">{icon}</span>}
        <span className="truncate">{label}</span>
      </div>

      {badge && (
        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-white/10 text-zinc-400">
          {badge}
        </span>
      )}
    </button>
  );
};

export const DropdownDivider: React.FC = () => (
  <div className="my-1 border-t border-white/[0.08]" />
);

export interface DropdownProps {
  trigger: React.ReactNode;
  align?: 'left' | 'right';
  className?: string;
  children: React.ReactNode;
}

export const Dropdown: React.FC<DropdownProps> = ({
  trigger,
  align = 'right',
  className = '',
  children
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div ref={containerRef} className="relative inline-block text-left">
      <div onClick={() => setIsOpen(!isOpen)}>{trigger}</div>

      {isOpen && (
        <div
          role="menu"
          aria-orientation="vertical"
          className={`absolute ${
            align === 'right' ? 'right-0' : 'left-0'
          } mt-2 w-56 rounded-2xl bg-[#12141B] border border-white/15 p-1.5 shadow-2xl backdrop-blur-2xl z-40 animate-scaleUp ${className}`}
        >
          {children}
        </div>
      )}
    </div>
  );
};
