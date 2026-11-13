import React from 'react';
import { 
  X, 
  ShieldCheck, 
  Cpu, 
  Bell, 
  Sparkles, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Lock, 
  Compass, 
  Zap, 
  Link2,
  Database
} from 'lucide-react';
import { GlassModal, GlassButton, GlassPrimaryButton } from '../klyven';
import type { EvaluatedFeature, RegisteredFeature } from '../../types/featureControl';
import { FeatureControlService } from '../../services/featureControlService';

interface FeatureDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  feature: EvaluatedFeature | null;
  registryMeta?: RegisteredFeature | null;
  onUpdated: () => void;
}

export const FeatureDetailModal: React.FC<FeatureDetailModalProps> = ({
  isOpen,
  onClose,
  feature,
  registryMeta,
  onUpdated
}) => {
  if (!isOpen || !feature) return null;

  const isEnabled = feature.effectiveState === 'enabled';
  const isPaused = feature.effectiveState === 'paused';
  const isRestricted = feature.effectiveState === 'restricted';
  const isUnavailable = feature.effectiveState === 'unavailable';

  const handleToggleState = async () => {
    const nextState = isEnabled ? 'disabled' : 'enabled';
    await FeatureControlService.updateFeaturePreference(feature.id, {
      state: nextState
    });
    onUpdated();
  };

  const handleToggleVisibility = async () => {
    await FeatureControlService.updateFeaturePreference(feature.id, {
      isVisible: !feature.isVisible
    });
    onUpdated();
  };

  const handleToggleDiscoverable = async () => {
    await FeatureControlService.updateFeaturePreference(feature.id, {
      isDiscoverable: !feature.isDiscoverable
    });
    onUpdated();
  };

  const handlePause24Hours = async () => {
    await FeatureControlService.updateFeaturePreference(feature.id, {
      state: 'paused',
      pausedDurationMs: 24 * 60 * 60 * 1000 // 24 hours
    });
    onUpdated();
  };

  return (
    <GlassModal
      isOpen={isOpen}
      onClose={onClose}
      title={feature.name}
      subtitle={`Module Specification • ${feature.category.toUpperCase()}`}
      maxWidth="2xl"
    >
      <div className="space-y-6 max-h-[75vh] overflow-y-auto no-scrollbar pr-1">
        
        {/* Header Status Banner */}
        <div className="p-4 rounded-2xl dark-glass border border-white/10 flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${
                isEnabled ? 'bg-emerald-400 shadow-[0_0_8px_#10B981]' : 
                isPaused ? 'bg-amber-400 shadow-[0_0_8px_#F59E0B]' :
                isRestricted ? 'bg-purple-400' :
                'bg-zinc-600'
              }`} />
              <span className="font-bold text-sm text-white capitalize">
                State: {feature.effectiveState}
              </span>
              {feature.isPremium && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/25">
                  SOULVERSE PLUS
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-400">{feature.reason}</p>
          </div>

          <div className="flex items-center gap-2">
            {!isUnavailable && !isRestricted && (
              <GlassButton
                variant={isEnabled ? 'danger' : 'primary'}
                onClick={handleToggleState}
                className="text-xs py-1.5 px-3"
              >
                {isEnabled ? 'Turn Off Module' : 'Activate Module'}
              </GlassButton>
            )}
          </div>
        </div>

        {/* 1. What is this feature? & Why would somebody use it? */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-zinc-300" />
            <span>1. What is this module?</span>
          </h4>
          <p className="text-sm text-zinc-200 leading-relaxed font-serif">
            {registryMeta?.description || feature.tagline}
          </p>
        </div>

        {/* 2. Privacy & Data Collection Transparency */}
        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>2. Data Collection & Privacy Transparency</span>
          </h4>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-zinc-500 block mb-1">Information Collected:</span>
              <div className="flex flex-wrap gap-1.5">
                {(registryMeta?.collectedData || ['Voluntary profile reflections']).map((item, i) => (
                  <span key={i} className="px-2 py-0.5 rounded-lg bg-white/5 border border-white/10 text-zinc-300 text-[11px]">
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <span className="text-zinc-500 block mb-1">Audience & Visibility:</span>
              <p className="text-zinc-300 text-[11px] font-medium">
                {registryMeta?.visibility_audience || 'Configured by your privacy filters'}
              </p>
              <div className="mt-2 text-[10px] text-zinc-400 flex items-center gap-1">
                <Lock className="w-3 h-3 text-emerald-400" />
                <span>Classification: {feature.privacyLevel.replace('_', ' ')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Dependencies & Hardware Requirements */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
          <div className="p-3 rounded-xl dark-glass border border-white/10">
            <Cpu className="w-4 h-4 mx-auto mb-1 text-zinc-400" />
            <span className="text-[10px] text-zinc-500 block">Requires AI</span>
            <span className={`text-xs font-bold ${feature.requiresAi ? 'text-amber-300' : 'text-zinc-400'}`}>
              {feature.requiresAi ? 'Yes (Local)' : 'No AI Required'}
            </span>
          </div>

          <div className="p-3 rounded-xl dark-glass border border-white/10">
            <Bell className="w-4 h-4 mx-auto mb-1 text-zinc-400" />
            <span className="text-[10px] text-zinc-500 block">Notifications</span>
            <span className={`text-xs font-bold ${feature.requiresNotifications ? 'text-rose-300' : 'text-zinc-400'}`}>
              {feature.requiresNotifications ? 'Optional Alerts' : 'Silent'}
            </span>
          </div>

          <div className="p-3 rounded-xl dark-glass border border-white/10">
            <Zap className="w-4 h-4 mx-auto mb-1 text-zinc-400" />
            <span className="text-[10px] text-zinc-500 block">Tier</span>
            <span className={`text-xs font-bold ${feature.isPremium ? 'text-amber-400' : 'text-emerald-400'}`}>
              {feature.isPremium ? 'Plus / Sovereign' : 'Free Standard'}
            </span>
          </div>

          <div className="p-3 rounded-xl dark-glass border border-white/10">
            <Database className="w-4 h-4 mx-auto mb-1 text-zinc-400" />
            <span className="text-[10px] text-zinc-500 block">Data Protection</span>
            <span className="text-xs font-bold text-zinc-300">
              Zero Wipe Guarantee
            </span>
          </div>
        </div>

        {/* 4. Disable Behavior & Data Retention Guarantee */}
        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-zinc-300" />
            <span>4. What happens when you turn this off?</span>
          </h4>
          <p className="text-xs text-zinc-300 leading-relaxed">
            {registryMeta?.disable_behavior || 'The module is cleanly unmounted from your views. Your existing records are safely preserved.'}
          </p>
          <p className="text-[11px] text-emerald-400/90 font-medium pt-1">
            ✓ {registryMeta?.data_retention_rule || 'Zero automatic deletion policy. Re-enabling restores your full history.'}
          </p>
        </div>

        {/* 5. Granular Surface Visibility Controls */}
        <div className="p-4 rounded-2xl dark-glass border border-white/10 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
            5. Presentation & Discovery Controls
          </h4>

          <div className="space-y-2">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.04]">
              <div>
                <span className="text-xs font-bold text-white block">Surface in Navigation</span>
                <span className="text-[11px] text-zinc-400">Show this feature in the app navigation and header docks</span>
              </div>
              <button
                onClick={handleToggleVisibility}
                disabled={!isEnabled}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                  feature.isVisible && isEnabled ? 'bg-white' : 'bg-white/15'
                } ${!isEnabled ? 'opacity-40 cursor-not-allowed' : ''}`}
              >
                <div className={`w-4 h-4 rounded-full transition-transform ${
                  feature.isVisible && isEnabled ? 'translate-x-6 bg-[#090A0E]' : 'translate-x-1 bg-white'
                }`} />
              </button>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.04]">
              <div>
                <span className="text-xs font-bold text-white block">Contextual Discoverability</span>
                <span className="text-[11px] text-zinc-400">Allow tips and recommendations to mention this feature</span>
              </div>
              <button
                onClick={handleToggleDiscoverable}
                disabled={!isEnabled}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                  feature.isDiscoverable && isEnabled ? 'bg-white' : 'bg-white/15'
                } ${!isEnabled ? 'opacity-40 cursor-not-allowed' : ''}`}
              >
                <div className={`w-4 h-4 rounded-full transition-transform ${
                  feature.isDiscoverable && isEnabled ? 'translate-x-6 bg-[#090A0E]' : 'translate-x-1 bg-white'
                }`} />
              </button>
            </div>

            {isEnabled && (
              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-zinc-400">Need a quiet break without disabling?</span>
                <GlassButton
                  variant="subtle"
                  onClick={handlePause24Hours}
                  className="text-xs py-1 px-3"
                >
                  <Clock className="w-3 h-3 mr-1" />
                  Pause for 24 Hours
                </GlassButton>
              </div>
            )}
          </div>
        </div>

      </div>

      <div className="pt-4 border-t border-white/10 flex justify-end">
        <GlassButton variant="primary" onClick={onClose} className="text-xs py-2 px-5">
          Done
        </GlassButton>
      </div>
    </GlassModal>
  );
};
