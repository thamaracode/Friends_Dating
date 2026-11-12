import React, { useState } from 'react';
import { 
  Music, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  ExternalLink, 
  Link as LinkIcon, 
  Maximize2, 
  Minimize2, 
  Sparkles,
  ChevronUp,
  ChevronDown,
  Radio,
  Disc3,
  Sliders
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
    volume,
    isMuted,
    currentTime,
    duration,
    isCustomLinked,
    togglePlay,
    setVolume,
    toggleMute,
    seekTo,
    setIsLinkModalOpen,
    isPlayerExpanded,
    setIsPlayerExpanded,
    isMiniDockVisible,
    setIsMiniDockVisible
  } = useSpotifyMusic();

  const [showEmbedInCard, setShowEmbedInCard] = useState(false);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  // =========================================================================
  // VARIANT 1: SIDEBAR CARD (Used in DesktopSoulverseView & profile widgets)
  // =========================================================================
  if (variant === 'card') {
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
            {/* Spinning disc overlay on play */}
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

        {/* Toggle Embedded Spotify Web Player Bar */}
        <div className="pt-1 flex items-center justify-between text-[11px] text-zinc-400 border-t border-white/[0.06]">
          <button
            onClick={() => setShowEmbedInCard(prev => !prev)}
            className="inline-flex items-center gap-1 text-[10px] text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            {showEmbedInCard ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            <span>{showEmbedInCard ? 'Hide Spotify Player' : 'Show Spotify Embed'}</span>
          </button>

          <a
            href={track.spotifyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[10px] text-zinc-400 hover:text-white transition-colors"
          >
            <span>Open Spotify</span>
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
  }

  // =========================================================================
  // VARIANT 2: MINI-DOCK (Persistent floating dock across all Soulverse pages)
  // =========================================================================
  if (variant === 'mini-dock') {
    if (!isMiniDockVisible) {
      return (
        <button
          onClick={() => setIsMiniDockVisible(true)}
          className="fixed bottom-4 right-4 z-40 p-3 rounded-full dark-glass border border-white/15 text-white hover:scale-105 transition-all shadow-2xl flex items-center gap-2 group cursor-pointer"
          title="Open Music Player"
        >
          <Music className={`w-4 h-4 ${isPlaying ? 'text-[#1DB954] animate-pulse' : 'text-zinc-300'}`} />
          {isPlaying && (
            <span className="text-[11px] font-bold text-white max-w-[120px] truncate hidden sm:inline">
              {track.title}
            </span>
          )}
        </button>
      );
    }

    return (
      <div className={`fixed bottom-4 right-4 z-40 max-w-sm w-full p-3 rounded-2xl dark-glass border border-white/15 shadow-2xl space-y-2 backdrop-blur-2xl animate-slideUp ${className}`}>
        
        {/* Top dock controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-2 h-2 rounded-full bg-[#1DB954] shadow-[0_0_8px_rgba(29,185,84,0.8)] shrink-0" />
            <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider truncate">
              {isCustomLinked ? 'Linked Spotify' : 'Soulverse Ambient'}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsLinkModalOpen(true)}
              className="p-1 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              title="Link custom Spotify"
            >
              <LinkIcon className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setIsPlayerExpanded(true)}
              className="p-1 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              title="Expand player"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setIsMiniDockVisible(false)}
              className="p-1 text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer text-xs"
              title="Minimize dock"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content row */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl overflow-hidden bg-white/5 border border-white/10 shrink-0">
            {track.coverUrl ? (
              <img src={track.coverUrl} alt={track.title} className="w-full h-full object-cover" />
            ) : (
              <Music className="w-4 h-4 m-2.5 text-zinc-400" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h5 className="text-xs font-bold text-white truncate">{track.title}</h5>
            <p className="text-[10px] text-zinc-400 truncate">{track.artist}</p>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={toggleMute}
              className="p-1.5 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={togglePlay}
              className="p-2 rounded-full dark-glass hover:bg-white/20 text-white transition-all cursor-pointer border border-white/15"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <Pause className="w-3 h-3 fill-white text-white" />
              ) : (
                <Play className="w-3 h-3 fill-white text-white ml-0.5" />
              )}
            </button>
          </div>
        </div>

        {/* Mini progress bar */}
        <div 
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const ratio = clickX / rect.width;
            seekTo(ratio * duration);
          }}
          className="w-full h-1 bg-black/60 rounded-full overflow-hidden cursor-pointer"
        >
          <div 
            className="h-full bg-white/70 rounded-full transition-all"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

      </div>
    );
  }

  // =========================================================================
  // VARIANT 3: FULL EXPANDED PLAYER MODAL
  // =========================================================================
  if (!isPlayerExpanded) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      <div className="w-full max-w-lg rounded-3xl dark-glass border border-white/20 p-6 space-y-5 shadow-2xl relative">
        
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#1DB954]/20 border border-[#1DB954]/40 flex items-center justify-center text-[#1DB954]">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.503 17.309c-.215.353-.675.467-1.028.252-2.816-1.722-6.36-2.112-10.536-1.157-.403.092-.806-.157-.899-.56-.092-.403.157-.806.56-.899 4.568-1.044 8.5-608 11.651 1.336.353.215.467.675.252 1.028zm1.47-3.264c-.27.441-.849.582-1.29.312-3.224-1.982-8.14-2.556-11.954-1.398-.499.151-1.028-.135-1.179-.634-.151-.499.135-1.028.634-1.179 4.364-1.325 9.789-.684 13.477 1.583.441.27.582.849.312 1.29zm.126-3.41c-3.864-2.295-10.244-2.508-13.935-1.387-.594.18-1.226-.154-1.406-.748-.18-.594.154-1.226.748-1.406 4.246-1.29 11.289-1.042 15.744 1.604.535.317.71 1.01.393 1.545-.317.535-1.01.71-1.545.393z"/>
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Soulverse Spotify Player</h3>
              <p className="text-[10px] text-zinc-400">Integrated Web Audio & Spotify Embed</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setIsPlayerExpanded(false);
                setIsLinkModalOpen(true);
              }}
              className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-white/[0.06] hover:bg-white/15 text-zinc-300 hover:text-white border border-white/10 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <LinkIcon className="w-3 h-3 text-[#1DB954]" />
              <span>Link Different Spotify</span>
            </button>
            <button
              onClick={() => setIsPlayerExpanded(false)}
              className="p-1.5 rounded-xl hover:bg-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              <Minimize2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Embedded Official Spotify Player */}
        <div className="rounded-2xl overflow-hidden border border-white/15 shadow-2xl bg-black/80">
          <iframe
            title="Soulverse Spotify Player Expanded"
            src={track.embedUrl}
            width="100%"
            height={track.type === 'playlist' ? '352' : '152'}
            frameBorder="0"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
            className="w-full"
          />
        </div>

        {/* Playback Controls & Volume */}
        <div className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.04] border border-white/10">
          <div className="flex items-center gap-3">
            <button
              onClick={togglePlay}
              className="p-2.5 rounded-full dark-glass hover:bg-white/20 text-white transition-all cursor-pointer border border-white/15 shadow-md"
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 fill-white text-white" />
              ) : (
                <Play className="w-4 h-4 fill-white text-white ml-0.5" />
              )}
            </button>
            <div>
              <h5 className="text-xs font-bold text-white truncate max-w-[200px]">{track.title}</h5>
              <p className="text-[10px] text-zinc-400 truncate max-w-[200px]">{track.artist}</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={toggleMute}
              className="text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isMuted ? 0 : volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-20 accent-white h-1 bg-white/20 rounded-lg cursor-pointer"
            />
          </div>
        </div>

        {/* External Link */}
        <div className="flex items-center justify-between text-xs text-zinc-400">
          <span>Direct Spotify Stream</span>
          <a
            href={track.spotifyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-zinc-300 hover:text-white transition-colors"
          >
            <span>Open in official Spotify App</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

      </div>
    </div>
  );
};
