import React from 'react';

export interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'primary' | 'subtle' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
}

/**
 * Klyven × Soulverse Titanium Glass Button
 * Translucent frosted obsidian glass with specular top-edge rim,
 * kinetic spring recoil, and AAA contrast.
 */
export const GlassButton: React.FC<GlassButtonProps> = ({
  children,
  variant = 'default',
  size = 'md',
  icon,
  iconPosition = 'left',
  loading = false,
  className = '',
  disabled,
  ...props
}) => {
  const sizeStyles = {
    sm: 'py-1.5 px-3 text-xs rounded-xl gap-1.5 min-h-[36px]',
    md: 'py-2.5 px-4 text-sm rounded-2xl gap-2 min-h-[44px]',
    lg: 'py-3.5 px-6 text-base rounded-2xl gap-2.5 min-h-[50px]',
  }[size];

  const variantStyles = {
    default: 'glass-btn text-zinc-100 hover:text-white hover:border-white/30',
    primary: 'glass-btn-primary text-[#090A0E] hover:bg-zinc-200',
    subtle: 'glass-panel-subtle text-zinc-400 hover:text-zinc-100 hover:bg-white/10 hover:border-white/20',
    danger: 'bg-red-500/15 hover:bg-red-500/25 text-red-300 border border-red-500/30 shadow-lg shadow-red-950/40',
  }[variant];

  return (
    <button
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center font-bold transition-all cursor-pointer select-none active:scale-[0.96] disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed ${sizeStyles} ${variantStyles} ${className}`}
      {...props}
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0" />
      ) : (
        icon && iconPosition === 'left' && <span className="shrink-0">{icon}</span>
      )}
      {children && <span>{children}</span>}
      {!loading && icon && iconPosition === 'right' && <span className="shrink-0">{icon}</span>}
    </button>
  );
};
