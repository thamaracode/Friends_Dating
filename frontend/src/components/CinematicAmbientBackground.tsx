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
      {/* 1. Deep Obsidian / Pitch Dark Void Canvas */}
      <div className="absolute inset-0 bg-[#08060A]" />

      {/* 2. ONLY Little Light Red Ambient Haze (Soft, atmospheric, never blinding or nightclub-like) */}
      {/* Primary Light Red Fog (Top-Right Gentle Wash) */}
      <div 
        className="absolute -top-36 right-1/4 w-[680px] h-[680px] rounded-full blur-[160px] opacity-20 pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(215, 55, 75, 0.70) 0%, rgba(133, 40, 60, 0.35) 45%, transparent 75%)'
        }}
      />

      {/* Secondary Light Red Ambient Breath (Bottom-Left Horizon Depth) */}
      <div 
        className="absolute -bottom-40 left-10 w-[580px] h-[580px] rounded-full blur-[150px] opacity-15 pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(190, 45, 65, 0.60) 0%, rgba(74, 18, 30, 0.30) 50%, transparent 75%)'
        }}
      />

      {/* Center Subtle Horizon Point Glow (Gentle Vanishing Horizon) */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[340px] rounded-full blur-[140px] opacity-10 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(215, 55, 75, 0.50) 0%, transparent 70%)'
        }}
      />

      {/* 3. Dark Cinematic Geometric Glass Portals & Fine Hairline Ray Lines */}
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.16] mix-blend-screen pointer-events-none">
        <svg 
          viewBox="0 0 1440 900" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg" 
          className="w-full h-full object-cover"
          preserveAspectRatio="none"
        >
          {/* Subtle Vanishing Light Red Ray Lines Converging to Horizon */}
          <line x1="720" y1="520" x2="-80" y2="900" stroke="#D7374B" strokeWidth="0.8" strokeOpacity="0.35" />
          <line x1="720" y1="520" x2="240" y2="900" stroke="#D7374B" strokeWidth="0.7" strokeOpacity="0.25" />
          <line x1="720" y1="520" x2="520" y2="900" stroke="#D7374B" strokeWidth="0.7" strokeOpacity="0.20" />
          <line x1="720" y1="520" x2="920" y2="900" stroke="#D7374B" strokeWidth="0.7" strokeOpacity="0.20" />
          <line x1="720" y1="520" x2="1200" y2="900" stroke="#D7374B" strokeWidth="0.7" strokeOpacity="0.25" />
          <line x1="720" y1="520" x2="1520" y2="900" stroke="#D7374B" strokeWidth="0.8" strokeOpacity="0.35" />

          {/* Central Converging Point */}
          <circle cx="720" cy="520" r="10" fill="#D7374B" fillOpacity="0.3" filter="blur(5px)" />

          {/* Standing Glass Panes with Hairline Translucent Edges */}
          <polygon 
            points="510,220 570,260 570,720 510,680" 
            fill="url(#glassGradRed)" 
            fillOpacity="0.08" 
            stroke="#D7374B" 
            strokeOpacity="0.30" 
            strokeWidth="0.8"
          />

          <polygon 
            points="580,180 720,240 720,740 580,680" 
            fill="url(#glassGradRed)" 
            fillOpacity="0.06" 
            stroke="#D7374B" 
            strokeOpacity="0.40" 
            strokeWidth="1"
          />

          <polygon 
            points="720,240 860,180 860,680 720,740" 
            fill="url(#glassGradRed)" 
            fillOpacity="0.06" 
            stroke="#D7374B" 
            strokeOpacity="0.40" 
            strokeWidth="1"
          />

          <polygon 
            points="870,260 930,220 930,680 870,720" 
            fill="url(#glassGradRed)" 
            fillOpacity="0.08" 
            stroke="#D7374B" 
            strokeOpacity="0.30" 
            strokeWidth="0.8"
          />

          <defs>
            <linearGradient id="glassGradRed" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#D7374B" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#4A121E" stopOpacity="0.02" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* 4. Fine Grain Noise Texture for Tactile Frosted Glass Feel */}
      <div 
        className="absolute inset-0 opacity-[0.02] mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.4) 1px, transparent 0)`,
          backgroundSize: '24px 24px'
        }}
      />
    </div>
  );
};
