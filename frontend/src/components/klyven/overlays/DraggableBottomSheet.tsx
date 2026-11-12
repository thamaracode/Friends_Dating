import React, { useRef, useState, useEffect } from 'react';

export interface DraggableBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  heightClass?: string;
  className?: string;
}

/**
 * Draggable Frosted Glass Bottom Sheet (Klyven × Soulverse)
 * Features:
 * - Touch drag-to-dismiss gesture physics (`sheetDragY`)
 * - Visual grab handle indicator
 * - 32px top-edge rounded glass panel with specular highlight
 * - Smooth spring transition snap-back on release
 */
export const DraggableBottomSheet: React.FC<DraggableBottomSheetProps> = ({
  isOpen,
  onClose,
  title,
  children,
  heightClass = 'h-[72vh] sm:h-[65vh]',
  className = '',
}) => {
  const [sheetDragY, setSheetDragY] = useState(0);
  const touchStartY = useRef<number | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setSheetDragY(0);
      touchStartY.current = null;
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      touchStartY.current = e.touches[0].clientY;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartY.current !== null && e.touches.length === 1) {
      const delta = e.touches[0].clientY - touchStartY.current;
      if (delta > 0) {
        setSheetDragY(delta);
      }
    }
  };

  const handleTouchEnd = () => {
    if (sheetDragY > 90) {
      onClose();
    }
    setSheetDragY(0);
    touchStartY.current = null;
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex flex-col justify-end animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className={`w-full max-w-2xl mx-auto ${heightClass} glass-modal border-t border-x border-white/15 rounded-t-[32px] shadow-[0_-16px_60px_rgba(0,0,0,0.95)] flex flex-col overflow-hidden transition-transform duration-75 pb-safe ${className}`}
        style={{ transform: `translateY(${sheetDragY}px)` }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Grab Handle Header */}
        <div
          className="w-full pt-3 pb-2 flex flex-col items-center cursor-grab active:cursor-grabbing select-none"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="w-12 h-1.5 bg-white/20 rounded-full hover:bg-white/30 transition-colors" />
        </div>

        {/* Title Bar */}
        {title && (
          <div
            className="px-5 pb-3 flex items-center justify-between border-b border-white/10 select-none"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <h3 className="text-base sm:text-lg font-black text-zinc-100 tracking-tight">{title}</h3>
          </div>
        )}

        {/* Sheet Content Area */}
        <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">{children}</div>
      </div>
    </div>
  );
};
