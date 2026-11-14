import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  position?: 'bottom' | 'right';
  children: React.ReactNode;
  className?: string;
}

export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  title,
  position = 'bottom',
  children,
  className = ''
}) => {
  const drawerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex bg-black/75 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        className={`bg-[#12141B] border-white/15 text-white shadow-2xl flex flex-col ${
          position === 'bottom'
            ? 'mt-auto w-full max-h-[85vh] rounded-t-3xl border-t animate-slideUp'
            : 'ml-auto h-full w-full max-w-md border-l animate-slideLeft'
        } ${className}`}
      >
        {/* Top Drag Handle (Mobile Bottom Sheet) */}
        {position === 'bottom' && (
          <div className="pt-3 pb-1 flex justify-center">
            <span className="w-10 h-1.5 rounded-full bg-white/20" />
          </div>
        )}

        {/* Header Bar */}
        {title && (
          <div className="px-5 py-3.5 border-b border-white/[0.08] flex items-center justify-between">
            <h3 className="text-base font-bold text-white tracking-tight">{title}</h3>
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Scrollable Content Body */}
        <div className="p-5 overflow-y-auto no-scrollbar flex-1">{children}</div>
      </div>
    </div>
  );
};
