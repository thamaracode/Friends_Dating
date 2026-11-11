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
import { TelegramWebWindow } from './components/TelegramWebWindow';

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
import { ProfileWorldsHub } from './components/ProfileWorldsHub';
import { LivingIdentityProfileView } from './components/LivingIdentityProfileView';

import type { MainNavTab, ExperienceTab, UserProfile } from './types';

export function App() {
  const [mainTab, setMainTab] = useState<MainNavTab>('home');
  const [activeSubsystem, setActiveSubsystem] = useState<ExperienceTab | null>(null);
  const [inspectedProfile, setInspectedProfile] = useState<UserProfile | null>(null);
  const [activeChatProfileOverride, setActiveChatProfileOverride] = useState<UserProfile | null>(null);
  const [isCrisisModalOpen, setIsCrisisModalOpen] = useState(false);
  const [isTelegramWebWindowOpen, setIsTelegramWebWindowOpen] = useState(false);

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
    <div className="min-h-screen min-h-[100dvh] bg-[#0D0209] text-[#FFF2F6] flex flex-col font-sans relative overflow-x-hidden selection:bg-[#FF0D69] selection:text-[#FFF2F6]">
      
      {/* Ambient Velvet Wine & Hot Magenta Smoke Glows (Matching User Reference) */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Top-right intense hot magenta glow */}
        <div className="absolute -top-36 -right-36 w-[650px] h-[650px] bg-gradient-to-bl from-[#FF0D69]/30 via-[#D60058]/20 to-transparent rounded-full blur-[110px]" />
        {/* Bottom-left deep sultry wine smoke glow */}
        <div className="absolute -bottom-36 -left-36 w-[650px] h-[650px] bg-gradient-to-tr from-[#9E0042]/25 via-[#540026]/30 to-transparent rounded-full blur-[110px]" />
        {/* Center ambient haze */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[550px] bg-[#66002B]/12 rounded-full blur-[130px]" />
      </div>

      {/* Top Header Bar */}
      <header className={`relative z-30 w-full transition-all duration-300 ${
        mainTab === 'messages' 
          ? 'max-w-[1700px] mx-auto px-4 lg:px-8 py-2.5' 
          : 'max-w-md mx-auto px-4 py-2'
      } flex items-center justify-between`}>
        <div 
          onClick={() => {
            setMainTab('home');
            setActiveSubsystem(null);
          }}
          className="flex items-center gap-2 cursor-pointer group"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#FF0D69] to-[#FF3B88] flex items-center justify-center text-white font-black text-sm shadow-[0_0_16px_rgba(255,13,105,0.8)] group-hover:scale-105 transition-transform">
            <Heart className="w-4 h-4 fill-white" />
          </div>
          <span className="font-black text-base tracking-widest text-[#FFF2F6] text-pink-gradient">
            FRIENDS
          </span>
        </div>

        {/* Desktop Navigation Tabs (when in wide layout) */}
        <div className="hidden lg:flex items-center gap-1 glass-panel px-3 py-1.5 rounded-full border border-[#FF1A75]/30 shadow-lg">
          {(['home', 'discover', 'likes', 'messages', 'profile'] as MainNavTab[]).map(tab => (
            <button
              key={tab}
              onClick={() => {
                setMainTab(tab);
                setActiveSubsystem(null);
              }}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all capitalize cursor-pointer ${
                mainTab === tab 
                  ? 'bg-gradient-to-r from-[#FF0D69] to-[#E0005C] text-white shadow-[0_0_12px_rgba(255,13,105,0.6)]' 
                  : 'text-[#C49DB2] hover:text-white hover:bg-white/5'
              }`}
            >
              {tab === 'home' ? 'Match' : tab === 'messages' ? 'Chats' : tab}
            </button>
          ))}
        </div>

        {/* Crisis 1926 Support Pill & Telegram Web Launcher */}
        <div className="flex items-center gap-1.5">
          {mainTab !== 'messages' && (
            <button
              onClick={() => {
                setMainTab('messages');
                setActiveSubsystem(null);
              }}
              className="px-2.5 py-1 rounded-full bg-[#180412] border border-[#FF1A75]/40 text-[#FFB8D2] hover:text-white text-[10px] font-bold flex items-center gap-1 shadow-sm hover:border-[#FF0D69] cursor-pointer transition-colors"
              title="Launch Telegram Web Messaging"
            >
              <span>✈️ Telegram Web</span>
            </button>
          )}

          <button
            onClick={() => setIsCrisisModalOpen(true)}
            className="px-2.5 py-1 rounded-full glass-panel border border-rose-500/30 text-rose-300 text-[10px] font-bold flex items-center gap-1 shadow-md hover:border-rose-400 cursor-pointer"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping" />
            <span>1926 Safe</span>
          </button>
        </div>
      </header>

      {/* Main Content View Container */}
      <main className={`relative z-10 flex-1 w-full flex flex-col min-h-0 transition-all duration-300 ${
        mainTab === 'messages'
          ? 'max-w-[1700px] mx-auto px-2 sm:px-4 lg:px-6 pb-2'
          : 'max-w-md mx-auto'
      }`}>
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
            {activeSubsystem === 'profile_worlds' && <ProfileWorldsHub isOwner={true} onClose={() => setActiveSubsystem(null)} />}
            {activeSubsystem === 'living_profile' && <LivingIdentityProfileView isOwner={true} onClose={() => setActiveSubsystem(null)} />}
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

      {/* Persistent Native Mobile Bottom Navigation Bar (Hidden on desktop in Messages to give 100% full web view) */}
      <div className={mainTab === 'messages' ? 'lg:hidden' : 'block'}>
        <MobileBottomNavbar 
          currentTab={mainTab}
          onSelectTab={(tab) => {
            setMainTab(tab);
            setActiveSubsystem(null);
          }}
          likesCount={5}
          unreadMessagesCount={2}
        />
      </div>

      {/* Global 24/7 Crisis Support Modal */}
      <CrisisSupportModal 
        isOpen={isCrisisModalOpen} 
        onClose={() => setIsCrisisModalOpen(false)} 
      />

      {/* Telegram Web View Window (Desktop/Tablet Full Experience) */}
      <TelegramWebWindow 
        isOpen={isTelegramWebWindowOpen} 
        onClose={() => setIsTelegramWebWindowOpen(false)} 
      />

    </div>
  );
}

export default App;
