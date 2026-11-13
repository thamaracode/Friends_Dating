import React from 'react';
import { 
  Sparkles, 
  Clock, 
  FileText, 
  BookOpen, 
  Send, 
  Calendar, 
  Users, 
  HelpCircle,
  X,
  ChevronRight
} from 'lucide-react';
import { DraggableBottomSheet } from '../klyven';

interface MobileCreateActionSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onActionSelect: (actionType: 'identity' | 'timeline' | 'journal' | 'story' | 'post' | 'event' | 'community' | 'question') => void;
}

/**
 * Mobile-First Native Action Sheet for Creation
 * Unifies all 8 creation capabilities under a single elegant bottom sheet.
 */
export const MobileCreateActionSheet: React.FC<MobileCreateActionSheetProps> = ({
  isOpen,
  onClose,
  onActionSelect
}) => {
  const creationActions = [
    {
      id: 'identity' as const,
      title: 'New Identity / Persona',
      description: 'Create Real, Imaginary, Cinematic, or Fantasy versions of yourself',
      icon: Sparkles,
      color: 'from-blue-500/20 to-indigo-500/10 border-blue-500/20 text-blue-300',
      badge: 'Core'
    },
    {
      id: 'timeline' as const,
      title: 'Life Timeline Entry',
      description: 'Record historical BCE/BC dates, modern milestones, or imagined futures',
      icon: Clock,
      color: 'from-amber-500/20 to-orange-500/10 border-amber-500/20 text-amber-300',
      badge: 'Timeline'
    },
    {
      id: 'journal' as const,
      title: 'Deep Journal Entry',
      description: 'Write 5,000-char GitHub Markdown entries or personal reflections',
      icon: FileText,
      color: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/20 text-emerald-300',
      badge: 'GFM'
    },
    {
      id: 'story' as const,
      title: 'Share a Story',
      description: 'Publish a poignant memory or moment that changed your perspective',
      icon: BookOpen,
      color: 'from-purple-500/20 to-violet-500/10 border-purple-500/20 text-purple-300',
      badge: null
    },
    {
      id: 'post' as const,
      title: 'Publish a Post',
      description: 'Broadcast thoughts, audio notes, or photos to your connection universe',
      icon: Send,
      color: 'from-zinc-500/20 to-zinc-600/10 border-zinc-500/20 text-zinc-300',
      badge: null
    },
    {
      id: 'event' as const,
      title: 'Host an Event or Meetup',
      description: 'Create acoustic evenings, movie watch-parties, or outdoor hikes',
      icon: Calendar,
      color: 'from-rose-500/20 to-pink-500/10 border-rose-500/20 text-rose-300',
      badge: 'Social'
    },
    {
      id: 'community' as const,
      title: 'Start a Community',
      description: 'Launch an interest circle for cinema, architecture, or philosophy',
      icon: Users,
      color: 'from-cyan-500/20 to-sky-500/10 border-cyan-500/20 text-cyan-300',
      badge: null
    },
    {
      id: 'question' as const,
      title: 'Ask Question or Challenge',
      description: 'Post an introspective icebreaker or social confidence challenge',
      icon: HelpCircle,
      color: 'from-yellow-500/20 to-amber-500/10 border-yellow-500/20 text-yellow-300',
      badge: 'Explore'
    }
  ];

  return (
    <DraggableBottomSheet
      isOpen={isOpen}
      onClose={onClose}
      heightClass="h-[80vh] sm:h-[75vh]"
    >
      <div className="p-4 sm:p-6 flex flex-col h-full overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
          <div>
            <h3 className="text-base font-bold text-white font-serif tracking-tight flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-zinc-300" />
              <span>Create in Soulverse</span>
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Express your real life, fictional personas, memories and social spaces
            </p>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action Grid */}
        <div className="flex-1 overflow-y-auto no-scrollbar py-4 space-y-2.5">
          {creationActions.map(action => {
            const Icon = action.icon;
            return (
              <div
                key={action.id}
                onClick={() => {
                  onActionSelect(action.id);
                  onClose();
                }}
                className={`p-3.5 rounded-2xl bg-gradient-to-r ${action.color} border cursor-pointer hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-between group shadow-sm`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center shrink-0 shadow-inner">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-white tracking-tight truncate">{action.title}</h4>
                      {action.badge && (
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-white/10 text-zinc-300 border border-white/15">
                          {action.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-zinc-400 mt-0.5 line-clamp-1 leading-snug">
                      {action.description}
                    </p>
                  </div>
                </div>

                <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-white group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
              </div>
            );
          })}
        </div>

      </div>
    </DraggableBottomSheet>
  );
};
