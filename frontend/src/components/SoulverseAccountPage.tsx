import React, { useState, useEffect } from 'react';
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
  AlertTriangle,
  LogOut,
  RefreshCw
} from 'lucide-react';
import { CURRENT_USER } from '../mockData';
import { livingProfileClient } from '../services/livingProfileApiClient';

interface DeviceSession {
  id: string;
  device_name: string;
  ip_address: string;
  user_agent: string;
  is_revoked: number;
  last_active_at: number;
  created_at: number;
}

export const SoulverseAccountPage: React.FC = () => {
  const [profile] = useState(CURRENT_USER);
  const [isExporting, setIsExporting] = useState(false);
  const [exportDone, setExportDone] = useState(false);
  const [accountToast, setAccountToast] = useState<string | null>(null);
  const [sessions, setSessions] = useState<DeviceSession[]>([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);

  const showToast = (msg: string) => {
    setAccountToast(msg);
    setTimeout(() => setAccountToast(null), 3500);
  };

  const loadSessions = async () => {
    setIsLoadingSessions(true);
    try {
      const res = await fetch('/api/v1/users/usr_me/sessions', {
        headers: { 'x-user-id': 'usr_me' }
      });
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setSessions(json.data);
      }
    } catch (e) {
      console.error('Failed to load sessions', e);
    } finally {
      setIsLoadingSessions(false);
    }
  };

  useEffect(() => {
    loadSessions();
  }, []);

  const handleRevokeSession = async (sessionId: string) => {
    try {
      const res = await fetch(`/api/v1/users/usr_me/sessions/${sessionId}`, {
        method: 'DELETE',
        headers: { 'x-user-id': 'usr_me' }
      });
      const json = await res.json();
      if (json.success) {
        showToast('🔒 Session successfully revoked');
        loadSessions();
      } else {
        showToast('❌ Failed to revoke session');
      }
    } catch (e) {
      showToast('❌ Revocation error');
    }
  };

  const handleExportData = async () => {
    try {
      setIsExporting(true);
      const res = await fetch('/api/v1/users/usr_me/export', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-id': 'usr_me'
        },
        body: JSON.stringify({ exportType: 'full_archive' })
      });
      const json = await res.json();
      if (json.success && json.data?.id) {
        // Trigger download
        const downloadUrl = `/api/v1/users/usr_me/exports/${json.data.id}/download`;
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = `soulverse_gdpr_export_${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setExportDone(true);
        showToast(`📦 GDPR bundle generated (${Math.round(json.data.fileSizeBytes / 1024)} KB)`);
        setTimeout(() => setExportDone(false), 3000);
      } else {
        throw new Error('Export bundle creation failed');
      }
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

  const handleGdprErasure = async () => {
    const promptInput = prompt('CRITICAL WARNING: This will permanently erase your entire Soulverse account, all identities, conversations, relationships, and settings.\n\nTo confirm, type: DELETE_MY_ACCOUNT_PERMANENTLY');
    if (promptInput !== 'DELETE_MY_ACCOUNT_PERMANENTLY') {
      if (promptInput !== null) showToast('⚠️ Confirmation string did not match. Deletion cancelled.');
      return;
    }
    try {
      const res = await fetch('/api/v1/users/usr_me/gdpr-erasure', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': 'usr_me'
        },
        body: JSON.stringify({
          confirmation: 'DELETE_MY_ACCOUNT_PERMANENTLY',
          reason: 'User self-service account wipe from Account page'
        })
      });
      const json = await res.json();
      if (json.success) {
        localStorage.clear();
        showToast('🗑️ Account permanently erased. Resetting session...');
        setTimeout(() => {
          window.location.href = '/';
        }, 1500);
      } else {
        showToast(`❌ Deletion failed: ${json.error?.message || 'Server error'}`);
      }
    } catch (e: any) {
      showToast(`❌ Deletion error: ${e.message}`);
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
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-white uppercase tracking-wider">Active Device Sessions</h2>
            <button 
              onClick={loadSessions} 
              disabled={isLoadingSessions}
              className="text-[10px] text-zinc-400 hover:text-white flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className={`w-3 h-3 ${isLoadingSessions ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>

          <div className="space-y-2.5 text-xs">
            {sessions.length === 0 ? (
              <div className="p-3 text-center text-zinc-500 text-xs">No active sessions found.</div>
            ) : (
              sessions.map(sess => (
                <div key={sess.id} className="flex items-center justify-between p-2.5 rounded-2xl dark-glass-card border border-white/[0.06]">
                  <div className="flex items-center gap-2.5">
                    <Smartphone className="w-4 h-4 text-zinc-300" />
                    <div>
                      <span className="text-white font-bold block">{sess.device_name || 'Web Browser'}</span>
                      <span className="text-[10px] text-zinc-400 block">
                        IP: {sess.ip_address} • {sess.is_revoked ? 'Revoked' : 'Active'} • {new Date(sess.last_active_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  {!sess.is_revoked && (
                    <button
                      onClick={() => handleRevokeSession(sess.id)}
                      className="px-2.5 py-1 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-[10px] font-bold transition-colors cursor-pointer"
                    >
                      Revoke
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Danger Zone: Data Wipe & Account Deletion */}
      <div className="p-5 rounded-3xl dark-glass border border-red-500/20 bg-red-950/10 space-y-3 shadow-lg">
        <div className="flex items-center gap-2 text-red-400">
          <AlertTriangle className="w-4 h-4 text-red-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-red-300">Data Purge & GDPR Erasure</h3>
        </div>
        <p className="text-xs text-zinc-400 leading-relaxed">
          Permanent removal strictly purges your living profile data, questions, answers, timeline memories, messages, and settings from SQLite database storage in compliance with GDPR Article 17.
        </p>
        <div className="flex flex-wrap gap-3 pt-1">
          <button
            onClick={handleDeleteData}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-bold cursor-pointer transition-colors"
          >
            Purge Living Profile Data
          </button>
          <button
            onClick={handleGdprErasure}
            className="px-4 py-2 rounded-xl bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/30 text-xs font-bold cursor-pointer transition-colors"
          >
            GDPR Article 17 Account Erasure
          </button>
        </div>
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
