import React, { useRef, useState, useCallback, forwardRef } from 'react';
import { GlassCard, GlassCardProps } from './GlassCard';

export interface SpotlightCardProps extends GlassCardProps {
  spotlightColor?: string;
  spotlightSize?: number;
}

/**
 * GlinUI SpotlightCard: Glass surface with cursor-following radial refraction highlight
 * Directly adapted from @glinui/ui spotlight-card
 */
export const SpotlightCard = forwardRef<HTMLDivElement, SpotlightCardProps>(
  (
    {
      spotlightColor = 'rgba(255, 255, 255, 0.15)',
      spotlightSize = 320,
      className = '',
      children,
      variant = 'liquid',
      ...props
    },
    ref
  ) => {
    const cardRef = useRef<HTMLDivElement | null>(null);
    const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);
    const [isHovered, setIsHovered] = useState(false);

    const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
      if (!cardRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      setMousePos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }, []);

    const handleMouseEnter = useCallback(() => setIsHovered(true), []);
    const handleMouseLeave = useCallback(() => {
      setIsHovered(false);
      setMousePos(null);
    }, []);

    return (
      <GlassCard
        ref={(node) => {
          cardRef.current = node;
          if (typeof ref === 'function') ref(node);
          else if (ref) ref.current = node;
        }}
        variant={variant}
        className={`group ${className}`}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        {...props}
      >
        {/* Cursor Spotlight Glow Overlay */}
        {isHovered && mousePos && (
          <div
            className="pointer-events-none absolute -inset-px transition-opacity duration-300 opacity-100 z-10"
            style={{
              background: `radial-gradient(${spotlightSize}px circle at ${mousePos.x}px ${mousePos.y}px, ${spotlightColor}, transparent 75%)`
            }}
          />
        )}
        <div className="relative z-20">{children}</div>
      </GlassCard>
    );
  }
);

SpotlightCard.displayName = 'SpotlightCard';
