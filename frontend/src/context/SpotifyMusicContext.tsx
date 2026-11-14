import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';

export type SpotifyItemType = 'track' | 'playlist' | 'album' | 'episode' | 'show' | 'artist';

export interface SpotifyTrackInfo {
  id: string;
  type: SpotifyItemType;
  title: string;
  artist: string;
  album?: string;
  coverUrl?: string;
  spotifyUrl: string;
  embedUrl: string;
  durationSec: number;
  isCustomLinked: boolean;
}

export interface SpotifyPreset {
  id: string;
  type: SpotifyItemType;
  title: string;
  artist: string;
  category: string;
  coverUrl: string;
  spotifyUrl: string;
  embedUrl: string;
  description: string;
}

export const CURATED_SPOTIFY_PRESETS: SpotifyPreset[] = [
  {
    id: '37i9dQZF1DXcBWIGoYBM5M',
    type: 'playlist',
    title: 'Today\'s Chill Lo-Fi Study',
    artist: 'Spotify Editorial',
    category: 'Lo-Fi Sanctuary',
    coverUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=300&auto=format&fit=crop&q=80',
    spotifyUrl: 'https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M',
    embedUrl: 'https://open.spotify.com/embed/playlist/37i9dQZF1DXcBWIGoYBM5M?utm_source=generator&theme=0',
    description: 'Warm vinyl crackle, gentle Rhodes chords, and soothing hip hop rhythms.'
  },
  {
    id: '37i9dQZF1DXcBWIGoYBM5M',
    type: 'playlist',
    title: 'Today\'s Chill Lo-Fi Study',
    artist: 'Spotify Editorial',
    category: 'Lo-Fi Study',
    coverUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=300&auto=format&fit=crop&q=80',
    spotifyUrl: 'https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M',
    embedUrl: 'https://open.spotify.com/embed/playlist/37i9dQZF1DXcBWIGoYBM5M?utm_source=generator&theme=0',
    description: 'Warm vinyl crackle, gentle Rhodes chords, and soothing hip hop rhythms.'
  },
  {
    id: '37i9dQZF1DX4sWSpwq3LiO',
    type: 'playlist',
    title: 'Peaceful Piano & Dark Academia',
    artist: 'Einaudi, Arnalds & Jóhannsson',
    category: 'Neoclassical',
    coverUrl: 'https://images.unsplash.com/photo-1520523839898-50712702758f?w=300&auto=format&fit=crop&q=80',
    spotifyUrl: 'https://open.spotify.com/playlist/37i9dQZF1DX4sWSpwq3LiO',
    embedUrl: 'https://open.spotify.com/embed/playlist/37i9dQZF1DX4sWSpwq3LiO?utm_source=generator&theme=0',
    description: 'Reflective, minimalist piano pieces evoking quiet candlelit libraries.'
  },
  {
    id: '37i9dQZF1DXdLEN7aqioXM',
    type: 'playlist',
    title: 'Retro Synthwave & Neon Horizon',
    artist: 'Kavinsky, The Midnight & Gunship',
    category: 'Synthwave',
    coverUrl: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=300&auto=format&fit=crop&q=80',
    spotifyUrl: 'https://open.spotify.com/playlist/37i9dQZF1DXdLEN7aqioXM',
    embedUrl: 'https://open.spotify.com/embed/playlist/37i9dQZF1DXdLEN7aqioXM?utm_source=generator&theme=0',
    description: 'Driving analog synthesizers and cinematic night-driving soundscapes.'
  },
  {
    id: '37i9dQZF1DWZeKCadgRdKQ',
    type: 'playlist',
    title: 'Alpha Waves & Deep Focus',
    artist: 'Binaural Flow Laboratory',
    category: 'Binaural & Focus',
    coverUrl: 'https://images.unsplash.com/photo-1507499739999-097706ad8914?w=300&auto=format&fit=crop&q=80',
    spotifyUrl: 'https://open.spotify.com/playlist/37i9dQZF1DWZeKCadgRdKQ',
    embedUrl: 'https://open.spotify.com/embed/playlist/37i9dQZF1DWZeKCadgRdKQ?utm_source=generator&theme=0',
    description: 'Isochronic tones and soothing brown noise to encourage deep mental flow.'
  },
  {
    id: '37i9dQZEVXbMZ5PAcNTDXd',
    type: 'playlist',
    title: 'Top 50 - Global Anthems',
    artist: 'Spotify Global Charts',
    category: 'Trending Global',
    coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&auto=format&fit=crop&q=80',
    spotifyUrl: 'https://open.spotify.com/playlist/37i9dQZEVXbMZ5PAcNTDXd',
    embedUrl: 'https://open.spotify.com/embed/playlist/37i9dQZEVXbMZ5PAcNTDXd?utm_source=generator&theme=0',
    description: 'The most played tracks across the world right now.'
  },
  {
    id: '7makk4oTQel546B0PZlDM5',
    type: 'episode',
    title: 'Podcast 1: Exploring Human Consciousness',
    artist: 'Joe Rogan & Guests',
    category: 'Podcasts',
    coverUrl: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=300&auto=format&fit=crop&q=80',
    spotifyUrl: 'https://open.spotify.com/episode/7makk4oTQel546B0PZlDM5',
    embedUrl: 'https://open.spotify.com/embed/episode/7makk4oTQel546B0PZlDM5?utm_source=generator&theme=0',
    description: 'Deep discussions on human curiosity, science, and perspective.'
  },
  {
    id: '43cbJh4ccRD7lzM2730YK3',
    type: 'episode',
    title: 'Podcast 2: Psychology & Modern Relationships',
    artist: 'Relationship Intelligence',
    category: 'Podcasts',
    coverUrl: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=300&auto=format&fit=crop&q=80',
    spotifyUrl: 'https://open.spotify.com/episode/43cbJh4ccRD7lzM2730YK3',
    embedUrl: 'https://open.spotify.com/embed/episode/43cbJh4ccRD7lzM2730YK3?utm_source=generator&theme=0',
    description: 'Unpacking vulnerability, attachment styles, and honest connection.'
  },
  {
    id: '6I3ZzCxRhRkNqnQNo8AZPV',
    type: 'episode',
    title: 'Podcast 3: Midnight Philosophy & Love',
    artist: 'Soul Conversations',
    category: 'Podcasts',
    coverUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=300&auto=format&fit=crop&q=80',
    spotifyUrl: 'https://open.spotify.com/episode/6I3ZzCxRhRkNqnQNo8AZPV',
    embedUrl: 'https://open.spotify.com/embed/episode/6I3ZzCxRhRkNqnQNo8AZPV?utm_source=generator&theme=0',
    description: 'Late night reflections on emotional safety, fear of rejection, and self-acceptance.'
  },
  {
    id: '37i9dQZF1DX7zqr9q1MPG7',
    type: 'playlist',
    title: 'Acoustic Date Night',
    artist: 'Soulverse Editorial',
    category: 'Acoustic Romance',
    coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&auto=format&fit=crop&q=80',
    spotifyUrl: 'https://open.spotify.com/playlist/37i9dQZF1DX7zqr9q1MPG7',
    embedUrl: 'https://open.spotify.com/embed/playlist/37i9dQZF1DX7zqr9q1MPG7?utm_source=generator&theme=0',
    description: 'Warm acoustic melodies, soulful strings, and intimate coffeehouse sounds.'
  }
];

export function parseSpotifyUrl(input: string): { type: SpotifyItemType; id: string; embedUrl: string; spotifyUrl: string; spotifyUri: string } | null {
  if (!input || typeof input !== 'string') return null;
  const trimmed = input.trim();

  // 1. Spotify URI: spotify:track:xxx, spotify:playlist:xxx, spotify:episode:xxx, spotify:show:xxx, spotify:artist:xxx
  const uriMatch = trimmed.match(/^spotify:(track|playlist|album|episode|show|artist):([a-zA-Z0-9]{15,30})$/i);
  if (uriMatch) {
    const type = uriMatch[1].toLowerCase() as SpotifyItemType;
    const id = uriMatch[2];
    return {
      type,
      id,
      embedUrl: `https://open.spotify.com/embed/${type}/${id}?utm_source=generator&theme=0`,
      spotifyUrl: `https://open.spotify.com/${type}/${id}`,
      spotifyUri: `spotify:${type}:${id}`
    };
  }

  // 2. Spotify Web URL: https://open.spotify.com/(intl-[a-z]+/)?(track|playlist|album|episode|show|artist)/[a-zA-Z0-9]+
  const webMatch = trimmed.match(/open\.spotify\.com\/(?:intl-[a-z]+\/)?(track|playlist|album|episode|show|artist)\/([a-zA-Z0-9]+)/i);
  if (webMatch) {
    const type = webMatch[1].toLowerCase() as SpotifyItemType;
    const id = webMatch[2];
    return {
      type,
      id,
      embedUrl: `https://open.spotify.com/embed/${type}/${id}?utm_source=generator&theme=0`,
      spotifyUrl: `https://open.spotify.com/${type}/${id}`,
      spotifyUri: `spotify:${type}:${id}`
    };
  }

  // 3. Raw 22-character alphanumeric Spotify ID
  if (/^[a-zA-Z0-9]{22}$/.test(trimmed)) {
    return {
      type: 'track',
      id: trimmed,
      embedUrl: `https://open.spotify.com/embed/track/${trimmed}?utm_source=generator&theme=0`,
      spotifyUrl: `https://open.spotify.com/track/${trimmed}`,
      spotifyUri: `spotify:track:${trimmed}`
    };
  }

  return null;
}

export function toSpotifyUri(input: string): string | null {
  const parsed = parseSpotifyUrl(input);
  return parsed ? parsed.spotifyUri : null;
}

const STORAGE_KEY = 'soulverse_spotify_linked_music';

interface SpotifyMusicContextValue {
  track: SpotifyTrackInfo;
  isPlaying: boolean;
  volume: number;
  isMuted: boolean;
  currentTime: number;
  duration: number;
  isCustomLinked: boolean;
  isLinkModalOpen: boolean;
  isPlayerExpanded: boolean;
  isMiniDockVisible: boolean;
  activePresetIndex: number;
  togglePlay: () => void;
  play: () => void;
  pause: () => void;
  setVolume: (vol: number) => void;
  toggleMute: () => void;
  seekTo: (sec: number) => void;
  linkSpotify: (urlOrId: string, customTitle?: string, customArtist?: string) => boolean;
  unlinkSpotify: () => void;
  selectPreset: (presetIndex: number) => void;
  setIsLinkModalOpen: (open: boolean) => void;
  setIsPlayerExpanded: (expanded: boolean) => void;
  setIsMiniDockVisible: (visible: boolean) => void;
}

const SpotifyMusicContext = createContext<SpotifyMusicContextValue | undefined>(undefined);

export const SpotifyMusicProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [track, setTrack] = useState<SpotifyTrackInfo>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (
          parsed &&
          parsed.embedUrl &&
          !parsed.title?.toLowerCase().includes('nightcore') &&
          parsed.id !== '4cOdK2wGLETKBW3PvgPWqT'
        ) {
          return parsed;
        } else {
          // Permanently purge legacy Nightcore Dreams ambient data
          localStorage.removeItem(STORAGE_KEY);
        }
      }
    } catch {
      // fallback
    }
    const defaultPreset = CURATED_SPOTIFY_PRESETS[0];
    return {
      id: defaultPreset.id,
      type: defaultPreset.type,
      title: defaultPreset.title,
      artist: defaultPreset.artist,
      coverUrl: defaultPreset.coverUrl,
      spotifyUrl: defaultPreset.spotifyUrl,
      embedUrl: defaultPreset.embedUrl,
      durationSec: 215,
      isCustomLinked: false
    };
  });

  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolumeState] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [isPlayerExpanded, setIsPlayerExpanded] = useState(false);
  const [isMiniDockVisible, setIsMiniDockVisible] = useState(false);
  const [activePresetIndex, setActivePresetIndex] = useState(0);

  // Web Audio Synth for instant relaxation chord playback
  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const oscNodesRef = useRef<OscillatorNode[]>([]);
  const progressTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Initialize/start ambient audio synth
  const startAmbientSynth = useCallback(() => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx();
      }
      if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }

      // Clear existing
      oscNodesRef.current.forEach(osc => {
        try { osc.stop(); osc.disconnect(); } catch { /* noop */ }
      });
      oscNodesRef.current = [];

      const ctx = audioCtxRef.current;
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(isMuted ? 0 : volume * 0.12, ctx.currentTime);
      masterGain.connect(ctx.destination);
      gainNodeRef.current = masterGain;

      // Soft low-pass filter
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(420, ctx.currentTime);
      filter.connect(masterGain);

      // 432Hz ambient chord (A 216Hz, C# 270Hz, E 324Hz, G# 405Hz)
      const frequencies = [108, 162, 216, 270, 324];
      frequencies.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        const oscGain = ctx.createGain();
        oscGain.gain.setValueAtTime(0.04 / (idx + 1), ctx.currentTime);
        osc.connect(oscGain);
        oscGain.connect(filter);

        osc.start();
        oscNodesRef.current.push(osc);
      });
    } catch {
      // AudioContext may be restricted by browser policy before first interaction
    }
  }, [isMuted, volume]);

  const stopAmbientSynth = useCallback(() => {
    if (gainNodeRef.current && audioCtxRef.current) {
      try {
        gainNodeRef.current.gain.linearRampToValueAtTime(0.001, audioCtxRef.current.currentTime + 0.3);
      } catch {
        // noop
      }
    }
    setTimeout(() => {
      oscNodesRef.current.forEach(osc => {
        try { osc.stop(); osc.disconnect(); } catch { /* noop */ }
      });
      oscNodesRef.current = [];
    }, 350);
  }, []);

  // Sync volume with gain node
  useEffect(() => {
    if (gainNodeRef.current && audioCtxRef.current) {
      const targetGain = isMuted ? 0 : volume * 0.12;
      try {
        gainNodeRef.current.gain.setValueAtTime(targetGain, audioCtxRef.current.currentTime);
      } catch {
        // noop
      }
    }
  }, [volume, isMuted]);

  // Handle Play/Pause effect
  useEffect(() => {
    if (isPlaying) {
      startAmbientSynth();
      progressTimerRef.current = setInterval(() => {
        setCurrentTime(t => (t >= track.durationSec ? 0 : t + 1));
      }, 1000);
    } else {
      stopAmbientSynth();
      if (progressTimerRef.current) {
        clearInterval(progressTimerRef.current);
        progressTimerRef.current = null;
      }
    }

    return () => {
      if (progressTimerRef.current) {
        clearInterval(progressTimerRef.current);
      }
    };
  }, [isPlaying, track.durationSec, startAmbientSynth, stopAmbientSynth]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopAmbientSynth();
      if (audioCtxRef.current) {
        try { audioCtxRef.current.close(); } catch { /* noop */ }
      }
    };
  }, [stopAmbientSynth]);

  const togglePlay = useCallback(() => {
    setIsPlaying(prev => !prev);
  }, []);

  const play = useCallback(() => {
    setIsPlaying(true);
  }, []);

  const pause = useCallback(() => {
    setIsPlaying(false);
  }, []);

  const setVolume = useCallback((vol: number) => {
    const clamped = Math.max(0, Math.min(1, vol));
    setVolumeState(clamped);
    if (clamped > 0 && isMuted) {
      setIsMuted(false);
    }
  }, [isMuted]);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => !prev);
  }, []);

  const seekTo = useCallback((sec: number) => {
    const clamped = Math.max(0, Math.min(track.durationSec, sec));
    setCurrentTime(clamped);
  }, [track.durationSec]);

  const linkSpotify = useCallback((urlOrId: string, customTitle?: string, customArtist?: string): boolean => {
    const parsed = parseSpotifyUrl(urlOrId);
    if (!parsed) return false;

    const newTrack: SpotifyTrackInfo = {
      id: parsed.id,
      type: parsed.type,
      title: customTitle?.trim() || (parsed.type === 'playlist' ? 'My Spotify Playlist' : parsed.type === 'album' ? 'My Spotify Album' : 'My Linked Spotify Track'),
      artist: customArtist?.trim() || 'Linked via Spotify Account',
      spotifyUrl: parsed.spotifyUrl,
      embedUrl: parsed.embedUrl,
      durationSec: 240,
      isCustomLinked: true,
      coverUrl: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=300&auto=format&fit=crop&q=80'
    };

    setTrack(newTrack);
    setActivePresetIndex(-1);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newTrack));
    } catch {
      // storage quota or disabled
    }

    // Auto-play on successful linking
    setIsPlaying(true);
    return true;
  }, []);

  const unlinkSpotify = useCallback(() => {
    const defaultPreset = CURATED_SPOTIFY_PRESETS[0];
    const resetTrack: SpotifyTrackInfo = {
      id: defaultPreset.id,
      type: defaultPreset.type,
      title: defaultPreset.title,
      artist: defaultPreset.artist,
      coverUrl: defaultPreset.coverUrl,
      spotifyUrl: defaultPreset.spotifyUrl,
      embedUrl: defaultPreset.embedUrl,
      durationSec: 215,
      isCustomLinked: false
    };
    setTrack(resetTrack);
    setActivePresetIndex(0);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // noop
    }
  }, []);

  const selectPreset = useCallback((presetIndex: number) => {
    const preset = CURATED_SPOTIFY_PRESETS[presetIndex];
    if (!preset) return;
    const newTrack: SpotifyTrackInfo = {
      id: preset.id,
      type: preset.type,
      title: preset.title,
      artist: preset.artist,
      coverUrl: preset.coverUrl,
      spotifyUrl: preset.spotifyUrl,
      embedUrl: preset.embedUrl,
      durationSec: 210,
      isCustomLinked: false
    };
    setTrack(newTrack);
    setActivePresetIndex(presetIndex);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newTrack));
    } catch {
      // noop
    }
  }, []);

  const value: SpotifyMusicContextValue = {
    track,
    isPlaying,
    volume,
    isMuted,
    currentTime,
    duration: track.durationSec,
    isCustomLinked: track.isCustomLinked,
    isLinkModalOpen,
    isPlayerExpanded,
    isMiniDockVisible,
    activePresetIndex,
    togglePlay,
    play,
    pause,
    setVolume,
    toggleMute,
    seekTo,
    linkSpotify,
    unlinkSpotify,
    selectPreset,
    setIsLinkModalOpen,
    setIsPlayerExpanded,
    setIsMiniDockVisible
  };

  return (
    <SpotifyMusicContext.Provider value={value}>
      {children}
    </SpotifyMusicContext.Provider>
  );
};

export const useSpotifyMusic = (): SpotifyMusicContextValue => {
  const context = useContext(SpotifyMusicContext);
  if (!context) {
    throw new Error('useSpotifyMusic must be used within a SpotifyMusicProvider');
  }
  return context;
};
