import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';

export const LanguageSwitcher: React.FC = () => {
  const { lang, toggleLang, t } = useLanguage();

  return (
    <motion.button
      onClick={toggleLang}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      title={lang === 'en' ? 'Switch to Hindi' : 'English पर जाएं'}
      className="relative flex items-center gap-1 px-2.5 py-1 rounded-lg border border-zinc-800 bg-zinc-900/60 hover:border-gold-500/40 hover:bg-zinc-800/60 transition-all duration-200 select-none cursor-pointer overflow-hidden group"
      aria-label="Toggle language"
    >
      {/* Subtle gold glow on hover */}
      <span className="absolute inset-0 bg-gold-500/0 group-hover:bg-gold-500/5 transition-all rounded-lg" />

      {/* EN pill */}
      <span
        className={`relative font-mono text-[10px] font-bold uppercase tracking-widest transition-all duration-200 px-1.5 py-0.5 rounded ${
          lang === 'en'
            ? 'bg-gold-500 text-black shadow-sm shadow-gold-500/20'
            : 'text-zinc-500 hover:text-zinc-300'
        }`}
      >
        EN
      </span>

      {/* Divider */}
      <span className="text-zinc-700 font-mono text-[9px] select-none">|</span>

      {/* हिं pill */}
      <span
        className={`relative font-mono text-[10px] font-bold tracking-widest transition-all duration-200 px-1.5 py-0.5 rounded ${
          lang === 'hi'
            ? 'bg-gold-500 text-black shadow-sm shadow-gold-500/20'
            : 'text-zinc-500 hover:text-zinc-300'
        }`}
      >
        हिं
      </span>
    </motion.button>
  );
};
