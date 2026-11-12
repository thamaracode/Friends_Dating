import React from 'react';
import { Minimize2 } from 'lucide-react';

export interface ExitFullscreenButtonProps {
  onExit: () => void;
  className?: string;
}

/**
 * Floating Exit Fullscreen Button
 * Translucent escape pill with high-contrast indicator for immersive full-screen viewports.
 */
export const ExitFullscreenButton: React.FC<ExitFullscreenButtonProps> = ({
  onExit,
  className = '',
}) => {
  return (
    <button
      onClick={onExit}
      className={`fixed top-4 right-4 z-50 flex items-center space-x-2 px-3.5 py-2 rounded-full glass-floating-btn text-zinc-200 hover:text-white text-xs font-bold cursor-pointer transition-all active:scale-[0.96] shadow-xl min-h-[44px] ${className}`}
      title="Exit Fullscreen"
    >
      <Minimize2 className="w-4 h-4" />
      <span>Exit Fullscreen</span>
    </button>
  );
};
