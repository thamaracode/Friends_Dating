import React, { useState } from 'react';
import { 
  Compass, 
  Video, 
  LayoutGrid, 
  Brain, 
  Search, 
  Filter, 
  Sparkles, 
  Heart, 
  MessageCircle, 
  Play, 
  Pause, 
  MapPin, 
  ShieldCheck, 
  Flame, 
  Volume2, 
  VolumeX, 
  SlidersHorizontal 
} from 'lucide-react';
import { MOCK_PROFILES } from '../mockData';
import type { DiscoveryMode, UserProfile } from '../types';

interface DiscoverExplorationViewProps {
  onOpenProfileDetail: (profile: UserProfile) => void;
  onInitiateChat: (profile: UserProfile) => void;
  onOpenBlindChemistry?: () => void;
}

export const DiscoverExplorationView: React.FC<DiscoverExplorationViewProps> = ({
  onOpenProfileDetail,
  onInitiateChat,
  onOpenBlindChemistry
}) => {
  const [activeMode, setActiveMode] = useState<DiscoveryMode>('social');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('All');
  const [activeVideoIdx, setActiveVideoIdx] = useState(0);
  const [isVideoMuted, setIsVideoMuted] = useState(true);

  const TAGS = ['All', 'Indie Games', 'Photography', 'Philosophy', 'Lo-Fi', 'Night Owls', 'Introverts'];

  const filteredProfiles = MOCK_PROFILES.filter(p => {
    if (selectedTag !== 'All' && !p.interests.includes(selectedTag) && p.energy !== selectedTag) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = p.name.toLowerCase().includes(q);
      const matchBio = p.tagline.toLowerCase().includes(q);
      const matchInterests = p.interests.some(i => i.toLowerCase().includes(q));
      if (!matchName && !matchBio && !matchInterests) return false;
    }
    return true;
  });

  return (
    <div className="w-full max-w-md mx-auto min-h-[calc(100dvh-5.5rem)] flex flex-col space-y-4 px-3 pt-2 pb-20">
      {/* Top Search Bar & Filters */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#9CA3AF] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search passions, vibes, interests..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl glass-panel text-xs text-[#F3F4F6] placeholder-[#6B7280] focus:outline-none focus:border-[#FFFFFF] transition-colors"
            />
          </div>

          <button 
            className="w-10 h-10 rounded-2xl glass-panel flex items-center justify-center text-[#9CA3AF] hover:text-[#FFFFFF] cursor-pointer"
            title="Advanced Filters"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>

        {/* Discovery Mode Switcher (TikTok Video, Instagram Social, Personality AI) */}
        <div className="flex items-center justify-between p-1 rounded-2xl glass-panel-elevated">
          <button
            onClick={() => setActiveMode('social')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
              activeMode === 'social' 
                ? 'bg-[#FFFFFF] text-[#F3F4F6] shadow-[0_0_12px_rgba(255,79,135,0.6)]' 
                : 'text-[#9CA3AF] hover:text-[#F3F4F6]'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Social</span>
          </button>

          <button
            onClick={() => setActiveMode('video')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
              activeMode === 'video' 
                ? 'bg-[#FFFFFF] text-[#F3F4F6] shadow-[0_0_12px_rgba(255,79,135,0.6)]' 
                : 'text-[#9CA3AF] hover:text-[#F3F4F6]'
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            <span>Shorts</span>
          </button>

          <button
            onClick={() => setActiveMode('personality')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
              activeMode === 'personality' 
                ? 'bg-[#FFFFFF] text-[#F3F4F6] shadow-[0_0_12px_rgba(255,79,135,0.6)]' 
                : 'text-[#9CA3AF] hover:text-[#F3F4F6]'
            }`}
          >
            <Brain className="w-3.5 h-3.5" />
            <span>Deep Fit</span>
          </button>

          {onOpenBlindChemistry && (
            <button
              onClick={onOpenBlindChemistry}
              className="px-2.5 py-2 rounded-xl text-xs font-bold text-[#E5E7EB] hover:text-[#F3F4F6] flex items-center gap-1 bg-purple-950/40 border border-purple-500/30 cursor-pointer"
              title="Blind Chemistry Anonymous Mode"
            >
              <span>Blind</span>
            </button>
          )}
        </div>

        {/* Horizontal Interest Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          {TAGS.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap cursor-pointer transition-all ${
                selectedTag === tag 
                  ? 'bg-[#FFFFFF]/20 border border-[#FFFFFF] text-[#E5E7EB]' 
                  : 'glass-panel text-[#9CA3AF] hover:text-[#F3F4F6]'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* MODE 1: SOCIAL EXPLORE (Instagram-Style Grid Feed) */}
      {activeMode === 'social' && (
        <div className="grid grid-cols-2 gap-3 pt-1">
          {filteredProfiles.map((profile) => (
            <div
              key={profile.id}
              onClick={() => onOpenProfileDetail(profile)}
              className="relative aspect-[3/4] rounded-3xl overflow-hidden glass-panel-elevated border border-[rgba(255,255,255,0.20)]/20 group cursor-pointer shadow-lg hover:border-[#FFFFFF]/60 transition-all"
            >
              <img 
                src={profile.avatar} 
                alt={profile.name} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#090A0E] via-[#090A0E]/20 to-transparent" />

              {/* Compatibility Badge on top */}
              {profile.compatibilityScore && (
                <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full glass-panel bg-black/60 border border-[rgba(255,255,255,0.20)]/40 text-[10px] font-bold text-[#E5E7EB] flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5 text-[#FFFFFF]" />
                  <span>{profile.compatibilityScore}%</span>
                </div>
              )}

              {/* Bottom Info Bar */}
              <div className="absolute bottom-2.5 inset-x-2.5 space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-black text-[#F3F4F6] truncate">{profile.name}</span>
                    <span className="text-xs text-[#E5E7EB] font-bold">{profile.age}</span>
                  </div>
                  {profile.verifications?.photoVerified && (
                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  )}
                </div>

                <p className="text-[10px] text-[#9CA3AF] line-clamp-1 italic">
                  "{profile.tagline}"
                </p>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[9px] px-2 py-0.5 rounded-full bg-black/50 text-[#E5E7EB]">
                    #{profile.interests[0] || 'Vibes'}
                  </span>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onInitiateChat(profile);
                    }}
                    className="w-7 h-7 rounded-full bg-[#FFFFFF] flex items-center justify-center text-[#F3F4F6] shadow-md hover:scale-110 active:scale-95 transition-transform"
                  >
                    <Heart className="w-3.5 h-3.5 fill-white" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODE 2: TIKTOK STYLE VIDEO PROFILES */}
      {activeMode === 'video' && (
        <div className="space-y-4">
          {filteredProfiles.slice(0, 3).map((profile, idx) => (
            <div
              key={profile.id}
              className="relative w-full aspect-[9/16] rounded-3xl overflow-hidden glass-panel-elevated border border-[rgba(255,255,255,0.20)]/30 shadow-2xl bg-black"
            >
              {/* Profile Background Video Mock */}
              <img 
                src={profile.photos?.[1] || profile.avatar} 
                alt={profile.name} 
                className="w-full h-full object-cover opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-[#090A0E]" />

              {/* Sound & Controls */}
              <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
                <button
                  onClick={() => setIsVideoMuted(!isVideoMuted)}
                  className="w-9 h-9 rounded-full glass-panel bg-black/60 flex items-center justify-center text-[#F3F4F6]"
                >
                  {isVideoMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-[#FFFFFF]" />}
                </button>
              </div>

              {/* Floating Right Action Rail */}
              <div className="absolute right-3 bottom-16 z-20 flex flex-col items-center gap-3">
                <button
                  onClick={() => onInitiateChat(profile)}
                  className="flex flex-col items-center gap-1 group"
                >
                  <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-[#FFFFFF] to-[rgba(255,255,255,0.20)] flex items-center justify-center text-[#F3F4F6] shadow-lg group-hover:scale-110 transition-transform">
                    <Heart className="w-5 h-5 fill-white" />
                  </div>
                  <span className="text-[10px] text-[#F3F4F6] font-bold">Match</span>
                </button>

                <button
                  onClick={() => onOpenProfileDetail(profile)}
                  className="flex flex-col items-center gap-1 group"
                >
                  <div className="w-11 h-11 rounded-full glass-panel bg-black/60 flex items-center justify-center text-[#F3F4F6] shadow-lg group-hover:scale-110 transition-transform">
                    <MessageCircle className="w-5 h-5 text-[#E5E7EB]" />
                  </div>
                  <span className="text-[10px] text-[#9CA3AF]">Intro</span>
                </button>
              </div>

              {/* Bottom Video Details */}
              <div className="absolute bottom-4 left-4 right-16 z-20 space-y-1.5">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-black text-[#F3F4F6]">{profile.name}, {profile.age}</h3>
                  <span className="px-2 py-0.5 rounded-full bg-[#FFFFFF]/30 text-[#E5E7EB] text-[10px] font-bold">
                    Video Story
                  </span>
                </div>
                <p className="text-xs text-[#F3F4F6] leading-relaxed">
                  "{profile.tagline}"
                </p>
                <div className="flex items-center gap-1 text-[11px] text-[#9CA3AF]">
                  <MapPin className="w-3 h-3 text-[#FFFFFF]" />
                  <span>{profile.location}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODE 3: PERSONALITY & DEEP COMPATIBILITY FIT */}
      {activeMode === 'personality' && (
        <div className="space-y-4 pt-1">
          <div className="p-4 rounded-3xl glass-panel-elevated border border-[rgba(255,255,255,0.20)]/30 space-y-2 text-center glass-panel">
            <Sparkles className="w-6 h-6 text-[#FFFFFF] mx-auto animate-pulse" />
            <h3 className="text-sm font-black text-[#F3F4F6]">AI-Guided Holistic Chemistry</h3>
            <p className="text-xs text-[#9CA3AF] max-w-xs mx-auto">
              Skip superficial swiping. Connect with people whose communication cadence and values align with yours.
            </p>
          </div>

          <div className="space-y-3">
            {filteredProfiles.map((profile) => (
              <div
                key={profile.id}
                onClick={() => onOpenProfileDetail(profile)}
                className="p-4 rounded-3xl glass-panel-elevated border border-[rgba(255,255,255,0.20)]/20 space-y-3 cursor-pointer hover:border-[#FFFFFF]/60 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img 
                      src={profile.avatar} 
                      alt={profile.name} 
                      className="w-12 h-12 rounded-2xl object-cover border border-[rgba(255,255,255,0.20)]/40 shadow-md"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-sm font-bold text-[#F3F4F6]">{profile.name}, {profile.age}</h4>
                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      </div>
                      <div className="text-[11px] text-[#9CA3AF]">{profile.energy} • {profile.location}</div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-base font-black text-[#FFFFFF]">
                      {profile.compatibilityScore}%
                    </div>
                    <span className="text-[10px] text-[#E5E7EB] font-medium">HCM Score</span>
                  </div>
                </div>

                {/* Compatibility Rationale */}
                <div className="p-3 rounded-2xl bg-[#090A0E]/80 border border-[rgba(255,255,255,0.20)]/15 text-xs text-[#9CA3AF] leading-relaxed">
                  <span className="text-[#E5E7EB] font-bold">Why you click: </span>
                  {profile.matchReasons?.[0] || 'Shared core values and aligned communication styles.'}
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-1.5">
                    {profile.coreValues.slice(0, 2).map((v, i) => (
                      <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[#E5E7EB]">
                        {v}
                      </span>
                    ))}
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onInitiateChat(profile);
                    }}
                    className="px-3 py-1.5 rounded-xl gray-glass-btn text-xs font-bold cursor-pointer transition-transform active:scale-95"
                  >
                    Connect
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
