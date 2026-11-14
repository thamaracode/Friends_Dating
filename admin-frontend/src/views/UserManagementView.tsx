import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  ShieldCheck, 
  UserX, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  ExternalLink,
  Eye,
  Check,
  X,
  Flag
} from 'lucide-react';
import { AdminApiClient } from '../services/adminApiClient';
import type { UserSummary, ModerationReport } from '../types/admin';

export const UserManagementView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'directory' | 'reports'>('directory');
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [reports, setReports] = useState<ModerationReport[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'verified' | 'unverified'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Inspector Drawer State
  const [inspectingUserId, setInspectingUserId] = useState<string | null>(null);
  const [userDetail, setUserDetail] = useState<{ user: UserSummary; traits: any[]; reports: any[]; aiConnections: any[] } | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);

  // Suspend modal state
  const [suspendingUser, setSuspendingUser] = useState<UserSummary | null>(null);
  const [suspendReason, setSuspendReason] = useState('Terms of service violation');

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const res = await AdminApiClient.getUsers({ search, filter, limit: 50 });
      setUsers(res.users || []);
    } catch (err: any) {
      setFeedback(`Failed to load users: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const loadReports = async () => {
    try {
      const res = await AdminApiClient.getReports();
      setReports(res.reports || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (activeTab === 'directory') {
      loadUsers();
    } else {
      loadReports();
    }
  }, [activeTab, filter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadUsers();
  };

  const handleToggleVerification = async (user: UserSummary) => {
    try {
      const nextState = !user.isVerified;
      await AdminApiClient.toggleVerification(user.id, nextState);
      setFeedback(`Verification badge updated for ${user.name}`);
      loadUsers();
      if (inspectingUserId === user.id) inspectUser(user.id);
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      alert(`Verification toggle failed: ${err.message}`);
    }
  };

  const handleSuspend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!suspendingUser) return;

    try {
      await AdminApiClient.suspendUser(suspendingUser.id, suspendReason);
      setFeedback(`Account for ${suspendingUser.name} has been suspended.`);
      setSuspendingUser(null);
      loadUsers();
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      alert(`Suspension failed: ${err.message}`);
    }
  };

  const inspectUser = async (userId: string) => {
    setInspectingUserId(userId);
    setIsDetailLoading(true);
    try {
      const res = await AdminApiClient.getUserDetail(userId);
      setUserDetail(res);
    } catch (err: any) {
      alert(`Failed to load user profile: ${err.message}`);
    } finally {
      setIsDetailLoading(false);
    }
  };

  const handleResolveReport = async (reportId: string, status: 'resolved' | 'dismissed') => {
    try {
      await AdminApiClient.resolveReport(reportId, status, `Reviewed and ${status} by admin`);
      setFeedback(`Report ${reportId} marked as ${status}`);
      loadReports();
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      alert(`Action failed: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="type-page-heading text-white tracking-tight">Trust, Safety & User Management</h2>
          <p className="type-supporting text-zinc-400 mt-1">
            Maintain platform safety, verification badges, user attributes, and moderation queues under strict privacy controls.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 p-1 rounded-2xl bg-white/[0.04] border border-white/10 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('directory')}
            className={`h-9 px-4 rounded-xl text-xs font-heading font-semibold transition-colors cursor-pointer ${
              activeTab === 'directory' ? 'bg-white text-[#090A0E]' : 'text-zinc-400 hover:text-white'
            }`}
          >
            User Directory
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`h-9 px-4 rounded-xl text-xs font-heading font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'reports' ? 'bg-white text-[#090A0E]' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Flag className="w-3.5 h-3.5" />
            <span>Abuse Reports ({reports.filter(r => r.status === 'pending').length})</span>
          </button>
        </div>
      </div>

      {feedback && (
        <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-200 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{feedback}</span>
        </div>
      )}

      {activeTab === 'directory' ? (
        <>
          {/* Search and Verification Filter Strip */}
          <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/10">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or username..."
                className="sv-input w-full pl-10 text-xs"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setFilter('all')}
                className={`h-9 px-3.5 rounded-xl text-xs font-heading font-semibold transition-colors cursor-pointer ${
                  filter === 'all' ? 'bg-white text-[#090A0E]' : 'bg-white/[0.04] text-zinc-400 hover:text-white'
                }`}
              >
                All Users
              </button>
              <button
                type="button"
                onClick={() => setFilter('verified')}
                className={`h-9 px-3.5 rounded-xl text-xs font-heading font-semibold transition-colors cursor-pointer ${
                  filter === 'verified' ? 'bg-emerald-500 text-black font-bold' : 'bg-white/[0.04] text-zinc-400 hover:text-white'
                }`}
              >
                Verified Only
              </button>
              <button
                type="button"
                onClick={() => setFilter('unverified')}
                className={`h-9 px-3.5 rounded-xl text-xs font-heading font-semibold transition-colors cursor-pointer ${
                  filter === 'unverified' ? 'bg-white text-[#090A0E]' : 'bg-white/[0.04] text-zinc-400 hover:text-white'
                }`}
              >
                Unverified
              </button>
              <button type="submit" className="sv-btn-gold h-9 px-4 text-xs font-bold cursor-pointer">
                Search
              </button>
            </div>
          </form>

          {/* Users Table */}
          <div className="sv-card overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-white/[0.03] border-b border-white/10 text-zinc-400 uppercase tracking-wider font-mono text-[11px]">
                  <tr>
                    <th className="p-4 font-semibold">User Identity</th>
                    <th className="p-4 font-semibold">Verification</th>
                    <th className="p-4 font-semibold">Status Note</th>
                    <th className="p-4 font-semibold">Last Active</th>
                    <th className="p-4 font-semibold text-right">Administrative Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.06]">
                  {isLoading ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-zinc-500 font-mono">
                        Loading users...
                      </td>
                    </tr>
                  ) : users.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-zinc-500">
                        No users match query.
                      </td>
                    </tr>
                  ) : (
                    users.map(u => (
                      <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                        
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <img 
                              src={u.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'} 
                              alt={u.name} 
                              className="w-10 h-10 rounded-full object-cover border border-white/20"
                            />
                            <div>
                              <div className="font-heading font-bold text-sm text-white flex items-center gap-1.5">
                                <span>{u.name}</span>
                                {u.isVerified && <ShieldCheck className="w-4 h-4 text-emerald-400 fill-emerald-400/20" />}
                              </div>
                              <div className="font-mono text-zinc-400 text-[11px]">@{u.username} ({u.id})</div>
                            </div>
                          </div>
                        </td>

                        <td className="p-4">
                          <button
                            onClick={() => handleToggleVerification(u)}
                            className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-colors ${
                              u.isVerified
                                ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/40'
                                : 'bg-white/5 text-zinc-400 hover:text-white border border-white/10'
                            }`}
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>{u.isVerified ? 'Verified ✓' : 'Mark Verified'}</span>
                          </button>
                        </td>

                        <td className="p-4">
                          <span className={`type-supporting text-xs ${u.statusText?.includes('SUSPENDED') ? 'text-red-400 font-bold' : 'text-zinc-300'}`}>
                            {u.statusText || 'Normal active user'}
                          </span>
                        </td>

                        <td className="p-4">
                          <span className="type-metadata text-zinc-400">
                            {new Date(u.lastSeenAt * 1000).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                          </span>
                        </td>

                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => inspectUser(u.id)}
                              className="sv-btn-secondary h-8 px-3 text-xs cursor-pointer text-cyan-300 hover:text-white"
                              title="Inspect profile attributes"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Inspect</span>
                            </button>

                            <button
                              onClick={() => setSuspendingUser(u)}
                              className="sv-btn-secondary h-8 px-3 text-xs cursor-pointer text-red-400 hover:bg-red-950/40 hover:border-red-500/40"
                              title="Suspend or ban user"
                            >
                              <UserX className="w-3.5 h-3.5" />
                              <span>Suspend</span>
                            </button>
                          </div>
                        </td>

                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        /* Abuse Reports Tab */
        <div className="sv-card overflow-hidden shadow-2xl p-6 space-y-4">
          <h3 className="type-card-heading text-white tracking-tight flex items-center gap-2">
            <Flag className="w-5 h-5 text-red-400" />
            <span>Reported Users & Abuse Investigation Queue</span>
          </h3>
          <p className="type-supporting text-zinc-400 text-xs">
            Review community safety reports. Private chat contents and personal journals are shielded from moderator inspection.
          </p>

          <div className="space-y-3">
            {reports.length === 0 ? (
              <div className="p-10 text-center text-zinc-500 font-mono text-xs">
                No active abuse reports found.
              </div>
            ) : (
              reports.map(rep => (
                <div 
                  key={rep.id} 
                  className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2.5">
                      <span className="font-bold text-white text-sm">{rep.reason}</span>
                      <span className={`type-metadata px-2 py-0.5 rounded-full font-mono text-[10px] ${
                        rep.status === 'pending' ? 'bg-amber-400/20 text-amber-300' : 'bg-white/10 text-zinc-400'
                      }`}>
                        {rep.status.toUpperCase()}
                      </span>
                    </div>

                    <div className="type-supporting text-zinc-300 text-xs">
                      Reported User: <span className="text-white font-semibold font-mono">{rep.reported_name || rep.reported_user_id}</span>
                      {rep.reporter_name && <span> • Reporter: {rep.reporter_name}</span>}
                    </div>

                    <div className="p-3 rounded-xl bg-black/40 border border-white/5 text-xs text-zinc-300 italic">
                      "{rep.details || 'No additional details provided'}"
                    </div>
                  </div>

                  {rep.status === 'pending' && (
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleResolveReport(rep.id, 'dismissed')}
                        className="sv-btn-secondary h-9 px-3 text-xs cursor-pointer text-zinc-400 hover:text-white"
                      >
                        Dismiss
                      </button>
                      <button
                        onClick={() => handleResolveReport(rep.id, 'resolved')}
                        className="sv-btn-gold h-9 px-4 text-xs font-bold cursor-pointer"
                      >
                        Resolve & Moderate
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Inspect User Drawer */}
      {inspectingUserId && userDetail && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex justify-end">
          <div className="w-full max-w-lg h-full bg-[#12141B] border-l border-white/15 p-6 space-y-6 overflow-y-auto no-scrollbar shadow-2xl animate-fadeIn">
            
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="type-card-heading text-white tracking-tight flex items-center gap-2">
                <Users className="w-5 h-5 text-[#F6C138]" />
                <span>User Profile Inspector</span>
              </h3>
              <button 
                onClick={() => setInspectingUserId(null)}
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-zinc-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* User Overview */}
            <div className="flex items-center gap-4">
              <img 
                src={userDetail.user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'} 
                alt={userDetail.user.name} 
                className="w-16 h-16 rounded-2xl object-cover border border-white/20"
              />
              <div>
                <h4 className="font-heading font-bold text-lg text-white flex items-center gap-2">
                  <span>{userDetail.user.name}</span>
                  {userDetail.user.isVerified && <ShieldCheck className="w-4 h-4 text-emerald-400" />}
                </h4>
                <div className="font-mono text-zinc-400 text-xs">@{userDetail.user.username}</div>
                <div className="type-metadata text-zinc-500 mt-1">ID: {userDetail.user.id}</div>
              </div>
            </div>

            {/* Privacy Shield Notice */}
            <div className="p-3.5 rounded-xl bg-cyan-950/30 border border-cyan-500/20 text-xs text-cyan-200">
              🛡️ <strong>Privacy Shield Active:</strong> Private journals, unsent letters, intimate notes, and encrypted API keys are omitted by policy.
            </div>

            {/* Community Trait Feedback */}
            <div className="space-y-2">
              <span className="type-metadata text-zinc-400 font-bold uppercase tracking-wider block">
                Aggregated Community Traits
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {userDetail.traits.length === 0 ? (
                  <div className="text-zinc-500 font-mono col-span-2">No trait votes recorded.</div>
                ) : (
                  userDetail.traits.map(t => (
                    <div key={t.trait_slug} className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between">
                      <span className="text-zinc-300 capitalize">{t.trait_slug.replace('_', ' ')}</span>
                      <span className="font-mono font-bold text-white">{t.vote_count}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Connected BYOAI Providers (strictly masked) */}
            <div className="space-y-2">
              <span className="type-metadata text-zinc-400 font-bold uppercase tracking-wider block">
                User-Connected AI Providers
              </span>
              <div className="space-y-1.5 text-xs">
                {userDetail.aiConnections.length === 0 ? (
                  <div className="text-zinc-500 font-mono">No BYOAI credentials connected.</div>
                ) : (
                  userDetail.aiConnections.map(c => (
                    <div key={c.id} className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between">
                      <div className="font-semibold text-white capitalize">{c.provider} ({c.name})</div>
                      <span className={`type-metadata px-2 py-0.5 rounded ${c.isEnabled ? 'bg-emerald-950/40 text-emerald-300' : 'bg-zinc-800 text-zinc-500'}`}>
                        {c.isEnabled ? 'ENABLED' : 'DISABLED'}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Verification Button */}
            <div className="pt-4 border-t border-white/10 flex gap-2">
              <button
                onClick={() => handleToggleVerification(userDetail.user)}
                className="sv-btn-primary flex-1 text-xs cursor-pointer"
              >
                {userDetail.user.isVerified ? 'Remove Verification Badge' : 'Grant Verification Badge'}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Suspend User Modal */}
      {suspendingUser && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <form onSubmit={handleSuspend} className="sv-card w-full max-w-md p-6 space-y-5 border-red-500/30">
            <div className="flex items-center gap-2.5 text-red-400 font-bold text-base">
              <AlertTriangle className="w-5 h-5" />
              <span>Suspend User Account</span>
            </div>

            <p className="type-supporting text-zinc-300 text-xs">
              Are you sure you want to suspend <strong className="text-white">{suspendingUser.name}</strong> (@{suspendingUser.username})?
            </p>

            <div className="space-y-1.5">
              <label className="type-metadata text-zinc-400 uppercase tracking-wider block">
                Suspension Reason
              </label>
              <textarea
                value={suspendReason}
                onChange={(e) => setSuspendReason(e.target.value)}
                rows={3}
                required
                className="sv-input w-full resize-none text-xs"
                placeholder="State reason for policy enforcement..."
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSuspendingUser(null)}
                className="sv-btn-secondary h-9 px-4 text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="h-9 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs cursor-pointer shadow-lg"
              >
                Confirm Suspension
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
