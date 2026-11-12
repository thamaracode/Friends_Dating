import React, { useRef } from 'react';

export interface DoubleTapHandlerProps {
  onDoubleTap: () => void;
  onSingleTap?: () => void;
  windowMs?: number;
  children: React.ReactNode;
  className?: string;
}

/**
 * Mobile Double Tap Interaction Wrapper (Klyven × Soulverse)
 * Standardized 40ms - 320ms double-tap / click detector.
 * Used for instant heart / reaction animations on profiles and timeline entries.
 */
export const DoubleTapHandler: React.FC<DoubleTapHandlerProps> = ({
  onDoubleTap,
  onSingleTap,
  windowMs = 320,
  children,
  className = '',
}) => {
  const lastTapRef = useRef<number>(0);
  const singleTapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleTouchEnd = () => {
    const now = Date.now();
    const diff = now - lastTapRef.current;

    if (diff < windowMs && diff > 40) {
      if (singleTapTimer.current) clearTimeout(singleTapTimer.current);
      lastTapRef.current = 0;
      onDoubleTap();
    } else {
      lastTapRef.current = now;
      if (onSingleTap) {
        singleTapTimer.current = setTimeout(() => {
          onSingleTap();
        }, windowMs);
      }
    }
  };

  return (
    <div onTouchEnd={handleTouchEnd} className={`select-none ${className}`}>
      {children}
    </div>
  );
};
