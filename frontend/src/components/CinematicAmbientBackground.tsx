import React, { useMemo } from 'react';
import type { SoulverseRoute } from '../types';

export interface AmbientProfile {
  primary: string;      // Primary atmospheric volumetric fog (left)
  secondary: string;    // Secondary atmospheric volumetric fog (right)
  accent: string;       // Horizon vanishing glow / floor ray
  fogTone: string;      // Floor haze / bottom depth
  themeLabel: string;
}

export const ROUTE_AMBIENT_PROFILES: Record<SoulverseRoute, AmbientProfile> = {
  home: {
    primary: '#85283C',      // Crimson (romantic / emotional core)
    secondary: '#49315F',    // Violet (cinematic imagination)
    accent: '#79502D',       // Warm Amber (daily achievements)
    fogTone: '#461829',      // Burgundy base
    themeLabel: 'Crimson & Violet Ambience'
  },
  daily: {
    primary: '#85283C',      // Crimson (Love & Relationships)
    secondary: '#49315F',    // Violet (Mind & Psychology)
    accent: '#79502D',       // Warm Amber (Growth & Streaks)
    fogTone: '#24544F',      // Teal contrast depth
    themeLabel: 'Daily Connection Intelligence'
  },
  discover: {
    primary: '#203D62',      // Midnight Blue (communication & exploration)
    secondary: '#24544F',    // Teal (subtle contrast & clarity)
    accent: '#49315F',       // Violet (personality chemistry)
    fogTone: '#122338',
    themeLabel: 'Midnight Blue & Teal Ambience'
  },
  connections: {
    primary: '#85283C',      // Crimson (deep mutual romance)
    secondary: '#461829',    // Burgundy (intimacy & warmth)
    accent: '#85283C',       // Crimson highlight
    fogTone: '#2e0e1b',
    themeLabel: 'Crimson & Burgundy Ambience'
  },
  messages: {
    primary: '#203D62',      // Midnight Blue (focused communication)
    secondary: '#49315F',    // Violet (atmospheric chat aura)
    accent: '#24544F',       // Teal (subtle clarity)
    fogTone: '#142131',
    themeLabel: 'Midnight Blue & Violet Ambience'
  },
  profile: {
    primary: '#49315F',      // Violet (creative persona)
    secondary: '#85283C',    // Crimson (soul identity)
    accent: '#79502D',       // Warm Amber (stats & achievements)
    fogTone: '#291424',
    themeLabel: 'Violet & Crimson Sanctuary'
  },
  worlds: {
    primary: '#49315F',      // Violet (creative worlds & fantasy)
    secondary: '#461829',    // Burgundy (dramatic depth)
    accent: '#85283C',       // Crimson (cinematic life)
    fogTone: '#26122d',
    themeLabel: 'Violet & Burgundy Multiverse'
  },
  timeline: {
    primary: '#79502D',      // Warm Amber (life milestones & memories)
    secondary: '#24544F',    // Teal (growth & reflections)
    accent: '#461829',       // Burgundy (past chapters)
    fogTone: '#2f1a0e',
    themeLabel: 'Warm Amber & Teal Timeline'
  },
  collections: {
    primary: '#49315F',      // Violet (cinematic galleries)
    secondary: '#203D62',    // Midnight Blue (audio archives)
    accent: '#24544F',       // Teal (literature tags)
    fogTone: '#1c1933',
    themeLabel: 'Violet & Midnight Blue Gallery'
  },
  account: {
    primary: '#203D62',      // Midnight Blue (security & credentials)
    secondary: '#461829',    // Burgundy (personal data)
    accent: '#24544F',       // Teal (verified status)
    fogTone: '#131b26',
    themeLabel: 'Midnight Blue & Burgundy Sanctuary'
  },
  settings: {
    primary: '#203D62',      // Midnight Blue (neutral clarity)
    secondary: '#24544F',    // Teal (calm 2 AM toggles)
    accent: '#461829',       // Burgundy
    fogTone: '#121e25',
    themeLabel: 'Midnight Blue & Teal Settings'
  },
  more: {
    primary: '#49315F',      // Violet (inner self)
    secondary: '#85283C',    // Crimson (passion & life)
    accent: '#79502D',       // Warm Amber (chronicles)
    fogTone: '#281320',
    themeLabel: 'Violet & Crimson Memoir'
  },
  journal: {
    primary: '#49315F',      // Violet
    secondary: '#85283C',    // Crimson
    accent: '#79502D',       // Warm Amber
    fogTone: '#281320',
    themeLabel: 'Violet & Crimson Memoir'
  }
};

interface CinematicAmbientBackgroundProps {
  currentRoute: SoulverseRoute;
  className?: string;
}

export const CinematicAmbientBackground: React.FC<CinematicAmbientBackgroundProps> = ({
  currentRoute,
  className = ''
}) => {
  const profile = useMemo(() => {
    return ROUTE_AMBIENT_PROFILES[currentRoute] || ROUTE_AMBIENT_PROFILES.home;
  }, [currentRoute]);

  return (
    <div 
      className={`fixed inset-0 pointer-events-none z-0 overflow-hidden select-none transition-colors duration-1000 ease-in-out ${className}`}
      aria-hidden="true"
    >
      {/* 1. Base Obsidian Void Floor */}
      <div className="absolute inset-0 bg-[#09080D]" />

      {/* 2. Left Volumetric Ambient Fog (Primary Colour) */}
      <div 
        className="absolute -top-32 -left-40 w-[720px] h-[850px] rounded-full blur-[150px] opacity-25 transition-all duration-1000 ease-out will-change-transform"
        style={{
          background: `radial-gradient(circle, ${profile.primary} 0%, ${profile.fogTone} 55%, transparent 75%)`
        }}
      />

      {/* 3. Right Volumetric Ambient Fog (Secondary Colour) */}
      <div 
        className="absolute -top-24 -right-40 w-[760px] h-[880px] rounded-full blur-[150px] opacity-22 transition-all duration-1000 ease-out will-change-transform"
        style={{
          background: `radial-gradient(circle, ${profile.secondary} 0%, ${profile.primary} 45%, transparent 75%)`
        }}
      />

      {/* 4. Center Horizon Accent Glow (Warm Amber or Violet/Teal Vanishing Point) */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[480px] rounded-full blur-[140px] opacity-15 transition-all duration-1000 ease-out"
        style={{
          background: `radial-gradient(ellipse at center, ${profile.accent} 0%, transparent 70%)`
        }}
      />

      {/* 5. Bottom Floor Mist & Atmospheric Depth */}
      <div 
        className="absolute bottom-0 inset-x-0 h-[420px] opacity-20 blur-[130px] transition-all duration-1000 ease-out"
        style={{
          background: `linear-gradient(to top, ${profile.fogTone} 0%, transparent 100%)`
        }}
      />

      {/* 6. Cinematic Geometric Perspective Glass Panes & Light Rays (Reference Image Replication) */}
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.14] mix-blend-screen pointer-events-none">
        <svg 
          viewBox="0 0 1440 900" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg" 
          className="w-full h-full object-cover"
          preserveAspectRatio="none"
        >
          {/* Subtle Vanishing Perspective Rays Converging into Central Horizon */}
          <line x1="720" y1="520" x2="-100" y2="900" stroke={profile.primary} strokeWidth="1" strokeOpacity="0.4" />
          <line x1="720" y1="520" x2="200" y2="900" stroke={profile.primary} strokeWidth="0.8" strokeOpacity="0.3" />
          <line x1="720" y1="520" x2="480" y2="900" stroke={profile.primary} strokeWidth="0.8" strokeOpacity="0.25" />
          <line x1="720" y1="520" x2="960" y2="900" stroke={profile.secondary} strokeWidth="0.8" strokeOpacity="0.25" />
          <line x1="720" y1="520" x2="1240" y2="900" stroke={profile.secondary} strokeWidth="0.8" strokeOpacity="0.3" />
          <line x1="720" y1="520" x2="1540" y2="900" stroke={profile.secondary} strokeWidth="1" strokeOpacity="0.4" />

          {/* Central Converging Point Glow */}
          <circle cx="720" cy="520" r="14" fill={profile.accent} fillOpacity="0.3" filter="blur(6px)" />

          {/* Vertical Translucent Glass Pane 1 (Left Angled Portal) */}
          <polygon 
            points="510,220 570,260 570,720 510,680" 
            fill={profile.primary} 
            fillOpacity="0.08" 
            stroke={profile.primary} 
            strokeOpacity="0.35" 
            strokeWidth="0.8"
          />

          {/* Vertical Translucent Glass Pane 2 (Center Hero Portal) */}
          <polygon 
            points="580,180 720,240 720,740 580,680" 
            fill="url(#glassGradLeft)" 
            fillOpacity="0.06" 
            stroke={profile.primary} 
            strokeOpacity="0.45" 
            strokeWidth="1"
          />

          {/* Vertical Translucent Glass Pane 3 (Right Angled Portal) */}
          <polygon 
            points="720,240 860,180 860,680 720,740" 
            fill="url(#glassGradRight)" 
            fillOpacity="0.06" 
            stroke={profile.secondary} 
            strokeOpacity="0.45" 
            strokeWidth="1"
          />

          {/* Vertical Translucent Glass Pane 4 (Far Right Portal) */}
          <polygon 
            points="870,260 930,220 930,680 870,720" 
            fill={profile.secondary} 
            fillOpacity="0.08" 
            stroke={profile.secondary} 
            strokeOpacity="0.35" 
            strokeWidth="0.8"
          />

          <defs>
            <linearGradient id="glassGradLeft" x1="580" y1="180" x2="720" y2="740" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor={profile.primary} stopOpacity="0.25" />
              <stop offset="100%" stopColor={profile.fogTone} stopOpacity="0.02" />
            </linearGradient>
            <linearGradient id="glassGradRight" x1="860" y1="180" x2="720" y2="740" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor={profile.secondary} stopOpacity="0.25" />
              <stop offset="100%" stopColor={profile.fogTone} stopOpacity="0.02" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* 7. Subtle Grain Texture Overlay for Depth */}
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
