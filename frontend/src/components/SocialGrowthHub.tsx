import { useState } from 'react';
import { 
  Sparkles, 
  BookOpen, 
  Bot, 
  Send, 
  Mail, 
  CheckCircle2, 
  Circle, 
  HeartHandshake, 
  Award,
  ChevronRight,
  ShieldCheck,
  RefreshCw,
  Clock,
  Compass
} from 'lucide-react';
import { 
  MOCK_DAILY_HOPE, 
  MOCK_JOURNEY_DAYS, 
  MOCK_ACADEMY_LESSONS 
} from '../mockData';
import type { JourneyDay, AcademyLesson, FutureLetter } from '../types';

export const SocialGrowthHub = () => {
  // Sub-tabs in Social Growth
  const [activeSubSection, setActiveSubSection] = useState<'journey' | 'academy' | 'ai_companion' | 'future_letter'>('journey');

  // 30-Day Journey State
  const [journeyDays, setJourneyDays] = useState<JourneyDay[]>(MOCK_JOURNEY_DAYS);
  const [selectedDay, setSelectedDay] = useState<JourneyDay>(MOCK_JOURNEY_DAYS[3]); // Day 4

  // Academy State
  const [selectedLesson, setSelectedLesson] = useState<AcademyLesson>(MOCK_ACADEMY_LESSONS[0]);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);

  // AI Companion Coach State
  const [coachChat, setCoachChat] = useState<{ sender: 'user' | 'coach'; text: string; time: string }[]>([
    {
      sender: 'coach',
      text: "Hello! I am your private FRIENDS Companion. I am not here to replace human friends, but to help you prepare, practice, and feel confident before starting conversations with real people. What's on your mind today?",
      time: 'Just now'
    }
  ]);
  const [coachInput, setCoachInput] = useState('');

  // Future Letter State
  const [futureLetters, setFutureLetters] = useState<FutureLetter[]>([
    {
      id: 'let_1',
      writtenAt: 'Day 1 of Journey',
      unlockAfterDays: 30,
      content: 'I hope you are no longer terrified of initiating conversations in cafes. Remember how hard Day 1 felt? You made it.',
      status: 'locked'
    }
  ]);
  const [newLetterContent, setNewLetterContent] = useState('');
  const [letterSavedNotice, setLetterSavedNotice] = useState(false);

  const toggleDayCompletion = (dayNumber: number) => {
    setJourneyDays(prev => 
      prev.map(d => d.day === dayNumber ? { ...d, completed: !d.completed } : d)
    );
  };

  const handleSendToCoach = (e: React.FormEvent) => {
    e.preventDefault();
    if (!coachInput.trim()) return;

    const userMsg = coachInput.trim();
    setCoachChat(prev => [...prev, { sender: 'user', text: userMsg, time: 'Just now' }]);
    setCoachInput('');

    // Thoughtful, non-toxic AI coaching response
    setTimeout(() => {
      let coachReply = "That's a very normal concern. The key is to take the pressure off an outcome: you aren't trying to make someone your best friend in the first sentence. You're just offering a warm, low-stakes observation to test if they have social energy right now.";
      const lower = userMsg.toLowerCase();
      if (lower.includes('class') || lower.includes('girl') || lower.includes('stranger') || lower.includes('approach')) {
        coachReply = "Start with shared context. Rather than rehearsing a pickup line or dramatic speech, comment on something right in front of you both (the lecture, a book, the coffee line). Give them an easy out if they're busy—that actually makes you seem much safer and more approachable.";
      } else if (lower.includes('awkward') || lower.includes('overthink') || lower.includes('dry')) {
        coachReply = "Awkward pauses are normal human rhythms, not failure. When a conversation gets dry, ask an open curiosity question like: 'What's something you're getting completely obsessed with lately?' People love speaking about what genuinely sparks them.";
      }

      setCoachChat(prev => [...prev, { sender: 'coach', text: coachReply, time: 'Just now' }]);
    }, 900);
  };

  const handleSaveLetter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLetterContent.trim()) return;

    const letter: FutureLetter = {
      id: `let_${Date.now()}`,
      writtenAt: 'Today',
      unlockAfterDays: 30,
      content: newLetterContent.trim(),
      status: 'locked'
    };

    setFutureLetters([letter, ...futureLetters]);
    setNewLetterContent('');
    setLetterSavedNotice(true);
    setTimeout(() => setLetterSavedNotice(false), 3000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      
      {/* 1. Daily Hope & Purpose Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-950/60 via-indigo-950/40 to-slate-900 border border-purple-500/30 p-6 md:p-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs uppercase font-extrabold tracking-wider text-purple-400 bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20">
                Daily Hope & Philosophy
              </span>
              <span className="text-xs text-slate-400">Day 4 of Your Social Journey</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              "{MOCK_DAILY_HOPE.headline}"
            </h2>
            <p className="text-sm text-slate-300 mt-2 leading-relaxed italic">
              {MOCK_DAILY_HOPE.message}
            </p>
            <div className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-purple-300 bg-purple-900/30 border border-purple-700/40 px-3.5 py-1.5 rounded-xl">
              <Compass className="w-4 h-4 text-purple-400" />
              <span>Today's Little Step: {MOCK_DAILY_HOPE.actionPrompt}</span>
            </div>
          </div>

          <div className="bg-[#0f1422] border border-slate-800 p-4 rounded-2xl flex-shrink-0 text-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">The FRIENDS Promise</span>
            <p className="text-xs text-slate-200 mt-1 max-w-[200px] leading-tight">
              We never try to fix introversion. We help you develop the freedom to connect when you want to.
            </p>
          </div>
        </div>
      </div>

      {/* 2. Sub-Navigation Bar */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
        {[
          { id: 'journey', label: '30-Day Social Journey', icon: Award },
          { id: 'academy', label: 'Friendship Academy', icon: BookOpen },
          { id: 'ai_companion', label: 'AI Conversation Coach', icon: Bot },
          { id: 'future_letter', label: 'Letters to Future Self', icon: Mail }
        ].map((sub) => {
          const Icon = sub.icon;
          const isActive = activeSubSection === sub.id;
          return (
            <button
              key={sub.id}
              onClick={() => setActiveSubSection(sub.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition cursor-pointer ${
                isActive
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                  : 'bg-slate-900 text-slate-300 border border-slate-800 hover:border-slate-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{sub.label}</span>
            </button>
          );
        })}
      </div>

      {/* 3. SECTION CONTENT */}

      {/* SUB-SECTION A: 30-DAY SOCIAL TRANSFORMATION JOURNEY */}
      {activeSubSection === 'journey' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: 30-Day Steps Timeline */}
          <div className="lg:col-span-5 space-y-3">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Your Progress Timeline</h3>
              <span className="text-xs text-purple-400 font-mono">3 / 30 Completed</span>
            </div>

            <div className="space-y-2 max-h-[580px] overflow-y-auto pr-1 no-scrollbar">
              {journeyDays.map((d) => {
                const isSelected = selectedDay.day === d.day;
                return (
                  <div
                    key={d.day}
                    onClick={() => setSelectedDay(d)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected 
                        ? 'bg-gradient-to-r from-purple-950/40 to-indigo-950/40 border-purple-500/60 shadow-md' 
                        : 'bg-[#121927] border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleDayCompletion(d.day);
                        }}
                        className="cursor-pointer"
                        title="Mark Complete"
                      >
                        {d.completed ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        ) : (
                          <Circle className="w-5 h-5 text-slate-600 hover:text-slate-400" />
                        )}
                      </button>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] uppercase font-bold text-slate-400">Day {d.day}</span>
                          <span className="text-[10px] text-purple-400 font-semibold">{d.stageTitle}</span>
                        </div>
                        <h4 className={`text-xs font-bold ${d.completed ? 'text-slate-400 line-through' : 'text-white'}`}>
                          {d.title}
                        </h4>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-500" />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Selected Day Deep-Dive */}
          <div className="lg:col-span-7 bg-[#121927] border border-slate-800 rounded-3xl p-6 md:p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <span className="text-xs uppercase font-extrabold text-purple-400 tracking-wider">
                    {selectedDay.stageTitle}
                  </span>
                  <h3 className="text-xl font-black text-white mt-1">
                    Day {selectedDay.day}: {selectedDay.title}
                  </h3>
                </div>
                <button
                  onClick={() => toggleDayCompletion(selectedDay.day)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition ${
                    selectedDay.completed
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-purple-600 text-white hover:bg-purple-500'
                  }`}
                >
                  {selectedDay.completed ? 'Completed' : 'Mark as Done'}
                </button>
              </div>

              {/* Component 1: Daily Mini-Lesson */}
              <div className="mt-6 space-y-4">
                <div>
                  <h4 className="text-xs uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5 mb-2">
                    <BookOpen className="w-4 h-4 text-indigo-400" />
                    <span>Today's Lesson</span>
                  </h4>
                  <p className="text-sm text-slate-200 leading-relaxed bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
                    {selectedDay.lesson}
                  </p>
                </div>

                {/* Component 2: Practical Social Challenge */}
                <div>
                  <h4 className="text-xs uppercase font-bold text-amber-400 tracking-wider flex items-center gap-1.5 mb-2">
                    <Award className="w-4 h-4 text-amber-400" />
                    <span>Actionable Challenge</span>
                  </h4>
                  <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-900/40 text-xs text-amber-200/90 leading-relaxed font-medium">
                    {selectedDay.challenge}
                  </div>
                </div>

                {/* Component 3: Reflection Prompt */}
                <div>
                  <h4 className="text-xs uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5 mb-2">
                    <Compass className="w-4 h-4 text-purple-400" />
                    <span>Evening Reflection</span>
                  </h4>
                  <textarea
                    rows={3}
                    placeholder={`Reflect: ${selectedDay.reflectionPrompt}`}
                    className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
              <span>Take it at your own rhythm. Skipping or repeating days is always supported.</span>
              <span className="text-purple-400 font-semibold">Effort &gt; Popularity</span>
            </div>
          </div>
        </div>
      )}

      {/* SUB-SECTION B: THE FRIENDSHIP ACADEMY */}
      {activeSubSection === 'academy' && (
        <div className="space-y-6">
          <div className="bg-[#121927] border border-slate-800 rounded-3xl p-6">
            <h3 className="text-lg font-bold text-white mb-1">The Friendship Academy</h3>
            <p className="text-xs text-slate-400">
              Interactive situations with actionable scripts. Learn what to say, why it works, and how to build connection naturally.
            </p>

            {/* Course Selector */}
            <div className="flex gap-2 mt-4 overflow-x-auto pb-2 no-scrollbar">
              {MOCK_ACADEMY_LESSONS.map((l) => (
                <button
                  key={l.id}
                  onClick={() => {
                    setSelectedLesson(l);
                    setSelectedOptionId(null);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap cursor-pointer transition ${
                    selectedLesson.id === l.id
                      ? 'bg-purple-600 text-white'
                      : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
                  }`}
                >
                  {l.category}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Lesson Card */}
          <div className="bg-[#121927] border border-purple-500/30 rounded-3xl p-6 md:p-8 space-y-6">
            <div>
              <span className="text-[10px] uppercase font-bold text-purple-400 tracking-wider">
                Scenario Simulation
              </span>
              <h4 className="text-xl font-bold text-white mt-1">{selectedLesson.title}</h4>
              <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl text-xs text-slate-300 mt-3 italic leading-relaxed">
                "{selectedLesson.scenario}"
              </div>
            </div>

            <div>
              <h5 className="text-sm font-semibold text-white mb-3">{selectedLesson.question}</h5>
              <div className="space-y-3">
                {selectedLesson.options.map((opt) => {
                  const isSelected = selectedOptionId === opt.id;
                  return (
                    <div
                      key={opt.id}
                      onClick={() => setSelectedOptionId(opt.id)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                        isSelected
                          ? opt.isRecommended
                            ? 'bg-emerald-950/30 border-emerald-500/50'
                            : 'bg-rose-950/30 border-rose-500/50'
                          : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-slate-200">{opt.text}</span>
                        {isSelected && (
                          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                            opt.isRecommended ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                          }`}>
                            {opt.isRecommended ? 'Constructive Choice' : 'Common Pitfall'}
                          </span>
                        )}
                      </div>

                      {/* Explanation Feedback */}
                      {isSelected && (
                        <p className={`text-xs mt-3 pt-3 border-t ${
                          opt.isRecommended ? 'border-emerald-800/40 text-emerald-300' : 'border-rose-800/40 text-rose-300'
                        }`}>
                          {opt.feedback}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-SECTION C: AI CONVERSATION PRACTICE & COACH */}
      {activeSubSection === 'ai_companion' && (
        <div className="bg-[#121927] border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">FRIENDS Companion & Conversation Lab</h3>
                <p className="text-xs text-slate-400">
                  A private training sandbox. Practice first messages, unpack social hesitation, and get actionable coaching.
                </p>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Strictly Private & Educational</span>
            </div>
          </div>

          {/* Chat Transcript */}
          <div className="h-80 overflow-y-auto space-y-3 pr-2 no-scrollbar">
            {coachChat.map((m, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <span className="text-[10px] text-slate-500 mb-0.5">
                  {m.sender === 'user' ? 'You' : 'FRIENDS Coach'}
                </span>
                <div className={`p-3.5 rounded-2xl text-xs max-w-[85%] leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-purple-600 text-white rounded-tr-none'
                    : 'bg-slate-900/90 text-slate-200 rounded-tl-none border border-slate-800'
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
          </div>

          {/* Quick Practice Prompts */}
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="text-slate-500 text-[11px] self-center">Try asking:</span>
            {[
              "I want to talk to a classmate but I'm terrified.",
              "Someone replied with 'I'm good wbu'. How do I keep it going?",
              "How do I deal with someone ghosting me without feeling worthless?"
            ].map((q) => (
              <button
                key={q}
                onClick={() => setCoachInput(q)}
                className="bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 px-3 py-1 rounded-xl cursor-pointer text-[11px] transition"
              >
                "{q}"
              </button>
            ))}
          </div>

          {/* Coach Input Bar */}
          <form onSubmit={handleSendToCoach} className="flex gap-2">
            <input
              type="text"
              placeholder="Ask anything or practice a conversation script..."
              value={coachInput}
              onChange={(e) => setCoachInput(e.target.value)}
              className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />
            <button
              type="submit"
              className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-md shadow-purple-600/30 transition"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send</span>
            </button>
          </form>
        </div>
      )}

      {/* SUB-SECTION D: LETTERS TO MY FUTURE SELF */}
      {activeSubSection === 'future_letter' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-6 bg-[#121927] border border-slate-800 rounded-3xl p-6 md:p-8 space-y-4">
            <div className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-indigo-400" />
              <h3 className="text-base font-bold text-white">Write to Your Future Self</h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Record where you are right now. Your fears, your hopes, and what you wish for your future social life. 
              We will seal it and deliver it back to you in 30 days.
            </p>

            <form onSubmit={handleSaveLetter} className="space-y-4">
              <textarea
                rows={6}
                value={newLetterContent}
                onChange={(e) => setNewLetterContent(e.target.value)}
                placeholder="Dear Future Me, I hope you are no longer so hard on yourself. I hope you've introduced yourself to at least one new person..."
                className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 leading-relaxed"
              />

              <button
                type="submit"
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold cursor-pointer shadow-md shadow-indigo-600/20 transition"
              >
                Seal & Lock Letter for 30 Days
              </button>

              {letterSavedNotice && (
                <div className="p-3 bg-emerald-950/40 border border-emerald-800/50 rounded-xl text-emerald-300 text-xs text-center">
                  Your letter has been securely sealed. It will open in 30 days!
                </div>
              )}
            </form>
          </div>

          <div className="lg:col-span-6 space-y-4">
            <h4 className="text-xs uppercase font-bold text-slate-400 tracking-wider">Your Sealed Time Capsules</h4>
            <div className="space-y-3">
              {futureLetters.map((l) => (
                <div key={l.id} className="bg-[#121927] border border-slate-800 rounded-2xl p-5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-purple-400">Written on {l.writtenAt}</span>
                    <span className="text-xs bg-slate-900 px-2 py-0.5 rounded-md text-slate-400 border border-slate-800 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>Unlocks in {l.unlockAfterDays} days</span>
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 italic blur-xs hover:blur-none transition duration-300 cursor-pointer select-none">
                    "{l.content}"
                  </p>
                  <span className="text-[10px] text-slate-500 block pt-1">
                    (Hover or tap to preview your sealed words)
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
