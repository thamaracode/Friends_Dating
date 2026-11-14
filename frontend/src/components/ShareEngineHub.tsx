import { useState, useRef } from 'react';
import { 
  Sparkles, 
  Share2, 
  Copy, 
  Check, 
  Heart, 
  Flame, 
  MessageCircle, 
  HelpCircle, 
  Users, 
  ExternalLink,
  Sliders,
  Send,
  Eye,
  Smile,
  Compass,
  Award
} from 'lucide-react';
import { CURRENT_USER } from '../mockData';
import type { FriendshipWishlist, FriendQuizQuestion } from '../types';

export const ShareEngineHub = () => {
  const [activeTab, setActiveTab] = useState<'identity_card' | 'wishlist' | 'know_me_quiz' | 'ama_link'>('identity_card');
  const [copiedLink, setCopiedLink] = useState(false);
  const [downloadNotice, setDownloadNotice] = useState<string | null>(null);
  const [copiedMessageIndex, setCopiedMessageIndex] = useState<number | null>(null);

  // Identity Card Customization
  const [cardTheme, setCardTheme] = useState<'neon_violet' | 'midnight_amber' | 'emerald_noir'>('neon_violet');
  const [vibeTagline, setVibeTagline] = useState('Professional overthinker. Amateur philosopher. Sends 17 memes before saying hello.');

  const handleDownloadStory = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1920;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const grad = ctx.createLinearGradient(0, 0, 1080, 1920);
      grad.addColorStop(0, '#0f0a1c');
      grad.addColorStop(0.5, '#190e2b');
      grad.addColorStop(1, '#080511');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 1080, 1920);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.strokeStyle = '#D6AD60';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.roundRect(100, 240, 880, 1440, 48);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 54px sans-serif';
      ctx.fillText(CURRENT_USER.name, 160, 420);

      ctx.fillStyle = '#D6AD60';
      ctx.font = '36px sans-serif';
      ctx.fillText(`@${CURRENT_USER.username} • Soulverse`, 160, 480);

      ctx.fillStyle = '#E2E8F0';
      ctx.font = '38px sans-serif';
      ctx.fillText(`"${vibeTagline.slice(0, 60)}..."`, 160, 620);

      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `soulverse-story-card-${Date.now()}.png`;
          a.click();
          URL.revokeObjectURL(url);
          setDownloadNotice('High-resolution 1080x1920 Instagram Story PNG rendered and downloaded!');
          setTimeout(() => setDownloadNotice(null), 4000);
        }
      });
    }
  };

  // Wishlist State ("The People I Want In My Life")
  const [wishlist, setWishlist] = useState<FriendshipWishlist>({
    lookingFor: [
      'Late-night tea & deep discussions',
      'Random spontaneous adventures',
      'Terrible puns & dark humor',
      'People building weird side projects'
    ],
    couldTalkHoursAbout: [
      'Indie game lore & mechanics',
      'Psychology of human connection',
      'Cinematography in 90s anime'
    ],
    wantToExperience: [
      'A nocturnal road trip with zero phone scrolling',
      'Co-founding a cozy physical community space'
    ],
    appreciatePeopleWho: [
      'Communicate directly without games',
      'Are comfortable with comfortable silence'
    ],
    unnecessaryPassionateOpinion: 'Dark chocolate with sea salt is strictly superior to milk chocolate in every universe.',
    idealWeekend: 'Rainy Saturday night, coding a passion project or having a 3-hour unstructured conversation.'
  });

  // "How Well Do You Know Me?" Interactive Quiz State
  const [quizQuestions, setQuizQuestions] = useState<FriendQuizQuestion[]>([
    {
      id: 'q1',
      question: 'What would I do if I suddenly woke up with $1,000,000?',
      options: [
        'Buy a supercar and flex on Instagram',
        'Disappear to a cozy misty mountain cabin and fund indie art',
        'Invest 100% in meme crypto coins',
        'Throw a 500-person party'
      ],
      correctOptionIndex: 1
    },
    {
      id: 'q2',
      question: 'What is my actual secret communication superpower?',
      options: [
        'Remembering a tiny detail you mentioned 6 months ago',
        'Always replying in 0.2 seconds',
        'Giving smooth speeches in front of 1,000 people',
        'Winning every debate'
      ],
      correctOptionIndex: 0
    },
    {
      id: 'q3',
      question: 'My ideal friendship dynamic is:',
      options: [
        'Partying every single Friday night',
        'Talking every 3 weeks like no time has passed at all',
        'Texting 24/7 non-stop',
        'Only seeing each other at formal networking events'
      ],
      correctOptionIndex: 1
    }
  ]);
  const [quizPreviewAnswers, setQuizPreviewAnswers] = useState<Record<string, number>>({});
  const [quizScore, setQuizScore] = useState<number | null>(null);

  // Copy helper
  const handleCopy = (text: string, index?: number) => {
    navigator.clipboard.writeText(text);
    if (typeof index === 'number') {
      setCopiedMessageIndex(index);
      setTimeout(() => setCopiedMessageIndex(null), 2500);
    } else {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const sharePhrases = [
    {
      label: 'Casual WhatsApp',
      text: "Found this platform called FRIENDS. It's about self-discovery and finding people you actually connect with. Made my profile & card—curious what yours looks like 😂 https://friends.app/@kavindu"
    },
    {
      label: 'Instagram Story / Bio',
      text: "Your personality deserves more than a 2-line bio. Made my FRIENDS identity card. Check out my friendship wishlist & ask me anything: https://friends.app/@kavindu 👀"
    },
    {
      label: 'Group Chat Roast',
      text: "Everyone make a FRIENDS identity card. I built a quiz to test who in this chat actually knows me: https://friends.app/@kavindu/quiz 💀"
    },
    {
      label: 'Meaningful & Sincere',
      text: "I think meeting good people genuinely changes your life. Sharing my connection wishlist on FRIENDS. Check it out: https://friends.app/@kavindu"
    }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {downloadNotice && (
        <div className="p-4 bg-purple-500/10 border border-purple-500/30 text-purple-300 rounded-2xl text-xs flex items-center gap-2.5 shadow-lg animate-in fade-in slide-in-from-top-2">
          <Check className="w-4 h-4 flex-shrink-0 text-purple-400" />
          <span className="font-semibold">{downloadNotice}</span>
        </div>
      )}
      
      {/* 1. Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-rose-950/40 via-purple-950/40 to-slate-900 border border-purple-500/30 p-6 md:p-8">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs uppercase font-extrabold tracking-wider text-rose-400 bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/20">
              Self-Expression & Viral Identity
            </span>
            <span className="text-xs text-slate-400">Share Pride, Not Desperation</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
            An app people are proud to show.
          </h2>
          <p className="text-sm text-slate-300 mt-2 leading-relaxed">
            Nobody wants to post: <span className="italic text-rose-300">"Please join, I'm lonely."</span> That feels uncomfortable. 
            Instead, share your authentic humor, friendship wishlist, and quiz so friends say: 
            <span className="font-semibold text-white"> "Wait, that's so you."</span>
          </p>
        </div>
      </div>

      {/* 2. Sub-Tabs Bar */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
        {[
          { id: 'identity_card', label: '1. Personality Identity Card', icon: Sparkles },
          { id: 'wishlist', label: '2. The People I Want in My Life', icon: Heart },
          { id: 'know_me_quiz', label: '3. "How Well Do You Know Me?" Quiz', icon: HelpCircle },
          { id: 'ama_link', label: '4. Public Profile & Pre-written Messages', icon: Share2 }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/30'
                  : 'bg-slate-900 text-slate-300 border border-slate-800 hover:border-slate-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 3. TAB 1: IDENTITY CARD (Aesthetic Story Card) */}
      {activeTab === 'identity_card' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Card Preview (Styled for 9:16 Instagram Story or WhatsApp status) */}
          <div className="lg:col-span-5 flex justify-center">
            <div className={`relative w-full max-w-sm rounded-[32px] p-7 border shadow-2xl transition-all duration-300 ${
              cardTheme === 'neon_violet'
                ? 'bg-gradient-to-b from-[#1b1531] via-[#120f24] to-[#0a0714] border-purple-500/50 shadow-purple-500/20'
                : cardTheme === 'midnight_amber'
                ? 'bg-gradient-to-b from-[#2b1f13] via-[#181109] to-[#0d0905] border-amber-500/50 shadow-amber-500/20'
                : 'bg-gradient-to-b from-[#0c221a] via-[#081711] to-[#040d09] border-emerald-500/50 shadow-emerald-500/20'
            }`}>
              
              {/* Card Watermark & Branding */}
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-rose-500 to-purple-500 flex items-center justify-center">
                    <Sparkles className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span className="text-xs font-black tracking-widest uppercase text-white/90">
                    FRIENDS IDENTITY
                  </span>
                </div>
                <span className="text-[10px] font-mono bg-white/10 px-2 py-0.5 rounded-full text-slate-300">
                  friends.app/@kavindu
                </span>
              </div>

              {/* Profile Bio & Tagline */}
              <div className="mt-6 text-center">
                <img 
                  src={CURRENT_USER.avatar} 
                  alt={CURRENT_USER.name} 
                  className="w-20 h-20 rounded-full mx-auto object-cover border-2 border-white/20 shadow-md mb-3"
                />
                <h3 className="text-xl font-extrabold text-white tracking-tight">{CURRENT_USER.name}</h3>
                <p className="text-xs text-purple-300/90 font-medium mt-0.5">{CURRENT_USER.location}</p>
                <p className="text-xs text-slate-300 italic mt-3 bg-white/5 p-3 rounded-2xl border border-white/10 leading-relaxed">
                  "{vibeTagline}"
                </p>
              </div>

              {/* Archetype Metrics */}
              <div className="my-6 space-y-3 text-xs">
                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-slate-400">Social Battery:</span>
                    <span className="text-white font-semibold">82% Introvert / Recharge Alone</span>
                  </div>
                  <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-gradient-to-r from-purple-400 to-pink-400 h-full w-[82%]" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-slate-400">Conversation Style:</span>
                    <span className="text-white font-semibold">91% Deep Dives & Nuance</span>
                  </div>
                  <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-gradient-to-r from-indigo-400 to-sky-400 h-full w-[91%]" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-slate-400">Circadian Rhythm:</span>
                    <span className="text-white font-semibold">95% Nocturnal Thinker</span>
                  </div>
                  <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-gradient-to-r from-emerald-400 to-teal-400 h-full w-[95%]" />
                  </div>
                </div>
              </div>

              {/* Micro Tags */}
              <div className="pt-2 border-t border-white/10">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-2">
                  Obsessions:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {CURRENT_USER.interests.slice(0, 4).map(i => (
                    <span key={i} className="text-[10px] bg-white/10 text-slate-200 px-2 py-0.5 rounded-md">
                      #{i}
                    </span>
                  ))}
                </div>
              </div>

              {/* Bottom Stamp */}
              <div className="mt-6 text-center text-[10px] text-slate-400">
                Tap to find your people & see common ground
              </div>
            </div>
          </div>

          {/* Controls & Customization */}
          <div className="lg:col-span-7 bg-[#121927] border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6">
            <div>
              <h3 className="text-lg font-bold text-white mb-1">Customize Your Story Card</h3>
              <p className="text-xs text-slate-400">
                Create a card that actually sounds like you. Not a marketing banner.
              </p>
            </div>

            {/* Theme Picker */}
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-2">Color Aesthetic</label>
              <div className="flex gap-3">
                {[
                  { id: 'neon_violet', label: 'Neon Violet', color: 'from-purple-600 to-pink-600' },
                  { id: 'midnight_amber', label: 'Warm Amber', color: 'from-amber-600 to-rose-600' },
                  { id: 'emerald_noir', label: 'Emerald Noir', color: 'from-emerald-600 to-teal-600' }
                ].map((th) => (
                  <button
                    key={th.id}
                    onClick={() => setCardTheme(th.id as any)}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 border cursor-pointer transition ${
                      cardTheme === th.id
                        ? 'border-purple-400 bg-slate-800 text-white'
                        : 'border-slate-800 bg-slate-900 text-slate-400'
                    }`}
                  >
                    <span className={`w-3 h-3 rounded-full bg-gradient-to-r ${th.color}`} />
                    <span>{th.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Tagline input */}
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-2">Vibe Tagline / Self-Roast</label>
              <input
                type="text"
                value={vibeTagline}
                onChange={(e) => setVibeTagline(e.target.value)}
                placeholder="e.g. Professional overthinker. Sends 17 memes before saying hello."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => handleCopy(`https://friends.app/@${CURRENT_USER.id}`)}
                className="flex-1 py-3 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 cursor-pointer transition"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                <span>{copiedLink ? 'Copied Shareable Link!' : 'Copy Link for Instagram Bio / Story'}</span>
              </button>

              <button
                onClick={handleDownloadStory}
                className="py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold cursor-pointer transition"
              >
                Download Story Image (1080x1920)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. TAB 2: THE PEOPLE I WANT IN MY LIFE (Connection Manifesto) */}
      {activeTab === 'wishlist' && (
        <div className="bg-[#121927] border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-rose-400" />
                <h3 className="text-xl font-bold text-white">The People I Want in My Life</h3>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Your personal connection manifesto. A clear, unapologetic window into what makes you click.
              </p>
            </div>

            <button
              onClick={() => handleCopy(`Check out the kind of friends I'm looking for in my life: https://friends.app/@kavindu/wishlist`)}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition shadow-md shadow-rose-600/20"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share Wishlist Card</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Box 1: Looking for friends who... */}
            <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl">
              <span className="text-[11px] font-bold text-purple-400 uppercase tracking-wider block mb-2">
                I want friends who:
              </span>
              <ul className="space-y-2 text-xs text-slate-200">
                {wishlist.lookingFor.map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-purple-400 mt-0.5">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Box 2: I could talk for hours about... */}
            <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl">
              <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider block mb-2">
                I could talk for 6 hours about:
              </span>
              <ul className="space-y-2 text-xs text-slate-200">
                {wishlist.couldTalkHoursAbout.map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-indigo-400 mt-0.5">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Box 3: What I want to experience */}
            <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl">
              <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block mb-2">
                Things I want to experience with people:
              </span>
              <ul className="space-y-2 text-xs text-slate-200">
                {wishlist.wantToExperience.map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-emerald-400 mt-0.5">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Box 4: Unnecessary Passionate Opinion */}
            <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl">
              <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block mb-2">
                My most unnecessary but passionate opinion:
              </span>
              <p className="text-xs text-slate-300 italic leading-relaxed">
                "{wishlist.unnecessaryPassionateOpinion}"
              </p>
              <div className="mt-3 pt-3 border-t border-slate-800 text-[11px] text-slate-400">
                <span className="font-semibold text-slate-300">Ideal Weekend: </span>
                {wishlist.idealWeekend}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. TAB 3: "HOW WELL DO YOU KNOW ME?" QUIZ */}
      {activeTab === 'know_me_quiz' && (
        <div className="bg-[#121927] border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-sky-400" />
                <h3 className="text-xl font-bold text-white">How Well Do Your Friends Know You?</h3>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Share this interactive quiz to WhatsApp group chats or Instagram. Friends compete to see who knows you best without needing an account.
              </p>
            </div>

            <button
              onClick={() => handleCopy(`Take my "How Well Do You Know Me" quiz: https://friends.app/@kavindu/quiz`)}
              className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition shadow-md shadow-sky-600/20"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copy Quiz Link</span>
            </button>
          </div>

          {/* Interactive Simulation of What Friends See */}
          <div className="space-y-5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
              Quiz Preview (What your friends see when they click):
            </span>

            {quizQuestions.map((q, idx) => (
              <div key={q.id} className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-white">
                    {idx + 1}. {q.question}
                  </h4>
                  <span className="text-[10px] text-purple-400 font-mono">100 Points</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {q.options.map((opt, optIdx) => {
                    const isSelected = quizPreviewAnswers[q.id] === optIdx;
                    const isCorrect = q.correctOptionIndex === optIdx;

                    return (
                      <button
                        key={optIdx}
                        onClick={() => {
                          setQuizPreviewAnswers({ ...quizPreviewAnswers, [q.id]: optIdx });
                        }}
                        className={`p-3 rounded-xl text-xs text-left transition cursor-pointer border ${
                          isSelected
                            ? isCorrect
                              ? 'bg-emerald-950/40 border-emerald-500 text-emerald-200'
                              : 'bg-rose-950/40 border-rose-500 text-rose-200'
                            : 'bg-slate-800/80 border-slate-700/60 text-slate-300 hover:border-slate-600'
                        }`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            <div className="bg-purple-950/20 border border-purple-800/30 rounded-2xl p-4 text-xs text-purple-300 flex items-center justify-between">
              <span>Friends can view their score & compare with your mutual group chat!</span>
              <span className="font-bold">Viral Coefficient Engine 🚀</span>
            </div>
          </div>
        </div>
      )}

      {/* 6. TAB 4: PRE-WRITTEN MESSAGES (Sounds Like A Human, Not A Marketer) */}
      {activeTab === 'ama_link' && (
        <div className="bg-[#121927] border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6">
          <div>
            <h3 className="text-xl font-bold text-white mb-1">Authentic Share Messages</h3>
            <p className="text-xs text-slate-400">
              Never sound like a corporate advertisement. Copy pre-written natural messages designed for your real group chats.
            </p>
          </div>

          <div className="space-y-4">
            {sharePhrases.map((phrase, idx) => (
              <div key={idx} className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1 max-w-2xl">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 block">
                    {phrase.label}
                  </span>
                  <p className="text-xs text-slate-200 italic leading-relaxed">
                    "{phrase.text}"
                  </p>
                </div>

                <button
                  onClick={() => handleCopy(phrase.text, idx)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold cursor-pointer transition flex-shrink-0"
                >
                  {copiedMessageIndex === idx ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-300">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Message</span>
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>

          {/* Invitation Loop Explanation */}
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 space-y-2">
            <h4 className="font-bold text-slate-300">The FRIENDS Invitation Loop:</h4>
            <p>
              1. You share your authentic card or wishlist. <br />
              2. Your friends check your answers without needing an account. <br />
              3. Some decide to build their own cards. <br />
              4. When they join, FRIENDS immediately shows you mutual common ground and shared obsessions!
            </p>
          </div>
        </div>
      )}

    </div>
  );
};
