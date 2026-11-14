import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Send, 
  Phone, 
  Video, 
  ArrowLeft, 
  Smile, 
  Image as ImageIcon, 
  Mic, 
  MicOff,
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
  RotateCcw,
  Square,
  Sparkles,
  PhoneOff,
  VideoOff,
  Download,
  Share2,
  Maximize2,
  Minimize2,
  ChevronLeft,
  ChevronRight,
  Archive,
  VolumeX,
  UserX,
  Info,
  Heart,
  Cpu
} from 'lucide-react';
import { MOCK_PROFILES, CURRENT_USER } from '../mockData';
import { VoiceWaveformPlayer } from './VoiceWaveformPlayer';
import { TelegramLuckEmoji } from './TelegramLuckEmoji';
import { chatClient } from '../services/chatApiClient';
import { BeforeYouTalkSheet } from './vault/BeforeYouTalkSheet';
import { RelationshipVaultService } from '../services/relationshipVaultService';
import { TwoPersonQuestionModal } from './emotional/TwoPersonQuestionModal';
import { UnifiedAiAssistantDrawer } from './ai/UnifiedAiAssistantDrawer';
import { UserAiControlCenter } from './control/UserAiControlCenter';
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
  const [activeFolder, setActiveFolder] = useState<ChatFolderType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [currentMessages, setCurrentMessages] = useState<ChatMessage[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isBriefingOpen, setIsBriefingOpen] = useState(false);
  const [isTwoPersonOpen, setIsTwoPersonOpen] = useState(false);
  const [isAiAssistantOpen, setIsAiAssistantOpen] = useState(false);
  const [isAiSettingsOpen, setIsAiSettingsOpen] = useState(false);

  // Desktop vs Mobile responsive state
  const [isDesktopLayout, setIsDesktopLayout] = useState(false);
  const [isEdgeToEdge, setIsEdgeToEdge] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsDesktopLayout(window.innerWidth >= 900);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Voice recording state
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<any>(null);

  // WebRTC Call State
  const [isCalling, setIsCalling] = useState<'voice' | 'video' | null>(null);
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const localStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const callTimerRef = useRef<any>(null);

  // Composer and context states
  const [inputMessage, setInputMessage] = useState('');
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
  const [editingMessage, setEditingMessage] = useState<ChatMessage | null>(null);
  const [selectedMessageForMenu, setSelectedMessageForMenu] = useState<ChatMessage | null>(null);
  const [isActionDockOpen, setIsActionDockOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingPartnerText, setTypingPartnerText] = useState<string | null>(null);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [inChatSearchQuery, setInChatSearchQuery] = useState('');
  const [isChatSettingsOpen, setIsChatSettingsOpen] = useState(false);

  // Fullscreen Media Lightbox Viewer (Telegram Web K reference)
  const [activeMediaViewerUrl, setActiveMediaViewerUrl] = useState<string | null>(null);

  // Emoji / Sticker / GIF picker drawer state
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const [pickerTab, setPickerTab] = useState<'emoji' | 'stickers' | 'luck'>('luck');
  const [installedPacks, setInstalledPacks] = useState<any[]>([]);

  useEffect(() => {
    chatClient.getMyInstalledStickerPacks().then(packs => {
      setInstalledPacks(packs);
    });
  }, []);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const composerInputRef = useRef<HTMLInputElement | null>(null);

  // Folder definitions (Telegram Web K benchmark)
  const folders: ChatFolder[] = [
    { id: 'all', title: 'All', badgeCount: undefined },
    { id: 'matches', title: 'Matches', badgeCount: 2 },
    { id: 'friends', title: 'Friends', badgeCount: 1 },
    { id: 'unread', title: 'Unread', badgeCount: 1 },
    { id: 'archived', title: 'Archived', badgeCount: undefined }
  ];

  // Fetch conversations from Backend on mount & subscribe to Real-Time events
  useEffect(() => {
    const loadConversations = async () => {
      try {
        const convs = await chatClient.getConversations();
        setConversations(convs);
        if (!activeConversationId && convs.length > 0) {
          if (activeProfileOverride) {
            const match = convs.find((c: any) => c.participantId === activeProfileOverride.id);
            setActiveConversationId(match ? match.id : convs[0].id);
          } else if (window.innerWidth >= 1024) {
            // Auto-select first chat on desktop
            setActiveConversationId(convs[0].id);
          }
        }
      } catch (err) {
        console.warn('Fallback to local conversation list', err);
      }
    };

    loadConversations();

    // Subscribe to real-time events
    const unsubMsg = chatClient.subscribe('chat.message.created', (event: any) => {
      if (event.conversationId === activeConversationId) {
        setCurrentMessages((prev) => {
          if (prev.some(m => m.id === event.message.id || m.clientMessageId === event.message.clientMessageId)) {
            return prev;
          }
          return [...prev, event.message];
        });
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
      }
      loadConversations();
    });

    const unsubEdit = chatClient.subscribe('chat.message.edited', (event: any) => {
      if (event.conversationId === activeConversationId) {
        setCurrentMessages((prev) => prev.map(m => m.id === event.messageId ? { ...m, text: event.text, isEdited: true } : m));
      }
    });

    const unsubDelete = chatClient.subscribe('chat.message.deleted', (event: any) => {
      if (event.conversationId === activeConversationId) {
        if (event.forEveryone) {
          setCurrentMessages((prev) => prev.map(m => m.id === event.messageId ? { ...m, text: 'This message was deleted', isDeleted: true } : m));
        } else {
          setCurrentMessages((prev) => prev.filter(m => m.id !== event.messageId));
        }
      }
    });

    const unsubReaction = chatClient.subscribe('chat.reaction.updated', async (event: any) => {
      if (activeConversationId && event.conversationId === activeConversationId) {
        const msgs = await chatClient.getMessages(activeConversationId);
        setCurrentMessages(msgs);
      }
    });

    const unsubTypingStart = chatClient.subscribe('typing.started', (event: any) => {
      if (event.conversationId === activeConversationId) {
        setTypingPartnerText('typing...');
      }
    });

    const unsubTypingStop = chatClient.subscribe('typing.stopped', (event: any) => {
      if (event.conversationId === activeConversationId) {
        setTypingPartnerText(null);
      }
    });

    const unsubPresence = chatClient.subscribe('presence.updated', () => {
      loadConversations();
    });

    return () => {
      unsubMsg();
      unsubEdit();
      unsubDelete();
      unsubReaction();
      unsubTypingStart();
      unsubTypingStop();
      unsubPresence();
    };
  }, [activeConversationId, activeProfileOverride]);

  // Load real messages & draft whenever active conversation changes
  useEffect(() => {
    if (!activeConversationId) return;

    const loadMsgs = async () => {
      setIsLoadingMessages(true);
      try {
        const msgs = await chatClient.getMessages(activeConversationId);
        setCurrentMessages(msgs);
        await chatClient.markConversationAsRead(activeConversationId);
        
        // Load draft
        const draft = await chatClient.getDraft(activeConversationId);
        if (draft) setInputMessage(draft);
      } catch (e) {
        console.error('Failed to load messages from backend', e);
      } finally {
        setIsLoadingMessages(false);
      }
    };

    loadMsgs();
  }, [activeConversationId]);

  // Desktop Keyboard Shortcuts (Telegram Desktop reference: Esc to close/cancel, Up to edit last message)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (selectedMessageForMenu) {
          setSelectedMessageForMenu(null);
        } else if (replyingTo) {
          setReplyingTo(null);
        } else if (editingMessage) {
          setEditingMessage(null);
          setInputMessage('');
        } else if (isEmojiPickerOpen) {
          setIsEmojiPickerOpen(false);
        } else if (isActionDockOpen) {
          setIsActionDockOpen(false);
        } else if (isChatSettingsOpen) {
          setIsChatSettingsOpen(false);
        } else if (activeMediaViewerUrl) {
          setActiveMediaViewerUrl(null);
        }
      } else if (e.key === 'ArrowUp' && !inputMessage && currentMessages.length > 0) {
        // Edit last outgoing message
        const lastOutgoing = [...currentMessages].reverse().find(m => m.isOutgoing);
        if (lastOutgoing) {
          e.preventDefault();
          setEditingMessage(lastOutgoing);
          setInputMessage(lastOutgoing.text);
          composerInputRef.current?.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedMessageForMenu, replyingTo, editingMessage, isEmojiPickerOpen, isActionDockOpen, isChatSettingsOpen, activeMediaViewerUrl, inputMessage, currentMessages]);

  // WebRTC Calling Lifecycle
  const startCall = async (type: 'voice' | 'video') => {
    setIsCalling(type);
    setCallDuration(0);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: type === 'video'
      });
      localStreamRef.current = stream;
      if (localVideoRef.current && type === 'video') {
        localVideoRef.current.srcObject = stream;
      }

      const pc = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
      });
      peerConnectionRef.current = pc;

      stream.getTracks().forEach(track => pc.addTrack(track, stream));

      pc.ontrack = (event) => {
        if (remoteVideoRef.current && event.streams[0]) {
          remoteVideoRef.current.srcObject = event.streams[0];
        }
      };

      pc.onicecandidate = (event) => {
        if (event.candidate && currentConv?.participantId) {
          chatClient.sendSocketEvent('call.signal', {
            recipientId: currentConv.participantId,
            signalData: { candidate: event.candidate },
            callType: type
          });
        }
      };

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      if (currentConv?.participantId) {
        chatClient.sendSocketEvent('call.signal', {
          recipientId: currentConv.participantId,
          signalData: { offer },
          callType: type
        });
      }

      callTimerRef.current = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.warn('Call stream setup notice (simulating connected peer call):', err);
      callTimerRef.current = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
  };

  const endCall = () => {
    if (callTimerRef.current) clearInterval(callTimerRef.current);
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(t => t.stop());
      localStreamRef.current = null;
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    setIsCalling(null);
    setCallDuration(0);
  };

  // Browser Native Audio Recording with Web Audio API Waveforms
  const startVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        stream.getTracks().forEach(track => track.stop());

        try {
          const uploadRes = await chatClient.uploadAttachment(audioBlob, `voice_${Date.now()}.webm`);
          const mediaUrl = uploadRes.file.mediaUrl;
          const sampleWaveform = [12, 28, 45, 78, 95, 60, 42, 88, 70, 35, 60, 85, 40, 20];

          await chatClient.sendMessage({
            conversationId: activeConversationId!,
            type: 'voice',
            mediaUrl,
            voiceDuration: recordingSeconds || 5,
            voiceWaveform: sampleWaveform
          });

          const msgs = await chatClient.getMessages(activeConversationId!);
          setCurrentMessages(msgs);
        } catch (uploadErr) {
          console.error('Failed to upload voice note', uploadErr);
        }
      };

      mediaRecorder.start();
      setIsRecordingVoice(true);
      setRecordingSeconds(0);
      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds(prev => prev + 1);
      }, 1000);
    } catch (micErr) {
      console.warn('Microphone permission fallback:', micErr);
      await handleSendMessage("🎙️ Voice note (0:08)", 'voice');
    }
  };

  const stopVoiceRecording = () => {
    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    setIsRecordingVoice(false);
  };

  const cancelVoiceRecording = () => {
    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.onstop = null;
      mediaRecorderRef.current.stop();
    }
    setIsRecordingVoice(false);
    setRecordingSeconds(0);
  };

  const handleTypingNotice = (text: string) => {
    setInputMessage(text);
    if (!activeConversationId) return;

    if (!isTyping && text.length > 0) {
      setIsTyping(true);
      chatClient.sendSocketEvent('typing.start', { conversationId: activeConversationId });
    } else if (isTyping && text.length === 0) {
      setIsTyping(false);
      chatClient.sendSocketEvent('typing.stop', { conversationId: activeConversationId });
    }

    // Persist draft in background
    chatClient.saveDraft(activeConversationId, text);
  };

  const handleSendMessage = async (customText?: string, type: ChatMessage['type'] = 'text', mediaUrl?: string) => {
    let textToSend = customText || inputMessage;
    if (!textToSend.trim() && !mediaUrl) return;
    if (!activeConversationId) return;

    // Detect Telegram Luck Emojis when sent as standalone text!
    let determinedType: ChatMessage['type'] = type;
    let determinedMedia = mediaUrl;

    const trimmed = textToSend.trim();
    if (trimmed === '🎲') {
      determinedType = 'dice_event';
      const roll = Math.floor(Math.random() * 6) + 1;
      determinedMedia = `dice_${roll}`;
    } else if (trimmed === '🎰') {
      determinedType = 'slot_event';
      const slotIcons = ['7', 'BAR', '🍇', '🍒', '🍋'];
      const jackpot = Math.random() < 0.25;
      const reels = jackpot ? ['7', '7', '7'] : [
        slotIcons[Math.floor(Math.random() * slotIcons.length)],
        slotIcons[Math.floor(Math.random() * slotIcons.length)],
        slotIcons[Math.floor(Math.random() * slotIcons.length)]
      ];
      determinedMedia = `slot_${reels.join('_')}`;
    } else if (trimmed === '🪙') {
      determinedType = 'coin_event';
      const flip = Math.random() < 0.5 ? 'heads' : 'tails';
      determinedMedia = `coin_${flip}`;
    }

    if (editingMessage) {
      try {
        await chatClient.editMessage(editingMessage.id, textToSend);
        const updated = await chatClient.getMessages(activeConversationId);
        setCurrentMessages(updated);
      } catch (e) {
        console.error(e);
      }
      setEditingMessage(null);
      setInputMessage('');
      return;
    }

    try {
      await chatClient.sendMessage({
        conversationId: activeConversationId,
        text: textToSend,
        type: determinedType,
        mediaUrl: determinedMedia,
        replyToMessageId: replyingTo ? replyingTo.id : undefined
      });

      const updated = await chatClient.getMessages(activeConversationId);
      setCurrentMessages(updated);
      chatClient.saveDraft(activeConversationId, '');
      
      const convs = await chatClient.getConversations();
      setConversations(convs);
    } catch (e) {
      console.error('Failed to submit message to real backend', e);
    }

    setInputMessage('');
    setReplyingTo(null);
    setEditingMessage(null);
    setIsActionDockOpen(false);
    setIsEmojiPickerOpen(false);
    if (isTyping) {
      setIsTyping(false);
      chatClient.sendSocketEvent('typing.stop', { conversationId: activeConversationId });
    }
  };

  const handleToggleReaction = async (msgId: string, emoji: string) => {
    if (!activeConversationId) return;
    try {
      await chatClient.toggleReaction(msgId, emoji);
      const updated = await chatClient.getMessages(activeConversationId);
      setCurrentMessages(updated);
    } catch (e) {
      console.error(e);
    }
    setSelectedMessageForMenu(null);
  };

  const handleTogglePin = async (msg: ChatMessage) => {
    if (!activeConversationId) return;
    try {
      await chatClient.togglePin(msg.id);
      const updated = await chatClient.getMessages(activeConversationId);
      setCurrentMessages(updated);
    } catch (e) {
      console.error(e);
    }
    setSelectedMessageForMenu(null);
  };

  const handleDeleteMessage = async (msgId: string, forEveryone: boolean = false) => {
    if (!activeConversationId) return;
    try {
      await chatClient.deleteMessage(msgId, forEveryone);
      const updated = await chatClient.getMessages(activeConversationId);
      setCurrentMessages(updated);
    } catch (e) {
      console.error(e);
    }
    setSelectedMessageForMenu(null);
  };

  const handleSaveToSavedMessages = async (msg: ChatMessage) => {
    try {
      await chatClient.sendMessage({
        conversationId: 'conv_saved',
        text: `Forwarded from ${msg.senderName}: "${msg.text}"`,
        type: msg.type
      });
      alert("Saved to personal cloud storage!");
    } catch (e) {
      console.error(e);
    }
    setSelectedMessageForMenu(null);
  };

  const handleReportUser = async (reason: string) => {
    if (!currentConv?.participantId) return;
    try {
      await chatClient.submitReport({
        reportedUserId: currentConv.participantId,
        messageId: selectedMessageForMenu ? selectedMessageForMenu.id : undefined,
        reason,
        details: 'User report filed via in-chat action menu'
      });
      alert('Report submitted to Trust & Safety moderation queue.');
    } catch (e) {
      console.error(e);
    }
    setSelectedMessageForMenu(null);
  };

  const handleBlockUser = async () => {
    if (!currentConv?.participantId) return;
    try {
      await chatClient.blockUser(currentConv.participantId);
      alert(`${currentConv.title} has been blocked.`);
      setActiveConversationId(null);
    } catch (e) {
      console.error(e);
    }
    setSelectedMessageForMenu(null);
  };

  const currentConv = conversations.find(c => c.id === activeConversationId);
  const pinnedMessage = currentMessages.find(m => m.isPinned);

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

  // Message Bubble Grouping (Telegram Web K pattern: group consecutive messages within 5 mins)
  const isGroupedWithPrevious = (idx: number): boolean => {
    if (idx === 0) return false;
    const prev = currentMessages[idx - 1];
    const curr = currentMessages[idx];
    if (prev.senderId !== curr.senderId) return false;
    return Math.abs(curr.createdAt - prev.createdAt) < 300000;
  };

  const isGroupedWithNext = (idx: number): boolean => {
    if (idx === currentMessages.length - 1) return false;
    const next = currentMessages[idx + 1];
    const curr = currentMessages[idx];
    if (next.senderId !== curr.senderId) return false;
    return Math.abs(next.createdAt - curr.createdAt) < 300000;
  };

  // =========================================================================
  // SUB-RENDERER: CONVERSATION LIST (SIDEBAR ON DESKTOP, MAIN VIEW ON MOBILE)
  // =========================================================================
  const renderConversationList = () => (
    <div className="flex-1 flex flex-col h-full overflow-hidden select-none">
      {/* Header */}
      <div className="p-3 pb-2 flex items-center justify-between border-b border-[rgba(255,255,255,0.20)]/20">
        <div>
          <h1 className="text-xl font-black text-[#F3F4F6] tracking-tight">Messages</h1>
          <span className="text-[10px] text-[#E5E7EB] font-bold">Encrypted Cloud • TDLib Order</span>
        </div>
        <div className="flex items-center gap-1">
          <button 
            onClick={() => setActiveConversationId('conv_saved')}
            className="w-8 h-8 rounded-full glass-panel flex items-center justify-center text-amber-400 hover:scale-105 cursor-pointer"
            title="Saved Messages Cloud"
          >
            <Bookmark className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Folder Tabs (Telegram Web K Benchmark) */}
      <div className="flex items-center gap-1.5 px-3 py-2 overflow-x-auto no-scrollbar border-b border-[#FF1A75]/15">
        {folders.map(folder => (
          <button
            key={folder.id}
            onClick={() => setActiveFolder(folder.id)}
            className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap cursor-pointer transition-all flex items-center gap-1.5 ${
              activeFolder === folder.id 
                ? 'bg-gradient-to-r from-[#FFFFFF] to-[#E0005C] text-white shadow-[0_0_12px_rgba(255,13,105,0.6)]' 
                : 'glass-panel text-[#C49DB2] hover:text-white'
            }`}
          >
            <span>{folder.title}</span>
            {folder.badgeCount !== undefined && (
              <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-black ${activeFolder === folder.id ? 'bg-white text-[#FFFFFF]' : 'bg-[#FFFFFF] text-white'}`}>
                {folder.badgeCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Search Input */}
      <div className="p-3 pb-2">
        <div className="relative">
          <Search className="w-4 h-4 text-[#C49DB2] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search conversations, matches, or cloud..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl glass-panel text-xs text-[#F3F4F6] placeholder-[#82586E] focus:outline-none focus:border-[#FFFFFF]"
          />
        </div>
      </div>

      {/* Conversation Rows */}
      <div className="flex-1 overflow-y-auto px-3 space-y-1.5 pb-20 no-scrollbar">
        {filteredConversations.map((conv) => {
          const isSelected = activeConversationId === conv.id;
          return (
            <div
              key={conv.id}
              onClick={() => setActiveConversationId(conv.id)}
              className={`relative p-3 rounded-2xl border flex items-center justify-between gap-3 cursor-pointer transition-all shadow-sm group ${
                isSelected 
                  ? 'bg-gradient-to-r from-[#FFFFFF]/25 via-[#D60058]/15 to-transparent border-[#FFFFFF] shadow-[0_0_20px_rgba(255,13,105,0.25)]' 
                  : 'glass-panel-elevated border-[#FF1A75]/15 hover:border-[#FFFFFF]/50'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative flex-shrink-0">
                  <img 
                    src={conv.avatar} 
                    alt={conv.title} 
                    className={`w-11 h-11 rounded-2xl object-cover border ${
                      conv.id === 'conv_saved' ? 'border-amber-400/60' : 'border-[#FF1A75]/40'
                    }`}
                  />
                  {conv.isOnline && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-[#090A0E]" />
                  )}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-xs font-bold text-[#F3F4F6] truncate">{conv.title}</h4>
                    {conv.isVerified && (
                      <ShieldCheck className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                    )}
                    {conv.isPinned && (
                      <Pin className="w-3 h-3 text-[#FFFFFF] flex-shrink-0" />
                    )}
                  </div>
                  <p className={`text-[11px] truncate mt-0.5 ${conv.unreadCount > 0 ? 'text-[#FFB8D2] font-bold' : 'text-[#C49DB2]'}`}>
                    {conv.draftText ? (
                      <span className="text-amber-400 italic font-semibold">Draft: {conv.draftText}</span>
                    ) : (
                      conv.lastMessage?.text || 'Tap to start conversation'
                    )}
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                <span className="text-[10px] text-[#82586E]">{conv.lastMessage?.timestamp}</span>
                {conv.unreadCount > 0 ? (
                  <span className="w-4 h-4 rounded-full bg-[#FFFFFF] text-[#F3F4F6] text-[9px] font-black flex items-center justify-center shadow-[0_0_8px_#FFFFFF]">
                    {conv.unreadCount}
                  </span>
                ) : conv.isPinned ? (
                  <span className="text-[10px] text-[#FFFFFF]">Pinned</span>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  // =========================================================================
  // SUB-RENDERER: ACTIVE CONVERSATION SCREEN
  // =========================================================================
  const renderActiveConversation = () => {
    if (!currentConv) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-[#6B7280]">
          <div className="w-16 h-16 rounded-full glass-panel flex items-center justify-center mb-3 text-[#FFFFFF]">
            <Sparkles className="w-8 h-8" />
          </div>
          <h3 className="text-sm font-bold text-[#F3F4F6]">Select a conversation</h3>
          <p className="text-xs text-[#9CA3AF] mt-1">Choose from your matches, friends, or personal cloud.</p>
        </div>
      );
    }

    return (
      <div className="flex-1 flex flex-col h-full bg-[#090A0E] animate-fadeIn relative overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3 glass-panel-elevated flex items-center justify-between border-b border-[rgba(255,255,255,0.20)]/20 z-30">
          <div className="flex items-center gap-3">
            {/* Show back arrow on mobile */}
            {!isDesktopLayout && (
              <button
                onClick={() => {
                  setActiveConversationId(null);
                  if (onClearActiveProfileOverride) onClearActiveProfileOverride();
                }}
                className="w-8 h-8 rounded-full glass-panel flex items-center justify-center text-[#9CA3AF] hover:text-[#F3F4F6] cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}

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
                  className="w-10 h-10 rounded-2xl object-cover border border-[rgba(255,255,255,0.20)]/40"
                />
                {currentConv.isOnline && (
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-[#090A0E]" />
                )}
              </div>

              <div>
                <div className="flex items-center gap-1">
                  <h3 className="text-xs font-bold text-[#F3F4F6]">{currentConv.title}</h3>
                  {currentConv.isVerified && (
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  )}
                </div>
                <span className="text-[10px] text-[#9CA3AF]">
                  {typingPartnerText ? (
                    <span className="text-[#FFFFFF] font-semibold animate-pulse">{typingPartnerText}</span>
                  ) : (
                    currentConv.lastSeenText
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Calling, Search & Settings Options */}
          <div className="flex items-center gap-1.5">
            {/* Before You Talk / Relationship Memory Briefing Pill */}
            <button
              onClick={() => setIsBriefingOpen(true)}
              className="px-2.5 py-1 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-all shadow-sm"
              title="Before You Talk Instant Briefing"
            >
              <Sparkles className="w-3 h-3 text-rose-300" />
              <span className="hidden sm:inline">Before You Talk</span>
            </button>
            {/* One Question, Two People Mutual Game Pill */}
            <button
              onClick={() => setIsTwoPersonOpen(true)}
              className="px-2.5 py-1 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/20 text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-all shadow-sm"
              title="One Question, Two People Mutual Game"
            >
              <Heart className="w-3 h-3 text-purple-300" />
              <span className="hidden sm:inline">2-Person Q</span>
            </button>
            {/* Unified AI Assistant Pill */}
            <button
              onClick={() => setIsAiAssistantOpen(true)}
              className="px-2.5 py-1 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/20 text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-all shadow-sm"
              title="Soulverse AI Assistant & Intelligence"
            >
              <Cpu className="w-3 h-3 text-indigo-400" />
              <span className="hidden sm:inline">AI Helper</span>
            </button>
            {/* Fullscreen / Edge-to-Edge Web Toggle */}
            <button
              onClick={() => setIsEdgeToEdge(!isEdgeToEdge)}
              className="w-8 h-8 rounded-full glass-panel flex items-center justify-center text-[#C49DB2] hover:text-[#FFFFFF] cursor-pointer"
              title={isEdgeToEdge ? "Exit Fullscreen Web View" : "Fullscreen Telegram Web View"}
            >
              {isEdgeToEdge ? <Minimize2 className="w-4 h-4 text-[#FFFFFF]" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setIsSearchActive(!isSearchActive)}
              className="w-8 h-8 rounded-full glass-panel flex items-center justify-center text-[#C49DB2] hover:text-[#FFFFFF] cursor-pointer"
              title="Search Messages (Ctrl+F)"
            >
              <Search className="w-4 h-4" />
            </button>
            <button
              onClick={() => startCall('voice')}
              className="w-8 h-8 rounded-full glass-panel flex items-center justify-center text-[#C49DB2] hover:text-[#FFFFFF] cursor-pointer"
              title="Encrypted Voice Call"
            >
              <Phone className="w-4 h-4" />
            </button>
            <button
              onClick={() => startCall('video')}
              className="w-8 h-8 rounded-full glass-panel flex items-center justify-center text-[#C49DB2] hover:text-[#FFFFFF] cursor-pointer"
              title="Encrypted Video Call"
            >
              <Video className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsChatSettingsOpen(!isChatSettingsOpen)}
              className="w-8 h-8 rounded-full glass-panel flex items-center justify-center text-[#C49DB2] hover:text-[#FFFFFF] cursor-pointer"
              title="Chat Options & Privacy"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Chat Settings & Privacy Drawer */}
        {isChatSettingsOpen && (
          <div className="absolute right-4 top-14 w-60 rounded-3xl glass-panel-elevated p-3 border border-[rgba(255,255,255,0.20)]/30 z-40 shadow-2xl space-y-1 animate-fadeIn text-xs">
            <button
              onClick={() => {
                alert("Notifications muted for 8 hours.");
                setIsChatSettingsOpen(false);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[#F3F4F6] hover:bg-white/5 cursor-pointer"
            >
              <VolumeX className="w-4 h-4 text-[#9CA3AF]" />
              <span>Mute Notifications</span>
            </button>

            <button
              onClick={() => {
                alert("Conversation archived.");
                setIsChatSettingsOpen(false);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[#F3F4F6] hover:bg-white/5 cursor-pointer"
            >
              <Archive className="w-4 h-4 text-[#9CA3AF]" />
              <span>Archive Conversation</span>
            </button>

            <button
              onClick={() => {
                alert("Auto-delete set to 24 hours.");
                setIsChatSettingsOpen(false);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[#F3F4F6] hover:bg-white/5 cursor-pointer"
            >
              <Clock className="w-4 h-4 text-[rgba(255,255,255,0.20)]" />
              <span>Auto-Delete (24h)</span>
            </button>

            <button
              onClick={() => {
                handleBlockUser();
                setIsChatSettingsOpen(false);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-rose-400 hover:bg-rose-950/20 cursor-pointer"
            >
              <UserX className="w-4 h-4" />
              <span>Block User</span>
            </button>
          </div>
        )}

        {/* In-Chat Search Bar */}
        {isSearchActive && (
          <div className="px-4 py-2 bg-[#12141B] border-b border-[rgba(255,255,255,0.20)]/20 flex items-center gap-2 animate-fadeIn">
            <Search className="w-4 h-4 text-[#FFFFFF]" />
            <input
              type="text"
              value={inChatSearchQuery}
              onChange={(e) => setInChatSearchQuery(e.target.value)}
              placeholder="Search words in this chat..."
              className="flex-1 bg-transparent text-xs text-[#F3F4F6] placeholder-[#6B7280] focus:outline-none"
            />
            <button onClick={() => { setIsSearchActive(false); setInChatSearchQuery(''); }} className="text-[#9CA3AF] hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Pinned Message Banner */}
        {pinnedMessage && (
          <div className="px-4 py-2 bg-[#12141B] border-b border-[rgba(255,255,255,0.20)]/20 flex items-center justify-between text-xs animate-fadeIn">
            <div className="flex items-center gap-2 truncate">
              <Pin className="w-3.5 h-3.5 text-[#FFFFFF] flex-shrink-0" />
              <div className="truncate">
                <span className="text-[10px] font-bold text-[#E5E7EB] block">Pinned Message:</span>
                <span className="text-[11px] text-[#F3F4F6] truncate block">{pinnedMessage.text}</span>
              </div>
            </div>
            <button
              onClick={() => handleTogglePin(pinnedMessage)}
              className="text-[10px] text-[#9CA3AF] hover:text-rose-400 ml-2"
              title="Unpin"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Messages Stream with Grouping & Date Separators */}
        <div className="flex-1 overflow-y-auto p-4 space-y-1.5 no-scrollbar telegram-chat-wallpaper">
          <div className="max-w-3xl xl:max-w-4xl mx-auto w-full flex flex-col space-y-1.5 min-h-full justify-end">
            {/* Floating Date Separator */}
            <div className="flex justify-center my-2">
              <span className="px-3 py-0.5 rounded-full bg-black/60 border border-[#FF1A75]/25 text-[10px] font-bold text-[#FFB8D2] shadow-sm backdrop-blur-md">
                Today
              </span>
            </div>

            {currentMessages
              .filter(m => !inChatSearchQuery.trim() || m.text.toLowerCase().includes(inChatSearchQuery.toLowerCase()))
              .map((msg, idx) => {
                const groupedPrev = isGroupedWithPrevious(idx);
                const groupedNext = isGroupedWithNext(idx);

                // Tail corner rounding rules (Telegram Web K reference)
                let cornerClass = 'rounded-3xl';
                if (msg.isOutgoing) {
                  if (groupedPrev && groupedNext) cornerClass = 'rounded-l-3xl rounded-r-lg';
                  else if (groupedPrev) cornerClass = 'rounded-l-3xl rounded-tl-lg rounded-br-xs';
                  else if (groupedNext) cornerClass = 'rounded-3xl rounded-br-lg';
                  else cornerClass = 'rounded-3xl rounded-br-xs';
                } else {
                  if (groupedPrev && groupedNext) cornerClass = 'rounded-r-3xl rounded-l-lg';
                  else if (groupedPrev) cornerClass = 'rounded-r-3xl rounded-tr-lg rounded-bl-xs';
                  else if (groupedNext) cornerClass = 'rounded-3xl rounded-bl-lg';
                  else cornerClass = 'rounded-3xl rounded-bl-xs';
                }

                return (
                  <div
                    key={msg.id}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      setSelectedMessageForMenu(msg);
                    }}
                    className={`flex flex-col ${msg.isOutgoing ? 'items-end' : 'items-start'} group ${groupedPrev ? 'mt-0.5' : 'mt-2'}`}
                  >
                    {/* Replying To preview banner */}
                    {msg.replyTo && (
                      <div className="text-[10px] text-[#FFB8D2] mb-1 px-3 py-1 rounded-xl bg-black/50 border-l-2 border-[#FFFFFF] max-w-[75%] backdrop-blur-md">
                        <span className="font-bold">Replied to {msg.replyTo.senderName}:</span>
                        <p className="truncate italic">{msg.replyTo.textSnippet}</p>
                      </div>
                    )}

                    {/* TELEGRAM LUCK EMOJIS: Large borderless element with floating time pill */}
                    {msg.type === 'dice_event' || msg.type === 'slot_event' || msg.type === 'coin_event' ? (
                      <div 
                        onClick={() => setSelectedMessageForMenu(msg)}
                        className="relative p-1 my-1 flex flex-col items-center cursor-pointer group/luck"
                      >
                        <TelegramLuckEmoji 
                          type={msg.type === 'dice_event' ? 'dice' : msg.type === 'slot_event' ? 'slot' : 'coin'} 
                          seedValue={msg.mediaUrl}
                        />
                        {/* Floating Translucent Pill (Telegram Authenticity) */}
                        <div className="absolute bottom-0 right-0 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 flex items-center gap-1 text-[9px] text-white/90 shadow-md">
                          <span>{msg.timestamp}</span>
                          {msg.isOutgoing && <CheckCheck className="w-3 h-3 text-[#FFFFFF]" />}
                        </div>
                      </div>
                    ) : msg.type === 'sticker' ? (
                      /* STICKER: Borderless enlarged sticker with floating time pill */
                      <div 
                        onClick={() => setSelectedMessageForMenu(msg)}
                        className="relative p-1 my-1 cursor-pointer group/sticker"
                      >
                        <img 
                          src={msg.mediaUrl} 
                          alt="Sticker" 
                          className="w-32 h-32 object-contain hover:scale-105 transition-transform drop-shadow-[0_8px_16px_rgba(0,0,0,0.5)]" 
                        />
                        <div className="absolute bottom-1 right-1 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 flex items-center gap-1 text-[9px] text-white/90 shadow-md">
                          <span>{msg.timestamp}</span>
                          {msg.isOutgoing && <CheckCheck className="w-3 h-3 text-[#FFFFFF]" />}
                        </div>
                      </div>
                    ) : (
                      /* Standard Message Bubble */
                      <div
                        onClick={() => setSelectedMessageForMenu(msg)}
                        className={`relative max-w-[80%] p-3 text-xs space-y-1 shadow-md cursor-pointer transition-transform active:scale-[0.98] ${cornerClass} ${
                          msg.isOutgoing
                            ? 'bg-gradient-to-r from-[#FFFFFF] via-[#E0005C] to-[#B30044] text-[#F3F4F6] shadow-[0_4px_18px_rgba(255,13,105,0.35)]'
                            : 'bg-[#24061A]/85 border border-[#FF1A75]/25 backdrop-blur-xl text-[#F3F4F6]'
                        }`}
                      >
                      {/* Media Image Attachment with Lightbox Viewer */}
                      {msg.mediaUrl && msg.type !== 'voice' && (
                        <div 
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMediaViewerUrl(msg.mediaUrl!);
                          }}
                          className="rounded-2xl overflow-hidden mb-1 border border-white/20 group/media relative"
                        >
                          <img 
                            src={msg.mediaUrl} 
                            alt="Attachment" 
                            className="w-full max-h-60 object-cover hover:scale-105 transition-transform" 
                          />
                          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/media:opacity-100 flex items-center justify-center transition-opacity">
                            <Maximize2 className="w-5 h-5 text-white drop-shadow-md" />
                          </div>
                        </div>
                      )}

                      {/* Voice Waveform Player */}
                      {msg.type === 'voice' ? (
                        <VoiceWaveformPlayer 
                          durationSeconds={msg.voiceDurationSeconds || 8}
                          waveformAmplitudes={msg.voiceWaveform}
                          isOutgoing={msg.isOutgoing}
                        />
                      ) : (
                        <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                      )}

                      {/* Metadata: Time, Status, Edited */}
                      <div className={`flex items-center justify-end gap-1.5 text-[9px] ${msg.isOutgoing ? 'text-white/70' : 'text-[#9CA3AF]'}`}>
                        {msg.isEdited && <span>edited</span>}
                        <span>{msg.timestamp}</span>
                        {msg.isOutgoing && <CheckCheck className="w-3 h-3 text-white" />}
                      </div>
                    </div>
                  )}

                  {/* Emoji Reactions ribbon */}
                  {msg.reactions && msg.reactions.length > 0 && (
                    <div className="flex items-center gap-1 mt-1 -mb-1 px-1">
                      {msg.reactions.map((r, i) => (
                        <span 
                          key={i}
                          className="px-2 py-0.5 rounded-full bg-[#12141B] border border-[rgba(255,255,255,0.20)]/30 text-[10px] font-bold text-[#F3F4F6] flex items-center gap-1 shadow-sm"
                        >
                          <span>{r.emoji}</span>
                          {r.count > 1 && <span className="text-[9px] text-[#E5E7EB]">{r.count}</span>}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Reply / Edit Preview Bar */}
        {replyingTo && (
          <div className="px-4 py-2 bg-[#12141B] border-t border-[rgba(255,255,255,0.20)]/20 flex items-center justify-between text-xs animate-fadeIn">
            <div className="flex items-center gap-2 truncate">
              <Reply className="w-4 h-4 text-[#FFFFFF]" />
              <div className="truncate">
                <span className="text-[10px] font-bold text-[#E5E7EB] block">Replying to {replyingTo.senderName}:</span>
                <span className="text-[11px] text-[#F3F4F6] truncate block">{replyingTo.text}</span>
              </div>
            </div>
            <button onClick={() => setReplyingTo(null)} className="text-[#9CA3AF] hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {editingMessage && (
          <div className="px-4 py-2 bg-[#12141B] border-t border-[rgba(255,255,255,0.20)]/20 flex items-center justify-between text-xs animate-fadeIn">
            <div className="flex items-center gap-2 truncate">
              <Edit2 className="w-4 h-4 text-amber-400" />
              <div className="truncate">
                <span className="text-[10px] font-bold text-amber-300 block">Editing message:</span>
                <span className="text-[11px] text-[#F3F4F6] truncate block">{editingMessage.text}</span>
              </div>
            </div>
            <button onClick={() => {
              setEditingMessage(null);
              setInputMessage('');
            }} className="text-[#9CA3AF] hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Emoji / Sticker / Luck Drawer (Telegram Benchmark) */}
        {isEmojiPickerOpen && (
          <div className="h-56 bg-[#12141B] border-t border-[rgba(255,255,255,0.20)]/20 flex flex-col animate-fadeIn select-none">
            {/* Header Tabs */}
            <div className="flex items-center justify-around border-b border-[rgba(255,255,255,0.20)]/10 py-1.5 text-xs font-bold">
              <button 
                onClick={() => setPickerTab('luck')} 
                className={`px-3 py-1 rounded-full cursor-pointer flex items-center gap-1.5 transition-all ${pickerTab === 'luck' ? 'bg-[#FFFFFF] text-white shadow-md' : 'text-[#9CA3AF] hover:text-white'}`}
              >
                <span>🎰 Telegram Luck</span>
              </button>
              <button 
                onClick={() => setPickerTab('emoji')} 
                className={`px-3 py-1 rounded-full cursor-pointer flex items-center gap-1.5 transition-all ${pickerTab === 'emoji' ? 'bg-[#FFFFFF] text-white shadow-md' : 'text-[#9CA3AF] hover:text-white'}`}
              >
                <span>😀 Emojis</span>
              </button>
              <button 
                onClick={() => setPickerTab('stickers')} 
                className={`px-3 py-1 rounded-full cursor-pointer flex items-center gap-1.5 transition-all ${pickerTab === 'stickers' ? 'bg-[#FFFFFF] text-white shadow-md' : 'text-[#9CA3AF] hover:text-white'}`}
              >
                <span>🌟 Stickers</span>
              </button>
            </div>

            {/* TAB 1: TELEGRAM LUCK EMOJIS (🎰, 🎲, 🪙) */}
            {pickerTab === 'luck' && (
              <div className="flex-1 p-3 flex items-center justify-around overflow-x-auto no-scrollbar">
                {/* 1. Slot Machine */}
                <button
                  onClick={() => handleSendMessage('🎰')}
                  className="p-2.5 rounded-2xl glass-panel-elevated border border-[rgba(255,255,255,0.20)]/30 hover:border-[#FFFFFF] flex flex-col items-center gap-1 text-center cursor-pointer hover:scale-105 transition-all shadow-md group"
                >
                  <div className="text-3xl filter drop-shadow">🎰</div>
                  <span className="text-[10px] font-bold text-[#F3F4F6] group-hover:text-[#E5E7EB]">Slot Machine</span>
                  <span className="text-[8px] text-[#6B7280]">Jackpot 777</span>
                </button>

                {/* 2. 3D Dice */}
                <button
                  onClick={() => handleSendMessage('🎲')}
                  className="p-2.5 rounded-2xl glass-panel-elevated border border-[rgba(255,255,255,0.20)]/30 hover:border-[#FFFFFF] flex flex-col items-center gap-1 text-center cursor-pointer hover:scale-105 transition-all shadow-md group"
                >
                  <div className="text-3xl filter drop-shadow">🎲</div>
                  <span className="text-[10px] font-bold text-[#F3F4F6] group-hover:text-[#E5E7EB]">Rolling Dice</span>
                  <span className="text-[8px] text-[#6B7280]">1 to 6 roll</span>
                </button>

                {/* 3. Flipping Coin */}
                <button
                  onClick={() => handleSendMessage('🪙')}
                  className="p-2.5 rounded-2xl glass-panel-elevated border border-[rgba(255,255,255,0.20)]/30 hover:border-[#FFFFFF] flex flex-col items-center gap-1 text-center cursor-pointer hover:scale-105 transition-all shadow-md group"
                >
                  <div className="text-3xl filter drop-shadow">🪙</div>
                  <span className="text-[10px] font-bold text-[#F3F4F6] group-hover:text-[#E5E7EB]">Coin Toss</span>
                  <span className="text-[8px] text-[#6B7280]">Heads or Tails</span>
                </button>
              </div>
            )}

            {/* TAB 2: UNICODE EMOJIS */}
            {pickerTab === 'emoji' && (
              <div className="flex-1 overflow-y-auto p-3 grid grid-cols-8 gap-2 text-2xl no-scrollbar">
                {['❤️', '🔥', '✨', '🌹', '😂', '😍', '😘', '🥺', '🎉', '🌟', '🧁', '🥂', '💌', '🌸', '💖', '🥰', '🌙', '💫', '🎶', '🎀', '💎', '🍓', '🍰', '🕊️'].map(e => (
                  <button 
                    key={e} 
                    onClick={() => handleSendMessage(e, 'text')} 
                    className="hover:scale-125 transition-transform cursor-pointer"
                  >
                    {e}
                  </button>
                ))}
              </div>
            )}

            {/* TAB 3: STICKERS FROM INSTALLED PACKS */}
            {pickerTab === 'stickers' && (
              <div className="flex-1 overflow-y-auto p-2 no-scrollbar space-y-3">
                {installedPacks.map((pack: any) => (
                  <div key={pack.id} className="space-y-1">
                    <span className="text-[10px] font-bold text-[#E5E7EB] px-1">{pack.name}</span>
                    <div className="grid grid-cols-4 gap-2">
                      {pack.stickers?.map((stk: any) => (
                        <button
                          key={stk.id}
                          onClick={() => handleSendMessage(stk.emoji_association, 'sticker', stk.asset_url)}
                          className="p-1 rounded-xl glass-panel hover:border-[#FFFFFF]/60 flex items-center justify-center cursor-pointer hover:scale-105 transition-all"
                        >
                          <img src={stk.asset_url} alt="Sticker" className="w-12 h-12 rounded-lg object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Action Dock (Telegram + Dating System) */}
        {isActionDockOpen && (
          <div className="p-4 bg-[#12141B] border-t border-[rgba(255,255,255,0.20)]/20 grid grid-cols-4 gap-3 animate-fadeIn">
            <button
              onClick={() => {
                if (onOpenGame) onOpenGame();
              }}
              className="flex flex-col items-center gap-1.5 p-2 rounded-2xl glass-panel text-[#F3F4F6] hover:text-[#FFFFFF] cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-[#FFFFFF]/20 flex items-center justify-center text-[#FFFFFF]">
                <Gamepad2 className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold">Games</span>
            </button>

            <button
              onClick={() => {
                if (onOpenLuckyDice) onOpenLuckyDice();
              }}
              className="flex flex-col items-center gap-1.5 p-2 rounded-2xl glass-panel text-[#F3F4F6] hover:text-[#FFFFFF] cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-400/20 flex items-center justify-center text-amber-300">
                <Dices className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold">Lucky Dice</span>
            </button>

            <button
              onClick={() => handleSendMessage("Sending you an animated Lucky Rose! 🌹 (+15 Chemistry)", 'gift_event')}
              className="flex flex-col items-center gap-1.5 p-2 rounded-2xl glass-panel text-[#F3F4F6] hover:text-[#FFFFFF] cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 flex items-center justify-center text-rose-400">
                <Gift className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold">Send Gift</span>
            </button>

            <button
              onClick={() => handleSendMessage("Shared Track: 'Resonance' - Home (Lo-Fi Ambient)", 'text')}
              className="flex flex-col items-center gap-1.5 p-2 rounded-2xl glass-panel text-[#F3F4F6] hover:text-[#FFFFFF] cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400">
                <Music className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold">Share Song</span>
            </button>
          </div>
        )}

        {/* Composer / Audio Recorder Bar */}
        {isRecordingVoice ? (
          <div className="p-3 bg-[#12141B] border-t border-rose-500/40 flex items-center justify-between gap-3 animate-fadeIn">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-rose-500 animate-ping" />
              <span className="text-xs font-bold text-rose-400">
                Recording Voice {Math.floor(recordingSeconds / 60)}:{(recordingSeconds % 60).toString().padStart(2, '0')}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={cancelVoiceRecording}
                className="px-3 py-1.5 rounded-xl glass-panel text-xs text-[#9CA3AF] hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={stopVoiceRecording}
                className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white flex items-center gap-1 cursor-pointer shadow-lg"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="p-3 bg-[#180412]/95 border-t border-[#FF1A75]/20 backdrop-blur-2xl">
            <div className="max-w-3xl xl:max-w-4xl mx-auto w-full flex items-center gap-2">
              <button
                onClick={() => setIsActionDockOpen(!isActionDockOpen)}
                className={`w-10 h-10 rounded-2xl flex items-center justify-center cursor-pointer transition-colors ${
                  isActionDockOpen 
                    ? 'bg-[#FFFFFF] text-white shadow-[0_0_16px_rgba(255,13,105,0.8)]' 
                    : 'glass-panel text-[#C49DB2] hover:text-white'
                }`}
                title="Interactive Action Dock"
              >
                {isActionDockOpen ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              </button>

              <button
                onClick={() => setIsEmojiPickerOpen(!isEmojiPickerOpen)}
                className={`w-10 h-10 rounded-2xl flex items-center justify-center cursor-pointer transition-colors ${
                  isEmojiPickerOpen ? 'text-[#FFFFFF] bg-[#FFFFFF]/15' : 'text-[#C49DB2] hover:text-white'
                }`}
                title="Emoji, Stickers & Telegram Luck"
              >
                <Smile className="w-4 h-4" />
              </button>

              <div className="relative flex-1">
                <input
                  ref={composerInputRef}
                  type="text"
                  value={inputMessage}
                  onChange={(e) => handleTypingNotice(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder={editingMessage ? "Update message (Esc to cancel)..." : `Message ${currentConv.title}...`}
                  className="w-full pl-4 pr-10 py-3 rounded-2xl glass-panel text-xs text-[#F3F4F6] placeholder-[#82586E] focus:outline-none focus:border-[#FFFFFF]"
                />
                <button 
                  onClick={startVoiceRecording}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#C49DB2] hover:text-[#FFFFFF] cursor-pointer"
                  title="Hold or Click to Record Voice Note"
                >
                  <Mic className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={() => handleSendMessage()}
                disabled={!inputMessage.trim()}
                className="w-11 h-11 rounded-2xl gray-glass-btn flex items-center justify-center text-[#F3F4F6] disabled:opacity-40 disabled:pointer-events-none cursor-pointer transition-transform active:scale-95"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  // =========================================================================
  // MAIN RENDER (RESPONSIVE: 2-COLUMN ON DESKTOP, SWITCHER ON MOBILE)
  // =========================================================================
  return (
    <div className={`w-full mx-auto select-none ${
      isEdgeToEdge 
        ? 'fixed inset-0 z-50 flex bg-[#0D0209]' 
        : isDesktopLayout 
          ? 'max-w-[1700px] h-[calc(100vh-4.5rem)] flex rounded-2xl lg:rounded-3xl overflow-hidden glass-panel-elevated border border-[#FF1A75]/30 shadow-[0_12px_45px_rgba(255,13,105,0.22)]' 
          : 'max-w-md min-h-[calc(100dvh-5rem)] flex flex-col'
    }`}>
      
      {/* DESKTOP 2-COLUMN VIEW */}
      {isDesktopLayout || isEdgeToEdge ? (
        <>
          <div className="w-80 lg:w-[380px] xl:w-[420px] flex-shrink-0 border-r border-[#FF1A75]/20 flex flex-col bg-[#160411]/95 backdrop-blur-2xl">
            {renderConversationList()}
          </div>
          <div className="flex-1 min-w-0 flex flex-col bg-[#0D0209] relative overflow-hidden">
            {renderActiveConversation()}
          </div>
        </>
      ) : (
        /* MOBILE VIEW (SWITCHES BETWEEN INBOX LIST AND INDIVIDUAL CHAT) */
        activeConversationId ? renderActiveConversation() : renderConversationList()
      )}

      {/* Context Menu Modal */}
      {selectedMessageForMenu && (
        <div 
          onClick={() => setSelectedMessageForMenu(null)}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end justify-center p-4 animate-fadeIn"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-3xl glass-panel-elevated p-4 border border-[rgba(255,255,255,0.20)]/30 space-y-3 glass-panel"
          >
            {/* Emoji Reaction Bar */}
            <div className="flex items-center justify-around py-2 border-b border-[rgba(255,255,255,0.20)]/15 text-2xl">
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
                  composerInputRef.current?.focus();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[#F3F4F6] hover:bg-white/5 cursor-pointer"
              >
                <Reply className="w-4 h-4 text-[#FFFFFF]" />
                <span>Reply</span>
              </button>

              <button
                onClick={() => {
                  navigator.clipboard.writeText(selectedMessageForMenu.text);
                  alert("Copied to clipboard!");
                  setSelectedMessageForMenu(null);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[#F3F4F6] hover:bg-white/5 cursor-pointer"
              >
                <Copy className="w-4 h-4 text-[#9CA3AF]" />
                <span>Copy Text</span>
              </button>

              <button
                onClick={() => handleSaveToSavedMessages(selectedMessageForMenu)}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[#F3F4F6] hover:bg-white/5 cursor-pointer"
              >
                <Bookmark className="w-4 h-4 text-amber-400" />
                <span>Save to Personal Cloud</span>
              </button>

              <button
                onClick={() => handleTogglePin(selectedMessageForMenu)}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[#F3F4F6] hover:bg-white/5 cursor-pointer"
              >
                <Pin className="w-4 h-4 text-[rgba(255,255,255,0.20)]" />
                <span>{selectedMessageForMenu.isPinned ? 'Unpin' : 'Pin to Header'}</span>
              </button>

              {selectedMessageForMenu.isOutgoing && (
                <button
                  onClick={() => {
                    setEditingMessage(selectedMessageForMenu);
                    setInputMessage(selectedMessageForMenu.text);
                    setSelectedMessageForMenu(null);
                    composerInputRef.current?.focus();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[#F3F4F6] hover:bg-white/5 cursor-pointer"
                >
                  <Edit2 className="w-4 h-4 text-amber-300" />
                  <span>Edit Message (or press Up arrow)</span>
                </button>
              )}

              <button
                onClick={() => handleDeleteMessage(selectedMessageForMenu.id, true)}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-rose-400 hover:bg-rose-950/20 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete for Everyone</span>
              </button>

              <button
                onClick={() => handleReportUser('Inappropriate Content')}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-amber-400 hover:bg-amber-950/20 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Report to Trust & Safety</span>
              </button>

              <button
                onClick={handleBlockUser}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-rose-500 hover:bg-rose-950/20 cursor-pointer"
              >
                <Lock className="w-4 h-4" />
                <span>Block User</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Media Lightbox Viewer (Telegram Web K reference) */}
      {activeMediaViewerUrl && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex flex-col justify-between p-4 animate-fadeIn">
          <div className="flex items-center justify-between text-white p-2">
            <span className="text-xs font-bold text-[#E5E7EB]">Media Viewer</span>
            <div className="flex items-center gap-3">
              <a 
                href={activeMediaViewerUrl} 
                download 
                target="_blank" 
                rel="noreferrer"
                className="w-8 h-8 rounded-full glass-panel flex items-center justify-center text-white hover:text-[#FFFFFF]"
              >
                <Download className="w-4 h-4" />
              </a>
              <button 
                onClick={() => setActiveMediaViewerUrl(null)} 
                className="w-8 h-8 rounded-full glass-panel flex items-center justify-center text-white hover:text-rose-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex-1 flex items-center justify-center p-2">
            <img 
              src={activeMediaViewerUrl} 
              alt="Fullscreen Media" 
              className="max-h-[80vh] max-w-full rounded-2xl object-contain shadow-2xl" 
            />
          </div>

          <div className="flex justify-center pb-4 text-xs text-[#9CA3AF]">
            <span>Press Esc to close</span>
          </div>
        </div>
      )}

      {/* WebRTC Video / Voice Call Modal */}
      {isCalling && (
        <div className="fixed inset-0 z-50 bg-[#090A0E]/95 backdrop-blur-xl flex flex-col items-center justify-between p-6 text-center animate-fadeIn">
          <div className="pt-6 space-y-2">
            <h3 className="text-lg font-black text-[#F3F4F6]">{currentConv?.title}</h3>
            <p className="text-xs text-[#E5E7EB]">
              Connected • {Math.floor(callDuration / 60)}:{(callDuration % 60).toString().padStart(2, '0')}
            </p>
          </div>

          <div className="relative w-full max-w-sm flex-1 flex items-center justify-center my-4 overflow-hidden rounded-3xl bg-black/60 border border-[rgba(255,255,255,0.20)]/30">
            {isCalling === 'video' ? (
              <div className="relative w-full h-full min-h-[300px]">
                <video 
                  ref={remoteVideoRef} 
                  autoPlay 
                  playsInline 
                  className="w-full h-full object-cover" 
                />
                <video 
                  ref={localVideoRef} 
                  autoPlay 
                  muted 
                  playsInline 
                  className="absolute bottom-4 right-4 w-28 h-36 rounded-2xl object-cover border-2 border-[#FFFFFF] shadow-xl" 
                />
              </div>
            ) : (
              <div className="space-y-4">
                <img 
                  src={currentConv?.avatar || MOCK_PROFILES[0].avatar} 
                  alt={currentConv?.title || 'User'} 
                  className="w-28 h-28 rounded-full object-cover mx-auto border-4 border-[#FFFFFF] shadow-[0_0_30px_rgba(255,79,135,0.7)]"
                />
                <div className="flex justify-center gap-1">
                  {[40, 80, 60, 100, 75, 45].map((h, i) => (
                    <div 
                      key={i} 
                      className="w-1 bg-[#FFFFFF] rounded-full animate-pulse" 
                      style={{ height: `${h * 0.3}px`, animationDelay: `${i * 150}ms` }} 
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4 pb-6">
            <button
              onClick={() => {
                if (localStreamRef.current) {
                  const audioTrack = localStreamRef.current.getAudioTracks()[0];
                  if (audioTrack) {
                    audioTrack.enabled = !audioTrack.enabled;
                    setIsMuted(!audioTrack.enabled);
                  }
                }
              }}
              className={`w-12 h-12 rounded-full flex items-center justify-center cursor-pointer transition-colors ${
                isMuted ? 'bg-rose-500 text-white' : 'glass-panel text-[#F3F4F6]'
              }`}
            >
              {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            {isCalling === 'video' && (
              <button
                onClick={() => {
                  if (localStreamRef.current) {
                    const videoTrack = localStreamRef.current.getVideoTracks()[0];
                    if (videoTrack) {
                      videoTrack.enabled = !videoTrack.enabled;
                      setIsVideoEnabled(videoTrack.enabled);
                    }
                  }
                }}
                className={`w-12 h-12 rounded-full flex items-center justify-center cursor-pointer transition-colors ${
                  !isVideoEnabled ? 'bg-rose-500 text-white' : 'glass-panel text-[#F3F4F6]'
                }`}
              >
                {!isVideoEnabled ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
              </button>
            )}

            <button
              onClick={endCall}
              className="w-14 h-14 rounded-full bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center shadow-[0_0_20px_rgba(225,29,72,0.8)] cursor-pointer transition-transform active:scale-95"
            >
              <PhoneOff className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}

      {/* Before You Talk Briefing Sheet */}
      {currentConv && (
        <BeforeYouTalkSheet
          isOpen={isBriefingOpen}
          onClose={() => setIsBriefingOpen(false)}
          profile={
            RelationshipVaultService.getProfiles().find(p => 
              p.name.toLowerCase().includes(currentConv.title.toLowerCase()) || 
              currentConv.title.toLowerCase().includes(p.name.toLowerCase()) ||
              p.id === currentConv.participantId
            ) || RelationshipVaultService.getProfiles()[0]
          }
        />
      )}

      {/* One Question, Two People Modal */}
      <TwoPersonQuestionModal
        isOpen={isTwoPersonOpen}
        onClose={() => setIsTwoPersonOpen(false)}
        partnerName={currentConv?.title}
        partnerAvatar={currentConv?.avatar}
      />

      {/* Unified AI Assistant Drawer */}
      <UnifiedAiAssistantDrawer
        isOpen={isAiAssistantOpen}
        onClose={() => setIsAiAssistantOpen(false)}
        conversationHistory={currentMessages.map(m => ({
          sender: m.isOutgoing ? 'You' : (currentConv?.title || 'Partner'),
          text: m.text
        }))}
        partnerProfile={{
          name: currentConv?.title || 'Match',
          avatar: currentConv?.avatar,
          interests: ['Music', 'Travel', 'Art'],
          bio: 'Passionate conversationalist exploring the Soulverse.'
        }}
        currentDraftText={inputMessage}
        onInsertMessage={(text) => {
          setInputMessage(text);
          setIsAiAssistantOpen(false);
        }}
        onReplaceDraft={(text) => {
          setInputMessage(text);
          setIsAiAssistantOpen(false);
        }}
        onOpenAiSettings={() => setIsAiSettingsOpen(true)}
      />

      {/* User AI Control Center Modal */}
      {isAiSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-4xl h-[85vh] bg-[#090A0E] border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
            <UserAiControlCenter onClose={() => setIsAiSettingsOpen(false)} />
          </div>
        </div>
      )}
    </div>
  );
};
