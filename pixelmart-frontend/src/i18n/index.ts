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

function applyDocumentLang(locale: string) {
  if (typeof document === 'undefined') return;
  document.documentElement.lang = locale === 'hi' ? 'hi' : 'en';
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

applyDocumentLang(i18n.language);

i18n.on('languageChanged', (lng) => {
  applyDocumentLang(lng);
});

export function setAppLocale(locale: 'en' | 'hi') {
  localStorage.setItem(STORAGE_KEY, locale);
  void i18n.changeLanguage(locale);
}

export default i18n;
