import React, { useState } from 'react';
import { 
  Bot, 
  Key, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  Eye, 
  EyeOff, 
  Cpu, 
  ExternalLink, 
  Lock, 
  Check, 
  Heart, 
  Zap, 
  Compass, 
  SlidersHorizontal 
} from 'lucide-react';
import { GlassModal, GlassButton } from '../klyven';
import { CustomAiService } from '../../services/customAiService';
import type { CustomAiConfig, AiProvider, AiPersona } from '../../types/customAi';

interface CustomAiSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigSaved?: () => void;
}

export const CustomAiSettingsModal: React.FC<CustomAiSettingsModalProps> = ({
  isOpen,
  onClose,
  onConfigSaved
}) => {
  const [config, setConfig] = useState<CustomAiConfig>(() => CustomAiService.getConfig());
  const [showKey, setShowKey] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success?: boolean; message?: string } | null>(null);
  const [savedFeedback, setSavedFeedback] = useState(false);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    if (!config.apiKey.trim()) {
      setTestResult({ success: false, message: 'Please enter an API key first' });
      return;
    }

    setTesting(true);
    setTestResult(null);

    const res = await CustomAiService.testConnection(config.provider, config.apiKey.trim());
    setTesting(false);
    if (res.success) {
      setTestResult({ success: true, message: res.message || 'API connection verified successfully!' });
    } else {
      setTestResult({ success: false, message: res.error || 'Failed to authenticate with provider' });
    }
  };

  const handleSave = () => {
    CustomAiService.updateConfig(config);
    setSavedFeedback(true);
    if (onConfigSaved) onConfigSaved();
    setTimeout(() => {
      setSavedFeedback(false);
      onClose();
    }, 1000);
  };

  const openAiModels = [
    { id: 'gpt-4o-mini', label: 'GPT-4o Mini (Fast, Cheap & Witty)' },
    { id: 'gpt-4o', label: 'GPT-4o (Deep Reasoning & High EQ)' },
    { id: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo (Legacy)' }
  ];

  const geminiModels = [
    { id: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash (Super Fast & Smart)' },
    { id: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro (Deep Nuance & Empathy)' },
    { id: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash (Next-Gen Preview)' }
  ];

  const personas: Array<{ id: AiPersona; label: string; icon: any; description: string }> = [
    {
      id: 'empath',
      label: 'Empathetic Relationship Coach',
      icon: Heart,
      description: 'Attuned to subtle emotions, vulnerability, and genuine human connection.'
    },
    {
      id: 'wingman',
      label: 'Charming Wingman',
      icon: Zap,
      description: 'Focuses on playful banter, confident humor, and effortless conversational spark.'
    },
    {
      id: 'deep_soul',
      label: 'Deep Soul Analyst',
      icon: Compass,
      description: 'Explores mutual psychological values, existential curiosity, and shared passions.'
    },
    {
      id: 'minimalist',
      label: 'Minimalist & Direct',
      icon: SlidersHorizontal,
      description: 'Concise, high-impact responses without flowery language or over-explaining.'
    }
  ];

  return (
    <GlassModal
      isOpen={isOpen}
      onClose={onClose}
      title="Custom AI API Helper (ChatGPT & Gemini BYOK)"
      maxWidth="lg"
    >
      <div className="space-y-5 text-xs animate-fadeIn">
        {/* Intro */}
        <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 space-y-1">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span className="font-bold text-white text-sm font-serif">Bring Your Own Key (BYOK)</span>
          </div>
          <p className="text-zinc-300 leading-relaxed text-[11px]">
            Connect your personal OpenAI or Google Gemini API key to power real-time conversation analysis, tone polish, and smart response generation directly in your private chats.
          </p>
        </div>

        {/* Master AI Activation Switch */}
        <div className="flex items-center justify-between p-3.5 rounded-2xl dark-glass border border-white/10">
          <div>
            <span className="font-bold text-white block text-sm">Enable Custom AI Assistant</span>
            <span className="text-[11px] text-zinc-400">Surface smart analysis and reply suggestions across messaging threads</span>
          </div>
          <button
            onClick={() => setConfig(prev => ({ ...prev, enabled: !prev.enabled }))}
            className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
              config.enabled ? 'bg-emerald-500' : 'bg-white/15'
            }`}
          >
            <div className={`w-4 h-4 rounded-full transition-transform ${
              config.enabled ? 'translate-x-6 bg-white' : 'translate-x-1 bg-white'
            }`} />
          </button>
        </div>

        {/* Provider Selection */}
        <div className="space-y-2">
          <label className="text-[11px] uppercase tracking-wider font-bold text-zinc-400 block">
            Select AI Intelligence Engine
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setConfig(prev => ({ 
                ...prev, 
                provider: 'openai', 
                model: 'gpt-4o-mini' 
              }))}
              className={`p-4 rounded-2xl border transition-all text-left cursor-pointer ${
                config.provider === 'openai'
                  ? 'bg-white text-[#090A0E] font-bold border-white shadow-lg'
                  : 'bg-white/[0.02] text-zinc-300 border-white/10 hover:bg-white/[0.06]'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-bold">OpenAI (ChatGPT)</span>
                {config.provider === 'openai' && <Check className="w-4 h-4 stroke-[3]" />}
              </div>
              <span className={`text-[10px] block ${config.provider === 'openai' ? 'text-zinc-700' : 'text-zinc-500'}`}>
                GPT-4o, GPT-4o-mini & ChatGPT models
              </span>
            </button>

            <button
              onClick={() => setConfig(prev => ({ 
                ...prev, 
                provider: 'gemini', 
                model: 'gemini-1.5-flash' 
              }))}
              className={`p-4 rounded-2xl border transition-all text-left cursor-pointer ${
                config.provider === 'gemini'
                  ? 'bg-white text-[#090A0E] font-bold border-white shadow-lg'
                  : 'bg-white/[0.02] text-zinc-300 border-white/10 hover:bg-white/[0.06]'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-bold">Google Gemini</span>
                {config.provider === 'gemini' && <Check className="w-4 h-4 stroke-[3]" />}
              </div>
              <span className={`text-[10px] block ${config.provider === 'gemini' ? 'text-zinc-700' : 'text-zinc-500'}`}>
                Gemini 1.5 Flash, 1.5 Pro & 2.0
              </span>
            </button>
          </div>
        </div>

        {/* API Key Input */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-[11px] uppercase tracking-wider font-bold text-zinc-400 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-zinc-300" />
              <span>{config.provider === 'openai' ? 'OpenAI Secret Key' : 'Google Gemini API Key'}</span>
            </label>
            <a
              href={config.provider === 'openai' ? 'https://platform.openai.com/api-keys' : 'https://aistudio.google.com/app/apikey'}
              target="_blank"
              rel="noreferrer"
              className="text-[10px] font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
            >
              <span>Get Free Key</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="relative">
            <input
              type={showKey ? 'text' : 'password'}
              value={config.apiKey}
              onChange={(e) => {
                setConfig(prev => ({ ...prev, apiKey: e.target.value }));
                setTestResult(null);
              }}
              placeholder={config.provider === 'openai' ? 'sk-...' : 'AIzaSy...'}
              className="w-full bg-black/60 border border-white/15 rounded-xl pl-3 pr-20 py-2.5 text-xs text-white placeholder-zinc-500 font-mono focus:outline-none focus:border-white/40"
            />
            <div className="absolute right-2 top-2 flex items-center gap-1">
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white cursor-pointer"
                title={showKey ? 'Hide key' : 'Show key'}
              >
                {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={testing || !config.apiKey.trim()}
                className="px-2 py-0.5 rounded-lg bg-white/10 hover:bg-white/20 text-[10px] font-bold text-white transition-colors cursor-pointer disabled:opacity-40"
              >
                {testing ? 'Pinging...' : 'Test'}
              </button>
            </div>
          </div>

          {/* Test connection feedback */}
          {testResult && (
            <div className={`p-2.5 rounded-xl border text-[11px] flex items-center gap-2 ${
              testResult.success 
                ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300' 
                : 'bg-rose-500/15 border-rose-500/30 text-rose-300'
            }`}>
              {testResult.success ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              ) : (
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
              )}
              <span>{testResult.message}</span>
            </div>
          )}
        </div>

        {/* Model Selector */}
        <div className="space-y-1.5">
          <label className="text-[11px] uppercase tracking-wider font-bold text-zinc-400 block">
            Target Model
          </label>
          <select
            value={config.model}
            onChange={(e) => setConfig(prev => ({ ...prev, model: e.target.value }))}
            className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-xs text-white"
          >
            {(config.provider === 'openai' ? openAiModels : geminiModels).map(m => (
              <option key={m.id} value={m.id}>{m.label}</option>
            ))}
          </select>
        </div>

        {/* Persona Selector */}
        <div className="space-y-2">
          <label className="text-[11px] uppercase tracking-wider font-bold text-zinc-400 block">
            AI Helper Persona & Tone
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {personas.map(p => {
              const Icon = p.icon;
              const isSelected = config.persona === p.id;
              return (
                <div
                  key={p.id}
                  onClick={() => setConfig(prev => ({ ...prev, persona: p.id }))}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-white text-[#090A0E] font-bold border-white shadow-md'
                      : 'bg-white/[0.02] text-zinc-300 border-white/10 hover:bg-white/[0.05]'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <span className="text-xs font-bold">{p.label}</span>
                  </div>
                  <p className={`text-[10px] leading-tight ${isSelected ? 'text-[#090A0E]/80' : 'text-zinc-400'}`}>
                    {p.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Privacy Cryptographic Notice */}
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/10 flex items-start gap-2 text-[10px] text-zinc-400">
          <Lock className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
          <span>
            <strong>Zero-Knowledge Key Storage:</strong> Your custom API key is kept strictly in your local browser sandbox and never written to administrative databases or shared with third parties.
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2 border-t border-white/10">
          <GlassButton variant="subtle" onClick={onClose} className="text-xs py-1.5 px-3">
            Cancel
          </GlassButton>
          <div className="flex items-center gap-2">
            {savedFeedback && (
              <span className="text-xs text-emerald-400 font-bold">✓ AI Settings Saved!</span>
            )}
            <GlassButton variant="primary" onClick={handleSave} className="text-xs py-1.5 px-5 font-bold">
              Save Configuration
            </GlassButton>
          </div>
        </div>
      </div>
    </GlassModal>
  );
};
