import { useState } from 'react';
import { 
  ShieldCheck, 
  Globe, 
  ExternalLink, 
  Check, 
  RefreshCw, 
  Lock, 
  Sparkles, 
  Info, 
  Layers, 
  Key, 
  CheckCircle2, 
  X, 
  Music,
  Briefcase,
  Camera,
  Send,
  Video,
  Gamepad2,
  Calendar,
  BookOpen,
  Tv,
  HeartHandshake,
  Heart,
  MessageSquare,
  Search,
  Filter
} from 'lucide-react';
import { UNIVERSAL_DIRECTORY_SERVICES } from '../universalDirectoryData';
import type { 
  ProviderConnectionState, 
  SyncLevel, 
  ConnectProviderId, 
  DirectoryCategory, 
  CapabilityType,
  UniversalDirectoryService
} from '../types';

export const UniversalIdentityHub = () => {
  const [activeTab, setActiveTab] = useState<'directory' | 'connections' | 'login_preview' | 'architecture'>('directory');
  const [selectedCategory, setSelectedCategory] = useState<DirectoryCategory | 'all'>('all');
  const [selectedCapability, setSelectedCapability] = useState<CapabilityType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [syncingProvider, setSyncingProvider] = useState<string | null>(null);
  const [authHandshakeProvider, setAuthHandshakeProvider] = useState<string | null>(null);
  const [authFeedback, setAuthFeedback] = useState<string | null>(null);

  const handleOAuthInitiate = (providerName: string) => {
    setAuthHandshakeProvider(providerName);
    setAuthFeedback(`Initiating ${providerName} OAuth 2.0 PKCE handshake...`);
    setTimeout(() => {
      setAuthFeedback(`${providerName} authorization verified. Identity token received.`);
      setAuthHandshakeProvider(null);
      setTimeout(() => setAuthFeedback(null), 3000);
    }, 1200);
  };

  // Active user connections state
  const [userConnections, setUserConnections] = useState<Record<string, { isConnected: boolean; syncLevel: SyncLevel; identifier?: string }>>({
    srv_google: { isConnected: true, syncLevel: 'level_3_synchronized', identifier: 'kavindu.dev@gmail.com' },
    srv_linkedin: { isConnected: true, syncLevel: 'level_2_imported', identifier: 'kavindu-senanayake' },
    srv_spotify: { isConnected: true, syncLevel: 'level_3_synchronized', identifier: 'kavindu_sounds' },
    srv_instagram: { isConnected: true, syncLevel: 'level_1_connected', identifier: '@kavindu.visuals' },
    srv_github: { isConnected: true, syncLevel: 'level_2_imported', identifier: 'kavindu-s' },
    srv_discord: { isConnected: false, syncLevel: 'level_1_connected' },
    srv_steam: { isConnected: true, syncLevel: 'level_2_imported', identifier: 'kavindu_games' },
    srv_letterboxd: { isConnected: true, syncLevel: 'level_2_imported', identifier: 'kavindu_cinema' }
  });

  const getServiceIcon = (iconType: string) => {
    switch (iconType) {
      case 'Globe': return <Globe className="w-5 h-5 text-blue-400" />;
      case 'Lock': return <Lock className="w-5 h-5 text-slate-200" />;
      case 'Briefcase': return <Briefcase className="w-5 h-5 text-sky-400" />;
      case 'Gamepad2': return <Gamepad2 className="w-5 h-5 text-indigo-400" />;
      case 'Camera': return <Camera className="w-5 h-5 text-pink-400" />;
      case 'Video': return <Video className="w-5 h-5 text-rose-400" />;
      case 'MessageSquare': return <MessageSquare className="w-5 h-5 text-orange-400" />;
      case 'Send': return <Send className="w-5 h-5 text-emerald-400" />;
      case 'Music': return <Music className="w-5 h-5 text-emerald-400" />;
      case 'Calendar': return <Calendar className="w-5 h-5 text-amber-400" />;
      case 'BookOpen': return <BookOpen className="w-5 h-5 text-amber-500" />;
      case 'Tv': return <Tv className="w-5 h-5 text-purple-400" />;
      case 'HeartHandshake': return <HeartHandshake className="w-5 h-5 text-emerald-400" />;
      case 'Heart': return <Heart className="w-5 h-5 text-rose-500" />;
      default: return <Globe className="w-5 h-5 text-purple-400" />;
    }
  };

  const getCapabilityBadge = (cap: CapabilityType) => {
    switch (cap) {
      case 'A_sign_in':
        return <span key={cap} className="text-[9px] bg-blue-500/10 text-blue-300 border border-blue-500/30 px-1.5 py-0.5 rounded font-mono font-bold">Sign-in</span>;
      case 'B_account_link':
        return <span key={cap} className="text-[9px] bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 px-1.5 py-0.5 rounded font-mono font-bold">Account Link</span>;
      case 'C_data_import':
        return <span key={cap} className="text-[9px] bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.5 rounded font-mono font-bold">Data Import</span>;
      case 'D_sharing_deep_link':
        return <span key={cap} className="text-[9px] bg-purple-500/10 text-purple-300 border border-purple-500/30 px-1.5 py-0.5 rounded font-mono font-bold">Sharing Deep-Link</span>;
      case 'E_external_recommendation':
        return <span key={cap} className="text-[9px] bg-amber-500/10 text-amber-300 border border-amber-500/30 px-1.5 py-0.5 rounded font-mono font-bold">Curated Referral</span>;
      default:
        return null;
    }
  };

  const filteredDirectory = UNIVERSAL_DIRECTORY_SERVICES.filter(service => {
    const matchesCat = selectedCategory === 'all' || service.category === selectedCategory;
    const matchesCap = selectedCapability === 'all' || service.capabilities.includes(selectedCapability);
    const matchesQuery = service.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         service.potentialUse.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesCap && matchesQuery;
  });

  const toggleUserConnect = (serviceId: string) => {
    setUserConnections(prev => {
      const current = prev[serviceId] || { isConnected: false, syncLevel: 'level_1_connected' };
      return {
        ...prev,
        [serviceId]: {
          ...current,
          isConnected: !current.isConnected,
          identifier: !current.isConnected ? 'user_connected' : undefined
        }
      };
    });
  };

  const cycleSync = (serviceId: string) => {
    setUserConnections(prev => {
      const current = prev[serviceId] || { isConnected: true, syncLevel: 'level_1_connected' };
      let nextLevel: SyncLevel = 'level_1_connected';
      if (current.syncLevel === 'level_1_connected') nextLevel = 'level_2_imported';
      else if (current.syncLevel === 'level_2_imported') nextLevel = 'level_3_synchronized';
      else nextLevel = 'level_1_connected';

      return {
        ...prev,
        [serviceId]: { ...current, syncLevel: nextLevel }
      };
    });
  };

  const connectedCount = Object.values(userConnections).filter(c => c.isConnected).length;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      
      {/* 1. Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-950/40 via-indigo-950/40 to-slate-900 border border-blue-500/30 p-6 md:p-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs uppercase font-extrabold tracking-wider text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
                FRIENDS Universal Connections Directory
              </span>
              <span className="text-xs text-slate-400">50+ Services Across 5 Core Categories</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
              Your digital identity, connected across the internet.
            </h2>
            <p className="text-sm text-slate-300 mt-2 leading-relaxed">
              One central FRIENDS identity that lets you log in via Google, Apple or LinkedIn, 
              import your music taste from Spotify, book lists from Goodreads, and gaming obsessions from Steam—without 
              pretending every third-party service gives unrestricted access to their private data.
            </p>
          </div>

          <div className="bg-[#0f1422] border border-slate-800 p-4 rounded-2xl flex-shrink-0 text-center">
            <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest block">Your Active Links</span>
            <span className="text-2xl font-black text-white mt-0.5 block">{connectedCount}</span>
            <span className="text-[11px] text-slate-400">Accounts Synced</span>
          </div>
        </div>
      </div>

      {/* 2. Sub-Tabs Bar */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
        {[
          { id: 'directory', label: '1. Universal Provider Directory (50+ Services)', icon: Layers },
          { id: 'connections', label: '2. My Connected World (Manage Sync Tiers)', icon: ShieldCheck },
          { id: 'login_preview', label: '3. Universal Login Screen Preview', icon: Key },
          { id: 'architecture', label: '4. Security & Phased Rollout Architecture', icon: Sparkles }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/30'
                  : 'bg-slate-900 text-slate-300 border border-slate-800 hover:border-slate-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 3. TAB 1: UNIVERSAL PROVIDER DIRECTORY */}
      {activeTab === 'directory' && (
        <div className="space-y-6">
          
          {/* Filters & Search */}
          <div className="bg-[#121927] border border-slate-800 rounded-3xl p-5 space-y-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Search 50+ providers (e.g. Spotify, Steam, Apple, Letterboxd, Duolingo, Reddit)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Capability Quick-Filter */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
                {[
                  { id: 'all', label: 'All Capabilities' },
                  { id: 'A_sign_in', label: 'Sign-in' },
                  { id: 'C_data_import', label: 'Data Import' },
                  { id: 'D_sharing_deep_link', label: 'Share Link' },
                  { id: 'E_external_recommendation', label: 'Referral' }
                ].map((cap) => (
                  <button
                    key={cap.id}
                    onClick={() => setSelectedCapability(cap.id as any)}
                    className={`px-3 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap cursor-pointer transition ${
                      selectedCapability === cap.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
                    }`}
                  >
                    {cap.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Category Pills */}
            <div className="flex flex-wrap gap-1.5 pt-1 border-t border-slate-800/80">
              {[
                { id: 'all', label: 'All Categories' },
                { id: 'sign_in_identity', label: 'Sign-in & Identity' },
                { id: 'social_media', label: 'Social Media & Content' },
                { id: 'messaging_comms', label: 'Messaging' },
                { id: 'music_gaming_entertainment', label: 'Music, Gaming & Culture' },
                { id: 'education_career', label: 'Education & Career' },
                { id: 'productivity_calendar', label: 'Calendar & Productivity' },
                { id: 'dating_support_external', label: 'Curated Referrals' }
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id as any)}
                  className={`px-3 py-1 rounded-xl text-xs font-semibold cursor-pointer transition ${
                    selectedCategory === cat.id
                      ? 'bg-slate-800 text-blue-300 border border-blue-500/40'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Directory Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredDirectory.map((srv) => {
              const userConn = userConnections[srv.id];
              const isConnected = userConn?.isConnected;

              return (
                <div 
                  key={srv.id}
                  className={`bg-[#121927] border rounded-3xl p-5 flex flex-col justify-between gap-4 transition shadow-xl ${
                    isConnected ? 'border-blue-500/50 shadow-blue-500/10' : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div>
                    {/* Header: Icon, Name, Capabilities */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center">
                          {getServiceIcon(srv.iconType)}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h4 className="text-sm font-bold text-white">{srv.name}</h4>
                            {srv.officialUrl && (
                              <a href={srv.officialUrl} target="_blank" rel="noreferrer" className="text-slate-500 hover:text-slate-300">
                                <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400">{srv.categoryLabel}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => toggleUserConnect(srv.id)}
                        className={`text-[11px] px-2.5 py-1 rounded-xl font-bold cursor-pointer transition ${
                          isConnected 
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                        }`}
                      >
                        {isConnected ? 'Connected' : 'Link'}
                      </button>
                    </div>

                    {/* Capabilities Badges */}
                    <div className="flex flex-wrap gap-1 my-2">
                      {srv.capabilities.map(c => getCapabilityBadge(c))}
                    </div>

                    {/* Potential Use */}
                    <p className="text-xs text-slate-300 leading-relaxed mt-2">
                      {srv.potentialUse}
                    </p>

                    {/* Limitations & Privacy Note */}
                    <div className="mt-3 bg-black/20 p-2.5 rounded-xl border border-white/5 text-[10px] text-slate-500 leading-normal flex items-start gap-1.5">
                      <Info className="w-3 h-3 text-slate-500 flex-shrink-0 mt-0.5" />
                      <span>{srv.apiLimitationNote}</span>
                    </div>
                  </div>

                  {/* Connected Status Footer */}
                  {isConnected && (
                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                      <span className="text-blue-300 font-semibold capitalize">
                        {userConn.syncLevel.replace('_', ' ')}
                      </span>
                      <button
                        onClick={() => cycleSync(srv.id)}
                        className="text-[10px] text-slate-400 hover:text-white bg-slate-900 px-2 py-0.5 rounded border border-slate-800 cursor-pointer"
                      >
                        Change Level
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. TAB 2: MY CONNECTED WORLD (Manager) */}
      {activeTab === 'connections' && (
        <div className="bg-[#121927] border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <h3 className="text-xl font-bold text-white">My Active Account Connections</h3>
            <p className="text-xs text-slate-400 mt-1">
              Review and adjust data synchronization permissions for each connected account.
            </p>
          </div>

          <div className="space-y-4">
            {Object.entries(userConnections).filter(([_, c]) => c.isConnected).map(([srvId, conn]) => {
              const srv = UNIVERSAL_DIRECTORY_SERVICES.find(s => s.id === srvId);
              if (!srv) return null;

              return (
                <div key={srvId} className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center">
                      {getServiceIcon(srv.iconType)}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        <span>{srv.name}</span>
                        <span className="text-[10px] font-mono text-blue-400 font-normal">({conn.identifier || 'Active'})</span>
                      </h4>
                      <p className="text-xs text-slate-400">{srv.potentialUse}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <button
                      onClick={() => cycleSync(srvId)}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-xl text-xs font-semibold cursor-pointer transition capitalize"
                    >
                      {conn.syncLevel === 'level_1_connected' && 'Level 1: Link Only'}
                      {conn.syncLevel === 'level_2_imported' && 'Level 2: Snapshot'}
                      {conn.syncLevel === 'level_3_synchronized' && 'Level 3: Auto-Sync'}
                    </button>

                    <button
                      onClick={() => toggleUserConnect(srvId)}
                      className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-xl text-xs font-semibold cursor-pointer transition"
                    >
                      Disconnect
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. TAB 3: UNIVERSAL LOGIN SCREEN PREVIEW */}
      {activeTab === 'login_preview' && (
        <div className="max-w-md mx-auto bg-[#121927] border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6 text-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-500 via-indigo-500 to-purple-500 mx-auto flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <Sparkles className="w-6 h-6 text-white" />
          </div>

          <div>
            <h3 className="text-2xl font-black text-white">Welcome to FRIENDS</h3>
            <p className="text-xs text-slate-400 mt-1">One identity. Your connected world.</p>
          </div>

          {/* Auth Status Feedback */}
          {authFeedback && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-xl text-xs flex items-center justify-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>{authFeedback}</span>
            </div>
          )}

          {/* Social Auth Buttons */}
          <div className="space-y-2.5">
            <button 
              onClick={() => handleOAuthInitiate('Google')}
              disabled={Boolean(authHandshakeProvider)}
              className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white border border-slate-700/80 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition shadow-sm disabled:opacity-50"
            >
              <Globe className="w-4 h-4 text-rose-400" />
              <span>{authHandshakeProvider === 'Google' ? 'Connecting to Google...' : 'Continue with Google'}</span>
            </button>

            <button 
              onClick={() => handleOAuthInitiate('Apple')}
              disabled={Boolean(authHandshakeProvider)}
              className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white border border-slate-700/80 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition shadow-sm disabled:opacity-50"
            >
              <Lock className="w-4 h-4 text-slate-200" />
              <span>{authHandshakeProvider === 'Apple' ? 'Connecting to Apple...' : 'Continue with Apple'}</span>
            </button>

            <button 
              onClick={() => handleOAuthInitiate('LinkedIn')}
              disabled={Boolean(authHandshakeProvider)}
              className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white border border-slate-700/80 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition shadow-sm disabled:opacity-50"
            >
              <Briefcase className="w-4 h-4 text-sky-400" />
              <span>{authHandshakeProvider === 'LinkedIn' ? 'Connecting to LinkedIn...' : 'Continue with LinkedIn'}</span>
            </button>

            <button 
              onClick={() => handleOAuthInitiate('Facebook')}
              disabled={Boolean(authHandshakeProvider)}
              className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white border border-slate-700/80 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition shadow-sm disabled:opacity-50"
            >
              <Globe className="w-4 h-4 text-blue-500" />
              <span>{authHandshakeProvider === 'Facebook' ? 'Connecting to Facebook...' : 'Continue with Facebook'}</span>
            </button>
          </div>

          <div className="pt-2 text-[11px] text-slate-500 leading-relaxed border-t border-slate-800">
            By continuing, you agree to our Terms and Privacy Policy. FRIENDS separates authentication from profile importing—we never post on your behalf.
          </div>
        </div>
      )}

      {/* 6. TAB 4: ARCHITECTURE & PHASED ROLLOUT */}
      {activeTab === 'architecture' && (
        <div className="bg-[#121927] border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <h3 className="text-xl font-bold text-white">Provider Architecture & Phased Rollout</h3>
            <p className="text-xs text-slate-400 mt-1">
              Phased roadmap to integrate 50+ providers without hardcoding fragile column structures.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs text-slate-300 leading-relaxed">
            <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl space-y-2">
              <h4 className="text-sm font-bold text-blue-400 flex items-center gap-1.5">
                <Layers className="w-4 h-4" />
                <span>Modular Provider Registry Pattern</span>
              </h4>
              <p>
                • <strong>Database Entities</strong>: `auth_identities`, `linked_accounts`, `oauth_tokens` (AES-256 encrypted), `provider_permissions`, `sync_history`.<br />
                • <strong>Provider Capability Matrix</strong>: Defines for each service whether it provides Sign-in (A), Linking (B), Data Import (C), Deep Links (D), or Referral (E).<br />
                • <strong>Provenance Audit</strong>: Every profile field maintains a verified origin timestamp (e.g., `verified_via: spotify`).
              </p>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl space-y-2">
              <h4 className="text-sm font-bold text-indigo-400 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                <span>6-Phase Implementation Roadmap</span>
              </h4>
              <p>
                • <strong>Phase 1</strong>: Google, Apple, Facebook, Microsoft, LinkedIn, GitHub (Auth + Core Links).<br />
                • <strong>Phase 2</strong>: Instagram, Spotify, YouTube, Discord, Reddit, Telegram (Rich Profiles).<br />
                • <strong>Phase 3</strong>: TikTok, X, Twitch, Pinterest, Threads, Snapchat (Creator & Visual Identity).<br />
                • <strong>Phase 4</strong>: Google Calendar, Google Contacts, Outlook (Coordinated Gatherings).<br />
                • <strong>Phase 5</strong>: Steam, Letterboxd, AniList, Goodreads, Duolingo (Niche Obsessions).<br />
                • <strong>Phase 6</strong>: Custom OAuth & Partnership Referrals.
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
