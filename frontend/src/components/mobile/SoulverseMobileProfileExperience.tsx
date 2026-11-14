import React, { useState } from 'react';
import { 
  User, 
  Sparkles, 
  ShieldCheck, 
  ShieldAlert, 
  Clock, 
  Edit3, 
  Settings, 
  Globe2, 
  ChevronRight, 
  Share2, 
  Music, 
  ExternalLink, 
  Sliders, 
  Check, 
  Eye, 
  Lock, 
  Tv, 
  Plus, 
  Info,
  Smartphone,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { CURRENT_USER } from '../../mockData';
import { useSpotifyMusic } from '../../context/SpotifyMusicContext';
import type { UserProfile } from '../../types';
import { ContextualEmotionalBanner } from '../emotional/ContextualEmotionalBanner';

interface SoulverseMobileProfileExperienceProps {
  onNavigateToSettings: () => void;
  onNavigateToTimeline: () => void;
  onNavigateToAdmin: () => void;
  onOpenCharacterBuilder: () => void;
  onEditProfileModal: () => void;
  onOpenUnspoken?: () => void;
}

export const SoulverseMobileProfileExperience: React.FC<SoulverseMobileProfileExperienceProps> = ({
  onNavigateToSettings,
  onNavigateToTimeline,
  onNavigateToAdmin,
  onOpenCharacterBuilder,
  onEditProfileModal,
  onOpenUnspoken
}) => {
  const profile = CURRENT_USER;
  const { track: _spotifyTrack, isPlaying: _isSpotifyPlaying, togglePlay: _togglePlay, setIsLinkModalOpen } = useSpotifyMusic();

  // Active Identity Space: 'real' | 'cinematic' | 'fantasy' | 'aspirational'
  const [activePersona, setActivePersona] = useState<'real' | 'cinematic' | 'fantasy' | 'aspirational'>('real');
  const [copiedProfileLink, setCopiedProfileLink] = useState(false);

  // Life Timeline Scrubber selection
  const [selectedTimelineYear, setSelectedTimelineYear] = useState<string>('2026');

  // Granular External Social Integrations State (Prompt Section 5)
  const [socialIntegrations, setSocialIntegrations] = useState([
    {
      id: 'google',
      name: 'Google',
      description: 'Account authentication & single sign-on',
      status: 'connected',
      handle: 'kavindu.dev@gmail.com',
      canRevoke: false,
      isPrimary: true,
      enabled: true
    },
    {
      id: 'spotify',
      name: 'Spotify',
      description: 'Music preferences, anthem & ambient playback',
      status: 'connected',
      handle: 'Connected (Anthem Active)',
      canRevoke: true,
      isPrimary: false,
      enabled: true
    },
    {
      id: 'instagram',
      name: 'Instagram',
      description: 'Social photo profile linking & gallery preview',
      status: 'connected',
      handle: '@kavindu.visuals',
      canRevoke: true,
      isPrimary: false,
      enabled: true
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      description: 'Professional identity & career verification',
      status: 'connected',
      handle: 'kavindu-senanayake',
      canRevoke: true,
      isPrimary: false,
      enabled: true
    },
    {
      id: 'telegram',
      name: 'Telegram',
      description: 'External communication & luck mini-games',
      status: 'connected',
      handle: '@kavindu_telegram',
      canRevoke: true,
      isPrimary: false,
      enabled: true
    },
    {
      id: 'whatsapp',
      name: 'WhatsApp',
      description: 'Encrypted direct contact and sharing',
      status: 'disconnected',
      handle: 'Not linked',
      canRevoke: true,
      isPrimary: false,
      enabled: false
    },
    {
      id: 'facebook',
      name: 'Facebook',
      description: 'Social account linking & mutual friends',
      status: 'disconnected',
      handle: 'Not linked',
      canRevoke: true,
      isPrimary: false,
      enabled: false
    }
  ]);

  const toggleIntegration = (id: string) => {
    setSocialIntegrations(prev => prev.map(item => {
      if (item.id === id) {
        const nextEnabled = !item.enabled;
        return {
          ...item,
          enabled: nextEnabled,
          status: nextEnabled ? 'connected' : 'disconnected'
        };
      }
      return item;
    }));
  };

  // Persona Content Definitions
  const personaDetails = {
    real: {
      name: profile.name,
      title: 'Full-Stack Developer & Indie Creator',
      typeLabel: 'Verified Real Identity',
      isVerifiedReal: true,
      avatar: profile.avatar,
      cover: 'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?auto=format&fit=crop&w=1200&q=80',
      tagline: 'Building ethical software that fosters genuine psychological safety.',
      bio: 'BSc (Hons) in Computer Science at UCSC. Passionate about system architecture, indie games, and late night discussions.',
      attributes: [
        { label: 'Circadian', value: 'Night Owl' },
        { label: 'Love Style', value: 'Quality Time' },
        { label: 'Conflict', value: 'Direct & Gentle' },
        { label: 'Education', value: 'University of Colombo' }
      ]
    },
    cinematic: {
      name: 'Kavindu (Noir Edition)',
      title: 'The Rain-Soaked Archival Detective',
      typeLabel: 'Cinematic Fictional Persona',
      isVerifiedReal: false,
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80',
      cover: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1200&q=80',
      tagline: 'Watching neon reflections wash over cobblestone alleys at 2 AM.',
      bio: 'A quiet observer inspired by Blade Runner, Batman in the rain, and Wong Kar-wai color palettes. Preserving lost memories through analog film.',
      attributes: [
        { label: 'Atmosphere', value: 'Film Noir & Rain' },
        { label: 'Anthem', value: 'Vangelis - Tears in Rain' },
        { label: 'Archetype', value: 'Reluctant Hero' },
        { label: 'Camera', value: '1974 Olympus OM-1' }
      ]
    },
    fantasy: {
      name: 'Archivist of the Silent Citadel',
      title: 'Keeper of Ancient Astrolabes & Lost Stars',
      typeLabel: 'Fantasy Realm Identity',
      isVerifiedReal: false,
      avatar: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=400&q=80',
      cover: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80',
      tagline: 'Deciphering constellations that have disappeared from modern skies.',
      bio: 'In a mountainous library carved from obsidian quartz, I curate the thoughts people forgot to say aloud before dawn.',
      attributes: [
        { label: 'Realm', value: 'Citadel of Silent Quartz' },
        { label: 'Element', value: 'Misty Ether' },
        { label: 'Companion', value: 'Mechanical Raven' },
        { label: 'Guild', value: 'Chronicle Weavers' }
      ]
    },
    aspirational: {
      name: 'Kavindu 2030',
      title: 'Decentralized Sanctuary Architect & Author',
      typeLabel: 'Future Self · Aspirational Era',
      isVerifiedReal: false,
      avatar: profile.avatar,
      cover: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
      tagline: 'Living off-grid in the Knuckles mountain forest while running global ethical protocols.',
      bio: 'A future where technology serves nervous systems rather than dopamine addiction. 100% solar powered, lush vegetable gardens, and an analog recording studio.',
      attributes: [
        { label: 'Target Year', value: '2030 - 2035' },
        { label: 'Lifestyle', value: 'Off-Grid Cabin & Solar' },
        { label: 'Legacy', value: 'Humane Tech Manifesto' },
        { label: 'Mindset', value: 'Deep Calm & Generosity' }
      ]
    }
  };

  const currentPersona = personaDetails[activePersona];

  // Life Timeline Milestones for Scrubber
  const timelineMilestones: Record<string, { title: string; era: string; description: string; tag: string }> = {
    '350 BCE': {
      title: 'Apprentice at the Library of Alexandria',
      era: 'Historical Timeline (BCE)',
      description: 'Copying geometry scrolls and astronomical papyri under oil lamps by the Mediterranean sea.',
      tag: 'Ancient History'
    },
    '2014': {
      title: 'Trinity College Astronomical Society',
      era: 'Youth & Astronomy',
      description: 'First telescope observations of Saturn’s rings from the hill country verandah.',
      tag: 'High School'
    },
    '2021': {
      title: 'Physical Science & Advanced Mathematics',
      era: 'Academic Foundation',
      description: 'Completed GCE Advanced Levels with a focus on physics, calculus, and computational logic.',
      tag: 'Education'
    },
    '2023': {
      title: 'First Independent Software Architecture',
      era: 'Software Engineering',
      description: 'Began building ethical social architectures designed to eliminate compulsive behavioral loops.',
      tag: 'Creation'
    },
    '2026': {
      title: 'Soulverse: The Multi-Identity Sanctuary',
      era: 'Present Day (2026)',
      description: 'Developing the living universe platform allowing humans to express both their real and imaginary lives.',
      tag: 'Active Era'
    },
    '2035': {
      title: 'The Sovereign Forest Co-op',
      era: 'Imagined Future Era',
      description: 'A sanctuary retreat in Knuckles mountains hosting indie creators, philosophers, and stargazers.',
      tag: 'Future Dream'
    }
  };

  return (
    <div className="w-full space-y-8 pb-32 max-w-2xl mx-auto animate-fadeIn px-1 sm:px-2">
      
      {/* 1. TOP HEADER ACTIONS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <div>
          <h1 className="type-page-heading flex items-center gap-2.5">
            <User className="w-6 h-6 text-amber-300" />
            <span>Identity Sanctuary</span>
          </h1>
          <p className="type-supporting mt-1">Multiple lives, real identity, timeline and external integrations</p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={onNavigateToSettings}
            className="h-10 px-3.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-zinc-300 hover:text-white border border-white/10 transition-colors cursor-pointer flex items-center gap-2 text-xs font-heading font-semibold"
            title="Settings"
          >
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </button>
          <button
            onClick={onNavigateToAdmin}
            className="h-10 px-3.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/25 transition-colors cursor-pointer flex items-center gap-2 text-xs font-heading font-semibold"
            title="Admin Console"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Admin</span>
          </button>
        </div>
      </div>

      {/* CONTEXTUAL EMOTIONAL LAYER ("Beyond What People See") */}
      <ContextualEmotionalBanner 
        page="profile" 
        onOpenUnspoken={onOpenUnspoken} 
      />

      {/* 2. PERSONA SWITCHER PILLS (Real Me, Cinematic Me, Fantasy Life, Aspirational) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1 text-xs font-heading font-bold">
          <span className="text-zinc-400 uppercase tracking-wider">Switch Persona &amp; Universe</span>
          <button 
            onClick={onOpenCharacterBuilder}
            className="text-amber-300 hover:text-white flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Persona</span>
          </button>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {[
            { id: 'real' as const, label: '👤 Real Me', sub: 'Verified' },
            { id: 'cinematic' as const, label: '🎬 Cinematic Me', sub: 'Noir' },
            { id: 'fantasy' as const, label: '🏰 Fantasy Life', sub: 'Realm' },
            { id: 'aspirational' as const, label: '🚀 2030 Self', sub: 'Future' }
          ].map(p => (
            <button
              key={p.id}
              onClick={() => setActivePersona(p.id)}
              className={`h-10 px-4 rounded-full text-xs font-heading font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
                activePersona === p.id
                  ? 'bg-white text-[#090A0E] shadow-md font-bold'
                  : 'bg-white/[0.04] text-zinc-300 hover:text-white hover:bg-white/[0.08] border border-white/10'
              }`}
            >
              <span>{p.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 3. HERO IDENTITY CARD */}
      <div className="sv-card p-0 overflow-hidden relative">
        {/* Cover Image */}
        <div className="relative h-44 sm:h-56 w-full overflow-hidden bg-black/60">
          <img
            src={currentPersona.cover}
            alt="Cover"
            className="w-full h-full object-cover transition-all duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#090A0E] via-black/35 to-black/30 pointer-events-none" />

          {/* Persona Verification Disclaimer Tag */}
          <div className="absolute top-4 left-4">
            {currentPersona.isVerifiedReal ? (
              <span className="h-8 px-3.5 rounded-full text-xs font-heading font-bold bg-emerald-500/80 backdrop-blur-md text-white border border-emerald-400/40 flex items-center gap-1.5 shadow-md">
                <ShieldCheck className="w-4 h-4" />
                <span>Verified Real-Life Human</span>
              </span>
            ) : (
              <span className="h-8 px-3.5 rounded-full text-xs font-heading font-bold bg-purple-500/80 backdrop-blur-md text-white border border-purple-400/40 flex items-center gap-1.5 shadow-md">
                <Sparkles className="w-4 h-4" />
                <span>Fictional / Creative Universe</span>
              </span>
            )}
          </div>

          <button
            onClick={onEditProfileModal}
            className="absolute top-4 right-4 h-9 px-3.5 rounded-xl bg-black/60 backdrop-blur-md hover:bg-black/80 text-white text-xs font-heading font-bold border border-white/20 flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit</span>
          </button>
        </div>

        {/* Profile Avatar & Info Section */}
        <div className="px-6 sm:px-8 pb-8 pt-0 relative">
          <div className="flex justify-between items-end -mt-14 mb-4">
            <div className="relative">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-4 border-[#090A0E] shadow-2xl bg-black ring-2 ring-white/20">
                <img
                  src={currentPersona.avatar}
                  alt={currentPersona.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-emerald-400 border-2 border-[#090A0E] shadow-[0_0_8px_#10B981]" />
            </div>

            <button
              onClick={() => {
                navigator.clipboard.writeText(`${window.location.origin}/@${(currentPersona as any).handle || 'kavindu'}`);
                setCopiedProfileLink(true);
                setTimeout(() => setCopiedProfileLink(false), 2000);
              }}
              className="h-10 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-heading font-bold border border-white/15 flex items-center gap-2 cursor-pointer transition-all"
            >
              {copiedProfileLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
              <span>{copiedProfileLink ? 'Link Copied!' : 'Share Profile'}</span>
            </button>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-heading tracking-tight">
                {currentPersona.name}
              </h2>
              {currentPersona.isVerifiedReal && (
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
              )}
            </div>

            <p className="type-card-heading text-zinc-300 font-medium">
              {currentPersona.title}
            </p>

            <p className="type-body text-zinc-400 italic pt-1">
              "{currentPersona.tagline}"
            </p>
          </div>

          <p className="type-body text-zinc-200 leading-relaxed mt-4 pt-4 border-t border-white/[0.08]">
            {currentPersona.bio}
          </p>

          {/* Persona Specific Attributes Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
            {currentPersona.attributes.map(attr => (
              <div key={attr.label} className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-xs">
                <span className="text-[11px] text-zinc-400 uppercase font-heading font-bold tracking-wider block">
                  {attr.label}
                </span>
                <span className="text-zinc-100 font-semibold mt-1 block truncate text-sm">
                  {attr.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. LIFE TIMELINE EXPLORER (Historical BCE/BC, Modern, Imagined) */}
      <div className="sv-card space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Clock className="w-5 h-5 text-amber-300" />
            <h3 className="type-card-heading font-bold text-white uppercase tracking-wider">
              Life Timeline &amp; Eras
            </h3>
          </div>
          <button
            onClick={onNavigateToTimeline}
            className="text-xs font-heading font-bold text-amber-300 hover:text-white transition-colors cursor-pointer"
          >
            Full Timeline ›
          </button>
        </div>

        <p className="type-supporting text-zinc-300">
          Explore historical milestones, present entries, or imagined future timelines.
        </p>

        {/* Timeline Year Scrubber Chips */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {Object.keys(timelineMilestones).map(year => (
            <button
              key={year}
              onClick={() => setSelectedTimelineYear(year)}
              className={`h-10 px-4 rounded-xl text-xs font-heading font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 flex items-center ${
                selectedTimelineYear === year
                  ? 'bg-white text-[#090A0E] shadow-md'
                  : 'bg-white/[0.04] text-zinc-300 hover:text-white hover:bg-white/[0.08] border border-white/10'
              }`}
            >
              {year}
            </button>
          ))}
        </div>

        {/* Milestone Detail Card */}
        {timelineMilestones[selectedTimelineYear] && (
          <div className="p-5 rounded-2xl bg-white/[0.04] border border-white/10 space-y-2.5">
            <div className="flex items-center justify-between text-xs font-heading font-bold">
              <span className="text-amber-300 uppercase tracking-wider">
                {timelineMilestones[selectedTimelineYear].era}
              </span>
              <span className="px-2.5 py-1 rounded-md bg-white/10 text-white font-medium">
                {timelineMilestones[selectedTimelineYear].tag}
              </span>
            </div>
            <h4 className="type-card-heading font-bold text-white tracking-tight">
              {timelineMilestones[selectedTimelineYear].title}
            </h4>
            <p className="type-body text-zinc-300 leading-relaxed">
              {timelineMilestones[selectedTimelineYear].description}
            </p>
          </div>
        )}
      </div>

      {/* 5. EXTERNAL SOCIAL INTEGRATIONS */}
      <div className="sv-card space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Globe2 className="w-5 h-5 text-amber-300" />
            <h3 className="type-card-heading font-bold text-white uppercase tracking-wider">
              Connected Platforms &amp; Integrations
            </h3>
          </div>
          <span className="text-xs font-heading font-bold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
            Granular Controls
          </span>
        </div>

        <p className="type-supporting text-zinc-300 leading-relaxed">
          Link external services to verify your identity, showcase music taste, or share social handles. Permissions are granular and revocable at any time.
        </p>

        {/* Integration Rows with comfortable spacing */}
        <div className="space-y-3">
          {socialIntegrations.map(integ => (
            <div
              key={integ.id}
              className="p-4 sm:p-5 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.05] transition-colors flex items-center justify-between gap-4"
            >
              <div className="min-w-0 space-y-1">
                <div className="flex items-center gap-2.5">
                  <span className="font-heading font-bold text-white text-sm sm:text-base">{integ.name}</span>
                  {integ.enabled ? (
                    <span className="text-xs font-heading font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/25 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <span>Connected</span>
                    </span>
                  ) : (
                    <span className="text-xs font-heading font-medium px-2.5 py-0.5 rounded-full bg-white/5 text-zinc-400 border border-white/10">
                      Optional
                    </span>
                  )}
                </div>
                <p className="type-supporting text-zinc-300 truncate">
                  {integ.description}
                </p>
                <code className="text-xs text-zinc-400 font-mono block pt-0.5">
                  {integ.handle}
                </code>
              </div>

              {/* Action Toggle / Connect Button */}
              <div className="shrink-0">
                {integ.isPrimary ? (
                  <span className="text-xs font-heading font-bold text-zinc-400 uppercase px-3 py-1.5 bg-white/5 rounded-xl border border-white/10">
                    Primary SSO
                  </span>
                ) : (
                  <button
                    onClick={() => {
                      if (integ.id === 'spotify') {
                        setIsLinkModalOpen(true);
                      } else {
                        toggleIntegration(integ.id);
                      }
                    }}
                    className={`h-10 px-4 rounded-xl font-heading font-bold text-xs transition-all cursor-pointer ${
                      integ.enabled
                        ? 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20'
                        : 'bg-white/10 hover:bg-white/20 text-white border border-white/15'
                    }`}
                  >
                    {integ.enabled ? 'Revoke' : 'Link'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 6. PLATFORM SETTINGS & OPS ACCESS */}
      <div className="space-y-3 pt-1">
        <button
          onClick={onNavigateToSettings}
          className="w-full p-5 rounded-2xl dark-glass border border-white/10 hover:border-white/25 flex items-center justify-between text-left cursor-pointer transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center text-zinc-300">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <span className="font-heading font-bold text-white text-sm sm:text-base block">Discovery Preferences &amp; Visibility</span>
              <span className="type-supporting text-zinc-400">Distance radius, age bracket, incognito mode</span>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-zinc-400" />
        </button>

        <button
          onClick={onNavigateToAdmin}
          className="w-full p-5 rounded-2xl dark-glass border border-emerald-500/25 bg-emerald-950/15 hover:bg-emerald-950/25 flex items-center justify-between text-left cursor-pointer transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <span className="font-heading font-bold text-white text-sm sm:text-base block">Platform Admin Operations Portal</span>
              <span className="type-supporting text-zinc-400">User management, liveness audits, matching weights</span>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-emerald-400" />
        </button>
      </div>

    </div>
  );
};
