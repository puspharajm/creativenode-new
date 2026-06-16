import React, { useEffect, useState, useRef } from 'react';
import gsap from 'gsap';

interface LoadingScreenProps {
  onComplete: () => void;
}

export default function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [percent, setPercent] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const wavePathRef1 = useRef<SVGPathElement>(null);
  const wavePathRef2 = useRef<SVGPathElement>(null);
  const textRef = useRef<HTMLHeadingElement>(null);
  const countRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !cardRef.current || !textRef.current || !countRef.current) return;

    // 1. Counting logic from 0 to 100
    const progressObj = { value: 0 };
    const counterAnim = gsap.to(progressObj, {
      value: 100,
      duration: 3.2,
      ease: "power2.out",
      onUpdate: () => {
        setPercent(Math.floor(progressObj.value));
      }
    });

    // 2. Liquid wave animation
    // We animate the base wave coordinates in GSAP using a cyclical modifier or sine offsets
    let waveOffset1 = 0;
    let waveOffset2 = Math.PI; // Phase shifted
    const amplitude = 6;       // wave peak size
    const frequency = 0.04;    // wavelength density

    const computeWavePath = (offset: number, heightPercentage: number) => {
      // heightPercentage goes from 100 (bottom/empty) to 0 (top/full)
      // Map to pixels on our 100x100 grid (e.g., 90px to 10px)
      const baseHeight = 10 + (heightPercentage / 100) * 80;
      let path = `M 0,${baseHeight} `;
      
      for (let x = 0; x <= 100; x += 2) {
        const y = baseHeight + Math.sin(x * frequency + offset) * amplitude;
        path += `L ${x},${Math.min(99, Math.max(1, y))} `;
      }
      path += `L 100,100 L 0,100 Z`;
      return path;
    };

    const waveTicker = gsap.ticker.add(() => {
      waveOffset1 += 0.085;
      waveOffset2 += 0.055;
      const progress = progressObj.value; // 0 to 100
      const currentFillY = 100 - progress; // Translate to height (100 to 0)

      if (wavePathRef1.current) {
        wavePathRef1.current.setAttribute('d', computeWavePath(waveOffset1, currentFillY));
      }
      if (wavePathRef2.current) {
        wavePathRef2.current.setAttribute('d', computeWavePath(waveOffset2, currentFillY));
      }
    });

    // 3. Staggered animations & exits
    const tl = gsap.timeline({
      onComplete: () => {
        gsap.to(containerRef.current, {
          opacity: 0,
          scale: 1.05,
          duration: 0.8,
          ease: "power3.inOut",
          onComplete: () => {
            gsap.ticker.remove(waveTicker);
            counterAnim.kill();
            onComplete();
          }
        });
      }
    });

    // Entrance staggered fades
    gsap.fromTo(cardRef.current, 
      { opacity: 0, y: 30, scale: 0.94 },
      { opacity: 1, y: 0, scale: 1, duration: 1.2, ease: "power4.out" }
    );

    gsap.fromTo([textRef.current, countRef.current],
      { opacity: 0, scale: 0.95 },
      { opacity: 1, scale: 1, duration: 1.0, delay: 0.4, stagger: 0.15, ease: "power3.out" }
    );

    // Once progress value reaches 100, trigger out animation
    tl.to({}, { duration: 3.5 }); // Let counting and wave rise run together for 3.5s

    return () => {
      gsap.ticker.remove(waveTicker);
      counterAnim.kill();
      tl.kill();
    };
  }, [onComplete]);

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 z-[99999] bg-[#060608] flex items-center justify-center p-4 overflow-hidden"
    >
      {/* Dynamic luxury dark space ambient lights background */}
      <div className="absolute inset-0 bg-radial-gradient from-gold-500/5 via-zinc-950/40 to-black pointer-events-none" />
      <div className="absolute top-[30%] left-[20%] w-[350px] h-[350px] bg-amber-500/5 rounded-full filter blur-[100px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-[20%] right-[10%] w-[380px] h-[380px] bg-yellow-500/5 rounded-full filter blur-[110px] pointer-events-none animate-pulse" style={{ animationDuration: '6s' }} />
      <div className="absolute inset-0 bg-grain mix-blend-overlay opacity-30 pointer-events-none" />

      {/* Glassmorphic Container Card Frame */}
      <div 
        ref={cardRef}
        className="w-full max-w-md p-8 md:p-12 rounded-3xl backdrop-blur-xl bg-zinc-950/30 border border-zinc-900/40 flex flex-col items-center justify-center relative shadow-[0_30px_70px_rgba(0,0,0,0.85)]"
        style={{
          boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.05), 0 25px 50px -12px rgba(0,0,0,0.85)'
        }}
      >
        {/* Subtle decorative glowing frame edges */}
        <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-gold-500/25 to-transparent" />
        <div className="absolute bottom-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-zinc-805 to-transparent" />

        {/* Liquid wave container visualizer */}
        <div className="relative w-28 h-28 md:w-32 md:h-32 rounded-full border border-zinc-850 bg-black/50 p-1 flex items-center justify-center mb-8 overflow-hidden shadow-2xl group">
          
          {/* Bevel reflection lines */}
          <div className="absolute inset-[1px] rounded-full border border-white/5 pointer-events-none z-30" />
          <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/10 pointer-events-none z-20" />

          {/* Liquid Wave SVG Mask & Filled Area */}
          <svg 
            viewBox="0 0 100 100" 
            className="w-full h-full rounded-full overflow-hidden absolute inset-0 z-0 pointer-events-none"
          >
            {/* Background Waterwave Segment */}
            <path 
              ref={wavePathRef1}
              fill="rgba(212, 175, 55, 0.2)"
              d="M 0,50 Q 25,45 50,55 T 100,50 L 100,100 L 0,100 Z"
            />
            {/* Primary Front Waterwave Segment */}
            <path 
              ref={wavePathRef2}
              fill="rgba(212, 175, 55, 0.75)"
              d="M 0,50 Q 25,55 50,45 T 100,50 L 100,100 L 0,100 Z"
            />
          </svg>

          {/* Inner Brand Signet Icon (Focal Layer) */}
          <div className="z-10 mix-blend-difference text-white select-none">
            <svg viewBox="0 0 100 100" className="w-10 h-10 fill-current" xmlns="http://www.w3.org/2000/svg">
              <circle cx="50" cy="50" r="14" fill="none" stroke="currentColor" strokeWidth="2" />
              <path d="M50 8 L50 26 M50 74 L50 92 M8 50 L26 50 M74 50 L92 50" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <circle cx="50" cy="12" r="4" fill="currentColor" />
              <circle cx="50" cy="88" r="4" fill="currentColor" />
              <circle cx="12" cy="50" r="4" fill="currentColor" />
              <circle cx="88" cy="50" r="4" fill="currentColor" />
            </svg>
          </div>
        </div>

        {/* Brand Label and Typography */}
        <div className="space-y-4 text-center">
          <div className="flex flex-col gap-1 items-center">
            <span className="font-mono text-[9px] uppercase tracking-[0.45em] text-zinc-500 font-bold block mb-1">
              EST. MMXXVI // ARCHITECTURAL
            </span>
            <h2 
              ref={textRef}
              className="font-sans text-xl md:text-2xl font-black text-white hover:text-gold-400 transition-colors uppercase tracking-[0.22em] leading-none"
            >
              CREATIVENODE
            </h2>
          </div>
          
          <p className="text-zinc-650 text-[10.5px] uppercase font-mono tracking-wider max-w-xs mx-auto">
            Universal Poster Specification Engine
          </p>

          {/* Percentage text count indicator */}
          <div 
            ref={countRef}
            className="pt-6 flex flex-col items-center justify-center font-mono space-y-1"
          >
            <div className="text-2xl font-bold tracking-tight text-white flex items-baseline gap-1">
              <span className="text-gold-400 text-3xl font-serif italic pr-0.5">{String(percent).padStart(3, '0')}</span>
              <span className="text-xs text-zinc-550">%</span>
            </div>
            <div className="h-0.5 w-32 bg-zinc-900 overflow-hidden rounded relative">
              <div 
                className="h-full bg-gold-400 rounded transition-all duration-100"
                style={{ width: `${percent}%` }}
              />
            </div>
            <span className="text-[7.5px] uppercase tracking-widest text-[#dfb76c] font-bold block pt-1 animate-pulse">
              Hydraulics filling ink lines...
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
