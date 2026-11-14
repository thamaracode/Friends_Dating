import React, { useState, useEffect } from 'react';
import {
  motion,
  useMotionValue,
  useTransform,
  AnimatePresence,
  PanInfo
} from 'framer-motion';
import {
  Heart,
  X,
  Star,
  Sparkles,
  Info,
  MapPin,
  ShieldCheck,
  RotateCcw,
  MessageCircle,
  Volume2,
  ChevronRight,
  Flame,
  Music,
  CheckCircle2
} from 'lucide-react';
import type { UserProfile } from '../../types';

export interface TinderSwipeDeckProps {
  profiles: UserProfile[];
  onOpenProfileDetail: (profile: UserProfile) => void;
  onInitiateChat: (profile: UserProfile) => void;
  onSuperLike?: (profile: UserProfile) => void;
}

export const TinderSwipeDeck: React.FC<TinderSwipeDeckProps> = ({
  profiles,
  onOpenProfileDetail,
  onInitiateChat,
  onSuperLike
}) => {
  const [deck, setDeck] = useState<UserProfile[]>(profiles);
  const [history, setHistory] = useState<UserProfile[]>([]);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | 'up' | null>(null);
  const [matchedProfile, setMatchedProfile] = useState<UserProfile | null>(null);

  // Sync deck when incoming profiles list updates
  useEffect(() => {
    if (profiles && profiles.length > 0) {
      setDeck(profiles);
    }
  }, [profiles]);

  // Motion values for physical touch/drag
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Transform x position to tilt angle (-16deg to +16deg)
  const rotate = useTransform(x, [-220, 0, 220], [-16, 0, 16]);

  // Transform drag distance to opacity for stamps
  const likeOpacity = useTransform(x, [20, 120], [0, 1]);
  const nopeOpacity = useTransform(x, [-20, -120], [0, 1]);
  const superLikeOpacity = useTransform(y, [-20, -100], [0, 1]);

  const activeProfile = deck[0];
  const nextProfile = deck[1];

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const thresholdX = 100;
    const thresholdY = -90;

    if (info.offset.x > thresholdX) {
      // Swiped Right -> LIKE
      triggerSwipe('right');
    } else if (info.offset.x < -thresholdX) {
      // Swiped Left -> PASS (NOPE)
      triggerSwipe('left');
    } else if (info.offset.y < thresholdY) {
      // Swiped Up -> SUPER LIKE
      triggerSwipe('up');
    } else {
      // Snap back to center
      x.set(0);
      y.set(0);
    }
  };

  const triggerSwipe = (direction: 'left' | 'right' | 'up') => {
    if (!activeProfile) return;

    setSwipeDirection(direction);

    // If swiped right or super liked, check for match trigger
    if (direction === 'right' || direction === 'up') {
      if (direction === 'up' && onSuperLike) {
        onSuperLike(activeProfile);
      }
      if (activeProfile.likesYou || activeProfile.id === 'usr_tara' || activeProfile.id === 'usr_alex') {
        setTimeout(() => {
          setMatchedProfile(activeProfile);
        }, 220);
      }
    }

    setTimeout(() => {
      setHistory(prev => [activeProfile, ...prev]);
      setDeck(prev => prev.slice(1));
      setCurrentPhotoIndex(0);
      setSwipeDirection(null);
      x.set(0);
      y.set(0);
    }, 240);
  };

  const handleRewind = () => {
    if (history.length === 0) return;
    const last = history[0];
    setHistory(prev => prev.slice(1));
    setDeck(prev => [last, ...prev]);
    setCurrentPhotoIndex(0);
  };

  const handlePhotoNav = (e: React.MouseEvent, totalPhotos: number) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    if (clickX < rect.width * 0.35) {
      // Previous photo
      setCurrentPhotoIndex(prev => (prev > 0 ? prev - 1 : totalPhotos - 1));
    } else {
      // Next photo
      setCurrentPhotoIndex(prev => (prev + 1) % totalPhotos);
    }
  };

  if (!activeProfile) {
    return (
      <div className="w-full aspect-[3/4.6] max-h-[660px] rounded-3xl glin-glass-frosted border border-white/15 flex flex-col items-center justify-center p-8 text-center space-y-5 animate-in fade-in shadow-2xl">
        <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-400/20 to-rose-500/20 border border-amber-400/30 flex items-center justify-center text-amber-300 shadow-[0_0_24px_rgba(245,158,11,0.25)]">
          <Sparkles className="w-10 h-10 animate-spin-slow" />
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl font-black text-white font-heading tracking-tight">You've Discovered Everyone!</h3>
          <p className="text-sm text-zinc-300 max-w-sm mx-auto leading-relaxed">
            You reached the end of the current soul resonance deck. Revisit skipped connections or expand your filters.
          </p>
        </div>
        <button
          onClick={() => {
            setDeck(profiles);
            setHistory([]);
          }}
          className="h-12 px-7 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 text-zinc-950 font-heading font-bold text-sm shadow-[0_4px_20px_rgba(245,158,11,0.35)] hover:scale-105 active:scale-95 transition-all cursor-pointer"
        >
          Discover Deck Again
        </button>
      </div>
    );
  }

  const photos = activeProfile.photos && activeProfile.photos.length > 0 
    ? activeProfile.photos 
    : [activeProfile.avatar];

  return (
    <div className="relative w-full max-w-sm sm:max-w-md mx-auto flex flex-col items-center select-none pt-2">
      
      {/* ── TINDER CARD STACK CONTAINER ────────────────────────── */}
      <div className="relative w-full aspect-[3/4.6] sm:aspect-[3/4.4] max-h-[640px]">
        
        {/* Next Card in Stack (Sits underneath, scales up when top card leaves) */}
        {nextProfile && (
          <div className="absolute inset-0 rounded-3xl overflow-hidden border border-white/10 bg-[#0E1017] shadow-xl scale-[0.95] translate-y-3 pointer-events-none opacity-80 transition-all duration-300">
            <img
              src={nextProfile.photos?.[0] || nextProfile.avatar}
              alt={nextProfile.name}
              className="w-full h-full object-cover filter brightness-[0.7]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 text-white/90">
              <h3 className="text-xl font-bold font-heading">{nextProfile.name}, {nextProfile.age}</h3>
              <p className="text-xs text-zinc-400">{nextProfile.location}</p>
            </div>
          </div>
        )}

        {/* Top Active Swipable Card (Drag & Physics) */}
        <motion.div
          key={activeProfile.id}
          style={{ x, y, rotate }}
          drag
          dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
          dragElastic={0.9}
          onDragEnd={handleDragEnd}
          className="absolute inset-0 w-full h-full rounded-3xl overflow-hidden border border-white/20 glin-glass-liquid shadow-2xl cursor-grab active:cursor-grabbing z-20"
          animate={
            swipeDirection === 'right'
              ? { x: 500, rotate: 25, opacity: 0 }
              : swipeDirection === 'left'
              ? { x: -500, rotate: -25, opacity: 0 }
              : swipeDirection === 'up'
              ? { y: -500, opacity: 0 }
              : { x: 0, y: 0, rotate: 0, opacity: 1 }
          }
          transition={{ duration: 0.22, ease: 'easeOut' }}
        >
          {/* Main Background Photo */}
          <div
            onClick={(e) => handlePhotoNav(e, photos.length)}
            className="relative w-full h-full"
          >
            <img
              src={photos[currentPhotoIndex] || activeProfile.avatar}
              alt={activeProfile.name}
              className="w-full h-full object-cover pointer-events-none"
            />

            {/* Gradient Scrim for text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/35 to-black/20 pointer-events-none" />

            {/* Photo Segment Bars (Instagram / Tinder Stories style) */}
            {photos.length > 1 && (
              <div className="absolute top-3 inset-x-3 z-30 flex items-center gap-1.5">
                {photos.map((_, idx) => (
                  <div
                    key={idx}
                    className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                      idx === currentPhotoIndex
                        ? 'bg-white shadow-[0_0_8px_#ffffff]'
                        : 'bg-white/30 backdrop-blur-sm'
                    }`}
                  />
                ))}
              </div>
            )}

            {/* ── TINDER STAMPS (Fades in dynamically on drag) ──── */}
            
            {/* LIKE STAMP (Right Drag -> Green) */}
            <motion.div
              style={{ opacity: likeOpacity }}
              className="absolute top-10 left-6 z-30 pointer-events-none border-[3.5px] border-emerald-400 rounded-2xl px-5 py-2 -rotate-12 bg-black/40 backdrop-blur-md shadow-2xl"
            >
              <span className="font-heading font-black text-2xl sm:text-3xl text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <Heart className="w-6 h-6 fill-emerald-400" />
                <span>LIKE</span>
              </span>
            </motion.div>

            {/* NOPE / PASS STAMP (Left Drag -> Red) */}
            <motion.div
              style={{ opacity: nopeOpacity }}
              className="absolute top-10 right-6 z-30 pointer-events-none border-[3.5px] border-rose-500 rounded-2xl px-5 py-2 rotate-12 bg-black/40 backdrop-blur-md shadow-2xl"
            >
              <span className="font-heading font-black text-2xl sm:text-3xl text-rose-500 uppercase tracking-wider flex items-center gap-1.5">
                <X className="w-6 h-6 stroke-[3]" />
                <span>NOPE</span>
              </span>
            </motion.div>

            {/* SUPER LIKE STAMP (Up Drag -> Cyan/Amber) */}
            <motion.div
              style={{ opacity: superLikeOpacity }}
              className="absolute bottom-36 inset-x-0 mx-auto w-fit z-30 pointer-events-none border-[3.5px] border-cyan-400 rounded-2xl px-6 py-2 -rotate-3 bg-black/50 backdrop-blur-md shadow-2xl"
            >
              <span className="font-heading font-black text-2xl sm:text-3xl text-cyan-400 uppercase tracking-wider flex items-center gap-2">
                <Star className="w-6 h-6 fill-cyan-400" />
                <span>SUPER LIKE</span>
              </span>
            </motion.div>

            {/* Top Chemistry & Verification Badges */}
            <div className="absolute top-7 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
              <span className="h-8 px-3 rounded-full text-xs font-heading font-bold bg-black/60 backdrop-blur-md text-amber-300 border border-amber-400/30 flex items-center gap-1.5 shadow-lg">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>{activeProfile.compatibilityScore || (activeProfile as any).matchScore || 94}% Soul Chemistry</span>
              </span>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenProfileDetail(activeProfile);
                }}
                className="w-9 h-9 rounded-full bg-black/60 backdrop-blur-md text-white border border-white/20 hover:bg-white/20 transition-all flex items-center justify-center pointer-events-auto cursor-pointer shadow-lg active:scale-90"
                title="View Full Profile & Timeline"
              >
                <Info className="w-4 h-4" />
              </button>
            </div>

            {/* Bottom Profile Details Overlay */}
            <div className="absolute bottom-5 inset-x-5 z-20 space-y-3 pointer-events-none">
              <div>
                <div className="flex items-center gap-2.5">
                  <h2 className="text-2xl sm:text-3xl font-black text-white font-heading tracking-tight drop-shadow-md">
                    {activeProfile.name}, {activeProfile.age}
                  </h2>
                  <span title="Identity Verified">
                    <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-zinc-300 flex items-center gap-2 mt-0.5 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                  <span>{activeProfile.location}</span>
                  <span>·</span>
                  <span className="text-white font-semibold">{activeProfile.status || 'Active Member'}</span>
                </p>
              </div>

              {/* Tagline */}
              <p className="text-xs sm:text-sm text-zinc-200/90 italic line-clamp-2 leading-relaxed border-l-2 border-amber-400 pl-3">
                "{activeProfile.tagline || (activeProfile as any).bio || activeProfile.headline || 'Curious mind exploring deep connections in the Soulverse.'}"
              </p>

              {/* Core Values & Intent Pills */}
              <div className="flex items-center gap-2 flex-wrap text-xs pt-0.5">
                <span className="px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 font-heading font-bold">
                  {activeProfile.intent || 'Meaningful Connection'}
                </span>
                {(activeProfile.coreValues || (activeProfile as any).values || ['Authenticity', 'Curiosity']).slice(0, 2).map((val: string) => (
                  <span key={val} className="px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-md text-zinc-200 border border-white/15 font-medium">
                    {val}
                  </span>
                ))}
              </div>
            </div>

          </div>
        </motion.div>

      </div>

      {/* ── TINDER FLOATING ACTION BUTTONS BAR ───────────────────── */}
      <div className="flex items-center justify-center gap-3 sm:gap-4.5 pt-5 pb-2 z-30">
        
        {/* Rewind / Undo Button */}
        <button
          onClick={handleRewind}
          disabled={history.length === 0}
          className="w-11 h-11 rounded-full glin-glass-liquid border border-amber-400/30 text-amber-300 hover:border-amber-400 hover:bg-amber-400/10 flex items-center justify-center transition-all cursor-pointer disabled:opacity-30 disabled:pointer-events-none active:scale-90 shadow-lg"
          title="Rewind / Undo Last Swipe"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {/* Pass / Nope Button (Red ❌) */}
        <button
          onClick={() => triggerSwipe('left')}
          className="w-14 h-14 rounded-full glin-glass-liquid border border-rose-500/40 text-rose-400 hover:text-rose-300 hover:border-rose-400 hover:bg-rose-950/30 flex items-center justify-center transition-all cursor-pointer active:scale-90 shadow-[0_8px_24px_rgba(244,63,94,0.25)] hover:shadow-[0_8px_30px_rgba(244,63,94,0.4)]"
          title="Pass / Nope"
        >
          <X className="w-6 h-6 stroke-[3]" />
        </button>

        {/* Super Like Button (Cyan ⭐) */}
        <button
          onClick={() => triggerSwipe('up')}
          className="w-12 h-12 rounded-full glin-glass-liquid border border-cyan-400/40 text-cyan-300 hover:text-cyan-200 hover:border-cyan-300 hover:bg-cyan-950/30 flex items-center justify-center transition-all cursor-pointer active:scale-90 shadow-[0_8px_20px_rgba(6,182,212,0.25)]"
          title="Super Like"
        >
          <Star className="w-5 h-5 fill-cyan-400/40 text-cyan-300" />
        </button>

        {/* Like / Heart Button (Large Green 💚) */}
        <button
          onClick={() => triggerSwipe('right')}
          className="w-16 h-16 rounded-full bg-gradient-to-tr from-emerald-500 via-teal-500 to-emerald-400 text-zinc-950 flex items-center justify-center transition-all cursor-pointer active:scale-90 shadow-[0_0_28px_rgba(16,185,129,0.55)] hover:shadow-[0_0_36px_rgba(16,185,129,0.7)] hover:scale-105"
          title="Like / Heart"
        >
          <Heart className="w-8 h-8 fill-zinc-950 text-zinc-950 stroke-[2.5]" />
        </button>

        {/* Direct Instant Message Button (Purple 💬) */}
        <button
          onClick={() => onInitiateChat(activeProfile)}
          className="w-11 h-11 rounded-full glin-glass-liquid border border-purple-400/40 text-purple-300 hover:text-purple-200 hover:border-purple-400 hover:bg-purple-950/30 flex items-center justify-center transition-all cursor-pointer active:scale-90 shadow-lg"
          title="Direct Message"
        >
          <MessageCircle className="w-4 h-4" />
        </button>

      </div>

      {/* ── IT'S A MATCH CELEBRATION MODAL ───────────────────────── */}
      <AnimatePresence>
        {matchedProfile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-2xl flex flex-col items-center justify-center p-6 text-center animate-in fade-in"
          >
            <motion.div
              initial={{ scale: 0.8, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 30 }}
              className="max-w-md w-full glin-glass-frosted p-8 rounded-3xl border border-white/20 shadow-2xl space-y-6"
            >
              {/* Animated Match Header */}
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 text-xs font-bold uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Resonance Aligned</span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-rose-300 to-amber-200 font-heading tracking-tight">
                  It's a Soul Match!
                </h2>
                <p className="text-xs sm:text-sm text-zinc-300">
                  You and <strong>{matchedProfile.name}</strong> felt a mutual spark of authentic chemistry.
                </p>
              </div>

              {/* Dual Floating Avatars */}
              <div className="flex items-center justify-center -space-x-4 py-2">
                <div className="w-20 h-20 rounded-full border-4 border-amber-400 shadow-xl overflow-hidden bg-zinc-800 z-10">
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80"
                    alt="You"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="w-20 h-20 rounded-full border-4 border-emerald-400 shadow-xl overflow-hidden bg-zinc-800">
                  <img
                    src={matchedProfile.photos?.[0] || matchedProfile.avatar}
                    alt={matchedProfile.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Match Actions */}
              <div className="space-y-3 pt-2">
                <button
                  onClick={() => {
                    const target = matchedProfile;
                    setMatchedProfile(null);
                    onInitiateChat(target);
                  }}
                  className="w-full h-12 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-zinc-950 font-heading font-extrabold text-sm shadow-[0_0_25px_rgba(245,158,11,0.5)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Say Hello to {matchedProfile.name}</span>
                </button>

                <button
                  onClick={() => setMatchedProfile(null)}
                  className="w-full h-11 rounded-2xl bg-white/10 hover:bg-white/15 text-zinc-300 hover:text-white font-medium text-xs transition-colors cursor-pointer"
                >
                  Keep Swiping
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
