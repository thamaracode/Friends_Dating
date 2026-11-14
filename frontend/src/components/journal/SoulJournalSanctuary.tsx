import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Sparkles,
  Shield,
  Lock,
  Globe,
  Users,
  CheckCircle2,
  MessageCircle,
  Heart,
  ChevronRight,
  Flame,
  Zap,
  Tag,
  Compass,
  ArrowRight,
  Eye,
  EyeOff
} from 'lucide-react';
import {
  SoulPromptsApiClient,
  DEFAULT_USER_ID,
  FALLBACK_TODAY_PROMPT
} from '../../services/soulPromptsApiClient';
import type {
  SoulPrompt,
  SoulPromptResponse,
  ResponseVisibility,
  MoodTag,
  ResonanceType,
  UserSoulJournal,
  CompatibilityInsight
} from '../../types/soulPrompt';

interface SoulJournalSanctuaryProps {
  onNavigateToChat?: (conversationId: string, partnerName: string) => void;
  onClose?: () => void;
}

export const SoulJournalSanctuary: React.FC<SoulJournalSanctuaryProps> = ({
  onNavigateToChat,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'today' | 'circle' | 'journal' | 'compatibility'>('today');
  
  // Today's prompt state
  const [todayPrompt, setTodayPrompt] = useState<SoulPrompt>(FALLBACK_TODAY_PROMPT);
  const [myResponse, setMyResponse] = useState<SoulPromptResponse | null>(null);
  const [totalResponses, setTotalResponses] = useState<number>(0);
  const [responseText, setResponseText] = useState<string>('');
  const [visibility, setVisibility] = useState<ResponseVisibility>('community_anonymous');
  const [moodTag, setMoodTag] = useState<MoodTag>('reflective');
  const [customAlias, setCustomAlias] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitFeedback, setSubmitFeedback] = useState<string | null>(null);

  // Community Circle state
  const [communityResponses, setCommunityResponses] = useState<SoulPromptResponse[]>([]);
  const [loadingCircle, setLoadingCircle] = useState<boolean>(false);
  const [icebreakerTriggering, setIcebreakerTriggering] = useState<string | null>(null);

  // Journal state
  const [journal, setJournal] = useState<UserSoulJournal>({ totalEntries: 0, moodStats: {}, entries: [] });
  const [loadingJournal, setLoadingJournal] = useState<boolean>(false);

  // Compatibility test state
  const [targetUserId, setTargetUserId] = useState<string>('usr_aria');
  const [compatInsight, setCompatInsight] = useState<CompatibilityInsight | null>(null);
  const [compatLoading, setCompatLoading] = useState<boolean>(false);

  // Load initial prompt
  useEffect(() => {
    loadTodayData();
  }, []);

  // When switching tabs, load relevant data
  useEffect(() => {
    if (activeTab === 'circle' && todayPrompt) {
      loadCommunityCircle(todayPrompt.id);
    } else if (activeTab === 'journal') {
      loadUserJournal();
    }
  }, [activeTab, todayPrompt]);

  const loadTodayData = async () => {
    try {
      const data = await SoulPromptsApiClient.getTodayPrompt(DEFAULT_USER_ID);
      setTodayPrompt(data.prompt);
      setTotalResponses(data.totalResponsesCount);
      if (data.myResponse) {
        setMyResponse(data.myResponse);
        setResponseText(data.myResponse.responseText);
        setVisibility(data.myResponse.visibility);
        setMoodTag(data.myResponse.moodTag);
        setCustomAlias(data.myResponse.authorAlias || '');
      }
    } catch (err) {
      console.error('Failed to load today prompt:', err);
    }
  };

  const loadCommunityCircle = async (promptId: string) => {
    setLoadingCircle(true);
    try {
      const list = await SoulPromptsApiClient.getCommunityResponses(promptId, DEFAULT_USER_ID);
      setCommunityResponses(list);
    } catch (err) {
      console.error('Failed to load community circle:', err);
    } finally {
      setLoadingCircle(false);
    }
  };

  const loadUserJournal = async () => {
    setLoadingJournal(true);
    try {
      const data = await SoulPromptsApiClient.getUserJournal(DEFAULT_USER_ID);
      setJournal(data);
    } catch (err) {
      console.error('Failed to load journal:', err);
    } finally {
      setLoadingJournal(false);
    }
  };

  const handleSubmitResponse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!responseText.trim() || responseText.trim().length < 5) {
      setSubmitFeedback('Reflection must be at least 5 characters.');
      return;
    }

    setIsSubmitting(true);
    setSubmitFeedback(null);
    try {
      const saved = await SoulPromptsApiClient.respondToPrompt(
        todayPrompt.id,
        {
          responseText: responseText.trim(),
          visibility,
          moodTag,
          customAlias: visibility === 'community_anonymous' ? customAlias.trim() : undefined
        },
        DEFAULT_USER_ID
      );
      setMyResponse(saved);
      setSubmitFeedback('✨ Your reflection has been saved to your sanctuary.');
      // Refresh community list if open
      if (activeTab === 'circle') {
        loadCommunityCircle(todayPrompt.id);
      }
    } catch (err: any) {
      setSubmitFeedback(err.message || 'Failed to save reflection');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResonate = async (responseId: string, reactionType: ResonanceType) => {
    try {
      const res = await SoulPromptsApiClient.submitResonance(responseId, reactionType, DEFAULT_USER_ID);
      setCommunityResponses(prev =>
        prev.map(item => {
          if (item.id !== responseId) return item;
          const currentRes = item.userResonances || [];
          const updatedRes = res.active
            ? [...currentRes, reactionType]
            : currentRes.filter(r => r !== reactionType);

          return {
            ...item,
            reactionFeltDeeply: res.reactionFeltDeeply,
            reactionMindShifted: res.reactionMindShifted,
            reactionInspired: res.reactionInspired,
            userResonances: updatedRes
          };
        })
      );
    } catch (err) {
      console.error('Failed to submit resonance:', err);
    }
  };

  const handleStartPromptIcebreaker = async (responseId: string) => {
    setIcebreakerTriggering(responseId);
    try {
      const data = await SoulPromptsApiClient.createPromptIcebreaker(responseId, DEFAULT_USER_ID);
      if (onNavigateToChat) {
        onNavigateToChat(data.conversationId, data.partnerName);
      } else {
        alert(`Conversation created with ${data.partnerName}!\n\nContext Starter:\n${data.icebreakerMessage}`);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to initiate icebreaker conversation');
    } finally {
      setIcebreakerTriggering(null);
    }
  };

  const handleRunCompatibilityCheck = async () => {
    setCompatLoading(true);
    try {
      const result = await SoulPromptsApiClient.computeCompatibility(targetUserId, DEFAULT_USER_ID);
      setCompatInsight(result);
    } catch (err: any) {
      alert(err.message || 'Failed to compute compatibility');
    } finally {
      setCompatLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20">
      {/* Top Banner / Breadcrumb */}
      <div className="border-b border-white/10 bg-slate-900/60 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-violet-600 via-rose-500 to-amber-400 flex items-center justify-center shadow-lg shadow-rose-500/20">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold tracking-tight text-white">Soul Prompts & Resonance Sanctuary</h1>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30">
                  Single-Player Value
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Daily introspection, community empathy sharing, and value-anchored compatibility.
              </p>
            </div>
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition"
            >
              Back
            </button>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="max-w-4xl mx-auto px-4 flex gap-2 overflow-x-auto no-scrollbar pb-2">
          <button
            onClick={() => setActiveTab('today')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'today'
                ? 'bg-gradient-to-r from-violet-600 to-rose-600 text-white shadow-md'
                : 'bg-white/5 hover:bg-white/10 text-slate-400'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Today's Reflection
          </button>

          <button
            onClick={() => setActiveTab('circle')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'circle'
                ? 'bg-gradient-to-r from-violet-600 to-rose-600 text-white shadow-md'
                : 'bg-white/5 hover:bg-white/10 text-slate-400'
            }`}
          >
            <Users className="w-4 h-4" />
            Community Resonance ({totalResponses || 0})
          </button>

          <button
            onClick={() => setActiveTab('journal')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'journal'
                ? 'bg-gradient-to-r from-violet-600 to-rose-600 text-white shadow-md'
                : 'bg-white/5 hover:bg-white/10 text-slate-400'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            My Soul Journal ({journal.totalEntries})
          </button>

          <button
            onClick={() => setActiveTab('compatibility')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'compatibility'
                ? 'bg-gradient-to-r from-violet-600 to-rose-600 text-white shadow-md'
                : 'bg-white/5 hover:bg-white/10 text-slate-400'
            }`}
          >
            <Compass className="w-4 h-4" />
            Compatibility Mirror
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* ==================================================================== */}
        {/* TAB 1: TODAY'S REFLECTION */}
        {/* ==================================================================== */}
        {activeTab === 'today' && (
          <div className="space-y-6">
            {/* Featured Question Hero Card */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-900 border border-violet-500/30 p-6 md:p-8 shadow-2xl">
              <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="flex items-center justify-between gap-4 mb-4">
                <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30">
                  {todayPrompt.dimensionTag}
                </span>
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <CalendarIcon className="w-3.5 h-3.5" />
                  {todayPrompt.displayDate || 'Daily Introspection'}
                </span>
              </div>

              <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight leading-snug mb-3">
                "{todayPrompt.promptQuestion}"
              </h2>

              <p className="text-sm text-slate-300/90 leading-relaxed italic border-l-2 border-rose-500/50 pl-4 py-1 mb-6">
                {todayPrompt.philosophicalContext}
              </p>

              {/* Response Form */}
              <form onSubmit={handleSubmitResponse} className="space-y-4 pt-2 border-t border-white/10">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-2">
                    Your Unfiltered Truth:
                  </label>
                  <textarea
                    rows={4}
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                    placeholder="Write honestly for yourself first. What has your lived experience taught you?..."
                    className="w-full rounded-2xl bg-slate-950/70 border border-white/10 focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/20 text-white p-4 text-sm resize-none outline-none placeholder-slate-500 transition"
                  />
                </div>

                {/* Mood Tag Selector */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-2">
                    Emotional Tone (Mood Anchor):
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {(['reflective', 'vulnerable', 'peaceful', 'hopeful', 'melancholic', 'empowered'] as MoodTag[]).map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setMoodTag(m)}
                        className={`text-xs px-3 py-1.5 rounded-xl font-medium capitalize transition ${
                          moodTag === m
                            ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                            : 'bg-white/5 hover:bg-white/10 text-slate-400'
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Privacy & Destination Selector */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-2">
                    Where does this reflection go?
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setVisibility('private')}
                      className={`p-3 rounded-2xl border text-left transition flex items-start gap-3 ${
                        visibility === 'private'
                          ? 'border-violet-500 bg-violet-950/40 text-white'
                          : 'border-white/10 bg-white/5 text-slate-400 hover:border-white/20'
                      }`}
                    >
                      <Lock className="w-5 h-5 text-violet-400 shrink-0 mt-0.5" />
                      <div>
                        <div className="text-xs font-bold text-white">Private Sanctuary Only</div>
                        <div className="text-[11px] text-slate-400 leading-tight">
                          Only visible in your personal soul journal.
                        </div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setVisibility('community_anonymous')}
                      className={`p-3 rounded-2xl border text-left transition flex items-start gap-3 ${
                        visibility === 'community_anonymous'
                          ? 'border-violet-500 bg-violet-950/40 text-white'
                          : 'border-white/10 bg-white/5 text-slate-400 hover:border-white/20'
                      }`}
                    >
                      <EyeOff className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                      <div>
                        <div className="text-xs font-bold text-white">Anonymous Community Circle</div>
                        <div className="text-[11px] text-slate-400 leading-tight">
                          Shared anonymously with a poetic alias.
                        </div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setVisibility('profile_pinned')}
                      className={`p-3 rounded-2xl border text-left transition flex items-start gap-3 ${
                        visibility === 'profile_pinned'
                          ? 'border-violet-500 bg-violet-950/40 text-white'
                          : 'border-white/10 bg-white/5 text-slate-400 hover:border-white/20'
                      }`}
                    >
                      <Tag className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <div className="text-xs font-bold text-white">Profile Anchor Value</div>
                        <div className="text-[11px] text-slate-400 leading-tight">
                          Pinned on your dating profile as a conversation beacon.
                        </div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setVisibility('community_public')}
                      className={`p-3 rounded-2xl border text-left transition flex items-start gap-3 ${
                        visibility === 'community_public'
                          ? 'border-violet-500 bg-violet-950/40 text-white'
                          : 'border-white/10 bg-white/5 text-slate-400 hover:border-white/20'
                      }`}
                    >
                      <Globe className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <div className="text-xs font-bold text-white">Public Resonance Circle</div>
                        <div className="text-[11px] text-slate-400 leading-tight">
                          Shared with your name and avatar to invite kindred souls.
                        </div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Custom Alias if Anonymous */}
                {visibility === 'community_anonymous' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Poetic Alias (Optional):
                    </label>
                    <input
                      type="text"
                      value={customAlias}
                      onChange={(e) => setCustomAlias(e.target.value)}
                      placeholder="e.g. Quiet Thinker, Midnight Reader, Ocean Wanderer"
                      className="w-full sm:w-80 rounded-xl bg-slate-950/70 border border-white/10 focus:border-violet-500 text-white px-3 py-2 text-xs outline-none"
                    />
                  </div>
                )}

                {/* Submit Feedback */}
                {submitFeedback && (
                  <div className="p-3 rounded-xl bg-violet-500/20 border border-violet-500/30 text-xs text-violet-200">
                    {submitFeedback}
                  </div>
                )}

                <div className="flex items-center justify-between pt-2">
                  <div className="text-xs text-slate-400">
                    {myResponse ? (
                      <span className="flex items-center gap-1 text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Answered & Persisted
                      </span>
                    ) : (
                      'Zero pressure. Write only what feels authentic.'
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 rounded-2xl font-bold text-xs bg-gradient-to-r from-violet-600 via-rose-500 to-amber-500 hover:opacity-95 text-white shadow-lg shadow-violet-500/25 transition disabled:opacity-50"
                  >
                    {isSubmitting ? 'Saving...' : myResponse ? 'Update Reflection' : 'Save Reflection'}
                  </button>
                </div>
              </form>
            </div>

            {/* Why This Matters Explainer */}
            <div className="rounded-2xl bg-white/5 border border-white/10 p-5 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5 text-violet-300" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-white">Why Single-Player Soul Prompts?</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Most dating apps only give you value when someone swipes right on you. Soulverse is designed to be deeply rewarding even if you have zero matches: answering daily introspective questions brings emotional clarity, builds your living profile anchors, and lets you resonate with kindred spirits without awkward small talk.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* TAB 2: COMMUNITY RESONANCE CIRCLE */}
        {/* ==================================================================== */}
        {activeTab === 'circle' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">Community Resonance Circle</h3>
                <p className="text-xs text-slate-400">
                  Read reflections from other souls on today's prompt. Empathize with reactions or send a prompt icebreaker.
                </p>
              </div>
              <span className="text-xs text-slate-400">
                Prompt: <span className="text-violet-400 font-semibold">{todayPrompt.dimensionTag}</span>
              </span>
            </div>

            {loadingCircle ? (
              <div className="text-center py-12 text-sm text-slate-400">
                Listening for community echoes...
              </div>
            ) : communityResponses.length === 0 ? (
              <div className="rounded-3xl bg-slate-900/50 border border-white/10 p-8 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-violet-500/10 flex items-center justify-center mx-auto text-violet-400">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-white">Be the First Echo in the Circle</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  No community responses have been shared yet for today's prompt. Share your reflection on the Today tab to inspire others!
                </p>
                <button
                  onClick={() => setActiveTab('today')}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-violet-600 text-white"
                >
                  Write Your Answer
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {communityResponses.map((item) => {
                  const isFelt = item.userResonances?.includes('felt_deeply');
                  const isMindShifted = item.userResonances?.includes('mind_shifted');
                  const isInspired = item.userResonances?.includes('inspired');

                  return (
                    <div
                      key={item.id}
                      className="rounded-3xl bg-slate-900/70 border border-white/10 hover:border-violet-500/30 p-5 flex flex-col justify-between transition group shadow-md"
                    >
                      <div className="space-y-3">
                        {/* Author Header */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            {item.authorAvatar ? (
                              <img
                                src={item.authorAvatar}
                                alt={item.authorName}
                                className="w-7 h-7 rounded-full object-cover border border-white/20"
                              />
                            ) : (
                              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-violet-600 to-rose-500 flex items-center justify-center text-[10px] font-bold text-white">
                                {(item.authorAlias || 'S')[0]}
                              </div>
                            )}
                            <div>
                              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                                {item.authorName || item.authorAlias || 'Kindred Spirit'}
                                {item.isOwner && (
                                  <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-violet-500/20 text-violet-300 font-bold">
                                    You
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] text-slate-500 capitalize">
                                Mood: {item.moodTag}
                              </div>
                            </div>
                          </div>

                          <span className="text-[10px] text-slate-500">
                            {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>

                        {/* Reflection Content */}
                        <p className="text-xs text-slate-200 leading-relaxed italic bg-white/5 p-3.5 rounded-2xl border border-white/5">
                          "{item.responseText}"
                        </p>
                      </div>

                      {/* Resonance Reactions & Icebreaker Trigger */}
                      <div className="pt-4 mt-2 border-t border-white/5 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleResonate(item.id, 'felt_deeply')}
                            className={`px-2.5 py-1 rounded-xl text-[11px] font-medium flex items-center gap-1 transition ${
                              isFelt
                                ? 'bg-rose-500 text-white'
                                : 'bg-white/5 hover:bg-white/10 text-slate-400'
                            }`}
                            title="Felt Deeply"
                          >
                            <Heart className="w-3 h-3" />
                            <span>{item.reactionFeltDeeply || 0}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleResonate(item.id, 'mind_shifted')}
                            className={`px-2.5 py-1 rounded-xl text-[11px] font-medium flex items-center gap-1 transition ${
                              isMindShifted
                                ? 'bg-amber-500 text-white'
                                : 'bg-white/5 hover:bg-white/10 text-slate-400'
                            }`}
                            title="Mind Shifted"
                          >
                            <Zap className="w-3 h-3" />
                            <span>{item.reactionMindShifted || 0}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleResonate(item.id, 'inspired')}
                            className={`px-2.5 py-1 rounded-xl text-[11px] font-medium flex items-center gap-1 transition ${
                              isInspired
                                ? 'bg-violet-500 text-white'
                                : 'bg-white/5 hover:bg-white/10 text-slate-400'
                            }`}
                            title="Inspired"
                          >
                            <Sparkles className="w-3 h-3" />
                            <span>{item.reactionInspired || 0}</span>
                          </button>
                        </div>

                        {/* 1-Click Icebreaker Button (Disabled for owner or anonymous) */}
                        {!item.isOwner && item.visibility !== 'community_anonymous' && (
                          <button
                            type="button"
                            disabled={icebreakerTriggering === item.id}
                            onClick={() => handleStartPromptIcebreaker(item.id)}
                            className="px-3 py-1 rounded-xl text-[11px] font-bold bg-violet-600/30 hover:bg-violet-600 text-violet-200 hover:text-white border border-violet-500/30 transition flex items-center gap-1"
                          >
                            <MessageCircle className="w-3 h-3" />
                            <span>{icebreakerTriggering === item.id ? 'Connecting...' : 'Connect'}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ==================================================================== */}
        {/* TAB 3: MY SOUL JOURNAL ARCHIVE */}
        {/* ==================================================================== */}
        {activeTab === 'journal' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">My Personal Soul Journal</h3>
                <p className="text-xs text-slate-400">
                  Your private history of emotional reflections, personal growth, and self-discoveries.
                </p>
              </div>
              <div className="text-xs font-bold px-3 py-1 rounded-full bg-violet-500/20 text-violet-300">
                {journal.totalEntries} {journal.totalEntries === 1 ? 'Entry' : 'Entries'}
              </div>
            </div>

            {/* Mood Frequency Overview */}
            {Object.keys(journal.moodStats).length > 0 && (
              <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
                <div className="text-xs font-bold text-slate-300 mb-2">Mood Fingerprint</div>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(journal.moodStats).map(([mood, count]) => (
                    <span
                      key={mood}
                      className="px-3 py-1 rounded-xl text-xs font-medium bg-slate-800 text-slate-300 border border-white/5 capitalize"
                    >
                      {mood}: <strong className="text-white">{count}</strong>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {loadingJournal ? (
              <div className="text-center py-12 text-sm text-slate-400">
                Opening your sanctuary archives...
              </div>
            ) : journal.entries.length === 0 ? (
              <div className="rounded-3xl bg-slate-900/50 border border-white/10 p-8 text-center space-y-3">
                <BookOpen className="w-8 h-8 text-violet-400 mx-auto" />
                <h4 className="text-sm font-bold text-white">Your Sanctuary is Empty</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  You haven't responded to any introspective soul prompts yet. Start with today's reflection!
                </p>
                <button
                  onClick={() => setActiveTab('today')}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-violet-600 text-white"
                >
                  Start Introspection
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {journal.entries.map(({ response, prompt }) => (
                  <div
                    key={response.id}
                    className="rounded-3xl bg-slate-900/70 border border-white/10 p-5 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30">
                          {prompt.dimensionTag}
                        </span>
                        <span className="text-xs text-slate-400">
                          {new Date(response.createdAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                      </div>

                      <span className="text-[11px] text-slate-400 capitalize px-2 py-0.5 rounded-md bg-white/5">
                        Visibility: {response.visibility.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="text-sm font-semibold text-white">
                      "{prompt.promptQuestion}"
                    </div>

                    <p className="text-xs text-slate-200 leading-relaxed italic bg-white/5 p-3.5 rounded-2xl border border-white/5">
                      "{response.responseText}"
                    </p>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                      <span className="capitalize">Mood: {response.moodTag}</span>
                      <div className="flex items-center gap-3">
                        <span>❤️ {response.reactionFeltDeeply || 0} Felt</span>
                        <span>⚡ {response.reactionMindShifted || 0} Shifted</span>
                        <span>✨ {response.reactionInspired || 0} Inspired</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ==================================================================== */}
        {/* TAB 4: COMPATIBILITY MIRROR */}
        {/* ==================================================================== */}
        {activeTab === 'compatibility' && (
          <div className="space-y-6">
            <div className="rounded-3xl bg-gradient-to-br from-indigo-950/60 to-slate-900 border border-violet-500/30 p-6 md:p-8 space-y-4 shadow-xl">
              <div className="flex items-center gap-3">
                <Compass className="w-6 h-6 text-violet-400" />
                <h3 className="text-base font-bold text-white">Dynamic Soul Compatibility Engine</h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Unlike traditional dating apps that produce arbitrary percentage scores from superficial swipe tags, Soulverse computes resonance scores from shared introspective dimensions (e.g., #EmotionalSafety, #BoundaryClarity, #VulnerableTruth).
              </p>

              <div className="flex items-center gap-3 pt-2">
                <input
                  type="text"
                  value={targetUserId}
                  onChange={(e) => setTargetUserId(e.target.value)}
                  placeholder="Target User ID (e.g. usr_peer_test, usr_aria)"
                  className="rounded-xl bg-slate-950 border border-white/10 px-3 py-2 text-xs text-white outline-none focus:border-violet-500"
                />
                <button
                  type="button"
                  disabled={compatLoading}
                  onClick={handleRunCompatibilityCheck}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-violet-600 hover:bg-violet-500 text-white shadow-md disabled:opacity-50 transition"
                >
                  {compatLoading ? 'Calculating Synergy...' : 'Calculate Synergy'}
                </button>
              </div>
            </div>

            {compatInsight && (
              <div className="rounded-3xl bg-slate-900/80 border border-white/10 p-6 space-y-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={compatInsight.targetAvatar}
                      alt={compatInsight.targetName}
                      className="w-12 h-12 rounded-full object-cover border-2 border-violet-500"
                    />
                    <div>
                      <h4 className="text-sm font-bold text-white">{compatInsight.targetName}</h4>
                      <p className="text-xs text-slate-400">
                        {compatInsight.sharedPromptResponsesCount} shared introspective questions answered
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-2xl font-black bg-gradient-to-r from-violet-400 via-rose-400 to-amber-300 bg-clip-text text-transparent">
                      {compatInsight.compatibilityScore}%
                    </div>
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Resonance Index</div>
                  </div>
                </div>

                {/* Shared Dimensions */}
                <div>
                  <div className="text-xs font-bold text-slate-300 mb-2">Mutual Value Anchors:</div>
                  <div className="flex flex-wrap gap-2">
                    {compatInsight.sharedDimensions.map((dim) => (
                      <span
                        key={dim}
                        className="text-xs px-3 py-1 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30 font-semibold"
                      >
                        {dim}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Synergy Insights */}
                <div>
                  <div className="text-xs font-bold text-slate-300 mb-2">Why You Align:</div>
                  <div className="space-y-2">
                    {compatInsight.synergyInsights.map((insight, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-2xl bg-white/5 border border-white/5 text-xs text-slate-200 flex items-start gap-2.5"
                      >
                        <Sparkles className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                        <span>{insight}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recommended Icebreakers */}
                <div>
                  <div className="text-xs font-bold text-slate-300 mb-2">Curated Icebreakers:</div>
                  <div className="space-y-2">
                    {compatInsight.recommendedIcebreakers.map((starter, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-2xl bg-violet-950/30 border border-violet-500/20 text-xs text-violet-200 flex items-center justify-between gap-3"
                      >
                        <span className="italic">"{starter}"</span>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard?.writeText(starter);
                            alert('Copied icebreaker to clipboard!');
                          }}
                          className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-white/10 hover:bg-white/20 text-white transition shrink-0"
                        >
                          Copy
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

function CalendarIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      viewBox="0 0 24 24"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
      <line x1="16" x2="16" y1="2" y2="6" />
      <line x1="8" x2="8" y1="2" y2="6" />
      <line x1="3" x2="21" y1="10" y2="10" />
    </svg>
  );
}
export default SoulJournalSanctuary;
