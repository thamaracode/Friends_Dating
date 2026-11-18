import React from 'react';

interface CinematicAmbientBackgroundProps {
  className?: string;
  currentRoute?: string;
}

/**
 * Editorial Ambient Background:
 * Quiet, mature deep charcoal canvas with very subtle, restrained warm & muted rose depth.
 * Eliminates pulsating animations, loud neon halos, and distracting decorative circles.
 */
export const CinematicAmbientBackground: React.FC<CinematicAmbientBackgroundProps> = ({
  className = '',
  currentRoute: _currentRoute = 'discover'
}) => {
  return (
    <div 
      className={`fixed inset-0 pointer-events-none z-0 overflow-hidden select-none ${className}`}
      aria-hidden="true"
    >
      {/* 1. Deep Charcoal Background Canvas (#0A0B0F) */}
      <div className="absolute inset-0 bg-[#0A0B0F]" />

      {/* 2. Soft, Restrained Top Ambient Warmth (Subtle depth without neon glow) */}
      <div 
        className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full pointer-events-none opacity-40"
        style={{
          background: 'radial-gradient(ellipse at 50% 30%, rgba(217, 70, 104, 0.08) 0%, rgba(158, 42, 75, 0.04) 45%, transparent 75%)',
          filter: 'blur(140px)'
        }}
      />

      {/* 3. Subtle Vignette Depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/60 pointer-events-none" />
    </div>
  );
};
