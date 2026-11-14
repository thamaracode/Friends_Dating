import React, { useState } from 'react';
import { 
  Music, 
  Play, 
  Pause, 
  ExternalLink, 
  Link as LinkIcon, 
  Sparkles,
  ChevronUp,
  ChevronDown,
  Disc3
} from 'lucide-react';
import { useSpotifyMusic } from '../context/SpotifyMusicContext';

interface SpotifyPlayerWidgetProps {
  variant?: 'card' | 'mini-dock' | 'expanded';
  className?: string;
}

export const SpotifyPlayerWidget: React.FC<SpotifyPlayerWidgetProps> = ({
  variant = 'card',
  className = ''
}) => {
  const {
    track,
    isPlaying,
    currentTime,
    duration,
    isCustomLinked,
    togglePlay,
    seekTo,
    setIsLinkModalOpen
  } = useSpotifyMusic();

  const [showEmbedInCard, setShowEmbedInCard] = useState(false);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  // Persistent floating bottom-right mini-dock and popups are completely disabled
  if (variant !== 'card') {
    return null;
  }

  return (
    <div className={`p-4 rounded-3xl dark-glass border border-white/[0.08] space-y-3 shadow-xl relative overflow-hidden transition-all ${className}`}>
      {/* Subtle glow highlight when playing */}
      {isPlaying && (
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#1DB954]/[0.08] rounded-full blur-2xl pointer-events-none -mr-10 -mt-10 animate-pulse" />
      )}

      {/* Header bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
            {isCustomLinked ? 'Linked Spotify' : 'Currently Playing'}
          </span>
          {isPlaying && (
            <div className="flex items-end gap-0.5 h-3 px-1">
              <span className="w-0.5 h-2 bg-[#1DB954] rounded-full animate-bounce [animation-delay:0ms]" />
              <span className="w-0.5 h-3 bg-[#1DB954] rounded-full animate-bounce [animation-delay:150ms]" />
              <span className="w-0.5 h-1.5 bg-[#1DB954] rounded-full animate-bounce [animation-delay:300ms]" />
            </div>
          )}
        </div>

        <button
          onClick={() => setIsLinkModalOpen(true)}
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/[0.06] hover:bg-white/15 text-zinc-300 hover:text-white border border-white/10 transition-colors cursor-pointer"
          title="Link custom Spotify track or playlist"
        >
          <LinkIcon className="w-2.5 h-2.5 text-[#1DB954]" />
          <span>{isCustomLinked ? 'Change' : 'Link Spotify'}</span>
        </button>
      </div>

      {/* Main Track Info & Playback */}
      <div className="flex items-center gap-3">
        <div className="relative w-11 h-11 rounded-2xl overflow-hidden dark-glass border border-white/15 flex items-center justify-center text-white shrink-0 shadow-md group">
          {track.coverUrl ? (
            <img 
              src={track.coverUrl} 
              alt={track.title} 
              className={`w-full h-full object-cover transition-transform duration-700 ${isPlaying ? 'scale-105' : 'grayscale-[20%]'}`}
            />
          ) : (
            <Music className="w-4 h-4 text-zinc-300" />
          )}
          {isPlaying && (
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
              <Disc3 className="w-5 h-5 text-white/90 animate-spin [animation-duration:4s]" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="text-xs font-bold text-white truncate flex items-center gap-1.5" title={track.title}>
            <span>{track.title}</span>
            {isCustomLinked && (
              <span className="text-[9px] px-1 rounded bg-[#1DB954]/20 text-[#1DB954] font-semibold shrink-0">
                User
              </span>
            )}
          </h4>
          <p className="text-[10px] text-zinc-400 truncate" title={track.artist}>
            {track.artist}
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={togglePlay}
            className="p-2 rounded-full dark-glass hover:bg-white/[0.12] text-white hover:scale-105 transition-transform cursor-pointer border border-white/15 shadow-sm active:scale-95"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause className="w-3.5 h-3.5 text-white fill-white" />
            ) : (
              <Play className="w-3.5 h-3.5 fill-white text-white ml-0.5" />
            )}
          </button>
        </div>
      </div>

      {/* Progress Bar & Scrubber */}
      <div className="space-y-1">
        <div 
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const ratio = clickX / rect.width;
            seekTo(ratio * duration);
          }}
          className="w-full h-1.5 bg-black/50 hover:h-2 rounded-full overflow-hidden cursor-pointer transition-all relative group"
        >
          <div 
            className="h-full bg-white/80 rounded-full shadow-[0_0_8px_rgba(255,255,255,0.6)] transition-all"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="flex justify-between text-[9px] text-zinc-500 font-mono">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Footer bar */}
      <div className="pt-1 flex items-center justify-between text-[11px] text-zinc-400 border-t border-white/[0.06]">
        <button
          onClick={() => setShowEmbedInCard(prev => !prev)}
          className="inline-flex items-center gap-1 text-[10px] text-zinc-400 hover:text-white transition-colors cursor-pointer"
        >
          {showEmbedInCard ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          <span>{showEmbedInCard ? 'Hide Embed' : 'Embed'}</span>
        </button>

        <button
          onClick={() => { window.location.hash = '#spotify'; }}
          className="inline-flex items-center gap-1 text-[10px] text-emerald-400 hover:text-emerald-300 font-medium transition-colors cursor-pointer"
          title="Open Spotify Embed Hub & Interactive Controller"
        >
          <Sparkles className="w-2.5 h-2.5 text-[#1DB954]" />
          <span>Embed Sanctuary</span>
        </button>

        <a
          href={track.spotifyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-[10px] text-zinc-400 hover:text-white transition-colors"
        >
          <span>Open</span>
          <ExternalLink className="w-2.5 h-2.5" />
        </a>
      </div>

      {/* Embedded Spotify IFrame (when toggled open) */}
      {showEmbedInCard && (
        <div className="pt-2 animate-fadeIn">
          <div className="rounded-2xl overflow-hidden border border-white/10 shadow-lg bg-black/70">
            <iframe
              title="Soulverse Spotify Player"
              src={track.embedUrl}
              width="100%"
              height="152"
              frameBorder="0"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
              className="w-full"
            />
          </div>
          <p className="text-[10px] text-zinc-500 text-center pt-1.5">
            Press play in the Spotify widget to stream complete audio.
          </p>
        </div>
      )}
    </div>
  );
};
