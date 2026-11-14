import React from 'react';

export interface GlassBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'frosted' | 'liquid' | 'amber' | 'emerald' | 'violet';
  dot?: boolean;
  pulse?: boolean;
  children: React.ReactNode;
}

export const GlassBadge: React.FC<GlassBadgeProps> = ({
  variant = 'frosted',
  dot = true,
  pulse = false,
  className = '',
  children,
  ...props
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'amber':
        return 'bg-amber-500/10 text-amber-300 border-amber-500/25';
      case 'emerald':
        return 'bg-emerald-500/10 text-emerald-300 border-emerald-500/25';
      case 'violet':
        return 'bg-purple-500/10 text-purple-300 border-purple-500/25';
      case 'liquid':
        return 'glin-glass-liquid text-zinc-200 border-white/20';
      case 'frosted':
      default:
        return 'glin-glass-frosted text-zinc-200 border-white/15';
    }
  };

  const getDotColor = () => {
    switch (variant) {
      case 'amber':
        return 'bg-amber-400 shadow-[0_0_8px_#F59E0B]';
      case 'emerald':
        return 'bg-emerald-400 shadow-[0_0_8px_#10B981]';
      case 'violet':
        return 'bg-purple-400 shadow-[0_0_8px_#A855F7]';
      default:
        return 'bg-white/80 shadow-[0_0_6px_rgba(255,255,255,0.8)]';
    }
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold backdrop-blur-md border ${getVariantStyles()} ${className}`}
      {...props}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full ${getDotColor()} ${pulse ? 'animate-pulse' : ''}`}
        />
      )}
      {children}
    </span>
  );
};
