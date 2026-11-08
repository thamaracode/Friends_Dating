import type { ExternalPlatform } from './types';

export const EXTERNAL_PLATFORMS: ExternalPlatform[] = [
  {
    id: 'discord',
    name: 'Discord',
    category: 'Gaming, Anime & Hobbies',
    bestFor: 'Voice lounges, synchronous gaming, anime watch groups, and indie tech communities.',
    recommendedGoals: ['activity_gaming', 'study_tech', 'international_language'],
    friendsAction: 'Recommend verified public partner servers; link your public Discord handle to your FRIENDS profile.',
    integrationLevel: 'public_link',
    apiLimitationNote: 'Bots and links only access permitted servers. FRIENDS never reads your private Discord direct messages.',
    iconType: 'Gamepad2',
    externalUrl: 'https://discord.com',
    fitScoreDescription: 'Strong fit for real-time activities and nocturnal voice hangouts'
  },
  {
    id: 'reddit',
    name: 'Reddit',
    category: 'Niche Subreddits & Discussions',
    bestFor: 'In-depth topical discussions (e.g. r/srilanka, r/indiegames, r/philosophy, r/socialanxiety).',
    recommendedGoals: ['study_tech', 'activity_gaming', 'platonic_friends'],
    friendsAction: 'Curate recommended interest subreddits based on your unfulfilled profile obsessions.',
    integrationLevel: 'external_recommendation',
    apiLimitationNote: 'Reddit API adheres to developer policy. FRIENDS recommends public subreddits without reading private DMs.',
    iconType: 'MessageSquare',
    externalUrl: 'https://reddit.com',
    fitScoreDescription: 'High resonance for specific obscure passions'
  },
  {
    id: 'tandem',
    name: 'Tandem & HelloTalk',
    category: 'Language & Global Exchange',
    bestFor: 'Practicing foreign languages (Japanese, German, Spanish) with native speakers worldwide.',
    recommendedGoals: ['international_language', 'platonic_friends'],
    friendsAction: 'Suggest verified language exchange networks based on languages you are currently learning.',
    integrationLevel: 'external_recommendation',
    apiLimitationNote: 'Independent foreign platforms. FRIENDS recommends them as discovery destinations.',
    iconType: 'Globe',
    externalUrl: 'https://tandem.net',
    fitScoreDescription: 'Optimal for cross-cultural friendship & language learning'
  },
  {
    id: 'seven_cups',
    name: '7 Cups of Tea',
    category: 'Emotional Support & Active Listeners',
    bestFor: 'Free 24/7 empathetic listening from trained volunteer peers when you need to vent without romance.',
    recommendedGoals: ['talk_support'],
    friendsAction: 'Provide seamless referral when our local peer listeners are offline; separate from crisis escalation.',
    integrationLevel: 'external_recommendation',
    apiLimitationNote: '7 Cups listeners are non-crisis volunteers. Suicidal thoughts or emergency distress routes immediately to 1926/1333.',
    iconType: 'HeartHandshake',
    externalUrl: 'https://7cups.com',
    fitScoreDescription: 'Safe, non-dating listening environment'
  },
  {
    id: 'instagram',
    name: 'Instagram',
    category: 'Visual Identity & Existing Circles',
    bestFor: 'Connecting with people you already know, sharing daily stories, and photography art.',
    recommendedGoals: ['platonic_friends', 'dating_romance'],
    friendsAction: 'Export your FRIENDS Identity Card & Story links (@username); display voluntary public profile link.',
    integrationLevel: 'share_destination',
    apiLimitationNote: 'Meta Graph API restricts personal profile scraping. Links are voluntarily shared by users.',
    iconType: 'Camera',
    externalUrl: 'https://instagram.com',
    fitScoreDescription: 'Ideal for sharing your authentic FRIENDS story'
  },
  {
    id: 'tinder_bumble',
    name: 'Tinder & Bumble',
    category: 'Mainstream Dating Networks',
    bestFor: 'High-density romantic and casual dating matching in major cities when FRIENDS dating pool is cold.',
    recommendedGoals: ['dating_romance'],
    friendsAction: 'Honest external recommendation when you prioritize rapid romantic discovery over our platonic pillars.',
    integrationLevel: 'external_recommendation',
    apiLimitationNote: 'No public profile import API exists. FRIENDS acts as an ethical advisor, not a wrapper.',
    iconType: 'Heart',
    externalUrl: 'https://tinder.com',
    fitScoreDescription: 'Large volume romantic discovery'
  },
  {
    id: 'spotify',
    name: 'Spotify',
    category: 'Music Taste & Audio DNA',
    bestFor: 'Discovering shared music taste, ambient lo-fi playlists, and concert partners.',
    recommendedGoals: ['activity_gaming', 'platonic_friends'],
    friendsAction: 'Connect public playlists and favorite artists to enrich your FRIENDS compatibility index.',
    integrationLevel: 'official_oauth',
    apiLimitationNote: 'Authorized Web API retrieves public playlists and top artists only with your consent.',
    iconType: 'Music',
    externalUrl: 'https://spotify.com',
    fitScoreDescription: 'Powerful musical compatibility signal'
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    category: 'Direct Real-World Invitations',
    bestFor: 'Inviting close friends, organizing group parties, and sending FRIENDS MEET safety links.',
    recommendedGoals: ['platonic_friends', 'activity_gaming'],
    friendsAction: '1-touch deep link to share your identity card, quiz, or event invite directly to existing chats.',
    integrationLevel: 'share_destination',
    apiLimitationNote: 'End-to-end encrypted protocol. FRIENDS cannot and will never scan your private chats.',
    iconType: 'Send',
    externalUrl: 'https://whatsapp.com',
    fitScoreDescription: 'Most natural way to bring existing circles into FRIENDS'
  }
];
