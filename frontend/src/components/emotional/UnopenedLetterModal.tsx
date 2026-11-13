import React, { useState } from 'react';
import { Mail, Sparkles, Heart, X, Check } from 'lucide-react';
import { GlassModal, GlassButton } from '../klyven';
import { UNOPENED_LETTERS_POOL } from '../../services/emotionalContentEngine';
import type { UnopenedLetter } from '../../types/emotionalUniverse';

interface UnopenedLetterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UnopenedLetterModal: React.FC<UnopenedLetterModalProps> = ({
  isOpen,
  onClose
}) => {
  const [letterIndex, setLetterIndex] = useState(0);
  const letter: UnopenedLetter = UNOPENED_LETTERS_POOL[letterIndex % UNOPENED_LETTERS_POOL.length];

  if (!isOpen) return null;

  return (
    <GlassModal
      isOpen={isOpen}
      onClose={onClose}
      title="An Unopened Letter for You"
      maxWidth="md"
    >
      <div className="space-y-4 text-xs animate-fadeIn">
        <div className="p-5 rounded-3xl bg-gradient-to-b from-[#181A26] to-[#0E1018] border border-amber-400/30 shadow-2xl relative space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5" />
              <span>Quiet Discovery</span>
            </span>
            <span className="text-[10px] text-zinc-500 font-mono">Found in the universe</span>
          </div>

          <h3 className="text-sm font-bold text-white font-serif tracking-tight">
            {letter.title}
          </h3>

          <p className="text-xs sm:text-sm text-zinc-200 font-serif italic leading-relaxed pt-1">
            "{letter.message}"
          </p>

          <p className="text-xs text-amber-300 font-medium pt-2 text-right">
            — {letter.closing}
          </p>
        </div>

        <div className="flex items-center justify-between pt-1">
          <button
            onClick={() => setLetterIndex(prev => prev + 1)}
            className="text-xs text-zinc-400 hover:text-white font-medium cursor-pointer"
          >
            Read another letter ›
          </button>

          <GlassButton onClick={onClose}>
            Keep with me
          </GlassButton>
        </div>
      </div>
    </GlassModal>
  );
};
