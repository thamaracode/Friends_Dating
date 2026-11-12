import React from 'react';

export interface GlassInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

/**
 * Frosted Glass Input Field (Klyven × Soulverse Titanium Glass)
 * Features:
 * - 16px backdrop-filter blur
 * - Specular silver focus ring & ambient glow
 * - Embedded left/right icon slots (44px touch ergonomics)
 * - Accessible high-contrast error and hint states
 */
export const GlassInput: React.FC<GlassInputProps> = ({
  label,
  error,
  hint,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  id,
  ...props
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full space-y-1.5 text-left">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-bold text-zinc-200 tracking-wide">
          {label}
        </label>
      )}

      <div className="relative flex items-center">
        {leftIcon && (
          <div className="absolute left-3.5 text-zinc-400 pointer-events-none flex items-center">
            {leftIcon}
          </div>
        )}

        <input
          id={inputId}
          disabled={disabled}
          className={`w-full py-2.5 px-4 rounded-xl text-sm text-zinc-100 placeholder-zinc-500 glass-input outline-none transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] ${
            leftIcon ? 'pl-10' : ''
          } ${rightIcon ? 'pr-10' : ''} ${
            error
              ? 'border-red-500/60 focus:border-red-400 shadow-[0_0_12px_rgba(239,68,68,0.20)]'
              : 'focus:border-white/40 focus:shadow-[0_0_16px_rgba(255,255,255,0.15)]'
          } ${className}`}
          {...props}
        />

        {rightIcon && (
          <div className="absolute right-3.5 text-zinc-400 flex items-center">
            {rightIcon}
          </div>
        )}
      </div>

      {error ? (
        <p className="text-[11px] font-mono text-red-400 font-medium">{error}</p>
      ) : hint ? (
        <p className="text-[11px] font-mono text-zinc-400">{hint}</p>
      ) : null}
    </div>
  );
};
