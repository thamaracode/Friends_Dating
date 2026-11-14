import React, { forwardRef } from 'react';

export interface GlassInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
  endAdornment?: React.ReactNode;
}

export const GlassInput = forwardRef<HTMLInputElement, GlassInputProps>(
  ({ icon, endAdornment, className = '', ...props }, ref) => {
    return (
      <div className="relative flex items-center w-full">
        {icon && (
          <div className="absolute left-3.5 text-zinc-400 pointer-events-none flex items-center">
            {icon}
          </div>
        )}
        <input
          ref={ref}
          className={`w-full h-11 glin-glass-well text-zinc-100 placeholder-zinc-500 text-sm rounded-xl px-3.5 transition-all duration-200 outline-none focus:border-amber-400/40 focus:ring-2 focus:ring-amber-400/20 ${
            icon ? 'pl-10' : ''
          } ${endAdornment ? 'pr-10' : ''} ${className}`}
          {...props}
        />
        {endAdornment && (
          <div className="absolute right-3.5 text-zinc-400 flex items-center">
            {endAdornment}
          </div>
        )}
      </div>
    );
  }
);

GlassInput.displayName = 'GlassInput';
