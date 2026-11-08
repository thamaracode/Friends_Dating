import type { UniversalDirectoryService } from './types';

export const UNIVERSAL_DIRECTORY_SERVICES: UniversalDirectoryService[] = [
  // 1. Sign-in and Identity Providers
  {
    id: 'srv_google',
    name: 'Google',
    category: 'sign_in_identity',
    categoryLabel: 'Sign-in & Identity',
    capabilities: ['A_sign_in', 'B_account_link', 'C_data_import'],
    potentialUse: 'Single sign-on, profile name/picture, voluntary Google Contacts and Calendar sync.',
    apiLimitationNote: 'Basic OpenID Connect provides identity claims. Contacts/Calendar require separate incremental OAuth consent.',
    iconType: 'Globe',
    officialUrl: 'https://developers.google.com/identity',
    isPopular: true
  },
  {
    id: 'srv_apple',
    name: 'Apple',
    category: 'sign_in_identity',
    categoryLabel: 'Sign-in & Identity',
    capabilities: ['A_sign_in', 'B_account_link'],
    potentialUse: 'Sign in with Apple, Private Relay email generation, secure biometric authentication.',
    apiLimitationNote: 'Privacy-first token exchange; Apple hides real email when user chooses Private Relay.',
    iconType: 'Lock',
    officialUrl: 'https://developer.apple.com/sign-in-with-apple/',
    isPopular: true
  },
  {
    id: 'srv_facebook',
    name: 'Facebook',
    category: 'sign_in_identity',
    categoryLabel: 'Sign-in & Identity',
    capabilities: ['A_sign_in', 'B_account_link', 'C_data_import', 'D_sharing_deep_link'],
    potentialUse: 'Login authentication, public profile link, permitted public profile data.',
    apiLimitationNote: 'Meta permissions strictly audited; friend lists and private groups are not accessible.',
    iconType: 'Globe',
    officialUrl: 'https://developers.facebook.com',
    isPopular: true
  },
  {
    id: 'srv_microsoft',
    name: 'Microsoft',
    category: 'sign_in_identity',
    categoryLabel: 'Sign-in & Identity',
    capabilities: ['A_sign_in', 'B_account_link', 'C_data_import'],
    potentialUse: 'Microsoft personal/work login, Outlook calendar coordination, Teams link.',
    apiLimitationNote: 'Microsoft Graph requires specific tenant and scope approvals.',
    iconType: 'Globe',
    officialUrl: 'https://learn.microsoft.com/entra/identity-platform/',
    isPopular: true
  },
  {
    id: 'srv_linkedin',
    name: 'LinkedIn',
    category: 'sign_in_identity',
    categoryLabel: 'Sign-in & Identity',
    capabilities: ['A_sign_in', 'B_account_link', 'C_data_import'],
    potentialUse: 'OIDC basic sign-in, professional bio, university and career verification.',
    apiLimitationNote: 'Basic OIDC does not certify criminal or safety background. Full employment import requires approved partner tier.',
    iconType: 'Briefcase',
    officialUrl: 'https://learn.microsoft.com/linkedin/consumer/integrations/self-serve/sign-in-with-linkedin-v2',
    isPopular: true
  },
  {
    id: 'srv_github',
    name: 'GitHub',
    category: 'sign_in_identity',
    categoryLabel: 'Sign-in & Identity',
    capabilities: ['A_sign_in', 'B_account_link', 'C_data_import'],
    potentialUse: 'Developer authentication, public repositories, language expertise claims.',
    apiLimitationNote: 'Accesses public contributions and profile fields; private repositories excluded.',
    iconType: 'Globe',
    officialUrl: 'https://docs.github.com/apps/oauth-apps',
    isPopular: true
  },
  {
    id: 'srv_discord',
    name: 'Discord',
    category: 'sign_in_identity',
    categoryLabel: 'Sign-in & Identity',
    capabilities: ['A_sign_in', 'B_account_link', 'D_sharing_deep_link'],
    potentialUse: 'Gamer/community identity, public handle display, voice lounge coordination.',
    apiLimitationNote: 'OAuth identify scope provides username and avatar; does not read private DMs or guild chats.',
    iconType: 'Gamepad2',
    officialUrl: 'https://discord.com/developers/docs/topics/oauth2',
    isPopular: true
  },

  // 2. Social Media & Content Platforms
  {
    id: 'srv_instagram',
    name: 'Instagram',
    category: 'social_media',
    categoryLabel: 'Social Media & Content',
    capabilities: ['B_account_link', 'D_sharing_deep_link'],
    potentialUse: 'Display verified public profile link, 1-touch export of FRIENDS story identity cards.',
    apiLimitationNote: 'Meta Instagram Basic Display API has restricted scope. Does not allow scraping private followers.',
    iconType: 'Camera',
    officialUrl: 'https://developers.facebook.com/docs/instagram-basic-display-api',
    isPopular: true
  },
  {
    id: 'srv_tiktok',
    name: 'TikTok',
    category: 'social_media',
    categoryLabel: 'Social Media & Content',
    capabilities: ['B_account_link', 'D_sharing_deep_link'],
    potentialUse: 'Public creator profile link, video portfolio sharing, event video teasers.',
    apiLimitationNote: 'Display of public creator link; private feed and direct messages are strictly protected.',
    iconType: 'Video',
    officialUrl: 'https://developers.tiktok.com',
    isPopular: true
  },
  {
    id: 'srv_x',
    name: 'X (Twitter)',
    category: 'social_media',
    categoryLabel: 'Social Media & Content',
    capabilities: ['A_sign_in', 'B_account_link', 'D_sharing_deep_link'],
    potentialUse: 'Social identity, public handle link, sharing thought prompts and controversial harmless opinions.',
    apiLimitationNote: 'X API v2 access rules apply. Used for public handle confirmation and social sharing.',
    iconType: 'Send',
    officialUrl: 'https://developer.x.com'
  },
  {
    id: 'srv_youtube',
    name: 'YouTube',
    category: 'social_media',
    categoryLabel: 'Social Media & Content',
    capabilities: ['B_account_link', 'C_data_import'],
    potentialUse: 'Display public channel, showcase creative videos, synchronize watch parties.',
    apiLimitationNote: 'YouTube Data API accesses authorized public channel metadata and playlists.',
    iconType: 'Video',
    officialUrl: 'https://developers.google.com/youtube',
    isPopular: true
  },
  {
    id: 'srv_reddit',
    name: 'Reddit',
    category: 'social_media',
    categoryLabel: 'Social Media & Content',
    capabilities: ['B_account_link', 'E_external_recommendation'],
    potentialUse: 'Link public Reddit profile, recommend niche subreddits for obscure hobbies.',
    apiLimitationNote: 'Reddit Data API compliance; no reading of private chat or anonymous accounts.',
    iconType: 'MessageSquare',
    officialUrl: 'https://www.reddit.com/dev/api/'
  },

  // 3. Messaging and Communication
  {
    id: 'srv_whatsapp',
    name: 'WhatsApp',
    category: 'messaging_comms',
    categoryLabel: 'Messaging & Communication',
    capabilities: ['D_sharing_deep_link'],
    potentialUse: 'Send FRIENDS identity cards, private party invitations, and FRIENDS MEET safety links.',
    apiLimitationNote: 'End-to-end encrypted protocol. FRIENDS has no access to personal chats; operates via native deep links.',
    iconType: 'Send',
    isPopular: true
  },
  {
    id: 'srv_telegram',
    name: 'Telegram',
    category: 'messaging_comms',
    categoryLabel: 'Messaging & Communication',
    capabilities: ['B_account_link', 'D_sharing_deep_link'],
    potentialUse: 'Public @username linking, public channel announcements, optional opt-in event bot.',
    apiLimitationNote: 'Bot API operates strictly in opt-in groups; zero access to private user conversations.',
    iconType: 'Send',
    officialUrl: 'https://core.telegram.org/bots/api'
  },
  {
    id: 'srv_slack',
    name: 'Slack',
    category: 'messaging_comms',
    categoryLabel: 'Messaging & Communication',
    capabilities: ['A_sign_in', 'B_account_link', 'D_sharing_deep_link'],
    potentialUse: 'Workspace community identity, university society notifications.',
    apiLimitationNote: 'Workspace-level admin installation required for team integration.',
    iconType: 'Globe'
  },

  // 4. Music, Gaming & Entertainment
  {
    id: 'srv_spotify',
    name: 'Spotify',
    category: 'music_gaming_entertainment',
    categoryLabel: 'Music, Gaming & Culture',
    capabilities: ['A_sign_in', 'B_account_link', 'C_data_import'],
    potentialUse: 'Import favorite artists, ambient lo-fi tracks, and public playlists into your compatibility profile.',
    apiLimitationNote: 'Authorized Web API retrieves user-top-artists only with explicit user permission.',
    iconType: 'Music',
    officialUrl: 'https://developer.spotify.com',
    isPopular: true
  },
  {
    id: 'srv_steam',
    name: 'Steam',
    category: 'music_gaming_entertainment',
    categoryLabel: 'Music, Gaming & Culture',
    capabilities: ['B_account_link', 'C_data_import'],
    potentialUse: 'Display gaming library, favorite indie titles (Outer Wilds, Hollow Knight), find co-op buddies.',
    apiLimitationNote: 'Steam Web API checks public game libraries based on user privacy settings.',
    iconType: 'Gamepad2',
    officialUrl: 'https://steamcommunity.com/dev',
    isPopular: true
  },
  {
    id: 'srv_letterboxd',
    name: 'Letterboxd',
    category: 'music_gaming_entertainment',
    categoryLabel: 'Music, Gaming & Culture',
    capabilities: ['B_account_link', 'C_data_import'],
    potentialUse: 'Share 4 favorite films, cinema taste diary, and movie night watchlists.',
    apiLimitationNote: 'Public profile RSS/API integration to match users on cinematic storytelling tastes.',
    iconType: 'Video',
    isPopular: true
  },
  {
    id: 'srv_goodreads',
    name: 'Goodreads',
    category: 'music_gaming_entertainment',
    categoryLabel: 'Music, Gaming & Culture',
    capabilities: ['B_account_link', 'C_data_import'],
    potentialUse: 'Share currently reading list, favorite books, and literary obsessions.',
    apiLimitationNote: 'Public shelf links and book club recommendations.',
    iconType: 'BookOpen'
  },
  {
    id: 'srv_anilist',
    name: 'AniList & MyAnimeList',
    category: 'music_gaming_entertainment',
    categoryLabel: 'Music, Gaming & Culture',
    capabilities: ['B_account_link', 'C_data_import'],
    potentialUse: 'Anime/manga taste matching, favorite series (Ghibli, Evangelion, Frieren).',
    apiLimitationNote: 'AniList GraphQL API provides authorized public anime list comparisons.',
    iconType: 'Tv',
    isPopular: true
  },

  // 5. Education, Career & Learning
  {
    id: 'srv_duolingo',
    name: 'Duolingo',
    category: 'education_career',
    categoryLabel: 'Education, Career & Learning',
    capabilities: ['B_account_link', 'C_data_import'],
    potentialUse: 'Display language-learning journey, active streak, and languages you want to practice.',
    apiLimitationNote: 'Public profile data display; links study buddies on mutual language goals.',
    iconType: 'Globe',
    isPopular: true
  },
  {
    id: 'srv_coursera',
    name: 'Coursera & edX',
    category: 'education_career',
    categoryLabel: 'Education, Career & Learning',
    capabilities: ['B_account_link', 'C_data_import'],
    potentialUse: 'Display completed certifications, professional specializations, and study partner requests.',
    apiLimitationNote: 'Verified credential badges without academic grade disclosure.',
    iconType: 'Briefcase'
  },

  // 6. Productivity & Calendar
  {
    id: 'srv_google_calendar',
    name: 'Google Calendar',
    category: 'productivity_calendar',
    categoryLabel: 'Calendar & Productivity',
    capabilities: ['C_data_import', 'D_sharing_deep_link'],
    potentialUse: 'Add FRIENDS events with 1 click; check mutual free time for FRIENDS MEET without revealing event details.',
    apiLimitationNote: 'Free/busy privacy overlay only; never exposes private personal calendar appointments.',
    iconType: 'Calendar',
    isPopular: true
  },
  {
    id: 'srv_notion',
    name: 'Notion',
    category: 'productivity_calendar',
    categoryLabel: 'Calendar & Productivity',
    capabilities: ['A_sign_in', 'B_account_link'],
    potentialUse: 'Public workspace portfolio, project collaboration, reading lists.',
    apiLimitationNote: 'Notion API requires authorized internal or public integration permissions.',
    iconType: 'Globe'
  },

  // 7. Dating, Friendship & Emotional Support (Curated External Referrals)
  {
    id: 'srv_7cups',
    name: '7 Cups of Tea',
    category: 'dating_support_external',
    categoryLabel: 'External Support & Communities',
    capabilities: ['E_external_recommendation'],
    potentialUse: 'Free 24/7 empathetic listening from volunteer peers when you need to vent without romance.',
    apiLimitationNote: '7 Cups is an independent volunteer listener service, not an emergency mental health service. Crisis distress routes to 1926/1333.',
    iconType: 'HeartHandshake',
    officialUrl: 'https://7cups.com',
    isPopular: true
  },
  {
    id: 'srv_tandem_app',
    name: 'Tandem Language Exchange',
    category: 'dating_support_external',
    categoryLabel: 'External Support & Communities',
    capabilities: ['E_external_recommendation'],
    potentialUse: 'International language exchange and cross-cultural friendship.',
    apiLimitationNote: 'Curated external recommendation; independent platform account required.',
    iconType: 'Globe',
    officialUrl: 'https://tandem.net',
    isPopular: true
  },
  {
    id: 'srv_tinder_app',
    name: 'Tinder & Bumble',
    category: 'dating_support_external',
    categoryLabel: 'External Support & Communities',
    capabilities: ['E_external_recommendation'],
    potentialUse: 'High-density dating discovery in metropolitan centers when FRIENDS dating pool is cold.',
    apiLimitationNote: 'Curated external destination. FRIENDS does not scrape or search third-party dating databases.',
    iconType: 'Heart',
    isPopular: true
  }
];
