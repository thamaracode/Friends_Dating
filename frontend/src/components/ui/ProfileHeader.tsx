import React from 'react';
import { CheckCircle2, MapPin, Sparkles, MessageCircle, Share2, MoreHorizontal } from 'lucide-react';

export interface ProfileHeaderProps {
  name: string;
  handle?: string;
  avatarUrl: string;
  coverImageUrl?: string;
  bio?: string;
  location?: string;
  isVerified?: boolean;
  isOnline?: boolean;
  identityDimension?: string;
  intention?: string;
  onMessageClick?: () => void;
  onShareClick?: () => void;
  onMoreClick?: () => void;
  className?: string;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  name,
  handle,
  avatarUrl,
  coverImageUrl = 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1600&q=80',
  bio,
  location,
  isVerified = false,
  isOnline = false,
  identityDimension = 'Real Life',
  intention = 'Deep Friendship & Dating',
  onMessageClick,
  onShareClick,
  onMoreClick,
  className = ''
}) => {
  return (
    <div className={`rounded-3xl overflow-hidden bg-[#12141B]/80 backdrop-blur-2xl border border-white/[0.08] shadow-2xl relative ${className}`}>
      {/* 1. Cinematic Hero Cover */}
      <div className="relative w-full h-44 sm:h-56 md:h-64 overflow-hidden bg-[#090A0E]">
        <img
          src={coverImageUrl}
          alt={`${name}'s Sanctuary Cover`}
          className="w-full h-full object-cover filter contrast-110 brightness-75"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#12141B] via-[#12141B]/50 to-transparent pointer-events-none" />
      </div>

      {/* 2. Avatar & Primary Identity Cluster */}
      <div className="px-5 sm:px-8 pb-6 pt-0 relative -mt-14 sm:-mt-16 flex flex-wrap items-end justify-between gap-4 z-10">
        <div className="flex items-end gap-4 sm:gap-6">
          {/* Avatar Ring */}
          <div className="relative group">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full p-1 bg-gradient-to-tr from-white/20 via-white/40 to-white/10 shadow-[0_0_30px_rgba(255,255,255,0.15)] relative overflow-hidden shrink-0">
              <img
                src={avatarUrl}
                alt={name}
                className="w-full h-full rounded-full object-cover"
              />
            </div>
            {/* Online Indicator */}
            {isOnline && (
              <span 
                className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-emerald-400 border-2 border-[#12141B] shadow-[0_0_8px_#10B981]" 
                title="Online Now"
              />
            )}
          </div>

          {/* Name & Handle Details */}
          <div className="space-y-1 pb-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-heading font-extrabold text-white tracking-tight">
                {name}
              </h1>
              {isVerified && (
                <span title="Verified Human Sanctuary">
                  <CheckCircle2 className="w-5 h-5 text-amber-400 fill-amber-400/20 shrink-0" />
                </span>
              )}
              {identityDimension && (
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-white/10 text-zinc-300 border border-white/15">
                  {identityDimension}
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 text-xs sm:text-sm text-zinc-400">
              {handle && <span>@{handle}</span>}
              {location && (
                <span className="flex items-center gap-1 text-zinc-400">
                  <MapPin className="w-3.5 h-3.5 text-zinc-500" />
                  <span>{location}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* 3. Action Cluster */}
        <div className="flex items-center gap-2.5 shrink-0 pb-1">
          {onMessageClick && (
            <button
              onClick={onMessageClick}
              className="h-10 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-zinc-950 font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg hover:shadow-amber-400/25 transition-all cursor-pointer select-none active:scale-95"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Connect</span>
            </button>
          )}

          {onShareClick && (
            <button
              onClick={onShareClick}
              className="h-10 w-10 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-zinc-200 border border-white/10 flex items-center justify-center transition-all cursor-pointer"
              title="Share Profile"
            >
              <Share2 className="w-4 h-4" />
            </button>
          )}

          {onMoreClick && (
            <button
              onClick={onMoreClick}
              className="h-10 w-10 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-zinc-200 border border-white/10 flex items-center justify-center transition-all cursor-pointer"
              title="More Options"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* 4. Bio & Intentions */}
      {(bio || intention) && (
        <div className="px-5 sm:px-8 pb-6 pt-2 border-t border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {bio && (
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed max-w-2xl">
              {bio}
            </p>
          )}
          {intention && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-400/10 border border-amber-400/20 text-amber-300 text-xs font-semibold shrink-0">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Looking for: {intention}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
