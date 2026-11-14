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
  FileText,
  Layers,
  BookOpen,
  Tag,
  ShieldAlert,
  Info,
  Sliders,
  Filter,
  EyeOff
} from 'lucide-react';
import { identityUniverseClient } from '../services/identityUniverseApiClient';
import type { 
  UserIdentity, 
  IdentityType,
  IdentityClassification, 
  IdentityVisibility,
  TimelineDateNature,
  IdentityCustomSection,
  IdentityTimelineEvent,
  IdentityCharacteristic,
  FictionalUniverse, 
  UniversalTimelineEvent, 
  RegisteredExternalGame 
} from '../types/identityUniverse';
import { IDENTITY_TYPES, IDENTITY_TYPE_META } from '../types/identityUniverse';
import { parseTimelineDate, DATE_NATURE_CONFIG } from '../utils/timelineDate';

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
  const [selectedIdentitySections, setSelectedIdentitySections] = useState<IdentityCustomSection[]>([]);
  const [selectedIdentityTimeline, setSelectedIdentityTimeline] = useState<IdentityTimelineEvent[]>([]);
  const [selectedSubTab, setSelectedSubTab] = useState<'overview' | 'sections' | 'timeline'>('overview');

  const [categoryFilter, setCategoryFilter] = useState<'all' | 'reality' | 'reflection' | 'fiction'>('all');
  const [timelineNatureFilter, setTimelineNatureFilter] = useState<'all' | TimelineDateNature>('all');

  const [timelineEvents, setTimelineEvents] = useState<UniversalTimelineEvent[]>([]);
  const [universes, setUniverses] = useState<FictionalUniverse[]>([]);
  const [externalGames, setExternalGames] = useState<RegisteredExternalGame[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [isCreateIdentityOpen, setIsCreateIdentityOpen] = useState(false);
  const [isAddTimelineOpen, setIsAddTimelineOpen] = useState(false);
  const [isAddSectionOpen, setIsAddSectionOpen] = useState(false);
  const [isAddIdentityTimelineOpen, setIsAddIdentityTimelineOpen] = useState(false);
  const [isGameLauncherOpen, setIsGameLauncherOpen] = useState(false);
  const [activeGameToPlay, setActiveGameToPlay] = useState<RegisteredExternalGame | null>(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [hubToast, setHubToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setHubToast(msg);
    setTimeout(() => setHubToast(null), 3500);
  };

  // Form State: Create Identity (Master Prompt 02: 12 Multidimensional Spaces)
  const [newIdentityName, setNewIdentityName] = useState('');
  const [newIdentityType, setNewIdentityType] = useState<IdentityType>('personal');
  const [newIdentityTitle, setNewIdentityTitle] = useState('');
  const [newIdentityDesc, setNewIdentityDesc] = useState('');
  const [newIdentityBio, setNewIdentityBio] = useState('');
  const [newIdentityVisibility, setNewIdentityVisibility] = useState<IdentityVisibility>('public');
  const [newIdentityAccent, setNewIdentityAccent] = useState('#8B5CF6');
  const [characteristicKey, setCharacteristicKey] = useState('');
  const [characteristicVal, setCharacteristicVal] = useState('');
  const [newCharacteristics, setNewCharacteristics] = useState<IdentityCharacteristic[]>([]);

  // Form State: Add Custom Section
  const [newSectionTitle, setNewSectionTitle] = useState('');
  const [newSectionType, setNewSectionType] = useState<'markdown' | 'key_value' | 'gallery' | 'quotes'>('markdown');
  const [newSectionContent, setNewSectionContent] = useState('');
  const [newSectionVisibility, setNewSectionVisibility] = useState<IdentityVisibility>('public');

  // Form State: Add Identity Timeline Event (-1500 BCE, 0, 2150 CE)
  const [newIdentityTimeYear, setNewIdentityTimeYear] = useState('');
  const [newIdentityTimeNature, setNewIdentityTimeNature] = useState<TimelineDateNature>('personal');
  const [newIdentityTimeTitle, setNewIdentityTimeTitle] = useState('');
  const [newIdentityTimeDesc, setNewIdentityTimeDesc] = useState('');

  // Form State: Add Universal Timeline Event
  const [newTimeExpr, setNewTimeExpr] = useState('');
  const [newTimeType, setNewTimeType] = useState<'standard_ce' | 'bce' | 'years_ago' | 'astronomical' | 'fictional_era'>('standard_ce');
  const [newTimeTitle, setNewTimeTitle] = useState('');
  const [newTimeDesc, setNewTimeDesc] = useState('');
  const [newTimeIsFictional, setNewTimeIsFictional] = useState(false);

  useEffect(() => {
    loadData();
  }, [userId, viewerId]);

  // Load custom sections and timeline for selected identity
  useEffect(() => {
    if (selectedIdentity?.id) {
      loadSelectedIdentityExtras(selectedIdentity.id);
    }
  }, [selectedIdentity?.id, viewerId]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [idsRes, timelineRes, uniRes, gamesRes] = await Promise.all([
        identityUniverseClient.getUserIdentities(userId, viewerId),
        identityUniverseClient.getUniversalTimeline(userId, viewerId, 'asc'),
        identityUniverseClient.getUniverses(viewerId),
        identityUniverseClient.getExternalGames()
      ]);

      const loadedIdentities = idsRes.identities || [];
      setIdentities(loadedIdentities);
      if (loadedIdentities.length > 0 && !selectedIdentity) {
        setSelectedIdentity(loadedIdentities[0]);
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

  const loadSelectedIdentityExtras = async (identityId: string) => {
    try {
      const [sections, timeline] = await Promise.all([
        identityUniverseClient.getCustomSections(identityId, viewerId),
        identityUniverseClient.getTimelineEvents(identityId, viewerId)
      ]);
      setSelectedIdentitySections(sections || []);
      setSelectedIdentityTimeline(timeline || []);
    } catch (err) {
      console.error('Error fetching identity extra details', err);
    }
  };

  const handleAddCharacteristic = () => {
    if (!characteristicKey.trim() || !characteristicVal.trim()) return;
    setNewCharacteristics(prev => [
      ...prev,
      { key: characteristicKey.trim(), value: characteristicVal.trim() }
    ]);
    setCharacteristicKey('');
    setCharacteristicVal('');
  };

  const handleRemoveCharacteristic = (idx: number) => {
    setNewCharacteristics(prev => prev.filter((_, i) => i !== idx));
  };

  const handleCreateIdentity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIdentityName.trim()) return;

    try {
      const res = await identityUniverseClient.createIdentity({
        user_id: userId,
        identity_type: newIdentityType,
        name: newIdentityName.trim(),
        display_name: newIdentityTitle.trim() || newIdentityName.trim(),
        display_title: newIdentityTitle.trim(),
        description: newIdentityDesc.trim(),
        biography: newIdentityBio.trim(),
        visibility: newIdentityVisibility,
        status: 'published',
        characteristics: newCharacteristics,
        visual_theme: {
          accentColor: newIdentityAccent,
          realityCategory: IDENTITY_TYPE_META[newIdentityType]?.category || 'fiction'
        }
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
        setNewCharacteristics([]);
        showToast(`✨ ${IDENTITY_TYPE_META[newIdentityType]?.label || 'Identity'} created successfully`);
      }
    } catch (err) {
      console.error(err);
      showToast('❌ Failed to create identity');
    }
  };

  const handleCreateCustomSection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIdentity || !newSectionTitle.trim()) return;

    try {
      const section = await identityUniverseClient.createCustomSection(
        selectedIdentity.id,
        {
          title: newSectionTitle.trim(),
          section_key: newSectionTitle.trim().toLowerCase().replace(/\s+/g, '_'),
          section_type: newSectionType,
          content: newSectionContent.trim(),
          visibility: newSectionVisibility
        },
        userId
      );

      if (section) {
        setSelectedIdentitySections(prev => [...prev, section]);
        setIsAddSectionOpen(false);
        setNewSectionTitle('');
        setNewSectionContent('');
        showToast('✨ Custom section added');
      }
    } catch (err) {
      console.error(err);
      showToast('❌ Failed to add section');
    }
  };

  const handleDeleteCustomSection = async (sectionId: string) => {
    if (!selectedIdentity) return;
    try {
      await identityUniverseClient.deleteCustomSection(selectedIdentity.id, sectionId, userId);
      setSelectedIdentitySections(prev => prev.filter(s => s.id !== sectionId));
      showToast('Section removed');
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateIdentityTimelineEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIdentity || !newIdentityTimeYear.trim() || !newIdentityTimeTitle.trim()) return;

    try {
      const parsed = parseTimelineDate(newIdentityTimeYear.trim(), newIdentityTimeNature);
      const event = await identityUniverseClient.createTimelineEvent(
        selectedIdentity.id,
        {
          year_value: newIdentityTimeYear.trim(),
          date_nature: newIdentityTimeNature,
          title: newIdentityTimeTitle.trim(),
          description: newIdentityTimeDesc.trim(),
          display_date: parsed.displayDate,
          era_label: parsed.eraLabel,
          numeric_year: parsed.numericYear,
          visibility: 'public'
        },
        userId
      );

      if (event) {
        setSelectedIdentityTimeline(prev => [...prev, event].sort((a, b) => (a.numeric_year || 0) - (b.numeric_year || 0)));
        setIsAddIdentityTimelineOpen(false);
        setNewIdentityTimeYear('');
        setNewIdentityTimeTitle('');
        setNewIdentityTimeDesc('');
        showToast('⏳ Timeline event recorded');
      }
    } catch (err) {
      console.error(err);
      showToast('❌ Failed to add event');
    }
  };

  const handleDeleteIdentityTimelineEvent = async (eventId: string) => {
    if (!selectedIdentity) return;
    try {
      await identityUniverseClient.deleteTimelineEvent(selectedIdentity.id, eventId, userId);
      setSelectedIdentityTimeline(prev => prev.filter(e => e.id !== eventId));
      showToast('Timeline event removed');
    } catch (err) {
      console.error(err);
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
        showToast('📋 Identity duplicated as draft');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this identity space?')) return;
    try {
      await identityUniverseClient.deleteIdentity(id, userId);
      setIdentities(prev => prev.filter(i => i.id !== id));
      if (selectedIdentity?.id === id) {
        setSelectedIdentity(identities.find(i => i.id !== id) || null);
      }
      showToast('Identity deleted');
    } catch (err) {
      console.error(err);
    }
  };

  // Multi-dimensional Badge & Reality Indicator
  const renderIdentityTypeBadge = (id: UserIdentity) => {
    const rawType = (id.identity_type || (id.classification === 'real_identity' ? 'real' : 'imaginary')) as IdentityType;
    const meta = IDENTITY_TYPE_META[rawType] || IDENTITY_TYPE_META.custom;
    const category = meta.category;

    let catBadge = (
      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-purple-500/15 text-purple-300 border border-purple-500/30">
        🟣 Fiction / Creative
      </span>
    );

    if (category === 'reality') {
      catBadge = (
        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
          🟢 Grounded Reality
        </span>
      );
    } else if (category === 'reflection') {
      catBadge = (
        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-sky-500/15 text-sky-300 border border-sky-500/30">
          🔵 Inner Reflection
        </span>
      );
    }

    return (
      <div className="flex flex-wrap items-center gap-1.5">
        <span 
          className="px-2 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1"
          style={{ 
            backgroundColor: `${meta.themeAccent}18`, 
            color: meta.themeAccent, 
            borderColor: `${meta.themeAccent}40` 
          }}
        >
          <span>{meta.icon}</span>
          <span>{meta.label}</span>
        </span>
        {catBadge}
      </div>
    );
  };

  // Filter identities by Reality category
  const filteredIdentities = identities.filter(id => {
    if (categoryFilter === 'all') return true;
    const rawType = (id.identity_type || (id.classification === 'real_identity' ? 'real' : 'imaginary')) as IdentityType;
    const meta = IDENTITY_TYPE_META[rawType] || IDENTITY_TYPE_META.custom;
    return meta.category === categoryFilter;
  });

  return (
    <div className="w-full flex flex-col space-y-6">
      
      {/* 1. TOP HEADER & NAVIGATION TABS */}
      <div className="p-5 rounded-3xl dark-glass border border-white/[0.08] shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-white/15 border border-white/25 flex items-center justify-center text-white shadow-[0_0_14px_rgba(255,255,255,0.1)]">
              <Sparkles className="w-4 h-4 text-purple-300" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white font-serif tracking-tight flex items-center gap-2">
                <span>Multidimensional Identity Universe</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-zinc-300 font-sans font-normal border border-white/15">
                  12 Dimensions
                </span>
              </h2>
            </div>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Express real lives, personal reflections, social archetypes, cinematic narratives, and historical eras under one authenticated account.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl dark-glass border border-white/10 text-xs">
          {[
            { id: 'identities', label: 'Identity Spaces', icon: Layers },
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
      {/* TAB A: MULTIPLE IDENTITIES & 12 DIMENSIONS                          */}
      {/* =================================================================== */}
      {activeTab === 'identities' && (
        <div className="space-y-6">
          
          {/* Category Filter Pills (Reality Core vs Reflection vs Fiction) */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl dark-glass border border-white/[0.06]">
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1 mr-2">
                <Filter className="w-3 h-3" /> Reality Mode:
              </span>
              {[
                { id: 'all', label: 'All Dimensions', icon: '🌌' },
                { id: 'reality', label: 'Reality Core', icon: '🟢' },
                { id: 'reflection', label: 'Inner & Reflection', icon: '🔵' },
                { id: 'fiction', label: 'Creative & Fiction', icon: '🟣' }
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setCategoryFilter(cat.id as any)}
                  className={`px-2.5 py-1 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                    categoryFilter === cat.id
                      ? 'bg-white/20 text-white border border-white/30 shadow-sm'
                      : 'text-zinc-400 hover:text-white hover:bg-white/[0.04] border border-transparent'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>

            {isOwner && (
              <button
                onClick={() => setIsCreateIdentityOpen(true)}
                className="px-3.5 py-1.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 border border-purple-500/40 text-xs font-bold flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-purple-300" />
                <span>Create Identity Space</span>
              </button>
            )}
          </div>

          {/* Identity Spaces Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredIdentities.map(id => {
              const isSelected = selectedIdentity?.id === id.id;
              const rawType = (id.identity_type || (id.classification === 'real_identity' ? 'real' : 'imaginary')) as IdentityType;
              const meta = IDENTITY_TYPE_META[rawType] || IDENTITY_TYPE_META.custom;
              
              return (
                <div
                  key={id.id}
                  onClick={() => {
                    setSelectedIdentity(id);
                    if (onSelectIdentity) onSelectIdentity(id);
                  }}
                  className={`p-4 rounded-3xl dark-glass border transition-all cursor-pointer flex flex-col justify-between group relative overflow-hidden ${
                    isSelected
                      ? 'border-white/50 shadow-[0_8px_30px_rgba(255,255,255,0.08)] bg-white/[0.04]'
                      : 'border-white/[0.08] hover:border-white/25 hover:bg-white/[0.02]'
                  }`}
                  style={{
                    boxShadow: isSelected ? `0 0 24px ${meta.themeAccent}25` : undefined
                  }}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      {renderIdentityTypeBadge(id)}
                      <div className="flex items-center gap-1 text-[10px] text-zinc-400 font-mono">
                        {id.visibility === 'public' ? '🌐' : id.visibility === 'private' ? '🔒' : '👁️'}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div 
                        className="w-12 h-12 rounded-2xl overflow-hidden dark-glass border shrink-0 flex items-center justify-center text-lg shadow-sm"
                        style={{ borderColor: `${meta.themeAccent}40` }}
                      >
                        {id.avatar_url ? (
                          <img 
                            src={id.avatar_url} 
                            alt={id.name} 
                            className="w-full h-full object-cover" 
                          />
                        ) : (
                          <span>{meta.icon}</span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-white truncate group-hover:text-zinc-200 transition-colors flex items-center gap-1.5">
                          <span>{id.display_name || id.name}</span>
                          {id.is_primary ? (
                            <span className="text-[9px] px-1 rounded bg-amber-500/20 text-amber-300 font-bold shrink-0">
                              Primary
                            </span>
                          ) : null}
                        </h4>
                        <p className="text-[10px] text-zinc-400 truncate">{id.display_title || meta.label}</p>
                      </div>
                    </div>

                    <p className="text-[11px] text-zinc-300/90 line-clamp-2 leading-relaxed">
                      {id.description || meta.description}
                    </p>

                    {/* Characteristics Badges (MBTI, Values, Archetypes) */}
                    {id.characteristics && id.characteristics.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {id.characteristics.slice(0, 3).map((c, idx) => (
                          <span 
                            key={idx} 
                            className="px-2 py-0.5 rounded-full text-[9px] bg-white/[0.05] text-zinc-300 border border-white/10"
                            title={`${c.key}: ${c.value}`}
                          >
                            <span className="text-zinc-400 font-mono">{c.key}:</span> {c.value}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions footer */}
                  <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between mt-3 text-xs text-zinc-400">
                    <span className="text-[10px] font-mono capitalize text-zinc-400">{id.visibility}</span>
                    {isOwner && (
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleDuplicate(id.id); }} 
                          title="Duplicate as Draft"
                          className="hover:text-white p-1 transition-colors"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                        {!id.is_primary && (
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleDelete(id.id); }} 
                            title="Delete Space"
                            className="hover:text-red-400 p-1 transition-colors"
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

            {/* "+ Create New Dimension" Card */}
            {isOwner && (
              <div
                onClick={() => setIsCreateIdentityOpen(true)}
                className="p-6 rounded-3xl border border-dashed border-white/15 hover:border-white/30 bg-white/[0.02] hover:bg-white/[0.05] flex flex-col items-center justify-center text-center cursor-pointer transition-all group min-h-[190px]"
              >
                <div className="w-10 h-10 rounded-2xl dark-glass border border-white/10 flex items-center justify-center text-zinc-300 group-hover:text-white group-hover:scale-110 transition-all mb-2">
                  <Plus className="w-5 h-5 text-purple-400" />
                </div>
                <span className="text-xs font-bold text-white group-hover:text-zinc-200 transition-colors">
                  Add Identity Dimension
                </span>
                <span className="text-[10px] text-zinc-400 mt-1 max-w-[180px]">
                  Real, personal, inner, cinematic, historical, or aspirational
                </span>
              </div>
            )}
          </div>

          {/* Selected Identity Inspection Dossier */}
          {selectedIdentity && (
            <div className="p-6 rounded-3xl dark-glass border border-white/[0.08] shadow-2xl space-y-5">
              
              {/* Dossier Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/[0.06]">
                <div className="flex items-center gap-3">
                  <h3 className="text-base font-bold text-white font-serif">
                    {selectedIdentity.display_name || selectedIdentity.name}
                  </h3>
                  {renderIdentityTypeBadge(selectedIdentity)}
                </div>

                <div className="flex items-center gap-2">
                  {/* Sub-tabs: Overview, Custom Sections, Timeline */}
                  <div className="flex items-center p-1 rounded-xl bg-white/[0.04] border border-white/10 text-xs">
                    {[
                      { id: 'overview', label: 'Dossier', icon: FileText },
                      { id: 'sections', label: `Custom Sections (${selectedIdentitySections.length})`, icon: BookOpen },
                      { id: 'timeline', label: `Timeline (${selectedIdentityTimeline.length})`, icon: Clock }
                    ].map(st => {
                      const Icon = st.icon;
                      const isActive = selectedSubTab === st.id;
                      return (
                        <button
                          key={st.id}
                          onClick={() => setSelectedSubTab(st.id as any)}
                          className={`px-3 py-1 rounded-lg font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                            isActive
                              ? 'bg-white/20 text-white font-bold shadow-sm'
                              : 'text-zinc-400 hover:text-white'
                          }`}
                        >
                          <Icon className="w-3 h-3" />
                          <span>{st.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => setIsPreviewModalOpen(true)}
                    className="px-3 py-1.5 rounded-xl dark-glass text-xs text-zinc-200 border border-white/10 hover:border-white/30 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-zinc-300" />
                    <span>Public Preview</span>
                  </button>
                </div>
              </div>

              {/* Sub-Tab 1: Overview & Characteristics */}
              {selectedSubTab === 'overview' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
                  <div className="space-y-3">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                      Biography & Internal Dossier
                    </span>
                    <div className="text-zinc-300 leading-relaxed dark-glass p-4 rounded-2xl border border-white/5 space-y-2">
                      <p>{selectedIdentity.biography || selectedIdentity.description || 'No biography written for this identity space.'}</p>
                      {selectedIdentity.description && selectedIdentity.biography && (
                        <p className="text-[11px] text-zinc-400 italic pt-2 border-t border-white/5">
                          Summary: {selectedIdentity.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                      Characteristics & Key Badges
                    </span>
                    <div className="dark-glass p-4 rounded-2xl border border-white/5 space-y-3">
                      {selectedIdentity.characteristics && selectedIdentity.characteristics.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {selectedIdentity.characteristics.map((c, idx) => (
                            <div 
                              key={idx}
                              className="px-3 py-1 rounded-xl bg-white/10 border border-white/15 text-white flex items-center gap-1.5 shadow-sm"
                            >
                              <span className="text-purple-300 font-mono text-[10px]">{c.key}:</span>
                              <span className="font-semibold">{c.value}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-zinc-400 text-xs italic">
                          No multidimensional characteristics defined yet.
                        </p>
                      )}

                      {selectedIdentity.skills && selectedIdentity.skills.length > 0 && (
                        <div className="pt-2 border-t border-white/5">
                          <span className="text-[10px] text-zinc-400 uppercase font-bold block mb-1.5">Skills & Capabilities</span>
                          <div className="flex flex-wrap gap-1.5">
                            {selectedIdentity.skills.map((s, idx) => (
                              <span key={idx} className="px-2 py-0.5 rounded-full bg-white/5 text-zinc-300 border border-white/10 text-[10px]">
                                ⚡ {s}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Sub-Tab 2: Custom Sections (Master Prompt 02: Custom Sections) */}
              {selectedSubTab === 'sections' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-white font-serif">Independent Custom Sections</h4>
                      <p className="text-[11px] text-zinc-400">
                        Create custom markdown, key-value attributes, or quote collections with per-section privacy controls.
                      </p>
                    </div>

                    {isOwner && (
                      <button
                        onClick={() => setIsAddSectionOpen(true)}
                        className="px-3 py-1.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 border border-purple-500/40 text-xs font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Custom Section</span>
                      </button>
                    )}
                  </div>

                  {selectedIdentitySections.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedIdentitySections.map(sec => (
                        <div key={sec.id} className="p-4 rounded-2xl dark-glass border border-white/10 space-y-2 shadow-sm">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-white">{sec.title}</span>
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 rounded-full text-[9px] bg-white/10 text-zinc-300 border border-white/15 capitalize">
                                {sec.visibility}
                              </span>
                              {isOwner && (
                                <button 
                                  onClick={() => handleDeleteCustomSection(sec.id)}
                                  className="text-zinc-400 hover:text-red-400 p-0.5"
                                  title="Delete Section"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          </div>
                          <p className="text-xs text-zinc-300 whitespace-pre-wrap leading-relaxed dark-glass p-2.5 rounded-xl border border-white/5">
                            {sec.content}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 rounded-2xl dark-glass border border-dashed border-white/15 text-center text-zinc-400 text-xs">
                      No custom sections added to this identity space yet.
                    </div>
                  )}
                </div>
              )}

              {/* Sub-Tab 3: Identity Historical Timeline (-1500 BCE, 0, 2150 CE) */}
              {selectedSubTab === 'timeline' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-white font-serif">Identity Chronological Timeline</h4>
                      <p className="text-[11px] text-zinc-400">
                        Supports arbitrary historical years (-1500 BCE), Year 0, and future years across 4 date natures.
                      </p>
                    </div>

                    {isOwner && (
                      <button
                        onClick={() => setIsAddIdentityTimelineOpen(true)}
                        className="px-3 py-1.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 border border-purple-500/40 text-xs font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Timeline Moment</span>
                      </button>
                    )}
                  </div>

                  {selectedIdentityTimeline.length > 0 ? (
                    <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-px before:bg-white/10">
                      {selectedIdentityTimeline.map((evt, idx) => {
                        const natureCfg = DATE_NATURE_CONFIG[evt.date_nature] || DATE_NATURE_CONFIG.personal;
                        return (
                          <div key={evt.id || idx} className="relative group">
                            {/* Dot */}
                            <span 
                              className="absolute -left-6 top-1.5 w-3 h-3 rounded-full border-2 border-[#090A0E] shadow-sm"
                              style={{ backgroundColor: natureCfg.color }}
                            />

                            <div className="p-3.5 rounded-2xl dark-glass border border-white/[0.08] group-hover:border-white/20 transition-colors space-y-1">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-mono font-bold text-white">
                                  {evt.display_date || evt.year_value}
                                </span>
                                <div className="flex items-center gap-2">
                                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${natureCfg.bgClass} ${natureCfg.borderClass}`}>
                                    {natureCfg.badge}
                                  </span>
                                  {isOwner && (
                                    <button 
                                      onClick={() => handleDeleteIdentityTimelineEvent(evt.id)}
                                      className="text-zinc-400 hover:text-red-400 p-0.5"
                                      title="Delete Moment"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  )}
                                </div>
                              </div>

                              <h5 className="text-xs font-bold text-white">{evt.title}</h5>
                              <p className="text-[11px] text-zinc-400 leading-relaxed">{evt.description}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-8 rounded-2xl dark-glass border border-dashed border-white/15 text-center text-zinc-400 text-xs">
                      No chronological events pinned to this identity space yet.
                    </div>
                  )}
                </div>
              )}

            </div>
          )}
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB B: UNIVERSAL LIFE TIMELINE (BCE, Prehistoric, Astronomical)     */}
      {/* =================================================================== */}
      {activeTab === 'timeline' && (
        <div className="p-6 rounded-3xl dark-glass border border-white/[0.08] shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/[0.08]">
            <div>
              <h3 className="text-sm font-bold text-white font-serif">Universal Life Timeline</h3>
              <p className="text-xs text-zinc-400">
                Record real life, 1500 BCE, 65 million years ago, or year 2150 without standard Gregorian calendar bounds.
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
                      {evt.display_label || evt.year_value}
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
      {/* MODAL 1: CREATE MULTIDIMENSIONAL IDENTITY (12 Dimensions)           */}
      {/* =================================================================== */}
      {isCreateIdentityOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-xl dark-glass border border-white/10 rounded-3xl p-6 space-y-4 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <h3 className="text-base font-bold text-white font-serif">Create Identity Dimension</h3>
                <p className="text-[11px] text-zinc-400">Add a distinct identity space under your account</p>
              </div>
              <button onClick={() => setIsCreateIdentityOpen(false)} className="text-zinc-400 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateIdentity} className="space-y-4 text-xs">
              
              {/* 1. Identity Type Selection (12 Types) */}
              <div>
                <label className="block text-[11px] font-bold text-zinc-300 mb-1.5">
                  Select Dimension Type *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-1 rounded-2xl bg-black/40 border border-white/10">
                  {IDENTITY_TYPES.map(t => {
                    const meta = IDENTITY_TYPE_META[t];
                    const isSelected = newIdentityType === t;
                    return (
                      <div
                        key={t}
                        onClick={() => {
                          setNewIdentityType(t);
                          setNewIdentityAccent(meta.themeAccent);
                        }}
                        className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-purple-600/30 border-purple-500 text-white shadow-sm'
                            : 'bg-white/[0.02] border-white/10 text-zinc-300 hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 font-bold text-[11px]">
                          <span>{meta.icon}</span>
                          <span className="truncate">{meta.label}</span>
                        </div>
                        <p className="text-[9px] text-zinc-400 line-clamp-1 mt-0.5">
                          {meta.description}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 2. Identity Name & Title */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-zinc-400 mb-1">Identity Space Name *</label>
                  <input
                    type="text"
                    value={newIdentityName}
                    onChange={e => setNewIdentityName(e.target.value)}
                    placeholder="e.g. Gotham Knight, Real Life, The Chronicler"
                    required
                    className="w-full px-3 py-2 rounded-xl dark-glass border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-white/30"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-zinc-400 mb-1">Display Title / Tagline</label>
                  <input
                    type="text"
                    value={newIdentityTitle}
                    onChange={e => setNewIdentityTitle(e.target.value)}
                    placeholder="e.g. Masked Detective, Deep Thinker"
                    className="w-full px-3 py-2 rounded-xl dark-glass border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-white/30"
                  />
                </div>
              </div>

              {/* 3. Description & Narrative */}
              <div>
                <label className="block text-[11px] font-bold text-zinc-400 mb-1">Dossier / Summary</label>
                <textarea
                  value={newIdentityDesc}
                  onChange={e => setNewIdentityDesc(e.target.value)}
                  placeholder="How do you express this dimension of your humanity?"
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl dark-glass border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-white/30"
                />
              </div>

              {/* 4. Characteristics Badges (MBTI, Enneagram, Core Values) */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-zinc-400">
                  Characteristics & Badges (Optional)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={characteristicKey}
                    onChange={e => setCharacteristicKey(e.target.value)}
                    placeholder="Key (e.g. MBTI, Archetype)"
                    className="w-1/3 px-2.5 py-1.5 rounded-xl dark-glass border border-white/10 text-white text-xs placeholder-white/30"
                  />
                  <input
                    type="text"
                    value={characteristicVal}
                    onChange={e => setCharacteristicVal(e.target.value)}
                    placeholder="Value (e.g. INFJ, The Seeker)"
                    className="flex-1 px-2.5 py-1.5 rounded-xl dark-glass border border-white/10 text-white text-xs placeholder-white/30"
                  />
                  <button
                    type="button"
                    onClick={handleAddCharacteristic}
                    className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold cursor-pointer"
                  >
                    Add
                  </button>
                </div>

                {newCharacteristics.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {newCharacteristics.map((c, idx) => (
                      <span 
                        key={idx} 
                        className="px-2 py-0.5 rounded-full bg-white/10 text-zinc-200 border border-white/15 text-[10px] flex items-center gap-1"
                      >
                        <span className="font-mono text-purple-300">{c.key}:</span> {c.value}
                        <button 
                          type="button" 
                          onClick={() => handleRemoveCharacteristic(idx)}
                          className="hover:text-red-400 ml-1"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* 5. Privacy Visibility Settings */}
              <div>
                <label className="block text-[11px] font-bold text-zinc-400 mb-1">Visibility Gate</label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                  {(['public', 'friends_only', 'connections_only', 'selected_people', 'unlisted', 'private'] as const).map(vis => (
                    <button
                      type="button"
                      key={vis}
                      onClick={() => setNewIdentityVisibility(vis)}
                      className={`px-2 py-1.5 rounded-xl border text-[10px] font-medium capitalize text-center truncate cursor-pointer ${
                        newIdentityVisibility === vis
                          ? 'bg-purple-600/40 text-white border-purple-400 font-bold'
                          : 'border-white/10 text-zinc-400 hover:text-white bg-white/[0.02]'
                      }`}
                    >
                      {vis.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsCreateIdentityOpen(false)}
                  className="px-4 py-2 rounded-xl dark-glass text-zinc-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 font-bold text-white shadow-lg cursor-pointer"
                >
                  Create Dimension
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL 2: ADD CUSTOM SECTION                                         */}
      {/* =================================================================== */}
      {isAddSectionOpen && selectedIdentity && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg dark-glass border border-white/10 rounded-3xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-sm font-bold text-white font-serif">
                Add Custom Section to {selectedIdentity.name}
              </h3>
              <button onClick={() => setIsAddSectionOpen(false)} className="text-zinc-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomSection} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-zinc-400 mb-1">Section Title *</label>
                <input
                  type="text"
                  value={newSectionTitle}
                  onChange={e => setNewSectionTitle(e.target.value)}
                  placeholder="e.g. My Favorite Quotes, Alternate Universe Canon, Philosophy"
                  required
                  className="w-full px-3 py-2 rounded-xl dark-glass border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-white/30"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-zinc-400 mb-1">Section Type</label>
                  <select
                    value={newSectionType}
                    onChange={e => setNewSectionType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-[#181B24] border border-white/10 text-white focus:outline-none"
                  >
                    <option value="markdown">Markdown Text</option>
                    <option value="key_value">Key-Value Pairs</option>
                    <option value="quotes">Quote Collection</option>
                    <option value="gallery">Media Gallery</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-zinc-400 mb-1">Visibility</label>
                  <select
                    value={newSectionVisibility}
                    onChange={e => setNewSectionVisibility(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-[#181B24] border border-white/10 text-white focus:outline-none"
                  >
                    <option value="public">Public</option>
                    <option value="friends_only">Friends Only</option>
                    <option value="connections_only">Connections Only</option>
                    <option value="private">Private</option>
                    <option value="unlisted">Unlisted</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-400 mb-1">Section Content *</label>
                <textarea
                  value={newSectionContent}
                  onChange={e => setNewSectionContent(e.target.value)}
                  placeholder="Write your custom section narrative, bullet points, or attributes..."
                  rows={4}
                  required
                  className="w-full px-3 py-2 rounded-xl dark-glass border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-white/30"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsAddSectionOpen(false)}
                  className="px-4 py-2 rounded-xl dark-glass text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 font-bold text-white shadow-md cursor-pointer"
                >
                  Save Section
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL 3: ADD IDENTITY TIMELINE MOMENT (-1500 BCE, 0, 2150 CE)       */}
      {/* =================================================================== */}
      {isAddIdentityTimelineOpen && selectedIdentity && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg dark-glass border border-white/10 rounded-3xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-sm font-bold text-white font-serif">
                Add Chronological Moment to {selectedIdentity.name}
              </h3>
              <button onClick={() => setIsAddIdentityTimelineOpen(false)} className="text-zinc-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateIdentityTimelineEvent} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-zinc-400 mb-1">Year / Date Input *</label>
                  <input
                    type="text"
                    value={newIdentityTimeYear}
                    onChange={e => setNewIdentityTimeYear(e.target.value)}
                    placeholder="e.g. -1500, 1500 BCE, 0, 2026, 2150"
                    required
                    className="w-full px-3 py-2 rounded-xl dark-glass border border-white/10 text-white placeholder-white/30 focus:outline-none"
                  />
                  <span className="text-[9px] text-zinc-500 mt-0.5 block">Supports negative BCE years and year 0</span>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-zinc-400 mb-1">Date Nature *</label>
                  <select
                    value={newIdentityTimeNature}
                    onChange={e => setNewIdentityTimeNature(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-[#181B24] border border-white/10 text-white focus:outline-none"
                  >
                    <option value="personal">Personal Timeline (Autobiographical)</option>
                    <option value="historical">Historical Date (Ancient / Real History)</option>
                    <option value="fictional">Fictional Era (Narrative World)</option>
                    <option value="hypothetical">Hypothetical (Alternative Path)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-400 mb-1">Moment Title *</label>
                <input
                  type="text"
                  value={newIdentityTimeTitle}
                  onChange={e => setNewIdentityTimeTitle(e.target.value)}
                  placeholder="e.g. Founded the Sanctuary, First Stargazing Expedition"
                  required
                  className="w-full px-3 py-2 rounded-xl dark-glass border border-white/10 text-white placeholder-white/30 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-400 mb-1">Short Description</label>
                <textarea
                  value={newIdentityTimeDesc}
                  onChange={e => setNewIdentityTimeDesc(e.target.value)}
                  placeholder="What occurred at this point in the timeline?"
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl dark-glass border border-white/10 text-white placeholder-white/30 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsAddIdentityTimelineOpen(false)}
                  className="px-4 py-2 rounded-xl dark-glass text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 font-bold text-white shadow-md cursor-pointer"
                >
                  Pin Moment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL 4: ADD UNIVERSAL TIMELINE EVENT                               */}
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
                    <option value="years_ago">Years Ago (Prehistoric)</option>
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
      {/* MODAL 5: SECURE SANDBOXED GAME LAUNCHER                             */}
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
              className="p-2 rounded-full dark-glass text-[#9CA3AF] hover:text-white border border-white/10 cursor-pointer"
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
      {/* MODAL 6: PUBLIC IDENTITY PREVIEW MODAL                              */}
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
                className="p-1.5 rounded-full dark-glass text-zinc-400 hover:text-white cursor-pointer"
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
                <h4 className="text-lg font-bold text-white font-serif">{selectedIdentity.display_name || selectedIdentity.name}</h4>
                {selectedIdentity.display_title && (
                  <p className="text-xs text-zinc-300">{selectedIdentity.display_title}</p>
                )}
                <div className="mt-1.5 flex items-center gap-2">
                  {renderIdentityTypeBadge(selectedIdentity)}
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

            {selectedIdentity.characteristics && selectedIdentity.characteristics.length > 0 && (
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Dimensions & Traits</span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedIdentity.characteristics.map((c, idx) => (
                    <span key={idx} className="px-2.5 py-1 rounded-full bg-white/10 text-zinc-200 border border-white/15 font-medium text-[11px]">
                      <span className="text-purple-300">{c.key}:</span> {c.value}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setIsPreviewModalOpen(false)}
                className="px-5 py-2 rounded-xl gray-glass-btn font-semibold text-xs text-white cursor-pointer"
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
