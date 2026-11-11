import React from 'react';

interface CinematicAmbientBackgroundProps {
  className?: string;
  currentRoute?: string;
}

export const CinematicAmbientBackground: React.FC<CinematicAmbientBackgroundProps> = ({
  className = ''
}) => {
  return (
    <div 
      className={`fixed inset-0 pointer-events-none z-0 overflow-hidden select-none ${className}`}
      aria-hidden="true"
    >
      {/* 1. Deep Obsidian / Charcoal Neutral Canvas */}
      <div className="absolute inset-0 bg-[#090A0E]" />

      {/* 2. Soft, Ambient Silver/Gray Atmospheric Haze (Minimalist, elegant, high contrast) */}
      {/* Primary Silver Depth (Top-Center Subtle Wash) */}
      <div 
        className="absolute -top-40 left-1/3 w-[720px] h-[720px] rounded-full blur-[180px] opacity-25 pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(255, 255, 255, 0.08) 0%, rgba(160, 175, 200, 0.03) 45%, transparent 75%)'
        }}
      />

      {/* Secondary Cool Graphite Ambient (Bottom-Right Horizon Depth) */}
      <div 
        className="absolute -bottom-48 right-10 w-[640px] h-[640px] rounded-full blur-[160px] opacity-20 pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(255, 255, 255, 0.06) 0%, rgba(120, 130, 150, 0.02) 50%, transparent 75%)'
        }}
      />

      {/* Center Subtle Horizon Glow */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[360px] rounded-full blur-[150px] opacity-15 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(255, 255, 255, 0.07) 0%, transparent 70%)'
        }}
      />

      {/* 3. Dark Cinematic Geometric Glass Portals & Fine Hairline Silver Ray Lines */}
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.20] mix-blend-screen pointer-events-none">
        <svg 
          viewBox="0 0 1440 900" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg" 
          className="w-full h-full object-cover"
          preserveAspectRatio="none"
        >
          {/* Elegant Vanishing Silver Ray Lines Converging to Horizon */}
          <line x1="720" y1="520" x2="-80" y2="900" stroke="#FFFFFF" strokeWidth="0.8" strokeOpacity="0.18" />
          <line x1="720" y1="520" x2="240" y2="900" stroke="#FFFFFF" strokeWidth="0.7" strokeOpacity="0.14" />
          <line x1="720" y1="520" x2="520" y2="900" stroke="#FFFFFF" strokeWidth="0.7" strokeOpacity="0.10" />
          <line x1="720" y1="520" x2="920" y2="900" stroke="#FFFFFF" strokeWidth="0.7" strokeOpacity="0.10" />
          <line x1="720" y1="520" x2="1200" y2="900" stroke="#FFFFFF" strokeWidth="0.7" strokeOpacity="0.14" />
          <line x1="720" y1="520" x2="1520" y2="900" stroke="#FFFFFF" strokeWidth="0.8" strokeOpacity="0.18" />

          {/* Central Converging Point */}
          <circle cx="720" cy="520" r="10" fill="#FFFFFF" fillOpacity="0.25" filter="blur(6px)" />

          {/* Standing Glass Panes with Hairline Translucent Silver Edges */}
          <polygon 
            points="510,220 570,260 570,720 510,680" 
            fill="url(#glassGradSilver)" 
            fillOpacity="0.08" 
            stroke="#FFFFFF" 
            strokeOpacity="0.20" 
            strokeWidth="0.8"
          />

          <polygon 
            points="580,180 720,240 720,740 580,680" 
            fill="url(#glassGradSilver)" 
            fillOpacity="0.06" 
            stroke="#FFFFFF" 
            strokeOpacity="0.25" 
            strokeWidth="1"
          />

          <polygon 
            points="720,240 860,180 860,680 720,740" 
            fill="url(#glassGradSilver)" 
            fillOpacity="0.06" 
            stroke="#FFFFFF" 
            strokeOpacity="0.25" 
            strokeWidth="1"
          />

          <polygon 
            points="870,260 930,220 930,680 870,720" 
            fill="url(#glassGradSilver)" 
            fillOpacity="0.08" 
            stroke="#FFFFFF" 
            strokeOpacity="0.20" 
            strokeWidth="0.8"
          />

          <defs>
            <linearGradient id="glassGradSilver" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.02" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* 4. Fine Subtle Noise Grid Texture for Tactile Frosted Glass Feel */}
      <div 
        className="absolute inset-0 opacity-[0.025] mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.4) 1px, transparent 0)`,
          backgroundSize: '24px 24px'
        }}
      />
    </div>
  );
};
