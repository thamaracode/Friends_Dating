import React, { useState, useRef, useCallback, useEffect } from 'react';

export interface VerticalGestureSwiperProps<T> {
  items: T[];
  currentIndex: number;
  onIndexChange: (newIndex: number) => void;
  renderItem: (item: T, index: number, isCurrent: boolean) => React.ReactNode;
  thresholdPx?: number;
  enableKeyboard?: boolean;
  className?: string;
}

/**
 * Vertical Gesture Swiper (Klyven Kinetic Physics Engine)
 * Features:
 * - Touch & Pointer tracking with delta-Y interpolation
 * - Kinetic swipe velocity detection (threshold ~65px or rapid flick)
 * - Spring snap transition `cubic-bezier(0.16, 1, 0.3, 1)`
 * - Keyboard Up / Down arrow shortcuts
 */
export function VerticalGestureSwiper<T>({
  items,
  currentIndex,
  onIndexChange,
  renderItem,
  thresholdPx = 65,
  enableKeyboard = true,
  className = '',
}: VerticalGestureSwiperProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dragOffsetY, setDragOffsetY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const touchStartY = useRef<number | null>(null);
  const touchStartTime = useRef<number>(0);

  // Keyboard navigation
  useEffect(() => {
    if (!enableKeyboard) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isAnimating) return;
      if (e.key === 'ArrowDown' || e.key === 'PageDown') {
        e.preventDefault();
        triggerNext();
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault();
        triggerPrev();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, isAnimating, enableKeyboard, items.length]);

  const triggerNext = useCallback(() => {
    if (currentIndex >= items.length - 1 || isAnimating) return;
    setIsAnimating(true);
    const h = containerRef.current?.clientHeight || window.innerHeight;
    setDragOffsetY(-h);
    setTimeout(() => {
      onIndexChange(currentIndex + 1);
      setDragOffsetY(0);
      setIsAnimating(false);
    }, 220);
  }, [currentIndex, isAnimating, items.length, onIndexChange]);

  const triggerPrev = useCallback(() => {
    if (currentIndex <= 0 || isAnimating) return;
    setIsAnimating(true);
    const h = containerRef.current?.clientHeight || window.innerHeight;
    setDragOffsetY(h);
    setTimeout(() => {
      onIndexChange(currentIndex - 1);
      setDragOffsetY(0);
      setIsAnimating(false);
    }, 220);
  }, [currentIndex, isAnimating, onIndexChange]);

  // Touch Handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (isAnimating || e.touches.length !== 1) return;
    touchStartY.current = e.touches[0].clientY;
    touchStartTime.current = Date.now();
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || touchStartY.current === null) return;
    const currentY = e.touches[0].clientY;
    const delta = currentY - touchStartY.current;

    // Resistance at list boundaries
    if ((currentIndex === 0 && delta > 0) || (currentIndex === items.length - 1 && delta < 0)) {
      setDragOffsetY(delta * 0.35);
    } else {
      setDragOffsetY(delta);
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging || touchStartY.current === null) return;
    setIsDragging(false);

    const touchDuration = Date.now() - touchStartTime.current;
    const isFlick = touchDuration < 250 && Math.abs(dragOffsetY) > 30;

    if (dragOffsetY < -thresholdPx || (isFlick && dragOffsetY < 0)) {
      triggerNext();
    } else if (dragOffsetY > thresholdPx || (isFlick && dragOffsetY > 0)) {
      triggerPrev();
    } else {
      // Snap back
      setDragOffsetY(0);
    }
    touchStartY.current = null;
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full overflow-hidden select-none touch-none ${className}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div
        className={`w-full h-full ${isDragging ? '' : 'transition-transform duration-200 ease-out'}`}
        style={{
          transform: `translateY(${dragOffsetY}px)`,
        }}
      >
        {items[currentIndex] && renderItem(items[currentIndex], currentIndex, true)}
      </div>
    </div>
  );
}
