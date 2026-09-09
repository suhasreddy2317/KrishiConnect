import en from './locales/en';
import hi from './locales/hi';
import kn from './locales/kn';
import te from './locales/te';

export type Language = 'en' | 'hi' | 'kn' | 'te';

export const languages: { code: Language; label: string; nativeName: string; speechCode: string }[] = [
  { code: 'en', label: 'English', nativeName: 'English', speechCode: 'en-IN' },
  { code: 'hi', label: 'Hindi', nativeName: 'हिन्दी', speechCode: 'hi-IN' },
  { code: 'kn', label: 'Kannada', nativeName: 'ಕನ್ನಡ', speechCode: 'kn-IN' },
  { code: 'te', label: 'Telugu', nativeName: 'తెలుగు', speechCode: 'te-IN' },
];

const translations = { en, hi, kn, te };

export type TranslationKeys = typeof en;

export const t = (key: string, lang: Language, params?: Record<string, string | number>): string => {
  const keys = key.split('.');
  let value: unknown = translations[lang];

  for (const k of keys) {
    if (value && typeof value === 'object' && k in (value as Record<string, unknown>)) {
      value = (value as Record<string, unknown>)[k];
    } else {
      value = translations.en;
      for (const k2 of keys) {
        if (value && typeof value === 'object' && k2 in (value as Record<string, unknown>)) {
          value = (value as Record<string, unknown>)[k2];
        } else {
          return key;
        }
      }
      return typeof value === 'string' ? value : key;
    }
  }

  if (typeof value !== 'string') return key;

  if (params) {
    return value.replace(/\{(\w+)\}/g, (_, match) => {
      if (match in params) return String(params[match]);
      return `{${match}}`;
    });
  }

  return value;
};
