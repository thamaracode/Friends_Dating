import React, { useState, useEffect, useCallback } from 'react';
import { 
  Compass, 
  Heart, 
  X, 
  Sparkles, 
  Bookmark, 
  BookmarkCheck, 
  Users, 
  Flame, 
  Palette, 
  Briefcase, 
  Globe, 
  BookOpen, 
  SlidersHorizontal, 
  RotateCcw, 
  CheckCircle2, 
  Send, 
  MapPin, 
  ShieldCheck, 
  Info, 
  MessageCircle, 
  UserMinus, 
  ArrowRight,
  HelpCircle,
  Clock,
  Coffee,
  Moon,
  Sun
} from 'lucide-react';
import { discoveryApiClient } from '../../services/discoveryApiClient';
import type { 
  DiscoveryFeedItem, 
  DiscoveryProfile, 
  ConnectionType, 
  ExplainableResonanceReport,
  MatchingTerminologyConcept,
  UserConnection,
  ConnectionTypeMetadata
} from '../../types/discovery';
import { CONNECTION_TYPES_METADATA } from '../../types/discovery';

interface SocialDiscoveryEngineViewProps {
  currentUserId?: string;
  onInitiateChat?: (profile: any) => void;
  onOpenProfileDetail?: (profile: any) => void;
}

export const SocialDiscoveryEngineView: React.FC<SocialDiscoveryEngineViewProps> = ({
  currentUserId = 'usr_me',
  onInitiateChat,
  onOpenProfileDetail
}) => {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<'feed' | 'connections' | 'saved' | 'lexicon'>('feed');

  // Feed State
  const [items, setItems] = useState<DiscoveryFeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedConnectionType, setSelectedConnectionType] = useState<ConnectionType | 'all'>('all');
  const [sortBy, setSortBy] = useState<'resonance' | 'recently_active' | 'new_members' | 'shared_interests'>('resonance');
  const [cityFilter, setCityFilter] = useState('');
  const [totalMatches, setTotalMatches] = useState(0);

  // Modals & Drawers
  const [activeExplainReport, setActiveExplainReport] = useState<{
    profile: DiscoveryProfile;
    report: ExplainableResonanceReport;
  } | null>(null);

  const [connectModalProfile, setConnectModalProfile] = useState<DiscoveryProfile | null>(null);
  const [connectNote, setConnectNote] = useState('');
  const [connectIntention, setConnectIntention] = useState<ConnectionType>('friendship');
  const [connectSending, setConnectSending] = useState(false);

  // Mutual Match Celebration
  const [mutualMatchCelebration, setMutualMatchCelebration] = useState<{
    profile: DiscoveryProfile;
    connectionType: ConnectionType;
  } | null>(null);

  // Connections & Saved
  const [connections, setConnections] = useState<UserConnection[]>([]);
  const [savedProfiles, setSavedProfiles] = useState<DiscoveryFeedItem[]>([]);

  // Lexicon State
  const [concepts, setConcepts] = useState<MatchingTerminologyConcept[]>([]);

  // Feedback notifications
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Fetch Feed
  const fetchFeed = useCallback(async () => {
    try {
      setLoading(true);
      const res = await discoveryApiClient.getDiscoveryFeed(currentUserId, {
        connectionType: selectedConnectionType,
        sortBy,
        city: cityFilter || undefined,
        limit: 15
      });
      setItems(res.items);
      setTotalMatches(res.total);
    } catch (err) {
      console.error('Failed to load feed:', err);
    } finally {
      setLoading(false);
    }
  }, [currentUserId, selectedConnectionType, sortBy, cityFilter]);

  // Fetch Connections
  const fetchConnections = useCallback(async () => {
    try {
      const data = await discoveryApiClient.getConnections(undefined, currentUserId);
      setConnections(data);
    } catch (err) {
      console.error('Failed to load connections:', err);
    }
  }, [currentUserId]);

  // Fetch Saved Profiles
  const fetchSaved = useCallback(async () => {
    try {
      const data = await discoveryApiClient.getSavedProfiles(currentUserId);
      setSavedProfiles(data);
    } catch (err) {
      console.error('Failed to load saved profiles:', err);
    }
  }, [currentUserId]);

  // Fetch Terminology
  const fetchTerminology = useCallback(async () => {
    try {
      const data = await discoveryApiClient.getTerminology();
      setConcepts(data.concepts);
    } catch (err) {
      console.error('Failed to load terminology:', err);
    }
  }, []);

  useEffect(() => {
    fetchFeed();
  }, [fetchFeed]);

  useEffect(() => {
    if (activeTab === 'connections') fetchConnections();
    if (activeTab === 'saved') fetchSaved();
    if (activeTab === 'lexicon') fetchTerminology();
  }, [activeTab, fetchConnections, fetchSaved, fetchTerminology]);

  // Interaction Handlers
  const handleLike = async (profile: DiscoveryProfile) => {
    try {
      const res = await discoveryApiClient.recordInteraction(
        profile.id,
        'like',
        profile.primary_intention,
        currentUserId
      );
      if (res.mutualMatchEstablished) {
        setMutualMatchCelebration({
          profile,
          connectionType: profile.primary_intention
        });
      } else {
        showToast(`Sent appreciation to ${profile.name}`);
      }
      setItems(prev => prev.filter(i => i.profile.id !== profile.id));
    } catch {
      showToast('Could not record interaction');
    }
  };

  const handlePass = async (profile: DiscoveryProfile) => {
    try {
      await discoveryApiClient.recordInteraction(profile.id, 'pass', undefined, currentUserId);
      setItems(prev => prev.filter(i => i.profile.id !== profile.id));
      showToast(`Passed ${profile.name} (hidden for 7 days)`);
    } catch {
      showToast('Could not record pass');
    }
  };

  const handleToggleSave = async (profile: DiscoveryProfile, currentlySaved: boolean) => {
    try {
      await discoveryApiClient.recordInteraction(profile.id, 'save', undefined, currentUserId);
      setItems(prev => prev.map(i => i.profile.id === profile.id ? { ...i, isSaved: !currentlySaved } : i));
      showToast(currentlySaved ? `Removed ${profile.name} from saved` : `Saved ${profile.name} to bookmarks`);
      if (activeTab === 'saved') fetchSaved();
    } catch {
      showToast('Could not save profile');
    }
  };

  const handleResetPasses = async () => {
    try {
      const count = await discoveryApiClient.resetPasses(currentUserId);
      showToast(`Restored ${count} passed profiles to discovery feed`);
      fetchFeed();
    } catch {
      showToast('Failed to reset passed profiles');
    }
  };

  const handleSendConnectionRequest = async () => {
    if (!connectModalProfile) return;
    try {
      setConnectSending(true);
      const res = await discoveryApiClient.sendConnectionRequest(
        connectModalProfile.id,
        connectIntention,
        connectNote,
        currentUserId
      );
      if (res.success) {
        showToast(`Connection request sent to ${connectModalProfile.name}!`);
        setConnectModalProfile(null);
        setConnectNote('');
        setItems(prev => prev.filter(i => i.profile.id !== connectModalProfile.id));
      } else {
        showToast(res.error || 'Failed to send request');
      }
    } catch {
      showToast('Failed to send connection request');
    } finally {
      setConnectSending(false);
    }
  };

  const handleUnmatch = async (targetUserId: string) => {
    if (!confirm('Are you sure you want to unmatch? This will dissolve the connection channel.')) return;
    try {
      await discoveryApiClient.unmatch(targetUserId, currentUserId);
      showToast('Connection dissolved');
      fetchConnections();
    } catch {
      showToast('Failed to unmatch');
    }
  };

  return (
    <div className="w-full space-y-6 text-white pb-24 animate-fadeIn">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-2xl bg-zinc-900/95 border border-white/20 text-xs text-white shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-bottom-3 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-indigo-950/40 via-zinc-900/60 to-purple-950/30 border border-white/10 shadow-2xl relative overflow-hidden backdrop-blur-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 uppercase tracking-widest">
                Master Discovery Engine
              </span>
              <span className="text-xs text-zinc-400 font-mono">
                {totalMatches} Active Candidates
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
              <Compass className="w-7 h-7 text-purple-400" />
              <span>Social Discovery & Resonance Engine</span>
            </h1>
            <p className="text-xs sm:text-sm text-zinc-300 max-w-2xl leading-relaxed">
              Discover people across 9 diverse connection intentions. Powered by a transparent 7-dimension resonance model without black-box predictive claims.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleResetPasses}
              className="px-3.5 py-2 rounded-2xl bg-white/[0.06] hover:bg-white/15 text-zinc-300 hover:text-white border border-white/10 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
              title="Restore passed profiles"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Passes</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 mt-6 pt-4 border-t border-white/[0.08] overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('feed')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === 'feed'
                ? 'bg-white text-zinc-950 shadow-lg'
                : 'bg-white/[0.04] text-zinc-400 hover:text-white hover:bg-white/[0.08]'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>Discover Feed</span>
          </button>

          <button
            onClick={() => setActiveTab('connections')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === 'connections'
                ? 'bg-white text-zinc-950 shadow-lg'
                : 'bg-white/[0.04] text-zinc-400 hover:text-white hover:bg-white/[0.08]'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>My Connections ({connections.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('saved')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === 'saved'
                ? 'bg-white text-zinc-950 shadow-lg'
                : 'bg-white/[0.04] text-zinc-400 hover:text-white hover:bg-white/[0.08]'
            }`}
          >
            <Bookmark className="w-4 h-4" />
            <span>Saved ({savedProfiles.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('lexicon')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === 'lexicon'
                ? 'bg-white text-zinc-950 shadow-lg'
                : 'bg-white/[0.04] text-zinc-400 hover:text-white hover:bg-white/[0.08]'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>Matching Concepts</span>
          </button>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* TAB 1: MAIN DISCOVERY FEED                                            */}
      {/* ===================================================================== */}
      {activeTab === 'feed' && (
        <div className="space-y-6">
          {/* Connection Type Pill Filters */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
              Filter by Relational Intention:
            </span>
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              <button
                onClick={() => setSelectedConnectionType('all')}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer shrink-0 border ${
                  selectedConnectionType === 'all'
                    ? 'bg-purple-600 text-white border-purple-400 shadow-md shadow-purple-600/30'
                    : 'bg-white/[0.04] text-zinc-400 border-white/10 hover:text-white hover:bg-white/10'
                }`}
              >
                All Intentions
              </button>

              {Object.values(CONNECTION_TYPES_METADATA).map(meta => (
                <button
                  key={meta.id}
                  onClick={() => setSelectedConnectionType(meta.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer shrink-0 border flex items-center gap-1.5 ${
                    selectedConnectionType === meta.id
                      ? 'bg-purple-600 text-white border-purple-400 shadow-md shadow-purple-600/30'
                      : 'bg-white/[0.04] text-zinc-400 border-white/10 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <span>{meta.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Secondary Sorting & Proximity Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-white/[0.03] border border-white/[0.08]">
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-400">Sort By:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-black/60 border border-white/15 rounded-xl px-2.5 py-1 text-xs text-zinc-200 focus:outline-none focus:border-purple-400 cursor-pointer"
              >
                <option value="resonance">Resonance Score</option>
                <option value="recently_active">Recently Active</option>
                <option value="new_members">New Members</option>
                <option value="shared_interests">Shared Interests</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-zinc-400" />
              <input
                type="text"
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                placeholder="Filter by city (e.g. Colombo, Kandy)..."
                className="bg-black/40 border border-white/10 rounded-xl px-3 py-1 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-purple-400"
              />
            </div>
          </div>

          {/* Candidate Profile Cards Grid */}
          {loading ? (
            <div className="text-center py-16 space-y-3">
              <Compass className="w-8 h-8 text-purple-400 animate-spin mx-auto" />
              <p className="text-sm text-zinc-400">Computing 7-dimension resonance scores...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-16 p-8 rounded-3xl bg-white/[0.02] border border-white/10 space-y-3">
              <Compass className="w-10 h-10 text-zinc-500 mx-auto" />
              <h3 className="text-base font-bold text-white">No candidates matching your current criteria</h3>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                Try resetting your relational intention filter, broadening your city search, or resetting passed profiles.
              </p>
              <button
                onClick={handleResetPasses}
                className="px-4 py-2 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition-all cursor-pointer"
              >
                Reset Passed Profiles
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map(({ profile, resonance, isSaved }) => {
                const intentionMeta = CONNECTION_TYPES_METADATA[profile.primary_intention];

                return (
                  <div
                    key={profile.id}
                    className="rounded-3xl bg-zinc-900/70 border border-white/10 p-5 space-y-4 shadow-xl hover:border-purple-500/40 transition-all flex flex-col justify-between group backdrop-blur-md relative overflow-hidden"
                  >
                    {/* Top User Header */}
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={profile.avatar_url}
                            alt={profile.name}
                            className="w-12 h-12 rounded-2xl object-cover border border-white/20 shadow-md"
                          />
                          <div>
                            <div className="flex items-center gap-1.5">
                              <h3 className="text-sm font-bold text-white">{profile.name}</h3>
                              {profile.verified && (
                                <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
                              )}
                            </div>
                            <div className="text-[11px] text-zinc-400 flex items-center gap-1">
                              <span>{profile.age} yrs</span>
                              <span>•</span>
                              <span>{profile.city}</span>
                            </div>
                          </div>
                        </div>

                        {/* Resonance Score Badge */}
                        <div
                          onClick={() => setActiveExplainReport({ profile, report: resonance })}
                          className="px-2.5 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs font-extrabold flex items-center gap-1 cursor-pointer hover:bg-purple-500/25 transition-all shadow-sm"
                          title="Click to view transparent 7-dimension score breakdown"
                        >
                          <Sparkles className="w-3 h-3 text-purple-400" />
                          <span>{resonance.overallResonanceScore}%</span>
                        </div>
                      </div>

                      {/* Primary Intention Pill */}
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-zinc-200 border border-white/15">
                          {intentionMeta.label}
                        </span>
                        <span className="text-[10px] text-zinc-500 font-mono">
                          {resonance.dimensions[0]?.matchedItems?.length ? `${resonance.dimensions[0].matchedItems.length} shared values` : 'Diverse perspectives'}
                        </span>
                      </div>

                      {/* Tagline & Bio */}
                      <p className="text-xs text-zinc-300 line-clamp-2 italic">
                        "{profile.tagline}"
                      </p>

                      {/* Core Values Tags */}
                      <div className="space-y-1">
                        <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider block">
                          Core Values:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {profile.core_values.slice(0, 3).map((val, idx) => (
                            <span
                              key={idx}
                              className={`text-[10px] px-2 py-0.5 rounded-md border ${
                                resonance.sharedValues.includes(val)
                                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-semibold'
                                  : 'bg-white/[0.04] text-zinc-400 border-white/[0.06]'
                              }`}
                            >
                              {val}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Interests Tags */}
                      <div className="space-y-1">
                        <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider block">
                          Passions & Interests:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {profile.interests.slice(0, 3).map((int, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] px-2 py-0.5 rounded-md bg-white/[0.04] text-zinc-300 border border-white/[0.06]"
                            >
                              {int}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Bottom Action Bar */}
                    <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handlePass(profile)}
                          className="p-2.5 rounded-2xl bg-white/[0.05] hover:bg-rose-500/20 text-zinc-400 hover:text-rose-400 transition-all cursor-pointer border border-white/10"
                          title="Pass (hide profile for 7 days)"
                        >
                          <X className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleToggleSave(profile, isSaved)}
                          className={`p-2.5 rounded-2xl transition-all cursor-pointer border ${
                            isSaved
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                              : 'bg-white/[0.05] hover:bg-white/15 text-zinc-400 hover:text-white border-white/10'
                          }`}
                          title="Bookmark profile"
                        >
                          <Bookmark className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => setActiveExplainReport({ profile, report: resonance })}
                          className="p-2.5 rounded-2xl bg-white/[0.05] hover:bg-purple-500/20 text-zinc-400 hover:text-purple-300 transition-all cursor-pointer border border-white/10"
                          title="Explain Resonance Breakdown"
                        >
                          <Sparkles className="w-4 h-4 text-purple-400" />
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setConnectModalProfile(profile);
                            setConnectIntention(profile.primary_intention);
                          }}
                          className="px-3 py-2 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-all cursor-pointer border border-white/15 flex items-center gap-1.5"
                          title="Send custom connection request"
                        >
                          <Send className="w-3 h-3 text-purple-400" />
                          <span>Connect</span>
                        </button>

                        <button
                          onClick={() => handleLike(profile)}
                          className="p-2.5 rounded-2xl bg-gradient-to-r from-rose-600 to-purple-600 text-white hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-lg shadow-rose-600/30"
                          title="Appreciate / Like Profile"
                        >
                          <Heart className="w-4 h-4 fill-white" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 2: MY ESTABLISHED CONNECTIONS                                     */}
      {/* ===================================================================== */}
      {activeTab === 'connections' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-400" />
              <span>Active Relational Connections ({connections.length})</span>
            </h2>
            <span className="text-xs text-zinc-400">Mutual consent established</span>
          </div>

          {connections.length === 0 ? (
            <div className="text-center py-16 p-8 rounded-3xl bg-white/[0.02] border border-white/10 space-y-3">
              <Users className="w-10 h-10 text-zinc-500 mx-auto" />
              <h3 className="text-base font-bold text-white">No active connections yet</h3>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                Explore the discovery feed or send connection requests to people whose values align with yours.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {connections.map(conn => {
                const partner = conn.partner_profile;
                if (!partner) return null;
                const intentionMeta = CONNECTION_TYPES_METADATA[conn.connection_type];

                return (
                  <div
                    key={conn.id}
                    className="p-5 rounded-3xl bg-zinc-900/60 border border-white/10 flex items-center justify-between gap-4 shadow-xl backdrop-blur-md"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={partner.avatar_url}
                        alt={partner.name}
                        className="w-12 h-12 rounded-2xl object-cover border border-white/20"
                      />
                      <div>
                        <h4 className="text-sm font-bold text-white">{partner.name}</h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                            {intentionMeta?.label || conn.connection_type}
                          </span>
                          <span className="text-[10px] text-zinc-400">{partner.city}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {onInitiateChat && (
                        <button
                          onClick={() => onInitiateChat(partner)}
                          className="px-3 py-2 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border border-white/15"
                        >
                          <MessageCircle className="w-3.5 h-3.5 text-purple-400" />
                          <span>Chat</span>
                        </button>
                      )}

                      <button
                        onClick={() => handleUnmatch(partner.id)}
                        className="p-2 rounded-2xl bg-white/[0.04] hover:bg-rose-500/20 text-zinc-400 hover:text-rose-400 transition-all cursor-pointer border border-white/10"
                        title="Unmatch / Dissolve Connection"
                      >
                        <UserMinus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 3: SAVED PROFILES                                                 */}
      {/* ===================================================================== */}
      {activeTab === 'saved' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Bookmark className="w-5 h-5 text-amber-400" />
              <span>Bookmarked Profiles ({savedProfiles.length})</span>
            </h2>
          </div>

          {savedProfiles.length === 0 ? (
            <div className="text-center py-16 p-8 rounded-3xl bg-white/[0.02] border border-white/10 space-y-3">
              <Bookmark className="w-10 h-10 text-zinc-500 mx-auto" />
              <h3 className="text-base font-bold text-white">No saved profiles</h3>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                Bookmark profiles in the discovery feed to review them later at your own pace.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedProfiles.map(({ profile, resonance }) => (
                <div
                  key={profile.id}
                  className="p-5 rounded-3xl bg-zinc-900/60 border border-white/10 space-y-3 shadow-xl backdrop-blur-md"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={profile.avatar_url}
                        alt={profile.name}
                        className="w-10 h-10 rounded-2xl object-cover border border-white/20"
                      />
                      <div>
                        <h4 className="text-sm font-bold text-white">{profile.name}</h4>
                        <span className="text-[10px] text-zinc-400">{profile.city}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleToggleSave(profile, true)}
                      className="p-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 cursor-pointer"
                      title="Remove bookmark"
                    >
                      <BookmarkCheck className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs text-zinc-300 italic">"{profile.tagline}"</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 4: MATCHING TERMINOLOGY ENCYCLOPEDIA                               */}
      {/* ===================================================================== */}
      {activeTab === 'lexicon' && (
        <div className="space-y-6">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-purple-400" />
              <span>Matching Terminology & Epistemic Distinctions</span>
            </h2>
            <p className="text-xs text-zinc-400">
              Clear vocabulary to distinguish compatibility, similarity, complementarity, and mutual consent.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {concepts.map(concept => (
              <div
                key={concept.id}
                className="p-5 rounded-3xl bg-zinc-900/60 border border-white/10 space-y-3 shadow-xl backdrop-blur-md"
              >
                <div className="flex items-center justify-between border-b border-white/[0.08] pb-2">
                  <h3 className="text-sm font-bold text-purple-300">{concept.term}</h3>
                  <span className="text-[9px] uppercase font-mono px-2 py-0.5 rounded-full bg-white/10 text-zinc-300">
                    Concept
                  </span>
                </div>
                <div className="space-y-2 text-xs">
                  <div>
                    <span className="font-bold text-zinc-400 block text-[10px] uppercase">Definition:</span>
                    <p className="text-zinc-200 mt-0.5">{concept.definition}</p>
                  </div>
                  <div>
                    <span className="font-bold text-zinc-400 block text-[10px] uppercase">Distinction:</span>
                    <p className="text-zinc-400 mt-0.5">{concept.distinctionFromOthers}</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-purple-950/30 border border-purple-500/20 text-purple-200">
                    <span className="font-bold block text-[9px] uppercase text-purple-400">Practical Example:</span>
                    <p className="mt-0.5 italic">{concept.practicalExample}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 1: EXPLAINABLE RESONANCE REPORT (7 DIMENSIONS + DISCLAIMER)     */}
      {/* ===================================================================== */}
      {activeExplainReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-fadeIn">
          <div className="w-full max-w-xl max-h-[85vh] rounded-3xl bg-zinc-900 border border-purple-500/30 p-6 space-y-6 shadow-2xl overflow-y-auto">
            <div className="flex items-start justify-between border-b border-white/10 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-purple-400">
                    Resonance Architecture
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-xs font-black bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    {activeExplainReport.report.overallResonanceScore}% Overall
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>Resonance with {activeExplainReport.profile.name}</span>
                </h3>
              </div>
              <button
                onClick={() => setActiveExplainReport(null)}
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-zinc-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Similarity vs Complementarity Dual Meters */}
            <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08]">
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-400 font-semibold">Similarity</span>
                  <span className="text-purple-300 font-mono font-bold">{activeExplainReport.report.similarityScore}%</span>
                </div>
                <div className="w-full bg-black/50 h-2 rounded-full overflow-hidden">
                  <div className="bg-purple-500 h-full rounded-full" style={{ width: `${activeExplainReport.report.similarityScore}%` }} />
                </div>
                <span className="text-[9px] text-zinc-500 block">Direct overlap in values & hobbies</span>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-400 font-semibold">Complementarity</span>
                  <span className="text-sky-300 font-mono font-bold">{activeExplainReport.report.complementarityScore}%</span>
                </div>
                <div className="w-full bg-black/50 h-2 rounded-full overflow-hidden">
                  <div className="bg-sky-500 h-full rounded-full" style={{ width: `${activeExplainReport.report.complementarityScore}%` }} />
                </div>
                <span className="text-[9px] text-zinc-500 block">Harmonious differences & social balance</span>
              </div>
            </div>

            {/* 7 Scoring Dimensions Bars */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                7-Dimension Scoring Breakdown:
              </h4>
              <div className="space-y-2.5">
                {activeExplainReport.report.dimensions.map((dim, idx) => (
                  <div key={idx} className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-white flex items-center gap-1.5">
                        <span>{dim.label}</span>
                        <span className="text-[10px] text-zinc-500 font-mono font-normal">({Math.round(dim.weight * 100)}% weight)</span>
                      </span>
                      <span className="font-mono font-bold text-purple-300">{dim.score}/100</span>
                    </div>
                    <div className="w-full bg-black/50 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-purple-500 to-indigo-500 h-full rounded-full"
                        style={{ width: `${dim.score}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-zinc-400">{dim.explanation}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Mandatory Non-Predictive Disclaimer */}
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs space-y-1">
              <span className="font-bold block text-[10px] uppercase text-amber-400">
                Ethical & Clinical Non-Predictive Disclaimer:
              </span>
              <p className="text-[11px] leading-relaxed">
                {activeExplainReport.report.disclaimer}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 2: SEND CONNECTION REQUEST                                      */}
      {/* ===================================================================== */}
      {connectModalProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-fadeIn">
          <div className="w-full max-w-md rounded-3xl bg-zinc-900 border border-white/20 p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Send className="w-4 h-4 text-purple-400" />
                <span>Connect with {connectModalProfile.name}</span>
              </h3>
              <button
                onClick={() => setConnectModalProfile(null)}
                className="p-1 rounded-full text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                  Intended Connection Type:
                </label>
                <select
                  value={connectIntention}
                  onChange={(e) => setConnectIntention(e.target.value as ConnectionType)}
                  className="w-full bg-black/60 border border-white/20 rounded-2xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-400"
                >
                  {Object.values(CONNECTION_TYPES_METADATA).map(meta => (
                    <option key={meta.id} value={meta.id}>
                      {meta.label} — {meta.description}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                  Personalized Opening Note (Optional):
                </label>
                <textarea
                  value={connectNote}
                  onChange={(e) => setConnectNote(e.target.value)}
                  placeholder="Mention a shared interest, book, or reason you would love to connect..."
                  rows={3}
                  className="w-full bg-black/60 border border-white/20 rounded-2xl p-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-purple-400"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setConnectModalProfile(null)}
                className="flex-1 py-2.5 rounded-2xl bg-white/[0.06] hover:bg-white/10 text-xs font-semibold text-zinc-300 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                disabled={connectSending}
                onClick={handleSendConnectionRequest}
                className="flex-1 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white transition-all cursor-pointer shadow-lg shadow-purple-600/30 flex items-center justify-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{connectSending ? 'Sending...' : 'Send Request'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 3: MUTUAL MATCH CELEBRATION MODAL                               */}
      {/* ===================================================================== */}
      {mutualMatchCelebration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-2xl animate-fadeIn">
          <div className="w-full max-w-sm rounded-3xl bg-gradient-to-b from-purple-900/90 via-zinc-900 to-black border border-purple-500/40 p-6 text-center space-y-5 shadow-2xl">
            <div className="w-16 h-16 rounded-3xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 mx-auto shadow-xl animate-bounce">
              <Heart className="w-8 h-8 fill-rose-500" />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-purple-400">
                Mutual Resonance Established!
              </span>
              <h3 className="text-xl font-black text-white">
                You and {mutualMatchCelebration.profile.name} liked each other!
              </h3>
              <p className="text-xs text-zinc-300">
                A shared connection for{' '}
                <strong className="text-purple-300">
                  {CONNECTION_TYPES_METADATA[mutualMatchCelebration.connectionType]?.label || mutualMatchCelebration.connectionType}
                </strong>{' '}
                has been established with mutual consent.
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setMutualMatchCelebration(null)}
                className="flex-1 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition-all cursor-pointer"
              >
                Keep Exploring
              </button>
              {onInitiateChat && (
                <button
                  onClick={() => {
                    const target = mutualMatchCelebration.profile;
                    setMutualMatchCelebration(null);
                    onInitiateChat(target);
                  }}
                  className="flex-1 py-2.5 rounded-2xl bg-white text-zinc-950 text-xs font-bold transition-all cursor-pointer shadow-lg hover:scale-105"
                >
                  Start Chatting
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
