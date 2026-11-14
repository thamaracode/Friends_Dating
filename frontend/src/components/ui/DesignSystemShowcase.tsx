import React, { useState } from 'react';
import { 
  Sparkles, 
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
  Share2
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
          <Tab value="feedback" icon={<Sparkles className="w-4 h-4" />}>
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
                icon={<Sparkles className="w-4 h-4" />}
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
        <TabPanel value="typography" className="space-y-6 pt-4">
          <Card variant="glass" padding="spacious" className="space-y-6">
            <CardHeader>
              <CardTitle>Typographic Scale & Contrast Standard</CardTitle>
              <CardDescription>
                Strict typography hierarchy maintaining a minimum 4.5:1 WCAG AA contrast ratio across all weights.
              </CardDescription>
            </CardHeader>
            <div className="space-y-4 divide-y divide-white/[0.06]">
              <div className="pt-3">
                <span className="text-xs font-mono text-zinc-500 block mb-1">Hero Heading (32px–40px / 800)</span>
                <p className="text-3xl sm:text-4xl font-heading font-extrabold text-white">
                  The Sanctuary for Human Resonance
                </p>
              </div>
              <div className="pt-3">
                <span className="text-xs font-mono text-zinc-500 block mb-1">Page Heading (28px–34px / 700)</span>
                <p className="text-2xl sm:text-3xl font-heading font-bold text-white">
                  Multi-Dimensional Identities & Realities
                </p>
              </div>
              <div className="pt-3">
                <span className="text-xs font-mono text-zinc-500 block mb-1">Section Heading (21px–25px / 700)</span>
                <p className="text-xl sm:text-2xl font-heading font-bold text-zinc-100">
                  Relationship Memory Vaults & Boundaries
                </p>
              </div>
              <div className="pt-3">
                <span className="text-xs font-mono text-zinc-500 block mb-1">Card Heading (17px–20px / 600)</span>
                <p className="text-lg font-heading font-semibold text-zinc-200">
                  Philosophical Alignment & Deep Prompts
                </p>
              </div>
              <div className="pt-3">
                <span className="text-xs font-mono text-zinc-500 block mb-1">Body Text (15px–17px / 400)</span>
                <p className="text-base text-zinc-300 leading-relaxed max-w-2xl">
                  Soulverse is engineered to eliminate the superficial swipe loop, elevating writing, character, attachment security, and mutual intentionality before appearance.
                </p>
              </div>
              <div className="pt-3">
                <span className="text-xs font-mono text-zinc-500 block mb-1">Metadata (12px / 500)</span>
                <p className="text-xs text-zinc-400 font-mono tracking-wide">
                  TIMESTAMP: 2026-11-14T20:25:39Z • ENCRYPTED AT REST (AES-256-GCM)
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
                icon={<Sparkles className="w-6 h-6" />}
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
