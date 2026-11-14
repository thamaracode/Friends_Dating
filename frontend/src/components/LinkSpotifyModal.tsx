import React, { useState } from 'react';
import { 
  Music, 
  Link as LinkIcon, 
  Check, 
  AlertCircle, 
  Sparkles, 
  RotateCcw, 
  ExternalLink,
  Radio,
  Disc3,
  X
} from 'lucide-react';
import { useSpotifyMusic, parseSpotifyUrl, CURATED_SPOTIFY_PRESETS } from '../context/SpotifyMusicContext';
import { GlassModal, GlassButton, GlassPrimaryButton } from './klyven';

export const LinkSpotifyModal: React.FC = () => {
  const { 
    isLinkModalOpen, 
    setIsLinkModalOpen, 
    track, 
    linkSpotify, 
    unlinkSpotify, 
    selectPreset,
    activePresetIndex
  } = useSpotifyMusic();

  const [inputUrl, setInputUrl] = useState('');
  const [customTitle, setCustomTitle] = useState('');
  const [customArtist, setCustomArtist] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isLinkModalOpen) return null;

  const parsedPreview = inputUrl.trim() ? parseSpotifyUrl(inputUrl.trim()) : null;

  const handleLink = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!inputUrl.trim()) {
      setErrorMessage('Please enter a Spotify track, playlist, or album link.');
      return;
    }

    const success = linkSpotify(inputUrl.trim(), customTitle, customArtist);
    if (success) {
      setSuccessMessage('Spotify link successfully connected! Playing now.');
      setTimeout(() => {
        setIsLinkModalOpen(false);
      }, 1200);
    } else {
      setErrorMessage('Invalid Spotify link or ID. Please check the URL and try again.');
    }
  };

  const handlePresetSelect = (idx: number) => {
    selectPreset(idx);
    setSuccessMessage(`Switched to "${CURATED_SPOTIFY_PRESETS[idx].title}"`);
    setTimeout(() => {
      setSuccessMessage(null);
    }, 2000);
  };

  const handleReset = () => {
    unlinkSpotify();
    setInputUrl('');
    setCustomTitle('');
    setCustomArtist('');
    setErrorMessage(null);
    setSuccessMessage('Reset to default Soulverse ambient soundscape.');
  };

  return (
    <GlassModal
      isOpen={isLinkModalOpen}
      onClose={() => setIsLinkModalOpen(false)}
      title="Link Your Spotify Music"
      maxWidth="lg"
    >
      <div className="space-y-6">
        
        {/* Intro Banner */}
        <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#1DB954]/20 border border-[#1DB954]/40 flex items-center justify-center shrink-0 text-[#1DB954]">
            {/* Spotify SVG Icon */}
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.503 17.309c-.215.353-.675.467-1.028.252-2.816-1.722-6.36-2.112-10.536-1.157-.403.092-.806-.157-.899-.56-.092-.403.157-.806.56-.899 4.568-1.044 8.5-608 11.651 1.336.353.215.467.675.252 1.028zm1.47-3.264c-.27.441-.849.582-1.29.312-3.224-1.982-8.14-2.556-11.954-1.398-.499.151-1.028-.135-1.179-.634-.151-.499.135-1.028.634-1.179 4.364-1.325 9.789-.684 13.477 1.583.441.27.582.849.312 1.29zm.126-3.41c-3.864-2.295-10.244-2.508-13.935-1.387-.594.18-1.226-.154-1.406-.748-.18-.594.154-1.226.748-1.406 4.246-1.29 11.289-1.042 15.744 1.604.535.317.71 1.01.393 1.545-.317.535-1.01.71-1.545.393z"/>
            </svg>
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Connect Your Soundtrack</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#1DB954]/15 text-[#1DB954] border border-[#1DB954]/30">
                Official Spotify Embed
              </span>
            </h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Paste any Spotify link (track, playlist, or album) or select a curated ambient playlist below. Soulverse will embed the player and stream audio seamlessly while you explore.
            </p>
          </div>
        </div>

        {/* Input Form */}
        <form onSubmit={handleLink} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-300 block">
              Spotify Link, URI, or Track ID
            </label>
            <div className="relative">
              <input
                type="text"
                value={inputUrl}
                onChange={(e) => {
                  setInputUrl(e.target.value);
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                placeholder="https://open.spotify.com/track/... or playlist/..."
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/10 text-white text-xs placeholder-zinc-500 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/20 transition-all font-mono"
              />
              <LinkIcon className="w-4 h-4 text-zinc-400 absolute left-3 top-3 pointer-events-none" />
            </div>
            <p className="text-[11px] text-zinc-500">
              Supports: <code className="text-zinc-400 font-mono">open.spotify.com/track/...</code>, <code className="text-zinc-400 font-mono">playlist/...</code>, <code className="text-zinc-400 font-mono">album/...</code> or <code className="text-zinc-400 font-mono">spotify:track:...</code>
            </p>
          </div>

          {/* Validation Feedback Pill */}
          {parsedPreview && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  Valid <strong>{parsedPreview.type.toUpperCase()}</strong> detected (ID: <code className="font-mono text-[10px]">{parsedPreview.id}</code>)
                </span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-bold uppercase">
                Ready to Embed
              </span>
            </div>
          )}

          {/* Optional Meta fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-zinc-400 block">
                Custom Title (Optional)
              </label>
              <input
                type="text"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                placeholder="e.g. My Midnight Mix"
                className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs placeholder-zinc-500 focus:outline-none focus:border-white/30"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-zinc-400 block">
                Custom Artist (Optional)
              </label>
              <input
                type="text"
                value={customArtist}
                onChange={(e) => setCustomArtist(e.target.value)}
                placeholder="e.g. Various Artists"
                className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs placeholder-zinc-500 focus:outline-none focus:border-white/30"
              />
            </div>
          </div>

          {/* Error / Success Feedback */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Submit Actions */}
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={handleReset}
              className="px-3 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-zinc-400 hover:text-white border border-white/10 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset to Default</span>
            </button>

            <div className="flex items-center gap-2">
              <GlassButton
                variant="subtle"
                size="sm"
                onClick={() => setIsLinkModalOpen(false)}
              >
                Cancel
              </GlassButton>
              <GlassPrimaryButton
                type="submit"
                size="sm"
                className="shadow-lg"
              >
                Save & Link Spotify
              </GlassPrimaryButton>
            </div>
          </div>
        </form>

        {/* Curated Soulverse Soundtracks */}
        <div className="border-t border-white/10 pt-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-zinc-400" />
              <span>Or Choose a Curated Ambient Soundscape</span>
            </span>
            <span className="text-[10px] text-zinc-500 font-medium">Click to activate</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-56 overflow-y-auto pr-1">
            {CURATED_SPOTIFY_PRESETS.map((preset, idx) => {
              const isSelected = activePresetIndex === idx && !track.isCustomLinked;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handlePresetSelect(idx)}
                  className={`p-3 rounded-xl border text-left transition-all flex items-start gap-3 cursor-pointer group ${
                    isSelected
                      ? 'bg-white/15 border-white/40 shadow-lg'
                      : 'bg-white/[0.03] border-white/10 hover:bg-white/[0.07] hover:border-white/20'
                  }`}
                >
                  <img
                    src={preset.coverUrl}
                    alt={preset.title}
                    className="w-11 h-11 rounded-lg object-cover border border-white/15 shrink-0 group-hover:scale-105 transition-transform"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider truncate">
                        {preset.category}
                      </span>
                      {isSelected && (
                        <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)] shrink-0" />
                      )}
                    </div>
                    <h5 className="text-xs font-bold text-white truncate">{preset.title}</h5>
                    <p className="text-[10px] text-zinc-400 truncate">{preset.artist}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Currently Linked Status */}
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between text-xs text-zinc-400">
          <div className="flex items-center gap-2 truncate">
            <Disc3 className="w-4 h-4 text-zinc-300 shrink-0" />
            <span className="truncate">
              Active: <strong className="text-white">{track.title}</strong> by {track.artist}
            </span>
          </div>
          <a
            href={track.spotifyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-[11px] text-zinc-300 hover:text-white transition-colors shrink-0 ml-2"
          >
            <span>Open in Spotify</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {/* Dedicated Spotify Sanctuary Link (atomjoy/spotify-embed) */}
        <div className="pt-1">
          <button
            type="button"
            onClick={() => {
              setIsLinkModalOpen(false);
              window.location.hash = '#spotify';
            }}
            className="w-full py-2.5 rounded-xl text-xs font-bold bg-[#1DB954]/15 hover:bg-[#1DB954]/25 text-[#1DB954] border border-[#1DB954]/30 transition flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#1DB954]/10"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Open Interactive Spotify Embed Sanctuary (IFrame API & Telemetry)</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>

      </div>
    </GlassModal>
  );
};
