import React, { useState } from 'react';
import { 
  Users, 
  Heart, 
  ArrowRight,
  ShieldCheck,
  Calendar,
  Compass,
  Layers,
  Lock,
  Search,
  Filter,
  Sparkles,
  ExternalLink,
  MessageSquare
} from 'lucide-react';
import { ProfileCard } from './ProfileCard';
import { MOCK_PROFILES } from '../mockData';
import type { ExperienceTab, UserProfile } from '../types';

interface DiscoverHumansViewProps {
  onNavigate: (tab: ExperienceTab) => void;
  onInitiateChat: (profile: UserProfile) => void;
}

export const DiscoverHumansView: React.FC<DiscoverHumansViewProps> = ({
  onNavigate,
  onInitiateChat
}) => {
  const [intentFilter, setIntentFilter] = useState<'all' | 'Friendship' | 'Dating'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEnergy, setSelectedEnergy] = useState<string>('all');

  const filteredProfiles = MOCK_PROFILES.filter(p => {
    if (intentFilter !== 'all' && p.intent !== intentFilter) return false;
    if (selectedEnergy !== 'all' && p.energy !== selectedEnergy) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = p.name.toLowerCase().includes(q);
      const matchHeadline = p.headline?.toLowerCase().includes(q);
      const matchTagline = p.tagline?.toLowerCase().includes(q);
      const matchValues = p.coreValues.some(v => v.toLowerCase().includes(q));
      if (!matchName && !matchHeadline && !matchTagline && !matchValues) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#302B22]">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#D6AD60]/10 border border-[#D6AD60]/30 text-xs font-semibold text-[#F1D99F] mb-1">
            <Compass className="w-3.5 h-3.5 text-[#D6AD60]" />
            <span>HOLISTIC COMPATIBILITY MODEL (HCM)</span>
          </div>
          <h1 className="text-2xl font-black text-[#F5F0E6]">
            Discover Authentic Humans
          </h1>
          <p className="text-xs text-[#A7A094] mt-0.5">
            Discover intentional friendships and romantic partners based on core values, conflict styles, and conversational cadence.
          </p>
        </div>

        {/* Filter Switcher */}
        <div className="flex items-center gap-1.5 bg-[#111111] p-1 rounded-2xl border border-[#302B22]">
          <button
            onClick={() => setIntentFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              intentFilter === 'all' 
                ? 'bg-[#D6AD60] text-[#090909]' 
                : 'text-[#A7A094] hover:text-[#F5F0E6]'
            }`}
          >
            All Connections
          </button>
          <button
            onClick={() => setIntentFilter('Friendship')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              intentFilter === 'Friendship' 
                ? 'bg-[#D6AD60] text-[#090909]' 
                : 'text-[#A7A094] hover:text-[#F5F0E6]'
            }`}
          >
            Friendships
          </button>
          <button
            onClick={() => setIntentFilter('Dating')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              intentFilter === 'Dating' 
                ? 'bg-[#D6AD60] text-[#090909]' 
                : 'text-[#A7A094] hover:text-[#F5F0E6]'
            }`}
          >
            Dating
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-[#111111] p-3 rounded-2xl border border-[#302B22]">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-[#A7A094] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, values, hobbies (e.g. 'Coffee', 'Minimalism', 'Kindness')..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#171717] border border-[#302B22] text-xs text-[#F5F0E6] focus:outline-none focus:border-[#D6AD60]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-[#A7A094] whitespace-nowrap">Social Energy:</span>
          <select
            value={selectedEnergy}
            onChange={(e) => setSelectedEnergy(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 rounded-xl bg-[#171717] border border-[#302B22] text-xs text-[#F5F0E6] focus:outline-none focus:border-[#D6AD60]"
          >
            <option value="all">Any Energy</option>
            <option value="Introvert">Introvert</option>
            <option value="Ambivert">Ambivert</option>
            <option value="Extrovert">Extrovert</option>
          </select>
        </div>
      </div>

      {/* Profiles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
        {filteredProfiles.map((profile) => (
          <ProfileCard 
            key={profile.id} 
            profile={profile} 
            onInitiateConversation={onInitiateChat}
          />
        ))}
      </div>

      {/* Zero-User Fallback Teaser */}
      <div className="mt-8 bg-gradient-to-r from-[#171717] via-[#211E18] to-[#171717] border border-[#302B22] rounded-3xl p-6 text-center space-y-3">
        <h3 className="text-sm font-bold text-[#F5F0E6]">
          Can't find your exact niche or subculture yet?
        </h3>
        <p className="text-xs text-[#A7A094] max-w-lg mx-auto">
          FRIENDS doesn't strand you with an empty list. Our external discovery engine recommends curated Discord communities, Reddit interest hubs, and language exchange circles.
        </p>
        <button
          onClick={() => onNavigate('friends_connect')}
          className="px-4 py-2 bg-gradient-to-r from-[#D6AD60] to-[#F1D99F] text-[#090909] font-bold rounded-xl text-xs inline-flex items-center gap-1.5 cursor-pointer shadow-md shadow-[#D6AD60]/20"
        >
          <span>Explore Beyond FRIENDS Directory</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
