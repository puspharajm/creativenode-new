import React, { useState, useEffect } from 'react';
import { 
  Sparkles, Compass, Eye, ShieldCheck, RefreshCw, Grid, Layers, ArrowUpRight, 
  HelpCircle, SlidersHorizontal, Search, Info
} from 'lucide-react';
import { PosterTemplate } from '../types';

interface InspirationSectionProps {
  onViewProject: (preset: Partial<PosterTemplate>) => void;
  triggerToast?: (msg: string, type: 'success' | 'info' | 'alert') => void;
}

interface InspirationItem {
  id: string;
  title: string;
  subtitle: string;
  details: string;
  theme: string;
  bgType: 'color' | 'image' | 'gradient';
  bgValue: string;
  accentColor: string;
  textColor: string;
  fontTitle: string;
  fontSubtitle: string;
  align: 'left' | 'center' | 'right';
  geometricElement: 'circle' | 'lines' | 'grid' | 'border' | 'none';
  likes: number;
  trendingRank: number;
  gallerySource: string;
  designerName: string;
  tags: string[];
}

const CONSTANT_INSPIRATIONAL_DESIGNS: InspirationItem[] = [
  {
    id: 'insp-swiss-avant',
    title: 'SWISS AVANT-GARDE',
    subtitle: 'NUEVE METRIK KRAFT',
    details: 'CONCRETE ARCHITECTS • GRID INTEGRATION SYSTEM • ZURICH EDITION',
    theme: 'modernist',
    bgType: 'color',
    bgValue: '#000000',
    accentColor: '#e31e24',
    textColor: '#ffffff',
    fontTitle: 'Space Grotesk',
    fontSubtitle: 'Fira Code',
    align: 'left',
    geometricElement: 'grid',
    likes: 1204,
    trendingRank: 1,
    gallerySource: 'Brutalist Posters Club',
    designerName: 'Hans Thiemann',
    tags: ['Brutalist', 'Swiss', 'Geometric']
  },
  {
    id: 'insp-aurum-monolith',
    title: 'THE GOLDEN RATIO',
    subtitle: 'MONOLITH LUXURY SAGA',
    details: 'LIMITED EMBOSSED GRAPHICS • BRASS MATRIX COATING • COLLECTION 1A',
    theme: 'luxury',
    bgType: 'color',
    bgValue: '#050505',
    accentColor: '#d4af37',
    textColor: '#ffffff',
    fontTitle: 'Playfair Display',
    fontSubtitle: 'Inter',
    align: 'center',
    geometricElement: 'circle',
    likes: 954,
    trendingRank: 2,
    gallerySource: 'Aura Design Index',
    designerName: 'Francesca Rossi',
    tags: ['Luxury', 'Minimalist', 'Gold']
  },
  {
    id: 'insp-cyber-kinetic',
    title: 'VELOCITY FORCE',
    subtitle: 'KINETIC TOKYO DRIFT',
    details: 'FAST SLA SHIFTING • CARBON FRAME • MULTI STREAM REVOLUTION',
    theme: 'brutalist',
    bgType: 'color',
    bgValue: '#090a10',
    accentColor: '#39ff14',
    textColor: '#ffffff',
    fontTitle: 'JetBrains Mono',
    fontSubtitle: 'JetBrains Mono',
    align: 'right',
    geometricElement: 'lines',
    likes: 812,
    trendingRank: 3,
    gallerySource: 'NeoNoir Lab',
    designerName: 'Kaito Sato',
    tags: ['Cyberpunk', 'Brutalist', 'Vaporwave']
  },
  {
    id: 'insp-editorial-noir',
    title: 'THE SILENT HEURISTIC',
    subtitle: 'MODERN ABSTRACT LINES',
    details: 'SOCIETY SPECIFICATION NO. 29 • ARCHIVAL METADATA METRICS',
    theme: 'modernist',
    bgType: 'color',
    bgValue: '#0b0b0b',
    accentColor: '#908d82',
    textColor: '#f5f5f5',
    fontTitle: 'Outfit',
    fontSubtitle: 'Inter',
    align: 'left',
    geometricElement: 'border',
    likes: 673,
    trendingRank: 4,
    gallerySource: 'Type & Grid Annual',
    designerName: 'Elena Vasylyshyna',
    tags: ['Modernist', 'Minimalist', 'Editorial']
  },
  {
    id: 'insp-deep-lux-crimson',
    title: 'COSMIC MAJESTIC',
    subtitle: 'ROYAL CORAL OVERLAY',
    details: 'EMPEROR GOLD SPECTRA • SIGNATURE VELVET WATERMARKS',
    theme: 'luxury',
    bgType: 'color',
    bgValue: '#0c0005',
    accentColor: '#ff2d55',
    textColor: '#ffffff',
    fontTitle: 'Cinzel',
    fontSubtitle: 'Inter',
    align: 'center',
    geometricElement: 'circle',
    likes: 1045,
    trendingRank: 5,
    gallerySource: 'Sovereign Brand Directory',
    designerName: 'Siddharth Nair',
    tags: ['Luxury', 'Elite', 'Deep Noir']
  },
  {
    id: 'insp-brutal-concrete',
    title: 'RAW INDUSTRIALISM',
    subtitle: 'MASSIVE TOWER CONSTRUCT',
    details: 'UNFILTERED SHUTTERING SPECIFICATIONS • SUBSTRUCTURE 090',
    theme: 'brutalist',
    bgType: 'color',
    bgValue: '#121212',
    accentColor: '#ff6b35',
    textColor: '#f0f0f0',
    fontTitle: 'Impact',
    fontSubtitle: 'Space Mono',
    align: 'left',
    geometricElement: 'grid',
    likes: 742,
    trendingRank: 6,
    gallerySource: 'Brutalist Architecture Feed',
    designerName: 'Viktor Breuer',
    tags: ['Brutalist', 'Industrial', 'Raw']
  }
];

export default function InspirationSection({ onViewProject, triggerToast }: InspirationSectionProps) {
  const [loading, setLoading] = useState(false);
  const [galleryItems, setGalleryItems] = useState<InspirationItem[]>([]);
  const [filterTag, setFilterTag] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Simulated Mock Rest API Gallery Fetch
  const fetchTrendingDesigns = (tag: string) => {
    setLoading(true);
    // Simulate real high-latency API request to external design showcase
    setTimeout(() => {
      let filtered = [...CONSTANT_INSPIRATIONAL_DESIGNS];
      if (tag !== 'All') {
        filtered = filtered.filter(item => 
          item.tags.some(t => t.toLowerCase() === tag.toLowerCase()) || 
          item.theme.toLowerCase() === tag.toLowerCase()
        );
      }
      setGalleryItems(filtered);
      setLoading(false);
    }, 950);
  };

  useEffect(() => {
    fetchTrendingDesigns(filterTag);
  }, [filterTag]);

  const handleImportPreset = (item: InspirationItem) => {
    // Call the callback to load the preset parameters directly on the live editor
    const partialPreset: Partial<PosterTemplate> = {
      id: item.id,
      title: item.title,
      subtitle: item.subtitle,
      details: item.details,
      theme: item.theme,
      bgType: item.bgType,
      bgValue: item.bgValue,
      accentColor: item.accentColor,
      textColor: item.textColor,
      fontTitle: item.fontTitle,
      fontSubtitle: item.fontSubtitle,
      align: item.align,
      geometricElement: item.geometricElement,
      category: item.theme === 'luxury' ? 'minimalist' : item.theme === 'brutalist' ? 'fitness' : 'fashion'
    };
    
    onViewProject(partialPreset);
    if (triggerToast) {
      triggerToast(`Imported "${item.title}" schema to Atelier Studio! Ready for custom tweak.`, "success");
    }
  };

  const getFilteredByQuery = () => {
    if (!searchQuery.trim()) return galleryItems;
    return galleryItems.filter(item => 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
      item.designerName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const currentGalleryList = getFilteredByQuery();

  return (
    <div className="py-8 max-w-7xl mx-auto px-4 md:px-8 space-y-8 animate-fade-in">
      {/* Page Heading */}
      <div className="border-b border-zinc-900 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="font-mono text-xs text-gold-400 uppercase tracking-widest block mb-1">Curated External Exhibits</span>
          <h1 className="font-display text-2xl md:text-4xl font-bold text-white tracking-tight">
            CreativeNode <span className="font-editorial italic font-normal text-gold-400">Inspiration Board</span>
          </h1>
          <p className="text-zinc-500 text-xs font-sans mt-1">
            Browse trending, community-sourced brutalist & luxury poster specifications fetched directly from leading design registries.
          </p>
        </div>
        
        {/* Mock Sync Status Indicator */}
        <div className="flex items-center gap-2 self-start md:self-center bg-zinc-900/60 border border-zinc-850 px-3 py-1.5 rounded-lg">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-mono text-[9px] uppercase tracking-wider text-zinc-400">Design API Connected</span>
        </div>
      </div>

      {/* Control Filters & Search Input */}
      <div className="bg-zinc-950/80 border border-zinc-900 rounded-xl p-5 space-y-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          
          {/* Tag filters */}
          <div className="flex flex-wrap gap-1 bg-zinc-900/40 p-1 rounded-lg border border-zinc-900 self-start">
            {['All', 'Brutalist', 'Luxury', 'Modernist', 'Swiss', 'Minimalist'].map((tag) => (
              <button
                key={tag}
                onClick={() => setFilterTag(tag)}
                className={`px-3 py-1.5 rounded text-[10px] font-mono tracking-wider uppercase transition cursor-pointer select-none ${
                  filterTag === tag 
                    ? 'bg-gold-500 text-black font-semibold shadow-inner' 
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search filter input */}
            <div className="relative min-w-[240px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 w-3.5 h-3.5" />
              <input
                type="text"
                placeholder="Search trending layouts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-850 rounded-lg pl-9 pr-4 py-2 text-[10.5px] text-white placeholder-zinc-650 focus:outline-none focus:border-gold-500 transition font-mono"
              />
            </div>
            
            <button
              onClick={() => {
                fetchTrendingDesigns(filterTag);
                if (triggerToast) triggerToast("Flushing local cache, re-querying External Design database...", "info");
              }}
              className="px-3.5 py-2 rounded-lg border border-zinc-850 hover:border-zinc-750 bg-zinc-900/50 hover:bg-zinc-900 text-zinc-400 hover:text-white flex items-center justify-center gap-2 cursor-pointer transition select-none text-[10.5px] font-mono uppercase tracking-widest"
              title="Reload Design Stream"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Fetch Live Feed</span>
            </button>
          </div>

        </div>
      </div>

      {/* Main Grid display (Load state vs Render state) */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-zinc-950/40 border border-zinc-900 rounded-xl p-6 h-[260px] animate-pulse flex flex-col justify-between">
              <div className="space-y-3">
                <div className="h-2.5 bg-zinc-900 rounded w-1/4" />
                <div className="h-6 bg-zinc-900 rounded w-3/4" />
                <div className="h-4 bg-zinc-900 rounded w-1/2" />
              </div>
              <div className="h-10 bg-zinc-900 rounded-lg w-full" />
            </div>
          ))}
        </div>
      ) : currentGalleryList.length === 0 ? (
        <div className="py-24 text-center class-card border border-dashed rounded-2xl bg-zinc-950/30">
          <Compass className="w-8 h-8 text-zinc-600 mx-auto mb-3" />
          <h3 className="font-display text-sm font-bold text-white uppercase tracking-wider mb-1">
            No Inspirational Layouts Found
          </h3>
          <p className="text-zinc-500 text-xs font-sans max-w-sm mx-auto leading-relaxed">
            Adjust your search query or clear the active keywords to query the external design galleries again.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentGalleryList.map((item) => (
            <div 
              key={item.id} 
              className="bg-zinc-950/90 border border-zinc-900 hover:border-gold-500/30 rounded-xl p-5 md:p-6 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 group relative shadow-md"
            >
              {/* Card visual status line */}
              <div className="flex items-center justify-between mb-4 border-b border-zinc-900/60 pb-3 font-mono text-[9px]">
                <span className="text-zinc-550 uppercase font-mono tracking-widest">{item.gallerySource}</span>
                <span className="text-[#D4AF37] bg-[#D4AF37]/10 px-2 py-0.5 rounded font-extrabold uppercase tracking-wide">
                  Trend #{item.trendingRank}
                </span>
              </div>

              {/* Composition metadata preview */}
              <div className="space-y-2 mb-6">
                <div className="flex items-center gap-1.5">
                  {item.tags.map(t => (
                    <span key={t} className="text-[7.5px] bg-zinc-900 border border-zinc-850 text-zinc-400 font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
                      #{t}
                    </span>
                  ))}
                </div>

                <h3 className="font-display text-lg md:text-xl font-extrabold text-white tracking-widest leading-tight block select-all">
                  {item.title}
                </h3>
                
                <p className="text-zinc-400 text-xs font-mono truncate leading-none">
                  {item.subtitle}
                </p>

                <p className="text-zinc-555 text-[9.5px] font-sans text-zinc-500 line-clamp-2 leading-relaxed pt-1 select-none">
                  {item.details}
                </p>
              </div>

              {/* Preset Spec Specs Preview */}
              <div className="border-t border-zinc-900/60 pt-4 mt-auto flex flex-col gap-3 font-mono">
                <div className="flex justify-between items-center text-[9px] text-zinc-500">
                  <div className="flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: item.accentColor }} />
                    <span className="uppercase tracking-wider">Accent: {item.accentColor}</span>
                  </div>
                  <span className="uppercase tracking-wider">Font: {item.fontTitle}</span>
                </div>

                {/* Import direct action button */}
                <button
                  onClick={() => handleImportPreset(item)}
                  className="w-full bg-zinc-900 hover:bg-[#D4AF37] group-hover:bg-[#D4AF37]/10 text-zinc-400 hover:text-white group-hover:text-[#D4AF37] border border-zinc-800 hover:border-[#D4AF37]/30 py-2.5 rounded-xl text-[10px] font-mono uppercase tracking-widest font-extrabold transition duration-300 flex items-center justify-center gap-1.5 cursor-pointer selection:bg-transparent"
                >
                  <ArrowUpRight className="w-3.5 h-3.5 transition group-hover:rotate-45" />
                  <span>Import Composition Layout</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Bottom informational guidelines block */}
      <div className="bg-zinc-900/20 border border-zinc-900 rounded-xl p-4 flex items-start gap-3.5">
        <Info className="w-5 h-5 text-gold-400 shrink-0 mt-0.5" />
        <div className="space-y-1 font-sans">
          <h4 className="text-xs font-extrabold text-white uppercase tracking-wider font-mono">Sovereign Canvas Synchronizer Guidelines</h4>
          <p className="text-[10.5px] text-zinc-400 leading-relaxed font-light">
            Each composition featured on the Inspiration Board contains a mathematically balanced matrix of Swiss design variables. Clicking "Import Composition Layout" loads these precise parameters directly onto your active Atelier canvas, where they remain fully customizable under your subscription SLA.
          </p>
        </div>
      </div>

    </div>
  );
}
