import React, { useState } from 'react';
import { 
  HeartHandshake, 
  Sparkles, 
  MessageSquare, 
  ShieldAlert, 
  Info,
  Clock,
  Compass,
  Smile,
  Send
} from 'lucide-react';
import { MOCK_PROFILES } from '../mockData';
import { UserProfile } from '../types';

interface TalkSomeoneViewProps {
  onOpenCrisisModal: () => void;
}

export const TalkSomeoneView: React.FC<TalkSomeoneViewProps> = ({ onOpenCrisisModal }) => {
  const [selectedTopic, setSelectedTopic] = useState('Casual Companionship');
  const [activeSession, setActiveSession] = useState(false);
  const [messages, setMessages] = useState<{ sender: string; text: string }[]>([
    {
      sender: 'Dinuk F. (Active Listener)',
      text: 'Hey there. No pressure to pretend everything is great. I’m here if you want to vent, share a story from your day, or just talk about movies.'
    }
  ]);
  const [inputVal, setInputVal] = useState('');

  const listenerProfile = MOCK_PROFILES.find(p => p.id === 'usr_dinuk') || MOCK_PROFILES[0];

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;

    // Safety check keyword filter (Sri Lankan emergency detection demo)
    const lower = inputVal.toLowerCase();
    if (lower.includes('hurt myself') || lower.includes('suicide') || lower.includes('end my life') || lower.includes('kill myself')) {
      onOpenCrisisModal();
      return;
    }

    setMessages(prev => [...prev, { sender: 'You', text: inputVal.trim() }]);
    setInputVal('');

    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        {
          sender: 'Dinuk F. (Active Listener)',
          text: 'Thank you for opening up about that. I hear you. Take all the time you need.'
        }
      ]);
    }, 1200);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-emerald-950/40 via-teal-950/30 to-slate-900 border border-emerald-500/30 rounded-3xl p-6 md:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                Emotional Sanctuary & Listening
              </span>
              <span className="text-xs text-slate-400">Zero Romantic Expectations</span>
            </div>
            <h2 className="text-2xl font-bold text-white mt-2">Someone to talk to.</h2>
            <p className="text-sm text-slate-300 mt-1 max-w-xl">
              You don’t have to pretend you’re okay. Connect with people willing to listen, 
              keep company, or share human presence without profile swiping.
            </p>
          </div>

          <button
            onClick={onOpenCrisisModal}
            className="flex items-center gap-2 px-4 py-2.5 bg-rose-500/10 border border-rose-500/40 hover:bg-rose-500/20 text-rose-300 rounded-xl text-xs font-semibold cursor-pointer transition flex-shrink-0"
          >
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            <span>Need Immediate Help?</span>
          </button>
        </div>
      </div>

      {/* Mood / Intention Selector */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { label: 'Casual Companionship', desc: 'Just want to chat about music, food or hobbies' },
          { label: 'Had a Rough Day', desc: 'Need a kind, non-judgmental ear to vent to' },
          { label: 'Feeling Isolated', desc: 'Late night loneliness; simply want warm presence' }
        ].map((item) => (
          <button
            key={item.label}
            onClick={() => setSelectedTopic(item.label)}
            className={`p-4 rounded-2xl border text-left transition cursor-pointer ${
              selectedTopic === item.label
                ? 'bg-emerald-950/30 border-emerald-500/50 text-white shadow-lg'
                : 'bg-[#121927] border-slate-800 text-slate-300 hover:border-slate-700'
            }`}
          >
            <span className="text-xs font-bold block">{item.label}</span>
            <span className="text-[11px] text-slate-400 mt-0.5 block">{item.desc}</span>
          </button>
        ))}
      </div>

      {/* Active Conversation or Match Lounge */}
      <div className="bg-[#121927] border border-slate-800 rounded-3xl p-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <img 
              src={listenerProfile.avatar} 
              alt={listenerProfile.name} 
              className="w-10 h-10 rounded-full object-cover border border-emerald-500/40"
            />
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-white">{listenerProfile.name}</h4>
                <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  Online Peer Listener
                </span>
              </div>
              <p className="text-[11px] text-slate-400">{listenerProfile.location} • Ideal: {listenerProfile.idealConversation}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Clock className="w-3.5 h-3.5" />
            <span>Asynchronous & Relaxed</span>
          </div>
        </div>

        {/* Message Log */}
        <div className="h-72 overflow-y-auto my-4 space-y-3 pr-2 no-scrollbar">
          {messages.map((m, idx) => (
            <div 
              key={idx} 
              className={`flex flex-col ${m.sender === 'You' ? 'items-end' : 'items-start'}`}
            >
              <span className="text-[10px] text-slate-500 mb-0.5">{m.sender}</span>
              <div className={`p-3 rounded-2xl text-xs max-w-[85%] ${
                m.sender === 'You'
                  ? 'bg-emerald-600 text-white rounded-tr-none'
                  : 'bg-slate-800/90 text-slate-200 rounded-tl-none border border-slate-700'
              }`}>
                {m.text}
              </div>
            </div>
          ))}
        </div>

        {/* Safety Note */}
        <div className="text-[11px] text-slate-400 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800 mb-3 flex items-center gap-2">
          <Info className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>
            This is a respectful companionship room. Conversations are confidential and strictly peer-to-peer.
          </span>
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="flex gap-2">
          <input
            type="text"
            placeholder="Type your message honestly without pressure..."
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
          <button
            type="submit"
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition shadow-md shadow-emerald-600/20"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send</span>
          </button>
        </form>
      </div>
    </div>
  );
};
