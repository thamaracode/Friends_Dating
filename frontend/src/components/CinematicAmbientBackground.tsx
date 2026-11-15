import React from 'react';

interface CinematicAmbientBackgroundProps {
  className?: string;
  currentRoute?: string;
}

export const CinematicAmbientBackground: React.FC<CinematicAmbientBackgroundProps> = ({
  className = '',
  currentRoute: _currentRoute = 'discover'
}) => {
  return (
    <div 
      className={`fixed inset-0 pointer-events-none z-0 overflow-hidden select-none ${className}`}
      aria-hidden="true"
    >
      {/* 1. Deep Midnight Obsidian Canvas (#07080D) */}
      <div className="absolute inset-0 bg-[#07080D]" />

      {/* 2. Primary Top-Center Aurora Plum Bloom (From Creative Direction Mockup) */}
      <div 
        className="absolute -top-32 left-1/2 -translate-x-1/2 w-[620px] sm:w-[840px] md:w-[1020px] h-[520px] sm:h-[640px] rounded-full pointer-events-none transition-all duration-1000 animate-pulse"
        style={{
          background: 'radial-gradient(ellipse at 50% 30%, rgba(192, 38, 211, 0.22) 0%, rgba(147, 51, 234, 0.16) 35%, rgba(225, 29, 72, 0.08) 60%, transparent 80%)',
          filter: 'blur(100px)',
          animationDuration: '8s'
        }}
      />

      {/* 3. Subtle Left Ambient Rose Glow */}
      <div 
        className="absolute top-20 -left-20 w-[420px] h-[520px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 40% 40%, rgba(244, 63, 94, 0.12) 0%, rgba(136, 19, 55, 0.05) 50%, transparent 75%)',
          filter: 'blur(120px)'
        }}
      />

      {/* 4. Subtle Right Ambient Violet / Ice Haze */}
      <div 
        className="absolute top-36 -right-20 w-[460px] h-[560px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 60% 40%, rgba(139, 92, 246, 0.14) 0%, rgba(56, 189, 248, 0.04) 50%, transparent 75%)',
          filter: 'blur(120px)'
        }}
      />

      {/* 5. Bottom Fluid Horizon Depth (Elevates the floating glass dock) */}
      <div 
        className="absolute -bottom-24 left-1/2 -translate-x-1/2 w-[780px] sm:w-[1100px] h-[340px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 90%, rgba(99, 102, 241, 0.09) 0%, rgba(147, 51, 234, 0.06) 40%, transparent 75%)',
          filter: 'blur(110px)'
        }}
      />

      {/* 6. Ultra-subtle Micro Star Dust & Specular Shimmer */}
      <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.03)_1px,transparent_1px)] [background-size:32px_32px] opacity-40 mix-blend-screen pointer-events-none" />
    </div>
  );
};
