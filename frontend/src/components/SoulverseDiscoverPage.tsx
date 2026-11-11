import React, { useState } from 'react';
import { 
  Compass, 
  Search, 
  Filter, 
  Sparkles, 
  ShieldCheck, 
  Heart, 
  MessageCircle, 
  MapPin, 
  Layers, 
  SlidersHorizontal,
  Flame,
  Check
} from 'lucide-react';
import { MOCK_PROFILES } from '../mockData';
import type { UserProfile } from '../types';

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

  const allTags = ['all', 'Deep Talk', 'Books', 'Music', 'Design', 'Architecture', 'Tea', 'Hiking', 'Anime', 'Creative'];

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
      <div className="p-6 rounded-3xl dark-glass border border-white/[0.08] shadow-2xl space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/[0.08] border border-white/15 flex items-center justify-center text-white shadow-inner">
              <Compass className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-black text-white font-serif">Discover Humans & Deep Chemistry</h1>
              <p className="text-xs text-zinc-400">Explore verified profiles matched by ontological compatibility and core values</p>
            </div>
          </div>

          {/* Search bar */}
          <div className="w-full md:w-80 relative">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, location, or passion..."
              className="w-full pl-10 pr-4 py-2 rounded-2xl bg-white/[0.04] border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white/30 focus:bg-white/[0.07] transition-colors"
            />
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/[0.08]">
          {/* Intent Switcher */}
          <div className="flex items-center gap-1 p-1 rounded-2xl bg-white/[0.04] border border-white/10 text-xs">
            {(['all', 'Dating', 'Friendship'] as const).map(intent => (
              <button
                key={intent}
                onClick={() => setIntentFilter(intent)}
                className={`px-3 py-1 rounded-xl font-bold transition-all cursor-pointer ${
                  intentFilter === intent
                    ? 'bg-white/20 text-white border border-white/30 shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {intent === 'all' ? 'All Intent' : intent}
              </button>
            ))}
          </div>

          {/* Interest Tags */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all cursor-pointer border ${
                  selectedTag === tag
                    ? 'bg-white/20 text-white border-white/30 shadow-sm'
                    : 'bg-white/[0.04] text-zinc-400 border-white/10 hover:text-white hover:border-white/20'
                }`}
              >
                {tag === 'all' ? 'All Passions' : `#${tag}`}
              </button>
            ))}
          </div>

          {/* Verified Toggle */}
          <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={verifiedOnly}
              onChange={(e) => setVerifiedOnly(e.target.checked)}
              className="rounded bg-white/[0.06] border-white/20 text-white accent-white"
            />
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Verified Only</span>
            </span>
          </label>
        </div>
      </div>

      {/* Grid of Discovered Profiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map(person => (
          <div
            key={person.id}
            className="rounded-3xl overflow-hidden dark-glass-card border border-white/[0.08] hover:border-white/25 transition-all shadow-lg flex flex-col justify-between group"
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
              
              <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-md border border-white/15 text-[10px] font-bold text-white shadow-sm">
                {person.compatibilityScore}% HCM
              </div>
            </div>

            <div className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>{person.name}</span>
                    <span className="text-zinc-400 font-normal">{person.age}</span>
                    {person.verifications?.photoVerified && <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />}
                  </h3>
                  <p className="text-[10px] text-zinc-400">{person.location} • {person.status}</p>
                </div>
              </div>

              <p className="text-xs text-zinc-300 line-clamp-2 italic">
                "{person.aboutMeLong || person.tagline}"
              </p>

              <div className="flex flex-wrap gap-1 pt-1">
                {person.coreValues.slice(0, 3).map((val, idx) => (
                  <span key={idx} className="px-2 py-0.5 rounded-full text-[9px] font-medium bg-white/[0.06] text-zinc-300 border border-white/10">
                    {val}
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-white/[0.08]">
                <button
                  onClick={() => onOpenProfile(person)}
                  className="flex-1 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/15 text-zinc-200 hover:text-white border border-white/10 text-xs font-bold cursor-pointer transition-all text-center"
                >
                  View Story
                </button>
                <button
                  onClick={() => onInitiateChat(person)}
                  className="flex-1 py-1.5 rounded-xl gray-glass-btn text-xs font-bold cursor-pointer flex items-center justify-center gap-1"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-white" />
                  <span>Chat</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
