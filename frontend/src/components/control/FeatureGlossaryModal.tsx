import React, { useState, useEffect } from 'react';
import { BookOpen, Search, Sparkles, Filter, X, ArrowUpRight } from 'lucide-react';
import { GlassModal, GlassButton } from '../klyven';
import { FeatureControlService } from '../../services/featureControlService';

interface GlossaryTerm {
  term: string;
  category: string;
  definition: string;
}

interface FeatureGlossaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToFeature?: (featureId: string) => void;
}

export const FeatureGlossaryModal: React.FC<FeatureGlossaryModalProps> = ({
  isOpen,
  onClose,
  onNavigateToFeature
}) => {
  const [glossary, setGlossary] = useState<GlossaryTerm[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      FeatureControlService.getGlossary().then(items => {
        setGlossary(items);
        setLoading(false);
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const categories = ['all', ...Array.from(new Set(glossary.map(g => g.category)))];

  const filtered = glossary.filter(item => {
    const matchCat = selectedCategory === 'all' || item.category === selectedCategory;
    const q = search.toLowerCase().trim();
    const matchSearch = !q || item.term.toLowerCase().includes(q) || item.definition.toLowerCase().includes(q);
    return matchCat && matchSearch;
  });

  return (
    <GlassModal
      isOpen={isOpen}
      onClose={onClose}
      title="Feature Glossary & Architecture Dictionary"
      maxWidth="lg"
    >
      <div className="space-y-4">
        {/* Intro */}
        <p className="text-xs text-zinc-300 leading-relaxed">
          Explore the concepts, terminology, and cryptographic privacy paradigms that power the Soulverse ecosystem.
        </p>

        {/* Search & Category Filter */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-zinc-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search concepts (e.g. HCM, Sanctuary, Vault)..."
              className="w-full bg-white/[0.06] border border-white/15 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white/40"
            />
          </div>

          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-1">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-bold capitalize whitespace-nowrap cursor-pointer transition-colors ${
                  selectedCategory === cat ? 'bg-white text-[#090A0E]' : 'bg-white/5 text-zinc-400 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Content list */}
        {loading ? (
          <div className="p-8 text-center text-xs text-zinc-500">Loading glossary...</div>
        ) : (
          <div className="max-h-[55vh] overflow-y-auto no-scrollbar space-y-2.5 pr-1">
            {filtered.map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl dark-glass border border-white/10 space-y-1.5 hover:border-white/20 transition-all"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-sm text-white font-serif">
                    {item.term}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-zinc-300 border border-white/10">
                    {item.category}
                  </span>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  {item.definition}
                </p>
              </div>
            ))}

            {filtered.length === 0 && (
              <div className="p-8 text-center text-xs text-zinc-500">
                No matching terminology found for "{search}".
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-white/10 text-[11px] text-zinc-500">
          <span>{filtered.length} terms cataloged</span>
          <GlassButton variant="primary" onClick={onClose} className="text-xs py-1 px-3">
            Got it
          </GlassButton>
        </div>
      </div>
    </GlassModal>
  );
};
