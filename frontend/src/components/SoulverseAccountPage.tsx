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
      setTimeout(() => setExportDone(false), 3000);
    } catch (e) {
      alert('Export failed');
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteData = async () => {
    if (!confirm('CAUTION: This will permanently purge your living profile sections, Q&As, timeline events, and thoughts from the database. Are you sure?')) return;
    try {
      await livingProfileClient.deleteProfileData('usr_me');
      alert('All custom living profile data permanently wiped.');
    } catch (e) {
      alert('Deletion failed');
    }
  };

  return (
    <div className="w-full space-y-6 animate-fadeIn pb-16 max-w-4xl mx-auto">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-[#160D19] border border-[#321323] shadow-2xl flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-[#A64D78]/40 shadow-lg">
            <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black text-[#E9DFE8] font-serif">{profile.name}</h1>
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-xs text-[#A99BAA]">@{profile.username} • Account ID: usr_me</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Verified Identity
              </span>
              <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-[#321323] text-[#F0B8D3] border border-[#A64D78]/30">
                Premium Explorer
              </span>
            </div>
          </div>
        </div>

        <button 
          onClick={handleExportData}
          disabled={isExporting}
          className="px-4 py-2 rounded-2xl bg-[#321323] hover:bg-[#3E182C] text-[#F0B8D3] border border-[#A64D78]/30 text-xs font-bold flex items-center gap-2 shadow-sm transition-colors cursor-pointer disabled:opacity-50"
        >
          {exportDone ? <Check className="w-4 h-4 text-emerald-400" /> : <Download className="w-4 h-4 text-[#D78BAF]" />}
          <span>{isExporting ? 'Packaging...' : exportDone ? 'Exported!' : 'Export JSON'}</span>
        </button>
      </div>

      {/* Account Info & Security Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Personal Details */}
        <div className="p-5 rounded-3xl bg-[#160D19] border border-[#321323] space-y-4 shadow-lg">
          <h2 className="text-xs font-bold text-[#E9DFE8] uppercase tracking-wider">Account Credentials</h2>
          
          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-2.5 rounded-2xl bg-[#09080D] border border-[#321323]">
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#A64D78]" />
                <div>
                  <span className="text-[10px] text-[#A99BAA] block">Email Address</span>
                  <span className="text-[#E9DFE8] font-mono">kavindu.dev@soulverse.io</span>
                </div>
              </div>
              <span className="text-[10px] text-emerald-400 font-bold">Verified</span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-2xl bg-[#09080D] border border-[#321323]">
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#A64D78]" />
                <div>
                  <span className="text-[10px] text-[#A99BAA] block">Phone Security</span>
                  <span className="text-[#E9DFE8] font-mono">+94 77 •••• 892</span>
                </div>
              </div>
              <span className="text-[10px] text-emerald-400 font-bold">Active 2FA</span>
            </div>
          </div>
        </div>

        {/* Active Sessions & Security */}
        <div className="p-5 rounded-3xl bg-[#160D19] border border-[#321323] space-y-4 shadow-lg">
          <h2 className="text-xs font-bold text-[#E9DFE8] uppercase tracking-wider">Active Device Sessions</h2>

          <div className="space-y-2.5 text-xs">
            <div className="flex items-center justify-between p-2.5 rounded-2xl bg-[#09080D] border border-[#321323]">
              <div className="flex items-center gap-2.5">
                <Smartphone className="w-4 h-4 text-[#A64D78]" />
                <div>
                  <span className="text-[#E9DFE8] font-bold">Windows PC • Chrome 134</span>
                  <span className="text-[10px] text-emerald-400 block">Current Session (Colombo, Sri Lanka)</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-2xl bg-[#09080D] border border-[#321323]">
              <div className="flex items-center gap-2.5">
                <Smartphone className="w-4 h-4 text-[#A99BAA]" />
                <div>
                  <span className="text-[#E9DFE8] font-bold">iPhone 16 Pro • Safari</span>
                  <span className="text-[10px] text-[#A99BAA] block">Active 3 hours ago</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Danger Zone: Data Wipe & Account Deletion */}
      <div className="p-5 rounded-3xl bg-rose-950/20 border border-rose-500/30 space-y-3 shadow-lg">
        <div className="flex items-center gap-2 text-rose-300">
          <AlertTriangle className="w-4 h-4" />
          <h3 className="text-xs font-bold uppercase tracking-wider">Data Purge & Permanent Deletion</h3>
        </div>
        <p className="text-xs text-[#A99BAA] leading-relaxed">
          Permanent removal strictly removes all your custom sections, questions, answers, timeline memories, and essays from SQLite database storage without soft-delete retention.
        </p>
        <button
          onClick={handleDeleteData}
          className="px-4 py-2 rounded-xl bg-rose-950/50 hover:bg-rose-900/60 text-rose-200 border border-rose-500/40 text-xs font-bold cursor-pointer transition-colors"
        >
          Permanently Delete All Profile Data
        </button>
      </div>
    </div>
  );
};
