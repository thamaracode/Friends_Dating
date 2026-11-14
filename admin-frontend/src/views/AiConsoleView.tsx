import React, { useState, useEffect } from 'react';
import { 
  Cpu, 
  Sparkles, 
  Activity, 
  CheckCircle2, 
  Settings, 
  Sliders, 
  TrendingUp, 
  Zap,
  Check
} from 'lucide-react';
import { AdminApiClient } from '../services/adminApiClient';
import type { AdminAiProvider } from '../types/admin';

export const AiConsoleView: React.FC = () => {
  const [providers, setProviders] = useState<AdminAiProvider[]>([]);
  const [telemetry, setTelemetry] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [feedback, setFeedback] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [provRes, usageRes] = await Promise.all([
        AdminApiClient.getAiProviders(),
        AdminApiClient.getAiUsage()
      ]);
      setProviders(provRes.providers || []);
      setTelemetry(usageRes.telemetry || null);
    } catch (err: any) {
      setFeedback(`Failed to load AI infrastructure: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleGlobal = async (provider: AdminAiProvider) => {
    const nextState = !provider.isGloballyEnabled;
    try {
      await AdminApiClient.updateAiProvider(provider.id, { isGloballyEnabled: nextState });
      setFeedback(`Updated ${provider.name} availability to ${nextState ? 'ENABLED' : 'DISABLED'}`);
      loadData();
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      setFeedback(`❌ Update failed: ${err.message}`);
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  const handleToggleByok = async (provider: AdminAiProvider) => {
    const nextState = !provider.byokAllowed;
    try {
      await AdminApiClient.updateAiProvider(provider.id, { byokAllowed: nextState });
      setFeedback(`BYOAI permissions for ${provider.name} set to ${nextState ? 'ALLOWED' : 'BLOCKED'}`);
      loadData();
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      setFeedback(`❌ Update failed: ${err.message}`);
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  const handleUpdateRpm = async (provider: AdminAiProvider, rpm: number) => {
    try {
      await AdminApiClient.updateAiProvider(provider.id, { rateLimitRpm: rpm });
      setFeedback(`Updated RPM limit for ${provider.name} to ${rpm}`);
      loadData();
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      setFeedback(`❌ Update failed: ${err.message}`);
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* View Header */}
      <div>
        <h2 className="type-page-heading text-white tracking-tight">AI Infrastructure & Intelligence Console</h2>
        <p className="type-supporting text-zinc-400 mt-1">
          Control platform-level AI provider routing, rate limits, Bring Your Own AI (BYOAI) permissions, and model availability.
        </p>
      </div>

      {feedback && (
        <div className="p-3.5 rounded-xl bg-purple-950/40 border border-purple-500/30 text-purple-200 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
          <Check className="w-4 h-4 text-purple-400" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Telemetry Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <div className="sv-card p-5 space-y-2">
          <div className="type-metadata text-zinc-400 font-bold uppercase tracking-wider flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#F6C138]" />
            <span>Active BYOAI Connections</span>
          </div>
          <div className="text-3xl font-extrabold text-white font-mono">
            {telemetry?.activeUserConnections ?? 0}
          </div>
          <p className="type-supporting text-zinc-400 text-xs">
            User-configured API credentials across all adapters
          </p>
        </div>

        <div className="sv-card p-5 space-y-2">
          <div className="type-metadata text-zinc-400 font-bold uppercase tracking-wider flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            <span>AI Requests Dispatched</span>
          </div>
          <div className="text-3xl font-extrabold text-white font-mono">
            {telemetry?.totalRequests ?? 0}
          </div>
          <p className="type-supporting text-zinc-400 text-xs">
            Chat analyses, briefings & discovery suggestions
          </p>
        </div>

        <div className="sv-card p-5 space-y-2">
          <div className="type-metadata text-zinc-400 font-bold uppercase tracking-wider flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-purple-400" />
            <span>Tokens Consumed</span>
          </div>
          <div className="text-3xl font-extrabold text-white font-mono">
            {telemetry?.totalTokensConsumed ? telemetry.totalTokensConsumed.toLocaleString() : 0}
          </div>
          <p className="type-supporting text-zinc-400 text-xs">
            Prompt and completion tokens tracked
          </p>
        </div>
      </div>

      {/* Provider Matrix Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {providers.map(prov => (
          <div key={prov.id} className="sv-card p-6 space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-heading font-bold text-base text-white flex items-center gap-2">
                  <span>{prov.name}</span>
                  <span className="type-metadata px-2 py-0.5 rounded-md bg-white/10 text-zinc-300 font-mono text-[10px]">
                    {prov.id}
                  </span>
                </h4>
                <p className="type-supporting text-zinc-400 text-xs mt-0.5">
                  Default Model: <span className="text-white font-mono">{prov.defaultModel || 'Default'}</span>
                </p>
              </div>

              <button
                onClick={() => handleToggleGlobal(prov)}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs cursor-pointer transition-colors ${
                  prov.isGloballyEnabled
                    ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/40'
                    : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                }`}
              >
                {prov.isGloballyEnabled ? 'AVAILABLE ✓' : 'DISABLED'}
              </button>
            </div>

            {/* Allowed Models list */}
            <div className="space-y-1.5">
              <span className="type-metadata text-zinc-400 font-bold uppercase tracking-wider block">
                Allowed Models
              </span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {prov.allowedModels && prov.allowedModels.length > 0 ? (
                  prov.allowedModels.map(m => (
                    <span key={m} className="type-metadata px-2 py-1 rounded bg-white/[0.04] border border-white/10 text-zinc-200">
                      {m}
                    </span>
                  ))
                ) : (
                  <span className="type-metadata text-zinc-500">Auto-discovered by client</span>
                )}
              </div>
            </div>

            {/* Settings toggles */}
            <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id={`byok-${prov.id}`}
                  checked={prov.byokAllowed}
                  onChange={() => handleToggleByok(prov)}
                  className="accent-[#F6C138] cursor-pointer"
                />
                <label htmlFor={`byok-${prov.id}`} className="text-zinc-300 cursor-pointer">
                  Allow Users to BYOAI API Key
                </label>
              </div>

              <div className="flex items-center gap-2 font-mono">
                <span className="text-zinc-400">RPM:</span>
                <input
                  type="number"
                  min="5"
                  max="500"
                  step="5"
                  value={prov.rateLimitRpm}
                  onChange={(e) => handleUpdateRpm(prov, parseInt(e.target.value, 10))}
                  className="w-16 px-2 py-1 rounded bg-white/[0.06] border border-white/15 text-white text-right text-xs"
                />
              </div>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
};
