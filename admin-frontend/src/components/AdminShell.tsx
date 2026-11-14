import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Layers, 
  Users, 
  Cpu, 
  Quote as QuoteIcon, 
  Database, 
  LogOut, 
  Activity, 
  ExternalLink,
  Lock,
  ChevronRight,
  Sparkles,
  BarChart3
} from 'lucide-react';
import type { AdminUser } from '../types/admin';
import { OverviewView } from '../views/OverviewView';
import { FeatureRegistryView } from '../views/FeatureRegistryView';
import { UserManagementView } from '../views/UserManagementView';
import { AiConsoleView } from '../views/AiConsoleView';
import { QuotesConsoleView } from '../views/QuotesConsoleView';
import { SystemOperationsView } from '../views/SystemOperationsView';

interface AdminShellProps {
  admin: AdminUser;
  onLogout: () => void;
}

export const AdminShell: React.FC<AdminShellProps> = ({ admin, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'features' | 'users' | 'ai' | 'quotes' | 'system'>('overview');
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const navCategories = [
    {
      title: 'PLATFORM INTELLIGENCE',
      items: [
        { id: 'overview' as const, label: 'Executive Dashboard', icon: BarChart3, badge: 'Live' },
        { id: 'features' as const, label: 'Central Feature Registry', icon: Layers, badge: '8 States' }
      ]
    },
    {
      title: 'TRUST & ENGAGEMENT',
      items: [
        { id: 'users' as const, label: 'User Safety & Accounts', icon: Users, badge: 'Privacy-Safe' },
        { id: 'quotes' as const, label: 'Wisdom & Quotes Library', icon: QuoteIcon, badge: 'Sanctuary' }
      ]
    },
    {
      title: 'INFRASTRUCTURE & OPS',
      items: [
        { id: 'ai' as const, label: 'AI Provider Routing', icon: Cpu, badge: 'BYOAI' },
        { id: 'system' as const, label: 'System Ops & Security', icon: Database, badge: 'Audit Trail' }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[#090A0E] text-zinc-100 flex flex-col font-sans selection:bg-[#F6C138]/20">
      
      {/* Top Header */}
      <header className="h-16 sm:h-20 bg-[#12141B]/90 backdrop-blur-xl border-b border-white/10 px-6 sm:px-8 flex items-center justify-between shrink-0 sticky top-0 z-40">
        
        {/* Brand identity */}
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#12141B] to-[#1A1D27] border border-[#F6C138]/40 flex items-center justify-center text-[#F6C138] shadow-[0_0_20px_rgba(246,193,56,0.15)]">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h1 className="type-card-heading text-white tracking-tight flex items-center gap-2">
              <span>Soulverse Admin</span>
              <span className="type-metadata px-2 py-0.5 rounded-full bg-[#F6C138]/15 text-[#F6C138] font-mono text-[10px]">
                v1.0.0 Dedicated
              </span>
            </h1>
            <p className="type-metadata text-zinc-400">
              admin.soulverse.im • {currentTime}
            </p>
          </div>
        </div>

        {/* Right Admin Profile & Actions */}
        <div className="flex items-center gap-4">
          
          <div className="hidden sm:flex items-center gap-3 pl-4 border-l border-white/10">
            <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center font-heading font-bold text-sm text-[#F6C138]">
              {admin.fullName.slice(0, 2).toUpperCase()}
            </div>
            <div className="text-left">
              <div className="font-heading font-bold text-xs text-white leading-tight">
                {admin.fullName}
              </div>
              <div className="type-metadata text-zinc-400 font-mono text-[10px]">
                {admin.roleName} (Lvl {admin.hierarchyLevel})
              </div>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="sv-btn-secondary h-10 px-3.5 text-xs font-semibold cursor-pointer text-zinc-400 hover:text-white hover:border-red-500/40 hover:bg-red-950/30 transition-colors"
            title="Terminate Administrative Session"
          >
            <LogOut className="w-4 h-4 text-red-400" />
            <span className="hidden md:inline">Sign Out</span>
          </button>

        </div>
      </header>

      {/* 2-Column Desktop Frame */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        
        {/* Left Desktop Sidebar */}
        <aside className="w-64 sm:w-72 border-r border-white/10 p-4 space-y-6 overflow-y-auto no-scrollbar shrink-0 bg-[#0C0E14] hidden md:block">
          {navCategories.map((cat, idx) => (
            <div key={idx} className="space-y-1.5">
              <div className="type-metadata text-zinc-500 font-bold uppercase tracking-wider px-3.5 py-1">
                {cat.title}
              </div>
              {cat.items.map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full min-h-[44px] flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-heading font-semibold transition-all cursor-pointer ${
                      isActive 
                        ? 'bg-white text-[#090A0E] shadow-lg shadow-white/5 font-bold' 
                        : 'text-zinc-400 hover:text-white hover:bg-white/[0.05]'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Icon className="w-4 h-4 shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className={`text-[10px] px-2 py-0.5 rounded-md font-mono ${
                        isActive ? 'bg-[#090A0E]/15 text-[#090A0E]' : 'bg-white/10 text-zinc-300'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}

          {/* Quick link to user app */}
          <div className="pt-4 border-t border-white/10 px-3">
            <a 
              href="http://127.0.0.1:5173" 
              target="_blank" 
              rel="noreferrer"
              className="type-metadata text-zinc-400 hover:text-[#F6C138] flex items-center gap-1.5 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Open Public User App</span>
            </a>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-6 sm:p-10 overflow-y-auto no-scrollbar space-y-8 bg-[#090A0E]">
          {activeTab === 'overview' && <OverviewView onNavigateTab={(tab) => setActiveTab(tab as any)} />}
          {activeTab === 'features' && <FeatureRegistryView />}
          {activeTab === 'users' && <UserManagementView />}
          {activeTab === 'ai' && <AiConsoleView />}
          {activeTab === 'quotes' && <QuotesConsoleView />}
          {activeTab === 'system' && <SystemOperationsView />}
        </main>

      </div>

    </div>
  );
};
