import React, { useState } from 'react';
import { 
  Radio, 
  MessageSquare, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Send, 
  Sparkles, 
  ShieldCheck, 
  Users, 
  Headphones, 
  AlertCircle,
  HelpCircle,
  Clock,
  PhoneCall,
  Search,
  Lock,
  UserCheck
} from 'lucide-react';
import { MOCK_PROFILES } from '../mockData';

export const MessagesRoomsHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'rooms' | 'direct_chats' | 'ai_coach'>('rooms');
  const [selectedRoom, setSelectedRoom] = useState<string>('room-1');
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isDeafened, setIsDeafened] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  
  // AI Coach interactive mock
  const [coachScenario, setCoachScenario] = useState<'approaching' | 'awkward_silence' | 'boundary_setting'>('approaching');
  const [coachDialogue, setCoachDialogue] = useState<Array<{ sender: 'ai' | 'user'; text: string }>>([
    {
      sender: 'ai',
      text: "Hello Kavindu. Let's practice initiating a conversation with someone who loves photography and architecture. What would you send as an opening note?"
    }
  ]);
  const [userCoachInput, setUserCoachInput] = useState('');

  // Audio Lounges definition
  const AUDIO_LOUNGES = [
    {
      id: 'room-1',
      title: 'Deep Talk Lounge (No Small Talk)',
      topic: 'What book or experience quietly changed how you see people?',
      participants: 6,
      maxParticipants: 8,
      category: 'Intimate Conversation',
      activeSpeaker: 'Tara ( Colombo )',
      tags: ['Philosophy', 'Books', 'Quiet Vibe']
    },
    {
      id: 'room-2',
      title: 'Midnight Lo-Fi Co-Working',
      topic: 'Quiet accountability room. Soft beats streaming.',
      participants: 4,
      maxParticipants: 10,
      category: 'Focus & Presence',
      activeSpeaker: 'Ambient Stream (Lo-Fi Beats)',
      tags: ['Study', 'Quiet', 'Lo-Fi']
    },
    {
      id: 'room-3',
      title: 'Introvert Wind-Down Space',
      topic: 'Speaking is completely optional. Feel free to just listen and unwind.',
      participants: 5,
      maxParticipants: 8,
      category: 'Low Battery Friendly',
      activeSpeaker: 'Alex ( Kandy )',
      tags: ['Low Pressure', 'Casual']
    }
  ];

  // Direct messages mock
  const [directConversations] = useState([
    {
      id: 'conv-1',
      user: MOCK_PROFILES[0], // Alex
      lastMessage: "I really loved that point you made about slow weekends.",
      time: "10m ago",
      unread: 1,
      isGateUnlocked: true
    },
    {
      id: 'conv-2',
      user: MOCK_PROFILES[1], // Tara
      lastMessage: "Are you attending the Saturday coffee tasting meetup?",
      time: "2h ago",
      unread: 0,
      isGateUnlocked: true
    },
    {
      id: 'conv-3',
      user: MOCK_PROFILES[2], // Dinuk
      lastMessage: "Connection request: 'Hi Kavindu, I noticed we both enjoy indie synth-pop...'",
      time: "Yesterday",
      unread: 0,
      isGateUnlocked: false // Gate request pending acceptance
    }
  ]);

  const [activeDirectConvId, setActiveDirectConvId] = useState('conv-1');
  const currentDirectConv = directConversations.find(c => c.id === activeDirectConvId);

  const handleSendCoachMessage = () => {
    if (!userCoachInput.trim()) return;
    
    const newDialogue = [...coachDialogue, { sender: 'user' as const, text: userCoachInput }];
    setCoachDialogue(newDialogue);
    setUserCoachInput('');

    // Simulate AI feedback
    setTimeout(() => {
      let feedback = "That was thoughtful! You asked an open-ended question without putting them on the spot. To make it even warmer, mention what specifically drew your curiosity.";
      if (coachScenario === 'awkward_silence') {
        feedback = "Great graceful pivot. Acknowledging a quiet moment with humour removes 90% of the perceived tension.";
      }
      setCoachDialogue(prev => [...prev, { sender: 'ai', text: feedback }]);
    }, 700);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* View Header & Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#302B22]">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#D6AD60]/10 border border-[#D6AD60]/30 text-xs font-semibold text-[#F1D99F] mb-1">
            <Radio className="w-3.5 h-3.5 text-[#D6AD60]" />
            <span>COMMUNICATION SANCTUARY</span>
          </div>
          <h1 className="text-2xl font-black text-[#F5F0E6]">
            Messages & Live Audio Lounges
          </h1>
          <p className="text-xs text-[#A7A094] mt-0.5">
            Low-pressure, high-intention communication. No unsolicited spam, with mutual gates and safe voice spaces.
          </p>
        </div>

        {/* Tab switch pills */}
        <div className="flex items-center gap-1 bg-[#111111] p-1 rounded-2xl border border-[#302B22]">
          <button
            onClick={() => setActiveTab('rooms')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'rooms' 
                ? 'bg-[#D6AD60] text-[#090909]' 
                : 'text-[#A7A094] hover:text-[#F5F0E6]'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Audio Lounges (3)</span>
          </button>
          <button
            onClick={() => setActiveTab('direct_chats')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'direct_chats' 
                ? 'bg-[#D6AD60] text-[#090909]' 
                : 'text-[#A7A094] hover:text-[#F5F0E6]'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Direct Chats (3)</span>
          </button>
          <button
            onClick={() => setActiveTab('ai_coach')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'ai_coach' 
                ? 'bg-[#D6AD60] text-[#090909]' 
                : 'text-[#A7A094] hover:text-[#F5F0E6]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Practice Sandbox</span>
          </button>
        </div>
      </div>

      {/* MODE 1: LIVE AUDIO LOUNGES */}
      {activeTab === 'rooms' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Rooms List */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-[#F5F0E6] flex items-center gap-2">
              <Headphones className="w-4 h-4 text-[#D6AD60]" />
              <span>Available Live Lounges</span>
            </h3>

            <div className="space-y-3">
              {AUDIO_LOUNGES.map(room => (
                <div
                  key={room.id}
                  onClick={() => setSelectedRoom(room.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    selectedRoom === room.id 
                      ? 'bg-[#171717] border-[#D6AD60] gold-glow-subtle' 
                      : 'bg-[#111111] border-[#302B22] hover:border-[#D6AD60]/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#D6AD60]">
                      {room.category}
                    </span>
                    <span className="text-xs font-medium text-[#A7A094] flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {room.participants}/{room.maxParticipants}
                    </span>
                  </div>
                  
                  <h4 className="text-xs font-bold text-[#F5F0E6] mt-1.5">{room.title}</h4>
                  <p className="text-[11px] text-[#A7A094] mt-1 line-clamp-2">{room.topic}</p>

                  <div className="mt-3 pt-2.5 border-t border-[#211E18] flex items-center justify-between text-[11px]">
                    <span className="text-emerald-400 flex items-center gap-1">
                      <Volume2 className="w-3 h-3 animate-pulse" />
                      {room.activeSpeaker}
                    </span>
                    <span className="text-[#A7A094] text-[10px]">Capped at 8-10</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Center & Right: Selected Room Live Stage */}
          <div className="lg:col-span-2 rounded-3xl bg-[#171717] border border-[#302B22] p-6 flex flex-col justify-between min-h-[500px]">
            {/* Room Header */}
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#302B22]">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-[#211E18] text-[#D6AD60] text-[10px] font-bold uppercase">
                      Live Audio Stage
                    </span>
                    <span className="text-xs text-emerald-400 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      Encrypted Peer Voice
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-[#F5F0E6] mt-1">
                    {AUDIO_LOUNGES.find(r => r.id === selectedRoom)?.title}
                  </h2>
                </div>

                {/* Moderation & Rules */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#A7A094] flex items-center gap-1 bg-[#111111] px-3 py-1 rounded-xl border border-[#302B22]">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#D6AD60]" />
                    Zero Hate Tolerance
                  </span>
                </div>
              </div>

              {/* Discussion Prompt Anchor */}
              <div className="mt-4 p-4 rounded-2xl bg-[#111111] border border-[#302B22] space-y-1">
                <span className="text-[10px] font-bold text-[#D6AD60] uppercase tracking-wider">
                  Current Reflection Prompt
                </span>
                <p className="text-xs text-[#F5F0E6] italic">
                  "{AUDIO_LOUNGES.find(r => r.id === selectedRoom)?.topic}"
                </p>
              </div>

              {/* Active Participants Grid */}
              <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-4">
                {/* Speaker 1 (Active) */}
                <div className="p-4 rounded-2xl bg-[#111111] border-2 border-[#D6AD60] flex flex-col items-center text-center relative gold-glow-sm">
                  <div className="relative mb-2">
                    <img 
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200" 
                      alt="Tara" 
                      className="w-16 h-16 rounded-full object-cover border-2 border-[#D6AD60]"
                    />
                    <div className="absolute -bottom-1 -right-1 p-1 bg-emerald-500 rounded-full text-[#090909]">
                      <Volume2 className="w-3 h-3 animate-pulse" />
                    </div>
                  </div>
                  <span className="text-xs font-bold text-[#F5F0E6]">Tara</span>
                  <span className="text-[10px] text-[#D6AD60]">Speaking now</span>
                </div>

                {/* Speaker 2 (Alex) */}
                <div className="p-4 rounded-2xl bg-[#111111] border border-[#302B22] flex flex-col items-center text-center">
                  <div className="relative mb-2">
                    <img 
                      src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=200" 
                      alt="Alex" 
                      className="w-16 h-16 rounded-full object-cover border border-[#302B22]"
                    />
                    <div className="absolute -bottom-1 -right-1 p-1 bg-[#211E18] rounded-full text-[#A7A094]">
                      <MicOff className="w-3 h-3" />
                    </div>
                  </div>
                  <span className="text-xs font-bold text-[#F5F0E6]">Alex</span>
                  <span className="text-[10px] text-[#A7A094]">Muted • Listening</span>
                </div>

                {/* Speaker 3 (You) */}
                <div className="p-4 rounded-2xl bg-[#111111] border border-[#302B22] flex flex-col items-center text-center">
                  <div className="relative mb-2">
                    <img 
                      src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200" 
                      alt="Kavindu" 
                      className="w-16 h-16 rounded-full object-cover border border-[#D6AD60]"
                    />
                    <div className="absolute -bottom-1 -right-1 p-1 bg-[#211E18] rounded-full text-[#D6AD60]">
                      {isMicMuted ? <MicOff className="w-3 h-3 text-rose-400" /> : <Mic className="w-3 h-3 text-emerald-400" />}
                    </div>
                  </div>
                  <span className="text-xs font-bold text-[#F5F0E6]">You (Kavindu)</span>
                  <span className="text-[10px] text-[#A7A094]">{isMicMuted ? 'Muted' : 'Mic Active'}</span>
                </div>
              </div>
            </div>

            {/* Stage Bottom Voice Controls */}
            <div className="pt-6 mt-6 border-t border-[#302B22] flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsMicMuted(!isMicMuted)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-colors ${
                    isMicMuted 
                      ? 'bg-rose-950/40 border border-rose-500/40 text-rose-300' 
                      : 'bg-[#211E18] border border-[#302B22] text-[#F5F0E6] hover:border-[#D6AD60]'
                  }`}
                >
                  {isMicMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-emerald-400" />}
                  <span>{isMicMuted ? 'Unmute' : 'Mute Mic'}</span>
                </button>

                <button
                  onClick={() => setIsDeafened(!isDeafened)}
                  className={`p-2 rounded-xl border cursor-pointer transition-colors ${
                    isDeafened 
                      ? 'bg-rose-950/40 border-rose-500/40 text-rose-300' 
                      : 'bg-[#211E18] border-[#302B22] text-[#A7A094] hover:text-[#F5F0E6]'
                  }`}
                  title={isDeafened ? 'Undeafen' : 'Deafen audio'}
                >
                  {isDeafened ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => alert("Simulating 'Raised Hand' to speak next.")}
                  className="px-3.5 py-2 rounded-xl bg-[#211E18] hover:bg-[#302B22] border border-[#302B22] text-xs font-medium text-[#F5F0E6] cursor-pointer"
                >
                  ✋ Raise Hand
                </button>
                <button
                  onClick={() => alert("Leaving audio room.")}
                  className="px-3.5 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/40 text-rose-300 text-xs font-semibold cursor-pointer"
                >
                  Leave Room
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODE 2: DIRECT CHATS & CONNECTION GATES */}
      {activeTab === 'direct_chats' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Conversation List */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-[#F5F0E6] flex items-center justify-between">
              <span>Verified Conversations</span>
              <span className="text-[11px] text-[#A7A094]">No cold spam</span>
            </h3>

            <div className="space-y-2">
              {directConversations.map(conv => (
                <div
                  key={conv.id}
                  onClick={() => setActiveDirectConvId(conv.id)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    activeDirectConvId === conv.id 
                      ? 'bg-[#171717] border-[#D6AD60]' 
                      : 'bg-[#111111] border-[#302B22] hover:border-[#D6AD60]/40'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <img 
                      src={conv.user.avatar} 
                      alt={conv.user.name} 
                      className="w-10 h-10 rounded-xl object-cover border border-[#302B22]" 
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#F5F0E6] truncate">{conv.user.name}</span>
                        <span className="text-[10px] text-[#A7A094]">{conv.time}</span>
                      </div>
                      <p className="text-[11px] text-[#A7A094] truncate mt-0.5">{conv.lastMessage}</p>
                    </div>
                  </div>
                  
                  {!conv.isGateUnlocked && (
                    <div className="mt-2 text-[10px] font-semibold text-[#D6AD60] bg-[#211E18] px-2 py-0.5 rounded flex items-center gap-1">
                      <Lock className="w-3 h-3" />
                      Connection request pending approval
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Active Direct Conversation Panel */}
          <div className="lg:col-span-2 rounded-3xl bg-[#171717] border border-[#302B22] p-6 flex flex-col justify-between min-h-[500px]">
            {currentDirectConv ? (
              <>
                {/* Header */}
                <div className="flex items-center justify-between pb-4 border-b border-[#302B22]">
                  <div className="flex items-center gap-3">
                    <img 
                      src={currentDirectConv.user.avatar} 
                      alt={currentDirectConv.user.name} 
                      className="w-10 h-10 rounded-xl object-cover border border-[#302B22]"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-bold text-[#F5F0E6]">{currentDirectConv.user.name}</span>
                        <ShieldCheck className="w-3.5 h-3.5 text-[#D6AD60]" />
                      </div>
                      <span className="text-[11px] text-[#A7A094]">
                        {currentDirectConv.user.compatibilityScore}% Compatibility • {currentDirectConv.user.intent}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => alert("Opening safety & verification report for this user.")}
                    className="text-xs text-[#A7A094] hover:text-[#D6AD60] transition-colors"
                  >
                    Safety Tools ▾
                  </button>
                </div>

                {/* Message Log */}
                <div className="py-6 space-y-4 flex-1 overflow-y-auto">
                  {!currentDirectConv.isGateUnlocked ? (
                    <div className="p-5 rounded-2xl bg-[#111111] border border-[#D6AD60]/40 text-center space-y-3">
                      <Lock className="w-8 h-8 text-[#D6AD60] mx-auto" />
                      <h4 className="text-sm font-bold text-[#F5F0E6]">Connection Gate Pending</h4>
                      <p className="text-xs text-[#A7A094] max-w-md mx-auto">
                        {currentDirectConv.user.name} sent you a connection note. In FRIENDS, people cannot message you continuously until you both mutually accept.
                      </p>
                      <div className="flex justify-center gap-3 pt-2">
                        <button 
                          onClick={() => alert("Accepted connection request!")}
                          className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#D6AD60] to-[#F1D99F] text-[#090909] font-bold text-xs cursor-pointer shadow-md shadow-[#D6AD60]/20"
                        >
                          Accept Connection
                        </button>
                        <button 
                          onClick={() => alert("Declined with zero awkwardness or notification.")}
                          className="px-4 py-2 rounded-xl bg-[#211E18] text-[#A7A094] hover:text-[#F5F0E6] text-xs font-semibold cursor-pointer"
                        >
                          Decline Politely
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-start">
                        <div className="max-w-md p-3.5 rounded-2xl bg-[#111111] border border-[#211E18] text-xs text-[#F5F0E6] space-y-1">
                          <p>{currentDirectConv.lastMessage}</p>
                          <span className="text-[9px] text-[#A7A094] block text-right">{currentDirectConv.time}</span>
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <div className="max-w-md p-3.5 rounded-2xl bg-[#211E18] border border-[#302B22] text-xs text-[#F5F0E6] space-y-1">
                          <p>Definitely! Looking forward to discussing photography and books.</p>
                          <span className="text-[9px] text-[#D6AD60] block text-right">Just now • Delivered</span>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Input Bar */}
                <div className="pt-4 border-t border-[#302B22] flex items-center gap-2">
                  <input 
                    type="text" 
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    placeholder={currentDirectConv.isGateUnlocked ? "Write a thoughtful message..." : "Unlock connection to reply..."}
                    disabled={!currentDirectConv.isGateUnlocked}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-[#111111] border border-[#302B22] text-xs text-[#F5F0E6] focus:outline-none focus:border-[#D6AD60]"
                  />
                  <button 
                    disabled={!currentDirectConv.isGateUnlocked || !chatMessage.trim()}
                    className="px-4 py-2.5 rounded-xl bg-[#D6AD60] disabled:bg-[#211E18] disabled:text-[#A7A094] text-[#090909] font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center py-12 text-[#A7A094] text-xs">
                Select a conversation on the left.
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODE 3: AI PRACTICE SANDBOX */}
      {activeTab === 'ai_coach' && (
        <div className="rounded-3xl bg-[#171717] border border-[#302B22] p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#302B22]">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#F1D99F] mb-1">
                <Sparkles className="w-4 h-4 text-[#D6AD60]" />
                <span>Zero-Judgment AI Conversation Coach</span>
              </div>
              <p className="text-xs text-[#A7A094]">
                Practice talking through awkward pauses, asking thoughtful questions, and expressing vulnerability without fear of rejection.
              </p>
            </div>

            {/* Scenario Picker */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#A7A094]">Scenario:</span>
              <select
                value={coachScenario}
                onChange={(e) => setCoachScenario(e.target.value as any)}
                className="px-3 py-1.5 rounded-xl bg-[#111111] border border-[#302B22] text-xs text-[#F5F0E6] focus:outline-none focus:border-[#D6AD60]"
              >
                <option value="approaching">Approaching Someone New</option>
                <option value="awkward_silence">Overcoming Awkward Silence</option>
                <option value="boundary_setting">Polite Boundary Setting</option>
              </select>
            </div>
          </div>

          {/* Dialogue Log */}
          <div className="space-y-4 min-h-[300px] max-h-[400px] overflow-y-auto p-4 rounded-2xl bg-[#111111] border border-[#211E18]">
            {coachDialogue.map((msg, idx) => (
              <div 
                key={idx}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-lg p-3.5 rounded-2xl text-xs ${
                    msg.sender === 'user'
                      ? 'bg-[#211E18] text-[#F5F0E6] border border-[#302B22]'
                      : 'bg-[#171717] text-[#F5F0E6] border border-[#D6AD60]/30'
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1 text-[10px] font-bold text-[#D6AD60]">
                    {msg.sender === 'ai' ? (
                      <>
                        <Sparkles className="w-3 h-3" />
                        <span>AI Coach</span>
                      </>
                    ) : (
                      <span>You (Practice)</span>
                    )}
                  </div>
                  <p className="leading-relaxed">{msg.text}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Input Box */}
          <div className="flex items-center gap-2">
            <input 
              type="text" 
              value={userCoachInput}
              onChange={(e) => setUserCoachInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendCoachMessage()}
              placeholder="Type your response to practice..." 
              className="flex-1 px-4 py-3 rounded-xl bg-[#111111] border border-[#302B22] text-xs text-[#F5F0E6] focus:outline-none focus:border-[#D6AD60]"
            />
            <button
              onClick={handleSendCoachMessage}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-[#D6AD60] to-[#F1D99F] text-[#090909] font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md shadow-[#D6AD60]/20"
            >
              <span>Test Response</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
