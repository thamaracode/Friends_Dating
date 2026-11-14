import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className = ''
}) => {
  return (
    <div className={`p-8 sm:p-12 text-center rounded-3xl bg-[#12141B]/60 border border-white/[0.06] backdrop-blur-xl flex flex-col items-center justify-center space-y-4 max-w-md mx-auto ${className}`}>
      {icon && (
        <div className="w-14 h-14 rounded-2xl bg-amber-400/10 border border-amber-400/20 text-amber-400 flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.15)]">
          {icon}
        </div>
      )}

      <div className="space-y-1.5">
        <h4 className="text-base sm:text-lg font-heading font-bold text-white tracking-tight">
          {title}
        </h4>
        <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed max-w-sm">
          {description}
        </p>
      </div>

      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-2 h-10 px-5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-zinc-950 font-bold text-xs sm:text-sm shadow-lg shadow-amber-400/20 transition-all cursor-pointer active:scale-95"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export interface SkeletonProps {
  variant?: 'card' | 'line' | 'avatar' | 'profile';
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'line',
  className = ''
}) => {
  if (variant === 'avatar') {
    return (
      <div className={`w-12 h-12 rounded-full bg-white/[0.06] animate-pulse border border-white/[0.04] ${className}`} />
    );
  }

  if (variant === 'card') {
    return (
      <div className={`p-5 rounded-3xl bg-[#12141B]/80 border border-white/[0.06] space-y-4 animate-pulse ${className}`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/[0.08]" />
          <div className="space-y-1.5 flex-1">
            <div className="w-1/3 h-3.5 bg-white/[0.08] rounded-md" />
            <div className="w-1/4 h-2.5 bg-white/[0.05] rounded-md" />
          </div>
        </div>
        <div className="w-full h-16 bg-white/[0.05] rounded-xl" />
        <div className="flex gap-2">
          <div className="w-16 h-6 bg-white/[0.06] rounded-full" />
          <div className="w-20 h-6 bg-white/[0.06] rounded-full" />
        </div>
      </div>
    );
  }

  if (variant === 'profile') {
    return (
      <div className={`rounded-3xl overflow-hidden bg-[#12141B]/80 border border-white/[0.06] animate-pulse ${className}`}>
        <div className="h-44 bg-white/[0.06]" />
        <div className="p-6 space-y-4 -mt-12">
          <div className="w-24 h-24 rounded-full bg-white/[0.1] border-4 border-[#12141B]" />
          <div className="w-1/3 h-6 bg-white/[0.08] rounded-md" />
          <div className="w-full h-12 bg-white/[0.04] rounded-md" />
        </div>
      </div>
    );
  }

  return (
    <div className={`h-4 bg-white/[0.07] rounded-md animate-pulse ${className}`} />
  );
};

export interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something unexpected occurred',
  message,
  onRetry,
  className = ''
}) => {
  return (
    <div className={`p-6 rounded-3xl bg-rose-950/20 border border-rose-500/20 text-center flex flex-col items-center space-y-3 max-w-md mx-auto ${className}`}>
      <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center">
        <AlertCircle className="w-5 h-5" />
      </div>
      <div className="space-y-1">
        <h4 className="text-sm font-bold text-white">{title}</h4>
        <p className="text-xs text-rose-300 leading-relaxed">{message}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-2 h-9 px-4 rounded-xl bg-white/[0.08] hover:bg-white/15 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Retry Operation</span>
        </button>
      )}
    </div>
  );
};
