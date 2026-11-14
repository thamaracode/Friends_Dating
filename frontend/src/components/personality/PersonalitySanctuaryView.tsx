import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Brain, 
  Heart, 
  Shield, 
  Search, 
  BookOpen, 
  Sliders, 
  UserCheck, 
  Clock, 
  Users, 
  Check, 
  AlertCircle, 
  Info, 
  HelpCircle, 
  MessageSquare, 
  ArrowRight, 
  Plus, 
  Eye, 
  Lock, 
  Save, 
  Flame, 
  Target, 
  Compass, 
  Layers, 
  Star,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  X
} from 'lucide-react';
import { personalityApiClient } from '../../services/personalityApiClient';
import type { 
  PsychologyConcept, 
  ConceptualDomain, 
  FrameworkType, 
  UserPersonalityProfile, 
  ReflectionExercise, 
  UserReflectionResponse, 
  UserPerceptionFeedback, 
  UserTraitHistorySnapshot, 
  CompatibilityResonanceReport,
  CommunicationStyle,
  ListeningStyle,
  AttachmentAwareness
} from '../../types/personalityFramework';
import { 
  DOMAIN_METADATA, 
  FRAMEWORK_TYPE_METADATA 
} from '../../types/personalityFramework';

interface PersonalitySanctuaryViewProps {
  currentUserId?: string;
  onNavigateTab?: (tab: string) => void;
}

export const PersonalitySanctuaryView: React.FC<PersonalitySanctuaryViewProps> = ({
  currentUserId = 'usr_me',
  onNavigateTab
}) => {
  const [activeTab, setActiveTab] = useState<'lexicon' | 'canvas' | 'exercises' | 'mirror' | 'timeline' | 'compatibility'>('lexicon');
  
  // Lexicon State
  const [concepts, setConcepts] = useState<PsychologyConcept[]>([]);
  const [selectedDomain, setSelectedDomain] = useState<ConceptualDomain | 'all'>('all');
  const [selectedFramework, setSelectedFramework] = useState<FrameworkType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedConceptId, setExpandedConceptId] = useState<string | null>(null);

  // Profile Canvas State
  const [profile, setProfile] = useState<UserPersonalityProfile | null>(null);
  const [dimensions, setDimensions] = useState<Record<string, number>>({
    introversion_extraversion: 40,
    openness: 85,
    conscientiousness: 75,
    agreeableness: 80,
    emotional_stability: 70
  });
  const [traitExplanations, setTraitExplanations] = useState<Record<string, string>>({});
  const [communicationStyle, setCommunicationStyle] = useState<CommunicationStyle>('empathetic');
  const [communicationNotes, setCommunicationNotes] = useState('');
  const [listeningStyle, setListeningStyle] = useState<ListeningStyle>('reflective');
  const [attachmentAwareness, setAttachmentAwareness] = useState<AttachmentAwareness>('secure_leaning');
  const [attachmentNotes, setAttachmentNotes] = useState('');
  const [selectedValues, setSelectedValues] = useState<string[]>(['integrity', 'authenticity', 'curiosity', 'compassion']);
  const [valuesExplanations, setValuesExplanations] = useState<Record<string, string>>({});
  const [boundariesText, setBoundariesText] = useState('');
  const [conflictStyleText, setConflictStyleText] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Exercises State
  const [exercises, setExercises] = useState<ReflectionExercise[]>([]);
  const [activeExercise, setActiveExercise] = useState<ReflectionExercise | null>(null);
  const [exerciseAnswers, setExerciseAnswers] = useState<Record<string, string>>({});
  const [personalTakeaway, setPersonalTakeaway] = useState('');
  const [pastResponses, setPastResponses] = useState<UserReflectionResponse[]>([]);

  // Perception Mirror State
  const [feedbacks, setFeedbacks] = useState<UserPerceptionFeedback[]>([]);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [newFeedbackStrengths, setNewFeedbackStrengths] = useState('');
  const [newFeedbackImpression, setNewFeedbackImpression] = useState('');
  const [newFeedbackValues, setNewFeedbackValues] = useState('');
  const [newFeedbackRating, setNewFeedbackRating] = useState(5);

  // Timeline State
  const [snapshots, setSnapshots] = useState<UserTraitHistorySnapshot[]>([]);
  const [isSnapshotModalOpen, setIsSnapshotModalOpen] = useState(false);
  const [snapshotLabel, setSnapshotLabel] = useState('');
  const [growthReflections, setGrowthReflections] = useState('');

  // Compatibility State
  const [partnerUserId, setPartnerUserId] = useState('usr_elena');
  const [compatibilityReport, setCompatibilityReport] = useState<CompatibilityResonanceReport | null>(null);
  const [isLoadingReport, setIsLoadingReport] = useState(false);

  // Notifications
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  useEffect(() => {
    loadLexicon();
    loadProfile();
    loadExercises();
    loadFeedback();
    loadSnapshots();
  }, [currentUserId]);

  const loadLexicon = async () => {
    try {
      const data = await personalityApiClient.getConcepts({
        domain: selectedDomain === 'all' ? undefined : selectedDomain,
        frameworkType: selectedFramework === 'all' ? undefined : selectedFramework,
        search: searchQuery
      });
      setConcepts(data);
    } catch (err) {
      console.error('Failed to load concepts', err);
    }
  };

  useEffect(() => {
    loadLexicon();
  }, [selectedDomain, selectedFramework, searchQuery]);

  const loadProfile = async () => {
    try {
      const p = await personalityApiClient.getUserProfile(currentUserId, currentUserId);
      if (p) {
        setProfile(p);
        setDimensions(p.dimensions || {});
        setTraitExplanations(p.trait_explanations || {});
        setCommunicationStyle(p.communication_style || 'empathetic');
        setCommunicationNotes(p.communication_notes || '');
        setListeningStyle(p.listening_style || 'reflective');
        setAttachmentAwareness(p.attachment_awareness || 'secure_leaning');
        setAttachmentNotes(p.attachment_notes || '');
        setSelectedValues(p.core_values || ['integrity', 'authenticity', 'curiosity']);
        setValuesExplanations(p.values_explanations || {});
        setBoundariesText(p.emotional_boundaries || '');
        setConflictStyleText(p.conflict_style || '');
      }
    } catch (err) {
      console.error('Failed to load profile', err);
    }
  };

  const loadExercises = async () => {
    try {
      const [exList, respList] = await Promise.all([
        personalityApiClient.getExercises(),
        personalityApiClient.getUserResponses(currentUserId, currentUserId)
      ]);
      setExercises(exList);
      setPastResponses(respList);
    } catch (err) {
      console.error('Failed to load exercises', err);
    }
  };

  const loadFeedback = async () => {
    try {
      const fbList = await personalityApiClient.getPerceptionFeedback(currentUserId, currentUserId);
      setFeedbacks(fbList);
    } catch (err) {
      console.error('Failed to load feedback', err);
    }
  };

  const loadSnapshots = async () => {
    try {
      const snaps = await personalityApiClient.getUserTraitHistory(currentUserId, currentUserId);
      setSnapshots(snaps);
    } catch (err) {
      console.error('Failed to load snapshots', err);
    }
  };

  const handleSaveProfile = async () => {
    setIsSavingProfile(true);
    try {
      const saved = await personalityApiClient.saveUserProfile({
        user_id: currentUserId,
        dimensions,
        trait_explanations: traitExplanations,
        communication_style: communicationStyle,
        communication_notes: communicationNotes,
        listening_style: listeningStyle,
        attachment_awareness: attachmentAwareness,
        attachment_notes: attachmentNotes,
        core_values: selectedValues,
        values_explanations: valuesExplanations,
        emotional_boundaries: boundariesText,
        conflict_style: conflictStyleText,
        visibility: 'public'
      });
      setProfile(saved);
      showToast('✨ Personality & EI Canvas saved successfully');
    } catch (err: any) {
      showToast('❌ Failed to save profile');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleSubmitExercise = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeExercise) return;

    try {
      const response = await personalityApiClient.submitExercise(activeExercise.id, {
        userId: currentUserId,
        answers: exerciseAnswers,
        personalTakeaway,
        visibility: 'private'
      });
      setPastResponses(prev => [response, ...prev.filter(r => r.exercise_id !== activeExercise.id)]);
      setActiveExercise(null);
      setExerciseAnswers({});
      setPersonalTakeaway('');
      showToast('✨ Introspection saved to your private journal');
    } catch (err: any) {
      showToast('❌ Failed to submit exercise');
    }
  };

  const handleCreateSnapshot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!snapshotLabel.trim()) return;

    try {
      const snap = await personalityApiClient.recordTraitSnapshot({
        userId: currentUserId,
        snapshotLabel: snapshotLabel.trim(),
        growthReflections: growthReflections.trim()
      });
      setSnapshots(prev => [...prev, snap]);
      setIsSnapshotModalOpen(false);
      setSnapshotLabel('');
      setGrowthReflections('');
      showToast('📸 Growth snapshot recorded');
    } catch (err: any) {
      showToast('❌ Failed to record snapshot');
    }
  };

  const handleLoadCompatibility = async () => {
    if (!partnerUserId.trim()) return;
    setIsLoadingReport(true);
    try {
      const report = await personalityApiClient.calculateCompatibility(currentUserId, partnerUserId.trim());
      setCompatibilityReport(report);
      showToast('✨ Resonance report calculated');
    } catch (err: any) {
      showToast('❌ Unable to calculate compatibility');
    } finally {
      setIsLoadingReport(false);
    }
  };

  const toggleValue = (val: string) => {
    if (selectedValues.includes(val)) {
      setSelectedValues(prev => prev.filter(v => v !== val));
    } else {
      if (selectedValues.length >= 7) {
        showToast('You can select up to 7 primary core values');
        return;
      }
      setSelectedValues(prev => [...prev, val]);
    }
  };

  return (
    <div className="w-full space-y-6 max-w-6xl mx-auto pb-16">
      
      {/* =================================================================== */}
      {/* 1. TOP HEADER & MANDATORY CLINICAL / ETHICAL GUARDRAIL             */}
      {/* =================================================================== */}
      <div className="p-6 rounded-3xl dark-glass border border-white/10 shadow-2xl relative overflow-hidden space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500/20 via-blue-500/20 to-emerald-500/20 border border-white/20 flex items-center justify-center text-white shadow-inner">
              <Brain className="w-6 h-6 text-purple-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl md:text-2xl font-bold text-white font-serif tracking-tight">
                  Personality, Human Behavior & Emotional Intelligence
                </h1>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-mono">
                  Non-Diagnostic
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-1">
                A rich vocabulary engine and introspection sanctuary for self-awareness, communication styles, and authentic interpersonal connection.
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-2xl bg-black/40 border border-white/10 text-xs">
            {[
              { id: 'lexicon', label: 'Concept Lexicon', icon: BookOpen },
              { id: 'canvas', label: 'Self Canvas', icon: Sliders },
              { id: 'exercises', label: 'Reflections', icon: Compass },
              { id: 'mirror', label: 'Perception Mirror', icon: Users },
              { id: 'timeline', label: 'Growth Timeline', icon: Clock },
              { id: 'compatibility', label: 'Resonance Mirror', icon: Heart }
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    isActive
                      ? 'bg-purple-600/40 text-white border border-purple-400/50 shadow-sm'
                      : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Ethical Guardrail Disclaimer Alert */}
        <div className="p-3.5 rounded-2xl bg-purple-950/20 border border-purple-500/30 flex items-start gap-3 text-xs text-purple-200/90 leading-relaxed">
          <Info className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
          <div>
            <strong className="text-white block mb-0.5">Ethical & Educational Transparency Policy:</strong>
            Soulverse provides structured psychological vocabulary to help people explore themselves and their relationships in their own words. 
            We <strong>do not diagnose</strong> users or claim to determine your hidden thoughts, gender psychology, or mental health from superficial activity. 
            Empirical scientific frameworks, communication paradigms, and popular reflective lenses are clearly distinguished below.
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* TAB 1: PSYCHOLOGICAL & INTERPERSONAL CONCEPT LEXICON                */}
      {/* =================================================================== */}
      {activeTab === 'lexicon' && (
        <div className="space-y-6">
          
          {/* Domain Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setSelectedDomain('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedDomain === 'all'
                  ? 'bg-white/20 text-white border border-white/30 shadow-sm'
                  : 'dark-glass text-zinc-400 hover:text-white border border-white/10'
              }`}
            >
              All Domains ({concepts.length})
            </button>
            {(Object.keys(DOMAIN_METADATA) as ConceptualDomain[]).map(d => {
              const meta = DOMAIN_METADATA[d];
              const isSelected = selectedDomain === d;
              return (
                <button
                  key={d}
                  onClick={() => setSelectedDomain(d)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-white/20 text-white border border-white/40 shadow-sm'
                      : 'dark-glass text-zinc-400 hover:text-white border border-white/10'
                  }`}
                >
                  <span>{meta.icon}</span>
                  <span>{meta.label}</span>
                </button>
              );
            })}
          </div>

          {/* Search & Framework Type Filter */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search psychological concepts, Big Five traits, active listening, attachment..."
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl dark-glass border border-white/10 text-xs text-white placeholder-white/30 focus:outline-none focus:border-white/30"
              />
            </div>

            <select
              value={selectedFramework}
              onChange={e => setSelectedFramework(e.target.value as any)}
              className="px-3.5 py-2.5 rounded-2xl bg-[#141721] border border-white/10 text-xs text-zinc-200 focus:outline-none cursor-pointer"
            >
              <option value="all">All Frameworks</option>
              <option value="scientific">Peer-Reviewed Scientific</option>
              <option value="research_supported">Research-Supported Models</option>
              <option value="popular_psychology">Popular Reflective Typologies</option>
              <option value="narrative_archetype">Narrative & Mythic Archetypes</option>
            </select>
          </div>

          {/* Concepts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {concepts.map(concept => {
              const isExpanded = expandedConceptId === concept.id;
              const fMeta = FRAMEWORK_TYPE_METADATA[concept.framework_type];
              const dMeta = DOMAIN_METADATA[concept.domain];

              return (
                <div
                  key={concept.id}
                  className="p-5 rounded-3xl dark-glass border border-white/[0.08] hover:border-white/20 transition-all space-y-3 shadow-lg flex flex-col justify-between"
                >
                  <div className="space-y-2.5">
                    {/* Top Badges */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${fMeta.bgClass} ${fMeta.textClass} ${fMeta.borderClass}`}>
                        {fMeta.badge}
                      </span>
                      <span className="text-[10px] text-zinc-400 flex items-center gap-1">
                        <span>{dMeta.icon}</span>
                        <span>{dMeta.label}</span>
                      </span>
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-white font-serif">{concept.title}</h3>
                      {concept.scientific_name && (
                        <p className="text-[10px] font-mono text-zinc-400 mt-0.5">{concept.scientific_name}</p>
                      )}
                    </div>

                    <p className="text-xs text-zinc-300 leading-relaxed">
                      {concept.definition}
                    </p>

                    {/* Practical Scenario */}
                    <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 space-y-1">
                      <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block">
                        Concrete Practical Example
                      </span>
                      <p className="text-[11px] text-zinc-300 italic leading-relaxed">
                        "{concept.practical_example}"
                      </p>
                    </div>

                    {/* Expandable Details: Appropriate Context & Limitations */}
                    {isExpanded && (
                      <div className="pt-2 border-t border-white/5 space-y-2.5 animate-fadeIn">
                        <div>
                          <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-wider block mb-0.5">
                            Appropriate Context
                          </span>
                          <p className="text-[11px] text-zinc-300 leading-relaxed">
                            {concept.appropriate_context}
                          </p>
                        </div>

                        <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-200 leading-relaxed">
                          <strong className="block text-[9px] uppercase font-bold text-amber-300 mb-0.5">
                            Limitations & Ethical Caveat:
                          </strong>
                          {concept.limitations_and_caveats}
                        </div>

                        {concept.related_concepts && concept.related_concepts.length > 0 && (
                          <div className="flex flex-wrap gap-1 pt-1">
                            {concept.related_concepts.map((rc, idx) => (
                              <span key={idx} className="px-2 py-0.5 rounded-full text-[9px] bg-white/5 text-zinc-400 border border-white/10">
                                #{rc}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Toggle Expansion Footer */}
                  <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs">
                    <button
                      onClick={() => setExpandedConceptId(isExpanded ? null : concept.id)}
                      className="text-[10px] text-purple-300 hover:text-white font-medium flex items-center gap-1 cursor-pointer"
                    >
                      <span>{isExpanded ? 'Hide Details & Caveats' : 'Read Caveats & Context'}</span>
                      {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>
                    {concept.spectrum_low_label && (
                      <span className="text-[9px] text-zinc-500 font-mono">Continuous Spectrum</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 2: SELF-EXPRESSION SPECTRUM & TRAIT CANVAS                      */}
      {/* =================================================================== */}
      {activeTab === 'canvas' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl dark-glass border border-white/10 shadow-2xl space-y-6">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
              <div>
                <h2 className="text-base font-bold text-white font-serif">Self-Expression Trait Canvas</h2>
                <p className="text-xs text-zinc-400">
                  Rate yourself along continuous spectrums and articulate what these traits mean in your own words.
                </p>
              </div>

              <button
                onClick={handleSaveProfile}
                disabled={isSavingProfile}
                className="px-5 py-2 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg transition-all cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isSavingProfile ? 'Saving...' : 'Save Canvas'}</span>
              </button>
            </div>

            {/* Continuous Dimensional Spectrums */}
            <div className="space-y-5">
              <h3 className="text-xs font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5" />
                <span>1. Big Five Dimensional Spectrums (Continuous Scale)</span>
              </h3>

              {[
                {
                  key: 'introversion_extraversion',
                  title: 'Social Battery & Stimulation Pacing',
                  lowLabel: 'Quiet Solitary Recharging (Introvert)',
                  highLabel: 'Expansive External Socializing (Extrovert)',
                  placeholder: 'In your own words: how do you recharge after intense weeks?'
                },
                {
                  key: 'openness',
                  title: 'Intellectual & Aesthetic Curiosity',
                  lowLabel: 'Pragmatic, Familiar & Grounded',
                  highLabel: 'Unconventional, Novelty & Depth-Seeking',
                  placeholder: 'In your own words: what topics or art forms spark your curiosity?'
                },
                {
                  key: 'conscientiousness',
                  title: 'Structure, Diligence & Pacing',
                  lowLabel: 'Flexible, Spontaneous & Improvisational',
                  highLabel: 'Organized, Thorough & Goal-Directed',
                  placeholder: 'In your own words: how do you approach deadlines and shared routines?'
                },
                {
                  key: 'agreeableness',
                  title: 'Empathic Warmth & Interpersonal Focus',
                  lowLabel: 'Direct, Skeptical & Analytically Critical',
                  highLabel: 'Compassionate, Accommodating & Prosocial',
                  placeholder: 'In your own words: how do you balance kindness with honesty?'
                },
                {
                  key: 'emotional_stability',
                  title: 'Affective Equanimity & Stress Coping',
                  lowLabel: 'Deeply Reactive, Sensitive & Vigilant',
                  highLabel: 'Calm, Resilient & Even-Keeled',
                  placeholder: 'In your own words: what helps you center yourself under sudden stress?'
                }
              ].map(dim => {
                const currentVal = dimensions[dim.key] !== undefined ? dimensions[dim.key] : 50;
                return (
                  <div key={dim.key} className="p-4 rounded-2xl dark-glass border border-white/5 space-y-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-white">{dim.title}</span>
                      <span className="font-mono text-purple-300 font-bold">{currentVal}%</span>
                    </div>

                    {/* Slider */}
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={currentVal}
                      onChange={e => setDimensions(prev => ({ ...prev, [dim.key]: parseInt(e.target.value, 10) }))}
                      className="w-full accent-purple-500 h-1.5 bg-white/10 rounded-lg cursor-pointer"
                    />

                    <div className="flex justify-between text-[10px] text-zinc-400 font-mono">
                      <span>{dim.lowLabel}</span>
                      <span>{dim.highLabel}</span>
                    </div>

                    {/* In User's Own Words */}
                    <div className="pt-1.5">
                      <textarea
                        value={traitExplanations[dim.key] || ''}
                        onChange={e => setTraitExplanations(prev => ({ ...prev, [dim.key]: e.target.value }))}
                        placeholder={dim.placeholder}
                        rows={2}
                        className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-zinc-200 placeholder-white/30 focus:outline-none focus:border-white/30"
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Core Values Selector (Pick up to 7 with own words) */}
            <div className="space-y-3 pt-3 border-t border-white/10">
              <h3 className="text-xs font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5" />
                <span>2. Core Values & Principles (Select up to 7)</span>
              </h3>

              <div className="flex flex-wrap gap-2">
                {[
                  'integrity', 'authenticity', 'compassion', 'accountability',
                  'curiosity', 'courage', 'independence', 'loyalty',
                  'ambition', 'generosity', 'patience', 'respect'
                ].map(val => {
                  const isSelected = selectedValues.includes(val);
                  return (
                    <button
                      key={val}
                      type="button"
                      onClick={() => toggleValue(val)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-purple-600/40 text-white border border-purple-400 shadow-sm'
                          : 'dark-glass text-zinc-400 hover:text-white border border-white/10'
                      }`}
                    >
                      {isSelected ? '✓ ' : '+ '}{val}
                    </button>
                  );
                })}
              </div>

              {/* Explanations for selected values */}
              {selectedValues.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                  {selectedValues.map(val => (
                    <div key={val} className="p-3 rounded-2xl dark-glass border border-white/5 space-y-1">
                      <span className="text-[11px] font-bold text-white capitalize">{val}:</span>
                      <input
                        type="text"
                        value={valuesExplanations[val] || ''}
                        onChange={e => setValuesExplanations(prev => ({ ...prev, [val]: e.target.value }))}
                        placeholder={`Why does ${val} matter deeply to you?`}
                        className="w-full px-2.5 py-1.5 rounded-xl bg-black/40 border border-white/10 text-xs text-zinc-200 placeholder-white/30 focus:outline-none"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Communication & Listening Styles */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-white/10">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-purple-300 uppercase tracking-wider">
                  3. Primary Communication Style
                </label>
                <select
                  value={communicationStyle}
                  onChange={e => setCommunicationStyle(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-[#141721] border border-white/10 text-xs text-white focus:outline-none"
                >
                  <option value="direct">Direct & Candid (Values Clarity)</option>
                  <option value="empathetic">Empathetic & Gentle (Values Emotional Safety)</option>
                  <option value="collaborative">Collaborative & Exploratory (Co-Solving)</option>
                  <option value="analytical">Analytical & Structured (Fact-Oriented)</option>
                  <option value="expressive">Expressive & Enthusiastic (Animated)</option>
                </select>
                <textarea
                  value={communicationNotes}
                  onChange={e => setCommunicationNotes(e.target.value)}
                  placeholder="How do you express care, give feedback, or ask for space?"
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-zinc-200 placeholder-white/30 focus:outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-purple-300 uppercase tracking-wider">
                  4. Listening & Attunement Style
                </label>
                <select
                  value={listeningStyle}
                  onChange={e => setListeningStyle(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-[#141721] border border-white/10 text-xs text-white focus:outline-none"
                >
                  <option value="reflective">Reflective (Mirroring & Validating)</option>
                  <option value="empathetic">Empathetic (Holding Emotional Space)</option>
                  <option value="active">Active Listening (Undivided Attentive Focus)</option>
                  <option value="solution_oriented">Solution-Oriented (Action Steps)</option>
                </select>

                <select
                  value={attachmentAwareness}
                  onChange={e => setAttachmentAwareness(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-[#141721] border border-white/10 text-xs text-white focus:outline-none mt-2"
                >
                  <option value="secure_leaning">Secure Base (Values Closeness & Autonomy)</option>
                  <option value="anxious_attuned">Attuned / Connection-Oriented (Values Reassurance)</option>
                  <option value="avoidant_autonomous">Autonomous / Self-Reliant (Values Space)</option>
                  <option value="exploring_growth">Exploring & Growing Relational Security</option>
                </select>
              </div>
            </div>

            {/* Emotional Boundaries & Conflict Management */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-white/10">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-purple-300 uppercase tracking-wider">
                  5. Emotional Boundaries
                </label>
                <textarea
                  value={boundariesText}
                  onChange={e => setBoundariesText(e.target.value)}
                  placeholder="Where do your emotional responsibilities begin and end? What boundaries keep you healthy?"
                  rows={3}
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-zinc-200 placeholder-white/30 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-purple-300 uppercase tracking-wider">
                  6. Conflict De-escalation Ritual
                </label>
                <textarea
                  value={conflictStyleText}
                  onChange={e => setConflictStyleText(e.target.value)}
                  placeholder="When tension arises, what is your de-escalation ritual? (e.g. 10-minute pause, then gentle repair)"
                  rows={3}
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-zinc-200 placeholder-white/30 focus:outline-none"
                />
              </div>
            </div>

          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 3: GUIDED INTROSPECTION & REFLECTION JOURNEYS                    */}
      {/* =================================================================== */}
      {activeTab === 'exercises' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {exercises.map(ex => {
              const dMeta = DOMAIN_METADATA[ex.domain];
              const isCurrent = activeExercise?.id === ex.id;
              const hasCompleted = pastResponses.some(r => r.exercise_id === ex.id);

              return (
                <div
                  key={ex.id}
                  className={`p-5 rounded-3xl dark-glass border transition-all flex flex-col justify-between space-y-3 ${
                    isCurrent
                      ? 'border-purple-400 bg-purple-950/20 shadow-xl'
                      : 'border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-zinc-400 flex items-center gap-1 font-mono">
                        <span>{dMeta.icon}</span>
                        <span>{dMeta.label}</span>
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-white/10 text-zinc-300">
                        {ex.estimated_minutes} mins
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-white font-serif">{ex.title}</h4>
                    <p className="text-xs text-zinc-300 leading-relaxed line-clamp-3">{ex.subtitle}</p>
                  </div>

                  <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                    {hasCompleted ? (
                      <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                        <Check className="w-3 h-3" /> Completed
                      </span>
                    ) : (
                      <span className="text-[10px] text-zinc-500 font-mono">Uncompleted</span>
                    )}

                    <button
                      onClick={() => {
                        setActiveExercise(ex);
                        setExerciseAnswers({});
                        setPersonalTakeaway('');
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 border border-purple-500/40 text-xs font-bold cursor-pointer transition-all"
                    >
                      {hasCompleted ? 'Re-visit Journey' : 'Start Journey'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Active Exercise Interactive Form */}
          {activeExercise && (
            <div className="p-6 rounded-3xl dark-glass border border-purple-500/40 shadow-2xl space-y-5 animate-in fade-in">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div>
                  <h3 className="text-base font-bold text-white font-serif flex items-center gap-2">
                    <span>{activeExercise.title}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-mono">
                      Self-Guided Reflection
                    </span>
                  </h3>
                  <p className="text-xs text-zinc-400 mt-0.5">{activeExercise.subtitle}</p>
                </div>
                <button onClick={() => setActiveExercise(null)} className="text-zinc-400 hover:text-white p-1">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSubmitExercise} className="space-y-4 text-xs">
                {activeExercise.prompts.map((prompt, idx) => (
                  <div key={prompt.id} className="p-4 rounded-2xl dark-glass border border-white/5 space-y-2">
                    <label className="block text-xs font-bold text-white">
                      {idx + 1}. {prompt.prompt_text}
                    </label>
                    {prompt.helper_text && (
                      <p className="text-[11px] text-zinc-400 italic">{prompt.helper_text}</p>
                    )}
                    <textarea
                      value={exerciseAnswers[prompt.id] || ''}
                      onChange={e => setExerciseAnswers(prev => ({ ...prev, [prompt.id]: e.target.value }))}
                      placeholder="Type your reflection in your own words..."
                      rows={3}
                      required
                      className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-zinc-200 placeholder-white/30 focus:outline-none focus:border-white/30"
                    />
                  </div>
                ))}

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-purple-300">
                    Personal Takeaway / Core Insight
                  </label>
                  <input
                    type="text"
                    value={personalTakeaway}
                    onChange={e => setPersonalTakeaway(e.target.value)}
                    placeholder="One sentence that summarizes what you discovered about yourself today"
                    className="w-full px-3 py-2 rounded-xl dark-glass border border-white/10 text-xs text-white placeholder-white/30 focus:outline-none"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setActiveExercise(null)}
                    className="px-4 py-2 rounded-xl dark-glass text-zinc-400 hover:text-white cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 font-bold text-white shadow-lg cursor-pointer"
                  >
                    Save to Private Journal
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 4: PERCEPTION MIRROR (SELF VS COMPANION WITNESSED TRAITS)       */}
      {/* =================================================================== */}
      {activeTab === 'mirror' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl dark-glass border border-white/10 shadow-2xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
              <div>
                <h2 className="text-base font-bold text-white font-serif">Perception Mirror</h2>
                <p className="text-xs text-zinc-400">
                  Compare how you describe your own traits versus voluntary, compassionate perspectives witnessed by close companions.
                </p>
              </div>

              <button
                onClick={() => setIsFeedbackModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 border border-purple-500/40 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Simulate Companion Reflection</span>
              </button>
            </div>

            {/* Comparison Side-by-Side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Left: How I See Myself */}
              <div className="p-5 rounded-2xl dark-glass border border-white/10 space-y-4">
                <span className="text-xs font-bold text-purple-300 uppercase tracking-wider block">
                  Self-Declared Compassion & Values
                </span>
                
                <div className="space-y-2">
                  <span className="text-[11px] text-zinc-400 block font-mono">Core Values Chosen:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedValues.map(v => (
                      <span key={v} className="px-2.5 py-1 rounded-full text-xs font-medium bg-purple-600/20 text-purple-300 border border-purple-500/30 capitalize">
                        {v}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] text-zinc-400 block font-mono">Communication Style:</span>
                  <p className="text-xs text-white capitalize font-semibold">{communicationStyle}</p>
                  {communicationNotes && (
                    <p className="text-[11px] text-zinc-300 italic">"{communicationNotes}"</p>
                  )}
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] text-zinc-400 block font-mono">Attachment Awareness:</span>
                  <p className="text-xs text-white capitalize font-semibold">{attachmentAwareness.replace('_', ' ')}</p>
                </div>
              </div>

              {/* Right: What Companions Witness */}
              <div className="p-5 rounded-2xl dark-glass border border-white/10 space-y-4">
                <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider block">
                  Voluntary Companion Reflections ({feedbacks.length})
                </span>

                {feedbacks.length > 0 ? (
                  <div className="space-y-3">
                    {feedbacks.map(fb => (
                      <div key={fb.id} className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-white">{fb.author_name}</span>
                          <span className="text-amber-400 font-mono text-[10px]">
                            {'★'.repeat(fb.warmth_resonance_rating)}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-200 italic leading-relaxed">
                          "{fb.communication_impression}"
                        </p>
                        {fb.strengths_observed && fb.strengths_observed.length > 0 && (
                          <div className="flex flex-wrap gap-1 pt-1">
                            {fb.strengths_observed.map((s, idx) => (
                              <span key={idx} className="px-2 py-0.5 rounded-full text-[9px] bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                                🌟 {s}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 rounded-xl border border-dashed border-white/10 text-center text-xs text-zinc-400">
                    No companion reflections submitted yet. Invite a trusted friend to share their impression!
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 5: TRAIT EVOLUTION & GROWTH TIMELINE                            */}
      {/* =================================================================== */}
      {activeTab === 'timeline' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl dark-glass border border-white/10 shadow-2xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
              <div>
                <h2 className="text-base font-bold text-white font-serif">Growth & Trait Evolution Timeline</h2>
                <p className="text-xs text-zinc-400">
                  Track how your emotional boundaries, communication styles, and values transform across life chapters.
                </p>
              </div>

              <button
                onClick={() => setIsSnapshotModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 border border-purple-500/40 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Record New Growth Milestone</span>
              </button>
            </div>

            {/* Timeline Axis */}
            {snapshots.length > 0 ? (
              <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-px before:bg-white/10">
                {snapshots.map((snap, idx) => (
                  <div key={snap.id || idx} className="relative group">
                    <span className="absolute -left-6 top-1.5 w-3 h-3 rounded-full bg-purple-400 ring-4 ring-[#090A0E] shadow-[0_0_10px_rgba(168,85,247,0.8)]" />
                    
                    <div className="p-4 rounded-2xl dark-glass border border-white/10 space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs sm:text-sm font-bold text-white">{snap.snapshot_label}</h4>
                        <span className="text-[10px] text-zinc-400 font-mono">
                          {new Date(snap.recorded_at).toLocaleDateString()}
                        </span>
                      </div>

                      {snap.growth_reflections && (
                        <p className="text-xs text-zinc-300 leading-relaxed italic">
                          "{snap.growth_reflections}"
                        </p>
                      )}

                      {snap.core_values && snap.core_values.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {snap.core_values.map(val => (
                            <span key={val} className="px-2 py-0.5 rounded-full text-[9px] bg-purple-500/10 text-purple-300 border border-purple-500/20 capitalize">
                              {val}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 rounded-2xl dark-glass border border-dashed border-white/10 text-center text-xs text-zinc-400">
                No growth milestones recorded yet. Create a snapshot to begin tracking your evolution!
              </div>
            )}
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 6: TRANSPARENT COMPATIBILITY & RESONANCE MIRROR                 */}
      {/* =================================================================== */}
      {activeTab === 'compatibility' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl dark-glass border border-white/10 shadow-2xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
              <div>
                <h2 className="text-base font-bold text-white font-serif">Explainable Resonance Mirror</h2>
                <p className="text-xs text-zinc-400">
                  Compare values, communication harmony, and relational safety with a companion without mystical algorithms.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={partnerUserId}
                  onChange={e => setPartnerUserId(e.target.value)}
                  placeholder="Partner User ID"
                  className="px-3 py-1.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white focus:outline-none w-36"
                />
                <button
                  onClick={handleLoadCompatibility}
                  disabled={isLoadingReport}
                  className="px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md cursor-pointer"
                >
                  {isLoadingReport ? 'Calculating...' : 'Compare'}
                </button>
              </div>
            </div>

            {compatibilityReport && (
              <div className="space-y-5 animate-in fade-in">
                {/* Score Header */}
                <div className="p-5 rounded-2xl bg-gradient-to-r from-purple-900/30 via-indigo-900/20 to-slate-900 border border-purple-500/30 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-purple-300">
                      Overall Explainable Resonance
                    </span>
                    <h3 className="text-2xl font-black text-white mt-0.5">
                      {compatibilityReport.overall_score}% Resonance
                    </h3>
                  </div>
                  <div className="w-12 h-12 rounded-full border-2 border-purple-400 flex items-center justify-center font-bold text-white">
                    {compatibilityReport.overall_score}
                  </div>
                </div>

                {/* Values Overlap Venn Breakdown */}
                <div className="p-4 rounded-2xl dark-glass border border-white/5 space-y-2.5">
                  <span className="text-xs font-bold text-purple-300 uppercase tracking-wider block">
                    Shared Core Values ({compatibilityReport.shared_values.overlapping.length} in common)
                  </span>
                  
                  <div className="flex flex-wrap gap-2">
                    {compatibilityReport.shared_values.overlapping.map(v => (
                      <span key={v} className="px-3 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold capitalize flex items-center gap-1">
                        <span>✨</span>
                        <span>{v}</span>
                      </span>
                    ))}
                    {compatibilityReport.shared_values.user_unique.map(v => (
                      <span key={v} className="px-2.5 py-1 rounded-xl bg-white/5 text-zinc-400 border border-white/10 text-xs capitalize">
                        You: {v}
                      </span>
                    ))}
                    {compatibilityReport.shared_values.partner_unique.map(v => (
                      <span key={v} className="px-2.5 py-1 rounded-xl bg-white/5 text-zinc-400 border border-white/10 text-xs capitalize">
                        Them: {v}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Communication & Attachment Synergy */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl dark-glass border border-white/5 space-y-1.5">
                    <span className="text-xs font-bold text-white block">Communication Dynamics</span>
                    <p className="text-xs text-zinc-300 leading-relaxed">
                      {compatibilityReport.communication_synergy.complementarity_notes}
                    </p>
                    <p className="text-[11px] text-zinc-400 italic pt-1">
                      {compatibilityReport.communication_synergy.listening_harmony}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl dark-glass border border-white/5 space-y-1.5">
                    <span className="text-xs font-bold text-white block">Attachment & Safety Dynamics</span>
                    <p className="text-xs text-zinc-300 leading-relaxed">
                      {compatibilityReport.attachment_dynamic.relational_safety_notes}
                    </p>
                    <p className="text-[11px] text-zinc-400 italic pt-1">
                      Growth Opportunity: {compatibilityReport.attachment_dynamic.growth_opportunities}
                    </p>
                  </div>
                </div>

                {/* Dimensional Breakdown */}
                <div className="space-y-2 pt-2">
                  <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">
                    Dimensional Spectrum Comparison
                  </span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {compatibilityReport.dimensional_resonance.map(dim => (
                      <div key={dim.dimension_key} className="p-3 rounded-xl dark-glass border border-white/5 space-y-1 text-xs">
                        <div className="flex justify-between font-bold text-white">
                          <span>{dim.dimension_title}</span>
                          <span className="text-zinc-400 font-mono text-[10px]">Diff: {dim.difference}%</span>
                        </div>
                        <p className="text-[11px] text-zinc-300">{dim.explanation}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Mandatory Non-Diagnostic Disclaimer */}
                <div className="p-3 rounded-xl bg-purple-950/20 border border-purple-500/20 text-[11px] text-purple-200">
                  {compatibilityReport.ethical_caveat}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL 1: RECORD GROWTH SNAPSHOT                                     */}
      {/* =================================================================== */}
      {isSnapshotModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md dark-glass border border-white/10 rounded-3xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-sm font-bold text-white font-serif">Record Growth Milestone</h3>
              <button onClick={() => setIsSnapshotModalOpen(false)} className="text-zinc-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSnapshot} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-zinc-400 mb-1">Milestone Label *</label>
                <input
                  type="text"
                  value={snapshotLabel}
                  onChange={e => setSnapshotLabel(e.target.value)}
                  placeholder="e.g. Six Months Later, After Relocating, Chapter 3"
                  required
                  className="w-full px-3 py-2 rounded-xl dark-glass border border-white/10 text-white placeholder-white/30 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-400 mb-1">Growth Reflections</label>
                <textarea
                  value={growthReflections}
                  onChange={e => setGrowthReflections(e.target.value)}
                  placeholder="How have your boundaries, emotional responses, or priorities shifted recently?"
                  rows={3}
                  className="w-full px-3 py-2 rounded-xl dark-glass border border-white/10 text-white placeholder-white/30 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsSnapshotModalOpen(false)}
                  className="px-4 py-2 rounded-xl dark-glass text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 font-bold text-white shadow-md cursor-pointer"
                >
                  Save Milestone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Floating In-App Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-2xl bg-zinc-900/95 border border-white/20 text-xs text-white shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-bottom-3 flex items-center gap-2">
          <span>{toastMessage}</span>
        </div>
      )}

    </div>
  );
};
