import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'glass' | 'elevated' | 'interactive' | 'flat' | 'outline';
  padding?: 'none' | 'compact' | 'standard' | 'spacious';
  as?: 'div' | 'article' | 'section';
}

export const Card: React.FC<CardProps> = ({
  variant = 'glass',
  padding = 'standard',
  as: Component = 'div',
  className = '',
  children,
  ...props
}) => {
  const variantStyles = {
    glass: 'bg-[#12141B]/75 backdrop-blur-xl border border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.4)]',
    elevated: 'bg-[#181B24]/90 backdrop-blur-2xl border border-white/15 shadow-[0_16px_48px_rgba(0,0,0,0.6)]',
    interactive: 'bg-[#12141B]/75 backdrop-blur-xl border border-white/[0.08] hover:border-amber-400/30 hover:bg-[#181B24]/90 transition-all duration-200 cursor-pointer hover:shadow-[0_12px_40px_rgba(0,0,0,0.5)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/50 active:scale-[0.99] motion-reduce:transition-none',
    flat: 'bg-[#12141B] border border-white/[0.06]',
    outline: 'bg-transparent border border-white/15'
  };

  const paddingStyles = {
    none: 'p-0',
    compact: 'p-3 sm:p-4',
    standard: 'p-4 sm:p-6',
    spacious: 'p-6 sm:p-8'
  };

  return (
    <Component
      className={`rounded-3xl relative overflow-hidden text-zinc-100 ${variantStyles[variant]} ${paddingStyles[padding]} ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
};

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className = '',
  children,
  ...props
}) => (
  <div className={`flex flex-col space-y-1.5 mb-4 ${className}`} {...props}>
    {children}
  </div>
);

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  className = '',
  children,
  ...props
}) => (
  <h3 className={`text-lg sm:text-xl font-heading font-bold text-white tracking-tight ${className}`} {...props}>
    {children}
  </h3>
);

export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({
  className = '',
  children,
  ...props
}) => (
  <p className={`text-xs sm:text-sm text-zinc-400 leading-relaxed ${className}`} {...props}>
    {children}
  </p>
);

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className = '',
  children,
  ...props
}) => (
  <div className={`space-y-3 ${className}`} {...props}>
    {children}
  </div>
);

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className = '',
  children,
  ...props
}) => (
  <div className={`mt-5 pt-4 border-t border-white/[0.06] flex items-center justify-between gap-3 text-xs text-zinc-400 ${className}`} {...props}>
    {children}
  </div>
);
