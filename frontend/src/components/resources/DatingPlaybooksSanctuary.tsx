import React, { useState, useMemo, useEffect } from 'react';
import { 
  BookOpen, 
  Search, 
  Bookmark, 
  BookmarkCheck, 
  Check, 
  Copy, 
  ChevronRight, 
  ArrowLeft, 
  Heart, 
  Sparkles as _Sparkles, 
  Flame, 
  Clock, 
  Share2, 
  Compass, 
  Sliders, 
  BookMarked,
  Lightbulb,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Eye,
  Zap,
  Coffee,
  MessageSquare,
  ShieldCheck,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { 
  ALL_PLAYBOOKS, 
  GIRLS_GUIDE_TO_BOYS, 
  BOYS_GUIDE_TO_GIRLS, 
  type DatingPlaybook, 
  type PlaybookChapter 
} from '../../data/datingGuideBooksData';

interface DatingPlaybooksSanctuaryProps {
  initialBookId?: 'girls_guide_to_boys' | 'boys_guide_to_girls';
  onClose?: () => void;
  onNavigateToTab?: (tab: string) => void;
}

export const DatingPlaybooksSanctuary: React.FC<DatingPlaybooksSanctuaryProps> = ({
  initialBookId = 'boys_guide_to_girls',
  onClose,
  onNavigateToTab
}) => {
  const [selectedBookId, setSelectedBookId] = useState<'girls_guide_to_boys' | 'boys_guide_to_girls'>(initialBookId);
  const [activeChapterIndex, setActiveChapterIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg' | 'xl'>('base');
  const [readerTheme, setReaderTheme] = useState<'midnight' | 'sepia' | 'obsidian'>('midnight');
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [bookmarkedChapters, setBookmarkedChapters] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('soulverse_bookmarked_playbook_chapters') || '[]');
    } catch {
      return [];
    }
  });
  const [personalNotes, setPersonalNotes] = useState<Record<string, string>>(() => {
    try {
      return JSON.parse(localStorage.getItem('soulverse_playbook_personal_notes') || '{}');
    } catch {
      return {};
    }
  });
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [currentNoteText, setCurrentNoteText] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showQuickCheatsheet, setShowQuickCheatsheet] = useState(false);

  const activeBook = useMemo(() => {
    return ALL_PLAYBOOKS.find(b => b.id === selectedBookId) || BOYS_GUIDE_TO_GIRLS;
  }, [selectedBookId]);

  const currentChapter = useMemo(() => {
    return activeBook.chapters[activeChapterIndex] || activeBook.chapters[0];
  }, [activeBook, activeChapterIndex]);

  // Sync current note text when chapter changes
  useEffect(() => {
    setCurrentNoteText(personalNotes[currentChapter.id] || '');
    setIsEditingNote(false);
  }, [currentChapter.id, personalNotes]);

  const toggleBookmark = (chapterId: string) => {
    const updated = bookmarkedChapters.includes(chapterId)
      ? bookmarkedChapters.filter(id => id !== chapterId)
      : [...bookmarkedChapters, chapterId];
    setBookmarkedChapters(updated);
    localStorage.setItem('soulverse_bookmarked_playbook_chapters', JSON.stringify(updated));
  };

  const handleSaveNote = () => {
    const updated = {
      ...personalNotes,
      [currentChapter.id]: currentNoteText
    };
    setPersonalNotes(updated);
    localStorage.setItem('soulverse_playbook_personal_notes', JSON.stringify(updated));
    setIsEditingNote(false);
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 3000);
  };

  // Filtered chapters for search
  const filteredChapters = useMemo(() => {
    if (!searchQuery.trim()) return activeBook.chapters;
    const q = searchQuery.toLowerCase();
    return activeBook.chapters.filter(ch => 
      ch.title.toLowerCase().includes(q) ||
      ch.subtitle.toLowerCase().includes(q) ||
      ch.contentMarkdown.toLowerCase().includes(q) ||
      ch.actionableRules.some(r => r.rule.toLowerCase().includes(q) || r.explanation.toLowerCase().includes(q))
    );
  }, [activeBook, searchQuery]);

  // Reading progress calculation
  const progressPercent = Math.round(((activeChapterIndex + 1) / activeBook.chapters.length) * 100);

  // Theme styling classes
  const themeClasses = {
    midnight: 'bg-[#090A0E] text-zinc-100 border-white/10',
    sepia: 'bg-[#15120E] text-[#EADECB] border-[#443828]/50',
    obsidian: 'bg-[#000000] text-zinc-200 border-zinc-800'
  }[readerTheme];

  const contentFontSizeClass = {
    sm: 'text-xs sm:text-sm leading-relaxed',
    base: 'text-sm sm:text-base leading-relaxed',
    lg: 'text-base sm:text-lg leading-relaxed',
    xl: 'text-lg sm:text-xl leading-relaxed'
  }[fontSize];

  return (
    <div className={`w-full min-h-[calc(100vh-6.5rem)] rounded-3xl border shadow-2xl flex flex-col overflow-hidden transition-colors duration-500 ${themeClasses}`}>
      
      {/* =================================================================== */}
      {/* 1. TOP HEADER & BOOK SWITCHER                                       */}
      {/* =================================================================== */}
      <div className="p-4 sm:p-5 border-b border-white/[0.08] backdrop-blur-xl bg-white/[0.02] flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-0 z-30">
        
        {/* Left: Branding & Back Button */}
        <div className="flex items-center gap-3">
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white transition-colors cursor-pointer"
              title="Return to Sanctuary"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}

          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-rose-500/20 via-amber-500/20 to-purple-500/20 border border-white/20 flex items-center justify-center text-white shadow-md">
            <BookOpen className="w-4 h-4 text-amber-300" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-black text-white font-serif tracking-tight">
                Connection & Dating Playbooks
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 uppercase">
                Field Edition
              </span>
            </div>
            <p className="text-[11px] text-zinc-400">
              Psychology-backed guides to approaching, magnetizing, and building authentic attraction
            </p>
          </div>
        </div>

        {/* Center: Book Tabs (Women vs Men) */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-black/40 border border-white/10 self-start md:self-auto">
          <button
            onClick={() => {
              setSelectedBookId('girls_guide_to_boys');
              setActiveChapterIndex(0);
            }}
            className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              selectedBookId === 'girls_guide_to_boys'
                ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Heart className="w-3.5 h-3.5 fill-current" />
            <span>For Her: Pickup Boys Guide</span>
            <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-black/30 text-rose-200">
              ~1.3K Words
            </span>
          </button>

          <button
            onClick={() => {
              setSelectedBookId('boys_guide_to_girls');
              setActiveChapterIndex(0);
            }}
            className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              selectedBookId === 'boys_guide_to_girls'
                ? 'bg-[#D6AD60] text-[#090A0E] shadow-lg shadow-amber-500/20 font-black'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>For Him: The Man's Codex</span>
            <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-black/40 text-amber-900 font-bold">
              10 Volumes
            </span>
          </button>
        </div>

        {/* Right: Quick Controls (Font, Theme, TOC Drawer) */}
        <div className="flex items-center gap-2 self-end md:self-auto">
          {/* Quick Cheatsheet Toggle */}
          <button
            onClick={() => setShowQuickCheatsheet(!showQuickCheatsheet)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              showQuickCheatsheet
                ? 'bg-amber-400/20 text-amber-300 border-amber-400/40'
                : 'bg-white/5 hover:bg-white/10 text-zinc-300 border-white/10'
            }`}
            title="Toggle Quick Field Cheatsheets"
          >
            <Zap className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Field Notes</span>
          </button>

          {/* Font Size Selector */}
          <div className="flex items-center bg-black/30 rounded-xl border border-white/10 p-0.5">
            <button
              onClick={() => setFontSize(prev => prev === 'xl' ? 'lg' : prev === 'lg' ? 'base' : 'sm')}
              className="px-2 py-1 text-[11px] font-bold text-zinc-400 hover:text-white"
              title="Decrease Font Size"
            >
              A-
            </button>
            <span className="text-[10px] text-zinc-500 font-mono px-1">{fontSize.toUpperCase()}</span>
            <button
              onClick={() => setFontSize(prev => prev === 'sm' ? 'base' : prev === 'base' ? 'lg' : 'xl')}
              className="px-2 py-1 text-[11px] font-bold text-zinc-400 hover:text-white"
              title="Increase Font Size"
            >
              A+
            </button>
          </div>

          {/* Reading Mode Theme */}
          <div className="flex items-center gap-1 bg-black/30 rounded-xl border border-white/10 p-1">
            <button
              onClick={() => setReaderTheme('midnight')}
              className={`w-5 h-5 rounded-lg border transition-all ${readerTheme === 'midnight' ? 'border-indigo-400 scale-110 bg-[#090A0E]' : 'border-transparent bg-[#090A0E] opacity-50'}`}
              title="Midnight Glass Theme"
            />
            <button
              onClick={() => setReaderTheme('sepia')}
              className={`w-5 h-5 rounded-lg border transition-all ${readerTheme === 'sepia' ? 'border-amber-400 scale-110 bg-[#352B1E]' : 'border-transparent bg-[#352B1E] opacity-50'}`}
              title="Warm Sepia Theme"
            />
            <button
              onClick={() => setReaderTheme('obsidian')}
              className={`w-5 h-5 rounded-lg border transition-all ${readerTheme === 'obsidian' ? 'border-zinc-300 scale-110 bg-black' : 'border-transparent bg-black opacity-50'}`}
              title="Pure Obsidian Black Theme"
            />
          </div>

          {/* Mobile TOC Drawer Toggle */}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="md:hidden p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white transition-colors cursor-pointer"
            title="Toggle Chapters List"
          >
            <BookMarked className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Progress Line */}
      <div className="w-full h-1 bg-white/[0.05] relative overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-rose-500 via-amber-400 to-indigo-500 transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* =================================================================== */}
      {/* 2. MAIN READING CANVAS + SIDEBAR LAYOUT                             */}
      {/* =================================================================== */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* CHAPTERS NAVIGATION SIDEBAR */}
        <aside className={`
          fixed md:relative inset-y-0 left-0 z-20 w-80 shrink-0 border-r border-white/[0.08] bg-[#090A0E]/95 md:bg-transparent backdrop-blur-2xl md:backdrop-blur-none flex flex-col transition-transform duration-300
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}>
          
          {/* Book Info Header in Sidebar */}
          <div className="p-4 border-b border-white/[0.08] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                Table of Contents
              </span>
              <span className="text-[10px] font-mono text-zinc-500">
                {activeBook.chapters.length} Sections • {activeBook.estimatedReadingTime}
              </span>
            </div>

            {/* In-Book Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search openers, psychology, rules..."
                className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400/50"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white text-xs"
                >
                  ×
                </button>
              )}
            </div>
          </div>

          {/* Chapters List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-1.5 no-scrollbar">
            {filteredChapters.map((chapter, idx) => {
              const originalIndex = activeBook.chapters.findIndex(c => c.id === chapter.id);
              const isActive = activeChapterIndex === originalIndex;
              const isBookmarked = bookmarkedChapters.includes(chapter.id);
              const hasNote = Boolean(personalNotes[chapter.id]);

              return (
                <div
                  key={chapter.id}
                  onClick={() => {
                    setActiveChapterIndex(originalIndex);
                    setIsSidebarOpen(false);
                  }}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer group flex items-start justify-between gap-2 ${
                    isActive
                      ? 'bg-white/[0.08] border-white/20 text-white shadow-md'
                      : 'border-transparent hover:bg-white/[0.03] text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[10px] font-mono font-bold uppercase tracking-wider ${isActive ? 'text-amber-300' : 'text-zinc-500'}`}>
                        {typeof chapter.chapterNumber === 'number' ? `Chapter ${chapter.chapterNumber}` : chapter.chapterNumber}
                      </span>
                      <span className="text-[10px] text-zinc-500">• {chapter.readingMinutes}m</span>
                      {hasNote && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" title="Contains personal note" />
                      )}
                    </div>
                    <h4 className={`text-xs font-heading font-semibold leading-snug line-clamp-2 ${isActive ? 'text-white' : 'text-zinc-300 group-hover:text-white'}`}>
                      {chapter.title}
                    </h4>
                  </div>

                  <div className="flex items-center gap-1 shrink-0 pt-0.5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleBookmark(chapter.id);
                      }}
                      className={`p-1 rounded-lg transition-colors ${
                        isBookmarked ? 'text-amber-400 hover:text-amber-300' : 'text-zinc-600 hover:text-zinc-400 opacity-0 group-hover:opacity-100'
                      }`}
                      title={isBookmarked ? 'Remove Bookmark' : 'Bookmark Chapter'}
                    >
                      {isBookmarked ? <BookmarkCheck className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
                    </button>
                    <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isActive ? 'text-amber-400 translate-x-0.5' : 'text-zinc-600'}`} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Sidebar Footer Stats */}
          <div className="p-4 border-t border-white/[0.08] bg-black/20 text-xs text-zinc-400 space-y-1">
            <div className="flex justify-between text-[11px]">
              <span>Reading Progress:</span>
              <strong className="text-white">{progressPercent}%</strong>
            </div>
            <div className="flex justify-between text-[11px]">
              <span>Bookmarked Sections:</span>
              <strong className="text-amber-300">{bookmarkedChapters.length}</strong>
            </div>
          </div>
        </aside>

        {/* Backdrop for mobile drawer */}
        {isSidebarOpen && (
          <div 
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-10 md:hidden"
          />
        )}

        {/* MAIN READING CONTENT AREA */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8 lg:p-12 no-scrollbar max-w-4xl mx-auto space-y-8">
          
          {/* Toast Notification */}
          {copiedText && (
            <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-2xl bg-zinc-900 border border-white/20 text-xs text-white shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-bottom-2 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Copied: {copiedText}</span>
            </div>
          )}

          {/* BOOK HEADER BANNER (Shown at top of chapters) */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-white/[0.04] to-transparent border border-white/10 space-y-3 relative overflow-hidden shadow-lg">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-full bg-white/10 text-zinc-200 border border-white/15">
                  {activeBook.coverBadge}
                </span>
                <span className="text-xs text-zinc-400">• {activeBook.edition}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleBookmark(currentChapter.id)}
                  className={`px-3 py-1 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-all cursor-pointer ${
                    bookmarkedChapters.includes(currentChapter.id)
                      ? 'bg-amber-400/20 text-amber-300 border-amber-400/30'
                      : 'bg-white/5 hover:bg-white/10 text-zinc-400 border-white/10 hover:text-white'
                  }`}
                >
                  <Bookmark className="w-3.5 h-3.5" />
                  <span>{bookmarkedChapters.includes(currentChapter.id) ? 'Bookmarked' : 'Bookmark'}</span>
                </button>
                <button
                  onClick={() => handleCopy(currentChapter.contentMarkdown, 'Full Chapter Content')}
                  className="px-3 py-1 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white border border-white/10 transition-all cursor-pointer flex items-center gap-1.5"
                  title="Copy Chapter Text"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </button>
              </div>
            </div>

            <h1 className="text-xl sm:text-3xl font-black text-white font-serif tracking-tight">
              {currentChapter.title}
            </h1>
            <p className="text-xs sm:text-sm text-zinc-300 font-medium">
              {currentChapter.subtitle}
            </p>

            <div className="flex items-center gap-4 text-xs text-zinc-400 pt-2 border-t border-white/[0.06]">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>{currentChapter.readingMinutes} min read</span>
              </span>
              <span>•</span>
              <span>~{currentChapter.wordCount} words</span>
              <span>•</span>
              <span className="text-emerald-400 font-semibold">High-EQ Verified</span>
            </div>
          </div>

          {/* FOREWORD / INTRODUCTORY SUMMARY BOX */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.02] border border-white/[0.08] flex items-start gap-3.5">
            <Lightbulb className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300 block">
                Chapter Core Takeaway
              </span>
              <p className="text-xs text-zinc-300 leading-relaxed">
                {currentChapter.summary}
              </p>
            </div>
          </div>

          {/* MAIN CHAPTER READING BODY */}
          <article className={`space-y-6 text-zinc-200 ${contentFontSizeClass}`}>
            {currentChapter.contentMarkdown.split('### ').filter(Boolean).map((section, idx) => {
              const lines = section.split('\n');
              const heading = lines[0];
              const bodyParagraphs = lines.slice(1).join('\n').trim();

              return (
                <div key={idx} className="space-y-3 pt-2">
                  <h3 className="text-lg sm:text-xl font-black text-white font-heading tracking-tight border-b border-white/[0.08] pb-2">
                    {heading}
                  </h3>
                  <div className="space-y-3 text-zinc-300 leading-relaxed whitespace-pre-line font-serif">
                    {bodyParagraphs}
                  </div>
                </div>
              );
            })}
          </article>

          {/* ACTIONABLE FIELD RULES & SCRIPTS CARDS */}
          {currentChapter.actionableRules.length > 0 && (
            <div className="space-y-4 pt-4">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-heading">
                  Field Rules & Exact Scripts
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentChapter.actionableRules.map((item, i) => (
                  <div 
                    key={i}
                    className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-amber-400/30 transition-all space-y-2 group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-300 font-heading">
                        {item.rule}
                      </span>
                      {item.exampleScript && (
                        <button
                          onClick={() => handleCopy(item.exampleScript!, item.rule)}
                          className="text-[10px] font-semibold text-zinc-400 hover:text-white flex items-center gap-1 cursor-pointer"
                          title="Copy script"
                        >
                          <Copy className="w-3 h-3" />
                          <span>Copy Script</span>
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-zinc-300 leading-relaxed">
                      {item.explanation}
                    </p>
                    {item.exampleScript && (
                      <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 text-xs text-amber-100 font-mono italic">
                        "{item.exampleScript}"
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* FIELD CHECKLIST & COMMON MISTAKES */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
            
            {/* Practical Checklist */}
            <div className="p-5 rounded-2xl bg-emerald-500/[0.04] border border-emerald-500/20 space-y-3">
              <div className="flex items-center gap-2 text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                <h4 className="text-xs font-bold uppercase tracking-wider font-heading">
                  Field Execution Checklist
                </h4>
              </div>
              <ul className="space-y-2 text-xs text-zinc-300">
                {currentChapter.fieldChecklist.map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Common Mistakes to Avoid */}
            <div className="p-5 rounded-2xl bg-rose-500/[0.04] border border-rose-500/20 space-y-3">
              <div className="flex items-center gap-2 text-rose-400">
                <AlertTriangle className="w-4 h-4" />
                <h4 className="text-xs font-bold uppercase tracking-wider font-heading">
                  Fatal Traps to Avoid
                </h4>
              </div>
              <ul className="space-y-2 text-xs text-zinc-300">
                {currentChapter.commonMistakes.map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-rose-400 font-bold">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>

          {/* PERSONAL NOTE SYSTEM (Stored in Browser) */}
          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-amber-400" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider font-heading">
                  My Personal Field Notes for this Chapter
                </h4>
              </div>
              {!isEditingNote && (
                <button
                  onClick={() => setIsEditingNote(true)}
                  className="text-xs text-amber-400 hover:text-amber-300 font-semibold cursor-pointer"
                >
                  {personalNotes[currentChapter.id] ? 'Edit Note' : '+ Add Private Note'}
                </button>
              )}
            </div>

            {isEditingNote ? (
              <div className="space-y-2">
                <textarea
                  value={currentNoteText}
                  onChange={(e) => setCurrentNoteText(e.target.value)}
                  placeholder="Record your observations, custom openers that worked, or personal reflections..."
                  rows={3}
                  className="w-full p-3 rounded-xl bg-black/40 border border-white/15 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setIsEditingNote(false)}
                    className="px-3 py-1.5 rounded-lg text-xs text-zinc-400 hover:text-white cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveNote}
                    className="px-4 py-1.5 rounded-lg bg-amber-400 text-black text-xs font-bold hover:bg-amber-300 cursor-pointer shadow-md"
                  >
                    Save Note
                  </button>
                </div>
              </div>
            ) : personalNotes[currentChapter.id] ? (
              <p className="text-xs text-zinc-300 italic bg-black/30 p-3 rounded-xl border border-white/5">
                "{personalNotes[currentChapter.id]}"
              </p>
            ) : (
              <p className="text-[11px] text-zinc-500">
                No personal notes added yet. Record your real-world observations or favorite openers here.
              </p>
            )}
          </div>

          {/* CHAPTER NAVIGATION BUTTONS (Previous / Next) */}
          <div className="flex items-center justify-between pt-6 border-t border-white/[0.08]">
            <button
              onClick={() => setActiveChapterIndex(prev => Math.max(0, prev - 1))}
              disabled={activeChapterIndex === 0}
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none text-xs text-white font-semibold transition-all cursor-pointer flex items-center gap-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Previous Chapter</span>
            </button>

            <span className="text-xs text-zinc-400 font-mono">
              {activeChapterIndex + 1} of {activeBook.chapters.length}
            </span>

            <button
              onClick={() => setActiveChapterIndex(prev => Math.min(activeBook.chapters.length - 1, prev + 1))}
              disabled={activeChapterIndex === activeBook.chapters.length - 1}
              className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-black disabled:opacity-30 disabled:pointer-events-none text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shadow-md shadow-amber-500/10"
            >
              <span>Next Chapter</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* QUICK SITUATIONAL CHEATSHEET MODAL / OVERLAY */}
          {showQuickCheatsheet && (
            <div className="p-6 rounded-3xl bg-[#12141C] border border-amber-500/30 space-y-4 shadow-2xl animate-fadeIn">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider font-heading">
                    Instant Situational Pocket Cheatsheet (Copy & Go)
                  </h3>
                </div>
                <button
                  onClick={() => setShowQuickCheatsheet(false)}
                  className="text-xs text-zinc-400 hover:text-white cursor-pointer"
                >
                  ✕ Close
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                
                {/* 1. Cafe & Coffee Shop */}
                <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-2">
                  <div className="flex items-center justify-between text-amber-300 font-bold">
                    <span className="flex items-center gap-1.5">
                      <Coffee className="w-3.5 h-3.5" />
                      <span>Cafe / Roastery</span>
                    </span>
                    <button
                      onClick={() => handleCopy("Excuse me, I'm stuck between the cold brew and the pour-over—what did you get?", "Cafe Opener")}
                      className="text-[10px] text-zinc-400 hover:text-white"
                    >
                      Copy
                    </button>
                  </div>
                  <p className="text-zinc-300">
                    "Excuse me, I'm stuck between the cold brew and the pour-over—what did you get?"
                  </p>
                  <span className="text-[10px] text-zinc-500 block">
                    Focus: Non-intrusive, low investment, lets them share taste.
                  </span>
                </div>

                {/* 2. Bookstore & Library */}
                <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-2">
                  <div className="flex items-center justify-between text-indigo-300 font-bold">
                    <span className="flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Bookstore / Library</span>
                    </span>
                    <button
                      onClick={() => handleCopy("I've been debating starting that author—is it genuinely gripping or just hype?", "Bookstore Opener")}
                      className="text-[10px] text-zinc-400 hover:text-white"
                    >
                      Copy
                    </button>
                  </div>
                  <p className="text-zinc-300">
                    "I've been debating starting that author—is it genuinely gripping or just hype?"
                  </p>
                  <span className="text-[10px] text-zinc-500 block">
                    Focus: Intellectual curiosity, invites nuanced critique.
                  </span>
                </div>

                {/* 3. Direct Street / Strolling Encounter */}
                <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-2">
                  <div className="flex items-center justify-between text-rose-300 font-bold">
                    <span className="flex items-center gap-1.5">
                      <Compass className="w-3.5 h-3.5" />
                      <span>Direct Daytime Walk</span>
                    </span>
                    <button
                      onClick={() => handleCopy("Excuse me, I only have two minutes before my train, but I thought you had a striking presence and had to introduce myself. I'm Alex.", "Direct Day Opener")}
                      className="text-[10px] text-zinc-400 hover:text-white"
                    >
                      Copy
                    </button>
                  </div>
                  <p className="text-zinc-300">
                    "Excuse me, I only have two minutes before my train, but I thought you had a striking presence and had to introduce myself. I'm Alex."
                  </p>
                  <span className="text-[10px] text-zinc-500 block">
                    Focus: Clear time constraint, respectful, 100% authentic intent.
                  </span>
                </div>

                {/* 4. Evening Lounge / Mixed Social */}
                <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-2">
                  <div className="flex items-center justify-between text-emerald-300 font-bold">
                    <span className="flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Evening Lounge / Event</span>
                    </span>
                    <button
                      onClick={() => handleCopy("Quick question: that drink has serious character, what's the citrus botanical note in it?", "Lounge Opener")}
                      className="text-[10px] text-zinc-400 hover:text-white"
                    >
                      Copy
                    </button>
                  </div>
                  <p className="text-zinc-300">
                    "Quick question: that drink has serious character, what's the citrus botanical note in it?"
                  </p>
                  <span className="text-[10px] text-zinc-500 block">
                    Focus: Sensory observation, bridges into taste in cocktails and music.
                  </span>
                </div>

              </div>
            </div>
          )}

        </main>
      </div>

    </div>
  );
};
