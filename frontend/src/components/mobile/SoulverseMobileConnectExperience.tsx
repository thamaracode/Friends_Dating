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
  const [activeTab, setActiveTab] = useState<'all' | 'vault' | 'events' | 'communities' | 'watch_parties' | 'solo' | 'worlds'>('all');
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
    { id: 'vault' as const, label: '🔐 Relationship Vault' },
    { id: 'events' as const, label: '🎪 Events & Meetups' },
    { id: 'communities' as const, label: '👥 Communities' },
    { id: 'watch_parties' as const, label: '🍿 Watch Parties' },
    { id: 'solo' as const, label: '🧘 Solo & Journals' },
    { id: 'worlds' as const, label: '🌌 Story Worlds' }
  ];

  return (
    <div className="w-full space-y-5 pb-28 max-w-xl mx-auto animate-fadeIn">
      
      {/* 1. TOP HEADER BANNER */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h1 className="text-lg font-black text-white font-serif tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-zinc-300" />
            <span>Connect & Socialize</span>
          </h1>
          <p className="text-[11px] text-zinc-400">Events, communities, watch-parties and introspective spaces</p>
        </div>
      </div>

      {/* 2. FILTER PILLS */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 px-1">
        {filterTabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === tab.id
                ? 'bg-white text-[#090A0E] shadow-md'
                : 'bg-white/[0.04] text-zinc-400 hover:text-white border border-white/10'
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
        <div className="p-4 sm:p-5 rounded-3xl dark-glass border border-white/15 shadow-xl relative overflow-hidden bg-gradient-to-r from-rose-950/20 via-white/[0.02] to-transparent space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-400 shadow-[0_0_8px_#F43F5E]" />
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-rose-300">
                Core Pillar · Private Memory
              </span>
            </div>
            <button
              onClick={onOpenVault}
              className="text-[11px] font-bold text-white hover:text-rose-300 flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span>Open Vault</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">
              Relationship Vault & Connection Memory
            </h3>
            <p className="text-xs text-zinc-300 mt-1 leading-relaxed">
              Never lose touch with what matters. Access "Before You Talk" instant briefings, promise tracking, and personal memories for your partners and friends.
            </p>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-white/[0.08] text-xs">
            <div className="flex items-center gap-2 text-zinc-400 text-[11px]">
              <span>🔒 100% Private</span>
              <span>·</span>
              <span>⚡ Prospective Memory</span>
              <span>·</span>
              <span>🤝 Promise Tracker</span>
            </div>

            <button
              onClick={onOpenVault}
              className="px-3 py-1.5 rounded-xl bg-white text-[#090A0E] text-xs font-bold hover:brightness-110 shadow-md cursor-pointer transition-all"
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
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1 text-xs">
            <span className="font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Tv className="w-4 h-4 text-rose-400" />
              <span>Synchronized Watch Parties</span>
            </span>
            <span className="text-[11px] font-bold text-rose-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping" />
              <span>Live This Weekend</span>
            </span>
          </div>

          <div className="rounded-3xl dark-glass border border-white/15 overflow-hidden shadow-2xl relative group">
            <div className="relative aspect-[16/9] w-full overflow-hidden bg-black/60">
              <img
                src="https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80"
                alt="Cinema Watch Party"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#090A0E] via-black/40 to-black/20 pointer-events-none" />

              <div className="absolute top-3 left-3 flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-500/80 backdrop-blur-md text-white border border-rose-400/30 flex items-center gap-1.5">
                  <Play className="w-3 h-3 fill-white" />
                  <span>Synchronized Video Room</span>
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-black/60 text-zinc-300 border border-white/10">
                  29 Attending
                </span>
              </div>

              <div className="absolute bottom-3 left-4 right-4">
                <h3 className="text-base sm:text-lg font-black text-white font-serif tracking-tight">
                  Synchronized Movie Night: Studio Ghibli & Lo-Fi Lounge
                </h3>
                <p className="text-xs text-zinc-300 mt-0.5 flex items-center gap-2">
                  <span>Saturday, Nov 15 · 8:30 PM sharp</span>
                  <span>·</span>
                  <span className="text-white font-semibold">Virtual Cinema Sanctuary</span>
                </p>
              </div>
            </div>

            <div className="p-4 space-y-3">
              <p className="text-xs text-zinc-300 leading-relaxed">
                Watch together with synchronized playback and cozy live chat. Bring your tea and popcorn while we break down frame composition and nostalgia.
              </p>

              <div className="flex items-center justify-between pt-1 border-t border-white/[0.08] text-xs">
                <div className="flex items-center gap-2">
                  <img
                    src="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80"
                    alt="Host"
                    className="w-6 h-6 rounded-full object-cover border border-white/20"
                  />
                  <span className="text-zinc-400 text-[11px]">Hosted by <strong className="text-white">Tara Perera</strong></span>
                </div>

                <button
                  onClick={() => toggleRsvp('evt_2')}
                  className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    rsvpStates['evt_2']
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-white text-[#090A0E] hover:brightness-110 shadow-md'
                  }`}
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
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1 text-xs">
            <span className="font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-zinc-300" />
              <span>Curated Gatherings & Meetups</span>
            </span>
            <span className="text-[11px] text-zinc-400">Strictly No-Harassment Guarantee</span>
          </div>

          <div className="space-y-3">
            {MOCK_EVENTS.filter(e => e.id !== 'evt_2').map(event => (
              <div
                key={event.id}
                className="p-4 rounded-3xl dark-glass border border-white/[0.08] shadow-lg hover:border-white/20 transition-all space-y-3"
              >
                <div className="flex gap-3.5">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden shrink-0 border border-white/10 relative">
                    <img src={event.coverImage} alt={event.title} className="w-full h-full object-cover" />
                    <span className="absolute bottom-1 right-1 px-1.5 py-0.2 rounded-md bg-black/70 backdrop-blur-md text-[9px] font-bold text-white border border-white/10">
                      {event.format === 'physical' ? 'Offline' : 'Online'}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                        {event.category}
                      </span>
                      <span>·</span>
                      <span className="text-[10px] font-semibold text-zinc-300">{event.date}</span>
                    </div>

                    <h4 className="text-sm font-bold text-white tracking-tight mt-0.5 line-clamp-2">
                      {event.title}
                    </h4>

                    <p className="text-[11px] text-zinc-400 mt-1 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                      <span className="truncate">{event.locationName}</span>
                    </p>
                  </div>
                </div>

                <p className="text-xs text-zinc-300 leading-relaxed line-clamp-2">
                  {event.description}
                </p>

                {/* Safety & Introvert friendly tag */}
                <div className="flex items-center justify-between pt-2 border-t border-white/[0.08] text-xs">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-[10px] font-bold flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      <span>Introvert Friendly</span>
                    </span>
                    <span className="text-[10px] text-zinc-400">
                      {event.attendeesCount} / {event.capacity} spots filled
                    </span>
                  </div>

                  <button
                    onClick={() => toggleRsvp(event.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      rsvpStates[event.id]
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-white/[0.08] hover:bg-white/15 text-white border border-white/15'
                    }`}
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
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1 text-xs">
            <span className="font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-4 h-4 text-zinc-300" />
              <span>Dating & Friendship Communities</span>
            </span>
            <span className="text-[11px] text-zinc-400">Find your tribe</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                className="p-4 rounded-3xl dark-glass border border-white/[0.08] space-y-3 shadow-md flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl">{comm.icon}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/10 text-zinc-300 border border-white/15">
                      {comm.badge}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white tracking-tight mt-2">{comm.name}</h4>
                  <p className="text-xs text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                    {comm.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/[0.06] text-xs">
                  <span className="text-[11px] text-zinc-500 font-medium">{comm.members}</span>
                  <button
                    onClick={() => toggleJoinCommunity(comm.id)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      joinedCommunities[comm.id]
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-white/10 hover:bg-white/20 text-white'
                    }`}
                  >
                    {joinedCommunities[comm.id] ? 'Joined ✓' : 'Join'}
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

    </div>
  );
};
