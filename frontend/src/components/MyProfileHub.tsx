import React, { useState } from 'react';
import { 
  Camera, 
  ShieldCheck, 
  Settings, 
  Edit3, 
  Sparkles, 
  Heart, 
  Lock, 
  Eye, 
  ChevronRight,
  Sliders,
  Calendar,
  Layers,
  Dices,
  Film,
  Globe2,
  FileText,
  BookOpen,
  History
} from 'lucide-react';
import { CURRENT_USER } from '../mockData';
import { DigitalLifeHub } from './DigitalLifeHub';
import { GitHubMarkdownEditor } from './GitHubMarkdownEditor';
import type { ExperienceTab } from '../types';

interface MyProfileHubProps {
  onNavigateSubsystem: (tab: ExperienceTab) => void;
}

export const MyProfileHub: React.FC<MyProfileHubProps> = ({
  onNavigateSubsystem
}) => {
  const [profile] = useState(CURRENT_USER);
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [isIncognito, setIsIncognito] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setAvatarUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };
  const [isReadmeModalOpen, setIsReadmeModalOpen] = useState(false);

  return (
    <div className="w-full max-w-md mx-auto min-h-[calc(100dvh-5.5rem)] flex flex-col space-y-4 px-3 pt-2 pb-24">
      {/* Top Profile Card Header */}
      <div className="relative rounded-3xl overflow-hidden glass-panel-elevated border border-[rgba(255,255,255,0.20)]/30 shadow-2xl p-5 space-y-4 glass-panel">
        <div className="flex items-center gap-4">
          <div className="relative">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <img 
              src={avatarUrl} 
              alt={profile.name} 
              className="w-20 h-20 rounded-2xl object-cover border-2 border-[#FFFFFF] shadow-lg"
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-full bg-[#FFFFFF] text-black flex items-center justify-center shadow-md cursor-pointer hover:scale-105 transition-transform"
              title="Upload New Photo"
            >
              <Camera className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <h2 className="text-lg font-black text-[#F3F4F6] truncate">{profile.name}</h2>
              <span className="text-base text-[#E5E7EB] font-bold">{profile.age}</span>
            </div>
            <p className="text-xs text-[#9CA3AF] mt-0.5">@{profile.username} • {profile.location}</p>

            {/* Profile Strength Bar */}
            <div className="mt-2 space-y-1">
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-[#E5E7EB] font-bold">Profile Strength</span>
                <span className="text-emerald-400 font-bold">88% (Complete)</span>
              </div>
              <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#FFFFFF] to-[rgba(255,255,255,0.20)] rounded-full w-[88%]" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Mode Pill Actions */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[rgba(255,255,255,0.20)]/15">
          <button
            onClick={() => onNavigateSubsystem('my_world')}
            className="py-2.5 px-3 rounded-2xl glass-panel text-xs font-bold text-[#F3F4F6] hover:text-[#FFFFFF] flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit 8-Chapters</span>
          </button>

          <button
            onClick={() => onNavigateSubsystem('friends_real')}
            className="py-2.5 px-3 rounded-2xl glass-panel text-xs font-bold text-emerald-400 flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Real Verification</span>
          </button>
        </div>
      </div>

      {/* Digital Life: Social & Creator Profiles */}
      <div className="rounded-3xl glass-panel-elevated p-3 border border-[rgba(255,255,255,0.20)]/25 shadow-xl">
        <DigitalLifeHub userId={profile.id} isOwner={true} />
      </div>

      {/* MULTI-DIMENSIONAL IDENTITY & PROFILE WORLDS */}
      <div className="space-y-2">
        <span className="text-[10px] uppercase font-bold text-[#E5E7EB] tracking-wider px-1">Multi-Dimensional Identity</span>

        <div className="rounded-3xl glass-panel-elevated divide-y divide-[rgba(255,255,255,0.20)]/10 overflow-hidden border border-[rgba(255,255,255,0.20)]/20">
          {/* Profile Worlds Hub */}
          <div 
            onClick={() => onNavigateSubsystem('profile_worlds')}
            className="p-4 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors group bg-gradient-to-r from-[#FFFFFF]/15 via-transparent to-transparent"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#FFFFFF] to-[#E5E7EB] flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform">
                <Globe2 className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-black text-[#F3F4F6] group-hover:text-[#E5E7EB] transition-colors">
                    Profile Worlds
                  </h4>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#FFFFFF]/20 text-[#F3F4F6] border border-[#FFFFFF]/40">
                    5 Dimensions
                  </span>
                </div>
                <p className="text-[10px] text-[#9CA3AF] mt-0.5">Real Life, Cinematic Noir, Inner World, 2030 Future & Fantasy</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#6B7280] group-hover:translate-x-0.5 transition-transform" />
          </div>

          {/* Personal README.md (GitHub Markdown • 5000 Chars) */}
          <div 
            onClick={() => setIsReadmeModalOpen(true)}
            className="p-4 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#26061D] to-[#12141B] border border-[#FFFFFF]/40 flex items-center justify-center text-[#FFFFFF] shadow-md group-hover:scale-105 transition-transform">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-[#F3F4F6] group-hover:text-[#E5E7EB] transition-colors">
                    Personal README.md
                  </h4>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    5,000 Chars Max
                  </span>
                </div>
                <p className="text-[10px] text-[#9CA3AF] mt-0.5">GitHub Markdown manifesto, checklists, tables & code</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#6B7280] group-hover:translate-x-0.5 transition-transform" />
          </div>

          {/* Living Identity Autobiography & Life Timeline */}
          <div 
            onClick={() => onNavigateSubsystem('living_profile')}
            className="p-4 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#FFFFFF]/20 flex items-center justify-center text-[#FFFFFF] shadow-md group-hover:scale-105 transition-transform">
                <History className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-[#F3F4F6] group-hover:text-[#E5E7EB] transition-colors">
                    Living Identity & Year Memoir
                  </h4>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    Chronological
                  </span>
                </div>
                <p className="text-[10px] text-[#9CA3AF] mt-0.5">Custom sections, Q&As, timeline eras & Then-vs-Now analysis</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#6B7280] group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
      </div>

      {/* Personality & Entertainment Systems */}
      <div className="space-y-2">
        <span className="text-[10px] uppercase font-bold text-[#E5E7EB] tracking-wider px-1">Personality & Lucky Universe</span>

        <div className="rounded-3xl glass-panel-elevated divide-y divide-[rgba(255,255,255,0.20)]/10 overflow-hidden border border-[rgba(255,255,255,0.20)]/20">
          {/* My Character / Cinematic Universe */}
          <div 
            onClick={() => onNavigateSubsystem('character_builder')}
            className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-[#FFFFFF] to-[rgba(255,255,255,0.20)] flex items-center justify-center text-white shadow-md">
                <Film className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#F3F4F6] group-hover:text-[#E5E7EB] transition-colors">My Character Universe</h4>
                <p className="text-[10px] text-[#9CA3AF]">Cinematic questions, villain story, & quotes</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#6B7280] group-hover:translate-x-0.5 transition-transform" />
          </div>

          {/* Lucky Universe & Coin Wallet */}
          <div 
            onClick={() => onNavigateSubsystem('lucky_universe')}
            className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-amber-400/20 flex items-center justify-center text-amber-300">
                <Dices className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#F3F4F6] group-hover:text-[#E5E7EB] transition-colors">Lucky Universe & Dice</h4>
                <p className="text-[10px] text-[#9CA3AF]">Roll daily 3D dice, unlock themed cubes & wallet</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#6B7280] group-hover:translate-x-0.5 transition-transform" />
          </div>

          {/* Mini-Games Engine */}
          <div 
            onClick={() => onNavigateSubsystem('mini_games')}
            className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-purple-500/20 flex items-center justify-center text-purple-400">
                <Sliders className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#F3F4F6] group-hover:text-[#E5E7EB] transition-colors">Truth or Dare & Mini-Games</h4>
                <p className="text-[10px] text-[#9CA3AF]">Turn-based multiplayer dilemmas & challenges</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#6B7280] group-hover:translate-x-0.5 transition-transform" />
          </div>

          {/* Blind Chemistry Anonymous Mode */}
          <div 
            onClick={() => onNavigateSubsystem('blind_chemistry')}
            className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-rose-500/20 flex items-center justify-center text-rose-400">
                <Eye className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#F3F4F6] group-hover:text-[#E5E7EB] transition-colors">Blind Chemistry Discovery</h4>
                <p className="text-[10px] text-[#9CA3AF]">Anonymous-first matching with progressive reveal</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#6B7280] group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
      </div>

      {/* Identity & Subsystems Hub */}
      <div className="space-y-2">
        <span className="text-[10px] uppercase font-bold text-[#E5E7EB] tracking-wider px-1">Identity & Subsystems</span>

        <div className="rounded-3xl glass-panel-elevated divide-y divide-[rgba(255,255,255,0.20)]/10 overflow-hidden border border-[rgba(255,255,255,0.20)]/20">
          {/* Social Growth 30-Day Ladder */}
          <div 
            onClick={() => onNavigateSubsystem('social_growth')}
            className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-[#FFFFFF]/20 flex items-center justify-center text-[#FFFFFF]">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#F3F4F6] group-hover:text-[#E5E7EB] transition-colors">Social Growth Ladder</h4>
                <p className="text-[10px] text-[#9CA3AF]">Day 3 of 30 • Overcome conversation hesitation</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#6B7280] group-hover:translate-x-0.5 transition-transform" />
          </div>

          {/* Viral Share Engine & Story Cards */}
          <div 
            onClick={() => onNavigateSubsystem('share_engine')}
            className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-[#FFFFFF]/20 flex items-center justify-center text-[#FFFFFF]">
                <Heart className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#F3F4F6] group-hover:text-[#E5E7EB] transition-colors">Instagram Story Card Engine</h4>
                <p className="text-[10px] text-[#9CA3AF]">Aesthetic 9:16 cards & friendship manifestos</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#6B7280] group-hover:translate-x-0.5 transition-transform" />
          </div>

          {/* Events & Gatherings */}
          <div 
            onClick={() => onNavigateSubsystem('events')}
            className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-[#FFFFFF]/20 flex items-center justify-center text-[#FFFFFF]">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#F3F4F6] group-hover:text-[#E5E7EB] transition-colors">Events & Watch Parties</h4>
                <p className="text-[10px] text-[#9CA3AF]">Rooftops, movie rooms, and safe meetups</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#6B7280] group-hover:translate-x-0.5 transition-transform" />
          </div>

          {/* Privacy & Data Governance Centre */}
          <div 
            onClick={() => onNavigateSubsystem('privacy_centre')}
            className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-[#FFFFFF]/20 flex items-center justify-center text-[#FFFFFF]">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#F3F4F6] group-hover:text-[#E5E7EB] transition-colors">Privacy & Data Governance</h4>
                <p className="text-[10px] text-[#9CA3AF]">DSAR export, provenance, and consent rules</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#6B7280] group-hover:translate-x-0.5 transition-transform" />
          </div>

          {/* Universal Accounts Directory */}
          <div 
            onClick={() => onNavigateSubsystem('universal_id')}
            className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-[#FFFFFF]/20 flex items-center justify-center text-[#FFFFFF]">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#F3F4F6] group-hover:text-[#E5E7EB] transition-colors">Universal Connected Accounts</h4>
                <p className="text-[10px] text-[#9CA3AF]">Google, Spotify, LinkedIn, and 50+ services</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#6B7280] group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
      </div>

      {/* Incognito & Safety Controls */}
      <div className="p-4 rounded-3xl glass-panel space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-xs font-bold text-[#F3F4F6]">Incognito Browsing Mode</h4>
            <p className="text-[10px] text-[#9CA3AF]">Only profiles you like will ever see you</p>
          </div>
          <button
            onClick={() => setIsIncognito(!isIncognito)}
            className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
              isIncognito ? 'bg-[#FFFFFF]' : 'bg-black/40 border border-white/20'
            }`}
          >
            <div 
              className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                isIncognito ? 'left-7' : 'left-1'
              }`} 
            />
          </button>
        </div>
      </div>

      {/* GitHub Markdown README.md Modal */}
      {isReadmeModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 animate-fadeIn">
          <div className="w-full max-w-2xl max-h-[92vh] overflow-hidden">
            <GitHubMarkdownEditor 
              userId={profile.id}
              isOwner={true}
              onClose={() => setIsReadmeModalOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};
