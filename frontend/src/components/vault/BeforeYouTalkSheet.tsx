import React from 'react';
import { 
  Heart, 
  Sparkles, 
  Clock, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  MessageCircle, 
  X, 
  ShieldCheck, 
  Lightbulb, 
  Send,
  BookOpen
} from 'lucide-react';
import { DraggableBottomSheet } from '../klyven';
import type { RelationshipProfile } from '../../types/relationshipVault';

interface BeforeYouTalkSheetProps {
  isOpen: boolean;
  onClose: () => void;
  profile: RelationshipProfile | null;
  onInitiateChat?: (profile: RelationshipProfile) => void;
  onOpenFullMemory?: (profile: RelationshipProfile) => void;
}

/**
 * "Before You Talk to [Person]" Instant Briefing Card
 * The heart of Relational Intelligence & Prospective Memory.
 */
export const BeforeYouTalkSheet: React.FC<BeforeYouTalkSheetProps> = ({
  isOpen,
  onClose,
  profile,
  onInitiateChat,
  onOpenFullMemory
}) => {
  if (!isOpen || !profile) return null;

  return (
    <DraggableBottomSheet
      isOpen={isOpen}
      onClose={onClose}
      heightClass="h-[85vh] sm:h-[80vh]"
    >
      <div className="p-4 sm:p-6 flex flex-col h-full overflow-hidden">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full overflow-hidden border-2 border-white/20 shrink-0 relative">
              <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-rose-400">
                  Private Briefing
                </span>
                <span className="text-zinc-500">·</span>
                <span className="text-[10px] text-zinc-400">{profile.statusLabel}</span>
              </div>
              <h3 className="text-base font-bold text-white font-serif tracking-tight">
                Before You Talk to {profile.name}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Briefing Content */}
        <div className="flex-1 overflow-y-auto no-scrollbar py-4 space-y-4">
          
          {/* 1. THINGS SHE/HE APPRECIATES */}
          <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 space-y-2">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 text-rose-400" />
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

          {/* 2. UPCOMING DATES & DEADLINES */}
          {profile.upcomingReminders.length > 0 && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-2">
              <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                <span>Upcoming Events & Deadlines</span>
              </h4>
              <div className="space-y-1.5">
                {profile.upcomingReminders.map((rem, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-amber-100">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                    <span className="leading-relaxed font-medium">{rem}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. LAST CONVERSATION RECAP */}
          <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 space-y-2">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-zinc-300" />
              <span>Last Conversation Summary</span>
            </h4>
            <p className="text-xs text-zinc-300 leading-relaxed italic bg-black/40 p-3 rounded-xl border border-white/5">
              "{profile.lastConversationSummary}"
            </p>
          </div>

          {/* 4. PERSONAL BEHAVIORAL REMINDER (ETIQUETTE) */}
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-2">
            <h4 className="text-xs font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
              <Lightbulb className="w-3.5 h-3.5" />
              <span>💡 Personal Etiquette Reminder</span>
            </h4>
            <div className="space-y-1.5">
              {profile.personalReminders.map((pr, idx) => (
                <p key={idx} className="text-xs text-emerald-100 leading-relaxed">
                  {pr}
                </p>
              ))}
            </div>
          </div>

          {/* 5. ACTIVE PENDING PROMISES */}
          {profile.promises.filter(p => p.status !== 'completed').length > 0 && (
            <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 space-y-2">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center justify-between">
                <span>Things You Promised</span>
                <span className="text-[10px] text-zinc-400 font-normal">Don't forget!</span>
              </h4>
              <div className="space-y-1.5">
                {profile.promises.filter(p => p.status !== 'completed').map(prm => (
                  <div key={prm.id} className="p-2.5 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between text-xs">
                    <span className="text-zinc-200 font-medium">{prm.title}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/10 text-amber-300">
                      {prm.status === 'in_progress' ? 'In Progress' : 'Pending'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 6. THINGS SHE MENTIONED CASUALLY */}
          {profile.thingsTheyMentionedOnce.length > 0 && (
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-2">
              <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                Things Mentioned Casually
              </h4>
              <div className="space-y-1">
                {profile.thingsTheyMentionedOnce.map((item, idx) => (
                  <p key={idx} className="text-[11px] text-zinc-400 italic">
                    • "{item}"
                  </p>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-3 shrink-0">
          <button
            onClick={() => {
              onOpenFullMemory?.(profile);
              onClose();
            }}
            className="flex-1 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/15 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Full Profile Vault</span>
          </button>

          <button
            onClick={() => {
              onInitiateChat?.(profile);
              onClose();
            }}
            className="flex-1 py-2.5 rounded-2xl bg-white text-[#090A0E] font-bold text-xs hover:brightness-110 shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>Message {profile.nickname || profile.name}</span>
          </button>
        </div>

      </div>
    </DraggableBottomSheet>
  );
};
