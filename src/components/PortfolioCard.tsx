import React, { useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import { Sparkles, Share2, Download, Bookmark, Eye, Twitter, MessageCircle } from 'lucide-react';
import { PosterTemplate } from '../types';
import ProjectQRCode from './ProjectQRCode';

// Precise display names for each segment
const CATEGORY_LABELS: Record<string, string> = {
  fitness: 'Fitness',
  fashion: 'Fashion Edit',
  minimalist: 'Minimal Gold',
  offers: 'Offers & Retail',
  all: 'General'
};

interface PortfolioCardProps {
  item: PosterTemplate;
  idx: number;
  userTier: 'free' | 'pro' | 'sovereign';
  adminPreviewPoster: PosterTemplate | null;
  onView: () => void;
  onQuickView: () => void;
  onShare: (e: React.MouseEvent) => void;
  onExportPDF: () => void;
  onLoadTemplate: (id: string) => void;
  onSelectKeyword: (kw: string | null) => void;
  searchQuery: string;
  collections: string[];
  onSaveToCollection: (e: React.MouseEvent, id: string, title: string) => void;
  playHapticClick: () => void;
}

export default function PortfolioCard({
  item,
  idx,
  userTier,
  adminPreviewPoster,
  onView,
  onQuickView,
  onShare,
  onExportPDF,
  onLoadTemplate,
  onSelectKeyword,
  searchQuery,
  collections,
  onSaveToCollection,
  playHapticClick
}: PortfolioCardProps) {
  const [showShareMenu, setShowShareMenu] = useState(false);

  // Framer Motion physical magnetic spring parameters
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Maps Normalized coordinates (-0.5 to 0.5) to tilt degrees (-5deg to 5deg)
  const rX = useTransform(y, [-0.5, 0.5], [5, -5]);
  const rY = useTransform(x, [-0.5, 0.5], [-5, 5]);

  // Spring behavior to support premium tactile inertia
  const rotateX = useSpring(rX, { damping: 20, stiffness: 150 });
  const rotateY = useSpring(rY, { damping: 20, stiffness: 150 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Proximity mapping relative to center of portfolio card bounds
    const normX = (mouseX / rect.width) - 0.5;
    const normY = (mouseY / rect.height) - 0.5;

    x.set(normX);
    y.set(normY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
    setShowShareMenu(false);
  };

  // Helper to highlight searched terms inside cards
  const renderHighlightedText = (text: string, search: string) => {
    if (!search.trim()) return text;
    const parts = text.split(new RegExp(`(${search.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')})`, 'gi'));
    return (
      <>
        {parts.map((part, i) => 
          part.toLowerCase() === search.toLowerCase()
            ? <span key={i} className="bg-gold-500/30 text-gold-200 px-0.5 rounded px-0.5 font-bold">{part}</span>
            : part
        )}
      </>
    );
  };

  const isSaved = collections.includes(item.id);

  // Social Share helpers for direct card-level action
  const shareTwitter = (e: React.MouseEvent) => {
    e.stopPropagation();
    const shareUrl = encodeURIComponent(`${window.location.origin}${window.location.pathname}?project=${item.id}`);
    const text = encodeURIComponent(`Take a look at "${item.title}" design spec outline by CreativeNode!`);
    window.open(`https://twitter.com/intent/tweet?url=${shareUrl}&text=${text}`, '_blank');
    setShowShareMenu(false);
  };

  const sharePinterest = (e: React.MouseEvent) => {
    e.stopPropagation();
    const shareUrl = encodeURIComponent(`${window.location.origin}${window.location.pathname}?project=${item.id}`);
    const media = encodeURIComponent(item.bgValue);
    const text = encodeURIComponent(item.title);
    window.open(`https://pinterest.com/pin/create/button/?url=${shareUrl}&media=${media}&description=${text}`, '_blank');
    setShowShareMenu(false);
  };

  const shareWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation();
    const shareUrl = encodeURIComponent(`${window.location.origin}${window.location.pathname}?project=${item.id}`);
    const text = encodeURIComponent(`Take a look at "${item.title}" from CreativeNode Studio: ${shareUrl}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
    setShowShareMenu(false);
  };

  return (
    <motion.div
      style={{
        rotateX: rotateX,
        rotateY: rotateY,
        transformStyle: 'preserve-3d',
      }}
      whileHover={{ 
        scale: 1.025,
        borderColor: "rgba(212, 175, 55, 0.45)",
        boxShadow: "0 0 25px rgba(212, 175, 55, 0.35)"
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={playHapticClick}
      onClick={onView}
      className="portfolio-card glassmorphism-card group relative border border-zinc-900/90 rounded-2xl overflow-hidden aspect-[4/5] p-6 flex flex-col justify-between transition-all duration-300 hover:border-zinc-805 cursor-pointer h-full"
    >
      {/* Background Image / Scrims */}
      <img 
        src={item.bgValue}
        loading="lazy"
        alt={item.title}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 scale-102 group-hover:scale-105 pointer-events-none select-none"
        style={{ filter: 'brightness(0.6) contrast(1.15)' }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-black/30 pointer-events-none" />
      <div className="absolute inset-0 bg-grain mix-blend-overlay pointer-events-none" />

      {adminPreviewPoster && adminPreviewPoster.id === item.id && (
        <div className="absolute top-3 left-3 z-20 bg-emerald-950/90 border border-emerald-500 text-emerald-400 font-mono text-[7px] font-extrabold uppercase px-2 py-0.5 rounded-full shadow-lg flex items-center gap-1">
          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />
          <span>LIVE PREVIEW SIMULATION</span>
        </div>
      )}

      {/* Top Indicators Row */}
      <div className="relative z-10 flex items-center justify-between font-mono text-[9px] text-zinc-400">
        <div className="flex flex-col gap-1 items-start">
          <span className="tracking-widest opacity-80 uppercase text-[7.5px]">CREATIVENODE STUDIO</span>
          {/* Category Pill Tag */}
          <span className="px-2 py-0.5 rounded-full bg-gold-400/15 text-gold-400 border border-gold-400/35 text-[7.5px] uppercase font-bold tracking-wider">
            {CATEGORY_LABELS[item.category] || item.category}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {item.badge && (
            <span className="px-2 py-0.5 border border-white/20 rounded text-[8px] bg-black/40">
              {item.badge}
            </span>
          )}

          {/* Quick Saving Bookmark Action */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSaveToCollection(e, item.id, item.title);
            }}
            className={`p-1 px-1.5 rounded transition bg-black/60 border border-white/10 ${
              isSaved ? 'text-gold-400 border-gold-500/40 bg-gold-950/30' : 'hover:border-gold-500 hover:text-gold-400'
            }`}
            title="Instant Local Save"
          >
            <Bookmark className="w-3 h-3" style={{ fill: isSaved ? 'currentColor' : 'none' }} />
          </button>

          {/* Dedicated Social Share Options */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowShareMenu(!showShareMenu);
              }}
              className={`p-1 px-1.5 rounded bg-black/60 border ${showShareMenu ? 'border-gold-500 text-gold-400' : 'border-white/10'} hover:border-gold-500 hover:text-gold-400 transition cursor-pointer`}
              title="Social Sharing Center"
            >
              <Share2 className="w-3 h-3" />
            </button>

            {showShareMenu && (
              <div 
                onClick={(e) => e.stopPropagation()}
                className="absolute right-0 top-6 bg-zinc-950 border border-zinc-900 rounded-lg shadow-xl p-1.5 flex flex-col gap-1 z-35 min-w-[120px] animate-fade-in"
              >
                <button
                  onClick={shareTwitter}
                  className="flex items-center gap-2 px-2.5 py-1 text-[8px] font-mono uppercase text-zinc-400 hover:text-white hover:bg-zinc-900 rounded text-left transition"
                >
                  <Twitter className="w-2.5 h-2.5 text-zinc-400" />
                  <span>Share on X</span>
                </button>
                <button
                  onClick={sharePinterest}
                  className="flex items-center gap-2 px-2.5 py-1 text-[8px] font-mono uppercase text-zinc-400 hover:text-white hover:bg-zinc-900 rounded text-left transition"
                >
                  <span className="text-[10px] font-serif font-extrabold text-zinc-400">P</span>
                  <span>Pinterest</span>
                </button>
                <button
                  onClick={shareWhatsApp}
                  className="flex items-center gap-2 px-2.5 py-1 text-[8px] font-mono uppercase text-zinc-400 hover:text-white hover:bg-zinc-900 rounded text-left transition"
                >
                  <MessageCircle className="w-2.5 h-2.5 text-emerald-400 fill-emerald-400/10" />
                  <span>WhatsApp</span>
                </button>
                <div className="h-[1px] bg-zinc-900 my-0.5" />
                <button
                  onClick={onShare}
                  className="flex items-center gap-2 px-2.5 py-1 text-[8.5px] font-mono uppercase text-gold-400 hover:text-white hover:bg-zinc-900 rounded text-left transition"
                >
                  <span>🔗 Copy Link</span>
                </button>
              </div>
            )}
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onExportPDF();
            }}
            className="p-1 px-1.5 rounded bg-black/60 border border-white/10 hover:border-gold-500 hover:text-gold-400 transition cursor-pointer"
            title="Download PDF Spec Blueprint"
          >
            <Download className="w-3 h-3 text-gold-400" />
          </button>
        </div>
      </div>

      {/* Center Narrative Title */}
      <div className={`relative z-10 my-auto py-4 flex flex-col ${
        item.align === 'center' ? 'text-center items-center' : item.align === 'right' ? 'text-right items-end' : 'text-left items-start'
      }`}>
        <span 
          className="font-mono text-[10px] uppercase tracking-[0.2em] mb-1.5 block opacity-95"
          style={{ color: item.accentColor }}
        >
          {renderHighlightedText(item.subtitle, searchQuery)}
        </span>

        <h3 
          className="text-xl md:text-2xl font-extrabold tracking-tighter leading-tight text-white drop-shadow-lg"
          style={{ fontFamily: item.fontTitle === 'Playfair Display' ? 'serif' : item.fontTitle === 'Space Grotesk' ? 'sans-serif' : 'monospace' }}
        >
          {renderHighlightedText(item.title, searchQuery)}
        </h3>

        {item.keywords && (
          <div className="flex flex-wrap gap-1 mt-3">
            {item.keywords.map((kw, i) => (
              <span 
                key={i} 
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectKeyword(kw);
                }}
                className="text-[7.5px] font-mono tracking-normal uppercase bg-black/60 border border-white/5 py-0.5 px-2 rounded hover:border-gold-500/40 transition cursor-pointer text-zinc-400 hover:text-gold-300"
              >
                #{kw}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Footer Copy & Quick Actions */}
      <div className="relative z-10 border-t border-white/10 pt-4 flex items-center justify-between">
        <div className="text-left font-mono text-[8px] max-w-[50%] text-zinc-400">
          <span className="text-zinc-650 uppercase block font-bold">Concept Summary</span>
          <p className="line-clamp-1 italic">{item.details}</p>
        </div>

        {/* Action Button Row */}
        <div className="flex items-center gap-1.5">
          {/* Quick View Mini-Modal Trigger */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onQuickView();
            }}
            className="bg-zinc-900/90 text-zinc-300 hover:text-white border border-zinc-800 hover:border-zinc-700 p-2 rounded-xl transition duration-200 text-xs flex items-center gap-1 cursor-pointer"
            title="Review Layout in Quick View"
          >
            <Eye className="w-3 h-3 text-zinc-400" />
            <span className="font-mono text-[9px] uppercase tracking-wider font-semibold">Quick View</span>
          </button>

          {/* Load look template to canvas */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onLoadTemplate(item.id);
            }}
            className="bg-gold-500 hover:bg-gold-400 text-black p-2 rounded-xl font-bold transition active:scale-95 text-xs flex items-center gap-1 cursor-pointer"
            title="Load in custom canvas"
          >
            <Sparkles className="w-3 h-3" />
            <span className="font-mono text-[9px] uppercase font-extrabold tracking-wider">Atelier</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}
