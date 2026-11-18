import React, { useState } from 'react';
import { 
  Layers, 
  Type, 
  Grid, 
  MousePointer, 
  Heart, 
  MessageCircle, 
  ShieldCheck, 
  HelpCircle, 
  User, 
  Image as ImageIcon,
  MoreVertical,
  CheckCircle2,
  Trash2,
  Share2,
  Check,
  RefreshCw,
  Eye,
  BookOpen,
  ExternalLink,
  Sliders
} from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Navigation,
  NavigationItem,
  Tabs,
  TabList,
  Tab,
  TabPanel,
  ProfileHeader,
  IdentitySelector,
  Timeline,
  FormField,
  Input,
  Textarea,
  Select,
  Switch,
  Dialog,
  ConfirmDialog,
  Drawer,
  useToast,
  Dropdown,
  DropdownItem,
  DropdownDivider,
  SearchInput,
  FilterGroup,
  MediaViewer,
  QuestionInterface,
  ChatBubble,
  ChatComposer,
  EmptyState,
  Skeleton,
  ErrorState
} from './index';

export const DesignSystemShowcase: React.FC = () => {
  const toast = useToast();

  // State controls for interactive testing
  const [activeTab, setActiveTab] = useState('components');
  const [activeNav, setActiveNav] = useState('home');
  const [searchVal, setSearchVal] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedIdentity, setSelectedIdentity] = useState('id_real');
  const [switchChecked, setSwitchChecked] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isMediaViewerOpen, setIsMediaViewerOpen] = useState(false);
  const [formText, setFormText] = useState('');
  const [formError, setFormError] = useState('');

  // Typographic Studio State & 8 Distinctive Fonts
  const [customSampleText, setCustomSampleText] = useState('Soulverse — The Sanctuary for Human Resonance & Multi-Dimensional Connection');
  const [activeHeadingFontName, setActiveHeadingFontName] = useState('Bricolage Grotesque');
  const [activeBodyFontName, setActiveBodyFontName] = useState('Instrument Sans');
  const [activeHeroFontName, setActiveHeroFontName] = useState('Syne');

  const DISTINCTIVE_FONTS = [
    {
      id: 'bricolage',
      name: 'Bricolage Grotesque',
      provider: 'Google Fonts',
      cssVar: "'Bricolage Grotesque', sans-serif",
      className: 'font-bricolage',
      favorite: true,
      recommendedRole: 'Brand and headings',
      tagline: 'Distinctive letterforms, expressive shapes, contemporary editorial feel.',
      specimen: 'Soulverse · Contemporary Editorial Resonance',
      weights: '300, 400, 600, 700, 800',
      sourceUrl: 'https://fonts.google.com/specimen/Bricolage+Grotesque'
    },
    {
      id: 'instrument',
      name: 'Instrument Sans',
      provider: 'Google Fonts',
      cssVar: "'Instrument Sans', sans-serif",
      className: 'font-instrument',
      favorite: false,
      recommendedRole: 'Main application UI, chat and long reading',
      tagline: 'Quiet luxury. Clean, unusual proportions, sophisticated.',
      specimen: 'Quiet luxury and supreme legibility across thousands of messages and stories.',
      weights: '400, 500, 600, 700',
      sourceUrl: 'https://fonts.google.com/specimen/Instrument+Sans'
    },
    {
      id: 'syne',
      name: 'Syne',
      provider: 'Google Fonts',
      cssVar: "'Syne', sans-serif",
      className: 'font-syne',
      favorite: false,
      recommendedRole: 'Large promotional titles & hero accents',
      tagline: 'Artistic, bold, unconventional. Strong brand personality.',
      specimen: 'ARTISTIC, BOLD & UNCONVENTIONAL VISION',
      weights: '400, 600, 700, 800',
      sourceUrl: 'https://fonts.google.com/specimen/Syne'
    },
    {
      id: 'space_grotesk',
      name: 'Space Grotesk',
      provider: 'Google Fonts',
      cssVar: "'Space Grotesk', sans-serif",
      className: 'font-space-grotesk',
      favorite: false,
      recommendedRole: 'Futuristic technical headings & timeline accents',
      tagline: 'Futuristic without looking like a gaming interface.',
      specimen: 'Multi-Dimensional Timelines & Quantum Reality Nodes',
      weights: '300, 400, 500, 600, 700',
      sourceUrl: 'https://fonts.google.com/specimen/Space+Grotesk'
    },
    {
      id: 'general_sans',
      name: 'General Sans',
      provider: 'Fontshare',
      cssVar: "'General Sans', sans-serif",
      className: 'font-general-sans',
      favorite: false,
      recommendedRole: 'Premium restrained UI & profile metrics',
      tagline: 'Premium, restrained, beautifully balanced.',
      specimen: 'Effortlessly balanced geometry for high-trust relational spaces.',
      weights: '400, 500, 600, 700',
      sourceUrl: 'https://www.fontshare.com/fonts/general-sans'
    },
    {
      id: 'clash_display',
      name: 'Clash Display',
      provider: 'Fontshare',
      cssVar: "'Clash Display', sans-serif",
      className: 'font-clash-display',
      favorite: false,
      recommendedRole: 'High-fashion editorial headings',
      tagline: 'Strong, memorable, fashion-brand-like headings.',
      specimen: 'MEMORABLE AVANT-GARDE EDITORIAL COVER',
      weights: '400, 500, 600, 700',
      sourceUrl: 'https://www.fontshare.com/fonts/clash-display'
    },
    {
      id: 'switzer',
      name: 'Switzer',
      provider: 'Fontshare',
      cssVar: "'Switzer', sans-serif",
      className: 'font-switzer',
      favorite: false,
      recommendedRole: 'Swiss-minimalist control panels & settings',
      tagline: 'Swiss-inspired minimalism. Very polished for interfaces.',
      specimen: 'Precision-crafted geometric purity for modern interaction.',
      weights: '400, 500, 600, 700',
      sourceUrl: 'https://www.fontshare.com/fonts/switzer'
    },
    {
      id: 'figtree',
      name: 'Figtree',
      provider: 'Google Fonts',
      cssVar: "'Figtree', sans-serif",
      className: 'font-figtree',
      favorite: false,
      recommendedRole: 'Warm humanist conversation & gentle prompts',
      tagline: 'Soft, modern, friendly and comfortable for long conversations.',
      specimen: 'Gentle, comforting warmth for vulnerable confessions and reflection.',
      weights: '300, 400, 500, 600, 700, 800',
      sourceUrl: 'https://fonts.google.com/specimen/Figtree'
    }
  ];

  const applyHeadingFont = (fontName: string, cssFontFamily: string) => {
    document.documentElement.style.setProperty('--font-heading', cssFontFamily);
    setActiveHeadingFontName(fontName);
    toast.info(`Applied ${fontName} to Headings & Brand!`);
  };

  const applyBodyFont = (fontName: string, cssFontFamily: string) => {
    document.documentElement.style.setProperty('--font-body', cssFontFamily);
    setActiveBodyFontName(fontName);
    toast.info(`Applied ${fontName} to UI & Chat Body!`);
  };

  const applyHeroFont = (fontName: string, cssFontFamily: string) => {
    document.documentElement.style.setProperty('--font-display', cssFontFamily);
    document.documentElement.style.setProperty('--font-promo', cssFontFamily);
    setActiveHeroFontName(fontName);
    toast.info(`Applied ${fontName} to Hero Promotional Titles!`);
  };

  const resetToCuratedEditorialTriad = () => {
    document.documentElement.style.setProperty('--font-heading', "'Bricolage Grotesque', sans-serif");
    document.documentElement.style.setProperty('--font-body', "'Instrument Sans', sans-serif");
    document.documentElement.style.setProperty('--font-display', "'Syne', sans-serif");
    document.documentElement.style.setProperty('--font-promo', "'Syne', sans-serif");
    setActiveHeadingFontName('Bricolage Grotesque');
    setActiveBodyFontName('Instrument Sans');
    setActiveHeroFontName('Syne');
    toast.success('Reset to Curated Editorial Triad: Bricolage + Instrument + Syne!');
  };

  // Sample data
  const sampleIdentities = [
    { id: 'id_real', name: 'Kavindu', type: 'real' as const, tagline: 'Architecture & Visual Arts' },
    { id: 'id_story', name: 'Aetherian Wanderer', type: 'imaginary' as const, tagline: 'Post-apocalyptic Archivist' },
    { id: 'id_inner', name: 'Midnight Reflections', type: 'inner' as const, tagline: 'Private Introspection Sanctuary' }
  ];

  const sampleTimelineEvents = [
    {
      id: 'evt_1',
      year: 2026,
      date: 'November 14',
      title: 'Initiated Soulverse Deep Connection Sanctuary',
      description: 'Architected the multi-dimensional identity framework and relationship memory vaults.',
      emotion: 'Deeply Inspired',
      tags: ['Milestone', 'Architecture', 'Soulverse']
    },
    {
      id: 'evt_2',
      year: 2025,
      date: 'April 20',
      title: 'Solo Astrophotography Expedition',
      description: 'Spent three nights under the high altitude skies photographing the Core of the Milky Way.',
      emotion: 'Awe & Solitude',
      tags: ['Space', 'Photography']
    }
  ];

  const sampleQuestion = {
    id: 'q_demo_01',
    category: 'Relational Vulnerability',
    depth: 'deep' as const,
    questionText: 'What is a personal boundary that you only learned to set after someone quietly crossed it?',
    context: 'Reflects emotional boundaries and healthy self-advocacy in close connections.'
  };

  const sampleMessage = {
    id: 'msg_demo_01',
    senderName: 'Tara',
    isOutgoing: false,
    text: 'I loved how you described your perspective on identity. Most dating apps force people into flat resumes, but having separate reality dimensions makes so much sense.',
    timestamp: '10:42 PM',
    status: 'read' as const,
    reactions: [{ emoji: '❤️', count: 2, userReacted: true }]
  };

  const handleFormValidate = (val: string) => {
    setFormText(val);
    if (val.length < 5) {
      setFormError('Reflection must contain at least 5 characters');
    } else {
      setFormError('');
    }
  };

  return (
    <div className="min-h-screen py-8 sm:py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10 text-zinc-100">
      {/* 1. Header & Vision Statement */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_12px_#F59E0B]" />
          <span className="text-xs font-mono uppercase tracking-widest text-amber-400 font-bold">
            Master Prompt 09 Directive
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-heading font-extrabold text-white tracking-tight">
          Soulverse Design System & Component Engineering
        </h1>
        <p className="text-sm sm:text-base text-zinc-400 max-w-3xl leading-relaxed">
          A mature, spacious, obsidian & titanium glass visual language engineered for emotional safety, accessibility, and high intentionality.
        </p>
      </div>

      {/* 2. Primary Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} variant="pills">
        <TabList ariaLabel="Design System Sections">
          <Tab value="components" icon={<Layers className="w-4 h-4" />}>
            Components Gallery (16 Types)
          </Tab>
          <Tab value="typography" icon={<Type className="w-4 h-4" />}>
            Typography & Scale
          </Tab>
          <Tab value="feedback" icon={<Heart className="w-4 h-4 fill-rose-500/20" />}>
            Feedback & States
          </Tab>
        </TabList>

        {/* =================================================================== */}
        {/* TAB 1: ALL 16 COMPONENT TYPES                                       */}
        {/* =================================================================== */}
        <TabPanel value="components" className="space-y-10 pt-4">
          {/* A. Profile Header & Identity Selector */}
          <section className="space-y-4">
            <h2 className="text-sm font-mono uppercase tracking-wider text-zinc-400 font-bold">
              01 & 02. Profile Header & Multi-Dimensional Identity Selector
            </h2>
            <IdentitySelector
              identities={sampleIdentities}
              activeId={selectedIdentity}
              onSelectIdentity={(id) => {
                setSelectedIdentity(id);
                toast.info(`Switched to identity dimension: ${id}`);
              }}
            />
            <ProfileHeader
              name="Kavindu Thamaranga"
              handle="kavindu_art"
              avatarUrl="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80"
              coverImageUrl="https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1600&q=80"
              bio="Architect, photographer, and philosophical explorer. Building sanctuaries for genuine connection over superficial swiping."
              location="Colombo & Kandy, Sri Lanka"
              isVerified={true}
              isOnline={true}
              identityDimension="Real Life Sanctuary"
              intention="Deep Friendship & Shared Meaning"
              onMessageClick={() => toast.success('Initiated connection flow with Kavindu!')}
              onShareClick={() => toast.info('Profile link copied to clipboard')}
              onMoreClick={() => setIsDialogOpen(true)}
            />
          </section>

          {/* B. Navigation & Search & Filters */}
          <section className="space-y-4">
            <h2 className="text-sm font-mono uppercase tracking-wider text-zinc-400 font-bold">
              03, 04 & 05. Navigation, Search & Filter Bar
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SearchInput
                value={searchVal}
                onValueChange={setSearchVal}
                placeholder="Search memories, quotes, connections..."
                shortcutHint="/"
              />
              <FilterGroup
                options={[
                  { id: 'all', label: 'All Circles', count: 12 },
                  { id: 'matches', label: 'Mutual Chemistry', count: 4 },
                  { id: 'lounges', label: 'Active Lounges', count: 3 },
                  { id: 'saved', label: 'Saved Vault', count: 8 }
                ]}
                selectedId={selectedFilter}
                onSelect={(id) => {
                  setSelectedFilter(id);
                  toast.info(`Filtered view by: ${id}`);
                }}
              />
            </div>
            <Navigation ariaLabel="Showcase navigation bar">
              <NavigationItem
                id="nav_discover"
                label="Discover Humans"
                icon={<User className="w-4 h-4" />}
                badge="12"
                badgeVariant="gold"
                isActive={activeNav === 'home'}
                onClick={() => setActiveNav('home')}
              />
              <NavigationItem
                id="nav_messages"
                label="Mindful Messages"
                icon={<MessageCircle className="w-4 h-4" />}
                badge="3"
                badgeVariant="emerald"
                isActive={activeNav === 'messages'}
                onClick={() => setActiveNav('messages')}
              />
              <NavigationItem
                id="nav_lounges"
                label="Shared Lounges"
                icon={<Heart className="w-4 h-4" />}
                isActive={activeNav === 'lounges'}
                onClick={() => setActiveNav('lounges')}
              />
            </Navigation>
          </section>

          {/* C. Question Interface & Introspection */}
          <section className="space-y-4">
            <h2 className="text-sm font-mono uppercase tracking-wider text-zinc-400 font-bold">
              06. Question Interface (Introspection Sanctuary)
            </h2>
            <QuestionInterface
              question={sampleQuestion}
              onAnswerSubmit={(text, isPriv) => {
                toast.success(`Saved ${isPriv ? 'private' : 'shared'} reflection: "${text.slice(0, 30)}..."`);
              }}
              onSkip={() => toast.info('Question skipped')}
            />
          </section>

          {/* D. Chat Bubble & Chat Composer */}
          <section className="space-y-4">
            <h2 className="text-sm font-mono uppercase tracking-wider text-zinc-400 font-bold">
              07. Chat Interface (Mindful Messaging)
            </h2>
            <div className="p-5 rounded-3xl bg-[#090A0E] border border-white/10 space-y-4">
              <ChatBubble
                message={sampleMessage}
                onReactionClick={(emoji) => toast.info(`Toggled reaction: ${emoji}`)}
                onMediaClick={() => setIsMediaViewerOpen(true)}
              />
              <ChatComposer
                onSendMessage={(txt) => {
                  toast.success(`Dispatched message: "${txt}"`);
                }}
                onAttachClick={() => toast.info('Attachment picker opened')}
                placeholder="Type a mindful message..."
              />
            </div>
          </section>

          {/* E. Cards, Forms & Interactive Overlays */}
          <section className="space-y-4">
            <h2 className="text-sm font-mono uppercase tracking-wider text-zinc-400 font-bold">
              08 & 09. Forms with Validation & Interactive Dialogs
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card variant="glass" padding="standard" className="space-y-4">
                <CardHeader>
                  <CardTitle>Validation & Accessible Inputs</CardTitle>
                  <CardDescription>
                    All form fields feature strict ARIA semantics, error states, and high-contrast rings.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField label="Personal Core Value" error={formError} required>
                    {(id, isInvalid) => (
                      <Input
                        id={id}
                        error={isInvalid}
                        value={formText}
                        onChange={(e) => handleFormValidate(e.target.value)}
                        placeholder="e.g. Radical Authenticity & Compassion"
                      />
                    )}
                  </FormField>

                  <Switch
                    checked={switchChecked}
                    onChange={setSwitchChecked}
                    label="Active Presence Visibility"
                    description="Allow mutual matches to observe when your sanctuary is online."
                  />
                </CardContent>
                <CardFooter>
                  <Dropdown
                    trigger={
                      <button className="h-9 px-3 rounded-xl bg-white/[0.08] hover:bg-white/15 text-xs text-zinc-200 font-semibold flex items-center gap-1.5 cursor-pointer">
                        <span>Options</span>
                        <MoreVertical className="w-3.5 h-3.5" />
                      </button>
                    }
                  >
                    <DropdownItem label="Edit Sanctuary" onClick={() => toast.info('Edit triggered')} />
                    <DropdownItem label="Export Memories" onClick={() => toast.info('Export triggered')} />
                    <DropdownDivider />
                    <DropdownItem
                      label="Delete Chapter"
                      destructive
                      onClick={() => setIsConfirmOpen(true)}
                    />
                  </Dropdown>

                  <button
                    onClick={() => setIsDrawerOpen(true)}
                    className="h-9 px-4 rounded-xl bg-white/[0.08] hover:bg-white/15 text-xs text-white font-semibold transition-colors cursor-pointer"
                  >
                    Open Drawer
                  </button>
                </CardFooter>
              </Card>

              {/* F. Timeline Component */}
              <Card variant="glass" padding="standard" className="space-y-4">
                <CardHeader>
                  <CardTitle>Chronological Life Timeline</CardTitle>
                  <CardDescription>
                    Life chapters, milestones, emotional memories, and privacy chips.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Timeline events={sampleTimelineEvents} />
                </CardContent>
              </Card>
            </div>
          </section>
        </TabPanel>

        {/* =================================================================== */}
        {/* TAB 2: TYPOGRAPHY HIERARCHY & CONTRAST                             */}
        {/* =================================================================== */}
        <TabPanel value="typography" className="space-y-8 pt-4">
          
          {/* A. ACTIVE DESIGN DIRECTION HERO BANNER */}
          <div className="p-6 sm:p-8 rounded-3xl dark-glass border border-white/15 bg-gradient-to-r from-rose-500/10 via-purple-500/10 to-indigo-500/10 relative overflow-hidden shadow-2xl space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-[11px] font-mono uppercase tracking-wider text-white">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Active Typographic Personality Architecture</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-white">
                  The Soulverse Editorial Triad
                </h2>
                <p className="text-xs sm:text-sm text-zinc-300 max-w-2xl leading-relaxed">
                  Moving beyond generic startup typography into a distinctive, editorial visual language inspired by premium publications. High character on titles, quiet luxury and effortless readability on conversations.
                </p>
              </div>

              <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
                <button
                  onClick={resetToCuratedEditorialTriad}
                  className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-semibold text-white transition-all flex items-center gap-2 cursor-pointer shadow-lg"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Reset to Curated Triad</span>
                </button>
              </div>
            </div>

            {/* Current Active Font Allocation Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-rose-300 font-bold block">
                  Brand & Headings
                </span>
                <p className="text-lg font-heading font-extrabold text-white">
                  {activeHeadingFontName}
                </p>
                <p className="text-xs text-zinc-400">
                  Distinctive letterforms, expressive shapes, contemporary editorial feel.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-sky-300 font-bold block">
                  Main UI, Chat & Long Reading
                </span>
                <p className="text-lg font-body font-bold text-white">
                  {activeBodyFontName}
                </p>
                <p className="text-xs text-zinc-400">
                  Quiet luxury. Clean, unusual proportions, sophisticated legibility without fatigue.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-purple-300 font-bold block">
                  Large Promotional Titles
                </span>
                <p className="text-lg font-syne font-bold text-white">
                  {activeHeroFontName}
                </p>
                <p className="text-xs text-zinc-400">
                  Artistic, bold, unconventional. Strong editorial brand personality.
                </p>
              </div>
            </div>
          </div>

          {/* B. INTERACTIVE LIVE SPECIMEN EXPLORER (ALL 8 DISTINCTIVE FONTS) */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-xl font-heading font-bold text-white flex items-center gap-2">
                  <Type className="w-5 h-5 text-rose-400" />
                  <span>8 Distinctive Fonts Worth Trying</span>
                </h3>
                <p className="text-xs text-zinc-400">
                  More distinctive than generic sans-serifs, without compromising reading comfort. Click any font action to preview in real-time.
                </p>
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] font-mono text-zinc-500 uppercase">Presets:</span>
                <button
                  onClick={() => setCustomSampleText('Soulverse — The Sanctuary for Human Resonance & Multi-Dimensional Connection')}
                  className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] text-zinc-300 transition-colors"
                >
                  Sanctuary
                </button>
                <button
                  onClick={() => setCustomSampleText('Hey Kavindu! Saw you are deep into indie game architecture. Outer Wilds changed how I view storytelling.')}
                  className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] text-zinc-300 transition-colors"
                >
                  Chat Message
                </button>
                <button
                  onClick={() => setCustomSampleText('0123456789 • ABCDEFGHIJKLMNOPQRSTUVWXYZ • abcdefghijklmnopqrstuvwxyz')}
                  className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] text-zinc-300 transition-colors"
                >
                  Characters
                </button>
              </div>
            </div>

            {/* Custom Live Testing Input */}
            <div className="p-3 rounded-2xl dark-glass border border-white/10 flex items-center gap-3">
              <span className="text-xs font-mono text-zinc-400 shrink-0">Sample Text:</span>
              <input
                type="text"
                value={customSampleText}
                onChange={(e) => setCustomSampleText(e.target.value)}
                placeholder="Type your own sentence here to test across all 8 fonts..."
                className="flex-1 bg-transparent border-0 text-sm text-white placeholder-zinc-500 focus:outline-none"
              />
              {customSampleText && (
                <button
                  onClick={() => setCustomSampleText('')}
                  className="text-xs text-zinc-400 hover:text-white px-2 py-1 rounded-lg bg-white/5"
                >
                  Clear
                </button>
              )}
            </div>

            {/* 8 Fonts Specimen Cards Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {DISTINCTIVE_FONTS.map((font) => {
                const isHeadingActive = activeHeadingFontName === font.name;
                const isBodyActive = activeBodyFontName === font.name;
                const isHeroActive = activeHeroFontName === font.name;

                return (
                  <div 
                    key={font.id}
                    className={`p-5 rounded-3xl dark-glass border transition-all space-y-3.5 relative overflow-hidden ${
                      font.favorite 
                        ? 'border-rose-500/40 bg-gradient-to-br from-rose-500/5 via-transparent to-transparent shadow-lg' 
                        : 'border-white/10 hover:border-white/20'
                    }`}
                  >
                    {/* Header info */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <h4 className="text-base font-bold text-white flex items-center gap-2">
                            <span>{font.name}</span>
                          </h4>
                          {font.favorite && (
                            <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-bold">
                              ★ User Favourite
                            </span>
                          )}
                          <span className="text-[10px] font-mono text-zinc-500 px-1.5 py-0.5 rounded bg-white/5 border border-white/10">
                            {font.provider}
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-400 italic">
                          "{font.tagline}"
                        </p>
                      </div>

                      <a 
                        href={font.sourceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded-xl bg-white/5 hover:bg-white/15 text-zinc-400 hover:text-white transition-colors"
                        title="View Font Specimen on Web"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>

                    {/* Live Rendered Specimen Preview */}
                    <div className="p-4 rounded-2xl bg-black/50 border border-white/5 min-h-[72px] flex items-center">
                      <p className={`text-lg sm:text-xl text-white font-normal leading-snug tracking-normal ${font.className}`}>
                        {customSampleText || font.specimen}
                      </p>
                    </div>

                    {/* Metadata & Weights */}
                    <div className="flex items-center justify-between text-[11px] text-zinc-400 font-mono">
                      <span>Weights: {font.weights}</span>
                      <span className="text-zinc-500 text-[10px]">Recommended: {font.recommendedRole}</span>
                    </div>

                    {/* Interactive Action Controls */}
                    <div className="flex items-center gap-2 pt-1 border-t border-white/[0.06] flex-wrap">
                      <button
                        onClick={() => applyHeadingFont(font.name, font.cssVar)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                          isHeadingActive 
                            ? 'bg-rose-500 text-white shadow-md' 
                            : 'bg-white/5 hover:bg-white/15 text-zinc-300'
                        }`}
                      >
                        {isHeadingActive && <Check className="w-3 h-3" />}
                        <span>Set as Headings</span>
                      </button>

                      <button
                        onClick={() => applyBodyFont(font.name, font.cssVar)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                          isBodyActive 
                            ? 'bg-sky-500 text-white shadow-md' 
                            : 'bg-white/5 hover:bg-white/15 text-zinc-300'
                        }`}
                      >
                        {isBodyActive && <Check className="w-3 h-3" />}
                        <span>Set as UI / Chat Body</span>
                      </button>

                      <button
                        onClick={() => applyHeroFont(font.name, font.cssVar)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                          isHeroActive 
                            ? 'bg-purple-500 text-white shadow-md' 
                            : 'bg-white/5 hover:bg-white/15 text-zinc-300'
                        }`}
                      >
                        {isHeroActive && <Check className="w-3 h-3" />}
                        <span>Set as Hero Titles</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* C. CHAT & MESSAGE READABILITY STRESS TEST (Instrument Sans Proof) */}
          <div className="p-6 rounded-3xl dark-glass border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-sky-400 font-bold block">
                  Readability Stress-Test • Instrument Sans
                </span>
                <h4 className="text-lg font-heading font-bold text-white">
                  Why Instrument Sans Excels in Social & Long-Form Reading
                </h4>
              </div>
              <span className="px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30 text-xs font-semibold">
                High Legibility / Zero Eye Fatigue
              </span>
            </div>

            <p className="text-xs text-zinc-400 max-w-2xl leading-relaxed">
              Soulverse members read thousands of messages, stories, reflections, and deep connection books. Overly decorative fonts cause visual strain. <strong>Instrument Sans</strong> provides quiet luxury with balanced proportions that keep long conversations effortless to read.
            </p>

            {/* Mock Chat Conversation using Instrument Sans */}
            <div className="p-4 sm:p-5 rounded-2xl bg-black/60 border border-white/10 space-y-3 font-body max-w-xl">
              {/* Message 1 */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-500/30 border border-purple-500/40 flex items-center justify-center text-xs font-bold text-white shrink-0">
                  AR
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold font-heading text-white">Alex Rivera</span>
                    <span className="text-[10px] text-zinc-500 font-mono">10:42 PM</span>
                  </div>
                  <div className="p-3.5 rounded-2xl rounded-tl-sm bg-white/[0.08] border border-white/10 text-sm text-zinc-200 leading-relaxed font-body">
                    Saw you are also deep into indie game architecture. <em>Outer Wilds</em> completely changed how I view non-linear storytelling. The way it treats knowledge as your only progression mechanic was mind-blowing.
                  </div>
                </div>
              </div>

              {/* Message 2 */}
              <div className="flex items-end justify-end gap-2 pt-1">
                <div className="p-3.5 rounded-2xl rounded-br-sm bg-gradient-to-r from-rose-500/20 to-purple-500/20 border border-rose-500/30 text-sm text-white leading-relaxed font-body max-w-md">
                  Totally agree! That feeling of discovering orbital mechanics yourself without a forced tutorial is completely unmatched in modern gaming.
                </div>
              </div>
            </div>
          </div>

          {/* D. TYPOGRAPHIC SCALE & CONTRAST STANDARD */}
          <Card variant="glass" padding="spacious" className="space-y-6">
            <CardHeader>
              <CardTitle>Typographic Scale & Contrast Standard</CardTitle>
              <CardDescription>
                Strict typography hierarchy maintaining a minimum 4.5:1 WCAG AA contrast ratio across all weights.
              </CardDescription>
            </CardHeader>
            <div className="space-y-4 divide-y divide-white/[0.06]">
              <div className="pt-3">
                <span className="text-xs font-mono text-zinc-500 block mb-1">Hero Heading (36px–52px / 800) • Syne Display</span>
                <p className="type-hero">
                  The Sanctuary for Human Resonance
                </p>
              </div>
              <div className="pt-3">
                <span className="text-xs font-mono text-zinc-500 block mb-1">Page Heading (28px–36px / 700) • Bricolage Grotesque</span>
                <p className="type-page-heading">
                  Multi-Dimensional Identities & Realities
                </p>
              </div>
              <div className="pt-3">
                <span className="text-xs font-mono text-zinc-500 block mb-1">Section Heading (21px–25px / 700) • Bricolage Grotesque</span>
                <p className="type-section-heading">
                  Relationship Memory Vaults & Boundaries
                </p>
              </div>
              <div className="pt-3">
                <span className="text-xs font-mono text-zinc-500 block mb-1">Card Heading (17px–20px / 600) • Bricolage Grotesque</span>
                <p className="type-card-heading">
                  Philosophical Alignment & Deep Prompts
                </p>
              </div>
              <div className="pt-3">
                <span className="text-xs font-mono text-zinc-500 block mb-1">Body Text (15px–17px / 400) • Instrument Sans</span>
                <p className="type-body text-zinc-300 leading-relaxed max-w-2xl">
                  Soulverse is engineered to eliminate the superficial swipe loop, elevating writing, character, attachment security, and mutual intentionality before appearance.
                </p>
              </div>
              <div className="pt-3">
                <span className="text-xs font-mono text-zinc-500 block mb-1">Metadata (12px / 500) • JetBrains Mono</span>
                <p className="text-xs text-zinc-400 font-mono tracking-wide">
                  TIMESTAMP: 2026-11-18T17:48:00Z • ENCRYPTED AT REST (AES-256-GCM)
                </p>
              </div>
            </div>
          </Card>
        </TabPanel>

        {/* =================================================================== */}
        {/* TAB 3: FEEDBACK STATES & SKELETONS                                  */}
        {/* =================================================================== */}
        <TabPanel value="feedback" className="space-y-8 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Empty State */}
            <div className="space-y-2">
              <span className="text-xs font-mono text-zinc-400 font-bold block">
                Empty State with Next Useful Action
              </span>
              <EmptyState
                icon={<Heart className="w-6 h-6 text-rose-400 fill-rose-500/20" />}
                title="Your Memory Vault is Empty"
                description="Record the first meaningful commitment, promise, or emotional milestone with someone in your connection circle."
                actionLabel="Create First Milestone"
                onAction={() => toast.success('Triggered milestone creation modal')}
              />
            </div>

            {/* Error State */}
            <div className="space-y-2">
              <span className="text-xs font-mono text-zinc-400 font-bold block">
                Asynchronous Error Feedback & Retry
              </span>
              <ErrorState
                title="Connection Timeout"
                message="Could not synchronize real-time messages with server gateway. Retrying automatically in 5s."
                onRetry={() => toast.info('Retrying connection...')}
              />
            </div>
          </div>

          {/* Skeletons */}
          <div className="space-y-3">
            <span className="text-xs font-mono text-zinc-400 font-bold block">
              Shimmer Skeleton Loaders
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Skeleton variant="card" />
              <Skeleton variant="card" />
            </div>
          </div>

          {/* Toast Triggers */}
          <Card variant="glass" padding="standard" className="space-y-3">
            <CardTitle>Trigger Accessible Toast Feedback</CardTitle>
            <div className="flex flex-wrap gap-2.5">
              <button
                onClick={() => toast.success('Milestone saved to encrypted vault.')}
                className="px-3.5 py-2 rounded-xl bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30 cursor-pointer"
              >
                Success Toast
              </button>
              <button
                onClick={() => toast.error('Attachment exceeds 25 MB safety limit.')}
                className="px-3.5 py-2 rounded-xl bg-rose-500/20 text-rose-300 text-xs font-bold border border-rose-500/30 cursor-pointer"
              >
                Error Toast
              </button>
              <button
                onClick={() => toast.warning('Your session will expire in 5 minutes.')}
                className="px-3.5 py-2 rounded-xl bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30 cursor-pointer"
              >
                Warning Toast
              </button>
              <button
                onClick={() => toast.info('Offline message queue synchronized.')}
                className="px-3.5 py-2 rounded-xl bg-blue-500/20 text-blue-300 text-xs font-bold border border-blue-500/30 cursor-pointer"
              >
                Info Toast
              </button>
            </div>
          </Card>
        </TabPanel>
      </Tabs>

      {/* Interactive Overlays in Showcase */}
      <Dialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        title="Sanctuary Settings & Identity Rules"
        description="Configure privacy permissions, AI assistance routing, and connection boundaries."
      >
        <div className="space-y-3 text-xs sm:text-sm text-zinc-300">
          <p>This dialog traps focus, handles Escape keys, and respects high-contrast boundaries.</p>
          <button
            onClick={() => setIsDialogOpen(false)}
            className="w-full h-10 rounded-xl bg-amber-400 text-zinc-950 font-bold mt-4"
          >
            Save Preferences
          </button>
        </div>
      </Dialog>

      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={() => {
          setIsConfirmOpen(false);
          toast.error('Chapter deleted permanently');
        }}
        title="Delete Life Milestone?"
        message="This will permanently delete this milestone and its associated emotional reflections. This action cannot be undone."
        confirmLabel="Delete Permanently"
      />

      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title="Quick Access Drawer"
        position="bottom"
      >
        <div className="space-y-3 text-xs sm:text-sm text-zinc-300">
          <p>Mobile-first bottom sheet drawer featuring top touch handle, smooth slide animations, and full accessibility.</p>
          <button
            onClick={() => setIsDrawerOpen(false)}
            className="w-full h-10 rounded-xl bg-white/10 text-white font-bold"
          >
            Dismiss
          </button>
        </div>
      </Drawer>

      <MediaViewer
        isOpen={isMediaViewerOpen}
        onClose={() => setIsMediaViewerOpen(false)}
        mediaUrl="https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1600&q=80"
        title="Gothic Sanctuary Under Moonlit Haze"
        caption="Captured during the midnight reflection session."
      />
    </div>
  );
};
