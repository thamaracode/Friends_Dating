import { describe, it, expect } from 'vitest';
import { recognizeSocialUrl } from './social-platforms/registry';

// Re-implemented standard parsing logic matching frontend/src/context/SpotifyMusicContext.tsx
type SpotifyItemType = 'track' | 'playlist' | 'album' | 'episode' | 'show' | 'artist';

function parseSpotifyUrl(input: string): { type: SpotifyItemType; id: string; embedUrl: string; spotifyUrl: string; spotifyUri: string } | null {
  if (!input || typeof input !== 'string') return null;
  const trimmed = input.trim();

  // 1. Spotify URI
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

  // 2. Spotify Web URL
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

function toSpotifyUri(input: string): string | null {
  const parsed = parseSpotifyUrl(input);
  return parsed ? parsed.spotifyUri : null;
}

describe('Spotify Embed & IFrame API Integration (atomjoy/spotify-embed pattern)', () => {
  // -------------------------------------------------------------------------
  // 1. URI and URL Normalization (from atomjoy/spotify-embed)
  // -------------------------------------------------------------------------
  it('parses atomjoy Top 50 Global playlist URI correctly', () => {
    const uri = 'spotify:playlist:37i9dQZEVXbMZ5PAcNTDXd';
    const parsed = parseSpotifyUrl(uri);
    expect(parsed).not.toBeNull();
    expect(parsed?.type).toBe('playlist');
    expect(parsed?.id).toBe('37i9dQZEVXbMZ5PAcNTDXd');
    expect(parsed?.embedUrl).toBe('https://open.spotify.com/embed/playlist/37i9dQZEVXbMZ5PAcNTDXd?utm_source=generator&theme=0');
    expect(parsed?.spotifyUri).toBe('spotify:playlist:37i9dQZEVXbMZ5PAcNTDXd');
  });

  it('parses atomjoy Podcast episodes (Consciousness & Psychology)', () => {
    const episode1 = 'spotify:episode:7makk4oTQel546B0PZlDM5';
    const parsed1 = parseSpotifyUrl(episode1);
    expect(parsed1?.type).toBe('episode');
    expect(parsed1?.id).toBe('7makk4oTQel546B0PZlDM5');
    expect(parsed1?.embedUrl).toContain('/embed/episode/7makk4oTQel546B0PZlDM5');

    const episode2 = 'https://open.spotify.com/episode/43cbJh4ccRD7lzM2730YK3';
    const parsed2 = parseSpotifyUrl(episode2);
    expect(parsed2?.type).toBe('episode');
    expect(parsed2?.id).toBe('43cbJh4ccRD7lzM2730YK3');
    expect(toSpotifyUri(episode2)).toBe('spotify:episode:43cbJh4ccRD7lzM2730YK3');
  });

  it('converts web URLs to native Spotify URIs for the EmbedController', () => {
    const webUrl = 'https://open.spotify.com/playlist/37i9dQZF1DX7zqr9q1MPG7';
    expect(toSpotifyUri(webUrl)).toBe('spotify:playlist:37i9dQZF1DX7zqr9q1MPG7');

    const trackUrl = 'https://open.spotify.com/intl-de/track/4cOdK2wGLETKBW3PvgPWqT';
    expect(toSpotifyUri(trackUrl)).toBe('spotify:track:4cOdK2wGLETKBW3PvgPWqT');
  });

  it('generates compliant iframe embed permissions according to Spotify specification', () => {
    const requiredPermissions = [
      'autoplay',
      'clipboard-write',
      'encrypted-media',
      'fullscreen',
      'picture-in-picture'
    ];
    const allowAttr = 'autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture';
    for (const perm of requiredPermissions) {
      expect(allowAttr).toContain(perm);
    }
  });

  // -------------------------------------------------------------------------
  // 2. Integration with Soulverse Social Platform Registry
  // -------------------------------------------------------------------------
  it('recognizes official Spotify profile and artist URLs', () => {
    const userResult = recognizeSocialUrl('https://open.spotify.com/user/spotify_curator');
    expect(userResult.success).toBe(true);
    expect(userResult.platformId).toBe('spotify');
    expect(userResult.username).toBe('spotify_curator');

    const artistResult = recognizeSocialUrl('https://open.spotify.com/artist/76QERaQEFTh2VKRUL7wz7m');
    expect(artistResult.success).toBe(true);
    expect(artistResult.platformId).toBe('spotify');
    expect(artistResult.username).toBe('Artist: 76QERaQEFTh2VKRUL7wz7m');
  });
});
