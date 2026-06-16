import React, { useState } from 'react';
import { 
  X, Info, Layout, BookOpen, Scaling, Grid, Square, ShieldAlert, CheckCircle, Type, Sparkles 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface DesignPrinciplesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DesignPrinciplesModal({ isOpen, onClose }: DesignPrinciplesModalProps) {
  const [activeTab, setActiveTab] = useState<'swiss' | 'brutalist' | 'typography'>('swiss');

  // Interactive Demo State: Swiss Grid Alignment Selector
  const [swissGridActive, setSwissGridActive] = useState(true);
  const [swissAlign, setSwissAlign] = useState<'asymmetric' | 'strict'>('asymmetric');

  // Interactive Demo State: Brutalist Mode
  const [brutalistContrast, setBrutalistContrast] = useState<boolean>(true);
  const [brutalistBorderWeight, setBrutalistBorderWeight] = useState<number>(4);

  // Interactive Demo State: Typography Scale Slider
  const [typoTitleSize, setTypoTitleSize] = useState<number>(36);
  const [typoSubtitleSize, setTypoSubtitleSize] = useState<number>(12);

  // Custom styling presets based on themes
  const swissColumns = 3;
  
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/95 flex items-center justify-center p-4 md:p-8 z-[120] backdrop-blur-md overflow-y-auto"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, y: 30 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            transition={{ type: 'spring', duration: 0.45 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-zinc-950 border border-zinc-900 rounded-3xl w-full max-w-4xl overflow-hidden relative shadow-2xl flex flex-col h-[90vh] md:h-[80vh]"
          >
            {/* Holographic Header separator strip */}
            <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-gold-500/10 via-gold-400 to-gold-500/10" />

            {/* Modal Header */}
            <div className="p-6 border-b border-zinc-900 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <BookOpen className="w-5 h-5 text-gold-405 text-gold-400 animate-pulse" />
                <div>
                  <h3 className="font-display font-medium text-white text-lg tracking-tight">Atelier Design Academy</h3>
                  <p className="text-zinc-500 text-[10.5px] font-mono uppercase tracking-wider">Aesthetic & Layout Masterclasses</p>
                </div>
              </div>
              
              <button
                type="button"
                onClick={onClose}
                className="bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white p-2 rounded-full border border-zinc-850 transition cursor-pointer"
                title="Close guide"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick school category switcher */}
            <div className="bg-zinc-900/20 border-b border-zinc-900 px-6 py-2 flex gap-1 overflow-x-auto scrollbar-none">
              {[
                { id: 'swiss', label: 'Swiss Modernism', desc: 'Asymmetric Grids' },
                { id: 'brutalist', label: 'Brutalist Rawness', desc: 'Asymmetrical Impact' },
                { id: 'typography', label: 'Typography Scaling', desc: 'Hierarchy Ratios' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-4 py-2 rounded-xl transition font-mono text-left flex flex-col whitespace-nowrap min-w-[150px] ${
                    activeTab === tab.id 
                      ? 'bg-zinc-900 border border-zinc-850 text-white shadow-lg' 
                      : 'text-zinc-500 hover:text-zinc-350 border border-transparent'
                  }`}
                >
                  <span className="text-[11px] font-bold tracking-wide">{tab.label}</span>
                  <span className="text-[8px] opacity-70 tracking-normal font-normal lowercase">{tab.desc}</span>
                </button>
              ))}
            </div>

            {/* Modal Body Container */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 scrollbar-none">
              
              {activeTab === 'swiss' && (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                  <div className="md:col-span-7 space-y-4">
                    <div className="flex items-center gap-2 text-zinc-400">
                      <Layout className="w-4 h-4 text-rose-400" />
                      <span className="font-mono text-xs uppercase tracking-wide font-bold">The International Typographic Style</span>
                    </div>

                    <h4 className="text-xl font-display font-semibold text-white tracking-tight">Swiss Modernist Discipline</h4>
                    <p className="text-zinc-400 text-xs leading-relaxed font-sans">
                      Emerging in Switzerland in the 1950s, this design system values absolute functional clarity and mathematical precision above decorative illustration. The content itself, structured by responsive alignment grids, serves as the dominant graphic voice.
                    </p>

                    <div className="space-y-2.5 pt-2">
                      <h5 className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Key Architectural Directives:</h5>
                      <ul className="space-y-2 text-xs font-sans text-zinc-350">
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-3.5 h-3.5 text-gold-400 shrink-0 mt-0.5" />
                          <span><strong>Asymmetric Axis Placement</strong>: Never default to perfect center symmetry. Positioning bodies on a strict left/right margin axis signals modern rhythm.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-3.5 h-3.5 text-gold-400 shrink-0 mt-0.5" />
                          <span><strong>The Power of Void Scale</strong>: Treat empty margins and negative spacing (whitespace) as a physical design object. Empty spaces pull weight toward titles.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-3.5 h-3.5 text-gold-400 shrink-0 mt-0.5" />
                          <span><strong>Helvetica / Sans Typefaces</strong>: Prefer clean, sans-serif display typefaces to preserve objectiveness and immediate visual legibility.</span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  {/* INTERACTIVE DEMO: Swiss Grid Sandbox */}
                  <div className="md:col-span-5 bg-zinc-900/30 border border-zinc-900 rounded-2xl p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest font-bold">Interactive Sandbox</span>
                      <button
                        onClick={() => setSwissGridActive(!swissGridActive)}
                        className={`text-[9px] font-mono px-2 py-0.5 rounded transition border ${
                          swissGridActive ? 'border-rose-900/50 bg-rose-950/20 text-rose-400' : 'border-zinc-805 bg-zinc-900 text-zinc-500'
                        }`}
                      >
                        Grid lines: {swissGridActive ? 'ON' : 'OFF'}
                      </button>
                    </div>

                    {/* Virtual CAD alignment canvas */}
                    <div className="aspect-[4/5] bg-zinc-950 border border-zinc-900 rounded-xl relative p-4 flex flex-col justify-between overflow-hidden">
                      {swissGridActive && (
                        <div className="absolute inset-0 pointer-events-none z-10 flex">
                          {Array.from({ length: swissColumns }).map((_, i) => (
                            <div 
                              key={i} 
                              className="flex-1 border-r border-dashed border-rose-500/20 last:border-r-0 h-full" 
                            />
                          ))}
                        </div>
                      )}

                      <div className="font-mono text-[7px] text-zinc-650 tracking-wider">CREATIVENODE SWISS REPLICA</div>

                      {/* Align test */}
                      <div className={`space-y-1.5 z-25 relative ${
                        swissAlign === 'asymmetric' ? 'text-left pl-2 pt-6' : 'text-center pt-8'
                      }`}>
                        <span className="text-[7.5px] font-mono text-rose-400 uppercase tracking-widest block font-bold">PRECISE MODULE 1.0</span>
                        <h5 className="text-sm font-display font-medium text-white leading-tight">GENERATE GRAPHIC STYLES</h5>
                        <p className="text-[7px] text-zinc-500 italic max-w-[120px] leading-relaxed mx-auto select-none">
                          "Mathematical balance overrides decoration."
                        </p>
                      </div>

                      <div className={`mt-auto text-[7px] font-mono border-t border-zinc-900 pt-2 flex items-center justify-between ${
                        swissAlign === 'asymmetric' ? 'text-left pl-2' : 'text-center'
                      }`}>
                        <span>STRICT SYSTEM PROTOCOL</span>
                        <span>© 2026</span>
                      </div>
                    </div>

                    {/* Controls */}
                    <div className="flex gap-2.5">
                      <button
                        onClick={() => setSwissAlign('asymmetric')}
                        className={`flex-1 font-mono text-[9.5px] py-1.5 rounded transition border text-center ${
                          swissAlign === 'asymmetric' ? 'border-gold-500 bg-gold-950/15 text-gold-400 font-bold' : 'border-zinc-900 text-zinc-500 hover:text-white'
                        }`}
                      >
                        Asymmetric Left
                      </button>
                      <button
                        onClick={() => setSwissAlign('strict')}
                        className={`flex-1 font-mono text-[9.5px] py-1.5 rounded transition border text-center ${
                          swissAlign === 'strict' ? 'border-gold-500 bg-gold-950/15 text-gold-400 font-bold' : 'border-zinc-900 text-zinc-500 hover:text-white'
                        }`}
                      >
                        Symmetrical Center
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'brutalist' && (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                  <div className="md:col-span-7 space-y-4">
                    <div className="flex items-center gap-2 text-zinc-400">
                      <Square className="w-4 h-4 text-emerald-400 animate-pulse" />
                      <span className="font-mono text-xs uppercase tracking-wide font-bold">Unapologetic Visual Statements</span>
                    </div>

                    <h4 className="text-xl font-display font-semibold text-white tracking-tight">Brutalist Graphic Structure</h4>
                    <p className="text-zinc-400 text-xs leading-relaxed font-sans">
                      Inspired by mid-century concrete architecture (béton brut), digital brutalism defies commercial friendliness. Characterized by aggressive raw layout styling, exaggerated high-contrast blocks, heavy framing borders, and a disregard for convention.
                    </p>

                    <div className="space-y-2.5 pt-2">
                      <h5 className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Elements of Brutalism:</h5>
                      <ul className="space-y-2 text-xs font-sans text-zinc-350">
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-3.5 h-3.5 text-gold-400 shrink-0 mt-0.5" />
                          <span><strong>Severe Contrast Boundaries</strong>: Relying on raw monochrome (solid black backgrounds, intense absolute white overlay text, or electric primaries).</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-3.5 h-3.5 text-gold-400 shrink-0 mt-0.5" />
                          <span><strong>Thick Monolithic Borders</strong>: Deliberately framing modules inside heavy solid bounding borders (`border-4` or massive dividing lines).</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-3.5 h-3.5 text-gold-400 shrink-0 mt-0.5" />
                          <span><strong>Unfiltered Technical Elements</strong>: Exposing monospace codes, strict metadata headers, and standard generic buttons without elegant padding fades.</span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  {/* INTERACTIVE DEMO: Brutalist Builder */}
                  <div className="md:col-span-5 bg-zinc-900/30 border border-zinc-900 rounded-2xl p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest font-bold">Brutalist Sandbox</span>
                      <button
                        onClick={() => setBrutalistContrast(!brutalistContrast)}
                        className="text-[9px] font-mono px-2 py-0.5 bg-zinc-900 hover:bg-zinc-850 rounded text-zinc-400 hover:text-white border border-zinc-800 transition"
                      >
                        Invert Contrast
                      </button>
                    </div>

                    {/* Brutalist Poster wireframe */}
                    <div 
                      className={`aspect-[4/5] rounded-none transition duration-200 p-5 flex flex-col justify-between selection:bg-rose-500 selection:text-white select-none`}
                      style={{
                        backgroundColor: brutalistContrast ? '#050505' : '#ffffff',
                        color: brutalistContrast ? '#ffffff' : '#000000',
                        borderWidth: `${brutalistBorderWeight}px`,
                        borderColor: brutalistContrast ? '#ffffff' : '#000000'
                      }}
                    >
                      <div className="border-b-2 font-mono text-[8px] uppercase tracking-wider pb-1" style={{ borderColor: brutalistContrast ? '#ffffff' : '#000000' }}>
                        ATELIER SYSTEM VER. 3.01
                      </div>

                      <div className="my-auto space-y-3">
                        <h5 className="text-xl font-bold font-mono tracking-tight uppercase leading-none">
                          RAW TEXT BLOCK
                        </h5>
                        <p className="font-mono text-[8.5px] leading-relaxed">
                          UNFILTRED RAW MONOSPACED STATEMENT. STRICT STRUCTURAL CONCRETE DIRECTIVES ENFORCED.
                        </p>
                      </div>

                      <div className="font-mono text-[7px] text-right bg-zinc-900 text-white p-1 rounded-none border" style={{ borderColor: brutalistContrast ? '#ffffff' : '#000500' }}>
                        LEDGER_STATUS: RAW_MODE
                      </div>
                    </div>

                    {/* Border Slider */}
                    <div>
                      <div className="flex justify-between font-mono text-[10px] text-zinc-500 mb-1">
                        <span>BORDER STRENGTH</span>
                        <span>{brutalistBorderWeight}px</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="8"
                        value={brutalistBorderWeight}
                        onChange={(e) => setBrutalistBorderWeight(parseInt(e.target.value, 10))}
                        className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-gold-400"
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'typography' && (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                  <div className="md:col-span-7 space-y-4">
                    <div className="flex items-center gap-2 text-zinc-400">
                      <Type className="w-4 h-4 text-blue-400" />
                      <span className="font-mono text-xs uppercase tracking-wide font-bold">Typographical Scale & Form</span>
                    </div>

                    <h4 className="text-xl font-display font-semibold text-white tracking-tight">Scale Over Ornamentation</h4>
                    <p className="text-zinc-400 text-xs leading-relaxed font-sans">
                      In typographic poster layout design, the visual hierarchy must be established with extreme confidence. By pairing highly contrasting weights — huge headings paired with micro-text specs — you establish immediate tension that guides the eye naturally.
                    </p>

                    <div className="space-y-2.5 pt-2">
                      <h5 className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Typographic Best Practices:</h5>
                      <ul className="space-y-2 text-xs font-sans text-zinc-350">
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-3.5 h-3.5 text-gold-400 shrink-0 mt-0.5" />
                          <span><strong>The 3:1 Scaling Rule</strong>: Your focal headline should always be at least three times the scale of your subheadings. Avoid safe, similar font sizes that create muddy visual conflict.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-3.5 h-3.5 text-gold-400 shrink-0 mt-0.5" />
                          <span><strong>Pairing Sans and Serif</strong>: Create extreme brand contrast by pairing a structural geometric heading (like Space Grotesk) with a classic luxury serif (like Playfair Display) in italic for a sophisticated layout.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-3.5 h-3.5 text-gold-400 shrink-0 mt-0.5" />
                          <span><strong>Letter-Spacing / Tracking Tension</strong>: Tighten display letter spacing (`tracking-tighter`) for giant headlining titles to glue them as a solid unified block. Conversely, expand monospaced sublines (`tracking-widest`) for extreme prestige reading clarity.</span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  {/* INTERACTIVE DEMO: Typographic Hierarchy Tuner */}
                  <div className="md:col-span-5 bg-zinc-900/30 border border-zinc-900 rounded-2xl p-5 space-y-4">
                    <div className="flex items-center justify-between border-b border-zinc-900 pb-2 mb-1">
                      <span className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest font-bold">Scale Proportion Sandbox</span>
                      <span className="font-mono text-[8px] text-zinc-650">RATIO: {Math.round(typoTitleSize / typoSubtitleSize)}:1</span>
                    </div>

                    {/* Virtual typographic block */}
                    <div className="aspect-[4/5] bg-zinc-950 border border-zinc-900 rounded-xl p-5 flex flex-col justify-between overflow-hidden">
                      <div className="font-mono text-[7px] text-zinc-600 tracking-wider">CREATIVENODE HIERARCHY SIMULATOR</div>

                      <div className="my-auto space-y-2 text-center">
                        {/* Subtitle */}
                        <span 
                          className="font-mono uppercase tracking-[0.25em] font-semibold block text-gold-400"
                          style={{ fontSize: `${typoSubtitleSize}px` }}
                        >
                          LUMINOUS SPECTRA
                        </span>

                        {/* Heading */}
                        <h5 
                          className="font-display font-extrabold tracking-tighter text-white leading-none uppercase drop-shadow-lg"
                          style={{ fontSize: `${typoTitleSize}px` }}
                        >
                          ATELIER
                        </h5>
                      </div>

                      <div className="font-mono text-[7px] text-zinc-650 flex items-center justify-between">
                        <span>SCALE TUNING ACTIVE</span>
                        <span>V.30</span>
                      </div>
                    </div>

                    {/* Slider Title Size */}
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between font-mono text-[10px] text-zinc-500 mb-1">
                          <span>HEADLINE HEIGHT</span>
                          <span>{typoTitleSize}px</span>
                        </div>
                        <input
                          type="range"
                          min="24"
                          max="48"
                          value={typoTitleSize}
                          onChange={(e) => setTypoTitleSize(parseInt(e.target.value, 10))}
                          className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-gold-400"
                        />
                      </div>

                      {/* Slider Subtitle Size */}
                      <div>
                        <div className="flex justify-between font-mono text-[10px] text-zinc-500 mb-1">
                          <span>SUBTITLE HEIGHT</span>
                          <span>{typoSubtitleSize}px</span>
                        </div>
                        <input
                          type="range"
                          min="8"
                          max="16"
                          value={typoSubtitleSize}
                          onChange={(e) => setTypoSubtitleSize(parseInt(e.target.value, 10))}
                          className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-gold-400"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-zinc-900 bg-zinc-950 flex items-center justify-between">
              <span className="font-mono text-[9px] text-zinc-600 uppercase tracking-wider">
                Practice Grid Systems inside the Interactive Atelier
              </span>
              <button
                type="button"
                onClick={onClose}
                className="bg-gold-400 hover:bg-gold-300 text-black px-5 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition active:scale-95 cursor-pointer"
              >
                Let's Build Poster
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
