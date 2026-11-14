import React, { useState } from 'react';
import { 
  Lock, 
  Globe2, 
  EyeOff, 
  Sparkles, 
  AlertTriangle, 
  Heart, 
  Send, 
  X, 
  ShieldCheck, 
  MessageSquareQuote,
  Feather,
  Tag,
  Plus
} from 'lucide-react';
import type { 
  ConfessionCategory, 
  ConfessionMood, 
  ConfessionVisibility, 
  CreateConfessionPayload, 
  ConfessionStory 
} from '../../types/confession';
import { confessionsApiClient } from '../../services/confessionsApiClient';

interface CreateConfessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfessionCreated?: (confession: ConfessionStory) => void;
  defaultVisibility?: ConfessionVisibility;
}

export const CreateConfessionModal: React.FC<CreateConfessionModalProps> = ({
  isOpen,
  onClose,
  onConfessionCreated,
  defaultVisibility = 'anonymous'
}) => {
  const [title, setTitle] = useState('');
  const [story, setStory] = useState('');
  const [category, setCategory] = useState<ConfessionCategory>('love_heartbreak');
  const [mood, setMood] = useState<ConfessionMood>('vulnerable');
  const [visibility, setVisibility] = useState<ConfessionVisibility>(defaultVisibility);
  const [customAlias, setCustomAlias] = useState('');
  const [isSensitive, setIsSensitive] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>(['healing', 'vulnerability']);
  const [tagInput, setTagInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const SUGGESTED_TAGS = [
    'healing', 'heartbreak', 'boundaries', 'vulnerability', 'introvert', 
    'growth', 'forgiveness', 'anxiety', 'firstlove', 'lettinggo', 'selflove', 'unspoken'
  ];

  const handleAddTag = (tagToAdd?: string) => {
    const raw = tagToAdd || tagInput;
    const clean = raw.replace(/^#/, '').trim().toLowerCase();
    if (!clean) return;
    if (!selectedTags.includes(clean)) {
      setSelectedTags(prev => [...prev, clean]);
    }
    setTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setSelectedTags(prev => prev.filter(t => t !== tagToRemove));
  };

  if (!isOpen) return null;

  const CATEGORIES: { id: ConfessionCategory; label: string; icon: string }[] = [
    { id: 'love_heartbreak', label: 'Love & Heartbreak', icon: '💔' },
    { id: 'hidden_desires', label: 'Hidden Desires', icon: '🤫' },
    { id: 'unsent_feelings', label: 'Unsent Feelings', icon: '✉️' },
    { id: 'guilt_redemption', label: 'Guilt & Forgiveness', icon: '🥀' },
    { id: 'secret_identity', label: 'Secret Identity & Impostor', icon: '🎭' },
    { id: 'vulnerability_fear', label: 'Vulnerability & Fear', icon: '🌪️' },
    { id: 'midnight_nostalgia', label: 'Midnight Nostalgia', icon: '🌙' },
    { id: 'healing_recovery', label: 'Healing & Moving On', icon: '🌱' }
  ];

  const MOODS: { id: ConfessionMood; label: string; color: string }[] = [
    { id: 'vulnerable', label: 'Vulnerable', color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30' },
    { id: 'relieved', label: 'Relieved', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' },
    { id: 'heartbroken', label: 'Heartbroken', color: 'text-rose-400 bg-rose-500/10 border-rose-500/30' },
    { id: 'passionate', label: 'Passionate', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' },
    { id: 'nostalgic', label: 'Nostalgic', color: 'text-purple-400 bg-purple-500/10 border-purple-500/30' },
    { id: 'regretful', label: 'Regretful', color: 'text-zinc-400 bg-zinc-500/10 border-zinc-500/30' },
    { id: 'liberated', label: 'Liberated', color: 'text-sky-400 bg-sky-500/10 border-sky-500/30' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!title.trim()) {
      setErrorMsg('Please give your confession story a title or opening thought.');
      return;
    }
    if (!story.trim() || story.trim().length < 20) {
      setErrorMsg('Please write at least 20 characters for your confession story.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: CreateConfessionPayload = {
        title: title.trim(),
        story: story.trim(),
        category,
        mood,
        visibility,
        tags: selectedTags,
        isSensitive,
        customAlias: visibility === 'anonymous' ? customAlias.trim() || undefined : undefined
      };

      const created = await confessionsApiClient.createConfession(payload);
      if (onConfessionCreated) {
        onConfessionCreated(created);
      }
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit confession. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="w-full max-w-2xl bg-[#10121A] border border-white/15 rounded-3xl p-6 sm:p-8 space-y-6 max-h-[92vh] overflow-y-auto no-scrollbar shadow-2xl relative">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500/30 to-purple-600/30 border border-rose-500/30 flex items-center justify-center text-rose-300">
              <Feather className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-heading font-extrabold text-lg text-white">
                  Whisper a Confession
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 uppercase">
                  Story
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Let it off your chest. Choose whether you speak anonymously, publicly, or into your private vault.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* =============================================================== */}
          {/* 1. VISIBILITY SELECTION: ANONYMOUS vs PUBLIC vs PRIVATE         */}
          {/* =============================================================== */}
          <div className="space-y-2">
            <label className="text-xs font-heading font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
              <span>1. Choose Visibility</span>
              <span className="text-zinc-500 font-normal lowercase">(How will this be shared?)</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Option A: Anonymous */}
              <button
                type="button"
                onClick={() => setVisibility('anonymous')}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  visibility === 'anonymous'
                    ? 'bg-rose-500/15 border-rose-400 text-white shadow-lg shadow-rose-950/40 ring-1 ring-rose-400/40'
                    : 'bg-white/[0.03] border-white/10 text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.06]'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-7 h-7 rounded-lg bg-rose-500/20 flex items-center justify-center text-rose-300">
                    <EyeOff className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300">
                    Popular
                  </span>
                </div>
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-white block">Anonymous</span>
                  <span className="text-[11px] text-zinc-400 leading-tight block">
                    Identity 100% masked. Appears with alias like "Midnight Soul #341".
                  </span>
                </div>
              </button>

              {/* Option B: Public */}
              <button
                type="button"
                onClick={() => setVisibility('public')}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  visibility === 'public'
                    ? 'bg-sky-500/15 border-sky-400 text-white shadow-lg shadow-sky-950/40 ring-1 ring-sky-400/40'
                    : 'bg-white/[0.03] border-white/10 text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.06]'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-7 h-7 rounded-lg bg-sky-500/20 flex items-center justify-center text-sky-300">
                    <Globe2 className="w-4 h-4" />
                  </div>
                </div>
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-white block">Public</span>
                  <span className="text-[11px] text-zinc-400 leading-tight block">
                    Shared publicly under your name and profile story timeline.
                  </span>
                </div>
              </button>

              {/* Option C: Private Vault */}
              <button
                type="button"
                onClick={() => setVisibility('private')}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  visibility === 'private'
                    ? 'bg-amber-500/15 border-amber-400 text-white shadow-lg shadow-amber-950/40 ring-1 ring-amber-400/40'
                    : 'bg-white/[0.03] border-white/10 text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.06]'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-300">
                    <Lock className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300">
                    Encrypted
                  </span>
                </div>
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-white block">Private Vault</span>
                  <span className="text-[11px] text-zinc-400 leading-tight block">
                    Strictly for your eyes only. Stored safely in your private emotional safe.
                  </span>
                </div>
              </button>
            </div>

            {/* Optional Custom Alias if Anonymous */}
            {visibility === 'anonymous' && (
              <div className="pt-1">
                <input
                  type="text"
                  value={customAlias}
                  onChange={e => setCustomAlias(e.target.value)}
                  placeholder="Custom alias (optional, e.g. 'Coffee Shop Sleepless')"
                  className="w-full px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-rose-400/60"
                  maxLength={40}
                />
              </div>
            )}
          </div>

          {/* =============================================================== */}
          {/* 2. CONFESSION TITLE & STORY BODY                                */}
          {/* =============================================================== */}
          <div className="space-y-3">
            <div>
              <label className="text-xs font-heading font-bold uppercase tracking-wider text-zinc-300 block mb-1">
                Story Title / Headline
              </label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Give your confession a poignant opening line..."
                className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400/60"
                maxLength={120}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-heading font-bold uppercase tracking-wider text-zinc-300">
                  The Full Confession Story
                </label>
                <span className="text-[10px] text-zinc-500 font-mono">
                  {story.length} chars
                </span>
              </div>
              <textarea
                value={story}
                onChange={e => setStory(e.target.value)}
                rows={6}
                placeholder="Write your raw, honest story here without holding back. There is no judgment here..."
                className="w-full px-4 py-3 rounded-2xl bg-white/[0.04] border border-white/10 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400/60 leading-relaxed"
                maxLength={4000}
              />
            </div>
          </div>

          {/* =============================================================== */}
          {/* 3. CATEGORY & EMOTIONAL MOOD                                   */}
          {/* =============================================================== */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-heading font-bold uppercase tracking-wider text-zinc-300 block">
                Category
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as ConfessionCategory)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#141724] border border-white/10 text-xs text-white focus:outline-none focus:border-amber-400/60 cursor-pointer"
              >
                {CATEGORIES.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.icon} {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-heading font-bold uppercase tracking-wider text-zinc-300 block">
                Emotional Mood
              </label>
              <select
                value={mood}
                onChange={e => setMood(e.target.value as ConfessionMood)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#141724] border border-white/10 text-xs text-white focus:outline-none focus:border-amber-400/60 cursor-pointer"
              >
                {MOODS.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* =============================================================== */}
          {/* 4. RELATED RESONANCE TAGS (OPTIMIZATION & RECOMMENDATIONS)      */}
          {/* =============================================================== */}
          <div className="space-y-3 p-4 rounded-2xl bg-white/[0.03] border border-white/10">
            <div className="flex items-center justify-between">
              <label className="text-xs font-heading font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5" />
                <span>Related Resonance Tags</span>
              </label>
              <span className="text-[10px] text-zinc-400">
                Optimizes future supportive recommendations
              </span>
            </div>

            {/* Selected Tags Chips */}
            {selectedTags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {selectedTags.map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-amber-400/15 text-amber-300 border border-amber-400/30"
                  >
                    <span>#{tag}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-white text-amber-400/70 p-0.5 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Custom Tag Input */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ',') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                placeholder="Type tag & press enter (e.g. #anxiety, #firstlove)..."
                className="flex-1 px-3.5 py-2 rounded-xl bg-[#141724] border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400/60"
              />
              <button
                type="button"
                onClick={() => handleAddTag()}
                className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-zinc-200 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Tag</span>
              </button>
            </div>

            {/* Suggested Tags Quick Selection */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] text-zinc-400 font-medium block">Suggested Tags to Click:</span>
              <div className="flex flex-wrap gap-1.5">
                {SUGGESTED_TAGS.map(tag => {
                  const isSelected = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => isSelected ? handleRemoveTag(tag) : handleAddTag(tag)}
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-md border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-amber-400/20 border-amber-400/50 text-amber-300 font-bold'
                          : 'bg-white/[0.02] border-white/10 text-zinc-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      #{tag} {isSelected ? '✓' : '+'}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* =============================================================== */}
          {/* 5. SENSITIVE WARNING TOGGLE                                    */}
          {/* =============================================================== */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.03] border border-white/10">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-zinc-200 block">Sensitive or Triggering Content?</span>
              <span className="text-[11px] text-zinc-400 block">
                Blur the story in feeds until the reader explicitly chooses to view it.
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsSensitive(!isSensitive)}
              className={`w-11 h-6 rounded-full transition-colors p-1 cursor-pointer flex items-center ${
                isSensitive ? 'bg-amber-400 justify-end' : 'bg-white/15 justify-start'
              }`}
            >
              <div className={`w-4 h-4 rounded-full bg-[#10121A] transition-all`} />
            </button>
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 via-amber-500 to-amber-600 hover:scale-105 text-white font-bold text-xs shadow-lg shadow-rose-600/30 transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Whispering...' : `Publish ${visibility.toUpperCase()} Confession`}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
