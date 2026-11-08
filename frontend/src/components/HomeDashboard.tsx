import React, { useState } from 'react';
import { 
  Sparkles, 
  Compass, 
  Calendar, 
  Users, 
  ArrowRight, 
  ShieldCheck, 
  Radio, 
  MessageSquare, 
  Share2, 
  Clock,
  MapPin,
  Award,
  ChevronRight,
  Volume2,
  ExternalLink
} from 'lucide-react';
import { MOCK_PROFILES, CURRENT_USER, MOCK_EVENTS, MOCK_CIRCLES } from '../mockData';
import type { ExperienceTab, UserProfile, SocialCircle, FriendsEvent } from '../types';

interface HomeDashboardProps {
  onNavigate: (tab: ExperienceTab) => void;
  onInitiateChat: (profile: UserProfile) => void;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({ onNavigate, onInitiateChat }) => {
  const [activeIntentFilter, setActiveIntentFilter] = useState<'all' | 'Friendship' | 'Dating'>('all');
  const [dailyHopeRevealed, setDailyHopeRevealed] = useState(false);

  const filteredMatches = MOCK_PROFILES.filter(p => {
    if (activeIntentFilter === 'all') return true;
    return p.intent === activeIntentFilter;
  });

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      {/* Top Welcome & Daily Hope Anchor */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#171717] via-[#211E18] to-[#171717] border border-[#302B22] p-6 sm:p-8 gold-glow-subtle">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#D6AD60]/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D6AD60]/10 border border-[#D6AD60]/30 text-xs font-semibold text-[#F1D99F]">
              <Sparkles className="w-3.5 h-3.5 text-[#D6AD60]" />
              <span>FRIENDS ARCHITECTURE • GOLDEN × OBSIDIAN EDITION</span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-[#F5F0E6]">
              Welcome back, <span className="bg-gradient-to-r from-[#D6AD60] to-[#F1D99F] bg-clip-text text-transparent">Kavindu</span>.
            </h1>
            
            <p className="text-sm sm:text-base text-[#A7A094] leading-relaxed">
              "You haven’t met all the people who will matter to you yet. Your story is still being written. Let’s make today a little different."
            </p>

            {/* Daily Hope Card Expandable */}
            <div className="pt-2">
              {!dailyHopeRevealed ? (
                <button
                  onClick={() => setDailyHopeRevealed(true)}
                  className="inline-flex items-center gap-2 text-xs font-semibold text-[#D6AD60] hover:text-[#F1D99F] transition-colors cursor-pointer group"
                >
                  <span>Open Today's Social Growth Prompt</span>
                  <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>
              ) : (
                <div className="p-4 rounded-2xl bg-[#090909]/80 border border-[#D6AD60]/30 space-y-2 mt-2 max-w-xl animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#F1D99F] uppercase tracking-wider flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-[#D6AD60]" />
                      Day 3 of 30: The Low-Stakes Micro-Interaction
                    </span>
                    <button 
                      onClick={() => onNavigate('social_growth')} 
                      className="text-[11px] text-[#D6AD60] hover:underline"
                    >
                      View Ladder →
                    </button>
                  </div>
                  <p className="text-xs text-[#F5F0E6]">
                    "Send a 1-line genuine compliment or answer someone's anonymous prompt in a Micro-Circle today. No pressure to sustain a 2-hour conversation."
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Profile Strength & Verification Badge */}
          <div className="flex flex-col sm:flex-row md:flex-col items-center gap-4 bg-[#111111]/90 border border-[#302B22] p-4 rounded-2xl min-w-[200px]">
            <div className="relative w-16 h-16 flex items-center justify-center">
              <svg className="w-16 h-16 transform -rotate-90">
                <circle cx="32" cy="32" r="28" stroke="#211E18" strokeWidth="5" fill="transparent" />
                <circle 
                  cx="32" 
                  cy="32" 
                  r="28" 
                  stroke="#D6AD60" 
                  strokeWidth="5" 
                  strokeDasharray="175.9" 
                  strokeDashoffset="21.1" 
                  strokeLinecap="round" 
                  fill="transparent" 
                />
              </svg>
              <span className="absolute text-xs font-bold text-[#F1D99F]">88%</span>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center gap-1.5">
                <span className="text-xs font-bold text-[#F5F0E6]">Identity Strength</span>
                <ShieldCheck className="w-3.5 h-3.5 text-[#D6AD60]" />
              </div>
              <p className="text-[11px] text-[#A7A094] mt-0.5">8 of 8 Chapters Complete</p>
              <button 
                onClick={() => onNavigate('my_world')}
                className="mt-2 text-[11px] font-semibold text-[#D6AD60] hover:text-[#F1D99F] transition-colors"
              >
                Manage Profile →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Primary Action Quick-Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button 
          onClick={() => onNavigate('events')}
          className="flex items-center gap-3 p-3.5 rounded-2xl bg-[#111111] hover:bg-[#171717] border border-[#302B22] hover:border-[#D6AD60]/50 transition-all text-left cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-[#211E18] flex items-center justify-center border border-[#302B22] group-hover:border-[#D6AD60]">
            <Calendar className="w-5 h-5 text-[#D6AD60]" />
          </div>
          <div>
            <div className="text-xs font-bold text-[#F5F0E6] group-hover:text-[#F1D99F]">Host / Join Event</div>
            <div className="text-[10px] text-[#A7A094]">Parties & Co-working</div>
          </div>
        </button>

        <button 
          onClick={() => onNavigate('share_engine')}
          className="flex items-center gap-3 p-3.5 rounded-2xl bg-[#111111] hover:bg-[#171717] border border-[#302B22] hover:border-[#D6AD60]/50 transition-all text-left cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-[#211E18] flex items-center justify-center border border-[#302B22] group-hover:border-[#D6AD60]">
            <Share2 className="w-5 h-5 text-[#D6AD60]" />
          </div>
          <div>
            <div className="text-xs font-bold text-[#F5F0E6] group-hover:text-[#F1D99F]">Identity Card</div>
            <div className="text-[10px] text-[#A7A094]">Share to Instagram</div>
          </div>
        </button>

        <button 
          onClick={() => onNavigate('messages_rooms')}
          className="flex items-center gap-3 p-3.5 rounded-2xl bg-[#111111] hover:bg-[#171717] border border-[#302B22] hover:border-[#D6AD60]/50 transition-all text-left cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-[#211E18] flex items-center justify-center border border-[#302B22] group-hover:border-[#D6AD60]">
            <Radio className="w-5 h-5 text-[#D6AD60]" />
          </div>
          <div>
            <div className="text-xs font-bold text-[#F5F0E6] group-hover:text-[#F1D99F]">Live Audio Lounges</div>
            <div className="text-[10px] text-[#A7A094]">3 active rooms</div>
          </div>
        </button>

        <button 
          onClick={() => onNavigate('privacy_centre')}
          className="flex items-center gap-3 p-3.5 rounded-2xl bg-[#111111] hover:bg-[#171717] border border-[#302B22] hover:border-[#D6AD60]/50 transition-all text-left cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-[#211E18] flex items-center justify-center border border-[#302B22] group-hover:border-[#D6AD60]">
            <ShieldCheck className="w-5 h-5 text-[#D6AD60]" />
          </div>
          <div>
            <div className="text-xs font-bold text-[#F5F0E6] group-hover:text-[#F1D99F]">Privacy & Control</div>
            <div className="text-[10px] text-[#A7A094]">Provenance & Export</div>
          </div>
        </button>
      </div>

      {/* Main Grid: Recommended Connections & Experiences */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Cols: Holistic Compatibility Matches */}
        <div className="lg:col-span-2 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#302B22]">
            <div>
              <h2 className="text-lg font-bold text-[#F5F0E6] flex items-center gap-2">
                <Compass className="w-5 h-5 text-[#D6AD60]" />
                <span>Compatible Humans (HCM Model)</span>
              </h2>
              <p className="text-xs text-[#A7A094] mt-0.5">
                Matched on values, communication cadence, and lifestyle rhythms—not superficial swipes.
              </p>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 bg-[#111111] p-1 rounded-xl border border-[#302B22]">
              <button
                onClick={() => setActiveIntentFilter('all')}
                className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-all cursor-pointer ${
                  activeIntentFilter === 'all' 
                    ? 'bg-[#D6AD60] text-[#090909] font-bold' 
                    : 'text-[#A7A094] hover:text-[#F5F0E6]'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setActiveIntentFilter('Friendship')}
                className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-all cursor-pointer ${
                  activeIntentFilter === 'Friendship' 
                    ? 'bg-[#D6AD60] text-[#090909] font-bold' 
                    : 'text-[#A7A094] hover:text-[#F5F0E6]'
                }`}
              >
                Friends
              </button>
              <button
                onClick={() => setActiveIntentFilter('Dating')}
                className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-all cursor-pointer ${
                  activeIntentFilter === 'Dating' 
                    ? 'bg-[#D6AD60] text-[#090909] font-bold' 
                    : 'text-[#A7A094] hover:text-[#F5F0E6]'
                }`}
              >
                Dating
              </button>
            </div>
          </div>

          {/* Compatibility Match Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredMatches.map(profile => (
              <div 
                key={profile.id}
                className="rounded-2xl bg-[#171717] border border-[#302B22] p-5 hover:border-[#D6AD60]/60 transition-all flex flex-col justify-between group"
              >
                <div className="space-y-4">
                  {/* Top Bar: Avatar & Compatibility Score */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img 
                        src={profile.avatar} 
                        alt={profile.name} 
                        className="w-12 h-12 rounded-xl object-cover border border-[#302B22]" 
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="text-sm font-bold text-[#F5F0E6] group-hover:text-[#F1D99F] transition-colors">
                            {profile.name}, {profile.age}
                          </h3>
                          {profile.verifications?.idDocumentVerified && (
                            <ShieldCheck className="w-3.5 h-3.5 text-[#D6AD60]" />
                          )}
                        </div>
                        <div className="text-[11px] text-[#A7A094] flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          <span>{profile.location}</span>
                          <span>•</span>
                          <span className="text-[#D6AD60]">{profile.intent}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm font-extrabold text-[#D6AD60]">
                        {profile.compatibilityScore}%
                      </div>
                      <div className="text-[10px] text-[#A7A094]">HCM Fit</div>
                    </div>
                  </div>

                  {/* Compatibility Explanation */}
                  <div className="p-2.5 rounded-xl bg-[#111111] border border-[#211E18] text-xs text-[#A7A094] leading-relaxed">
                    <span className="text-[#F1D99F] font-semibold">Why you align: </span>
                    {profile.matchReasons?.[0] || 'Shared core values and compatible conversation rhythms.'}
                  </div>

                  {/* Public Most Active Time Window */}
                  {profile.activeTimeWindow && (
                    <div className="flex items-center justify-between p-2 rounded-xl bg-[#111111] border border-[#211E18] text-[11px]">
                      <div className="flex items-center gap-1.5 text-[#F1D99F] font-medium truncate">
                        <Clock className="w-3.5 h-3.5 text-[#D6AD60]" />
                        <span className="text-[#A7A094]">Active to chat:</span>
                        <span className="truncate">{profile.activeTimeWindow.periodLabel}</span>
                      </div>
                      {profile.activeTimeWindow.isCurrentlyInActiveWindow ? (
                        <span className="px-1.5 py-0.5 rounded bg-emerald-950/50 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold shrink-0">
                          Active Now
                        </span>
                      ) : (
                        <span className="text-[10px] text-[#A7A094] shrink-0">
                          {profile.activeTimeWindow.lastSeenDescription}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Top Core Values */}
                  <div className="flex flex-wrap gap-1.5">
                    {profile.coreValues.slice(0, 3).map((v, i) => (
                      <span 
                        key={i}
                        className="px-2 py-0.5 rounded-md bg-[#211E18] border border-[#302B22] text-[10px] font-medium text-[#F5F0E6]"
                      >
                        {v}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Card CTA */}
                <div className="pt-4 mt-4 border-t border-[#211E18] flex items-center justify-between">
                  <span className="text-[11px] text-[#A7A094]">
                    {profile.energy} energy
                  </span>
                  <button
                    onClick={() => onInitiateChat(profile)}
                    className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#D6AD60] to-[#F1D99F] text-[#090909] font-bold text-xs flex items-center gap-1.5 hover:opacity-90 transition-opacity cursor-pointer shadow-sm shadow-[#D6AD60]/20"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Connect</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Beyond FRIENDS Prompt Teaser */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-[#171717] to-[#211E18] border border-[#302B22] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <div className="text-xs font-bold text-[#F1D99F] flex items-center justify-center sm:justify-start gap-1.5">
                <ExternalLink className="w-3.5 h-3.5 text-[#D6AD60]" />
                Looking for very specific niche subcultures?
              </div>
              <p className="text-xs text-[#A7A094]">
                Explore curated external communities across Discord, Reddit, Tandem, and 7 Cups.
              </p>
            </div>
            <button
              onClick={() => onNavigate('friends_connect')}
              className="px-3.5 py-2 rounded-xl bg-[#211E18] hover:bg-[#302B22] border border-[#302B22] text-xs font-semibold text-[#F5F0E6] hover:text-[#D6AD60] transition-colors whitespace-nowrap cursor-pointer"
            >
              Beyond FRIENDS Directory →
            </button>
          </div>
        </div>

        {/* Right 1 Col: Live Circles, Watch Parties & Safety */}
        <div className="space-y-6">
          
          {/* Active Micro-Circles (5-10 people) */}
          <div className="rounded-2xl bg-[#171717] border border-[#302B22] p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#F5F0E6] flex items-center gap-2">
                <Users className="w-4 h-4 text-[#D6AD60]" />
                <span>Micro-Social Circles</span>
              </h3>
              <button 
                onClick={() => onNavigate('communities')} 
                className="text-xs text-[#D6AD60] hover:underline"
              >
                View All
              </button>
            </div>

            <p className="text-xs text-[#A7A094]">
              Intimate groups capped at 10 members. Low-stakes discussions without crowd anxiety.
            </p>

            <div className="space-y-2.5">
              {MOCK_CIRCLES.slice(0, 3).map((circle: SocialCircle) => (
                <div 
                  key={circle.id}
                  className="p-3 rounded-xl bg-[#111111] border border-[#211E18] hover:border-[#302B22] transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#F5F0E6]">{circle.name}</span>
                    <span className="text-[10px] text-[#A7A094]">{circle.membersCount}/{circle.maxMembers}</span>
                  </div>
                  <p className="text-[11px] text-[#A7A094] mt-1 line-clamp-1">{circle.description}</p>
                  <div className="mt-2 flex items-center justify-between text-[10px]">
                    <span className="text-[#D6AD60]">{circle.topic}</span>
                    {circle.activeVoiceRoom && (
                      <span className="flex items-center gap-1 text-emerald-400">
                        <Volume2 className="w-3 h-3 animate-pulse" />
                        Voice Active
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Gatherings & Synchronized Watch Parties */}
          <div className="rounded-2xl bg-[#171717] border border-[#302B22] p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#F5F0E6] flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#D6AD60]" />
                <span>Upcoming Experiences</span>
              </h3>
              <button 
                onClick={() => onNavigate('events')} 
                className="text-xs text-[#D6AD60] hover:underline"
              >
                Explore Events
              </button>
            </div>

            <div className="space-y-3">
              {MOCK_EVENTS.slice(0, 2).map((event: FriendsEvent) => (
                <div 
                  key={event.id}
                  className="p-3 rounded-xl bg-[#111111] border border-[#211E18] space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-[#F1D99F] uppercase px-2 py-0.5 rounded bg-[#211E18]">
                      {event.type.replace('_', ' ')}
                    </span>
                    <span className="text-[11px] text-[#A7A094] flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {event.date}
                    </span>
                  </div>
                  <div className="text-xs font-bold text-[#F5F0E6]">{event.title}</div>
                  <div className="text-[11px] text-[#A7A094] flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-[#D6AD60]" />
                    <span>{event.locationName}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* FRIENDS REAL Safety Sentinel */}
          <div className="p-4 rounded-2xl bg-[#111111] border border-[#302B22] space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-[#F1D99F]">
              <ShieldCheck className="w-4 h-4 text-[#D6AD60]" />
              <span>Real People. Zero Catfishing.</span>
            </div>
            <p className="text-[11px] text-[#A7A094] leading-relaxed">
              Every in-person meetup is backed by FRIENDS MEET safety plans, trusted check-in alerts, and strict verification checkpoints.
            </p>
            <button
              onClick={() => onNavigate('friends_real')}
              className="text-xs font-semibold text-[#D6AD60] hover:text-[#F1D99F] transition-colors"
            >
              Open Safety Dashboard →
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
