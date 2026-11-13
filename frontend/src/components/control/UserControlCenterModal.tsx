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
  FileText
} from 'lucide-react';
import { GlassModal, GlassButton, GlassPrimaryButton } from '../klyven';
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
import { FeatureDetailModal } from './FeatureDetailModal';

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
  
  // Library search and filter
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | FeatureCategory>('all');
  
  // Feature detail inspector
  const [inspectedFeature, setInspectedFeature] = useState<EvaluatedFeature | null>(null);

  // Notifications & Quiet mode local state
  const [isQuietMode, setIsQuietMode] = useState(false);
  const [globalAiEnabled, setGlobalAiEnabled] = useState(true);

  // Import/Export feedback
  const [exportSuccess, setExportSuccess] = useState(false);
  const [importFeedback, setImportFeedback] = useState<string | null>(null);

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

  // Calculate configuration completion percentage
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
    a.download = `soulverse-personal-architecture-${new Date().toISOString().slice(0, 10)}.json`;
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
    { id: 'social' as ControlSection, label: 'Social Discovery', icon: Users },
    { id: 'notifications' as ControlSection, label: 'Notifications & Quiet', icon: Bell },
    { id: 'appearance' as ControlSection, label: 'Appearance & Glass', icon: Palette },
    { id: 'ai' as ControlSection, label: 'AI & Intelligence', icon: Cpu },
    { id: 'safety' as ControlSection, label: 'Safety & 1926 Safe', icon: Lock },
    { id: 'accessibility' as ControlSection, label: 'Accessibility', icon: Info },
    { id: 'data' as ControlSection, label: 'Data & Architecture', icon: Download }
  ];

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-2 sm:p-4 animate-fadeIn">
        <div className="w-full max-w-5xl h-[92vh] dark-glass border border-white/15 rounded-3xl shadow-[0_25px_80px_rgba(0,0,0,0.9)] flex flex-col overflow-hidden relative">
          
          {/* Top Bar */}
          <div className="h-16 border-b border-white/10 px-4 sm:px-6 flex items-center justify-between shrink-0 bg-white/[0.02]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-white shadow-inner">
                <Sliders className="w-4 h-4 text-zinc-200" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white font-serif tracking-tight">
                  My App Control Center
                </h3>
                <p className="text-[11px] text-zinc-400">
                  Everything available. Nothing forced. Everything understandable.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Setup completion indicator */}
              <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-zinc-300">
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
                <div className="space-y-6">
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
                        onClick={() => setIsQuietMode(!isQuietMode)}
                        className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                          isQuietMode ? 'bg-white' : 'bg-white/15'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded-full transition-transform ${
                          isQuietMode ? 'translate-x-6 bg-[#090A0E]' : 'translate-x-1 bg-white'
                        }`} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03]">
                      <div>
                        <span className="text-xs font-bold text-white block">Global AI Assistant</span>
                        <span className="text-[11px] text-zinc-400">Master switch for proactive conversational hints</span>
                      </div>
                      <button
                        onClick={() => setGlobalAiEnabled(!globalAiEnabled)}
                        className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                          globalAiEnabled ? 'bg-white' : 'bg-white/15'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded-full transition-transform ${
                          globalAiEnabled ? 'translate-x-6 bg-[#090A0E]' : 'translate-x-1 bg-white'
                        }`} />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 2: MASTER FEATURE LIBRARY */}
              {activeSection === 'library' && (
                <div className="space-y-4">
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
                      const reg = registry.find(r => r.id === feat.id);
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
                            {/* Inspect Detail Button */}
                            <GlassButton
                              variant="subtle"
                              onClick={() => setInspectedFeature(feat)}
                              className="text-xs py-1 px-2.5 text-zinc-300 hover:text-white"
                              title="Inspect full feature specification & data policy"
                            >
                              <Info className="w-3.5 h-3.5 mr-1" />
                              Details
                            </GlassButton>

                            {/* Visibility Eye Toggle */}
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

                            {/* State Toggle Switch */}
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

              {/* SECTION 3: PRIVACY CENTER */}
              {activeSection === 'privacy' && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-serif font-bold text-white tracking-tight">
                      Privacy Center & Data Clearances
                    </h3>
                    <p className="text-xs text-zinc-400 leading-relaxed mt-0.5">
                      Control who can see your presence and which modules are strictly encrypted locally.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl dark-glass border border-white/10 space-y-3">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                      Discovery Visibility Modes
                    </h4>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div className="p-3 rounded-xl bg-white/[0.04] border border-white/15 space-y-1">
                        <span className="font-bold text-xs text-white block">Standard Mode</span>
                        <p className="text-[11px] text-zinc-400">Discoverable in mutual feeds and circles.</p>
                      </div>

                      <div className="p-3 rounded-xl bg-white/[0.04] border border-white/15 space-y-1">
                        <span className="font-bold text-xs text-amber-300 block">Incognito PLUS</span>
                        <p className="text-[11px] text-zinc-400">Only people you have explicitly liked can see you.</p>
                      </div>

                      <div className="p-3 rounded-xl bg-white/[0.04] border border-white/15 space-y-1">
                        <span className="font-bold text-xs text-zinc-300 block">Ghost Sanctuary</span>
                        <p className="text-[11px] text-zinc-400">Invisible in all public feeds. Private messaging only.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 12: DATA, BACKUPS & STORAGE */}
              {activeSection === 'data' && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-serif font-bold text-white tracking-tight">
                      Data Portability & Architectural Backup
                    </h3>
                    <p className="text-xs text-zinc-400 leading-relaxed mt-0.5">
                      Export your complete configuration as a portable JSON file or restore from a previously saved architecture.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl dark-glass border border-white/10 space-y-3">
                      <Download className="w-5 h-5 text-zinc-300" />
                      <div>
                        <h4 className="text-xs font-bold text-white">Export Configuration</h4>
                        <p className="text-[11px] text-zinc-400 mt-0.5">
                          Download personal feature preferences, visible toggles, and active presets.
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
                </div>
              )}

              {/* FALLBACK FOR OTHER SECTION TABS */}
              {['relationships', 'identities', 'social', 'notifications', 'appearance', 'ai', 'safety', 'accessibility'].includes(activeSection) && (
                <div className="p-6 rounded-3xl dark-glass border border-white/10 space-y-4">
                  <div className="flex items-center gap-2">
                    <Info className="w-5 h-5 text-zinc-300" />
                    <h3 className="text-base font-serif font-bold text-white capitalize">
                      {activeSection} Configuration
                    </h3>
                  </div>
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    Granular settings for <span className="font-bold text-white">{activeSection}</span> are unified under your active preset (<span className="text-emerald-400 font-mono">{activePreset}</span>). You can selectively adjust these module switches in the <button onClick={() => setActiveSection('library')} className="underline text-white font-bold">Features & Modules</button> tab.
                  </p>
                </div>
              )}

            </main>
          </div>

          {/* Bottom Bar */}
          <div className="h-14 border-t border-white/10 px-4 sm:px-6 flex items-center justify-between shrink-0 bg-white/[0.02]">
            <span className="text-[11px] text-zinc-500 font-mono">
              Soulverse Control Layer v1.0 • Universal Feature Specification
            </span>
            <GlassButton variant="primary" onClick={onClose} className="text-xs py-1.5 px-4">
              Close Control Center
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
    </>
  );
};
