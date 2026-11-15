import React, { useState } from 'react';
import { 
  X, 
  Layers, 
  Check, 
  Copy, 
  ArrowRight, 
  Shield, 
  Flame, 
  Eye, 
  Sliders, 
  Compass,
  Cpu,
  Heart
} from 'lucide-react';
import { GlassCard } from './GlassCard';
import { SpotlightCard } from './SpotlightCard';
import { ShimmerButton } from './ShimmerButton';
import { ShineBorder } from './ShineBorder';
import { GlassBadge } from './GlassBadge';
import { GlassInput } from './GlassInput';

export interface GlinGlassShowcaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlinGlassShowcaseModal: React.FC<GlinGlassShowcaseModalProps> = ({
  isOpen,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'cards' | 'buttons' | 'inputs' | 'about'>('cards');
  const [isThemeEnabled, setIsThemeEnabled] = useState(() => {
    return document.documentElement.getAttribute('data-glin-theme') === 'glass';
  });
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  if (!isOpen) return null;

  const toggleTheme = () => {
    const nextState = !isThemeEnabled;
    setIsThemeEnabled(nextState);
    if (nextState) {
      document.documentElement.setAttribute('data-glin-theme', 'glass');
      localStorage.setItem('soulverse_glin_glass', 'true');
    } else {
      document.documentElement.removeAttribute('data-glin-theme');
      localStorage.setItem('soulverse_glin_glass', 'false');
    }
  };

  const handleCopy = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-xl animate-in fade-in">
      <div className="w-full max-w-4xl max-h-[90vh] glin-glass-frosted rounded-3xl overflow-hidden shadow-2xl flex flex-col border border-white/20 animate-in zoom-in-95">
        
        {/* Modal Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl glin-glass-liquid border border-rose-500/40 flex items-center justify-center text-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.25)]">
              <Heart className="w-5 h-5 fill-rose-500/30" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight">GlinUI Liquid Glass Engine</h2>
                <GlassBadge variant="amber">v3 Glass System</GlassBadge>
              </div>
              <p className="text-xs text-zinc-400">
                Physics-based frosted glass, optical refraction, and Apple visionOS aesthetics
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Theme Activation Button */}
            <button
              onClick={toggleTheme}
              className={`h-9 px-3.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                isThemeEnabled
                  ? 'glin-glass-liquid text-amber-300 border border-amber-400/50 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                  : 'bg-white/10 text-zinc-300 hover:text-white border border-white/10'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${isThemeEnabled ? 'bg-amber-400 animate-pulse' : 'bg-zinc-500'}`} />
              <span>{isThemeEnabled ? 'Glass Theme Active' : 'Activate Glass Theme'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="px-6 border-b border-white/10 flex gap-2 pt-3 bg-black/20">
          {(['cards', 'buttons', 'inputs', 'about'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 px-3 text-xs font-semibold capitalize border-b-2 transition-colors cursor-pointer ${
                activeTab === tab
                  ? 'border-amber-400 text-amber-300'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {tab === 'cards' && 'Glass Surfaces & Spotlights'}
              {tab === 'buttons' && 'Tactile & Shimmer Buttons'}
              {tab === 'inputs' && 'Wells & Badges'}
              {tab === 'about' && 'Physics & Architecture'}
            </button>
          ))}
        </div>

        {/* Modal Scrollable Content Area */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 max-h-[calc(90vh-140px)]">
          
          {/* TAB 1: CARDS & SURFACES */}
          {activeTab === 'cards' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-zinc-200 mb-1">Optical Depth Surfaces</h3>
                <p className="text-xs text-zinc-400 mb-4">
                  GlinUI couples <code>saturate(180%)</code> with backdrop-blur and a physical light refraction top edge.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Frosted VisionOS Card */}
                  <GlassCard variant="frosted" interactive className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <GlassBadge variant="emerald">VisionOS Frosted</GlassBadge>
                      <span className="text-[10px] text-zinc-400">blur(40px)</span>
                    </div>
                    <h4 className="text-base font-bold text-white mb-1">Diffuse Liquid Frosted</h4>
                    <p className="text-xs text-zinc-300/80 mb-4">
                      Top edge light refraction highlight with dual specular inner shadows for tangible physical depth.
                    </p>
                    <div className="flex items-center gap-2 text-xs text-amber-300 font-medium">
                      <span>Hover for elevation physics</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </GlassCard>

                  {/* Liquid Specular Card */}
                  <GlassCard variant="liquid" interactive className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <GlassBadge variant="amber">Liquid Specular</GlassBadge>
                      <span className="text-[10px] text-zinc-400">saturate(180%)</span>
                    </div>
                    <h4 className="text-base font-bold text-white mb-1">Fluid Specular Reflection</h4>
                    <p className="text-xs text-zinc-300/80 mb-4">
                      Multi-angle radial light gradients simulating light interacting with real curved liquid glass.
                    </p>
                    <div className="flex items-center gap-2 text-xs text-amber-300 font-medium">
                      <span>Fluid touch feedback</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </GlassCard>

                  {/* Cursor Spotlight Card */}
                  <SpotlightCard
                    spotlightColor="rgba(246, 193, 56, 0.22)"
                    spotlightSize={360}
                    className="p-5 md:col-span-2"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <GlassBadge variant="violet">Cursor Spotlight Card</GlassBadge>
                      <span className="text-[10px] text-zinc-400">Pointer Tracker</span>
                    </div>
                    <h4 className="text-base font-bold text-white mb-1">Dynamic Cursor Refraction</h4>
                    <p className="text-xs text-zinc-300/80 mb-4">
                      Move your cursor across this card. Notice the specular radial highlight illuminating the glass surface following your mouse trajectory.
                    </p>
                    <div className="flex items-center gap-3">
                      <ShimmerButton variant="amber" size="sm">
                        <Flame className="w-3.5 h-3.5" />
                        <span>Interactive Pulse</span>
                      </ShimmerButton>
                      <GlassBadge variant="frosted">Zero Frame Drop</GlassBadge>
                    </div>
                  </SpotlightCard>

                  {/* Shine Border Card */}
                  <ShineBorder borderWidth={1.5} duration={10} shineColor="rgba(246, 193, 56, 0.85)" className="md:col-span-2">
                    <div className="glin-glass-liquid p-5 rounded-[inherit]">
                      <div className="flex items-center justify-between mb-3">
                        <GlassBadge variant="amber">ShineBorder Primitive</GlassBadge>
                        <span className="text-[10px] text-amber-300 animate-pulse">Orbiting Light Rim</span>
                      </div>
                      <h4 className="text-base font-bold text-white mb-1">Animated Iridescent Border</h4>
                      <p className="text-xs text-zinc-300/80">
                        Adapted directly from Magic UI & GlinUI shine border. Smooth masked gradient that glides seamlessly around the glass contour.
                      </p>
                    </div>
                  </ShineBorder>

                </div>
              </div>
            </div>
          )}

          {/* TAB 2: BUTTONS */}
          {activeTab === 'buttons' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-zinc-200 mb-1">Tactile & Shimmer Controls</h3>
                <p className="text-xs text-zinc-400 mb-4">
                  Buttons feature internal light sweeps, tactile compression on click, and specular top borders.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  <div className="glin-glass-well p-5 rounded-2xl flex flex-col gap-3">
                    <span className="text-xs font-semibold text-zinc-300">Shimmer Light Sweep (Amber)</span>
                    <ShimmerButton variant="amber" size="md">
                      <Heart className="w-4 h-4 fill-amber-300/30" />
                      <span>Shimmer Gold Action</span>
                    </ShimmerButton>
                    <span className="text-[11px] text-zinc-400">Sweeping 2.4s light ray with haptic hover state</span>
                  </div>

                  <div className="glin-glass-well p-5 rounded-2xl flex flex-col gap-3">
                    <span className="text-xs font-semibold text-zinc-300">Liquid Glass Button</span>
                    <ShimmerButton variant="glass" size="md">
                      <Heart className="w-4 h-4 text-rose-400" />
                      <span>Liquid Glass Tactile</span>
                    </ShimmerButton>
                    <span className="text-[11px] text-zinc-400">Frosted translucent background with edge highlights</span>
                  </div>

                  <div className="glin-glass-well p-5 rounded-2xl flex flex-col gap-3">
                    <span className="text-xs font-semibold text-zinc-300">Small Shimmer Action</span>
                    <div className="flex gap-2">
                      <ShimmerButton variant="primary" size="sm">
                        <span>Save Soul Echo</span>
                      </ShimmerButton>
                      <ShimmerButton variant="ghost" size="sm">
                        <span>Dismiss</span>
                      </ShimmerButton>
                    </div>
                    <span className="text-[11px] text-zinc-400">Compact controls for headers and toolbars</span>
                  </div>

                  <div className="glin-glass-well p-5 rounded-2xl flex flex-col gap-3">
                    <span className="text-xs font-semibold text-zinc-300">Large Hero CTA</span>
                    <ShimmerButton variant="amber" size="lg">
                      <span>Begin Sanctuary Journey</span>
                      <ArrowRight className="w-4 h-4" />
                    </ShimmerButton>
                    <span className="text-[11px] text-zinc-400">High-conversion primary hero button</span>
                  </div>

                </div>
              </div>
            </div>
          )}

          {/* TAB 3: WELLS & BADGES */}
          {activeTab === 'inputs' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-zinc-200 mb-1">Recessed Wells, Inputs & Status Badges</h3>
                <p className="text-xs text-zinc-400 mb-4">
                  Recessed elements sit below the glass plane using inset shadows, giving tactile depth.
                </p>

                <div className="space-y-4">
                  <div className="glin-glass-liquid p-5 rounded-2xl space-y-3">
                    <span className="text-xs font-semibold text-zinc-300">Glass Well Input Field</span>
                    <GlassInput 
                      placeholder="Write your soul reflection or question..."
                      icon={<Compass className="w-4 h-4" />}
                    />
                    <GlassInput 
                      placeholder="Search connections or topics..."
                      icon={<Sliders className="w-4 h-4" />}
                      endAdornment={<GlassBadge variant="amber">Enter ↵</GlassBadge>}
                    />
                  </div>

                  <div className="glin-glass-liquid p-5 rounded-2xl space-y-3">
                    <span className="text-xs font-semibold text-zinc-300">Refraction Status Badges</span>
                    <div className="flex flex-wrap gap-2.5">
                      <GlassBadge variant="frosted">Frosted Default</GlassBadge>
                      <GlassBadge variant="liquid">Liquid Specular</GlassBadge>
                      <GlassBadge variant="amber" pulse>Live Resonance</GlassBadge>
                      <GlassBadge variant="emerald">AI Online</GlassBadge>
                      <GlassBadge variant="violet">Consciousness</GlassBadge>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: ARCHITECTURE & PHYSICS */}
          {activeTab === 'about' && (
            <div className="space-y-4 text-xs text-zinc-300 leading-relaxed">
              <div className="glin-glass-liquid p-5 rounded-2xl border border-white/10 space-y-3">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-amber-300" />
                  <span>The Physics of GlinUI Liquid Glass</span>
                </h4>
                <p>
                  Old "glassmorphism" in 2021 was merely a flat semi-transparent block with a basic CSS blur filter. It often looked muddy, washed out, and had poor contrast against dark backgrounds.
                </p>
                <p>
                  <strong>GlinUI fixes this with real optical physics:</strong>
                </p>
                <ul className="list-disc pl-5 space-y-2 text-zinc-300/90">
                  <li>
                    <strong>Vibrancy Boosting:</strong> <code>saturate(180%)</code> is always paired with blur to prevent dull, grayed-out backgrounds.
                  </li>
                  <li>
                    <strong>Light Refraction Top Edge:</strong> <code>--glass-refraction-top</code> ensures the top border is physically brighter than the sides, replicating physical overhead ambient light bouncing off glass bevels.
                  </li>
                  <li>
                    <strong>Dual Specular Inner Rings:</strong> <code>inset 0 1px 1px 0 rgba(255,255,255,0.25)</code> creates the crisp highlight of authentic glass edges.
                  </li>
                  <li>
                    <strong>WCAG AA Legibility:</strong> Dark mode glass surfaces maintain a readable opacity floor so that text never loses contrast against scrolling content beneath.
                  </li>
                </ul>
              </div>

              <div className="glin-glass-well p-4 rounded-xl flex items-center justify-between text-zinc-400">
                <span>Integrated from <strong>github.com/glincker/glinui</strong></span>
                <button
                  onClick={() => handleCopy('import { GlassCard, ShimmerButton, SpotlightCard } from "@/components/glinui";', 'import_code')}
                  className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[11px] font-mono flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedCode === 'import_code' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedCode === 'import_code' ? 'Copied' : 'Copy Imports'}</span>
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-white/10 flex items-center justify-between bg-black/40">
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <span className={`w-2 h-2 rounded-full ${isThemeEnabled ? 'bg-amber-400' : 'bg-zinc-600'}`} />
            <span>Theme: <strong>{isThemeEnabled ? 'GlinUI Liquid Glass' : 'Classic Obsidian'}</strong></span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold cursor-pointer transition-colors"
          >
            Close Playground
          </button>
        </div>

      </div>
    </div>
  );
};
