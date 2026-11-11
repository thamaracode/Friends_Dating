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
  SkipForward, 
  ChevronRight, 
  Eye, 
  Lock, 
  Settings, 
  Tv, 
  Moon, 
  LogOut, 
  Share2, 
  Calendar, 
  BookOpen, 
  Sliders, 
  Film, 
  TrendingUp, 
  Briefcase,
  Music,
  MapPin,
  Check
} from 'lucide-react';
import { CURRENT_USER } from '../mockData';
import { profileWorldsClient } from '../services/profileWorldsApiClient';
import { markdownProfileClient } from '../services/markdownProfileApiClient';
import type { MainNavTab, ExperienceTab } from '../types';
import type { ProfileWorld } from '../types/profileWorlds';
import type { ProfileMarkdown } from '../types/markdownProfile';

interface DesktopSoulverseViewProps {
  currentTab: MainNavTab;
  onSelectTab: (tab: MainNavTab) => void;
  onNavigateSubsystem: (tab: ExperienceTab) => void;
  onOpenWorld: (worldId: string) => void;
  onOpenReadme: () => void;
}

export const DesktopSoulverseView: React.FC<DesktopSoulverseViewProps> = ({
  currentTab,
  onSelectTab,
  onNavigateSubsystem,
  onOpenWorld,
  onOpenReadme
}) => {
  const [profile] = useState(CURRENT_USER);
  const [worlds, setWorlds] = useState<ProfileWorld[]>([]);
  const [activeTab, setActiveTab] = useState<'worlds' | 'about' | 'timeline' | 'collections' | 'connections'>('worlds');
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    profileWorldsClient.getWorlds('usr_me', 'usr_me').then(fetched => {
      if (fetched && fetched.length > 0) {
        setWorlds(fetched);
      }
    }).catch(console.error);
  }, []);

  return (
    <div className="w-full min-h-screen bg-[#09080D] text-[#E9DFE8] flex flex-col font-sans selection:bg-[#A64D78] selection:text-[#E9DFE8]">
      
      {/* 1. TOP HEADER BAR */}
      <header className="h-16 border-b border-[#321323] px-6 flex items-center justify-between sticky top-0 z-40 bg-[#09080D]/90 backdrop-blur-md">
        {/* Left: Brand Identity */}
        <div 
          onClick={() => onSelectTab('profile')}
          className="flex items-center gap-2.5 cursor-pointer group w-64 shrink-0"
        >
          <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-[#321323] to-[#A64D78] flex items-center justify-center text-[#F0B8D3] shadow-[0_0_12px_rgba(166,77,120,0.3)] group-hover:scale-105 transition-transform">
            <Heart className="w-3.5 h-3.5 fill-[#F0B8D3]" />
          </div>
          <span className="font-black text-sm tracking-widest text-[#F0B8D3] font-serif">
            Soulverse <span className="text-[#A64D78]">💖</span>
          </span>
        </div>

        {/* Center: Global Search Bar */}
        <div className="flex-1 max-w-xl mx-8 relative">
          <Search className="w-4 h-4 text-[#A99BAA] absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search anything..."
            className="w-full pl-11 pr-4 py-2 rounded-full bg-[#160D19] border border-[#321323] text-xs text-[#E9DFE8] placeholder-[#A99BAA]/60 focus:outline-none focus:border-[#A64D78]/60 transition-colors"
          />
        </div>

        {/* Right: Actions & User Avatar */}
        <div className="flex items-center gap-3 w-64 justify-end shrink-0">
          <button 
            onClick={() => onNavigateSubsystem('self_discovery')}
            className="p-2 rounded-full hover:bg-[#160D19] text-[#A99BAA] hover:text-[#F0B8D3] transition-colors"
            title="Sparkles / AI"
          >
            <Sparkles className="w-4 h-4" />
          </button>
          <button 
            onClick={() => onNavigateSubsystem('communities')}
            className="p-2 rounded-full hover:bg-[#160D19] text-[#A99BAA] hover:text-[#F0B8D3] transition-colors"
            title="Communities"
          >
            <Users className="w-4 h-4" />
          </button>
          <button 
            onClick={() => onSelectTab('messages')}
            className="p-2 rounded-full hover:bg-[#160D19] text-[#A99BAA] hover:text-[#F0B8D3] relative transition-colors"
            title="Messages"
          >
            <MessageCircle className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#FF3B88]" />
          </button>
          <div 
            onClick={() => onSelectTab('profile')}
            className="w-8 h-8 rounded-full overflow-hidden border border-[#A64D78]/40 cursor-pointer hover:border-[#F0B8D3] transition-all ml-1"
          >
            <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" />
          </div>
        </div>
      </header>

      {/* 2. MAIN THREE-COLUMN DESKTOP CONTAINER */}
      <div className="flex-1 flex max-w-[1720px] w-full mx-auto px-4 py-5 gap-6">

        {/* =================================================================== */}
        {/* COLUMN 1: LEFT PERSISTENT NAVIGATION SIDEBAR                        */}
        {/* =================================================================== */}
        <aside className="w-60 shrink-0 flex flex-col space-y-5 sticky top-24 h-[calc(100vh-7rem)] overflow-y-auto no-scrollbar">
          {/* Main Navigation Links */}
          <nav className="space-y-1">
            {[
              { id: 'home', label: 'Home', icon: Home },
              { id: 'discover', label: 'Discover', icon: Compass },
              { id: 'messages', label: 'Messages', icon: MessageCircle, badge: '12' },
              { id: 'notifications', label: 'Notifications', icon: Bell, badge: '3' },
              { id: 'likes', label: 'Matches', icon: Heart },
              { id: 'friends', label: 'Friends', icon: Users },
              { id: 'profile', label: 'Profile', icon: User },
              { id: 'worlds', label: 'Explore Worlds', icon: Globe2 },
              { id: 'create', label: 'Create Post', icon: PlusSquare }
            ].map(item => {
              const Icon = item.icon;
              const isActive = (item.id === 'profile' && currentTab === 'profile') ||
                               (item.id === 'home' && currentTab === 'home') ||
                               (item.id === 'discover' && currentTab === 'discover') ||
                               (item.id === 'messages' && currentTab === 'messages') ||
                               (item.id === 'likes' && currentTab === 'likes');

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (item.id === 'home' || item.id === 'discover' || item.id === 'messages' || item.id === 'likes' || item.id === 'profile') {
                      onSelectTab(item.id as MainNavTab);
                    } else if (item.id === 'worlds') {
                      onNavigateSubsystem('profile_worlds');
                    } else if (item.id === 'create') {
                      onOpenReadme();
                    }
                  }}
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
                onClick={() => onNavigateSubsystem('profile_worlds')}
                className="text-[10px] text-[#A64D78] hover:text-[#F0B8D3] cursor-pointer"
              >
                Manage ›
              </button>
            </div>

            <div className="space-y-1">
              {worlds.slice(0, 4).map(w => (
                <div
                  key={w.id}
                  onClick={() => onOpenWorld(w.id)}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-[#A99BAA] hover:bg-[#160D19] hover:text-[#E9DFE8] cursor-pointer transition-colors group"
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <div className="w-6 h-6 rounded-lg overflow-hidden shrink-0 border border-[#321323]">
                      <img src={w.cover_image_url || profile.avatar} alt={w.name} className="w-full h-full object-cover" />
                    </div>
                    <span className="truncate text-[11px]">{w.name}</span>
                  </div>
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-black/40 text-[#A99BAA] shrink-0 border border-white/5">
                    {w.visibility === 'public' ? 'Public' : w.visibility === 'matches' ? 'Matches' : 'Private'}
                  </span>
                </div>
              ))}

              <button
                onClick={() => onNavigateSubsystem('profile_worlds')}
                className="w-full flex items-center gap-2 px-3 py-2 text-[11px] text-[#A64D78] hover:text-[#F0B8D3] cursor-pointer transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create New World</span>
              </button>
            </div>
          </div>

          {/* Premium Banner Card */}
          <div className="p-3.5 rounded-3xl bg-[#160D19] border border-[#321323] space-y-2.5 text-center mt-auto shadow-md">
            <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-[#F0B8D3]">
              <span>👑</span>
              <span>Premium</span>
            </div>
            <p className="text-[10px] text-[#A99BAA]">Unlock more magic, custom themes, and unlimited worlds ✧</p>
            <button 
              onClick={() => alert("Soulverse Premium activated!")}
              className="w-full py-2 rounded-xl rose-gradient-btn text-xs font-bold shadow-md cursor-pointer"
            >
              Go Premium
            </button>
          </div>

          {/* Bottom Footer Toolbar */}
          <div className="flex items-center justify-around py-1 border-t border-[#321323] text-[#A99BAA]">
            <button onClick={() => onNavigateSubsystem('privacy_centre')} className="p-1.5 hover:text-[#F0B8D3]"><Settings className="w-3.5 h-3.5" /></button>
            <button onClick={() => onNavigateSubsystem('character_builder')} className="p-1.5 hover:text-[#F0B8D3]"><Tv className="w-3.5 h-3.5" /></button>
            <button onClick={() => alert("Night Mode active")} className="p-1.5 hover:text-[#F0B8D3]"><Moon className="w-3.5 h-3.5 text-[#F0B8D3]" /></button>
            <button onClick={() => alert("Logged out")} className="p-1.5 hover:text-rose-400"><LogOut className="w-3.5 h-3.5" /></button>
          </div>
        </aside>

        {/* =================================================================== */}
        {/* COLUMN 2: CENTER PROFILE & WORLDS CANVAS                            */}
        {/* =================================================================== */}
        <main className="flex-1 min-w-0 flex flex-col space-y-5">
          
          {/* Hero Profile Banner Card (Castle under full moon with dark rose aura) */}
          <div className="rounded-3xl overflow-hidden bg-[#160D19] border border-[#321323] shadow-2xl relative">
            {/* Castle Cover Artwork */}
            <div className="relative w-full h-56 sm:h-64 overflow-hidden bg-[#09080D]">
              <img
                src="https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1600&q=80"
                alt="Soulverse Ambient World"
                className="w-full h-full object-cover opacity-75 filter saturate-110 contrast-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#160D19] via-[#160D19]/40 to-transparent" />
            </div>

            {/* Profile Identity Details Row */}
            <div className="px-6 pb-5 pt-0 relative -mt-16 flex flex-wrap items-end justify-between gap-4">
              <div className="flex items-end gap-5">
                {/* Avatar with subtle rose glowing ring */}
                <div className="relative">
                  <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-[#A64D78] via-[#D78BAF] to-[#321323] shadow-[0_0_24px_rgba(166,77,120,0.35)]">
                    <img 
                      src={profile.avatar} 
                      alt={profile.name} 
                      className="w-full h-full rounded-full object-cover bg-black"
                    />
                  </div>
                  <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-[#160D19]" />
                </div>

                {/* Name, Tagline & Stats */}
                <div className="space-y-1 pb-1">
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl font-black text-[#E9DFE8] flex items-center gap-1.5 font-serif">
                      <span>{profile.name}</span>
                      <span className="text-[#A64D78] text-sm">💖</span>
                    </h1>
                    <span className="text-xs text-[#A99BAA]">@{profile.username}</span>
                  </div>
                  <p className="text-xs text-[#A99BAA] italic">
                    "{profile.aboutMeLong || 'Just a dreamer in a chaotic world. 💖'}"
                  </p>
                  <div className="flex items-center gap-4 text-xs text-[#E9DFE8] pt-1">
                    <span><strong>12</strong> <span className="text-[#A99BAA]">Worlds</span></span>
                    <span><strong>8.4K</strong> <span className="text-[#A99BAA]">Followers</span></span>
                    <span><strong>421</strong> <span className="text-[#A99BAA]">Following</span></span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pb-1">
                <button
                  onClick={onOpenReadme}
                  className="px-4 py-2 rounded-2xl bg-[#321323] hover:bg-[#3E182C] text-[#F0B8D3] border border-[#A64D78]/30 text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5 text-[#D78BAF]" />
                  <span>Edit Profile</span>
                </button>
                <button
                  onClick={() => alert("Profile shared")}
                  className="p-2 rounded-2xl bg-[#160D19] border border-[#321323] text-[#A99BAA] hover:text-[#E9DFE8] cursor-pointer"
                >
                  •••
                </button>
              </div>
            </div>

            {/* Profile Navigation Tabs */}
            <div className="px-6 border-t border-[#321323] flex items-center gap-2 py-2 overflow-x-auto no-scrollbar text-xs">
              {[
                { id: 'worlds', label: '★ My Worlds' },
                { id: 'about', label: 'About' },
                { id: 'timeline', label: 'Timeline' },
                { id: 'collections', label: 'Collections' },
                { id: 'connections', label: 'Connections' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-4 py-1.5 rounded-full font-bold transition-all cursor-pointer ${
                    activeTab === tab.id
                      ? 'bg-[#321323] text-[#F0B8D3] border border-[#A64D78]/40 shadow-[0_0_12px_rgba(166,77,120,0.2)]'
                      : 'text-[#A99BAA] hover:text-[#E9DFE8]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
              <span className="text-xs text-[#A99BAA] px-2 cursor-pointer hover:text-[#E9DFE8]">More ⌄</span>
            </div>
          </div>

          {/* 3. WORLDS GRID (Real Life, Imaginary Life, Cinematic Life, Inner World) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-3.5">
            {worlds.slice(0, 4).map(w => (
              <div
                key={w.id}
                onClick={() => onOpenWorld(w.id)}
                className="group relative rounded-3xl overflow-hidden bg-[#160D19] border border-[#321323] hover:border-[#A64D78]/40 transition-all cursor-pointer shadow-lg flex flex-col justify-between"
              >
                {/* Cover Asset Preview */}
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#09080D]">
                  <img
                    src={w.cover_image_url || profile.avatar}
                    alt={w.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#160D19] via-transparent to-black/20" />
                  <div className="absolute top-2.5 right-2.5 p-1 rounded-full bg-black/50 text-[#A99BAA]">
                    <Eye className="w-3 h-3" />
                  </div>
                </div>

                {/* Card Title & Audience Pill */}
                <div className="p-3.5 space-y-1">
                  <h3 className="text-xs font-bold text-[#E9DFE8] group-hover:text-[#F0B8D3] transition-colors truncate">
                    {w.name}
                  </h3>
                  <p className="text-[10px] text-[#A99BAA] line-clamp-1">{w.description}</p>
                  
                  <div className="flex items-center justify-between pt-2 border-t border-[#321323]/50 text-[10px]">
                    <span className="flex items-center gap-1 text-[#A99BAA]">
                      {w.visibility === 'public' ? '🌐 Public' : w.visibility === 'matches' ? '👥 Friends' : '🔒 Private'}
                    </span>
                    <ChevronRight className="w-3 h-3 text-[#A99BAA] group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </div>
            ))}

            {/* "+ Create New World" Card */}
            <div
              onClick={() => onNavigateSubsystem('profile_worlds')}
              className="rounded-3xl border border-dashed border-[#321323] hover:border-[#A64D78]/50 bg-[#160D19]/40 flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-all hover:bg-[#160D19] group min-h-[160px]"
            >
              <div className="w-10 h-10 rounded-2xl bg-[#321323] flex items-center justify-center text-[#A64D78] group-hover:text-[#F0B8D3] group-hover:scale-105 transition-all mb-2">
                <Plus className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-[#E9DFE8] group-hover:text-[#F0B8D3]">Create New World</span>
              <span className="text-[10px] text-[#A99BAA]">Add a new dimension</span>
            </div>
          </div>

          {/* 4. RECENT ACTIVITY & LIFE TIMELINE (Bottom dual modules from screenshot) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            
            {/* Recent Activity Card */}
            <div className="rounded-3xl p-5 bg-[#160D19] border border-[#321323] space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-[#E9DFE8]">Recent Activity</h3>
                <button 
                  onClick={() => onNavigateSubsystem('profile_worlds')}
                  className="text-[10px] text-[#A64D78] hover:text-[#F0B8D3] cursor-pointer"
                >
                  See all ›
                </button>
              </div>

              <div className="space-y-3">
                {[
                  { icon: '🏔️', text: 'Added a new memory to My Real Life', time: '2 hours ago' },
                  { icon: '🌌', text: 'Updated My Inner World', time: '3 hours ago' },
                  { icon: '💖', text: 'Liked a post from @stella', time: '4 hours ago' },
                  { icon: '🎬', text: 'Added a photo to My Cinematic Life', time: '5 hours ago' }
                ].map((act, i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded-2xl hover:bg-black/20 transition-colors">
                    <div className="flex items-center gap-3 text-xs">
                      <span className="text-sm p-1.5 rounded-xl bg-[#321323]">{act.icon}</span>
                      <span className="text-[#E9DFE8] font-medium text-[11px]">{act.text}</span>
                    </div>
                    <span className="text-[10px] text-[#A99BAA]">{act.time}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Life Timeline Card with Cherry Blossom Illustration */}
            <div className="rounded-3xl p-5 bg-[#160D19] border border-[#321323] space-y-4 shadow-xl relative overflow-hidden">
              <div className="flex items-center justify-between relative z-10">
                <h3 className="text-xs font-bold text-[#E9DFE8]">Life Timeline</h3>
                <button 
                  onClick={() => onNavigateSubsystem('living_profile')}
                  className="text-[10px] text-[#A64D78] hover:text-[#F0B8D3] cursor-pointer"
                >
                  See all ›
                </button>
              </div>

              {/* Vertical Milestones Axis */}
              <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-px before:bg-[#321323] relative z-10">
                {[
                  { year: '2026', text: 'Focus on happiness and growth. 💖' },
                  { year: '2024', text: 'A new chapter begins...' },
                  { year: '2021', text: 'Learning, healing, and becoming.' },
                  { year: '2019', text: 'Big dreams, bigger chaos. 💖' }
                ].map((node, i) => (
                  <div key={i} className="relative">
                    <span className="absolute -left-6 top-1 w-2 h-2 rounded-full bg-[#A64D78] ring-4 ring-[#160D19]" />
                    <div>
                      <span className="text-[10px] font-mono font-bold text-[#F0B8D3]">{node.year}</span>
                      <p className="text-xs text-[#E9DFE8] mt-0.5">{node.text}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Subtle background sakura illustration watermark */}
              <div className="absolute -right-4 -bottom-6 w-44 h-44 opacity-20 pointer-events-none text-right">
                <span className="text-8xl select-none">🌸</span>
              </div>
            </div>

          </div>
        </main>

        {/* =================================================================== */}
        {/* COLUMN 3: RIGHT PROFILE INFO SIDEBAR                                */}
        {/* =================================================================== */}
        <aside className="w-72 shrink-0 flex flex-col space-y-4 sticky top-24 h-[calc(100vh-7rem)] overflow-y-auto no-scrollbar">
          
          {/* About Me Card */}
          <div className="p-4 rounded-3xl bg-[#160D19] border border-[#321323] space-y-3 shadow-lg">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-[#E9DFE8]">About Me</h3>
              <Edit3 className="w-3.5 h-3.5 text-[#A99BAA] cursor-pointer hover:text-[#F0B8D3]" />
            </div>

            <p className="text-xs text-[#A99BAA] leading-relaxed">
              A curious soul, forever exploring life, emotions and endless possibilities.
            </p>

            <div className="space-y-1.5 text-xs text-[#E9DFE8] pt-1">
              <div className="flex items-center gap-2"><span>👤</span><span>She / Her</span></div>
              <div className="flex items-center gap-2"><span>🎂</span><span>19 years old</span></div>
              <div className="flex items-center gap-2"><span>✨</span><span>Dreamer • Creator • Overthinker</span></div>
              <div className="flex items-center gap-2"><span>🎵</span><span>Anime, Games, Music</span></div>
              <div className="flex items-center gap-2 text-[#A64D78]"><span>📍</span><span>Somewhere in the stars ✧</span></div>
            </div>
          </div>

          {/* My Stats Card */}
          <div className="p-4 rounded-3xl bg-[#160D19] border border-[#321323] space-y-2.5 shadow-lg">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-[#E9DFE8]">My Stats</h3>
              <TrendingUp className="w-3.5 h-3.5 text-[#A64D78]" />
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[#A99BAA] flex items-center gap-1.5"><span>👁️</span> Profile Views</span>
                <span className="font-bold text-[#F0B8D3]">24.8K <span className="text-[10px] text-emerald-400 font-normal">↑12%</span></span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#A99BAA] flex items-center gap-1.5"><span>❤️</span> Likes</span>
                <span className="font-bold text-[#F0B8D3]">4.2K <span className="text-[10px] text-emerald-400 font-normal">↑8%</span></span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#A99BAA] flex items-center gap-1.5"><span>💖</span> Matches</span>
                <span className="font-bold text-[#F0B8D3]">892 <span className="text-[10px] text-emerald-400 font-normal">↑6%</span></span>
              </div>
            </div>
          </div>

          {/* My Interests Pills */}
          <div className="p-4 rounded-3xl bg-[#160D19] border border-[#321323] space-y-2.5 shadow-lg">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-[#E9DFE8]">My Interests</h3>
              <span className="text-[10px] text-[#A64D78] cursor-pointer">Edit</span>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {['Anime', 'Gaming', 'Music', 'Art', 'Psychology', 'Space', 'Books', 'Fantasy', 'Technology'].map(tag => (
                <span
                  key={tag}
                  className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-[#321323] text-[#F0B8D3] border border-[#A64D78]/25"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Currently Playing Card */}
          <div className="p-4 rounded-3xl bg-[#160D19] border border-[#321323] space-y-2 shadow-lg">
            <span className="text-[10px] uppercase font-bold text-[#A99BAA] tracking-wider block">Currently Playing</span>
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#321323] flex items-center justify-center text-[#F0B8D3] shrink-0 border border-[#A64D78]/30">
                <Music className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-bold text-[#E9DFE8] truncate">Nightcore Dreams 💖</h4>
                <p className="text-[10px] text-[#A99BAA] truncate">Chill Lo-Fi Ambient</p>
              </div>
              <button
                onClick={() => setIsPlayingMusic(!isPlayingMusic)}
                className="p-2 rounded-full bg-[#321323] text-[#F0B8D3] hover:scale-105 transition-transform cursor-pointer"
              >
                {isPlayingMusic ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-[#F0B8D3]" />}
              </button>
            </div>

            {/* Subtle Progress bar */}
            <div className="w-full h-1 bg-black/40 rounded-full overflow-hidden mt-1">
              <div className="w-2/3 h-full bg-[#A64D78] rounded-full" />
            </div>
          </div>

          {/* Quick Access 2x2 Grid */}
          <div className="p-4 rounded-3xl bg-[#160D19] border border-[#321323] space-y-2 shadow-lg">
            <span className="text-[10px] uppercase font-bold text-[#A99BAA] tracking-wider block">Quick Access</span>
            
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={onOpenReadme}
                className="p-2.5 rounded-2xl bg-[#321323]/60 hover:bg-[#321323] border border-[#A64D78]/25 flex items-center gap-2 text-[#E9DFE8] cursor-pointer transition-colors"
              >
                <span>📝</span>
                <span className="text-[11px] font-bold">My Journal</span>
              </button>
              <button
                onClick={() => onNavigateSubsystem('living_profile')}
                className="p-2.5 rounded-2xl bg-[#321323]/60 hover:bg-[#321323] border border-[#A64D78]/25 flex items-center gap-2 text-[#E9DFE8] cursor-pointer transition-colors"
              >
                <span>💬</span>
                <span className="text-[11px] font-bold">My Questions</span>
              </button>
              <button
                onClick={() => onNavigateSubsystem('living_profile')}
                className="p-2.5 rounded-2xl bg-[#321323]/60 hover:bg-[#321323] border border-[#A64D78]/25 flex items-center gap-2 text-[#E9DFE8] cursor-pointer transition-colors"
              >
                <span>🕰️</span>
                <span className="text-[11px] font-bold">My Memories</span>
              </button>
              <button
                onClick={() => onNavigateSubsystem('profile_worlds')}
                className="p-2.5 rounded-2xl bg-[#321323]/60 hover:bg-[#321323] border border-[#A64D78]/25 flex items-center gap-2 text-[#E9DFE8] cursor-pointer transition-colors"
              >
                <span>✨</span>
                <span className="text-[11px] font-bold">My Dreams</span>
              </button>
            </div>
          </div>

        </aside>

      </div>
    </div>
  );
};
