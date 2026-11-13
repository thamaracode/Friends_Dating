import React, { useState } from 'react';
import { 
  Heart, 
  Sparkles, 
  Calendar, 
  Clock, 
  Check, 
  Plus, 
  Lightbulb, 
  Gift, 
  MapPin, 
  ShieldAlert, 
  CheckCircle2, 
  MessageCircle, 
  X, 
  Edit3, 
  AlertTriangle,
  Lock,
  BookOpen,
  Send,
  Flag,
  Coffee
} from 'lucide-react';
import { GlassModal, GlassButton } from '../klyven';
import type { RelationshipProfile, RelationshipPromise } from '../../types/relationshipVault';
import { RelationshipVaultService } from '../../services/relationshipVaultService';

interface IndividualRelationshipDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: RelationshipProfile | null;
  onUpdateProfile?: (updated: RelationshipProfile) => void;
  onInitiateChat?: (profile: RelationshipProfile) => void;
}

export const IndividualRelationshipDetailModal: React.FC<IndividualRelationshipDetailModalProps> = ({
  isOpen,
  onClose,
  profile,
  onUpdateProfile,
  onInitiateChat
}) => {
  if (!isOpen || !profile) return null;

  const [activeTab, setActiveTab] = useState<'briefing' | 'memories' | 'promises' | 'timeline' | 'conversations' | 'dynamics'>('briefing');
  
  // Adding items state
  const [newPromiseTitle, setNewPromiseTitle] = useState('');
  const [newPromiseDueDate, setNewPromiseDueDate] = useState('');
  const [isAddingPromise, setIsAddingPromise] = useState(false);

  const [newMentionedOnce, setNewMentionedOnce] = useState('');
  const [isAddingMentioned, setIsAddingMentioned] = useState(false);

  const [newGiftIdea, setNewGiftIdea] = useState('');
  const [isAddingGift, setIsAddingGift] = useState(false);

  const handleTogglePromise = (promiseId: string) => {
    RelationshipVaultService.togglePromiseStatus(profile.id, promiseId);
    const updated = RelationshipVaultService.getProfileById(profile.id);
    if (updated) onUpdateProfile?.(updated);
  };

  const handleCreatePromise = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPromiseTitle.trim()) return;
    RelationshipVaultService.addPromise(profile.id, {
      personId: profile.id,
      title: newPromiseTitle.trim(),
      dueDate: newPromiseDueDate.trim() || undefined,
      status: 'pending'
    });
    setNewPromiseTitle('');
    setNewPromiseDueDate('');
    setIsAddingPromise(false);
    const updated = RelationshipVaultService.getProfileById(profile.id);
    if (updated) onUpdateProfile?.(updated);
  };

  const handleAddMentionedOnce = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMentionedOnce.trim()) return;
    RelationshipVaultService.addMentionedOnce(profile.id, newMentionedOnce.trim());
    setNewMentionedOnce('');
    setIsAddingMentioned(false);
    const updated = RelationshipVaultService.getProfileById(profile.id);
    if (updated) onUpdateProfile?.(updated);
  };

  const handleAddGiftIdea = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGiftIdea.trim()) return;
    RelationshipVaultService.addGiftIdea(profile.id, newGiftIdea.trim());
    setNewGiftIdea('');
    setIsAddingGift(false);
    const updated = RelationshipVaultService.getProfileById(profile.id);
    if (updated) onUpdateProfile?.(updated);
  };

  return (
    <GlassModal
      isOpen={isOpen}
      onClose={onClose}
      title={`Relationship Memory · ${profile.name}`}
      maxWidth="2xl"
    >
      <div className="space-y-4 max-h-[82vh] overflow-y-auto no-scrollbar pr-1">
        
        {/* HERO PROFILE SUMMARY CARD */}
        <div className="p-4 sm:p-5 rounded-3xl dark-glass border border-white/15 relative overflow-hidden shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white/20 shrink-0 shadow-lg relative">
              <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-white font-serif tracking-tight">
                  {profile.name}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-300 border border-rose-500/25">
                  {profile.statusLabel}
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                First met {profile.firstMet} {profile.firstMetLocation && `· ${profile.firstMetLocation}`}
              </p>
              <div className="flex items-center gap-2 mt-1 text-[11px] text-zinc-400">
                {profile.birthday && <span>🎂 {profile.birthday}</span>}
                {profile.anniversary && <span>· 💍 {profile.anniversary}</span>}
                <span>· 💖 {profile.loveLanguage || 'Quality Time'}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={() => {
                onInitiateChat?.(profile);
                onClose();
              }}
              className="px-3.5 py-1.5 rounded-xl bg-white text-[#090A0E] text-xs font-bold hover:brightness-110 shadow-md flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Chat</span>
            </button>
          </div>
        </div>

        {/* NAVIGATION TABS */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-white/[0.04] border border-white/10 overflow-x-auto no-scrollbar text-xs">
          {[
            { id: 'briefing' as const, label: '⚡ Before You Talk' },
            { id: 'memories' as const, label: '🧠 Memory Notes' },
            { id: 'promises' as const, label: `🤝 Promises (${profile.promises.filter(p => p.status !== 'completed').length})` },
            { id: 'timeline' as const, label: '⏳ Timeline' },
            { id: 'conversations' as const, label: '💬 Past Talks' },
            { id: 'dynamics' as const, label: '🌱 Dynamics' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-white text-[#090A0E] shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ================================================================= */}
        {/* TAB 1: BEFORE YOU TALK (INSTANT BRIEFING)                         */}
        {/* ================================================================= */}
        {activeTab === 'briefing' && (
          <div className="space-y-3.5 animate-fadeIn">
            
            {/* Things She Appreciates */}
            <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 space-y-2">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Heart className="w-4 h-4 text-rose-400" />
                <span>Things {profile.nickname || profile.name} Appreciates</span>
              </h4>
              <div className="space-y-1.5">
                {profile.thingsTheyAppreciate.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-zinc-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 shrink-0" />
                    <span className="leading-relaxed">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming Deadlines & Calendar */}
            {profile.upcomingReminders.length > 0 && (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-2">
                <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>Upcoming Deadlines & Milestones</span>
                </h4>
                <div className="space-y-1.5">
                  {profile.upcomingReminders.map((rem, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-amber-100">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                      <span className="leading-relaxed">{rem}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Last Conversation Summary */}
            <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 space-y-2">
              <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
                <Clock className="w-4 h-4 text-zinc-400" />
                <span>Last Conversation Recap</span>
              </h4>
              <p className="text-xs text-zinc-300 leading-relaxed italic bg-black/40 p-3 rounded-xl border border-white/5">
                "{profile.lastConversationSummary}"
              </p>
            </div>

            {/* Personal Etiquette Reminder */}
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-2">
              <h4 className="text-xs font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-emerald-400" />
                <span>💡 Personal Reminder</span>
              </h4>
              {profile.personalReminders.map((pr, idx) => (
                <p key={idx} className="text-xs text-emerald-100 leading-relaxed">
                  {pr}
                </p>
              ))}
            </div>

          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 2: MEMORY NOTES & PREFERENCES                                 */}
        {/* ================================================================= */}
        {activeTab === 'memories' && (
          <div className="space-y-3.5 animate-fadeIn">
            
            {/* Things She Loves & Dislikes Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 space-y-2">
                <h4 className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
                  Things They Love
                </h4>
                <div className="space-y-1">
                  {profile.thingsTheyLove.map((love, idx) => (
                    <p key={idx} className="text-xs text-zinc-300">• {love}</p>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 space-y-2">
                <h4 className="text-xs font-bold text-red-300 uppercase tracking-wider">
                  Things They Dislike
                </h4>
                <div className="space-y-1">
                  {profile.thingsTheyDislike.map((dis, idx) => (
                    <p key={idx} className="text-xs text-zinc-300">• {dis}</p>
                  ))}
                </div>
              </div>
            </div>

            {/* Things Mentioned Once */}
            <div className="p-4 rounded-2xl dark-glass border border-white/10 space-y-2.5">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-zinc-300" />
                  <span>Things Mentioned Casually ("Once Mentioned")</span>
                </h4>
                <button
                  onClick={() => setIsAddingMentioned(!isAddingMentioned)}
                  className="text-[11px] font-bold text-zinc-300 hover:text-white flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Note</span>
                </button>
              </div>

              {isAddingMentioned && (
                <form onSubmit={handleAddMentionedOnce} className="flex gap-2 pt-1">
                  <input
                    type="text"
                    value={newMentionedOnce}
                    onChange={(e) => setNewMentionedOnce(e.target.value)}
                    placeholder="e.g. She mentioned wanting to try ceramics..."
                    className="flex-1 px-3 py-1.5 rounded-xl bg-white/[0.06] border border-white/15 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white/30"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 rounded-xl bg-white text-[#090A0E] text-xs font-bold cursor-pointer"
                  >
                    Save
                  </button>
                </form>
              )}

              <div className="space-y-1.5">
                {profile.thingsTheyMentionedOnce.map((item, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-black/40 border border-white/5 text-xs text-zinc-300 leading-relaxed italic">
                    "{item}"
                  </div>
                ))}
              </div>
            </div>

            {/* Gift Ideas Vault */}
            <div className="p-4 rounded-2xl dark-glass border border-white/10 space-y-2.5">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Gift className="w-3.5 h-3.5 text-amber-300" />
                  <span>Gift Ideas Throughout The Year</span>
                </h4>
                <button
                  onClick={() => setIsAddingGift(!isAddingGift)}
                  className="text-[11px] font-bold text-zinc-300 hover:text-white flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Gift Idea</span>
                </button>
              </div>

              {isAddingGift && (
                <form onSubmit={handleAddGiftIdea} className="flex gap-2 pt-1">
                  <input
                    type="text"
                    value={newGiftIdea}
                    onChange={(e) => setNewGiftIdea(e.target.value)}
                    placeholder="e.g. First edition monograph..."
                    className="flex-1 px-3 py-1.5 rounded-xl bg-white/[0.06] border border-white/15 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white/30"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 rounded-xl bg-white text-[#090A0E] text-xs font-bold cursor-pointer"
                  >
                    Save
                  </button>
                </form>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {profile.giftIdeas.map((idea, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-black/40 border border-white/5 text-xs text-zinc-200 flex items-center gap-2">
                    <span className="text-amber-300">🎁</span>
                    <span className="truncate">{idea}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Places to Visit Together */}
            {profile.placesToVisitTogether.length > 0 && (
              <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 space-y-2">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-blue-400" />
                  <span>Places to Visit Together (Shared Bucket List)</span>
                </h4>
                <div className="space-y-1">
                  {profile.placesToVisitTogether.map((place, idx) => (
                    <p key={idx} className="text-xs text-zinc-300 flex items-center gap-2">
                      <span className="text-blue-400">📍</span>
                      <span>{place}</span>
                    </p>
                  ))}
                </div>
              </div>
            )}

            {/* Boundaries & Sensitive Topics */}
            {profile.thingsNotToDiscuss.length > 0 && (
              <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 space-y-1.5">
                <h4 className="text-xs font-bold text-red-300 uppercase tracking-wider flex items-center gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                  <span>Boundaries / Things Not to Discuss</span>
                </h4>
                {profile.thingsNotToDiscuss.map((bnd, idx) => (
                  <p key={idx} className="text-xs text-red-100">
                    • {bnd}
                  </p>
                ))}
              </div>
            )}

          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 3: PROMISES TRACKER                                           */}
        {/* ================================================================= */}
        {activeTab === 'promises' && (
          <div className="space-y-3.5 animate-fadeIn">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Things I Promised {profile.nickname || profile.name}
                </h4>
                <p className="text-[11px] text-zinc-400">Tap status to cycle: Pending → In Progress → Completed</p>
              </div>

              <button
                onClick={() => setIsAddingPromise(!isAddingPromise)}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Promise</span>
              </button>
            </div>

            {isAddingPromise && (
              <form onSubmit={handleCreatePromise} className="p-4 rounded-2xl bg-white/[0.04] border border-white/15 space-y-3">
                <input
                  type="text"
                  value={newPromiseTitle}
                  onChange={(e) => setNewPromiseTitle(e.target.value)}
                  placeholder="What did you promise? (e.g. Take her to the beach cafe)"
                  className="w-full px-3 py-2 rounded-xl bg-white/[0.06] border border-white/15 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white/30"
                  required
                />
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newPromiseDueDate}
                    onChange={(e) => setNewPromiseDueDate(e.target.value)}
                    placeholder="Due date (optional, e.g. Next weekend)"
                    className="flex-1 px-3 py-2 rounded-xl bg-white/[0.06] border border-white/15 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white/30"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-white text-[#090A0E] text-xs font-bold cursor-pointer"
                  >
                    Add Promise
                  </button>
                </div>
              </form>
            )}

            <div className="space-y-2">
              {profile.promises.map(prm => (
                <div
                  key={prm.id}
                  onClick={() => handleTogglePromise(prm.id)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    prm.status === 'completed'
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-200 line-through opacity-70'
                      : prm.status === 'in_progress'
                        ? 'bg-amber-500/10 border-amber-500/25 text-amber-100'
                        : 'bg-white/[0.04] border-white/10 text-white hover:bg-white/[0.08]'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                      prm.status === 'completed'
                        ? 'bg-emerald-500 border-emerald-400 text-black'
                        : prm.status === 'in_progress'
                          ? 'border-amber-400 text-amber-300'
                          : 'border-white/30'
                    }`}>
                      {prm.status === 'completed' && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>

                    <div className="min-w-0">
                      <span className="text-xs font-semibold block truncate">{prm.title}</span>
                      {prm.dueDate && (
                        <span className="text-[10px] text-zinc-400 block mt-0.5">Target: {prm.dueDate}</span>
                      )}
                    </div>
                  </div>

                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full shrink-0 ${
                    prm.status === 'completed'
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : prm.status === 'in_progress'
                        ? 'bg-amber-500/20 text-amber-300'
                        : 'bg-white/10 text-zinc-300'
                  }`}>
                    {prm.status === 'completed' ? 'Completed ✓' : prm.status === 'in_progress' ? 'In Progress' : 'Pending'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 4: RELATIONSHIP TIMELINE                                      */}
        {/* ================================================================= */}
        {activeTab === 'timeline' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Chronological Relationship History
              </h4>
              <span className="text-[10px] text-zinc-400">Includes triumphs & difficult moments</span>
            </div>

            <div className="relative pl-6 space-y-4 before:content-[''] before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-white/10">
              {profile.timeline.map((event, idx) => (
                <div key={event.id} className="relative space-y-1">
                  <div className={`absolute -left-6 top-1 w-3 h-3 rounded-full border-2 ${
                    event.sentiment === 'milestone' 
                      ? 'bg-rose-500 border-white shadow-[0_0_8px_#F43F5E]' 
                      : event.sentiment === 'difficult'
                        ? 'bg-amber-500 border-white'
                        : 'bg-white border-[#090A0E]'
                  }`} />

                  <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 space-y-1">
                    <div className="flex items-center justify-between text-[10px] font-bold">
                      <span className="text-zinc-400">{event.date}</span>
                      {event.tags?.[0] && (
                        <span className="px-2 py-0.2 rounded-md bg-white/10 text-zinc-300">{event.tags[0]}</span>
                      )}
                    </div>
                    <h5 className="text-xs font-bold text-white tracking-tight">{event.title}</h5>
                    <p className="text-xs text-zinc-300 leading-relaxed">{event.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 5: CONVERSATION MEMORIES                                      */}
        {/* ================================================================= */}
        {activeTab === 'conversations' && (
          <div className="space-y-3.5 animate-fadeIn">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Logged Conversation Memories
              </h4>
            </div>

            {profile.conversationMemories.length === 0 ? (
              <p className="text-xs text-zinc-500 text-center py-6">No conversations logged yet. Tap below to log one.</p>
            ) : (
              profile.conversationMemories.map(cnv => (
                <div key={cnv.id} className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 space-y-2.5">
                  <div className="flex items-center justify-between text-[11px] font-bold">
                    <span className="text-zinc-400">{cnv.date}</span>
                    {cnv.emotionalContext && (
                      <span className="px-2 py-0.5 rounded-full bg-white/10 text-zinc-300 uppercase text-[9px]">
                        Context: {cnv.emotionalContext}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-zinc-200 leading-relaxed">{cnv.summary}</p>

                  {/* Topics Chips */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {cnv.topics.map(t => (
                      <span key={t} className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] text-zinc-400">
                        #{t}
                      </span>
                    ))}
                  </div>

                  {cnv.questionsForNextTime.length > 0 && (
                    <div className="pt-2 border-t border-white/[0.06] text-xs space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
                        Questions for Next Time
                      </span>
                      {cnv.questionsForNextTime.map((q, i) => (
                        <p key={i} className="text-zinc-300 italic">• "{q}"</p>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 6: DYNAMICS & SUBJECTIVE REFLECTIONS                          */}
        {/* ================================================================= */}
        {activeTab === 'dynamics' && (
          <div className="space-y-3.5 animate-fadeIn">
            <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 text-xs text-zinc-400 leading-relaxed">
              <span className="font-bold text-white block mb-0.5">Subjective Relationship Reflections</span>
              These notes are your private thoughts on communication, trust, and connection dynamics. They are NOT objective scores of another human being.
            </div>

            {profile.dynamics && (
              <div className="space-y-3">
                <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-zinc-400">Trust Reflection</span>
                  <p className="text-xs text-zinc-200 leading-relaxed">{profile.dynamics.trustReflection}</p>
                </div>

                <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-zinc-400">Conflict Handling</span>
                  <p className="text-xs text-zinc-200 leading-relaxed">{profile.dynamics.conflictNotes}</p>
                </div>

                <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 space-y-2">
                  <span className="text-[10px] uppercase font-bold text-zinc-400">Agreed Relationship Boundaries</span>
                  <div className="space-y-1">
                    {profile.dynamics.boundariesAgreed.map((bnd, i) => (
                      <p key={i} className="text-xs text-zinc-300">• {bnd}</p>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </GlassModal>
  );
};
