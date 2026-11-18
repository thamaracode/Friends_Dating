import React, { useState, useEffect } from 'react';
import {
  X,
  Heart,
  MessageCircle,
  CornerDownRight,
  Send,
  Loader2,
  Trash2,
  Share2
} from 'lucide-react';
import { socialApiClient } from '../../services/socialApiClient';
import type { SocialPostItem, SocialCommentItem } from '../../types/social';

interface PostDetailCommentsModalProps {
  post: SocialPostItem | null;
  onClose: () => void;
  onCommentAdded?: (comment: SocialCommentItem) => void;
  onOpenCreatorProfile?: (userId: string) => void;
}

export const PostDetailCommentsModal: React.FC<PostDetailCommentsModalProps> = ({
  post,
  onClose,
  onCommentAdded,
  onOpenCreatorProfile
}) => {
  const [comments, setComments] = useState<SocialCommentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCommentText, setNewCommentText] = useState('');
  const [replyingTo, setReplyingTo] = useState<SocialCommentItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!post) return;
    setLoading(true);
    socialApiClient.getComments('post', post.id)
      .then(res => setComments(res))
      .catch(err => console.error('Failed to load comments:', err))
      .finally(() => setLoading(false));
  }, [post?.id]);

  if (!post) return null;

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    try {
      setIsSubmitting(true);
      const comment = await socialApiClient.addComment({
        target_type: 'post',
        target_id: post.id,
        content: newCommentText.trim(),
        parent_comment_id: replyingTo ? replyingTo.id : undefined
      });

      setComments(prev => [...prev, comment]);
      setNewCommentText('');
      setReplyingTo(null);
      if (onCommentAdded) onCommentAdded(comment);
    } catch (err) {
      console.error('Failed to add comment:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLikeComment = async (commentId: string) => {
    try {
      await socialApiClient.toggleReaction({
        target_type: 'comment',
        target_id: commentId,
        reaction_type: 'like'
      });
      setComments(prev => prev.map(c => {
        if (c.id === commentId) {
          const isLiked = !c.is_liked;
          return {
            ...c,
            is_liked: isLiked,
            likes_count: isLiked ? c.likes_count + 1 : Math.max(0, c.likes_count - 1)
          };
        }
        return c;
      }));
    } catch (err) {
      console.error('Failed to like comment:', err);
    }
  };

  // Group top-level comments and replies
  const topLevelComments = comments.filter(c => !c.parent_comment_id);
  const getReplies = (parentId: string) => comments.filter(c => c.parent_comment_id === parentId);

  return (
    <div className="fixed inset-0 z-50 bg-[#0A0B0F]/90 backdrop-blur-xl flex items-center justify-center p-2 sm:p-4 animate-fadeIn font-body">
      <div className="w-full max-w-2xl bg-[#12131A] border border-white/[0.1] rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-4 h-4 text-rose-400" />
            <h2 className="text-base font-heading font-bold text-white tracking-tight">
              Discussion & Reflections
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-white/[0.06] text-xs font-mono text-zinc-400">
              {comments.length}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Context + Comments */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-6">
          
          {/* Post Snippet Header */}
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] space-y-2">
            <div className="flex items-center gap-3">
              <img
                src={post.author_avatar}
                alt={post.author_name}
                className="w-9 h-9 rounded-full object-cover border border-white/10"
              />
              <div>
                <span className="text-xs font-bold text-white font-heading block">
                  {post.author_name}
                </span>
                <span className="text-[11px] text-zinc-500 font-mono">
                  @{post.author_username || 'creator'}
                </span>
              </div>
            </div>

            {post.title && (
              <h3 className="text-sm font-heading font-bold text-white pt-1">
                {post.title}
              </h3>
            )}
            
            <p className="text-xs text-zinc-300 leading-relaxed line-clamp-3">
              {post.content}
            </p>
          </div>

          {/* Comments List */}
          <div className="space-y-4">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12 text-zinc-500 gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-rose-500" />
                <span className="text-xs">Loading reflections...</span>
              </div>
            ) : topLevelComments.length === 0 ? (
              <div className="text-center py-12 text-zinc-500 space-y-2">
                <MessageCircle className="w-8 h-8 mx-auto text-zinc-600 stroke-1" />
                <p className="text-xs">Be the first to share your contemplation on this thought.</p>
              </div>
            ) : (
              topLevelComments.map(comment => {
                const replies = getReplies(comment.id);
                return (
                  <div key={comment.id} className="space-y-3">
                    {/* Top Level Comment Item */}
                    <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.05] space-y-2">
                      <div className="flex items-center justify-between">
                        <div
                          className="flex items-center gap-2.5 cursor-pointer"
                          onClick={() => onOpenCreatorProfile && onOpenCreatorProfile(comment.user_id)}
                        >
                          <img
                            src={comment.author_avatar}
                            alt={comment.author_name}
                            className="w-7 h-7 rounded-full object-cover border border-white/10"
                          />
                          <div>
                            <span className="text-xs font-bold text-white font-heading">
                              {comment.author_name}
                            </span>
                            <span className="text-[10px] text-zinc-500 font-mono ml-1.5">
                              {new Date(comment.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => handleLikeComment(comment.id)}
                          className={`flex items-center gap-1 text-xs cursor-pointer transition-colors ${
                            comment.is_liked ? 'text-rose-400 font-bold' : 'text-zinc-500 hover:text-white'
                          }`}
                        >
                          <Heart className={`w-3.5 h-3.5 ${comment.is_liked ? 'fill-rose-500 text-rose-500' : ''}`} />
                          {comment.likes_count > 0 && <span>{comment.likes_count}</span>}
                        </button>
                      </div>

                      <p className="text-xs text-zinc-300 leading-relaxed pl-9">
                        {comment.content}
                      </p>

                      <div className="pl-9 pt-1 flex items-center gap-3">
                        <button
                          onClick={() => setReplyingTo(comment)}
                          className="text-[11px] font-semibold text-rose-400/80 hover:text-rose-300 transition-colors cursor-pointer"
                        >
                          Reply
                        </button>
                      </div>
                    </div>

                    {/* Replies */}
                    {replies.length > 0 && (
                      <div className="pl-6 space-y-2 border-l border-white/[0.08]">
                        {replies.map(reply => (
                          <div key={reply.id} className="p-3 rounded-2xl bg-white/[0.015] border border-white/[0.04] space-y-1.5">
                            <div className="flex items-center justify-between">
                              <div
                                className="flex items-center gap-2 cursor-pointer"
                                onClick={() => onOpenCreatorProfile && onOpenCreatorProfile(reply.user_id)}
                              >
                                <img
                                  src={reply.author_avatar}
                                  alt={reply.author_name}
                                  className="w-6 h-6 rounded-full object-cover border border-white/10"
                                />
                                <span className="text-xs font-bold text-white font-heading">
                                  {reply.author_name}
                                </span>
                              </div>
                              <button
                                onClick={() => handleLikeComment(reply.id)}
                                className={`flex items-center gap-1 text-xs cursor-pointer transition-colors ${
                                  reply.is_liked ? 'text-rose-400 font-bold' : 'text-zinc-500 hover:text-white'
                                }`}
                              >
                                <Heart className={`w-3 h-3 ${reply.is_liked ? 'fill-rose-500 text-rose-500' : ''}`} />
                                {reply.likes_count > 0 && <span>{reply.likes_count}</span>}
                              </button>
                            </div>
                            <p className="text-xs text-zinc-300 leading-relaxed pl-8">
                              {reply.content}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Reply To Banner */}
        {replyingTo && (
          <div className="px-6 py-2 bg-rose-500/10 border-t border-rose-500/20 flex items-center justify-between text-xs text-rose-300">
            <span className="flex items-center gap-1.5 truncate">
              <CornerDownRight className="w-3.5 h-3.5 shrink-0" />
              Replying to <strong className="font-bold">{replyingTo.author_name}</strong>
            </span>
            <button
              onClick={() => setReplyingTo(null)}
              className="p-1 text-rose-300 hover:text-white cursor-pointer"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Input Bar */}
        <form onSubmit={handleSubmitComment} className="p-4 border-t border-white/[0.08] bg-[#0E0F15] flex items-center gap-2">
          <input
            type="text"
            value={newCommentText}
            onChange={e => setNewCommentText(e.target.value)}
            placeholder={replyingTo ? `Write reply to ${replyingTo.author_name}...` : 'Share a genuine thought or reaction...'}
            className="flex-1 px-4 py-2.5 rounded-2xl bg-white/[0.04] border border-white/[0.08] text-white text-xs placeholder:text-zinc-500 focus:outline-none focus:border-rose-500/50"
          />
          <button
            type="submit"
            disabled={isSubmitting || !newCommentText.trim()}
            className="p-2.5 rounded-2xl bg-rose-600 hover:bg-rose-500 disabled:opacity-40 text-white transition-all cursor-pointer disabled:cursor-not-allowed shrink-0"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </form>

      </div>
    </div>
  );
};
