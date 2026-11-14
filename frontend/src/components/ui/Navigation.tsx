import React from 'react';

export interface NavigationItemProps {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: string | number;
  badgeVariant?: 'default' | 'gold' | 'emerald' | 'amber';
  isActive: boolean;
  onClick: () => void;
  title?: string;
  className?: string;
}

export const NavigationItem: React.FC<NavigationItemProps> = ({
  label,
  icon,
  badge,
  badgeVariant = 'default',
  isActive,
  onClick,
  title,
  className = ''
}) => {
  const badgeColors = {
    default: 'bg-white/10 text-zinc-300 border border-white/10',
    gold: 'bg-amber-400/20 text-amber-300 border border-amber-400/40 shadow-[0_0_8px_rgba(245,158,11,0.3)]',
    emerald: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-[0_0_8px_rgba(16,185,129,0.3)]',
    amber: 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
  };

  return (
    <button
      onClick={onClick}
      title={title || label}
      aria-current={isActive ? 'page' : undefined}
      className={`relative flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-medium transition-all duration-200 cursor-pointer select-none group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/50 active:scale-[0.98] motion-reduce:transition-none ${
        isActive
          ? 'bg-white/10 text-white shadow-sm border border-white/15'
          : 'text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.05] border border-transparent'
      } ${className}`}
    >
      {/* Active Left Indicator Dot (Desktop/Vertical) */}
      {isActive && (
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_8px_#F59E0B] shrink-0" />
      )}

      {/* Icon */}
      {icon && (
        <span className={`shrink-0 transition-transform group-hover:scale-105 ${isActive ? 'text-amber-400' : 'text-zinc-400'}`}>
          {icon}
        </span>
      )}

      {/* Label */}
      <span className="truncate">{label}</span>

      {/* Optional Badge */}
      {badge !== undefined && (
        <span className={`ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${badgeColors[badgeVariant]}`}>
          {badge}
        </span>
      )}
    </button>
  );
};

export interface NavigationProps extends React.HTMLAttributes<HTMLElement> {
  orientation?: 'horizontal' | 'vertical';
  ariaLabel: string;
}

export const Navigation: React.FC<NavigationProps> = ({
  orientation = 'horizontal',
  ariaLabel,
  className = '',
  children,
  ...props
}) => {
  return (
    <nav
      role="navigation"
      aria-label={ariaLabel}
      className={`flex ${
        orientation === 'vertical' 
          ? 'flex-col space-y-1' 
          : 'items-center gap-1.5 overflow-x-auto no-scrollbar py-1'
      } ${className}`}
      {...props}
    >
      {children}
    </nav>
  );
};
