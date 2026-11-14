import React, { useState, useEffect, useRef } from 'react';
import {
  Music,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  ExternalLink,
  Code2,
  Copy,
  Check,
  Radio,
  Sliders,
  ChevronRight,
  Headphones,
  Maximize2,
  Volume2,
  Layers,
  Heart,
  Compass,
  Link as LinkIcon
} from 'lucide-react';
import {
  useSpotifyMusic,
  parseSpotifyUrl,
  toSpotifyUri,
  CURATED_SPOTIFY_PRESETS,
  SpotifyPreset
} from '../../context/SpotifyMusicContext';

// Definition of atomjoy's core URIs
const ATOMJOY_PRESETS = [
  {
    id: 'playlist-top50',
    name: 'Top 50 Global',
    type: 'playlist',
    uri: 'spotify:playlist:37i9dQZEVXbMZ5PAcNTDXd',
    embedUrl: 'https://open.spotify.com/embed/playlist/37i9dQZEVXbMZ5PAcNTDXd?utm_source=generator&theme=0',
    category: 'Global Playlists'
  },
  {
    id: 'podcast-1',
    name: 'Podcast 1 (Consciousness)',
    type: 'episode',
    uri: 'spotify:episode:7makk4oTQel546B0PZlDM5',
    embedUrl: 'https://open.spotify.com/embed/episode/7makk4oTQel546B0PZlDM5?utm_source=generator&theme=0',
    category: 'Podcasts'
  },
  {
    id: 'podcast-2',
    name: 'Podcast 2 (Psychology & Love)',
    type: 'episode',
    uri: 'spotify:episode:43cbJh4ccRD7lzM2730YK3',
    embedUrl: 'https://open.spotify.com/embed/episode/43cbJh4ccRD7lzM2730YK3?utm_source=generator&theme=0',
    category: 'Podcasts'
  },
  {
    id: 'podcast-3',
    name: 'Podcast 3 (Late Night Talks)',
    type: 'episode',
    uri: 'spotify:episode:6I3ZzCxRhRkNqnQNo8AZPV',
    embedUrl: 'https://open.spotify.com/embed/episode/6I3ZzCxRhRkNqnQNo8AZPV?utm_source=generator&theme=0',
    category: 'Podcasts'
  },
  {
    id: 'playlist-viral50',
    name: 'Top 50 Viral',
    type: 'playlist',
    uri: 'spotify:playlist:37i9dQZEVXbNG2KDcFcKOF',
    embedUrl: 'https://open.spotify.com/embed/playlist/37i9dQZEVXbNG2KDcFcKOF?utm_source=generator&theme=0',
    category: 'Global Playlists'
  },
  {
    id: 'playlist-acoustic',
    name: 'Acoustic Date Night',
    type: 'playlist',
    uri: 'spotify:playlist:37i9dQZF1DX7zqr9q1MPG7',
    embedUrl: 'https://open.spotify.com/embed/playlist/37i9dQZF1DX7zqr9q1MPG7?utm_source=generator&theme=0',
    category: 'Soulverse Soundtracks'
  }
];

export const SpotifyEmbedHubView: React.FC = () => {
  const { linkSpotify } = useSpotifyMusic();

  // Layout mode: 'center' (as in spotify-embed-center.html) vs 'split' vs 'embeds'
  const [viewMode, setViewMode] = useState<'center' | 'split' | 'embeds'>('center');

  // Interactive Controller State
  const [activeUri, setActiveUri] = useState<string>('spotify:playlist:37i9dQZEVXbMZ5PAcNTDXd');
  const [playbackState, setPlaybackState] = useState<{
    isPlaying: boolean;
    isBuffering: boolean;
    position: number;
    duration: number;
    playingURI: string;
  }>({
    isPlaying: false,
    isBuffering: false,
    position: 0,
    duration: 0,
    playingURI: 'spotify:playlist:37i9dQZEVXbMZ5PAcNTDXd'
  });

  const [controllerReady, setControllerReady] = useState(false);
  const [inputUrl, setInputUrl] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  // References
  const iframeContainerRef = useRef<HTMLDivElement | null>(null);
  const playerRef = useRef<any>(null);

  // Initialize Spotify IFrame API Controller
  useEffect(() => {
    let isMounted = true;

    const setupController = (IFrameAPI: any) => {
      if (!iframeContainerRef.current || !isMounted) return;

      // Clear previous controller if any
      iframeContainerRef.current.innerHTML = '';

      const options = {
        uri: activeUri,
        width: '100%',
        height: '352'
      };

      const callback = (EmbedController: any) => {
        if (!isMounted) return;
        playerRef.current = EmbedController;
        setControllerReady(true);

        EmbedController.addListener('playback_started', (e: any) => {
          if (!isMounted) return;
          const { playingURI } = e.data || {};
          setPlaybackState(prev => ({
            ...prev,
            isPlaying: true,
            isBuffering: false,
            playingURI: playingURI || prev.playingURI
          }));
        });

        EmbedController.addListener('playback_update', (e: any) => {
          if (!isMounted) return;
          const { position, duration, isBuffering, isPaused, playingURI } = e.data || {};
          setPlaybackState({
            isPlaying: !isPaused,
            isBuffering: Boolean(isBuffering),
            position: position || 0,
            duration: duration || 0,
            playingURI: playingURI || activeUri
          });
        });
      };

      IFrameAPI.createController(iframeContainerRef.current, options, callback);
    };

    const win = window as any;
    if (win.IFrameAPI) {
      setupController(win.IFrameAPI);
    } else {
      win.onSpotifyIframeApiReady = (IFrameAPI: any) => {
        win.IFrameAPI = IFrameAPI;
        setupController(IFrameAPI);
      };
    }

    return () => {
      isMounted = false;
      if (playerRef.current && typeof playerRef.current.destroy === 'function') {
        try {
          playerRef.current.destroy();
        } catch {
          // cleanup
        }
      }
    };
  }, []);

  // Format MM:SS
  const formatTime = (ms: number) => {
    const totalSec = Math.floor(ms / 1000);
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Controller Actions
  const handlePlay = () => {
    if (playerRef.current) {
      playerRef.current.play();
    }
  };

  const handlePause = () => {
    if (playerRef.current) {
      playerRef.current.pause();
    }
  };

  const handleTogglePlay = () => {
    if (playerRef.current) {
      if (playerRef.current.togglePlay) {
        playerRef.current.togglePlay();
      } else if (playbackState.isPlaying) {
        playerRef.current.pause();
      } else {
        playerRef.current.play();
      }
    }
  };

  const handleChangeUri = (uri: string) => {
    setActiveUri(uri);
    if (playerRef.current) {
      playerRef.current.loadUri(uri);
      playerRef.current.play();
      showToast(`Loaded ${uri}`);
    }
  };

  const handleCustomUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputUrl.trim()) return;

    const parsedUri = toSpotifyUri(inputUrl.trim());
    if (parsedUri) {
      handleChangeUri(parsedUri);
      setInputUrl('');
      showToast('Custom Spotify track/playlist loaded!');
    } else {
      showToast('Invalid Spotify URL or URI. Please check and retry.');
    }
  };

  const handleLinkToSoulverse = () => {
    const success = linkSpotify(activeUri, 'Active Sanctuary Audio', 'Spotify Embed');
    if (success) {
      showToast('Connected as Soulverse soundtrack!');
    }
  };

  const showToast = (msg: string) => {
    setFeedbackToast(msg);
    setTimeout(() => setFeedbackToast(null), 3000);
  };

  // HTML Snippet Generator (from atomjoy)
  const currentEmbedCode = `<iframe 
  data-testid="embed-iframe" 
  src="https://open.spotify.com/embed/${activeUri.split(':')[1] || 'playlist'}/${activeUri.split(':')[2] || '37i9dQZEVXbMZ5PAcNTDXd'}?utm_source=generator&theme=0" 
  width="100%" 
  height="352" 
  frameBorder="0" 
  allowfullscreen="" 
  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
  loading="lazy">
</iframe>`;

  const copyEmbedCode = () => {
    navigator.clipboard?.writeText(currentEmbedCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
    showToast('Embed HTML snippet copied to clipboard!');
  };

  return (
    <div className="w-full min-h-screen bg-slate-950 text-slate-100 pb-28">
      {/* 1. TOP HEADER & TELEMETRY BAR */}
      <div className="border-b border-white/10 bg-slate-900/60 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#1DB954]/20 border border-[#1DB954]/40 flex items-center justify-center text-[#1DB954] shadow-lg shadow-[#1DB954]/20">
              {/* Spotify SVG Logo */}
              <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.503 17.309c-.215.353-.675.467-1.028.252-2.816-1.722-6.36-2.112-10.536-1.157-.403.092-.806-.157-.899-.56-.092-.403.157-.806.56-.899 4.568-1.044 8.5-608 11.651 1.336.353.215.467.675.252 1.028zm1.47-3.264c-.27.441-.849.582-1.29.312-3.224-1.982-8.14-2.556-11.954-1.398-.499.151-1.028-.135-1.179-.634-.151-.499.135-1.028.634-1.179 4.364-1.325 9.789-.684 13.477 1.583.441.27.582.849.312 1.29zm.126-3.41c-3.864-2.295-10.244-2.508-13.935-1.387-.594.18-1.226-.154-1.406-.748-.18-.594.154-1.226.748-1.406 4.246-1.29 11.289-1.042 15.744 1.604.535.317.71 1.01.393 1.545-.317.535-1.01.71-1.545.393z" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold tracking-tight text-white">
                  Spotify Embed Sanctuary
                </h1>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#1DB954]/20 text-[#1DB954] border border-[#1DB954]/30">
                  IFrame API v1
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Interactive controller & centered responsive embeds based on atomjoy/spotify-embed
              </p>
            </div>
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center bg-white/5 p-1 rounded-2xl border border-white/10 shrink-0 self-start sm:self-auto">
            <button
              onClick={() => setViewMode('center')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                viewMode === 'center'
                  ? 'bg-gradient-to-r from-emerald-500 to-[#1DB954] text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Center View</span>
            </button>

            <button
              onClick={() => setViewMode('split')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                viewMode === 'split'
                  ? 'bg-gradient-to-r from-emerald-500 to-[#1DB954] text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Controller & Hub</span>
            </button>

            <button
              onClick={() => setViewMode('embeds')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                viewMode === 'embeds'
                  ? 'bg-gradient-to-r from-emerald-500 to-[#1DB954] text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Direct Embeds</span>
            </button>
          </div>
        </div>
      </div>

      {/* Toast Feedback */}
      {feedbackToast && (
        <div className="fixed top-20 right-6 z-50 p-3 rounded-2xl bg-emerald-500/90 text-white font-bold text-xs shadow-2xl backdrop-blur-md animate-fadeIn flex items-center gap-2">
          <Check className="w-4 h-4" />
          <span>{feedbackToast}</span>
        </div>
      )}

      {/* Main Container */}
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        {/* ==================================================================== */}
        {/* MODE A: CENTERED SPOTIFY CONTROLLER (spotify-embed-center.html pattern) */}
        {/* ==================================================================== */}
        {(viewMode === 'center' || viewMode === 'split') && (
          <div className={`space-y-6 ${viewMode === 'center' ? 'w-full md:w-[75%] lg:w-[68%] mx-auto' : ''}`}>
            {/* Interactive Control Deck */}
            <div className="rounded-3xl bg-slate-900/80 border border-white/10 p-6 shadow-2xl space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#1DB954] shadow-[0_0_8px_#1DB954]" />
                  <h2 className="text-sm font-bold tracking-tight text-white uppercase">
                    Interactive Script Controller
                  </h2>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-400">Status:</span>
                  <span
                    className={`font-semibold capitalize px-2 py-0.5 rounded-full text-[10px] ${
                      playbackState.isPlaying
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : playbackState.isBuffering
                        ? 'bg-amber-500/20 text-amber-300'
                        : 'bg-white/5 text-slate-400'
                    }`}
                  >
                    {playbackState.isPlaying
                      ? 'Streaming'
                      : playbackState.isBuffering
                      ? 'Buffering...'
                      : 'Paused / Ready'}
                  </span>
                </div>
              </div>

              {/* Action Buttons from atomjoy/spotify-embed */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  onClick={handlePlay}
                  className="px-5 py-2.5 rounded-xl font-bold text-xs bg-[#1DB954] hover:bg-[#1ed760] text-black shadow-lg shadow-[#1DB954]/25 transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Play</span>
                </button>

                <button
                  onClick={handlePause}
                  className="px-5 py-2.5 rounded-xl font-bold text-xs bg-slate-800 hover:bg-slate-700 text-white border border-white/10 transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Pause className="w-4 h-4 fill-current" />
                  <span>Pause</span>
                </button>

                {ATOMJOY_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => handleChangeUri(preset.uri)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition border cursor-pointer ${
                      activeUri === preset.uri
                        ? 'bg-white text-slate-950 font-bold border-white'
                        : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10'
                    }`}
                  >
                    {preset.name}
                  </button>
                ))}
              </div>

              {/* Telemetry Progress Bar */}
              {playbackState.duration > 0 && (
                <div className="space-y-1.5 pt-2">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                    <span>{formatTime(playbackState.position)}</span>
                    <span className="text-slate-500 truncate max-w-xs">{activeUri}</span>
                    <span>{formatTime(playbackState.duration)}</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-[#1DB954] rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.min(
                          100,
                          (playbackState.position / playbackState.duration) * 100
                        )}%`
                      }}
                    />
                  </div>
                </div>
              )}

              {/* The Real Spotify IFrame Mount Container */}
              <div className="pt-2">
                <div className="rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-black min-h-[352px] flex items-center justify-center relative">
                  {!controllerReady && (
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-950/80 z-10 text-xs text-slate-400 gap-2">
                      <div className="w-4 h-4 border-2 border-[#1DB954] border-t-transparent rounded-full animate-spin" />
                      <span>Initializing Spotify IFrame Controller...</span>
                    </div>
                  )}
                  {/* Container for createController */}
                  <div
                    id="spotify-iframe"
                    ref={iframeContainerRef}
                    className="w-full h-full min-h-[352px]"
                  />
                </div>
              </div>

              {/* Bottom Quick Tools */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleLinkToSoulverse}
                    className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/10 transition flex items-center gap-1.5 font-medium"
                  >
                    <LinkIcon className="w-3.5 h-3.5 text-[#1DB954]" />
                    <span>Set as Active Soulverse Anthem</span>
                  </button>

                  <button
                    onClick={copyEmbedCode}
                    className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition flex items-center gap-1.5"
                  >
                    {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Code2 className="w-3.5 h-3.5" />}
                    <span>{copiedCode ? 'Copied' : 'Copy HTML Snippet'}</span>
                  </button>
                </div>

                <a
                  href={`https://open.spotify.com/${activeUri.split(':')[1]}/${activeUri.split(':')[2]}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition flex items-center gap-1 text-[11px]"
                >
                  <span>Open on Spotify</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* Custom URI / URL Input Box */}
            <div className="rounded-2xl bg-white/5 border border-white/10 p-5 space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Load Custom Track, Playlist, Podcast, or Album
                </h3>
              </div>
              <form onSubmit={handleCustomUrlSubmit} className="flex gap-2">
                <input
                  type="text"
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  placeholder="Paste Spotify URL or URI (e.g. spotify:playlist:... or https://open.spotify.com/...)"
                  className="flex-1 rounded-xl bg-slate-950 border border-white/10 focus:border-[#1DB954] text-white px-3.5 py-2 text-xs outline-none transition"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-[#1DB954] hover:bg-[#1ed760] text-black transition shrink-0"
                >
                  Load URI
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* MODE B: DIRECT EMBEDS GALLERY (tips & embeds from atomjoy)           */}
        {/* ==================================================================== */}
        {(viewMode === 'embeds' || viewMode === 'split') && (
          <div className="space-y-6 pt-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Headphones className="w-5 h-5 text-[#1DB954]" />
                  <span>Curated Spotify Embeds & Playlists</span>
                </h2>
                <p className="text-xs text-slate-400">
                  Standard responsive iframe components ready to stream across all devices.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Embed 1: Top 50 Global */}
              <div className="rounded-3xl bg-slate-900/60 border border-white/10 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">Top 50 Global Anthems</span>
                  <span className="text-[10px] text-slate-400 uppercase font-mono">Playlist</span>
                </div>
                <div className="rounded-2xl overflow-hidden border border-white/10 bg-black">
                  <iframe
                    data-testid="embed-iframe"
                    src="https://open.spotify.com/embed/playlist/37i9dQZEVXbMZ5PAcNTDXd?utm_source=generator&theme=0"
                    width="100%"
                    height="352"
                    frameBorder="0"
                    allowFullScreen
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                    loading="lazy"
                  />
                </div>
              </div>

              {/* Embed 2: Acoustic Date Night */}
              <div className="rounded-3xl bg-slate-900/60 border border-white/10 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">Acoustic Date Night</span>
                  <span className="text-[10px] text-slate-400 uppercase font-mono">Romance</span>
                </div>
                <div className="rounded-2xl overflow-hidden border border-white/10 bg-black">
                  <iframe
                    data-testid="embed-iframe"
                    src="https://open.spotify.com/embed/playlist/37i9dQZF1DX7zqr9q1MPG7?utm_source=generator&theme=0"
                    width="100%"
                    height="352"
                    frameBorder="0"
                    allowFullScreen
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                    loading="lazy"
                  />
                </div>
              </div>

              {/* Embed 3: Podcast (Joe Rogan / Consciousness) */}
              <div className="rounded-3xl bg-slate-900/60 border border-white/10 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">Podcast: The Human Mind</span>
                  <span className="text-[10px] text-slate-400 uppercase font-mono">Episode</span>
                </div>
                <div className="rounded-2xl overflow-hidden border border-white/10 bg-black">
                  <iframe
                    data-testid="embed-iframe"
                    src="https://open.spotify.com/embed/episode/7makk4oTQel546B0PZlDM5?utm_source=generator&theme=0"
                    width="100%"
                    height="352"
                    frameBorder="0"
                    allowFullScreen
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                    loading="lazy"
                  />
                </div>
              </div>

              {/* Embed 4: Chill Lo-Fi Study */}
              <div className="rounded-3xl bg-slate-900/60 border border-white/10 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">Today's Chill Lo-Fi Study</span>
                  <span className="text-[10px] text-slate-400 uppercase font-mono">Ambient</span>
                </div>
                <div className="rounded-2xl overflow-hidden border border-white/10 bg-black">
                  <iframe
                    data-testid="embed-iframe"
                    src="https://open.spotify.com/embed/playlist/37i9dQZF1DXcBWIGoYBM5M?utm_source=generator&theme=0"
                    width="100%"
                    height="352"
                    frameBorder="0"
                    allowFullScreen
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                    loading="lazy"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SpotifyEmbedHubView;
