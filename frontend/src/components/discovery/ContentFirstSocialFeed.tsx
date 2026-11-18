import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Sparkles,
  Flame,
  Users,
  Search,
  Filter,
  SlidersHorizontal,
  Plus,
  Heart,
  MessageCircle,
  Bookmark,
  Share2,
  MoreHorizontal,
  EyeOff,
  Flag,
  Check,
  Loader2,
  RefreshCw,
  Compass,
  Quote,
  HelpCircle,
  Image as ImageIcon,
  BookOpen,
  Music,
  ListOrdered,
  ChevronDown,
  Volume2
} from 'lucide-react';
import { socialApiClient } from '../../services/socialApiClient';
import { MOCK_PROFILES } from '../../mockData';
import { CreatePostModal } from './CreatePostModal';
import { PostDetailCommentsModal } from './PostDetailCommentsModal';
import { InterestPreferencesModal } from './InterestPreferencesModal';
import type { SocialPostItem, FeedMode, PostType } from '../../types/social';
import type { UserProfile } from '../../types';

interface ContentFirstSocialFeedProps {
  onOpenProfile: (profile: UserProfile) => void;
  onInitiateChat: (profile: UserProfile) => void;
}

export const ContentFirstSocialFeed: React.FC<ContentFirstSocialFeedProps> = ({
  onOpenProfile,
  onInitiateChat
}) => {
  // Feed Tabs: For You, Trending, Following
  const [activeTab, setActiveTab] = useState<FeedMode>('for_you');

  // Topic stream filter
  const [selectedTopic, setSelectedTopic] = useState('all');
  const [availableTopics, setAvailableTopics] = useState<Array<{ id: string; label: string; tag: string }>>([
    { id: 'all', label: 'All Streams', tag: '' },
    { id: 'philosophy', label: 'Philosophy & Mind', tag: '#philosophy' },
    { id: 'cinema', label: 'Cinema & 35mm', tag: '#cinema' },
    { id: 'architecture', label: 'Architecture & Spaces', tag: '#architecture' },
    { id: 'music', label: 'Soundscapes & Ambient', tag: '#soundscapes' },
    { id: 'literature', label: 'Literature & Poetry', tag: '#literature' },
    { id: 'ceramics', label: 'Craft & Textures', tag: '#ceramics' },
    { id: 'astrophotography', label: 'Cosmos & Stars', tag: '#astrophotography' },
    { id: 'slowliving', label: 'Slow Living', tag: '#slowliving' }
  ]);

  // Content type filter chip
  const [selectedFormat, setSelectedFormat] = useState<string>('all');

  // Search query
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Feed items & pagination
  const [posts, setPosts] = useState<SocialPostItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);

  // Modals state
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [composerInitialType, setComposerInitialType] = useState<PostType>('thought');
  const [activeCommentsPost, setActiveCommentsPost] = useState<SocialPostItem | null>(null);
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);

  // Follow states tracking (optimistic user_id -> is_following)
  const [followingMap, setFollowingMap] = useState<Record<string, boolean>>({});

  // Poll votes tracking (poll_id -> chosen option_id)
  const [pollVotes, setPollVotes] = useState<Record<string, string>>({});

  // More menu popover
  const [activeMenuPostId, setActiveMenuPostId] = useState<string | null>(null);

  // Audio preview playing tracking
  const [playingAudioPostId, setPlayingAudioPostId] = useState<string | null>(null);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Load available topics on mount
  useEffect(() => {
    socialApiClient.getInterests()
      .then(res => {
        if (res && res.length > 0) setAvailableTopics(res);
      })
      .catch(() => {});
  }, []);

  // Fetch feed
  const fetchFeed = useCallback(async (reset = false) => {
    try {
      if (reset) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const cursorToUse = reset ? undefined : (nextCursor || undefined);

      const res = await socialApiClient.getFeed({
        feed_mode: activeTab,
        category: selectedTopic !== 'all' ? selectedTopic : undefined,
        post_type: selectedFormat !== 'all' ? selectedFormat : undefined,
        search: debouncedSearch.trim() || undefined,
        cursor: cursorToUse,
        limit: 12
      });

      if (reset) {
        setPosts(res.items);
      } else {
        setPosts(prev => [...prev, ...res.items]);
      }

      setNextCursor(res.next_cursor || null);
      setHasMore(res.has_more);
    } catch (err) {
      console.error('Failed to load social feed:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [activeTab, selectedTopic, selectedFormat, debouncedSearch, nextCursor]);

  // Refetch on tab / filter change
  useEffect(() => {
    fetchFeed(true);
  }, [activeTab, selectedTopic, selectedFormat, debouncedSearch]);

  // Interactions: Like Post
  const handleToggleLike = async (postId: string) => {
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    const newLiked = !post.is_liked;
    const newCount = newLiked ? post.likes_count + 1 : Math.max(0, post.likes_count - 1);

    // Optimistic UI update
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, is_liked: newLiked, likes_count: newCount } : p));

    try {
      await socialApiClient.toggleReaction({
        target_type: 'post',
        target_id: postId,
        reaction_type: 'like'
      });
    } catch (err) {
      // Rollback on error
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, is_liked: !newLiked, likes_count: post.likes_count } : p));
      showToast('Could not update reaction');
    }
  };

  // Interactions: Bookmark Post
  const handleToggleBookmark = async (postId: string) => {
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    const newBookmarked = !post.is_bookmarked;
    const newCount = newBookmarked ? post.bookmarks_count + 1 : Math.max(0, post.bookmarks_count - 1);

    // Optimistic UI update
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, is_bookmarked: newBookmarked, bookmarks_count: newCount } : p));
    showToast(newBookmarked ? 'Expression saved to personal sanctuary' : 'Removed from bookmarks');

    try {
      await socialApiClient.toggleBookmark({
        target_type: 'post',
        target_id: postId
      });
    } catch (err) {
      // Rollback
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, is_bookmarked: !newBookmarked, bookmarks_count: post.bookmarks_count } : p));
    }
  };

  // Interactions: Follow Creator
  const handleToggleFollow = async (creatorId: string, creatorName: string) => {
    const currentStatus = followingMap[creatorId] ?? false;
    const nextStatus = !currentStatus;

    // Optimistic UI
    setFollowingMap(prev => ({ ...prev, [creatorId]: nextStatus }));
    showToast(nextStatus ? `Following ${creatorName}` : `Unfollowed ${creatorName}`);

    try {
      const res = await socialApiClient.toggleFollowCreator(creatorId);
      setFollowingMap(prev => ({ ...prev, [creatorId]: res.is_following }));
    } catch (err: any) {
      setFollowingMap(prev => ({ ...prev, [creatorId]: currentStatus }));
      showToast(err.message || 'Failed to update follow');
    }
  };

  // Interactions: Share
  const handleSharePost = (post: SocialPostItem) => {
    const url = `${window.location.origin}/#expression-${post.id}`;
    navigator.clipboard.writeText(url).then(() => {
      showToast('Expression link copied to clipboard');
    }).catch(() => {
      showToast('Link ready to share');
    });
  };

  // Interactions: Hide Post
  const handleHidePost = async (postId: string) => {
    // Optimistic remove from feed
    setPosts(prev => prev.filter(p => p.id !== postId));
    setActiveMenuPostId(null);
    showToast('Post hidden from your discovery stream');

    try {
      await socialApiClient.hidePost(postId);
    } catch (err) {
      console.error('Failed to hide post:', err);
    }
  };

  // Interactions: Report Post
  const handleReportPost = async (postId: string) => {
    setActiveMenuPostId(null);
    try {
      await socialApiClient.reportContent({
        target_type: 'post',
        target_id: postId,
        reason: 'spam',
        details: 'Reported through content-first discovery feed'
      });
      setPosts(prev => prev.filter(p => p.id !== postId));
      showToast('Thank you. Post submitted for community review.');
    } catch (err) {
      showToast('Failed to submit report');
    }
  };

  // Creator Tap: Open full profile dossier
  const handleCreatorClick = (post: SocialPostItem) => {
    const existing = MOCK_PROFILES.find(p => p.id === post.user_id || p.username === post.author_username);
    if (existing) {
      onOpenProfile(existing);
      return;
    }

    const profile: UserProfile = {
      id: post.user_id,
      name: post.author_name,
      username: post.author_username || 'creator',
      avatar: post.author_avatar,
      age: 27,
      location: 'Soulverse Sanctuary',
      tagline: post.summary || 'Exploring depth and craft',
      headline: 'Independent Creator',
      intent: 'Friendship',
      status: 'Exploring',
      languages: ['English'],
      aboutMeLong: post.content.slice(0, 300),
      personalQuote: {
        quote: 'Living with intention in every moment.',
        author: post.author_name
      },
      energy: 'Introvert',
      conflictStyle: 'Need Space First',
      affectionStyle: 'Quality Time',
      socialEnergy: 'Recharge in Solitude',
      idealConversation: 'Unrushed late-night discussions on meaning and craft.',
      coreValues: ['Authenticity', 'Presence', 'Craft'],
      interests: post.tags && post.tags.length > 0 ? post.tags.map(t => t.replace('#', '')) : ['Philosophy', 'Craft'],
      likes: ['Silence', 'Deep focus', 'Analogue arts'],
      dislikes: ['Performative noise', 'Haste'],
      deepQuestion: {
        question: 'What brings you genuine stillness?',
        answer: post.content.slice(0, 100)
      },
      photos: post.media_urls && post.media_urls.length > 0 ? post.media_urls : [post.author_avatar],
      verifications: {
        photoVerified: true,
        ageVerified18Plus: true,
        idDocumentVerified: false,
        socialVerified: true,
        educationVerified: false
      }
    };
    onOpenProfile(profile);
  };

  // Format chip choices
  const FORMAT_CHIPS = [
    { id: 'all', label: 'All Formats' },
    { id: 'thought', label: 'Thoughts', icon: Sparkles },
    { id: 'quote', label: 'Quotes', icon: Quote },
    { id: 'question', label: 'Questions', icon: HelpCircle },
    { id: 'story', label: 'Stories', icon: BookOpen },
    { id: 'image', label: 'Visual Art', icon: ImageIcon },
    { id: 'poll', label: 'Polls', icon: ListOrdered }
  ];

  return (
    <div className="w-full max-w-4xl mx-auto px-2 sm:px-4 py-2 sm:py-4 space-y-4 animate-fadeIn font-body select-none text-zinc-100">
      
      {/* ── 1. EDITORIAL HEADER & DISCOVERY TABS ── */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-white tracking-tight">
                Social Discovery
              </h1>
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            </div>
            <p className="text-xs text-zinc-400 font-medium mt-0.5">
              Discover people through what they express, not simply how they look.
            </p>
          </div>

          {/* 3 Primary Tabs: For You, Trending, Following */}
          <div className="flex items-center p-1 rounded-2xl bg-white/[0.04] border border-white/[0.08] self-start sm:self-auto shadow-inner">
            <button
              onClick={() => setActiveTab('for_you')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'for_you'
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-900/30'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>For You</span>
            </button>

            <button
              onClick={() => setActiveTab('trending')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'trending'
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-900/30'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              <span>Trending</span>
            </button>

            <button
              onClick={() => setActiveTab('following')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'following'
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-900/30'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Following</span>
            </button>
          </div>
        </div>

        {/* ── 2. SEARCH & TOPIC STREAM HORIZONTAL SCROLLER ── */}
        <div className="space-y-2">
          
          {/* Search bar & Customize Topics button */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search thoughts, questions, creators, or #hashtags..."
                className="w-full pl-9 pr-4 py-2 rounded-2xl bg-white/[0.04] border border-white/[0.08] text-white text-xs placeholder:text-zinc-500 focus:outline-none focus:border-rose-500/50 transition-all font-medium"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            <button
              onClick={() => setIsPreferencesOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-zinc-300 hover:text-white text-xs font-semibold transition-all cursor-pointer shrink-0"
              title="Personalize Topics"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-rose-400" />
              <span className="hidden sm:inline">My Topics</span>
            </button>
          </div>

          {/* Sticky Interest Topics Carousel */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            {availableTopics.map(topic => {
              const isSelected = selectedTopic === topic.id;
              return (
                <button
                  key={topic.id}
                  onClick={() => setSelectedTopic(topic.id)}
                  className={`h-8 px-3.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                    isSelected
                      ? 'bg-white text-[#0A0B0F] shadow-sm font-bold'
                      : 'bg-white/[0.03] text-zinc-400 hover:text-white border border-white/[0.06]'
                  }`}
                >
                  {topic.label}
                </button>
              );
            })}
          </div>

          {/* Content Type Filter Chips */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-1">
            {FORMAT_CHIPS.map(chip => {
              const isSelected = selectedFormat === chip.id;
              const Icon = chip.icon;
              return (
                <button
                  key={chip.id}
                  onClick={() => setSelectedFormat(chip.id)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                    isSelected
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold'
                      : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.02]'
                  }`}
                >
                  {Icon && <Icon className="w-3 h-3" />}
                  <span>{chip.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── 3. PROMINENT EXPRESSION COMPOSER BAR ── */}
        <div className="p-3.5 rounded-3xl bg-[#12131A] border border-white/[0.08] shadow-lg space-y-3">
          <div
            onClick={() => {
              setComposerInitialType('thought');
              setIsComposerOpen(true);
            }}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-full bg-rose-600/30 border border-rose-500/40 flex items-center justify-center text-rose-300 shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="flex-1 px-4 py-2 rounded-2xl bg-white/[0.03] border border-white/[0.06] group-hover:border-rose-500/30 text-xs text-zinc-400 transition-colors">
              Share an original thought, quote, question, or photography...
            </div>
          </div>

          {/* Quick action buttons */}
          <div className="flex items-center justify-between pt-1 border-t border-white/[0.05] text-xs">
            <div className="flex items-center gap-1 sm:gap-2">
              <button
                onClick={() => { setComposerInitialType('thought'); setIsComposerOpen(true); }}
                className="flex items-center gap-1 px-2.5 py-1 rounded-xl hover:bg-white/[0.06] text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Thought</span>
              </button>
              <button
                onClick={() => { setComposerInitialType('quote'); setIsComposerOpen(true); }}
                className="flex items-center gap-1 px-2.5 py-1 rounded-xl hover:bg-white/[0.06] text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <Quote className="w-3.5 h-3.5 text-rose-400" />
                <span className="hidden sm:inline">Quote</span>
              </button>
              <button
                onClick={() => { setComposerInitialType('question'); setIsComposerOpen(true); }}
                className="flex items-center gap-1 px-2.5 py-1 rounded-xl hover:bg-white/[0.06] text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <HelpCircle className="w-3.5 h-3.5 text-sky-400" />
                <span className="hidden sm:inline">Question</span>
              </button>
              <button
                onClick={() => { setComposerInitialType('image'); setIsComposerOpen(true); }}
                className="flex items-center gap-1 px-2.5 py-1 rounded-xl hover:bg-white/[0.06] text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Visual Art</span>
              </button>
              <button
                onClick={() => { setComposerInitialType('poll'); setIsComposerOpen(true); }}
                className="flex items-center gap-1 px-2.5 py-1 rounded-xl hover:bg-white/[0.06] text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <ListOrdered className="w-3.5 h-3.5 text-indigo-400" />
                <span className="hidden sm:inline">Poll</span>
              </button>
            </div>

            <button
              onClick={() => { setComposerInitialType('thought'); setIsComposerOpen(true); }}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md shadow-rose-900/30 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Compose</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── 4. SOCIAL CONTENT STREAM ── */}
      <div className="space-y-4 pt-2">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-zinc-500 space-y-3">
            <Loader2 className="w-7 h-7 animate-spin text-rose-500" />
            <p className="text-xs font-mono uppercase tracking-wider">Curating meaningful expressions...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20 px-4 rounded-3xl bg-white/[0.02] border border-white/[0.06] space-y-3">
            <Compass className="w-10 h-10 mx-auto text-zinc-600 stroke-1" />
            <h3 className="text-base font-heading font-bold text-white">No expressions found</h3>
            <p className="text-xs text-zinc-400 max-w-md mx-auto">
              {activeTab === 'following'
                ? "You haven't followed any creators yet. Explore the 'For You' stream and follow thinkers, artists, and writers whose expressions resonate with you."
                : "No posts match this topic filter. Try selecting 'All Streams' or sharing the first contemplation."}
            </p>
            {activeTab === 'following' && (
              <button
                onClick={() => setActiveTab('for_you')}
                className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold shadow-md cursor-pointer mt-2"
              >
                Explore For You
              </button>
            )}
          </div>
        ) : (
          posts.map(post => {
            const isFollowing = followingMap[post.user_id] ?? false;
            const pollData = post.attachment_json?.poll_id ? post.attachment_json : null;
            const quoteData = post.attachment_json?.quote_author ? post.attachment_json : null;
            const audioData = post.attachment_json?.audio_track ? post.attachment_json : null;

            return (
              <article
                key={post.id}
                className="p-5 sm:p-6 rounded-3xl bg-[#12131A] border border-white/[0.08] hover:border-white/[0.14] transition-all space-y-4 shadow-xl shadow-black/40 group relative"
              >
                {/* ── CREATOR HEADER ── */}
                <div className="flex items-center justify-between">
                  <div
                    onClick={() => handleCreatorClick(post)}
                    className="flex items-center gap-3 cursor-pointer group/creator"
                  >
                    <div className="relative">
                      <img
                        src={post.author_avatar}
                        alt={post.author_name}
                        className="w-10 h-10 rounded-full object-cover border border-white/10 group-hover/creator:border-rose-500/60 transition-colors"
                      />
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-[#12131A] absolute bottom-0 right-0" />
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-heading font-bold text-white group-hover/creator:text-rose-300 transition-colors">
                          {post.author_name}
                        </span>
                        <span className="text-[11px] font-mono text-zinc-500">
                          @{post.author_username || 'creator'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-zinc-500">
                        <span>{new Date(post.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                        <span>•</span>
                        <span className="capitalize font-mono text-[10px] text-rose-400/80">
                          {post.post_type}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Top Right: Follow Button & More Menu */}
                  <div className="flex items-center gap-2">
                    {post.user_id !== 'usr_me' && (
                      <button
                        onClick={() => handleToggleFollow(post.user_id, post.author_name)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          isFollowing
                            ? 'bg-white/[0.08] text-zinc-300 hover:bg-rose-500/20 hover:text-rose-300'
                            : 'bg-rose-600/20 text-rose-300 border border-rose-500/40 hover:bg-rose-600 hover:text-white'
                        }`}
                      >
                        {isFollowing ? 'Following' : '+ Follow'}
                      </button>
                    )}

                    <div className="relative">
                      <button
                        onClick={() => setActiveMenuPostId(activeMenuPostId === post.id ? null : post.id)}
                        className="p-1.5 rounded-xl hover:bg-white/[0.06] text-zinc-400 hover:text-white transition-colors cursor-pointer"
                        title="More actions"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>

                      {/* Dropdown Menu */}
                      {activeMenuPostId === post.id && (
                        <div className="absolute right-0 top-8 z-20 w-44 rounded-2xl bg-[#1A1B24] border border-white/[0.1] shadow-2xl p-1.5 space-y-1 animate-fadeIn">
                          <button
                            onClick={() => handleHidePost(post.id)}
                            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-zinc-300 hover:text-white hover:bg-white/[0.06] text-left transition-colors cursor-pointer"
                          >
                            <EyeOff className="w-3.5 h-3.5 text-zinc-400" />
                            <span>Hide this post</span>
                          </button>
                          <button
                            onClick={() => handleReportPost(post.id)}
                            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 text-left transition-colors cursor-pointer"
                          >
                            <Flag className="w-3.5 h-3.5" />
                            <span>Report post</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* ── CARD CONTENT BODY BY POST TYPE ── */}
                <div className="space-y-3">
                  {post.title && (
                    <h2 className="text-base sm:text-lg font-heading font-extrabold text-white tracking-tight leading-snug">
                      {post.title}
                    </h2>
                  )}

                  {/* 1. QUOTE CARD SPECIFIC PRESENTATION */}
                  {post.post_type === 'quote' && (
                    <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.02] border-l-4 border-rose-500 space-y-2">
                      <p className="text-sm sm:text-base font-serif italic text-zinc-100 leading-relaxed">
                        {post.content}
                      </p>
                      {quoteData?.quote_author && (
                        <div className="pt-2 text-right">
                          <span className="text-xs font-heading font-bold text-rose-300 block">
                            — {quoteData.quote_author}
                          </span>
                          {quoteData.quote_source && (
                            <span className="text-[10px] font-mono text-zinc-500">
                              {quoteData.quote_source}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* 2. QUESTION CARD SPECIFIC PRESENTATION */}
                  {post.post_type === 'question' && (
                    <div className="p-4 sm:p-5 rounded-2xl bg-sky-950/20 border border-sky-500/20 space-y-3">
                      <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-sky-400 font-bold">
                        <HelpCircle className="w-3.5 h-3.5" />
                        <span>Sanctuary Inquiry</span>
                      </div>
                      <p className="text-sm sm:text-base text-zinc-100 font-medium leading-relaxed">
                        {post.content}
                      </p>
                      <button
                        onClick={() => setActiveCommentsPost(post)}
                        className="px-3.5 py-1.5 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>Reflect & Answer ({post.comments_count})</span>
                      </button>
                    </div>
                  )}

                  {/* 3. POLL CARD SPECIFIC PRESENTATION */}
                  {post.post_type === 'poll' && pollData && (
                    <div className="space-y-3">
                      <p className="text-sm text-zinc-200 leading-relaxed font-medium">
                        {post.content}
                      </p>
                      <div className="space-y-2 pt-1">
                        {pollData.options?.map((opt: any) => {
                          const hasVoted = Boolean(pollVotes[pollData.poll_id]);
                          const isSelected = pollVotes[pollData.poll_id] === opt.id;
                          const totalVotes = Math.max(1, pollData.total_votes + (hasVoted ? 1 : 0));
                          const votes = opt.votes + (isSelected ? 1 : 0);
                          const percentage = Math.round((votes / totalVotes) * 100);

                          return (
                            <button
                              key={opt.id}
                              disabled={hasVoted}
                              onClick={() => setPollVotes(prev => ({ ...prev, [pollData.poll_id]: opt.id }))}
                              className={`w-full relative overflow-hidden p-3 rounded-2xl border text-left transition-all ${
                                isSelected
                                  ? 'border-rose-500/60 bg-rose-500/10'
                                  : 'border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.04]'
                              }`}
                            >
                              {/* Animated Percentage Bar */}
                              {hasVoted && (
                                <div
                                  className="absolute left-0 top-0 bottom-0 bg-rose-500/20 transition-all duration-500"
                                  style={{ width: `${percentage}%` }}
                                />
                              )}
                              <div className="relative flex items-center justify-between text-xs z-10">
                                <span className={`font-medium ${isSelected ? 'text-rose-200 font-bold' : 'text-zinc-200'}`}>
                                  {opt.text}
                                </span>
                                {hasVoted && (
                                  <span className="font-mono text-zinc-400 font-bold">
                                    {percentage}%
                                  </span>
                                )}
                              </div>
                            </button>
                          );
                        })}
                        <div className="text-[11px] font-mono text-zinc-500 pt-1 text-right">
                          {pollData.total_votes + (pollVotes[pollData.poll_id] ? 1 : 0)} votes recorded
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 4. AUDIO / MUSIC CARD SPECIFIC PRESENTATION */}
                  {audioData && (
                    <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/20 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-amber-500/20 flex items-center justify-center text-amber-300 shrink-0">
                          <Music className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="text-xs font-bold text-white font-heading block">
                            {audioData.title}
                          </span>
                          <span className="text-[11px] font-mono text-zinc-400">
                            {audioData.artist}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          const isPlaying = playingAudioPostId === post.id;
                          setPlayingAudioPostId(isPlaying ? null : post.id);
                          showToast(isPlaying ? 'Audio paused' : 'Playing sonic contemplation preview');
                        }}
                        className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>{playingAudioPostId === post.id ? 'Pause' : 'Listen'}</span>
                      </button>
                    </div>
                  )}

                  {/* 5. DEFAULT THOUGHT / STORY TEXT PRESENTATION */}
                  {post.post_type !== 'quote' && post.post_type !== 'poll' && (
                    <p className="text-sm text-zinc-200 leading-relaxed font-body whitespace-pre-line">
                      {post.content}
                    </p>
                  )}

                  {/* PHOTOGRAPHY / VISUAL ART MEDIA */}
                  {post.media_urls && post.media_urls.length > 0 && (
                    <div className="pt-2 rounded-2xl overflow-hidden">
                      <img
                        src={post.media_urls[0]}
                        alt={post.title || 'Expression visual'}
                        className="w-full max-h-[460px] object-cover rounded-2xl border border-white/10 hover:brightness-105 transition-all"
                        loading="lazy"
                      />
                    </div>
                  )}

                  {/* HASHTAGS */}
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap pt-1">
                      {post.tags.map((tag, i) => (
                        <button
                          key={i}
                          onClick={() => setSelectedTopic(tag.replace('#', ''))}
                          className="text-[11px] font-mono text-rose-400/80 hover:text-rose-300 transition-colors cursor-pointer"
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* ── INTERACTION ACTION BAR ── */}
                <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs text-zinc-400">
                  <div className="flex items-center gap-4 sm:gap-6">
                    {/* Like / Resonance */}
                    <button
                      onClick={() => handleToggleLike(post.id)}
                      className={`flex items-center gap-1.5 transition-colors cursor-pointer ${
                        post.is_liked ? 'text-rose-500 font-bold' : 'hover:text-white'
                      }`}
                      title="Heart this expression"
                    >
                      <Heart className={`w-4 h-4 transition-transform active:scale-125 ${post.is_liked ? 'fill-rose-500 text-rose-500' : ''}`} />
                      <span>{post.likes_count}</span>
                    </button>

                    {/* Comments */}
                    <button
                      onClick={() => setActiveCommentsPost(post)}
                      className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer"
                      title="Reflections & Discussion"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>{post.comments_count}</span>
                    </button>

                    {/* Bookmark / Save */}
                    <button
                      onClick={() => handleToggleBookmark(post.id)}
                      className={`flex items-center gap-1.5 transition-colors cursor-pointer ${
                        post.is_bookmarked ? 'text-amber-400 font-bold' : 'hover:text-white'
                      }`}
                      title="Save to Sanctuary"
                    >
                      <Bookmark className={`w-4 h-4 ${post.is_bookmarked ? 'fill-amber-400 text-amber-400' : ''}`} />
                      <span>{post.bookmarks_count}</span>
                    </button>
                  </div>

                  {/* Share & Connect */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleSharePost(post)}
                      className="p-1.5 rounded-xl hover:bg-white/[0.06] text-zinc-400 hover:text-white transition-colors cursor-pointer"
                      title="Share Expression Link"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleCreatorClick(post)}
                      className="text-[11px] font-semibold text-rose-400 hover:text-rose-300 transition-colors cursor-pointer ml-1"
                    >
                      View Dossier →
                    </button>
                  </div>
                </div>

              </article>
            );
          })
        )}

        {/* Load More Trigger */}
        {hasMore && !loading && (
          <div className="text-center pt-4 pb-8">
            <button
              onClick={() => fetchFeed(false)}
              disabled={loadingMore}
              className="px-6 py-2.5 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-bold text-white transition-all cursor-pointer disabled:opacity-50 inline-flex items-center gap-2"
            >
              {loadingMore ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-500" />
                  <span>Loading deeper stream...</span>
                </>
              ) : (
                <>
                  <span>Load More Expressions</span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* ── MODALS ── */}
      <CreatePostModal
        isOpen={isComposerOpen}
        onClose={() => setIsComposerOpen(false)}
        initialPostType={composerInitialType}
        onPostCreated={(newPost) => {
          setPosts(prev => [newPost, ...prev]);
          showToast('Expression published to the sanctuary');
        }}
      />

      <PostDetailCommentsModal
        post={activeCommentsPost}
        onClose={() => setActiveCommentsPost(null)}
        onCommentAdded={(newComment) => {
          if (activeCommentsPost) {
            setPosts(prev => prev.map(p => p.id === activeCommentsPost.id ? { ...p, comments_count: p.comments_count + 1 } : p));
          }
        }}
        onOpenCreatorProfile={(userId) => {
          const userPost = posts.find(p => p.user_id === userId);
          if (userPost) handleCreatorClick(userPost);
        }}
      />

      <InterestPreferencesModal
        isOpen={isPreferencesOpen}
        onClose={() => setIsPreferencesOpen(false)}
        onSaved={(topics) => {
          showToast('Updated your preferred discovery topics');
          fetchFeed(true);
        }}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-2xl bg-black/90 border border-white/20 text-white text-xs font-bold shadow-2xl animate-fadeIn flex items-center gap-2">
          <Check className="w-3.5 h-3.5 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

    </div>
  );
};
