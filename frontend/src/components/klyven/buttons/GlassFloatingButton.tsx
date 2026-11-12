import React from 'react';

export interface GlassFloatingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  badgeCount?: number;
  size?: 'sm' | 'md' | 'lg';
  active?: boolean;
}

/**
 * Klyven × Soulverse Floating Action Circle Button (FAB)
 * Circular glass surface with specular highlight, ambient blur, and status badge support.
 */
export const GlassFloatingButton: React.FC<GlassFloatingButtonProps> = ({
  icon,
  badgeCount,
  size = 'md',
  active = false,
  className = '',
  ...props
}) => {
  const sizeStyles = {
    sm: 'w-10 h-10 min-w-[40px]',
    md: 'w-12 h-12 min-w-[44px]',
    lg: 'w-14 h-14 min-w-[48px]',
  }[size];

  return (
    <button
      className={`relative inline-flex items-center justify-center rounded-full glass-floating-btn cursor-pointer active:scale-[0.92] select-none ${sizeStyles} ${
        active ? 'border-white/50 text-white bg-white/15' : 'text-zinc-200 hover:text-white'
      } ${className}`}
      {...props}
    >
      <div className="shrink-0">{icon}</div>

      {badgeCount !== undefined && badgeCount > 0 && (
        <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-white text-[#090A0E] text-[10px] font-black font-mono flex items-center justify-center shadow-md">
          {badgeCount > 99 ? '99+' : badgeCount}
        </span>
      )}
    </button>
  );
};
