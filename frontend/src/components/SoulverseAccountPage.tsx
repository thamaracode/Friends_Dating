import React, { useState } from 'react';
import { 
  User, 
  ShieldCheck, 
  Key, 
  Download, 
  Trash2, 
  Globe2, 
  Clock, 
  Lock, 
  Mail, 
  Phone, 
  Smartphone, 
  Check, 
  AlertTriangle 
} from 'lucide-react';
import { CURRENT_USER } from '../mockData';
import { livingProfileClient } from '../services/livingProfileApiClient';

export const SoulverseAccountPage: React.FC = () => {
  const [profile] = useState(CURRENT_USER);
  const [isExporting, setIsExporting] = useState(false);
  const [exportDone, setExportDone] = useState(false);
  const [accountToast, setAccountToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setAccountToast(msg);
    setTimeout(() => setAccountToast(null), 3500);
  };

  const handleExportData = async () => {
    try {
      setIsExporting(true);
      const data = await livingProfileClient.exportProfile('usr_me');
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `soulverse_autobiography_${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setExportDone(true);
      showToast('📦 Autobiography exported successfully');
      setTimeout(() => setExportDone(false), 3000);
    } catch (e) {
      showToast('❌ Export failed');
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteData = async () => {
    if (!confirm('CAUTION: This will permanently purge your living profile sections, Q&As, timeline events, and thoughts from the database. Are you sure?')) return;
    try {
      await livingProfileClient.deleteProfileData('usr_me');
      showToast('🗑️ All custom living profile data permanently wiped from database.');
    } catch (e) {
      showToast('❌ Deletion failed');
    }
  };

  return (
    <div className="w-full space-y-6 animate-fadeIn pb-16 max-w-4xl mx-auto">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl dark-glass border border-white/[0.08] shadow-2xl flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-white/30 shadow-lg">
            <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black text-white font-serif">{profile.name}</h1>
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-xs text-zinc-400">@{profile.username} • Account ID: usr_me</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Verified Identity
              </span>
              <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-white/10 text-zinc-200 border border-white/20">
                Premium Explorer
              </span>
            </div>
          </div>
        </div>

        <button 
          onClick={handleExportData}
          disabled={isExporting}
          className="px-4 py-2 rounded-2xl gray-glass-btn text-xs font-bold flex items-center gap-2 shadow-sm transition-colors cursor-pointer disabled:opacity-50"
        >
          {exportDone ? <Check className="w-4 h-4 text-emerald-400" /> : <Download className="w-4 h-4 text-white" />}
          <span>{isExporting ? 'Packaging...' : exportDone ? 'Exported!' : 'Export JSON'}</span>
        </button>
      </div>

      {/* Account Info & Security Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Personal Details */}
        <div className="p-5 rounded-3xl dark-glass border border-white/[0.08] space-y-4 shadow-lg">
          <h2 className="text-xs font-bold text-white uppercase tracking-wider">Account Credentials</h2>
          
          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-2.5 rounded-2xl dark-glass-card border border-white/[0.06]">
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-zinc-300" />
                <div>
                  <span className="text-[10px] text-zinc-400 block">Email Address</span>
                  <span className="text-white font-mono">kavindu.dev@soulverse.io</span>
                </div>
              </div>
              <span className="text-[10px] text-emerald-400 font-bold">Verified</span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-2xl dark-glass-card border border-white/[0.06]">
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-zinc-300" />
                <div>
                  <span className="text-[10px] text-zinc-400 block">Phone Security</span>
                  <span className="text-white font-mono">+94 77 •••• 892</span>
                </div>
              </div>
              <span className="text-[10px] text-emerald-400 font-bold">Active 2FA</span>
            </div>
          </div>
        </div>

        {/* Active Sessions & Security */}
        <div className="p-5 rounded-3xl dark-glass border border-white/[0.08] space-y-4 shadow-lg">
          <h2 className="text-xs font-bold text-white uppercase tracking-wider">Active Device Sessions</h2>

          <div className="space-y-2.5 text-xs">
            <div className="flex items-center justify-between p-2.5 rounded-2xl dark-glass-card border border-white/[0.06]">
              <div className="flex items-center gap-2.5">
                <Smartphone className="w-4 h-4 text-zinc-300" />
                <div>
                  <span className="text-white font-bold">Windows PC • Chrome 134</span>
                  <span className="text-[10px] text-emerald-400 block">Current Session (Colombo, Sri Lanka)</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-2xl dark-glass-card border border-white/[0.06]">
              <div className="flex items-center gap-2.5">
                <Smartphone className="w-4 h-4 text-zinc-400" />
                <div>
                  <span className="text-white font-bold">iPhone 16 Pro • Safari</span>
                  <span className="text-[10px] text-zinc-400 block">Active 3 hours ago</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Danger Zone: Data Wipe & Account Deletion */}
      <div className="p-5 rounded-3xl dark-glass border border-white/10 space-y-3 shadow-lg">
        <div className="flex items-center gap-2 text-zinc-300">
          <AlertTriangle className="w-4 h-4 text-zinc-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-white">Data Purge & Permanent Deletion</h3>
        </div>
        <p className="text-xs text-zinc-400 leading-relaxed">
          Permanent removal strictly removes all your custom sections, questions, answers, timeline memories, and essays from SQLite database storage without soft-delete retention.
        </p>
        <button
          onClick={handleDeleteData}
          className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-bold cursor-pointer transition-colors"
        >
          Permanently Delete All Profile Data
        </button>
      </div>

      {/* Floating In-App Toast */}
      {accountToast && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-2xl bg-zinc-900/95 border border-white/20 text-xs text-white shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-bottom-3 flex items-center gap-2">
          <span>{accountToast}</span>
        </div>
      )}
    </div>
  );
};
