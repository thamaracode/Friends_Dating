import React, { useState, useEffect, useRef } from 'react';
import { 
  Gamepad2, 
  Dices, 
  Disc, 
  Flame, 
  Sparkles, 
  Wine, 
  Timer, 
  PartyPopper, 
  Play, 
  RotateCcw, 
  Heart, 
  Share2, 
  ChevronLeft, 
  ChevronRight, 
  Lock, 
  Unlock, 
  CheckCircle2, 
  Shuffle, 
  Bookmark, 
  Volume2, 
  VolumeX, 
  ArrowRight,
  HelpCircle,
  Clock,
  Users,
  Shield,
  Send,
  Zap,
  Eye,
  Crown
} from 'lucide-react';
import type { 
  IntimacyTier, 
  CoupleGameId, 
  DiceRollResult, 
  RouletteSlice, 
  TruthOrDareCard, 
  KamaSutraPosition, 
  BottleChallenge, 
  TimerChallenge, 
  PartyGamePrompt 
} from '../../types/couplePlayHub';
import { 
  COUPLE_GAMES_METADATA, 
  DICE_ACTIONS, 
  DICE_BODY_PARTS, 
  DICE_STYLES_DURATIONS, 
  ROULETTE_SLICES, 
  TRUTH_OR_DARE_DECK, 
  KAMA_SUTRA_POSITIONS, 
  BOTTLE_CHALLENGES, 
  TIMER_CHALLENGES, 
  PARTY_GAME_PROMPTS 
} from '../../data/couplePlayHubData';

interface CouplePlayHubViewProps {
  onSendResultToChat?: (text: string, gameType: string, resultData?: any) => void;
  onNavigateToChat?: () => void;
  partnerName?: string;
}

export const CouplePlayHubView: React.FC<CouplePlayHubViewProps> = ({
  onSendResultToChat,
  onNavigateToChat,
  partnerName = 'Partner'
}) => {
  // Global View & Tier State
  const [activeGameId, setActiveGameId] = useState<CoupleGameId | null>(null);
  const [currentTier, setCurrentTier] = useState<IntimacyTier>('pg');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Turn Tracking & Session Stats
  const [partner1Name] = useState('You');
  const [partner2Name] = useState(partnerName);
  const [currentTurn, setCurrentTurn] = useState<'p1' | 'p2'>('p1');
  const [chemistryScore, setChemistryScore] = useState(120);
  const [roundsCompleted, setRoundsCompleted] = useState(0);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const switchTurn = () => {
    setCurrentTurn(prev => prev === 'p1' ? 'p2' : 'p1');
  };

  const handleShareResult = (gameTitle: string, details: string, payload?: any) => {
    const formatted = `🎲 [CouplePlayHub - ${gameTitle}]\n${details}`;
    if (onSendResultToChat) {
      onSendResultToChat(formatted, gameTitle, payload);
      showToast(`Sent "${gameTitle}" outcome to chat with ${partner2Name}!`);
    } else {
      navigator.clipboard.writeText(formatted);
      showToast('Copied game result to clipboard!');
    }
  };

  // ==========================================================================
  // GAME 1: SEXY DICE ENGINE
  // ==========================================================================
  const [diceMode, setDiceMode] = useState<2 | 3>(3);
  const [isDiceRolling, setIsDiceRolling] = useState(false);
  const [lockedDice, setLockedDice] = useState<[boolean, boolean, boolean]>([false, false, false]);
  const [diceResult, setDiceResult] = useState<DiceRollResult>({
    action: 'Kiss softly',
    bodyPart: 'Neck',
    durationOrStyle: 'For 45 Seconds',
    tier: 'pg',
    diceValues: [3, 4, 2],
    rolledAt: Date.now()
  });
  const [diceHistory, setDiceHistory] = useState<string[]>([]);

  const rollDice = () => {
    if (isDiceRolling) return;
    setIsDiceRolling(true);

    const actionList = DICE_ACTIONS[currentTier] || DICE_ACTIONS.pg;
    const bodyList = DICE_BODY_PARTS[currentTier] || DICE_BODY_PARTS.pg;
    const styleList = DICE_STYLES_DURATIONS[currentTier] || DICE_STYLES_DURATIONS.pg;

    let rollCount = 0;
    const interval = setInterval(() => {
      rollCount++;
      setDiceResult(prev => ({
        ...prev,
        action: lockedDice[0] ? prev.action : actionList[Math.floor(Math.random() * actionList.length)],
        bodyPart: lockedDice[1] ? prev.bodyPart : bodyList[Math.floor(Math.random() * bodyList.length)],
        durationOrStyle: lockedDice[2] ? prev.durationOrStyle : styleList[Math.floor(Math.random() * styleList.length)],
        diceValues: [
          lockedDice[0] ? prev.diceValues[0] : Math.floor(Math.random() * 6) + 1,
          lockedDice[1] ? prev.diceValues[1] : Math.floor(Math.random() * 6) + 1,
          lockedDice[2] ? prev.diceValues[2] : Math.floor(Math.random() * 6) + 1
        ]
      }));

      if (rollCount >= 8) {
        clearInterval(interval);
        setIsDiceRolling(false);
        const finalAction = lockedDice[0] ? diceResult.action : actionList[Math.floor(Math.random() * actionList.length)];
        const finalBody = lockedDice[1] ? diceResult.bodyPart : bodyList[Math.floor(Math.random() * bodyList.length)];
        const finalStyle = lockedDice[2] ? diceResult.durationOrStyle : styleList[Math.floor(Math.random() * styleList.length)];

        const finalResult: DiceRollResult = {
          action: finalAction,
          bodyPart: finalBody,
          durationOrStyle: diceMode === 3 ? finalStyle : undefined,
          tier: currentTier,
          diceValues: [
            Math.floor(Math.random() * 6) + 1,
            Math.floor(Math.random() * 6) + 1,
            diceMode === 3 ? Math.floor(Math.random() * 6) + 1 : undefined
          ],
          rolledAt: Date.now()
        };

        setDiceResult(finalResult);
        const textSummary = `${finalAction} on ${finalBody}${diceMode === 3 ? ` (${finalStyle})` : ''}`;
        setDiceHistory(prev => [textSummary, ...prev.slice(0, 4)]);
        setChemistryScore(s => s + 10);
        setRoundsCompleted(r => r + 1);
        switchTurn();
      }
    }, 100);
  };

  // ==========================================================================
  // GAME 2: SEX ROULETTE WHEEL ENGINE
  // ==========================================================================
  const [rouletteAngle, setRouletteAngle] = useState(0);
  const [isSpinningRoulette, setIsSpinningRoulette] = useState(false);
  const [landedSlice, setLandedSlice] = useState<RouletteSlice | null>(ROULETTE_SLICES[0]);
  const [rouletteModalOpen, setRouletteModalOpen] = useState(false);

  const spinRoulette = () => {
    if (isSpinningRoulette) return;
    setIsSpinningRoulette(true);
    setRouletteModalOpen(false);

    // Random landing index (0 to 11)
    const targetIndex = Math.floor(Math.random() * ROULETTE_SLICES.length);
    const sliceDeg = 360 / ROULETTE_SLICES.length; // 30 deg per slice
    // Align with top pointer (offset by 90deg or 270deg based on SVG layout)
    const extraRotations = 5 * 360; // 5 full spins
    const targetDeg = rouletteAngle + extraRotations + (360 - (targetIndex * sliceDeg)) + (sliceDeg / 2);

    setRouletteAngle(targetDeg);

    setTimeout(() => {
      setIsSpinningRoulette(false);
      setLandedSlice(ROULETTE_SLICES[targetIndex]);
      setRouletteModalOpen(true);
      setChemistryScore(s => s + 25);
      setRoundsCompleted(r => r + 1);
      switchTurn();
    }, 3800);
  };

  // ==========================================================================
  // GAME 3: TRUTH OR DARE ENGINE
  // ==========================================================================
  const [todCardType, setTodCardType] = useState<'truth' | 'dare' | 'all'>('all');
  const [currentTodCard, setCurrentTodCard] = useState<TruthOrDareCard>(TRUTH_OR_DARE_DECK[0]);
  const [isTodRevealed, setIsTodRevealed] = useState(true);

  const drawTodCard = (type?: 'truth' | 'dare') => {
    const selectedType = type || (todCardType === 'all' ? (Math.random() > 0.5 ? 'truth' : 'dare') : todCardType);
    const pool = TRUTH_OR_DARE_DECK.filter(c => 
      (c.type === selectedType) && (c.tier === currentTier || (currentTier === 'xxx' && c.tier === 'pg'))
    );
    const available = pool.length > 0 ? pool : TRUTH_OR_DARE_DECK.filter(c => c.type === selectedType);
    const nextCard = available[Math.floor(Math.random() * available.length)];

    setIsTodRevealed(false);
    setTimeout(() => {
      setCurrentTodCard(nextCard);
      setIsTodRevealed(true);
    }, 300);
  };

  const completeTod = (kissAlternative = false) => {
    const bonus = kissAlternative ? 15 : currentTodCard.chemistryPoints;
    setChemistryScore(s => s + bonus);
    setRoundsCompleted(r => r + 1);
    showToast(kissAlternative ? 'Kiss sealed the deal! (+15 Chemistry)' : `Completed challenge! (+${currentTodCard.chemistryPoints} Chemistry)`);
    switchTurn();
    drawTodCard();
  };

  // ==========================================================================
  // GAME 4: KAMA SUTRA CARDS ENGINE
  // ==========================================================================
  const [kamaIndex, setKamaIndex] = useState(0);
  const [bookmarkedPositions, setBookmarkedPositions] = useState<string[]>(['ks_lotus']);
  const activeKama = KAMA_SUTRA_POSITIONS[kamaIndex];

  const toggleBookmarkKama = (id: string) => {
    setBookmarkedPositions(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
    showToast(bookmarkedPositions.includes(id) ? 'Removed from tonight’s list' : 'Saved to "Try Tonight" wishlist!');
  };

  // ==========================================================================
  // GAME 5: SPIN THE BOTTLE ENGINE
  // ==========================================================================
  const [bottleAngle, setBottleAngle] = useState(0);
  const [isSpinningBottle, setIsSpinningBottle] = useState(false);
  const [bottleLanded, setBottleLanded] = useState<BottleChallenge | null>(null);

  const spinBottle = () => {
    if (isSpinningBottle) return;
    setIsSpinningBottle(true);
    setBottleLanded(null);

    const randomRotations = (4 + Math.floor(Math.random() * 4)) * 360;
    const randomOffset = Math.floor(Math.random() * 360);
    const finalAngle = bottleAngle + randomRotations + randomOffset;
    setBottleAngle(finalAngle);

    setTimeout(() => {
      setIsSpinningBottle(false);
      const filtered = BOTTLE_CHALLENGES.filter(c => c.tier === currentTier || c.tier === 'vanilla');
      const challenge = filtered[Math.floor(Math.random() * filtered.length)] || BOTTLE_CHALLENGES[0];
      setBottleLanded(challenge);
      setChemistryScore(s => s + 20);
      setRoundsCompleted(r => r + 1);
      switchTurn();
    }, 3200);
  };

  // ==========================================================================
  // GAME 6: SEXY TIMER ENGINE
  // ==========================================================================
  const [timerSelectedPreset, setTimerSelectedPreset] = useState<number>(60);
  const [timerRemaining, setTimerRemaining] = useState<number>(60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [activeTimerChallenge, setActiveTimerChallenge] = useState<TimerChallenge>(TIMER_CHALLENGES[1]);
  const timerIntervalRef = useRef<any>(null);

  const selectTimerPreset = (secs: number) => {
    setIsTimerRunning(false);
    clearInterval(timerIntervalRef.current);
    setTimerSelectedPreset(secs);
    setTimerRemaining(secs);
    const matches = TIMER_CHALLENGES.filter(c => c.durationSeconds === secs && (c.tier === currentTier || c.tier === 'vanilla'));
    const nextChallenge = matches.length > 0 ? matches[Math.floor(Math.random() * matches.length)] : TIMER_CHALLENGES[0];
    setActiveTimerChallenge(nextChallenge);
  };

  const toggleTimer = () => {
    if (isTimerRunning) {
      clearInterval(timerIntervalRef.current);
      setIsTimerRunning(false);
    } else {
      if (timerRemaining <= 0) setTimerRemaining(timerSelectedPreset);
      setIsTimerRunning(true);
    }
  };

  useEffect(() => {
    if (isTimerRunning) {
      timerIntervalRef.current = setInterval(() => {
        setTimerRemaining(prev => {
          if (prev <= 1) {
            clearInterval(timerIntervalRef.current);
            setIsTimerRunning(false);
            setChemistryScore(s => s + 30);
            setRoundsCompleted(r => r + 1);
            showToast('⏰ Time’s up! Well done, lovers.');
            switchTurn();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerIntervalRef.current);
    }
    return () => clearInterval(timerIntervalRef.current);
  }, [isTimerRunning]);

  // ==========================================================================
  // GAME 7: PARTY GAMES ENGINE
  // ==========================================================================
  const [partyMode, setPartyMode] = useState<'would_you_rather' | 'never_have_i_ever' | 'most_likely_to'>('would_you_rather');
  const [partyPromptIndex, setPartyPromptIndex] = useState(0);
  const [userVoted, setUserVoted] = useState<'A' | 'B' | null>(null);

  const filteredPartyPrompts = PARTY_GAME_PROMPTS.filter(p => p.gameMode === partyMode);
  const currentPartyPrompt = filteredPartyPrompts[partyPromptIndex % filteredPartyPrompts.length] || PARTY_GAME_PROMPTS[0];

  const nextPartyPrompt = () => {
    setUserVoted(null);
    setPartyPromptIndex(prev => prev + 1);
  };

  const handlePartyVote = (opt: 'A' | 'B') => {
    setUserVoted(opt);
    setChemistryScore(s => s + 15);
    setRoundsCompleted(r => r + 1);
    switchTurn();
  };

  // ==========================================================================
  // RENDER: MAIN INTERFACE
  // ==========================================================================
  return (
    <div className="w-full min-h-screen bg-[#090A0E] text-zinc-100 flex flex-col font-body selection:bg-rose-500/30 selection:text-white pb-16">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 px-4 py-3 rounded-2xl bg-gradient-to-r from-rose-900/90 to-amber-900/90 border border-amber-400/40 text-amber-200 shadow-2xl backdrop-blur-xl flex items-center gap-3 animate-slideIn">
          <Sparkles className="w-5 h-5 text-amber-300 animate-spin" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Top Banner / Couples Game Bar */}
      <div className="dark-glass border-b border-white/[0.08] px-4 sm:px-8 py-3.5 sticky top-0 z-30 backdrop-blur-xl flex flex-wrap items-center justify-between gap-4">
        
        {/* Left: Branding & Back Button */}
        <div className="flex items-center gap-3">
          {activeGameId ? (
            <button
              onClick={() => setActiveGameId(null)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-zinc-300 hover:text-white text-xs font-semibold transition-all cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>All Games</span>
            </button>
          ) : (
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-600 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-rose-600/30">
              <Gamepad2 className="w-5 h-5" />
            </div>
          )}

          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-heading font-extrabold text-white text-base sm:text-lg tracking-tight">
                CouplePlayHub
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30">
                Couples Edition
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 hidden sm:block">
              Intimate party games, sensual dice, bedroom roulette & romantic dares
            </p>
          </div>
        </div>

        {/* Center: Intimacy Tier Selector */}
        <div className="flex items-center gap-1 p-1 rounded-2xl bg-white/[0.04] border border-white/10">
          {(['vanilla', 'pg', 'xxx', 'kinky'] as IntimacyTier[]).map(tier => {
            const isActive = currentTier === tier;
            const labels: Record<IntimacyTier, { text: string; color: string }> = {
              vanilla: { text: 'Vanilla', color: 'text-emerald-400' },
              pg: { text: 'Flirty (PG)', color: 'text-sky-400' },
              xxx: { text: 'Spicy (XXX)', color: 'text-rose-400' },
              kinky: { text: 'Kinky', color: 'text-purple-400' }
            };
            return (
              <button
                key={tier}
                onClick={() => setCurrentTier(tier)}
                className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-white/15 text-white shadow-sm border border-white/20'
                    : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <span className={isActive ? labels[tier].color : ''}>
                  {labels[tier].text}
                </span>
              </button>
            );
          })}
        </div>

        {/* Right: Partner Turn & Chemistry Stats */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs">
            <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
            <span className="text-zinc-300">Chemistry:</span>
            <span className="font-bold text-amber-300">{chemistryScore} pts</span>
          </div>

          {/* Turn indicator */}
          <button
            onClick={switchTurn}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.07] hover:bg-white/[0.12] border border-white/15 text-xs transition-all cursor-pointer"
            title="Click to pass turn to your partner"
          >
            <div className={`w-2 h-2 rounded-full ${currentTurn === 'p1' ? 'bg-amber-400' : 'bg-rose-400'} animate-pulse`} />
            <span className="text-zinc-300">
              Turn: <strong className="text-white">{currentTurn === 'p1' ? partner1Name : partner2Name}</strong>
            </span>
          </button>

          {onNavigateToChat && (
            <button
              onClick={onNavigateToChat}
              className="p-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.12] text-zinc-300 hover:text-white transition-all cursor-pointer"
              title="Open Chat with Partner"
            >
              <Send className="w-4 h-4 text-rose-400" />
            </button>
          )}
        </div>
      </div>

      {/* ===================================================================== */}
      {/* SUB-VIEW 0: GAME GALLERY (WHEN NO GAME IS SELECTED)                  */}
      {/* ===================================================================== */}
      {!activeGameId && (
        <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8 space-y-8 animate-fadeIn">
          
          {/* Hero Welcome Banner */}
          <div className="relative rounded-3xl overflow-hidden p-6 sm:p-10 border border-white/10 bg-gradient-to-br from-rose-950/40 via-[#10121A] to-purple-950/30 shadow-2xl">
            <div className="max-w-2xl space-y-4 relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold">
                <Flame className="w-3.5 h-3.5 text-rose-400" />
                <span>Synchronized Couples Experience</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-heading font-black text-white leading-tight">
                Spark Desire, Deepen Intimacy & Play Together.
              </h2>
              <p className="text-sm sm:text-base text-zinc-300 leading-relaxed">
                Choose from 7 open-source couple games adapted from CouplePlayHub. Roll sensual dice, spin the passion wheel, challenge each other to spicy dares, and share your results directly with your partner in chat.
              </p>
              
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <button
                  onClick={() => setActiveGameId('sexy_dice')}
                  className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-rose-600 to-amber-500 text-white font-bold text-sm shadow-lg shadow-rose-600/30 hover:scale-105 transition-all cursor-pointer flex items-center gap-2"
                >
                  <Dices className="w-4 h-4" />
                  <span>Start with Sexy Dice</span>
                </button>
                <button
                  onClick={() => setActiveGameId('sex_roulette')}
                  className="px-5 py-2.5 rounded-2xl bg-white/[0.08] hover:bg-white/[0.15] text-zinc-200 hover:text-white font-semibold text-sm border border-white/10 transition-all cursor-pointer flex items-center gap-2"
                >
                  <Disc className="w-4 h-4 text-amber-400" />
                  <span>Spin Passion Roulette</span>
                </button>
              </div>
            </div>
          </div>

          {/* Game Cards Grid */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-heading font-bold text-lg text-white">All 7 Couple Games</h3>
              <span className="text-xs text-zinc-400 font-mono">Current Tier: <strong className="text-rose-400 capitalize">{currentTier}</strong></span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {COUPLE_GAMES_METADATA.map(game => {
                const iconMap: Record<string, any> = {
                  Dices, Disc, Flame, Sparkles, Wine, Timer, PartyPopper
                };
                const IconComponent = iconMap[game.iconName] || Gamepad2;

                return (
                  <div
                    key={game.id}
                    onClick={() => setActiveGameId(game.id)}
                    className="group relative rounded-3xl p-6 bg-[#12141C]/80 hover:bg-[#181B26] border border-white/10 hover:border-rose-500/40 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-2xl hover:shadow-rose-950/20 flex flex-col justify-between"
                  >
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div 
                          className="w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110"
                          style={{ backgroundColor: `${game.accentColor}25`, color: game.accentColor }}
                        >
                          <IconComponent className="w-6 h-6" />
                        </div>
                        <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-white/[0.08] text-zinc-300 border border-white/10">
                          {game.badge}
                        </span>
                      </div>

                      <div className="space-y-1.5">
                        <h4 className="font-heading font-bold text-lg text-white group-hover:text-rose-300 transition-colors">
                          {game.title}
                        </h4>
                        <p className="text-xs font-medium text-amber-300/90">{game.subtitle}</p>
                        <p className="text-xs text-zinc-400 line-clamp-3 leading-relaxed">
                          {game.description}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-1.5 pt-2">
                        {game.tags.map((tag, i) => (
                          <span key={i} className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-white/[0.04] text-zinc-400 border border-white/[0.06]">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-6 border-t border-white/[0.08] mt-6 flex items-center justify-between text-xs text-zinc-400">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5" />
                          <span>{game.minPlayers} Lovers</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span>~{game.estDurationMinutes}m</span>
                        </span>
                      </div>

                      <div className="flex items-center gap-1 text-rose-400 font-bold group-hover:translate-x-1 transition-transform">
                        <span>Play</span>
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* SUB-VIEW 1: SUPER SEXY DICE ENGINE                                   */}
      {/* ===================================================================== */}
      {activeGameId === 'sexy_dice' && (
        <div className="max-w-4xl mx-auto px-4 sm:px-8 py-8 space-y-8 animate-fadeIn">
          
          {/* Header Controls */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl dark-glass border border-white/10">
            <div>
              <h2 className="font-heading font-bold text-xl text-white flex items-center gap-2">
                <Dices className="w-5 h-5 text-rose-400" />
                <span>Super Sexy Dice</span>
              </h2>
              <p className="text-xs text-zinc-400">Roll for action, body part, and intensity</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setDiceMode(2)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                  diceMode === 2 ? 'bg-rose-500 text-white' : 'bg-white/5 text-zinc-400 hover:text-white'
                }`}
              >
                2 Dice (Action + Body)
              </button>
              <button
                onClick={() => setDiceMode(3)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                  diceMode === 3 ? 'bg-rose-500 text-white' : 'bg-white/5 text-zinc-400 hover:text-white'
                }`}
              >
                3 Dice (+ Style / Duration)
              </button>
            </div>
          </div>

          {/* Interactive Dice Surface */}
          <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-b from-[#141724] to-[#0D0F18] border border-white/15 shadow-2xl space-y-8 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-radial-at-c from-rose-600/10 via-transparent to-transparent pointer-events-none" />

            {/* Current Turn Notification */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.06] border border-white/10 text-xs text-zinc-300">
              <span>Rolling For:</span>
              <strong className="text-amber-300">{currentTurn === 'p1' ? partner1Name : partner2Name}</strong>
            </div>

            {/* Dice Cards Container */}
            <div className="flex flex-wrap items-center justify-center gap-6">
              
              {/* Die 1: Action */}
              <div className={`w-44 sm:w-52 p-5 rounded-3xl bg-[#1A1E2E] border-2 ${
                lockedDice[0] ? 'border-amber-400 shadow-lg shadow-amber-400/20' : 'border-white/20'
              } flex flex-col items-center justify-between min-h-[190px] transition-all transform ${isDiceRolling ? 'rotate-6 scale-95' : 'hover:scale-105'}`}>
                <div className="w-full flex items-center justify-between text-[11px] font-bold text-zinc-400">
                  <span>ACTION</span>
                  <button 
                    onClick={() => setLockedDice(prev => [!prev[0], prev[1], prev[2]])}
                    className="p-1 text-zinc-400 hover:text-amber-300 cursor-pointer"
                    title={lockedDice[0] ? "Unlock Action Die" : "Lock Action Die"}
                  >
                    {lockedDice[0] ? <Lock className="w-3.5 h-3.5 text-amber-400" /> : <Unlock className="w-3.5 h-3.5" />}
                  </button>
                </div>

                <div className="my-auto py-2">
                  <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-400 mx-auto flex items-center justify-center font-black text-xl mb-2">
                    {diceResult.diceValues[0]}
                  </div>
                  <h4 className="font-heading font-extrabold text-base sm:text-lg text-white">
                    {diceResult.action}
                  </h4>
                </div>

                <span className="text-[10px] uppercase font-bold text-rose-400/90 tracking-wider">
                  {currentTier}
                </span>
              </div>

              {/* Die 2: Body Part */}
              <div className={`w-44 sm:w-52 p-5 rounded-3xl bg-[#1A1E2E] border-2 ${
                lockedDice[1] ? 'border-amber-400 shadow-lg shadow-amber-400/20' : 'border-white/20'
              } flex flex-col items-center justify-between min-h-[190px] transition-all transform ${isDiceRolling ? '-rotate-6 scale-95' : 'hover:scale-105'}`}>
                <div className="w-full flex items-center justify-between text-[11px] font-bold text-zinc-400">
                  <span>BODY PART</span>
                  <button 
                    onClick={() => setLockedDice(prev => [prev[0], !prev[1], prev[2]])}
                    className="p-1 text-zinc-400 hover:text-amber-300 cursor-pointer"
                    title={lockedDice[1] ? "Unlock Body Part Die" : "Lock Body Part Die"}
                  >
                    {lockedDice[1] ? <Lock className="w-3.5 h-3.5 text-amber-400" /> : <Unlock className="w-3.5 h-3.5" />}
                  </button>
                </div>

                <div className="my-auto py-2">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-300 mx-auto flex items-center justify-center font-black text-xl mb-2">
                    {diceResult.diceValues[1]}
                  </div>
                  <h4 className="font-heading font-extrabold text-base sm:text-lg text-white">
                    {diceResult.bodyPart}
                  </h4>
                </div>

                <span className="text-[10px] uppercase font-bold text-amber-400/90 tracking-wider">
                  Target Zone
                </span>
              </div>

              {/* Die 3: Style / Duration (Optional) */}
              {diceMode === 3 && (
                <div className={`w-44 sm:w-52 p-5 rounded-3xl bg-[#1A1E2E] border-2 ${
                  lockedDice[2] ? 'border-amber-400 shadow-lg shadow-amber-400/20' : 'border-white/20'
                } flex flex-col items-center justify-between min-h-[190px] transition-all transform ${isDiceRolling ? 'rotate-3 scale-95' : 'hover:scale-105'}`}>
                  <div className="w-full flex items-center justify-between text-[11px] font-bold text-zinc-400">
                    <span>DURATION / STYLE</span>
                    <button 
                      onClick={() => setLockedDice(prev => [prev[0], prev[1], !prev[2]])}
                      className="p-1 text-zinc-400 hover:text-amber-300 cursor-pointer"
                      title={lockedDice[2] ? "Unlock Style Die" : "Lock Style Die"}
                    >
                      {lockedDice[2] ? <Lock className="w-3.5 h-3.5 text-amber-400" /> : <Unlock className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  <div className="my-auto py-2">
                    <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-500/40 text-purple-300 mx-auto flex items-center justify-center font-black text-xl mb-2">
                      {diceResult.diceValues[2] || 1}
                    </div>
                    <h4 className="font-heading font-extrabold text-base sm:text-lg text-white">
                      {diceResult.durationOrStyle}
                    </h4>
                  </div>

                  <span className="text-[10px] uppercase font-bold text-purple-400/90 tracking-wider">
                    Execution
                  </span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
              <button
                onClick={rollDice}
                disabled={isDiceRolling}
                className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-rose-600 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-white font-heading font-extrabold text-base shadow-xl shadow-rose-600/30 hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center gap-3 disabled:opacity-50"
              >
                <Dices className={`w-5 h-5 ${isDiceRolling ? 'animate-spin' : ''}`} />
                <span>{isDiceRolling ? 'Rolling Dice...' : 'Roll Dice Now'}</span>
              </button>

              <button
                onClick={() => handleShareResult(
                  'Super Sexy Dice',
                  `Action: ${diceResult.action}\nBody Part: ${diceResult.bodyPart}${diceResult.durationOrStyle ? `\nStyle: ${diceResult.durationOrStyle}` : ''}\nTier: ${currentTier}`,
                  diceResult
                )}
                className="px-5 py-3.5 rounded-2xl bg-white/[0.08] hover:bg-white/[0.15] text-zinc-200 hover:text-white font-semibold text-sm border border-white/10 transition-all cursor-pointer flex items-center gap-2"
                title="Send result into direct chat"
              >
                <Share2 className="w-4 h-4 text-amber-400" />
                <span>Send to Chat</span>
              </button>
            </div>
          </div>

          {/* Recent Rolls History */}
          {diceHistory.length > 0 && (
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Recent Rolls This Session:</span>
              <div className="flex flex-wrap gap-2">
                {diceHistory.map((item, idx) => (
                  <span key={idx} className="px-3 py-1 rounded-xl bg-white/[0.06] text-xs text-zinc-300 border border-white/10">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===================================================================== */}
      {/* SUB-VIEW 2: PASSION ROULETTE WHEEL ENGINE                            */}
      {/* ===================================================================== */}
      {activeGameId === 'sex_roulette' && (
        <div className="max-w-4xl mx-auto px-4 sm:px-8 py-8 space-y-8 animate-fadeIn text-center">
          
          <div className="space-y-2">
            <h2 className="font-heading font-black text-2xl text-white flex items-center justify-center gap-2">
              <Disc className="w-6 h-6 text-amber-400" />
              <span>Passion Roulette Wheel</span>
            </h2>
            <p className="text-xs text-zinc-400">
              12 sectors of whispers, sensual massage, teasing, and erotic commands
            </p>
          </div>

          {/* Interactive Wheel Graphic */}
          <div className="relative w-80 h-80 sm:w-96 sm:h-96 mx-auto">
            {/* Top Pointer Needle */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -mt-4 z-20 pointer-events-none drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)]">
              <div className="w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-t-[28px] border-t-amber-400" />
            </div>

            {/* Rotating SVG Wheel */}
            <div 
              className="w-full h-full rounded-full border-4 border-amber-400/40 shadow-[0_0_50px_rgba(245,158,11,0.25)] relative overflow-hidden"
              style={{
                transform: `rotate(${rouletteAngle}deg)`,
                transition: isSpinningRoulette ? 'transform 3.8s cubic-bezier(0.15, 0.9, 0.25, 1)' : 'none'
              }}
            >
              <svg viewBox="0 0 400 400" className="w-full h-full">
                {ROULETTE_SLICES.map((slice, i) => {
                  const numSlices = ROULETTE_SLICES.length;
                  const sliceAngle = 360 / numSlices;
                  const startAngle = i * sliceAngle;
                  const endAngle = startAngle + sliceAngle;
                  
                  // SVG arc calculation
                  const r = 200;
                  const cx = 200;
                  const cy = 200;
                  const startRad = (startAngle - 90) * (Math.PI / 180);
                  const endRad = (endAngle - 90) * (Math.PI / 180);
                  const x1 = cx + r * Math.cos(startRad);
                  const y1 = cy + r * Math.sin(startRad);
                  const x2 = cx + r * Math.cos(endRad);
                  const y2 = cy + r * Math.sin(endRad);

                  const pathData = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2} Z`;
                  const textRad = (startAngle + sliceAngle / 2 - 90) * (Math.PI / 180);
                  const tx = cx + 130 * Math.cos(textRad);
                  const ty = cy + 130 * Math.sin(textRad);
                  const textRotation = startAngle + sliceAngle / 2;

                  return (
                    <g key={slice.id}>
                      <path 
                        d={pathData} 
                        fill={slice.color} 
                        fillOpacity={0.85} 
                        stroke="#11131C" 
                        strokeWidth="2" 
                      />
                      <text
                        x={tx}
                        y={ty}
                        fill="#FFFFFF"
                        fontSize="11"
                        fontWeight="bold"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        transform={`rotate(${textRotation}, ${tx}, ${ty})`}
                        className="select-none"
                      >
                        {slice.title.length > 12 ? slice.title.slice(0, 10) + '…' : slice.title}
                      </text>
                    </g>
                  );
                })}
              </svg>

              {/* Wheel Center Hub */}
              <div className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-gradient-to-tr from-[#1E2235] to-[#2E354F] border-2 border-amber-400 flex items-center justify-center text-amber-300 font-black text-sm shadow-2xl">
                <span>SPIN</span>
              </div>
            </div>
          </div>

          {/* Spin Trigger Button */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={spinRoulette}
              disabled={isSpinningRoulette}
              className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-white font-heading font-extrabold text-base shadow-xl shadow-amber-500/25 hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center gap-3 disabled:opacity-50"
            >
              <Disc className={`w-5 h-5 ${isSpinningRoulette ? 'animate-spin' : ''}`} />
              <span>{isSpinningRoulette ? 'Decelerating...' : 'Spin the Wheel'}</span>
            </button>
          </div>

          {/* Landed Outcome Card / Modal */}
          {landedSlice && (
            <div className="max-w-xl mx-auto p-6 rounded-3xl bg-[#141724] border border-amber-400/40 shadow-2xl space-y-4 text-left animate-fadeIn">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  Landed Challenge
                </span>
                <span className="text-xs text-zinc-400 capitalize">Category: {landedSlice.tier}</span>
              </div>

              <div className="space-y-1">
                <h3 className="font-heading font-extrabold text-xl text-white">
                  {landedSlice.title}
                </h3>
                <p className="text-sm text-zinc-300 leading-relaxed">
                  {landedSlice.actionPrompt}
                </p>
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-white/10">
                <button
                  onClick={() => {
                    showToast('Dare completed! (+25 Chemistry)');
                    switchTurn();
                  }}
                  className="px-4 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition-all cursor-pointer flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Mark as Completed (+25 Pts)</span>
                </button>

                <button
                  onClick={() => handleShareResult(
                    'Passion Roulette',
                    `Landed: ${landedSlice.title}\n${landedSlice.actionPrompt}`,
                    landedSlice
                  )}
                  className="p-2.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.15] text-zinc-200 hover:text-white transition-all cursor-pointer"
                  title="Share to chat"
                >
                  <Share2 className="w-4 h-4 text-amber-400" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===================================================================== */}
      {/* SUB-VIEW 3: COUPLES TRUTH OR DARE                                    */}
      {/* ===================================================================== */}
      {activeGameId === 'truth_or_dare' && (
        <div className="max-w-3xl mx-auto px-4 sm:px-8 py-8 space-y-8 animate-fadeIn">
          
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl dark-glass border border-white/10">
            <div>
              <h2 className="font-heading font-bold text-xl text-white flex items-center gap-2">
                <Flame className="w-5 h-5 text-rose-500" />
                <span>Couples Truth or Dare</span>
              </h2>
              <p className="text-xs text-zinc-400">Deep vulnerability, sensual disclosures & physical dares</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => { setTodCardType('all'); drawTodCard(); }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer ${
                  todCardType === 'all' ? 'bg-white/20 text-white' : 'bg-white/5 text-zinc-400'
                }`}
              >
                Surprise (50/50)
              </button>
              <button
                onClick={() => { setTodCardType('truth'); drawTodCard('truth'); }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer ${
                  todCardType === 'truth' ? 'bg-sky-500 text-white' : 'bg-white/5 text-zinc-400'
                }`}
              >
                Truth Only
              </button>
              <button
                onClick={() => { setTodCardType('dare'); drawTodCard('dare'); }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer ${
                  todCardType === 'dare' ? 'bg-rose-500 text-white' : 'bg-white/5 text-zinc-400'
                }`}
              >
                Dare Only
              </button>
            </div>
          </div>

          {/* Active Card Surface */}
          <div className={`p-8 sm:p-12 rounded-3xl border-2 transition-all duration-300 text-center space-y-6 ${
            currentTodCard.type === 'truth'
              ? 'bg-gradient-to-b from-[#0F1D2F] to-[#0A121F] border-sky-400/40 shadow-sky-950/40 shadow-2xl'
              : 'bg-gradient-to-b from-[#2E0F17] to-[#18080C] border-rose-500/40 shadow-rose-950/40 shadow-2xl'
          }`}>
            
            <div className="flex items-center justify-between">
              <span className={`px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                currentTodCard.type === 'truth'
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
              }`}>
                {currentTodCard.type.toUpperCase()}
              </span>

              <span className="text-xs font-semibold text-amber-300">
                +{currentTodCard.chemistryPoints} Chemistry Pts
              </span>
            </div>

            <div className="min-h-[140px] flex flex-col justify-center py-4">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">
                {currentTodCard.category}
              </span>
              <p className="text-lg sm:text-2xl font-heading font-extrabold text-white leading-relaxed">
                "{currentTodCard.prompt}"
              </p>
            </div>

            {/* Answer / Completion Buttons */}
            <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => completeTod(false)}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:scale-105 text-white font-bold text-sm shadow-lg shadow-emerald-600/25 transition-all cursor-pointer flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>I Did It! (+{currentTodCard.chemistryPoints} Pts)</span>
              </button>

              <button
                onClick={() => completeTod(true)}
                className="px-5 py-3 rounded-2xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-500/30 font-semibold text-sm transition-all cursor-pointer flex items-center gap-2"
                title="Pass this card in exchange for a passionate kiss"
              >
                <Heart className="w-4 h-4 text-rose-400 fill-rose-400" />
                <span>Pass with a Kiss (+15 Pts)</span>
              </button>

              <button
                onClick={() => drawTodCard()}
                className="p-3 rounded-2xl bg-white/[0.08] hover:bg-white/[0.15] text-zinc-300 hover:text-white transition-all cursor-pointer"
                title="Shuffle next card"
              >
                <Shuffle className="w-5 h-5" />
              </button>

              <button
                onClick={() => handleShareResult(
                  `Truth or Dare (${currentTodCard.type.toUpperCase()})`,
                  `"${currentTodCard.prompt}"\nCategory: ${currentTodCard.category} (+${currentTodCard.chemistryPoints} pts)`,
                  currentTodCard
                )}
                className="p-3 rounded-2xl bg-white/[0.08] hover:bg-white/[0.15] text-zinc-300 hover:text-white transition-all cursor-pointer"
                title="Share to chat"
              >
                <Share2 className="w-4 h-4 text-amber-400" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* SUB-VIEW 4: KAMA SUTRA CARDS ENGINE                                  */}
      {/* ===================================================================== */}
      {activeGameId === 'kama_sutra' && (
        <div className="max-w-4xl mx-auto px-4 sm:px-8 py-8 space-y-8 animate-fadeIn">
          
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl dark-glass border border-white/10">
            <div>
              <h2 className="font-heading font-bold text-xl text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                <span>Kama Sutra Cards</span>
              </h2>
              <p className="text-xs text-zinc-400">Artistic positions, emotional moods & bedroom inspiration</p>
            </div>

            <div className="flex items-center gap-2 text-xs text-zinc-400">
              <span>Card {kamaIndex + 1} of {KAMA_SUTRA_POSITIONS.length}</span>
              <button
                onClick={() => setKamaIndex((kamaIndex - 1 + KAMA_SUTRA_POSITIONS.length) % KAMA_SUTRA_POSITIONS.length)}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-200 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setKamaIndex((kamaIndex + 1) % KAMA_SUTRA_POSITIONS.length)}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-200 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Kama Sutra Position Card */}
          <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-[#1C162E] via-[#12111E] to-[#0A0A10] border border-purple-500/30 shadow-2xl space-y-6">
            
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="space-y-1">
                <span className="text-xs font-mono text-purple-300 uppercase tracking-widest">
                  {activeKama.sanskritName || 'Classical Intimacy'}
                </span>
                <h3 className="text-2xl sm:text-3xl font-heading font-black text-white">
                  {activeKama.title}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Mood: {activeKama.mood}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {activeKama.difficulty}
                </span>
                <button
                  onClick={() => toggleBookmarkKama(activeKama.id)}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                    bookmarkedPositions.includes(activeKama.id)
                      ? 'bg-rose-500 text-white border-rose-400'
                      : 'bg-white/5 text-zinc-400 border-white/10 hover:text-white'
                  }`}
                  title="Bookmark for Tonight"
                >
                  <Bookmark className="w-4 h-4" />
                </button>
              </div>
            </div>

            <p className="text-sm sm:text-base text-zinc-300 leading-relaxed">
              {activeKama.description}
            </p>

            {/* Sensory & Practical Tips */}
            <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Sensory Intimacy Tips</span>
              </span>
              <ul className="space-y-2">
                {activeKama.tips.map((tip, i) => (
                  <li key={i} className="text-xs text-zinc-300 flex items-start gap-2">
                    <span className="text-rose-400 font-bold">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-4 flex flex-wrap items-center justify-between gap-4 border-t border-white/10">
              <div className="flex items-center gap-2 text-xs text-zinc-400">
                <span>Intimacy Score:</span>
                <strong className="text-amber-300 font-mono text-sm">{activeKama.intimacyScore} / 10</strong>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleShareResult(
                    'Kama Sutra Position',
                    `"${activeKama.title}" (${activeKama.sanskritName})\nMood: ${activeKama.mood} | Level: ${activeKama.difficulty}\n${activeKama.description}`,
                    activeKama
                  )}
                  className="px-4 py-2 rounded-xl bg-white/[0.08] hover:bg-white/[0.15] text-zinc-200 hover:text-white text-xs font-semibold transition-all cursor-pointer flex items-center gap-2"
                >
                  <Share2 className="w-3.5 h-3.5 text-amber-400" />
                  <span>Send to Partner</span>
                </button>

                <button
                  onClick={() => setKamaIndex((kamaIndex + 1) % KAMA_SUTRA_POSITIONS.length)}
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-all cursor-pointer flex items-center gap-2"
                >
                  <span>Next Position</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* SUB-VIEW 5: SPIN THE BOTTLE ENGINE                                    */}
      {/* ===================================================================== */}
      {activeGameId === 'spin_bottle' && (
        <div className="max-w-4xl mx-auto px-4 sm:px-8 py-8 space-y-8 animate-fadeIn text-center">
          
          <div className="space-y-2">
            <h2 className="font-heading font-black text-2xl text-white flex items-center justify-center gap-2">
              <Wine className="w-6 h-6 text-emerald-400" />
              <span>Spin the Intimate Bottle</span>
            </h2>
            <p className="text-xs text-zinc-400">
              Flick the champagne bottle and let fate decide who initiates and who receives
            </p>
          </div>

          {/* Interactive Bottle Graphic on Circular Table */}
          <div className="relative w-80 h-80 sm:w-96 sm:h-96 mx-auto rounded-full bg-gradient-to-tr from-[#0F1E16] via-[#15291F] to-[#0A140E] border-4 border-emerald-500/30 shadow-2xl flex items-center justify-center">
            
            {/* Player Labels */}
            <div className="absolute top-4 font-bold text-xs text-emerald-300">
              {partner1Name} (Initiator)
            </div>
            <div className="absolute bottom-4 font-bold text-xs text-emerald-300">
              {partner2Name} (Receiver)
            </div>
            <div className="absolute left-4 -rotate-90 font-bold text-xs text-amber-300">
              Mutual Action
            </div>
            <div className="absolute right-4 rotate-90 font-bold text-xs text-amber-300">
              Wildcard
            </div>

            {/* Rotating SVG Bottle */}
            <div
              className="w-20 h-52 transition-transform cursor-pointer"
              style={{
                transform: `rotate(${bottleAngle}deg)`,
                transition: isSpinningBottle ? 'transform 3.2s cubic-bezier(0.12, 0.95, 0.2, 1)' : 'none'
              }}
              onClick={spinBottle}
            >
              <svg viewBox="0 0 100 260" className="w-full h-full drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)]">
                {/* Bottle Cap */}
                <rect x="42" y="5" width="16" height="15" rx="3" fill="#D97706" />
                {/* Bottle Neck */}
                <path d="M 44 20 L 44 80 Q 30 110 30 150 L 30 240 Q 30 255 50 255 Q 70 255 70 240 L 70 150 Q 70 110 56 80 L 56 20 Z" fill="#064E3B" stroke="#10B981" strokeWidth="3" />
                {/* Gold Foil Label */}
                <rect x="33" y="140" width="34" height="60" rx="4" fill="#F59E0B" fillOpacity="0.85" />
                <text x="50" y="175" fill="#000000" fontSize="12" fontWeight="bold" textAnchor="middle">
                  LOVE
                </text>
              </svg>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={spinBottle}
              disabled={isSpinningBottle}
              className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:scale-105 text-white font-heading font-extrabold text-base shadow-xl shadow-emerald-600/30 transition-all cursor-pointer disabled:opacity-50"
            >
              {isSpinningBottle ? 'Spinning Bottle...' : 'Flick & Spin Bottle'}
            </button>
          </div>

          {/* Landed Challenge Card */}
          {bottleLanded && (
            <div className="max-w-xl mx-auto p-6 rounded-3xl bg-[#121E17] border border-emerald-400/40 shadow-2xl space-y-4 text-left animate-fadeIn">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
                  Target: {bottleLanded.target.toUpperCase()}
                </span>
                <span className="text-xs text-zinc-400">Limit: {bottleLanded.timeLimitSeconds}s</span>
              </div>

              <p className="text-base text-zinc-200 font-semibold leading-relaxed">
                {bottleLanded.prompt}
              </p>

              <div className="pt-2 flex items-center justify-between border-t border-white/10">
                <button
                  onClick={() => {
                    showToast('Completed challenge! (+20 Chemistry)');
                    switchTurn();
                  }}
                  className="px-4 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition-all cursor-pointer flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Done (+20 Pts)</span>
                </button>

                <button
                  onClick={() => handleShareResult(
                    'Spin the Bottle Challenge',
                    `Target: ${bottleLanded.target}\n${bottleLanded.prompt}`,
                    bottleLanded
                  )}
                  className="p-2.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.15] text-zinc-200 hover:text-white transition-all cursor-pointer"
                  title="Share to chat"
                >
                  <Share2 className="w-4 h-4 text-emerald-400" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===================================================================== */}
      {/* SUB-VIEW 6: RUSH CHALLENGE (SEXY TIMER)                              */}
      {/* ===================================================================== */}
      {activeGameId === 'sexy_timer' && (
        <div className="max-w-3xl mx-auto px-4 sm:px-8 py-8 space-y-8 animate-fadeIn text-center">
          
          <div className="space-y-2">
            <h2 className="font-heading font-black text-2xl text-white flex items-center justify-center gap-2">
              <Timer className="w-6 h-6 text-cyan-400" />
              <span>Rush Challenge: Sexy Timer</span>
            </h2>
            <p className="text-xs text-zinc-400">
              Race against a pulsing countdown clock to complete sensory intimate missions
            </p>
          </div>

          {/* Time Preset Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            {[30, 60, 90, 120, 300].map(secs => (
              <button
                key={secs}
                onClick={() => selectTimerPreset(secs)}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  timerSelectedPreset === secs
                    ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/30'
                    : 'bg-white/5 text-zinc-400 hover:text-white'
                }`}
              >
                {secs >= 60 ? `${secs / 60}m` : `${secs}s`}
              </button>
            ))}
          </div>

          {/* Circular Countdown Progress Ring */}
          <div className="relative w-64 h-64 mx-auto flex items-center justify-center">
            <svg className="w-full h-full -rotate-90">
              <circle
                cx="128"
                cy="128"
                r="110"
                stroke="rgba(255,255,255,0.08)"
                strokeWidth="12"
                fill="none"
              />
              <circle
                cx="128"
                cy="128"
                r="110"
                stroke="#06B6D4"
                strokeWidth="12"
                strokeDasharray={2 * Math.PI * 110}
                strokeDashoffset={2 * Math.PI * 110 * (1 - (timerRemaining / timerSelectedPreset))}
                strokeLinecap="round"
                fill="none"
                className="transition-all duration-1000 ease-linear"
              />
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center space-y-1">
              <span className="font-mono text-5xl font-black text-white">
                {Math.floor(timerRemaining / 60)}:{(timerRemaining % 60).toString().padStart(2, '0')}
              </span>
              <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-300">
                {isTimerRunning ? 'PULSING CLOCK' : 'PAUSED'}
              </span>
            </div>
          </div>

          {/* Sensory Mission Details */}
          <div className="p-6 rounded-3xl bg-[#0F1E24] border border-cyan-400/30 text-left space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                Mission: {activeTimerChallenge.title}
              </span>
              <span className="text-xs text-zinc-400 font-mono">Focus: {activeTimerChallenge.sensoryFocus}</span>
            </div>
            <p className="text-sm text-zinc-200 leading-relaxed font-medium">
              {activeTimerChallenge.instructions}
            </p>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={toggleTimer}
              className={`px-8 py-3.5 rounded-2xl font-heading font-extrabold text-base shadow-xl transition-all cursor-pointer flex items-center gap-2 ${
                isTimerRunning
                  ? 'bg-amber-500 hover:bg-amber-400 text-black shadow-amber-500/25'
                  : 'bg-cyan-500 hover:bg-cyan-400 text-black shadow-cyan-500/30'
              }`}
            >
              <span>{isTimerRunning ? 'Pause Timer' : 'Start Rush'}</span>
            </button>

            <button
              onClick={() => {
                setIsTimerRunning(false);
                setTimerRemaining(timerSelectedPreset);
              }}
              className="p-3.5 rounded-2xl bg-white/[0.08] hover:bg-white/[0.15] text-zinc-300 hover:text-white transition-all cursor-pointer"
              title="Reset Timer"
            >
              <RotateCcw className="w-5 h-5" />
            </button>

            <button
              onClick={() => handleShareResult(
                'Sexy Timer Challenge',
                `Challenge: ${activeTimerChallenge.title} (${timerSelectedPreset}s)\n${activeTimerChallenge.instructions}`,
                activeTimerChallenge
              )}
              className="p-3.5 rounded-2xl bg-white/[0.08] hover:bg-white/[0.15] text-zinc-300 hover:text-white transition-all cursor-pointer"
              title="Share to chat"
            >
              <Share2 className="w-5 h-5 text-cyan-400" />
            </button>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* SUB-VIEW 7: COUPLES PARTY & DATE NIGHT GAMES                         */}
      {/* ===================================================================== */}
      {activeGameId === 'party_games' && (
        <div className="max-w-3xl mx-auto px-4 sm:px-8 py-8 space-y-8 animate-fadeIn">
          
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl dark-glass border border-white/10">
            <div>
              <h2 className="font-heading font-bold text-xl text-white flex items-center gap-2">
                <PartyPopper className="w-5 h-5 text-orange-400" />
                <span>Couples Party Games</span>
              </h2>
              <p className="text-xs text-zinc-400">Playful connection & psychological banter for two or more</p>
            </div>

            <div className="flex items-center gap-2">
              {[
                { id: 'would_you_rather', label: 'Would You Rather' },
                { id: 'never_have_i_ever', label: 'Never Have I Ever' },
                { id: 'most_likely_to', label: 'Most Likely To' }
              ].map(m => (
                <button
                  key={m.id}
                  onClick={() => {
                    setPartyMode(m.id as any);
                    setUserVoted(null);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                    partyMode === m.id ? 'bg-orange-500 text-white' : 'bg-white/5 text-zinc-400'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Active Question Prompt Card */}
          <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-[#261611] to-[#120B08] border border-orange-500/30 shadow-2xl space-y-6 text-center">
            
            <span className="text-xs font-bold text-orange-400 uppercase tracking-widest">
              {partyMode.replace(/_/g, ' ')}
            </span>

            <p className="text-lg sm:text-2xl font-heading font-extrabold text-white leading-relaxed">
              "{currentPartyPrompt.question}"
            </p>

            {/* Voting Options */}
            {partyMode === 'would_you_rather' && currentPartyPrompt.optionA && currentPartyPrompt.optionB && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                <button
                  onClick={() => handlePartyVote('A')}
                  className={`p-6 rounded-2xl border text-left transition-all cursor-pointer ${
                    userVoted === 'A'
                      ? 'bg-orange-500/30 border-orange-400 shadow-lg'
                      : 'bg-white/[0.04] border-white/10 hover:border-orange-500/40 hover:bg-white/[0.07]'
                  }`}
                >
                  <span className="text-xs font-bold text-orange-300 block mb-1">Option A</span>
                  <span className="text-sm font-semibold text-white">{currentPartyPrompt.optionA}</span>
                  {userVoted && currentPartyPrompt.stats && (
                    <div className="mt-3 text-xs font-mono text-orange-200">
                      Community: {currentPartyPrompt.stats.optionAPercent}%
                    </div>
                  )}
                </button>

                <button
                  onClick={() => handlePartyVote('B')}
                  className={`p-6 rounded-2xl border text-left transition-all cursor-pointer ${
                    userVoted === 'B'
                      ? 'bg-rose-500/30 border-rose-400 shadow-lg'
                      : 'bg-white/[0.04] border-white/10 hover:border-rose-500/40 hover:bg-white/[0.07]'
                  }`}
                >
                  <span className="text-xs font-bold text-rose-300 block mb-1">Option B</span>
                  <span className="text-sm font-semibold text-white">{currentPartyPrompt.optionB}</span>
                  {userVoted && currentPartyPrompt.stats && (
                    <div className="mt-3 text-xs font-mono text-rose-200">
                      Community: {currentPartyPrompt.stats.optionBPercent}%
                    </div>
                  )}
                </button>
              </div>
            )}

            {partyMode !== 'would_you_rather' && (
              <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
                <button
                  onClick={() => handlePartyVote('A')}
                  className="px-6 py-3 rounded-2xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-sm shadow-lg cursor-pointer"
                >
                  I Have / Me!
                </button>
                <button
                  onClick={() => handlePartyVote('B')}
                  className="px-6 py-3 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-sm cursor-pointer"
                >
                  Never / Partner!
                </button>
              </div>
            )}

            {/* Bottom Actions */}
            <div className="pt-4 flex items-center justify-between border-t border-white/10">
              <button
                onClick={() => handleShareResult(
                  'Couples Party Game',
                  `"${currentPartyPrompt.question}"\nMode: ${partyMode}`,
                  currentPartyPrompt
                )}
                className="p-2.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.15] text-zinc-200 hover:text-white transition-all cursor-pointer"
                title="Share to chat"
              >
                <Share2 className="w-4 h-4 text-orange-400" />
              </button>

              <button
                onClick={nextPartyPrompt}
                className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-orange-600 to-rose-600 text-white font-bold text-xs hover:scale-105 transition-all cursor-pointer flex items-center gap-2"
              >
                <span>Next Question</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
