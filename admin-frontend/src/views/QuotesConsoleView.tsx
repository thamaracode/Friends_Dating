import React, { useState, useEffect } from 'react';
import { 
  Quote as QuoteIcon, 
  Search, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Filter, 
  Sparkles,
  ExternalLink,
  Check
} from 'lucide-react';
import { AdminApiClient } from '../services/adminApiClient';
import type { AdminQuote } from '../types/admin';

export const QuotesConsoleView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'library' | 'providers'>('library');
  const [quotes, setQuotes] = useState<AdminQuote[]>([]);
  const [providers, setProviders] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [feedback, setFeedback] = useState<string | null>(null);

  // New quote modal
  const [isNewQuoteOpen, setIsNewQuoteOpen] = useState(false);
  const [newText, setNewText] = useState('');
  const [newAuthor, setNewAuthor] = useState('');
  const [newCategory, setNewCategory] = useState('philosophy');
  const [newAttribution, setNewAttribution] = useState('');

  const loadQuotes = async () => {
    setIsLoading(true);
    try {
      const res = await AdminApiClient.getQuotes({ category, search, limit: 30 });
      setQuotes(res.quotes || []);
    } catch (err: any) {
      setFeedback(`Failed to load quotes: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const loadProviders = async () => {
    try {
      const res = await AdminApiClient.getQuoteProviders();
      setProviders(res.providers || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (activeTab === 'library') {
      loadQuotes();
    } else {
      loadProviders();
    }
  }, [activeTab, category]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadQuotes();
  };

  const handleCreateQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newText.trim()) return;

    try {
      await AdminApiClient.createQuote({
        text: newText.trim(),
        author: newAuthor.trim() || 'Unknown',
        category: newCategory,
        tags: [newCategory, 'curated'],
        attribution: newAttribution.trim() || undefined
      });

      setFeedback('New curated quote added to the universal wisdom repository!');
      setNewText('');
      setNewAuthor('');
      setNewAttribution('');
      setIsNewQuoteOpen(false);
      loadQuotes();
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      alert(`Failed to add quote: ${err.message}`);
    }
  };

  const handleDeleteQuote = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this quote?')) return;

    try {
      await AdminApiClient.deleteQuote(id);
      setFeedback('Quote successfully removed.');
      loadQuotes();
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      alert(`Failed to delete quote: ${err.message}`);
    }
  };

  const handleToggleProvider = async (provider: any) => {
    const nextState = !provider.isEnabled;
    try {
      await AdminApiClient.updateQuoteProvider(provider.id, { isEnabled: nextState });
      setFeedback(`Quote provider ${provider.providerName} set to ${nextState ? 'ACTIVE' : 'DISABLED'}`);
      loadProviders();
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      alert(`Provider toggle failed: ${err.message}`);
    }
  };

  const categories = [
    'all', 'love', 'relationships', 'philosophy', 'growth', 'healing', 'wisdom', 'mindfulness'
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="type-page-heading text-white tracking-tight">Wisdom & Quotes Sanctuary</h2>
          <p className="type-supporting text-zinc-400 mt-1">
            Curate the universal quotes library, manage external free API providers, and schedule daily reflections.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex items-center gap-1 p-1 rounded-2xl bg-white/[0.04] border border-white/10">
            <button
              onClick={() => setActiveTab('library')}
              className={`h-9 px-4 rounded-xl text-xs font-heading font-semibold transition-colors cursor-pointer ${
                activeTab === 'library' ? 'bg-white text-[#090A0E]' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Quote Library
            </button>
            <button
              onClick={() => setActiveTab('providers')}
              className={`h-9 px-4 rounded-xl text-xs font-heading font-semibold transition-colors cursor-pointer ${
                activeTab === 'providers' ? 'bg-white text-[#090A0E]' : 'text-zinc-400 hover:text-white'
              }`}
            >
              API Providers
            </button>
          </div>

          {activeTab === 'library' && (
            <button
              onClick={() => setIsNewQuoteOpen(true)}
              className="sv-btn-gold h-10 px-4 text-xs font-bold cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Curated Quote</span>
            </button>
          )}
        </div>
      </div>

      {feedback && (
        <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-500/30 text-amber-200 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
          <Check className="w-4 h-4 text-amber-400" />
          <span>{feedback}</span>
        </div>
      )}

      {activeTab === 'library' ? (
        <>
          {/* Search and Category Filter Strip */}
          <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/10">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search quotes by author or text content..."
                className="sv-input w-full pl-10 text-xs"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {categories.map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`h-9 px-3.5 rounded-xl text-xs font-heading font-semibold capitalize whitespace-nowrap transition-colors cursor-pointer ${
                    category === cat
                      ? 'bg-white text-[#090A0E]'
                      : 'bg-white/[0.04] text-zinc-400 hover:text-white border border-white/5'
                  }`}
                >
                  {cat}
                </button>
              ))}
              <button type="submit" className="sv-btn-gold h-9 px-4 text-xs font-bold cursor-pointer">
                Search
              </button>
            </div>
          </form>

          {/* Quotes Table */}
          <div className="sv-card overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-white/[0.03] border-b border-white/10 text-zinc-400 uppercase tracking-wider font-mono text-[11px]">
                  <tr>
                    <th className="p-4 font-semibold">Quote Text & Attribution</th>
                    <th className="p-4 font-semibold">Category</th>
                    <th className="p-4 font-semibold">Likes & Saves</th>
                    <th className="p-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.06]">
                  {isLoading ? (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-zinc-500 font-mono">
                        Loading quotes sanctuary...
                      </td>
                    </tr>
                  ) : quotes.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-zinc-500">
                        No quotes match criteria.
                      </td>
                    </tr>
                  ) : (
                    quotes.map(q => (
                      <tr key={q.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="p-4 max-w-lg">
                          <p className="font-editorial italic text-sm text-zinc-100 leading-relaxed">
                            "{q.text}"
                          </p>
                          <div className="type-supporting text-zinc-400 text-xs mt-1">
                            — <span className="font-semibold text-white">{q.author}</span>
                            {q.attribution && <span className="text-zinc-500"> ({q.attribution})</span>}
                          </div>
                        </td>

                        <td className="p-4">
                          <span className="type-metadata px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-zinc-300 capitalize">
                            {q.category}
                          </span>
                        </td>

                        <td className="p-4 font-mono text-zinc-400">
                          {q.likesCount} likes • {q.savesCount} saves
                        </td>

                        <td className="p-4 text-right">
                          <button
                            onClick={() => handleDeleteQuote(q.id)}
                            className="p-2 rounded-xl bg-white/5 hover:bg-red-950/40 text-zinc-400 hover:text-red-400 border border-white/10 hover:border-red-500/30 transition-colors cursor-pointer"
                            title="Delete quote"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        /* Providers Switchboard */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {providers.map(p => (
            <div key={p.id} className="sv-card p-6 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-heading font-bold text-base text-white">{p.providerName}</h4>
                  <span className="type-metadata font-mono text-zinc-400 text-xs">Priority: {p.priority}</span>
                </div>

                <button
                  onClick={() => handleToggleProvider(p)}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs cursor-pointer transition-colors ${
                    p.isEnabled
                      ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/40'
                      : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                  }`}
                >
                  {p.isEnabled ? 'ENABLED ✓' : 'OFF'}
                </button>
              </div>

              <div className="space-y-1 type-supporting text-xs text-zinc-300">
                <div>Batch Size: <span className="text-white font-mono">{p.fetchBatchSize} quotes</span></div>
                <div>Rate Limit: <span className="text-white font-mono">{p.rateLimitRpm} RPM</span></div>
                <div>Status: <span className="text-emerald-400 font-mono font-semibold">{p.lastStatus || 'operational'}</span></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Curated Quote Modal */}
      {isNewQuoteOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <form onSubmit={handleCreateQuote} className="sv-card w-full max-w-lg p-6 space-y-5 border-white/20">
            <h3 className="type-card-heading text-white tracking-tight flex items-center gap-2">
              <Plus className="w-5 h-5 text-[#F6C138]" />
              <span>Add Curated Quote</span>
            </h3>

            <div className="space-y-1.5">
              <label className="type-metadata text-zinc-400 uppercase tracking-wider block">Quote Text</label>
              <textarea
                value={newText}
                onChange={(e) => setNewText(e.target.value)}
                rows={4}
                required
                className="sv-input w-full resize-none font-editorial italic text-sm"
                placeholder="Write the quote text..."
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="type-metadata text-zinc-400 uppercase tracking-wider block">Author</label>
                <input
                  type="text"
                  value={newAuthor}
                  onChange={(e) => setNewAuthor(e.target.value)}
                  className="sv-input w-full text-xs"
                  placeholder="e.g. Marcus Aurelius"
                />
              </div>

              <div className="space-y-1.5">
                <label className="type-metadata text-zinc-400 uppercase tracking-wider block">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="sv-input w-full text-xs bg-[#12141B] capitalize"
                >
                  {categories.filter(c => c !== 'all').map(c => (
                    <option key={c} value={c} className="bg-[#12141B]">{c}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="type-metadata text-zinc-400 uppercase tracking-wider block">Attribution / Source (Optional)</label>
              <input
                type="text"
                value={newAttribution}
                onChange={(e) => setNewAttribution(e.target.value)}
                className="sv-input w-full text-xs"
                placeholder="e.g. Meditations, Book IV"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => setIsNewQuoteOpen(false)}
                className="sv-btn-secondary h-9 px-4 text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button type="submit" className="sv-btn-gold h-9 px-4 text-xs font-bold cursor-pointer">
                Save Quote
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
