import React, { useEffect } from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export interface ToastProps {
  id: string;
  message: string;
  type?: 'success' | 'warning' | 'error' | 'info';
  onDismiss: (id: string) => void;
  durationMs?: number;
}

/**
 * Universal Frosted Glass Toast Notification (Klyven × Soulverse)
 * Specular highlight, tactile dismiss trigger, and non-intrusive status indicators.
 */
export const ToastNotification: React.FC<ToastProps> = ({
  id,
  message,
  type = 'info',
  onDismiss,
  durationMs = 4000,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(id), durationMs);
    return () => clearTimeout(timer);
  }, [id, onDismiss, durationMs]);

  const typeConfig = {
    success: {
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
      border: 'border-emerald-500/30',
      glow: 'shadow-[0_8px_32px_rgba(16,185,129,0.25)]',
    },
    warning: {
      icon: <AlertTriangle className="w-4 h-4 text-amber-400" />,
      border: 'border-amber-500/30',
      glow: 'shadow-[0_8px_32px_rgba(245,158,11,0.25)]',
    },
    error: {
      icon: <AlertCircle className="w-4 h-4 text-rose-400" />,
      border: 'border-rose-500/30',
      glow: 'shadow-[0_8px_32px_rgba(239,68,68,0.25)]',
    },
    info: {
      icon: <Info className="w-4 h-4 text-zinc-300" />,
      border: 'border-white/20',
      glow: 'shadow-[0_8px_32px_rgba(255,255,255,0.12)]',
    },
  }[type];

  return (
    <div
      className={`flex items-center space-x-3 px-4 py-3 rounded-2xl glass-modal border ${typeConfig.border} ${typeConfig.glow} select-none transition-all duration-300 animate-in slide-in-from-bottom-4`}
    >
      <div className="shrink-0">{typeConfig.icon}</div>
      <p className="text-xs sm:text-sm font-medium text-zinc-100 flex-1 leading-snug">{message}</p>
      <button
        onClick={() => onDismiss(id)}
        className="p-1 rounded-full text-zinc-400 hover:text-white transition-colors cursor-pointer"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
