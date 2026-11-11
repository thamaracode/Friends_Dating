import React, { useState } from 'react';
import { 
  Gamepad2, 
  Sparkles, 
  Flame, 
  HelpCircle, 
  CheckCircle, 
  RotateCcw, 
  ShieldCheck, 
  ArrowRight,
  Heart,
  AlertCircle
} from 'lucide-react';
import { 
  TRUTH_OR_DARE_ITEMS, 
  WOULD_YOU_RATHER_ITEMS 
} from '../gamesData';
import type { 
  TruthOrDareItem, 
  WouldYouRatherItem, 
  GameSession 
} from '../gamesData';

interface MiniGameEngineProps {
  partnerName?: string;
  onSendResultToChat?: (summary: string) => void;
}

export const MiniGameEngine: React.FC<MiniGameEngineProps> = ({
  partnerName = 'Alex Rivera',
  onSendResultToChat
}) => {
  const [activeGame, setActiveGame] = useState<'truth_or_dare' | 'would_you_rather'>('truth_or_dare');
  
  // Truth or Dare State
  const [todCategory, setTodCategory] = useState<'all' | 'funny' | 'deep' | 'romantic' | 'flirty'>('all');
  const [selectedTodType, setSelectedTodType] = useState<'truth' | 'dare'>('truth');
  const [currentTodItem, setCurrentTodItem] = useState<TruthOrDareItem>(TRUTH_OR_DARE_ITEMS[0]);
  const [playerAnswer, setPlayerAnswer] = useState('');
  const [todAnswered, setTodAnswered] = useState(false);

  // Would You Rather State
  const [wyrIndex, setWyrIndex] = useState(0);
  const [wyrVotedOption, setWyrVotedOption] = useState<'A' | 'B' | null>(null);

  const currentWyrItem = WOULD_YOU_RATHER_ITEMS[wyrIndex];

  const handlePickRandomTod = (type: 'truth' | 'dare') => {
    setSelectedTodType(type);
    const pool = TRUTH_OR_DARE_ITEMS.filter(item => {
      if (item.type !== type) return false;
      if (todCategory !== 'all' && item.category !== todCategory) return false;
      return true;
    });

    const chosen = pool.length > 0 ? pool[Math.floor(Math.random() * pool.length)] : TRUTH_OR_DARE_ITEMS[0];
    setCurrentTodItem(chosen);
    setPlayerAnswer('');
    setTodAnswered(false);
  };

  const handleSubmitTod = () => {
    if (!playerAnswer.trim()) return;
    setTodAnswered(true);

    if (onSendResultToChat) {
      onSendResultToChat(`[Truth or Dare] ${currentTodItem.prompt} -> "${playerAnswer}"`);
    }
  };

  const handleVoteWyr = (option: 'A' | 'B') => {
    setWyrVotedOption(option);
    if (onSendResultToChat) {
      const chosenText = option === 'A' ? currentWyrItem.optionA : currentWyrItem.optionB;
      onSendResultToChat(`[Would You Rather] Chose: "${chosenText}"`);
    }
  };

  const handleNextWyr = () => {
    setWyrVotedOption(null);
    setWyrIndex((prev) => (prev + 1) % WOULD_YOU_RATHER_ITEMS.length);
  };

  return (
    <div className="w-full max-w-md mx-auto min-h-[calc(100dvh-5.5rem)] flex flex-col space-y-4 px-3 pt-2 pb-24 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-black text-[#FFB4CE]">
            <Gamepad2 className="w-4 h-4 text-[#FF4F87]" />
            <span>MINI-GAME CONNECTION ENGINE</span>
          </div>
          <h1 className="text-xl font-black text-[#FFF1F3] tracking-tight">Play with {partnerName}</h1>
          <p className="text-xs text-[#B9A8B3]">Consensual games with server-validated turns & safe skip mechanisms.</p>
        </div>
      </div>

      {/* Game Selector */}
      <div className="flex p-1 rounded-2xl glass-panel-elevated">
        <button
          onClick={() => setActiveGame('truth_or_dare')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold cursor-pointer transition-all ${
            activeGame === 'truth_or_dare'
              ? 'bg-[#FF4F87] text-[#FFF1F3] shadow-[0_0_12px_rgba(255,79,135,0.6)]'
              : 'text-[#B9A8B3] hover:text-[#FFF1F3]'
          }`}
        >
          Truth or Dare
        </button>

        <button
          onClick={() => setActiveGame('would_you_rather')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold cursor-pointer transition-all ${
            activeGame === 'would_you_rather'
              ? 'bg-[#FF4F87] text-[#FFF1F3] shadow-[0_0_12px_rgba(255,79,135,0.6)]'
              : 'text-[#B9A8B3] hover:text-[#FFF1F3]'
          }`}
        >
          Would You Rather
        </button>
      </div>

      {/* GAME 1: TRUTH OR DARE */}
      {activeGame === 'truth_or_dare' && (
        <div className="space-y-4">
          {/* Category Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            {(['all', 'funny', 'deep', 'romantic', 'flirty'] as const).map(cat => (
              <button
                key={cat}
                onClick={() => setTodCategory(cat)}
                className={`px-3 py-1 rounded-full text-[11px] font-bold capitalize whitespace-nowrap cursor-pointer transition-all ${
                  todCategory === cat 
                    ? 'bg-[#FF4F87] text-[#FFF1F3]' 
                    : 'glass-panel text-[#B9A8B3]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Action Choice: Truth vs Dare */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handlePickRandomTod('truth')}
              className={`py-3.5 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md ${
                selectedTodType === 'truth'
                  ? 'bg-gradient-to-tr from-[#FF4F87] to-[#FF78A8] text-white shadow-[0_0_15px_rgba(255,79,135,0.5)]'
                  : 'glass-panel text-[#B9A8B3] hover:text-white'
              }`}
            >
              <HelpCircle className="w-4 h-4" />
              <span>Pick A Truth</span>
            </button>

            <button
              onClick={() => handlePickRandomTod('dare')}
              className={`py-3.5 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md ${
                selectedTodType === 'dare'
                  ? 'bg-gradient-to-tr from-[#FF4F87] to-[#FF78A8] text-white shadow-[0_0_15px_rgba(255,79,135,0.5)]'
                  : 'glass-panel text-[#B9A8B3] hover:text-white'
              }`}
            >
              <Flame className="w-4 h-4" />
              <span>Pick A Dare</span>
            </button>
          </div>

          {/* Current Card */}
          <div className="p-5 rounded-3xl glass-panel-elevated border border-[#FF78A8]/30 space-y-4 pink-ambient-glow">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#FF4F87]/20 text-[#FFB4CE]">
                {currentTodItem.type.toUpperCase()} • {currentTodItem.category.toUpperCase()}
              </span>
              <span className="text-[10px] text-emerald-400 font-bold">Consensual Play</span>
            </div>

            <h3 className="text-base font-black text-[#FFF1F3] leading-relaxed">
              "{currentTodItem.prompt}"
            </h3>

            {/* Answer Input or Skip */}
            {!todAnswered ? (
              <div className="space-y-2 pt-2">
                <textarea
                  rows={2}
                  value={playerAnswer}
                  onChange={(e) => setPlayerAnswer(e.target.value)}
                  placeholder="Type your response to send to your match..."
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-[#100B12]/80 border border-[#FF78A8]/20 text-xs text-[#FFF1F3] focus:outline-none focus:border-[#FF4F87] resize-none"
                />

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSubmitTod}
                    disabled={!playerAnswer.trim()}
                    className="flex-1 py-2.5 rounded-xl pink-gradient-btn text-xs font-bold disabled:opacity-40 cursor-pointer"
                  >
                    Submit Answer To Chat
                  </button>

                  <button
                    onClick={() => handlePickRandomTod(selectedTodType)}
                    className="px-3 py-2.5 rounded-xl glass-panel text-xs text-[#B9A8B3] hover:text-[#FFF1F3] cursor-pointer"
                  >
                    Skip
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-xs text-emerald-300 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>Answer delivered to conversation!</span>
                </span>
                <button
                  onClick={() => handlePickRandomTod(selectedTodType)}
                  className="text-xs text-[#FFF1F3] font-bold underline"
                >
                  Play Another →
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* GAME 2: WOULD YOU RATHER */}
      {activeGame === 'would_you_rather' && (
        <div className="space-y-4">
          <div className="p-5 rounded-3xl glass-panel-elevated border border-[#FF78A8]/30 space-y-4 pink-ambient-glow text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#FFB4CE]">
              Would You Rather Scenario #{wyrIndex + 1}
            </span>

            {/* Option A */}
            <div 
              onClick={() => handleVoteWyr('A')}
              className={`p-4 rounded-2xl border text-left cursor-pointer transition-all ${
                wyrVotedOption === 'A'
                  ? 'bg-[#FF4F87]/20 border-[#FF4F87] shadow-[0_0_15px_rgba(255,79,135,0.4)]'
                  : 'glass-panel border-white/10 hover:border-[#FF78A8]/40'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-[#FFF1F3]">Option A</span>
                {wyrVotedOption && (
                  <span className="text-xs font-bold text-[#FFB4CE]">{currentWyrItem.votesCountA}% agreed</span>
                )}
              </div>
              <p className="text-xs text-[#FFF1F3] mt-1">{currentWyrItem.optionA}</p>
            </div>

            <div className="text-[11px] font-bold text-[#7A6975] uppercase">— OR —</div>

            {/* Option B */}
            <div 
              onClick={() => handleVoteWyr('B')}
              className={`p-4 rounded-2xl border text-left cursor-pointer transition-all ${
                wyrVotedOption === 'B'
                  ? 'bg-[#FF4F87]/20 border-[#FF4F87] shadow-[0_0_15px_rgba(255,79,135,0.4)]'
                  : 'glass-panel border-white/10 hover:border-[#FF78A8]/40'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-[#FFF1F3]">Option B</span>
                {wyrVotedOption && (
                  <span className="text-xs font-bold text-[#FFB4CE]">{currentWyrItem.votesCountB}% agreed</span>
                )}
              </div>
              <p className="text-xs text-[#FFF1F3] mt-1">{currentWyrItem.optionB}</p>
            </div>

            {wyrVotedOption && (
              <button
                onClick={handleNextWyr}
                className="w-full py-2.5 rounded-xl pink-gradient-btn text-xs font-bold cursor-pointer"
              >
                Next Dilemma →
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
