import React, { useState, useEffect, useRef } from 'react';
import {
  Quote as QuoteIcon,
  RefreshCw,
  Heart,
  Bookmark,
  Share2,
  Copy,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Sliders,
  Filter,
  Check,
  Flag,
  Calendar,
  BookOpen,
  Volume2,
  X,
  Layers,
  ArrowRight,
  TrendingUp,
  Flame,
  Search,
  ExternalLink,
  History,
  RotateCcw,
  Sun,
  Brain,
  Shield,
  MessageCircle,
  Moon,
  Users,
  UserCheck,
  Feather,
  Key,
  Smile,
  Compass
} from 'lucide-react';
import { quoteService } from '../../services/quoteService';
import {
  Quote,
  QuoteCategoryKey,
  CategoryMetadata,
  QuoteUserPreferences,
  DailyQuotePayload,
  QUOTE_CATEGORIES
} from '../../types/quotes';

interface QuoteDiscoveryViewProps {
  onClose?: () => void;
}

export const QuoteDiscoveryView: React.FC<QuoteDiscoveryViewProps> = ({ onClose }) => {
  // Discovery State
  const [currentQuote, setCurrentQuote] = useState<Quote | null>(null);
  const [historyStack, setHistoryStack] = useState<Quote[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Mode: Single Focus Card vs Infinite Discovery Feed
  const [viewMode, setViewMode] = useState<'card' | 'feed'>('card');
  const [feedQuotes, setFeedQuotes] = useState<Quote[]>([]);
  const [feedPage, setFeedPage] = useState<number>(1);
  const [feedHasMore, setFeedHasMore] = useState<boolean>(true);
  const [feedLoading, setFeedLoading] = useState<boolean>(false);

  // Daily Quote State
  const [dailyData, setDailyData] = useState<DailyQuotePayload | null>(null);
  const [showDailyModal, setShowDailyModal] = useState<boolean>(false);
  const [dailyHistory, setDailyHistory] = useState<Array<{ date: string; reflectionQuestion: string; quote: any }>>([]);

  // Category & Filter State
  const [categories, setCategories] = useState<CategoryMetadata[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<QuoteCategoryKey | null>(null);
  const [showCategoryDrawer, setShowCategoryDrawer] = useState<boolean>(false);
  const [showPreferencesModal, setShowPreferencesModal] = useState<boolean>(false);
  const [userPrefs, setUserPrefs] = useState<QuoteUserPreferences | null>(null);

  // Saved Quotes Collection Drawer
  const [savedQuotes, setSavedQuotes] = useState<Quote[]>([]);
  const [showSavedDrawer, setShowSavedDrawer] = useState<boolean>(false);

  // Toast Feedback State
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Initial load
  useEffect(() => {
    loadInitialData();
    const unsub = quoteService.subscribe(() => {
      // Background sync
    });
    return () => unsub();
  }, []);

  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      const [cats, daily, prefs] = await Promise.all([
        quoteService.getCategories(),
        quoteService.getDailyQuote(),
        quoteService.getPreferences()
      ]);
      setCategories(cats);
      setDailyData(daily);
      setUserPrefs(prefs);

      // Load initial quote
      const initial = await quoteService.discoverNextQuote();
      setCurrentQuote(initial);
      setHistoryStack([initial]);
      setHistoryIndex(0);
      setIsLoading(false);
    } catch (err: any) {
      console.error('Failed to initialize Quote Discovery:', err);
      setErrorMessage(err.message || 'Unable to connect to quote sanctuary');
      setIsLoading(false);
    }
  };

  // Fetch next quote with smooth transition
  const handleFetchNextQuote = async () => {
    if (isTransitioning) return;
    setIsTransitioning(true);

    // If navigating forward within history stack
    if (historyIndex < historyStack.length - 1) {
      const nextIndex = historyIndex + 1;
      setTimeout(() => {
        setCurrentQuote(historyStack[nextIndex]);
        setHistoryIndex(nextIndex);
        setIsTransitioning(false);
      }, 150);
      return;
    }

    try {
      const next = await quoteService.discoverNextQuote();
      setTimeout(() => {
        setCurrentQuote(next);
        setHistoryStack(prev => [...prev.slice(-30), next]);
        setHistoryIndex(prev => prev + 1);
        setIsTransitioning(false);
      }, 150);
    } catch (err: any) {
      setIsTransitioning(false);
      showToast('Could not discover quote. Check category filters.');
    }
  };

  // Previous Quote Navigation
  const handlePreviousQuote = () => {
    if (historyIndex > 0) {
      setIsTransitioning(true);
      setTimeout(() => {
        setHistoryIndex(prev => prev - 1);
        setCurrentQuote(historyStack[historyIndex - 1]);
        setIsTransitioning(false);
      }, 150);
    }
  };

  // Interactions: Like, Save, Copy, Share
  const handleToggleLike = async (quote: Quote) => {
    try {
      const res = await quoteService.toggleInteraction(quote.id, 'like');
      const updated = {
        ...quote,
        isLiked: res.active,
        likesCount: res.likesCount
      };
      if (currentQuote?.id === quote.id) setCurrentQuote(updated);
      setFeedQuotes(prev => prev.map(q => q.id === quote.id ? updated : q));
      showToast(res.active ? 'Added to liked reflections' : 'Removed like');
    } catch {
      showToast('Action failed');
    }
  };

  const handleToggleSave = async (quote: Quote) => {
    try {
      const res = await quoteService.toggleInteraction(quote.id, 'save');
      const updated = {
        ...quote,
        isSaved: res.active,
        savesCount: res.savesCount
      };
      if (currentQuote?.id === quote.id) setCurrentQuote(updated);
      setFeedQuotes(prev => prev.map(q => q.id === quote.id ? updated : q));
      showToast(res.active ? 'Saved to Sanctuary Vault' : 'Removed from saved collection');
    } catch {
      showToast('Action failed');
    }
  };

  const handleCopyQuote = (quote: Quote) => {
    const textToCopy = `"${quote.text}" — ${quote.author}\n\nVia Soulverse Sanctuary`;
    navigator.clipboard.writeText(textToCopy);
    showToast('Quote copied to clipboard');
  };

  const handleShareQuote = async (quote: Quote) => {
    const textToShare = `"${quote.text}" — ${quote.author}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Soulverse Sanctuary Quote',
          text: textToShare,
          url: window.location.href
        });
      } catch {
        handleCopyQuote(quote);
      }
    } else {
      handleCopyQuote(quote);
    }
  };

  const handleReportQuote = async (quote: Quote) => {
    if (window.confirm('Report this quote for inappropriate content or attribution error?')) {
      try {
        await quoteService.reportQuote(quote.id, 'User flagged as inappropriate or inaccurate');
        showToast('Quote submitted to moderation team');
      } catch {
        showToast('Report submission failed');
      }
    }
  };

  // Infinite Scroll Feed Loader
  const loadFeedQuotes = async (page: number = 1, reset: boolean = false) => {
    if (feedLoading) return;
    setFeedLoading(true);
    try {
      const res = await quoteService.getFeed(page, 10, selectedCategory || undefined);
      if (reset) {
        setFeedQuotes(res.quotes);
      } else {
        setFeedQuotes(prev => [...prev, ...res.quotes]);
      }
      setFeedHasMore(res.hasMore);
      setFeedPage(page);
    } catch {
      showToast('Could not load quote feed');
    } finally {
      setFeedLoading(false);
    }
  };

  useEffect(() => {
    if (viewMode === 'feed') {
      loadFeedQuotes(1, true);
    }
  }, [viewMode, selectedCategory]);

  const loadSavedQuotes = async () => {
    try {
      const list = await quoteService.getSavedQuotes();
      setSavedQuotes(list);
      setShowSavedDrawer(true);
    } catch {
      showToast('Failed to load saved quotes');
    }
  };

  const loadDailyHistory = async () => {
    try {
      const hist = await quoteService.getDailyHistory(14);
      setDailyHistory(hist);
      setShowDailyModal(true);
    } catch {
      showToast('Failed to load daily quote archive');
    }
  };

  const handleClearHistory = async () => {
    if (window.confirm('Clear your seen quotes history? All quotes will become discoverable again.')) {
      try {
        await quoteService.clearHistory();
        setHistoryStack([]);
        setHistoryIndex(-1);
        handleFetchNextQuote();
        showToast('History cleared. Fresh discovery unlocked.');
      } catch {
        showToast('Failed to clear history');
      }
    }
  };

  // Helper for dynamic Lucide icon
  const renderCategoryIcon = (iconName: string, className = "w-4 h-4") => {
    switch (iconName) {
      case 'Heart': return <Heart className={className} />;
      case 'Users': return <Users className={className} />;
      case 'UserCheck': return <UserCheck className={className} />;
      case 'Brain': return <Brain className={className} />;
      case 'Shield': return <Shield className={className} />;
      case 'Compass': return <Compass className={className} />;
      case 'Flame': return <Flame className={className} />;
      case 'Moon': return <Moon className={className} />;
      case 'Sparkles': return <Sparkles className={className} />;
      case 'BookOpen': return <BookOpen className={className} />;
      case 'Sun': return <Sun className={className} />;
      case 'MessageCircle': return <MessageCircle className={className} />;
      case 'Key': return <Key className={className} />;
      case 'Feather': return <Feather className={className} />;
      case 'TrendingUp': return <TrendingUp className={className} />;
      case 'Smile': return <Smile className={className} />;
      default: return <Sparkles className={className} />;
    }
  };

  const categoryMeta = currentQuote ? QUOTE_CATEGORIES[currentQuote.category] : null;

  return (
    <div className="flex flex-col h-full bg-[#090A0E] text-slate-200 select-none overflow-hidden font-sans relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-900 border border-indigo-500/40 text-slate-100 shadow-2xl text-xs animate-in fade-in slide-in-from-bottom-2">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-xl shrink-0">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-2xl bg-gradient-to-br from-indigo-500/20 via-purple-500/10 to-transparent border border-indigo-500/30 text-indigo-400">
            <QuoteIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold tracking-wide text-white flex items-center gap-2 font-serif">
              Soulverse Quotes
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                Infinite Sanctuary
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Timeless wisdom on love, boundaries, psychology, and personal sovereignty
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2">
          {/* Feed vs Card Switcher */}
          <div className="p-1 rounded-xl bg-slate-900 border border-slate-800 flex items-center text-xs">
            <button
              onClick={() => setViewMode('card')}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                viewMode === 'card'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Focus Card
            </button>
            <button
              onClick={() => setViewMode('feed')}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                viewMode === 'feed'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Infinite Feed
            </button>
          </div>

          {/* Saved Quotes Collection Button */}
          <button
            onClick={loadSavedQuotes}
            className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-850 transition-colors"
            title="Saved Quotes Sanctuary"
          >
            <Bookmark className="w-4 h-4 text-indigo-400" />
          </button>

          {/* Filter Preferences */}
          <button
            onClick={() => setShowPreferencesModal(true)}
            className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-850 transition-colors"
            title="Personalize Categories & Length"
          >
            <Sliders className="w-4 h-4" />
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-850 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Categories Filter Strip */}
      <div className="flex items-center px-6 py-2.5 border-b border-slate-800/60 bg-slate-950/40 gap-2 overflow-x-auto no-scrollbar shrink-0 text-xs">
        <button
          onClick={() => {
            setSelectedCategory(null);
            if (userPrefs) {
              quoteService.updatePreferences({ includedCategories: Object.keys(QUOTE_CATEGORIES) as QuoteCategoryKey[] });
            }
            handleFetchNextQuote();
          }}
          className={`px-3 py-1.5 rounded-full font-medium transition-all shrink-0 border ${
            !selectedCategory
              ? 'bg-white text-[#090A0E] border-white font-bold'
              : 'border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 bg-slate-900/40'
          }`}
        >
          All Categories
        </button>

        {categories.map(cat => {
          const isSelected = selectedCategory === cat.key;
          return (
            <button
              key={cat.key}
              onClick={() => {
                setSelectedCategory(cat.key);
                quoteService.updatePreferences({ includedCategories: [cat.key] });
                handleFetchNextQuote();
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-medium transition-all shrink-0 border ${
                isSelected
                  ? 'border-indigo-500 bg-indigo-500/20 text-indigo-300 font-bold'
                  : 'border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 bg-slate-900/40'
              }`}
            >
              {renderCategoryIcon(cat.icon, "w-3 h-3")}
              <span>{cat.label}</span>
              {cat.quoteCount !== undefined && cat.quoteCount > 0 && (
                <span className="text-[10px] opacity-60 font-mono">({cat.quoteCount})</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Daily Quote Featured Banner (Collapsible / Hero) */}
      {dailyData && (
        <div className="mx-6 mt-4 p-4 rounded-3xl bg-gradient-to-r from-indigo-950/40 via-purple-950/20 to-transparent border border-indigo-500/20 flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
                <Sun className="w-3 h-3 text-indigo-400" />
                Featured Reflection of the Day
              </span>
              <span className="text-xs text-slate-400 font-mono">{dailyData.date}</span>
            </div>
            <p className="text-xs text-slate-200 italic line-clamp-1">
              "{dailyData.featuredQuote.text}" — <strong className="text-white not-italic">{dailyData.featuredQuote.author}</strong>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowDailyModal(true)}
              className="text-xs px-3 py-1.5 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/30 font-medium transition-all flex items-center gap-1.5"
            >
              <BookOpen className="w-3.5 h-3.5" />
              Daily Reflection Question
            </button>
            <button
              onClick={loadDailyHistory}
              className="text-xs px-3 py-1.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-300 border border-slate-700 transition-all flex items-center gap-1.5"
            >
              <History className="w-3.5 h-3.5" />
              Past Days
            </button>
          </div>
        </div>
      )}

      {/* Main Content Viewport */}
      <div className="flex-1 overflow-y-auto p-6 flex flex-col justify-center items-center">
        {/* VIEW MODE 1: SINGLE CARD DISCOVERY (Default Hero View) */}
        {viewMode === 'card' && (
          <div className="w-full max-w-2xl my-auto flex flex-col items-center space-y-6">
            {isLoading ? (
              <div className="w-full h-80 rounded-3xl border border-slate-800/80 bg-slate-900/30 animate-pulse flex flex-col items-center justify-center p-8 space-y-4">
                <div className="w-12 h-12 rounded-full bg-slate-800" />
                <div className="w-3/4 h-6 rounded-xl bg-slate-800" />
                <div className="w-1/2 h-4 rounded-xl bg-slate-800" />
              </div>
            ) : currentQuote ? (
              <div
                className={`w-full rounded-3xl p-8 md:p-10 border border-slate-800/80 bg-gradient-to-b from-slate-900/60 via-slate-950/80 to-[#0A0C11] shadow-2xl relative transition-all duration-300 ${
                  isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
                }`}
              >
                {/* Ambient Top Glow */}
                <div
                  className="absolute top-0 inset-x-0 h-1 rounded-t-3xl opacity-60"
                  style={{
                    backgroundColor: categoryMeta?.accentColor || '#6366F1',
                    boxShadow: `0 0 24px ${categoryMeta?.accentColor || '#6366F1'}`
                  }}
                />

                {/* Card Header: Category & Attribution Tag */}
                <div className="flex items-center justify-between text-xs text-slate-400 mb-6">
                  <div className="flex items-center gap-2">
                    <span
                      className="px-3 py-1 rounded-full text-[11px] font-semibold flex items-center gap-1.5 border"
                      style={{
                        borderColor: `${categoryMeta?.accentColor || '#6366F1'}40`,
                        backgroundColor: `${categoryMeta?.accentColor || '#6366F1'}15`,
                        color: categoryMeta?.accentColor || '#6366F1'
                      }}
                    >
                      {renderCategoryIcon(categoryMeta?.icon || 'Sparkles', "w-3.5 h-3.5")}
                      {categoryMeta?.label || currentQuote.category}
                    </span>

                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800/80 text-slate-400">
                      {currentQuote.provider}
                    </span>
                  </div>

                  <span className="text-[10px] text-slate-500 font-mono">
                    #{historyIndex + 1}
                  </span>
                </div>

                {/* The Quote Body */}
                <div className="space-y-4 my-4">
                  <div className="text-indigo-400/40 text-4xl font-serif select-none -mb-2">“</div>
                  <blockquote className="text-xl md:text-2xl font-serif text-white leading-relaxed tracking-wide font-normal">
                    {currentQuote.text}
                  </blockquote>
                  <div className="text-indigo-400/40 text-4xl font-serif select-none text-right -mt-4">”</div>
                </div>

                {/* Author & Source */}
                <div className="mt-6 pt-4 border-t border-slate-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-base font-bold text-white font-serif">
                      {currentQuote.author}
                    </h3>
                    {currentQuote.attribution && (
                      <p className="text-xs text-slate-400 italic">
                        {currentQuote.attribution}
                      </p>
                    )}
                  </div>

                  {/* Tags */}
                  {currentQuote.tags && currentQuote.tags.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {currentQuote.tags.slice(0, 3).map((tag, i) => (
                        <span key={i} className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800/60 text-slate-400">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Action Bar */}
                <div className="mt-8 pt-4 border-t border-slate-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {/* Like Action */}
                    <button
                      onClick={() => handleToggleLike(currentQuote)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                        currentQuote.isLiked
                          ? 'border-rose-500/40 bg-rose-500/10 text-rose-400'
                          : 'border-slate-800 bg-slate-900/40 text-slate-400 hover:text-white hover:border-slate-700'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${currentQuote.isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
                      <span>{currentQuote.likesCount || 0}</span>
                    </button>

                    {/* Bookmark / Save Action */}
                    <button
                      onClick={() => handleToggleSave(currentQuote)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                        currentQuote.isSaved
                          ? 'border-indigo-500/40 bg-indigo-500/10 text-indigo-400'
                          : 'border-slate-800 bg-slate-900/40 text-slate-400 hover:text-white hover:border-slate-700'
                      }`}
                    >
                      <Bookmark className={`w-4 h-4 ${currentQuote.isSaved ? 'fill-indigo-500 text-indigo-500' : ''}`} />
                      <span>{currentQuote.savesCount || 0}</span>
                    </button>

                    {/* Copy to Clipboard */}
                    <button
                      onClick={() => handleCopyQuote(currentQuote)}
                      className="p-2 rounded-xl text-xs border border-slate-800 bg-slate-900/40 text-slate-400 hover:text-white hover:border-slate-700 transition-all"
                      title="Copy to Clipboard"
                    >
                      <Copy className="w-4 h-4" />
                    </button>

                    {/* Share */}
                    <button
                      onClick={() => handleShareQuote(currentQuote)}
                      className="p-2 rounded-xl text-xs border border-slate-800 bg-slate-900/40 text-slate-400 hover:text-white hover:border-slate-700 transition-all"
                      title="Share Quote"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>

                    {/* Report */}
                    <button
                      onClick={() => handleReportQuote(currentQuote)}
                      className="p-2 rounded-xl text-xs text-slate-500 hover:text-rose-400 transition-colors"
                      title="Report Inappropriate Content"
                    >
                      <Flag className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Navigation controls */}
                  <div className="flex items-center gap-1">
                    <button
                      disabled={historyIndex <= 0}
                      onClick={handlePreviousQuote}
                      className="p-2 rounded-xl border border-slate-800 bg-slate-900/40 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                      title="Previous Quote"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    <button
                      onClick={handleFetchNextQuote}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isTransitioning ? 'animate-spin' : ''}`} />
                      <span>Show Me Another</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 rounded-3xl border border-slate-800 bg-slate-900/30 text-center space-y-3">
                <QuoteIcon className="w-8 h-8 text-slate-600 mx-auto" />
                <h4 className="text-sm font-semibold text-white">No Quotes Match Active Filters</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Your excluded categories or length restrictions filtered out all current quotes.
                </p>
                <button
                  onClick={() => {
                    setSelectedCategory(null);
                    quoteService.updatePreferences({ includedCategories: Object.keys(QUOTE_CATEGORIES) as QuoteCategoryKey[], excludedCategories: [] });
                    handleFetchNextQuote();
                  }}
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
                >
                  Reset Category Filters
                </button>
              </div>
            )}
          </div>
        )}

        {/* VIEW MODE 2: INFINITE DISCOVERY FEED */}
        {viewMode === 'feed' && (
          <div className="w-full max-w-2xl space-y-4">
            {feedQuotes.map(q => {
              const qMeta = QUOTE_CATEGORIES[q.category];
              return (
                <div
                  key={q.id}
                  className="p-6 rounded-3xl border border-slate-800/80 bg-slate-900/40 hover:border-slate-700/80 transition-all space-y-4"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span
                      className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold border"
                      style={{
                        borderColor: `${qMeta?.accentColor || '#6366F1'}40`,
                        backgroundColor: `${qMeta?.accentColor || '#6366F1'}15`,
                        color: qMeta?.accentColor || '#6366F1'
                      }}
                    >
                      {qMeta?.label || q.category}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">{q.provider}</span>
                  </div>

                  <blockquote className="text-base font-serif text-white leading-relaxed">
                    "{q.text}"
                  </blockquote>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-xs">
                    <span className="font-bold text-slate-300 font-serif">— {q.author}</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleLike(q)}
                        className="p-1.5 text-slate-400 hover:text-rose-400 flex items-center gap-1 text-xs"
                      >
                        <Heart className={`w-3.5 h-3.5 ${q.isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
                        <span>{q.likesCount || 0}</span>
                      </button>
                      <button
                        onClick={() => handleToggleSave(q)}
                        className="p-1.5 text-slate-400 hover:text-indigo-400 flex items-center gap-1 text-xs"
                      >
                        <Bookmark className={`w-3.5 h-3.5 ${q.isSaved ? 'fill-indigo-500 text-indigo-500' : ''}`} />
                      </button>
                      <button
                        onClick={() => handleCopyQuote(q)}
                        className="p-1.5 text-slate-400 hover:text-white"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {feedHasMore && (
              <div className="text-center py-4">
                <button
                  disabled={feedLoading}
                  onClick={() => loadFeedQuotes(feedPage + 1)}
                  className="px-6 py-2.5 rounded-2xl bg-indigo-600/80 hover:bg-indigo-600 text-white text-xs font-semibold transition-all"
                >
                  {feedLoading ? 'Loading Reflections...' : 'Load More Quotes'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* MODAL: Daily Reflection Question & Relationship Insight */}
      {showDailyModal && dailyData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-lg bg-[#0E1017] border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/60">
              <div className="flex items-center gap-2">
                <Sun className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-white font-serif">Daily Sanctuary Reflection</h3>
              </div>
              <button onClick={() => setShowDailyModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 text-xs">
              {/* Primary Quote */}
              <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-2">
                <span className="text-[10px] font-mono text-indigo-400 uppercase font-semibold">Today's Anchor</span>
                <p className="text-sm font-serif text-white italic">
                  "{dailyData.featuredQuote.text}"
                </p>
                <p className="text-xs text-slate-400 font-bold">— {dailyData.featuredQuote.author}</p>
              </div>

              {/* Reflection Question */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-950/40 via-purple-950/20 to-transparent border border-indigo-500/30 space-y-2">
                <div className="flex items-center gap-1.5 text-indigo-300 font-bold">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  <span>Contemplation Question</span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed font-serif text-sm">
                  {dailyData.reflectionQuestion}
                </p>
              </div>

              {/* Daily Relationship Quote */}
              {dailyData.relationshipQuote && (
                <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-2">
                  <span className="text-[10px] font-mono text-rose-400 uppercase font-semibold">Relational Wisdom</span>
                  <p className="text-xs font-serif text-slate-200 italic">
                    "{dailyData.relationshipQuote.text}"
                  </p>
                  <p className="text-[11px] text-slate-400 font-bold">— {dailyData.relationshipQuote.author}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Daily History Archive */}
      {dailyHistory.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-xl max-h-[80vh] bg-[#0E1017] border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/60 shrink-0">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-bold text-white font-serif">Daily Reflections Archive</h3>
              </div>
              <button onClick={() => setDailyHistory([])} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {dailyHistory.map(item => (
                <div key={item.date} className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="font-mono text-indigo-400 font-bold">{item.date}</span>
                    <span className="capitalize">{item.quote.category?.replace(/_/g, ' ')}</span>
                  </div>
                  <p className="text-xs font-serif text-white italic">"{item.quote.text}"</p>
                  <p className="text-[11px] text-slate-400 font-bold">— {item.quote.author}</p>
                  <div className="pt-2 border-t border-slate-800/60 text-[11px] text-slate-300">
                    <strong>Question:</strong> {item.reflectionQuestion}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* DRAWER: Saved Quotes Sanctuary */}
      {showSavedDrawer && (
        <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-96 bg-[#0E1017] border-l border-slate-800 shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-900/60 shrink-0">
            <div className="flex items-center gap-2">
              <Bookmark className="w-4 h-4 text-indigo-400 fill-indigo-400" />
              <h3 className="text-xs font-bold text-white font-serif">Saved Sanctuary Reflections</h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300">
                {savedQuotes.length}
              </span>
            </div>
            <button onClick={() => setShowSavedDrawer(false)} className="text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {savedQuotes.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500 space-y-2">
                <Bookmark className="w-8 h-8 mx-auto text-slate-700" />
                <p>No quotes bookmarked yet.</p>
                <p className="text-[10px]">Tap the bookmark icon on any reflection to preserve it in your personal sanctuary.</p>
              </div>
            ) : (
              savedQuotes.map(q => (
                <div key={q.id} className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-2">
                  <p className="text-xs font-serif text-slate-200 italic">"{q.text}"</p>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                    <span className="font-bold text-white font-serif">— {q.author}</span>
                    <div className="flex items-center gap-1">
                      <button onClick={() => handleCopyQuote(q)} className="p-1 hover:text-white" title="Copy">
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={async () => {
                          await quoteService.toggleInteraction(q.id, 'save');
                          setSavedQuotes(prev => prev.filter(x => x.id !== q.id));
                        }}
                        className="p-1 text-slate-500 hover:text-rose-400"
                        title="Remove"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* MODAL: Preferences & Personalization */}
      {showPreferencesModal && userPrefs && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-lg max-h-[85vh] bg-[#0E1017] border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/60 shrink-0">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-bold text-white font-serif">Discovery Preferences</h3>
              </div>
              <button onClick={() => setShowPreferencesModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
              {/* Length Preference */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-white">Quote Length:</span>
                <div className="grid grid-cols-3 gap-2">
                  {(['any', 'short', 'long'] as const).map(len => (
                    <button
                      key={len}
                      onClick={() => {
                        const updated = { ...userPrefs, lengthPreference: len };
                        setUserPrefs(updated);
                        quoteService.updatePreferences({ lengthPreference: len });
                      }}
                      className={`p-2.5 rounded-xl border capitalize font-medium text-center transition-all ${
                        userPrefs.lengthPreference === len
                          ? 'border-indigo-500 bg-indigo-500/10 text-white font-bold'
                          : 'border-slate-800 bg-slate-900/30 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      {len === 'any' ? 'Any Length' : len === 'short' ? 'Concise (≤110)' : 'Deep & Long'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Author Preference */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-white">Author Attribution:</span>
                <div className="grid grid-cols-3 gap-2">
                  {(['any', 'famous', 'anonymous'] as const).map(auth => (
                    <button
                      key={auth}
                      onClick={() => {
                        const updated = { ...userPrefs, authorType: auth };
                        setUserPrefs(updated);
                        quoteService.updatePreferences({ authorType: auth });
                      }}
                      className={`p-2.5 rounded-xl border capitalize font-medium text-center transition-all ${
                        userPrefs.authorType === auth
                          ? 'border-indigo-500 bg-indigo-500/10 text-white font-bold'
                          : 'border-slate-800 bg-slate-900/30 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      {auth === 'any' ? 'All Authors' : auth === 'famous' ? 'Famous Thinkers' : 'Anonymous'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Included Categories */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">Included Interests & Themes:</span>
                  <button
                    onClick={() => {
                      const all = Object.keys(QUOTE_CATEGORIES) as QuoteCategoryKey[];
                      const updated = { ...userPrefs, includedCategories: all };
                      setUserPrefs(updated);
                      quoteService.updatePreferences({ includedCategories: all });
                    }}
                    className="text-[10px] text-indigo-400 hover:underline"
                  >
                    Select All
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-1.5 max-h-48 overflow-y-auto pr-1">
                  {Object.values(QUOTE_CATEGORIES).map(cat => {
                    const isChecked = userPrefs.includedCategories.includes(cat.key);
                    return (
                      <label
                        key={cat.key}
                        className={`flex items-center gap-2 p-2 rounded-xl border cursor-pointer select-none transition-all ${
                          isChecked
                            ? 'border-indigo-500/40 bg-indigo-500/10 text-white'
                            : 'border-slate-850 bg-slate-900/20 text-slate-400'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={e => {
                            let nextCats = [...userPrefs.includedCategories];
                            if (e.target.checked) {
                              if (!nextCats.includes(cat.key)) nextCats.push(cat.key);
                            } else {
                              nextCats = nextCats.filter(k => k !== cat.key);
                            }
                            const updated = { ...userPrefs, includedCategories: nextCats };
                            setUserPrefs(updated);
                            quoteService.updatePreferences({ includedCategories: nextCats });
                          }}
                          className="rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-0"
                        />
                        <span className="text-[11px] truncate">{cat.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* History & Reset */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-white block">Seen Quotes Memory</span>
                  <span className="text-[10px] text-slate-400">Avoids showing quotes you already viewed</span>
                </div>
                <button
                  onClick={handleClearHistory}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-rose-500/30 text-rose-300 hover:bg-rose-500/10 text-xs transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Clear History
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
