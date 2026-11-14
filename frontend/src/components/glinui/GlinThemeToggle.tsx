import React, { useState, useEffect } from 'react';
import { Sparkles, Eye } from 'lucide-react';

export interface GlinThemeToggleProps {
  onOpenShowcase?: () => void;
  className?: string;
}

export const GlinThemeToggle: React.FC<GlinThemeToggleProps> = ({
  onOpenShowcase,
  className = ''
}) => {
  const [isGlassActive, setIsGlassActive] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('soulverse_glin_glass') === 'true';
    }
    return false;
  });

  useEffect(() => {
    if (isGlassActive) {
      document.documentElement.setAttribute('data-glin-theme', 'glass');
      localStorage.setItem('soulverse_glin_glass', 'true');
    } else {
      document.documentElement.removeAttribute('data-glin-theme');
      localStorage.setItem('soulverse_glin_glass', 'false');
    }
  }, [isGlassActive]);

  return (
    <div className={`inline-flex items-center gap-1.5 p-1 rounded-xl bg-white/[0.06] border border-white/10 ${className}`}>
      {/* Toggle Glass Theme Mode */}
      <button
        onClick={() => setIsGlassActive(!isGlassActive)}
        className={`h-8 px-2.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
          isGlassActive
            ? 'glin-glass-liquid text-amber-300 border border-amber-400/40 shadow-[0_0_12px_rgba(245,158,11,0.25)]'
            : 'text-zinc-400 hover:text-white hover:bg-white/5'
        }`}
        title={isGlassActive ? 'GlinUI Liquid Glass Theme Active' : 'Switch to GlinUI Liquid Glass Theme'}
      >
        <Sparkles className={`w-3.5 h-3.5 ${isGlassActive ? 'text-amber-300 animate-spin-slow' : 'text-zinc-400'}`} />
        <span className="hidden md:inline">{isGlassActive ? 'Glass On' : 'Glass UI'}</span>
      </button>

      {/* Open Interactive GlinUI Playground / Showcase */}
      {onOpenShowcase && (
        <button
          onClick={onOpenShowcase}
          className="h-8 w-8 rounded-lg text-zinc-400 hover:text-amber-300 hover:bg-white/5 flex items-center justify-center transition-colors cursor-pointer"
          title="Open GlinUI Liquid Glass Gallery & Components"
        >
          <Eye className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};
