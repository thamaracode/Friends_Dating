import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Activity, 
  Shield, 
  RotateCcw, 
  Clock, 
  Lock, 
  Users, 
  Key, 
  Check, 
  AlertTriangle,
  RefreshCw,
  LogOut
} from 'lucide-react';
import { AdminApiClient } from '../services/adminApiClient';
import type { SystemHealth, AuditLogEntry, AdminSession, AdminRole } from '../types/admin';

export const SystemOperationsView: React.FC = () => {
  const [subTab, setSubTab] = useState<'health' | 'audit' | 'sessions' | 'rbac'>('health');
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [sessions, setSessions] = useState<AdminSession[]>([]);
  const [roles, setRoles] = useState<AdminRole[]>([]);
  const [auditActionFilter, setAuditActionFilter] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      if (subTab === 'health') {
        const h = await AdminApiClient.getHealth();
        setHealth(h);
      } else if (subTab === 'audit') {
        const a = await AdminApiClient.getAuditLogs({ action: auditActionFilter, limit: 100 });
        setAuditLogs(a.logs || []);
      } else if (subTab === 'sessions') {
        const s = await AdminApiClient.getSessions();
        setSessions(s.sessions || []);
      } else if (subTab === 'rbac') {
        const r = await AdminApiClient.getRoles();
        setRoles(r.roles || []);
      }
    } catch (err: any) {
      setFeedback(`Failed to load data: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [subTab, auditActionFilter]);

  const handleWalCheckpoint = async () => {
    if (!confirm('Execute SQLite WAL Checkpoint (TRUNCATE)?')) return;
    try {
      const res = await AdminApiClient.walCheckpoint();
      setFeedback(res.message);
      loadData();
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      alert(`WAL Checkpoint failed: ${err.message}`);
    }
  };

  const handleVacuum = async () => {
    if (!confirm('Execute SQLite Database VACUUM? This will rebuild the database file to reclaim unused space.')) return;
    try {
      const res = await AdminApiClient.vacuum();
      setFeedback(res.message);
      loadData();
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      alert(`VACUUM failed: ${err.message}`);
    }
  };

  const handleRevokeSession = async (sessionId: string) => {
    if (!confirm(`Revoke administrative session ${sessionId}?`)) return;
    try {
      await AdminApiClient.revokeSession(sessionId);
      setFeedback(`Session ${sessionId} has been revoked.`);
      loadData();
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      alert(`Failed to revoke session: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="type-page-heading text-white tracking-tight">System Infrastructure & Security Console</h2>
          <p className="type-supporting text-zinc-400 mt-1">
            SQLite maintenance, active session security, immutable audit trail, and role-based permissions matrix.
          </p>
        </div>

        {/* Sub-tab Navigation */}
        <div className="flex items-center gap-1 p-1 rounded-2xl bg-white/[0.04] border border-white/10 self-start sm:self-auto overflow-x-auto no-scrollbar">
          <button
            onClick={() => setSubTab('health')}
            className={`h-9 px-3.5 rounded-xl text-xs font-heading font-semibold transition-colors cursor-pointer ${
              subTab === 'health' ? 'bg-white text-[#090A0E]' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Telemetry & Ops
          </button>
          <button
            onClick={() => setSubTab('audit')}
            className={`h-9 px-3.5 rounded-xl text-xs font-heading font-semibold transition-colors cursor-pointer ${
              subTab === 'audit' ? 'bg-white text-[#090A0E]' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Audit Trail
          </button>
          <button
            onClick={() => setSubTab('sessions')}
            className={`h-9 px-3.5 rounded-xl text-xs font-heading font-semibold transition-colors cursor-pointer ${
              subTab === 'sessions' ? 'bg-white text-[#090A0E]' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Active Sessions
          </button>
          <button
            onClick={() => setSubTab('rbac')}
            className={`h-9 px-3.5 rounded-xl text-xs font-heading font-semibold transition-colors cursor-pointer ${
              subTab === 'rbac' ? 'bg-white text-[#090A0E]' : 'text-zinc-400 hover:text-white'
            }`}
          >
            RBAC Roles
          </button>
        </div>
      </div>

      {feedback && (
        <div className="p-3.5 rounded-xl bg-[#F6C138]/10 border border-[#F6C138]/30 text-[#F6C138] text-xs font-semibold flex items-center gap-2 animate-fadeIn">
          <Check className="w-4 h-4" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Subtab 1: Telemetry & Ops */}
      {subTab === 'health' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="sv-card p-6 space-y-4">
              <h3 className="type-card-heading text-white tracking-tight flex items-center gap-2">
                <Database className="w-5 h-5 text-emerald-400" />
                <span>SQLite Database Engine</span>
              </h3>
              <div className="space-y-2 type-supporting text-xs text-zinc-300">
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-zinc-400">File Path:</span>
                  <span className="font-mono text-white text-[11px] truncate max-w-[180px]">{health?.database.path}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-zinc-400">Size on Disk:</span>
                  <span className="font-mono text-emerald-400 font-bold">{health?.database.sizeMb} MB</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-zinc-400">Journal Mode:</span>
                  <span className="font-mono text-white font-bold">{health?.database.journalMode}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-zinc-400">Audit Logs Count:</span>
                  <span className="font-mono text-white">{health?.counts.totalAuditLogs} entries</span>
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  onClick={handleWalCheckpoint}
                  className="sv-btn-secondary flex-1 h-9 text-xs cursor-pointer text-emerald-300 hover:text-white"
                >
                  WAL Checkpoint
                </button>
                <button
                  onClick={handleVacuum}
                  className="sv-btn-secondary flex-1 h-9 text-xs cursor-pointer text-amber-300 hover:text-white"
                >
                  VACUUM DB
                </button>
              </div>
            </div>

            <div className="sv-card p-6 space-y-4">
              <h3 className="type-card-heading text-white tracking-tight flex items-center gap-2">
                <Activity className="w-5 h-5 text-cyan-400" />
                <span>Runtime Telemetry</span>
              </h3>
              <div className="space-y-2 type-supporting text-xs text-zinc-300">
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-zinc-400">Node Runtime:</span>
                  <span className="font-mono text-white">{health?.nodeVersion}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-zinc-400">Process Uptime:</span>
                  <span className="font-mono text-white">{health ? Math.floor(health.uptimeSeconds / 60) : 0} minutes</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-zinc-400">RSS Memory:</span>
                  <span className="font-mono text-cyan-300 font-bold">{health?.memory.rssMb} MB</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-zinc-400">Heap Used:</span>
                  <span className="font-mono text-white">{health?.memory.heapUsedMb} MB</span>
                </div>
              </div>
            </div>

            <div className="sv-card p-6 space-y-4">
              <h3 className="type-card-heading text-white tracking-tight flex items-center gap-2">
                <Shield className="w-5 h-5 text-[#F6C138]" />
                <span>Security Posture</span>
              </h3>
              <div className="space-y-2 type-supporting text-xs text-zinc-300">
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-zinc-400">Auth Mechanism:</span>
                  <span className="font-mono text-[#F6C138] font-bold">HMAC-SHA256 JWT</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-zinc-400">Two-Factor Auth:</span>
                  <span className="font-mono text-emerald-400 font-bold">TOTP Enforced</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-zinc-400">Rate Limiter:</span>
                  <span className="font-mono text-white">120 req/min (Active)</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-zinc-400">Session Mode:</span>
                  <span className="font-mono text-white">Database Revocable</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Subtab 2: Audit Trail */}
      {subTab === 'audit' && (
        <div className="sv-card overflow-hidden shadow-2xl p-6 space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <h3 className="type-card-heading text-white tracking-tight flex items-center gap-2">
              <Clock className="w-5 h-5 text-zinc-400" />
              <span>Immutable Administrative Audit Trail</span>
            </h3>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={auditActionFilter}
                onChange={(e) => setAuditActionFilter(e.target.value)}
                placeholder="Filter by action (e.g. KILL_SWITCH, UPDATE)..."
                className="sv-input h-9 text-xs w-64"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/[0.03] border-b border-white/10 text-zinc-400 uppercase tracking-wider font-mono text-[11px]">
                <tr>
                  <th className="p-3.5 font-semibold">Action</th>
                  <th className="p-3.5 font-semibold">Target</th>
                  <th className="p-3.5 font-semibold">Admin</th>
                  <th className="p-3.5 font-semibold">Reason & IP</th>
                  <th className="p-3.5 font-semibold text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {auditLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-zinc-500 font-mono">
                      No matching audit records.
                    </td>
                  </tr>
                ) : (
                  auditLogs.map(log => (
                    <tr key={log.id} className="hover:bg-white/[0.02] transition-colors font-mono">
                      <td className="p-3.5 font-bold text-white text-[12px]">
                        {log.action}
                      </td>
                      <td className="p-3.5 text-zinc-300">
                        <span className="px-2 py-0.5 rounded bg-white/10 text-zinc-200">
                          {log.targetType}:{log.targetId}
                        </span>
                      </td>
                      <td className="p-3.5 font-sans font-semibold text-zinc-200">
                        {log.adminName} ({log.adminId})
                      </td>
                      <td className="p-3.5 font-sans text-zinc-400 max-w-xs truncate">
                        {log.reason}
                      </td>
                      <td className="p-3.5 text-right text-zinc-500">
                        {new Date(log.createdAt * 1000).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Subtab 3: Active Sessions */}
      {subTab === 'sessions' && (
        <div className="sv-card overflow-hidden shadow-2xl p-6 space-y-4">
          <h3 className="type-card-heading text-white tracking-tight flex items-center gap-2">
            <Lock className="w-5 h-5 text-purple-400" />
            <span>Active Administrative Sessions</span>
          </h3>
          <p className="type-supporting text-zinc-400 text-xs">
            Review live administrator sessions. Revoking a session immediately terminates its token validation on subsequent requests.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/[0.03] border-b border-white/10 text-zinc-400 uppercase tracking-wider font-mono text-[11px]">
                <tr>
                  <th className="p-3.5 font-semibold">Administrator</th>
                  <th className="p-3.5 font-semibold">Session ID & IP</th>
                  <th className="p-3.5 font-semibold">Created / Active</th>
                  <th className="p-3.5 font-semibold">Expires At</th>
                  <th className="p-3.5 font-semibold text-right">Revoke</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {sessions.map(s => (
                  <tr key={s.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-3.5">
                      <div className="font-heading font-bold text-white text-xs">{s.full_name || s.admin_id}</div>
                      <div className="text-zinc-400 font-mono text-[11px]">{s.email || s.role_name}</div>
                    </td>
                    <td className="p-3.5 font-mono text-zinc-300">
                      <div>{s.id}</div>
                      <div className="text-zinc-500 text-[10px]">IP: {s.ip_address}</div>
                    </td>
                    <td className="p-3.5 type-metadata text-zinc-400">
                      <div>Created: {new Date(s.created_at * 1000).toLocaleTimeString()}</div>
                      <div>Active: {new Date(s.last_active_at * 1000).toLocaleTimeString()}</div>
                    </td>
                    <td className="p-3.5 type-metadata text-zinc-400">
                      {new Date(s.expires_at * 1000).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => handleRevokeSession(s.id)}
                        className="sv-btn-secondary h-8 px-3 text-xs cursor-pointer text-red-400 hover:text-white hover:bg-red-950/40"
                      >
                        Revoke
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Subtab 4: RBAC Roles Matrix */}
      {subTab === 'rbac' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {roles.map(r => (
              <div key={r.id} className="sv-card p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-heading font-bold text-base text-white flex items-center gap-2">
                      <span>{r.name}</span>
                      <span className="type-metadata px-2 py-0.5 rounded bg-white/10 text-zinc-300 font-mono text-[10px]">
                        Lvl {r.hierarchyLevel}
                      </span>
                    </h4>
                    <p className="type-supporting text-zinc-400 text-xs mt-0.5">{r.description}</p>
                  </div>
                  <span className="type-metadata font-mono text-[#F6C138]">{r.id}</span>
                </div>

                <div className="space-y-1.5">
                  <span className="type-metadata text-zinc-400 font-bold uppercase tracking-wider block">
                    Assigned Permissions
                  </span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {r.permissions.length === 0 ? (
                      <span className="type-metadata text-zinc-500">No specific actions assigned</span>
                    ) : (
                      r.permissions.map((p, idx) => (
                        <span key={idx} className="type-metadata px-2.5 py-1 rounded bg-white/[0.04] border border-white/10 text-zinc-200">
                          {p.domain}:{p.action}
                        </span>
                      ))
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
