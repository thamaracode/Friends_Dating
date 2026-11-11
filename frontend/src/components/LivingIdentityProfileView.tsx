import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Sparkles, 
  Lock, 
  Globe, 
  Heart, 
  Users, 
  Eye, 
  Edit3, 
  Trash2, 
  ChevronDown, 
  ChevronUp, 
  Search, 
  Share2, 
  Download, 
  Pin, 
  BookOpen, 
  Compass, 
  Brain, 
  Zap, 
  Smile, 
  Calendar, 
  Check, 
  X, 
  AlertCircle,
  HelpCircle,
  Quote,
  MessageSquare,
  ArrowUpDown,
  Wand2
} from 'lucide-react';
import { livingProfileClient } from '../services/livingProfileApiClient';
import { YearLifeTimelineView } from './YearLifeTimelineView';
import { GitHubMarkdownEditor } from './GitHubMarkdownEditor';
import type { 
  LivingProfileData, 
  ProfileSection, 
  ProfileEntry, 
  ProfileQuestion, 
  ProfileTimelineEvent, 
  ProfileThought,
  ProfileVisibility,
  SectionType
} from '../types/livingProfile';

interface LivingIdentityProfileViewProps {
  userId?: string;
  isOwner?: boolean;
  initialViewerId?: string;
  onClose?: () => void;
}

export const LivingIdentityProfileView: React.FC<LivingIdentityProfileViewProps> = ({
  userId = 'usr_me',
  isOwner = true,
  initialViewerId = 'usr_me',
  onClose
}) => {
  const [profileData, setProfileData] = useState<LivingProfileData | null>(null);
  const [viewerId, setViewerId] = useState<string>(initialViewerId);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'sections' | 'questions' | 'timeline' | 'thoughts' | 'markdown'>('all');
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

  // Modals & drawers
  const [isAddSectionOpen, setIsAddSectionOpen] = useState(false);
  const [isAddEntryOpen, setIsAddEntryOpen] = useState<string | null>(null); // sectionId
  const [isAddQuestionOpen, setIsAddQuestionOpen] = useState(false);
  const [isAddTimelineOpen, setIsAddTimelineOpen] = useState(false);
  const [isAddThoughtOpen, setIsAddThoughtOpen] = useState(false);
  const [isAiToolOpen, setIsAiToolOpen] = useState(false);
  const [aiToolMode, setAiToolMode] = useState<'polish' | 'suggest_questions' | 'turn_into_bio' | 'summarize'>('polish');
  const [aiDraftInput, setAiDraftInput] = useState('');
  const [aiSuggestion, setAiSuggestion] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  // New section form state
  const [newSecTitle, setNewSecTitle] = useState('');
  const [newSecDesc, setNewSecDesc] = useState('');
  const [newSecIcon, setNewSecIcon] = useState('🧭');
  const [newSecType, setNewSecType] = useState<SectionType>('beliefs');
  const [newSecVis, setNewSecVis] = useState<ProfileVisibility>('public');

  // New entry form state
  const [newEntryTitle, setNewEntryTitle] = useState('');
  const [newEntryContent, setNewEntryContent] = useState('');
  const [newEntryVis, setNewEntryVis] = useState<ProfileVisibility>('public');

  // New question form state
  const [newQTitle, setNewQTitle] = useState('');
  const [newQDesc, setNewQDesc] = useState('');
  const [newQAnswer, setNewQAnswer] = useState('');
  const [newQVis, setNewQVis] = useState<ProfileVisibility>('public');

  // New timeline form state
  const [newTimeTitle, setNewTimeTitle] = useState('');
  const [newTimeDesc, setNewTimeDesc] = useState('');
  const [newTimeDate, setNewTimeDate] = useState('');
  const [newTimeCat, setNewTimeCat] = useState('milestone');
  const [newTimeSig, setNewTimeSig] = useState('');
  const [newTimeLessons, setNewTimeLessons] = useState('');
  const [newTimeVis, setNewTimeVis] = useState<ProfileVisibility>('public');

  // New thought form state
  const [newThoughtTitle, setNewThoughtTitle] = useState('');
  const [newThoughtContent, setNewThoughtContent] = useState('');
  const [newThoughtType, setNewThoughtType] = useState<'thought' | 'opinion' | 'reflection' | 'essay'>('thought');
  const [newThoughtTags, setNewThoughtTags] = useState('');
  const [newThoughtVis, setNewThoughtVis] = useState<ProfileVisibility>('public');

  const loadProfile = async (targetViewer: string) => {
    try {
      setIsLoading(true);
      const data = await livingProfileClient.getProfile(userId, targetViewer);
      setProfileData(data);
    } catch (e) {
      console.error('Failed to load living profile', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProfile(viewerId);
  }, [userId, viewerId]);

  const toggleSection = (id: string) => {
    setCollapsedSections(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Visibility Icon Helper
  const renderVisBadge = (vis: ProfileVisibility) => {
    if (vis === 'public') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-950/40 border border-emerald-500/30 text-emerald-300">
          <Globe className="w-2.5 h-2.5" />
          <span>Public</span>
        </span>
      );
    }
    if (vis === 'matches') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#FF0D69]/20 border border-[#FF0D69]/40 text-[#FFB8D2]">
          <Heart className="w-2.5 h-2.5" />
          <span>Matches Only</span>
        </span>
      );
    }
    if (vis === 'friends') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-sky-950/40 border border-sky-500/30 text-sky-300">
          <Users className="w-2.5 h-2.5" />
          <span>Friends Only</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-950/40 border border-amber-500/30 text-amber-300">
        <Lock className="w-2.5 h-2.5" />
        <span>Private (Owner Only)</span>
      </span>
    );
  };

  // Section Creator
  const handleCreateSection = async () => {
    if (!newSecTitle.trim()) return;
    try {
      await livingProfileClient.createSection({
        userId,
        title: newSecTitle,
        description: newSecDesc,
        section_type: newSecType,
        icon: newSecIcon,
        visibility: newSecVis
      });
      setNewSecTitle('');
      setNewSecDesc('');
      setIsAddSectionOpen(false);
      loadProfile(viewerId);
    } catch (e) {
      alert('Error creating section');
    }
  };

  // Entry Creator
  const handleCreateEntry = async (sectionId: string) => {
    if (!newEntryContent.trim()) return;
    try {
      await livingProfileClient.createEntry({
        sectionId,
        userId,
        title: newEntryTitle,
        content: newEntryContent,
        visibility: newEntryVis
      });
      setNewEntryTitle('');
      setNewEntryContent('');
      setIsAddEntryOpen(null);
      loadProfile(viewerId);
    } catch (e) {
      alert('Error creating entry');
    }
  };

  // Question Creator
  const handleCreateQuestion = async () => {
    if (!newQTitle.trim()) return;
    try {
      const q = await livingProfileClient.createQuestion({
        userId,
        question: newQTitle,
        description: newQDesc,
        answer_type: 'long_text',
        visibility: newQVis,
        allow_responses: 1
      });
      if (newQAnswer.trim()) {
        await livingProfileClient.answerQuestion(q.id, {
          userId,
          answer_content: newQAnswer,
          visibility: newQVis
        });
      }
      setNewQTitle('');
      setNewQDesc('');
      setNewQAnswer('');
      setIsAddQuestionOpen(false);
      loadProfile(viewerId);
    } catch (e) {
      alert('Error creating question');
    }
  };

  // Timeline Event Creator
  const handleCreateTimeline = async () => {
    if (!newTimeTitle.trim() || !newTimeDesc.trim()) return;
    try {
      await livingProfileClient.createTimelineEvent({
        userId,
        title: newTimeTitle,
        description: newTimeDesc,
        event_date: newTimeDate,
        category: newTimeCat,
        personal_significance: newTimeSig,
        lessons_learned: newTimeLessons,
        visibility: newTimeVis
      });
      setNewTimeTitle('');
      setNewTimeDesc('');
      setNewTimeDate('');
      setNewTimeSig('');
      setNewTimeLessons('');
      setIsAddTimelineOpen(false);
      loadProfile(viewerId);
    } catch (e) {
      alert('Error adding timeline event');
    }
  };

  // Thought Creator
  const handleCreateThought = async () => {
    if (!newThoughtContent.trim()) return;
    try {
      await livingProfileClient.createThought({
        userId,
        title: newThoughtTitle,
        content: newThoughtContent,
        thought_type: newThoughtType,
        tags: newThoughtTags,
        visibility: newThoughtVis
      });
      setNewThoughtTitle('');
      setNewThoughtContent('');
      setNewThoughtTags('');
      setIsAddThoughtOpen(false);
      loadProfile(viewerId);
    } catch (e) {
      alert('Error publishing thought');
    }
  };

  // AI Assistant trigger
  const handleRunAiTool = async () => {
    setIsAiLoading(true);
    try {
      const res = await livingProfileClient.getAiAssistance(aiToolMode, aiDraftInput);
      setAiSuggestion(res.suggestion);
    } catch (e) {
      alert('AI assistant failed');
    } finally {
      setIsAiLoading(false);
    }
  };

  // Export JSON archive
  const handleExportData = async () => {
    try {
      const data = await livingProfileClient.exportProfile(userId);
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `living_identity_archive_${userId}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      alert('Export failed');
    }
  };

  if (isLoading || !profileData) {
    return (
      <div className="w-full flex flex-col items-center justify-center p-12 space-y-3">
        <div className="w-8 h-8 rounded-full border-2 border-[#FF0D69] border-t-transparent animate-spin" />
        <span className="text-xs text-[#C49DB2]">Unfolding Living Identity...</span>
      </div>
    );
  }

  // Filter sections by search query
  const filteredSections = profileData.sections.filter(sec => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const titleMatch = sec.title.toLowerCase().includes(q);
    const descMatch = sec.description?.toLowerCase().includes(q);
    const entryMatch = sec.entries?.some(e => e.title?.toLowerCase().includes(q) || e.content.toLowerCase().includes(q));
    return titleMatch || descMatch || entryMatch;
  });

  const filteredQuestions = profileData.questions.filter(q => {
    if (!searchQuery.trim()) return true;
    return q.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
      q.answers?.some(a => a.answer_content.toLowerCase().includes(searchQuery.toLowerCase()));
  });

  const filteredTimeline = profileData.timeline.filter(t => {
    if (!searchQuery.trim()) return true;
    return t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.personal_significance?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const filteredThoughts = profileData.thoughts.filter(th => {
    if (!searchQuery.trim()) return true;
    return th.content.toLowerCase().includes(searchQuery.toLowerCase()) || 
      th.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      th.tags?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 pb-20 select-none animate-fadeIn">
      
      {/* ===================================================================== */}
      {/* 1. MASTER HEADER & PERSONA BANNER                                     */}
      {/* ===================================================================== */}
      <div className="relative rounded-3xl glass-panel-elevated p-6 border border-[#FF1A75]/25 shadow-2xl space-y-5 pink-ambient-glow">
        
        {/* Top Controls Row */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF0D69] animate-pulse" />
            <h1 className="text-sm font-black tracking-wider uppercase text-pink-gradient">
              Living Identity Profile
            </h1>
          </div>

          {/* "Preview As" Selector (Crucial for testing multi-tier privacy) */}
          {isOwner && (
            <div className="flex items-center gap-1.5 glass-panel px-2.5 py-1 rounded-full border border-white/10 text-xs">
              <Eye className="w-3.5 h-3.5 text-[#FF0D69]" />
              <span className="text-[10px] text-[#C49DB2] font-semibold">Preview As:</span>
              <button
                onClick={() => setViewerId('usr_me')}
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold cursor-pointer transition-colors ${
                  viewerId === 'usr_me' ? 'bg-[#FF0D69] text-white shadow-sm' : 'text-[#C49DB2] hover:text-white'
                }`}
              >
                Owner
              </button>
              <button
                onClick={() => setViewerId('usr_alex')}
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold cursor-pointer transition-colors ${
                  viewerId === 'usr_alex' ? 'bg-[#FF0D69] text-white shadow-sm' : 'text-[#C49DB2] hover:text-white'
                }`}
              >
                Match
              </button>
              <button
                onClick={() => setViewerId('usr_tara')}
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold cursor-pointer transition-colors ${
                  viewerId === 'usr_tara' ? 'bg-[#FF0D69] text-white shadow-sm' : 'text-[#C49DB2] hover:text-white'
                }`}
              >
                Public
              </button>
            </div>
          )}
        </div>

        {/* Profile Card Summary */}
        <div className="flex items-center gap-4">
          <img 
            src={profileData.user.avatar_url} 
            alt={profileData.user.name} 
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-[#FF0D69] shadow-[0_0_20px_rgba(255,13,105,0.4)]"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-black text-[#FFF2F6] truncate">{profileData.user.name}</h2>
              {profileData.user.is_verified === 1 && (
                <span className="w-4 h-4 rounded-full bg-emerald-400 text-black flex items-center justify-center text-[10px] font-black">✓</span>
              )}
            </div>
            <p className="text-xs text-[#C49DB2]">@{profileData.user.username} • {profileData.user.status_text || 'Active Explorer'}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FF0D69]/20 text-[#FFB8D2] border border-[#FF0D69]/30">
                Current Access: {profileData.accessLevel.toUpperCase()}
              </span>
              <span className="text-[10px] text-[#82586E]">
                {profileData.sections.length} Sections • {profileData.questions.length} Q&As • {profileData.timeline.length} Milestones
              </span>
            </div>
          </div>
        </div>

        {/* Quick Builder Actions Bar (Owner only) */}
        {isOwner && viewerId === 'usr_me' && (
          <div className="flex items-center gap-2 pt-3 border-t border-[#FF1A75]/15 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setIsAddSectionOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#FF0D69] to-[#E0005C] text-white text-xs font-bold flex items-center gap-1.5 shadow-md hover:scale-105 transition-transform cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Custom Section</span>
            </button>

            <button
              onClick={() => setIsAddQuestionOpen(true)}
              className="px-3 py-1.5 rounded-xl glass-panel text-xs font-bold text-[#FFB8D2] hover:text-white flex items-center gap-1.5 border border-[#FF1A75]/30 cursor-pointer whitespace-nowrap"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Create Q&A</span>
            </button>

            <button
              onClick={() => setIsAddTimelineOpen(true)}
              className="px-3 py-1.5 rounded-xl glass-panel text-xs font-bold text-[#FFB8D2] hover:text-white flex items-center gap-1.5 border border-[#FF1A75]/30 cursor-pointer whitespace-nowrap"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Add Timeline Milestone</span>
            </button>

            <button
              onClick={() => setIsAddThoughtOpen(true)}
              className="px-3 py-1.5 rounded-xl glass-panel text-xs font-bold text-[#FFB8D2] hover:text-white flex items-center gap-1.5 border border-[#FF1A75]/30 cursor-pointer whitespace-nowrap"
            >
              <Quote className="w-3.5 h-3.5" />
              <span>Publish Thought</span>
            </button>

            <button
              onClick={() => {
                setAiToolMode('polish');
                setIsAiToolOpen(true);
              }}
              className="px-3 py-1.5 rounded-xl bg-[#26061D] text-xs font-bold text-amber-300 hover:text-white flex items-center gap-1.5 border border-amber-400/30 cursor-pointer whitespace-nowrap ml-auto"
            >
              <Wand2 className="w-3.5 h-3.5" />
              <span>AI Writing Assistant</span>
            </button>

            <button
              onClick={handleExportData}
              className="p-1.5 rounded-xl glass-panel text-[#C49DB2] hover:text-white border border-white/10 cursor-pointer"
              title="Export Full JSON Autobiography"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* In-Profile Search & Tab Filter */}
        <div className="space-y-3 pt-2">
          <div className="relative">
            <Search className="w-4 h-4 text-[#C49DB2] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search sections, thoughts, milestones, or answers..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl glass-panel text-xs text-[#FFF2F6] placeholder-[#82586E] focus:outline-none focus:border-[#FF0D69]"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {[
              { id: 'all', label: 'All Story' },
              { id: 'markdown', label: 'README.md (5,000 Chars)' },
              { id: 'sections', label: `Sections (${filteredSections.length})` },
              { id: 'questions', label: `Questions (${filteredQuestions.length})` },
              { id: 'timeline', label: `Life Timeline` },
              { id: 'thoughts', label: `Thoughts & Essays (${filteredThoughts.length})` }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap cursor-pointer transition-all ${
                  activeTab === tab.id 
                    ? 'bg-gradient-to-r from-[#FF0D69] to-[#E0005C] text-white shadow-md' 
                    : 'glass-panel text-[#C49DB2] hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 1.5. GITHUB-FLAVORED MARKDOWN BIO / README.md (5000 CHARACTERS)       */}
      {/* ===================================================================== */}
      {(activeTab === 'all' || activeTab === 'markdown') && (
        <div className="space-y-4">
          <GitHubMarkdownEditor 
            userId={userId} 
            isOwner={isOwner && viewerId === userId} 
          />
        </div>
      )}

      {/* ===================================================================== */}
      {/* 2. CUSTOM SECTIONS & EXPANDABLE ENTRIES                               */}
      {/* ===================================================================== */}
      {(activeTab === 'all' || activeTab === 'sections') && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs uppercase font-black text-[#FFB8D2] tracking-wider flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-[#FF0D69]" />
              <span>Identity Chapters & Dimensions</span>
            </span>
          </div>

          {filteredSections.map(sec => {
            const isCollapsed = !!collapsedSections[sec.id];
            return (
              <div 
                key={sec.id}
                className="rounded-3xl glass-panel-elevated border border-[#FF1A75]/25 overflow-hidden shadow-lg transition-all"
              >
                {/* Section Header */}
                <div 
                  onClick={() => toggleSection(sec.id)}
                  className="p-4 flex items-center justify-between cursor-pointer bg-[#180412]/80 hover:bg-[#26061D]/60 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{sec.icon || '🧭'}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-black text-[#FFF2F6]">{sec.title}</h3>
                        {renderVisBadge(sec.visibility)}
                        {sec.is_pinned === 1 && <Pin className="w-3 h-3 text-[#FF0D69]" />}
                      </div>
                      {sec.description && (
                        <p className="text-[11px] text-[#C49DB2] mt-0.5">{sec.description}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {isOwner && viewerId === 'usr_me' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsAddEntryOpen(sec.id);
                        }}
                        className="px-2.5 py-1 rounded-xl glass-panel text-[10px] font-bold text-[#FFB8D2] hover:text-white flex items-center gap-1 border border-[#FF1A75]/30 cursor-pointer"
                        title="Add Entry to this Section"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add Entry</span>
                      </button>
                    )}

                    <div className="text-[#C49DB2]">
                      {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                    </div>
                  </div>
                </div>

                {/* Section Content & Entries */}
                {!isCollapsed && (
                  <div className="p-4 space-y-3 border-t border-[#FF1A75]/15 bg-[#0D0209]/60">
                    {(!sec.entries || sec.entries.length === 0) ? (
                      <p className="text-xs text-[#82586E] italic py-2">No entries in this chapter yet.</p>
                    ) : (
                      sec.entries.map(entry => {
                        let parsedList: any = null;
                        if (entry.entry_type === 'list' && entry.structured_content) {
                          try {
                            parsedList = JSON.parse(entry.structured_content);
                          } catch (e) {}
                        }

                        return (
                          <div 
                            key={entry.id}
                            className="p-3.5 rounded-2xl glass-panel border border-[#FF1A75]/15 space-y-2 relative group"
                          >
                            <div className="flex items-center justify-between">
                              <h4 className="text-xs font-bold text-[#FFB8D2]">{entry.title}</h4>
                              <div className="flex items-center gap-1.5">
                                {renderVisBadge(entry.visibility)}
                                {isOwner && viewerId === 'usr_me' && (
                                  <button
                                    onClick={async () => {
                                      if (confirm('Delete this entry?')) {
                                        await livingProfileClient.deleteEntry(entry.id);
                                        loadProfile(viewerId);
                                      }
                                    }}
                                    className="opacity-0 group-hover:opacity-100 text-[#82586E] hover:text-rose-400 p-1 cursor-pointer transition-opacity"
                                    title="Delete Entry"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                            </div>

                            <p className="text-xs text-[#FFF2F6] leading-relaxed whitespace-pre-wrap">
                              {entry.content}
                            </p>

                            {/* Structured List (e.g. Green & Red Flags) */}
                            {parsedList && (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 text-xs">
                                {parsedList.green_flags && (
                                  <div className="p-2.5 rounded-xl bg-emerald-950/20 border border-emerald-500/20 space-y-1">
                                    <span className="text-[10px] font-black uppercase text-emerald-400">Green Flags</span>
                                    <ul className="list-disc list-inside space-y-0.5 text-[11px] text-[#C49DB2]">
                                      {parsedList.green_flags.map((gf: string, i: number) => (
                                        <li key={i}>{gf}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                                {parsedList.red_flags && (
                                  <div className="p-2.5 rounded-xl bg-rose-950/20 border border-rose-500/20 space-y-1">
                                    <span className="text-[10px] font-black uppercase text-rose-400">Red Flags</span>
                                    <ul className="list-disc list-inside space-y-0.5 text-[11px] text-[#C49DB2]">
                                      {parsedList.red_flags.map((rf: string, i: number) => (
                                        <li key={i}>{rf}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ===================================================================== */}
      {/* 3. USER-CREATED QUESTIONS & ANSWERS                                   */}
      {/* ===================================================================== */}
      {(activeTab === 'all' || activeTab === 'questions') && filteredQuestions.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs uppercase font-black text-[#FFB8D2] tracking-wider flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-[#FF0D69]" />
              <span>User-Created Questions & Deep Answers</span>
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {filteredQuestions.map(q => (
              <div 
                key={q.id}
                className="p-4 rounded-3xl glass-panel-elevated border border-[#FF1A75]/25 shadow-lg space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#82586E]">{q.description || 'Introspection'}</span>
                    <h4 className="text-xs font-black text-[#FFF2F6] mt-0.5">{q.question}</h4>
                  </div>
                  {renderVisBadge(q.visibility)}
                </div>

                {/* Answers list */}
                {q.answers && q.answers.map(ans => (
                  <div key={ans.id} className="p-3 rounded-2xl bg-black/40 border border-white/5 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-[#FFB8D2]">{ans.respondent_name || 'Owner'}:</span>
                    </div>
                    <p className="text-xs text-[#FFF2F6] italic leading-relaxed">
                      "{ans.answer_content}"
                    </p>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 4. CHRONOLOGICAL LIFE TIMELINE                                        */}
      {/* ===================================================================== */}
      {(activeTab === 'all' || activeTab === 'timeline') && filteredTimeline.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs uppercase font-black text-[#FFB8D2] tracking-wider flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-[#FF0D69]" />
              <span>Chronological Life Milestones</span>
            </span>
          </div>

          <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-gradient-to-b before:from-[#FF0D69] before:via-[#9E0042] before:to-transparent">
            {filteredTimeline.map(item => (
              <div key={item.id} className="relative group">
                {/* Glowing Node Dot */}
                <div className="absolute -left-6 top-1.5 w-3.5 h-3.5 rounded-full bg-[#0D0209] border-2 border-[#FF0D69] shadow-[0_0_10px_#FF0D69]" />

                <div className="p-4 rounded-3xl glass-panel-elevated border border-[#FF1A75]/25 shadow-lg space-y-2">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full bg-[#FF0D69]/20 text-[#FFB8D2] text-[10px] font-black border border-[#FF0D69]/30">
                        {item.event_date || 'Period'}
                      </span>
                      <h4 className="text-xs font-black text-[#FFF2F6]">{item.title}</h4>
                    </div>
                    {renderVisBadge(item.visibility)}
                  </div>

                  <p className="text-xs text-[#FFF2F6] leading-relaxed">
                    {item.description}
                  </p>

                  {item.personal_significance && (
                    <div className="p-2.5 rounded-2xl bg-black/40 border border-[#FF1A75]/15 text-[11px] text-[#C49DB2]">
                      <span className="font-bold text-[#FFB8D2] block">Significance:</span>
                      <span>{item.personal_significance}</span>
                    </div>
                  )}

                  {item.lessons_learned && (
                    <div className="p-2.5 rounded-2xl bg-amber-950/20 border border-amber-500/20 text-[11px] text-[#FFF2F6]">
                      <span className="font-bold text-amber-300 block">Lesson Learned:</span>
                      <span className="italic">"{item.lessons_learned}"</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Full Year-by-Year Life Timeline & Eras */}
          <div className="pt-4">
            <YearLifeTimelineView 
              userId={userId} 
              isOwner={isOwner && viewerId === userId} 
              viewerId={viewerId} 
            />
          </div>
        </div>
      )}

      {/* If timeline tab selected but filteredTimeline is empty, still show YearLifeTimelineView */}
      {activeTab === 'timeline' && filteredTimeline.length === 0 && (
        <div className="space-y-4">
          <YearLifeTimelineView 
            userId={userId} 
            isOwner={isOwner && viewerId === userId} 
            viewerId={viewerId} 
          />
        </div>
      )}

      {/* ===================================================================== */}
      {/* 5. THOUGHTS & PERSONAL ESSAYS                                         */}
      {/* ===================================================================== */}
      {(activeTab === 'all' || activeTab === 'thoughts') && filteredThoughts.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs uppercase font-black text-[#FFB8D2] tracking-wider flex items-center gap-1.5">
              <Quote className="w-4 h-4 text-[#FF0D69]" />
              <span>Thoughts, Reflections & Essays</span>
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {filteredThoughts.map(th => (
              <div 
                key={th.id}
                className={`p-4 rounded-3xl glass-panel-elevated border shadow-lg space-y-2 ${
                  th.is_pinned === 1 ? 'border-[#FF0D69] shadow-[0_0_20px_rgba(255,13,105,0.25)]' : 'border-[#FF1A75]/25'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full bg-[#180412] text-[#FFB8D2] text-[9px] font-black uppercase border border-[#FF1A75]/30">
                      {th.thought_type}
                    </span>
                    {th.title && <h4 className="text-xs font-black text-[#FFF2F6]">{th.title}</h4>}
                  </div>
                  <div className="flex items-center gap-1.5">
                    {renderVisBadge(th.visibility)}
                    {th.is_pinned === 1 && <Pin className="w-3 h-3 text-[#FF0D69]" />}
                  </div>
                </div>

                <p className="text-xs text-[#FFF2F6] leading-relaxed whitespace-pre-wrap italic pl-2 border-l-2 border-[#FF0D69]/60">
                  "{th.content}"
                </p>

                {th.tags && (
                  <div className="flex items-center gap-1.5 pt-1 text-[10px] text-[#82586E]">
                    {th.tags.split(',').map((tag, i) => (
                      <span key={i}>#{tag.trim()}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Full Year-by-Year Life Timeline & Eras */}
          <div className="pt-4">
            <YearLifeTimelineView 
              userId={userId} 
              isOwner={isOwner && viewerId === userId} 
              viewerId={viewerId} 
            />
          </div>
        </div>
      )}

      {/* If timeline tab selected but filteredTimeline is empty, still show YearLifeTimelineView */}
      {activeTab === 'timeline' && filteredTimeline.length === 0 && (
        <div className="space-y-4">
          <YearLifeTimelineView 
            userId={userId} 
            isOwner={isOwner && viewerId === userId} 
            viewerId={viewerId} 
          />
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 1: ADD CUSTOM SECTION                                           */}
      {/* ===================================================================== */}
      {isAddSectionOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="w-full max-w-md rounded-3xl glass-panel-elevated p-5 border border-[#FF1A75]/30 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-[#FFF2F6]">Create Custom Section</h3>
              <button onClick={() => setIsAddSectionOpen(false)} className="text-[#C49DB2] hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[10px] font-bold text-[#FFB8D2] uppercase block mb-1">Section Title</label>
                <input 
                  type="text" 
                  value={newSecTitle}
                  onChange={(e) => setNewSecTitle(e.target.value)}
                  placeholder="e.g. Things I Will Never Compromise On"
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-[#FF1A75]/25 text-[#FFF2F6] focus:outline-none focus:border-[#FF0D69]"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-[#FFB8D2] uppercase block mb-1">Icon & Section Type</label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { icon: '🧭', label: 'Beliefs', type: 'beliefs' },
                    { icon: '⚡', label: 'Quirks', type: 'personality' },
                    { icon: '🧠', label: 'Psychology', type: 'psychology' },
                    { icon: '🎨', label: 'Talents', type: 'skills' },
                    { icon: '📻', label: 'Obsessions', type: 'interests' },
                    { icon: '📖', label: 'Memories', type: 'personal_identity' },
                    { icon: '🔒', label: 'Private', type: 'custom' },
                    { icon: '✨', label: 'Custom', type: 'custom' }
                  ].map(preset => (
                    <button
                      key={preset.label}
                      onClick={() => {
                        setNewSecIcon(preset.icon);
                        setNewSecType(preset.type as any);
                      }}
                      className={`p-2 rounded-xl flex flex-col items-center gap-1 border transition-all cursor-pointer ${
                        newSecIcon === preset.icon ? 'bg-[#FF0D69]/25 border-[#FF0D69] text-white' : 'glass-panel text-[#C49DB2] border-white/10'
                      }`}
                    >
                      <span className="text-base">{preset.icon}</span>
                      <span className="text-[9px] font-bold truncate">{preset.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-[#FFB8D2] uppercase block mb-1">Description (Optional)</label>
                <textarea 
                  value={newSecDesc}
                  onChange={(e) => setNewSecDesc(e.target.value)}
                  placeholder="Briefly explain what this chapter describes..."
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-[#FF1A75]/25 text-[#FFF2F6] focus:outline-none focus:border-[#FF0D69]"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-[#FFB8D2] uppercase block mb-1">Visibility Level</label>
                <select 
                  value={newSecVis}
                  onChange={(e) => setNewSecVis(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-[#180412] border border-[#FF1A75]/30 text-[#FFF2F6] focus:outline-none"
                >
                  <option value="public">🌐 Public (Visible to all viewers)</option>
                  <option value="matches">💖 Matches Only (Approved matches)</option>
                  <option value="friends">👥 Friends Only (Accepted friends)</option>
                  <option value="private">🔒 Private (Owner only)</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button 
                  onClick={() => setIsAddSectionOpen(false)}
                  className="px-4 py-2 rounded-xl glass-panel text-[#C49DB2] font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleCreateSection}
                  disabled={!newSecTitle.trim()}
                  className="px-5 py-2 rounded-xl pink-gradient-btn text-white font-bold disabled:opacity-40 cursor-pointer shadow-lg"
                >
                  Create Section
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 2: ADD ENTRY TO SECTION                                         */}
      {/* ===================================================================== */}
      {isAddEntryOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="w-full max-w-md rounded-3xl glass-panel-elevated p-5 border border-[#FF1A75]/30 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-[#FFF2F6]">Add Entry to Section</h3>
              <button onClick={() => setIsAddEntryOpen(null)} className="text-[#C49DB2] hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[10px] font-bold text-[#FFB8D2] uppercase block mb-1">Entry Title</label>
                <input 
                  type="text" 
                  value={newEntryTitle}
                  onChange={(e) => setNewEntryTitle(e.target.value)}
                  placeholder="e.g. On Intellectual Humility"
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-[#FF1A75]/25 text-[#FFF2F6] focus:outline-none focus:border-[#FF0D69]"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-[#FFB8D2] uppercase block mb-1">Content / Description</label>
                <textarea 
                  value={newEntryContent}
                  onChange={(e) => setNewEntryContent(e.target.value)}
                  placeholder="Write in detail with no arbitrary character limits..."
                  rows={4}
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-[#FF1A75]/25 text-[#FFF2F6] focus:outline-none focus:border-[#FF0D69]"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-[#FFB8D2] uppercase block mb-1">Visibility Level</label>
                <select 
                  value={newEntryVis}
                  onChange={(e) => setNewEntryVis(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-[#180412] border border-[#FF1A75]/30 text-[#FFF2F6] focus:outline-none"
                >
                  <option value="public">🌐 Public</option>
                  <option value="matches">💖 Matches Only</option>
                  <option value="friends">👥 Friends Only</option>
                  <option value="private">🔒 Private</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button 
                  onClick={() => setIsAddEntryOpen(null)}
                  className="px-4 py-2 rounded-xl glass-panel text-[#C49DB2] font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => handleCreateEntry(isAddEntryOpen)}
                  disabled={!newEntryContent.trim()}
                  className="px-5 py-2 rounded-xl pink-gradient-btn text-white font-bold disabled:opacity-40 cursor-pointer shadow-lg"
                >
                  Save Entry
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 3: ADD USER QUESTION                                            */}
      {/* ===================================================================== */}
      {isAddQuestionOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="w-full max-w-md rounded-3xl glass-panel-elevated p-5 border border-[#FF1A75]/30 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-[#FFF2F6]">Create Personal Question</h3>
              <button onClick={() => setIsAddQuestionOpen(false)} className="text-[#C49DB2] hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[10px] font-bold text-[#FFB8D2] uppercase block mb-1">Question</label>
                <input 
                  type="text" 
                  value={newQTitle}
                  onChange={(e) => setNewQTitle(e.target.value)}
                  placeholder="e.g. What is something you will never compromise on?"
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-[#FF1A75]/25 text-[#FFF2F6] focus:outline-none focus:border-[#FF0D69]"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-[#FFB8D2] uppercase block mb-1">Your Answer</label>
                <textarea 
                  value={newQAnswer}
                  onChange={(e) => setNewQAnswer(e.target.value)}
                  placeholder="Write your honest answer..."
                  rows={3}
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-[#FF1A75]/25 text-[#FFF2F6] focus:outline-none focus:border-[#FF0D69]"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-[#FFB8D2] uppercase block mb-1">Visibility</label>
                <select 
                  value={newQVis}
                  onChange={(e) => setNewQVis(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-[#180412] border border-[#FF1A75]/30 text-[#FFF2F6] focus:outline-none"
                >
                  <option value="public">🌐 Public</option>
                  <option value="matches">💖 Matches Only</option>
                  <option value="friends">👥 Friends Only</option>
                  <option value="private">🔒 Private</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button 
                  onClick={() => setIsAddQuestionOpen(false)}
                  className="px-4 py-2 rounded-xl glass-panel text-[#C49DB2] font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleCreateQuestion}
                  disabled={!newQTitle.trim()}
                  className="px-5 py-2 rounded-xl pink-gradient-btn text-white font-bold disabled:opacity-40 cursor-pointer shadow-lg"
                >
                  Create Q&A
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 4: ADD TIMELINE MILESTONE                                       */}
      {/* ===================================================================== */}
      {isAddTimelineOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="w-full max-w-md rounded-3xl glass-panel-elevated p-5 border border-[#FF1A75]/30 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-[#FFF2F6]">Add Life Milestone</h3>
              <button onClick={() => setIsAddTimelineOpen(false)} className="text-[#C49DB2] hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-[#FFB8D2] uppercase block mb-1">Event Title</label>
                  <input 
                    type="text" 
                    value={newTimeTitle}
                    onChange={(e) => setNewTimeTitle(e.target.value)}
                    placeholder="e.g. First Solo Trek"
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-[#FF1A75]/25 text-[#FFF2F6] focus:outline-none focus:border-[#FF0D69]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-[#FFB8D2] uppercase block mb-1">Date / Period</label>
                  <input 
                    type="text" 
                    value={newTimeDate}
                    onChange={(e) => setNewTimeDate(e.target.value)}
                    placeholder="e.g. Summer 2022"
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-[#FF1A75]/25 text-[#FFF2F6] focus:outline-none focus:border-[#FF0D69]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-[#FFB8D2] uppercase block mb-1">Description</label>
                <textarea 
                  value={newTimeDesc}
                  onChange={(e) => setNewTimeDesc(e.target.value)}
                  placeholder="What happened during this period?"
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-[#FF1A75]/25 text-[#FFF2F6] focus:outline-none focus:border-[#FF0D69]"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-[#FFB8D2] uppercase block mb-1">Personal Significance</label>
                <input 
                  type="text" 
                  value={newTimeSig}
                  onChange={(e) => setNewTimeSig(e.target.value)}
                  placeholder="How did this experience shape who you are today?"
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-[#FF1A75]/25 text-[#FFF2F6] focus:outline-none focus:border-[#FF0D69]"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-[#FFB8D2] uppercase block mb-1">Lesson Learned</label>
                <input 
                  type="text" 
                  value={newTimeLessons}
                  onChange={(e) => setNewTimeLessons(e.target.value)}
                  placeholder="What lasting lesson did you take away?"
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-[#FF1A75]/25 text-[#FFF2F6] focus:outline-none focus:border-[#FF0D69]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button 
                  onClick={() => setIsAddTimelineOpen(false)}
                  className="px-4 py-2 rounded-xl glass-panel text-[#C49DB2] font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleCreateTimeline}
                  disabled={!newTimeTitle.trim() || !newTimeDesc.trim()}
                  className="px-5 py-2 rounded-xl pink-gradient-btn text-white font-bold disabled:opacity-40 cursor-pointer shadow-lg"
                >
                  Add Milestone
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 5: PUBLISH THOUGHT OR ESSAY                                     */}
      {/* ===================================================================== */}
      {isAddThoughtOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="w-full max-w-md rounded-3xl glass-panel-elevated p-5 border border-[#FF1A75]/30 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-[#FFF2F6]">Publish Thought or Essay</h3>
              <button onClick={() => setIsAddThoughtOpen(false)} className="text-[#C49DB2] hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[10px] font-bold text-[#FFB8D2] uppercase block mb-1">Title (Optional)</label>
                <input 
                  type="text" 
                  value={newThoughtTitle}
                  onChange={(e) => setNewThoughtTitle(e.target.value)}
                  placeholder="e.g. On Letting Go of Perfectionism"
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-[#FF1A75]/25 text-[#FFF2F6] focus:outline-none focus:border-[#FF0D69]"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-[#FFB8D2] uppercase block mb-1">Thought / Reflection Text</label>
                <textarea 
                  value={newThoughtContent}
                  onChange={(e) => setNewThoughtContent(e.target.value)}
                  placeholder="Share a perspective, observation, or unedited reflection..."
                  rows={4}
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-[#FF1A75]/25 text-[#FFF2F6] focus:outline-none focus:border-[#FF0D69]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-[#FFB8D2] uppercase block mb-1">Type</label>
                  <select 
                    value={newThoughtType}
                    onChange={(e) => setNewThoughtType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-[#180412] border border-[#FF1A75]/30 text-[#FFF2F6] focus:outline-none"
                  >
                    <option value="thought">Thought</option>
                    <option value="opinion">Opinion</option>
                    <option value="reflection">Reflection</option>
                    <option value="essay">Short Essay</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-[#FFB8D2] uppercase block mb-1">Tags (comma-separated)</label>
                  <input 
                    type="text" 
                    value={newThoughtTags}
                    onChange={(e) => setNewThoughtTags(e.target.value)}
                    placeholder="philosophy, dating"
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-[#FF1A75]/25 text-[#FFF2F6] focus:outline-none focus:border-[#FF0D69]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-[#FFB8D2] uppercase block mb-1">Visibility</label>
                <select 
                  value={newThoughtVis}
                  onChange={(e) => setNewThoughtVis(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-[#180412] border border-[#FF1A75]/30 text-[#FFF2F6] focus:outline-none"
                >
                  <option value="public">🌐 Public</option>
                  <option value="matches">💖 Matches Only</option>
                  <option value="friends">👥 Friends Only</option>
                  <option value="private">🔒 Private (Journal Draft)</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button 
                  onClick={() => setIsAddThoughtOpen(false)}
                  className="px-4 py-2 rounded-xl glass-panel text-[#C49DB2] font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleCreateThought}
                  disabled={!newThoughtContent.trim()}
                  className="px-5 py-2 rounded-xl pink-gradient-btn text-white font-bold disabled:opacity-40 cursor-pointer shadow-lg"
                >
                  Publish Thought
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 6: AI-ASSISTED PROFILE TOOLS (User-Initiated)                   */}
      {/* ===================================================================== */}
      {isAiToolOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="w-full max-w-lg rounded-3xl glass-panel-elevated p-6 border border-amber-400/30 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wand2 className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-black text-[#FFF2F6]">AI Writing & Expression Assistant</h3>
              </div>
              <button onClick={() => setIsAiToolOpen(false)} className="text-[#C49DB2] hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-[11px] text-[#C49DB2]">
              User-controlled assistant: AI never invents facts, diagnoses, or opinions. Review, edit, and inspect every suggestion before saving.
            </p>

            {/* Tool Mode Tabs */}
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => { setAiToolMode('polish'); setAiSuggestion(''); }}
                className={`py-2 px-2 rounded-xl text-[10px] font-bold border transition-colors cursor-pointer text-center ${
                  aiToolMode === 'polish' ? 'bg-amber-400/20 border-amber-400 text-amber-300' : 'glass-panel text-[#C49DB2] border-white/10'
                }`}
              >
                Polish Expression
              </button>
              <button
                onClick={() => { setAiToolMode('suggest_questions'); setAiSuggestion(''); }}
                className={`py-2 px-2 rounded-xl text-[10px] font-bold border transition-colors cursor-pointer text-center ${
                  aiToolMode === 'suggest_questions' ? 'bg-amber-400/20 border-amber-400 text-amber-300' : 'glass-panel text-[#C49DB2] border-white/10'
                }`}
              >
                Suggest Questions
              </button>
              <button
                onClick={() => { setAiToolMode('turn_into_bio'); setAiSuggestion(''); }}
                className={`py-2 px-2 rounded-xl text-[10px] font-bold border transition-colors cursor-pointer text-center ${
                  aiToolMode === 'turn_into_bio' ? 'bg-amber-400/20 border-amber-400 text-amber-300' : 'glass-panel text-[#C49DB2] border-white/10'
                }`}
              >
                Synthesize Bio
              </button>
            </div>

            {aiToolMode === 'polish' && (
              <div>
                <label className="text-[10px] font-bold text-[#FFB8D2] uppercase block mb-1">Your Rough Thoughts or Bullet Points</label>
                <textarea 
                  value={aiDraftInput}
                  onChange={(e) => setAiDraftInput(e.target.value)}
                  placeholder="Paste rough notes, bullet points, or unpolished sentences..."
                  rows={3}
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-[#FFF2F6] focus:outline-none focus:border-amber-400"
                />
              </div>
            )}

            <button
              onClick={handleRunAiTool}
              disabled={isAiLoading}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg disabled:opacity-50"
            >
              {isAiLoading ? (
                <>
                  <span className="w-3.5 h-3.5 rounded-full border-2 border-black border-t-transparent animate-spin" />
                  <span>Generating Suggestion...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-3.5 h-3.5" />
                  <span>Generate Suggestion</span>
                </>
              )}
            </button>

            {/* Suggestion Output Box */}
            {aiSuggestion && (
              <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-400/30 space-y-2 text-xs animate-fadeIn">
                <span className="text-[10px] font-bold text-amber-300 uppercase block">Suggested Draft (Inspect & Edit):</span>
                <p className="text-[#FFF2F6] italic leading-relaxed whitespace-pre-wrap">
                  {aiSuggestion}
                </p>
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-amber-400/20">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(aiSuggestion);
                      alert('Copied suggestion to clipboard!');
                    }}
                    className="px-3 py-1 rounded-lg glass-panel text-[10px] font-bold text-amber-300 hover:text-white cursor-pointer"
                  >
                    Copy to Clipboard
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
