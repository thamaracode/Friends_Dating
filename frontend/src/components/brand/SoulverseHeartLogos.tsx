import React from 'react';

export type HeartLogoVariant = 
  | 'open_heart' 
  | 'the_flow' 
  | 'the_pulse' 
  | 'the_connection' 
  | 'the_orbit' 
  | 'the_infinite' 
  | 'the_spark' 
  | 'the_sanctuary'
  | 'official_neon'
  | 'infinity' 
  | 'compass' 
  | 'twin_souls' 
  | 'crystal' 
  | 'resonance';

export interface HeartLogoProps {
  size?: number | string;
  className?: string;
  showGlow?: boolean;
  animated?: boolean;
}

/* ========================================================================= */
/* 1. THE 8 SUITE ALTERNATIVES (from Creative Direction Design System)       */
/* ========================================================================= */

/**
 * 01. THE OPEN HEART
 * "Thin, elegant, minimal outline."
 */
export const OpenHeartLogo: React.FC<HeartLogoProps> = ({
  size = 40,
  className = '',
  showGlow = true,
  animated = false
}) => {
  const id = React.useId().replace(/:/g, '_');
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${animated ? 'animate-pulse' : ''} ${className}`}
    >
      <defs>
        <linearGradient id={`${id}_open`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F472B6" />
          <stop offset="50%" stopColor="#C084FC" />
          <stop offset="100%" stopColor="#60A5FA" />
        </linearGradient>
      </defs>
      {showGlow && (
        <circle cx="50" cy="48" r="30" fill="#C084FC" opacity="0.22" filter="blur(14px)" />
      )}
      <path
        d="M 50 82 C 24 62, 14 42, 14 28 C 14 16, 24 10, 36 10 C 44 10, 48 14, 50 18 C 52 14, 56 10, 64 10 C 76 10, 86 16, 86 28 C 86 42, 76 62, 50 82 Z"
        stroke={`url(#${id}_open)`}
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

/**
 * 02. THE FLOW
 * "A flowing heart-inspired symbol."
 */
export const FlowHeartLogo: React.FC<HeartLogoProps> = ({
  size = 40,
  className = '',
  showGlow = true,
  animated = false
}) => {
  const id = React.useId().replace(/:/g, '_');
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${animated ? 'animate-pulse' : ''} ${className}`}
    >
      <defs>
        <linearGradient id={`${id}_flow`} x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#FB7185" />
          <stop offset="60%" stopColor="#A855F7" />
          <stop offset="100%" stopColor="#38BDF8" />
        </linearGradient>
      </defs>
      {showGlow && (
        <circle cx="50" cy="50" r="30" fill="#A855F7" opacity="0.22" filter="blur(14px)" />
      )}
      <path
        d="M 38 78 C 30 76, 22 66, 22 46 C 22 26, 34 14, 46 14 C 54 14, 58 20, 60 28 C 62 20, 66 14, 74 14 C 84 14, 90 24, 90 40 C 90 62, 72 74, 58 76 C 50 78, 44 80, 48 88"
        stroke={`url(#${id}_flow)`}
        strokeWidth="6.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

/**
 * 03. THE PULSE
 * "Heart with a subtle energy line."
 */
export const PulseHeartLogo: React.FC<HeartLogoProps> = ({
  size = 40,
  className = '',
  showGlow = true,
  animated = false
}) => {
  const id = React.useId().replace(/:/g, '_');
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${animated ? 'animate-pulse' : ''} ${className}`}
    >
      <defs>
        <linearGradient id={`${id}_pulse`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F43F5E" />
          <stop offset="50%" stopColor="#EC4899" />
          <stop offset="100%" stopColor="#8B5CF6" />
        </linearGradient>
      </defs>
      {showGlow && (
        <circle cx="50" cy="48" r="32" fill="#F43F5E" opacity="0.25" filter="blur(15px)" />
      )}
      {/* Outer Heart */}
      <path
        d="M 50 82 C 26 62, 14 42, 14 28 C 14 16, 24 10, 36 10 C 44 10, 48 14, 50 18 C 52 14, 56 10, 64 10 C 76 10, 86 16, 86 28 C 86 42, 74 62, 50 82 Z"
        stroke={`url(#${id}_pulse)`}
        strokeWidth="5.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Pulse ECG Line */}
      <path
        d="M 22 50 L 36 50 L 41 40 L 46 62 L 52 28 L 58 68 L 63 45 L 68 50 L 78 50"
        stroke={`url(#${id}_pulse)`}
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

/**
 * 04. THE CONNECTION
 * "A symbol of human connection."
 */
export const ConnectionHeartLogo: React.FC<HeartLogoProps> = ({
  size = 40,
  className = '',
  showGlow = true,
  animated = false
}) => {
  const id = React.useId().replace(/:/g, '_');
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${animated ? 'animate-pulse' : ''} ${className}`}
    >
      <defs>
        <linearGradient id={`${id}_conn`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="50%" stopColor="#818CF8" />
          <stop offset="100%" stopColor="#F472B6" />
        </linearGradient>
      </defs>
      {showGlow && (
        <circle cx="50" cy="48" r="30" fill="#818CF8" opacity="0.22" filter="blur(14px)" />
      )}
      {/* Heart Contour */}
      <path
        d="M 50 82 C 26 62, 14 42, 14 28 C 14 16, 24 10, 36 10 C 44 10, 48 14, 50 18 C 52 14, 56 10, 64 10 C 76 10, 86 16, 86 28 C 86 42, 74 62, 50 82 Z"
        stroke={`url(#${id}_conn)`}
        strokeWidth="5.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Clasping Interlock Handshake Lines */}
      <path
        d="M 33 42 L 48 54 C 52 57, 58 55, 61 51 L 67 43"
        stroke={`url(#${id}_conn)`}
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M 67 42 L 52 54 C 48 57, 42 55, 39 51 L 33 43"
        stroke={`url(#${id}_conn)`}
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

/**
 * 05. THE ORBIT
 * "A universe-inspired symbol surrounding a heart."
 */
export const OrbitHeartLogo: React.FC<HeartLogoProps> = ({
  size = 40,
  className = '',
  showGlow = true,
  animated = false
}) => {
  const id = React.useId().replace(/:/g, '_');
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${animated ? 'animate-pulse' : ''} ${className}`}
    >
      <defs>
        <linearGradient id={`${id}_orbit`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="50%" stopColor="#A855F7" />
          <stop offset="100%" stopColor="#EC4899" />
        </linearGradient>
      </defs>
      {showGlow && (
        <circle cx="50" cy="50" r="32" fill="#A855F7" opacity="0.25" filter="blur(16px)" />
      )}
      {/* Inner Heart Core */}
      <path
        d="M 50 68 C 36 56, 28 44, 28 35 C 28 27, 34 23, 41 23 C 46 23, 49 26, 50 28 C 51 26, 54 23, 59 23 C 66 23, 72 27, 72 35 C 72 44, 64 56, 50 68 Z"
        fill={`url(#${id}_orbit)`}
        opacity="0.9"
      />
      {/* Planetary Orbit Ring */}
      <ellipse
        cx="50"
        cy="50"
        rx="38"
        ry="18"
        transform="rotate(-28 50 50)"
        stroke={`url(#${id}_orbit)`}
        strokeWidth="4.5"
        strokeLinecap="round"
      />
      {/* Orbiting Planetary Nodes */}
      <circle cx="78" cy="36" r="4.5" fill="#38BDF8" />
      <circle cx="22" cy="64" r="4" fill="#EC4899" />
    </svg>
  );
};

/**
 * 06. THE INFINITE HEART
 * "Endless looping infinity heart celebrating unbreakable bonds."
 */
export const InfiniteHeartLogo: React.FC<HeartLogoProps> = ({
  size = 40,
  className = '',
  showGlow = true,
  animated = false
}) => {
  const id = React.useId().replace(/:/g, '_');
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${animated ? 'animate-pulse' : ''} ${className}`}
    >
      <defs>
        <linearGradient id={`${id}_inf`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#C084FC" />
          <stop offset="50%" stopColor="#F43F5E" />
          <stop offset="100%" stopColor="#FB923C" />
        </linearGradient>
      </defs>
      {showGlow && (
        <circle cx="50" cy="50" r="30" fill="#F43F5E" opacity="0.22" filter="blur(14px)" />
      )}
      {/* Outer Infinity Heart Silhouette */}
      <path
        d="M 50 32 C 40 18, 16 20, 16 42 C 16 62, 42 74, 50 84 C 58 74, 84 62, 84 42 C 84 20, 60 18, 50 32 Z"
        stroke={`url(#${id}_inf)`}
        strokeWidth="5.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Inner Möbius Infinity Loop in Heart Core */}
      <path
        d="M 34 48 C 42 42, 58 58, 66 52 C 72 48, 72 40, 66 36 C 60 32, 54 38, 50 44 C 46 38, 40 32, 34 36 C 28 40, 28 48, 34 48 Z"
        stroke={`url(#${id}_inf)`}
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

/**
 * 07. THE RADIANT HEART
 * "Nested twin hearts glowing with warm starlight resonance."
 */
export const SparkHeartLogo: React.FC<HeartLogoProps> = ({
  size = 40,
  className = '',
  showGlow = true,
  animated = false
}) => {
  const id = React.useId().replace(/:/g, '_');
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${animated ? 'animate-pulse' : ''} ${className}`}
    >
      <defs>
        <linearGradient id={`${id}_spark`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FDE68A" />
          <stop offset="50%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#F43F5E" />
        </linearGradient>
      </defs>
      {showGlow && (
        <circle cx="50" cy="50" r="32" fill="#F59E0B" opacity="0.25" filter="blur(16px)" />
      )}
      {/* Outer Heart Arc */}
      <path
        d="M 50 84 C 24 64, 14 44, 14 30 C 14 16, 24 10, 36 10 C 44 10, 48 14, 50 18 C 52 14, 56 10, 64 10 C 76 10, 86 16, 86 30 C 86 44, 76 64, 50 84 Z"
        stroke={`url(#${id}_spark)`}
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Inner Radiant Glowing Heart Core (Pure Heart - Zero Stars) */}
      <path
        d="M 50 68 C 34 54, 26 42, 26 32 C 26 22, 34 18, 42 18 C 47 18, 49 21, 50 24 C 51 21, 53 18, 58 18 C 66 18, 74 22, 74 32 C 74 42, 66 54, 50 68 Z"
        fill={`url(#${id}_spark)`}
        opacity="0.9"
      />
      <circle cx="50" cy="38" r="2.5" fill="#FFFBEB" />
    </svg>
  );
};

/**
 * 08. THE PRISM (Sanctuary Crystal)
 * "Faceted multidimensional diamond heart of intimate authenticity."
 */
export const SanctuaryHeartLogo: React.FC<HeartLogoProps> = ({
  size = 40,
  className = '',
  showGlow = true,
  animated = false
}) => {
  const id = React.useId().replace(/:/g, '_');
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${animated ? 'animate-pulse' : ''} ${className}`}
    >
      <defs>
        <linearGradient id={`${id}_prism`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFBEB" />
          <stop offset="40%" stopColor="#F59E0B" />
          <stop offset="80%" stopColor="#D97706" />
          <stop offset="100%" stopColor="#EC4899" />
        </linearGradient>
      </defs>
      {showGlow && (
        <circle cx="50" cy="50" r="32" fill="#F59E0B" opacity="0.22" filter="blur(16px)" />
      )}
      {/* Faceted Geometric Heart Silhouette */}
      <path
        d="M 50 86 L 20 52 L 20 28 L 36 14 L 50 24 L 64 14 L 80 28 L 80 52 Z"
        stroke={`url(#${id}_prism)`}
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Internal Facet Intersection Lines */}
      <path
        d="M 20 28 L 50 50 L 80 28 M 36 14 L 50 50 L 64 14 M 50 50 L 50 86 M 20 52 L 50 50 L 80 52"
        stroke={`url(#${id}_prism)`}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.8"
      />
    </svg>
  );
};

/* ========================================================================= */
/* 2. OFFICIAL MASTER FLAGSHIP BRAND LOGO (Uploaded Master)                   */
/* ========================================================================= */

/**
 * 00. OFFICIAL MASTER BRAND LOGO: Neon Ribbon Infinity Heart
 * Uploaded official master brand identity with glowing violet-to-pink gradient loop.
 */
export const OfficialNeonHeartLogo: React.FC<HeartLogoProps> = ({
  size = 40,
  className = '',
  showGlow = true,
  animated = false
}) => {
  const numSize = typeof size === 'number' ? size : parseInt(size as string, 10) || 40;
  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 rounded-2xl overflow-hidden select-none ${animated ? 'animate-pulse' : ''} ${className}`}
      style={{ width: numSize, height: numSize }}
    >
      {showGlow && (
        <div className="absolute inset-0 bg-gradient-to-tr from-purple-600/40 via-pink-500/30 to-transparent blur-md -z-10 rounded-2xl scale-125 pointer-events-none" />
      )}
      <img
        src="/images/soulverse_logo.png"
        alt="Soulverse Heart"
        className="w-full h-full object-cover rounded-2xl drop-shadow-[0_0_12px_rgba(236,72,153,0.45)]"
      />
    </div>
  );
};

// Aliases for backwards compatibility
export const InfinityOrbitHeartLogo = InfiniteHeartLogo;
export const CelestialCompassHeartLogo = SparkHeartLogo;
export const TwinSoulsEmbraceLogo = ConnectionHeartLogo;
export const PrismCrystalHeartLogo = SanctuaryHeartLogo;
export const ResonanceWaveHeartLogo = PulseHeartLogo;

/* ========================================================================= */
/* 3. SOULVERSE LOGO REGISTRY & METADATA (For Easter Eggs & Showcases)       */
/* ========================================================================= */

export interface SoulverseLogoInfo {
  id: HeartLogoVariant;
  number: string;
  title: string;
  tagline: string;
  description: string;
  symbolism: string;
  palette: string;
  component: React.FC<HeartLogoProps>;
}

export const SOULVERSE_ALL_LOGOS: SoulverseLogoInfo[] = [
  {
    id: 'open_heart',
    number: '01',
    title: 'The Open Heart',
    tagline: 'Minimalist Vulnerability',
    description: 'Thin, elegant, minimal outline.',
    symbolism: 'The courage to remain unarmored in a guarded world. Pure openness without performance.',
    palette: 'Rose Quartz & Ice Violet (#F472B6 → #C084FC)',
    component: OpenHeartLogo
  },
  {
    id: 'the_flow',
    number: '02',
    title: 'The Flow',
    tagline: 'Unbroken Organic Grace',
    description: 'A flowing heart-inspired symbol.',
    symbolism: 'The fluidity of emotional connection, twisting freely between two minds like cursive ribbon.',
    palette: 'Aurora Rose & Electric Sky (#FB7185 → #A855F7 → #38BDF8)',
    component: FlowHeartLogo
  },
  {
    id: 'the_pulse',
    number: '03',
    title: 'The Pulse',
    tagline: 'Living Biometric Rhythm',
    description: 'Heart with a subtle energy line.',
    symbolism: 'Synchronized heartbeats across space and time. Emotional resonance measured in vital sparks.',
    palette: 'Crimson Ember & Neon Pink (#F43F5E → #EC4899)',
    component: PulseHeartLogo
  },
  {
    id: 'the_connection',
    number: '04',
    title: 'The Connection',
    tagline: 'Human Interlock & Trust',
    description: 'A symbol of human connection.',
    symbolism: 'Two independent hands clasping inside an unbroken heart. Unspoken safety and alliance.',
    palette: 'Celestial Sky & Orchid Blush (#38BDF8 → #818CF8 → #F472B6)',
    component: ConnectionHeartLogo
  },
  {
    id: 'the_orbit',
    number: '05',
    title: 'The Orbit',
    tagline: 'Cosmic Gravitational Pull',
    description: 'A universe-inspired symbol surrounding a heart.',
    symbolism: 'Two celestial bodies held in mutual orbit around an emotional core. Cosmic chemistry.',
    palette: 'Electric Cyan & Deep Magenta (#38BDF8 → #A855F7 → #EC4899)',
    component: OrbitHeartLogo
  },
  {
    id: 'the_infinite',
    number: '06',
    title: 'The Infinite Heart',
    tagline: 'Eternal Heart Loop',
    description: 'An elegant infinity heart for endless identities and connections.',
    symbolism: 'A continuous ribbon weaving two hearts into infinite connection and trust.',
    palette: 'Amethyst Violet & Sunset Tangerine (#C084FC → #F43F5E → #FB923C)',
    component: InfiniteHeartLogo
  },
  {
    id: 'the_spark',
    number: '07',
    title: 'The Radiant Heart',
    tagline: 'Warm Beating Resonance',
    description: 'Nested twin hearts glowing with warm starlight resonance.',
    symbolism: 'The exact microsecond of instant chemistry when two hearts pulse in unison.',
    palette: 'Solar Amber & Starlight Gold (#FDE68A → #F59E0B → #F43F5E)',
    component: SparkHeartLogo
  },
  {
    id: 'the_sanctuary',
    number: '08',
    title: 'The Prism',
    tagline: 'Multidimensional Architecture',
    description: 'Faceted multidimensional diamond heart of intimate authenticity.',
    symbolism: 'Refracting the many facets of human personality into a single harmonic sanctuary.',
    palette: 'Diamond Rose & Golden Amber (#FFFBEB → #B45309)',
    component: SanctuaryHeartLogo
  },
  {
    id: 'official_neon',
    number: '00',
    title: 'Official Neon Ribbon',
    tagline: 'The Master Flagship Identity',
    description: 'Official master Möbius loop of continuous ultraviolet and magenta radiance.',
    symbolism: 'The official master Soulverse identity, glowing in a deep obsidian void.',
    palette: 'Neon Violet to Vivid Rose Magenta',
    component: OfficialNeonHeartLogo
  }
];

/* ========================================================================= */
/* 4. MASTER BRAND LOGO COMPONENT                                            */
/* ========================================================================= */

export interface SoulverseBrandLogoProps extends HeartLogoProps {
  variant?: HeartLogoVariant;
  showWordmark?: boolean;
  wordmarkClassName?: string;
  wordmarkSubtitle?: string;
}

export const SoulverseBrandLogo: React.FC<SoulverseBrandLogoProps> = ({
  variant = 'official_neon',
  size = 40,
  className = '',
  showGlow = true,
  animated = false,
  showWordmark = false,
  wordmarkClassName = '',
  wordmarkSubtitle
}) => {
  const renderLogo = () => {
    switch (variant) {
      case 'open_heart':
        return <OpenHeartLogo size={size} className={className} showGlow={showGlow} animated={animated} />;
      case 'the_flow':
        return <FlowHeartLogo size={size} className={className} showGlow={showGlow} animated={animated} />;
      case 'the_pulse':
      case 'resonance':
        return <PulseHeartLogo size={size} className={className} showGlow={showGlow} animated={animated} />;
      case 'the_connection':
      case 'twin_souls':
        return <ConnectionHeartLogo size={size} className={className} showGlow={showGlow} animated={animated} />;
      case 'the_orbit':
        return <OrbitHeartLogo size={size} className={className} showGlow={showGlow} animated={animated} />;
      case 'the_infinite':
      case 'infinity':
        return <InfiniteHeartLogo size={size} className={className} showGlow={showGlow} animated={animated} />;
      case 'the_spark':
      case 'compass':
        return <SparkHeartLogo size={size} className={className} showGlow={showGlow} animated={animated} />;
      case 'the_sanctuary':
      case 'crystal':
        return <SanctuaryHeartLogo size={size} className={className} showGlow={showGlow} animated={animated} />;
      case 'official_neon':
      default:
        return <OfficialNeonHeartLogo size={size} className={className} showGlow={showGlow} animated={animated} />;
    }
  };

  if (!showWordmark) {
    return renderLogo();
  }

  return (
    <div className="flex items-center gap-3 select-none group">
      <div className="relative flex items-center justify-center">
        {renderLogo()}
      </div>
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5">
          <span className={`font-heading font-extrabold tracking-tight text-white ${wordmarkClassName || 'text-xl'}`}>
            Soulverse
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_8px_#F59E0B]" />
        </div>
        {wordmarkSubtitle && (
          <span className="text-[11px] font-medium tracking-wider uppercase text-zinc-400 -mt-0.5">
            {wordmarkSubtitle}
          </span>
        )}
      </div>
    </div>
  );
};
