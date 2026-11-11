import React from 'react';
import { 
  FileText, 
  HelpCircle, 
  Globe, 
  Sparkles, 
  ShieldAlert, 
  ChevronRight, 
  Heart,
  Share2,
  BookOpen
} from 'lucide-react';
import type { SoulverseRoute } from '../types';

interface SoulverseMorePageProps {
  onOpenJournal: () => void;
  onOpenQuestions: () => void;
  onOpenDigitalLife: () => void;
  onOpenCrisis: () => void;
  onOpenAdmin: () => void;
}

export const SoulverseMorePage: React.FC<SoulverseMorePageProps> = ({
  onOpenJournal,
  onOpenQuestions,
  onOpenDigitalLife,
  onOpenCrisis,
  onOpenAdmin
}) => {
  const items = [
    {
      title: 'Personal README.md Journal',
      desc: 'Compose your 5,000 character GitHub Flavored Markdown manifesto with tables, checklists, and code.',
      icon: FileText,
      badge: '5,000 Chars',
      action: onOpenJournal
    },
    {
      title: 'Living Q&As & Conversation Prompts',
      desc: 'Craft original questions and deep autobiographical answers for your profile visitors.',
      icon: HelpCircle,
      badge: 'Interactive',
      action: onOpenQuestions
    },
    {
      title: 'Digital Life: Social & Creator Links',
      desc: 'Connect your public profiles across 32+ platforms: GitHub, Spotify, Steam, Instagram, LinkedIn.',
      icon: Globe,
      badge: '32+ Platforms',
      action: onOpenDigitalLife
    },
    {
      title: 'Crisis & Emotional Support (1926)',
      desc: 'Immediate, confidential crisis intervention and mental health support resources.',
      icon: ShieldAlert,
      badge: '24/7 Hotline',
      action: onOpenCrisis
    },
    {
      title: 'Safety & Moderation Triage',
      desc: 'Review flagged interactions, reports, and administrative trust controls.',
      icon: Sparkles,
      badge: 'Admin',
      action: onOpenAdmin
    }
  ];

  return (
    <div className="w-full space-y-6 animate-fadeIn pb-16 max-w-4xl mx-auto">
      <div className="p-6 rounded-3xl dark-glass border border-white/[0.08] shadow-2xl flex items-center justify-between">
        <div>
          <h1 className="text-base font-black text-white font-serif">More Soulverse Dimensions</h1>
          <p className="text-xs text-zinc-400">Explore specialized identity systems, public links, crisis support, and personal writing</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              onClick={item.action}
              className="p-5 rounded-3xl dark-glass-card border border-white/[0.08] hover:border-white/25 transition-all cursor-pointer shadow-lg flex items-start justify-between gap-4 group"
            >
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-white/[0.08] border border-white/15 flex items-center justify-center text-white shrink-0 group-hover:scale-105 transition-transform shadow-inner">
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-bold text-white group-hover:text-zinc-200 transition-colors">
                      {item.title}
                    </h3>
                    <span className="text-[9px] font-bold px-2 py-0.2 rounded-full bg-white/[0.06] text-zinc-300 border border-white/10">
                      {item.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400 leading-relaxed mt-1">{item.desc}</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:translate-x-0.5 group-hover:text-white transition-all shrink-0 mt-1" />
            </div>
          );
        })}
      </div>
    </div>
  );
};
