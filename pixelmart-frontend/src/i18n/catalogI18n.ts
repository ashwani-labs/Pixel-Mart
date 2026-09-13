import { useTranslation } from 'react-i18next';
import { CATALOG_HI } from './catalogHi';

export function isHindiLocale(language?: string): boolean {
  return (language ?? '').toLowerCase().startsWith('hi');
}

export function catalogLabel(name: string | null | undefined, language?: string): string {
  if (!name) return '';
  if (!isHindiLocale(language)) return name;
  return CATALOG_HI[name] ?? name;
}

export function useCatalogLabel() {
  const { i18n } = useTranslation();
  const language = i18n.language;
  return (name: string | null | undefined) => catalogLabel(name, language);
}
