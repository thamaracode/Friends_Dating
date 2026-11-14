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
  Check,
  CheckCircle2
} from 'lucide-react';
import { CURRENT_USER } from '../mockData';
import { profileWorldsClient } from '../services/profileWorldsApiClient';
import { SoulverseBrandLogo, HeartLogoVariant } from './brand/SoulverseHeartLogos';
import type { MainNavTab, ExperienceTab } from '../types';
import type { ProfileWorld } from '../types/profileWorlds';

interface DesktopSoulverseViewProps {
  currentTab: MainNavTab;
  onSelectTab: (tab: MainNavTab) => void;
  onNavigateSubsystem: (tab: ExperienceTab) => void;
  onOpenWorld: (worldId: string) => void;
  onOpenReadme: () => void;
  isEmbeddedInShell?: boolean;
  brandLogoVariant?: HeartLogoVariant;
  onOpenLogoModal?: () => void;
}

export const DesktopSoulverseView: React.FC<DesktopSoulverseViewProps> = ({
  currentTab,
  onSelectTab,
  onNavigateSubsystem,
  onOpenWorld,
  onOpenReadme,
  isEmbeddedInShell = true,
  brandLogoVariant = (localStorage.getItem('soulverse_brand_logo') as HeartLogoVariant) || 'infinity',
  onOpenLogoModal
}) => {
  const [profile] = useState(CURRENT_USER);
  const [worlds, setWorlds] = useState<ProfileWorld[]>([]);
  const [activeTab, setActiveTab] = useState<'worlds' | 'about' | 'timeline' | 'collections' | 'connections'>('worlds');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedShare, setCopiedShare] = useState(false);

  const handleShareProfile = () => {
    navigator.clipboard.writeText(`${window.location.origin}/@${(profile as any).handle || profile.username || 'kavindu'}`);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2000);
  };

  // Default iconic showcase worlds matching Luna's profile screenshot
  const defaultShowcaseWorlds: Array<{
    id: string;
    name: string;
    subtitle: string;
    visibility: 'public' | 'friends' | 'private';
    coverUrl: string;
    icon: string;
  }> = [
    {
      id: 'wld_real',
      name: 'My Real Life',
      subtitle: 'Who I actually am',
      visibility: 'public',
      coverUrl: 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=600&q=80',
      icon: '🖥️'
    },
    {
      id: 'wld_imaginary',
      name: 'My Imaginary Life',
      subtitle: 'A world of imagination',
      visibility: 'friends',
      coverUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
      icon: '🏰'
    },
    {
      id: 'wld_cinematic',
      name: 'My Cinematic Life',
      subtitle: 'My personal movie',
      visibility: 'public',
      coverUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80',
      icon: '🎬'
    },
    {
      id: 'wld_inner',
      name: 'My Inner World',
      subtitle: 'Thoughts & emotions',
      visibility: 'private',
      coverUrl: 'https://images.unsplash.com/photo-1507499739999-097706ad8914?auto=format&fit=crop&w=600&q=80',
      icon: '🧠'
    }
  ];

  useEffect(() => {
    profileWorldsClient.getWorlds('usr_me', 'usr_me').then(fetched => {
      if (fetched && fetched.length > 0) {
        setWorlds(fetched);
      }
    }).catch(console.error);
  }, []);

  const displayWorlds = worlds.length >= 4 
    ? worlds.slice(0, 4).map((w, idx) => ({
        id: w.id,
        name: w.name,
        subtitle: w.description || defaultShowcaseWorlds[idx % defaultShowcaseWorlds.length].subtitle,
        visibility: (w.visibility === 'public' ? 'public' : w.visibility === 'matches' ? 'friends' : 'private') as 'public' | 'friends' | 'private',
        coverUrl: w.cover_image_url || defaultShowcaseWorlds[idx % defaultShowcaseWorlds.length].coverUrl,
        icon: defaultShowcaseWorlds[idx % defaultShowcaseWorlds.length].icon
      }))
    : defaultShowcaseWorlds;

  const profileContent = (
    <div className="w-full flex flex-col xl:flex-row gap-6">
      
      {/* =================================================================== */}
      {/* CENTER PROFILE & WORLDS CANVAS (Dark Glass Architecture)           */}
      {/* =================================================================== */}
      <div className="flex-1 min-w-0 flex flex-col space-y-5">
        
        {/* 1. HERO PROFILE BANNER CARD: Castle Under Glowing Silver Moon & Frosted Glass */}
        <div className="rounded-3xl overflow-hidden dark-glass border border-white/[0.08] shadow-[0_16px_40px_rgba(0,0,0,0.6)] relative group">
          
          {/* Gothic Castle & Luminous Silver Moon Atmosphere */}
          <div className="relative w-full h-60 sm:h-72 overflow-hidden bg-[#090A0E]">
            <img
              src="https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1600&q=80"
              alt="Gothic Castle Sanctuary"
              className="w-full h-full object-cover filter contrast-125 brightness-80 saturate-75 transition-transform duration-700 group-hover:scale-102"
            />

            {/* Radiant Glowing Silver Moon in the Sky */}
            <div className="absolute top-5 left-1/2 -translate-x-12 w-28 h-28 sm:w-32 sm:h-32 rounded-full pointer-events-none z-10">
              <div className="w-full h-full rounded-full bg-gradient-to-tr from-zinc-300 via-white to-zinc-100 shadow-[0_0_50px_rgba(255,255,255,0.45),0_0_90px_rgba(255,255,255,0.25)] opacity-95 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,_rgba(0,0,0,0.18)_0%,_transparent_60%)]" />
                <div className="absolute bottom-2 right-4 w-10 h-10 rounded-full bg-black/15 blur-[3px]" />
                <div className="absolute top-4 left-6 w-8 h-8 rounded-full bg-black/15 blur-[4px]" />
              </div>
            </div>

            {/* Volumetric Dark Obsidian & Silver Ambient Mist Layers */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#090A0E] via-[#090A0E]/60 to-transparent pointer-events-none" />
            <div 
              className="absolute inset-0 opacity-30 mix-blend-screen pointer-events-none"
              style={{
                background: 'radial-gradient(ellipse at 50% 80%, rgba(255, 255, 255, 0.15) 0%, rgba(180, 190, 210, 0.05) 50%, transparent 80%)'
              }}
            />
          </div>

          {/* Profile Identity Details Bar */}
          <div className="px-6 pb-5 pt-0 relative -mt-16 sm:-mt-20 flex flex-wrap items-end justify-between gap-4 z-20">
            <div className="flex items-end gap-5">
              
              {/* Avatar in Luminous Platinum / Silver Ring */}
              <div className="relative group/avatar">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full p-1 bg-gradient-to-tr from-white/70 via-zinc-400 to-white/20 shadow-[0_0_25px_rgba(255,255,255,0.2)] ring-1 ring-white/30 transition-transform duration-300 group-hover/avatar:scale-105">
                  <img 
                    src="https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=600&q=80" 
                    alt="Luna Avatar" 
                    className="w-full h-full rounded-full object-cover bg-black"
                  />
                </div>
                {/* Online indicator dot */}
                <span className="absolute bottom-1.5 right-1.5 w-4 h-4 rounded-full bg-emerald-400 border-2 border-[#090A0E] shadow-[0_0_8px_#34D399]" />
              </div>

              {/* Name, Verified Badge, Tagline & World Counts */}
              <div className="space-y-1 pb-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-1.5 font-serif tracking-tight">
                    <span>Luna</span>
                    <span className="text-zinc-400 text-sm">✧</span>
                  </h1>
                  <span className="w-4 h-4 rounded-full bg-white/10 text-white border border-white/20 flex items-center justify-center text-[10px] shadow-sm">
                    ✓
                  </span>
                </div>
                <div className="text-xs text-zinc-400">@lunaverse</div>
                <p className="text-xs text-zinc-300 italic font-medium pt-0.5">
                  "Just a dreamer in a chaotic world. ✧"
                </p>
                <div className="flex items-center gap-4 text-xs text-zinc-200 pt-1">
                  <span><strong className="text-white">12</strong> <span className="text-zinc-400">Worlds</span></span>
                  <span><strong className="text-white">8.4K</strong> <span className="text-zinc-400">Followers</span></span>
                  <span><strong className="text-white">421</strong> <span className="text-zinc-400">Following</span></span>
                </div>
              </div>
            </div>

            {/* Profile Action Buttons */}
            <div className="flex items-center gap-2 pb-1">
              <button
                onClick={onOpenReadme}
                className="px-4 py-2 rounded-2xl dark-glass hover:bg-white/15 text-white border border-white/20 text-xs font-bold flex items-center gap-1.5 shadow-[0_0_16px_rgba(255,255,255,0.06)] transition-all cursor-pointer hover:border-white/40"
              >
                <Edit3 className="w-3.5 h-3.5 text-zinc-300" />
                <span>Edit Profile</span>
              </button>
              <button
                onClick={handleShareProfile}
                className="px-3 py-2 rounded-2xl dark-glass border border-white/[0.08] text-zinc-300 hover:text-white hover:border-white/20 transition-all cursor-pointer text-xs font-semibold flex items-center gap-1.5"
                title="Share profile link"
              >
                <Share2 className="w-3.5 h-3.5 text-amber-400" />
                <span>{copiedShare ? 'Copied!' : 'Share'}</span>
              </button>
            </div>
          </div>

          {/* Profile Navigation Tabs (Frosted Dark Glass Bar) */}
          <div className="px-6 border-t border-white/[0.08] flex items-center gap-2 py-2 overflow-x-auto no-scrollbar text-xs bg-black/20">
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
                    ? 'bg-white/15 text-white border border-white/25 shadow-sm'
                    : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                {tab.label}
              </button>
            ))}
            <span className="text-xs text-zinc-400 px-2 cursor-pointer hover:text-white">More ⌄</span>
          </div>
        </div>

        {/* 2. WORLDS HORIZONTAL CARDS GRID (Real Life, Imaginary Life, Cinematic Life, Inner World) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-3.5">
          {displayWorlds.map(w => (
            <div
              key={w.id}
              onClick={() => onOpenWorld(w.id)}
              className="group relative rounded-3xl overflow-hidden dark-glass border border-white/[0.08] hover:border-white/25 transition-all cursor-pointer shadow-lg hover:shadow-[0_8px_30px_rgba(0,0,0,0.5)] flex flex-col justify-between"
            >
              {/* World Cover Art Preview */}
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#090A0E]">
                <img
                  src={w.coverUrl}
                  alt={w.name}
                  className="w-full h-full object-cover group-hover:scale-106 transition-transform duration-500 opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#090A0E] via-transparent to-black/30" />
                <div className="absolute top-2.5 right-2.5 p-1 rounded-full bg-black/60 backdrop-blur-md text-zinc-400 border border-white/10">
                  <Eye className="w-3 h-3" />
                </div>
              </div>

              {/* World Title & Audience Pill */}
              <div className="p-3.5 space-y-1">
                <h3 className="text-xs font-bold text-white group-hover:text-zinc-200 transition-colors truncate">
                  {w.name}
                </h3>
                <p className="text-[10px] text-zinc-400 line-clamp-1">{w.subtitle}</p>
                
                <div className="flex items-center justify-between pt-2 border-t border-white/[0.06] text-[10px]">
                  <span className="flex items-center gap-1 text-zinc-400">
                    {w.visibility === 'public' ? '🌐 Public' : w.visibility === 'friends' ? '👥 Friends' : '🔒 Private'}
                  </span>
                  <ChevronRight className="w-3 h-3 text-zinc-400 group-hover:translate-x-0.5 group-hover:text-white transition-all" />
                </div>
              </div>
            </div>
          ))}

          {/* "+ Create New World" Dashed Card */}
          <div
            onClick={() => onNavigateSubsystem('profile_worlds')}
            className="rounded-3xl border border-dashed border-white/15 hover:border-white/30 bg-white/[0.02] hover:bg-white/[0.05] flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-all group min-h-[160px] shadow-sm hover:shadow-[0_0_24px_rgba(255,255,255,0.06)]"
          >
            <div className="w-10 h-10 rounded-2xl dark-glass border border-white/10 flex items-center justify-center text-zinc-300 group-hover:text-white group-hover:scale-110 transition-all mb-2 shadow-sm">
              <Plus className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-white group-hover:text-zinc-200 transition-colors">Create New World</span>
            <span className="text-[10px] text-zinc-400">Add a new dimension</span>
          </div>
        </div>

        {/* 3. RECENT ACTIVITY & LIFE TIMELINE (Dual Frosted Dark Glass Modules) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          
          {/* Recent Activity Card */}
          <div className="rounded-3xl p-5 dark-glass border border-white/[0.08] space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-white tracking-wide">Recent Activity</h3>
              <button 
                onClick={() => onNavigateSubsystem('profile_worlds')}
                className="text-[10px] text-zinc-400 hover:text-white cursor-pointer font-medium transition-colors"
              >
                See all ›
              </button>
            </div>

            <div className="space-y-2.5">
              {[
                { icon: '🏔️', text: 'Added a new memory to My Real Life', time: '2 hours ago' },
                { icon: '🧠', text: 'Updated My Inner World', time: '3 hours ago' },
                { icon: '✨', text: 'Liked a post from @stella', time: '4 hours ago' },
                { icon: '🎬', text: 'Added a photo to My Cinematic Life', time: '5 hours ago' }
              ].map((act, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-2xl hover:bg-white/[0.03] transition-colors group">
                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-sm p-1.5 rounded-xl dark-glass border border-white/[0.06] group-hover:border-white/20 transition-colors">
                      {act.icon}
                    </span>
                    <span className="text-zinc-200 font-medium text-[11px] group-hover:text-white transition-colors">
                      {act.text}
                    </span>
                  </div>
                  <span className="text-[10px] text-zinc-400 shrink-0">{act.time}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Life Timeline Card (With Sleek Celestial Constellation Illustration) */}
          <div className="rounded-3xl p-5 dark-glass border border-white/[0.08] space-y-4 shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between relative z-10">
              <h3 className="text-xs font-bold text-white tracking-wide">Life Timeline</h3>
              <button 
                onClick={() => onNavigateSubsystem('living_profile')}
                className="text-[10px] text-zinc-400 hover:text-white cursor-pointer font-medium transition-colors"
              >
                See all ›
              </button>
            </div>

            {/* Vertical Milestone Axis */}
            <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-px before:bg-white/10 relative z-10">
              {[
                { year: '2026', text: 'Focus on happiness and growth. ✧' },
                { year: '2024', text: 'A new chapter begins...' },
                { year: '2021', text: 'Learning, healing, and becoming.' },
                { year: '2019', text: 'Big dreams, boundless curiosity. ✧' }
              ].map((node, i) => (
                <div key={i} className="relative group">
                  <span className="absolute -left-6 top-1 w-2 h-2 rounded-full bg-white ring-4 ring-[#090A0E] shadow-[0_0_8px_rgba(255,255,255,0.8)] group-hover:scale-125 transition-transform" />
                  <div>
                    <span className="text-[10px] font-mono font-bold text-zinc-300">{node.year}</span>
                    <p className="text-xs text-zinc-200 mt-0.5">{node.text}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Elegant Celestial Constellation Branch Artwork in the Corner */}
            <div className="absolute right-1 bottom-1 w-44 h-44 opacity-20 pointer-events-none select-none flex items-end justify-end">
              <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                {/* Constellation Lines */}
                <path d="M95 90 C80 80, 65 65, 55 45 C50 35, 45 20, 40 10" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" opacity="0.4"/>
                <path d="M65 65 C60 55, 62 48, 70 42" stroke="#FFFFFF" strokeWidth="1" strokeLinecap="round" opacity="0.3"/>
                <path d="M55 45 C48 42, 42 45, 35 48" stroke="#FFFFFF" strokeWidth="1" strokeLinecap="round" opacity="0.3"/>
                
                {/* Silver Star Orbs */}
                <circle cx="70" cy="42" r="4" fill="#FFFFFF" fillOpacity="0.8" filter="blur(0.5px)" />
                <circle cx="68" cy="38" r="2" fill="#FFFFFF" fillOpacity="0.9" />
                
                <circle cx="40" cy="12" r="5" fill="#FFFFFF" fillOpacity="0.85" />
                <circle cx="38" cy="9" r="2.5" fill="#FFFFFF" fillOpacity="0.95" />
                
                <circle cx="35" cy="48" r="4.5" fill="#FFFFFF" fillOpacity="0.8" />
                <circle cx="33" cy="46" r="2" fill="#FFFFFF" fillOpacity="0.9" />
                
                <circle cx="56" cy="36" r="3.5" fill="#FFFFFF" fillOpacity="0.8" />
                <circle cx="80" cy="60" r="4" fill="#FFFFFF" fillOpacity="0.75" />
              </svg>
            </div>
          </div>

        </div>
      </div>

      {/* =================================================================== */}
      {/* RIGHT PROFILE INFO SIDEBAR (Dark Glass Panels)                      */}
      {/* =================================================================== */}
      <aside className="w-full xl:w-72 shrink-0 flex flex-col space-y-4">
        
        {/* 1. About Me Card */}
        <div className="p-4 rounded-3xl dark-glass border border-white/[0.08] space-y-3 shadow-lg">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-white tracking-wide">About Me</h3>
            <Edit3 className="w-3.5 h-3.5 text-zinc-400 cursor-pointer hover:text-white transition-colors" />
          </div>

          <p className="text-xs text-zinc-400 leading-relaxed">
            A curious soul, forever exploring life, emotions and endless possibilities.
          </p>

          <div className="space-y-1.5 text-xs text-zinc-300 pt-1">
            <div className="flex items-center gap-2"><span>👤</span><span className="text-zinc-400">She/Her</span></div>
            <div className="flex items-center gap-2"><span>🎂</span><span className="text-zinc-400">19 years old</span></div>
            <div className="flex items-center gap-2"><span>✨</span><span className="text-zinc-400">Dreamer · Creator · Overthinker</span></div>
            <div className="flex items-center gap-2"><span>🎵</span><span className="text-zinc-400">Anime, Games, Music</span></div>
            <div className="flex items-center gap-2 text-zinc-200"><span>📍</span><span>Somewhere in the stars ✧</span></div>
          </div>
        </div>

        {/* 2. My Stats Card */}
        <div className="p-4 rounded-3xl dark-glass border border-white/[0.08] space-y-2.5 shadow-lg">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-white tracking-wide">My Stats</h3>
            <TrendingUp className="w-3.5 h-3.5 text-zinc-300" />
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-zinc-400 flex items-center gap-1.5"><span>👁️</span> Profile Views</span>
              <span className="font-bold text-white">24.8K <span className="text-[10px] text-emerald-400 font-normal">↑12%</span></span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-zinc-400 flex items-center gap-1.5"><span>✨</span> Likes</span>
              <span className="font-bold text-white">4.2K <span className="text-[10px] text-emerald-400 font-normal">↑8%</span></span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-zinc-400 flex items-center gap-1.5"><span>🖤</span> Matches</span>
              <span className="font-bold text-white">892 <span className="text-[10px] text-emerald-400 font-normal">↑6%</span></span>
            </div>
          </div>
        </div>

        {/* 3. My Interests Pills (Dark Glass Pills with Hairline Borders) */}
        <div className="p-4 rounded-3xl dark-glass border border-white/[0.08] space-y-2.5 shadow-lg">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-white tracking-wide">My Interests</h3>
            <span className="text-[10px] text-zinc-400 hover:text-white cursor-pointer transition-colors">Edit</span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {['Anime', 'Gaming', 'Music', 'Art', 'Psychology', 'Space', 'Books', 'Fantasy', 'Technology'].map(tag => (
              <span
                key={tag}
                className="px-2.5 py-1 rounded-full text-[11px] font-medium dark-glass-pill text-zinc-300 hover:border-white/25 transition-colors"
              >
                {tag}
              </span>
            ))}
            <span className="px-2 py-1 rounded-full text-[11px] font-medium text-zinc-400 hover:text-white cursor-pointer transition-colors">
              More +
            </span>
          </div>
        </div>

        {/* 5. Quick Access 2x2 Grid */}
        <div className="p-4 rounded-3xl dark-glass border border-white/[0.08] space-y-2 shadow-lg">
          <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider block">Quick Access</span>
          
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={onOpenReadme}
              className="p-2.5 rounded-2xl dark-glass hover:bg-white/[0.06] border border-white/[0.08] hover:border-white/20 flex items-center gap-2 text-zinc-200 hover:text-white cursor-pointer transition-colors"
            >
              <span>📝</span>
              <span className="text-[11px] font-bold">My Journal</span>
            </button>
            <button
              onClick={() => onNavigateSubsystem('living_profile')}
              className="p-2.5 rounded-2xl dark-glass hover:bg-white/[0.06] border border-white/[0.08] hover:border-white/20 flex items-center gap-2 text-zinc-200 hover:text-white cursor-pointer transition-colors"
            >
              <span>💬</span>
              <span className="text-[11px] font-bold">My Questions</span>
            </button>
            <button
              onClick={() => onNavigateSubsystem('living_profile')}
              className="p-2.5 rounded-2xl dark-glass hover:bg-white/[0.06] border border-white/[0.08] hover:border-white/20 flex items-center gap-2 text-zinc-200 hover:text-white cursor-pointer transition-colors"
            >
              <span>🕰️</span>
              <span className="text-[11px] font-bold">My Memories</span>
            </button>
            <button
              onClick={() => onNavigateSubsystem('profile_worlds')}
              className="p-2.5 rounded-2xl dark-glass hover:bg-white/[0.06] border border-white/[0.08] hover:border-white/20 flex items-center gap-2 text-zinc-200 hover:text-white cursor-pointer transition-colors"
            >
              <span>✨</span>
              <span className="text-[11px] font-bold">My Dreams</span>
            </button>
          </div>
        </div>

      </aside>

    </div>
  );

  if (isEmbeddedInShell) {
    return profileContent;
  }

  return (
    <div className="w-full min-h-screen bg-[#090A0E] text-zinc-100 flex flex-col font-sans selection:bg-white/20 selection:text-white">
      {/* 1. TOP HEADER BAR */}
      <header className="h-16 border-b border-white/[0.08] px-6 flex items-center justify-between sticky top-0 z-40 dark-glass">
        <div 
          onClick={() => onOpenLogoModal ? onOpenLogoModal() : onSelectTab('profile')}
          className="flex items-center gap-2.5 cursor-pointer group w-64 shrink-0"
          title="Customize Heart Brand Logo"
        >
          <div className="w-8 h-8 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white shadow-[0_0_12px_rgba(255,255,255,0.1)] group-hover:border-amber-400/50 group-hover:scale-105 transition-all">
            <SoulverseBrandLogo variant={brandLogoVariant} size={20} showGlow={true} />
          </div>
          <span className="font-extrabold text-sm tracking-widest text-white font-sans">
            Soulverse <span className="text-amber-400">✧</span>
          </span>
        </div>

        <div className="flex-1 max-w-xl mx-8 relative">
          <Search className="w-4 h-4 text-zinc-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search anything..."
            className="w-full pl-11 pr-4 py-2 rounded-full dark-glass border border-white/[0.08] text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white/30 transition-colors"
          />
        </div>

        <div className="flex items-center gap-3 w-64 justify-end shrink-0">
          <button 
            onClick={() => onNavigateSubsystem('self_discovery')}
            className="p-2 rounded-full hover:bg-white/[0.06] text-zinc-400 hover:text-white transition-colors"
          >
            <Sparkles className="w-4 h-4" />
          </button>
          <button 
            onClick={() => onSelectTab('messages')}
            className="p-2 rounded-full hover:bg-white/[0.06] text-zinc-400 hover:text-white relative transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
          </button>
          <div 
            onClick={() => onSelectTab('profile')}
            className="w-8 h-8 rounded-full overflow-hidden border border-white/20 cursor-pointer hover:border-white/60 transition-all ml-1 shadow-sm"
          >
            <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" />
          </div>
        </div>
      </header>

      {/* 2. MAIN THREE-COLUMN DESKTOP CONTAINER */}
      <div className="flex-1 flex max-w-[1720px] w-full mx-auto px-4 py-5 gap-6">
        {/* Standalone Sidebar */}
        <aside className="w-60 shrink-0 flex flex-col space-y-5 sticky top-24 h-[calc(100vh-7rem)] overflow-y-auto no-scrollbar dark-glass p-3 rounded-3xl border border-white/[0.08]">
          <nav className="space-y-1">
            {[
              { id: 'home', label: 'Home', icon: Home },
              { id: 'discover', label: 'Discover', icon: Compass },
              { id: 'messages', label: 'Messages', icon: MessageCircle, badge: '12' },
              { id: 'profile', label: 'Profile', icon: User }
            ].map(item => {
              const Icon = item.icon;
              const isActive = (item.id === currentTab);
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id as MainNavTab)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-medium cursor-pointer transition-all ${
                    isActive ? 'bg-white/10 text-white font-bold border border-white/20 shadow-[0_0_14px_rgba(255,255,255,0.06)]' : 'text-zinc-400 hover:bg-white/[0.04] hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Content */}
        {profileContent}
      </div>
    </div>
  );
};
