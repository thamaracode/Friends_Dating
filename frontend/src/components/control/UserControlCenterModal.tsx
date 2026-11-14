import React, { useState, useEffect } from 'react';
import { 
  Sliders, 
  Sparkles, 
  Layers, 
  Shield, 
  Heart, 
  Users, 
  User, 
  Bell, 
  Palette, 
  Cpu, 
  Lock, 
  Eye, 
  EyeOff, 
  Download, 
  Upload, 
  RotateCcw, 
  Search, 
  Check, 
  ChevronRight, 
  Compass, 
  Clock, 
  AlertTriangle,
  Info,
  CheckCircle2,
  X,
  FileText,
  Flame,
  ExternalLink,
  MapPin,
  Share2,
  LogOut,
  Trash2,
  CreditCard,
  Smartphone,
  Mail,
  HelpCircle,
  BookOpen
} from 'lucide-react';
import { GlassModal, GlassButton, GlassPrimaryButton } from '../klyven';
import { UserAiControlCenter } from './UserAiControlCenter';
import { 
  FeatureControlService, 
  EXPERIENCE_PRESETS 
} from '../../services/featureControlService';
import type { 
  EvaluatedFeature, 
  RegisteredFeature, 
  ExperiencePresetKey,
  FeatureCategory
} from '../../types/featureControl';
import { 
  loadDiscoverySettings, 
  saveDiscoverySettings, 
  loadVisibilitySettings, 
  saveVisibilitySettings, 
  loadAccountPreferences, 
  saveAccountPreferences,
  loadUserAttributes,
  saveUserAttributes,
  DiscoverySettings,
  VisibilitySettings,
  AccountPreferences,
  FullUserAttributes
} from '../../types/tinderFeatures';
import { FeatureDetailModal } from './FeatureDetailModal';
import { LifestyleSelectModal, LifestyleCategoryKey } from './LifestyleSelectModal';
import { FeatureGlossaryModal } from './FeatureGlossaryModal';
import { WhatsNewModal } from './WhatsNewModal';

interface UserControlCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToTab?: (tab: string) => void;
}

type ControlSection = 
  | 'experience'
  | 'library'
  | 'privacy'
  | 'relationships'
  | 'identities'
  | 'social'
  | 'notifications'
  | 'appearance'
  | 'ai'
  | 'safety'
  | 'accessibility'
  | 'data';

export const UserControlCenterModal: React.FC<UserControlCenterModalProps> = ({
  isOpen,
  onClose,
  onNavigateToTab
}) => {
  const [activeSection, setActiveSection] = useState<ControlSection>('experience');
  const [features, setFeatures] = useState<EvaluatedFeature[]>(() => FeatureControlService.getEvaluatedFeatures());
  const [activePreset, setActivePreset] = useState<ExperiencePresetKey>(() => FeatureControlService.getActivePreset());
  const [registry, setRegistry] = useState<RegisteredFeature[]>([]);
  
  // Persistent Settings
  const [discovery, setDiscovery] = useState<DiscoverySettings>(loadDiscoverySettings);
  const [visibility, setVisibility] = useState<VisibilitySettings>(loadVisibilitySettings);
  const [account, setAccount] = useState<AccountPreferences>(loadAccountPreferences);
  const [userAttributes, setUserAttributes] = useState<FullUserAttributes>(loadUserAttributes);

  // Library search and filter
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | FeatureCategory>('all');
  
  // Feature detail inspector
  const [inspectedFeature, setInspectedFeature] = useState<EvaluatedFeature | null>(null);

  // Sub-Modals
  const [activeLifestyleCategory, setActiveLifestyleCategory] = useState<LifestyleCategoryKey | null>(null);
  const [isGlossaryOpen, setIsGlossaryOpen] = useState(false);
  const [isWhatsNewOpen, setIsWhatsNewOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  // Feedback states
  const [exportSuccess, setExportSuccess] = useState(false);
  const [importFeedback, setImportFeedback] = useState<string | null>(null);
  const [shareFeedback, setShareFeedback] = useState(false);
  const [newBlockedName, setNewBlockedName] = useState('');
  const [newBlockedContact, setNewBlockedContact] = useState('');

  useEffect(() => {
    const unsub = FeatureControlService.subscribe(() => {
      setFeatures(FeatureControlService.getEvaluatedFeatures());
      setActivePreset(FeatureControlService.getActivePreset());
    });

    FeatureControlService.syncFromBackend();
    FeatureControlService.getRegistry().then(setRegistry);

    return () => unsub();
  }, []);

  if (!isOpen) return null;

  // Auto-sync helper
  const updateDiscovery = (patch: Partial<DiscoverySettings>) => {
    const next = { ...discovery, ...patch };
    setDiscovery(next);
    saveDiscoverySettings(next);
  };

  const updateVisibility = (patch: Partial<VisibilitySettings>) => {
    const next = { ...visibility, ...patch };
    setVisibility(next);
    saveVisibilitySettings(next);
  };

  const updateAccount = (patch: Partial<AccountPreferences>) => {
    const next = { ...account, ...patch };
    setAccount(next);
    saveAccountPreferences(next);
  };

  const updateAttributes = (patch: Partial<FullUserAttributes>) => {
    const next = { ...userAttributes, ...patch };
    setUserAttributes(next);
    saveUserAttributes(next);
  };

  // Setup completion indicator calculation
  const totalFeatures = features.length;
  const configuredCount = features.filter(f => f.effectiveState === 'enabled').length;
  const completionPercentage = Math.round((configuredCount / (totalFeatures || 16)) * 100);

  const handleApplyPreset = async (presetKey: ExperiencePresetKey) => {
    await FeatureControlService.applyPreset(presetKey);
    setFeatures(FeatureControlService.getEvaluatedFeatures());
    setActivePreset(presetKey);
  };

  const handleToggleFeature = async (featureId: string) => {
    const feat = features.find(f => f.id === featureId);
    if (!feat) return;
    const nextState = feat.effectiveState === 'enabled' ? 'disabled' : 'enabled';
    await FeatureControlService.updateFeaturePreference(featureId, { state: nextState });
    setFeatures(FeatureControlService.getEvaluatedFeatures());
  };

  const handleToggleVisibility = async (featureId: string) => {
    const feat = features.find(f => f.id === featureId);
    if (!feat) return;
    await FeatureControlService.updateFeaturePreference(featureId, { isVisible: !feat.isVisible });
    setFeatures(FeatureControlService.getEvaluatedFeatures());
  };

  const handleExportJson = () => {
    const jsonStr = FeatureControlService.exportConfigurationJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `soulverse-architecture-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    setExportSuccess(true);
    setTimeout(() => setExportSuccess(false), 3000);
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = FeatureControlService.importConfigurationJson(content);
      if (success) {
        setImportFeedback('Configuration successfully imported!');
        setFeatures(FeatureControlService.getEvaluatedFeatures());
      } else {
        setImportFeedback('Failed to parse settings JSON. Format invalid.');
      }
      setTimeout(() => setImportFeedback(null), 3500);
    };
    reader.readAsText(file);
  };

  const handleLifestyleSave = (category: LifestyleCategoryKey, value: string | string[]) => {
    if (category === 'interests') {
      // noop
    } else if (category === 'languages') {
      const langs = Array.isArray(value) ? value : [value];
      updateDiscovery({ preferredLanguages: langs });
      updateAttributes({ essentials: { ...userAttributes.essentials, languages: langs } });
    } else if (category === 'zodiac') {
      updateAttributes({ essentials: { ...userAttributes.essentials, zodiac: String(value) } });
    } else if (category === 'education') {
      updateAttributes({ essentials: { ...userAttributes.essentials, education: String(value) } });
    } else if (category === 'lookingFor') {
      updateAttributes({ lifestyle: { ...userAttributes.lifestyle, lookingFor: String(value) } });
    } else if (category === 'familyPlans') {
      updateAttributes({ lifestyle: { ...userAttributes.lifestyle, familyPlans: String(value) } });
    } else if (category === 'communicationStyle') {
      updateAttributes({ lifestyle: { ...userAttributes.lifestyle, communicationStyle: String(value) } });
    } else if (category === 'loveStyle') {
      updateAttributes({ lifestyle: { ...userAttributes.lifestyle, loveStyle: String(value) } });
    } else if (category === 'pets') {
      updateAttributes({ lifestyle: { ...userAttributes.lifestyle, pets: String(value) } });
    } else if (category === 'drinking') {
      updateAttributes({ lifestyle: { ...userAttributes.lifestyle, drinking: String(value) } });
    } else if (category === 'smoking') {
      updateAttributes({ lifestyle: { ...userAttributes.lifestyle, smoking: String(value) } });
    } else if (category === 'workout') {
      updateAttributes({ lifestyle: { ...userAttributes.lifestyle, workout: String(value) } });
    }
  };

  const handleAddBlockedContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBlockedContact.trim()) return;
    const newEntry = {
      id: `blk_${Date.now()}`,
      name: newBlockedName.trim() || 'Blocked Contact',
      contactInfo: newBlockedContact.trim()
    };
    const updated = {
      ...visibility,
      blockedContacts: [...visibility.blockedContacts, newEntry]
    };
    setVisibility(updated);
    saveVisibilitySettings(updated);
    setNewBlockedName('');
    setNewBlockedContact('');
  };

  const handleRemoveBlockedContact = (id: string) => {
    const updated = {
      ...visibility,
      blockedContacts: visibility.blockedContacts.filter(c => c.id !== id)
    };
    setVisibility(updated);
    saveVisibilitySettings(updated);
  };

  const handleShareSoulverse = () => {
    navigator.clipboard.writeText('https://soulverse.im/join?ref=thamara');
    setShareFeedback(true);
    setTimeout(() => setShareFeedback(false), 2000);
  };

  const filteredFeatures = features.filter(f => {
    const matchesCategory = categoryFilter === 'all' || f.category === categoryFilter;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || f.name.toLowerCase().includes(q) || f.tagline.toLowerCase().includes(q);
    return matchesCategory && matchesSearch;
  });

  const sections = [
    { id: 'experience' as ControlSection, label: 'My Experience', icon: Sparkles, badge: activePreset.replace('_', ' ') },
    { id: 'library' as ControlSection, label: 'Features & Modules', icon: Layers, badge: `${configuredCount}/${totalFeatures}` },
    { id: 'privacy' as ControlSection, label: 'Privacy Center', icon: Shield },
    { id: 'relationships' as ControlSection, label: 'Relationships & Vault', icon: Heart },
    { id: 'identities' as ControlSection, label: 'Identities & Worlds', icon: User },
    { id: 'social' as ControlSection, label: 'Social Discovery', icon: Users, badge: 'Tinder-Engine' },
    { id: 'notifications' as ControlSection, label: 'Notifications & Quiet', icon: Bell },
    { id: 'appearance' as ControlSection, label: 'Appearance & Glass', icon: Palette },
    { id: 'ai' as ControlSection, label: 'AI & Intelligence', icon: Cpu },
    { id: 'safety' as ControlSection, label: 'Safety & 1926 Safe', icon: Lock },
    { id: 'accessibility' as ControlSection, label: 'Accessibility', icon: Info },
    { id: 'data' as ControlSection, label: 'Data & Architecture', icon: Download }
  ];

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-2xl flex items-center justify-center p-2 sm:p-4 animate-fadeIn">
        <div className="w-full max-w-5xl h-[94vh] dark-glass border border-white/15 rounded-3xl shadow-[0_25px_80px_rgba(0,0,0,0.95)] flex flex-col overflow-hidden relative">
          
          {/* Top Bar Header */}
          <div className="h-16 border-b border-white/10 px-4 sm:px-6 flex items-center justify-between shrink-0 bg-white/[0.02]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-white shadow-inner">
                <Sliders className="w-4 h-4 text-zinc-200" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white font-serif tracking-tight flex items-center gap-2">
                  <span>My App Control Center</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-zinc-300">
                    v7.42.1
                  </span>
                </h3>
                <p className="text-[11px] text-zinc-400">
                  Everything available. Nothing forced. Everything understandable.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              {/* Feature Discovery Buttons */}
              <button
                onClick={() => setIsGlossaryOpen(true)}
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl dark-glass border border-white/10 text-xs text-zinc-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                title="Browse Architecture Glossary"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Glossary</span>
              </button>

              <button
                onClick={() => setIsWhatsNewOpen(true)}
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl dark-glass border border-white/10 text-xs text-emerald-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                title="What's New in this Release"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>What's New</span>
              </button>

              {/* Setup completion indicator */}
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-zinc-300">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>{completionPercentage}% Active</span>
              </div>

              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full dark-glass border border-white/15 flex items-center justify-center text-zinc-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Master 2-Column Layout */}
          <div className="flex-1 flex min-h-0 overflow-hidden">
            
            {/* Left Nav Menu */}
            <aside className="w-56 sm:w-64 border-r border-white/10 p-3 space-y-1 overflow-y-auto no-scrollbar shrink-0 bg-black/30">
              <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 px-3 py-1.5">
                Architecture Sections
              </div>
              {sections.map(sec => {
                const Icon = sec.icon;
                const isActive = activeSection === sec.id;
                return (
                  <button
                    key={sec.id}
                    onClick={() => setActiveSection(sec.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                      isActive 
                        ? 'bg-white text-[#090A0E] font-bold shadow-lg shadow-white/5' 
                        : 'text-zinc-400 hover:text-white hover:bg-white/[0.05]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon className="w-4 h-4 shrink-0" />
                      <span className="truncate">{sec.label}</span>
                    </div>
                    {sec.badge && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono ${
                        isActive ? 'bg-[#090A0E]/15 text-[#090A0E]' : 'bg-white/10 text-zinc-300'
                      }`}>
                        {sec.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </aside>

            {/* Right Scrollable Content Pane */}
            <main className="flex-1 p-4 sm:p-6 overflow-y-auto no-scrollbar space-y-6">
              
              {/* SECTION 1: MY EXPERIENCE (PRESETS) */}
              {activeSection === 'experience' && (
                <div className="space-y-6 animate-fadeIn">
                  <div>
                    <h3 className="text-lg font-serif font-bold text-white tracking-tight">
                      Choose Your Experience Preset
                    </h3>
                    <p className="text-xs text-zinc-400 leading-relaxed mt-0.5">
                      Presets provide ready-made starting configurations. You can customize any individual feature anytime afterward.
                    </p>
                  </div>

                  {/* Preset Cards Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {EXPERIENCE_PRESETS.map(preset => {
                      const isSelected = activePreset === preset.key;
                      return (
                        <div
                          key={preset.key}
                          onClick={() => handleApplyPreset(preset.key)}
                          className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
                            isSelected 
                              ? 'dark-glass border-white/40 shadow-xl bg-white/[0.08]' 
                              : 'bg-white/[0.02] border-white/10 hover:border-white/20 hover:bg-white/[0.04]'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-bold text-sm text-white font-serif">
                              {preset.name}
                            </span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              isSelected ? 'bg-white text-[#090A0E]' : 'bg-white/10 text-zinc-300'
                            }`}>
                              {preset.badge}
                            </span>
                          </div>

                          <p className="text-xs text-zinc-300 leading-relaxed mb-3">
                            {preset.description}
                          </p>

                          <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-2 border-t border-white/[0.08]">
                            <span>For: {preset.targetAudience}</span>
                            {isSelected && (
                              <span className="text-emerald-400 font-bold flex items-center gap-1">
                                <Check className="w-3.5 h-3.5" /> Active
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Quick Controls Card */}
                  <div className="p-4 rounded-2xl dark-glass border border-white/10 space-y-3">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                      Quick Experience Toggles
                    </h4>
                    
                    <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03]">
                      <div>
                        <span className="text-xs font-bold text-white block">Quiet Hours Mode</span>
                        <span className="text-[11px] text-zinc-400">Silence non-essential social notifications and badges</span>
                      </div>
                      <button
                        onClick={() => updateAccount({ quietHoursEnabled: !account.quietHoursEnabled })}
                        className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                          account.quietHoursEnabled ? 'bg-white' : 'bg-white/15'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded-full transition-transform ${
                          account.quietHoursEnabled ? 'translate-x-6 bg-[#090A0E]' : 'translate-x-1 bg-white'
                        }`} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03]">
                      <div>
                        <span className="text-xs font-bold text-white block">Discovery & Learning</span>
                        <span className="text-[11px] text-zinc-400">Inspect the architecture dictionary and newly released modules</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <GlassButton variant="subtle" onClick={() => setIsGlossaryOpen(true)} className="text-xs py-1 px-2.5">
                          Glossary
                        </GlassButton>
                        <GlassButton variant="subtle" onClick={() => setIsWhatsNewOpen(true)} className="text-xs py-1 px-2.5 text-emerald-300">
                          What's New
                        </GlassButton>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 2: MASTER FEATURE LIBRARY */}
              {activeSection === 'library' && (
                <div className="space-y-4 animate-fadeIn">
                  <div>
                    <h3 className="text-lg font-serif font-bold text-white tracking-tight">
                      Master Feature Registry ({filteredFeatures.length})
                    </h3>
                    <p className="text-xs text-zinc-400 leading-relaxed mt-0.5">
                      Enable or disable any module. Disabling a feature cleanly unmounts it from the interface without deleting your saved data.
                    </p>
                  </div>

                  {/* Search and Category Filter Bar */}
                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 absolute left-3 top-2.5 text-zinc-400" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search features (e.g. vault, spotify, dating, journal)..."
                        className="w-full bg-white/[0.06] border border-white/15 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white/40"
                      />
                    </div>

                    <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-1">
                      {(['all', 'social', 'relationships', 'growth', 'identity', 'intelligence', 'media'] as const).map(cat => (
                        <button
                          key={cat}
                          onClick={() => setCategoryFilter(cat)}
                          className={`px-3 py-1.5 rounded-xl text-[11px] font-bold capitalize whitespace-nowrap cursor-pointer transition-colors ${
                            categoryFilter === cat ? 'bg-white text-[#090A0E]' : 'bg-white/5 text-zinc-400 hover:text-white'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Features List */}
                  <div className="space-y-2">
                    {filteredFeatures.map(feat => {
                      const isEnabled = feat.effectiveState === 'enabled';
                      return (
                        <div
                          key={feat.id}
                          className="p-3.5 rounded-2xl dark-glass border border-white/10 flex items-center justify-between gap-3 hover:border-white/20 transition-all"
                        >
                          <div className="min-w-0 flex-1 space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-white font-serif truncate">
                                {feat.name}
                              </span>
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-zinc-300">
                                {feat.category}
                              </span>
                              {feat.isPremium && (
                                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300">
                                  PLUS
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-zinc-400 leading-snug line-clamp-1">
                              {feat.tagline}
                            </p>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <GlassButton
                              variant="subtle"
                              onClick={() => setInspectedFeature(feat)}
                              className="text-xs py-1 px-2.5 text-zinc-300 hover:text-white"
                              title="Inspect full feature specification & data policy"
                            >
                              <Info className="w-3.5 h-3.5 mr-1" />
                              Details
                            </GlassButton>

                            <button
                              onClick={() => handleToggleVisibility(feat.id)}
                              disabled={!isEnabled}
                              className={`p-1.5 rounded-lg border transition-colors ${
                                feat.isVisible && isEnabled 
                                  ? 'border-white/20 text-zinc-200 hover:text-white' 
                                  : 'border-white/5 text-zinc-600'
                              } ${!isEnabled ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}`}
                              title={feat.isVisible ? 'Visible in menus' : 'Hidden from menus'}
                            >
                              {feat.isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                            </button>

                            <button
                              onClick={() => handleToggleFeature(feat.id)}
                              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                                isEnabled ? 'bg-white' : 'bg-white/15'
                              }`}
                            >
                              <div className={`w-4 h-4 rounded-full transition-transform ${
                                isEnabled ? 'translate-x-6 bg-[#090A0E]' : 'translate-x-1 bg-white'
                              }`} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* SECTION 3: PRIVACY CENTER (Screenshots 6, 7) */}
              {activeSection === 'privacy' && (
                <div className="space-y-4 animate-fadeIn">
                  <div>
                    <h3 className="text-lg font-serif font-bold text-white tracking-tight">
                      Privacy Center & Visibility Modes
                    </h3>
                    <p className="text-xs text-zinc-400 leading-relaxed mt-0.5">
                      Configure your discovery visibility, stealth status, and verify Sanctuary cryptographic guarantees.
                    </p>
                  </div>

                  {/* Visibility Modes (Screenshot 6) */}
                  <div className="p-5 rounded-3xl dark-glass border border-white/10 space-y-3">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                      Control My Visibility
                    </h4>
                    
                    <div className="space-y-2">
                      <div 
                        onClick={() => updateVisibility({ mode: 'standard' })}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                          visibility.mode === 'standard' 
                            ? 'bg-white text-[#090A0E] font-bold border-white shadow-md' 
                            : 'bg-white/[0.03] text-zinc-300 border-white/10 hover:bg-white/[0.07]'
                        }`}
                      >
                        <div>
                          <span className="text-sm font-bold block">Standard</span>
                          <span className={`text-xs block mt-0.5 ${visibility.mode === 'standard' ? 'text-[#090A0E]/80' : 'text-zinc-400'}`}>
                            You will be discoverable in the card stack and social circles.
                          </span>
                        </div>
                        {visibility.mode === 'standard' && (
                          <div className="w-6 h-6 rounded-full bg-[#090A0E] text-white flex items-center justify-center shrink-0">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                        )}
                      </div>

                      <div 
                        onClick={() => updateVisibility({ mode: 'incognito' })}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                          visibility.mode === 'incognito' 
                            ? 'bg-white text-[#090A0E] font-bold border-white shadow-md' 
                            : 'bg-white/[0.03] text-zinc-300 border-white/10 hover:bg-white/[0.07]'
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold block">Incognito</span>
                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-red-500 text-white">
                              PLUS
                            </span>
                          </div>
                          <span className={`text-xs block mt-0.5 ${visibility.mode === 'incognito' ? 'text-[#090A0E]/80' : 'text-zinc-400'}`}>
                            You will be discoverable only by people you have already Liked.
                          </span>
                        </div>
                        {visibility.mode === 'incognito' && (
                          <div className="w-6 h-6 rounded-full bg-[#090A0E] text-white flex items-center justify-center shrink-0">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Enable Discovery Toggle (Screenshot 7) */}
                  <div className="p-5 rounded-3xl dark-glass border border-white/10 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-sm font-bold text-white block">Enable Discovery</span>
                        <p className="text-xs text-zinc-400 leading-relaxed mt-1 max-w-lg">
                          When turned off, your profile will be hidden from the card stack and Discovery will be disabled. People you have already Liked may still see and match with you.
                        </p>
                      </div>
                      <button
                        onClick={() => updateVisibility({ enableDiscovery: !visibility.enableDiscovery })}
                        className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                          visibility.enableDiscovery ? 'bg-red-500' : 'bg-white/15'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded-full transition-transform ${
                          visibility.enableDiscovery ? 'translate-x-7 bg-white' : 'translate-x-1 bg-white'
                        }`} />
                      </button>
                    </div>

                    {/* Recently Active Status (Screenshot 8) */}
                    <div className="flex items-center justify-between pt-3 border-t border-white/[0.06]">
                      <div>
                        <span className="text-xs font-bold text-white block">Recently Active Status</span>
                        <span className="text-[11px] text-zinc-400">Show when you were last online in conversations and match cards</span>
                      </div>
                      <button
                        onClick={() => updateVisibility({ recentlyActiveStatus: !visibility.recentlyActiveStatus })}
                        className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                          visibility.recentlyActiveStatus ? 'bg-red-500' : 'bg-white/15'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded-full transition-transform ${
                          visibility.recentlyActiveStatus ? 'translate-x-6 bg-white' : 'translate-x-1 bg-white'
                        }`} />
                      </button>
                    </div>
                  </div>

                  {/* Cryptographic Sanctuary Notice */}
                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1">
                    <div className="flex items-center gap-2 text-xs font-bold text-white">
                      <Lock className="w-4 h-4 text-emerald-400" />
                      <span>Sanctuary Cryptographic Privacy Guaranteed</span>
                    </div>
                    <p className="text-[11px] text-zinc-400 leading-relaxed">
                      Soulverse administrators, moderation engines, and support staff have mathematically zero decrypt/read access to your Private Relationship Vault, Personal Markdown Journals, Unsent Words, or Unopened Letters.
                    </p>
                  </div>
                </div>
              )}

              {/* SECTION 4: RELATIONSHIPS & VAULT */}
              {activeSection === 'relationships' && (
                <div className="space-y-4 animate-fadeIn">
                  <div>
                    <h3 className="text-lg font-serif font-bold text-white tracking-tight">
                      Relationship Memory System & Private Vault
                    </h3>
                    <p className="text-xs text-zinc-400 leading-relaxed mt-0.5">
                      Configure your private connection memories, anniversary reminders, and Before-You-Talk contextual briefings.
                    </p>
                  </div>

                  <div className="p-5 rounded-3xl dark-glass border border-white/10 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-sm font-bold text-white block">Before-You-Talk Briefings</span>
                        <span className="text-xs text-zinc-400">Show boundary notes and promises before entering a direct chat</span>
                      </div>
                      <button
                        onClick={() => handleToggleFeature('feat_relationship_vault')}
                        className="px-3 py-1.5 rounded-xl bg-white text-[#090A0E] text-xs font-bold cursor-pointer"
                      >
                        Configured
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-white/[0.08] text-xs">
                      <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1">
                        <span className="font-bold text-white block">Connection Memory Retention</span>
                        <p className="text-[11px] text-zinc-400">Notes & memories stored indefinitely until explicitly deleted by you.</p>
                      </div>
                      <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1">
                        <span className="font-bold text-white block">Vault Lock Mode</span>
                        <p className="text-[11px] text-zinc-400">Zero-knowledge local biometric/passcode lock required on launch.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 5: IDENTITIES & WORLDS */}
              {activeSection === 'identities' && (
                <div className="space-y-4 animate-fadeIn">
                  <div>
                    <h3 className="text-lg font-serif font-bold text-white tracking-tight">
                      Multiple Identities & Narrative Worlds
                    </h3>
                    <p className="text-xs text-zinc-400 leading-relaxed mt-0.5">
                      Control visibility boundaries between Real Life Me, Professional Me, and Fictional Personas.
                    </p>
                  </div>

                  <div className="p-5 rounded-3xl dark-glass border border-white/10 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-sm font-bold text-white block">Persona Separation</span>
                        <span className="text-xs text-zinc-400">Prevent viewers of fictional worlds from discovering real-life profiles</span>
                      </div>
                      <span className="text-xs font-bold text-emerald-400 px-2 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                        Strict Isolated
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-white/[0.08]">
                      <div>
                        <span className="text-sm font-bold text-white block">Spotify Ambient World Soundtrack</span>
                        <span className="text-xs text-zinc-400">Stream ambient audio presets when visitors enter your profile worlds</span>
                      </div>
                      <button
                        onClick={() => handleToggleFeature('feat_spotify_ambient')}
                        className="px-3 py-1.5 rounded-xl bg-white text-[#090A0E] text-xs font-bold cursor-pointer"
                      >
                        Active
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 6: SOCIAL DISCOVERY (Screenshots 1, 2, 4, 5) */}
              {activeSection === 'social' && (
                <div className="space-y-4 animate-fadeIn">
                  <div>
                    <h3 className="text-lg font-serif font-bold text-white tracking-tight">
                      Social Discovery Engine
                    </h3>
                    <p className="text-xs text-zinc-400 leading-relaxed mt-0.5">
                      Fine-tune distance boundaries, age preferences, photo standards, and personal lifestyle indicators.
                    </p>
                  </div>

                  {/* Location (Screenshot 4) */}
                  <div className="p-4 rounded-2xl dark-glass border border-white/10 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-zinc-400 uppercase font-bold block">Discovery Location</span>
                      <span className="text-sm font-bold text-white">{discovery.locationName}</span>
                    </div>
                    <GlassButton variant="subtle" className="text-xs py-1 px-3">
                      Change Location
                    </GlassButton>
                  </div>

                  {/* Distance Preference Slider (Screenshots 4, 5) */}
                  <div className="p-5 rounded-3xl dark-glass border border-white/10 space-y-3">
                    <div className="flex items-center justify-between text-xs font-bold text-white">
                      <span>Distance Preference</span>
                      <span className="font-mono text-red-400">{discovery.maxDistanceKm} {account.distanceUnit}.</span>
                    </div>
                    <div className="space-y-1">
                      <input
                        type="range"
                        min="2"
                        max="250"
                        value={discovery.maxDistanceKm}
                        onChange={(e) => updateDiscovery({ maxDistanceKm: parseInt(e.target.value) })}
                        className="w-full accent-red-500 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
                      />
                      <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
                        <span>2 {account.distanceUnit}</span>
                        <span>80 {account.distanceUnit}</span>
                        <span>160 {account.distanceUnit}</span>
                        <span>250+ {account.distanceUnit}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-white/[0.08]">
                      <div>
                        <span className="text-xs font-semibold text-white block">Only show people in this range</span>
                        <span className="text-[10px] text-zinc-400">Strictly exclude profiles beyond your maximum distance</span>
                      </div>
                      <button
                        onClick={() => updateDiscovery({ onlyShowInDistanceRange: !discovery.onlyShowInDistanceRange })}
                        className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                          discovery.onlyShowInDistanceRange ? 'bg-red-500' : 'bg-white/15'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded-full transition-transform ${
                          discovery.onlyShowInDistanceRange ? 'translate-x-6 bg-white' : 'translate-x-1 bg-white'
                        }`} />
                      </button>
                    </div>
                  </div>

                  {/* Looking For Gender (Screenshot 5) */}
                  <div className="p-4 rounded-2xl dark-glass border border-white/10 space-y-2">
                    <span className="text-xs font-bold text-white block">Looking for</span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      {(['Women', 'Men', 'Everyone', 'Soul Connections'] as const).map(g => (
                        <button
                          key={g}
                          onClick={() => updateDiscovery({ lookingForGender: g })}
                          className={`py-2 px-3 rounded-xl border font-bold cursor-pointer transition-all ${
                            discovery.lookingForGender === g
                              ? 'bg-red-500 text-white border-red-500 shadow-sm'
                              : 'bg-white/[0.03] text-zinc-300 border-white/10 hover:bg-white/[0.08]'
                          }`}
                        >
                          {g}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Age Preference Dual Sliders (Screenshot 5) */}
                  <div className="p-5 rounded-3xl dark-glass border border-white/10 space-y-3">
                    <div className="flex items-center justify-between text-xs font-bold text-white">
                      <span>Age Preference</span>
                      <span className="font-mono text-red-400">{discovery.minAge} - {discovery.maxAge >= 100 ? '100+' : discovery.maxAge}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-[10px] text-zinc-400 block mb-1">Min Age: {discovery.minAge}</span>
                        <input
                          type="range"
                          min="18"
                          max="65"
                          value={discovery.minAge}
                          onChange={(e) => updateDiscovery({ minAge: parseInt(e.target.value) })}
                          className="w-full accent-red-500 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-zinc-400 block mb-1">Max Age: {discovery.maxAge >= 100 ? '100+' : discovery.maxAge}</span>
                        <input
                          type="range"
                          min="21"
                          max="100"
                          value={discovery.maxAge}
                          onChange={(e) => updateDiscovery({ maxAge: parseInt(e.target.value) })}
                          className="w-full accent-red-500 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-white/[0.08]">
                      <div>
                        <span className="text-xs font-semibold text-white block">Only show people in this range</span>
                        <span className="text-[10px] text-zinc-400">Strictly exclude ages outside your target window</span>
                      </div>
                      <button
                        onClick={() => updateDiscovery({ onlyShowInAgeRange: !discovery.onlyShowInAgeRange })}
                        className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                          discovery.onlyShowInAgeRange ? 'bg-red-500' : 'bg-white/15'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded-full transition-transform ${
                          discovery.onlyShowInAgeRange ? 'translate-x-6 bg-white' : 'translate-x-1 bg-white'
                        }`} />
                      </button>
                    </div>
                  </div>

                  {/* Global Mode Switch (Screenshot 5) */}
                  <div className="p-5 rounded-3xl dark-glass border border-white/10 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-white block">Global</span>
                      <button
                        onClick={() => updateDiscovery({ globalMode: !discovery.globalMode })}
                        className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                          discovery.globalMode ? 'bg-red-500' : 'bg-white/15'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded-full transition-transform ${
                          discovery.globalMode ? 'translate-x-7 bg-white' : 'translate-x-1 bg-white'
                        }`} />
                      </button>
                    </div>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      Going global will allow you to see people from around the world after you've run out of profiles nearby.
                    </p>
                  </div>

                  {/* Minimum Number of Photos (Screenshot 2) */}
                  <div className="p-5 rounded-3xl dark-glass border border-white/10 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-white">
                      <span>Minimum Number of Photos</span>
                      <span className="font-mono text-red-400">{discovery.minPhotos}</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="6"
                      value={discovery.minPhotos}
                      onChange={(e) => updateDiscovery({ minPhotos: parseInt(e.target.value) })}
                      className="w-full accent-white h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
                      <span>1</span><span>2</span><span>3</span><span>4</span><span>5</span><span>6</span>
                    </div>
                  </div>

                  {/* Lifestyle & Passions Selectors (Screenshot 1) */}
                  <div className="p-5 rounded-3xl dark-glass border border-white/10 space-y-3">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                      Lifestyle Attributes & Details (Tinder-Style)
                    </h4>

                    <div className="space-y-1">
                      {[
                        { key: 'interests' as LifestyleCategoryKey, label: 'Interests', current: 'Travel, Coffee, Deep Talks' },
                        { key: 'lookingFor' as LifestyleCategoryKey, label: 'Looking for', current: userAttributes.lifestyle.lookingFor || 'Select' },
                        { key: 'languages' as LifestyleCategoryKey, label: 'Add languages', current: discovery.preferredLanguages.join(', ') || 'Select' },
                        { key: 'zodiac' as LifestyleCategoryKey, label: 'Zodiac', current: userAttributes.essentials.zodiac || 'Select' },
                        { key: 'education' as LifestyleCategoryKey, label: 'Education', current: userAttributes.essentials.education || 'Select' },
                        { key: 'familyPlans' as LifestyleCategoryKey, label: 'Family Plans', current: userAttributes.lifestyle.familyPlans || 'Select' },
                        { key: 'communicationStyle' as LifestyleCategoryKey, label: 'Communication Style', current: userAttributes.lifestyle.communicationStyle || 'Select' },
                        { key: 'loveStyle' as LifestyleCategoryKey, label: 'Love Style', current: userAttributes.lifestyle.loveStyle || 'Select' },
                        { key: 'pets' as LifestyleCategoryKey, label: 'Pets', current: userAttributes.lifestyle.pets || 'Select' },
                        { key: 'drinking' as LifestyleCategoryKey, label: 'Drinking', current: userAttributes.lifestyle.drinking || 'Select' },
                        { key: 'smoking' as LifestyleCategoryKey, label: 'Smoking', current: userAttributes.lifestyle.smoking || 'Select' },
                        { key: 'workout' as LifestyleCategoryKey, label: 'Workout', current: userAttributes.lifestyle.workout || 'Select' }
                      ].map(item => (
                        <div
                          key={item.key}
                          onClick={() => setActiveLifestyleCategory(item.key)}
                          className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.04] transition-colors cursor-pointer text-xs"
                        >
                          <span className="font-semibold text-zinc-200">{item.label}</span>
                          <div className="flex items-center gap-2 text-zinc-400">
                            <span className="text-[11px] font-medium text-white truncate max-w-[160px]">{item.current}</span>
                            <ChevronRight className="w-3.5 h-3.5 text-zinc-500" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 7: NOTIFICATIONS (Screenshot 8) */}
              {activeSection === 'notifications' && (
                <div className="space-y-4 animate-fadeIn">
                  <div>
                    <h3 className="text-lg font-serif font-bold text-white tracking-tight">
                      Notifications & Alert Controls
                    </h3>
                    <p className="text-xs text-zinc-400 leading-relaxed mt-0.5">
                      Configure email digests, push notifications, and quiet hours.
                    </p>
                  </div>

                  <div className="p-5 rounded-3xl dark-glass border border-white/10 space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02]">
                      <div>
                        <span className="text-xs font-bold text-white block">Email Notifications</span>
                        <span className="text-[11px] text-zinc-400">Receive weekly chemistry digests and event invitations</span>
                      </div>
                      <button
                        onClick={() => updateAccount({ emailNotifications: !account.emailNotifications })}
                        className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                          account.emailNotifications ? 'bg-red-500' : 'bg-white/15'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded-full transition-transform ${
                          account.emailNotifications ? 'translate-x-6 bg-white' : 'translate-x-1 bg-white'
                        }`} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02]">
                      <div>
                        <span className="text-xs font-bold text-white block">Push Notifications</span>
                        <span className="text-[11px] text-zinc-400">Real-time alerts for mutual matches and direct messages</span>
                      </div>
                      <button
                        onClick={() => updateAccount({ pushNotifications: !account.pushNotifications })}
                        className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                          account.pushNotifications ? 'bg-red-500' : 'bg-white/15'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded-full transition-transform ${
                          account.pushNotifications ? 'translate-x-6 bg-white' : 'translate-x-1 bg-white'
                        }`} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02]">
                      <div>
                        <span className="text-xs font-bold text-white block">Quiet Hours</span>
                        <span className="text-[11px] text-zinc-400">Automatically silence alerts between 11:00 PM and 7:00 AM</span>
                      </div>
                      <button
                        onClick={() => updateAccount({ quietHoursEnabled: !account.quietHoursEnabled })}
                        className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                          account.quietHoursEnabled ? 'bg-red-500' : 'bg-white/15'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded-full transition-transform ${
                          account.quietHoursEnabled ? 'translate-x-6 bg-white' : 'translate-x-1 bg-white'
                        }`} />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 8: APPEARANCE (Screenshot 8) */}
              {activeSection === 'appearance' && (
                <div className="space-y-4 animate-fadeIn">
                  <div>
                    <h3 className="text-lg font-serif font-bold text-white tracking-tight">
                      Appearance & Display Preferences
                    </h3>
                    <p className="text-xs text-zinc-400 leading-relaxed mt-0.5">
                      Choose theme mode, distance metric format, and interface language.
                    </p>
                  </div>

                  {/* Theme Mode (Screenshot 8) */}
                  <div className="p-5 rounded-3xl dark-glass border border-white/10 space-y-3">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                      Theme
                    </h4>

                    <div className="space-y-1.5">
                      {[
                        { id: 'system' as const, label: 'Use System Setting' },
                        { id: 'light' as const, label: 'Light Mode' },
                        { id: 'dark' as const, label: 'Dark Mode (Obsidian Titanium)' }
                      ].map(m => (
                        <div
                          key={m.id}
                          onClick={() => updateAccount({ theme: m.id })}
                          className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-colors ${
                            account.theme === m.id
                              ? 'bg-white text-[#090A0E] font-bold border-white'
                              : 'bg-white/[0.02] text-zinc-300 border-white/10 hover:bg-white/[0.06]'
                          }`}
                        >
                          <span className="text-xs">{m.label}</span>
                          {account.theme === m.id && (
                            <Check className="w-4 h-4 text-red-500 stroke-[3]" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Distance Unit (Screenshot 8) */}
                  <div className="p-5 rounded-3xl dark-glass border border-white/10 space-y-3">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                      Show Distances In
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <button
                        onClick={() => updateAccount({ distanceUnit: 'km' })}
                        className={`p-3 rounded-xl border font-bold cursor-pointer transition-colors ${
                          account.distanceUnit === 'km'
                            ? 'bg-white text-[#090A0E] border-white'
                            : 'bg-white/[0.03] text-zinc-300 border-white/10'
                        }`}
                      >
                        Kilometers (km)
                      </button>
                      <button
                        onClick={() => updateAccount({ distanceUnit: 'mi' })}
                        className={`p-3 rounded-xl border font-bold cursor-pointer transition-colors ${
                          account.distanceUnit === 'mi'
                            ? 'bg-white text-[#090A0E] border-white'
                            : 'bg-white/[0.03] text-zinc-300 border-white/10'
                        }`}
                      >
                        Miles (mi)
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 9: AI & INTELLIGENCE */}
              {activeSection === 'ai' && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="h-[700px] rounded-3xl overflow-hidden border border-white/10 bg-[#090A0E]">
                    <UserAiControlCenter />
                  </div>
                </div>
              )}

              {/* SECTION 10: SAFETY (Screenshots 7, 9) */}
              {activeSection === 'safety' && (
                <div className="space-y-4 animate-fadeIn">
                  <div>
                    <h3 className="text-lg font-serif font-bold text-white tracking-tight">
                      Safety, Moderation & Crisis Resources
                    </h3>
                    <p className="text-xs text-zinc-400 leading-relaxed mt-0.5">
                      Manage blocked contacts and access 1926 mental health crisis resources.
                    </p>
                  </div>

                  {/* Block Contacts Manager (Screenshot 7) */}
                  <div className="p-5 rounded-3xl dark-glass border border-white/10 space-y-4">
                    <div>
                      <span className="text-sm font-bold text-white block">Block Contacts</span>
                      <p className="text-xs text-zinc-400 mt-0.5">
                        Select people from your contact list that you don't want to see or be seen by on Soulverse.
                      </p>
                    </div>

                    <form onSubmit={handleAddBlockedContact} className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Name (e.g. Ex-Colleague)"
                        value={newBlockedName}
                        onChange={(e) => setNewBlockedName(e.target.value)}
                        className="flex-1 bg-white/[0.06] border border-white/15 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none"
                      />
                      <input
                        type="text"
                        placeholder="Phone or Email"
                        value={newBlockedContact}
                        onChange={(e) => setNewBlockedContact(e.target.value)}
                        className="flex-1 bg-white/[0.06] border border-white/15 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none"
                      />
                      <GlassButton variant="primary" type="submit" className="text-xs py-2 px-3 font-bold">
                        Block
                      </GlassButton>
                    </form>

                    <div className="space-y-1.5 max-h-40 overflow-y-auto no-scrollbar">
                      {visibility.blockedContacts.map(c => (
                        <div key={c.id} className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04] text-xs">
                          <div>
                            <span className="font-bold text-white block">{c.name}</span>
                            <span className="text-[10px] text-zinc-400">{c.contactInfo}</span>
                          </div>
                          <button
                            onClick={() => handleRemoveBlockedContact(c.id)}
                            className="text-xs text-red-400 hover:text-red-300 font-semibold cursor-pointer"
                          >
                            Unblock
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Safety Policy Links (Screenshot 9) */}
                  <div className="p-5 rounded-3xl dark-glass border border-white/10 space-y-2 text-xs">
                    <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">Safety & Policy</h4>
                    {[
                      'Community Guidelines',
                      'Safety & Policy',
                      'Safety Tips',
                      '1926 Safe NIMH Crisis Support Hotline'
                    ].map(link => (
                      <div key={link} className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] transition-colors cursor-pointer">
                        <span className="font-semibold text-white">{link}</span>
                        <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SECTION 11: ACCESSIBILITY (Screenshot 10) */}
              {activeSection === 'accessibility' && (
                <div className="space-y-4 animate-fadeIn">
                  <div>
                    <h3 className="text-lg font-serif font-bold text-white tracking-tight">
                      Accessibility & Keyboard Navigation
                    </h3>
                    <p className="text-xs text-zinc-400 leading-relaxed mt-0.5">
                      Ensure comfortable navigation with keyboard shortcuts and screen reader semantic landmarks.
                    </p>
                  </div>

                  {/* Keyboard Shortcuts Toggle (Screenshot 10) */}
                  <div className="p-5 rounded-3xl dark-glass border border-white/10 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-sm font-bold text-white block">Keyboard Shortcuts</span>
                        <span className="text-xs text-zinc-400">Navigate card stacks with arrow keys (← Pass, → Like, ↑ Superlike)</span>
                      </div>
                      <button
                        onClick={() => updateAccount({ keyboardShortcuts: !account.keyboardShortcuts })}
                        className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                          account.keyboardShortcuts ? 'bg-red-500' : 'bg-white/15'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded-full transition-transform ${
                          account.keyboardShortcuts ? 'translate-x-7 bg-white' : 'translate-x-1 bg-white'
                        }`} />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 12: DATA, BACKUPS & ACCOUNT ACTIONS (Screenshots 9, 10) */}
              {activeSection === 'data' && (
                <div className="space-y-4 animate-fadeIn">
                  <div>
                    <h3 className="text-lg font-serif font-bold text-white tracking-tight">
                      Data Portability & Account Management
                    </h3>
                    <p className="text-xs text-zinc-400 leading-relaxed mt-0.5">
                      Export your configuration, manage your subscription, and execute account level actions.
                    </p>
                  </div>

                  {/* Export & Import Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl dark-glass border border-white/10 space-y-3">
                      <Download className="w-5 h-5 text-zinc-300" />
                      <div>
                        <h4 className="text-xs font-bold text-white">Export Configuration</h4>
                        <p className="text-[11px] text-zinc-400 mt-0.5">
                          Download personal feature preferences, visible toggles, and active presets as JSON.
                        </p>
                      </div>
                      <GlassButton variant="primary" onClick={handleExportJson} className="text-xs py-1.5 px-3">
                        Download JSON
                      </GlassButton>
                      {exportSuccess && (
                        <span className="text-xs text-emerald-400 font-bold block">✓ Exported!</span>
                      )}
                    </div>

                    <div className="p-4 rounded-2xl dark-glass border border-white/10 space-y-3">
                      <Upload className="w-5 h-5 text-zinc-300" />
                      <div>
                        <h4 className="text-xs font-bold text-white">Import Configuration</h4>
                        <p className="text-[11px] text-zinc-400 mt-0.5">
                          Upload a saved configuration JSON to restore your exact app setup.
                        </p>
                      </div>
                      <label className="inline-block cursor-pointer">
                        <span className="px-3 py-1.5 rounded-xl dark-glass border border-white/20 text-xs font-bold text-white hover:bg-white/10 transition-colors">
                          Choose File
                        </span>
                        <input
                          type="file"
                          accept=".json"
                          onChange={handleImportJson}
                          className="hidden"
                        />
                      </label>
                      {importFeedback && (
                        <span className="text-xs text-zinc-300 font-bold block">{importFeedback}</span>
                      )}
                    </div>
                  </div>

                  {/* Buttons matching Tinder Screenshot 10 */}
                  <div className="p-5 rounded-3xl dark-glass border border-white/10 space-y-3">
                    <button
                      onClick={handleShareSoulverse}
                      className="w-full py-3 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/15 text-xs font-bold text-white transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Share2 className="w-4 h-4" />
                      <span>{shareFeedback ? 'Invite Link Copied!' : 'Share Soulverse'}</span>
                    </button>

                    <button
                      onClick={() => alert('Logged out safely. Your offline data remains cryptographically preserved.')}
                      className="w-full py-3 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/15 text-xs font-bold text-white transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>

                    {/* Logo & Version (Screenshot 10) */}
                    <div className="py-4 text-center space-y-1">
                      <Flame className="w-6 h-6 text-red-500 mx-auto fill-red-500/30" />
                      <div className="text-xs font-mono text-zinc-400">Version 7.42.1 (Soulverse v2.4.0)</div>
                    </div>

                    <button
                      onClick={() => setIsDeleteConfirmOpen(true)}
                      className="w-full py-3 rounded-2xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-xs font-bold text-red-400 transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete Account</span>
                    </button>
                  </div>
                </div>
              )}

            </main>
          </div>

          {/* Bottom Bar */}
          <div className="h-14 border-t border-white/10 px-4 sm:px-6 flex items-center justify-between shrink-0 bg-white/[0.02]">
            <span className="text-[11px] text-zinc-500 font-mono">
              Soulverse Control Layer v1.0 • Universal Feature Specification
            </span>
            <GlassButton variant="primary" onClick={onClose} className="text-xs py-1.5 px-4 font-bold">
              Done
            </GlassButton>
          </div>

        </div>
      </div>

      {/* Feature Detail Modal Inspector */}
      {inspectedFeature && (
        <FeatureDetailModal
          isOpen={Boolean(inspectedFeature)}
          onClose={() => setInspectedFeature(null)}
          feature={inspectedFeature}
          registryMeta={registry.find(r => r.id === inspectedFeature.id)}
          onUpdated={() => {
            setFeatures(FeatureControlService.getEvaluatedFeatures());
            const refreshed = FeatureControlService.getEvaluatedFeatures().find(f => f.id === inspectedFeature.id);
            if (refreshed) setInspectedFeature(refreshed);
          }}
        />
      )}

      {/* Lifestyle Select Modal (Screenshot 1) */}
      {activeLifestyleCategory && (
        <LifestyleSelectModal
          category={activeLifestyleCategory}
          isOpen={Boolean(activeLifestyleCategory)}
          onClose={() => setActiveLifestyleCategory(null)}
          currentValue={
            activeLifestyleCategory === 'languages' 
              ? discovery.preferredLanguages 
              : ((userAttributes.lifestyle as any)[activeLifestyleCategory] || (userAttributes.essentials as any)[activeLifestyleCategory] || '')
          }
          onSave={handleLifestyleSave}
        />
      )}

      {/* Feature Glossary Modal */}
      <FeatureGlossaryModal
        isOpen={isGlossaryOpen}
        onClose={() => setIsGlossaryOpen(false)}
      />

      {/* What's New Modal */}
      <WhatsNewModal
        isOpen={isWhatsNewOpen}
        onClose={() => setIsWhatsNewOpen(false)}
        onNavigateToTab={onNavigateToTab}
      />

      {/* Delete Account Confirmation Dialog */}
      {isDeleteConfirmOpen && (
        <GlassModal
          isOpen={isDeleteConfirmOpen}
          onClose={() => setIsDeleteConfirmOpen(false)}
          title="Delete Soulverse Account"
          maxWidth="sm"
        >
          <div className="space-y-4">
            <p className="text-xs text-zinc-300 leading-relaxed">
              Are you sure you want to permanently delete your Soulverse profile? This action is irreversible. All local keys, encrypted relationship notes, and match history will be wiped.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <GlassButton variant="subtle" onClick={() => setIsDeleteConfirmOpen(false)} className="text-xs py-1.5 px-3">
                Cancel
              </GlassButton>
              <button
                onClick={() => {
                  localStorage.clear();
                  window.location.reload();
                }}
                className="px-4 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-all cursor-pointer"
              >
                Permanently Delete
              </button>
            </div>
          </div>
        </GlassModal>
      )}
    </>
  );
};
