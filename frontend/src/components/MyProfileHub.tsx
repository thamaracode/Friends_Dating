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
  Film
} from 'lucide-react';
import { CURRENT_USER } from '../mockData';
import { DigitalLifeHub } from './DigitalLifeHub';
import type { ExperienceTab } from '../types';

interface MyProfileHubProps {
  onNavigateSubsystem: (tab: ExperienceTab) => void;
}

export const MyProfileHub: React.FC<MyProfileHubProps> = ({
  onNavigateSubsystem
}) => {
  const [profile] = useState(CURRENT_USER);
  const [isIncognito, setIsIncognito] = useState(false);

  return (
    <div className="w-full max-w-md mx-auto min-h-[calc(100dvh-5.5rem)] flex flex-col space-y-4 px-3 pt-2 pb-24">
      {/* Top Profile Card Header */}
      <div className="relative rounded-3xl overflow-hidden glass-panel-elevated border border-[#FF78A8]/30 shadow-2xl p-5 space-y-4 pink-ambient-glow">
        <div className="flex items-center gap-4">
          <div className="relative">
            <img 
              src={profile.avatar} 
              alt={profile.name} 
              className="w-20 h-20 rounded-2xl object-cover border-2 border-[#FF4F87] shadow-lg"
            />
            <button 
              onClick={() => alert("Upload new portrait")}
              className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-full bg-[#FF4F87] text-white flex items-center justify-center shadow-md cursor-pointer hover:scale-105 transition-transform"
              title="Change Photo"
            >
              <Camera className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <h2 className="text-lg font-black text-[#FFF1F3] truncate">{profile.name}</h2>
              <span className="text-base text-[#FFB4CE] font-bold">{profile.age}</span>
            </div>
            <p className="text-xs text-[#B9A8B3] mt-0.5">@{profile.username} • {profile.location}</p>

            {/* Profile Strength Bar */}
            <div className="mt-2 space-y-1">
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-[#FFB4CE] font-bold">Profile Strength</span>
                <span className="text-emerald-400 font-bold">88% (Complete)</span>
              </div>
              <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#FF4F87] to-[#FF78A8] rounded-full w-[88%]" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Mode Pill Actions */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#FF78A8]/15">
          <button
            onClick={() => onNavigateSubsystem('my_world')}
            className="py-2.5 px-3 rounded-2xl glass-panel text-xs font-bold text-[#FFF1F3] hover:text-[#FF4F87] flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
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
      <div className="rounded-3xl glass-panel-elevated p-3 border border-[#FF78A8]/25 shadow-xl">
        <DigitalLifeHub userId={profile.id} isOwner={true} />
      </div>

      {/* Personality & Entertainment Systems */}
      <div className="space-y-2">
        <span className="text-[10px] uppercase font-bold text-[#FFB4CE] tracking-wider px-1">Personality & Lucky Universe</span>

        <div className="rounded-3xl glass-panel-elevated divide-y divide-[#FF78A8]/10 overflow-hidden border border-[#FF78A8]/20">
          {/* My Character / Cinematic Universe */}
          <div 
            onClick={() => onNavigateSubsystem('character_builder')}
            className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-[#FF4F87] to-[#FF78A8] flex items-center justify-center text-white shadow-md">
                <Film className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#FFF1F3] group-hover:text-[#FFB4CE] transition-colors">My Character Universe</h4>
                <p className="text-[10px] text-[#B9A8B3]">Cinematic questions, villain story, & quotes</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#7A6975] group-hover:translate-x-0.5 transition-transform" />
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
                <h4 className="text-xs font-bold text-[#FFF1F3] group-hover:text-[#FFB4CE] transition-colors">Lucky Universe & Dice</h4>
                <p className="text-[10px] text-[#B9A8B3]">Roll daily 3D dice, unlock themed cubes & wallet</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#7A6975] group-hover:translate-x-0.5 transition-transform" />
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
                <h4 className="text-xs font-bold text-[#FFF1F3] group-hover:text-[#FFB4CE] transition-colors">Truth or Dare & Mini-Games</h4>
                <p className="text-[10px] text-[#B9A8B3]">Turn-based multiplayer dilemmas & challenges</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#7A6975] group-hover:translate-x-0.5 transition-transform" />
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
                <h4 className="text-xs font-bold text-[#FFF1F3] group-hover:text-[#FFB4CE] transition-colors">Blind Chemistry Discovery</h4>
                <p className="text-[10px] text-[#B9A8B3]">Anonymous-first matching with progressive reveal</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#7A6975] group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
      </div>

      {/* Identity & Subsystems Hub */}
      <div className="space-y-2">
        <span className="text-[10px] uppercase font-bold text-[#FFB4CE] tracking-wider px-1">Identity & Subsystems</span>

        <div className="rounded-3xl glass-panel-elevated divide-y divide-[#FF78A8]/10 overflow-hidden border border-[#FF78A8]/20">
          {/* Social Growth 30-Day Ladder */}
          <div 
            onClick={() => onNavigateSubsystem('social_growth')}
            className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-[#FF4F87]/20 flex items-center justify-center text-[#FF4F87]">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#FFF1F3] group-hover:text-[#FFB4CE] transition-colors">Social Growth Ladder</h4>
                <p className="text-[10px] text-[#B9A8B3]">Day 3 of 30 • Overcome conversation hesitation</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#7A6975] group-hover:translate-x-0.5 transition-transform" />
          </div>

          {/* Viral Share Engine & Story Cards */}
          <div 
            onClick={() => onNavigateSubsystem('share_engine')}
            className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-[#FF4F87]/20 flex items-center justify-center text-[#FF4F87]">
                <Heart className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#FFF1F3] group-hover:text-[#FFB4CE] transition-colors">Instagram Story Card Engine</h4>
                <p className="text-[10px] text-[#B9A8B3]">Aesthetic 9:16 cards & friendship manifestos</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#7A6975] group-hover:translate-x-0.5 transition-transform" />
          </div>

          {/* Events & Gatherings */}
          <div 
            onClick={() => onNavigateSubsystem('events')}
            className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-[#FF4F87]/20 flex items-center justify-center text-[#FF4F87]">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#FFF1F3] group-hover:text-[#FFB4CE] transition-colors">Events & Watch Parties</h4>
                <p className="text-[10px] text-[#B9A8B3]">Rooftops, movie rooms, and safe meetups</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#7A6975] group-hover:translate-x-0.5 transition-transform" />
          </div>

          {/* Privacy & Data Governance Centre */}
          <div 
            onClick={() => onNavigateSubsystem('privacy_centre')}
            className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-[#FF4F87]/20 flex items-center justify-center text-[#FF4F87]">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#FFF1F3] group-hover:text-[#FFB4CE] transition-colors">Privacy & Data Governance</h4>
                <p className="text-[10px] text-[#B9A8B3]">DSAR export, provenance, and consent rules</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#7A6975] group-hover:translate-x-0.5 transition-transform" />
          </div>

          {/* Universal Accounts Directory */}
          <div 
            onClick={() => onNavigateSubsystem('universal_id')}
            className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-[#FF4F87]/20 flex items-center justify-center text-[#FF4F87]">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#FFF1F3] group-hover:text-[#FFB4CE] transition-colors">Universal Connected Accounts</h4>
                <p className="text-[10px] text-[#B9A8B3]">Google, Spotify, LinkedIn, and 50+ services</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#7A6975] group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
      </div>

      {/* Incognito & Safety Controls */}
      <div className="p-4 rounded-3xl glass-panel space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-xs font-bold text-[#FFF1F3]">Incognito Browsing Mode</h4>
            <p className="text-[10px] text-[#B9A8B3]">Only profiles you like will ever see you</p>
          </div>
          <button
            onClick={() => setIsIncognito(!isIncognito)}
            className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
              isIncognito ? 'bg-[#FF4F87]' : 'bg-black/40 border border-white/20'
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
    </div>
  );
};
