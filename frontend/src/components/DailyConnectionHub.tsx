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
import { GlassModal, GlassButton } from './klyven';
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
      color: '#FFFFFF'
    },
    { 
      id: 'friendship' as DailyTab, 
      label: 'Daily Friendship', 
      sublabel: 'Trust & Human Connection',
      icon: Users, 
      color: '#FFFFFF'
    },
    { 
      id: 'mind' as DailyTab, 
      label: 'Daily Mind', 
      sublabel: 'Psychology & Awareness',
      icon: Brain, 
      color: '#FFFFFF'
    },
    { 
      id: 'growth' as DailyTab, 
      label: 'Daily Growth', 
      sublabel: 'Motivation & Self-Worth',
      icon: Sparkles, 
      color: '#FFFFFF'
    }
  ];

  if (loading) {
    return (
      <div className="w-full min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 rounded-full border-2 border-white border-t-transparent animate-spin" />
        <p className="text-xs text-zinc-400 tracking-wider uppercase">Loading Today's Connection Intelligence...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 pb-16 animate-fadeIn px-2 sm:px-4">
      
      {/* ===================================================================== */}
      {/* 1. TOP HEADER & STREAK BANNER                                         */}
      {/* ===================================================================== */}
      <div className="flex flex-wrap items-center justify-between gap-6 pb-6 border-b border-white/[0.08]">
        <div className="space-y-1.5">
          <div className="flex items-center gap-3">
            {onBackToHome && (
              <button 
                onClick={onBackToHome}
                className="h-10 w-10 rounded-xl dark-glass border border-white/[0.08] text-zinc-300 hover:text-white cursor-pointer flex items-center justify-center transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <h1 className="type-page-heading flex items-center gap-2.5">
              <span>Daily Connection</span>
              <span className="text-amber-400 font-normal">✧</span>
            </h1>
          </div>
          <p className="type-supporting">
            Personalized Relationship &amp; Human Connection Intelligence • Helping you love, understand and connect.
          </p>
        </div>

        {/* Streaks & Personalization Controls */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {streak && (
            <div className="flex items-center gap-2 h-10 px-4 rounded-full dark-glass border border-amber-400/25 text-amber-300 text-xs font-heading font-bold shadow-md bg-amber-400/10">
              <Flame className="w-4 h-4 text-amber-300 fill-amber-300" />
              <span>{streak.current_streak} Day Streak</span>
            </div>
          )}

          <button
            onClick={() => setIsPersonalizeOpen(true)}
            className="flex items-center gap-2 h-10 px-4 rounded-full dark-glass hover:bg-white/[0.08] border border-white/[0.12] text-xs font-heading font-semibold text-white transition-colors cursor-pointer"
            title="Personalize your daily track"
          >
            <Sliders className="w-3.5 h-3.5 text-zinc-400" />
            <span className="hidden sm:inline">Personalize</span>
          </button>

          <button
            onClick={handleOpenSaved}
            className="h-10 w-10 rounded-full dark-glass hover:bg-white/[0.08] border border-white/[0.12] text-zinc-300 hover:text-white transition-colors cursor-pointer flex items-center justify-center"
            title="Saved Wisdom"
          >
            <Bookmark className="w-4 h-4 text-amber-300" />
          </button>

          <button
            onClick={handleOpenHistory}
            className="h-10 w-10 rounded-full dark-glass hover:bg-white/[0.08] border border-white/[0.12] text-zinc-300 hover:text-white transition-colors cursor-pointer flex items-center justify-center"
            title="Past Reflections"
          >
            <Calendar className="w-4 h-4" />
          </button>

          <a
            href="#quotes"
            className="flex items-center gap-2 h-10 px-4 rounded-full dark-glass bg-amber-400/15 hover:bg-amber-400/25 border border-amber-400/30 text-xs font-heading font-bold text-amber-300 transition-colors cursor-pointer"
            title="Infinite Quotes Sanctuary"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span className="hidden sm:inline">Quotes Sanctuary</span>
          </a>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 2. THE 4 PERMANENT TABS                                               */}
      {/* ===================================================================== */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        {tabsConfig.map(t => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`p-4 sm:p-5 rounded-2xl flex flex-col text-left transition-all cursor-pointer relative overflow-hidden group ${
                isActive
                  ? 'dark-glass border border-amber-400/40 shadow-[0_0_20px_rgba(246,193,56,0.12)]'
                  : 'dark-glass-card hover:border-white/20'
              }`}
            >
              {isActive && (
                <div 
                  className="absolute inset-x-0 top-0 h-1 bg-amber-400"
                />
              )}
              <div className="flex items-center justify-between mb-2">
                <div 
                  className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                    isActive ? 'bg-amber-400/20 text-amber-300' : 'bg-white/[0.05] text-zinc-400'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                {editions && editions[t.id]?.is_saved && (
                  <Bookmark className="w-4 h-4 text-amber-400 fill-amber-400" />
                )}
              </div>
              <span className={`text-sm font-heading font-bold ${isActive ? 'text-white' : 'text-zinc-300'}`}>
                {t.label}
              </span>
              <span className="text-xs text-zinc-400 line-clamp-1 mt-0.5">
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
        <div className="sv-card p-0 overflow-hidden relative shadow-2xl">
          
          {/* Banner Artwork & Category Badges */}
          <div className="relative h-56 sm:h-64 w-full overflow-hidden bg-black/40">
            <img 
              src={currentItem.cover_image_url || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80'}
              alt={currentItem.title}
              className="w-full h-full object-cover opacity-50 filter contrast-110 saturate-110"
            />
            {/* Dark glass subtle fade */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#090A0E] via-[#090A0E]/60 to-transparent" />
            
            {/* Edition & Category Metadata Pill */}
            <div className="absolute top-5 left-5 sm:left-8 flex flex-wrap items-center gap-2.5">
              <span className="h-8 px-3.5 rounded-full text-xs font-heading font-bold dark-glass border border-white/15 text-white backdrop-blur-md flex items-center gap-2">
                <span>{currentItem.category_icon}</span>
                <span>{currentItem.category_name}</span>
              </span>
              <span className="h-8 px-3.5 rounded-full text-xs font-heading font-semibold uppercase tracking-wider dark-glass border border-white/20 text-zinc-200 backdrop-blur-md flex items-center">
                Today's {currentItem.format_type.replace('_', ' ')}
              </span>
            </div>

            {/* Quick Share Pill */}
            <div className="absolute top-5 right-5 sm:right-8">
              <button
                onClick={() => setIsShareModalOpen(true)}
                className="h-9 px-4 rounded-full text-xs font-heading font-semibold dark-glass hover:bg-white/[0.12] border border-white/15 text-white backdrop-blur-md flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Share Card</span>
              </button>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="p-8 sm:p-10 space-y-8 -mt-12 relative z-10">
            
            {/* The Core Quote in Playfair Editorial Type */}
            <div className="space-y-4">
              <h2 className="font-editorial italic text-2xl sm:text-3xl md:text-4xl text-white leading-relaxed font-normal">
                "{currentItem.quote_one_liner}"
              </h2>
              <div className="flex items-center gap-2.5 text-xs text-zinc-400">
                <span className="uppercase tracking-wider font-heading font-bold text-amber-300">
                  {currentItem.title}
                </span>
                <span>•</span>
                <span className="text-zinc-300 font-medium">{currentItem.author_or_source}</span>
              </div>
            </div>

            {/* Deep In-Depth Thought Insight */}
            <div className="p-6 sm:p-7 rounded-2xl dark-glass border border-white/[0.08] space-y-2.5">
              <span className="text-xs font-heading font-bold uppercase tracking-wider text-amber-300 block">
                Today's Insight &amp; Context
              </span>
              <p className="type-body text-zinc-200 leading-relaxed font-body">
                {currentItem.body_insight}
              </p>
            </div>

            {/* Daily Reflection Question (Interactive) */}
            {currentItem.reflection_question && (
              <div className="p-5 rounded-2xl dark-glass border border-white/[0.08] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span className="text-zinc-300">💭</span>
                    <span>Daily Reflection Question</span>
                  </span>
                  {currentItem.reflection_answer && (
                    <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Reflected</span>
                    </span>
                  )}
                </div>

                <p className="text-xs text-zinc-200 font-medium italic">
                  "{currentItem.reflection_question}"
                </p>

                <div className="space-y-2 pt-1">
                  <textarea
                    value={reflectionInput}
                    onChange={(e) => setReflectionInput(e.target.value)}
                    placeholder="Write your honest thoughts here (saved privately to your Personal Memoir)..."
                    className="w-full h-20 p-3 rounded-xl bg-black/40 border border-white/[0.08] text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white/30 transition-colors resize-none"
                  />
                  <div className="flex justify-end">
                    <button
                      onClick={handleSubmitReflection}
                      disabled={isSavingReflection || !reflectionInput.trim()}
                      className="px-4 py-1.5 rounded-xl gray-glass-btn text-white text-xs font-bold shadow-md hover:brightness-110 disabled:opacity-50 cursor-pointer transition-all flex items-center gap-1.5"
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
              <div className="p-4 sm:p-5 rounded-2xl dark-glass border border-white/15 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>🎯</span>
                    <span>Today's Connection Exercise</span>
                  </span>
                  <span className="text-[10px] text-zinc-400">Small deliberate practice</span>
                </div>

                <p className="text-xs text-zinc-200 leading-relaxed">
                  {currentItem.action_exercise}
                </p>

                <button
                  onClick={handleToggleChallenge}
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    currentItem.challenge_completed
                      ? 'bg-emerald-950/70 border border-emerald-500/40 text-emerald-300'
                      : 'dark-glass border border-white/20 text-white hover:bg-white/10'
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
                      ? 'bg-white/20 border border-white/40 text-white'
                      : 'dark-glass border border-white/[0.08] text-zinc-400 hover:text-white'
                  }`}
                >
                  <Heart className={`w-3.5 h-3.5 ${currentItem.is_liked ? 'fill-white text-white' : ''}`} />
                  <span>{currentItem.likes_count}</span>
                </button>

                <button
                  onClick={handleToggleSave}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-colors cursor-pointer ${
                    currentItem.is_saved
                      ? 'bg-white/20 border border-white/40 text-white'
                      : 'dark-glass border border-white/[0.08] text-zinc-400 hover:text-white'
                  }`}
                >
                  <Bookmark className={`w-3.5 h-3.5 ${currentItem.is_saved ? 'fill-white text-white' : ''}`} />
                  <span>{currentItem.is_saved ? 'Saved' : 'Save'}</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsShareModalOpen(true)}
                  className="p-2 rounded-full dark-glass hover:bg-white/[0.08] border border-white/[0.08] text-zinc-400 hover:text-white transition-colors cursor-pointer"
                  title="Share quote card"
                >
                  <Share2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

          </div>

        </div>
      ) : (
        <div className="p-8 rounded-3xl dark-glass border border-white/[0.08] text-center text-xs text-zinc-400">
          No content scheduled for this track today.
        </div>
      )}
      {/* ===================================================================== */}
      {/* 4. MODAL: PERSONALIZATION SETTINGS                                    */}
      {/* ===================================================================== */}
      {isPersonalizeOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="w-full max-w-lg bg-[#12141B] border border-white/10 rounded-3xl p-6 space-y-5 max-h-[90vh] overflow-y-auto no-scrollbar shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-zinc-300" />
                <h3 className="text-sm font-bold text-white">Personalize Your Daily Connection</h3>
              </div>
              <button 
                onClick={() => setIsPersonalizeOpen(false)}
                className="p-1 rounded-xl text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Edition Preference */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-white block">Content Edition Preference</label>
              <p className="text-[10px] text-zinc-400">Select the emotional perspective that best serves your growth:</p>
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
                        ? 'bg-white/20 border-white/40 text-white'
                        : 'bg-white/[0.04] border-white/10 text-zinc-400 hover:border-white/20'
                    }`}
                  >
                    <span className="text-xs font-bold block">{opt.label}</span>
                    <span className="text-[9px] text-zinc-400 line-clamp-1">{opt.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Relationship Situation */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-white block">Current Relationship Stage</label>
              <select
                value={editSituation}
                onChange={(e) => setEditSituation(e.target.value as any)}
                className="w-full p-2.5 rounded-xl bg-[#181B24] border border-white/10 text-xs text-white focus:outline-none focus:border-white/30"
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
              <label className="text-xs font-bold text-white block">Friendship Growth Focus</label>
              <select
                value={editFriendTrack}
                onChange={(e) => setEditFriendTrack(e.target.value as any)}
                className="w-full p-2.5 rounded-xl bg-[#181B24] border border-white/10 text-xs text-white focus:outline-none focus:border-white/30"
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
            <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-2.5">
              <button
                onClick={() => setIsPersonalizeOpen(false)}
                className="px-4 py-2 rounded-xl text-xs text-zinc-400 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSavePreferences}
                className="px-5 py-2 rounded-xl gray-glass-btn text-white text-xs font-bold shadow-md hover:brightness-110 cursor-pointer"
              >
                Save Preferences
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 5. MODAL: SHAREABLE QUOTE CARD (Klyven GlassModal)                     */}
      {/* ===================================================================== */}
      {currentItem && (
        <GlassModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          title="Shareable Daily Thought"
          subtitle="Inspire connection and thoughtful reflection across your social channels"
        >
          <div className="space-y-6">
            {/* The Visual Card */}
            <div className="p-6 rounded-2xl bg-gradient-to-b from-white/[0.08] to-transparent border border-white/10 space-y-4 text-center relative overflow-hidden shadow-inner">
              <span className="text-xl">✧</span>
              <p className="text-base sm:text-lg font-black text-white font-serif leading-relaxed">
                "{currentItem.quote_one_liner}"
              </p>
              <div className="pt-2 border-t border-white/10">
                <span className="text-[11px] text-zinc-400 uppercase tracking-wider block font-bold">
                  {currentItem.category_name}
                </span>
                <span className="text-[10px] text-zinc-300 font-mono">
                  Soulverse • Daily Connection Intelligence
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <GlassButton
                variant="primary"
                size="md"
                onClick={() => {
                  navigator.clipboard.writeText(`"${currentItem.quote_one_liner}" — ${currentItem.category_name} (via Soulverse)`);
                  alert("Quote copied to clipboard!");
                  setIsShareModalOpen(false);
                }}
                className="w-full"
              >
                Copy Text for Telegram / Instagram
              </GlassButton>
            </div>
          </div>
        </GlassModal>
      )}

      {/* ===================================================================== */}
      {/* 6. DRAWER: SAVED WISDOM ARCHIVE                                       */}
      {/* ===================================================================== */}
      {isSavedDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex justify-end animate-fadeIn">
          <div className="w-full max-w-md bg-[#12141B] border-l border-white/10 h-full p-6 space-y-5 overflow-y-auto no-scrollbar shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-zinc-300" />
                <h3 className="text-sm font-bold text-white">Saved Daily Wisdom</h3>
              </div>
              <button onClick={() => setIsSavedDrawerOpen(false)} className="p-1 text-zinc-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            {savedItems.length === 0 ? (
              <p className="text-xs text-zinc-400 text-center py-12">No saved quotes yet. Tap the bookmark icon on any daily edition to save it here.</p>
            ) : (
              <div className="space-y-3">
                {savedItems.map((item, i) => (
                  <div key={i} className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 space-y-2">
                    <span className="text-[10px] uppercase font-bold text-zinc-300 block">{item.category_name}</span>
                    <p className="text-xs font-bold text-white font-serif">"{item.quote_one_liner}"</p>
                    <p className="text-[11px] text-zinc-400 line-clamp-2">{item.body_insight}</p>
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
          <div className="w-full max-w-md bg-[#12141B] border-l border-white/10 h-full p-6 space-y-5 overflow-y-auto no-scrollbar shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-zinc-300" />
                <h3 className="text-sm font-bold text-white">Your Past Reflections</h3>
              </div>
              <button onClick={() => setIsHistoryOpen(false)} className="p-1 text-zinc-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            {historyItems.length === 0 ? (
              <p className="text-xs text-zinc-400 text-center py-12">No reflections recorded yet. Answer today's reflection question above!</p>
            ) : (
              <div className="space-y-3">
                {historyItems.map((item, i) => (
                  <div key={i} className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 space-y-2">
                    <div className="flex items-center justify-between text-[10px] text-zinc-400">
                      <span className="font-mono">{item.local_date}</span>
                      <span className="capitalize">{item.tab} Edition</span>
                    </div>
                    <p className="text-xs font-bold text-white font-serif">"{item.quote_one_liner}"</p>
                    {item.reflection_answer && (
                      <div className="p-2.5 rounded-xl bg-white/[0.06] border border-white/10 text-xs text-zinc-200">
                        <span className="text-[10px] font-bold block text-zinc-400">Your Answer:</span>
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
