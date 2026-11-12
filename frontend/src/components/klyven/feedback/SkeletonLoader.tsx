import React from 'react';

export interface SkeletonProps {
  className?: string;
  variant?: 'rect' | 'circle' | 'text' | 'card';
  height?: string | number;
  width?: string | number;
}

/**
 * Obsidian & Silver Skeleton Placeholder Loader (Klyven × Soulverse)
 * Provides shimmering dark-mode placeholders with zero cumulative layout shift.
 */
export const SkeletonLoader: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'rect',
  height,
  width,
}) => {
  const variantStyles = {
    rect: 'rounded-xl',
    circle: 'rounded-full',
    text: 'rounded-md h-4 w-3/4',
    card: 'rounded-3xl h-64 w-full',
  }[variant];

  return (
    <div
      style={{ height, width }}
      className={`relative overflow-hidden bg-[#181B24]/70 border border-white/5 animate-pulse ${variantStyles} ${className}`}
    >
      {/* Specular Shimmer Gradient */}
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
    </div>
  );
};
