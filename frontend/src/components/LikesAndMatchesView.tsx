import React, { useState } from 'react';
import { 
  Heart, 
  Sparkles, 
  ShieldCheck, 
  MessageCircle, 
  Clock, 
  Flame, 
  ArrowRight,
  Filter,
  Star
} from 'lucide-react';
import { MOCK_PROFILES } from '../mockData';
import type { UserProfile } from '../types';

interface LikesAndMatchesViewProps {
  onOpenProfileDetail: (profile: UserProfile) => void;
  onInitiateChat: (profile: UserProfile) => void;
}

export const LikesAndMatchesView: React.FC<LikesAndMatchesViewProps> = ({
  onOpenProfileDetail,
  onInitiateChat
}) => {
  const [activeTab, setActiveTab] = useState<'liked_you' | 'mutual_matches'>('liked_you');

  // Filter mock profiles
  const likedYouProfiles = MOCK_PROFILES.filter(p => p.likesYou || p.id === 'usr_tara');
  const mutualMatches = MOCK_PROFILES.filter(p => p.relationshipStage === 'Match' || p.id === 'usr_alex');

  return (
    <div className="w-full max-w-md mx-auto min-h-[calc(100dvh-5.5rem)] flex flex-col space-y-4 px-3 pt-2 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h1 className="text-xl font-black text-[#F3F4F6] tracking-tight">Connections & Chemistry</h1>
          <p className="text-xs text-[#9CA3AF]">People who were genuinely drawn to your story</p>
        </div>

        <div className="px-3 py-1 rounded-full glass-panel border border-[rgba(255,255,255,0.20)]/30 flex items-center gap-1.5 text-xs text-[#E5E7EB] font-bold shadow-md">
          <Sparkles className="w-3.5 h-3.5 text-[#FFFFFF]" />
          <span>{likedYouProfiles.length + mutualMatches.length} Total</span>
        </div>
      </div>

      {/* Segmented Switcher */}
      <div className="flex p-1 rounded-2xl glass-panel-elevated">
        <button
          onClick={() => setActiveTab('liked_you')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'liked_you'
              ? 'bg-[#FFFFFF] text-[#F3F4F6] shadow-[0_0_12px_rgba(255,79,135,0.6)]'
              : 'text-[#9CA3AF] hover:text-[#F3F4F6]'
          }`}
        >
          <Heart className="w-3.5 h-3.5 fill-current" />
          <span>Liked You ({likedYouProfiles.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('mutual_matches')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'mutual_matches'
              ? 'bg-[#FFFFFF] text-[#F3F4F6] shadow-[0_0_12px_rgba(255,79,135,0.6)]'
              : 'text-[#9CA3AF] hover:text-[#F3F4F6]'
          }`}
        >
          <Flame className="w-3.5 h-3.5 fill-current" />
          <span>Matches ({mutualMatches.length})</span>
        </button>
      </div>

      {/* TAB 1: PEOPLE WHO LIKED YOU */}
      {activeTab === 'liked_you' && (
        <div className="space-y-3">
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-[#12141B] to-[#181B24] border border-[rgba(255,255,255,0.20)]/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#FFFFFF]/20 flex items-center justify-center text-[#FFFFFF]">
                <Heart className="w-4 h-4 fill-current" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#F3F4F6]">Gold Heart Unlocked</h4>
                <p className="text-[10px] text-[#9CA3AF]">Zero blurry profiles. See who genuinely wants to connect.</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {likedYouProfiles.map((profile) => (
              <div
                key={profile.id}
                onClick={() => onOpenProfileDetail(profile)}
                className="relative aspect-[3/4] rounded-3xl overflow-hidden glass-panel-elevated border border-[rgba(255,255,255,0.20)]/30 group cursor-pointer shadow-xl hover:border-[#FFFFFF] transition-all"
              >
                <img 
                  src={profile.avatar} 
                  alt={profile.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#090A0E] via-transparent to-black/20" />

                {/* Compatibility Tag */}
                <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full bg-black/60 border border-[rgba(255,255,255,0.20)]/40 text-[10px] font-bold text-[#E5E7EB]">
                  {profile.compatibilityScore}% Fit
                </div>

                {/* Bottom Details */}
                <div className="absolute bottom-3 inset-x-3 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-black text-[#F3F4F6]">{profile.name}, {profile.age}</h4>
                      <p className="text-[10px] text-[#9CA3AF]">{profile.location}</p>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onInitiateChat(profile);
                      }}
                      className="w-8 h-8 rounded-full bg-[#FFFFFF] flex items-center justify-center text-[#F3F4F6] shadow-lg hover:scale-110 active:scale-95 transition-transform"
                      title="Match Back & Chat"
                    >
                      <Heart className="w-4 h-4 fill-white" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: MUTUAL MATCHES */}
      {activeTab === 'mutual_matches' && (
        <div className="space-y-3">
          <div className="space-y-3">
            {mutualMatches.map((profile) => (
              <div
                key={profile.id}
                onClick={() => onOpenProfileDetail(profile)}
                className="p-3.5 rounded-3xl glass-panel-elevated border border-[rgba(255,255,255,0.20)]/30 flex items-center justify-between gap-3 cursor-pointer hover:border-[#FFFFFF] transition-all shadow-md group"
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img 
                      src={profile.avatar} 
                      alt={profile.name} 
                      className="w-14 h-14 rounded-2xl object-cover border-2 border-[#FFFFFF] shadow-md"
                    />
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-[#090A0E]" />
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-sm font-bold text-[#F3F4F6] group-hover:text-[#E5E7EB] transition-colors">
                        {profile.name}, {profile.age}
                      </h4>
                      {profile.verifications?.photoVerified && (
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      )}
                    </div>
                    <p className="text-[11px] text-[#9CA3AF] line-clamp-1 italic">
                      "{profile.tagline}"
                    </p>
                    <span className="text-[10px] text-[#FFFFFF] font-semibold mt-0.5 block">
                      Matched recently • Ready to message
                    </span>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onInitiateChat(profile);
                  }}
                  className="px-3.5 py-2 rounded-xl gray-glass-btn text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md hover:scale-105 active:scale-95 transition-transform"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Chat</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
