import React from 'react';
import { Calendar, Tag, Lock, Globe } from 'lucide-react';

export interface TimelineEventItem {
  id: string;
  year: number | string;
  date?: string;
  title: string;
  description: string;
  category?: string;
  tags?: string[];
  emotion?: string;
  privacy?: 'public' | 'matches_only' | 'private';
  imageUrl?: string;
}

export interface TimelineProps {
  events: TimelineEventItem[];
  className?: string;
}

export const Timeline: React.FC<TimelineProps> = ({
  events,
  className = ''
}) => {
  return (
    <div className={`relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-2.5 sm:before:left-3 before:top-3 before:bottom-3 before:w-0.5 before:bg-white/10 ${className}`}>
      {events.map((evt) => (
        <div key={evt.id} className="relative group">
          {/* Node Dot */}
          <div className="absolute -left-6 sm:-left-8 top-1.5 w-5 h-5 rounded-full bg-[#12141B] border-2 border-amber-400/60 shadow-[0_0_10px_rgba(245,158,11,0.4)] flex items-center justify-center group-hover:scale-110 group-hover:border-amber-400 transition-transform">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
          </div>

          {/* Event Content Card */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#12141B]/75 backdrop-blur-xl border border-white/[0.08] hover:border-white/20 transition-all shadow-md space-y-3">
            {/* Header / Date */}
            <div className="flex items-center justify-between gap-2 flex-wrap text-xs text-zinc-400">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full font-bold bg-amber-400/10 text-amber-300 border border-amber-400/20 font-mono">
                  {evt.year}
                </span>
                {evt.date && (
                  <span className="flex items-center gap-1 text-zinc-400">
                    <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                    <span>{evt.date}</span>
                  </span>
                )}
              </div>

              {evt.privacy && (
                <span className="flex items-center gap-1 text-[11px] text-zinc-500 font-medium">
                  {evt.privacy === 'public' ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                  <span className="capitalize">{evt.privacy.replace('_', ' ')}</span>
                </span>
              )}
            </div>

            {/* Title & Description */}
            <div className="space-y-1">
              <h4 className="text-sm sm:text-base font-bold text-white tracking-tight">
                {evt.title}
              </h4>
              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                {evt.description}
              </p>
            </div>

            {/* Optional Image */}
            {evt.imageUrl && (
              <div className="rounded-xl overflow-hidden border border-white/10 max-h-56">
                <img src={evt.imageUrl} alt={evt.title} className="w-full h-full object-cover" />
              </div>
            )}

            {/* Footer Tags & Emotion */}
            {(evt.tags?.length || evt.emotion) && (
              <div className="flex items-center gap-2 pt-1 flex-wrap">
                {evt.emotion && (
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/20">
                    Feeling: {evt.emotion}
                  </span>
                )}
                {evt.tags?.map((t) => (
                  <span key={t} className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-white/[0.05] text-zinc-400 border border-white/[0.08]">
                    #{t}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
