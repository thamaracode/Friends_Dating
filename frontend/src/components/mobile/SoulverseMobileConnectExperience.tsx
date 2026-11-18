import React, { useState } from 'react';
import { 
  Globe2, 
  Users, 
  Calendar, 
  Tv, 
  MapPin, 
  Clock, 
  Check, 
  ChevronRight, 
  Heart, 
  MessageSquare,
  BookOpen
} from 'lucide-react';
import { MOCK_EVENTS, MOCK_CIRCLES } from '../../mockData';
import type { FriendsEvent, SocialCircle } from '../../types';

interface SoulverseMobileConnectExperienceProps {
  onOpenEventDetail?: (event: FriendsEvent) => void;
  onOpenWorld?: (worldId: string) => void;
  onOpenJournal?: () => void;
  onOpenSoloPrompt?: (promptId: string) => void;
  onOpenVault?: () => void;
  onOpenUnspoken?: () => void;
}

/**
 * SOULVERSE REDESIGNED EXPLORE DESTINATION
 * Editorial composition for communities, events, watch parties, and shared interests.
 * Replaces generic social feeds with curated, intentional gatherings.
 */
export const SoulverseMobileConnectExperience: React.FC<SoulverseMobileConnectExperienceProps> = ({
  onOpenEventDetail,
  onOpenWorld,
  onOpenJournal,
  onOpenUnspoken
}) => {
  // Category Filter
  const [activeCategory, setActiveCategory] = useState<'all' | 'communities' | 'events' | 'watch_parties' | 'inquiries'>('all');

  // RSVP States
  const [rsvps, setRsvps] = useState<Record<string, boolean>>({
    'evt_1': true
  });

  // Joined Communities States
  const [joinedCommunities, setJoinedCommunities] = useState<Record<string, boolean>>({
    'cir_1': true
  });

  const toggleRsvp = (id: string) => {
    setRsvps(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleJoin = (id: string) => {
    setJoinedCommunities(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const categories = [
    { id: 'all' as const, label: 'All Curated' },
    { id: 'communities' as const, label: 'Communities & Tribes' },
    { id: 'events' as const, label: 'Social Gatherings' },
    { id: 'watch_parties' as const, label: 'Cinema & Watch Parties' },
    { id: 'inquiries' as const, label: 'Connection Inquiries' }
  ];

  return (
    <div className="w-full max-w-5xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-8 animate-fadeIn pb-32 font-body text-zinc-100">
      
      {/* 1. EDITORIAL HEADER & CATEGORY SWITCHER */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/[0.08] pb-5">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.06] border border-white/10 text-xs font-mono text-zinc-300">
            <Globe2 className="w-3.5 h-3.5 text-sky-400" />
            <span>Shared Realities</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-heading font-extrabold text-white tracking-tight">
            Explore & Connect
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400">
            Intimate communities, physical gatherings, collective cinema, and mutual passions.
          </p>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          {categories.map((cat) => {
            const isSelected = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`h-9 px-3.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                  isSelected
                    ? 'bg-white text-[#0A0B0F] shadow-sm font-bold'
                    : 'bg-white/[0.04] text-zinc-400 hover:text-white border border-white/[0.08]'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. FEATURED EVENT SPREAD (Editorial Magazine Hero) */}
      {(activeCategory === 'all' || activeCategory === 'events') && MOCK_EVENTS[0] && (
        <div className="relative rounded-3xl overflow-hidden bg-[#12141D] border border-white/[0.10] shadow-2xl group">
          <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[360px]">
            {/* Left Cover Image */}
            <div className="lg:col-span-7 relative min-h-[240px] lg:min-h-full overflow-hidden bg-[#0A0B0F]">
              <img 
                src={MOCK_EVENTS[0].coverImage} 
                alt={MOCK_EVENTS[0].title}
                className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500" 
              />
              <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-black/80 via-black/30 to-transparent" />
              <div className="absolute top-4 left-4">
                <span className="px-3 py-1 rounded-full bg-rose-500/90 text-white text-[10px] font-bold uppercase tracking-wider backdrop-blur-md">
                  Featured Gathering
                </span>
              </div>
            </div>

            {/* Right Details */}
            <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between space-y-4 bg-[#12141D]">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
                  <Calendar className="w-3.5 h-3.5 text-amber-400" />
                  <span>{MOCK_EVENTS[0].date} • {MOCK_EVENTS[0].time}</span>
                </div>

                <h3 className="text-xl sm:text-2xl font-extrabold text-white font-heading leading-tight">
                  {MOCK_EVENTS[0].title}
                </h3>

                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-body">
                  {MOCK_EVENTS[0].description}
                </p>

                <div className="flex items-center gap-2 text-xs text-zinc-400 pt-1">
                  <MapPin className="w-3.5 h-3.5 text-zinc-500" />
                  <span>{MOCK_EVENTS[0].locationName}</span>
                </div>
              </div>

              {/* Host & RSVP Action */}
              <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <img 
                    src={MOCK_EVENTS[0].hostAvatar} 
                    alt={MOCK_EVENTS[0].hostName} 
                    className="w-8 h-8 rounded-full object-cover border border-white/20" 
                  />
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-zinc-500 font-mono block">Hosted by</span>
                    <span className="text-xs font-bold text-white block truncate">{MOCK_EVENTS[0].hostName}</span>
                  </div>
                </div>

                <button
                  onClick={() => toggleRsvp(MOCK_EVENTS[0].id)}
                  className={`h-10 px-5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer ${
                    rsvps[MOCK_EVENTS[0].id]
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-white text-[#0A0B0F] hover:bg-zinc-200 shadow-md'
                  }`}
                >
                  {rsvps[MOCK_EVENTS[0].id] && <Check className="w-3.5 h-3.5" />}
                  <span>{rsvps[MOCK_EVENTS[0].id] ? 'Attending ✓' : 'RSVP Spot'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. CURATED COMMUNITIES & TRIBES */}
      {(activeCategory === 'all' || activeCategory === 'communities') && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white font-heading">
                Communities & Intimate Tribes
              </h2>
              <p className="text-xs text-zinc-400">Capped small groups designed for high-signal conversation without noise.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {MOCK_CIRCLES.map((circle) => {
              const isJoined = joinedCommunities[circle.id];
              return (
                <div 
                  key={circle.id}
                  className="p-5 rounded-3xl dark-glass border border-white/[0.08] hover:border-white/[0.18] transition-all space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full bg-white/[0.05] border border-white/10 text-[11px] font-mono text-zinc-300">
                        {circle.topic}
                      </span>
                      <span className="text-[11px] font-mono text-zinc-400">
                        {circle.membersCount}/{circle.maxMembers} Members
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-white font-heading">
                      {circle.name}
                    </h3>

                    <p className="text-xs text-zinc-300 leading-relaxed font-body">
                      {circle.description}
                    </p>

                    {circle.currentActivity && (
                      <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-xs text-zinc-300">
                        <span className="text-[10px] font-mono text-rose-300 uppercase block font-bold">Active Inquiry</span>
                        <span>{circle.currentActivity}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-white/[0.06]">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {circle.tags.slice(0, 2).map((t) => (
                        <span key={t} className="text-[10px] text-zinc-500 font-mono">
                          #{t}
                        </span>
                      ))}
                    </div>

                    <button
                      onClick={() => toggleJoin(circle.id)}
                      className={`h-9 px-4 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                        isJoined 
                          ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                          : 'bg-white/10 hover:bg-white/20 text-white border border-white/15'
                      }`}
                    >
                      {isJoined && <Check className="w-3 h-3" />}
                      <span>{isJoined ? 'Joined Tribe' : 'Join Tribe'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. COLLECTIVE CINEMA & WATCH PARTIES */}
      {(activeCategory === 'all' || activeCategory === 'watch_parties') && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white font-heading">
                Cinema & Ambient Watch Parties
              </h2>
              <p className="text-xs text-zinc-400">Synchronized film screenings with low-latency audio discussion.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 rounded-3xl dark-glass border border-white/[0.08] space-y-3 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-bold border border-purple-500/30">
                  Live Stream Tonight
                </span>
                <span className="text-xs text-zinc-500 font-mono">9:00 PM</span>
              </div>
              <h3 className="text-base font-bold text-white font-heading">
                Studio Ghibli: Spirited Away & Atmosphere
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed font-body">
                An evening screening followed by an open discussion on visual world-building, nostalgia, and Joe Hisaishi's composition.
              </p>
              <div className="flex items-center justify-between pt-2 border-t border-white/[0.06]">
                <span className="text-[11px] font-mono text-zinc-400">14 Members Watching</span>
                <button 
                  onClick={() => toggleRsvp('ghibli_watch')}
                  className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold cursor-pointer"
                >
                  {rsvps['ghibli_watch'] ? 'Saved ✓' : 'Join Room'}
                </button>
              </div>
            </div>

            <div className="p-5 rounded-3xl dark-glass border border-white/[0.08] space-y-3 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 text-[10px] font-bold border border-sky-500/30">
                  Saturday Evening
                </span>
                <span className="text-xs text-zinc-500 font-mono">8:30 PM</span>
              </div>
              <h3 className="text-base font-bold text-white font-heading">
                Blade Runner 2049: Sound Architecture
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed font-body">
                Exploring synthetic textures, solitude, and what makes memory feel authentic in a simulated society.
              </p>
              <div className="flex items-center justify-between pt-2 border-t border-white/[0.06]">
                <span className="text-[11px] font-mono text-zinc-400">9 Members Attending</span>
                <button 
                  onClick={() => toggleRsvp('br2049_watch')}
                  className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold cursor-pointer"
                >
                  {rsvps['br2049_watch'] ? 'Saved ✓' : 'Join Room'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. CONNECTION INQUIRY OF THE DAY */}
      {(activeCategory === 'all' || activeCategory === 'inquiries') && (
        <div className="p-6 rounded-3xl dark-glass border border-white/[0.08] space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-rose-300 font-bold block">
                Daily Connection Inquiry
              </span>
              <h3 className="text-lg font-bold text-white font-heading">
                "What is a piece of advice you followed that you later had to unlearn?"
              </h3>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] space-y-1">
              <span className="text-[11px] font-bold text-white font-heading">Elena Rostova, 27</span>
              <p className="text-xs text-zinc-300 italic font-body leading-relaxed">
                "That being 'low maintenance' in relationships makes you easy to love. It usually just means abandoning your own boundaries to keep someone comfortable."
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] space-y-1">
              <span className="text-[11px] font-bold text-white font-heading">Marcus Vance, 29</span>
              <p className="text-xs text-zinc-300 italic font-body leading-relaxed">
                "That passion is something you stumble into. In reality, depth and fascination follow disciplined attention and patience."
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
