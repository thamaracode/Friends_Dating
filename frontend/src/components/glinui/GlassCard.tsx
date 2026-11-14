import React, { forwardRef } from 'react';

export type GlassCardVariant = 'liquid' | 'frosted' | 'lift' | 'well' | 'plain';

export interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: GlassCardVariant;
  interactive?: boolean;
  refractionTop?: boolean;
  glow?: boolean;
  children?: React.ReactNode;
}

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  (
    {
      variant = 'liquid',
      interactive = false,
      refractionTop = true,
      glow = false,
      className = '',
      children,
      ...props
    },
    ref
  ) => {
    const getVariantClasses = () => {
      switch (variant) {
        case 'frosted':
          return 'glin-glass-frosted rounded-2xl';
        case 'lift':
          return 'glin-glass-lift rounded-2xl';
        case 'well':
          return 'glin-glass-well rounded-xl p-4';
        case 'plain':
          return 'bg-[#12151D]/80 border border-white/10 rounded-2xl backdrop-blur-md';
        case 'liquid':
        default:
          return 'glin-glass-liquid rounded-2xl';
      }
    };

    const interactiveClasses = interactive
      ? 'cursor-pointer hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 active:translate-y-0 active:scale-[0.99]'
      : '';

    const refractionClasses = refractionTop ? 'glin-refraction-top' : '';
    const glowClasses = glow ? 'shadow-[0_0_30px_rgba(246,193,56,0.12)]' : '';

    return (
      <div
        ref={ref}
        className={`relative overflow-hidden ${getVariantClasses()} ${interactiveClasses} ${refractionClasses} ${glowClasses} ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

GlassCard.displayName = 'GlassCard';
