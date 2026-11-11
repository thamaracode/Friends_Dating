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
  X
} from 'lucide-react';

import { CURRENT_USER } from '../mockData';
import { profileWorldsClient } from '../services/profileWorldsApiClient';
import type { SoulverseRoute, UserProfile } from '../types';
import type { ProfileWorld } from '../types/profileWorlds';

// Dedicated Full-Page Components
import { SoulverseHomePage } from './SoulverseHomePage';
import { SoulverseDiscoverPage } from './SoulverseDiscoverPage';
import { SoulverseConnectionsPage } from './SoulverseConnectionsPage';
import { SoulverseCollectionsPage } from './SoulverseCollectionsPage';
import { SoulverseAccountPage } from './SoulverseAccountPage';
import { SoulverseSettingsPage } from './SoulverseSettingsPage';
import { SoulverseMorePage } from './SoulverseMorePage';
import { DailyConnectionHub } from './DailyConnectionHub';
import { IdentityUniverseHub } from './IdentityUniverseHub';

// Established Feature Subsystems
import { MessagingInboxView } from './MessagingInboxView';
import { DesktopSoulverseView } from './DesktopSoulverseView';
import { ProfileWorldsHub } from './ProfileWorldsHub';
import { YearLifeTimelineView } from './YearLifeTimelineView';
import { GitHubMarkdownEditor } from './GitHubMarkdownEditor';
import { ProfileDetailSheet } from './ProfileDetailSheet';
import { CrisisSupportModal } from './CrisisSupportModal';
import { DigitalLifeHub } from './DigitalLifeHub';
import { LivingIdentityProfileView } from './LivingIdentityProfileView';
import { AdminDashboard } from './AdminDashboard';
import { CinematicAmbientBackground } from './CinematicAmbientBackground';

export const SoulverseWebsiteShell: React.FC = () => {
  const [profile] = useState(CURRENT_USER);
  const [currentRoute, setCurrentRoute] = useState<SoulverseRoute>('home');
  const [worlds, setWorlds] = useState<ProfileWorld[]>([]);
  const [inspectedProfile, setInspectedProfile] = useState<UserProfile | null>(null);
  const [activeChatProfileOverride, setActiveChatProfileOverride] = useState<UserProfile | null>(null);
  
  // Modals & Panels
  const [isCrisisModalOpen, setIsCrisisModalOpen] = useState(false);
  const [isReadmeModalOpen, setIsReadmeModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [targetWorldId, setTargetWorldId] = useState<string | null>(null);

  // Sync with browser URL hash for native back/forward history & deep links
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '') as SoulverseRoute;
      const validRoutes: SoulverseRoute[] = [
        'home', 'daily', 'discover', 'connections', 'messages', 'profile', 
        'identities', 'worlds', 'timeline', 'collections', 'account', 'settings', 'more', 'journal'
      ];
      if (validRoutes.includes(hash)) {
        setCurrentRoute(hash);
      }
    };

    if (window.location.hash) {
      handleHashChange();
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

  const handleOpenWorld = (worldId: string) => {
    setTargetWorldId(worldId);
    navigateTo('worlds');
  };

  const handleInitiateChat = (target: UserProfile) => {
    setActiveChatProfileOverride(target);
    navigateTo('messages');
  };

  const navItems = [
    { id: 'home' as SoulverseRoute, label: 'Home', icon: Home },
    { id: 'daily' as SoulverseRoute, label: 'Daily Connection', icon: Flame, badge: 'Daily' },
    { id: 'identities' as SoulverseRoute, label: 'Identity Universe', icon: Sparkles },
    { id: 'discover' as SoulverseRoute, label: 'Discover', icon: Compass },
    { id: 'messages' as SoulverseRoute, label: 'Messages', icon: MessageCircle, badge: '12' },
    { id: 'connections' as SoulverseRoute, label: 'Matches', icon: Heart },
    { id: 'profile' as SoulverseRoute, label: 'Profile', icon: User },
    { id: 'worlds' as SoulverseRoute, label: 'Explore Worlds', icon: Globe2 },
    { id: 'timeline' as SoulverseRoute, label: 'Life Timeline', icon: Calendar },
    { id: 'settings' as SoulverseRoute, label: 'Settings', icon: Settings }
  ];

  const fallbackWorlds = [
    { id: 'wld_real', name: 'My Real Life', visibility: 'public', cover_image_url: 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=200&q=80' },
    { id: 'wld_imaginary', name: 'My Imaginary Life', visibility: 'matches', cover_image_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=200&q=80' },
    { id: 'wld_cinematic', name: 'My Cinematic Life', visibility: 'public', cover_image_url: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=200&q=80' },
    { id: 'wld_inner', name: 'My Inner World', visibility: 'private', cover_image_url: 'https://images.unsplash.com/photo-1507499739999-097706ad8914?auto=format&fit=crop&w=200&q=80' }
  ];

  const sidebarWorlds = worlds.length > 0 ? worlds.slice(0, 4) : fallbackWorlds;

  return (
    <div className="min-h-screen bg-[#090A0E] text-zinc-100 flex flex-col font-sans selection:bg-white/20 selection:text-white relative overflow-x-hidden">
      
      {/* Dark Void with Ambient Silver Glass Background */}
      <CinematicAmbientBackground />

      {/* ===================================================================== */}
      {/* 1. TOP GLOBAL SEARCH & FROSTED DARK GLASS HEADER                      */}
      {/* ===================================================================== */}
      <header className="h-16 dark-glass border-b border-white/[0.08] px-4 lg:px-6 flex items-center justify-between sticky top-0 z-40 backdrop-blur-2xl">
        
        {/* Left: Mobile Menu Toggle + Brand Identity + Ambient Light Indicator */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl dark-glass border border-white/[0.08] text-zinc-400 hover:text-white cursor-pointer"
          >
            {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>

          <div 
            onClick={() => navigateTo('home')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-7 h-7 rounded-xl bg-white/15 border border-white/25 flex items-center justify-center text-white shadow-[0_0_14px_rgba(255,255,255,0.12)] group-hover:scale-105 transition-transform">
              <Heart className="w-3.5 h-3.5 fill-white text-white" />
            </div>
            <span className="font-black text-sm tracking-widest text-white font-serif">
              Soulverse <span className="text-zinc-400">✧</span>
            </span>
          </div>

          {/* Subtle Ambient Glass Status Pill */}
          <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full dark-glass-pill text-[10px] text-zinc-400">
            <span className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
            <span className="font-medium tracking-wide text-zinc-300">
              Gray & Glass Sanctuary
            </span>
          </div>
        </div>

        {/* Center: Frosted Dark Glass Search Bar */}
        <div className="hidden sm:flex flex-1 max-w-lg mx-6 relative">
          <Search className="w-4 h-4 text-zinc-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search people, worlds, memories, or topics..."
            className="w-full pl-11 pr-4 py-2 rounded-full dark-glass border border-white/[0.08] text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white/30 transition-colors"
          />
        </div>

        {/* Right: Actions, 1926 Hotline, and Account Menu */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsCrisisModalOpen(true)}
            className="hidden sm:flex px-2.5 py-1 rounded-full dark-glass border border-white/15 text-zinc-300 text-[10px] font-bold items-center gap-1.5 hover:border-white/30 cursor-pointer shadow-sm"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>1926 Safe</span>
          </button>

          <button 
            onClick={() => setIsReadmeModalOpen(true)}
            className="p-2 rounded-full dark-glass hover:bg-white/[0.08] border border-white/[0.08] text-zinc-400 hover:text-white transition-colors cursor-pointer"
            title="Open 5,000-char GitHub Markdown Journal"
          >
            <FileText className="w-4 h-4" />
          </button>

          <button 
            onClick={() => navigateTo('messages')}
            className="p-2 rounded-full dark-glass hover:bg-white/[0.08] border border-white/[0.08] text-zinc-400 hover:text-white relative transition-colors cursor-pointer"
            title="Messages"
          >
            <MessageCircle className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.9)]" />
          </button>

          {/* User Avatar Action */}
          <div 
            onClick={() => navigateTo('profile')}
            className="w-8 h-8 rounded-full overflow-hidden border border-white/20 cursor-pointer hover:border-white/60 transition-all ml-1 shadow-sm"
          >
            <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" />
          </div>
        </div>
      </header>

      {/* ===================================================================== */}
      {/* 2. MAIN DESKTOP / TABLET / MOBILE LAYOUT SHELL                        */}
      {/* ===================================================================== */}
      <div className="flex-1 flex max-w-[1720px] w-full mx-auto px-3 sm:px-6 py-5 gap-6 relative z-10">
        
        {/* LEFT PERSISTENT FROSTED DARK GLASS SIDEBAR */}
        <aside className="hidden lg:flex w-60 shrink-0 flex-col space-y-4 sticky top-24 h-[calc(100vh-7rem)] overflow-y-auto no-scrollbar dark-glass p-3 rounded-3xl border border-white/[0.08] shadow-2xl">
          {/* Main Navigation List */}
          <nav className="space-y-1">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = currentRoute === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => navigateTo(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-medium transition-all cursor-pointer ${
                    isActive
                      ? 'bg-white/10 text-white font-bold border border-white/20 shadow-[0_0_16px_rgba(255,255,255,0.06)]'
                      : 'text-zinc-400 hover:bg-white/[0.04] hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-zinc-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-white/10 text-zinc-200 border border-white/15">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Sub-Section: Your Worlds */}
          <div className="space-y-2 pt-2 border-t border-white/[0.08]">
            <div className="flex items-center justify-between px-2 text-[11px] font-bold">
              <span className="text-white">Your Worlds</span>
              <button 
                onClick={() => navigateTo('worlds')}
                className="text-[10px] text-zinc-400 hover:text-white cursor-pointer transition-colors"
              >
                Manage ›
              </button>
            </div>

            <div className="space-y-1">
              {sidebarWorlds.map(w => (
                <div
                  key={w.id}
                  onClick={() => handleOpenWorld(w.id)}
                  className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs text-zinc-400 hover:bg-white/[0.04] hover:text-white cursor-pointer transition-colors group"
                >
                  <div className="flex items-center gap-2 truncate">
                    <div className="w-5 h-5 rounded-md overflow-hidden shrink-0 border border-white/10">
                      <img src={w.cover_image_url || profile.avatar} alt={w.name} className="w-full h-full object-cover" />
                    </div>
                    <span className="truncate text-[11px] font-medium">{w.name}</span>
                  </div>
                  <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-black/40 text-zinc-400 shrink-0 border border-white/5">
                    {w.visibility === 'public' ? 'Public' : 'Friends'}
                  </span>
                </div>
              ))}

              <button
                onClick={() => navigateTo('worlds')}
                className="w-full flex items-center gap-2 px-3 py-2 text-[11px] text-zinc-300 hover:text-white cursor-pointer transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create New World</span>
              </button>
            </div>
          </div>

          {/* Premium Card: Dark Glass matching dashboard screenshot */}
          <div className="p-3.5 rounded-2xl dark-glass-elevated border border-white/[0.08] space-y-2 text-center mt-auto shadow-lg relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-t from-white/10 to-transparent pointer-events-none" />
            <span className="text-xs font-bold text-white block flex items-center justify-center gap-1.5">
              <span>👑</span>
              <span>Premium</span>
            </span>
            <p className="text-[10px] text-zinc-400 relative z-10">Unlock more magic ✨</p>
            <button 
              onClick={() => alert("Premium active")}
              className="w-full py-1.5 rounded-xl gray-glass-btn text-xs font-bold cursor-pointer shadow-md hover:brightness-110 transition-all relative z-10"
            >
              Go Premium
            </button>
          </div>

          {/* Bottom Footer Toolbar: Settings, TV, Moon */}
          <div className="flex items-center justify-around py-1 border-t border-white/[0.08] text-zinc-400">
            <button onClick={() => navigateTo('settings')} className="p-1.5 hover:text-white" title="Settings"><Settings className="w-3.5 h-3.5" /></button>
            <button onClick={() => navigateTo('timeline')} className="p-1.5 hover:text-white" title="Channels / TV"><Tv className="w-3.5 h-3.5" /></button>
            <button onClick={() => alert("Gray & Glass UI Active")} className="p-1.5 hover:text-white" title="Theme"><Moon className="w-3.5 h-3.5 text-zinc-300" /></button>
            <button onClick={() => navigateTo('account')} className="p-1.5 hover:text-white" title="Account"><LogOut className="w-3.5 h-3.5" /></button>
          </div>
        </aside>

        {/* MOBILE DRAWER MENU (When open on mobile/tablet) */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md lg:hidden flex">
            <div className="w-72 bg-[#12141B] border-r border-white/10 h-full p-5 space-y-4 overflow-y-auto no-scrollbar animate-fadeIn">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <span className="font-bold text-sm text-white font-serif">Soulverse Menu</span>
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
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="flex-1" onClick={() => setIsMobileMenuOpen(false)} />
          </div>
        )}

        {/* =================================================================== */}
        {/* CENTER PRIMARY CONTENT AREA (Full-page experiences)                 */}
        {/* =================================================================== */}
        <main className="flex-1 min-w-0">
          
          {/* PAGE 1: HOME DASHBOARD */}
          {currentRoute === 'home' && (
            <SoulverseHomePage
              onNavigate={navigateTo}
              onOpenProfile={(p) => setInspectedProfile(p)}
              onInitiateChat={handleInitiateChat}
              onOpenWorld={handleOpenWorld}
            />
          )}

          {/* PAGE 1.5: DAILY RELATIONSHIP & HUMAN CONNECTION INTELLIGENCE */}
          {currentRoute === 'daily' && (
            <DailyConnectionHub onBackToHome={() => navigateTo('home')} />
          )}

          {/* PAGE 2: DISCOVER HUMANS */}
          {currentRoute === 'discover' && (
            <SoulverseDiscoverPage
              onOpenProfile={(p) => setInspectedProfile(p)}
              onInitiateChat={handleInitiateChat}
            />
          )}

          {/* PAGE 3: CONNECTIONS & MUTUAL MATCHES */}
          {currentRoute === 'connections' && (
            <SoulverseConnectionsPage
              onOpenProfile={(p) => setInspectedProfile(p)}
              onInitiateChat={handleInitiateChat}
            />
          )}

          {/* PAGE 4: MESSAGING & INBOX */}
          {currentRoute === 'messages' && (
            <div className="h-[calc(100vh-6.5rem)] rounded-3xl overflow-hidden border border-white/10 shadow-2xl dark-glass">
              <MessagingInboxView
                onOpenProfileDetail={(p) => setInspectedProfile(p)}
                activeProfileOverride={activeChatProfileOverride}
                onClearActiveProfileOverride={() => setActiveChatProfileOverride(null)}
              />
            </div>
          )}

          {/* PAGE 5: PROFILES (DESKTOP CASTLE SANCTUARY EXPERIENCE) */}
          {currentRoute === 'profile' && (
            <DesktopSoulverseView
              currentTab="profile"
              onSelectTab={(tab) => navigateTo(tab as SoulverseRoute)}
              onNavigateSubsystem={(sub) => {
                if (sub === 'profile_worlds') navigateTo('worlds');
                else if (sub === 'living_profile') navigateTo('timeline');
                else if (sub === 'privacy_centre') navigateTo('settings');
                else navigateTo('more');
              }}
              onOpenWorld={handleOpenWorld}
              onOpenReadme={() => setIsReadmeModalOpen(true)}
            />
          )}

          {/* PAGE 5.5: IDENTITY UNIVERSE (Multiple Personas, Universal Timeline, Universes, Games) */}
          {currentRoute === 'identities' && (
            <IdentityUniverseHub
              userId="usr_me"
              isOwner={true}
              viewerId="usr_me"
              onClose={() => navigateTo('profile')}
            />
          )}

          {/* PAGE 6: PROFILE WORLDS HUB */}
          {currentRoute === 'worlds' && (
            <ProfileWorldsHub
              userId="usr_me"
              isOwner={true}
              viewerId="usr_me"
              initialWorldId={targetWorldId || undefined}
              onClose={() => navigateTo('profile')}
            />
          )}

          {/* PAGE 7: YEAR-BY-YEAR LIFE TIMELINE */}
          {currentRoute === 'timeline' && (
            <div className="space-y-4">
              <YearLifeTimelineView
                userId="usr_me"
                isOwner={true}
                viewerId="usr_me"
              />
            </div>
          )}

          {/* PAGE 8: COLLECTIONS & MEDIA GALLERIES */}
          {currentRoute === 'collections' && (
            <SoulverseCollectionsPage />
          )}

          {/* PAGE 9: ACCOUNT DASHBOARD */}
          {currentRoute === 'account' && (
            <SoulverseAccountPage />
          )}

          {/* PAGE 10: SETTINGS & PRIVACY */}
          {currentRoute === 'settings' && (
            <SoulverseSettingsPage />
          )}

          {/* PAGE 11: MORE / JOURNAL / QUESTIONS */}
          {currentRoute === 'more' && (
            <SoulverseMorePage
              onOpenJournal={() => setIsReadmeModalOpen(true)}
              onOpenQuestions={() => navigateTo('timeline')}
              onOpenDigitalLife={() => navigateTo('profile')}
              onOpenCrisis={() => setIsCrisisModalOpen(true)}
              onOpenAdmin={() => navigateTo('account')}
            />
          )}

        </main>
      </div>

      {/* ===================================================================== */}
      {/* 3. MODALS (Inspect Profile, GitHub GFM Journal, Crisis Support)       */}
      {/* ===================================================================== */}

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
    </div>
  );
};
