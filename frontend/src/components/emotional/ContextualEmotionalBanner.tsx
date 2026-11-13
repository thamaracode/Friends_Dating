import React, { useState } from 'react';
import { 
  Sparkles, 
  Heart, 
  Bookmark, 
  Copy, 
  Check, 
  ChevronRight, 
  HelpCircle,
  X
} from 'lucide-react';
import type { EmotionalContentItem, TargetPage } from '../../types/emotionalUniverse';
import { EmotionalContentEngine } from '../../services/emotionalContentEngine';

interface ContextualEmotionalBannerProps {
  page: TargetPage;
  onOpenUnspoken?: () => void;
  className?: string;
}

export const ContextualEmotionalBanner: React.FC<ContextualEmotionalBannerProps> = ({
  page,
  onOpenUnspoken,
  className = ''
}) => {
  const [item, setItem] = useState<EmotionalContentItem>(() => EmotionalContentEngine.getContextualItem(page));
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(item.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    EmotionalContentEngine.saveThought(item.content);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className={`p-4 rounded-3xl dark-glass border border-white/10 relative overflow-hidden shadow-lg transition-all ${className}`}>
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-rose-500/10 to-transparent pointer-events-none" />

      <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shadow-[0_0_6px_#F43F5E]" />
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400">
            {page === 'discover' ? 'The Question You Weren’t Expecting' :
             page === 'profile' ? 'Beyond What People See' :
             page === 'inbox' ? 'Conversations That Matter' :
             page === 'connect' ? 'Human Connection' :
             'Things You Haven’t Said'}
          </span>
        </div>

        <button
          onClick={() => setIsDismissed(true)}
          className="text-zinc-500 hover:text-white p-1 transition-colors"
          title="Dismiss"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="pt-2.5 space-y-2">
        <h4 className="text-xs sm:text-sm font-serif italic text-white leading-relaxed">
          "{item.content}"
        </h4>

        {item.subtext && (
          <p className="text-[11px] text-zinc-400 leading-normal">
            {item.subtext}
          </p>
        )}

        <div className="flex items-center justify-between pt-2 text-xs">
          <div className="flex items-center gap-1">
            <button
              onClick={handleCopy}
              className="px-2.5 py-1 rounded-xl bg-white/[0.04] hover:bg-white/10 text-zinc-300 text-[11px] font-medium transition-colors flex items-center gap-1 cursor-pointer"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>

            <button
              onClick={handleSave}
              className="px-2.5 py-1 rounded-xl bg-white/[0.04] hover:bg-white/10 text-zinc-300 text-[11px] font-medium transition-colors flex items-center gap-1 cursor-pointer"
            >
              {saved ? <Check className="w-3 h-3 text-rose-400" /> : <Bookmark className="w-3 h-3" />}
              <span>{saved ? 'Saved' : 'Save'}</span>
            </button>
          </div>

          {onOpenUnspoken && (
            <button
              onClick={onOpenUnspoken}
              className="text-[11px] font-bold text-zinc-400 hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>The Unspoken</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
