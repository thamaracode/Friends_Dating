import React, { useState, useEffect } from 'react';
import { 
  Globe2, 
  Sparkles, 
  Plus, 
  Eye, 
  Film, 
  BookOpen, 
  Compass, 
  Brain, 
  Rocket, 
  Briefcase, 
  Users2, 
  HeartHandshake, 
  Palette, 
  Boxes, 
  Wand2, 
  Copy, 
  Trash2, 
  ArrowLeft, 
  Volume2, 
  VolumeX, 
  Music, 
  Lock, 
  Globe, 
  Share2, 
  Check, 
  ChevronRight, 
  Layers, 
  HelpCircle,
  Tag,
  Clock,
  MapPin,
  ExternalLink,
  Edit3
} from 'lucide-react';
import { profileWorldsClient } from '../services/profileWorldsApiClient';
import { GitHubMarkdownRenderer } from './GitHubMarkdownRenderer';
import { GitHubMarkdownEditor } from './GitHubMarkdownEditor';
import type { 
  ProfileWorld, 
  ProfileWorldSection, 
  ProfileWorldEntry, 
  ProfileWorldRelation, 
  WorldType, 
  RealityClassification, 
  WorldLayoutType, 
  WorldVisibility 
} from '../types/profileWorlds';

interface ProfileWorldsHubProps {
  userId?: string;
  isOwner?: boolean;
  viewerId?: string;
  initialWorldId?: string;
  onClose?: () => void;
}

export const ProfileWorldsHub: React.FC<ProfileWorldsHubProps> = ({
  userId = 'usr_me',
  isOwner = true,
  viewerId = 'usr_me',
  initialWorldId,
  onClose
}) => {
  const [worlds, setWorlds] = useState<ProfileWorld[]>([]);
  const [activeWorld, setActiveWorld] = useState<ProfileWorld | null>(null);
  const [sections, setSections] = useState<ProfileWorldSection[]>([]);
  const [entries, setEntries] = useState<ProfileWorldEntry[]>([]);
  const [relations, setRelations] = useState<ProfileWorldRelation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAddEntryOpen, setIsAddEntryOpen] = useState(false);
  const [isAddSectionOpen, setIsAddSectionOpen] = useState(false);
  const [targetSectionId, setTargetSectionId] = useState<string | null>(null);

  // Create World Form State
  const [newWorldName, setNewWorldName] = useState('');
  const [newWorldType, setNewWorldType] = useState<WorldType>('real_life');
  const [newWorldDesc, setNewWorldDesc] = useState('');
  const [newWorldLayout, setNewWorldLayout] = useState<WorldLayoutType>('editorial');
  const [newWorldVis, setNewWorldVis] = useState<WorldVisibility>('public');
  const [newWorldCover, setNewWorldCover] = useState('https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80');
  const [newWorldIsDefault, setNewWorldIsDefault] = useState(false);

  // Add Entry Form State (with 5,000 char GFM)
  const [newEntryTitle, setNewEntryTitle] = useState('');
  const [newEntryContent, setNewEntryContent] = useState('');
  const [newEntryClassification, setNewEntryClassification] = useState<RealityClassification>('actual');
  const [newEntryVis, setNewEntryVis] = useState<WorldVisibility>('public');

  // Add Section Form State
  const [newSecTitle, setNewSecTitle] = useState('');
  const [newSecDesc, setNewSecDesc] = useState('');
  const [newSecIcon, setNewSecIcon] = useState('✨');

  useEffect(() => {
    loadWorlds();
  }, [userId, viewerId]);

  const loadWorlds = async () => {
    try {
      setIsLoading(true);
      const fetched = await profileWorldsClient.getWorlds(userId, viewerId);
      setWorlds(fetched);

      if (initialWorldId) {
        const target = fetched.find(w => w.id === initialWorldId);
        if (target) {
          openWorld(target.id);
          return;
        }
      }

      if (fetched.length > 0 && !activeWorld) {
        // Find default or first world
        const def = fetched.find(w => w.is_default === 1) || fetched[0];
        openWorld(def.id);
      }
    } catch (err) {
      console.error('Failed to load profile worlds:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const openWorld = async (worldId: string) => {
    try {
      const res = await profileWorldsClient.getWorldDetails(worldId, viewerId);
      setActiveWorld(res.world);
      setSections(res.sections);
      setEntries(res.entries);
      setRelations(res.relations);
      setIsPlayingAudio(false);
    } catch (err) {
      console.error('Failed to load world details:', err);
    }
  };

  const handleCreateWorld = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorldName.trim()) return;

    try {
      const created = await profileWorldsClient.createWorld({
        user_id: userId,
        name: newWorldName.trim(),
        world_type: newWorldType,
        description: newWorldDesc.trim(),
        layout_type: newWorldLayout,
        cover_image_url: newWorldCover,
        visibility: newWorldVis,
        is_default: newWorldIsDefault ? 1 : 0,
        template_id: newWorldType
      });

      setIsCreateModalOpen(false);
      setNewWorldName('');
      setNewWorldDesc('');
      await loadWorlds();
      openWorld(created.id);
    } catch (err) {
      console.error('Failed to create world:', err);
    }
  };

  const handleDuplicateWorld = async (worldId: string) => {
    try {
      const dup = await profileWorldsClient.duplicateWorld(worldId);
      await loadWorlds();
      openWorld(dup.id);
    } catch (err) {
      console.error('Failed to duplicate world:', err);
    }
  };

  const handleDeleteWorld = async (worldId: string) => {
    if (!confirm('Are you sure you want to permanently delete this Profile World?')) return;
    try {
      await profileWorldsClient.deleteWorld(worldId);
      setActiveWorld(null);
      await loadWorlds();
    } catch (err) {
      console.error('Failed to delete world:', err);
    }
  };

  const handleCreateSection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeWorld || !newSecTitle.trim()) return;

    try {
      await profileWorldsClient.createSection(activeWorld.id, {
        title: newSecTitle.trim(),
        description: newSecDesc.trim(),
        icon: newSecIcon,
        visibility: 'public'
      });

      setIsAddSectionOpen(false);
      setNewSecTitle('');
      setNewSecDesc('');
      openWorld(activeWorld.id);
    } catch (err) {
      console.error('Failed to create section:', err);
    }
  };

  const handleCreateEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeWorld || !targetSectionId || !newEntryContent.trim()) return;

    try {
      await profileWorldsClient.createEntry(activeWorld.id, {
        section_id: targetSectionId,
        user_id: userId,
        title: newEntryTitle.trim(),
        content: newEntryContent.trim(),
        reality_classification: newEntryClassification,
        visibility: newEntryVis
      });

      setIsAddEntryOpen(false);
      setNewEntryTitle('');
      setNewEntryContent('');
      openWorld(activeWorld.id);
    } catch (err) {
      console.error('Failed to create entry:', err);
    }
  };

  // Reality Classification Badge Helper
  const renderRealityBadge = (cls: RealityClassification) => {
    const config: Record<RealityClassification, { label: string; icon: string; bg: string; text: string; border: string }> = {
      actual: { label: 'Actual Fact', icon: '💎', bg: 'bg-emerald-950/40', text: 'text-emerald-300', border: 'border-emerald-500/40' },
      historical: { label: 'Historical Past', icon: '📜', bg: 'bg-slate-900/60', text: 'text-slate-300', border: 'border-slate-500/40' },
      current: { label: 'Current Reality', icon: '⚡', bg: 'bg-teal-950/40', text: 'text-teal-300', border: 'border-teal-500/40' },
      planned: { label: 'Planned Goal', icon: '🎯', bg: 'bg-sky-950/40', text: 'text-sky-300', border: 'border-sky-500/40' },
      aspirational: { label: 'Aspirational Future', icon: '✨', bg: 'bg-amber-950/40', text: 'text-amber-300', border: 'border-amber-500/40' },
      hypothetical: { label: 'Hypothetical', icon: '🔮', bg: 'bg-indigo-950/40', text: 'text-indigo-300', border: 'border-indigo-500/40' },
      imaginary: { label: 'Imaginary Concept', icon: '💭', bg: 'bg-purple-950/40', text: 'text-purple-300', border: 'border-purple-500/40' },
      fictional: { label: 'Fictional Story', icon: '📖', bg: 'bg-rose-950/40', text: 'text-rose-300', border: 'border-rose-500/40' },
      cinematic: { label: 'Cinematic Scene', icon: '🎬', bg: 'bg-pink-950/40', text: 'text-pink-300', border: 'border-pink-500/40' },
      dream: { label: 'Dream Experience', icon: '🌙', bg: 'bg-violet-950/40', text: 'text-violet-300', border: 'border-violet-500/40' },
      roleplay: { label: 'Roleplay Persona', icon: '🎭', bg: 'bg-fuchsia-950/40', text: 'text-fuchsia-300', border: 'border-fuchsia-500/40' },
      alternate_reality: { label: 'Alternate Reality', icon: '🌌', bg: 'bg-cyan-950/40', text: 'text-cyan-300', border: 'border-cyan-500/40' },
      uncertain: { label: 'Uncertain Fact', icon: '❓', bg: 'bg-neutral-900/60', text: 'text-neutral-300', border: 'border-neutral-500/40' }
    };

    const c = config[cls] || config.actual;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${c.bg} ${c.text} ${c.border} shadow-sm`}>
        <span>{c.icon}</span>
        <span>{c.label}</span>
      </span>
    );
  };

  const templates: { type: WorldType; name: string; desc: string; icon: any; layout: WorldLayoutType; cover: string }[] = [
    { type: 'real_life', name: 'Real Life', desc: 'Actual grounded biography, physical routines, daily habits, and true facts.', icon: Compass, layout: 'editorial', cover: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80' },
    { type: 'cinematic_life', name: 'Cinematic Life', desc: 'Life rendered as a film: movie poster, character archetype, soundtrack, dramatic scenes.', icon: Film, layout: 'cinematic', cover: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1200&q=80' },
    { type: 'inner_world', name: 'Inner World', desc: 'Unfiltered psychological reflections, emotional paradoxes, fears, and internal philosophies.', icon: Brain, layout: 'scrapbook', cover: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80' },
    { type: 'future_self', name: 'Future Self', desc: 'Ten-year vision, aspirational lifestyle, dream studio, and letters to your future self.', icon: Rocket, layout: 'timeline', cover: 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1200&q=80' },
    { type: 'professional_self', name: 'Professional Self', desc: 'Engineering craft, deep stacks, open-source work, and independent consulting services.', icon: Briefcase, layout: 'portfolio', cover: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80' },
    { type: 'romantic_self', name: 'Romantic Self', desc: 'Love languages, emotional boundaries, affection expectations, and relationship visions.', icon: HeartHandshake, layout: 'editorial', cover: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=1200&q=80' },
    { type: 'creative_self', name: 'Creative Self', desc: 'Visual arts, typography portfolios, analog photography, and generative experiments.', icon: Palette, layout: 'magazine', cover: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=1200&q=80' },
    { type: 'fantasy_universe', name: 'Fantasy Universe', desc: 'Original fictional universe: geography, factions, magic systems, and ancient lore.', icon: Boxes, layout: 'fantasy_world', cover: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80' },
    { type: 'alternate_reality', name: 'Alternate Reality', desc: 'What if you made different choices? Parallel timeline biography and civilization.', icon: Wand2, layout: 'cinematic', cover: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80' }
  ];

  return (
    <div className="w-full flex flex-col space-y-4 pb-20 animate-fadeIn">
      {/* Top Profile Worlds Switcher Carousel */}
      <div className="p-4 rounded-3xl glass-panel-elevated border border-[#FFFFFF]/30 shadow-2xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#FFFFFF] to-[#E5E7EB] flex items-center justify-center text-white shadow-md">
              <Globe2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-black text-[#F3F4F6] flex items-center gap-2">
                <span>Profile Worlds</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FFFFFF]/20 border border-[#FFFFFF]/40 text-[#E5E7EB]">
                  {worlds.length} Dimensions
                </span>
              </h2>
              <p className="text-[10px] text-[#9CA3AF]">Multi-dimensional expressions of self under one identity</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isOwner && (
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-[#FFFFFF] hover:bg-[#E5E7EB] text-white font-bold text-xs flex items-center gap-1 shadow-md hover:scale-102 transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New World</span>
              </button>
            )}
            {onClose && (
              <button onClick={onClose} className="p-1 text-[#6B7280] hover:text-white cursor-pointer">
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Worlds Horizontal Pill Switcher */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-1">
          {worlds.map((w) => {
            const isSelected = activeWorld?.id === w.id;
            return (
              <button
                key={w.id}
                onClick={() => openWorld(w.id)}
                className={`px-3 py-1.5 rounded-2xl flex items-center gap-2 shrink-0 transition-all cursor-pointer border ${
                  isSelected
                    ? 'bg-gradient-to-r from-[#FFFFFF] to-[#E5E7EB] text-white border-transparent shadow-[0_0_12px_rgba(255,13,105,0.5)] font-bold'
                    : 'bg-black/40 text-[#D1D5DB] border-white/10 hover:border-[rgba(255,255,255,0.20)]/30 hover:text-white'
                }`}
              >
                <span className="text-xs">{w.is_default === 1 ? '🌟' : '🪐'}</span>
                <span className="text-xs whitespace-nowrap">{w.name}</span>
                {w.visibility !== 'public' && (
                  <Lock className="w-2.5 h-2.5 opacity-70" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ACTIVE WORLD DETAILED EXPLORER */}
      {activeWorld && (
        <div className="space-y-4">
          {/* World Hero Card with Ambient Theme & Audio */}
          <div className="relative rounded-3xl overflow-hidden glass-panel-elevated border border-[#FFFFFF]/30 shadow-2xl">
            {/* Background Cover Image with Gradient */}
            <div className="relative w-full h-44 sm:h-56 overflow-hidden bg-black">
              <img
                src={activeWorld.cover_image_url || 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80'}
                alt={activeWorld.name}
                className="w-full h-full object-cover opacity-60 scale-102 filter saturate-120"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0F020B] via-[#0F020B]/60 to-transparent" />

              {/* Floating Top World Controls */}
              <div className="absolute top-3 inset-x-3 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-black/60 backdrop-blur-md border border-white/20 text-[#F3F4F6] uppercase tracking-wider">
                    {activeWorld.layout_type} Layout
                  </span>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#FFFFFF]/30 backdrop-blur-md border border-[#FFFFFF]/50 text-[#F3F4F6]">
                    {activeWorld.world_type.replace('_', ' ').toUpperCase()}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Optional Background Ambience Audio */}
                  {activeWorld.ambient_sound_url && (
                    <button
                      onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                      className={`p-2 rounded-full backdrop-blur-md border transition-all cursor-pointer ${
                        isPlayingAudio 
                          ? 'bg-[#FFFFFF] text-white border-white shadow-[0_0_12px_#FFFFFF]' 
                          : 'bg-black/60 text-[#E5E7EB] border-white/20 hover:text-white'
                      }`}
                      title="Play/Pause World Ambient Soundtrack"
                    >
                      {isPlayingAudio ? <Volume2 className="w-4 h-4 animate-pulse" /> : <VolumeX className="w-4 h-4" />}
                    </button>
                  )}

                  {isOwner && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleDuplicateWorld(activeWorld.id)}
                        className="p-2 rounded-full bg-black/60 backdrop-blur-md text-[#E5E7EB] hover:text-white border border-white/20 cursor-pointer"
                        title="Duplicate World"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteWorld(activeWorld.id)}
                        className="p-2 rounded-full bg-black/60 backdrop-blur-md text-rose-400 hover:text-rose-300 border border-white/20 cursor-pointer"
                        title="Delete World"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Hero Info */}
              <div className="absolute bottom-3 inset-x-4 flex items-end justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl sm:text-2xl font-black text-[#F3F4F6] tracking-tight drop-shadow-md">
                      {activeWorld.name}
                    </h1>
                    {activeWorld.is_default === 1 && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40">
                        Primary
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#E5E7EB] line-clamp-2 max-w-lg mt-0.5 drop-shadow">
                    {activeWorld.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Quick World Stats Bar */}
            <div className="px-4 py-2.5 bg-[#12141B] border-t border-[#FFFFFF]/20 flex items-center justify-between text-xs">
              <div className="flex items-center gap-4 text-[#9CA3AF]">
                <span>📚 <strong>{sections.length}</strong> sections</span>
                <span>✨ <strong>{entries.length}</strong> entries</span>
                {relations.length > 0 && (
                  <span>🔗 <strong>{relations.length}</strong> cross-world links</span>
                )}
              </div>

              {isOwner && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsAddSectionOpen(true)}
                    className="px-2.5 py-1 rounded-xl bg-white/5 hover:bg-white/10 text-[#F3F4F6] font-bold text-[11px] flex items-center gap-1 border border-white/10 cursor-pointer"
                  >
                    <Plus className="w-3 h-3 text-[#FFFFFF]" />
                    <span>Add Section</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Cross-World Referenced Connections */}
          {relations.length > 0 && (
            <div className="p-3.5 rounded-2xl bg-black/40 border border-[rgba(255,255,255,0.20)]/20 flex items-center gap-2 text-xs">
              <span className="text-[10px] font-bold uppercase text-[#E5E7EB] shrink-0">Cross-World Link:</span>
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                {relations.map((rel) => (
                  <span 
                    key={rel.id} 
                    className="px-2.5 py-0.5 rounded-full bg-[#FFFFFF]/15 border border-[#FFFFFF]/30 text-[#F3F4F6] text-[11px] whitespace-nowrap flex items-center gap-1.5"
                  >
                    <span>🔗</span>
                    <span>"{rel.entry_title}"</span>
                    <span className="text-[#9CA3AF]">in {rel.target_world_name}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* WORLD SECTIONS & ENTRIES (Styled according to world layout) */}
          <div className="space-y-4">
            {sections.map((sec) => {
              const secEntries = entries.filter(e => e.section_id === sec.id);

              return (
                <div 
                  key={sec.id} 
                  className="rounded-3xl glass-panel-elevated border border-[#FFFFFF]/25 overflow-hidden shadow-xl"
                >
                  {/* Section Title Header */}
                  <div className="p-4 bg-gradient-to-r from-[#181B24] to-[#12141B] border-b border-[#FFFFFF]/15 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="text-lg">{sec.icon || '✨'}</span>
                      <div>
                        <h3 className="text-sm font-bold text-[#F3F4F6]">{sec.title}</h3>
                        {sec.description && (
                          <p className="text-[10px] text-[#9CA3AF]">{sec.description}</p>
                        )}
                      </div>
                    </div>

                    {isOwner && (
                      <button
                        onClick={() => {
                          setTargetSectionId(sec.id);
                          setIsAddEntryOpen(true);
                        }}
                        className="px-2.5 py-1 rounded-xl bg-[#FFFFFF]/20 hover:bg-[#FFFFFF]/30 text-[#F3F4F6] font-bold text-[11px] flex items-center gap-1 border border-[#FFFFFF]/40 cursor-pointer"
                      >
                        <Plus className="w-3 h-3 text-[#FFFFFF]" />
                        <span>Add Entry</span>
                      </button>
                    )}
                  </div>

                  {/* Section Entries List */}
                  <div className="p-4 space-y-3.5 bg-black/25">
                    {secEntries.length === 0 ? (
                      <div className="py-6 text-center text-[#6B7280] text-xs">
                        No entries in this section yet.
                      </div>
                    ) : (
                      secEntries.map((ent) => (
                        <div 
                          key={ent.id} 
                          className="p-4 rounded-2xl bg-black/40 border border-[rgba(255,255,255,0.20)]/20 space-y-2.5 hover:border-[#FFFFFF]/40 transition-colors shadow-md"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              {ent.title && (
                                <h4 className="text-xs font-bold text-[#F3F4F6] mb-1">{ent.title}</h4>
                              )}
                              <div className="flex items-center gap-2">
                                {renderRealityBadge(ent.reality_classification)}
                                <span className="text-[10px] text-[#9CA3AF]">
                                  {new Date(ent.created_at).toLocaleDateString()}
                                </span>
                              </div>
                            </div>

                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[#9CA3AF]">
                              {ent.visibility}
                            </span>
                          </div>

                          {/* 5,000 Char GitHub Markdown Rendered Content */}
                          <div className="pt-1">
                            <GitHubMarkdownRenderer content={ent.content} />
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODAL: CREATE NEW PROFILE WORLD (With 10 Starting Templates) */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="w-full max-w-xl bg-[#090A0E] border border-[#FFFFFF]/40 rounded-3xl p-5 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto no-scrollbar">
            <div className="flex items-center justify-between border-b border-[#FFFFFF]/20 pb-3">
              <div className="flex items-center gap-2">
                <Globe2 className="w-5 h-5 text-[#FFFFFF]" />
                <h3 className="text-sm font-bold text-[#F3F4F6]">Create New Profile World</h3>
              </div>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-[#6B7280] hover:text-white cursor-pointer">
                ✕
              </button>
            </div>

            {/* Template Selector Quick Chips */}
            <div>
              <label className="text-[10px] text-[#E5E7EB] font-bold block mb-1.5 uppercase tracking-wider">
                Select Starting Template
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {templates.map((tpl) => {
                  const Icon = tpl.icon;
                  const isChosen = newWorldType === tpl.type;
                  return (
                    <div
                      key={tpl.type}
                      onClick={() => {
                        setNewWorldType(tpl.type);
                        setNewWorldName(tpl.name);
                        setNewWorldDesc(tpl.desc);
                        setNewWorldLayout(tpl.layout);
                        setNewWorldCover(tpl.cover);
                      }}
                      className={`p-2.5 rounded-2xl border text-left cursor-pointer transition-all ${
                        isChosen
                          ? 'bg-[#FFFFFF]/20 border-[#FFFFFF] text-[#F3F4F6] shadow-md'
                          : 'bg-black/40 border-white/10 hover:border-white/20 text-[#D1D5DB]'
                      }`}
                    >
                      <Icon className="w-4 h-4 text-[#FFFFFF] mb-1" />
                      <div className="text-xs font-bold leading-tight">{tpl.name}</div>
                      <div className="text-[9px] text-[#6B7280] line-clamp-1 mt-0.5">{tpl.desc}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* World Details Form */}
            <form onSubmit={handleCreateWorld} className="space-y-3 text-xs pt-2 border-t border-[#FFFFFF]/15">
              <div>
                <label className="text-[10px] text-[#E5E7EB] font-bold block mb-1">World Name</label>
                <input
                  type="text"
                  placeholder="e.g. Neon Monolith, The Inner Sanctuary, 2030 Horizon"
                  value={newWorldName}
                  onChange={(e) => setNewWorldName(e.target.value)}
                  className="w-full bg-black/40 border border-[rgba(255,255,255,0.20)]/30 rounded-xl px-3 py-2 text-[#F3F4F6] focus:outline-none focus:border-[#FFFFFF]"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] text-[#E5E7EB] font-bold block mb-1">World Introduction / Purpose</label>
                <textarea
                  rows={2}
                  placeholder="Describe the nature of this persona or dimension of self..."
                  value={newWorldDesc}
                  onChange={(e) => setNewWorldDesc(e.target.value)}
                  className="w-full bg-black/40 border border-[rgba(255,255,255,0.20)]/30 rounded-xl px-3 py-2 text-[#F3F4F6] focus:outline-none focus:border-[#FFFFFF]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-[#E5E7EB] font-bold block mb-1">Layout Style</label>
                  <select
                    value={newWorldLayout}
                    onChange={(e) => setNewWorldLayout(e.target.value as WorldLayoutType)}
                    className="w-full bg-black/40 border border-[rgba(255,255,255,0.20)]/30 rounded-xl px-3 py-2 text-[#F3F4F6] focus:outline-none focus:border-[#FFFFFF]"
                  >
                    <option value="cinematic">🎬 Cinematic Widescreen</option>
                    <option value="editorial">📰 Editorial Magazine</option>
                    <option value="scrapbook">📌 Scrapbook / Polaroids</option>
                    <option value="timeline">⏳ Chronological Timeline</option>
                    <option value="portfolio">💼 Professional Portfolio</option>
                    <option value="fantasy_world">🏰 Fantasy World / Lore</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-[#E5E7EB] font-bold block mb-1">Audience Visibility</label>
                  <select
                    value={newWorldVis}
                    onChange={(e) => setNewWorldVis(e.target.value as WorldVisibility)}
                    className="w-full bg-black/40 border border-[rgba(255,255,255,0.20)]/30 rounded-xl px-3 py-2 text-[#F3F4F6] focus:outline-none focus:border-[#FFFFFF]"
                  >
                    <option value="public">🌐 Public (All Visitors)</option>
                    <option value="matches">💖 Mutual Matches Only</option>
                    <option value="friends">👥 Friends Only</option>
                    <option value="private">🔒 Private (Draft / Owner)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] text-[#E5E7EB] font-bold block mb-1">Cover Image URL</label>
                <input
                  type="url"
                  value={newWorldCover}
                  onChange={(e) => setNewWorldCover(e.target.value)}
                  className="w-full bg-black/40 border border-[rgba(255,255,255,0.20)]/30 rounded-xl px-3 py-2 text-[#F3F4F6] focus:outline-none focus:border-[#FFFFFF]"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={newWorldIsDefault}
                    onChange={(e) => setNewWorldIsDefault(e.target.checked)}
                    className="rounded bg-black/40 border-[rgba(255,255,255,0.20)]/40 text-[#FFFFFF]"
                  />
                  <span className="text-xs text-[#F3F4F6]">Set as My Primary Default World</span>
                </label>

                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#FFFFFF] to-[#E5E7EB] hover:brightness-110 text-white font-bold text-xs shadow-md cursor-pointer"
                >
                  Create Dimension
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD ENTRY WITH 5,000 CHAR GFM & REALITY CLASSIFICATION */}
      {isAddEntryOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="w-full max-w-lg bg-[#090A0E] border border-[#FFFFFF]/40 rounded-3xl p-5 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto no-scrollbar">
            <div className="flex items-center justify-between border-b border-[#FFFFFF]/20 pb-3">
              <h3 className="text-sm font-bold text-[#F3F4F6] flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#FFFFFF]" />
                <span>Add World Entry</span>
              </h3>
              <button onClick={() => setIsAddEntryOpen(false)} className="text-[#6B7280] hover:text-white cursor-pointer">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateEntry} className="space-y-3 text-xs">
              <div>
                <label className="text-[10px] text-[#E5E7EB] font-bold block mb-1">Entry Title (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Scene 1: Nightcall, Resonant Crystals, The Paradox"
                  value={newEntryTitle}
                  onChange={(e) => setNewEntryTitle(e.target.value)}
                  className="w-full bg-black/40 border border-[rgba(255,255,255,0.20)]/30 rounded-xl px-3 py-2 text-[#F3F4F6] focus:outline-none focus:border-[#FFFFFF]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-[#E5E7EB] font-bold block mb-1">Reality Classification</label>
                  <select
                    value={newEntryClassification}
                    onChange={(e) => setNewEntryClassification(e.target.value as RealityClassification)}
                    className="w-full bg-black/40 border border-[rgba(255,255,255,0.20)]/30 rounded-xl px-3 py-2 text-[#F3F4F6] focus:outline-none focus:border-[#FFFFFF]"
                  >
                    <option value="actual">💎 Actual Fact</option>
                    <option value="historical">📜 Historical Past</option>
                    <option value="current">⚡ Current Reality</option>
                    <option value="planned">🎯 Planned Goal</option>
                    <option value="aspirational">✨ Aspirational Future</option>
                    <option value="cinematic">🎬 Cinematic Scene</option>
                    <option value="imaginary">💭 Imaginary Concept</option>
                    <option value="fictional">📖 Fictional Story</option>
                    <option value="dream">🌙 Dream Experience</option>
                    <option value="roleplay">🎭 Roleplay Persona</option>
                    <option value="alternate_reality">🌌 Alternate Reality</option>
                    <option value="hypothetical">🔮 Hypothetical</option>
                    <option value="uncertain">❓ Uncertain Fact</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-[#E5E7EB] font-bold block mb-1">Visibility</label>
                  <select
                    value={newEntryVis}
                    onChange={(e) => setNewEntryVis(e.target.value as WorldVisibility)}
                    className="w-full bg-black/40 border border-[rgba(255,255,255,0.20)]/30 rounded-xl px-3 py-2 text-[#F3F4F6] focus:outline-none focus:border-[#FFFFFF]"
                  >
                    <option value="public">🌐 Public</option>
                    <option value="matches">💖 Matches</option>
                    <option value="friends">👥 Friends</option>
                    <option value="private">🔒 Private</option>
                  </select>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] text-[#E5E7EB] font-bold">Content (GitHub Markdown • Max 5,000 Chars)</label>
                  <span className={`text-[10px] font-mono ${newEntryContent.length > 4500 ? 'text-amber-400 font-bold' : 'text-[#6B7280]'}`}>
                    {newEntryContent.length} / 5,000
                  </span>
                </div>
                <textarea
                  rows={5}
                  maxLength={5000}
                  placeholder="Compose your entry using GitHub Markdown (## Headings, > Quotes, - [x] Checklists, tables, code blocks)..."
                  value={newEntryContent}
                  onChange={(e) => setNewEntryContent(e.target.value)}
                  className="w-full bg-black/40 border border-[rgba(255,255,255,0.20)]/30 rounded-xl px-3 py-2 text-[#F3F4F6] font-mono text-xs leading-relaxed focus:outline-none focus:border-[#FFFFFF]"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#FFFFFF]/20">
                <button
                  type="button"
                  onClick={() => setIsAddEntryOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 text-[#D1D5DB] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#FFFFFF] hover:bg-[#E5E7EB] text-white font-bold cursor-pointer shadow-md"
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD SECTION */}
      {isAddSectionOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="w-full max-w-md bg-[#090A0E] border border-[#FFFFFF]/40 rounded-3xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#FFFFFF]/20 pb-3">
              <h3 className="text-sm font-bold text-[#F3F4F6]">Create Section in {activeWorld?.name}</h3>
              <button onClick={() => setIsAddSectionOpen(false)} className="text-[#6B7280] hover:text-white cursor-pointer">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSection} className="space-y-3 text-xs">
              <div className="flex gap-2">
                <div className="w-16">
                  <label className="text-[10px] text-[#E5E7EB] font-bold block mb-1">Icon</label>
                  <input
                    type="text"
                    value={newSecIcon}
                    onChange={(e) => setNewSecIcon(e.target.value)}
                    className="w-full text-center bg-black/40 border border-[rgba(255,255,255,0.20)]/30 rounded-xl px-2 py-2 text-[#F3F4F6] focus:outline-none focus:border-[#FFFFFF]"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-[10px] text-[#E5E7EB] font-bold block mb-1">Section Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Defining Scenes, Insecurities, Magic Lore"
                    value={newSecTitle}
                    onChange={(e) => setNewSecTitle(e.target.value)}
                    className="w-full bg-black/40 border border-[rgba(255,255,255,0.20)]/30 rounded-xl px-3 py-2 text-[#F3F4F6] focus:outline-none focus:border-[#FFFFFF]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-[#E5E7EB] font-bold block mb-1">Section Description (Optional)</label>
                <input
                  type="text"
                  placeholder="Brief note about this section..."
                  value={newSecDesc}
                  onChange={(e) => setNewSecDesc(e.target.value)}
                  className="w-full bg-black/40 border border-[rgba(255,255,255,0.20)]/30 rounded-xl px-3 py-2 text-[#F3F4F6] focus:outline-none focus:border-[#FFFFFF]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#FFFFFF]/20">
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#FFFFFF] hover:bg-[#E5E7EB] text-white font-bold cursor-pointer shadow-md"
                >
                  Create Section
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
