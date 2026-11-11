import React, { useState } from 'react';
import { 
  Heart, 
  Sparkles, 
  ShieldCheck, 
  ArrowLeft,
  X,
  Compass,
  Radio,
  Calendar,
  Users,
  Lock,
  Globe,
  Share2,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

import { MobileBottomNavbar } from './components/MobileBottomNavbar';
import { SwipeDiscoveryView } from './components/SwipeDiscoveryView';
import { DiscoverExplorationView } from './components/DiscoverExplorationView';
import { LikesAndMatchesView } from './components/LikesAndMatchesView';
import { MessagingInboxView } from './components/MessagingInboxView';
import { MyProfileHub } from './components/MyProfileHub';
import { ProfileDetailSheet } from './components/ProfileDetailSheet';

// Personality & Entertainment Systems
import { MyCharacterBuilder } from './components/MyCharacterBuilder';
import { LuckyUniverseView } from './components/LuckyUniverseView';
import { MiniGameEngine } from './components/MiniGameEngine';
import { BlindChemistryView } from './components/BlindChemistryView';

// Subsystems preserved
import { MyWorldProfile } from './components/MyWorldProfile';
import { EventsHub } from './components/EventsHub';
import { CommunitiesHub } from './components/CommunitiesHub';
import { SocialGrowthHub } from './components/SocialGrowthHub';
import { ShareEngineHub } from './components/ShareEngineHub';
import { FriendsRealHub } from './components/FriendsRealHub';
import { FriendsConnectHub } from './components/FriendsConnectHub';
import { UniversalIdentityHub } from './components/UniversalIdentityHub';
import { PrivacyCentreHub } from './components/PrivacyCentreHub';
import { SelfDiscoveryHub } from './components/SelfDiscoveryHub';
import { TalkSomeoneView } from './components/TalkSomeoneView';
import { AdminDashboard } from './components/AdminDashboard';
import { CrisisSupportModal } from './components/CrisisSupportModal';

import type { MainNavTab, ExperienceTab, UserProfile } from './types';

export function App() {
  const [mainTab, setMainTab] = useState<MainNavTab>('home');
  const [activeSubsystem, setActiveSubsystem] = useState<ExperienceTab | null>(null);
  const [inspectedProfile, setInspectedProfile] = useState<UserProfile | null>(null);
  const [activeChatProfileOverride, setActiveChatProfileOverride] = useState<UserProfile | null>(null);
  const [isCrisisModalOpen, setIsCrisisModalOpen] = useState(false);

  const handleOpenProfile = (profile: UserProfile) => {
    setInspectedProfile(profile);
  };

  const handleInitiateChat = (profile: UserProfile) => {
    setActiveChatProfileOverride(profile);
    setMainTab('messages');
    setActiveSubsystem(null);
  };

  const handleSuperLike = (profile: UserProfile) => {
    alert(`Super Liked ${profile.name}! Your profile is now highlighted at the top of their deck with a gold glow.`);
  };

  return (
    <div className="min-h-screen min-h-[100dvh] bg-[#100B12] text-[#FFF1F3] flex flex-col font-sans relative overflow-x-hidden selection:bg-[#FF4F87] selection:text-[#FFF1F3]">
      
      {/* Ambient pink lighting glows (radial atmosphere) */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#FF4F87]/10 rounded-full blur-3xl pointer-events-none -mt-24 z-0" />
      <div className="fixed bottom-0 right-0 w-80 h-80 bg-[#FF78A8]/8 rounded-full blur-3xl pointer-events-none -mb-20 z-0" />

      {/* Top Mobile Bar with 24/7 Crisis Access */}
      <header className="relative z-30 max-w-md mx-auto w-full px-4 py-2 flex items-center justify-between">
        <div 
          onClick={() => {
            setMainTab('home');
            setActiveSubsystem(null);
          }}
          className="flex items-center gap-2 cursor-pointer group"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#FF4F87] to-[#FF78A8] flex items-center justify-center text-white font-black text-sm shadow-[0_0_12px_rgba(255,79,135,0.7)] group-hover:scale-105 transition-transform">
            <Heart className="w-4 h-4 fill-white" />
          </div>
          <span className="font-black text-base tracking-widest text-[#FFF1F3] text-pink-gradient">
            FRIENDS
          </span>
        </div>

        {/* Crisis 1926 Support Pill */}
        <button
          onClick={() => setIsCrisisModalOpen(true)}
          className="px-2.5 py-1 rounded-full glass-panel border border-rose-500/30 text-rose-300 text-[10px] font-bold flex items-center gap-1 shadow-md hover:border-rose-400 cursor-pointer"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping" />
          <span>1926 Safe</span>
        </button>
      </header>

      {/* Main Content View Container */}
      <main className="relative z-10 flex-1 w-full max-w-md mx-auto flex flex-col min-h-0">
        {/* If Subsystem active (e.g. 8 chapters, privacy centre, events) */}
        {activeSubsystem ? (
          <div className="flex-1 flex flex-col p-3 pb-24 animate-fadeIn">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#FF78A8]/20">
              <button
                onClick={() => setActiveSubsystem(null)}
                className="flex items-center gap-1.5 text-xs font-bold text-[#FFB4CE] hover:text-[#FFF1F3] cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Hub</span>
              </button>
              <span className="text-[10px] uppercase font-bold text-[#7A6975] tracking-wider">Subsystem</span>
            </div>

            {activeSubsystem === 'my_world' && <MyWorldProfile />}
            {activeSubsystem === 'character_builder' && <MyCharacterBuilder onClose={() => setActiveSubsystem(null)} />}
            {activeSubsystem === 'lucky_universe' && <LuckyUniverseView />}
            {activeSubsystem === 'mini_games' && <MiniGameEngine onSendResultToChat={(res) => {
              setActiveChatProfileOverride(inspectedProfile || null);
              setMainTab('messages');
              setActiveSubsystem(null);
            }} />}
            {activeSubsystem === 'blind_chemistry' && <BlindChemistryView onOpenRevealedChat={(p) => {
              setActiveChatProfileOverride(p);
              setMainTab('messages');
              setActiveSubsystem(null);
            }} />}
            {activeSubsystem === 'events' && <EventsHub />}
            {activeSubsystem === 'communities' && <CommunitiesHub />}
            {activeSubsystem === 'social_growth' && <SocialGrowthHub />}
            {activeSubsystem === 'share_engine' && <ShareEngineHub />}
            {activeSubsystem === 'friends_real' && <FriendsRealHub />}
            {activeSubsystem === 'friends_connect' && <FriendsConnectHub />}
            {activeSubsystem === 'universal_id' && <UniversalIdentityHub />}
            {activeSubsystem === 'privacy_centre' && <PrivacyCentreHub />}
            {activeSubsystem === 'self_discovery' && <SelfDiscoveryHub />}
            {activeSubsystem === 'talk' && <TalkSomeoneView onOpenCrisisModal={() => setIsCrisisModalOpen(true)} />}
            {activeSubsystem === 'admin' && <AdminDashboard />}
          </div>
        ) : (
          /* PRIMARY 5-TAB NATIVE MOBILE SCREENS */
          <>
            {/* TAB 1: SWIPE MATCHING DISCOVERY */}
            {mainTab === 'home' && (
              <SwipeDiscoveryView 
                onOpenProfileDetail={handleOpenProfile}
                onInitiateChat={handleInitiateChat}
                onSuperLike={handleSuperLike}
              />
            )}

            {/* TAB 2: DISCOVER EXPLORATION (Social Grid, Shorts Video, Personality) */}
            {mainTab === 'discover' && (
              <DiscoverExplorationView 
                onOpenProfileDetail={handleOpenProfile}
                onInitiateChat={handleInitiateChat}
                onOpenBlindChemistry={() => setActiveSubsystem('blind_chemistry')}
              />
            )}

            {/* TAB 3: LIKES & MUTUAL MATCHES */}
            {mainTab === 'likes' && (
              <LikesAndMatchesView 
                onOpenProfileDetail={handleOpenProfile}
                onInitiateChat={handleInitiateChat}
              />
            )}

            {/* TAB 4: MESSAGING & INBOX */}
            {mainTab === 'messages' && (
              <MessagingInboxView 
                onOpenProfileDetail={handleOpenProfile}
                onOpenGame={() => setActiveSubsystem('mini_games')}
                onOpenLuckyDice={() => setActiveSubsystem('lucky_universe')}
                activeProfileOverride={activeChatProfileOverride}
                onClearActiveProfileOverride={() => setActiveChatProfileOverride(null)}
              />
            )}

            {/* TAB 5: PROFILE HUB & SETTINGS */}
            {mainTab === 'profile' && (
              <MyProfileHub 
                onNavigateSubsystem={setActiveSubsystem}
              />
            )}
          </>
        )}
      </main>

      {/* Individual User Profile Detail Modal / Sheet */}
      <ProfileDetailSheet 
        profile={inspectedProfile}
        onClose={() => setInspectedProfile(null)}
        onInitiateChat={handleInitiateChat}
        onSuperLike={handleSuperLike}
      />

      {/* Persistent Native Mobile Bottom Navigation Bar */}
      <MobileBottomNavbar 
        currentTab={mainTab}
        onSelectTab={(tab) => {
          setMainTab(tab);
          setActiveSubsystem(null);
        }}
        likesCount={5}
        unreadMessagesCount={2}
      />

      {/* Global 24/7 Crisis Support Modal */}
      <CrisisSupportModal 
        isOpen={isCrisisModalOpen} 
        onClose={() => setIsCrisisModalOpen(false)} 
      />

    </div>
  );
}

export default App;
