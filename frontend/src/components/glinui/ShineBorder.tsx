import React from 'react';

export interface ShineBorderProps {
  borderWidth?: number;
  duration?: number;
  shineColor?: string;
  className?: string;
  children: React.ReactNode;
}

/**
 * GlinUI ShineBorder: Iridescent continuous gradient light drift around a glass panel
 * Adapted from @glinui/ui shine-border
 */
export const ShineBorder: React.FC<ShineBorderProps> = ({
  borderWidth = 1.5,
  duration = 8,
  shineColor = 'rgba(246, 193, 56, 0.85)',
  className = '',
  children
}) => {
  return (
    <div className={`relative isolate rounded-2xl p-[1px] ${className}`}>
      {/* Moving Shine Edge */}
      <div
        className="pointer-events-none absolute inset-0 size-full rounded-[inherit] will-change-[background-position]"
        style={{
          padding: `${borderWidth}px`,
          backgroundSize: '300% 300%',
          backgroundImage: `radial-gradient(circle at center, ${shineColor}, rgba(255, 255, 255, 0.7) 35%, transparent 70%)`,
          animation: `glinShineDrift ${duration}s linear infinite`,
          mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          maskComposite: 'exclude',
          WebkitMaskComposite: 'xor'
        }}
      />
      {children}
    </div>
  );
};
