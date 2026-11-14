import React, { useState } from 'react';
import { 
  Sparkles, 
  Heart, 
  Moon, 
  Mail, 
  Edit3, 
  Lock, 
  Copy, 
  Bookmark, 
  Check, 
  ChevronRight, 
  X, 
  BookOpen, 
  Plus, 
  Trash2,
  Compass,
  Smile
} from 'lucide-react';
import { GlassModal, GlassButton } from '../klyven';
import type { ContentMood, EmotionalContentItem, UnopenedLetter, UnsentWord } from '../../types/emotionalUniverse';
import { 
  EmotionalContentEngine, 
  THE_UNSPOKEN_COLLECTION, 
  MIDNIGHT_THOUGHTS_COLLECTION, 
  UNOPENED_LETTERS_POOL 
} from '../../services/emotionalContentEngine';
import { ConfessionsStreamView } from '../confessions/ConfessionsStreamView';

interface TheUnspokenSanctuaryProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TheUnspokenSanctuary: React.FC<TheUnspokenSanctuaryProps> = ({
  isOpen,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'inner_room' | 'unspoken' | 'midnight' | 'letters' | 'unsent' | 'mirror' | 'confessions'>('inner_room');

  // Mood selector in The Inner Room
  const [selectedMood, setSelectedMood] = useState<ContentMood>('vulnerable');

  // Unsent words state
  const [unsentWords, setUnsentWords] = useState<UnsentWord[]>(() => EmotionalContentEngine.getUnsentWords());
  const [isWritingUnsent, setIsWritingUnsent] = useState(false);
  const [newRecipient, setNewRecipient] = useState('');
  const [newUnsentContent, setNewUnsentContent] = useState('');

  // Unopened Letter active state
  const [activeLetter, setActiveLetter] = useState<UnopenedLetter | null>(null);

  // Copy & Save feedback
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentMoodItems = EmotionalContentEngine.getItemsByMood(selectedMood);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSave = (id: string, text: string) => {
    EmotionalContentEngine.saveThought(text);
    setSavedId(id);
    setTimeout(() => setSavedId(null), 2000);
  };

  const handleAddUnsentWord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUnsentContent.trim()) return;
    EmotionalContentEngine.addUnsentWord({
      recipientName: newRecipient.trim() || 'Someone I remember',
      content: newUnsentContent.trim(),
      mood: 'vulnerable'
    });
    setNewRecipient('');
    setNewUnsentContent('');
    setIsWritingUnsent(false);
    setUnsentWords(EmotionalContentEngine.getUnsentWords());
  };

  const handleDeleteUnsentWord = (id: string) => {
    EmotionalContentEngine.deleteUnsentWord(id);
    setUnsentWords(EmotionalContentEngine.getUnsentWords());
  };

  return (
    <GlassModal
      isOpen={isOpen}
      onClose={onClose}
      title="A Little Place Called The Unspoken"
      maxWidth="2xl"
    >
      <div className="space-y-4 max-h-[82vh] overflow-y-auto no-scrollbar pr-1">
        
        {/* SERENE HEADER BANNER */}
        <div className="p-6 sm:p-7 rounded-3xl dark-glass border border-white/15 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-rose-500/10 via-purple-500/5 to-transparent pointer-events-none" />

          <div className="space-y-2">
            <span className="type-metadata font-mono font-bold uppercase tracking-wider text-rose-300 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
              <span>Sanctuary of Quiet Depth</span>
            </span>
            <h3 className="type-section-heading text-white tracking-tight">
              The Unspoken & The Inner Room
            </h3>
            <p className="type-supporting text-zinc-300 leading-relaxed max-w-lg">
              For everything you feel but don't always know how to say. No matching required, no pressure to perform. Just a quiet room to breathe and reflect.
            </p>
          </div>
        </div>

        {/* NAVIGATION TABS */}
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-white/[0.04] border border-white/10 overflow-x-auto no-scrollbar">
          {[
            { id: 'inner_room' as const, label: '🧘 The Inner Room' },
            { id: 'unspoken' as const, label: '✨ The Unspoken' },
            { id: 'midnight' as const, label: '🌙 Midnight Thoughts' },
            { id: 'letters' as const, label: '✉️ Unopened Letters' },
            { id: 'confessions' as const, label: '🤫 Secret Confessions' },
            { id: 'unsent' as const, label: '📝 Unsent Words' },
            { id: 'mirror' as const, label: '🪞 The Mirror' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`h-10 px-4 rounded-xl font-heading font-semibold text-xs whitespace-nowrap transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-white text-[#090A0E] shadow-md'
                  : 'text-zinc-400 hover:text-white hover:bg-white/[0.05]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ================================================================= */}
        {/* TAB 1: THE INNER ROOM (MOOD-BASED EMOTIONAL DISCOVERY ENGINE)     */}
        {/* ================================================================= */}
        {activeTab === 'inner_room' && (
          <div className="space-y-6 animate-fadeIn">
            
            <div className="space-y-3">
              <label className="type-metadata font-bold text-zinc-400 uppercase tracking-wider block">
                What do you feel like reading right now?
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {[
                  { id: 'vulnerable' as const, label: '🫂 I want to feel understood' },
                  { id: 'romantic' as const, label: '❤️ I want to understand love' },
                  { id: 'hopeful' as const, label: '🌱 I need motivation' },
                  { id: 'curious' as const, label: '👀 I am curious about people' },
                  { id: 'comforting' as const, label: '🌙 I want something beautiful' },
                  { id: 'playful' as const, label: '✨ I want to laugh / smile' }
                ].map(mood => (
                  <button
                    key={mood.id}
                    onClick={() => setSelectedMood(mood.id)}
                    className={`min-h-[44px] p-3 rounded-2xl border text-left text-xs font-semibold transition-all cursor-pointer ${
                      selectedMood === mood.id
                        ? 'bg-white text-[#090A0E] font-bold shadow-md scale-[1.01]'
                        : 'bg-white/[0.03] border-white/10 text-zinc-300 hover:text-white hover:bg-white/[0.06]'
                    }`}
                  >
                    {mood.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Displaying Thought / Question Cards for this Mood */}
            <div className="space-y-4 pt-2">
              <span className="type-metadata uppercase font-bold text-zinc-400 tracking-wider block">
                A Little Reflection For This Moment
              </span>

              {currentMoodItems.map(item => (
                <div
                  key={item.id}
                  className="sv-card p-5 sm:p-6 space-y-4 shadow-lg"
                >
                  <blockquote className="font-editorial italic text-base sm:text-lg text-white/95 leading-relaxed">
                    "{item.content}"
                  </blockquote>

                  {item.subtext && (
                    <p className="type-supporting text-zinc-300 leading-relaxed">
                      {item.subtext}
                    </p>
                  )}

                  <div className="flex items-center justify-between pt-3 border-t border-white/[0.06]">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {item.tags.map(t => (
                        <span key={t} className="px-2.5 py-1 rounded-md bg-white/5 text-zinc-400 type-metadata">
                          #{t}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCopy(item.id, item.content)}
                        className="h-8 px-3 rounded-xl bg-white/[0.06] hover:bg-white/15 text-zinc-300 text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        {copiedId === item.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedId === item.id ? 'Copied' : 'Copy'}</span>
                      </button>

                      <button
                        onClick={() => handleSave(item.id, item.content)}
                        className="h-8 px-3 rounded-xl bg-white/[0.06] hover:bg-white/15 text-zinc-300 text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        {savedId === item.id ? <Check className="w-3.5 h-3.5 text-rose-400" /> : <Bookmark className="w-3.5 h-3.5" />}
                        <span>{savedId === item.id ? 'Saved' : 'Save'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 2: THE UNSPOKEN SIGNATURE THOUGHTS                            */}
        {/* ================================================================= */}
        {activeTab === 'unspoken' && (
          <div className="space-y-4 animate-fadeIn">
            {THE_UNSPOKEN_COLLECTION.map(thought => (
              <div
                key={thought.id}
                className="sv-card p-6 space-y-3.5 shadow-lg"
              >
                <h4 className="font-editorial italic text-base sm:text-lg text-white/95 leading-relaxed">
                  "{thought.content}"
                </h4>
                <p className="type-supporting text-zinc-300 leading-relaxed">
                  {thought.subtext}
                </p>

                <div className="flex items-center justify-between pt-3 border-t border-white/[0.06]">
                  <span className="type-metadata text-zinc-500 font-mono">The Unspoken Archive</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopy(thought.id, thought.content)}
                      className="h-8 px-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold cursor-pointer"
                    >
                      {copiedId === thought.id ? 'Copied ✓' : 'Copy Thought'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 3: MIDNIGHT THOUGHTS                                          */}
        {/* ================================================================= */}
        {activeTab === 'midnight' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="p-4 rounded-2xl bg-indigo-950/20 border border-indigo-500/20 type-supporting text-indigo-200 leading-relaxed">
              <Moon className="w-4 h-4 text-indigo-400 inline mr-2" />
              Special evening collection for quiet late-night contemplation when the rest of the world is asleep.
            </div>

            {MIDNIGHT_THOUGHTS_COLLECTION.map(item => (
              <div
                key={item.id}
                className="sv-card p-6 space-y-3 shadow-lg"
              >
                <blockquote className="font-editorial italic text-base sm:text-lg text-white/95 leading-relaxed">
                  "{item.content}"
                </blockquote>
                <p className="type-supporting text-zinc-300 leading-relaxed">{item.subtext}</p>
              </div>
            ))}
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 4: UNOPENED LETTERS (EASTER EGG IN QUIET CORNERS)             */}
        {/* ================================================================= */}
        {activeTab === 'letters' && (
          <div className="space-y-4 animate-fadeIn">
            <p className="type-supporting text-zinc-300">
              Warm letters from quiet corners of the universe waiting to be opened when you need them.
            </p>

            <div className="space-y-3">
              {UNOPENED_LETTERS_POOL.map(lettr => (
                <div
                  key={lettr.id}
                  onClick={() => setActiveLetter(lettr)}
                  className="sv-card p-5 hover:border-white/25 transition-all cursor-pointer space-y-2 shadow-md group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <Mail className="w-4 h-4 text-amber-300" />
                      <span className="text-sm font-heading font-semibold text-white group-hover:text-amber-200 transition-colors">
                        {lettr.title}
                      </span>
                    </div>
                    <span className="type-metadata font-bold text-zinc-400">Open Letter ›</span>
                  </div>
                  <p className="type-supporting text-zinc-300 font-editorial italic">
                    "{lettr.previewPrompt}"
                  </p>
                </div>
              ))}
            </div>

            {activeLetter && (
              <div className="p-6 rounded-3xl bg-[#141620] border border-amber-400/30 space-y-3.5 animate-fadeIn shadow-2xl relative">
                <button
                  onClick={() => setActiveLetter(null)}
                  className="w-8 h-8 rounded-full flex items-center justify-center absolute top-4 right-4 text-zinc-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-2 text-amber-300 text-xs font-bold uppercase tracking-wider">
                  <Mail className="w-4 h-4" />
                  <span>{activeLetter.title}</span>
                </div>
                <p className="font-editorial italic text-base sm:text-lg text-zinc-100 leading-relaxed">
                  "{activeLetter.message}"
                </p>
                <p className="text-sm text-amber-300 font-semibold pt-1">
                  — {activeLetter.closing}
                </p>
              </div>
            )}
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 5: UNSENT WORDS (PRIVATE SAFE SPACE)                          */}
        {/* ================================================================= */}
        {activeTab === 'unsent' && (
          <div className="space-y-3.5 animate-fadeIn">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Unsent Words
                </h4>
                <p className="text-[11px] text-zinc-400">A private sanctuary to write things you don't intend to send.</p>
              </div>

              <button
                onClick={() => setIsWritingUnsent(!isWritingUnsent)}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Write Unsent</span>
              </button>
            </div>

            {isWritingUnsent && (
              <form onSubmit={handleAddUnsentWord} className="p-4 rounded-2xl bg-white/[0.04] border border-white/15 space-y-3">
                <input
                  type="text"
                  value={newRecipient}
                  onChange={(e) => setNewRecipient(e.target.value)}
                  placeholder="Who is this written for? (e.g. Someone from 2023, My younger self, An old friend)"
                  className="w-full px-3 py-2 rounded-xl bg-white/[0.06] border border-white/15 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white/30"
                />
                <textarea
                  value={newUnsentContent}
                  onChange={(e) => setNewUnsentContent(e.target.value)}
                  rows={4}
                  placeholder="Write freely. Everything stays 100% private in your device vault..."
                  className="w-full px-3 py-2 rounded-xl bg-white/[0.06] border border-white/15 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white/30 resize-none leading-relaxed"
                  required
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsWritingUnsent(false)}
                    className="px-3 py-1.5 rounded-xl text-zinc-400 text-xs font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-xl bg-white text-[#090A0E] text-xs font-bold cursor-pointer"
                  >
                    Save Privately
                  </button>
                </div>
              </form>
            )}

            <div className="space-y-2.5">
              {unsentWords.map(word => (
                <div key={word.id} className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] space-y-2 relative group">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-zinc-200">To: {word.recipientName}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-zinc-500">{word.createdAt}</span>
                      <button
                        onClick={() => handleDeleteUnsentWord(word.id)}
                        className="text-zinc-500 hover:text-red-400 transition-colors p-1"
                        title="Delete Permanently"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-zinc-300 leading-relaxed italic bg-black/40 p-3 rounded-xl border border-white/5">
                    "{word.content}"
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 6: THE MIRROR (SUBJECTIVE THEMATIC OBSERVATIONS)              */}
        {/* ================================================================= */}
        {activeTab === 'mirror' && (
          <div className="space-y-3.5 animate-fadeIn">
            <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 text-xs text-zinc-400 leading-relaxed">
              <span className="font-bold text-white block mb-0.5">🪞 The Mirror</span>
              Gentle observations derived from your voluntarily saved reflections and values. This is an observation of recurring themes, not a psychological diagnosis.
            </div>

            <div className="space-y-3">
              {[
                {
                  theme: 'Consistency Over Performance',
                  observation: 'You appear to place deep value on quiet, predictable consistency rather than dramatic romantic gestures.',
                  evidence: 'Based on your reflection in "Remembering Details vs Grand Gestures"'
                },
                {
                  theme: 'Sanctuary Solitude',
                  observation: 'Solitude is not loneliness for you; it is how you replenish your empathy before showing up for people.',
                  evidence: 'Based on your notes in "The Inner Citadel"'
                },
                {
                  theme: 'Observant Warmth',
                  observation: 'You notice small details about others and appreciate it profoundly when someone notices your subtle efforts in return.',
                  evidence: 'Based on your voluntary thoughts in "The Things People Rarely Admit"'
                }
              ].map((obs, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-rose-300 tracking-wider block">
                    {obs.theme}
                  </span>
                  <p className="text-xs text-zinc-200 leading-relaxed font-medium">
                    "{obs.observation}"
                  </p>
                  <span className="text-[10px] text-zinc-500 block pt-1">
                    {obs.evidence}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 7: SECRET CONFESSIONS (ANONYMOUS, PUBLIC & PRIVATE STORIES)   */}
        {/* ================================================================= */}
        {activeTab === 'confessions' && (
          <div className="pt-2 animate-fadeIn">
            <ConfessionsStreamView />
          </div>
        )}

      </div>
    </GlassModal>
  );
};
