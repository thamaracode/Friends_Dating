import React, { useState, useEffect } from 'react';
import { 
  Lock, 
  Globe2, 
  EyeOff, 
  Sparkles, 
  Heart, 
  Share2, 
  Trash2, 
  Plus, 
  MessageSquareQuote, 
  Feather, 
  Filter, 
  ShieldCheck, 
  Eye, 
  Check, 
  Smile, 
  Users,
  Compass,
  AlertTriangle
} from 'lucide-react';
import type { 
  ConfessionStory, 
  ConfessionCategory, 
  ConfessionVisibility, 
  ConfessionReactionType 
} from '../../types/confession';
import { confessionsApiClient } from '../../services/confessionsApiClient';
import { CreateConfessionModal } from './CreateConfessionModal';

interface ConfessionsStreamViewProps {
  onOpenProfile?: (userId: string) => void;
  onSendConfessionToChat?: (text: string) => void;
}

export const ConfessionsStreamView: React.FC<ConfessionsStreamViewProps> = ({
  onOpenProfile,
  onSendConfessionToChat
}) => {
  const [confessions, setConfessions] = useState<ConfessionStory[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'anonymous' | 'public' | 'my_vault'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [revealedSensitives, setRevealedSensitives] = useState<Record<string, boolean>>({});
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const loadConfessions = async () => {
    setIsLoading(true);
    try {
      if (activeTab === 'my_vault') {
        const myData = await confessionsApiClient.getMyConfessions();
        setConfessions(myData);
      } else {
        const visibilityFilter = activeTab === 'all' ? undefined : activeTab;
        const data = await confessionsApiClient.getConfessions(selectedCategory, visibilityFilter);
        setConfessions(data);
      }
    } catch {
      // Handled in client
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadConfessions();
  }, [activeTab, selectedCategory]);

  const handleReact = async (confessionId: string, reaction: ConfessionReactionType) => {
    const updated = await confessionsApiClient.reactToConfession(confessionId, reaction);
    if (updated) {
      setConfessions(prev => prev.map(c => c.id === confessionId ? updated : c));
    }
  };

  const handleDelete = async (confessionId: string) => {
    if (!window.confirm('Are you sure you want to delete this confession story?')) return;
    const ok = await confessionsApiClient.deleteConfession(confessionId);
    if (ok) {
      setConfessions(prev => prev.filter(c => c.id !== confessionId));
      showToast('Confession story deleted.');
    }
  };

  const handleShare = (confession: ConfessionStory) => {
    const authorTag = confession.visibility === 'anonymous' ? (confession.authorAlias || 'Anonymous') : (confession.authorName || 'Someone');
    const text = `🤫 [Soulverse Confession - ${authorTag}]\n"${confession.title}"\n\n${confession.story}`;
    if (onSendConfessionToChat) {
      onSendConfessionToChat(text);
      showToast('Shared confession to chat!');
    } else {
      navigator.clipboard.writeText(text);
      showToast('Copied confession to clipboard!');
    }
  };

  const CATEGORY_PILLS = [
    { id: 'all', label: 'All Topics' },
    { id: 'love_heartbreak', label: '💔 Heartbreak & Love' },
    { id: 'hidden_desires', label: '🤫 Hidden Desires' },
    { id: 'unsent_feelings', label: '✉️ Unsent Feelings' },
    { id: 'secret_identity', label: '🎭 Secret Identity' },
    { id: 'guilt_redemption', label: '🥀 Guilt & Redemption' },
    { id: 'vulnerability_fear', label: '🌪️ Vulnerability' },
    { id: 'midnight_nostalgia', label: '🌙 Midnight Nostalgia' },
    { id: 'healing_recovery', label: '🌱 Healing' }
  ];

  return (
    <div className="w-full space-y-6 animate-fadeIn pb-16">
      
      {/* Toast */}
      {toastMsg && (
        <div className="fixed top-20 right-6 z-50 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-rose-900/90 to-amber-900/90 border border-amber-400/40 text-amber-200 shadow-2xl backdrop-blur-xl flex items-center gap-2 text-xs font-semibold animate-slideIn">
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="relative rounded-3xl overflow-hidden p-6 sm:p-8 border border-white/10 bg-gradient-to-br from-rose-950/30 via-[#10121A] to-purple-950/20 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="space-y-2 max-w-xl">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-rose-300 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
              <span>Sacred Confessions Space</span>
            </span>
            <h2 className="text-xl sm:text-3xl font-heading font-black text-white leading-tight">
              Stories We Never Tell in the Daylight.
            </h2>
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
              Share real feelings and secret moments without pretense. Post anonymously, publicly under your profile, or keep them securely in your private vault.
            </p>
          </div>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-rose-600 via-amber-500 to-amber-600 hover:scale-105 text-white font-bold text-xs shadow-xl shadow-rose-600/30 transition-all cursor-pointer flex items-center gap-2 shrink-0 self-start sm:self-auto"
          >
            <Feather className="w-4 h-4" />
            <span>Whisper a Confession</span>
          </button>
        </div>
      </div>

      {/* Primary Stream Tabs (All, Anonymous, Public, My Vault) */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-white/[0.04] border border-white/10 overflow-x-auto no-scrollbar">
        {[
          { id: 'all' as const, label: '🌐 All Stories', desc: 'Public & Anonymous' },
          { id: 'anonymous' as const, label: '🎭 Anonymous Stream', desc: 'Identity 100% hidden' },
          { id: 'public' as const, label: '🌍 Public Stories', desc: 'By real humans' },
          { id: 'my_vault' as const, label: '🔒 My Confession Vault', desc: 'Your private & posted stories' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === tab.id
                ? 'bg-white text-[#090A0E] shadow-md font-bold'
                : 'text-zinc-400 hover:text-white hover:bg-white/[0.05]'
            }`}
          >
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Topic Filter Pills */}
      {activeTab !== 'my_vault' && (
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {CATEGORY_PILLS.map(pill => (
            <button
              key={pill.id}
              onClick={() => setSelectedCategory(pill.id)}
              className={`h-8 px-3 rounded-full text-[11px] font-semibold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                selectedCategory === pill.id
                  ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40 shadow-sm'
                  : 'bg-white/[0.03] text-zinc-400 hover:text-white border border-white/[0.08]'
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>
      )}

      {/* Confession Cards List */}
      <div className="space-y-4">
        {confessions.length === 0 ? (
          <div className="p-12 rounded-3xl bg-[#12141C] border border-white/10 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-zinc-400 mx-auto">
              <MessageSquareQuote className="w-6 h-6" />
            </div>
            <h4 className="font-heading font-bold text-white text-base">
              No confessions found in this space
            </h4>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto">
              Be the first to break the silence. Share a thought anonymously or record it into your private vault.
            </p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="mt-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs cursor-pointer inline-flex items-center gap-2"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Whisper Something Now</span>
            </button>
          </div>
        ) : (
          confessions.map(confession => {
            const isSensitiveHidden = confession.isSensitive && !revealedSensitives[confession.id];

            return (
              <article
                key={confession.id}
                className="p-6 sm:p-7 rounded-3xl bg-[#12141C]/80 border border-white/10 hover:border-white/20 transition-all shadow-lg space-y-4 relative overflow-hidden"
              >
                {/* Top Metadata Header */}
                <div className="flex items-center justify-between gap-3">
                  {/* Author Attribution */}
                  <div className="flex items-center gap-3">
                    {confession.visibility === 'anonymous' ? (
                      <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-purple-900 to-rose-900 border border-purple-500/40 flex items-center justify-center text-rose-300 shadow-sm">
                        <EyeOff className="w-4 h-4" />
                      </div>
                    ) : confession.visibility === 'private' ? (
                      <div className="w-9 h-9 rounded-full bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300 shadow-sm">
                        <Lock className="w-4 h-4" />
                      </div>
                    ) : (
                      <div className="w-9 h-9 rounded-full overflow-hidden border border-white/20">
                        <img 
                          src={confession.authorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'} 
                          alt="Author" 
                          className="w-full h-full object-cover" 
                        />
                      </div>
                    )}

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">
                          {confession.visibility === 'anonymous'
                            ? (confession.authorAlias || 'Anonymous Soul')
                            : confession.visibility === 'private'
                            ? 'Private Vault (Only You)'
                            : (confession.authorName || 'Soulverse Member')}
                        </span>
                        
                        {/* Visibility Pill Badge */}
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${
                          confession.visibility === 'anonymous'
                            ? 'bg-purple-500/15 text-purple-300 border-purple-500/30'
                            : confession.visibility === 'private'
                            ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                            : 'bg-sky-500/15 text-sky-300 border-sky-500/30'
                        }`}>
                          {confession.visibility}
                        </span>
                      </div>

                      <span className="text-[10px] text-zinc-500 font-mono">
                        {new Date(confession.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} • {confession.mood}
                      </span>
                    </div>
                  </div>

                  {/* Actions: Delete (if owner) & Share */}
                  <div className="flex items-center gap-1.5">
                    {confession.isOwner && (
                      <button
                        onClick={() => handleDelete(confession.id)}
                        className="p-2 text-zinc-500 hover:text-rose-400 hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
                        title="Delete your confession"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      onClick={() => handleShare(confession)}
                      className="p-2 text-zinc-500 hover:text-white hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
                      title="Share confession or copy text"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Confession Title */}
                <h3 className="font-heading font-extrabold text-base sm:text-lg text-white leading-snug">
                  {confession.title}
                </h3>

                {/* Confession Story (with sensitive blur if flagged) */}
                <div className="relative">
                  {isSensitiveHidden ? (
                    <div className="p-6 rounded-2xl bg-white/[0.02] border border-amber-500/20 text-center space-y-2 backdrop-blur-md">
                      <AlertTriangle className="w-5 h-5 text-amber-400 mx-auto" />
                      <p className="text-xs text-zinc-400">
                        This confession is marked as containing emotionally sensitive content.
                      </p>
                      <button
                        onClick={() => setRevealedSensitives(prev => ({ ...prev, [confession.id]: true }))}
                        className="px-3.5 py-1.5 rounded-xl bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 font-bold text-xs transition-colors cursor-pointer"
                      >
                        Click to Reveal Story
                      </button>
                    </div>
                  ) : (
                    <p className="text-sm text-zinc-300 leading-relaxed font-body whitespace-pre-wrap">
                      {confession.story}
                    </p>
                  )}
                </div>

                {/* Bottom Reactions Cluster */}
                <div className="pt-3 border-t border-white/[0.08] flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Hugs Reaction */}
                    <button
                      onClick={() => handleReact(confession.id, 'hugs')}
                      className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 font-semibold text-xs transition-all cursor-pointer ${
                        confession.userReactions?.includes('hugs')
                          ? 'bg-rose-500/20 border-rose-400 text-rose-300 shadow-sm'
                          : 'bg-white/[0.03] border-white/10 text-zinc-400 hover:text-white'
                      }`}
                      title="Send a warm virtual hug"
                    >
                      <span>🫂</span>
                      <span>Hugs</span>
                      {confession.reactionHugs > 0 && (
                        <span className="font-mono text-[11px] font-bold">
                          {confession.reactionHugs}
                        </span>
                      )}
                    </button>

                    {/* Relatable Reaction */}
                    <button
                      onClick={() => handleReact(confession.id, 'relatable')}
                      className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 font-semibold text-xs transition-all cursor-pointer ${
                        confession.userReactions?.includes('relatable')
                          ? 'bg-rose-500/20 border-rose-400 text-rose-300 shadow-sm'
                          : 'bg-white/[0.03] border-white/10 text-zinc-400 hover:text-white'
                      }`}
                      title="I deeply relate to this"
                    >
                      <span>❤️</span>
                      <span>Relatable</span>
                      {confession.reactionRelatable > 0 && (
                        <span className="font-mono text-[11px] font-bold">
                          {confession.reactionRelatable}
                        </span>
                      )}
                    </button>

                    {/* Peace / Not Alone */}
                    <button
                      onClick={() => handleReact(confession.id, 'peace')}
                      className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 font-semibold text-xs transition-all cursor-pointer ${
                        confession.userReactions?.includes('peace')
                          ? 'bg-sky-500/20 border-sky-400 text-sky-300 shadow-sm'
                          : 'bg-white/[0.03] border-white/10 text-zinc-400 hover:text-white'
                      }`}
                      title="You are not alone"
                    >
                      <span>🕊️</span>
                      <span>You're Not Alone</span>
                      {confession.reactionPeace > 0 && (
                        <span className="font-mono text-[11px] font-bold">
                          {confession.reactionPeace}
                        </span>
                      )}
                    </button>

                    {/* Secret Kept */}
                    <button
                      onClick={() => handleReact(confession.id, 'secrets')}
                      className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 font-semibold text-xs transition-all cursor-pointer ${
                        confession.userReactions?.includes('secrets')
                          ? 'bg-purple-500/20 border-purple-400 text-purple-300 shadow-sm'
                          : 'bg-white/[0.03] border-white/10 text-zinc-400 hover:text-white'
                      }`}
                      title="Safe here with us"
                    >
                      <span>🤫</span>
                      <span>Safe Here</span>
                      {confession.reactionSecrets > 0 && (
                        <span className="font-mono text-[11px] font-bold">
                          {confession.reactionSecrets}
                        </span>
                      )}
                    </button>
                  </div>

                  <span className="text-[11px] text-zinc-500 capitalize">
                    {confession.category.replace(/_/g, ' ')}
                  </span>
                </div>
              </article>
            );
          })
        )}
      </div>

      {/* Creation Modal */}
      <CreateConfessionModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onConfessionCreated={(newConf) => {
          setConfessions(prev => [newConf, ...prev]);
          showToast(`Published ${newConf.visibility.toUpperCase()} confession story!`);
        }}
        defaultVisibility={activeTab === 'anonymous' ? 'anonymous' : activeTab === 'public' ? 'public' : 'anonymous'}
      />
    </div>
  );
};
