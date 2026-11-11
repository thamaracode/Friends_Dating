import React, { useState } from 'react';
import { 
  Dices, 
  Sparkles, 
  Coins, 
  Flame, 
  Heart, 
  HelpCircle, 
  Gift, 
  Layers, 
  ArrowRight, 
  Check, 
  Shuffle, 
  Lock,
  Volume2
} from 'lucide-react';
import { 
  LUCKY_DICE_OUTCOMES, 
  THEMED_CUBES, 
  INITIAL_WALLET 
} from '../luckyUniverseData';
import type { LuckyDiceRollResult, CollectibleCube, UserWallet } from '../luckyUniverseData';

interface LuckyUniverseViewProps {
  onStartDiceActivity?: (outcome: LuckyDiceRollResult) => void;
  onOpenCubeDetails?: (cube: CollectibleCube) => void;
}

export const LuckyUniverseView: React.FC<LuckyUniverseViewProps> = ({
  onStartDiceActivity,
  onOpenCubeDetails
}) => {
  const [wallet, setWallet] = useState<UserWallet>(INITIAL_WALLET);
  const [isRolling, setIsRolling] = useState(false);
  const [currentDiceValue, setCurrentDiceValue] = useState<number>(5);
  const [cubes, setCubes] = useState<CollectibleCube[]>(THEMED_CUBES);
  const [selectedOutcome, setSelectedOutcome] = useState<LuckyDiceRollResult>(LUCKY_DICE_OUTCOMES[5]);

  const handleRollDice = () => {
    if (isRolling) return;
    setIsRolling(true);

    let rollCount = 0;
    const interval = setInterval(() => {
      const tempVal = Math.floor(Math.random() * 6) + 1;
      setCurrentDiceValue(tempVal);
      rollCount++;

      if (rollCount > 10) {
        clearInterval(interval);
        const finalVal = Math.floor(Math.random() * 6) + 1;
        setCurrentDiceValue(finalVal);
        setSelectedOutcome(LUCKY_DICE_OUTCOMES[finalVal]);
        setIsRolling(false);

        // Award 5 virtual credits for daily roll
        setWallet(prev => ({
          balance: prev.balance + 5,
          transactions: [
            {
              id: `tx_${Date.now()}`,
              idempotencyKey: `idem_roll_${Date.now()}`,
              type: 'earned',
              amount: 5,
              reason: 'Daily Lucky Dice Roll Reward',
              timestamp: 'Just now'
            },
            ...prev.transactions
          ]
        }));
      }
    }, 80);
  };

  const handleUnlockCube = (cube: CollectibleCube) => {
    if (wallet.balance < cube.costInCoins) {
      alert("Insufficient virtual coins. Complete daily icebreakers or mini-game challenges to earn more!");
      return;
    }

    setWallet(prev => ({
      balance: prev.balance - cube.costInCoins,
      transactions: [
        {
          id: `tx_cube_${cube.id}`,
          idempotencyKey: `idem_cube_${cube.id}_${Date.now()}`,
          type: 'spent',
          amount: cube.costInCoins,
          reason: `Unlocked ${cube.name}`,
          timestamp: 'Just now'
        },
        ...prev.transactions
      ]
    }));

    setCubes(prev => prev.map(c => c.id === cube.id ? { ...c, unlocked: true } : c));
  };

  return (
    <div className="w-full max-w-md mx-auto min-h-[calc(100dvh-5.5rem)] flex flex-col space-y-4 px-3 pt-2 pb-24 animate-fadeIn">
      {/* Wallet Balance Header */}
      <div className="flex items-center justify-between p-4 rounded-3xl glass-panel-elevated border border-[#FF78A8]/30 pink-ambient-glow">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 to-[#FF4F87] flex items-center justify-center text-[#100B12] shadow-[0_0_15px_rgba(255,79,135,0.6)]">
            <Coins className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-[#FFB4CE]">Lucky Wallet</div>
            <div className="text-xl font-black text-[#FFF1F3]">{wallet.balance} Coins</div>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] text-emerald-400 font-bold px-2 py-0.5 rounded-full bg-emerald-950/40 border border-emerald-500/30">
            Immutable Ledger Active
          </span>
          <p className="text-[9px] text-[#B9A8B3] mt-0.5">Zero cash-out • Entertainment credits</p>
        </div>
      </div>

      {/* 3D-Look Interactive Lucky Dice */}
      <div className="p-5 rounded-3xl glass-panel-elevated border border-[#FF78A8]/30 text-center space-y-4 pink-ambient-glow">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#FFB4CE]">
            <Dices className="w-4 h-4 text-[#FF4F87]" />
            <span>Daily Interactive Lucky Dice</span>
          </div>
          <span className="text-[10px] text-amber-300 font-bold">+5 Coins / Roll</span>
        </div>

        {/* Dice Visual Box */}
        <div className="py-2 flex flex-col items-center justify-center">
          <div 
            onClick={handleRollDice}
            className={`w-28 h-28 rounded-3xl bg-gradient-to-tr from-[#1B121D] to-[#241827] border-2 border-[#FF4F87] shadow-[0_0_30px_rgba(255,79,135,0.4)] flex items-center justify-center cursor-pointer select-none transition-transform active:scale-95 ${
              isRolling ? 'animate-bounce' : 'hover:scale-105'
            }`}
          >
            <span className="text-5xl font-black text-[#FFF1F3] drop-shadow-[0_0_10px_#FF4F87]">
              {currentDiceValue}
            </span>
          </div>

          <button
            onClick={handleRollDice}
            disabled={isRolling}
            className="mt-4 px-6 py-2.5 rounded-full pink-gradient-btn font-bold text-xs shadow-lg cursor-pointer transition-transform active:scale-95 disabled:opacity-50"
          >
            {isRolling ? 'Rolling Dice...' : 'Roll The Lucky Dice!'}
          </button>
        </div>

        {/* Outcome Card */}
        {selectedOutcome && (
          <div className="p-3.5 rounded-2xl bg-[#100B12]/80 border border-[#FF78A8]/20 text-left space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-[#FFB4CE]">
                Dice #{selectedOutcome.diceValue} Result
              </span>
              <span className="text-[10px] font-bold text-emerald-400 capitalize">
                {selectedOutcome.actionType.replace('_', ' ')}
              </span>
            </div>
            <h4 className="text-sm font-black text-[#FFF1F3]">{selectedOutcome.activityName}</h4>
            <p className="text-xs text-[#B9A8B3] leading-relaxed">{selectedOutcome.description}</p>
          </div>
        )}
      </div>

      {/* Collectible Themed Cubes Carousel */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <span className="text-[10px] uppercase font-bold text-[#FFB4CE] tracking-wider">
            Collectible Themed Cubes
          </span>
          <span className="text-[10px] text-[#B9A8B3]">Unlock special prompts</span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {cubes.map((cube) => (
            <div
              key={cube.id}
              className="p-3.5 rounded-3xl glass-panel border border-[#FF78A8]/20 flex flex-col justify-between space-y-3 shadow-md"
            >
              <div>
                <div className={`w-8 h-8 rounded-xl bg-gradient-to-tr ${cube.colorGradient} flex items-center justify-center text-white font-bold text-xs shadow-md mb-2`}>
                  <Layers className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-black text-[#FFF1F3]">{cube.name}</h4>
                <p className="text-[10px] text-[#B9A8B3] mt-1 line-clamp-2">{cube.description}</p>
              </div>

              <div>
                <div className="text-[9px] text-[#FFB4CE] mb-2 italic line-clamp-1">
                  "{cube.samplePrompt}"
                </div>

                {cube.unlocked ? (
                  <div className="w-full py-1.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold text-center">
                    ✓ Unlocked & Active
                  </div>
                ) : (
                  <button
                    onClick={() => handleUnlockCube(cube)}
                    className="w-full py-1.5 rounded-xl pink-gradient-btn text-[10px] font-bold flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Lock className="w-3 h-3" />
                    <span>Unlock ({cube.costInCoins} Coins)</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Virtual Ledger Audit Trail */}
      <div className="p-4 rounded-3xl glass-panel space-y-2">
        <span className="text-[10px] uppercase font-bold text-[#FFB4CE] tracking-wider block">
          Recent Wallet Ledger
        </span>

        <div className="space-y-1.5 divide-y divide-white/5">
          {wallet.transactions.slice(0, 3).map((tx) => (
            <div key={tx.id} className="pt-1.5 flex items-center justify-between text-[11px]">
              <div>
                <span className="text-[#FFF1F3] font-medium block">{tx.reason}</span>
                <span className="text-[9px] text-[#7A6975]">{tx.timestamp}</span>
              </div>
              <span className={`font-bold ${tx.type === 'earned' ? 'text-emerald-400' : 'text-rose-400'}`}>
                {tx.type === 'earned' ? `+${tx.amount}` : `-${tx.amount}`}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
