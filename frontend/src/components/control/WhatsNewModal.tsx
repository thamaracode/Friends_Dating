import React, { useState, useEffect } from 'react';
import { Sparkles, Calendar, ArrowRight, CheckCircle2, Flame, Heart, Music, Shield } from 'lucide-react';
import { GlassModal, GlassButton } from '../klyven';
import { FeatureControlService } from '../../services/featureControlService';

interface AnnouncementItem {
  id: string;
  title: string;
  tagline: string;
  date: string;
  badge: string;
  featuresIntroduced: string[];
  primaryActionRoute: string;
}

interface WhatsNewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToTab?: (tab: string) => void;
}

export const WhatsNewModal: React.FC<WhatsNewModalProps> = ({
  isOpen,
  onClose,
  onNavigateToTab
}) => {
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      FeatureControlService.getWhatsNew().then(data => {
        if (data && data.announcements) {
          setAnnouncements(data.announcements);
        }
        setLoading(false);
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <GlassModal
      isOpen={isOpen}
      onClose={onClose}
      title="What's New in Soulverse"
      maxWidth="lg"
    >
      <div className="space-y-4">
        {/* Intro */}
        <div className="flex items-center gap-2 p-3 rounded-2xl bg-white/[0.04] border border-white/10 text-xs text-zinc-300">
          <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            Continuous evolution: inspect newly deployed architectural modules, sanctuary layers, and audio engines.
          </span>
        </div>

        {/* Content list */}
        {loading ? (
          <div className="p-8 text-center text-xs text-zinc-500">Loading release highlights...</div>
        ) : (
          <div className="max-h-[55vh] overflow-y-auto no-scrollbar space-y-3 pr-1">
            {announcements.map((item) => (
              <div
                key={item.id}
                className="p-5 rounded-3xl dark-glass border border-white/10 space-y-3 hover:border-white/20 transition-all shadow-md"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-base text-white font-serif">
                      {item.title}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/10 text-white border border-white/10">
                      {item.badge}
                    </span>
                  </div>
                  <span className="text-[11px] text-zinc-400 font-mono flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {item.date}
                  </span>
                </div>

                <p className="text-xs text-zinc-300 leading-relaxed">
                  {item.tagline}
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-white/[0.08] text-xs">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
                      Modules:
                    </span>
                    {item.featuresIntroduced.map(featId => (
                      <span key={featId} className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/5 text-zinc-300 border border-white/5">
                        {featId.replace('feat_', '')}
                      </span>
                    ))}
                  </div>

                  {onNavigateToTab && (
                    <button
                      onClick={() => {
                        onClose();
                        onNavigateToTab(item.primaryActionRoute);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-white text-[#090A0E] text-xs font-bold flex items-center gap-1 cursor-pointer hover:brightness-110 active:scale-95 transition-all shadow-sm"
                    >
                      <span>Explore</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-white/10 text-[11px] text-zinc-500">
          <span className="font-mono">Soulverse v7.42.1 / Release Stream</span>
          <GlassButton variant="primary" onClick={onClose} className="text-xs py-1 px-4">
            Close
          </GlassButton>
        </div>
      </div>
    </GlassModal>
  );
};
