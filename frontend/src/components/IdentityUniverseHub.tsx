import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  User, 
  Shield, 
  Globe2, 
  Clock, 
  Plus, 
  Edit3, 
  Copy, 
  Trash2, 
  Eye, 
  Lock, 
  ChevronRight, 
  Calendar, 
  Gamepad2, 
  ExternalLink, 
  Heart, 
  ThumbsUp, 
  ThumbsDown, 
  Flag, 
  MessageSquare, 
  Check, 
  X, 
  Compass,
  FileText
} from 'lucide-react';
import { identityUniverseClient } from '../services/identityUniverseApiClient';
import type { 
  UserIdentity, 
  IdentityClassification, 
  FictionalUniverse, 
  UniversalTimelineEvent, 
  RegisteredExternalGame,
  ProfileSocialFeedback,
  PrivateViewerNote 
} from '../types/identityUniverse';

interface IdentityUniverseHubProps {
  userId?: string;
  isOwner?: boolean;
  viewerId?: string;
  onClose?: () => void;
  onSelectIdentity?: (identity: UserIdentity) => void;
}

export const IdentityUniverseHub: React.FC<IdentityUniverseHubProps> = ({
  userId = 'usr_me',
  isOwner = true,
  viewerId = 'usr_me',
  onClose,
  onSelectIdentity
}) => {
  const [activeTab, setActiveTab] = useState<'identities' | 'timeline' | 'universes' | 'games'>('identities');
  
  // Data State
  const [identities, setIdentities] = useState<UserIdentity[]>([]);
  const [selectedIdentity, setSelectedIdentity] = useState<UserIdentity | null>(null);
  const [timelineEvents, setTimelineEvents] = useState<UniversalTimelineEvent[]>([]);
  const [universes, setUniverses] = useState<FictionalUniverse[]>([]);
  const [externalGames, setExternalGames] = useState<RegisteredExternalGame[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [isCreateIdentityOpen, setIsCreateIdentityOpen] = useState(false);
  const [isAddTimelineOpen, setIsAddTimelineOpen] = useState(false);
  const [isGameLauncherOpen, setIsGameLauncherOpen] = useState(false);
  const [activeGameToPlay, setActiveGameToPlay] = useState<RegisteredExternalGame | null>(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [hubToast, setHubToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setHubToast(msg);
    setTimeout(() => setHubToast(null), 3500);
  };

  // Form State: Create Identity
  const [newIdentityName, setNewIdentityName] = useState('');
  const [newIdentityTitle, setNewIdentityTitle] = useState('');
  const [newIdentityClass, setNewIdentityClass] = useState<IdentityClassification>('fictional_character');
  const [newIdentityDesc, setNewIdentityDesc] = useState('');
  const [newIdentityBio, setNewIdentityBio] = useState('');
  const [newIdentityVisibility, setNewIdentityVisibility] = useState<'public' | 'matches' | 'friends' | 'private'>('public');

  // Form State: Add Universal Timeline Event
  const [newTimeExpr, setNewTimeExpr] = useState('');
  const [newTimeType, setNewTimeType] = useState<'standard_ce' | 'bce' | 'years_ago' | 'astronomical' | 'fictional_era'>('standard_ce');
  const [newTimeTitle, setNewTimeTitle] = useState('');
  const [newTimeDesc, setNewTimeDesc] = useState('');
  const [newTimeIsFictional, setNewTimeIsFictional] = useState(false);

  useEffect(() => {
    loadData();
  }, [userId, viewerId]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [idsRes, timelineRes, uniRes, gamesRes] = await Promise.all([
        identityUniverseClient.getUserIdentities(userId, viewerId),
        identityUniverseClient.getUniversalTimeline(userId, viewerId, 'asc'),
        identityUniverseClient.getUniverses(viewerId),
        identityUniverseClient.getExternalGames()
      ]);

      setIdentities(idsRes.identities || []);
      if (idsRes.identities && idsRes.identities.length > 0) {
        setSelectedIdentity(idsRes.identities[0]);
      }
      setTimelineEvents(timelineRes || []);
      setUniverses(uniRes || []);
      setExternalGames(gamesRes || []);
    } catch (err) {
      console.error('Failed to load Identity Universe data', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateIdentity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIdentityName.trim()) return;

    try {
      const res = await identityUniverseClient.createIdentity({
        user_id: userId,
        name: newIdentityName.trim(),
        display_title: newIdentityTitle.trim(),
        classification: newIdentityClass,
        description: newIdentityDesc.trim(),
        biography: newIdentityBio.trim(),
        visibility: newIdentityVisibility,
        status: 'published'
      });

      if (res.identity) {
        setIdentities(prev => [res.identity, ...prev]);
        setSelectedIdentity(res.identity);
        setIsCreateIdentityOpen(false);
        // Reset
        setNewIdentityName('');
        setNewIdentityTitle('');
        setNewIdentityDesc('');
        setNewIdentityBio('');
        showToast('✨ Identity persona created successfully');
      }
    } catch (err) {
      console.error(err);
      showToast('❌ Failed to create identity');
    }
  };

  const handleCreateTimelineEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTimeExpr.trim() || !newTimeTitle.trim() || !newTimeDesc.trim()) return;

    try {
      const event = await identityUniverseClient.createUniversalEvent({
        user_id: userId,
        identity_id: selectedIdentity ? selectedIdentity.id : null,
        time_type: newTimeType,
        year_value: newTimeExpr.trim(),
        display_label: newTimeExpr.trim(),
        title: newTimeTitle.trim(),
        short_description: newTimeDesc.trim(),
        is_fictional: newTimeIsFictional ? 1 : 0,
        visibility: 'public'
      });

      if (event) {
        setTimelineEvents(prev => [...prev, event]);
        setIsAddTimelineOpen(false);
        setNewTimeExpr('');
        setNewTimeTitle('');
        setNewTimeDesc('');
        setNewTimeIsFictional(false);
        showToast('⏳ Universal timeline event pinned successfully');
      }
    } catch (err) {
      console.error(err);
      showToast('❌ Failed to add timeline event');
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      const dup = await identityUniverseClient.duplicateIdentity(id, userId);
      if (dup) {
        setIdentities(prev => [...prev, dup]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this identity?')) return;
    try {
      await identityUniverseClient.deleteIdentity(id, userId);
      setIdentities(prev => prev.filter(i => i.id !== id));
      if (selectedIdentity?.id === id) {
        setSelectedIdentity(identities.find(i => i.id !== id) || null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getClassificationBadge = (cls: IdentityClassification) => {
    switch (cls) {
      case 'real_identity':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">🟢 Real Identity</span>;
      case 'fictional_character':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-zinc-200 border border-white/20">🎭 Fictional / Roleplay</span>;
      case 'inspired_character':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">✨ Inspired Persona</span>;
      case 'alternate_self':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">🌌 Alternate Self</span>;
      case 'fantasy_identity':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">🔮 Fantasy Universe</span>;
      case 'historical_persona':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-500/20 text-orange-300 border border-orange-500/30">📜 Historical</span>;
      case 'anonymous_identity':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-zinc-500/20 text-zinc-300 border border-zinc-500/30">🎭 Anonymous</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-white border border-white/20">Custom Persona</span>;
    }
  };

  return (
    <div className="w-full flex flex-col space-y-6">
      
      {/* 1. TOP HEADER & NAVIGATION TABS */}
      <div className="p-5 rounded-3xl dark-glass border border-white/[0.08] shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-white/15 border border-white/25 flex items-center justify-center text-white shadow-[0_0_14px_rgba(255,255,255,0.1)]">
              <Sparkles className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-black text-white font-serif tracking-tight">
              Soulverse Identity Universe
            </h2>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Express real lives, fictional characters, universal timelines, and imaginative worlds.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl dark-glass border border-white/10 text-xs">
          {[
            { id: 'identities', label: 'Personas', icon: User },
            { id: 'timeline', label: 'Universal Timeline', icon: Clock },
            { id: 'universes', label: 'Fictional Universes', icon: Globe2 },
            { id: 'games', label: 'Mini-Games', icon: Gamepad2 }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  isActive
                    ? 'bg-white/15 text-white border border-white/25 shadow-sm'
                    : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. TAB CONTENT */}

      {/* =================================================================== */}
      {/* TAB A: MULTIPLE IDENTITIES & PERSONAS                                */}
      {/* =================================================================== */}
      {activeTab === 'identities' && (
        <div className="space-y-6">
          {/* Identity Carousel Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {identities.map(id => {
              const isSelected = selectedIdentity?.id === id.id;
              return (
                <div
                  key={id.id}
                  onClick={() => {
                    setSelectedIdentity(id);
                    if (onSelectIdentity) onSelectIdentity(id);
                  }}
                  className={`p-4 rounded-3xl dark-glass border transition-all cursor-pointer flex flex-col justify-between group ${
                    isSelected
                      ? 'border-white/40 shadow-[0_8px_30px_rgba(255,255,255,0.06)]'
                      : 'border-white/[0.08] hover:border-white/20'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      {getClassificationBadge(id.classification)}
                      <div className="flex items-center gap-1 text-[10px] text-zinc-400">
                        {id.visibility === 'public' ? '🌐 Public' : '🔒 Private'}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl overflow-hidden dark-glass border border-white/10 shrink-0">
                        <img 
                          src={id.avatar_url || 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=200&q=80'} 
                          alt={id.name} 
                          className="w-full h-full object-cover" 
                        />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-white truncate group-hover:text-zinc-200 transition-colors">
                          {id.name}
                        </h4>
                        <p className="text-[10px] text-zinc-400 truncate">{id.display_title || 'Identity'}</p>
                      </div>
                    </div>

                    <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">
                      {id.description || 'No description provided.'}
                    </p>

                    {/* Personality Traits */}
                    {id.personality_traits && id.personality_traits.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {id.personality_traits.slice(0, 3).map((t, idx) => (
                          <span key={idx} className="px-2 py-0.5 rounded-full text-[9px] bg-white/[0.04] text-zinc-300 border border-white/10">
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions footer */}
                  <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between mt-3 text-xs text-zinc-400">
                    <span className="text-[10px]">{id.is_primary ? '★ Primary' : 'Persona'}</span>
                    {isOwner && (
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleDuplicate(id.id); }} 
                          title="Duplicate"
                          className="hover:text-white p-1"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                        {!id.is_primary && (
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleDelete(id.id); }} 
                            title="Delete"
                            className="hover:text-white p-1"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* "+ Create New Persona" Action Card */}
            {isOwner && (
              <div
                onClick={() => setIsCreateIdentityOpen(true)}
                className="p-6 rounded-3xl border border-dashed border-white/15 hover:border-white/30 bg-white/[0.02] hover:bg-white/[0.05] flex flex-col items-center justify-center text-center cursor-pointer transition-all group min-h-[190px]"
              >
                <div className="w-10 h-10 rounded-2xl dark-glass border border-white/10 flex items-center justify-center text-zinc-300 group-hover:text-white group-hover:scale-110 transition-all mb-2">
                  <Plus className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-white group-hover:text-zinc-200 transition-colors">
                  Create Persona / Identity
                </span>
                <span className="text-[10px] text-zinc-400 mt-1">
                  Add real, fictional, Batman-inspired, or custom persona
                </span>
              </div>
            )}
          </div>

          {/* Selected Identity Inspection Panel */}
          {selectedIdentity && (
            <div className="p-6 rounded-3xl dark-glass border border-white/[0.08] shadow-2xl space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/[0.06]">
                <div className="flex items-center gap-3">
                  <h3 className="text-sm font-bold text-white font-serif">
                    {selectedIdentity.name}
                  </h3>
                  {getClassificationBadge(selectedIdentity.classification)}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsPreviewModalOpen(true)}
                    className="px-3 py-1.5 rounded-xl dark-glass text-xs text-zinc-200 border border-white/10 hover:border-white/30 flex items-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5 text-zinc-300" />
                    <span>Preview As Others See</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Biography & Dossier</span>
                  <p className="text-zinc-300 leading-relaxed dark-glass p-3 rounded-2xl border border-white/5">
                    {selectedIdentity.biography || selectedIdentity.description || 'No biography written.'}
                  </p>
                </div>
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Skills & Capabilities</span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedIdentity.skills && selectedIdentity.skills.length > 0 ? (
                      selectedIdentity.skills.map((s, idx) => (
                        <span key={idx} className="px-2.5 py-1 rounded-full bg-white/10 text-zinc-200 border border-white/15 font-medium text-[11px]">
                          ⚡ {s}
                        </span>
                      ))
                    ) : (
                      <span className="text-zinc-400 text-[11px]">No specific skills declared.</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB B: UNIVERSAL LIFE TIMELINE (BCE, Prehistoric, Astronomical)     */}
      {/* =================================================================== */}
      {activeTab === 'timeline' && (
        <div className="p-6 rounded-3xl dark-glass border border-white/[0.08] shadow-2xl space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
            <div>
              <h3 className="text-sm font-bold text-white font-serif">Universal Life Timeline</h3>
              <p className="text-xs text-zinc-400">
                Record real life, 1500 BCE, 65 million years ago, or 10,000,000,000,000 years ago without calendar bounds.
              </p>
            </div>
            {isOwner && (
              <button
                onClick={() => setIsAddTimelineOpen(true)}
                className="px-3.5 py-2 rounded-2xl gray-glass-btn text-xs font-bold flex items-center gap-1.5 shadow-md hover:brightness-110 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Time Entry</span>
              </button>
            )}
          </div>

          {/* Timeline Axis */}
          <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-px before:bg-white/10">
            {timelineEvents.map((evt, idx) => (
              <div key={evt.id || idx} className="relative group">
                {/* Dot */}
                <span className="absolute -left-6 top-1.5 w-3 h-3 rounded-full bg-white ring-4 ring-[#090A0E] shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
                
                <div className="p-4 rounded-2xl dark-glass border border-white/[0.08] group-hover:border-white/20 transition-colors space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-zinc-300">
                      {evt.display_label}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {evt.is_fictional ? (
                        <span className="px-2 py-0.5 rounded-full text-[9px] bg-purple-500/20 text-purple-300 border border-purple-500/30">
                          Imagined / Fictional
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[9px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          Historical / Ground Truth
                        </span>
                      )}
                    </div>
                  </div>

                  <h4 className="text-xs sm:text-sm font-bold text-white">
                    {evt.title}
                  </h4>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    {evt.short_description}
                  </p>
                  {evt.detailed_description && (
                    <p className="text-[11px] text-zinc-400/80 italic pt-1 border-t border-white/5">
                      "{evt.detailed_description}"
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB C: FICTIONAL UNIVERSES & WORLD CREATION                         */}
      {/* =================================================================== */}
      {activeTab === 'universes' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {universes.map(u => (
              <div key={u.id} className="p-5 rounded-3xl dark-glass border border-white/[0.08] hover:border-white/20 transition-all space-y-3 shadow-lg">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase text-zinc-400 tracking-wider">{u.genre}</span>
                  <span className="text-[10px] text-zinc-400">{u.is_collaborative ? '👥 Collaborative' : 'Solo'}</span>
                </div>

                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-white font-serif">{u.name}</h4>
                  <p className="text-xs text-zinc-400 line-clamp-2">{u.description || 'An imagined world.'}</p>
                </div>

                {u.rules_of_universe && (
                  <div className="p-2.5 rounded-xl dark-glass border border-white/5 text-[11px] text-zinc-400">
                    <span className="font-bold text-white block text-[10px] uppercase mb-1">Rules of Universe:</span>
                    <pre className="font-sans whitespace-pre-wrap line-clamp-3">{u.rules_of_universe}</pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB D: MINI-GAMES & SECURE EMBEDDING PLATFORM                       */}
      {/* =================================================================== */}
      {activeTab === 'games' && (
        <div className="p-6 rounded-3xl dark-glass border border-white/[0.08] shadow-2xl space-y-6">
          <div>
            <h3 className="text-sm font-bold text-white font-serif">Interactive Games Platform</h3>
            <p className="text-xs text-zinc-400">
              Play native connection games or launch verified sandboxed external experiences.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {externalGames.map(game => (
              <div key={game.id} className="p-5 rounded-3xl dark-glass border border-white/[0.08] hover:border-white/20 transition-all space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-blue-500/20 text-blue-300 border border-blue-500/30">
                      {game.category}
                    </span>
                    <span className="text-[10px] text-zinc-400">{game.provider_name}</span>
                  </div>

                  <h4 className="text-xs sm:text-sm font-bold text-white">{game.game_title}</h4>
                  <p className="text-xs text-zinc-400 line-clamp-2">{game.description}</p>
                </div>

                <button
                  onClick={() => {
                    setActiveGameToPlay(game);
                    setIsGameLauncherOpen(true);
                  }}
                  className="w-full py-2 rounded-xl gray-glass-btn text-xs font-bold flex items-center justify-center gap-1.5 shadow-md hover:brightness-110 cursor-pointer"
                >
                  <Gamepad2 className="w-3.5 h-3.5" />
                  <span>Launch Game (Sandboxed)</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL 1: CREATE NEW IDENTITY                                        */}
      {/* =================================================================== */}
      {isCreateIdentityOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg dark-glass border border-white/10 rounded-3xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-sm font-bold text-white font-serif">Create Persona / Identity</h3>
              <button onClick={() => setIsCreateIdentityOpen(false)} className="text-zinc-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateIdentity} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-zinc-400 mb-1">Identity Name *</label>
                <input
                  type="text"
                  value={newIdentityName}
                  onChange={e => setNewIdentityName(e.target.value)}
                  placeholder="e.g. The Dark Knight, Real Life, Aethelgard Scholar"
                  required
                  className="w-full px-3 py-2 rounded-xl dark-glass border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-white/30"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-400 mb-1">Display Title</label>
                <input
                  type="text"
                  value={newIdentityTitle}
                  onChange={e => setNewIdentityTitle(e.target.value)}
                  placeholder="e.g. Masked Protector of Gotham"
                  className="w-full px-3 py-2 rounded-xl dark-glass border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-white/30"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-400 mb-1">Classification *</label>
                <select
                  value={newIdentityClass}
                  onChange={e => setNewIdentityClass(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-[#181B24] border border-white/10 text-white focus:outline-none focus:border-white/30"
                >
                  <option value="real_identity">Real Identity (Represents actual life)</option>
                  <option value="fictional_character">Fictional Character / Roleplay</option>
                  <option value="inspired_character">Inspired Character (e.g. Batman)</option>
                  <option value="alternate_self">Alternate Self (Imagined version)</option>
                  <option value="aspirational_self">Aspirational Self</option>
                  <option value="historical_persona">Historical Persona</option>
                  <option value="fantasy_identity">Fantasy Identity</option>
                  <option value="anonymous_identity">Anonymous Identity</option>
                  <option value="custom">Custom Identity</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-400 mb-1">Short Description</label>
                <textarea
                  value={newIdentityDesc}
                  onChange={e => setNewIdentityDesc(e.target.value)}
                  placeholder="Brief summary of this dimension of yourself"
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl dark-glass border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-white/30"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-400 mb-1">Visibility</label>
                <div className="flex gap-2">
                  {(['public', 'matches', 'friends', 'private'] as const).map(vis => (
                    <button
                      type="button"
                      key={vis}
                      onClick={() => setNewIdentityVisibility(vis)}
                      className={`px-3 py-1.5 rounded-xl border text-[11px] font-medium capitalize cursor-pointer ${
                        newIdentityVisibility === vis
                          ? 'bg-white/20 text-white border-white/40'
                          : 'border-white/10 text-zinc-400 hover:text-white'
                      }`}
                    >
                      {vis}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateIdentityOpen(false)}
                  className="px-4 py-2 rounded-xl dark-glass text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl gray-glass-btn font-bold text-white shadow-md cursor-pointer"
                >
                  Create Identity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL 2: ADD UNIVERSAL TIMELINE EVENT                               */}
      {/* =================================================================== */}
      {isAddTimelineOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg dark-glass border border-white/10 rounded-3xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-sm font-bold text-white font-serif">Add Universal Timeline Entry</h3>
              <button onClick={() => setIsAddTimelineOpen(false)} className="text-zinc-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTimelineEvent} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-zinc-400 mb-1">Time Expression *</label>
                  <input
                    type="text"
                    value={newTimeExpr}
                    onChange={e => setNewTimeExpr(e.target.value)}
                    placeholder="e.g. 1500 BCE, 65 million years ago"
                    required
                    className="w-full px-3 py-2 rounded-xl dark-glass border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-white/30"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-zinc-400 mb-1">Time Category</label>
                  <select
                    value={newTimeType}
                    onChange={e => setNewTimeType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-[#181B24] border border-white/10 text-white focus:outline-none focus:border-white/30"
                  >
                    <option value="standard_ce">Standard Calendar (CE)</option>
                    <option value="bce">Ancient History (BCE)</option>
                    <option value="years_ago">Years Ago (e.g. Dinosaurs)</option>
                    <option value="astronomical">Cosmic / Astronomical</option>
                    <option value="fictional_era">Custom Fictional Era</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-400 mb-1">Title *</label>
                <input
                  type="text"
                  value={newTimeTitle}
                  onChange={e => setNewTimeTitle(e.target.value)}
                  placeholder="e.g. The Ancient Kingdom, The Great Canopy Migration"
                  required
                  className="w-full px-3 py-2 rounded-xl dark-glass border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-white/30"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-400 mb-1">Short Description *</label>
                <textarea
                  value={newTimeDesc}
                  onChange={e => setNewTimeDesc(e.target.value)}
                  placeholder="What happened during this era?"
                  required
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl dark-glass border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-white/30"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="fictionalCheck"
                  checked={newTimeIsFictional}
                  onChange={e => setNewTimeIsFictional(e.target.checked)}
                  className="rounded text-white accent-white"
                />
                <label htmlFor="fictionalCheck" className="text-xs text-zinc-200 cursor-pointer">
                  This is an imaginary / fictional event
                </label>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddTimelineOpen(false)}
                  className="px-4 py-2 rounded-xl dark-glass text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl gray-glass-btn font-bold text-white shadow-md cursor-pointer"
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL 3: SECURE SANDBOXED GAME LAUNCHER                             */}
      {/* =================================================================== */}
      {isGameLauncherOpen && activeGameToPlay && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex flex-col p-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10 max-w-5xl w-full mx-auto">
            <div>
              <h3 className="text-sm font-bold text-[#F3F4F6] font-serif flex items-center gap-2">
                <span>{activeGameToPlay.game_title}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Sandboxed & Isolated
                </span>
              </h3>
              <span className="text-[10px] text-[#9CA3AF]">Hosted by {activeGameToPlay.provider_name}</span>
            </div>
            <button
              onClick={() => {
                setIsGameLauncherOpen(false);
                setActiveGameToPlay(null);
              }}
              className="p-2 rounded-full dark-glass text-[#9CA3AF] hover:text-white border border-white/10"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 max-w-5xl w-full mx-auto mt-4 rounded-3xl overflow-hidden dark-glass border border-white/10 shadow-2xl relative bg-black">
            <iframe
              src={activeGameToPlay.game_url}
              title={activeGameToPlay.game_title}
              sandbox="allow-scripts allow-same-origin allow-popups"
              className="w-full h-full border-0"
              loading="lazy"
            />
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL 4: PUBLIC IDENTITY PREVIEW MODAL                              */}
      {/* =================================================================== */}
      {isPreviewModalOpen && selectedIdentity && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-3xl dark-glass border border-white/20 p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono uppercase tracking-widest text-emerald-400">Public Persona View</span>
              </div>
              <button
                onClick={() => setIsPreviewModalOpen(false)}
                className="p-1.5 rounded-full dark-glass text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-zinc-700 to-zinc-900 border border-white/20 flex items-center justify-center text-2xl shadow-inner font-serif text-white">
                {selectedIdentity.avatar_url ? (
                  <img src={selectedIdentity.avatar_url} alt={selectedIdentity.name} className="w-full h-full object-cover rounded-2xl" />
                ) : (
                  selectedIdentity.name.charAt(0).toUpperCase()
                )}
              </div>
              <div>
                <h4 className="text-lg font-bold text-white font-serif">{selectedIdentity.name}</h4>
                {selectedIdentity.display_title && (
                  <p className="text-xs text-zinc-300">{selectedIdentity.display_title}</p>
                )}
                <div className="mt-1.5 flex items-center gap-2">
                  {getClassificationBadge(selectedIdentity.classification)}
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-zinc-400 border border-white/10 capitalize">
                    {selectedIdentity.visibility}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Bio & Narrative</span>
              <p className="text-xs text-zinc-300 leading-relaxed dark-glass p-3 rounded-2xl border border-white/5">
                {selectedIdentity.biography || selectedIdentity.description || 'No public narrative provided.'}
              </p>
            </div>

            {selectedIdentity.skills && selectedIdentity.skills.length > 0 && (
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Signature Traits & Skills</span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedIdentity.skills.map((s, idx) => (
                    <span key={idx} className="px-2.5 py-1 rounded-full bg-white/10 text-zinc-200 border border-white/15 font-medium text-[11px]">
                      ⚡ {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setIsPreviewModalOpen(false)}
                className="px-5 py-2 rounded-xl gray-glass-btn font-semibold text-xs text-white"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating In-App Toast */}
      {hubToast && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-2xl bg-zinc-900/95 border border-white/20 text-xs text-white shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-bottom-3 flex items-center gap-2">
          <span>{hubToast}</span>
        </div>
      )}

    </div>
  );
};
