import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Hexagon, Command } from 'lucide-react';

interface LoadingScreenProps {
  onComplete: () => void;
}

export default function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Simulate loading progress over 2.5 seconds
    const duration = 2500;
    const intervalTime = 30;
    const steps = duration / intervalTime;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      const nextProgress = Math.min(Math.floor((currentStep / steps) * 100), 100);
      setProgress(nextProgress);

      if (currentStep >= steps) {
        clearInterval(timer);
        // Add a tiny delay before calling onComplete to let the user see 100%
        setTimeout(() => {
          onComplete();
        }, 300);
      }
    }, intervalTime);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, filter: 'blur(10px)', transition: { duration: 0.8, ease: 'easeInOut' } }}
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-zinc-950 overflow-hidden"
    >
      {/* Background Ambience */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-gold-500/10 rounded-full blur-[120px] animate-pulse delay-1000" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay" />
      </div>

      {/* Main Glassmorphism Card */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 flex flex-col items-center p-12 bg-zinc-900/40 backdrop-blur-3xl border border-zinc-800/50 rounded-3xl shadow-[0_0_80px_rgba(0,0,0,0.5)] w-[90%] max-w-md overflow-hidden"
      >
        {/* Shimmer effect inside the card */}
        <motion.div 
          animate={{ x: ['-100%', '200%'] }}
          transition={{ repeat: Infinity, duration: 3, ease: 'linear' }}
          className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-[-20deg]"
        />

        {/* 3D Vector Drawing Animation (SVG) */}
        <div className="relative w-32 h-32 mb-8 flex items-center justify-center">
          {/* Subtle glow behind the SVG */}
          <div className="absolute inset-0 bg-gold-500/20 rounded-full blur-2xl animate-pulse" />
          
          <motion.svg
            width="120"
            height="120"
            viewBox="0 0 100 100"
            className="drop-shadow-[0_0_15px_rgba(212,175,55,0.4)]"
          >
            {/* Outer Hexagon */}
            <motion.path
              d="M50 5 L93 25 L93 75 L50 95 L7 75 L7 25 Z"
              fill="transparent"
              strokeWidth="2"
              stroke="#D4AF37"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
            />
            {/* Inner Star/Cube illusion */}
            <motion.path
              d="M50 5 L50 50 L93 75 M50 50 L7 75 M50 50 L7 25 M50 50 L93 25"
              fill="transparent"
              strokeWidth="1.5"
              stroke="rgba(255,255,255,0.5)"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 1.5, ease: "easeInOut", delay: 0.3 }}
            />
          </motion.svg>

          {/* Central Logo icon fading in */}
          <motion.div
            initial={{ scale: 0, opacity: 0, rotate: -180 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            transition={{ duration: 0.8, delay: 1.2, type: 'spring' }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <Command className="w-8 h-8 text-white drop-shadow-md" />
          </motion.div>
        </div>

        {/* Branding & Tagline */}
        <div className="text-center mb-10">
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="font-display text-3xl font-extrabold text-white tracking-tight mb-2"
          >
            CreativeNode
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="font-mono text-xs text-zinc-400 uppercase tracking-[0.2em] font-medium"
          >
            Professional Design + Developers.
          </motion.p>
        </div>

        {/* Progress Bar & Counter */}
        <div className="w-full space-y-3">
          <div className="flex justify-between items-end px-1">
            <span className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-gold-500 animate-ping" />
              Initializing Studio
            </span>
            <span className="font-mono text-xs text-gold-400 font-bold">{progress}%</span>
          </div>
          
          <div className="w-full h-1 bg-zinc-800/50 rounded-full overflow-hidden relative">
            <motion.div 
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-gold-600 to-gold-400"
              initial={{ width: '0%' }}
              animate={{ width: `${progress}%` }}
              transition={{ ease: 'linear', duration: 0.1 }}
            />
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
