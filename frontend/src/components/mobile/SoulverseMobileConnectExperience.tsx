import React, { useState } from 'react';
import { 
  Users, 
  Calendar, 
  Tv, 
  Radio, 
  Sparkles, 
  MapPin, 
  ShieldCheck, 
  ChevronRight, 
  Heart, 
  MessageSquare, 
  Compass, 
  HelpCircle, 
  Globe2, 
  Clock, 
  Play, 
  Check, 
  Coffee,
  Bookmark
} from 'lucide-react';
import { MOCK_EVENTS, MOCK_CIRCLES } from '../../mockData';
import type { FriendsEvent, SocialCircle } from '../../types';
import { ContextualEmotionalBanner } from '../emotional/ContextualEmotionalBanner';
import { ConfessionsStreamView } from '../confessions/ConfessionsStreamView';

interface SoulverseMobileConnectExperienceProps {
  onOpenEventDetail?: (event: FriendsEvent) => void;
  onOpenWorld?: (worldId: string) => void;
  onOpenJournal?: () => void;
  onOpenSoloPrompt?: (promptId: string) => void;
  onOpenVault?: () => void;
  onOpenUnspoken?: () => void;
}

export const SoulverseMobileConnectExperience: React.FC<SoulverseMobileConnectExperienceProps> = ({
  onOpenEventDetail,
  onOpenWorld,
  onOpenJournal,
  onOpenSoloPrompt,
  onOpenVault,
  onOpenUnspoken
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'confessions' | 'vault' | 'events' | 'communities' | 'watch_parties' | 'solo' | 'worlds'>('all');
  const [rsvpStates, setRsvpStates] = useState<Record<string, boolean>>({
    'evt_1': true
  });
  const [joinedCommunities, setJoinedCommunities] = useState<Record<string, boolean>>({
    'c_1': true
  });

  const toggleRsvp = (eventId: string) => {
    setRsvpStates(prev => ({ ...prev, [eventId]: !prev[eventId] }));
  };

  const toggleJoinCommunity = (id: string) => {
    setJoinedCommunities(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const filterTabs = [
    { id: 'all' as const, label: 'All Experiences' },
    { id: 'confessions' as const, label: '🤫 Secret Confessions' },
    { id: 'vault' as const, label: '🔐 Relationship Vault' },
    { id: 'events' as const, label: '🎪 Events & Meetups' },
    { id: 'communities' as const, label: '👥 Communities' },
    { id: 'watch_parties' as const, label: '🍿 Watch Parties' },
    { id: 'solo' as const, label: '🧘 Solo & Journals' },
    { id: 'worlds' as const, label: '🌌 Story Worlds' }
  ];

  return (
    <div className="w-full space-y-8 pb-32 max-w-2xl mx-auto animate-fadeIn px-1 sm:px-2">
      
      {/* 1. TOP HEADER BANNER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <div>
          <h1 className="type-page-heading flex items-center gap-2.5">
            <Users className="w-6 h-6 text-amber-300" />
            <span>Connect &amp; Socialize</span>
          </h1>
          <p className="type-supporting mt-1">Events, communities, watch-parties and introspective spaces</p>
        </div>
      </div>

      {/* 2. FILTER PILLS */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
        {filterTabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`h-10 px-4 rounded-full text-xs font-heading font-semibold whitespace-nowrap transition-all cursor-pointer shrink-0 flex items-center ${
              activeTab === tab.id
                ? 'bg-white text-[#090A0E] shadow-md font-bold'
                : 'bg-white/[0.04] text-zinc-300 hover:text-white hover:bg-white/[0.08] border border-white/10'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* CONTEXTUAL EMOTIONAL LAYER ("Human Connection") */}
      <ContextualEmotionalBanner 
        page="connect" 
        onOpenUnspoken={onOpenUnspoken} 
      />

      {/* ===================================================================== */}
      {/* SECTION 0: PERSONAL RELATIONSHIP MANAGEMENT (RELATIONSHIP VAULT)      */}
      {/* ===================================================================== */}
      {(activeTab === 'all' || activeTab === 'vault') && (
        <div className="sv-card relative overflow-hidden bg-gradient-to-r from-amber-500/10 via-white/[0.02] to-transparent space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_8px_#F59E0B]" />
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-300">
                Core Pillar · Private Memory
              </span>
            </div>
            <button
              onClick={onOpenVault}
              className="text-xs font-heading font-bold text-amber-300 hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span>Open Vault</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-1.5">
            <h3 className="type-card-heading text-white font-bold">
              Relationship Vault &amp; Connection Memory
            </h3>
            <p className="type-body text-zinc-300 leading-relaxed">
              Never lose touch with what matters. Access "Before You Talk" instant briefings, promise tracking, and personal memories for your partners and friends.
            </p>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-white/[0.08] flex-wrap gap-3">
            <div className="flex items-center gap-3 text-zinc-400 text-xs font-medium">
              <span>🔒 100% Private</span>
              <span>·</span>
              <span>⚡ Prospective Memory</span>
              <span>·</span>
              <span>🤝 Promise Tracker</span>
            </div>

            <button
              onClick={onOpenVault}
              className="sv-btn-gold"
            >
              Launch Vault
            </button>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* SECTION 1: SYNCHRONIZED WATCH PARTIES (Studio Ghibli & Lo-Fi Lounge)   */}
      {/* ===================================================================== */}
      {(activeTab === 'all' || activeTab === 'watch_parties') && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <span className="type-card-heading font-bold text-white flex items-center gap-2">
              <Tv className="w-5 h-5 text-amber-300" />
              <span>Synchronized Watch Parties</span>
            </span>
            <span className="text-xs font-heading font-bold text-amber-300 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              <span>Live This Weekend</span>
            </span>
          </div>

          <div className="sv-card p-0 overflow-hidden relative group">
            <div className="relative aspect-[16/9] w-full overflow-hidden bg-black/60">
              <img
                src="https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80"
                alt="Cinema Watch Party"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#090A0E] via-black/40 to-black/20 pointer-events-none" />

              <div className="absolute top-4 left-4 flex items-center gap-2">
                <span className="h-8 px-3 rounded-full text-xs font-heading font-bold bg-rose-500/80 backdrop-blur-md text-white border border-rose-400/30 flex items-center gap-1.5">
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Synchronized Video Room</span>
                </span>
                <span className="h-8 px-3 rounded-full text-xs font-heading font-semibold bg-black/70 text-zinc-200 border border-white/10 flex items-center">
                  29 Attending
                </span>
              </div>

              <div className="absolute bottom-4 left-5 right-5">
                <h3 className="text-xl sm:text-2xl font-bold text-white font-heading tracking-tight">
                  Synchronized Movie Night: Studio Ghibli &amp; Lo-Fi Lounge
                </h3>
                <p className="type-supporting text-zinc-300 mt-1 flex items-center gap-2">
                  <span>Saturday, Nov 15 · 8:30 PM sharp</span>
                  <span>·</span>
                  <span className="text-white font-semibold">Virtual Cinema Sanctuary</span>
                </p>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <p className="type-body text-zinc-300 leading-relaxed">
                Watch together with synchronized playback and cozy live chat. Bring your tea and popcorn while we break down frame composition and nostalgia.
              </p>

              <div className="flex items-center justify-between pt-3 border-t border-white/[0.08] flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  <img
                    src="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80"
                    alt="Host"
                    className="w-8 h-8 rounded-full object-cover border border-white/20"
                  />
                  <span className="type-supporting text-zinc-400">Hosted by <strong className="text-white">Tara Perera</strong></span>
                </div>

                <button
                  onClick={() => toggleRsvp('evt_2')}
                  className={rsvpStates['evt_2'] ? 'sv-btn-secondary border-emerald-500/40 text-emerald-300' : 'sv-btn-primary'}
                >
                  {rsvpStates['evt_2'] ? 'RSVP Confirmed ✓' : 'Join Watch Room'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* SECTION 2: PHYSICAL & LOCAL SOCIAL MEETUPS                             */}
      {/* ===================================================================== */}
      {(activeTab === 'all' || activeTab === 'events') && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <span className="type-card-heading font-bold text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-amber-300" />
              <span>Curated Gatherings &amp; Meetups</span>
            </span>
            <span className="type-supporting text-zinc-400">Strictly No-Harassment Guarantee</span>
          </div>

          <div className="space-y-4">
            {MOCK_EVENTS.filter(e => e.id !== 'evt_2').map(event => (
              <div
                key={event.id}
                className="sv-card hover:border-white/20 transition-all space-y-4"
              >
                <div className="flex gap-4">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden shrink-0 border border-white/10 relative">
                    <img src={event.coverImage} alt={event.title} className="w-full h-full object-cover" />
                    <span className="absolute bottom-1.5 right-1.5 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-[10px] font-bold text-white border border-white/10">
                      {event.format === 'physical' ? 'Offline' : 'Online'}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-heading font-bold text-amber-300 uppercase tracking-wider">
                        {event.category}
                      </span>
                      <span>·</span>
                      <span className="font-medium text-zinc-300">{event.date}</span>
                    </div>

                    <h4 className="type-card-heading font-bold text-white tracking-tight line-clamp-2">
                      {event.title}
                    </h4>

                    <p className="type-supporting text-zinc-400 flex items-center gap-1.5 pt-0.5">
                      <MapPin className="w-4 h-4 text-zinc-500 shrink-0" />
                      <span className="truncate">{event.locationName}</span>
                    </p>
                  </div>
                </div>

                <p className="type-body text-zinc-300 leading-relaxed line-clamp-2">
                  {event.description}
                </p>

                {/* Safety & Introvert friendly tag */}
                <div className="flex items-center justify-between pt-3 border-t border-white/[0.08] flex-wrap gap-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-xs font-semibold flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Introvert Friendly</span>
                    </span>
                    <span className="type-supporting text-zinc-400">
                      {event.attendeesCount} / {event.capacity} spots filled
                    </span>
                  </div>

                  <button
                    onClick={() => toggleRsvp(event.id)}
                    className={rsvpStates[event.id] ? 'sv-btn-secondary border-emerald-500/40 text-emerald-300' : 'sv-btn-secondary'}
                  >
                    {rsvpStates[event.id] ? 'Attending ✓' : 'RSVP Free'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* SECTION 3: COMMUNITIES & DISCUSSION CIRCLES                            */}
      {/* ===================================================================== */}
      {(activeTab === 'all' || activeTab === 'communities') && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <span className="type-card-heading font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-amber-300" />
              <span>Dating &amp; Friendship Communities</span>
            </span>
            <span className="type-supporting text-zinc-400">Find your tribe</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {[
              {
                id: 'c_1',
                name: 'Philosophy & 1 AM Debates',
                description: 'For night owls exploring paradoxes, ethics, and consciousness without superficial noise.',
                members: '412 members',
                icon: '🌌',
                badge: 'Active'
              },
              {
                id: 'c_2',
                name: 'Analog Photography & Film Grain',
                description: 'Documentary frames, vintage 35mm cameras, and slow-paced street walks.',
                members: '284 members',
                icon: '📷',
                badge: 'Creative'
              },
              {
                id: 'c_3',
                name: 'Architecture & Silent Design',
                description: 'Minimalist spaces, brutalist concrete, and spaces that heal the nervous system.',
                members: '198 members',
                icon: '🏛️',
                badge: 'Design'
              },
              {
                id: 'c_4',
                name: 'Introverted Romantics',
                description: 'Meaningful dating for humans who cherish quiet evenings and emotional depth.',
                members: '640 members',
                icon: '💌',
                badge: 'Dating'
              }
            ].map(comm => (
              <div
                key={comm.id}
                className="sv-card p-5 space-y-3.5 flex flex-col justify-between hover:border-white/20 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl">{comm.icon}</span>
                    <span className="text-[11px] font-heading font-bold px-2.5 py-0.5 rounded-full bg-white/10 text-zinc-300 border border-white/15">
                      {comm.badge}
                    </span>
                  </div>
                  <h4 className="type-card-heading font-bold text-white tracking-tight mt-2.5">{comm.name}</h4>
                  <p className="type-body text-zinc-300 text-xs sm:text-sm mt-1 line-clamp-2 leading-relaxed">
                    {comm.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-white/[0.08]">
                  <span className="type-supporting text-zinc-400 font-medium">{comm.members}</span>
                  <button
                    onClick={() => toggleJoinCommunity(comm.id)}
                    className={`min-h-[40px] px-3.5 rounded-xl text-xs font-heading font-bold transition-all cursor-pointer ${
                      joinedCommunities[comm.id]
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-white/10 hover:bg-white/20 text-white border border-white/10'
                    }`}
                  >
                    {joinedCommunities[comm.id] ? 'Joined ✓' : 'Join Community'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* SECTION 4: SOLO CONNECTION & PERSONAL REFLECTION PROMPTS               */}
      {/* ===================================================================== */}
      {(activeTab === 'all' || activeTab === 'solo') && (
        <div className="rounded-3xl dark-glass border border-white/15 p-5 space-y-3.5 shadow-xl bg-gradient-to-b from-white/[0.03] to-transparent">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-zinc-300" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Solo Activities & Self-Discovery
              </h3>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/10 text-zinc-300">
              Zero Pressure
            </span>
          </div>

          <p className="text-xs text-zinc-300 leading-relaxed">
            Soulverse remains a calming sanctuary even when you aren't currently talking to anyone. Explore your inner world, write private notes, or answer curated prompts.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            <div 
              onClick={() => onOpenJournal?.()}
              className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 hover:bg-white/[0.08] transition-all cursor-pointer space-y-1"
            >
              <span className="text-xs font-bold text-white flex items-center justify-between">
                <span>📝 Private 5,000-Char Journal</span>
                <ChevronRight className="w-3.5 h-3.5 text-zinc-500" />
              </span>
              <p className="text-[11px] text-zinc-400">
                Write long-form GitHub Markdown entries or reflect on today's emotions.
              </p>
            </div>

            <div 
              onClick={() => onOpenSoloPrompt?.('energy')}
              className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 hover:bg-white/[0.08] transition-all cursor-pointer space-y-1"
            >
              <span className="text-xs font-bold text-white flex items-center justify-between">
                <span>⚡ Social Energy Blueprint</span>
                <ChevronRight className="w-3.5 h-3.5 text-zinc-500" />
              </span>
              <p className="text-[11px] text-zinc-400">
                Learn what recharges you before pushing yourself into loud environments.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* SECTION 5: STORY REALMS & PROFILE WORLDS                              */}
      {/* ===================================================================== */}
      {(activeTab === 'all' || activeTab === 'worlds') && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1 text-xs">
            <span className="font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Globe2 className="w-4 h-4 text-zinc-300" />
              <span>Explore Story Realms & Worlds</span>
            </span>
            <span className="text-[11px] text-zinc-400">Fictional & Real Dimensions</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              {
                id: 'pw_1',
                title: "The Architect's Journal",
                genre: 'Architectural Philosophy',
                cover: 'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?auto=format&fit=crop&w=600&q=80'
              },
              {
                id: 'pw_2',
                title: 'Neon Monolith: Act I',
                genre: 'Cyberpunk Narrative',
                cover: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80'
              }
            ].map(w => (
              <div
                key={w.id}
                onClick={() => onOpenWorld?.(w.id)}
                className="aspect-[4/3] rounded-3xl overflow-hidden relative border border-white/10 cursor-pointer group shadow-lg"
              >
                <img src={w.cover} alt={w.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent pointer-events-none" />
                <div className="absolute bottom-3 left-3 right-3">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-400 block">{w.genre}</span>
                  <h4 className="text-xs font-bold text-white tracking-tight truncate mt-0.5">{w.title}</h4>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* SECTION 6: SECRET CONFESSIONS STREAM                                  */}
      {/* ===================================================================== */}
      {(activeTab === 'all' || activeTab === 'confessions') && (
        <div className="space-y-4 pt-4 border-t border-white/[0.08]">
          <ConfessionsStreamView />
        </div>
      )}

    </div>
  );
};
