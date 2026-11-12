import React, { useRef } from 'react';
import { NavigationPill } from '../navigation/NavigationPill';

export interface PillOption {
  id: string;
  label: string;
  count?: number;
  icon?: React.ReactNode;
}

export interface HorizontalPillBarProps {
  options: PillOption[];
  selectedId: string;
  onSelect: (id: string) => void;
  className?: string;
}

/**
 * Touch-Scrollable Horizontal Pill Bar (Klyven × Soulverse)
 * Sleek filter carousel with frictionless horizontal scrolling and edge fade.
 */
export const HorizontalPillBar: React.FC<HorizontalPillBarProps> = ({
  options,
  selectedId,
  onSelect,
  className = '',
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <div className={`relative w-full overflow-hidden ${className}`}>
      <div
        ref={scrollRef}
        className="flex items-center space-x-2 overflow-x-auto no-scrollbar py-1 px-1 scroll-smooth"
      >
        {options.map((opt) => (
          <NavigationPill
            key={opt.id}
            label={opt.label}
            count={opt.count}
            icon={opt.icon}
            active={selectedId === opt.id}
            onClick={() => onSelect(opt.id)}
          />
        ))}
      </div>
    </div>
  );
};
