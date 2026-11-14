import React from 'react';

export type HeartLogoVariant = 'infinity' | 'compass' | 'twin_souls' | 'crystal' | 'resonance';

interface HeartLogoProps {
  size?: number | string;
  className?: string;
  showGlow?: boolean;
  animated?: boolean;
}

/**
 * CONCEPT 1: The Cosmic Infinity Heart (Resonance & Eternity)
 * Continuous ribbon loop weaving infinity (∞) into an unbroken heart contour.
 */
export const InfinityOrbitHeartLogo: React.FC<HeartLogoProps> = ({
  size = 40,
  className = '',
  showGlow = true,
  animated = false
}) => {
  const idPrefix = 'inf_heart_' + Math.random().toString(36).substring(2, 7);
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
        <linearGradient id={`${idPrefix}_gold`} x1="10%" y1="10%" x2="90%" y2="90%">
          <stop offset="0%" stopColor="#FDE68A" />
          <stop offset="35%" stopColor="#F59E0B" />
          <stop offset="70%" stopColor="#D97706" />
          <stop offset="100%" stopColor="#F43F5E" />
        </linearGradient>
        <linearGradient id={`${idPrefix}_rose`} x1="85%" y1="15%" x2="15%" y2="85%">
          <stop offset="0%" stopColor="#FB7185" />
          <stop offset="50%" stopColor="#EC4899" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>
        <filter id={`${idPrefix}_glow`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {showGlow && (
        <circle cx="50" cy="50" r="32" fill="#F59E0B" opacity="0.18" filter="blur(14px)" />
      )}

      {/* Primary Outer Heart Contour */}
      <path
        d="M 50 84 C 44 78 16 54 16 34 C 16 20 26 12 38 12 C 45 12 49 15 50 19 C 51 15 55 12 62 12 C 74 12 84 20 84 34 C 84 54 56 78 50 84 Z"
        stroke={`url(#${idPrefix}_gold)`}
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter={showGlow ? `url(#${idPrefix}_glow)` : undefined}
      />

      {/* Internal Infinity Harmonic Flow */}
      <path
        d="M 32 38 C 32 50 68 46 68 58 C 68 66 60 70 50 70 C 40 70 32 66 32 58 C 32 46 68 50 68 38 C 68 30 60 26 50 26 C 42 26 34 30 32 38 Z"
        stroke={`url(#${idPrefix}_rose)`}
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray="4 2"
        opacity="0.9"
      />

      {/* Luminous Core Star */}
      <circle cx="50" cy="48" r="2.8" fill="#FFFBEB" filter="drop-shadow(0 0 6px #F59E0B)" />
    </svg>
  );
};

/**
 * CONCEPT 2: The Celestial Compass Heart (Love as Your True North)
 * Fuses the heart contour with an ascending 4-point celestial star.
 */
export const CelestialCompassHeartLogo: React.FC<HeartLogoProps> = ({
  size = 40,
  className = '',
  showGlow = true,
  animated = false
}) => {
  const idPrefix = 'comp_heart_' + Math.random().toString(36).substring(2, 7);
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
        <linearGradient id={`${idPrefix}_grad`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FDE68A" />
          <stop offset="40%" stopColor="#F59E0B" />
          <stop offset="75%" stopColor="#D97706" />
          <stop offset="100%" stopColor="#6366F1" />
        </linearGradient>
        <filter id={`${idPrefix}_glow`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {showGlow && (
        <circle cx="50" cy="48" r="30" fill="#F59E0B" opacity="0.22" filter="blur(16px)" />
      )}

      {/* Left Sweeping Heart Wing */}
      <path
        d="M 50 84 C 28 66 16 48 16 32 C 16 18 26 12 37 12 C 44 12 48 15 50 20"
        stroke={`url(#${idPrefix}_grad)`}
        strokeWidth="5"
        strokeLinecap="round"
        filter={showGlow ? `url(#${idPrefix}_glow)` : undefined}
      />

      {/* Right Sweeping Heart Wing with Star Anchor */}
      <path
        d="M 50 20 C 52 15 56 12 63 12 C 74 12 84 18 84 32 C 84 48 72 66 50 84"
        stroke={`url(#${idPrefix}_grad)`}
        strokeWidth="5"
        strokeLinecap="round"
        filter={showGlow ? `url(#${idPrefix}_glow)` : undefined}
      />

      {/* Celestial 4-Point Compass Star in Center Sanctuary */}
      <path
        d="M 50 26 L 52.5 35.5 L 62 38 L 52.5 40.5 L 50 50 L 47.5 40.5 L 38 38 L 47.5 35.5 Z"
        fill="#FFFBEB"
        filter="drop-shadow(0 0 8px #F59E0B)"
      />

      {/* Micro Orbital Ring */}
      <circle
        cx="50"
        cy="38"
        r="14"
        stroke="#FDE68A"
        strokeWidth="1.2"
        strokeDasharray="2 3"
        opacity="0.6"
      />
    </svg>
  );
};

/**
 * CONCEPT 3: Twin Souls Embrace (Two Interlocking Crescents)
 * Two individual souls meeting in a mutual heart embrace with a luminous nexus.
 */
export const TwinSoulsEmbraceLogo: React.FC<HeartLogoProps> = ({
  size = 40,
  className = '',
  showGlow = true,
  animated = false
}) => {
  const idPrefix = 'twin_' + Math.random().toString(36).substring(2, 7);
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
        <linearGradient id={`${idPrefix}_left`} x1="0%" y1="10%" x2="90%" y2="100%">
          <stop offset="0%" stopColor="#FDE68A" />
          <stop offset="50%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>
        <linearGradient id={`${idPrefix}_right`} x1="100%" y1="10%" x2="10%" y2="100%">
          <stop offset="0%" stopColor="#F43F5E" />
          <stop offset="50%" stopColor="#E11D48" />
          <stop offset="100%" stopColor="#F59E0B" />
        </linearGradient>
        <filter id={`${idPrefix}_glow`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {showGlow && (
        <circle cx="50" cy="48" r="30" fill="#F59E0B" opacity="0.2" filter="blur(16px)" />
      )}

      {/* Left Soul Crescent */}
      <path
        d="M 50 82 C 34 70 18 52 18 34 C 18 18 30 12 40 12 C 46 12 49 15 50 20 C 47 28 41 40 41 52 C 41 64 46 75 50 82 Z"
        fill={`url(#${idPrefix}_left)`}
        opacity="0.9"
        filter={showGlow ? `url(#${idPrefix}_glow)` : undefined}
      />

      {/* Right Soul Crescent */}
      <path
        d="M 50 82 C 66 70 82 52 82 34 C 82 18 70 12 60 12 C 54 12 51 15 50 20 C 53 28 59 40 59 52 C 59 64 54 75 50 82 Z"
        fill={`url(#${idPrefix}_right)`}
        opacity="0.85"
        filter={showGlow ? `url(#${idPrefix}_glow)` : undefined}
      />

      {/* Heart Center Diamond Spark */}
      <polygon
        points="50,42 54,49 61,50 54,51 50,58 46,51 39,50 46,49"
        fill="#FFFFFF"
        filter="drop-shadow(0 0 6px #F59E0B)"
      />
    </svg>
  );
};

/**
 * CONCEPT 4: Prism Crystal Heart (Faceted Luxury Origami Jewel)
 * High-end architectural faceted heart with shimmering golden planes.
 */
export const PrismCrystalHeartLogo: React.FC<HeartLogoProps> = ({
  size = 40,
  className = '',
  showGlow = true,
  animated = false
}) => {
  const idPrefix = 'prism_' + Math.random().toString(36).substring(2, 7);
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
        <linearGradient id={`${idPrefix}_light`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFBEB" />
          <stop offset="100%" stopColor="#F59E0B" />
        </linearGradient>
        <linearGradient id={`${idPrefix}_mid`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>
        <linearGradient id={`${idPrefix}_dark`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#B45309" />
          <stop offset="100%" stopColor="#78350F" />
        </linearGradient>
      </defs>

      {showGlow && (
        <circle cx="50" cy="50" r="32" fill="#F59E0B" opacity="0.25" filter="blur(16px)" />
      )}

      {/* Top Left Facet */}
      <polygon points="50,26 28,14 16,32" fill={`url(#${idPrefix}_mid)`} opacity="0.9" />
      {/* Top Right Facet */}
      <polygon points="50,26 72,14 84,32" fill={`url(#${idPrefix}_light)`} opacity="0.95" />
      {/* Center Top Diamond */}
      <polygon points="50,26 64,48 50,62 36,48" fill={`url(#${idPrefix}_light)`} />
      {/* Left Upper Flank */}
      <polygon points="16,32 28,14 50,26 36,48" fill={`url(#${idPrefix}_dark)`} opacity="0.85" />
      {/* Right Upper Flank */}
      <polygon points="84,32 72,14 50,26 64,48" fill={`url(#${idPrefix}_mid)`} opacity="0.9" />
      {/* Left Mid Flank */}
      <polygon points="16,32 36,48 26,66" fill={`url(#${idPrefix}_mid)`} opacity="0.8" />
      {/* Right Mid Flank */}
      <polygon points="84,32 64,48 74,66" fill={`url(#${idPrefix}_dark)`} opacity="0.85" />
      {/* Bottom Left Apex */}
      <polygon points="36,48 50,62 50,84 26,66" fill={`url(#${idPrefix}_dark)`} />
      {/* Bottom Right Apex */}
      <polygon points="64,48 50,62 50,84 74,66" fill={`url(#${idPrefix}_mid)`} />

      {/* Golden Contour Overlay */}
      <path
        d="M 50 84 L 26 66 L 16 32 L 28 14 L 50 26 L 72 14 L 84 32 L 74 66 Z"
        stroke="#FEF3C7"
        strokeWidth="1.2"
        strokeLinejoin="round"
        opacity="0.8"
      />
    </svg>
  );
};

/**
 * CONCEPT 5: Resonance Wave Heart (Living Pulse & Emotional Sync)
 * Minimalist fluid heart enclosing a synchronized emotional heartbeat frequency.
 */
export const ResonanceWaveHeartLogo: React.FC<HeartLogoProps> = ({
  size = 40,
  className = '',
  showGlow = true,
  animated = false
}) => {
  const idPrefix = 'wave_' + Math.random().toString(36).substring(2, 7);
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
        <linearGradient id={`${idPrefix}_grad`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FDE68A" />
          <stop offset="50%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#F43F5E" />
        </linearGradient>
        <filter id={`${idPrefix}_glow`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {showGlow && (
        <circle cx="50" cy="50" r="30" fill="#F43F5E" opacity="0.2" filter="blur(16px)" />
      )}

      {/* Ambient Heart Boundary */}
      <path
        d="M 50 84 C 44 78 16 54 16 34 C 16 20 26 12 38 12 C 45 12 49 15 50 19 C 51 15 55 12 62 12 C 74 12 84 20 84 34 C 84 54 56 78 50 84 Z"
        stroke={`url(#${idPrefix}_grad)`}
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.85"
        filter={showGlow ? `url(#${idPrefix}_glow)` : undefined}
      />

      {/* Internal Biometric Pulse / Soundwave Line */}
      <path
        d="M 22 48 L 36 48 L 40 38 L 45 58 L 49 30 L 53 66 L 57 42 L 61 52 L 65 48 L 78 48"
        stroke="#FFFBEB"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="drop-shadow(0 0 6px #F59E0B)"
      />

      {/* Pulse Peak Spark */}
      <circle cx="49" cy="30" r="2.4" fill="#F43F5E" filter="drop-shadow(0 0 5px #F43F5E)" />
    </svg>
  );
};

/**
 * MASTER SOULVERSE BRAND LOGO COMPONENT
 * Allows seamless switching between all 5 heart logo variants across the entire application.
 */
export interface SoulverseBrandLogoProps extends HeartLogoProps {
  variant?: HeartLogoVariant;
  showWordmark?: boolean;
  wordmarkClassName?: string;
  wordmarkSubtitle?: string;
}

export const SoulverseBrandLogo: React.FC<SoulverseBrandLogoProps> = ({
  variant = 'infinity',
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
      case 'infinity':
        return <InfinityOrbitHeartLogo size={size} className={className} showGlow={showGlow} animated={animated} />;
      case 'compass':
        return <CelestialCompassHeartLogo size={size} className={className} showGlow={showGlow} animated={animated} />;
      case 'twin_souls':
        return <TwinSoulsEmbraceLogo size={size} className={className} showGlow={showGlow} animated={animated} />;
      case 'crystal':
        return <PrismCrystalHeartLogo size={size} className={className} showGlow={showGlow} animated={animated} />;
      case 'resonance':
        return <ResonanceWaveHeartLogo size={size} className={className} showGlow={showGlow} animated={animated} />;
      default:
        return <InfinityOrbitHeartLogo size={size} className={className} showGlow={showGlow} animated={animated} />;
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
