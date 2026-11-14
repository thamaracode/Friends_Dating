import React, { useState, useEffect } from 'react';
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
import { ContextualEmotionalBanner } from '../emotional/ContextualEmotionalBanner';
import { SocialDiscoveryEngineView } from '../discovery/SocialDiscoveryEngineView';

interface SoulverseMobileDiscoverExperienceProps {
  onOpenProfile: (profile: UserProfile) => void;
  onInitiateChat: (profile: UserProfile) => void;
  onOpenDailyHub?: () => void;
  onOpenUnspoken?: () => void;
}

export const SoulverseMobileDiscoverExperience: React.FC<SoulverseMobileDiscoverExperienceProps> = ({
  onOpenProfile,
  onInitiateChat,
  onOpenDailyHub,
  onOpenUnspoken
}) => {
  // Discovery View Mode: 'engine' (comprehensive multi-intention resonance) vs 'feed' vs 'swipe'
  const [viewMode, setViewMode] = useState<'engine' | 'feed' | 'swipe'>('engine');
  
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

  // Profiles list with live database hydration
  const [profilesList, setProfilesList] = useState<UserProfile[]>(MOCK_PROFILES);

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
            status: u.title || 'Soulverse Member'
          }));
          const seen = new Set();
          const combined: UserProfile[] = [];
          for (const p of [...apiUsers, ...MOCK_PROFILES]) {
            if (!seen.has(p.id)) {
              seen.add(p.id);
              combined.push(p);
            }
          }
          setProfilesList(combined);
        }
      })
      .catch(e => console.warn('User fetch notice:', e));
  }, []);

  // Filter profiles based on category
  const filteredProfiles = profilesList.filter(p => {
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
    <div className="w-full space-y-8 pb-32 max-w-2xl mx-auto animate-fadeIn px-1 sm:px-2">
      
      {/* 1. TOP DISCOVERY BAR & VIEW MODE SWITCHER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
        <div>
          <h1 className="type-page-heading flex items-center gap-2.5">
            <Compass className="w-6 h-6 text-amber-300" />
            <span>Discover Humans</span>
          </h1>
          <p className="type-supporting mt-1">Ontological chemistry, shared values, and deep multi-world identity</p>
        </div>

        {/* View Mode Switcher: Resonance Engine vs Vertical Feed vs Swipe Stack */}
        <div className="flex items-center bg-white/[0.04] p-1 rounded-full border border-white/10 shrink-0 self-start sm:self-auto h-11 backdrop-blur-md">
          <button
            onClick={() => setViewMode('engine')}
            className={`h-9 px-3.5 rounded-full text-xs font-heading font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              viewMode === 'engine'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'text-zinc-400 hover:text-white'
            }`}
            title="Complete Social Discovery & Resonance Engine"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Resonance Engine</span>
          </button>
          <button
            onClick={() => setViewMode('feed')}
            className={`h-9 px-3.5 rounded-full text-xs font-heading font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              viewMode === 'feed'
                ? 'bg-white text-[#090A0E] shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
            title="Vertical Explore Feed"
          >
            <List className="w-3.5 h-3.5" />
            <span>Feed</span>
          </button>
          <button
            onClick={() => setViewMode('swipe')}
            className={`h-9 px-3.5 rounded-full text-xs font-heading font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              viewMode === 'swipe'
                ? 'bg-white text-[#090A0E] shadow-sm'
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
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
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
            className={`h-10 px-4 rounded-full text-xs font-heading font-semibold whitespace-nowrap transition-all cursor-pointer shrink-0 flex items-center ${
              selectedCategory === cat.id
                ? 'bg-white text-[#090A0E] shadow-md font-bold'
                : 'bg-white/[0.04] text-zinc-300 hover:text-white hover:bg-white/[0.08] border border-white/10'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* 2.5. CONTEXTUAL EMOTIONAL LAYER ("The Question You Weren't Expecting") */}
      <ContextualEmotionalBanner 
        page="discover" 
        onOpenUnspoken={onOpenUnspoken} 
      />

      {/* 3. EMBEDDED DAILY HUMAN CONNECTION INTELLIGENCE CARD */}
      <div className="sv-card relative overflow-hidden space-y-5 border border-white/[0.12] shadow-2xl">
        <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-bl from-amber-400/15 via-rose-500/5 to-transparent pointer-events-none" />
        
        <div className="flex items-center justify-between pb-3.5 border-b border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_8px_#F59E0B]" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-300">
              Daily Connection · Intelligence Edition
            </span>
          </div>
          <button
            onClick={() => setIsDailyExpanded(!isDailyExpanded)}
            className="text-xs font-heading font-bold text-zinc-400 hover:text-white transition-colors cursor-pointer px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08]"
          >
            {isDailyExpanded ? 'Compact' : 'Expand'}
          </button>
        </div>

        {isDailyExpanded && (
          <div className="space-y-4 pt-1">
            <blockquote className="font-editorial italic text-xl sm:text-2xl text-white leading-relaxed tracking-tight">
              "Love is not only about finding someone. It's about learning how to understand someone."
            </blockquote>

            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-1.5">
              <span className="text-xs font-heading font-bold text-amber-300 block">Today's Relationship Thought</span>
              <p className="type-body text-zinc-300">
                Sometimes the strongest relationships are built by people who are willing to listen, communicate and understand each other even when things become difficult.
              </p>
            </div>

            {/* Daily Introspective Question */}
            <div className="p-4 rounded-2xl bg-white/[0.05] border border-white/10 flex items-start gap-3.5">
              <div className="w-8 h-8 rounded-lg bg-amber-400/10 border border-amber-400/20 flex items-center justify-center shrink-0 mt-0.5">
                <HelpCircle className="w-4 h-4 text-amber-300" />
              </div>
              <div className="space-y-1">
                <span className="text-[11px] font-heading font-bold uppercase tracking-wider text-zinc-400">
                  Today's Introspective Question
                </span>
                <p className="type-body text-white font-medium">
                  Do you listen to understand someone, or do you listen just to prepare your response?
                </p>
              </div>
            </div>

            {/* Micro Tags & Actions */}
            <div className="flex items-center justify-between pt-2 flex-wrap gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-3 py-1 rounded-full bg-white/10 text-xs text-zinc-300 font-medium">#Love</span>
                <span className="px-3 py-1 rounded-full bg-white/10 text-xs text-zinc-300 font-medium">#Communication</span>
                <span className="px-3 py-1 rounded-full bg-white/10 text-xs text-zinc-300 font-medium">#Psychology</span>
              </div>
              <div>
                <button 
                  onClick={() => onOpenDailyHub?.()} 
                  className="sv-btn-secondary h-9 px-4 text-xs"
                >
                  <span>Open Full Hub</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3.5 SOUL PROMPTS & RESONANCE SANCTUARY (DAILY INTROSPECTION & COMPATIBILITY) */}
      <div className="rounded-3xl bg-gradient-to-br from-violet-950/50 via-slate-900 to-rose-950/40 border border-violet-500/30 p-5 sm:p-6 space-y-3.5 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-violet-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-violet-400 shadow-[0_0_8px_#8B5CF6]" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-violet-300">
              Soul Prompt Sanctuary · Single-Player Value
            </span>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30">
            #EmotionalSafety
          </span>
        </div>

        <p className="text-sm sm:text-base font-bold text-white leading-snug">
          "What is an unspoken expectation you used to bring into relationships that you have since outgrown?"
        </p>

        <p className="text-xs text-slate-300/80 leading-relaxed italic border-l-2 border-violet-500/40 pl-3">
          We often expect partners to read our minds without realizing we are asking them to heal wounds they never created.
        </p>

        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-slate-400">
            Zero matches needed. Write your truth or read community echoes.
          </span>
          <button
            onClick={() => {
              window.location.hash = '#journal';
            }}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-violet-600 via-rose-500 to-amber-500 hover:opacity-95 text-white shadow-md shadow-violet-500/20 flex items-center gap-1.5 transition"
          >
            <span>Open Sanctuary</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 4. MODE A: SWIPE STACK CARDS */}
      {viewMode === 'swipe' && currentSwipeProfile && (
        <div className="relative w-full aspect-[3/4.4] sm:aspect-[3/4.2] max-h-[680px] rounded-3xl overflow-hidden border border-white/15 shadow-2xl bg-[#0F1117] flex flex-col justify-end p-6 sm:p-8 select-none animate-fadeIn">
          {/* Main Photo Background */}
          <img
            src={currentSwipeProfile.photos?.[0] || currentSwipeProfile.avatar}
            alt={currentSwipeProfile.name}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500"
          />

          {/* Gradient Scrim */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/45 to-transparent pointer-events-none" />

          {/* Swipe Feedback Visual Badge */}
          {swipeFeedback && (
            <div className={`absolute top-8 ${swipeFeedback === 'pass' ? 'right-8 border-red-400 text-red-400' : swipeFeedback === 'like' ? 'left-8 border-emerald-400 text-emerald-400' : 'inset-x-0 mx-auto w-fit border-amber-300 text-amber-300'} px-6 py-2.5 rounded-2xl border-2 font-black text-lg uppercase tracking-wider backdrop-blur-md bg-black/70 shadow-2xl animate-bounce z-20 font-heading`}>
              {swipeFeedback === 'pass' ? 'PASS' : swipeFeedback === 'like' ? 'LIKE' : 'SUPER LIKE'}
            </div>
          )}

          {/* Top Info Badges */}
          <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-10">
            <span className="h-9 px-4 rounded-full text-xs font-heading font-bold bg-black/60 backdrop-blur-md text-white border border-white/15 flex items-center gap-2 shadow-md">
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>{currentSwipeProfile.compatibilityScore || 89}% HCM Chemistry</span>
            </span>

            <button
              onClick={() => onOpenProfile(currentSwipeProfile)}
              className="w-10 h-10 rounded-full bg-black/60 backdrop-blur-md text-white border border-white/15 hover:bg-white/20 transition-colors cursor-pointer flex items-center justify-center"
              title="View Full Profile & Timeline"
            >
              <Info className="w-5 h-5" />
            </button>
          </div>

          {/* Bottom Card Content */}
          <div className="relative z-10 space-y-4">
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-heading tracking-tight">
                  {currentSwipeProfile.name}, {currentSwipeProfile.age}
                </h2>
                <span title="Human Liveness Verified">
                  <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                </span>
              </div>
              <p className="type-supporting text-zinc-300 flex items-center gap-2 mt-1">
                <MapPin className="w-4 h-4 text-zinc-400" />
                <span>{currentSwipeProfile.location}</span>
                <span>·</span>
                <span className="text-white font-semibold">{currentSwipeProfile.status}</span>
              </p>
            </div>

            {/* Tagline / Intro */}
            <p className="type-body text-zinc-200 line-clamp-2 italic leading-relaxed">
              "{currentSwipeProfile.tagline || currentSwipeProfile.aboutMeLong}"
            </p>

            {/* PREVIEW OF MULTIPLE IDENTITIES */}
            <div className="p-3.5 rounded-2xl bg-black/65 backdrop-blur-md border border-white/10 space-y-2">
              <span className="text-xs uppercase font-heading font-bold text-zinc-400 tracking-wider block">
                {currentSwipeProfile.name}'s Identity Universes
              </span>
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                {getProfileIdentities(currentSwipeProfile).map(id => (
                  <span
                    key={id.id}
                    className="px-3 py-1 rounded-xl text-xs font-heading font-semibold bg-white/10 text-white whitespace-nowrap border border-white/10"
                  >
                    {id.type === 'real' ? '👤' : id.type === 'cinematic' ? '🎬' : '🏰'} {id.label}
                  </span>
                ))}
              </div>
            </div>

            {/* Values & Intent */}
            <div className="flex items-center gap-2 flex-wrap text-xs">
              <span className="px-3 py-1 rounded-full bg-white/20 text-white font-heading font-bold">
                {currentSwipeProfile.intent}
              </span>
              {currentSwipeProfile.coreValues?.slice(0, 2).map(val => (
                <span key={val} className="px-3 py-1 rounded-full bg-white/10 text-zinc-200 border border-white/10 font-medium">
                  {val}
                </span>
              ))}
            </div>

            {/* Interaction Buttons Bar with 48px+ Touch Targets */}
            <div className="flex items-center justify-around pt-3">
              <button
                onClick={() => handleSwipeAction('pass')}
                className="w-14 h-14 rounded-full bg-[#12141B]/80 backdrop-blur-xl border border-white/15 text-zinc-400 hover:text-red-400 hover:border-red-400/50 flex items-center justify-center transition-all cursor-pointer active:scale-90 shadow-[0_8px_24px_rgba(0,0,0,0.6)]"
                title="Pass"
              >
                <X className="w-6 h-6 stroke-[2.5]" />
              </button>

              <button
                onClick={() => handleSwipeAction('superlike')}
                className="w-12 h-12 rounded-full bg-[#12141B]/80 backdrop-blur-xl border border-amber-400/30 text-amber-300 hover:border-amber-400 flex items-center justify-center transition-all cursor-pointer active:scale-90 shadow-[0_8px_24px_rgba(245,158,11,0.2)]"
                title="Super Like"
              >
                <Star className="w-5 h-5 fill-amber-300/30 text-amber-300" />
              </button>

              <button
                onClick={() => onInitiateChat(currentSwipeProfile)}
                className="w-12 h-12 rounded-full bg-[#12141B]/80 backdrop-blur-xl border border-emerald-400/30 text-emerald-400 hover:border-emerald-400 flex items-center justify-center transition-all cursor-pointer active:scale-90 shadow-[0_8px_24px_rgba(16,185,129,0.2)]"
                title="Direct Chat"
              >
                <MessageCircle className="w-5 h-5" />
              </button>

              <button
                onClick={() => handleSwipeAction('like')}
                className="w-14 h-14 rounded-full bg-white text-[#090A0E] flex items-center justify-center transition-all cursor-pointer active:scale-90 shadow-[0_0_28px_rgba(255,255,255,0.45)] hover:bg-zinc-200"
                title="Like"
              >
                <Heart className="w-7 h-7 fill-[#090A0E]" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4.5. MODE A: MASTER SOCIAL DISCOVERY & RESONANCE ENGINE (Master Prompt 04) */}
      {viewMode === 'engine' && (
        <SocialDiscoveryEngineView
          currentUserId={CURRENT_USER.id}
          onInitiateChat={onInitiateChat}
          onOpenProfileDetail={onOpenProfile}
        />
      )}

      {/* 5. MODE B: VERTICAL EXPLORE FEED */}
      {viewMode === 'feed' && (
        <div className="space-y-8">
          {filteredProfiles.map(profile => {
            const identities = getProfileIdentities(profile);
            return (
              <div
                key={profile.id}
                className="sv-card p-0 overflow-hidden group hover:border-white/25 transition-all"
              >
                {/* Photo & Hero Header */}
                <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full overflow-hidden bg-black/40">
                  <img
                    src={profile.photos?.[0] || profile.avatar}
                    alt={profile.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#090A0E] via-black/20 to-black/40 pointer-events-none" />

                  {/* Top Badges */}
                  <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                    <span className="h-8 px-3 rounded-full text-xs font-heading font-bold bg-black/60 backdrop-blur-md text-white border border-white/15 flex items-center gap-1.5 shadow-sm">
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      <span>{profile.compatibilityScore || 88}% Compatibility</span>
                    </span>

                    <span className="h-8 px-3 rounded-full text-xs font-heading font-bold bg-white/15 backdrop-blur-md text-white border border-white/20 flex items-center">
                      {profile.intent}
                    </span>
                  </div>

                  {/* Bottom Title on Image */}
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex items-center gap-2.5">
                      <h3 className="text-2xl sm:text-3xl font-extrabold text-white font-heading tracking-tight">
                        {profile.name}, {profile.age}
                      </h3>
                      <ShieldCheck className="w-5 h-5 text-emerald-400" />
                    </div>
                    <p className="type-supporting text-zinc-300 mt-1 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-zinc-400" />
                      <span>{profile.location}</span>
                      <span>·</span>
                      <span className="text-zinc-200 font-medium">{profile.status}</span>
                    </p>
                  </div>
                </div>

                {/* Card Body with Generous Padding */}
                <div className="p-6 sm:p-7 space-y-5">
                  {/* Tagline */}
                  <p className="type-body text-zinc-200 leading-relaxed italic">
                    "{profile.tagline || profile.aboutMeLong}"
                  </p>

                  {/* PREVIEW OF MULTIPLE IDENTITIES */}
                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-3">
                    <div className="flex items-center justify-between text-xs font-heading font-bold">
                      <span className="text-zinc-400 uppercase tracking-wider">Multiple Identities & Universes</span>
                      <span className="text-amber-300">3 Personas</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      {identities.map(id => (
                        <div
                          key={id.id}
                          onClick={() => onOpenProfile(profile)}
                          className="p-3 rounded-xl bg-white/[0.04] border border-white/10 hover:bg-white/[0.08] hover:border-amber-400/30 cursor-pointer transition-all"
                        >
                          <span className="text-base block">
                            {id.type === 'real' ? '👤' : id.type === 'cinematic' ? '🎬' : '🏰'}
                          </span>
                          <span className="text-xs font-heading font-bold text-white block mt-1.5 truncate">
                            {id.label}
                          </span>
                          <span className="text-xs text-zinc-400 block truncate mt-0.5">
                            {id.role}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Core Values & Interests Chips */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {profile.coreValues?.map(val => (
                      <span key={val} className="px-3 py-1 rounded-full text-xs font-heading font-semibold bg-white/10 text-zinc-200 border border-white/10">
                        {val}
                      </span>
                    ))}
                    {profile.interests?.slice(0, 3).map(interest => (
                      <span key={interest} className="px-3 py-1 rounded-full text-xs font-medium bg-black/40 text-zinc-400 border border-white/5">
                        #{interest}
                      </span>
                    ))}
                  </div>

                  {/* Action Buttons: 44px standard CTA buttons */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-4 border-t border-white/[0.08] gap-3">
                    <button
                      onClick={() => onOpenProfile(profile)}
                      className="sv-btn-secondary flex-1 sm:flex-initial"
                    >
                      <Eye className="w-4 h-4 text-zinc-300" />
                      <span>Explore Personas & Bio</span>
                    </button>

                    <button
                      onClick={() => onInitiateChat(profile)}
                      className="sv-btn-primary flex-1 sm:flex-initial"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>Chat</span>
                    </button>
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
