import { 
  Users, 
  Heart, 
  MessageCircleHeart, 
  Radio, 
  ShieldAlert, 
  Sparkles, 
  GraduationCap, 
  Share2, 
  UserCheck, 
  ShieldCheck, 
  Calendar,
  Compass,
  Layers,
  Lock
} from 'lucide-react';
import type { ExperienceTab } from '../types';

interface HeaderNavProps {
  activeTab: ExperienceTab;
  onSelectTab: (tab: ExperienceTab) => void;
  onOpenCrisisModal: () => void;
}

export const HeaderNav = ({
  activeTab,
  onSelectTab,
  onOpenCrisisModal
}: HeaderNavProps) => {
  const tabs = [
    { id: 'privacy_centre' as ExperienceTab, label: 'Privacy & Control', icon: Lock },
    { id: 'universal_id' as ExperienceTab, label: 'Universal Account Linking', icon: Layers },
    { id: 'friends_connect' as ExperienceTab, label: 'FRIENDS CONNECT (Beyond App)', icon: Compass },
    { id: 'events' as ExperienceTab, label: 'EVENTS & Experiences', icon: Calendar },
    { id: 'friends_real' as ExperienceTab, label: 'FRIENDS REAL', icon: ShieldCheck },
    { id: 'my_world' as ExperienceTab, label: 'MY WORLD (Identity)', icon: UserCheck },
    { id: 'friends' as ExperienceTab, label: 'Find Friends', icon: Users },
    { id: 'dating' as ExperienceTab, label: 'Find Love', icon: Heart },
    { id: 'share_engine' as ExperienceTab, label: 'Identity Cards & Share', icon: Share2 },
    { id: 'social_growth' as ExperienceTab, label: 'Social Growth', icon: GraduationCap },
    { id: 'talk' as ExperienceTab, label: 'Talk to Someone', icon: MessageCircleHeart },
    { id: 'communities' as ExperienceTab, label: 'Social Circles', icon: Radio },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#0c121e]/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Philosophy Tag */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight text-white">FRIENDS</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-medium">
                  Privacy First
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">You own your identity. We respect your boundaries.</p>
            </div>
          </div>

          {/* Nav Items */}
          <nav className="hidden 2xl:flex items-center gap-1 bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onSelectTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/25'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Urgent Emotional Support Shortcut */}
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenCrisisModal}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500/20 transition-all text-xs font-medium cursor-pointer"
              title="Immediate Crisis Lines & Mental Health Support"
            >
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              <span className="hidden sm:inline">24/7 Crisis Help</span>
            </button>
          </div>

        </div>

        {/* Mobile / Tablet Sub-Navigation */}
        <div className="flex 2xl:hidden overflow-x-auto py-2.5 gap-2 border-t border-slate-800/80 no-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium ${
                  isActive
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-900 text-slate-300 border border-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
