import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  Check,
  Compass,
  Loader2,
  SlidersHorizontal
} from 'lucide-react';
import { socialApiClient } from '../../services/socialApiClient';

interface InterestPreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: (selectedInterests: string[]) => void;
}

const AVAILABLE_INTERESTS: { id: string; label: string; description: string; tag: string }[] = [
  { id: 'philosophy', label: 'Philosophy & Mind', description: 'Existential inquiries, stoicism, and intentional consciousness.', tag: '#philosophy' },
  { id: 'cinema', label: 'Cinema & 35mm', description: 'Visual poetry, narrative pacing, and celluloid photography.', tag: '#cinema' },
  { id: 'architecture', label: 'Architecture & Spaces', description: 'Vernacular structures, sanctuary design, and built environments.', tag: '#architecture' },
  { id: 'music', label: 'Soundscapes & Ambient', description: 'Deep listening, room resonance, and acoustic compositions.', tag: '#soundscapes' },
  { id: 'literature', label: 'Literature & Poetry', description: 'Essays, classical prose, and reflective writing.', tag: '#literature' },
  { id: 'ceramics', label: 'Craft & Ceramics', description: 'Tactile arts, wabi-sabi aesthetics, and handmade craft.', tag: '#ceramics' },
  { id: 'astrophotography', label: 'Cosmos & Astrophotography', description: 'Deep sky observation, stellar nurseries, and cosmic scale.', tag: '#astrophotography' },
  { id: 'slowliving', label: 'Slow Living & Solitude', description: 'Unhurried presence, analog rituals, and daily clarity.', tag: '#slowliving' },
  { id: 'psychology', label: 'Psychology & Connection', description: 'Cognitive courageousness, emotional intelligence, and vulnerability.', tag: '#psychology' }
];

export const InterestPreferencesModal: React.FC<InterestPreferencesModalProps> = ({
  isOpen,
  onClose,
  onSaved
}) => {
  const [selected, setSelected] = useState<string[]>(['philosophy', 'cinema', 'architecture']);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    socialApiClient.getUserPreferences()
      .then(res => {
        if (res.preferred_categories && res.preferred_categories.length > 0) {
          setSelected(res.preferred_categories);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isOpen]);

  if (!isOpen) return null;

  const toggleInterest = (id: string) => {
    if (selected.includes(id)) {
      if (selected.length > 1) {
        setSelected(selected.filter(item => item !== id));
      }
    } else {
      setSelected([...selected, id]);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await socialApiClient.updateUserPreferences(selected);
      onSaved(selected);
      onClose();
    } catch (err) {
      console.error('Failed to save preferences:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0A0B0F]/90 backdrop-blur-xl flex items-center justify-center p-3 sm:p-4 animate-fadeIn font-body">
      <div className="w-full max-w-lg bg-[#12131A] border border-white/[0.1] rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-rose-400" />
            <h2 className="text-base font-heading font-bold text-white tracking-tight">
              Personalize Discovery Topics
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-4">
          <p className="text-xs text-zinc-400 leading-relaxed">
            Soulverse curates your social discovery stream around what you think and create. Select the streams of contemplation and art you wish to explore:
          </p>

          {loading ? (
            <div className="flex items-center justify-center py-12 text-zinc-500 gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-rose-500" />
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-2.5">
              {AVAILABLE_INTERESTS.map(item => {
                const isSelected = selected.includes(item.id);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => toggleInterest(item.id)}
                    className={`flex items-start justify-between p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-rose-500/10 border-rose-500/40 text-white shadow-sm'
                        : 'bg-white/[0.02] border-white/[0.06] text-zinc-400 hover:text-white hover:bg-white/[0.04]'
                    }`}
                  >
                    <div className="space-y-1 pr-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-heading font-bold text-white">
                          {item.label}
                        </span>
                        <span className="text-[10px] font-mono text-zinc-500">
                          {item.tag}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400 leading-relaxed">
                        {item.description}
                      </p>
                    </div>

                    <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 border transition-all ${
                      isSelected
                        ? 'bg-rose-500 border-rose-500 text-white'
                        : 'border-white/20 bg-white/[0.05]'
                    }`}>
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/[0.08] bg-[#0E0F15] flex items-center justify-between">
          <span className="text-xs text-zinc-500 font-mono">
            {selected.length} topics selected
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all shadow-lg shadow-rose-900/30 cursor-pointer disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
              <span>Save Streams</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
