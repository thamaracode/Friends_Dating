export interface SocialPlatformConfig {
  id: string;
  name: string;
  category: 'social' | 'gaming' | 'professional' | 'creator' | 'code' | 'music' | 'writing' | 'web';
  domains: string[];
  color: string;
  badgeBg: string;
  iconName: string;
  parseProfile: (url: URL) => {
    isValidProfile: boolean;
    username?: string;
    canonicalUrl?: string;
    error?: string;
  };
}

// Helper to clean path segments
function getPathSegments(pathname: string): string[] {
  return pathname.split('/').filter(Boolean);
}

export const PLATFORM_REGISTRY: Record<string, SocialPlatformConfig> = {
  instagram: {
    id: 'instagram',
    name: 'Instagram',
    category: 'social',
    domains: ['instagram.com', 'www.instagram.com', 'instagr.am'],
    color: '#E1306C',
    badgeBg: 'rgba(225, 48, 108, 0.15)',
    iconName: 'Instagram',
    parseProfile: (url) => {
      const segments = getPathSegments(url.pathname);
      if (segments.length === 0) return { isValidProfile: false, error: 'Empty Instagram profile path' };
      const invalid = ['p', 'reel', 'reels', 'stories', 'explore', 'direct', 'accounts', 'developer'];
      const first = segments[0].toLowerCase();
      if (invalid.includes(first)) return { isValidProfile: false, error: 'Route is not a user profile' };
      const username = segments[0].replace('@', '');
      return {
        isValidProfile: true,
        username,
        canonicalUrl: `https://instagram.com/${username}`
      };
    }
  },
  github: {
    id: 'github',
    name: 'GitHub',
    category: 'code',
    domains: ['github.com', 'www.github.com'],
    color: '#F0F6FC',
    badgeBg: 'rgba(240, 246, 252, 0.15)',
    iconName: 'Github',
    parseProfile: (url) => {
      const segments = getPathSegments(url.pathname);
      if (segments.length === 0) return { isValidProfile: false, error: 'Empty GitHub path' };
      const invalid = ['settings', 'explore', 'topics', 'trending', 'collections', 'events', 'features', 'enterprise', 'pricing', 'login', 'signup', 'orgs'];
      const first = segments[0].toLowerCase();
      if (invalid.includes(first)) return { isValidProfile: false, error: 'Route is not a user profile' };
      const username = segments[0];
      return {
        isValidProfile: true,
        username,
        canonicalUrl: `https://github.com/${username}`
      };
    }
  },
  x: {
    id: 'x',
    name: 'X (Twitter)',
    category: 'social',
    domains: ['x.com', 'www.x.com', 'twitter.com', 'www.twitter.com'],
    color: '#1DA1F2',
    badgeBg: 'rgba(29, 161, 242, 0.15)',
    iconName: 'Twitter',
    parseProfile: (url) => {
      const segments = getPathSegments(url.pathname);
      if (segments.length === 0) return { isValidProfile: false, error: 'Empty X / Twitter path' };
      const invalid = ['home', 'explore', 'notifications', 'messages', 'settings', 'i', 'compose'];
      const first = segments[0].toLowerCase();
      if (invalid.includes(first)) return { isValidProfile: false, error: 'Route is not a user profile' };
      const username = segments[0].replace('@', '');
      return {
        isValidProfile: true,
        username,
        canonicalUrl: `https://x.com/${username}`
      };
    }
  },
  linkedin: {
    id: 'linkedin',
    name: 'LinkedIn',
    category: 'professional',
    domains: ['linkedin.com', 'www.linkedin.com'],
    color: '#0A66C2',
    badgeBg: 'rgba(10, 102, 194, 0.15)',
    iconName: 'Linkedin',
    parseProfile: (url) => {
      const segments = getPathSegments(url.pathname);
      if (segments.length >= 2 && segments[0].toLowerCase() === 'in') {
        const username = segments[1];
        return {
          isValidProfile: true,
          username,
          canonicalUrl: `https://linkedin.com/in/${username}`
        };
      }
      return { isValidProfile: false, error: 'LinkedIn profile URL must follow /in/{username} pattern' };
    }
  },
  discord: {
    id: 'discord',
    name: 'Discord',
    category: 'gaming',
    domains: ['discord.gg', 'discord.com'],
    color: '#5865F2',
    badgeBg: 'rgba(88, 101, 242, 0.15)',
    iconName: 'MessageSquare',
    parseProfile: (url) => {
      const segments = getPathSegments(url.pathname);
      if (url.hostname.includes('discord.gg') && segments.length >= 1) {
        return {
          isValidProfile: true,
          username: segments[0],
          canonicalUrl: `https://discord.gg/${segments[0]}`
        };
      }
      if (segments.length >= 2 && segments[0].toLowerCase() === 'users') {
        return {
          isValidProfile: true,
          username: segments[1],
          canonicalUrl: `https://discord.com/users/${segments[1]}`
        };
      }
      return {
        isValidProfile: true,
        username: segments[0] || 'Community',
        canonicalUrl: url.toString()
      };
    }
  },
  spotify: {
    id: 'spotify',
    name: 'Spotify',
    category: 'music',
    domains: ['open.spotify.com', 'spotify.com'],
    color: '#1DB954',
    badgeBg: 'rgba(29, 185, 84, 0.15)',
    iconName: 'Music',
    parseProfile: (url) => {
      const segments = getPathSegments(url.pathname);
      if (segments.length >= 2 && segments[0].toLowerCase() === 'user') {
        return {
          isValidProfile: true,
          username: segments[1],
          canonicalUrl: `https://open.spotify.com/user/${segments[1]}`
        };
      }
      if (segments.length >= 2 && segments[0].toLowerCase() === 'artist') {
        return {
          isValidProfile: true,
          username: `Artist: ${segments[1]}`,
          canonicalUrl: `https://open.spotify.com/artist/${segments[1]}`
        };
      }
      return { isValidProfile: false, error: 'Spotify profile must be /user/{id} or /artist/{id}' };
    }
  },
  steam: {
    id: 'steam',
    name: 'Steam',
    category: 'gaming',
    domains: ['steamcommunity.com'],
    color: '#66C0F4',
    badgeBg: 'rgba(102, 192, 244, 0.15)',
    iconName: 'Gamepad2',
    parseProfile: (url) => {
      const segments = getPathSegments(url.pathname);
      if (segments.length >= 2 && (segments[0].toLowerCase() === 'id' || segments[0].toLowerCase() === 'profiles')) {
        return {
          isValidProfile: true,
          username: segments[1],
          canonicalUrl: `https://steamcommunity.com/${segments[0]}/${segments[1]}`
        };
      }
      return { isValidProfile: false, error: 'Steam profile must follow /id/{customId} or /profiles/{steamId}' };
    }
  },
  youtube: {
    id: 'youtube',
    name: 'YouTube',
    category: 'creator',
    domains: ['youtube.com', 'www.youtube.com', 'youtu.be'],
    color: '#FF0000',
    badgeBg: 'rgba(255, 0, 0, 0.15)',
    iconName: 'Youtube',
    parseProfile: (url) => {
      const segments = getPathSegments(url.pathname);
      if (segments.length === 0) return { isValidProfile: false, error: 'Empty YouTube path' };
      const invalid = ['watch', 'feed', 'gaming', 'premium', 'playlist', 'shorts'];
      const first = segments[0].toLowerCase();
      if (invalid.includes(first)) return { isValidProfile: false, error: 'Route is not a channel or user profile' };
      const username = segments[0].startsWith('@') ? segments[0] : (segments.length >= 2 && (first === 'c' || first === 'user') ? segments[1] : segments[0]);
      return {
        isValidProfile: true,
        username,
        canonicalUrl: `https://youtube.com/${username}`
      };
    }
  },
  tiktok: {
    id: 'tiktok',
    name: 'TikTok',
    category: 'creator',
    domains: ['tiktok.com', 'www.tiktok.com'],
    color: '#00F2FE',
    badgeBg: 'rgba(0, 242, 254, 0.15)',
    iconName: 'Video',
    parseProfile: (url) => {
      const segments = getPathSegments(url.pathname);
      if (segments.length === 0) return { isValidProfile: false, error: 'Empty TikTok path' };
      const username = segments[0].startsWith('@') ? segments[0] : `@${segments[0]}`;
      return {
        isValidProfile: true,
        username,
        canonicalUrl: `https://tiktok.com/${username}`
      };
    }
  },
  threads: {
    id: 'threads',
    name: 'Threads',
    category: 'social',
    domains: ['threads.net', 'www.threads.net'],
    color: '#FFFFFF',
    badgeBg: 'rgba(255, 255, 255, 0.15)',
    iconName: 'AtSign',
    parseProfile: (url) => {
      const segments = getPathSegments(url.pathname);
      if (segments.length === 0) return { isValidProfile: false, error: 'Empty Threads path' };
      const username = segments[0].replace('@', '');
      return {
        isValidProfile: true,
        username: `@${username}`,
        canonicalUrl: `https://threads.net/@${username}`
      };
    }
  },
  reddit: {
    id: 'reddit',
    name: 'Reddit',
    category: 'social',
    domains: ['reddit.com', 'www.reddit.com'],
    color: '#FF4500',
    badgeBg: 'rgba(255, 69, 0, 0.15)',
    iconName: 'Radio',
    parseProfile: (url) => {
      const segments = getPathSegments(url.pathname);
      if (segments.length >= 2 && (segments[0].toLowerCase() === 'user' || segments[0].toLowerCase() === 'u')) {
        return {
          isValidProfile: true,
          username: `u/${segments[1]}`,
          canonicalUrl: `https://reddit.com/user/${segments[1]}`
        };
      }
      return { isValidProfile: false, error: 'Reddit profile must be /user/{username}' };
    }
  },
  twitch: {
    id: 'twitch',
    name: 'Twitch',
    category: 'creator',
    domains: ['twitch.tv', 'www.twitch.tv'],
    color: '#9146FF',
    badgeBg: 'rgba(145, 70, 255, 0.15)',
    iconName: 'Tv',
    parseProfile: (url) => {
      const segments = getPathSegments(url.pathname);
      if (segments.length === 0) return { isValidProfile: false, error: 'Empty Twitch path' };
      const invalid = ['directory', 'videos', 'p', 'settings', 'subscriptions'];
      const first = segments[0].toLowerCase();
      if (invalid.includes(first)) return { isValidProfile: false, error: 'Route is not a streamer profile' };
      return {
        isValidProfile: true,
        username: segments[0],
        canonicalUrl: `https://twitch.tv/${segments[0]}`
      };
    }
  },
  telegram: {
    id: 'telegram',
    name: 'Telegram',
    category: 'social',
    domains: ['t.me', 'telegram.me'],
    color: '#2AABEE',
    badgeBg: 'rgba(42, 171, 238, 0.15)',
    iconName: 'Send',
    parseProfile: (url) => {
      const segments = getPathSegments(url.pathname);
      if (segments.length === 0) return { isValidProfile: false, error: 'Empty Telegram link' };
      const username = segments[0].replace('@', '');
      return {
        isValidProfile: true,
        username: `@${username}`,
        canonicalUrl: `https://t.me/${username}`
      };
    }
  },
  bluesky: {
    id: 'bluesky',
    name: 'Bluesky',
    category: 'social',
    domains: ['bsky.app'],
    color: '#0085FF',
    badgeBg: 'rgba(0, 133, 255, 0.15)',
    iconName: 'Cloud',
    parseProfile: (url) => {
      const segments = getPathSegments(url.pathname);
      if (segments.length >= 2 && segments[0].toLowerCase() === 'profile') {
        return {
          isValidProfile: true,
          username: segments[1],
          canonicalUrl: `https://bsky.app/profile/${segments[1]}`
        };
      }
      return { isValidProfile: false, error: 'Bluesky profile must be /profile/{handle}' };
    }
  },
  dribbble: {
    id: 'dribbble',
    name: 'Dribbble',
    category: 'creator',
    domains: ['dribbble.com'],
    color: '#EA4C89',
    badgeBg: 'rgba(234, 76, 137, 0.15)',
    iconName: 'Dribbble',
    parseProfile: (url) => {
      const segments = getPathSegments(url.pathname);
      if (segments.length === 0) return { isValidProfile: false, error: 'Empty Dribbble path' };
      return {
        isValidProfile: true,
        username: segments[0],
        canonicalUrl: `https://dribbble.com/${segments[0]}`
      };
    }
  },
  behance: {
    id: 'behance',
    name: 'Behance',
    category: 'creator',
    domains: ['behance.net', 'www.behance.net'],
    color: '#1769FF',
    badgeBg: 'rgba(23, 105, 255, 0.15)',
    iconName: 'Palette',
    parseProfile: (url) => {
      const segments = getPathSegments(url.pathname);
      if (segments.length === 0) return { isValidProfile: false, error: 'Empty Behance path' };
      return {
        isValidProfile: true,
        username: segments[0],
        canonicalUrl: `https://behance.net/${segments[0]}`
      };
    }
  },
  medium: {
    id: 'medium',
    name: 'Medium',
    category: 'writing',
    domains: ['medium.com'],
    color: '#00AB6C',
    badgeBg: 'rgba(0, 171, 108, 0.15)',
    iconName: 'BookOpen',
    parseProfile: (url) => {
      const segments = getPathSegments(url.pathname);
      if (segments.length === 0) return { isValidProfile: false, error: 'Empty Medium path' };
      return {
        isValidProfile: true,
        username: segments[0],
        canonicalUrl: `https://medium.com/${segments[0]}`
      };
    }
  },
  substack: {
    id: 'substack',
    name: 'Substack',
    category: 'writing',
    domains: ['substack.com'],
    color: '#FF6719',
    badgeBg: 'rgba(255, 103, 25, 0.15)',
    iconName: 'FileText',
    parseProfile: (url) => {
      if (url.hostname.endsWith('.substack.com')) {
        const subdomain = url.hostname.replace('.substack.com', '');
        return {
          isValidProfile: true,
          username: subdomain,
          canonicalUrl: `https://${subdomain}.substack.com`
        };
      }
      const segments = getPathSegments(url.pathname);
      return {
        isValidProfile: true,
        username: segments[0] || 'Publication',
        canonicalUrl: url.toString()
      };
    }
  }
};

export function recognizeSocialUrl(rawUrl: string): {
  success: boolean;
  platformId: string;
  platformName: string;
  category: string;
  color: string;
  badgeBg: string;
  iconName: string;
  hostname: string;
  username: string;
  canonicalUrl: string;
  error?: string;
} {
  let parsed: URL;
  try {
    let clean = rawUrl.trim();
    if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
      clean = `https://${clean}`;
    }
    parsed = new URL(clean);
  } catch (e) {
    return {
      success: false,
      platformId: 'custom',
      platformName: 'Custom Website',
      category: 'web',
      color: '#FF4F87',
      badgeBg: 'rgba(255, 79, 135, 0.15)',
      iconName: 'Globe',
      hostname: '',
      username: '',
      canonicalUrl: '',
      error: 'Invalid URL format'
    };
  }

  // Security check: Only http and https permitted (no javascript:, data:, file:)
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return {
      success: false,
      platformId: 'custom',
      platformName: 'Custom Website',
      category: 'web',
      color: '#FF4F87',
      badgeBg: 'rgba(255, 79, 135, 0.15)',
      iconName: 'Globe',
      hostname: parsed.hostname,
      username: '',
      canonicalUrl: '',
      error: 'Dangerous or unsupported URL protocol'
    };
  }

  const hostname = parsed.hostname.toLowerCase();

  // Search registry
  for (const config of Object.values(PLATFORM_REGISTRY)) {
    if (config.domains.some(d => hostname === d || hostname.endsWith(`.${d}`))) {
      const result = config.parseProfile(parsed);
      if (!result.isValidProfile) {
        return {
          success: false,
          platformId: config.id,
          platformName: config.name,
          category: config.category,
          color: config.color,
          badgeBg: config.badgeBg,
          iconName: config.iconName,
          hostname,
          username: '',
          canonicalUrl: '',
          error: result.error || 'Invalid profile route for platform'
        };
      }

      return {
        success: true,
        platformId: config.id,
        platformName: config.name,
        category: config.category,
        color: config.color,
        badgeBg: config.badgeBg,
        iconName: config.iconName,
        hostname,
        username: result.username || '',
        canonicalUrl: result.canonicalUrl || parsed.toString()
      };
    }
  }

  // Fallback to verified Custom Website
  const cleanPath = parsed.pathname === '/' ? '' : parsed.pathname;
  return {
    success: true,
    platformId: 'custom',
    platformName: hostname.replace('www.', ''),
    category: 'web',
    color: '#FF4F87',
    badgeBg: 'rgba(255, 79, 135, 0.15)',
    iconName: 'Globe',
    hostname,
    username: hostname,
    canonicalUrl: `${parsed.protocol}//${parsed.hostname}${cleanPath}`
  };
}
