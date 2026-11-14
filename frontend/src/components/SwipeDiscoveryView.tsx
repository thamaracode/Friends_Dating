import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  X, 
  Star, 
  Sparkles, 
  Info, 
  MapPin, 
  ShieldCheck, 
  MessageCircle, 
  RotateCcw,
  Zap,
  Volume2,
  ChevronUp,
  VolumeX,
  Share2
} from 'lucide-react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { MOCK_PROFILES } from '../mockData';
import type { UserProfile } from '../types';

interface SwipeDiscoveryViewProps {
  onOpenProfileDetail: (profile: UserProfile) => void;
  onInitiateChat: (profile: UserProfile) => void;
  onSuperLike: (profile: UserProfile) => void;
}

export const SwipeDiscoveryView: React.FC<SwipeDiscoveryViewProps> = ({
  onOpenProfileDetail,
  onInitiateChat,
  onSuperLike
}) => {
  const [profiles, setProfiles] = useState<UserProfile[]>(MOCK_PROFILES);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [matchModalProfile, setMatchModalProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    fetch('/api/v1/users')
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.users) && data.users.length > 0) {
          const apiUsers: UserProfile[] = data.users.map((u: any) => ({
            id: u.id,
            name: u.name,
            username: u.username,
            age: 26,
            location: 'Colombo, Sri Lanka',
            avatar: u.avatar || u.avatarUrl,
            verified: Boolean(u.isVerified),
            bio: u.bio || u.title,
            tags: u.interests || ['Philosophy', 'Indie Craft'],
            values: ['Authenticity', 'Curiosity'],
            lookingFor: 'Thoughtful conversation & collaborative connection',
            dealbreakers: ['Superficial small talk'],
            matchScore: 92,
            musicInterest: 'Ambient & Lo-Fi',
            activeStatus: u.statusText || 'Active now',
            status: u.title || 'Soulverse Member',
            photos: [u.avatar || u.avatarUrl, u.coverImage].filter(Boolean)
          }));
          const seen = new Set();
          const combined: UserProfile[] = [];
          for (const p of [...apiUsers, ...MOCK_PROFILES]) {
            if (!seen.has(p.id)) {
              seen.add(p.id);
              combined.push(p);
            }
          }
          setProfiles(combined);
        }
      })
      .catch(e => console.warn('Swipe discovery user fetch notice:', e));
  }, []);

  const currentProfile = profiles[currentIndex];

  const handleSwipe = (direction: 'left' | 'right' | 'up') => {
    if (!currentProfile) return;

    if (direction === 'right') {
      // Trigger match if profile liked you
      if (currentProfile.likesYou || currentProfile.id === 'usr_tara') {
        setMatchModalProfile(currentProfile);
      }
    } else if (direction === 'up') {
      onSuperLike(currentProfile);
      setMatchModalProfile(currentProfile);
    }

    setCurrentPhotoIndex(0);
    setCurrentIndex((prev) => prev + 1);
  };

  const handleRewind = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setCurrentPhotoIndex(0);
    }
  };

  const nextPhoto = (e: React.MouseEvent, photosLength: number) => {
    e.stopPropagation();
    setCurrentPhotoIndex((prev) => (prev + 1) % photosLength);
  };

  const prevPhoto = (e: React.MouseEvent, photosLength: number) => {
    e.stopPropagation();
    setCurrentPhotoIndex((prev) => (prev - 1 + photosLength) % photosLength);
  };

  return (
    <div className="relative w-full h-[calc(100dvh-5.5rem)] max-w-md mx-auto flex flex-col justify-between overflow-hidden px-3 pt-2 pb-2 select-none">
      {/* Top Header / Mode Indicator */}
      <div className="flex items-center justify-between px-2 mb-2 z-20">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#FFFFFF] to-[rgba(255,255,255,0.20)] flex items-center justify-center shadow-[0_0_12px_rgba(255,79,135,0.6)]">
            <Sparkles className="w-4 h-4 text-[#F3F4F6]" />
          </div>
          <div>
            <h1 className="text-base font-black tracking-tight text-[#F3F4F6] flex items-center gap-1.5">
              <span>FRIENDS</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[#FFFFFF]/20 text-[#E5E7EB] border border-[#FFFFFF]/30">
                DATE
              </span>
            </h1>
          </div>
        </div>

        {/* Quick Filter & Rewind */}
        <div className="flex items-center gap-1.5">
          <button 
            onClick={handleRewind}
            disabled={currentIndex === 0}
            className="w-8 h-8 rounded-full glass-panel flex items-center justify-center text-[#9CA3AF] hover:text-[#F3F4F6] disabled:opacity-30 disabled:pointer-events-none cursor-pointer transition-colors"
            title="Rewind last profile"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Card Stack */}
      <div className="relative flex-1 w-full rounded-3xl overflow-hidden glass-panel-elevated shadow-2xl border border-[rgba(255,255,255,0.20)]/20 glass-panel">
        <AnimatePresence mode="wait">
          {currentProfile ? (
            <motion.div
              key={currentProfile.id}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0, transition: { duration: 0.2 } }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full h-full rounded-3xl overflow-hidden bg-[#12141B]"
            >
              {/* Profile Photos & Photo Navigator */}
              {(() => {
                const photos = currentProfile.photos && currentProfile.photos.length > 0 
                  ? currentProfile.photos 
                  : [currentProfile.avatar];

                return (
                  <div className="relative w-full h-full">
                    <img 
                      src={photos[currentPhotoIndex] || currentProfile.avatar} 
                      alt={currentProfile.name} 
                      className="w-full h-full object-cover pointer-events-none"
                    />

                    {/* Gradient vignettes for text contrast */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#090A0E] via-transparent to-black/40 pointer-events-none" />
                    <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-[#090A0E] via-[#090A0E]/80 to-transparent pointer-events-none" />

                    {/* Top Progress Segment Bars */}
                    {photos.length > 1 && (
                      <div className="absolute top-3 inset-x-3 z-30 flex items-center gap-1">
                        {photos.map((_, pIdx) => (
                          <div 
                            key={pIdx}
                            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                              pIdx === currentPhotoIndex 
                                ? 'bg-[#FFFFFF] shadow-[0_0_8px_#FFFFFF]' 
                                : 'bg-white/25'
                            }`}
                          />
                        ))}
                      </div>
                    )}

                    {/* Photo Touch Tap Zones (Left/Right) */}
                    <div className="absolute inset-0 z-10 flex">
                      <div 
                        onClick={(e) => prevPhoto(e, photos.length)}
                        className="w-1/2 h-full cursor-pointer" 
                      />
                      <div 
                        onClick={(e) => nextPhoto(e, photos.length)}
                        className="w-1/2 h-full cursor-pointer" 
                      />
                    </div>

                    {/* Badges Floating on Top Left */}
                    <div className="absolute top-6 left-3 z-20 flex flex-wrap gap-1.5 pointer-events-none">
                      {currentProfile.compatibilityScore && (
                        <div className="px-2.5 py-1 rounded-full glass-panel bg-black/50 border border-[rgba(255,255,255,0.20)]/40 flex items-center gap-1 text-[11px] font-bold text-[#E5E7EB] shadow-lg">
                          <Sparkles className="w-3 h-3 text-[#FFFFFF]" />
                          <span>{currentProfile.compatibilityScore}% Match</span>
                        </div>
                      )}

                      {currentProfile.verifications?.photoVerified && (
                        <div className="px-2 py-1 rounded-full glass-panel bg-black/50 border border-emerald-500/40 flex items-center gap-1 text-[10px] font-bold text-emerald-300 shadow-lg">
                          <ShieldCheck className="w-3 h-3 text-emerald-400" />
                          <span>Photo Verified</span>
                        </div>
                      )}
                    </div>

                    {/* Voice Intro Quick Play (If Available) */}
                    {currentProfile.voiceIntroUrl && (
                      <button 
                        onClick={() => setIsAudioPlaying(!isAudioPlaying)}
                        className="absolute top-6 right-3 z-20 px-3 py-1.5 rounded-full glass-panel bg-black/50 border border-[rgba(255,255,255,0.20)]/40 flex items-center gap-1.5 text-xs font-semibold text-[#F3F4F6] cursor-pointer hover:border-[#FFFFFF] transition-colors"
                      >
                        {isAudioPlaying ? (
                          <>
                            <Volume2 className="w-3.5 h-3.5 text-[#FFFFFF] animate-pulse" />
                            <span className="text-[11px] text-[#E5E7EB]">Playing Voice...</span>
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-3.5 h-3.5 text-[rgba(255,255,255,0.20)]" />
                            <span className="text-[11px]">Voice Intro</span>
                          </>
                        )}
                      </button>
                    )}

                    {/* Bottom Profile Information Overlay */}
                    <div className="absolute bottom-4 inset-x-4 z-20 space-y-2 pointer-events-auto">
                      <div className="flex items-end justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h2 className="text-2xl font-black text-[#F3F4F6] tracking-tight">
                              {currentProfile.name}
                            </h2>
                            <span className="text-xl font-semibold text-[#E5E7EB]">
                              {currentProfile.age}
                            </span>
                            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34D399]" title="Online" />
                          </div>

                          <div className="flex items-center gap-2 text-xs text-[#9CA3AF] mt-0.5">
                            <span className="flex items-center gap-1 text-[#F3F4F6]">
                              <MapPin className="w-3 h-3 text-[#FFFFFF]" />
                              {currentProfile.location}
                            </span>
                            <span>•</span>
                            <span className="text-[#E5E7EB]">{currentProfile.energy}</span>
                          </div>
                        </div>

                        {/* Open Full Profile Sheet Button */}
                        <button
                          onClick={() => onOpenProfileDetail(currentProfile)}
                          className="w-9 h-9 rounded-full glass-panel flex items-center justify-center text-[#F3F4F6] hover:text-[#FFFFFF] border border-[rgba(255,255,255,0.20)]/30 cursor-pointer shadow-lg hover:scale-105 transition-transform"
                          title="View Full Profile Details"
                        >
                          <Info className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Tagline / Bio snippet */}
                      <p className="text-xs text-[#F3F4F6]/90 italic line-clamp-2 border-l-2 border-[#FFFFFF] pl-2.5 py-0.5">
                        "{currentProfile.tagline}"
                      </p>

                      {/* Pill Tags: Core values & Interests */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {currentProfile.coreValues.slice(0, 3).map((v, i) => (
                          <span 
                            key={i}
                            className="px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-[#12141B]/80 border border-[rgba(255,255,255,0.20)]/25 text-[#E5E7EB]"
                          >
                            {v}
                          </span>
                        ))}
                        {currentProfile.interests.slice(0, 2).map((item, i) => (
                          <span 
                            key={`int-${i}`}
                            className="px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-black/40 border border-white/10 text-[#9CA3AF]"
                          >
                            #{item}
                          </span>
                        ))}
                      </div>

                      {/* Most Active to chat preview indicator */}
                      {currentProfile.activeTimeWindow && (
                        <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-black/50 border border-[rgba(255,255,255,0.20)]/20 text-[10px] text-[#9CA3AF]">
                          <span className="flex items-center gap-1.5 text-[#E5E7EB]">
                            <Zap className="w-3 h-3 text-[#FFFFFF]" />
                            <span>Active chat hours:</span>
                            <span className="text-[#F3F4F6] font-medium">{currentProfile.activeTimeWindow.periodLabel}</span>
                          </span>
                          <span className="text-emerald-400 font-bold">{currentProfile.activeTimeWindow.onlineProbabilityPercent}% reply rate</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}
            </motion.div>
          ) : (
            /* Empty State */
            <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#FFFFFF]/15 border border-[#FFFFFF]/30 flex items-center justify-center glass-panel">
                <Heart className="w-8 h-8 text-[#FFFFFF]" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-black text-[#F3F4F6]">You’ve seen everyone nearby!</h3>
                <p className="text-xs text-[#9CA3AF] max-w-xs mx-auto">
                  Expand your discovery radius, explore video profiles, or revisit people you may have skipped.
                </p>
              </div>
              <button
                onClick={() => setCurrentIndex(0)}
                className="px-5 py-2.5 rounded-full gray-glass-btn text-xs font-bold cursor-pointer transition-transform active:scale-95"
              >
                Reset & Discover Again
              </button>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Floating Action Controls Bar (Like, Pass, SuperLike, Chat) */}
      {currentProfile && (
        <div className="flex items-center justify-center gap-4 pt-3 pb-1 z-30">
          {/* Dislike / Pass */}
          <button
            onClick={() => handleSwipe('left')}
            className="w-13 h-13 rounded-full glass-panel flex items-center justify-center text-[#9CA3AF] hover:text-rose-400 border border-white/10 hover:border-rose-400/40 hover:bg-rose-950/20 shadow-xl cursor-pointer transition-all active:scale-90"
            aria-label="Pass"
          >
            <X className="w-6 h-6" strokeWidth={2.5} />
          </button>

          {/* Super Like */}
          <button
            onClick={() => handleSwipe('up')}
            className="w-11 h-11 rounded-full glass-panel flex items-center justify-center text-sky-400 border border-sky-500/30 hover:bg-sky-950/30 shadow-xl cursor-pointer transition-all active:scale-90"
            aria-label="Super Like"
          >
            <Star className="w-5 h-5 fill-sky-400 text-sky-400" />
          </button>

          {/* Like / Heart */}
          <button
            onClick={() => handleSwipe('right')}
            className="w-15 h-15 rounded-full bg-gradient-to-tr from-[#FFFFFF] to-[rgba(255,255,255,0.20)] flex items-center justify-center text-[#F3F4F6] shadow-[0_0_25px_rgba(255,79,135,0.7)] cursor-pointer transition-all active:scale-90"
            aria-label="Like"
          >
            <Heart className="w-7 h-7 fill-[#F3F4F6]" />
          </button>

          {/* Start Conversation Directly */}
          <button
            onClick={() => onInitiateChat(currentProfile)}
            className="w-11 h-11 rounded-full glass-panel flex items-center justify-center text-[#E5E7EB] border border-[rgba(255,255,255,0.20)]/30 hover:bg-[#FFFFFF]/20 shadow-xl cursor-pointer transition-all active:scale-90"
            aria-label="Instant Message"
          >
            <MessageCircle className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Match Animation Modal */}
      <AnimatePresence>
        {matchModalProfile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#090A0E]/95 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-center"
          >
            <motion.div
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="space-y-6 max-w-sm w-full"
            >
              <div className="space-y-2">
                <span className="text-xs uppercase tracking-widest font-black text-[#E5E7EB]">It’s Mutual Chemistry!</span>
                <h2 className="text-3xl font-black text-[#F3F4F6] tracking-tight">You & {matchModalProfile.name} Matched!</h2>
                <p className="text-xs text-[#9CA3AF]">
                  {matchModalProfile.name} likes you too. Skip the dry 'hey' and break the ice with something genuine.
                </p>
              </div>

              {/* Match Avatars with heart connect */}
              <div className="flex items-center justify-center -space-x-4 py-4">
                <img 
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80" 
                  alt="You" 
                  className="w-24 h-24 rounded-full object-cover border-4 border-[#090A0E] shadow-2xl z-10"
                />
                <div className="w-10 h-10 rounded-full bg-[#FFFFFF] flex items-center justify-center text-[#F3F4F6] z-20 shadow-[0_0_15px_#FFFFFF]">
                  <Heart className="w-5 h-5 fill-white" />
                </div>
                <img 
                  src={matchModalProfile.avatar} 
                  alt={matchModalProfile.name} 
                  className="w-24 h-24 rounded-full object-cover border-4 border-[#090A0E] shadow-2xl z-10"
                />
              </div>

              {/* Suggested Icebreaker Hook */}
              <div className="p-3.5 rounded-2xl glass-panel-elevated text-left space-y-1">
                <span className="text-[10px] font-bold text-[#E5E7EB] uppercase">Smart Icebreaker:</span>
                <p className="text-xs text-[#F3F4F6] italic">
                  "I saw you're obsessed with {matchModalProfile.interests[0] || 'photography'}. What's the latest thing you explored in that?"
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <button
                  onClick={() => {
                    const prof = matchModalProfile;
                    setMatchModalProfile(null);
                    onInitiateChat(prof);
                  }}
                  className="w-full py-3.5 rounded-2xl gray-glass-btn font-bold text-xs shadow-lg cursor-pointer transition-transform active:scale-95"
                >
                  Send Icebreaker Now
                </button>
                <button
                  onClick={() => setMatchModalProfile(null)}
                  className="w-full py-3 rounded-2xl glass-panel text-xs text-[#9CA3AF] hover:text-[#F3F4F6] font-semibold cursor-pointer"
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
