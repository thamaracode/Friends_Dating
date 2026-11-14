import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  Image,
  ListOrdered,
  Lock,
  Globe,
  Users,
  AlertTriangle,
  HelpCircle,
  Quote,
  Send,
  Plus,
  Trash2,
  Check,
  Smile
} from 'lucide-react';
import { socialApiClient } from '../../services/socialApiClient';
import { offlineContentDb, LocalPostDraft } from '../../services/offlineContentDb';
import { PostType, ContentVisibility, SocialPostItem } from '../../types/social';

interface PostComposerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPostCreated: (post: SocialPostItem) => void;
  initialPostType?: PostType;
}

const POST_FORMATS: { type: PostType; label: string; icon: any }[] = [
  { type: 'thought', label: 'Thought', icon: Sparkles },
  { type: 'reflection', label: 'Reflection', icon: HelpCircle },
  { type: 'story', label: 'Story', icon: Smile },
  { type: 'image', label: 'Image', icon: Image },
  { type: 'poll', label: 'Poll', icon: ListOrdered },
  { type: 'quote', label: 'Wisdom Quote', icon: Quote }
];

export const PostComposerModal: React.FC<PostComposerModalProps> = ({
  isOpen,
  onClose,
  onPostCreated,
  initialPostType = 'thought'
}) => {
  const [postType, setPostType] = useState<PostType>(initialPostType);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [visibility, setVisibility] = useState<ContentVisibility>('public');
  const [contentWarning, setContentWarning] = useState('');
  const [showWarningInput, setShowWarningInput] = useState(false);

  // Media URLs
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [newMediaInput, setNewMediaInput] = useState('');
  const [showMediaInput, setShowMediaInput] = useState(false);

  // Poll state (if postType === 'poll')
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState<string[]>(['', '']);

  // Local draft status
  const [draftSavedAt, setDraftSavedAt] = useState<number | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Load existing draft from Dexie.js on open
  useEffect(() => {
    if (!isOpen) return;
    offlineContentDb.getLatestPostDraft('usr_me').then(draft => {
      if (draft && !content.trim()) {
        setContent(draft.content || '');
        setTitle(draft.title || '');
        setPostType((draft.post_type as PostType) || 'thought');
        setVisibility((draft.visibility as ContentVisibility) || 'public');
        if (draft.media_urls) setMediaUrls(draft.media_urls);
        setDraftSavedAt(draft.updatedAt);
      }
    }).catch(() => {});
  }, [isOpen]);

  // Auto-save draft to IndexedDB on typing
  useEffect(() => {
    if (!content.trim() && !title.trim()) return;
    const timer = setTimeout(() => {
      const draftObj: LocalPostDraft = {
        id: 'draft_active',
        user_id: 'usr_me',
        post_type: postType,
        title: title.trim() || undefined,
        content: content.trim(),
        media_urls: mediaUrls,
        visibility,
        updatedAt: Date.now()
      };
      offlineContentDb.savePostDraft(draftObj).then(() => {
        setDraftSavedAt(Date.now());
      }).catch(() => {});
    }, 500);

    return () => clearTimeout(timer);
  }, [content, title, postType, visibility, mediaUrls]);

  if (!isOpen) return null;

  const handleAddMedia = () => {
    if (!newMediaInput.trim()) return;
    setMediaUrls([...mediaUrls, newMediaInput.trim()]);
    setNewMediaInput('');
    setShowMediaInput(false);
  };

  const handleRemoveMedia = (idx: number) => {
    setMediaUrls(mediaUrls.filter((_, i) => i !== idx));
  };

  const handleAddPollOption = () => {
    if (pollOptions.length < 6) {
      setPollOptions([...pollOptions, '']);
    }
  };

  const handlePollOptionChange = (idx: number, val: string) => {
    const updated = [...pollOptions];
    updated[idx] = val;
    setPollOptions(updated);
  };

  const handlePublish = async () => {
    if (!content.trim() && mediaUrls.length === 0 && postType !== 'poll') {
      setErrorMsg('Please write some content or attach media.');
      return;
    }

    if (postType === 'poll') {
      const validOptions = pollOptions.filter(o => o.trim().length > 0);
      if (validOptions.length < 2) {
        setErrorMsg('Polls require at least 2 non-empty options.');
        return;
      }
    }

    setIsPublishing(true);
    setErrorMsg(null);

    try {
      let attachmentJson = undefined;
      if (postType === 'poll') {
        attachmentJson = {
          poll: {
            question: pollQuestion.trim() || content.trim(),
            options: pollOptions.filter(o => o.trim().length > 0).map(text => ({ text, vote_count: 0 }))
          }
        };
      }

      const post = await socialApiClient.createPost({
        post_type: postType,
        title: title.trim() || undefined,
        content: content.trim() || (pollQuestion.trim() ? pollQuestion.trim() : 'Poll'),
        media_urls: mediaUrls,
        attachment_json: attachmentJson,
        visibility,
        content_warning: showWarningInput && contentWarning.trim() ? contentWarning.trim() : undefined,
        draft_id: 'draft_active'
      });

      onPostCreated(post);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to publish post');
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="w-full max-w-xl rounded-3xl dark-glass border border-white/15 bg-[#0D0E14] shadow-2xl p-6 sm:p-7 space-y-5 animate-scaleUp relative">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-300">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-heading font-extrabold text-white">Create Expression</h2>
              {draftSavedAt && (
                <p className="text-[10px] text-zinc-400 font-mono flex items-center gap-1">
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span>Draft saved locally in device</span>
                </p>
              )}
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Format Selector Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          {POST_FORMATS.map(f => {
            const Icon = f.icon;
            const isSelected = postType === f.type;
            return (
              <button
                key={f.type}
                onClick={() => setPostType(f.type)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all flex items-center gap-1.5 border ${
                  isSelected
                    ? 'bg-amber-400 text-[#090A0E] border-amber-400 shadow-sm'
                    : 'bg-white/[0.04] text-zinc-300 border-white/10 hover:bg-white/[0.08]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{f.label}</span>
              </button>
            );
          })}
        </div>

        {/* Title Input (Optional for Stories/Reflections) */}
        {(postType === 'story' || postType === 'reflection' || postType === 'quote') && (
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title or Topic (Optional)..."
            className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white placeholder-zinc-500 text-sm font-heading font-semibold focus:outline-none focus:border-amber-400/50"
          />
        )}

        {/* Content Body Textarea */}
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={
            postType === 'quote'
              ? 'Share a meaningful quotation or life principle...'
              : postType === 'reflection'
              ? 'What question or internal inquiry have you been pondering lately?'
              : 'Express what is on your mind... (#hashtags and @mentions supported)'
          }
          rows={5}
          className="w-full p-4 rounded-2xl bg-black/40 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400/50 text-sm font-body leading-relaxed resize-none"
        />

        {/* Poll Options Builder (If Poll Format) */}
        {postType === 'poll' && (
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
            <span className="text-xs font-heading font-bold text-amber-300">Poll Options</span>
            {pollOptions.map((opt, idx) => (
              <input
                key={idx}
                type="text"
                value={opt}
                onChange={(e) => handlePollOptionChange(idx, e.target.value)}
                placeholder={`Option ${idx + 1}...`}
                className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-xs placeholder-zinc-500 focus:outline-none focus:border-amber-400/40"
              />
            ))}
            {pollOptions.length < 6 && (
              <button
                type="button"
                onClick={handleAddPollOption}
                className="text-xs text-amber-300 font-semibold hover:text-white flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Option</span>
              </button>
            )}
          </div>
        )}

        {/* Media Attachments Gallery */}
        {mediaUrls.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {mediaUrls.map((url, idx) => (
              <div key={idx} className="w-20 h-20 rounded-xl overflow-hidden relative group shrink-0 border border-white/20">
                <img src={url} alt="Attachment" className="w-full h-full object-cover" />
                <button
                  onClick={() => handleRemoveMedia(idx)}
                  className="absolute top-1 right-1 p-1 rounded-full bg-black/70 text-rose-300 hover:text-white"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Add Media Input Drawer */}
        {showMediaInput && (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newMediaInput}
              onChange={(e) => setNewMediaInput(e.target.value)}
              placeholder="Paste Image URL..."
              className="flex-1 px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-xs placeholder-zinc-500 focus:outline-none focus:border-amber-400/40"
            />
            <button
              onClick={handleAddMedia}
              className="px-3 py-2 rounded-xl bg-white/10 text-white text-xs font-semibold hover:bg-white/20"
            >
              Add
            </button>
          </div>
        )}

        {/* Content Warning Input */}
        {showWarningInput && (
          <input
            type="text"
            value={contentWarning}
            onChange={(e) => setContentWarning(e.target.value)}
            placeholder="Content warning label (e.g. Vulnerable emotional topic, Grief)..."
            className="w-full px-3 py-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-200 text-xs placeholder-rose-300/50 focus:outline-none"
          />
        )}

        {/* Error Notice */}
        {errorMsg && (
          <p className="text-xs text-rose-400 bg-rose-500/10 p-2.5 rounded-xl border border-rose-500/20">
            {errorMsg}
          </p>
        )}

        {/* Bottom Toolbar & Action Cluster */}
        <div className="border-t border-white/10 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowMediaInput(!showMediaInput)}
              className="p-2 rounded-xl bg-white/[0.05] text-zinc-300 hover:text-white border border-white/10"
              title="Add Image URL"
            >
              <Image className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => setShowWarningInput(!showWarningInput)}
              className={`p-2 rounded-xl border transition-colors ${
                showWarningInput ? 'bg-amber-400/20 text-amber-300 border-amber-400/30' : 'bg-white/[0.05] text-zinc-300 hover:text-white border-white/10'
              }`}
              title="Add Content Warning"
            >
              <AlertTriangle className="w-4 h-4" />
            </button>

            {/* Audience Visibility Selector */}
            <select
              value={visibility}
              onChange={(e) => setVisibility(e.target.value as ContentVisibility)}
              className="bg-black/60 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-amber-400/40"
            >
              <option value="public">Public Sanctuary</option>
              <option value="connections">Connections Only</option>
              <option value="friends">Close Friends Only</option>
              <option value="private">Private (Vault)</option>
            </select>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handlePublish}
              disabled={isPublishing}
              className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-[#090A0E] text-xs font-bold transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isPublishing ? 'Publishing...' : 'Publish'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
