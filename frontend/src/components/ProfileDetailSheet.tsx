import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  MapPin, 
  ShieldCheck, 
  Heart, 
  Star, 
  MessageCircle, 
  Share2, 
  Sparkles, 
  Clock, 
  BookOpen, 
  Briefcase, 
  GraduationCap, 
  Coffee, 
  Music, 
  ThumbsUp, 
  ThumbsDown, 
  Lock, 
  Volume2,
  ChevronDown,
  ExternalLink,
  Flag,
  FileText,
  Save,
  Check
} from 'lucide-react';
import { CURRENT_USER } from '../mockData';
import { DigitalLifeHub } from './DigitalLifeHub';
import { ProfileWorldsHub } from './ProfileWorldsHub';
import { GitHubMarkdownRenderer } from './GitHubMarkdownRenderer';
import { markdownProfileClient } from '../services/markdownProfileApiClient';
import { identityUniverseClient } from '../services/identityUniverseApiClient';
import type { ProfileMarkdown } from '../types/markdownProfile';
import type { ProfileSocialFeedback } from '../types/identityUniverse';
import type { UserProfile } from '../types';
import { GlassCard, GlassButton, GlassFloatingButton } from './klyven';
import { loadUserAttributes, FullUserAttributes } from '../types/tinderFeatures';
import { EditProfileInfoModal } from './EditProfileInfoModal';
import { useSpotifyMusic } from '../context/SpotifyMusicContext';

interface ProfileDetailSheetProps {
  profile: UserProfile | null;
  onClose: () => void;
  onInitiateChat: (profile: UserProfile) => void;
  onSuperLike: (profile: UserProfile) => void;
}

export const ProfileDetailSheet: React.FC<ProfileDetailSheetProps> = ({
  profile,
  onClose,
  onInitiateChat,
  onSuperLike
}) => {
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const [activeLayer, setActiveLayer] = useState<'public' | 'worlds' | 'readme' | 'dating' | 'private'>('public');
  const [profileMarkdown, setProfileMarkdown] = useState<ProfileMarkdown | null>(null);

  // Private Viewer Note State (Telegram Contact Notes)
  const [privateNote, setPrivateNote] = useState('');
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [noteSavedFeedback, setNoteSavedFeedback] = useState(false);

  // Social Feedback & Community Traits State
  const [socialFeedback, setSocialFeedback] = useState<ProfileSocialFeedback>({
    likesCount: 0,
    dislikesCount: 0,
    userVote: null,
    traits: []
  });

  // Tinder-Inspired Attributes & Edit Info State
  const [userAttributes, setUserAttributes] = useState<FullUserAttributes>(loadUserAttributes);
  const [isEditInfoOpen, setIsEditInfoOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const { linkSpotify } = useSpotifyMusic();

  const handleShareProfile = () => {
    if (!profile) return;
    navigator.clipboard.writeText(`${window.location.origin}/profile/${profile.id}`);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const isSelf = profile ? profile.id === CURRENT_USER.id : false;

  useEffect(() => {
    if (profile?.id) {
      // 1. Fetch GitHub Markdown Profile
      markdownProfileClient.getMarkdown(profile.id, 'usr_me').then(res => {
        if (res.markdown) setProfileMarkdown(res.markdown);
      }).catch(console.error);

      // 2. Fetch Private Viewer Note if viewing another user
      if (!isSelf) {
        identityUniverseClient.getViewerNote(profile.id, 'usr_me').then(note => {
          if (note) setPrivateNote(note.note_content);
        }).catch(console.error);

        // 3. Fetch Social Feedback & Community Trait Votes
        identityUniverseClient.getSocialFeedback(profile.id, 'usr_me').then(fb => {
          if (fb) setSocialFeedback(fb);
        }).catch(console.error);
      }
    }
  }, [profile?.id, isSelf]);

  const handleSavePrivateNote = async () => {
    if (!profile || !profile.id || isSelf) return;
    setIsSavingNote(true);
    try {
      await identityUniverseClient.saveViewerNote(profile.id, privateNote, 'usr_me');
      setNoteSavedFeedback(true);
      setTimeout(() => setNoteSavedFeedback(false), 2000);
    } catch (err) {
      console.error('Failed to save private note', err);
    } finally {
      setIsSavingNote(false);
    }
  };

  const handleVote = async (type: 'like' | 'dislike') => {
    if (!profile || !profile.id || isSelf) return;
    try {
      const active = await identityUniverseClient.castVote(profile.id, type, 'usr_me');
      setSocialFeedback(prev => ({
        ...prev,
        userVote: active,
        likesCount: type === 'like' 
          ? (active === 'like' ? prev.likesCount + 1 : prev.likesCount - 1)
          : (prev.userVote === 'like' ? prev.likesCount - 1 : prev.likesCount),
        dislikesCount: type === 'dislike'
          ? (active === 'dislike' ? prev.dislikesCount + 1 : prev.dislikesCount - 1)
          : (prev.userVote === 'dislike' ? prev.dislikesCount - 1 : prev.dislikesCount)
      }));
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleTrait = async (slug: string) => {
    if (!profile || !profile.id || isSelf) return;
    try {
      const active = await identityUniverseClient.toggleTraitVote(profile.id, slug, 'usr_me');
      setSocialFeedback(prev => {
        const traits = [...prev.traits];
        const idx = traits.findIndex(t => t.trait_slug === slug);
        if (idx >= 0) {
          traits[idx] = {
            ...traits[idx],
            count: active ? traits[idx].count + 1 : Math.max(0, traits[idx].count - 1),
            userSelected: active
          };
        } else {
          traits.push({ trait_slug: slug, count: 1, userSelected: true });
        }
        return { ...prev, traits };
      });
    } catch (err) {
      console.error(err);
    }
  };

  const communityTraitsList = [
    { slug: 'green_flag', label: '🟢 Walking Green Flag' },
    { slug: 'good_listener', label: '👂 Good Listener' },
    { slug: 'thoughtful', label: '💡 Thoughtful' },
    { slug: 'creative', label: '🎨 Creative' },
    { slug: 'great_communicator', label: '💬 Great Communicator' },
    { slug: 'red_flag', label: '🚩 Red Flag' },
    { slug: 'mysterious', label: '✨ Mysterious' },
    { slug: 'reliable', label: '🛡️ Reliable' },
    { slug: 'romantic', label: '🌹 Romantic' }
  ];

  if (!profile) return null;

  const photos = profile.photos && profile.photos.length > 0 
    ? profile.photos 
    : [profile.avatar];

  return (
    <div className="fixed inset-0 z-50 bg-[#090A0E] overflow-y-auto no-scrollbar pb-24 animate-fadeIn">
      {/* Top Floating Sticky Header */}
      <div className="fixed top-0 inset-x-0 z-40 max-w-lg mx-auto px-5 py-4 flex items-center justify-between pointer-events-none">
        <button
          onClick={onClose}
          className="w-11 h-11 rounded-full dark-glass flex items-center justify-center text-zinc-100 hover:text-white border border-white/20 shadow-xl pointer-events-auto cursor-pointer active:scale-95 transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            onClick={handleShareProfile}
            className="w-11 h-11 rounded-full dark-glass flex items-center justify-center text-zinc-100 hover:text-white border border-white/20 shadow-xl cursor-pointer active:scale-95 transition-all"
            title="Share profile link"
          >
            {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div className="max-w-lg mx-auto space-y-6">
        {/* Top Hero Photo Gallery */}
        <div className="relative w-full aspect-[4/5] overflow-hidden bg-[#12141B] rounded-b-3xl">
          <img 
            src={photos[activePhotoIdx] || profile.avatar} 
            alt={profile.name} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#090A0E] via-transparent to-black/30" />

          {/* Dots Indicator */}
          {photos.length > 1 && (
            <div className="absolute bottom-4 inset-x-0 flex items-center justify-center gap-2 z-20">
              {photos.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActivePhotoIdx(idx)}
                  className={`h-2 rounded-full transition-all cursor-pointer ${
                    activePhotoIdx === idx 
                      ? 'w-7 bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]' 
                      : 'w-2 bg-white/40 hover:bg-white/60'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Identity Overview Bar */}
        <div className="px-5 sm:px-6 space-y-5">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="type-page-heading text-white">{profile.name}</h1>
                <span className="type-page-heading font-normal text-zinc-300 tabular-nums">{profile.age}</span>
                {profile.verifications?.photoVerified && (
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                )}
              </div>
              
              <div className="flex items-center gap-2 type-supporting text-zinc-400 mt-1">
                <span className="flex items-center gap-1 text-zinc-200">
                  <MapPin className="w-4 h-4 text-zinc-400" />
                  <span>{profile.location}</span>
                </span>
                <span>•</span>
                <span className="capitalize">{profile.status}</span>
              </div>
            </div>

            {/* Compatibility Score */}
            {profile.compatibilityScore && (
              <div className="text-right px-3.5 py-2 rounded-2xl dark-glass border border-white/15">
                <div className="text-lg font-black text-white font-mono tabular-nums">
                  {profile.compatibilityScore}%
                </div>
                <span className="type-metadata text-zinc-400 font-medium">HCM Score</span>
              </div>
            )}
          </div>

          {/* Bio Tagline */}
          <div className="sv-card p-5 space-y-2">
            <span className="type-metadata uppercase font-bold text-zinc-400 tracking-wider block">About me</span>
            <p className="font-editorial italic text-sm sm:text-base text-zinc-100 leading-relaxed border-l-2 border-gold-500/50 pl-3.5">
              "{profile.tagline || profile.aboutMeLong}"
            </p>
          </div>

          {/* 1. Tinder-Inspired "Looking For" Card (Image 11) */}
          <div className="sv-card p-5 space-y-2 shadow-lg">
            <span className="type-metadata font-bold text-zinc-400 uppercase tracking-wider block">
              Looking for
            </span>
            <div className="flex items-center gap-3 pt-1">
              <span className="text-2xl filter drop-shadow">
                {isSelf ? userAttributes.lifestyle.lookingForEmoji : '🧐'}
              </span>
              <span className="type-card-heading text-white tracking-tight">
                {isSelf ? userAttributes.lifestyle.lookingFor : (profile.intent === 'Dating' ? 'Long-term relationship' : 'Meaningful connections & deep talks')}
              </span>
            </div>
          </div>

          {/* Layer Navigation Tabs */}
          <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-[#12141B] border border-white/10 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveLayer('public')}
              className={`flex-1 h-10 px-3 rounded-xl font-heading font-semibold text-xs whitespace-nowrap transition-all cursor-pointer text-center ${
                activeLayer === 'public' ? 'bg-white text-[#090A0E] shadow-sm' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Public
            </button>
            <button
              onClick={() => setActiveLayer('worlds')}
              className={`flex-1 h-10 px-3 rounded-xl font-heading font-semibold text-xs whitespace-nowrap transition-all cursor-pointer text-center ${
                activeLayer === 'worlds' ? 'bg-white text-[#090A0E] shadow-sm' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Worlds
            </button>
            <button
              onClick={() => setActiveLayer('readme')}
              className={`flex-1 h-10 px-3 rounded-xl font-heading font-semibold text-xs whitespace-nowrap transition-all cursor-pointer text-center ${
                activeLayer === 'readme' ? 'bg-white text-[#090A0E] shadow-sm' : 'text-zinc-400 hover:text-white'
              }`}
            >
              README.md
            </button>
            <button
              onClick={() => setActiveLayer('dating')}
              className={`flex-1 h-10 px-3 rounded-xl font-heading font-semibold text-xs whitespace-nowrap transition-all cursor-pointer text-center ${
                activeLayer === 'dating' ? 'bg-white text-[#090A0E] shadow-sm' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Dating DNA
            </button>
            <button
              onClick={() => setActiveLayer('private')}
              className={`flex-1 h-10 px-3 rounded-xl font-heading font-semibold text-xs whitespace-nowrap transition-all cursor-pointer text-center ${
                activeLayer === 'private' ? 'bg-white text-[#090A0E] shadow-sm' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Private
            </button>
          </div>

          {/* LAYER 1: PUBLIC */}
          {activeLayer === 'public' && (
            <div className="space-y-4 animate-fadeIn">
              
              {/* 2. Tinder-Inspired "Essentials" Card (Image 11) */}
              <div className="p-4 rounded-3xl dark-glass border border-white/10 space-y-2.5 shadow-lg">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                  Essentials
                </span>
                <div className="space-y-2.5 text-xs divide-y divide-white/[0.04]">
                  <div className="flex items-center gap-3 pt-1 text-zinc-200">
                    <span className="text-sm text-zinc-400">📏</span>
                    <span className="font-semibold">{isSelf ? `${userAttributes.essentials.heightCm} cm` : '187 cm'}</span>
                  </div>
                  <div className="flex items-center gap-3 pt-2 text-zinc-200">
                    <span className="text-sm text-zinc-400">💼</span>
                    <span className="font-semibold">{isSelf ? userAttributes.essentials.job : (profile.status || 'Computer Science Student')}</span>
                  </div>
                  <div className="flex items-center gap-3 pt-2 text-zinc-200">
                    <span className="text-sm text-zinc-400">🏠</span>
                    <span className="font-semibold">{profile.location || 'Lives in Colombo'}</span>
                  </div>
                  <div className="flex items-center gap-3 pt-2 text-zinc-200">
                    <span className="text-sm text-zinc-400">✨</span>
                    <span className="font-semibold">{isSelf ? userAttributes.essentials.zodiac : '♒ Aquarius'}</span>
                  </div>
                  <div className="flex items-center gap-3 pt-2 text-zinc-200">
                    <span className="text-sm text-zinc-400">🗣️</span>
                    <span className="font-semibold">{profile.languages.join(', ')}</span>
                  </div>
                </div>
              </div>

              {/* 3. Tinder-Inspired Dating & Connection Prompts (Images 12, 13, 14) */}
              <div className="space-y-3">
                {/* Green Flag Prompt (Image 12) */}
                <div className="p-4 rounded-3xl dark-glass border border-white/10 space-y-1.5 shadow-md">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                    <span>💬 My biggest green flag is...</span>
                  </span>
                  <p className="text-sm font-bold text-white leading-relaxed">
                    "{isSelf ? userAttributes.prompts.greenFlag : 'I always remember the small details about what people tell me.'}"
                  </p>
                </div>

                {/* Perks of Dating Me Prompt (Image 12) */}
                <div className="p-4 rounded-3xl dark-glass border border-white/10 space-y-1.5 shadow-md">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                    <span>💬 Perks of dating me...</span>
                  </span>
                  <p className="text-sm font-bold text-white leading-relaxed">
                    "{isSelf ? userAttributes.prompts.perksOfDating : 'I will listen to you talk about your day for hours, make late-night playlists, and bring tea.'}"
                  </p>
                </div>

                {/* Habits (Image 13) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 space-y-1">
                    <span className="text-[10px] font-semibold text-zinc-400 block">I prefer receiving...</span>
                    <p className="text-xs font-bold text-white flex items-center gap-2">
                      <span>📱</span>
                      <span>{isSelf ? userAttributes.prompts.receivePreference : 'text messages'}</span>
                    </p>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 space-y-1">
                    <span className="text-[10px] font-semibold text-zinc-400 block">My phone is always...</span>
                    <p className="text-xs font-bold text-white flex items-center gap-2">
                      <span>🔋</span>
                      <span>{isSelf ? userAttributes.prompts.phoneAlways : 'fully charged'}</span>
                    </p>
                  </div>
                </div>

                {/* My Weekends (Image 14) */}
                <div className="p-4 rounded-3xl dark-glass border border-white/10 space-y-2.5 shadow-md">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                    💬 My Weekends
                  </span>
                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="text-[10px] text-zinc-400 block">Weekends are for...</span>
                      <p className="font-bold text-white flex items-center gap-1.5 mt-0.5">
                        <span>🔋</span>
                        <span>{isSelf ? userAttributes.prompts.weekendsFor : 'recharging'}</span>
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-400 block">Saturday night looks like...</span>
                      <p className="font-bold text-white flex items-center gap-1.5 mt-0.5">
                        <span>🛋️</span>
                        <span>{isSelf ? userAttributes.prompts.saturdayNight : 'cozy nights in'}</span>
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-400 block">A typical Sunday looks like...</span>
                      <p className="font-bold text-white flex items-center gap-1.5 mt-0.5">
                        <span>🧖</span>
                        <span>{isSelf ? userAttributes.prompts.typicalSunday : 'self-care'}</span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* 4. Spotify Anthem Card (Image 13) */}
                <div className="p-4 rounded-3xl dark-glass border border-white/10 space-y-2.5 shadow-lg">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Music className="w-3.5 h-3.5 text-[#1DB954]" />
                    <span>My Anthem</span>
                  </span>

                  <div className="p-3 rounded-2xl bg-black/60 border border-white/10 flex items-center gap-3">
                    <img
                      src={isSelf ? userAttributes.anthem.coverUrl : 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=300&auto=format&fit=crop&q=80'}
                      alt="Anthem Cover"
                      className="w-12 h-12 rounded-xl object-cover border border-white/15 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-bold text-white truncate">
                        {isSelf ? userAttributes.anthem.title : 'Until I Found You (with Em Beihold)'}
                      </h4>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <svg className="w-3 h-3 fill-[#1DB954]" viewBox="0 0 24 24">
                          <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.503 17.309c-.215.353-.675.467-1.028.252-2.816-1.722-6.36-2.112-10.536-1.157-.403.092-.806-.157-.899-.56-.092-.403.157-.806.56-.899 4.568-1.044 8.5-608 11.651 1.336.353.215.467.675.252 1.028zm1.47-3.264c-.27.441-.849.582-1.29.312-3.224-1.982-8.14-2.556-11.954-1.398-.499.151-1.028-.135-1.179-.634-.151-.499.135-1.028.634-1.179 4.364-1.325 9.789-.684 13.477 1.583.441.27.582.849.312 1.29zm.126-3.41c-3.864-2.295-10.244-2.508-13.935-1.387-.594.18-1.226-.154-1.406-.748-.18-.594.154-1.226.748-1.406 4.246-1.29 11.289-1.042 15.744 1.604.535.317.71 1.01.393 1.545-.317.535-1.01.71-1.545.393z"/>
                        </svg>
                        <p className="text-[10px] text-zinc-400 truncate">
                          {isSelf ? userAttributes.anthem.artist : 'Stephen Sanchez, Em Beihold'}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => linkSpotify(
                        isSelf ? userAttributes.anthem.spotifyUrl : 'https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT',
                        isSelf ? userAttributes.anthem.title : 'Until I Found You',
                        isSelf ? userAttributes.anthem.artist : 'Stephen Sanchez, Em Beihold'
                      )}
                      className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-[11px] font-bold transition-colors cursor-pointer shrink-0"
                    >
                      Play
                    </button>
                  </div>
                </div>
              </div>

              {/* Values & Passions */}
              <div className="p-4 rounded-3xl dark-glass border border-white/10 space-y-3">
                <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Core Values & Passions</span>
                <div className="flex flex-wrap gap-1.5">
                  {profile.coreValues.map((val, i) => (
                    <span key={i} className="px-3 py-1 rounded-full text-xs font-medium bg-[#181B24] border border-white/15 text-zinc-100">
                      {val}
                    </span>
                  ))}
                  {profile.interests.map((int, i) => (
                    <span key={`int-${i}`} className="px-3 py-1 rounded-full text-xs font-medium bg-black/40 border border-white/10 text-zinc-400">
                      #{int}
                    </span>
                  ))}
                </div>
              </div>

              {/* Likes & Dislikes */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/10 space-y-1">
                  <div className="flex items-center gap-1 text-zinc-300 font-bold text-[11px]">
                    <ThumbsUp className="w-3.5 h-3.5 text-zinc-300" />
                    <span>Loves</span>
                  </div>
                  <p className="text-[11px] text-zinc-400 leading-relaxed">
                    {profile.likes.join(' • ')}
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/10 space-y-1">
                  <div className="flex items-center gap-1 text-zinc-300 font-bold text-[11px]">
                    <ThumbsDown className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Turn-offs</span>
                  </div>
                  <p className="text-[11px] text-zinc-400 leading-relaxed">
                    {profile.dislikes.join(' • ')}
                  </p>
                </div>
              </div>

              {/* Vulnerable Prompt */}
              <div className="p-4 rounded-3xl dark-glass space-y-1.5 border border-white/10">
                <span className="text-[10px] font-bold text-zinc-400 uppercase">
                  {profile.deepQuestion.question}
                </span>
                <p className="text-xs text-white italic leading-relaxed">
                  "{profile.deepQuestion.answer}"
                </p>
              </div>

              {/* SOCIAL FEEDBACK & COMMUNITY TRAIT VOTING */}
              {!isSelf && (
                <div className="p-4 rounded-3xl dark-glass border border-white/10 space-y-3 shadow-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-white uppercase tracking-wider">
                      Community Feedback & Personality Traits
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleVote('like')}
                        className={`px-2.5 py-1 rounded-xl text-xs flex items-center gap-1 transition-all ${
                          socialFeedback.userVote === 'like'
                            ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-500/50'
                            : 'bg-white/5 text-zinc-400 hover:text-white border border-white/10'
                        }`}
                      >
                        <ThumbsUp className="w-3 h-3" />
                        <span className="tabular-nums">{socialFeedback.likesCount}</span>
                      </button>
                      <button
                        onClick={() => handleVote('dislike')}
                        className={`px-2.5 py-1 rounded-xl text-xs flex items-center gap-1 transition-all ${
                          socialFeedback.userVote === 'dislike'
                            ? 'bg-white/15 text-white border border-white/30'
                            : 'bg-white/5 text-zinc-400 hover:text-white border border-white/10'
                        }`}
                      >
                        <ThumbsDown className="w-3 h-3" />
                        <span className="tabular-nums">{socialFeedback.dislikesCount}</span>
                      </button>
                    </div>
                  </div>

                  {/* Trait voting pills */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {communityTraitsList.map(trait => {
                      const found = socialFeedback.traits.find(t => t.trait_slug === trait.slug);
                      const isSelected = found?.userSelected;
                      const count = found?.count || 0;
                      return (
                        <button
                          key={trait.slug}
                          onClick={() => handleToggleTrait(trait.slug)}
                          className={`px-2.5 py-1 rounded-full text-[11px] font-medium border transition-all cursor-pointer flex items-center gap-1 ${
                            isSelected
                              ? 'bg-white/20 text-white border-white/40 shadow-sm'
                              : 'bg-white/[0.03] text-zinc-400 border-white/10 hover:text-white'
                          }`}
                        >
                          <span>{trait.label}</span>
                          {count > 0 && <span className="opacity-70 text-[10px] tabular-nums">({count})</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TELEGRAM CONTACT NOTES: PRIVATE VIEWER NOTE */}
              {!isSelf && (
                <div className="p-4 rounded-3xl dark-glass border border-white/10 space-y-2.5 shadow-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                      <Lock className="w-3 h-3 text-zinc-300" />
                      <span>Private Note (Only You See This)</span>
                    </span>
                    {noteSavedFeedback && (
                      <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        <span>Saved</span>
                      </span>
                    )}
                  </div>

                  <p className="text-[10px] text-zinc-400 leading-relaxed">
                    Personal contact note inspired by Telegram. Notes belong exclusively to you; neither {profile.name} nor other viewers can see this.
                  </p>

                  <textarea
                    value={privateNote}
                    onChange={e => setPrivateNote(e.target.value)}
                    placeholder={`e.g. Met through indie gaming meetup. Likes sci-fi, preferred slow Ceylon tea...`}
                    rows={2}
                    className="w-full px-3 py-2 rounded-2xl dark-glass border border-white/10 text-xs text-white placeholder-white/30 focus:outline-none focus:border-white/30 transition-colors"
                  />

                  <div className="flex justify-end">
                    <GlassButton
                      variant="subtle"
                      size="sm"
                      icon={<Save className="w-3 h-3" />}
                      onClick={handleSavePrivateNote}
                      loading={isSavingNote}
                    >
                      Save Private Note
                    </GlassButton>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* LAYER 2: PROFILE WORLDS */}
          {activeLayer === 'worlds' && (
            <div className="space-y-4 animate-fadeIn">
              <ProfileWorldsHub
                userId={profile.id}
                isOwner={isSelf}
                viewerId="usr_me"
                onClose={() => setActiveLayer('public')}
              />
            </div>
          )}

          {/* LAYER 3: README.MD (GITHUB FLAVORED MARKDOWN) */}
          {activeLayer === 'readme' && (
            <div className="p-4 rounded-3xl dark-glass border border-white/10 space-y-3 shadow-xl animate-fadeIn">
              <div className="flex items-center justify-between pb-2 border-b border-white/10 text-xs">
                <div className="flex items-center gap-1.5 text-zinc-300">
                  <FileText className="w-4 h-4 text-zinc-300" />
                  <span className="font-mono font-bold text-zinc-200">@{profile.username} / README.md</span>
                </div>
                <span className="text-[10px] font-mono text-zinc-500">Rendered via GFM</span>
              </div>

              {profileMarkdown ? (
                <div className="pt-2">
                  <GitHubMarkdownRenderer
                    content={profileMarkdown.content}
                  />
                </div>
              ) : (
                <p className="text-xs text-zinc-400 py-6 text-center">
                  This user has not published a markdown README yet.
                </p>
              )}
            </div>
          )}

          {/* LAYER 4: DATING DNA */}
          {activeLayer === 'dating' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-4 rounded-3xl dark-glass border border-white/10 shadow-lg">
                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between items-center py-1 border-b border-white/5">
                    <span className="text-zinc-400">Relationship Intention:</span>
                    <span className="font-bold text-white">{profile.intent}</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-white/5">
                    <span className="text-zinc-400">Social Battery:</span>
                    <span className="font-bold text-zinc-100">{profile.energy} ({profile.socialEnergy})</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-white/5">
                    <span className="text-zinc-400">Conflict Style:</span>
                    <span className="font-bold text-zinc-100">{profile.conflictStyle}</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-zinc-400">Affection Language:</span>
                    <span className="font-bold text-zinc-100">{profile.affectionStyle}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-3xl dark-glass border border-white/10 space-y-1.5">
                <span className="text-[10px] font-bold text-zinc-400 uppercase">Ideal First Conversation</span>
                <p className="text-xs text-zinc-100">{profile.idealConversation}</p>
              </div>
            </div>
          )}

          {/* LAYER 5: PRIVATE LAYER */}
          {activeLayer === 'private' && (
            <div className="p-6 rounded-3xl dark-glass text-center space-y-3 animate-fadeIn border border-white/10">
              <div className="w-12 h-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white mx-auto">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">Protected Layer</h3>
              <p className="text-xs text-zinc-400 max-w-xs mx-auto">
                Exact contact information, social links, and intimate photos are unlocked only after mutual approval to protect privacy.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Floating Pill: Edit Info (73% complete) - Images 11, 12, 13, 14 */}
      {isSelf && (
        <div className="fixed bottom-20 inset-x-0 z-40 flex justify-center pointer-events-none">
          <button
            onClick={() => setIsEditInfoOpen(true)}
            className="pointer-events-auto px-5 py-2.5 rounded-full bg-white text-[#090A0E] font-black text-xs shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer border border-white/40"
          >
            <span>Edit Info</span>
            <span className="text-zinc-500 font-mono font-bold">({userAttributes.completionPercentage}% complete)</span>
          </button>
        </div>
      )}

      {/* Floating Bottom Action Bar */}
      <div className="fixed bottom-0 inset-x-0 z-40 max-w-md mx-auto p-4 bg-gradient-to-t from-[#090A0E] via-[#090A0E]/90 to-transparent flex items-center gap-3">
        <button
          onClick={() => onSuperLike(profile)}
          className="w-12 h-12 rounded-2xl dark-glass flex items-center justify-center text-zinc-300 border border-white/20 shadow-lg cursor-pointer hover:text-white hover:border-white/40 active:scale-95 transition-all"
          title="Super Like"
        >
          <Star className="w-5 h-5 fill-current" />
        </button>

        <GlassButton
          variant="default"
          size="md"
          icon={<MessageCircle className="w-4 h-4 text-white" />}
          onClick={() => {
            onClose();
            onInitiateChat(profile);
          }}
          className="flex-1"
        >
          Message {profile.name}
        </GlassButton>
      </div>

      {/* Edit Profile Info Modal */}
      <EditProfileInfoModal
        isOpen={isEditInfoOpen}
        onClose={() => setIsEditInfoOpen(false)}
        onAttributesUpdated={(updated) => setUserAttributes(updated)}
      />
    </div>
  );
};
