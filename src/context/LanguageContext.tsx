import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { translations, Lang, TranslationKey } from '../i18n/translations';

interface LanguageContextType {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: TranslationKey) => string;
  toggleLang: () => void;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: 'en',
  setLang: () => {},
  t: (key) => key,
  toggleLang: () => {},
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Lang>(() => {
    const saved = localStorage.getItem('creativenode_lang');
    return (saved === 'hi' || saved === 'en') ? saved : 'en';
  });

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    localStorage.setItem('creativenode_lang', l);
  }, []);

  const toggleLang = useCallback(() => {
    setLang(lang === 'en' ? 'hi' : 'en');
  }, [lang, setLang]);

  const t = useCallback((key: TranslationKey): string => {
    return (translations[lang] as Record<string, string>)[key] ?? (translations['en'] as Record<string, string>)[key] ?? key;
  }, [lang]);

  // Apply Hindi font class on body for better Devanagari rendering
  useEffect(() => {
    document.documentElement.setAttribute('data-lang', lang);
  }, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, toggleLang }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
