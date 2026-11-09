import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language } from '../types';
import { uz } from './uz';
import { ru } from './ru';
import { en } from './en';

const translations = { uz, ru, en };

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: typeof uz;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'uz',
  setLanguage: () => {},
  t: uz,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('taklifim_language');
      if (saved === 'uz' || saved === 'ru' || saved === 'en') {
        return saved;
      }
    } catch {
      // ignore
    }
    return 'uz';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('taklifim_language', lang);
    } catch {
      // ignore
    }
  };

  const t = translations[language] || uz;

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
export { uz, ru, en, translations };
