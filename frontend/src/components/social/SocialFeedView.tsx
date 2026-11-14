import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Sparkles,
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  RefreshCw,
  Plus,
  Send,
  MoreHorizontal,
  Flame,
  Users,
  Clock,
  HelpCircle,
  TrendingUp,
  Lock,
  Globe,
  AlertTriangle,
  Smile,
  ShieldAlert,
  ChevronDown,
  Check,
  Eye,
  Trash2,
  X
} from 'lucide-react';
import { socialApiClient } from '../../services/socialApiClient';
import { offlineContentDb } from '../../services/offlineContentDb';
import { PostComposerModal } from './PostComposerModal';
import {
  SocialPostItem,
  FeedMode,
  SocialCommentItem,
  SocialReactionType,
  ContentVisibility
} from '../../types/social';

const FEED_MODES: { mode: FeedMode; label: string; icon: any }[] = [
  { mode: 'for_you', label: 'For You', icon: Sparkles },
  { mode: 'following', label: 'Following', icon: Users },
  { mode: 'friends', label: 'Friends', icon: Heart },
  { mode: 'questions', label: 'Questions & Answers', icon: HelpCircle },
  { mode: 'trending', label: 'Trending', icon: Flame },
  { mode: 'latest', label: 'Latest', icon: Clock },
  { mode: 'saved', label: 'Saved', icon: Bookmark }
];

const EMOTIONAL_REACTIONS: { type: SocialReactionType; emoji: string; label: string }[] = [
  { type: 'like', emoji: '❤️', label: 'Like' },
  { type: 'love', emoji: '💖', label: 'Love' },
  { type: 'thoughtful', emoji: '💡', label: 'Insightful' },
  { type: 'support', emoji: '🫂', label: 'Support' },
  { type: 'celebrate', emoji: '✨', label: 'Celebrate' },
  { type: 'laugh', emoji: '😄', label: 'Joy' }
];

export const SocialFeedView: React.FC = () => {
  const [feedMode, setFeedMode] = useState<FeedMode>('for_you');
  const [posts, setPosts] = useState<SocialPostItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);

  // Composer Modal
  const [isComposerOpen, setIsComposerOpen] = useState(false);

  // Active Comment Drawer
  const [activeCommentPost, setActiveCommentPost] = useState<SocialPostItem | null>(null);
  const [comments, setComments] = useState<SocialCommentItem[]>([]);
  const [newCommentText, setNewCommentText] = useState('');
  const [replyingToComment, setReplyingToComment] = useState<SocialCommentItem | null>(null);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  // Content Warnings Revealed Set
  const [revealedWarnings, setRevealedWarnings] = useState<Set<string>>(new Set());

  // Active Reaction Picker Popover Post ID
  const [reactionPickerPostId, setReactionPickerPostId] = useState<string | null>(null);

  // Report Modal
  const [reportingPostId, setReportingPostId] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState('spam');

  // Toast
  const [toast, setToast] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // 1. Load Feed
  const loadFeed = useCallback(async (mode: FeedMode, cursor: string | null = null, isRefresh = false) => {
    if (isRefresh) setIsRefreshing(true);
    else if (!cursor) setIsLoading(true);

    try {
      const res = await socialApiClient.getFeed({
        feed_mode: mode,
        cursor: cursor || undefined,
        limit: 12
      });

      if (cursor) {
        setPosts(prev => [...prev, ...res.items]);
      } else {
        setPosts(res.items);
      }

      setNextCursor(res.next_cursor || null);
      setHasMore(res.has_more);
    } catch {
      showToast('Offline: Loaded cached sanctuary feed');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadFeed(feedMode, null, false);
  }, [feedMode, loadFeed]);

  // 2. Refresh Button
  const handleRefresh = () => {
    loadFeed(feedMode, null, true);
  };

  // 3. Reactions
  const handleReaction = async (post: SocialPostItem, type: SocialReactionType) => {
    try {
      const res = await socialApiClient.toggleReaction({
        target_type: 'post',
        target_id: post.id,
        reaction_type: type
      });

      setPosts(prev => prev.map(p => {
        if (p.id !== post.id) return p;
        return {
          ...p,
          is_liked: res.current_reaction !== null,
          user_reaction: res.current_reaction,
          likes_count: res.summary.total
        };
      }));
      setReactionPickerPostId(null);
    } catch {
      showToast('Failed to update reaction');
    }
  };

  // 4. Bookmarking
  const handleToggleBookmark = async (post: SocialPostItem) => {
    try {
      const res = await socialApiClient.toggleBookmark({
        target_type: 'post',
        target_id: post.id
      });
      setPosts(prev => prev.map(p => {
        if (p.id !== post.id) return p;
        return {
          ...p,
          is_bookmarked: res.is_bookmarked,
          bookmarks_count: p.bookmarks_count + (res.is_bookmarked ? 1 : -1)
        };
      }));
      showToast(res.is_bookmarked ? 'Saved to bookmarks' : 'Removed from bookmarks');
    } catch {
      showToast('Failed to toggle bookmark');
    }
  };

  // 5. Open Comments Drawer
  const handleOpenComments = async (post: SocialPostItem) => {
    setActiveCommentPost(post);
    setComments([]);
    setReplyingToComment(null);
    setNewCommentText('');
    try {
      const loaded = await socialApiClient.getComments('post', post.id);
      setComments(loaded);
    } catch {
      showToast('Failed to load comments');
    }
  };

  // 6. Submit Comment or Reply
  const handleSendComment = async () => {
    if (!activeCommentPost || !newCommentText.trim() || isSubmittingComment) return;
    setIsSubmittingComment(true);
    try {
      const newComment = await socialApiClient.addComment({
        target_type: 'post',
        target_id: activeCommentPost.id,
        content: newCommentText.trim(),
        parent_comment_id: replyingToComment ? replyingToComment.id : undefined
      });

      // Update local comment hierarchy
      if (replyingToComment) {
        setComments(prev => prev.map(c => {
          if (c.id === replyingToComment.id) {
            return { ...c, replies: [...(c.replies || []), newComment] };
          }
          return c;
        }));
      } else {
        setComments(prev => [...prev, newComment]);
      }

      setPosts(prev => prev.map(p => {
        if (p.id !== activeCommentPost.id) return p;
        return { ...p, comments_count: p.comments_count + 1 };
      }));

      setNewCommentText('');
      setReplyingToComment(null);
    } catch {
      showToast('Failed to send comment');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  // 7. Delete Comment
  const handleDeleteComment = async (commentId: string) => {
    try {
      await socialApiClient.deleteComment(commentId);
      setComments(prev => prev.map(c => {
        if (c.id === commentId) return { ...c, is_deleted: true, content: '[Comment deleted by author]' };
        if (c.replies) {
          c.replies = c.replies.map(r => r.id === commentId ? { ...r, is_deleted: true, content: '[Comment deleted by author]' } : r);
        }
        return c;
      }));
    } catch {
      showToast('Failed to delete comment');
    }
  };

  // 8. Submit Report
  const handleSendReport = async () => {
    if (!reportingPostId) return;
    try {
      await socialApiClient.reportContent({
        target_type: 'post',
        target_id: reportingPostId,
        reason: reportReason
      });
      showToast('Report submitted for admin review. Thank you for keeping the sanctuary safe.');
      setReportingPostId(null);
    } catch {
      showToast('Failed to submit report');
    }
  };

  // 9. Share
  const handleShare = (post: SocialPostItem) => {
    if (navigator.share) {
      navigator.share({
        title: post.title || 'Soulverse Reflection',
        text: post.content,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      showToast('Link copied to clipboard');
    }
  };

  // Render nested comment item recursively
  const renderComment = (comment: SocialCommentItem) => (
    <div key={comment.id} className="space-y-2 text-xs">
      <div className={`p-3 rounded-2xl ${comment.is_deleted ? 'bg-white/[0.02] text-zinc-500' : 'bg-white/[0.04] text-zinc-200 border border-white/[0.06]'}`}>
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <img src={comment.author_avatar} alt={comment.author_name} className="w-5 h-5 rounded-full object-cover" />
            <span className="font-heading font-bold text-white text-[11px]">{comment.author_name}</span>
            <span className="text-[10px] text-zinc-500 font-mono">
              {new Date(comment.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>

          {!comment.is_deleted && (
            <div className="flex items-center gap-2 text-[10px] text-zinc-400">
              <button
                onClick={() => setReplyingToComment(comment)}
                className="hover:text-amber-300 font-semibold"
              >
                Reply
              </button>
              {comment.user_id === 'usr_me' && (
                <button
                  onClick={() => handleDeleteComment(comment.id)}
                  className="hover:text-rose-400"
                >
                  Delete
                </button>
              )}
            </div>
          )}
        </div>

        <p className="leading-relaxed">{comment.content}</p>
      </div>

      {/* Nested Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="pl-4 border-l border-white/10 space-y-2">
          {comment.replies.map(renderComment)}
        </div>
      )}
    </div>
  );

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 pb-20 animate-fadeIn text-zinc-100">
      
      {/* Toast Alert */}
      {toast && (
        <div className="fixed top-20 right-6 z-50 px-4 py-3 rounded-2xl bg-[#12131A] border border-amber-400/30 text-amber-300 text-xs font-semibold shadow-2xl flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* Top Feed Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-heading font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>COMMUNITY FEED & PERSPECTIVES</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-white">
            Sanctuary Social Stream
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400">
            Thoughtful expressions, life memories, and candid reflections from real humans.
          </p>
        </div>

        {/* Action Buttons: Express + Refresh */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-2.5 rounded-2xl bg-white/[0.05] hover:bg-white/[0.12] text-zinc-300 hover:text-white border border-white/10 transition-all active:scale-95"
            title="Refresh Feed"
          >
            <RefreshCw className={`w-4 h-4 text-amber-400 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={() => setIsComposerOpen(true)}
            className="px-4 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-[#090A0E] text-xs font-heading font-extrabold transition-all shadow-md flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create Post</span>
          </button>
        </div>
      </div>

      {/* Feed Mode Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
        {FEED_MODES.map(f => {
          const Icon = f.icon;
          const isActive = feedMode === f.mode;
          return (
            <button
              key={f.mode}
              onClick={() => setFeedMode(f.mode)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold shrink-0 transition-all flex items-center gap-2 border ${
                isActive
                  ? 'bg-white/15 text-white border-amber-400/40 shadow-sm'
                  : 'bg-white/[0.03] text-zinc-400 border-white/[0.06] hover:text-white hover:bg-white/[0.06]'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-400' : 'text-zinc-500'}`} />
              <span>{f.label}</span>
            </button>
          );
        })}
      </div>

      {/* Posts Stream */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="p-6 rounded-3xl dark-glass border border-white/10 animate-pulse space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/10" />
                <div className="space-y-1.5">
                  <div className="w-28 h-3.5 rounded bg-white/10" />
                  <div className="w-16 h-2.5 rounded bg-white/5" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="w-full h-3 rounded bg-white/10" />
                <div className="w-4/5 h-3 rounded bg-white/10" />
              </div>
            </div>
          ))}
        </div>
      ) : posts.length > 0 ? (
        <div className="space-y-5">
          {posts.map(post => {
            const hasWarning = Boolean(post.content_warning);
            const isRevealed = revealedWarnings.has(post.id);

            return (
              <article
                key={post.id}
                className="p-6 sm:p-7 rounded-3xl dark-glass border border-white/10 space-y-4 shadow-xl hover:border-white/20 transition-all relative overflow-hidden"
              >
                {/* Author & Header Metadata */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={post.author_avatar}
                      alt={post.author_name}
                      className="w-10 h-10 rounded-full object-cover border border-white/20 shadow-sm"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-heading font-extrabold text-white text-sm">
                          {post.author_name}
                        </span>
                        {post.author_username && (
                          <span className="text-xs text-zinc-500 font-mono">
                            @{post.author_username}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-zinc-400">
                        <span>{new Date(post.created_at).toLocaleDateString()}</span>
                        <span>•</span>
                        <span className="capitalize">{post.post_type}</span>
                        {post.visibility !== 'public' && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1 text-amber-400/90 capitalize">
                              <Lock className="w-2.5 h-2.5" />
                              <span>{post.visibility}</span>
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Context Menu Button */}
                  <div className="relative">
                    <button
                      onClick={() => setReportingPostId(post.id)}
                      className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
                      title="Report Content"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Content Warning Gate */}
                {hasWarning && !isRevealed ? (
                  <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs">
                      <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                      <span><strong>Content Warning:</strong> {post.content_warning}</span>
                    </div>
                    <button
                      onClick={() => setRevealedWarnings(new Set([...revealedWarnings, post.id]))}
                      className="px-3 py-1 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-white text-xs font-semibold"
                    >
                      Reveal
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Post Title */}
                    {post.title && (
                      <h2 className="text-base sm:text-lg font-heading font-extrabold text-white leading-snug">
                        {post.title}
                      </h2>
                    )}

                    {/* Post Text Body */}
                    <p className={`text-sm sm:text-base text-zinc-200 leading-relaxed font-body whitespace-pre-line ${
                      post.post_type === 'quote' ? 'italic border-l-2 border-amber-400/50 pl-4 py-1 text-zinc-100 font-serif' : ''
                    }`}>
                      {post.content}
                    </p>

                    {/* Attached Poll */}
                    {post.attachment_json && post.attachment_json.poll && (
                      <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2.5">
                        <span className="text-xs font-heading font-bold text-amber-300">
                          {post.attachment_json.poll.question || 'Poll'}
                        </span>
                        <div className="space-y-2">
                          {post.attachment_json.poll.options?.map((opt: any, idx: number) => (
                            <div key={idx} className="p-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white flex justify-between items-center">
                              <span>{opt.text}</span>
                              <span className="text-zinc-400 font-mono text-[11px]">{opt.vote_count || 0} votes</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Media Gallery */}
                    {post.media_urls && post.media_urls.length > 0 && (
                      <div className={`grid gap-2 rounded-2xl overflow-hidden ${
                        post.media_urls.length === 1 ? 'grid-cols-1' : 'grid-cols-2'
                      }`}>
                        {post.media_urls.map((url, idx) => (
                          <img
                            key={idx}
                            src={url}
                            alt="Post attachment"
                            className="w-full max-h-96 object-cover rounded-xl border border-white/10"
                          />
                        ))}
                      </div>
                    )}

                    {/* Hashtags */}
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {post.tags.map(tag => (
                          <span key={tag} className="text-xs font-mono text-amber-300 hover:underline cursor-pointer">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </>
                )}

                {/* Interaction Action Bar */}
                <div className="border-t border-white/10 pt-3 flex items-center justify-between text-xs text-zinc-400">
                  <div className="flex items-center gap-4 relative">
                    {/* Reaction Button & Picker */}
                    <div className="relative">
                      <button
                        onClick={() => handleReaction(post, 'like')}
                        onContextMenu={(e) => {
                          e.preventDefault();
                          setReactionPickerPostId(reactionPickerPostId === post.id ? null : post.id);
                        }}
                        className={`flex items-center gap-1.5 font-semibold transition-colors ${
                          post.is_liked ? 'text-rose-400' : 'hover:text-white'
                        }`}
                        title="Left click to like, right click for emotional reactions"
                      >
                        <Heart className={`w-4 h-4 ${post.is_liked ? 'fill-current' : ''}`} />
                        <span>{post.likes_count > 0 ? post.likes_count : 'Like'}</span>
                      </button>

                      {/* Emotional Reactions Tray */}
                      {reactionPickerPostId === post.id && (
                        <div className="absolute bottom-8 left-0 z-20 p-1.5 rounded-full bg-[#12131A] border border-white/20 shadow-2xl flex items-center gap-1">
                          {EMOTIONAL_REACTIONS.map(r => (
                            <button
                              key={r.type}
                              onClick={() => handleReaction(post, r.type)}
                              className="p-1.5 hover:scale-125 transition-transform text-base"
                              title={r.label}
                            >
                              {r.emoji}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Comments Button */}
                    <button
                      onClick={() => handleOpenComments(post)}
                      className="flex items-center gap-1.5 hover:text-white font-semibold transition-colors"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>{post.comments_count > 0 ? post.comments_count : 'Comment'}</span>
                    </button>

                    {/* Share Button */}
                    <button
                      onClick={() => handleShare(post)}
                      className="flex items-center gap-1.5 hover:text-white font-semibold transition-colors"
                    >
                      <Share2 className="w-4 h-4" />
                      <span>Share</span>
                    </button>
                  </div>

                  {/* Bookmark Button */}
                  <button
                    onClick={() => handleToggleBookmark(post)}
                    className={`p-1.5 rounded-xl transition-colors ${
                      post.is_bookmarked ? 'text-amber-400' : 'hover:text-white'
                    }`}
                    title="Bookmark Post"
                  >
                    <Bookmark className={`w-4 h-4 ${post.is_bookmarked ? 'fill-current' : ''}`} />
                  </button>
                </div>
              </article>
            );
          })}

          {/* Load More Pagination */}
          {hasMore && (
            <div className="text-center pt-4">
              <button
                onClick={() => loadFeed(feedMode, nextCursor)}
                className="px-6 py-2.5 rounded-2xl bg-white/[0.06] hover:bg-white/[0.12] text-zinc-200 text-xs font-semibold border border-white/10 transition-all"
              >
                Load More Expressions
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="p-12 text-center rounded-3xl dark-glass border border-white/10 text-zinc-400 space-y-3">
          <Sparkles className="w-8 h-8 mx-auto text-amber-400 opacity-50" />
          <p className="text-sm">No expressions found in this feed mode yet.</p>
          <button
            onClick={() => setIsComposerOpen(true)}
            className="px-4 py-2 rounded-xl bg-amber-400 text-[#090A0E] text-xs font-bold"
          >
            Be the First to Share
          </button>
        </div>
      )}

      {/* =================================================================== */}
      {/* THREADED COMMENTS DRAWER MODAL                                      */}
      {/* =================================================================== */}
      {activeCommentPost && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="w-full max-w-xl h-[85vh] sm:h-[650px] rounded-t-[32px] sm:rounded-3xl dark-glass border border-white/15 bg-[#0D0E14] flex flex-col shadow-2xl animate-slideUp">
            
            {/* Drawer Header */}
            <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-amber-400" />
                <h2 className="text-sm sm:text-base font-heading font-extrabold text-white">
                  Reflections & Discussion ({comments.length})
                </h2>
              </div>
              <button
                onClick={() => setActiveCommentPost(null)}
                className="p-1.5 rounded-xl text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Comments List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar">
              {comments.length > 0 ? (
                comments.map(renderComment)
              ) : (
                <div className="p-8 text-center text-zinc-500 text-xs">
                  No comments yet. Share your thoughtful response below.
                </div>
              )}
            </div>

            {/* Replying Banner */}
            {replyingToComment && (
              <div className="px-4 py-2 bg-amber-500/10 border-t border-amber-500/20 text-xs text-amber-300 flex items-center justify-between">
                <span>Replying to <strong>{replyingToComment.author_name}</strong></span>
                <button
                  onClick={() => setReplyingToComment(null)}
                  className="text-zinc-400 hover:text-white font-bold"
                >
                  Cancel
                </button>
              </div>
            )}

            {/* Comment Composer Input */}
            <div className="p-4 border-t border-white/10 bg-black/40 flex items-center gap-2">
              <input
                type="text"
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendComment();
                  }
                }}
                placeholder={replyingToComment ? `Reply to ${replyingToComment.author_name}...` : 'Share a thoughtful perspective...'}
                className="flex-1 px-4 py-2.5 rounded-2xl bg-white/[0.05] border border-white/10 text-white placeholder-zinc-500 text-xs focus:outline-none focus:border-amber-400/50"
              />
              <button
                onClick={handleSendComment}
                disabled={!newCommentText.trim() || isSubmittingComment}
                className="p-2.5 rounded-2xl bg-amber-400 text-[#090A0E] disabled:opacity-50 hover:bg-amber-300 transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* REPORT MODAL                                                        */}
      {/* =================================================================== */}
      {reportingPostId && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-3xl dark-glass border border-white/15 bg-[#12131A] p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-2 text-rose-400 font-heading font-extrabold text-sm">
              <ShieldAlert className="w-4 h-4" />
              <span>Report Expression</span>
            </div>
            <p className="text-xs text-zinc-400">
              Please choose a reason for reporting this content to sanctuary moderators:
            </p>
            <select
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-black border border-white/10 text-xs text-white focus:outline-none"
            >
              <option value="spam">Commercial Spam / Unwanted Promotion</option>
              <option value="harassment">Harassment or Hostile Behavior</option>
              <option value="hate_speech">Hate Speech or Discrimination</option>
              <option value="nudity">Explicit Sexual Content / Nudity</option>
              <option value="violence">Violence or Physical Threats</option>
              <option value="misinformation">Harmful Misinformation</option>
              <option value="other">Other Violation</option>
            </select>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setReportingPostId(null)}
                className="px-3 py-1.5 rounded-xl text-xs text-zinc-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleSendReport}
                className="px-4 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold"
              >
                Submit Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Post Composer Modal */}
      <PostComposerModal
        isOpen={isComposerOpen}
        onClose={() => setIsComposerOpen(false)}
        onPostCreated={(newPost) => {
          setPosts(prev => [newPost, ...prev]);
          showToast('Expression published to the sanctuary stream');
        }}
      />
    </div>
  );
};
