import React, { useState, useEffect } from 'react';
import { 
  Globe, 
  Plus, 
  ExternalLink, 
  Trash2, 
  Edit3, 
  Check, 
  X, 
  ShieldCheck, 
  Lock, 
  Eye, 
  ArrowUp, 
  ArrowDown, 
  Sparkles,
  MessageSquare,
  Music,
  Gamepad2,
  Video,
  AtSign,
  Radio,
  Tv,
  Send,
  Cloud,
  Palette,
  BookOpen,
  FileText
} from 'lucide-react';
import { chatClient } from '../services/chatApiClient';
import type { SocialLinkItem } from '../types';

interface DigitalLifeHubProps {
  userId?: string;
  isOwner?: boolean;
}

export const DigitalLifeHub: React.FC<DigitalLifeHubProps> = ({
  userId = 'usr_me',
  isOwner = true
}) => {
  const [links, setLinks] = useState<SocialLinkItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [inputUrl, setInputUrl] = useState('');
  const [customLabel, setCustomLabel] = useState('');
  const [selectedVisibility, setSelectedVisibility] = useState<'public' | 'matches_only' | 'private'>('public');
  const [recognizedPreview, setRecognizedPreview] = useState<any | null>(null);
  const [recognitionError, setRecognitionError] = useState<string | null>(null);

  // Load links from backend
  const loadLinks = async () => {
    setIsLoading(true);
    try {
      if (isOwner) {
        const myLinks = await chatClient.getMySocialLinks();
        setLinks(myLinks);
      } else {
        const publicLinks = await chatClient.getUserPublicSocialLinks(userId);
        setLinks(publicLinks);
      }
    } catch (e) {
      console.warn('Failed to load social links', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLinks();
  }, [userId, isOwner]);

  // URL recognition handler (debounced or on blur/change)
  const handleRecognizeUrl = async (urlToTest: string) => {
    setInputUrl(urlToTest);
    setRecognitionError(null);
    setRecognizedPreview(null);

    const trimmed = urlToTest.trim();
    if (!trimmed || trimmed.length < 5) return;

    setIsRecognizing(true);
    try {
      const res = await chatClient.recognizeSocialUrl(trimmed);
      if (res.success) {
        setRecognizedPreview(res);
        if (!customLabel) {
          setCustomLabel(res.platformName);
        }
      } else {
        setRecognitionError(res.error || 'Invalid profile URL');
      }
    } catch (e: any) {
      setRecognitionError('Could not recognize URL');
    } finally {
      setIsRecognizing(false);
    }
  };

  const handleConfirmAddLink = async () => {
    if (!recognizedPreview && !inputUrl) return;

    try {
      await chatClient.addSocialLink({
        url: inputUrl,
        customLabel: customLabel.trim() || undefined,
        visibility: selectedVisibility
      });
      await loadLinks();
      setIsAddModalOpen(false);
      setInputUrl('');
      setCustomLabel('');
      setRecognizedPreview(null);
      setRecognitionError(null);
    } catch (e: any) {
      setRecognitionError(e.message || 'Failed to add link');
    }
  };

  const handleDeleteLink = async (id: string) => {
    try {
      await chatClient.deleteSocialLink(id);
      setLinks(prev => prev.filter(l => l.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  const handleMoveOrder = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= links.length) return;

    const newLinks = [...links];
    const temp = newLinks[index];
    newLinks[index] = newLinks[targetIndex];
    newLinks[targetIndex] = temp;

    setLinks(newLinks);
    try {
      await chatClient.reorderSocialLinks(newLinks.map(l => l.id));
    } catch (e) {
      console.error(e);
    }
  };

  const getPlatformIcon = (iconName: string) => {
    switch (iconName?.toLowerCase()) {
      case 'instagram': return <Palette className="w-4 h-4" />;
      case 'github': return <FileText className="w-4 h-4" />;
      case 'twitter': return <Send className="w-4 h-4" />;
      case 'linkedin': return <ShieldCheck className="w-4 h-4" />;
      case 'messagesquare': return <MessageSquare className="w-4 h-4" />;
      case 'music': return <Music className="w-4 h-4" />;
      case 'gamepad2': return <Gamepad2 className="w-4 h-4" />;
      case 'youtube': return <Video className="w-4 h-4" />;
      case 'video': return <Video className="w-4 h-4" />;
      case 'atsign': return <AtSign className="w-4 h-4" />;
      case 'radio': return <Radio className="w-4 h-4" />;
      case 'tv': return <Tv className="w-4 h-4" />;
      case 'send': return <Send className="w-4 h-4" />;
      case 'cloud': return <Cloud className="w-4 h-4" />;
      case 'dribbble': return <Palette className="w-4 h-4" />;
      case 'palette': return <Palette className="w-4 h-4" />;
      case 'bookopen': return <BookOpen className="w-4 h-4" />;
      case 'filetext': return <FileText className="w-4 h-4" />;
      default: return <Globe className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-3 p-1">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#FF4F87]/20 flex items-center justify-center text-[#FF4F87]">
            <Globe className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-[#FFF1F3]">Digital Life</h3>
            <span className="text-[10px] text-[#B9A8B3]">Public profiles & creators</span>
          </div>
        </div>

        {isOwner && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-2.5 py-1 rounded-full pink-gradient-btn text-[11px] font-bold text-white flex items-center gap-1 cursor-pointer transition-transform active:scale-95 shadow-md"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Link</span>
          </button>
        )}
      </div>

      {/* Social Links Cards Grid */}
      {links.length === 0 ? (
        <div className="p-4 rounded-2xl glass-panel text-center text-xs text-[#7A6975] border border-dashed border-[#FF78A8]/20">
          <Globe className="w-6 h-6 mx-auto mb-1 text-[#FF78A8]/40" />
          <p>No social profiles connected yet.</p>
          {isOwner && <p className="text-[10px] text-[#FFB4CE] mt-0.5">Paste a public URL to showcase your creative and social footprint.</p>}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-2">
          {links.map((link, idx) => (
            <div
              key={link.id}
              className="p-3 rounded-2xl glass-panel-elevated border border-[#FF78A8]/20 flex items-center justify-between gap-3 group hover:border-[#FF4F87]/60 transition-all shadow-sm"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border border-white/10"
                  style={{ backgroundColor: link.badgeBg || 'rgba(255, 79, 135, 0.15)', color: link.color || '#FF4F87' }}
                >
                  {getPlatformIcon(link.iconName)}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-[#FFF1F3] truncate">
                      {link.customLabel || link.platformName}
                    </span>
                    {link.verificationStatus === 'SELF_DECLARED' && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-white/5 text-[#B9A8B3] border border-white/10">
                        Public URL
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    {link.username && (
                      <span className="text-[11px] text-[#FFB4CE] font-semibold truncate block">
                        {link.username}
                      </span>
                    )}
                    {isOwner && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-[#1B121D] text-[#7A6975] flex items-center gap-1">
                        {link.visibility === 'public' && <Eye className="w-2.5 h-2.5 text-emerald-400" />}
                        {link.visibility === 'matches_only' && <ShieldCheck className="w-2.5 h-2.5 text-amber-400" />}
                        {link.visibility === 'private' && <Lock className="w-2.5 h-2.5 text-rose-400" />}
                        <span className="capitalize">{link.visibility.replace('_', ' ')}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1 flex-shrink-0">
                {isOwner && (
                  <div className="flex items-center gap-0.5 mr-1">
                    <button
                      disabled={idx === 0}
                      onClick={() => handleMoveOrder(idx, 'up')}
                      className="w-6 h-6 rounded-lg glass-panel flex items-center justify-center text-[#B9A8B3] hover:text-white disabled:opacity-20 cursor-pointer"
                      title="Move Up"
                    >
                      <ArrowUp className="w-3 h-3" />
                    </button>
                    <button
                      disabled={idx === links.length - 1}
                      onClick={() => handleMoveOrder(idx, 'down')}
                      className="w-6 h-6 rounded-lg glass-panel flex items-center justify-center text-[#B9A8B3] hover:text-white disabled:opacity-20 cursor-pointer"
                      title="Move Down"
                    >
                      <ArrowDown className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleDeleteLink(link.id)}
                      className="w-6 h-6 rounded-lg glass-panel flex items-center justify-center text-[#B9A8B3] hover:text-rose-400 cursor-pointer ml-1"
                      title="Remove Link"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                )}

                <a
                  href={link.canonicalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-xl glass-panel flex items-center justify-center text-[#B9A8B3] hover:text-[#FF4F87] hover:scale-105 transition-all cursor-pointer"
                  title="Open in new safe window"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Public Social Link Modal */}
      {isAddModalOpen && (
        <div 
          onClick={() => setIsAddModalOpen(false)}
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-3xl glass-panel-elevated p-5 border border-[#FF78A8]/30 space-y-4 pink-ambient-glow"
          >
            <div className="flex items-center justify-between border-b border-[#FF78A8]/20 pb-3">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-[#FF4F87]" />
                <h3 className="text-xs font-bold text-[#FFF1F3]">Add Digital Life Link</h3>
              </div>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="w-6 h-6 rounded-full glass-panel flex items-center justify-center text-[#B9A8B3] hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Input URL */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-[#FFB4CE]">Public Profile URL</label>
              <input
                type="text"
                value={inputUrl}
                onChange={(e) => handleRecognizeUrl(e.target.value)}
                placeholder="https://instagram.com/username or github.com/..."
                className="w-full px-3 py-2.5 rounded-2xl glass-panel text-xs text-[#FFF1F3] placeholder-[#7A6975] focus:outline-none focus:border-[#FF4F87]"
              />
              <span className="text-[9px] text-[#7A6975] block">
                No passwords required. Just paste your publicly viewable profile URL.
              </span>
            </div>

            {/* Recognition Status / Preview */}
            {isRecognizing && (
              <div className="p-3 rounded-2xl glass-panel text-xs text-[#FFB4CE] flex items-center gap-2 animate-pulse">
                <Sparkles className="w-4 h-4 text-[#FF4F87]" />
                <span>Recognizing platform & verifying format...</span>
              </div>
            )}

            {recognitionError && (
              <div className="p-2.5 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs">
                {recognitionError}
              </div>
            )}

            {recognizedPreview && (
              <div className="p-3 rounded-2xl glass-panel border border-[#FF78A8]/40 space-y-2 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-xs"
                      style={{ backgroundColor: recognizedPreview.badgeBg, color: recognizedPreview.color }}
                    >
                      {getPlatformIcon(recognizedPreview.iconName)}
                    </div>
                    <div>
                      <span className="text-xs font-bold text-[#FFF1F3]">{recognizedPreview.platformName}</span>
                      <span className="text-[9px] text-[#B9A8B3] block capitalize">{recognizedPreview.category}</span>
                    </div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                    Recognized
                  </span>
                </div>

                {recognizedPreview.username && (
                  <div className="text-[11px] text-[#FFB4CE]">
                    <span className="text-[#7A6975]">Detected ID: </span>
                    <span className="font-bold">{recognizedPreview.username}</span>
                  </div>
                )}
              </div>
            )}

            {/* Custom Label */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-[#FFB4CE]">Display Label (Optional)</label>
              <input
                type="text"
                value={customLabel}
                onChange={(e) => setCustomLabel(e.target.value)}
                placeholder="e.g. My Photography, Portfolio, Gamer Tag"
                className="w-full px-3 py-2 rounded-2xl glass-panel text-xs text-[#FFF1F3] placeholder-[#7A6975] focus:outline-none focus:border-[#FF4F87]"
              />
            </div>

            {/* Visibility Selector */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-[#FFB4CE]">Privacy & Visibility</label>
              <div className="grid grid-cols-3 gap-1.5 text-xs">
                <button
                  type="button"
                  onClick={() => setSelectedVisibility('public')}
                  className={`py-2 px-1.5 rounded-xl border text-[10px] font-bold cursor-pointer transition-all ${
                    selectedVisibility === 'public'
                      ? 'bg-[#FF4F87] text-white border-[#FF4F87] shadow-sm'
                      : 'glass-panel text-[#B9A8B3] border-transparent hover:text-white'
                  }`}
                >
                  Public
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedVisibility('matches_only')}
                  className={`py-2 px-1.5 rounded-xl border text-[10px] font-bold cursor-pointer transition-all ${
                    selectedVisibility === 'matches_only'
                      ? 'bg-[#FF4F87] text-white border-[#FF4F87] shadow-sm'
                      : 'glass-panel text-[#B9A8B3] border-transparent hover:text-white'
                  }`}
                >
                  Matches Only
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedVisibility('private')}
                  className={`py-2 px-1.5 rounded-xl border text-[10px] font-bold cursor-pointer transition-all ${
                    selectedVisibility === 'private'
                      ? 'bg-[#FF4F87] text-white border-[#FF4F87] shadow-sm'
                      : 'glass-panel text-[#B9A8B3] border-transparent hover:text-white'
                  }`}
                >
                  Private
                </button>
              </div>
            </div>

            {/* Confirm Button */}
            <button
              onClick={handleConfirmAddLink}
              disabled={!inputUrl || isRecognizing}
              className="w-full py-2.5 rounded-2xl pink-gradient-btn text-xs font-bold text-white disabled:opacity-40 disabled:pointer-events-none cursor-pointer shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Confirm & Add to Profile</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
