import React, { useState } from 'react';
import { 
  ArrowLeft, 
  MapPin, 
  ShieldCheck, 
  Heart, 
  Star, 
  MessageCircle, 
  Share2, 
  Sparkles, 
  Clock, 
  BookOpen, 
  Briefcase, 
  GraduationCap, 
  Coffee, 
  Music, 
  ThumbsUp, 
  ThumbsDown, 
  Lock, 
  Volume2,
  ChevronDown,
  ExternalLink
} from 'lucide-react';
import { CURRENT_USER } from '../mockData';
import { DigitalLifeHub } from './DigitalLifeHub';
import { ProfileWorldsHub } from './ProfileWorldsHub';
import { GitHubMarkdownRenderer } from './GitHubMarkdownRenderer';
import { markdownProfileClient } from '../services/markdownProfileApiClient';
import type { ProfileMarkdown } from '../types/markdownProfile';
import type { UserProfile } from '../types';

interface ProfileDetailSheetProps {
  profile: UserProfile | null;
  onClose: () => void;
  onInitiateChat: (profile: UserProfile) => void;
  onSuperLike: (profile: UserProfile) => void;
}

export const ProfileDetailSheet: React.FC<ProfileDetailSheetProps> = ({
  profile,
  onClose,
  onInitiateChat,
  onSuperLike
}) => {
  if (!profile) return null;

  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const [activeLayer, setActiveLayer] = useState<'public' | 'worlds' | 'readme' | 'dating' | 'private'>('public');
  const [profileMarkdown, setProfileMarkdown] = useState<ProfileMarkdown | null>(null);

  React.useEffect(() => {
    if (profile?.id) {
      markdownProfileClient.getMarkdown(profile.id, 'usr_me').then(res => {
        if (res.markdown) setProfileMarkdown(res.markdown);
      }).catch(console.error);
    }
  }, [profile?.id]);

  const photos = profile.photos && profile.photos.length > 0 
    ? profile.photos 
    : [profile.avatar];

  return (
    <div className="fixed inset-0 z-50 bg-[#100B12] overflow-y-auto no-scrollbar pb-24 animate-fadeIn">
      {/* Top Floating Sticky Header */}
      <div className="fixed top-0 inset-x-0 z-40 max-w-md mx-auto px-4 py-3 flex items-center justify-between pointer-events-none">
        <button
          onClick={onClose}
          className="w-10 h-10 rounded-full glass-panel-elevated flex items-center justify-center text-[#FFF1F3] hover:text-[#FF4F87] border border-[#FF78A8]/30 shadow-xl pointer-events-auto cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            onClick={() => alert("Profile shared!")}
            className="w-10 h-10 rounded-full glass-panel-elevated flex items-center justify-center text-[#FFF1F3] border border-[#FF78A8]/30 shadow-xl cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="max-w-md mx-auto space-y-5">
        {/* Top Hero Photo Gallery */}
        <div className="relative w-full aspect-[4/5] overflow-hidden bg-[#1B121D]">
          <img 
            src={photos[activePhotoIdx] || profile.avatar} 
            alt={profile.name} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#100B12] via-transparent to-black/30" />

          {/* Dots Indicator */}
          {photos.length > 1 && (
            <div className="absolute bottom-4 inset-x-0 flex items-center justify-center gap-1.5 z-20">
              {photos.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActivePhotoIdx(idx)}
                  className={`h-1.5 rounded-full transition-all cursor-pointer ${
                    idx === activePhotoIdx 
                      ? 'w-6 bg-[#FF4F87] shadow-[0_0_8px_#FF4F87]' 
                      : 'w-1.5 bg-white/40'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Core Identity Info */}
        <div className="px-5 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-[#FFF1F3]">{profile.name}</h1>
                <span className="text-2xl font-semibold text-[#FFB4CE]">{profile.age}</span>
                {profile.verifications?.photoVerified && (
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                )}
              </div>

              <div className="flex items-center gap-2 text-xs text-[#B9A8B3] mt-1">
                <span className="flex items-center gap-1 text-[#FFF1F3]">
                  <MapPin className="w-3.5 h-3.5 text-[#FF4F87]" />
                  {profile.location}
                </span>
                <span>•</span>
                <span>{profile.status}</span>
              </div>
            </div>

            {/* Compatibility pill */}
            {profile.compatibilityScore && (
              <div className="text-right px-3 py-1.5 rounded-2xl glass-panel-elevated border border-[#FF78A8]/40">
                <div className="text-base font-black text-[#FF4F87]">
                  {profile.compatibilityScore}%
                </div>
                <span className="text-[10px] text-[#B9A8B3] font-medium">HCM Score</span>
              </div>
            )}
          </div>

          {/* Tagline / Bio Quote */}
          <div className="p-4 rounded-3xl glass-panel-elevated border border-[#FF78A8]/20 space-y-2">
            <span className="text-[10px] uppercase font-bold text-[#FFB4CE] tracking-wider block">Bio</span>
            <p className="text-xs text-[#FFF1F3] leading-relaxed italic border-l-2 border-[#FF4F87] pl-3">
              "{profile.aboutMeLong || profile.tagline}"
            </p>
          </div>

          {/* Privacy Layer Switcher */}
          <div className="flex p-1 rounded-2xl glass-panel gap-1 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveLayer('public')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeLayer === 'public' ? 'bg-[#FF4F87] text-[#FFF1F3]' : 'text-[#B9A8B3]'
              }`}
            >
              Public Story
            </button>
            <button
              onClick={() => setActiveLayer('worlds')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1 ${
                activeLayer === 'worlds' ? 'bg-[#FF4F87] text-[#FFF1F3]' : 'text-[#B9A8B3]'
              }`}
            >
              <span>🪐</span>
              <span>Worlds</span>
            </button>
            <button
              onClick={() => setActiveLayer('readme')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1 ${
                activeLayer === 'readme' ? 'bg-[#FF4F87] text-[#FFF1F3]' : 'text-[#B9A8B3]'
              }`}
            >
              <span>📄</span>
              <span>README.md</span>
            </button>
            <button
              onClick={() => setActiveLayer('dating')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeLayer === 'dating' ? 'bg-[#FF4F87] text-[#FFF1F3]' : 'text-[#B9A8B3]'
              }`}
            >
              Dating Intent
            </button>
            <button
              onClick={() => setActiveLayer('private')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeLayer === 'private' ? 'bg-[#FF4F87] text-[#FFF1F3]' : 'text-[#B9A8B3]'
              }`}
            >
              Private Layer
            </button>
          </div>

          {/* LAYER: PROFILE WORLDS */}
          {activeLayer === 'worlds' && (
            <div className="space-y-4 animate-fadeIn">
              <ProfileWorldsHub 
                userId={profile.id} 
                isOwner={profile.id === 'usr_me'} 
                viewerId="usr_me" 
              />
            </div>
          )}

          {/* LAYER: GITHUB MARKDOWN README */}
          {activeLayer === 'readme' && (
            <div className="p-4 rounded-3xl glass-panel-elevated border border-[#FF78A8]/30 space-y-3 shadow-xl animate-fadeIn">
              <div className="flex items-center justify-between pb-2 border-b border-[#FF78A8]/20 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-[#FFB4CE]">@{profile.username} / README.md</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono">
                  GFM v0.29
                </span>
              </div>
              <GitHubMarkdownRenderer 
                content={profileMarkdown?.content || `# 🌌 ${profile.name} / README.md\n\n> *"Expressing identity through high-craft systems and quiet depth."*\n\nThis user describes themselves in extraordinary detail across their Profile Worlds.\n\n- [x] Profile Verified\n- [ ] Ready for meaningful connection`} 
              />
            </div>
          )}

          {/* LAYER 1: PUBLIC STORY */}
          {activeLayer === 'public' && (
            <div className="space-y-4 animate-fadeIn">
              {/* Values & Interests */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-[#FFB4CE] uppercase tracking-wider">Core Values & Passions</span>
                <div className="flex flex-wrap gap-1.5">
                  {profile.coreValues.map((v, i) => (
                    <span key={i} className="px-3 py-1 rounded-full text-xs font-medium bg-[#1B121D] border border-[#FF78A8]/30 text-[#FFF1F3]">
                      {v}
                    </span>
                  ))}
                  {profile.interests.map((v, i) => (
                    <span key={`int-${i}`} className="px-3 py-1 rounded-full text-xs font-medium bg-black/40 border border-white/10 text-[#B9A8B3]">
                      #{v}
                    </span>
                  ))}
                </div>
              </div>

              {/* Appreciates vs Turn-offs */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-2xl bg-emerald-950/20 border border-emerald-500/20 space-y-1">
                  <div className="flex items-center gap-1 text-emerald-400 font-bold text-[11px]">
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>Appreciates</span>
                  </div>
                  <p className="text-[11px] text-[#B9A8B3] leading-relaxed">
                    {profile.likes.join(' • ')}
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-rose-950/20 border border-rose-500/20 space-y-1">
                  <div className="flex items-center gap-1 text-rose-400 font-bold text-[11px]">
                    <ThumbsDown className="w-3.5 h-3.5" />
                    <span>Turn-offs</span>
                  </div>
                  <p className="text-[11px] text-[#B9A8B3] leading-relaxed">
                    {profile.dislikes.join(' • ')}
                  </p>
                </div>
              </div>

              {/* Vulnerable Prompt */}
              <div className="p-4 rounded-3xl glass-panel space-y-1.5">
                <span className="text-[10px] font-bold text-[#FFB4CE] uppercase">
                  {profile.deepQuestion.question}
                </span>
                <p className="text-xs text-[#FFF1F3] italic leading-relaxed">
                  "{profile.deepQuestion.answer}"
                </p>
              </div>

              {/* Digital Life: Public Social & Creator Profiles */}
              <div className="p-4 rounded-3xl glass-panel-elevated border border-[#FF78A8]/20 shadow-lg">
                <DigitalLifeHub userId={profile.id} isOwner={profile.id === CURRENT_USER.id} />
              </div>
            </div>
          )}

          {/* LAYER 2: DATING INTENTION */}
          {activeLayer === 'dating' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-4 rounded-3xl glass-panel-elevated space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#B9A8B3]">Relationship Intention:</span>
                  <span className="font-bold text-[#FF4F87]">{profile.intent}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#B9A8B3]">Social Battery:</span>
                  <span className="font-bold text-[#FFF1F3]">{profile.energy} ({profile.socialEnergy})</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#B9A8B3]">Conflict Style:</span>
                  <span className="font-bold text-[#FFF1F3]">{profile.conflictStyle}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#B9A8B3]">Affection Language:</span>
                  <span className="font-bold text-[#FFF1F3]">{profile.affectionStyle}</span>
                </div>
              </div>

              {/* Ideal Conversation */}
              <div className="p-4 rounded-3xl glass-panel space-y-1">
                <span className="text-[10px] font-bold text-[#FFB4CE] uppercase">Ideal First Conversation</span>
                <p className="text-xs text-[#FFF1F3]">{profile.idealConversation}</p>
              </div>
            </div>
          )}

          {/* LAYER 3: PRIVATE GATED LAYER */}
          {activeLayer === 'private' && (
            <div className="p-6 rounded-3xl glass-panel-elevated text-center space-y-3 animate-fadeIn">
              <div className="w-12 h-12 rounded-full bg-[#FF4F87]/20 border border-[#FF4F87]/40 flex items-center justify-center text-[#FF4F87] mx-auto">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-[#FFF1F3]">Protected Layer</h3>
              <p className="text-xs text-[#B9A8B3] max-w-xs mx-auto">
                Exact contact information, social links, and intimate photos are unlocked only after mutual approval to protect privacy.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Floating Bottom Action Bar */}
      <div className="fixed bottom-0 inset-x-0 z-40 max-w-md mx-auto p-4 bg-gradient-to-t from-[#100B12] via-[#100B12]/90 to-transparent flex items-center gap-3">
        <button
          onClick={() => onSuperLike(profile)}
          className="w-12 h-12 rounded-2xl glass-panel-elevated flex items-center justify-center text-sky-400 border border-sky-400/40 shadow-lg cursor-pointer"
          title="Super Like"
        >
          <Star className="w-5 h-5 fill-current" />
        </button>

        <button
          onClick={() => {
            onClose();
            onInitiateChat(profile);
          }}
          className="flex-1 py-3.5 rounded-2xl pink-gradient-btn font-bold text-xs flex items-center justify-center gap-2 shadow-xl cursor-pointer"
        >
          <MessageCircle className="w-4 h-4" />
          <span>Message {profile.name}</span>
        </button>
      </div>
    </div>
  );
};
