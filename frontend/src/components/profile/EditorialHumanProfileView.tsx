import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  ShieldCheck, 
  Heart, 
  MessageCircle, 
  Star, 
  Globe2, 
  Lock, 
  Edit3, 
  ChevronRight, 
  Film, 
  Clock, 
  Calendar, 
  Compass, 
  BookOpen, 
  Music, 
  Coffee, 
  Smile, 
  Share2, 
  Check, 
  ArrowLeft,
  X,
  Sparkles,
  Quote,
  Loader2
} from 'lucide-react';
import { socialApiClient } from '../../services/socialApiClient';
import type { SocialPostItem } from '../../types/social';
import type { UserProfile } from '../../types';

interface EditorialHumanProfileViewProps {
  profile: UserProfile;
  isSelf?: boolean;
  onEditProfile?: () => void;
  onInitiateChat?: (profile: UserProfile) => void;
  onSuperLike?: (profile: UserProfile) => void;
  onClose?: () => void;
}

export const EditorialHumanProfileView: React.FC<EditorialHumanProfileViewProps> = ({
  profile,
  isSelf = false,
  onEditProfile,
  onInitiateChat,
  onSuperLike,
  onClose
}) => {
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const [copiedLink, setCopiedLink] = useState(false);
  const [creatorPosts, setCreatorPosts] = useState<SocialPostItem[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(false);

  useEffect(() => {
    if (profile?.id) {
      setLoadingPosts(true);
      socialApiClient.getCreatorPosts(profile.id)
        .then(res => setCreatorPosts(res.items || []))
        .catch(() => setCreatorPosts([]))
        .finally(() => setLoadingPosts(false));
    }
  }, [profile?.id]);

  const photos = profile.photos && profile.photos.length > 0 
    ? profile.photos 
    : [profile.avatar, 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800'];

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-8 pb-32 text-zinc-100 font-body animate-fadeIn">
      
      {/* ── TOP STICKY BAR (When in modal sheet or inspecting) ── */}
      {onClose && (
        <div className="sticky top-0 z-30 h-14 bg-[#0A0B0F]/90 backdrop-blur-xl border-b border-white/[0.08] px-4 flex items-center justify-between">
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-zinc-300 hover:text-white transition-colors cursor-pointer"
            title="Close Dossier"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          
          <div className="text-center">
            <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-bold block">
              Digital Human Identity
            </span>
            <span className="text-sm font-bold text-white font-heading truncate">
              {profile.name}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="p-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-zinc-300 hover:text-white transition-colors cursor-pointer"
              title="Share Profile Link"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
            </button>
            {isSelf && onEditProfile && (
              <button
                onClick={onEditProfile}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 1. THE PERSON (Hero Photography, Name, Location, Core Introduction)   */}
      {/* ===================================================================== */}
      <section className="space-y-4">
        {/* Full Portrait Photography Gallery */}
        <div className="relative w-full aspect-[3/4] sm:aspect-[4/5] rounded-3xl overflow-hidden bg-[#12141D] border border-white/[0.08] shadow-2xl">
          <img 
            src={photos[activePhotoIdx]} 
            alt={profile.name}
            className="w-full h-full object-cover object-center transition-all duration-300"
          />

          {/* Vignette Bottom Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0B0F] via-transparent to-black/30 pointer-events-none" />

          {/* Privacy Pill & Verification Top Bar */}
          <div className="absolute top-4 inset-x-4 flex items-center justify-between pointer-events-none z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-[11px] font-mono text-zinc-200">
              <Globe2 className="w-3 h-3 text-sky-400" />
              <span>Public Identity</span>
            </div>

            {profile.compatibilityScore && (
              <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-xs font-mono font-bold text-white">
                <Heart className="w-3 h-3 text-rose-400 fill-rose-400/40" />
                <span>{profile.compatibilityScore}% Resonance</span>
              </div>
            )}
          </div>

          {/* Photo Dots Navigation */}
          {photos.length > 1 && (
            <div className="absolute bottom-4 inset-x-0 flex items-center justify-center gap-1.5 z-20">
              {photos.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActivePhotoIdx(idx)}
                  className={`h-1.5 rounded-full transition-all cursor-pointer ${
                    activePhotoIdx === idx 
                      ? 'w-6 bg-white shadow-md' 
                      : 'w-1.5 bg-white/40 hover:bg-white/70'
                  }`}
                  aria-label={`Photo ${idx + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Identity Headings & Personal Introduction */}
        <div className="p-6 rounded-3xl dark-glass border border-white/[0.08] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-white/[0.06] pb-4">
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-heading tracking-tight">
                  {profile.name}
                </h1>
                <span className="text-2xl sm:text-3xl text-zinc-400 font-normal">
                  {profile.age}
                </span>
                {Boolean(profile.verifications?.photoVerified || profile.verifications?.idDocumentVerified) && (
                  <span title="Verified Identity">
                    <ShieldCheck className="w-6 h-6 text-sky-400 shrink-0" />
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-400 flex items-center gap-1.5 mt-1">
                <MapPin className="w-3.5 h-3.5 text-zinc-500" />
                <span>{profile.location}</span>
                <span>•</span>
                <span className="text-zinc-300 font-medium">{profile.status || 'Active Member'}</span>
              </p>
            </div>

            {/* Quick action buttons if inspecting another user */}
            {!isSelf && onInitiateChat && onSuperLike && (
              <div className="flex items-center gap-2 pt-2 sm:pt-0">
                <button
                  onClick={() => onSuperLike(profile)}
                  className="h-10 px-3.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
                  title="Super Like"
                >
                  <Star className="w-3.5 h-3.5 fill-amber-400/40" />
                  <span>Super Like</span>
                </button>
                <button
                  onClick={() => onInitiateChat(profile)}
                  className="h-10 px-4 rounded-xl bg-gradient-to-r from-rose-500 to-[#D94668] hover:opacity-95 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-lg shadow-rose-500/20"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Message</span>
                </button>
              </div>
            )}
          </div>

          {/* Personal Bio Quotation */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 font-bold block">
              Personal Introduction
            </span>
            <p className="text-base text-zinc-200 leading-relaxed font-body italic border-l-2 border-rose-500/50 pl-3.5">
              "{profile.aboutMeLong || profile.tagline || profile.headline || 'Finding beauty in slow conversations and honest human resonance.'}"
            </p>
          </div>

          {/* Identity Essentials Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
            <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
              <span className="text-[10px] text-zinc-500 font-mono block">Occupation</span>
              <span className="text-xs font-bold text-white block mt-0.5 truncate">{profile.headline || 'Independent Creator'}</span>
            </div>
            <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
              <span className="text-[10px] text-zinc-500 font-mono block">Height</span>
              <span className="text-xs font-bold text-white block mt-0.5">187 cm (6'1")</span>
            </div>
            <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
              <span className="text-[10px] text-zinc-500 font-mono block">Education</span>
              <span className="text-xs font-bold text-white block mt-0.5 truncate">BSc Architecture</span>
            </div>
            <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
              <span className="text-[10px] text-zinc-500 font-mono block">Hometown</span>
              <span className="text-xs font-bold text-white block mt-0.5 truncate">Kandy</span>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* 2. THEIR WORLD (Lifestyle, Interests, Routines, Activities)           */}
      {/* ===================================================================== */}
      <section className="p-6 rounded-3xl dark-glass border border-white/[0.08] space-y-4">
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <h2 className="text-lg font-bold text-white font-heading">Their World</h2>
            <span className="text-xs text-zinc-500 font-mono">Lifestyle & Daily Rhythms</span>
          </div>
          <div className="inline-flex items-center gap-1 text-[11px] font-mono text-zinc-400">
            <Globe2 className="w-3 h-3 text-sky-400" />
            <span>Public</span>
          </div>
        </div>

        {/* Core Interests & Passions */}
        <div className="space-y-2">
          <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold block">
            Core Passions & Hobbies
          </span>
          <div className="flex items-center gap-2 flex-wrap">
            {(profile.interests || ['Astrophotography', 'Philosophy', 'Indie Games', 'Vinyl Records', 'Coffee Architecture']).map((tag) => (
              <span 
                key={tag}
                className="px-3 py-1 rounded-xl text-xs font-medium bg-white/[0.05] hover:bg-white/[0.09] text-zinc-200 border border-white/10 transition-colors"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Daily Habits Matrix */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2">
          <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] space-y-1">
            <span className="text-[10px] font-mono text-zinc-500 block">Weekly Rhythm</span>
            <p className="text-xs font-bold text-white">4x gym + long walks</p>
          </div>
          <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] space-y-1">
            <span className="text-[10px] font-mono text-zinc-500 block">Phone Habit</span>
            <p className="text-xs font-bold text-white">Silent mode / Mindful</p>
          </div>
          <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] space-y-1">
            <span className="text-[10px] font-mono text-zinc-500 block">Pets</span>
            <p className="text-xs font-bold text-white">Dog person & bird lover</p>
          </div>
          <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] space-y-1">
            <span className="text-[10px] font-mono text-zinc-500 block">Social Drinking</span>
            <p className="text-xs font-bold text-white">Occasional red wine</p>
          </div>
          <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] space-y-1">
            <span className="text-[10px] font-mono text-zinc-500 block">Weekend Ritual</span>
            <p className="text-xs font-bold text-white">Bookstore mornings</p>
          </div>
          <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] space-y-1">
            <span className="text-[10px] font-mono text-zinc-500 block">Sleep Cycle</span>
            <p className="text-xs font-bold text-white">Midnight owl</p>
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* 3. THEIR MIND (Personality, Emotional Intelligence, Values, Beliefs)  */}
      {/* ===================================================================== */}
      <section className="p-6 rounded-3xl dark-glass border border-white/[0.08] space-y-4">
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-purple-400" />
            <h2 className="text-lg font-bold text-white font-heading">Their Mind</h2>
            <span className="text-xs text-zinc-500 font-mono">EI, Values & Core Perspectives</span>
          </div>
          <div className="inline-flex items-center gap-1 text-[11px] font-mono text-rose-300">
            <Heart className="w-3 h-3 fill-rose-400/40" />
            <span>Connections Only</span>
          </div>
        </div>

        {/* Core Values */}
        <div className="space-y-2">
          <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold block">
            Core Values & Moral Compass
          </span>
          <div className="flex items-center gap-2 flex-wrap">
            {(profile.coreValues || ['Authenticity', 'Radical Honesty', 'Intellectual Curiosity', 'Quiet Loyalty']).map((val) => (
              <span 
                key={val}
                className="px-3 py-1 rounded-xl text-xs font-bold bg-purple-500/10 text-purple-300 border border-purple-500/25"
              >
                {val}
              </span>
            ))}
          </div>
        </div>

        {/* Introspective Perspective / Unspoken Truth */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-950/20 to-black/60 border border-purple-500/20 space-y-2">
          <span className="text-[10px] font-mono uppercase tracking-wider text-purple-300 font-bold block">
            Deep Relational Boundary
          </span>
          <p className="text-xs font-bold text-zinc-200">
            "What is a personal boundary you only learned to set after someone quietly crossed it?"
          </p>
          <p className="text-xs text-zinc-300 font-editorial italic border-l-2 border-purple-400 pl-3 leading-relaxed">
            "{profile.idealConversation || 'I learned that my peace is not negotiable. I don\'t engage with passive aggression anymore; I address friction directly with calm curiosity.'}"
          </p>
        </div>

        {/* Personality Spectrum Chips */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
            <span className="text-[10px] text-zinc-500 font-mono block">Attachment Style</span>
            <span className="text-xs font-bold text-white block mt-0.5">Secure / Self-Aware</span>
          </div>
          <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
            <span className="text-[10px] text-zinc-500 font-mono block">Energy Recharge</span>
            <span className="text-xs font-bold text-white block mt-0.5">{profile.socialEnergy || 'Recharge in Solitude'}</span>
          </div>
          <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
            <span className="text-[10px] text-zinc-500 font-mono block">Conflict Approach</span>
            <span className="text-xs font-bold text-white block mt-0.5">{profile.conflictStyle || 'Direct & Gentle'}</span>
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* 4. THEIR STORY (Life Experiences, Memories, Milestones, Challenges)   */}
      {/* ===================================================================== */}
      <section className="p-6 rounded-3xl dark-glass border border-white/[0.08] space-y-4">
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <h2 className="text-lg font-bold text-white font-heading">Their Story</h2>
            <span className="text-xs text-zinc-500 font-mono">Milestones & Life Chapters</span>
          </div>
          <div className="inline-flex items-center gap-1 text-[11px] font-mono text-rose-300">
            <Heart className="w-3 h-3 fill-rose-400/40" />
            <span>Connections Only</span>
          </div>
        </div>

        {/* Chronological Life Timeline */}
        <div className="space-y-4 divide-y divide-white/[0.06]">
          <div className="pt-2 flex items-start gap-3">
            <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-lg shrink-0 mt-0.5">
              2026
            </span>
            <div className="space-y-0.5">
              <h4 className="text-xs font-bold text-white">Solo Astrophotography Expedition</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Spent three nights under high altitude skies capturing the core of the Milky Way in total solitude. Learned to embrace silence without anxiety.
              </p>
            </div>
          </div>

          <div className="pt-3 flex items-start gap-3">
            <span className="text-xs font-mono font-bold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-lg shrink-0 mt-0.5">
              2024
            </span>
            <div className="space-y-0.5">
              <h4 className="text-xs font-bold text-white">Left Corporate Agency to Build Independently</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Took the leap into independent software architecture and creative writing. High risk, but restored my creative sovereignty.
              </p>
            </div>
          </div>

          <div className="pt-3 flex items-start gap-3">
            <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-lg shrink-0 mt-0.5">
              2022
            </span>
            <div className="space-y-0.5">
              <h4 className="text-xs font-bold text-white">Backpacked South Asia Without Itinerary</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Learned that unplanned moments are usually the only ones that actually change how you see other human beings.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* 5. THEIR IMAGINATION (Dreams, Fictional Worlds, Aesthetic Vision)    */}
      {/* ===================================================================== */}
      <section className="p-6 rounded-3xl dark-glass border border-white/[0.08] space-y-4">
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-400" />
            <h2 className="text-lg font-bold text-white font-heading">Their Imagination</h2>
            <span className="text-xs text-zinc-500 font-mono">Worlds, Dreams & Future Aesthetic</span>
          </div>
          <div className="inline-flex items-center gap-1 text-[11px] font-mono text-zinc-400">
            <Globe2 className="w-3 h-3 text-sky-400" />
            <span>Public</span>
          </div>
        </div>

        {/* Profile Worlds Dimension Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-bold text-rose-300 font-mono">
              <Film className="w-3.5 h-3.5 text-rose-400" />
              <span>Cinematic Universe</span>
            </div>
            <h4 className="text-sm font-bold text-white">Noir Detective / Neon Archivist</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Drawn to rain-soaked midnights, analog tape decks, and uncovering forgotten stories in old city quarters.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-bold text-sky-300 font-mono">
              <Compass className="w-3.5 h-3.5 text-sky-400" />
              <span>Aspirational Future</span>
            </div>
            <h4 className="text-sm font-bold text-white">Hill Country Sanctuary with Glass Studio</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              A minimalist timber home surrounded by mist, hosting small dinners with deep thinkers and making music.
            </p>
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* 6. THEIR SOCIAL WORLD (Intentions, Communication, Love Languages)     */}
      {/* ===================================================================== */}
      <section className="p-6 rounded-3xl dark-glass border border-white/[0.08] space-y-4">
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-teal-400" />
            <h2 className="text-lg font-bold text-white font-heading">Their Social World</h2>
            <span className="text-xs text-zinc-500 font-mono">Relationship Intent & Communication</span>
          </div>
          <div className="inline-flex items-center gap-1 text-[11px] font-mono text-zinc-400">
            <Globe2 className="w-3 h-3 text-sky-400" />
            <span>Public</span>
          </div>
        </div>

        {/* Intention Pill Banner */}
        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 block">Looking For</span>
            <p className="text-sm font-bold text-white">
              {profile.intent === 'Dating' ? 'Long-term intentional partnership with emotional depth' : 'Curious kindred spirits & deep friendship'}
            </p>
          </div>
          <span className="text-2xl">🧐</span>
        </div>

        {/* Communication & Love Language Attributes */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
            <span className="text-[10px] text-zinc-500 font-mono block">Communication</span>
            <span className="text-xs font-bold text-white block mt-0.5">Late night voice notes</span>
          </div>
          <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
            <span className="text-[10px] text-zinc-500 font-mono block">Primary Love Language</span>
            <span className="text-xs font-bold text-white block mt-0.5">Quality Time & Presence</span>
          </div>
          <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
            <span className="text-[10px] text-zinc-500 font-mono block">First Date Preference</span>
            <span className="text-xs font-bold text-white block mt-0.5">Gallery walk & warm tea</span>
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* 7. THEIR EXPRESSIONS & THOUGHTS (Public Post Dossier)                 */}
      {/* ===================================================================== */}
      <section className="p-6 rounded-3xl dark-glass border border-white/[0.08] space-y-4">
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            <h2 className="text-lg font-bold text-white font-heading">Public Expressions</h2>
            <span className="text-xs text-zinc-500 font-mono">Thoughts, Quotes & Creations</span>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-white/[0.06] text-xs font-mono text-zinc-300">
            {creatorPosts.length} shared
          </span>
        </div>

        {loadingPosts ? (
          <div className="flex items-center justify-center py-8 text-zinc-500 gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-rose-500" />
            <span className="text-xs">Loading creations...</span>
          </div>
        ) : creatorPosts.length === 0 ? (
          <div className="text-center py-8 text-zinc-500 space-y-1">
            <Sparkles className="w-6 h-6 mx-auto text-zinc-600 stroke-1" />
            <p className="text-xs">No public expressions shared yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {creatorPosts.map(post => (
              <div
                key={post.id}
                className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.1] transition-all space-y-2"
              >
                <div className="flex items-center justify-between text-[11px] text-zinc-400 font-mono">
                  <span className="uppercase text-rose-400 font-bold tracking-wider">
                    {post.post_type}
                  </span>
                  <span>{new Date(post.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>

                {post.title && (
                  <h3 className="text-sm font-bold text-white font-heading">
                    {post.title}
                  </h3>
                )}

                <p className="text-xs text-zinc-300 leading-relaxed line-clamp-3">
                  {post.content}
                </p>

                {post.media_urls && post.media_urls.length > 0 && (
                  <div className="pt-1 rounded-xl overflow-hidden">
                    <img
                      src={post.media_urls[0]}
                      alt="Expression media"
                      className="w-full max-h-48 object-cover rounded-xl border border-white/10"
                    />
                  </div>
                )}

                <div className="pt-2 flex items-center gap-4 text-xs text-zinc-500">
                  <span className="flex items-center gap-1">
                    <Heart className="w-3.5 h-3.5 text-rose-500" />
                    <span>{post.likes_count}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageCircle className="w-3.5 h-3.5 text-zinc-400" />
                    <span>{post.comments_count}</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Bottom Sticky Action Bar (For Non-Owner viewing) */}
      {!isSelf && onInitiateChat && onSuperLike && (
        <div className="fixed bottom-0 inset-x-0 z-40 p-4 bg-[#0A0B0F]/95 backdrop-blur-xl border-t border-white/[0.08] flex items-center justify-center gap-3">
          <button
            onClick={() => onSuperLike(profile)}
            className="flex-1 max-w-xs h-12 rounded-2xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Star className="w-4 h-4 fill-amber-400/40" />
            <span>Super Like</span>
          </button>
          <button
            onClick={() => onInitiateChat(profile)}
            className="flex-1 max-w-xs h-12 rounded-2xl bg-gradient-to-r from-rose-500 to-[#D94668] hover:opacity-95 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-rose-500/25 active:scale-98"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Initiate Conversation</span>
          </button>
        </div>
      )}

    </div>
  );
};
