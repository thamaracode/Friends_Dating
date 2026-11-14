import React from 'react';
import { 
  Sparkles, 
  MapPin, 
  Compass, 
  Brain, 
  ExternalLink,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  ShieldCheck
} from 'lucide-react';
import type { UserProfile } from '../types';
import { ActiveTimeBadge } from './ActiveTimeBadge';

interface ProfileCardProps {
  profile: UserProfile;
  onInitiateConversation: (profile: UserProfile) => void;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({ profile, onInitiateConversation }) => {
  return (
    <div className="sv-card p-0 overflow-hidden hover:border-white/25 transition-all flex flex-col group shadow-xl">
      {/* Top Banner & Picture */}
      <div className="relative h-64 overflow-hidden bg-black/60">
        <img 
          src={profile.avatar} 
          alt={profile.name} 
          className="w-full h-full object-cover transform group-hover:scale-105 transition duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#090A0E] via-black/20 to-black/40 pointer-events-none" />
        
        {/* Compatibility Badge if available */}
        {profile.compatibilityScore && (
          <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-md border border-amber-400/30 px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-md">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span className="text-xs font-heading font-bold text-white">
              {profile.compatibilityScore}% Match
            </span>
          </div>
        )}

        {/* Intent Badge */}
        <div className="absolute top-4 left-4">
          <span className="h-8 px-3 rounded-full text-xs font-heading font-bold bg-white/15 backdrop-blur-md text-white border border-white/20 flex items-center shadow-sm">
            {profile.intent}
          </span>
        </div>

        {/* Bottom Profile Header */}
        <div className="absolute bottom-3 left-5 right-5">
          <div className="flex items-center gap-2">
            <h3 className="text-2xl font-extrabold text-white font-heading tracking-tight group-hover:text-amber-200 transition-colors">
              {profile.name}
            </h3>
            <span className="text-zinc-300 text-lg font-heading">{profile.age}</span>
            {profile.verifications?.photoVerified && (
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
            )}
          </div>
          <p className="type-supporting text-zinc-300 flex items-center gap-1.5 mt-0.5">
            <MapPin className="w-3.5 h-3.5 text-zinc-400" />
            <span>{profile.location}</span>
          </p>
        </div>
      </div>

      {/* Body Content */}
      <div className="p-6 flex-1 flex flex-col gap-4">
        
        {/* Most Active Time Window Indicator */}
        {profile.activeTimeWindow && (
          <ActiveTimeBadge window={profile.activeTimeWindow} variant="card" />
        )}

        {/* Tagline / Bio */}
        <p className="font-editorial italic text-sm text-zinc-200 border-l-2 border-amber-400/50 pl-3.5 leading-relaxed">
          "{profile.tagline}"
        </p>

        {/* Why you might connect (HCM Engine Reasoning) */}
        {profile.matchReasons && profile.matchReasons.length > 0 && (
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-3.5 space-y-1.5">
            <div className="flex items-center gap-1.5 text-amber-300 text-xs font-heading font-bold">
              <Brain className="w-4 h-4" />
              <span>HCM Compatibility Reasoning:</span>
            </div>
            <ul className="text-xs text-zinc-300 space-y-1 pl-4 list-disc">
              {profile.matchReasons.map((reason, idx) => (
                <li key={idx}>{reason}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Psychographic Matrix Indicators */}
        <div className="grid grid-cols-2 gap-2.5 text-xs">
          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.08]">
            <span className="text-zinc-400 block text-[10px] uppercase font-heading font-bold tracking-wider">Social Energy</span>
            <span className="text-white font-semibold mt-0.5 block truncate">{profile.energy} ({profile.socialEnergy})</span>
          </div>
          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.08]">
            <span className="text-zinc-400 block text-[10px] uppercase font-heading font-bold tracking-wider">Conflict Style</span>
            <span className="text-white font-semibold mt-0.5 block truncate">{profile.conflictStyle}</span>
          </div>
        </div>

        {/* Interests & Obsessions */}
        <div>
          <span className="text-[11px] font-heading font-bold text-zinc-400 uppercase tracking-wider block mb-2">
            Obsessions &amp; Topics
          </span>
          <div className="flex flex-wrap gap-2">
            {profile.interests.map((interest) => (
              <span 
                key={interest} 
                className="px-3 py-1 rounded-full text-xs font-medium bg-white/10 text-zinc-200 border border-white/10"
              >
                #{interest}
              </span>
            ))}
          </div>
        </div>

        {/* Likes vs Dislikes (Anti-Superficial Signal) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs pt-1">
          <div className="bg-emerald-950/20 border border-emerald-500/20 rounded-xl p-3">
            <div className="flex items-center gap-1.5 text-emerald-400 font-heading font-bold mb-1">
              <ThumbsUp className="w-3.5 h-3.5" />
              <span>Appreciates:</span>
            </div>
            <p className="type-supporting text-zinc-300 text-xs leading-relaxed">
              {profile.likes.join(' • ')}
            </p>
          </div>

          <div className="bg-rose-950/20 border border-rose-500/20 rounded-xl p-3">
            <div className="flex items-center gap-1.5 text-rose-400 font-heading font-bold mb-1">
              <ThumbsDown className="w-3.5 h-3.5" />
              <span>Turn-offs:</span>
            </div>
            <p className="type-supporting text-zinc-300 text-xs leading-relaxed">
              {profile.dislikes.join(' • ')}
            </p>
          </div>
        </div>

        {/* Personal Depth Prompt */}
        <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 mt-1 space-y-1">
          <span className="text-[11px] font-heading font-bold tracking-wider uppercase text-amber-300 flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5" />
            <span>{profile.deepQuestion.question}</span>
          </span>
          <p className="type-body text-xs sm:text-sm text-zinc-200 leading-relaxed italic">
            "{profile.deepQuestion.answer}"
          </p>
        </div>

        {/* Public Social Accounts */}
        {profile.socialLinks && profile.socialLinks.length > 0 && (
          <div className="flex items-center gap-2 pt-2 border-t border-white/[0.08] flex-wrap">
            <span className="type-supporting text-zinc-400">Connected:</span>
            <div className="flex gap-2 flex-wrap">
              {profile.socialLinks.map((social) => (
                <a
                  key={social.platform}
                  href={social.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 text-xs text-zinc-300 hover:text-white bg-white/[0.06] hover:bg-white/[0.12] px-2.5 py-1 rounded-lg border border-white/10 transition-colors"
                >
                  <span>{social.platform}</span>
                  {social.followersCount && (
                    <span className="text-[10px] text-amber-300">({social.followersCount})</span>
                  )}
                  <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="pt-2 mt-auto">
          <button
            onClick={() => onInitiateConversation(profile)}
            className="sv-btn-primary w-full"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Start Thoughtful Conversation</span>
          </button>
        </div>

      </div>
    </div>
  );
};