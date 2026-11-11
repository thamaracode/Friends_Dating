import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Tag, 
  Sparkles, 
  BookOpen, 
  ArrowRight, 
  Plus, 
  Filter, 
  ChevronDown, 
  ChevronUp, 
  Heart, 
  Award, 
  Compass, 
  ShieldCheck, 
  Lock, 
  Globe, 
  Users, 
  AlertCircle,
  TrendingUp,
  History,
  X,
  Check
} from 'lucide-react';
import { lifeTimelineClient } from '../services/lifeTimelineApiClient';
import type { 
  LifeYear, 
  LifeChapter, 
  LifeEvent, 
  LifeReflection, 
  TimelineVisibility 
} from '../types/lifeTimeline';

interface YearLifeTimelineViewProps {
  userId?: string;
  isOwner?: boolean;
  viewerId?: string;
}

export const YearLifeTimelineView: React.FC<YearLifeTimelineViewProps> = ({
  userId = 'usr_me',
  isOwner = true,
  viewerId = 'usr_me'
}) => {
  const [years, setYears] = useState<LifeYear[]>([]);
  const [chapters, setChapters] = useState<LifeChapter[]>([]);
  const [events, setEvents] = useState<LifeEvent[]>([]);
  const [reflections, setReflections] = useState<LifeReflection[]>([]);
  
  const [selectedYear, setSelectedYear] = useState<number | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedYears, setExpandedYears] = useState<Record<number, boolean>>({});
  const [activeTab, setActiveTab] = useState<'timeline' | 'chapters' | 'comparisons' | 'reviews'>('timeline');
  const [isLoading, setIsLoading] = useState(true);

  // New Event Modal State
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [newEventYear, setNewEventYear] = useState<number>(new Date().getFullYear());
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventDesc, setNewEventDesc] = useState('');
  const [newEventDate, setNewEventDate] = useState('');
  const [newEventPrecision, setNewEventPrecision] = useState<'exact' | 'month_year' | 'year_only' | 'approximate' | 'unknown'>('exact');
  const [newEventCat, setNewEventCat] = useState('Personal growth and self-discovery');
  const [newEventSig, setNewEventSig] = useState('');
  const [newEventLesson, setNewEventLesson] = useState('');
  const [newEventVis, setNewEventVis] = useState<TimelineVisibility>('public');
  const [newEventIsMilestone, setNewEventIsMilestone] = useState(false);

  useEffect(() => {
    loadTimelineData();
  }, [userId, viewerId]);

  const loadTimelineData = async () => {
    try {
      setIsLoading(true);
      const [fetchedYears, fetchedChapters, fetchedEvents, fetchedReflections] = await Promise.all([
        lifeTimelineClient.getYears(userId, viewerId),
        lifeTimelineClient.getChapters(userId, viewerId),
        lifeTimelineClient.getEvents(userId, { viewerId }),
        lifeTimelineClient.getReflections(userId, { viewerId })
      ]);

      setYears(fetchedYears);
      setChapters(fetchedChapters);
      setEvents(fetchedEvents);
      setReflections(fetchedReflections);

      // Auto-expand most recent year
      if (fetchedYears.length > 0) {
        setExpandedYears({ [fetchedYears[0].year_number]: true });
      }
    } catch (err) {
      console.error('Failed to load timeline data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleYearExpand = (yearNum: number) => {
    setExpandedYears(prev => ({
      ...prev,
      [yearNum]: !prev[yearNum]
    }));
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle.trim() || !newEventDesc.trim()) return;

    try {
      await lifeTimelineClient.createEvent({
        user_id: userId,
        year_number: Number(newEventYear),
        title: newEventTitle.trim(),
        description: newEventDesc.trim(),
        date_display: newEventDate.trim() || undefined,
        date_precision: newEventPrecision,
        category: newEventCat,
        personal_significance: newEventSig.trim() || undefined,
        lessons_learned: newEventLesson.trim() || undefined,
        visibility: newEventVis,
        is_milestone: newEventIsMilestone ? 1 : 0
      });

      setIsAddEventOpen(false);
      setNewEventTitle('');
      setNewEventDesc('');
      setNewEventDate('');
      setNewEventSig('');
      setNewEventLesson('');
      loadTimelineData();
    } catch (err) {
      console.error('Failed to create event:', err);
    }
  };

  // Filtered Events
  const filteredEvents = events.filter(evt => {
    if (selectedYear !== 'all' && evt.year_number !== selectedYear) return false;
    if (selectedCategory !== 'all' && evt.category !== selectedCategory) return false;
    return true;
  });

  // Group events by year
  const eventsByYear: Record<number, LifeEvent[]> = {};
  filteredEvents.forEach(evt => {
    if (!eventsByYear[evt.year_number]) eventsByYear[evt.year_number] = [];
    eventsByYear[evt.year_number].push(evt);
  });

  const categories = [
    'all',
    'Career and business',
    'Creative projects',
    'Romantic and dating history',
    'Travel and places lived',
    'Psychological and emotional experiences',
    'Personal growth and self-discovery'
  ];

  return (
    <div className="w-full flex flex-col space-y-5 animate-fadeIn">
      {/* Top Banner & Tab Controls */}
      <div className="p-5 rounded-3xl glass-panel-elevated border border-[#FF4F87]/30 shadow-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#FF0D69] to-[#FF3B88] flex items-center justify-center text-white shadow-lg">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-[#FFF2F6] flex items-center gap-2">
                <span>Year-by-Year Life Timeline</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FF4F87]/20 border border-[#FF4F87]/40 text-[#FFB4CE]">
                  Chronological Memoir
                </span>
              </h2>
              <p className="text-xs text-[#B9A8B3]">Unfiltered record of memories, milestones, and personal evolution</p>
            </div>
          </div>

          {isOwner && (
            <button
              onClick={() => setIsAddEventOpen(true)}
              className="px-3.5 py-2 rounded-2xl bg-[#FF4F87] hover:bg-[#FF3377] text-white font-bold text-xs flex items-center gap-1.5 shadow-md hover:scale-102 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Memory</span>
            </button>
          )}
        </div>

        {/* Navigation Tabs */}
        <div className="flex p-1 rounded-2xl bg-black/40 border border-[#FF78A8]/20 text-xs">
          <button
            onClick={() => setActiveTab('timeline')}
            className={`flex-1 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
              activeTab === 'timeline' ? 'bg-[#FF4F87] text-white shadow-md' : 'text-[#B9A8B3] hover:text-[#FFF2F6]'
            }`}
          >
            Memories by Year
          </button>
          <button
            onClick={() => setActiveTab('chapters')}
            className={`flex-1 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
              activeTab === 'chapters' ? 'bg-[#FF4F87] text-white shadow-md' : 'text-[#B9A8B3] hover:text-[#FFF2F6]'
            }`}
          >
            Multi-Year Eras ({chapters.length})
          </button>
          <button
            onClick={() => setActiveTab('comparisons')}
            className={`flex-1 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
              activeTab === 'comparisons' ? 'bg-[#FF4F87] text-white shadow-md' : 'text-[#B9A8B3] hover:text-[#FFF2F6]'
            }`}
          >
            Then vs Now
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`flex-1 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
              activeTab === 'reviews' ? 'bg-[#FF4F87] text-white shadow-md' : 'text-[#B9A8B3] hover:text-[#FFF2F6]'
            }`}
          >
            Annual Reviews
          </button>
        </div>

        {/* Category Filter Pills (When on Timeline Tab) */}
        {activeTab === 'timeline' && (
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
            <span className="text-[10px] text-[#7A6975] uppercase font-bold shrink-0">Filter:</span>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-full text-[11px] font-medium whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#FF4F87] text-white font-bold shadow-sm'
                    : 'bg-black/30 text-[#B9A8B3] hover:text-white border border-white/5'
                }`}
              >
                {cat === 'all' ? 'All Categories' : cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* TAB 1: MEMORIES BY YEAR */}
      {activeTab === 'timeline' && (
        <div className="space-y-4">
          {years.map((yearObj) => {
            const yearNum = yearObj.year_number;
            const yearEvents = eventsByYear[yearNum] || [];
            const isExpanded = !!expandedYears[yearNum];

            return (
              <div 
                key={yearObj.id} 
                className="rounded-3xl glass-panel-elevated border border-[#FF4F87]/20 overflow-hidden shadow-xl"
              >
                {/* Year Header Card */}
                <div 
                  onClick={() => toggleYearExpand(yearNum)}
                  className="p-4 bg-gradient-to-r from-[#1E0518] to-[#12020D] flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors select-none"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-[#FF4F87]/20 border border-[#FF4F87]/40 flex flex-col items-center justify-center text-[#FFD6E3] shadow-md">
                      <span className="text-sm font-black font-mono">{yearNum}</span>
                      <span className="text-[9px] uppercase font-bold text-[#FFB4CE]">Era</span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-[#FFF2F6]">
                          {yearObj.chapter_title || `Year of ${yearNum}`}
                        </h3>
                        {yearObj.is_future_year === 1 && (
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                            Future Plans
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#A695A0] line-clamp-1">{yearObj.summary || 'Memories and life events'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <span className="text-[11px] font-semibold text-[#FFB4CE] bg-black/40 px-2 py-0.5 rounded-full border border-white/5">
                      {yearEvents.length} {yearEvents.length === 1 ? 'memory' : 'memories'}
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-[#FF4F87]" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-[#7A6975]" />
                    )}
                  </div>
                </div>

                {/* Expanded Year Memories List */}
                {isExpanded && (
                  <div className="p-4 space-y-3 bg-black/20 border-t border-[#FF4F87]/15 animate-fadeIn">
                    {yearEvents.length === 0 ? (
                      <div className="py-6 text-center text-[#7A6975] text-xs">
                        No recorded memories for {yearNum} under this filter.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {yearEvents.map((evt) => (
                          <div 
                            key={evt.id} 
                            className="p-3.5 rounded-2xl bg-black/40 border border-[#FF78A8]/20 space-y-2 hover:border-[#FF4F87]/40 transition-colors"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className="text-xs font-bold text-[#FFF2F6]">{evt.title}</h4>
                                  {evt.is_milestone === 1 && (
                                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-amber-400/20 text-amber-300 border border-amber-400/40 flex items-center gap-1">
                                      <Award className="w-2.5 h-2.5" />
                                      <span>Milestone</span>
                                    </span>
                                  )}
                                  {evt.is_planned === 1 && (
                                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-sky-400/20 text-sky-300 border border-sky-400/40">
                                      Goal / Planned
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 text-[10px] text-[#A695A0] mt-0.5">
                                  {evt.date_display && <span>📅 {evt.date_display}</span>}
                                  {evt.location && <span>📍 {evt.location}</span>}
                                  <span className="text-[#FFB4CE]">🏷️ {evt.category}</span>
                                </div>
                              </div>

                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[#B9A8B3]">
                                {evt.visibility}
                              </span>
                            </div>

                            <p className="text-xs text-[#E3D2DC] leading-relaxed">{evt.description}</p>

                            {/* Personal Significance */}
                            {evt.personal_significance && (
                              <div className="text-[11px] text-[#FFF0F4] italic pl-2.5 border-l-2 border-[#FF4F87]/60">
                                <span className="font-semibold text-[#FFB4CE] not-italic">Significance: </span>
                                {evt.personal_significance}
                              </div>
                            )}

                            {/* Lessons Learned */}
                            {evt.lessons_learned && (
                              <div className="p-2 rounded-xl bg-purple-950/20 border border-purple-500/20 text-[11px] text-purple-200">
                                <span className="font-bold text-purple-300">💡 Lesson: </span>
                                {evt.lessons_learned}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 2: MULTI-YEAR ERAS / CHAPTERS */}
      {activeTab === 'chapters' && (
        <div className="space-y-3">
          {chapters.map((chap) => (
            <div 
              key={chap.id} 
              className="p-4 rounded-3xl glass-panel-elevated border border-[#FF4F87]/25 space-y-2.5 shadow-xl hover:border-[#FF4F87]/50 transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#FF4F87]/20 border border-[#FF4F87]/30 flex items-center justify-center text-lg">
                    {chap.icon || '📖'}
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-[#FFF2F6]">{chap.title}</h3>
                    <span className="text-[10px] font-mono font-bold text-[#FFB4CE]">
                      {chap.start_year} — {chap.end_year || 'Present'}
                    </span>
                  </div>
                </div>

                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-black/40 border border-[#FF78A8]/30 text-[#FFD6E3]">
                  {chap.visibility}
                </span>
              </div>

              {chap.description && (
                <p className="text-xs text-[#E3D2DC] leading-relaxed pl-1">{chap.description}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: THEN VS NOW TEMPORAL COMPARISONS */}
      {activeTab === 'comparisons' && (
        <div className="space-y-4">
          {reflections
            .filter(r => r.reflection_type === 'then_vs_now')
            .map((comp) => {
              let parsed: any = {};
              try {
                parsed = JSON.parse(comp.content_json);
              } catch (e) {
                parsed = {};
              }

              return (
                <div 
                  key={comp.id} 
                  className="p-5 rounded-3xl glass-panel-elevated border border-[#FF4F87]/30 shadow-2xl space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-[#FFF2F6]">{comp.title}</h3>
                      <p className="text-[10px] text-[#A695A0]">Self-evolution analysis across major life chapters</p>
                    </div>
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#FF4F87]/20 text-[#FFB4CE] border border-[#FF4F87]/30">
                      Then vs Now
                    </span>
                  </div>

                  <div className="space-y-3">
                    {['personality', 'values', 'habits', 'relationships'].map((dim) => {
                      if (!parsed[dim]) return null;
                      return (
                        <div key={dim} className="p-3 rounded-2xl bg-black/40 border border-[#FF78A8]/20 space-y-2">
                          <span className="text-[10px] uppercase font-bold text-[#FFB4CE] tracking-wider block">
                            {dim}
                          </span>
                          <div className="grid grid-cols-2 gap-3 text-xs">
                            <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 space-y-1">
                              <span className="text-[10px] font-bold text-[#8E7C88] uppercase">Then</span>
                              <p className="text-xs text-[#C4B2BD] leading-relaxed">{parsed[dim].then}</p>
                            </div>
                            <div className="p-2.5 rounded-xl bg-[#FF0D69]/10 border border-[#FF4F87]/30 space-y-1">
                              <span className="text-[10px] font-bold text-[#FFB4CE] uppercase">Now</span>
                              <p className="text-xs text-[#FFF0F4] leading-relaxed font-medium">{parsed[dim].now}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {parsed.self_reflection && (
                      <div className="p-3.5 rounded-2xl bg-gradient-to-r from-[#FF0D69]/20 to-transparent border border-[#FF4F87]/40 text-xs italic text-[#FFF2F6]">
                        "{parsed.self_reflection}"
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
        </div>
      )}

      {/* TAB 4: ANNUAL REVIEWS */}
      {activeTab === 'reviews' && (
        <div className="space-y-4">
          {reflections
            .filter(r => r.reflection_type === 'year_end_review')
            .map((rev) => {
              let parsed: any = {};
              try {
                parsed = JSON.parse(rev.content_json);
              } catch (e) {
                parsed = {};
              }

              return (
                <div 
                  key={rev.id} 
                  className="p-5 rounded-3xl glass-panel-elevated border border-[#FF4F87]/30 shadow-2xl space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-[#FFF2F6]">{rev.title}</h3>
                      <span className="text-[10px] font-mono font-bold text-[#FFB4CE]">
                        Year {rev.year_number} in Retrospect
                      </span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Annual Retrospective
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {parsed.best_memory && (
                      <div className="p-3 rounded-2xl bg-black/40 border border-[#FF78A8]/20 space-y-1">
                        <span className="text-[10px] font-bold text-emerald-400 uppercase">🌟 Best Memory</span>
                        <p className="text-xs text-[#E3D2DC]">{parsed.best_memory}</p>
                      </div>
                    )}

                    {parsed.biggest_achievement && (
                      <div className="p-3 rounded-2xl bg-black/40 border border-[#FF78A8]/20 space-y-1">
                        <span className="text-[10px] font-bold text-amber-300 uppercase">🏆 Proudest Achievement</span>
                        <p className="text-xs text-[#E3D2DC]">{parsed.biggest_achievement}</p>
                      </div>
                    )}

                    {parsed.biggest_lesson && (
                      <div className="p-3 rounded-2xl bg-black/40 border border-[#FF78A8]/20 space-y-1">
                        <span className="text-[10px] font-bold text-purple-300 uppercase">💡 Biggest Lesson</span>
                        <p className="text-xs text-[#E3D2DC]">{parsed.biggest_lesson}</p>
                      </div>
                    )}

                    {parsed.what_changed_about_me && (
                      <div className="p-3 rounded-2xl bg-black/40 border border-[#FF78A8]/20 space-y-1">
                        <span className="text-[10px] font-bold text-[#FFB4CE] uppercase">🔄 How I Evolved</span>
                        <p className="text-xs text-[#E3D2DC]">{parsed.what_changed_about_me}</p>
                      </div>
                    )}
                  </div>

                  {parsed.message_to_future_self && (
                    <div className="p-3 rounded-2xl bg-[#FF4F87]/15 border border-[#FF4F87]/30 text-xs italic text-[#FFF0F4]">
                      <span className="font-bold text-[#FFB4CE] not-italic block text-[10px] uppercase">Message to Future Self:</span>
                      "{parsed.message_to_future_self}"
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      )}

      {/* Modal: Add New Memory / Timeline Event */}
      {isAddEventOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="w-full max-w-lg bg-[#140311] border border-[#FF4F87]/40 rounded-3xl p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto no-scrollbar">
            <div className="flex items-center justify-between border-b border-[#FF4F87]/20 pb-3">
              <h3 className="text-sm font-bold text-[#FFF2F6] flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#FF4F87]" />
                <span>Record New Life Memory</span>
              </h3>
              <button 
                onClick={() => setIsAddEventOpen(false)}
                className="text-[#8E7C88] hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-[#FFB4CE] font-bold block mb-1">Year</label>
                  <input
                    type="number"
                    value={newEventYear}
                    onChange={(e) => setNewEventYear(Number(e.target.value))}
                    className="w-full bg-black/40 border border-[#FF78A8]/30 rounded-xl px-3 py-2 text-[#FFF2F6] focus:outline-none focus:border-[#FF4F87]"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] text-[#FFB4CE] font-bold block mb-1">Exact Date / Season (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. November 14 or Autumn"
                    value={newEventDate}
                    onChange={(e) => setNewEventDate(e.target.value)}
                    className="w-full bg-black/40 border border-[#FF78A8]/30 rounded-xl px-3 py-2 text-[#FFF2F6] focus:outline-none focus:border-[#FF4F87]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-[#FFB4CE] font-bold block mb-1">Memory Title</label>
                <input
                  type="text"
                  placeholder="What happened?"
                  value={newEventTitle}
                  onChange={(e) => setNewEventTitle(e.target.value)}
                  className="w-full bg-black/40 border border-[#FF78A8]/30 rounded-xl px-3 py-2 text-[#FFF2F6] focus:outline-none focus:border-[#FF4F87]"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] text-[#FFB4CE] font-bold block mb-1">Description & Memory Details</label>
                <textarea
                  rows={3}
                  placeholder="Write the full unfiltered memory..."
                  value={newEventDesc}
                  onChange={(e) => setNewEventDesc(e.target.value)}
                  className="w-full bg-black/40 border border-[#FF78A8]/30 rounded-xl px-3 py-2 text-[#FFF2F6] focus:outline-none focus:border-[#FF4F87]"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] text-[#FFB4CE] font-bold block mb-1">Category</label>
                <select
                  value={newEventCat}
                  onChange={(e) => setNewEventCat(e.target.value)}
                  className="w-full bg-black/40 border border-[#FF78A8]/30 rounded-xl px-3 py-2 text-[#FFF2F6] focus:outline-none focus:border-[#FF4F87]"
                >
                  <option value="Career and business">Career and business</option>
                  <option value="Creative projects">Creative projects</option>
                  <option value="Romantic and dating history">Romantic and dating history</option>
                  <option value="Travel and places lived">Travel and places lived</option>
                  <option value="Psychological and emotional experiences">Psychological and emotional experiences</option>
                  <option value="Personal growth and self-discovery">Personal growth and self-discovery</option>
                  <option value="Friendships and community">Friendships and community</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-[#FFB4CE] font-bold block mb-1">Significance (Optional)</label>
                  <input
                    type="text"
                    placeholder="Why does this matter?"
                    value={newEventSig}
                    onChange={(e) => setNewEventSig(e.target.value)}
                    className="w-full bg-black/40 border border-[#FF78A8]/30 rounded-xl px-3 py-2 text-[#FFF2F6] focus:outline-none focus:border-[#FF4F87]"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-[#FFB4CE] font-bold block mb-1">Lesson Learned (Optional)</label>
                  <input
                    type="text"
                    placeholder="What did you learn?"
                    value={newEventLesson}
                    onChange={(e) => setNewEventLesson(e.target.value)}
                    className="w-full bg-black/40 border border-[#FF78A8]/30 rounded-xl px-3 py-2 text-[#FFF2F6] focus:outline-none focus:border-[#FF4F87]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[#FF4F87]/20">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={newEventIsMilestone}
                    onChange={(e) => setNewEventIsMilestone(e.target.checked)}
                    className="rounded bg-black/40 border-[#FF78A8]/40 text-[#FF4F87]"
                  />
                  <span className="text-xs text-[#FFD6E3]">Mark as Major Milestone</span>
                </label>

                <div className="flex items-center gap-2">
                  <select
                    value={newEventVis}
                    onChange={(e) => setNewEventVis(e.target.value as TimelineVisibility)}
                    className="bg-black/40 border border-[#FF78A8]/30 rounded-xl px-2 py-1 text-[11px] text-[#FFF2F6]"
                  >
                    <option value="public">🌐 Public</option>
                    <option value="matches">💖 Matches</option>
                    <option value="friends">👥 Friends</option>
                    <option value="private">🔒 Private</option>
                  </select>

                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-[#FF4F87] hover:bg-[#FF3377] text-white font-bold text-xs cursor-pointer shadow-md"
                  >
                    Save Memory
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
