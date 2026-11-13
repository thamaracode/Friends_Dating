import React, { useState, useEffect } from 'react';
import { 
  Home, 
  Compass, 
  MessageCircle, 
  Bell, 
  Heart, 
  Users, 
  User, 
  Globe2, 
  PlusSquare, 
  Plus, 
  Search, 
  Sparkles, 
  Edit3, 
  Play, 
  Pause, 
  ChevronRight, 
  Eye, 
  Lock, 
  Settings, 
  Tv, 
  Moon, 
  LogOut, 
  Calendar, 
  BookOpen, 
  Boxes, 
  TrendingUp, 
  Music, 
  FileText, 
  ShieldAlert,
  Flame,
  Menu,
  X,
  Smartphone,
  Monitor,
  Wifi,
  Battery
} from 'lucide-react';
import { SearchBar, PulseBadge } from './klyven';

import { CURRENT_USER } from '../mockData';
import { profileWorldsClient } from '../services/profileWorldsApiClient';
import type { SoulverseRoute, MobilePrimaryTab, UserProfile } from '../types';
import type { ProfileWorld } from '../types/profileWorlds';

// Dedicated Mobile-First Experiences
import { SoulverseMobileNavbar } from './mobile/SoulverseMobileNavbar';
import { MobileCreateActionSheet } from './mobile/MobileCreateActionSheet';
import { SoulverseMobileDiscoverExperience } from './mobile/SoulverseMobileDiscoverExperience';
import { SoulverseMobileConnectExperience } from './mobile/SoulverseMobileConnectExperience';
import { SoulverseMobileProfileExperience } from './mobile/SoulverseMobileProfileExperience';

// Full Page Subsystems
import { SoulverseHomePage } from './SoulverseHomePage';
import { SoulverseConnectionsPage } from './SoulverseConnectionsPage';
import { SoulverseCollectionsPage } from './SoulverseCollectionsPage';
import { SoulverseAccountPage } from './SoulverseAccountPage';
import { SoulverseSettingsPage } from './SoulverseSettingsPage';
import { SoulverseMorePage } from './SoulverseMorePage';
import { DailyConnectionHub } from './DailyConnectionHub';
import { IdentityUniverseHub } from './IdentityUniverseHub';
import { MessagingInboxView } from './MessagingInboxView';
import { DesktopSoulverseView } from './DesktopSoulverseView';
import { ProfileWorldsHub } from './ProfileWorldsHub';
import { YearLifeTimelineView } from './YearLifeTimelineView';
import { GitHubMarkdownEditor } from './GitHubMarkdownEditor';
import { ProfileDetailSheet } from './ProfileDetailSheet';
import { EditProfileInfoModal } from './EditProfileInfoModal';
import { CrisisSupportModal } from './CrisisSupportModal';
import { AdminDashboard } from './AdminDashboard';
import { CinematicAmbientBackground } from './CinematicAmbientBackground';
import { SpotifyPlayerWidget } from './SpotifyPlayerWidget';
import { LinkSpotifyModal } from './LinkSpotifyModal';
import { useSpotifyMusic } from '../context/SpotifyMusicContext';

export const SoulverseWebsiteShell: React.FC = () => {
  const [profile] = useState(CURRENT_USER);
  const [currentRoute, setCurrentRoute] = useState<SoulverseRoute>('discover');
  const [worlds, setWorlds] = useState<ProfileWorld[]>([]);
  const [inspectedProfile, setInspectedProfile] = useState<UserProfile | null>(null);
  const [activeChatProfileOverride, setActiveChatProfileOverride] = useState<UserProfile | null>(null);
  
  // Desktop vs Mobile Viewport Frame Toggle (Phone Frame vs Fluid Responsive)
  const [devicePreviewMode, setDevicePreviewMode] = useState<'fluid' | 'mobile_frame'>('fluid');

  // Creation Action Sheet
  const [isCreateSheetOpen, setIsCreateSheetOpen] = useState(false);
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);

  // Spotify Music Context Integration
  const { 
    track: musicTrack, 
    isPlaying: isMusicPlaying, 
    togglePlay,
    setIsPlayerExpanded, 
    setIsLinkModalOpen 
  } = useSpotifyMusic();

  // Modals & Panels
  const [isCrisisModalOpen, setIsCrisisModalOpen] = useState(false);
  const [isReadmeModalOpen, setIsReadmeModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [targetWorldId, setTargetWorldId] = useState<string | null>(null);

  // Map route to 5 primary mobile destinations
  const getActiveMobileTab = (): MobilePrimaryTab => {
    if (currentRoute === 'discover' || currentRoute === 'daily' || currentRoute === 'home') return 'discover';
    if (currentRoute === 'connect' || currentRoute === 'worlds' || currentRoute === 'connections') return 'connect';
    if (currentRoute === 'messages' || currentRoute === 'inbox') return 'inbox';
    if (currentRoute === 'profile' || currentRoute === 'settings' || currentRoute === 'identities' || currentRoute === 'account') return 'profile';
    return 'discover';
  };

  // Sync with browser URL hash for native back/forward history & deep links
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '') as SoulverseRoute;
      const validRoutes: SoulverseRoute[] = [
        'home', 'daily', 'discover', 'connect', 'connections', 'messages', 'inbox', 'profile', 
        'identities', 'worlds', 'timeline', 'collections', 'account', 'settings', 'more', 'journal', 'admin'
      ];
      if (validRoutes.includes(hash)) {
        setCurrentRoute(hash);
      }
    };

    if (window.location.hash) {
      handleHashChange();
    } else {
      // Default initial view: mobile-first discover
      setCurrentRoute('discover');
    }

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  useEffect(() => {
    profileWorldsClient.getWorlds('usr_me', 'usr_me').then(fetched => {
      if (fetched && fetched.length > 0) setWorlds(fetched);
    }).catch(console.error);
  }, []);

  const navigateTo = (route: SoulverseRoute) => {
    setCurrentRoute(route);
    window.location.hash = `#${route}`;
    setIsMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleMobileTabSelect = (tab: MobilePrimaryTab) => {
    if (tab === 'discover') navigateTo('discover');
    else if (tab === 'connect') navigateTo('connect');
    else if (tab === 'inbox') navigateTo('messages');
    else if (tab === 'profile') navigateTo('profile');
    else if (tab === 'create') setIsCreateSheetOpen(true);
  };

  const handleCreateActionSelect = (actionType: 'identity' | 'timeline' | 'journal' | 'story' | 'post' | 'event' | 'community' | 'question') => {
    if (actionType === 'identity') {
      navigateTo('identities');
    } else if (actionType === 'timeline') {
      navigateTo('timeline');
    } else if (actionType === 'journal') {
      setIsReadmeModalOpen(true);
    } else if (actionType === 'story') {
      setIsEditProfileModalOpen(true);
    } else if (actionType === 'post') {
      navigateTo('connect');
    } else if (actionType === 'event') {
      navigateTo('connect');
    } else if (actionType === 'community') {
      navigateTo('connect');
    } else if (actionType === 'question') {
      navigateTo('discover');
    }
  };

  const handleOpenWorld = (worldId: string) => {
    setTargetWorldId(worldId);
    navigateTo('worlds');
  };

  const handleInitiateChat = (target: UserProfile) => {
    setActiveChatProfileOverride(target);
    navigateTo('messages');
  };

  const navItems = [
    { id: 'discover' as SoulverseRoute, label: 'Discover', icon: Compass },
    { id: 'connect' as SoulverseRoute, label: 'Connect & Social', icon: Users, badge: 'Live' },
    { id: 'messages' as SoulverseRoute, label: 'Messages & Rooms', icon: MessageCircle, badge: '3' },
    { id: 'profile' as SoulverseRoute, label: 'My Identities', icon: User },
    { id: 'daily' as SoulverseRoute, label: 'Daily Intelligence', icon: Flame, badge: 'Daily' },
    { id: 'identities' as SoulverseRoute, label: 'Identity Universe', icon: Sparkles },
    { id: 'worlds' as SoulverseRoute, label: 'Explore Worlds', icon: Globe2 },
    { id: 'timeline' as SoulverseRoute, label: 'Life Timeline', icon: Calendar },
    { id: 'settings' as SoulverseRoute, label: 'Settings', icon: Settings },
    { id: 'admin' as SoulverseRoute, label: 'Admin Ops', icon: ShieldAlert, badge: 'Staff' }
  ];

  const sidebarWorlds = worlds.length > 0 ? worlds.slice(0, 4) : [
    { id: 'wld_real', name: 'My Real Life', visibility: 'public', cover_image_url: 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=200&q=80' },
    { id: 'wld_cinematic', name: 'My Cinematic Life', visibility: 'public', cover_image_url: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=200&q=80' }
  ];

  return (
    <div className="min-h-screen bg-[#090A0E] text-zinc-100 flex flex-col font-sans selection:bg-white/20 selection:text-white relative overflow-x-hidden">
      
      {/* Dark Void with Ambient Silver / Crimson Glass Background */}
      <CinematicAmbientBackground currentRoute={currentRoute} />

      {/* ===================================================================== */}
      {/* 1. TOP GLOBAL APP BAR & FROSTED GLASS HEADER                          */}
      {/* ===================================================================== */}
      <header className="h-14 sm:h-16 dark-glass border-b border-white/[0.08] px-3 sm:px-6 flex items-center justify-between sticky top-0 z-40 backdrop-blur-2xl shrink-0">
        
        {/* Left: Brand Identity & Active Route Indicator */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-1.5 rounded-xl dark-glass border border-white/[0.08] text-zinc-400 hover:text-white cursor-pointer"
            title="Open Menu"
          >
            {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>

          <div 
            onClick={() => navigateTo('discover')}
            className="flex items-center gap-2 cursor-pointer group select-none"
          >
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-tr from-white/10 to-white/20 border border-white/20 flex items-center justify-center text-white shadow-inner group-hover:border-white/50 transition-colors">
              <Compass className="w-4 h-4 text-zinc-200" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-serif font-black tracking-tight text-white text-base sm:text-lg">Soulverse</span>
              <span className="hidden sm:inline-block w-1.5 h-1.5 rounded-full bg-rose-500 shadow-[0_0_8px_#F43F5E]" />
            </div>
          </div>
        </div>

        {/* Center: Spotify Ambient Anthem Pill (Quick Play/Pause) */}
        <div className="flex items-center gap-2">
          {musicTrack && (
            <div 
              onClick={togglePlay}
              className="flex items-center gap-2 px-3 py-1 rounded-full dark-glass-card border border-white/15 hover:border-white/30 cursor-pointer shadow-sm group transition-all"
              title="Toggle Spotify Ambient Audio"
            >
              <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#10B981] animate-pulse" />
              <span className="text-[11px] font-bold text-zinc-200 truncate max-w-[100px] sm:max-w-[160px]">
                {musicTrack.title}
              </span>
              <span className="text-[10px] text-zinc-400">
                {isMusicPlaying ? '❚❚' : '▶'}
              </span>
            </div>
          )}
        </div>

        {/* Right Actions: 1926 Safety, Device Mode Switcher & Profile Avatar */}
        <div className="flex items-center gap-2">
          {/* Desktop Only: Toggle Mobile Device Frame Preview vs Fluid Canvas */}
          <div className="hidden md:flex items-center bg-white/[0.06] p-0.5 rounded-xl border border-white/10 text-xs">
            <button
              onClick={() => setDevicePreviewMode('fluid')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                devicePreviewMode === 'fluid' ? 'bg-white text-[#090A0E]' : 'text-zinc-400 hover:text-white'
              }`}
              title="Full Fluid Responsive Canvas"
            >
              <Monitor className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setDevicePreviewMode('mobile_frame')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                devicePreviewMode === 'mobile_frame' ? 'bg-white text-[#090A0E]' : 'text-zinc-400 hover:text-white'
              }`}
              title="Mobile App Frame Preview (iPhone 16 Pro Style)"
            >
              <Smartphone className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* 1926 NIMH Mental Health Support Button */}
          <button
            onClick={() => setIsCrisisModalOpen(true)}
            className="px-2.5 py-1 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/25 text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1"
            title="1926 Safe NIMH Crisis Support"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>1926 Safe</span>
          </button>

          {/* User Avatar Action */}
          <div 
            onClick={() => navigateTo('profile')}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full overflow-hidden border border-white/20 cursor-pointer hover:border-white/60 transition-all shadow-sm shrink-0"
            title="View Profile"
          >
            <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" />
          </div>
        </div>
      </header>

      {/* ===================================================================== */}
      {/* 2. MAIN LAYOUT: MOBILE APP FRAME CONTAINER vs FLUID RESPONSIVE        */}
      {/* ===================================================================== */}
      <div className={`flex-1 flex w-full mx-auto relative z-10 ${
        devicePreviewMode === 'mobile_frame'
          ? 'py-6 px-2 justify-center items-start'
          : 'px-3 sm:px-6 py-4 max-w-[1600px] gap-6'
      }`}>
        
        {/* DESKTOP SIDEBAR (Visible only when in wide fluid desktop mode) */}
        {devicePreviewMode === 'fluid' && (
          <aside className="hidden lg:flex w-56 shrink-0 flex-col space-y-4 sticky top-20 h-[calc(100vh-6rem)] overflow-y-auto no-scrollbar dark-glass p-3 rounded-3xl border border-white/[0.08] shadow-2xl">
            {/* Primary Navigation List */}
            <nav className="space-y-1">
              {navItems.map(item => {
                const Icon = item.icon;
                const isActive = currentRoute === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => navigateTo(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-2xl text-xs font-medium transition-all cursor-pointer ${
                      isActive
                        ? 'bg-white/10 text-white font-bold border border-white/20 shadow-sm'
                        : 'text-zinc-400 hover:bg-white/[0.04] hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-zinc-400'}`} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-white/10 text-zinc-200 border border-white/15">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Quick Action: Create */}
            <button
              onClick={() => setIsCreateSheetOpen(true)}
              className="w-full py-2.5 rounded-2xl bg-white text-[#090A0E] text-xs font-bold cursor-pointer hover:brightness-110 active:scale-95 transition-all shadow-md flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Create New...</span>
            </button>

            {/* Sub-Section: Your Worlds */}
            <div className="space-y-1.5 pt-2 border-t border-white/[0.08]">
              <div className="flex items-center justify-between px-2 text-[11px] font-bold">
                <span className="text-white">Your Worlds</span>
                <button 
                  onClick={() => navigateTo('worlds')}
                  className="text-[10px] text-zinc-400 hover:text-white cursor-pointer"
                >
                  Explore ›
                </button>
              </div>

              {sidebarWorlds.map(w => (
                <div
                  key={w.id}
                  onClick={() => handleOpenWorld(w.id)}
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded-xl text-xs text-zinc-400 hover:bg-white/[0.04] hover:text-white cursor-pointer transition-colors"
                >
                  <div className="w-5 h-5 rounded-md overflow-hidden shrink-0 border border-white/10">
                    <img src={w.cover_image_url || profile.avatar} alt={w.name} className="w-full h-full object-cover" />
                  </div>
                  <span className="truncate text-[11px]">{w.name}</span>
                </div>
              ))}
            </div>

            {/* Bottom Footer Shortcuts */}
            <div className="flex items-center justify-around pt-2 border-t border-white/[0.08] text-zinc-400 mt-auto">
              <button onClick={() => navigateTo('settings')} className="p-1.5 hover:text-white" title="Settings"><Settings className="w-3.5 h-3.5" /></button>
              <button onClick={() => navigateTo('timeline')} className="p-1.5 hover:text-white" title="Timeline"><Calendar className="w-3.5 h-3.5" /></button>
              <button onClick={() => navigateTo('admin')} className="p-1.5 hover:text-emerald-400" title="Admin Ops"><ShieldAlert className="w-3.5 h-3.5" /></button>
            </div>
          </aside>
        )}

        {/* MOBILE DRAWER (Slide-over when hamburger is tapped) */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md lg:hidden flex">
            <div className="w-72 bg-[#10121A] border-r border-white/10 h-full p-5 space-y-4 overflow-y-auto no-scrollbar animate-fadeIn">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <span className="font-bold text-sm text-white font-serif">Soulverse Navigation</span>
                <button onClick={() => setIsMobileMenuOpen(false)} className="text-zinc-400 p-1 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-1">
                {navItems.map(item => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => navigateTo(item.id)}
                      className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-medium ${
                        currentRoute === item.id ? 'bg-white/15 text-white font-bold border border-white/20' : 'text-zinc-400'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-white/10 text-zinc-200">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="flex-1" onClick={() => setIsMobileMenuOpen(false)} />
          </div>
        )}

        {/* =================================================================== */}
        {/* CENTER PRIMARY CONTENT CONTAINER                                   */}
        {/* =================================================================== */}
        <div className={`flex-1 min-w-0 transition-all ${
          devicePreviewMode === 'mobile_frame'
            ? 'w-full max-w-[430px] rounded-[48px] border-4 border-white/20 shadow-[0_25px_80px_rgba(0,0,0,0.95)] ring-1 ring-white/10 relative overflow-hidden bg-[#090A0E] flex flex-col min-h-[850px]'
            : 'w-full'
        }`}>
          
          {/* Virtual Phone Frame Header (Status Bar + Dynamic Island) */}
          {devicePreviewMode === 'mobile_frame' && (
            <div className="h-10 px-6 flex items-center justify-between text-xs text-white shrink-0 bg-[#090A0E] select-none border-b border-white/[0.04]">
              <span className="font-bold text-[11px] font-mono">9:41</span>
              {/* Dynamic Island Pill */}
              <div className="w-24 h-4 rounded-full bg-black border border-white/10 flex items-center justify-center">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <div className="flex items-center gap-1.5 text-zinc-300">
                <Wifi className="w-3.5 h-3.5" />
                <span className="text-[10px] font-bold">5G</span>
                <Battery className="w-3.5 h-3.5" />
              </div>
            </div>
          )}

          {/* Scrollable View Area */}
          <main className="flex-1 min-w-0 overflow-y-auto no-scrollbar">
            
            {/* DESTINATION 1: DISCOVER (Dating, Friends, Recommendations, Daily Inspiration) */}
            {currentRoute === 'discover' && (
              <SoulverseMobileDiscoverExperience
                onOpenProfile={(p) => setInspectedProfile(p)}
                onInitiateChat={handleInitiateChat}
                onOpenDailyHub={() => navigateTo('daily')}
              />
            )}

            {/* DESTINATION 2: CONNECT (Events, Communities, Watch Parties, Solo Journals, Worlds) */}
            {currentRoute === 'connect' && (
              <SoulverseMobileConnectExperience
                onOpenWorld={handleOpenWorld}
                onOpenJournal={() => setIsReadmeModalOpen(true)}
                onOpenSoloPrompt={() => navigateTo('daily')}
              />
            )}

            {/* DESTINATION 4: INBOX / MESSAGES (Chats, Voice Notes, Calls, Mini Games) */}
            {(currentRoute === 'messages' || currentRoute === 'inbox') && (
              <div className="h-[calc(100vh-6.5rem)] rounded-3xl overflow-hidden border border-white/10 shadow-2xl dark-glass">
                <MessagingInboxView
                  onOpenProfileDetail={(p) => setInspectedProfile(p)}
                  activeProfileOverride={activeChatProfileOverride}
                  onClearActiveProfileOverride={() => setActiveChatProfileOverride(null)}
                />
              </div>
            )}

            {/* DESTINATION 5: PROFILE (Multiple Identities, Timeline, Social Integrations, Settings) */}
            {currentRoute === 'profile' && (
              <SoulverseMobileProfileExperience
                onNavigateToSettings={() => navigateTo('settings')}
                onNavigateToTimeline={() => navigateTo('timeline')}
                onNavigateToAdmin={() => navigateTo('admin')}
                onOpenCharacterBuilder={() => navigateTo('identities')}
                onEditProfileModal={() => setIsEditProfileModalOpen(true)}
              />
            )}

            {/* SUB-VIEW: HOME DASHBOARD */}
            {currentRoute === 'home' && (
              <SoulverseHomePage
                onNavigate={navigateTo}
                onOpenProfile={(p) => setInspectedProfile(p)}
                onInitiateChat={handleInitiateChat}
                onOpenWorld={handleOpenWorld}
              />
            )}

            {/* SUB-VIEW: DAILY INTELLIGENCE */}
            {currentRoute === 'daily' && (
              <DailyConnectionHub onBackToHome={() => navigateTo('discover')} />
            )}

            {/* SUB-VIEW: CONNECTIONS & MUTUAL MATCHES */}
            {currentRoute === 'connections' && (
              <SoulverseConnectionsPage
                onOpenProfile={(p) => setInspectedProfile(p)}
                onInitiateChat={handleInitiateChat}
              />
            )}

            {/* SUB-VIEW: IDENTITY UNIVERSE (Multiple Personas Creator) */}
            {currentRoute === 'identities' && (
              <IdentityUniverseHub
                userId="usr_me"
                isOwner={true}
                viewerId="usr_me"
                onClose={() => navigateTo('profile')}
              />
            )}

            {/* SUB-VIEW: PROFILE WORLDS HUB */}
            {currentRoute === 'worlds' && (
              <ProfileWorldsHub
                userId="usr_me"
                isOwner={true}
                viewerId="usr_me"
                initialWorldId={targetWorldId || undefined}
                onClose={() => navigateTo('connect')}
              />
            )}

            {/* SUB-VIEW: YEAR-BY-YEAR LIFE TIMELINE */}
            {currentRoute === 'timeline' && (
              <div className="space-y-4">
                <YearLifeTimelineView
                  userId="usr_me"
                  isOwner={true}
                  viewerId="usr_me"
                />
              </div>
            )}

            {/* SUB-VIEW: COLLECTIONS & MEDIA GALLERIES */}
            {currentRoute === 'collections' && (
              <SoulverseCollectionsPage />
            )}

            {/* SUB-VIEW: ACCOUNT DASHBOARD */}
            {currentRoute === 'account' && (
              <SoulverseAccountPage />
            )}

            {/* SUB-VIEW: SETTINGS & PRIVACY */}
            {currentRoute === 'settings' && (
              <SoulverseSettingsPage />
            )}

            {/* SUB-VIEW: MORE / JOURNAL / QUESTIONS */}
            {currentRoute === 'more' && (
              <SoulverseMorePage
                onOpenJournal={() => setIsReadmeModalOpen(true)}
                onOpenQuestions={() => navigateTo('timeline')}
                onOpenDigitalLife={() => navigateTo('profile')}
                onOpenCrisis={() => setIsCrisisModalOpen(true)}
                onOpenAdmin={() => navigateTo('admin')}
              />
            )}

            {/* SUB-VIEW: ADMIN OPERATIONS DASHBOARD */}
            {currentRoute === 'admin' && (
              <AdminDashboard />
            )}

          </main>

          {/* Virtual Phone Frame Home Bar */}
          {devicePreviewMode === 'mobile_frame' && (
            <div className="h-6 flex items-center justify-center shrink-0 bg-[#090A0E]">
              <div className="w-32 h-1 rounded-full bg-white/30" />
            </div>
          )}
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 3. PERSISTENT FLOATING 5-DESTINATION MOBILE NAVIGATION DOCK            */}
      {/* ===================================================================== */}
      <SoulverseMobileNavbar
        activeTab={getActiveMobileTab()}
        onSelectTab={handleMobileTabSelect}
        onTriggerCreate={() => setIsCreateSheetOpen(true)}
        unreadMessagesCount={3}
        userAvatar={profile.avatar}
      />

      {/* ===================================================================== */}
      {/* 4. MODALS & ACTION SHEETS                                            */}
      {/* ===================================================================== */}

      {/* Mobile Create Action Sheet (8 unified creation actions) */}
      <MobileCreateActionSheet
        isOpen={isCreateSheetOpen}
        onClose={() => setIsCreateSheetOpen(false)}
        onActionSelect={handleCreateActionSelect}
      />

      {/* Edit Profile Info Modal (Tinder-inspired Essentials & Prompts) */}
      <EditProfileInfoModal
        isOpen={isEditProfileModalOpen}
        onClose={() => setIsEditProfileModalOpen(false)}
      />

      {/* Profile Detail Sheet (When inspecting another user) */}
      {inspectedProfile && (
        <ProfileDetailSheet
          profile={inspectedProfile}
          onClose={() => setInspectedProfile(null)}
          onInitiateChat={handleInitiateChat}
          onSuperLike={(p) => alert(`Super Liked ${p.name}!`)}
        />
      )}

      {/* GitHub Flavored Markdown 5,000-Char Bio / Journal Modal */}
      {isReadmeModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
          <div className="w-full max-w-3xl max-h-[92vh] overflow-hidden">
            <GitHubMarkdownEditor
              userId="usr_me"
              isOwner={true}
              onClose={() => setIsReadmeModalOpen(false)}
            />
          </div>
        </div>
      )}

      {/* 1926 Crisis Support Modal */}
      <CrisisSupportModal 
        isOpen={isCrisisModalOpen}
        onClose={() => setIsCrisisModalOpen(false)} 
      />

      {/* ===================================================================== */}
      {/* 5. SPOTIFY MUSIC PLAYER (Mini Dock, Expanded Embed, Link Modal)       */}
      {/* ===================================================================== */}
      <SpotifyPlayerWidget variant="mini-dock" />
      <SpotifyPlayerWidget variant="expanded" />
      <LinkSpotifyModal />
    </div>
  );
};
