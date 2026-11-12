import React from 'react';

export interface AmbientPalette {
  colors: [string, string];
  accentHex: string;
  iconBg?: string;
  iconText?: string;
}

export interface WebsiteAmbientCardProps extends React.HTMLAttributes<HTMLDivElement> {
  palette?: AmbientPalette;
  isVisible?: boolean;
}

const DEFAULT_PALETTE: AmbientPalette = {
  colors: ['#3F3F46', '#18181B'],
  accentHex: '#E4E4E7',
  iconBg: 'rgba(255, 255, 255, 0.08)',
  iconText: '#F4F4F5',
};

/**
 * Chromatic Ambient Glass Card (Klyven × Soulverse)
 * Features:
 * - Dynamic dual-color chromatic radial lighting
 * - Soft glowing halos matching world identity
 * - Viewport intersection optimization (zero blur overhead when off-screen)
 * - Specular top-edge rim reflection
 */
export const WebsiteAmbientCard: React.FC<WebsiteAmbientCardProps> = ({
  children,
  palette = DEFAULT_PALETTE,
  isVisible = true,
  className = '',
  style = {},
  ...props
}) => {
  const c1 = palette.colors[0] || palette.accentHex || '#3F3F46';
  const c2 = palette.colors[1] || c1;

  return (
    <div
      className={`relative rounded-3xl overflow-hidden glass-panel border border-white/10 transition-all duration-300 ${className}`}
      style={{
        ...style,
        ...(isVisible
          ? {
              boxShadow: `0 20px 50px -10px rgba(0,0,0,0.8), 0 0 30px ${c1}14, inset 0 1px 1.5px rgba(255,255,255,0.20)`,
            }
          : {}),
      }}
      {...props}
    >
      {/* Dynamic Chromatic Ambient Glow Blob (GPU accelerated) */}
      {isVisible && (
        <div
          className="absolute -top-24 -right-24 w-64 h-64 rounded-full blur-3xl pointer-events-none opacity-25 transition-opacity duration-500"
          style={{
            background: `radial-gradient(circle, ${c1} 0%, ${c2} 70%, transparent 100%)`,
          }}
        />
      )}

      {/* Card Content Surface */}
      <div className="relative z-10 p-5 sm:p-6 flex flex-col h-full">
        {children}
      </div>
    </div>
  );
};
