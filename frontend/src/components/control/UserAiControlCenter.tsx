import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Key,
  ShieldCheck,
  ShieldAlert,
  Sliders,
  DollarSign,
  Activity,
  Server,
  Plus,
  Trash2,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  X,
  Lock,
  ArrowRight,
  Info,
  Check,
  Cpu,
  Layers,
  ChevronDown,
  RotateCcw
} from 'lucide-react';
import { byoaiService } from '../../services/byoaiService';
import {
  AIProviderId,
  AIProviderInfo,
  AIModelInfo,
  UserAIConnection,
  TaskAIRoute,
  AIContextPermissions,
  AISpendingLimits,
  AIUsageSummary,
  AIUsageRecord,
  AITaskKey,
  TASK_DEFINITIONS
} from '../../types/byoai';

interface UserAiControlCenterProps {
  onClose?: () => void;
}

export const UserAiControlCenter: React.FC<UserAiControlCenterProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'connections' | 'routing' | 'permissions' | 'usage'>('connections');
  
  // Data State
  const [providers, setProviders] = useState<AIProviderInfo[]>([]);
  const [allModels, setAllModels] = useState<AIModelInfo[]>([]);
  const [connections, setConnections] = useState<UserAIConnection[]>([]);
  const [routing, setRouting] = useState<TaskAIRoute[]>([]);
  const [permissions, setPermissions] = useState<AIContextPermissions | null>(null);
  const [spendingLimits, setSpendingLimits] = useState<AISpendingLimits | null>(null);
  const [usageSummary, setUsageSummary] = useState<AIUsageSummary | null>(null);
  const [usageRecords, setUsageRecords] = useState<AIUsageRecord[]>([]);

  // UI state
  const [loading, setLoading] = useState(true);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ id: string; success: boolean; latencyMs?: number; error?: string } | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingConn, setEditingConn] = useState<UserAIConnection | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    provider: 'openai' as AIProviderId,
    name: '',
    apiKey: '',
    customEndpoint: '',
    defaultModel: 'gpt-4o-mini'
  });
  const [discoveredModels, setDiscoveredModels] = useState<AIModelInfo[]>([]);
  const [discovering, setDiscovering] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [provList, mdlList, connList, routeList, permList, usageData] = await Promise.all([
        byoaiService.getProviders(),
        byoaiService.getAllModels(),
        byoaiService.getConnections(),
        byoaiService.getRouting(),
        byoaiService.getPermissions(),
        byoaiService.getUsage()
      ]);

      setProviders(provList);
      setAllModels(mdlList);
      setConnections(connList);
      setRouting(routeList);
      setPermissions(permList);
      setSpendingLimits(usageData.limits);
      setUsageSummary(usageData.summary);
      setUsageRecords(usageData.records);
    } catch (err: any) {
      console.error('Failed to load AI Control Center data:', err);
      showToast('Error syncing with AI Control Center');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const unsub = byoaiService.subscribe(() => {
      // Background updates
    });
    return () => unsub();
  }, []);

  // Update default model options when provider changes in form
  useEffect(() => {
    const provModels = allModels.filter(m => m.provider === formData.provider);
    if (provModels.length > 0 && !provModels.some(m => m.id === formData.defaultModel)) {
      setFormData(prev => ({ ...prev, defaultModel: provModels[0].id }));
    }
  }, [formData.provider, allModels]);

  const handleTestConnection = async (id: string) => {
    setTestingId(id);
    setTestResult(null);
    try {
      const res = await byoaiService.testConnection(id);
      setTestResult({ id, success: res.success, latencyMs: res.latencyMs, error: res.error });
      loadData();
    } catch (err: any) {
      setTestResult({ id, success: false, error: err.message || 'Connection test failed' });
    } finally {
      setTestingId(null);
    }
  };

  const handleDiscoverModels = async (connId: string) => {
    setDiscovering(true);
    try {
      const discovered = await byoaiService.discoverModels(connId);
      setDiscoveredModels(discovered);
      showToast(`Discovered ${discovered.length} models from live endpoint!`);
    } catch (err: any) {
      showToast(err.message || 'Model discovery failed');
    } finally {
      setDiscovering(false);
    }
  };

  const handleSaveConnection = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingConn) {
        await byoaiService.updateConnection(editingConn.id, {
          name: formData.name,
          apiKey: formData.apiKey || undefined,
          customEndpoint: formData.customEndpoint || null,
          defaultModel: formData.defaultModel
        });
        showToast('Connection credentials updated securely');
      } else {
        await byoaiService.createConnection({
          provider: formData.provider,
          name: formData.name || `${formData.provider.toUpperCase()} Assistant`,
          apiKey: formData.apiKey,
          customEndpoint: formData.customEndpoint || undefined,
          defaultModel: formData.defaultModel
        });
        showToast('New AI connection encrypted and registered');
      }
      setShowAddModal(false);
      setEditingConn(null);
      setFormData({
        provider: 'openai',
        name: '',
        apiKey: '',
        customEndpoint: '',
        defaultModel: 'gpt-4o-mini'
      });
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to save connection');
    }
  };

  const handleDeleteConnection = async (id: string) => {
    if (window.confirm('Are you sure you want to revoke and delete this AI connection? Its encrypted key will be permanently purged from SQLite.')) {
      try {
        await byoaiService.deleteConnection(id);
        showToast('Connection revoked and key shredded');
        loadData();
      } catch (err: any) {
        showToast(err.message || 'Failed to delete connection');
      }
    }
  };

  const handleToggleConnection = async (conn: UserAIConnection) => {
    try {
      await byoaiService.updateConnection(conn.id, { isEnabled: !conn.isEnabled });
      loadData();
    } catch (err: any) {
      showToast('Failed to toggle connection state');
    }
  };

  const handleRoutingChange = (
    taskKey: AITaskKey,
    field: 'connectionId' | 'modelId' | 'allowFallback' | 'fallbackConnectionId' | 'fallbackModelId',
    value: any
  ) => {
    setRouting(prev => {
      const existing = prev.find(r => r.taskKey === taskKey);
      if (existing) {
        return prev.map(r => r.taskKey === taskKey ? { ...r, [field]: value } : r);
      } else {
        const primaryConn = connections[0];
        const newRoute: TaskAIRoute = {
          taskKey,
          connectionId: primaryConn?.id || '',
          modelId: primaryConn?.defaultModel || '',
          allowFallback: false,
          [field]: value
        };
        return [...prev, newRoute];
      }
    });
  };

  const handleSaveRouting = async () => {
    try {
      await byoaiService.updateRouting(routing);
      showToast('Task routing matrix successfully deployed');
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to save routing matrix');
    }
  };

  const handlePermissionToggle = async (key: keyof AIContextPermissions, value: any) => {
    if (!permissions) return;
    try {
      const updated = await byoaiService.updatePermissions({ [key]: value });
      setPermissions(updated);
      showToast('AI context clearance updated');
    } catch (err: any) {
      showToast('Failed to update permissions');
    }
  };

  const handleSaveSpendingLimits = async () => {
    if (!spendingLimits) return;
    try {
      const updated = await byoaiService.updateSpendingLimits(spendingLimits);
      setSpendingLimits(updated);
      showToast('Spending limits and thresholds saved');
    } catch (err: any) {
      showToast('Failed to update spending limits');
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#090A0E] text-slate-200 select-none overflow-hidden font-sans">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80 bg-slate-900/40 backdrop-blur-md">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500/20 via-purple-500/10 to-transparent border border-indigo-500/30 text-indigo-400">
            <Cpu className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-lg font-semibold tracking-wide text-white flex items-center gap-2">
              Bring Your Own AI (BYOAI)
              <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-mono">
                Envelope AES-256-GCM
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Decentralized multi-provider intelligence layer & task routing
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/60 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center px-6 border-b border-slate-800/60 bg-slate-950/40 gap-1">
        <button
          onClick={() => setActiveTab('connections')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-medium border-b-2 transition-all ${
            activeTab === 'connections'
              ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/30'
          }`}
        >
          <Key className="w-4 h-4" />
          My Providers & Keys ({connections.length})
        </button>

        <button
          onClick={() => setActiveTab('routing')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-medium border-b-2 transition-all ${
            activeTab === 'routing'
              ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/30'
          }`}
        >
          <Layers className="w-4 h-4" />
          Task Routing Matrix
        </button>

        <button
          onClick={() => setActiveTab('permissions')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-medium border-b-2 transition-all ${
            activeTab === 'permissions'
              ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/30'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          Data Clearance & Privacy
        </button>

        <button
          onClick={() => setActiveTab('usage')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-medium border-b-2 transition-all ${
            activeTab === 'usage'
              ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/30'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          Usage & Spending Limits
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Toast Alert */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 border border-indigo-500/40 text-slate-100 shadow-2xl shadow-indigo-500/20 text-xs animate-in fade-in slide-in-from-bottom-2">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            {toastMessage}
          </div>
        )}

        {/* TAB 1: CONNECTIONS */}
        {activeTab === 'connections' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-white">Active AI Connections</h3>
                <p className="text-xs text-slate-400">
                  Connect your personal API credentials from OpenAI, Google Gemini, Anthropic, Mistral, OpenRouter, or private Ollama instances.
                </p>
              </div>
              <button
                onClick={() => {
                  setEditingConn(null);
                  setFormData({
                    provider: 'openai',
                    name: 'My OpenAI Connection',
                    apiKey: '',
                    customEndpoint: '',
                    defaultModel: 'gpt-4o-mini'
                  });
                  setShowAddModal(true);
                }}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-all shadow-lg shadow-indigo-600/20"
              >
                <Plus className="w-4 h-4" />
                Connect New Provider
              </button>
            </div>

            {connections.length === 0 ? (
              <div className="p-8 rounded-2xl border border-dashed border-slate-800 bg-slate-900/20 text-center space-y-3">
                <div className="w-12 h-12 mx-auto rounded-xl bg-slate-800/60 flex items-center justify-center text-slate-400">
                  <Key className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-medium text-slate-200">No AI Providers Connected Yet</h4>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Add your personal ChatGPT, Gemini, Claude, or local Ollama API keys to enable live AI chat analysis, message polishing, and relationship memories.
                </p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="px-4 py-2 rounded-xl bg-indigo-600/80 hover:bg-indigo-600 text-white text-xs font-medium transition-all"
                >
                  Configure First Provider
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {connections.map(conn => {
                  const provInfo = providers.find(p => p.id === conn.provider);
                  const isTesting = testingId === conn.id;
                  const testInfo = testResult?.id === conn.id ? testResult : null;

                  return (
                    <div
                      key={conn.id}
                      className={`p-4 rounded-2xl border transition-all ${
                        conn.isEnabled
                          ? 'border-slate-800 bg-slate-900/40 hover:border-slate-700'
                          : 'border-slate-850 bg-slate-950/40 opacity-60'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-semibold text-white">{conn.name}</h4>
                            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                              {provInfo?.name || conn.provider}
                            </span>
                          </div>
                          <p className="text-xs font-mono text-slate-400 flex items-center gap-1.5">
                            <Lock className="w-3 h-3 text-emerald-400" />
                            {conn.keyMask}
                          </p>
                        </div>

                        {/* Status Badge */}
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              conn.lastStatus === 'online'
                                ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]'
                                : conn.lastStatus === 'offline' || conn.lastStatus === 'invalid_key'
                                ? 'bg-rose-400'
                                : conn.lastStatus === 'rate_limited'
                                ? 'bg-amber-400'
                                : 'bg-slate-500'
                            }`}
                          />
                          <span className="text-[11px] capitalize text-slate-400 font-mono">
                            {conn.lastStatus || 'untested'}
                          </span>
                        </div>
                      </div>

                      {conn.customEndpoint && (
                        <div className="mt-2 text-[11px] font-mono text-slate-400 truncate bg-slate-950/60 p-1.5 rounded-lg border border-slate-850">
                          Endpoint: {conn.customEndpoint}
                        </div>
                      )}

                      <div className="mt-3 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
                        <span>Default: <strong className="text-slate-200 font-mono">{conn.defaultModel}</strong></span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleToggleConnection(conn)}
                            className={`text-[11px] px-2 py-1 rounded-lg border transition-colors ${
                              conn.isEnabled
                                ? 'border-slate-700 text-slate-300 hover:bg-slate-800'
                                : 'border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10'
                            }`}
                          >
                            {conn.isEnabled ? 'Disable' : 'Enable'}
                          </button>

                          <button
                            disabled={isTesting}
                            onClick={() => handleTestConnection(conn.id)}
                            className="flex items-center gap-1 text-[11px] px-2 py-1 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 transition-colors"
                          >
                            <RefreshCw className={`w-3 h-3 ${isTesting ? 'animate-spin' : ''}`} />
                            Test
                          </button>

                          <button
                            onClick={() => {
                              setEditingConn(conn);
                              setFormData({
                                provider: conn.provider,
                                name: conn.name,
                                apiKey: '',
                                customEndpoint: conn.customEndpoint || '',
                                defaultModel: conn.defaultModel
                              });
                              setShowAddModal(true);
                            }}
                            className="text-[11px] px-2 py-1 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() => handleDeleteConnection(conn.id)}
                            className="p-1 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Live Test Feedback */}
                      {testInfo && (
                        <div
                          className={`mt-2.5 p-2 rounded-xl text-xs flex items-center justify-between ${
                            testInfo.success
                              ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-300'
                              : 'bg-rose-500/10 border border-rose-500/20 text-rose-300'
                          }`}
                        >
                          <div className="flex items-center gap-1.5">
                            {testInfo.success ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                            )}
                            <span>{testInfo.success ? 'Connection Verified' : testInfo.error || 'Authentication Failed'}</span>
                          </div>
                          {testInfo.latencyMs !== undefined && (
                            <span className="font-mono text-[10px] text-slate-400">{testInfo.latencyMs}ms</span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: ROUTING MATRIX */}
        {activeTab === 'routing' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-white">Task-Specific AI Assignment Matrix</h3>
                <p className="text-xs text-slate-400">
                  Assign specialized AI models for different features across Soulverse. Select models optimized for emotional nuance, speed, or reasoning.
                </p>
              </div>
              <button
                onClick={handleSaveRouting}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-all shadow-lg shadow-indigo-600/20"
              >
                <Check className="w-4 h-4" />
                Save Routing Matrix
              </button>
            </div>

            {connections.length === 0 ? (
              <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/30 text-center text-xs text-slate-400">
                Please connect at least one AI provider in the "My Providers & Keys" tab before configuring routing.
              </div>
            ) : (
              <div className="space-y-3">
                {Object.values(TASK_DEFINITIONS).map(task => {
                  const currentRoute = routing.find(r => r.taskKey === task.key);
                  const activeConnId = currentRoute?.connectionId || connections[0]?.id || '';
                  const activeModelId = currentRoute?.modelId || connections[0]?.defaultModel || '';
                  const allowFallback = currentRoute?.allowFallback || false;
                  const fallbackConnId = currentRoute?.fallbackConnectionId || '';
                  const fallbackModelId = currentRoute?.fallbackModelId || '';

                  // Models available for selected connection
                  const selectedConn = connections.find(c => c.id === activeConnId);
                  const availableModels = allModels.filter(m => m.provider === selectedConn?.provider);

                  const fallbackConn = connections.find(c => c.id === fallbackConnId);
                  const fallbackModels = allModels.filter(m => m.provider === fallbackConn?.provider);

                  return (
                    <div
                      key={task.key}
                      className="p-4 rounded-2xl border border-slate-800/80 bg-slate-900/30 hover:border-slate-700/80 transition-all space-y-3"
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-white">{task.title}</span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                              {task.category}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5">{task.description}</p>
                        </div>

                        {/* Primary Model Assignment */}
                        <div className="flex items-center gap-2">
                          <select
                            value={activeConnId}
                            onChange={e => {
                              const newConnId = e.target.value;
                              const c = connections.find(x => x.id === newConnId);
                              handleRoutingChange(task.key, 'connectionId', newConnId);
                              if (c) handleRoutingChange(task.key, 'modelId', c.defaultModel);
                            }}
                            className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                          >
                            {connections.map(c => (
                              <option key={c.id} value={c.id}>
                                {c.name} ({c.provider})
                              </option>
                            ))}
                          </select>

                          <select
                            value={activeModelId}
                            onChange={e => handleRoutingChange(task.key, 'modelId', e.target.value)}
                            className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                          >
                            {availableModels.map(m => (
                              <option key={m.id} value={m.id}>
                                {m.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Explicit Fallback Consent Option */}
                      <div className="pt-2.5 border-t border-slate-800/40 flex flex-col md:flex-row md:items-center justify-between text-xs text-slate-400 gap-2">
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={allowFallback}
                            onChange={e => handleRoutingChange(task.key, 'allowFallback', e.target.checked)}
                            className="rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-0"
                          />
                          <span className="text-[11px] text-slate-300">
                            Allow automatic fallback during outages (Requires explicit consent to switch providers)
                          </span>
                        </label>

                        {allowFallback && (
                          <div className="flex items-center gap-2 pl-6 md:pl-0">
                            <span className="text-[11px] text-slate-500">Fallback:</span>
                            <select
                              value={fallbackConnId}
                              onChange={e => {
                                const fbId = e.target.value;
                                const c = connections.find(x => x.id === fbId);
                                handleRoutingChange(task.key, 'fallbackConnectionId', fbId);
                                if (c) handleRoutingChange(task.key, 'fallbackModelId', c.defaultModel);
                              }}
                              className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-[11px] text-slate-300 font-mono"
                            >
                              <option value="">Select Fallback Provider</option>
                              {connections.filter(c => c.id !== activeConnId).map(c => (
                                <option key={c.id} value={c.id}>
                                  {c.name}
                                </option>
                              ))}
                            </select>

                            {fallbackModels.length > 0 && (
                              <select
                                value={fallbackModelId}
                                onChange={e => handleRoutingChange(task.key, 'fallbackModelId', e.target.value)}
                                className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-[11px] text-slate-300 font-mono"
                              >
                                {fallbackModels.map(m => (
                                  <option key={m.id} value={m.id}>
                                    {m.name}
                                  </option>
                                ))}
                              </select>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: DATA CLEARANCE & PERMISSIONS */}
        {activeTab === 'permissions' && permissions && (
          <div className="space-y-6 max-w-3xl">
            <div>
              <h3 className="text-sm font-semibold text-white">Granular Context Clearance & Zero-Knowledge Privacy</h3>
              <p className="text-xs text-slate-400">
                You possess absolute authority over what data is sent into AI prompts. Sensitive Sanctuary notes and journals are strictly locked by default.
              </p>
            </div>

            {/* Master Cloud Sharing Kill Switch */}
            <div className="p-4 rounded-2xl border border-indigo-500/30 bg-gradient-to-r from-indigo-500/10 via-purple-500/5 to-transparent flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-indigo-400" />
                  <span className="text-xs font-semibold text-white">External AI Transmission Switch</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Master kill switch. When disabled, no profile data or messages will ever be transmitted to third-party AI APIs.
                </p>
              </div>
              <input
                type="checkbox"
                checked={permissions.allowExternalSharing}
                onChange={e => handlePermissionToggle('allowExternalSharing', e.target.checked)}
                className="w-5 h-5 rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-0"
              />
            </div>

            <div className="space-y-3">
              {/* Profile Data */}
              <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/30 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-200">Include Profile Demographics & Interests</span>
                  <p className="text-[11px] text-slate-400">
                    Transmits matched partner's public interests, passions, and bio for conversational grounding.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={permissions.allowProfileData}
                  onChange={e => handlePermissionToggle('allowProfileData', e.target.checked)}
                  className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-0"
                />
              </div>

              {/* Chat History */}
              <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-slate-200">Recent Conversation History Context</span>
                    <p className="text-[11px] text-slate-400">
                      Supplies recent chat messages to evaluate conversational vibe, chemistry, and suggested replies.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={permissions.allowChatHistory}
                    onChange={e => handlePermissionToggle('allowChatHistory', e.target.checked)}
                    className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-0"
                  />
                </div>

                {permissions.allowChatHistory && (
                  <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
                    <span>Message history depth limit:</span>
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min="3"
                        max="30"
                        step="1"
                        value={permissions.maxChatHistoryMessages}
                        onChange={e => handlePermissionToggle('maxChatHistoryMessages', Number(e.target.value))}
                        className="w-32 accent-indigo-500"
                      />
                      <span className="font-mono text-white text-xs w-8 text-right">
                        {permissions.maxChatHistoryMessages} msgs
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Strict Zero Knowledge: Relationship Vault */}
              <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/30 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-200">Relationship Vault & Private Memory Notes</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
                      Zero-Knowledge Default: OFF
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Strict zero-knowledge privacy. When enabled, your private notes and reminders about partners can inform AI memory.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={permissions.allowRelationshipVault}
                  onChange={e => handlePermissionToggle('allowRelationshipVault', e.target.checked)}
                  className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-0"
                />
              </div>

              {/* Strict Zero Knowledge: Sanctuary Journals */}
              <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/30 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-200">Sanctuary Midnight Thoughts & Unsent Words</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
                      Zero-Knowledge Default: OFF
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Reflective personal journal entries. Never transmitted unless explicitly requested for introspective guidance.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={permissions.allowJournals}
                  onChange={e => handlePermissionToggle('allowJournals', e.target.checked)}
                  className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-0"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: USAGE & SPENDING LIMITS */}
        {activeTab === 'usage' && spendingLimits && usageSummary && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-white">Usage Monitoring & Spending Guardrails</h3>
              <p className="text-xs text-slate-400">
                Track personal token consumption and enforce strict daily and monthly budget caps with auto-suspension.
              </p>
            </div>

            {/* Metric KPI cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/40 space-y-1">
                <span className="text-[11px] text-slate-400">Today's Estimated Cost</span>
                <p className="text-xl font-bold font-mono text-emerald-400">
                  ${usageSummary.dailyCost.toFixed(4)}
                </p>
                <span className="text-[10px] text-slate-500 font-mono">
                  {usageSummary.dailyRequests} requests today
                </span>
              </div>

              <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/40 space-y-1">
                <span className="text-[11px] text-slate-400">30-Day Billing Window</span>
                <p className="text-xl font-bold font-mono text-indigo-400">
                  ${usageSummary.monthlyCost.toFixed(4)}
                </p>
                <span className="text-[10px] text-slate-500 font-mono">
                  {usageSummary.monthlyRequests} requests total
                </span>
              </div>

              <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/40 space-y-1">
                <span className="text-[11px] text-slate-400">Tokens Processed</span>
                <p className="text-xl font-bold font-mono text-slate-200">
                  {usageSummary.totalTokens.toLocaleString()}
                </p>
                <span className="text-[10px] text-slate-500 font-mono">Across all tasks</span>
              </div>

              <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/40 space-y-1">
                <span className="text-[11px] text-slate-400">Budget Guard Status</span>
                <p className={`text-xl font-bold flex items-center gap-1.5 ${
                  spendingLimits.isSuspended ? 'text-rose-400' : 'text-emerald-400'
                }`}>
                  {spendingLimits.isSuspended ? 'Suspended' : 'Clear & Active'}
                </p>
                <span className="text-[10px] text-slate-500 font-mono">Auto-cutoff armed</span>
              </div>
            </div>

            {/* Budget Configuration Card */}
            <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/30 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-semibold text-white uppercase tracking-wider">
                  Spending Limits & Auto-Suspension Controls
                </h4>
                <button
                  onClick={handleSaveSpendingLimits}
                  className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-all"
                >
                  Apply Caps
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-300">Daily Cap ($ USD)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    max="100"
                    value={spendingLimits.dailyBudgetUsd}
                    onChange={e => setSpendingLimits({ ...spendingLimits, dailyBudgetUsd: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-indigo-500"
                  />
                  <p className="text-[10px] text-slate-500">Halts requests if daily cost exceeds this threshold.</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-slate-300">Monthly Cap ($ USD)</label>
                  <input
                    type="number"
                    step="5"
                    min="5"
                    max="500"
                    value={spendingLimits.monthlyBudgetUsd}
                    onChange={e => setSpendingLimits({ ...spendingLimits, monthlyBudgetUsd: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-indigo-500"
                  />
                  <p className="text-[10px] text-slate-500">Halts requests if 30-day usage exceeds this threshold.</p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-300">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={spendingLimits.autoSuspendOnLimit}
                    onChange={e => setSpendingLimits({ ...spendingLimits, autoSuspendOnLimit: e.target.checked })}
                    className="rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-0"
                  />
                  <span>Automatically freeze AI requests upon reaching budget limit</span>
                </label>

                {spendingLimits.isSuspended && (
                  <button
                    onClick={() => {
                      setSpendingLimits({ ...spendingLimits, isSuspended: false });
                      byoaiService.updateSpendingLimits({ isSuspended: false });
                      showToast('AI requests manually resumed');
                    }}
                    className="flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 underline"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Manually Reset Suspension
                  </button>
                )}
              </div>
            </div>

            {/* Recent Request Telemetry Log */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-white uppercase tracking-wider">
                Recent AI Request Telemetry ({usageRecords.length})
              </h4>

              {usageRecords.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500 border border-slate-800/80 rounded-2xl bg-slate-950/40">
                  No requests recorded yet.
                </div>
              ) : (
                <div className="border border-slate-800/80 rounded-2xl overflow-hidden bg-slate-950/40">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-900/60 text-slate-400 font-mono text-[10px] uppercase border-b border-slate-800">
                      <tr>
                        <th className="p-3">Time</th>
                        <th className="p-3">Task</th>
                        <th className="p-3">Provider / Model</th>
                        <th className="p-3">Tokens</th>
                        <th className="p-3">Latency</th>
                        <th className="p-3 text-right">Cost</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-850">
                      {usageRecords.slice(0, 15).map(record => (
                        <tr key={record.id} className="hover:bg-slate-900/30 font-mono text-slate-300">
                          <td className="p-3 text-[11px] text-slate-500">
                            {new Date(record.createdAt).toLocaleTimeString()}
                          </td>
                          <td className="p-3 font-sans text-slate-200">
                            {TASK_DEFINITIONS[record.taskKey]?.title || record.taskKey}
                          </td>
                          <td className="p-3 text-[11px] text-slate-400">
                            <span className="text-indigo-400 font-semibold">{record.provider}</span> / {record.model}
                          </td>
                          <td className="p-3 text-[11px]">
                            {record.totalTokens.toLocaleString()}
                          </td>
                          <td className="p-3 text-[11px] text-slate-400">
                            {record.latencyMs}ms
                          </td>
                          <td className="p-3 text-[11px] text-right font-semibold text-emerald-400">
                            ${record.estimatedCostUsd.toFixed(5)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* MODAL: Connect or Edit AI Provider */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-[#0E1017] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-900/50">
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-semibold text-white">
                  {editingConn ? 'Edit AI Provider Connection' : 'Connect New AI Provider'}
                </h3>
              </div>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingConn(null);
                }}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveConnection} className="p-5 space-y-4 text-xs">
              {/* Provider Selection */}
              {!editingConn && (
                <div className="space-y-1.5">
                  <label className="text-slate-300 font-medium">Select AI Provider</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {providers.map(p => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, provider: p.id })}
                        className={`p-2.5 rounded-xl border text-left transition-all ${
                          formData.provider === p.id
                            ? 'border-indigo-500 bg-indigo-500/10 text-white'
                            : 'border-slate-800 bg-slate-900/30 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <span className="block font-semibold text-slate-200">{p.name}</span>
                        <span className="block text-[10px] text-slate-500 font-mono mt-0.5">
                          {p.id === 'ollama' ? 'Local Private' : p.id === 'custom_openai' ? 'Self-Hosted' : 'Cloud API'}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Name */}
              <div className="space-y-1.5">
                <label className="text-slate-300 font-medium">Connection Display Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. My Personal Claude, Work GPT-4"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* API Key */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-slate-300 font-medium">
                    {editingConn ? 'Replace API Key (leave blank to retain current)' : 'API Key / Secret'}
                  </label>
                  <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    AES-256-GCM Envelope Encrypted
                  </span>
                </div>
                <input
                  type="password"
                  required={!editingConn && formData.provider !== 'ollama'}
                  placeholder={formData.provider === 'ollama' ? 'Optional for local Ollama' : 'sk-... or AIzaSy...'}
                  value={formData.apiKey}
                  onChange={e => setFormData({ ...formData, apiKey: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 font-mono text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Custom Endpoint (for Custom or Ollama) */}
              {(formData.provider === 'custom_openai' || formData.provider === 'ollama') && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-slate-300 font-medium">Custom API Endpoint URL</label>
                    <span className="text-[10px] text-slate-500">SSRF Protected</span>
                  </div>
                  <input
                    type="url"
                    placeholder={formData.provider === 'ollama' ? 'http://localhost:11434' : 'https://api.together.xyz/v1'}
                    value={formData.customEndpoint}
                    onChange={e => setFormData({ ...formData, customEndpoint: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 font-mono text-white focus:outline-none focus:border-indigo-500"
                  />
                  <p className="text-[10px] text-slate-500">
                    Must be valid HTTP/HTTPS. Private cloud metadata IPs (169.254.169.254) are rejected by server firewall.
                  </p>
                </div>
              )}

              {/* Default Model */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-slate-300 font-medium">Default Model</label>
                  {editingConn && (
                    <button
                      type="button"
                      disabled={discovering}
                      onClick={() => handleDiscoverModels(editingConn.id)}
                      className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                    >
                      <RefreshCw className={`w-3 h-3 ${discovering ? 'animate-spin' : ''}`} />
                      Discover from Endpoint
                    </button>
                  )}
                </div>

                <select
                  value={formData.defaultModel}
                  onChange={e => setFormData({ ...formData, defaultModel: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-indigo-500"
                >
                  {(discoveredModels.length > 0
                    ? discoveredModels
                    : allModels.filter(m => m.provider === formData.provider)
                  ).map(m => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.id})
                    </option>
                  ))}
                  {/* Allow custom model entry if not in known list */}
                  {formData.provider === 'custom_openai' && (
                    <option value="custom-model">Custom Model</option>
                  )}
                </select>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium shadow-lg shadow-indigo-600/20"
                >
                  {editingConn ? 'Update Connection' : 'Save & Encrypt Key'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
