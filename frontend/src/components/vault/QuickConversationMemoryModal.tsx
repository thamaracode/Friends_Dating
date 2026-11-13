import React, { useState } from 'react';
import { 
  MessageCircle, 
  Sparkles, 
  Calendar, 
  Clock, 
  Check, 
  X, 
  Heart,
  Smile,
  ShieldCheck
} from 'lucide-react';
import { GlassModal, GlassButton, GlassPrimaryButton } from '../klyven';
import type { RelationshipProfile } from '../../types/relationshipVault';
import { RelationshipVaultService } from '../../services/relationshipVaultService';

interface QuickConversationMemoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  profiles: RelationshipProfile[];
  preselectedPersonId?: string;
  onSaved?: () => void;
}

export const QuickConversationMemoryModal: React.FC<QuickConversationMemoryModalProps> = ({
  isOpen,
  onClose,
  profiles,
  preselectedPersonId,
  onSaved
}) => {
  const [selectedPersonId, setSelectedPersonId] = useState<string>(preselectedPersonId || (profiles[0]?.id || ''));
  const [summary, setSummary] = useState('');
  const [topicsInput, setTopicsInput] = useState('');
  const [thingsRememberedInput, setThingsRememberedInput] = useState('');
  const [followUpCommitment, setFollowUpCommitment] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [emotionalContext, setEmotionalContext] = useState<'joyful' | 'deep' | 'vulnerable' | 'tense' | 'comforting' | 'awkward'>('deep');
  const [questionsNextTimeInput, setQuestionsNextTimeInput] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPersonId || !summary.trim()) return;

    const topics = topicsInput.split(',').map(s => s.trim()).filter(Boolean);
    const thingsRemembered = thingsRememberedInput.split('\n').map(s => s.trim()).filter(Boolean);
    const questionsForNextTime = questionsNextTimeInput.split('\n').map(s => s.trim()).filter(Boolean);

    RelationshipVaultService.addConversationMemory(selectedPersonId, {
      personId: selectedPersonId,
      date: 'Just now',
      summary: summary.trim(),
      topics: topics.length > 0 ? topics : ['General Catchup'],
      thingsRemembered,
      followUpCommitment: followUpCommitment.trim() || undefined,
      followUpDate: followUpDate.trim() || undefined,
      emotionalContext,
      questionsForNextTime,
      unfinishedDiscussions: []
    });

    onSaved?.();
    onClose();
  };

  return (
    <GlassModal
      isOpen={isOpen}
      onClose={onClose}
      title="Save Conversation Memory"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        
        {/* Person Selector */}
        <div>
          <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1.5">
            Who was this conversation with?
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {profiles.map(p => (
              <div
                key={p.id}
                onClick={() => setSelectedPersonId(p.id)}
                className={`p-2 rounded-2xl border transition-all cursor-pointer flex items-center gap-2 ${
                  selectedPersonId === p.id
                    ? 'bg-white/15 border-white text-white font-bold shadow-md'
                    : 'bg-white/[0.03] border-white/10 text-zinc-400 hover:text-white'
                }`}
              >
                <img src={p.avatar} alt={p.name} className="w-6 h-6 rounded-full object-cover shrink-0" />
                <span className="truncate">{p.nickname || p.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Conversation Summary */}
        <div>
          <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1.5">
            What did you talk about?
          </label>
          <textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            rows={3}
            placeholder="Brief summary of the conversation, feelings shared, or perspective changes..."
            className="w-full px-3 py-2 rounded-2xl bg-white/[0.04] border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-white/30 leading-relaxed resize-none"
            required
          />
        </div>

        {/* Emotional Context */}
        <div>
          <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1.5">
            Emotional Context
          </label>
          <div className="flex items-center gap-1.5 flex-wrap">
            {[
              { id: 'deep' as const, label: '🌌 Deep & Honest' },
              { id: 'vulnerable' as const, label: '🥺 Vulnerable' },
              { id: 'comforting' as const, label: '☕ Warm & Comforting' },
              { id: 'joyful' as const, label: '✨ Playful / Joyful' },
              { id: 'tense' as const, label: '⚡ Tense / Conflict' }
            ].map(ctx => (
              <button
                type="button"
                key={ctx.id}
                onClick={() => setEmotionalContext(ctx.id)}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                  emotionalContext === ctx.id
                    ? 'bg-white text-[#090A0E] shadow-sm'
                    : 'bg-white/[0.04] text-zinc-400 hover:text-white border border-white/10'
                }`}
              >
                {ctx.label}
              </button>
            ))}
          </div>
        </div>

        {/* Things to Remember */}
        <div>
          <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1.5">
            Important details to remember (one per line)
          </label>
          <textarea
            value={thingsRememberedInput}
            onChange={(e) => setThingsRememberedInput(e.target.value)}
            rows={2}
            placeholder="e.g. She feels overwhelmed by meetings&#10;Her presentation date changed to Thursday"
            className="w-full px-3 py-2 rounded-2xl bg-white/[0.04] border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-white/30 resize-none leading-relaxed"
          />
        </div>

        {/* Follow-up commitment & date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
              Follow-up commitment (optional)
            </label>
            <input
              type="text"
              value={followUpCommitment}
              onChange={(e) => setFollowUpCommitment(e.target.value)}
              placeholder="e.g. Send article on architecture"
              className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-white/30"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
              Follow-up by date
            </label>
            <input
              type="text"
              value={followUpDate}
              onChange={(e) => setFollowUpDate(e.target.value)}
              placeholder="e.g. Tomorrow 9 AM"
              className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-white/30"
            />
          </div>
        </div>

        {/* Questions to ask next time */}
        <div>
          <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
            Questions to ask next time (one per line)
          </label>
          <textarea
            value={questionsNextTimeInput}
            onChange={(e) => setQuestionsNextTimeInput(e.target.value)}
            rows={2}
            placeholder="e.g. How did the presentation go?&#10;Did you manage to sleep well?"
            className="w-full px-3 py-2 rounded-2xl bg-white/[0.04] border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-white/30 resize-none leading-relaxed"
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
          <GlassButton type="button" onClick={onClose}>
            Cancel
          </GlassButton>
          <GlassPrimaryButton type="submit">
            Save to Relationship Vault
          </GlassPrimaryButton>
        </div>

      </form>
    </GlassModal>
  );
};
