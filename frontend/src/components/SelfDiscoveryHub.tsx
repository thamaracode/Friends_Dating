import React, { useState } from 'react';
import { 
  Sparkles, 
  Share2, 
  HelpCircle, 
  CheckCircle, 
  Send, 
  Copy, 
  Award,
  Flame,
  ArrowRight
} from 'lucide-react';
import { CURRENT_USER, MOCK_CHALLENGES, MOCK_ANON_QUESTIONS } from '../mockData';
import { SocialChallenge, AnonymousQuestion } from '../types';

export const SelfDiscoveryHub: React.FC = () => {
  const [challenges, setChallenges] = useState<SocialChallenge[]>(MOCK_CHALLENGES);
  const [anonQuestions, setAnonQuestions] = useState<AnonymousQuestion[]>(MOCK_ANON_QUESTIONS);
  const [newQuestionInput, setNewQuestionInput] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  const toggleChallenge = (level: number) => {
    setChallenges(prev => 
      prev.map(c => c.level === level ? { ...c, completed: !c.completed } : c)
    );
  };

  const handleCreateQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestionInput.trim()) return;
    const newQ: AnonymousQuestion = {
      id: `q_${Date.now()}`,
      question: newQuestionInput.trim(),
      authorNote: 'Generated prompt for social circle or bio link',
      responses: []
    };
    setAnonQuestions([newQ, ...anonQuestions]);
    setNewQuestionInput('');
  };

  const copyProfileShareLink = () => {
    navigator.clipboard.writeText(`https://friends.app/@${CURRENT_USER.id}`);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Top Banner: Philosophy of Zero-User Discovery */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-900/40 via-indigo-900/30 to-slate-900 border border-purple-500/30 p-6 md:p-8">
        <div className="max-w-2xl">
          <span className="text-xs font-semibold tracking-wider uppercase text-purple-400 bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20">
            Day-0 Meaningful Space
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white mt-3">
            Your world is bigger than matches.
          </h2>
          <p className="text-sm text-slate-300 mt-2 leading-relaxed">
            Even before anyone is nearby, FRIENDS is a place to map your communication DNA, 
            run social experiments, and share thought-provoking questions with friends outside the app.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Personality Card & Share Engine */}
        <div className="lg:col-span-5 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              <span>Shareable Personality Card</span>
            </h3>
            <span className="text-xs text-purple-400">Viral Engine</span>
          </div>

          {/* High-Fidelity Social Card for Stories / IG */}
          <div className="relative rounded-3xl p-6 bg-gradient-to-b from-[#181d2f] via-[#121624] to-[#0c0f18] border border-purple-500/40 shadow-2xl overflow-hidden group">
            {/* Ambient Glows */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest">
                  FRIENDS Identity DNA
                </span>
                <h4 className="text-lg font-extrabold text-white">{CURRENT_USER.name}</h4>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                friends.app/@kavindu
              </span>
            </div>

            {/* Metrics Graph */}
            <div className="py-5 space-y-3.5">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300">Introvert vs Extrovert</span>
                  <span className="text-purple-300 font-semibold">82% Introvert</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-gradient-to-r from-purple-500 to-indigo-500 h-full w-[82%]" />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300">Preference for Depth</span>
                  <span className="text-indigo-300 font-semibold">91% Deep Chats</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-gradient-to-r from-indigo-500 to-sky-500 h-full w-[91%]" />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300">Nocturnal Energy</span>
                  <span className="text-emerald-300 font-semibold">95% Night Owl</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full w-[95%]" />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300">Humor Preference</span>
                  <span className="text-amber-300 font-semibold">Dark & Absurdist</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-gradient-to-r from-amber-500 to-rose-500 h-full w-[78%]" />
                </div>
              </div>
            </div>

            {/* Quote of the Card */}
            <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-2xl mb-4">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Communication Rule:</span>
              <p className="text-xs text-slate-200 italic mt-0.5">
                "Direct, honest questions are always welcome. No small talk required."
              </p>
            </div>

            {/* Sharing Action */}
            <div className="flex gap-2">
              <button 
                onClick={copyProfileShareLink}
                className="flex-1 py-2.5 px-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-lg shadow-purple-600/30"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>{copiedLink ? 'Copied Bio Link!' : 'Export Card for Instagram'}</span>
              </button>
              <button
                onClick={copyProfileShareLink}
                className="px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs flex items-center justify-center border border-slate-700 cursor-pointer"
                title="Copy Public Link"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              onClick={() => { window.location.hash = '#personality'; }}
              className="w-full mt-2 py-2.5 px-3 bg-white/10 hover:bg-white/15 text-white border border-white/15 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md hover:scale-[1.01] active:scale-[0.99]"
            >
              <span>Explore Personality & EI Sanctuary</span>
              <span className="text-purple-400">→</span>
            </button>
          </div>

          {/* Public Profile Link Explanation */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 text-xs text-slate-400">
            <span className="font-semibold text-slate-300 block mb-1">Personal Profile URL:</span>
            <code className="text-purple-400 bg-slate-950 px-2 py-1 rounded block mb-2 font-mono">
              https://friends.app/@kavindu
            </code>
            Share this link in your Instagram bio, WhatsApp status, or Discord. 
            Visitors can read your likes, dislikes, and send respectful anonymous responses without needing an account.
          </div>
        </div>

        {/* Right Column: Social Growth Challenge Ladder & Anonymous Prompts */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* Social Growth System */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-400" />
                  <span>Social Agency Progression</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Build confidence and conversational agency at your own pace without pressure.
                </p>
              </div>
              <div className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full text-xs font-semibold text-amber-300">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                <span>Level 2 / 5</span>
              </div>
            </div>

            <div className="space-y-3">
              {challenges.map((c) => (
                <div 
                  key={c.level}
                  onClick={() => toggleChallenge(c.level)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                    c.completed 
                      ? 'bg-slate-900/40 border-slate-800 text-slate-400' 
                      : 'bg-[#121927] border-purple-500/30 hover:border-purple-500/60 text-slate-200'
                  }`}
                >
                  <div className="mt-0.5">
                    {c.completed ? (
                      <CheckCircle className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-slate-600 flex items-center justify-center text-[10px] font-bold text-slate-400">
                        {c.level}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className={`text-sm font-semibold ${c.completed ? 'line-through text-slate-500' : 'text-white'}`}>
                        {c.title}
                      </h4>
                      <span className="text-[11px] font-mono text-purple-400">+{c.xp} XP</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">{c.description}</p>
                    <div className="mt-2 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                      Goal: {c.targetAction}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Anonymous Prompts & Social Q&A */}
          <div className="border-t border-slate-800 pt-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-2">
              <HelpCircle className="w-5 h-5 text-sky-400" />
              <span>Ask Me Anything / Anonymous Prompts</span>
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Ask deep questions to your extended network. Real thoughts, filtered for safety and respect.
            </p>

            {/* Prompt Creator */}
            <form onSubmit={handleCreateQuestion} className="flex gap-2 mb-6">
              <input
                type="text"
                placeholder="Write a thought-provoking prompt (e.g. 'What is a book that changed you?')"
                value={newQuestionInput}
                onChange={(e) => setNewQuestionInput(e.target.value)}
                className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
              <button
                type="submit"
                className="px-4 py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Post</span>
              </button>
            </form>

            {/* Existing Questions & Responses */}
            <div className="space-y-4">
              {anonQuestions.map((q) => (
                <div key={q.id} className="bg-[#121927] border border-slate-800 rounded-2xl p-5">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-semibold text-white">"{q.question}"</p>
                    <button 
                      onClick={copyProfileShareLink}
                      className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 flex-shrink-0 cursor-pointer"
                    >
                      <Share2 className="w-3 h-3" />
                      <span>Share Link</span>
                    </button>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{q.authorNote}</p>

                  {/* Anonymous Responses */}
                  <div className="mt-4 space-y-2 border-t border-slate-800/80 pt-3">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      Anonymous Submissions ({q.responses.length})
                    </span>
                    {q.responses.map((resp) => (
                      <div key={resp.id} className="bg-slate-900/80 rounded-xl p-3 border border-slate-800">
                        <p className="text-xs text-slate-300 italic">"{resp.text}"</p>
                        <span className="text-[10px] text-slate-500 mt-1 block">{resp.timestamp}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
