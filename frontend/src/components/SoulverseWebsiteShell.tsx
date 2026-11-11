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
import { CinematicAmbientBackground, ROUTE_AMBIENT_PROFILES } from './CinematicAmbientBackground';

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
        'worlds', 'timeline', 'collections', 'account', 'settings', 'more', 'journal'
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
    { id: 'discover' as SoulverseRoute, label: 'Discover', icon: Compass },
    { id: 'connections' as SoulverseRoute, label: 'Connections', icon: Heart },
    { id: 'messages' as SoulverseRoute, label: 'Messages', icon: MessageCircle, badge: '12' },
    { id: 'profile' as SoulverseRoute, label: 'Profile', icon: User },
    { id: 'worlds' as SoulverseRoute, label: 'Worlds', icon: Globe2 },
    { id: 'timeline' as SoulverseRoute, label: 'Life Timeline', icon: Calendar },
    { id: 'collections' as SoulverseRoute, label: 'Collections', icon: Boxes },
    { id: 'account' as SoulverseRoute, label: 'Account', icon: ShieldAlert },
    { id: 'settings' as SoulverseRoute, label: 'Settings', icon: Settings },
    { id: 'more' as SoulverseRoute, label: 'More', icon: PlusSquare }
  ];

  return (
    <div className="min-h-screen bg-[#09080D] text-[#E9DFE8] flex flex-col font-sans selection:bg-[#85283C] selection:text-[#E9DFE8] relative overflow-x-hidden">
      
      {/* Dark Cinematic Multicolour Ambient Background Engine */}
      <CinematicAmbientBackground currentRoute={currentRoute} />

      {/* ===================================================================== */}
      {/* 1. TOP GLOBAL SEARCH & HEADER BAR                                     */}
      {/* ===================================================================== */}
      <header className="h-16 border-b border-[#321323]/80 px-4 lg:px-6 flex items-center justify-between sticky top-0 z-40 bg-[#09080D]/85 backdrop-blur-xl">
        
        {/* Left: Mobile Menu Toggle + Brand Identity + Ambient Mode Pill */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl bg-[#160D19] border border-[#321323] text-[#A99BAA] hover:text-[#F0B8D3] cursor-pointer"
          >
            {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>

          <div 
            onClick={() => navigateTo('home')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-[#321323] to-[#85283C] flex items-center justify-center text-[#F0B8D3] shadow-[0_0_12px_rgba(133,40,60,0.35)] group-hover:scale-105 transition-transform">
              <Heart className="w-3.5 h-3.5 fill-[#F0B8D3]" />
            </div>
            <span className="font-black text-sm tracking-widest text-[#F0B8D3] font-serif">
              Soulverse <span className="text-[#85283C]">🖤</span>
            </span>
          </div>

          {/* Dynamic Ambient Aura Badge */}
          <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#160D19]/70 border border-[#321323] text-[10px] text-[#A99BAA]">
            <span 
              className="w-2 h-2 rounded-full transition-colors duration-700 shadow-sm"
              style={{ backgroundColor: ROUTE_AMBIENT_PROFILES[currentRoute]?.primary || '#85283C' }}
            />
            <span className="font-medium tracking-wide">
              {ROUTE_AMBIENT_PROFILES[currentRoute]?.themeLabel}
            </span>
          </div>
        </div>

        {/* Center: Global Search Bar */}
        <div className="hidden sm:flex flex-1 max-w-lg mx-6 relative">
          <Search className="w-4 h-4 text-[#A99BAA] absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search people, worlds, memories, or topics..."
            className="w-full pl-11 pr-4 py-2 rounded-full bg-[#160D19] border border-[#321323] text-xs text-[#E9DFE8] placeholder-[#A99BAA]/60 focus:outline-none focus:border-[#A64D78]/60 transition-colors"
          />
        </div>

        {/* Right: Actions, 1926 Hotline, and Account Menu */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsCrisisModalOpen(true)}
            className="hidden sm:flex px-2.5 py-1 rounded-full bg-[#160D19] border border-rose-500/30 text-rose-300 text-[10px] font-bold items-center gap-1.5 hover:border-rose-400 cursor-pointer shadow-sm"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping" />
            <span>1926 Safe</span>
          </button>

          <button 
            onClick={() => setIsReadmeModalOpen(true)}
            className="p-2 rounded-full bg-[#160D19] hover:bg-[#321323] border border-[#321323] text-[#A99BAA] hover:text-[#F0B8D3] transition-colors cursor-pointer"
            title="Open 5,000-char GitHub Markdown Journal"
          >
            <FileText className="w-4 h-4" />
          </button>

          <button 
            onClick={() => navigateTo('messages')}
            className="p-2 rounded-full bg-[#160D19] hover:bg-[#321323] border border-[#321323] text-[#A99BAA] hover:text-[#F0B8D3] relative transition-colors cursor-pointer"
            title="Messages"
          >
            <MessageCircle className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#FF3B88]" />
          </button>

          {/* User Avatar Action */}
          <div 
            onClick={() => navigateTo('profile')}
            className="w-8 h-8 rounded-full overflow-hidden border border-[#A64D78]/50 cursor-pointer hover:border-[#F0B8D3] transition-all ml-1 shadow-sm"
          >
            <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" />
          </div>
        </div>
      </header>

      {/* ===================================================================== */}
      {/* 2. MAIN DESKTOP / TABLET / MOBILE LAYOUT SHELL                        */}
      {/* ===================================================================== */}
      <div className="flex-1 flex max-w-[1720px] w-full mx-auto px-3 sm:px-6 py-5 gap-6 relative z-10">
        
        {/* LEFT PERSISTENT DESKTOP SIDEBAR */}
        <aside className="hidden lg:flex w-60 shrink-0 flex-col space-y-5 sticky top-24 h-[calc(100vh-7rem)] overflow-y-auto no-scrollbar">
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
                      ? 'bg-[#321323] text-[#F0B8D3] font-bold border border-[#A64D78]/30 shadow-sm'
                      : 'text-[#A99BAA] hover:bg-[#160D19] hover:text-[#E9DFE8]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#F0B8D3]' : 'text-[#A99BAA]'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-[#321323] text-[#F0B8D3] border border-[#A64D78]/30">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Sub-Section: Your Worlds */}
          <div className="space-y-2 pt-2 border-t border-[#321323]">
            <div className="flex items-center justify-between px-2 text-[11px] font-bold">
              <span className="text-[#E9DFE8]">Your Worlds</span>
              <button 
                onClick={() => navigateTo('worlds')}
                className="text-[10px] text-[#A64D78] hover:text-[#F0B8D3] cursor-pointer"
              >
                Manage ›
              </button>
            </div>

            <div className="space-y-1">
              {worlds.slice(0, 4).map(w => (
                <div
                  key={w.id}
                  onClick={() => handleOpenWorld(w.id)}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-[#A99BAA] hover:bg-[#160D19] hover:text-[#E9DFE8] cursor-pointer transition-colors group"
                >
                  <div className="flex items-center gap-2 truncate">
                    <div className="w-5 h-5 rounded-md overflow-hidden shrink-0 border border-[#321323]">
                      <img src={w.cover_image_url || profile.avatar} alt={w.name} className="w-full h-full object-cover" />
                    </div>
                    <span className="truncate text-[11px]">{w.name}</span>
                  </div>
                  <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-black/40 text-[#A99BAA] shrink-0 border border-white/5">
                    {w.visibility === 'public' ? 'Public' : 'Restricted'}
                  </span>
                </div>
              ))}

              <button
                onClick={() => navigateTo('worlds')}
                className="w-full flex items-center gap-2 px-3 py-2 text-[11px] text-[#A64D78] hover:text-[#F0B8D3] cursor-pointer transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create New World</span>
              </button>
            </div>
          </div>

          {/* Premium Sanctuary Card (Styled with Warm Amber #79502D per Ambient Colour Rules) */}
          <div className="p-3.5 rounded-3xl bg-[#160D19]/90 border border-[#79502D]/40 space-y-2 text-center mt-auto shadow-md relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-t from-[#79502D]/15 via-transparent to-transparent pointer-events-none" />
            <span className="text-xs font-bold text-[#F8D2A6] block flex items-center justify-center gap-1.5">
              <span>👑</span>
              <span>Premium Sanctuary</span>
            </span>
            <p className="text-[10px] text-[#A99BAA] relative z-10">Unlimited Profile Worlds, lossless audio, and custom themes ✧</p>
            <button 
              onClick={() => alert("Premium active")}
              className="w-full py-1.5 rounded-xl bg-gradient-to-r from-[#79502D] to-[#85283C] text-white text-xs font-bold cursor-pointer shadow-md hover:brightness-110 transition-all relative z-10"
            >
              Go Premium
            </button>
          </div>

          {/* Bottom Footer Toolbar */}
          <div className="flex items-center justify-around py-1 border-t border-[#321323] text-[#A99BAA]">
            <button onClick={() => navigateTo('settings')} className="p-1.5 hover:text-[#F0B8D3]"><Settings className="w-3.5 h-3.5" /></button>
            <button onClick={() => navigateTo('timeline')} className="p-1.5 hover:text-[#F0B8D3]"><Calendar className="w-3.5 h-3.5" /></button>
            <button onClick={() => alert("Calm 2 AM Mode")} className="p-1.5 hover:text-[#F0B8D3]"><Moon className="w-3.5 h-3.5 text-[#F0B8D3]" /></button>
            <button onClick={() => navigateTo('account')} className="p-1.5 hover:text-rose-400"><LogOut className="w-3.5 h-3.5" /></button>
          </div>
        </aside>

        {/* MOBILE DRAWER MENU (When open on mobile/tablet) */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md lg:hidden flex">
            <div className="w-72 bg-[#160D19] border-r border-[#321323] h-full p-5 space-y-4 overflow-y-auto no-scrollbar animate-fadeIn">
              <div className="flex items-center justify-between pb-3 border-b border-[#321323]">
                <span className="font-bold text-sm text-[#F0B8D3] font-serif">Soulverse Menu</span>
                <button onClick={() => setIsMobileMenuOpen(false)} className="text-[#A99BAA] p-1">
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
                        currentRoute === item.id ? 'bg-[#321323] text-[#F0B8D3] font-bold' : 'text-[#A99BAA]'
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
            <div className="h-[calc(100vh-6.5rem)] rounded-3xl overflow-hidden border border-[#321323] shadow-2xl bg-[#160D19]">
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
