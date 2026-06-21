import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './en.json';
import hi from './hi.json';

const STORAGE_KEY = 'pixelmart_locale';

function getStoredLocale(): string {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'en' || stored === 'hi') return stored;
  } catch {
    // ignore
  }
  return 'en';
}

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    hi: { translation: hi },
  },
  lng: getStoredLocale(),
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

export function setAppLocale(locale: 'en' | 'hi') {
  localStorage.setItem(STORAGE_KEY, locale);
  i18n.changeLanguage(locale);
}

export default i18n;
