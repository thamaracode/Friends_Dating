import React, { useState } from 'react';
import { 
  Compass, 
  Sparkles, 
  ShieldCheck, 
  MessageCircle, 
  MapPin, 
  SlidersHorizontal,
  Flame,
  User
} from 'lucide-react';
import { MOCK_PROFILES } from '../mockData';
import type { UserProfile } from '../types';
import { 
  SearchBar, 
  HorizontalPillBar, 
  GlassCheckbox, 
  GlassButton, 
  GlassCard,
  PulseBadge 
} from './klyven';

interface SoulverseDiscoverPageProps {
  onOpenProfile: (profile: UserProfile) => void;
  onInitiateChat: (profile: UserProfile) => void;
}

export const SoulverseDiscoverPage: React.FC<SoulverseDiscoverPageProps> = ({
  onOpenProfile,
  onInitiateChat
}) => {
  const [search, setSearch] = useState('');
  const [intentFilter, setIntentFilter] = useState<'all' | 'Dating' | 'Friendship'>('all');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  const rawTags = ['all', 'Deep Talk', 'Books', 'Music', 'Design', 'Architecture', 'Tea', 'Hiking', 'Anime', 'Creative'];
  const tagOptions = rawTags.map(tag => ({
    id: tag,
    label: tag === 'all' ? 'All Passions' : `#${tag}`
  }));

  const filtered = MOCK_PROFILES.filter(p => {
    if (intentFilter !== 'all' && p.intent !== intentFilter) return false;
    if (verifiedOnly && !p.verifications?.photoVerified) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = p.name.toLowerCase().includes(q);
      const matchBio = (p.aboutMeLong || p.tagline || '').toLowerCase().includes(q);
      const matchLoc = (p.location || '').toLowerCase().includes(q);
      if (!matchName && !matchBio && !matchLoc) return false;
    }
    if (selectedTag !== 'all') {
      const hasVal = p.coreValues.some(v => v.toLowerCase().includes(selectedTag.toLowerCase()));
      const hasInt = p.interests.some(i => i.toLowerCase().includes(selectedTag.toLowerCase()));
      if (!hasVal && !hasInt) return false;
    }
    return true;
  });

  return (
    <div className="w-full space-y-6 animate-fadeIn pb-16">
      {/* Header & Filter Controls Bar */}
      <GlassCard padding="lg" hoverEffect={false} className="space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/[0.08] border border-white/15 flex items-center justify-center text-white shadow-inner shrink-0">
              <Compass className="w-5 h-5 text-zinc-100" />
            </div>
            <div>
              <h1 className="text-base font-black text-white font-serif tracking-tight">
                Discover Humans & Deep Chemistry
              </h1>
              <p className="text-xs text-zinc-400">
                Explore verified profiles matched by ontological compatibility and core values
              </p>
            </div>
          </div>

          {/* Integrated Klyven SearchBar */}
          <div className="w-full md:w-80">
            <SearchBar
              value={search}
              onChange={setSearch}
              placeholder="Search by name, location, or passion..."
            />
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/[0.08]">
          {/* Intent Switcher */}
          <div className="flex items-center gap-1 p-1 rounded-2xl bg-[#12141B] border border-white/10 text-xs">
            {(['all', 'Dating', 'Friendship'] as const).map(intent => (
              <button
                key={intent}
                type="button"
                onClick={() => setIntentFilter(intent)}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer min-h-[34px] ${
                  intentFilter === intent
                    ? 'bg-white text-[#090A0E] shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {intent === 'all' ? 'All Intent' : intent}
              </button>
            ))}
          </div>

          {/* Integrated Klyven HorizontalPillBar */}
          <div className="flex-1 min-w-[280px] max-w-xl">
            <HorizontalPillBar
              options={tagOptions}
              selectedId={selectedTag}
              onSelect={setSelectedTag}
            />
          </div>

          {/* Integrated Klyven GlassCheckbox */}
          <div className="flex items-center">
            <GlassCheckbox
              checked={verifiedOnly}
              onChange={setVerifiedOnly}
              label={
                <span className="flex items-center gap-1 text-zinc-300 font-bold">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Verified Only</span>
                </span>
              }
            />
          </div>
        </div>
      </GlassCard>

      {/* Grid of Discovered Profiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map(person => (
          <GlassCard
            key={person.id}
            padding="none"
            hoverEffect={true}
            className="overflow-hidden flex flex-col justify-between group"
          >
            <div 
              onClick={() => onOpenProfile(person)}
              className="relative aspect-[4/3] w-full overflow-hidden bg-black/40 cursor-pointer"
            >
              <img
                src={person.avatar}
                alt={person.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#090A0E] via-transparent to-black/25" />
              
              <div className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-md border border-white/15 text-[10px] font-mono font-bold text-white shadow-sm tabular-nums">
                {person.compatibilityScore}% HCM
              </div>
            </div>

            <div className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>{person.name}</span>
                    <span className="text-zinc-400 font-normal">{person.age}</span>
                    {person.verifications?.photoVerified && (
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    )}
                  </h3>
                  <p className="text-[10px] text-zinc-400">{person.location} • {person.status}</p>
                </div>
              </div>

              <p className="text-xs text-zinc-300 line-clamp-2 italic">
                "{person.aboutMeLong || person.tagline}"
              </p>

              <div className="flex flex-wrap gap-1 pt-1">
                {person.coreValues.slice(0, 3).map((val, idx) => (
                  <span 
                    key={idx} 
                    className="px-2 py-0.5 rounded-full text-[9px] font-medium bg-white/[0.06] text-zinc-300 border border-white/10"
                  >
                    {val}
                  </span>
                ))}
              </div>

              {/* Integrated Klyven GlassButtons with Pure Neutral Styling */}
              <div className="flex items-center gap-2 pt-2 border-t border-white/[0.08]">
                <GlassButton
                  variant="subtle"
                  size="sm"
                  onClick={() => onOpenProfile(person)}
                  className="flex-1"
                >
                  View Story
                </GlassButton>
                <GlassButton
                  variant="default"
                  size="sm"
                  icon={<MessageCircle className="w-3.5 h-3.5" />}
                  onClick={() => onInitiateChat(person)}
                  className="flex-1"
                >
                  Chat
                </GlassButton>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
};
