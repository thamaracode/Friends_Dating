import React from 'react';

export interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean;
  borderGlow?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

/**
 * Universal Glass Card Container (Klyven × Soulverse Titanium Glass)
 * Features:
 * - 24px backdrop-blur scrim
 * - Specular top-edge highlight inset (rgba(255, 255, 255, 0.20))
 * - Kinetic spring hover elevation
 * - Subtle platinum border reflection
 */
export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  hoverEffect = true,
  borderGlow = false,
  padding = 'md',
  className = '',
  ...props
}) => {
  const padStyles = {
    none: 'p-0',
    sm: 'p-3 sm:p-4',
    md: 'p-4 sm:p-5',
    lg: 'p-6 sm:p-8',
  }[padding];

  return (
    <div
      className={`rounded-2xl sm:rounded-3xl ${hoverEffect ? 'glass-card' : 'glass-panel'} ${padStyles} ${
        borderGlow ? 'border-white/30 shadow-[0_0_24px_rgba(255,255,255,0.12)]' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
