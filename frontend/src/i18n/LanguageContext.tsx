import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language, t } from './index';

interface LanguageContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export const useLanguage = (): LanguageContextValue => {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return ctx;
};

interface LanguageProviderProps {
  children: ReactNode;
  defaultLanguage?: Language;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({
  children,
  defaultLanguage = 'en',
}) => {
  const [language, setLanguage] = useState<Language>(() => {
    const stored = sessionStorage.getItem('krishiconnect-language');
    if (stored && (stored === 'en' || stored === 'hi' || stored === 'kn' || stored === 'te')) {
      return stored;
    }
    return defaultLanguage;
  });

  useEffect(() => {
    sessionStorage.setItem('krishiconnect-language', language);
  }, [language]);

  const translate = (key: string, params?: Record<string, string | number>) => t(key, language, params);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t: translate }}>
      {children}
    </LanguageContext.Provider>
  );
};
