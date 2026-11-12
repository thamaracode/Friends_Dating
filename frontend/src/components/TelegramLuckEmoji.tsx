import React, { useState, useEffect } from 'react';
import { Sparkles, Trophy } from 'lucide-react';

interface TelegramLuckEmojiProps {
  type: 'dice' | 'slot' | 'coin';
  seedValue?: string; // e.g. "dice_5", "slot_777", "coin_heads"
  onRollComplete?: (outcome: string) => void;
}

export const TelegramLuckEmoji: React.FC<TelegramLuckEmojiProps> = ({
  type,
  seedValue,
  onRollComplete
}) => {
  const [isAnimating, setIsAnimating] = useState(true);
  const [outcome, setOutcome] = useState<string>(seedValue || '');

  // 1. DICE COMPONENT
  if (type === 'dice') {
    // Dice values 1 to 6
    const diceNumber = outcome ? parseInt(outcome.replace('dice_', ''), 10) || 5 : 5;

    useEffect(() => {
      if (!seedValue) {
        // Roll random 1-6
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
    }, [seedValue]);

    return (
      <div 
        className={`relative w-28 h-28 flex items-center justify-center cursor-pointer transition-transform active:scale-95 ${
          isAnimating ? 'animate-bounce' : ''
        }`}
        title={`Dice Result: ${diceNumber}`}
      >
        {/* Telegram-style 3D Die SVG */}
        <svg 
          viewBox="0 0 100 100" 
          className={`w-full h-full drop-shadow-[0_8px_16px_rgba(0,0,0,0.6)] ${
            isAnimating ? 'animate-spin' : ''
          }`}
          style={{ animationDuration: isAnimating ? '0.4s' : '0s' }}
        >
          {/* 3D Isometric Die Body */}
          {/* Top Face */}
          <path 
            d="M 50 12 L 85 30 L 50 48 L 15 30 Z" 
            fill="#FFFFFF" 
            stroke="#D0D5DD" 
            strokeWidth="1.5" 
          />
          {/* Left Face */}
          <path 
            d="M 15 30 L 50 48 L 50 88 L 15 70 Z" 
            fill="#E4E7EC" 
            stroke="#C0C4CC" 
            strokeWidth="1.5" 
          />
          {/* Right Face */}
          <path 
            d="M 50 48 L 85 30 L 85 70 L 50 88 Z" 
            fill="#D0D5DD" 
            stroke="#B0B5C0" 
            strokeWidth="1.5" 
          />

          {/* Dots on Top Face (Red center dot like Telegram!) */}
          <circle cx="50" cy="30" r="4.5" fill="#E63946" />

          {/* Dots on Right/Left Face based on diceNumber */}
          {diceNumber >= 2 && (
            <>
              <circle cx="60" cy="52" r="3" fill="#1D2939" />
              <circle cx="75" cy="74" r="3" fill="#1D2939" />
            </>
          )}
          {diceNumber >= 3 && (
            <circle cx="67.5" cy="63" r="3" fill="#1D2939" />
          )}
          {diceNumber >= 4 && (
            <>
              <circle cx="26" cy="46" r="3" fill="#1D2939" />
              <circle cx="39" cy="72" r="3" fill="#1D2939" />
            </>
          )}
          {diceNumber >= 5 && (
            <circle cx="32.5" cy="59" r="3" fill="#1D2939" />
          )}
          {diceNumber === 6 && (
            <>
              <circle cx="26" cy="62" r="3" fill="#1D2939" />
              <circle cx="39" cy="56" r="3" fill="#1D2939" />
            </>
          )}
        </svg>

        {/* Small floating badge */}
        {!isAnimating && (
          <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-black/60 border border-white/20 text-[10px] font-black text-white shadow-md">
            {diceNumber}
          </span>
        )}
      </div>
    );
  }

  // 2. SLOT MACHINE COMPONENT (Telegram Casino Slot 🎰)
  if (type === 'slot') {
    const slotIcons = ['🍒', '🍋', '🍇', 'BAR', '7'];
    const [reels, setReels] = useState<[string, string, string]>(['BAR', '🍇', '7']);

    useEffect(() => {
      let interval: any;
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
          // If seedValue exists, use it; otherwise generate outcome
          let finalReels: [string, string, string] = ['BAR', '🍇', '7'];
          if (seedValue && seedValue.startsWith('slot_')) {
            const parts = seedValue.replace('slot_', '').split('_');
            if (parts.length === 3) finalReels = [parts[0], parts[1], parts[2]];
          } else {
            // 20% jackpot chance
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
    }, [isAnimating, seedValue]);

    const isJackpot = reels[0] === reels[1] && reels[1] === reels[2] && reels[0] === '7';

    return (
      <div 
        className="relative w-32 h-36 flex flex-col items-center justify-center cursor-pointer select-none"
        title={isJackpot ? "JACKPOT 777!" : "Slot Machine"}
      >
        {/* Telegram Slot Machine Frame */}
        <div className="relative w-full h-full rounded-2xl bg-gradient-to-b from-slate-100 via-slate-300 to-slate-400 p-2.5 border-2 border-slate-400 shadow-[0_12px_24px_rgba(0,0,0,0.6)] flex flex-col items-center justify-between">
          
          {/* Top Flashing Red Light */}
          <div className="w-6 h-3.5 rounded-full bg-red-600 border border-red-800 flex items-center justify-center shadow-[0_0_10px_#ff0000] -mt-1.5">
            <div className={`w-2.5 h-1.5 rounded-full bg-white ${isJackpot || isAnimating ? 'animate-ping' : ''}`} />
          </div>

          {/* Yellow Hood */}
          <div className="w-full h-3.5 rounded-t-lg bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 border-b border-amber-600 shadow-sm" />

          {/* Reels Display Window */}
          <div className="w-full flex-1 bg-white rounded-lg border-2 border-slate-600 flex items-center justify-around px-1 overflow-hidden shadow-inner my-1">
            {reels.map((icon, i) => (
              <div 
                key={i} 
                className={`w-7 h-12 flex items-center justify-center text-base font-black transition-all ${
                  isAnimating ? 'blur-[0.5px] translate-y-0.5' : ''
                } ${icon === '7' ? 'text-red-600 text-lg' : icon === 'BAR' ? 'text-blue-900 text-[10px] bg-slate-200 px-1 py-0.5 rounded font-black border border-slate-400' : ''}`}
              >
                {icon}
              </div>
            ))}
          </div>

          {/* Base Plate */}
          <div className="w-full h-3.5 rounded-b-lg bg-slate-500 flex items-center justify-center shadow-inner">
            <span className="text-[7.5px] font-black text-white tracking-widest">TELEGRAM LUCK</span>
          </div>

          {/* Right Handle Lever (Telegram Detail) */}
          <div className="absolute -right-3.5 top-7 flex flex-col items-center">
            <div className="w-4.5 h-4.5 rounded-full bg-red-600 border border-red-800 shadow-md" />
            <div className="w-1.5 h-7 bg-slate-300 border border-slate-500 -mt-0.5 rounded-b" />
          </div>
        </div>

        {/* Jackpot Celebratory Banner */}
        {isJackpot && (
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-amber-400 text-black text-[10px] font-black flex items-center gap-1 shadow-[0_0_14px_#fbbf24] animate-bounce">
            <Trophy className="w-3.5 h-3.5" />
            <span>JACKPOT!</span>
          </div>
        )}
      </div>
    );
  }

  // 3. COIN FLIP COMPONENT (Telegram Crazy Ones Eagle Coin 🪙)
  if (type === 'coin') {
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
    }, [seedValue]);

    return (
      <div 
        className="relative w-28 h-28 flex items-center justify-center cursor-pointer select-none"
        title={isHeads ? "Heads (Eagle)" : "Tails (1)"}
      >
        {/* 3D Flipping Coin */}
        <div 
          className={`w-24 h-24 rounded-full border-4 border-slate-400 bg-gradient-to-tr from-slate-400 via-slate-200 to-slate-100 flex flex-col items-center justify-center shadow-[0_10px_24px_rgba(0,0,0,0.6)] transition-transform duration-300 ${
            isAnimating ? 'animate-spin' : ''
          }`}
          style={{ animationDuration: isAnimating ? '0.3s' : '0s' }}
        >
          {isHeads ? (
            /* Telegram Eagle Side: "The Crazy Ones 2020" */
            <div className="flex flex-col items-center text-center p-1">
              <span className="text-[6.5px] font-black tracking-widest text-slate-600 uppercase">
                The Crazy Ones
              </span>
              {/* Silver Eagle Silhouette */}
              <div className="text-2xl -my-0.5 drop-shadow">🦅</div>
              <span className="text-[7.5px] font-bold text-slate-500">2020</span>
            </div>
          ) : (
            /* Tails Side: "1 LUCK" */
            <div className="flex flex-col items-center text-center">
              <span className="text-xl font-black text-slate-700">1</span>
              <span className="text-[7.5px] font-bold tracking-wider text-slate-500 uppercase">
                TAILS
              </span>
            </div>
          )}
        </div>

        {/* Small floating badge */}
        {!isAnimating && (
          <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-2 py-0.2 rounded-full bg-black/60 border border-white/20 text-[9px] font-bold text-[#E5E7EB] shadow-md uppercase">
            {isHeads ? 'Heads' : 'Tails'}
          </span>
        )}
      </div>
    );
  }

  return null;
};
