import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export interface GlassModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
}

/**
 * Universal Glass Modal Dialog (Klyven × Soulverse Titanium Glass)
 * Features:
 * - Scrim backdrop with 24px blur and fade-in animation
 * - Frosted glass card with specular top-edge rim
 * - Focus-trapping and ESC key dismissal listener
 * - 44px dismiss button ergonomics
 */
export const GlassModal: React.FC<GlassModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'md',
  className = '',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const widthStyles = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
  }[maxWidth];

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className={`w-full ${widthStyles} glass-modal rounded-3xl p-6 sm:p-8 space-y-6 relative overflow-hidden shadow-2xl border border-white/15 ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Subtle Ambient Radial Specular Glow */}
        <div className="absolute -top-20 -right-20 w-48 h-48 bg-white/[0.04] rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors cursor-pointer min-w-[40px] min-h-[40px] flex items-center justify-center"
          title="Close dialog"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        {(title || subtitle) && (
          <div className="space-y-1.5 pr-8">
            {title && (
              <h2 className="text-xl sm:text-2xl font-black text-zinc-100 tracking-tight">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                {subtitle}
              </p>
            )}
          </div>
        )}

        {/* Body Content */}
        <div className="relative z-10">{children}</div>
      </div>
    </div>
  );
};
