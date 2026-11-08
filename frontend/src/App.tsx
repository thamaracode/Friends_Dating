import React, { useState } from 'react';
import { 
  Users, 
  Heart, 
  ArrowRight,
  ShieldCheck,
  Calendar,
  Compass,
  Layers,
  Lock,
  Menu,
  X,
  Radio,
  Share2,
  TrendingUp,
  User,
  Globe,
  Link2,
  ShieldAlert,
  Sparkles,
  HeartHandshake
} from 'lucide-react';

import { AppSidebar } from './components/AppSidebar';
import { MobileBottomNav } from './components/MobileBottomNav';
import { HomeDashboard } from './components/HomeDashboard';
import { DiscoverHumansView } from './components/DiscoverHumansView';
import { MessagesRoomsHub } from './components/MessagesRoomsHub';
import { AdminDashboard } from './components/AdminDashboard';

import { ProfileCard } from './components/ProfileCard';
import { SelfDiscoveryHub } from './components/SelfDiscoveryHub';
import { CommunitiesHub } from './components/CommunitiesHub';
import { TalkSomeoneView } from './components/TalkSomeoneView';
import { SocialGrowthHub } from './components/SocialGrowthHub';
import { ShareEngineHub } from './components/ShareEngineHub';
import { MyWorldProfile } from './components/MyWorldProfile';
import { FriendsRealHub } from './components/FriendsRealHub';
import { EventsHub } from './components/EventsHub';
import { FriendsConnectHub } from './components/FriendsConnectHub';
import { UniversalIdentityHub } from './components/UniversalIdentityHub';
import { PrivacyCentreHub } from './components/PrivacyCentreHub';
import { CrisisSupportModal } from './components/CrisisSupportModal';

import { MOCK_PROFILES } from './mockData';
import type { ExperienceTab, UserProfile } from './types';

export function App() {
  const [activeTab, setActiveTab] = useState<ExperienceTab>('home');
  const [isCrisisModalOpen, setIsCrisisModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleInitiateChat = (profile: UserProfile) => {
    alert(`Initiating mutual verified conversation request with ${profile.name}. Dialogue gate opened.`);
    setActiveTab('messages_rooms');
  };

  const handleMobileNavSelect = (tab: ExperienceTab) => {
    setActiveTab(tab);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#090909] text-[#F5F0E6] flex flex-col md:flex-row font-sans selection:bg-[#D6AD60]/30 selection:text-[#F1D99F]">
      
      {/* Desktop Persistent Left Sidebar */}
      <div className="hidden md:block">
        <AppSidebar 
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          onOpenCrisisModal={() => setIsCrisisModalOpen(true)}
        />
      </div>

      {/* Main Content Workspace */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Mobile Header Bar */}
        <header className="md:hidden flex items-center justify-between p-4 bg-[#111111] border-b border-[#302B22] sticky top-0 z-40">
          <div 
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-2 cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#D6AD60] to-[#F1D99F] flex items-center justify-center text-[#090909] font-black text-sm">
              F
            </div>
            <span className="font-extrabold text-sm tracking-wider text-[#F5F0E6]">FRIENDS</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCrisisModalOpen(true)}
              className="px-2.5 py-1 rounded-lg bg-rose-950/50 border border-rose-500/40 text-rose-300 text-[10px] font-bold"
            >
              1926 Crisis
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-1.5 rounded-lg bg-[#211E18] text-[#F5F0E6] border border-[#302B22]"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </header>

        {/* Mobile Slide-out Drawer */}
        {isMobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-50 bg-[#090909]/95 backdrop-blur-md p-6 overflow-y-auto space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between pb-4 border-b border-[#302B22]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#D6AD60] to-[#F1D99F] flex items-center justify-center text-[#090909] font-black text-sm">
                  F
                </div>
                <span className="font-bold text-base text-[#F5F0E6]">Complete Experience Menu</span>
              </div>
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 rounded-xl bg-[#211E18] text-[#A7A094] hover:text-[#F5F0E6]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
              <button onClick={() => handleMobileNavSelect('home')} className="p-3 rounded-xl bg-[#171717] border border-[#302B22] text-left">Home Dashboard</button>
              <button onClick={() => handleMobileNavSelect('discover')} className="p-3 rounded-xl bg-[#171717] border border-[#302B22] text-left">Discover Humans</button>
              <button onClick={() => handleMobileNavSelect('messages_rooms')} className="p-3 rounded-xl bg-[#171717] border border-[#302B22] text-left">Messages & Audio</button>
              <button onClick={() => handleMobileNavSelect('events')} className="p-3 rounded-xl bg-[#171717] border border-[#302B22] text-left">Events & Parties</button>
              <button onClick={() => handleMobileNavSelect('communities')} className="p-3 rounded-xl bg-[#171717] border border-[#302B22] text-left">Social Circles</button>
              <button onClick={() => handleMobileNavSelect('my_world')} className="p-3 rounded-xl bg-[#171717] border border-[#302B22] text-left">My World Profile</button>
              <button onClick={() => handleMobileNavSelect('social_growth')} className="p-3 rounded-xl bg-[#171717] border border-[#302B22] text-left">Social Growth Ladder</button>
              <button onClick={() => handleMobileNavSelect('self_discovery')} className="p-3 rounded-xl bg-[#171717] border border-[#302B22] text-left">Self Discovery</button>
              <button onClick={() => handleMobileNavSelect('share_engine')} className="p-3 rounded-xl bg-[#171717] border border-[#302B22] text-left">Identity Card Engine</button>
              <button onClick={() => handleMobileNavSelect('friends_real')} className="p-3 rounded-xl bg-[#171717] border border-[#302B22] text-left">Real Safety & Meet</button>
              <button onClick={() => handleMobileNavSelect('friends_connect')} className="p-3 rounded-xl bg-[#171717] border border-[#302B22] text-left">Beyond FRIENDS</button>
              <button onClick={() => handleMobileNavSelect('universal_id')} className="p-3 rounded-xl bg-[#171717] border border-[#302B22] text-left">Universal Directory</button>
              <button onClick={() => handleMobileNavSelect('privacy_centre')} className="p-3 rounded-xl bg-[#171717] border border-[#302B22] text-left">Privacy Centre</button>
              <button onClick={() => handleMobileNavSelect('talk')} className="p-3 rounded-xl bg-[#171717] border border-[#302B22] text-left">Talk to Someone</button>
              <button onClick={() => handleMobileNavSelect('admin')} className="p-3 rounded-xl bg-[#171717] border border-rose-500/40 text-rose-300 text-left col-span-2">Admin Dashboard</button>
            </div>
          </div>
        )}

        {/* Central Workspace Scroll Area */}
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-8">
          
          {/* TAB 1: HOME SOCIAL DASHBOARD */}
          {activeTab === 'home' && (
            <HomeDashboard 
              onNavigate={setActiveTab}
              onInitiateChat={handleInitiateChat}
            />
          )}

          {/* TAB 2: DISCOVER HUMANS (HCM MODEL) */}
          {activeTab === 'discover' && (
            <DiscoverHumansView 
              onNavigate={setActiveTab}
              onInitiateChat={handleInitiateChat}
            />
          )}

          {/* TAB 3: MESSAGES & LIVE AUDIO LOUNGES */}
          {activeTab === 'messages_rooms' && (
            <MessagesRoomsHub />
          )}

          {/* TAB 4: EVENTS & GATHERINGS */}
          {activeTab === 'events' && (
            <EventsHub />
          )}

          {/* TAB 5: COMMUNITIES & SOCIAL CIRCLES */}
          {activeTab === 'communities' && (
            <CommunitiesHub />
          )}

          {/* TAB 6: MY WORLD AUTOBIOGRAPHICAL PROFILE */}
          {activeTab === 'my_world' && (
            <MyWorldProfile />
          )}

          {/* TAB 7: SOCIAL GROWTH (30-Day Ladder, Academy, Letters) */}
          {activeTab === 'social_growth' && (
            <SocialGrowthHub />
          )}

          {/* TAB 8: SELF DISCOVERY QUIZZES */}
          {activeTab === 'self_discovery' && (
            <SelfDiscoveryHub />
          )}

          {/* TAB 9: SHARE ENGINE (Instagram Story 9:16 Card Customizer) */}
          {activeTab === 'share_engine' && (
            <ShareEngineHub />
          )}

          {/* TAB 10: FRIENDS REAL & MEET (Verification & Safety) */}
          {activeTab === 'friends_real' && (
            <FriendsRealHub />
          )}

          {/* TAB 11: FRIENDS CONNECT (Beyond Our Platform) */}
          {activeTab === 'friends_connect' && (
            <FriendsConnectHub />
          )}

          {/* TAB 12: UNIVERSAL IDENTITY DIRECTORY (50+ Accounts) */}
          {activeTab === 'universal_id' && (
            <UniversalIdentityHub />
          )}

          {/* TAB 13: PRIVACY & DATA GOVERNANCE CENTRE */}
          {activeTab === 'privacy_centre' && (
            <PrivacyCentreHub />
          )}

          {/* TAB 14: TALK TO SOMEONE (Companionship & Listening) */}
          {activeTab === 'talk' && (
            <TalkSomeoneView onOpenCrisisModal={() => setIsCrisisModalOpen(true)} />
          )}

          {/* TAB 15: ADMIN DASHBOARD & SAFETY OPS */}
          {activeTab === 'admin' && (
            <AdminDashboard />
          )}

        </main>

        {/* Global Footer */}
        <footer className="border-t border-[#302B22] bg-[#090909] py-6 text-center text-xs text-[#A7A094] hidden md:block">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-[#D6AD60]">FRIENDS</span>
              <span>— You own your identity. We respect your boundaries.</span>
            </div>
            <div className="text-[11px] text-[#A7A094]">
              Sri Lanka PDPA No. 9 of 2022 • GDPR Compliant • Zero Third-Party Advertising Ingestion.
            </div>
          </div>
        </footer>

        {/* Mobile Persistent Bottom Navigation */}
        <MobileBottomNav 
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        />

      </div>

      {/* Global 24/7 Crisis Support Modal */}
      <CrisisSupportModal 
        isOpen={isCrisisModalOpen} 
        onClose={() => setIsCrisisModalOpen(false)} 
      />

    </div>
  );
}

export default App;
