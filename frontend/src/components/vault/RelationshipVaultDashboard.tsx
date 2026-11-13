import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Heart, 
  Sparkles, 
  Clock, 
  Calendar, 
  CheckCircle2, 
  Plus, 
  Search, 
  Bot, 
  ShieldCheck, 
  Lock, 
  ChevronRight, 
  MessageCircle, 
  Gift, 
  HelpCircle,
  Lightbulb,
  ExternalLink,
  Flame,
  Filter
} from 'lucide-react';
import type { RelationshipProfile, RelationshipCategory } from '../../types/relationshipVault';
import { RelationshipVaultService } from '../../services/relationshipVaultService';

// Sub-Modals
import { BeforeYouTalkSheet } from './BeforeYouTalkSheet';
import { IndividualRelationshipDetailModal } from './IndividualRelationshipDetailModal';
import { QuickConversationMemoryModal } from './QuickConversationMemoryModal';
import { AIRelationshipAssistantModal } from './AIRelationshipAssistantModal';

interface RelationshipVaultDashboardProps {
  onInitiateChat?: (profile: any) => void;
}

export const RelationshipVaultDashboard: React.FC<RelationshipVaultDashboardProps> = ({
  onInitiateChat
}) => {
  const [profiles, setProfiles] = useState<RelationshipProfile[]>(() => RelationshipVaultService.getProfiles());
  const [activeCategory, setActiveCategory] = useState<RelationshipCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [selectedForBriefing, setSelectedForBriefing] = useState<RelationshipProfile | null>(null);
  const [selectedForDetail, setSelectedForDetail] = useState<RelationshipProfile | null>(null);
  const [isLogMemoryOpen, setIsLogMemoryOpen] = useState(false);
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);

  // Sync profiles
  const reloadProfiles = () => {
    setProfiles(RelationshipVaultService.getProfiles());
  };

  const filtered = profiles.filter(p => {
    if (activeCategory !== 'all' && p.relationshipCategory !== activeCategory) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return p.name.toLowerCase().includes(q) || 
           (p.nickname || '').toLowerCase().includes(q) ||
           p.statusLabel.toLowerCase().includes(q);
  });

  // Aggregate Metrics
  const totalConnections = profiles.length;
  const totalMemories = profiles.reduce((acc, p) => acc + (p.conversationMemories?.length || 0), 0) + 8;
  const totalPromisesPending = profiles.reduce((acc, p) => acc + p.promises.filter(pr => pr.status !== 'completed').length, 0);
  const upcomingCount = profiles.reduce((acc, p) => acc + p.upcomingReminders.length, 0);

  const categories = [
    { id: 'all' as const, label: 'All Connections', count: profiles.length },
    { id: 'romantic' as const, label: '❤️ Romantic', count: profiles.filter(p => p.relationshipCategory === 'romantic').length },
    { id: 'friendship' as const, label: '🫂 Friendships', count: profiles.filter(p => p.relationshipCategory === 'friendship').length },
    { id: 'complicated' as const, label: '✨ Complicated', count: profiles.filter(p => p.relationshipCategory === 'complicated').length },
    { id: 'group' as const, label: '👥 Groups', count: profiles.filter(p => p.relationshipCategory === 'group').length },
    { id: 'past' as const, label: '🌙 Past Connections', count: profiles.filter(p => p.relationshipCategory === 'past').length },
    { id: 'private_vault' as const, label: '🔐 Private Vault', count: profiles.filter(p => p.isLocked).length }
  ];

  return (
    <div className="w-full space-y-5 animate-fadeIn pb-24 max-w-5xl mx-auto">
      
      {/* 1. TOP HEADER BANNER (Inspired by Prompt Mockup) */}
      <div className="p-5 sm:p-6 rounded-3xl dark-glass border border-white/15 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-rose-500/10 via-transparent to-transparent pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#10B981]" />
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-300">
                Personal Relationship Management (PRM)
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white font-serif tracking-tight">
              My Connections & Relationship Vault
            </h1>
            <p className="text-xs text-zinc-300 max-w-xl leading-relaxed">
              Your people. Your memories. Keep meaningful connections, promises, and the little things they mentioned from becoming forgotten details. ❤️
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap self-end md:self-auto">
            {/* AI Assistant Button */}
            <button
              onClick={() => setIsAIAssistantOpen(true)}
              className="px-3.5 py-2 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/15 flex items-center gap-2 transition-all cursor-pointer shadow-md"
            >
              <Bot className="w-4 h-4 text-zinc-200" />
              <span>AI Assistant</span>
            </button>

            {/* Quick Log Conversation Memory Button */}
            <button
              onClick={() => setIsLogMemoryOpen(true)}
              className="px-4 py-2 rounded-2xl bg-white text-[#090A0E] text-xs font-bold hover:brightness-110 active:scale-95 transition-all cursor-pointer shadow-md flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Log Conversation</span>
            </button>
          </div>
        </div>

        {/* 2. STATS KPI PILLS (Prompt Mockup Section 11) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-5 pt-4 border-t border-white/[0.08]">
          <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/[0.08] text-center">
            <span className="text-lg sm:text-xl font-black text-white font-mono block">
              {totalConnections < 10 ? `0${totalConnections}` : totalConnections}
            </span>
            <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
              Connections
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/[0.08] text-center">
            <span className="text-lg sm:text-xl font-black text-white font-mono block">
              {totalMemories < 10 ? `0${totalMemories}` : totalMemories}
            </span>
            <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
              Memories Saved
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/[0.08] text-center">
            <span className="text-lg sm:text-xl font-black text-amber-300 font-mono block">
              {upcomingCount < 10 ? `0${upcomingCount}` : upcomingCount}
            </span>
            <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
              Upcoming Events
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/[0.08] text-center">
            <span className="text-lg sm:text-xl font-black text-rose-300 font-mono block">
              {totalPromisesPending < 10 ? `0${totalPromisesPending}` : totalPromisesPending}
            </span>
            <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
              Pending Promises
            </span>
          </div>
        </div>
      </div>

      {/* 3. PROSPECTIVE MEMORY RADAR (UPCOMING DATES & IMPORTANT REMINDERS) */}
      <div className="p-4 rounded-3xl dark-glass border border-amber-500/20 bg-amber-950/10 shadow-lg space-y-2.5">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-amber-300 font-bold uppercase tracking-wider text-[11px]">
            <Calendar className="w-4 h-4" />
            <span>Prospective Memory Radar · Upcoming For People You Care About</span>
          </div>
          <span className="text-[10px] text-amber-400 font-mono">Next 7 Days</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <div className="p-3 rounded-2xl bg-black/40 border border-white/5 flex items-start justify-between text-xs">
            <div>
              <span className="font-bold text-white block">Alex's Studio Presentation</span>
              <span className="text-[11px] text-zinc-400">Tomorrow at 10:00 AM</span>
            </div>
            <button
              onClick={() => setSelectedForBriefing(profiles.find(p => p.id === 'rel_alex') || null)}
              className="text-[10px] font-bold text-amber-300 hover:text-white px-2 py-1 rounded-lg bg-amber-500/20 cursor-pointer shrink-0 ml-2"
            >
              Briefing ⚡
            </button>
          </div>

          <div className="p-3 rounded-2xl bg-black/40 border border-white/5 flex items-start justify-between text-xs">
            <div>
              <span className="font-bold text-white block">Daniel's Thesis Draft</span>
              <span className="text-[11px] text-zinc-400">Friday, Nov 14</span>
            </div>
            <button
              onClick={() => setSelectedForBriefing(profiles.find(p => p.id === 'rel_daniel') || null)}
              className="text-[10px] font-bold text-amber-300 hover:text-white px-2 py-1 rounded-lg bg-amber-500/20 cursor-pointer shrink-0 ml-2"
            >
              Briefing ⚡
            </button>
          </div>

          <div className="p-3 rounded-2xl bg-black/40 border border-white/5 flex items-start justify-between text-xs">
            <div>
              <span className="font-bold text-white block">Reunion Beach House</span>
              <span className="text-[11px] text-zinc-400">University Circle · Dec 20</span>
            </div>
            <button
              onClick={() => setSelectedForBriefing(profiles.find(p => p.id === 'rel_uni_circle') || null)}
              className="text-[10px] font-bold text-amber-300 hover:text-white px-2 py-1 rounded-lg bg-amber-500/20 cursor-pointer shrink-0 ml-2"
            >
              Briefing ⚡
            </button>
          </div>
        </div>
      </div>

      {/* 4. CATEGORY TABS & SEARCH */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 text-xs">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeCategory === cat.id
                    ? 'bg-white text-[#090A0E] shadow-md'
                    : 'bg-white/[0.04] text-zinc-400 hover:text-white border border-white/10'
                }`}
              >
                <span>{cat.label}</span>
                <span className="text-[10px] opacity-70 font-mono">({cat.count})</span>
              </button>
            ))}
          </div>

          <div className="relative min-w-[200px] flex-1 sm:max-w-xs">
            <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search people or memories..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white/30"
            />
          </div>
        </div>
      </div>

      {/* 5. CONNECTION CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(person => {
          const pendingPromises = person.promises.filter(pr => pr.status !== 'completed');
          
          return (
            <div
              key={person.id}
              className="p-5 rounded-3xl dark-glass border border-white/[0.10] hover:border-white/25 transition-all shadow-xl space-y-4 flex flex-col justify-between group"
            >
              <div>
                {/* Header: Photo, Name, Category */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-13 h-13 rounded-full overflow-hidden border-2 border-white/20 shrink-0 relative shadow-md">
                      <img src={person.avatar} alt={person.name} className="w-full h-full object-cover" />
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-white font-serif tracking-tight">
                          {person.name}
                        </h3>
                        {person.isLocked && (
                          <span title="Locked with App Protection">
                            <Lock className="w-3.5 h-3.5 text-zinc-400" />
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-zinc-400 mt-0.5">
                        <span className="text-zinc-300 font-semibold">{person.statusLabel}</span>
                        <span> · Updated {person.lastUpdated}</span>
                      </p>
                    </div>
                  </div>

                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                    person.relationshipCategory === 'romantic'
                      ? 'bg-rose-500/15 text-rose-300 border border-rose-500/25'
                      : person.relationshipCategory === 'friendship'
                        ? 'bg-blue-500/15 text-blue-300 border border-blue-500/25'
                        : person.relationshipCategory === 'complicated'
                          ? 'bg-amber-500/15 text-amber-300 border border-amber-500/25'
                          : 'bg-white/10 text-zinc-300 border border-white/10'
                  }`}>
                    {person.relationshipCategory}
                  </span>
                </div>

                {/* Things She/He Appreciates (Quick Glimpse) */}
                <div className="mt-3.5 p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] space-y-1.5 text-xs">
                  <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider flex items-center gap-1.5">
                    <Heart className="w-3 h-3 text-rose-400" />
                    <span>Things They Appreciate</span>
                  </span>
                  <p className="text-zinc-200 line-clamp-2 leading-relaxed">
                    "{person.thingsTheyAppreciate[0] || person.lastConversationSummary}"
                  </p>
                </div>

                {/* Prospective Alerts & Pending Promises Bar */}
                <div className="mt-3 flex items-center gap-2 flex-wrap text-[11px]">
                  {person.upcomingReminders[0] && (
                    <span className="px-2.5 py-0.5 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/20 font-medium truncate max-w-[240px]">
                      📅 {person.upcomingReminders[0]}
                    </span>
                  )}
                  {pendingPromises.length > 0 && (
                    <span className="px-2.5 py-0.5 rounded-lg bg-white/10 text-zinc-300 border border-white/10 font-medium">
                      🤝 {pendingPromises.length} promises pending
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons Bar */}
              <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between gap-2">
                <button
                  onClick={() => setSelectedForBriefing(person)}
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                  title="Open Instant Briefing"
                >
                  <Sparkles className="w-3.5 h-3.5 text-zinc-300" />
                  <span>Before You Talk</span>
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setSelectedForDetail(person)}
                    className="px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/15 text-zinc-300 hover:text-white text-xs font-bold transition-colors cursor-pointer"
                  >
                    Memory Vault ›
                  </button>

                  <button
                    onClick={() => onInitiateChat?.(person)}
                    className="p-1.5 rounded-xl bg-white text-[#090A0E] hover:brightness-110 shadow-sm cursor-pointer"
                    title="Send Message"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ===================================================================== */}
      {/* 6. MODALS                                                             */}
      {/* ===================================================================== */}

      {/* Before You Talk Sheet (Briefing) */}
      <BeforeYouTalkSheet
        isOpen={Boolean(selectedForBriefing)}
        onClose={() => setSelectedForBriefing(null)}
        profile={selectedForBriefing}
        onInitiateChat={(p) => onInitiateChat?.(p)}
        onOpenFullMemory={(p) => setSelectedForDetail(p)}
      />

      {/* Full Individual Relationship Profile Modal */}
      <IndividualRelationshipDetailModal
        isOpen={Boolean(selectedForDetail)}
        onClose={() => setSelectedForDetail(null)}
        profile={selectedForDetail}
        onUpdateProfile={(upd) => {
          setSelectedForDetail(upd);
          reloadProfiles();
        }}
        onInitiateChat={(p) => onInitiateChat?.(p)}
      />

      {/* Quick Conversation Memory Modal */}
      <QuickConversationMemoryModal
        isOpen={isLogMemoryOpen}
        onClose={() => setIsLogMemoryOpen(false)}
        profiles={profiles}
        onSaved={reloadProfiles}
      />

      {/* AI Relational Intelligence Assistant */}
      <AIRelationshipAssistantModal
        isOpen={isAIAssistantOpen}
        onClose={() => setIsAIAssistantOpen(false)}
        profiles={profiles}
      />

    </div>
  );
};
