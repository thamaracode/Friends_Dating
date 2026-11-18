import React, { useState } from 'react';
import { 
  Heart, 
  X, 
  MessageCircle, 
  MapPin, 
  ShieldCheck, 
  Filter, 
  ChevronRight, 
  Flame, 
  Check, 
  Clock, 
  Info,
  Lock
} from 'lucide-react';
import { MOCK_PROFILES, CURRENT_USER } from '../../mockData';
import type { UserProfile } from '../../types';

interface LikeProfileItem extends UserProfile {
  hasLikedYou?: boolean;
  isSuperLike?: boolean;
  likedPromptTeaser?: string;
}

interface LikesAndMatchesViewProps {
  onOpenProfile: (profile: UserProfile) => void;
  onInitiateChat: (profile: UserProfile) => void;
}

/**
 * SOULVERSE LIKES & MATCHES EXPERIENCE
 * Priority on authentic photography, clear mutual matches, and effortless interaction.
 * Clean, restrained, editorial aesthetic.
 */
export const LikesAndMatchesView: React.FC<LikesAndMatchesViewProps> = ({
  onOpenProfile,
  onInitiateChat
}) => {
  // Active Filter: 'all' | 'mutual' | 'superlikes'
  const [activeFilter, setActiveFilter] = useState<'all' | 'mutual' | 'superlikes'>('all');
  
  // Likes list state (Users who liked the current user)
  const [likesList, setLikesList] = useState<LikeProfileItem[]>(() => {
    return MOCK_PROFILES.map((p, idx) => ({
      ...p,
      hasLikedYou: true,
      isSuperLike: idx === 1,
      likedPromptTeaser: idx === 0 
        ? 'Liked your reflection on indie game architecture & quiet weekends' 
        : idx === 1 
        ? 'Super Liked your cinematic life universe' 
        : 'Resonated with your emotional boundaries perspective'
    }));
  });

  // Mutual Matches list
  const [mutualMatches, setMutualMatches] = useState<UserProfile[]>([
    MOCK_PROFILES[0],
    MOCK_PROFILES[2],
    MOCK_PROFILES[3]
  ]);

  // Match celebration state
  const [newMatchCelebration, setNewMatchCelebration] = useState<UserProfile | null>(null);

  // Handle Match / Like Back
  const handleLikeBack = (profile: UserProfile) => {
    // Remove from incoming likes
    setLikesList(prev => prev.filter(p => p.id !== profile.id));
    // Add to mutual matches if not already there
    setMutualMatches(prev => [profile, ...prev.filter(p => p.id !== profile.id)]);
    // Trigger Match Celebration Modal
    setNewMatchCelebration(profile);
  };

  // Handle Pass
  const handlePass = (profileId: string) => {
    setLikesList(prev => prev.filter(p => p.id !== profileId));
  };

  const filteredLikes = likesList.filter(p => {
    if (activeFilter === 'mutual') return false;
    if (activeFilter === 'superlikes') return p.isSuperLike;
    return true;
  });

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8 animate-fadeIn pb-32 font-body text-zinc-100">
      
      {/* 1. EDITORIAL HEADER & METRICS */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/[0.08] pb-6">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-semibold">
            <Heart className="w-3.5 h-3.5 fill-rose-500/30" />
            <span>Connection Signals</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-heading font-extrabold text-white tracking-tight">
            Likes & Mutual Matches
          </h1>
          <p className="text-sm text-zinc-400">
            People who expressed resonance with your identity, thoughts, and profile worlds.
          </p>
        </div>

        {/* Filter Switcher */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-white/[0.04] border border-white/[0.08]">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeFilter === 'all' 
                ? 'bg-white text-[#0A0B0F] shadow-md' 
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            All Likes ({likesList.length})
          </button>
          <button
            onClick={() => setActiveFilter('mutual')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeFilter === 'mutual' 
                ? 'bg-white text-[#0A0B0F] shadow-md' 
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Mutual Matches ({mutualMatches.length})
          </button>
          <button
            onClick={() => setActiveFilter('superlikes')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeFilter === 'superlikes' 
                ? 'bg-white text-[#0A0B0F] shadow-md' 
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Super Likes ({likesList.filter(p => p.isSuperLike).length})
          </button>
        </div>
      </div>

      {/* 2. MUTUAL MATCHES CAROUSEL (Always visible unless filtered to superlikes) */}
      {activeFilter !== 'superlikes' && mutualMatches.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm uppercase font-mono tracking-wider text-zinc-400 font-semibold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Mutual Matches ({mutualMatches.length})</span>
            </h2>
            <span className="text-xs text-zinc-500 font-mono">Tap avatar to open instant chat</span>
          </div>

          <div className="flex items-center gap-4 overflow-x-auto no-scrollbar py-2">
            {mutualMatches.map((match) => (
              <div 
                key={match.id}
                onClick={() => onInitiateChat(match)}
                className="flex flex-col items-center gap-2 shrink-0 cursor-pointer group select-none text-center"
              >
                <div className="relative w-18 h-18 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border border-white/20 group-hover:border-rose-400 group-hover:scale-105 transition-all shadow-lg bg-[#141720]">
                  <img 
                    src={match.avatar} 
                    alt={match.name} 
                    className="w-full h-full object-cover" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-1">
                    <MessageCircle className="w-4 h-4 text-white" />
                  </div>
                </div>
                <div className="space-y-0.5 max-w-[80px]">
                  <p className="text-xs font-bold text-white truncate font-heading group-hover:text-rose-300 transition-colors">
                    {match.name}
                  </p>
                  <p className="text-[10px] text-zinc-500 font-mono truncate">
                    {match.age} • Active
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. PEOPLE WHO LIKED YOU — EDITORIAL PHOTOGRAPHY GRID */}
      {activeFilter !== 'mutual' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm uppercase font-mono tracking-wider text-zinc-400 font-semibold">
              People Who Liked Your Profile ({filteredLikes.length})
            </h2>
            <span className="text-xs text-zinc-500">Full photography • Tap card to inspect dossier</span>
          </div>

          {filteredLikes.length === 0 ? (
            <div className="p-12 text-center rounded-3xl dark-glass border border-white/[0.08] space-y-4 max-w-md mx-auto my-6">
              <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center mx-auto text-zinc-400">
                <Heart className="w-6 h-6 text-zinc-500" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white font-heading">You're All Caught Up</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  You've reviewed everyone who recently liked your profile. Keep exploring and discovering new humans.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredLikes.map((profile) => (
                <div
                  key={profile.id}
                  className="group relative rounded-3xl overflow-hidden bg-[#12141D] border border-white/[0.10] hover:border-white/[0.22] transition-all duration-300 shadow-xl flex flex-col"
                >
                  {/* High Quality Portrait Photography */}
                  <div 
                    onClick={() => onOpenProfile(profile)}
                    className="relative w-full aspect-[4/5] overflow-hidden cursor-pointer bg-[#0A0B0F]"
                  >
                    <img 
                      src={profile.avatar} 
                      alt={profile.name}
                      className="w-full h-full object-cover object-center group-hover:scale-103 transition-transform duration-500" 
                    />

                    {/* Subtle Top Badges */}
                    <div className="absolute top-3 inset-x-3 flex items-center justify-between pointer-events-none">
                      {profile.isSuperLike ? (
                        <span className="px-2.5 py-1 rounded-full bg-amber-500/90 text-black text-[10px] font-black uppercase tracking-wider shadow-md backdrop-blur-md">
                          ★ Super Liked
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full bg-black/60 border border-white/20 text-rose-300 text-[10px] font-bold backdrop-blur-md">
                          Liked You
                        </span>
                      )}

                      <span className="px-2 py-0.5 rounded-full bg-black/60 border border-white/15 text-white text-[11px] font-mono backdrop-blur-md">
                        {profile.compatibilityScore || 92}% Match
                      </span>
                    </div>

                    {/* Gradient Fade for Info */}
                    <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#12141D] via-[#12141D]/70 to-transparent" />

                    {/* Overlay Identity Info */}
                    <div className="absolute bottom-3 inset-x-4 space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl font-extrabold text-white font-heading truncate">
                          {profile.name}, {profile.age}
                        </h3>
                        {Boolean(profile.verifications?.photoVerified || profile.verifications?.idDocumentVerified) && (
                          <ShieldCheck className="w-4 h-4 text-sky-400 shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-zinc-300 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-zinc-400" />
                        <span>{profile.location}</span>
                      </p>
                    </div>
                  </div>

                  {/* Teaser of What They Liked */}
                  <div className="p-4 space-y-3 flex-1 flex flex-col justify-between bg-[#12141D]">
                    <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-xs text-zinc-300 leading-relaxed italic font-body">
                      "{profile.likedPromptTeaser || profile.tagline || profile.aboutMeLong}"
                    </div>

                    {/* Restrained Action Controls: Pass vs Match */}
                    <div className="flex items-center gap-2 pt-2 border-t border-white/[0.06]">
                      <button
                        onClick={() => handlePass(profile.id)}
                        className="h-10 px-4 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-zinc-400 hover:text-white text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer flex-1"
                        title="Pass"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Pass</span>
                      </button>

                      <button
                        onClick={() => handleLikeBack(profile)}
                        className="h-10 px-4 rounded-xl bg-gradient-to-r from-rose-500 to-[#D94668] hover:opacity-95 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer flex-1 shadow-lg shadow-rose-500/20 active:scale-98"
                        title="Match & Connect"
                      >
                        <Heart className="w-3.5 h-3.5 fill-white" />
                        <span>Match</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 4. MUTUAL MATCH FULL SCREEN CELEBRATION MODAL */}
      {newMatchCelebration && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-2xl flex items-center justify-center p-4 animate-fadeIn">
          <div className="w-full max-w-md p-6 sm:p-8 rounded-3xl bg-[#12141B] border border-white/20 shadow-2xl text-center space-y-6">
            
            {/* Celebration Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold font-mono uppercase tracking-wider">
              <Heart className="w-3.5 h-3.5 fill-rose-400" />
              <span>Resonance Aligned</span>
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-heading">
                It's a Mutual Match
              </h2>
              <p className="text-xs text-zinc-300 leading-relaxed max-w-xs mx-auto">
                You and <strong className="text-white">{newMatchCelebration.name}</strong> both expressed resonance with each other's worlds.
              </p>
            </div>

            {/* Side-by-Side Avatars */}
            <div className="flex items-center justify-center -space-x-4 py-2">
              <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-white shadow-xl bg-[#0A0B0F]">
                <img src={CURRENT_USER.avatar} alt="You" className="w-full h-full object-cover" />
              </div>
              <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-rose-400 shadow-xl bg-[#0A0B0F]">
                <img src={newMatchCelebration.avatar} alt={newMatchCelebration.name} className="w-full h-full object-cover" />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-2">
              <button
                onClick={() => {
                  const target = newMatchCelebration;
                  setNewMatchCelebration(null);
                  onInitiateChat(target);
                }}
                className="w-full h-12 rounded-2xl bg-gradient-to-r from-rose-500 to-[#D94668] text-white font-bold text-sm shadow-lg shadow-rose-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all hover:opacity-95"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Send First Message</span>
              </button>

              <button
                onClick={() => setNewMatchCelebration(null)}
                className="w-full h-11 rounded-2xl bg-white/[0.06] hover:bg-white/[0.12] text-zinc-300 font-semibold text-xs transition-colors cursor-pointer"
              >
                Keep Reviewing Likes
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
