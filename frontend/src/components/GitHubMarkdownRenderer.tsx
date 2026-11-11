import React, { useState } from 'react';
import { 
  Check, 
  Copy, 
  ExternalLink, 
  Info, 
  Lightbulb, 
  AlertTriangle, 
  Flame, 
  BookmarkCheck,
  Code
} from 'lucide-react';

interface GitHubMarkdownRendererProps {
  content: string;
  className?: string;
}

export const GitHubMarkdownRenderer: React.FC<GitHubMarkdownRendererProps> = ({ 
  content, 
  className = '' 
}) => {
  const [copiedCodeIdx, setCopiedCodeIdx] = useState<number | null>(null);

  const handleCopyCode = (codeText: string, idx: number) => {
    navigator.clipboard.writeText(codeText);
    setCopiedCodeIdx(idx);
    setTimeout(() => setCopiedCodeIdx(null), 2000);
  };

  // Parse lines into structured blocks
  const parseBlocks = (markdown: string) => {
    const lines = markdown.split(/\r?\n/);
    const blocks: any[] = [];
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];

      // Code Block
      if (line.trim().startsWith('```')) {
        const lang = line.trim().slice(3).trim();
        const codeLines: string[] = [];
        i++;
        while (i < lines.length && !lines[i].trim().startsWith('```')) {
          codeLines.push(lines[i]);
          i++;
        }
        blocks.push({
          type: 'code_block',
          lang: lang || 'plaintext',
          code: codeLines.join('\n')
        });
        i++;
        continue;
      }

      // Horizontal Rule
      if (/^(\s*[-*_]\s*){3,}$/.test(line)) {
        blocks.push({ type: 'hr' });
        i++;
        continue;
      }

      // Headers
      const headerMatch = line.match(/^(#{1,6})\s+(.*)$/);
      if (headerMatch) {
        blocks.push({
          type: 'header',
          level: headerMatch[1].length,
          text: headerMatch[2]
        });
        i++;
        continue;
      }

      // Blockquote & GitHub Alerts
      if (line.trim().startsWith('>')) {
        const quoteLines: string[] = [];
        let alertType: string | null = null;

        // Check if first quote line is an alert e.g. > [!NOTE]
        const alertMatch = line.trim().match(/^>\s*\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]/i);
        if (alertMatch) {
          alertType = alertMatch[1].toUpperCase();
          i++;
        }

        while (i < lines.length && lines[i].trim().startsWith('>')) {
          const cleanLine = lines[i].replace(/^>\s?/, '');
          quoteLines.push(cleanLine);
          i++;
        }

        if (alertType) {
          blocks.push({
            type: 'alert',
            alertType,
            text: quoteLines.join('\n')
          });
        } else {
          blocks.push({
            type: 'blockquote',
            text: quoteLines.join('\n')
          });
        }
        continue;
      }

      // Markdown Table
      if (line.includes('|') && lines[i + 1] && /^\s*\|?\s*[:?-]+[-| :?]+\s*\|?\s*$/.test(lines[i + 1])) {
        const tableLines: string[] = [line, lines[i + 1]];
        i += 2;
        while (i < lines.length && lines[i].includes('|') && lines[i].trim().length > 0) {
          tableLines.push(lines[i]);
          i++;
        }

        const parseTableRow = (rowStr: string) => {
          return rowStr
            .trim()
            .replace(/^\|/, '')
            .replace(/\|$/, '')
            .split('|')
            .map(cell => cell.trim());
        };

        const headers = parseTableRow(tableLines[0]);
        const rows = tableLines.slice(2).map(parseTableRow);

        blocks.push({
          type: 'table',
          headers,
          rows
        });
        continue;
      }

      // Task List items (- [ ] or - [x])
      const taskMatch = line.match(/^(\s*[-*])\s+\[([ xX])\]\s+(.*)$/);
      if (taskMatch) {
        const checked = taskMatch[2].toLowerCase() === 'x';
        blocks.push({
          type: 'task_item',
          checked,
          text: taskMatch[3]
        });
        i++;
        continue;
      }

      // Unordered List items (- item or * item)
      const listMatch = line.match(/^(\s*[-*])\s+(.*)$/);
      if (listMatch) {
        blocks.push({
          type: 'list_item',
          text: listMatch[2]
        });
        i++;
        continue;
      }

      // Ordered List items (1. item)
      const numMatch = line.match(/^(\s*\d+\.)\s+(.*)$/);
      if (numMatch) {
        blocks.push({
          type: 'num_item',
          num: numMatch[1],
          text: numMatch[2]
        });
        i++;
        continue;
      }

      // Empty line
      if (!line.trim()) {
        blocks.push({ type: 'empty' });
        i++;
        continue;
      }

      // Normal paragraph
      const paraLines: string[] = [line];
      i++;
      while (
        i < lines.length && 
        lines[i].trim() && 
        !lines[i].trim().startsWith('#') &&
        !lines[i].trim().startsWith('```') &&
        !lines[i].trim().startsWith('>') &&
        !lines[i].trim().startsWith('-') &&
        !lines[i].trim().startsWith('*') &&
        !/^\s*\d+\./.test(lines[i]) &&
        !/^(\s*[-*_]\s*){3,}$/.test(lines[i])
      ) {
        paraLines.push(lines[i]);
        i++;
      }

      blocks.push({
        type: 'paragraph',
        text: paraLines.join(' ')
      });
    }

    return blocks;
  };

  // Helper to format inline markdown (bold, italic, strikethrough, inline code, links)
  const renderInline = (text: string): React.ReactNode => {
    if (!text) return null;

    // Tokens parser
    const elements: React.ReactNode[] = [];
    let remaining = text;
    let key = 0;

    // Regex for inline elements
    // 1. Code: `code`
    // 2. Bold Italic: ***text***
    // 3. Bold: **text** or __text__
    // 4. Italic: *text* or _text_
    // 5. Strikethrough: ~~text~~
    // 6. Link: [label](url)
    const tokenRegex = /(`[^`]+`|\*\*\*[^*]+\*\*\*|\*\*[^*]+\*\*|__[^_]+__|~~[^~]+~~|\*[^*]+\*|_[^_]+_|\[([^\]]+)\]\(([^)]+)\))/;

    while (remaining.length > 0) {
      const match = remaining.match(tokenRegex);
      if (!match || match.index === undefined) {
        elements.push(remaining);
        break;
      }

      if (match.index > 0) {
        elements.push(remaining.substring(0, match.index));
      }

      const token = match[0];

      if (token.startsWith('`') && token.endsWith('`')) {
        // Inline code
        const codeContent = token.slice(1, -1);
        elements.push(
          <code 
            key={key++} 
            className="px-1.5 py-0.5 rounded-md text-[11px] font-mono bg-[#28081E] border border-[#FF4F87]/30 text-[#FF92B8] mx-0.5 font-semibold"
          >
            {codeContent}
          </code>
        );
      } else if (token.startsWith('***') && token.endsWith('***')) {
        elements.push(<strong key={key++} className="font-black italic text-[#FFF2F6]">{token.slice(3, -3)}</strong>);
      } else if ((token.startsWith('**') && token.endsWith('**')) || (token.startsWith('__') && token.endsWith('__'))) {
        elements.push(<strong key={key++} className="font-black text-[#FFF2F6]">{token.slice(2, -2)}</strong>);
      } else if (token.startsWith('~~') && token.endsWith('~~')) {
        elements.push(<span key={key++} className="line-through text-[#8E7C88]">{token.slice(2, -2)}</span>);
      } else if ((token.startsWith('*') && token.endsWith('*')) || (token.startsWith('_') && token.endsWith('_'))) {
        elements.push(<em key={key++} className="italic text-[#FFD6E3]">{token.slice(1, -1)}</em>);
      } else if (token.startsWith('[') && token.includes('](')) {
        const linkMatch = token.match(/\[([^\]]+)\]\(([^)]+)\)/);
        if (linkMatch) {
          const [, label, url] = linkMatch;
          elements.push(
            <a
              key={key++}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#FF4F87] hover:text-[#FF84AB] underline underline-offset-2 decoration-[#FF4F87]/50 inline-flex items-center gap-0.5 font-medium transition-colors"
            >
              <span>{label}</span>
              <ExternalLink className="w-2.5 h-2.5 inline" />
            </a>
          );
        } else {
          elements.push(token);
        }
      } else {
        elements.push(token);
      }

      remaining = remaining.substring(match.index + token.length);
    }

    return elements;
  };

  const blocks = parseBlocks(content);

  return (
    <div className={`github-markdown space-y-3 text-xs leading-relaxed text-[#E9D9E2] ${className}`}>
      {blocks.map((block, idx) => {
        switch (block.type) {
          case 'header': {
            if (block.level === 1) {
              return (
                <div key={idx} className="pb-2 pt-3 border-b border-[#FF4F87]/30 first:pt-0">
                  <h1 className="text-lg sm:text-xl font-black text-[#FFF2F6] tracking-tight flex items-center gap-2">
                    <span className="text-[#FF4F87] font-mono text-sm select-none">#</span>
                    <span>{renderInline(block.text)}</span>
                  </h1>
                </div>
              );
            }
            if (block.level === 2) {
              return (
                <div key={idx} className="pb-1.5 pt-3 border-b border-[#FF4F87]/15 first:pt-0">
                  <h2 className="text-base sm:text-lg font-bold text-[#FFF2F6] tracking-tight flex items-center gap-1.5">
                    <span className="text-[#FF4F87]/70 font-mono text-xs select-none">##</span>
                    <span>{renderInline(block.text)}</span>
                  </h2>
                </div>
              );
            }
            if (block.level === 3) {
              return (
                <h3 key={idx} className="text-sm font-bold text-[#FFB4CE] pt-2 flex items-center gap-1">
                  <span className="text-[#FF4F87]/50 font-mono text-[10px] select-none">###</span>
                  <span>{renderInline(block.text)}</span>
                </h3>
              );
            }
            return (
              <h4 key={idx} className="text-xs font-bold text-[#FFB4CE] pt-1">
                {renderInline(block.text)}
              </h4>
            );
          }

          case 'paragraph': {
            return (
              <p key={idx} className="text-xs text-[#E3D2DC] leading-relaxed">
                {renderInline(block.text)}
              </p>
            );
          }

          case 'blockquote': {
            return (
              <blockquote 
                key={idx} 
                className="pl-3.5 py-1.5 border-l-3 border-[#FF4F87] bg-gradient-to-r from-[#FF0D69]/10 to-transparent rounded-r-xl italic text-xs text-[#FFF0F4] space-y-1"
              >
                {block.text.split('\n').map((qLine: string, qIdx: number) => (
                  <p key={qIdx}>{renderInline(qLine)}</p>
                ))}
              </blockquote>
            );
          }

          case 'alert': {
            const alertConfigs: Record<string, { icon: any; color: string; bg: string; title: string }> = {
              NOTE: { icon: Info, color: 'text-sky-400 border-sky-500/40', bg: 'bg-sky-950/30', title: 'Note' },
              TIP: { icon: Lightbulb, color: 'text-emerald-400 border-emerald-500/40', bg: 'bg-emerald-950/30', title: 'Tip' },
              IMPORTANT: { icon: BookmarkCheck, color: 'text-purple-400 border-purple-500/40', bg: 'bg-purple-950/30', title: 'Important' },
              WARNING: { icon: AlertTriangle, color: 'text-amber-400 border-amber-500/40', bg: 'bg-amber-950/30', title: 'Warning' },
              CAUTION: { icon: Flame, color: 'text-rose-400 border-rose-500/40', bg: 'bg-rose-950/30', title: 'Caution' }
            };
            const cfg = alertConfigs[block.alertType] || alertConfigs.NOTE;
            const AlertIcon = cfg.icon;

            return (
              <div 
                key={idx} 
                className={`p-3 rounded-2xl border-l-4 ${cfg.color} ${cfg.bg} space-y-1 text-xs`}
              >
                <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[10px]">
                  <AlertIcon className="w-3.5 h-3.5" />
                  <span>{cfg.title}</span>
                </div>
                <div className="text-[#E7D6E1] leading-relaxed">
                  {block.text.split('\n').map((l: string, li: number) => (
                    <p key={li}>{renderInline(l)}</p>
                  ))}
                </div>
              </div>
            );
          }

          case 'code_block': {
            const isCopied = copiedCodeIdx === idx;
            return (
              <div key={idx} className="rounded-2xl overflow-hidden border border-[#FF4F87]/25 bg-[#0C020A] shadow-xl my-2">
                <div className="flex items-center justify-between px-3 py-1.5 bg-[#1C0516] border-b border-[#FF4F87]/15 text-[10px] text-[#FFB4CE]">
                  <div className="flex items-center gap-1.5 font-mono">
                    <Code className="w-3 h-3 text-[#FF4F87]" />
                    <span>{block.lang}</span>
                  </div>
                  <button
                    onClick={() => handleCopyCode(block.code, idx)}
                    className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-white/5 hover:bg-white/10 text-[#FFD6E3] hover:text-white transition-colors cursor-pointer"
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="p-3 text-[11px] font-mono text-[#F4D9E4] overflow-x-auto no-scrollbar leading-relaxed">
                  <code>{block.code}</code>
                </pre>
              </div>
            );
          }

          case 'task_item': {
            return (
              <div key={idx} className="flex items-start gap-2.5 py-0.5 group">
                <div className={`mt-0.5 w-4 h-4 rounded-md flex items-center justify-center border transition-all ${
                  block.checked 
                    ? 'bg-[#FF0D69] border-[#FF0D69] text-white shadow-[0_0_8px_rgba(255,13,105,0.7)]' 
                    : 'bg-black/30 border-[#FF78A8]/40 text-transparent'
                }`}>
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
                <span className={`text-xs ${block.checked ? 'text-[#8E7C88] line-through' : 'text-[#FFF2F6]'}`}>
                  {renderInline(block.text)}
                </span>
              </div>
            );
          }

          case 'list_item': {
            return (
              <div key={idx} className="flex items-start gap-2.5 py-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FF4F87] mt-1.5 shrink-0 shadow-[0_0_6px_#FF4F87]" />
                <span className="text-xs text-[#E3D2DC]">
                  {renderInline(block.text)}
                </span>
              </div>
            );
          }

          case 'num_item': {
            return (
              <div key={idx} className="flex items-start gap-2 py-0.5">
                <span className="text-xs font-mono font-bold text-[#FF4F87] shrink-0">
                  {block.num}
                </span>
                <span className="text-xs text-[#E3D2DC]">
                  {renderInline(block.text)}
                </span>
              </div>
            );
          }

          case 'table': {
            return (
              <div key={idx} className="overflow-x-auto rounded-2xl border border-[#FF4F87]/20 bg-[#160412]/60 my-2 shadow-lg">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[#FF4F87]/25 bg-[#25071D]">
                      {block.headers.map((h: string, hIdx: number) => (
                        <th key={hIdx} className="px-3 py-2 font-bold text-[#FFD6E3] tracking-wide text-[11px]">
                          {renderInline(h)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#FF4F87]/10">
                    {block.rows.map((row: string[], rIdx: number) => (
                      <tr key={rIdx} className="hover:bg-white/5 transition-colors">
                        {row.map((cell: string, cIdx: number) => (
                          <td key={cIdx} className="px-3 py-2 text-[11px] text-[#E0CFD9]">
                            {renderInline(cell)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          }

          case 'hr': {
            return (
              <div key={idx} className="py-2">
                <div className="h-px w-full bg-gradient-to-r from-transparent via-[#FF0D69]/40 to-transparent" />
              </div>
            );
          }

          default:
            return null;
        }
      })}
    </div>
  );
};
