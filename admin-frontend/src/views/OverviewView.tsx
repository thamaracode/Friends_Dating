import React, { useEffect, useState } from 'react';
import { 
  Activity, 
  Layers, 
  Users, 
  Database, 
  AlertTriangle, 
  Clock, 
  ArrowUpRight, 
  ShieldAlert, 
  CheckCircle2,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { AdminApiClient } from '../services/adminApiClient';
import type { SystemHealth, AuditLogEntry, AdminFeature } from '../types/admin';

interface OverviewViewProps {
  onNavigateTab: (tab: string) => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({ onNavigateTab }) => {
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [features, setFeatures] = useState<AdminFeature[]>([]);
  const [recentLogs, setRecentLogs] = useState<AuditLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [healthData, featData, logsData] = await Promise.all([
        AdminApiClient.getHealth().catch(() => null),
        AdminApiClient.getFeatures().catch(() => ({ features: [] })),
        AdminApiClient.getAuditLogs({ limit: 6 }).catch(() => ({ logs: [] }))
      ]);

      if (healthData) setHealth(healthData);
      setFeatures(featData.features || []);
      setRecentLogs(logsData.logs || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load telemetry');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const killSwitchedFeatures = features.filter(f => f.isKillSwitched);
  const enabledCount = features.filter(f => f.state === 'enabled' || f.isGloballyEnabled).length;

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Top Banner & Quick Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="type-page-heading text-white tracking-tight">Executive Dashboard</h2>
          <p className="type-supporting text-zinc-400 mt-1">
            Real-time infrastructure health, feature lifecycle states, and security posture.
          </p>
        </div>

        <button
          onClick={loadData}
          disabled={isLoading}
          className="sv-btn-secondary h-10 px-4 text-xs cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Telemetry</span>
        </button>
      </div>

      {/* Emergency Kill Switches Alert Banner */}
      {killSwitchedFeatures.length > 0 && (
        <div className="p-5 rounded-2xl bg-red-950/40 border border-red-500/40 shadow-xl space-y-2 animate-pulse">
          <div className="flex items-center gap-2.5 text-red-300 font-bold text-sm">
            <ShieldAlert className="w-5 h-5 text-red-400 shrink-0" />
            <span>CRITICAL ALERT: {killSwitchedFeatures.length} Feature(s) Under Emergency Kill-Switch</span>
          </div>
          <div className="flex items-center gap-3 flex-wrap text-xs text-red-200">
            {killSwitchedFeatures.map(f => (
              <span key={f.id} className="px-3 py-1 rounded-lg bg-red-900/50 border border-red-500/30 font-mono">
                {f.name}: {f.killSwitchReason || 'Manually halted'}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Key Metric Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        
        {/* Metric 1: Active Features */}
        <div 
          onClick={() => onNavigateTab('features')}
          className="sv-card-interactive p-6 space-y-3 shadow-lg"
        >
          <div className="flex items-center justify-between text-zinc-400">
            <span className="type-metadata font-bold uppercase tracking-wider">Features Registered</span>
            <Layers className="w-5 h-5 text-[#F6C138]" />
          </div>
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-extrabold text-white font-mono">{enabledCount}</span>
            <span className="text-xs text-zinc-400">/ {features.length} active</span>
          </div>
          <p className="type-supporting text-zinc-400 flex items-center gap-1 text-xs text-[#F6C138]">
            <span>Manage rollout & flags</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </p>
        </div>

        {/* Metric 2: Total Registered Users */}
        <div 
          onClick={() => onNavigateTab('users')}
          className="sv-card-interactive p-6 space-y-3 shadow-lg"
        >
          <div className="flex items-center justify-between text-zinc-400">
            <span className="type-metadata font-bold uppercase tracking-wider">Platform Accounts</span>
            <Users className="w-5 h-5 text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-extrabold text-white font-mono">
              {health?.counts.totalUsers ?? '...'}
            </span>
            <span className="text-xs text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Authoritative</span>
            </span>
          </div>
          <p className="type-supporting text-zinc-400 flex items-center gap-1 text-xs text-cyan-300">
            <span>Inspect directory & safety</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </p>
        </div>

        {/* Metric 3: Active Admin Sessions */}
        <div 
          onClick={() => onNavigateTab('system')}
          className="sv-card-interactive p-6 space-y-3 shadow-lg"
        >
          <div className="flex items-center justify-between text-zinc-400">
            <span className="type-metadata font-bold uppercase tracking-wider">Admin Sessions</span>
            <Activity className="w-5 h-5 text-purple-400" />
          </div>
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-extrabold text-white font-mono">
              {health?.counts.activeAdminSessions ?? 1}
            </span>
            <span className="text-xs text-zinc-400">active sessions</span>
          </div>
          <p className="type-supporting text-zinc-400 flex items-center gap-1 text-xs text-purple-300">
            <span>Session revocation & audit</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </p>
        </div>

        {/* Metric 4: Database Storage & Uptime */}
        <div 
          onClick={() => onNavigateTab('system')}
          className="sv-card-interactive p-6 space-y-3 shadow-lg"
        >
          <div className="flex items-center justify-between text-zinc-400">
            <span className="type-metadata font-bold uppercase tracking-wider">Database Size</span>
            <Database className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-extrabold text-white font-mono">
              {health?.database.sizeMb ?? '0.00'} MB
            </span>
            <span className="text-xs text-zinc-400 font-mono">WAL mode</span>
          </div>
          <p className="type-supporting text-zinc-400 flex items-center gap-1 text-xs text-emerald-300">
            <span>Checkpoint & Vacuum</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </p>
        </div>

      </div>

      {/* Two Column Layout: Quick Actions & Recent Audit Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Col: Operations Switchboard */}
        <div className="sv-card p-6 space-y-5">
          <h3 className="type-card-heading text-white tracking-tight flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#F6C138]" />
            <span>Administrative Controls</span>
          </h3>

          <div className="space-y-3">
            <button
              onClick={() => onNavigateTab('features')}
              className="w-full p-4 rounded-xl bg-white/[0.03] border border-white/10 hover:border-[#F6C138]/40 hover:bg-white/[0.06] text-left transition-all cursor-pointer flex items-center justify-between group"
            >
              <div>
                <div className="font-semibold text-sm text-white group-hover:text-[#F6C138] transition-colors">
                  Central Feature Registry
                </div>
                <div className="type-supporting text-zinc-400 text-xs">
                  Rollout %, beta access, kill-switches, regions
                </div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-zinc-400 group-hover:text-[#F6C138]" />
            </button>

            <button
              onClick={() => onNavigateTab('users')}
              className="w-full p-4 rounded-xl bg-white/[0.03] border border-white/10 hover:border-cyan-400/40 hover:bg-white/[0.06] text-left transition-all cursor-pointer flex items-center justify-between group"
            >
              <div>
                <div className="font-semibold text-sm text-white group-hover:text-cyan-300 transition-colors">
                  Moderation & Abuse Queue
                </div>
                <div className="type-supporting text-zinc-400 text-xs">
                  Review reported users, blocks, verification
                </div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-zinc-400 group-hover:text-cyan-300" />
            </button>

            <button
              onClick={() => onNavigateTab('ai')}
              className="w-full p-4 rounded-xl bg-white/[0.03] border border-white/10 hover:border-purple-400/40 hover:bg-white/[0.06] text-left transition-all cursor-pointer flex items-center justify-between group"
            >
              <div>
                <div className="font-semibold text-sm text-white group-hover:text-purple-300 transition-colors">
                  AI Infrastructure Console
                </div>
                <div className="type-supporting text-zinc-400 text-xs">
                  Global model providers, BYOAI rate limits
                </div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-zinc-400 group-hover:text-purple-300" />
            </button>

            <button
              onClick={() => onNavigateTab('quotes')}
              className="w-full p-4 rounded-xl bg-white/[0.03] border border-white/10 hover:border-amber-400/40 hover:bg-white/[0.06] text-left transition-all cursor-pointer flex items-center justify-between group"
            >
              <div>
                <div className="font-semibold text-sm text-white group-hover:text-amber-300 transition-colors">
                  Quotes & Wisdom Sanctuary
                </div>
                <div className="type-supporting text-zinc-400 text-xs">
                  Curated quotes repository, API providers
                </div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-zinc-400 group-hover:text-amber-300" />
            </button>
          </div>
        </div>

        {/* Right Col: Live Audit Trail */}
        <div className="lg:col-span-2 sv-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="type-card-heading text-white tracking-tight flex items-center gap-2">
              <Clock className="w-4 h-4 text-zinc-400" />
              <span>Recent Immutable Audit Trail</span>
            </h3>
            <button
              onClick={() => onNavigateTab('system')}
              className="type-metadata text-[#F6C138] hover:underline cursor-pointer"
            >
              View All Logs ›
            </button>
          </div>

          <div className="space-y-3">
            {recentLogs.length === 0 ? (
              <div className="text-center py-10 text-zinc-500 text-xs font-mono">
                No recent audit log entries.
              </div>
            ) : (
              recentLogs.map(log => (
                <div 
                  key={log.id} 
                  className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between gap-4 text-xs"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white font-mono">{log.action}</span>
                      <span className="type-metadata px-2 py-0.5 rounded-md bg-white/10 text-zinc-300">
                        {log.targetType}:{log.targetId}
                      </span>
                    </div>
                    <div className="text-zinc-400 text-[11px] truncate">
                      By <span className="text-zinc-200 font-semibold">{log.adminName}</span> • {log.reason}
                    </div>
                  </div>

                  <span className="type-metadata text-zinc-500 shrink-0 font-mono">
                    {new Date(log.createdAt * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
