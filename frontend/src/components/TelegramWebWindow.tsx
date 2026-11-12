import React, { useState, useEffect } from 'react';
import { 
  X, 
  Minus, 
  Square, 
  Send, 
  Smile, 
  Paperclip, 
  Search, 
  Check, 
  CheckCheck, 
  Pin, 
  Lock, 
  Sparkles, 
  MessageSquare,
  Settings,
  MoreVertical,
  Phone,
  Video,
  User,
  Compass,
  Menu
} from 'lucide-react';
import { chatClient } from '../services/chatApiClient';
import { TelegramLuckEmoji } from './TelegramLuckEmoji';
import type { 
  ConversationItem, 
  ChatMessage, 
  ChatFolderType 
} from '../types/messaging';

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-6 animate-fadeIn">
      {/* Telegram Web Window Frame */}
      <div 
        className={`w-full bg-[#090A0E] border border-white/15 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.85)] flex flex-col overflow-hidden transition-all duration-200 ${
          isMaximized 
            ? 'h-full max-h-screen rounded-none' 
            : 'max-w-6xl h-[90vh] max-h-[900px]'
        }`}
      >
        {/* Titlebar with macOS / Windows Window Controls */}
        <div className="px-4 py-2.5 bg-[#12141B] border-b border-white/10 flex items-center justify-between select-none">
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
              <div className="w-5 h-5 rounded-full bg-white/15 border border-white/25 flex items-center justify-center text-white text-[10px] font-black shadow-sm">
                S
              </div>
              <span className="text-xs font-bold text-white tracking-wide">
                Soulverse Telegram Web • Titanium Glass
              </span>
            </div>
          </div>

          {/* Right: Window Status */}
          <div className="flex items-center gap-2 text-[11px] text-zinc-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Encrypted Cloud (WSS)</span>
          </div>
        </div>

        {/* Telegram Web App Interior (2-Column Architecture) */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* ========================================================= */}
          {/* LEFT COLUMN: CHAT LIST SIDEBAR (Telegram Web K Spec)      */}
          {/* ========================================================= */}
          <div className="w-80 sm:w-92 border-r border-white/10 flex flex-col bg-[#090A0E]">
            {/* Top Bar: Hamburger + Search */}
            <div className="p-3 pb-2 flex items-center gap-2">
              <button 
                onClick={() => setIsDrawerOpen(!isDrawerOpen)}
                className="w-9 h-9 rounded-xl dark-glass flex items-center justify-center text-zinc-400 hover:text-white cursor-pointer"
                title="Menu"
              >
                <Menu className="w-4 h-4" />
              </button>
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search" 
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white/30"
                />
              </div>
            </div>

            {/* Folder Tabs */}
            <div className="flex items-center gap-1 px-3 py-1.5 border-b border-white/10 overflow-x-auto no-scrollbar">
              {(['all', 'matches', 'unread', 'archived'] as ChatFolderType[]).map(f => (
                <button
                  key={f}
                  onClick={() => setActiveFolder(f)}
                  className={`px-3 py-1 rounded-full text-xs font-bold capitalize transition-all cursor-pointer whitespace-nowrap ${
                    activeFolder === f 
                      ? 'bg-white text-[#090A0E] shadow-sm' 
                      : 'text-zinc-400 hover:text-white'
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
                        ? 'bg-white/15 text-white shadow-sm border border-white/20' 
                        : 'hover:bg-white/5 text-zinc-200'
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
                          <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#090A0E]" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-xs font-bold text-white truncate">{conv.title}</h4>
                          {conv.isPinned && <Pin className="w-2.5 h-2.5 text-zinc-400" />}
                        </div>
                        <p className="text-[11px] text-zinc-400 truncate mt-0.5">{conv.lastMessage?.text || 'No messages yet'}</p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      <span className="text-[10px] text-zinc-500 font-mono">{conv.lastMessage?.timestamp || ''}</span>
                      {conv.unreadCount > 0 && (
                        <span className={`w-4 h-4 rounded-full text-[9px] font-black flex items-center justify-center ${isSelected ? 'bg-white text-[#090A0E]' : 'bg-white/20 text-white'}`}>
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
          {/* RIGHT COLUMN: ACTIVE CHAT TIMELINE (Telegram Web K Spec)  */}
          {/* ========================================================= */}
          {currentConv ? (
            <div className="flex-1 flex flex-col bg-[#12141B]/50 relative">
              {/* Active Header */}
              <div className="px-4 py-3 bg-[#090A0E]/95 backdrop-blur-md border-b border-white/10 flex items-center justify-between z-20">
                <div className="flex items-center gap-3">
                  <img 
                    src={currentConv.avatar} 
                    alt={currentConv.title} 
                    className="w-10 h-10 rounded-2xl object-cover border border-white/15" 
                  />
                  <div>
                    <h3 className="text-xs font-bold text-white flex items-center gap-1">
                      <span>{currentConv.title}</span>
                    </h3>
                    <span className="text-[10px] text-zinc-400">{currentConv.lastSeenText}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button className="w-8 h-8 rounded-full dark-glass flex items-center justify-center text-zinc-400 hover:text-white cursor-pointer">
                    <Search className="w-4 h-4" />
                  </button>
                  <button className="w-8 h-8 rounded-full dark-glass flex items-center justify-center text-zinc-400 hover:text-white cursor-pointer">
                    <Phone className="w-4 h-4" />
                  </button>
                  <button className="w-8 h-8 rounded-full dark-glass flex items-center justify-center text-zinc-400 hover:text-white cursor-pointer">
                    <Video className="w-4 h-4" />
                  </button>
                  <button className="w-8 h-8 rounded-full dark-glass flex items-center justify-center text-zinc-400 hover:text-white cursor-pointer">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Chat Timeline Canvas */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2 no-scrollbar telegram-chat-wallpaper">
                
                {/* Floating Date Badge */}
                <div className="flex justify-center my-2">
                  <span className="px-3 py-0.5 rounded-full bg-black/60 border border-white/15 text-[10px] font-bold text-zinc-300 shadow-sm backdrop-blur-md">
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
                          {msg.isOutgoing && <CheckCheck className="w-3 h-3 text-white" />}
                        </div>
                      </div>
                    ) : (
                      /* Telegram Chat Bubble */
                      <div
                        className={`relative max-w-[75%] p-3 rounded-2xl text-xs space-y-1 shadow-md ${
                          msg.isOutgoing
                            ? 'msg-bubble-outgoing rounded-br-xs'
                            : 'msg-bubble-incoming rounded-bl-xs'
                        }`}
                      >
                        <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                        <div className={`flex items-center justify-end gap-1 text-[9px] ${msg.isOutgoing ? 'text-white/80' : 'text-zinc-400'}`}>
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
                <div className="h-48 bg-[#181B24] border-t border-white/10 flex flex-col animate-fadeIn select-none">
                  <div className="flex items-center justify-around border-b border-white/10 py-1.5 text-xs font-bold">
                    <button 
                      onClick={() => setPickerTab('luck')} 
                      className={`px-3 py-1 rounded-full cursor-pointer ${pickerTab === 'luck' ? 'bg-white text-[#090A0E]' : 'text-zinc-400'}`}
                    >
                      🎰 Telegram Luck
                    </button>
                    <button 
                      onClick={() => setPickerTab('emoji')} 
                      className={`px-3 py-1 rounded-full cursor-pointer ${pickerTab === 'emoji' ? 'bg-white text-[#090A0E]' : 'text-zinc-400'}`}
                    >
                      😀 Emojis
                    </button>
                  </div>

                  {pickerTab === 'luck' ? (
                    <div className="flex-1 p-3 flex items-center justify-around">
                      <button
                        onClick={() => handleSend('🎰')}
                        className="p-2 rounded-2xl dark-glass border border-white/10 hover:border-white/30 flex flex-col items-center gap-1 cursor-pointer hover:scale-105 transition-transform"
                      >
                        <div className="text-3xl">🎰</div>
                        <span className="text-[10px] font-bold text-white">Slot Machine</span>
                      </button>

                      <button
                        onClick={() => handleSend('🎲')}
                        className="p-2 rounded-2xl dark-glass border border-white/10 hover:border-white/30 flex flex-col items-center gap-1 cursor-pointer hover:scale-105 transition-transform"
                      >
                        <div className="text-3xl">🎲</div>
                        <span className="text-[10px] font-bold text-white">3D Dice</span>
                      </button>

                      <button
                        onClick={() => handleSend('🪙')}
                        className="p-2 rounded-2xl dark-glass border border-white/10 hover:border-white/30 flex flex-col items-center gap-1 cursor-pointer hover:scale-105 transition-transform"
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
              <div className="p-3 bg-[#090A0E] border-t border-white/10 flex items-center gap-2">
                <button
                  onClick={() => setIsEmojiPickerOpen(!isEmojiPickerOpen)}
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center cursor-pointer transition-colors ${
                    isEmojiPickerOpen ? 'text-white' : 'dark-glass text-zinc-400 hover:text-white'
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
                    className="w-full px-4 py-2.5 rounded-2xl bg-white/[0.04] border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white/30"
                  />
                </div>

                <button
                  onClick={() => handleSend()}
                  disabled={!inputVal.trim()}
                  className="w-10 h-10 rounded-2xl gray-glass-btn flex items-center justify-center text-white disabled:opacity-40 cursor-pointer shadow-md transition-transform active:scale-95"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-zinc-500">
              <Sparkles className="w-12 h-12 text-zinc-400 mb-2" />
              <h3 className="text-sm font-bold text-white">Select a chat to start messaging</h3>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
