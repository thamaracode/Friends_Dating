import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  Users, 
  Brain, 
  Sparkles, 
  Bookmark, 
  Share2, 
  CheckCircle2, 
  Circle, 
  Flame, 
  Sliders, 
  Calendar, 
  ChevronRight, 
  MessageSquare, 
  X, 
  Send, 
  ArrowLeft,
  Clock,
  ShieldCheck,
  Compass
} from 'lucide-react';

import { dailyConnectionClient } from '../services/dailyConnectionApiClient';
import type { 
  DailyTab, 
  DailyAssignmentItem, 
  DailyPreferences, 
  DailyStreak, 
  DailyContentCategory,
  DailyEdition,
  RelationshipSituation,
  FriendshipTrack
} from '../types/dailyConnection';

interface DailyConnectionHubProps {
  onBackToHome?: () => void;
}

export const DailyConnectionHub: React.FC<DailyConnectionHubProps> = ({ onBackToHome }) => {
  const [activeTab, setActiveTab] = useState<DailyTab>('love');
  const [editions, setEditions] = useState<Record<DailyTab, DailyAssignmentItem> | null>(null);
  const [preferences, setPreferences] = useState<DailyPreferences | null>(null);
  const [streak, setStreak] = useState<DailyStreak | null>(null);
  const [categories, setCategories] = useState<DailyContentCategory[]>([]);
  const [loading, setLoading] = useState(true);

  // Interaction State
  const [reflectionInput, setReflectionInput] = useState('');
  const [isSavingReflection, setIsSavingReflection] = useState(false);
  const [isPersonalizeOpen, setIsPersonalizeOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isSavedDrawerOpen, setIsSavedDrawerOpen] = useState(false);
  const [savedItems, setSavedItems] = useState<DailyAssignmentItem[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [historyItems, setHistoryItems] = useState<DailyAssignmentItem[]>([]);

  // Form state for personalization
  const [editEdition, setEditEdition] = useState<DailyEdition>('universal');
  const [editSituation, setEditSituation] = useState<RelationshipSituation>('single');
  const [editFriendTrack, setEditFriendTrack] = useState<FriendshipTrack>('making_new_friends');

  const loadDailyData = async () => {
    try {
      setLoading(true);
      const [todayData, catsData] = await Promise.all([
        dailyConnectionClient.getToday('usr_me'),
        dailyConnectionClient.getCategories()
      ]);

      setEditions(todayData.editions);
      setPreferences(todayData.preferences);
      setStreak(todayData.streak);
      setCategories(catsData);

      if (todayData.preferences) {
        setEditEdition(todayData.preferences.edition_preference);
        setEditSituation(todayData.preferences.relationship_status);
        setEditFriendTrack(todayData.preferences.friendship_track);
      }
    } catch (err) {
      console.error('Error loading daily connection intelligence:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDailyData();
  }, []);

  const currentItem = editions ? editions[activeTab] : null;

  useEffect(() => {
    if (currentItem?.reflection_answer) {
      setReflectionInput(currentItem.reflection_answer);
    } else {
      setReflectionInput('');
    }
  }, [activeTab, currentItem]);

  const handleToggleLike = async () => {
    if (!currentItem) return;
    try {
      const active = await dailyConnectionClient.toggleFeedback(currentItem.content_id, 'like');
      setEditions(prev => {
        if (!prev) return null;
        const updated = { ...prev[activeTab] };
        updated.is_liked = active;
        updated.likes_count += active ? 1 : -1;
        return { ...prev, [activeTab]: updated };
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleSave = async () => {
    if (!currentItem) return;
    try {
      const active = await dailyConnectionClient.toggleFeedback(currentItem.content_id, 'save');
      setEditions(prev => {
        if (!prev) return null;
        const updated = { ...prev[activeTab] };
        updated.is_saved = active;
        updated.saves_count += active ? 1 : -1;
        return { ...prev, [activeTab]: updated };
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmitReflection = async () => {
    if (!currentItem || !reflectionInput.trim()) return;
    try {
      setIsSavingReflection(true);
      await dailyConnectionClient.submitReflection(currentItem.id, reflectionInput.trim());
      setEditions(prev => {
        if (!prev) return null;
        const updated = { ...prev[activeTab], reflection_answer: reflectionInput.trim() };
        return { ...prev, [activeTab]: updated };
      });
      if (streak) {
        setStreak({ ...streak, total_reflections: streak.total_reflections + 1 });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingReflection(false);
    }
  };

  const handleToggleChallenge = async () => {
    if (!currentItem) return;
    const nextState = !currentItem.challenge_completed;
    try {
      await dailyConnectionClient.completeChallenge(currentItem.id, nextState);
      setEditions(prev => {
        if (!prev) return null;
        const updated = { ...prev[activeTab], challenge_completed: nextState ? 1 : 0 };
        return { ...prev, [activeTab]: updated };
      });
      if (streak && nextState) {
        setStreak({ ...streak, total_challenges_done: streak.total_challenges_done + 1 });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSavePreferences = async () => {
    try {
      await dailyConnectionClient.updatePreferences({
        userId: 'usr_me',
        edition_preference: editEdition,
        relationship_status: editSituation,
        friendship_track: editFriendTrack
      });
      setIsPersonalizeOpen(false);
      // Reload assigned content with new preferences
      loadDailyData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenSaved = async () => {
    try {
      const items = await dailyConnectionClient.getSaved('usr_me');
      setSavedItems(items);
      setIsSavedDrawerOpen(true);
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenHistory = async () => {
    try {
      const hist = await dailyConnectionClient.getHistory('usr_me');
      setHistoryItems(hist);
      setIsHistoryOpen(true);
    } catch (err) {
      console.error(err);
    }
  };

  const tabsConfig = [
    { 
      id: 'love' as DailyTab, 
      label: 'Daily Love', 
      sublabel: 'Romance & Relationships',
      icon: Heart, 
      color: '#D7374B'
    },
    { 
      id: 'friendship' as DailyTab, 
      label: 'Daily Friendship', 
      sublabel: 'Trust & Human Connection',
      icon: Users, 
      color: '#D7374B'
    },
    { 
      id: 'mind' as DailyTab, 
      label: 'Daily Mind', 
      sublabel: 'Psychology & Awareness',
      icon: Brain, 
      color: '#D7374B'
    },
    { 
      id: 'growth' as DailyTab, 
      label: 'Daily Growth', 
      sublabel: 'Motivation & Self-Worth',
      icon: Sparkles, 
      color: '#D7374B'
    }
  ];

  if (loading) {
    return (
      <div className="w-full min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 rounded-full border-2 border-[#D7374B] border-t-transparent animate-spin" />
        <p className="text-xs text-[#A898A7] tracking-wider uppercase">Loading Today's Connection Intelligence...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 pb-12 animate-fadeIn">
      
      {/* ===================================================================== */}
      {/* 1. TOP HEADER & STREAK BANNER                                         */}
      {/* ===================================================================== */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            {onBackToHome && (
              <button 
                onClick={onBackToHome}
                className="p-1.5 rounded-xl dark-glass border border-white/[0.08] text-[#A898A7] hover:text-[#F2EBF0] cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <h1 className="text-xl sm:text-2xl font-black text-[#F2EBF0] font-serif flex items-center gap-2">
              <span>Daily Connection</span>
              <span className="text-[#D7374B] text-sm">✧</span>
            </h1>
          </div>
          <p className="text-xs text-[#A898A7]">
            Personalized Relationship & Human Connection Intelligence • Helping you love, understand and connect.
          </p>
        </div>

        {/* Streaks & Personalization Controls */}
        <div className="flex items-center gap-2.5">
          {streak && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full dark-glass border border-[#D7374B]/35 text-[#FFA4B2] text-xs font-bold shadow-md">
              <Flame className="w-4 h-4 text-[#D7374B] fill-[#D7374B]" />
              <span>{streak.current_streak} Day Streak</span>
            </div>
          )}

          <button
            onClick={() => setIsPersonalizeOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full dark-glass hover:bg-white/[0.08] border border-white/[0.08] text-xs font-medium text-[#F2EBF0] transition-colors cursor-pointer"
            title="Personalize your daily track"
          >
            <Sliders className="w-3.5 h-3.5 text-[#A898A7]" />
            <span className="hidden sm:inline">Personalize</span>
          </button>

          <button
            onClick={handleOpenSaved}
            className="p-2 rounded-full dark-glass hover:bg-white/[0.08] border border-white/[0.08] text-[#A898A7] hover:text-[#FFA4B2] transition-colors cursor-pointer"
            title="Saved Wisdom"
          >
            <Bookmark className="w-4 h-4" />
          </button>

          <button
            onClick={handleOpenHistory}
            className="p-2 rounded-full dark-glass hover:bg-white/[0.08] border border-white/[0.08] text-[#A898A7] hover:text-[#FFA4B2] transition-colors cursor-pointer"
            title="Past Reflections"
          >
            <Calendar className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 2. THE 4 PERMANENT TABS                                               */}
      {/* ===================================================================== */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {tabsConfig.map(t => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`p-3.5 rounded-2xl flex flex-col text-left transition-all cursor-pointer relative overflow-hidden group ${
                isActive
                  ? 'dark-glass border border-[#D7374B]/50 shadow-[0_0_20px_rgba(215,55,75,0.18)]'
                  : 'dark-glass-card hover:border-white/20'
              }`}
            >
              {isActive && (
                <div 
                  className="absolute inset-x-0 top-0 h-1 bg-[#D7374B]"
                />
              )}
              <div className="flex items-center justify-between mb-1.5">
                <div 
                  className={`w-7 h-7 rounded-xl flex items-center justify-center ${
                    isActive ? 'bg-[#D7374B]/20 text-[#FFA4B2]' : 'bg-white/[0.05] text-[#A898A7]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                {editions && editions[t.id]?.is_saved && (
                  <Bookmark className="w-3.5 h-3.5 text-[#D7374B] fill-[#D7374B]" />
                )}
              </div>
              <span className={`text-xs font-bold ${isActive ? 'text-[#F2EBF0]' : 'text-[#A898A7]'}`}>
                {t.label}
              </span>
              <span className="text-[10px] text-[#A898A7] line-clamp-1">
                {t.sublabel}
              </span>
            </button>
          );
        })}
      </div>

      {/* ===================================================================== */}
      {/* 3. TODAY'S PRIMARY EDITION CARD (Frosted Dark Glass)                  */}
      {/* ===================================================================== */}
      {currentItem ? (
        <div className="rounded-3xl dark-glass border border-white/[0.08] overflow-hidden shadow-2xl relative">
          
          {/* Banner Artwork & Category Badges */}
          <div className="relative h-48 sm:h-56 w-full overflow-hidden bg-[#060507]">
            <img 
              src={currentItem.cover_image_url || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80'}
              alt={currentItem.title}
              className="w-full h-full object-cover opacity-50 filter contrast-110 saturate-110"
            />
            {/* Dark glass subtle fade */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0E0A11] via-[#0E0A11]/60 to-transparent" />
            
            {/* Edition & Category Metadata Pill */}
            <div className="absolute top-4 left-4 sm:left-6 flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold dark-glass border border-white/10 text-[#F2EBF0] backdrop-blur-md flex items-center gap-1.5">
                <span>{currentItem.category_icon}</span>
                <span>{currentItem.category_name}</span>
              </span>
              <span className="px-2.5 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider dark-glass border border-[#D7374B]/35 text-[#FFA4B2] backdrop-blur-md">
                Today's {currentItem.format_type.replace('_', ' ')}
              </span>
            </div>

            {/* Quick Share Pill */}
            <div className="absolute top-4 right-4 sm:right-6">
              <button
                onClick={() => setIsShareModalOpen(true)}
                className="px-3 py-1.5 rounded-full text-xs font-medium dark-glass hover:bg-white/[0.08] border border-white/10 text-[#F2EBF0] backdrop-blur-md flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Share Card</span>
              </button>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="p-6 sm:p-8 space-y-6 -mt-10 relative z-10">
            
            {/* The Core Quote / One-Liner */}
            <div className="space-y-3">
              <h2 className="text-xl sm:text-2xl font-black text-[#F2EBF0] font-serif leading-snug">
                "{currentItem.quote_one_liner}"
              </h2>
              <div className="flex items-center gap-2 text-xs text-[#A898A7]">
                <span className="uppercase tracking-wider font-bold text-[10px] text-[#D7374B]">
                  {currentItem.title}
                </span>
                <span>•</span>
                <span>{currentItem.author_or_source}</span>
              </div>
            </div>

            {/* Deep In-Depth Thought Insight */}
            <div className="p-4 sm:p-5 rounded-2xl dark-glass border border-white/[0.07] space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#A898A7] block">
                Today's Insight & Context
              </span>
              <p className="text-sm text-[#F2EBF0] leading-relaxed">
                {currentItem.body_insight}
              </p>
            </div>

            {/* Daily Reflection Question (Interactive) */}
            {currentItem.reflection_question && (
              <div className="p-5 rounded-2xl dark-glass border border-white/[0.08] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#F2EBF0] flex items-center gap-1.5">
                    <span className="text-[#D7374B]">💭</span>
                    <span>Daily Reflection Question</span>
                  </span>
                  {currentItem.reflection_answer && (
                    <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Reflected</span>
                    </span>
                  )}
                </div>

                <p className="text-xs text-[#F2EBF0] font-medium italic">
                  "{currentItem.reflection_question}"
                </p>

                <div className="space-y-2 pt-1">
                  <textarea
                    value={reflectionInput}
                    onChange={(e) => setReflectionInput(e.target.value)}
                    placeholder="Write your honest thoughts here (saved privately to your Personal Memoir)..."
                    className="w-full h-20 p-3 rounded-xl bg-black/40 border border-white/[0.08] text-xs text-[#F2EBF0] placeholder-[#A898A7]/50 focus:outline-none focus:border-[#D7374B]/60 transition-colors resize-none"
                  />
                  <div className="flex justify-end">
                    <button
                      onClick={handleSubmitReflection}
                      disabled={isSavingReflection || !reflectionInput.trim()}
                      className="px-4 py-1.5 rounded-xl light-red-gradient-btn text-white text-xs font-bold shadow-md hover:brightness-110 disabled:opacity-50 cursor-pointer transition-all flex items-center gap-1.5"
                    >
                      <Send className="w-3 h-3" />
                      <span>{isSavingReflection ? 'Saving...' : 'Save Reflection'}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Relationship / Friendship Action Challenge (Interactive) */}
            {currentItem.action_exercise && (
              <div className="p-4 sm:p-5 rounded-2xl dark-glass border border-[#D7374B]/25 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#FFA4B2] flex items-center gap-1.5">
                    <span>🎯</span>
                    <span>Today's Connection Exercise</span>
                  </span>
                  <span className="text-[10px] text-[#A898A7]">Small deliberate practice</span>
                </div>

                <p className="text-xs text-[#F2EBF0] leading-relaxed">
                  {currentItem.action_exercise}
                </p>

                <button
                  onClick={handleToggleChallenge}
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    currentItem.challenge_completed
                      ? 'bg-emerald-950/70 border border-emerald-500/40 text-emerald-300'
                      : 'dark-glass border border-[#D7374B]/40 text-[#FFA4B2] hover:bg-[#D7374B]/15'
                  }`}
                >
                  {currentItem.challenge_completed ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Completed Today! (Growth Counted 🔥)</span>
                    </>
                  ) : (
                    <>
                      <Circle className="w-4 h-4" />
                      <span>Mark Exercise as Done</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Footer Action Controls: Like, Save, Share */}
            <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <button
                  onClick={handleToggleLike}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-colors cursor-pointer ${
                    currentItem.is_liked
                      ? 'bg-[#D7374B]/20 border border-[#D7374B]/60 text-[#FFA4B2]'
                      : 'dark-glass border border-white/[0.08] text-[#A898A7] hover:text-[#F2EBF0]'
                  }`}
                >
                  <Heart className={`w-3.5 h-3.5 ${currentItem.is_liked ? 'fill-[#D7374B] text-[#D7374B]' : ''}`} />
                  <span>{currentItem.likes_count}</span>
                </button>

                <button
                  onClick={handleToggleSave}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-colors cursor-pointer ${
                    currentItem.is_saved
                      ? 'bg-[#D7374B]/20 border border-[#D7374B]/60 text-[#FFA4B2]'
                      : 'dark-glass border border-white/[0.08] text-[#A898A7] hover:text-[#F2EBF0]'
                  }`}
                >
                  <Bookmark className={`w-3.5 h-3.5 ${currentItem.is_saved ? 'fill-[#D7374B] text-[#D7374B]' : ''}`} />
                  <span>{currentItem.is_saved ? 'Saved' : 'Save'}</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsShareModalOpen(true)}
                  className="p-2 rounded-full dark-glass hover:bg-white/[0.08] border border-white/[0.08] text-[#A898A7] hover:text-[#F2EBF0] transition-colors cursor-pointer"
                  title="Share quote card"
                >
                  <Share2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

          </div>

        </div>
      ) : (
        <div className="p-8 rounded-3xl dark-glass border border-white/[0.08] text-center text-xs text-[#A898A7]">
          No content scheduled for this track today.
        </div>
      )}
      {/* ===================================================================== */}
      {/* 4. MODAL: PERSONALIZATION SETTINGS                                    */}
      {/* ===================================================================== */}
      {isPersonalizeOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="w-full max-w-lg bg-[#160D19] border border-[#321323] rounded-3xl p-6 space-y-5 max-h-[90vh] overflow-y-auto no-scrollbar shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#321323]">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#85283C]" />
                <h3 className="text-sm font-bold text-[#E9DFE8]">Personalize Your Daily Connection</h3>
              </div>
              <button 
                onClick={() => setIsPersonalizeOpen(false)}
                className="p-1 rounded-xl text-[#A99BAA] hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Edition Preference */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#E9DFE8] block">Content Edition Preference</label>
              <p className="text-[10px] text-[#A99BAA]">Select the emotional perspective that best serves your growth:</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'universal', label: 'Universal Edition', desc: 'Balanced wisdom for everyone' },
                  { id: 'men', label: "Men's Edition", desc: 'Vulnerability, emotional strength & communication' },
                  { id: 'women', label: "Women's Edition", desc: 'Self-worth, voice & healthy boundaries' },
                  { id: 'mixed', label: 'Mixed Edition', desc: 'Rotating multidimensional insights' }
                ].map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => setEditEdition(opt.id as any)}
                    className={`p-3 rounded-2xl text-left border transition-all cursor-pointer ${
                      editEdition === opt.id
                        ? 'bg-[#321323] border-[#85283C] text-[#F0B8D3]'
                        : 'bg-[#09080D] border-[#321323] text-[#A99BAA] hover:border-white/20'
                    }`}
                  >
                    <span className="text-xs font-bold block">{opt.label}</span>
                    <span className="text-[9px] text-[#A99BAA] line-clamp-1">{opt.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Relationship Situation */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#E9DFE8] block">Current Relationship Stage</label>
              <select
                value={editSituation}
                onChange={(e) => setEditSituation(e.target.value as any)}
                className="w-full p-2.5 rounded-xl bg-[#09080D] border border-[#321323] text-xs text-[#E9DFE8] focus:outline-none focus:border-[#85283C]"
              >
                <option value="single">Single (Self-love, confidence, meeting people)</option>
                <option value="looking_for_love">Looking for Love (Dating, attraction, communication)</option>
                <option value="has_crush">Has a Crush (Expressing interest, reading signals)</option>
                <option value="dating">Dating (Expectations, compatibility, boundaries)</option>
                <option value="in_relationship">In a Relationship (Affection, trust, communication)</option>
                <option value="long_distance">Long-Distance (Reassurance, trust, connection)</option>
                <option value="engaged">Engaged (Commitment, preparation, partnership)</option>
                <option value="married">Married (Maintaining love and partnership)</option>
                <option value="complicated">Complicated (Clarity, boundaries, safety)</option>
                <option value="heartbroken">Heartbroken (Healing, acceptance, rebuilding)</option>
                <option value="recently_separated">Recently Separated (Recovery and rediscovering identity)</option>
                <option value="not_interested_in_romance">Not Interested in Romance (Friendship and independence)</option>
              </select>
            </div>

            {/* Friendship Track */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#E9DFE8] block">Friendship Growth Focus</label>
              <select
                value={editFriendTrack}
                onChange={(e) => setEditFriendTrack(e.target.value as any)}
                className="w-full p-2.5 rounded-xl bg-[#09080D] border border-[#321323] text-xs text-[#E9DFE8] focus:outline-none focus:border-[#203D62]"
              >
                <option value="making_new_friends">Making New Friends</option>
                <option value="maintaining_friendships">Maintaining Enduring Friendships</option>
                <option value="deepening_friendships">Deepening Emotional Trust with Close Friends</option>
                <option value="long_distance">Long-Distance Friends</option>
                <option value="friendship_conflicts">Navigating Friendship Conflicts Gracefully</option>
                <option value="rebuilding_trust">Rebuilding Trust After Tension</option>
                <option value="building_social_confidence">Building Social Confidence</option>
                <option value="finding_like_minded">Finding Like-Minded Souls</option>
              </select>
            </div>

            {/* Save Buttons */}
            <div className="pt-3 border-t border-[#321323] flex items-center justify-end gap-2.5">
              <button
                onClick={() => setIsPersonalizeOpen(false)}
                className="px-4 py-2 rounded-xl text-xs text-[#A99BAA] hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSavePreferences}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#85283C] to-[#79502D] text-white text-xs font-bold shadow-md hover:brightness-110 cursor-pointer"
              >
                Save Preferences
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 5. MODAL: SHAREABLE QUOTE CARD                                        */}
      {/* ===================================================================== */}
      {isShareModalOpen && currentItem && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="w-full max-w-md bg-[#09080D] border border-[#85283C]/40 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative">
            <button 
              onClick={() => setIsShareModalOpen(false)}
              className="absolute top-4 right-4 p-1 rounded-xl text-[#A99BAA] hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            {/* The Visual Card */}
            <div className="p-6 rounded-2xl bg-gradient-to-b from-[#160D19] to-[#09080D] border border-[#321323] space-y-4 text-center relative overflow-hidden shadow-inner">
              <span className="text-xl">🖤</span>
              <p className="text-base sm:text-lg font-black text-[#E9DFE8] font-serif leading-relaxed">
                "{currentItem.quote_one_liner}"
              </p>
              <div className="pt-2 border-t border-[#321323]/50">
                <span className="text-[11px] text-[#A99BAA] uppercase tracking-wider block font-bold">
                  {currentItem.category_name}
                </span>
                <span className="text-[10px] text-[#85283C] font-mono">
                  Soulverse • Daily Connection Intelligence
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`"${currentItem.quote_one_liner}" — ${currentItem.category_name} (via Soulverse)`);
                  alert("Quote copied to clipboard!");
                  setIsShareModalOpen(false);
                }}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#85283C] to-[#49315F] text-white text-xs font-bold shadow-md hover:brightness-110 cursor-pointer text-center"
              >
                Copy Text for Telegram / Instagram
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 6. DRAWER: SAVED WISDOM ARCHIVE                                       */}
      {/* ===================================================================== */}
      {isSavedDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex justify-end animate-fadeIn">
          <div className="w-full max-w-md bg-[#160D19] border-l border-[#321323] h-full p-6 space-y-5 overflow-y-auto no-scrollbar shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#321323]">
              <div className="flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-[#F8D2A6]" />
                <h3 className="text-sm font-bold text-[#E9DFE8]">Saved Daily Wisdom</h3>
              </div>
              <button onClick={() => setIsSavedDrawerOpen(false)} className="p-1 text-[#A99BAA]">
                <X className="w-4 h-4" />
              </button>
            </div>

            {savedItems.length === 0 ? (
              <p className="text-xs text-[#A99BAA] text-center py-12">No saved quotes yet. Tap the bookmark icon on any daily edition to save it here.</p>
            ) : (
              <div className="space-y-3">
                {savedItems.map((item, i) => (
                  <div key={i} className="p-4 rounded-2xl bg-[#09080D] border border-[#321323] space-y-2">
                    <span className="text-[10px] uppercase font-bold text-[#85283C] block">{item.category_name}</span>
                    <p className="text-xs font-bold text-[#E9DFE8] font-serif">"{item.quote_one_liner}"</p>
                    <p className="text-[11px] text-[#A99BAA] line-clamp-2">{item.body_insight}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 7. DRAWER: PAST REFLECTIONS JOURNAL                                   */}
      {/* ===================================================================== */}
      {isHistoryOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex justify-end animate-fadeIn">
          <div className="w-full max-w-md bg-[#160D19] border-l border-[#321323] h-full p-6 space-y-5 overflow-y-auto no-scrollbar shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#321323]">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#49315F]" />
                <h3 className="text-sm font-bold text-[#E9DFE8]">Your Past Reflections</h3>
              </div>
              <button onClick={() => setIsHistoryOpen(false)} className="p-1 text-[#A99BAA]">
                <X className="w-4 h-4" />
              </button>
            </div>

            {historyItems.length === 0 ? (
              <p className="text-xs text-[#A99BAA] text-center py-12">No reflections recorded yet. Answer today's reflection question above!</p>
            ) : (
              <div className="space-y-3">
                {historyItems.map((item, i) => (
                  <div key={i} className="p-4 rounded-2xl bg-[#09080D] border border-[#321323] space-y-2">
                    <div className="flex items-center justify-between text-[10px] text-[#A99BAA]">
                      <span className="font-mono">{item.local_date}</span>
                      <span className="capitalize">{item.tab} Edition</span>
                    </div>
                    <p className="text-xs font-bold text-[#E9DFE8] font-serif">"{item.quote_one_liner}"</p>
                    {item.reflection_answer && (
                      <div className="p-2.5 rounded-xl bg-[#1c1322] border border-[#49315F]/30 text-xs text-[#E2CEF7]">
                        <span className="text-[10px] font-bold block text-[#A99BAA]">Your Answer:</span>
                        <p className="mt-0.5">{item.reflection_answer}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
