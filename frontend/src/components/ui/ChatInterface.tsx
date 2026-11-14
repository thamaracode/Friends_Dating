import React, { useState } from 'react';
import { Check, CheckCheck, Play, Pause, Paperclip, Send, Smile } from 'lucide-react';

export interface ChatMessageUI {
  id: string;
  senderName: string;
  isOutgoing: boolean;
  text?: string;
  mediaUrl?: string;
  voiceDuration?: number;
  voiceWaveform?: number[];
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
  replyTo?: {
    senderName: string;
    textSnippet: string;
  };
  reactions?: Array<{ emoji: string; count: number; userReacted: boolean }>;
}

export interface ChatBubbleProps {
  message: ChatMessageUI;
  onMediaClick?: (url: string) => void;
  onReactionClick?: (emoji: string) => void;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({
  message,
  onMediaClick,
  onReactionClick
}) => {
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);

  return (
    <div className={`flex flex-col ${message.isOutgoing ? 'items-end' : 'items-start'} space-y-1 max-w-[85%] sm:max-w-[70%]`}>
      {/* Reply-to Snippet */}
      {message.replyTo && (
        <div className={`text-[11px] px-3 py-1 rounded-t-xl bg-white/[0.04] border-l-2 border-amber-400 text-zinc-400 truncate max-w-full mb-0.5`}>
          <span className="font-semibold text-amber-300 block">{message.replyTo.senderName}</span>
          <span className="truncate block">{message.replyTo.textSnippet}</span>
        </div>
      )}

      {/* Main Message Bubble */}
      <div
        className={`p-3.5 rounded-3xl relative shadow-md transition-all ${
          message.isOutgoing
            ? 'bg-gradient-to-tr from-[#1E222D] to-[#272B38] text-white border border-white/15 rounded-br-sm'
            : 'bg-[#12141B] text-zinc-100 border border-white/[0.08] rounded-bl-sm'
        }`}
      >
        {/* Media Image / Video Preview */}
        {message.mediaUrl && (
          <div
            onClick={() => onMediaClick?.(message.mediaUrl!)}
            className="rounded-2xl overflow-hidden mb-2 cursor-pointer max-h-60 border border-white/10 group"
          >
            <img
              src={message.mediaUrl}
              alt="Attachment"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
            />
          </div>
        )}

        {/* Voice Note Waveform */}
        {message.voiceWaveform && (
          <div className="flex items-center gap-3 py-1">
            <button
              type="button"
              onClick={() => setIsPlayingVoice(!isPlayingVoice)}
              className="w-8 h-8 rounded-full bg-amber-400 text-zinc-950 flex items-center justify-center shrink-0 cursor-pointer shadow-md"
            >
              {isPlayingVoice ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
            </button>

            <div className="flex items-center gap-0.5 h-6 flex-1">
              {message.voiceWaveform.slice(0, 24).map((amp, idx) => (
                <span
                  key={idx}
                  style={{ height: `${Math.max(20, Math.min(100, amp * 100))}%` }}
                  className={`w-1 rounded-full ${isPlayingVoice ? 'bg-amber-400' : 'bg-white/40'}`}
                />
              ))}
            </div>

            {message.voiceDuration && (
              <span className="text-[10px] font-mono text-zinc-400 shrink-0">
                {message.voiceDuration}s
              </span>
            )}
          </div>
        )}

        {/* Text Body */}
        {message.text && (
          <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap break-words">
            {message.text}
          </p>
        )}

        {/* Timestamp and Status Ticks */}
        <div className="flex items-center justify-end gap-1 pt-1.5 text-[10px] text-zinc-400 font-mono">
          <span>{message.timestamp}</span>
          {message.isOutgoing && (
            <span>
              {message.status === 'read' ? (
                <span title="Read"><CheckCheck className="w-3.5 h-3.5 text-amber-400" /></span>
              ) : message.status === 'delivered' ? (
                <span title="Delivered"><CheckCheck className="w-3.5 h-3.5 text-zinc-400" /></span>
              ) : (
                <span title="Sent"><Check className="w-3.5 h-3.5 text-zinc-500" /></span>
              )}
            </span>
          )}
        </div>
      </div>

      {/* Emoji Reactions Cluster */}
      {message.reactions && message.reactions.length > 0 && (
        <div className="flex items-center gap-1 -mt-2 z-10 px-2">
          {message.reactions.map((rx) => (
            <button
              key={rx.emoji}
              onClick={() => onReactionClick?.(rx.emoji)}
              className={`px-2 py-0.5 rounded-full text-[11px] font-semibold flex items-center gap-1 border shadow-sm transition-all cursor-pointer ${
                rx.userReacted
                  ? 'bg-amber-400/20 text-amber-300 border-amber-400/40'
                  : 'bg-[#181B24] text-zinc-300 border-white/10 hover:border-white/20'
              }`}
            >
              <span>{rx.emoji}</span>
              <span>{rx.count}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export interface ChatComposerProps {
  onSendMessage: (text: string) => void;
  onAttachClick?: () => void;
  placeholder?: string;
  disabled?: boolean;
}

export const ChatComposer: React.FC<ChatComposerProps> = ({
  onSendMessage,
  onAttachClick,
  placeholder = 'Type a mindful message...',
  disabled = false
}) => {
  const [text, setText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || disabled) return;
    onSendMessage(text.trim());
    setText('');
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2 p-2 rounded-2xl bg-[#12141B] border border-white/15 shadow-xl">
      {onAttachClick && (
        <button
          type="button"
          onClick={onAttachClick}
          className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
          title="Add attachment"
        >
          <Paperclip className="w-4 h-4" />
        </button>
      )}

      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="flex-1 bg-transparent text-sm text-white placeholder-zinc-500 focus:outline-none px-2"
      />

      <button
        type="submit"
        disabled={!text.trim() || disabled}
        className="w-9 h-9 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-md cursor-pointer"
        title="Send Message"
      >
        <Send className="w-4 h-4 ml-0.5" />
      </button>
    </form>
  );
};
