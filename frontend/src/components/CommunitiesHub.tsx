import React, { useState } from 'react';
import { 
  Users, 
  Radio, 
  Mic, 
  MessageSquare, 
  Lock, 
  Sparkles, 
  Plus, 
  Check, 
  Compass,
  ArrowRight
} from 'lucide-react';
import { MOCK_CIRCLES } from '../mockData';
import { SocialCircle } from '../types';

export const CommunitiesHub: React.FC = () => {
  const [circles, setCircles] = useState<SocialCircle[]>(MOCK_CIRCLES);
  const [activeCircle, setActiveCircle] = useState<SocialCircle | null>(MOCK_CIRCLES[0]);
  const [joinedCircles, setJoinedCircles] = useState<string[]>([MOCK_CIRCLES[0].id]);
  const [chatMessages, setChatMessages] = useState<{ id: string; sender: string; text: string; time: string }[]>([
    { id: '1', sender: 'Alex R.', text: 'What childhood dream did you guys let go of?', time: '10:14 PM' },
    { id: '2', sender: 'Tara P.', text: 'I wanted to be a wildlife documentary director. Real life steered me into commercial camera work.', time: '10:17 PM' },
    { id: '3', sender: 'Dinuk F.', text: 'Marine biology was my childhood dream, and I somehow managed to stick with it through all the chaos.', time: '10:20 PM' }
  ]);
  const [inputMessage, setInputMessage] = useState('');

  const toggleJoin = (circleId: string) => {
    if (joinedCircles.includes(circleId)) {
      setJoinedCircles(joinedCircles.filter(id => id !== circleId));
    } else {
      setJoinedCircles([...joinedCircles, circleId]);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;
    setChatMessages([
      ...chatMessages,
      {
        id: String(Date.now()),
        sender: 'You',
        text: inputMessage.trim(),
        time: 'Just now'
      }
    ]);
    setInputMessage('');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Intro Header */}
      <div className="bg-[#121927] border border-slate-800 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-bold text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
              Low-Pressure Belonging
            </span>
            <span className="text-xs text-slate-400">Strictly 5–10 Members</span>
          </div>
          <h2 className="text-2xl font-bold text-white mt-2">Micro Social Circles</h2>
          <p className="text-sm text-slate-300 mt-1 max-w-xl">
            1-on-1 interaction with a stranger can be intimidating. Social Circles give you a tight-knit, 
            low-stakes group of 5 to 10 peers focused on specific obsessions before building 1-on-1 friendships.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Circle List */}
        <div className="lg:col-span-5 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Available Circles</h3>
          
          <div className="space-y-3">
            {circles.map((circle) => {
              const isJoined = joinedCircles.includes(circle.id);
              const isSelected = activeCircle?.id === circle.id;

              return (
                <div
                  key={circle.id}
                  onClick={() => setActiveCircle(circle)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-gradient-to-r from-indigo-950/40 to-purple-950/40 border-indigo-500/60 shadow-lg'
                      : 'bg-[#121927] border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-white">{circle.name}</h4>
                        {circle.activeVoiceRoom && (
                          <span className="flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                            <Mic className="w-2.5 h-2.5" />
                            <span>Live Audio</span>
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-indigo-400 font-medium block mt-0.5">
                        {circle.topic}
                      </span>
                    </div>

                    <span className="text-xs font-mono text-slate-400 bg-slate-900 px-2 py-1 rounded-lg border border-slate-800">
                      {circle.membersCount}/{circle.maxMembers}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 mt-2 line-clamp-2">
                    {circle.description}
                  </p>

                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-800/80">
                    <div className="flex gap-1.5 flex-wrap">
                      {circle.tags.map(t => (
                        <span key={t} className="text-[10px] text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded">
                          #{t}
                        </span>
                      ))}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleJoin(circle.id);
                      }}
                      className={`text-xs px-2.5 py-1 rounded-lg font-medium transition cursor-pointer flex items-center gap-1 ${
                        isJoined
                          ? 'bg-slate-800 text-slate-300 border border-slate-700'
                          : 'bg-indigo-600 text-white hover:bg-indigo-500'
                      }`}
                    >
                      {isJoined ? <><Check className="w-3 h-3 text-emerald-400" /> Joined</> : 'Join Circle'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Active Circle Lounge & Asynchronous Conversation */}
        <div className="lg:col-span-7 bg-[#121927] border border-slate-800 rounded-3xl p-6 flex flex-col h-[640px]">
          {activeCircle ? (
            <>
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-white">{activeCircle.name}</h3>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                      {activeCircle.membersCount} connected
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{activeCircle.topic}</p>
                </div>

                {activeCircle.activeVoiceRoom && (
                  <button className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-semibold hover:bg-emerald-600/30 cursor-pointer transition">
                    <Mic className="w-3.5 h-3.5" />
                    <span>Join Voice Room</span>
                  </button>
                )}
              </div>

              {/* Weekly / Current Prompt */}
              <div className="bg-slate-900/90 border border-purple-500/30 rounded-2xl p-3 my-3">
                <span className="text-[10px] uppercase font-bold text-purple-400 tracking-wider block">
                  Current Circle Activity Prompt:
                </span>
                <p className="text-xs text-slate-200 mt-0.5 italic">
                  {activeCircle.currentActivity}
                </p>
              </div>

              {/* Chat Log */}
              <div className="flex-1 overflow-y-auto space-y-3 pr-2 my-2 no-scrollbar">
                {chatMessages.map((msg) => (
                  <div 
                    key={msg.id}
                    className={`flex flex-col ${msg.sender === 'You' ? 'items-end' : 'items-start'}`}
                  >
                    <div className="flex items-baseline gap-2 mb-0.5">
                      <span className="text-[11px] font-semibold text-slate-400">{msg.sender}</span>
                      <span className="text-[9px] text-slate-600">{msg.time}</span>
                    </div>
                    <div className={`p-3 rounded-2xl text-xs max-w-[85%] ${
                      msg.sender === 'You' 
                        ? 'bg-purple-600 text-white rounded-tr-none' 
                        : 'bg-slate-800/90 text-slate-200 rounded-tl-none border border-slate-700/60'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>

              {/* Input Box */}
              <form onSubmit={handleSendMessage} className="flex gap-2 pt-3 border-t border-slate-800">
                <input
                  type="text"
                  placeholder="Share a thoughtful response in this circle..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold cursor-pointer transition shadow-md shadow-indigo-600/30"
                >
                  Send
                </button>
              </form>
            </>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-500 text-sm">
              Select a circle from the list to enter the room.
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
