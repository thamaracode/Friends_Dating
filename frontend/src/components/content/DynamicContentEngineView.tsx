import React, { useState, useEffect, useCallback } from 'react';
import {
  Compass,
  Sparkles,
  Heart,
  Users,
  Brain,
  MessageCircle,
  Lightbulb,
  Bookmark,
  Share2,
  RefreshCw,
  Shuffle,
  EyeOff,
  Flag,
  Calendar,
  Check,
  ChevronRight,
  BookOpen,
  Send,
  HelpCircle,
  ShieldCheck,
  Award,
  Zap,
  Lock,
  ArrowRight
} from 'lucide-react';
import { contentApiClient } from '../../services/contentApiClient';
import {
  ContentItem,
  DailyContentBundle,
  ContentPrimaryCategory,
  ContentDepthLevel,
  ContentUserAnswer,
  ContentTaxonomyResponse
} from '../../types/contentEngine';

export const DynamicContentEngineView: React.FC = () => {
  // Navigation Tabs: 'daily' | 'explore' | 'favorites' | 'journal' | 'history'
  const [activeTab, setActiveTab] = useState<'daily' | 'explore' | 'favorites' | 'journal' | 'history'>('daily');

  // Daily Bundle State
  const [dailyBundle, setDailyBundle] = useState<DailyContentBundle | null>(null);
  const [dailyHistory, setDailyHistory] = useState<DailyContentBundle[]>([]);

  // Explore / Random State
  const [activeCategory, setActiveCategory] = useState<ContentPrimaryCategory | 'all'>('all');
  const [activeDepth, setActiveDepth] = useState<ContentDepthLevel | 'all'>('all');
  const [currentItem, setCurrentItem] = useState<ContentItem | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Collections State
  const [favorites, setFavorites] = useState<ContentItem[]>([]);
  const [answers, setAnswers] = useState<ContentUserAnswer[]>([]);
  const [taxonomyData, setTaxonomyData] = useState<ContentTaxonomyResponse | null>(null);

  // Inline Answering State
  const [answeringItemId, setAnsweringItemId] = useState<string | null>(null);
  const [answerText, setAnswerText] = useState('');
  const [answerMood, setAnswerMood] = useState('reflective');
  const [isSubmittingAnswer, setIsSubmittingAnswer] = useState(false);

  // Report Modal State
  const [reportingItem, setReportingItem] = useState<ContentItem | null>(null);
  const [reportReason, setReportReason] = useState<string>('inappropriate');
  const [reportDetails, setReportDetails] = useState('');

  // Toast / Feedback State
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Load Initial Daily Bundle & Taxonomy
  const loadInitialData = useCallback(async () => {
    try {
      const [bundle, tax] = await Promise.all([
        contentApiClient.getDailyBundle(),
        contentApiClient.getTaxonomy()
      ]);
      setDailyBundle(bundle);
      setTaxonomyData(tax);
    } catch {
      showToast('Offline mode: Using cached first-party sanctuary content');
    }
  }, []);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Load Tab-Specific Data
  useEffect(() => {
    if (activeTab === 'explore' && !currentItem) {
      handleDrawRandom();
    } else if (activeTab === 'favorites') {
      contentApiClient.getFavorites().then(setFavorites).catch(() => {});
    } else if (activeTab === 'journal') {
      contentApiClient.getUserAnswers().then(setAnswers).catch(() => {});
    } else if (activeTab === 'history' && dailyHistory.length === 0) {
      contentApiClient.getDailyHistory(7).then(setDailyHistory).catch(() => {});
    }
  }, [activeTab]);

  // Draw Random Item
  const handleDrawRandom = async () => {
    setIsRefreshing(true);
    try {
      const filters: any = {};
      if (activeCategory !== 'all') filters.category = activeCategory;
      if (activeDepth !== 'all') filters.depth_level = activeDepth;

      const item = await contentApiClient.getRandomItem(filters);
      if (item) setCurrentItem(item);
    } catch {
      showToast('Failed to draw random question');
    } finally {
      setIsRefreshing(false);
    }
  };

  // Refresh (Next Non-Repetitive Item)
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const filters: any = {};
      if (activeCategory !== 'all') filters.category = activeCategory;
      if (activeDepth !== 'all') filters.depth_level = activeDepth;

      const item = await contentApiClient.refreshItem(filters, currentItem?.id);
      if (item) {
        setCurrentItem(item);
        showToast('Fresh question delivered');
      }
    } catch {
      showToast('Could not fetch new question');
    } finally {
      setIsRefreshing(false);
    }
  };

  // Toggle Favorite
  const handleToggleFavorite = async (item: ContentItem) => {
    try {
      const { favorited } = await contentApiClient.toggleFavorite(item.id);
      const updated = { ...item, is_favorited: favorited, likes_count: item.likes_count + (favorited ? 1 : -1) };
      
      if (currentItem?.id === item.id) setCurrentItem(updated);
      if (dailyBundle?.featured_question.id === item.id) {
        setDailyBundle({ ...dailyBundle, featured_question: updated });
      }

      setFavorites(prev => favorited ? [updated, ...prev] : prev.filter(f => f.id !== item.id));
      showToast(favorited ? '⭐ Saved to Favorites' : 'Removed from Favorites');
    } catch {
      showToast('Error updating favorites');
    }
  };

  // Copy & Share
  const handleShare = async (item: ContentItem) => {
    const textToShare = `✨ "${item.title}"\n\n${item.content}\n\n— ${item.author_name} (${item.source})\n\nShared via Soulverse Dynamic Connection Engine`;
    try {
      await navigator.clipboard.writeText(textToShare);
      showToast('📋 Copied formatted prompt to clipboard!');
    } catch {
      showToast('Could not access clipboard');
    }
  };

  // Skip Question
  const handleSkip = async (item: ContentItem) => {
    try {
      await contentApiClient.skipItem(item.id, 'skipped_in_ui');
      showToast('⏭️ Question skipped (will not repeat)');
      handleRefresh();
    } catch {
      showToast('Could not record skip');
    }
  };

  // Submit Private Answer
  const handleSaveAnswer = async (contentId: string) => {
    if (!answerText.trim()) return;
    setIsSubmittingAnswer(true);
    try {
      const saved = await contentApiClient.answerQuestion(contentId, answerText.trim(), answerMood);
      showToast('🔒 Private reflection saved to your journal');
      setAnsweringItemId(null);
      setAnswerText('');

      if (currentItem?.id === contentId) {
        setCurrentItem({ ...currentItem, is_answered: true, user_answer: saved.answer_text });
      }
      setAnswers(prev => [saved, ...prev.filter(a => a.id !== saved.id)]);
    } catch {
      showToast('Error saving reflection');
    } finally {
      setIsSubmittingAnswer(false);
    }
  };

  // Submit Report
  const handleSubmitReport = async () => {
    if (!reportingItem) return;
    try {
      await contentApiClient.reportContent(reportingItem.id, reportReason, reportDetails);
      showToast('🛡️ Thank you. Report received for review.');
      setReportingItem(null);
      setReportDetails('');
    } catch {
      showToast('Failed to submit report');
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 pb-24 animate-fadeIn">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-2xl bg-zinc-900/95 border border-white/20 text-xs text-white shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-bottom-3 flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-rose-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="relative rounded-3xl p-6 md:p-8 bg-gradient-to-br from-zinc-900 via-black to-zinc-900 border border-white/10 shadow-2xl overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] font-mono text-zinc-300">
            <Compass className="w-3.5 h-3.5 text-rose-400" />
            <span>Master Prompt 06: Dynamic Human Connection Content Engine</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
            Connection Sanctuary & Inquiries
          </h1>
          <p className="text-sm text-zinc-400 max-w-2xl leading-relaxed">
            Curated questions, deep reflections, verified quotations, and relationship practices. Designed for high single-player utility even without active matches.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 mt-6 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: 'daily', label: "Today's Focus", icon: Calendar },
            { id: 'explore', label: 'Explore & Random', icon: Shuffle },
            { id: 'favorites', label: `Favorites (${favorites.length})`, icon: Bookmark },
            { id: 'journal', label: `My Reflections (${answers.length})`, icon: BookOpen },
            { id: 'history', label: 'Archive', icon: Award }
          ].map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all shrink-0 cursor-pointer ${
                  active 
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-lg' 
                    : 'bg-white/5 text-zinc-400 hover:text-white border border-white/5'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ===================================================================== */}
      {/* TAB 1: TODAY'S FOCUS (DETERMINISTIC DAILY BUNDLE)                      */}
      {/* ===================================================================== */}
      {activeTab === 'daily' && dailyBundle && (
        <div className="space-y-6">
          {/* Daily Theme Pill */}
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]" />
              <div>
                <span className="text-[10px] uppercase font-mono text-zinc-400 block tracking-wider">
                  Today's Sanctuary Theme ({dailyBundle.date})
                </span>
                <h4 className="text-sm font-bold text-white">{dailyBundle.theme}</h4>
                <p className="text-xs text-zinc-400">{dailyBundle.theme_description}</p>
              </div>
            </div>
            <button
              onClick={handleRefresh}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 hover:text-white transition-all cursor-pointer"
              title="Refresh question"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* 1. Featured Question of the Day */}
            <div className="rounded-3xl p-6 bg-zinc-900/60 border border-white/10 space-y-4 shadow-xl relative overflow-hidden flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 uppercase tracking-wider">
                    Question of the Day
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleFavorite(dailyBundle.featured_question)}
                      className={`p-1.5 rounded-lg border transition-colors ${
                        dailyBundle.featured_question.is_favorited 
                          ? 'bg-rose-500/20 text-rose-400 border-rose-500/40' 
                          : 'bg-white/5 text-zinc-400 border-white/10 hover:text-white'
                      }`}
                      title="Save to favorites"
                    >
                      <Bookmark className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleShare(dailyBundle.featured_question)}
                      className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-zinc-400 hover:text-white transition-colors"
                      title="Share prompt"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="text-base font-bold text-white leading-snug">
                  {dailyBundle.featured_question.content}
                </h3>

                {dailyBundle.featured_question.follow_up_questions?.length > 0 && (
                  <div className="pt-2 border-t border-white/5 space-y-1">
                    <span className="text-[10px] text-zinc-500 uppercase font-mono">Follow-up inquiries:</span>
                    <ul className="text-xs text-zinc-400 list-disc list-inside space-y-0.5">
                      {dailyBundle.featured_question.follow_up_questions.map((q, idx) => (
                        <li key={idx}>{q}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

                {/* Inline Answering Box */}
              <div className="pt-4 border-t border-white/10 space-y-3">
                {dailyBundle.featured_question.is_answered ? (
                  <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/10 space-y-1">
                    <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-medium">
                      <Lock className="w-3 h-3" />
                      <span>Answered Privately in your Journal</span>
                    </div>
                    <p className="text-xs text-zinc-300 italic">
                      "{dailyBundle.featured_question.user_answer}"
                    </p>
                  </div>
                ) : answeringItemId === dailyBundle.featured_question.id ? (
                  <div className="space-y-2">
                    <textarea
                      value={answerText}
                      onChange={(e) => setAnswerText(e.target.value)}
                      placeholder="Write your private reflection... (encrypted to your account only)"
                      rows={3}
                      className="w-full p-3 rounded-2xl bg-black/60 border border-white/15 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-rose-400"
                    />
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        {['reflective', 'vulnerable', 'optimistic', 'peaceful'].map(m => (
                          <button
                            key={m}
                            type="button"
                            onClick={() => setAnswerMood(m)}
                            className={`px-2 py-0.5 rounded-lg text-[10px] capitalize transition-colors ${
                              answerMood === m ? 'bg-rose-500/30 text-rose-300 border border-rose-500/40' : 'bg-white/5 text-zinc-400'
                            }`}
                          >
                            {m}
                          </button>
                        ))}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setAnsweringItemId(null)}
                          className="px-3 py-1 rounded-xl text-xs text-zinc-400 hover:text-white"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleSaveAnswer(dailyBundle.featured_question.id)}
                          disabled={isSubmittingAnswer || !answerText.trim()}
                          className="px-3 py-1 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold disabled:opacity-50"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setAnsweringItemId(dailyBundle.featured_question.id);
                      setAnswerText('');
                    }}
                    className="w-full py-2 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-zinc-300 hover:text-white transition-all flex items-center justify-center gap-2"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-rose-400" />
                    <span>Answer Privately in Journal</span>
                  </button>
                )}
              </div>
            </div>

            {/* 2. Featured Verified Quotation */}
            <div className="rounded-3xl p-6 bg-zinc-900/60 border border-white/10 space-y-4 shadow-xl relative overflow-hidden flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase tracking-wider flex items-center gap-1.5">
                    <Award className="w-3 h-3" />
                    <span>Verified Quotation</span>
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleFavorite(dailyBundle.featured_quote)}
                      className={`p-1.5 rounded-lg border transition-colors ${
                        dailyBundle.featured_quote.is_favorited 
                          ? 'bg-rose-500/20 text-rose-400 border-rose-500/40' 
                          : 'bg-white/5 text-zinc-400 border-white/10 hover:text-white'
                      }`}
                    >
                      <Bookmark className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleShare(dailyBundle.featured_quote)}
                      className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-zinc-400 hover:text-white transition-colors"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <blockquote className="text-base text-zinc-100 font-serif italic leading-relaxed border-l-2 border-amber-400/60 pl-3">
                  "{dailyBundle.featured_quote.content}"
                </blockquote>

                <div className="pt-2">
                  <h5 className="text-xs font-bold text-white">{dailyBundle.featured_quote.author_name}</h5>
                  <p className="text-[11px] text-zinc-400">{dailyBundle.featured_quote.source} • {dailyBundle.featured_quote.author_era}</p>
                  {dailyBundle.featured_quote.author_bio && (
                    <p className="text-[10px] text-zinc-500 pt-1 leading-snug">{dailyBundle.featured_quote.author_bio}</p>
                  )}
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-between text-[11px] text-zinc-400">
                <span className="flex items-center gap-1 text-emerald-400">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Attribution Verified</span>
                </span>
                <span className="font-mono text-zinc-500">{dailyBundle.featured_quote.depth_level}</span>
              </div>
            </div>

            {/* 3. Conversation Starter */}
            <div className="rounded-3xl p-5 bg-zinc-900/40 border border-white/10 space-y-3 shadow-md">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30 uppercase tracking-wider">
                Conversation Starter
              </span>
              <h4 className="text-sm font-bold text-white">{dailyBundle.featured_starter.title}</h4>
              <p className="text-xs text-zinc-300">{dailyBundle.featured_starter.content}</p>
              <div className="flex items-center justify-between pt-2">
                <span className="text-[10px] text-zinc-500 uppercase font-mono">Context: {dailyBundle.featured_starter.intended_context}</span>
                <button
                  onClick={() => handleShare(dailyBundle.featured_starter)}
                  className="inline-flex items-center gap-1 text-[11px] text-sky-400 hover:text-sky-300"
                >
                  <Share2 className="w-3 h-3" />
                  <span>Copy for Chat</span>
                </button>
              </div>
            </div>

            {/* 4. Interactive Challenge or Activity */}
            <div className="rounded-3xl p-5 bg-zinc-900/40 border border-white/10 space-y-3 shadow-md">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 uppercase tracking-wider">
                Interactive Micro-Challenge
              </span>
              <h4 className="text-sm font-bold text-white">{dailyBundle.featured_challenge.title}</h4>
              <p className="text-xs text-zinc-300">{dailyBundle.featured_challenge.content}</p>
              <div className="flex items-center justify-between pt-2 text-[10px] text-zinc-500">
                <span>Est. {dailyBundle.featured_challenge.estimated_minutes} mins</span>
                <span className="font-mono uppercase">{dailyBundle.featured_challenge.primary_category}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 2: EXPLORE & RANDOM (TAXONOMY FILTERING & ON-DEMAND REFRESH)        */}
      {/* ===================================================================== */}
      {activeTab === 'explore' && (
        <div className="space-y-6">
          {/* Filter Bar */}
          <div className="p-4 rounded-3xl bg-zinc-900/60 border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                Category Selection
              </span>
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-semibold cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>Refresh Question</span>
              </button>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {[
                { id: 'all', label: 'All Categories' },
                { id: 'love', label: '❤️ Love & Romance' },
                { id: 'friendship', label: '🫂 Friendship' },
                { id: 'personal_development', label: '🌱 Personal Growth' },
                { id: 'psychology', label: '🧠 Psychology' },
                { id: 'deep_conversations', label: '🌌 Deep Meaning' }
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setActiveCategory(cat.id as any);
                    handleDrawRandom();
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                    activeCategory === cat.id
                      ? 'bg-white text-black font-bold'
                      : 'bg-white/5 text-zinc-400 hover:text-white border border-white/5'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Depth Selector */}
            <div className="flex items-center gap-2 pt-1">
              <span className="text-[11px] text-zinc-500 font-mono">Depth:</span>
              {['all', 'icebreaker', 'moderate', 'deep', 'vulnerable', 'philosophical'].map(d => (
                <button
                  key={d}
                  onClick={() => {
                    setActiveDepth(d as any);
                    handleDrawRandom();
                  }}
                  className={`px-2 py-0.5 rounded-lg text-[10px] capitalize transition-colors ${
                    activeDepth === d ? 'bg-rose-500 text-white font-bold' : 'bg-white/5 text-zinc-400 hover:text-white'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Current Question Card */}
          {currentItem && (
            <div className="rounded-3xl p-6 md:p-8 bg-zinc-900/80 border border-white/10 space-y-6 shadow-2xl relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-white border border-white/10 capitalize">
                    {currentItem.primary_category.replace('_', ' ')}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-rose-500/20 text-rose-300 border border-rose-500/30 uppercase">
                    {currentItem.depth_level}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleFavorite(currentItem)}
                    className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                      currentItem.is_favorited ? 'bg-rose-500/20 text-rose-400 border-rose-500/40' : 'bg-white/5 text-zinc-400 border-white/10 hover:text-white'
                    }`}
                    title="Bookmark to favorites"
                  >
                    <Bookmark className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleShare(currentItem)}
                    className="p-2 rounded-xl bg-white/5 border border-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                    title="Share prompt"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setReportingItem(currentItem)}
                    className="p-2 rounded-xl bg-white/5 border border-white/10 text-zinc-400 hover:text-rose-400 transition-colors cursor-pointer"
                    title="Report content"
                  >
                    <Flag className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <h2 className="text-xl md:text-2xl font-bold text-white leading-relaxed">
                  {currentItem.content}
                </h2>
                <div className="text-xs text-zinc-400">
                  <span>Author / Source: </span>
                  <strong className="text-white">{currentItem.author_name}</strong>
                  <span className="text-zinc-500"> ({currentItem.source})</span>
                </div>
              </div>

              {/* Follow-up Questions */}
              {currentItem.follow_up_questions?.length > 0 && (
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-2">
                  <span className="text-[11px] uppercase font-mono text-zinc-400 block tracking-wider">
                    Deepen the Conversation:
                  </span>
                  <ul className="text-xs text-zinc-300 space-y-1 list-disc list-inside">
                    {currentItem.follow_up_questions.map((fq, i) => (
                      <li key={i}>{fq}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Action Buttons Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-white/10">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleSkip(currentItem)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer"
                  >
                    <EyeOff className="w-3.5 h-3.5" />
                    <span>Skip Question</span>
                  </button>
                  <button
                    onClick={handleRefresh}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer"
                  >
                    <Shuffle className="w-3.5 h-3.5" />
                    <span>Next Random</span>
                  </button>
                </div>

                <button
                  onClick={() => {
                    setAnsweringItemId(currentItem.id);
                    setAnswerText(currentItem.user_answer || '');
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold transition-all shadow-lg cursor-pointer"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>{currentItem.is_answered ? 'Edit Private Reflection' : 'Answer Privately'}</span>
                </button>
              </div>

              {/* Answering Drawer */}
              {answeringItemId === currentItem.id && (
                <div className="p-4 rounded-2xl bg-black/60 border border-white/15 space-y-3 animate-fadeIn">
                  <span className="text-xs font-bold text-white block">My Private Journal Entry</span>
                  <textarea
                    value={answerText}
                    onChange={(e) => setAnswerText(e.target.value)}
                    placeholder="Reflect honestly. Your answers are stored securely in your private vault..."
                    rows={4}
                    className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-rose-400"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setAnsweringItemId(null)}
                      className="px-3 py-1.5 rounded-xl text-xs text-zinc-400 hover:text-white cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleSaveAnswer(currentItem.id)}
                      disabled={isSubmittingAnswer || !answerText.trim()}
                      className="px-4 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold disabled:opacity-50 cursor-pointer"
                    >
                      Save to My Vault
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 3: FAVORITES & BOOKMARKED COLLECTION                               */}
      {/* ===================================================================== */}
      {activeTab === 'favorites' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.03] border border-white/10">
            <div>
              <h3 className="text-sm font-bold text-white">Saved Connections & Wisdom</h3>
              <p className="text-xs text-zinc-400">Questions, quotations, and insights you've bookmarked for reflection.</p>
            </div>
            <button
              onClick={async () => {
                const data = await contentApiClient.exportUserData();
                const blob = new Blob([JSON.stringify(data.export, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `soulverse-content-favorites-${Date.now()}.json`;
                a.click();
                showToast('Exported favorites and journal answers');
              }}
              className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-zinc-300 hover:text-white"
            >
              Export JSON
            </button>
          </div>

          {favorites.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-white/[0.02] border border-white/5 space-y-2">
              <Bookmark className="w-8 h-8 text-zinc-600 mx-auto" />
              <h4 className="text-sm font-bold text-white">No favorites bookmarked yet</h4>
              <p className="text-xs text-zinc-500">Tap the bookmark star icon on any question or quote to save it here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {favorites.map(item => (
                <div key={item.id} className="p-5 rounded-2xl bg-zinc-900/60 border border-white/10 space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[10px] text-zinc-400">
                      <span className="font-mono uppercase">{item.primary_category}</span>
                      <button
                        onClick={() => handleToggleFavorite(item)}
                        className="text-rose-400 hover:text-zinc-400"
                        title="Remove from favorites"
                      >
                        Remove
                      </button>
                    </div>
                    <h5 className="text-sm font-bold text-white leading-snug">{item.content}</h5>
                    <p className="text-xs text-zinc-400">— {item.author_name} ({item.source})</p>
                  </div>
                  <button
                    onClick={() => handleShare(item)}
                    className="inline-flex items-center gap-1 text-[11px] text-rose-300 hover:text-rose-200"
                  >
                    <Share2 className="w-3 h-3" />
                    <span>Copy Shareable Card</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 4: MY PRIVATE REFLECTIONS (JOURNAL)                                */}
      {/* ===================================================================== */}
      {activeTab === 'journal' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10">
            <h3 className="text-sm font-bold text-white">Private Reflection Journal</h3>
            <p className="text-xs text-zinc-400">Your answered introspections, stored with strict account-level data isolation.</p>
          </div>

          {answers.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-white/[0.02] border border-white/5 space-y-2">
              <BookOpen className="w-8 h-8 text-zinc-600 mx-auto" />
              <h4 className="text-sm font-bold text-white">No private reflections recorded yet</h4>
              <p className="text-xs text-zinc-500">Pick any question from Today's Focus or Explore to write your first reflection.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {answers.map(ans => (
                <div key={ans.id} className="p-5 rounded-2xl bg-zinc-900/60 border border-white/10 space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-zinc-400">
                    <span className="font-mono text-rose-400">
                      {ans.content_item?.title || 'Question Inquiry'}
                    </span>
                    <button
                      onClick={async () => {
                        await contentApiClient.deleteAnswer(ans.id);
                        setAnswers(prev => prev.filter(a => a.id !== ans.id));
                        showToast('Answer deleted');
                      }}
                      className="text-zinc-500 hover:text-rose-400 text-xs"
                    >
                      Delete
                    </button>
                  </div>
                  {ans.content_item && (
                    <p className="text-xs text-zinc-300 italic">"{ans.content_item.content}"</p>
                  )}
                  <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 text-xs text-white leading-relaxed">
                    {ans.answer_text}
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-zinc-500 pt-1">
                    <span>Mood: {ans.mood_state || 'Reflective'}</span>
                    <span>{new Date(ans.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Report Inappropriate Content Modal */}
      {reportingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-md p-6 rounded-3xl bg-zinc-900 border border-white/15 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                <Flag className="w-4 h-4" />
                <span>Report Content</span>
              </div>
              <button onClick={() => setReportingItem(null)} className="text-zinc-500 hover:text-white text-xs">
                Close
              </button>
            </div>

            <p className="text-xs text-zinc-300">
              Reporting: <strong className="text-white">"{reportingItem.title}"</strong>
            </p>

            <div className="space-y-2">
              <label className="text-[11px] text-zinc-400 uppercase font-mono">Reason for Report</label>
              <select
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-black border border-white/15 text-xs text-white focus:outline-none"
              >
                <option value="inappropriate">Inappropriate or Offensive</option>
                <option value="factually_incorrect">Factually Incorrect</option>
                <option value="fake_attribution">Fake Author Attribution</option>
                <option value="spam">Spam / Low Quality</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] text-zinc-400 uppercase font-mono">Optional Context</label>
              <textarea
                value={reportDetails}
                onChange={(e) => setReportDetails(e.target.value)}
                placeholder="Explain what is problematic about this content..."
                rows={3}
                className="w-full p-3 rounded-xl bg-black border border-white/15 text-xs text-white placeholder-zinc-500 focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setReportingItem(null)}
                className="px-4 py-2 rounded-xl text-xs text-zinc-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitReport}
                className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold shadow-lg"
              >
                Submit Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DynamicContentEngineView;
