import React, { useState } from 'react';
import {
  ShieldAlert,
  UserX,
  MessageCircle,
  X,
  Send,
  Sparkles,
  Lock,
  HeartHandshake,
  AlertTriangle,
  Check,
  Compass
} from 'lucide-react';

export interface BlockClosureModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetUser: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
  onConfirmBlock: (params: {
    reason: string;
    partingMessage?: string;
    sendPartingMessage: boolean;
  }) => Promise<void>;
}

const REASONS = [
  { id: 'boundary_crossed', label: 'Boundary crossed or uncomfortable behavior', icon: '🛡️' },
  { id: 'incompatible_intentions', label: 'Incompatible intentions or communication styles', icon: '🥀' },
  { id: 'need_space', label: 'Need emotional space & healthy reset', icon: '🕊️' },
  { id: 'unsolicited_harassment', label: 'Unsolicited messages or harassment', icon: '🚫' },
  { id: 'silent_parting', label: 'Quietly parting ways without conflict', icon: '🚪' },
  { id: 'custom', label: 'Custom reason', icon: '✏️' }
];

const CLOSURE_TEMPLATES = [
  {
    title: 'Healthy Space & Peace',
    text: 'I am stepping away from this conversation to protect my emotional peace and healthy boundaries. Wishing you the best on your journey.'
  },
  {
    title: 'Incompatible Styles',
    text: "I feel our intentions and communication styles aren't aligning, so I'm choosing to part ways here rather than leave things unsaid. Take care."
  },
  {
    title: 'Boundary Setting',
    text: 'I felt uncomfortable with how our conversation unfolded. I am setting a clear boundary and will be blocking this chat to prevent further contact.'
  },
  {
    title: 'Gentle Farewell',
    text: "Thank you for the conversations we shared, but I don't feel this connection is right for me. I wish you all the best."
  }
];

export const BlockClosureModal: React.FC<BlockClosureModalProps> = ({
  isOpen,
  onClose,
  targetUser,
  onConfirmBlock
}) => {
  const [selectedReason, setSelectedReason] = useState(REASONS[0].label);
  const [customReasonText, setCustomReasonText] = useState('');
  const [sendPartingMessage, setSendPartingMessage] = useState(true);
  const [partingMessage, setPartingMessage] = useState(CLOSURE_TEMPLATES[0].text);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleApplyTemplate = (templateText: string) => {
    setPartingMessage(templateText);
    setSendPartingMessage(true);
  };

  const handleExecuteBlock = async (shouldSendMessage: boolean) => {
    setIsSubmitting(true);
    try {
      const finalReason = selectedReason === 'Custom reason' ? customReasonText.trim() || 'Custom boundary' : selectedReason;
      await onConfirmBlock({
        reason: finalReason,
        partingMessage: shouldSendMessage ? partingMessage.trim() : undefined,
        sendPartingMessage: shouldSendMessage && partingMessage.trim().length > 0
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="w-full max-w-lg rounded-3xl dark-glass border border-white/15 bg-[#0D0E14] shadow-2xl p-6 sm:p-7 space-y-5 animate-scaleUp relative max-h-[92vh] overflow-y-auto no-scrollbar">
        
        {/* Header with Target Profile */}
        <div className="flex items-start justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <img
              src={targetUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80'}
              alt={targetUser.name}
              className="w-12 h-12 rounded-full object-cover border-2 border-rose-500/40 shadow-md"
            />
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-300 text-[10px] font-bold uppercase tracking-wider mb-1">
                <ShieldAlert className="w-3 h-3 text-rose-400" />
                <span>Boundary & Closure</span>
              </div>
              <h2 className="text-base sm:text-lg font-heading font-extrabold text-white">
                Block {targetUser.name}
              </h2>
              <p className="text-xs text-zinc-400">
                Provide honest closure or set a silent boundary.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* What Happens Disclosure Pill */}
        <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1.5 text-xs text-zinc-300">
          <div className="font-semibold text-white flex items-center gap-1.5 text-xs">
            <Lock className="w-3.5 h-3.5 text-amber-400" />
            <span>What happens when you block:</span>
          </div>
          <ul className="space-y-1 text-[11px] text-zinc-400 pl-4 list-disc">
            <li>They cannot send you messages or initiate audio/video calls.</li>
            <li>Your online presence and profile activity will be hidden from them.</li>
            <li>They can read your parting words for closure, but cannot reply.</li>
            <li>You can unblock them at any time in Settings.</li>
          </ul>
        </div>

        {/* 1. Why are you blocking? (Reason Selection) */}
        <div className="space-y-2.5">
          <label className="text-xs font-heading font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
            <span>1. Why are you setting this boundary?</span>
          </label>
          <div className="grid grid-cols-1 gap-1.5">
            {REASONS.map(r => {
              const isSelected = selectedReason === r.label;
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setSelectedReason(r.label)}
                  className={`w-full text-left p-2.5 rounded-xl text-xs font-medium transition-all flex items-center gap-2 border ${
                    isSelected
                      ? 'bg-rose-500/15 border-rose-500/40 text-white shadow-sm'
                      : 'bg-white/[0.03] border-white/10 text-zinc-400 hover:text-white hover:bg-white/[0.06]'
                  }`}
                >
                  <span className="text-sm">{r.icon}</span>
                  <span className="flex-1">{r.label}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-rose-400 shrink-0" />}
                </button>
              );
            })}
          </div>

          {selectedReason === 'Custom reason' && (
            <input
              type="text"
              value={customReasonText}
              onChange={(e) => setCustomReasonText(e.target.value)}
              placeholder="Specify custom reason..."
              className="w-full mt-2 p-2.5 rounded-xl bg-black/40 border border-white/15 text-white text-xs placeholder-zinc-500 focus:outline-none focus:border-amber-400"
            />
          )}
        </div>

        {/* 2. Final Parting Words / Closure Message */}
        <div className="space-y-3 border-t border-white/10 pt-4">
          <div className="flex items-center justify-between">
            <label className="text-xs font-heading font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
              <MessageCircle className="w-3.5 h-3.5" />
              <span>2. Parting Words Before Blocking</span>
            </label>
            <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={sendPartingMessage}
                onChange={(e) => setSendPartingMessage(e.target.checked)}
                className="rounded border-white/20 bg-black text-rose-500 focus:ring-0"
              />
              <span className="text-[11px] font-semibold">Send final message</span>
            </label>
          </div>

          {sendPartingMessage ? (
            <div className="space-y-2.5">
              {/* Quick Template Chips */}
              <div className="space-y-1">
                <span className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider">
                  Quick Closure Templates (Click to fill):
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  {CLOSURE_TEMPLATES.map((tmpl, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleApplyTemplate(tmpl.text)}
                      className="text-left p-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 text-[11px] text-zinc-300 hover:text-white transition-colors"
                    >
                      <span className="font-bold text-amber-300 block truncate">{tmpl.title}</span>
                      <span className="text-[10px] text-zinc-400 line-clamp-1">{tmpl.text}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Editable Parting Message Textbox */}
              <textarea
                value={partingMessage}
                onChange={(e) => setPartingMessage(e.target.value)}
                placeholder="Write your parting message here..."
                rows={3}
                className="w-full p-3 rounded-2xl bg-black/40 border border-white/15 text-white placeholder-zinc-500 focus:outline-none focus:border-rose-400 text-xs font-body leading-relaxed resize-none"
              />
              <div className="flex justify-between items-center text-[10px] text-zinc-500">
                <span>Delivered to chat right before blocking takes effect</span>
                <span>{partingMessage.length}/1000</span>
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/10 text-xs text-zinc-400 italic">
              No parting words will be sent. The user will be blocked silently.
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="border-t border-white/10 pt-4 flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white transition-colors order-3 sm:order-1"
          >
            Cancel
          </button>

          <div className="w-full sm:w-auto flex items-center gap-2 order-1 sm:order-2">
            {sendPartingMessage ? (
              <>
                <button
                  type="button"
                  onClick={() => handleExecuteBlock(false)}
                  disabled={isSubmitting}
                  className="flex-1 sm:flex-none px-3.5 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-zinc-300 text-xs font-semibold border border-white/10 transition-colors"
                >
                  Block Silently
                </button>
                <button
                  type="button"
                  onClick={() => handleExecuteBlock(true)}
                  disabled={isSubmitting || !partingMessage.trim()}
                  className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white text-xs font-bold transition-all shadow-lg flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Words & Block</span>
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => handleExecuteBlock(false)}
                disabled={isSubmitting}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <UserX className="w-4 h-4" />
                <span>Confirm Silent Block</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
