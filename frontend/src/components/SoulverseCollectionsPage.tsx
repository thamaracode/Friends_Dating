import React, { useState } from 'react';
import { 
  Boxes, 
  Image as ImageIcon, 
  Music, 
  BookOpen, 
  Film, 
  Plus, 
  ExternalLink,
  Eye,
  Heart,
  Share2,
  Calendar
} from 'lucide-react';

export const SoulverseCollectionsPage: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'visual' | 'audio' | 'literature'>('all');
  const [previewMedia, setPreviewMedia] = useState<any | null>(null);

  const collections = [
    {
      id: 'c1',
      title: 'Highland Mist & Starry Peaks',
      type: 'visual',
      cover: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=800&q=80',
      count: '14 Photos',
      desc: 'Solo mountain treks across the Knuckles Range, capturing early sunrise above the cloud inversion.',
      date: 'Autumn 2024'
    },
    {
      id: 'c2',
      title: 'Neon Monolith Concept Art',
      type: 'visual',
      cover: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80',
      count: '9 Visuals',
      desc: 'Brutalist graphic experiments, neo-noir color studies, and rainy skyscraper silhouettes.',
      date: 'Winter 2025'
    },
    {
      id: 'c3',
      title: 'Moonlit Sanctuary Soundscapes',
      type: 'audio',
      cover: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
      count: '6 Tracks',
      desc: 'Curated 2 AM soundscapes, lo-fi mechanical ticking, and rain against double-paned glass.',
      date: 'Updated yesterday'
    },
    {
      id: 'c4',
      title: 'Essays on Digital Permanence',
      type: 'literature',
      cover: 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=800&q=80',
      count: '12 Chapters',
      desc: 'Reflections on physical books, artisanal watch escapements, and reclaiming creative autonomy.',
      date: 'Ongoing'
    }
  ];

  const filtered = collections.filter(c => {
    if (activeCategory === 'all') return true;
    return c.type === activeCategory;
  });

  return (
    <div className="w-full space-y-6 animate-fadeIn pb-16">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-[#160D19] border border-[#321323] shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#321323] border border-[#A64D78]/30 flex items-center justify-center text-[#D78BAF]">
            <Boxes className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-black text-[#E9DFE8] font-serif">Collections, Media & Galleries</h1>
            <p className="text-xs text-[#A99BAA]">Curated photography, soundscapes, concept visual boards, and literature</p>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[#09080D] border border-[#321323] text-xs">
          {[
            { id: 'all', label: 'All Collections' },
            { id: 'visual', label: 'Photography & Art' },
            { id: 'audio', label: 'Soundscapes' },
            { id: 'literature', label: 'Essays & Literature' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveCategory(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                activeCategory === tab.id
                  ? 'bg-[#321323] text-[#F0B8D3] border border-[#A64D78]/30 shadow-sm'
                  : 'text-[#A99BAA] hover:text-[#E9DFE8]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Collections Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {filtered.map(item => (
          <div
            key={item.id}
            onClick={() => setPreviewMedia(item)}
            className="rounded-3xl overflow-hidden bg-[#160D19] border border-[#321323] hover:border-[#A64D78]/40 transition-all shadow-lg flex flex-col justify-between group cursor-pointer"
          >
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#09080D]">
              <img
                src={item.cover}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#160D19] via-transparent to-black/20" />
              <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[9px] font-bold text-[#F0B8D3]">
                {item.count}
              </div>
            </div>

            <div className="p-4 space-y-2">
              <h3 className="text-xs font-bold text-[#E9DFE8] group-hover:text-[#F0B8D3] transition-colors truncate">
                {item.title}
              </h3>
              <p className="text-[10px] text-[#A99BAA] line-clamp-2 leading-relaxed">
                {item.desc}
              </p>
              <div className="flex items-center justify-between pt-2 border-t border-[#321323] text-[10px] text-[#A99BAA]">
                <span>📅 {item.date}</span>
                <span className="text-[#A64D78] group-hover:translate-x-0.5 transition-transform">Open Album ›</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Media Preview Modal */}
      {previewMedia && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="w-full max-w-2xl bg-[#160D19] border border-[#321323] rounded-3xl overflow-hidden shadow-2xl">
            <div className="relative aspect-[16/9] w-full bg-black">
              <img src={previewMedia.cover} alt={previewMedia.title} className="w-full h-full object-cover" />
              <button 
                onClick={() => setPreviewMedia(null)}
                className="absolute top-3 right-3 p-2 rounded-full bg-black/60 text-white hover:bg-black"
              >
                ✕
              </button>
            </div>
            <div className="p-6 space-y-2">
              <h2 className="text-base font-bold text-[#E9DFE8]">{previewMedia.title}</h2>
              <p className="text-xs text-[#A99BAA] leading-relaxed">{previewMedia.desc}</p>
              <div className="flex items-center justify-between pt-3 text-xs text-[#A64D78]">
                <span>{previewMedia.count} in this collection</span>
                <span>{previewMedia.date}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
