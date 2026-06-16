import React from 'react';
import { X, Award, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PosterComposition } from '../types';

interface PrintPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  composition: PosterComposition;
  placedAssets?: any[];
}

export default function PrintPreviewModal({ isOpen, onClose, composition, placedAssets = [] }: PrintPreviewModalProps) {
  // Translate design fonts for consistent UI mockups
  const getFontFamily = (fontName: string) => {
    if (fontName === 'Playfair Display') return 'serif';
    if (fontName === 'Space Grotesk') return 'sans-serif';
    if (fontName === 'JetBrains Mono') return 'monospace';
    return 'sans-serif';
  };

  const titleFont = getFontFamily(composition.fontTitle);
  const subtitleFont = getFontFamily(composition.fontSubtitle);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="bg-zinc-950 border border-zinc-900 rounded-2xl w-full max-w-4xl p-6 md:p-8 relative flex flex-col items-center justify-between shadow-2xl overflow-hidden select-none"
          >
            {/* Top red header underline */}
            <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-red-500/0 via-gold-500/80 to-red-500/0" />

            {/* Corner exit button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header meta */}
            <div className="text-center space-y-1.5 mb-6 md:mb-8">
              <span className="font-mono text-[9px] text-gold-400 uppercase tracking-widest bg-gold-950/40 border border-gold-900/40 px-2.5 py-0.5 rounded-full inline-block">
                Architectural Print Model
              </span>
              <h3 className="font-display text-xl md:text-2xl font-medium text-white tracking-tight">
                Physical Gallery <span className="font-editorial italic text-gold-400">Wall Frame Preview</span>
              </h3>
              <p className="text-zinc-500 text-xs max-w-md font-sans">
                Rendered inside a 50x70cm Solid Timber Gallery Frame with a custom 5cm anti-glare museum-grade pass-partout matboard.
              </p>
            </div>

            {/* Real Interior Mockup Screen Frame Stage */}
            <div className="w-full relative bg-zinc-900/40 rounded-xl border border-zinc-850 p-6 md:p-12 mb-6 flex flex-col items-center justify-center min-h-[420px] shadow-inner overflow-hidden">
              {/* Textured wall interior background simulation */}
              <div className="absolute inset-0 bg-radial from-zinc-900/60 via-zinc-950 to-black pointer-events-none" />
              <div className="absolute inset-0 bg-grain mix-blend-overlay opacity-30 pointer-events-none" />
              
              {/* Ambient Downlight Glow on the wall */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[340px] h-[180px] bg-amber-500/10 blur-[80px] rounded-full pointer-events-none" />

              {/* Timber Oak/Satin-Black Frame Outer Border */}
              <div className="relative z-10 p-5 bg-black border-4 border-zinc-850 rounded bg-gradient-to-br from-zinc-950 via-black to-zinc-900 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)] flex items-center justify-center shrink-0">
                
                {/* Frame Inner Accent Bevel */}
                <div className="absolute inset-[1px] border border-zinc-800/80 pointer-events-none" />

                {/* Museum Pass-partout (Beige-white matboard) */}
                <div className="p-6 md:p-10 bg-stone-100 shadow-inner flex items-center justify-center border border-stone-250 shrink-0 relative">
                  
                  {/* Matboard bevel cut shadows */}
                  <div className="absolute inset-0 shadow-[inset_0_2px_4px_rgba(0,0,0,0.15)] pointer-events-none" />

                  {/* Actual Scaled Poster Template Canvas layout */}
                  <div 
                    className="w-48 h-64 shadow-[0_4px_12px_rgba(0,0,0,0.25)] relative overflow-hidden flex flex-col justify-between p-4 flex-shrink-0 select-none cursor-default border border-stone-200"
                    style={{ 
                      background: composition.bgType === 'image' 
                        ? `url(${composition.bgValue}) center/cover no-repeat` 
                        : composition.bgType === 'gradient' 
                          ? composition.bgValue 
                          : composition.bgValue,
                      backgroundColor: composition.bgType === 'color' ? composition.bgValue : '#000000'
                    }}
                  >
                    {/* Background darkening overlay if image background is used */}
                    {composition.bgType === 'image' && (
                      <div className="absolute inset-0 bg-black/40 mix-blend-multiply" />
                    )}

                    {/* Poster Elements content */}
                    <div className="relative z-10 flex flex-col h-full justify-between">
                      <div className="text-left">
                        <span className="text-[7px] font-mono tracking-widest block uppercase opacity-75" style={{ color: composition.accentColor }}>
                          CREATIVENODE STUDIO
                        </span>
                        <h4 className="text-xs font-bold leading-tight mt-0.5" style={{ fontFamily: titleFont, color: composition.textColor }}>
                          {composition.title}
                        </h4>
                        <p className="text-[7.5px] font-mono leading-relaxed mt-1 opacity-80" style={{ fontFamily: subtitleFont, color: composition.textColor }}>
                          {composition.subtitle}
                        </p>
                      </div>

                      {/* Geometric Element */}
                      {composition.geometricElement && composition.geometricElement !== 'none' && (
                        <div className="absolute inset-0 flex items-center justify-center opacity-30 pointer-events-none">
                          {composition.geometricElement === 'circle' && (
                            <div className="w-14 h-14 rounded-full border-2" style={{ borderColor: composition.accentColor }} />
                          )}
                          {composition.geometricElement === 'lines' && (
                            <div className="w-14 h-5 flex flex-col justify-between">
                              <div className="h-[2px] w-full" style={{ backgroundColor: composition.accentColor }} />
                              <div className="h-[2px] w-full bg-white" />
                              <div className="h-[2px] w-full" style={{ backgroundColor: composition.accentColor }} />
                            </div>
                          )}
                          {composition.geometricElement === 'grid' && (
                            <div className="w-12 h-12 border border-dashed grid grid-cols-2 grid-rows-2" style={{ borderColor: composition.accentColor }}>
                              <div className="border-r border-b border-dashed" style={{ borderColor: composition.accentColor }} />
                              <div className="border-b border-dashed" style={{ borderColor: composition.accentColor }} />
                              <div className="border-r border-dashed" style={{ borderColor: composition.accentColor }} />
                              <div className="border-dashed" style={{ borderColor: composition.accentColor }} />
                            </div>
                          )}
                          {composition.geometricElement === 'border' && (
                            <div className="absolute inset-2 border" style={{ borderColor: composition.accentColor }} />
                          )}
                        </div>
                      )}

                      {/* Render placed custom assets within the scaled view */}
                      {placedAssets.length > 0 && (
                        <div className="absolute inset-0 pointer-events-none">
                          {placedAssets.map((asset) => (
                            <div
                              key={asset.id}
                              className="absolute"
                              style={{
                                left: `${asset.x}%`,
                                top: `${asset.y}%`,
                                transform: `translate(-50%, -50%) scale(${asset.scale / 100})`,
                                color: asset.baseColorMatch ? composition.accentColor : '#ffffff',
                              }}
                            >
                              {asset.category === 'ornament' ? (
                                <span className="text-[5px] font-mono bg-black/40 px-0.5 rounded leading-none w-max block whitespace-nowrap">{asset.content}</span>
                              ) : (
                                <div className="w-6 h-6 leading-none" dangerouslySetInnerHTML={{ __html: asset.content }} />
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Footer spec tag */}
                      <div className="relative z-10 pt-2 border-t border-white/10 flex flex-col font-mono text-[5px]" style={{ color: composition.textColor }}>
                        <p className="line-clamp-1 opacity-70 italic leading-relaxed">{composition.details}</p>
                        <span className="opacity-40 mt-0.5">Sovereign Edition Blueprint</span>
                      </div>
                    </div>

                    {/* Anti-reflective museum glass glare highlight reflection simulation */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/15 pointer-events-none transform -skew-x-12 opacity-60 z-20" />
                  </div>
                </div>
              </div>

              {/* Realistic Shadow underneath the frame on the wall */}
              <div className="w-56 h-3 bg-black/85 blur-lg mix-blend-multiply rounded-full opacity-60 -mt-1 relative z-0" />

              {/* Elegant designer studio furniture representation down below */}
              <div className="absolute bottom-0 inset-x-12 h-6 border-t border-zinc-800/80 bg-zinc-950 flex items-center justify-between px-4 font-mono text-[8px] text-zinc-650 tracking-wider">
                <span>// STUDIO VIEW MOCKUP CLIENT_REPRESENTATION</span>
                <span>CREATIVENODE DESIGN ARCHIVE v2</span>
              </div>
            </div>

            {/* Spec details overview card */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full bg-zinc-900/35 border border-zinc-900 rounded-xl p-4 text-left mb-6 font-mono text-[11px]">
              <div>
                <span className="text-zinc-500 uppercase text-[9px] block">Composition Title</span>
                <span className="text-white font-bold block truncate">{composition.title}</span>
              </div>
              <div>
                <span className="text-zinc-500 uppercase text-[9px] block">Frame Configuration</span>
                <span className="text-gold-400 font-bold block">Solid Black Timber</span>
              </div>
              <div>
                <span className="text-zinc-500 uppercase text-[9px] block">Glass Treatment</span>
                <span className="text-zinc-300 block">Anti-Reflective 99% UV</span>
              </div>
              <div>
                <span className="text-zinc-500 uppercase text-[9px] block">Matboard Option</span>
                <span className="text-zinc-300 block">Natural Cotton White</span>
              </div>
            </div>

            {/* Close footer button */}
            <button
              onClick={onClose}
              className="w-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-white font-semibold py-2.5 rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-1.5 uppercase font-mono tracking-wider hover:text-gold-400"
            >
              <span>Exit Physical Print Preview</span>
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
