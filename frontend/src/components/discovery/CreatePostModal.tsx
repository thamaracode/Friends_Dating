import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Quote,
  HelpCircle,
  Image as ImageIcon,
  ListOrdered,
  BookOpen,
  Music,
  Send,
  Plus,
  Trash2,
  Lock,
  Globe,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { socialApiClient } from '../../services/socialApiClient';
import type { PostType, ContentVisibility, SocialPostItem } from '../../types/social';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPostCreated: (post: SocialPostItem) => void;
  initialPostType?: PostType;
}

const POST_TYPES: { type: PostType; label: string; icon: any; placeholder: string }[] = [
  { type: 'thought', label: 'Thought', icon: Sparkles, placeholder: 'Share a contemplation or insight...' },
  { type: 'quote', label: 'Quote', icon: Quote, placeholder: 'An original or resonant quote...' },
  { type: 'question', label: 'Question', icon: HelpCircle, placeholder: 'Ask a deep question to the sanctuary...' },
  { type: 'story', label: 'Personal Story', icon: BookOpen, placeholder: 'A personal experience, memory, or essay...' },
  { type: 'image', label: 'Visual Art', icon: ImageIcon, placeholder: 'Describe your photography or artwork...' },
  { type: 'poll', label: 'Inquiry Poll', icon: ListOrdered, placeholder: 'What perspective would you like to explore?' },
  { type: 'thought', label: 'Audio / Music', icon: Music, placeholder: 'Share a sonic contemplation or track recommendation...' }
];

export const CreatePostModal: React.FC<CreatePostModalProps> = ({
  isOpen,
  onClose,
  onPostCreated,
  initialPostType = 'thought'
}) => {
  const [selectedType, setSelectedType] = useState<PostType>(initialPostType);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [mediaUrlInput, setMediaUrlInput] = useState('');
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [visibility, setVisibility] = useState<ContentVisibility>('public');
  const [contentWarning, setContentWarning] = useState('');
  const [showWarningInput, setShowWarningInput] = useState(false);

  // Quote Metadata
  const [quoteAuthor, setQuoteAuthor] = useState('');
  const [quoteSource, setQuoteSource] = useState('');

  // Poll Options
  const [pollOptions, setPollOptions] = useState<string[]>(['Option A', 'Option B']);

  // Music Metadata
  const [musicTitle, setMusicTitle] = useState('');
  const [musicArtist, setMusicArtist] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAddMedia = () => {
    if (mediaUrlInput.trim()) {
      setMediaUrls([...mediaUrls, mediaUrlInput.trim()]);
      setMediaUrlInput('');
    }
  };

  const handleRemoveMedia = (index: number) => {
    setMediaUrls(mediaUrls.filter((_, i) => i !== index));
  };

  const handlePollOptionChange = (idx: number, val: string) => {
    const updated = [...pollOptions];
    updated[idx] = val;
    setPollOptions(updated);
  };

  const handleAddPollOption = () => {
    if (pollOptions.length < 5) {
      setPollOptions([...pollOptions, `Option ${String.fromCharCode(65 + pollOptions.length)}`]);
    }
  };

  const handleRemovePollOption = (idx: number) => {
    if (pollOptions.length > 2) {
      setPollOptions(pollOptions.filter((_, i) => i !== idx));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      setErrorMsg('Please enter your thoughts or contemplation.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg(null);

      // Extract and combine tags
      const userTags = tagsInput
        .split(/[,\s]+/)
        .map(t => t.trim())
        .filter(Boolean)
        .map(t => (t.startsWith('#') ? t : `#${t}`));

      let attachmentJson: any = {};

      if (selectedType === 'quote' && (quoteAuthor || quoteSource)) {
        attachmentJson.quote_author = quoteAuthor || 'Unknown';
        attachmentJson.quote_source = quoteSource || undefined;
      }

      if (selectedType === 'poll') {
        attachmentJson.poll_id = `poll_${Date.now()}`;
        attachmentJson.question = title || content.slice(0, 80);
        attachmentJson.options = pollOptions.map((opt, i) => ({
          id: `opt_${i + 1}`,
          text: opt || `Option ${i + 1}`,
          votes: 0
        }));
        attachmentJson.total_votes = 0;
      }

      if (musicTitle || musicArtist) {
        attachmentJson.audio_track = {
          title: musicTitle || 'Soundscape Reflection',
          artist: musicArtist || 'Soulverse Sanctuary',
          duration_seconds: 180
        };
      }

      const post = await socialApiClient.createPost({
        post_type: selectedType,
        title: title.trim() || undefined,
        content: content.trim() + (userTags.length > 0 ? `\n\n${userTags.join(' ')}` : ''),
        media_urls: mediaUrls,
        attachment_json: Object.keys(attachmentJson).length > 0 ? attachmentJson : undefined,
        visibility,
        content_warning: contentWarning.trim() || undefined
      });

      onPostCreated(post);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to publish post');
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentTypeConfig = POST_TYPES.find(p => p.type === selectedType) || POST_TYPES[0];

  return (
    <div className="fixed inset-0 z-50 bg-[#0A0B0F]/90 backdrop-blur-xl flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn font-body">
      <div className="w-full max-w-xl bg-[#12131A] border border-white/[0.1] rounded-3xl shadow-2xl overflow-hidden my-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            <h2 className="text-lg font-heading font-bold text-white tracking-tight">
              Create Expression
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Type Selector */}
        <div className="px-6 pt-4 pb-2 border-b border-white/[0.06] overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1.5 min-w-max">
            {POST_TYPES.map((pt, i) => {
              const Icon = pt.icon;
              const isSelected = selectedType === pt.type;
              return (
                <button
                  key={`${pt.type}-${i}`}
                  type="button"
                  onClick={() => setSelectedType(pt.type)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm'
                      : 'bg-white/[0.04] text-zinc-400 hover:text-white border border-white/[0.06]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{pt.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {errorMsg && (
            <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Title (Optional) */}
          <div>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Title or Topic (Optional)"
              className="w-full px-4 py-2.5 rounded-2xl bg-white/[0.04] border border-white/[0.08] text-white text-sm placeholder:text-zinc-500 focus:outline-none focus:border-rose-500/50 font-heading font-medium"
            />
          </div>

          {/* Main Content Area */}
          <div>
            <textarea
              rows={selectedType === 'story' ? 6 : 4}
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder={currentTypeConfig.placeholder}
              className="w-full px-4 py-3 rounded-2xl bg-white/[0.04] border border-white/[0.08] text-white text-sm placeholder:text-zinc-500 focus:outline-none focus:border-rose-500/50 resize-none leading-relaxed"
            />
          </div>

          {/* Quote Fields */}
          {selectedType === 'quote' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
              <input
                type="text"
                value={quoteAuthor}
                onChange={e => setQuoteAuthor(e.target.value)}
                placeholder="Author / Thinker (e.g. Marcus Aurelius)"
                className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-xs placeholder:text-zinc-500 focus:outline-none focus:border-rose-500/50"
              />
              <input
                type="text"
                value={quoteSource}
                onChange={e => setQuoteSource(e.target.value)}
                placeholder="Work / Source (e.g. Meditations)"
                className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-xs placeholder:text-zinc-500 focus:outline-none focus:border-rose-500/50"
              />
            </div>
          )}

          {/* Poll Options */}
          {selectedType === 'poll' && (
            <div className="space-y-2 p-3 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
              <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-bold block mb-1">
                Poll Options
              </span>
              {pollOptions.map((opt, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="w-5 text-center text-xs font-mono text-zinc-500">
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <input
                    type="text"
                    value={opt}
                    onChange={e => handlePollOptionChange(idx, e.target.value)}
                    placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                    className="flex-1 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-xs placeholder:text-zinc-500 focus:outline-none focus:border-rose-500/50"
                  />
                  {pollOptions.length > 2 && (
                    <button
                      type="button"
                      onClick={() => handleRemovePollOption(idx)}
                      className="p-1 text-zinc-500 hover:text-rose-400 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
              {pollOptions.length < 5 && (
                <button
                  type="button"
                  onClick={handleAddPollOption}
                  className="mt-1 text-xs text-rose-400 hover:text-rose-300 font-medium flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Option</span>
                </button>
              )}
            </div>
          )}

          {/* Media URL Input */}
          {(selectedType === 'image' || selectedType === 'story') && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={mediaUrlInput}
                  onChange={e => setMediaUrlInput(e.target.value)}
                  placeholder="Paste photograph or artwork URL (https://...)"
                  className="flex-1 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-xs placeholder:text-zinc-500 focus:outline-none focus:border-rose-500/50"
                />
                <button
                  type="button"
                  onClick={handleAddMedia}
                  className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all cursor-pointer"
                >
                  Add Image
                </button>
              </div>

              {mediaUrls.length > 0 && (
                <div className="flex items-center gap-2 overflow-x-auto py-1">
                  {mediaUrls.map((url, i) => (
                    <div key={i} className="relative w-16 h-16 rounded-xl overflow-hidden border border-white/20 shrink-0">
                      <img src={url} alt="Uploaded media preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemoveMedia(i)}
                        className="absolute top-1 right-1 p-0.5 rounded-full bg-black/70 text-white hover:bg-rose-600 transition-colors cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tags */}
          <div>
            <input
              type="text"
              value={tagsInput}
              onChange={e => setTagsInput(e.target.value)}
              placeholder="Tags (e.g. #philosophy, #cinema, #slowliving)"
              className="w-full px-4 py-2 rounded-2xl bg-white/[0.04] border border-white/[0.08] text-white text-xs placeholder:text-zinc-500 focus:outline-none focus:border-rose-500/50 font-mono"
            />
          </div>

          {/* Sensitive warning toggle */}
          {showWarningInput ? (
            <div>
              <input
                type="text"
                value={contentWarning}
                onChange={e => setContentWarning(e.target.value)}
                placeholder="Content warning details (e.g. Sensitive mental health discussion)"
                className="w-full px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs placeholder:text-amber-500/60 focus:outline-none"
              />
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowWarningInput(true)}
              className="text-[11px] text-zinc-500 hover:text-zinc-300 flex items-center gap-1 cursor-pointer"
            >
              <AlertTriangle className="w-3 h-3" />
              <span>Add sensitive content warning</span>
            </button>
          )}

          {/* Footer Controls */}
          <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <select
                value={visibility}
                onChange={e => setVisibility(e.target.value as ContentVisibility)}
                className="px-2.5 py-1.5 rounded-xl bg-white/[0.05] border border-white/[0.1] text-xs font-medium text-zinc-300 focus:outline-none cursor-pointer"
              >
                <option value="public" className="bg-[#12131A] text-white">Public Sanctuary</option>
                <option value="connections" className="bg-[#12131A] text-white">Connections Only</option>
                <option value="friends" className="bg-[#12131A] text-white">Friends Only</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !content.trim()}
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-lg shadow-rose-900/30 cursor-pointer disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Publishing...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Publish</span>
                  </>
                )}
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};
