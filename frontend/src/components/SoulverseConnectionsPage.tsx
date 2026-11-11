import React, { useState } from 'react';
import { 
  Heart, 
  Users, 
  MessageCircle, 
  ShieldCheck, 
  Sparkles, 
  UserCheck, 
  Search, 
  ChevronRight,
  MoreVertical
} from 'lucide-react';
import { MOCK_PROFILES } from '../mockData';
import type { UserProfile } from '../types';

interface SoulverseConnectionsPageProps {
  onOpenProfile: (profile: UserProfile) => void;
  onInitiateChat: (profile: UserProfile) => void;
}

export const SoulverseConnectionsPage: React.FC<SoulverseConnectionsPageProps> = ({
  onOpenProfile,
  onInitiateChat
}) => {
  const [activeTab, setActiveTab] = useState<'matches' | 'friends' | 'followers' | 'requests'>('matches');
  const [search, setSearch] = useState('');

  const matches = MOCK_PROFILES.slice(0, 4);
  const friends = MOCK_PROFILES.slice(2, 6);
  const followers = MOCK_PROFILES.slice(1, 8);

  const currentList = activeTab === 'matches' 
    ? matches 
    : activeTab === 'friends' 
      ? friends 
      : followers;

  const filtered = currentList.filter(p => {
    if (!search.trim()) return true;
    return p.name.toLowerCase().includes(search.toLowerCase()) || 
           (p.aboutMeLong || '').toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="w-full space-y-6 animate-fadeIn pb-16">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl dark-glass border border-white/[0.08] shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white/[0.08] border border-white/15 flex items-center justify-center text-white shadow-inner">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-base font-black text-white font-serif">Connections & Social Constellations</h1>
            <p className="text-xs text-zinc-400">Manage mutual matches, inner circle friends, and incoming requests</p>
          </div>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center gap-1 p-1 rounded-2xl bg-white/[0.04] border border-white/10 text-xs">
          {[
            { id: 'matches', label: `Matches (${matches.length})`, icon: Heart },
            { id: 'friends', label: `Friends (${friends.length})`, icon: Users },
            { id: 'followers', label: `Followers (${followers.length})`, icon: Sparkles },
            { id: 'requests', label: 'Requests (2)', icon: UserCheck }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-white/20 text-white border border-white/30 shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter connections..."
          className="w-full pl-10 pr-4 py-2 rounded-2xl bg-white/[0.04] border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white/30 transition-colors"
        />
      </div>

      {/* Connections List / Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(person => (
          <div
            key={person.id}
            className="p-4 rounded-3xl dark-glass-card border border-white/[0.08] hover:border-white/25 transition-all shadow-lg flex items-center justify-between gap-4 group"
          >
            <div 
              onClick={() => onOpenProfile(person)}
              className="flex items-center gap-3 cursor-pointer min-w-0"
            >
              <div className="w-14 h-14 rounded-2xl overflow-hidden shrink-0 border border-white/10 group-hover:border-white/30 transition-colors">
                <img src={person.avatar} alt={person.name} className="w-full h-full object-cover" />
              </div>
              <div className="min-w-0">
                <h3 className="text-xs font-bold text-white flex items-center gap-1.5 truncate">
                  <span>{person.name}</span>
                  <span className="text-zinc-400 font-normal">{person.age}</span>
                  {person.verifications?.photoVerified && <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />}
                </h3>
                <p className="text-[10px] text-zinc-400 truncate">@{person.username} • {person.location}</p>
                <span className="inline-block mt-1 text-[9px] font-bold px-2 py-0.2 rounded-full bg-white/[0.06] text-zinc-300 border border-white/10">
                  {person.compatibilityScore}% Compatibility
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => onInitiateChat(person)}
                className="p-2.5 rounded-2xl gray-glass-btn text-white text-xs font-bold cursor-pointer shadow-md hover:scale-105 transition-transform"
                title="Send Message"
              >
                <MessageCircle className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
