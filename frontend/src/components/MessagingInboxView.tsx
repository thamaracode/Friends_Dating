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
  Volume2,
  Plus,
  Gamepad2,
  Dices,
  Gift,
  Music,
  MapPin,
  Calendar,
  X,
  Pin,
  Bookmark,
  Reply,
  Copy,
  Trash2,
  Edit2,
  Forward,
  Clock,
  MoreVertical,
  Check,
  RotateCcw
} from 'lucide-react';
import { MOCK_PROFILES, CURRENT_USER } from '../mockData';
import { VoiceWaveformPlayer } from './VoiceWaveformPlayer';
import type { UserProfile } from '../types';
import type { 
  ChatMessage, 
  ConversationItem, 
  ChatFolderType, 
  ChatFolder 
} from '../types/messaging';

interface MessagingInboxViewProps {
  onOpenProfileDetail: (profile: UserProfile) => void;
  onOpenGame?: () => void;
  onOpenLuckyDice?: () => void;
  activeProfileOverride?: UserProfile | null;
  onClearActiveProfileOverride?: () => void;
}

export const MessagingInboxView: React.FC<MessagingInboxViewProps> = ({
  onOpenProfileDetail,
  onOpenGame,
  onOpenLuckyDice,
  activeProfileOverride,
  onClearActiveProfileOverride
}) => {
  // Folders state
  const [activeFolder, setActiveFolder] = useState<ChatFolderType>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Initial Conversations List (Telegram-style depth)
  const [conversations, setConversations] = useState<ConversationItem[]>([
    {
      id: 'saved_messages',
      participantId: 'me',
      title: 'Saved Messages',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      isOnline: true,
      lastSeenText: 'Your personal cloud',
      isVerified: true,
      isPinned: true,
      isArchived: false,
      category: 'saved_messages',
      unreadCount: 0,
      lastMessage: {
        text: 'Notes, icebreakers, and bookmarked profiles',
        senderId: 'me',
        timestamp: 'Just now',
        isOutgoing: true,
        status: 'read'
      }
    },
    {
      id: 'conv_alex',
      participantId: 'usr_alex',
      title: 'Alex Rivera',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=200&q=80',
      isOnline: true,
      lastSeenText: 'Active 5m ago',
      isVerified: true,
      isPinned: true,
      isArchived: false,
      category: 'match',
      unreadCount: 1,
      typingUser: 'Alex is typing...',
      lastMessage: {
        text: "I really loved that point you made about slow weekends.",
        senderId: 'usr_alex',
        timestamp: '10:22 AM',
        isOutgoing: false,
        status: 'delivered'
      }
    },
    {
      id: 'conv_tara',
      participantId: 'usr_tara',
      title: 'Tara Perera',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80',
      isOnline: false,
      lastSeenText: 'Active 2h ago',
      isVerified: true,
      isPinned: false,
      isArchived: false,
      category: 'match',
      unreadCount: 0,
      lastMessage: {
        text: 'Are you attending the Saturday coffee tasting meetup?',
        senderId: 'usr_tara',
        timestamp: '9:15 AM',
        isOutgoing: false,
        status: 'read'
      }
    },
    {
      id: 'conv_dinuk',
      participantId: 'usr_dinuk',
      title: 'Dinuk Fernando',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
      isOnline: true,
      lastSeenText: 'Online',
      isVerified: false,
      isPinned: false,
      isArchived: false,
      category: 'friend',
      unreadCount: 0,
      lastMessage: {
        text: 'Hi Kavindu, I noticed we both enjoy indie synth-pop...',
        senderId: 'usr_dinuk',
        timestamp: 'Yesterday',
        isOutgoing: false,
        status: 'read'
      }
    }
  ]);

  const [activeConversationId, setActiveConversationId] = useState<string | null>(
    activeProfileOverride 
      ? (conversations.find(c => c.participantId === activeProfileOverride.id)?.id || 'conv_alex')
      : null
  );

  // Messages per conversation state
  const [messagesMap, setMessagesMap] = useState<Record<string, ChatMessage[]>>({
    'conv_alex': [
      {
        id: 'msg_1',
        clientMessageId: 'cli_1',
        conversationId: 'conv_alex',
        senderId: 'usr_alex',
        senderName: 'Alex Rivera',
        type: 'text',
        text: "Hey Kavindu! Saw you're also deep into indie game architecture. Outer Wilds changed how I view storytelling.",
        timestamp: '10:14 AM',
        createdAt: Date.now() - 3600000,
        isOutgoing: false,
        status: 'read',
        reactions: [{ emoji: '🔥', count: 1, userReacted: true }]
      },
      {
        id: 'msg_2',
        clientMessageId: 'cli_2',
        conversationId: 'conv_alex',
        senderId: 'me',
        senderName: 'Kavindu',
        type: 'text',
        text: "Totally agree! That feeling of discovering orbital mechanics yourself without a tutorial is unmatched.",
        timestamp: '10:20 AM',
        createdAt: Date.now() - 3000000,
        isOutgoing: true,
        status: 'read'
      },
      {
        id: 'msg_3',
        clientMessageId: 'cli_3',
        conversationId: 'conv_alex',
        senderId: 'usr_alex',
        senderName: 'Alex Rivera',
        type: 'voice',
        text: 'Voice note (0:14)',
        voiceDurationSeconds: 14,
        voiceWaveform: [30, 45, 90, 60, 100, 50, 75, 80, 40, 65, 85, 45, 30, 70],
        timestamp: '10:21 AM',
        createdAt: Date.now() - 1800000,
        isOutgoing: false,
        status: 'delivered'
      },
      {
        id: 'msg_4',
        clientMessageId: 'cli_4',
        conversationId: 'conv_alex',
        senderId: 'usr_alex',
        senderName: 'Alex Rivera',
        type: 'text',
        text: "I really loved that point you made about slow weekends.",
        timestamp: '10:22 AM',
        createdAt: Date.now() - 600000,
        isOutgoing: false,
        status: 'delivered',
        isPinned: true
      }
    ],
    'saved_messages': [
      {
        id: 's_1',
        clientMessageId: 'cli_s1',
        conversationId: 'saved_messages',
        senderId: 'me',
        senderName: 'You',
        type: 'text',
        text: "Bookmarked Icebreaker: 'If your life had an end-credits track, what would play?'",
        timestamp: 'Yesterday',
        createdAt: Date.now() - 86400000,
        isOutgoing: true,
        status: 'read'
      }
    ]
  });

  const [inputMessage, setInputMessage] = useState('');
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
  const [editingMessage, setEditingMessage] = useState<ChatMessage | null>(null);
  const [selectedMessageForMenu, setSelectedMessageForMenu] = useState<ChatMessage | null>(null);
  const [isActionDockOpen, setIsActionDockOpen] = useState(false);
  const [isCalling, setIsCalling] = useState<'voice' | 'video' | null>(null);

  // Folder definitions
  const folders: ChatFolder[] = [
    { id: 'all', title: 'All', badgeCount: undefined },
    { id: 'matches', title: 'Matches', badgeCount: 2 },
    { id: 'friends', title: 'Friends', badgeCount: 1 },
    { id: 'unread', title: 'Unread', badgeCount: 1 },
    { id: 'archived', title: 'Archived', badgeCount: undefined }
  ];

  const currentConv = conversations.find(c => c.id === activeConversationId);
  const currentMessages = activeConversationId && messagesMap[activeConversationId] ? messagesMap[activeConversationId] : [];
  const pinnedMessage = currentMessages.find(m => m.isPinned);

  // Filtered conversations based on folder & search
  const filteredConversations = conversations.filter(conv => {
    if (activeFolder === 'matches' && conv.category !== 'match') return false;
    if (activeFolder === 'friends' && conv.category !== 'friend') return false;
    if (activeFolder === 'unread' && conv.unreadCount === 0) return false;
    if (activeFolder === 'archived' && !conv.isArchived) return false;
    if (activeFolder !== 'archived' && conv.isArchived) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return conv.title.toLowerCase().includes(q) || (conv.lastMessage?.text.toLowerCase().includes(q));
    }
    return true;
  });

  const handleSendMessage = (customText?: string, type: ChatMessage['type'] = 'text') => {
    const textToSend = customText || inputMessage;
    if (!textToSend.trim() || !activeConversationId) return;

    if (editingMessage) {
      // Handle Edit
      setMessagesMap(prev => ({
        ...prev,
        [activeConversationId]: prev[activeConversationId].map(m => 
          m.id === editingMessage.id ? { ...m, text: textToSend, isEdited: true } : m
        )
      }));
      setEditingMessage(null);
      setInputMessage('');
      return;
    }

    const newMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      clientMessageId: `cli_${Date.now()}`,
      conversationId: activeConversationId,
      senderId: 'me',
      senderName: CURRENT_USER.name,
      type,
      text: textToSend,
      timestamp: 'Just now',
      createdAt: Date.now(),
      isOutgoing: true,
      status: 'sent',
      replyTo: replyingTo ? {
        messageId: replyingTo.id,
        senderName: replyingTo.senderName,
        textSnippet: replyingTo.text
      } : undefined
    };

    setMessagesMap(prev => ({
      ...prev,
      [activeConversationId]: [...(prev[activeConversationId] || []), newMsg]
    }));

    // Update conversation last message preview
    setConversations(prev => prev.map(c => 
      c.id === activeConversationId ? {
        ...c,
        lastMessage: {
          text: textToSend,
          senderId: 'me',
          timestamp: 'Just now',
          isOutgoing: true,
          status: 'sent'
        }
      } : c
    ));

    setInputMessage('');
    setReplyingTo(null);
    setIsActionDockOpen(false);
  };

  const handleToggleReaction = (msgId: string, emoji: string) => {
    if (!activeConversationId) return;

    setMessagesMap(prev => ({
      ...prev,
      [activeConversationId]: prev[activeConversationId].map(m => {
        if (m.id !== msgId) return m;
        const currentReactions = m.reactions || [];
        const existing = currentReactions.find(r => r.emoji === emoji);

        if (existing) {
          return {
            ...m,
            reactions: currentReactions.map(r => r.emoji === emoji ? { ...r, count: r.count + 1, userReacted: true } : r)
          };
        } else {
          return {
            ...m,
            reactions: [...currentReactions, { emoji, count: 1, userReacted: true }]
          };
        }
      })
    }));

    setSelectedMessageForMenu(null);
  };

  const handleTogglePin = (msg: ChatMessage) => {
    if (!activeConversationId) return;

    setMessagesMap(prev => ({
      ...prev,
      [activeConversationId]: prev[activeConversationId].map(m => 
        m.id === msg.id ? { ...m, isPinned: !m.isPinned } : m
      )
    }));
    setSelectedMessageForMenu(null);
  };

  const handleDeleteMessage = (msgId: string) => {
    if (!activeConversationId) return;

    setMessagesMap(prev => ({
      ...prev,
      [activeConversationId]: prev[activeConversationId].filter(m => m.id !== msgId)
    }));
    setSelectedMessageForMenu(null);
  };

  const handleSaveToSavedMessages = (msg: ChatMessage) => {
    const savedMsg: ChatMessage = {
      id: `s_${Date.now()}`,
      clientMessageId: `cli_s_${Date.now()}`,
      conversationId: 'saved_messages',
      senderId: 'me',
      senderName: 'You',
      type: msg.type,
      text: `Forwarded from ${msg.senderName}: "${msg.text}"`,
      timestamp: 'Just now',
      createdAt: Date.now(),
      isOutgoing: true,
      status: 'read'
    };

    setMessagesMap(prev => ({
      ...prev,
      'saved_messages': [...(prev['saved_messages'] || []), savedMsg]
    }));

    alert("Message saved to Saved Messages folder!");
    setSelectedMessageForMenu(null);
  };

  const handleSwipeActionPin = (convId: string) => {
    setConversations(prev => prev.map(c => 
      c.id === convId ? { ...c, isPinned: !c.isPinned } : c
    ));
  };

  const handleSwipeActionArchive = (convId: string) => {
    setConversations(prev => prev.map(c => 
      c.id === convId ? { ...c, isArchived: !c.isArchived } : c
    ));
  };

  return (
    <div className="w-full max-w-md mx-auto min-h-[calc(100dvh-5.5rem)] flex flex-col pb-20 select-none">
      {/* ======================================================== */}
      {/* VIEW 1: ACTIVE INDIVIDUAL CONVERSATION (TELEGRAM-DEPTH)  */}
      {/* ======================================================== */}
      {activeConversationId && currentConv ? (
        <div className="flex-1 flex flex-col h-[calc(100dvh-5.5rem)] bg-[#100B12] animate-fadeIn">
          {/* Header */}
          <div className="px-4 py-3 glass-panel-elevated flex items-center justify-between border-b border-[#FF78A8]/20 z-30">
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
                onClick={() => {
                  const targetUser = MOCK_PROFILES.find(p => p.id === currentConv.participantId) || MOCK_PROFILES[0];
                  onOpenProfileDetail(targetUser);
                }}
                className="flex items-center gap-2.5 cursor-pointer"
              >
                <div className="relative">
                  <img 
                    src={currentConv.avatar} 
                    alt={currentConv.title} 
                    className="w-10 h-10 rounded-2xl object-cover border border-[#FF78A8]/40"
                  />
                  {currentConv.isOnline && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-[#100B12]" />
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-1">
                    <h3 className="text-xs font-bold text-[#FFF1F3]">{currentConv.title}</h3>
                    {currentConv.isVerified && (
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    )}
                  </div>
                  <span className="text-[10px] text-[#B9A8B3]">{currentConv.lastSeenText}</span>
                </div>
              </div>
            </div>

            {/* Calling & Search Options */}
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

          {/* Pinned Message Banner (Telegram feature) */}
          {pinnedMessage && (
            <div className="px-4 py-2 bg-[#1B121D] border-b border-[#FF78A8]/20 flex items-center justify-between text-xs animate-fadeIn">
              <div className="flex items-center gap-2 truncate">
                <Pin className="w-3.5 h-3.5 text-[#FF4F87] flex-shrink-0" />
                <div className="truncate">
                  <span className="text-[10px] font-bold text-[#FFB4CE] block">Pinned Message:</span>
                  <span className="text-[11px] text-[#FFF1F3] truncate block">{pinnedMessage.text}</span>
                </div>
              </div>
              <button
                onClick={() => handleTogglePin(pinnedMessage)}
                className="text-[10px] text-[#B9A8B3] hover:text-rose-400 ml-2"
                title="Unpin"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar">
            {currentMessages.map((msg) => (
              <div
                key={msg.id}
                onContextMenu={(e) => {
                  e.preventDefault();
                  setSelectedMessageForMenu(msg);
                }}
                className={`flex flex-col ${msg.isOutgoing ? 'items-end' : 'items-start'} group`}
              >
                {/* Replying To preview banner if present */}
                {msg.replyTo && (
                  <div className={`text-[10px] text-[#FFB4CE] mb-1 px-3 py-1 rounded-xl bg-black/40 border-l-2 border-[#FF4F87] max-w-[75%]`}>
                    <span className="font-bold">Replied to {msg.replyTo.senderName}:</span>
                    <p className="truncate italic">{msg.replyTo.textSnippet}</p>
                  </div>
                )}

                {/* Main Bubble */}
                <div
                  onClick={() => setSelectedMessageForMenu(msg)}
                  className={`relative max-w-[80%] p-3.5 rounded-3xl text-xs space-y-1 shadow-md cursor-pointer transition-transform active:scale-[0.98] ${
                    msg.isOutgoing
                      ? 'bg-gradient-to-tr from-[#FF4F87] to-[#FF78A8] text-[#FFF1F3] rounded-br-xs shadow-[0_4px_16px_rgba(255,79,135,0.35)]'
                      : 'glass-panel-elevated text-[#FFF1F3] rounded-bl-xs border border-[#FF78A8]/20'
                  }`}
                >
                  {/* Voice Waveform Player if voice note */}
                  {msg.type === 'voice' ? (
                    <VoiceWaveformPlayer 
                      durationSeconds={msg.voiceDurationSeconds || 14}
                      waveformAmplitudes={msg.voiceWaveform}
                      isOutgoing={msg.isOutgoing}
                    />
                  ) : (
                    <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                  )}

                  {/* Metadata: Time, Status, Edited */}
                  <div className={`flex items-center justify-end gap-1.5 text-[9px] ${msg.isOutgoing ? 'text-white/70' : 'text-[#B9A8B3]'}`}>
                    {msg.isEdited && <span>edited</span>}
                    <span>{msg.timestamp}</span>
                    {msg.isOutgoing && <CheckCheck className="w-3 h-3 text-white" />}
                  </div>
                </div>

                {/* Emoji Reactions below bubble */}
                {msg.reactions && msg.reactions.length > 0 && (
                  <div className="flex items-center gap-1 mt-1 -mb-1 px-1">
                    {msg.reactions.map((r, i) => (
                      <span 
                        key={i}
                        className="px-2 py-0.5 rounded-full bg-[#1B121D] border border-[#FF78A8]/30 text-[10px] font-bold text-[#FFF1F3] flex items-center gap-1 shadow-sm"
                      >
                        <span>{r.emoji}</span>
                        {r.count > 1 && <span className="text-[9px] text-[#FFB4CE]">{r.count}</span>}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Reply / Edit Preview Bar */}
          {replyingTo && (
            <div className="px-4 py-2 bg-[#1B121D] border-t border-[#FF78A8]/20 flex items-center justify-between text-xs animate-fadeIn">
              <div className="flex items-center gap-2 truncate">
                <Reply className="w-4 h-4 text-[#FF4F87]" />
                <div className="truncate">
                  <span className="text-[10px] font-bold text-[#FFB4CE] block">Replying to {replyingTo.senderName}:</span>
                  <span className="text-[11px] text-[#FFF1F3] truncate block">{replyingTo.text}</span>
                </div>
              </div>
              <button onClick={() => setReplyingTo(null)} className="text-[#B9A8B3] hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {editingMessage && (
            <div className="px-4 py-2 bg-[#1B121D] border-t border-[#FF78A8]/20 flex items-center justify-between text-xs animate-fadeIn">
              <div className="flex items-center gap-2 truncate">
                <Edit2 className="w-4 h-4 text-amber-400" />
                <div className="truncate">
                  <span className="text-[10px] font-bold text-amber-300 block">Editing message:</span>
                  <span className="text-[11px] text-[#FFF1F3] truncate block">{editingMessage.text}</span>
                </div>
              </div>
              <button onClick={() => {
                setEditingMessage(null);
                setInputMessage('');
              }} className="text-[#B9A8B3] hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Action Dock (Telegram + Dating System) */}
          {isActionDockOpen && (
            <div className="p-4 bg-[#1B121D] border-t border-[#FF78A8]/20 grid grid-cols-4 gap-3 animate-fadeIn">
              <button
                onClick={() => {
                  if (onOpenGame) onOpenGame();
                }}
                className="flex flex-col items-center gap-1.5 p-2 rounded-2xl glass-panel text-[#FFF1F3] hover:text-[#FF4F87] cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-[#FF4F87]/20 flex items-center justify-center text-[#FF4F87]">
                  <Gamepad2 className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold">Games</span>
              </button>

              <button
                onClick={() => {
                  if (onOpenLuckyDice) onOpenLuckyDice();
                }}
                className="flex flex-col items-center gap-1.5 p-2 rounded-2xl glass-panel text-[#FFF1F3] hover:text-[#FF4F87] cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-amber-400/20 flex items-center justify-center text-amber-300">
                  <Dices className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold">Lucky Dice</span>
              </button>

              <button
                onClick={() => handleSendMessage("Sending you an animated Lucky Rose! 🌹 (+15 Chemistry)", 'gift_event')}
                className="flex flex-col items-center gap-1.5 p-2 rounded-2xl glass-panel text-[#FFF1F3] hover:text-[#FF4F87] cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-rose-500/20 flex items-center justify-center text-rose-400">
                  <Gift className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold">Send Gift</span>
              </button>

              <button
                onClick={() => handleSendMessage("Shared Track: 'Resonance' - Home (Lo-Fi Ambient)", 'text')}
                className="flex flex-col items-center gap-1.5 p-2 rounded-2xl glass-panel text-[#FFF1F3] hover:text-[#FF4F87] cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400">
                  <Music className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold">Share Song</span>
              </button>
            </div>
          )}

          {/* Composer */}
          <div className="p-3 glass-panel-elevated border-t border-[#FF78A8]/20 flex items-center gap-2">
            <button
              onClick={() => setIsActionDockOpen(!isActionDockOpen)}
              className={`w-10 h-10 rounded-2xl flex items-center justify-center cursor-pointer transition-colors ${
                isActionDockOpen 
                  ? 'bg-[#FF4F87] text-white shadow-[0_0_12px_rgba(255,79,135,0.7)]' 
                  : 'glass-panel text-[#B9A8B3] hover:text-white'
              }`}
              title="Interactive Action Dock"
            >
              {isActionDockOpen ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            </button>

            <div className="relative flex-1">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder={editingMessage ? "Update message..." : `Message ${currentConv.title}...`}
                className="w-full pl-4 pr-10 py-3 rounded-2xl glass-panel text-xs text-[#FFF1F3] placeholder-[#7A6975] focus:outline-none focus:border-[#FF4F87]"
              />
              <button 
                onClick={() => handleSendMessage("Voice note (0:14) 🎙️", 'voice')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#B9A8B3] hover:text-[#FF4F87] cursor-pointer"
                title="Send Voice Note with Waveform"
              >
                <Mic className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={() => handleSendMessage()}
              disabled={!inputMessage.trim()}
              className="w-11 h-11 rounded-2xl pink-gradient-btn flex items-center justify-center text-[#FFF1F3] disabled:opacity-40 disabled:pointer-events-none cursor-pointer transition-transform active:scale-95"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

          {/* Telegram Context Menu Modal */}
          {selectedMessageForMenu && (
            <div 
              onClick={() => setSelectedMessageForMenu(null)}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end justify-center p-4 animate-fadeIn"
            >
              <div 
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-sm rounded-3xl glass-panel-elevated p-4 border border-[#FF78A8]/30 space-y-3 pink-ambient-glow"
              >
                {/* Emoji Reaction Bar */}
                <div className="flex items-center justify-around py-2 border-b border-[#FF78A8]/15 text-2xl">
                  {['❤️', '🔥', '✨', '🌹', '😂', '😮'].map(emoji => (
                    <button
                      key={emoji}
                      onClick={() => handleToggleReaction(selectedMessageForMenu.id, emoji)}
                      className="hover:scale-125 transition-transform cursor-pointer"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>

                {/* Actions List */}
                <div className="space-y-1 text-xs">
                  <button
                    onClick={() => {
                      setReplyingTo(selectedMessageForMenu);
                      setSelectedMessageForMenu(null);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[#FFF1F3] hover:bg-white/5 cursor-pointer"
                  >
                    <Reply className="w-4 h-4 text-[#FF4F87]" />
                    <span>Reply</span>
                  </button>

                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(selectedMessageForMenu.text);
                      alert("Copied to clipboard!");
                      setSelectedMessageForMenu(null);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[#FFF1F3] hover:bg-white/5 cursor-pointer"
                  >
                    <Copy className="w-4 h-4 text-[#B9A8B3]" />
                    <span>Copy Text</span>
                  </button>

                  <button
                    onClick={() => handleSaveToSavedMessages(selectedMessageForMenu)}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[#FFF1F3] hover:bg-white/5 cursor-pointer"
                  >
                    <Bookmark className="w-4 h-4 text-amber-400" />
                    <span>Save to Saved Messages</span>
                  </button>

                  <button
                    onClick={() => handleTogglePin(selectedMessageForMenu)}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[#FFF1F3] hover:bg-white/5 cursor-pointer"
                  >
                    <Pin className="w-4 h-4 text-[#FF78A8]" />
                    <span>{selectedMessageForMenu.isPinned ? 'Unpin' : 'Pin to Header'}</span>
                  </button>

                  {selectedMessageForMenu.isOutgoing && (
                    <button
                      onClick={() => {
                        setEditingMessage(selectedMessageForMenu);
                        setInputMessage(selectedMessageForMenu.text);
                        setSelectedMessageForMenu(null);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[#FFF1F3] hover:bg-white/5 cursor-pointer"
                    >
                      <Edit2 className="w-4 h-4 text-amber-300" />
                      <span>Edit Message</span>
                    </button>
                  )}

                  <button
                    onClick={() => handleDeleteMessage(selectedMessageForMenu.id)}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-rose-400 hover:bg-rose-950/20 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete Message</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* ======================================================== */
        /* VIEW 2: TELEGRAM-STYLE CONVERSATION INBOX WITH FOLDERS   */
        /* ======================================================== */
        <div className="space-y-3 px-3 pt-2 animate-fadeIn">
          {/* Header */}
          <div className="flex items-center justify-between px-1">
            <h1 className="text-xl font-black text-[#FFF1F3] tracking-tight">Messages</h1>
            <span className="text-xs text-[#FFB4CE] font-bold">Encrypted Cloud</span>
          </div>

          {/* Folder Tabs (Telegram Benchmark) */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            {folders.map(folder => (
              <button
                key={folder.id}
                onClick={() => setActiveFolder(folder.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap cursor-pointer transition-all flex items-center gap-1.5 ${
                  activeFolder === folder.id 
                    ? 'bg-[#FF4F87] text-white shadow-[0_0_12px_rgba(255,79,135,0.6)]' 
                    : 'glass-panel text-[#B9A8B3] hover:text-white'
                }`}
              >
                <span>{folder.title}</span>
                {folder.badgeCount !== undefined && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[9px] ${activeFolder === folder.id ? 'bg-white text-[#FF4F87]' : 'bg-[#FF4F87] text-white'}`}>
                    {folder.badgeCount}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-[#B9A8B3] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations, saved notes, or matches..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl glass-panel text-xs text-[#FFF1F3] placeholder-[#7A6975] focus:outline-none focus:border-[#FF4F87]"
            />
          </div>

          {/* Conversation List with Swipe Pin & Archive Controls */}
          <div className="space-y-2 pt-1">
            {filteredConversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => setActiveConversationId(conv.id)}
                className="relative p-3.5 rounded-3xl glass-panel-elevated border border-[#FF78A8]/20 flex items-center justify-between gap-3 cursor-pointer hover:border-[#FF4F87]/60 transition-all shadow-md group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative flex-shrink-0">
                    <img 
                      src={conv.avatar} 
                      alt={conv.title} 
                      className={`w-12 h-12 rounded-2xl object-cover border ${
                        conv.id === 'saved_messages' ? 'border-amber-400/50' : 'border-[#FF78A8]/40'
                      }`}
                    />
                    {conv.isOnline && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-[#100B12]" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-xs font-bold text-[#FFF1F3] truncate">{conv.title}</h4>
                      {conv.isVerified && (
                        <ShieldCheck className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                      )}
                      {conv.isPinned && (
                        <Pin className="w-3 h-3 text-[#FF4F87] flex-shrink-0" />
                      )}
                    </div>
                    <p className={`text-[11px] truncate mt-0.5 ${conv.unreadCount > 0 ? 'text-[#FFB4CE] font-bold' : 'text-[#B9A8B3]'}`}>
                      {conv.typingUser ? (
                        <span className="text-[#FF4F87] animate-pulse">{conv.typingUser}</span>
                      ) : (
                        conv.lastMessage?.text
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                  <span className="text-[10px] text-[#7A6975]">{conv.lastMessage?.timestamp}</span>
                  {conv.unreadCount > 0 ? (
                    <span className="w-4 h-4 rounded-full bg-[#FF4F87] text-[#FFF1F3] text-[9px] font-black flex items-center justify-center shadow-[0_0_8px_#FF4F87]">
                      {conv.unreadCount}
                    </span>
                  ) : conv.isPinned ? (
                    <span className="text-[10px] text-[#FF4F87]">Pinned</span>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* WebRTC Call Simulator Modal */}
      {isCalling && (
        <div className="fixed inset-0 z-50 bg-[#100B12]/95 backdrop-blur-xl flex flex-col items-center justify-between p-8 text-center animate-fadeIn">
          <div className="pt-8 space-y-3">
            <img 
              src={currentConv?.avatar || MOCK_PROFILES[0].avatar} 
              alt={currentConv?.title || 'User'} 
              className="w-24 h-24 rounded-full object-cover mx-auto border-4 border-[#FF4F87] shadow-[0_0_25px_rgba(255,79,135,0.7)]"
            />
            <h3 className="text-xl font-black text-[#FFF1F3]">{currentConv?.title}</h3>
            <p className="text-xs text-[#FFB4CE] animate-pulse">
              Encrypted Peer {isCalling === 'video' ? 'Video Call' : 'Voice Call'} (Signaling)...
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
