import React, { useState } from 'react';
import { 
  Compass, 
  Flame, 
  Heart, 
  X, 
  Star, 
  MessageCircle, 
  Sparkles, 
  MapPin, 
  Filter, 
  Layers, 
  List, 
  Info, 
  ChevronRight, 
  Share2, 
  Bookmark, 
  Lightbulb, 
  HelpCircle,
  Eye,
  ShieldCheck,
  Music
} from 'lucide-react';
import { MOCK_PROFILES, CURRENT_USER } from '../../mockData';
import type { UserProfile } from '../../types';

interface SoulverseMobileDiscoverExperienceProps {
  onOpenProfile: (profile: UserProfile) => void;
  onInitiateChat: (profile: UserProfile) => void;
  onOpenDailyHub?: () => void;
}

export const SoulverseMobileDiscoverExperience: React.FC<SoulverseMobileDiscoverExperienceProps> = ({
  onOpenProfile,
  onInitiateChat,
  onOpenDailyHub
}) => {
  // Discovery View Mode: 'feed' (vertical scrolling) vs 'swipe' (card stack)
  const [viewMode, setViewMode] = useState<'feed' | 'swipe'>('feed');
  
  // Category filter
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  // Swipe Stack state
  const [currentSwipeIndex, setCurrentSwipeIndex] = useState(0);
  const [swipeFeedback, setSwipeFeedback] = useState<'like' | 'pass' | 'superlike' | null>(null);

  // Daily Wisdom expand state
  const [isDailyExpanded, setIsDailyExpanded] = useState(true);

  // Multiple Identities Mock for other users
  const getProfileIdentities = (p: UserProfile) => {
    return [
      { id: 'real', label: 'Real Life', role: p.status || 'Creative', type: 'real' },
      { id: 'cinematic', label: 'Cinematic Me', role: p.id === 'usr_tara' ? 'Noir Film Protagonist' : 'Indie Storyteller', type: 'cinematic' },
      { id: 'fantasy', label: 'Fantasy Realm', role: p.id === 'usr_tara' ? 'Misty Forest Wanderer' : 'Cyber Citadel Architect', type: 'fantasy' }
    ];
  };

  // Filter profiles based on category
  const filteredProfiles = MOCK_PROFILES.filter(p => {
    if (selectedCategory === 'dating') return p.intent === 'Dating';
    if (selectedCategory === 'friendship') return p.intent !== 'Dating';
    if (selectedCategory === 'nearby') return p.location.toLowerCase().includes('sri lanka') || p.location.toLowerCase().includes('colombo');
    if (selectedCategory === 'ambitions') return p.coreValues?.includes('Creative Agency') || p.coreValues?.includes('Curiosity');
    if (selectedCategory === 'lifestyle') return p.energy === 'Introvert';
    return true;
  });

  const currentSwipeProfile = filteredProfiles[currentSwipeIndex % filteredProfiles.length];

  const handleSwipeAction = (action: 'like' | 'pass' | 'superlike') => {
    setSwipeFeedback(action);
    setTimeout(() => {
      setSwipeFeedback(null);
      setCurrentSwipeIndex(prev => prev + 1);
    }, 280);
  };

  return (
    <div className="w-full space-y-4 pb-28 max-w-xl mx-auto animate-fadeIn">
      
      {/* 1. TOP DISCOVERY BAR & VIEW MODE SWITCHER */}
      <div className="flex items-center justify-between gap-3 px-1">
        <div>
          <h1 className="text-lg font-black text-white font-serif tracking-tight flex items-center gap-2">
            <Compass className="w-5 h-5 text-zinc-300" />
            <span>Discover Humans</span>
          </h1>
          <p className="text-[11px] text-zinc-400">Ontological chemistry, shared values, and deep identity</p>
        </div>

        {/* View Mode Switcher: Swipe Stack vs Vertical Feed */}
        <div className="flex items-center bg-white/[0.06] p-1 rounded-2xl border border-white/10 shrink-0">
          <button
            onClick={() => setViewMode('feed')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              viewMode === 'feed'
                ? 'bg-white text-[#090A0E] shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
            title="Vertical Explore Feed"
          >
            <List className="w-3.5 h-3.5" />
            <span>Feed</span>
          </button>
          <button
            onClick={() => setViewMode('swipe')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              viewMode === 'swipe'
                ? 'bg-white text-[#090A0E] shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
            title="Stack Swiping Mode"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Swipe</span>
          </button>
        </div>
      </div>

      {/* 2. CATEGORY HORIZONTAL FILTER PILLS */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 px-1">
        {[
          { id: 'all', label: 'All Humans' },
          { id: 'dating', label: '❤️ Dating' },
          { id: 'friendship', label: '🫂 Friendship' },
          { id: 'nearby', label: '📍 Nearby' },
          { id: 'ambitions', label: '⚡ Ambitions' },
          { id: 'lifestyle', label: '🌱 Solitude & Introverts' },
          { id: 'random', label: '🎲 Random' }
        ].map(cat => (
          <button
            key={cat.id}
            onClick={() => {
              setSelectedCategory(cat.id);
              setCurrentSwipeIndex(0);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === cat.id
                ? 'bg-white text-[#090A0E] shadow-md'
                : 'bg-white/[0.04] text-zinc-400 hover:text-white border border-white/10'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* 3. EMBEDDED DAILY HUMAN CONNECTION INTELLIGENCE CARD */}
      <div className="rounded-3xl dark-glass border border-white/[0.12] p-4 sm:p-5 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-rose-500/10 via-transparent to-transparent pointer-events-none" />
        
        <div className="flex items-center justify-between pb-2.5 border-b border-white/[0.08]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-400 shadow-[0_0_8px_#F43F5E]" />
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-300">
              Daily Connection · Intelligence Edition
            </span>
          </div>
          <button
            onClick={() => setIsDailyExpanded(!isDailyExpanded)}
            className="text-[11px] font-bold text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            {isDailyExpanded ? 'Compact' : 'Expand'}
          </button>
        </div>

        {isDailyExpanded && (
          <div className="pt-3 space-y-3">
            <blockquote className="text-sm sm:text-base font-serif italic text-white leading-relaxed">
              "Love is not only about finding someone. It's about learning how to understand someone."
            </blockquote>

            <p className="text-xs text-zinc-300 leading-relaxed bg-white/[0.03] p-3 rounded-2xl border border-white/[0.06]">
              <span className="font-bold text-white block mb-0.5">Today's Relationship Thought</span>
              Sometimes the strongest relationships are built by people who are willing to listen, communicate and understand each other even when things become difficult.
            </p>

            {/* Daily Introspective Question */}
            <div className="p-3 rounded-2xl bg-white/[0.05] border border-white/10 flex items-start gap-2.5 text-xs">
              <HelpCircle className="w-4 h-4 text-zinc-300 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-white block text-[11px] uppercase tracking-wider text-zinc-400">
                  Today's Question
                </span>
                <p className="text-zinc-200 mt-0.5 font-medium">
                  Do you listen to understand someone, or do you listen just to prepare your response?
                </p>
              </div>
            </div>

            {/* Micro Tags & Actions */}
            <div className="flex items-center justify-between pt-1 text-[11px]">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="px-2 py-0.5 rounded-lg bg-white/10 text-zinc-300">#Love</span>
                <span className="px-2 py-0.5 rounded-lg bg-white/10 text-zinc-300">#Communication</span>
                <span className="px-2 py-0.5 rounded-lg bg-white/10 text-zinc-300">#Psychology</span>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => onOpenDailyHub?.()} 
                  className="px-2.5 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold transition-colors cursor-pointer"
                >
                  Full Hub ›
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 4. MODE A: SWIPE STACK CARDS */}
      {viewMode === 'swipe' && currentSwipeProfile && (
        <div className="relative w-full aspect-[3/4.4] sm:aspect-[3/4.2] max-h-[640px] rounded-3xl overflow-hidden border border-white/15 shadow-2xl bg-[#0F1117] flex flex-col justify-end p-5 select-none animate-fadeIn">
          {/* Main Photo Background */}
          <img
            src={currentSwipeProfile.photos?.[0] || currentSwipeProfile.avatar}
            alt={currentSwipeProfile.name}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500"
          />

          {/* Gradient Scrim */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent pointer-events-none" />

          {/* Swipe Feedback Visual Badge */}
          {swipeFeedback && (
            <div className={`absolute top-6 ${swipeFeedback === 'pass' ? 'right-6 border-red-400 text-red-400' : swipeFeedback === 'like' ? 'left-6 border-emerald-400 text-emerald-400' : 'inset-x-0 mx-auto w-fit border-blue-400 text-blue-400'} px-5 py-2 rounded-2xl border-2 font-black text-base uppercase tracking-wider backdrop-blur-md bg-black/60 shadow-2xl animate-bounce z-20`}>
              {swipeFeedback === 'pass' ? 'PASS' : swipeFeedback === 'like' ? 'LIKE' : 'SUPER LIKE'}
            </div>
          )}

          {/* Top Info Badges */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-black/60 backdrop-blur-md text-white border border-white/15 flex items-center gap-1.5 shadow-md">
              <Sparkles className="w-3.5 h-3.5 text-zinc-300" />
              <span>{currentSwipeProfile.compatibilityScore || 89}% HCM Chemistry</span>
            </span>

            <button
              onClick={() => onOpenProfile(currentSwipeProfile)}
              className="p-2 rounded-full bg-black/60 backdrop-blur-md text-white border border-white/15 hover:bg-white/20 transition-colors cursor-pointer"
              title="View Full Profile & Timeline"
            >
              <Info className="w-4 h-4" />
            </button>
          </div>

          {/* Bottom Card Content */}
          <div className="relative z-10 space-y-3">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-black text-white font-serif tracking-tight">
                  {currentSwipeProfile.name}, {currentSwipeProfile.age}
                </h2>
                <span title="Human Liveness Verified">
                  <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                </span>
              </div>
              <p className="text-xs text-zinc-300 flex items-center gap-1.5 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                <span>{currentSwipeProfile.location}</span>
                <span>·</span>
                <span className="text-white font-semibold">{currentSwipeProfile.status}</span>
              </p>
            </div>

            {/* Tagline / Intro */}
            <p className="text-xs text-zinc-300 line-clamp-2 leading-relaxed italic">
              "{currentSwipeProfile.tagline || currentSwipeProfile.aboutMeLong}"
            </p>

            {/* PREVIEW OF MULTIPLE IDENTITIES (Soulverse Core Differentiation) */}
            <div className="p-2.5 rounded-2xl bg-black/60 backdrop-blur-md border border-white/10 space-y-1.5">
              <span className="text-[9px] uppercase font-bold text-zinc-400 tracking-wider block">
                {currentSwipeProfile.name}'s Identity Universes
              </span>
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                {getProfileIdentities(currentSwipeProfile).map(id => (
                  <span
                    key={id.id}
                    className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-white/10 text-white whitespace-nowrap border border-white/10"
                  >
                    {id.type === 'real' ? '👤' : id.type === 'cinematic' ? '🎬' : '🏰'} {id.label}
                  </span>
                ))}
              </div>
            </div>

            {/* Values & Intent */}
            <div className="flex items-center gap-1.5 flex-wrap text-[10px]">
              <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white font-bold">
                {currentSwipeProfile.intent}
              </span>
              {currentSwipeProfile.coreValues?.slice(0, 2).map(val => (
                <span key={val} className="px-2 py-0.5 rounded-full bg-white/10 text-zinc-300 border border-white/10">
                  {val}
                </span>
              ))}
            </div>

            {/* Interaction Buttons Bar */}
            <div className="flex items-center justify-around pt-2">
              <button
                onClick={() => handleSwipeAction('pass')}
                className="w-13 h-13 rounded-full bg-black/70 border border-white/20 text-zinc-400 hover:text-red-400 hover:border-red-400/40 flex items-center justify-center transition-all cursor-pointer active:scale-90 shadow-xl"
                title="Pass"
              >
                <X className="w-6 h-6" />
              </button>

              <button
                onClick={() => handleSwipeAction('superlike')}
                className="w-11 h-11 rounded-full bg-black/70 border border-white/20 text-blue-400 hover:border-blue-400 flex items-center justify-center transition-all cursor-pointer active:scale-90 shadow-xl"
                title="Super Like"
              >
                <Star className="w-5 h-5 fill-blue-400/30" />
              </button>

              <button
                onClick={() => onInitiateChat(currentSwipeProfile)}
                className="w-11 h-11 rounded-full bg-black/70 border border-white/20 text-emerald-400 hover:border-emerald-400 flex items-center justify-center transition-all cursor-pointer active:scale-90 shadow-xl"
                title="Direct Chat"
              >
                <MessageCircle className="w-5 h-5" />
              </button>

              <button
                onClick={() => handleSwipeAction('like')}
                className="w-13 h-13 rounded-full bg-white text-[#090A0E] flex items-center justify-center transition-all cursor-pointer active:scale-90 shadow-[0_0_20px_rgba(255,255,255,0.4)]"
                title="Like"
              >
                <Heart className="w-6 h-6 fill-[#090A0E]" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. MODE B: VERTICAL EXPLORE FEED */}
      {viewMode === 'feed' && (
        <div className="space-y-4">
          {filteredProfiles.map(profile => {
            const identities = getProfileIdentities(profile);
            return (
              <div
                key={profile.id}
                className="rounded-3xl dark-glass border border-white/[0.10] overflow-hidden shadow-xl hover:border-white/25 transition-all group"
              >
                {/* Photo & Hero Header */}
                <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full overflow-hidden bg-black/40">
                  <img
                    src={profile.photos?.[0] || profile.avatar}
                    alt={profile.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#090A0E] via-transparent to-black/30 pointer-events-none" />

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-black/60 backdrop-blur-md text-white border border-white/15 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-zinc-300" />
                      <span>{profile.compatibilityScore || 88}% Compatibility</span>
                    </span>

                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-white/10 backdrop-blur-md text-white border border-white/15">
                      {profile.intent}
                    </span>
                  </div>

                  {/* Bottom Title on Image */}
                  <div className="absolute bottom-3 left-3 right-3">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-black text-white font-serif tracking-tight">
                        {profile.name}, {profile.age}
                      </h3>
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    </div>
                    <p className="text-xs text-zinc-300 mt-0.5 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-zinc-400" />
                      <span>{profile.location}</span>
                      <span>·</span>
                      <span className="text-zinc-200">{profile.status}</span>
                    </p>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4 sm:p-5 space-y-3.5">
                  {/* Tagline */}
                  <p className="text-xs text-zinc-300 leading-relaxed italic">
                    "{profile.tagline || profile.aboutMeLong}"
                  </p>

                  {/* PREVIEW OF MULTIPLE IDENTITIES */}
                  <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-2">
                    <div className="flex items-center justify-between text-[10px] font-bold">
                      <span className="text-zinc-400 uppercase tracking-wider">Multiple Identities & Universes</span>
                      <span className="text-zinc-500">3 Personas</span>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      {identities.map(id => (
                        <div
                          key={id.id}
                          onClick={() => onOpenProfile(profile)}
                          className="p-2 rounded-xl bg-white/[0.04] border border-white/10 hover:bg-white/[0.08] cursor-pointer transition-all"
                        >
                          <span className="text-sm block">
                            {id.type === 'real' ? '👤' : id.type === 'cinematic' ? '🎬' : '🏰'}
                          </span>
                          <span className="text-[10px] font-bold text-white block mt-1 truncate">
                            {id.label}
                          </span>
                          <span className="text-[9px] text-zinc-400 block truncate">
                            {id.role}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Core Values & Interests Chips */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {profile.coreValues?.map(val => (
                      <span key={val} className="px-2.5 py-0.5 rounded-lg text-[10px] font-semibold bg-white/10 text-zinc-200 border border-white/10">
                        {val}
                      </span>
                    ))}
                    {profile.interests?.slice(0, 3).map(interest => (
                      <span key={interest} className="px-2 py-0.5 rounded-lg text-[10px] font-medium bg-black/40 text-zinc-400 border border-white/5">
                        #{interest}
                      </span>
                    ))}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between pt-2 border-t border-white/[0.08]">
                    <button
                      onClick={() => onOpenProfile(profile)}
                      className="text-xs font-bold text-zinc-300 hover:text-white flex items-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Explore Personas & Bio</span>
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onInitiateChat(profile)}
                        className="px-4 py-2 rounded-xl bg-white text-[#090A0E] text-xs font-bold flex items-center gap-1.5 hover:brightness-110 active:scale-95 transition-all cursor-pointer shadow-md"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>Chat</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
