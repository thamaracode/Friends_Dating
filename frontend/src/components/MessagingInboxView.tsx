import React, { useState } from 'react';
import { 
  Search, 
  Send, 
  Phone, 
  Video, 
  ArrowLeft, 
  Sparkles, 
  Smile, 
  Image, 
  Mic, 
  ShieldCheck, 
  Lock, 
  CheckCheck,
  Flame,
  Volume2
} from 'lucide-react';
import { MOCK_PROFILES, CURRENT_USER } from '../mockData';
import type { UserProfile } from '../types';

interface MessagingInboxViewProps {
  onOpenProfileDetail: (profile: UserProfile) => void;
  activeProfileOverride?: UserProfile | null;
  onClearActiveProfileOverride?: () => void;
}

export const MessagingInboxView: React.FC<MessagingInboxViewProps> = ({
  onOpenProfileDetail,
  activeProfileOverride,
  onClearActiveProfileOverride
}) => {
  const [conversations, setConversations] = useState([
    {
      id: 'conv-1',
      profile: MOCK_PROFILES[0], // Alex
      lastMessage: "I really loved that point you made about slow weekends.",
      timestamp: "10m ago",
      unread: 1,
      isTyping: true,
      isOnline: true
    },
    {
      id: 'conv-2',
      profile: MOCK_PROFILES[1], // Tara
      lastMessage: "Are you attending the Saturday coffee tasting meetup?",
      timestamp: "2h ago",
      unread: 0,
      isTyping: false,
      isOnline: false
    },
    {
      id: 'conv-3',
      profile: MOCK_PROFILES[2], // Dinuk
      lastMessage: "Hi Kavindu, I noticed we both enjoy indie synth-pop...",
      timestamp: "Yesterday",
      unread: 0,
      isTyping: false,
      isOnline: true
    }
  ]);

  const [activeConversationId, setActiveConversationId] = useState<string | null>(
    activeProfileOverride 
      ? (conversations.find(c => c.profile.id === activeProfileOverride.id)?.id || 'conv-new')
      : null
  );

  const [chatMessages, setChatMessages] = useState<Record<string, Array<{ sender: 'me' | 'them'; text: string; time: string }>>>({
    'conv-1': [
      { sender: 'them', text: "Hey Kavindu! Saw you're also deep into indie game architecture. Outer Wilds changed how I view storytelling.", time: "10:14 AM" },
      { sender: 'me', text: "Totally agree! That feeling of discovering orbital mechanics yourself without a tutorial is unmatched.", time: "10:20 AM" },
      { sender: 'them', text: "I really loved that point you made about slow weekends.", time: "10:22 AM" }
    ],
    'conv-2': [
      { sender: 'them', text: "Documentary photography is mostly listening before pressing the shutter.", time: "Yesterday" },
      { sender: 'me', text: "That resonates. People open up when they realize you are not rushing them.", time: "Yesterday" },
      { sender: 'them', text: "Are you attending the Saturday coffee tasting meetup?", time: "2h ago" }
    ]
  });

  const [inputMessage, setInputMessage] = useState('');
  const [isCalling, setIsCalling] = useState<'voice' | 'video' | null>(null);

  const selectedConv = conversations.find(c => c.id === activeConversationId);
  const currentChatUser = activeProfileOverride || selectedConv?.profile || MOCK_PROFILES[0];
  const currentMessages = activeConversationId && chatMessages[activeConversationId] ? chatMessages[activeConversationId] : [];

  const handleSendMessage = () => {
    if (!inputMessage.trim() || !activeConversationId) return;

    const newMsg = {
      sender: 'me' as const,
      text: inputMessage,
      time: 'Just now'
    };

    setChatMessages(prev => ({
      ...prev,
      [activeConversationId]: [...(prev[activeConversationId] || []), newMsg]
    }));
    setInputMessage('');
  };

  return (
    <div className="w-full max-w-md mx-auto min-h-[calc(100dvh-5.5rem)] flex flex-col pb-20">
      {/* VIEW 1: INDIVIDUAL CHAT VIEW (IF CONVERSATION SELECTED) */}
      {activeConversationId ? (
        <div className="flex-1 flex flex-col h-[calc(100dvh-5.5rem)] bg-[#100B12] animate-fadeIn">
          {/* Chat Header */}
          <div className="px-4 py-3 glass-panel-elevated flex items-center justify-between border-b border-[#FF78A8]/20 z-20">
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setActiveConversationId(null);
                  if (onClearActiveProfileOverride) onClearActiveProfileOverride();
                }}
                className="w-8 h-8 rounded-full glass-panel flex items-center justify-center text-[#B9A8B3] hover:text-[#FFF1F3] cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>

              <div 
                onClick={() => onOpenProfileDetail(currentChatUser)}
                className="flex items-center gap-2.5 cursor-pointer"
              >
                <div className="relative">
                  <img 
                    src={currentChatUser.avatar} 
                    alt={currentChatUser.name} 
                    className="w-10 h-10 rounded-2xl object-cover border border-[#FF78A8]/40"
                  />
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-[#100B12]" />
                </div>

                <div>
                  <div className="flex items-center gap-1">
                    <h3 className="text-xs font-bold text-[#FFF1F3]">{currentChatUser.name}</h3>
                    {currentChatUser.verifications?.photoVerified && (
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    )}
                  </div>
                  <span className="text-[10px] text-emerald-400 font-medium">Online now</span>
                </div>
              </div>
            </div>

            {/* Calling Options */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setIsCalling('voice')}
                className="w-8 h-8 rounded-full glass-panel flex items-center justify-center text-[#B9A8B3] hover:text-[#FF4F87] cursor-pointer"
                title="Voice Call"
              >
                <Phone className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsCalling('video')}
                className="w-8 h-8 rounded-full glass-panel flex items-center justify-center text-[#B9A8B3] hover:text-[#FF4F87] cursor-pointer"
                title="Video Call"
              >
                <Video className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Icebreaker Suggestions Banner */}
          <div className="px-4 py-2 bg-[#1B121D]/90 border-b border-[#FF78A8]/10 flex items-center justify-between text-[11px]">
            <span className="text-[#FFB4CE] flex items-center gap-1 truncate">
              <Sparkles className="w-3.5 h-3.5 text-[#FF4F87]" />
              <span>Ask about their obsession with {currentChatUser.interests[0] || 'art'}</span>
            </span>
            <button 
              onClick={() => setInputMessage(`What got you fascinated with ${currentChatUser.interests[0] || 'your favorite hobby'}?`)}
              className="text-[#FF4F87] font-bold text-[10px] uppercase hover:underline ml-2 whitespace-nowrap"
            >
              Use Icebreaker
            </button>
          </div>

          {/* Chat Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar">
            {currentMessages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[78%] p-3.5 rounded-3xl text-xs space-y-1 shadow-md ${
                    msg.sender === 'me'
                      ? 'bg-gradient-to-tr from-[#FF4F87] to-[#FF78A8] text-[#FFF1F3] rounded-br-xs shadow-[0_4px_16px_rgba(255,79,135,0.3)]'
                      : 'glass-panel-elevated text-[#FFF1F3] rounded-bl-xs border border-[#FF78A8]/20'
                  }`}
                >
                  <p className="leading-relaxed">{msg.text}</p>
                  <div className={`flex items-center justify-end gap-1 text-[9px] ${msg.sender === 'me' ? 'text-white/70' : 'text-[#B9A8B3]'}`}>
                    <span>{msg.time}</span>
                    {msg.sender === 'me' && <CheckCheck className="w-3 h-3 text-white" />}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Message Input Composer */}
          <div className="p-3 glass-panel-elevated border-t border-[#FF78A8]/20 flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder={`Message ${currentChatUser.name}...`}
                className="w-full pl-4 pr-10 py-3 rounded-2xl glass-panel text-xs text-[#FFF1F3] placeholder-[#7A6975] focus:outline-none focus:border-[#FF4F87]"
              />
              <button 
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#B9A8B3] hover:text-[#FFF1F3]"
                title="Send Voice Memo"
              >
                <Mic className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim()}
              className="w-11 h-11 rounded-2xl pink-gradient-btn flex items-center justify-center text-[#FFF1F3] disabled:opacity-40 disabled:pointer-events-none cursor-pointer transition-transform active:scale-95"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        /* VIEW 2: CONVERSATION LIST INBOX */
        <div className="space-y-4 px-3 pt-2">
          {/* Header */}
          <div className="flex items-center justify-between px-1">
            <h1 className="text-xl font-black text-[#FFF1F3] tracking-tight">Messages</h1>
            <span className="text-xs text-[#FFB4CE] font-bold">2 Unread</span>
          </div>

          {/* Horizontal Active Matches Carousel */}
          <div className="space-y-2">
            <span className="text-[10px] uppercase font-bold text-[#FFB4CE] tracking-wider px-1">Recent Matches</span>
            <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-1">
              {MOCK_PROFILES.map((p) => (
                <div
                  key={p.id}
                  onClick={() => {
                    setActiveConversationId(`conv-${p.id}`);
                  }}
                  className="flex flex-col items-center gap-1 flex-shrink-0 cursor-pointer group"
                >
                  <div className="relative p-0.5 rounded-full bg-gradient-to-tr from-[#FF4F87] to-[#FF78A8] shadow-[0_0_12px_rgba(255,79,135,0.4)] group-hover:scale-105 transition-transform">
                    <img 
                      src={p.avatar} 
                      alt={p.name} 
                      className="w-14 h-14 rounded-full object-cover border-2 border-[#100B12]"
                    />
                    <div className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-[#100B12]" />
                  </div>
                  <span className="text-[10px] font-semibold text-[#FFF1F3] max-w-[56px] truncate">{p.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-[#B9A8B3] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search conversations..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl glass-panel text-xs text-[#FFF1F3] placeholder-[#7A6975] focus:outline-none focus:border-[#FF4F87]"
            />
          </div>

          {/* Conversation List */}
          <div className="space-y-2 pt-1">
            {conversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => setActiveConversationId(conv.id)}
                className="p-3 rounded-3xl glass-panel-elevated border border-[#FF78A8]/20 flex items-center justify-between gap-3 cursor-pointer hover:border-[#FF4F87]/60 transition-all shadow-md"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative flex-shrink-0">
                    <img 
                      src={conv.profile.avatar} 
                      alt={conv.profile.name} 
                      className="w-12 h-12 rounded-2xl object-cover border border-[#FF78A8]/40"
                    />
                    {conv.isOnline && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-[#100B12]" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-xs font-bold text-[#FFF1F3] truncate">{conv.profile.name}</h4>
                      {conv.profile.verifications?.photoVerified && (
                        <ShieldCheck className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                      )}
                    </div>
                    <p className={`text-[11px] truncate mt-0.5 ${conv.unread > 0 ? 'text-[#FFB4CE] font-bold' : 'text-[#B9A8B3]'}`}>
                      {conv.isTyping ? <span className="text-[#FF4F87] animate-pulse">typing...</span> : conv.lastMessage}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                  <span className="text-[10px] text-[#7A6975]">{conv.timestamp}</span>
                  {conv.unread > 0 && (
                    <span className="w-4 h-4 rounded-full bg-[#FF4F87] text-[#FFF1F3] text-[9px] font-black flex items-center justify-center shadow-[0_0_8px_#FF4F87]">
                      {conv.unread}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Call Simulator Modal */}
      {isCalling && (
        <div className="fixed inset-0 z-50 bg-[#100B12]/95 backdrop-blur-xl flex flex-col items-center justify-between p-8 text-center animate-fadeIn">
          <div className="pt-8 space-y-3">
            <img 
              src={currentChatUser.avatar} 
              alt={currentChatUser.name} 
              className="w-24 h-24 rounded-full object-cover mx-auto border-4 border-[#FF4F87] shadow-[0_0_25px_rgba(255,79,135,0.7)]"
            />
            <h3 className="text-xl font-black text-[#FFF1F3]">{currentChatUser.name}</h3>
            <p className="text-xs text-[#FFB4CE] animate-pulse">
              Calling ({isCalling === 'video' ? 'Encrypted Video' : 'Private Voice'})...
            </p>
          </div>

          <div className="pb-8">
            <button
              onClick={() => setIsCalling(null)}
              className="w-16 h-16 rounded-full bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center shadow-2xl cursor-pointer transition-transform active:scale-95"
            >
              <Phone className="w-7 h-7 rotate-[135deg]" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
