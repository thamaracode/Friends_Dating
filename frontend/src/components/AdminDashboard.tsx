import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Users, 
  CheckCircle2, 
  AlertTriangle, 
  TrendingUp, 
  Lock, 
  Download, 
  Search, 
  Clock, 
  ShieldCheck, 
  UserCheck, 
  Music, 
  Play, 
  Compass, 
  Sliders, 
  Sparkles, 
  Globe2, 
  Settings, 
  Trash2, 
  Plus, 
  Server, 
  Activity, 
  Heart, 
  UserX, 
  Flag, 
  Check,
  Network,
  Code,
  Key,
  Layers,
  RotateCcw,
  Database,
  ArrowRight,
  Save,
  CheckSquare,
  FileJson,
  DollarSign,
  History,
  Cpu,
  Quote as QuoteIcon
} from 'lucide-react';
import { MOCK_PROFILES } from '../mockData';
import { useSpotifyMusic, CURATED_SPOTIFY_PRESETS, SpotifyPreset } from '../context/SpotifyMusicContext';
import { 
  loadDiscoverySettings, 
  saveDiscoverySettings, 
  loadUserAttributes, 
  FullUserAttributes, 
  DiscoverySettings 
} from '../types/tinderFeatures';
import { GlassModal, GlassButton, GlassPrimaryButton } from './klyven';
import { FeatureControlService } from '../services/featureControlService';
import type { AdminFeature, AuditLogEntry, FeatureAdoptionStat } from '../types/featureControl';
import { byoaiService } from '../services/byoaiService';
import { quoteService } from '../services/quoteService';
import type { AdminQuoteProvider, Quote, QuoteCategoryKey } from '../types/quotes';
import { QUOTE_CATEGORIES } from '../types/quotes';

export const AdminDashboard: React.FC = () => {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<
    'overview' | 'users' | 'discovery' | 'music' | 'safety' | 'worlds' | 'system'
  >('overview');

  // Spotify Context for previewing music in admin
  const { linkSpotify } = useSpotifyMusic();

  // Search & Filter States
  const [userSearch, setUserSearch] = useState('');
  const [userFilter, setUserFilter] = useState<'all' | 'verified' | 'unverified'>('all');
  const [selectedUser, setSelectedUser] = useState<typeof MOCK_PROFILES[0] | null>(null);
  const [_userAttributes] = useState<FullUserAttributes>(loadUserAttributes);

  // Discovery Controls State
  const [discoverySettings, setDiscoverySettings] = useState<DiscoverySettings>(loadDiscoverySettings);
  const [matchingWeights, setMatchingWeights] = useState({
    hcmScore: 40,
    valuesOverlap: 25,
    interestsOverlap: 20,
    proximityFactor: 15
  });

  // The Control Layer (Feature Flags & Rollout Engine State)
  const [adminFeatures, setAdminFeatures] = useState<AdminFeature[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [adoptionStats, setAdoptionStats] = useState<FeatureAdoptionStat[]>([]);
  const [systemSubTab, setSystemSubTab] = useState<
    'flags' | 'dependencies' | 'config' | 'rbac' | 'subscriptions' | 'versions' | 'audit' | 'analytics' | 'ops' | 'ai' | 'quotes'
  >('flags');

  // Quotes Sanctuary & Wisdom Library Admin State
  const [quoteProviders, setQuoteProviders] = useState<AdminQuoteProvider[]>([]);
  const [adminQuotes, setAdminQuotes] = useState<Quote[]>([]);
  const [adminQuotesTotal, setAdminQuotesTotal] = useState(0);
  const [adminQuoteCategory, setAdminQuoteCategory] = useState<string>('all');
  const [adminQuoteSearch, setAdminQuoteSearch] = useState('');
  const [adminQuoteVerifiedFilter, setAdminQuoteVerifiedFilter] = useState<'all' | 'verified' | 'unverified'>('all');
  const [adminQuotePage, setAdminQuotePage] = useState(1);
  const [isFetchingQuoteBatch, setIsFetchingQuoteBatch] = useState<string | null>(null);
  const [isDeduplicatingQuotes, setIsDeduplicatingQuotes] = useState(false);
  const [isAddQuoteModalOpen, setIsAddQuoteModalOpen] = useState(false);
  const [newQuoteData, setNewQuoteData] = useState({
    text: '',
    author: '',
    category: 'love_romance' as QuoteCategoryKey,
    tags: '',
    attribution: '',
    sourceUrl: ''
  });
  const [assignDailyQuoteModal, setAssignDailyQuoteModal] = useState<{
    quote: Quote | null;
    dateStr: string;
    reflectionQuestion: string;
  } | null>(null);
  const [aiInfra, setAiInfra] = useState<{
    providers: any[];
    telemetry: any;
    models: any[];
  } | null>(null);
  const [isLoadingAiInfra, setIsLoadingAiInfra] = useState(false);
  const [killModalFeature, setKillModalFeature] = useState<AdminFeature | null>(null);
  const [killReason, setKillReason] = useState('');
  const [rolloutModalFeature, setRolloutModalFeature] = useState<AdminFeature | null>(null);
  const [rolloutPercentageInput, setRolloutPercentageInput] = useState(100);
  const [rolloutReason, setRolloutReason] = useState('');

  // Dependency DAG Graph State
  const [dependencyGraph, setDependencyGraph] = useState<any[]>([]);
  const [testDepSource, setTestDepSource] = useState('feat_dating');
  const [testDepTarget, setTestDepTarget] = useState('feat_spotify_ambient');
  const [cycleCheckResult, setCycleCheckResult] = useState<any>(null);

  // Remote Config JSON Tuner State
  const [selectedConfigFeature, setSelectedConfigFeature] = useState<string>('feat_dating');
  const [customConfigJson, setCustomConfigJson] = useState('{\n  "max_daily_likes": 100,\n  "superlike_cooldown_hours": 24\n}');
  const [configSaveStatus, setConfigSaveStatus] = useState<string | null>(null);

  // RBAC Roles State
  const [adminRoles, setAdminRoles] = useState<any[]>([]);
  const [assignRoleUserId, setAssignRoleUserId] = useState('usr_me');
  const [assignRoleId, setAssignRoleId] = useState('super_admin');
  const [assignRoleStatus, setAssignRoleStatus] = useState<string | null>(null);

  // Subscription Entitlements State
  const [subscriptionData, setSubscriptionData] = useState<{ tiers: any[]; matrix: any[] }>({ tiers: [], matrix: [] });

  // Configuration Versions State
  const [configVersions, setConfigVersions] = useState<any[]>([]);
  const [newSnapshotSummary, setNewSnapshotSummary] = useState('');
  const [rollbackVersionId, setRollbackVersionId] = useState<string | null>(null);
  const [rollbackReason, setRollbackReason] = useState('');

  // System Ops State
  const [opsFeedback, setOpsFeedback] = useState<string | null>(null);

  // Fetch live backend feature management data
  const refreshAdminControlLayer = () => {
    FeatureControlService.getAdminFeatures().then(setAdminFeatures).catch(console.error);
    FeatureControlService.getAuditLogs().then(setAuditLogs).catch(console.error);
    FeatureControlService.getAdoptionStats().then(setAdoptionStats).catch(console.error);
    FeatureControlService.getDependencyGraph().then(setDependencyGraph).catch(console.error);
    FeatureControlService.getAdminRoles().then(setAdminRoles).catch(console.error);
    FeatureControlService.getSubscriptionEntitlements().then(setSubscriptionData).catch(console.error);
    FeatureControlService.getConfigurationVersions().then(setConfigVersions).catch(console.error);
  };

  const loadAiInfrastructure = async () => {
    setIsLoadingAiInfra(true);
    try {
      const data = await byoaiService.getAdminInfrastructure();
      setAiInfra(data);
    } catch (e) {
      console.error('Failed to load AI infrastructure', e);
    } finally {
      setIsLoadingAiInfra(false);
    }
  };

  const loadAdminQuotesData = async () => {
    try {
      const [provs, qData] = await Promise.all([
        quoteService.adminGetProviders(),
        quoteService.adminGetQuotes({
          category: adminQuoteCategory === 'all' ? undefined : adminQuoteCategory,
          search: adminQuoteSearch.trim() || undefined,
          isVerified: adminQuoteVerifiedFilter === 'all' ? undefined : (adminQuoteVerifiedFilter === 'verified'),
          page: adminQuotePage,
          limit: 20
        })
      ]);
      setQuoteProviders(provs);
      setAdminQuotes(qData.quotes || []);
      setAdminQuotesTotal(qData.total || 0);
    } catch (e) {
      console.error('Failed to load admin quotes data', e);
    }
  };

  const handleToggleQuoteProvider = async (providerId: string, currentEnabled: boolean) => {
    try {
      await quoteService.adminUpdateProvider(providerId, { isEnabled: !currentEnabled });
      showToast(`Provider ${providerId} ${!currentEnabled ? 'enabled' : 'disabled'}`);
      loadAdminQuotesData();
    } catch (e: any) {
      showToast(e.message || 'Failed to update provider');
    }
  };

  const handleFetchQuoteBatch = async (providerId: string) => {
    setIsFetchingQuoteBatch(providerId);
    try {
      const res = await quoteService.adminFetchProviderBatch(providerId, 30);
      showToast(`Successfully ingested ${res.inserted} new quotes from ${providerId}!`);
      loadAdminQuotesData();
    } catch (e: any) {
      showToast(e.message || 'Batch fetch failed');
    } finally {
      setIsFetchingQuoteBatch(null);
    }
  };

  const handleDeduplicateQuotes = async () => {
    setIsDeduplicatingQuotes(true);
    try {
      const res = await quoteService.adminDeduplicate();
      showToast(`Deduplication complete. Removed ${res.removedCount} duplicate quotes.`);
      loadAdminQuotesData();
    } catch (e: any) {
      showToast(e.message || 'Deduplication failed');
    } finally {
      setIsDeduplicatingQuotes(false);
    }
  };

  const handleDeleteAdminQuote = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this quote?')) return;
    try {
      await quoteService.adminDeleteQuote(id);
      showToast('Quote deleted successfully.');
      loadAdminQuotesData();
    } catch (e: any) {
      showToast(e.message || 'Failed to delete quote');
    }
  };

  const handleToggleVerifyQuote = async (quote: Quote) => {
    try {
      const next = !quote.isVerified;
      await quoteService.adminUpdateQuote(quote.id, { isVerified: next });
      showToast(`Quote marked as ${next ? 'Verified' : 'Unverified'}.`);
      loadAdminQuotesData();
    } catch (e: any) {
      showToast(e.message || 'Failed to update verification status');
    }
  };

  const handleCreateNewQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuoteData.text.trim() || !newQuoteData.author.trim()) {
      showToast('Quote text and author are required.');
      return;
    }
    try {
      const tagsArray = newQuoteData.tags
        .split(',')
        .map(t => t.trim().toLowerCase())
        .filter(Boolean);
      await quoteService.adminCreateQuote({
        text: newQuoteData.text.trim(),
        author: newQuoteData.author.trim(),
        category: newQuoteData.category,
        tags: tagsArray,
        attribution: newQuoteData.attribution.trim() || undefined,
        sourceUrl: newQuoteData.sourceUrl.trim() || undefined
      });
      showToast('New wisdom quote added to the Sanctuary library!');
      setIsAddQuoteModalOpen(false);
      setNewQuoteData({
        text: '',
        author: '',
        category: 'love_romance' as QuoteCategoryKey,
        tags: '',
        attribution: '',
        sourceUrl: ''
      });
      loadAdminQuotesData();
    } catch (e: any) {
      showToast(e.message || 'Failed to create quote');
    }
  };

  const handleConfirmDailyQuote = async () => {
    if (!assignDailyQuoteModal || !assignDailyQuoteModal.quote) return;
    try {
      await quoteService.adminSetDailyQuote(
        assignDailyQuoteModal.dateStr,
        assignDailyQuoteModal.quote.id,
        assignDailyQuoteModal.reflectionQuestion.trim() || undefined
      );
      showToast(`Quote locked as Featured Daily for ${assignDailyQuoteModal.dateStr}!`);
      setAssignDailyQuoteModal(null);
    } catch (e: any) {
      showToast(e.message || 'Failed to set daily quote');
    }
  };

  React.useEffect(() => {
    if (activeTab === 'system') {
      refreshAdminControlLayer();
      if (systemSubTab === 'ai') {
        loadAiInfrastructure();
      }
      if (systemSubTab === 'quotes') {
        loadAdminQuotesData();
      }
    }
  }, [activeTab, systemSubTab, adminQuoteCategory, adminQuoteVerifiedFilter, adminQuotePage]);

  // Music Presets Admin State
  const [presets, setPresets] = useState<SpotifyPreset[]>(CURATED_SPOTIFY_PRESETS);
  const [newPresetTitle, setNewPresetTitle] = useState('');
  const [newPresetArtist, setNewPresetArtist] = useState('');
  const [newPresetCategory, setNewPresetCategory] = useState('Ambient Sanctuary');
  const [newPresetUrl, setNewPresetUrl] = useState('');
  const [isAddPresetModalOpen, setIsAddPresetModalOpen] = useState(false);

  // Verifications & Moderation Incidents State
  const [verifications, setVerifications] = useState([
    {
      id: 'ver-101',
      user: 'Dinuk Fernando',
      handle: '@dinuk',
      submittedAt: '12 mins ago',
      type: 'Liveness Selfie + Gov ID',
      matchScore: '98.4%',
      status: 'pending',
      photoUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200'
    },
    {
      id: 'ver-102',
      user: 'Senuri Wijesinghe',
      handle: '@senuri_w',
      submittedAt: '45 mins ago',
      type: 'Video Greeting Check',
      matchScore: '94.1%',
      status: 'pending',
      photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200'
    },
    {
      id: 'ver-103',
      user: 'Malik Fernando',
      handle: '@malik_f',
      submittedAt: '2 hours ago',
      type: 'Liveness Gesture Check',
      matchScore: '89.2%',
      status: 'pending',
      photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200'
    }
  ]);

  const [incidents, setIncidents] = useState([
    {
      id: 'rep-88',
      reporter: 'Anonymous User #402',
      reportedUser: 'Suspicious Profile #991',
      reason: 'Possible Catfishing / External Telegram scam link redirection',
      severity: 'high',
      status: 'review_required',
      timestamp: '42 mins ago'
    },
    {
      id: 'rep-89',
      reporter: 'Alex Rivera',
      reportedUser: 'Inappropriate DM spam #204',
      reason: 'Harassment after connection rejection',
      severity: 'medium',
      status: 'review_required',
      timestamp: '2 hours ago'
    }
  ]);

  // 1926 Safety Crisis Dispatch Logs
  const [crisisLogs] = useState([
    {
      id: 'crs-501',
      user: 'Confidential Member #108',
      triggeredAt: 'Today, 03:14 AM',
      hotlineCalled: '1926 (NIMH Sri Lanka)',
      status: 'Resolved & Monitored',
      followUpScheduled: true
    },
    {
      id: 'crs-502',
      user: 'Confidential Member #214',
      triggeredAt: 'Yesterday, 11:22 PM',
      hotlineCalled: '1926 (NIMH Sri Lanka)',
      status: 'Safety Plan Provided',
      followUpScheduled: false
    }
  ]);

  // Profile Worlds Administration
  const [adminWorlds, setAdminWorlds] = useState([
    { id: 'wld_real', name: 'The Architect\'s Journal', owner: 'Kavindu Senanayake', visibility: 'public', isFeatured: true, storiesCount: 14 },
    { id: 'wld_cinematic', name: 'Neon Monolith: Act I', owner: 'Alex Rivera', visibility: 'public', isFeatured: true, storiesCount: 22 },
    { id: 'wld_inner', name: 'Sanctuary of Silent Thought', owner: 'Tara Perera', visibility: 'friends', isFeatured: false, storiesCount: 9 },
    { id: 'wld_future', name: 'The 2030 Sovereign Horizon', owner: 'Dinuk Fernando', visibility: 'public', isFeatured: false, storiesCount: 16 }
  ]);

  // System Feature Flags
  const [featureFlags, setFeatureFlags] = useState({
    spotifyPlayerEnabled: true,
    incognitoModeEnabled: true,
    crisis1926HotlineEnabled: true,
    globalDiscoveryEnabled: true,
    telegramLuckEmojiGames: true,
    automatedCatfishFilter: true
  });

  // Global System Announcement Banner
  const [announcementText, setAnnouncementText] = useState('✧ Soulverse v7.42.1 Live: Integrated Spotify Music Player & Discovery Intelligence.');
  const [isAnnouncementActive, setIsAnnouncementActive] = useState(true);
  const [actionSuccessToast, setActionSuccessToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setActionSuccessToast(msg);
    setTimeout(() => setActionSuccessToast(null), 2500);
  };

  const handleApproveVerification = (id: string) => {
    setVerifications(prev => prev.map(v => v.id === id ? { ...v, status: 'approved' } : v));
    showToast('Badge approved and user verified.');
  };

  const handleRejectVerification = (id: string) => {
    setVerifications(prev => prev.map(v => v.id === id ? { ...v, status: 'rejected' } : v));
    showToast('Verification rejected.');
  };

  const handleResolveIncident = (id: string) => {
    setIncidents(prev => prev.filter(i => i.id !== id));
    showToast('Incident marked resolved.');
  };

  const handleBanReportedUser = (id: string) => {
    setIncidents(prev => prev.filter(i => i.id !== id));
    showToast('User suspended and removed from discovery.');
  };

  const handleToggleWorldFeatured = (worldId: string) => {
    setAdminWorlds(prev => prev.map(w => w.id === worldId ? { ...w, isFeatured: !w.isFeatured } : w));
    showToast('World showcase status updated.');
  };

  const handleAddPreset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPresetTitle || !newPresetUrl) return;

    const newPreset: SpotifyPreset = {
      id: `preset_${Date.now()}`,
      type: newPresetUrl.includes('playlist') ? 'playlist' : 'track',
      title: newPresetTitle,
      artist: newPresetArtist || 'Curated Soundscape',
      category: newPresetCategory,
      coverUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=300&auto=format&fit=crop&q=80',
      spotifyUrl: newPresetUrl,
      embedUrl: `https://open.spotify.com/embed/track/4cOdK2wGLETKBW3PvgPWqT?utm_source=generator&theme=0`,
      description: 'Admin-curated sanctuary audio.'
    };

    setPresets([newPreset, ...presets]);
    setIsAddPresetModalOpen(false);
    setNewPresetTitle('');
    setNewPresetArtist('');
    setNewPresetUrl('');
    showToast(`Added "${newPresetTitle}" to Spotify Presets!`);
  };

  const filteredUsers = MOCK_PROFILES.filter(u => {
    if (userSearch.trim()) {
      const q = userSearch.toLowerCase();
      const matchName = u.name.toLowerCase().includes(q);
      const matchLoc = (u.location || '').toLowerCase().includes(q);
      const matchIntent = u.intent.toLowerCase().includes(q);
      if (!matchName && !matchLoc && !matchIntent) return false;
    }
    if (userFilter === 'verified' && !u.verifications?.photoVerified) return false;
    if (userFilter === 'unverified' && u.verifications?.photoVerified) return false;
    return true;
  });

  return (
    <div className="w-full space-y-6 animate-fadeIn pb-24 max-w-6xl mx-auto">
      
      {/* 1. TOP HEADER & CONFIDENTIAL RBAC BADGE */}
      <div className="p-6 rounded-3xl dark-glass border border-white/[0.08] shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/10 border border-white/20 text-xs font-semibold text-zinc-200 mb-1.5">
            <Lock className="w-3.5 h-3.5 text-zinc-300" />
            <span>CONFIDENTIAL ADMIN & TRUST SANCTUARY • RBAC LEVEL 4</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white font-serif tracking-tight">
            Soulverse Master Operations & Governance
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Real-time telemetry, user management, discovery parameters, Spotify engine, and trust triage.
          </p>
        </div>

        {/* Global Announcement Switcher */}
        <div className="flex items-center gap-2 p-2 rounded-2xl bg-white/[0.03] border border-white/10 shrink-0">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${isAnnouncementActive ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]' : 'bg-zinc-600'}`} />
            <span className="text-[11px] font-bold text-zinc-300">Global Broadcast</span>
          </div>
          <button
            onClick={() => setIsAnnouncementActive(!isAnnouncementActive)}
            className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${
              isAnnouncementActive ? 'bg-white' : 'bg-black/60 border border-white/20'
            }`}
          >
            <div className={`w-3.5 h-3.5 rounded-full transition-transform absolute top-0.5 ${
              isAnnouncementActive ? 'left-5 bg-[#090A0E]' : 'left-1 bg-white'
            }`} />
          </button>
        </div>
      </div>

      {/* Action Toast Feedback */}
      {actionSuccessToast && (
        <div className="p-3 rounded-2xl bg-white/15 border border-white/30 text-xs text-white font-bold flex items-center gap-2 shadow-2xl animate-slideUp">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{actionSuccessToast}</span>
        </div>
      )}

      {/* 2. ADMIN NAVIGATION TABS */}
      <div className="flex items-center gap-1.5 p-1.5 rounded-2xl dark-glass border border-white/10 overflow-x-auto no-scrollbar text-xs">
        {[
          { id: 'overview', label: 'Overview Telemetry', icon: Activity },
          { id: 'users', label: 'User & Profile Mgmt', icon: Users, badge: `${MOCK_PROFILES.length}` },
          { id: 'discovery', label: 'Discovery Engine', icon: Compass },
          { id: 'music', label: 'Spotify & Anthems', icon: Music, badge: `${presets.length}` },
          { id: 'safety', label: 'Safety & 1926 Queue', icon: ShieldAlert, badge: `${incidents.length + verifications.filter(v => v.status === 'pending').length}` },
          { id: 'worlds', label: 'Profile Worlds', icon: Globe2, badge: `${adminWorlds.length}` },
          { id: 'system', label: 'Feature Flags & Config', icon: Settings }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`py-2 px-3.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 ${
                isActive
                  ? 'bg-white text-[#090A0E] shadow-md'
                  : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              {tab.badge && (
                <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full ${
                  isActive ? 'bg-[#090A0E] text-white' : 'bg-white/10 text-zinc-300'
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ===================================================================== */}
      {/* SECTION 1: OVERVIEW TELEMETRY & SYSTEM HEALTH                         */}
      {/* ===================================================================== */}
      {activeTab === 'overview' && (
        <div className="space-y-6 animate-fadeIn">
          
          {/* North Star Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-3xl dark-glass border border-white/10 shadow-lg space-y-1">
              <div className="flex items-center justify-between text-xs text-zinc-400">
                <span className="font-semibold">Registered Humans</span>
                <Users className="w-4 h-4 text-zinc-300" />
              </div>
              <div className="text-2xl font-black text-white font-mono">14,820</div>
              <p className="text-[11px] text-emerald-400 font-semibold">↑ +12.4% this week</p>
            </div>

            <div className="p-5 rounded-3xl dark-glass border border-white/10 shadow-lg space-y-1">
              <div className="flex items-center justify-between text-xs text-zinc-400">
                <span className="font-semibold">Verified Real Identity</span>
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-black text-white font-mono">91.8%</div>
              <p className="text-[11px] text-zinc-400">Liveness & photo gate</p>
            </div>

            <div className="p-5 rounded-3xl dark-glass border border-white/10 shadow-lg space-y-1">
              <div className="flex items-center justify-between text-xs text-zinc-400">
                <span className="font-semibold">Weekly Meaningful Connections</span>
                <Heart className="w-4 h-4 text-zinc-300" />
              </div>
              <div className="text-2xl font-black text-white font-mono">2,840</div>
              <p className="text-[11px] text-emerald-400 font-semibold">Zero-swipe retention</p>
            </div>

            <div className="p-5 rounded-3xl dark-glass border border-white/10 shadow-lg space-y-1">
              <div className="flex items-center justify-between text-xs text-zinc-400">
                <span className="font-semibold">Spotify Anthems Linked</span>
                <Music className="w-4 h-4 text-[#1DB954]" />
              </div>
              <div className="text-2xl font-black text-white font-mono">6,219</div>
              <p className="text-[11px] text-zinc-400">Audio stream active</p>
            </div>
          </div>

          {/* Infrastructure Health & Live Server Telemetry */}
          <div className="p-5 rounded-3xl dark-glass border border-white/10 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4 text-zinc-300" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Live Infrastructure & Daemon Telemetry
                </h3>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                All Systems Operational
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1">
                <span className="text-[10px] text-zinc-400 uppercase font-semibold">Backend API Server</span>
                <div className="font-bold text-white flex items-center justify-between">
                  <span>http://127.0.0.1:3001</span>
                  <span className="text-emerald-400 font-mono">200 OK (22ms)</span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1">
                <span className="text-[10px] text-zinc-400 uppercase font-semibold">Frontend Vite Client</span>
                <div className="font-bold text-white flex items-center justify-between">
                  <span>http://127.0.0.1:5173</span>
                  <span className="text-emerald-400 font-mono">200 OK (1.2s Build)</span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1">
                <span className="text-[10px] text-zinc-400 uppercase font-semibold">Active SQLite Database</span>
                <div className="font-bold text-white flex items-center justify-between">
                  <span>soulverse.sqlite</span>
                  <span className="text-zinc-300 font-mono">46 Tables / 42 MB</span>
                </div>
              </div>
            </div>
          </div>

          {/* Broadcast Announcement Editor */}
          <div className="p-5 rounded-3xl dark-glass border border-white/10 shadow-lg space-y-3">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
              Active Global Banner Broadcast
            </span>
            <div className="flex gap-2">
              <input
                type="text"
                value={announcementText}
                onChange={e => setAnnouncementText(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs placeholder-zinc-500"
              />
              <button
                onClick={() => showToast('Global banner broadcast updated across all connected clients!')}
                className="px-4 py-2 rounded-xl gray-glass-btn text-xs font-bold text-white cursor-pointer shrink-0"
              >
                Update Banner
              </button>
            </div>
          </div>

        </div>
      )}

      {/* ===================================================================== */}
      {/* SECTION 2: USER & PROFILE MANAGEMENT                                 */}
      {/* ===================================================================== */}
      {activeTab === 'users' && (
        <div className="space-y-4 animate-fadeIn">
          
          {/* Controls & Filter Bar */}
          <div className="p-4 rounded-3xl dark-glass border border-white/10 shadow-lg flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                value={userSearch}
                onChange={e => setUserSearch(e.target.value)}
                placeholder="Search by name, location, or intent..."
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs placeholder-zinc-500"
              />
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5 pointer-events-none" />
            </div>

            <div className="flex items-center gap-1.5 text-xs">
              {(['all', 'verified', 'unverified'] as const).map(filter => (
                <button
                  key={filter}
                  onClick={() => setUserFilter(filter)}
                  className={`px-3 py-1.5 rounded-xl font-bold capitalize transition-all cursor-pointer ${
                    userFilter === filter
                      ? 'bg-white text-[#090A0E]'
                      : 'bg-white/[0.03] text-zinc-400 hover:text-white'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {/* User Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {filteredUsers.map(u => (
              <div
                key={u.id}
                className="p-4 rounded-3xl dark-glass border border-white/10 shadow-lg flex items-start justify-between gap-3 hover:border-white/20 transition-all"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <img
                    src={u.avatar}
                    alt={u.name}
                    className="w-12 h-12 rounded-2xl object-cover border border-white/15 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-xs font-bold text-white truncate">{u.name}, {u.age}</h4>
                      {u.verifications?.photoVerified && (
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      )}
                    </div>
                    <p className="text-[10px] text-zinc-400 truncate">{u.location || 'Colombo'}</p>
                    <div className="flex items-center gap-1.5 pt-1.5">
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-white/10 text-zinc-200">
                        {u.intent}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-mono text-zinc-400 bg-black/40">
                        {u.compatibilityScore || 88}% HCM
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedUser(u)}
                  className="px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/15 text-white text-xs font-bold transition-colors cursor-pointer shrink-0"
                >
                  Inspect User
                </button>
              </div>
            ))}
          </div>

          {/* Inspect User Modal Drawer */}
          {selectedUser && (
            <GlassModal
              isOpen={Boolean(selectedUser)}
              onClose={() => setSelectedUser(null)}
              title={`Admin Inspector: ${selectedUser.name}`}
              maxWidth="lg"
            >
              <div className="space-y-4 text-xs">
                <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-white/[0.04] border border-white/10">
                  <img
                    src={selectedUser.avatar}
                    alt={selectedUser.name}
                    className="w-14 h-14 rounded-2xl object-cover border border-white/20 shrink-0"
                  />
                  <div>
                    <h3 className="text-sm font-bold text-white">{selectedUser.name}, {selectedUser.age}</h3>
                    <p className="text-[11px] text-zinc-400">@{selectedUser.username} • Account ID: {selectedUser.id}</p>
                    <p className="text-[11px] text-zinc-300 mt-1 italic">"{selectedUser.tagline || selectedUser.headline}"</p>
                  </div>
                </div>

                {/* Attributes Table */}
                <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 space-y-2">
                  <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider block">Profile Essentials</span>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div><span className="text-zinc-500">Location:</span> <span className="text-zinc-200 font-semibold">{selectedUser.location}</span></div>
                    <div><span className="text-zinc-500">Status:</span> <span className="text-zinc-200 font-semibold">{selectedUser.status || 'Active Member'}</span></div>
                    <div><span className="text-zinc-500">Intent:</span> <span className="text-zinc-200 font-semibold">{selectedUser.intent}</span></div>
                    <div><span className="text-zinc-500">Languages:</span> <span className="text-zinc-200 font-semibold">{selectedUser.languages.join(', ')}</span></div>
                  </div>
                </div>

                {/* Admin Override Actions */}
                <div className="flex flex-wrap gap-2 pt-2 border-t border-white/10">
                  <button
                    onClick={() => {
                      showToast(`Verified badge granted to ${selectedUser.name}!`);
                      setSelectedUser(null);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Grant Verified Badge</span>
                  </button>

                  <button
                    onClick={() => {
                      showToast(`Sanctuary VIP tier granted to ${selectedUser.name}!`);
                      setSelectedUser(null);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-zinc-300" />
                    <span>Grant Sanctuary VIP</span>
                  </button>

                  <button
                    onClick={() => {
                      showToast(`Strike issued to ${selectedUser.name}.`);
                      setSelectedUser(null);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Issue Strike</span>
                  </button>

                  <button
                    onClick={() => {
                      showToast(`User ${selectedUser.name} suspended from Discovery.`);
                      setSelectedUser(null);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 font-bold text-xs flex items-center gap-1.5 cursor-pointer ml-auto"
                  >
                    <UserX className="w-3.5 h-3.5" />
                    <span>Suspend User</span>
                  </button>
                </div>
              </div>
            </GlassModal>
          )}

        </div>
      )}

      {/* ===================================================================== */}
      {/* SECTION 3: DISCOVERY & MATCHING ENGINE TUNER                          */}
      {/* ===================================================================== */}
      {activeTab === 'discovery' && (
        <div className="space-y-4 animate-fadeIn">
          
          <div className="p-5 rounded-3xl dark-glass border border-white/10 shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Global Discovery Radius & Age Guardrails
                </h3>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  Set baseline parameters across all Discovery card decks.
                </p>
              </div>
              <button
                onClick={() => {
                  saveDiscoverySettings(discoverySettings);
                  showToast('Global Discovery defaults saved.');
                }}
                className="px-3.5 py-1.5 rounded-xl gray-glass-btn text-xs font-bold text-white cursor-pointer"
              >
                Save Engine Parameters
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
              <div className="space-y-1.5 p-3.5 rounded-2xl bg-white/[0.03] border border-white/10">
                <div className="flex justify-between">
                  <span className="font-semibold text-white">Default Maximum Distance</span>
                  <span className="font-mono text-white font-bold">{discoverySettings.maxDistanceKm} km</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="250"
                  value={discoverySettings.maxDistanceKm}
                  onChange={e => setDiscoverySettings(prev => ({ ...prev, maxDistanceKm: parseInt(e.target.value) }))}
                  className="w-full accent-white h-2 bg-black/60 rounded-lg cursor-pointer"
                />
              </div>

              <div className="space-y-1.5 p-3.5 rounded-2xl bg-white/[0.03] border border-white/10">
                <div className="flex justify-between">
                  <span className="font-semibold text-white">Minimum Photo Verification Gate</span>
                  <span className="font-mono text-white font-bold">{discoverySettings.minPhotos} photo(s)</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="6"
                  value={discoverySettings.minPhotos}
                  onChange={e => setDiscoverySettings(prev => ({ ...prev, minPhotos: parseInt(e.target.value) }))}
                  className="w-full accent-white h-2 bg-black/60 rounded-lg cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Ontological Matching Weights Tuner */}
          <div className="p-5 rounded-3xl dark-glass border border-white/10 shadow-lg space-y-3">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-zinc-300" />
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Ontological Chemistry & HCM Scoring Formula
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/10 space-y-1">
                <div className="flex justify-between text-zinc-300">
                  <span>HCM Psychological Compatibility</span>
                  <span className="font-mono font-bold text-white">{matchingWeights.hcmScore}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="60"
                  value={matchingWeights.hcmScore}
                  onChange={e => setMatchingWeights({ ...matchingWeights, hcmScore: parseInt(e.target.value) })}
                  className="w-full accent-white h-1.5 bg-black/60 rounded-lg cursor-pointer"
                />
              </div>

              <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/10 space-y-1">
                <div className="flex justify-between text-zinc-300">
                  <span>Core Values Alignment</span>
                  <span className="font-mono font-bold text-white">{matchingWeights.valuesOverlap}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="60"
                  value={matchingWeights.valuesOverlap}
                  onChange={e => setMatchingWeights({ ...matchingWeights, valuesOverlap: parseInt(e.target.value) })}
                  className="w-full accent-white h-1.5 bg-black/60 rounded-lg cursor-pointer"
                />
              </div>
            </div>
          </div>

        </div>
      )}

      {/* ===================================================================== */}
      {/* SECTION 4: SPOTIFY & MUSIC LIBRARY ADMINISTRATION                     */}
      {/* ===================================================================== */}
      {activeTab === 'music' && (
        <div className="space-y-4 animate-fadeIn">
          
          <div className="p-5 rounded-3xl dark-glass border border-white/10 shadow-lg flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Music className="w-4 h-4 text-[#1DB954]" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Curated Ambient Spotify Presets & Library
                </h3>
              </div>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                Manage the soundscapes offered in the Spotify Music Player across Soulverse.
              </p>
            </div>

            <button
              onClick={() => setIsAddPresetModalOpen(true)}
              className="px-3.5 py-1.5 rounded-xl gray-glass-btn text-xs font-bold text-white flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Curated Track</span>
            </button>
          </div>

          {/* Presets List */}
          <div className="space-y-2.5">
            {presets.map((p, idx) => (
              <div
                key={p.id}
                className="p-3.5 rounded-2xl dark-glass border border-white/10 shadow-md flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={p.coverUrl}
                    alt={p.title}
                    className="w-11 h-11 rounded-xl object-cover border border-white/15 shrink-0"
                  />
                  <div className="min-w-0">
                    <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">
                      {p.category}
                    </span>
                    <h5 className="text-xs font-bold text-white truncate">{p.title}</h5>
                    <p className="text-[10px] text-zinc-400 truncate">{p.artist}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => linkSpotify(p.spotifyUrl, p.title, p.artist)}
                    className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Play className="w-3 h-3 fill-white" />
                    <span>Test Audio</span>
                  </button>

                  <button
                    onClick={() => {
                      setPresets(prev => prev.filter((_, i) => i !== idx));
                      showToast(`Removed preset "${p.title}"`);
                    }}
                    className="p-1.5 rounded-xl hover:bg-red-500/20 text-zinc-400 hover:text-red-400 transition-colors cursor-pointer"
                    title="Remove Preset"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Add Preset Modal */}
          <GlassModal
            isOpen={isAddPresetModalOpen}
            onClose={() => setIsAddPresetModalOpen(false)}
            title="Add Curated Spotify Preset"
            maxWidth="sm"
          >
            <form onSubmit={handleAddPreset} className="space-y-3 text-xs">
              <div>
                <label className="text-[11px] font-semibold text-zinc-400 block">Title</label>
                <input
                  type="text"
                  value={newPresetTitle}
                  onChange={e => setNewPresetTitle(e.target.value)}
                  placeholder="e.g. Midnight Cyberpunk Reverie"
                  className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-zinc-400 block">Artist</label>
                <input
                  type="text"
                  value={newPresetArtist}
                  onChange={e => setNewPresetArtist(e.target.value)}
                  placeholder="e.g. Tycho, Bonobo & Ambient Artists"
                  className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-zinc-400 block">Category</label>
                <input
                  type="text"
                  value={newPresetCategory}
                  onChange={e => setNewPresetCategory(e.target.value)}
                  placeholder="e.g. Lo-Fi Study / Dark Academia"
                  className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-zinc-400 block">Spotify URL or URI</label>
                <input
                  type="text"
                  value={newPresetUrl}
                  onChange={e => setNewPresetUrl(e.target.value)}
                  placeholder="https://open.spotify.com/track/... or playlist/..."
                  className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <GlassButton variant="subtle" size="sm" onClick={() => setIsAddPresetModalOpen(false)}>
                  Cancel
                </GlassButton>
                <GlassPrimaryButton type="submit" size="sm">
                  Save Preset
                </GlassPrimaryButton>
              </div>
            </form>
          </GlassModal>

        </div>
      )}

      {/* ===================================================================== */}
      {/* SECTION 5: SAFETY, MODERATION & 1926 CRISIS QUEUE                     */}
      {/* ===================================================================== */}
      {activeTab === 'safety' && (
        <div className="space-y-6 animate-fadeIn">
          
          {/* Identity Verifications Queue */}
          <div className="p-5 rounded-3xl dark-glass border border-white/10 shadow-lg space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Pending Human Verification Audits
                </h3>
              </div>
              <span className="text-[11px] text-zinc-400 font-mono">
                {verifications.filter(v => v.status === 'pending').length} pending
              </span>
            </div>

            <div className="space-y-2.5">
              {verifications.map(item => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={item.photoUrl}
                      alt={item.user}
                      className="w-12 h-12 rounded-xl object-cover border border-white/15 shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{item.user}</span>
                        <span className="text-[10px] text-zinc-400">{item.handle}</span>
                        <span className="text-[9px] px-2 py-0.2 rounded-full bg-white/10 text-zinc-300 font-mono">
                          {item.type}
                        </span>
                      </div>
                      <div className="text-[11px] text-zinc-400 mt-0.5 flex items-center gap-2">
                        <span>Submitted: {item.submittedAt}</span>
                        <span>•</span>
                        <span className="text-emerald-400 font-semibold font-mono">Liveness: {item.matchScore}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    {item.status === 'pending' ? (
                      <>
                        <button
                          onClick={() => handleApproveVerification(item.id)}
                          className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-bold cursor-pointer transition-colors"
                        >
                          Approve Badge
                        </button>
                        <button
                          onClick={() => handleRejectVerification(item.id)}
                          className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/15 text-zinc-400 text-xs font-semibold cursor-pointer transition-colors"
                        >
                          Reject
                        </button>
                      </>
                    ) : (
                      <span className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-full ${
                        item.status === 'approved' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'
                      }`}>
                        {item.status.toUpperCase()}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Incident Reports */}
          <div className="p-5 rounded-3xl dark-glass border border-white/10 shadow-lg space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flag className="w-4 h-4 text-red-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Active Trust & Safety Incidents
                </h3>
              </div>
              <span className="text-[11px] text-zinc-400 font-mono">{incidents.length} open</span>
            </div>

            {incidents.length === 0 ? (
              <p className="text-xs text-zinc-400 py-3 text-center">No active reports. Community health is clean!</p>
            ) : (
              <div className="space-y-2.5">
                {incidents.map(inc => (
                  <div
                    key={inc.id}
                    className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">{inc.reportedUser}</span>
                        <span className="text-[10px] px-2 py-0.2 rounded-full bg-red-500/20 text-red-300 font-mono font-bold uppercase">
                          {inc.severity} Severity
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-300 mt-1">{inc.reason}</p>
                      <p className="text-[10px] text-zinc-500 mt-0.5 font-mono">Flagged {inc.timestamp} by {inc.reporter}</p>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      <button
                        onClick={() => handleResolveIncident(inc.id)}
                        className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs cursor-pointer"
                      >
                        Dismiss / False Flag
                      </button>
                      <button
                        onClick={() => handleBanReportedUser(inc.id)}
                        className="px-3 py-1.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 font-bold text-xs cursor-pointer"
                      >
                        Suspend User
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 1926 Crisis Dispatch Logs */}
          <div className="p-5 rounded-3xl dark-glass border border-white/10 shadow-lg space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  1926 Mental Health Crisis Hotline Dispatch
                </h3>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                100% Care Standard
              </span>
            </div>

            <div className="space-y-2 text-xs">
              {crisisLogs.map(log => (
                <div key={log.id} className="p-3 rounded-2xl bg-white/[0.02] border border-white/10 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-white">{log.user}</span>
                    <span className="text-[10px] text-zinc-400 block">{log.hotlineCalled} • {log.triggeredAt}</span>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-white/10 text-zinc-300">
                    {log.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* ===================================================================== */}
      {/* SECTION 6: PROFILE WORLDS ADMINISTRATION                              */}
      {/* ===================================================================== */}
      {activeTab === 'worlds' && (
        <div className="space-y-4 animate-fadeIn">
          
          <div className="p-5 rounded-3xl dark-glass border border-white/10 shadow-lg flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Profile Worlds & Story Realms
              </h3>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                Inspect, moderate, and feature worlds created by users across the Identity Universe.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {adminWorlds.map(w => (
              <div
                key={w.id}
                className="p-4 rounded-3xl dark-glass border border-white/10 shadow-md space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[9px] uppercase font-bold text-zinc-500 tracking-wider">
                      {w.visibility} world
                    </span>
                    <h4 className="text-sm font-bold text-white mt-0.5">{w.name}</h4>
                    <p className="text-[10px] text-zinc-400">Created by {w.owner}</p>
                  </div>
                  {w.isFeatured && (
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-white/20 text-white border border-white/30">
                      ★ Featured Pick
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/[0.06] text-xs">
                  <span className="text-zinc-400 font-mono text-[10px]">{w.storiesCount} entries published</span>
                  <button
                    onClick={() => handleToggleWorldFeatured(w.id)}
                    className="px-3 py-1 rounded-xl bg-white/[0.06] hover:bg-white/15 text-white font-bold text-xs transition-colors cursor-pointer"
                  >
                    {w.isFeatured ? 'Unfeature' : 'Feature on Explore'}
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* ===================================================================== */}
      {/* SECTION 7: THE CONTROL LAYER - FEATURE FLAGS & ROLLOUT ENGINE          */}
      {/* ===================================================================== */}
      {activeTab === 'system' && (
        <div className="space-y-6 animate-fadeIn">
          
          {/* Sub-navigation tabs: 9 Enterprise Administration Destinations */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 rounded-3xl dark-glass border border-white/10 shadow-lg">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-serif flex items-center gap-2">
                <span>The Control Layer: Enterprise Console</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Refine Architecture
                </span>
              </h3>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                Centralized management of flags, DAG topology, hot JSON config, RBAC authorization, and versioning.
              </p>
            </div>

            <div className="flex items-center gap-1 p-1 rounded-xl bg-white/[0.04] border border-white/10 text-xs overflow-x-auto no-scrollbar">
              {[
                { id: 'flags', label: `Flags (${adminFeatures.length})`, icon: Sliders },
                { id: 'dependencies', label: `DAG (${dependencyGraph.length})`, icon: Network },
                { id: 'config', label: 'Remote Config', icon: Code },
                { id: 'rbac', label: `RBAC (${adminRoles.length})`, icon: Key },
                { id: 'subscriptions', label: 'Tiers', icon: DollarSign },
                { id: 'versions', label: `Snapshots (${configVersions.length})`, icon: History },
                { id: 'audit', label: `Audit (${auditLogs.length})`, icon: ShieldCheck },
                { id: 'analytics', label: 'Adoption', icon: Activity },
                { id: 'ai', label: 'AI Infra', icon: Cpu },
                { id: 'quotes', label: `Quotes (${adminQuotesTotal})`, icon: QuoteIcon },
                { id: 'ops', label: 'SQLite Ops', icon: Database }
              ].map(sub => {
                const Icon = sub.icon || Sliders;
                const isActive = systemSubTab === sub.id;
                return (
                  <button
                    key={sub.id}
                    onClick={() => {
                      setSystemSubTab(sub.id as any);
                      refreshAdminControlLayer();
                    }}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                      isActive ? 'bg-white text-[#090A0E] shadow-sm' : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{sub.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* SUB-TAB 1: FEATURE FLAGS & ROLLOUT ENGINE */}
          {systemSubTab === 'flags' && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 gap-3">
                {adminFeatures.map(feat => {
                  return (
                    <div
                      key={feat.id}
                      className="p-4 rounded-2xl dark-glass border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-white/20 transition-all"
                    >
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${
                            feat.killSwitchActive ? 'bg-rose-500 shadow-[0_0_8px_#F43F5E]' :
                            feat.isGloballyEnabled ? 'bg-emerald-400 shadow-[0_0_8px_#10B981]' :
                            'bg-zinc-600'
                          }`} />
                          <span className="font-bold text-sm text-white font-serif">{feat.name}</span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/10 text-zinc-300">
                            {feat.category}
                          </span>
                          {feat.killSwitchActive && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                              KILL SWITCH ACTIVE
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-zinc-400">{feat.tagline}</p>
                        
                        {/* Dependencies pills */}
                        {feat.dependencies && feat.dependencies.length > 0 && (
                          <div className="flex items-center gap-1.5 pt-1 text-[10px] text-zinc-500">
                            <span>Requires:</span>
                            {feat.dependencies.map((d, i) => (
                              <span key={i} className="px-1.5 py-0.2 rounded bg-white/5 border border-white/10 text-zinc-400">
                                {d.depends_on_feature_id} {d.is_optional ? '(optional)' : ''}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Controls: Rollout %, Global Toggle, Kill Switch */}
                      <div className="flex items-center gap-3 shrink-0">
                        {/* Rollout % badge */}
                        <button
                          onClick={() => {
                            setRolloutModalFeature(feat);
                            setRolloutPercentageInput(feat.rolloutPercentage);
                            setRolloutReason('');
                          }}
                          className="px-2.5 py-1 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-zinc-300 cursor-pointer flex items-center gap-1"
                          title="Adjust controlled rollout percentage"
                        >
                          <Sliders className="w-3 h-3 text-zinc-400" />
                          <span>{feat.rolloutPercentage}% Rollout</span>
                        </button>

                        {/* Emergency Kill Switch Button */}
                        <button
                          onClick={() => {
                            setKillModalFeature(feat);
                            setKillReason(feat.killSwitchReason || '');
                          }}
                          className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                            feat.killSwitchActive 
                              ? 'bg-rose-600 text-white shadow-[0_0_12px_rgba(225,29,72,0.6)]' 
                              : 'bg-white/5 hover:bg-rose-500/10 text-zinc-400 hover:text-rose-300 border border-white/10'
                          }`}
                          title="Trip or release emergency kill switch"
                        >
                          <AlertTriangle className="w-3 h-3" />
                          <span>{feat.killSwitchActive ? 'Kill-Switch On' : 'Kill-Switch'}</span>
                        </button>

                        {/* Global Enable Toggle */}
                        <button
                          onClick={async () => {
                            const next = !feat.isGloballyEnabled;
                            await FeatureControlService.updateAdminFlag(feat.id, {
                              isGloballyEnabled: next,
                              reason: `Admin toggle global availability to ${next ? 'enabled' : 'disabled'}`
                            });
                            refreshAdminControlLayer();
                            showToast(`${feat.name} globally ${next ? 'enabled' : 'disabled'}`);
                          }}
                          className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                            feat.isGloballyEnabled ? 'bg-white' : 'bg-white/15'
                          }`}
                          title={feat.isGloballyEnabled ? 'Globally Enabled' : 'Globally Disabled'}
                        >
                          <div className={`w-4 h-4 rounded-full transition-transform ${
                            feat.isGloballyEnabled ? 'translate-x-6 bg-[#090A0E]' : 'translate-x-1 bg-white'
                          }`} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* SUB-TAB 2: FEATURE DEPENDENCY DAG & CYCLE DETECTOR */}
          {systemSubTab === 'dependencies' && (
            <div className="space-y-4 animate-fadeIn">
              {/* DAG Overview & Cycle Testing Simulator */}
              <div className="p-5 rounded-3xl dark-glass border border-white/10 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/10">
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider font-serif">
                      Dependency Graph & Cycle Prevention Simulator
                    </h4>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      Ensures modular stability. Adding dependency links is pre-validated to prevent circular deadlocks.
                    </p>
                  </div>
                  <GlassButton 
                    variant="subtle" 
                    onClick={() => FeatureControlService.getDependencyGraph().then(setDependencyGraph)}
                    className="text-xs py-1 px-3 self-start sm:self-auto"
                  >
                    Refresh Topology
                  </GlassButton>
                </div>

                {/* Interactive Simulator */}
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
                  <span className="text-xs font-bold text-white block">
                    Test Proposed Dependency Link:
                  </span>
                  <div className="flex flex-col sm:flex-row items-center gap-2">
                    <select
                      value={testDepSource}
                      onChange={(e) => setTestDepSource(e.target.value)}
                      className="w-full sm:w-auto flex-1 bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-xs text-white"
                    >
                      {adminFeatures.map(f => (
                        <option key={f.id} value={f.id}>{f.name} ({f.id})</option>
                      ))}
                    </select>

                    <div className="flex items-center gap-1 text-zinc-400 font-mono text-xs">
                      <span>depends on</span>
                      <ArrowRight className="w-4 h-4 text-zinc-300" />
                    </div>

                    <select
                      value={testDepTarget}
                      onChange={(e) => setTestDepTarget(e.target.value)}
                      className="w-full sm:w-auto flex-1 bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-xs text-white"
                    >
                      {adminFeatures.map(f => (
                        <option key={f.id} value={f.id}>{f.name} ({f.id})</option>
                      ))}
                    </select>

                    <GlassButton
                      variant="primary"
                      onClick={async () => {
                        const res = await FeatureControlService.validateDependency(testDepSource, testDepTarget);
                        setCycleCheckResult(res);
                      }}
                      className="w-full sm:w-auto text-xs py-2 px-4 whitespace-nowrap"
                    >
                      Validate Safety
                    </GlassButton>
                  </div>

                  {cycleCheckResult && (
                    <div className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                      cycleCheckResult.isCyclic 
                        ? 'bg-rose-500/15 border-rose-500/30 text-rose-300' 
                        : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                    }`}>
                      {cycleCheckResult.isCyclic ? (
                        <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                      )}
                      <span>{cycleCheckResult.message || cycleCheckResult.error}</span>
                    </div>
                  )}
                </div>

                {/* Nodes Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[50vh] overflow-y-auto no-scrollbar">
                  {dependencyGraph.map(node => (
                    <div key={node.id} className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/10 text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white truncate">{node.name}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-zinc-300">
                          {node.category}
                        </span>
                      </div>

                      {/* Prerequisites */}
                      <div>
                        <span className="text-[10px] text-zinc-500 uppercase font-bold block mb-1">
                          Prerequisites ({node.prerequisites?.length || 0}):
                        </span>
                        {node.prerequisites && node.prerequisites.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {node.prerequisites.map((p: any) => (
                              <span key={p.id} className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] font-mono text-zinc-300">
                                {p.id.replace('feat_', '')} {p.isOptional && '(optional)'}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-[10px] text-zinc-500 italic">None (Root Module)</span>
                        )}
                      </div>

                      {/* Dependants */}
                      <div className="pt-1 border-t border-white/[0.04]">
                        <span className="text-[10px] text-zinc-500 uppercase font-bold block mb-1">
                          Downstream Dependants ({node.dependants?.length || 0}):
                        </span>
                        {node.dependants && node.dependants.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {node.dependants.map((d: any) => (
                              <span key={d.id} className="px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-mono text-emerald-300">
                                {d.id.replace('feat_', '')}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-[10px] text-zinc-500 italic">None (Leaf Module)</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* SUB-TAB 3: REMOTE CONFIG JSON TUNER */}
          {systemSubTab === 'config' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-5 rounded-3xl dark-glass border border-white/10 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/10">
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider font-serif">
                      Remote Configuration JSON Tuner (Flagsmith/Unleash Pattern)
                    </h4>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      Hot-reload module runtime thresholds without needing client application rebuilds.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={selectedConfigFeature}
                      onChange={(e) => {
                        setSelectedConfigFeature(e.target.value);
                        const feat = adminFeatures.find(f => f.id === e.target.value);
                        if (feat && feat.customConfig) {
                          setCustomConfigJson(JSON.stringify(feat.customConfig, null, 2));
                        }
                      }}
                      className="bg-black/60 border border-white/15 rounded-xl px-3 py-1.5 text-xs text-white"
                    >
                      {adminFeatures.map(f => (
                        <option key={f.id} value={f.id}>{f.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono text-zinc-400 text-[11px]">Payload (JSON):</span>
                    {configSaveStatus && (
                      <span className="text-xs text-emerald-400 font-bold">{configSaveStatus}</span>
                    )}
                  </div>
                  <textarea
                    value={customConfigJson}
                    onChange={(e) => setCustomConfigJson(e.target.value)}
                    rows={8}
                    className="w-full bg-black/80 font-mono text-xs text-emerald-300 p-3.5 rounded-2xl border border-white/15 focus:outline-none focus:border-white/40"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <GlassButton
                    variant="primary"
                    onClick={async () => {
                      try {
                        const parsed = JSON.parse(customConfigJson);
                        const ok = await FeatureControlService.updateRemoteConfig(
                          selectedConfigFeature,
                          parsed,
                          'Remote config updated via enterprise console'
                        );
                        if (ok) {
                          setConfigSaveStatus('✓ Configuration saved and hot-reloaded!');
                          setTimeout(() => setConfigSaveStatus(null), 3000);
                          refreshAdminControlLayer();
                        } else {
                          setConfigSaveStatus('Error saving remote config');
                        }
                      } catch (err: any) {
                        showToast('❌ Invalid JSON syntax: ' + err.message);
                      }
                    }}
                    className="text-xs py-2 px-4 font-bold flex items-center gap-1.5"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Deploy Configuration Payload</span>
                  </GlassButton>
                </div>
              </div>
            </div>
          )}

          {/* SUB-TAB 4: CASBIN-STYLE RBAC ROLES & PERMISSIONS */}
          {systemSubTab === 'rbac' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-5 rounded-3xl dark-glass border border-white/10 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider font-serif">
                      Casbin RBAC Roles & Policy Authorization Engine
                    </h4>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      Hierarchical role boundaries with granular domain and action permissions.
                    </p>
                  </div>
                  <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-white/10 text-zinc-300">
                    {adminRoles.length} Roles Active
                  </span>
                </div>

                {/* Role Assignment Bar */}
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 flex flex-col sm:flex-row items-center gap-2 text-xs">
                  <span className="font-bold text-white shrink-0">Assign Role:</span>
                  <input
                    type="text"
                    value={assignRoleUserId}
                    onChange={(e) => setAssignRoleUserId(e.target.value)}
                    placeholder="User ID (e.g. usr_me)"
                    className="w-full sm:w-48 bg-black/60 border border-white/15 rounded-xl px-3 py-1.5 text-white"
                  />
                  <select
                    value={assignRoleId}
                    onChange={(e) => setAssignRoleId(e.target.value)}
                    className="w-full sm:w-48 bg-black/60 border border-white/15 rounded-xl px-3 py-1.5 text-white"
                  >
                    {adminRoles.map(r => (
                      <option key={r.id} value={r.id}>{r.name} (Lvl {r.hierarchy_level})</option>
                    ))}
                  </select>
                  <GlassButton
                    variant="primary"
                    onClick={async () => {
                      const res = await FeatureControlService.assignAdminRole(assignRoleUserId, assignRoleId);
                      if (res.success) {
                        setAssignRoleStatus('Role successfully assigned!');
                        setTimeout(() => setAssignRoleStatus(null), 3000);
                        refreshAdminControlLayer();
                      } else {
                        setAssignRoleStatus(res.error || 'Failed to assign role');
                      }
                    }}
                    className="w-full sm:w-auto text-xs py-1.5 px-3 font-bold"
                  >
                    Grant Role
                  </GlassButton>
                  {assignRoleStatus && (
                    <span className="text-xs text-emerald-400 font-bold ml-2">{assignRoleStatus}</span>
                  )}
                </div>

                {/* Roles Table */}
                <div className="space-y-3 max-h-[50vh] overflow-y-auto no-scrollbar">
                  {adminRoles.map(role => (
                    <div key={role.id} className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-white font-serif">{role.name}</span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-zinc-300">
                            {role.id}
                          </span>
                        </div>
                        <span className="text-[11px] font-bold text-emerald-400 font-mono">
                          Hierarchy Level {role.hierarchy_level}
                        </span>
                      </div>

                      <p className="text-xs text-zinc-400 leading-relaxed">
                        {role.description}
                      </p>

                      <div className="flex items-center gap-2 pt-2 border-t border-white/[0.04] flex-wrap">
                        <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
                          Assigned Users ({role.assignedUsers?.length || 0}):
                        </span>
                        {role.assignedUsers && role.assignedUsers.length > 0 ? (
                          role.assignedUsers.map((u: any) => (
                            <span key={u.user_id} className="px-2 py-0.5 rounded-md bg-white/5 text-[10px] font-mono text-zinc-300">
                              {u.user_id} ({u.user_name || 'Admin'})
                            </span>
                          ))
                        ) : (
                          <span className="text-[10px] text-zinc-500 italic">No direct assignments</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* SUB-TAB 5: SUBSCRIPTION ENTITLEMENTS MATRIX */}
          {systemSubTab === 'subscriptions' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-5 rounded-3xl dark-glass border border-white/10 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider font-serif">
                      Subscription Tier Entitlements Matrix
                    </h4>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      Define which modules are accessible per user membership level (Free, Plus, Sovereign VIP).
                    </p>
                  </div>
                  <GlassButton
                    variant="subtle"
                    onClick={() => FeatureControlService.getSubscriptionEntitlements().then(setSubscriptionData)}
                    className="text-xs py-1 px-3"
                  >
                    Sync Matrix
                  </GlassButton>
                </div>

                <div className="space-y-2 max-h-[55vh] overflow-y-auto no-scrollbar">
                  {subscriptionData.matrix?.map((row: any) => (
                    <div key={row.featureId} className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div className="min-w-0">
                        <span className="font-bold text-white block">{row.name}</span>
                        <span className="text-[10px] text-zinc-400 font-mono">{row.category}</span>
                      </div>

                      <div className="flex items-center gap-3">
                        {['free', 'plus', 'sovereign'].map(tier => {
                          const isAllowed = row.allowedTiers?.includes(tier);
                          return (
                            <button
                              key={tier}
                              onClick={async () => {
                                const nextTiers = isAllowed
                                  ? row.allowedTiers.filter((t: string) => t !== tier)
                                  : [...(row.allowedTiers || []), tier];
                                await FeatureControlService.updateSubscriptionEntitlements(row.featureId, nextTiers);
                                FeatureControlService.getSubscriptionEntitlements().then(setSubscriptionData);
                                showToast(`Updated ${row.name} entitlements`);
                              }}
                              className={`px-3 py-1.5 rounded-xl border font-bold capitalize transition-all cursor-pointer ${
                                isAllowed
                                  ? 'bg-white text-[#090A0E] border-white shadow-sm'
                                  : 'bg-white/[0.02] text-zinc-500 border-white/10 hover:text-zinc-300'
                              }`}
                            >
                              {tier}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* SUB-TAB 6: CONFIGURATION VERSIONING & 1-CLICK ROLLBACK */}
          {systemSubTab === 'versions' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-5 rounded-3xl dark-glass border border-white/10 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/10">
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider font-serif">
                      Configuration Versioning & Snapshot Rollback
                    </h4>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      Create point-in-time snapshots of the entire feature layer and roll back instantly with an audit trail.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Snapshot tag summary..."
                      value={newSnapshotSummary}
                      onChange={(e) => setNewSnapshotSummary(e.target.value)}
                      className="bg-black/60 border border-white/15 rounded-xl px-3 py-1.5 text-xs text-white"
                    />
                    <GlassButton
                      variant="primary"
                      onClick={async () => {
                        if (!newSnapshotSummary.trim()) {
                          showToast('⚠️ Please enter a change summary for the snapshot');
                          return;
                        }
                        const res = await FeatureControlService.createConfigurationSnapshot(newSnapshotSummary.trim());
                        if (res.success) {
                          setNewSnapshotSummary('');
                          FeatureControlService.getConfigurationVersions().then(setConfigVersions);
                          showToast(`Snapshot v${res.versionNumber} created!`);
                        }
                      }}
                      className="text-xs py-1.5 px-3 font-bold whitespace-nowrap"
                    >
                      Snapshot Now
                    </GlassButton>
                  </div>
                </div>

                {/* Snapshots List */}
                <div className="space-y-2.5 max-h-[50vh] overflow-y-auto no-scrollbar">
                  {configVersions.map(ver => (
                    <div key={ver.id} className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white font-serif text-sm">
                            Version {ver.version_number}
                          </span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-zinc-300">
                            {ver.id}
                          </span>
                          <span className="text-[10px] text-zinc-400">by {ver.created_by}</span>
                        </div>
                        <p className="text-zinc-300 text-xs">
                          {ver.change_summary}
                        </p>
                        <span className="text-[10px] text-zinc-500 font-mono block">
                          {new Date(ver.created_at).toLocaleString()}
                        </span>
                      </div>

                      <button
                        onClick={async () => {
                          const reason = prompt(`Rollback to Version ${ver.version_number}? Enter audit governance reason:`);
                          if (!reason) return;
                          const res = await FeatureControlService.rollbackConfiguration(ver.id, reason);
                          if (res.success) {
                            refreshAdminControlLayer();
                            showToast(`Rolled back to v${res.rolledBackToVersion}!`);
                          }
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/15 text-xs font-bold text-white flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Rollback</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* SUB-TAB 9: SQLITE SYSTEM OPERATIONS */}
          {systemSubTab === 'ops' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-5 rounded-3xl dark-glass border border-white/10 space-y-4">
                <div className="pb-3 border-b border-white/10">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider font-serif">
                    Database Maintenance & WAL Operations
                  </h4>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    Perform low-level SQLite WAL checkpoints, storage vacuuming, and health checks.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2">
                    <span className="font-bold text-sm text-white block">WAL Checkpoint (TRUNCATE)</span>
                    <p className="text-xs text-zinc-400">
                      Flushes write-ahead log pages to the main database file and resets log size.
                    </p>
                    <GlassButton
                      variant="primary"
                      onClick={async () => {
                        const res = await FeatureControlService.walCheckpoint();
                        setOpsFeedback(res.message || 'WAL Checkpoint executed');
                        setTimeout(() => setOpsFeedback(null), 3000);
                      }}
                      className="text-xs py-1.5 px-3 font-bold mt-2"
                    >
                      Run Checkpoint
                    </GlassButton>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2">
                    <span className="font-bold text-sm text-white block">Database VACUUM</span>
                    <p className="text-xs text-zinc-400">
                      Rebuilds database file to reclaim unused space and defragment indices.
                    </p>
                    <GlassButton
                      variant="primary"
                      onClick={async () => {
                        const res = await FeatureControlService.vacuumDatabase();
                        setOpsFeedback(res.message || 'Database VACUUM executed');
                        setTimeout(() => setOpsFeedback(null), 3000);
                      }}
                      className="text-xs py-1.5 px-3 font-bold mt-2"
                    >
                      Execute VACUUM
                    </GlassButton>
                  </div>
                </div>

                {opsFeedback && (
                  <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
                    ✓ {opsFeedback}
                  </div>
                )}
              </div>
            </div>
          )}
          {systemSubTab === 'audit' && (
            <div className="space-y-3">
              <div className="p-4 rounded-3xl dark-glass border border-white/10 space-y-2">
                <div className="flex items-center justify-between pb-2 border-b border-white/10">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    Immutable Configuration Audit Trail (Latest 50 Operations)
                  </span>
                  <span className="text-[10px] text-zinc-500">Zero unlogged changes permitted</span>
                </div>

                <div className="space-y-2 max-h-[60vh] overflow-y-auto no-scrollbar">
                  {auditLogs.map(log => (
                    <div key={log.id} className="p-3 rounded-2xl bg-white/[0.02] border border-white/10 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white">{log.admin_name}</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/10 text-zinc-300 font-mono">
                            {log.action}
                          </span>
                          <span className="text-[10px] text-zinc-400">Target: {log.target_id}</span>
                        </div>
                        <span className="text-[10px] text-zinc-500 font-mono">
                          {new Date(log.created_at).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-zinc-300 text-[11px] font-serif">
                        <span className="text-zinc-500">Reason:</span> "{log.reason}"
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* SUB-TAB 3: FEATURE ADOPTION TELEMETRY */}
          {systemSubTab === 'analytics' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {adoptionStats.map(stat => (
                  <div key={stat.id} className="p-4 rounded-2xl dark-glass border border-white/10 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-white truncate">{stat.name}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-white/10 text-zinc-300">
                        {stat.category}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1">
                      <span className="text-emerald-400 font-bold">{stat.enabled_users} Active</span>
                      <span className="text-zinc-500">{stat.disabled_users} Disabled</span>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                      <div 
                        className="h-full bg-emerald-400 rounded-full"
                        style={{ width: `${Math.min(100, (stat.enabled_users / (stat.total_configured || 1)) * 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SUB-TAB 10: AI INFRASTRUCTURE & GOVERNANCE */}
          {systemSubTab === 'ai' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-5 rounded-3xl dark-glass border border-white/10">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider font-serif flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-indigo-400" />
                    <span>AI Infrastructure & Multi-Provider Telemetry</span>
                  </h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Global provider governance, platform rate limits, and aggregated telemetry (Zero access to user keys or conversation transcripts).
                  </p>
                </div>
                <button
                  disabled={isLoadingAiInfra}
                  onClick={loadAiInfrastructure}
                  className="px-3.5 py-1.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.15] text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className={`w-3.5 h-3.5 ${isLoadingAiInfra ? 'animate-spin' : ''}`} />
                  Refresh Telemetry
                </button>
              </div>

              {/* Aggregated Telemetry KPI Cards */}
              {aiInfra?.telemetry && (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  <div className="p-3.5 rounded-2xl dark-glass border border-white/10 space-y-1">
                    <span className="text-[10px] text-zinc-400 uppercase font-mono">Platform Requests</span>
                    <p className="text-lg font-bold font-mono text-white">
                      {aiInfra.telemetry.totalRequests.toLocaleString()}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl dark-glass border border-white/10 space-y-1">
                    <span className="text-[10px] text-zinc-400 uppercase font-mono">Tokens Processed</span>
                    <p className="text-lg font-bold font-mono text-indigo-400">
                      {aiInfra.telemetry.totalTokens.toLocaleString()}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl dark-glass border border-white/10 space-y-1">
                    <span className="text-[10px] text-zinc-400 uppercase font-mono">Est. Platform Cost</span>
                    <p className="text-lg font-bold font-mono text-emerald-400">
                      ${Number(aiInfra.telemetry.totalPlatformCostUsd || 0).toFixed(4)}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl dark-glass border border-white/10 space-y-1">
                    <span className="text-[10px] text-zinc-400 uppercase font-mono">Average Latency</span>
                    <p className="text-lg font-bold font-mono text-amber-400">
                      {aiInfra.telemetry.avgLatencyMs} ms
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl dark-glass border border-white/10 space-y-1">
                    <span className="text-[10px] text-zinc-400 uppercase font-mono">Active BYOAI Users</span>
                    <p className="text-lg font-bold font-mono text-purple-400">
                      {aiInfra.telemetry.activeUsersCount}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl dark-glass border border-white/10 space-y-1">
                    <span className="text-[10px] text-zinc-400 uppercase font-mono">Failure Rate</span>
                    <p className={`text-lg font-bold font-mono ${aiInfra.telemetry.failureRatePct > 5 ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {aiInfra.telemetry.failureRatePct}%
                    </p>
                  </div>
                </div>
              )}

              {/* Provider Availability Table */}
              <div className="p-5 rounded-3xl dark-glass border border-white/10 space-y-4">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider font-serif">
                  Global Provider Availability & Governance Kill-Switches
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {aiInfra?.providers?.map((p: any) => (
                    <div
                      key={p.providerId}
                      className="p-4 rounded-2xl dark-glass border border-white/10 flex items-center justify-between gap-3 hover:border-white/20 transition-all"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${p.isGloballyEnabled ? 'bg-emerald-400 shadow-[0_0_8px_#10B981]' : 'bg-rose-500'}`} />
                          <span className="text-xs font-bold text-white font-serif">{p.name}</span>
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-white/10 text-zinc-400">
                            {p.providerId}
                          </span>
                        </div>
                        <p className="text-[10px] text-zinc-400">
                          RPM Limit: <strong className="text-zinc-200 font-mono">{p.rateLimitRpm}</strong> | BYOK Allowed: <strong className="text-zinc-200">{p.byokAllowed ? 'Yes' : 'No'}</strong>
                        </p>
                      </div>

                      <button
                        onClick={async () => {
                          try {
                            await byoaiService.updateAdminProvider(p.providerId, { isGloballyEnabled: !p.isGloballyEnabled });
                            loadAiInfrastructure();
                            showToast(`Provider ${p.name} ${!p.isGloballyEnabled ? 'enabled' : 'disabled'}`);
                          } catch (err: any) {
                            showToast(err.message || 'Update failed');
                          }
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          p.isGloballyEnabled
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500/30'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30'
                        }`}
                      >
                        {p.isGloballyEnabled ? 'Kill Provider' : 'Enable'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Supported AI Model Catalog */}
              <div className="p-5 rounded-3xl dark-glass border border-white/10 space-y-4">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider font-serif">
                  Platform AI Model Catalog ({aiInfra?.models?.length || 0} Models)
                </h4>

                <div className="border border-white/10 rounded-2xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-white/[0.04] text-zinc-400 font-mono text-[10px] uppercase border-b border-white/10">
                      <tr>
                        <th className="p-3">Model</th>
                        <th className="p-3">Provider</th>
                        <th className="p-3">Context Window</th>
                        <th className="p-3">Input / 1k</th>
                        <th className="p-3">Output / 1k</th>
                        <th className="p-3">Capabilities</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.06] text-zinc-300 font-mono text-[11px]">
                      {aiInfra?.models?.map((m: any) => (
                        <tr key={m.id} className="hover:bg-white/[0.02]">
                          <td className="p-3 text-white font-sans font-semibold">
                            {m.name}
                            <span className="block text-[10px] text-zinc-500 font-mono">{m.id}</span>
                          </td>
                          <td className="p-3 uppercase text-indigo-400 font-bold">{m.provider}</td>
                          <td className="p-3">{m.capabilities?.contextWindow?.toLocaleString()} tokens</td>
                          <td className="p-3 text-emerald-400">${m.costPer1kInputUsd}</td>
                          <td className="p-3 text-emerald-400">${m.costPer1kOutputUsd}</td>
                          <td className="p-3">
                            <div className="flex items-center gap-1">
                              {m.capabilities?.streaming && <span className="px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 text-[9px]">Stream</span>}
                              {m.capabilities?.vision && <span className="px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 text-[9px]">Vision</span>}
                              {m.capabilities?.jsonMode && <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 text-[9px]">JSON</span>}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* SUB-TAB 11: QUOTES & WISDOM SANCTUARY */}
          {systemSubTab === 'quotes' && (
            <div className="space-y-6 animate-fadeIn">
              {/* Header Card */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-3xl dark-glass border border-white/10 shadow-lg">
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-2xl bg-gradient-to-tr from-amber-500/20 to-orange-500/20 border border-amber-500/30">
                      <QuoteIcon className="w-5 h-5 text-amber-300" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white uppercase tracking-wider font-serif flex items-center gap-2">
                        <span>Wisdom Sanctuary & Infinite Quotes Engine</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          {adminQuotesTotal} Curated Quotes
                        </span>
                      </h3>
                      <p className="text-xs text-zinc-400">
                        Multi-provider adapters, rate limit guards, zero-duplicate library hygiene, and daily reflection locks.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    onClick={handleDeduplicateQuotes}
                    disabled={isDeduplicatingQuotes}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl dark-glass hover:bg-white/10 border border-white/15 text-xs font-bold text-zinc-200 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <RotateCcw className={`w-3.5 h-3.5 ${isDeduplicatingQuotes ? 'animate-spin' : ''}`} />
                    <span>{isDeduplicatingQuotes ? 'Deduplicating...' : 'Deduplicate Library'}</span>
                  </button>
                  <button
                    onClick={() => setIsAddQuoteModalOpen(true)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white text-[#090A0E] hover:bg-zinc-200 text-xs font-black shadow-lg transition-transform active:scale-95 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Quote</span>
                  </button>
                </div>
              </div>

              {/* Provider Pipeline Cards */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  External Batch Ingestion Pipelines (Free Tier Resilient)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {quoteProviders.map(p => {
                    const isIngesting = isFetchingQuoteBatch === p.providerId;
                    return (
                      <div
                        key={p.providerId}
                        className="p-4 rounded-2xl dark-glass border border-white/10 space-y-3 relative overflow-hidden"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-white">{p.name}</span>
                              <span
                                className={`text-[9px] font-mono px-2 py-0.5 rounded-full ${
                                  p.isEnabled
                                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                    : 'bg-zinc-500/20 text-zinc-400 border border-zinc-500/30'
                                }`}
                              >
                                {p.isEnabled ? 'Active' : 'Disabled'}
                              </span>
                            </div>
                            <span className="text-[10px] font-mono text-zinc-400 truncate block max-w-[200px]">
                              {p.baseUrl}
                            </span>
                          </div>

                          <button
                            onClick={() => handleToggleQuoteProvider(p.providerId, p.isEnabled)}
                            className={`p-1.5 rounded-xl border text-xs cursor-pointer transition-colors ${
                              p.isEnabled
                                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20'
                                : 'bg-zinc-500/10 border-zinc-500/30 text-zinc-400 hover:bg-zinc-500/20'
                            }`}
                            title={p.isEnabled ? 'Disable Provider' : 'Enable Provider'}
                          >
                            <Sliders className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-1 border-t border-white/[0.06]">
                          <span>Rate Limit: {p.rateLimitRpm} RPM</span>
                          <span className="text-zinc-500 font-mono">ID: {p.providerId}</span>
                        </div>

                        <button
                          onClick={() => handleFetchQuoteBatch(p.providerId)}
                          disabled={!p.isEnabled || isIngesting}
                          className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-xs font-medium text-white transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <Download className={`w-3.5 h-3.5 ${isIngesting ? 'animate-bounce' : ''}`} />
                          <span>{isIngesting ? 'Ingesting Batch...' : 'Ingest 30 Quotes'}</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Quotes Database Explorer & Controls */}
              <div className="space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 rounded-2xl dark-glass border border-white/10">
                  {/* Search Input */}
                  <div className="flex-1 min-w-[240px] relative">
                    <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={adminQuoteSearch}
                      onChange={(e) => setAdminQuoteSearch(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') loadAdminQuotesData(); }}
                      placeholder="Search quotes or authors (Press Enter)..."
                      className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white/30"
                    />
                  </div>

                  {/* Category Selector */}
                  <div className="flex items-center gap-2">
                    <select
                      value={adminQuoteCategory}
                      onChange={(e) => {
                        setAdminQuoteCategory(e.target.value);
                        setAdminQuotePage(1);
                      }}
                      className="px-3 py-2 rounded-xl bg-[#090A0E] border border-white/10 text-xs text-zinc-200 focus:outline-none focus:border-white/30 cursor-pointer"
                    >
                      <option value="all">All 16 Categories</option>
                      {Object.values(QUOTE_CATEGORIES).map(cat => (
                        <option key={cat.key} value={cat.key}>{cat.label}</option>
                      ))}
                    </select>

                    {/* Verification Filter */}
                    <div className="flex items-center gap-1 p-1 rounded-xl bg-white/5 border border-white/10 text-xs">
                      {(['all', 'verified', 'unverified'] as const).map(mode => (
                        <button
                          key={mode}
                          onClick={() => {
                            setAdminQuoteVerifiedFilter(mode);
                            setAdminQuotePage(1);
                          }}
                          className={`px-2.5 py-1 rounded-lg font-medium capitalize transition-all cursor-pointer ${
                            adminQuoteVerifiedFilter === mode
                              ? 'bg-white text-[#090A0E] font-bold'
                              : 'text-zinc-400 hover:text-white'
                          }`}
                        >
                          {mode}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Quotes List Table */}
                <div className="rounded-2xl dark-glass border border-white/10 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-zinc-300">
                      <thead className="bg-white/[0.04] text-[10px] uppercase tracking-wider text-zinc-400 font-bold border-b border-white/10">
                        <tr>
                          <th className="p-3">Quote Content</th>
                          <th className="p-3">Category</th>
                          <th className="p-3">Tags & Signals</th>
                          <th className="p-3">Status</th>
                          <th className="p-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/[0.06]">
                        {adminQuotes.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="p-8 text-center text-zinc-500">
                              No quotes matching your search or filters found.
                            </td>
                          </tr>
                        ) : (
                          adminQuotes.map(q => (
                            <tr key={q.id} className="hover:bg-white/[0.02] transition-colors">
                              <td className="p-3 max-w-md">
                                <p className="font-serif italic text-white line-clamp-2">
                                  "{q.text}"
                                </p>
                                <span className="text-[11px] text-zinc-400 font-medium">
                                  — {q.author}
                                  {q.attribution ? ` (${q.attribution})` : ''}
                                </span>
                              </td>
                              <td className="p-3 whitespace-nowrap">
                                <span
                                  className="px-2 py-0.5 rounded-full text-[10px] font-bold border"
                                  style={{
                                    backgroundColor: `${QUOTE_CATEGORIES[q.category]?.accentColor || '#FFFFFF'}15`,
                                    color: QUOTE_CATEGORIES[q.category]?.accentColor || '#FFFFFF',
                                    borderColor: `${QUOTE_CATEGORIES[q.category]?.accentColor || '#FFFFFF'}35`
                                  }}
                                >
                                  {QUOTE_CATEGORIES[q.category]?.label || q.category}
                                </span>
                              </td>
                              <td className="p-3">
                                <div className="flex flex-wrap gap-1 max-w-[200px]">
                                  {q.tags.slice(0, 3).map(t => (
                                    <span key={t} className="px-1.5 py-0.5 rounded bg-white/5 text-[9px] text-zinc-400">
                                      #{t}
                                    </span>
                                  ))}
                                  {(q.likesCount ?? 0) > 0 && (
                                    <span className="px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-300 text-[9px] flex items-center gap-0.5">
                                      <Heart className="w-2.5 h-2.5 fill-rose-300" /> {q.likesCount}
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="p-3 whitespace-nowrap">
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 w-fit ${
                                    q.isVerified
                                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                      : 'bg-zinc-500/20 text-zinc-400 border border-zinc-500/30'
                                  }`}
                                >
                                  {q.isVerified ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                                  {q.isVerified ? 'Verified' : 'Community'}
                                </span>
                              </td>
                              <td className="p-3 text-right whitespace-nowrap">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    onClick={() => handleToggleVerifyQuote(q)}
                                    className="p-1.5 rounded-lg dark-glass hover:bg-white/10 text-zinc-300 hover:text-white cursor-pointer"
                                    title={q.isVerified ? 'Mark Unverified' : 'Mark Verified'}
                                  >
                                    <CheckSquare className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => setAssignDailyQuoteModal({
                                      quote: q,
                                      dateStr: new Date().toISOString().split('T')[0],
                                      reflectionQuestion: 'How does this perspective transform your day?'
                                    })}
                                    className="p-1.5 rounded-lg dark-glass hover:bg-amber-500/20 text-amber-300 hover:text-amber-200 cursor-pointer"
                                    title="Lock as Featured Daily Quote"
                                  >
                                    <Sparkles className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteAdminQuote(q.id)}
                                    className="p-1.5 rounded-lg dark-glass hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 cursor-pointer"
                                    title="Permanently Delete Quote"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination Footer */}
                  <div className="flex items-center justify-between p-3 border-t border-white/10 text-xs text-zinc-400 bg-white/[0.02]">
                    <span>
                      Page {adminQuotePage} of {Math.max(1, Math.ceil(adminQuotesTotal / 20))}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setAdminQuotePage(p => Math.max(1, p - 1))}
                        disabled={adminQuotePage <= 1}
                        className="px-3 py-1 rounded-lg dark-glass hover:bg-white/10 text-white cursor-pointer disabled:opacity-40"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => setAdminQuotePage(p => p + 1)}
                        disabled={adminQuotePage >= Math.ceil(adminQuotesTotal / 20)}
                        className="px-3 py-1 rounded-lg dark-glass hover:bg-white/10 text-white cursor-pointer disabled:opacity-40"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Add New Quote Modal */}
          {isAddQuoteModalOpen && (
            <GlassModal
              isOpen={isAddQuoteModalOpen}
              onClose={() => setIsAddQuoteModalOpen(false)}
              title="Add New Wisdom Quote"
              subtitle="Curate a quote directly into the Soulverse Wisdom Sanctuary"
              maxWidth="md"
            >
              <form onSubmit={handleCreateNewQuote} className="space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-white block">Quote Text *</label>
                  <textarea
                    required
                    rows={3}
                    value={newQuoteData.text}
                    onChange={(e) => setNewQuoteData({ ...newQuoteData, text: e.target.value })}
                    placeholder="Enter the full quote or thought..."
                    className="w-full bg-white/5 border border-white/15 rounded-xl p-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white/40"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-white block">Author *</label>
                    <input
                      required
                      type="text"
                      value={newQuoteData.author}
                      onChange={(e) => setNewQuoteData({ ...newQuoteData, author: e.target.value })}
                      placeholder="e.g. Marcus Aurelius"
                      className="w-full bg-white/5 border border-white/15 rounded-xl p-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white/40"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-white block">Category *</label>
                    <select
                      value={newQuoteData.category}
                      onChange={(e) => setNewQuoteData({ ...newQuoteData, category: e.target.value as QuoteCategoryKey })}
                      className="w-full bg-[#090A0E] border border-white/15 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-white/40"
                    >
                      {Object.values(QUOTE_CATEGORIES).map(cat => (
                        <option key={cat.key} value={cat.key}>{cat.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-white block">Tags (comma-separated)</label>
                  <input
                    type="text"
                    value={newQuoteData.tags}
                    onChange={(e) => setNewQuoteData({ ...newQuoteData, tags: e.target.value })}
                    placeholder="e.g. wisdom, stoicism, healing"
                    className="w-full bg-white/5 border border-white/15 rounded-xl p-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white/40"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-white block">Attribution / Work</label>
                    <input
                      type="text"
                      value={newQuoteData.attribution}
                      onChange={(e) => setNewQuoteData({ ...newQuoteData, attribution: e.target.value })}
                      placeholder="e.g. Meditations, Book IV"
                      className="w-full bg-white/5 border border-white/15 rounded-xl p-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white/40"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-white block">Source URL (optional)</label>
                    <input
                      type="url"
                      value={newQuoteData.sourceUrl}
                      onChange={(e) => setNewQuoteData({ ...newQuoteData, sourceUrl: e.target.value })}
                      placeholder="https://..."
                      className="w-full bg-white/5 border border-white/15 rounded-xl p-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white/40"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
                  <GlassButton variant="subtle" onClick={() => setIsAddQuoteModalOpen(false)}>
                    Cancel
                  </GlassButton>
                  <GlassButton variant="primary" type="submit">
                    Add to Library
                  </GlassButton>
                </div>
              </form>
            </GlassModal>
          )}

          {/* Assign Daily Featured Quote Modal */}
          {assignDailyQuoteModal && (
            <GlassModal
              isOpen={Boolean(assignDailyQuoteModal)}
              onClose={() => setAssignDailyQuoteModal(null)}
              title="Lock Featured Daily Quote"
              subtitle={`Assign quote to ${assignDailyQuoteModal.dateStr}`}
              maxWidth="md"
            >
              <div className="space-y-4 text-xs">
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <p className="font-serif italic text-white text-sm mb-1">
                    "{assignDailyQuoteModal.quote?.text}"
                  </p>
                  <span className="text-zinc-400 font-medium">
                    — {assignDailyQuoteModal.quote?.author}
                  </span>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-white block">Calendar Date (YYYY-MM-DD)</label>
                  <input
                    type="date"
                    value={assignDailyQuoteModal.dateStr}
                    onChange={(e) => setAssignDailyQuoteModal({
                      ...assignDailyQuoteModal,
                      dateStr: e.target.value
                    })}
                    className="w-full bg-white/5 border border-white/15 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-white/40"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-white block">Daily Reflection Question</label>
                  <textarea
                    rows={2}
                    value={assignDailyQuoteModal.reflectionQuestion}
                    onChange={(e) => setAssignDailyQuoteModal({
                      ...assignDailyQuoteModal,
                      reflectionQuestion: e.target.value
                    })}
                    placeholder="Thought-provoking question for users..."
                    className="w-full bg-white/5 border border-white/15 rounded-xl p-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white/40"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
                  <GlassButton variant="subtle" onClick={() => setAssignDailyQuoteModal(null)}>
                    Cancel
                  </GlassButton>
                  <GlassButton variant="primary" onClick={handleConfirmDailyQuote}>
                    Lock Daily Quote
                  </GlassButton>
                </div>
              </div>
            </GlassModal>
          )}

          {/* Kill Switch Modal */}
          {killModalFeature && (
            <GlassModal
              isOpen={Boolean(killModalFeature)}
              onClose={() => setKillModalFeature(null)}
              title={`${killModalFeature.killSwitchActive ? 'Release' : 'Trip'} Emergency Kill-Switch`}
              subtitle={killModalFeature.name}
              maxWidth="md"
            >
              <div className="space-y-4 text-xs">
                <p className="text-zinc-300 leading-relaxed">
                  {killModalFeature.killSwitchActive
                    ? 'Releasing the kill-switch will restore the module to its normal rollout and user preference rules.'
                    : 'Tripping the emergency kill-switch immediately shuts off the module platform-wide for all users with zero client redeployments.'}
                </p>

                <div className="space-y-1">
                  <label className="font-bold text-white block">
                    Mandatory Audit Governance Reason:
                  </label>
                  <textarea
                    value={killReason}
                    onChange={(e) => setKillReason(e.target.value)}
                    placeholder="Provide explicit operational or security reason for this change..."
                    rows={3}
                    className="w-full bg-white/5 border border-white/15 rounded-xl p-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white/40"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <GlassButton variant="subtle" onClick={() => setKillModalFeature(null)}>
                    Cancel
                  </GlassButton>
                  <GlassButton
                    variant={killModalFeature.killSwitchActive ? 'primary' : 'danger'}
                    onClick={async () => {
                      if (!killReason.trim()) {
                        showToast('⚠️ A governance reason is strictly required.');
                        return;
                      }
                      const next = !killModalFeature.killSwitchActive;
                      await FeatureControlService.tripKillSwitch(
                        killModalFeature.id,
                        next,
                        killReason.trim()
                      );
                      setKillModalFeature(null);
                      refreshAdminControlLayer();
                      showToast(`Kill-switch ${next ? 'tripped' : 'released'} for ${killModalFeature.name}`);
                    }}
                  >
                    Confirm {killModalFeature.killSwitchActive ? 'Release' : 'Trip'}
                  </GlassButton>
                </div>
              </div>
            </GlassModal>
          )}

          {/* Rollout % Adjuster Modal */}
          {rolloutModalFeature && (
            <GlassModal
              isOpen={Boolean(rolloutModalFeature)}
              onClose={() => setRolloutModalFeature(null)}
              title="Adjust Controlled Rollout Percentage"
              subtitle={rolloutModalFeature.name}
              maxWidth="md"
            >
              <div className="space-y-4 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">Target Population:</span>
                  <span className="font-mono text-base font-bold text-emerald-400">
                    {rolloutPercentageInput}%
                  </span>
                </div>

                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={rolloutPercentageInput}
                  onChange={(e) => setRolloutPercentageInput(Number(e.target.value))}
                  className="w-full accent-white cursor-pointer"
                />

                <div className="space-y-1">
                  <label className="font-bold text-white block">
                    Reason for Rollout Adjustment:
                  </label>
                  <input
                    type="text"
                    value={rolloutReason}
                    onChange={(e) => setRolloutReason(e.target.value)}
                    placeholder="e.g. Expanding Phase 3 rollout to 50% cohort"
                    className="w-full bg-white/5 border border-white/15 rounded-xl p-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white/40"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <GlassButton variant="subtle" onClick={() => setRolloutModalFeature(null)}>
                    Cancel
                  </GlassButton>
                  <GlassButton
                    variant="primary"
                    onClick={async () => {
                      if (!rolloutReason.trim()) {
                        showToast('⚠️ A governance reason is required.');
                        return;
                      }
                      await FeatureControlService.updateAdminFlag(rolloutModalFeature.id, {
                        rolloutPercentage: rolloutPercentageInput,
                        reason: rolloutReason.trim()
                      });
                      setRolloutModalFeature(null);
                      refreshAdminControlLayer();
                      showToast(`Rollout set to ${rolloutPercentageInput}% for ${rolloutModalFeature.name}`);
                    }}
                  >
                    Save Rollout
                  </GlassButton>
                </div>
              </div>
            </GlassModal>
          )}

        </div>
      )}

    </div>
  );
};
