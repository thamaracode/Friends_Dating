import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  Sparkles, 
  Clock, 
  Flame, 
  Heart, 
  Star, 
  Smile, 
  Zap, 
  Gamepad2, 
  Sliders, 
  Copy, 
  Check, 
  X,
  ShieldCheck
} from 'lucide-react';
import { 
  TelegramPremiumEmoji, 
  TelegramEmojiCategoryGroup, 
  TelegramEmojiStyleFamily, 
  formatTelegramEmojiHtml 
} from '../../types/telegramEmoji';
import { telegramEmojiService } from '../../services/telegramEmojiService';
import { TgEmoji } from '../common/TgEmoji';

interface TelegramPremiumEmojiPickerProps {
  onSelectEmoji: (emoji: TelegramPremiumEmoji, htmlSnippet: string) => void;
  onClose?: () => void;
  compact?: boolean;
}

const CATEGORY_TABS: Array<{ id: TelegramEmojiCategoryGroup; label: string; icon: any }> = [
  { id: 'all', label: 'All', icon: Sparkles },
  { id: 'reactions', label: 'Reactions', icon: Flame },
  { id: 'love', label: 'Romance', icon: Heart },
  { id: 'vip', label: 'Stars & VIP', icon: Star },
  { id: 'cute', label: 'Cute', icon: Smile },
  { id: 'neon', label: 'Neon', icon: Zap },
  { id: 'pixel', label: '8-Bit', icon: Gamepad2 },
  { id: 'system', label: 'System', icon: Sliders }
];

const STYLE_FAMILIES: Array<{ id: TelegramEmojiStyleFamily; label: string }> = [
  { id: 'all', label: 'All Styles' },
  { id: 'minimal', label: 'Minimal (SF)' },
  { id: 'illustrated', label: 'Illustrated' },
  { id: 'cute', label: 'Cute' },
  { id: 'neon', label: 'Neon Glow' },
  { id: 'pixel', label: 'Pixel' },
  { id: 'outline', label: 'Outline' },
  { id: 'brand', label: 'Brand & Apps' }
];

export const TelegramPremiumEmojiPicker: React.FC<TelegramPremiumEmojiPickerProps> = ({
  onSelectEmoji,
  onClose,
  compact = false
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<TelegramEmojiCategoryGroup>('all');
  const [activeStyle, setActiveStyle] = useState<TelegramEmojiStyleFamily>('all');
  const [emojis, setEmojis] = useState<TelegramPremiumEmoji[]>(() => telegramEmojiService.getCurated());
  const [recentIds, setRecentIds] = useState<string[]>(() => telegramEmojiService.getRecents());
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Search execution with debouncing
  useEffect(() => {
    let isCancelled = false;

    const timer = setTimeout(async () => {
      const results = await telegramEmojiService.search(
        searchQuery,
        activeStyle,
        activeCategory,
        compact ? 48 : 96
      );
      if (!isCancelled) {
        setEmojis(results);
      }
    }, 150);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [searchQuery, activeStyle, activeCategory, compact]);

  const handlePickEmoji = (item: TelegramPremiumEmoji) => {
    telegramEmojiService.trackRecent(item.id);
    setRecentIds(telegramEmojiService.getRecents());
    const htmlSnippet = formatTelegramEmojiHtml(item.id, item.fallback);
    onSelectEmoji(item, htmlSnippet);
  };

  const handleCopyHtml = (e: React.MouseEvent, item: TelegramPremiumEmoji) => {
    e.stopPropagation();
    const html = formatTelegramEmojiHtml(item.id, item.fallback);
    navigator.clipboard.writeText(html);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  // Recent emojis resolved list
  const recentEmojis = useMemo(() => {
    return recentIds
      .map(id => telegramEmojiService.getById(id))
      .filter((x): x is TelegramPremiumEmoji => Boolean(x));
  }, [recentIds]);

  return (
    <div className="w-full flex flex-col h-full max-h-[460px] bg-[#0E1017] text-zinc-100 rounded-3xl border border-white/10 shadow-2xl overflow-hidden animate-fadeIn">
      
      {/* 1. Header & Live Search Bar */}
      <div className="p-3 border-b border-white/[0.08] space-y-2.5 bg-white/[0.02]">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30">
              <Sparkles className="w-4 h-4" />
            </span>
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider font-serif flex items-center gap-1.5">
                <span>Telegram Premium Emojis</span>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-full bg-white/10 text-zinc-300">
                  7,092 Catalog
                </span>
              </h4>
            </div>
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className="p-1 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search custom emojis in English or Russian (e.g. fire, огонь, star)..."
            className="w-full pl-9 pr-8 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-purple-400/40"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white cursor-pointer"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Style Family Filter Selector */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pt-0.5 text-[10px]">
          {STYLE_FAMILIES.map(st => (
            <button
              key={st.id}
              onClick={() => setActiveStyle(st.id)}
              className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-all cursor-pointer ${
                activeStyle === st.id
                  ? 'bg-white text-[#090A0E] font-bold shadow-sm'
                  : 'text-zinc-400 hover:text-white bg-white/[0.03] hover:bg-white/[0.08]'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Recents Strip (if available) */}
      {recentEmojis.length > 0 && !searchQuery && (
        <div className="px-3 py-1.5 border-b border-white/[0.06] flex items-center gap-1.5 overflow-x-auto no-scrollbar bg-white/[0.01]">
          <Clock className="w-3 h-3 text-zinc-500 shrink-0" />
          <div className="flex items-center gap-1">
            {recentEmojis.slice(0, 8).map(rec => (
              <button
                key={rec.id}
                onClick={() => handlePickEmoji(rec)}
                className="p-1 rounded-xl hover:bg-white/10 transition-transform active:scale-90 cursor-pointer"
                title={`${rec.name} (${rec.pack})`}
              >
                <TgEmoji id={rec.id} fallback={rec.fallback} size={22} />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 3. Category Tabs Strip */}
      <div className="px-3 py-1.5 flex items-center gap-1 border-b border-white/[0.06] overflow-x-auto no-scrollbar text-xs">
        {CATEGORY_TABS.map(tab => {
          const Icon = tab.icon;
          const isActive = activeCategory === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveCategory(tab.id)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-medium whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
              }`}
            >
              <Icon className="w-3 h-3" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 4. Emoji Grid View */}
      <div className="flex-1 overflow-y-auto p-3 no-scrollbar">
        {emojis.length === 0 ? (
          <div className="h-40 flex flex-col items-center justify-center text-center space-y-2 text-zinc-500 text-xs">
            <Sparkles className="w-6 h-6 text-zinc-600" />
            <p>No Telegram emojis matching your search.</p>
            <span className="text-[10px] text-zinc-600">Try searching for "heart", "огонь", "cat", or "star"</span>
          </div>
        ) : (
          <div className="grid grid-cols-6 sm:grid-cols-8 gap-2">
            {emojis.map(item => (
              <div
                key={item.id}
                onClick={() => handlePickEmoji(item)}
                className="group relative p-2 rounded-2xl bg-white/[0.03] hover:bg-white/[0.12] border border-white/[0.06] hover:border-purple-400/30 flex flex-col items-center justify-center aspect-square transition-all duration-200 cursor-pointer active:scale-95 hover:shadow-lg"
                title={`${item.name} — ${item.pack}\nID: ${item.id}\nFallback: ${item.fallback}\nClick to insert, right icon to copy <tg-emoji>`}
              >
                <TgEmoji id={item.id} fallback={item.fallback} size={28} />

                {/* Quick Copy HTML Button on hover */}
                <button
                  onClick={(e) => handleCopyHtml(e, item)}
                  className="opacity-0 group-hover:opacity-100 absolute top-1 right-1 p-0.5 rounded bg-black/60 hover:bg-purple-600/80 text-white transition-opacity cursor-pointer"
                  title="Copy Telegram HTML tag"
                >
                  {copiedId === item.id ? (
                    <Check className="w-2.5 h-2.5 text-emerald-300" />
                  ) : (
                    <Copy className="w-2.5 h-2.5" />
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 5. Footer Bar with Role Binding & HTML Attribution */}
      <div className="p-2.5 px-3 border-t border-white/[0.08] bg-white/[0.02] flex items-center justify-between text-[10px] text-zinc-400">
        <span className="flex items-center gap-1">
          <ShieldCheck className="w-3 h-3 text-emerald-400" />
          <span>Verified Telegram Custom Emojis</span>
        </span>
        <span className="text-zinc-500 font-mono">
          &lt;tg-emoji&gt; ready
        </span>
      </div>

    </div>
  );
};
