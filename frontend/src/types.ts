export type SoulverseRoute = 
  | 'home'
  | 'daily'
  | 'discover'
  | 'connect'
  | 'connections'
  | 'messages'
  | 'inbox'
  | 'profile'
  | 'identities'
  | 'worlds'
  | 'timeline'
  | 'collections'
  | 'account'
  | 'settings'
  | 'more'
  | 'journal'
  | 'unspoken'
  | 'quotes'
  | 'admin';

export type MobilePrimaryTab = 'discover' | 'connect' | 'create' | 'inbox' | 'profile';

export type ExperienceTab = 
  | 'home'
  | 'daily'
  | 'discover'
  | 'likes'
  | 'messages_rooms'
  | 'profile'
  | 'blind_chemistry'
  | 'character_builder'
  | 'lucky_universe'
  | 'mini_games'
  | 'events'
  | 'communities'
  | 'social_growth'
  | 'self_discovery'
  | 'my_world'
  | 'friends_connect'
  | 'friends_real'
  | 'universal_id'
  | 'privacy_centre'
  | 'share_engine'
  | 'friends' 
  | 'dating' 
  | 'talk'
  | 'profile_worlds'
  | 'living_profile'
  | 'admin';

export type MainNavTab = 'home' | 'discover' | 'likes' | 'messages' | 'profile';
export type DiscoveryMode = 'swipe' | 'video' | 'social' | 'personality';


export type VisibilityLevel = 'public' | 'members_only' | 'connections_only' | 'only_me';

export interface SocialLinkItem {
  id: string;
  userId: string;
  platformId: string;
  platformName: string;
  category: string;
  color: string;
  badgeBg: string;
  iconName: string;
  originalUrl?: string;
  canonicalUrl: string;
  username?: string;
  customLabel?: string;
  visibility: 'public' | 'matches_only' | 'private';
  sortOrder?: number;
  verificationStatus: string;
}


export interface FieldPrivacySetting {
  fieldKey: string;
  label: string;
  currentVisibility: VisibilityLevel;
  category: 'identity' | 'contact' | 'academic_career' | 'social_accounts' | 'intimate_preferences';
  provenanceSource: 'user_declared' | 'google' | 'linkedin' | 'spotify' | 'instagram' | 'github';
  lastUpdated: string;
}

export interface GranularFeatureConsent {
  id: string;
  title: string;
  description: string;
  category: 'core' | 'personalization' | 'ai_coach' | 'biometrics' | 'location' | 'marketing';
  granted: boolean;
  mandatory: boolean;
  dataUsed: string[];
}

export type CapabilityType = 
  | 'A_sign_in' 
  | 'B_account_link' 
  | 'C_data_import' 
  | 'D_sharing_deep_link' 
  | 'E_external_recommendation' 
  | 'F_partnership_restricted';

export type DirectoryCategory = 
  | 'sign_in_identity'
  | 'social_media'
  | 'messaging_comms'
  | 'music_gaming_entertainment'
  | 'education_career'
  | 'productivity_calendar'
  | 'dating_support_external';

export interface UniversalDirectoryService {
  id: string;
  name: string;
  category: DirectoryCategory;
  categoryLabel: string;
  capabilities: CapabilityType[];
  potentialUse: string;
  apiLimitationNote: string;
  iconType: string;
  officialUrl?: string;
  isPopular?: boolean;
}

export type SyncLevel = 'level_1_connected' | 'level_2_imported' | 'level_3_synchronized';

export type AuthProviderId = 'google' | 'apple' | 'facebook' | 'linkedin';

export type ConnectProviderId = 
  | 'google'
  | 'facebook' 
  | 'instagram' 
  | 'linkedin' 
  | 'spotify' 
  | 'discord' 
  | 'telegram' 
  | 'youtube' 
  | 'github'
  | 'apple'
  | 'microsoft'
  | 'steam'
  | 'letterboxd'
  | 'goodreads'
  | 'anilist'
  | 'duolingo'
  | 'reddit'
  | 'twitch'
  | 'tiktok';

export interface ProviderConnectionState {
  providerId: ConnectProviderId;
  name: string;
  category: string;
  syncLevel: SyncLevel;
  isConnected: boolean;
  isLoginProvider: boolean;
  authorizedScopes: string[];
  lastSyncedAt?: string;
  importedFields: string[];
  userIdentifier?: string;
  iconType: string;
}

export type IntegrationLevel = 
  | 'official_oauth' 
  | 'public_link' 
  | 'share_destination' 
  | 'external_recommendation';

export type PlatformGoal = 
  | 'platonic_friends' 
  | 'dating_romance' 
  | 'talk_support' 
  | 'activity_gaming' 
  | 'study_tech' 
  | 'international_language';

export interface ExternalPlatform {
  id: string;
  name: string;
  category: string;
  bestFor: string;
  recommendedGoals: PlatformGoal[];
  friendsAction: string;
  integrationLevel: IntegrationLevel;
  apiLimitationNote: string;
  iconType: string;
  externalUrl?: string;
  fitScoreDescription: string;
}

export type EventType = 
  | 'public_gathering' 
  | 'private_party' 
  | 'online_party' 
  | 'watch_party' 
  | 'meet_new_people';

export type EventFormat = 'physical' | 'online' | 'hybrid';

export interface FriendsEvent {
  id: string;
  title: string;
  type: EventType;
  format: EventFormat;
  date: string;
  time: string;
  locationName: string;
  locationCity: string;
  exactAddressHidden: boolean;
  coverImage: string;
  description: string;
  hostName: string;
  hostAvatar: string;
  hostVerified: boolean;
  category: string;
  tags: string[];
  capacity: number;
  attendeesCount: number;
  rsvpStatus?: 'attending' | 'waitlist' | 'not_going' | 'none';
  watchPartyDetails?: {
    mediaTitle: string;
    mediaType: 'film' | 'anime' | 'documentary' | 'video';
    synchronizedTime: string;
    streamServiceAuthorized: string;
  };
  rules: string[];
}

export type VerificationType = 
  | 'photo_verified'
  | 'age_18_plus'
  | 'id_verified'
  | 'social_verified'
  | 'education_verified';

export interface VerificationStatus {
  photoVerified: boolean;
  photoVerifiedAt?: string;
  ageVerified18Plus: boolean;
  idDocumentVerified: boolean;
  socialVerified: boolean;
  educationVerified: boolean;
}

export interface MeetSafetyPlan {
  id: string;
  partnerName: string;
  partnerAvatar: string;
  partnerVerifiedBadges: string[];
  meetingDate: string;
  startTime: string;
  plannedEndTime: string;
  publicVenue: string;
  activity: string;
  trustedContact: {
    name: string;
    phoneOrEmail: string;
    notifyOnStart: boolean;
    notifyOnMissedCheckIn: boolean;
  };
  checkInIntervalMinutes: number;
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled';
  activeCheckInWindow?: string;
  lastCheckInStatus?: 'safe' | 'delayed' | 'alert_sent';
}

export type EnergyLevel = 'Introvert' | 'Ambivert' | 'Extrovert';
export type ConflictStyle = 'Direct Discussion' | 'Need Space First' | 'Avoidant / Calm Down';
export type AffectionStyle = 'Words of Encouragement' | 'Quality Time' | 'Acts of Care' | 'Shared Experiences';
export type SocialEnergy = 'Always Available' | 'Context Dependent' | 'Recharge in Solitude';

export interface EducationEntry {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startYear: number;
  endYear?: number;
  current: boolean;
  activities?: string;
  visibility: VisibilityLevel;
  verified?: boolean;
}

export interface CareerEntry {
  id: string;
  role: string;
  companyOrFreelance: string;
  period: string;
  current: boolean;
  description: string;
  skills: string[];
  visibility: VisibilityLevel;
}

export interface ProfilePrompt {
  id: string;
  category: 'Classic' | 'Funny & Unhinged' | 'Deep & Vulnerable';
  prompt: string;
  answer: string;
  featured?: boolean;
}

export interface LifeStory {
  id: string;
  title: string;
  prompt: string;
  content: string;
  moodEmoji: string;
  visibility: VisibilityLevel;
  dateAdded: string;
}

export interface MediaGalleryItem {
  id: string;
  url: string;
  caption: string;
  category: 'memories' | 'creativity' | 'everyday' | 'places';
}

export interface ConnectionPreferences {
  openTo: string[];
  seekingQualities: string[];
  enjoyTogether: string[];
  personalStatement: string;
  preferredLanguages: string[];
  communicationStylePreference: string;
}

export interface LifestyleDetails {
  circadian: 'Morning Lark' | 'Night Owl' | 'Chaotic In-Between';
  weekendStyle: 'Home Sanctuary' | 'Spontaneous Exploration' | 'Social Mix';
  coffeeOrTea: 'Tea' | 'Coffee' | 'Matcha' | 'Water only';
  dietOrFood: string;
  socialBatteryRecharge: string;
  petAffinity: string;
  cleanOrMessy: 'Organized' | 'Chaotic Creative' | 'Strictly Minimal';
}

export interface ActiveTimeWindow {
  periodLabel: string; // e.g. "Late Night (11:00 PM – 2:00 AM)"
  slotName: 'morning' | 'afternoon' | 'evening' | 'late_night' | 'flexible';
  typicalDays: string; // e.g. "Most evenings & weekends"
  onlineProbabilityPercent: number; // e.g. 85%
  isCurrentlyInActiveWindow: boolean; // computed or current snapshot
  timezone: string; // e.g. "GMT+5:30 (Sri Lanka Time)"
  lastSeenDescription: string; // e.g. "Active 15 mins ago"
}

export interface UserProfile {
  id: string;
  name: string;
  username: string;
  age: number;
  location: string;
  hometown?: string;
  avatar: string;
  bannerImage?: string;
  pronouns?: string;
  tagline: string;
  headline: string;
  intent: 'Friendship' | 'Dating' | 'Talk & Support' | 'Self Discovery';
  status: string;
  languages: string[];
  website?: string;
  aboutMeLong: string;
  personalQuote: {
    quote: string;
    author: string;
  };
  energy: EnergyLevel;
  conflictStyle: ConflictStyle;
  affectionStyle: AffectionStyle;
  socialEnergy: SocialEnergy;
  idealConversation: string;
  coreValues: string[];
  interests: string[];
  likes: string[];
  dislikes: string[];
  deepQuestion: {
    question: string;
    answer: string;
  };
  socialLinks?: {
    platform: string;
    handle: string;
    url: string;
    verified?: boolean;
    followersCount?: string;
    visibility: VisibilityLevel;
  }[];
  compatibilityScore?: number;
  matchReasons?: string[];
  photos?: string[];
  videoUrl?: string;
  voiceIntroUrl?: string;
  relationshipStage?: 'Stranger' | 'Like' | 'Match' | 'Chat' | 'Date' | 'Exclusive' | 'Relationship';
  likesYou?: boolean;

  // Verification & Trust ("FRIENDS REAL")
  verifications?: VerificationStatus;
  recentPhotoDate?: string;

  // Active Chat Time Windows (Based on app usage history)
  activeTimeWindow?: ActiveTimeWindow;

  // Deep Identity "MY WORLD" Extended Subsystems
  education?: EducationEntry[];
  career?: CareerEntry[];
  prompts?: ProfilePrompt[];
  lifestyle?: LifestyleDetails;
  stories?: LifeStory[];
  gallery?: MediaGalleryItem[];
  connectionPreferences?: ConnectionPreferences;
  profileStrength?: number;
}

export interface FriendshipWishlist {
  lookingFor: string[];
  couldTalkHoursAbout: string[];
  wantToExperience: string[];
  appreciatePeopleWho: string[];
  unnecessaryPassionateOpinion: string;
  idealWeekend: string;
}

export interface FriendQuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctOptionIndex: number;
}

export interface DailyHopeMessage {
  id: string;
  theme: 'Hope' | 'Courage' | 'Friendship' | 'Loneliness' | 'Self-Worth' | 'Resilience';
  headline: string;
  message: string;
  actionPrompt: string;
}

export interface JourneyDay {
  day: number;
  stage: 1 | 2 | 3 | 4;
  stageTitle: string;
  title: string;
  lesson: string;
  challenge: string;
  reflectionPrompt: string;
  completed: boolean;
}

export interface AcademyLesson {
  id: string;
  title: string;
  category: string;
  scenario: string;
  question: string;
  options: {
    id: string;
    text: string;
    feedback: string;
    isRecommended: boolean;
  }[];
}

export interface FutureLetter {
  id: string;
  writtenAt: string;
  unlockAfterDays: number;
  content: string;
  status: 'locked' | 'unlocked';
}

export interface AnonymousQuestion {
  id: string;
  question: string;
  authorNote: string;
  responses: {
    id: string;
    text: string;
    timestamp: string;
  }[];
}

export interface SocialCircle {
  id: string;
  name: string;
  topic: string;
  description: string;
  membersCount: number;
  maxMembers: number;
  avatarIcon: string;
  currentActivity: string;
  activeVoiceRoom?: boolean;
  tags: string[];
}

export interface SocialChallenge {
  level: number;
  title: string;
  description: string;
  targetAction: string;
  xp: number;
  completed: boolean;
}
