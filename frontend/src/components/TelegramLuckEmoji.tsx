import React, { useState, useEffect } from 'react';
import { Sparkles, Trophy } from 'lucide-react';

interface TelegramLuckEmojiProps {
  type: 'dice' | 'slot' | 'coin';
  seedValue?: string; // e.g. "dice_5", "slot_777", "coin_heads"
  onRollComplete?: (outcome: string) => void;
}

// 1. DICE COMPONENT
const DiceEmoji: React.FC<{ seedValue?: string; onRollComplete?: (outcome: string) => void }> = ({
  seedValue,
  onRollComplete
}) => {
  const [isAnimating, setIsAnimating] = useState(true);
  const [outcome, setOutcome] = useState<string>(seedValue || '');

  const diceNumber = outcome ? parseInt(outcome.replace('dice_', ''), 10) || 5 : 5;

  useEffect(() => {
    if (!seedValue) {
      const timer = setTimeout(() => {
        const rolled = Math.floor(Math.random() * 6) + 1;
        setOutcome(`dice_${rolled}`);
        setIsAnimating(false);
        if (onRollComplete) onRollComplete(`dice_${rolled}`);
      }, 1200);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => setIsAnimating(false), 800);
      return () => clearTimeout(timer);
    }
  }, [seedValue, onRollComplete]);

  return (
    <div 
      className={`relative w-28 h-28 flex items-center justify-center cursor-pointer transition-transform active:scale-95 ${
        isAnimating ? 'animate-bounce' : ''
      }`}
      title={`Dice Result: ${diceNumber}`}
    >
      <svg 
        viewBox="0 0 100 100" 
        className={`w-full h-full drop-shadow-[0_8px_16px_rgba(0,0,0,0.6)] ${
          isAnimating ? 'animate-spin' : ''
        }`}
      >
        <rect x="15" y="15" width="70" height="70" rx="16" fill="url(#diceGrad)" stroke="rgba(255,255,255,0.4)" strokeWidth="2" />
        <defs>
          <linearGradient id="diceGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#9CA3AF" />
          </linearGradient>
        </defs>
        {diceNumber === 1 && <circle cx="50" cy="50" r="7" fill="#090A0E" />}
        {diceNumber === 2 && (
          <>
            <circle cx="32" cy="32" r="5.5" fill="#090A0E" />
            <circle cx="68" cy="68" r="5.5" fill="#090A0E" />
          </>
        )}
        {diceNumber === 3 && (
          <>
            <circle cx="32" cy="32" r="5" fill="#090A0E" />
            <circle cx="50" cy="50" r="5" fill="#090A0E" />
            <circle cx="68" cy="68" r="5" fill="#090A0E" />
          </>
        )}
        {diceNumber === 4 && (
          <>
            <circle cx="32" cy="32" r="5" fill="#090A0E" />
            <circle cx="68" cy="32" r="5" fill="#090A0E" />
            <circle cx="32" cy="68" r="5" fill="#090A0E" />
            <circle cx="68" cy="68" r="5" fill="#090A0E" />
          </>
        )}
        {diceNumber === 5 && (
          <>
            <circle cx="30" cy="30" r="5" fill="#090A0E" />
            <circle cx="70" cy="30" r="5" fill="#090A0E" />
            <circle cx="50" cy="50" r="5.5" fill="#090A0E" />
            <circle cx="30" cy="70" r="5" fill="#090A0E" />
            <circle cx="70" cy="70" r="5" fill="#090A0E" />
          </>
        )}
        {diceNumber === 6 && (
          <>
            <circle cx="30" cy="28" r="4.5" fill="#090A0E" />
            <circle cx="70" cy="28" r="4.5" fill="#090A0E" />
            <circle cx="30" cy="50" r="4.5" fill="#090A0E" />
            <circle cx="70" cy="50" r="4.5" fill="#090A0E" />
            <circle cx="30" cy="72" r="4.5" fill="#090A0E" />
            <circle cx="70" cy="72" r="4.5" fill="#090A0E" />
          </>
        )}
      </svg>
    </div>
  );
};

// 2. SLOT MACHINE COMPONENT
const SlotEmoji: React.FC<{ seedValue?: string; onRollComplete?: (outcome: string) => void }> = ({
  seedValue,
  onRollComplete
}) => {
  const [isAnimating, setIsAnimating] = useState(true);
  const slotIcons = ['🍒', '🍋', '🍇', 'BAR', '7'];
  const [reels, setReels] = useState<[string, string, string]>(['BAR', '🍇', '7']);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isAnimating) {
      interval = setInterval(() => {
        setReels([
          slotIcons[Math.floor(Math.random() * slotIcons.length)],
          slotIcons[Math.floor(Math.random() * slotIcons.length)],
          slotIcons[Math.floor(Math.random() * slotIcons.length)]
        ]);
      }, 100);

      const stopTimer = setTimeout(() => {
        clearInterval(interval);
        let finalReels: [string, string, string] = ['BAR', '🍇', '7'];
        if (seedValue && seedValue.startsWith('slot_')) {
          const parts = seedValue.replace('slot_', '').split('_');
          if (parts.length === 3) finalReels = [parts[0], parts[1], parts[2]];
        } else {
          const jackpot = Math.random() < 0.2;
          if (jackpot) finalReels = ['7', '7', '7'];
          else {
            finalReels = [
              slotIcons[Math.floor(Math.random() * slotIcons.length)],
              slotIcons[Math.floor(Math.random() * slotIcons.length)],
              slotIcons[Math.floor(Math.random() * slotIcons.length)]
            ];
          }
        }
        setReels(finalReels);
        setIsAnimating(false);
        if (onRollComplete) onRollComplete(`slot_${finalReels.join('_')}`);
      }, 1500);

      return () => {
        clearInterval(interval);
        clearTimeout(stopTimer);
      };
    }
  }, [isAnimating, seedValue, onRollComplete]);

  const isJackpot = reels[0] === reels[1] && reels[1] === reels[2];

  return (
    <div className="relative w-44 h-24 p-2 rounded-3xl bg-[#12141B] border-2 border-white/20 shadow-2xl flex flex-col justify-between">
      <div className="flex items-center justify-between px-1">
        <span className="text-[9px] font-mono font-bold text-zinc-400">TELEGRAM CASINO</span>
        {isJackpot && !isAnimating && (
          <span className="text-[9px] font-bold text-amber-300 animate-pulse flex items-center gap-0.5">
            <Trophy className="w-3 h-3" />
            <span>JACKPOT!</span>
          </span>
        )}
      </div>

      <div className="flex items-center justify-around bg-black/60 rounded-2xl p-1.5 border border-white/10">
        {reels.map((icon, idx) => (
          <div 
            key={idx}
            className={`w-11 h-12 rounded-xl bg-white/5 flex items-center justify-center text-xl font-black ${
              isAnimating ? 'animate-pulse' : ''
            }`}
          >
            {icon === 'BAR' ? (
              <span className="px-1 py-0.5 rounded bg-zinc-200 text-[#090A0E] text-[10px] font-black">
                BAR
              </span>
            ) : icon === '7' ? (
              <span className="text-amber-400 text-2xl font-black drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]">
                7
              </span>
            ) : (
              <span>{icon}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// 3. COIN FLIP COMPONENT
const CoinEmoji: React.FC<{ seedValue?: string; onRollComplete?: (outcome: string) => void }> = ({
  seedValue,
  onRollComplete
}) => {
  const [isAnimating, setIsAnimating] = useState(true);
  const [outcome, setOutcome] = useState<string>(seedValue || '');

  const isHeads = outcome ? outcome.includes('heads') : true;

  useEffect(() => {
    if (!seedValue) {
      const timer = setTimeout(() => {
        const rolled = Math.random() < 0.5 ? 'heads' : 'tails';
        setOutcome(`coin_${rolled}`);
        setIsAnimating(false);
        if (onRollComplete) onRollComplete(`coin_${rolled}`);
      }, 1200);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => setIsAnimating(false), 800);
      return () => clearTimeout(timer);
    }
  }, [seedValue, onRollComplete]);

  return (
    <div 
      className="relative w-28 h-28 flex items-center justify-center cursor-pointer select-none"
      title={isHeads ? "Heads (Eagle)" : "Tails (1)"}
    >
      <div 
        className={`w-24 h-24 rounded-full border-4 border-zinc-400 bg-gradient-to-tr from-zinc-400 via-zinc-200 to-zinc-100 flex flex-col items-center justify-center shadow-[0_10px_24px_rgba(0,0,0,0.6)] transition-transform duration-300 ${
          isAnimating ? 'animate-spin' : ''
        }`}
      >
        <div className="w-20 h-20 rounded-full border border-dashed border-zinc-600 flex flex-col items-center justify-center">
          {isHeads ? (
            <>
              <span className="text-3xl">🦅</span>
              <span className="text-[8px] font-black tracking-widest text-[#090A0E] uppercase mt-0.5">SOULVERSE</span>
            </>
          ) : (
            <>
              <span className="text-2xl font-black font-serif text-[#090A0E]">1</span>
              <span className="text-[8px] font-black tracking-widest text-[#090A0E] uppercase">LUCK</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export const TelegramLuckEmoji: React.FC<TelegramLuckEmojiProps> = ({
  type,
  seedValue,
  onRollComplete
}) => {
  if (type === 'dice') {
    return <DiceEmoji seedValue={seedValue} onRollComplete={onRollComplete} />;
  }
  if (type === 'slot') {
    return <SlotEmoji seedValue={seedValue} onRollComplete={onRollComplete} />;
  }
  return <CoinEmoji seedValue={seedValue} onRollComplete={onRollComplete} />;
};
