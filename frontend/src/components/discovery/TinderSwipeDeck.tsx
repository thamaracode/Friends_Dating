import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  RefreshCw,
  Loader2
} from 'lucide-react';
import type { UserProfile } from '../../types';
import { SwipeSyncEngine } from '../../utils/swipeSyncEngine';

export interface TinderSwipeDeckProps {
  initialProfiles?: UserProfile[];
  profiles?: UserProfile[]; // Backward compatibility with SoulverseMobileDiscoverExperience
  category?: string;
  onOpenProfileDetail: (profile: UserProfile) => void;
  onInitiateChat: (profile: UserProfile) => void;
  onSuperLike?: (profile: UserProfile) => void;
}

export const TinderSwipeDeck: React.FC<TinderSwipeDeckProps> = ({
  initialProfiles,
  profiles,
  category = 'all',
  onOpenProfileDetail,
  onInitiateChat,
  onSuperLike
}) => {
  const [deck, setDeck] = useState<UserProfile[]>([]);
  const [history, setHistory] = useState<UserProfile[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | 'up' | null>(null);
  const [matchedProfile, setMatchedProfile] = useState<UserProfile | null>(null);
  const [isResettingPasses, setIsResettingPasses] = useState(false);

  // Guards against multiple swipe callbacks for a single card gesture
  const isSwipingRef = useRef(false);
  const seenIdsRef = useRef<Set<string>>(new Set());

  // Motion values for physical touch/drag
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Transform x position to tilt angle (-16deg to +16deg)
  const rotate = useTransform(x, [-220, 0, 220], [-16, 0, 16]);

  // Transform drag distance to opacity for live stamps
  const likeOpacity = useTransform(x, [20, 120], [0, 1]);
  const nopeOpacity = useTransform(x, [-20, -120], [0, 1]);
  const superLikeOpacity = useTransform(y, [-20, -100], [0, 1]);

  /**
   * Helper to map raw backend DiscoveryFeedItem into frontend UserProfile
   */
  const mapDiscoveryItemToProfile = useCallback((item: any): UserProfile => {
    const p = item.profile;
    const photos = Array.isArray(p.photos) && p.photos.length > 0 
      ? p.photos 
      : [p.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800'];

    return {
      id: p.id,
      name: p.name,
      username: p.username || `user_${p.id.slice(-4)}`,
      age: p.age,
      location: `${p.city || 'Colombo'}, ${p.country || 'Sri Lanka'}`,
      avatar: p.avatar_url,
      photos: photos,
      tagline: p.tagline || 'Exploring deep human connection.',
      headline: p.tagline || 'Exploring deep human connection.',
      aboutMeLong: p.bio || 'Finding beauty in honest conversations.',
      intent: p.primary_intention === 'dating' ? 'Dating' : 'Friendship',
      status: p.tagline || 'Active Member',
      coreValues: p.core_values || ['Authenticity', 'Curiosity'],
      interests: p.interests || ['Philosophy', 'Indie Games'],
      compatibilityScore: item.resonance?.overallResonanceScore || 88,
      likesYou: Boolean(item.hasLikedViewer),
      languages: ['English', 'Sinhala'],
      energy: (p.lifestyle?.social_energy === 'introvert' ? 'Introvert' : p.lifestyle?.social_energy === 'extrovert' ? 'Extrovert' : 'Ambivert') as any,
      conflictStyle: 'Direct Discussion' as any,
      affectionStyle: 'Quality Time' as any,
      socialEnergy: 'Recharge in Solitude' as any,
      idealConversation: p.bio || 'Thoughtful dialogue without superficial pressure.',
      likes: p.interests || [],
      dislikes: ['Dishonesty'],
      deepQuestion: {
        question: 'What is something you used to believe that you have since outgrown?',
        answer: p.tagline || 'Expecting certainty where curiosity is needed.'
      },
      personalQuote: {
        quote: p.tagline || 'To understand someone is the quietest form of love.',
        author: p.name
      }
    };
  }, []);

  /**
   * Preload upcoming images into browser cache for instantaneous render
   */
  const preloadUpcomingImages = useCallback((profilesToPreload: UserProfile[]) => {
    profilesToPreload.slice(0, 3).forEach(prof => {
      const imgUrl = prof.photos?.[0] || prof.avatar;
      if (imgUrl) {
        const img = new Image();
        img.src = imgUrl;
      }
    });
  }, []);

  /**
   * Fetch initial feed batch (~20 profiles) from server
   */
  const fetchInitialFeed = useCallback(async () => {
    setIsLoading(true);
    seenIdsRef.current.clear();

    try {
      let url = `/api/v1/discovery/swipe/feed?limit=20`;
      if (category && category !== 'all') {
        url += `&connectionType=${encodeURIComponent(category)}`;
      }

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.items)) {
          const mapped: UserProfile[] = data.items.map(mapDiscoveryItemToProfile);
          
          // Deduplicate
          const unique: UserProfile[] = [];
          for (const item of mapped) {
            if (!seenIdsRef.current.has(item.id)) {
              seenIdsRef.current.add(item.id);
              unique.push(item);
            }
          }

          setDeck(unique);
          setCursor(data.nextCursor || null);
          setHasMore(Boolean(data.hasMore));
          preloadUpcomingImages(unique);
          setIsLoading(false);
          return;
        }
      }
    } catch (err) {
      console.warn('Initial swipe feed fetch notice:', err);
    }

    // Fallback to initial/prop profiles if network offline
    const fallbackList = initialProfiles || profiles || [];
    if (fallbackList.length > 0) {
      const unique: UserProfile[] = [];
      for (const item of fallbackList) {
        if (!seenIdsRef.current.has(item.id)) {
          seenIdsRef.current.add(item.id);
          unique.push(item);
        }
      }
      setDeck(unique);
      preloadUpcomingImages(unique);
    }
    setIsLoading(false);
  }, [category, initialProfiles, profiles, mapDiscoveryItemToProfile, preloadUpcomingImages]);

  /**
   * Fetch next batch when queue runs low (<= 5 profiles remain)
   */
  const fetchNextBatch = useCallback(async () => {
    if (isLoadingMore || !hasMore || !cursor) return;
    setIsLoadingMore(true);

    try {
      const activeIds = deck.map(p => p.id).join(',');
      let url = `/api/v1/discovery/swipe/feed?cursor=${encodeURIComponent(cursor)}&limit=15&excludeIds=${encodeURIComponent(activeIds)}`;
      if (category && category !== 'all') {
        url += `&connectionType=${encodeURIComponent(category)}`;
      }

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.items)) {
          const mapped: UserProfile[] = data.items.map(mapDiscoveryItemToProfile);
          
          const newUnique: UserProfile[] = [];
          for (const item of mapped) {
            if (!seenIdsRef.current.has(item.id)) {
              seenIdsRef.current.add(item.id);
              newUnique.push(item);
            }
          }

          setDeck(prev => [...prev, ...newUnique]);
          setCursor(data.nextCursor || null);
          setHasMore(Boolean(data.hasMore));
          preloadUpcomingImages(newUnique);
        }
      }
    } catch (err) {
      console.warn('Infinite swipe feed batch fetch notice:', err);
    } finally {
      setIsLoadingMore(false);
    }
  }, [cursor, hasMore, isLoadingMore, deck, category, mapDiscoveryItemToProfile, preloadUpcomingImages]);

  // Load feed on mount and when category filter updates
  useEffect(() => {
    fetchInitialFeed();
  }, [fetchInitialFeed]);

  // Initialize auto-drain outbox sync for offline resilience
  useEffect(() => {
    const cleanup = SwipeSyncEngine.initAutoDrain();
    return cleanup;
  }, []);

  // Monitor deck length: trigger prefetch when 5 or fewer profiles remain
  useEffect(() => {
    if (deck.length <= 5 && hasMore && !isLoadingMore && !isLoading) {
      fetchNextBatch();
    }
  }, [deck.length, hasMore, isLoadingMore, isLoading, fetchNextBatch]);

  const activeProfile = deck[0];
  const nextProfile = deck[1];

  /**
   * Perform persistent swipe with optimism, idempotency, and match detection
   */
  const triggerSwipe = useCallback((direction: 'left' | 'right' | 'up') => {
    if (!activeProfile || isSwipingRef.current) return;
    isSwipingRef.current = true;

    setSwipeDirection(direction);
    const target = activeProfile;
    const actionType: 'like' | 'pass' | 'superlike' = 
      direction === 'right' ? 'like' : direction === 'up' ? 'superlike' : 'pass';

    // Unique action ID for idempotency protection
    const actionId = `swipe_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    // Queue in offline outbox and execute immediately
    SwipeSyncEngine.enqueue({
      actionId,
      targetUserId: target.id,
      action: actionType,
      connectionType: 'dating',
      timestamp: Date.now()
    });

    SwipeSyncEngine.executeSwipe({
      actionId,
      targetUserId: target.id,
      action: actionType,
      connectionType: 'dating',
      timestamp: Date.now(),
      retries: 0
    }).then(result => {
      if (result.success || !result.networkError) {
        SwipeSyncEngine.dequeue(actionId);
      }
      if (result.isMatch) {
        setMatchedProfile(target);
      }
    }).catch(err => {
      console.warn('Swipe sync background notice:', err);
    });

    if (direction === 'up' && onSuperLike) {
      onSuperLike(target);
    }

    // Local match simulation for demo accounts if server offline
    if ((direction === 'right' || direction === 'up') && target.likesYou) {
      setTimeout(() => {
        setMatchedProfile(target);
      }, 220);
    }

    // Card slide out animation timeout
    setTimeout(() => {
      setHistory(prev => [target, ...prev]);
      setDeck(prev => prev.slice(1));
      setCurrentPhotoIndex(0);
      setSwipeDirection(null);
      x.set(0);
      y.set(0);
      isSwipingRef.current = false;
    }, 240);
  }, [activeProfile, onSuperLike, x, y]);

  /**
   * Handle physical gesture release
   */
  const handleDragEnd = useCallback((_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const thresholdX = 100;
    const thresholdY = -90;

    if (info.offset.x > thresholdX) {
      triggerSwipe('right');
    } else if (info.offset.x < -thresholdX) {
      triggerSwipe('left');
    } else if (info.offset.y < thresholdY) {
      triggerSwipe('up');
    } else {
      // Snap back smoothly
      x.set(0);
      y.set(0);
    }
  }, [triggerSwipe, x, y]);

  /**
   * Undo last swipe with server confirmation
   */
  const handleRewind = useCallback(async () => {
    if (history.length === 0 && !cursor) return;

    try {
      const res = await fetch('/api/v1/discovery/swipe/undo', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.restoredProfile) {
          const restored = mapDiscoveryItemToProfile({ profile: data.restoredProfile, resonance: { overallResonanceScore: 92 } });
          setDeck(prev => [restored, ...prev]);
          setHistory(prev => prev.filter(h => h.id !== restored.id));
          setCurrentPhotoIndex(0);
          return;
        }
      }
    } catch (e) {
      console.warn('Server swipe undo notice:', e);
    }

    // Local fallback rewind
    if (history.length > 0) {
      const last = history[0];
      setHistory(prev => prev.slice(1));
      setDeck(prev => [last, ...prev]);
      setCurrentPhotoIndex(0);
    }
  }, [history, cursor, mapDiscoveryItemToProfile]);

  /**
   * Replenish discovery queue by resetting passed profiles
   */
  const handleResetPasses = useCallback(async () => {
    setIsResettingPasses(true);
    try {
      await fetch('/api/v1/discovery/swipe/reset-passes', { method: 'POST' });
      await fetchInitialFeed();
    } catch (e) {
      console.warn('Reset passes notice:', e);
    } finally {
      setIsResettingPasses(false);
    }
  }, [fetchInitialFeed]);

  /**
   * Photo carousel tap navigation
   */
  const handlePhotoNav = useCallback((e: React.MouseEvent, totalPhotos: number) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    if (clickX < rect.width * 0.35) {
      setCurrentPhotoIndex(prev => (prev > 0 ? prev - 1 : totalPhotos - 1));
    } else {
      setCurrentPhotoIndex(prev => (prev + 1) % totalPhotos);
    }
  }, []);

  /**
   * Keyboard shortcuts support:
   * ArrowLeft -> Pass
   * ArrowRight -> Like
   * ArrowUp -> Super Like
   * KeyZ or Backspace -> Undo
   * Space or Enter -> View Profile Detail
   */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept when user is typing in an input or textarea
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return;
      }

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        triggerSwipe('left');
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        triggerSwipe('right');
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        triggerSwipe('up');
      } else if (e.key === 'z' || e.key === 'Z' || e.key === 'Backspace') {
        e.preventDefault();
        handleRewind();
      } else if (e.key === ' ' || e.key === 'Enter') {
        if (activeProfile) {
          e.preventDefault();
          onOpenProfileDetail(activeProfile);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeProfile, triggerSwipe, handleRewind, onOpenProfileDetail]);

  // Loading skeleton state
  if (isLoading && deck.length === 0) {
    return (
      <div className="w-full aspect-[3/4.6] max-h-[640px] max-w-sm sm:max-w-md mx-auto rounded-3xl glin-glass-frosted border border-white/10 flex flex-col items-center justify-center p-8 text-center space-y-4 shadow-2xl">
        <Loader2 className="w-10 h-10 text-amber-400 animate-spin" />
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-white font-heading">Curating Resonant Souls...</h3>
          <p className="text-xs text-zinc-400">Evaluating compatibility dimensions and shared values</p>
        </div>
      </div>
    );
  }

  // Real Empty State when all eligible profiles have been discovered
  if (!activeProfile) {
    return (
      <div className="w-full aspect-[3/4.6] max-h-[640px] max-w-sm sm:max-w-md mx-auto rounded-3xl glin-glass-frosted border border-white/15 flex flex-col items-center justify-center p-8 text-center space-y-5 animate-in fade-in shadow-2xl">
        <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-400/20 to-purple-500/20 border border-amber-400/30 flex items-center justify-center text-amber-300 shadow-[0_0_24px_rgba(245,158,11,0.25)]">
          <Sparkles className="w-10 h-10 animate-pulse" />
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl font-black text-white font-heading tracking-tight">You've Caught Up!</h3>
          <p className="text-xs sm:text-sm text-zinc-300 max-w-sm mx-auto leading-relaxed">
            You've discovered all available people matching your current filter in this region. You can revisit previously passed profiles or broaden your criteria.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-xs pt-2">
          <button
            onClick={handleResetPasses}
            disabled={isResettingPasses}
            className="w-full h-12 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 text-zinc-950 font-heading font-bold text-sm shadow-[0_4px_20px_rgba(245,158,11,0.35)] hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            {isResettingPasses ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
            <span>Revisit Skipped Profiles</span>
          </button>
          
          <button
            onClick={fetchInitialFeed}
            className="w-full h-11 rounded-2xl bg-white/10 hover:bg-white/15 text-zinc-200 font-medium text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Check for New Members</span>
          </button>
        </div>
      </div>
    );
  }

  const photos = activeProfile.photos && activeProfile.photos.length > 0 
    ? activeProfile.photos 
    : [activeProfile.avatar];

  return (
    <div className="relative w-full max-w-sm sm:max-w-md mx-auto flex flex-col items-center select-none pt-1">
      
      {/* ── TINDER CARD STACK CONTAINER ────────────────────────── */}
      <div className="relative w-full h-[calc(100dvh-270px)] min-h-[390px] max-h-[540px] sm:max-h-[600px]">
        
        {/* Next Card in Stack (Sits underneath at scale(0.95), smoothly enters) */}
        {nextProfile && (
          <div className="absolute inset-0 rounded-3xl overflow-hidden border border-white/10 bg-[#0E1017] shadow-xl scale-[0.95] translate-y-3 pointer-events-none opacity-80 transition-all duration-300">
            <img
              src={nextProfile.photos?.[0] || nextProfile.avatar}
              alt={nextProfile.name}
              className="w-full h-full object-cover filter brightness-[0.7]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 text-white/90">
              <h3 className="text-xl font-bold font-heading">{nextProfile.name}, {nextProfile.age}</h3>
              <p className="text-xs text-zinc-400">{nextProfile.location}</p>
            </div>
          </div>
        )}

        {/* Top Active Swipable Card (Drag Physics & Tilt) */}
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
              <div className="absolute top-3 inset-x-3 z-30 flex items-center gap-1.5 pointer-events-none">
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

            {/* Top Chemistry & Info Buttons */}
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
                title="View Full Profile & Resonance Details (Space)"
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
      <div className="flex items-center justify-center gap-3 sm:gap-4.5 pt-3 pb-1 z-30">
        
        {/* Rewind / Undo Button (Z or Backspace) */}
        <button
          onClick={handleRewind}
          disabled={history.length === 0}
          className="w-11 h-11 rounded-full glin-glass-liquid border border-amber-400/30 text-amber-300 hover:border-amber-400 hover:bg-amber-400/10 flex items-center justify-center transition-all cursor-pointer disabled:opacity-30 disabled:pointer-events-none active:scale-90 shadow-lg"
          title="Rewind / Undo Last Swipe (Key: Z)"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {/* Pass / Nope Button (Red ❌, Key: ArrowLeft) */}
        <button
          onClick={() => triggerSwipe('left')}
          className="w-14 h-14 rounded-full glin-glass-liquid border border-rose-500/40 text-rose-400 hover:text-rose-300 hover:border-rose-400 hover:bg-rose-950/30 flex items-center justify-center transition-all cursor-pointer active:scale-90 shadow-[0_8px_24px_rgba(244,63,94,0.25)] hover:shadow-[0_8px_30px_rgba(244,63,94,0.4)]"
          title="Pass / Nope (Key: ←)"
        >
          <X className="w-6 h-6 stroke-[3]" />
        </button>

        {/* Super Like Button (Cyan ⭐, Key: ArrowUp) */}
        <button
          onClick={() => triggerSwipe('up')}
          className="w-12 h-12 rounded-full glin-glass-liquid border border-cyan-400/40 text-cyan-300 hover:text-cyan-200 hover:border-cyan-300 hover:bg-cyan-950/30 flex items-center justify-center transition-all cursor-pointer active:scale-90 shadow-[0_8px_20px_rgba(6,182,212,0.25)]"
          title="Super Like (Key: ↑)"
        >
          <Star className="w-5 h-5 fill-cyan-400/40 text-cyan-300" />
        </button>

        {/* Like / Heart Button (Large Green 💚, Key: ArrowRight) */}
        <button
          onClick={() => triggerSwipe('right')}
          className="w-16 h-16 rounded-full bg-gradient-to-tr from-emerald-500 via-teal-500 to-emerald-400 text-zinc-950 flex items-center justify-center transition-all cursor-pointer active:scale-90 shadow-[0_0_28px_rgba(16,185,129,0.55)] hover:shadow-[0_0_36px_rgba(16,185,129,0.7)] hover:scale-105"
          title="Like / Heart (Key: →)"
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

      {/* Keyboard hints helper pill */}
      <div className="hidden sm:flex items-center gap-3 text-[11px] font-mono text-zinc-500 pt-1">
        <span>← Pass</span>
        <span>·</span>
        <span>↑ Super Like</span>
        <span>·</span>
        <span>→ Like</span>
        <span>·</span>
        <span>Z Undo</span>
        <span>·</span>
        <span>Space Details</span>
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
