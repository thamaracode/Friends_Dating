import React, { useState, useEffect } from 'react';
import { 
  Layers, 
  Search, 
  Filter, 
  ShieldAlert, 
  CheckCircle2, 
  RotateCcw, 
  Save, 
  Sliders, 
  Sparkles,
  AlertTriangle,
  History,
  Check
} from 'lucide-react';
import { AdminApiClient } from '../services/adminApiClient';
import type { AdminFeature } from '../types/admin';

export const FeatureRegistryView: React.FC = () => {
  const [features, setFeatures] = useState<AdminFeature[]>([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFeature, setSelectedFeature] = useState<AdminFeature | null>(null);

  // Snapshot & Rollback states
  const [isSnapshotModalOpen, setIsSnapshotModalOpen] = useState(false);
  const [snapshots, setSnapshots] = useState<any[]>([]);
  const [snapshotSummary, setSnapshotSummary] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);

  const loadFeatures = async () => {
    setIsLoading(true);
    try {
      const res = await AdminApiClient.getFeatures();
      setFeatures(res.features || []);
    } catch (err: any) {
      setFeedback(`Error loading features: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFeatures();
  }, []);

  const handleUpdateState = async (featureId: string, newState: AdminFeature['state']) => {
    try {
      await AdminApiClient.updateFeature(featureId, { state: newState });
      setFeedback(`Updated feature ${featureId} to state '${newState}'`);
      loadFeatures();
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      alert(`Update failed: ${err.message}`);
    }
  };

  const handleUpdateRollout = async (featureId: string, rolloutPercentage: number) => {
    try {
      await AdminApiClient.updateFeature(featureId, { rolloutPercentage });
      setFeedback(`Updated feature ${featureId} rollout to ${rolloutPercentage}%`);
      loadFeatures();
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      alert(`Rollout update failed: ${err.message}`);
    }
  };

  const handleToggleKillSwitch = async (feature: AdminFeature) => {
    const nextActive = !feature.isKillSwitched;
    let reason = 'Manual emergency halt by administrator';
    if (nextActive) {
      const inputReason = prompt(`Enter reason for activating emergency kill-switch on ${feature.name}:`, reason);
      if (inputReason === null) return;
      reason = inputReason.trim() || reason;
    }

    try {
      await AdminApiClient.toggleKillSwitch(feature.id, nextActive, reason);
      setFeedback(nextActive ? `🚨 Kill switch ACTIVATED for ${feature.name}` : `Kill switch deactivated for ${feature.name}`);
      loadFeatures();
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: any) {
      alert(`Kill-switch action failed: ${err.message}`);
    }
  };

  const handleCreateSnapshot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!snapshotSummary.trim()) return;

    try {
      await AdminApiClient.createSnapshot(snapshotSummary.trim());
      setFeedback('Configuration snapshot successfully created!');
      setSnapshotSummary('');
      const vers = await AdminApiClient.getSnapshots();
      setSnapshots(vers.versions || []);
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      alert(`Snapshot creation failed: ${err.message}`);
    }
  };

  const handleRollback = async (versionId: string, versionNumber: number) => {
    if (!confirm(`Are you sure you want to rollback all feature flags to Version ${versionNumber}?`)) return;

    try {
      await AdminApiClient.rollbackSnapshot(versionId, `Rollback to Version ${versionNumber}`);
      setFeedback(`Configuration successfully restored to Version ${versionNumber}!`);
      loadFeatures();
      setIsSnapshotModalOpen(false);
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: any) {
      alert(`Rollback failed: ${err.message}`);
    }
  };

  const openSnapshotModal = async () => {
    setIsSnapshotModalOpen(true);
    try {
      const res = await AdminApiClient.getSnapshots();
      setSnapshots(res.versions || []);
    } catch (err) {
      console.error(err);
    }
  };

  const filteredFeatures = features.filter(f => {
    const matchesCategory = categoryFilter === 'all' || f.category === categoryFilter;
    const q = search.toLowerCase().trim();
    const matchesSearch = !q || f.name.toLowerCase().includes(q) || f.id.toLowerCase().includes(q) || f.tagline.toLowerCase().includes(q);
    return matchesCategory && matchesSearch;
  });

  const categories = ['all', ...Array.from(new Set(features.map(f => f.category)))];

  const stateColors: Record<AdminFeature['state'], string> = {
    available: 'bg-blue-900/40 text-blue-300 border-blue-500/30',
    enabled: 'bg-emerald-900/40 text-emerald-300 border-emerald-500/30',
    disabled: 'bg-zinc-800 text-zinc-400 border-zinc-600/30',
    restricted: 'bg-amber-900/40 text-amber-300 border-amber-500/30',
    paused: 'bg-yellow-900/40 text-yellow-300 border-yellow-500/30',
    maintenance: 'bg-orange-900/40 text-orange-300 border-orange-500/30',
    beta: 'bg-purple-900/40 text-purple-300 border-purple-500/30',
    deprecated: 'bg-red-950/40 text-red-400 border-red-500/30'
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="type-page-heading text-white tracking-tight">Central Feature Registry</h2>
          <p className="type-supporting text-zinc-400 mt-1">
            Configure global feature lifecycle states, rollout percentages, regional bounds, and emergency kill switches.
          </p>
        </div>

        <button
          onClick={openSnapshotModal}
          className="sv-btn-gold h-10 px-4 text-xs font-bold cursor-pointer self-start sm:self-auto"
        >
          <History className="w-4 h-4" />
          <span>Snapshots & Rollback</span>
        </button>
      </div>

      {feedback && (
        <div className="p-3.5 rounded-xl bg-[#F6C138]/10 border border-[#F6C138]/30 text-[#F6C138] text-xs font-semibold flex items-center gap-2 animate-fadeIn">
          <Check className="w-4 h-4" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/10">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search features by name, ID or description..."
            className="sv-input w-full pl-10 text-xs"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`h-9 px-3.5 rounded-xl text-xs font-heading font-semibold capitalize whitespace-nowrap transition-colors cursor-pointer ${
                categoryFilter === cat
                  ? 'bg-white text-[#090A0E]'
                  : 'bg-white/[0.04] text-zinc-400 hover:text-white border border-white/5'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Feature Flags Data Table */}
      <div className="sv-card overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-white/[0.03] border-b border-white/10 text-zinc-400 uppercase tracking-wider font-mono text-[11px]">
              <tr>
                <th className="p-4 font-semibold">Feature & Domain</th>
                <th className="p-4 font-semibold">Lifecycle State</th>
                <th className="p-4 font-semibold">Rollout Percentage</th>
                <th className="p-4 font-semibold">Allowed Regions</th>
                <th className="p-4 font-semibold">Kill-Switch</th>
                <th className="p-4 font-semibold text-right">Dependencies</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-zinc-500 font-mono">
                    Loading feature registry...
                  </td>
                </tr>
              ) : filteredFeatures.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-zinc-500">
                    No matching features found.
                  </td>
                </tr>
              ) : (
                filteredFeatures.map(feat => (
                  <tr key={feat.id} className="hover:bg-white/[0.02] transition-colors">
                    
                    {/* Column 1: Feature identity */}
                    <td className="p-4">
                      <div className="space-y-0.5">
                        <div className="font-heading font-bold text-sm text-white flex items-center gap-2">
                          <span>{feat.name}</span>
                          {feat.isPremium && (
                            <span className="type-metadata px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-300 font-mono text-[10px]">
                              PREMIUM
                            </span>
                          )}
                        </div>
                        <div className="font-mono text-[11px] text-zinc-400">{feat.id}</div>
                        <p className="type-supporting text-zinc-400 text-[11px] max-w-sm truncate">
                          {feat.tagline}
                        </p>
                      </div>
                    </td>

                    {/* Column 2: 8 Lifecycle States Dropdown */}
                    <td className="p-4">
                      <select
                        value={feat.state}
                        onChange={(e) => handleUpdateState(feat.id, e.target.value as AdminFeature['state'])}
                        className={`px-3 py-1.5 rounded-xl border font-bold capitalize text-xs cursor-pointer focus:outline-none ${stateColors[feat.state] || 'bg-white/10 text-white'}`}
                      >
                        <option value="available" className="bg-[#12141B] text-blue-300">Available</option>
                        <option value="enabled" className="bg-[#12141B] text-emerald-300">Enabled</option>
                        <option value="disabled" className="bg-[#12141B] text-zinc-400">Disabled</option>
                        <option value="restricted" className="bg-[#12141B] text-amber-300">Restricted</option>
                        <option value="paused" className="bg-[#12141B] text-yellow-300">Paused</option>
                        <option value="maintenance" className="bg-[#12141B] text-orange-300">Maintenance</option>
                        <option value="beta" className="bg-[#12141B] text-purple-300">Beta</option>
                        <option value="deprecated" className="bg-[#12141B] text-red-400">Deprecated</option>
                      </select>
                    </td>

                    {/* Column 3: Rollout Slider */}
                    <td className="p-4">
                      <div className="space-y-1.5 w-36">
                        <div className="flex items-center justify-between font-mono text-[11px]">
                          <span className="text-zinc-400">Gradual:</span>
                          <span className="font-bold text-white">{feat.rolloutPercentage}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          step="5"
                          value={feat.rolloutPercentage}
                          onChange={(e) => handleUpdateRollout(feat.id, parseInt(e.target.value, 10))}
                          className="w-full accent-[#F6C138] cursor-pointer"
                        />
                      </div>
                    </td>

                    {/* Column 4: Regions */}
                    <td className="p-4">
                      <div className="flex items-center gap-1 flex-wrap">
                        {feat.allowedRegions.map(reg => (
                          <span key={reg} className="type-metadata px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-zinc-300">
                            {reg}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Column 5: Kill-Switch Button */}
                    <td className="p-4">
                      <button
                        onClick={() => handleToggleKillSwitch(feat)}
                        className={`h-9 px-3 rounded-xl font-bold flex items-center gap-1.5 cursor-pointer text-xs transition-colors ${
                          feat.isKillSwitched
                            ? 'bg-red-600 text-white shadow-lg animate-pulse'
                            : 'bg-white/[0.05] border border-white/10 text-zinc-300 hover:border-red-500/40 hover:text-red-300'
                        }`}
                      >
                        <ShieldAlert className="w-3.5 h-3.5" />
                        <span>{feat.isKillSwitched ? 'HALTED' : 'Active'}</span>
                      </button>
                    </td>

                    {/* Column 6: Dependencies */}
                    <td className="p-4 text-right">
                      {feat.dependencies.length > 0 ? (
                        <div className="flex items-center justify-end gap-1 flex-wrap">
                          {feat.dependencies.map(dep => (
                            <span key={dep} className="type-metadata px-2 py-0.5 rounded bg-cyan-950/40 text-cyan-300 border border-cyan-500/20">
                              {dep.replace('feat_', '')}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="type-metadata text-zinc-600">None</span>
                      )}
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Snapshot & Rollback Modal */}
      {isSnapshotModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="sv-card w-full max-w-2xl max-h-[85vh] overflow-y-auto no-scrollbar p-6 space-y-6 border-white/20">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="type-card-heading text-white tracking-tight flex items-center gap-2">
                <History className="w-5 h-5 text-[#F6C138]" />
                <span>Configuration Snapshots & Rollback</span>
              </h3>
              <button 
                onClick={() => setIsSnapshotModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-zinc-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Create Snapshot Form */}
            <form onSubmit={handleCreateSnapshot} className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-3">
              <span className="type-metadata text-zinc-400 font-bold uppercase tracking-wider block">
                Capture Current State
              </span>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={snapshotSummary}
                  onChange={(e) => setSnapshotSummary(e.target.value)}
                  placeholder="Summary of changes (e.g. Pre-v7.50 release snapshot)"
                  className="sv-input flex-1 text-xs"
                  required
                />
                <button type="submit" className="sv-btn-gold px-4 text-xs font-bold cursor-pointer">
                  Save Snapshot
                </button>
              </div>
            </form>

            {/* Historical Snapshots Table */}
            <div className="space-y-3">
              <span className="type-metadata text-zinc-400 font-bold uppercase tracking-wider block">
                Saved Versions (Click to Rollback)
              </span>

              {snapshots.length === 0 ? (
                <div className="p-6 text-center text-zinc-500 font-mono text-xs">
                  No historical snapshots recorded yet.
                </div>
              ) : (
                <div className="space-y-2">
                  {snapshots.map(s => (
                    <div 
                      key={s.id} 
                      className="p-4 rounded-xl bg-white/[0.02] border border-white/10 flex items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-md bg-[#F6C138]/20 text-[#F6C138] font-mono font-bold text-xs">
                            v{s.version_number}
                          </span>
                          <span className="font-semibold text-white text-xs">{s.change_summary}</span>
                        </div>
                        <div className="type-metadata text-zinc-500">
                          Captured by {s.created_by} • {new Date(s.created_at * 1000).toLocaleString()}
                        </div>
                      </div>

                      <button
                        onClick={() => handleRollback(s.id, s.version_number)}
                        className="sv-btn-secondary h-9 px-3 text-xs font-semibold cursor-pointer text-amber-300 hover:text-white"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Rollback to v{s.version_number}</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
