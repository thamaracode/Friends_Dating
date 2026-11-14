import React, { useState, useEffect, useCallback } from 'react';
import {
  HelpCircle,
  RefreshCw,
  Sparkles,
  Lock,
  Globe,
  Users,
  Heart,
  Send,
  Bookmark,
  MessageCircle,
  Check,
  ChevronRight,
  Flame,
  SkipForward,
  BookOpen,
  Calendar,
  Share2,
  Tag,
  AlertCircle
} from 'lucide-react';
import { socialApiClient } from '../../services/socialApiClient';
import { offlineContentDb } from '../../services/offlineContentDb';
import {
  QuestionEcosystemItem,
  QuestionPrimaryCategory,
  QuestionDepthLevel,
  QuestionAnswerItem,
  ContentVisibility
} from '../../types/social';

const CATEGORIES: { key: QuestionPrimaryCategory; label: string; icon: string }[] = [
  { key: 'self_discovery', label: 'Self-Discovery', icon: '🌱' },
  { key: 'love_and_romance', label: 'Love & Romance', icon: '❤️' },
  { key: 'friendship', label: 'Friendship', icon: '🤝' },
  { key: 'emotional_intelligence', label: 'Emotional Intelligence', icon: '🧠' },
  { key: 'life_experiences', label: 'Life Experiences', icon: '⏳' },
  { key: 'imagination_and_creativity', label: 'Creativity & Imagination', icon: '🎨' },
  { key: 'fun_and_social', label: 'Fun & Playful', icon: '✨' },
  { key: 'deep_conversations', label: 'Deep Conversations', icon: '🌌' }
];

const DEPTH_LEVELS: { key: QuestionDepthLevel | 'all'; label: string }[] = [
  { key: 'all', label: 'All Depths' },
  { key: 'casual', label: 'Casual' },
  { key: 'reflective', label: 'Reflective' },
  { key: 'deep', label: 'Deep' },
  { key: 'philosophical', label: 'Philosophical' }
];

export const QuestionSanctuaryView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'discover' | 'daily' | 'history' | 'community'>('discover');
  const [activeCategory, setActiveCategory] = useState<QuestionPrimaryCategory | 'all'>('self_discovery');
  const [activeDepth, setActiveDepth] = useState<QuestionDepthLevel | 'all'>('all');

  // Question State
  const [currentQuestion, setCurrentQuestion] = useState<QuestionEcosystemItem | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshNotice, setRefreshNotice] = useState<string | null>(null);

  // Daily Question
  const [dailyQuestion, setDailyQuestion] = useState<QuestionEcosystemItem | null>(null);

  // Answer Composer State
  const [answerText, setAnswerText] = useState('');
  const [visibility, setVisibility] = useState<ContentVisibility>('private');
  const [publishAsPost, setPublishAsPost] = useState(false);
  const [isSubmittingAnswer, setIsSubmittingAnswer] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  // Discussions & Answers
  const [publicAnswers, setPublicAnswers] = useState<QuestionAnswerItem[]>([]);
  const [showAnswersDrawer, setShowAnswersDrawer] = useState(false);

  // Personal History State
  const [historyFilter, setHistoryFilter] = useState<'answered' | 'saved' | 'skipped' | 'my_answers'>('answered');
  const [historyItems, setHistoryItems] = useState<any[]>([]);

  // Toast
  const [toast, setToast] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // 1. Initial Load of Question & Daily
  const handleDrawQuestion = useCallback(async (cat?: QuestionPrimaryCategory | 'all', depth?: QuestionDepthLevel | 'all') => {
    setIsRefreshing(true);
    setHasSubmitted(false);
    setAnswerText('');
    try {
      const res = await socialApiClient.refreshQuestion({
        category: cat !== undefined ? cat : activeCategory,
        depth_level: depth !== undefined ? depth : activeDepth
      });

      if (res.question) {
        setCurrentQuestion(res.question);
        if (res.is_cycle_reset) {
          setRefreshNotice('All questions in this category viewed. Cycle refreshed!');
          setTimeout(() => setRefreshNotice(null), 4000);
        }

        // Recover draft if previously started
        const draft = await offlineContentDb.getQuestionDraft(res.question.id, 'usr_me');
        if (draft) {
          setAnswerText(draft.answer_text);
          setVisibility(draft.visibility as ContentVisibility);
        }

        // Load public answers
        socialApiClient.getQuestionAnswers(res.question.id, 5).then(setPublicAnswers).catch(() => {});
      }
    } catch {
      showToast('Offline: Using local cached question');
    } finally {
      setIsRefreshing(false);
    }
  }, [activeCategory, activeDepth]);

  useEffect(() => {
    handleDrawQuestion();
    socialApiClient.getDailyQuestion().then(setDailyQuestion).catch(() => {});
  }, []);

  // 2. Auto-save answer draft to IndexedDB on typing
  useEffect(() => {
    if (!currentQuestion || !answerText.trim() || hasSubmitted) return;
    const timer = setTimeout(() => {
      offlineContentDb.saveQuestionDraft({
        id: `qdraft_${currentQuestion.id}`,
        user_id: 'usr_me',
        question_id: currentQuestion.id,
        answer_text: answerText,
        visibility: visibility,
        updatedAt: Date.now()
      });
    }, 500);
    return () => clearTimeout(timer);
  }, [answerText, currentQuestion, visibility, hasSubmitted]);

  // 3. Submit Answer
  const handleSubmitAnswer = async () => {
    if (!currentQuestion || !answerText.trim() || isSubmittingAnswer) return;
    setIsSubmittingAnswer(true);
    try {
      await socialApiClient.answerQuestion({
        question_id: currentQuestion.id,
        answer_text: answerText.trim(),
        visibility,
        publish_as_post: publishAsPost,
        attach_to_profile: true
      });

      await offlineContentDb.deleteQuestionDraft(`qdraft_${currentQuestion.id}`);
      setHasSubmitted(true);
      showToast(visibility === 'private' ? 'Saved securely in your private journal' : 'Published to sanctuary community');
      
      // Reload public answers
      socialApiClient.getQuestionAnswers(currentQuestion.id, 10).then(setPublicAnswers).catch(() => {});
    } catch (e: any) {
      showToast(e.message || 'Failed to submit answer');
    } finally {
      setIsSubmittingAnswer(false);
    }
  };

  // 4. Toggle Bookmark
  const handleToggleBookmark = async () => {
    if (!currentQuestion) return;
    try {
      const res = await socialApiClient.toggleBookmark({
        target_type: 'question',
        target_id: currentQuestion.id
      });
      setCurrentQuestion({
        ...currentQuestion,
        is_saved: res.is_bookmarked
      });
      showToast(res.is_bookmarked ? 'Saved to bookmarks' : 'Removed from bookmarks');
    } catch {
      showToast('Failed to update bookmark');
    }
  };

  // 5. Skip Question
  const handleSkipQuestion = async () => {
    if (!currentQuestion) return;
    await socialApiClient.skipQuestion(currentQuestion.id);
    showToast('Skipped: Will not appear in discovery');
    handleDrawQuestion();
  };

  // 6. History Tab Loading
  useEffect(() => {
    if (activeTab === 'history') {
      socialApiClient.getQuestionHistory(historyFilter).then(setHistoryItems).catch(() => {});
    }
  }, [activeTab, historyFilter]);

  const depthColors: Record<string, string> = {
    casual: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/25',
    reflective: 'bg-blue-500/10 text-blue-300 border-blue-500/25',
    deep: 'bg-amber-400/10 text-amber-300 border-amber-400/25',
    philosophical: 'bg-purple-500/10 text-purple-300 border-purple-500/25'
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 pb-20 animate-fadeIn text-zinc-100">
      
      {/* Toast Alert */}
      {toast && (
        <div className="fixed top-20 right-6 z-50 px-4 py-3 rounded-2xl bg-[#12131A] border border-amber-400/30 text-amber-300 text-xs font-semibold shadow-2xl flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* Top Header & Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-heading font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>SOUL DISCOVERY ENGINE</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-white">
            Questions & Reflections Sanctuary
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400">
            Meaningful prompts designed to explore your inner landscape, ignite connection, and spark deep conversations.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-white/[0.04] border border-white/10 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('discover')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'discover' ? 'bg-amber-400 text-[#090A0E] shadow-sm' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Explore
          </button>
          <button
            onClick={() => setActiveTab('daily')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'daily' ? 'bg-amber-400 text-[#090A0E] shadow-sm' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Daily Prompt
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'history' ? 'bg-amber-400 text-[#090A0E] shadow-sm' : 'text-zinc-400 hover:text-white'
            }`}
          >
            My Reflections
          </button>
        </div>
      </div>

      {/* =================================================================== */}
      {/* 1. DISCOVER TAB                                                     */}
      {/* =================================================================== */}
      {activeTab === 'discover' && (
        <div className="space-y-6">
          {/* Category Pill Bar */}
          <div className="space-y-2">
            <span className="text-[11px] font-heading font-bold uppercase tracking-wider text-zinc-400">
              Taxonomy Categories
            </span>
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
              {CATEGORIES.map(cat => {
                const isActive = activeCategory === cat.key;
                return (
                  <button
                    key={cat.key}
                    onClick={() => {
                      setActiveCategory(cat.key);
                      handleDrawQuestion(cat.key, activeDepth);
                    }}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold shrink-0 transition-all flex items-center gap-2 border ${
                      isActive
                        ? 'bg-white/15 text-white border-amber-400/40 shadow-sm'
                        : 'bg-white/[0.04] text-zinc-400 border-white/[0.08] hover:text-white hover:bg-white/[0.08]'
                    }`}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Depth Filter Pill Bar */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-zinc-400 font-medium mr-1">Depth:</span>
              {DEPTH_LEVELS.map(d => (
                <button
                  key={d.key}
                  onClick={() => {
                    setActiveDepth(d.key);
                    handleDrawQuestion(activeCategory, d.key);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                    activeDepth === d.key
                      ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
                      : 'text-zinc-400 hover:text-white hover:bg-white/[0.05]'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>

            {/* True Refresh Button with Real View Exclusion */}
            <button
              onClick={() => handleDrawQuestion()}
              disabled={isRefreshing}
              className="px-3.5 py-2 rounded-xl bg-white/[0.08] hover:bg-white/[0.15] text-zinc-200 hover:text-white border border-white/10 text-xs font-semibold flex items-center gap-2 transition-all shadow-sm active:scale-95"
              title="Draw a fresh unviewed question"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-amber-400 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? 'Consulting Wisdom...' : 'Refresh Question'}</span>
            </button>
          </div>

          {/* Cycle Reset Banner */}
          {refreshNotice && (
            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-amber-300 text-xs flex items-center gap-2">
              <Sparkles className="w-4 h-4 shrink-0" />
              <span>{refreshNotice}</span>
            </div>
          )}

          {/* Main Question Presentation Card */}
          {currentQuestion ? (
            <div className="p-6 sm:p-8 rounded-3xl dark-glass border border-white/10 space-y-6 relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-80 h-80 bg-amber-400/[0.03] rounded-full blur-3xl pointer-events-none" />

              {/* Card Meta Badges */}
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-white/10 text-zinc-300 text-xs font-bold border border-white/15 capitalize">
                    {currentQuestion.subcategory.replace(/_/g, ' ')}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border capitalize ${depthColors[currentQuestion.depth_level] || ''}`}>
                    {currentQuestion.depth_level}
                  </span>
                  {currentQuestion.sensitivity !== 'general' && (
                    <span className="px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/20 text-[10px] font-bold uppercase">
                      {currentQuestion.sensitivity}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleToggleBookmark}
                    className={`p-2 rounded-xl border transition-colors ${
                      currentQuestion.is_saved
                        ? 'bg-amber-400 text-[#090A0E] border-amber-400'
                        : 'bg-white/[0.05] text-zinc-300 hover:text-white border-white/10'
                    }`}
                    title="Bookmark question"
                  >
                    <Bookmark className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleSkipQuestion}
                    className="p-2 rounded-xl bg-white/[0.05] text-zinc-400 hover:text-white border border-white/10 transition-colors"
                    title="Skip this question"
                  >
                    <SkipForward className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Main Question Text */}
              <div className="space-y-3">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-heading font-extrabold text-white leading-snug">
                  "{currentQuestion.question_text}"
                </h2>
                {currentQuestion.context_tip && (
                  <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed italic border-l-2 border-amber-400/40 pl-3">
                    {currentQuestion.context_tip}
                  </p>
                )}
              </div>

              {/* Follow-up Questions Prompts */}
              {currentQuestion.follow_up_questions && currentQuestion.follow_up_questions.length > 0 && (
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-2">
                  <span className="text-[11px] font-heading font-bold uppercase tracking-wider text-amber-300">
                    Follow-Up Inquiries to Ponder
                  </span>
                  <ul className="space-y-1 text-xs text-zinc-300">
                    {currentQuestion.follow_up_questions.map((fq, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-amber-400 font-bold">•</span>
                        <span>{fq}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Tags */}
              {currentQuestion.content_tags && currentQuestion.content_tags.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  {currentQuestion.content_tags.map(tag => (
                    <span key={tag} className="text-[11px] font-mono text-zinc-400 hover:text-amber-300 cursor-pointer">
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Inline Reflection Composer */}
              <div className="border-t border-white/10 pt-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-heading font-bold text-zinc-200 flex items-center gap-2">
                    <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                    <span>Your Reflection or Answer</span>
                  </span>

                  {/* Privacy Selector */}
                  <div className="flex items-center gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => setVisibility(visibility === 'private' ? 'public' : 'private')}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all border ${
                        visibility === 'private'
                          ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                          : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                      }`}
                    >
                      {visibility === 'private' ? <Lock className="w-3 h-3" /> : <Globe className="w-3 h-3" />}
                      <span>{visibility === 'private' ? 'Private Journal' : 'Public to Community'}</span>
                    </button>
                  </div>
                </div>

                {hasSubmitted ? (
                  <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Check className="w-5 h-5 shrink-0" />
                      <div>
                        <p className="text-xs sm:text-sm font-semibold">Your reflection has been recorded.</p>
                        <p className="text-[11px] text-emerald-400/80">
                          {visibility === 'private' ? 'Accessible anytime in My Reflections.' : 'Visible to matches and community.'}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setHasSubmitted(false)}
                      className="text-xs font-bold underline hover:text-white"
                    >
                      Edit
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <textarea
                      value={answerText}
                      onChange={(e) => setAnswerText(e.target.value)}
                      placeholder="Write your candid reflection here... (draft is auto-saved locally)"
                      rows={4}
                      className="w-full p-4 rounded-2xl bg-black/40 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400/60 text-sm font-body leading-relaxed resize-none"
                    />

                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <div className="flex items-center gap-2">
                        {visibility !== 'private' && (
                          <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={publishAsPost}
                              onChange={(e) => setPublishAsPost(e.target.checked)}
                              className="rounded border-white/20 bg-black text-amber-400 focus:ring-0"
                            />
                            <span>Also share as a post on the social feed</span>
                          </label>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleDrawQuestion()}
                          className="px-3.5 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
                        >
                          Skip
                        </button>
                        <button
                          type="button"
                          onClick={handleSubmitAnswer}
                          disabled={!answerText.trim() || isSubmittingAnswer}
                          className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-[#090A0E] text-xs font-bold transition-all shadow-md disabled:opacity-50 flex items-center gap-2"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>{isSubmittingAnswer ? 'Recording...' : 'Record Answer'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Community Answers & Discussions Toggle */}
              {publicAnswers.length > 0 && (
                <div className="border-t border-white/10 pt-4 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-zinc-300">
                    <Users className="w-4 h-4 text-amber-400" />
                    <span>{publicAnswers.length} community perspectives shared</span>
                  </div>
                  <button
                    onClick={() => setShowAnswersDrawer(!showAnswersDrawer)}
                    className="text-xs font-bold text-amber-300 hover:text-white flex items-center gap-1"
                  >
                    <span>{showAnswersDrawer ? 'Hide Perspectives' : 'Read Perspectives'}</span>
                    <ChevronRight className={`w-3.5 h-3.5 transition-transform ${showAnswersDrawer ? 'rotate-90' : ''}`} />
                  </button>
                </div>
              )}

              {/* Public Community Perspectives Drawer */}
              {showAnswersDrawer && (
                <div className="space-y-3 pt-2">
                  {publicAnswers.map(ans => (
                    <div key={ans.id} className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 space-y-2">
                      <div className="flex items-center gap-2.5">
                        <img src={ans.author_avatar} alt={ans.author_name} className="w-6 h-6 rounded-full object-cover" />
                        <span className="text-xs font-heading font-bold text-white">{ans.author_name}</span>
                        <span className="text-[10px] text-zinc-400 font-mono">
                          {new Date(ans.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-zinc-200 leading-relaxed">
                        {ans.answer_text}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="p-12 text-center rounded-3xl dark-glass border border-white/10 text-zinc-400">
              <HelpCircle className="w-10 h-10 mx-auto mb-3 opacity-40 text-amber-400" />
              <p>No questions found for this filter criteria.</p>
            </div>
          )}
        </div>
      )}

      {/* =================================================================== */}
      {/* 2. DAILY QUESTION TAB                                               */}
      {/* =================================================================== */}
      {activeTab === 'daily' && (
        <div className="space-y-6">
          <div className="p-6 sm:p-8 rounded-3xl dark-glass border border-white/10 space-y-6 shadow-2xl relative overflow-hidden">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-300 uppercase tracking-wider">
              <Calendar className="w-4 h-4" />
              <span>Universal Daily Reflection</span>
            </div>

            {dailyQuestion ? (
              <div className="space-y-4">
                <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-white">
                  "{dailyQuestion.question_text}"
                </h2>
                {dailyQuestion.context_tip && (
                  <p className="text-sm text-zinc-300 italic border-l-2 border-amber-400/40 pl-3">
                    {dailyQuestion.context_tip}
                  </p>
                )}
                <div className="pt-4">
                  <button
                    onClick={() => {
                      setCurrentQuestion(dailyQuestion);
                      setActiveTab('discover');
                    }}
                    className="px-5 py-2.5 rounded-xl bg-amber-400 text-[#090A0E] text-xs font-bold flex items-center gap-2"
                  >
                    <span>Open & Answer in Discovery</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-zinc-400">Loading today's universal reflection...</p>
            )}
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 3. MY REFLECTIONS / HISTORY TAB                                     */}
      {/* =================================================================== */}
      {activeTab === 'history' && (
        <div className="space-y-6">
          <div className="flex items-center gap-2 border-b border-white/10 pb-3">
            {(['answered', 'saved', 'skipped', 'my_answers'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setHistoryFilter(tab)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-colors ${
                  historyFilter === tab
                    ? 'bg-amber-400 text-[#090A0E]'
                    : 'text-zinc-400 hover:text-white hover:bg-white/[0.05]'
                }`}
              >
                {tab.replace('_', ' ')}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {historyItems.length > 0 ? (
              historyItems.map((item, idx) => (
                <div key={item.id || idx} className="p-4 rounded-2xl dark-glass border border-white/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-amber-300 uppercase">
                      {item.primary_category || 'Question'}
                    </span>
                    <span className="text-[10px] text-zinc-500 font-mono">
                      {new Date(item.created_at || item.answered_at || item.saved_at || Date.now()).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="text-sm sm:text-base font-heading font-bold text-white">
                    "{item.question_text || item.title}"
                  </h3>
                  {item.answer_text && (
                    <p className="text-xs text-zinc-300 bg-white/[0.03] p-3 rounded-xl border border-white/[0.06] italic">
                      {item.answer_text}
                    </p>
                  )}
                </div>
              ))
            ) : (
              <div className="p-12 text-center dark-glass rounded-3xl border border-white/10 text-zinc-400">
                <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-40 text-amber-400" />
                <p className="text-xs">No records found under {historyFilter.replace('_', ' ')}.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
