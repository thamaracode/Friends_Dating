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
  Check 
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
      {/* SECTION 7: FEATURE FLAGS & CONFIGURATION                              */}
      {/* ===================================================================== */}
      {activeTab === 'system' && (
        <div className="space-y-4 animate-fadeIn">
          
          <div className="p-5 rounded-3xl dark-glass border border-white/10 shadow-lg space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              System Feature Flags & Toggles
            </h3>

            <div className="space-y-3 text-xs">
              {[
                { key: 'spotifyPlayerEnabled', label: 'Spotify Ambient Player & Embedded Audio', desc: 'Allows members to stream Spotify embeds and link profile anthems.' },
                { key: 'incognitoModeEnabled', label: 'Incognito Browsing Tier', desc: 'Allows Sanctuary VIP members to browse silently without discovery appearances.' },
                { key: 'crisis1926HotlineEnabled', label: '1926 Free Crisis Support Modal', desc: 'Provides immediate crisis dispatch and emotional support.' },
                { key: 'globalDiscoveryEnabled', label: 'Global Cross-City Discovery', desc: 'Expands match pools across international regions when nearby users are exhausted.' },
                { key: 'telegramLuckEmojiGames', label: 'Telegram Luck Emoji Sandboxed Games', desc: 'Enables 🎲 Dice, 🎰 Slots, and 🪙 Coin toss in chats.' },
                { key: 'automatedCatfishFilter', label: 'Automated Catfish & Phishing Guard', desc: 'Scans intro messages for external scam redirects.' }
              ].map(flag => {
                const isEnabled = featureFlags[flag.key as keyof typeof featureFlags];
                return (
                  <div key={flag.key} className="flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.03] border border-white/10">
                    <div>
                      <h5 className="font-bold text-white">{flag.label}</h5>
                      <p className="text-[10px] text-zinc-400 mt-0.5">{flag.desc}</p>
                    </div>
                    <button
                      onClick={() => {
                        setFeatureFlags(prev => ({ ...prev, [flag.key]: !isEnabled }));
                        showToast(`Feature flag "${flag.label}" toggled.`);
                      }}
                      className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                        isEnabled ? 'bg-white' : 'bg-black/60 border border-white/20'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full transition-transform absolute top-1 ${
                        isEnabled ? 'left-7 bg-[#090A0E]' : 'left-1 bg-white'
                      }`} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Database Diagnostics */}
          <div className="p-5 rounded-3xl dark-glass border border-white/10 shadow-lg flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-white">Database Backup & Diagnostics</h4>
              <p className="text-[11px] text-zinc-400 mt-0.5">Generate a full encrypted JSON snapshot of SQLite records.</p>
            </div>
            <button
              onClick={() => showToast('Full SQLite snapshot successfully generated & downloaded.')}
              className="px-4 py-2 rounded-xl gray-glass-btn text-xs font-bold text-white flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download DB Snapshot</span>
            </button>
          </div>

        </div>
      )}

    </div>
  );
};
