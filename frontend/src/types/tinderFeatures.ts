// Soulverse Dating & Discovery Intelligence
// Adapted from modern connection & discovery patterns (Essentials, Prompts, Anthem, Advanced Settings)

export interface ProfileEssentials {
  heightCm: number;
  job: string;
  schoolOrCompany: string;
  location: string;
  hometown: string;
  zodiac: string;
  education: string;
  languages: string[];
}

export interface ProfileLifestyle {
  lookingFor: string;
  lookingForEmoji: string;
  communicationStyle: string;
  phoneHabit: string;
  loveStyle: string;
  pets: string;
  drinking: string;
  smoking: string;
  workout: string;
  familyPlans: string;
}

export interface ProfilePrompts {
  greenFlag: string;
  perksOfDating: string;
  receivePreference: string;
  phoneAlways: string;
  weekendsFor: string;
  saturdayNight: string;
  typicalSunday: string;
}

export interface SpotifyAnthem {
  trackId: string;
  title: string;
  artist: string;
  album: string;
  coverUrl: string;
  spotifyUrl: string;
  embedUrl: string;
}

export interface FullUserAttributes {
  essentials: ProfileEssentials;
  lifestyle: ProfileLifestyle;
  prompts: ProfilePrompts;
  anthem: SpotifyAnthem;
  completionPercentage: number;
}

export interface DiscoverySettings {
  locationName: string;
  maxDistanceKm: number;
  onlyShowInDistanceRange: boolean;
  lookingForGender: 'Women' | 'Men' | 'Everyone' | 'Soul Connections';
  minAge: number;
  maxAge: number;
  onlyShowInAgeRange: boolean;
  globalMode: boolean;
  minPhotos: number;
  preferredLanguages: string[];
}

export interface VisibilitySettings {
  mode: 'standard' | 'incognito';
  enableDiscovery: boolean;
  recentlyActiveStatus: boolean;
  blockedContacts: Array<{ id: string; name: string; contactInfo: string }>;
  messageControls: 'everyone' | 'verified_only' | 'matches_only';
  claimedUsername: string;
}

export interface AccountPreferences {
  email: string;
  phoneNumber: string;
  subscriptionTier: 'free' | 'plus' | 'sanctuary';
  theme: 'system' | 'dark' | 'light';
  distanceUnit: 'km' | 'mi';
  keyboardShortcuts: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
  quietHoursEnabled: boolean;
}

export const DEFAULT_USER_ATTRIBUTES: FullUserAttributes = {
  essentials: {
    heightCm: 187,
    job: 'Computer Science Student',
    schoolOrCompany: 'University of Colombo',
    location: 'Colombo, Sri Lanka',
    hometown: 'Kandy',
    zodiac: '♒ Aquarius',
    education: 'BSc in Computer Science',
    languages: ['English', 'Sinhala']
  },
  lifestyle: {
    lookingFor: 'Still figuring it out',
    lookingForEmoji: '🧐',
    communicationStyle: 'Big time texter & late night voice notes',
    phoneHabit: 'Fully charged',
    loveStyle: 'Words of affirmation & Quality time',
    pets: 'Dog lover & Cat friendly',
    drinking: 'Socially on weekends',
    smoking: 'Non-smoker',
    workout: 'Often (4x/week)',
    familyPlans: 'Open to kids in the future'
  },
  prompts: {
    greenFlag: 'I always remember the small details about what people tell me.',
    perksOfDating: 'I will listen to you talk about your day for hours, make late-night playlists, and bring warm tea.',
    receivePreference: 'text messages',
    phoneAlways: 'fully charged',
    weekendsFor: 'recharging',
    saturdayNight: 'cozy nights in',
    typicalSunday: 'self-care'
  },
  anthem: {
    trackId: '4cOdK2wGLETKBW3PvgPWqT',
    title: 'Until I Found You (with Em Beihold)',
    artist: 'Stephen Sanchez, Em Beihold',
    album: 'Until I Found You (Em Beihold Version)',
    coverUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=300&auto=format&fit=crop&q=80',
    spotifyUrl: 'https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT',
    embedUrl: 'https://open.spotify.com/embed/track/4cOdK2wGLETKBW3PvgPWqT?utm_source=generator&theme=0'
  },
  completionPercentage: 73
};

export const DEFAULT_DISCOVERY_SETTINGS: DiscoverySettings = {
  locationName: 'Colombo, Sri Lanka',
  maxDistanceKm: 161,
  onlyShowInDistanceRange: false,
  lookingForGender: 'Women',
  minAge: 18,
  maxAge: 100,
  onlyShowInAgeRange: false,
  globalMode: true,
  minPhotos: 1,
  preferredLanguages: ['English', 'Sinhala']
};

export const DEFAULT_VISIBILITY_SETTINGS: VisibilitySettings = {
  mode: 'standard',
  enableDiscovery: true,
  recentlyActiveStatus: true,
  blockedContacts: [
    { id: 'blk_1', name: 'Ex-Colleague (Mark)', contactInfo: '+94 77 123 4567' },
    { id: 'blk_2', name: 'Old Acquaintance', contactInfo: 'contact@workplace.com' }
  ],
  messageControls: 'everyone',
  claimedUsername: 'thamara'
};

export const DEFAULT_ACCOUNT_PREFERENCES: AccountPreferences = {
  email: 'thamara.k@gmail.com',
  phoneNumber: '+94 71 892 4410',
  subscriptionTier: 'sanctuary',
  theme: 'dark',
  distanceUnit: 'km',
  keyboardShortcuts: true,
  emailNotifications: true,
  pushNotifications: true,
  quietHoursEnabled: true
};

export const ATTRIBUTES_STORAGE_KEY = 'soulverse_user_profile_attributes';
export const DISCOVERY_STORAGE_KEY = 'soulverse_discovery_settings';
export const VISIBILITY_STORAGE_KEY = 'soulverse_visibility_settings';
export const ACCOUNT_STORAGE_KEY = 'soulverse_account_preferences';

export function loadUserAttributes(): FullUserAttributes {
  try {
    const raw = localStorage.getItem(ATTRIBUTES_STORAGE_KEY);
    if (raw) return { ...DEFAULT_USER_ATTRIBUTES, ...JSON.parse(raw) };
  } catch { /* noop */ }
  return DEFAULT_USER_ATTRIBUTES;
}

export function saveUserAttributes(attrs: FullUserAttributes): void {
  try {
    localStorage.setItem(ATTRIBUTES_STORAGE_KEY, JSON.stringify(attrs));
  } catch { /* noop */ }
}

export function loadDiscoverySettings(): DiscoverySettings {
  try {
    const raw = localStorage.getItem(DISCOVERY_STORAGE_KEY);
    if (raw) return { ...DEFAULT_DISCOVERY_SETTINGS, ...JSON.parse(raw) };
  } catch { /* noop */ }
  return DEFAULT_DISCOVERY_SETTINGS;
}

export function saveDiscoverySettings(settings: DiscoverySettings): void {
  try {
    localStorage.setItem(DISCOVERY_STORAGE_KEY, JSON.stringify(settings));
  } catch { /* noop */ }
}

export function loadVisibilitySettings(): VisibilitySettings {
  try {
    const raw = localStorage.getItem(VISIBILITY_STORAGE_KEY);
    if (raw) return { ...DEFAULT_VISIBILITY_SETTINGS, ...JSON.parse(raw) };
  } catch { /* noop */ }
  return DEFAULT_VISIBILITY_SETTINGS;
}

export function saveVisibilitySettings(settings: VisibilitySettings): void {
  try {
    localStorage.setItem(VISIBILITY_STORAGE_KEY, JSON.stringify(settings));
  } catch { /* noop */ }
}

export function loadAccountPreferences(): AccountPreferences {
  try {
    const raw = localStorage.getItem(ACCOUNT_STORAGE_KEY);
    if (raw) return { ...DEFAULT_ACCOUNT_PREFERENCES, ...JSON.parse(raw) };
  } catch { /* noop */ }
  return DEFAULT_ACCOUNT_PREFERENCES;
}

export function saveAccountPreferences(prefs: AccountPreferences): void {
  try {
    localStorage.setItem(ACCOUNT_STORAGE_KEY, JSON.stringify(prefs));
  } catch { /* noop */ }
}
