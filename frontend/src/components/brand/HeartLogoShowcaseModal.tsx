import React, { useState } from 'react';
import { 
  X, 
  Check, 
  Copy, 
  Sparkles, 
  Eye, 
  Download, 
  Sliders,
  Smartphone,
  Layout,
  Bell
} from 'lucide-react';
import { 
  HeartLogoVariant, 
  SoulverseBrandLogo, 
  InfinityOrbitHeartLogo, 
  CelestialCompassHeartLogo, 
  TwinSoulsEmbraceLogo, 
  PrismCrystalHeartLogo, 
  ResonanceWaveHeartLogo 
} from './SoulverseHeartLogos';

interface HeartLogoShowcaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentVariant: HeartLogoVariant;
  onSelectVariant: (variant: HeartLogoVariant) => void;
}

interface LogoDetail {
  id: HeartLogoVariant;
  title: string;
  tagline: string;
  symbolism: string;
  palette: string;
  component: React.ComponentType<{ size?: number; className?: string; showGlow?: boolean; animated?: boolean }>;
}

const LOGO_CONCEPTS: LogoDetail[] = [
  {
    id: 'infinity',
    title: 'Cosmic Infinity Heart',
    tagline: 'Möbius Ribbon of Eternal Connection',
    symbolism: 'Two independent soul paths intertwining into an unbroken infinity (∞) heart silhouette.',
    palette: '24K Solar Gold to Radiant Rose Quartz (#FDE68A → #F59E0B → #F43F5E)',
    component: InfinityOrbitHeartLogo
  },
  {
    id: 'compass',
    title: 'Celestial Compass Heart',
    tagline: 'Love as Your True North in the Universe',
    symbolism: 'A sweeping heart contour that ascends into a radiant 4-point North Star and orbital ring.',
    palette: 'Aurora Amber & Celestial Starlight with Deep Indigo undertones',
    component: CelestialCompassHeartLogo
  },
  {
    id: 'twin_souls',
    title: 'Twin Souls Embrace',
    tagline: 'Two Entities, One Sanctuary',
    symbolism: 'Dual overlapping crescents (liquid gold & blush rose) embracing a brilliant supernova spark.',
    palette: 'Champagne Liquid Gold & Warm Crimson Blush (#FDE68A + #F43F5E)',
    component: TwinSoulsEmbraceLogo
  },
  {
    id: 'crystal',
    title: 'Prism Crystal Heart',
    tagline: 'Faceted Architectural Luxury & Depth',
    symbolism: 'Geometric diamond facets reflecting the multifaceted depths of human intimacy.',
    palette: 'Rose-Gold Wireframe & Amber Crystal Facets (#FFFBEB → #B45309)',
    component: PrismCrystalHeartLogo
  },
  {
    id: 'resonance',
    title: 'Resonance Wave Heart',
    tagline: 'Living Pulse & Synchronized Heartbeats',
    symbolism: 'Fluid minimalist heart housing a synchronized biometric pulse and emotional frequency.',
    palette: 'Sunset Rose Aura & Electric Amber Core (#F43F5E → #F59E0B)',
    component: ResonanceWaveHeartLogo
  }
];

export const HeartLogoShowcaseModal: React.FC<HeartLogoShowcaseModalProps> = ({
  isOpen,
  onClose,
  currentVariant,
  onSelectVariant
}) => {
  const [selectedVariant, setSelectedVariant] = useState<HeartLogoVariant>(currentVariant);
  const [activeBg, setActiveBg] = useState<'obsidian' | 'midnight' | 'velvet' | 'darkgold'>('obsidian');
  const [isAnimated, setIsAnimated] = useState<boolean>(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentDetail = LOGO_CONCEPTS.find(l => l.id === selectedVariant) || LOGO_CONCEPTS[0];

  const bgStyles = {
    obsidian: 'bg-[#090A0E] border-white/10',
    midnight: 'bg-[#080C1E] border-indigo-500/20',
    velvet: 'bg-[#180814] border-rose-500/20',
    darkgold: 'bg-[#141006] border-amber-500/20'
  };

  const handleApply = () => {
    onSelectVariant(selectedVariant);
    onClose();
  };

  const handleCopySvg = (variantId: HeartLogoVariant) => {
    // Basic SVG export string
    const svgCode = `<!-- Soulverse Brand Logo: ${variantId} -->\n<div class="soulverse-heart-logo" data-variant="${variantId}"></div>`;
    navigator.clipboard.writeText(svgCode);
    setCopiedId(variantId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-xl animate-fade-in overflow-y-auto">
      <div 
        className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl bg-[#090A0E] border border-amber-500/30 shadow-[0_0_60px_rgba(245,158,11,0.18)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ambient Top Glow */}
        <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-amber-500/10 to-transparent pointer-events-none" />

        {/* Modal Header */}
        <div className="relative px-6 pt-6 pb-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-heading font-extrabold text-white tracking-tight flex items-center gap-2">
                Soulverse Heart Brand Identity
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-medium">
                  5 Design Concepts
                </span>
              </h2>
              <p className="text-xs text-zinc-400">
                Explore luxury heart-like marks tailored for romantic connection, resonance, and emotional depth.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/5 border border-white/10 text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* 3D RENDERED APPS CONCEPT PREVIEW BANNER */}
          <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-black/60 shadow-lg group">
            <div className="aspect-[16/9] sm:aspect-[21/9] w-full relative overflow-hidden flex items-center justify-center">
              <img 
                src="/images/soulverse_heart_logos_showcase.jpg" 
                alt="Soulverse 3D App Icon Presentation"
                className="w-full h-full object-cover object-center opacity-95 group-hover:scale-102 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#090A0E] via-transparent to-transparent pointer-events-none" />
              
              {/* Overlay Badge */}
              <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-xs text-zinc-300">
                <span className="flex items-center gap-2 px-3 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/15 text-amber-300">
                  <Sparkles className="w-3.5 h-3.5" /> High-End Obsidian & Rose-Gold Edition
                </span>
                <span className="text-[11px] text-zinc-400 hidden sm:inline">
                  Vector Scalable • Dark-Glass Optimized • Retina Ready
                </span>
              </div>
            </div>
          </div>

          {/* CONCEPT CARDS GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {LOGO_CONCEPTS.map((concept) => {
              const isSelected = selectedVariant === concept.id;
              const isCurrent = currentVariant === concept.id;
              const ConceptComponent = concept.component;

              return (
                <div
                  key={concept.id}
                  onClick={() => setSelectedVariant(concept.id)}
                  className={`relative p-4 rounded-2xl cursor-pointer transition-all border flex flex-col justify-between ${
                    isSelected
                      ? 'bg-gradient-to-b from-amber-500/15 to-amber-950/20 border-amber-400 shadow-[0_0_24px_rgba(245,158,11,0.22)]'
                      : 'bg-white/[0.03] border-white/10 hover:border-white/20 hover:bg-white/[0.05]'
                  }`}
                >
                  {/* Top Badges */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-mono tracking-wider uppercase text-zinc-400">
                      {concept.id}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {isCurrent && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          Active
                        </span>
                      )}
                      {isSelected && (
                        <span className="w-5 h-5 rounded-full bg-amber-400 text-black flex items-center justify-center">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Logo Display Center */}
                  <div className="h-24 flex items-center justify-center my-1">
                    <div className="p-3 rounded-2xl bg-black/40 border border-white/10 shadow-inner group-hover:scale-105 transition-transform">
                      <ConceptComponent size={56} animated={isAnimated && isSelected} />
                    </div>
                  </div>

                  {/* Info */}
                  <div className="mt-3 pt-3 border-t border-white/10">
                    <h3 className="font-heading font-bold text-white text-sm">
                      {concept.title}
                    </h3>
                    <p className="text-xs text-amber-300/90 font-medium line-clamp-1 mt-0.5">
                      {concept.tagline}
                    </p>
                    <p className="text-[11px] text-zinc-400 line-clamp-2 mt-1">
                      {concept.symbolism}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ACTIVE CONCEPT DEEP-DIVE & LIVE MOCKUP PREVIEWS */}
          <div className={`p-5 rounded-3xl border transition-all ${bgStyles[activeBg]}`}>
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-white/10">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-amber-400 font-semibold">
                  Selected Spotlight
                </span>
                <h3 className="text-xl font-heading font-extrabold text-white">
                  {currentDetail.title}
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  {currentDetail.symbolism}
                </p>
              </div>

              {/* Surface Controls */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 p-1 rounded-xl bg-black/40 border border-white/10 text-xs text-zinc-300">
                  <span className="text-[11px] text-zinc-400 pl-2 pr-1">Surface:</span>
                  {(['obsidian', 'midnight', 'velvet', 'darkgold'] as const).map(bg => (
                    <button
                      key={bg}
                      onClick={() => setActiveBg(bg)}
                      className={`px-2.5 py-1 rounded-lg capitalize transition-colors text-[11px] font-medium ${
                        activeBg === bg
                          ? 'bg-amber-400 text-black font-bold'
                          : 'hover:text-white'
                      }`}
                    >
                      {bg}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setIsAnimated(!isAnimated)}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-colors ${
                    isAnimated
                      ? 'bg-amber-400/20 text-amber-300 border-amber-400/40'
                      : 'bg-white/5 text-zinc-400 border-white/10 hover:text-white'
                  }`}
                  title="Toggle subtle glow pulse animation"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Pulse: {isAnimated ? 'ON' : 'OFF'}
                </button>
              </div>
            </div>

            {/* LIVE CONTEXT MOCKUPS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-5">
              {/* 1. App Header Preview */}
              <div className="p-4 rounded-2xl bg-black/40 border border-white/10 flex flex-col justify-between">
                <div className="flex items-center gap-2 text-xs text-zinc-400 mb-3">
                  <Layout className="w-3.5 h-3.5 text-amber-400" />
                  <span>Website & Desktop Header</span>
                </div>
                <div className="h-14 px-4 rounded-xl dark-glass border border-white/15 flex items-center justify-between">
                  <SoulverseBrandLogo 
                    variant={selectedVariant} 
                    size={28} 
                    showWordmark={true} 
                    wordmarkSubtitle="Dating & Soul Bonds"
                    animated={isAnimated} 
                  />
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-white/10 border border-white/15" />
                  </div>
                </div>
                <p className="text-[11px] text-zinc-500 mt-3 text-center">
                  Fits navigation bar height without layout distortion
                </p>
              </div>

              {/* 2. Squircle Mobile Icon */}
              <div className="p-4 rounded-2xl bg-black/40 border border-white/10 flex flex-col items-center justify-between">
                <div className="w-full flex items-center gap-2 text-xs text-zinc-400 mb-3">
                  <Smartphone className="w-3.5 h-3.5 text-amber-400" />
                  <span>Mobile Squircle App Icon</span>
                </div>
                <div className="w-20 h-20 rounded-[22px] bg-gradient-to-tr from-[#12141A] to-[#252836] border border-amber-400/30 p-3 shadow-2xl flex items-center justify-center relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-b from-white/15 to-transparent pointer-events-none" />
                  <SoulverseBrandLogo variant={selectedVariant} size={48} animated={isAnimated} />
                </div>
                <span className="text-[11px] font-heading font-bold text-white mt-2">
                  Soulverse
                </span>
              </div>

              {/* 3. Notification Banner Preview */}
              <div className="p-4 rounded-2xl bg-black/40 border border-white/10 flex flex-col justify-between">
                <div className="flex items-center gap-2 text-xs text-zinc-400 mb-3">
                  <Bell className="w-3.5 h-3.5 text-amber-400" />
                  <span>Lockscreen Match Alert</span>
                </div>
                <div className="p-3 rounded-xl dark-glass border border-white/15 space-y-1">
                  <div className="flex items-center justify-between text-[11px] text-zinc-400">
                    <div className="flex items-center gap-1.5">
                      <SoulverseBrandLogo variant={selectedVariant} size={16} />
                      <span className="font-bold text-white">Soulverse</span>
                    </div>
                    <span>now</span>
                  </div>
                  <p className="text-xs font-semibold text-amber-300">New 98% Resonance Soul Connection!</p>
                  <p className="text-[11px] text-zinc-300 line-clamp-1">Alex has reacted with a 🫂 Hug to your secret story.</p>
                </div>
                <p className="text-[11px] text-zinc-500 mt-3 text-center">
                  Retains high legibility at 16px micro-icon scale
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="px-6 py-4 border-t border-white/10 bg-black/40 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => handleCopySvg(selectedVariant)}
              className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-medium text-zinc-300 flex items-center justify-center gap-2 transition-colors cursor-pointer w-full sm:w-auto"
            >
              {copiedId === selectedVariant ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-300 font-semibold">Copied SVG Ref!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy SVG Code</span>
                </>
              )}
            </button>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-medium text-zinc-400 hover:text-white transition-colors cursor-pointer w-full sm:w-auto text-center"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-black font-bold text-xs shadow-lg shadow-amber-500/25 hover:from-amber-300 hover:to-amber-400 transition-all cursor-pointer flex items-center justify-center gap-2 w-full sm:w-auto"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              Set as Active App Logo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
