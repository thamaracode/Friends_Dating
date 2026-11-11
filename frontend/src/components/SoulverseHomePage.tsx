import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Compass, 
  Heart, 
  MessageCircle, 
  Globe2, 
  Film, 
  Brain, 
  Calendar, 
  ArrowRight, 
  ShieldCheck, 
  Plus, 
  ChevronRight,
  TrendingUp,
  Flame,
  Users
} from 'lucide-react';
import { MOCK_PROFILES, CURRENT_USER } from '../mockData';
import { profileWorldsClient } from '../services/profileWorldsApiClient';
import type { UserProfile, SoulverseRoute } from '../types';
import type { ProfileWorld } from '../types/profileWorlds';

interface SoulverseHomePageProps {
  onNavigate: (route: SoulverseRoute) => void;
  onOpenProfile: (profile: UserProfile) => void;
  onInitiateChat: (profile: UserProfile) => void;
  onOpenWorld: (worldId: string) => void;
}

export const SoulverseHomePage: React.FC<SoulverseHomePageProps> = ({
  onNavigate,
  onOpenProfile,
  onInitiateChat,
  onOpenWorld
}) => {
  const [profile] = useState(CURRENT_USER);
  const [worlds, setWorlds] = useState<ProfileWorld[]>([]);
  const [activeIntentFilter, setActiveIntentFilter] = useState<'all' | 'Dating' | 'Friendship'>('all');

  useEffect(() => {
    profileWorldsClient.getWorlds('usr_me', 'usr_me').then(res => {
      if (res && res.length > 0) setWorlds(res);
    }).catch(console.error);
  }, []);

  const recommendedProfiles = MOCK_PROFILES.filter(p => {
    if (activeIntentFilter === 'all') return true;
    return p.intent === activeIntentFilter;
  });

  return (
    <div className="w-full space-y-7 animate-fadeIn pb-12">
      
      {/* 1. HERO GREETING BANNER */}
      <div className="relative rounded-3xl overflow-hidden dark-glass border border-white/[0.08] p-6 sm:p-8 shadow-2xl">
        {/* Subtle silver ambient light glow in top-right */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/[0.03] rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-bold text-white">
              <Sparkles className="w-3.5 h-3.5 text-zinc-300" />
              <span>SOULVERSE SANCTUARY • DESKTOP WEBSITE EDITION</span>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white font-serif tracking-tight">
              Welcome back, <span className="text-silver-gradient">{profile.name}</span> <span className="text-zinc-400 text-2xl">✧</span>
            </h1>

            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
              "You don't have to compress your soul into a single social box. Travel between your Real Life, Cinematic Universe, Inner Sanctuary, and Desired Futures."
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => onNavigate('worlds')}
                className="px-4 py-2 rounded-2xl gray-glass-btn text-xs font-bold flex items-center gap-2 shadow-md cursor-pointer"
              >
                <Globe2 className="w-4 h-4 text-white" />
                <span>Explore Profile Worlds ({worlds.length || 5})</span>
              </button>

              <button
                onClick={() => onNavigate('discover')}
                className="px-4 py-2 rounded-2xl bg-white/[0.06] hover:bg-white/15 text-white border border-white/15 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Compass className="w-4 h-4 text-zinc-300" />
                <span>Discover Humans</span>
              </button>
            </div>
          </div>

          {/* Quick Stats Pill Panel */}
          <div className="p-4 rounded-3xl dark-glass border border-white/10 space-y-2.5 shrink-0 min-w-[200px]">
            <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider block">Identity Metrics</span>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-zinc-400">Profile Worlds</span>
                <span className="font-bold text-white">{worlds.length || 5}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Followers</span>
                <span className="font-bold text-white">8,420</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Compatibility HCM</span>
                <span className="font-bold text-emerald-400">94%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 1.5 TODAY'S DAILY CONNECTION INTELLIGENCE BANNER */}
      <div 
        onClick={() => onNavigate('daily')}
        className="rounded-3xl p-5 sm:p-6 dark-glass border border-white/15 hover:border-white/30 transition-all cursor-pointer shadow-xl relative overflow-hidden group"
      >
        <div className="absolute top-0 right-0 w-80 h-full bg-gradient-to-l from-white/[0.04] to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-white border border-white/20 flex items-center gap-1.5">
                <Flame className="w-3 h-3 text-white fill-white" />
                <span>DAILY CONNECTION</span>
              </span>
              <span className="text-[10px] text-zinc-400">Today's Thought • Love & Understanding</span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white font-serif group-hover:text-zinc-200 transition-colors leading-snug">
              "Love is not only about finding someone. It's about learning how to understand someone."
            </h3>
            <p className="text-xs text-zinc-400 line-clamp-1">
              Today's reflection: Do you listen to understand someone, or do you listen just to prepare your response?
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-bold text-white flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
              <span>Open Daily Edition</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      </div>

      {/* 2. PROFILE WORLDS CAROUSEL */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe2 className="w-4 h-4 text-zinc-300" />
            <h2 className="text-sm font-bold text-white">Your Profile Worlds</h2>
          </div>
          <button 
            onClick={() => onNavigate('worlds')}
            className="text-xs text-zinc-400 hover:text-white font-bold flex items-center gap-1 cursor-pointer transition-colors"
          >
            <span>View All Worlds</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {worlds.slice(0, 4).map(w => (
            <div
              key={w.id}
              onClick={() => onOpenWorld(w.id)}
              className="group relative rounded-3xl overflow-hidden dark-glass-card border border-white/[0.08] hover:border-white/25 transition-all cursor-pointer shadow-lg flex flex-col justify-between"
            >
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-black/40">
                <img
                  src={w.cover_image_url || profile.avatar}
                  alt={w.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-75"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#090A0E] via-transparent to-transparent" />
                <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full text-[9px] font-bold bg-black/60 backdrop-blur-md text-white border border-white/10 uppercase">
                  {w.world_type.replace('_', ' ')}
                </span>
              </div>

              <div className="p-4 space-y-1">
                <h3 className="text-xs font-bold text-white group-hover:text-zinc-200 transition-colors truncate">
                  {w.name}
                </h3>
                <p className="text-[10px] text-zinc-400 line-clamp-1">{w.description}</p>
                <div className="flex items-center justify-between pt-2 border-t border-white/[0.06] text-[10px] text-zinc-400">
                  <span>{w.visibility === 'public' ? '🌐 Public' : '🔒 Restricted'}</span>
                  <span className="text-zinc-300 group-hover:translate-x-0.5 transition-transform">Explore ›</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. RECOMMENDED PEOPLE & DAILY CHEMISTRY */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-white" />
            <h2 className="text-sm font-bold text-white">Recommended Minds & Mutual Matches</h2>
          </div>

          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-white/[0.04] border border-white/10 text-xs">
            {(['all', 'Dating', 'Friendship'] as const).map(intent => (
              <button
                key={intent}
                onClick={() => setActiveIntentFilter(intent)}
                className={`px-3 py-1 rounded-xl font-bold transition-all cursor-pointer ${
                  activeIntentFilter === intent
                    ? 'bg-white/20 text-white border border-white/30 shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {intent === 'all' ? 'All Intent' : intent}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {recommendedProfiles.slice(0, 8).map(user => (
            <div
              key={user.id}
              className="rounded-3xl overflow-hidden dark-glass-card border border-white/[0.08] hover:border-white/25 transition-all shadow-lg flex flex-col justify-between group"
            >
              <div 
                onClick={() => onOpenProfile(user)}
                className="relative aspect-[4/3] w-full overflow-hidden bg-black/40 cursor-pointer"
              >
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-85"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#090A0E] via-transparent to-black/20" />
                
                <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-bold text-white">
                  {user.compatibilityScore}% HCM
                </div>
              </div>

              <div className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span>{user.name}</span>
                      <span className="text-zinc-400 font-normal">{user.age}</span>
                      {user.verifications?.photoVerified && <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />}
                    </h3>
                    <p className="text-[10px] text-zinc-400">{user.location} • {user.status}</p>
                  </div>
                </div>

                <p className="text-xs text-zinc-300 line-clamp-2 italic">
                  "{user.aboutMeLong || user.tagline}"
                </p>

                <div className="flex flex-wrap gap-1 pt-1">
                  {user.coreValues.slice(0, 3).map((val, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded-full text-[9px] font-medium bg-white/[0.06] text-zinc-300 border border-white/10">
                      {val}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-white/[0.08]">
                  <button
                    onClick={() => onOpenProfile(user)}
                    className="flex-1 py-1.5 rounded-xl bg-white/5 hover:bg-white/15 text-zinc-200 hover:text-white border border-white/10 text-xs font-bold cursor-pointer transition-colors text-center"
                  >
                    View Story
                  </button>
                  <button
                    onClick={() => onInitiateChat(user)}
                    className="flex-1 py-1.5 rounded-xl gray-glass-btn text-xs font-bold cursor-pointer flex items-center justify-center gap-1"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-white" />
                    <span>Chat</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
