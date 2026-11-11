import React, { useState, useEffect } from 'react';
import { 
  X, 
  Minus, 
  Square, 
  Search, 
  Send, 
  Smile, 
  Paperclip, 
  Mic, 
  Phone, 
  Video, 
  MoreVertical, 
  Pin, 
  CheckCheck, 
  ArrowLeft,
  Bookmark,
  ShieldCheck,
  Sparkles,
  Lock,
  Menu,
  Moon,
  Settings,
  HelpCircle
} from 'lucide-react';
import { TelegramLuckEmoji } from './TelegramLuckEmoji';
import { VoiceWaveformPlayer } from './VoiceWaveformPlayer';
import { chatClient } from '../services/chatApiClient';
import type { ChatMessage, ConversationItem, ChatFolderType } from '../types/messaging';

interface TelegramWebWindowProps {
  isOpen: boolean;
  onClose: () => void;
  initialConversationId?: string | null;
}

export const TelegramWebWindow: React.FC<TelegramWebWindowProps> = ({
  isOpen,
  onClose,
  initialConversationId
}) => {
  if (!isOpen) return null;

  const [isMaximized, setIsMaximized] = useState(false);
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(initialConversationId || 'conv_alex');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputVal, setInputVal] = useState('');
  const [activeFolder, setActiveFolder] = useState<ChatFolderType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const [pickerTab, setPickerTab] = useState<'luck' | 'emoji' | 'stickers'>('luck');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Load conversations
  useEffect(() => {
    chatClient.getConversations().then(res => {
      setConversations(res);
      if (!activeConvId && res.length > 0) {
        setActiveConvId(res[0].id);
      }
    });

    const unsubMsg = chatClient.subscribe('chat.message.created', (event: any) => {
      if (event.conversationId === activeConvId) {
        setMessages(prev => [...prev, event.message]);
      }
    });

    return () => unsubMsg();
  }, [activeConvId]);

  // Load messages for selected conversation
  useEffect(() => {
    if (!activeConvId) return;
    chatClient.getMessages(activeConvId).then(res => {
      setMessages(res);
    });
  }, [activeConvId]);

  const currentConv = conversations.find(c => c.id === activeConvId);

  const handleSend = async (customText?: string) => {
    const textToSend = customText || inputVal;
    if (!textToSend.trim() || !activeConvId) return;

    let determinedType: ChatMessage['type'] = 'text';
    let determinedMedia: string | undefined = undefined;

    const trimmed = textToSend.trim();
    if (trimmed === '🎲') {
      determinedType = 'dice_event';
      determinedMedia = `dice_${Math.floor(Math.random() * 6) + 1}`;
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
      determinedMedia = `coin_${Math.random() < 0.5 ? 'heads' : 'tails'}`;
    }

    try {
      await chatClient.sendMessage({
        conversationId: activeConvId,
        text: textToSend,
        type: determinedType,
        mediaUrl: determinedMedia
      });

      const updated = await chatClient.getMessages(activeConvId);
      setMessages(updated);
    } catch (e) {
      console.error(e);
    }

    setInputVal('');
    setIsEmojiPickerOpen(false);
  };

  const filteredConversations = conversations.filter(conv => {
    if (activeFolder === 'matches' && conv.category !== 'match') return false;
    if (activeFolder === 'unread' && conv.unreadCount === 0) return false;
    if (activeFolder === 'archived' && !conv.isArchived) return false;
    if (searchQuery.trim()) {
      return conv.title.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-6 animate-fadeIn">
      {/* Telegram Web Window Frame */}
      <div 
        className={`w-full bg-[#17101B] border border-[#FF78A8]/30 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden transition-all duration-200 ${
          isMaximized 
            ? 'h-full max-h-screen rounded-none' 
            : 'max-w-5xl h-[88vh] max-h-[850px]'
        }`}
      >
        {/* Titlebar with macOS / Windows Window Controls */}
        <div className="px-4 py-2.5 bg-[#120B15] border-b border-[#FF78A8]/20 flex items-center justify-between select-none">
          {/* Left: Window Dots & App Brand */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <button 
                onClick={onClose} 
                className="w-3 h-3 rounded-full bg-rose-500 hover:bg-rose-600 cursor-pointer shadow-sm"
                title="Close Window" 
              />
              <button 
                onClick={() => setIsMaximized(false)} 
                className="w-3 h-3 rounded-full bg-amber-400 hover:bg-amber-500 cursor-pointer shadow-sm" 
                title="Minimize Window"
              />
              <button 
                onClick={() => setIsMaximized(!isMaximized)} 
                className="w-3 h-3 rounded-full bg-emerald-500 hover:bg-emerald-600 cursor-pointer shadow-sm" 
                title="Toggle Maximize"
              />
            </div>
            <div className="h-4 w-px bg-white/10 ml-1" />
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-[#FF4F87] to-[#FF78A8] flex items-center justify-center text-white text-[10px] font-black">
                F
              </div>
              <span className="text-xs font-bold text-[#FFF1F3] tracking-wide">
                Telegram Web K • Pink Ambient Client
              </span>
            </div>
          </div>

          {/* Right: Window Status */}
          <div className="flex items-center gap-2 text-[11px] text-[#FFB4CE]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Connected (WSS)</span>
          </div>
        </div>

        {/* Telegram Web App Interior (2-Column Architecture) */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* ========================================================= */}
          {/* LEFT COLUMN: CHAT LIST SIDEBAR (Telegram Web K Spec)      */}
          {/* ========================================================= */}
          <div className="w-80 sm:w-88 border-r border-[#FF78A8]/20 flex flex-col bg-[#140D18]">
            {/* Top Bar: Hamburger + Search */}
            <div className="p-3 pb-2 flex items-center gap-2">
              <button 
                onClick={() => setIsDrawerOpen(!isDrawerOpen)}
                className="w-9 h-9 rounded-xl glass-panel flex items-center justify-center text-[#B9A8B3] hover:text-white cursor-pointer"
                title="Menu"
              >
                <Menu className="w-4 h-4" />
              </button>
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-[#B9A8B3] absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search" 
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-black/40 border border-[#FF78A8]/20 text-xs text-[#FFF1F3] placeholder-[#7A6975] focus:outline-none focus:border-[#FF4F87]"
                />
              </div>
            </div>

            {/* Folder Tabs */}
            <div className="flex items-center gap-1 px-3 py-1.5 border-b border-[#FF78A8]/10 overflow-x-auto no-scrollbar">
              {(['all', 'matches', 'unread', 'archived'] as ChatFolderType[]).map(f => (
                <button
                  key={f}
                  onClick={() => setActiveFolder(f)}
                  className={`px-3 py-1 rounded-full text-xs font-bold capitalize transition-all cursor-pointer whitespace-nowrap ${
                    activeFolder === f 
                      ? 'bg-[#FF4F87] text-white shadow-sm' 
                      : 'text-[#B9A8B3] hover:text-white'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            {/* Chats Stream */}
            <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1 no-scrollbar">
              {filteredConversations.map(conv => {
                const isSelected = activeConvId === conv.id;
                return (
                  <div
                    key={conv.id}
                    onClick={() => setActiveConvId(conv.id)}
                    className={`p-2.5 rounded-2xl flex items-center justify-between gap-2.5 cursor-pointer transition-all ${
                      isSelected 
                        ? 'bg-[#FF4F87] text-white shadow-md' 
                        : 'hover:bg-white/5 text-[#FFF1F3]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="relative flex-shrink-0">
                        <img 
                          src={conv.avatar} 
                          alt={conv.title} 
                          className="w-11 h-11 rounded-2xl object-cover border border-white/10" 
                        />
                        {conv.isOnline && (
                          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-[#140D18]" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1">
                          <h4 className="text-xs font-bold truncate">{conv.title}</h4>
                          {conv.isVerified && <ShieldCheck className="w-3 h-3 text-emerald-300" />}
                        </div>
                        <p className={`text-[11px] truncate mt-0.5 ${isSelected ? 'text-white/80' : 'text-[#B9A8B3]'}`}>
                          {conv.lastMessage?.text || 'No messages yet'}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      <span className={`text-[10px] ${isSelected ? 'text-white/70' : 'text-[#7A6975]'}`}>
                        {conv.lastMessage?.timestamp}
                      </span>
                      {conv.unreadCount > 0 && (
                        <span className={`w-4 h-4 rounded-full text-[9px] font-black flex items-center justify-center ${isSelected ? 'bg-white text-[#FF4F87]' : 'bg-[#FF4F87] text-white'}`}>
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ========================================================= */}
          {/* RIGHT COLUMN: MAIN CHAT PANEL (Telegram Web Wallpaper)   */}
          {/* ========================================================= */}
          {currentConv ? (
            <div className="flex-1 flex flex-col bg-[#100B12] relative overflow-hidden">
              
              {/* Telegram Topbar */}
              <div className="px-4 py-3 bg-[#17101B]/90 backdrop-blur-md border-b border-[#FF78A8]/20 flex items-center justify-between z-20">
                <div className="flex items-center gap-3">
                  <img 
                    src={currentConv.avatar} 
                    alt={currentConv.title} 
                    className="w-10 h-10 rounded-2xl object-cover border border-[#FF78A8]/30" 
                  />
                  <div>
                    <h3 className="text-xs font-bold text-[#FFF1F3]">{currentConv.title}</h3>
                    <span className="text-[10px] text-[#B9A8B3]">{currentConv.lastSeenText}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button className="w-8 h-8 rounded-full glass-panel flex items-center justify-center text-[#B9A8B3] hover:text-[#FF4F87] cursor-pointer">
                    <Search className="w-4 h-4" />
                  </button>
                  <button className="w-8 h-8 rounded-full glass-panel flex items-center justify-center text-[#B9A8B3] hover:text-[#FF4F87] cursor-pointer">
                    <Phone className="w-4 h-4" />
                  </button>
                  <button className="w-8 h-8 rounded-full glass-panel flex items-center justify-center text-[#B9A8B3] hover:text-[#FF4F87] cursor-pointer">
                    <Video className="w-4 h-4" />
                  </button>
                  <button className="w-8 h-8 rounded-full glass-panel flex items-center justify-center text-[#B9A8B3] hover:text-white cursor-pointer">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Chat Timeline Canvas (Telegram Web Pattern Backdrop) */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2 no-scrollbar bg-[radial-gradient(#ff4f87_0.75px,transparent_0.75px)] [background-size:20px_20px] bg-opacity-5">
                
                {/* Floating Date Badge */}
                <div className="flex justify-center my-2">
                  <span className="px-3 py-0.5 rounded-full bg-black/60 border border-white/10 text-[10px] font-bold text-[#FFB4CE] shadow-sm">
                    Today
                  </span>
                </div>

                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${msg.isOutgoing ? 'items-end' : 'items-start'}`}
                  >
                    {/* Standalone Telegram Luck Emojis (Slot, Dice, Coin) */}
                    {msg.type === 'dice_event' || msg.type === 'slot_event' || msg.type === 'coin_event' ? (
                      <div className="relative p-1 my-1 flex flex-col items-center cursor-pointer group/luck">
                        <TelegramLuckEmoji 
                          type={msg.type === 'dice_event' ? 'dice' : msg.type === 'slot_event' ? 'slot' : 'coin'} 
                          seedValue={msg.mediaUrl}
                        />
                        <div className="absolute bottom-0 right-0 px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-md border border-white/10 flex items-center gap-1 text-[9px] text-white shadow-md">
                          <span>{msg.timestamp}</span>
                          {msg.isOutgoing && <CheckCheck className="w-3 h-3 text-[#FF4F87]" />}
                        </div>
                      </div>
                    ) : (
                      /* Telegram Chat Bubble */
                      <div
                        className={`relative max-w-[75%] p-3 rounded-2xl text-xs space-y-1 shadow-md ${
                          msg.isOutgoing
                            ? 'bg-gradient-to-tr from-[#FF4F87] to-[#FF78A8] text-white rounded-br-xs shadow-[0_4px_12px_rgba(255,79,135,0.3)]'
                            : 'bg-[#1C1420] text-[#FFF1F3] rounded-bl-xs border border-[#FF78A8]/20'
                        }`}
                      >
                        <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                        <div className={`flex items-center justify-end gap-1 text-[9px] ${msg.isOutgoing ? 'text-white/80' : 'text-[#7A6975]'}`}>
                          <span>{msg.timestamp}</span>
                          {msg.isOutgoing && <CheckCheck className="w-3 h-3 text-white" />}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Emoji / Luck Drawer */}
              {isEmojiPickerOpen && (
                <div className="h-48 bg-[#17101B] border-t border-[#FF78A8]/20 flex flex-col animate-fadeIn select-none">
                  <div className="flex items-center justify-around border-b border-[#FF78A8]/10 py-1.5 text-xs font-bold">
                    <button 
                      onClick={() => setPickerTab('luck')} 
                      className={`px-3 py-1 rounded-full cursor-pointer ${pickerTab === 'luck' ? 'bg-[#FF4F87] text-white' : 'text-[#B9A8B3]'}`}
                    >
                      🎰 Telegram Luck
                    </button>
                    <button 
                      onClick={() => setPickerTab('emoji')} 
                      className={`px-3 py-1 rounded-full cursor-pointer ${pickerTab === 'emoji' ? 'bg-[#FF4F87] text-white' : 'text-[#B9A8B3]'}`}
                    >
                      😀 Emojis
                    </button>
                  </div>

                  {pickerTab === 'luck' ? (
                    <div className="flex-1 p-3 flex items-center justify-around">
                      <button
                        onClick={() => handleSend('🎰')}
                        className="p-2 rounded-2xl glass-panel-elevated border border-[#FF78A8]/30 hover:border-[#FF4F87] flex flex-col items-center gap-1 cursor-pointer hover:scale-105 transition-transform"
                      >
                        <div className="text-3xl">🎰</div>
                        <span className="text-[10px] font-bold text-white">Slot Machine</span>
                      </button>

                      <button
                        onClick={() => handleSend('🎲')}
                        className="p-2 rounded-2xl glass-panel-elevated border border-[#FF78A8]/30 hover:border-[#FF4F87] flex flex-col items-center gap-1 cursor-pointer hover:scale-105 transition-transform"
                      >
                        <div className="text-3xl">🎲</div>
                        <span className="text-[10px] font-bold text-white">3D Dice</span>
                      </button>

                      <button
                        onClick={() => handleSend('🪙')}
                        className="p-2 rounded-2xl glass-panel-elevated border border-[#FF78A8]/30 hover:border-[#FF4F87] flex flex-col items-center gap-1 cursor-pointer hover:scale-105 transition-transform"
                      >
                        <div className="text-3xl">🪙</div>
                        <span className="text-[10px] font-bold text-white">Eagle Coin</span>
                      </button>
                    </div>
                  ) : (
                    <div className="flex-1 overflow-y-auto p-3 grid grid-cols-8 gap-2 text-2xl no-scrollbar">
                      {['❤️', '🔥', '✨', '🌹', '😂', '😍', '😘', '🥺', '🎉', '🌟', '🧁', '🥂', '💌', '🌸', '💖', '🥰'].map(e => (
                        <button key={e} onClick={() => handleSend(e)} className="hover:scale-125 transition-transform cursor-pointer">
                          {e}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Composer */}
              <div className="p-3 bg-[#17101B] border-t border-[#FF78A8]/20 flex items-center gap-2">
                <button
                  onClick={() => setIsEmojiPickerOpen(!isEmojiPickerOpen)}
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center cursor-pointer transition-colors ${
                    isEmojiPickerOpen ? 'text-[#FF4F87]' : 'glass-panel text-[#B9A8B3] hover:text-white'
                  }`}
                  title="Emoji & Luck"
                >
                  <Smile className="w-5 h-5" />
                </button>

                <div className="relative flex-1">
                  <input
                    type="text"
                    value={inputVal}
                    onChange={(e) => setInputVal(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Write a message..."
                    className="w-full px-4 py-2.5 rounded-2xl bg-black/40 border border-[#FF78A8]/20 text-xs text-[#FFF1F3] placeholder-[#7A6975] focus:outline-none focus:border-[#FF4F87]"
                  />
                </div>

                <button
                  onClick={() => handleSend()}
                  disabled={!inputVal.trim()}
                  className="w-10 h-10 rounded-2xl pink-gradient-btn flex items-center justify-center text-white disabled:opacity-40 cursor-pointer shadow-md transition-transform active:scale-95"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-[#7A6975]">
              <Sparkles className="w-12 h-12 text-[#FF4F87] mb-2" />
              <h3 className="text-sm font-bold text-white">Select a chat to start messaging</h3>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
