import React from 'react';

export interface GlassPrimaryButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  loading?: boolean;
}

/**
 * Klyven × Soulverse Titanium Bullion Button (High-Contrast Hero CTA)
 * Specular highlight reflection, pure platinum contrast, and kinetic micro-press physics.
 */
export const GlassPrimaryButton: React.FC<GlassPrimaryButtonProps> = ({
  children,
  size = 'md',
  icon,
  loading = false,
  className = '',
  disabled,
  ...props
}) => {
  const sizeStyles = {
    sm: 'py-2 px-3.5 text-xs rounded-xl gap-1.5 min-h-[36px]',
    md: 'py-3 px-5 text-sm rounded-2xl gap-2 min-h-[44px]',
    lg: 'py-4 px-7 text-base rounded-2xl gap-2.5 min-h-[50px]',
  }[size];

  return (
    <button
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center font-bold glass-btn-primary text-[#090A0E] cursor-pointer select-none transition-all duration-200 active:scale-[0.96] disabled:opacity-50 disabled:pointer-events-none ${sizeStyles} ${className}`}
      {...props}
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-[#090A0E] border-t-transparent rounded-full animate-spin shrink-0" />
      ) : (
        icon && <span className="shrink-0">{icon}</span>
      )}
      {children && <span>{children}</span>}
    </button>
  );
};
