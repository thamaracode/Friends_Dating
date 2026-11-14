import React from 'react';
import { User, Sparkles, Heart, Briefcase, BookOpen } from 'lucide-react';

export interface IdentityDimensionOption {
  id: string;
  name: string;
  type: 'real' | 'imaginary' | 'inner' | 'creative' | 'professional';
  tagline: string;
  avatarUrl?: string;
}

export interface IdentitySelectorProps {
  identities: IdentityDimensionOption[];
  activeId: string;
  onSelectIdentity: (id: string) => void;
  className?: string;
}

export const IdentitySelector: React.FC<IdentitySelectorProps> = ({
  identities,
  activeId,
  onSelectIdentity,
  className = ''
}) => {
  const getIcon = (type: IdentityDimensionOption['type']) => {
    switch (type) {
      case 'real':
        return <User className="w-4 h-4 text-emerald-400" />;
      case 'imaginary':
        return <Sparkles className="w-4 h-4 text-indigo-400" />;
      case 'inner':
        return <Heart className="w-4 h-4 text-rose-400" />;
      case 'creative':
        return <BookOpen className="w-4 h-4 text-amber-400" />;
      case 'professional':
        return <Briefcase className="w-4 h-4 text-blue-400" />;
    }
  };

  return (
    <div className={`p-1.5 rounded-2xl bg-[#12141B]/90 backdrop-blur-xl border border-white/[0.08] shadow-lg flex items-center gap-1.5 overflow-x-auto no-scrollbar ${className}`}>
      {identities.map((identity) => {
        const isActive = identity.id === activeId;
        return (
          <button
            key={identity.id}
            onClick={() => onSelectIdentity(identity.id)}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 cursor-pointer select-none shrink-0 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/50 ${
              isActive
                ? 'bg-white/15 text-white shadow-sm border border-white/20'
                : 'text-zinc-400 hover:text-white hover:bg-white/[0.04] border border-transparent'
            }`}
          >
            <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${isActive ? 'bg-white/10' : 'bg-black/30'}`}>
              {getIcon(identity.type)}
            </div>

            <div className="text-left">
              <span className="block font-semibold leading-tight">{identity.name}</span>
              <span className="text-[10px] text-zinc-500 group-hover:text-zinc-400 transition-colors block truncate max-w-[120px]">
                {identity.tagline}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
};
