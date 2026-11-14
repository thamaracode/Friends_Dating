import React, { forwardRef } from 'react';

export interface ShimmerButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  shimmerColor?: string;
  variant?: 'primary' | 'glass' | 'ghost' | 'amber';
  size?: 'sm' | 'md' | 'lg';
  children?: React.ReactNode;
}

/**
 * GlinUI ShimmerButton: Liquid glass tactile button with optical shimmer sweep
 * Adapted from @glinui/ui shimmer-button
 */
export const ShimmerButton = forwardRef<HTMLButtonElement, ShimmerButtonProps>(
  (
    {
      shimmerColor = 'rgba(255, 255, 255, 0.28)',
      variant = 'primary',
      size = 'md',
      className = '',
      children,
      ...props
    },
    ref
  ) => {
    const getSizeClasses = () => {
      switch (size) {
        case 'sm':
          return 'h-9 px-4 text-xs';
        case 'lg':
          return 'h-13 px-8 text-base font-semibold';
        case 'md':
        default:
          return 'h-11 px-6 text-sm font-medium';
      }
    };

    const getVariantClasses = () => {
      switch (variant) {
        case 'glass':
          return 'glin-glass-liquid text-zinc-100 hover:text-white hover:border-white/30';
        case 'amber':
          return 'bg-gradient-to-r from-amber-500 to-amber-600 text-zinc-950 font-semibold shadow-[0_4px_20px_rgba(245,158,11,0.35)] border border-amber-300/40 hover:from-amber-400 hover:to-amber-500';
        case 'ghost':
          return 'bg-white/[0.04] text-zinc-300 hover:text-white hover:bg-white/[0.08] border border-transparent hover:border-white/10';
        case 'primary':
        default:
          return 'bg-white/10 text-white border border-white/20 hover:bg-white/15 hover:border-white/30 shadow-lg';
      }
    };

    return (
      <button
        ref={ref}
        className={`relative isolate overflow-hidden rounded-xl inline-flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer active:scale-[0.98] select-none ${getSizeClasses()} ${getVariantClasses()} ${className}`}
        {...props}
      >
        {/* Animated Shimmer Light Sweep */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(90deg,transparent,var(--shimmer-color,rgba(255,255,255,0.25)),transparent)] motion-safe:animate-[glinSkeletonShimmer_2.4s_cubic-bezier(0.4,0,0.2,1)_infinite]"
          style={{ '--shimmer-color': shimmerColor } as React.CSSProperties}
        />
        {/* Subtle Specular Top Rim */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-white/40"
        />
        {children}
      </button>
    );
  }
);

ShimmerButton.displayName = 'ShimmerButton';
