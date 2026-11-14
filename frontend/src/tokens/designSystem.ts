/**
 * SOULVERSE CENTRALIZED DESIGN SYSTEM TOKENS
 * 
 * Implements Master Engineering Directive:
 * - 10-step global spacing system (4px to 64px)
 * - Centralized typography scale (Hero, Page, Section, Card, Body, Supporting, Metadata)
 * - Mature Obsidian & Titanium Glass palette with selective, restrained Gold accents
 * - Standardized component geometry (Card radius, button height, touch targets, card padding)
 * - Responsive breakpoints for mobile-first social experience
 */

export const SPACING = {
  micro: 4,        // 4px: micro spacing, icon-to-badge gaps, tag margins
  compact: 8,      // 8px: compact spacing, button internal gaps, chip gaps
  small: 12,       // 12px: small spacing, list item inner gaps
  standard: 16,    // 16px: standard spacing, default component margins
  comfortable: 20, // 20px: comfortable spacing, relaxed card headers
  cardPadding: 24, // 24px: card and screen horizontal padding
  section: 32,     // 32px: section separation
  major: 40,       // 40px: major content separation
  large: 48,       // 48px: large visual separation
  transition: 64   // 64px: major page transitions and footer margins
} as const;

export const TYPOGRAPHY = {
  fonts: {
    heading: "'Plus Jakarta Sans', 'Manrope', -apple-system, BlinkMacSystemFont, sans-serif",
    body: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    editorial: "'Playfair Display', 'Lora', Georgia, serif",
    mono: "'JetBrains Mono', 'SF Mono', Menlo, monospace"
  },
  scale: {
    hero: {
      fontSize: 'clamp(2rem, 4vw, 2.5rem)', // 32px – 40px
      lineHeight: '1.15',
      letterSpacing: '-0.025em',
      fontWeight: '800'
    },
    pageHeading: {
      fontSize: 'clamp(1.75rem, 3vw, 2.125rem)', // 28px – 34px
      lineHeight: '1.25',
      letterSpacing: '-0.02em',
      fontWeight: '700'
    },
    sectionHeading: {
      fontSize: '1.4375rem', // 21px – 25px (23px average)
      lineHeight: '1.35',
      letterSpacing: '-0.015em',
      fontWeight: '700'
    },
    cardHeading: {
      fontSize: '1.125rem', // 17px – 20px (18px average)
      lineHeight: '1.4',
      letterSpacing: '-0.01em',
      fontWeight: '600'
    },
    body: {
      fontSize: '1rem', // 15px – 17px (16px base)
      lineHeight: '1.6',
      letterSpacing: '0',
      fontWeight: '400'
    },
    supporting: {
      fontSize: '0.875rem', // 13px – 14px (14px standard)
      lineHeight: '1.5',
      letterSpacing: '0',
      fontWeight: '400'
    },
    metadata: {
      fontSize: '0.75rem', // 12px metadata limit
      lineHeight: '1.4',
      letterSpacing: '0.02em',
      fontWeight: '500'
    }
  }
} as const;

export const COLORS = {
  bg: {
    primary: '#090A0E',      // Deep Obsidian Void
    secondary: '#12141B',    // Card Surface Foundation
    elevated: '#181B24',     // Elevated Modals & Floating Trays
    surface: '#20232E'       // High-contrast interaction surfaces
  },
  glass: {
    panel: 'rgba(18, 20, 27, 0.72)',
    card: 'rgba(16, 18, 24, 0.62)',
    elevated: 'rgba(24, 27, 36, 0.85)',
    borderSubtle: 'rgba(255, 255, 255, 0.08)',
    borderHover: 'rgba(255, 255, 255, 0.20)',
    borderActive: 'rgba(255, 255, 255, 0.35)',
    specular: 'inset 0 1px 1px 0 rgba(255, 255, 255, 0.18)'
  },
  text: {
    primary: '#F9FAFB',      // 98% Light Crisp White
    secondary: '#D1D5DB',    // Soft Neutral Silver
    muted: '#9CA3AF',        // Muted Secondary Text
    subtle: '#6B7280'        // Footers and Inactive Labels
  },
  gold: {
    // Restrained, selective gold accents for highlights and key actions
    50: '#FFFDF5',
    100: '#FEF7DE',
    200: '#FCEBA8',
    300: '#FAD76D',
    400: '#F6C138',          // Accent Highlight
    500: '#E5A817',          // Key Interactive CTA
    600: '#C2830D',
    border: 'rgba(246, 193, 56, 0.24)',
    mutedBg: 'rgba(246, 193, 56, 0.08)',
    glow: '0 0 24px rgba(246, 193, 56, 0.15)'
  }
} as const;

export const COMPONENTS = {
  button: {
    heightPrimary: 44,       // Standard 44px min touch target
    heightHero: 50,          // Hero CTA 50px
    heightCompact: 36,       // Compact Action 36px
    radius: '1rem',          // 16px border-radius
    radiusPill: '9999px'
  },
  input: {
    heightStandard: 48,      // 48px comfortable input
    heightCompact: 40,       // 40px search bar
    radius: '0.875rem'       // 14px border-radius
  },
  card: {
    radiusLarge: '1.5rem',   // 24px rounded-3xl for primary cards
    radiusMedium: '1rem',    // 16px rounded-2xl for inner items
    paddingStandard: '1.5rem', // 24px comfortable padding
    paddingCompact: '1rem'     // 16px compact padding
  },
  icon: {
    hero: 24,
    standard: 20,
    compact: 18,
    metadata: 14
  }
} as const;

export const BREAKPOINTS = {
  mobileSmall: 360,
  mobile: 390,
  mobileLarge: 430,
  tablet: 768,
  desktop: 1024,
  desktopWide: 1440
} as const;
