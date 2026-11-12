import React, { useState, useEffect, useRef } from 'react';
import { 
  FileText, 
  Eye, 
  Edit3, 
  Columns, 
  Save, 
  Lock, 
  Globe, 
  Heart, 
  Users, 
  Bold, 
  Italic, 
  Strikethrough, 
  Quote, 
  Code, 
  List, 
  ListOrdered, 
  CheckSquare, 
  Table as TableIcon, 
  Link2, 
  Minus, 
  Sparkles, 
  Trash2, 
  Check, 
  AlertCircle,
  FolderGit2
} from 'lucide-react';
import { GitHubMarkdownRenderer } from './GitHubMarkdownRenderer';
import { markdownProfileClient } from '../services/markdownProfileApiClient';
import type { MarkdownVisibility, ProfileMarkdown } from '../types/markdownProfile';

interface GitHubMarkdownEditorProps {
  userId?: string;
  isOwner?: boolean;
  onClose?: () => void;
  onSaved?: (markdown: ProfileMarkdown) => void;
}

const MAX_CHARACTERS = 5000;

export const GitHubMarkdownEditor: React.FC<GitHubMarkdownEditorProps> = ({
  userId = 'usr_me',
  isOwner = true,
  onClose,
  onSaved
}) => {
  const [markdownTitle, setMarkdownTitle] = useState('README.md');
  const [content, setContent] = useState('');
  const [visibility, setVisibility] = useState<MarkdownVisibility>('public');
  const [viewMode, setViewMode] = useState<'write' | 'preview' | 'split'>('write');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    loadMarkdown();
  }, [userId]);

  const loadMarkdown = async () => {
    try {
      setIsLoading(true);
      setErrorMsg(null);
      const res = await markdownProfileClient.getMarkdown(userId);
      if (res.markdown) {
        setMarkdownTitle(res.markdown.title || 'README.md');
        setContent(res.markdown.content || '');
        setVisibility(res.markdown.visibility || 'public');
      }
    } catch (err) {
      console.error('Failed to load markdown:', err);
      setErrorMsg('Failed to load markdown manifesto');
    } finally {
      setIsLoading(false);
    }
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    if (val.length <= MAX_CHARACTERS) {
      setContent(val);
      setErrorMsg(null);
    } else {
      // Cut to limit
      setContent(val.slice(0, MAX_CHARACTERS));
      setErrorMsg(`Maximum limit of ${MAX_CHARACTERS} characters reached.`);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const pasteText = e.clipboardData.getData('text');
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newLength = content.length - (end - start) + pasteText.length;

    if (newLength > MAX_CHARACTERS) {
      e.preventDefault();
      const allowedLength = MAX_CHARACTERS - (content.length - (end - start));
      const truncated = pasteText.slice(0, allowedLength);
      const updated = content.slice(0, start) + truncated + content.slice(end);
      setContent(updated);
      setErrorMsg(`Pasted content truncated to fit ${MAX_CHARACTERS} characters limit.`);
    }
  };

  // Helper to insert markdown syntax at cursor
  const insertSyntax = (before: string, after: string = '', defaultText: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = content.substring(start, end) || defaultText;

    const replacement = `${before}${selected}${after}`;
    const newContent = content.substring(0, start) + replacement + content.substring(end);

    if (newContent.length > MAX_CHARACTERS) {
      setErrorMsg(`Cannot insert syntax: would exceed ${MAX_CHARACTERS} character limit.`);
      return;
    }

    setContent(newContent);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + selected.length);
    }, 10);
  };

  const handleSave = async () => {
    if (!isOwner) return;
    try {
      setIsSaving(true);
      setErrorMsg(null);
      const res = await markdownProfileClient.saveMarkdown({
        userId,
        title: markdownTitle,
        content,
        visibility
      });

      if (res.success && res.markdown) {
        setSaveSuccess(true);
        if (onSaved) onSaved(res.markdown);
        setTimeout(() => setSaveSuccess(false), 2500);
      } else {
        setErrorMsg(res.error || 'Failed to save markdown');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error communicating with server');
    } finally {
      setIsSaving(false);
    }
  };

  const loadStarterTemplate = (type: 'manifesto' | 'checklists' | 'hyperfixations' | 'engagement') => {
    let tpl = '';
    if (type === 'manifesto') {
      tpl = `# 🧭 My Personal Manifesto & Worldview\n\n> *"The unexamined life is not worth living."* — Socrates\n\n### ⚡ Principles I Live By\n1. **Radical Authenticity:** I would rather be rejected for who I am than adored for a curated mask.\n2. **Creative Sovereignty:** Direct your hours toward things you own and love.\n3. **Silence & Depth:** High-signal conversations over high-volume noise.\n\n\`\`\`ts\nconst myVibe = {\n  coffee: "Pour-over black",\n  deepTalks: true,\n  noiseTolerance: "Zero"\n};\n\`\`\`\n`;
    } else if (type === 'checklists') {
      tpl = `### 🎯 2026 Life Quests & Checklists\n\n- [x] Unsubscribe from performative social rituals\n- [x] Build resilient local-first applications\n- [ ] Complete 100km alpine wilderness traverse\n- [ ] Print physical photography book\n- [ ] Read 30 books outside my domain\n`;
    } else if (type === 'hyperfixations') {
      tpl = `### 📊 Current Obsessions & Preferences\n\n| Focus Area | What Excites Me | What Drains Me |\n| :--- | :--- | :--- |\n| **Software** | Zero-latency SQLite & CRDTs | Endless meetings |\n| **Culture** | Neo-noir cinema & architecture | Surface small talk |\n| **Weekends** | Mountain trail runs at 6am | Crowded bars |\n`;
    } else if (type === 'engagement') {
      tpl = `### 📬 Rules of Engagement (How to Talk to Me)\n\n> [!NOTE]\n> Skip the pleasantries — tell me what you spent 4 hours thinking about yesterday.\n\n1. Voice notes > Endless one-word texts.\n2. Spontaneous invitations for tea are always celebrated.\n3. If you disagree with me, tell me directly — I love thoughtful debate.\n`;
    }

    if (content.trim()) {
      const combined = `${content.trim()}\n\n${tpl}`;
      if (combined.length <= MAX_CHARACTERS) {
        setContent(combined);
      } else {
        setErrorMsg('Template exceeds remaining character limit.');
      }
    } else {
      setContent(tpl);
    }
  };

  const charCount = content.length;
  const remaining = MAX_CHARACTERS - charCount;
  const charPercentage = (charCount / MAX_CHARACTERS) * 100;

  // Color coding for character progress
  let progressColor = 'bg-emerald-400';
  let badgeColor = 'text-emerald-400 border-emerald-500/30';
  if (charPercentage > 90) {
    progressColor = 'bg-rose-500';
    badgeColor = 'text-rose-400 border-rose-500/40 bg-rose-950/20';
  } else if (charPercentage > 75) {
    progressColor = 'bg-amber-400';
    badgeColor = 'text-amber-400 border-amber-500/30 bg-amber-950/20';
  }

  return (
    <div className="w-full flex flex-col bg-[#0F020B] rounded-3xl border border-[#FFFFFF]/30 shadow-2xl overflow-hidden animate-fadeIn">
      {/* GitHub Top Header Bar */}
      <div className="px-4 py-3 bg-[#1A0515] border-b border-[#FFFFFF]/20 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#FFFFFF] to-[#E5E7EB] flex items-center justify-center text-white shadow-md">
            <FolderGit2 className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-[#E5E7EB]">@{userId}</span>
              <span className="text-xs text-[#6B7280]">/</span>
              {isOwner ? (
                <input
                  type="text"
                  value={markdownTitle}
                  onChange={(e) => setMarkdownTitle(e.target.value)}
                  className="bg-black/30 text-xs font-mono font-bold text-[#F3F4F6] border border-[rgba(255,255,255,0.20)]/30 rounded-lg px-2 py-0.5 focus:outline-none focus:border-[#FFFFFF] w-32"
                />
              ) : (
                <span className="text-xs font-mono font-bold text-[#F3F4F6]">{markdownTitle}</span>
              )}
            </div>
            <p className="text-[10px] text-[#9CA3AF]">GitHub-Flavored Markdown (GFM) Document</p>
          </div>
        </div>

        {/* View Switcher: Write | Preview | Split */}
        <div className="flex items-center gap-2">
          <div className="flex p-0.5 rounded-xl bg-black/40 border border-[rgba(255,255,255,0.20)]/20 text-xs">
            <button
              onClick={() => setViewMode('write')}
              className={`px-3 py-1 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'write' ? 'bg-[#FFFFFF] text-white shadow-sm' : 'text-[#9CA3AF] hover:text-[#F3F4F6]'
              }`}
            >
              <Edit3 className="w-3 h-3" />
              <span>Write</span>
            </button>
            <button
              onClick={() => setViewMode('preview')}
              className={`px-3 py-1 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'preview' ? 'bg-[#FFFFFF] text-white shadow-sm' : 'text-[#9CA3AF] hover:text-[#F3F4F6]'
              }`}
            >
              <Eye className="w-3 h-3" />
              <span>Preview</span>
            </button>
            <button
              onClick={() => setViewMode('split')}
              className={`hidden md:flex px-3 py-1 rounded-lg font-bold items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'split' ? 'bg-[#FFFFFF] text-white shadow-sm' : 'text-[#9CA3AF] hover:text-[#F3F4F6]'
              }`}
            >
              <Columns className="w-3 h-3" />
              <span>Split</span>
            </button>
          </div>

          {/* Save Action */}
          {isOwner && (
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#FFFFFF] to-[#E5E7EB] hover:brightness-110 text-white font-bold text-xs flex items-center gap-1.5 shadow-md hover:scale-102 active:scale-98 transition-all cursor-pointer disabled:opacity-50"
            >
              {saveSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Saved!</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSaving ? 'Saving...' : 'Commit Changes'}</span>
                </>
              )}
            </button>
          )}

          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-[#9CA3AF] hover:text-white transition-colors cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Editor Sub-Header: Toolbar & 5,000 Char Counter */}
      {isOwner && (viewMode === 'write' || viewMode === 'split') && (
        <div className="px-4 py-2 bg-[#090A0E] border-b border-[#FFFFFF]/15 flex flex-wrap items-center justify-between gap-2">
          {/* Markdown Formatting Toolbar */}
          <div className="flex flex-wrap items-center gap-1 text-[#D1D5DB]">
            <button
              onClick={() => insertSyntax('# ', '', 'Heading 1')}
              className="px-2 py-1 rounded-lg hover:bg-white/10 hover:text-white font-mono font-bold text-xs"
              title="Heading 1"
            >
              H1
            </button>
            <button
              onClick={() => insertSyntax('## ', '', 'Heading 2')}
              className="px-2 py-1 rounded-lg hover:bg-white/10 hover:text-white font-mono font-bold text-xs"
              title="Heading 2"
            >
              H2
            </button>
            <button
              onClick={() => insertSyntax('### ', '', 'Heading 3')}
              className="px-2 py-1 rounded-lg hover:bg-white/10 hover:text-white font-mono font-bold text-xs"
              title="Heading 3"
            >
              H3
            </button>
            <div className="w-px h-4 bg-white/10 mx-0.5" />
            <button
              onClick={() => insertSyntax('**', '**', 'bold text')}
              className="p-1.5 rounded-lg hover:bg-white/10 hover:text-white"
              title="Bold"
            >
              <Bold className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => insertSyntax('*', '*', 'italic text')}
              className="p-1.5 rounded-lg hover:bg-white/10 hover:text-white"
              title="Italic"
            >
              <Italic className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => insertSyntax('~~', '~~', 'strikethrough')}
              className="p-1.5 rounded-lg hover:bg-white/10 hover:text-white"
              title="Strikethrough"
            >
              <Strikethrough className="w-3.5 h-3.5" />
            </button>
            <div className="w-px h-4 bg-white/10 mx-0.5" />
            <button
              onClick={() => insertSyntax('> ', '', 'Quote here')}
              className="p-1.5 rounded-lg hover:bg-white/10 hover:text-white"
              title="Blockquote"
            >
              <Quote className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => insertSyntax('`', '`', 'code')}
              className="p-1.5 rounded-lg hover:bg-white/10 hover:text-white"
              title="Inline Code"
            >
              <Code className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => insertSyntax('```typescript\n', '\n```', 'const answer = 42;')}
              className="px-1.5 py-1 rounded-lg hover:bg-white/10 hover:text-white font-mono text-[11px]"
              title="Code Block"
            >
              {'```'}
            </button>
            <div className="w-px h-4 bg-white/10 mx-0.5" />
            <button
              onClick={() => insertSyntax('- ', '', 'List item')}
              className="p-1.5 rounded-lg hover:bg-white/10 hover:text-white"
              title="Bullet List"
            >
              <List className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => insertSyntax('1. ', '', 'First item')}
              className="p-1.5 rounded-lg hover:bg-white/10 hover:text-white"
              title="Numbered List"
            >
              <ListOrdered className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => insertSyntax('- [ ] ', '', 'Task to complete')}
              className="p-1.5 rounded-lg hover:bg-white/10 hover:text-white"
              title="GitHub Task List"
            >
              <CheckSquare className="w-3.5 h-3.5 text-[#FFFFFF]" />
            </button>
            <div className="w-px h-4 bg-white/10 mx-0.5" />
            <button
              onClick={() => insertSyntax('| Column 1 | Column 2 |\n| :--- | :--- |\n| Row 1 | Row 2 |\n')}
              className="p-1.5 rounded-lg hover:bg-white/10 hover:text-white"
              title="Insert Table"
            >
              <TableIcon className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => insertSyntax('[', '](https://)', 'Link Label')}
              className="p-1.5 rounded-lg hover:bg-white/10 hover:text-white"
              title="Insert Link"
            >
              <Link2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => insertSyntax('\n---\n')}
              className="p-1.5 rounded-lg hover:bg-white/10 hover:text-white"
              title="Horizontal Rule"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Quick Starter Templates */}
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-[#6B7280] uppercase font-bold tracking-wider">Templates:</span>
            <button
              onClick={() => loadStarterTemplate('manifesto')}
              className="px-2 py-0.5 rounded-md bg-white/5 hover:bg-white/10 text-[10px] text-[#E5E7EB] font-medium"
            >
              Manifesto
            </button>
            <button
              onClick={() => loadStarterTemplate('checklists')}
              className="px-2 py-0.5 rounded-md bg-white/5 hover:bg-white/10 text-[10px] text-[#E5E7EB] font-medium"
            >
              Checklists
            </button>
            <button
              onClick={() => loadStarterTemplate('hyperfixations')}
              className="px-2 py-0.5 rounded-md bg-white/5 hover:bg-white/10 text-[10px] text-[#E5E7EB] font-medium"
            >
              Table
            </button>
            <button
              onClick={() => loadStarterTemplate('engagement')}
              className="px-2 py-0.5 rounded-md bg-white/5 hover:bg-white/10 text-[10px] text-[#E5E7EB] font-medium"
            >
              Alerts
            </button>
          </div>
        </div>
      )}

      {/* 5,000 Characters Live Meter Bar */}
      <div className="px-4 py-2 bg-[#12020F] border-b border-[#FFFFFF]/15 flex items-center justify-between text-xs">
        <div className="flex items-center gap-3">
          {/* Character Progress Bar */}
          <div className="flex items-center gap-2">
            <div className="w-24 h-2 bg-black/50 rounded-full overflow-hidden border border-white/10">
              <div 
                className={`h-full ${progressColor} transition-all duration-300 rounded-full`}
                style={{ width: `${Math.min(100, charPercentage)}%` }}
              />
            </div>
            <span className={`px-2 py-0.5 rounded-md border text-[11px] font-mono font-bold ${badgeColor}`}>
              {charCount.toLocaleString()} / {MAX_CHARACTERS.toLocaleString()} chars
            </span>
          </div>

          {remaining <= 500 && (
            <span className="text-[10px] text-amber-400 font-medium animate-pulse">
              ⚠️ {remaining.toLocaleString()} chars remaining
            </span>
          )}
        </div>

        {/* Privacy Selector */}
        {isOwner && (
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-[#6B7280] font-semibold">Visibility:</span>
            <select
              value={visibility}
              onChange={(e) => setVisibility(e.target.value as MarkdownVisibility)}
              className="bg-black/40 text-[11px] font-medium text-[#F3F4F6] border border-[rgba(255,255,255,0.20)]/30 rounded-lg px-2 py-0.5 focus:outline-none focus:border-[#FFFFFF]"
            >
              <option value="public">🌐 Public (All)</option>
              <option value="matches">💖 Matches Only</option>
              <option value="friends">👥 Friends Only</option>
              <option value="private">🔒 Private (Only Me)</option>
            </select>
          </div>
        )}
      </div>

      {errorMsg && (
        <div className="px-4 py-2 bg-rose-950/40 border-b border-rose-500/30 text-rose-300 text-xs flex items-center gap-1.5">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Content Area */}
      <div className="relative min-h-[350px] max-h-[600px] flex overflow-hidden">
        {/* WRITE VIEW */}
        {(viewMode === 'write' || viewMode === 'split') && (
          <div className={`flex-1 flex flex-col ${viewMode === 'split' ? 'border-r border-[#FFFFFF]/20 w-1/2' : 'w-full'}`}>
            <textarea
              ref={textareaRef}
              value={content}
              onChange={handleContentChange}
              onPaste={handlePaste}
              maxLength={MAX_CHARACTERS}
              placeholder={`# Write your personal README.md in GitHub Markdown...\n\nEvery user can write their autobiographical manifesto, values, tables, and checklists up to 5,000 characters!\n\n> "Express who you truly are without limits."\n\n- [x] Authentic self\n- [ ] Ready to connect`}
              className="flex-1 w-full p-4 bg-transparent text-[#F7E7F0] font-mono text-xs leading-relaxed resize-none focus:outline-none placeholder-[#6E5D68] overflow-y-auto no-scrollbar"
              readOnly={!isOwner}
            />
          </div>
        )}

        {/* PREVIEW VIEW */}
        {(viewMode === 'preview' || viewMode === 'split') && (
          <div className={`flex-1 p-5 overflow-y-auto no-scrollbar bg-black/20 ${viewMode === 'split' ? 'w-1/2' : 'w-full'}`}>
            {content.trim() ? (
              <GitHubMarkdownRenderer content={content} />
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 text-[#6B7280] space-y-2">
                <FileText className="w-8 h-8 stroke-1 text-[#FFFFFF]/40" />
                <p className="text-xs">No markdown content yet.</p>
                <p className="text-[10px]">Switch to "Write" mode to compose your 5,000 character GitHub manifesto.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Footer Details */}
      <div className="px-4 py-2 bg-[#090A0E] border-t border-[#FFFFFF]/15 flex items-center justify-between text-[10px] text-[#9CA3AF]">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>GitHub Flavored Markdown (GFM) v0.29 Compliant</span>
        </div>
        <div>
          <span>Max length: 5,000 characters</span>
        </div>
      </div>
    </div>
  );
};
