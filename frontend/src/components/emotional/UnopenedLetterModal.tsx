import React, { useState } from 'react';
import { Mail, Heart, X, Check } from 'lucide-react';
import { GlassModal, GlassButton } from '../klyven';
import { UNOPENED_LETTERS_POOL } from '../../services/emotionalContentEngine';
import type { UnopenedLetter } from '../../types/emotionalUniverse';
import { SOULVERSE_ALL_LOGOS, type HeartLogoVariant } from '../brand/SoulverseHeartLogos';

interface UnopenedLetterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UnopenedLetterModal: React.FC<UnopenedLetterModalProps> = ({
  isOpen,
  onClose
}) => {
  const [letterIndex, setLetterIndex] = useState(0);
  const [activeSeal, setActiveSeal] = useState<HeartLogoVariant>('open_heart');
  const letter: UnopenedLetter = UNOPENED_LETTERS_POOL[letterIndex % UNOPENED_LETTERS_POOL.length];

  if (!isOpen) return null;

  return (
    <GlassModal
      isOpen={isOpen}
      onClose={onClose}
      title="An Unopened Letter for You"
      maxWidth="md"
    >
      <div className="space-y-6 animate-fadeIn">
        <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-b from-[#181A26] to-[#0E1018] border border-amber-500/30 shadow-2xl relative space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <span className="type-metadata font-mono font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
              <Mail className="w-4 h-4" />
              <span>Quiet Discovery</span>
            </span>
            <span className="type-metadata text-zinc-500 font-mono">Found in the universe</span>
          </div>

          <h3 className="type-card-heading text-white tracking-tight">
            {letter.title}
          </h3>

          <p className="font-editorial italic text-base sm:text-lg text-zinc-100 leading-relaxed pt-1">
            "{letter.message}"
          </p>

          <p className="type-supporting text-amber-400 font-medium pt-2 text-right">
            — {letter.closing}
          </p>

          {/* Easter Egg: Universe Wax Seals of Resonance */}
          <div className="pt-3 border-t border-white/10 space-y-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-rose-400/90 block">
              ♡ Stamped with Universe Soul Seals (Easter Egg)
            </span>
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
              {SOULVERSE_ALL_LOGOS.slice(0, 8).map((logo) => {
                const LogoComp = logo.component;
                const isSealSelected = activeSeal === logo.id;
                return (
                  <button
                    key={logo.id}
                    onClick={() => setActiveSeal(logo.id)}
                    className={`px-2.5 py-1.5 rounded-xl border flex items-center gap-1.5 cursor-pointer transition-all shrink-0 ${
                      isSealSelected
                        ? 'bg-amber-500/20 border-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.3)]'
                        : 'bg-white/[0.03] border-white/10 hover:border-white/25'
                    }`}
                    title={logo.title}
                  >
                    <LogoComp size={16} showGlow={false} />
                    <span className="text-[10px] text-zinc-300 font-medium whitespace-nowrap">{logo.title}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <button
            onClick={() => setLetterIndex(prev => prev + 1)}
            className="h-11 px-4 text-xs sm:text-sm text-zinc-300 hover:text-white font-medium cursor-pointer rounded-xl hover:bg-white/[0.05] transition-colors"
          >
            Read another letter ›
          </button>

          <button
            onClick={onClose}
            className="sv-btn-primary h-11 px-6 text-xs sm:text-sm cursor-pointer"
          >
            Keep with me
          </button>
        </div>
      </div>
    </GlassModal>
  );
};
