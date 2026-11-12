import React from 'react';

interface CinematicAmbientBackgroundProps {
  className?: string;
  currentRoute?: string;
}

export const CinematicAmbientBackground: React.FC<CinematicAmbientBackgroundProps> = ({
  className = '',
  currentRoute: _currentRoute = 'home'
}) => {
  return (
    <div 
      className={`fixed inset-0 pointer-events-none z-0 overflow-hidden select-none ${className}`}
      aria-hidden="true"
    >
      {/* 1. Deep Obsidian / Charcoal Neutral Canvas */}
      <div className="absolute inset-0 bg-[#090A0E]" />

      {/* 2. Layered Ambient Lighting (Dark Cinematic UI with Subtle Atmospheric Lighting) */}
      
      {/* Left Ambient Crimson Reflection (Emotional depth, romantic warmth - #85283C / #461829) */}
      <div 
        className="absolute -top-24 -left-32 w-[680px] h-[780px] rounded-full blur-[160px] pointer-events-none transition-opacity duration-1000"
        style={{
          background: 'radial-gradient(circle at 30% 40%, rgba(133, 40, 60, 0.14) 0%, rgba(70, 24, 41, 0.08) 50%, transparent 80%)'
        }}
      />

      {/* Right Ambient Midnight Violet / Indigo Reflection (Creative worlds & imagination - #49315F / #203D62) */}
      <div 
        className="absolute -bottom-36 -right-32 w-[720px] h-[820px] rounded-full blur-[180px] pointer-events-none transition-opacity duration-1000"
        style={{
          background: 'radial-gradient(circle at 70% 60%, rgba(73, 49, 95, 0.14) 0%, rgba(32, 61, 98, 0.08) 50%, transparent 80%)'
        }}
      />

      {/* Top Center Ambient Silver/Titanium Haze (Neutral highlight keeping content crisp and readable) */}
      <div 
        className="absolute -top-40 left-1/2 -translate-x-1/2 w-[720px] h-[480px] rounded-full blur-[160px] opacity-20 pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(255, 255, 255, 0.08) 0%, rgba(160, 175, 200, 0.03) 45%, transparent 75%)'
        }}
      />

      {/* Central Ground Horizon Glow */}
      <div 
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[900px] h-[300px] rounded-full blur-[140px] opacity-15 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at bottom, rgba(133, 40, 60, 0.08) 0%, rgba(73, 49, 95, 0.06) 40%, transparent 70%)'
        }}
      />

      {/* 3. Dark Cinematic Geometric Glass Portals & Fine Hairline Silver Ray Lines */}
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.24] mix-blend-screen pointer-events-none">
        <svg 
          viewBox="0 0 1440 900" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg" 
          className="w-full h-full object-cover"
          preserveAspectRatio="none"
        >
          {/* Elegant Vanishing Silver Ray Lines Converging to Horizon */}
          <line x1="720" y1="520" x2="-80" y2="900" stroke="#85283C" strokeWidth="1" strokeOpacity="0.25" />
          <line x1="720" y1="520" x2="240" y2="900" stroke="#FFFFFF" strokeWidth="0.7" strokeOpacity="0.14" />
          <line x1="720" y1="520" x2="520" y2="900" stroke="#FFFFFF" strokeWidth="0.7" strokeOpacity="0.10" />
          <line x1="720" y1="520" x2="920" y2="900" stroke="#FFFFFF" strokeWidth="0.7" strokeOpacity="0.10" />
          <line x1="720" y1="520" x2="1200" y2="900" stroke="#FFFFFF" strokeWidth="0.7" strokeOpacity="0.14" />
          <line x1="720" y1="520" x2="1520" y2="900" stroke="#49315F" strokeWidth="1" strokeOpacity="0.25" />

          {/* Central Converging Point */}
          <circle cx="720" cy="520" r="10" fill="#FFFFFF" fillOpacity="0.25" filter="blur(6px)" />

          {/* Standing Glass Panes with Hairline Translucent Edges (Left Crimson Ambient Rim) */}
          <polygon 
            points="510,220 570,260 570,720 510,680" 
            fill="url(#glassGradCrimson)" 
            fillOpacity="0.12" 
            stroke="#85283C" 
            strokeOpacity="0.35" 
            strokeWidth="0.8"
          />

          {/* Central Standing Monolith Panes */}
          <polygon 
            points="580,180 720,240 720,740 580,680" 
            fill="url(#glassGradCenterLeft)" 
            fillOpacity="0.10" 
            stroke="#FFFFFF" 
            strokeOpacity="0.30" 
            strokeWidth="1"
          />

          <polygon 
            points="720,240 860,180 860,680 720,740" 
            fill="url(#glassGradCenterRight)" 
            fillOpacity="0.10" 
            stroke="#FFFFFF" 
            strokeOpacity="0.30" 
            strokeWidth="1"
          />

          {/* Right Standing Monolith Pane (Violet Ambient Rim) */}
          <polygon 
            points="870,260 930,220 930,680 870,720" 
            fill="url(#glassGradViolet)" 
            fillOpacity="0.12" 
            stroke="#49315F" 
            strokeOpacity="0.35" 
            strokeWidth="0.8"
          />

          <defs>
            <linearGradient id="glassGradCrimson" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#85283C" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#090A0E" stopOpacity="0.05" />
            </linearGradient>

            <linearGradient id="glassGradCenterLeft" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#461829" stopOpacity="0.08" />
            </linearGradient>

            <linearGradient id="glassGradCenterRight" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#203D62" stopOpacity="0.08" />
            </linearGradient>

            <linearGradient id="glassGradViolet" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#49315F" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#090A0E" stopOpacity="0.05" />
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
