import { 
  Sparkles, 
  MapPin, 
  Compass, 
  Brain, 
  ExternalLink,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Clock
} from 'lucide-react';
import type { UserProfile } from '../types';
import { ActiveTimeBadge } from './ActiveTimeBadge';

interface ProfileCardProps {
  profile: UserProfile;
  onInitiateConversation: (profile: UserProfile) => void;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({ profile, onInitiateConversation }) => {
  return (
    <div className="bg-[#171717] border border-[#302B22] rounded-3xl overflow-hidden shadow-xl hover:border-[#D6AD60]/60 transition-all flex flex-col group">
      {/* Top Banner & Picture */}
      <div className="relative h-64 overflow-hidden">
        <img 
          src={profile.avatar} 
          alt={profile.name} 
          className="w-full h-full object-cover transform group-hover:scale-105 transition duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#171717] via-transparent to-black/40" />
        
        {/* Compatibility Badge if available */}
        {profile.compatibilityScore && (
          <div className="absolute top-4 right-4 bg-[#111111]/90 backdrop-blur-md border border-[#D6AD60]/50 px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg">
            <Sparkles className="w-3.5 h-3.5 text-[#D6AD60]" />
            <span className="text-xs font-bold text-[#F1D99F]">
              {profile.compatibilityScore}% Match
            </span>
          </div>
        )}

        {/* Intent Badge */}
        <div className="absolute top-4 left-4">
          <span className="text-[11px] font-semibold tracking-wide uppercase px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md text-[#F5F0E6] border border-[#302B22]">
            {profile.intent}
          </span>
        </div>

        {/* Bottom Profile Header */}
        <div className="absolute bottom-3 left-4 right-4">
          <div className="flex items-baseline gap-2">
            <h3 className="text-xl font-bold text-[#F5F0E6] group-hover:text-[#F1D99F] transition-colors">{profile.name}</h3>
            <span className="text-[#A7A094] text-sm">{profile.age}</span>
          </div>
          <p className="text-xs text-[#A7A094] flex items-center gap-1 mt-0.5">
            <MapPin className="w-3.5 h-3.5 text-[#D6AD60]" />
            {profile.location}
          </p>
        </div>
      </div>

      {/* Body Content */}
      <div className="p-5 flex-1 flex flex-col gap-4">
        
        {/* Most Active Time Window Indicator */}
        {profile.activeTimeWindow && (
          <ActiveTimeBadge window={profile.activeTimeWindow} variant="card" />
        )}

        {/* Tagline / Bio */}
        <p className="text-sm text-[#A7A094] italic border-l-2 border-[#D6AD60]/60 pl-3">
          "{profile.tagline}"
        </p>

        {/* Why you might connect (HCM Engine Reasoning) */}
        {profile.matchReasons && profile.matchReasons.length > 0 && (
          <div className="bg-purple-950/20 border border-purple-800/30 rounded-2xl p-3">
            <div className="flex items-center gap-1.5 text-purple-300 text-xs font-semibold mb-1.5">
              <Brain className="w-3.5 h-3.5" />
              <span>HCM Compatibility Reasoning:</span>
            </div>
            <ul className="text-xs text-purple-200/80 space-y-1 pl-4 list-disc">
              {profile.matchReasons.map((reason, idx) => (
                <li key={idx}>{reason}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Psychographic Matrix Indicators */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-[#111111] p-2.5 rounded-xl border border-[#211E18]">
            <span className="text-[#A7A094] block text-[10px] uppercase font-bold tracking-wider">Social Energy</span>
            <span className="text-[#F5F0E6] font-medium">{profile.energy} ({profile.socialEnergy})</span>
          </div>
          <div className="bg-[#111111] p-2.5 rounded-xl border border-[#211E18]">
            <span className="text-[#A7A094] block text-[10px] uppercase font-bold tracking-wider">Conflict Style</span>
            <span className="text-[#F5F0E6] font-medium">{profile.conflictStyle}</span>
          </div>
        </div>

        {/* Interests & Obsessions */}
        <div>
          <span className="text-[11px] font-bold text-[#A7A094] uppercase tracking-wider block mb-1.5">
            Obsessions & Topics
          </span>
          <div className="flex flex-wrap gap-1.5">
            {profile.interests.map((interest) => (
              <span 
                key={interest} 
                className="text-xs bg-[#211E18] text-[#F5F0E6] px-2.5 py-1 rounded-lg border border-[#302B22]"
              >
                #{interest}
              </span>
            ))}
          </div>
        </div>

        {/* Likes vs Dislikes (Anti-Superficial Signal) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
          <div className="bg-emerald-950/20 border border-emerald-900/30 rounded-xl p-2.5">
            <div className="flex items-center gap-1 text-emerald-400 font-semibold mb-1">
              <ThumbsUp className="w-3 h-3" />
              <span>Appreciates:</span>
            </div>
            <p className="text-[#A7A094] text-[11px] leading-relaxed">
              {profile.likes.join(' • ')}
            </p>
          </div>

          <div className="bg-rose-950/20 border border-rose-900/30 rounded-xl p-2.5">
            <div className="flex items-center gap-1 text-rose-400 font-semibold mb-1">
              <ThumbsDown className="w-3 h-3" />
              <span>Turn-offs:</span>
            </div>
            <p className="text-[#A7A094] text-[11px] leading-relaxed">
              {profile.dislikes.join(' • ')}
            </p>
          </div>
        </div>

        {/* Personal Depth Prompt */}
        <div className="bg-[#111111] border border-[#211E18] rounded-2xl p-3.5 mt-1">
          <span className="text-[10px] font-bold tracking-wider uppercase text-[#D6AD60] flex items-center gap-1 mb-1">
            <Compass className="w-3 h-3" />
            {profile.deepQuestion.question}
          </span>
          <p className="text-xs text-[#F5F0E6] leading-relaxed italic">
            "{profile.deepQuestion.answer}"
          </p>
        </div>

        {/* Public Social Accounts */}
        {profile.socialLinks && profile.socialLinks.length > 0 && (
          <div className="flex items-center gap-2 pt-1 border-t border-[#211E18]">
            <span className="text-[11px] text-[#A7A094]">Connected:</span>
            <div className="flex gap-2">
              {profile.socialLinks.map((social) => (
                <a
                  key={social.platform}
                  href={social.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-[11px] text-[#A7A094] hover:text-[#F1D99F] bg-[#111111] px-2 py-0.5 rounded-md border border-[#302B22]"
                >
                  <span>{social.platform}</span>
                  {social.followersCount && (
                    <span className="text-[9px] text-[#D6AD60]">({social.followersCount})</span>
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
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-gradient-to-r from-[#D6AD60] to-[#F1D99F] hover:opacity-90 text-[#090909] rounded-xl font-bold text-xs shadow-md shadow-[#D6AD60]/20 transition-all cursor-pointer"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Start Thoughtful Conversation</span>
          </button>
        </div>

      </div>
    </div>
  );
};
